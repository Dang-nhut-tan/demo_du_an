import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('U&I Logistics PWA - Comprehensive UI Interactions & Broken Button Audit', () => {
  test.beforeEach(async ({ page }) => {
    // Automatically accept any dialogs/alerts/confirms
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('01. Authentication & Modals: Show/Hide Password, SSO & Reset Dialogs, Quick Chips', async ({ page }) => {
    // 1. Password Visibility Toggle
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill('Secret123');

    // Click show/hide password toggle button inside FormInput
    const toggleEyeBtn = page.locator('button[type="button"]').filter({ has: page.locator('svg.lucide-eye, svg.lucide-eye-off') }).first();
    if (await toggleEyeBtn.isVisible()) {
      await toggleEyeBtn.click();
      await expect(page.locator('input[type="text"][value="Secret123"]')).toBeVisible();
      await toggleEyeBtn.click();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    }

    // 2. Forgot Password Dialog
    const forgotBtn = page.getByRole('button', { name: 'Quên mật khẩu?' });
    await expect(forgotBtn).toBeVisible();
    await forgotBtn.click();
    await expect(page.getByRole('heading', { name: 'Quên mật khẩu?' })).toBeVisible();
    const closeForgotBtn = page.getByRole('button', { name: /đã hiểu/i });
    await expect(closeForgotBtn).toBeVisible();
    await closeForgotBtn.click();
    await expect(page.getByRole('heading', { name: 'Quên mật khẩu?' })).not.toBeVisible();

    // 3. SSO Dialog
    const ssoBtn = page.getByRole('button', { name: /microsoft/i });
    await expect(ssoBtn).toBeVisible();
    await ssoBtn.click();
    await expect(page.getByRole('heading', { name: /microsoft azure ad/i })).toBeVisible();
    const closeSsoBtn = page.getByRole('button', { name: /đóng cửa sổ/i });
    await expect(closeSsoBtn).toBeVisible();
    await closeSsoBtn.click();
    await expect(page.getByRole('heading', { name: /microsoft azure ad/i })).not.toBeVisible();

    // 4. Customer Login
    await page.fill('input[type="email"]', TEST_USERS.customer.email);
    await page.fill('input[type="password"]', TEST_USERS.customer.password);
    const submitBtn = page.getByRole('button', { name: /đăng nhập/i });
    await submitBtn.click();
    await page.waitForURL('**/', { timeout: 10000 });
    await expect(page.locator('text=/Xin chào/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('02. Customer Portal: Dashboard Navigation, Header Icons & Profile Logout', async ({ page }) => {
    // Log in as customer
    await page.fill('input[type="email"]', TEST_USERS.customer.email);
    await page.fill('input[type="password"]', TEST_USERS.customer.password);
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await page.waitForURL('**/', { timeout: 10000 });

    // Header Bell Icon -> Notifications
    const bellBtn = page.locator('button[aria-label="Thông báo"]').first();
    await expect(bellBtn).toBeVisible();
    await bellBtn.click();
    await page.waitForURL('**/notifications', { timeout: 5000 });
    await expect(page.getByText('Thông báo hệ thống')).toBeVisible();

    // Notifications Filter Tabs
    const unreadTab = page.getByRole('button', { name: /chưa đọc/i });
    await expect(unreadTab).toBeVisible();
    await unreadTab.click();
    const allTab = page.locator('button').filter({ hasText: /^tất cả/i }).first();
    await expect(allTab).toBeVisible();
    await allTab.click();

    // Back to Dashboard
    const backBtn = page.locator('button[aria-label="Quay lại"]').first();
    await backBtn.click();
    await page.waitForURL('**/', { timeout: 5000 });

    // Profile Page & Tabs Navigation via Bottom Nav or Avatar
    const profileBtn = page.locator('button[aria-label="Hồ sơ tài khoản"], button:has-text("Tài khoản")').first();
    await expect(profileBtn).toBeVisible();
    await profileBtn.click();
    await page.waitForURL('**/profile', { timeout: 5000 });
    await expect(page.getByRole('heading', { name: 'Hồ sơ pháp lý doanh nghiệp' })).toBeVisible();

    // Verify 4 tabs: company, locations, contacts, settings
    await page.getByRole('button', { name: 'Kho & Cảng' }).click();
    await expect(page.getByRole('heading', { name: /thông tin mặc định|yêu cầu vận chuyển/i })).toBeVisible();

    await page.getByRole('button', { name: 'Liên hệ' }).click();
    await expect(page.getByRole('heading', { name: /đầu mối liên hệ/i })).toBeVisible();

    await page.getByRole('button', { name: 'Tùy chọn' }).click();
    await expect(page.getByRole('heading', { name: 'Cấu hình tự động điền' })).toBeVisible();

    // Save Settings Button
    const saveSettingsBtn = page.getByRole('button', { name: /lưu thay đổi/i });
    await expect(saveSettingsBtn).toBeVisible();
    await saveSettingsBtn.click();
    await expect(page.getByText('Cập nhật thông tin công ty và cấu hình tự động điền thành công!')).toBeVisible();

    // Test Profile Logout
    const logoutBtn = page.getByRole('button', { name: /đăng xuất/i }).first();
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();
    await page.waitForURL('**/login', { timeout: 5000 });
    await expect(page.getByRole('button', { name: /đăng nhập/i })).toBeVisible();
  });

  test('03. Customer Portal: Create Booking Full Flow with Dynamic Containers & Draft', async ({ page }) => {
    // Log in
    await page.fill('input[type="email"]', TEST_USERS.customer.email);
    await page.fill('input[type="password"]', TEST_USERS.customer.password);
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await page.waitForURL('**/', { timeout: 10000 });

    // Navigate to Create Booking
    await page.getByText('Tạo yêu cầu vận chuyển').first().click();
    await page.waitForURL('**/booking/new', { timeout: 5000 });

    // Fill Step 1
    const bookingInput = page.locator('input#bookingNumber');
    await bookingInput.fill('BK-AUDIT-' + Date.now().toString().slice(-4));

    // Dynamic Container Operations (+, -, add, remove)
    const incBtn = page.locator('button:has-text("+")').first();
    await incBtn.click(); // quantity increases
    const decBtn = page.locator('button:has-text("-")').first();
    await decBtn.click(); // quantity decreases

    // Add another container row
    const addRowBtn = page.getByRole('button', { name: /thêm loại container khác/i });
    if (await addRowBtn.isVisible()) {
      await addRowBtn.click();
      const deleteRowBtn = page.locator('button[title="Xóa loại container"]').last();
      await deleteRowBtn.click();
    }

    // Test Save Draft
    const saveDraftBtn = page.getByRole('button', { name: /lưu bản nháp/i });
    await saveDraftBtn.click();
    await page.waitForURL('**/', { timeout: 10000 });

    // Go back and complete submission
    await page.getByText('Tạo yêu cầu vận chuyển').first().click();
    await page.waitForURL('**/booking/new', { timeout: 5000 });
    await page.locator('input#bookingNumber').fill('BK-FINAL-' + Date.now().toString().slice(-4));

    const continueBtn = page.getByRole('button', { name: /tiếp tục/i });
    await continueBtn.click();

    // Step 2: Review
    await expect(page.getByText('Xác nhận thông tin yêu cầu')).toBeVisible();
    const finalSubmitBtn = page.getByRole('button', { name: /xác nhận & gửi yêu cầu|gửi yêu cầu/i });
    await finalSubmitBtn.click();

    // Step 3: Success
    await expect(page.getByText('Gửi yêu cầu thành công!')).toBeVisible();
    const trackBtn = page.getByRole('button', { name: /theo dõi tiến độ/i });
    await expect(trackBtn).toBeVisible();
    await trackBtn.click();
    await page.waitForURL('**/tracking**', { timeout: 5000 });
    await expect(page.getByText(/theo dõi tiến độ/i).first()).toBeVisible();
  });

  test('04. Customer Portal: Tracking Progress Tabs & Refresh Action', async ({ page }) => {
    await page.fill('input[type="email"]', TEST_USERS.customer.email);
    await page.fill('input[type="password"]', TEST_USERS.customer.password);
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await page.waitForURL('**/', { timeout: 10000 });

    await page.goto('/tracking');
    await page.waitForLoadState('networkidle');

    // Switch between 3 tabs: timeline ('Tiến độ'), details ('Thông tin chi tiết'), history ('Lịch sử thay đổi')
    const detailsTab = page.getByRole('button', { name: 'Thông tin chi tiết' });
    await detailsTab.click();
    await expect(page.getByText('Nơi đóng hàng:').first()).toBeVisible();

    const historyTab = page.getByRole('button', { name: 'Lịch sử thay đổi' });
    await historyTab.click();
    await expect(page.getByText(/khởi tạo yêu cầu|lịch sử/i).first()).toBeVisible();

    const timelineTab = page.getByRole('button', { name: 'Tiến độ', exact: true });
    await timelineTab.click();

    // Refresh button
    const refreshBtn = page.locator('button[title="Làm mới tiến độ"]').first();
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();
  });

  test('05. Dispatcher Portal: Tab Switching, Filter Pills, Approval & Rejection', async ({ page }) => {
    // Login as dispatcher
    await page.fill('input[type="email"]', TEST_USERS.dispatcher.email);
    await page.fill('input[type="password"]', TEST_USERS.dispatcher.password);
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await page.waitForURL('**/', { timeout: 10000 });
    await page.goto('/dispatcher');

    // Verify Dispatcher header
    await expect(page.getByText('Điều Phối Viên')).toBeVisible();

    // Filter pills in Bookings tab
    const approvedFilter = page.getByRole('button', { name: /đã duyệt/i });
    await approvedFilter.click();
    const allFilter = page.getByRole('button', { name: /tất cả/i });
    await allFilter.click();
    const pendingFilter = page.getByRole('button', { name: /chờ duyệt/i }).first();
    await pendingFilter.click();

    // Switch to Changes tab
    const changesTab = page.getByRole('button', { name: /đề xuất đổi lịch/i });
    await changesTab.click();

    // Switch to Progress tab
    const progressTab = page.getByRole('button', { name: /cập nhật tiến độ xe/i });
    await progressTab.click();
    await expect(page.getByText('Cập nhật tiến độ vận chuyển thời gian thực')).toBeVisible();

    // Ensure booking select option is populated
    const bookingSelect = page.locator('select').first();
    await expect(bookingSelect).toBeVisible();
    await page.waitForTimeout(1500);

    // Test update progress
    const updateProgressBtn = page.getByRole('button', { name: /cập nhật trạng thái ngay/i });
    await expect(updateProgressBtn).toBeVisible();
    await updateProgressBtn.click();
    await expect(page.getByText(/cập nhật tiến độ/i).first()).toBeVisible();

    // Test Dispatcher Logout
    const logoutBtn = page.getByRole('button', { name: /đăng xuất/i });
    await logoutBtn.click();
    await page.waitForURL('**/login', { timeout: 5000 });
  });

  test('06. Admin Portal: Registrations, Master Data, Customer Management, Form Config', async ({ page }) => {
    // Login as admin
    await page.fill('input[type="email"]', TEST_USERS.admin.email);
    await page.fill('input[type="password"]', TEST_USERS.admin.password);
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await page.waitForURL('**/', { timeout: 10000 });
    await page.goto('/admin');

    // 1. Admin Dashboard Refresh
    const refreshBtn = page.getByRole('button', { name: /làm mới số liệu/i });
    await expect(refreshBtn).toBeVisible();
    await page.waitForTimeout(1000);
    if (await refreshBtn.isEnabled()) {
      await refreshBtn.click();
    }

    // 2. Registrations Page & Filters
    await page.goto('/admin/registrations');
    await expect(page.getByText('Phê Duyệt Đăng Ký Khách Hàng')).toBeVisible();
    await page.getByRole('button', { name: /chờ duyệt/i }).click();
    await page.getByRole('button', { name: /tất cả/i }).click();

    // 3. Master Data Page: Switch Category, Add Modal
    await page.goto('/admin/master-data');
    await expect(page.getByText(/quản lý master data/i)).toBeVisible();

    // Click Category pill (e.g. Cảng đến or Nơi lấy rỗng)
    await page.getByRole('button', { name: /cảng đến/i }).first().click();

    // Open Add Modal
    const addBtn = page.getByRole('button', { name: /thêm bản ghi mới/i });
    await addBtn.click();
    await expect(page.getByText('Thêm bản ghi mới')).toBeVisible();
    // Close modal
    await page.locator('button:has(svg.lucide-x)').first().click();

    // 4. Customer Management: Navigate
    await page.goto('/admin/customers');
    await expect(page.getByText('Quản Lý Khách Hàng Doanh Nghiệp')).toBeVisible();

    // 5. Form Config Page: Navigate
    await page.goto('/admin/form-config');
    await expect(page.getByText('Cấu Hình Form TMS Động')).toBeVisible();

    // 6. Admin Logout
    const adminLogoutBtn = page.getByRole('button', { name: /thoát|đăng xuất/i }).first();
    await adminLogoutBtn.click();
    await page.waitForURL('**/login', { timeout: 5000 });
    await expect(page.getByRole('button', { name: /đăng nhập/i })).toBeVisible();
  });
});
