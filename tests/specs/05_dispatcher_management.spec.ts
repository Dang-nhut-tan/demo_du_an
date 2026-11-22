import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DispatcherPage } from '../pages/DispatcherPage';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('Suite 5: Dispatcher Booking Management Suite', () => {
  let dispatcherPage: DispatcherPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_USERS.dispatcher.email, TEST_USERS.dispatcher.password);
    await expect(page.locator('text=Xin chào').first()).toBeVisible({ timeout: 10000 });

    dispatcherPage = new DispatcherPage(page);
    await dispatcherPage.goto();
    await expect(page.locator('text=Điều Phối Viên').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-DISPATCH-001: Dispatcher approve booking -> APPROVED', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await dispatcherPage.switchTab('bookings');

    // Filter by pending bookings
    const pendingFilter = page.getByRole('button', { name: /Chờ duyệt|PENDING/i });
    if (await pendingFilter.isVisible()) {
      await pendingFilter.click();
      await page.waitForTimeout(500);
    }

    // Click Approve on first pending request
    const approveBtn = page.getByRole('button', { name: /Phê duyệt/i }).first();
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
      await page.waitForTimeout(1000);

      // Switch to Đã duyệt tab to see approved booking
      const approvedFilter = page.getByRole('button', { name: /Đã duyệt/i }).first();
      if (await approvedFilter.isVisible()) {
        await approvedFilter.click();
        await page.waitForTimeout(500);
      }
      await expect(page.locator('text=/Đã duyệt|APPROVED/i').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC-DISPATCH-002: Dispatcher reject booking with reason', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await dispatcherPage.switchTab('bookings');

    // Click Reject on a pending booking
    const rejectBtn = page.getByRole('button', { name: /Từ chối/i }).first();
    if (await rejectBtn.isVisible()) {
      await rejectBtn.click();
      await page.waitForTimeout(500);

      // Rejection modal appears
      const reasonInput = page.locator('textarea[placeholder*="lý do"], textarea').first();
      if (await reasonInput.isVisible()) {
        await reasonInput.fill('Hết rỗng tại depot, vui lòng đổi ngày hoặc kho nhận.');
        const confirmRejectBtn = page.getByRole('button', { name: /Xác nhận từ chối/i }).last();
        await confirmRejectBtn.click();
        await page.waitForTimeout(1000);

        // Verification of rejected status
        await expect(page.locator('text=/Đã từ chối|REJECTED/i').first()).toBeVisible({ timeout: 5000 });
      }
    }
  });
});
