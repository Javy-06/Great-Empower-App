/**
 * Protection education content: five insurance categories with two names each (the official
 * category and the financial protection purpose), plus researched products.
 *
 * Accuracy rules (see report/Insurance_Phase_Content_Accuracy_Report.md):
 *  - General statements are phrased generally ("may", "usually", "check your policy"); every
 *    Malaysia-specific fact carries a source.
 *  - Product facts come ONLY from the audited Product Master (design-system worktree,
 *    docs/insurance-engine/product-master, reviewed 22 Nov 2026) and only for fields it marks
 *    VERIFIED_OFFICIAL. Everything else is listed as "needs official confirmation".
 *  - No prices, premiums or quotes are shown except a minimum premium printed on an official page,
 *    labelled as not a quote. No ranking and no "for you" product suggestions.
 */

export type ProtectionSlug = "medical" | "critical-illness" | "life" | "tpd" | "personal-accident";

export interface Source {
  label: string;
  url: string;
}

export interface ProtectionCategory {
  slug: ProtectionSlug;
  /** Official insurance category. */
  official: string;
  /** Financial protection purpose (GREAT EMPOWER's plain-language layer). */
  purpose: string;
  short: string;
  summary: string;
  example: { title: string; text: string };
  mayHelp: string[];
  notAutomatic: string[];
  misunderstandings: Array<{ myth: string; reality: string }>;
  /** "Not the same as" distinctions the brief requires (e.g. Life ≠ debt cancellation). */
  notEqual: Array<{ a: string; b: string; why: string }>;
  malaysia?: Array<{ text: string; source: Source }>;
  infographicId?: string;
  scenario?: { label: string; href: string; text: string };
  sources: Source[];
}

const S = {
  bnmCopay: { label: "BNM — medical and health insurance/takaful co-payment requirements", url: "https://www.bnm.gov.my/-/mhit-req-en" },
  bnmBase: { label: "BNM — Base MHIT plan (MediAsas)", url: "https://www.bnm.gov.my/mhit/baseplan" },
  bnmDirect: { label: "BNM — direct distribution channels for pure protection products", url: "https://www.bnm.gov.my/-/direct-distribution-channels-for-pure-protection-products-1" },
  pidm: { label: "PIDM — Takaful and Insurance Benefits Protection System (TIPS)", url: "https://www.pidm.gov.my/general/how-we-protect-you/takaful-and-insurance-benefits-protection-system" },
  glossary: { label: "InsuranceInfo (BNM) — insurance glossary", url: "https://insuranceinfo.com.my/learn-the-basics/insurance-glossary/" },
  star: { label: "The Star — When coverage runs thin (24 May 2026)", url: "https://thestar.com.my/news/focus/2026/05/24/when-coverage-runs-thin" },
  fmos: { label: "Financial Markets Ombudsman Service (FMOS)", url: "https://www.fmos.org.my/" },
} satisfies Record<string, Source>;

export const protectionSources = S;

export const protectionCategories: ProtectionCategory[] = [
  {
    slug: "medical",
    official: "Medical & Hospitalisation",
    purpose: "Medical Expense Protection",
    short: "Helps pay eligible hospital and treatment bills.",
    summary:
      "Pays eligible hospital and surgical bills, up to the plan's limits, after any deductible or co-payment that applies. Often called a “medical card”. The takaful version is medical takaful.",
    example: {
      title: "Example situation (illustrative)",
      text:
        "Aina, 24, is admitted to a private hospital for appendicitis. Because her hospital is on her insurer's panel, it can bill the insurer directly through a Guarantee Letter. She may still pay a deductible or co-payment, and anything above her plan's limits or outside its cover.",
    },
    mayHelp: [
      "Hospital room and board, up to a daily limit",
      "Surgery, medicine and hospital supplies for an eligible admission",
      "Some treatment before and after a hospital stay, and certain outpatient treatment, depending on the plan",
      "Direct billing at panel hospitals through a Guarantee Letter (GL), so you may not need to pay the full bill upfront",
    ],
    notAutomatic: [
      "Every medical cost — annual limits, sub-limits, room-and-board limits and exclusions still apply",
      "Conditions you had before buying (pre-existing conditions), especially if not disclosed",
      "Illness in the waiting period right after cover starts",
      "Your lost income while you recover",
      "Any deductible or co-payment share you agreed to pay",
    ],
    misunderstandings: [
      { myth: "“I have insurance, so my hospital bill will be zero.”", reality: "Insurance coverage isn't the same as zero cost. Deductibles, co-payment, limits and exclusions can leave part of the bill for you." },
      { myth: "“My employer's cover protects me for good.”", reality: "Employer cover depends on the employer's scheme and usually ends when you leave the job." },
      { myth: "“A medical card replaces my salary while I'm sick.”", reality: "It pays eligible medical bills. It doesn't pay you an income." },
    ],
    notEqual: [{ a: "Medical insurance", b: "All medical expenses covered", why: "Only eligible costs within the plan's limits are paid, after any amount you share." }],
    malaysia: [
      { text: "Since 1 September 2024, insurers and takaful operators must offer a medical plan option with co-payment. A plan without co-payment can still exist, so check yours.", source: S.bnmCopay },
      { text: "MediAsas, BNM's standardised base medical plan, is scheduled for industry-wide launch in January 2027.", source: S.bnmBase },
    ],
    infographicId: "medical-insurance-malaysia",
    scenario: { label: "Open the medical bill simulator", href: "app/simulate/needs/tool-bill", text: "See how a deductible, co-payment and an annual limit split a hospital bill." },
    sources: [S.bnmCopay, S.bnmBase, S.glossary, S.star],
  },
  {
    slug: "critical-illness",
    official: "Critical Illness",
    purpose: "Critical Illness Recovery",
    short: "A lump sum if you're diagnosed with a covered illness.",
    summary:
      "Pays a one-off lump sum if you are diagnosed with an illness listed in the policy and the diagnosis meets the policy's definition. You decide how to use the money.",
    example: {
      title: "Example situation (illustrative)",
      text:
        "Wei Ming, 29, is diagnosed with a covered cancer and stops working for treatment. His medical card pays eligible hospital bills; a critical illness payout, if approved, gives him a lump sum for rent, loan repayments and recovery costs. Whether it lasts depends on its size and his costs.",
    },
    mayHelp: [
      "A lump sum on diagnosis of a listed illness, such as certain cancers, heart attack or stroke, when the definition is met",
      "Money you can use for living costs, debts or recovery while you can't work",
      "Some plans also pay for early-stage diagnoses or allow more than one claim",
    ],
    notAutomatic: [
      "A monthly salary — the lump sum is fixed and may run out",
      "Every illness — only listed conditions that meet the policy's definition and severity",
      "Diagnoses during the waiting period after cover starts",
      "Hospital bills directly — that's what medical insurance does",
    ],
    misunderstandings: [
      { myth: "“Critical illness cover replaces my income.”", reality: "It pays a one-off amount. How long it lasts depends on the amount and your costs — try the recovery runway scenario." },
      { myth: "“My medical card already covers a serious illness.”", reality: "A medical card pays eligible hospital bills. Living costs and lost income during recovery are not covered by it." },
      { myth: "“Any stage of a listed illness qualifies.”", reality: "Definitions, stages and severity matter. Some plans pay only for advanced stages." },
    ],
    notEqual: [{ a: "Critical illness cover", b: "Income replacement", why: "A lump sum on diagnosis is not a regular salary, and it isn't paid for every reason you might stop working." }],
    infographicId: "critical-illness-malaysia",
    scenario: { label: "Try the recovery runway scenario", href: "app/simulate/needs/tool-ci", text: "Compare a critical illness amount with a recovery period you choose." },
    sources: [S.glossary],
  },
  {
    slug: "life",
    official: "Life",
    purpose: "Family Financial Protection",
    short: "A lump sum for the people who depend on you.",
    summary:
      "Pays a lump sum to your nominee or estate if you die during the cover period. Many plans also pay on total and permanent disability (TPD). Family takaful is the takaful equivalent.",
    example: {
      title: "Example situation (illustrative)",
      text:
        "Daniel, 30, sends RM400 a month to his parents and has a car loan. If he died, a life payout to his nominee could help replace that support and settle his affairs. A 22-year-old with no dependants and no debts may need much less life cover.",
    },
    mayHelp: [
      "Support for people who rely on your income, such as parents, a partner or children",
      "Final expenses and settling outstanding commitments",
      "Term life: affordable, pure protection for a fixed period",
      "Whole life or investment-linked plans: longer cover, with savings or investment features whose values may not be guaranteed",
    ],
    notAutomatic: [
      "Cancelling your debts — the payout goes to your nominee or estate, not straight to your lenders",
      "Paying out while you're alive, unless the plan has a TPD or critical illness benefit",
      "Guaranteed investment values on investment-linked plans",
    ],
    misunderstandings: [
      { myth: "“Life insurance pays off my loans.”", reality: "Not automatically. Loan-linked cover (such as mortgage reducing term cover) is a separate type of policy." },
      { myth: "“Everyone needs a big life policy straight away.”", reality: "Life cover matters most when others depend on you — for example after marriage, children, a mortgage or co-signed loans." },
      { myth: "“The illustration in my investment-linked plan is guaranteed.”", reality: "Sales illustrations are projections. Charges and investment returns can change the outcome." },
    ],
    notEqual: [{ a: "Life insurance", b: "Debt cancellation", why: "Debts don't disappear automatically. A payout goes to your nominee or estate, who may use it to settle them." }],
    malaysia: [
      { text: "If an insurer or takaful operator that is a PIDM member fails, eligible life insurance benefits are protected up to RM500,000 under TIPS.", source: S.pidm },
    ],
    infographicId: "life-insurance-malaysia",
    scenario: { label: "Try the family protection scenario", href: "app/simulate/needs/tool-family", text: "Estimate what your dependants might need and compare it with cover you count." },
    sources: [S.pidm, S.glossary],
  },
  {
    slug: "tpd",
    official: "Total and Permanent Disability (TPD)",
    purpose: "Income Protection",
    short: "A benefit if you can never work again.",
    summary:
      "Pays a benefit if illness or injury leaves you totally and permanently unable to work, as defined in the policy. It is often included with life insurance and usually paid as a lump sum.",
    example: {
      title: "Example situation (illustrative)",
      text:
        "Priya, 27, is seriously injured and can no longer do any work. If her condition meets her policy's TPD definition, a payout could support her for the years she can't earn. A shorter, temporary injury would not usually qualify.",
    },
    mayHelp: [
      "A benefit — usually a lump sum, sometimes paid in instalments — when you can't earn again",
      "Disability caused by illness or by accident, if it meets the definition",
    ],
    notAutomatic: [
      "Temporary or partial disability — it must meet the policy's definition of total and permanent",
      "A monthly salary, unless the policy says so",
      "Cover at every age — TPD cover often ends at an age stated in the policy",
      "Claims before the disability has lasted any minimum period the definition requires",
    ],
    misunderstandings: [
      { myth: "“Any injury that stops me working counts.”", reality: "Only a disability that meets the policy's total and permanent definition qualifies." },
      { myth: "“TPD and income protection are the same.”", reality: "Income protection products pay a regular income while you can't work. TPD usually pays a lump sum." },
      { myth: "“A TPD claim leaves my life cover untouched.”", reality: "If TPD is bundled with life cover, a TPD payout may reduce or end the death benefit. Check how your policy works." },
    ],
    notEqual: [{ a: "TPD cover", b: "A monthly salary", why: "It usually pays a lump sum, and only for a disability that meets the definition." }],
    scenario: { label: "Check your emergency fund", href: "app/simulate/needs/tool-fund", text: "See how many months your savings could cover essentials. (A TPD calculator needs an approved model first.)" },
    sources: [S.glossary, S.pidm],
  },
  {
    slug: "personal-accident",
    official: "Personal Accident",
    purpose: "Accident Protection",
    short: "Benefits for injury or death caused by an accident.",
    summary:
      "Pays benefits for death or disablement caused solely by an accident, and may reimburse accident-related medical costs. Usually a one-year policy you renew.",
    example: {
      title: "Example situation (illustrative)",
      text:
        "Hafiz, 21, rides to work and fractures his wrist in a fall. A personal accident policy may reimburse accident medical costs up to its limit, and pay a set percentage of the sum insured if an injury causes permanent disablement.",
    },
    mayHelp: [
      "Accidental death",
      "Permanent disablement, paid as a percentage of the sum insured depending on how severe it is",
      "Accident medical expenses, up to a limit",
      "Sometimes a daily hospital income after an accident",
    ],
    notAutomatic: [
      "Illness — unless the policy adds a specific extension",
      "Every activity — exclusions often apply, for example certain hazardous activities",
      "Medical cover for non-accident hospital stays",
    ],
    misunderstandings: [
      { myth: "“PA covers me if I'm hospitalised for an illness.”", reality: "Personal accident covers accidents. Illness generally needs medical insurance." },
      { myth: "“A cheap PA plan is all the protection I need.”", reality: "It's useful but narrow. It doesn't cover illness or replace medical, life or critical illness cover." },
      { myth: "“My job doesn't matter.”", reality: "Your occupation can affect whether you're accepted and what you pay." },
    ],
    notEqual: [{ a: "Personal accident cover", b: "Medical insurance", why: "It is triggered only by accidents, so most hospital stays for illness are not covered." }],
    infographicId: "personal-accident-malaysia",
    scenario: { label: "Open the medical bill simulator", href: "app/simulate/needs/tool-bill", text: "See how a hospital bill is shared — PA medical limits are usually much lower than a medical plan's." },
    sources: [S.glossary],
  },
];

export const findProtectionCategory = (slug: string) => protectionCategories.find((c) => c.slug === slug);

/* ----------------------------------------------------------------------------- researched products */

export type EvidenceStatus = "VERIFIED_OFFICIAL" | "ISSUER_NOTICE";

export interface ResearchedProduct {
  id: string;
  name: string;
  issuer: string;
  basis: "Conventional insurance" | "Takaful";
  categories: ProtectionSlug[];
  type: string;
  status: string;
  howToApply: string;
  /** Only fields the Product Master marks VERIFIED_OFFICIAL, with where they come from. */
  verifiedFacts: Array<{ label: string; value: string }>;
  needsConfirmation: string[];
  note?: string;
  evidence: EvidenceStatus;
  sources: Source[];
}

const GELM = "Great Eastern Life Assurance (Malaysia) Berhad";
const GEGM = "Great Eastern General Insurance (Malaysia) Berhad";
const GETB = "Great Eastern Takaful Berhad";
const STANDARD_GAPS = ["Current PDS and policy wording", "Eligibility and entry ages", "Waiting periods and exclusions", "Your premium or contribution"];

export const PRODUCT_RESEARCH_DATE = "22 November 2026";

export const researchedProducts: ResearchedProduct[] = [
  {
    id: "GEGM-IND-MED-PORTFOLIO",
    name: "Individual medical products (GEGM) — notice",
    issuer: GEGM,
    basis: "Conventional insurance",
    categories: ["medical"],
    type: "Issuer notice about a product portfolio, not a product",
    status: "New applications for GEGM's individual medical products stopped from 1 November 2026. Existing policies continue to be serviced, claimed and renewed under their terms.",
    howToApply: "No new applications for this portfolio.",
    verifiedFacts: [],
    needsConfirmation: ["Which individual products the notice covers"],
    evidence: "ISSUER_NOTICE",
    sources: [{ label: "Great Eastern — important update on individual medical insurance products", url: "https://www.greateasternlife.com/my/en/customer-services/announcements/important-update-on-individual-medical-insurance-products.html" }],
  },
  {
    id: "GELM-SHP",
    name: "SMART Health Protector",
    issuer: GELM,
    basis: "Conventional insurance",
    categories: ["medical"],
    type: "Medical rider attached to selected regular-premium investment-linked plans (not sold on its own)",
    status: "Shown as active on the official product page when checked.",
    howToApply: "Exact channel and acceptance terms need the current PDS and underwriting confirmation.",
    verifiedFacts: [
      { label: "Annual limit (official product page)", value: "RM3,000,000" },
      { label: "Lifetime limit (official product page)", value: "No overall lifetime limit stated" },
      { label: "Deductible (official product page)", value: "Starts from RM500; the option and basis depend on the current PDS" },
    ],
    needsConfirmation: ["Plan variants and sub-limits", ...STANDARD_GAPS, "Which base plans it can attach to"],
    note: "The product page states its information was correct on 11 May 2026.",
    evidence: "VERIFIED_OFFICIAL",
    sources: [{ label: "Great Eastern Life — SMART Health Protector", url: "https://www.greateasternlife.com/my/en/personal-insurance/our-products/health-insurance/smart-health-protector.html" }],
  },
  {
    id: "GELM-GMV",
    name: "GREAT MediValue",
    issuer: GELM,
    basis: "Conventional insurance",
    categories: ["medical"],
    type: "Medical rider, optional under an eligible life policy",
    status: "Listed on the official site; the current version and new-business status need confirmation.",
    howToApply: "Confirm with the current official application and PDS.",
    verifiedFacts: [
      { label: "PDS version checked", value: "V00/0526" },
      { label: "Annual limit, Plan 200 (PDS p. 1)", value: "RM3,000,000" },
      { label: "Lifetime limit (PDS p. 1)", value: "No limit stated" },
      { label: "Room and board (PDS p. 1)", value: "RM200 per day" },
      { label: "Deductible options (PDS p. 2)", value: "RM500 or RM2,500 per policy year" },
      { label: "Renewal (PDS p. 2)", value: "Guaranteed renewal; the cost of insurance is not guaranteed" },
    ],
    needsConfirmation: ["Co-insurance conditions in full", "Coverage term (the PDS shows a placeholder)", ...STANDARD_GAPS],
    note: "Earlier research cited a different annual limit for an older version. Only the figure in the PDS checked is shown.",
    evidence: "VERIFIED_OFFICIAL",
    sources: [
      { label: "Great Eastern Life — GREAT MediValue PDS (PDF)", url: "https://www.greateasternlife.com/content/dam/corp-site/my/malaysia/gelm-mcm-marcom/product-/product-disclosure-sheet/gelm-mmc-pd-gmv-pds.pdf" },
      { label: "Great Eastern Life — GREAT MediValue", url: "https://www.greateasternlife.com/my/en/personal-insurance/our-products/health-insurance/great-medivalue.html" },
    ],
  },
  {
    id: "GELM-GMS2",
    name: "GREAT Medic Shield 2",
    issuer: GELM,
    basis: "Conventional insurance",
    categories: ["medical"],
    type: "Yearly renewable standalone medical plan",
    status: "Unknown for new applications; the PDS found has placeholder dates and may be historical.",
    howToApply: "Unknown — confirm with Great Eastern Life.",
    verifiedFacts: [],
    needsConfirmation: ["Whether it is open to new applicants", "Current limits and deductible", ...STANDARD_GAPS],
    evidence: "VERIFIED_OFFICIAL",
    sources: [{ label: "Great Eastern Life — GREAT Medic Shield 2", url: "https://www.greateasternlife.com/my/en/personal-insurance/our-products/health-insurance/great-medic-shield2-great-medic-million-extender2.html" }],
  },
  {
    id: "GELM-GMLS",
    name: "GREAT Medic Lite Secure",
    issuer: GELM,
    basis: "Conventional insurance",
    categories: ["medical"],
    type: "Medical conversion or continuation option",
    status: "For qualifying existing policyholders of selected plans (official page, 1 June 2026). Not open to everyone.",
    howToApply: "Limited to existing policyholders of selected eligible plans or riders.",
    verifiedFacts: [],
    needsConfirmation: ["Who qualifies", "Deductible basis and limits", ...STANDARD_GAPS],
    evidence: "VERIFIED_OFFICIAL",
    sources: [{ label: "Great Eastern Life — GREAT Medic Lite Secure", url: "https://www.greateasternlife.com/my/en/personal-insurance/our-products/health-insurance/great-medic-lite-secure.html" }],
  },
  {
    id: "GETB-IGMC",
    name: "i-Great Medi Care",
    issuer: GETB,
    basis: "Takaful",
    categories: ["medical"],
    type: "Standalone medical takaful plan",
    status: "Official product page and PDS found; confirm the current version before relying on it.",
    howToApply: "Has an official direct online product page; acceptance depends on current underwriting terms.",
    verifiedFacts: [],
    needsConfirmation: ["Limits, deductible or co-payment", "Contribution steps", ...STANDARD_GAPS],
    evidence: "VERIFIED_OFFICIAL",
    sources: [
      { label: "Great Eastern Takaful — i-Great Medi Care", url: "https://www.greateasterntakaful.com/en/personal-takaful/our-products/get-it-direct/i-great-medi-care.html" },
      { label: "Great Eastern Takaful — i-Great Medi Care PDS (PDF)", url: "https://www.greateasterntakaful.com/content/dam/great-eastern/takaful/en/homepage/personal-takaful/our-products/get-it-direct/i-great-medi-care/i-great-medi-care-pds-en.pdf" },
    ],
  },
  {
    id: "GELM-SPY",
    name: "SmartProtect You",
    issuer: GELM,
    basis: "Conventional insurance",
    categories: ["life", "tpd"],
    type: "Investment-linked life insurance plan",
    status: "Shown as active on the official page (information correct 1 August 2026).",
    howToApply: "Official online product page; acceptance depends on the application terms.",
    verifiedFacts: [
      { label: "Cover (official page)", value: "Death and TPD sum assured, plus optional cover; amounts depend on what you select" },
      { label: "Minimum premium (official page)", value: "RM100 a month — not a quote for you" },
    ],
    needsConfirmation: ["Charges, lapse and surrender terms", "Investment risk and fund details", "Rider terms", ...STANDARD_GAPS],
    note: "Investment-linked: policy values depend on charges and fund performance and are not guaranteed.",
    evidence: "VERIFIED_OFFICIAL",
    sources: [{ label: "Great Eastern Life — SmartProtect You", url: "https://www.greateasternlife.com/my/en/personal-insurance/our-products/life-insurance/smartprotect-you.html" }],
  },
  {
    id: "GELM-SMCC",
    name: "Smart Multi Critical Care",
    issuer: GELM,
    basis: "Conventional insurance",
    categories: ["critical-illness"],
    type: "Critical illness rider (unit-deduction, attached to a base plan)",
    status: "PDS version V03/1123 found; current availability and version not confirmed.",
    howToApply: "Confirm the current PDS and channel with Great Eastern Life.",
    verifiedFacts: [
      { label: "PDS version checked", value: "V03/1123" },
      { label: "Claims (PDS pp. 1–3)", value: "Multiple claims across early, intermediate and advanced stages" },
      { label: "Total benefit (PDS)", value: "Up to 800% of the rider sum assured, subject to RM5,000,000 per life before age 85 next birthday" },
      { label: "Early stage (PDS)", value: "50% of the rider sum assured, subject to RM300,000 per claim" },
    ],
    needsConfirmation: ["The number of covered conditions (the official page shows two different counts)", "Definitions and stages", "Survival periods", ...STANDARD_GAPS],
    evidence: "VERIFIED_OFFICIAL",
    sources: [
      { label: "Great Eastern Life — Smart Multi Critical Care", url: "https://www.greateasternlife.com/my/en/personal-insurance/our-products/health-insurance/smart-multi-critical-care.html" },
      { label: "Great Eastern Life — Smart Multi Critical Care PDS (PDF)", url: "https://www.greateasternlife.com/content/dam/corp-site/my/malaysia/gelm-mcm-marcom/product-/product-disclosure-sheet/gelm-mmc-pd-smcc-pds.pdf" },
    ],
  },
  {
    id: "GEGM-GSA",
    name: "GREAT Shield Active",
    issuer: GEGM,
    basis: "Conventional insurance",
    categories: ["personal-accident"],
    type: "Personal accident insurance",
    status: "PDS information valid as at 31 May 2026; confirm the current version before applying.",
    howToApply: "Confirm the current application route with Great Eastern General.",
    verifiedFacts: [
      { label: "Entry age (PDS)", value: "30 days to 70 years" },
      { label: "Cover term (PDS)", value: "12 months, renewed yearly up to age 100, subject to the insurer being satisfied about your health" },
      { label: "Other conditions (PDS)", value: "Residency, occupation class, age and sum-insured limits apply" },
      { label: "Exclusions (PDS, not the full list)", value: "Include pre-existing conditions, self-inflicted injury, war risks, and illegal or dangerous activities or sports" },
    ],
    needsConfirmation: ["Full policy wording and the complete exclusions list", "Benefits and limits for your occupation class", "Your premium"],
    note: "The PDS includes a sample premium and benefits for occupation classes 1–2. It is an illustration, not a quote, so it isn't shown here.",
    evidence: "VERIFIED_OFFICIAL",
    sources: [{ label: "Great Eastern General — GREAT Shield Active PDS (PDF)", url: "https://www.greateasternlife.com/content/dam/corp-site/my/malaysia/gelm-brand-comm/gegm/gegm-product/gegm-pdt-pd-great-shield-active-pds.pdf" }],
  },
];

export const productsFor = (slug: ProtectionSlug) => researchedProducts.filter((p) => p.categories.includes(slug));

/** Named in research but not officially verified — counted, never shown as products. */
export const UNVERIFIED_PRODUCT_NAME_COUNT = 34;
