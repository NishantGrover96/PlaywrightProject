import { Locator, Page, expect } from '@playwright/test';

export class ElementHelper {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Wait for element to be visible with timeout
   */
  async waitForElementVisible(locator: Locator, timeout: number = 90000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementHidden(locator: Locator, timeout: number = 90000): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Scroll element into view
   */
  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Check if element exists without waiting
   */
  async elementExists(locator: Locator): Promise<boolean> {
    try {
      const count = await locator.count();
      return count > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get element count
   */
  async getElementCount(locator: Locator): Promise<number> {
    return await locator.count();
  }

  /**
   * Safe click with wait and retry
   */
  async safeClick(locator: Locator, options?: {
    timeout?: number;
    retries?: number;
    force?: boolean;
  }): Promise<void> {
    const { timeout = 90000, retries = 3, force = false } = options || {};
    
    for (let i = 0; i < retries; i++) {
      try {
        await this.waitForElementVisible(locator, timeout);
        await locator.click({ force, timeout });
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Safe fill with clear first
   */
  async safeFill(locator: Locator, value: string, options?: {
    timeout?: number;
    clear?: boolean;
  }): Promise<void> {
    const { timeout = 90000, clear = true } = options || {};
    
    await this.waitForElementVisible(locator, timeout);
    if (clear) {
      await locator.clear();
    }
    await locator.fill(value);
  }

  /**
   * Get text content safely
   */
  async getTextContent(locator: Locator, options?: {
    timeout?: number;
    trim?: boolean;
  }): Promise<string> {
    const { timeout = 90000, trim = true } = options || {};
    
    await this.waitForElementVisible(locator, timeout);
    const text = await locator.textContent() || '';
    return trim ? text.trim() : text;
  }

  /**
   * Get all text contents from multiple elements
   */
  async getAllTextContents(locator: Locator, options?: {
    timeout?: number;
    trim?: boolean;
  }): Promise<string[]> {
    const { timeout = 90000, trim = true } = options || {};
    
    await locator.first().waitFor({ state: 'visible', timeout });
    const texts = await locator.allTextContents();
    return trim ? texts.map(text => text.trim()) : texts;
  }

  /**
   * Get attribute value
   */
  async getAttribute(locator: Locator, attribute: string, options?: {
    timeout?: number;
  }): Promise<string | null> {
    const { timeout = 90000 } = options || {};
    
    await this.waitForElementVisible(locator, timeout);
    return await locator.getAttribute(attribute);
  }

  /**
   * Check if element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    try {
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(locator: Locator): Promise<boolean> {
    try {
      return await locator.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Check if checkbox/radio is checked
   */
  async isChecked(locator: Locator): Promise<boolean> {
    try {
      return await locator.isChecked();
    } catch {
      return false;
    }
  }

  /**
   * Wait for element to contain specific text
   */
  async waitForText(locator: Locator, text: string | RegExp, options?: {
    timeout?: number;
  }): Promise<void> {
    const { timeout = 90000 } = options || {};
    
    await expect(locator).toContainText(text, { timeout });
  }

  /**
   * Select dropdown option by text
   */
  async selectOption(locator: Locator, option: string | { label?: string; value?: string; index?: number }): Promise<void> {
    await this.waitForElementVisible(locator);
    
    if (typeof option === 'string') {
      await locator.selectOption({ label: option });
    } else {
      if (option.value) {
        await locator.selectOption({ value: option.value });
      } else if (option.label) {
        await locator.selectOption({ label: option.label });
      } else if (option.index !== undefined) {
        await locator.selectOption({ index: option.index });
      }
    }
  }

  /**
   * Take element screenshot
   */
  async takeElementScreenshot(locator: Locator, path: string): Promise<void> {
    await this.waitForElementVisible(locator);
    await locator.screenshot({ path });
  }

  /**
   * Hover over element
   */
  async hover(locator: Locator, options?: { timeout?: number }): Promise<void> {
    const { timeout = 90000 } = options || {};
    
    await this.waitForElementVisible(locator, timeout);
    await locator.hover();
  }

  /**
   * Right click on element
   */
  async rightClick(locator: Locator, options?: { timeout?: number }): Promise<void> {
    const { timeout = 90000 } = options || {};
    
    await this.waitForElementVisible(locator, timeout);
    await locator.click({ button: 'right' });
  }

  /**
   * Double click on element
   */
  async doubleClick(locator: Locator, options?: { timeout?: number }): Promise<void> {
    const { timeout = 90000 } = options || {};
    
    await this.waitForElementVisible(locator, timeout);
    await locator.dblclick();
  }

  /**
   * Get element bounding box
   */
  async getBoundingBox(locator: Locator): Promise<{ x: number; y: number; width: number; height: number } | null> {
    await this.waitForElementVisible(locator);
    return await locator.boundingBox();
  }

  /**
   * Focus on element
   */
  async focus(locator: Locator, options?: { timeout?: number }): Promise<void> {
    const { timeout = 90000 } = options || {};
    
    await this.waitForElementVisible(locator, timeout);
    await locator.focus();
  }

  /**
   * Press key on element
   */
  async pressKey(locator: Locator, key: string, options?: { timeout?: number }): Promise<void> {
    const { timeout = 90000 } = options || {};
    
    await this.waitForElementVisible(locator, timeout);
    await locator.press(key);
  }

  /**
   * Upload file to input element
   */
  async uploadFile(locator: Locator, filePath: string | string[]): Promise<void> {
    await this.waitForElementVisible(locator);
    await locator.setInputFiles(filePath);
  }

  /**
   * Wait for element count to match expected
   */
  async waitForElementCount(locator: Locator, expectedCount: number, options?: {
    timeout?: number;
  }): Promise<void> {
    const { timeout = 90000 } = options || {};
    
    await expect(locator).toHaveCount(expectedCount, { timeout });
  }

  /**
   * Get CSS property value
   */
  async getCSSProperty(locator: Locator, property: string): Promise<string> {
    await this.waitForElementVisible(locator);
    return await locator.evaluate((el, prop) => 
      window.getComputedStyle(el).getPropertyValue(prop), property
    );
  }
}
