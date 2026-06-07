import { readFileSync, statSync } from "node:fs";

const requiredFiles = [
  "index.html",
  "styles.css",
  "src/app.js",
  "manifest.webmanifest",
  "service-worker.js",
  "README.md",
  "PLAYTEST.md",
  "CONTENT-TODO.md"
];

const requiredWorldIds = ["moto", "jedi", "creatures", "guardian", "pixie", "fishing"];
const requiredTokens = ["Gearheart", "Starheart", "Teamheart", "Lightheart", "Pixieheart", "Tideheart"];
const requiredAssets = ["./", "./index.html", "./styles.css", "./src/app.js", "./manifest.webmanifest"];

function fail(message) {
  console.error(`Validation failed: ${message}`);
  process.exitCode = 1;
}

for (const file of requiredFiles) {
  try {
    const size = statSync(file).size;
    if (size === 0) fail(`${file} is empty`);
  } catch {
    fail(`${file} is missing`);
  }
}

const app = readFileSync("src/app.js", "utf8");
const serviceWorker = readFileSync("service-worker.js", "utf8");
const manifest = readFileSync("manifest.webmanifest", "utf8");

for (const id of requiredWorldIds) {
  if (!app.includes(`id: "${id}"`)) fail(`world id "${id}" is missing from app.js`);
}

for (const token of requiredTokens) {
  if (!app.includes(token)) fail(`token "${token}" is missing from app.js`);
}

for (const asset of requiredAssets) {
  if (!serviceWorker.includes(`"${asset}"`)) fail(`service worker asset "${asset}" is missing`);
}

if (!manifest.includes("Dadventure: The Six Worlds of Father's Day")) {
  fail("manifest name is not the six-world title");
}

if (!process.exitCode) {
  console.log("Content validation passed.");
}
