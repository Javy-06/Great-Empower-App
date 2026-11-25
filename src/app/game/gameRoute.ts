/**
 * The game is an app-in-app: it lives on its own route and is rendered by the application in an
 * isolated full-screen shell, never inside the standard header / bottom-navigation layout.
 */
export const GAME_HASH = "app/play/lifetrack";

/** Route used by the retired in-page game; kept only so old links land in the new shell. */
export const LEGACY_GAME_HASH = "app/simulate/lifetrack";

let returnTo = "app/home";
let returnScrollY = 0;

/** Enter the game from anywhere in the app, remembering where to come back to. */
export function openGame() {
  const current = window.location.hash.replace(/^#/, "");
  if (current && current !== GAME_HASH) returnTo = current;
  returnScrollY = window.scrollY;
  window.location.hash = GAME_HASH;
}

/** Leave the game and return to where the player came from (Home by default). No reload. */
export function exitGame() {
  window.location.hash = returnTo || "app/home";
}

export const gameReturnScroll = () => returnScrollY;
