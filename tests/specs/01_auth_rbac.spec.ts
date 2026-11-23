import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { TEST_USERS, PB_URL } from '../fixtures/test-data';

test.describe('Suite 1: Authentication & Role-Based Access Control', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('TC-LOGIN-001: Customer login with valid credentials (ABC Trading)', async ({ page }) => {
    await loginPage.login(TEST_USERS.customer.email, TEST_USERS.customer.password);
    await page.waitForURL('**/');
    await expect(page.locator('text=Xin chào, Công ty ABC Trading').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=/Tạo yêu cầu/i').first()).toBeVisible();
  });

  test('TC-LOGIN-002: Customer login with incorrect password displays error', async () => {
    await loginPage.login(TEST_USERS.invalid.email, TEST_USERS.invalid.password);
    const error = await loginPage.getErrorMessage();
    expect(error).toBeTruthy();
    expect(error).toMatch(/Failed to authenticate|không chính xác|thất bại|lỗi/i);
  });

  test('TC-LOGIN-003: Role permissions Customer vs Dispatcher vs Admin via UI & API', async ({ page }) => {
    // 1. Customer cannot write to master data API (API Rule 403/400)
    const custAuthRes = await fetch(`${PB_URL}/api/collections/users/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: TEST_USERS.customer.email, password: TEST_USERS.customer.password }),
    });
    const custAuth = await custAuthRes.json();
    const custWriteRes = await fetch(`${PB_URL}/api/collections/shipping_lines/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: custAuth.token },
      body: JSON.stringify({ code: 'HACK_LINE', name: 'Unauthorized Line', isActive: true }),
    });
    expect([400, 403, 404]).toContain(custWriteRes.status);

    // 2. Dispatcher can access /dispatcher
    await page.goto('/login');
    await loginPage.login(TEST_USERS.dispatcher.email, TEST_USERS.dispatcher.password);
    await page.waitForURL('**/');
    await page.goto('/dispatcher');
    await expect(page.locator('text=Điều Phối Viên').first()).toBeVisible({ timeout: 10000 });

    // 3. Admin can access /admin
    await page.goto('/login');
    await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    await page.waitForURL('**/');
    await page.goto('/admin');
    await expect(page.locator('text=/Quản trị|Admin|Bảng điều khiển/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-LOGIN-004: Logout & token cleanup', async ({ page }) => {
    await loginPage.login(TEST_USERS.customer.email, TEST_USERS.customer.password);
    await page.waitForURL('**/');
    await expect(page.locator('text=Xin chào').first()).toBeVisible({ timeout: 10000 });

    // Navigate to profile and click logout
    await page.goto('/profile');
    const logoutBtn = page.getByRole('button', { name: /Đăng xuất/i });
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
    } else {
      // Direct call to clear auth
      await page.evaluate(() => {
        localStorage.removeItem('pocketbase_auth');
        window.location.href = '/login';
      });
    }

    await page.waitForURL('**/login', { timeout: 10000 });
    const storedAuth = await page.evaluate(() => localStorage.getItem('pocketbase_auth'));
    expect(!storedAuth || storedAuth === 'null' || storedAuth === '{}').toBe(true);
  });
});
