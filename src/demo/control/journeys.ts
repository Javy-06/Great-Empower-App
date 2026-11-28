/**
 * Guided demo journeys: optional checkpoints a presenter can follow through the REAL app.
 * A step's `route` is opened only when the presenter presses Next step (never automatically).
 * `match` lets the step indicator follow along when the presenter gets there by tapping the app.
 * Pure data, no React.
 */
export interface JourneyContext {
  hash: string;
  signals: string[];
  earned: string[];
}

export interface JourneyStep {
  id: string;
  label: string;
  /** What to show or say at this step, in one line. */
  hint: string;
  route?: string;
  /** Element to scroll into view when Next step opens this step. */
  focus?: string;
  match?: (c: JourneyContext) => boolean;
}

export interface Journey {
  id: string;
  title: string;
  summary: string;
  steps: JourneyStep[];
}

export const DEMO_VIDEO_ID = "how-insurance-works-in-malaysia";
export const DEMO_REWARD_ID = "gev-rm10";

const VIDEO = `app/learn/video/${DEMO_VIDEO_ID}`;
const REWARD = `app/rewards/product/${DEMO_REWARD_ID}`;

export const journeys: Journey[] = [
  {
    id: "learn",
    title: "Learn → Earn points",
    summary: "Open a video, explain the completion rule, finish it and earn points.",
    steps: [
      { id: "learn-home", label: "Open Learn", hint: "Lessons, short videos and infographics, each with a reward.", route: "app/learn", match: (c) => c.hash === "app/learn" },
      { id: "open-video", label: "Open a video", hint: "Open “How insurance actually works in Malaysia”.", route: VIDEO, match: (c) => c.hash === VIDEO },
      { id: "rule", label: "The completion rule", hint: "Points need the whole video watched. Skipping ahead doesn't count.", route: VIDEO, focus: "[data-demo='watch-rule']" },
      { id: "playback", label: "Video playback", hint: "Play a few seconds, then use Skip waiting to finish the demo lesson.", route: VIDEO, focus: "video" },
      {
        id: "earned",
        label: "Points earned",
        hint: "Lesson complete: points added and learning progress updated.",
        route: VIDEO,
        focus: "[data-demo='lesson-complete']",
        match: (c) => c.earned.includes(`video-finished:${DEMO_VIDEO_ID}`),
      },
      { id: "history", label: "See it in Rewards", hint: "The points appear in the wallet's history.", route: "app/rewards/wallet", focus: "[data-demo='history']", match: (c) => c.hash === "app/rewards/wallet" },
    ],
  },
  {
    id: "rewards",
    title: "Rewards → Redeem",
    summary: "Browse, pick a reward, redeem and confirm, then see it in the wallet.",
    steps: [
      { id: "hub", label: "Rewards Hub", hint: "Points balance, and what can be redeemed now.", route: "app/rewards", match: (c) => c.hash === "app/rewards" },
      { id: "browse", label: "Browse rewards", hint: "The marketplace: food, drinks and vouchers.", route: "app/rewards/marketplace", match: (c) => c.hash.startsWith("app/rewards/marketplace") },
      { id: "details", label: "Reward details", hint: "Name, picture, description and points cost.", route: REWARD, match: (c) => c.hash.startsWith("app/rewards/product/") },
      { id: "confirm", label: "Redeem and confirm", hint: "Tap Redeem, then Confirm demo redemption (or Cancel).", route: REWARD, match: (c) => c.signals.includes("reward-confirm") },
      { id: "success", label: "Redemption success", hint: "Points used, balance now, and where the reward is kept.", match: (c) => c.signals.includes("reward-done") },
      { id: "wallet", label: "View in wallet", hint: "The reward and the history entry, saved in the demo only.", route: "app/rewards/wallet", match: (c) => c.hash === "app/rewards/wallet" },
    ],
  },
  {
    id: "protect",
    title: "Check → Gap → Get cover",
    summary: "From the protection check to a gap, then to a saved application draft.",
    steps: [
      { id: "check", label: "Protection Check", hint: "Eight private answers. Already filled in for Aisyah.", route: "app/protect/check", match: (c) => c.hash === "app/protect/check" },
      { id: "gaps", label: "Your gaps", hint: "A finding for each kind of cover.", route: "app/protect", focus: "#protect-gaps", match: (c) => c.hash === "app/protect" },
      { id: "gap", label: "A gap explained", hint: "Critical illness: a priority with no cover yet.", route: "app/protect/gap/critical", match: (c) => c.hash.startsWith("app/protect/gap/") },
      { id: "apply", label: "Get cover", hint: "Apply in the app, or talk to an adviser.", route: "app/protect/get-cover/critical/how", match: (c) => c.hash.startsWith("app/protect/get-cover") },
      { id: "draft", label: "Application draft", hint: "Saved on the device; never sent to an insurer.", route: "app/protect/apply/critical/cover", match: (c) => c.hash.startsWith("app/protect/apply/") },
    ],
  },
  {
    id: "simulate",
    title: "Simulate a hospital bill",
    summary: "Load a sample bill instead of typing it, then show who pays.",
    steps: [
      { id: "scenarios", label: "Pick a scenario", hint: "Four what-if scenarios with numbers you choose.", route: "app/simulate", match: (c) => c.hash.startsWith("app/simulate") },
      { id: "sample", label: "Load a sample bill", hint: "Skip waiting fills a RM12,000 bill; every step stays editable.", route: "app/simulate", focus: "#medical-claim-simulator", match: (c) => c.signals.includes("sim-sample") },
      { id: "result", label: "Who pays", hint: "Calculate: plan, employer and patient, stage by stage.", match: (c) => c.signals.includes("sim-result") },
    ],
  },
  {
    id: "adviser",
    title: "Adviser request (under 18)",
    summary: "A guardian-assisted request, with honest demo confirmation.",
    steps: [
      { id: "start", label: "Talk to an adviser", hint: "No backend: requests stay on the device.", route: "app/protect/adviser", match: (c) => c.hash === "app/protect/adviser" },
      { id: "details", label: "Personal details", hint: "Skip waiting fills a sample request for a 14-year-old.", route: "app/protect/adviser/details", match: (c) => c.hash === "app/protect/adviser/details" },
      { id: "guidance", label: "Age guidance", hint: "Age comes from the date of birth; a guardian joins in.", match: (c) => c.hash === "app/protect/adviser/guidance" },
      { id: "contact", label: "Guardian contact", hint: "The guardian is the contact, not the child.", match: (c) => c.hash === "app/protect/adviser/contact" },
      { id: "review", label: "Review", hint: "Tick the demo acknowledgement, then save.", match: (c) => c.hash === "app/protect/adviser/review" },
      { id: "done", label: "Saved, not sent", hint: "Sent to an adviser: No. Contact arranged: No.", match: (c) => c.hash === "app/protect/adviser/done" },
    ],
  },
];

export const findJourney = (id: string | null | undefined) => journeys.find((j) => j.id === id);

/**
 * The step the indicator should show: the furthest LATER step that matches, else the current one.
 * Never moves backwards on its own.
 */
export function followStep(journey: Journey, current: number, ctx: JourneyContext): number {
  for (let i = journey.steps.length - 1; i > current; i--) if (journey.steps[i].match?.(ctx)) return i;
  return current;
}
