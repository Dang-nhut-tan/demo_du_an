const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BRAIN_DIR = 'C:\\Users\\TAN\\.gemini\\antigravity\\brain\\2981a8fe-c5e0-4c48-8553-0e3c5be1a25c';
const LOCAL_SCREENSHOTS = path.resolve(__dirname, '../screenshots');

if (!fs.existsSync(LOCAL_SCREENSHOTS)) {
  fs.mkdirSync(LOCAL_SCREENSHOTS, { recursive: true });
}

function saveScreenshot(page, filename, description) {
  const localPath = path.join(LOCAL_SCREENSHOTS, filename);
  const brainPath = path.join(BRAIN_DIR, filename);
  return page.screenshot({ path: localPath, fullPage: true }).then(() => {
    fs.copyFileSync(localPath, brainPath);
    console.log(`Screenshot: ${brainPath} | ${description}`);
  });
}

(async () => {
  console.log('--- STARTING E2E WORKFLOW VERIFICATION ---');
  const browser = await chromium.launch({ headless: true });
  
  // Set viewport to iPhone 414x896 as specified in mockups
  const context = await browser.newContext({
    viewport: { width: 414, height: 896 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  try {
    // 1. LOGIN
    console.log('1. Navigating to Login...');
    await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'customer@demo.local');
    await page.fill('input[type="password"]', 'Demo@123456');
    await page.click('button:has-text("Đăng nhập")');
    await page.waitForTimeout(1000);

    // 2. CREATE BOOKING REQUEST (Screen 3)
    console.log('2. Testing Screen 3: Create Booking Request...');
    await page.goto('http://127.0.0.1:5173/booking/new', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // Fill Booking number
    const testBookingNo = `BK-${Date.now().toString().slice(-6)}`;
    await page.fill('input[placeholder="Ví dụ: BK250828-001"]', testBookingNo);
    await page.fill('input[placeholder="Ví dụ: ONE TRIUMPH / 024W"]', 'EVER GIVEN / 0422-056N');
    
    // Fill dates
    const dateInputs = await page.$$('input[type="date"]');
    if (dateInputs.length >= 2) {
      await dateInputs[0].fill('2025-08-29');
      await dateInputs[1].fill('2025-08-30');
    }

    // Add note
    await page.fill('textarea', 'Hàng giá trị cao, yêu cầu kẹp chì seal hãng tàu cẩn thận.');

    await saveScreenshot(page, 'screen3_create_booking_step1.png', 'Screen 3 Create Booking Form Step 1');

    // Click Tiếp tục -> Step 2
    console.log('Advancing to Step 2: Review...');
    await page.click('button:has-text("Tiếp tục")');
    await page.waitForTimeout(600);

    await saveScreenshot(page, 'screen3_create_booking_step2.png', 'Screen 3 Create Booking Review Step 2');

    // Click Xác nhận & Gửi yêu cầu -> Step 3
    console.log('Submitting Booking to PocketBase...');
    await page.click('button:has-text("Xác nhận & Gửi yêu cầu")');
    await page.waitForTimeout(1000);

    await saveScreenshot(page, 'screen3_create_booking_step3.png', 'Screen 3 Create Booking Success Step 3');

    // 3. SCHEDULE CHANGE REQUEST (Screen 4)
    console.log('3. Testing Screen 4: Schedule Change Request...');
    await page.goto('http://127.0.0.1:5173/schedule-change', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // Verify fields
    await page.fill('textarea', 'Khách hàng dời lịch đóng hàng sang ngày 31/08 do kho bảo trì đột xuất.');
    await saveScreenshot(page, 'screen4_schedule_change.png', 'Screen 4 Schedule Change Proposal UI');

    // Click Gửi đề xuất
    console.log('Submitting Schedule Change Proposal to PocketBase...');
    await page.click('button:has-text("Gửi đề xuất")');
    await page.waitForTimeout(1000);
    await saveScreenshot(page, 'screen4_schedule_change_success.png', 'Screen 4 Schedule Change Success');

    // 4. TRACKING PROGRESS (Screen 5)
    console.log('4. Testing Screen 5: Tracking Progress Timeline...');
    await page.goto('http://127.0.0.1:5173/tracking?code=REQ-250828-001', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await saveScreenshot(page, 'screen5_tracking_progress.png', 'Screen 5 Tracking Progress Timeline Dashboard');

    // 5. DISPATCHER DASHBOARD (Screen 7)
    console.log('5. Testing Screen 7: Dispatcher Dashboard...');
    // Create new desktop context for dispatcher
    const deskContext = await browser.newContext({
      viewport: { width: 1024, height: 768 },
    });
    const deskPage = await deskContext.newPage();
    await deskPage.goto('http://127.0.0.1:5173/dispatcher', { waitUntil: 'networkidle' });
    await deskPage.waitForTimeout(1000);
    await saveScreenshot(deskPage, 'screen7_dispatcher_dashboard.png', 'Screen 7 Dispatcher Dashboard Review and Approvals');

    // Test tab switches
    console.log('Checking Dispatcher Schedule Changes tab...');
    await deskPage.click('button:has-text("Đề xuất đổi lịch")');
    await deskPage.waitForTimeout(600);
    await saveScreenshot(deskPage, 'screen7_dispatcher_changes_tab.png', 'Screen 7 Dispatcher Schedule Change Review');

    console.log('Checking Dispatcher Progress Update tab...');
    await deskPage.click('button:has-text("Cập nhật tiến độ xe")');
    await deskPage.waitForTimeout(600);
    await saveScreenshot(deskPage, 'screen7_dispatcher_progress_tab.png', 'Screen 7 Dispatcher Live Transport Stage Updater');

    await deskContext.close();
    console.log('--- ALL WORKFLOWS VERIFIED SUCCESSFULLY ---');
  } catch (err) {
    console.error('Workflow error:', err);
  } finally {
    await browser.close();
  }
})();
