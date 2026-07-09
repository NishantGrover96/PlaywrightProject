#Requires -Version 5.1
# Migrates all functional-catalog HTML files to Bootstrap 5.
# - Placeholder files (< 2KB): replaced wholesale with BS5 "not yet generated" page
# - Content files: style block removed, BS5 CDN injected, table classes added

param([string]$CatalogRoot = "$PSScriptRoot\..\docs\functional-catalogs")

$utf8NoBom   = [System.Text.UTF8Encoding]::new($false)
$bs5CdnCss   = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'
$bs5CdnJs    = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'

$bs5Inject = @"
  <link rel="stylesheet" href="$bs5CdnCss" crossorigin="anonymous">
  <script src="$bs5CdnJs" crossorigin="anonymous" defer></script>
  <style>
    .tier-smoke      { background:#dbeafe; color:#1d4ed8; }
    .tier-regression { background:#ede9fe; color:#6d28d9; }
    .tier-e2e        { background:#d1fae5; color:#065f46; }
    .priority-p1     { background:#fee2e2; color:#991b1b; }
    .priority-p2     { background:#fef3c7; color:#92400e; }
    .priority-p3     { background:#e0f2fe; color:#0369a1; }
    .priority-p4     { background:#f0fdf4; color:#166534; }
    .test-id         { font-family: monospace; font-weight: 700; white-space: nowrap; }
  </style>
"@

function Build-Placeholder {
    param([string]$Content)

    $titleM  = [regex]::Match($Content, '<title>([^<]+)</title>')
    $title   = if ($titleM.Success) { $titleM.Groups[1].Value } else { 'Functional Unit Catalog' }
    $h1M     = [regex]::Match($Content, '<h1[^>]*>([^<]+)</h1>')
    $h1      = if ($h1M.Success) { $h1M.Groups[1].Value.Trim() } else { $title }
    $codes   = [regex]::Matches($Content, '<code>([^<]+)</code>') | ForEach-Object { $_.Groups[1].Value }
    $mod     = if ($codes.Count -gt 0) { $codes[0] } else { '' }
    $feat    = if ($codes.Count -gt 1) { $codes[1] } else { '' }
    $cli     = if ($codes.Count -gt 2) { $codes[2] } else { '' }
    $cmd     = "@workspace generate functional test catalog for client=$cli module=$mod feature=$feat"

    return @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>$title</title>
  <link rel="stylesheet" href="$bs5CdnCss" crossorigin="anonymous">
  <script src="$bs5CdnJs" crossorigin="anonymous" defer></script>
</head>
<body class="bg-light">
<div class="bg-primary text-white px-4 py-3">
  <h1 class="h4 mb-0">$h1</h1>
</div>
<div class="container-fluid px-4 py-4">
  <div class="alert alert-warning" role="alert">
    <strong>Catalog Not Yet Generated</strong> &mdash; Run the <strong>functional-test-catalog</strong> Copilot skill to populate this file.
  </div>
  <div class="card">
    <div class="card-body">
      <dl class="row mb-0">
        <dt class="col-sm-3">Module</dt>  <dd class="col-sm-9"><code>$mod</code></dd>
        <dt class="col-sm-3">Feature</dt> <dd class="col-sm-9"><code>$feat</code></dd>
        <dt class="col-sm-3">Client</dt>  <dd class="col-sm-9"><code>$cli</code></dd>
        <dt class="col-sm-3">Command</dt> <dd class="col-sm-9"><code>$cmd</code></dd>
      </dl>
    </div>
  </div>
</div>
</body>
</html>
"@
}

function Patch-ContentFile {
    param([string]$Content)

    # 1. Remove existing <style> block(s)
    $c = $Content -replace '(?s)<style>.+?</style>', ''

    # 2. Remove any pre-existing Bootstrap CDN links (avoid duplicates)
    $c = $c -replace '(?i)\s*<link[^>]+bootstrap[^>]+>', ''
    $c = $c -replace '(?i)\s*<script[^>]+bootstrap[^>]+>\s*</script>', ''

    # 3. Inject BS5 CDN + minimal style overrides before </head>
    $c = $c -replace '</head>', "$bs5Inject`n</head>"

    # 4. Add Bootstrap table classes to bare <table> tags (no class attribute)
    $c = $c -replace '<table(?:\s*/)?>',              '<table class="table table-bordered table-striped table-hover table-sm align-middle">'
    $c = $c -replace '<table style="[^"]*">',         '<table class="table table-bordered table-striped table-hover table-sm align-middle">'

    # 5. Add table-dark to bare <thead> tags
    $c = $c -replace '<thead>',                       '<thead class="table-dark">'
    $c = $c -replace '<thead\s+valign="[^"]*">',      '<thead class="table-dark">'

    # 6. Wrap tables in table-responsive div (simple pass — no look-behind)
    $c = $c -replace '(<table class="table[^>]*>)',   '<div class="table-responsive">$1'
    $c = $c -replace '(</table>)',                    '$1</div>'

    return $c
}

# ── Main ──────────────────────────────────────────────────────────────────────
$files  = Get-ChildItem $CatalogRoot -Recurse -Filter '*.html'
$fixed  = 0
$skip   = 0

foreach ($f in $files) {
    $raw  = [System.IO.File]::ReadAllText($f.FullName)
    $size = $f.Length

    if ($raw -match 'bootstrap@5') {
        Write-Host "  SKIP (BS5):  $($f.FullName -replace '.*functional-catalogs\\', '')"
        $skip++
        continue
    }

    if ($size -lt 2000) {
        $out = Build-Placeholder -Content $raw
        Write-Host "  PLACEHOLDER: $($f.FullName -replace '.*functional-catalogs\\', '')"
    } else {
        $out = Patch-ContentFile -Content $raw
        Write-Host "  PATCHED:     $($f.FullName -replace '.*functional-catalogs\\', '')"
    }

    [System.IO.File]::WriteAllText($f.FullName, $out, $utf8NoBom)
    $fixed++
}

Write-Host ""
Write-Host "Bootstrap 5 migration complete: $fixed modified, $skip already BS5."
