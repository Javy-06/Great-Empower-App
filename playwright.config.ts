import { defineConfig, devices } from "@playwright/test";

// Browser QA for GREAT EMPOWER. Always runs against a device-only build (no Supabase), served by
// scripts/qa/device-only.mjs. Uses the locally installed Chrome (`channel: "chrome"`), so no
// Playwright browser download is needed.
const PORT = 4820;
const chrome = { channel: "chrome" as const };

export default defineConfig({
  testDir: "tests/e2e",
  outputDir: ".qa/pw-results",
  snapshotPathTemplate: "tests/e2e/__screenshots__/{projectName}/{testFilePath}/{arg}{ext}",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 1 : 0,
  globalTimeout: 25 * 60_000,
  reporter: [["list"], ["html", { outputFolder: ".qa/pw-report", open: "never" }]],
  // Absolute pixel budget: a ratio lets small real changes (one word on a tall page) slip through.
  expect: { toHaveScreenshot: { maxDiffPixels: 100, animations: "disabled" } },
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    locale: "en-MY",
    timezoneId: "Asia/Kuala_Lumpur",
  },
  webServer: {
    command: `node scripts/qa/device-only.mjs --port=${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    { name: "mobile-375", use: { ...devices["iPhone SE"], ...chrome, viewport: { width: 375, height: 812 }, defaultBrowserType: "chromium" } },
    { name: "mobile-390", use: { ...devices["iPhone 13"], ...chrome, viewport: { width: 390, height: 844 }, defaultBrowserType: "chromium" } },
    { name: "tablet-768", use: { ...chrome, viewport: { width: 768, height: 1024 }, hasTouch: true } },
    { name: "desktop-1280", use: { ...chrome, viewport: { width: 1280, height: 800 } } },
    { name: "wide-1440", use: { ...chrome, viewport: { width: 1440, height: 900 } } },
  ],
});
