-- =============================================================================
-- GREAT EMPOWER — rewards economy v3 + verified learning rewards
--
-- Applies ON TOP OF 20261126000000_demo_accounts.sql. Additive: no table, column, row,
-- ledger entry, balance, redemption or learning record is deleted or rewritten.
--
-- What it changes
--   Catalogue
--     * New category 'voucher' + 4 Great Empower Vouchers (RM10 / RM25 / 5% capped RM30 / RM50)
--       held in the wallet for FUTURE insurance purchases (no purchase feature exists).
--       reward_products.max_held limits unused copies per account (1 for each voucher).
--     * CarePlus repriced: basic-health-kit 2000→3000, wellness-pack 2400→3500,
--       health-check-kit 2800→4500.
--     * Shieldora / Nestora game items retired: active = false (rows kept, so existing
--       ledger entries and stored benefits keep resolving; redeem_reward already refuses
--       inactive items).
--     * Welcome Offer unchanged: the generated welcome_eligible column stays food/drink only.
--   Learning rewards (point values unchanged)
--     * lesson-complete / infographic-viewed: paid ONLY by submit_quiz(), which grades the
--       answers against ge_private.quiz_answer_key and pays on a perfect score.
--     * video-finished: paid ONLY by record_video_watch() once the server-credited valid watch
--       time reaches the edition's requirement. Credit is bounded by real elapsed time between
--       reports (see the function comment), so seeking to the end cannot qualify.
--     * earn_points() now refuses those three kinds; profile-complete is unchanged.
--
-- Execution
--   * ONE-TIME, single transaction. The pre-flight stops it (changing nothing) if the base
--     migration is missing or this one was already applied.
-- =============================================================================

begin;

do $preflight$
begin
  if to_regclass('public.earnable_content') is null or to_regnamespace('ge_private') is null
     or to_regprocedure('public.earn_points(text, text)') is null then
    raise exception 'Great Empower v3 migration: base migration 20261126000000_demo_accounts.sql not found. Nothing was changed.';
  end if;
  if to_regclass('public.video_watch_progress') is not null or to_regclass('ge_private.quiz_answer_key') is not null
     or to_regclass('ge_private.video_requirement') is not null
     or to_regprocedure('public.submit_quiz(text, text, jsonb)') is not null then
    raise exception 'Great Empower v3 migration already applied (or objects with the same names exist). Nothing was changed.';
  end if;
end
$preflight$;

-- -----------------------------------------------------------------------------
-- Catalogue: voucher category, per-account holding limit
-- -----------------------------------------------------------------------------
alter table public.reward_products drop constraint reward_products_category_check;
alter table public.reward_products add constraint reward_products_category_check
  check (category in ('food', 'drink', 'wellness', 'voucher', 'game'));
alter table public.reward_products add column max_held integer check (max_held is null or max_held > 0);

alter table public.reward_items drop constraint reward_items_item_type_check;
alter table public.reward_items add constraint reward_items_item_type_check
  check (item_type in ('pass', 'benefit', 'voucher'));
alter table public.reward_items drop constraint reward_items_check;
alter table public.reward_items add constraint reward_items_check
  check ((item_type = 'pass' and code is not null and status in ('ready', 'used'))
      or (item_type = 'benefit' and status = 'stored')
      or (item_type = 'voucher' and code is not null and status = 'stored'));

update public.reward_products set price_points = 3000 where id = 'crp-basic-health-kit';
update public.reward_products set price_points = 3500 where id = 'crp-wellness-pack';
update public.reward_products set price_points = 4500 where id = 'crp-health-check-kit';
update public.reward_products set active = false where category = 'game';

insert into public.reward_products (id, brand, name, category, price_points, max_held) values
  ('gev-rm10',  'great-empower', 'Great Empower RM10 Voucher', 'voucher', 1000, 1),
  ('gev-rm25',  'great-empower', 'Great Empower RM25 Voucher', 'voucher', 2500, 1),
  ('gev-5pct',  'great-empower', 'Great Empower 5% Voucher',   'voucher', 3000, 1),
  ('gev-rm50',  'great-empower', 'Great Empower RM50 Voucher', 'voucher', 5000, 1);

-- -----------------------------------------------------------------------------
-- Verification data (server-only; never readable or writable by clients)
-- -----------------------------------------------------------------------------
create table ge_private.quiz_answer_key (
  kind        text not null check (kind in ('lesson-complete', 'infographic-viewed')),
  content_id  text not null,
  question_id text not null check (question_id ~ '^q[0-9]{1,2}$'),
  answer      text not null check (answer in ('a', 'b', 'c', 'd')),
  primary key (kind, content_id, question_id),
  foreign key (kind, content_id) references public.earnable_content (kind, content_id)
);

create table ge_private.video_requirement (
  kind             text not null default 'video-finished' check (kind = 'video-finished'),
  content_id       text not null,
  lang             text not null check (lang in ('en', 'ms', 'zh', 'ta')),
  required_seconds integer not null check (required_seconds > 0),
  primary key (content_id, lang),
  foreign key (kind, content_id) references public.earnable_content (kind, content_id)
);

-- Per-account watch progress per video edition. Readable by its owner; written only by
-- record_video_watch(). allowance_seconds = real time available to credit (see below).
create table public.video_watch_progress (
  user_id           uuid not null references public.profiles (user_id) on delete cascade,
  content_id        text not null check (content_id ~ '^[a-z0-9-]{1,80}$'),
  lang              text not null check (lang in ('en', 'ms', 'zh', 'ta')),
  watched_seconds   numeric(10, 2) not null default 0 check (watched_seconds >= 0),
  allowance_seconds numeric(10, 2) not null default 0 check (allowance_seconds >= 0),
  last_report_at    timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  primary key (user_id, content_id, lang)
);

revoke all on ge_private.quiz_answer_key, ge_private.video_requirement from public, anon, authenticated;
revoke all on public.video_watch_progress from public, anon, authenticated;
grant select on public.video_watch_progress to authenticated;
alter table public.video_watch_progress enable row level security;
create policy "own watch progress: read" on public.video_watch_progress
  for select to authenticated using (user_id = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- Internal: pay an activity once. Caller must hold the profile row lock.
-- -----------------------------------------------------------------------------
create function ge_private.pay_activity(p_uid uuid, p_kind text, p_subject text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_rule public.earning_rules;
  v_key text := p_kind || ':' || p_subject;
  v_ledger uuid;
  v_balance integer;
begin
  select * into v_rule from public.earning_rules where key = p_kind and kind = 'activity';
  if not found or not exists (select 1 from public.earnable_content where kind = p_kind and content_id = p_subject) then
    return ge_private.fail('unknown_content', 'This activity does not earn points.');
  end if;
  if exists (select 1 from public.points_ledger where user_id = p_uid and earn_key = v_key) then
    return ge_private.fail('already_earned', 'Already rewarded for this activity.');
  end if;
  insert into public.points_ledger (user_id, request_id, kind, points, earn_key, title)
  values (p_uid, 'earn:' || v_key, 'earn', v_rule.points, v_key, v_rule.title)
  returning id into v_ledger;
  update public.profiles set points_balance = points_balance + v_rule.points, updated_at = now()
  where user_id = p_uid returning points_balance into v_balance;
  return jsonb_build_object('ok', true, 'ledger_id', v_ledger, 'points', v_rule.points, 'points_balance', v_balance);
end $$;

-- -----------------------------------------------------------------------------
-- earn_points: unchanged for profile-complete; verified kinds must use their own RPC.
-- -----------------------------------------------------------------------------
create or replace function public.earn_points(p_kind text, p_subject text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := ge_private.require_uid();
begin
  if p_kind in ('lesson-complete', 'infographic-viewed') then
    return ge_private.fail('quiz_required', 'Pass the quiz with a perfect score to earn these points.');
  end if;
  if p_kind = 'video-finished' then
    return ge_private.fail('watch_time_required', 'Keep watching to earn these points.');
  end if;
  if p_subject is null or p_subject !~ '^[a-z0-9-]{1,80}$' then
    return ge_private.fail('invalid_subject', 'Unknown activity.');
  end if;
  if not exists (select 1 from public.earning_rules where key = p_kind and kind = 'activity') then
    return ge_private.fail('unknown_activity', 'Unknown activity.');
  end if;
  if not exists (select 1 from public.earnable_content where kind = p_kind and content_id = p_subject) then
    return ge_private.fail('unknown_content', 'This activity does not earn points.');
  end if;
  perform 1 from public.profiles where user_id = v_uid for update;
  if not found then
    return ge_private.fail('no_account', 'This account has not been set up.');
  end if;
  return ge_private.pay_activity(v_uid, p_kind, p_subject);
end $$;

-- -----------------------------------------------------------------------------
-- submit_quiz: grade on the server; pay once, only on a perfect score.
-- p_answers = {"q1": "a", "q2": "c", ...}. Missing or unknown answers count as wrong.
-- A failed attempt changes nothing (no ledger row, no balance change) and may be retried.
-- -----------------------------------------------------------------------------
create function public.submit_quiz(p_kind text, p_content_id text, p_answers jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := ge_private.require_uid();
  v_total integer;
  v_score integer;
  v_results jsonb;
  v_already boolean;
  v_paid jsonb;
begin
  if p_kind is null or p_kind not in ('lesson-complete', 'infographic-viewed') then
    return ge_private.fail('unknown_activity', 'Unknown activity.');
  end if;
  if p_content_id is null or p_content_id !~ '^[a-z0-9-]{1,80}$' then
    return ge_private.fail('invalid_subject', 'Unknown activity.');
  end if;
  if p_answers is null or jsonb_typeof(p_answers) <> 'object' or octet_length(p_answers::text) > 2000 then
    return ge_private.fail('invalid_answers', 'Invalid answers.');
  end if;
  select count(*)::int,
         count(*) filter (where p_answers ->> question_id = answer)::int,
         coalesce(jsonb_agg(jsonb_build_object('id', question_id, 'correct', coalesce(p_answers ->> question_id = answer, false))
                            order by question_id), '[]'::jsonb)
    into v_total, v_score, v_results
    from ge_private.quiz_answer_key where kind = p_kind and content_id = p_content_id;
  if v_total = 0 then
    return ge_private.fail('unknown_content', 'This activity does not earn points.');
  end if;

  perform 1 from public.profiles where user_id = v_uid for update;
  if not found then
    return ge_private.fail('no_account', 'This account has not been set up.');
  end if;
  v_already := exists (select 1 from public.points_ledger
                       where user_id = v_uid and earn_key = p_kind || ':' || p_content_id);

  if v_score < v_total or v_already then
    return jsonb_build_object('ok', true, 'passed', v_score = v_total, 'score', v_score, 'total', v_total,
      'results', v_results, 'earned', false, 'already_earned', v_already, 'points', 0);
  end if;
  v_paid := ge_private.pay_activity(v_uid, p_kind, p_content_id);
  if not (v_paid ->> 'ok')::boolean then
    return v_paid;
  end if;
  return jsonb_build_object('ok', true, 'passed', true, 'score', v_score, 'total', v_total,
    'results', v_results, 'earned', true, 'already_earned', false,
    'ledger_id', v_paid -> 'ledger_id', 'points', v_paid -> 'points', 'points_balance', v_paid -> 'points_balance');
end $$;

-- -----------------------------------------------------------------------------
-- record_video_watch: credit valid watch time reported by the player.
--
-- The server cannot see playback, so it bounds what it accepts by REAL time:
--   allowance += seconds elapsed since this edition's previous report (capped at 60 s, so idle
--                time cannot be banked);
--   credit     = min(reported seconds, allowance);  allowance -= credit.
-- Total credited time can therefore never exceed the real time that passed between reports,
-- and the first report for an edition only starts the clock (credit 0). Seeking to the end, or
-- claiming a whole video at once, cannot qualify. When credited time reaches the edition's
-- requirement the video pays once (one-time per account across all editions).
-- -----------------------------------------------------------------------------
create function public.record_video_watch(p_video_id text, p_lang text, p_seconds numeric)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  c_allowance_cap constant numeric := 60;
  v_uid uuid := ge_private.require_uid();
  v_required integer;
  v_row public.video_watch_progress;
  v_now timestamptz := clock_timestamp();
  v_allow numeric;
  v_credit numeric := 0;
  v_watched numeric := 0;
  v_already boolean;
  v_paid jsonb;
begin
  if p_video_id is null or p_video_id !~ '^[a-z0-9-]{1,80}$' then
    return ge_private.fail('invalid_subject', 'Unknown activity.');
  end if;
  select required_seconds into v_required from ge_private.video_requirement
    where content_id = p_video_id and lang = p_lang;
  if not found then
    return ge_private.fail('unknown_content', 'This activity does not earn points.');
  end if;
  if p_seconds is null or p_seconds < 0 or p_seconds > 600 then
    return ge_private.fail('invalid_seconds', 'Invalid watch time.');
  end if;

  perform 1 from public.profiles where user_id = v_uid for update;
  if not found then
    return ge_private.fail('no_account', 'This account has not been set up.');
  end if;

  select * into v_row from public.video_watch_progress
    where user_id = v_uid and content_id = p_video_id and lang = p_lang for update;
  if not found then
    insert into public.video_watch_progress (user_id, content_id, lang, watched_seconds, allowance_seconds, last_report_at, updated_at)
    values (v_uid, p_video_id, p_lang, 0, 0, v_now, v_now);
  else
    v_allow := least(c_allowance_cap,
                     v_row.allowance_seconds + greatest(0, extract(epoch from (v_now - v_row.last_report_at))));
    v_credit := least(p_seconds, v_allow);
    v_watched := least(v_row.watched_seconds + v_credit, 86400);
    update public.video_watch_progress
       set watched_seconds = v_watched, allowance_seconds = v_allow - v_credit,
           last_report_at = v_now, updated_at = v_now
     where user_id = v_uid and content_id = p_video_id and lang = p_lang;
  end if;

  v_already := exists (select 1 from public.points_ledger
                       where user_id = v_uid and earn_key = 'video-finished:' || p_video_id);
  if v_already or v_watched < v_required then
    return jsonb_build_object('ok', true, 'watched_seconds', floor(v_watched), 'required_seconds', v_required,
      'credited', v_credit, 'earned', false, 'already_earned', v_already, 'points', 0);
  end if;
  v_paid := ge_private.pay_activity(v_uid, 'video-finished', p_video_id);
  if not (v_paid ->> 'ok')::boolean then
    return v_paid;
  end if;
  return jsonb_build_object('ok', true, 'watched_seconds', floor(v_watched), 'required_seconds', v_required,
    'credited', v_credit, 'earned', true, 'already_earned', false,
    'ledger_id', v_paid -> 'ledger_id', 'points', v_paid -> 'points', 'points_balance', v_paid -> 'points_balance');
end $$;

-- -----------------------------------------------------------------------------
-- redeem_reward: same contract as before + vouchers (stored item with a code) and the
-- per-account holding limit (reward_products.max_held).
-- -----------------------------------------------------------------------------
create or replace function public.redeem_reward(p_product_id text, p_mode text, p_request_id text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  c_welcome_price constant integer := 200;
  v_uid uuid := ge_private.require_uid();
  v_profile public.profiles;
  v_product public.reward_products;
  v_prior public.points_ledger;
  v_item public.reward_items;
  v_charge integer;
  v_ledger uuid;
  v_item_type text;
begin
  if p_mode is null or p_mode not in ('standard', 'welcome_offer') then
    return ge_private.fail('invalid_mode', 'Unknown redemption type.');
  end if;
  if p_request_id is null or p_request_id !~ '^redeem-[A-Za-z0-9-]{1,113}$' then
    return ge_private.fail('invalid_request', 'Invalid request.');
  end if;

  select * into v_profile from public.profiles where user_id = v_uid for update;
  if not found then
    return ge_private.fail('no_account', 'This account has not been set up.');
  end if;

  select * into v_prior from public.points_ledger where user_id = v_uid and request_id = p_request_id;
  if found then
    if v_prior.kind = 'redeem' and v_prior.product_id = p_product_id and v_prior.redemption_mode = p_mode then
      select * into v_item from public.reward_items where ledger_id = v_prior.id;
      return jsonb_build_object('ok', true, 'replayed', true, 'ledger_id', v_prior.id,
        'item_id', v_item.id, 'item_type', v_item.item_type, 'code', v_item.code,
        'charged', v_prior.charged_price, 'list_price', v_prior.list_price,
        'mode', v_prior.redemption_mode, 'points_balance', v_profile.points_balance);
    end if;
    return ge_private.fail('request_reused', 'This request was already used for something else.');
  end if;

  select * into v_product from public.reward_products where id = p_product_id;
  if not found or not v_product.active then
    return ge_private.fail('unavailable', 'This item is not available.');
  end if;

  if v_product.max_held is not null and
     (select count(*) from public.reward_items
       where user_id = v_uid and product_id = v_product.id and status = 'stored') >= v_product.max_held then
    return ge_private.fail('limit_reached', 'You already hold this voucher. You can hold one of each voucher at a time.');
  end if;

  if p_mode = 'welcome_offer' then
    if not v_product.welcome_eligible then
      return ge_private.fail('welcome_not_eligible', 'The Welcome Offer applies to food and drink items only.');
    end if;
    if not v_profile.welcome_offer_available then
      return ge_private.fail('welcome_used', 'Your Welcome Offer has already been used.');
    end if;
    v_charge := c_welcome_price;
  else
    v_charge := v_product.price_points;
  end if;

  if v_profile.points_balance < v_charge then
    return ge_private.fail('insufficient_points',
      'You need ' || (v_charge - v_profile.points_balance) || ' more points.');
  end if;

  insert into public.points_ledger
    (user_id, request_id, kind, points, product_id, redemption_mode, list_price, charged_price, title, detail)
  values
    (v_uid, p_request_id, 'redeem', -v_charge, v_product.id, p_mode, v_product.price_points, v_charge,
     v_product.name,
     case when p_mode = 'welcome_offer'
          then 'Welcome offer · regular ' || to_char(v_product.price_points, 'FM999,999') || ' pts' end)
  returning id into v_ledger;

  v_item_type := case v_product.category when 'game' then 'benefit' when 'voucher' then 'voucher' else 'pass' end;
  insert into public.reward_items (user_id, ledger_id, product_id, item_type, code, status)
  values (v_uid, v_ledger, v_product.id, v_item_type,
          case when v_item_type = 'benefit' then null else ge_private.pass_code() end,
          case when v_item_type = 'pass' then 'ready' else 'stored' end)
  returning * into v_item;

  update public.profiles set
    points_balance = points_balance - v_charge,
    welcome_offer_available = case when p_mode = 'welcome_offer' then false else welcome_offer_available end,
    welcome_offer_used_at = case when p_mode = 'welcome_offer' then now() else welcome_offer_used_at end,
    welcome_offer_ledger_id = case when p_mode = 'welcome_offer' then v_ledger else welcome_offer_ledger_id end,
    updated_at = now()
  where user_id = v_uid
  returning * into v_profile;

  return jsonb_build_object('ok', true, 'replayed', false, 'ledger_id', v_ledger,
    'item_id', v_item.id, 'item_type', v_item.item_type, 'code', v_item.code,
    'charged', v_charge, 'list_price', v_product.price_points, 'mode', p_mode,
    'points_balance', v_profile.points_balance);
end $$;

-- -----------------------------------------------------------------------------
-- Function privileges (CREATE OR REPLACE keeps existing grants on earn_points/redeem_reward)
-- -----------------------------------------------------------------------------
revoke execute on all functions in schema ge_private from public, anon, authenticated;
revoke execute on function
  public.submit_quiz(text, text, jsonb), public.record_video_watch(text, text, numeric)
  from public, anon;
grant execute on function
  public.submit_quiz(text, text, jsonb), public.record_video_watch(text, text, numeric)
  to authenticated;

-- -----------------------------------------------------------------------------
-- Verification data (mirrors src/data/quizzes.ts and src/rewards/verification.ts)
-- -----------------------------------------------------------------------------
insert into ge_private.quiz_answer_key (kind, content_id, question_id, answer) values
  ('lesson-complete', 'money-talks', 'q1', 'a'),
  ('lesson-complete', 'money-talks', 'q2', 'c'),
  ('lesson-complete', 'money-talks', 'q3', 'b'),
  ('lesson-complete', 'medical-cards', 'q1', 'a'),
  ('lesson-complete', 'medical-cards', 'q2', 'd'),
  ('lesson-complete', 'medical-cards', 'q3', 'b'),
  ('lesson-complete', 'emergency-fund', 'q1', 'a'),
  ('lesson-complete', 'emergency-fund', 'q2', 'b'),
  ('lesson-complete', 'emergency-fund', 'q3', 'c'),
  ('lesson-complete', 'hospital-bills', 'q1', 'a'),
  ('lesson-complete', 'hospital-bills', 'q2', 'c'),
  ('lesson-complete', 'hospital-bills', 'q3', 'd'),
  ('lesson-complete', 'income-replacement', 'q1', 'b'),
  ('lesson-complete', 'income-replacement', 'q2', 'a'),
  ('lesson-complete', 'income-replacement', 'q3', 'd'),
  ('lesson-complete', 'first-salary', 'q1', 'b'),
  ('lesson-complete', 'first-salary', 'q2', 'c'),
  ('lesson-complete', 'first-salary', 'q3', 'd'),
  ('lesson-complete', 'deductibles', 'q1', 'a'),
  ('lesson-complete', 'deductibles', 'q2', 'b'),
  ('lesson-complete', 'deductibles', 'q3', 'c'),
  ('infographic-viewed', 'insurance-safety-net', 'q1', 'b'),
  ('infographic-viewed', 'insurance-safety-net', 'q2', 'c'),
  ('infographic-viewed', 'insurance-safety-net', 'q3', 'a'),
  ('infographic-viewed', 'medical-insurance-malaysia', 'q1', 'c'),
  ('infographic-viewed', 'medical-insurance-malaysia', 'q2', 'b'),
  ('infographic-viewed', 'medical-insurance-malaysia', 'q3', 'a'),
  ('infographic-viewed', 'life-insurance-malaysia', 'q1', 'd'),
  ('infographic-viewed', 'life-insurance-malaysia', 'q2', 'b'),
  ('infographic-viewed', 'life-insurance-malaysia', 'q3', 'c'),
  ('infographic-viewed', 'critical-illness-malaysia', 'q1', 'b'),
  ('infographic-viewed', 'critical-illness-malaysia', 'q2', 'b'),
  ('infographic-viewed', 'critical-illness-malaysia', 'q3', 'd'),
  ('infographic-viewed', 'personal-accident-malaysia', 'q1', 'a'),
  ('infographic-viewed', 'personal-accident-malaysia', 'q2', 'c'),
  ('infographic-viewed', 'personal-accident-malaysia', 'q3', 'd');

insert into ge_private.video_requirement (content_id, lang, required_seconds) values
  ('what-is-insurance', 'en', 479),
  ('what-is-insurance', 'ms', 471),
  ('what-is-insurance', 'zh', 574),
  ('what-is-insurance', 'ta', 340),
  ('how-insurance-works-in-malaysia', 'en', 86),
  ('risk-pooling-powers-insurance', 'en', 84),
  ('life-insurance-risk-pooling', 'en', 89);

commit;
