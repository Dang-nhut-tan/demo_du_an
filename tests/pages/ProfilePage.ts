import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProfilePage extends BasePage {
  readonly companyNameInput: Locator;
  readonly taxCodeInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;

  readonly defaultContainerSelect: Locator;
  readonly defaultPickupSelect: Locator;
  readonly defaultDeliverySelect: Locator;
  readonly defaultRequestTypeSelect: Locator;
  readonly defaultNotesTextarea: Locator;

  readonly autoFillToggle: Locator;
  readonly saveButton: Locator;
  readonly successNotice: Locator;

  constructor(page: Page) {
    super(page);
    this.companyNameInput = page.locator('label:has-text("Tên công ty") + input, input[name="companyName"], input[value*="ABC Trading"]').first();
    this.taxCodeInput = page.locator('label:has-text("Mã số thuế") + input, input[name="taxCode"]').first();
    this.emailInput = page.locator('label:has-text("Email") + input, input[name="email"]').first();
    this.phoneInput = page.locator('label:has-text("Số điện thoại") + input, input[name="phone"]').first();

    this.defaultContainerSelect = page.locator('label:has-text("Loại container mặc định") + select, select[name="defaultContainerType"]').first();
    this.defaultPickupSelect = page.locator('label:has-text("Điểm lấy hàng") + select, select[name="defaultPickupLocation"]').first();
    this.defaultDeliverySelect = page.locator('label:has-text("Điểm giao hàng") + select, select[name="defaultDeliveryLocation"]').first();
    this.defaultRequestTypeSelect = page.locator('label:has-text("Loại yêu cầu mặc định") + select, select[name="defaultRequestType"]').first();
    this.defaultNotesTextarea = page.locator('textarea').first();

    this.autoFillToggle = page.locator('input[type="checkbox"]').first();
    this.saveButton = page.getByRole('button', { name: /Lưu thay đổi/i });
    this.successNotice = page.locator('text=Lưu thông tin thành công, text=thành công');
  }

  async goto(): Promise<void> {
    await this.page.goto('/profile');
    await this.waitForPageLoaded();
  }

  async updateCompanyInfo(info: { name?: string; taxCode?: string; email?: string; phone?: string }): Promise<void> {
    if (info.name && await this.companyNameInput.isVisible()) await this.companyNameInput.fill(info.name);
    if (info.taxCode && await this.taxCodeInput.isVisible()) await this.taxCodeInput.fill(info.taxCode);
    if (info.email && await this.emailInput.isVisible()) await this.emailInput.fill(info.email);
    if (info.phone && await this.phoneInput.isVisible()) await this.phoneInput.fill(info.phone);
  }

  async updateShippingDefaults(defaults: {
    containerType?: string;
    pickupLocation?: string;
    deliveryLocation?: string;
    notes?: string;
  }): Promise<void> {
    if (defaults.containerType && await this.defaultContainerSelect.isVisible()) {
      await this.defaultContainerSelect.selectOption({ label: defaults.containerType });
    }
    if (defaults.pickupLocation && await this.defaultPickupSelect.isVisible()) {
      await this.defaultPickupSelect.selectOption({ label: defaults.pickupLocation });
    }
    if (defaults.deliveryLocation && await this.defaultDeliverySelect.isVisible()) {
      await this.defaultDeliverySelect.selectOption({ label: defaults.deliveryLocation });
    }
    if (defaults.notes && await this.defaultNotesTextarea.isVisible()) {
      await this.defaultNotesTextarea.fill(defaults.notes);
    }
  }

  async save(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForTimeout(500);
  }
}
