# ============================================================
#  EngageAds - Interactive Test Runner
#  Requires Windows PowerShell 5.1+ (powershell.exe)
#  Usage:  npm run engage-ads
#  OR:     powershell -ExecutionPolicy Bypass -File scripts/run-engage-ads.ps1
# ============================================================

# Note: StrictMode is intentionally NOT set at Latest here because npx.ps1
# (the Node.js npm runner) accesses $MyInvocation.Statement which does not
# exist in older PowerShell versions and causes a hard error under Latest mode.
$ErrorActionPreference = 'Stop'
$RootDir = Split-Path $PSScriptRoot -Parent

function Write-Header {
    param([string]$text)
    Write-Host ""
    Write-Host "  +---------------------------------------------+" -ForegroundColor Cyan
    Write-Host ("  |  {0,-43}|" -f $text) -ForegroundColor Cyan
    Write-Host "  +---------------------------------------------+" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Menu {
    param([string]$title, [string[]]$options)
    Write-Host "  $title" -ForegroundColor Yellow
    Write-Host ""
    for ($i = 0; $i -lt $options.Count; $i++) {
        Write-Host ("  [{0}]  {1}" -f ($i + 1), $options[$i]) -ForegroundColor White
    }
    Write-Host ""
    $idx = 0
    do {
        $raw = Read-Host "  Enter number"
        $idx = $raw -as [int]
    } while ($null -eq $idx -or $idx -lt 1 -or $idx -gt $options.Count)
    return $options[$idx - 1]
}

function Read-MaskedInput {
    param([string]$prompt)
    $secure = Read-Host $prompt -AsSecureString
    $bstr   = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    $plain  = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    return $plain
}

function Load-EnvFile {
    param([string]$envFile)
    $vals = @{}
    if (Test-Path $envFile) {
        Get-Content $envFile | Where-Object { $_ -match '^\s*[^#]\S+=\S*' } | ForEach-Object {
            $parts = $_ -split '=', 2
            $vals[$parts[0].Trim()] = $parts[1].Trim()
        }
    }
    return $vals
}

# ---- STEP 1 : Environment -----------------------------------
Clear-Host
Write-Header "EngageAds - Interactive Test Runner"

$envChoice = Show-Menu "Which environment do you want to test?" @(
    "Production  (demoportal.channel-fusion.com)"
    "UAT         (demoportaluat.channel-fusion.com)"
    "Testing     (demoportaltest.channel-fusion.com)"
    "Dev         (demoportaldev.channel-fusion.com)"
)

$envMap = @{
    "Production  (demoportal.channel-fusion.com)"     = @{ key = "production"; file = ".env.production" }
    "UAT         (demoportaluat.channel-fusion.com)"  = @{ key = "uat";        file = ".env.uat" }
    "Testing     (demoportaltest.channel-fusion.com)" = @{ key = "testing";    file = ".env.testing" }
    "Dev         (demoportaldev.channel-fusion.com)"  = @{ key = "dev";        file = ".env.dev" }
}

$sel         = $envMap[$envChoice]
$testEnvKey  = $sel.key
$envFileName = $sel.file
$envFilePath = Join-Path $RootDir $envFileName

if (-not (Test-Path $envFilePath)) {
    Write-Host "  ERROR: $envFilePath not found." -ForegroundColor Red
    exit 1
}

$envVars = Load-EnvFile $envFilePath

# ---- STEP 2 : Credentials -----------------------------------
Write-Host ""
$credChoice = Show-Menu "Dealer credentials to use for login:" @(
    "Use credentials from $envFileName"
    "Enter my own credentials (will NOT be saved)"
)

if ($credChoice -like "Use credentials*") {
    $testEmail    = $envVars['TEST_USER_EMAIL']
    $testPassword = $envVars['TEST_USER_PASSWORD']
    Write-Host ""
    Write-Host "  Username : $testEmail" -ForegroundColor DarkGray
    Write-Host "  Password : ********" -ForegroundColor DarkGray
} else {
    Write-Host ""
    $testEmail    = Read-Host "  Username"
    $testPassword = Read-MaskedInput "  Password"
}

# ---- STEP 3 : Feature / Page --------------------------------
Write-Host ""
$featureChoice = Show-Menu "Which feature do you want to test?" @(
    "All features          - Run everything"
    "Campaign Setup        - feature-campaign-setup"
    "View Package          - feature-view-package"
    "Order History         - feature-order-history"
)

$featurePathMap = @{
    "All features          - Run everything"         = "tests/playwright/specs/engage-ads/"
    "Campaign Setup        - feature-campaign-setup" = "tests/playwright/specs/engage-ads/feature-campaign-setup/"
    "View Package          - feature-view-package"   = "tests/playwright/specs/engage-ads/feature-view-package/"
    "Order History         - feature-order-history"  = "tests/playwright/specs/engage-ads/feature-order-history/"
}
$featurePath = $featurePathMap[$featureChoice]

# ---- STEP 4 : Test suite ------------------------------------
Write-Host ""
$suiteChoice = Show-Menu "Which test suite do you want to run?" @(
    "@smoke      - Critical path only (fast)"
    "@regression - Full functional coverage"
    "@e2e        - End-to-end flows"
    "All tests   - Everything (no tag filter)"
)

$grepArg = switch ($suiteChoice) {
    "@smoke      - Critical path only (fast)" { "--grep @smoke" }
    "@regression - Full functional coverage"  { "--grep @regression" }
    "@e2e        - End-to-end flows"          { "--grep @e2e" }
    default                                   { "" }
}

# ---- STEP 4.5 : OrderSeq — only for Campaign Setup ----------
$campaignOrderSeq = ""
$isCampaignSetup = $featureChoice -like "*Campaign Setup*" -or $featureChoice -like "*All features*"
if ($isCampaignSetup) {
    Write-Host ""
    Write-Host "  CampaignSetup OrderSeq (required for wizard tests):" -ForegroundColor Yellow
    Write-Host "  Encrypted order sequence to open the Campaign Setup wizard." -ForegroundColor DarkGray
    Write-Host "  Type 'skip' to run only non-wizard tests (auth, validation, etc.)." -ForegroundColor DarkGray
    Write-Host ""
    do {
        $campaignOrderSeq = (Read-Host "  OrderSeq").Trim()
        if (-not $campaignOrderSeq) {
            Write-Host "  [!] OrderSeq cannot be blank. Enter the encrypted value or type 'skip'." -ForegroundColor Red
        }
    } while (-not $campaignOrderSeq)

    if ($campaignOrderSeq -eq 'skip') {
        $campaignOrderSeq = ""
        Write-Host "  [i] Skipped - wizard tests will be bypassed." -ForegroundColor DarkYellow
    } else {
        Write-Host "  [OK] OrderSeq accepted." -ForegroundColor Green
    }
}

# ---- STEP 4 : Browser mode ----------------------------------
Write-Host ""
$headedChoice = Show-Menu "Browser mode:" @(
    "Headless - background (faster)"
    "Headed   - show browser window"
)
$headedArg = if ($headedChoice -like "Headed*") { "--headed" } else { "" }

# ---- Summary + Confirmation ---------------------------------
$orderSeqDisplay = if ($campaignOrderSeq) { $campaignOrderSeq } else { "(not provided - wizard tests will skip)" }
Write-Host ""
Write-Host "  ---------------------------------------------" -ForegroundColor DarkGray
Write-Host "  Environment  : $testEnvKey" -ForegroundColor White
Write-Host "  Env file     : $envFileName" -ForegroundColor White
Write-Host "  Username     : $testEmail" -ForegroundColor White
Write-Host "  Password     : ********" -ForegroundColor White
Write-Host "  Feature      : $featureChoice" -ForegroundColor White
Write-Host "  Suite        : $suiteChoice" -ForegroundColor White
if ($isCampaignSetup) {
    Write-Host "  OrderSeq     : $orderSeqDisplay" -ForegroundColor White
}
Write-Host "  Browser mode : $headedChoice" -ForegroundColor White
Write-Host "  ---------------------------------------------" -ForegroundColor DarkGray
Write-Host ""

$go = Show-Menu "Ready to run?" @(
    "Yes - start the tests"
    "No  - cancel"
)

if ($go -like "No*") {
    Write-Host "  Cancelled." -ForegroundColor Yellow
    exit 0
}

# ---- Inject env vars (in-process only, no file writes) ------
$env:TEST_ENV            = $testEnvKey
$env:BASE_URL            = $envVars['BASE_URL']
$env:API_BASE_URL        = $envVars['API_BASE_URL']
$env:TEST_USER_EMAIL     = $testEmail
$env:TEST_USER_PASSWORD  = $testPassword
$env:ADMIN_EMAIL         = $envVars['ADMIN_EMAIL']
$env:ADMIN_PASSWORD      = $envVars['ADMIN_PASSWORD']
$env:ADMIN_USER_EMAIL     = $envVars['ADMIN_USER_EMAIL']
$env:ADMIN_USER_PASSWORD  = $envVars['ADMIN_USER_PASSWORD']
if ($campaignOrderSeq) {
    $env:CAMPAIGN_ORDER_SEQ = $campaignOrderSeq
} else {
    Remove-Item Env:CAMPAIGN_ORDER_SEQ -ErrorAction SilentlyContinue
}

# ---- Clear cached auth when custom credentials are chosen ------
# Playwright skips the setup project entirely when .auth/user.json already
# exists, so custom credentials would never be used without deleting it first.
if ($credChoice -like "Enter my own*") {
    $authFile  = Join-Path $RootDir "tests\playwright\fixtures\.auth\user.json"
    $adminFile = Join-Path $RootDir "tests\playwright\fixtures\.auth\admin.json"
    if (Test-Path $authFile) {
        Remove-Item $authFile -Force
        Write-Host "  Cleared cached dealer auth (will re-authenticate with custom credentials)." -ForegroundColor DarkYellow
    }
    if (Test-Path $adminFile) {
        Remove-Item $adminFile -Force
        Write-Host "  Cleared cached admin auth." -ForegroundColor DarkYellow
    }
}

# ---- Run Playwright (in-process so headed browser is visible) ----
Write-Host ""
Write-Host "  Starting Playwright..." -ForegroundColor Cyan
Write-Host ""

Set-Location $RootDir

$cmdParts = @($featurePath, "--project=chromium")
if ($grepArg)   { $cmdParts += $grepArg.Split(' ') }
if ($headedArg) { $cmdParts += $headedArg }

# Use the local Playwright binary directly (bypasses npx.ps1 resolution issues on Windows).
# The call operator (&) keeps the process in-session so --headed opens a visible browser.
$playwrightBin = Join-Path $RootDir "node_modules\.bin\playwright.cmd"
& $playwrightBin test @cmdParts
$exitCode = $LASTEXITCODE

Write-Host ""
if ($exitCode -eq 0) {
    Write-Host "  All tests passed!" -ForegroundColor Green
} else {
    Write-Host "  Some tests failed. Run: npm run report" -ForegroundColor Red
}

# ---- Clean up credentials from this session -----------------
Remove-Item Env:TEST_USER_EMAIL    -ErrorAction SilentlyContinue
Remove-Item Env:TEST_USER_PASSWORD -ErrorAction SilentlyContinue
Write-Host ""