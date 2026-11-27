// Shared by the QA runner and Playwright: build the app in device-only mode and serve it locally.
// Device-only = VITE_SUPABASE_* blanked, so accounts and rewards live in the browser and no cloud
// project is ever contacted. The build is refused if the bundle still references a Supabase host.
import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";

export const ROOT = resolve(import.meta.dirname, "../..");

export function buildDeviceOnly(outDir) {
  const r = spawnSync("npx", ["vite", "build", "--outDir", outDir, "--emptyOutDir", "--logLevel", "warn"], {
    cwd: ROOT,
    shell: true,
    stdio: "inherit",
    env: { ...process.env, VITE_SUPABASE_URL: "", VITE_SUPABASE_PUBLISHABLE_KEY: "" },
  });
  if (r.status !== 0) throw new Error("device-only build failed");
  assertDeviceOnly(outDir);
}

export function assertDeviceOnly(outDir) {
  const dir = join(outDir, "assets");
  const js = readdirSync(dir).filter((f) => f.endsWith(".js")).map((f) => readFileSync(join(dir, f), "utf8")).join("\n");
  if (/https:\/\/[a-z0-9]+\.supabase\.co/.test(js)) throw new Error("ABORT: bundle references a Supabase project; QA must run device-only");
}

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".json": "application/json", ".mp4": "video/mp4", ".woff2": "font/woff2", ".vtt": "text/vtt", ".ico": "image/x-icon" };

/** Static server for a built app (SPA fallback to index.html). Resolves to the server once listening. */
export function serve(outDir, port = 0) {
  const server = createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let f = join(outDir, p);
    if (!f.startsWith(outDir) || !existsSync(f) || statSync(f).isDirectory()) f = p === "/" || !extname(p) ? join(outDir, "index.html") : null;
    if (!f) { res.writeHead(404).end(); return; }
    const type = TYPES[extname(f)] || "application/octet-stream";
    const size = statSync(f).size;
    const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || "");
    if (range) { // media elements stream with Range requests
      const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
      const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
      res.writeHead(206, { "content-type": type, "accept-ranges": "bytes", "content-range": `bytes ${start}-${end}/${size}`, "content-length": end - start + 1 });
      createReadStream(f, { start, end }).pipe(res);
      return;
    }
    res.writeHead(200, { "content-type": type, "accept-ranges": "bytes", "content-length": size });
    createReadStream(f).pipe(res);
  });
  return new Promise((r) => server.listen(port, "127.0.0.1", () => r(server)));
}

// CLI: `node scripts/qa/device-only.mjs --port=4820 [--no-build]` (used as Playwright's webServer).
if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, "").split("="); return [k, v ?? true]; }));
  const out = join(ROOT, ".qa", "pw-dist");
  if (!args["no-build"] || !existsSync(out)) buildDeviceOnly(out); else assertDeviceOnly(out);
  const s = await serve(out, Number(args.port || 4820));
  console.log(`device-only app on http://127.0.0.1:${s.address().port}`);
}
