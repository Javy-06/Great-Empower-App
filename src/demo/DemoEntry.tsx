import { ArrowRight, Presentation, ShieldAlert, Smartphone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { demoPersona } from "./demoData";
import { DEMO_URL } from "./demoSession";

/**
 * Demo entry (`/?demo`): two clear choices. App Demo = interaction, Presentation Demo =
 * explanation + interaction. Both use the same fictional sample profile, isolated from real accounts.
 */
export function DemoEntry() {
  const p = demoPersona;
  return (
    <div className="min-h-dvh bg-[radial-gradient(90%_60%_at_50%_0%,#15325a_0%,#0a1c33_60%,#06131f_100%)] text-white">
      <div className="mx-auto flex min-h-dvh max-w-[68rem] flex-col px-5 py-8 sm:px-8 sm:py-12">
        <header className="flex items-center justify-between gap-3">
          <Logo tone="white" size="sm" />
          <span className="rounded-full bg-white/10 px-3 py-1 text-caption font-bold uppercase tracking-[0.12em] text-gold-300 ring-1 ring-white/15">Demo</span>
        </header>

        <main className="flex flex-1 flex-col justify-center py-10">
          <p className="text-caption font-bold uppercase tracking-[0.18em] text-teal-300">GREAT EMPOWER · Demo</p>
          <h1 className="mt-3 max-w-[44rem] font-brand text-[2.75rem] font-semibold leading-[1.02] sm:text-[4rem]">
            See GREAT EMPOWER in action.
          </h1>
          <p className="mt-4 max-w-[36rem] text-[1.125rem] text-white/80">Choose how you&apos;d like to explore. No sign-up, nothing to set up.</p>

          <div className="mt-9 grid gap-4 md:grid-cols-2">
            <ModeCard
              href={DEMO_URL.app}
              icon={Smartphone}
              kicker="App demo"
              title="Explore GREAT EMPOWER"
              text="Explore the application freely and interact with its features."
              cta="Start App Demo"
              primary
            />
            <ModeCard
              href={DEMO_URL.present()}
              icon={Presentation}
              kicker="Presentation demo"
              title="Discover the idea behind GREAT EMPOWER"
              text="Explore the problem, solution, features and impact through an interactive presentation."
              cta="Start Presentation"
            />
          </div>

          <section aria-labelledby="persona-title" className="mt-6 flex flex-col gap-4 rounded-3xl bg-white/[0.06] p-5 ring-1 ring-white/10 sm:flex-row sm:items-center">
            <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-gold-500 font-brand text-[1.75rem] font-semibold text-navy-950" aria-hidden>{p.name[0]}</span>
            <div className="min-w-0 flex-1">
              <h2 id="persona-title" className="text-body font-semibold">
                Sample profile: {p.name}, {p.age} <span className="font-normal text-white/70">(fictional)</span>
              </h2>
              <p className="text-body-sm text-white/75">
                {p.occupation} in {p.city} · RM{p.monthlyIncome.toLocaleString("en-MY")} a month · RM{p.emergencySavings.toLocaleString("en-MY")} emergency savings · {p.existingCover.toLowerCase()} · priorities: {p.priorities.join(" and ").toLowerCase()}
              </p>
            </div>
          </section>
        </main>

        <footer className="flex gap-2.5 text-caption text-white/70">
          <ShieldAlert size={16} className="mt-0.5 shrink-0 text-gold-300" aria-hidden />
          <p>
            Demo data is fictional and stays in this browser, separate from any real account. No real insurance applications, payments, adviser bookings or insurer
            submissions. Independent education, not affiliated with any insurer.
          </p>
        </footer>
      </div>
    </div>
  );
}

function ModeCard({ href, icon: Icon, kicker, title, text, cta, primary }: { href: string; icon: typeof Smartphone; kicker: string; title: string; text: string; cta: string; primary?: boolean }) {
  return (
    <a
      href={href}
      className={
        "group flex flex-col rounded-[1.75rem] p-6 transition-transform hover:-translate-y-0.5 sm:p-7 " +
        (primary ? "bg-white text-navy-950 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.8)]" : "bg-white/[0.07] text-white ring-1 ring-white/15 hover:bg-white/[0.1]")
      }
    >
      <span className={"inline-flex size-14 items-center justify-center rounded-2xl " + (primary ? "bg-navy-950 text-white" : "bg-gold-500 text-navy-950")}>
        <Icon size={26} aria-hidden />
      </span>
      <span className={"mt-6 text-caption font-bold uppercase tracking-[0.14em] " + (primary ? "text-crimson-600" : "text-gold-300")}>{kicker}</span>
      <span className="mt-1 font-brand text-[1.875rem] font-semibold leading-tight">{title}</span>
      <span className={"mt-2 text-body " + (primary ? "text-ink-secondary" : "text-white/80")}>{text}</span>
      <span className={"mt-6 inline-flex h-12 w-fit items-center gap-2 rounded-full px-6 text-body-sm font-bold " + (primary ? "bg-crimson-600 text-white group-hover:bg-crimson-700" : "bg-white text-navy-950")}>
        {cta} <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </a>
  );
}
