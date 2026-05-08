import { chromium } from 'playwright';
import path from 'path';

const SCREENSHOTS = 'C:/PROJECTQ/productivity-app/test-screenshots';
const BASE = 'http://localhost:3001';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  console.log('Navigating to /app');
  await page.goto(BASE + '/app', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOTS, '01-app-full-desktop.png') });
  console.log('Done: 01-app-full-desktop.png');
  await browser.close();
}
run();
