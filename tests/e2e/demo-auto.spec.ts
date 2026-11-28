// Presentation Auto Demo: the full walkthrough, every Feature Auto Demo, presenter controls,
// keyboard, phone layout, repeatability and storage isolation. Runs against the device-only build;
// `autospeed` scales every presentation wait so the whole script runs in about a minute.
import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { features } from "../../src/demo/presentation/auto/script";

const FAST = "/?demo=present&autospeed=0.05";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("ge-splash-seen", "1"));
});

const status = (page: Page) => page.getByTestId("auto-status");
const phoneHash = (page: Page) => page.locator("iframe").first().evaluate((f: HTMLIFrameElement) => f.contentWindow!.location.hash.slice(1));
const demo = <T,>(page: Page, key: string) =>
  page.evaluate((k) => JSON.parse(localStorage.getItem(`${k}::ge-demo-showcase`) ?? "null"), key) as Promise<T>;

/** Wait until the Auto Demo completes, continuing past the presenter-only LifeTrack prompt. */
async function runToEnd(page: Page, timeout = 150_000) {
  const end = Date.now() + timeout;
  for (;;) {
    const s = (await status(page).innerText()).toLowerCase();
    if (s.includes("completed")) return;
    if (s.includes("paused")) {
      const bar = page.getByTestId("auto-bar");
      await expect(bar.getByText(/Couldn't finish/)).toHaveCount(0); // a stuck step would fail here
      const cont = bar.getByRole("button", { name: "Continue" });
      if (await cont.isVisible()) await cont.click();
    }
    if (Date.now() > end) throw new Error("Auto Demo did not finish in time");
    await page.waitForTimeout(250);
  }
}

test("full auto demo: every feature runs in the live app and leaves the right results", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-1280", "the full walkthrough runs once, at presentation size");
  test.setTimeout(240_000);
  const external: string[] = [];
  page.on("request", (r) => {
    const h = new URL(r.url()).host;
    if (!h.startsWith("127.0.0.1") && !/fonts\.(googleapis|gstatic)\.com/.test(h)) external.push(h);
  });
  await page.goto(FAST);
  await expect(status(page)).toHaveText(/Ready/i);
  await page.getByRole("button", { name: /Start Auto Demo/ }).click();
  await expect(status(page)).toHaveText(/Playing/i);
  // The explanation panel follows the feature being demonstrated.
  await expect(page.locator("h1")).toHaveText("Learn", { timeout: 30_000 });
  await runToEnd(page);
  await expect(page.locator("h1")).toHaveText("Impact");
  await expect(page.getByTestId("closing")).toContainText("Learn. Understand. Protect. Empower.");
  await expect(page.getByRole("progressbar", { name: "Auto Demo progress" })).toHaveAttribute("aria-valuenow", await page.getByRole("progressbar", { name: "Auto Demo progress" }).getAttribute("aria-valuemax") ?? "");

  // Results of the real interactions, in the isolated demo data only.
  const learn = await demo<{ completed: string[] }>(page, "ge-learn-v1");
  expect(learn.completed).toContain("how-insurance-works-in-malaysia");
  const rewards = await demo<{ points: number; vouchers: Array<{ productId: string }>; transactions: Array<{ title: string }> }>(page, "ge-rewards-v2");
  // +40 for the video, +100 for completing the protection profile in the check, −1,000 for the voucher.
  expect(rewards.points).toBe(2450 + 40 + 100 - 1000);
  expect(rewards.transactions.map((t) => t.title)).toEqual(expect.arrayContaining(["Watched a video lesson", "Completed your protection profile", "Great Empower RM10 Voucher"]));
  expect(rewards.vouchers.map((v) => v.productId)).toContain("gev-rm10");
  const apps = await demo<{ byArea: Record<string, { status: string; details: { fullName: string; email: string } }> }>(page, "ge-applications-v1");
  expect(apps.byArea.medical.status).toBe("completed");
  expect(apps.byArea.medical.details).toMatchObject({ fullName: "Aisyah Rahman", email: "demo@example.com" });
  const adviser = await demo<{ saved: Array<{ fullName: string; topics: string[]; time: string; notes: string; preferredDate: string; method: string }> }>(page, "ge-adviser-requests-v1");
  expect(adviser.saved[0]).toMatchObject({ fullName: "Aisyah Rahman", topics: ["medical"], time: "afternoon", method: "phone", notes: "I would like to understand my medical coverage options." });
  expect(adviser.saved[0].preferredDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  const profile = await demo<{ priorities: string[]; coverage: Record<string, string> }>(page, "ge-profile-v1");
  expect(profile.coverage).toMatchObject({ medical: "yes", critical: "no", life: "not-sure", accident: "no" });
  // Nothing left the device (no insurer, adviser, merchant or LifeTrack request).
  expect([...new Set(external)]).toEqual([]);
});

for (const f of features) {
  test(`feature auto demo: ${f.id}`, async ({ page }, info) => {
    test.skip(info.project.name !== "desktop-1280", "feature walkthroughs run at presentation size");
    test.setTimeout(120_000);
    await page.goto(FAST);
    await page.getByTestId("auto-bar").getByRole("button", { name: "Auto demo a feature" }).click();
    await page.getByRole("menuitem", { name: new RegExp(`^${f.title}`) }).click();
    await expect(status(page)).toHaveText(/Playing|Paused|Completed/i);
    await runToEnd(page);
    const phone = page.frameLocator("iframe");
    const hash = await phoneHash(page);
    // Each feature ends on its own result screen.
    const expectations: Record<string, () => Promise<void>> = {
      home: async () => expect(hash).toBe("app/home"),
      problem: async () => expect(hash).toBe("app/learn/protection"),
      learn: async () => {
        await expect(phone.locator("[data-demo=lesson-complete]")).toContainText("+40 pts earned");
        await expect(phone.getByRole("button", { name: /^Rewards Hub, 2,490 points/ })).toBeVisible();
      },
      check: async () => {
        expect(hash).toBe("app/protect");
        await expect(phone.locator("#protect-gaps").getByRole("button", { name: /^Critical illness\s*: Gap/ })).toBeVisible();
      },
      gap: async () => expect(hash).toBe("app/learn/protection/critical-illness"),
      how: async () => expect(hash).toBe("app/learn/protection/personal-accident"),
      compare: async () => await expect(phone.getByRole("table", { name: "Product comparison" })).toBeVisible(),
      "get-cover": async () => {
        expect(hash).toBe("app/protect/apply/medical/done");
        await expect(phone.locator("dt", { hasText: "Sent to an insurer" }).locator("xpath=following-sibling::dd")).toHaveText("No");
      },
      adviser: async () => {
        expect(hash).toBe("app/protect/adviser/done");
        await expect(phone.locator("h1")).toHaveText("Demo request submitted.");
        await expect(phone.locator("main")).toContainText("No real adviser booking or notification has been created");
      },
      simulate: async () => {
        await expect(phone.locator("#tool-ci [aria-live=polite]")).toContainText("RM");
      },
      rewards: async () => {
        expect(hash).toBe("app/rewards/wallet");
        await expect(phone.getByRole("button", { name: /^Rewards Hub, 1,450 points/ })).toBeVisible();
        await expect(phone.locator("main")).toContainText("Great Empower RM10 Voucher");
      },
      lifetrack: async () => expect(hash).toBe("app/home"),
      impact: async () => expect(hash).toBe("app/home"),
    };
    await expectations[f.id]();
  });
}

test("controls: pause holds everything, manual control, return, next/previous, restart, stop", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-1280", "desktop controls");
  test.setTimeout(150_000);
  await page.goto("/?demo=present&autospeed=0.4");
  await page.getByRole("button", { name: /Start Auto Demo/ }).click();
  const now = page.getByTestId("auto-now");
  const bar = page.getByTestId("auto-bar");
  await expect(now).toContainText("Home");

  // Pause: no navigation, no actions, no progress while paused.
  await bar.getByRole("button", { name: "Pause" }).click();
  await expect(status(page)).toHaveText(/Paused/i);
  const caption = await now.innerText();
  const hash = await phoneHash(page);
  await page.waitForTimeout(2500);
  expect(await now.innerText()).toBe(caption);
  expect(await phoneHash(page)).toBe(hash);
  // The presenter can still use the app while paused.
  await page.frameLocator("iframe").getByRole("navigation", { name: "Primary" }).getByRole("button", { name: "Guide", exact: true }).click();
  await expect.poll(() => phoneHash(page)).toBe("app/guide");
  await page.waitForTimeout(800);
  expect(await phoneHash(page)).toBe("app/guide");

  // Resume continues; Skip waiting moves on without the hold.
  await bar.getByRole("button", { name: "Resume" }).click();
  await expect(status(page)).toHaveText(/Playing/i);
  await bar.getByRole("button", { name: "Skip waiting" }).click();
  await expect(now).not.toHaveText(caption);

  // Next / previous feature (the explanation follows).
  await bar.getByRole("button", { name: "Next feature" }).click();
  await expect(now).toContainText("The problem");
  await expect(page.locator("h1")).toHaveText("The youth protection gap");
  await bar.getByRole("button", { name: "Next feature" }).click();
  await expect(now).toContainText("Learn");
  await bar.getByRole("button", { name: "Previous feature" }).click();
  await expect(now).toContainText("The problem");

  // Take manual control: automation stops touching the app until the presenter returns.
  await bar.getByRole("button", { name: "Take manual control" }).click();
  await expect(status(page)).toHaveText(/Manual control/i);
  await page.frameLocator("iframe").getByRole("navigation", { name: "Primary" }).getByRole("button", { name: "Simulate", exact: true }).click();
  await page.waitForTimeout(1500);
  expect(await phoneHash(page)).toBe("app/simulate");
  await bar.getByRole("button", { name: "Return to Auto Demo" }).click();
  await expect(status(page)).toHaveText(/Playing/i);
  await expect.poll(() => phoneHash(page)).toBe("app/learn/protection");

  // Topic navigator jumps the Auto Demo to that feature.
  await page.getByRole("navigation", { name: "Presentation topics" }).filter({ visible: true }).getByRole("button", { name: /^11/ }).click();
  await expect(now).toContainText("Rewards");
  await expect(page.locator("h1")).toHaveText("Rewards");

  // Restart current feature, restart the full demo, then stop.
  await bar.getByRole("button", { name: "Restart current feature" }).click();
  await expect(now).toContainText("Users earn points");
  await bar.getByRole("button", { name: "Restart full demo" }).click();
  await expect(now).toContainText("Home");
  await bar.getByRole("button", { name: "Stop Auto Demo" }).click();
  await expect(status(page)).toHaveText(/Ready/i);
  await expect(page.getByRole("button", { name: /Start Auto Demo/ })).toBeVisible();
  // Free exploration afterwards: the phone stays wherever the presenter takes it.
  await page.frameLocator("iframe").getByRole("navigation", { name: "Primary" }).getByRole("button", { name: "Learn", exact: true }).click();
  await page.waitForTimeout(1200);
  expect(await phoneHash(page)).toBe("app/learn");
  const r = await new AxeBuilder({ page }).analyze();
  expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
});

test("keyboard: space pauses and resumes, arrows move between features, escape pauses", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-1280", "desktop keyboard");
  await page.goto("/?demo=present&autospeed=0.4");
  await page.getByRole("button", { name: /Start Auto Demo/ }).click();
  await expect(status(page)).toHaveText(/Playing/i);
  await page.locator("body").press(" ");
  await expect(status(page)).toHaveText(/Paused/i);
  await page.locator("body").press(" ");
  await expect(status(page)).toHaveText(/Playing/i);
  await page.locator("body").press("ArrowRight");
  await expect(page.getByTestId("auto-now")).toContainText("The problem");
  await page.locator("body").press("Escape");
  await expect(status(page)).toHaveText(/Paused/i);
  await expect(page).toHaveURL(/demo=present/); // Escape paused; it didn't exit
});

test("phone layout: start from the header, watch the live app, pause and resume", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile-390", "phone layout");
  await page.goto("/?demo=present&autospeed=0.4");
  await page.getByRole("button", { name: /Auto/ }).first().click();
  await expect(page.getByTestId("demo-phone")).toBeVisible();
  await expect(status(page)).toHaveText(/Playing/i);
  const bar = page.getByTestId("auto-bar");
  await expect(bar).toBeInViewport();
  await bar.getByRole("button", { name: "Pause" }).click();
  await expect(status(page)).toHaveText(/Paused/i);
  await bar.getByRole("button", { name: "Resume" }).click();
  await expect(status(page)).toHaveText(/Playing/i);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("repeatable and isolated: two runs succeed and real accounts never change", async ({ signedIn: page }, info) => {
  test.skip(info.project.name !== "desktop-1280", "storage isolation is viewport-independent");
  test.setTimeout(150_000);
  const real = () =>
    page.evaluate(() => {
      const o: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)!;
        if (!k.includes("ge-demo-showcase")) o[k] = localStorage.getItem(k)!;
      }
      return o;
    });
  const before = await real();
  for (let run = 0; run < 2; run++) {
    await page.goto(FAST);
    for (const title of ["Rewards", "Talk to an adviser"]) {
      await page.getByTestId("auto-bar").getByRole("button", { name: "Auto demo a feature" }).click().catch(async () => {
        await page.getByRole("button", { name: "Stop Auto Demo" }).click();
        await page.getByTestId("auto-bar").getByRole("button", { name: "Auto demo a feature" }).click();
      });
      await page.getByRole("menuitem", { name: new RegExp(`^${title}`) }).click();
      await runToEnd(page);
      await page.getByRole("button", { name: "Stop Auto Demo" }).click();
    }
    // Each run starts from the fresh sample profile, so the second redemption works too.
    const rewards = await demo<{ points: number }>(page, "ge-rewards-v2");
    expect(rewards.points).toBe(2450); // the adviser run reseeded after the redemption
  }
  expect(await real()).toEqual(before);
});
