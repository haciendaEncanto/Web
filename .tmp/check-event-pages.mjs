import { chromium } from "playwright";
import { mkdirSync } from "fs";

mkdirSync(".tmp/screenshots", { recursive: true });

const routes = [
  ["bodas",                 "http://localhost:3000/bodas"],
  ["quince-anos",           "http://localhost:3000/quince-anos"],
  ["eventos-empresariales", "http://localhost:3000/eventos-empresariales"],
  ["revelacion-de-genero",  "http://localhost:3000/revelacion-de-genero"],
];

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

for (const [name, url] of routes) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  const h1 = await page.$eval("h1", el => el.innerText).catch(() => "NO H1");
  const title = await page.title();
  await page.screenshot({ path: `.tmp/screenshots/${name}.png`, fullPage: false });
  console.log(`✓ ${name}: "${h1}" | title="${title}"`);
}

await browser.close();
console.log("\nScreenshots guardados en .tmp/screenshots/");
