// Protection & Simulate UX: adviser request (18+ and under-18), Your gaps, How protection works,
// and the Simulate scenarios. Runs at one mobile and one desktop size, device-only.
import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { expect, expectClean, go, test } from "./fixtures";

test.beforeEach(({}, info) => {
  test.skip(!["mobile-390", "desktop-1280"].includes(info.project.name), "flow tests run at 390 and 1280 only");
});

/** Words the app must never use about a request, an application or cover it can't send. */
const FALSE_CLAIMS =
  /(has been|was|successfully) (submitted|sent|received)|adviser (has|will) (contact|call)|we('ll| will) (call|contact) you|meeting (is )?(booked|confirmed)|appointment (is )?(booked|confirmed)|you('re| are) (approved|covered)|cover(age)? (is )?(active|activated)|policy (number|created)|reference number/i;

/** axe on a state that has no route of its own (e.g. under-18 guidance). Serious/critical fail. */
async function axe(page: Page, label: string) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  const blocking = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
  expect(blocking, `axe on ${label}`).toEqual([]);
}

async function fillDetails(page: Page, name: string, dob: string) {
  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("Date of birth").fill(dob);
}

test("protect: both Get cover cards are clickable; Talk to an adviser opens the request", async ({ signedIn: page, problems }) => {
  await go(page, "app/protect");
  const section = page.locator("#protect-apply");
  await section.getByRole("button", { name: /Apply in GREAT EMPOWER/ }).click();
  await expect(page).toHaveURL(/#app\/protect\/get-cover$/);
  await go(page, "app/protect");
  await section.getByRole("button", { name: /Talk to an adviser/ }).click();
  await expect(page).toHaveURL(/#app\/protect\/adviser$/);
  await expect(page.locator("h1")).toHaveText("Talk to an adviser.");
  // Keyboard: the card is a real button.
  await go(page, "app/protect");
  await section.getByRole("button", { name: /Talk to an adviser/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#app\/protect\/adviser$/);
  expectClean(problems);
});

test("adviser request, 18+: own details, own contact, honest demo confirmation", async ({ signedIn: page, problems }) => {
  await go(page, "app/protect/get-cover/medical/how");
  await page.getByRole("button", { name: /Talk to an adviser/ }).click();
  await expect(page).toHaveURL(/#app\/protect\/adviser$/);
  await page.getByRole("button", { name: /Start my request|Continue my request/ }).click();
  await expect(page).toHaveURL(/adviser\/details$/);
  // The topic from Get cover is pre-selected.
  await expect(page.getByRole("button", { name: "Medical", exact: true })).toHaveAttribute("aria-pressed", "true");
  // Validation.
  await page.getByLabel("Full name").fill("");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("alert")).toContainText("need attention");
  await fillDetails(page, "Aisyah Rahman", "2002-05-14");
  await expect(page.getByRole("status").filter({ hasText: "Age" })).toContainText("your own request");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/adviser\/guidance$/);
  await expect(page.getByText("You can continue with your own adviser request.")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/adviser\/contact$/);
  await expect(page.getByLabel(/Parent or guardian/)).toHaveCount(0);
  await page.getByLabel("Mobile number").fill("012-345 6789");
  await page.getByLabel("Email").fill("aisyah@example.com");
  await page.getByRole("radio", { name: "WhatsApp" }).click();
  await page.getByRole("radio", { name: /Evening/ }).click();
  await page.getByRole("button", { name: "Review my request" }).click();
  await expect(page).toHaveURL(/adviser\/review$/);
  await expect(page.getByText("Your own request")).toBeVisible();
  // Acknowledgement is required.
  await page.getByRole("button", { name: "Save adviser request" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByLabel(/demo request/).check();
  await page.getByRole("button", { name: "Save adviser request" }).click();
  await expect(page).toHaveURL(/adviser\/done$/);
  await expect(page.locator("h1")).toHaveText("Adviser request saved.");
  await expect(page.locator("dt", { hasText: "Sent to an adviser" }).locator("xpath=following-sibling::dd")).toHaveText("No");
  await expect(page.locator("dt", { hasText: "Contact arranged" }).locator("xpath=following-sibling::dd")).toHaveText("No");
  await expect(page.locator("main")).not.toContainText(FALSE_CLAIMS);
  // Saved on this device and listed.
  await page.getByRole("button", { name: "See saved requests" }).click();
  await expect(page.getByText("Aisyah Rahman")).toBeVisible();
  await expect(page.getByText(/Not sent/)).toBeVisible();
  expectClean(problems);
});

test("adviser request, under 18: guardian-assisted, guardian details and consent required", async ({ signedIn: page, problems }) => {
  await go(page, "app/protect/adviser/details");
  await fillDetails(page, "Daniel Tan", "2012-03-02");
  await expect(page.getByRole("status").filter({ hasText: "Age 14" })).toContainText("parent or guardian");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText(/Because you're under 18, a parent or legal guardian may need to help/)).toBeVisible();
  await expect(page.getByText(/depend on the insurer and selected plan/)).toBeVisible();
  await expect(page.getByText(/only with a parent's or guardian's written consent/)).toBeVisible();
  await axe(page, "under-18 guidance");
  await page.getByRole("button", { name: "Add parent or guardian" }).click();
  await expect(page).toHaveURL(/adviser\/contact$/);
  // The child's own phone/email aren't asked for.
  await expect(page.getByLabel("Mobile number", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Review my request" }).click();
  const alert = page.getByRole("alert");
  await expect(alert).toContainText("parent's or guardian's full name");
  await expect(alert).toContainText("knows about this request");
  await axe(page, "guardian contact with errors");
  await page.getByLabel("Parent or guardian's full name").fill("Mei Ling Tan");
  await page.getByRole("radio", { name: "Mother" }).click();
  await page.getByLabel("Parent or guardian's mobile").fill("013-222 3344");
  await page.getByLabel("Parent or guardian's email").fill("meiling@example.com");
  await page.getByRole("radio", { name: "Phone call" }).click();
  await page.getByLabel(/knows about this request/).check();
  await page.getByRole("button", { name: "Review my request" }).click();
  await expect(page.getByText("Parent or guardian assisted (under 18)")).toBeVisible();
  await page.getByLabel(/demo request/).check();
  await page.getByRole("button", { name: "Save adviser request" }).click();
  await expect(page).toHaveURL(/adviser\/done$/);
  await expect(page.getByText(/Parent or guardian assisted · contact: Mei Ling Tan/)).toBeVisible();
  await axe(page, "guardian request saved");
  await expect(page.locator("main")).not.toContainText(FALSE_CLAIMS);
  expectClean(problems);
});

test("adviser request: 16–17 and under-10 get their own guidance; no manual adult/minor question", async ({ signedIn: page, problems }) => {
  await go(page, "app/protect/adviser/details");
  await expect(page.getByText(/are you (an adult|over 18|under 18)\?/i)).toHaveCount(0);
  await fillDetails(page, "Nur Iman", "2009-06-01");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText(/aged 16 or 17 take out a policy on their own life/)).toBeVisible();
  await expect(page.getByText(/medical or accident cover, have their own age rules/)).toBeVisible();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByLabel("Date of birth").fill("2021-01-10");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText(/Because this is for a child, a parent or legal guardian needs to lead/)).toBeVisible();
  expectClean(problems);
});

test("apply in app: an under-18 date of birth points to the guardian-assisted adviser request", async ({ signedIn: page, problems }) => {
  await go(page, "app/protect/apply/medical/details");
  await page.getByLabel("Date of birth").fill("2011-08-20");
  await expect(page.getByText("Under 18? A parent or guardian may need to help.")).toBeVisible();
  await page.getByRole("button", { name: /Request an adviser with a guardian/ }).click();
  await expect(page).toHaveURL(/#app\/protect\/adviser$/);
  expectClean(problems);
});

test("your gaps: tiles and rows open the matching gap page (touch, click and keyboard)", async ({ signedIn: page, problems }) => {
  await go(page, "app/protect");
  const gaps = page.locator("#protect-gaps");
  // Not assessed yet: each area tile is a button that opens that area's page.
  await gaps.getByRole("button", { name: /Critical illness/ }).click();
  await expect(page).toHaveURL(/#app\/protect\/gap\/critical$/);
  await expect(page.locator("h1")).toHaveText("Critical illness");
  await expect(page.locator("#gap-finding")).toHaveText("Not assessed");
  // Answer the check with Medical as a priority → a Gap.
  await go(page, "app/protect/check");
  for (const name of ["Medical cover", "Critical illness cover", "Life & income cover", "Personal accident cover"]) {
    await page.getByRole("radiogroup", { name }).getByRole("radio", { name: "No", exact: true }).click();
  }
  await page.getByRole("checkbox", { name: /Medical/ }).first().click();
  await page.getByRole("button", { name: "Save and see my results" }).click();
  await expect(page).toHaveURL(/#app\/protect$/);
  // The at-a-glance tile (a coloured "Gap" square) is clickable.
  await gaps.getByRole("figure").getByRole("button", { name: /^Medical\s*: Gap/ }).click();
  await expect(page).toHaveURL(/#app\/protect\/gap\/medical$/);
  await expect(page.locator("#gap-finding")).toHaveText("Gap");
  await expect(page.getByRole("button", { name: "Explore cover options" })).toBeVisible();
  // The full row is clickable too, and works from the keyboard.
  await go(page, "app/protect");
  const row = gaps.locator("ul.mt-3 > li > button").filter({ hasText: "Life & income" });
  await row.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#app\/protect\/gap\/life$/);
  await expect(page.locator("#gap-finding")).toHaveText("Review");
  // Other areas switch between gap pages.
  await page.getByRole("navigation", { name: "Other areas" }).getByRole("button", { name: /Medical/ }).click();
  await expect(page).toHaveURL(/#app\/protect\/gap\/medical$/);
  expectClean(problems);
});

test("how protection works: every category has how-it-works, cover panels, example and next steps", async ({ signedIn: page, problems }) => {
  for (const slug of ["medical", "critical-illness", "life", "tpd", "personal-accident"]) {
    await go(page, `app/learn/protection/${slug}`);
    for (const id of ["how-it-works", "may-help-title", "not-cover-title", "example-title", "learn-more-title"]) {
      await expect(page.locator(`#${id}`), `${slug}: #${id}`).toBeVisible();
    }
    await expect(page.locator("#not-cover-title")).toHaveText("Doesn't automatically cover");
    expect(await page.locator("section[aria-labelledby=not-cover-title] li").count(), `${slug} exclusions`).toBeGreaterThan(1);
  }
  // Medical's bill flow reconciles: insurance + you = the bill.
  await go(page, "app/learn/protection/medical");
  await expect(page.getByRole("figure", { name: /Of a RM12,000 bill, insurance pays RM9,810 and you pay RM2,190/ })).toBeVisible();
  // Learn more → Talk to an adviser opens the request with the topic ticked.
  await page.locator("section[aria-labelledby=learn-more-title]").getByRole("button", { name: /Talk to an adviser/ }).click();
  await expect(page).toHaveURL(/#app\/protect\/adviser$/);
  expectClean(problems);
});

test("simulate: scenario cards switch, the limits are stated, the bill simulator shows who pays", async ({ signedIn: page, problems }) => {
  await go(page, "app/simulate");
  await expect(page.locator("h1")).toHaveText("Try a real-life scenario.");
  await expect(page.getByText(/can.t tell you whether a real insurer would approve a claim/)).toBeVisible();
  await page.getByRole("tab", { name: /Family/ }).click();
  await expect(page.getByRole("tab", { name: /Family/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("What your dependants might need", { exact: false })).toBeVisible();
  await page.getByRole("tab", { name: /Medical bill/ }).click();

  await page.getByRole("button", { name: /Start the bill simulator/ }).click();
  await page.getByLabel(/I understand this is an illustrative educational scenario/).check();
  const next = () => page.getByRole("button", { name: "Continue", exact: true }).or(page.getByRole("button", { name: "Continue to scenario" })).first().click();
  await next();
  await page.getByLabel(/^Inpatient/).check();
  await page.getByLabel(/^Assume it's covered/).check();
  await next();
  await page.getByLabel("Gross medical bill").fill("10000.00");
  await page.getByLabel("Description").fill("Ward and surgery");
  await page.getByLabel("Line amount").fill("10000.00");
  await next();
  await page.getByLabel(/^Assume eligible/).check();
  await next();
  await page.getByLabel("Employer scenario maximum").fill("0.00");
  await page.getByLabel("Remaining deductible for this scenario").fill("500.00");
  await page.getByRole("group", { name: /reduce the remaining deductible/ }).getByLabel(/^No/).check();
  await next();
  await page.getByLabel(/^Deductible first/).check();
  await page.getByRole("group", { name: /Share type/ }).getByLabel(/^Co-payment/).check();
  await page.getByLabel("Selected share rate").fill("0.10");
  await page.getByLabel(/^No waiver assumption/).check();
  for (const group of await page.getByRole("group", { name: /current-claim limit/ }).all()) await group.getByLabel(/^Assume no limit/).check();
  await next();
  await page.getByRole("button", { name: "Calculate educational result" }).click();
  const whoPays = page.getByTestId("medical-claim-who-pays");
  await expect(whoPays).toBeVisible();
  await expect(whoPays).toHaveAttribute("aria-label", /Insurer payment RM\s?8,?550\.00/);
  await expect(whoPays).toHaveAttribute("aria-label", /Patient payable RM\s?1,?450\.00/);
  await expect(page.locator("main")).not.toContainText(/claim (is )?(approved|submitted)|you('re| are) covered/i);
  expectClean(problems);
});
