/**
 * Le Livre de Cuisine — VentiStudio
 * Base de données des recettes
 */
const cookbookData = [
  {
    id: "gateau-chocolat-fondant",
    title: "Gâteau au Chocolat Fondant",
    emoji: "🍰",
    category: "patisseries",
    categoryLabel: "Pâtisseries & Viennoiseries",
    difficulty: "Facile",
    totalTime: "40 min",
    defaultServings: 6,
    servingsUnit: "parts",
    description: "Un gâteau au chocolat fondant à cœur, irrésistible et simplissime à préparer.",
    ingredients: [
      { name: "chocolat noir", qty: 200, unit: "g" },
      { name: "beurre", qty: 150, unit: "g" },
      { name: "sucre", qty: 150, unit: "g" },
      { name: "œufs", qty: 3, unit: "" },
      { name: "farine", qty: 80, unit: "g" },
      { name: "sel", qty: 1, unit: "pincée" }
    ],
    steps: [
      { text: "Préchauffer le four à 180 °C.", timer: null },
      { text: "Faire fondre le chocolat et le beurre au bain-marie.", timer: 300 },
      { text: "Battre les œufs avec le sucre jusqu'à obtenir un mélange mousseux.", timer: 180 },
      { text: "Incorporer le chocolat fondu, puis la farine et le sel.", timer: null },
      { text: "Verser dans un moule beurré et enfourner 25 minutes.", timer: 1500 },
      { text: "Laisser tiédir avant de démouler. Servir avec de la crème fouettée.", timer: 600 }
    ]
  },
  {
    id: "croissants-maison",
    title: "Croissants Maison au Beurre",
    emoji: "🥐",
    category: "patisseries",
    categoryLabel: "Pâtisseries & Viennoiseries",
    difficulty: "Avancé",
    totalTime: "3 h",
    defaultServings: 6,
    servingsUnit: "pièces",
    description: "De vrais croissants feuilletés au beurre, croustillants dehors et moelleux dedans.",
    ingredients: [
      { name: "farine T45", qty: 500, unit: "g" },
      { name: "sel", qty: 10, unit: "g" },
      { name: "sucre", qty: 80, unit: "g" },
      { name: "levure fraîche", qty: 20, unit: "g" },
      { name: "lait tiède", qty: 300, unit: "ml" },
      { name: "beurre sec (tourage)", qty: 280, unit: "g" }
    ],
    steps: [
      { text: "Mélanger farine, sel, sucre, levure et lait. Pétrir 10 min.", timer: 600 },
      { text: "Laisser reposer la pâte 1 h au frais.", timer: 3600 },
      { text: "Étaler le beurre en rectangle et l'enfermer dans la détrempe.", timer: null },
      { text: "Réaliser 3 tours simples avec 30 min de repos entre chaque.", timer: 5400 },
      { text: "Découper en triangles, rouler et laisser lever 1 h 30.", timer: 5400 },
      { text: "Dorer à l'œuf et cuire à 200 °C pendant 15 minutes.", timer: 900 }
    ]
  },
  {
    id: "tarte-fraises",
    title: "Tarte aux Fraises & Crème Pâtissière",
    emoji: "🍓",
    category: "patisseries",
    categoryLabel: "Pâtisseries & Viennoiseries",
    difficulty: "Intermédiaire",
    totalTime: "1 h",
    defaultServings: 6,
    servingsUnit: "parts",
    description: "Une tarte classique avec une crème pâtissière onctueuse et des fraises fraîches.",
    ingredients: [
      { name: "pâte sablée", qty: 1, unit: "" },
      { name: "lait", qty: 500, unit: "ml" },
      { name: "jaunes d'œufs", qty: 4, unit: "" },
      { name: "sucre", qty: 100, unit: "g" },
      { name: "maïzena", qty: 40, unit: "g" },
      { name: "fraises fraîches", qty: 500, unit: "g" }
    ],
    steps: [
      { text: "Cuire la pâte sablée à blanc 20 min à 180 °C.", timer: 1200 },
      { text: "Préparer la crème : chauffer le lait, mélanger jaunes/sucre/maïzena, cuire jusqu'à épaississement.", timer: 600 },
      { text: "Laisser refroidir la crème filmée au contact.", timer: 1800 },
      { text: "Garnir le fond de tarte de crème pâtissière.", timer: null },
      { text: "Disposer les fraises coupées en deux sur le dessus.", timer: null },
      { text: "Napper d'un peu de confiture de fraises diluée pour le brillant.", timer: null }
    ]
  },
  {
    id: "carbonara-authentique",
    title: "Carbonara Authentique",
    emoji: "🍝",
    category: "plats",
    categoryLabel: "Plats Principaux",
    difficulty: "Facile",
    totalTime: "25 min",
    defaultServings: 6,
    servingsUnit: "portions",
    description: "La vraie recette italienne, sans crème, avec guanciale et pecorino.",
    ingredients: [
      { name: "spaghetti", qty: 400, unit: "g" },
      { name: "guanciale", qty: 200, unit: "g" },
      { name: "jaunes d'œufs", qty: 4, unit: "" },
      { name: "œuf entier", qty: 1, unit: "" },
      { name: "pecorino romano râpé", qty: 100, unit: "g" },
      { name: "poivre noir", qty: 1, unit: "c.c." }
    ],
    steps: [
      { text: "Cuire les pâtes dans une grande quantité d'eau salée.", timer: 600 },
      { text: "Faire revenir le guanciale coupé en lardons sans matière grasse.", timer: 480 },
      { text: "Mélanger les jaunes, l'œuf entier, le pecorino et le poivre.", timer: null },
      { text: "Égoutter les pâtes en gardant un peu d'eau de cuisson.", timer: null },
      { text: "Mélanger pâtes et guanciale hors du feu, ajouter la crème d'œufs.", timer: null },
      { text: "Remuer vivement en ajoutant de l'eau de cuisson si nécessaire.", timer: 60 }
    ]
  },
  {
    id: "poulet-roti-herbes",
    title: "Poulet Rôti aux Herbes de Provence",
    emoji: "🍗",
    category: "plats",
    categoryLabel: "Plats Principaux",
    difficulty: "Facile",
    totalTime: "1 h 30",
    defaultServings: 6,
    servingsUnit: "portions",
    description: "Un poulet doré et juteux, parfumé aux herbes, avec ses pommes de terre fondantes.",
    ingredients: [
      { name: "poulet fermier (~1,5 kg)", qty: 1, unit: "" },
      { name: "herbes de Provence", qty: 3, unit: "c.s." },
      { name: "gousses d'ail", qty: 4, unit: "" },
      { name: "citron", qty: 1, unit: "" },
      { name: "beurre", qty: 50, unit: "g" },
      { name: "pommes de terre grenaille", qty: 500, unit: "g" }
    ],
    steps: [
      { text: "Préchauffer le four à 200 °C.", timer: null },
      { text: "Frotter le poulet avec le beurre mou mélangé aux herbes.", timer: null },
      { text: "Glisser le citron coupé et l'ail à l'intérieur du poulet.", timer: null },
      { text: "Disposer les pommes de terre autour dans le plat.", timer: null },
      { text: "Enfourner 1 h 15, en arrosant régulièrement du jus de cuisson.", timer: 4500 },
      { text: "Laisser reposer 10 min sous papier alu avant de découper.", timer: 600 }
    ]
  },
  {
    id: "boeuf-bourguignon",
    title: "Bœuf Bourguignon",
    emoji: "🥘",
    category: "plats",
    categoryLabel: "Plats Principaux",
    difficulty: "Intermédiaire",
    totalTime: "3 h",
    defaultServings: 6,
    servingsUnit: "portions",
    description: "Le grand classique français : viande fondante, sauce riche au vin rouge de Bourgogne.",
    ingredients: [
      { name: "bœuf (paleron, macreuse)", qty: 1, unit: "kg" },
      { name: "vin rouge de Bourgogne", qty: 75, unit: "cl" },
      { name: "lardons", qty: 200, unit: "g" },
      { name: "champignons", qty: 250, unit: "g" },
      { name: "carottes", qty: 3, unit: "" },
      { name: "oignons", qty: 2, unit: "" }
    ],
    steps: [
      { text: "Couper la viande en cubes et faire mariner dans le vin toute la nuit.", timer: null },
      { text: "Égoutter la viande, la saisir dans une cocotte avec un filet d'huile.", timer: 300 },
      { text: "Ajouter lardons, oignons et carottes, faire revenir 5 min.", timer: 300 },
      { text: "Verser la marinade, ajouter le bouquet garni, couvrir.", timer: null },
      { text: "Cuire à feu doux pendant 2 h 30.", timer: 9000 },
      { text: "Ajouter les champignons 30 min avant la fin. Rectifier l'assaisonnement.", timer: 1800 }
    ]
  },
  {
    id: "salade-cesar",
    title: "Salade César Classique",
    emoji: "🥗",
    category: "entrees",
    categoryLabel: "Entrées & Salades",
    difficulty: "Facile",
    totalTime: "20 min",
    defaultServings: 6,
    servingsUnit: "portions",
    description: "La célébrissime salade avec sa sauce crémeuse, ses croûtons croustillants et son parmesan.",
    ingredients: [
      { name: "laitue romaine", qty: 1, unit: "" },
      { name: "parmesan", qty: 100, unit: "g" },
      { name: "croûtons à l'ail", qty: 100, unit: "g" },
      { name: "filets d'anchois", qty: 2, unit: "" },
      { name: "jaune d'œuf", qty: 1, unit: "" },
      { name: "huile d'olive", qty: 10, unit: "cl" }
    ],
    steps: [
      { text: "Préparer la sauce : mixer jaune d'œuf, anchois, moutarde et jus de citron.", timer: 120 },
      { text: "Monter en émulsion en ajoutant l'huile d'olive progressivement.", timer: 120 },
      { text: "Laver et essorer la romaine, la couper en morceaux.", timer: null },
      { text: "Préparer les croûtons dorés à la poêle avec de l'ail.", timer: 180 },
      { text: "Mélanger la salade avec la sauce, parsemer de parmesan et croûtons.", timer: null }
    ]
  },
  {
    id: "gaspacho-andalou",
    title: "Gaspacho Andalou",
    emoji: "🍅",
    category: "entrees",
    categoryLabel: "Entrées & Salades",
    difficulty: "Facile",
    totalTime: "15 min + frais",
    defaultServings: 6,
    servingsUnit: "portions",
    description: "Soupe froide espagnole aux tomates, rafraîchissante et pleine de vitamines.",
    ingredients: [
      { name: "tomates bien mûres", qty: 1, unit: "kg" },
      { name: "concombre", qty: 1, unit: "" },
      { name: "poivron vert", qty: 1, unit: "" },
      { name: "gousses d'ail", qty: 2, unit: "" },
      { name: "huile d'olive", qty: 4, unit: "c.s." },
      { name: "vinaigre de xérès", qty: 2, unit: "c.s." }
    ],
    steps: [
      { text: "Couper tous les légumes en morceaux grossiers.", timer: null },
      { text: "Mixer le tout avec l'huile, le vinaigre, sel et poivre.", timer: 120 },
      { text: "Passer au tamis pour une texture lisse (optionnel).", timer: null },
      { text: "Réfrigérer au moins 2 heures.", timer: 7200 },
      { text: "Servir glacé avec des dés de concombre et un filet d'huile d'olive.", timer: null }
    ]
  },
  {
    id: "sushi-maki-saumon",
    title: "Sushi Maki Saumon-Avocat",
    emoji: "🍣",
    category: "monde",
    categoryLabel: "Cuisine du Monde",
    difficulty: "Intermédiaire",
    totalTime: "45 min",
    defaultServings: 6,
    servingsUnit: "pièces (×5)",
    description: "Des makis maison frais et savoureux, garnis de saumon et d'avocat crémeux.",
    ingredients: [
      { name: "riz à sushi", qty: 300, unit: "g" },
      { name: "vinaigre de riz", qty: 4, unit: "c.s." },
      { name: "saumon frais (qualité sushi)", qty: 200, unit: "g" },
      { name: "avocats", qty: 2, unit: "" },
      { name: "feuilles de nori", qty: 5, unit: "" },
      { name: "sauce soja", qty: 1, unit: "flacon" }
    ],
    steps: [
      { text: "Cuire le riz et l'assaisonner avec le vinaigre de riz sucré.", timer: 900 },
      { text: "Poser une feuille de nori sur la natte en bambou.", timer: null },
      { text: "Étaler une fine couche de riz, laisser 1 cm en haut de la feuille.", timer: null },
      { text: "Déposer une ligne de saumon et d'avocat au centre.", timer: null },
      { text: "Rouler fermement à l'aide de la natte.", timer: null },
      { text: "Couper en 6 morceaux avec un couteau humide. Servir avec soja et wasabi.", timer: null }
    ]
  },
  {
    id: "tacos-al-pastor",
    title: "Tacos al Pastor",
    emoji: "🌮",
    category: "monde",
    categoryLabel: "Cuisine du Monde",
    difficulty: "Intermédiaire",
    totalTime: "50 min",
    defaultServings: 6,
    servingsUnit: "portions",
    description: "Tacos mexicains authentiques au porc mariné et ananas grillé.",
    ingredients: [
      { name: "porc (échine) en tranches fines", qty: 500, unit: "g" },
      { name: "piments guajillo séchés", qty: 3, unit: "" },
      { name: "ananas frais", qty: 200, unit: "g" },
      { name: "tortillas de maïs", qty: 12, unit: "" },
      { name: "oignon, coriandre", qty: 1, unit: "bouquet" },
      { name: "citrons verts", qty: 3, unit: "" }
    ],
    steps: [
      { text: "Réhydrater les piments et les mixer avec achiote, cumin et origan.", timer: 300 },
      { text: "Mariner le porc dans cette sauce pendant 2 heures minimum.", timer: 7200 },
      { text: "Griller le porc à feu vif avec des tranches d'ananas.", timer: 480 },
      { text: "Chauffer les tortillas sur une plancha.", timer: 120 },
      { text: "Émincer la viande et l'ananas grillé.", timer: null },
      { text: "Garnir les tortillas, ajouter oignon, coriandre et un trait de citron vert.", timer: null }
    ]
  },
  {
    id: "curry-thai-coco",
    title: "Curry Thaï au Lait de Coco",
    emoji: "🍛",
    category: "monde",
    categoryLabel: "Cuisine du Monde",
    difficulty: "Facile",
    totalTime: "35 min",
    defaultServings: 6,
    servingsUnit: "portions",
    description: "Un curry crémeux et parfumé, rapide à préparer et réconfortant.",
    ingredients: [
      { name: "lait de coco", qty: 400, unit: "ml" },
      { name: "pâte de curry vert", qty: 3, unit: "c.s." },
      { name: "poulet ou tofu", qty: 300, unit: "g" },
      { name: "aubergine thaïe", qty: 1, unit: "" },
      { name: "basilic thaï", qty: 1, unit: "bouquet" },
      { name: "riz jasmin", qty: 300, unit: "g" }
    ],
    steps: [
      { text: "Faire revenir la pâte de curry dans un fond de lait de coco.", timer: 120 },
      { text: "Ajouter le poulet/tofu et cuire 5 min.", timer: 300 },
      { text: "Verser le reste du lait de coco, ajouter les légumes.", timer: null },
      { text: "Assaisonner avec la sauce poisson et le sucre de palme.", timer: null },
      { text: "Mijoter 15 min à feu doux.", timer: 900 },
      { text: "Parsemer de basilic thaï et servir sur du riz jasmin.", timer: null }
    ]
  },
  {
    id: "citronnade-lavande",
    title: "Citronnade à la Lavande",
    emoji: "🍋",
    category: "boissons",
    categoryLabel: "Boissons & Cocktails",
    difficulty: "Facile",
    totalTime: "10 min + frais",
    defaultServings: 6,
    servingsUnit: "verres",
    description: "Une boisson estivale délicatement parfumée à la lavande et au citron frais.",
    ingredients: [
      { name: "citrons jaunes", qty: 6, unit: "" },
      { name: "sucre", qty: 100, unit: "g" },
      { name: "eau", qty: 1, unit: "L" },
      { name: "fleurs de lavande séchées", qty: 2, unit: "c.s." },
      { name: "glaçons", qty: 1, unit: "bac" }
    ],
    steps: [
      { text: "Faire un sirop : chauffer 250 ml d'eau avec le sucre et la lavande.", timer: 300 },
      { text: "Laisser infuser 15 min puis filtrer.", timer: 900 },
      { text: "Presser les citrons.", timer: null },
      { text: "Mélanger le sirop, le jus de citron et le reste d'eau.", timer: null },
      { text: "Réfrigérer 1 h et servir avec glaçons et menthe.", timer: 3600 }
    ]
  },
  {
    id: "chai-latte-epice",
    title: "Chaï Latte Épicé Maison",
    emoji: "🫖",
    category: "boissons",
    categoryLabel: "Boissons & Cocktails",
    difficulty: "Facile",
    totalTime: "15 min",
    defaultServings: 6,
    servingsUnit: "tasses",
    description: "Un chaï crémeux et réconfortant aux épices, parfait pour les journées fraîches.",
    ingredients: [
      { name: "thé noir (sachets ou c.c. en vrac)", qty: 2, unit: "" },
      { name: "eau", qty: 250, unit: "ml" },
      { name: "lait (ou lait d'avoine)", qty: 250, unit: "ml" },
      { name: "gousses de cardamome", qty: 3, unit: "" },
      { name: "bâton de cannelle", qty: 1, unit: "" },
      { name: "miel ou sucre", qty: 2, unit: "c.c." }
    ],
    steps: [
      { text: "Écraser légèrement les épices au pilon.", timer: null },
      { text: "Les faire infuser dans l'eau bouillante pendant 5 min avec le thé.", timer: 300 },
      { text: "Ajouter le lait et chauffer sans porter à ébullition.", timer: 180 },
      { text: "Filtrer et sucrer au goût.", timer: null },
      { text: "Saupoudrer de cannelle moulue et servir chaud.", timer: null }
    ]
  },
  {
    id: "bruschetta-tomates",
    title: "Bruschetta Tomates & Basilic",
    emoji: "🫓",
    category: "aperitifs",
    categoryLabel: "Apéritifs & Tapas",
    difficulty: "Facile",
    totalTime: "15 min",
    defaultServings: 6,
    servingsUnit: "pièces (×2)",
    description: "Des tartines croustillantes garnies de tomates fraîches, ail et basilic.",
    ingredients: [
      { name: "baguette de pain", qty: 1, unit: "" },
      { name: "tomates Roma", qty: 6, unit: "" },
      { name: "gousses d'ail", qty: 2, unit: "" },
      { name: "basilic frais", qty: 1, unit: "bouquet" },
      { name: "huile d'olive extra vierge", qty: 4, unit: "c.s." },
      { name: "sel de Maldon", qty: 1, unit: "pincée" }
    ],
    steps: [
      { text: "Couper la baguette en tranches et les griller au four.", timer: 300 },
      { text: "Frotter chaque tranche avec une demi-gousse d'ail.", timer: null },
      { text: "Couper les tomates en petits dés, mélanger avec huile, sel et basilic ciselé.", timer: null },
      { text: "Déposer généreusement le mélange sur les tranches grillées.", timer: null },
      { text: "Servir immédiatement avec un filet d'huile d'olive.", timer: null }
    ]
  },
  {
    id: "falafels-tahini",
    title: "Falafels Croustillants & Sauce Tahini",
    emoji: "🧆",
    category: "aperitifs",
    categoryLabel: "Apéritifs & Tapas",
    difficulty: "Intermédiaire",
    totalTime: "40 min + repos",
    defaultServings: 6,
    servingsUnit: "pièces (×3)",
    description: "Boulettes croustillantes de pois chiches aux herbes, servies avec une sauce tahini citronnée.",
    ingredients: [
      { name: "pois chiches secs (trempés 12 h)", qty: 400, unit: "g" },
      { name: "oignon", qty: 1, unit: "" },
      { name: "gousses d'ail", qty: 4, unit: "" },
      { name: "persil + coriandre fraîche", qty: 1, unit: "bouquet" },
      { name: "cumin + coriandre moulue", qty: 1, unit: "c.c. chaque" },
      { name: "tahini", qty: 4, unit: "c.s." }
    ],
    steps: [
      { text: "Égoutter les pois chiches et les mixer avec oignon, ail et herbes.", timer: 120 },
      { text: "Ajouter les épices, saler. La pâte doit être granuleuse, pas lisse.", timer: null },
      { text: "Réfrigérer 1 h pour raffermir.", timer: 3600 },
      { text: "Former des boulettes et les frire dans l'huile à 180 °C pendant 3-4 min.", timer: 240 },
      { text: "Préparer la sauce : mélanger tahini, jus de citron, eau et sel.", timer: null },
      { text: "Servir les falafels chauds avec la sauce tahini et du pain pita.", timer: null }
    ]
  },
  {
    id: "ramen-tonkotsu",
    title: "Ramen Tonkotsu façon VentiStudio",
    emoji: "🍲",
    category: "monde",
    categoryLabel: "Cuisine du Monde",
    difficulty: "Intermédiaire",
    totalTime: "45 min (+ bouillon)",
    defaultServings: 6,
    servingsUnit: "portions",
    description: "Un bouillon onctueux mijoté pendant 12 heures, garni de chashu fondant, d'un œuf mollet parfait et de menma croquant. Une recette signature de notre communauté.",
    featured: true,
    ingredients: [
      { name: "os de porc", qty: 1, unit: "kg" },
      { name: "nouilles ramen fraîches", qty: 400, unit: "g" },
      { name: "poitrine de porc (chashu)", qty: 300, unit: "g" },
      { name: "œufs", qty: 4, unit: "" },
      { name: "sauce soja, mirin", qty: 4, unit: "c.s. chaque" },
      { name: "oignons verts, nori, menma", qty: 1, unit: "garniture" }
    ],
    steps: [
      { text: "Préparer le bouillon : blanchir les os, puis mijoter 12 h à feu doux.", timer: null },
      { text: "Braiser la poitrine de porc dans soja + mirin pendant 2 h.", timer: 7200 },
      { text: "Cuire les œufs mollets (6 min 30 à ébullition), les mariner dans le jus.", timer: 390 },
      { text: "Cuire les nouilles selon les instructions.", timer: 180 },
      { text: "Assembler dans un bol : bouillon chaud, nouilles, chashu tranché.", timer: null },
      { text: "Garnir avec l'œuf, les oignons verts, le nori et le menma.", timer: null }
    ]
  }
];

/**
 * API Cookbook
 */
window.cookbookSystem = {
  getAll() { return cookbookData; },
  getById(id) { return cookbookData.find(r => r.id === id) || null; },
  getByCategory(cat) { return cookbookData.filter(r => r.category === cat); },
  getFeatured() { return cookbookData.find(r => r.featured) || cookbookData[0]; },
  getCategories() {
    const catEmojis = { patisseries: '🥐', plats: '🍝', entrees: '🥗', monde: '🍜', boissons: '🍹', aperitifs: '🧀' };
    const map = {};
    cookbookData.forEach(r => {
      if (!map[r.category]) map[r.category] = r.categoryLabel;
    });
    return Object.entries(map).map(([id, label]) => ({ id, label, emoji: catEmojis[id] || '🍽️' }));
  },
  search(q) {
    const lower = q.toLowerCase();
    return cookbookData.filter(r =>
      r.title.toLowerCase().includes(lower) ||
      r.description.toLowerCase().includes(lower) ||
      r.categoryLabel.toLowerCase().includes(lower)
    );
  }
};
