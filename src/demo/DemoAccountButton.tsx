import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LogOut, Presentation, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { demoPersona } from "./demoData";
import { DEMO_URL, isEmbedded, resetDemoData } from "./demoSession";
import { demoControl } from "./control/demoControl";

/**
 * In the App Demo, the header's account button becomes a small "Demo" pill: the subtle
 * "DEMO MODE · Sample profile" indicator. It opens a sheet with the sample profile, Reset demo and
 * Exit. There is no sign-in, sign-out or account switching in demo mode.
 */
export function DemoAccountButton({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        data-testid="demo-indicator"
        className={cn(
          "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] font-bold uppercase tracking-[0.08em]",
          tone === "dark" ? "bg-gold-500 text-navy-950" : "bg-gold-50 text-navy-950 ring-1 ring-gold-100",
        )}
      >
        <span className="size-1.5 rounded-full bg-crimson-600" aria-hidden />
        Demo
        <span className="hidden font-semibold normal-case tracking-normal lg:inline">· Sample profile</span>
        <span className="sr-only">: sample profile and demo options</span>
      </button>
      {open && createPortal(<DemoSheet onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}

function DemoSheet({ onClose }: { onClose: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const embedded = isEmbedded();
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const p = demoPersona;
  return (
    <div className="ge-scrim fixed inset-0 z-[70] flex items-end justify-center bg-navy-950/50 p-3 sm:items-center" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-sheet-title"
        onClick={(e) => e.stopPropagation()}
        className="ge-sheet w-full max-w-[26rem] rounded-3xl bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-ink shadow-e3"
      >
        <div className="flex items-start gap-3">
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-gold-100 font-brand text-[1.375rem] font-semibold text-navy-950" aria-hidden>
            {p.name[0]}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-caption font-bold uppercase tracking-[0.12em] text-gold-700">Demo mode · Sample profile</p>
            <h2 id="demo-sheet-title" className="text-subheading text-navy-950">{p.name}, {p.age} (fictional)</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 -mt-2 inline-flex size-11 items-center justify-center rounded-full text-ink-muted hover:bg-sunken">
            <X size={20} aria-hidden />
          </button>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-sunken/60 p-3 text-body-sm">
          {[
            ["Work", p.occupation],
            ["Income", `RM${p.monthlyIncome.toLocaleString("en-MY")} a month`],
            ["Savings", `RM${p.emergencySavings.toLocaleString("en-MY")} emergency fund`],
            ["Cover", "Medical, via employer"],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-caption text-ink-muted">{k}</dt>
              <dd className="font-semibold text-navy-950">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-caption text-ink-secondary">
          A made-up person with sample data. Nothing here is sent anywhere: no real applications, payments, adviser bookings or insurer submissions.
        </p>

        <div className="mt-4 grid gap-2">
          {confirm ? (
            <div className="rounded-2xl bg-gold-50 p-3 text-body-sm text-navy-950">
              <p className="font-semibold">Reset the demo?</p>
              <p className="mt-1">The sample profile, check answers, learning, points, application draft and simulators go back to the start. Real accounts on this device aren&apos;t touched.</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    demoControl.clear();
                    resetDemoData();
                    window.location.reload();
                  }}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-crimson-600 px-4 text-body-sm font-bold text-white"
                >
                  Yes, reset demo
                </button>
                <button type="button" onClick={() => setConfirm(false)} className="inline-flex h-11 items-center rounded-full px-4 text-body-sm font-semibold text-navy-900 ring-1 ring-ink/15">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirm(true)} className="flex h-12 items-center gap-3 rounded-2xl px-3 text-body-sm font-semibold text-navy-950 ring-1 ring-ink/10 hover:bg-sunken">
              <RotateCcw size={18} aria-hidden /> Reset demo…
            </button>
          )}
          {!embedded && (
            <>
              <a href={DEMO_URL.present()} className="flex h-12 items-center gap-3 rounded-2xl px-3 text-body-sm font-semibold text-navy-950 ring-1 ring-ink/10 hover:bg-sunken">
                <Presentation size={18} aria-hidden /> Switch to the presentation
              </a>
              <a href={DEMO_URL.entry} className="flex h-12 items-center gap-3 rounded-2xl bg-navy-950 px-3 text-body-sm font-semibold text-white hover:bg-navy-900">
                <LogOut size={18} aria-hidden /> Exit demo
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
