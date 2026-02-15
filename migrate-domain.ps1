# Script de migration ventistudio.fr -> ventistudio.eu
$workDir = 'c:\Users\starw\Documents\GitHub\ventistudio.fr'

# Fichiers à traiter
$filesToUpdate = @(
    'robots.txt',
    'llms.txt',
    'ads.txt',
    'humans.txt',
    'manifest.json',
    '.htaccess',
    '404.html',
    '.well-known\security.txt'
)

$count = 0
foreach ($file in $filesToUpdate) {
    $fullPath = Join-Path $workDir $file
    if (Test-Path $fullPath) {
        $content = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)
        $newContent = $content -replace 'ventistudio\.fr', 'ventistudio.eu'
        
        if ($content -ne $newContent) {
            [System.IO.File]::WriteAllText($fullPath, $newContent, [System.Text.Encoding]::UTF8)
            $count++
            Write-Output "✓ Updated: $file"
        }
    }
}

# Update all HTML files
$htmlFiles = Get-ChildItem -Path $workDir -Filter '*.html' -Recurse
$htmlCount = 0
foreach ($file in $htmlFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    if ($content -match 'ventistudio\.fr') {
        $newContent = $content -replace 'ventistudio\.fr', 'ventistudio.eu'
        [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
        $htmlCount++
    }
}

# Update sitemap.xml
$sitemap = [System.IO.File]::ReadAllText("$workDir\sitemap.xml", [System.Text.Encoding]::UTF8)
$newSitemap = $sitemap -replace 'ventistudio\.fr', 'ventistudio.eu'
[System.IO.File]::WriteAllText("$workDir\sitemap.xml", $newSitemap, [System.Text.Encoding]::UTF8)

# Update generate-sitemap.ps1
$script = [System.IO.File]::ReadAllText("$workDir\generate-sitemap.ps1", [System.Text.Encoding]::UTF8)
$newScript = $script -replace 'ventistudio\.fr', 'ventistudio.eu'
[System.IO.File]::WriteAllText("$workDir\generate-sitemap.ps1", $newScript, [System.Text.Encoding]::UTF8)

Write-Output ""
Write-Output "=== Migration Summary ==="
Write-Output "Config files updated: $count"
Write-Output "HTML files updated: $htmlCount"
Write-Output "Sitemap updated: ✓"
Write-Output "Script updated: ✓"
Write-Output ""
Write-Output "Migration completed: ventistudio.fr → ventistudio.eu"
