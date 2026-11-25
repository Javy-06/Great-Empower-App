import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  CalendarDays,
  Check,
  Clock3,
  HeartPulse,
  Info,
  MapPin,
  MessageCircleQuestion,
  PiggyBank,
  ReceiptText,
  ShieldPlus,
  Users,
  Video,
  XCircle,
} from "lucide-react";
import { Container } from "@/components/layout/Editorial";
import { PageHero } from "@/components/layout/PageHero";
import { cn } from "@/lib/cn";
import { createStore, useStore } from "@/state/store";
import { ADVISOR_DISCLAIMER, findAdvisor } from "@/data/advisors";
import { trioForSession } from "./advisorSelection";
import { AdvisorAvatar, AdvisorCard } from "./AdvisorCard";

/**
 * Guidance sessions — a DESIGN PROTOTYPE of an appointment flow. Everything here is simulated:
 * there are no real advisers, availability, appointments or advice, and nothing is sent anywhere.
 */

const topics = [
  { id: "medical", label: "Understand medical protection", icon: HeartPulse },
  { id: "protection", label: "Explore financial protection", icon: ShieldPlus },
  { id: "claims", label: "Medical bill & claim questions", hint: "Educational guidance only", icon: ReceiptText },
  { id: "planning", label: "Financial planning basics", icon: PiggyBank },
  { id: "general", label: "General protection questions", icon: MessageCircleQuestion },
] as const;

const areas = ["Kuala Lumpur", "Petaling Jaya", "Penang", "Johor Bahru", "Kota Kinabalu"];
const slotTimes = ["10:00", "11:30", "14:00", "15:30", "17:00"];

type Booking = {
  id: string;
  ref: string;
  topic: string;
  format: "online" | "in-person";
  area?: string;
  date: string;
  time: string;
  guide: string;
  advisorId?: string;
  name?: string;
  status: "booked" | "cancelled";
  createdAt: number;
};

const bookingStore = createStore<{ bookings: Booking[] }>("ge-sessions-v1", () => ({ bookings: [] }));

/** Next 7 weekdays from today. */
function upcomingDays() {
  const out: Date[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (out.length < 7) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) out.push(new Date(d));
  }
  return out;
}
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Deterministic simulated availability so the prototype behaves the same on every visit. */
function simulatedOpen(key: string, time: string) {
  let h = 0;
  for (const ch of `${key}|${time}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % 5 > 1; // roughly 60% of slots open
}

const go = (hash: string) => {
  window.location.hash = hash;
  window.scrollTo({ top: 0 });
};

const PROTOTYPE_NOTE =
  "Fictional advisors for demonstration purposes (AI-generated portraits). Advisors, availability and bookings are simulated. No real adviser, appointment or advice is arranged, and nothing is sent anywhere.";

export function SessionsView() {
  const { bookings } = useStore(bookingStore);
  const [mode, setMode] = useState<"book" | "list">(bookings.some((b) => b.status === "booked") ? "list" : "book");
  return mode === "list" ? (
    <MySessions bookings={bookings} onNew={() => setMode("book")} />
  ) : (
    <BookingFlow onDone={() => setMode("list")} hasBookings={bookings.length > 0} onList={() => setMode("list")} />
  );
}

const stepNames = ["Topic", "Format", "When", "Review"] as const;

function BookingFlow({ onDone, hasBookings, onList }: { onDone: () => void; hasBookings: boolean; onList: () => void }) {
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState<string | null>(null);
  const [format, setFormat] = useState<"online" | "in-person" | null>(null);
  const [area, setArea] = useState<string | null>(null);
  const days = useMemo(upcomingDays, []);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [guide, setGuide] = useState("any");
  const [name, setName] = useState("");
  const [confirmed, setConfirmed] = useState<Booking | null>(null);

  const availKey = `${date}|${format === "in-person" ? area : "online"}`;
  // One Malay, one Chinese and one Indian advisor — guaranteed by pickAdvisorTrio, stable per slot.
  const sessionTrio = useMemo(() => trioForSession(`${availKey}|${time ?? ""}`), [availKey, time]);
  const openSlots = date ? slotTimes.filter((t) => simulatedOpen(availKey, t)) : [];
  const canNext = [!!topic, !!format && (format === "online" || !!area), !!date && !!time, true][step];

  const confirm = () => {
    const ref = `GS-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const booking: Booking = {
      id: `${Date.now()}`,
      ref,
      topic: topics.find((t) => t.id === topic)!.label,
      format: format!,
      area: format === "in-person" ? area! : undefined,
      date: date!,
      time: time!,
      guide: guide === "any" ? "Any available advisor" : findAdvisor(guide)!.name,
      advisorId: guide === "any" ? undefined : guide,
      name: name.trim() || undefined,
      status: "booked",
      createdAt: Date.now(),
    };
    bookingStore.set({ bookings: [booking, ...bookingStore.get().bookings] });
    setConfirmed(booking);
  };

  if (confirmed) {
    return (
      <Container className="flex min-h-[60vh] max-w-[30rem] flex-col items-center justify-center py-10 text-center">
        <span className="inline-flex size-16 items-center justify-center rounded-full bg-success-50 text-success-600">
          <CalendarCheck2 size={32} aria-hidden />
        </span>
        <p className="mt-4 text-overline uppercase tracking-[0.2em] text-crimson-600">Simulated booking</p>
        <h1 className="mt-1 font-brand text-[2rem] font-semibold text-navy-950">Session reserved</h1>
        <p className="mt-1 text-body text-ink-secondary">
          {confirmed.topic} · {new Date(`${confirmed.date}T00:00:00`).toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short" })} at {confirmed.time}
          {confirmed.area ? ` · ${confirmed.area}` : " · Online"}
        </p>
        <p className="mt-2 font-mono text-body-sm text-navy-900">Ref {confirmed.ref}</p>
        <p className="mt-4 rounded-xl bg-gold-50 px-4 py-3 text-caption text-gold-700">{PROTOTYPE_NOTE}</p>
        <button type="button" onClick={onDone} className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-navy-900 px-6 text-body-sm font-semibold text-white">
          View my sessions <ArrowRight size={16} aria-hidden />
        </button>
      </Container>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Guidance sessions · prototype"
        title="Book a guidance session."
        text="Pick a topic and a time to talk through protection basics with a guide."
        backLabel="Guide"
        onBack={() => (step > 0 ? setStep(step - 1) : go("app/guide"))}
        titleId="sessions-title"
      >
        {hasBookings && (
          <button type="button" onClick={onList} className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-white/10 px-4 text-caption font-semibold ring-1 ring-white/20">
            <CalendarDays size={15} aria-hidden /> My sessions
          </button>
        )}
      </PageHero>

      <Container className="relative -mt-5 max-w-[40rem]">
        <ol className="grid grid-cols-4 gap-1 rounded-full bg-surface p-1.5 shadow-e2 ring-1 ring-ink/[0.06]" aria-label="Booking steps">
          {stepNames.map((label, i) => (
            <li key={label} aria-current={i === step ? "step" : undefined} className={cn("flex h-10 items-center justify-center gap-1 rounded-full text-[11px] font-bold uppercase tracking-[0.03em]", i === step ? "bg-crimson-50 text-crimson-600" : i < step ? "text-navy-900" : "text-ink-muted")}>
              {i < step ? <Check size={13} aria-hidden /> : <span>{i + 1}</span>}
              <span className="truncate">{label}</span>
            </li>
          ))}
        </ol>
      </Container>

      <Container className="max-w-[40rem] pt-5">
        {step === 0 && (
          <fieldset>
            <legend className="text-heading text-navy-950">What would you like help with?</legend>
            <div className="mt-3 grid gap-2.5">
              {topics.map((t) => (
                <Choice key={t.id} selected={topic === t.id} onSelect={() => setTopic(t.id)} icon={t.icon} label={t.label} hint={"hint" in t ? t.hint : undefined} />
              ))}
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <>
            <fieldset>
              <legend className="text-heading text-navy-950">How would you like to meet?</legend>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <Choice selected={format === "online"} onSelect={() => setFormat("online")} icon={Video} label="Online video" />
                <Choice selected={format === "in-person"} onSelect={() => setFormat("in-person")} icon={Users} label="In person" />
              </div>
            </fieldset>
            {format === "in-person" && (
              <fieldset className="mt-5">
                <legend className="text-subheading text-navy-950">Choose an area</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {areas.map((a) => (
                    <button key={a} type="button" aria-pressed={area === a} onClick={() => setArea(a)} className={cn("inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-body-sm font-semibold", area === a ? "bg-navy-900 text-white" : "bg-surface text-navy-900 ring-1 ring-ink/10")}>
                      <MapPin size={15} aria-hidden /> {a}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-caption text-ink-muted">Simulated locations for the prototype.</p>
              </fieldset>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <fieldset>
              <legend className="text-heading text-navy-950">Pick a date</legend>
              <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-none">
                {days.map((d) => {
                  const k = iso(d);
                  const sel = date === k;
                  return (
                    <button key={k} type="button" aria-pressed={sel} onClick={() => { setDate(k); setTime(null); }} className={cn("flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-2xl text-center", sel ? "bg-navy-900 text-white" : "bg-surface text-navy-900 ring-1 ring-ink/10")}>
                      <span className="text-[11px] font-semibold uppercase">{d.toLocaleDateString("en-MY", { weekday: "short" })}</span>
                      <span className="text-heading font-bold leading-none">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
            {date && (
              <fieldset className="mt-5">
                <legend className="text-subheading text-navy-950">Available times</legend>
                {openSlots.length === 0 ? (
                  <p className="mt-2 rounded-xl bg-sunken px-4 py-3 text-body-sm text-ink-secondary">This day is fully booked. Please pick another date.</p>
                ) : (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {openSlots.map((t) => (
                      <button key={t} type="button" aria-pressed={time === t} onClick={() => { setTime(t); setGuide("any"); }} className={cn("inline-flex h-11 items-center justify-center gap-1 rounded-xl text-body-sm font-semibold", time === t ? "bg-crimson-600 text-white" : "bg-surface text-navy-900 ring-1 ring-ink/10")}>
                        <Clock3 size={14} aria-hidden /> {t}
                      </button>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-caption text-ink-muted">Fully booked times are not shown. Availability is simulated.</p>
              </fieldset>
            )}
            {time && (
              <fieldset className="mt-5">
                <legend className="text-subheading text-navy-950">Advisors for this session</legend>
                <p className="text-caption text-ink-muted">Choose one, or let us match you.</p>
                <div className="mt-2 grid gap-2" role="radiogroup" aria-label="Advisor" data-testid="advisor-trio">
                  {sessionTrio.map((a) => (
                    <AdvisorCard key={a.id} advisor={a} selected={guide === a.id} onSelect={() => setGuide(a.id)} />
                  ))}
                  <GuideOption selected={guide === "any"} onSelect={() => setGuide("any")} initials="★" tone="bg-navy-100 text-navy-800" name="Any available advisor" focus="We'll match you with one of the three" />
                </div>
                <p className="mt-2 text-caption text-ink-muted">{ADVISOR_DISCLAIMER} AI-generated portraits — not real people, agents or licensed professionals.</p>
              </fieldset>
            )}
          </>
        )}

        {step === 3 && (
          <section aria-labelledby="review-title">
            <h2 id="review-title" className="text-heading text-navy-950">Review your session</h2>
            <dl className="mt-3 divide-y divide-ink/10 rounded-2xl bg-surface px-4 ring-1 ring-ink/[0.07]">
              {[
                ["Topic", topics.find((t) => t.id === topic)?.label],
                ["Format", format === "online" ? "Online video" : `In person · ${area}`],
                ["When", `${new Date(`${date}T00:00:00`).toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long" })} · ${time}`],
                ["Advisor", guide === "any" ? "Any available advisor" : findAdvisor(guide)?.name],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-3 text-body-sm">
                  <dt className="text-ink-muted">{k}</dt>
                  <dd className="text-right font-semibold text-navy-950">{v}</dd>
                </div>
              ))}
            </dl>
            <label className="mt-4 block">
              <span className="text-body-sm font-semibold text-navy-950">First name (optional)</span>
              <input value={name} onChange={(e) => setName(e.target.value.slice(0, 40))} className="ge-input mt-1" placeholder="How should we greet you?" autoComplete="given-name" />
            </label>
            <p className="mt-3 flex gap-2 rounded-xl bg-gold-50 px-4 py-3 text-caption text-gold-700">
              <Info size={16} className="shrink-0" aria-hidden /> {PROTOTYPE_NOTE}
            </p>
          </section>
        )}

        <div className="mt-6 flex gap-2.5">
          {step > 0 && (
            <button type="button" onClick={() => setStep(step - 1)} className="inline-flex h-14 items-center gap-1.5 rounded-full px-5 text-body-sm font-semibold text-navy-900 ring-1 ring-ink/15">
              <ArrowLeft size={16} aria-hidden /> Back
            </button>
          )}
          {step < 3 ? (
            <button type="button" disabled={!canNext} onClick={() => setStep(step + 1)} className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-crimson-600 text-body font-bold text-white disabled:bg-ink/15 disabled:text-ink-muted">
              Continue <ArrowRight size={18} aria-hidden />
            </button>
          ) : (
            <button type="button" onClick={confirm} className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-crimson-600 text-body font-bold text-white">
              Confirm simulated booking
            </button>
          )}
        </div>
        <p className="mt-4 text-caption text-ink-muted">
          Need real advice? Contact a licensed insurer, takaful operator or adviser directly.
        </p>
      </Container>
    </>
  );
}

function Choice({ selected, onSelect, icon: Icon, label, hint }: { selected: boolean; onSelect: () => void; icon: typeof Video; label: string; hint?: string }) {
  return (
    <button type="button" role="radio" aria-checked={selected} onClick={onSelect} className={cn("flex min-h-16 w-full items-center gap-3 rounded-2xl p-3.5 text-left ring-1 transition-colors", selected ? "bg-navy-900 text-white ring-navy-900" : "bg-surface text-navy-950 ring-ink/10 hover:ring-ink/25")}>
      <span className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-xl", selected ? "bg-white/15" : "bg-navy-50 text-navy-800")}>
        <Icon size={20} aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-body font-semibold">{label}</span>
        {hint && <span className={cn("block text-caption", selected ? "text-white/70" : "text-ink-muted")}>{hint}</span>}
      </span>
    </button>
  );
}

function GuideOption({ selected, onSelect, initials, tone, name, focus }: { selected: boolean; onSelect: () => void; initials: string; tone: string; name: string; focus: string }) {
  return (
    <button type="button" role="radio" aria-checked={selected} onClick={onSelect} className={cn("flex min-h-14 w-full items-center gap-3 rounded-2xl px-3 py-2 text-left ring-1", selected ? "bg-navy-50 ring-navy-900" : "bg-surface ring-ink/10")}>
      <span className={cn("inline-flex size-[52px] shrink-0 items-center justify-center rounded-full text-body font-bold", tone)} aria-hidden>{initials}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-body-sm font-semibold text-navy-950">{name}</span>
        <span className="block text-caption text-ink-muted">{focus}</span>
      </span>
      {selected && <Check size={18} className="text-navy-900" aria-hidden />}
    </button>
  );
}

function MySessions({ bookings, onNew }: { bookings: Booking[]; onNew: () => void }) {
  const cancel = (id: string) =>
    bookingStore.set({ bookings: bookingStore.get().bookings.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)) });
  return (
    <>
      <PageHero eyebrow="Guidance sessions · prototype" title="My sessions" text="Your simulated bookings on this device." backLabel="Guide" onBack={() => go("app/guide")} titleId="my-sessions-title" />
      <Container className="max-w-[40rem] pt-5">
        {bookings.length === 0 ? (
          <p className="rounded-2xl bg-surface p-6 text-center text-body-sm text-ink-muted ring-1 ring-ink/[0.07]">No sessions yet.</p>
        ) : (
          <ul className="grid gap-2.5">
            {bookings.map((b) => (
              <li key={b.id} className={cn("rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.07]", b.status === "cancelled" && "opacity-60")}>
                <div className="flex items-start justify-between gap-3">
                  {b.advisorId && findAdvisor(b.advisorId) && <AdvisorAvatar advisor={findAdvisor(b.advisorId)!} size={44} />}
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-semibold text-navy-950">{b.topic}</p>
                    <p className="text-caption text-ink-muted">
                      {new Date(`${b.date}T00:00:00`).toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short" })} · {b.time} · {b.area ?? "Online"} · {b.guide}
                    </p>
                    <p className="mt-1 font-mono text-caption text-navy-900">Ref {b.ref}</p>
                  </div>
                  <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold", b.status === "booked" ? "bg-success-50 text-success-700" : "bg-sunken text-ink-muted")}>
                    {b.status === "booked" ? "Booked (simulated)" : "Cancelled"}
                  </span>
                </div>
                {b.status === "booked" && (
                  <button type="button" onClick={() => cancel(b.id)} className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-body-sm font-semibold text-crimson-600">
                    <XCircle size={16} aria-hidden /> Cancel session
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        <button type="button" onClick={onNew} className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-crimson-600 text-body font-bold text-white">
          Book another session <ArrowRight size={18} aria-hidden />
        </button>
        <p className="mt-3 text-caption text-ink-muted">{PROTOTYPE_NOTE}</p>
      </Container>
    </>
  );
}
