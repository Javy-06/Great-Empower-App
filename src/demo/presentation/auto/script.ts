import type { Driver } from "./driver";

/**
 * The Auto Demo script: every feature of GREAT EMPOWER as a sequence of steps that drive the REAL
 * app in the phone. Each step has an id, the topic it belongs to, a caption (what the audience is
 * shown and told), the UI actions with sample input, and how long to hold the result on screen.
 * A step's `run` must be safe to run again from the start (Retry, Resume after manual control):
 * it opens its own screen first and skips actions whose result is already there.
 *
 * SAMPLE DATA is fictional (Aisyah Rahman, demo@example.com, 012-000 0000). Every action stays in
 * the isolated demo namespace; nothing is sent to an insurer, adviser, merchant or server.
 */
export interface AutoStep {
  id: string;
  caption: string;
  /** Presentation time after the action, before the next step (ms, scaled by speed). */
  hold?: number;
  run: (d: Driver) => Promise<void>;
  /** A step that waits for the presenter (e.g. leaving to an external site). */
  presenter?: { prompt: string; label: string; href: string };
}

export interface AutoFeature {
  id: string;
  /** The presentation topic shown on the right while this feature runs. */
  topic: string;
  title: string;
  steps: AutoStep[];
}

export const SAMPLE = {
  name: "Aisyah Rahman",
  dob: "2002-05-14", // 24 on the demo date
  occupation: "Junior UX Designer",
  income: "3200",
  expenses: "2300",
  email: "demo@example.com",
  phone: "012-000 0000",
  note: "I would like to understand my medical coverage options.",
};

/** A preferred day a few days ahead (a preference shown in the form, never a booking). */
export function sampleDay(now = new Date()) {
  const d = new Date(now);
  d.setDate(d.getDate() + 3);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const step = (id: string, caption: string, run: AutoStep["run"], hold = 2600): AutoStep => ({ id, caption, run, hold });

const CATEGORIES = [
  { slug: "medical", name: "Medical Expense Protection" },
  { slug: "critical-illness", name: "Critical Illness" },
  { slug: "life", name: "Life / Income Protection" },
  { slug: "personal-accident", name: "Personal Accident" },
];

export const features: AutoFeature[] = [
  /* ------------------------------------------------------------------ Home */
  {
    id: "home",
    topic: "overview",
    title: "Home",
    steps: [
      step("home-open", "Home: Aisyah's personal dashboard. Aisyah is a fictional sample profile.", async (d) => {
        await d.navigate("app/home");
        await d.show("main h1");
      }),
      step("home-balance", "Her rewards balance is always one tap away.", async (d) => {
        await d.navigate("app/home");
        await d.show({ role: "button", name: /^Rewards Hub/ });
      }, 2000),
      step("home-next", "Your next step: learning progress and the protection path, in order.", async (d) => {
        await d.navigate("app/home");
        await d.show("section[aria-labelledby=next-title]");
      }),
      step("home-overview", "A quick way into how protection works.", async (d) => {
        await d.navigate("app/home");
        await d.show("section[aria-labelledby=start-title]");
      }, 2200),
      step("home-nav", "Five places: Home, Learn, Simulate, Protect and Guide.", async (d) => {
        await d.navigate("app/home");
        await d.show("nav[aria-label=Primary]");
      }, 2200),
    ],
  },

  /* ------------------------------------------------------------------ The problem */
  {
    id: "problem",
    topic: "youth-gap",
    title: "The problem",
    steps: [
      step("problem-risks", "Risks first: what can happen, and what it costs.", async (d) => {
        await d.navigate("app/learn/protection");
        await d.show("section[aria-labelledby=big-picture]");
      }),
      step("problem-cover", "Each risk is matched to the kind of cover that helps.", async (d) => {
        await d.navigate("app/learn/protection");
        await d.show("#what-happens");
      }),
    ],
  },

  /* ------------------------------------------------------------------ Learn */
  {
    id: "learn",
    topic: "learn",
    title: "Learn",
    steps: [
      step("learn-open", "Learn: lessons, short videos and infographics.", async (d) => {
        await d.navigate("app/learn");
        await d.show("[role=tablist][aria-label='Learning formats']");
      }, 2000),
      step("learn-browse", "Browse the lessons.", async (d) => {
        await d.navigate("app/learn");
        await d.click("#fmt-lessons");
        await d.show("#learn-lessons");
      }, 2000),
      step("learn-lesson", "Open a lesson: short steps and a quiz at the end.", async (d) => {
        if (d.hash !== "app/learn/lesson/medical-cards") {
          await d.navigate("app/learn");
          await d.click("#fmt-lessons");
          await d.click({ within: "#learn-lessons", role: "button", name: /Medical cards/ });
        }
        await d.show("main h1");
      }),
      step("learn-video", "Now a video lesson.", async (d) => {
        if (d.hash !== "app/learn/video/how-insurance-works-in-malaysia") {
          await d.navigate("app/learn");
          await d.click("#fmt-videos");
          await d.click({ within: "#learn-videos", css: "a[href], button", name: /How insurance actually works in Malaysia/ });
        }
        await d.find("video");
      }, 1200),
      step("learn-play", "The video plays in the app.", async (d) => {
        await d.navigate("app/learn/video/how-insurance-works-in-malaysia");
        if (!d.has("[data-demo=lesson-complete]")) await d.playVideo();
      }, 3500),
      step("learn-rule", "In the real experience, users must watch the whole video to earn points. Skipping ahead doesn't count.", async (d) => {
        await d.navigate("app/learn/video/how-insurance-works-in-malaysia");
        d.pauseVideo();
        if (!d.has("[data-demo=lesson-complete]")) await d.show("[data-demo=watch-rule]");
      }, 3400),
      step("learn-skip", "Demo only: the presenter skips the waiting time to show the completion flow.", async (d) => {
        await d.navigate("app/learn/video/how-insurance-works-in-malaysia");
        if (!d.has("[data-demo=lesson-complete]")) await d.click({ role: "button", name: /^Complete demo lesson/ });
      }, 1200),
      step("learn-complete", "Lesson complete: +40 points, and learning progress updated.", async (d) => {
        await d.navigate("app/learn/video/how-insurance-works-in-malaysia");
        await d.show("[data-demo=lesson-complete]");
      }, 3200),
      step("learn-balance", "The new balance shows straight away.", async (d) => {
        await d.navigate("app/learn/video/how-insurance-works-in-malaysia");
        await d.show({ role: "button", name: /^Rewards Hub/ });
      }, 2000),
    ],
  },

  /* ------------------------------------------------------------------ Protection Check */
  {
    id: "check",
    topic: "check",
    title: "Protection Check",
    steps: [
      step("check-open", "The Protection Check: eight private answers, kept on the device.", async (d) => {
        await d.navigate("app/protect/check");
        await d.show("section[aria-labelledby=profile-title]");
      }, 2000),
      step("check-profile", "Fill in the sample profile: 24, RM3,200 a month, supports her parents.", async (d) => {
        await d.navigate("app/protect/check");
        await d.type({ role: "field", name: /^Age/ }, "24");
        await d.type({ role: "field", name: /^Monthly income/ }, SAMPLE.income);
        await d.type({ role: "field", name: /^Monthly expenses/ }, SAMPLE.expenses);
        await d.select({ role: "field", name: /^Who depends on you/ }, "parents");
      }, 1200),
      step("check-cover", "Her existing cover: medical through work, no critical illness cover, not sure about life.", async (d) => {
        await d.navigate("app/protect/check");
        await d.setChecked({ within: "[aria-label='Medical cover']", role: "radio", name: "Yes" });
        await d.setChecked({ within: "[aria-label='Critical illness cover']", role: "radio", name: "No" });
        await d.setChecked({ within: "[aria-label='Life & income cover']", role: "radio", name: "Not sure" });
        await d.setChecked({ within: "[aria-label='Personal accident cover']", role: "radio", name: "No" });
      }, 1200),
      step("check-priorities", "What matters most to her: medical and critical illness.", async (d) => {
        await d.navigate("app/protect/check");
        await d.setChecked({ within: "section[aria-labelledby=priorities-title]", role: "checkbox", name: /^Medical/ }, true);
        await d.setChecked({ within: "section[aria-labelledby=priorities-title]", role: "checkbox", name: /^Critical illness/ }, true);
        await d.setChecked({ within: "section[aria-labelledby=priorities-title]", role: "checkbox", name: /^Life/ }, false);
        await d.setChecked({ within: "section[aria-labelledby=priorities-title]", role: "checkbox", name: /^Personal accident/ }, false);
      }, 1200),
      step("check-save", "Save, and the summary appears.", async (d) => {
        if (d.hash === "app/protect/check") await d.click({ role: "button", name: /^Save and see my results/ });
        await d.navigate("app/protect");
        await d.show("#protect-gaps");
      }, 3000),
    ],
  },

  /* ------------------------------------------------------------------ Your gap */
  {
    id: "gap",
    topic: "gap",
    title: "Your protection gap",
    steps: [
      step("gap-summary", "One finding per area: Covered, Review, or Gap.", async (d) => {
        await d.navigate("app/protect");
        await d.show("#protect-gaps figure");
      }),
      step("gap-open", "Critical illness is a gap: it matters to her, and she has no cover.", async (d) => {
        if (!d.hash.startsWith("app/protect/gap/critical")) {
          await d.navigate("app/protect");
          await d.click({ within: "#protect-gaps figure", role: "button", name: /^Critical illness\s*: Gap/ });
        }
        await d.show("#gap-finding");
      }, 3000),
      step("gap-why", "What this cover does, and what it doesn't automatically cover.", async (d) => {
        await d.navigate("app/protect/gap/critical");
        await d.show("section[aria-labelledby=gap-what]");
      }, 3000),
      step("gap-next", "Clear next steps: explore cover, talk to an adviser, or change an answer.", async (d) => {
        await d.navigate("app/protect/gap/critical");
        await d.show("section[aria-labelledby=gap-next]");
      }),
      step("gap-category", "Each gap links to how that kind of protection works.", async (d) => {
        if (d.hash !== "app/learn/protection/critical-illness") {
          await d.navigate("app/protect/gap/critical");
          await d.click({ role: "link", name: /^How Critical Illness Recovery works/ });
        }
        await d.show("#how-it-works");
      }),
    ],
  },

  /* ------------------------------------------------------------------ How protection works */
  {
    id: "how",
    topic: "how-protection-works",
    title: "How protection works",
    steps: CATEGORIES.flatMap(({ slug, name }) => [
      step(`how-${slug}-flow`, `${name}: how the money flows.`, async (d) => {
        await d.navigate(`app/learn/protection/${slug}`);
        await d.show("#how-it-works");
      }, 2800),
      step(`how-${slug}-covers`, `${name}: what it may help with.`, async (d) => {
        await d.navigate(`app/learn/protection/${slug}`);
        await d.show("section[aria-labelledby=may-help-title]");
      }, 2200),
      step(`how-${slug}-limits`, `${name}: what it doesn't automatically cover.`, async (d) => {
        await d.navigate(`app/learn/protection/${slug}`);
        await d.show("section[aria-labelledby=not-cover-title]");
      }, 2200),
      step(`how-${slug}-example`, `${name}: a real-life example.`, async (d) => {
        await d.navigate(`app/learn/protection/${slug}`);
        await d.show("section[aria-labelledby=example-title]");
      }, 2400),
    ]),
  },

  /* ------------------------------------------------------------------ Compare */
  {
    id: "compare",
    topic: "compare",
    title: "Compare",
    steps: [
      step("compare-open", "Compare: real products with facts verified in official documents. Educational, not a recommendation.", async (d) => {
        await d.navigate("app/protect/products");
        await d.show("[role=group][aria-label='Filter by kind of cover']");
      }),
      step("compare-filter", "Filter by kind of cover.", async (d) => {
        await d.navigate("app/protect/products");
        await d.click({ within: "[role=group][aria-label='Filter by kind of cover']", role: "button", name: /^Medical Expense Protection/ });
        await d.wait(1200);
        await d.click({ within: "[role=group][aria-label='Filter by kind of cover']", role: "button", name: /^All/ });
      }, 800),
      step("compare-pick", "Pick two products to compare.", async (d) => {
        await d.navigate("app/protect/products");
        if (!d.has("[role=table][aria-label='Product comparison']")) {
          await d.click({ role: "button", name: "Add to compare" });
          await d.click({ role: "button", name: "Add to compare" });
        }
      }, 800),
      step("compare-result", "Side by side: verified facts, and what still needs confirming. No rankings, no prices.", async (d) => {
        await d.navigate("app/protect/products");
        await d.show("[role=table][aria-label='Product comparison']");
      }, 3600),
    ],
  },

  /* ------------------------------------------------------------------ Get cover + apply */
  {
    id: "get-cover",
    topic: "get-cover",
    title: "Get cover",
    steps: [
      step("cover-open", "Get cover: pick a kind of cover to explore.", async (d) => {
        await d.navigate("app/protect/get-cover");
        await d.show("section[aria-labelledby=choose-title]");
      }, 2200),
      step("cover-understand", "Medical: first understand what it does and doesn't do.", async (d) => {
        if (!d.hash.startsWith("app/protect/get-cover/medical")) {
          await d.navigate("app/protect/get-cover");
          await d.click({ within: "section[aria-labelledby=choose-title]", role: "button", name: /^Medical/ });
        }
        await d.show("main section[aria-labelledby=may-help]");
      }),
      step("cover-ready", "Then get ready: a short checklist before applying.", async (d) => {
        if (d.hash !== "app/protect/get-cover/medical/ready") {
          await d.navigate("app/protect/get-cover/medical");
          await d.click({ role: "button", name: /^Skip and continue|^Continue$/ });
        }
        await d.setChecked({ role: "checkbox", name: /policy|PDS|cover/i }, true).catch(() => undefined);
      }, 1800),
      step("cover-how", "Apply in GREAT EMPOWER, or talk to an adviser.", async (d) => {
        if (d.hash !== "app/protect/get-cover/medical/how") {
          await d.navigate("app/protect/get-cover/medical/ready");
          await d.click({ role: "button", name: /^Continue to apply/ });
        }
        await d.show("section[aria-label='Apply in GREAT EMPOWER']");
      }, 2400),
      step("apply-details", "Step 1: personal and contact details (fictional sample data).", async (d) => {
        if (d.hash !== "app/protect/apply/medical/details") {
          await d.navigate("app/protect/get-cover/medical/how");
          await d.click({ role: "button", name: /^Start your application|^Continue your application|^View your application/ });
        }
        await d.navigate("app/protect/apply/medical/details");
        await d.type({ role: "field", name: /^Full name/ }, SAMPLE.name);
        await d.type({ role: "field", name: /^Date of birth/ }, SAMPLE.dob);
        await d.setChecked({ role: "radio", name: "Malaysian citizen" });
        await d.type({ role: "field", name: /^Occupation/ }, SAMPLE.occupation);
        await d.type({ role: "field", name: /^Mobile number/ }, SAMPLE.phone);
        await d.type({ role: "field", name: /^Email/ }, SAMPLE.email);
        await d.click({ role: "button", name: "Continue" });
      }, 800),
      step("apply-cover", "Step 2: the cover she'd like. Preferences, not a quote.", async (d) => {
        await d.navigate("app/protect/apply/medical/cover");
        await d.setChecked({ within: "#amount", role: "radio", name: /^RM100,000/ });
        await d.type({ role: "field", name: /^What you could spend a month/ }, "120");
        await d.setChecked({ within: "#frequency", role: "radio", name: "Monthly" });
        await d.setChecked({ within: "#basis", role: "radio", name: "Either is fine" });
        await d.setChecked({ within: "#existing", role: "radio", name: "Yes" });
        await d.click({ role: "button", name: "Continue" });
      }, 800),
      step("apply-health", "Step 3: health questions, answered honestly.", async (d) => {
        await d.navigate("app/protect/apply/medical/health");
        for (const key of ["tobacco", "condition", "medication", "hospital", "occupationRisk"]) await d.setChecked(`#${key}-no`);
        await d.click({ role: "button", name: /^Review my application/ });
      }, 800),
      step("apply-review", "Step 4: review every answer, then the declarations.", async (d) => {
        await d.navigate("app/protect/apply/medical/review");
        await d.show("section[aria-label='Your details']");
        await d.wait(1200);
        await d.setChecked("#truthful");
        await d.setChecked("#understandsNotSent");
        await d.click({ role: "button", name: "Complete application" });
      }, 800),
      step("apply-done", "Completed in GREAT EMPOWER. No application is sent to an insurer, no policy is issued, and no cover is activated.", async (d) => {
        await d.navigate("app/protect/apply/medical/done");
        await d.show("section[aria-labelledby=status-title]");
      }, 4200),
    ],
  },

  /* ------------------------------------------------------------------ Adviser */
  {
    id: "adviser",
    topic: "adviser",
    title: "Talk to an adviser",
    steps: [
      step("adviser-open", "Want help first? Talk to an adviser.", async (d) => {
        if (!d.hash.startsWith("app/protect/adviser")) {
          await d.navigate("app/protect");
          await d.click({ within: "#protect-apply", role: "button", name: /^Talk to an adviser/ });
        }
        await d.show("section[aria-labelledby=adviser-how]");
      }),
      step("adviser-details", "Her details. Age is worked out from the date of birth.", async (d) => {
        if (d.hash !== "app/protect/adviser/details") {
          await d.navigate("app/protect/adviser");
          await d.click({ role: "button", name: /^Start my request|^Continue my request/ });
        }
        await d.type({ role: "field", name: /^Full name/ }, SAMPLE.name);
        await d.type({ role: "field", name: /^Date of birth/ }, SAMPLE.dob);
        await d.setChecked({ role: "button", name: "Medical" }, true);
      }, 1400),
      step("adviser-guidance", "18 or over: her own request. Under 18, a parent or guardian joins in.", async (d) => {
        if (d.hash === "app/protect/adviser/details") await d.click({ role: "button", name: "Continue" });
        await d.navigate("app/protect/adviser/guidance");
        await d.show("main section[aria-labelledby=adviser-step-title]");
      }, 2400),
      step("adviser-contact", "Contact preferences: phone, afternoon (2:00 PM), a preferred day and a note.", async (d) => {
        if (d.hash === "app/protect/adviser/guidance") await d.click({ role: "button", name: "Continue" });
        await d.navigate("app/protect/adviser/contact");
        await d.type({ role: "field", name: /^Mobile number/ }, SAMPLE.phone);
        await d.type({ role: "field", name: /^Email/ }, SAMPLE.email);
        await d.setChecked("#method-phone");
        await d.setChecked("#time-afternoon");
        await d.type("#preferredDate", sampleDay());
        await d.type("#notes", SAMPLE.note);
      }, 1400),
      step("adviser-review", "Review the request.", async (d) => {
        if (d.hash === "app/protect/adviser/contact") await d.click({ role: "button", name: /^Review my request/ });
        await d.navigate("app/protect/adviser/review");
        await d.show("main section[aria-labelledby=adviser-step-title]");
        await d.setChecked("#understandsDemo");
      }, 1600),
      step("adviser-submit", "Submit: a demo request. No real adviser booking or notification is created.", async (d) => {
        if (d.hash === "app/protect/adviser/review") await d.click({ role: "button", name: "Save adviser request" });
        await d.navigate("app/protect/adviser/done");
        await d.show("section[aria-labelledby=adviser-status]");
      }, 3600),
      step("adviser-next", "What happens next: she can take the request to an official adviser channel herself.", async (d) => {
        await d.navigate("app/protect/adviser/done");
        await d.show("section[aria-labelledby=adviser-next]");
      }, 3200),
    ],
  },

  /* ------------------------------------------------------------------ Simulate */
  {
    id: "simulate",
    topic: "simulate",
    title: "Simulate",
    steps: [
      step("sim-open", "Simulate: hypothetical scenarios with numbers you choose. Not a claim or a quote.", async (d) => {
        await d.navigate("app/simulate");
        await d.click("#tab-tool-bill");
      }, 2000),
      step("sim-bill-fill", "Medical bill: a sample RM12,000 hospital bill, filled in for the demo.", async (d) => {
        await d.navigate("app/simulate");
        await d.click("#tab-tool-bill");
        if (!d.has("[data-testid=medical-claim-who-pays]")) {
          if (d.has({ role: "button", name: /^Demo only: load a sample bill/ })) await d.click({ role: "button", name: /^Demo only: load a sample bill/ });
          await d.show("#medical-claim-simulator");
        }
      }, 1600),
      step("sim-bill-calc", "Calculate: who pays what, stage by stage.", async (d) => {
        await d.navigate("app/simulate");
        if (!d.has("[data-testid=medical-claim-who-pays]")) await d.click({ role: "button", name: "Calculate educational result" });
        await d.show("[data-testid=medical-claim-who-pays]");
      }, 3600),
      step("sim-bill-change", "Change one assumption: a 20% co-payment instead of 10%.", async (d) => {
        await d.navigate("app/simulate");
        if (d.has({ role: "button", name: "Edit scenario" })) {
          await d.click({ role: "button", name: "Edit scenario" });
          for (let i = 0; i < 4; i++) await d.click({ role: "button", name: "Continue" });
        }
        await d.type("#share-rate", "0.20");
        for (let i = 0; i < 2 && !d.has({ role: "button", name: "Calculate educational result" }); i++) await d.click({ role: "button", name: "Continue" });
        await d.click({ role: "button", name: "Calculate educational result" });
        await d.show("[data-testid=medical-claim-who-pays]");
      }, 3600),
      step("sim-fund", "Emergency fund: her essentials and savings.", async (d) => {
        await d.navigate("app/simulate");
        await d.click("#tab-tool-fund");
        await d.slide({ within: "#tool-fund", role: "range", name: /^Monthly expenses/ }, 2300);
        await d.slide({ within: "#tool-fund", role: "range", name: /^Already saved/ }, 4500);
      }, 2400),
      step("sim-fund-change", "Save more, and the target gets closer.", async (d) => {
        await d.navigate("app/simulate");
        await d.click("#tab-tool-fund");
        await d.slide({ within: "#tool-fund", role: "range", name: /^Already saved/ }, 9000);
      }, 2600),
      step("sim-family", "Family: what her parents might need if her support stopped.", async (d) => {
        await d.navigate("app/simulate");
        await d.click("#tab-tool-family");
        if (d.has({ within: "#tool-family", role: "field", name: /^Monthly support for dependants/ })) {
          await d.type({ within: "#tool-family", role: "field", name: /^Monthly support for dependants/ }, "400");
        }
        await d.click({ within: "#tool-family", role: "button", name: /^Fill in the research example/ });
        await d.show("#tool-family");
      }, 3200),
      step("sim-ci", "Critical illness: how long a lump sum could last.", async (d) => {
        await d.navigate("app/simulate");
        await d.click("#tab-tool-ci");
        await d.type({ within: "#tool-ci", role: "field", name: /^Monthly take-home income/ }, "3000");
        await d.type({ within: "#tool-ci", role: "field", name: /^Your own critical illness cover/ }, "50000");
        await d.type({ within: "#tool-ci", role: "field", name: /^Employer group critical illness cover/ }, "0");
      }, 2600),
      step("sim-ci-change", "A longer recovery: the same lump sum covers less of it.", async (d) => {
        await d.navigate("app/simulate");
        await d.click("#tab-tool-ci");
        await d.slide("#ci-years", 4);
        await d.show("#tool-ci [aria-live=polite]");
      }, 3000),
    ],
  },

  /* ------------------------------------------------------------------ Rewards */
  {
    id: "rewards",
    topic: "rewards",
    title: "Rewards",
    steps: [
      step("rw-open", "Users earn points through learning and redeem them for rewards.", async (d) => {
        await d.navigate("app/rewards");
        await d.show("main h1");
      }, 2200),
      step("rw-browse", "Browse the catalogue.", async (d) => {
        await d.navigate("app/rewards/marketplace");
        await d.show("main h1");
      }, 2000),
      step("rw-details", "Open a reward: picture, description and the points it needs.", async (d) => {
        if (!d.hash.startsWith("app/rewards/product/gev-rm10")) {
          await d.navigate("app/rewards/marketplace");
          await d.click({ css: "a[href], button", name: /Great Empower RM10 Voucher/ });
        }
        await d.show({ role: "button", name: /^Redeem for|^Already in your wallet/ });
      }, 2400),
      step("rw-redeem", "Redeem, then confirm.", async (d) => {
        await d.navigate("app/rewards/product/gev-rm10");
        if (d.has({ role: "button", name: /^Redeem for/ })) await d.click({ role: "button", name: /^Redeem for/ });
        await d.show({ role: "button", name: "Confirm demo redemption" });
      }, 1800),
      step("rw-confirm", "Successfully redeemed, in demo mode. No voucher, order, payment or delivery happens.", async (d) => {
        if (d.has({ role: "button", name: "Confirm demo redemption" })) await d.click({ role: "button", name: "Confirm demo redemption" });
        await d.show("main h1");
      }, 3600),
      step("rw-wallet", "The reward is in the wallet, the balance is updated, and it's in the history.", async (d) => {
        if (d.has({ role: "button", name: "View wallet" })) await d.click({ role: "button", name: "View wallet" });
        await d.navigate("app/rewards/wallet");
        await d.show("[data-demo=history]");
      }, 3200),
    ],
  },

  /* ------------------------------------------------------------------ LifeTrack */
  {
    id: "lifetrack",
    topic: "lifetrack",
    title: "LifeTrack",
    steps: [
      step("lt-entry", "LifeTrack: insurance gameplay on its own website, opened from Home.", async (d) => {
        await d.navigate("app/home");
        await d.show("section[aria-labelledby=game-entry-title]");
      }, 3000),
      {
        id: "lt-open",
        caption: "The game opens in a new tab. The presenter decides when.",
        hold: 0,
        run: async (d) => {
          await d.navigate("app/home");
          await d.show("section[aria-labelledby=game-entry-title]");
        },
        presenter: { prompt: "Open LifeTrack in a new tab when you're ready, then continue.", label: "Open LifeTrack", href: "https://lifetrack-plum.vercel.app/" },
      },
    ],
  },

  /* ------------------------------------------------------------------ Impact */
  {
    id: "impact",
    topic: "impact",
    title: "Impact",
    steps: [
      step("impact-journey", "One journey: learn, check, understand, compare, then act.", async (d) => {
        await d.navigate("app/protect");
        await d.show("nav[aria-label='Your protection journey']");
      }, 3000),
      step("impact-close", "Learn. Understand. Protect. Empower.", async (d) => {
        await d.navigate("app/home");
        await d.show("main h1");
      }, 3000),
    ],
  },
];

export const findFeature = (id: string | null | undefined) => features.find((f) => f.id === id);
export const totalSteps = (list: AutoFeature[] = features) => list.reduce((n, f) => n + f.steps.length, 0);
