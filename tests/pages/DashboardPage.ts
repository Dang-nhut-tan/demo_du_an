import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly greetingText: Locator;
  readonly statTotal: Locator;
  readonly statInProgress: Locator;
  readonly statPending: Locator;
  readonly statRescheduled: Locator;

  readonly createBookingCard: Locator;
  readonly scheduleChangeCard: Locator;
  readonly trackingCard: Locator;

  readonly recentRequestsSection: Locator;
  readonly viewAllRequestsLink: Locator;

  readonly navHome: Locator;
  readonly navCreate: Locator;
  readonly navTracking: Locator;
  readonly navProfile: Locator;

  constructor(page: Page) {
    super(page);
    this.greetingText = page.locator('text=Xin chào');
    this.statTotal = page.locator('text=Tổng yêu cầu').locator('..').locator('.text-2xl, .text-xl, div.font-black, div.font-bold').first();
    this.statInProgress = page.locator('text=Đang thực hiện').locator('..').locator('.text-2xl, .text-xl, div.font-black, div.font-bold').first();
    this.statPending = page.locator('text=Chờ xử lý').locator('..').locator('.text-2xl, .text-xl, div.font-black, div.font-bold').first();
    this.statRescheduled = page.locator('text=Thay đổi lịch').locator('..').locator('.text-2xl, .text-xl, div.font-black, div.font-bold').first();

    this.createBookingCard = page.locator('text=Tạo yêu cầu vận chuyển').first();
    this.scheduleChangeCard = page.locator('text=Đề xuất sửa thời gian').first();
    this.trackingCard = page.locator('text=Theo dõi tiến độ').first();

    this.recentRequestsSection = page.locator('text=Yêu cầu gần đây');
    this.viewAllRequestsLink = page.locator('text=Xem tất cả');

    this.navHome = page.locator('nav button, nav a').filter({ hasText: /Trang chủ/i });
    this.navCreate = page.locator('nav button, nav a').filter({ hasText: /Tạo yêu cầu/i });
    this.navTracking = page.locator('nav button, nav a').filter({ hasText: /Theo dõi/i });
    this.navProfile = page.locator('nav button, nav a').filter({ hasText: /Tài khoản|Hồ sơ/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.waitForPageLoaded();
  }

  async getGreeting(): Promise<string> {
    return (await this.greetingText.textContent()) || '';
  }

  async clickCreateBooking(): Promise<void> {
    await this.createBookingCard.click();
  }

  async clickScheduleChange(): Promise<void> {
    await this.scheduleChangeCard.click();
  }

  async clickTracking(): Promise<void> {
    await this.trackingCard.click();
  }

  async clickProfile(): Promise<void> {
    const avatar = this.page.locator('button[aria-label*="Hồ sơ"], button[aria-label*="Tài khoản"], header button:has(svg)').last();
    if (await avatar.isVisible()) {
      await avatar.click();
    } else {
      await this.page.goto('/profile');
    }
  }
}
