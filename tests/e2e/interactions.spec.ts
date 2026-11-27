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

test("learn: format tabs show one format at a time; 'Show all lessons' expands the list", async ({ signedIn: page, problems }) => {
  await go(page, "app/learn");
  const tabs = page.getByRole("tablist", { name: "Learning formats" }).getByRole("tab");
  await expect(tabs).toHaveCount(3);
  await expect(page.locator("#learn-videos")).toBeVisible();
  await expect(page.locator("#learn-lessons")).toHaveCount(0);
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#learn-infographics")).toBeVisible();
  await expect(page.locator("#learn-videos")).toHaveCount(0);
  await page.getByRole("tab", { name: /Lessons/ }).click();
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

test("home: next-step path highlights the first unfinished step and links onward", async ({ signedIn: page, problems }) => {
  await go(page, "app/home");
  const path = page.locator("section[aria-labelledby=next-title]");
  await expect(path.getByRole("button", { name: /Learn the basics|Check your protection|Explore real products/ })).toHaveCount(3);
  const current = path.locator("[aria-current=step]");
  await expect(current).toHaveCount(1);
  await path.getByRole("button", { name: /Explore real products/ }).click();
  await expect(page).toHaveURL(/#app\/learn\/protection\/products$/);
  expectClean(problems);
});

test("family scenario: guided steps gate Next until filled; example reaches the same engine result", async ({ signedIn: page, problems }) => {
  await go(page, "app/simulate/needs/tool-family");
  const panel = page.locator("#tool-family");
  await expect(panel.getByText("Step 1 of 3")).toBeVisible();
  const next = panel.getByRole("button", { name: "Next" });
  await expect(next).toBeDisabled();
  await panel.getByLabel("Monthly support for dependants").fill("400");
  await panel.getByRole("button", { name: /Parents · 5y/ }).click();
  await expect(next).toBeEnabled();
  await next.click();
  await expect(panel.getByText("Step 2 of 3")).toBeVisible();
  await expect(panel.getByText("Support: RM400/month for 5 years")).toBeVisible();
  // The research example fills every step and jumps to the result (engine unchanged).
  await panel.getByRole("button", { name: /Fill in the research example/ }).click();
  await expect(panel.getByText("Step 3 of 3")).toBeVisible();
  await expect(panel).toContainText("RM 40,000");
  await expect(panel).toContainText("RM 44,000");
  expectClean(problems);
});

test("rewards: redeeming a voucher deducts once, shows the summary, and blocks a duplicate", async ({ signedIn: page, problems }) => {
  await go(page, "app/rewards/product/gev-rm10");
  await expect(page.getByText("You can redeem this now")).toBeVisible();
  const startText = (await page.getByText(/pts of 1,000 pts/).textContent()) ?? "";
  const start = Number(startText.split(" pts of")[0].replace(/[^\d]/g, ""));
  await page.getByRole("button", { name: /Redeem for 1,000 pts/ }).click();
  const confirm = page.getByRole("button", { name: "Confirm" });
  await confirm.dblclick(); // a double tap must not redeem twice
  await expect(page.getByRole("heading", { name: "Redeemed" })).toBeVisible();
  await expect(page.getByText("Points used")).toBeVisible();
  await expect(page.locator("dd").filter({ hasText: /^−1,000 pts$/ })).toBeVisible();
  await expect(page.locator("dd").filter({ hasText: `${(start - 1000).toLocaleString("en-MY")} pts` })).toBeVisible();
  await go(page, "app/rewards");
  await go(page, "app/rewards/product/gev-rm10");
  await expect(page.getByRole("button", { name: "Already in your wallet" })).toBeDisabled();
  expectClean(problems);
});

test("rewards: a reward above the balance can't be redeemed and says how many points are missing", async ({ signedIn: page, problems }) => {
  await go(page, "app/rewards/product/gev-rm50");
  await expect(page.getByText(/pts to go$/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Not enough points \(.+ short\)/ })).toBeDisabled();
  expectClean(problems);
});

test("protect: the check lives in Protect, saves, and no gap appears without a chosen priority", async ({ signedIn: page, problems }) => {
  await go(page, "app/protect");
  await page.getByRole("button", { name: /Start your check|Finish your check/ }).click();
  await expect(page).toHaveURL(/#app\/protect\/check$/);
  for (const name of ["Medical cover", "Critical illness cover", "Life & income cover", "Personal accident cover"]) {
    await page.getByRole("radiogroup", { name }).getByRole("radio", { name: "No", exact: true }).click();
  }
  // Nothing is pre-selected as a priority.
  for (const box of await page.getByRole("checkbox").all()) await expect(box).toHaveAttribute("aria-checked", "false");
  await page.getByRole("button", { name: "Save and see my results" }).click();
  await expect(page).toHaveURL(/#app\/protect$/);
  const gaps = page.locator("#protect-gaps");
  await expect(gaps.getByText("Review", { exact: true }).first()).toBeVisible();
  await expect(gaps.getByText("Gap", { exact: true })).toHaveCount(0);
  expectClean(problems);
});

test("get cover: understand → skip → ready → apply step offers the in-app application and adviser guidance", async ({ signedIn: page, problems }) => {
  for (const [name, area] of [["Medical", "medical"], ["Critical illness", "critical"], ["Life & income", "life"], ["Personal accident", "accident"]] as const) {
    await go(page, "app/protect/get-cover");
    await page.getByRole("button", { name: new RegExp(`^${name}`) }).click();
    await expect(page).toHaveURL(new RegExp(`#app/protect/get-cover/${area}$`));
  }
  await go(page, "app/protect/get-cover/medical");
  await expect(page.getByText("Optional", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Skip and continue" }).click();
  await expect(page).toHaveURL(/get-cover\/medical\/ready$/);
  await page.getByRole("button", { name: "Continue to apply" }).click();
  await expect(page).toHaveURL(/get-cover\/medical\/how$/);
  await page.getByRole("button", { name: "Get Adviser Guidance" }).click();
  await expect(page).toHaveURL(/get-cover\/medical\/adviser$/);
  await expect(page.getByRole("link", { name: /official call-back page/ })).toHaveAttribute("target", "_blank");
  await page.getByRole("button", { name: /Apply in GREAT EMPOWER/ }).click();
  await expect(page).toHaveURL(/#app\/protect\/apply\/medical\/details$/);
  // The old external "online" route now forwards into the in-app application.
  await page.evaluate(() => { location.hash = "app/protect/get-cover/life/online"; });
  await expect(page).toHaveURL(/#app\/protect\/apply\/life\/details$/);
  expectClean(problems);
});

test("apply in app: validation, back without losing answers, review, honest completion", async ({ signedIn: page, problems }) => {
  await go(page, "app/protect/get-cover/medical/how");
  await page.getByRole("button", { name: "Start your application" }).click();
  await expect(page).toHaveURL(/apply\/medical\/details$/);
  await expect(page.getByText("Step 1 of 4")).toBeVisible();
  // Empty submit shows an error summary and field errors, and stays on the step.
  await page.getByLabel("Full name").fill("");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("alert")).toContainText("answers need attention");
  await expect(page.getByLabel("Full name")).toHaveAttribute("aria-invalid", "true");
  await expect(page).toHaveURL(/apply\/medical\/details$/);
  await page.getByLabel("Full name").fill("Aisyah Rahman");
  await page.getByLabel("Date of birth").fill("2002-05-14");
  await page.getByRole("radio", { name: "Malaysian citizen" }).click();
  await page.getByLabel("Occupation").fill("Student");
  await page.getByLabel("Mobile number").fill("12345");
  await page.getByLabel("Email").fill("aisyah@example.com");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByLabel("Mobile number")).toHaveAttribute("aria-invalid", "true");
  await page.getByLabel("Mobile number").fill("012-345 6789");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/apply\/medical\/cover$/);
  await page.getByRole("radio", { name: "Not sure yet" }).click();
  await page.getByLabel("What you could spend a month").fill("120");
  await page.getByRole("radio", { name: "Monthly" }).click();
  await page.getByRole("radio", { name: "Either is fine" }).click();
  await page.getByRole("radiogroup", { name: /already have medical cover/ }).getByRole("radio", { name: "No", exact: true }).click();
  // Back keeps what was typed.
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page).toHaveURL(/apply\/medical\/details$/);
  await expect(page.getByLabel("Occupation")).toHaveValue("Student");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/apply\/medical\/health$/);
  for (const group of await page.getByRole("radiogroup").all()) await group.getByRole("radio", { name: "No", exact: true }).click();
  await page.getByRole("button", { name: "Review my application" }).click();
  await expect(page).toHaveURL(/apply\/medical\/review$/);
  await expect(page.getByText("Aisyah Rahman")).toBeVisible();
  // The declaration is required.
  await page.getByRole("button", { name: "Complete application" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByLabel(/My answers are true and complete/).check();
  await page.getByLabel(/doesn.t send it to an insurer/).check();
  await page.getByRole("button", { name: "Complete application" }).click();
  await expect(page).toHaveURL(/apply\/medical\/done$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Application completed in GREAT EMPOWER.");
  await expect(page.locator("dt", { hasText: "Sent to an insurer" }).locator("xpath=following-sibling::dd")).toHaveText("No");
  // Never claims submission, approval or a reference number.
  await expect(page.locator("main")).not.toContainText(/(has been|was|successfully) submitted|you('re| are) (approved|covered)|application (is )?approved|reference number|policy number/i);
  expect(page.url()).toContain("127.0.0.1");
  expectClean(problems);
});

test("lifetrack: the Home card opens the external game site in a new tab", async ({ signedIn: page, problems }) => {
  await go(page, "app/home");
  const link = page.getByRole("link", { name: /Play LifeTrack/ });
  await expect(link).toHaveAttribute("href", "https://lifetrack-plum.vercel.app/");
  await expect(link).toHaveAttribute("target", "_blank");
  await page.evaluate(() => { location.hash = "app/play/lifetrack"; });
  await expect(page).toHaveURL(/#app\/home$/);
  expectClean(problems);
});

test("simulate: opens straight on the tools, with no profile form", async ({ signedIn: page, problems }) => {
  await go(page, "app/simulate");
  await expect(page.getByRole("tablist", { name: "Simulation tools" })).toBeVisible();
  await expect(page.getByLabel("Monthly income")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Check your protection" })).toBeVisible();
  expectClean(problems);
});
