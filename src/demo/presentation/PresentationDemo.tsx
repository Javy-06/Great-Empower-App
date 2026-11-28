import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  LogOut,
  Maximize,
  Minimize,
  RotateCcw,
  Smartphone,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/cn";
import { PhoneFrame } from "../PhoneFrame";
import { DEMO_URL, resetDemoData } from "../demoSession";
import { findTopic, topics, type Topic } from "./topics";

/**
 * Presentation Demo (`/?demo=present&topic=<id>`): the real app on a phone (left) and the story
 * behind each feature (right). Any topic can be opened at any time, from the navigator, the
 * overview, Previous/Next or the arrow keys; the phone follows the topic automatically and stays
 * fully interactive.
 */
const readTopic = () => findTopic(new URLSearchParams(window.location.search).get("topic")) ?? topics[0];

const isTyping = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));

export function PresentationDemo() {
  const [topic, setTopic] = useState<Topic>(readTopic);
  const [initial] = useState(topic);
  const [overview, setOverview] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [mobileView, setMobileView] = useState<"explain" | "app">("explain");
  const [fullscreen, setFullscreen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const index = topics.findIndex((t) => t.id === topic.id);

  /** Point the phone at a topic's screen, in place (no reload), and scroll to its focus element. */
  const syncPhone = useCallback((t: Topic) => {
    const w = frameRef.current?.contentWindow;
    if (!w) return;
    try {
      w.location.replace(DEMO_URL.phone(t.hash));
      w.scrollTo({ top: 0 });
      if (t.focus) {
        window.setTimeout(() => w.document.querySelector(t.focus!)?.scrollIntoView({ block: "start" }), 500);
      }
    } catch {
      /* the frame is still loading; its src already points at the topic */
    }
  }, []);

  const go = useCallback(
    (t: Topic) => {
      setTopic(t);
      setOverview(false);
      setConfirmReset(false);
      const url = new URL(window.location.href);
      url.searchParams.set("topic", t.id);
      window.history.replaceState(null, "", url);
      syncPhone(t);
      contentRef.current?.scrollTo({ top: 0 });
    },
    [syncPhone],
  );
  const step = useCallback((d: 1 | -1) => go(topics[(index + d + topics.length) % topics.length]), [go, index]);

  useEffect(() => {
    document.title = `${topic.n} · ${topic.title} — GREAT EMPOWER presentation`;
  }, [topic]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        step(-1);
      } else if (e.key === "Escape") {
        if (overview) setOverview(false);
        else if (confirmReset) setConfirmReset(false);
        // In fullscreen the browser uses Escape to leave fullscreen; outside it, Escape exits.
        else if (!document.fullscreenElement) window.location.href = DEMO_URL.entry;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, overview, confirmReset]);

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => undefined);
  };

  const reset = () => {
    resetDemoData();
    const w = frameRef.current?.contentWindow;
    try {
      w?.location.replace(DEMO_URL.phone(topic.hash));
      w?.location.reload();
    } catch {
      if (frameRef.current) frameRef.current.src = DEMO_URL.phone(topic.hash);
    }
    setConfirmReset(false);
    setResetDone(true);
    window.setTimeout(() => setResetDone(false), 2500);
  };

  const next = topics[(index + 1) % topics.length];

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-canvas text-ink">
      {/* ---------------------------------------------------------------- top bar */}
      <header className="flex shrink-0 items-center gap-2 border-b border-ink/10 bg-paper/95 px-3 py-2 sm:px-5">
        <a href={DEMO_URL.entry} className="hidden shrink-0 items-center rounded-lg sm:inline-flex" aria-label="GREAT EMPOWER demo home">
          <Logo size="sm" />
        </a>
        <span className="hidden h-6 w-px bg-ink/15 sm:block" aria-hidden />
        <p className="min-w-0 flex-1 truncate text-body-sm" data-testid="topic-indicator">
          <span className="font-bold tabular-nums text-crimson-600">{topic.n}</span>
          <span className="text-ink-muted"> / {topics.length} · </span>
          <span className="font-semibold text-navy-950">{topic.short}</span>
        </p>
        <div className="flex shrink-0 items-center gap-1">
          <Ctl label="Previous topic" onClick={() => step(-1)}><ArrowLeft size={18} aria-hidden /></Ctl>
          <Ctl label="Next topic" onClick={() => step(1)}><ArrowRight size={18} aria-hidden /></Ctl>
          <span className="mx-1 hidden h-6 w-px bg-ink/15 sm:block" aria-hidden />
          <Ctl label="All topics" onClick={() => setOverview(true)} expanded={overview}><LayoutGrid size={18} aria-hidden /><span className="hidden xl:inline">Topics</span></Ctl>
          <Ctl label={navHidden ? "Show navigator" : "Hide navigator"} onClick={() => setNavHidden((v) => !v)} className="hidden lg:inline-flex">
            {navHidden ? <ChevronUp size={18} aria-hidden /> : <ChevronDown size={18} aria-hidden />}
          </Ctl>
          <Ctl label={fullscreen ? "Exit fullscreen" : "Fullscreen"} onClick={toggleFullscreen} className="hidden sm:inline-flex">
            {fullscreen ? <Minimize size={18} aria-hidden /> : <Maximize size={18} aria-hidden />}
          </Ctl>
          <div className="relative">
            <Ctl label="Reset demo" onClick={() => setConfirmReset((v) => !v)} expanded={confirmReset}><RotateCcw size={18} aria-hidden /></Ctl>
            {confirmReset && (
              <div role="dialog" aria-label="Reset demo" className="absolute right-0 top-12 z-50 w-72 rounded-2xl bg-surface p-4 text-body-sm shadow-e3 ring-1 ring-ink/10">
                <p className="font-semibold text-navy-950">Reset the demo?</p>
                <p className="mt-1 text-ink-secondary">The sample profile, progress, points and drafts go back to the start. Real accounts aren&apos;t touched.</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={reset} className="inline-flex h-10 items-center rounded-full bg-crimson-600 px-4 font-bold text-white">Reset</button>
                  <button type="button" onClick={() => setConfirmReset(false)} className="inline-flex h-10 items-center rounded-full px-4 font-semibold text-navy-900 ring-1 ring-ink/15">Cancel</button>
                </div>
              </div>
            )}
          </div>
          <a href={DEMO_URL.entry} className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-body-sm font-semibold text-navy-900 hover:bg-sunken" aria-label="Exit presentation">
            <LogOut size={18} aria-hidden /> <span className="hidden xl:inline">Exit</span>
          </a>
        </div>
      </header>
      <p role="status" aria-live="polite" className="sr-only">
        Topic {index + 1} of {topics.length}: {topic.title}
        {resetDone ? ". Demo reset." : ""}
      </p>
      {resetDone && (
        <p className="pointer-events-none fixed left-1/2 top-16 z-50 -translate-x-1/2 rounded-full bg-success-600 px-4 py-2 text-body-sm font-semibold text-white shadow-e2" aria-hidden>
          Demo reset to the sample profile
        </p>
      )}

      {/* ---------------------------------------------------------------- phone: navigator (mobile) */}
      <nav aria-label="Presentation topics" className="shrink-0 border-b border-ink/10 bg-paper lg:hidden">
        <ol className="flex gap-1.5 overflow-x-auto px-3 py-2 scrollbar-none">
          {topics.map((t) => (
            <li key={t.id} className="shrink-0">
              <TopicChip topic={t} active={t.id === topic.id} onClick={() => go(t)} />
            </li>
          ))}
        </ol>
        <div className="grid grid-cols-2 gap-1 px-3 pb-2" role="group" aria-label="View">
          {(["explain", "app"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={mobileView === v}
              onClick={() => setMobileView(v)}
              className={cn("inline-flex h-10 items-center justify-center gap-2 rounded-full text-body-sm font-semibold", mobileView === v ? "bg-navy-900 text-white" : "bg-sunken text-navy-900")}
            >
              {v === "explain" ? <BookOpen size={16} aria-hidden /> : <Smartphone size={16} aria-hidden />}
              {v === "explain" ? "Explanation" : "Live app"}
            </button>
          ))}
        </div>
      </nav>

      {/* ---------------------------------------------------------------- stage */}
      <main className="grid min-h-0 flex-1 lg:grid-cols-[minmax(22rem,40%)_1fr]">
        <section
          aria-label="Live app preview"
          className={cn(
            "min-h-0 flex-col items-center bg-[radial-gradient(circle_at_50%_35%,#1b3a63,#06131f_75%)] px-4 py-4 lg:flex",
            mobileView === "app" ? "flex" : "hidden",
          )}
        >
          <PhoneFrame src={DEMO_URL.phone(initial.hash)} frameRef={frameRef} className="flex min-h-0 w-full flex-1 items-center justify-center" />
          <div className="mt-3 flex w-full max-w-[26rem] shrink-0 items-center justify-between gap-3 text-caption text-white/75">
            <span className="min-w-0 truncate" data-testid="phone-caption">{topic.phoneCaption}</span>
            <button type="button" onClick={() => syncPhone(topic)} className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-full px-3 font-semibold text-white ring-1 ring-white/25 hover:bg-white/10">
              <RotateCcw size={13} aria-hidden /> Back to this screen
            </button>
          </div>
        </section>

        <div ref={contentRef} className={cn("min-h-0 overflow-y-auto lg:block", mobileView === "explain" ? "block" : "hidden")}>
          <article key={topic.id} className="ge-enter mx-auto max-w-[56rem] px-5 py-7 sm:px-8 lg:px-12 lg:py-8" aria-labelledby="topic-title">
            <p className="flex items-baseline gap-3">
              <span className="font-brand text-[3.5rem] font-semibold leading-none text-crimson-600 lg:text-[4rem]">{topic.n}</span>
              <span className="text-caption font-bold uppercase tracking-[0.16em] text-teal-700">{topic.subtitle}</span>
            </p>
            <h1 id="topic-title" className="mt-2 font-brand text-[2.5rem] font-semibold leading-[1.05] text-navy-950 lg:text-[3rem]">{topic.title}</h1>
            <div className="mt-6">{topic.body()}</div>
            <aside aria-label="Key takeaway" className="mt-7 flex gap-4 border-l-4 border-crimson-600 bg-surface py-4 pl-5 pr-4 shadow-e1">
              <div>
                <p className="text-caption font-bold uppercase tracking-[0.14em] text-crimson-700">Key takeaway</p>
                <p className="mt-1 text-[1.125rem] font-semibold leading-snug text-navy-950">{topic.takeaway}</p>
              </div>
            </aside>
            <button type="button" onClick={() => go(next)} className="group mt-6 inline-flex min-h-11 items-center gap-2 text-body-sm font-semibold text-navy-800">
              Next: {next.n} {next.title} <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
            </button>
          </article>
        </div>
      </main>

      {/* ---------------------------------------------------------------- desktop navigator */}
      {!navHidden && (
        <nav aria-label="Presentation topics" className="hidden shrink-0 border-t border-ink/10 bg-paper lg:block">
          <ol className="flex gap-0.5 overflow-x-auto px-2 py-2 scrollbar-none [&>li:first-child]:ml-auto [&>li:last-child]:mr-auto">
            {topics.map((t) => (
              <li key={t.id} className="shrink-0">
                <TopicChip topic={t} active={t.id === topic.id} onClick={() => go(t)} />
              </li>
            ))}
          </ol>
        </nav>
      )}

      {overview && <Overview current={topic} onPick={go} onClose={() => setOverview(false)} />}
    </div>
  );
}

function Ctl({ label, onClick, children, expanded, className }: { label: string; onClick: () => void; children: React.ReactNode; expanded?: boolean; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-expanded={expanded}
      className={cn("h-10 min-w-10 items-center justify-center gap-1.5 rounded-full px-2.5 text-body-sm font-semibold text-navy-900 hover:bg-sunken", className ?? "inline-flex")}
    >
      {children}
    </button>
  );
}

function TopicChip({ topic: t, active, onClick }: { topic: Topic; active: boolean; onClick: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!active) return;
    const centre = () => ref.current?.scrollIntoView({ block: "nearest", inline: "center" });
    centre();
    // Chip widths change when the web font arrives; centre again so the active topic stays in view.
    void document.fonts?.ready.then(centre);
  }, [active]);
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex h-10 items-center gap-1 rounded-full px-2.5 text-body-sm font-semibold transition-colors lg:px-2 lg:text-[13px] 2xl:gap-1.5 2xl:px-3 2xl:text-body-sm",
        active ? "bg-navy-900 text-white" : "text-navy-900 hover:bg-sunken",
      )}
    >
      <span className={cn("tabular-nums", active ? "text-gold-300" : "text-crimson-600")}>{t.n}</span>
      {t.short}
    </button>
  );
}

function Overview({ current, onPick, onClose }: { current: Topic; onPick: (t: Topic) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>("[aria-current]")?.focus();
  }, []);
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-navy-950/70 p-3 backdrop-blur-sm sm:p-8" onClick={onClose}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="overview-title" onClick={(e) => e.stopPropagation()} className="w-full max-w-[64rem] rounded-3xl bg-canvas p-5 shadow-e3 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-caption font-bold uppercase tracking-[0.14em] text-teal-700">Choose any topic</p>
            <h2 id="overview-title" className="font-brand text-[2rem] font-semibold leading-tight text-navy-950">All topics</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close topics" className="inline-flex size-11 items-center justify-center rounded-full hover:bg-sunken"><X size={20} aria-hidden /></button>
        </div>
        <ol className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => onPick(t)}
                aria-current={t.id === current.id ? "true" : undefined}
                className={cn("flex h-full w-full gap-3 rounded-2xl p-4 text-left transition-shadow hover:shadow-e2", t.id === current.id ? "bg-navy-900 text-white" : "bg-surface ring-1 ring-ink/[0.08]")}
              >
                <span className={cn("font-brand text-[1.75rem] font-semibold leading-none", t.id === current.id ? "text-gold-300" : "text-crimson-600")}>{t.n}</span>
                <span className="min-w-0">
                  <span className="block text-body font-semibold">{t.title}</span>
                  <span className={cn("block text-body-sm", t.id === current.id ? "text-white/80" : "text-ink-secondary")}>{t.subtitle}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
