<#
.SYNOPSIS
    Scaffold a new module or add a feature to an existing module for a specific client.

.PARAMETER Client
    Client ID in kebab-case (e.g. "demoportal", "certainteed", "samsung").
    Determines which client folder the feature is created under.

.PARAMETER Module
    Module name in kebab-case (e.g. "coop", "rebate", "rewards").

.PARAMETER Feature
    Feature name in kebab-case (e.g. "submit-claim", "submit-preapproval").

.PARAMETER Label
    Human-readable label for the feature (e.g. "Submit Claim"). Used in generated file headers.

.EXAMPLE
    .\scripts\new-module.ps1 -Client certainteed -Module rebate -Feature submit-rebate -Label "Submit Rebate"

.EXAMPLE
    .\scripts\new-module.ps1 -Client demoportal -Module coop -Feature submit-preapproval -Label "Submit Preapproval"
#>

param(
    [Parameter(Mandatory)][string]$Client,
    [Parameter(Mandatory)][string]$Module,
    [Parameter(Mandatory)][string]$Feature,
    [Parameter(Mandatory)][string]$Label
)

$root      = $PSScriptRoot | Split-Path
$templates = "$root\templates"
$modLabel  = (Get-Culture).TextInfo.ToTitleCase($Module)
$modUpper  = $Module.ToUpper() -replace '-', '_'

function New-Dir($path) {
    New-Item -ItemType Directory -Force -Path $path | Out-Null
}

function Copy-Template($src, $dst) {
    $content = Get-Content $src -Raw
    $content = $content `
        -replace '\{\{MODULE\}\}',       $Module `
        -replace '\{\{FEATURE\}\}',      $Feature `
        -replace '\{\{MODULE_LABEL\}\}', $modLabel `
        -replace '\{\{FEATURE_LABEL\}\}',$Label `
        -replace '\{\{MODULE_UPPER\}\}', $modUpper `
        -replace '\{\{TABLE_NAME\}\}',   'TableName'
    New-Dir (Split-Path $dst)
    Set-Content -Path $dst -Value $content -Encoding utf8
    Write-Host "  created  $($dst.Replace($root, ''))"
}

Write-Host ""
Write-Host "Scaffolding client=$Client  module=$Module  feature=$Feature  label=`"$Label`""
Write-Host "---------------------------------------------------------"

# -- Playwright spec -----------------------------------------
Copy-Template `
    "$templates\feature-spec.ts" `
    "$root\tests\playwright\specs\$Client\$Module\feature-$Feature\$Feature.spec.ts"

# -- Page object ---------------------------------------------
$pageClass = (Get-Culture).TextInfo.ToTitleCase($Feature) -replace '-', ''
$pageFile  = "$root\tests\playwright\pages\$Client\$Module\feature-$Feature\${pageClass}Page.ts"
$pageSrc   = Get-Content "$templates\FeaturePage.ts" -Raw
$pageSrc   = $pageSrc `
    -replace '\{\{MODULE\}\}',  $Module `
    -replace '\{\{FEATURE\}\}', $Feature `
    -replace 'FeaturePage',     "${pageClass}Page"
New-Dir (Split-Path $pageFile)
Set-Content -Path $pageFile -Value $pageSrc -Encoding utf8
Write-Host "  created  $($pageFile.Replace($root, ''))"

# Fix spec import to use the real page class name
$specFile    = "$root\tests\playwright\specs\$Client\$Module\feature-$Feature\$Feature.spec.ts"
$specContent = Get-Content $specFile -Raw
$specContent = $specContent `
    -replace 'FeaturePage',  "${pageClass}Page" `
    -replace 'featurePage',  "$(([string][char]::ToLower($pageClass[0])) + $pageClass.Substring(1))Page"
Set-Content -Path $specFile -Value $specContent -Encoding utf8

# -- Helpers stub ---------------------------------------------
$helpersFile = "$root\tests\playwright\helpers\$Client\$Module\feature-$Feature\$Feature.helpers.ts"
New-Dir (Split-Path $helpersFile)
$helpersSrc = @"
import { type Page } from '@playwright/test';
import { ${pageClass}Page } from '../../../pages/$Client/$Module/feature-$Feature/${pageClass}Page';
import testData from '../../../data/$Client/$Module/feature-$Feature/test-data.json';

export async function goTo${pageClass}(page: Page): Promise<${pageClass}Page> {
  const featurePage = new ${pageClass}Page(page);
  await featurePage.navigate();
  return featurePage;
}

// TODO: add multi-step setup helpers used by 2+ tests
"@
Set-Content -Path $helpersFile -Value $helpersSrc -Encoding utf8
Write-Host "  created  $($helpersFile.Replace($root, ''))"

# -- Test data ------------------------------------------------
Copy-Template `
    "$templates\test-data.json" `
    "$root\tests\playwright\data\$Client\$Module\feature-$Feature\test-data.json"

# -- API spec -------------------------------------------------
Copy-Template `
    "$templates\feature-api.spec.ts" `
    "$root\tests\api\$Client\$Module\feature-$Feature\$Feature.api.spec.ts"

# -- Database script -------------------------------------------
Copy-Template `
    "$templates\verify-records.sql" `
    "$root\tests\database\$Client\$Module\feature-$Feature\verify-records.sql"

# -- Docs & Reports stubs --------------------------------------
$docFolders = @(
    "docs\migration-reports\$Client\$Module\feature-$Feature",
    "docs\module-analysis\$Client\$Module\feature-$Feature",
    "reports\readiness\$Client\$Module\feature-$Feature",
    "reports\test-results\$Client\$Module\feature-$Feature"
)
foreach ($d in $docFolders) {
    New-Dir "$root\$d"
    Write-Host "  created  \$d"
}

# -- Functional catalog HTML placeholder ----------------------
$catalogDir  = "$root\docs\functional-catalogs\$Client\$Module\feature-$Feature"
$catalogFile = "$catalogDir\functional-units.html"
New-Dir $catalogDir
$catalogHtml = ('<!DOCTYPE html>' + "`n" +
'<html lang="en">' + "`n" +
'<head>' + "`n" +
'  <meta charset="UTF-8" />' + "`n" +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0" />' + "`n" +
"  <title>$Label - Functional Unit Catalog</title>" + "`n" +
'  <style>' + "`n" +
'    body { font-family: system-ui, sans-serif; max-width: 700px; margin: 60px auto; padding: 0 20px; color: #374151; }' + "`n" +
'    h1   { font-size: 1.4rem; margin-bottom: 4px; }' + "`n" +
'    p    { color: #6b7280; font-size: 0.9rem; line-height: 1.6; }' + "`n" +
'    code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 0.85rem; }' + "`n" +
'    .badge { display:inline-block; background:#fef3c7; color:#92400e; border:1px solid #fcd34d; border-radius:4px; padding:2px 8px; font-size:0.75rem; font-weight:600; margin-bottom:16px; }' + "`n" +
'  </style>' + "`n" +
'</head>' + "`n" +
'<body>' + "`n" +
'  <span class="badge">Catalog Not Yet Generated</span>' + "`n" +
"  <h1>$Label</h1>" + "`n" +
"  <p>Module: <code>$Module</code> &#x7c; Feature: <code>$Feature</code> &#x7c; Client: <code>$Client</code></p>" + "`n" +
'  <p>This catalog has not been generated yet. Run the <strong>functional-test-catalog</strong> skill in GitHub Copilot to populate this file:</p>' + "`n" +
"  <p><code>@workspace generate functional test catalog for client=$Client module=$Module feature=$Feature</code></p>" + "`n" +
'</body>' + "`n" +
'</html>')
Set-Content -Path $catalogFile -Value $catalogHtml -Encoding utf8
Write-Host "  created  $($catalogFile.Replace($root, ''))"

Write-Host "---------------------------------------------------------"
Write-Host "Done. Next steps:"
Write-Host "  1. Fill in test-data.json with real test values"
Write-Host "  2. Replace locators in ${pageClass}Page.ts"
Write-Host "  3. Implement TODO blocks in $Feature.spec.ts"
Write-Host "  4. Generate catalog: run functional-test-catalog skill for client=$Client module=$Module feature=$Feature"
Write-Host ""
