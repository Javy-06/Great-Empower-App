-- =============================================================================
-- GREAT EMPOWER — demo accounts (Supabase Anonymous Auth + RLS + RPCs)
--
-- This is a DEMO account system, not real authentication: every account is a
-- Supabase anonymous user. Nothing here stores names verified against a real
-- identity, email, phone, or any financial-profile inputs (those stay on the
-- device).
--
-- Security model
--   * RLS is enabled on every table. Users can only SELECT their own rows.
--   * Points, the ledger, passes/benefits and the Welcome Offer can ONLY change
--     through the SECURITY DEFINER functions below, which derive the user from
--     auth.uid(), read prices and eligibility from reward_products, lock the
--     user's profile row (serialising that user's transactions) and are
--     idempotent on request_id.
--   * Low-risk progress (learning, bookings, checklist, notification reads,
--     language) is written directly by the owner, scoped by RLS.
--
-- Welcome Offer eligibility matrix (strict, enforced by a generated column):
--   food: eligible · drink: eligible · wellness: NOT eligible · game: NOT eligible
--
-- Execution
--   * ONE-TIME migration for a fresh Supabase project. It is NOT re-runnable: the
--     pre-flight check below stops it (changing nothing) if it was already applied.
--   * Everything runs in ONE transaction: any error rolls the whole file back, so
--     a failure never leaves a partial schema. Nothing existing is dropped.
--   * Prerequisites: Supabase Auth (auth.users, auth.uid()) and PostgreSQL 13+
--     (core gen_random_uuid()). No extensions are required.
-- =============================================================================

begin;

do $preflight$
begin
  if to_regclass('auth.users') is null or to_regprocedure('auth.uid()') is null then
    raise exception 'Great Empower migration: Supabase Auth (auth.users / auth.uid()) not found. Nothing was changed.';
  end if;
  if to_regnamespace('ge_private') is not null
     or to_regclass('public.reward_products') is not null or to_regclass('public.earning_rules') is not null
     or to_regclass('public.profiles') is not null or to_regclass('public.points_ledger') is not null
     or to_regclass('public.reward_items') is not null or to_regclass('public.learning_progress') is not null
     or to_regclass('public.guidance_bookings') is not null or to_regclass('public.user_app_state') is not null
     or to_regclass('public.earnable_content') is not null then
    raise exception 'Great Empower migration already applied (or objects with the same names exist). Nothing was changed.';
  end if;
end
$preflight$;

create schema ge_private;

-- -----------------------------------------------------------------------------
-- Global catalogue (shared, read-only to clients)
-- -----------------------------------------------------------------------------
create table public.reward_products (
  id               text primary key,
  brand            text not null,
  name             text not null,
  category         text not null check (category in ('food', 'drink', 'wellness', 'game')),
  price_points     integer not null check (price_points > 0),
  welcome_eligible boolean generated always as (category in ('food', 'drink')) stored,
  active           boolean not null default true
);

create table public.earning_rules (
  key          text primary key,              -- 'lesson-complete' or 'challenge:keep-learning'
  kind         text not null check (kind in ('activity', 'challenge')),
  title        text not null,
  points       integer not null check (points > 0),
  target       integer check (target is null or target > 0),
  counts_kinds text[],
  check ((kind = 'challenge') = (target is not null and counts_kinds is not null))
);

-- Content that can earn points, per activity (mirrors the app's lesson/video/infographic
-- catalogues). earn_points only pays for these exact pairs. Server-only: no client grants.
create table public.earnable_content (
  kind       text not null references public.earning_rules (key),
  content_id text not null check (content_id ~ '^[a-z0-9-]{1,80}$'),
  primary key (kind, content_id)
);

-- -----------------------------------------------------------------------------
-- Per-account state
-- -----------------------------------------------------------------------------
create table public.profiles (
  user_id                 uuid primary key references auth.users (id) on delete cascade,
  account_type            text not null check (account_type in ('demo', 'new')),
  display_name            text check (char_length(display_name) between 1 and 40),
  language                text not null default 'en' check (language in ('en', 'ms', 'zh', 'ta')),
  -- Denormalised running total of points_ledger.points (locked + updated in the same
  -- transaction as every ledger insert) so balance checks are a single-row read.
  points_balance          integer not null default 0 check (points_balance >= 0),
  -- Explicit one-time entitlement; never inferred from points, progress or account type.
  welcome_offer_available boolean not null default true,
  welcome_offer_used_at   timestamptz,
  welcome_offer_ledger_id uuid,
  seed_version            integer,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  check (welcome_offer_available = (welcome_offer_used_at is null))
);

create table public.points_ledger (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles (user_id) on delete cascade,
  request_id      text not null check (char_length(request_id) between 1 and 120),
  kind            text not null check (kind in ('seed', 'earn', 'challenge', 'redeem', 'pass_used')),
  points          integer not null,
  earn_key        text,
  product_id      text references public.reward_products (id),
  redemption_mode text check (redemption_mode in ('standard', 'welcome_offer')),
  list_price      integer,
  charged_price   integer,
  title           text not null,
  detail          text,
  created_at      timestamptz not null default now(),
  unique (user_id, request_id),
  check ((kind = 'redeem') = (redemption_mode is not null)),
  check (kind <> 'redeem' or (product_id is not null and list_price is not null
                              and charged_price is not null and points = -charged_price))
);
create unique index points_ledger_earn_key_once
  on public.points_ledger (user_id, earn_key) where earn_key is not null;
create index points_ledger_user_recent on public.points_ledger (user_id, created_at desc);

create table public.reward_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (user_id) on delete cascade,
  ledger_id  uuid not null unique references public.points_ledger (id) on delete cascade,
  product_id text not null references public.reward_products (id),
  item_type  text not null check (item_type in ('pass', 'benefit')),
  code       text,
  status     text not null check (status in ('ready', 'used', 'stored')),
  issued_at  timestamptz not null default now(),
  used_at    timestamptz,
  check ((item_type = 'pass' and code is not null and status in ('ready', 'used'))
      or (item_type = 'benefit' and status = 'stored'))
);
create index reward_items_user on public.reward_items (user_id);

create table public.learning_progress (
  user_id      uuid not null references public.profiles (user_id) on delete cascade,
  content_id   text not null check (content_id ~ '^[a-z0-9-]{1,80}$'),
  bookmarked   boolean not null default false,
  started_at   timestamptz,
  completed_at timestamptz,
  updated_at   timestamptz not null default now(),
  primary key (user_id, content_id)
);

-- Fictional guidance-session bookings. No personal name is stored.
create table public.guidance_bookings (
  user_id       uuid not null references public.profiles (user_id) on delete cascade,
  id            text not null check (char_length(id) between 1 and 64),
  ref           text not null check (char_length(ref) <= 16),
  topic         text not null check (char_length(topic) <= 80),
  format        text not null check (format in ('online', 'in-person')),
  area          text check (char_length(area) <= 40),
  session_date  date not null,
  session_time  text not null check (session_time ~ '^\d{2}:\d{2}$'),
  advisor_id    text check (char_length(advisor_id) <= 40),
  advisor_label text not null check (char_length(advisor_label) <= 60),
  status        text not null check (status in ('booked', 'cancelled')),
  created_at    timestamptz not null default now(),
  primary key (user_id, id)
);

create table public.user_app_state (
  user_id            uuid primary key references public.profiles (user_id) on delete cascade,
  guide_checklist    text[] not null default '{}' check (cardinality(guide_checklist) <= 100),
  notifications_read text[] not null default '{}' check (cardinality(notifications_read) <= 200),
  game_state         jsonb, -- reserved for a future game integration; unused, not client-writable
  updated_at         timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Privileges + Row Level Security
-- -----------------------------------------------------------------------------
revoke all on public.reward_products, public.earning_rules, public.profiles, public.points_ledger,
  public.reward_items, public.learning_progress, public.guidance_bookings, public.user_app_state,
  public.earnable_content
  from public, anon, authenticated;

grant select on public.reward_products, public.earning_rules to authenticated;
grant select on public.profiles, public.points_ledger, public.reward_items to authenticated;
grant update (language, display_name) on public.profiles to authenticated;
grant select, insert, update, delete on public.learning_progress to authenticated;
grant select, insert, update on public.guidance_bookings to authenticated;
-- user_app_state: clients may write only these two columns. game_state is reserved and is
-- not client-writable (a future server-side function would own it).
grant select on public.user_app_state to authenticated;
grant insert (user_id, guide_checklist, notifications_read) on public.user_app_state to authenticated;
-- user_id is included because upserts (INSERT … ON CONFLICT DO UPDATE) also set the conflict
-- key; RLS `with check (user_id = auth.uid())` still prevents moving a row to another user.
grant update (user_id, guide_checklist, notifications_read) on public.user_app_state to authenticated;

alter table public.reward_products   enable row level security;
alter table public.earning_rules     enable row level security;
alter table public.profiles          enable row level security;
alter table public.points_ledger     enable row level security;
alter table public.reward_items      enable row level security;
alter table public.learning_progress enable row level security;
alter table public.guidance_bookings enable row level security;
alter table public.user_app_state    enable row level security;
alter table public.earnable_content  enable row level security; -- no policies: RPC-only

create policy "catalogue is readable" on public.reward_products
  for select to authenticated using (active);
create policy "earning rules are readable" on public.earning_rules
  for select to authenticated using (true);

create policy "own profile: read" on public.profiles
  for select to authenticated using (user_id = (select auth.uid()));
create policy "own profile: update name/language" on public.profiles
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "own ledger: read" on public.points_ledger
  for select to authenticated using (user_id = (select auth.uid()));
create policy "own reward items: read" on public.reward_items
  for select to authenticated using (user_id = (select auth.uid()));

create policy "own learning: all" on public.learning_progress
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own bookings: read" on public.guidance_bookings
  for select to authenticated using (user_id = (select auth.uid()));
create policy "own bookings: insert" on public.guidance_bookings
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "own bookings: update" on public.guidance_bookings
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own app state: read" on public.user_app_state
  for select to authenticated using (user_id = (select auth.uid()));
create policy "own app state: insert" on public.user_app_state
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "own app state: update" on public.user_app_state
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- Internal helpers (schema not exposed through the API)
-- -----------------------------------------------------------------------------
create function ge_private.fail(p_code text, p_message text)
returns jsonb language sql immutable set search_path = '' as $$
  select jsonb_build_object('ok', false, 'code', p_code, 'error', p_message);
$$;

create function ge_private.require_uid()
returns uuid language plpgsql stable set search_path = '' as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  return v_uid;
end $$;

-- Random, non-personal pass token, e.g. GE-7K3F-92QD (8 symbols × 5 bits = 40 bits).
-- Randomness: core gen_random_uuid() (PostgreSQL 13+) draws from pg_strong_random(), the
-- server's cryptographically secure generator — no pgcrypto/extension schema dependency.
-- Only fully random UUID bytes are used (bytes 6 and 8 carry version/variant bits), and
-- byte % 32 is unbiased because 256 is a multiple of 32.
create function ge_private.pass_code()
returns text language plpgsql volatile set search_path = '' as $$
declare
  v_alphabet constant text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  v_bytes bytea := uuid_send(gen_random_uuid());
  v_pick constant int[] := array[0, 1, 2, 3, 4, 5, 10, 11];
  v_out text := '';
  i int;
begin
  foreach i in array v_pick loop
    v_out := v_out || substr(v_alphabet, 1 + (get_byte(v_bytes, i) % 32), 1);
  end loop;
  return 'GE-' || substr(v_out, 1, 4) || '-' || substr(v_out, 5, 4);
end $$;

-- Creates the profile and its initial state. Returns false if the profile already
-- existed (idempotent; concurrent calls cannot create duplicates or partial seeds).
create function ge_private.seed_account(p_uid uuid, p_type text, p_display_name text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_inserted int;
begin
  insert into public.profiles (user_id, account_type, display_name, seed_version)
  values (p_uid, p_type, nullif(btrim(p_display_name), ''), case when p_type = 'demo' then 1 end)
  on conflict (user_id) do nothing;
  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return false;
  end if;

  insert into public.user_app_state (user_id) values (p_uid);

  if p_type = 'demo' then
    -- Approved demo seed: 2,290 + 50 + 50 + 40 + 20 = 2,450 points.
    -- Staggered timestamps keep the history in a stable, readable order.
    insert into public.points_ledger (user_id, request_id, kind, points, earn_key, title, detail, created_at) values
      (p_uid, 'seed:demo-balance', 'seed', 2290, null, 'Demo starting balance', 'Preloaded for the demo account', now() - interval '10 minutes'),
      (p_uid, 'earn:lesson-complete:money-talks', 'earn', 50, 'lesson-complete:money-talks', 'Completed a lesson', null, now() - interval '4 minutes'),
      (p_uid, 'earn:lesson-complete:emergency-fund', 'earn', 50, 'lesson-complete:emergency-fund', 'Completed a lesson', null, now() - interval '3 minutes'),
      (p_uid, 'earn:video-finished:what-is-insurance', 'earn', 40, 'video-finished:what-is-insurance', 'Watched a video lesson', null, now() - interval '2 minutes'),
      (p_uid, 'earn:infographic-viewed:insurance-safety-net', 'earn', 20, 'infographic-viewed:insurance-safety-net', 'Studied an infographic', null, now() - interval '1 minute');
    update public.profiles
      set points_balance = (select sum(points) from public.points_ledger where user_id = p_uid)
      where user_id = p_uid;

    insert into public.learning_progress (user_id, content_id, bookmarked, started_at, completed_at) values
      (p_uid, 'money-talks', false, now(), now()),
      (p_uid, 'emergency-fund', false, now(), now()),
      (p_uid, 'what-is-insurance', false, now(), now()),
      (p_uid, 'insurance-safety-net', false, now(), now()),
      (p_uid, 'medical-cards', true, null, null);

    insert into public.guidance_bookings
      (user_id, id, ref, topic, format, area, session_date, session_time, advisor_id, advisor_label, status)
    values
      (p_uid, 'demo-booking-1', 'GS-DEMO', 'Understand medical protection', 'online', null,
       (current_date + 3), '10:00', 'farah', 'Farah Nadia', 'booked');
  end if;
  return true;
end $$;

-- -----------------------------------------------------------------------------
-- Public RPCs (callable by signed-in users only)
-- -----------------------------------------------------------------------------
create function public.init_account(p_type text, p_display_name text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := ge_private.require_uid();
  v_profile public.profiles;
  v_created boolean;
begin
  if p_type is null or p_type not in ('demo', 'new') then
    return ge_private.fail('invalid_type', 'Unknown account type.');
  end if;
  if p_display_name is not null and char_length(btrim(p_display_name)) > 40 then
    return ge_private.fail('invalid_name', 'Names can be up to 40 characters.');
  end if;
  v_created := ge_private.seed_account(
    v_uid, p_type, coalesce(p_display_name, case when p_type = 'demo' then 'Aisyah' end));
  select * into v_profile from public.profiles where user_id = v_uid;
  return jsonb_build_object('ok', true, 'created', v_created,
    'account_type', v_profile.account_type, 'points_balance', v_profile.points_balance);
end $$;

-- Rebuilds ONLY a demo account's seed. Requires explicit user action in the UI.
create function public.reset_demo()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := ge_private.require_uid();
  v_profile public.profiles;
begin
  select * into v_profile from public.profiles where user_id = v_uid for update;
  if not found then
    return ge_private.fail('no_account', 'This account has not been set up.');
  end if;
  if v_profile.account_type <> 'demo' then
    return ge_private.fail('not_demo', 'Only the demo account can be reset.');
  end if;
  delete from public.profiles where user_id = v_uid; -- cascades to every per-account table
  perform ge_private.seed_account(v_uid, 'demo', 'Aisyah');
  return jsonb_build_object('ok', true, 'points_balance',
    (select points_balance from public.profiles where user_id = v_uid));
end $$;

create function public.earn_points(p_kind text, p_subject text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := ge_private.require_uid();
  v_rule public.earning_rules;
  v_key text;
  v_balance integer;
  v_ledger uuid;
begin
  if p_subject is null or p_subject !~ '^[a-z0-9-]{1,80}$' then
    return ge_private.fail('invalid_subject', 'Unknown activity.');
  end if;
  select * into v_rule from public.earning_rules where key = p_kind and kind = 'activity';
  if not found then
    return ge_private.fail('unknown_activity', 'Unknown activity.');
  end if;
  if not exists (select 1 from public.earnable_content where kind = p_kind and content_id = p_subject) then
    return ge_private.fail('unknown_content', 'This activity does not earn points.');
  end if;
  perform 1 from public.profiles where user_id = v_uid for update;
  if not found then
    return ge_private.fail('no_account', 'This account has not been set up.');
  end if;
  v_key := p_kind || ':' || p_subject;
  if exists (select 1 from public.points_ledger where user_id = v_uid and earn_key = v_key) then
    return ge_private.fail('already_earned', 'Already rewarded for this activity.');
  end if;
  insert into public.points_ledger (user_id, request_id, kind, points, earn_key, title)
  values (v_uid, 'earn:' || v_key, 'earn', v_rule.points, v_key, v_rule.title)
  returning id into v_ledger;
  update public.profiles set points_balance = points_balance + v_rule.points, updated_at = now()
  where user_id = v_uid returning points_balance into v_balance;
  return jsonb_build_object('ok', true, 'ledger_id', v_ledger, 'points', v_rule.points, 'points_balance', v_balance);
end $$;

create function public.claim_challenge(p_challenge_id text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := ge_private.require_uid();
  v_rule public.earning_rules;
  v_key text := 'challenge:' || coalesce(p_challenge_id, '');
  v_done integer;
  v_balance integer;
  v_ledger uuid;
begin
  select * into v_rule from public.earning_rules where key = v_key and kind = 'challenge';
  if not found then
    return ge_private.fail('unknown_challenge', 'Unknown challenge.');
  end if;
  perform 1 from public.profiles where user_id = v_uid for update;
  if not found then
    return ge_private.fail('no_account', 'This account has not been set up.');
  end if;
  if exists (select 1 from public.points_ledger where user_id = v_uid and earn_key = v_key) then
    return ge_private.fail('already_claimed', 'This challenge bonus was already claimed.');
  end if;
  select count(*) into v_done from public.points_ledger
  where user_id = v_uid and kind = 'earn' and split_part(earn_key, ':', 1) = any (v_rule.counts_kinds);
  if v_done < v_rule.target then
    return ge_private.fail('not_complete', 'Finish the challenge before claiming.');
  end if;
  insert into public.points_ledger (user_id, request_id, kind, points, earn_key, title)
  values (v_uid, v_key, 'challenge', v_rule.points, v_key, 'Challenge complete: ' || v_rule.title)
  returning id into v_ledger;
  update public.profiles set points_balance = points_balance + v_rule.points, updated_at = now()
  where user_id = v_uid returning points_balance into v_balance;
  return jsonb_build_object('ok', true, 'ledger_id', v_ledger, 'points', v_rule.points, 'points_balance', v_balance);
end $$;

-- Redeem a catalogue item. Price and eligibility come ONLY from reward_products.
-- Idempotent on (user, request_id): a retry returns the original result, never a 2nd charge.
create function public.redeem_reward(p_product_id text, p_mode text, p_request_id text)
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
begin
  if p_mode is null or p_mode not in ('standard', 'welcome_offer') then
    return ge_private.fail('invalid_mode', 'Unknown redemption type.');
  end if;
  -- Own namespace ('redeem-…') so a client id can never collide with internal ledger ids
  -- such as 'seed:…', 'earn:…', 'challenge:…' or 'pass-used:…'.
  if p_request_id is null or p_request_id !~ '^redeem-[A-Za-z0-9-]{1,113}$' then
    return ge_private.fail('invalid_request', 'Invalid request.');
  end if;

  -- Serialises every points operation for this user (double taps, parallel tabs).
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
    -- Same request id for a different product, mode or operation: refuse, change nothing.
    return ge_private.fail('request_reused', 'This request was already used for something else.');
  end if;

  select * into v_product from public.reward_products where id = p_product_id;
  if not found or not v_product.active then
    return ge_private.fail('unavailable', 'This item is not available.');
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

  insert into public.reward_items (user_id, ledger_id, product_id, item_type, code, status)
  values (v_uid, v_ledger, v_product.id,
          case when v_product.category = 'game' then 'benefit' else 'pass' end,
          case when v_product.category = 'game' then null else ge_private.pass_code() end,
          case when v_product.category = 'game' then 'stored' else 'ready' end)
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

-- Explicit "I used this pass". Exactly once; points never change.
create function public.confirm_pass_used(p_item_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := ge_private.require_uid();
  v_item public.reward_items;
  v_name text;
begin
  perform 1 from public.profiles where user_id = v_uid for update;
  if not found then
    return ge_private.fail('no_account', 'This account has not been set up.');
  end if;
  select * into v_item from public.reward_items where id = p_item_id and user_id = v_uid for update;
  if not found or v_item.item_type <> 'pass' then
    return ge_private.fail('not_found', 'This pass was not found.');
  end if;
  if v_item.status = 'used' then
    return ge_private.fail('already_used', 'This pass was already marked as used.');
  end if;
  update public.reward_items set status = 'used', used_at = now() where id = v_item.id;
  select name into v_name from public.reward_products where id = v_item.product_id;
  insert into public.points_ledger (user_id, request_id, kind, points, product_id, title, detail)
  values (v_uid, 'pass-used:' || v_item.id, 'pass_used', 0, v_item.product_id, 'Pass used', v_name);
  return jsonb_build_object('ok', true, 'item_id', v_item.id);
end $$;

-- Function privileges: nothing for anon/public; RPCs for signed-in (anonymous) users only.
revoke all on schema ge_private from public, anon, authenticated;
revoke execute on all functions in schema ge_private from public, anon, authenticated;
revoke execute on function
  public.init_account(text, text), public.reset_demo(), public.earn_points(text, text),
  public.claim_challenge(text), public.redeem_reward(text, text, text), public.confirm_pass_used(uuid)
  from public, anon;
grant execute on function
  public.init_account(text, text), public.reset_demo(), public.earn_points(text, text),
  public.claim_challenge(text), public.redeem_reward(text, text, text), public.confirm_pass_used(uuid)
  to authenticated;

-- -----------------------------------------------------------------------------
-- Catalogue + earning rules (mirror src/rewards/catalogue.ts; prices unchanged)
-- -----------------------------------------------------------------------------
insert into public.reward_products (id, brand, name, category, price_points) values
  ('tub-chicken-wholemeal',  'tubway',    'Chicken Wholemeal Sandwich', 'food',     1200),
  ('tub-chicken-wrap',       'tubway',    'Grilled Chicken Wrap',       'food',     1300),
  ('tub-tuna-wholemeal',     'tubway',    'Tuna Wholemeal Sandwich',    'food',     1200),
  ('tub-chicken-salad',      'tubway',    'Healthy Chicken Salad',      'food',     1400),
  ('grb-chicken-bowl',       'greenbowl', 'Grilled Chicken Bowl',       'food',     1600),
  ('grb-salmon-bowl',        'greenbowl', 'Salmon Bowl',                'food',     1900),
  ('grb-veggie-bowl',        'greenbowl', 'Veggie Bowl',                'food',     1500),
  ('frf-smoothie',           'fruitfuel', 'Fresh Fruit Smoothie',       'drink',    1100),
  ('frf-orange-juice',       'fruitfuel', 'Fresh Orange Juice',         'drink',    1000),
  ('frf-infused-water',      'fruitfuel', 'Low-Sugar Infused Water',    'drink',    1000),
  ('crp-wellness-pack',      'careplus',  'Wellness Pack',              'wellness', 2400),
  ('crp-basic-health-kit',   'careplus',  'Basic Health Kit',           'wellness', 2000),
  ('crp-health-check-kit',   'careplus',  'Health Check Kit',           'wellness', 2800),
  ('shd-medical-protection', 'shieldora', 'Medical Protection',         'game',     3000),
  ('shd-protection-upgrade', 'shieldora', 'Protection Upgrade',         'game',     4500),
  ('nst-emergency-boost',    'nestora',   'Emergency Fund Boost',       'game',     2500),
  ('nst-savings-bonus',      'nestora',   'Savings Bonus',              'game',     2000);

insert into public.earning_rules (key, kind, title, points, target, counts_kinds) values
  ('lesson-complete',    'activity', 'Completed a lesson',                50, null, null),
  ('video-finished',     'activity', 'Watched a video lesson',            40, null, null),
  ('infographic-viewed', 'activity', 'Studied an infographic',            20, null, null),
  ('profile-complete',   'activity', 'Completed your protection profile', 100, null, null),
  ('challenge:keep-learning',      'challenge', 'Keep Learning',      150, 3, array['lesson-complete', 'video-finished']),
  ('challenge:visual-learner',     'challenge', 'Visual Learner',      80, 3, array['infographic-viewed']),
  ('challenge:know-your-coverage', 'challenge', 'Know Your Coverage', 200, 1, array['profile-complete']);

-- Mirrors src/data/demo-courses.ts (lessons) and src/data/learn-media.ts (videos, infographics).
insert into public.earnable_content (kind, content_id) values
  ('lesson-complete', 'money-talks'),
  ('lesson-complete', 'medical-cards'),
  ('lesson-complete', 'emergency-fund'),
  ('lesson-complete', 'hospital-bills'),
  ('lesson-complete', 'income-replacement'),
  ('lesson-complete', 'first-salary'),
  ('lesson-complete', 'deductibles'),
  ('video-finished', 'what-is-insurance'),
  ('video-finished', 'how-insurance-works-in-malaysia'),
  ('video-finished', 'risk-pooling-powers-insurance'),
  ('video-finished', 'life-insurance-risk-pooling'),
  ('infographic-viewed', 'insurance-safety-net'),
  ('infographic-viewed', 'medical-insurance-malaysia'),
  ('infographic-viewed', 'life-insurance-malaysia'),
  ('infographic-viewed', 'critical-illness-malaysia'),
  ('infographic-viewed', 'personal-accident-malaysia'),
  ('profile-complete', 'profile');

commit;
