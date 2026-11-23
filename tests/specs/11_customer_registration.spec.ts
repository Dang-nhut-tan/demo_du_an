import { test, expect } from '@playwright/test';
import { TEST_USERS, PB_URL } from '../fixtures/test-data';

const POCKETBASE_URL = PB_URL;

test.describe('Suite 11: Customer Registration & Admin Approval Flow', () => {
  const timestamp = Date.now().toString().slice(-6);
  const testEmail1 = `vinatex_${timestamp}@testcompany.vn`;
  const testPass = 'MatKhau123@UandI';
  const testCompany1 = `Công ty Cổ phần Dệt May Vinatex ${timestamp}`;
  const testTaxCode1 = `031${timestamp}88`;

  const testEmail2 = `logisticspro_${timestamp}@testco.vn`;
  const testCompany2 = `Công ty Logistics Pro ${timestamp}`;
  const testTaxCode2 = `032${timestamp}99`;

  test('TC-REG-001: Navigation from Login to Register page', async ({ page }) => {
    await page.goto('/login');
    const registerLink = page.locator('text=/Chưa có tài khoản\\? Đăng ký ngay/i');
    await expect(registerLink).toBeVisible({ timeout: 10000 });
    await registerLink.click();

    await page.waitForURL('**/register');
    await expect(page.locator('text=Đăng ký tài khoản Khách hàng').first()).toBeVisible();
    await page.screenshot({ path: 'docs/screenshots/registration/01_register_page.png' });
  });

  test('TC-REG-002: Form validation on blank submission', async ({ page }) => {
    await page.goto('/register');
    const submitBtn = page.locator('button:has-text("Đăng ký tài khoản")');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    await expect(page.locator('text=Vui lòng nhập họ và tên')).toBeVisible();
    await expect(page.locator('text=Vui lòng nhập email đăng nhập')).toBeVisible();
    await expect(page.locator('text=Vui lòng nhập số điện thoại')).toBeVisible();
    await expect(page.locator('text=Mật khẩu phải có ít nhất 8 ký tự')).toBeVisible();
    await expect(page.locator('text=Vui lòng nhập tên công ty')).toBeVisible();
    await expect(page.locator('text=Vui lòng nhập mã số thuế')).toBeVisible();
    await page.screenshot({ path: 'docs/screenshots/registration/02_validation_blank.png' });
  });

  test('TC-REG-003: Form validation on password mismatch and invalid email', async ({ page }) => {
    await page.goto('/register');

    // Fill invalid email
    await page.locator('input[placeholder="nguyenvana@company.com"]').fill('invalid-email');
    // Fill mismatched passwords
    await page.locator('input[placeholder="Tối thiểu 8 ký tự"]').fill('12345678');
    await page.locator('input[placeholder="Nhập lại mật khẩu"]').fill('87654321');

    const submitBtn = page.locator('button:has-text("Đăng ký tài khoản")');
    await submitBtn.click();

    await expect(page.locator('text=Định dạng email không hợp lệ')).toBeVisible();
    await expect(page.locator('text=Mật khẩu xác nhận không khớp')).toBeVisible();
    await page.screenshot({ path: 'docs/screenshots/registration/03_validation_mismatch.png' });
  });

  test('TC-REG-004: Submit valid customer registration successfully', async ({ page }) => {
    await page.goto('/register');

    // Section A: Account Information
    await page.locator('input[placeholder="Nguyễn Văn A"]').fill('Nguyễn Văn Tuấn');
    await page.locator('input[placeholder="nguyenvana@company.com"]').fill(testEmail1);
    await page.locator('input[placeholder="0912 345 678"]').fill('0912345678');
    await page.locator('input[placeholder="Tối thiểu 8 ký tự"]').fill(testPass);
    await page.locator('input[placeholder="Nhập lại mật khẩu"]').fill(testPass);

    // Section B: Business Information
    await page.locator('input[placeholder="Công ty TNHH Xuất Nhập Khẩu..."]').fill(testCompany1);
    await page.locator('input[placeholder="Ví dụ: 0312345678"]').fill(testTaxCode1);
    await page.locator('input[placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"]').fill('123 Đại lộ Bình Dương, Thuận An, Bình Dương');
    await page.locator('input[placeholder="notify@company.com"]').fill(testEmail1);
    await page.locator('input[placeholder="028 1234 5678"]').fill('02743888999');

    // Submit
    const submitBtn = page.locator('button:has-text("Đăng ký tài khoản")');
    await submitBtn.click();

    // Verify Success Screen
    await expect(page.locator('text=Đăng ký thành công!').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Yêu cầu đăng ký của bạn đã được gửi đến quản trị viên U&I Logistics')).toBeVisible();
    await expect(page.locator('text=Quay về đăng nhập')).toBeVisible();

    await page.screenshot({ path: 'docs/screenshots/registration/04_registration_success.png' });
  });

  test('TC-REG-005: Duplicate email registration returns error', async ({ page }) => {
    await page.goto('/register');

    // Fill form with the same email testEmail1
    await page.locator('input[placeholder="Nguyễn Văn A"]').fill('Trùng Email Test');
    await page.locator('input[placeholder="nguyenvana@company.com"]').fill(testEmail1);
    await page.locator('input[placeholder="0912 345 678"]').fill('0988776655');
    await page.locator('input[placeholder="Tối thiểu 8 ký tự"]').fill(testPass);
    await page.locator('input[placeholder="Nhập lại mật khẩu"]').fill(testPass);

    await page.locator('input[placeholder="Công ty TNHH Xuất Nhập Khẩu..."]').fill('Công ty Thứ Hai');
    await page.locator('input[placeholder="Ví dụ: 0312345678"]').fill('0399887766');

    const submitBtn = page.locator('button:has-text("Đăng ký tài khoản")');
    await submitBtn.click();

    // Expect server error
    await expect(page.locator('text=/Email này đã được đăng ký/i').first()).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'docs/screenshots/registration/05_duplicate_email.png' });
  });

  test('TC-REG-006: Pending user cannot log in before admin approval', async ({ page }) => {
    await page.goto('/login');

    await page.locator('input[type="email"], input[placeholder*="email" i]').fill(testEmail1);
    await page.locator('input[type="password"]').fill(testPass);
    await page.locator('button[type="submit"]').click();

    // Should display pending approval message
    await expect(page.locator('text=/đang chờ quản trị viên U&I Logistics phê duyệt/i').first()).toBeVisible({ timeout: 10000 });
    // URL remains /login
    expect(page.url()).toContain('/login');
    await page.screenshot({ path: 'docs/screenshots/registration/06_pending_login_blocked.png' });
  });

  test('TC-REG-007: Admin views pending registrations in Admin Portal', async ({ page }) => {
    // Login as Admin
    await page.goto('/login');
    await page.locator('input[type="email"], input[placeholder*="email" i]').fill(TEST_USERS.admin.email);
    await page.locator('input[type="password"]').fill(TEST_USERS.admin.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/');

    // Go to Admin Registrations
    await page.goto('/admin/registrations');
    await expect(page.locator('text=Phê duyệt Đăng ký Khách hàng').first()).toBeVisible({ timeout: 10000 });

    // Verify test request is listed
    await expect(page.locator(`text=${testEmail1}`).first()).toBeVisible();
    await expect(page.locator(`text=${testCompany1}`).first()).toBeVisible();
    await expect(page.locator(`text=${testTaxCode1}`).first()).toBeVisible();

    await page.screenshot({ path: 'docs/screenshots/registration/07_admin_registrations_list.png' });
  });

  test('TC-REG-008: Admin approves customer registration request', async ({ page }) => {
    // Go to Admin Registrations
    await page.goto('/admin/registrations');
    await expect(page.locator('text=Phê duyệt Đăng ký Khách hàng').first()).toBeVisible({ timeout: 10000 });

    // Filter or locate row with testEmail1
    const row = page.locator('tr', { hasText: testEmail1 });
    await expect(row).toBeVisible();

    // Click Duyệt in that row
    page.on('dialog', (dialog) => dialog.accept());
    const approveBtn = row.locator('button:has-text("Duyệt")');
    await approveBtn.click();

    // Verify row status changes to Đã duyệt (APPROVED)
    await expect(page.locator('tr', { hasText: testEmail1 }).locator('text=Đã duyệt')).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'docs/screenshots/registration/08_admin_approved.png' });
  });

  test('TC-REG-009: Approved customer logs in and views their own company profile', async ({ page }) => {
    // Clear storage and navigate to login
    await page.context().clearCookies();
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());

    // Customer logs in
    await page.locator('input[type="email"], input[placeholder*="email" i]').fill(testEmail1);
    await page.locator('input[type="password"]').fill(testPass);
    await page.locator('button[type="submit"]').click();

    // Navigates to home
    await page.waitForURL('**/');
    await expect(page.locator(`text=Xin chào, ${testCompany1}`).first()).toBeVisible({ timeout: 15000 });

    // Navigate to Profile page
    await page.goto('/profile');
    await expect(page.locator(`text=${testCompany1}`).first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`text=${testTaxCode1}`).first()).toBeVisible();

    await page.screenshot({ path: 'docs/screenshots/registration/09_approved_customer_profile.png' });
  });

  test('TC-REG-010: Admin rejects a registration request with reason', async ({ page }) => {
    // 1. Submit second registration
    await page.goto('/register');
    await page.locator('input[placeholder="Nguyễn Văn A"]').fill('Nguyễn Văn Reject');
    await page.locator('input[placeholder="nguyenvana@company.com"]').fill(testEmail2);
    await page.locator('input[placeholder="0912 345 678"]').fill('0933445566');
    await page.locator('input[placeholder="Tối thiểu 8 ký tự"]').fill(testPass);
    await page.locator('input[placeholder="Nhập lại mật khẩu"]').fill(testPass);
    await page.locator('input[placeholder="Công ty TNHH Xuất Nhập Khẩu..."]').fill(testCompany2);
    await page.locator('input[placeholder="Ví dụ: 0312345678"]').fill(testTaxCode2);
    await page.locator('button:has-text("Đăng ký tài khoản")').click();
    await expect(page.locator('text=Đăng ký thành công!').first()).toBeVisible({ timeout: 15000 });

    // 2. Admin logs in and navigates to registrations
    await page.goto('/login');
    await page.locator('input[type="email"], input[placeholder*="email" i]').fill(TEST_USERS.admin.email);
    await page.locator('input[type="password"]').fill(TEST_USERS.admin.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/');

    await page.goto('/admin/registrations');
    await expect(page.locator('text=Phê duyệt Đăng ký Khách hàng').first()).toBeVisible({ timeout: 10000 });

    // 3. Find row and click Từ chối
    const row = page.locator('tr', { hasText: testEmail2 });
    await expect(row).toBeVisible();
    await row.locator('button:has-text("Từ chối")').click();

    // 4. Fill rejection reason in modal and submit
    await expect(page.locator('text=Từ chối yêu cầu đăng ký').first()).toBeVisible();
    await page.locator('textarea').fill('Mã số thuế không tồn tại trên Cổng thông tin Quốc gia.');
    await page.locator('button:has-text("Xác nhận từ chối")').click();

    // 5. Verify status is REJECTED
    await expect(page.locator('tr', { hasText: testEmail2 }).locator('text=Đã từ chối')).toBeVisible({ timeout: 10000 });

    // 6. Rejected customer attempts to log in -> blocked
    await page.context().clearCookies();
    await page.goto('/login');
    await page.locator('input[type="email"], input[placeholder*="email" i]').fill(testEmail2);
    await page.locator('input[type="password"]').fill(testPass);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=/Tài khoản của bạn đã bị từ chối/i').first()).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'docs/screenshots/registration/10_rejected_flow.png' });
  });

  test('TC-REG-011: Security API Rule: Unauthorized privilege escalation prevented', async () => {
    // Attempt to register directly via PocketBase REST API with role = 'admin'
    const adminEscalationRes = await fetch(`${POCKETBASE_URL}/api/collections/users/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `hacker_admin_${Date.now()}@hack.com`,
        password: 'Password123456!',
        passwordConfirm: 'Password123456!',
        name: 'Hacker Admin',
        role: 'admin',
        status: 'active',
      }),
    });

    // PocketBase createRule: @request.data.role = 'customer' && (@request.data.status = '' || @request.data.status = 'pending')
    // Therefore creating with role = 'admin' or status = 'active' MUST be rejected with HTTP 400
    expect([400, 403]).toContain(adminEscalationRes.status);

    // Attempt to register with role = 'dispatcher'
    const dispEscalationRes = await fetch(`${POCKETBASE_URL}/api/collections/users/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `hacker_disp_${Date.now()}@hack.com`,
        password: 'Password123456!',
        passwordConfirm: 'Password123456!',
        name: 'Hacker Dispatcher',
        role: 'dispatcher',
        status: 'pending',
      }),
    });
    expect([400, 403]).toContain(dispEscalationRes.status);
  });

  test('TC-REG-012: Viewport responsiveness across devices', async ({ page }) => {
    const viewports = [
      { name: 'iPhone-SE', width: 375, height: 667 },
      { name: 'iPhone-14', width: 390, height: 844 },
      { name: 'Pixel-7', width: 412, height: 915 },
      { name: 'Desktop', width: 1280, height: 800 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/register');
      await expect(page.locator('text=Đăng ký tài khoản Khách hàng').first()).toBeVisible({ timeout: 10000 });

      // Verify no horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // Allow 2px tolerance for subpixel rounding

      await page.screenshot({ path: `docs/screenshots/registration/viewport_${vp.name}.png` });
    }
  });
});
