import { test, expect } from '@playwright/test';
import { SubmitClaimPage } from '../../../pages/coop/feature-submit-claim/SubmitClaimPage';

test.describe('Minimal test', () => {
  test('can import SubmitClaimPage', async ({ page }) => {
    const claim = new SubmitClaimPage(page);
    expect(claim).toBeTruthy();
  });
});
