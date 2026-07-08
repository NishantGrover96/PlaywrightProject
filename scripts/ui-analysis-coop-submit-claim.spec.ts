/**
 * UI Analysis — Coop Submit Claim
 * Multi-client, multi-dealer session analysis.
 *
 * Captures per wizard step:
 *   - Visible fields, labels, buttons, tiles
 *   - Conditional sections (Media Type step, Dealer Type dropdown, Product Lines, Vendor block)
 *   - Feature flags from /Admin/Feature/FeatureList (Coop module)
 *   - Network calls per step
 *   - Screenshots
 *
 * Output:
 *   reports/test-results/coop/feature-submit-claim/ui-analysis/{session}/
 *     *.png          — screenshots per step
 *   docs/module-analysis/coop/feature-submit-claim/multi-client-analysis.html
 *
 * Run:
 *   npx playwright test scripts/ui-analysis-coop-submit-claim.spec.ts `
 *     --config scripts/playwright.ui-analysis-coop.config.ts `
 *     --headed --workers=1
 */
import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// ── Output paths ───────────────────────────────────────────────────────────────
const REPORTS_ROOT = path.resolve(__dirname, '../reports/test-results/coop/feature-submit-claim/ui-analysis');
const REPORT_OUT   = path.resolve(__dirname, '../docs/module-analysis/coop/feature-submit-claim/multi-client-analysis.html');

// ── Session definitions ────────────────────────────────────────────────────────
// Each session = one browser window that pauses at login for manual credential entry.
const SESSIONS: Record<string, {
  portal: 'DemoPortal' | 'CertainTeed';
  dealer: 'Dealer 1' | 'Dealer 2';
  loginPath: string;
  submitClaimPath: string;
  featureListPath: string;
}> = {
  'demoportal-dealer1': {
    portal:          'DemoPortal',
    dealer:          'Dealer 1',
    loginPath:       '/account/login',
    submitClaimPath: '/CoopManagement/Claims/Submit/SubmitClaim',
    featureListPath: '/Admin/Feature/FeatureList',
  },
  'demoportal-dealer2': {
    portal:          'DemoPortal',
    dealer:          'Dealer 2',
    loginPath:       '/account/login',
    submitClaimPath: '/CoopManagement/Claims/Submit/SubmitClaim',
    featureListPath: '/Admin/Feature/FeatureList',
  },
  'certainteed-dealer1': {
    portal:          'CertainTeed',
    dealer:          'Dealer 1',
    loginPath:       '/Account/Login?Internal',
    submitClaimPath: '/CoopManagement/Claims/Submit/SubmitClaim',
    featureListPath: '/Admin/Feature/FeatureList',
  },
  'certainteed-dealer2': {
    portal:          'CertainTeed',
    dealer:          'Dealer 2',
    loginPath:       '/Account/Login?Internal',
    submitClaimPath: '/CoopManagement/Claims/Submit/SubmitClaim',
    featureListPath: '/Admin/Feature/FeatureList',
  },
};

// ── Types ──────────────────────────────────────────────────────────────────────
type FieldInfo = {
  id:          string;
  label:       string;
  tagName:     string;
  type:        string;
  required:    boolean;
  visible:     boolean;
  readonly:    boolean;
  maxlength:   string;
  placeholder: string;
  value:       string;
};

type ButtonInfo = {
  id:      string;
  label:   string;
  visible: boolean;
  enabled: boolean;
};

type StepCapture = {
  step:         string;
  screenshot:   string;
  fields:       FieldInfo[];
  buttons:      ButtonInfo[];
  tiles:        string[];
  dropdowns:    Record<string, string[]>;
  conditionals: Record<string, boolean>;
  networkCalls: NetworkCall[];
  rawText:      string[];
};

type NetworkCall = {
  phase:    string;
  method:   string;
  path:     string;
  status:   number | null;
};

type FeatureFlag = {
  feature:     string;
  feature_key: string;
  user_role:   string;
  active_flag: string;
};

type SessionResult = {
  sessionId:    string;
  portal:       string;
  dealer:       string;
  baseUrl:      string;
  capturedAt:   string;
  featureFlags: FeatureFlag[];
  steps:        StepCapture[];
  errors:       string[];
};

// ── Utilities ──────────────────────────────────────────────────────────────────
function dedupe(arr: string[]): string[] {
  return [...new Set(arr.map(s => s.trim()).filter(Boolean))];
}

async function screenshot(page: Page, dir: string, name: string): Promise<string> {
  const file = path.join(dir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

async function captureFields(page: Page, scope = 'body'): Promise<FieldInfo[]> {
  return page.locator(`${scope} input, ${scope} select, ${scope} textarea`).evaluateAll(
    (elements) => elements.map(el => {
      const e = el as HTMLInputElement;
      const label = document.querySelector(`label[for="${e.id}"]`)?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      return {
        id:          e.id || '',
        label,
        tagName:     e.tagName.toLowerCase(),
        type:        e.getAttribute('type') || '',
        required:    e.hasAttribute('required'),
        visible:     !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length),
        readonly:    e.hasAttribute('readonly'),
        maxlength:   e.getAttribute('maxlength') || '',
        placeholder: e.getAttribute('placeholder') || '',
        value:       e.value || '',
      };
    })
  ).catch(() => []);
}

async function captureButtons(page: Page, scope = 'body'): Promise<ButtonInfo[]> {
  return page.locator(`${scope} button, ${scope} input[type=submit], ${scope} a.btn`).evaluateAll(
    (elements) => elements.map(el => {
      const e = el as HTMLButtonElement;
      return {
        id:      e.id || '',
        label:   (e.textContent || e.getAttribute('value') || '').replace(/\s+/g, ' ').trim(),
        visible: !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length),
        enabled: !e.disabled,
      };
    })
  ).catch(() => []);
}

async function captureTiles(page: Page): Promise<string[]> {
  return dedupe(
    await page.locator('ul.IconListRow li, .mediaTile, .tile').evaluateAll(
      (els) => els.map(e => (e.textContent || '').replace(/\s+/g, ' ').trim())
    ).catch(() => [])
  );
}

async function captureDropdown(page: Page, selector: string): Promise<string[]> {
  const count = await page.locator(selector).count();
  if (!count) return [];
  return page.locator(`${selector} option`).evaluateAll(
    (opts) => opts.map(o => (o as HTMLOptionElement).text.trim())
  ).catch(() => []);
}

async function captureRawText(page: Page): Promise<string[]> {
  const raw = await page.locator('body').innerText().catch(() => '');
  return dedupe(raw.split(/\r?\n/).map(l => l.replace(/\s+/g, ' ').trim()));
}

async function isVisible(page: Page, selector: string): Promise<boolean> {
  return page.locator(selector).first().isVisible().catch(() => false);
}

// ── Feature flags fetcher ──────────────────────────────────────────────────────
// Tries the admin endpoint. If access is denied (non-admin session), returns empty.
async function fetchFeatureFlags(page: Page, baseUrl: string): Promise<FeatureFlag[]> {
  const modules = ['Coop', 'EngageAds', 'PopShop'];
  const all: FeatureFlag[] = [];

  for (const mod of modules) {
    try {
      const url = `${baseUrl}/Admin/Feature/FeatureList?handler=FeatureProgram&moduleValue=${mod}`;
      const resp = await page.request.get(url);
      if (!resp.ok()) continue;
      const body = await resp.json();
      const list: Array<Record<string, string>> = body.data ?? body;
      if (!Array.isArray(list)) continue;
      for (const item of list) {
        all.push({
          feature:     item['feature'] ?? '',
          feature_key: item['feature_key'] ?? '',
          user_role:   item['user_role'] ?? item['userRole'] ?? 'All',
          active_flag: item['active_flag'] ?? item['activeFlag'] ?? 'N',
        });
      }
    } catch {
      // Feature list not accessible for this role — silently skip
    }
  }
  return all;
}

// ── Step capture orchestrator ──────────────────────────────────────────────────
async function captureStep(
  page: Page,
  stepName: string,
  screenshotDir: string,
  screenshotKey: string,
  networkCalls: NetworkCall[],
  currentPhase: { value: string },
): Promise<StepCapture> {
  currentPhase.value = stepName;
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(1200);

  const ssFile = await screenshot(page, screenshotDir, screenshotKey);

  const conditionals: Record<string, boolean> = {
    'mediaTypeStep':          await isVisible(page, 'ul.IconListRow, .IconListRow'),
    'dealerTypeDropdown':     await isVisible(page, '#programDealerTypeDropdown'),
    'productLinesBlock':      await isVisible(page, '#drpProductCodes, #tblProductLineBody'),
    'vendorInfoBlock':        await isVisible(page, '#txtVendorName, #txtVendorContact'),
    'preApprovalInput':       await isVisible(page, '#txtAdCode'),
    'invoiceUpload':          await isVisible(page, 'input[type=file]'),
    'budgetDisplay':          await isVisible(page, '#spnDealerBudget'),
    'contactNameInput':       await isVisible(page, '#txtContactName, #txtContactNameStep'),
    'multiCurrencyToggle':    await isVisible(page, '.multiCurrency, #currencyToggle'),
    'coopOcrSection':         await isVisible(page, '#ocrSection, .ocrUpload'),
    'recentActivitiesSection':await isVisible(page, '#recentActivities, .recentActivity'),
  };

  const tiles    = await captureTiles(page);
  const fields   = await captureFields(page);
  const buttons  = await captureButtons(page);
  const rawText  = await captureRawText(page);

  const dropdowns: Record<string, string[]> = {
    'programDealerType': await captureDropdown(page, '#programDealerTypeDropdown'),
    'fiscalYear':        await captureDropdown(page, '#ddlFiscalYear, #FiscalYear'),
    'claimType':         await captureDropdown(page, '#ddlClaimType'),
  };

  return {
    step:         stepName,
    screenshot:   path.basename(ssFile),
    fields,
    buttons,
    tiles,
    dropdowns,
    conditionals,
    networkCalls: [...networkCalls],
    rawText,
  };
}

// ── Main analysis session ──────────────────────────────────────────────────────
async function runSession(
  page: Page,
  sessionId: string,
  baseUrl: string,
): Promise<SessionResult> {
  const session    = SESSIONS[sessionId];
  const sessionDir = path.join(REPORTS_ROOT, sessionId);
  fs.mkdirSync(sessionDir, { recursive: true });

  const errors: string[]     = [];
  const steps: StepCapture[] = [];
  const networkCalls: NetworkCall[] = [];
  const currentPhase = { value: 'login' };

  // ── Network intercept ──────────────────────────────────────────────
  page.on('request', req => {
    try {
      const u = new URL(req.url());
      if (u.origin === new URL(baseUrl).origin) {
        networkCalls.push({ phase: currentPhase.value, method: req.method(), path: u.pathname + u.search, status: null });
      }
    } catch { /* ignore */ }
  });
  page.on('response', resp => {
    try {
      const u = new URL(resp.url());
      if (u.origin === new URL(baseUrl).origin) {
        const last = [...networkCalls].reverse().find(r => r.path === u.pathname + u.search && r.status === null);
        if (last) last.status = resp.status();
      }
    } catch { /* ignore */ }
  });

  // ── Step 0: Login — pause for manual credential entry ─────────────
  console.log(`\n[${sessionId}] Opening login page. Enter credentials and click Login, then Resume in Playwright inspector.`);
  await page.goto(session.loginPath, { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: path.join(sessionDir, '00-login-page.png') });
  await page.pause();   // ← YOU log in here

  // Confirm login succeeded
  const postLoginUrl = page.url();
  const loginFailed  = /login/i.test(new URL(postLoginUrl).pathname);
  if (loginFailed) {
    errors.push(`Login may have failed — still on login-like URL: ${postLoginUrl}`);
  }

  // ── Step 0b: Fetch feature flags (best-effort — may need admin role) ──
  currentPhase.value = 'feature-flags';
  const featureFlags = await fetchFeatureFlags(page, baseUrl);

  // ── Step 1: Navigate to Submit Claim ──────────────────────────────
  currentPhase.value = 'step1-claim-type';
  await page.goto(session.submitClaimPath, { waitUntil: 'domcontentloaded' });
  steps.push(await captureStep(page, 'Step 1 — Claim Type & Contact', sessionDir, '01-step1-claim-type', networkCalls, currentPhase));

  // ── Step 2: Advance Step 1 (No Pre-Approval path) ─────────────────
  currentPhase.value = 'step1-advance';
  const noPA = page.locator('#rdNoPreApproval, input[value="NoPreapproval"]').first();
  if (await noPA.isVisible().catch(() => false)) {
    const trigger = page.locator('#rdNoPreApproval').locator('..').locator('div.selectBlock').first();
    await trigger.click().catch(() => noPA.click());
  }
  const continueStep1 = page.locator('#btnClaimStep1, #btnClaimStep2').first();
  if (await continueStep1.isVisible().catch(() => false)) {
    await continueStep1.click();
    await page.waitForTimeout(1500);
  }
  steps.push(await captureStep(page, 'After Step 1 Continue', sessionDir, '02-after-step1', networkCalls, currentPhase));

  // ── Step 3: Media Type selection (may not be present on all portals) ──
  currentPhase.value = 'step3-media-type';
  const mediaVisible = await isVisible(page, 'ul.IconListRow, .IconListRow');
  if (mediaVisible) {
    steps.push(await captureStep(page, 'Step 3 — Media Type Tiles', sessionDir, '03-media-tiles', networkCalls, currentPhase));
    // Select first tile
    const firstTile = page.locator('ul.IconListRow li').first();
    if (await firstTile.isVisible().catch(() => false)) {
      await firstTile.click();
      await page.waitForTimeout(800);
    }
    const continueMedia = page.locator('#btnmediaselect').first();
    if (await continueMedia.isVisible().catch(() => false)) {
      await continueMedia.click();
      await page.waitForTimeout(1500);
    }
    steps.push(await captureStep(page, 'After Media Type Selection', sessionDir, '04-after-media', networkCalls, currentPhase));
  } else {
    steps.push({
      step: 'Step 3 — Media Type Tiles',
      screenshot: 'NOT_PRESENT',
      fields: [], buttons: [], tiles: [],
      dropdowns: {}, networkCalls: [],
      conditionals: { mediaTypeStep: false },
      rawText: ['[Media Type step not present for this session]'],
    });
  }

  // ── Step 4: Activity form ──────────────────────────────────────────
  currentPhase.value = 'step4-activity';
  steps.push(await captureStep(page, 'Step 4 — Activity Form', sessionDir, '05-activity-form', networkCalls, currentPhase));

  // ── Step 4b: Scroll to bottom to reveal all conditional sections ───
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  steps.push(await captureStep(page, 'Step 4 — Activity Form (scrolled)', sessionDir, '06-activity-form-scrolled', networkCalls, currentPhase));

  return {
    sessionId,
    portal:       session.portal,
    dealer:       session.dealer,
    baseUrl,
    capturedAt:   new Date().toISOString(),
    featureFlags,
    steps,
    errors,
  };
}

// ── Report generator ───────────────────────────────────────────────────────────
function generateReport(results: SessionResult[]): string {
  const sessionIds = results.map(r => r.sessionId);

  // Build flag comparison matrix
  const allFlags = new Map<string, Map<string, string>>();   // flag_key → sessionId → active_flag
  for (const r of results) {
    for (const f of r.featureFlags) {
      if (!allFlags.has(f.feature_key)) allFlags.set(f.feature_key, new Map());
      allFlags.get(f.feature_key)!.set(r.sessionId, f.active_flag);
    }
  }

  // Build wizard step matrix — which conditionals were present per session
  const conditionalKeys = [
    'mediaTypeStep', 'dealerTypeDropdown', 'productLinesBlock', 'vendorInfoBlock',
    'preApprovalInput', 'invoiceUpload', 'budgetDisplay', 'multiCurrencyToggle',
    'coopOcrSection', 'recentActivitiesSection',
  ];
  const conditionalMatrix = new Map<string, Map<string, boolean>>();
  for (const key of conditionalKeys) {
    conditionalMatrix.set(key, new Map());
    for (const r of results) {
      const found = r.steps.flatMap(s => s.conditionals[key] ? [true] : [false]);
      conditionalMatrix.get(key)!.set(r.sessionId, found.some(Boolean));
    }
  }

  // Build ClientProfile recommendations
  const recommendations: string[] = [];
  for (const r of results) {
    const mediaStep = r.steps.flatMap(s => s.conditionals['mediaTypeStep'] ? [true] : []).some(Boolean);
    const dtDropdown = r.steps.flatMap(s => s.conditionals['dealerTypeDropdown'] ? [true] : []).some(Boolean);
    const prodLines = r.steps.flatMap(s => s.conditionals['productLinesBlock'] ? [true] : []).some(Boolean);
    const portal = r.portal === 'CertainTeed' ? 'certainteed' : 'demoportal';
    recommendations.push(JSON.stringify({
      client: portal,
      dealer: r.dealer,
      'featureProfiles.coop.submitClaim': {
        mediaTypeStepRequired:     mediaStep,
        dealerTypeDropdownVisible: dtDropdown,
        productLinesEnabled:       prodLines,
      },
    }, null, 2));
  }

  const badge = (val: string | boolean) => {
    if (val === 'Y' || val === true)  return `<span class="on">On</span>`;
    if (val === 'N' || val === false) return `<span class="off">Off</span>`;
    return `<span class="unknown">—</span>`;
  };

  const diff = (vals: string[]) => {
    const unique = [...new Set(vals)];
    return unique.length > 1 ? ' diff' : '';
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Coop Submit Claim — Multi-Client Analysis</title>
<style>
  body{font-family:'Segoe UI',sans-serif;font-size:13px;background:#f8fafc;color:#1e293b;margin:0;padding:20px}
  h1{font-size:20px;font-weight:700;color:#1e40af;margin-bottom:4px}
  .meta{color:#64748b;font-size:11px;margin-bottom:24px}
  h2{font-size:15px;font-weight:700;color:#1e293b;margin:28px 0 10px;border-bottom:2px solid #e2e8f0;padding-bottom:6px}
  table{width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);margin-bottom:20px}
  th{background:#1e40af;color:#fff;padding:8px 12px;text-align:left;font-size:11px;font-weight:600;letter-spacing:.04em}
  td{padding:8px 12px;border-bottom:1px solid #e2e8f0;vertical-align:top}
  tr:last-child td{border-bottom:none}
  tr:hover td{background:#f0f4ff}
  .on{background:rgba(22,163,74,.15);color:#166534;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600}
  .off{background:rgba(239,68,68,.12);color:#991b1b;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600}
  .unknown{color:#94a3b8;font-size:11px}
  .diff{background:#fef9c3}
  pre{background:#1e293b;color:#e2e8f0;padding:16px;border-radius:6px;font-size:11px;overflow-x:auto}
  .session-header{background:#eff6ff;border-left:4px solid #1e40af;padding:10px 14px;margin:16px 0 8px;border-radius:0 6px 6px 0}
  .session-header strong{color:#1e40af}
  .error{background:#fee2e2;border-left:4px solid #dc2626;padding:8px 12px;border-radius:0 6px 6px 0;margin:4px 0;font-size:12px}
  .section{background:#fff;border-radius:8px;padding:16px 20px;box-shadow:0 1px 3px rgba(0,0,0,.08);margin-bottom:20px}
</style>
</head>
<body>
<h1>Coop — Submit Claim — Multi-Client UI Analysis</h1>
<div class="meta">
  Generated: ${new Date().toISOString()} &nbsp;·&nbsp;
  Sessions: ${results.map(r => `${r.portal} / ${r.dealer}`).join(' | ')} &nbsp;·&nbsp;
  Feature: /CoopManagement/Claims/Submit/SubmitClaim
</div>

<h2>1 — Wizard Step Presence Matrix</h2>
<table>
  <thead>
    <tr>
      <th>Conditional Element</th>
      ${sessionIds.map(id => `<th>${id.replace('-', '<br/>')}</th>`).join('')}
      <th>Difference?</th>
    </tr>
  </thead>
  <tbody>
    ${conditionalKeys.map(key => {
      const vals = sessionIds.map(id => conditionalMatrix.get(key)?.get(id) ?? false);
      const rowDiff = [...new Set(vals)].length > 1 ? ' diff' : '';
      return `<tr class="${rowDiff}">
        <td><code>${key}</code></td>
        ${vals.map(v => `<td>${badge(v)}</td>`).join('')}
        <td>${rowDiff ? '⚠ Yes' : '—'}</td>
      </tr>`;
    }).join('')}
  </tbody>
</table>

<h2>2 — Feature Flag Matrix (Coop module)</h2>
${allFlags.size === 0
  ? '<div class="section"><em>Feature flags could not be fetched — dealer role may not have access to /Admin/Feature/FeatureList. Run with an admin account to populate this section.</em></div>'
  : `<table>
  <thead>
    <tr>
      <th>Feature Key</th>
      ${sessionIds.map(id => `<th>${id.replace('-', '<br/>')}</th>`).join('')}
      <th>Difference?</th>
    </tr>
  </thead>
  <tbody>
    ${[...allFlags.entries()].map(([key, sessionMap]) => {
      const vals = sessionIds.map(id => sessionMap.get(id) ?? '—');
      const rowDiff = [...new Set(vals.filter(v => v !== '—'))].length > 1 ? ' diff' : '';
      return `<tr class="${rowDiff}">
        <td><code>${key}</code></td>
        ${vals.map(v => `<td>${badge(v)}</td>`).join('')}
        <td>${rowDiff ? '⚠ Yes' : '—'}</td>
      </tr>`;
    }).join('')}
  </tbody>
</table>`}

<h2>3 — Field Inventory per Session</h2>
${results.map(r => `
<div class="session-header"><strong>${r.portal} — ${r.dealer}</strong> &nbsp;|&nbsp; ${r.baseUrl} &nbsp;|&nbsp; ${r.capturedAt}</div>
${r.errors.map(e => `<div class="error">⚠ ${e}</div>`).join('')}
${r.steps.filter(s => s.screenshot !== 'NOT_PRESENT').map(s => `
<div class="section">
  <strong>${s.step}</strong>
  <table>
    <thead><tr><th>Field ID</th><th>Label</th><th>Type</th><th>Required</th><th>Visible</th><th>MaxLength</th></tr></thead>
    <tbody>
      ${s.fields.filter(f => f.visible).map(f => `
      <tr>
        <td><code>${f.id || '—'}</code></td>
        <td>${f.label || '—'}</td>
        <td>${f.tagName}${f.type ? `[${f.type}]` : ''}</td>
        <td>${f.required ? '✅ Yes' : 'No'}</td>
        <td>${f.visible ? '✅' : '—'}</td>
        <td>${f.maxlength || '—'}</td>
      </tr>`).join('')}
      ${s.fields.filter(f => f.visible).length === 0 ? '<tr><td colspan="6"><em>No visible input fields</em></td></tr>' : ''}
    </tbody>
  </table>
  ${s.tiles.length ? `<p><strong>Media Tiles:</strong> ${s.tiles.join(', ')}</p>` : ''}
  ${Object.entries(s.dropdowns).filter(([,v]) => v.length > 0).map(([k,v]) => `<p><strong>${k}:</strong> ${v.join(', ')}</p>`).join('')}
</div>`).join('')}
`).join('')}

<h2>4 — ClientProfile Recommendations</h2>
<p>Based on observed UI differences, add the following to <code>config/clients/{clientId}.json</code>:</p>
${recommendations.map(r => `<pre>${r}</pre>`).join('')}

<h2>5 — Network Calls per Session</h2>
${results.map(r => `
<div class="session-header"><strong>${r.portal} — ${r.dealer}</strong></div>
<table>
  <thead><tr><th>Phase</th><th>Method</th><th>Path</th><th>Status</th></tr></thead>
  <tbody>
    ${r.steps.flatMap(s => s.networkCalls
      .filter(n => n.path.includes('Coop') || n.path.includes('Claim') || n.path.includes('Feature'))
      .map(n => `<tr>
        <td>${n.phase}</td>
        <td>${n.method}</td>
        <td><code>${n.path}</code></td>
        <td>${n.status ?? '—'}</td>
      </tr>`)
    ).join('')}
  </tbody>
</table>`).join('')}
</body>
</html>`;
}

// ── Shared results store (populated across test runs) ─────────────────────────
const allResults: SessionResult[] = [];

// ── Test: DemoPortal UAT — Dealer 1 ───────────────────────────────────────────
test('DemoPortal UAT — Dealer 1 — Submit Claim Analysis', async ({ page, baseURL }) => {
  const result = await runSession(page, 'demoportal-dealer1', baseURL ?? '');
  allResults.push(result);
  fs.writeFileSync(
    path.join(REPORTS_ROOT, 'demoportal-dealer1', 'result.json'),
    JSON.stringify(result, null, 2)
  );
  console.log(`[demoportal-dealer1] Captured ${result.steps.length} steps, ${result.featureFlags.length} feature flags`);
  expect(result.errors.length).toBe(0);
});

// ── Test: DemoPortal UAT — Dealer 2 ───────────────────────────────────────────
test('DemoPortal UAT — Dealer 2 — Submit Claim Analysis', async ({ page, baseURL }) => {
  const result = await runSession(page, 'demoportal-dealer2', baseURL ?? '');
  allResults.push(result);
  fs.writeFileSync(
    path.join(REPORTS_ROOT, 'demoportal-dealer2', 'result.json'),
    JSON.stringify(result, null, 2)
  );
  console.log(`[demoportal-dealer2] Captured ${result.steps.length} steps, ${result.featureFlags.length} feature flags`);
  expect(result.errors.length).toBe(0);
});

// ── Test: CertainTeed UAT — Dealer 1 ──────────────────────────────────────────
test('CertainTeed UAT — Dealer 1 — Submit Claim Analysis', async ({ page, baseURL }) => {
  const result = await runSession(page, 'certainteed-dealer1', baseURL ?? '');
  allResults.push(result);
  fs.writeFileSync(
    path.join(REPORTS_ROOT, 'certainteed-dealer1', 'result.json'),
    JSON.stringify(result, null, 2)
  );
  console.log(`[certainteed-dealer1] Captured ${result.steps.length} steps, ${result.featureFlags.length} feature flags`);
  expect(result.errors.length).toBe(0);
});

// ── Test: CertainTeed UAT — Dealer 2 ──────────────────────────────────────────
test('CertainTeed UAT — Dealer 2 — Submit Claim Analysis', async ({ page, baseURL }) => {
  const result = await runSession(page, 'certainteed-dealer2', baseURL ?? '');
  allResults.push(result);
  fs.writeFileSync(
    path.join(REPORTS_ROOT, 'certainteed-dealer2', 'result.json'),
    JSON.stringify(result, null, 2)
  );
  console.log(`[certainteed-dealer2] Captured ${result.steps.length} steps, ${result.featureFlags.length} feature flags`);
  expect(result.errors.length).toBe(0);
});

// ── After all: generate consolidated HTML report ───────────────────────────────
test.afterAll(async () => {
  if (allResults.length === 0) {
    console.warn('[report] No sessions completed — skipping HTML report generation');
    return;
  }

  // Load any sessions that ran in other workers / earlier runs from JSON
  const sessionIds = ['demoportal-dealer1', 'demoportal-dealer2', 'certainteed-dealer1', 'certainteed-dealer2'];
  const merged = [...allResults];
  for (const id of sessionIds) {
    if (merged.find(r => r.sessionId === id)) continue;
    const file = path.join(REPORTS_ROOT, id, 'result.json');
    if (fs.existsSync(file)) {
      try { merged.push(JSON.parse(fs.readFileSync(file, 'utf8'))); } catch { /* skip */ }
    }
  }

  const html = generateReport(merged);
  fs.mkdirSync(path.dirname(REPORT_OUT), { recursive: true });
  fs.writeFileSync(REPORT_OUT, html, 'utf8');
  console.log(`\n[report] Multi-client analysis written to:\n  ${REPORT_OUT}`);
});
