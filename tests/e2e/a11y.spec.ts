// axe-core scan (WCAG 2.0/2.1/2.2 A + AA) of every route at 390 and 1280.
// Serious and critical violations fail the test; moderate/minor are attached for review.
import AxeBuilder from "@axe-core/playwright";
import { expect, go, routes, test } from "./fixtures";

test.beforeEach(({}, info) => {
  test.skip(!["mobile-390", "desktop-1280"].includes(info.project.name), "axe runs at 390 and 1280");
});

for (const r of routes) {
  test(`a11y ${r.key}`, async ({ signedIn: page }, info) => {
    await go(page, r.hash);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .exclude("video") // native media controls are the browser's own UI
      .analyze();
    const summary = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.length,
      targets: v.nodes.slice(0, 4).map((n) => n.target.join(" ")),
    }));
    await info.attach("axe-violations.json", { body: JSON.stringify(summary, null, 2), contentType: "application/json" });
    const blocking = summary.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(blocking, `serious/critical axe violations on ${r.key}`).toEqual([]);
  });
}
