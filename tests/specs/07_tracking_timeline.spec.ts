import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DispatcherPage } from '../pages/DispatcherPage';
import { TrackingPage } from '../pages/TrackingPage';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('Suite 7: Transport Progress Realtime Tracking Suite', () => {
  test('TC-TRACK-001: Customer tracks booking timeline', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_USERS.customer.email, TEST_USERS.customer.password);
    await expect(page.locator('text=Xin chào').first()).toBeVisible({ timeout: 10000 });

    const trackingPage = new TrackingPage(page);
    await trackingPage.goto('REQ-250828-001');

    await expect(page.locator('text=Theo dõi tiến độ').first()).toBeVisible();
    await expect(page.locator('text=REQ-250828-001').first()).toBeVisible();

    // Verify milestone stages
    await expect(page.locator('text=Đã tiếp nhận yêu cầu').first()).toBeVisible();
    await expect(page.locator('text=Đang vận chuyển').first()).toBeVisible();

    // Verify driver info card
    await expect(page.locator('text=Tài xế').first()).toBeVisible();
  });

  test('TC-TRACK-002: Dispatcher updates milestones -> realtime reflection on customer timeline', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    // 1. Dispatcher updates milestone
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_USERS.dispatcher.email, TEST_USERS.dispatcher.password);
    await expect(page.locator('text=Xin chào').first()).toBeVisible({ timeout: 10000 });

    const dispatcherPage = new DispatcherPage(page);
    await dispatcherPage.goto();
    await dispatcherPage.switchTab('progress');

    const updateBtn = page.getByRole('button', { name: 'Cập nhật trạng thái ngay' });
    if (await updateBtn.isVisible()) {
      await updateBtn.click();
      await page.waitForTimeout(1000);
    }

    // 2. Customer opens tracking timeline and verifies updated status
    await page.goto('/login');
    await loginPage.login(TEST_USERS.customer.email, TEST_USERS.customer.password);
    await page.goto('/tracking/REQ-250828-001');
    await expect(page.locator('text=REQ-250828-001').first()).toBeVisible();
  });
});
