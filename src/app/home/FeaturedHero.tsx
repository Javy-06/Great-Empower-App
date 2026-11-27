import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Container } from "@/components/layout/Editorial";
import { cn } from "@/lib/cn";
import { mediAsasStory, NEWS_HASH_PREFIX } from "@/data/news";

const AUTO_ADVANCE_MS = 6500;
/** After a manual interaction, wait this long before auto-advancing again. */
const RESUME_AFTER_MS = 12000;
const SWIPE_MIN_PX = 48;

type Slide = {
  id: string;
  label: string;
  eyebrow: string;
  title: ReactNode;
  text: string;
  cta: string;
  onAction: () => void;
  media:
    | { kind: "photo"; src: string; alt: string; position: string; desktopPosition: string }
    | { kind: "infographic" };
  extra?: ReactNode;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
  );
  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return;
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function usePageHidden() {
  const [hidden, setHidden] = useState(() => document.visibilityState === "hidden");
  useEffect(() => {
    const onChange = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);
  return hidden;
}

/**
 * Featured hero: three cross-fading slides. Auto-advances every 6.5 s; pauses while hovered or
 * focused, when the tab is hidden, after any manual interaction (temporarily) or when the user
 * presses pause. With reduced motion, it never auto-advances and changes instantly.
 */
export function FeaturedHero({
  greeting,
  profileName,
  onContinue,
  onBookSession,
}: {
  greeting: string;
  /** Optional: new accounts may not have a name. */
  profileName?: string;
  onContinue: () => void;
  /** Opens the existing Guidance Sessions booking flow. */
  onBookSession: () => void;
}) {
  const story = mediAsasStory;

  const slides: Slide[] = [
    {
      id: "welcome",
      label: "Welcome",
      eyebrow: "Your financial journey",
      title: (
        <>
          {profileName ? (
            <>
              {greeting},
              <br />
              {profileName}.
            </>
          ) : (
            <>{greeting}.</>
          )}
        </>
      ),
      text: "Small steps today. More confidence tomorrow.",
      cta: "Continue learning",
      onAction: onContinue,
      media: {
        kind: "photo",
        src: "/images/pexels/young-friends-cafe-community.webp",
        alt: "Three young friends at a café table, looking at a phone together.",
        position: "48% 28%",
        desktopPosition: "40% 35%",
      },
    },
    {
      id: "mediasas",
      label: "MediAsas",
      eyebrow: "Featured · Medical protection",
      title: "A new chapter in medical protection.",
      text: "Discover what Malaysia's upcoming MediAsas plan means for medical protection and healthcare financing.",
      cta: "Explore MediAsas",
      onAction: () => {
        window.location.hash = `${NEWS_HASH_PREFIX}${story.id}`;
        window.scrollTo({ top: 0 });
      },
      media: { kind: "infographic" },
    },
    {
      id: "advisor",
      label: "Book an advisor",
      eyebrow: "Guidance sessions · Fictional demo advisor",
      title: "Book an Advisor for Guidance",
      text: "Get guidance to better understand financial protection.",
      cta: "Book a Session",
      onAction: onBookSession,
      media: {
        kind: "photo",
        src: "/advisor/web/advisor-malay-woman-1280.webp",
        alt: "Farah Nadia, a fictional demonstration advisor (AI-generated portrait).",
        position: "50% 18%",
        desktopPosition: "50% 22%",
      },
    },
  ];
  const count = slides.length;

  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [holdUntil, setHoldUntil] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const pageHidden = usePageHidden();
  const touch = useRef<{ x: number; y: number } | null>(null);

  const autoplayEnabled = !userPaused && !reducedMotion;
  const running = autoplayEnabled && !pageHidden && !hovering && !focusWithin;

  useEffect(() => {
    if (!running) return;
    const delay = Math.max(AUTO_ADVANCE_MS, holdUntil - Date.now());
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), delay);
    return () => window.clearTimeout(timer);
  }, [running, index, holdUntil, count]);

  const goTo = (next: number) => {
    setIndex(((next % count) + count) % count);
    setHoldUntil(Date.now() + RESUME_AFTER_MS);
  };

  const held = holdUntil > Date.now();

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      onPointerEnter={(event) => event.pointerType === "mouse" && setHovering(true)}
      onPointerLeave={(event) => event.pointerType === "mouse" && setHovering(false)}
      onFocus={() => setFocusWithin(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setFocusWithin(false);
      }}
      className="ge-hero relative isolate overflow-hidden text-white"
    >
      <h1 className="sr-only">GREAT EMPOWER — Home</h1>

      {/* Slides share one grid cell: the hero is as tall as its tallest TEXT block. Images are
          absolutely positioned, cropped and masked, so they never set the height. */}
      <div
        className="grid touch-pan-y"
        aria-live={running ? "off" : "polite"}
        onTouchStart={(event) => {
          const t = event.touches[0];
          touch.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchEnd={(event) => {
          const start = touch.current;
          touch.current = null;
          if (!start) return;
          const t = event.changedTouches[0];
          const dx = t.clientX - start.x;
          const dy = t.clientY - start.y;
          if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy) * 1.4) return;
          goTo(dx < 0 ? index + 1 : index - 1);
        }}
      >
        {slides.map((slide, i) => {
          const active = i === index;
          const media = slide.media;
          const isInfographic = media.kind === "infographic";
          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}: ${slide.label}`}
              aria-hidden={!active}
              inert={!active}
              data-active={active}
              className="ge-slide relative col-start-1 row-start-1 isolate"
              style={{ opacity: active ? 1 : 0, visibility: active ? "visible" : "hidden" }}
            >
              <div
                className={cn(
                  "ge-hero-art pointer-events-none absolute -z-10",
                  isInfographic ? "ge-hero-art--infographic" : "",
                )}
                aria-hidden
              >
                <img
                  src={media.kind === "photo" ? media.src : story.infographic.inline}
                  alt=""
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  decoding="async"
                  className="h-full w-full object-cover"
                  style={{
                    objectPosition:
                      media.kind === "photo" ? media.position : "50% 40%",
                  }}
                />
              </div>
              {/* Bottom of the hero dissolves into the page, as in the homepage reference. */}
              <div className="ge-hero-fade pointer-events-none absolute inset-x-0 bottom-0 -z-[5]" aria-hidden />

              <Container className="ge-slide-text pb-24 pt-6 sm:pt-9 md:pb-28 md:pt-14">
                <div className="max-w-[63%] sm:max-w-[26rem] md:max-w-[30rem]">
                  <p className="text-overline uppercase tracking-[0.22em] text-teal-200">
                    {slide.eyebrow}
                  </p>
                  <h2 className="mt-2 font-brand text-[2.25rem] font-semibold leading-[1] tracking-[-0.015em] text-white sm:text-[2.875rem] md:text-[3.5rem] lg:text-[4rem]">
                    {slide.title}
                  </h2>
                  <p className="mt-3 text-body-sm leading-relaxed text-white/85 sm:text-body">
                    {slide.text}
                  </p>
                  <button
                    type="button"
                    onClick={slide.onAction}
                    className="group mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-crimson-600 pl-5 pr-4 text-body font-semibold text-white shadow-[0_8px_20px_-8px_rgb(200_16_46/0.7)] transition-colors hover:bg-crimson-700"
                  >
                    {slide.cta}
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </button>
                </div>
              </Container>
            </div>
          );
        })}
      </div>

      {/* Pager inside the hero, on navy */}
      <div className="absolute inset-x-0 bottom-1 z-10 flex items-center justify-center gap-0.5 text-navy-900">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          aria-label="Previous featured story"
          className="inline-flex size-11 items-center justify-center rounded-full text-navy-900/70 hover:bg-navy-900/5 hover:text-navy-900"
        >
          <ChevronLeft size={18} aria-hidden />
        </button>
        <div className="flex items-center" role="group" aria-label="Choose a featured story">
          {slides.map((slide, i) => {
            const active = i === index;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show ${slide.label}`}
                aria-current={active ? "true" : undefined}
                className="group inline-flex h-11 min-w-11 items-center justify-center"
              >
                <span
                  className={cn(
                    "block h-2 rounded-full transition-all duration-300",
                    active ? "w-6 bg-navy-900" : "w-2 bg-navy-900/25 group-hover:bg-navy-900/50",
                  )}
                />
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          aria-label="Next featured story"
          className="inline-flex size-11 items-center justify-center rounded-full text-navy-900/70 hover:bg-navy-900/5 hover:text-navy-900"
        >
          <ChevronRight size={18} aria-hidden />
        </button>
        {!reducedMotion && (
          <button
            type="button"
            onClick={() => setUserPaused((paused) => !paused)}
            aria-label={userPaused ? "Play featured stories" : "Pause featured stories"}
            aria-pressed={userPaused}
            className="absolute right-3 inline-flex size-11 items-center justify-center rounded-full text-navy-900/60 hover:bg-navy-900/5 hover:text-navy-900"
          >
            {userPaused ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}
          </button>
        )}
      </div>
    </section>
  );
}
