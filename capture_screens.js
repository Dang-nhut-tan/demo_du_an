const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function capture() {
  const outputDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  // 1. Screen 1 Desktop (1672x941)
  console.log('Capturing Screen 1 Login (Desktop 1672x941)...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1672, height: 941 },
    deviceScaleFactor: 1,
  });
  const page1 = await desktopContext.newPage();
  await page1.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle' });
  await page1.waitForTimeout(1000);
  await page1.screenshot({ path: path.join(outputDir, 'screen1_login_desktop.png'), fullPage: true });
  await desktopContext.close();

  // 2. Mobile Viewport (iPhone 414x896)
  const mobileContext = await browser.newContext({
    viewport: { width: 414, height: 896 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  // Screen 1 Login Mobile
  console.log('Capturing Screen 1 Login (Mobile 414x896)...');
  const pageLoginMobile = await mobileContext.newPage();
  await pageLoginMobile.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle' });
  await pageLoginMobile.waitForTimeout(800);
  await pageLoginMobile.screenshot({ path: path.join(outputDir, 'screen1_login_mobile.png') });
  await pageLoginMobile.close();

  // Screen 2 Dashboard Mobile
  console.log('Capturing Screen 2 Dashboard (Mobile 414x896)...');
  const pageDash = await mobileContext.newPage();
  await pageDash.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await pageDash.waitForTimeout(1000);
  await pageDash.screenshot({ path: path.join(outputDir, 'screen2_dashboard_mobile.png') });
  await pageDash.close();

  // Screen 6 Profile Mobile
  console.log('Capturing Screen 6 Profile (Mobile 414x896)...');
  const pageProfile = await mobileContext.newPage();
  await pageProfile.goto('http://127.0.0.1:5173/profile', { waitUntil: 'networkidle' });
  await pageProfile.waitForTimeout(1000);
  await pageProfile.screenshot({ path: path.join(outputDir, 'screen6_profile_mobile.png') });
  await pageProfile.close();

  // Screen 8 Notifications Mobile
  console.log('Capturing Screen 8 Notifications (Mobile 414x896)...');
  const pageNotif = await mobileContext.newPage();
  await pageNotif.goto('http://127.0.0.1:5173/notifications', { waitUntil: 'networkidle' });
  await pageNotif.waitForTimeout(800);
  await pageNotif.screenshot({ path: path.join(outputDir, 'screen8_notifications_mobile.png') });
  await pageNotif.close();

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
