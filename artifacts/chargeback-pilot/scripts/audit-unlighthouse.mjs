import fs from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outputPath = path.resolve(root, "..", "unlighthouse-report-local");
const port = Number(process.env.UNLIGHTHOUSE_PORT ?? 4173);
const baseUrl = `http://127.0.0.1:${port}`;

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
      stdio: "inherit",
      shell: process.platform === "win32",
      ...options,
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${code}`));
    });
  });
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
  await run(
    "pnpm",
    [
      "exec",
      "unlighthouse-ci",
      "--site",
      baseUrl,
      "--sitemaps",
      `${baseUrl}/sitemap.xml`,
      "--exclude-urls",
      "/admin,/admin/*",
      "--mobile",
      "--throttle",
      "--reporter",
      "json",
      "--output-path",
      outputPath,
    ],
    {
      cwd: root,
      env: {
        ...process.env,
        CHROME_PATH: chromePath,
      },
    }
  );
  console.log(`Unlighthouse report: ${outputPath}`);
} finally {
  server.kill("SIGINT");
}
