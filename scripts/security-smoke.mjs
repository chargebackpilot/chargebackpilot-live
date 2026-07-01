import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

function gitLsFiles() {
  return execFileSync("git", ["ls-files"], { encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
}

function fail(message) {
  console.error(`security smoke failed: ${message}`);
  process.exit(1);
}

const tracked = gitLsFiles();

const forbiddenTrackedPaths = tracked.filter((file) => {
  if (file === ".env.example") return false;
  return (
    /(^|\/)\.env(\.|$)/.test(file) ||
    /^artifacts\/(?:lighthouse|unlighthouse)-report/.test(file) ||
    /\.(?:pem|p12|pfx|key)$/i.test(file)
  );
});

if (forbiddenTrackedPaths.length) {
  fail(`forbidden tracked files:\n${forbiddenTrackedPaths.slice(0, 20).join("\n")}`);
}

const sourceFiles = tracked.filter(
  (file) =>
    /\.(?:ts|tsx|js|mjs|json|md|html)$/.test(file) &&
    !file.includes("/dist/") &&
    !file.includes("/node_modules/") &&
    !/^artifacts\/(?:lighthouse|unlighthouse)-report/.test(file)
);

const secretPattern =
  /(sk_live_[A-Za-z0-9]{12,}|pk_live_[A-Za-z0-9]{12,}|whsec_[A-Za-z0-9]{12,}|AIza[0-9A-Za-z_-]{20,}|-----BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY-----)/;

const secretHits = [];
for (const file of sourceFiles) {
  const text = readFileSync(file, "utf8");
  if (secretPattern.test(text) && file !== ".env.example") {
    secretHits.push(file);
  }
}

if (secretHits.length) {
  fail(`possible committed secrets:\n${secretHits.slice(0, 20).join("\n")}`);
}

const envExample = readFileSync(".env.example", "utf8");
for (const required of [
  "STRIPE_WEBHOOK_SECRET",
  "TURNSTILE_SECRET_KEY",
  "CASE_RETENTION_MONTHS",
  "ANALYTICS_RETENTION_MONTHS",
]) {
  if (!envExample.includes(required)) {
    fail(`.env.example is missing ${required}`);
  }
}

console.log("security smoke ok");
