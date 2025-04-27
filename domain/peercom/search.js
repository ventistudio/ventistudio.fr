// Base de données de contenu recherchable
const searchableContent = {
    music: [
        { title: 'Album 1', description: 'Artiste 1 - Genre Musical', type: 'music', url: '/player?id=1' },
        { title: 'Album 2', description: 'Artiste 2 - Genre Musical', type: 'music', url: '/player?id=2' }
    ],
    games: [
        { title: 'Jeu 1', description: 'Studio 1 - Genre de jeu', type: 'games', url: '/games?id=1' },
        { title: 'Jeu 2', description: 'Studio 2 - Genre de jeu', type: 'games', url: '/games?id=2' }
    ],
    videos: [
        { title: 'Vidéo 1', description: 'Créateur 1 - Description', type: 'videos', url: '/player?v=1' },
        { title: 'Vidéo 2', description: 'Créateur 2 - Description', type: 'videos', url: '/player?v=2' }
    ],
    books: [
        { title: 'Livre 1', description: 'Auteur 1 - Genre littéraire', type: 'books', url: '/books?id=1' },
        { title: 'Livre 2', description: 'Auteur 2 - Genre littéraire', type: 'books', url: '/books?id=2' }
    ]
};

const externalSources = {
    music: [
        { title: 'Spotify', description: 'Service de streaming musical', url: 'https://open.spotify.com/search/{query}' },
        { title: 'Deezer', description: 'Plateforme de musique en ligne', url: 'https://www.deezer.com/search/{query}' },
        { title: 'SoundCloud', description: 'Plateforme de partage musical', url: 'https://soundcloud.com/search?q={query}' },
        { title: 'Bandcamp', description: 'Marketplace musical indépendant', url: 'https://bandcamp.com/search?q={query}' }
    ],
    games: [
        { title: 'Steam', description: 'Plateforme de jeux PC', url: 'https://store.steampowered.com/search/?term={query}' },
        { title: 'itch.io', description: 'Plateforme de jeux indépendants', url: 'https://itch.io/search?q={query}' },
        { title: 'GOG', description: 'Good Old Games', url: 'https://www.gog.com/games?search={query}' },
        { title: 'Epic Games', description: 'Store de jeux vidéo', url: 'https://store.epicgames.com/browse?q={query}' }
    ],
    videos: [
        { title: 'YouTube', description: 'Plateforme de partage vidéo', url: 'https://www.youtube.com/results?search_query={query}' },
        { title: 'Dailymotion', description: 'Site de vidéos en ligne', url: 'https://www.dailymotion.com/search/{query}' },
        { title: 'Vimeo', description: 'Plateforme vidéo créative', url: 'https://vimeo.com/search?q={query}' },
        { title: 'Odysee', description: 'Alternative décentralisée', url: 'https://odysee.com/$/search?q={query}' }
    ],
    books: [
        { title: 'Goodreads', description: 'Réseau social littéraire', url: 'https://www.goodreads.com/search?q={query}' },
        { title: 'Project Gutenberg', description: 'Livres libres de droits', url: 'https://www.gutenberg.org/ebooks/search/?query={query}' },
        { title: 'Internet Archive', description: 'Bibliothèque numérique', url: 'https://archive.org/search.php?query={query}' },
        { title: 'OpenLibrary', description: 'Bibliothèque ouverte', url: 'https://openlibrary.org/search?q={query}' }
    ]
};

// Éléments DOM
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const filterButtons = document.querySelectorAll('.filter-button');

const searchModeToggle = document.createElement('button');
searchModeToggle.className = 'search-mode-toggle';
searchModeToggle.textContent = 'Mode: Interne';
document.querySelector('.search-filters').prepend(searchModeToggle);

// État actuel du filtre
let currentFilter = 'all';
let searchMode = 'internal'; // 'internal' ou 'external'

// Fonction de recherche
function performSearch(query) {
    query = query.toLowerCase();
    let results = [];
    
    if (searchMode === 'internal') {
        // Fonction pour vérifier si un élément correspond à la recherche
        const matchesSearch = (item) => {
            return item.title.toLowerCase().includes(query) || 
                   item.description.toLowerCase().includes(query);
        };

        // Filtrer les résultats selon le filtre actuel et la requête
        if (currentFilter === 'all') {
            Object.values(searchableContent).forEach(category => {
                results = results.concat(category.filter(matchesSearch));
            });
        } else {
            results = searchableContent[currentFilter].filter(matchesSearch);
        }
    } else {
        // Recherche externe
        if (currentFilter === 'all') {
            Object.values(externalSources).forEach(category => {
                results = results.concat(category.map(item => ({
                    ...item,
                    url: item.url.replace('{query}', encodeURIComponent(query))
                })));
            });
        } else {
            results = externalSources[currentFilter].map(item => ({
                ...item,
                url: item.url.replace('{query}', encodeURIComponent(query))
            }));
        }
    }

    displayResults(results);
}

// Afficher les résultats
function displayResults(results) {
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="no-results">
                <p>Aucun résultat trouvé</p>
            </div>
        `;
        return;
    }

    results.forEach(result => {
        const resultElement = document.createElement('a');
        resultElement.href = result.url;
        resultElement.className = 'result-item';
        resultElement.innerHTML = `
            <div class="result-title">${result.title}</div>
            <div class="result-description">${result.description}</div>
        `;
        searchResults.appendChild(resultElement);
    });
}

// Écouteurs d'événements
searchInput.addEventListener('input', (e) => {
    performSearch(e.target.value);
});

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Mettre à jour les classes actives
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Mettre à jour le filtre actuel
        currentFilter = button.dataset.filter;
        
        // Relancer la recherche avec le nouveau filtre
        performSearch(searchInput.value);
    });
});

searchModeToggle.addEventListener('click', () => {
    searchMode = searchMode === 'internal' ? 'external' : 'internal';
    searchModeToggle.textContent = `Mode: ${searchMode === 'internal' ? 'Interne' : 'Externe'}`;
    performSearch(searchInput.value);
});

// Recherche initiale (vide)
performSearch('');