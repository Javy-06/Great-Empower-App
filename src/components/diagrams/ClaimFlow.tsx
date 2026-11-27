import { ArrowDown, ArrowRight, FileSearch, Receipt, ShieldCheck, Wallet } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * How a medical claim splits a hospital bill, as a flow + a proportional bar.
 * Illustrative figures, the same as TermExplainer's so the app tells one story:
 * RM10,000 bill · RM500 deductible · 10% co-payment → insurer RM8,550, you RM1,450.
 */
const BILL = 10_000;
const DEDUCTIBLE = 500;
const COPAY = (BILL - DEDUCTIBLE) * 0.1; // 950
const YOU = DEDUCTIBLE + COPAY; // 1,450
const INSURER = BILL - YOU; // 8,550
const rm = (n: number) => `RM${n.toLocaleString("en-MY")}`;

const steps = [
  { icon: Receipt, title: "Hospital bill", text: rm(BILL) },
  { icon: FileSearch, title: "Policy check", text: "Covered? Within limits?" },
  { icon: ShieldCheck, title: "Insurer pays", text: rm(INSURER) },
  { icon: Wallet, title: "You pay the rest", text: rm(YOU) },
];

export function ClaimFlow({ className }: { className?: string }) {
  return (
    <figure className={cn("rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.08] sm:p-5", className)}>
      <ol className="grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] sm:items-center" aria-label="How a claim is paid">
        {steps.map((s, i) => (
          <li key={s.title} className="contents">
            <div className="flex items-center gap-3 rounded-xl bg-sunken/70 p-3 sm:flex-col sm:items-start sm:gap-2">
              <span className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-xl", i === 3 ? "bg-crimson-600 text-white" : i === 2 ? "bg-navy-900 text-white" : "bg-white text-navy-800 ring-1 ring-ink/10")}>
                <s.icon size={19} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-caption font-semibold uppercase tracking-[0.08em] text-ink-muted">{i + 1}. {s.title}</span>
                <span className="block text-body-sm font-semibold text-navy-950 tabular-nums">{s.text}</span>
              </span>
            </div>
            {i < steps.length - 1 && (
              <span className="flex justify-center text-ink-muted" aria-hidden>
                <ArrowDown size={16} className="sm:hidden" />
                <ArrowRight size={16} className="hidden sm:block" />
              </span>
            )}
          </li>
        ))}
      </ol>
      <div className="mt-4" aria-hidden>
        <div className="flex h-9 w-full overflow-hidden rounded-lg text-caption font-semibold">
          <div className="flex items-center bg-navy-900 px-2 text-white" style={{ width: `${(INSURER / BILL) * 100}%` }}>Insurer {Math.round((INSURER / BILL) * 100)}%</div>
          <div className="flex flex-1 items-center justify-center bg-crimson-600 text-white">You</div>
        </div>
      </div>
      <figcaption className="mt-3 grid gap-1 text-caption text-ink-secondary">
        <span>
          Example: on a {rm(BILL)} bill with a {rm(DEDUCTIBLE)} deductible and 10% co-payment, you pay {rm(DEDUCTIBLE)} + {rm(COPAY)} = <strong className="font-semibold text-crimson-700">{rm(YOU)}</strong>; the insurer pays <strong className="font-semibold text-navy-900">{rm(INSURER)}</strong>.
        </span>
        <span className="text-ink-muted">Illustrative figures, not a real plan. Limits and exclusions can leave you more to pay.</span>
      </figcaption>
    </figure>
  );
}
