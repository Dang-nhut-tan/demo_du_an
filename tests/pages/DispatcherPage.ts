import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DispatcherPage extends BasePage {
  readonly tabBookings: Locator;
  readonly tabChanges: Locator;
  readonly tabProgress: Locator;

  readonly filterPending: Locator;
  readonly filterApproved: Locator;
  readonly filterAll: Locator;

  readonly approveBookingBtn: Locator;
  readonly rejectBookingBtn: Locator;

  readonly approveProposalBtn: Locator;
  readonly rejectProposalBtn: Locator;

  readonly stageSelect: Locator;
  readonly updateProgressBtn: Locator;
  readonly stageNoteInput: Locator;

  constructor(page: Page) {
    super(page);
    this.tabBookings = page.getByRole('button', { name: /Yêu cầu vận chuyển/i });
    this.tabChanges = page.getByRole('button', { name: /Đề xuất đổi lịch/i });
    this.tabProgress = page.getByRole('button', { name: /Cập nhật tiến độ/i });

    this.filterPending = page.getByRole('button', { name: /Chờ duyệt/i });
    this.filterApproved = page.getByRole('button', { name: /Đã duyệt/i });
    this.filterAll = page.getByRole('button', { name: /Tất cả/i });

    this.approveBookingBtn = page.getByRole('button', { name: /Phê duyệt/i }).first();
    this.rejectBookingBtn = page.getByRole('button', { name: /Từ chối/i }).first();

    this.approveProposalBtn = page.getByRole('button', { name: /Chấp thuận/i }).first();
    this.rejectProposalBtn = page.getByRole('button', { name: /Từ chối/i }).first();

    this.stageSelect = page.locator('select').first();
    this.updateProgressBtn = page.getByRole('button', { name: /Cập nhật trạng thái ngay|Cập nhật mốc|Lưu tiến độ/i });
    this.stageNoteInput = page.locator('input[placeholder*="Ghi chú"], textarea').first();
  }

  async goto(): Promise<void> {
    await this.page.goto('/dispatcher');
    await this.waitForPageLoaded();
  }

  async switchTab(tab: 'bookings' | 'changes' | 'progress'): Promise<void> {
    if (tab === 'bookings') await this.tabBookings.click();
    else if (tab === 'changes') await this.tabChanges.click();
    else if (tab === 'progress') await this.tabProgress.click();
    await this.page.waitForTimeout(300);
  }

  async approveFirstPendingBooking(): Promise<void> {
    await this.switchTab('bookings');
    if (await this.approveBookingBtn.isVisible()) {
      await this.approveBookingBtn.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async approveFirstScheduleChange(): Promise<void> {
    await this.switchTab('changes');
    if (await this.approveProposalBtn.isVisible()) {
      await this.approveProposalBtn.click();
      await this.page.waitForTimeout(1000);
    }
  }
}
