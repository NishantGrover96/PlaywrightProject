import { test, type Locator, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

type SelectorState = {
  selector: string;
  count: number;
  exists: boolean;
  visible: boolean;
  enabled: boolean;
  disabled: boolean;
  checked: boolean | null;
  text: string;
  tagName: string;
  id: string;
  classes: string[];
  attributes: Record<string, string>;
};

type PackageCardData = {
  index: number;
  packageSeq: string;
  isCustom: boolean;
  name: string;
  subtitle: string;
  priceTexts: string[];
  channels: string[];
  descriptionGroups: Array<{ heading: string; items: string[] }>;
  buttons: string[];
  links: Array<{ text: string; href: string }>;
  noteTexts: string[];
  visibleTextLines: string[];
};

type NetworkRecord = {
  phase: string;
  method: string;
  url: string;
  path: string;
  resourceType: string;
  status: number | null;
  sameOrigin: boolean;
};

const SCREENSHOTS_DIR = path.resolve(__dirname, '../reports/test-results/engage-ads/feature-view-package/ui-analysis');
const OUTPUT_JSON = path.join(SCREENSHOTS_DIR, 'ui-analysis-data.json');
const AUTH_STATE = path.resolve(__dirname, '../tests/playwright/fixtures/.auth/user.json');
const FEATURE_PATH = '/EngageAds/BundledAdPackages';
const FEATURE_URL = 'https://demoportaluat.channel-fusion.com/EngageAds/BundledAdPackages';
const BASE_ORIGIN = new URL(FEATURE_URL).origin;

test.use({ storageState: AUTH_STATE });
test.setTimeout(420_000);

function dedupe(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function textToLines(text: string | null | undefined): string[] {
  return dedupe((text || '').split(/\r?\n/).map((line) => line.replace(/\s+/g, ' ').trim()));
}

async function safeText(locator: Locator): Promise<string> {
  try {
    return (await locator.first().textContent())?.replace(/\s+/g, ' ').trim() || '';
  } catch {
    return '';
  }
}

async function safeAttr(locator: Locator, attribute: string): Promise<string> {
  try {
    return (await locator.first().getAttribute(attribute)) || '';
  } catch {
    return '';
  }
}

async function readInputValue(page: Page, selector: string): Promise<string> {
  try {
    return await page.inputValue(selector);
  } catch {
    return 'N/A';
  }
}

async function selectorState(page: Page, selector: string): Promise<SelectorState> {
  const locator = page.locator(selector);
  const count = await locator.count();
  const first = locator.first();
  const exists = count > 0;
  const visible = exists ? await first.isVisible().catch(() => false) : false;
  const enabled = exists ? await first.isEnabled().catch(() => false) : false;
  const disabled = exists ? await first.isDisabled().catch(() => false) : false;
  const checked = exists ? await first.isChecked().catch(() => null) : null;

  const meta = exists
    ? await first.evaluate((element) => {
        const htmlElement = element as HTMLElement;
        const attrs: Record<string, string> = {};
        for (const attr of Array.from(element.attributes)) {
          attrs[attr.name] = attr.value;
        }

        return {
          text: htmlElement.innerText?.replace(/\s+/g, ' ').trim() || element.textContent?.replace(/\s+/g, ' ').trim() || '',
          tagName: element.tagName.toLowerCase(),
          id: htmlElement.id || '',
          classes: Array.from(htmlElement.classList || []),
          attributes: attrs,
        };
      })
    : { text: '', tagName: '', id: '', classes: [], attributes: {} as Record<string, string> };

  return {
    selector,
    count,
    exists,
    visible,
    enabled,
    disabled,
    checked,
    text: meta.text,
    tagName: meta.tagName,
    id: meta.id,
    classes: meta.classes,
    attributes: meta.attributes,
  };
}

async function captureVisibleContent(page: Page) {
  const pageTitle = await page.title();
  const headings = dedupe(
    await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll((elements) =>
      elements
        .map((element) => (element.textContent || '').replace(/\s+/g, ' ').trim())
        .filter(Boolean),
    ),
  );
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const visibleLines = textToLines(bodyText);
  const breadcrumb = dedupe(
    await page.locator('.breadcrumb, nav[aria-label*="breadcrumb" i], ol.breadcrumb').evaluateAll((elements) =>
      elements
        .flatMap((element) => ((element.textContent || '').split(/\r?\n/)))
        .map((line) => line.replace(/\s+/g, ' ').trim())
        .filter(Boolean),
    ).catch(() => [] as string[]),
  );
  const navLinks = dedupe(
    await page.locator('a:visible').evaluateAll((elements) =>
      elements
        .map((element) => (element.textContent || '').replace(/\s+/g, ' ').trim())
        .filter(Boolean),
    ),
  );

  return { pageTitle, headings, visibleLines, breadcrumb, navLinks };
}

async function capturePackageCards(page: Page): Promise<PackageCardData[]> {
  const cards = page.locator('.plansWrapper .card, .card');
  const count = await cards.count();
  const results: PackageCardData[] = [];

  for (let index = 0; index < count; index += 1) {
    const card = cards.nth(index);
    const isVisible = await card.isVisible().catch(() => false);
    if (!isVisible) {
      continue;
    }

    const packageSeq =
      (await safeAttr(card.locator('.selectPackage'), 'packageSeq')) ||
      (await safeAttr(card.locator('.cardBadge'), 'packageSeq')) ||
      (await safeAttr(card.locator('a[href*="packageSeq="]'), 'packageSeq'));

    const links = await card.locator('a').evaluateAll((elements) =>
      elements.map((element) => ({
        text: (element.textContent || '').replace(/\s+/g, ' ').trim(),
        href: (element as HTMLAnchorElement).href || '',
      })),
    ).catch(() => [] as Array<{ text: string; href: string }>);

    const descriptionGroups = await card.locator('.section').evaluateAll((sections) =>
      sections.map((section) => {
        const heading =
          (section.querySelector('h1, h2, h3, h4, h5, h6, strong, .title, .sectionTitle')?.textContent || '')
            .replace(/\s+/g, ' ')
            .trim();
        const items = Array.from(section.querySelectorAll('li, p, span'))
          .map((element) => (element.textContent || '').replace(/\s+/g, ' ').trim())
          .filter(Boolean);
        return { heading, items: [...new Set(items)] };
      }),
    ).catch(() => [] as Array<{ heading: string; items: string[] }>);

    const visibleTextLines = textToLines(await card.innerText().catch(() => ''));
    const priceTexts = dedupe(
      visibleTextLines.filter((line) => /\$|month|week|year|campaign|setup|one[- ]time|mo\b|\/|per /i.test(line)),
    );
    const channels = dedupe(
      visibleTextLines.filter((line) => /(google|facebook|instagram|youtube|waze|display|search|social|channel)/i.test(line)),
    );
    const buttons = dedupe(
      await card.locator('button, a[role="button"], a.btnBordered, a.talkToExpertBtn').evaluateAll((elements) =>
        elements
          .map((element) => (element.textContent || '').replace(/\s+/g, ' ').trim())
          .filter(Boolean),
      ),
    );

    results.push({
      index,
      packageSeq,
      isCustom: (await card.locator('.talkToExpertBtn').count()) > 0 && (await card.locator('.selectPackage').count()) === 0,
      name: await safeText(card.locator('.cardBadge')),
      subtitle: await safeText(card.locator('.description')),
      priceTexts,
      channels,
      descriptionGroups,
      buttons,
      links: links.filter((link) => link.text || link.href),
      noteTexts: visibleTextLines.filter((line) => /note|claim|starting at|starting from|custom/i.test(line)),
      visibleTextLines,
    });
  }

  return results;
}

async function waitForStablePage(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => undefined);
  await page.waitForTimeout(1_000);
}

async function summarizeSelectors(page: Page, selectors: string[]) {
  const results: SelectorState[] = [];
  for (const selector of selectors) {
    results.push(await selectorState(page, selector));
  }
  return results;
}

async function captureModalFields(page: Page) {
  const modal = page.locator('#talkToExpertModal');
  const exists = (await modal.count()) > 0;
  if (!exists) {
    return { exists: false, visible: false, fields: [], formValid: null, invalidFields: [] as Array<Record<string, string>> };
  }

  const visible = await modal.isVisible().catch(() => false);
  const fields = await modal.locator('input, select, textarea, button').evaluateAll((elements) =>
    elements.map((element) => {
      const htmlElement = element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement;
      const label =
        (document.querySelector(`label[for="${htmlElement.id}"]`)?.textContent || '')
          .replace(/\s+/g, ' ')
          .trim();
      return {
        tagName: element.tagName.toLowerCase(),
        id: htmlElement.id || '',
        name: htmlElement.getAttribute('name') || '',
        type: htmlElement.getAttribute('type') || '',
        label,
        required: htmlElement.hasAttribute('required'),
        disabled: htmlElement.hasAttribute('disabled'),
        placeholder: htmlElement.getAttribute('placeholder') || '',
        text: (htmlElement.textContent || '').replace(/\s+/g, ' ').trim(),
      };
    }),
  ).catch(() => [] as Array<Record<string, string | boolean>>);

  const formValidity = await modal.locator('form').evaluate((formElement) => {
    const form = formElement as HTMLFormElement;
    return form.checkValidity();
  }).catch(() => null as boolean | null);

  const invalidFields = await modal.locator('form').evaluate((formElement) => {
    const form = formElement as HTMLFormElement;
    return Array.from(form.querySelectorAll('input, select, textarea'))
      .filter((element) => !(element as HTMLInputElement).checkValidity())
      .map((element) => {
        const htmlElement = element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        return {
          id: htmlElement.id || '',
          name: htmlElement.getAttribute('name') || '',
          validationMessage: htmlElement.validationMessage || '',
        };
      });
  }).catch(() => [] as Array<Record<string, string>>);

  return { exists, visible, fields, formValid: formValidity, invalidFields };
}

test('UI Analysis — EngageAds View Package', async ({ page }) => {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  let phase = 'initial-load';
  const requestIndex = new Map<object, number>();
  const networkRecords: NetworkRecord[] = [];

  page.on('request', (request) => {
    const requestUrl = request.url();
    let pathName = requestUrl;
    let sameOrigin = false;

    try {
      const parsed = new URL(requestUrl);
      pathName = `${parsed.pathname}${parsed.search}`;
      sameOrigin = parsed.origin === BASE_ORIGIN;
    } catch {
      // keep raw URL
    }

    const record: NetworkRecord = {
      phase,
      method: request.method(),
      url: requestUrl,
      path: pathName,
      resourceType: request.resourceType(),
      status: null,
      sameOrigin,
    };

    networkRecords.push(record);
    requestIndex.set(request, networkRecords.length - 1);
  });

  page.on('response', (response) => {
    const index = requestIndex.get(response.request());
    if (index !== undefined) {
      networkRecords[index].status = response.status();
    }
  });

  await page.goto(FEATURE_PATH, { waitUntil: 'domcontentloaded' });
  await waitForStablePage(page);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-initial-load.png'), fullPage: true });

  const initialContent = await captureVisibleContent(page);
  const initialHiddenValues = {
    hdnTotalBudget: await readInputValue(page, '#hdnTotalBudget'),
    hdnIsAdminOrCFAdmin: await readInputValue(page, '#hdnIsAdminOrCFAdmin'),
    hdnStripeEnabled: await readInputValue(page, '#hdnStripeEnabled'),
  };

  const packageCards = await capturePackageCards(page);
  const wizardState = {
    wizardVisible: await page.locator('.commonWizard').isVisible().catch(() => false),
    plansVisible: await page.locator('.plansWrapper').isVisible().catch(() => false),
    packageCardCount: packageCards.length,
    noPackagesMessageVisible: await page.locator('text=/no package/i').first().isVisible().catch(() => false),
    noPackagesMessages: dedupe(
      await page.locator('text=/no package/i').allInnerTexts().catch(() => [] as string[]),
    ),
  };

  const selectorChecksInitial = await summarizeSelectors(page, [
    '.card',
    '.cardBadge[packageSeq]',
    '.selectPackage[packageSeq]',
    '.talkToExpertBtn',
    '#hdnTotalBudget',
    '#hdnIsAdminOrCFAdmin',
    '#hdnStripeEnabled',
    '.commonWizard',
  ]);

  const selectableButtons = page.locator('.selectPackage');
  const selectableCount = await selectableButtons.count();
  let selectedPackageSeq = '';
  let packageSelection: Record<string, unknown> = {
    attempted: false,
    packageSeq: '',
    selectedPackageName: '',
    summary: null,
  };

  for (let index = 0; index < selectableCount; index += 1) {
    const button = selectableButtons.nth(index);
    if (await button.isVisible().catch(() => false)) {
      selectedPackageSeq = (await button.getAttribute('packageSeq')) || '';
      const selectedPackageName =
        (await safeText(button.locator('xpath=ancestor::*[contains(@class,"card")][1]//.//*[contains(@class,"cardBadge")]'))) ||
        (await safeText(button.locator('xpath=ancestor::*[contains(@class,"card")][1]')));

      phase = 'package-selection';
      const loadResponsePromise = page
        .waitForResponse((response) => response.url().includes('BundledAdPackages?handler=LoadPackageData') && response.request().method() === 'POST', { timeout: 20_000 })
        .catch(() => null);

      await button.click();
      await loadResponsePromise;
      await page.waitForTimeout(2_000);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-package-selected.png'), fullPage: true });

      const summarySelectors = [
        '#hdnTotalPlanCost',
        '#hdnOrderTotalWithFee',
        '#hdnBaseCardAmount',
        '#hdnTransactionFee',
        '#hdnCardAmount',
        '#hdnCoopAmount',
        '#coopFunds',
        '#ddlBudgetTypeNames',
        '#txtCoopPercentage',
        '#btnAddCoop',
        '#termsAndConditions',
        '#lblTermsAndConditions',
        '.btnPayment',
        '.btnCancelPlan',
        '.spnRemainingBalance',
        '.spnTransactionFee',
        '.spnCardChargeTotal',
        '.spnOrderTotalWithFee',
        '.spnTotalCoopAmount',
        '.spnBudgetType',
      ];

      const summarySelectorStates = await summarizeSelectors(page, summarySelectors);
      const paymentButton = page.locator('.btnPayment').first();
      const termsCheckbox = page.locator('#termsAndConditions').first();
      const coopCheckbox = page.locator('#coopFunds').first();

      const costSummaryBeforeTerms = {
        hiddenValues: {
          hdnTotalPlanCost: await readInputValue(page, '#hdnTotalPlanCost'),
          hdnOrderTotalWithFee: await readInputValue(page, '#hdnOrderTotalWithFee'),
          hdnBaseCardAmount: await readInputValue(page, '#hdnBaseCardAmount'),
          hdnTransactionFee: await readInputValue(page, '#hdnTransactionFee'),
          hdnCardAmount: await readInputValue(page, '#hdnCardAmount'),
          hdnCoopAmount: await readInputValue(page, '#hdnCoopAmount'),
        },
        textValues: {
          remainingBalance: await safeText(page.locator('.spnRemainingBalance')),
          transactionFee: await safeText(page.locator('.spnTransactionFee')),
          cardChargeTotal: await safeText(page.locator('.spnCardChargeTotal')),
          orderTotalWithFee: await safeText(page.locator('.spnOrderTotalWithFee')),
          totalCoopAmount: await safeText(page.locator('.spnTotalCoopAmount')),
          budgetTypeTable: await safeText(page.locator('.spnBudgetType')),
        },
        coopVisible: await coopCheckbox.isVisible().catch(() => false),
        coopEnabled: await coopCheckbox.isEnabled().catch(() => false),
        coopChecked: await coopCheckbox.isChecked().catch(() => false),
        availableBudgetText: dedupe(
          (await page.locator('body').innerText().catch(() => ''))
            .split(/\r?\n/)
            .map((line) => line.replace(/\s+/g, ' ').trim())
            .filter((line) => /available budget|coop/i.test(line)),
        ),
        termsVisible: await termsCheckbox.isVisible().catch(() => false),
        termsChecked: await termsCheckbox.isChecked().catch(() => false),
        paymentButtonLabel: await safeText(paymentButton),
        paymentButtonEnabled: await paymentButton.isEnabled().catch(() => false),
        paymentButtonDisabled: await paymentButton.isDisabled().catch(() => true),
        summaryLines: textToLines(await page.locator('body').innerText().catch(() => '')),
        selectorStates: summarySelectorStates,
      };

      if (await termsCheckbox.isVisible().catch(() => false)) {
        phase = 'terms-acceptance';
        if (!(await termsCheckbox.isChecked().catch(() => false))) {
          await termsCheckbox.check();
          await page.waitForTimeout(1_000);
        }
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-terms-accepted.png'), fullPage: true });
      }

      const coopJourney: Record<string, unknown> = {
        attempted: false,
        applied: false,
        selectedBudgetTypeText: '',
        enteredAmount: '',
        budgetTypesVisible: await page.locator('.budgetTypes').isVisible().catch(() => false),
        splitPaymentMessage: '',
      };

      if (await coopCheckbox.isVisible().catch(() => false)) {
        if (!(await coopCheckbox.isChecked().catch(() => false)) && (await coopCheckbox.isEnabled().catch(() => false))) {
          await coopCheckbox.check().catch(() => undefined);
          await page.waitForTimeout(750);
        }

        const budgetSelect = page.locator('#ddlBudgetTypeNames').first();
        const optionCount = await budgetSelect.locator('option').count().catch(() => 0);
        if ((await budgetSelect.isVisible().catch(() => false)) && optionCount > 1) {
          coopJourney.attempted = true;
          const options = await budgetSelect.locator('option').evaluateAll((elements) =>
            elements.map((element) => ({
              value: (element as HTMLOptionElement).value,
              text: (element.textContent || '').replace(/\s+/g, ' ').trim(),
            })),
          );
          const selectedOption = options.find((option) => option.value && !/select/i.test(option.text));
          if (selectedOption) {
            await budgetSelect.selectOption(selectedOption.value).catch(() => undefined);
            await page.fill('#txtCoopPercentage', '1.00').catch(() => undefined);
            phase = 'coop-allocation';
            const feeResponsePromise = page
              .waitForResponse((response) => response.url().includes('BundledAdPackages?handler=ProcessingFee') && response.request().method() === 'GET', { timeout: 20_000 })
              .catch(() => null);
            await page.click('#btnAddCoop').catch(() => undefined);
            await feeResponsePromise;
            await page.waitForTimeout(1_000);
            coopJourney.applied = true;
            coopJourney.selectedBudgetTypeText = selectedOption.text;
            coopJourney.enteredAmount = '1.00';
            coopJourney.budgetTypesVisible = await page.locator('.budgetTypes').isVisible().catch(() => false);
            coopJourney.splitPaymentMessage = await safeText(page.locator('#splitPaymentMsg'));
          }
        }
      }

      const costSummaryAfterTerms = {
        hiddenValues: {
          hdnTotalPlanCost: await readInputValue(page, '#hdnTotalPlanCost'),
          hdnOrderTotalWithFee: await readInputValue(page, '#hdnOrderTotalWithFee'),
          hdnBaseCardAmount: await readInputValue(page, '#hdnBaseCardAmount'),
          hdnTransactionFee: await readInputValue(page, '#hdnTransactionFee'),
          hdnCardAmount: await readInputValue(page, '#hdnCardAmount'),
          hdnCoopAmount: await readInputValue(page, '#hdnCoopAmount'),
        },
        textValues: {
          remainingBalance: await safeText(page.locator('.spnRemainingBalance')),
          transactionFee: await safeText(page.locator('.spnTransactionFee')),
          cardChargeTotal: await safeText(page.locator('.spnCardChargeTotal')),
          orderTotalWithFee: await safeText(page.locator('.spnOrderTotalWithFee')),
          totalCoopAmount: await safeText(page.locator('.spnTotalCoopAmount')),
          budgetTypeTable: await safeText(page.locator('.spnBudgetType')),
          splitPaymentMessage: await safeText(page.locator('#splitPaymentMsg')),
        },
        termsChecked: await termsCheckbox.isChecked().catch(() => false),
        paymentButtonEnabled: await paymentButton.isEnabled().catch(() => false),
        paymentButtonDisabled: await paymentButton.isDisabled().catch(() => true),
        coopEnabled: await coopCheckbox.isEnabled().catch(() => false),
        coopChecked: await coopCheckbox.isChecked().catch(() => false),
      };

      packageSelection = {
        attempted: true,
        packageSeq: selectedPackageSeq,
        selectedPackageName,
        costSummaryBeforeTerms,
        costSummaryAfterTerms,
        coopJourney,
      };

      break;
    }
  }

  phase = 'view-details';
  await page.goto(FEATURE_PATH, { waitUntil: 'domcontentloaded' });
  await waitForStablePage(page);
  const viewDetailsLink = page.locator('a.btnBordered[href*="Detail"], a[href*="/EngageAds/Detail"]').first();
  let detailPageData: Record<string, unknown> = { attempted: false };

  if ((await viewDetailsLink.count()) > 0) {
    const detailHref = await viewDetailsLink.getAttribute('href');
    const detailUrl = detailHref ? new URL(detailHref, FEATURE_URL).toString() : '';
    if (detailUrl) {
      await page.goto(detailUrl, { waitUntil: 'domcontentloaded' });
      await waitForStablePage(page);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-view-details.png'), fullPage: true });
      detailPageData = {
        attempted: true,
        href: detailHref,
        url: page.url(),
        title: await page.title(),
        headings: dedupe(
          await page.locator('h1, h2, h3, h4').evaluateAll((elements) =>
            elements
              .map((element) => (element.textContent || '').replace(/\s+/g, ' ').trim())
              .filter(Boolean),
          ),
        ),
        visibleLines: textToLines(await page.locator('body').innerText().catch(() => '')),
      };
    }
  }

  phase = 'expert-modal';
  await page.goto(FEATURE_PATH, { waitUntil: 'domcontentloaded' });
  await waitForStablePage(page);
  const talkToExpertButton = page.locator('.talkToExpertBtn').first();
  let expertModalData: Record<string, unknown> = { attempted: false };

  if ((await talkToExpertButton.count()) > 0 && (await talkToExpertButton.isVisible().catch(() => false))) {
    const businessGoalsPromise = page
      .waitForResponse((response) => response.url().includes('BundledAdPackages?handler=BusinessGoals') && response.request().method() === 'GET', { timeout: 20_000 })
      .catch(() => null);
    const statesPromise = page
      .waitForResponse((response) => response.url().includes('BundledAdPackages?handler=LoadStates') && response.request().method() === 'GET', { timeout: 20_000 })
      .catch(() => null);

    await talkToExpertButton.click();
    await businessGoalsPromise;
    await statesPromise;
    await page.waitForTimeout(1_000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-expert-modal.png'), fullPage: false });

    await page.locator('#submitExpertConsultation').click().catch(() => undefined);
    await page.waitForTimeout(750);

    expertModalData = {
      attempted: true,
      modalFields: await captureModalFields(page),
      packagePriceNote: await safeText(page.locator('#packagePriceNote')),
      selectedPackageSeq: await readInputValue(page, '#selectedPackageSeq'),
      modalTitle: await safeText(page.locator('#talkToExpertModal .modal-title, #talkToExpertModal h4, #talkToExpertModal h5')),
      visibleLines: textToLines(await page.locator('#talkToExpertModal').innerText().catch(() => '')),
    };
  }

  phase = 'deep-link';
  let deepLinkData: Record<string, unknown> = { attempted: false };
  if (selectedPackageSeq) {
    const deepLinkUrl = `${FEATURE_PATH}?packageSeq=${encodeURIComponent(selectedPackageSeq)}`;
    const loadResponsePromise = page
      .waitForResponse((response) => response.url().includes('BundledAdPackages?handler=LoadPackageData') && response.request().method() === 'POST', { timeout: 20_000 })
      .catch(() => null);
    await page.goto(deepLinkUrl, { waitUntil: 'domcontentloaded' });
    await loadResponsePromise;
    await waitForStablePage(page);

    deepLinkData = {
      attempted: true,
      url: page.url(),
      autoSelectedPackageSeq: selectedPackageSeq,
      termsVisible: await page.locator('#termsAndConditions').isVisible().catch(() => false),
      paymentButtonVisible: await page.locator('.btnPayment').isVisible().catch(() => false),
      costSummaryVisible: await page.locator('.spnOrderTotalWithFee').isVisible().catch(() => false),
      visibleLines: textToLines(await page.locator('body').innerText().catch(() => '')),
    };
  }

  const selectorInventory = await summarizeSelectors(page, [
    '.card',
    '.cardBadge[packageSeq]',
    '.selectPackage[packageSeq]',
    '#hdnTotalPlanCost',
    '.spnRemainingBalance',
    '.spnTransactionFee',
    '.spnCardChargeTotal',
    '.spnOrderTotalWithFee',
    '.spnTotalCoopAmount',
    '#coopFunds',
    '#ddlBudgetTypeNames',
    '#txtCoopPercentage',
    '#btnAddCoop',
    '#termsAndConditions',
    '#lblTermsAndConditions',
    '.btnPayment',
    '#talkToExpertModal',
    '#businessGoal',
    '#txtCity',
    '#ddlState',
    '#monthlyBudget',
    '#additionalNotes',
    '#submitExpertConsultation',
  ]);

  const observedNetwork = dedupe(
    networkRecords
      .filter((record) => record.sameOrigin)
      .map((record) => `${record.phase} | ${record.method} | ${record.path} | ${record.status ?? 'pending'} | ${record.resourceType}`),
  );

  const result = {
    generatedAt: new Date().toISOString(),
    featureUrl: FEATURE_URL,
    currentUrl: page.url(),
    page: initialContent,
    initialHiddenValues,
    wizardState,
    packageCards,
    packageSelection,
    detailPageData,
    expertModalData,
    deepLinkData,
    selectorChecksInitial,
    selectorInventory,
    observedNetwork,
    networkRecords,
  };

  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(result, null, 2)}\n`, 'utf8');

  console.log(`UI analysis data written to ${OUTPUT_JSON}`);
  console.log(`Observed same-origin requests: ${observedNetwork.length}`);
  console.log(JSON.stringify({
    pageTitle: initialContent.pageTitle,
    packageCardCount: wizardState.packageCardCount,
    selectedPackageSeq,
    hiddenValues: initialHiddenValues,
  }, null, 2));
});
