// Visual regression: compares key screens with committed baselines (tests/e2e/__screenshots__).
// After an intended visual change, inspect the diff in the HTML report, then refresh baselines with
// `pnpm qa:visual:update`. Baselines are platform-specific (generated on Windows + Chrome).
import { expect, go, test } from "./fixtures";

const screens = [
  { key: "home", hash: "app/home" },
  { key: "protection", hash: "app/learn/protection" },
  { key: "cat-medical", hash: "app/learn/protection/medical" },
  { key: "simulate", hash: "app/simulate" },
  { key: "analyze", hash: "app/analyze" },
  { key: "rewards", hash: "app/rewards" },
];

test.beforeEach(({}, info) => {
  test.skip(!["mobile-390", "desktop-1280"].includes(info.project.name), "baselines kept for 390 and 1280");
});

for (const s of screens) {
  test(`visual ${s.key}`, async ({ signedIn: page }) => {
    await go(page, s.hash);
    await page.evaluate(() => document.fonts.ready);
    // Carousels and videos move on their own; hide what can't be frozen.
    await expect(page).toHaveScreenshot(`${s.key}.png`, {
      fullPage: true,
      stylePath: "tests/e2e/screenshot.css",
      mask: [page.locator("video"), page.locator("[data-carousel], [aria-roledescription=carousel]")],
    });
  });
}
