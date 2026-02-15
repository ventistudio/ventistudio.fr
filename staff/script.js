document.addEventListener('DOMContentLoaded', () => {
  // Sample staff data
  const staffMembers = {
    direction: [
      {
        name: "Alex Durand",
        role: "Directeur Général",
        bio: "Visionnaire passionné par l'innovation numérique et la création de communautés en ligne.",
        joinDate: "2023-01",
        projects: 15,
        badge: "Fondateur",
        social: {
          twitter: "#",
          github: "#",
          linkedin: "#"
        }
      },
      {
        name: "Marie Laurent",
        role: "Directrice Créative",
        bio: "Artiste numérique et stratège créative avec 10 ans d'expérience dans le design interactif.",
        joinDate: "2023-02",
        projects: 12,
        badge: "Direction",
        social: {
          twitter: "#",
          artstation: "#"
        }
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
        social: {
          github: "#",
          linkedin: "#"
        }
      },
      {
        name: "Sophie Chen",
        role: "Développeuse Full-Stack",
        bio: "Spécialisée en applications temps réel et expériences utilisateur fluides.",
        joinDate: "2023-04",
        projects: 6,
        badge: "Full-Stack",
        social: {
          github: "#",
          codepen: "#"
        }
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
        social: {
          twitter: "#",
          discord: "#"
        }
      },
      {
        name: "Emma Petit",
        role: "Modératrice",
        bio: "Experte en gestion de communauté et médiation numérique.",
        joinDate: "2023-06",
        projects: 5,
        badge: "Mod",
        social: {
          twitter: "#"
        }
      }
    ],
    content: [
      {
        name: "Jules Moreau",
        role: "Responsable Contenu",
        bio: "Créateur de contenu multimédia et curator passionné.",
        joinDate: "2023-07",
        projects: 20,
        badge: "Lead",
        social: {
          youtube: "#",
          instagram: "#"
        }
      },
      {
        name: "Clara Dubois",
        role: "Rédactrice",
        bio: "Plume créative spécialisée dans les contenus tech et gaming.",
        joinDate: "2023-08",
        projects: 15,
        badge: "Editor",
        social: {
          medium: "#",
          twitter: "#"
        }
      }
    ]
  };

  // Function to create member card
  function createMemberCard(member) {
    return `
      <div class="member-card" data-team="${member.role.toLowerCase()}">
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
              <a href="${link}" class="social-link" title="${platform}">
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

  // Populate team sections
  Object.entries(staffMembers).forEach(([team, members]) => {
    const container = document.getElementById(`${team}-team`).querySelector('.team-members');
    members.forEach(member => {
      container.innerHTML += createMemberCard(member);
    });
  });

  // Filter functionality
  const filterButtons = document.querySelectorAll('.filter-btn');
  const teamCategories = document.querySelectorAll('.team-category');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Filter teams
      const filter = button.dataset.team;
      teamCategories.forEach(category => {
        if (filter === 'all' || category.id.includes(filter)) {
          category.style.display = 'block';
        } else {
          category.style.display = 'none';
        }
      });
    });
  });

  // Join team button animation
  const joinButton = document.querySelector('.join-team .cta');
  joinButton.addEventListener('click', () => {
    joinButton.style.transform = 'scale(0.95)';
    setTimeout(() => {
      joinButton.style.transform = 'scale(1)';
      // Here you would typically handle the navigation to the jobs page
      alert('Redirection vers la page des offres d\'emploi...');
    }, 100);
  });
});