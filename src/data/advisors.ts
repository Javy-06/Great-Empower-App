/**
 * Fictional guidance-session advisors — FOR DEMONSTRATION ONLY. They are AI-generated portraits of
 * people who do not exist: not Great Eastern agents or employees, not licensed professionals, and
 * not available for real appointments. No credentials or experience are claimed.
 *
 * Portraits are web-sized copies (480px portrait + 256px face crop) of the owner-supplied files
 * public/advisor/advisor-<ethnicity>-<gender>.jpg; the 2048px originals stay local, untouched.
 */
export type Ethnicity = "malay" | "chinese" | "indian";

export const ethnicityLabels: Record<Ethnicity, string> = {
  malay: "Malay",
  chinese: "Malaysian Chinese",
  indian: "Malaysian Indian",
};

export interface Advisor {
  id: string;
  name: string;
  ethnicity: Ethnicity;
  gender: "woman" | "man";
  /** Fictional age for the demo persona. */
  age: number;
  languages: string[];
  specialization: string;
  intro: string;
  /** Web-sized head-and-shoulders portrait for profile cards. */
  portrait: string;
  /** Square face crop for small avatars. */
  face: string;
}

const asset = (slug: string) => ({
  portrait: `/advisor/web/advisor-${slug}-480.webp`,
  face: `/advisor/web/advisor-${slug}-face.webp`,
});

export const advisors: Advisor[] = [
  {
    id: "farah",
    name: "Farah Nadia",
    ethnicity: "malay",
    gender: "woman",
    age: 34,
    languages: ["Bahasa Melayu", "English"],
    specialization: "Medical protection",
    intro: "Walks you through how medical cover, hospital bills and claims fit together.",
    ...asset("malay-woman"),
  },
  {
    id: "hafiz",
    name: "Hafiz Rahman",
    ethnicity: "malay",
    gender: "man",
    age: 38,
    languages: ["Bahasa Melayu", "English"],
    specialization: "Family protection",
    intro: "Helps you think about who depends on you and what protecting them involves.",
    ...asset("malay-man"),
  },
  {
    id: "meiling",
    name: "Tan Mei Ling",
    ethnicity: "chinese",
    gender: "woman",
    age: 31,
    languages: ["English", "Mandarin", "Bahasa Melayu"],
    specialization: "Young adult financial planning",
    intro: "Focuses on first jobs, budgets and building a safety net early.",
    ...asset("chinese-woman"),
  },
  {
    id: "jason",
    name: "Jason Lim",
    ethnicity: "chinese",
    gender: "man",
    age: 36,
    languages: ["English", "Mandarin", "Cantonese"],
    specialization: "Understanding insurance",
    intro: "Explains insurance terms in plain language — deductibles, co-payments and limits.",
    ...asset("chinese-man"),
  },
  {
    id: "priya",
    name: "Priya Raman",
    ethnicity: "indian",
    gender: "woman",
    age: 33,
    languages: ["English", "Tamil", "Bahasa Melayu"],
    specialization: "Financial protection fundamentals",
    intro: "Covers the basics of protection: what it is for and how to start.",
    ...asset("indian-woman"),
  },
  {
    id: "arjun",
    name: "Arjun Nair",
    ethnicity: "indian",
    gender: "man",
    age: 41,
    languages: ["English", "Tamil", "Malayalam"],
    specialization: "Life protection",
    intro: "Talks through life and income protection for people with dependants.",
    ...asset("indian-man"),
  },
];

export const findAdvisor = (id: string) => advisors.find((a) => a.id === id);

export const ADVISOR_DISCLAIMER = "Fictional advisors for demonstration purposes.";
