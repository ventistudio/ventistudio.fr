var statusData = [

  { id: "website", name: "Site Web", url: "https://ventistudio.eu", category: "core", type: "internal", description: "Site principal VentiStudio" },
  { id: "auth", name: "Authentification", url: "https://clerk.ventistudio.eu", category: "core", type: "internal", description: "Système de connexion (Clerk SSO)" },
  { id: "accounts", name: "Comptes", url: "https://accounts.ventistudio.eu", category: "core", type: "internal", description: "Gestion des comptes utilisateurs" },

  { id: "discord", name: "Discord", url: "https://discord.gg/ventistudio", category: "community", type: "external", description: "Serveur Discord officiel" },
  { id: "teamspeak", name: "TeamSpeak", url: "/teamspeak/", category: "community", type: "external", description: "Serveur vocal TeamSpeak" },

  { id: "peercom", name: "PeerCom", url: "https://ventistudio.eu/peercom/", category: "tools", type: "internal", description: "Chat P2P chiffré et appels vocaux" },
  { id: "pip", name: "PIP", url: "https://ventistudio.eu/pip/", category: "tools", type: "internal", description: "Lecteur Picture-in-Picture avancé" },
  { id: "whiteboard", name: "Tableau Blanc", url: "https://ventistudio.eu/whiteboard/", category: "tools", type: "internal", description: "Tableau blanc collaboratif P2P" },

  { id: "music", name: "Musique", url: "https://ventistudio.eu/music/", category: "media", type: "internal", description: "Discographie et lecteur musical" },
  { id: "wiki", name: "Wiki", url: "https://ventistudio.eu/wiki/", category: "media", type: "internal", description: "Wiki du lore et documentation" },
  { id: "news", name: "News", url: "https://ventistudio.eu/news/", category: "media", type: "internal", description: "Actualités et articles" },
  { id: "gallery", name: "Galerie", url: "https://ventistudio.eu/gallery/", category: "media", type: "internal", description: "Galerie communautaire d'œuvres" }
];

var statusIncidents = [
  { date: "2026-04-01", title: "Maintenance planifiée", description: "Mise à jour du système d'authentification.", severity: "maintenance", resolved: true },
  { date: "2026-03-20", title: "Ralentissement PeerCom", description: "Latence élevée sur les connexions P2P, résolu en 2h.", severity: "minor", resolved: true },
  { date: "2026-03-10", title: "Interruption du site", description: "Indisponibilité de 15 minutes suite à une mise à jour.", severity: "major", resolved: true }
];
