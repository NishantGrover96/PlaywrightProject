$path = "d:\Leads\PlayWright\dashboard\index.html"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

$content = $content.Replace('â€"', '—')
$content = $content.Replace('â€¦', '…')
$content = $content.Replace('â€¢', '•')
$content = $content.Replace('â€œ', '"')
$content = $content.Replace('â€™', "'")
$content = $content.Replace('â€˜', "'")
$content = $content.Replace('âš ', '⚠')
$content = $content.Replace('ðŸŽ­', '🎭')
$content = $content.Replace('â"€', '─')
$content = $content.Replace('â"‚', '│')

[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "Done. Replaced all garbled characters in $path"
