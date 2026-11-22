const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function captureAdmin() {
  const outputDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const page = await desktopContext.newPage();

  // Login as admin first or set local auth
  await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    const adminUser = {
      id: 'admin-demo-id',
      email: 'admin@demo.local',
      name: 'Quản trị viên Hệ thống',
      role: 'admin',
    };
    localStorage.setItem('pocketbase_auth', JSON.stringify({ token: 'sim-admin', model: adminUser }));
  });

  // 1. Admin Dashboard
  console.log('Capturing Admin Dashboard...');
  await page.goto('http://127.0.0.1:5173/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, 'admin_dashboard.png'), fullPage: true });

  // 2. Admin Master Data
  console.log('Capturing Admin Master Data...');
  await page.goto('http://127.0.0.1:5173/admin/master-data', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, 'admin_master_data.png'), fullPage: true });

  // 3. Admin Customers
  console.log('Capturing Admin Customers...');
  await page.goto('http://127.0.0.1:5173/admin/customers', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, 'admin_customers.png'), fullPage: true });

  // 4. Admin Form Config
  console.log('Capturing Admin Form Config...');
  await page.goto('http://127.0.0.1:5173/admin/form-config', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, 'admin_form_config.png'), fullPage: true });

  await desktopContext.close();
  await browser.close();
  console.log('Admin screenshots captured successfully!');
}

captureAdmin().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
