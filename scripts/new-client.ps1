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

$script:Root          = Split-Path $PSScriptRoot -Parent
$script:ClientsDir    = Join-Path $script:Root 'config\clients'
$script:UsersDir      = Join-Path $script:Root 'config\users'
$script:CatalogsDir   = Join-Path $script:Root 'dashboard\catalogs'
$script:DocsDir       = Join-Path $script:Root 'docs\functional-catalogs'
$script:PlaywrightDir = Join-Path $script:Root 'tests\playwright\clients'
$script:ReposLocalJson = Join-Path $script:Root 'config\repos.local.json'

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
    $Content | ConvertTo-Json -Depth 10 | Set-Content -Path $Path -Encoding utf8
    Write-Done "Created  $($Path.Replace($script:Root, ''))"
}

# ==============================================================
# MODE 1 - USE EXISTING LOCAL REPO
# ==============================================================

function Get-LocalRepoInfo {
    Write-Header 'Mode 1 - Use Existing Local Repository'

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
        -Prompt 'Branch name (e.g. main, develop)' `
        -Validator {
            param($b)
            if (-not $b) { Write-Warn 'Branch name is required.'; return $false }

            # Accept if it exists locally
            $local = git -C $repoPath branch --list $b 2>&1
            if ($local -match [regex]::Escape($b)) { return $true }

            # Accept if it exists remotely
            $remote = git -C $repoPath branch -r 2>&1 | Where-Object { $_ -match "/$b$" -or $_ -match "/$b\s" }
            if ($remote) { return $true }

            Write-Warn "Branch '$b' not found locally or remotely. Run 'git fetch' first if it's a remote branch."
            return $false
        }

    Write-Done "Branch '$branch' confirmed."

    return [ordered]@{
        localPath = $repoPath
        branch    = $branch
        url       = ''          # unknown for pre-cloned repos
        cloned    = $false
    }
}

# ==============================================================
# MODE 2 - CLONE REPOSITORY
# ==============================================================

function Invoke-CloneRepo {
    Write-Header 'Mode 2 - Clone Repository'

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

    # Derive folder name from the URL (strip .git suffix)
    $repoName   = ($gitUrl -split '/')[-1] -replace '\.git$', ''
    $targetPath = Join-Path $cloneRoot $repoName

    if (Test-Path $targetPath) {
        Write-Warn "Folder already exists: $targetPath"
        $useExisting = Read-YesNo 'Use existing folder (skip clone)?' -DefaultYes $false
        if (-not $useExisting) {
            Write-Fail 'Aborted. Remove the folder or choose a different destination.'
        }
        Write-Done 'Using existing folder.'
    } else {
        Write-Step "Cloning into '$targetPath' (branch: $branch)..."
        Write-Host '    (You may be prompted for Git credentials)' -ForegroundColor DarkGray
        try {
            git clone --branch $branch $gitUrl $targetPath 2>&1 | ForEach-Object { Write-Host "    $_" }
        } catch {
            Write-Fail "git clone threw an exception: $_"
        }
        if ($LASTEXITCODE -ne 0) {
            Write-Fail "git clone failed (exit $LASTEXITCODE). Check the URL, branch name, and your credentials."
        }
        Write-Done 'Clone successful.'
    }

    return [ordered]@{
        localPath = $targetPath
        branch    = $branch
        url       = $gitUrl
        cloned    = $true
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

    # --- Duplicate check ---
    $existingConfig = Join-Path $script:ClientsDir "$clientId.json"
    if (Test-Path $existingConfig) {
        Write-Warn "A client config already exists for '$clientId':"
        Write-Warn "  $existingConfig"
        $overwrite = Read-YesNo 'Overwrite existing configuration?' -DefaultYes $false
        if (-not $overwrite) {
            Write-Fail "Aborted. Choose a different Client ID or remove the existing config."
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
    Write-Host '    Production URL is required. Dev / Testing / UAT are optional.' -ForegroundColor DarkGray
    Write-Host ''

    $envDev     = Read-OptionalUrl  'Dev URL         (e.g. https://client-dev.example.com)'
    $envTesting = Read-OptionalUrl  'Testing URL      (e.g. https://client-test.example.com)'
    $envUat     = Read-OptionalUrl  'UAT URL         (e.g. https://client-uat.example.com)'
    $envProd    = Read-ValidatedInput `
                    -Prompt 'Production URL  (required)' `
                    -Validator { param($u) Test-UrlFormat $u }

    # --- Auth ---
    Write-Header 'Authentication'

    $loginPath = Read-RequiredInput -Prompt 'Login path (e.g. /login, /Account/Login)' -Default '/login'

    # --- Roles ---
    $rolesRaw = Read-RequiredInput -Prompt 'Roles, comma-separated (e.g. dealer,admin)' -Default 'dealer,admin'
    $roles    = @($rolesRaw -split ',' | ForEach-Object { $_.Trim().ToLower() } | Where-Object { $_ })

    # --- Modules ---
    $availableModules = @('coop', 'engage-ads', 'popshop', 'rebate', 'admin')
    Write-Host ''
    Write-Host '    Which modules are enabled for this client?' -ForegroundColor White
    Write-Host '    Enter numbers separated by commas (e.g. 1,2,4)' -ForegroundColor DarkGray
    for ($i = 0; $i -lt $availableModules.Count; $i++) {
        Write-Host "      $($i + 1).  $($availableModules[$i])"
    }
    $selectedModules = @()
    while ($selectedModules.Count -eq 0) {
        $raw = (Read-Host '    Modules (comma-separated numbers, or "all" for all)').Trim()
        if ($raw -eq 'all') {
            $selectedModules = $availableModules
        } else {
            $nums = $raw -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ }
            $valid = $true
            $chosen = @()
            foreach ($n in $nums) {
                [int]$idx = 0
                if ([int]::TryParse($n, [ref]$idx) -and $idx -ge 1 -and $idx -le $availableModules.Count) {
                    $chosen += $availableModules[$idx - 1]
                } else {
                    Write-Warn "Invalid choice '$n'. Enter numbers 1-$($availableModules.Count) or 'all'."
                    $valid = $false
                    break
                }
            }
            if ($valid -and $chosen.Count -gt 0) { $selectedModules = $chosen }
        }
    }
    Write-Done "Selected modules: $($selectedModules -join ', ')"

    # --- Credentials per role ---
    Write-Header 'Login Credentials'
    Write-Host '    Enter the email and password for each role.' -ForegroundColor DarkGray
    Write-Host '    Passwords are encrypted immediately - plaintext is never saved to disk.' -ForegroundColor DarkGray
    Write-Host '    Tip: ensure MASTER_KEY is set in your environment or .env.production before running.' -ForegroundColor DarkGray
    Write-Host ''

    $credentials = [ordered]@{}
    foreach ($role in $roles) {
        Write-Host "    Role: $role" -ForegroundColor White
        $email    = Read-RequiredInput -Prompt "      Email for '$role' (e.g. dealer@samsung.com)"
        $password = Read-RequiredInput -Prompt "      Password for '$role'"

        Write-Step "Encrypting password for '$role'..."
        $encryptScript = Join-Path $script:Root 'utils\encrypt-credential.js'
        $encResult = (node $encryptScript $password 2>&1) | Select-Object -Last 1
        if ($LASTEXITCODE -ne 0 -or ($encResult -notmatch '^enc:')) {
            Write-Warn "Encryption failed for '$role' (is MASTER_KEY set?): $encResult"
            Write-Warn "Password stored as plaintext placeholder - replace manually."
            $encPassword = 'REPLACE_WITH_ENCRYPTED_PASSWORD'
        } else {
            $encPassword = $encResult.Trim()
            Write-Done "Password encrypted for '$role'."
        }

        $credentials[$role] = [ordered]@{
            email    = $email
            password = $encPassword
        }
        Write-Host ''
    }

    # Determine default environment
    $defaultEnv = 'production'
    if ($envUat)     { $defaultEnv = 'uat' }
    if ($envProd)    { $defaultEnv = 'production' }

    return [ordered]@{
        clientId     = $clientId
        displayName  = $displayName
        clientType   = $clientType
        loginPath    = $loginPath
        roles        = $roles
        credentials  = $credentials
        modules      = $selectedModules
        repoUrl      = $RepoInfo.url
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
        baseUrl = $Details.environments.prod
        apiUrl  = $Details.environments.prod
        envFile = 'production'
    }

    $config = [ordered]@{
        clientId           = $Details.clientId
        displayName        = $Details.displayName
        platform           = $Details.clientType
        defaultEnvironment = $Details.defaultEnv
        authentication     = [ordered]@{
            loginPath = $Details.loginPath
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
        $cred     = if ($Details.credentials) { $Details.credentials[$role] } else { $null }
        $email    = if ($cred -and $cred.email)    { $cred.email }    else { "REPLACE_WITH_$($role.ToUpper())_EMAIL" }
        $password = if ($cred -and $cred.password) { $cred.password } else { 'REPLACE_WITH_ENCRYPTED_PASSWORD' }
        $users[$role] = [ordered]@{
            role        = $role
            displayName = (Get-Culture).TextInfo.ToTitleCase($role)
            email       = $email
            password    = $password
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

    $registryObj | ConvertTo-Json -Depth 10 | Set-Content -Path $script:ReposLocalJson -Encoding utf8
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
    Write-Host '  Client successfully onboarded' -ForegroundColor Green
    Write-Host ('=' * 62) -ForegroundColor Green
    Write-Host ''
    Write-Host "  Client ID      : $($Details.clientId)"    -ForegroundColor White
    Write-Host "  Display Name   : $($Details.displayName)" -ForegroundColor White
    Write-Host "  Client Type    : $($Details.clientType)"  -ForegroundColor White
    Write-Host "  Repository Path: $($Details.localPath)"   -ForegroundColor White
    Write-Host "  Branch         : $($Details.branch)"      -ForegroundColor White
    Write-Host "  Repo Source    : $modeLabel"               -ForegroundColor White
    Write-Host ''

    Write-Host '  Folders Created:' -ForegroundColor Cyan
    foreach ($f in $FoldersCreated) {
        Write-Host "    $f" -ForegroundColor DarkCyan
    }
    Write-Host ''

    Write-Host '  Files Generated:' -ForegroundColor Cyan
    foreach ($f in $FilesGenerated) {
        Write-Host "    $f" -ForegroundColor DarkCyan
    }
    Write-Host ''

    Write-Host ('─' * 62) -ForegroundColor DarkGray
    Write-Host '  Next Step:' -ForegroundColor Yellow
    Write-Host '  Run the repository analysis skill to discover modules and' -ForegroundColor White
    Write-Host '  features, then generate the functional catalog.' -ForegroundColor White
    Write-Host ''
    Write-Host '  In GitHub Copilot Chat, type:' -ForegroundColor DarkGray
    Write-Host "    Run repo-analysis skill for client: $($Details.clientId)" -ForegroundColor DarkGray
    Write-Host ('─' * 62) -ForegroundColor DarkGray
    Write-Host ''
}

# ==============================================================
# MAIN ORCHESTRATION
# ==============================================================

Clear-Host
Write-Header 'New Client Onboarding - Playwright Framework'
Write-Host '  This script registers a new client and prepares all config' -ForegroundColor DarkGray
Write-Host '  files, folder structure, and manifest stubs for test generation.' -ForegroundColor DarkGray
Write-Host ''
Write-Host '  Existing clients and tests will not be affected.' -ForegroundColor DarkGray
Write-Host ''

# -- Step 1: Repository mode ----------------------------------
$modeChoice = Read-MenuChoice `
    -Prompt 'Do you already have the repository cloned locally?' `
    -Options @(
        'Yes - use existing local clone',
        'No  - clone from Azure DevOps / Git URL'
    )

$repoInfo = if ($modeChoice -eq 1) {
    Get-LocalRepoInfo
} else {
    Invoke-CloneRepo
}

# -- Step 2: Collect client details ---------------------------
$details = Get-ClientDetails -RepoInfo $repoInfo

# -- Step 3: Generate all artifacts ---------------------------
Write-Header 'Generating Config Files and Folder Structure'

New-ClientConfig             -Details $details
New-UserConfig               -Details $details
Update-RepoRegistry          -Details $details
New-CatalogManifest          -Details $details
New-FunctionalCatalogFolder  -Details $details
New-PlaywrightClientStructure -Details $details

# -- Step 4: Print summary ------------------------------------
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
