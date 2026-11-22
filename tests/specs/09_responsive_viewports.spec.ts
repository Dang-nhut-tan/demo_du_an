import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('Suite 9: Responsive Design & Viewport Matrix Suite', () => {
  const VIEWPORTS = [
    { name: '360x800', width: 360, height: 800 },
    { name: '375x812', width: 375, height: 812 },
    { name: '390x844', width: 390, height: 844 },
    { name: '430x932', width: 430, height: 932 },
  ];

  test('TC-RESPONSIVE: Mobile viewports 360x800, 375x812, 390x844, 430x932 testing & screenshots', async ({ page }) => {
    test.setTimeout(240000);

    const loginPage = new LoginPage(page);

    // 1. Capture Login for all viewports & verify no overflow
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await loginPage.goto();
      await expect(loginPage.emailInput).toBeVisible({ timeout: 10000 });

      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalOverflow).toBe(false);

      await page.screenshot({
        path: `test-results/screenshots/responsive_login_${vp.name}.png`,
        fullPage: true,
      });
    }

    // 2. Authenticate as Customer
    await page.setViewportSize({ width: 390, height: 844 });
    await loginPage.login(TEST_USERS.customer.email, TEST_USERS.customer.password);
    await page.waitForURL('**/');
    await expect(page.locator('text=Xin chào').first()).toBeVisible({ timeout: 10000 });

    // 3. Capture authenticated routes across viewports
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // Home Dashboard
      await page.goto('/');
      await expect(page.locator('text=Xin chào').first()).toBeVisible({ timeout: 10000 });
      const overflowHome = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(overflowHome).toBe(false);
      await page.screenshot({
        path: `test-results/screenshots/responsive_dashboard_${vp.name}.png`,
        fullPage: true,
      });

      // Create Booking
      await page.goto('/booking/create');
      await expect(page.locator('text=Tạo yêu cầu vận chuyển').first()).toBeVisible({ timeout: 10000 });
      await page.screenshot({
        path: `test-results/screenshots/responsive_booking_${vp.name}.png`,
        fullPage: true,
      });

      // Schedule Change Proposal
      await page.goto('/schedule-change?code=REQ-250828-001');
      await expect(page.locator('text=Đề xuất sửa thời gian').first()).toBeVisible({ timeout: 10000 });
      await page.screenshot({
        path: `test-results/screenshots/responsive_schedule_${vp.name}.png`,
        fullPage: true,
      });

      // Tracking Timeline
      await page.goto('/tracking/REQ-250828-001');
      await expect(page.locator('text=Theo dõi tiến độ').first()).toBeVisible({ timeout: 10000 });
      await page.screenshot({
        path: `test-results/screenshots/responsive_tracking_${vp.name}.png`,
        fullPage: true,
      });

      // Company Profile
      await page.goto('/profile');
      await expect(page.locator('text=Thông tin công ty').first()).toBeVisible({ timeout: 10000 });
      await page.screenshot({
        path: `test-results/screenshots/responsive_profile_${vp.name}.png`,
        fullPage: true,
      });

      // Admin Console
      await page.goto('/admin');
      if (await page.locator('text=/Quản trị|Admin|Bảng điều khiển/i').first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await page.screenshot({
          path: `test-results/screenshots/responsive_admin_${vp.name}.png`,
          fullPage: true,
        });
      }
    }
  });
});
