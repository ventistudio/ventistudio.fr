document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Set initial theme
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
  } else {
    document.documentElement.setAttribute('data-theme', prefersDarkScheme.matches ? 'dark' : 'light');
  }
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // Mobile menu toggle (if nav gets too long)
  const nav = document.querySelector('nav');
  const header = document.querySelector('header');
  
  // Ensure proper responsive behavior
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && nav) {
      nav.style.display = 'flex';
    }
  });

  // Card hover effects
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.boxShadow = 'var(--neon-glow)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.boxShadow = 'none';
    });
  });

  // CTA button animation
  const cta = document.querySelector('.cta');
  if (cta) {
    cta.innerHTML = `<span>${cta.textContent}</span>`;
    cta.addEventListener('click', () => {
      cta.style.transform = 'scale(0.95)';
      setTimeout(() => {
        cta.style.transform = 'translateY(-2px) scale(1)';
      }, 100);
    });
  }

  // Example recommendations data
  const recommendations = {
    musique: [
      { title: 'Album 1', artist: 'Artiste 1' },
      { title: 'Album 2', artist: 'Artiste 2' },
    ],
    livres: [
      { title: 'Livre 1', author: 'Auteur 1' },
      { title: 'Livre 2', author: 'Auteur 2' },
    ],
    jeux: [
      { title: 'Jeu 1', studio: 'Studio 1' },
      { title: 'Jeu 2', studio: 'Studio 2' },
    ],
    videos: [
      { title: 'Vidéo 1', creator: 'Créateur 1' },
      { title: 'Vidéo 2', creator: 'Créateur 2' },
    ]
  };

  // Populate recommendations
  Object.entries(recommendations).forEach(([category, items]) => {
    const section = document.querySelector(`.recommendation-section h3`);
    const container = section?.closest('.recommendation-section')?.querySelector('.recommendation-cards');
    if (container) {
      items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <h4>${item.title}</h4>
          <p>${Object.values(item)[1]}</p>
        `;
        container.appendChild(card);
      });
    }
  });
});

// Initialize Clerk with a placeholder sign-in button
const signInButton = document.createElement('button');
signInButton.innerHTML = "<span>Se connecter</span>";
signInButton.className = "cta";
signInButton.style.padding = "0.5rem 1.25rem";
signInButton.style.fontSize = "0.9rem";
signInButton.style.margin = "0";

const userButtonContainer = document.getElementById('user-button');
if (userButtonContainer) {
  userButtonContainer.appendChild(signInButton);
  
  signInButton.addEventListener('click', () => {
    alert("La fonctionnalité de connexion sera bientôt disponible!");
  });
  
  // Responsive behavior for sign-in button on mobile
  window.addEventListener('resize', () => {
    if (window.innerWidth < 768) {
      signInButton.style.padding = "0.4rem 1rem";
      signInButton.style.fontSize = "0.8rem";
    } else {
      signInButton.style.padding = "0.5rem 1.25rem";
      signInButton.style.fontSize = "0.9rem";
    }
  });
}
