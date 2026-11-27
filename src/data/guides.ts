/**
 * Practical guides: answers to real questions with steps you can act on. General education only —
 * every guide points users back to their own policy wording and licensed advice. The first three
 * articles are the project's original Guide content, unchanged.
 */
export type GuideCategory = "insurance-basics" | "medical-claims" | "planning" | "life-events" | "mistakes";

export const guideCategories: Array<{ key: GuideCategory; label: string }> = [
  { key: "insurance-basics", label: "Insurance Basics" },
  { key: "medical-claims", label: "Medical & Claims" },
  { key: "planning", label: "Planning & Budgeting" },
  { key: "life-events", label: "Life Events & Needs" },
  { key: "mistakes", label: "Common Mistakes" },
];

export interface Guide {
  id: string;
  category: GuideCategory;
  format: "step-by-step" | "explainer" | "checklist";
  title: string;
  minutes: number;
  summary: string;
  image: string;
  /** Explainer points or ordered steps. */
  points: string[];
  related?: Array<{ label: string; href: string }>;
  furtherReading?: Array<{ label: string; href: string }>;
  featured?: boolean;
}

const img = {
  protection: "/images/pexels/family-protection-conversation.webp",
  health: "/images/pexels/everyday-health-wellbeing.webp",
  hospital: "/images/pexels/protection-medical-hospital-rest.webp",
  saving: "/images/pexels/young-professional-savings-planning.webp",
  study: "/images/pexels/young-asian-students-learning-together.webp",
  friends: "/images/pexels/young-friends-cafe-community.webp",
};

export const guides: Guide[] = [
  {
    id: "make-a-claim",
    category: "medical-claims",
    format: "step-by-step",
    title: "How to make a medical claim",
    minutes: 5,
    summary: "A general walkthrough from hospital visit to claim decision.",
    image: img.hospital,
    featured: true,
    points: [
      "Check your policy or certificate first: what is covered, your limits, any panel hospitals and the time limit for claims.",
      "For a planned admission, contact your insurer or takaful operator early and ask whether a guarantee letter (GL) is available for your hospital.",
      "At the hospital, show your ID and policy details and let the hospital know you have cover.",
      "Keep itemised bills, receipts, referral letters and medical reports — you may need them.",
      "Submit your claim with the required documents within the stated time limit, and keep copies of everything.",
      "If a claim is declined, ask for the reason in writing. You can raise it with the insurer's complaints unit and, if unresolved, the Ombudsman for Financial Services.",
    ],
    related: [
      { label: "Hospital bills: what to expect", href: "app/learn/lesson/hospital-bills" },
      { label: "Try the medical claim simulator", href: "app/simulate" },
    ],
  },
  {
    id: "cost-sharing-explained",
    category: "insurance-basics",
    format: "explainer",
    title: "Deductible, co-payment and annual limit explained",
    minutes: 4,
    summary: "Three terms that decide how much of a medical bill you pay yourself.",
    image: img.hospital,
    featured: true,
    points: [
      "Deductible: a fixed amount you pay first before the plan starts paying.",
      "Co-payment (or co-insurance): a share of the eligible bill you pay, sometimes up to a cap.",
      "Annual limit: the most the plan pays in a policy year; it usually resets each year.",
      "The order these are applied in, and any caps, depend on your policy wording.",
    ],
    related: [
      { label: "Deductibles, limits and shared costs", href: "app/learn/lesson/deductibles" },
      { label: "Explore cost sharing in Simulate", href: "app/simulate" },
    ],
  },
  {
    id: "how-much-cover",
    category: "planning",
    format: "checklist",
    title: "How much coverage do I really need?",
    minutes: 6,
    summary: "Questions to work through before comparing any plan.",
    image: img.saving,
    featured: true,
    points: [
      "List your essential monthly costs — rent, food, transport, loans.",
      "Note who depends on your income, now or soon (parents, partner, children).",
      "Check what you already have, including any employer group cover.",
      "Decide what you want to protect first: medical bills, a serious illness, income or accidents.",
      "Set a monthly amount you can keep paying comfortably, even in a tight month.",
    ],
    related: [{ label: "Build your protection profile", href: "app/simulate" }],
  },
  {
    id: "first-job",
    category: "life-events",
    format: "step-by-step",
    title: "Starting your first job",
    minutes: 4,
    summary: "A few protection basics to sort out with your first payslip.",
    image: img.friends,
    points: [
      "Ask HR what group cover comes with your job and what happens to it if you leave.",
      "Start a small emergency fund before taking on new commitments.",
      "Review your budget after your first two or three payslips, using real spending.",
      "Revisit your protection needs when your income or responsibilities change.",
    ],
    related: [
      { label: "Plan confidently for your first payslip", href: "app/learn/lesson/first-salary" },
      { label: "Size your emergency fund", href: "app/simulate" },
    ],
  },
  {
    id: "before-you-buy",
    category: "mistakes",
    format: "checklist",
    title: "Common mistakes before buying a plan",
    minutes: 4,
    summary: "Avoidable slips that can cost you at claim time.",
    image: img.study,
    points: [
      "Not disclosing health facts honestly — non-disclosure can affect future claims.",
      "Skipping the exclusions and waiting periods section of the policy wording.",
      "Choosing on premium alone without checking limits, deductibles and co-payments.",
      "Assuming medical cover will replace your salary — it usually will not.",
      "Not using the free-look period to review the documents after you receive them.",
    ],
    related: [{ label: "What is insurance? (video)", href: "app/learn/video/what-is-insurance" }],
  },
  {
    id: "protection-purposes",
    category: "insurance-basics",
    format: "explainer",
    title: "Understanding financial protection purposes",
    minutes: 6,
    summary: "A plain-language overview of different protection purposes and benefit types.",
    image: img.protection,
    points: [
      "Protection products can be designed for different purposes and may pay benefits in different ways.",
      "Medical reimbursement, critical illness benefits and income-style benefits are different and are not interchangeable.",
      "Eligibility, limits, exclusions and claim conditions depend on the relevant policy or certificate.",
    ],
  },
  {
    id: "hospital-costs",
    category: "medical-claims",
    format: "explainer",
    title: "How hospital costs affect planning",
    minutes: 4,
    summary: "Understand how eligible healthcare costs, policy terms and personal savings can fit together.",
    image: img.hospital,
    points: [
      "Medical and health cover is generally designed for eligible healthcare costs, subject to the policy or certificate.",
      "Exclusions, limits, waiting periods, deductibles and co-payments can affect benefits and out-of-pocket costs.",
      "Medical cover is not automatically salary replacement. Check the specific terms and claim requirements.",
    ],
    furtherReading: [
      { label: "Bank Negara Malaysia: MHIT overview", href: "https://www.bnm.gov.my/faqs/ins-tkf/life-family" },
      { label: "InsuranceInfo: medical and health cover", href: "https://insuranceinfo.com.my/learn-the-basics/types-of-insurance/medical-health-insurance/" },
    ],
  },
  {
    id: "emergency-fund",
    category: "planning",
    format: "explainer",
    title: "Building an emergency fund",
    minutes: 5,
    summary: "Explore how a cash reserve may help with unexpected expenses or a temporary disruption.",
    image: img.saving,
    points: [
      "A cash reserve can help meet unexpected costs without relying immediately on credit.",
      "A suitable amount depends on personal circumstances, essential expenses and available support.",
      "The GREAT EMPOWER calculator is illustrative and does not assess or recommend a personal target.",
    ],
  },
];

export const readinessChecklist = [
  { id: "know-cover", label: "I know what cover I already have (including employer cover)" },
  { id: "emergency", label: "I have started an emergency fund" },
  { id: "budget", label: "I know how much I can spend on protection each month" },
  { id: "dependants", label: "I've thought about who depends on my income" },
  { id: "terms", label: "I understand deductibles, co-payments and limits" },
  { id: "disclose", label: "I know to disclose health facts honestly when applying" },
];
