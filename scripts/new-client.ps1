<#
.SYNOPSIS
    Onboard a new client repository into the Playwright automation framework.

.DESCRIPTION
    Registers a new client by either using an existing local clone (Mode 1) or
    cloning a remote repository (Mode 2, Azure DevOps / Git URL).

    Creates all required config files, folder scaffolding, repo registry entry,
    catalog manifest stub, and functional catalog directory. Does NOT generate
    test files - that is done by the repo-analysis skill pipeline.

.EXAMPLE
    .\scripts\new-client.ps1

.NOTES
    Helper functions in this script (New-Dir, Read-ValidatedInput, Update-RepoRegistry,
    etc.) are designed to be dot-sourced by future maintenance scripts such as
    repo-sync.ps1.

    Backward compatible: does not modify any existing client configuration.
#>

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

# ==============================================================
# PATHS
# ==============================================================

$script:Root             = Split-Path $PSScriptRoot -Parent
$script:ClientsDir       = Join-Path $script:Root 'config\clients'
$script:UsersDir         = Join-Path $script:Root 'config\users'
$script:CatalogsDir      = Join-Path $script:Root 'dashboard\catalogs'
$script:DocsDir          = Join-Path $script:Root 'docs\functional-catalogs'
$script:PlaywrightDir    = Join-Path $script:Root 'tests\playwright\clients'
$script:ReposLocalJson   = Join-Path $script:Root 'config\repos.local.json'
$script:ExistingClientMode = $false   # set to $true by Get-ClientDetails when user keeps existing config

# ==============================================================
# DISPLAY HELPERS
# ==============================================================

function Write-Header([string]$Title) {
    Write-Host ''
    Write-Host ('=' * 62) -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host ('=' * 62) -ForegroundColor Cyan
    Write-Host ''
}

function Write-Step([string]$Message) {
    Write-Host "  >> $Message" -ForegroundColor Yellow
}

function Write-Done([string]$Message) {
    Write-Host "  [OK]   $Message" -ForegroundColor Green
}

function Write-Warn([string]$Message) {
    Write-Host "  [WARN] $Message" -ForegroundColor DarkYellow
}

function Write-Fail([string]$Message) {
    Write-Host ''
    Write-Host "  [ERROR] $Message" -ForegroundColor Red
    Write-Host ''
    exit 1
}

# ==============================================================
# INPUT HELPERS
# (Reusable - dot-source in repo-sync.ps1 etc.)
# ==============================================================

function Read-RequiredInput {
    <#
    .SYNOPSIS Prompt for a non-empty string, re-prompting until input is given.
    .PARAMETER Default Optional default value shown in brackets.
    #>
    param(
        [Parameter(Mandatory)][string]$Prompt,
        [string]$Default = ''
    )
    while ($true) {
        $display = if ($Default) { "$Prompt [$Default]" } else { $Prompt }
        $value   = (Read-Host "    $display").Trim()
        if (-not $value -and $Default) { return $Default }
        if ($value) { return $value }
        Write-Warn 'This field is required.'
    }
}

function Read-OptionalInput {
    <#
    .SYNOPSIS Prompt for an optional string. Returns empty string if skipped.
    #>
    param(
        [Parameter(Mandatory)][string]$Prompt
    )
    return (Read-Host "    $Prompt  (press Enter to skip)").Trim()
}

function Read-ValidatedInput {
    <#
    .SYNOPSIS Prompt for input, re-prompting until the Validator scriptblock returns $true.
    .NOTES    Validator is responsible for printing its own warnings when returning $false.
    #>
    param(
        [Parameter(Mandatory)][string]$Prompt,
        [Parameter(Mandatory)][scriptblock]$Validator,
        [string]$Default = ''
    )
    while ($true) {
        $value = Read-RequiredInput -Prompt $Prompt -Default $Default
        if (& $Validator $value) { return $value }
    }
}

function Read-OptionalUrl {
    <#
    .SYNOPSIS Prompt for an optional URL, validating format when provided.
    #>
    param([Parameter(Mandatory)][string]$Prompt)
    while ($true) {
        $value = (Read-Host "    $Prompt  (press Enter to skip)").Trim()
        if (-not $value) { return '' }
        if (Test-UrlFormat $value) { return $value }
        Write-Warn "Invalid URL. Must start with https:// or http://"
    }
}

function Read-YesNo {
    <#
    .SYNOPSIS Prompt for a Y/N answer, returning $true for Yes, $false for No.
    #>
    param(
        [Parameter(Mandatory)][string]$Prompt,
        [bool]$DefaultYes = $true
    )
    $hint = if ($DefaultYes) { 'Y/n' } else { 'y/N' }
    while ($true) {
        $raw = (Read-Host "    $Prompt [$hint]").Trim().ToLower()
        if (-not $raw) { return $DefaultYes }
        if ($raw -in 'y', 'yes') { return $true }
        if ($raw -in 'n', 'no')  { return $false }
        Write-Warn 'Please enter Y or N.'
    }
}

function Read-MenuChoice {
    <#
    .SYNOPSIS Display a numbered menu and return the 1-based index chosen.
    #>
    param(
        [Parameter(Mandatory)][string]$Prompt,
        [Parameter(Mandatory)][string[]]$Options
    )
    Write-Host ''
    Write-Host "    $Prompt" -ForegroundColor White
    for ($i = 0; $i -lt $Options.Count; $i++) {
        Write-Host "      $($i + 1).  $($Options[$i])"
    }
    while ($true) {
        $raw = (Read-Host "    Choice (1-$($Options.Count))").Trim()
        [int]$n = 0
        if ([int]::TryParse($raw, [ref]$n) -and $n -ge 1 -and $n -le $Options.Count) {
            return $n
        }
        Write-Warn "Please enter a number between 1 and $($Options.Count)."
    }
}

# ==============================================================
# VALIDATORS
# (Reusable - return $true/$false, print own warnings)
# ==============================================================

function Test-ClientIdFormat([string]$Id) {
    if ($Id -notmatch '^[a-z][a-z0-9]*(-[a-z0-9]+)*$') {
        Write-Warn "Client ID must be lowercase kebab-case: letters, numbers, hyphens only. Example: samsung, brp, acme-corp"
        return $false
    }
    return $true
}

function Test-UrlFormat([string]$Url) {
    if ($Url -notmatch '^https?://.+\..+') {
        Write-Warn "Invalid URL. Must start with https:// or http:// and include a domain."
        return $false
    }
    return $true
}

function Test-GitUrlFormat([string]$Url) {
    if ($Url -notmatch '^https?://' -and $Url -notmatch '^git@') {
        Write-Warn "Invalid Git URL. Must start with https:// or git@"
        return $false
    }
    return $true
}

function Test-LocalRepoPath([string]$Path) {
    if (-not (Test-Path $Path -PathType Container)) {
        Write-Warn "Path does not exist: $Path"
        return $false
    }
    if (-not (Test-Path (Join-Path $Path '.git') -PathType Container)) {
        Write-Warn "No .git directory found at: $Path - is this a Git repository?"
        return $false
    }
    return $true
}

# ==============================================================
# FILESYSTEM HELPERS
# (Reusable - dot-source in repo-sync.ps1 etc.)
# ==============================================================

function New-Dir([string]$Path) {
    <# Creates a directory (and any parents) silently. Idempotent. #>
    New-Item -ItemType Directory -Force -Path $Path | Out-Null
}

function New-GitKeep([string]$Dir) {
    <# Creates a .gitkeep so an empty directory is tracked by Git. #>
    $keepFile = Join-Path $Dir '.gitkeep'
    if (-not (Test-Path $keepFile)) {
        Set-Content -Path $keepFile -Value '' -Encoding utf8 -NoNewline
    }
}

function New-JsonFile {
    <#
    .SYNOPSIS Write a hashtable/PSObject to a UTF-8 JSON file, creating parent dirs.
    .NOTES    Existing file is overwritten - callers are responsible for confirming overwrites.
    #>
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][object]$Content
    )
    New-Dir (Split-Path $Path)
    $json = $Content | ConvertTo-Json -Depth 10
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($Path, $json, $utf8NoBom)
    Write-Done "Created  $($Path.Replace($script:Root, ''))"
}

# ==============================================================
# MODE 1 - USE EXISTING LOCAL REPO
# ==============================================================

function Get-LocalRepoInfo {
    Write-Header 'Repository Source — Existing Local Clone'

    $repoPath = Read-ValidatedInput `
        -Prompt 'Local repository path' `
        -Validator { param($p) Test-LocalRepoPath $p }

    # Resolve to absolute path, normalise separators
    $repoPath = (Resolve-Path $repoPath).Path

    Write-Host ''
    Write-Step 'Fetching available branches...'
    try {
        $branchList = (git -C $repoPath branch --format='%(refname:short)' 2>&1) |
                      Where-Object { $_ -notmatch 'warning|error|fatal' -and $_ } |
                      ForEach-Object { $_.Trim() }
        if ($branchList) {
            Write-Host "    Available local branches: $($branchList -join ', ')" -ForegroundColor DarkGray
        }
    } catch {
        Write-Warn 'Could not list branches - continuing.'
    }

    $branch = Read-ValidatedInput `
        -Prompt 'Branch name — enter ONE branch (e.g. main)' `
        -Validator {
            param($raw)
            if (-not $raw) { Write-Warn 'Branch name is required.'; return $false }

            # Strip any accidental comma-separated input — use the first token only
            $b = ($raw -split '[,\s]+' | Where-Object { $_ } | Select-Object -First 1).Trim()
            if ($b -ne $raw.Trim()) {
                Write-Host "    [INFO] Multiple values detected — using first token: '$b'" -ForegroundColor Cyan
            }

            # Accept if it exists locally
            $local = git -C $repoPath branch --list $b 2>&1
            if ($local -match [regex]::Escape($b)) {
                # Rewrite the variable so the returned value is the cleaned token
                Set-Variable -Name branch -Value $b -Scope 2
                return $true
            }

            # Accept if it exists remotely
            $remote = git -C $repoPath branch -r 2>&1 | Where-Object { $_ -match "/$b$" -or $_ -match "/$b\s" }
            if ($remote) {
                Set-Variable -Name branch -Value $b -Scope 2
                return $true
            }

            Write-Warn "Branch '$b' not found locally or remotely. Run 'git fetch' first if it's a remote branch."
            Write-Host "    Available local branches:" -ForegroundColor DarkGray
            git -C $repoPath branch --format='%(refname:short)' 2>$null | ForEach-Object { Write-Host "      $_" -ForegroundColor DarkGray }
            return $false
        }

    # Ensure branch holds the cleaned (first-token) value
    $branch = ($branch -split '[,\s]+' | Where-Object { $_ } | Select-Object -First 1).Trim()
    Write-Done "Branch '$branch' confirmed."

    return [ordered]@{
        localPath   = $repoPath
        branch      = $branch
        url         = ''
        cloned      = $false
        useExisting = $true
    }
}

# ==============================================================
# MODE 2 - CLONE REPOSITORY
# ==============================================================

function Invoke-CloneRepo {
    param([Parameter(Mandatory)][hashtable]$CloneInfo)

    Write-Step "Cloning '$($CloneInfo.repoName)' into '$($CloneInfo.targetPath)' (branch: $($CloneInfo.branch))..."
    Write-Host '    (You may be prompted for Git credentials)' -ForegroundColor DarkGray
    try {
        git clone --branch $CloneInfo.branch $CloneInfo.url $CloneInfo.targetPath 2>&1 |
            ForEach-Object { Write-Host "    $_" }
    } catch {
        Write-Fail "git clone threw an exception: $_"
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "git clone failed (exit $LASTEXITCODE). Check the URL, branch name, and credentials."
    }
    Write-Done 'Clone successful.'
}

function Get-CloneInputs {
    <#
    .SYNOPSIS Collects all inputs needed to clone a repo — does NOT clone yet.
              Returns a hashtable used later by Invoke-CloneRepo.
    #>
    Write-Header 'Repository Source — Clone from Azure DevOps / Git'

    $gitUrl = Read-ValidatedInput `
        -Prompt 'Azure DevOps / Git URL' `
        -Validator { param($u) Test-GitUrlFormat $u }

    $branch = Read-RequiredInput -Prompt 'Branch to clone (e.g. main, develop)' -Default 'main'

    $cloneRoot = Read-RequiredInput `
        -Prompt 'Clone destination parent folder (e.g. D:\Leads)' `
        -Default (Split-Path $script:Root -Parent)

    if (-not (Test-Path $cloneRoot -PathType Container)) {
        Write-Fail "Clone destination folder does not exist: $cloneRoot"
    }

    $repoName   = ($gitUrl -split '/')[-1] -replace '\.git$', ''
    $targetPath = Join-Path $cloneRoot $repoName
    $useExisting = $false

    if (Test-Path $targetPath) {
        Write-Warn "Folder already exists: $targetPath"
        $useExisting = Read-YesNo 'Use existing folder (skip clone)?' -DefaultYes $false
        if (-not $useExisting) {
            Write-Fail 'Aborted. Remove the folder or choose a different destination.'
        }
        Write-Done 'Will use existing folder (clone step will be skipped).'
    }

    return [ordered]@{
        localPath    = $targetPath
        branch       = $branch
        url          = $gitUrl
        repoName     = $repoName
        targetPath   = $targetPath
        cloned       = $false
        useExisting  = $useExisting
    }
}

# ==============================================================
# EXISTING CLIENT WIZARD
# ==============================================================

function Get-ExistingClientModules {
    param([string]$ClientId)
    # Source of truth is config file .modules array
    $configFile = Join-Path $script:ClientsDir "$ClientId.json"
    $cfg = Get-Content $configFile -Raw | ConvertFrom-Json
    # Support both .modules (array) and .featureFlags (object keys where value is true)
    if ($cfg.modules -and $cfg.modules.Count -gt 0) {
        return @($cfg.modules)
    }
    # Fall back to file system scan
    $catalogBase = Join-Path $script:DocsDir $ClientId
    if (Test-Path $catalogBase) {
        return @(Get-ChildItem $catalogBase -Directory | Select-Object -ExpandProperty Name)
    }
    return @()
}

function Get-ExistingClientFeatures {
    param([string]$ClientId, [string]$Module)
    $moduleDir = Join-Path $script:DocsDir "$ClientId\$Module"
    if (-not (Test-Path $moduleDir)) { return @() }
    return @(
        Get-ChildItem $moduleDir -Directory |
        Where-Object { $_.Name -match '^feature-' } |
        ForEach-Object { $_.Name -replace '^feature-', '' }
    )
}

function Invoke-ExistingClientWizard {
    <#
    .SYNOPSIS
        Interactive wizard for when a client already exists.
        Discovers existing modules/features, presents numbered menus,
        collects new modules/features to scaffold, and sets prepend mode.
    #>
    param(
        [Parameter(Mandatory)][string]$ClientId,
        [Parameter(Mandatory)][hashtable]$RepoInfo
    )

    $script:ExistingClientMode  = $true
    $script:PrependTestCases    = $false

    # ── Load existing config ────────────────────────────────────────────────
    $configFile = Join-Path $script:ClientsDir "$ClientId.json"
    $cfg        = Get-Content $configFile -Raw | ConvertFrom-Json

    $existingAuthType    = if ($cfg.authentication.authType)  { $cfg.authentication.authType  }
                           elseif ($cfg.authentication.type)  { $cfg.authentication.type      }
                           else                               { 'email-password'               }
    $existingClientType  = if ($cfg.clientType)               { $cfg.clientType  } else { 'platform'  }
    $existingLoginPath   = if ($cfg.authentication.loginPath) { $cfg.authentication.loginPath } else { '' }
    $existingRoles       = @($cfg.roles | ForEach-Object { $_ })
    $existingDisplayName = if ($cfg.displayName)              { $cfg.displayName }
                           elseif ($cfg.clientName)           { $cfg.clientName  }
                           else                               { $ClientId        }
    $existingEnvDev      = if ($cfg.environments.dev.baseUrl)     { $cfg.environments.dev.baseUrl     }
                           elseif ($cfg.environments.dev)         { $cfg.environments.dev             }
                           else                                   { '' }
    $existingEnvTesting  = if ($cfg.environments.testing.baseUrl) { $cfg.environments.testing.baseUrl }
                           elseif ($cfg.environments.testing)     { $cfg.environments.testing         }
                           else                                   { '' }
    $existingEnvUat      = if ($cfg.environments.uat.baseUrl)     { $cfg.environments.uat.baseUrl     }
                           elseif ($cfg.environments.uat)         { $cfg.environments.uat             }
                           else                                   { '' }
    $existingEnvProd     = if ($cfg.environments.production.baseUrl) { $cfg.environments.production.baseUrl }
                           elseif ($cfg.environments.prod)           { $cfg.environments.prod             }
                           else                                      { '' }
    $existingDefaultEnv  = if ($cfg.defaultEnvironment) { $cfg.defaultEnvironment }
                           elseif ($cfg.defaultEnv)     { $cfg.defaultEnv         }
                           else                         { 'uat'                   }

    # ── Show existing client summary ────────────────────────────────────────
    Write-Host ''
    Write-Host ('─' * 62) -ForegroundColor DarkCyan
    Write-Host "  CLIENT: $existingDisplayName  ($ClientId)" -ForegroundColor Cyan
    Write-Host ('─' * 62) -ForegroundColor DarkCyan
    Write-Host ''

    $existingModules = Get-ExistingClientModules -ClientId $ClientId
    if ($existingModules.Count -gt 0) {
        Write-Host '  Existing modules:' -ForegroundColor White
        foreach ($m in $existingModules) {
            $features = Get-ExistingClientFeatures -ClientId $ClientId -Module $m
            $featStr  = if ($features.Count -gt 0) { $features -join ', ' } else { '(no features yet)' }
            Write-Host "    • $m  →  $featStr" -ForegroundColor DarkGray
        }
    } else {
        Write-Host '  No existing modules found in file system.' -ForegroundColor DarkGray
    }
    Write-Host ''

    # ── What does the user want to do? ──────────────────────────────────────
    Write-Header "What do you want to do with '$ClientId'?"
    Write-Host '    1. Add a feature to an EXISTING module' -ForegroundColor White
    Write-Host '    2. Add a NEW module (with features)' -ForegroundColor White
    Write-Host '    3. Both — add to existing module AND add a new module' -ForegroundColor White
    Write-Host ''

    $actionChoice = ''
    while ($actionChoice -notin '1','2','3') {
        $actionChoice = (Read-Host '    Choose [1/2/3]').Trim()
    }

    $newModuleFeatures = [ordered]@{}

    # ── OPTION 1 or 3 — add feature to existing module ──────────────────────
    if ($actionChoice -in '1','3') {
        Write-Host ''
        Write-Host '  SELECT an existing module to add a feature to:' -ForegroundColor White
        Write-Host ''
        for ($i = 0; $i -lt $existingModules.Count; $i++) {
            Write-Host "    $($i+1). $($existingModules[$i])" -ForegroundColor Cyan
        }
        Write-Host "    $($existingModules.Count+1). Type a different module name" -ForegroundColor DarkGray
        Write-Host ''

        $modChoice = ''
        while (-not $modChoice) {
            $raw = (Read-Host '    Module number or name').Trim()
            [int]$idx = 0
            if ([int]::TryParse($raw, [ref]$idx)) {
                if ($idx -ge 1 -and $idx -le $existingModules.Count) {
                    $modChoice = $existingModules[$idx - 1]
                } elseif ($idx -eq $existingModules.Count + 1) {
                    $modChoice = (Read-Host '    Enter module name (kebab-case)').Trim().ToLower()
                } else {
                    Write-Warn "    '$raw' is out of range."
                }
            } elseif ($raw -match '^[a-z][a-z0-9]*(-[a-z0-9]+)*$') {
                $modChoice = $raw
            } else {
                Write-Warn "    '$raw' is not valid. Use a number or kebab-case name."
            }
        }

        # Show existing features in that module
        $existingFeatures = Get-ExistingClientFeatures -ClientId $ClientId -Module $modChoice
        Write-Host ''
        if ($existingFeatures.Count -gt 0) {
            Write-Host "  Existing features in '$modChoice':" -ForegroundColor White
            for ($i = 0; $i -lt $existingFeatures.Count; $i++) {
                Write-Host "    $($i+1). $($existingFeatures[$i])" -ForegroundColor DarkGray
            }
            Write-Host "    $($existingFeatures.Count+1). Add a NEW feature (scaffold new files)" -ForegroundColor Cyan
            Write-Host ''
            Write-Host '    NOTE: Selecting an existing feature will NOT re-scaffold files.' -ForegroundColor Yellow
            Write-Host '    It will print the Copilot commands to update/regenerate test cases.' -ForegroundColor Yellow
            Write-Host ''

            $featChoice = ''
            $selectedExistingFeat = ''
            while (-not $featChoice) {
                $raw = (Read-Host '    Feature number or new name').Trim()
                [int]$idx = 0
                if ([int]::TryParse($raw, [ref]$idx)) {
                    if ($idx -ge 1 -and $idx -le $existingFeatures.Count) {
                        # Existing feature selected
                        $selectedExistingFeat = $existingFeatures[$idx - 1]
                        $featChoice           = $selectedExistingFeat
                        Write-Host ''
                        Write-Host "  You selected EXISTING feature: $selectedExistingFeat" -ForegroundColor Yellow
                        Write-Host ''
                        Write-Host '  What do you want to do with it?' -ForegroundColor White
                        Write-Host '    1. Add new test cases (append to existing catalog)' -ForegroundColor White
                        Write-Host '    2. Regenerate the full catalog (replace existing catalog)' -ForegroundColor White
                        Write-Host '    3. Both — regenerate catalog AND re-run test generation' -ForegroundColor White
                        Write-Host ''
                        $updateChoice = ''
                        while ($updateChoice -notin '1','2','3') {
                            $updateChoice = (Read-Host '    Choose [1/2/3]').Trim()
                        }

                        # Set prepend flag for "add new cases"
                        if ($updateChoice -in '1','3') {
                            $script:PrependTestCases = $true
                        }

                        # Store the intent on the feature entry
                        if (-not $newModuleFeatures[$modChoice]) {
                            $newModuleFeatures[$modChoice] = [System.Collections.Generic.List[hashtable]]::new()
                        }
                        $featLabel = (Get-Culture).TextInfo.ToTitleCase(($selectedExistingFeat -replace '-', ' '))
                        $intent    = switch ($updateChoice) {
                            '1' { 'add-cases'    }
                            '2' { 'regenerate'   }
                            '3' { 'regen-and-gen'}
                        }
                        ([System.Collections.Generic.List[hashtable]]$newModuleFeatures[$modChoice]).Add(@{
                            id      = $selectedExistingFeat
                            label   = $featLabel
                            intent  = $intent
                            isExisting = $true
                        })
                        Write-Done "  Queued: $modChoice / $selectedExistingFeat  [$intent]"
                    } elseif ($idx -eq $existingFeatures.Count + 1) {
                        $featChoice = '__new__'
                    } else {
                        Write-Warn "    '$raw' is out of range."
                    }
                } elseif ($raw -match '^[a-z][a-z0-9]*(-[a-z0-9]+)*$') {
                    $featChoice = $raw  # typed a new feature name directly
                } else {
                    Write-Warn "    '$raw' is not valid."
                }
            }

            # If they chose to add a new feature (option N+1 or typed a name)
            if ($featChoice -eq '__new__' -or ($featChoice -and -not $selectedExistingFeat)) {
                $newFeatId = if ($featChoice -eq '__new__') {
                    $raw = (Read-Host '    New Feature ID (kebab-case)').Trim().ToLower()
                    $raw
                } else { $featChoice }

                $featLabel = (Read-Host "    Feature Label (e.g. `"View $((Get-Culture).TextInfo.ToTitleCase($newFeatId))`")").Trim()
                if (-not $featLabel) { $featLabel = (Get-Culture).TextInfo.ToTitleCase(($newFeatId -replace '-', ' ')) }

                if (-not $newModuleFeatures[$modChoice]) {
                    $newModuleFeatures[$modChoice] = [System.Collections.Generic.List[hashtable]]::new()
                }
                ([System.Collections.Generic.List[hashtable]]$newModuleFeatures[$modChoice]).Add(@{
                    id         = $newFeatId
                    label      = $featLabel
                    intent     = 'new'
                    isExisting = $false
                })
                Write-Done "  Queued: $modChoice / $newFeatId  [new scaffold]"
            }
        } else {
            # Module has no features yet — go straight to new feature input
            Write-Host "  No existing features in '$modChoice' — enter the first feature to scaffold:" -ForegroundColor DarkGray
            Write-Host ''
            $addMore = $true
            if (-not $newModuleFeatures[$modChoice]) {
                $newModuleFeatures[$modChoice] = [System.Collections.Generic.List[hashtable]]::new()
            }
            while ($addMore) {
                $featId = ''
                while (-not $featId) {
                    $raw = (Read-Host "    Feature ID (e.g. submit-claim)").Trim().ToLower()
                    if ($raw -match '^[a-z][a-z0-9]*(-[a-z0-9]+)*$') { $featId = $raw }
                    else { Write-Warn "    '$raw' is not valid kebab-case." }
                }
                $featLabel = (Read-Host "    Feature Label").Trim()
                if (-not $featLabel) { $featLabel = (Get-Culture).TextInfo.ToTitleCase(($featId -replace '-', ' ')) }
                ([System.Collections.Generic.List[hashtable]]$newModuleFeatures[$modChoice]).Add(@{
                    id = $featId; label = $featLabel; intent = 'new'; isExisting = $false
                })
                Write-Done "  Queued: $modChoice / $featId  [new scaffold]"
                $another = (Read-Host "    Add another feature for '$modChoice'? (y/N)").Trim().ToLower()
                $addMore = ($another -eq 'y' -or $another -eq 'yes')
            }
        }
    }

    # ── OPTION 2 or 3 — add a brand new module ───────────────────────────────
    if ($actionChoice -in '2','3') {
        Write-Host ''
        Write-Host '  Enter the new module and its features:' -ForegroundColor White
        Write-Host ''
        $addingModules = $true
        while ($addingModules) {
            $modInput = (Read-Host '    New Module ID (or Enter to finish)').Trim().ToLower()
            if (-not $modInput) { $addingModules = $false; break }
            if ($modInput -in $existingModules) {
                Write-Warn "    '$modInput' already exists. Use option 1 to add features to an existing module."
                continue
            }
            if ($modInput -notmatch '^[a-z][a-z0-9]*(-[a-z0-9]+)*$') {
                Write-Warn "    '$modInput' is not valid kebab-case."
                continue
            }
            $newModuleFeatures[$modInput] = [System.Collections.Generic.List[hashtable]]::new()
            Write-Host "    Module: $modInput" -ForegroundColor Cyan
            $addingFeats = $true
            while ($addingFeats) {
                $featId = ''
                while (-not $featId) {
                    $raw = (Read-Host "      Feature ID (e.g. view-$modInput)").Trim().ToLower()
                    if ($raw -match '^[a-z][a-z0-9]*(-[a-z0-9]+)*$') { $featId = $raw }
                    else { Write-Warn "      '$raw' is not valid kebab-case." }
                }
                $featLabel = (Read-Host "      Feature Label").Trim()
                if (-not $featLabel) { $featLabel = (Get-Culture).TextInfo.ToTitleCase(($featId -replace '-', ' ')) }
                ([System.Collections.Generic.List[hashtable]]$newModuleFeatures[$modInput]).Add(@{
                    id = $featId; label = $featLabel; intent = 'new'; isExisting = $false
                })
                Write-Done "  Queued: $modInput / $featId  [new scaffold]"
                $another = (Read-Host "      Add another feature for '$modInput'? (y/N)").Trim().ToLower()
                $addingFeats = ($another -eq 'y' -or $another -eq 'yes')
            }
        }
    }

    # ── Convert List<hashtable> to plain arrays ──────────────────────────────
    $finalFeatures = [ordered]@{}
    foreach ($mod in $newModuleFeatures.Keys) {
        $finalFeatures[$mod] = @($newModuleFeatures[$mod])
    }

    return [ordered]@{
        clientId       = $ClientId
        displayName    = $existingDisplayName
        clientType     = $existingClientType
        loginPath      = $existingLoginPath
        authType       = $existingAuthType
        roles          = $existingRoles
        credentials    = [ordered]@{}
        modules        = @($finalFeatures.Keys)
        moduleFeatures = $finalFeatures
        repoUrl        = $RepoInfo.url
        branch         = $RepoInfo.branch
        localPath      = $RepoInfo.localPath
        defaultEnv     = $existingDefaultEnv
        environments   = [ordered]@{
            dev     = $existingEnvDev
            testing = $existingEnvTesting
            uat     = $existingEnvUat
            prod    = $existingEnvProd
        }
    }
}

# ==============================================================
# COMMON CLIENT DETAIL COLLECTION
# ==============================================================

function Get-ClientDetails {
    param([Parameter(Mandatory)][hashtable]$RepoInfo)

    Write-Header 'Client Details'
    # --- Client ID ---
    $clientId = Read-ValidatedInput `
        -Prompt 'Client ID (kebab-case, e.g. samsung, brp, certainteed)' `
        -Validator { param($id) Test-ClientIdFormat $id }

    # --- Duplicate check — hand off to focused wizard if client already exists ---
    $existingConfig = Join-Path $script:ClientsDir "$clientId.json"
    $script:ExistingClientMode = $false
    if (Test-Path $existingConfig) {
        Write-Warn "A client config already exists for '$clientId':"
        Write-Warn "  $existingConfig"
        Write-Host ''
        Write-Host '    OPTIONS:' -ForegroundColor Yellow
        Write-Host '      Y = Overwrite all config files and re-run full setup' -ForegroundColor DarkGray
        Write-Host '      N = Work with existing client — add modules/features interactively' -ForegroundColor DarkGray
        Write-Host ''
        $overwrite = Read-YesNo 'Overwrite existing configuration?' -DefaultYes $false
        if (-not $overwrite) {
            # Hand off entirely to the focused existing-client wizard and return its result
            return Invoke-ExistingClientWizard -ClientId $clientId -RepoInfo $RepoInfo
        }
    }

    # --- Display name ---
    $displayName = Read-RequiredInput -Prompt 'Display name (e.g. Samsung Electronics, BRP Inc, CertainTeed)'

    # --- Client type ---
    $typeChoice = Read-MenuChoice `
        -Prompt 'Client type:' `
        -Options @(
            'Platform Client    - inherits this platform (same codebase, different config/URL)',
            'Independent Client - standalone application  (different codebase entirely)'
        )
    $clientType = if ($typeChoice -eq 1) { 'platform' } else { 'independent' }

    # --- Environments ---
    Write-Header 'Environment URLs'
    Write-Host '    All URLs are optional — press Enter to skip any.' -ForegroundColor DarkGray
    Write-Host '    Dashboard shows "Not Configured" for any URL left blank.' -ForegroundColor DarkGray
    Write-Host ''

    $envDev     = Read-OptionalUrl 'Dev URL         (e.g. https://client-dev.example.com)'
    $envTesting = Read-OptionalUrl 'Testing URL      (e.g. https://client-test.example.com)'
    $envUat     = Read-OptionalUrl 'UAT URL         (e.g. https://client-uat.example.com)'
    $envProd    = Read-OptionalUrl 'Production URL  (e.g. https://client.example.com)'

    if (-not ($envDev -or $envTesting -or $envUat -or $envProd)) {
        Write-Warn 'No environment URLs provided. At least one URL is strongly recommended.'
    }

    # --- Auth ---
    Write-Header 'Authentication'

    $loginPath = Read-OptionalInput -Prompt 'Login path (e.g. /login, /Account/Login) — press Enter if the base URL IS the login page'
    if (-not $loginPath) {
        $loginPath = ''
        Write-Done 'Login path: (none) — base URL is the login page'
    } else {
        # Ensure it starts with /
        if ($loginPath -notmatch '^/') { $loginPath = "/$loginPath" }
        Write-Done "Login path: $loginPath"
    }

    # Auth type — determines what fields the login form requires
    $authTypeChoice = Read-MenuChoice `
        -Prompt 'What does the login form require?' `
        -Options @(
            'Email + Password  (standard — most platforms)',
            'Username only     (no password — e.g. dealer code like X1A0449)',
            'Username + Password  (non-email username field)'
        )
    $authType = switch ($authTypeChoice) {
        1 { 'email-password'    }
        2 { 'username-only'     }
        3 { 'username-password' }
    }
    Write-Done "Auth type: $authType"

    # --- Roles ---
    $rolesRaw = Read-RequiredInput -Prompt 'Roles, comma-separated (e.g. dealer,admin)' -Default 'dealer,admin'
    $roles    = @($rolesRaw -split ',' | ForEach-Object { $_.Trim().ToLower() } | Where-Object { $_ })

    # --- Modules ---
    # Known built-ins shown as numbered shortcuts. Any kebab-case name is also accepted as a custom module.
    $availableModules = @('coop', 'engage-ads', 'popshop', 'rebate', 'admin')
    Write-Host ''
    Write-Host '    Which modules are enabled for this client?' -ForegroundColor White
    Write-Host '    Pick numbers, type custom names, or mix both (comma-separated).' -ForegroundColor DarkGray
    Write-Host ''
    for ($i = 0; $i -lt $availableModules.Count; $i++) {
        Write-Host "      $($i + 1).  $($availableModules[$i])"
    }
    Write-Host ''
    Write-Host '    Custom module  — just type its name, e.g.  ad-builder' -ForegroundColor DarkGray
    Write-Host '    Mix example    — 1,3,ad-builder,inventory-v2' -ForegroundColor DarkGray
    Write-Host '    All built-ins  — type  all' -ForegroundColor DarkGray

    $selectedModules = @()
    while ($selectedModules.Count -eq 0) {
        $raw    = (Read-Host '    Modules').Trim()
        $chosen = [System.Collections.Generic.List[string]]::new()
        $valid  = $true

        if ($raw -eq 'all') {
            $selectedModules = $availableModules
            continue
        }

        $tokens = $raw -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ }
        foreach ($token in $tokens) {
            [int]$idx = 0
            if ([int]::TryParse($token, [ref]$idx)) {
                # Numeric shortcut → map to built-in
                if ($idx -ge 1 -and $idx -le $availableModules.Count) {
                    $chosen.Add($availableModules[$idx - 1])
                } else {
                    Write-Warn "  '$token' is out of range. Built-in modules are 1–$($availableModules.Count)."
                    $valid = $false; break
                }
            } elseif ($token -match '^[a-z][a-z0-9]*(-[a-z0-9]+)*$') {
                # Valid kebab-case — treat as custom module (new or existing)
                $chosen.Add($token)
            } else {
                Write-Warn "  '$token' is not a valid module name."
                Write-Warn '  Module names must be lowercase kebab-case, e.g. ad-builder, inventory-v2'
                $valid = $false; break
            }
        }

        if ($valid -and $chosen.Count -gt 0) {
            $selectedModules = $chosen | Select-Object -Unique
        }
    }

    $builtinChosen = @($selectedModules | Where-Object { $_ -in $availableModules })
    $customModules = @($selectedModules | Where-Object { $_ -notin $availableModules })
    if ($builtinChosen.Count -gt 0) { Write-Done "Built-in : $($builtinChosen -join ', ')" }
    if ($customModules.Count  -gt 0) { Write-Done "Custom   : $($customModules -join ', ')" }

    # --- Starter features per module ---
    Write-Host ''
    Write-Host '    For each module, enter at least one starter feature to scaffold.' -ForegroundColor White
    Write-Host '    Feature ID : lowercase kebab-case,  e.g. submit-claim, view-dashboard' -ForegroundColor DarkGray
    Write-Host '    Feature Label: human-readable,       e.g. "Submit Claim"' -ForegroundColor DarkGray
    Write-Host '    (You can add more features later with: .\scripts\new-module.ps1)' -ForegroundColor DarkGray
    Write-Host ''

    $moduleFeatures = [ordered]@{}   # moduleId → @( @{id=...; label=...}, ... )
    foreach ($mod in $selectedModules) {
        Write-Host "  Module: $mod" -ForegroundColor Cyan
        $featList = [System.Collections.Generic.List[hashtable]]::new()

        $addMore = $true
        while ($addMore) {
            $featId = ''
            while (-not $featId) {
                $raw = (Read-Host "    Feature ID  (e.g. view-$mod)").Trim().ToLower()
                if ($raw -match '^[a-z][a-z0-9]*(-[a-z0-9]+)*$') {
                    $featId = $raw
                } else {
                    Write-Warn "    '$raw' is not valid kebab-case. Use only lowercase letters, numbers, and hyphens."
                }
            }
            $featLabel = (Read-Host "    Feature Label (e.g. `"View $((Get-Culture).TextInfo.ToTitleCase($mod))`")").Trim()
            if (-not $featLabel) { $featLabel = (Get-Culture).TextInfo.ToTitleCase(($featId -replace '-', ' ')) }

            $featList.Add(@{ id = $featId; label = $featLabel })
            Write-Done "  Queued: $mod / $featId — $featLabel"

            $another = (Read-Host "    Add another feature for '$mod'? (y/N)").Trim().ToLower()
            $addMore  = ($another -eq 'y' -or $another -eq 'yes')
        }
        $moduleFeatures[$mod] = $featList.ToArray()
        Write-Host ''
    }

    # --- Credentials per role ---
    Write-Header 'Login Credentials'

    if ($authType -eq 'username-only') {
        Write-Host '    Auth type: Username only — no password, no encryption needed.' -ForegroundColor DarkGray
        Write-Host ''
    } else {
        Write-Host '    Passwords are encrypted with AES-256-GCM using MASTER_KEY.' -ForegroundColor DarkGray
        Write-Host '    Plaintext passwords are never written to disk.' -ForegroundColor DarkGray
        Write-Host ''

        # --- Ensure MASTER_KEY is available before collecting passwords ---
        $masterKey = [System.Environment]::GetEnvironmentVariable('MASTER_KEY')
        if (-not $masterKey) {
            # Try to load from .env.production
            $envProdFile = Join-Path $script:Root '.env.production'
            if (Test-Path $envProdFile) {
                Get-Content $envProdFile | ForEach-Object {
                    if ($_ -match '^MASTER_KEY=(.+)') {
                        [System.Environment]::SetEnvironmentVariable('MASTER_KEY', $Matches[1].Trim())
                    }
                }
                $masterKey = [System.Environment]::GetEnvironmentVariable('MASTER_KEY')
            }
        }

        if (-not $masterKey) {
            Write-Warn 'MASTER_KEY is not set in your environment or .env.production.'
            Write-Host ''
            $setKeyNow = Read-YesNo 'Set MASTER_KEY now? (required for encryption)' -DefaultYes $true
            if ($setKeyNow) {
                Write-Host ''
                Write-Host '    Generate a secure key by running this command in a separate terminal:' -ForegroundColor DarkGray
                Write-Host '      node -e "console.log(require(''crypto'').randomBytes(32).toString(''hex''))"' -ForegroundColor Cyan
                Write-Host ''
                $newKey = Read-RequiredInput -Prompt '    Paste MASTER_KEY here (64 hex chars recommended)'
                [System.Environment]::SetEnvironmentVariable('MASTER_KEY', $newKey)

                # Persist to .env.production
                $envProdFile = Join-Path $script:Root '.env.production'
                $utf8NoBom   = New-Object System.Text.UTF8Encoding $false
                if (Test-Path $envProdFile) {
                    $existing = Get-Content $envProdFile -Raw
                    if ($existing -notmatch 'MASTER_KEY=') {
                        [System.IO.File]::AppendAllText($envProdFile, "`nMASTER_KEY=$newKey`n", $utf8NoBom)
                        Write-Done 'MASTER_KEY appended to .env.production'
                    } else {
                        Write-Warn 'MASTER_KEY already in .env.production — not overwritten. Update manually if needed.'
                    }
                } else {
                    [System.IO.File]::WriteAllText($envProdFile, "MASTER_KEY=$newKey`n", $utf8NoBom)
                    Write-Done 'Created .env.production with MASTER_KEY'
                }
                $masterKey = $newKey
            } else {
                Write-Warn 'Continuing without encryption.'
                Write-Warn 'Passwords will be stored as placeholders. Encrypt them later with:'
                Write-Warn '  node utils/encrypt-credential.js "your-password"'
            }
        } else {
            Write-Done 'MASTER_KEY is set — passwords will be encrypted.'
        }
        Write-Host ''
    }

    $credentials = [ordered]@{}
    foreach ($role in $roles) {
        Write-Host "    Role: $role" -ForegroundColor White

        if ($authType -eq 'username-only') {
            # No password field — just a username/dealer-code
            $username = Read-RequiredInput -Prompt "      Username for '$role' (e.g. X1A0449)"
            $credentials[$role] = [ordered]@{
                username = $username
                password = ''
            }
            Write-Done "Username stored for '$role' (no password required)."

        } elseif ($authType -eq 'username-password') {
            $username = Read-RequiredInput -Prompt "      Username for '$role'"
            $password = Read-RequiredInput -Prompt "      Password for '$role'"

            Write-Step "Encrypting password for '$role'..."
            $encryptScript = Join-Path $script:Root 'utils\encrypt-credential.js'
            $allOutput = @()
            Push-Location $script:Root
            try   { $allOutput = @(& node $encryptScript $password 2>&1) } finally { Pop-Location }
            $encResult = $allOutput | Where-Object { $_ -match '^enc:' } | Select-Object -Last 1
            if (-not $encResult) {
                $errDetail = ($allOutput | Where-Object { $_ } | Select-Object -Last 3) -join ' | '
                Write-Warn "Encryption failed for '$role': $errDetail"
                $encPassword = 'REPLACE_WITH_ENCRYPTED_PASSWORD'
            } else {
                $encPassword = $encResult.Trim()
                Write-Done "Password encrypted for '$role'."
            }
            $credentials[$role] = [ordered]@{
                username = $username
                password = $encPassword
            }

        } else {
            # email-password (default)
            $email    = Read-RequiredInput -Prompt "      Email for '$role' (e.g. dealer@samsung.com)"
            $password = Read-RequiredInput -Prompt "      Password for '$role'"

            Write-Step "Encrypting password for '$role'..."
            $encryptScript = Join-Path $script:Root 'utils\encrypt-credential.js'
            $allOutput = @()
            Push-Location $script:Root
            try   { $allOutput = @(& node $encryptScript $password 2>&1) } finally { Pop-Location }
            $encResult = $allOutput | Where-Object { $_ -match '^enc:' } | Select-Object -Last 1
            if (-not $encResult) {
                $errDetail = ($allOutput | Where-Object { $_ } | Select-Object -Last 3) -join ' | '
                Write-Warn "Encryption failed for '$role': $errDetail"
                $encPassword = 'REPLACE_WITH_ENCRYPTED_PASSWORD'
            } else {
                $encPassword = $encResult.Trim()
                Write-Done "Password encrypted for '$role'."
            }
            $credentials[$role] = [ordered]@{
                email    = $email
                password = $encPassword
            }
        }
        Write-Host ''
    }

    # Determine default environment — prefer production, fall back to first available
    $defaultEnv = if ($envProd)        { 'production' }
                  elseif ($envUat)     { 'uat' }
                  elseif ($envTesting) { 'testing' }
                  elseif ($envDev)     { 'dev' }
                  else                 { 'production' }

    # --- Confirmation before writing ---
    Write-Header 'Confirm — Review Before Writing Files'
    Write-Host "  Client ID      : $clientId"                          -ForegroundColor White
    Write-Host "  Display Name   : $displayName"                       -ForegroundColor White
    Write-Host "  Type           : $clientType"                        -ForegroundColor White
    Write-Host "  Auth Type      : $authType"                          -ForegroundColor White
    Write-Host "  Modules        : $($selectedModules -join ', ')"     -ForegroundColor White
    foreach ($mod in $selectedModules) {
        $featSummary = ($moduleFeatures[$mod] | ForEach-Object { $_.id }) -join ', '
        Write-Host "    $mod : $featSummary"                             -ForegroundColor DarkGray
    }
    Write-Host "  Roles          : $($roles -join ', ')"               -ForegroundColor White
    Write-Host "  Default Env    : $defaultEnv"                        -ForegroundColor White
    Write-Host "  Dev URL        : $(if ($envDev)     { $envDev }     else { '(not set)' })" -ForegroundColor DarkGray
    Write-Host "  Testing URL    : $(if ($envTesting) { $envTesting } else { '(not set)' })" -ForegroundColor DarkGray
    Write-Host "  UAT URL        : $(if ($envUat)     { $envUat }     else { '(not set)' })" -ForegroundColor DarkGray
    Write-Host "  Production URL : $(if ($envProd)    { $envProd }    else { '(not set — Not Configured)' })" -ForegroundColor DarkGray
    Write-Host ''
    $confirmed = Read-YesNo 'Proceed and create all configuration files?' -DefaultYes $true
    if (-not $confirmed) {
        Write-Host ''
        Write-Host '  Aborted. No files were created. Re-run to start over.' -ForegroundColor Yellow
        exit 0
    }

    return [ordered]@{
        clientId     = $clientId
        displayName  = $displayName
        clientType   = $clientType
        loginPath    = $loginPath
        authType     = $authType
        roles        = $roles
        credentials  = $credentials
        modules        = $selectedModules
        moduleFeatures = $moduleFeatures
        repoUrl        = $RepoInfo.url
        branch       = $RepoInfo.branch
        localPath    = $RepoInfo.localPath
        defaultEnv   = $defaultEnv
        environments = [ordered]@{
            dev     = $envDev
            testing = $envTesting
            uat     = $envUat
            prod    = $envProd
        }
    }
}

# ==============================================================
# FILE GENERATORS
# ==============================================================

function New-ClientConfig {
    <#
    .SYNOPSIS Creates config/clients/{clientId}.json
    #>
    param([Parameter(Mandatory)][hashtable]$Details)

    Write-Step 'Creating client config...'

    $now  = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')

    # Build environments - only include envs that have a URL
    $envs = [ordered]@{}
    if ($Details.environments.dev) {
        $envs['dev'] = [ordered]@{
            label   = 'Dev'
            baseUrl = $Details.environments.dev
            apiUrl  = $Details.environments.dev
            envFile = 'dev'
        }
    }
    if ($Details.environments.testing) {
        $envs['testing'] = [ordered]@{
            label   = 'Testing'
            baseUrl = $Details.environments.testing
            apiUrl  = $Details.environments.testing
            envFile = 'testing'
        }
    }
    if ($Details.environments.uat) {
        $envs['uat'] = [ordered]@{
            label   = 'UAT'
            baseUrl = $Details.environments.uat
            apiUrl  = $Details.environments.uat
            envFile = 'uat'
        }
    }
    $envs['production'] = [ordered]@{
        label   = 'Production'
        baseUrl = if ($Details.environments.prod) { $Details.environments.prod } else { '' }
        apiUrl  = if ($Details.environments.prod) { $Details.environments.prod } else { '' }
        envFile = 'production'
    }

    $config = [ordered]@{
        clientId           = $Details.clientId
        displayName        = $Details.displayName
        platform           = $Details.clientType
        defaultEnvironment = $Details.defaultEnv
        authentication     = [ordered]@{
            loginPath = $Details.loginPath
            authType  = $Details.authType
            roles     = @($Details.roles)
        }
        environments       = $envs
        featureFlags       = [ordered]@{}
        modules            = @($Details.modules)
        repo               = [ordered]@{
            url        = if ($Details.repoUrl) { $Details.repoUrl } else { '' }
            branch     = $Details.branch
            localPath  = $Details.localPath
            lastSync   = ''
            lastCommit = ''
        }
        '_generated'       = $now
        '_note'            = 'Modules were selected during onboarding. Run repo-analysis skill to populate featureFlags and generate test catalogs.'
    }

    New-JsonFile -Path (Join-Path $script:ClientsDir "$($Details.clientId).json") -Content $config
}

function New-UserConfig {
    <#
    .SYNOPSIS Creates config/users/{clientId}/users.json with encrypted password placeholders.
    #>
    param([Parameter(Mandatory)][hashtable]$Details)

    Write-Step 'Creating user config...'

    $users = [ordered]@{}
    foreach ($role in $Details.roles) {
        $cred = if ($Details.credentials) { $Details.credentials[$role] } else { $null }

        if ($Details.authType -eq 'username-only') {
            $usernameVal = if ($cred -and $cred.username) { $cred.username } else { "REPLACE_WITH_$($role.ToUpper())_USERNAME" }
            $users[$role] = [ordered]@{
                role        = $role
                displayName = (Get-Culture).TextInfo.ToTitleCase($role)
                username    = $usernameVal
                email       = $usernameVal   # server.js reads .email as the login value
                password    = ''             # no password for username-only
                _note       = "Auth type: username-only. Set 'username' and 'email' to the login username/dealer code. Password must be empty string."
            }
        } else {
            $email    = if ($cred -and $cred.email)    { $cred.email }    else { "REPLACE_WITH_$($role.ToUpper())_EMAIL" }
            $password = if ($cred -and $cred.password) { $cred.password } else { 'REPLACE_WITH_ENCRYPTED_PASSWORD' }
            $users[$role] = [ordered]@{
                role        = $role
                displayName = (Get-Culture).TextInfo.ToTitleCase($role)
                email       = $email
                password    = $password
                _note       = 'Run: node utils/encrypt-credential.js  to generate an encrypted password value (enc:...).'
            }
        }
    }

    New-JsonFile -Path (Join-Path $script:UsersDir "$($Details.clientId)\users.json") -Content $users
}

function Update-RepoRegistry {
    <#
    .SYNOPSIS Adds the client entry to config/repos.local.json without overwriting existing entries.
    .NOTES    Creates the file if it does not exist. Reusable by repo-sync.ps1.
    #>
    param([Parameter(Mandatory)][hashtable]$Details)

    Write-Step 'Updating repo registry (repos.local.json)...'

    # Load existing registry or start fresh
    $registryObj = if (Test-Path $script:ReposLocalJson) {
        try {
            Get-Content $script:ReposLocalJson -Raw | ConvertFrom-Json
        } catch {
            Write-Warn "Could not parse existing repos.local.json - creating a backup and starting fresh."
            Copy-Item $script:ReposLocalJson "$($script:ReposLocalJson).bak" -Force
            New-Object PSObject
        }
    } else {
        New-Object PSObject
    }

    # Ensure 'clients' property exists
    if (-not (Get-Member -InputObject $registryObj -Name 'clients' -MemberType NoteProperty -ErrorAction SilentlyContinue)) {
        Add-Member -InputObject $registryObj -NotePropertyName 'clients' -NotePropertyValue (New-Object PSObject)
    }

    # Warn if overwriting
    if (Get-Member -InputObject $registryObj.clients -Name $Details.clientId -MemberType NoteProperty -ErrorAction SilentlyContinue) {
        Write-Warn "Entry '$($Details.clientId)' already exists in repos.local.json - updating."
    }

    $entry = [PSCustomObject]@{
        clientId   = $Details.clientId
        url        = if ($Details.repoUrl) { $Details.repoUrl } else { '' }
        branch     = $Details.branch
        localPath  = $Details.localPath
        lastSync   = ''
        lastCommit = ''
    }

    Add-Member -InputObject $registryObj.clients `
               -NotePropertyName $Details.clientId `
               -NotePropertyValue $entry `
               -Force

    $json = $registryObj | ConvertTo-Json -Depth 10
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($script:ReposLocalJson, $json, $utf8NoBom)
    Write-Done "Updated $($script:ReposLocalJson.Replace($script:Root, ''))"
}

function New-CatalogManifest {
    <#
    .SYNOPSIS Creates an empty dashboard/catalogs/{clientId}-manifest.json.
    #>
    param([Parameter(Mandatory)][hashtable]$Details)

    Write-Step 'Creating catalog manifest stub...'

    $now = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')

    $manifest = [ordered]@{
        '_readme'   = 'Auto-generated by new-client.ps1. Run the repo-analysis skill to populate features.'
        clientId    = $Details.clientId
        displayName = $Details.displayName
        platform    = $Details.clientType
        generated   = $now
        lastUpdated = $now
        features    = [ordered]@{}
    }

    New-JsonFile -Path (Join-Path $script:CatalogsDir "$($Details.clientId)-manifest.json") -Content $manifest
}

function New-FunctionalCatalogFolder {
    <#
    .SYNOPSIS Creates the docs/functional-catalogs/{clientId}/ directory and one sub-dir per module.
    #>
    param([Parameter(Mandatory)][hashtable]$Details)

    Write-Step 'Creating functional catalog directory...'

    $clientDir = Join-Path $script:DocsDir $Details.clientId
    New-Dir $clientDir
    New-GitKeep $clientDir
    Write-Done "Created  \docs\functional-catalogs\$($Details.clientId)\"

    # Create a folder for each selected module so scaffold/test-catalog skills can populate them
    if ($Details.modules -and $Details.modules.Count -gt 0) {
        foreach ($mod in $Details.modules) {
            $modDir = Join-Path $clientDir $mod
            New-Dir $modDir
            New-GitKeep $modDir
            Write-Done "Created  \docs\functional-catalogs\$($Details.clientId)\$mod\"
        }
    }
}

function New-PlaywrightClientStructure {
    <#
    .SYNOPSIS Creates tests/playwright/clients/{clientId}/{specs,pages,data}/ directory tree.
    #>
    param([Parameter(Mandatory)][hashtable]$Details)

    Write-Step 'Creating Playwright client folder structure...'

    $clientRoot = Join-Path $script:PlaywrightDir $Details.clientId

    foreach ($sub in @('specs', 'pages', 'data')) {
        $dir = Join-Path $clientRoot $sub
        New-Dir $dir
        New-GitKeep $dir
        Write-Done "Created  \tests\playwright\clients\$($Details.clientId)\$sub\"
    }
}

function Update-DashboardHtml {
    <#
    .SYNOPSIS Patches dashboard/index.html to add the new client to the static
              sel-client dropdown and any new module to MODULE_LABELS.
              Idempotent — skips if already present.
    #>
    param([Parameter(Mandatory)][hashtable]$Details)

    $htmlFile = Join-Path $script:Root 'dashboard\index.html'
    if (-not (Test-Path $htmlFile)) {
        Write-Warn 'dashboard/index.html not found — skipping UI patch.'
        return
    }

    $html    = Get-Content $htmlFile -Raw
    $changed = $false

    # ── 1. Add client option to sel-client dropdown (if not already present) ──
    $clientId    = $Details.clientId
    $displayName = $Details.displayName
    $optionTag   = "<option value=`"$clientId`">$displayName</option>"

    if ($html -notmatch [regex]::Escape("value=`"$clientId`"")) {
        # Insert before the closing </select> of sel-client
        $html    = $html -replace '(id="sel-client"[^>]*>[\s\S]*?)(</select>)', "`$1        $optionTag`n      `$2"
        $changed = $true
        Write-Done "dashboard/index.html — added client option: $clientId"
    } else {
        Write-Done "dashboard/index.html — client '$clientId' already present in dropdown"
    }

    # ── 2. Add any new module to MODULE_LABELS (if not already present) ────────
    $knownModuleLabels = @{
        'coop'        = 'Coop'
        'engage-ads'  = 'EngageAds'
        'popshop'     = 'PopShop'
        'rebate'      = 'Rebate'
        'admin'       = 'Admin'
        'ad-builder'  = 'Ad Builder'
    }

    foreach ($mod in $Details.modules) {
        if ($html -notmatch "'$mod'") {
            # Derive a readable label: title-case, replace hyphens with spaces
            $label = if ($knownModuleLabels[$mod]) {
                $knownModuleLabels[$mod]
            } else {
                (Get-Culture).TextInfo.ToTitleCase(($mod -replace '-', ' '))
            }
            # Insert before the closing }; of MODULE_LABELS
            $html    = $html -replace "(const MODULE_LABELS = \{[^}]*)(\};)", "`$1  '$mod':  '$label',`n`$2"
            $changed = $true
            Write-Done "dashboard/index.html — added module label: $mod = '$label'"
        }
    }

    if ($changed) {
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($htmlFile, $html, $utf8NoBom)
    }
}

# ==============================================================
# SELF-VALIDATION
# ==============================================================

function Test-OnboardingArtifacts {
    <#
    .SYNOPSIS Validates that every required artifact was successfully created.
              Reports pass/fail per check and triggers automatic fixes where possible.
    #>
    param([Parameter(Mandatory)][hashtable]$Details)

    Write-Header 'Self-Validation'
    $id     = $Details.clientId
    $errors = 0

    function Check-Exists([string]$Path, [string]$Label) {
        if (Test-Path $Path) {
            Write-Done "$Label"
        } else {
            Write-Warn "$Label MISSING: $Path"
            $script:errors++
        }
    }

    # File checks
    Check-Exists (Join-Path $script:ClientsDir "$id.json")              "config/clients/$id.json"
    Check-Exists (Join-Path $script:UsersDir "$id\users.json")          "config/users/$id/users.json"
    Check-Exists (Join-Path $script:CatalogsDir "$id-manifest.json")    "dashboard/catalogs/$id-manifest.json"
    Check-Exists $script:ReposLocalJson                                  "config/repos.local.json"
    Check-Exists (Join-Path $script:DocsDir $id)                        "docs/functional-catalogs/$id/"

    # Verify clientId field inside generated config matches input (catches typos/overwrites)
    $configFile = Join-Path $script:ClientsDir "$id.json"
    if (Test-Path $configFile) {
        try {
            $cfg = Get-Content $configFile -Raw | ConvertFrom-Json
            if ($cfg.clientId -eq $id) {
                Write-Done "clientId field in config is correct ($id)"
            } else {
                Write-Warn "clientId mismatch — expected '$id', file contains '$($cfg.clientId)'"
                $errors++
            }
        } catch {
            Write-Warn "Could not parse config JSON: $_"
            $errors++
        }
    }

    # Verify passwords are encrypted (skip check for username-only auth)
    $usersFile = Join-Path $script:UsersDir "$id\users.json"
    if (Test-Path $usersFile) {
        try {
            $usersJson  = Get-Content $usersFile -Raw | ConvertFrom-Json
            $authType   = if ($Details.authType) { $Details.authType } else { 'email-password' }

            if ($authType -eq 'username-only') {
                Write-Done "Auth type is username-only — password encryption check skipped"
            } else {
                $unencrypted = $usersJson.PSObject.Properties |
                    Where-Object { $_.Value.password -and $_.Value.password -notmatch '^enc:' -and $_.Value.password -ne 'REPLACE_WITH_ENCRYPTED_PASSWORD' }
                if ($unencrypted) {
                    Write-Warn "Plaintext password detected for role(s): $($unencrypted.Name -join ', ')"
                    Write-Warn "Run: node utils/encrypt-credential.js ""your-password"" and update users.json"
                    $errors++
                } else {
                    $placeholders = $usersJson.PSObject.Properties |
                        Where-Object { $_.Value.password -eq 'REPLACE_WITH_ENCRYPTED_PASSWORD' }
                    if ($placeholders) {
                        Write-Warn "Unencrypted placeholder found for role(s): $($placeholders.Name -join ', ')"
                        Write-Warn "Encrypt with: node utils/encrypt-credential.js ""your-password"""
                    } else {
                        Write-Done 'All passwords are encrypted'
                    }
                }
            }
        } catch {
            Write-Warn "Could not validate users.json: $_"
        }
    }

    # Verify catalog manifest has clientId set correctly (not empty or mismatched)
    $catalogFile = Join-Path $script:CatalogsDir "$id-manifest.json"
    if (Test-Path $catalogFile) {
        try {
            $manifest = Get-Content $catalogFile -Raw | ConvertFrom-Json
            if ($manifest.clientId -eq $id) {
                Write-Done "Catalog manifest clientId is correct ($id)"
            } else {
                Write-Warn "Catalog manifest clientId mismatch: expected '$id', got '$($manifest.clientId)'"
                $errors++
            }
        } catch {
            Write-Warn "Could not parse catalog manifest: $_"
        }
    }

    Write-Host ''
    if ($errors -eq 0) {
        Write-Host '  All validation checks passed.' -ForegroundColor Green
    } else {
        Write-Host "  $errors validation check(s) failed — review warnings above." -ForegroundColor Red
        Write-Host "  Re-run this script or fix the issues manually before proceeding." -ForegroundColor Yellow
    }
    return $errors
}

function Invoke-DashboardHealthCheck {
    <#
    .SYNOPSIS  Calls live dashboard APIs, verifies client name / modules / catalog /
               features, and auto-fixes every detectable failure before reporting.
               Only issues that require manual intervention remain as [FAIL].
    #>
    param([Parameter(Mandatory)][hashtable]$Details)

    Write-Header 'Dashboard API Health Check + Auto-Fix'

    $id          = $Details.clientId
    $displayName = $Details.displayName
    $baseUrl     = 'http://localhost:3333'
    $pass  = 0
    $fail  = 0
    $warn  = 0
    $fixed = 0

    # ── helpers ────────────────────────────────────────────────────────────
    function Api-Get([string]$Path) {
        try { return Invoke-RestMethod -Method GET -Uri "$baseUrl$Path" -ErrorAction Stop }
        catch { return $null }
    }

    function Api-Reload {
        try { Invoke-RestMethod -Method POST -Uri "$baseUrl/api/admin/reload" -ErrorAction Stop | Out-Null }
        catch { }
        Start-Sleep -Milliseconds 600
    }

    function Print-Row([string]$Check, [string]$Detail, [string]$Status) {
        $colour = switch ($Status) {
            'PASS'  { 'Green'      }
            'FIXED' { 'Cyan'       }
            'FAIL'  { 'Red'        }
            'WARN'  { 'DarkYellow' }
            default { 'Gray'       }
        }
        $label = "[$Status]"
        $pad   = ' ' * [Math]::Max(1, 44 - $Check.Length)
        Write-Host "  $label$pad$Check" -ForegroundColor $colour -NoNewline
        if ($Detail) { Write-Host "  — $Detail" -ForegroundColor DarkGray } else { Write-Host '' }
    }

    function Fix-JsonField([string]$FilePath, [string]$FieldName, [string]$ExpectedValue) {
        <# Reads a JSON file, corrects one top-level string field, rewrites BOM-free. #>
        try {
            $obj = Get-Content $FilePath -Raw | ConvertFrom-Json
            $obj.$FieldName = $ExpectedValue
            $json      = $obj | ConvertTo-Json -Depth 10
            $utf8NoBom = New-Object System.Text.UTF8Encoding $false
            [System.IO.File]::WriteAllText($FilePath, $json, $utf8NoBom)
            return $true
        } catch {
            return $false
        }
    }

    function Ensure-ModuleInConfig([string]$Module) {
        <# Adds a missing module to the client config JSON modules array. #>
        $cfgPath = Join-Path $script:ClientsDir "$id.json"
        try {
            $obj = Get-Content $cfgPath -Raw | ConvertFrom-Json
            $mods = [System.Collections.Generic.List[string]]($obj.modules)
            if ($Module -notin $mods) {
                $mods.Add($Module)
                $obj.modules = $mods.ToArray()
                $json      = $obj | ConvertTo-Json -Depth 10
                $utf8NoBom = New-Object System.Text.UTF8Encoding $false
                [System.IO.File]::WriteAllText($cfgPath, $json, $utf8NoBom)
            }
            return $true
        } catch { return $false }
    }

    # ── 0. Ensure dashboard is reachable ───────────────────────────────────
    $ping = Api-Get '/api/clients'
    if ($null -eq $ping) {
        Write-Step 'Dashboard not running — starting node dashboard/server.js ...'
        Start-Process -FilePath 'node' -ArgumentList 'dashboard/server.js' `
            -WorkingDirectory $script:Root -NoNewWindow
        Start-Sleep -Seconds 4
        $ping = Api-Get '/api/clients'
        if ($null -eq $ping) {
            Write-Warn 'Dashboard could not be started automatically.'
            Write-Warn "Run: npm run dashboard  then re-run this script."
            return
        }
        Write-Done 'Dashboard started automatically.'
        $fixed++
    }

    # ── 1. Force reload so newly written files are visible ─────────────────
    Api-Reload

    # ==================================================================
    # CHECK GROUP A — Client registration
    # ==================================================================
    Write-Host ''
    Write-Host '  ── Client Registration ──────────────────────────────' -ForegroundColor DarkGray

    $clients    = Api-Get '/api/clients'
    $thisClient = if ($clients) { $clients | Where-Object { $_.clientId -eq $id } | Select-Object -First 1 } else { $null }

    if ($thisClient) {
        Print-Row "Client '$id' in /api/clients" '' 'PASS'; $pass++
    } else {
        # Auto-fix: clientId field in config may be wrong (casing, typo)
        Print-Row "Client '$id' in /api/clients" 'NOT FOUND — inspecting config...' 'FAIL'
        $cfgPath = Join-Path $script:ClientsDir "$id.json"
        if (Test-Path $cfgPath) {
            $raw = Get-Content $cfgPath -Raw | ConvertFrom-Json
            if ($raw.clientId -ne $id) {
                Write-Step "  Auto-fix: clientId in config is '$($raw.clientId)' — correcting to '$id'..."
                if (Fix-JsonField $cfgPath 'clientId' $id) {
                    Api-Reload
                    $clients    = Api-Get '/api/clients'
                    $thisClient = if ($clients) { $clients | Where-Object { $_.clientId -eq $id } | Select-Object -First 1 } else { $null }
                    if ($thisClient) {
                        Print-Row "Client '$id' after clientId fix" '' 'FIXED'; $fixed++; $fail--
                    } else {
                        Print-Row "Client '$id' still missing after fix" 'Check config manually' 'FAIL'; $fail++
                    }
                } else {
                    Print-Row "clientId auto-fix failed" "Edit $cfgPath manually" 'FAIL'; $fail++
                }
            } else {
                Print-Row "clientId field is correct but client not returned" `
                    'Try restarting dashboard: npm run dashboard' 'FAIL'; $fail++
            }
        } else {
            Print-Row "Config file missing" "$cfgPath not found — re-run new-client.ps1" 'FAIL'; $fail++
        }
    }

    # Display name check + fix
    if ($thisClient) {
        if ($thisClient.displayName -eq $displayName) {
            Print-Row "Display name: '$displayName'" '' 'PASS'; $pass++
        } else {
            Print-Row "Display name" "got '$($thisClient.displayName)', expected '$displayName'" 'FAIL'
            $cfgPath = Join-Path $script:ClientsDir "$id.json"
            Write-Step "  Auto-fix: correcting displayName in config..."
            if (Fix-JsonField $cfgPath 'displayName' $displayName) {
                Api-Reload
                $clients    = Api-Get '/api/clients'
                $thisClient = if ($clients) { $clients | Where-Object { $_.clientId -eq $id } | Select-Object -First 1 } else { $null }
                if ($thisClient -and $thisClient.displayName -eq $displayName) {
                    Print-Row "Display name fixed: '$displayName'" '' 'FIXED'; $fixed++
                } else {
                    Print-Row "Display name still wrong after fix" "Edit config manually" 'FAIL'; $fail++
                }
            } else {
                Print-Row "displayName auto-fix failed" "Edit config/clients/$id.json manually" 'FAIL'; $fail++
            }
        }
    }

    # ==================================================================
    # CHECK GROUP B — Environments
    # ==================================================================
    Write-Host ''
    Write-Host '  ── Environments ─────────────────────────────────────' -ForegroundColor DarkGray

    $clientDetail = Api-Get "/api/clients/$id"
    if ($clientDetail) {
        $envKeys = if ($clientDetail.environments) {
            ($clientDetail.environments | Get-Member -MemberType NoteProperty).Name
        } else { @() }

        if ($envKeys.Count -gt 0) {
            Print-Row "Environments: $($envKeys -join ', ')" '' 'PASS'; $pass++
        } else {
            Print-Row "No environments in API response" `
                'Add at least one URL in config — no auto-fix possible' 'WARN'; $warn++
        }
    } else {
        Print-Row "/api/clients/$id unreachable" 'API returned null' 'FAIL'; $fail++
    }

    # ==================================================================
    # CHECK GROUP C — Modules
    # ==================================================================
    Write-Host ''
    Write-Host '  ── Modules ──────────────────────────────────────────' -ForegroundColor DarkGray

    $modulesResp = Api-Get "/api/modules?clientId=$id"
    $apiModules  = if ($modulesResp -and $modulesResp.modules) { @($modulesResp.modules) } else { @() }
    $cfgModules  = @($Details.modules)

    if ($apiModules.Count -gt 0) {
        Print-Row "Modules returned: $($apiModules -join ', ')" '' 'PASS'; $pass++
    } else {
        Print-Row "0 modules from API" 'Expected until catalog skill runs' 'WARN'; $warn++
    }

    # Modules that are in config but missing from API — try patching config
    $missingMods = $cfgModules | Where-Object { $_ -notin $apiModules }
    if ($missingMods.Count -gt 0) {
        foreach ($mod in $missingMods) {
            Print-Row "Module '$mod' missing from API" 'Verifying config...' 'FAIL'
            $cfgPath = Join-Path $script:ClientsDir "$id.json"
            if (Test-Path $cfgPath) {
                $raw = Get-Content $cfgPath -Raw | ConvertFrom-Json
                $rawMods = @($raw.modules)
                if ($mod -notin $rawMods) {
                    Write-Step "  Auto-fix: adding '$mod' to modules[] in config..."
                    if (Ensure-ModuleInConfig $mod) {
                        Api-Reload
                        $modulesResp = Api-Get "/api/modules?clientId=$id"
                        $apiModules  = if ($modulesResp -and $modulesResp.modules) { @($modulesResp.modules) } else { @() }
                        if ($mod -in $apiModules) {
                            Print-Row "Module '$mod' added and visible" '' 'FIXED'; $fixed++; $fail--
                        } else {
                            Print-Row "Module '$mod' added to config but not in API yet" `
                                'May appear after catalog skill' 'WARN'; $warn++
                        }
                    } else {
                        Print-Row "Auto-fix failed for '$mod'" "Edit config/clients/$id.json manually" 'FAIL'; $fail++
                    }
                } else {
                    Print-Row "Module '$mod' in config but not API" `
                        'Catalog manifest may be empty — run catalog skill' 'WARN'; $warn++
                }
            }
        }
    } elseif ($apiModules.Count -gt 0) {
        Print-Row "All configured modules visible" '' 'PASS'; $pass++
    }

    # ==================================================================
    # CHECK GROUP D — Catalog entries + leaked entries
    # ==================================================================
    Write-Host ''
    Write-Host '  ── Catalog & Features ───────────────────────────────' -ForegroundColor DarkGray

    $catalogEntries = Api-Get "/api/catalog?clientId=$id"
    $entryCount     = if ($catalogEntries) { @($catalogEntries).Count } else { 0 }

    if ($entryCount -gt 0) {
        Print-Row "Catalog: $entryCount feature(s) found" '' 'PASS'; $pass++

        $byModule = @($catalogEntries) | Group-Object { $_.moduleId } | Sort-Object Name
        foreach ($grp in $byModule) {
            Print-Row "  Module '$($grp.Name)': $($grp.Count) feature(s)" '' 'PASS'
        }

        # Wrong-client leak check — auto-fix by forcing cache reload
        $wrongClient = @($catalogEntries) | Where-Object { $_.clientId -ne $id }
        if ($wrongClient.Count -gt 0) {
            $wrongIds = ($wrongClient | Select-Object -ExpandProperty clientId -Unique) -join ', '
            Print-Row "Leaked entries from: $wrongIds ($($wrongClient.Count))" `
                'Forcing cache reload to fix...' 'FAIL'
            Write-Step "  Auto-fix: forcing full cache reload..."
            Api-Reload
            # Re-check after reload
            $catalogEntries = Api-Get "/api/catalog?clientId=$id"
            $stillLeaked    = if ($catalogEntries) {
                @($catalogEntries) | Where-Object { $_.clientId -ne $id }
            } else { @() }

            if ($stillLeaked.Count -eq 0) {
                Print-Row "Leaked entries cleared after reload" '' 'FIXED'; $fixed++; $fail--
            } else {
                # Entries still leaking — the plain-featureId key bug persists
                $stillIds = ($stillLeaked | Select-Object -ExpandProperty clientId -Unique) -join ', '
                Print-Row "Entries still leaking from: $stillIds" `
                    'Restart the dashboard server: npm run dashboard' 'FAIL'
                Write-Host '    Root cause: catalog cache not fully flushed.' -ForegroundColor DarkGray
                Write-Host '    Fix: Stop dashboard, run "npm run dashboard", then re-run this check.' -ForegroundColor DarkGray
                $fail++
            }
        } else {
            Print-Row "No wrong-client entries leaked" '' 'PASS'; $pass++
        }
    } else {
        Print-Row "0 catalog entries" 'Expected — run functional-test-catalog skill' 'WARN'; $warn++
    }

    # ── Catalog .md extension guard — auto-fix .md → .html where .html exists ──
    Write-Host ''
    Write-Host '  ── Catalog File Extension Check ─────────────────────' -ForegroundColor DarkGray

    $globalManifestPath = Join-Path $script:Root 'dashboard\catalog-manifest.json'
    $perClientManifestPath = Join-Path $script:CatalogsDir "$id-manifest.json"

    foreach ($manifestPath in @($globalManifestPath, $perClientManifestPath)) {
        if (-not (Test-Path $manifestPath)) { continue }
        $manifestRaw  = Get-Content $manifestPath -Raw
        $manifestJson = $manifestRaw | ConvertFrom-Json
        $fixedCount   = 0

        # Collect all catalogFile values — handle both flat object and nested under "features"
        $entries = if ($manifestJson.PSObject.Properties['features']) {
            $manifestJson.features.PSObject.Properties
        } else {
            $manifestJson.PSObject.Properties | Where-Object { $_.Value -is [PSCustomObject] -and $_.Value.PSObject.Properties['catalogFile'] }
        }

        foreach ($entry in $entries) {
            $val = if ($entry.Value.PSObject.Properties['catalogFile']) { $entry.Value.catalogFile } else { $null }
            if (-not $val -or $val -notmatch '\.md$') { continue }

            $absPath    = Join-Path $script:Root "docs\$val"
            $htmlPath   = $absPath -replace '\.md$', '.html'
            $htmlRelVal = $val    -replace '\.md$', '.html'

            if (Test-Path $htmlPath) {
                # Patch the raw JSON string and rewrite file
                $manifestRaw = $manifestRaw -replace [regex]::Escape($val), $htmlRelVal
                $fixedCount++
                Print-Row "Auto-fixed catalogFile: $($entry.Name)" ".md → .html" 'FIXED'
                $fixed++
            } else {
                Print-Row "catalogFile points to .md with no .html counterpart" $val 'WARN'
                $warn++
            }
        }

        if ($fixedCount -gt 0) {
            $utf8NoBom = New-Object System.Text.UTF8Encoding $false
            [System.IO.File]::WriteAllText($manifestPath, $manifestRaw, $utf8NoBom)
        }
    }

    # ==================================================================
    # CHECK GROUP E — API health probe
    # ==================================================================
    Write-Host ''
    Write-Host '  ── API Health Probe ─────────────────────────────────' -ForegroundColor DarkGray

    $health = Api-Get "/api/health?client=$id"
    if ($health) {
        if ($health.ok) {
            Print-Row "Health probe passed" '' 'PASS'; $pass++
        } else {
            # Gather issue detail from health response
            $issues = if ($health.issues) { ($health.issues -join '; ') } else { 'see /api/health for details' }
            Print-Row "Health probe failed" $issues 'FAIL'; $fail++

            # Common auto-fixable: missing env file
            $missingEnv = if ($health.issues) {
                $health.issues | Where-Object { $_ -match '\.env\.' }
            } else { @() }
            foreach ($envIssue in $missingEnv) {
                Write-Host "    Issue: $envIssue" -ForegroundColor DarkGray
                Write-Host "    Fix: create the missing .env file with BASE_URL=<your url>" -ForegroundColor DarkGray
            }
        }
    } else {
        Print-Row "Health endpoint unreachable" '' 'WARN'; $warn++
    }

    # ==================================================================
    # FINAL SUMMARY
    # ==================================================================
    Write-Host ''
    Write-Host ('─' * 62) -ForegroundColor DarkGray
    $total = $pass + $fail + $warn
    Write-Host ("  Results:  {0} passed  |  {1} auto-fixed  |  {2} warned  |  {3} failed  (of {4} checks)" `
        -f $pass, $fixed, $warn, $fail, $total) -ForegroundColor $(
            if ($fail -gt 0) { 'Red' } elseif ($warn -gt 0) { 'DarkYellow' } else { 'Green' }
        )
    Write-Host ''

    if ($fixed -gt 0) {
        Write-Host "  $fixed issue(s) were detected and auto-fixed." -ForegroundColor Cyan
    }
    if ($fail -gt 0) {
        Write-Host "  $fail issue(s) could NOT be auto-fixed — manual action required:" -ForegroundColor Red
        Write-Host '    [FAIL] items above each show the recommended fix.' -ForegroundColor DarkGray
    }
    if ($warn -gt 0) {
        Write-Host "  $warn warning(s) are informational — expected until catalog skills run." -ForegroundColor DarkYellow
    }
    if ($fail -eq 0 -and $warn -eq 0) {
        Write-Host '  All checks passed. Client is fully registered and healthy.' -ForegroundColor Green
    }
    Write-Host ('─' * 62) -ForegroundColor DarkGray
}

# ==============================================================
# SUMMARY
# ==============================================================

function Show-Summary {
    param(
        [Parameter(Mandatory)][hashtable]$Details,
        [Parameter(Mandatory)][string[]]$FoldersCreated,
        [Parameter(Mandatory)][string[]]$FilesGenerated
    )

    $modeLabel = if ($Details.repoUrl) { 'Cloned from remote' } else { 'Existing local clone' }

    Write-Host ''
    Write-Host ('=' * 62) -ForegroundColor Green
    $summaryTitle = if ($script:ExistingClientMode) { '  Existing client — changes applied' } else { '  Client successfully onboarded' }
    Write-Host $summaryTitle -ForegroundColor Green
    Write-Host ('=' * 62) -ForegroundColor Green
    Write-Host ''
    Write-Host "  Client ID      : $($Details.clientId)"    -ForegroundColor White
    Write-Host "  Display Name   : $($Details.displayName)" -ForegroundColor White
    Write-Host "  Client Type    : $($Details.clientType)"  -ForegroundColor White
    Write-Host "  Repository Path: $($Details.localPath)"   -ForegroundColor White
    Write-Host "  Branch         : $($Details.branch)"      -ForegroundColor White
    Write-Host "  Repo Source    : $modeLabel"               -ForegroundColor White
    Write-Host ''

    if ($FoldersCreated.Count -gt 0) {
        Write-Host '  Folders Created:' -ForegroundColor Cyan
        foreach ($f in $FoldersCreated) { Write-Host "    $f" -ForegroundColor DarkCyan }
        Write-Host ''
    }

    if ($FilesGenerated.Count -gt 0) {
        Write-Host '  Files Generated:' -ForegroundColor Cyan
        foreach ($f in $FilesGenerated) { Write-Host "    $f" -ForegroundColor DarkCyan }
        Write-Host ''
    }
}

function Show-ExistingFeatureCopilotCommands {
    <#
    .SYNOPSIS Prints intent-aware Copilot Chat commands for existing features.
              Called after scaffold loop when ExistingClientMode and features had intents.
    #>
    param(
        [Parameter(Mandatory)][string]$ClientId,
        [System.Collections.Generic.List[hashtable]]$CopilotCommands,
        [bool]$PrependMode
    )

    if (-not $CopilotCommands -or $CopilotCommands.Count -eq 0) { return }

    Write-Host ''
    Write-Host ('═' * 62) -ForegroundColor Cyan
    Write-Host '  COPILOT CHAT COMMANDS FOR EXISTING FEATURES' -ForegroundColor Cyan
    Write-Host '  Run each command below in VS Code Copilot Chat.' -ForegroundColor DarkGray
    Write-Host ('═' * 62) -ForegroundColor Cyan
    Write-Host ''

    if ($PrependMode) {
        Write-Host '  NEW TEST CASES WILL BE ADDED AT THE TOP of each section.' -ForegroundColor Green
        Write-Host '  Include this instruction in your Copilot Chat message:' -ForegroundColor DarkGray
        Write-Host '    "Prepend new test cases — place them BEFORE existing rows in each tier."' -ForegroundColor Yellow
        Write-Host ''
    }

    foreach ($entry in $CopilotCommands) {
        $mod    = $entry.mod
        $feat   = $entry.feat
        $intent = $entry.intent

        Write-Host "  Module: $mod  |  Feature: $($feat.id)" -ForegroundColor White
        Write-Host ''

        switch ($intent) {
            'add-cases' {
                Write-Host '  Action: ADD new test cases to existing catalog (preserve existing rows)' -ForegroundColor DarkGray
                Write-Host ''
                Write-Host '  Step 1 — Source analysis (if source code changed since last run):' -ForegroundColor Cyan
                Write-Host "    @workspace /repo-analysis client=$ClientId module=$mod feature=$($feat.id)" -ForegroundColor White
                Write-Host ''
                Write-Host '  Step 2 — Add new test cases to catalog (prepend mode):' -ForegroundColor Cyan
                Write-Host "    @workspace /functional-test-catalog" -ForegroundColor White
                Write-Host "    client=$ClientId  module=$mod  feature=$($feat.id)" -ForegroundColor White
                Write-Host "    mode=append  prepend=true" -ForegroundColor Yellow
                Write-Host ''
                Write-Host '  Step 3 — Re-generate spec file with new cases included:' -ForegroundColor Cyan
                Write-Host "    @workspace /playwright-test-generation" -ForegroundColor White
                Write-Host "    client=$ClientId  module=$mod  feature=$($feat.id)  mode=append" -ForegroundColor White
            }
            'regenerate' {
                Write-Host '  Action: REGENERATE full catalog (replaces existing catalog entirely)' -ForegroundColor DarkGray
                Write-Host ''
                Write-Host '  Step 1 — Fresh source analysis:' -ForegroundColor Cyan
                Write-Host "    @workspace /repo-analysis client=$ClientId module=$mod feature=$($feat.id)" -ForegroundColor White
                Write-Host ''
                Write-Host '  Step 2 — Regenerate full catalog:' -ForegroundColor Cyan
                Write-Host "    @workspace /functional-test-catalog" -ForegroundColor White
                Write-Host "    client=$ClientId  module=$mod  feature=$($feat.id)" -ForegroundColor White
                Write-Host ''
                Write-Host '  Step 3 — Regenerate full spec file:' -ForegroundColor Cyan
                Write-Host "    @workspace /playwright-test-generation" -ForegroundColor White
                Write-Host "    client=$ClientId  module=$mod  feature=$($feat.id)" -ForegroundColor White
            }
            'regen-and-gen' {
                Write-Host '  Action: REGENERATE catalog + RE-GENERATE all test files' -ForegroundColor DarkGray
                Write-Host ''
                Write-Host '  Step 1 — Fresh source analysis:' -ForegroundColor Cyan
                Write-Host "    @workspace /repo-analysis client=$ClientId module=$mod feature=$($feat.id)" -ForegroundColor White
                Write-Host ''
                Write-Host '  Step 2 — Regenerate full catalog:' -ForegroundColor Cyan
                Write-Host "    @workspace /functional-test-catalog" -ForegroundColor White
                Write-Host "    client=$ClientId  module=$mod  feature=$($feat.id)" -ForegroundColor White
                Write-Host ''
                Write-Host '  Step 3 — Regenerate spec + page object files:' -ForegroundColor Cyan
                Write-Host "    @workspace /playwright-test-generation" -ForegroundColor White
                Write-Host "    client=$ClientId  module=$mod  feature=$($feat.id)  mode=full-regen" -ForegroundColor White
            }
        }
        Write-Host ''
        Write-Host ('─' * 62) -ForegroundColor DarkGray
        Write-Host ''
    }
}

function Show-NextSkills {
    <#
    .SYNOPSIS Prints the exact Copilot Chat commands for each follow-on skill,
              pre-filled with the collected client details.
    #>
    param([Parameter(Mandatory)][hashtable]$Details)

    $id      = $Details.clientId
    $modules = $Details.modules -join ', '
    $repo    = if ($Details.localPath) { $Details.localPath } else { '(not set)' }

    Write-Host ''
    Write-Host ('─' * 62) -ForegroundColor DarkGray
    Write-Host '  Next Steps — Run in Order' -ForegroundColor Yellow
    Write-Host ('─' * 62) -ForegroundColor DarkGray
    Write-Host ''

    Write-Host '  STEP 1 — Repo Analysis  (discover what features exist in the source code)' -ForegroundColor Cyan
    Write-Host "    In Copilot Chat: /repo-analysis" -ForegroundColor White
    Write-Host "    Client: $id  |  Modules: $modules" -ForegroundColor DarkGray
    Write-Host "    Repo path: $repo" -ForegroundColor DarkGray
    Write-Host ''

    Write-Host '  STEP 2 — Scaffold each feature  (run once per feature found in Step 1)' -ForegroundColor Cyan
    Write-Host '    WHY: new-client.ps1 sets up the client shell but cannot scaffold features' -ForegroundColor DarkGray
    Write-Host '    because feature names are only known AFTER repo-analysis discovers them.' -ForegroundColor DarkGray
    Write-Host ''
    foreach ($mod in $Details.modules) {
        Write-Host "    .\scripts\new-module.ps1 -Client $id -Module $mod -Feature {feature} -Label `"{Feature Label}`"" -ForegroundColor White
        Write-Host "    Example:" -ForegroundColor DarkGray
        Write-Host "      .\scripts\new-module.ps1 -Client $id -Module $mod -Feature submit-claim -Label `"Submit Claim`"" -ForegroundColor DarkGray
    }
    Write-Host '    Repeat for every feature in this module.' -ForegroundColor DarkGray
    Write-Host ''

    Write-Host '  STEP 3 — Functional Test Catalog  (generate test cases — one per feature)' -ForegroundColor Cyan
    foreach ($mod in $Details.modules) {
        Write-Host "    In Copilot Chat: /functional-test-catalog  client=$id  module=$mod  feature={feature}" -ForegroundColor White
    }
    Write-Host '    Review and approve the catalog before proceeding.' -ForegroundColor DarkGray
    Write-Host ''

    Write-Host '  STEP 4 — Playwright Test Generation  (implement spec + page object files)' -ForegroundColor Cyan
    foreach ($mod in $Details.modules) {
        Write-Host "    In Copilot Chat: /playwright-test-generation  client=$id  module=$mod  feature={feature}" -ForegroundColor White
    }
    Write-Host ''

    Write-Host '  STEP 5 — Auth Setup  (save Playwright session cookies — against UAT)' -ForegroundColor Cyan
    Write-Host "    `$env:TEST_ENV='uat' ; npx playwright test --project=setup-$id" -ForegroundColor White
    Write-Host ''

    Write-Host '  STEP 6 — Verify on Dashboard' -ForegroundColor Cyan
    Write-Host "    npm run dashboard   then open: http://localhost:3333" -ForegroundColor White
    Write-Host "    Select client: $id  — confirm features appear and catalogs open correctly." -ForegroundColor DarkGray
    Write-Host ''

    Write-Host '  STEP 7 — Run Smoke Tests  (against UAT only)' -ForegroundColor Cyan
    Write-Host "    `$env:TEST_ENV='uat' ; npx playwright test --project=chromium-$id --grep @smoke" -ForegroundColor White
    Write-Host ''

    Write-Host ('═' * 62) -ForegroundColor Yellow
    Write-Host '  PRE-HANDOFF VERIFICATION CHECKLIST' -ForegroundColor Yellow
    Write-Host '  Run AFTER Steps 1-4 (Copilot skills) are complete.' -ForegroundColor Yellow
    Write-Host '  All tests target UAT environment only.' -ForegroundColor Yellow
    Write-Host ('═' * 62) -ForegroundColor Yellow
    Write-Host ''
    Write-Host '  [ ] 1. No credential placeholders remain' -ForegroundColor White
    Write-Host "          Get-Content config\users\$id\users.json | Select-String 'REPLACE_WITH'" -ForegroundColor DarkGray
    Write-Host '          Expected: no matches (fill real credentials first)' -ForegroundColor DarkGray
    Write-Host ''
    Write-Host '  [ ] 2. TypeScript compiles cleanly (after skills generate files)' -ForegroundColor White
    Write-Host '          npx tsc --noEmit' -ForegroundColor DarkGray
    Write-Host '          Expected: zero errors' -ForegroundColor DarkGray
    Write-Host ''
    Write-Host '  [ ] 3. Auth setup succeeds against UAT (login reaches the app)' -ForegroundColor White
    Write-Host "          `$env:TEST_ENV='uat' ; npx playwright test --project=setup-$id" -ForegroundColor DarkGray
    Write-Host '          Expected: PASSED — storage state file saved to:' -ForegroundColor DarkGray
    Write-Host "          tests/playwright/fixtures/.auth/$id/" -ForegroundColor DarkGray
    Write-Host ''
    Write-Host '  [ ] 4. Catalog appears on dashboard' -ForegroundColor White
    Write-Host '          npm run dashboard  →  open http://localhost:3333' -ForegroundColor DarkGray
    Write-Host "          Select client: $id" -ForegroundColor DarkGray
    Write-Host '          Expected: all features listed, View Catalog opens HTML (not blank/md)' -ForegroundColor DarkGray
    Write-Host ''
    Write-Host '  [ ] 5. Smoke tests pass on UAT (no auth/infra errors)' -ForegroundColor White
    Write-Host "          `$env:TEST_ENV='uat' ; npx playwright test --project=chromium-$id --grep @smoke" -ForegroundColor DarkGray
    Write-Host '          Expected: tests execute against UAT app' -ForegroundColor DarkGray
    Write-Host '          fixme / skip = OK (not yet implemented)' -ForegroundColor DarkGray
    Write-Host '          timeout / login redirect / 401 = NOT OK (fix before handoff)' -ForegroundColor DarkGray
    Write-Host ''
    Write-Host ('═' * 62) -ForegroundColor Yellow
    Write-Host '  Hand off to the developer only when all 5 boxes are ticked.' -ForegroundColor Green
    Write-Host ('═' * 62) -ForegroundColor Yellow
    Write-Host ''
}

# ==============================================================
# MAIN ORCHESTRATION
# ==============================================================

Clear-Host
Write-Host ''
Write-Host ('=' * 62) -ForegroundColor Cyan
Write-Host '  New Client Onboarding — Playwright Automation Framework'  -ForegroundColor Cyan
Write-Host ('=' * 62) -ForegroundColor Cyan
Write-Host ''
Write-Host '  This wizard runs in two phases:' -ForegroundColor DarkGray
Write-Host '   Phase 0  All questions asked upfront — no files written yet.' -ForegroundColor DarkGray
Write-Host '   Phase 1  All files created + validation + dashboard reload.' -ForegroundColor DarkGray
Write-Host ''
Write-Host '  Existing clients and tests will not be affected.' -ForegroundColor DarkGray
Write-Host ''

# ==============================================================
# PHASE 0 — COLLECT ALL INPUTS UPFRONT
# No files are written in this phase.
# ==============================================================

Write-Host ('─' * 62) -ForegroundColor Yellow
Write-Host '  PHASE 0: Questions' -ForegroundColor Yellow
Write-Host '  Answer all prompts below. You will review everything before' -ForegroundColor DarkGray
Write-Host '  any files are created.' -ForegroundColor DarkGray
Write-Host ('─' * 62) -ForegroundColor Yellow

# 0a: Repository mode
$modeChoice = Read-MenuChoice `
    -Prompt 'Do you already have the repository cloned locally?' `
    -Options @(
        'Yes - use existing local clone',
        'No  - clone from Azure DevOps / Git URL now'
    )

# 0b: Repository info (questions only — no clone yet)
$repoInfo = if ($modeChoice -eq 1) {
    Get-LocalRepoInfo
} else {
    Get-CloneInputs
}

# 0c: All client details, environment URLs, roles, modules, credentials, confirmation
#     (confirmation screen at end of Get-ClientDetails — user must say Yes before Phase 1 begins)
$details = Get-ClientDetails -RepoInfo $repoInfo

# ==============================================================
# PHASE 1 — EXECUTE ALL STEPS
# All questions are done. No more prompting from this point.
# ==============================================================

Write-Host ''
Write-Host ('─' * 62) -ForegroundColor Green
Write-Host '  PHASE 1: Executing' -ForegroundColor Green
Write-Host ('─' * 62) -ForegroundColor Green

# 1a: Clone repo if mode 2 and not using an existing folder
if ($modeChoice -eq 2 -and -not $repoInfo.useExisting) {
    Write-Header 'Step 1 — Cloning Repository'
    Invoke-CloneRepo -CloneInfo $repoInfo
} else {
    Write-Done "Step 1 — Repository: $($repoInfo.localPath)"
}

# 1a-ii: Ensure node_modules exist and Playwright Chromium is installed
Write-Header 'Step 1b — Node Dependencies + Playwright Browsers'

$nodeModulesPath = Join-Path $script:Root 'node_modules'
if (-not (Test-Path $nodeModulesPath)) {
    Write-Step 'node_modules not found — running npm install...'
    Push-Location $script:Root
    npm install
    Pop-Location
    if ($LASTEXITCODE -ne 0) {
        Write-Warn 'npm install failed. Fix any errors above before continuing.'
    } else {
        Write-Done 'npm install complete'
    }
} else {
    Write-Done 'node_modules present'
}

# Check Chromium binary exists — install only chromium (fastest, most reliable)
$playwrightCli  = Join-Path $script:Root 'node_modules/@playwright/test/cli.js'
$chromiumMarker = Join-Path ([System.Environment]::GetFolderPath('LocalApplicationData')) `
                      'ms-playwright'

if (Test-Path $playwrightCli) {
    # Ask playwright for the expected chromium path
    $dryRun = & node $playwrightCli install --dry-run 2>&1
    $chromiumLine = $dryRun | Select-String 'Install location:.*chromium' | Select-Object -First 1
    $chromiumDir  = if ($chromiumLine) {
        ($chromiumLine -replace '.*Install location:\s*', '').Trim()
    } else { $null }

    # Look for the actual chrome.exe inside the expected folder
    $chromiumExe = if ($chromiumDir) {
        Get-ChildItem -Path $chromiumDir -Filter 'chrome.exe' -Recurse -ErrorAction SilentlyContinue |
            Select-Object -First 1 -ExpandProperty FullName
    } else { $null }

    if ($chromiumExe -and (Test-Path $chromiumExe)) {
        Write-Done "Chromium installed: $chromiumExe"
    } else {
        Write-Step 'Chromium not found — installing Playwright browsers (chromium only)...'
        & node $playwrightCli install chromium
        if ($LASTEXITCODE -ne 0) {
            Write-Warn 'Playwright browser install failed. Run manually: npx playwright install chromium'
        } else {
            Write-Done 'Chromium installed successfully'
        }
    }
} else {
    Write-Warn 'Playwright CLI not found. Run: npm install  then: npx playwright install chromium'
}

# 1b: Generate all config files and folder structure
Write-Header 'Step 2 — Generating Config Files and Folder Structure'

if ($script:ExistingClientMode) {
    Write-Host '    [SKIP] Existing client mode — skipping config/credential creation.' -ForegroundColor Cyan
    Write-Host '    [SKIP] Running dashboard wiring, folder structure, and health check only.' -ForegroundColor Cyan
    Write-Host ''
    # Still ensure folder structure and dashboard are up to date
    New-FunctionalCatalogFolder  -Details $details
    New-PlaywrightClientStructure -Details $details
    Update-DashboardHtml          -Details $details
} else {
    New-ClientConfig             -Details $details
    New-UserConfig               -Details $details
    Update-RepoRegistry          -Details $details
    New-CatalogManifest          -Details $details
    New-FunctionalCatalogFolder  -Details $details
    New-PlaywrightClientStructure -Details $details
    Update-DashboardHtml          -Details $details
}

# Scaffold starter features for every module via new-module.ps1
Write-Step 'Scaffolding features for each module...'
$newModuleScript = Join-Path $script:Root 'scripts\new-module.ps1'

# Track which features need Copilot skill commands printed (existing-feature intents)
$copilotCommands = [System.Collections.Generic.List[hashtable]]::new()

foreach ($mod in $details.modules) {
    $features = $details.moduleFeatures[$mod]
    if (-not $features) { continue }
    foreach ($feat in $features) {
        $isExisting = $feat.isExisting -eq $true
        $intent     = if ($feat.intent) { $feat.intent } else { 'new' }

        if ($isExisting) {
            # Do NOT re-scaffold existing feature files — only record Copilot commands to print
            Write-Host "  → $mod / $($feat.id) [EXISTING — skipping scaffold, will print Copilot commands]" -ForegroundColor Yellow
            $copilotCommands.Add(@{ mod = $mod; feat = $feat; intent = $intent })
        } else {
            # New feature — run new-module.ps1 as normal
            Write-Host "  → $mod / $($feat.id) ($($feat.label))" -ForegroundColor DarkGray
            & $newModuleScript `
                -Client $details.clientId `
                -Module $mod `
                -Feature $feat.id `
                -Label   $feat.label
            if ($LASTEXITCODE -ne 0) {
                Write-Warn "  Scaffold failed for $mod/$($feat.id) — run manually:"
                Write-Warn "  .\scripts\new-module.ps1 -Client $($details.clientId) -Module $mod -Feature $($feat.id) -Label `"$($feat.label)`""
            }
        }
    }
}
Write-Done 'Feature scaffold complete.'

# Print intent-aware Copilot commands for any existing features the user selected
if ($script:ExistingClientMode -and $copilotCommands.Count -gt 0) {
    Show-ExistingFeatureCopilotCommands `
        -ClientId        $details.clientId `
        -CopilotCommands $copilotCommands `
        -PrependMode     $script:PrependTestCases
}

# 1c: Self-validate all artifacts — block next steps if any credential placeholder remains
$validationErrors = Test-OnboardingArtifacts -Details $details

if ($validationErrors -gt 0) {
    Write-Host ''
    Write-Host ('─' * 62) -ForegroundColor Red
    Write-Host '  ⚠  ACTION REQUIRED before running the next skills' -ForegroundColor Red
    Write-Host ('─' * 62) -ForegroundColor Red
    Write-Host ''
    if ($details.authType -eq 'username-only') {
        Write-Host "  1. Open: config\users\$($details.clientId)\users.json" -ForegroundColor Yellow
        Write-Host '  2. Replace REPLACE_WITH_*_USERNAME with the real login' -ForegroundColor Yellow
        Write-Host '     value for each role (e.g. dealer code X1A0449).' -ForegroundColor Yellow
        Write-Host '  3. Ensure "password" is set to "" (empty string).' -ForegroundColor Yellow
    } else {
        Write-Host "  1. Open: config\users\$($details.clientId)\users.json" -ForegroundColor Yellow
        Write-Host '  2. Replace REPLACE_WITH_*_EMAIL with the real email.' -ForegroundColor Yellow
        Write-Host '  3. Encrypt each password:' -ForegroundColor Yellow
        Write-Host '       node utils/encrypt-credential.js "your-password"' -ForegroundColor Cyan
        Write-Host '     Paste the enc:... output into users.json.' -ForegroundColor Yellow
    }
    Write-Host ''
    Write-Host '  Auth setup WILL FAIL until credentials are filled in.' -ForegroundColor Red
    Write-Host ('─' * 62) -ForegroundColor Red
    Write-Host ''
}

# 1d: Reload dashboard cache if server is running
Write-Header 'Step 3 — Dashboard Reload'
try {
    $reloadResult = Invoke-RestMethod -Method POST `
        -Uri 'http://localhost:3333/api/admin/reload' `
        -ContentType 'application/json' `
        -ErrorAction Stop
    Write-Done "Dashboard cache reloaded: $($reloadResult.message)"
} catch {
    Write-Warn 'Dashboard not running or reload skipped.'
    Write-Warn 'Start it with: npm run dashboard  then refresh the browser.'
}

# 1e: Deep API health check — verify client, modules, catalog, features in live dashboard
Invoke-DashboardHealthCheck -Details $details

# 1g: TypeScript compile check — verify scaffolded files have no import errors
Write-Header 'Step 4 — TypeScript Compile Check'
$tscBin = Join-Path $script:Root 'node_modules\.bin\tsc.cmd'
if (Test-Path $tscBin) {
    Write-Step 'Running npx tsc --noEmit ...'
    $tscOutput = & $tscBin --noEmit 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Done 'TypeScript compile check passed — zero errors'
    } else {
        Write-Warn 'TypeScript compile check found errors:'
        $tscOutput | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkYellow }
        Write-Host '  Fix these before running tests.' -ForegroundColor Yellow
        Write-Host '  Common cause: template tokens not replaced — re-run new-module.ps1.' -ForegroundColor DarkGray
    }
} else {
    Write-Warn 'tsc not found — run: npm install  then re-run this wizard.'
}
$id = $details.clientId

Show-Summary `
    -Details $details `
    -FoldersCreated @(
        "\docs\functional-catalogs\$id\"
        "\tests\playwright\clients\$id\specs\"
        "\tests\playwright\clients\$id\pages\"
        "\tests\playwright\clients\$id\data\"
    ) `
    -FilesGenerated @(
        "\config\clients\$id.json"
        "\config\users\$id\users.json"
        "\config\repos.local.json  (clients.$id entry added)"
        "\dashboard\catalogs\$id-manifest.json"
        "\tests\playwright\clients\$id\specs\.gitkeep"
        "\tests\playwright\clients\$id\pages\.gitkeep"
        "\tests\playwright\clients\$id\data\.gitkeep"
    )

# 1h: Show the exact Copilot Chat skill commands to run next
Show-NextSkills -Details $details
