$files = Get-ChildItem -Path 'c:\Users\starw\Documents\GitHub\ventistudio.fr' -Filter '*.html' -Recurse | Sort-Object FullName
$baseUrl = 'https://ventistudio.fr'
$sitemap = '<?xml version="1.0" encoding="UTF-8"?>'
$sitemap += "`n" + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0">'

foreach ($file in $files) {
    $relativePath = $file.FullName -replace [regex]::Escape('c:\Users\starw\Documents\GitHub\ventistudio.fr'), ''
    $relativePath = $relativePath -replace '\\', '/' -replace '^/', ''
    
    # Build full URL
    if ($relativePath -match 'index\.html$' -or $relativePath -eq 'index.html') {
        $urlPath = $relativePath -replace 'index\.html$', ''
        $url = if ($urlPath) { "$baseUrl/$urlPath" } else { "$baseUrl/" }
    } else {
        $url = "$baseUrl/$relativePath"
    }
    
    $lastMod = $file.LastWriteTime.ToString('yyyy-MM-dd')
    
    # Determine priority based on path
    $priority = '0.8'
    $changefreq = 'weekly'
    
    if ($relativePath -eq 'index.html' -or $relativePath -eq '') {
        $priority = '1.0'
        $changefreq = 'weekly'
    } elseif ($relativePath -match '^(about|discord|wiki|artist)') {
        $priority = '0.9'
        $changefreq = 'weekly'
    } elseif ($relativePath -match '^(lawful|terms|privacy|mentions-legales)') {
        $priority = '0.7'
        $changefreq = 'monthly'
    } elseif ($relativePath -match '^(ester-eggs|secret|restricted)') {
        $priority = '0.5'
        $changefreq = 'never'
    }
    
    $sitemap += "`n  <url>"
    $sitemap += "`n    <loc>$([System.Security.SecurityElement]::Escape($url))</loc>"
    $sitemap += "`n    <lastmod>$lastMod</lastmod>"
    $sitemap += "`n    <changefreq>$changefreq</changefreq>"
    $sitemap += "`n    <priority>$priority</priority>"
    $sitemap += "`n    <mobile:mobile/>"
    $sitemap += "`n  </url>"
}

$sitemap += "`n</urlset>"

# Write with UTF-8 encoding
[System.IO.File]::WriteAllText('c:\Users\starw\Documents\GitHub\ventistudio.fr\sitemap.xml', $sitemap, [System.Text.Encoding]::UTF8)
Write-Output "[DONE] Sitemap generated with $($files.Count) URLs"
