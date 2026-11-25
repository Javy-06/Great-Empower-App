import { useEffect, useState } from "react";

/**
 * App entry: a brief brand reveal that stays only while real initialisation is happening
 * (web fonts loading), capped so it never blocks the app. No artificial delay; shown once
 * per session.
 */
export function AppSplash() {
  const [done, setDone] = useState(() => sessionStorage.getItem("ge-splash-seen") === "1");
  const [gone, setGone] = useState(done);

  useEffect(() => {
    if (done) return;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      sessionStorage.setItem("ge-splash-seen", "1");
      setDone(true);
      window.setTimeout(() => setGone(true), 400);
    };
    const cap = window.setTimeout(finish, 1500);
    (document.fonts?.ready ?? Promise.resolve()).then(finish);
    return () => window.clearTimeout(cap);
  }, [done]);

  if (gone) return null;
  return (
    <div
      className="ge-splash fixed inset-0 z-[90] flex items-center justify-center bg-navy-950"
      data-done={done}
      aria-hidden
    >
      <div className="ge-splash-mark flex flex-col items-center gap-5">
        <img
          src="/images/great-empower-horizontal-white.png"
          alt=""
          width={220}
          className="h-auto w-[220px]"
        />
        <span className="h-0.5 w-16 overflow-hidden rounded-full bg-white/15">
          <span className="block h-full w-1/2 animate-pulse rounded-full bg-crimson-500" />
        </span>
      </div>
    </div>
  );
}
