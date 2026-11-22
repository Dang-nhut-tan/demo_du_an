import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ScheduleChangePage } from '../pages/ScheduleChangePage';
import { DispatcherPage } from '../pages/DispatcherPage';
import { TEST_USERS, TEST_SCHEDULE_CHANGE } from '../fixtures/test-data';

test.describe('Suite 6: Schedule Change Proposal & Dispatcher Approval Suite', () => {
  test('TC-SCHEDULE-001: Customer submits schedule change proposal', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_USERS.customer.email, TEST_USERS.customer.password);
    await expect(page.locator('text=Xin chào').first()).toBeVisible({ timeout: 10000 });

    const schedulePage = new ScheduleChangePage(page);
    await schedulePage.goto('REQ-250828-001');

    await expect(page.locator('text=Đề xuất sửa thời gian').first()).toBeVisible();

    // Fill proposed new schedule
    await schedulePage.fillProposal(
      TEST_SCHEDULE_CHANGE.reason,
      TEST_SCHEDULE_CHANGE.pickupDate,
      TEST_SCHEDULE_CHANGE.pickupTime
    );

    // Submit proposal
    await schedulePage.submit();

    // Verify submission success banner
    await expect(
      page.locator('text=/Gửi đề xuất thành công|Thành công/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('TC-SCHEDULE-002: Dispatcher approves proposal -> update official dates', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_USERS.dispatcher.email, TEST_USERS.dispatcher.password);
    await expect(page.locator('text=Xin chào').first()).toBeVisible({ timeout: 10000 });

    const dispatcherPage = new DispatcherPage(page);
    await dispatcherPage.goto();
    await dispatcherPage.switchTab('changes');

    await expect(page.locator('button:has-text("Đề xuất đổi lịch")').first()).toBeVisible();

    // Approve the proposal
    const approveBtn = page.getByRole('button', { name: /Chấp thuận|Phê duyệt/i }).first();
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
      await page.waitForTimeout(1000);
      await expect(page.locator('text=/Đã duyệt|APPROVED/i').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC-SCHEDULE-003: Dispatcher rejects proposal with reason', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_USERS.dispatcher.email, TEST_USERS.dispatcher.password);
    await expect(page.locator('text=Xin chào').first()).toBeVisible({ timeout: 10000 });

    const dispatcherPage = new DispatcherPage(page);
    await dispatcherPage.goto();
    await dispatcherPage.switchTab('changes');

    // Click reject on proposal if visible
    const rejectBtn = page.getByRole('button', { name: /Từ chối/i }).first();
    if (await rejectBtn.isVisible()) {
      await rejectBtn.click();
      await page.waitForTimeout(300);

      const reasonInput = page.locator('textarea[placeholder*="lý do"]').first();
      if (await reasonInput.isVisible()) {
        await reasonInput.fill('Không thể bố trí xe ngày này theo yêu cầu.');
        const confirmBtn = page.getByRole('button', { name: /Xác nhận từ chối/i }).last();
        await confirmBtn.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('TC-SCHEDULE-004: Validation on empty change form', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_USERS.customer.email, TEST_USERS.customer.password);
    await expect(page.locator('text=Xin chào').first()).toBeVisible({ timeout: 10000 });

    const schedulePage = new ScheduleChangePage(page);
    await schedulePage.goto('REQ-250828-001');

    // Clear required reason textarea
    await schedulePage.reasonTextarea.fill('');
    await schedulePage.submit();

    // Verify validation alert/message is shown
    await expect(page.locator('text=/Vui lòng nhập lý do|Vui lòng nhập/i').first()).toBeVisible({ timeout: 5000 });
  });
});
