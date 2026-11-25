import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

/**
 * Isolated, full-screen shell for the game ("app-in-app"). It deliberately shares nothing visual
 * with the GREAT EMPOWER app shell: no brand header, no bottom navigation, its own atmosphere.
 *
 * Integration slot: pass the game as `children` and, optionally, its own navigation as `nav`.
 * Until the new LifeTrack build is connected, the shell shows a neutral title screen.
 */
export function GameShell({
  onExit,
  title = "LifeTrack",
  children,
  nav,
}: {
  onExit: () => void;
  title?: string;
  children?: ReactNode;
  nav?: ReactNode;
}) {
  const exitRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} · GREAT EMPOWER`;
    exitRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onExit();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.title = previousTitle;
      window.removeEventListener("keydown", onKey);
    };
  }, [onExit, title]);

  return (
    <div
      aria-label={`${title} game`}
      className="ge-game-shell fixed inset-0 z-[70] flex flex-col overflow-hidden text-white"
    >
      {/* Atmosphere: the game's own key art, blurred into a backdrop */}
      <div className="ge-game-backdrop absolute inset-0 -z-10" aria-hidden />

      <header className="flex items-center justify-between gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
        <button
          ref={exitRef}
          type="button"
          onClick={onExit}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-black/30 pl-3 pr-4 text-body-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-black/45"
        >
          <X size={18} aria-hidden />
          Back to GREAT EMPOWER
        </button>
        <span className="ge-game-wordmark text-body-sm font-extrabold uppercase tracking-[0.18em]">
          {title}
        </span>
      </header>

      <main className="ge-game-enter relative min-h-0 flex-1 overflow-y-auto">
        {children ?? <GameTitleScreen onExit={onExit} />}
      </main>

      {nav && (
        <nav aria-label={`${title} navigation`} className="pb-[env(safe-area-inset-bottom)]">
          {nav}
        </nav>
      )}
    </div>
  );
}

/** Placeholder title screen shown until the new game build is mounted in the shell. */
function GameTitleScreen({ onExit }: { onExit: () => void }) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-[34rem] flex-col items-center justify-center gap-6 px-5 py-8 text-center">
      <picture className="block w-full">
        <source
          type="image/webp"
          srcSet="/images/lifetrack/lifetrack-cover-960.webp 960w, /images/lifetrack/lifetrack-cover-1600.webp 1600w"
          sizes="(min-width: 640px) 544px, 100vw"
        />
        <img
          src="/images/lifetrack/lifetrack-cover-960.webp"
          alt="LifeTrack: four young adults gather around a city board game with dice and coins."
          width={1600}
          height={1195}
          className="h-auto w-full rounded-[1.5rem] shadow-[0_30px_80px_-20px_rgb(0_0_0/0.7)] ring-1 ring-white/15"
        />
      </picture>
      <div>
        <p className="text-body font-semibold text-white">The new LifeTrack is on its way.</p>
        <p className="mt-1 text-body-sm text-white/70">
          This space is reserved for the full game experience.
        </p>
      </div>
      <button
        type="button"
        onClick={onExit}
        className="inline-flex h-12 items-center rounded-full bg-white px-6 text-body font-semibold text-[#0b2a1f] transition-colors hover:bg-white/90"
      >
        Return to Home
      </button>
    </div>
  );
}
