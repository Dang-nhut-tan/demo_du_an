const { chromium } = require('playwright');

const routes = [
  '/',
  '/login',
  '/register',
  '/profile',
  '/notifications',
  '/booking/new',
  '/schedule-change',
  '/tracking',
  '/dispatcher',
  '/admin',
  '/admin/registrations',
  '/admin/master-data',
  '/admin/customers',
  '/admin/form-config'
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const results = [];
  page.on('pageerror', err => {
    console.error(`[PAGEERROR on ${page.url()}]`, err.message);
  });

  console.log('=== Checking all routes on https://demo-du-an-s7j9.onrender.com ===');

  for (const route of routes) {
    const url = `https://demo-du-an-s7j9.onrender.com${route}`;
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 25000 });
      await page.waitForTimeout(1500);

      const html = await page.content();
      const bodyText = (await page.innerText('body')).trim();
      const title = await page.title();
      const isBlank = bodyText.length === 0;

      // Check if root has content
      const rootHtml = await page.$eval('#root', el => el.innerHTML).catch(() => '');
      const hasError = rootHtml.includes('Đã xảy ra lỗi') || rootHtml.includes('Something went wrong');

      console.log(`Route [${route}]: status=${response ? response.status() : 'N/A'}, bodyLength=${bodyText.length}, isBlank=${isBlank}, hasError=${hasError}`);
      results.push({ route, status: response ? response.status() : 'ERR', bodyLength: bodyText.length, isBlank, hasError, preview: bodyText.substring(0, 80).replace(/\n/g, ' ') });
    } catch (err) {
      console.error(`Route [${route}] FAILED:`, err.message);
      results.push({ route, error: err.message, isBlank: true });
    }
  }

  console.log('\n=== RESULTS SUMMARY ===');
  console.table(results);

  await browser.close();
})();
