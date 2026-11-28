// App Demo presenter controls: guided journeys, Pause/Resume, Skip waiting, Next step, Restart,
// Exit, Reset, free exploration and storage isolation. Phone (390) and desktop full-width (1280).
import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, go, test } from "./fixtures";

test.beforeEach(async ({ page }, info) => {
  test.skip(!["mobile-390", "desktop-1280"].includes(info.project.name), "journeys run at 390 and 1280");
  await page.addInitScript(() => sessionStorage.setItem("ge-splash-seen", "1"));
});

/** App Demo URL: the phone layout at 390, the full-width app (same toolbar) at 1280. */
const appUrl = (hash: string, mobile: boolean) => (mobile ? `/?demo=app#${hash}` : `/?demo=app&view=full#${hash}`);

const pill = (page: Page) => page.getByTestId("demo-toolbar").locator("button[aria-expanded]");
async function panel(page: Page) {
  if (!(await page.getByRole("dialog", { name: "Demo controls" }).isVisible())) await pill(page).click();
  return page.getByRole("dialog", { name: "Demo controls" });
}
const points = (page: Page) => page.getByRole("button", { name: /Rewards Hub/ }).filter({ visible: true }).first();
const hash = (page: Page) => page.evaluate(() => location.hash.slice(1));

async function axe(page: Page, label: string) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  const blocking = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
  expect(blocking, `axe on ${label}`).toEqual([]);
}

test("learn journey: open a video, explain the rule, pause/resume, skip waiting, earn points", async ({ page }, info) => {
  const mobile = info.project.name === "mobile-390";
  await page.goto(appUrl("app/home", mobile));
  await expect(pill(page)).toBeVisible();
  await (await panel(page)).getByRole("button", { name: /Learn → Earn points/ }).click();
  await expect.poll(() => hash(page)).toBe("app/learn");
  await expect(pill(page)).toHaveAccessibleName(/1\/6 · Open Learn/);

  // Select the lesson through the real Learn UI; the indicator follows, the app isn't driven.
  await page.getByRole("link", { name: /How insurance actually works in Malaysia/ }).or(page.getByRole("button", { name: /How insurance actually works in Malaysia/ })).first().click();
  await expect.poll(() => hash(page)).toBe("app/learn/video/how-insurance-works-in-malaysia");
  await expect(pill(page)).toHaveAccessibleName(/2\/6 · Open a video/);
  await expect(page.locator("video")).toBeVisible();

  // The real completion rule is on screen.
  await page.getByTestId("demo-toolbar").getByRole("button", { name: /^Next step: The completion rule/ }).first().click();
  await expect(pill(page)).toHaveAccessibleName(/3\/6 · The completion rule/);
  await expect(page.locator("[data-demo=watch-rule]")).toContainText("once you've watched the whole video");
  await expect(page.getByText("Demo only · presenter shortcut")).toBeVisible();

  // Pause: demo timing stops (video can't play, animations freeze) but the app stays usable.
  await (await panel(page)).getByRole("button", { name: "Pause" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-demo-paused", "");
  await expect(pill(page)).toHaveAccessibleName(/^Paused/);
  await page.locator("video").evaluate((v: HTMLVideoElement) => { v.muted = true; return v.play().catch(() => undefined); });
  await expect.poll(() => page.locator("video").evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await expect(page.getByRole("button", { name: "Skip video" })).toBeEnabled(); // still interactive
  await (await panel(page)).getByRole("button", { name: "Resume" }).click();
  await expect(page.locator("html")).not.toHaveAttribute("data-demo-paused", "");

  // "Skip video" alone earns nothing (same rule as the real app).
  await expect(points(page)).toContainText("2,450");
  await page.getByRole("button", { name: "Skip video" }).click();
  await page.waitForTimeout(300);
  await expect(points(page)).toContainText("2,450");

  // Skip waiting: completes the demo lesson through the real watch-time rule.
  const p = await panel(page);
  await expect(p.getByRole("button", { name: "Skip waiting" })).toBeEnabled();
  await p.getByRole("button", { name: "Skip waiting" }).click();
  const done = page.locator("[data-demo=lesson-complete]");
  await expect(done).toContainText("+40 pts earned");
  await expect(done).toContainText("2,490 pts");
  await expect(points(page)).toContainText("2,490");
  await expect(pill(page)).toHaveAccessibleName(/5\/6 · Points earned/);
  // Learning progress updated (demo namespace only).
  const completed = await page.evaluate(() => JSON.parse(localStorage.getItem("ge-learn-v1::ge-demo-showcase") ?? "{}").completed as string[]);
  expect(completed).toContain("how-insurance-works-in-malaysia");

  // Next step opens the wallet history with the new entry on top.
  await page.getByTestId("demo-toolbar").getByRole("button", { name: /^Next step: See it in Rewards/ }).first().click();
  await expect.poll(() => hash(page)).toBe("app/rewards/wallet");
  await expect(page.locator("main")).toContainText("Watched a video lesson");
  await expect(pill(page)).toHaveAccessibleName(/6\/6/);

  // Restart journey: back to step 1 with the demo data as it was when the journey started.
  await (await panel(page)).getByRole("button", { name: "Restart journey" }).click();
  await page.waitForLoadState("load");
  await expect.poll(() => hash(page)).toBe("app/learn");
  await expect(pill(page)).toHaveAccessibleName(/1\/6/);
  await expect(points(page)).toContainText("2,450");
});

test("rewards journey: browse, details, redeem, cancel, confirm, success, wallet, then reset", async ({ page }, info) => {
  const mobile = info.project.name === "mobile-390";
  await page.goto(appUrl("app/home", mobile));
  await (await panel(page)).getByRole("button", { name: /Rewards → Redeem/ }).click();
  await expect.poll(() => hash(page)).toBe("app/rewards");
  await page.getByTestId("demo-toolbar").getByRole("button", { name: /^Next step: Browse rewards/ }).first().click();
  await expect.poll(() => hash(page)).toBe("app/rewards/marketplace");

  // Select a real catalogue reward through the UI.
  await page.getByRole("link", { name: /Great Empower RM10 Voucher/ }).or(page.getByRole("button", { name: /Great Empower RM10 Voucher/ })).first().click();
  await expect.poll(() => hash(page)).toBe("app/rewards/product/gev-rm10");
  await expect(pill(page)).toHaveAccessibleName(/3\/6 · Reward details/);
  await expect(page.locator("main")).toContainText("1,000");

  // Redeem → confirm (cancel first, then confirm).
  await page.getByRole("button", { name: /Redeem for 1,000/ }).click();
  await expect(pill(page)).toHaveAccessibleName(/4\/6 · Redeem and confirm/);
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("button", { name: "Confirm demo redemption" })).toHaveCount(0);
  await page.getByRole("button", { name: /Redeem for 1,000/ }).click();
  await page.getByRole("button", { name: "Confirm demo redemption" }).click();

  // Success: demo-labelled, points deducted, remaining balance, status.
  await expect(page.locator("h1")).toHaveText("Successfully redeemed");
  await expect(page.getByText("Demo mode", { exact: true })).toBeVisible();
  await expect(page.locator("main")).toContainText("−1,000");
  await expect(page.locator("main")).toContainText("1,450");
  await expect(page.getByText("In your wallet", { exact: true })).toBeVisible();
  await expect(page.locator("main")).toContainText("no voucher is issued or sent");
  await expect(pill(page)).toHaveAccessibleName(/5\/6 · Redemption success/);

  // View the redeemed reward and the history entry.
  await page.getByRole("button", { name: "View wallet" }).click();
  await expect.poll(() => hash(page)).toBe("app/rewards/wallet");
  await expect(pill(page)).toHaveAccessibleName(/6\/6 · View in wallet/);
  await expect(page.locator("main")).toContainText("Great Empower RM10 Voucher");
  await expect(points(page)).toContainText("1,450");

  // Reset demo (with confirmation) restores the original sample state and ends the journey.
  const p = await panel(page);
  await p.getByRole("button", { name: "Reset demo…" }).click();
  await p.getByRole("button", { name: "Yes, reset demo" }).click();
  await page.waitForLoadState("load");
  await expect(points(page)).toContainText("2,450");
  await expect(pill(page)).not.toHaveAccessibleName(/\d+\/\d+/);
  await go(page, "app/rewards/wallet");
  await expect(page.locator("main")).not.toContainText("Great Empower RM10 Voucher");
});

test("free exploration: journeys never navigate on their own; exit and switch journeys", async ({ page }, info) => {
  const mobile = info.project.name === "mobile-390";
  await page.goto(appUrl("app/home", mobile));
  // Nothing to skip on Home.
  await expect((await panel(page)).getByRole("button", { name: "Skip waiting" })).toBeDisabled();
  await (await panel(page)).getByRole("button", { name: /Learn → Earn points/ }).click();
  await expect.poll(() => hash(page)).toBe("app/learn");
  // Wander off: the app stays where the presenter goes, and the step doesn't change.
  await page.evaluate(() => { location.hash = "app/guide"; });
  await page.waitForTimeout(1200);
  expect(await hash(page)).toBe("app/guide");
  await expect(pill(page)).toHaveAccessibleName(/1\/6/);
  // Exit the journey and keep exploring; start another one later.
  await (await panel(page)).getByRole("button", { name: "Exit journey" }).click();
  await expect(pill(page)).not.toHaveAccessibleName(/\d+\/\d+/);
  expect(await hash(page)).toBe("app/guide");
  await (await panel(page)).getByRole("button", { name: /Simulate a hospital bill/ }).click();
  await expect.poll(() => hash(page)).toBe("app/simulate");
  // Skip waiting here loads a sample bill into the real wizard; Calculate still runs the engine.
  await (await panel(page)).getByRole("button", { name: "Skip waiting" }).click();
  await expect(pill(page)).toHaveAccessibleName(/Load a sample bill/);
  await expect(page.getByText("Step 7 of 7")).toBeVisible();
  await page.getByRole("button", { name: "Calculate educational result" }).click();
  await expect(page.getByTestId("medical-claim-who-pays")).toBeVisible();
  await expect(pill(page)).toHaveAccessibleName(/3\/3 · Who pays/);
  await axe(page, "simulate result with toolbar");
});

test("adviser journey: skip waiting fills a sample under-18 request; nothing is sent", async ({ page }, info) => {
  const mobile = info.project.name === "mobile-390";
  await page.goto(appUrl("app/home", mobile));
  await (await panel(page)).getByRole("button", { name: /Adviser request \(under 18\)/ }).click();
  await page.getByTestId("demo-toolbar").getByRole("button", { name: /^Next step: Personal details/ }).first().click();
  await expect.poll(() => hash(page)).toBe("app/protect/adviser/details");
  await (await panel(page)).getByRole("button", { name: "Skip waiting" }).click();
  await expect(page.getByLabel("Full name")).toHaveValue("Adam Rahman");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText(/Because you're under 18/)).toBeVisible();
  await expect(pill(page)).toHaveAccessibleName(/Age guidance/);
  await axe(page, "adviser guidance with toolbar open");
});

test("controls: open panel is accessible; presentation phone has no toolbar; desktop app phone does", async ({ page }, info) => {
  const mobile = info.project.name === "mobile-390";
  await page.goto(appUrl("app/home", mobile));
  await panel(page);
  await axe(page, "demo controls panel");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Demo controls" })).toBeHidden();
  if (!mobile) {
    await page.goto("/?demo=present&topic=rewards");
    await expect(page.frameLocator("iframe").getByTestId("demo-toolbar")).toHaveCount(0);
    await page.goto("/?demo=app#app/home");
    await expect(page.frameLocator("iframe").getByTestId("demo-toolbar")).toBeVisible();
  }
});

test("isolation: journeys, redemption and reset never touch a real account; real app has no shortcuts", async ({ signedIn: page }, info) => {
  test.skip(info.project.name !== "mobile-390", "storage isolation is viewport-independent");
  // A real account is open. Its video page has no demo shortcuts, and the rule text is unchanged.
  await go(page, "app/learn/video/how-insurance-works-in-malaysia");
  await expect(page.getByText("Demo only · presenter shortcut")).toHaveCount(0);
  await expect(page.getByTestId("demo-toolbar")).toHaveCount(0);
  // Leaving the real video page saves its own watch coverage (normal app behaviour); snapshot after.
  await go(page, "app/home");
  const snapshot = () =>
    page.evaluate(() => {
      const o: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)!;
        if (!k.includes("ge-demo-showcase")) o[k] = localStorage.getItem(k)!;
      }
      return o;
    });
  const before = await snapshot();
  await page.goto("/?demo=app#app/learn/video/how-insurance-works-in-malaysia");
  await page.getByRole("button", { name: /Complete demo lesson/ }).click();
  await expect(page.locator("[data-demo=lesson-complete]")).toBeVisible();
  await page.goto("/?demo=app#app/rewards/product/gev-rm10");
  await page.getByRole("button", { name: /Redeem for/ }).click();
  await page.getByRole("button", { name: "Confirm demo redemption" }).click();
  await expect(page.getByText("Demo mode", { exact: true })).toBeVisible();
  expect(await snapshot()).toEqual(before);
});

test("visual: demo controls (collapsed pill with a journey, and the open panel)", async ({ page }, info) => {
  const mobile = info.project.name === "mobile-390";
  await page.goto(appUrl("app/rewards", mobile));
  await (await panel(page)).getByRole("button", { name: /Rewards → Redeem/ }).click();
  await expect(pill(page)).toHaveAccessibleName(/1\/6 · Rewards Hub/);
  await expect(page.getByTestId("demo-toolbar")).toHaveScreenshot("demo-controls-pill.png");
  await pill(page).click();
  await expect(page.getByRole("dialog", { name: "Demo controls" })).toHaveScreenshot("demo-controls-panel.png", { animations: "disabled" });
});
