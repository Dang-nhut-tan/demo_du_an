import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class BookingPage extends BasePage {
  readonly bookingNumberInput: Locator;
  readonly shippingLineSelect: Locator;
  readonly vesselVoyageInput: Locator;
  readonly packingLocationSelect: Locator;
  readonly destinationPortSelect: Locator;
  readonly emptyPickupLocationSelect: Locator;
  readonly cargoTypeSelect: Locator;

  readonly saveDraftBtn: Locator;
  readonly nextStepBtn: Locator;
  readonly backStepBtn: Locator;
  readonly submitBookingBtn: Locator;

  readonly addContainerBtn: Locator;
  readonly notesTextarea: Locator;
  readonly successCodeText: Locator;

  constructor(page: Page) {
    super(page);
    this.bookingNumberInput = page.locator('input[placeholder*="BK"], input[placeholder*="Booking"], input[name="bookingNumber"]').first();
    this.shippingLineSelect = page.locator('label:has-text("Hãng tàu") + select, select[name="shippingLine"]').first();
    this.vesselVoyageInput = page.locator('label:has-text("Tên tàu") + input, input[name="vesselVoyage"]').first();
    this.packingLocationSelect = page.locator('label:has-text("Điểm lấy hàng"), label:has-text("Nơi đóng hàng")').locator('..').locator('select').first();
    this.destinationPortSelect = page.locator('label:has-text("Điểm giao hàng"), label:has-text("Cảng đến")').locator('..').locator('select').first();
    this.emptyPickupLocationSelect = page.locator('label:has-text("Nơi lấy rỗng"), label:has-text("Điểm lấy rỗng")').locator('..').locator('select').first();
    this.cargoTypeSelect = page.locator('label:has-text("Loại hàng")').locator('..').locator('select').first();

    this.saveDraftBtn = page.getByRole('button', { name: /Lưu bản nháp/i });
    this.nextStepBtn = page.getByRole('button', { name: /Tiếp tục/i });
    this.backStepBtn = page.getByRole('button', { name: /Quay lại/i });
    this.submitBookingBtn = page.getByRole('button', { name: /Gửi yêu cầu/i });

    this.addContainerBtn = page.getByRole('button', { name: /Thêm loại container|Thêm container/i });
    this.notesTextarea = page.locator('textarea').first();
    this.successCodeText = page.locator('.font-mono, text=REQ-');
  }

  async goto(): Promise<void> {
    await this.page.goto('/booking/new');
    await this.waitForPageLoaded();
  }

  async fillGeneralInfo(bookingNo: string, shippingLine: string = 'ONETRANS'): Promise<void> {
    await this.bookingNumberInput.fill(bookingNo);
    if (await this.shippingLineSelect.isVisible()) {
      await this.shippingLineSelect.selectOption(shippingLine).catch(async () => {
        await this.shippingLineSelect.selectOption({ label: new RegExp(shippingLine, 'i') }).catch(() => {});
      });
    }
  }

  async fillLocations(packing: string, destination: string): Promise<void> {
    if (await this.packingLocationSelect.isVisible()) {
      await this.packingLocationSelect.selectOption(packing).catch(async () => {
        await this.packingLocationSelect.selectOption({ label: new RegExp(packing, 'i') }).catch(() => {});
      });
    }
    if (await this.destinationPortSelect.isVisible()) {
      await this.destinationPortSelect.selectOption(destination).catch(async () => {
        await this.destinationPortSelect.selectOption({ label: new RegExp(destination, 'i') }).catch(() => {});
      });
    }
  }

  async addContainerRow(): Promise<void> {
    if (await this.addContainerBtn.isVisible()) {
      await this.addContainerBtn.click();
    }
  }

  async removeContainerRow(index: number = 1): Promise<void> {
    const removeButtons = this.page.locator('button[aria-label*="Xóa"], button:has-text("Xóa")');
    if (await removeButtons.count() > index) {
      await removeButtons.nth(index).click();
    }
  }

  async saveDraft(): Promise<void> {
    await this.saveDraftBtn.click();
    await this.page.waitForTimeout(500);
  }

  async proceedToReview(): Promise<void> {
    await this.nextStepBtn.click();
    await this.page.waitForTimeout(500);
  }

  async submitBooking(): Promise<void> {
    await this.submitBookingBtn.click();
    await this.page.waitForTimeout(1000);
  }

  async getCreatedRequestCode(): Promise<string> {
    const codeEl = this.page.locator('text=REQ-').first();
    if (await codeEl.isVisible()) {
      return (await codeEl.textContent()) || '';
    }
    return '';
  }
}
