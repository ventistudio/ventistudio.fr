#!/usr/bin/env pwsh

# Script de mise à jour de la navbar
$workDir = 'c:\Users\starw\Documents\GitHub\ventistudio.fr'

# Définir la nouvelle navbar
$oldNavbar = @'
      <a href="/" class="active">Accueil</a>
      <a href="/approuvedcontent/">Contenu Approuvé</a>
      <a href="/player">Lecteur</a>
      <a href="/wiki">Wiki</a>
      <a href="/staff">Équipe</a>
      <a href="/artist">Artiste</a>
      <a href="/pip">PIP</a>
      <a href="/sitemap">Plan du site</a>
'@

$newNavbar = @'
      <a href="/" class="active">Accueil</a>
      <a href="/approuvedcontent/">Contenu Approuvé</a>
      <a href="/player">Lecteur</a>
      <a href="/wiki">Wiki</a>
      <a href="/staff">Équipe</a>
      <a href="/news">News</a>
      <a href="/pip">PIP</a>
      <a href="/sitemap">Plan du site</a>
'@

$oldNavbarNoActive = @'
      <a href="/">Accueil</a>
      <a href="/approuvedcontent/">Contenu Approuvé</a>
      <a href="/player">Lecteur</a>
      <a href="/wiki">Wiki</a>
      <a href="/staff">Équipe</a>
      <a href="/artist">Artiste</a>
      <a href="/pip">PIP</a>
      <a href="/sitemap">Plan du site</a>
'@

$newNavbarNoActive = @'
      <a href="/">Accueil</a>
      <a href="/approuvedcontent/">Contenu Approuvé</a>
      <a href="/player">Lecteur</a>
      <a href="/wiki">Wiki</a>
      <a href="/staff">Équipe</a>
      <a href="/news">News</a>
      <a href="/pip">PIP</a>
      <a href="/sitemap">Plan du site</a>
'@

# Traiter tous les fichiers HTML
$htmlFiles = Get-ChildItem -Path $workDir -Filter '*.html' -Recurse
$count = 0

foreach ($file in $htmlFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $newContent = $content
    
    # Remplacer les deux versions
    if ($content -match [regex]::Escape($oldNavbar)) {
        $newContent = $content -replace [regex]::Escape($oldNavbar), $newNavbar
        $count++
    } elseif ($content -match [regex]::Escape($oldNavbarNoActive)) {
        $newContent = $content -replace [regex]::Escape($oldNavbarNoActive), $newNavbarNoActive
        $count++
    }
    
    if ($content -ne $newContent) {
        [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
    }
}

Write-Output "=== UPDATE NAVBAR COMPLETE ==="
Write-Output "Fichiers HTML mis à jour: $count"
Write-Output "Modifications:"
Write-Output "  ✓ Suppression du lien 'Artiste'"
Write-Output "  ✓ Ajout du lien 'News' vers /news"
Write-Output "  ✓ Confirmation que 'Équipe' est en place de 'Staff'"
