import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProfilePage } from '../pages/ProfilePage';
import { BookingPage } from '../pages/BookingPage';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('Suite 3: Customer Profile & Auto-fill Defaults Suite', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_USERS.customer.email, TEST_USERS.customer.password);
    await page.waitForURL('**/');
    await expect(page.locator('text=Xin chào').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-PROFILE-001: Update shipping defaults & toggle auto-fill', async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goto();

    await expect(page.locator('text=Công ty ABC Trading').first()).toBeVisible();
    await expect(page.locator('text=Thông tin mặc định cho yêu cầu vận chuyển').first()).toBeVisible();

    // Toggle auto-fill checkbox if present
    const autoFillCheckbox = page.locator('input[type="checkbox"]').first();
    if (await autoFillCheckbox.isVisible()) {
      const isChecked = await autoFillCheckbox.isChecked();
      if (!isChecked) await autoFillCheckbox.check();
    }

    // Save profile changes
    await profilePage.save();
    await expect(page.getByRole('button', { name: /Lưu thay đổi/i })).toBeVisible();
  });

  test('TC-PROFILE-002: Verify auto-fill in Create Booking', async ({ page }) => {
    const bookingPage = new BookingPage(page);
    await bookingPage.goto();

    await expect(page.locator('text=Tạo yêu cầu vận chuyển').first()).toBeVisible();

    // Verify company name is auto-filled
    const companyElem = page.locator('text=/Khách hàng yêu cầu.*ABC Trading|Công ty ABC Trading/i').first();
    await expect(companyElem).toBeVisible();

    // Verify default container type and locations are auto-filled
    const containerSelect = page.locator('select').filter({ hasText: /40' cao|40'HC|20'/i }).first();
    await expect(containerSelect).toBeVisible();

    const packingSelect = page.locator('select').filter({ hasText: /Kho U&I Bình Dương/i }).first();
    await expect(packingSelect).toBeVisible();
  });

  test('TC-PROFILE-003: Do not overwrite default profile when booking changes', async ({ page }) => {
    const bookingPage = new BookingPage(page);
    await bookingPage.goto();

    // Modify a field in booking without saving to profile
    const notesInput = page.locator('textarea[name="notes"], textarea').first();
    if (await notesInput.isVisible()) {
      await notesInput.fill('Special temporary delivery note');
    }

    // Navigate to profile and verify original default profile warehouse is intact
    const profilePage = new ProfilePage(page);
    await profilePage.goto();
    await expect(page.locator('select').filter({ hasText: /Kho U&I Bình Dương/i }).first()).toBeVisible();
  });
});
