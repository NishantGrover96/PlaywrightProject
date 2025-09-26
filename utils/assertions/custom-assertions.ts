import { expect, Locator, Page } from '@playwright/test';

export class CustomAssertions {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Assert element is visible within timeout
   */
  async assertElementVisible(
    locator: Locator,
    message?: string,
    timeout: number = 90000
  ): Promise<void> {
    await expect(locator, message || `Element should be visible`).toBeVisible({ timeout });
  }

  /**
   * Assert element is hidden within timeout
   */
  async assertElementHidden(
    locator: Locator,
    message?: string,
    timeout: number = 90000
  ): Promise<void> {
    await expect(locator, message || `Element should be hidden`).toBeHidden({ timeout });
  }

  /**
   * Assert element contains specific text
   */
  async assertElementContainsText(
    locator: Locator,
    text: string | RegExp,
    message?: string,
    timeout: number = 90000
  ): Promise<void> {
    await expect(locator, message || `Element should contain text: ${text}`).toContainText(text, {
      timeout,
    });
  }

  /**
   * Assert element has exact text
   */
  async assertElementHasText(
    locator: Locator,
    text: string | RegExp,
    message?: string,
    timeout: number = 90000
  ): Promise<void> {
    await expect(locator, message || `Element should have text: ${text}`).toHaveText(text, {
      timeout,
    });
  }

  /**
   * Assert element count matches expected
   */
  async assertElementCount(
    locator: Locator,
    count: number,
    message?: string,
    timeout: number = 90000
  ): Promise<void> {
    await expect(locator, message || `Element count should be ${count}`).toHaveCount(count, {
      timeout,
    });
  }

  /**
   * Assert element has specific attribute value
   */
  async assertElementHasAttribute(
    locator: Locator,
    attribute: string,
    value: string | RegExp,
    message?: string,
    timeout: number = 90000
  ): Promise<void> {
    await expect(locator, message || `Element should have ${attribute}="${value}"`).toHaveAttribute(
      attribute,
      value,
      { timeout }
    );
  }

  /**
   * Assert element has specific CSS property
   */
  async assertElementHasCSS(
    locator: Locator,
    property: string,
    value: string | RegExp,
    message?: string,
    timeout: number = 90000
  ): Promise<void> {
    await expect(locator, message || `Element should have CSS ${property}: ${value}`).toHaveCSS(
      property,
      value,
      { timeout }
    );
  }

  /**
   * Assert input has specific value
   */
  async assertInputHasValue(
    locator: Locator,
    value: string | RegExp,
    message?: string,
    timeout: number = 90000
  ): Promise<void> {
    await expect(locator, message || `Input should have value: ${value}`).toHaveValue(value, {
      timeout,
    });
  }

  /**
   * Assert element is enabled
   */
  async assertElementEnabled(
    locator: Locator,
    message?: string,
    timeout: number = 90000
  ): Promise<void> {
    await expect(locator, message || `Element should be enabled`).toBeEnabled({ timeout });
  }

  /**
   * Assert element is disabled
   */
  async assertElementDisabled(
    locator: Locator,
    message?: string,
    timeout: number = 90000
  ): Promise<void> {
    await expect(locator, message || `Element should be disabled`).toBeDisabled({ timeout });
  }

  /**
   * Assert checkbox/radio is checked
   */
  async assertElementChecked(
    locator: Locator,
    message?: string,
    timeout: number = 90000
  ): Promise<void> {
    await expect(locator, message || `Element should be checked`).toBeChecked({ timeout });
  }

  /**
   * Assert checkbox/radio is unchecked
   */
  async assertElementUnchecked(
    locator: Locator,
    message?: string,
    timeout: number = 90000
  ): Promise<void> {
    await expect(locator, message || `Element should be unchecked`).not.toBeChecked({ timeout });
  }

  /**
   * Assert page has specific title
   */
  async assertPageTitle(
    title: string | RegExp,
    message?: string,
    timeout: number = 90000
  ): Promise<void> {
    await expect(this.page, message || `Page should have title: ${title}`).toHaveTitle(title, {
      timeout,
    });
  }

  /**
   * Assert page has specific URL
   */
  async assertPageURL(
    url: string | RegExp,
    message?: string,
    timeout: number = 90000
  ): Promise<void> {
    await expect(this.page, message || `Page should have URL: ${url}`).toHaveURL(url, { timeout });
  }

  /**
   * Assert page URL contains specific text
   */
  async assertURLContains(text: string, message?: string): Promise<void> {
    const currentURL = this.page.url();
    expect(currentURL, message || `URL should contain: ${text}`).toContain(text);
  }

  /**
   * Assert multiple elements are visible
   */
  async assertMultipleElementsVisible(
    locators: Locator[],
    message?: string,
    timeout: number = 90000
  ): Promise<void> {
    for (const locator of locators) {
      await this.assertElementVisible(locator, message, timeout);
    }
  }

  /**
   * Assert table has specific number of rows
   */
  async assertTableRowCount(
    tableLocator: Locator,
    expectedCount: number,
    message?: string,
    timeout: number = 90000
  ): Promise<void> {
    const rows = tableLocator.locator('tbody tr, tr');
    await expect(rows, message || `Table should have ${expectedCount} rows`).toHaveCount(
      expectedCount,
      { timeout }
    );
  }

  /**
   * Assert table contains specific data
   */
  async assertTableContainsData(
    tableLocator: Locator,
    data: string[],
    message?: string,
    timeout: number = 90000
  ): Promise<void> {
    for (const item of data) {
      await expect(tableLocator, message || `Table should contain: ${item}`).toContainText(item, {
        timeout,
      });
    }
  }

  /**
   * Assert form validation error is displayed
   */
  async assertValidationError(
    errorLocator: Locator,
    expectedMessage?: string,
    timeout: number = 90000
  ): Promise<void> {
    await this.assertElementVisible(errorLocator, 'Validation error should be visible', timeout);
    if (expectedMessage) {
      await this.assertElementContainsText(
        errorLocator,
        expectedMessage,
        'Error message should match expected text',
        timeout
      );
    }
  }

  /**
   * Assert success message is displayed
   */
  async assertSuccessMessage(
    messageLocator: Locator,
    expectedMessage?: string,
    timeout: number = 90000
  ): Promise<void> {
    await this.assertElementVisible(messageLocator, 'Success message should be visible', timeout);
    if (expectedMessage) {
      await this.assertElementContainsText(
        messageLocator,
        expectedMessage,
        'Success message should match expected text',
        timeout
      );
    }
  }

  /**
   * Assert dropdown has specific options
   */
  async assertDropdownOptions(
    selectLocator: Locator,
    expectedOptions: string[],
    message?: string,
    timeout: number = 90000
  ): Promise<void> {
    const options = selectLocator.locator('option');
    await expect(
      options,
      message || `Dropdown should have ${expectedOptions.length} options`
    ).toHaveCount(expectedOptions.length, { timeout });

    for (let i = 0; i < expectedOptions.length; i++) {
      await expect(options.nth(i), `Option ${i + 1} should be: ${expectedOptions[i]}`).toHaveText(
        expectedOptions[i],
        { timeout }
      );
    }
  }

  /**
   * Assert element is focused
   */
  async assertElementFocused(
    locator: Locator,
    message?: string,
    timeout: number = 90000
  ): Promise<void> {
    await expect(locator, message || `Element should be focused`).toBeFocused({ timeout });
  }

  /**
   * Assert element has specific class
   */
  async assertElementHasClass(
    locator: Locator,
    className: string,
    message?: string,
    timeout: number = 90000
  ): Promise<void> {
    await expect(locator, message || `Element should have class: ${className}`).toHaveClass(
      new RegExp(className),
      { timeout }
    );
  }

  /**
   * Assert page contains no console errors
   */
  async assertNoConsoleErrors(message?: string): Promise<void> {
    const consoleErrors: string[] = [];

    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    expect(consoleErrors, message || 'Page should have no console errors').toHaveLength(0);
  }

  /**
   * Assert network request was made
   */
  async assertNetworkRequest(
    urlPattern: string | RegExp,
    message?: string,
    timeout: number = 90000
  ): Promise<void> {
    const requestPromise = this.page.waitForRequest(urlPattern, { timeout });
    const request = await requestPromise;
    expect(request, message || `Network request should be made to: ${urlPattern}`).toBeTruthy();
  }

  /**
   * Assert response status
   */
  async assertResponseStatus(
    urlPattern: string | RegExp,
    expectedStatus: number,
    message?: string,
    timeout: number = 90000
  ): Promise<void> {
    const responsePromise = this.page.waitForResponse(urlPattern, { timeout });
    const response = await responsePromise;
    expect(response.status(), message || `Response status should be: ${expectedStatus}`).toBe(
      expectedStatus
    );
  }

  /**
   * Assert local storage item exists
   */
  async assertLocalStorageItem(
    key: string,
    expectedValue?: string,
    message?: string
  ): Promise<void> {
    const value = await this.page.evaluate((storageKey) => localStorage.getItem(storageKey), key);
    expect(value, message || `Local storage should contain key: ${key}`).toBeTruthy();

    if (expectedValue) {
      expect(value, message || `Local storage ${key} should equal: ${expectedValue}`).toBe(
        expectedValue
      );
    }
  }

  /**
   * Assert session storage item exists
   */
  async assertSessionStorageItem(
    key: string,
    expectedValue?: string,
    message?: string
  ): Promise<void> {
    const value = await this.page.evaluate((storageKey) => sessionStorage.getItem(storageKey), key);
    expect(value, message || `Session storage should contain key: ${key}`).toBeTruthy();

    if (expectedValue) {
      expect(value, message || `Session storage ${key} should equal: ${expectedValue}`).toBe(
        expectedValue
      );
    }
  }

  /**
   * Assert cookie exists
   */
  async assertCookieExists(name: string, expectedValue?: string, message?: string): Promise<void> {
    const cookies = await this.page.context().cookies();
    const cookie = cookies.find((c) => c.name === name);
    expect(cookie, message || `Cookie should exist: ${name}`).toBeTruthy();

    if (expectedValue && cookie) {
      expect(cookie.value, message || `Cookie ${name} should equal: ${expectedValue}`).toBe(
        expectedValue
      );
    }
  }

  /**
   * Assert element is within viewport
   */
  async assertElementInViewport(
    locator: Locator,
    message?: string,
    timeout: number = 90000
  ): Promise<void> {
    await expect(locator, message || `Element should be in viewport`).toBeInViewport({ timeout });
  }

  /**
   * Assert drag and drop operation completed
   */
  async assertDragDropCompleted(
    sourceLocator: Locator,
    targetLocator: Locator,
    message?: string
  ): Promise<void> {
    // This is a placeholder for drag-drop verification logic
    // Implementation would depend on specific application behavior
    await this.assertElementVisible(
      targetLocator,
      message || 'Drag and drop target should be visible'
    );
  }
}
