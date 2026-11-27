import { test as base, expect, type Page } from "@playwright/test";
import { routes } from "../../scripts/qa/routes.mjs";

export { routes };

/** Fixed clock so greetings ("Good afternoon") and dates render the same on every run. */
const FIXED_NOW = new Date("2026-11-27T14:00:00+08:00");

type Problems = { console: string[]; failed: string[]; hosts: Set<string> };

export const test = base.extend<{ problems: Problems; signedIn: Page }>({
  problems: async ({ page }, use) => {
    const p: Problems = { console: [], failed: [], hosts: new Set() };
    page.on("console", (m) => { if (m.type() === "error") p.console.push(m.text().slice(0, 200)); });
    page.on("pageerror", (e) => p.console.push(`exception: ${e.message.slice(0, 200)}`));
    page.on("request", (r) => { try { const h = new URL(r.url()).host; if (!h.startsWith("127.0.0.1")) p.hosts.add(h); } catch {} });
    page.on("requestfailed", (r) => { const err = r.failure()?.errorText ?? ""; if (!/ERR_ABORTED/.test(err)) p.failed.push(`${err} ${r.url()}`); });
    page.on("response", (r) => { if (r.status() >= 400) p.failed.push(`${r.status()} ${r.url()}`); });
    await use(p);
  },
  /** A page signed in to the local (device-only) demo account. */
  signedIn: async ({ page }, use) => {
    await page.clock.setFixedTime(FIXED_NOW);
    await page.addInitScript(() => sessionStorage.setItem("ge-splash-seen", "1"));
    await page.goto("/#app/home", { waitUntil: "domcontentloaded" });
    const demo = page.getByRole("button", { name: /Demo Account/i });
    if (await demo.isVisible().catch(() => false)) await demo.click();
    await expect(page.locator("main h1")).toBeVisible();
    await use(page);
  },
});

export { expect };

export async function go(page: Page, hash: string) {
  await page.evaluate((h) => { location.hash = h; }, hash);
  await page.waitForFunction((h) => location.hash === `#${h}`, hash);
  await page.locator("h1").first().waitFor({ state: "attached" });
  await page.waitForTimeout(400); // let route transitions settle
  await page.evaluate(() => window.scrollTo(0, 0));
}

export function expectClean(problems: Problems) {
  expect(problems.console, "console errors").toEqual([]);
  expect(problems.failed, "failed requests").toEqual([]);
  expect([...problems.hosts].filter((h) => h.includes("supabase")), "Supabase traffic in device-only mode").toEqual([]);
}
