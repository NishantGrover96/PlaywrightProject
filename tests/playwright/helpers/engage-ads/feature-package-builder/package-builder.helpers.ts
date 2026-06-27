import type { Page } from '@playwright/test';
import { PackageBuilderPage } from '../../pages/engage-ads/feature-package-builder/PackageBuilderPage';

export interface OverviewData {
  name: string;
  billingTerm: string;
  subtitle?: string;
  isInquiryOnly?: boolean;
}

export interface PricingData {
  priceDollars: number;
  breakdownAmounts?: number[];  // must sum to priceDollars if provided
}

/**
 * Fill all required Overview fields and optionally save.
 */
export async function fillOverviewAndSave(
  pb: PackageBuilderPage,
  data: OverviewData
): Promise<number | null> {
  await pb.fillOverview({ name: data.name, billingTerm: data.billingTerm, subtitle: data.subtitle });

  if (data.isInquiryOnly) {
    const isChecked = await pb.pkgIsInquiryOnly.isChecked();
    if (!isChecked) await pb.pkgIsInquiryOnly.check();
  }

  await pb.clickSave();
  await pb.waitForSaveSuccess();
  return await pb.getUrlPackageSeq();
}

/**
 * Add a pricing record with an optional matching cost breakdown.
 * Returns to pricing tab before interacting.
 */
export async function addPricingRecord(
  page: Page,
  pb: PackageBuilderPage,
  data: PricingData
): Promise<void> {
  await pb.switchTab('pricing');

  const hasCards = (await pb.pricingRecordCards.count()) > 0;
  if (!hasCards) {
    await pb.btnAddPricingRecord.click();
  }

  await pb.prcAmountFirst.fill(String(data.priceDollars));

  if (data.breakdownAmounts && data.breakdownAmounts.length > 0) {
    for (const amount of data.breakdownAmounts) {
      await pb.btnAddBreakdownRow.click();
      const lastRow = pb.costBreakdownRows.last();
      await lastRow.locator('.cost-row-amount').fill(String(amount));
    }
  }
}

/**
 * Add a single feature item to a given section.
 */
export async function addFeatureToSection(
  pb: PackageBuilderPage,
  sectionType: 'CAMPAIGN_LENGTH' | 'WHATS_INCLUDED' | 'BEST_FOR' | 'RECOMMENDATION',
  title: string
): Promise<void> {
  await pb.switchTab('features');
  await pb.addFeatureItem(sectionType, title);
}

/**
 * Select the first N channels and return their names.
 */
export async function selectChannels(
  pb: PackageBuilderPage,
  count: number
): Promise<void> {
  await pb.switchTab('channels');
  const total = await pb.channelCheckItems.count();
  const n = Math.min(count, total);
  for (let i = 0; i < n; i++) {
    const item = pb.channelCheckItems.nth(i);
    const isChecked = await item.evaluate(el => el.classList.contains('checked'));
    if (!isChecked) await item.click();
  }
}

/**
 * Full happy-path helper: creates a package with all tabs filled.
 */
export async function createFullPackage(
  page: Page,
  pb: PackageBuilderPage,
  opts: {
    name: string;
    billingTerm: string;
    priceDollars?: number;
    channelCount?: number;
  }
): Promise<number | null> {
  await pb.navigate();

  await pb.fillOverview({ name: opts.name, billingTerm: opts.billingTerm });

  if (opts.priceDollars !== undefined) {
    await addPricingRecord(page, pb, { priceDollars: opts.priceDollars });
  }

  if (opts.channelCount) {
    await selectChannels(pb, opts.channelCount);
  }

  await pb.switchTab('overview');
  await pb.clickSave();
  await pb.waitForSaveSuccess();
  return await pb.getUrlPackageSeq();
}
