/**
 * Learn media manifest. Every entry maps an owner-supplied asset (originals kept in
 * /insurance study video and /insurance infographic) to its web copy, measured format and
 * placement. Descriptions summarise each asset's visible topic; they are not transcripts.
 */
export type MediaTopic = "insurance-basics" | "risk-pooling" | "medical" | "life" | "critical-illness" | "accident";

export const mediaTopicLabels: Record<MediaTopic, string> = {
  "insurance-basics": "Insurance basics",
  "risk-pooling": "Risk pooling",
  medical: "Medical",
  life: "Life insurance",
  "critical-illness": "Critical illness",
  accident: "Personal accident",
};

export interface VideoResource {
  id: string;
  kind: "video";
  title: string;
  description: string;
  topic: MediaTopic;
  src: string;
  poster: string;
  /** Measured from the file. */
  seconds: number;
  width: number;
  height: number;
  orientation: "portrait" | "landscape";
  format: "short" | "long-form";
  sourceFile: string;
  /**
   * Authored WebVTT caption files (e.g. /media/learn/captions/<id>.en.vtt). None exist yet:
   * add a track here once a reviewed transcript or translation is available.
   */
  captions?: Array<{ lang: string; label: string; src: string; default?: boolean }>;
  /** GREAT EMPOWER summary of what the lesson covers — clearly not a transcript. */
  summary?: string[];
  related: string[];
}

export interface InfographicResource {
  id: string;
  kind: "infographic";
  title: string;
  description: string;
  topic: MediaTopic;
  full: string;
  thumb: string;
  width: number;
  height: number;
  orientation: "portrait" | "landscape";
  sourceFile: string;
  related: string[];
}

export const videos: VideoResource[] = [
  {
    id: "what-is-insurance",
    kind: "video",
    title: "What is insurance?",
    description: "A foundational lesson on how insurance works as a contract, why premiums are pooled and the principles that keep it fair.",
    topic: "insurance-basics",
    src: "/media/learn/videos/what-is-insurance.mp4",
    poster: "/media/learn/videos/what-is-insurance-poster.webp",
    seconds: 481,
    width: 1280,
    height: 720,
    orientation: "landscape",
    format: "long-form",
    sourceFile: "What_Is_Insurance_.mp4",
    summary: [
      "Insurance is a contract: you pay premiums and an insurer agrees to pay for covered losses.",
      "Premiums from many people are pooled, so one person's large loss is shared across the group.",
      "Both sides must act in good faith — not disclosing important facts can affect a claim.",
      "Life protection and asset protection serve different purposes.",
    ],
    related: ["insurance-safety-net", "risk-pooling-powers-insurance", "how-insurance-works-in-malaysia"],
  },
  {
    id: "how-insurance-works-in-malaysia",
    kind: "video",
    title: "How insurance actually works in Malaysia",
    description: "A short explainer that walks through how cover responds when something happens, step by step.",
    topic: "insurance-basics",
    src: "/media/learn/videos/how-insurance-works-in-malaysia.mp4",
    poster: "/media/learn/videos/how-insurance-works-in-malaysia-poster.webp",
    seconds: 88,
    width: 720,
    height: 1280,
    orientation: "portrait",
    format: "short",
    sourceFile: "How_Insurance_Actually_Works_In_Malaysia.mp4",
    related: ["what-is-insurance", "medical-insurance-malaysia"],
  },
  {
    id: "risk-pooling-powers-insurance",
    kind: "video",
    title: "How risk pooling powers insurance",
    description: "Why spreading risk across many people makes large, unexpected costs manageable.",
    topic: "risk-pooling",
    src: "/media/learn/videos/risk-pooling-powers-insurance.mp4",
    poster: "/media/learn/videos/risk-pooling-powers-insurance-poster.webp",
    seconds: 86,
    width: 720,
    height: 1280,
    orientation: "portrait",
    format: "short",
    sourceFile: "How_Risk_Pooling_Powers_Insurance.mp4",
    related: ["life-insurance-risk-pooling", "insurance-safety-net"],
  },
  {
    id: "life-insurance-risk-pooling",
    kind: "video",
    title: "How life insurance risk pooling works",
    description: "Risk pooling applied to life insurance, in under two minutes.",
    topic: "life",
    src: "/media/learn/videos/life-insurance-risk-pooling.mp4",
    poster: "/media/learn/videos/life-insurance-risk-pooling-poster.webp",
    seconds: 91,
    width: 720,
    height: 1280,
    orientation: "portrait",
    format: "short",
    sourceFile: "How_Life_Insurance_Risk_Pooling_Works.mp4",
    related: ["life-insurance-malaysia", "risk-pooling-powers-insurance"],
  },
];

const ig = (slug: string) => ({
  full: `/media/learn/infographics/${slug}-full.webp`,
  thumb: `/media/learn/infographics/${slug}-thumb.webp`,
});

export const infographics: InfographicResource[] = [
  { id: "insurance-safety-net", kind: "infographic", title: "Understanding insurance: your financial safety net", description: "Premiums, risk pooling, legal principles and life vs asset protection on one page.", topic: "insurance-basics", ...ig("insurance-safety-net"), width: 1536, height: 2752, orientation: "portrait", sourceFile: "Understanding_Insurance_Safety_Net_Guide.png", related: ["what-is-insurance", "risk-pooling-powers-insurance"] },
  { id: "medical-insurance-malaysia", kind: "infographic", title: "Medical insurance in Malaysia", description: "A visual guide to how medical cover works.", topic: "medical", ...ig("medical-insurance-malaysia"), width: 1536, height: 2752, orientation: "portrait", sourceFile: "Medical_Insurance_in_Malaysia_Guide.png", related: ["how-insurance-works-in-malaysia"] },
  { id: "life-insurance-malaysia", kind: "infographic", title: "Life insurance in Malaysia", description: "A visual guide to life insurance.", topic: "life", ...ig("life-insurance-malaysia"), width: 1536, height: 2752, orientation: "portrait", sourceFile: "Malaysia_Life_Insurance_Guide.png", related: ["life-insurance-risk-pooling"] },
  { id: "critical-illness-malaysia", kind: "infographic", title: "Critical illness insurance in Malaysia", description: "Lump-sum payouts on diagnosis, coverage scope, rider options and PIDM protection.", topic: "critical-illness", ...ig("critical-illness-malaysia"), width: 2752, height: 1536, orientation: "landscape", sourceFile: "Critical_Illness_Insurance_in_Malaysia.png", related: ["what-is-insurance"] },
  { id: "personal-accident-malaysia", kind: "infographic", title: "Personal accident insurance in Malaysia", description: "A visual guide to personal accident cover.", topic: "accident", ...ig("personal-accident-malaysia"), width: 2752, height: 1536, orientation: "landscape", sourceFile: "Personal_Accident_Insurance_in_Malaysia.png", related: ["how-insurance-works-in-malaysia"] },
];

export const findVideo = (id: string) => videos.find((v) => v.id === id);
export const findInfographic = (id: string) => infographics.find((i) => i.id === id);
export const findMedia = (id: string) => findVideo(id) ?? findInfographic(id);

export const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
