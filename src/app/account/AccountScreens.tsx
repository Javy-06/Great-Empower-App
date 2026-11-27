import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  BookOpen,
  ChartColumnIncreasing,
  ChevronRight,
  CirclePlay,
  Cloud,
  Compass,
  Gift,
  HardDrive,
  Info,
  Loader2,
  LogIn,
  LogOut,
  RotateCcw,
  SlidersHorizontal,
  UserPlus,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
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

/** Shared shell for the Welcome screen's choices: icon tile, title, one-line subtitle, chevron. */
function EntryRow({
  icon: Icon,
  tile,
  title,
  subtitle,
  subtitleClass = "text-ink-secondary",
  trailing,
  open,
}: {
  icon: LucideIcon;
  tile: string;
  title: string;
  subtitle: string;
  subtitleClass?: string;
  trailing?: ReactNode;
  open?: boolean;
}) {
  return (
    <>
      <span className={cn("inline-flex size-12 shrink-0 items-center justify-center rounded-2xl sm:size-14", tile)}>
        <Icon size={24} strokeWidth={1.9} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-subheading text-navy-950">{title}</span>
        <span className={cn("block text-body-sm", subtitleClass)}>{subtitle}</span>
      </span>
      {trailing ?? (
        <ChevronRight
          size={22}
          className={cn(
            "shrink-0 text-navy-900 transition-transform duration-300",
            open ? "rotate-90" : "group-hover:translate-x-0.5",
          )}
          aria-hidden
        />
      )}
    </>
  );
}

/** Frosted card surface used by every Welcome choice. */
const entryCard =
  "rounded-[1.25rem] bg-white/90 shadow-e2 ring-1 ring-navy-900/[0.07] backdrop-blur-xl";
/** Pressable row inside a card. */
const entryButton =
  "group flex min-h-[4.75rem] w-full items-center gap-4 rounded-[1.25rem] p-3.5 text-left transition-[background-color,transform] duration-200 hover:bg-navy-50/60 active:scale-[0.99] disabled:opacity-60 sm:p-4";

const features: Array<{ label: string; icon: LucideIcon; tone: string }> = [
  { label: "Learn", icon: BookOpen, tone: "bg-info-50 text-info-600 ring-info-200/60" },
  { label: "Simulate", icon: SlidersHorizontal, tone: "bg-teal-50 text-teal-700 ring-teal-200/60" },
  { label: "Protect", icon: ChartColumnIncreasing, tone: "bg-gold-50 text-gold-700 ring-gold-300/40" },
  { label: "Guide", icon: Compass, tone: "bg-navy-50 text-navy-800 ring-navy-200/60" },
  { label: "Rewards", icon: Gift, tone: "bg-crimson-50 text-crimson-600 ring-crimson-200/60" },
];

const rise = (ms: number) => ({ "--ge-delay": `${ms}ms` }) as CSSProperties;

/** Shown whenever no account is active: log in to an account in this browser, sign up, or try the demo. */
export function WelcomeScreen() {
  const session = useSession();
  const { accounts } = useRegistry();
  const [loginOpen, setLoginOpen] = useState(false);
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
    <div className="min-h-screen overflow-x-hidden bg-canvas">
      {/* Hero: photograph under a navy veil that clears towards the peak, then dissolves into the canvas. */}
      <header className="relative isolate overflow-hidden pb-28 pt-[calc(env(safe-area-inset-top)+1.5rem)] text-white sm:pb-32">
        <picture className="absolute inset-0 -z-20" aria-hidden>
          <source media="(min-width: 768px)" srcSet="/images/welcome/welcome-peak-1600.webp" />
          <img
            src="/images/welcome/welcome-peak-900.webp"
            alt=""
            fetchPriority="high"
            className="h-full w-full object-cover object-[30%_62%] md:object-[50%_60%]"
          />
        </picture>
        <div className="ge-welcome-veil absolute inset-0 -z-10" aria-hidden />
        {/* Reaches the hero's bottom edge so the canvas fade below dissolves it — no seam. */}
        <svg className="absolute inset-x-0 bottom-0 -z-10 h-40 w-full sm:h-48" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="ge-welcome-swoosh" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#c8102e" stopOpacity="0" />
              <stop offset="0.45" stopColor="#c8102e" stopOpacity="0.35" />
              <stop offset="1" stopColor="#c8102e" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <path d="M0 112 C 120 104 250 92 400 30 L400 120 L0 120 Z" fill="url(#ge-welcome-swoosh)" />
        </svg>
        <div className="ge-pagehero-fade pointer-events-none absolute inset-x-0 bottom-0 -z-10" aria-hidden />

        <div className="mx-auto max-w-[34rem] px-5">
          <Logo tone="white" className="ge-rise w-[164px] sm:w-[188px]" />
          <h1 className="ge-rise mt-10 font-brand text-[2.75rem] font-bold leading-[1] tracking-[-0.01em] sm:mt-14 sm:text-[3.5rem]" style={rise(80)}>
            Welcome to
            <br />
            Great Empower.
          </h1>
          <span className="ge-rise mt-5 block h-1 w-14 rounded-full bg-crimson-600" style={rise(140)} aria-hidden />
          <p className="ge-rise mt-4 max-w-[22rem] text-body-lg text-white/90" style={rise(160)}>
            Learn, plan and protect your tomorrow.
          </p>
        </div>
      </header>

      <main className="relative mx-auto -mt-16 grid max-w-[34rem] gap-3 px-5 pb-[calc(2.5rem+env(safe-area-inset-bottom))]" aria-busy={busy}>
        {session.kind === "loading" && (
          <p role="status" className={cn(entryCard, "ge-reveal flex items-center gap-2 p-4 text-body-sm font-semibold text-navy-950")}>
            <Loader2 size={18} className="animate-spin text-teal-700" aria-hidden /> {session.message}
          </p>
        )}

        {session.kind === "error" && (
          <div role="alert" className="ge-reveal rounded-[1.25rem] bg-error-50 p-4 text-body-sm text-error-700 ring-1 ring-error-700/15">
            <p className="font-semibold">{session.message}</p>
            <p className="mt-1">{session.canUseDevice ? "Nothing was saved to the cloud." : "Your saved data hasn't changed."}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {last && (
                <button type="button" onClick={() => run(last)} className="inline-flex h-11 items-center rounded-full bg-error-700 px-4 text-caption font-bold text-white">
                  Try again
                </button>
              )}
              {last && last.kind !== "open" && session.canUseDevice && (
                <button type="button" onClick={() => run(last, "local")} className="inline-flex h-11 items-center rounded-full bg-white px-4 text-caption font-bold text-error-700 ring-1 ring-error-700/30">
                  Continue in this browser only
                </button>
              )}
              <button type="button" onClick={dismissError} className="inline-flex h-11 items-center rounded-full px-3 text-caption font-semibold underline">
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Log in = reopen an account saved in this browser (there are no passwords). */}
        <div className={cn(entryCard, "ge-rise")} style={rise(180)}>
          <button type="button" disabled={busy} aria-expanded={loginOpen} aria-controls="ge-login-panel" onClick={() => setLoginOpen((v) => !v)} className={entryButton}>
            <EntryRow icon={LogIn} tile="bg-crimson-50 text-crimson-600" title="Log In" subtitle="Continue your account" open={loginOpen} />
          </button>
          {loginOpen && (
            <section id="ge-login-panel" aria-labelledby="device-accounts" className="ge-reveal border-t border-ink/[0.07] p-3.5 sm:p-4">
              <h2 id="device-accounts" className="flex items-center gap-2 text-caption font-semibold uppercase tracking-[0.12em] text-ink-muted">
                <Users size={14} aria-hidden /> Accounts in this browser
              </h2>
              {sorted.length > 0 ? (
                <ul className="mt-2 grid gap-2">
                  {sorted.map((a) => (
                    <li key={a.id}>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => run({ kind: "open", id: a.id })}
                        className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-surface px-3 py-2.5 text-left ring-1 ring-ink/[0.07] transition-shadow hover:ring-navy-900/30 disabled:opacity-60"
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
              ) : (
                <p className="mt-2 text-body-sm text-ink-secondary">
                  No accounts in this browser yet. Sign up below or open the Demo Account. Accounts are kept on this device only.
                </p>
              )}
            </section>
          )}
        </div>

        <div className={cn(entryCard, "ge-rise")} style={rise(220)}>
          <button type="button" disabled={busy} aria-expanded={creating} aria-controls="ge-signup-panel" onClick={() => setCreating((v) => !v)} className={entryButton}>
            <EntryRow icon={UserPlus} tile="bg-teal-50 text-teal-700" title="Sign Up" subtitle="Create a new account" open={creating} />
          </button>
          {creating && (
            <form
              id="ge-signup-panel"
              className="ge-reveal grid gap-2 border-t border-ink/[0.07] p-3.5 sm:p-4"
              onSubmit={(event) => {
                event.preventDefault();
                run({ kind: "new", name: name.trim() || undefined });
              }}
            >
              <p className="text-caption text-ink-secondary">Start fresh: 0 points and no activity. The Welcome Offer is available.</p>
              <label htmlFor="ge-nickname" className="mt-1 text-body-sm font-semibold text-navy-950">
                Nickname <span className="font-normal text-ink-muted">(optional)</span>
              </label>
              <input id="ge-nickname" className="ge-input" maxLength={40} autoComplete="off" value={name} onChange={(e) => setName(e.target.value)} placeholder="Shown in greetings only" />
              <p className="text-caption text-ink-muted">Not verified and not your real identity. Leave it blank if you like.</p>
              <button type="submit" disabled={busy} className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-crimson-600 px-5 text-body-sm font-bold text-white transition-colors hover:bg-crimson-700 disabled:opacity-60">
                Create account <ArrowRight size={18} aria-hidden />
              </button>
            </form>
          )}
        </div>

        <div className="ge-rise my-1 flex items-center gap-4 text-body-sm text-ink-muted" style={rise(240)} aria-hidden>
          <span className="h-px flex-1 bg-ink/10" /> or <span className="h-px flex-1 bg-ink/10" />
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => run({ kind: "demo" })}
          className={cn(entryCard, entryButton, "ge-rise bg-gradient-to-r from-crimson-50 via-white/90 to-white/90 ring-crimson-200/70 hover:bg-crimson-50")}
          style={rise(260)}
        >
          <EntryRow
            icon={Gift}
            tile="bg-crimson-100 text-crimson-600"
            title={demoExists ? "Continue the Demo Account" : "Demo Account"}
            subtitle={demoExists ? "Reopen the demo with its saved progress" : "Start with 2,450 points"}
            subtitleClass="font-semibold text-crimson-600"
          />
        </button>

        {/* App Demo: a UI placeholder only. The guided tour is a separate, future feature. */}
        <div
          role="group"
          aria-label="App Demo: watch a quick tour of key features. Coming soon."
          className={cn(entryCard, "ge-rise flex min-h-[4.75rem] items-center gap-4 p-3.5 sm:p-4")}
          style={rise(280)}
        >
          <EntryRow
            icon={CirclePlay}
            tile="bg-teal-50 text-teal-700"
            title="App Demo"
            subtitle="Watch a quick tour of key features"
            trailing={
              <span className="shrink-0 rounded-full bg-sunken px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted ring-1 ring-ink/[0.06]">
                Coming soon
              </span>
            }
          />
        </div>

        <section aria-labelledby="ge-explore" className="ge-rise mt-5" style={rise(300)}>
          <h2 id="ge-explore" className="flex items-center gap-4 text-center text-subheading text-navy-950">
            <span className="h-px flex-1 bg-ink/10" aria-hidden />
            Explore What You Can Do
            <span className="h-px flex-1 bg-ink/10" aria-hidden />
          </h2>
          <ul className="mt-4 grid grid-cols-5 gap-2 sm:gap-3">
            {features.map(({ label, icon: Icon, tone }) => (
              <li key={label} className={cn("flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-2xl ring-1 sm:aspect-square", tone)}>
                <Icon size={24} strokeWidth={1.9} aria-hidden />
                <span className="text-[11px] font-semibold text-navy-950 sm:text-caption">{label}</span>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-4 flex gap-2 rounded-2xl bg-navy-50 p-4 text-caption text-navy-900">
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
    <div className="ge-scrim fixed inset-0 z-[70] flex items-end justify-center bg-navy-950/50 p-3 sm:items-center" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-sheet-title"
        onClick={(e) => e.stopPropagation()}
        className="ge-sheet w-full max-w-[26rem] rounded-3xl bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-ink shadow-e3"
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
