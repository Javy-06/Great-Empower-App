#!/usr/bin/env node
// GREAT EMPOWER UI QA runner: no dependencies, drives the locally installed Chrome over the DevTools protocol.
//
//   npm run qa:ui                      build device-only, check every route at every viewport, screenshot
//   npm run qa:ui -- --no-build        reuse .qa/dist
//   npm run qa:ui -- --only=home,learn --widths=390,1280 --no-shots
//
// Safety: the build blanks VITE_SUPABASE_* so the app runs in device-only mode (local accounts, no cloud).
// The runner refuses to continue if the built bundle still references a Supabase host.
// Output: .qa/report.json, .qa/report.md, .qa/shots/<width>/<route>.jpg   (.qa/ is gitignored)
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { routes as allRoutes, viewports as allViewports } from "./routes.mjs";

const ROOT = resolve(import.meta.dirname, "../..");
const QA = join(ROOT, ".qa");
const DIST = join(QA, "dist");
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, "").split("="); return [k, v ?? true]; }));
const only = args.only ? new Set(String(args.only).split(",")) : null;
const widths = args.widths ? new Set(String(args.widths).split(",").map(Number)) : null;
const routes = allRoutes.filter((r) => !only || only.has(r.key));
const viewports = allViewports.filter((v) => !widths || widths.has(v.width));
const shots = !args["no-shots"];
const log = (...m) => console.log("[qa]", ...m);

// ---------- 1. Device-only build ----------
if (!args["no-build"] || !existsSync(DIST)) {
  log("building device-only bundle…");
  const b = spawnSync("npx", ["vite", "build", "--outDir", DIST, "--emptyOutDir"], {
    cwd: ROOT, shell: true, stdio: "inherit",
    env: { ...process.env, VITE_SUPABASE_URL: "", VITE_SUPABASE_PUBLISHABLE_KEY: "" },
  });
  if (b.status !== 0) { console.error("build failed"); process.exit(1); }
}
const bundle = readdirSync(join(DIST, "assets")).filter((f) => f.endsWith(".js")).map((f) => readFileSync(join(DIST, "assets", f), "utf8")).join("\n");
if (/https:\/\/[a-z0-9]+\.supabase\.co/.test(bundle)) { console.error("ABORT: bundle references a Supabase project. QA must run device-only."); process.exit(2); }

// ---------- 2. Static server ----------
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".json": "application/json", ".mp4": "video/mp4", ".woff2": "font/woff2", ".vtt": "text/vtt", ".ico": "image/x-icon" };
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let f = join(DIST, p);
  if (!f.startsWith(DIST) || !existsSync(f) || statSync(f).isDirectory()) f = p === "/" || !extname(p) ? join(DIST, "index.html") : null;
  if (!f) { res.writeHead(404).end(); return; }
  res.writeHead(200, { "content-type": types[extname(f)] || "application/octet-stream" }).end(readFileSync(f));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const BASE = `http://127.0.0.1:${server.address().port}`;

// ---------- 3. Chrome ----------
const chromePath = process.env.CHROME_PATH || [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome", "/usr/bin/chromium",
].find(existsSync);
if (!chromePath) { console.error("Chrome not found; set CHROME_PATH"); process.exit(1); }
const profile = join(tmpdir(), `ge-qa-${Date.now()}`);
const chrome = spawn(chromePath, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--mute-audio", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"]);
let port;
for (let i = 0; i < 60 && !port; i++) { await wait(250); try { port = readFileSync(join(profile, "DevToolsActivePort"), "utf8").split("\n")[0]; } catch {} }
let target;
for (let i = 0; i < 40 && !target; i++) { try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((x) => x.type === "page"); } catch {} if (!target) await wait(250); }
const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
let seq = 0; const pending = new Map(); let pageLog = null;
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (!pageLog) return;
  if (m.method === "Runtime.exceptionThrown") pageLog.console.push("exception: " + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).slice(0, 200));
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") pageLog.console.push("error: " + m.params.args.map((a) => a.value ?? a.description).join(" ").slice(0, 200));
  if (m.method === "Network.requestWillBeSent") { try { const h = new URL(m.params.request.url).host; if (!h.startsWith("127.0.0.1")) pageLog.external.add(h); } catch {} }
  if (m.method === "Network.loadingFailed" && !m.params.canceled && m.params.blockedReason !== "inspector") pageLog.failed.push(m.params.errorText);
  if (m.method === "Network.responseReceived" && m.params.response.status >= 400) pageLog.failed.push(`${m.params.response.status} ${m.params.response.url.replace(BASE, "")}`);
};
const send = (method, params = {}) => new Promise((r) => { const i = ++seq; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (x) => { const r = await send("Runtime.evaluate", { expression: x, awaitPromise: true, returnByValue: true }); if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || "eval failed"); return r.result?.result?.value; };
function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }
const setViewport = (w, h) => send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 768 });
const key = (type, k, code, kc) => send("Input.dispatchKeyEvent", { type, key: k, code, windowsVirtualKeyCode: kc });
const tab = async () => { await key("keyDown", "Tab", "Tab", 9); await key("keyUp", "Tab", "Tab", 9); };

await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable");
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
await setViewport(390, 844);
await send("Page.navigate", { url: `${BASE}/#app/home` }); await wait(1000);
await ev(`localStorage.clear(); sessionStorage.clear(); sessionStorage.setItem('ge-splash-seen','1')`);
await send("Page.reload"); await wait(1800);
const signedIn = await ev(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>/Demo Account/i.test(b.innerText));if(b){b.click();return true}return false})()`);
await wait(2200);
log(`device-only demo sign-in: ${signedIn ? "ok" : "not shown (already signed in?)"}`);

// ---------- 4. In-page audit (runs inside the page) ----------
const AUDIT = `(() => {
  const vw = document.documentElement.clientWidth;
  const inClosedDetails = (el) => { for (let d = el.parentElement?.closest('details'); d; d = d.parentElement?.closest('details')) { if (!d.open) { const sm = d.querySelector(':scope > summary'); if (!(sm && sm.contains(el))) return true; } } return false; };
  const vis = (el) => { if (inClosedDetails(el)) return false; const s = getComputedStyle(el); if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity === 0) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const srOnly = (el) => { const r = el.getBoundingClientRect(); return r.width <= 1 && r.height <= 1; };
  const name = (el) => (el.getAttribute('aria-label') || (el.getAttribute('aria-labelledby') || '').split(' ').map(i => document.getElementById(i)?.innerText || '').join(' ') || el.innerText || el.getAttribute('title') || el.querySelector('img[alt]')?.alt || '').trim();
  const desc = (el) => { const t = (el.innerText || el.getAttribute('aria-label') || '').trim().replace(/\\s+/g, ' ').slice(0, 50); return el.tagName.toLowerCase() + (t ? ' "' + t + '"' : ' <' + (el.getAttribute('href') || el.className || el.outerHTML).toString().slice(0, 70) + '>'); };
  const out = {};
  out.overflowX = document.documentElement.scrollWidth - vw;
  out.offscreen = [...document.querySelectorAll('main *')].filter(el => { if (!vis(el) || srOnly(el)) return false; const r = el.getBoundingClientRect(); if (r.right <= vw + 1 && r.left >= -1) return false;
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const o = getComputedStyle(p); if (/(auto|scroll|hidden|clip)/.test(o.overflowX)) return false; } return true; }).slice(0, 5).map(desc);
  out.clipped = [...document.querySelectorAll('main h1, main h2, main h3, main p, main button, main a, main span, main li, main label')].filter(el => { if (!vis(el) || srOnly(el)) return false; const s = getComputedStyle(el);
    return (s.overflow === 'hidden' || s.textOverflow === 'ellipsis' || s.overflowX === 'hidden') && el.scrollWidth > el.clientWidth + 2 && el.children.length === 0 && el.innerText.trim(); }).slice(0, 8).map(desc);
  out.h1 = document.querySelectorAll('h1').length;
  const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(vis).map(h => +h.tagName[1]);
  out.headingSkips = hs.filter((l, i) => i > 0 && l > hs[i - 1] + 1).length;
  out.landmarks = { main: !!document.querySelector('main'), nav: !!document.querySelector('nav'), lang: document.documentElement.lang || '' };
  const controls = [...document.querySelectorAll('a[href], button, [role=button], [role=tab], summary, input, select, textarea')].filter(el => vis(el) && !srOnly(el) && !el.closest('[aria-hidden=true]'));
  out.unlabeled = controls.filter(el => !['INPUT','SELECT','TEXTAREA'].includes(el.tagName) && !name(el)).slice(0, 8).map(desc);
  out.unlabeledFields = controls.filter(el => ['INPUT','SELECT','TEXTAREA'].includes(el.tagName) && el.type !== 'hidden' && !(el.labels && el.labels.length) && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')).slice(0, 8).map(el => el.tagName.toLowerCase() + '#' + (el.id || el.name || '?'));
  const inMain = controls.filter(el => el.closest('main') && !el.closest('p') && getComputedStyle(el).display !== 'inline');
  const sizes = inMain.map(el => { let r = el.getBoundingClientRect(); const lab = el.labels && el.labels[0]; if (lab) { const q = lab.getBoundingClientRect(); if (q.width * q.height > r.width * r.height) r = q; } return { el, h: r.height, w: r.width }; });
  out.targetsUnder24 = sizes.filter(s => s.h < 24 || s.w < 24).slice(0, 8).map(s => desc(s.el) + ' ' + Math.round(s.w) + 'x' + Math.round(s.h));
  out.targetsUnder44 = sizes.filter(s => s.h < 44 || s.w < 44).length;
  out.targetsTotal = sizes.length;
  out.imgNoAlt = [...document.images].filter(i => !i.hasAttribute('alt') && !i.closest('[aria-hidden=true]')).map(i => i.getAttribute('src')).slice(0, 5);
  // Contrast: text on a solid (possibly translucent) background chain. Text over images/gradients is reported as "manual".
  const parse = (c) => { const m = c.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(/[ ,\\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const blend = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
  const bgOf = (el) => { const layers = []; for (let p = el; p; p = p.parentElement) { const s = getComputedStyle(p); if (s.backgroundImage !== 'none') return null; const c = parse(s.backgroundColor); if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; } }
    let bg = { r: 255, g: 255, b: 255, a: 1 }; for (let i = layers.length - 1; i >= 0; i--) bg = blend(layers[i], bg); return bg; };
  const hasImageBehind = (el) => { const r = el.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2; return [...document.querySelectorAll('main img, main video')].some(i => { const q = i.getBoundingClientRect(); return cx > q.left && cx < q.right && cy > q.top && cy < q.bottom && i !== el && !i.contains(el); }); };
  const texts = [...document.querySelectorAll('main *, header *, nav *')].filter(el => !/^(VIDEO|AUDIO|SCRIPT|STYLE|NOSCRIPT)$/.test(el.tagName) && vis(el) && !srOnly(el) && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()));
  const fails = []; let manual = 0;
  for (const el of texts) { const s = getComputedStyle(el); const fg = parse(s.color); if (!fg) continue; const bg = bgOf(el); if (!bg || hasImageBehind(el)) { manual++; continue; }
    const f = fg.a < 1 ? blend(fg, bg) : fg; const L1 = lum(f), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const px = parseFloat(s.fontSize), large = px >= 24 || (px >= 18.66 && +s.fontWeight >= 700); const need = large ? 3 : 4.5;
    if (ratio < need) fails.push(desc(el) + ' ' + ratio.toFixed(2) + ':1 (' + Math.round(px) + 'px)'); }
  out.contrastFails = fails.slice(0, 10); out.contrastFailCount = fails.length; out.contrastManual = manual;
  const fonts = new Set(texts.map(el => getComputedStyle(el).fontSize)); out.fontSizes = [...fonts].map(parseFloat).sort((a, b) => a - b);
  out.smallText = texts.filter(el => parseFloat(getComputedStyle(el).fontSize) < 12).slice(0, 5).map(desc);
  const main = document.querySelector('main') || document.body;
  out.words = main.innerText.split(/\\s+/).filter(Boolean).length;
  out.screens = +(document.documentElement.scrollHeight / innerHeight).toFixed(1);
  out.longParagraphs = [...main.querySelectorAll('p')].filter(p => vis(p) && p.innerText.split(/\\s+/).length >= 40).length;
  out.cards = [...main.querySelectorAll('[class*=rounded-2xl],[class*=rounded-3xl],[class*=rounded-\\\\[]')].filter(vis).length;
  return out;
})()`;

const BROKEN = `(async () => { const imgs = [...document.images]; imgs.forEach(i => i.loading = 'eager'); await Promise.all(imgs.map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 4000); })));
  return imgs.filter(i => i.getAttribute('src') && i.complete && i.naturalWidth === 0).map(i => i.getAttribute('src')); })()`;

// Expand/collapse: every disclosure toggles its state and back (first 8 per page).
const DISCLOSURE = `(async () => { const res = { checked: 0, broken: [] }; const sleep = (m) => new Promise(r => setTimeout(r, m));
  const ds = [...document.querySelectorAll('main details > summary')].slice(0, 6);
  for (const s of ds) { const d = s.parentElement; const before = d.open; s.click(); await sleep(60); res.checked++; if (d.open === before) res.broken.push('details: ' + s.innerText.trim().slice(0, 40)); s.click(); await sleep(30); }
  const bs = [...document.querySelectorAll('main button[aria-expanded]')].filter(b => b.offsetParent).slice(0, 6);
  for (const b of bs) { const before = b.getAttribute('aria-expanded'); b.click(); await sleep(120); res.checked++; if (b.getAttribute('aria-expanded') === before) res.broken.push('button: ' + b.innerText.trim().slice(0, 40)); if (document.contains(b)) { b.click(); await sleep(60); } }
  return res; })()`;

// Keyboard: tab through the first N stops; each focused element must be visible, in the viewport after scroll, and show a focus indicator.
const FOCUS_STATE = `(() => { const el = document.activeElement; if (!el || el === document.body) return null; const r = el.getBoundingClientRect();
  if (/^(VIDEO|AUDIO)$/.test(el.tagName) && el.controls) return { tag: el.tagName.toLowerCase(), label: 'native controls', ring: true, inView: true, obscured: false };
  // A focus indicator may sit on the element, its slider thumb, or an ancestor styled with :focus-within. Compare focused vs blurred.
  const chain = [el, el.parentElement, el.parentElement?.parentElement].filter(Boolean);
  const snap = () => chain.map(n => { const s = getComputedStyle(n); return s.outlineStyle + s.outlineWidth + s.outlineColor + '|' + s.boxShadow + '|' + s.borderColor + '|' + s.backgroundColor; }).join('/') + getComputedStyle(el, '::-webkit-slider-thumb').outlineStyle;
  const focused = snap(); el.blur(); const blurred = snap(); el.focus({ preventScroll: true });
  // .ge-range draws its ring on ::-webkit-slider-thumb, which computed styles cannot read (verified visually in a screenshot).
  const ring = focused !== blurred || el.classList.contains('ge-range');
  const top = document.elementFromPoint(Math.min(Math.max(r.left + r.width / 2, 0), innerWidth - 1), Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1));
  return { tag: el.tagName.toLowerCase(), label: (el.getAttribute('aria-label') || el.innerText || '').trim().slice(0, 40), ring, inView: r.bottom > 0 && r.top < innerHeight, obscured: !!top && top !== el && !el.contains(top) && !top.contains(el) }; })()`;

// ---------- 5. Run ----------
const report = { generated: new Date().toISOString(), base: "device-only build", viewports: viewports.map((v) => v.width), pages: [] };
if (shots) rmSync(join(QA, "shots"), { recursive: true, force: true });
for (const vp of viewports) {
  await setViewport(vp.width, vp.height);
  if (shots) mkdirSync(join(QA, "shots", String(vp.width)), { recursive: true });
  for (const r of routes) {
    pageLog = { console: [], failed: [], external: new Set() };
    await ev(`location.hash=${JSON.stringify(r.hash)}`); await wait(1100);
    await ev("document.activeElement?.blur(); window.scrollTo(0,0); document.querySelectorAll('main *').forEach(e => { if (e.scrollLeft) e.scrollLeft = 0; })"); await wait(150);
    const landed = await ev("location.hash.slice(1)");
    const a = await ev(AUDIT);
    a.broken = await ev(BROKEN);
    // Screenshot first, so keyboard/disclosure tests leave no focus rings or open panels in the image.
    if (shots) {
      const h = Math.min(await ev("document.documentElement.scrollHeight"), 16000);
      await setViewport(vp.width, h); await wait(350);
      const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 72 });
      writeFileSync(join(QA, "shots", String(vp.width), `${r.key}.jpg`), Buffer.from(shot.result.data, "base64"));
      await setViewport(vp.width, vp.height); await wait(150);
    }
    if (vp.width === 390) {
      a.disclosure = await ev(DISCLOSURE);
      await ev("window.scrollTo(0,0); document.activeElement?.blur(); document.body.focus()");
      const stops = []; for (let i = 0; i < 12; i++) { await tab(); await wait(40); const f = await ev(FOCUS_STATE); if (f) stops.push(f); }
      a.focus = { stops: stops.length, noRing: stops.filter((s) => !s.ring).map((s) => `${s.tag} "${s.label}"`), obscured: stops.filter((s) => s.obscured).map((s) => `${s.tag} "${s.label}"`) };
      await ev("window.scrollTo(0,0)");
    }
    report.pages.push({ route: r.key, hash: r.hash, group: r.group, width: vp.width, landed, ...a, console: pageLog.console, failed: pageLog.failed, external: [...pageLog.external] });
  }
  log(`${vp.width}px: ${routes.length} routes checked`);
}
pageLog = null; ws.close(); chrome.kill(); server.close();
try { rmSync(profile, { recursive: true, force: true }); } catch {}

// ---------- 6. Gate + report ----------
const gate = [];
for (const p of report.pages) {
  const at = `${p.route}@${p.width}`;
  if (p.landed !== p.hash) gate.push(`${at}: route redirected to #${p.landed}`);
  if (p.overflowX > 0) gate.push(`${at}: horizontal overflow ${p.overflowX}px`);
  if (p.offscreen.length) gate.push(`${at}: content outside viewport — ${p.offscreen.join("; ")}`);
  if (p.broken.length) gate.push(`${at}: broken images ${p.broken.join(", ")}`);
  if (p.h1 !== 1) gate.push(`${at}: ${p.h1} h1 elements`);
  if (p.unlabeled.length || p.unlabeledFields.length) gate.push(`${at}: unlabeled controls ${[...p.unlabeled, ...p.unlabeledFields].join("; ")}`);
  if (p.imgNoAlt.length) gate.push(`${at}: images without alt ${p.imgNoAlt.join(", ")}`);
  if (p.targetsUnder24.length) gate.push(`${at}: targets under 24px ${p.targetsUnder24.join("; ")}`);
  if (p.console.length) gate.push(`${at}: console ${p.console.join(" | ")}`);
  if (p.failed.length) gate.push(`${at}: failed requests ${p.failed.join(", ")}`);
  if (p.external.some((h) => h.includes("supabase"))) gate.push(`${at}: Supabase request in device-only mode`);
  if (p.disclosure?.broken.length) gate.push(`${at}: disclosures not toggling ${p.disclosure.broken.join("; ")}`);
  if (p.focus?.noRing.length) gate.push(`${at}: focus without visible indicator ${p.focus.noRing.join("; ")}`);
}
const warn = [];
for (const p of report.pages) {
  const at = `${p.route}@${p.width}`;
  if (p.contrastFailCount) warn.push(`${at}: ${p.contrastFailCount} text contrast below AA — ${p.contrastFails.slice(0, 3).join("; ")}`);
  if (p.clipped.length) warn.push(`${at}: clipped text ${p.clipped.join("; ")}`);
  if (p.headingSkips) warn.push(`${at}: ${p.headingSkips} heading level skip(s)`);
  if (p.smallText.length) warn.push(`${at}: text under 12px ${p.smallText.join("; ")}`);
  if (p.focus?.obscured.length) warn.push(`${at}: focused element covered ${p.focus.obscured.join("; ")}`);
}
report.gate = { pass: gate.length === 0, failures: gate, warnings: warn };
writeFileSync(join(QA, "report.json"), JSON.stringify(report, null, 1));

const at390 = report.pages.filter((p) => p.width === 390 || (!report.viewports.includes(390) && p.width === report.viewports[0]));
const md = [
  `# UI QA report — ${report.generated}`, "",
  `Device-only build · ${routes.length} routes × ${viewports.length} viewports (${report.viewports.join(", ")} px) = ${report.pages.length} page checks.`, "",
  `## Gate: ${report.gate.pass ? "PASS" : "FAIL"} (${gate.length} failures, ${warn.length} warnings)`, "",
  ...(gate.length ? ["### Failures", ...gate.map((g) => `- ${g}`), ""] : []),
  ...(warn.length ? ["### Warnings (review)", ...warn.slice(0, 80).map((g) => `- ${g}`), warn.length > 80 ? `- … ${warn.length - 80} more in report.json` : "", ""] : []),
  "## Density per page (mobile)", "",
  "| Route | Words | Screens | Long paragraphs | Rounded blocks | Targets <44px | Contrast fails | Text over imagery |", "|---|---|---|---|---|---|---|---|",
  ...at390.map((p) => `| ${p.route} | ${p.words} | ${p.screens} | ${p.longParagraphs} | ${p.cards} | ${p.targetsUnder44}/${p.targetsTotal} | ${p.contrastFailCount} | ${p.contrastManual} |`), "",
  shots ? "Screenshots: `.qa/shots/<width>/<route>.jpg`. Inspect them — a passing gate is not a visual review." : "",
];
writeFileSync(join(QA, "report.md"), md.join("\n"));
log(`gate ${report.gate.pass ? "PASS" : "FAIL"} — ${gate.length} failures, ${warn.length} warnings → .qa/report.md`);
process.exit(report.gate.pass ? 0 : 1);
