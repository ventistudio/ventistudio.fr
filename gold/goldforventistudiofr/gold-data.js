const goldContent = [

  {
    id: 1,
    title: 'VentiStudio DevKit',
    category: 'tools',
    description: 'Suite complète d\'outils de développement pour créer et personnaliser vos projets VentiStudio. Inclut CLI, templates et documentation hors-ligne.',
    icon: '⚙️',
    downloadUrl: '#',
    version: '2.4.0',
    date: '2026-03-20',
    size: '48 Mo',
    tags: ['dev', 'cli', 'templates']
  },
  {
    id: 2,
    title: 'Theme Generator',
    category: 'tools',
    description: 'Créez des thèmes personnalisés pour le site VentiStudio en quelques clics. Export CSS automatique compatible avec le design system.',
    icon: '🎨',
    downloadUrl: '#',
    version: '1.2.0',
    date: '2026-03-10',
    size: '12 Mo',
    tags: ['design', 'css', 'thème']
  },
  {
    id: 3,
    title: 'Asset Manager Pro',
    category: 'tools',
    description: 'Gestionnaire d\'assets avancé pour organiser, compresser et optimiser vos fichiers multimédias.',
    icon: '📂',
    downloadUrl: '#',
    version: '3.1.0',
    date: '2026-02-28',
    size: '22 Mo',
    tags: ['assets', 'optimisation', 'médias']
  },
  {
    id: 4,
    title: 'Code Snippet Vault',
    category: 'tools',
    description: 'Bibliothèque de snippets de code prêts à l\'emploi, couvrant HTML/CSS/JS et les patterns VentiStudio.',
    icon: '💾',
    downloadUrl: '#',
    version: '1.0.0',
    date: '2026-01-15',
    size: '5 Mo',
    tags: ['code', 'snippets', 'référence']
  },

  {
    id: 5,
    title: 'Aoki Univers: Prologue',
    category: 'games',
    description: 'Explorez le prologue exclusif de l\'univers Aoki. Un visual novel interactif mêlant mystère et science-fiction.',
    icon: '🌌',
    downloadUrl: '#',
    version: '0.9.0',
    date: '2026-03-15',
    size: '210 Mo',
    tags: ['visual novel', 'aoki', 'exclusif']
  },
  {
    id: 6,
    title: 'VentiRun',
    category: 'games',
    description: 'Runner arcade dans l\'univers VentiStudio. Battez les records et débloquez des skins exclusifs Gold.',
    icon: '🏃',
    downloadUrl: '#',
    version: '1.1.0',
    date: '2026-02-10',
    size: '85 Mo',
    tags: ['arcade', 'runner', 'scoreboard']
  },
  {
    id: 7,
    title: 'Puzzle FiTsZ',
    category: 'games',
    description: 'Jeu de réflexion avec 50 niveaux inspirés de l\'esthétique FiTsZ. Musiques originales incluses.',
    icon: '🧩',
    downloadUrl: '#',
    version: '2.0.0',
    date: '2026-01-20',
    size: '120 Mo',
    tags: ['puzzle', 'réflexion', 'musique']
  },

  {
    id: 8,
    title: 'Gold Collection Vol. 1',
    category: 'music',
    description: 'Compilation exclusive de 12 pistes originales par les artistes VentiStudio. Format FLAC haute qualité.',
    icon: '🎵',
    downloadUrl: '#',
    version: '1.0.0',
    date: '2026-03-22',
    size: '340 Mo',
    tags: ['compilation', 'flac', 'original']
  },
  {
    id: 9,
    title: 'Ambient Sessions',
    category: 'music',
    description: 'Collection de pistes ambient pour la concentration et la créativité. 8 heures de musique atmosphérique.',
    icon: '🎧',
    downloadUrl: '#',
    version: '2.0.0',
    date: '2026-03-01',
    size: '520 Mo',
    tags: ['ambient', 'focus', 'atmosphère']
  },
  {
    id: 10,
    title: 'Aoki OST - Extended',
    category: 'music',
    description: 'Bande originale étendue de l\'univers Aoki avec 6 pistes bonus inédites, version Gold exclusive.',
    icon: '🎼',
    downloadUrl: '#',
    version: '1.5.0',
    date: '2026-02-14',
    size: '180 Mo',
    tags: ['ost', 'aoki', 'bonus']
  },

  {
    id: 11,
    title: 'Icon Pack Premium',
    category: 'resources',
    description: 'Pack de 500+ icônes vectorielles au style VentiStudio. Formats SVG et PNG inclus, usage libre pour vos projets.',
    icon: '✨',
    downloadUrl: '#',
    version: '3.0.0',
    date: '2026-03-18',
    size: '28 Mo',
    tags: ['icônes', 'svg', 'design']
  },
  {
    id: 12,
    title: 'Wallpaper Collection 4K',
    category: 'resources',
    description: 'Collection de 30 fonds d\'écran 4K exclusifs avec les artworks originaux VentiStudio et Aoki Univers.',
    icon: '🖼️',
    downloadUrl: '#',
    version: '2.0.0',
    date: '2026-02-20',
    size: '95 Mo',
    tags: ['wallpaper', '4k', 'artwork']
  },
  {
    id: 13,
    title: 'Template Starter Kit',
    category: 'resources',
    description: 'Kit de démarrage avec templates HTML/CSS prêts à l\'emploi, basés sur le design system VentiStudio.',
    icon: '📐',
    downloadUrl: '#',
    version: '1.3.0',
    date: '2026-01-30',
    size: '8 Mo',
    tags: ['templates', 'html', 'starter']
  },
  {
    id: 14,
    title: 'Sound Effects Library',
    category: 'resources',
    description: 'Bibliothèque de 200+ effets sonores haute qualité pour vos projets créatifs. WAV 48kHz/24bit.',
    icon: '🔊',
    downloadUrl: '#',
    version: '1.0.0',
    date: '2026-01-05',
    size: '150 Mo',
    tags: ['sfx', 'audio', 'wav']
  }
];

const goldChangelog = [
  {
    date: '2026-03-22',
    title: 'Gold Collection Vol. 1',
    description: 'Nouvelle compilation musicale exclusive avec 12 pistes originales en FLAC.'
  },
  {
    date: '2026-03-20',
    title: 'DevKit 2.4.0',
    description: 'Mise à jour majeure du DevKit : nouveau CLI, meilleure compatibilité et templates Aoki.'
  },
  {
    date: '2026-03-18',
    title: 'Icon Pack Premium 3.0',
    description: '200 nouvelles icônes ajoutées au pack premium. Nouveau style glassmorphism.'
  },
  {
    date: '2026-03-15',
    title: 'Aoki Univers: Prologue',
    description: 'Sortie exclusive du prologue interactif de l\'univers Aoki pour les membres Gold.'
  },
  {
    date: '2026-03-01',
    title: 'Ambient Sessions v2',
    description: 'Refonte complète de la collection Ambient : 4 nouvelles heures de contenu, mix amélioré.'
  },
  {
    date: '2026-02-20',
    title: 'Wallpapers 4K Refresh',
    description: '10 nouveaux fonds d\'écran exclusifs ajoutés à la collection, thème saison printemps.'
  }
];
