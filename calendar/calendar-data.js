// ═══ Données du Calendrier — Événements VentiStudio ═══
// category: concert | community | release | birthday | special
// recurring: false | "yearly" | "monthly"

var calendarData = [
  // ── Concerts ──
  { id: "evt-001", title: "eConcert Live #12", date: "2026-04-15", time: "20:00", category: "concert", description: "Concert en direct sur Discord avec artistes invités.", location: "Discord VentiStudio", link: "/eConcert/", recurring: false },
  { id: "evt-002", title: "eConcert Live #13", date: "2026-05-20", time: "20:00", category: "concert", description: "Session musicale spéciale printemps.", location: "Discord VentiStudio", link: "/eConcert/", recurring: false },
  { id: "evt-003", title: "eConcert Live #14", date: "2026-06-21", time: "20:00", category: "concert", description: "Concert spécial Fête de la Musique.", location: "Discord VentiStudio", link: "/eConcert/", recurring: false },

  // ── Communauté ──
  { id: "evt-010", title: "Soirée jeux communautaire", date: "2026-04-12", time: "19:00", category: "community", description: "Soirée jeux multijoueur avec la communauté sur Discord.", location: "Discord VentiStudio", link: "/discord/", recurring: "monthly" },
  { id: "evt-011", title: "Réunion de l'équipe", date: "2026-04-05", time: "18:00", category: "community", description: "Réunion mensuelle de l'équipe VentiStudio.", location: "TeamSpeak", link: "/teamspeak/", recurring: "monthly" },
  { id: "evt-012", title: "Workshop créatif", date: "2026-04-19", time: "15:00", category: "community", description: "Atelier de création collaborative : illustration et musique.", location: "Discord VentiStudio", link: "/discord/", recurring: false },
  { id: "evt-013", title: "Soirée jeux communautaire", date: "2026-05-10", time: "19:00", category: "community", description: "Soirée jeux multijoueur avec la communauté.", location: "Discord VentiStudio", link: "/discord/", recurring: "monthly" },

  // ── Sorties ──
  { id: "evt-020", title: "Mise à jour v4.2", date: "2026-04-08", time: "10:00", category: "release", description: "Déploiement de la mise à jour v4.2 avec nouvelles pages et outils.", location: "ventistudio.eu", link: "/update.html", recurring: false },
  { id: "evt-021", title: "Nouveau single — Artiste invité", date: "2026-04-25", time: "12:00", category: "release", description: "Sortie du nouveau single en collaboration avec un artiste invité.", location: "ventistudio.eu/music", link: "/music/", recurring: false },
  { id: "evt-022", title: "Lancement galerie communautaire", date: "2026-04-10", time: "14:00", category: "release", description: "Ouverture officielle de la galerie des créations communautaires.", location: "ventistudio.eu/gallery", link: "/gallery/", recurring: false },

  // ── Anniversaires ──
  { id: "evt-030", title: "Anniversaire VentiStudio", date: "2026-07-15", time: "00:00", category: "birthday", description: "Célébration de l'anniversaire de la création de VentiStudio.", location: "Toutes plateformes", link: "/birthday/", recurring: "yearly" },

  // ── Spéciaux ──
  { id: "evt-040", title: "Poisson d'avril", date: "2026-04-01", time: "00:00", category: "special", description: "Événement spécial du 1er avril — surprises cachées sur le site !", location: "ventistudio.eu", link: "/", recurring: "yearly" },
  { id: "evt-041", title: "Fête de la Musique", date: "2026-06-21", time: "00:00", category: "special", description: "Journée spéciale dédiée à la musique avec événements tout au long de la journée.", location: "Toutes plateformes", link: "/music/", recurring: "yearly" },
  { id: "evt-042", title: "Halloween", date: "2026-10-31", time: "00:00", category: "special", description: "Événement Halloween avec thème spécial et easter eggs.", location: "ventistudio.eu", link: "/ester-eggs/", recurring: "yearly" },
  { id: "evt-043", title: "Noël VentiStudio", date: "2026-12-25", time: "00:00", category: "special", description: "Célébration de Noël avec effets visuels spéciaux et cadeaux communautaires.", location: "Toutes plateformes", link: "/", recurring: "yearly" },
  { id: "evt-044", title: "Star Wars Day", date: "2026-05-04", time: "00:00", category: "special", description: "May the 4th be with you ! Références Star Wars cachées sur le site.", location: "ventistudio.eu", link: "/ester-eggs/", recurring: "yearly" }
];
