// Demo System: entry, App Demo (sample data, reset, isolation) and Presentation Demo (topics,
// phone sync, controls, keyboard, fullscreen, mobile). Device-only build, like every QA run.
import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { topics } from "../../src/demo/presentation/topics";

const FALSE_CLAIMS = /(has been|was|successfully) (submitted|sent)|you('re| are) (approved|covered)|policy (number|issued)|appointment (is )?confirmed/i;

async function axe(page: Page, label: string) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  const blocking = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
  expect(blocking, `axe on ${label}`).toEqual([]);
}

/** Everything in localStorage that is NOT demo data. */
const realStorage = (page: Page) =>
  page.evaluate(() => {
    const out: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (!k.includes("ge-demo-showcase")) out[k] = localStorage.getItem(k)!;
    }
    return out;
  });

const phoneHash = (page: Page) => page.locator("iframe").first().evaluate((f: HTMLIFrameElement) => f.contentWindow!.location.hash);

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("ge-splash-seen", "1"));
});

test("entry: two clear choices, each opening its mode", async ({ page }) => {
  await page.goto("/?demo");
  await expect(page.locator("h1")).toHaveText("See GREAT EMPOWER in action.");
  await expect(page.getByRole("link", { name: /Start App Demo/ })).toHaveAttribute("href", "/?demo=app#app/home");
  await expect(page.getByRole("link", { name: /Start Presentation/ })).toHaveAttribute("href", "/?demo=present");
  await expect(page.getByText(/\(fictional\)/)).toBeVisible();
  await axe(page, "demo entry");
});

test("welcome screen: the App Demo card opens the demo, and Start App Demo opens the app", async ({ page }) => {
  await page.goto("/#app/home");
  await page.getByRole("link", { name: /App Demo/ }).click();
  await expect(page).toHaveURL(/\/\?demo$/);
  await page.getByRole("link", { name: /Start App Demo/ }).click();
  await expect(page).toHaveURL(/\?demo=app#app\/home$/);
  await expect(page.locator("body")).toContainText("Aisyah");
  await page.goto("/?demo");
  await page.getByRole("link", { name: /Start Presentation/ }).click();
  await expect(page.locator("h1")).toHaveText("GREAT EMPOWER");
});

test("app demo: ready to explore with sample data, no sign-in", async ({ page }, info) => {
  test.skip(!["mobile-390", "mobile-375"].includes(info.project.name), "the full-screen app demo is the phone layout");
  await page.goto("/?demo=app#app/home");
  await expect(page.getByRole("button", { name: /Demo Account/ })).toHaveCount(0); // no welcome screen
  await expect(page.locator("main")).toContainText("Aisyah");
  await expect(page.getByTestId("demo-indicator").filter({ visible: true })).toBeVisible();
  // Sample profile drives Protect: a critical illness gap, medical covered.
  await page.evaluate(() => { location.hash = "app/protect"; });
  const gaps = page.locator("#protect-gaps");
  await expect(gaps.getByRole("button", { name: /^Critical illness\s*: Gap/ })).toBeVisible();
  await expect(gaps.getByRole("button", { name: /^Medical\s*: Covered/ })).toBeVisible();
  // Sample application draft and learning progress.
  await page.evaluate(() => { location.hash = "app/protect/get-cover/critical/how"; });
  await expect(page.getByRole("button", { name: /Continue your application/ })).toBeVisible();
  await page.evaluate(() => { location.hash = "app/rewards"; });
  await expect(page.locator("main")).toContainText("2,450");
  await expect(page.locator("main")).not.toContainText(FALSE_CLAIMS);
  await axe(page, "app demo rewards");
});

test("app demo: reset restores the sample, and real accounts are never touched", async ({ signedIn: page }, info) => {
  test.skip(info.project.name !== "mobile-390", "storage isolation is viewport-independent");
  // A real (local) account is open in this browser. Snapshot everything that isn't demo data.
  const before = await realStorage(page);
  expect(Object.keys(before).some((k) => k === "ge-accounts-v1")).toBe(true);

  await page.goto("/?demo=app#app/protect/check");
  // Change the demo's check answers.
  await page.getByRole("radiogroup", { name: "Critical illness cover" }).getByRole("radio", { name: "Yes", exact: true }).click();
  await page.getByRole("button", { name: "Save and see my results" }).click();
  await expect(page.locator("#protect-gaps").getByRole("button", { name: /^Critical illness\s*: Covered/ })).toBeVisible();
  // Reset from the Demo indicator.
  await page.getByTestId("demo-indicator").filter({ visible: true }).click();
  await page.getByRole("button", { name: "Reset demo…" }).click();
  await page.getByRole("button", { name: "Yes, reset demo" }).click();
  await page.waitForLoadState("load");
  await page.evaluate(() => { location.hash = "app/protect"; });
  await expect(page.locator("#protect-gaps").getByRole("button", { name: /^Critical illness\s*: Gap/ })).toBeVisible();

  // Nothing outside the demo namespace changed: same keys, same values, demo never registered.
  const after = await realStorage(page);
  expect(after).toEqual(before);
  const registry = JSON.parse(after["ge-accounts-v1"]);
  expect(registry.accounts.map((a: { id: string }) => a.id)).not.toContain("ge-demo-showcase");
});

test("app demo on desktop: the real app runs in a phone with quick jumps", async ({ page }, info) => {
  test.skip(!["desktop-1280", "wide-1440"].includes(info.project.name), "desktop stage only");
  await page.goto("/?demo=app#app/home");
  await expect(page.getByTestId("demo-phone")).toBeVisible();
  const phone = page.frameLocator("iframe");
  await expect(phone.locator("main")).toContainText("Aisyah");
  await page.getByRole("button", { name: "Rewards" }).click();
  await expect.poll(() => phoneHash(page)).toBe("#app/rewards");
  await expect(phone.getByRole("heading", { level: 1 })).toBeVisible();
  await axe(page, "app demo stage");
});

test("presentation: start on any topic, every topic syncs the phone", async ({ page }, info) => {
  test.skip(!["desktop-1280", "mobile-390"].includes(info.project.name), "runs at one desktop and one phone size");
  const mobile = info.project.name === "mobile-390";
  // Arbitrary starting point: Rewards, straight from the URL.
  await page.goto("/?demo=present&topic=rewards");
  await expect(page.locator("h1")).toHaveText("Rewards");
  await expect(page.getByTestId("topic-indicator")).toContainText("11");
  await expect.poll(() => phoneHash(page)).toBe("#app/rewards");

  const nav = page.getByRole("navigation", { name: "Presentation topics" }).filter({ visible: true });
  for (const t of topics) {
    await nav.getByRole("button", { name: new RegExp(`^${t.n}`) }).click();
    await expect(page.locator("h1")).toHaveText(t.title);
    await expect(page.getByTestId("topic-indicator")).toContainText(t.n);
    await expect(nav.getByRole("button", { name: new RegExp(`^${t.n}`) })).toHaveAttribute("aria-current", "true");
    await expect.poll(() => phoneHash(page), { message: `phone for ${t.id}` }).toBe(`#${t.hash}`);
    expect(new URL(page.url()).searchParams.get("topic")).toBe(t.id);
    await expect(page.locator("main")).not.toContainText(FALSE_CLAIMS);
    if (!mobile) await axe(page, `presentation topic ${t.id}`);
  }
  if (mobile) {
    // Explanation and live app are one tap apart.
    await page.getByRole("button", { name: "Live app" }).click();
    await expect(page.getByTestId("demo-phone")).toBeVisible();
    await expect(page.locator("h1")).toBeHidden();
    await page.getByRole("button", { name: "Explanation" }).click();
    await expect(page.locator("h1")).toBeVisible();
  }
});

test("presentation: previous/next, keyboard, overview, phone stays interactive", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-1280", "desktop controls");
  await page.goto("/?demo=present&topic=simulate");
  await page.getByRole("button", { name: "Next topic" }).click();
  await expect(page.locator("h1")).toHaveText("Rewards");
  await page.getByRole("button", { name: "Previous topic" }).click();
  await page.getByRole("button", { name: "Previous topic" }).click();
  await expect(page.locator("h1")).toHaveText("Talk to an adviser");
  // Keyboard.
  await page.locator("body").press("ArrowRight");
  await expect(page.locator("h1")).toHaveText("Simulate");
  await page.locator("body").press("ArrowLeft");
  await expect(page.locator("h1")).toHaveText("Talk to an adviser");
  // Wraps around from the first topic.
  await page.goto("/?demo=present");
  await expect(page.locator("h1")).toHaveText("GREAT EMPOWER");
  await page.locator("body").press("ArrowLeft");
  await expect(page.locator("h1")).toHaveText("Impact");
  // Overview: pick any topic.
  await page.getByRole("button", { name: "All topics" }).click();
  const dialog = page.getByRole("dialog", { name: "All topics" });
  await expect(dialog.getByRole("button")).toHaveCount(topics.length + 1);
  await dialog.getByRole("button", { name: /^04/ }).click();
  await expect(dialog).toBeHidden();
  await expect(page.locator("h1")).toHaveText("Protection Check");
  await expect.poll(() => phoneHash(page)).toBe("#app/protect/check");
  // The phone is the real app: tapping inside it navigates it.
  const phone = page.frameLocator("iframe");
  await phone.getByRole("navigation").last().getByRole("button", { name: "Learn", exact: true }).click();
  await expect.poll(() => phoneHash(page)).toBe("#app/learn");
  await page.getByRole("button", { name: "Back to this screen" }).click();
  await expect.poll(() => phoneHash(page)).toBe("#app/protect/check");
  // Arrow keys inside a text field don't change topic.
  await page.getByRole("button", { name: "All topics" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "All topics" })).toBeHidden();
  await expect(page.locator("h1")).toHaveText("Protection Check");
  await axe(page, "presentation");
});

test("presentation: fullscreen, hide navigator, reset and exit", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-1280", "desktop controls");
  await page.goto("/?demo=present&topic=gap");
  await page.getByRole("button", { name: "Fullscreen" }).click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
  await page.getByRole("button", { name: "Exit fullscreen" }).click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(false);
  await page.getByRole("button", { name: "Hide navigator" }).click();
  await expect(page.getByRole("navigation", { name: "Presentation topics" }).filter({ visible: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Show navigator" }).click();
  await expect(page.getByRole("navigation", { name: "Presentation topics" }).filter({ visible: true })).toHaveCount(1);
  await page.getByRole("button", { name: "Reset demo" }).click();
  await page.getByRole("dialog", { name: "Reset demo" }).getByRole("button", { name: "Reset" }).click();
  await expect(page.getByRole("status")).toContainText("Demo reset");
  await expect.poll(() => phoneHash(page)).toBe("#app/protect/gap/critical");
  // Escape (outside fullscreen) exits to the demo entry.
  await page.locator("body").press("Escape");
  await expect(page).toHaveURL(/\/\?demo$/);
  await page.goto("/?demo=present");
  await page.getByRole("link", { name: "Exit presentation" }).click();
  await expect(page).toHaveURL(/\/\?demo$/);
});

/* ------------------------------------------------------------------ responsive (all five widths) */

for (const [key, url] of [
  ["entry", "/?demo"],
  ["app", "/?demo=app#app/home"],
  ["present-overview", "/?demo=present"],
  ["present-simulate", "/?demo=present&topic=simulate"],
  ["present-rewards", "/?demo=present&topic=rewards"],
] as const) {
  test(`responsive ${key}`, async ({ page }, info) => {
    await page.goto(url);
    await page.waitForTimeout(800);
    const width = info.project.use.viewport!.width;
    // No sideways scrolling of the page itself.
    expect(await page.evaluate(() => document.documentElement.scrollWidth), "horizontal overflow").toBeLessThanOrEqual(width);
    if (key.startsWith("present")) {
      await expect(page.getByTestId("topic-indicator")).toBeVisible();
      await expect(page.locator("h1")).toBeInViewport();
      // Every header control is fully on screen and big enough to tap.
      for (const b of await page.locator("header button, header a").filter({ visible: true }).all()) {
        const box = (await b.boundingBox())!;
        expect(box.x, "control off the left edge").toBeGreaterThanOrEqual(0);
        expect(box.x + box.width, "control off the right edge").toBeLessThanOrEqual(width + 0.5);
        expect(box.height, "control height").toBeGreaterThanOrEqual(40);
      }
    }
    if (key === "app") await expect(page.getByTestId("demo-indicator").filter({ visible: true }).or(page.getByTestId("demo-phone"))).toBeVisible();
  });
}

/* ------------------------------------------------------------------ visual baselines (390 + 1280) */

for (const [key, url] of [
  ["demo-entry", "/?demo"],
  ["demo-present-gap", "/?demo=present&topic=gap"],
] as const) {
  test(`visual ${key}`, async ({ page }, info) => {
    test.skip(!["mobile-390", "desktop-1280"].includes(info.project.name), "baselines kept for 390 and 1280");
    await page.goto(url);
    // Settle first: under full parallel load the first paint can lag a fixed wait.
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    // The phone is the live app (covered by the app's own visual tests); mask it here.
    await expect(page).toHaveScreenshot(`${key}.png`, { mask: [page.locator("iframe")], stylePath: "tests/e2e/screenshot.css" });
  });
}
