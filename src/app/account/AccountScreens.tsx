import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Cloud, HardDrive, Info, Loader2, LogOut, RotateCcw, Sparkles, UserPlus, Users, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/cn";
import { cloudConfigured } from "@/account/config";
import { accountLabel, useRegistry, type DeviceAccount } from "@/account/registry";
import {
  createNewAccount,
  dismissError,
  openAccount,
  resetDemo,
  signOut,
  startDemo,
  useSession,
} from "@/account/session";
import { useSyncStatus } from "@/account/syncStatus";

const initials = (a: DeviceAccount) =>
  a.type === "legacy" ? "EP" : (a.displayName?.trim()[0] ?? (a.type === "demo" ? "D" : "N")).toUpperCase();

const modeText = (a: DeviceAccount) => (a.mode === "cloud" ? "Saved to the cloud · this browser" : "Saved in this browser only");

const DEMO_NOTE =
  "This is a demo account experience, not a real sign-in. No email, password or personal details are needed. Accounts are kept in this browser on this device and can't be recovered on another device.";

type LastAction = { kind: "demo" } | { kind: "new"; name?: string } | { kind: "open"; id: string };

/** Shown whenever no account is active: choose Demo, create a new account, or reopen one. */
export function WelcomeScreen() {
  const session = useSession();
  const { accounts } = useRegistry();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [last, setLast] = useState<LastAction | null>(null);
  const busy = session.kind === "loading";
  const demoExists = accounts.some((a) => a.type === "demo" && a.mode === (cloudConfigured ? "cloud" : "local"));
  const sorted = [...accounts].sort((a, b) => b.lastUsedAt - a.lastUsedAt);

  const run = (action: LastAction, mode?: "cloud" | "local") => {
    setLast(action);
    if (action.kind === "demo") void startDemo(mode);
    else if (action.kind === "new") void createNewAccount(action.name, mode);
    else void openAccount(action.id);
  };

  return (
    <div className="min-h-screen bg-canvas">
      <div className="ge-pagehero relative isolate overflow-hidden pb-24 pt-[calc(env(safe-area-inset-top)+1.25rem)] text-white">
        <div className="ge-pagehero-fade pointer-events-none absolute inset-x-0 bottom-0 -z-[5]" aria-hidden />
        <div className="mx-auto max-w-[30rem] px-5">
          <Logo tone="white" className="w-[132px]" />
          <p className="mt-8 text-overline uppercase tracking-[0.22em] text-teal-200">Demo accounts</p>
          <h1 className="mt-2 font-brand text-[2.5rem] font-semibold leading-[1.02]">Welcome to Great Empower.</h1>
          <p className="mt-2 text-body-sm text-white/80">Empowering You to Protect Your Tomorrow.</p>
        </div>
      </div>

      <main className="relative mx-auto -mt-14 grid max-w-[30rem] gap-3 px-5 pb-10" aria-busy={busy}>
        {session.kind === "loading" && (
          <p role="status" className="flex items-center gap-2 rounded-2xl bg-surface p-4 text-body-sm font-semibold text-navy-950 shadow-e2 ring-1 ring-ink/[0.06]">
            <Loader2 size={18} className="animate-spin text-teal-700" aria-hidden /> {session.message}
          </p>
        )}

        {session.kind === "error" && (
          <div role="alert" className="rounded-2xl bg-error-50 p-4 text-body-sm text-error-700 ring-1 ring-error-700/15">
            <p className="font-semibold">{session.message}</p>
            <p className="mt-1">{session.canUseDevice ? "Nothing was saved to the cloud." : "Your saved data hasn't changed."}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {last && (
                <button type="button" onClick={() => run(last)} className="inline-flex h-10 items-center rounded-full bg-error-700 px-4 text-caption font-bold text-white">
                  Try again
                </button>
              )}
              {last && last.kind !== "open" && session.canUseDevice && (
                <button type="button" onClick={() => run(last, "local")} className="inline-flex h-10 items-center rounded-full bg-white px-4 text-caption font-bold text-error-700 ring-1 ring-error-700/30">
                  Continue in this browser only
                </button>
              )}
              <button type="button" onClick={dismissError} className="inline-flex h-10 items-center rounded-full px-3 text-caption font-semibold underline">
                Dismiss
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={() => run({ kind: "demo" })}
          className="group flex w-full items-center gap-4 rounded-2xl bg-surface p-4 text-left shadow-e2 ring-1 ring-ink/[0.06] transition hover:ring-navy-900/30 disabled:opacity-60"
        >
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-crimson-50 text-crimson-600">
            <Sparkles size={22} aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-body font-semibold text-navy-950">{demoExists ? "Continue the Demo Account" : "Demo Account"}</span>
            <span className="block text-caption text-ink-secondary">
              {demoExists
                ? "Reopen the demo with its saved progress in this browser."
                : "Sample progress and 2,450 points to explore every feature. The Welcome Offer is still available."}
            </span>
          </span>
          <ArrowRight size={20} className="shrink-0 text-navy-900 transition-transform group-hover:translate-x-1" aria-hidden />
        </button>

        <div className="rounded-2xl bg-surface shadow-e2 ring-1 ring-ink/[0.06]">
          <button
            type="button"
            disabled={busy}
            aria-expanded={creating}
            onClick={() => setCreating((v) => !v)}
            className="group flex w-full items-center gap-4 p-4 text-left disabled:opacity-60"
          >
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <UserPlus size={22} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-body font-semibold text-navy-950">Create New Account</span>
              <span className="block text-caption text-ink-secondary">Start fresh: 0 points and no activity. The Welcome Offer is available.</span>
            </span>
            <ArrowRight size={20} className={cn("shrink-0 text-navy-900 transition-transform", creating ? "rotate-90" : "group-hover:translate-x-1")} aria-hidden />
          </button>
          {creating && (
            <form
              className="grid gap-2 border-t border-ink/[0.07] p-4"
              onSubmit={(event) => {
                event.preventDefault();
                run({ kind: "new", name: name.trim() || undefined });
              }}
            >
              <label htmlFor="ge-nickname" className="text-body-sm font-semibold text-navy-950">
                Nickname <span className="font-normal text-ink-muted">(optional)</span>
              </label>
              <input id="ge-nickname" className="ge-input" maxLength={40} autoComplete="off" value={name} onChange={(e) => setName(e.target.value)} placeholder="Shown in greetings only" />
              <p className="text-caption text-ink-muted">Not verified and not your real identity. Leave it blank if you like.</p>
              <button type="submit" disabled={busy} className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-crimson-600 px-5 text-body-sm font-bold text-white hover:bg-crimson-700 disabled:opacity-60">
                Create account <ArrowRight size={18} aria-hidden />
              </button>
            </form>
          )}
        </div>

        {sorted.length > 0 && (
          <section aria-labelledby="device-accounts" className="mt-3">
            <h2 id="device-accounts" className="flex items-center gap-2 text-subheading text-navy-950">
              <Users size={18} aria-hidden /> Accounts in this browser
            </h2>
            <ul className="mt-2 grid gap-2">
              {sorted.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run({ kind: "open", id: a.id })}
                    className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-surface px-3 py-2.5 text-left ring-1 ring-ink/[0.07] hover:ring-navy-900/30 disabled:opacity-60"
                  >
                    <span className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-full text-body-sm font-bold", a.type === "demo" ? "bg-crimson-50 text-crimson-700" : "bg-navy-100 text-navy-800")} aria-hidden>
                      {initials(a)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-body-sm font-semibold text-navy-950">{accountLabel(a, accounts)}</span>
                      <span className="flex items-center gap-1 text-caption text-ink-muted">
                        {a.mode === "cloud" ? <Cloud size={12} aria-hidden /> : <HardDrive size={12} aria-hidden />} {modeText(a)}
                      </span>
                    </span>
                    <ArrowRight size={18} className="shrink-0 text-ink-muted" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-3 flex gap-2 rounded-2xl bg-navy-50 p-4 text-caption text-navy-900">
          <Info size={16} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            {DEMO_NOTE}
            {!cloudConfigured && " Cloud saving isn't set up for this build, so accounts are saved in this browser only."}
          </span>
        </p>
      </main>
    </div>
  );
}

/** Header button + account sheet: who's active, switch, reset demo, sign out of this device. */
export function AccountButton({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const session = useSession();
  const { accounts } = useRegistry();
  const sync = useSyncStatus();
  const [open, setOpen] = useState(false);
  if (session.kind !== "ready") return null;
  const a = session.account;
  const syncError = a.mode === "cloud" && sync.state === "error";
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Account: ${accountLabel(a, accounts)}${syncError ? " (some changes not saved yet)" : ""}`}
        aria-haspopup="dialog"
        className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-full"
      >
        {syncError && <span className="absolute right-1.5 top-1.5 size-2.5 rounded-full bg-gold-500 ring-2 ring-navy-950" aria-hidden />}
        <span className={cn("inline-flex size-8 items-center justify-center rounded-full text-caption font-bold", tone === "dark" ? "bg-white/15 text-white ring-1 ring-white/25" : "bg-navy-900 text-white")}>
          {initials(a)}
        </span>
      </button>
      {/* Portalled: the header is its own stacking context, so the sheet must sit above the nav. */}
      {open && createPortal(<AccountSheet account={a} label={accountLabel(a, accounts)} onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}

function AccountSheet({ account, label, onClose }: { account: DeviceAccount; label: string; onClose: () => void }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [state, setState] = useState<{ busy?: boolean; message?: string; error?: boolean }>({});
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const doReset = async () => {
    setState({ busy: true });
    try {
      await resetDemo();
      setState({ message: "The demo account was reset to its starting state." });
      setConfirmReset(false);
    } catch (e) {
      setState({ error: true, message: e instanceof Error ? e.message : "Reset failed. Nothing was changed." });
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-navy-950/50 p-3 sm:items-center" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-sheet-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[26rem] rounded-3xl bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-ink shadow-e3"
      >
        <div className="flex items-start gap-3">
          <span className={cn("inline-flex size-12 shrink-0 items-center justify-center rounded-full text-body font-bold", account.type === "demo" ? "bg-crimson-50 text-crimson-700" : "bg-navy-100 text-navy-800")} aria-hidden>
            {initials(account)}
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="account-sheet-title" className="text-subheading text-navy-950">{label}</h2>
            <p className="flex items-center gap-1 text-caption text-ink-muted">
              {account.mode === "cloud" ? <Cloud size={12} aria-hidden /> : <HardDrive size={12} aria-hidden />} {modeText(account)}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 -mt-2 inline-flex size-11 items-center justify-center rounded-full text-ink-muted hover:bg-sunken">
            <X size={20} aria-hidden />
          </button>
        </div>

        <p className="mt-3 text-caption text-ink-secondary">Demo account — not a verified identity. It can only be reopened in this browser.</p>
        {account.mode === "cloud" && <SyncLine />}

        {state.message && (
          <p role={state.error ? "alert" : "status"} className={cn("mt-3 rounded-xl px-3 py-2 text-body-sm font-semibold", state.error ? "bg-error-50 text-error-700" : "bg-success-50 text-success-700")}>
            {state.message}
          </p>
        )}

        <div className="mt-4 grid gap-2">
          {account.type === "demo" &&
            (confirmReset ? (
              <div className="rounded-2xl bg-gold-50 p-3 text-body-sm text-gold-700">
                <p className="font-semibold">Reset the demo account?</p>
                <p className="mt-1">Points, progress, passes, bookings and Analyze inputs go back to the demo's starting state. Other accounts aren't affected.</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" disabled={state.busy} onClick={doReset} className="inline-flex h-10 items-center gap-2 rounded-full bg-crimson-600 px-4 text-caption font-bold text-white disabled:opacity-60">
                    {state.busy && <Loader2 size={14} className="animate-spin" aria-hidden />} Yes, reset demo
                  </button>
                  <button type="button" disabled={state.busy} onClick={() => setConfirmReset(false)} className="inline-flex h-10 items-center rounded-full px-4 text-caption font-semibold text-navy-900 ring-1 ring-ink/15">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmReset(true)} className="flex h-12 items-center gap-3 rounded-2xl px-3 text-body-sm font-semibold text-navy-950 ring-1 ring-ink/10 hover:bg-sunken">
                <RotateCcw size={18} aria-hidden /> Reset demo…
              </button>
            ))}
          <button type="button" onClick={() => void signOut()} className="flex h-12 items-center gap-3 rounded-2xl px-3 text-body-sm font-semibold text-navy-950 ring-1 ring-ink/10 hover:bg-sunken">
            <Users size={18} aria-hidden /> Switch account
          </button>
          <button type="button" onClick={() => void signOut()} className="flex h-12 items-center gap-3 rounded-2xl bg-navy-950 px-3 text-body-sm font-semibold text-white hover:bg-navy-900">
            <LogOut size={18} aria-hidden /> Sign out of this device
          </button>
          <p className="text-caption text-ink-muted">Signing out keeps this account's data. Reopen it any time from the account list.</p>
        </div>
      </div>
    </div>
  );
}

/** Cloud save status with a manual retry (automatic retries also run in the background). */
function SyncLine() {
  const sync = useSyncStatus();
  if (sync.state === "idle") return <p className="mt-2 text-caption text-success-700">All changes are saved to the cloud.</p>;
  if (sync.state === "saving") return <p className="mt-2 text-caption text-ink-muted">Saving to the cloud…</p>;
  return (
    <div role="status" className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-gold-50 px-3 py-2 text-caption text-gold-700">
      <span>Some recent progress isn't saved to the cloud yet. It's kept in this browser and retried automatically.</span>
      <button
        type="button"
        onClick={() => void import("@/account/cloud").then((m) => m.flushSync())}
        className="inline-flex h-9 shrink-0 items-center rounded-full bg-white px-3 font-bold ring-1 ring-gold-700/30"
      >
        Retry now
      </button>
    </div>
  );
}
