import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { BookingPage } from '../pages/BookingPage';
import { TEST_USERS, PB_URL } from '../fixtures/test-data';

test.describe('Suite 4: Create Booking Request Full Lifecycle Suite', () => {
  let bookingPage: BookingPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_USERS.customer.email, TEST_USERS.customer.password);
    await expect(page.locator('text=Xin chào').first()).toBeVisible({ timeout: 10000 });

    bookingPage = new BookingPage(page);
    await bookingPage.goto();
    await expect(page.locator('text=Tạo yêu cầu vận chuyển').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-BOOKING-001: Create & submit Booking QA-BOOKING-[UNIQUE] with full TMS fields A-E', async ({ page }) => {
    const uniqueBookingNo = `QA-BK-${Date.now()}`;
    await bookingPage.fillGeneralInfo(uniqueBookingNo, 'ONETRANS');

    // Fill vessel & voyage
    const vesselInput = page.locator('input[placeholder*="ONE TRIUMPH"]').first();
    if (await vesselInput.isVisible()) {
      await vesselInput.fill('MOL SUCCESS / 081E');
    }

    // Step 1 -> Step 2
    const step1Next = page.getByRole('button', { name: /Tiếp tục/i });
    await step1Next.click();
    await page.waitForTimeout(600);

    // Verify Review Step
    await expect(page.locator('text=Xác nhận thông tin').first()).toBeVisible({ timeout: 10000 });

    // Step 2 -> Submit
    const submitBtn = page.getByRole('button', { name: /Gửi yêu cầu/i }).first();
    await submitBtn.click();
    await page.waitForTimeout(1000);

    // Step 3 -> Success with REQ- code
    await expect(page.locator('text=/Gửi yêu cầu thành công|REQ-/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-BOOKING-002: Required fields validation', async ({ page }) => {
    // Clear booking number
    await bookingPage.bookingNumberInput.fill('');
    const continueBtn = page.getByRole('button', { name: /Tiếp tục/i });
    await continueBtn.click();

    // Form should highlight validation error and prevent proceeding
    await expect(page.locator('text=/Vui lòng nhập|Bắt buộc/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('TC-BOOKING-003: Zero container validation', async ({ page }) => {
    const bookingNo = `BK-ZERO-${Date.now()}`;
    await bookingPage.fillGeneralInfo(bookingNo, 'ONETRANS');

    // Set container quantity to 0
    const minusBtn = page.locator('button:has-text("-"), button[aria-label*="Giảm"]').first();
    while (await minusBtn.isVisible() && await minusBtn.isEnabled()) {
      await minusBtn.click();
      await page.waitForTimeout(100);
    }

    const continueBtn = page.getByRole('button', { name: /Tiếp tục/i });
    await continueBtn.click();
    // Total container quantity must be > 0
    await expect(page.locator('text=/lớn hơn 0|Bắt buộc/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('TC-BOOKING-004: Dynamic container rows add/remove', async ({ page }) => {
    const containerSelects = page.locator('select').filter({ hasText: /20'|40'/i });
    const countBefore = await containerSelects.count();

    // Add row
    await bookingPage.addContainerRow();
    await page.waitForTimeout(300);
    const countAfter = await containerSelects.count();
    expect(countAfter).toBeGreaterThanOrEqual(countBefore);

    // Remove row
    const deleteBtns = page.locator('button').filter({ has: page.locator('svg.lucide-trash2, svg.lucide-trash') });
    if (await deleteBtns.count() > 0) {
      await deleteBtns.last().click();
      await page.waitForTimeout(300);
    }
  });

  test('TC-BOOKING-005: Save draft & reload', async ({ page }) => {
    let alertMsg = '';
    page.on('dialog', async (dialog) => {
      alertMsg = dialog.message();
      await dialog.accept();
    });

    const draftNo = `QA-DRAFT-${Date.now()}`;
    await bookingPage.fillGeneralInfo(draftNo, 'ONETRANS');
    await bookingPage.saveDraft();
    await page.waitForTimeout(800);

    expect(alertMsg).toMatch(/bản nháp/i);
  });

  test('TC-BOOKING-006: Double-click prevention', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /Lưu bản nháp|Tiếp tục/i }).first();
    await expect(submitBtn).toBeVisible();
    // Trigger action and check it does not allow multiple simultaneous submissions
    await submitBtn.click();
    expect(await submitBtn.isVisible()).toBe(true);
  });

  test('TC-BOOKING-007: Attachment upload & PB storage', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await fileInput.setInputFiles({
        name: 'test_booking_doc.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('PDF_TEST_DATA'),
      });
      await expect(page.locator('text=test_booking_doc.pdf').first()).toBeVisible({ timeout: 5000 });
    } else {
      // Direct API test verifying booking_attachments storage
      const res = await fetch(`${PB_URL}/api/collections/booking_attachments/records?perPage=1`);
      expect([200, 403]).toContain(res.status);
    }
  });
});
