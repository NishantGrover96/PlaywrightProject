<#
.SYNOPSIS
    Scaffold a new module or add a feature to an existing module.

.PARAMETER Module
    Module name in kebab-case (e.g. "coop", "rebate", "rewards").

.PARAMETER Feature
    Feature name in kebab-case (e.g. "submit-claim", "submit-preapproval").

.PARAMETER Label
    Human-readable label for the feature (e.g. "Submit Claim"). Used in generated file headers.

.EXAMPLE
    .\scripts\new-module.ps1 -Module rebate -Feature submit-rebate -Label "Submit Rebate"

.EXAMPLE
    .\scripts\new-module.ps1 -Module coop -Feature submit-preapproval -Label "Submit Preapproval"
#>

param(
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
Write-Host "Scaffolding module=$Module  feature=$Feature  label=`"$Label`""
Write-Host "---------------------------------------------------------"

# -- Playwright spec -----------------------------------------
Copy-Template `
    "$templates\feature-spec.ts" `
    "$root\tests\playwright\specs\$Module\feature-$Feature\$Feature.spec.ts"

# -- Page object ---------------------------------------------
$pageClass = (Get-Culture).TextInfo.ToTitleCase($Feature) -replace '-', ''
$pageFile  = "$root\tests\playwright\pages\$Module\feature-$Feature\${pageClass}Page.ts"
$pageSrc   = Get-Content "$templates\FeaturePage.ts" -Raw
$pageSrc   = $pageSrc `
    -replace '\{\{MODULE\}\}',  $Module `
    -replace '\{\{FEATURE\}\}', $Feature `
    -replace 'FeaturePage',     "${pageClass}Page"
New-Dir (Split-Path $pageFile)
Set-Content -Path $pageFile -Value $pageSrc -Encoding utf8
Write-Host "  created  $($pageFile.Replace($root, ''))"

# Fix spec import to use the real page class name
$specFile    = "$root\tests\playwright\specs\$Module\feature-$Feature\$Feature.spec.ts"
$specContent = Get-Content $specFile -Raw
$specContent = $specContent `
    -replace 'FeaturePage',  "${pageClass}Page" `
    -replace 'featurePage',  "$(([string][char]::ToLower($pageClass[0])) + $pageClass.Substring(1))Page"
Set-Content -Path $specFile -Value $specContent -Encoding utf8

# -- Helpers stub ---------------------------------------------
$helpersFile = "$root\tests\playwright\helpers\$Module\feature-$Feature\$Feature.helpers.ts"
New-Dir (Split-Path $helpersFile)
$helpersSrc = @"
import { type Page } from '@playwright/test';
import { ${pageClass}Page } from '../../../pages/$Module/feature-$Feature/${pageClass}Page';
import testData from '../../../data/$Module/feature-$Feature/test-data.json';

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
    "$root\tests\playwright\data\$Module\feature-$Feature\test-data.json"

# -- API spec -------------------------------------------------
Copy-Template `
    "$templates\feature-api.spec.ts" `
    "$root\tests\api\$Module\feature-$Feature\$Feature.api.spec.ts"

# -- Database script -------------------------------------------
Copy-Template `
    "$templates\verify-records.sql" `
    "$root\tests\database\$Module\feature-$Feature\verify-records.sql"

# -- Docs & Reports stubs --------------------------------------
$docFolders = @(
    "docs\functional-catalogs\$Module\feature-$Feature",
    "docs\migration-reports\$Module\feature-$Feature",
    "docs\module-analysis\$Module\feature-$Feature",
    "reports\comparison\$Module\feature-$Feature",
    "reports\readiness\$Module\feature-$Feature",
    "reports\smoke\$Module\feature-$Feature",
    "reports\regression\$Module\feature-$Feature",
    "reports\e2e\$Module\feature-$Feature"
)
foreach ($d in $docFolders) {
    New-Dir "$root\$d"
    Write-Host "  created  \$d"
}

Write-Host "---------------------------------------------------------"
Write-Host "Done. Next steps:"
Write-Host "  1. Fill in test-data.json with real test values"
Write-Host "  2. Replace locators in ${pageClass}Page.ts"
Write-Host "  3. Implement TODO blocks in $Feature.spec.ts"
Write-Host "  4. Add docs to docs\functional-catalogs\$Module\feature-$Feature"
Write-Host ""
