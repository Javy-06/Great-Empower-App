// Every route loads at every viewport: one H1, no overflow, no broken images, no console/network errors.
import { expect, expectClean, go, routes, test } from "./fixtures";

for (const r of routes) {
  test(`route ${r.key} renders cleanly`, async ({ signedIn: page, problems }, info) => {
    await go(page, r.hash);
    await expect(page.locator("h1")).toHaveCount(1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, "horizontal overflow (px)").toBeLessThanOrEqual(0);
    const broken = await page.evaluate(async () => {
      const imgs = [...document.images];
      imgs.forEach((i) => (i.loading = "eager"));
      await Promise.all(imgs.map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 4000); }))));
      return imgs.filter((i) => i.getAttribute("src") && i.naturalWidth === 0).map((i) => i.getAttribute("src"));
    });
    expect(broken, "broken images").toEqual([]);
    await info.attach(`${r.key}.png`, { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
    expectClean(problems);
  });
}
