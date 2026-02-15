# Mass domain migration script for HTML files and sitemap
$workDir = 'c:\Users\starw\Documents\GitHub\ventistudio.fr'

# Update sitemap.xml
Write-Output "Updating sitemap.xml..."
$sitemap = [System.IO.File]::ReadAllText("$workDir\sitemap.xml", [System.Text.Encoding]::UTF8)
$newSitemap = $sitemap -replace 'ventistudio\.fr', 'ventistudio.eu'
[System.IO.File]::WriteAllText("$workDir\sitemap.xml", $newSitemap, [System.Text.Encoding]::UTF8)
Write-Output "✓ sitemap.xml updated"

# Update all HTML files
Write-Output "Updating HTML files..."
$htmlCount = 0
Get-ChildItem -Path $workDir -Filter '*.html' -Recurse | ForEach-Object {
    $filePath = $_.FullName
    $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
    
    if ($content -match 'ventistudio\.fr') {
        # Replace all occurrences
        $newContent = $content -replace 'ventistudio\.fr', 'ventistudio.eu'
        [System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.Encoding]::UTF8)
        $htmlCount++
    }
}
Write-Output "✓ Updated $htmlCount HTML files"

# Update migration script itself
Write-Output "Updating helper scripts..."
$scriptPath = "$workDir\migrate-domain.ps1"
if (Test-Path $scriptPath) {
    $scriptContent = [System.IO.File]::ReadAllText($scriptPath, [System.Text.Encoding]::UTF8)
    $newScriptContent = $scriptContent -replace 'ventistudio\.fr', 'ventistudio.eu'
    [System.IO.File]::WriteAllText($scriptPath, $newScriptContent, [System.Text.Encoding]::UTF8)
    Write-Output "✓ Migration script updated"
}

# Update generate-sitemap.ps1
$genPath = "$workDir\generate-sitemap.ps1"
if (Test-Path $genPath) {
    $genContent = [System.IO.File]::ReadAllText($genPath, [System.Text.Encoding]::UTF8)
    $newGenContent = $genContent -replace 'ventistudio\.fr', 'ventistudio.eu'
    [System.IO.File]::WriteAllText($genPath, $newGenContent, [System.Text.Encoding]::UTF8)
    Write-Output "✓ Sitemap generator script updated"
}

Write-Output ""
Write-Output "=== MIGRATION COMPLETE ==="
Write-Output "HTML files updated: $htmlCount"
Write-Output "Status: ventistudio.fr → ventistudio.eu ✓"
