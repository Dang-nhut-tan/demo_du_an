import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AdminPage extends BasePage {
  readonly navMasterData: Locator;
  readonly navCustomers: Locator;
  readonly navFormConfig: Locator;
  readonly navDashboard: Locator;

  readonly addRecordBtn: Locator;
  readonly searchInput: Locator;
  readonly codeInput: Locator;
  readonly nameInput: Locator;
  readonly descInput: Locator;
  readonly sortOrderInput: Locator;
  readonly isActiveToggle: Locator;
  readonly saveModalBtn: Locator;
  readonly cancelModalBtn: Locator;

  readonly categoryTabs: Locator;

  constructor(page: Page) {
    super(page);
    this.navDashboard = page.locator('a[href="/admin"], button:has-text("Tổng quan")').first();
    this.navMasterData = page.locator('a[href*="/admin/master-data"], button:has-text("Dữ liệu danh mục"), text=Dữ liệu danh mục').first();
    this.navCustomers = page.locator('a[href*="/admin/customers"], button:has-text("Khách hàng"), text=Khách hàng').first();
    this.navFormConfig = page.locator('a[href*="/admin/form-config"], button:has-text("Cấu hình Form"), text=Cấu hình Form').first();

    this.addRecordBtn = page.getByRole('button', { name: /Thêm mới|Thêm bản ghi|\+ Thêm/i });
    this.searchInput = page.locator('input[placeholder*="Tìm theo mã"], input[placeholder*="Tìm kiếm"], input[placeholder*="search"]').first();

    this.codeInput = page.locator('input[name="code"], input[placeholder*="VD: HMM"]').first();
    this.nameInput = page.locator('input[name="name"], input[placeholder*="VD: Hyundai"]').first();
    this.descInput = page.locator('textarea[name="description"]').first();
    this.sortOrderInput = page.locator('input[name="sortOrder"]').first();
    this.isActiveToggle = page.locator('input[name="isActive"], input[type="checkbox"]').first();

    this.saveModalBtn = page.getByRole('button', { name: /Lưu bản ghi|Lưu|Xác nhận|Tạo mới/i }).last();
    this.cancelModalBtn = page.getByRole('button', { name: /Hủy|Đóng/i });

    this.categoryTabs = page.locator('button').filter({ hasText: /Hãng tàu|Nơi đóng hàng|Cảng đến|Loại cont/i });
  }

  async goto(subPath: string = '/admin/master-data'): Promise<void> {
    await this.page.goto(subPath);
    await this.waitForPageLoaded();
  }

  async selectCategory(categoryName: string): Promise<void> {
    const tab = this.page.locator('button').filter({ hasText: new RegExp(categoryName, 'i') }).first();
    if (await tab.isVisible()) {
      await tab.click();
      await this.page.waitForTimeout(300);
    }
  }

  async createRecord(data: { code: string; name: string; description?: string; sortOrder?: number }): Promise<void> {
    await this.addRecordBtn.click();
    await this.page.waitForTimeout(300);

    if (await this.codeInput.isVisible()) await this.codeInput.fill(data.code);
    if (await this.nameInput.isVisible()) await this.nameInput.fill(data.name);
    if (data.description && await this.descInput.isVisible()) await this.descInput.fill(data.description);
    if (data.sortOrder !== undefined && await this.sortOrderInput.isVisible()) await this.sortOrderInput.fill(String(data.sortOrder));

    await this.saveModalBtn.click();
    await this.page.waitForTimeout(1000);
  }

  async toggleActive(nameOrCode: string): Promise<void> {
    const row = this.page.locator('tr, div').filter({ hasText: nameOrCode }).first();
    const toggleBtn = row.locator('button:has-text("Hoạt động"), button:has-text("Tạm ngừng"), button[role="switch"], input[type="checkbox"]').first();
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await this.page.waitForTimeout(500);

      const confirmBtn = this.page.getByRole('button', { name: /Xác nhận/i }).last();
      if (await confirmBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await confirmBtn.click();
        await this.page.waitForTimeout(500);
      }
    }
  }
}
