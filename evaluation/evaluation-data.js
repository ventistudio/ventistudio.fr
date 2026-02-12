// Données enrichies des évaluations VentiStudio v2 (fusion approuvedcontent + evaluation)
const evaluationData = [
  {
    id: 1,
    title: "LE JEUX DE LA DAME",
    type: "series",
    creator: "Netflix",
    date: "2024-01-15",
    image: "/a-files/image/jdld-image.avif",
    description: "Placée en orphelinat à 9 ans, Beth développe un talent étonnant pour les échecs. Championne national à 16 ans, elle doit apprendre à gérer son succès et ses démons personnels.",
    rating: 4.8,
    tags: ["Drama", "Biographie", "Chess"],
    featured: true,
    notes: "Série fascinante sur la passion et la rédemption",
    community: false
  },
  {
    id: 2,
    title: "A SILENT VOICE",
    type: "animations",
    creator: "Kyoto Animation",
    date: "2024-01-10",
    image: "/a-files/image/asv-image.avif",
    description: "Nishimiya est une élève douce mais qui elle est harcelée par Ishida. Un film touchant sur la rédemption et l'amitié.",
    rating: 4.9,
    tags: ["Anime", "Drama", "Romance"],
    featured: true,
    notes: "Animation magnifique avec une histoire émouvante",
    community: true
  }
  {
    id: 3,
    title: "THE ORBITAL CHILDREN",
    type: "series-animations",
    creator: "Doga Kobo",
    date: "2024-01-18",
    image: "/a-files/image/toc-image.avif",
    description: "En 2045, après un accident survenu à bord d'une station spatiale, deux enfants nés sur la Lune et trois jeunes Terriens sont livrés à eux-mêmes et tentent de survivre.",
    rating: 4.6,
    tags: ["Sci-Fi", "Space", "Adventure"],
    featured: false,
    notes: "Sci-fi captivante avec des personnages attachants",
    community: true
  }
  {
    id: 4,
    title: "OSHI NO KO",
    type: "series-animations",
    creator: "Doga Kobo",
    date: "2024-01-12",
    image: "/a-files/image/onk-image.avif",
    description: "Gorô Amemiya, un obstétricien exerçant dans un hôpital de campagne, n'a d'yeux que pour la sublime Aï Hoshino, une célèbre et talentueuse idole.",
    rating: 4.7,
    tags: ["Anime", "Supernatural", "Mystery"],
    featured: true,
    notes: "Anime complexe avec twists narratifs de folie",
    community: true
  }
  {
    id: 5,
    title: "THE TURRET ANTHEM",
    type: "musique",
    creator: "Mike Morasky",
    date: "2024-01-20",
    image: "/a-files/image/tta-image.avif",
    description: "Une petite pépite pour les fans de jeux vidéo. Cette musique est associée à l'univers de Portal, un jeu développé par Valve.",
    rating: 4.5,
    tags: ["Gaming", "Soundtrack", "Electro"],
    featured: false,
    notes: "Musique iconique du gaming",
    community: false
  }
  {
    id: 6,
    title: "GENSHIN IMPACT",
    type: "jeux",
    image: "/a-files/image/gi-image.avif",
    description: "Genshin Impact est un jeu de rôle d'aventure en monde ouvert. Découvrez le monde fantastique de Teyvat et ses sept nations.",
    rating: 4.4,
    notes: "Jeu gratuit attractif avec monde magnifique"
  },
  {
    id: 7,
    title: "STEAM",
    type: "applications",
    image: "/a-files/image/s-image.avif",
    description: "Steam est un logiciel qui permet de simplifier la mise à jour des jeux. Il permet non seulement de mettre à jour automatiquement les jeux, mais aussi de les télécharger.",
    rating: 4.6,
    notes: "Plateforme essentielle pour les gamers PC"
  },
  {
    id: 8,
    title: "SteelSeries GG",
    type: "applications",
    image: "/a-files/image/sgg-image.avif",
    description: "SteelSeries GG ! Une plateforme qui permet de créer de meilleures connexions avec votre matériel, vos coéquipiers et votre jeu.",
    rating: 4.3,
    notes: "Application gaming pour optimiser votre setup"
  },
  {
    id: 9,
    title: "TOWER OF GOD",
    type: "jeux",
    image: "/a-files/image/tof-image.avif",
    description: "Tower of God est un jeu d'arcade rétro captivant.",
    rating: 4.2,
    notes: "Classique du gaming arcade"
  },
  {
    id: 10,
    title: "MADOKA MAGICA",
    type: "series-animations",
    image: "/a-files/image/mm-image.avif",
    description: "Madoka Kaname est une jeune fille ordinaire qui vit à Mitakihara",
    rating: 4.8,
    notes: "Anime psychologique et émouvant"
  },
  {
    id: 11,
    title: "FRIEREN",
    type: "series-animations",
    image: "/a-files/image/frieren-image.avif",
    description: "Une histoire de voyage et de temps avec des personnages mémorables.",
    rating: 4.9,
    notes: "Chef d'œuvre narratif de l'animation"
  },
  {
    id: 12,
    title: "OSAMAKE",
    type: "series-animations",
    image: "/a-files/image/osm-image.avif",
    description: "Osamake est une série sur l'amitié et les rêves.",
    rating: 4.1,
    notes: "Anime cozy et relaxant"
  },
  {
    id: 13,
    title: "SERAPH OF THE END",
    type: "series-animations",
    image: "/a-files/image/sote-image.avif",
    description: "Après un virus cataclysmique ravageant le monde, Yuichiro rejoint une armée militaire.",
    rating: 4.3,
    notes: "Anime post-apocalyptique intense"
  },
  {
    id: 14,
    title: "Your Name",
    type: "animations",
    image: "/a-files/image/yn-image.avif",
    description: "Film sur deux âmes connectées à travers le temps et l'espace.",
    rating: 4.9,
    notes: "Film romantique magistral"
  },
  {
    id: 15,
    title: "Discord",
    type: "applications",
    image: "/a-files/image/discord-image.avif",
    description: "Discord est une plateforme de VoIP et de messagerie instantanée.",
    rating: 4.7,
    notes: "Application indispensable pour les communautés"
  },
  {
    id: 16,
    title: "Synology NAS",
    type: "applications",
    image: "/a-files/image/synology-image.avif",
    description: "Synology NAS pour serveurs personnels.",
    rating: 4.5,
    notes: "Solution stockage professionnel"
  },
  {
    id: 17,
    title: "VoiceMeeter",
    type: "applications",
    image: "/a-files/image/vm-image.avif",
    description: "VoiceMeeter pour la gestion audio avancée.",
    rating: 4.4,
    notes: "Mixer audio gratuit et puissant"
  },
  {
    id: 18,
    title: "OBS Studio",
    type: "applications",
    image: "/a-files/image/obs-image.avif",
    description: "OBS Studio pour le streaming et l'enregistrement.",
    rating: 4.8,
    notes: "Logiciel streaming gratuit de référence"
  },
  {
    id: 19,
    title: "Afterburner",
    type: "applications",
    image: "/a-files/image/ab-image.avif",
    description: "MSI Afterburner pour overclocker et monitorer GPU.",
    rating: 4.3,
    notes: "Outil overclock incontournable"
  },
  {
    id: 20,
    title: "Twitch Studio",
    type: "applications",
    image: "/a-files/image/ts-image.avif",
    description: "Twitch Studio pour streamer facilement.",
    rating: 4.2,
    notes: "Studio de streaming simplifié"
  },
  {
    id: 21,
    title: "Claude AI",
    type: "applications",
    image: "/a-files/image/claude-image.avif",
    description: "Claude est un modèle de langage IA développé par Anthropic.",
    rating: 4.6,
    notes: "IA conversationnelle performante"
  },
  {
    id: 22,
    title: "ChatGPT",
    type: "applications",
    image: "/a-files/image/chatgpt-image.avif",
    description: "ChatGPT est un modèle de langage créé par OpenAI.",
    rating: 4.5,
    notes: "IA générative révolutionnaire"
  },
  {
    id: 23,
    title: "Gemini AI",
    type: "applications",
    image: "/a-files/image/gemini-image.avif",
    description: "Gemini est le modèle IA de Google.",
    rating: 4.4,
    notes: "IA multimodale puissante"
  },
  {
    id: 24,
    title: "GitHub Copilot",
    type: "applications",
    image: "/a-files/image/copilot-image.avif",
    description: "GitHub Copilot pour l'auto-complétion de code IA.",
    rating: 4.7,
    notes: "Assistant de programmation révolutionnaire"
  },
  {
    id: 25,
    title: "DeepSeek",
    type: "applications",
    image: "/a-files/image/deepseek-image.avif",
    description: "DeepSeek est un modèle de langage chinois performant.",
    rating: 4.3,
    notes: "IA alternative open-source"
  },
  {
    id: 26,
    title: "Attack on Titan",
    type: "series-animations",
    image: "/a-files/image/aot-image.avif",
    description: "Après 100 ans de paix, les murs de l'humanité sont envahis par des Titans géants.",
    rating: 4.8,
    notes: "Anime action-packed incontournable"
  },
  {
    id: 27,
    title: "Jujutsu Kaisen",
    type: "series-animations",
    image: "/a-files/image/jjk-image.avif",
    description: "Yuji Itadori avale un doigt de démon maudit et devient le navire d'un sorcier.",
    rating: 4.7,
    notes: "Anime shonen exceptionnel"
  },
  {
    id: 28,
    title: "Death Note",
    type: "series-animations",
    image: "/a-files/image/dn-image.avif",
    description: "Un carnet magique qui vous permet de tuer toute personne dont vous écrivez le nom.",
    rating: 4.9,
    notes: "Anime thriller psychologique magistral"
  },
  {
    id: 29,
    title: "Les Carnets de l'Apothicaire",
    type: "series-animations",
    image: "/a-files/image/cdaa-image.avif",
    description: "Les Carnets de l'Apothicaire est une série d'animation qui suit les aventures d'une jeune apothicaire.",
    rating: 4.2,
    notes: "Anime relaxant et mystérieux"
  },
  {
    id: 30,
    title: "Demon Slayer",
    type: "series-animations",
    image: "/a-files/image/ds-image.avif",
    description: "Tanjiro cherche à transformer sa sœur devenue démon.",
    rating: 4.8,
    notes: "Animation spectaculaire avec héros attachant"
  },
  {
    id: 31,
    title: "My Hero Academia",
    type: "series-animations",
    image: "/a-files/image/mha-image.avif",
    description: "Dans un monde où 80% des gens ont des super-pouvoirs, Deku rêve de devenir héros.",
    rating: 4.6,
    notes: "Anime shonen inspirant"
  },
  {
    id: 32,
    title: "Chainsaw Man",
    type: "series-animations",
    image: "/a-files/image/cm-image.avif",
    description: "Denji devient un humain avec une tronçonneuse et rejoint une armée anti-démon.",
    rating: 4.7,
    notes: "Anime violent et captivant"
  },
  {
    id: 33,
    title: "Grok AI",
    type: "applications",
    image: "/a-files/image/grok-image.avif",
    description: "Grok est un modèle de langage créé par xAI.",
    rating: 4.2,
    notes: "IA avec approche politique controversée"
  },
  {
    id: 34,
    title: "Qwen",
    type: "applications",
    image: "/a-files/image/qwen-image.avif",
    description: "Qwen est un modèle de langage conçu pour comprendre et générer du texte.",
    rating: 4.4,
    notes: "Modèle open-source de Alibaba"
  },
  {
    id: 35,
    title: "Msty",
    type: "applications",
    image: "/a-files/image/msty-image.avif",
    description: "Msty est un modèle de langage pour chatbots et assistants virtuels.",
    rating: 4.1,
    notes: "Interface de modèles IA locaux"
  },
  {
    id: 36,
    title: "Jan",
    type: "applications",
    image: "/a-files/image/jan-image.avif",
    description: "Jan est un modèle de langage pour applications diverses.",
    rating: 4.3,
    notes: "Alternative open-source à ChatGPT"
  },
  {
    id: 37,
    title: "Jellybox",
    type: "applications",
    image: "/a-files/image/jellybox-image.avif",
    description: "Jellybox est un modèle de langage pour applications.",
    rating: 4.0,
    notes: "Plateforme IA légère"
  },
  {
    id: 38,
    title: "Crunchyroll",
    type: "applications",
    image: "/a-files/image/crunchyroll-image.avif",
    description: "Crunchyroll est un service de streaming d'anime, dramas asiatiques et mangas.",
    rating: 4.5,
    notes: "Leader du streaming anime légal"
  },
  {
    id: 39,
    title: "Dragon Ball",
    type: "series-animations",
    image: "/a-files/image/dragonball-image.avif",
    description: "Dragon Ball est une série de manga et d'anime créée par Akira Toriyama.",
    rating: 4.9,
    notes: "Classique du manga et de l'anime",
    community: true
  }
];

// Helper functions with all features
function getAll(filter = null) {
  if (!filter) return evaluationData;
  if (filter === 'featured') return evaluationData.filter(item => item.featured);
  if (filter === 'popular') return evaluationData.filter(item => item.community);
  if (filter === 'recent') return [...evaluationData].reverse();
  return evaluationData;
}

function getByType(type) {
  if (type === 'all') return evaluationData;
  return evaluationData.filter(item => item.type === type);
}

function getById(id) {
  return evaluationData.find(item => item.id === id);
}

function getByTag(tag) {
  return evaluationData.filter(item => item.tags && item.tags.includes(tag));
}

function search(query) {
  const q = query.toLowerCase();
  return evaluationData.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q) ||
    (item.creator && item.creator.toLowerCase().includes(q)) ||
    (item.tags && item.tags.some(tag => tag.toLowerCase().includes(q)))
  );
}

function getStats() {
  const types = {};
  evaluationData.forEach(item => {
    types[item.type] = (types[item.type] || 0) + 1;
  });
  
  const avgRating = (evaluationData.reduce((sum, item) => sum + item.rating, 0) / evaluationData.length).toFixed(1);
  const featuredCount = evaluationData.filter(item => item.featured).length;
  const communityCount = evaluationData.filter(item => item.community).length;
  
  return {
    total: evaluationData.length,
    types,
    avgRating,
    featuredCount,
    communityCount,
    categories: Object.keys(types).length
  };
}

function getAllTags() {
  const tags = new Set();
  evaluationData.forEach(item => {
    if (item.tags) item.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}

// Export system
window.evaluationSystem = {
  data: evaluationData,
  getAll,
  getByType,
  getById,
  getByTag,
  search,
  getStats,
  getAllTags,
  getAllItems: () => evaluationData,
  getAllTypes: () => [...new Set(evaluationData.map(item => item.type))]
};
