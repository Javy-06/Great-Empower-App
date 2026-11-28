/**
 * Auto Demo driver: operates the REAL app running in the presentation's phone (a same-origin
 * iframe) the way a person would: find by role + accessible name or by label, highlight, click,
 * type, choose, slide. No app logic is duplicated or bypassed; every action is a UI event.
 *
 * Every wait goes through the runner's `Pace`, so Pause holds the next action, Skip waiting
 * finishes the current wait immediately, and jumping elsewhere cancels the action in progress.
 */
export class Cancelled extends Error {
  constructor() {
    super("cancelled");
  }
}

export interface Pace {
  /** Resolves when the demo is allowed to act (not paused / manual); throws Cancelled. */
  gate(): Promise<void>;
  /** A pause-aware wait that Skip waiting ends early; throws Cancelled. */
  sleep(ms: number): Promise<void>;
  /** True while Skip waiting is fast-forwarding the current step. */
  readonly hurry: boolean;
}

export type Target =
  | string
  | {
      css?: string;
      role?: "button" | "link" | "radio" | "checkbox" | "tab" | "field" | "range";
      name?: string | RegExp;
      within?: string;
    };

const ROLE_SELECTORS: Record<string, string> = {
  button: "button, [role=button]",
  link: "a[href]",
  radio: "[role=radio], input[type=radio]",
  checkbox: "[role=checkbox], input[type=checkbox]",
  tab: "[role=tab]",
  field: "input:not([type=hidden]):not([type=range]), textarea, select",
  range: "input[type=range]",
};

const norm = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();

const SPOT_CSS = `
[data-ge-spot]{outline:3px solid #C8102E !important;outline-offset:3px;border-radius:14px;box-shadow:0 0 0 8px rgb(200 16 46 / .16) !important;transition:outline-color .2s, box-shadow .2s}
@media (prefers-reduced-motion: no-preference){[data-ge-spot]{animation:ge-spot-pulse 1.2s ease-in-out infinite}}
@keyframes ge-spot-pulse{0%,100%{box-shadow:0 0 0 6px rgb(200 16 46 / .12)}50%{box-shadow:0 0 0 12px rgb(200 16 46 / .04)}}
`;

export class Driver {
  constructor(
    private frame: () => HTMLIFrameElement | null,
    private pace: Pace,
  ) {}

  get win(): Window {
    const w = this.frame()?.contentWindow;
    if (!w) throw new Error("The phone isn't ready yet.");
    return w;
  }
  get doc(): Document {
    return this.win.document;
  }
  get hash() {
    return this.win.location.hash.replace(/^#/, "").split("?")[0];
  }

  /* ------------------------------------------------------------------ finding */

  private accessibleName(el: Element): string {
    const aria = el.getAttribute("aria-label");
    if (aria) return norm(aria);
    const by = el.getAttribute("aria-labelledby");
    if (by) return norm(by.split(/\s+/).map((id) => this.doc.getElementById(id)?.textContent).join(" "));
    const labels = (el as HTMLInputElement).labels;
    if (labels && labels.length) return norm([...labels].map((l) => l.textContent).join(" "));
    return norm(el.textContent);
  }

  private visible(el: Element) {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && this.win.getComputedStyle(el).visibility !== "hidden";
  }

  /** The first visible element matching the target, or null. */
  query(t: Target): HTMLElement | null {
    const d = this.doc;
    if (typeof t === "string") return [...d.querySelectorAll<HTMLElement>(t)].find((e) => this.visible(e)) ?? null;
    const scope: ParentNode = t.within ? d.querySelector(t.within) ?? d : d;
    const selector = t.css ?? (t.role ? ROLE_SELECTORS[t.role] : "*");
    const all = [...scope.querySelectorAll<HTMLElement>(selector)].filter((e) => this.visible(e));
    if (!t.name) return all[0] ?? null;
    const test = (s: string) => (typeof t.name === "string" ? s === t.name || s.startsWith(t.name) : t.name!.test(s));
    return all.find((e) => test(this.accessibleName(e))) ?? null;
  }

  async find(t: Target, timeout = 8000): Promise<HTMLElement> {
    let waited = 0;
    for (;;) {
      await this.pace.gate();
      const el = this.query(t);
      if (el) return el;
      if (waited >= timeout) throw new Error(`Couldn't find ${typeof t === "string" ? t : JSON.stringify({ ...t, name: String(t.name ?? "") })} on this screen.`);
      await new Promise((r) => setTimeout(r, 120));
      waited += 120;
    }
  }

  has(t: Target) {
    try {
      return Boolean(this.query(t));
    } catch {
      return false;
    }
  }

  /* ------------------------------------------------------------------ showing */

  private ensureSpotStyle() {
    if (this.doc.getElementById("ge-spot-style")) return;
    const s = this.doc.createElement("style");
    s.id = "ge-spot-style";
    s.textContent = SPOT_CSS;
    this.doc.head.appendChild(s);
  }

  clearSpot() {
    try {
      this.doc.querySelectorAll("[data-ge-spot]").forEach((e) => e.removeAttribute("data-ge-spot"));
    } catch {
      /* frame reloading */
    }
  }

  /** Scroll an element into view and highlight it (the "look here" moment). */
  async show(t: Target, hold = 0) {
    const el = await this.find(t);
    this.ensureSpotStyle();
    this.clearSpot();
    el.setAttribute("data-ge-spot", "");
    el.scrollIntoView({ block: "center", behavior: this.pace.hurry ? "auto" : "smooth" });
    await this.pace.sleep(450);
    if (hold) await this.pace.sleep(hold);
    return el;
  }

  /* ------------------------------------------------------------------ acting */

  /** Open an app route (only if not already there) and wait for the screen. */
  async navigate(hash: string) {
    await this.pace.gate();
    this.clearSpot();
    if (this.hash !== hash) {
      this.win.location.hash = hash;
      this.win.scrollTo({ top: 0 });
    }
    await this.find("main h1");
    await this.pace.sleep(500);
  }

  async click(t: Target) {
    const el = await this.show(t);
    await this.pace.sleep(300);
    await this.pace.gate();
    el.click();
    await this.pace.sleep(350);
  }

  /** Click only if the element exists (optional UI, e.g. a resume button). */
  async clickIf(t: Target) {
    if (this.has(t)) await this.click(t);
  }

  /** Type into a text field or textarea the way React expects (native setter + input event). */
  async type(t: Target, value: string) {
    const el = (await this.show(t)) as HTMLInputElement | HTMLTextAreaElement;
    await this.pace.gate();
    el.focus();
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value")!.set!;
    const put = (v: string) => {
      setter.call(el, v);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    };
    if (el.type === "date") {
      put(value);
    } else {
      put("");
      for (let i = 1; i <= value.length; i++) {
        if (!this.pace.hurry) await this.pace.sleep(26);
        else await this.pace.gate();
        put(value.slice(0, i));
      }
    }
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.blur();
    await this.pace.sleep(200);
  }

  async select(t: Target, value: string) {
    const el = (await this.show(t)) as HTMLSelectElement;
    await this.pace.gate();
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value")!.set!;
    setter.call(el, value);
    el.dispatchEvent(new Event("change", { bubbles: true }));
    await this.pace.sleep(250);
  }

  /** Move a range slider to a value, in a few visible steps. */
  async slide(t: Target, value: number) {
    const el = (await this.show(t)) as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value")!.set!;
    const from = Number(el.value);
    const steps = this.pace.hurry ? 1 : 6;
    for (let i = 1; i <= steps; i++) {
      await this.pace.gate();
      const v = from + ((value - from) * i) / steps;
      setter.call(el, String(Math.round(v / Number(el.step || 1)) * Number(el.step || 1)));
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      if (i < steps) await this.pace.sleep(90);
    }
    await this.pace.sleep(250);
  }

  /** Set a role=checkbox / role=radio (or native) to the wanted state by clicking if needed. */
  async setChecked(t: Target, on = true) {
    const el = await this.show(t);
    const checked = el.getAttribute("aria-checked") === "true" || el.getAttribute("aria-pressed") === "true" || (el as HTMLInputElement).checked === true;
    if (checked !== on) {
      await this.pace.gate();
      el.click();
      await this.pace.sleep(300);
    }
  }

  /** Start the page's video muted (browsers allow muted autoplay). */
  async playVideo() {
    const v = (await this.show("video")) as HTMLVideoElement;
    await this.pace.gate();
    v.muted = true;
    await v.play().catch(() => undefined);
  }

  /** A pause-aware presentation wait (Skip waiting ends it). */
  async wait(ms: number) {
    await this.pace.sleep(ms);
  }

  pauseVideo() {
    try {
      this.doc.querySelectorAll("video").forEach((v) => v.pause());
    } catch {
      /* ignore */
    }
  }
}
