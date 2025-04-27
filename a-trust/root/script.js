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
  cta.addEventListener('click', () => {
    cta.style.transform = 'scale(0.95)';
    setTimeout(() => {
      cta.style.transform = 'scale(1)';
    }, 100);
  });

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

  // Show donation popup
  showDonationPopup();
  
  // Afficher la popup des cookies au chargement de la page
  showCookiePopup();
  checkLanguageRestriction();
  checkGeoRestriction(); // Garder comme fallback

  // Initialiser l'authentification
  initAuth();
});

// Initialize Clerk with a placeholder sign-in button
const signInButton = document.createElement('button');
signInButton.textContent = "Se connecter";
signInButton.className = "cta";
signInButton.style.padding = "0.5rem 1rem";
signInButton.style.fontSize = "0.9rem";
signInButton.style.margin = "0";

document.getElementById('user-button').appendChild(signInButton);

signInButton.addEventListener('click', () => {
  alert("Attention fonctionnalité Beta risque de bug !");
});

// Fonction pour afficher le popup de don
function showDonationPopup() {
    const popup = document.getElementById('donationPopup');
    const hasSeenPopup = localStorage.getItem('hasSeenDonationPopup');
    
    if (!hasSeenPopup) {
        setTimeout(() => {
            popup.style.display = 'block';
        }, 2000);
    }
}

// Fonction pour fermer le popup de don
function closeDonationPopup() {
    const popup = document.getElementById('donationPopup');
    popup.style.display = 'none';
    localStorage.setItem('hasSeenDonationPopup', 'true');
}

// Initialiser le popup au chargement de la page
document.addEventListener('DOMContentLoaded', showDonationPopup);

// Fonction pour gérer les boutons de donation
document.querySelectorAll('.donation-button').forEach(button => {
  button.addEventListener('click', (e) => {
      const href = button.getAttribute('onclick').match(/'([^']+)'/)[1];
      if (confirm('Vous allez être redirigé vers une page externe. Continuer ?')) {
          window.location.href = href;
      }
      e.preventDefault();
  });
});

// Gestion des cookies
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = name + '=' + value + ';expires=' + expires.toUTCString() + ';path=/';
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function showCookiePopup() {
    if (!getCookie('cookieConsent')) {
        document.getElementById('cookiePopup').style.display = 'block';
    }
}

function acceptCookies() {
    setCookie('cookieConsent', 'accepted', 365);
    document.getElementById('cookiePopup').style.display = 'none';
}

function rejectCookies() {
    setCookie('cookieConsent', 'rejected', 365);
    document.getElementById('cookiePopup').style.display = 'none';
}

// Afficher la popup des cookies au chargement de la page
document.addEventListener('DOMContentLoaded', showCookiePopup);

function checkGeoRestriction() {
    fetch('https://ip-api.co/json/')
        .then(response => response.json())
        .then(data => {
            const restrictedCountries = [
                'RU', // Russie
                'US', // USA
                'SY', // Syrie
                'UA', // Ukraine
                'YE', // Yémen
                'AF', // Afghanistan
                'SD', // Soudan
                'ET', // Éthiopie
                'CU', // Cuba
                'VE', // Venezuela
                'BY', // Biélorussie
                'TM', // Turkménistan
                'IR', // Iran
                'SA', // Arabie Saoudite
                'AE', // Emirats Arabes Unis
                'RS'  // Serbie
            ];

            if (restrictedCountries.includes(data.country_code)) {
                window.location.href = '/restricted';
            }
        })
        .catch(error => {
            console.error('Erreur lors de la vérification de la géolocalisation:', error);
        });
}

function checkGeoRestrictionCloudflare() {
    // Utilise l'en-tête CF-IPCountry de Cloudflare
    const userCountry = request.headers.get('CF-IPCountry');
    const restrictedCountries = ['RU', 'US', 'SY', 'UA', 'YE', 'AF', 'SD', 'ET', 'CU', 'VE', 'BY', 'TM', 'IR', 'SA', 'AE', 'RS'];

    if (restrictedCountries.includes(userCountry)) {
        return Response.redirect('/restricted', 301);
    }
}

const geoip2 = require('geoip2-node');

async function checkGeoRestrictionMaxMind() {
    try {
        const reader = await geoip2.open('./GeoLite2-Country.mmdb');
        const response = await reader.country('8.8.8.8'); // IP de l'utilisateur
        
        const restrictedCountries = ['RU', 'US', 'SY', 'UA', 'YE', 'AF', 'SD', 'ET', 'CU', 'VE', 'BY', 'TM', 'IR', 'SA', 'AE', 'RS'];
        
        if (restrictedCountries.includes(response.country.isoCode)) {
            window.location.href = '/restricted';
        }
    } catch (error) {
        console.error('Erreur GeoIP:', error);
    }
}

function checkLanguageRestriction() {
    // Obtenir la langue du navigateur
    const userLanguage = navigator.language || navigator.userLanguage;
    // Obtenir les 2 premiers caractères (code pays)
    const languageCode = userLanguage.slice(0, 2).toLowerCase();

    // Map des langues correspondant aux pays restreints
    const restrictedLanguages = {
        'ru': 'Russie',
        'ar': 'Pays arabes',
        'uk': 'Ukraine',
        'fa': 'Iran',
        'ps': 'Afghanistan',
        'sd': 'Soudan',
        'am': 'Éthiopie',
        'es': 'Venezuela/Cuba',
        'be': 'Biélorussie',
        'tk': 'Turkménistan',
        'sr': 'Serbie'
    };

    if (restrictedLanguages[languageCode]) {
        // Stocker le pays détecté pour l'afficher sur la page restricted
        localStorage.setItem('detectedCountry', restrictedLanguages[languageCode]);
        window.location.href = '/restricted';
    }
}

// Configuration Discord OAuth2
const DISCORD_CLIENT_ID = '820743671439163432';
const DISCORD_REDIRECT_URI = 'https://ventistudio.fr/auth/discord-callback.php';

// Gestion de l'authentification
function initAuth() {
    const signInButton = document.getElementById('user-button').querySelector('button');
    const authModal = document.getElementById('authModal');
    const closeModal = authModal.querySelector('.close-modal');
    const discordButton = authModal.querySelector('.auth-method.discord');
    const loginForm = document.getElementById('loginForm');

    // Ouvrir la modal
    signInButton.addEventListener('click', () => {
        authModal.style.display = 'block';
    });

    // Fermer la modal
    closeModal.addEventListener('click', () => {
        authModal.style.display = 'none';
    });

    // Connexion avec Discord
    discordButton.addEventListener('click', () => {
        const params = new URLSearchParams({
            client_id: DISCORD_CLIENT_ID,
            redirect_uri: DISCORD_REDIRECT_URI,
            response_type: 'code',
            scope: 'identify email'
        });
        
        window.location.href = `https://discord.com/api/oauth2/authorize?${params}`;
    });

    // Connexion avec email/mot de passe
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('https://ventistudio.fr/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Stocker le token et rediriger
                localStorage.setItem('authToken', data.token);
                window.location.reload();
            } else {
                alert(data.message || 'Erreur de connexion');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Une erreur est survenue');
        }
    });
}
