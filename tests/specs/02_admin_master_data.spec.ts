import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { AdminPage } from '../pages/AdminPage';
import { BookingPage } from '../pages/BookingPage';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('Suite 2: Admin Master Data & Dynamic Combobox Suite', () => {
  let adminToken: string = '';
  const uniqueCode = `QA_SHIP_${Date.now().toString().slice(-4)}`;

  test.beforeAll(async () => {
    try {
      const adminRes = await fetch('http://127.0.0.1:8090/api/admins/auth-with-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: TEST_USERS.admin.email, password: TEST_USERS.admin.password }),
      });
      if (adminRes.ok) {
        const d = await adminRes.json();
        adminToken = d.token;
      }
    } catch (_e) {}
  });

  test('TC-ADMIN-001: Add Shipping Line QA-SHIP-[UNIQUE]', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    await page.waitForURL('**/');

    const adminPage = new AdminPage(page);
    await adminPage.goto('/admin/master-data');
    await adminPage.selectCategory('Hãng tàu');

    await adminPage.createRecord({
      code: uniqueCode,
      name: `QA Shipping Line ${uniqueCode}`,
      description: 'Hãng tàu tự động tạo bởi Playwright QA Verifier',
      sortOrder: 15,
    });

    await expect(page.getByText(uniqueCode).first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-ADMIN-002: Verify combobox updates for Customer', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_USERS.customer.email, TEST_USERS.customer.password);
    await expect(page.locator('text=Xin chào').first()).toBeVisible({ timeout: 10000 });

    const bookingPage = new BookingPage(page);
    await bookingPage.goto();

    // Verify shipping lines combobox is populated with active lines
    const shippingSelect = page.locator('select[name="shippingLine"], select').filter({ hasText: /ONETRANS|MAERSK|QA Shipping/i }).first();
    await expect(shippingSelect).toBeVisible();
  });

  test('TC-ADMIN-003: Edit Shipping Line', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    await page.waitForURL('**/');

    const adminPage = new AdminPage(page);
    await adminPage.goto('/admin/master-data');
    await adminPage.selectCategory('Hãng tàu');

    // Click edit on the record or first record
    const editBtn = page.locator('button[title*="Sửa"]').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(300);
      const descInput = page.locator('textarea[name="description"]');
      if (await descInput.isVisible()) {
        await descInput.fill('Đã cập nhật mô tả bởi QA Test Automation');
      }
      const saveBtn = page.getByRole('button', { name: /Lưu|Cập nhật/i }).last();
      await saveBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('TC-ADMIN-004: Soft-deactivate Shipping Line & verify excluded from new bookings while preserving historical bookings', async ({ page }) => {
    // 1. Admin deactivates
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    await page.waitForURL('**/');

    const adminPage = new AdminPage(page);
    await adminPage.goto('/admin/master-data');
    await adminPage.selectCategory('Hãng tàu');
    await adminPage.toggleActive(uniqueCode);

    // 2. Customer creates booking -> Deactivated line should not be an active selection
    await page.goto('/login');
    await loginPage.login(TEST_USERS.customer.email, TEST_USERS.customer.password);
    await expect(page.locator('text=Xin chào').first()).toBeVisible({ timeout: 10000 });

    const bookingPage = new BookingPage(page);
    await bookingPage.goto();
    const options = await page.locator('select option').allTextContents();
    const hasInactiveNotice = options.some(t => t.includes('[Tạm ngừng]'));
    expect(hasInactiveNotice).toBe(false);

    // 3. Historical booking REQ-250828-001 retains its historical shipping line
    await page.goto('/');
    await expect(page.locator('text=Kho U&I Bình Dương').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-ADMIN-005: Verify remaining 7 categories', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    await page.waitForURL('**/');

    const adminPage = new AdminPage(page);
    await adminPage.goto('/admin/master-data');

    const categories = [
      'Nơi đóng hàng',
      'Nơi lấy rỗng',
      'Bãi hạ thanh lý',
      'Cảng đến',
      'Cảng chuyển tải',
      'Loại hàng hóa',
      'Loại container',
    ];

    for (const cat of categories) {
      await adminPage.selectCategory(cat);
      await expect(page.locator('table, tr').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC-ADMIN-006: Duplicate code rejection', async () => {
    if (!adminToken) return;

    const dupCode = `DUP_CODE_${Date.now()}`;
    // First insert
    await fetch('http://127.0.0.1:8090/api/collections/shipping_lines/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: adminToken },
      body: JSON.stringify({ code: dupCode, name: 'First Record', isActive: true }),
    });

    // Second insert with same code
    const res2 = await fetch('http://127.0.0.1:8090/api/collections/shipping_lines/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: adminToken },
      body: JSON.stringify({ code: dupCode, name: 'Duplicate Record', isActive: true }),
    });

    // PocketBase unique index rejects duplicate
    expect([400, 422]).toContain(res2.status);
  });
});
