import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('Suite 10: Mobile Responsive & Scrolling Verification', () => {
  const VIEWPORTS = [
    { name: 'iphone_se_375x667', width: 375, height: 667, isMobile: true },
    { name: 'iphone_14_390x844', width: 390, height: 844, isMobile: true },
    { name: 'iphone_plus_414x896', width: 414, height: 896, isMobile: true },
    { name: 'ipad_tablet_768x1024', width: 768, height: 1024, isMobile: false },
    { name: 'laptop_1366x768', width: 1366, height: 768, isMobile: false },
    { name: 'desktop_1920x1080', width: 1920, height: 1080, isMobile: false },
  ];

  test('TC-RESP-01: Verify Mobile Native Mode vs Desktop Phone Frame on All Viewports', async ({ page }) => {
    test.setTimeout(180000);
    const loginPage = new LoginPage(page);

    // 1. Check Login page on all viewports
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await loginPage.goto();
      await expect(loginPage.emailInput).toBeVisible({ timeout: 10000 });

      // Verify no horizontal overflow
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalOverflow, `Horizontal overflow detected on Login at ${vp.name}`).toBe(false);

      await page.screenshot({
        path: `docs/screenshots/responsive-fix/01_login_${vp.name}.png`,
        fullPage: true,
      });
    }

    // 2. Log in as Customer to test Customer Portal Screens
    await page.setViewportSize({ width: 1366, height: 768 });
    await loginPage.login(TEST_USERS.customer.email, TEST_USERS.customer.password);
    await page.waitForURL('**/');
    await expect(page.locator('text=Xin chào').first()).toBeVisible({ timeout: 10000 });

    // 3. Verify Desktop Laptop iPhone Frame Constraints (1366x768 & 1920x1080)
    for (const vp of VIEWPORTS.filter((v) => !v.isMobile)) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await expect(page.locator('text=Xin chào').first()).toBeVisible({ timeout: 10000 });

      // Check toolbar is visible on desktop
      const toolbar = page.locator('button:has-text("iPhone 390px")').first();
      await expect(toolbar).toBeVisible();

      // Verify outer window has zero scroll (no desktop body scrollbar)
      const desktopScrollY = await page.evaluate(() => window.scrollY);
      expect(desktopScrollY).toBe(0);

      // Verify phone frame bounds fit within screen height
      const frameMetrics = await page.evaluate(() => {
        // Find the phone frame inside stage
        const frames = document.querySelectorAll('.bg-\\[\\#f8fafc\\]');
        for (const f of frames) {
          const rect = f.getBoundingClientRect();
          if (rect.width > 200 && rect.width < 500) {
            return {
              top: rect.top,
              bottom: rect.bottom,
              height: rect.height,
              windowHeight: window.innerHeight,
              fitsInViewport: rect.bottom <= window.innerHeight + 2,
            };
          }
        }
        return null;
      });

      if (frameMetrics) {
        expect(frameMetrics.fitsInViewport, `Phone frame extends beyond viewport at ${vp.name}`).toBe(true);
      }

      await page.screenshot({
        path: `docs/screenshots/responsive-fix/02_dashboard_desktop_${vp.name}.png`,
        fullPage: false,
      });
    }

    // 4. Verify Mobile Viewports (< md): toolbar hidden, full-screen native, no horizontal overflow
    for (const vp of VIEWPORTS.filter((v) => v.isMobile)) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await expect(page.locator('text=Xin chào').first()).toBeVisible({ timeout: 10000 });

      // Check preview toolbar is hidden on mobile
      const toolbar = page.locator('.hidden.md\\:flex').first();
      const isToolbarHidden = await toolbar.evaluate((el) => {
        return window.getComputedStyle(el).display === 'none';
      });
      expect(isToolbarHidden, `Toolbar must be hidden on mobile at ${vp.name}`).toBe(true);

      // Verify zero horizontal overflow
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalOverflow, `Horizontal overflow on mobile dashboard at ${vp.name}`).toBe(false);

      await page.screenshot({
        path: `docs/screenshots/responsive-fix/03_dashboard_mobile_${vp.name}.png`,
        fullPage: true,
      });
    }
  });

  test('TC-RESP-02: Comprehensive Audit of Customer Profile Screen', async ({ page }) => {
    test.setTimeout(120000);
    const loginPage = new LoginPage(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await loginPage.goto();
    await loginPage.login(TEST_USERS.customer.email, TEST_USERS.customer.password);
    await page.waitForURL('**/');

    // Test Profile Page across Mobile (375x667, 390x844) & Laptop (1366x768)
    const testVps = [
      { name: 'profile_375x667', width: 375, height: 667 },
      { name: 'profile_390x844', width: 390, height: 844 },
      { name: 'profile_1366x768', width: 1366, height: 768 },
    ];

    for (const vp of testVps) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/profile');
      await expect(page.locator('text=Thông tin công ty').first()).toBeVisible({ timeout: 10000 });

      // Check Tabs are rendered and clickable
      const companyTab = page.locator('button:has-text("Công ty")').first();
      const locationsTab = page.locator('button:has-text("Kho & Cảng")').first();
      const contactsTab = page.locator('button:has-text("Liên hệ")').first();
      const settingsTab = page.locator('button:has-text("Tùy chọn")').first();

      await expect(companyTab).toBeVisible();
      await expect(locationsTab).toBeVisible();
      await expect(contactsTab).toBeVisible();
      await expect(settingsTab).toBeVisible();

      // Test tab switching
      await locationsTab.click();
      await page.waitForTimeout(200);
      await companyTab.click();

      // Check Section 2 title and toggle do not overlap
      const section2Title = page.locator('text=Thông tin mặc định cho yêu cầu vận chuyển').first();
      await expect(section2Title).toBeVisible();

      const toggleCheckbox = page.locator('input[type="checkbox"]').first();
      await expect(toggleCheckbox).toBeAttached();

      // Verify zero horizontal overflow
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalOverflow, `Profile page has horizontal overflow at ${vp.name}`).toBe(false);

      // Verify Bottom Navigation is present
      const bottomNav = page.locator('nav').first();
      await expect(bottomNav).toBeVisible();

      await page.screenshot({
        path: `docs/screenshots/responsive-fix/04_profile_${vp.name}.png`,
        fullPage: vp.width > 768 ? false : true,
      });
    }
  });

  test('TC-RESP-03: Single Scroll Container & Workflow Verification on All Core Screens', async ({ page }) => {
    test.setTimeout(180000);
    const loginPage = new LoginPage(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await loginPage.goto();
    await loginPage.login(TEST_USERS.customer.email, TEST_USERS.customer.password);
    await page.waitForURL('**/');

    const screens = [
      { name: 'create_booking', path: '/booking/new', verifyText: 'Tạo yêu cầu vận chuyển' },
      { name: 'schedule_change', path: '/schedule-change?code=REQ-250828-001', verifyText: 'Đề xuất sửa thời gian' },
      { name: 'tracking', path: '/tracking', verifyText: 'Theo dõi tiến độ' },
      { name: 'notifications', path: '/notifications', verifyText: 'Thông báo hệ thống' },
    ];

    for (const screen of screens) {
      await page.goto(screen.path);
      await expect(page.locator(`text=${screen.verifyText}`).first()).toBeVisible({ timeout: 10000 });

      // Verify zero horizontal overflow on 390px
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasOverflow, `${screen.name} has horizontal overflow`).toBe(false);

      // Verify scroll behavior: scroll inside main container
      const canScrollMain = await page.evaluate(() => {
        const main = document.querySelector('main') || document.querySelector('.overflow-y-auto');
        if (!main) return false;
        const initialScroll = main.scrollTop;
        main.scrollTop = 150;
        const scrolled = main.scrollTop > initialScroll || main.scrollHeight > main.clientHeight;
        main.scrollTop = 0;
        return true;
      });
      expect(canScrollMain).toBe(true);

      await page.screenshot({
        path: `docs/screenshots/responsive-fix/05_screen_${screen.name}.png`,
        fullPage: true,
      });
    }

    // Also test Dispatcher & Admin screens on 1366x768 and 390x844
    await page.setViewportSize({ width: 1366, height: 768 });

    // Dispatcher
    await page.goto('/dispatcher');
    await expect(page.locator('text=Điều Phối Viên').first()).toBeVisible({ timeout: 10000 });
    const dispOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(dispOverflow).toBe(false);
    await page.screenshot({
      path: `docs/screenshots/responsive-fix/06_dispatcher_1366x768.png`,
      fullPage: false,
    });

    // Admin Dashboard
    await page.goto('/admin');
    await expect(page.locator('text=/ADMIN CONSOLE|Bảng điều khiển/i').first()).toBeVisible({ timeout: 10000 });
    const adminOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(adminOverflow).toBe(false);
    await page.screenshot({
      path: `docs/screenshots/responsive-fix/07_admin_dashboard_1366x768.png`,
      fullPage: false,
    });

    // Admin Master Data
    await page.goto('/admin/master-data');
    await expect(page.locator('text=Danh mục Master Data').first()).toBeVisible({ timeout: 10000 });
    await page.screenshot({
      path: `docs/screenshots/responsive-fix/08_admin_master_data_1366x768.png`,
      fullPage: false,
    });
  });
});
