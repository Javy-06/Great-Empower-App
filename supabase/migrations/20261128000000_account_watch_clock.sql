-- =============================================================================
-- GREAT EMPOWER — per-account watch clock (v4)
--
-- Applies ON TOP OF 20261127000000_rewards_learning_verification.sql (v3).
--
-- Why
--   v3 bounds credited watch time by real elapsed time PER VIDEO EDITION. A script could
--   therefore report several videos in parallel and accumulate them all at once. A person can
--   only watch one video at a time, so v4 moves the real-time allowance to ONE clock per
--   account, shared by every video:
--     allowance += seconds since the account's previous watch report (capped at 60 s)
--     credit     = min(reported seconds, allowance);  allowance -= credit
--   Total credited time across ALL videos can now never exceed the real time that passed.
--   Everything else is unchanged: the first report for an edition still only starts it
--   (credit 0), requirements, the 0–600 s range, the one-time 40 pts per video, the response
--   shape and the function signature.
--
-- Additive: one new private table, seeded from existing watch progress (so accounts that are
-- mid-video keep accruing from their last report); record_video_watch is replaced in place.
-- No table, column, row, ledger entry, balance or progress value is deleted or rewritten.
-- (video_watch_progress.allowance_seconds is kept but no longer used.)
--
-- Execution: ONE-TIME, single transaction. The pre-flight stops it (changing nothing) if v3 is
-- missing or this migration was already applied.
-- =============================================================================

begin;

do $preflight$
begin
  if to_regclass('public.video_watch_progress') is null or to_regclass('ge_private.video_requirement') is null
     or to_regprocedure('public.record_video_watch(text, text, numeric)') is null then
    raise exception 'Great Empower v4 migration: v3 migration 20261127000000_rewards_learning_verification.sql not found. Nothing was changed.';
  end if;
  if to_regclass('ge_private.video_watch_clock') is not null then
    raise exception 'Great Empower v4 migration already applied (ge_private.video_watch_clock exists). Nothing was changed.';
  end if;
end
$preflight$;

-- -----------------------------------------------------------------------------
-- One real-time clock per account (server-only)
-- -----------------------------------------------------------------------------
create table ge_private.video_watch_clock (
  user_id           uuid primary key references public.profiles (user_id) on delete cascade,
  allowance_seconds numeric not null default 0 check (allowance_seconds >= 0 and allowance_seconds <= 60),
  last_report_at    timestamptz not null
);
revoke all on ge_private.video_watch_clock from public, anon, authenticated;

-- Accounts already watching keep accruing from their latest report (allowance starts at 0).
insert into ge_private.video_watch_clock (user_id, allowance_seconds, last_report_at)
select user_id, 0, max(last_report_at)
  from public.video_watch_progress
 group by user_id;

-- -----------------------------------------------------------------------------
-- record_video_watch: same contract as v3; allowance now comes from the account clock.
-- -----------------------------------------------------------------------------
create or replace function public.record_video_watch(p_video_id text, p_lang text, p_seconds numeric)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  c_allowance_cap constant numeric := 60;
  v_uid uuid := ge_private.require_uid();
  v_required integer;
  v_row public.video_watch_progress;
  v_clock ge_private.video_watch_clock;
  v_now timestamptz := clock_timestamp();
  v_allow numeric := 0;
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

  -- Serialises every report of this account (same lock as all other point-moving RPCs).
  perform 1 from public.profiles where user_id = v_uid for update;
  if not found then
    return ge_private.fail('no_account', 'This account has not been set up.');
  end if;

  -- Account clock: real time since the previous report of ANY video, capped.
  select * into v_clock from ge_private.video_watch_clock where user_id = v_uid;
  if found then
    v_allow := least(c_allowance_cap,
                     v_clock.allowance_seconds + greatest(0, extract(epoch from (v_now - v_clock.last_report_at))));
  end if;

  select * into v_row from public.video_watch_progress
    where user_id = v_uid and content_id = p_video_id and lang = p_lang for update;
  if not found then
    -- First report for this edition only starts it: nothing is credited.
    insert into public.video_watch_progress (user_id, content_id, lang, watched_seconds, allowance_seconds, last_report_at, updated_at)
    values (v_uid, p_video_id, p_lang, 0, 0, v_now, v_now);
  else
    v_credit := least(p_seconds, v_allow);
    v_watched := least(v_row.watched_seconds + v_credit, 86400);
    update public.video_watch_progress
       set watched_seconds = v_watched, allowance_seconds = 0, last_report_at = v_now, updated_at = v_now
     where user_id = v_uid and content_id = p_video_id and lang = p_lang;
  end if;

  insert into ge_private.video_watch_clock as c (user_id, allowance_seconds, last_report_at)
  values (v_uid, v_allow - v_credit, v_now)
  on conflict (user_id) do update set allowance_seconds = excluded.allowance_seconds, last_report_at = excluded.last_report_at;

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

revoke execute on function public.record_video_watch(text, text, numeric) from public, anon;
grant execute on function public.record_video_watch(text, text, numeric) to authenticated;

commit;
