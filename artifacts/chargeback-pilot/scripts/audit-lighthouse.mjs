import fs from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outputDir = path.resolve(root, "..", "lighthouse-report-local");
const port = Number(process.env.LIGHTHOUSE_PORT ?? 4173);
const baseUrl = `http://127.0.0.1:${port}`;
const routes = (
  process.env.LIGHTHOUSE_ROUTES ??
  [
    "/",
    "/ratgeber",
    "/chargeback-antrag-vorlage",
    "/paypal-kaeuferschutz-vorlage",
    "/hilfe/amazon/ware-nicht-erhalten",
    "/hilfe/uber-eats/lieferung-falsch",
    "/impressum",
    "/vorlagen-generator",
  ].join(",")
)
  .split(",")
  .map((route) => route.trim())
  .filter((route) => Boolean(route) && !route.startsWith("/admin"));

function request(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      res.resume();
      res.on("end", () => resolve(res.statusCode ?? 0));
    });
    req.on("error", reject);
    req.setTimeout(1000, () => {
      req.destroy(new Error("timeout"));
    });
  });
}

async function waitForServer() {
  const started = Date.now();
  while (Date.now() - started < 20000) {
    try {
      const status = await request(`${baseUrl}/`);
      if (status >= 200 && status < 500) return;
    } catch {
      // Keep waiting until the preview server is ready.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Preview server did not start at ${baseUrl}`);
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: options.stdio ?? "pipe",
      shell: process.platform === "win32",
      ...options,
    });
    let output = "";
    child.stdout?.on("data", (chunk) => {
      output += chunk;
    });
    child.stderr?.on("data", (chunk) => {
      output += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(output);
      else reject(new Error(output || `${command} exited with ${code}`));
    });
  });
}

function score(value) {
  return Math.round((value ?? 0) * 100);
}

function slug(route) {
  return route === "/" ? "home" : route.replace(/^\/+/, "").replace(/[^a-z0-9]+/gi, "-");
}

async function resolveChromePath() {
  const chromeCacheDir = path.join(os.homedir(), ".cache", "puppeteer", "chrome");

  try {
    const entries = await fs.readdir(chromeCacheDir);
    const candidates = entries
      .filter((entry) => entry.startsWith("linux-"))
      .map((entry) => ({
        version: entry.replace(/^linux-/, ""),
        executable: path.join(chromeCacheDir, entry, "chrome-linux64", "chrome"),
      }))
      .sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }));

    for (const candidate of candidates) {
      try {
        await fs.access(candidate.executable);
        return candidate.executable;
      } catch {
        // Try the next cached Chrome.
      }
    }
  } catch {
    // Fall back to Puppeteer's default resolver.
  }

  return await puppeteer.executablePath();
}

await fs.mkdir(outputDir, { recursive: true });

const server = spawn(
  "pnpm",
  [
    "exec",
    "vite",
    "preview",
    "--config",
    "vite.config.ts",
    "--host",
    "127.0.0.1",
    "--port",
    String(port),
  ],
  {
    cwd: root,
    stdio: "ignore",
    env: {
      ...process.env,
      PORT: String(port),
    },
    shell: process.platform === "win32",
  }
);

try {
  await waitForServer();
  const chromePath = await resolveChromePath();
  const results = [];

  for (const route of routes) {
    const outputPath = path.join(outputDir, `${slug(route)}.json`);
    await run(
      "pnpm",
      [
        "exec",
        "lighthouse",
        `${baseUrl}${route}`,
        "--quiet",
        "--output=json",
        `--output-path=${outputPath}`,
        "--only-categories=performance,accessibility,best-practices,seo",
        "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage",
      ],
      {
        cwd: root,
        env: {
          ...process.env,
          CHROME_PATH: chromePath,
        },
      }
    );

    const report = JSON.parse(await fs.readFile(outputPath, "utf-8"));
    results.push({
      route,
      performance: score(report.categories.performance?.score),
      accessibility: score(report.categories.accessibility?.score),
      bestPractices: score(report.categories["best-practices"]?.score),
      seo: score(report.categories.seo?.score),
      fcp: report.audits["first-contentful-paint"]?.displayValue ?? "-",
      lcp: report.audits["largest-contentful-paint"]?.displayValue ?? "-",
      tbt: report.audits["total-blocking-time"]?.displayValue ?? "-",
    });
  }

  console.table(results);
  console.log(`Lighthouse JSON reports: ${outputDir}`);
} finally {
  server.kill("SIGINT");
}
