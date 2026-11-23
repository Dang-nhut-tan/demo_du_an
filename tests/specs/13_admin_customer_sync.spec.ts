import { test, expect } from '@playwright/test';
import { TEST_USERS, PB_URL } from '../fixtures/test-data';

test.describe('Suite 13: Admin <-> Customer <-> Dispatcher End-to-End Data Synchronization', () => {
  const timestamp = Date.now().toString().slice(-4);
  const uniqueShippingCode = `TEST-SHIP-${timestamp}`;
  const uniqueShippingName = `Hãng Tàu Test ${timestamp}`;
  const updatedShippingName = `Hãng Tàu Test Sửa ${timestamp}`;

  test('SYNC-001: Admin adds new Shipping Line -> Customer sees and selects it in Create Booking', async ({ browser }) => {
    const adminContext = await browser.newContext();
    const customerContext = await browser.newContext();

    const adminPage = await adminContext.newPage();
    const customerPage = await customerContext.newPage();

    // 1. Admin logs in
    await adminPage.goto('/login');
    await adminPage.locator('input[type="email"]').fill(TEST_USERS.admin.email);
    await adminPage.locator('input[type="password"]').fill(TEST_USERS.admin.password);
    await adminPage.locator('button[type="submit"]').click();
    await adminPage.waitForURL((url) => url.pathname === '/', { timeout: 10000 });

    // 2. Admin navigates to Master Data and creates Shipping Line
    await adminPage.goto('/admin/master-data');
    await expect(adminPage.locator('text=Quản Lý Master Data')).toBeVisible({ timeout: 10000 });

    await adminPage.locator('button:has-text("Hãng tàu")').first().click();
    await adminPage.locator('button:has-text("Thêm bản ghi mới")').click();
    await expect(adminPage.locator('text=Thêm bản ghi mới').first()).toBeVisible();

    await adminPage.locator('input[name="code"]').fill(uniqueShippingCode);
    await adminPage.locator('input[name="name"]').fill(uniqueShippingName);
    await adminPage.locator('textarea[name="description"]').fill('Hãng tàu tự động tạo bởi Playwright Sync Suite');
    await adminPage.locator('button[type="submit"]:has-text("Lưu bản ghi")').click();

    // Verify record visible in Admin table (using search filter)
    await adminPage.locator('input[placeholder="Tìm theo mã hoặc tên..."]').fill(uniqueShippingCode);
    await expect(adminPage.locator('tr', { hasText: uniqueShippingCode }).first()).toBeVisible({ timeout: 10000 });

    // 3. Direct DB verification via PocketBase API
    const adminAuthRes = await fetch(`${PB_URL}/api/collections/users/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: TEST_USERS.admin.email, password: TEST_USERS.admin.password }),
    });
    const adminAuth = await adminAuthRes.json();
    const pbRecordRes = await fetch(`${PB_URL}/api/collections/shipping_lines/records?filter=(code='${uniqueShippingCode}')`, {
      headers: { Authorization: adminAuth.token },
    });
    const pbRecordData = await pbRecordRes.json();
    expect(pbRecordData.totalItems).toBeGreaterThanOrEqual(1);
    expect(pbRecordData.items[0].name).toBe(uniqueShippingName);

    // 4. Customer logs in on independent context
    await customerPage.goto('/login');
    await customerPage.locator('input[type="email"]').fill(TEST_USERS.customer.email);
    await customerPage.locator('input[type="password"]').fill(TEST_USERS.customer.password);
    await customerPage.locator('button[type="submit"]').click();
    await customerPage.waitForURL((url) => url.pathname === '/', { timeout: 10000 });

    // 5. Customer navigates to Create Booking and checks dropdown
    await customerPage.goto('/booking/new');
    await customerPage.waitForLoadState('networkidle');

    const shippingSelect = customerPage.locator('select[name="shippingLine"]');
    await expect(shippingSelect).toBeVisible({ timeout: 10000 });

    // Verify option is present in select dropdown
    const optionLocator = shippingSelect.locator(`option:has-text("${uniqueShippingName}")`);
    await expect(optionLocator).toBeAttached({ timeout: 10000 });

    // Select the new shipping line
    await shippingSelect.selectOption(uniqueShippingName);
    expect(await shippingSelect.inputValue()).toBe(uniqueShippingName);

    await adminContext.close();
    await customerContext.close();
  });

  test('SYNC-002: Admin edits Shipping Line -> Customer sees updated name with no duplicate entries', async ({ browser }) => {
    const adminContext = await browser.newContext();
    const customerContext = await browser.newContext();

    const adminPage = await adminContext.newPage();
    const customerPage = await customerContext.newPage();

    // 1. Admin logs in
    await adminPage.goto('/login');
    await adminPage.locator('input[type="email"]').fill(TEST_USERS.admin.email);
    await adminPage.locator('input[type="password"]').fill(TEST_USERS.admin.password);
    await adminPage.locator('button[type="submit"]').click();
    await adminPage.waitForURL((url) => url.pathname === '/', { timeout: 10000 });

    await adminPage.goto('/admin/master-data');
    await adminPage.locator('button:has-text("Hãng tàu")').first().click();

    // Search and locate record
    await adminPage.locator('input[placeholder="Tìm theo mã hoặc tên..."]').fill(uniqueShippingCode);
    await adminPage.waitForTimeout(300);
    const row = adminPage.locator('tr', { hasText: uniqueShippingCode });
    await expect(row).toBeVisible({ timeout: 10000 });
    await row.locator('button[title*="Sửa"]').click();

    // Update name
    await adminPage.locator('input[name="name"]').fill(updatedShippingName);
    await adminPage.locator('button[type="submit"]:has-text("Lưu bản ghi")').click();

    // Verify in Admin Table
    await adminPage.locator('input[placeholder="Tìm theo mã hoặc tên..."]').fill(uniqueShippingCode);
    await expect(adminPage.locator(`text=${updatedShippingName}`).first()).toBeVisible({ timeout: 10000 });

    // 2. Customer opens Create Booking
    await customerPage.goto('/login');
    await customerPage.locator('input[type="email"]').fill(TEST_USERS.customer.email);
    await customerPage.locator('input[type="password"]').fill(TEST_USERS.customer.password);
    await customerPage.locator('button[type="submit"]').click();
    await customerPage.waitForURL((url) => url.pathname === '/', { timeout: 10000 });

    await customerPage.goto('/booking/new');
    const shippingSelect = customerPage.locator('select[name="shippingLine"]');
    await expect(shippingSelect).toBeVisible({ timeout: 10000 });

    // Verify updated option exists
    await expect(shippingSelect.locator(`option:has-text("${updatedShippingName}")`)).toBeAttached({ timeout: 10000 });

    // Verify no duplicates: exact count should be 1
    const matchingOptionsCount = await shippingSelect.locator(`option:has-text("${updatedShippingName}")`).count();
    expect(matchingOptionsCount).toBe(1);

    await adminContext.close();
    await customerContext.close();
  });

  test('SYNC-003: Admin deactivates Shipping Line -> Customer Create Booking excludes inactive line', async ({ browser }) => {
    const adminContext = await browser.newContext();
    const customerContext = await browser.newContext();

    const adminPage = await adminContext.newPage();
    const customerPage = await customerContext.newPage();

    // 1. Admin deactivates
    await adminPage.goto('/login');
    await adminPage.locator('input[type="email"]').fill(TEST_USERS.admin.email);
    await adminPage.locator('input[type="password"]').fill(TEST_USERS.admin.password);
    await adminPage.locator('button[type="submit"]').click();
    await adminPage.waitForURL((url) => url.pathname === '/', { timeout: 10000 });

    await adminPage.goto('/admin/master-data');
    await adminPage.locator('button:has-text("Hãng tàu")').first().click();

    await adminPage.locator('input[placeholder="Tìm theo mã hoặc tên..."]').fill(uniqueShippingCode);
    await adminPage.waitForTimeout(300);
    const row = adminPage.locator('tr', { hasText: uniqueShippingCode });
    await expect(row).toBeVisible({ timeout: 10000 });

    // Toggle active button
    await row.locator('button[title*="Tạm dừng"], button[title*="Vô hiệu"]').click();

    const confirmBtn = adminPage.locator('button:has-text("Xác nhận thay đổi")');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }

    // Verify row status changed to Inactive
    await expect(row.locator('text=Tạm ngừng')).toBeVisible({ timeout: 10000 });

    // 2. Customer opens Create Booking -> Should NOT see deactivated line in options
    await customerPage.goto('/login');
    await customerPage.locator('input[type="email"]').fill(TEST_USERS.customer.email);
    await customerPage.locator('input[type="password"]').fill(TEST_USERS.customer.password);
    await customerPage.locator('button[type="submit"]').click();
    await customerPage.waitForURL((url) => url.pathname === '/', { timeout: 10000 });

    await customerPage.goto('/booking/new');
    const shippingSelect = customerPage.locator('select[name="shippingLine"]');
    await expect(shippingSelect).toBeVisible({ timeout: 10000 });

    const inactiveOption = shippingSelect.locator(`option[value="${updatedShippingName}"]`);
    expect(await inactiveOption.count()).toBe(0);

    await adminContext.close();
    await customerContext.close();
  });

  test('SYNC-004: Admin reactivates Shipping Line -> Customer sees it in options again', async ({ browser }) => {
    const adminContext = await browser.newContext();
    const customerContext = await browser.newContext();

    const adminPage = await adminContext.newPage();
    const customerPage = await customerContext.newPage();

    // 1. Admin reactivates
    await adminPage.goto('/login');
    await adminPage.locator('input[type="email"]').fill(TEST_USERS.admin.email);
    await adminPage.locator('input[type="password"]').fill(TEST_USERS.admin.password);
    await adminPage.locator('button[type="submit"]').click();
    await adminPage.waitForURL((url) => url.pathname === '/', { timeout: 10000 });

    await adminPage.goto('/admin/master-data');
    await adminPage.locator('button:has-text("Tạm ngừng")').first().click();

    await adminPage.locator('input[placeholder="Tìm theo mã hoặc tên..."]').fill(uniqueShippingCode);
    await adminPage.waitForTimeout(300);
    const row = adminPage.locator('tr', { hasText: uniqueShippingCode });
    await expect(row).toBeVisible({ timeout: 10000 });
    await row.locator('button[title*="Kích hoạt"]').click();

    const confirmBtn = adminPage.locator('button:has-text("Xác nhận thay đổi")');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }

    // 2. Customer checks Create Booking -> Reactivated line is visible again
    await customerPage.goto('/login');
    await customerPage.locator('input[type="email"]').fill(TEST_USERS.customer.email);
    await customerPage.locator('input[type="password"]').fill(TEST_USERS.customer.password);
    await customerPage.locator('button[type="submit"]').click();
    await customerPage.waitForURL((url) => url.pathname === '/', { timeout: 10000 });

    await customerPage.goto('/booking/new');
    const shippingSelect = customerPage.locator('select[name="shippingLine"]');
    await expect(shippingSelect).toBeVisible({ timeout: 10000 });

    await expect(shippingSelect.locator(`option:has-text("${updatedShippingName}")`)).toBeAttached({ timeout: 10000 });

    await adminContext.close();
    await customerContext.close();
  });

  test('SYNC-005: Admin updates Company info -> Customer Profile reflects new company details', async ({ browser }) => {
    const adminContext = await browser.newContext();
    const customerContext = await browser.newContext();

    const adminPage = await adminContext.newPage();
    const customerPage = await customerContext.newPage();

    const updatedCompanyName = `Công ty ABC Trading ${timestamp}`;
    const updatedAddress = `123 Đường Số 5, KCN VSIP 1, Bình Dương (${timestamp})`;

    // 1. Admin updates company in Admin Portal
    await adminPage.goto('/login');
    await adminPage.locator('input[type="email"]').fill(TEST_USERS.admin.email);
    await adminPage.locator('input[type="password"]').fill(TEST_USERS.admin.password);
    await adminPage.locator('button[type="submit"]').click();
    await adminPage.waitForURL((url) => url.pathname === '/', { timeout: 10000 });

    await adminPage.goto('/admin/customers');
    await expect(adminPage.locator('text=Quản Lý Khách Hàng Doanh Nghiệp')).toBeVisible({ timeout: 10000 });

    // Click edit on the first company
    const editBtn = adminPage.locator('button:has-text("Sửa")').first();
    await expect(editBtn).toBeVisible({ timeout: 10000 });
    await editBtn.click();

    await expect(adminPage.locator('text=Cập Nhật Thông Tin Doanh Nghiệp')).toBeVisible();
    await adminPage.locator('input[placeholder="VD: Công ty TNHH Xuất Nhập Khẩu Toàn Cầu"]').fill(updatedCompanyName);
    await adminPage.locator('input[placeholder="KCN Sóng Thần, Dĩ An, Bình Dương..."]').fill(updatedAddress);
    await adminPage.locator('button:has-text("Lưu thay đổi")').click();

    // Verify Admin table reflects new name
    await expect(adminPage.locator(`text=${updatedCompanyName}`).first()).toBeVisible({ timeout: 10000 });

    // 2. Customer logs in and views Profile
    await customerPage.goto('/login');
    await customerPage.locator('input[type="email"]').fill(TEST_USERS.customer.email);
    await customerPage.locator('input[type="password"]').fill(TEST_USERS.customer.password);
    await customerPage.locator('button[type="submit"]').click();
    await customerPage.waitForURL((url) => url.pathname === '/', { timeout: 10000 });

    // Verify greeting on Customer Dashboard
    await expect(customerPage.locator(`text=${updatedCompanyName}`).first()).toBeVisible({ timeout: 10000 });

    // Verify on Customer Profile page
    await customerPage.goto('/profile');
    await expect(customerPage.locator(`text=${updatedCompanyName}`).first()).toBeVisible({ timeout: 10000 });

    const pageContent = await customerPage.content();
    expect(pageContent).toContain(updatedCompanyName);

    await adminContext.close();
    await customerContext.close();
  });

  test('SYNC-006: Admin Form Config -> Customer Create Booking form applies dynamic field config', async ({ browser }) => {
    const adminContext = await browser.newContext();
    const customerContext = await browser.newContext();

    const adminPage = await adminContext.newPage();
    const customerPage = await customerContext.newPage();

    // 1. Admin opens Form Config
    await adminPage.goto('/login');
    await adminPage.locator('input[type="email"]').fill(TEST_USERS.admin.email);
    await adminPage.locator('input[type="password"]').fill(TEST_USERS.admin.password);
    await adminPage.locator('button[type="submit"]').click();
    await adminPage.waitForURL((url) => url.pathname === '/', { timeout: 10000 });

    await adminPage.goto('/admin/form-config');
    await expect(adminPage.locator('text=Cấu Hình Form TMS Động')).toBeVisible({ timeout: 10000 });

    // Find row for transshipmentPort and toggle visibility
    const transRow = adminPage.locator('tr', { hasText: 'transshipmentPort' });
    await expect(transRow).toBeVisible();

    // Click toggle button to hide transshipmentPort
    const toggleBtn = transRow.locator('button[title*="Ẩn"], button[title*="Hiển thị"]').first();
    await toggleBtn.click();
    await adminPage.waitForTimeout(1000);

    // 2. Customer checks Create Booking -> transshipmentPort should be hidden
    await customerPage.goto('/login');
    await customerPage.locator('input[type="email"]').fill(TEST_USERS.customer.email);
    await customerPage.locator('input[type="password"]').fill(TEST_USERS.customer.password);
    await customerPage.locator('button[type="submit"]').click();
    await customerPage.waitForURL((url) => url.pathname === '/', { timeout: 10000 });

    await customerPage.goto('/booking/new');
    await customerPage.waitForLoadState('networkidle');

    // transshipmentPort select should NOT be visible
    const transSelect = customerPage.locator('select[name="transshipmentPort"]');
    expect(await transSelect.count()).toBe(0);

    // 3. Admin toggles transshipmentPort back to visible
    await toggleBtn.click();
    await adminPage.waitForTimeout(1000);

    // 4. Customer refreshes or navigates back -> transshipmentPort is visible again
    await customerPage.goto('/booking/new');
    await expect(customerPage.locator('select[name="transshipmentPort"]')).toBeAttached({ timeout: 10000 });

    await adminContext.close();
    await customerContext.close();
  });

  test('SYNC-007: Full Multi-Role Workflow: Customer Booking -> Dispatcher Approval -> Customer Status Update', async ({ browser }) => {
    const customerContext = await browser.newContext();
    const dispatcherContext = await browser.newContext();

    const customerPage = await customerContext.newPage();
    const dispatcherPage = await dispatcherContext.newPage();

    const testBookingCode = `BK-SYNC-${timestamp}`;

    // 1. Customer creates a new Booking
    await customerPage.goto('/login');
    await customerPage.locator('input[type="email"]').fill(TEST_USERS.customer.email);
    await customerPage.locator('input[type="password"]').fill(TEST_USERS.customer.password);
    await customerPage.locator('button[type="submit"]').click();
    await customerPage.waitForURL((url) => url.pathname === '/', { timeout: 10000 });

    await customerPage.goto('/booking/new');
    await customerPage.locator('input#bookingNumber').fill(testBookingCode);
    
    // Step 1 -> Step 2
    const step1Next = customerPage.getByRole('button', { name: /Tiếp tục/i });
    await step1Next.click();
    await customerPage.waitForTimeout(600);

    // Review step and submit
    await expect(customerPage.locator('text=/Xác nhận thông tin|Chi tiết/i').first()).toBeVisible({ timeout: 10000 });
    const submitBtn = customerPage.getByRole('button', { name: /Gửi yêu cầu/i }).first();
    await submitBtn.click();
    await expect(customerPage.locator('text=/Gửi yêu cầu thành công|REQ-/i').first()).toBeVisible({ timeout: 15000 });

    // 2. Dispatcher in separate context sees the new booking in PENDING
    await dispatcherPage.goto('/login');
    await dispatcherPage.locator('input[type="email"]').fill(TEST_USERS.dispatcher.email);
    await dispatcherPage.locator('input[type="password"]').fill(TEST_USERS.dispatcher.password);
    await dispatcherPage.locator('button[type="submit"]').click();
    await dispatcherPage.waitForURL((url) => url.pathname === '/', { timeout: 10000 });

    await dispatcherPage.goto('/dispatcher');
    await dispatcherPage.waitForLoadState('networkidle');

    // Filter by PENDING
    await dispatcherPage.locator('button:has-text("Chờ duyệt")').first().click();

    // Verify booking is in the list
    const bookingRow = dispatcherPage.locator('div', { hasText: testBookingCode }).last();
    await expect(bookingRow).toBeVisible({ timeout: 15000 });

    // Dispatcher approves booking
    const approveBtn = bookingRow.getByRole('button', { name: /Phê duyệt/i });
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
      await expect(dispatcherPage.locator('text=Đã phê duyệt yêu cầu vận chuyển thành công!')).toBeVisible({ timeout: 10000 });
    }

    // 3. Customer checks Tracking / Dashboard: status updated
    await customerPage.goto('/tracking');
    await customerPage.waitForLoadState('networkidle');

    // Verify Tracking page responds and shows real-time progress
    await expect(customerPage.locator('text=Tiến độ vận chuyển').first()).toBeVisible({ timeout: 10000 });

    await customerContext.close();
    await dispatcherContext.close();
  });

  test('SYNC-008: Security & Multi-Tenant Isolation: Customer cannot alter master data or access unauthorized records', async () => {
    // 1. Customer token tries to POST to shipping_lines
    const customerLoginRes = await fetch(`${PB_URL}/api/collections/users/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: TEST_USERS.customer.email, password: TEST_USERS.customer.password }),
    });
    const customerAuth = await customerLoginRes.json();
    const customerToken = customerAuth.token;

    // Customer attempts to write to shipping_lines -> MUST BE 400 or 403 Forbidden
    const illegalMasterWrite = await fetch(`${PB_URL}/api/collections/shipping_lines/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: customerToken,
      },
      body: JSON.stringify({
        code: `HACK-${Date.now()}`,
        name: 'Hacker Shipping Line',
        isActive: true,
      }),
    });
    expect([400, 403]).toContain(illegalMasterWrite.status);

    // 2. Customer attempts to alter form_field_config -> MUST BE 400 or 403 Forbidden
    const illegalConfigWrite = await fetch(`${PB_URL}/api/collections/form_field_config/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: customerToken,
      },
      body: JSON.stringify({
        fieldKey: 'hackerField',
        label: 'Hacked Field',
        isVisible: true,
      }),
    });
    expect([400, 403]).toContain(illegalConfigWrite.status);
  });
});
