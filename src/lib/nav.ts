/**
 * History-aware back navigation for hash routes. If the user arrived here by navigating inside
 * the app, go back to where they came from; on a direct visit (deep link, new tab) fall back to
 * a sensible in-app route instead of leaving the site.
 */
let navigatedInApp = false;
if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => {
    navigatedInApp = true;
  });
}

export function goBack(fallbackHash: string) {
  if (navigatedInApp && window.history.length > 1) {
    window.history.back();
  } else {
    window.location.hash = fallbackHash;
    window.scrollTo({ top: 0 });
  }
}
