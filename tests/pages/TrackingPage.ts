import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class TrackingPage extends BasePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly summaryHeaderCard: Locator;
  readonly statusBadge: Locator;

  readonly tabTimeline: Locator;
  readonly tabDetails: Locator;
  readonly tabHistory: Locator;

  readonly timelineItems: Locator;
  readonly activeStageCard: Locator;
  readonly driverNameText: Locator;
  readonly truckPlateText: Locator;
  readonly dispatcherNoteText: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.locator('input[placeholder*="Nhập mã yêu cầu"], input[placeholder*="booking"]').first();
    this.searchButton = page.locator('button:has(svg)').filter({ hasText: /Tìm/ }).first();
    this.summaryHeaderCard = page.locator('div:has-text("Kho U&I")').first();
    this.statusBadge = page.locator('.rounded-full:has-text("Đang"), .rounded-full:has-text("Hoàn tất")').first();

    this.tabTimeline = page.getByRole('button', { name: /Tiến độ/i });
    this.tabDetails = page.getByRole('button', { name: /Thông tin chi tiết/i });
    this.tabHistory = page.getByRole('button', { name: /Lịch sử thay đổi/i });

    this.timelineItems = page.locator('.relative.flex.items-start, div:has(> .font-bold)');
    this.activeStageCard = page.locator('.bg-blue-50, .border-blue-200, .bg-blue-500\\/10').first();
    this.driverNameText = page.locator('text=Tài xế').locator('..').locator('.font-bold, .font-semibold').first();
    this.truckPlateText = page.locator('text=Biển số xe').locator('..').locator('.font-bold, .font-semibold').first();
    this.dispatcherNoteText = page.locator('text=Ghi chú').locator('..');
  }

  async goto(code?: string): Promise<void> {
    const url = code ? `/tracking?code=${code}` : '/tracking';
    await this.page.goto(url);
    await this.waitForPageLoaded();
  }

  async search(code: string): Promise<void> {
    await this.searchInput.fill(code);
    await this.searchInput.press('Enter');
    await this.page.waitForTimeout(500);
  }

  async getActiveStageText(): Promise<string> {
    const el = this.page.locator('.bg-blue-50 .font-bold, .bg-blue-50 h4, .text-blue-900.font-bold').first();
    if (await el.isVisible()) {
      return (await el.textContent()) || '';
    }
    return '';
  }
}
