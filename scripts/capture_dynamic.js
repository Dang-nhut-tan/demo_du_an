const { chromium } = require('@playwright/test');

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  // Login as Customer
  await page.goto('http://127.0.0.1:5173/login');
  await page.fill('input[type="email"]', 'customer@demo.local');
  await page.fill('input[type="password"]', 'Demo@123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  // Navigate to Create Booking
  await page.goto('http://127.0.0.1:5173/booking/new');
  await page.waitForTimeout(1500);

  await page.screenshot({ path: 'screenshots/screen3_dynamic_combobox.png', fullPage: true });
  await page.screenshot({ path: 'C:/Users/TAN/.gemini/antigravity/brain/2981a8fe-c5e0-4c48-8553-0e3c5be1a25c/screen3_dynamic_combobox.png', fullPage: true });

  // Navigate to Profile
  await page.goto('http://127.0.0.1:5173/profile');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/screen6_profile_combobox.png', fullPage: true });
  await page.screenshot({ path: 'C:/Users/TAN/.gemini/antigravity/brain/2981a8fe-c5e0-4c48-8553-0e3c5be1a25c/screen6_profile_combobox.png', fullPage: true });

  await browser.close();
  console.log('Screenshots captured successfully!');
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
