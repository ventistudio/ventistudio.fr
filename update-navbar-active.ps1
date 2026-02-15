#!/usr/bin/env pwsh

# Générer les navbars actives pour chaque section

$sections = @{
    '/news' = 'News'
    '/staff' = 'Équipe'
    '/wiki' = 'Wiki'
    '/player' = 'Lecteur'
    '/approuvedcontent' = 'Contenu Approuvé'
    '/pip' = 'PIP'
    '/sitemap' = 'Plan du site'
}

function Create-Navbar($activePage) {
    $navbar = @"
      <a href="/">Accueil</a>
      <a href="/approuvedcontent/">Contenu Approuvé</a>
      <a href="/player">Lecteur</a>
      <a href="/wiki">Wiki</a>
      <a href="/staff">Équipe</a>
      <a href="/news">News</a>
      <a href="/pip">PIP</a>
      <a href="/sitemap">Plan du site</a>
"@
    
    # Ajouter class="active" au bon lien
    if ($activePage) {
        $navbar = $navbar -replace "href=`"$activePage`">", "href=`"$activePage`" class=`"active`">"
    }
    
    return $navbar
}

# Pages à mettre à jour avec leurs navbars actives
$pagesToUpdate = @{
    'news/index.html' = '/news'
    'news/create/index.html' = '/news'
    'history/index.html' = '/'
    'staff/index.html' = '/staff'
    'wiki/index.html' = '/wiki'
    'approuvedcontent/index.html' = '/approuvedcontent'
}

$workDir = 'c:\Users\starw\Documents\GitHub\ventistudio.fr'

foreach ($page in $pagesToUpdate.GetEnumerator()) {
    $filePath = Join-Path $workDir $page.Key
    $activePath = $page.Value
    
    if (Test-Path $filePath) {
        $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
        
        # Créer la nouvelle navbar avec l'active approprié
        $newNavbar = Create-Navbar $activePath
        
        # Remplacer la navbar existante
        $oldNavbar = $content -match '<nav[^>]*>(.*?)<\/nav>'
        if ($oldNavbar) {
            $content = $content -replace '<nav aria-label="Navigation principale">.*?<\/nav>', "<nav aria-label=`"Navigation principale`">`n$newNavbar`n    </nav>"
        }
        
        [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
        Write-Output "✓ Updated: $page"
    }
}

Write-Output ""
Write-Output "=== Navigation Updates Complete ===" 
