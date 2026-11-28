import { useEffect, useRef, useState } from "react";
import { BookOpen, ClipboardCheck, Gift, Home, LogOut, Maximize2, Presentation, RotateCcw, ShieldCheck, SlidersHorizontal } from "lucide-react";
import App from "@/App";
import { Logo } from "@/components/brand/Logo";
import { PhoneFrame } from "./PhoneFrame";
import { demoPersona } from "./demoData";
import { DEMO_URL, isEmbedded, resetDemoData } from "./demoSession";
import { demoControl } from "./control/demoControl";

/**
 * App Demo (`/?demo=app`). On phones and tablets it IS the app (mobile-first, full screen). On wide
 * screens the same app runs inside a phone, so it reads as the mobile product, with a slim side
 * panel for the sample profile, quick jumps, Reset and Exit. `&view=full` shows the full-width app.
 */
const WIDE = "(min-width: 1024px)";

export function DemoApp() {
  const [wide, setWide] = useState(() => window.matchMedia(WIDE).matches);
  useEffect(() => {
    const m = window.matchMedia(WIDE);
    const on = () => setWide(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  const full = new URLSearchParams(window.location.search).get("view") === "full";
  if (isEmbedded() || full || !wide) return <App />;
  return <DemoStage />;
}

const jumps = [
  { label: "Home", hash: "app/home", icon: Home },
  { label: "Learn", hash: "app/learn", icon: BookOpen },
  { label: "Your gaps", hash: "app/protect/gap/critical", icon: ClipboardCheck },
  { label: "Get cover", hash: "app/protect/get-cover", icon: ShieldCheck },
  { label: "Simulate", hash: "app/simulate", icon: SlidersHorizontal },
  { label: "Rewards", hash: "app/rewards", icon: Gift },
];

function DemoStage() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [start] = useState(() => window.location.hash.replace(/^#/, "") || "app/home");
  const [confirm, setConfirm] = useState(false);
  const p = demoPersona;
  useEffect(() => {
    document.getElementById("ge-boot")?.remove();
    document.title = "GREAT EMPOWER — App Demo";
  }, []);
  const open = (hash: string) => {
    try {
      frameRef.current?.contentWindow?.location.replace(DEMO_URL.stagePhone(hash));
      frameRef.current?.contentWindow?.scrollTo({ top: 0 });
    } catch {
      /* still loading */
    }
  };
  return (
    <div className="grid h-dvh grid-cols-[20rem_1fr] bg-[radial-gradient(circle_at_60%_35%,#1b3a63,#06131f_75%)] text-white">
      <aside className="flex min-h-0 flex-col gap-5 overflow-y-auto border-r border-white/10 bg-navy-950/60 p-6">
        <Logo tone="white" size="sm" />
        <p className="inline-flex w-fit items-center gap-2 rounded-full bg-gold-500 px-3 py-1 text-caption font-bold uppercase tracking-[0.1em] text-navy-950">
          <span className="size-1.5 rounded-full bg-crimson-600" aria-hidden /> Demo mode · Sample profile
        </p>
        <section aria-labelledby="stage-persona" className="rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10">
          <h1 id="stage-persona" className="font-brand text-[1.5rem] font-semibold leading-tight">{p.name}, {p.age}</h1>
          <p className="text-caption text-white/70">Fictional sample profile</p>
          <dl className="mt-3 grid gap-1.5 text-body-sm">
            {[
              ["Work", p.occupation],
              ["Income", `RM${p.monthlyIncome.toLocaleString("en-MY")} a month`],
              ["Savings", `RM${p.emergencySavings.toLocaleString("en-MY")}`],
              ["Cover", "Medical, via employer"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <dt className="text-white/65">{k}</dt>
                <dd className="text-right font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
        <nav aria-label="Jump to a feature">
          <p className="text-caption font-bold uppercase tracking-[0.12em] text-white/60">Jump to</p>
          <ul className="mt-2 grid grid-cols-2 gap-1.5">
            {jumps.map(({ label, hash, icon: Icon }) => (
              <li key={label}>
                <button type="button" onClick={() => open(hash)} className="flex h-11 w-full items-center gap-2 rounded-xl bg-white/[0.06] px-3 text-body-sm font-semibold hover:bg-white/[0.12]">
                  <Icon size={16} className="text-gold-300" aria-hidden /> {label}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-caption text-white/60">Or just tap around the phone: it&apos;s the real app.</p>
        </nav>
        <div className="mt-auto grid gap-2">
          {confirm ? (
            <div className="rounded-2xl bg-white p-3 text-body-sm text-navy-950">
              <p className="font-semibold">Reset the demo?</p>
              <p className="mt-1 text-ink-secondary">Sample data goes back to the start. Real accounts aren&apos;t touched.</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    demoControl.clear();
                    resetDemoData();
                    try {
                      frameRef.current?.contentWindow?.location.replace(DEMO_URL.stagePhone("app/home"));
                      frameRef.current?.contentWindow?.location.reload();
                    } catch {
                      /* ignore */
                    }
                    setConfirm(false);
                  }}
                  className="inline-flex h-10 items-center rounded-full bg-crimson-600 px-4 font-bold text-white"
                >
                  Reset
                </button>
                <button type="button" onClick={() => setConfirm(false)} className="inline-flex h-10 items-center rounded-full px-4 font-semibold ring-1 ring-ink/15">Cancel</button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirm(true)} className="flex h-11 items-center gap-2 rounded-xl px-3 text-body-sm font-semibold ring-1 ring-white/20 hover:bg-white/10">
              <RotateCcw size={16} aria-hidden /> Reset demo
            </button>
          )}
          <a href={`/?demo=app&view=full#${start}`} className="flex h-11 items-center gap-2 rounded-xl px-3 text-body-sm font-semibold ring-1 ring-white/20 hover:bg-white/10">
            <Maximize2 size={16} aria-hidden /> Full-width app
          </a>
          <a href={DEMO_URL.present()} className="flex h-11 items-center gap-2 rounded-xl px-3 text-body-sm font-semibold ring-1 ring-white/20 hover:bg-white/10">
            <Presentation size={16} aria-hidden /> Presentation
          </a>
          <a href={DEMO_URL.entry} className="flex h-11 items-center gap-2 rounded-xl bg-white px-3 text-body-sm font-semibold text-navy-950">
            <LogOut size={16} aria-hidden /> Exit demo
          </a>
        </div>
      </aside>
      <main className="min-h-0 p-6">
        <PhoneFrame src={DEMO_URL.stagePhone(start)} frameRef={frameRef} />
      </main>
    </div>
  );
}
