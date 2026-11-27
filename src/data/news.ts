/**
 * Curated external news. Each story keeps two kinds of content apart:
 *  - `reported`: facts restated from the source article (verified against it on 25 Nov 2026).
 *  - `concepts` / `forYou`: GREAT EMPOWER's own educational explanations, labelled as such.
 * Nothing here is a product term, quotation, recommendation or advice.
 */
export type NewsStory = {
  id: string;
  /** Short editorial teaser used on Home. */
  teaser: { title: string; text: string };
  /** The source article's own headline. */
  headline: string;
  publication: string;
  byline: string;
  /** ISO date of the original publication. */
  publishedOn: string;
  url: string;
  summary: string;
  infographic: {
    /** Web-sized copies of the artwork. The supplied original is kept out of the deployed folder, in media-originals/images/news/. */
    inline: string;
    full: string;
    width: number;
    height: number;
    alt: string;
  };
  reported: Array<{ label: string; text: string }>;
  concepts: Array<{ term: string; text: string }>;
  forYou: string[];
};

export const mediAsasStory: NewsStory = {
  id: "mediasas-2027",
  teaser: {
    title: "MediAsas is reshaping medical protection.",
    text: "A new approach to affordable medical protection, shared costs and healthcare reform.",
  },
  headline:
    "MediAsas To Reshape Private Healthcare Financing Through Insurance, Healthcare Reforms – BNM Deputy Governor",
  publication: "BernamaBiz",
  byline: "K. Naveen Prabu",
  publishedOn: "2026-11-16",
  url: "https://bernamabiz.com/news.php?id=2634977",
  summary:
    "In an email interview with Bernama, Bank Negara Malaysia Deputy Governor Aznan Abdul Aziz said MediAsas, scheduled for January 2027, is meant to be an affordable entry point to medical insurance — and part of wider reforms to manage rising medical costs, not just another product.",
  infographic: {
    inline: "/images/news/mediasas/mediasas-overview-2027-1080.webp",
    full: "/images/news/mediasas/mediasas-overview-2027-1856.webp",
    width: 1856,
    height: 2304,
    alt: "MediAsas, Malaysia's basic medical insurance and takaful plan, expected to launch in January 2027. Annual coverage of RM100,000, increasing to RM150,000 at age 60. No lifetime limit; the annual limit resets every year. Panel hospitals: RM500 deductible below age 60, RM1,000 from 60. Non-panel hospitals: 20% co-insurance, capped at RM3,000 or RM4,000 depending on age. Seven-year No-Look-Back protection against claims being contested for innocent non-disclosure after seven years of continuous coverage, subject to conditions. Co-payments are waived for emergency treatment, government healthcare facilities and outpatient cancer treatment. Source: BernamaBiz, 16 November 2026.",
  },
  // The infographic carries the headline figures; this list covers what it does not.
  reported: [
    {
      label: "Who it's for",
      text: "An affordable entry point to medical insurance, particularly for people who are uninsured or struggling to keep their cover.",
    },
    {
      label: "Design",
      text: "A standardised, non-investment-linked plan, the same across participating insurance and takaful operators.",
    },
    {
      label: "Panel hospitals",
      text: "ProtectHealth Corporation (PHCorp) is building a nationwide panel hospital network, including outside major cities. Final details are to be announced closer to launch.",
    },
    {
      label: "Premiums",
      text: "MediAsas cannot completely eliminate future premium adjustments, but the wider reforms aim to moderate them.",
    },
    {
      label: "Existing conditions",
      text: "Not an automatic disqualification. Eligibility depends on the condition and risk profile; extra premiums or exclusions may apply.",
    },
    {
      label: "Wider reforms",
      text: "Gradual diagnosis-related group (DRG) payments, a cancer drug list, common claims rules, cost monitoring and shared electronic medical records.",
    },
  ],
  concepts: [
    {
      term: "Co-payment",
      text: "The part of a medical bill you pay yourself; the insurer pays the rest.",
    },
    {
      term: "Deductible",
      text: "A fixed amount you pay first, before the insurer starts paying.",
    },
    {
      term: "Co-insurance",
      text: "A percentage of the bill you share, often up to a cap.",
    },
    {
      term: "Panel hospital",
      text: "A hospital in the plan's approved network, usually where you pay less.",
    },
    {
      term: "DRG",
      text: "Paying hospitals a set price per type of treatment, so costs are more predictable.",
    },
  ],
  forYou: [
    "If you have no medical cover today, MediAsas is being designed as a simpler starting point worth understanding before it launches.",
    "Where you are treated matters: panel hospitals are reported to cost you less than non-panel ones.",
    "Already covered? Nothing changes automatically. Compare limits and exclusions before deciding anything.",
    "Answer health questions honestly on any medical policy — it protects your future claims.",
  ],
};

export const featuredNews: NewsStory[] = [mediAsasStory];

export const findStory = (id: string) => featuredNews.find((story) => story.id === id);

export const NEWS_HASH_PREFIX = "app/home/news/";
