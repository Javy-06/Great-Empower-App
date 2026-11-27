// Routes the UI QA runner visits. Update this list when the product architecture changes.
// `key` is a short, file-safe name used for screenshots.
export const routes = [
  { key: "home", hash: "app/home", group: "Home" },
  { key: "learn", hash: "app/learn", group: "Learn" },
  { key: "lesson", hash: "app/learn/lesson/hospital-bills", group: "Learn" },
  { key: "video", hash: "app/learn/video/how-insurance-works-in-malaysia", group: "Learn" },
  { key: "infographic", hash: "app/learn/infographic/medical-insurance-malaysia", group: "Learn" },
  { key: "protection", hash: "app/learn/protection", group: "Protection" },
  { key: "cat-medical", hash: "app/learn/protection/medical", group: "Protection" },
  { key: "cat-ci", hash: "app/learn/protection/critical-illness", group: "Protection" },
  { key: "cat-life", hash: "app/learn/protection/life", group: "Protection" },
  { key: "cat-tpd", hash: "app/learn/protection/tpd", group: "Protection" },
  { key: "cat-pa", hash: "app/learn/protection/personal-accident", group: "Protection" },
  { key: "products", hash: "app/learn/protection/products", group: "Protection" },
  { key: "simulate", hash: "app/simulate", group: "Simulate" },
  { key: "sim-needs", hash: "app/simulate/needs", group: "Simulate" },
  { key: "sim-family", hash: "app/simulate/needs/tool-family", group: "Simulate" },
  { key: "sim-ci", hash: "app/simulate/needs/tool-ci", group: "Simulate" },
  { key: "protect", hash: "app/protect", group: "Protect" },
  { key: "analyze-alias", hash: "app/analyze", group: "Protect" },
  { key: "guide", hash: "app/guide", group: "Guide" },
  { key: "guide-article", hash: "app/guide/article/make-a-claim", group: "Guide" },
  { key: "guide-checklist", hash: "app/guide/checklist", group: "Guide" },
  { key: "guide-sessions", hash: "app/guide/sessions", group: "Guide" },
  { key: "rewards", hash: "app/rewards", group: "Rewards" },
  { key: "wallet", hash: "app/rewards/wallet", group: "Rewards" },
  { key: "marketplace", hash: "app/rewards/marketplace", group: "Rewards" },
  { key: "notifications", hash: "app/notifications", group: "Other" },
];

export const viewports = [
  { name: "mobile-sm", width: 375, height: 812 },
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
  { name: "wide", width: 1440, height: 900 },
];
