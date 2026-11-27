// Core interactions. Runs at one mobile and one desktop size (the behaviour doesn't change between them).
import { expect, expectClean, go, test } from "./fixtures";

test.beforeEach(({}, info) => {
  test.skip(!["mobile-390", "desktop-1280"].includes(info.project.name), "interactions run at 390 and 1280 only");
});

test("primary navigation reaches every destination", async ({ signedIn: page, problems }, info) => {
  const nav = info.project.name === "mobile-390" ? page.locator("nav").last() : page.locator("header nav").first();
  for (const [label, hash] of [["Learn", "#app/learn"], ["Simulate", "#app/simulate"], ["Protect", "#app/protect"], ["Guide", "#app/guide"], ["Home", "#app/home"]] as const) {
    await nav.getByRole("link", { name: label, exact: true }).or(nav.getByRole("button", { name: label, exact: true })).first().click();
    await expect(page).toHaveURL(new RegExp(`${hash.replace("/", "\\/")}$`));
    await expect(page.locator("h1")).toHaveCount(1);
  }
  expectClean(problems);
});

test("protection hub: risk row opens its category; myth reveals a fact", async ({ signedIn: page, problems }) => {
  await go(page, "app/learn/protection");
  await page.locator("section[aria-labelledby=what-happens] li button").first().click();
  await expect(page).toHaveURL(/#app\/learn\/protection\/medical$/);
  await expect(page.locator("h1")).toHaveText("Medical Expense Protection");
  const myth = page.locator("details").filter({ hasText: "hospital bill will be zero" }).first();
  await myth.locator("summary").click();
  await expect(myth.getByText("Fact:")).toBeVisible();
  expectClean(problems);
});

test("protection hub: checklist answers in a live region", async ({ signedIn: page, problems }) => {
  await go(page, "app/learn/protection");
  const q = page.locator("section[aria-labelledby=before-buy]").getByRole("button", { name: /Deductible/ });
  await q.click();
  await expect(q).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#check-answer")).not.toBeEmpty();
  expectClean(problems);
});

test("simulate: tool tabs switch with arrow keys and deep link", async ({ signedIn: page, problems }) => {
  await go(page, "app/simulate/needs/tool-bill");
  const tabs = page.getByRole("tab");
  await expect(tabs).toHaveCount(4);
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toHaveCount(1);
  await go(page, "app/simulate/needs/tool-ci");
  await expect(page.getByRole("tab", { name: /Critical illness/ })).toHaveAttribute("aria-selected", "true");
  expectClean(problems);
});

test("learn: 'Show all lessons' expands the list", async ({ signedIn: page, problems }) => {
  await go(page, "app/learn");
  const list = page.locator("#learn-lessons ul.grid").last();
  await expect(list.locator("> li")).toHaveCount(3);
  await page.getByRole("button", { name: /Show all \d+ lessons/ }).click();
  expect(await list.locator("> li").count()).toBeGreaterThan(3);
  expectClean(problems);
});

test("disclosures toggle on a category page", async ({ signedIn: page }) => {
  await go(page, "app/learn/protection/medical");
  const sources = page.locator("details").filter({ has: page.locator("summary", { hasText: /^Sources/ }) }).first();
  await expect(sources).not.toHaveAttribute("open", "");
  await sources.locator("summary").first().click();
  await expect(sources).toHaveAttribute("open", "");
});

test("term explainer: tabs switch diagrams, arrow keys move between terms", async ({ signedIn: page, problems }) => {
  await go(page, "app/learn/protection/medical");
  const tabs = page.getByRole("tablist", { name: "Insurance terms" }).getByRole("tab");
  await expect(tabs).toHaveCount(6);
  await expect(page.locator("#term-panel")).toContainText("RM500");
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#term-panel")).toContainText("RM950"); // 10% of RM9,500
  await page.getByRole("tab", { name: "Annual limit" }).click();
  await expect(page.locator("#term-panel")).toContainText("RM15,000");
  expectClean(problems);
});

test("product explorer: filter, pick two, compare shows verified facts and gaps", async ({ signedIn: page, problems }) => {
  await go(page, "app/learn/protection/products");
  await expect(page.getByRole("article")).toHaveCount(8);
  await page.getByRole("button", { name: /^Accident Protection/ }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.getByRole("button", { name: /^All/ }).click();
  const adds = page.getByRole("button", { name: "Add to compare" });
  await adds.nth(0).click();
  await expect(page.getByText("Pick one more product above to compare.")).toBeVisible();
  await page.getByRole("button", { name: "Add to compare" }).nth(0).click();
  const table = page.getByRole("table", { name: "Product comparison" });
  await expect(table).toBeVisible();
  await expect(table.getByRole("columnheader")).toHaveCount(3);
  await expect(table).toContainText("Not in verified sources");
  // A third is allowed, a fourth isn't.
  await page.getByRole("button", { name: "Add to compare" }).nth(0).click();
  await expect(page.getByRole("button", { name: /Compare up to 3/ }).first()).toBeDisabled();
  expectClean(problems);
});
