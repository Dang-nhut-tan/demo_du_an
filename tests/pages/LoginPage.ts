import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberCheckbox: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly customerDemoBtn: Locator;
  readonly dispatcherDemoBtn: Locator;
  readonly portalTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('input[type="email"], input[placeholder*="Email"]').first();
    this.passwordInput = page.locator('input[type="password"]').first();
    this.rememberCheckbox = page.locator('input[type="checkbox"]').first();
    this.submitButton = page.locator('button[type="submit"]').first();
    this.errorMessage = page.locator('.text-rose-700, .bg-rose-50, div[role="alert"], .text-red-600, .text-rose-600');
    this.customerDemoBtn = page.getByRole('button', { name: /Khách hàng \(ABC Trading\)/i });
    this.dispatcherDemoBtn = page.getByRole('button', { name: /Điều phối viên/i });
    this.portalTitle = page.locator('text=Customer Portal (PWA)');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
    await this.waitForPageLoaded();
  }

  async login(identity: string, pass: string, remember: boolean = true): Promise<void> {
    await this.emailInput.clear();
    await this.emailInput.fill(identity);
    await this.passwordInput.clear();
    await this.passwordInput.fill(pass);
    if (remember) {
      const isChecked = await this.rememberCheckbox.isChecked();
      if (!isChecked) {
        await this.rememberCheckbox.check();
      }
    }
    await this.submitButton.click();
  }

  async fillCustomerDemo(): Promise<void> {
    if (await this.customerDemoBtn.isVisible()) {
      await this.customerDemoBtn.click();
    } else {
      await this.emailInput.clear();
      await this.emailInput.fill('customer@demo.local');
      await this.passwordInput.clear();
      await this.passwordInput.fill('Demo@123456');
    }
  }

  async fillDispatcherDemo(): Promise<void> {
    if (await this.dispatcherDemoBtn.isVisible()) {
      await this.dispatcherDemoBtn.click();
    } else {
      await this.emailInput.clear();
      await this.emailInput.fill('dispatcher@demo.local');
      await this.passwordInput.clear();
      await this.passwordInput.fill('Demo@123456');
    }
  }

  async getErrorMessage(): Promise<string | null> {
    const err = this.page.getByText(/Failed to authenticate|không chính xác|thất bại|lỗi/i).first();
    try {
      await err.waitFor({ state: 'visible', timeout: 6000 });
      return (await err.textContent()) || null;
    } catch (_e) {
      return null;
    }
  }
}
