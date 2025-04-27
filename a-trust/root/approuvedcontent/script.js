// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    // Éléments DOM
    const searchInput = document.querySelector('.search-input');
    const filterButtons = document.querySelectorAll('.filter-button');
    const contentCards = document.querySelectorAll('.content-card');
    const themeToggle = document.querySelector('#theme-toggle');
    
    // État actuel du filtre
    let currentFilter = 'all';

    // Fonction de recherche et filtrage
    const filterContent = () => {
        const searchTerm = searchInput.value.toLowerCase();
        
        contentCards.forEach(card => {
            const title = card.querySelector('.content-title').textContent.toLowerCase();
            const description = card.querySelector('.content-description').textContent.toLowerCase();
            const type = card.dataset.type;
            
            const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
            const matchesFilter = currentFilter === 'all' || type === currentFilter;
            
            card.style.display = matchesSearch && matchesFilter ? 'block' : 'none';
        });

        // Animation pour les cartes visibles
        const visibleCards = document.querySelectorAll('.content-card[style="display: block"]');
        visibleCards.forEach((card, index) => {
            card.style.animation = `fadeIn 0.3s ease forwards ${index * 0.1}s`;
        });
    };

    // Écouteurs d'événements pour la recherche
    searchInput.addEventListener('input', filterContent);

    // Écouteurs d'événements pour les boutons de filtre
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Mise à jour du filtre actif
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            currentFilter = button.dataset.type;
            filterContent();
        });
    });

    // Animation au survol et redirection au clic pour les cartes
    contentCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
            card.style.transition = 'transform 0.3s ease';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });

        // Clic sur une carte - Redirection vers la page de détail
        card.addEventListener('click', () => {
            const contentId = card.dataset.id;
            // Redirection vers la page de détail avec l'ID
            window.location.href = `/approuvedcontent/content/?id=${contentId}`;
        });
    });

    // Gestion du thème sombre/clair
    let isDarkTheme = localStorage.getItem('theme') === 'dark';
    
    const toggleTheme = () => {
        isDarkTheme = !isDarkTheme;
        document.body.classList.toggle('light-theme', !isDarkTheme);
        localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
        
        // Animation de l'icône
        themeToggle.querySelector('svg').style.transform = 'rotate(180deg)';
        setTimeout(() => {
            themeToggle.querySelector('svg').style.transform = 'rotate(0)';
        }, 300);
    };

    // Initialiser le thème
    if (!isDarkTheme) {
        document.body.classList.add('light-theme');
    }

    themeToggle.addEventListener('click', toggleTheme);

    // Animations au défilement
    const observeElements = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        contentCards.forEach(card => {
            observer.observe(card);
            card.classList.add('fade-in');
        });
    };

    observeElements();

    // Gestion de la navigation mobile
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuButton.classList.toggle('active');
        });
    }

    // Fermer le menu mobile lors du clic en dehors
    document.addEventListener('click', (event) => {
        if (navLinks?.classList.contains('active') && 
            !event.target.closest('.nav-links') && 
            !event.target.closest('.mobile-menu-button')) {
            navLinks.classList.remove('active');
            mobileMenuButton?.classList.remove('active');
        }
    });
});

// Keyframes pour les animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .fade-in {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.5s ease, transform 0.5s ease;
    }

    .fade-in.visible {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);