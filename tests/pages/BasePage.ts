import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForPageLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async captureScreenshot(path: string): Promise<void> {
    await this.page.screenshot({ path, fullPage: true });
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }
}
