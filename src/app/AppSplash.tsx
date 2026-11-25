import { useEffect } from "react";

/** Minimum time the brand reveal stays visible, measured from the first paint of the page. */
const MIN_VISIBLE_MS = 700;
/** Never hold the app longer than this, even if fonts are slow or fail. */
const MAX_VISIBLE_MS = 2200;

/**
 * Dismisses the opening splash painted by index.html (#ge-boot) once the app has mounted and
 * web fonts are ready. Shown once per session; if anything fails, the cap removes it.
 */
export function AppSplash() {
  useEffect(() => {
    const el = document.getElementById("ge-boot");
    if (!el) return;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      try {
        sessionStorage.setItem("ge-splash-seen", "1");
      } catch {
        /* ignore */
      }
      el.setAttribute("data-done", "");
      window.setTimeout(() => el.remove(), 450);
    };
    const elapsed = performance.now();
    const fonts = (document.fonts?.ready ?? Promise.resolve()).catch(() => undefined);
    const minWait = new Promise((r) => setTimeout(r, Math.max(0, MIN_VISIBLE_MS - elapsed)));
    Promise.all([fonts, minWait]).then(finish);
    const cap = window.setTimeout(finish, Math.max(0, MAX_VISIBLE_MS - elapsed));
    return () => window.clearTimeout(cap);
  }, []);
  return null;
}
