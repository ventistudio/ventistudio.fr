document.addEventListener('DOMContentLoaded', () => {

  // =========================================
  // DATA — Staff Members
  // =========================================
  const staffMembers = {
    direction: [
      {
        name: "Hikari Umaishi",
        role: "Directeur Général",
        bio: "Visionnaire passionné par l'innovation numérique et la création de communautés en ligne.",
        joinDate: "2023-01",
        projects: 15,
        badge: "Fondateur",
        social: { twitter: "#", github: "#", linkedin: "#" }
      },
      {
        name: "Marie Laurent",
        role: "Directrice Créative",
        bio: "Artiste numérique et stratège créative avec 10 ans d'expérience dans le design interactif.",
        joinDate: "2023-02",
        projects: 12,
        badge: "Direction",
        social: { twitter: "#", artstation: "#" }
      }
    ],
    dev: [
      {
        name: "Thomas Martin",
        role: "Lead Développeur",
        bio: "Expert en architectures web modernes et performances applicatives.",
        joinDate: "2023-03",
        projects: 8,
        badge: "Senior",
        social: { github: "#", linkedin: "#" }
      },
      {
        name: "Sophie Chen",
        role: "Développeuse Full-Stack",
        bio: "Spécialisée en applications temps réel et expériences utilisateur fluides.",
        joinDate: "2023-04",
        projects: 6,
        badge: "Full-Stack",
        social: { github: "#", codepen: "#" }
      }
    ],
    mod: [
      {
        name: "Lucas Bernard",
        role: "Modérateur en Chef",
        bio: "Gardien de la communauté, toujours à l'écoute pour maintenir un environnement positif.",
        joinDate: "2023-05",
        projects: 10,
        badge: "Senior Mod",
        social: { twitter: "#", discord: "#" }
      },
      {
        name: "Emma Petit",
        role: "Modératrice",
        bio: "Experte en gestion de communauté et médiation numérique.",
        joinDate: "2023-06",
        projects: 5,
        badge: "Mod",
        social: { twitter: "#" }
      }
    ],
    content: [
      {
        name: "Hikari Umaishi",
        role: "Responsable Contenu",
        bio: "Membre de la direction.",
        joinDate: "2016-09",
        projects: 20,
        badge: "Lead",
        social: { youtube: "#", instagram: "#" }
      },
      {
        name: "Lilou",
        role: "Rédactrice",
        bio: "French Developer.",
        joinDate: "2026-01",
        projects: 15,
        badge: "Editor",
        social: { medium: "#", twitter: "#" }
      }
    ],
    bot: [
      {
        name: "Aina Umaishi",
        role: "iHorizon Custom",
        bio: "Intelligence Artificielle de Nouvelle Age.",
        joinDate: "2023-01",
        projects: 0,
        badge: "Bot",
        social: { twitter: "#", github: "#" }
      }
    ]
  };

  // =========================================
  // DATA — Artists
  // =========================================
  const artists = [
    {
      id: "artist1",
      name: "Venti Opastudien",
      displayName: "Hikari Umaishi",
      image: "/a-files/image/ventiopastudien.avif",
      role: "Fondateur & Artiste",
      bio: "Fondateur de VentiStudio et artiste principal, Hikari combine créativité et innovation pour donner vie à des projets uniques.",
      links: [
        { label: "💬 Discord", url: "/social/Link-Start/?redirect=https://discord.gg/BupfZHSBbC" },
        { label: "🎵 Spotify", url: "/social/Link-Start/?redirect=https://open.spotify.com/intl-fr/artist/77MxpoFvQT4XPVwtsZP403?nd=1&dlsi=bc618534e2214645" },
        { label: "💻 GitHub", url: "/social/Link-Start/?redirect=https://github.com/ventistudio" }
      ]
    },
    {
      id: "artist2",
      name: "P0LTERG3IIST",
      displayName: "P0LTERG3IIST",
      image: "/a-files/image/p0lterg3iist.avif",
      role: "Gérante & Artiste Musical",
      bio: "Artiste spécialisé dans la musique pop, hyperpop.",
      links: [
        { label: "💬 Discord", url: "/social/Link-Start/?redirect=https://discord.gg/vwgtNPKRXw" },
        { label: "🎵 SoundCloud", url: "/social/Link-Start/?redirect=https://soundcloud.com/moonlightvoc-437" }
      ]
    },
    {
      id: "artist3",
      name: "LIGHTWATER",
      displayName: "LIGHTWATER",
      image: "/a-files/image/lightwater.avif",
      role: "Artiste Musical",
      bio: "Artiste spécialisé dans l'art numérique et la musique pop, hip-hop, drill et freestyle.",
      links: [
        { label: "💬 Discord", url: "/social/Link-Start/?redirect=https://discord.gg/xZZMdn7byF" },
        { label: "📹 YouTube", url: "/social/Link-Start/?redirect=https://www.youtube.com/@lightwater_prod" }
      ]
    },
    {
      id: "artist4",
      name: "Il était une fée mokafrego",
      displayName: "Il était une fée mokafrego",
      image: "/a-files/image/iletaitunefeemokafrego.avif",
      role: "Créatrice de Contenu",
      bio: "Notre bataille pour notre fils ! 💪 Mais aussi, amour, simplicité, fun ...",
      links: [
        { label: "📱 TikTok", url: "/social/Link-Start/?redirect=https://www.tiktok.com/@iletaitunefeemokafrego" }
      ]
    },
    {
      id: "artist5",
      name: "Justice Pour Hugo",
      displayName: "Justice Pour Hugo",
      image: "/a-files/image/justicepourhugo.avif",
      role: "Créatrice de Contenu",
      bio: "🎮♟️🎧🎬🦁 mon combat ne fait que commencer @Gogo& Lulu",
      links: [
        { label: "📱 TikTok", url: "/social/Link-Start/?redirect=https://www.tiktok.com/@justice_pour_hugo" }
      ]
    }
  ];

  // =========================================
  // RENDER — Staff member card
  // =========================================
  function createMemberCard(member) {
    return `
      <div class="member-card">
        <div class="member-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          ${member.badge ? `<span class="member-badge">${member.badge}</span>` : ''}
        </div>
        <div class="member-info">
          <h3 class="member-name">${member.name}</h3>
          <div class="member-role">${member.role}</div>
          <p class="member-bio">${member.bio}</p>
          <div class="member-stats">
            <span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              ${member.projects} projets
            </span>
            <span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Depuis ${new Date(member.joinDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div class="member-social">
            ${Object.entries(member.social).map(([platform, link]) => `
              <a href="${link}" class="social-link" title="${platform}" target="_blank" rel="noopener">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
              </a>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // =========================================
  // RENDER — Artist card + modal
  // =========================================
  function createArtistCard(artist) {
    return `
      <div class="artist-card" data-artist="${artist.id}">
        <img src="${artist.image}" alt="${artist.name}" loading="lazy">
        <div class="artist-name">${artist.name}</div>
      </div>
    `;
  }

  function createArtistModal(artist) {
    return `
      <div class="artist-modal" id="${artist.id}">
        <button class="close-modal" aria-label="Fermer">✕</button>
        <img src="${artist.image}" alt="${artist.displayName}">
        <h3>${artist.displayName}</h3>
        <div class="artist-info">
          <p><strong>Nom d'artiste :</strong> ${artist.name}</p>
          <p><strong>Rôle :</strong> ${artist.role}</p>
          <p><strong>Biographie :</strong> ${artist.bio}</p>
        </div>
        <div class="artist-buttons">
          ${artist.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`).join('')}
        </div>
      </div>
    `;
  }

  // =========================================
  // POPULATE
  // =========================================

  // Staff
  Object.entries(staffMembers).forEach(([team, members]) => {
    const container = document.querySelector(`#${team}-team .team-members`);
    if (container) {
      container.innerHTML = members.map(createMemberCard).join('');
    }
  });

  // Artists
  const artistGrid = document.getElementById('artist-grid');
  const modalContainer = document.getElementById('artist-modals');
  if (artistGrid && modalContainer) {
    artistGrid.innerHTML = artists.map(createArtistCard).join('');
    modalContainer.innerHTML = artists.map(createArtistModal).join('');
  }

  // =========================================
  // TABS
  // =========================================
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(`tab-${btn.dataset.tab}`);
      if (target) target.classList.add('active');
    });
  });

  // =========================================
  // TEAM FILTERS
  // =========================================
  const filterButtons = document.querySelectorAll('.filter-btn');
  const teamCategories = document.querySelectorAll('.team-category');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      const filter = button.dataset.team;
      teamCategories.forEach(category => {
        category.style.display = (filter === 'all' || category.id.includes(filter)) ? 'block' : 'none';
      });
    });
  });

  // =========================================
  // ARTIST MODALS
  // =========================================
  const overlay = document.getElementById('artistOverlay');

  function openArtistModal(id) {
    document.querySelectorAll('.artist-modal').forEach(m => m.classList.remove('active'));
    const modal = document.getElementById(id);
    if (modal && overlay) {
      overlay.classList.add('active');
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeArtistModal() {
    overlay.classList.remove('active');
    document.querySelectorAll('.artist-modal').forEach(m => m.classList.remove('active'));
    document.body.style.overflow = '';
  }

  // Click on artist card
  document.querySelectorAll('.artist-card').forEach(card => {
    card.addEventListener('click', () => openArtistModal(card.dataset.artist));
  });

  // Close via overlay
  if (overlay) overlay.addEventListener('click', closeArtistModal);

  // Close via button
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeArtistModal();
    });
  });

  // Close via Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeArtistModal();
  });

});
