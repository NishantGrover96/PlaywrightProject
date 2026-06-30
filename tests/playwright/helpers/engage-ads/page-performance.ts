/**
 * Page load performance measurement utility for EngageAds tests.
 *
 * Tier thresholds (per EngageAds QA guidelines):
 *   < 2s   → excellent   ✅
 *   2–3s   → good        ✅
 *   3–5s   → fair        ⚠️  warn
 *   5–8s   → poor        ⚠️  warn
 *   > 8s   → critical    🔴  fail (throws)
 */
export type PerfTier = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export interface PageLoadResult {
  durationMs: number;
  tier: PerfTier;
}

/**
 * Measures the time taken for `waitFn` to resolve (page ready signal),
 * logs a tiered warning, and throws on critical slowness (> 8s).
 *
 * @param waitFn  - async function that resolves when the page is ready
 * @param label   - optional label for console output (e.g. page name)
 */
export async function measurePageLoad(
  waitFn: () => Promise<void>,
  label = 'Page',
): Promise<PageLoadResult> {
  const start = Date.now();
  await waitFn();
  const durationMs = Date.now() - start;
  const seconds = (durationMs / 1_000).toFixed(2);

  let tier: PerfTier;
  if (durationMs < 2_000)      tier = 'excellent';
  else if (durationMs < 3_000) tier = 'good';
  else if (durationMs < 5_000) tier = 'fair';
  else if (durationMs < 8_000) tier = 'poor';
  else                          tier = 'critical';

  switch (tier) {
    case 'excellent':
    case 'good':
      console.info(`✅ ${label} load: ${seconds}s [${tier.toUpperCase()}]`);
      break;

    case 'fair':
      console.warn(
        `⚠️  Warning: ${label} load took ${seconds}s [FAIR].\n` +
        `Expected ≤ 3s. Should be investigated if it occurs consistently.\n` +
        `Possible causes: slow server response, large JS bundles, blocking API requests.`,
      );
      break;

    case 'poor':
      console.warn(
        `⚠️  Warning: ${label} load took ${seconds}s [POOR].\n` +
        `Expected ≤ 5s. Likely to impact user experience; optimization recommended.\n` +
        `Investigate: slow server response, large JS bundles, blocking API requests,\n` +
        `database query latency, missing indexes, excessive DOM rendering.`,
      );
      break;

    case 'critical':
      throw new Error(
        `🔴 Critical: ${label} load took ${seconds}s [CRITICAL] — exceeds 8s threshold.\n` +
        `This must be investigated and resolved before release.\n\n` +
        `Possible causes:\n` +
        `  • Slow server response\n` +
        `  • Large JavaScript bundles\n` +
        `  • Blocking API requests\n` +
        `  • Database query latency\n` +
        `  • Missing indexes\n` +
        `  • Excessive DOM rendering\n` +
        `  • Unoptimized network requests\n\n` +
        `Would you like to analyze and optimize page loading performance?`,
      );
  }

  return { durationMs, tier };
}
