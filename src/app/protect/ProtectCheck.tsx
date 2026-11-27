import { useState, type ReactNode } from "react";
import { Accessibility, ArrowRight, Calendar, Check, HeartPulse, Info, ShieldPlus, Users, Wallet } from "lucide-react";
import { Container } from "@/components/layout/Editorial";
import { PageHero } from "@/components/layout/PageHero";
import { cn } from "@/lib/cn";
import {
  areaLabels,
  profileCompleteness,
  profileStore,
  useProfile,
  type CoverageAnswer,
  type ProtectionArea,
  type ProtectionProfile,
} from "@/state/profile";
import { rewardsActions } from "@/rewards/store";

const go = (hash: string) => {
  window.location.hash = hash;
  window.scrollTo({ top: 0 });
};

/** The four areas Protect assesses, with a one-line plain-language hint each. */
export const protectAreas: Array<{ key: ProtectionArea; icon: typeof HeartPulse; hint: string; tone: string }> = [
  { key: "medical", icon: HeartPulse, hint: "Help with hospital and treatment costs.", tone: "bg-crimson-500/20 text-crimson-200" },
  { key: "critical", icon: ShieldPlus, hint: "A lump sum if you're diagnosed with a major illness.", tone: "bg-navy-400/25 text-navy-100" },
  { key: "life", icon: Users, hint: "Support for people who depend on your income.", tone: "bg-gold-500/20 text-gold-100" },
  { key: "accident", icon: Accessibility, hint: "Protection for injuries and accidental disability.", tone: "bg-teal-400/20 text-teal-100" },
];

/**
 * Protect → Check (`#app/protect/check`): the user's own answers, used for the findings on Protect.
 * Moved here from Simulate so that Protect owns the protection check end to end. Device-only.
 */
export function ProtectCheck() {
  const saved = useProfile();
  const [p, setP] = useState<ProtectionProfile>(saved);
  const set = (patch: Partial<ProtectionProfile>) => setP((cur) => ({ ...cur, ...patch }));
  const completeness = profileCompleteness(p);

  const save = () => {
    profileStore.set({ ...p, savedAt: Date.now() });
    if (completeness.done === completeness.total) void rewardsActions.earn("profile-complete", "profile");
    window.location.hash = "app/protect";
    window.setTimeout(() => document.getElementById("protect-gaps")?.scrollIntoView({ block: "start" }), 80);
  };

  return (
    <>
      <PageHero
        eyebrow="Protect · Your check"
        title="Check your protection."
        text="Eight quick answers about you and the cover you already have. They stay on this device and aren't checked by anyone."
        backLabel="Your check"
        onBack={() => go("app/protect")}
        titleId="check-title"
      />

      <Container className="max-w-[44rem] pt-5">
        <section className="rounded-2xl bg-surface p-4 shadow-e1 ring-1 ring-ink/[0.06] sm:p-5" aria-labelledby="profile-title">
          <div className="flex items-baseline justify-between">
            <h2 id="profile-title" className="font-brand text-[1.625rem] font-semibold text-navy-950">About you</h2>
            <span className="text-caption text-ink-muted" aria-live="polite">{completeness.done}/{completeness.total} answered</span>
          </div>
          <div className="mt-3 grid gap-3">
            <Field icon={Calendar} label="Age" suffix="years">
              <input inputMode="numeric" value={p.age} onChange={(e) => set({ age: e.target.value.replace(/\D/g, "").slice(0, 3) })} className="ge-input" placeholder="e.g. 24" />
            </Field>
            <Field icon={Wallet} label="Monthly income" prefix="RM">
              <input inputMode="numeric" value={p.monthlyIncome} onChange={(e) => set({ monthlyIncome: e.target.value.replace(/\D/g, "").slice(0, 7) })} className="ge-input" placeholder="e.g. 3000" />
            </Field>
            <Field icon={Wallet} label="Monthly expenses" prefix="RM">
              <input inputMode="numeric" value={p.monthlyExpenses} onChange={(e) => set({ monthlyExpenses: e.target.value.replace(/\D/g, "").slice(0, 7) })} className="ge-input" placeholder="e.g. 1800" />
            </Field>
            <Field icon={Users} label="Who depends on you">
              <select value={p.dependants} onChange={(e) => set({ dependants: e.target.value as ProtectionProfile["dependants"] })} className="ge-input">
                <option value="">Select</option>
                <option value="none">No one</option>
                <option value="parents">Parents</option>
                <option value="partner">Partner</option>
                <option value="children">Children</option>
              </select>
            </Field>
          </div>

          <h3 className="mt-6 text-body font-semibold text-navy-950">Do you already have this cover?</h3>
          <p className="text-caption text-ink-muted">
            Count cover from your employer or your parents too. Not sure? Ask HR or check your policy documents, or answer “Not sure”.
          </p>
          <ul className="mt-2 grid gap-2.5">
            {protectAreas.map(({ key }) => (
              <li key={key} className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-body-sm text-navy-950">{areaLabels[key]}</span>
                <span className="flex gap-1" role="radiogroup" aria-label={`${areaLabels[key]} cover`}>
                  {(["yes", "no", "not-sure"] as CoverageAnswer[]).map((a) => (
                    <button
                      key={a}
                      type="button"
                      role="radio"
                      aria-checked={p.coverage[key] === a}
                      onClick={() => setP((cur) => ({ ...cur, coverage: { ...cur.coverage, [key]: a } }))}
                      className={cn("h-11 rounded-full px-3.5 text-caption font-semibold", p.coverage[key] === a ? "bg-navy-900 text-white" : "bg-sunken text-navy-900")}
                    >
                      {a === "yes" ? "Yes" : a === "no" ? "No" : "Not sure"}
                    </button>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-4 rounded-2xl bg-navy-950 p-4 text-white sm:p-5" aria-labelledby="priorities-title">
          <h2 id="priorities-title" className="font-brand text-[1.625rem] font-semibold">What matters to you? <span className="text-body-sm font-normal text-white/70">Optional</span></h2>
          <p className="mt-1 text-caption text-white/75">
            Tick the areas you want to look at first. An area you don&apos;t have cover for is only shown as a gap if you tick it here.
          </p>
          <ul className="mt-2 divide-y divide-white/10">
            {protectAreas.map(({ key, icon: Icon, hint, tone }) => {
              const on = p.priorities.includes(key);
              return (
                <li key={key}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() =>
                      setP((cur) => ({
                        ...cur,
                        priorities: cur.priorities.includes(key) ? cur.priorities.filter((x) => x !== key) : [...cur.priorities, key],
                      }))
                    }
                    className="flex min-h-16 w-full items-center gap-3 py-2.5 text-left"
                  >
                    <span className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-xl", tone)}><Icon size={20} aria-hidden /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-body font-semibold">{areaLabels[key]}</span>
                      <span className="block text-caption text-white/70">{hint}</span>
                    </span>
                    <span className={cn("inline-flex size-6 shrink-0 items-center justify-center rounded-md ring-2", on ? "bg-teal-500 ring-teal-500" : "ring-white/40")}>
                      {on && <Check size={15} aria-hidden />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <button type="button" onClick={save} className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-crimson-600 text-body font-bold text-white hover:bg-crimson-700">
          Save and see my results <ArrowRight size={18} aria-hidden />
        </button>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-caption text-ink-muted">
          <Info size={13} className="shrink-0" aria-hidden /> Educational check · Not advice, a quote or an approval · Saved on this device
        </p>
      </Container>
    </>
  );
}

function Field({ icon: Icon, label, prefix, suffix, children }: { icon: typeof Wallet; label: string; prefix?: string; suffix?: string; children: ReactNode }) {
  return (
    <label className="flex min-h-12 items-center gap-3 border-b border-ink/10 pb-2">
      <Icon size={20} className="shrink-0 text-navy-700" aria-hidden />
      <span className="w-32 shrink-0 text-body-sm text-navy-950 sm:w-36">{label}</span>
      <span className="flex min-w-0 flex-1 items-center gap-1.5">
        {prefix && <span className="text-body-sm font-semibold text-ink-muted">{prefix}</span>}
        {children}
        {suffix && <span className="text-caption text-ink-muted">{suffix}</span>}
      </span>
    </label>
  );
}
