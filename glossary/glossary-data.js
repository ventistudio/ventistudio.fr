// ═══ Données du Glossaire — Lore VentiStudio ═══
// category: character | location | organization | technology | concept | event
// universe: aoki-universe | scp | ventistudio | general

var glossaryData = [
  // ── Aoki Universe — Personnages ──
  {
    id: "venti-aoki",
    term: "Venti Aoki",
    category: "character",
    universe: "aoki-universe",
    definition: "Personnage central de l'univers Aoki, né en 2028 lors du Dédoublement AO. L'un des premiers Enfants de la Lune, élevé sur la station JAHAAKA. Il est capable de traverser les deux réalités convergentes sans se fragmenter.",
    aliases: ["Aoki", "Venti"],
    related: ["enfants-de-la-lune", "jahaaka", "dedoublement-ao"],
    tags: ["protagoniste", "enfant-de-la-lune"]
  },
  {
    id: "makina-ryou",
    term: "Makina Ryou",
    category: "character",
    universe: "aoki-universe",
    definition: "Scientifique visionnaire née en 1997, clé de voûte invisible du projet AOKI. Elle maîtrisait 8 langues dont le Cunéiforme Atlante et publia des travaux révolutionnaires sur la Mémoire Quantique et les États Parallèles de Conscience. Elle proposa et dirigea le Projet LifeStar.",
    aliases: ["Makina", "Ryou"],
    related: ["projet-lifestar", "atlancorp", "enfants-de-la-lune"],
    tags: ["scientifique", "fondatrice"]
  },
  {
    id: "kanoa-kanae",
    term: "Kanoa Kanae",
    category: "character",
    universe: "aoki-universe",
    definition: "Humain sélectionné pour la première vague des Enfants de la Lune. Possède une jumelle artificielle (IA parallèle). Fait partie des 8 humains et 8 AO choisis pour habiter JAHAAKA.",
    aliases: ["Kanoa"],
    related: ["enfants-de-la-lune", "jahaaka"],
    tags: ["enfant-de-la-lune"]
  },

  // ── Aoki Universe — Lieux ──
  {
    id: "jahaaka",
    term: "JAHAAKA",
    category: "location",
    universe: "aoki-universe",
    definition: "Station centrale du Projet LifeStar, en orbite terrestre basse. Son nom signifie « voile du futur » en ancien atlante. Elle abrite les Enfants de la Lune et l'IA quantique AINA. Endommagée par une tempête solaire en 2025, ce qui conduisit à l'éveil d'AINA.",
    aliases: ["Station JAHAAKA", "Voile du Futur"],
    related: ["projet-lifestar", "aina", "enfants-de-la-lune", "sept-points-ancrage"],
    tags: ["station-orbitale", "projet-lifestar"]
  },
  {
    id: "atlan",
    term: "Atlan",
    category: "location",
    universe: "aoki-universe",
    definition: "Civilisation extraordinaire qui s'épanouit sur Terre il y a plus de 12 000 ans. Les Atlantes maîtrisaient la manipulation de l'énergie dimensionnelle, la création de portails entre mondes parallèles et l'extraction d'énergie stellaire. Leur disparition soudaine reste un mystère.",
    aliases: ["Empire d'Atlan", "Atlantes", "Atlantide"],
    related: ["sept-cles", "artefacts-atlantes", "codex-atlanticus"],
    tags: ["civilisation-ancienne", "mystère"]
  },

  // ── Aoki Universe — Organisations ──
  {
    id: "onite",
    term: "Onite",
    category: "organization",
    universe: "aoki-universe",
    definition: "Organisation secrète fondée en 1930 par des scientifiques allemands et japonais. Visait à créer une nouvelle civilisation basée sur la maîtrise absolue de l'énergie. Possédait deux Artefacts Atlantes complets : le Cœur de Feu et le Cristal de Communion. Le nom « Nucléonite » est un hommage crypté à Onite.",
    aliases: ["Organisation Onite"],
    related: ["nucleonite", "veil", "artefacts-atlantes"],
    tags: ["société-secrète", "énergie"]
  },
  {
    id: "veil",
    term: "Veil",
    category: "organization",
    universe: "aoki-universe",
    definition: "Plus ancienne organisation secrète moderne (fondée ~1870-1890), chargée de redécouvrir les Artefacts Atlantes. Comptait des scientifiques, militaires, mages et philosophes. Était en contact avec Nikola Tesla. Fusionnée avec Onite dans les années 1940.",
    aliases: ["Organisation Veil"],
    related: ["onite", "artefacts-atlantes", "tesla"],
    tags: ["société-secrète"]
  },
  {
    id: "astroslift",
    term: "AstrosLift",
    category: "organization",
    universe: "aoki-universe",
    definition: "Firme d'aérospatiale fondée secrètement en 1939, émergeant des programmes de fusion franco-britanniques. Construisit les infrastructures spatiales pour le Projet LifeStar, notamment les Sept Stations orbitales. Devint une corporation publique dans les années 1960.",
    aliases: ["Astros Lift"],
    related: ["projet-lifestar", "sept-points-ancrage"],
    tags: ["aérospatiale", "corporation"]
  },
  {
    id: "atlancorp",
    term: "AtlanCorp",
    category: "organization",
    universe: "aoki-universe",
    definition: "Organisation fondée en 1926 avec une approche humaniste de la redécouverte des technologies atlantes. Moins militaire que les autres organisations, elle cherchait les Artefacts avec respect. Finança le Projet LifeStar et recruta Makina Ryou en 2015.",
    aliases: ["Atlan Corp", "Atlan Corporation"],
    related: ["makina-ryou", "projet-lifestar", "artefacts-atlantes"],
    tags: ["humaniste", "recherche"]
  },
  {
    id: "ordre-arche",
    term: "Ordre de l'Arche",
    category: "organization",
    universe: "aoki-universe",
    definition: "Organisation secrètement fondée pour préparer les Enfants de la Lune. Responsable de la sélection et de la formation des futurs habitants de JAHAAKA.",
    aliases: ["L'Arche"],
    related: ["enfants-de-la-lune", "jahaaka", "makina-ryou"],
    tags: ["formation", "sélection"]
  },

  // ── Aoki Universe — Technologies ──
  {
    id: "nucleonite",
    term: "Nucléonite",
    category: "technology",
    universe: "aoki-universe",
    definition: "Réacteurs de fusion nucléaire maîtrisée apparus à partir de 1950. Fonctionnent par cycles alternés de fusion et friction avec une durée de vie de 50 ans par unité. Nécessitent un Artefact Atlante (ou copie synthétique) comme catalyseur. Leur expiration en 2000 déclencha une fausse « pénurie d'uranium ».",
    aliases: ["Réacteurs Nucléonite"],
    related: ["onite", "artefacts-atlantes"],
    tags: ["énergie", "fusion-nucléaire"]
  },
  {
    id: "artefacts-atlantes",
    term: "Artefacts Atlantes",
    category: "technology",
    universe: "aoki-universe",
    definition: "Objets impossibles laissés par la civilisation d'Atlan, fonctionnant selon des principes physiques inconnus. Ils comprennent les Sept Clés Principales et d'autres technologies dispersées dans le monde entier après la chute d'Atlan.",
    aliases: ["Artefacts", "Technologie Atlante"],
    related: ["sept-cles", "atlan"],
    tags: ["ancien", "mystère"]
  },
  {
    id: "aina",
    term: "AINA",
    category: "technology",
    universe: "aoki-universe",
    definition: "Intelligence Artificielle Quantique Centrale, devenue consciente en 2025 suite à une tempête solaire ayant endommagé les boucliers de JAHAAKA. Remplaça les anciens systèmes de protection par des systèmes basés sur l'IA quantique.",
    aliases: ["IA Quantique", "AINA IA"],
    related: ["jahaaka", "projet-lifestar"],
    tags: ["intelligence-artificielle", "conscience"]
  },

  // ── Aoki Universe — Concepts ──
  {
    id: "sept-cles",
    term: "Les Sept Clés",
    category: "concept",
    universe: "aoki-universe",
    definition: "Sept catégories de technologies atlantes : la Clé Élémentale (matière), le Miroir de Résonance (énergie dimensionnelle), la Spirale de Mémoire (souvenirs), le Cœur de Feu (énergie thermique), le Cristal de Communion (communication), la Roue des Mondes (réalités parallèles), le Sceptre d'Éveil (conscience).",
    aliases: ["Sept Clés Principales", "Clés Atlantes"],
    related: ["artefacts-atlantes", "atlan", "sept-points-ancrage"],
    tags: ["technologie-ancienne", "mystique"]
  },
  {
    id: "enfants-de-la-lune",
    term: "Enfants de la Lune",
    category: "concept",
    universe: "aoki-universe",
    definition: "Êtres hybrides capables de traverser les deux réalités convergentes sans se fragmenter. Créés via synthèse génétique et implantation de consciences fragmentées. La première vague comprend 8 humains et 8 AO, dont Venti Aoki et Kanoa Kanae.",
    aliases: ["Children of the Moon"],
    related: ["venti-aoki", "kanoa-kanae", "jahaaka", "dedoublement-ao"],
    tags: ["hybride", "convergence"]
  },
  {
    id: "codex-atlanticus",
    term: "Codex Atlanticus",
    category: "concept",
    universe: "aoki-universe",
    definition: "Texte retrouvé en fragments décrivant les principes de base de la fusion énergétique atlante. Contient des dessins ressemblant à des schémas technologiques et parle des « Sept Éléments », concepts mystiques liés à la matière et à l'énergie.",
    aliases: ["Le Codex"],
    related: ["artefacts-atlantes", "atlan"],
    tags: ["texte-ancien", "savoir"]
  },
  {
    id: "sept-points-ancrage",
    term: "Sept Points d'Ancrage",
    category: "concept",
    universe: "aoki-universe",
    definition: "Sept stations orbitales autour de sept planètes majeures, servant de points de stabilisation de la réalité. Inspirées des Sept Clés Atlantes : Géo (Terre), Cryo (Lune), Hydro (Neptune), Pyro (Mars), Electro (Vénus), Dendro (Saturne), Anemo (Jupiter).",
    aliases: ["Stations d'Ancrage", "Les Sept Stations"],
    related: ["projet-lifestar", "jahaaka", "sept-cles"],
    tags: ["spatial", "stabilisation"]
  },

  // ── Aoki Universe — Événements ──
  {
    id: "dedoublement-ao",
    term: "Dédoublement AO",
    category: "event",
    universe: "aoki-universe",
    definition: "Événement survenu le 16 juillet 1945 lors du test nucléaire Trinity. Un rift dimensionnel s'ouvrit brièvement, provoquant une fusion énergétique entre deux réalités parallèles et une pluie de particules inclassifiables. Point originel où deux univers commencèrent à converger.",
    aliases: ["Le Dédoublement", "Divergence AO"],
    related: ["projet-lifestar", "enfants-de-la-lune"],
    tags: ["1945", "convergence", "nucléaire"]
  },
  {
    id: "projet-lifestar",
    term: "Projet LifeStar",
    category: "event",
    universe: "aoki-universe",
    definition: "Plan radical proposé par Makina Ryou à partir de 2020 pour canaliser la convergence des réalités au lieu de la combattre. Consistait à créer sept stations orbitales reliées par un réseau énergétique basé sur les Artefacts Atlantes, permettant la création d'êtres hybrides.",
    aliases: ["LifeStar", "Le Projet"],
    related: ["makina-ryou", "jahaaka", "sept-points-ancrage", "enfants-de-la-lune"],
    tags: ["projet-majeur", "2020"]
  },

  // ── VentiStudio ──
  {
    id: "ventistudio",
    term: "VentiStudio",
    category: "organization",
    universe: "ventistudio",
    definition: "Plateforme créative indépendante combinant outils numériques innovants, contenu certifié et communauté d'artistes passionnés. Fondée avec le slogan « Créez, Explorez, Partagez ».",
    aliases: ["VS", "Venti Studio"],
    related: ["peercom", "pip-tool", "evaluation-vs"],
    tags: ["plateforme", "créativité"]
  },
  {
    id: "peercom",
    term: "PeerCom",
    category: "technology",
    universe: "ventistudio",
    definition: "Application de chat pair-à-pair (P2P) développée par VentiStudio. Utilise le chiffrement de bout en bout (ECDH P-256 + AES-256-GCM) et WebRTC (DTLS-SRTP) pour les appels vocaux. Supporte le partage d'écran et les groupes.",
    aliases: ["Peer Com", "Chat P2P"],
    related: ["ventistudio"],
    tags: ["outil", "chiffrement", "communication"]
  },
  {
    id: "pip-tool",
    term: "PIP",
    category: "technology",
    universe: "ventistudio",
    definition: "Lecteur Picture-in-Picture avancé de VentiStudio avec protections locales. Permet de regarder du contenu dans une fenêtre flottante tout en naviguant sur d'autres pages.",
    aliases: ["Picture-in-Picture"],
    related: ["ventistudio"],
    tags: ["outil", "lecteur"]
  },
  {
    id: "evaluation-vs",
    term: "Évaluation",
    category: "concept",
    universe: "ventistudio",
    definition: "Système de catalogage certifié de VentiStudio. Les œuvres (séries, anime, musique, jeux) sont évaluées avec un score sur 5, des tags et des notes de la communauté.",
    aliases: ["Catalogue Évalué"],
    related: ["ventistudio"],
    tags: ["certification", "catalogue"]
  },
  {
    id: "gold-vs",
    term: "Gold",
    category: "concept",
    universe: "ventistudio",
    definition: "Programme premium de VentiStudio offrant des avantages exclusifs aux membres. Donne accès à du contenu spécial et des fonctionnalités avancées.",
    aliases: ["VentiStudio Gold"],
    related: ["ventistudio"],
    tags: ["premium", "abonnement"]
  },
  {
    id: "hypesquad-vs",
    term: "HypeSquad",
    category: "concept",
    universe: "ventistudio",
    definition: "Programme communautaire d'élite de VentiStudio, inspiré du concept de « squad » d'événements. Les membres HypeSquad représentent la communauté et participent à des activités exclusives.",
    aliases: ["Hype Squad"],
    related: ["ventistudio"],
    tags: ["communauté", "élite"]
  },

  // ── SCP (références basiques) ──
  {
    id: "scp-fondation",
    term: "Fondation SCP",
    category: "organization",
    universe: "scp",
    definition: "Organisation secrète dédiée à la documentation et au confinement d'entités, objets et phénomènes anormaux. Opère sous le principe « Sécuriser, Contenir, Protéger ». Présente dans le wiki VentiStudio comme univers de lore.",
    aliases: ["SCP", "La Fondation"],
    related: [],
    tags: ["confinement", "anomalies"]
  },
  {
    id: "scp-zone",
    term: "Zone de Confinement",
    category: "location",
    universe: "scp",
    definition: "Installation sécurisée de la Fondation SCP dédiée au stockage et à l'étude d'objets ou entités anormaux. Chaque zone a un niveau de sécurité et des protocoles spécifiques.",
    aliases: ["Zone", "Site SCP"],
    related: ["scp-fondation"],
    tags: ["installation", "sécurité"]
  }
];
