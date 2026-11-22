import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ScheduleChangePage extends BasePage {
  readonly currentBookingCard: Locator;
  readonly pickupCheckbox: Locator;
  readonly deliveryCheckbox: Locator;
  readonly bothCheckbox: Locator;

  readonly newPickupDateInput: Locator;
  readonly newPickupTimeInput: Locator;
  readonly newDeliveryDateInput: Locator;
  readonly newDeliveryTimeInput: Locator;

  readonly reasonTextarea: Locator;
  readonly submitButton: Locator;
  readonly successBanner: Locator;

  constructor(page: Page) {
    super(page);
    this.currentBookingCard = page.locator('text=Thông tin yêu cầu hiện tại').locator('..');
    this.pickupCheckbox = page.locator('label:has-text("Thời gian lấy hàng") input[type="checkbox"]').first();
    this.deliveryCheckbox = page.locator('label:has-text("Thời gian giao hàng") input[type="checkbox"]').first();
    this.bothCheckbox = page.locator('label:has-text("Cả hai") input[type="checkbox"]').first();

    this.newPickupDateInput = page.locator('input[type="date"]').first();
    this.newPickupTimeInput = page.locator('input[type="time"]').first();
    this.newDeliveryDateInput = page.locator('input[type="date"]').nth(1);
    this.newDeliveryTimeInput = page.locator('input[type="time"]').nth(1);

    this.reasonTextarea = page.locator('textarea').first();
    this.submitButton = page.getByRole('button', { name: /Gửi đề xuất/i });
    this.successBanner = page.locator('text=thành công, text=Đã gửi đề xuất');
  }

  async goto(code?: string): Promise<void> {
    const url = code ? `/schedule-change?code=${code}` : '/schedule-change';
    await this.page.goto(url);
    await this.waitForPageLoaded();
  }

  async fillProposal(reasonText: string, newDate: string = '2025-08-30', newTime: string = '10:00'): Promise<void> {
    if (await this.newPickupDateInput.isVisible()) {
      await this.newPickupDateInput.fill(newDate);
    }
    if (await this.newPickupTimeInput.isVisible()) {
      await this.newPickupTimeInput.fill(newTime);
    }
    if (await this.reasonTextarea.isVisible()) {
      await this.reasonTextarea.fill(reasonText);
    }
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForTimeout(1000);
  }
}
