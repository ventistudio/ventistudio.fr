document.addEventListener('DOMContentLoaded', () => {
  // Sample content data
  const approvedContent = {
    music: [
      {
        title: "Symphonie Électronique",
        creator: "Studio Nexus",
        date: "2024-01-15",
        tags: ["Électronique", "Ambient"],
        type: "featured"
      },
      {
        title: "Jazz Fusion Collection",
        creator: "The Modern Quartet",
        date: "2024-01-10",
        tags: ["Jazz", "Fusion"],
        type: "popular"
      }
    ],
    videos: [
      {
        title: "Tutorial Animation 3D",
        creator: "VFX Masters",
        date: "2024-01-18",
        tags: ["3D", "Tutorial"],
        type: "recent"
      },
      {
        title: "Documentary: Digital Art",
        creator: "ArtSpace",
        date: "2024-01-12",
        tags: ["Art", "Documentary"],
        type: "featured"
      }
    ],
    articles: [
      {
        title: "L'avenir du Web3",
        creator: "Tech Insights",
        date: "2024-01-20",
        tags: ["Technology", "Web3"],
        type: "recent"
      },
      {
        title: "Guide Création Numérique",
        creator: "Digital Arts Magazine",
        date: "2024-01-08",
        tags: ["Tutorial", "Digital Art"],
        type: "popular"
      }
    ],
    apps: [
      {
        title: "Sound Designer Pro",
        creator: "Audio Tools Inc",
        date: "2024-01-17",
        tags: ["Audio", "Professional"],
        type: "featured"
      },
      {
        title: "Visual Code Editor",
        creator: "Dev Tools Co",
        date: "2024-01-14",
        tags: ["Development", "Code"],
        type: "popular"
      }
    ]
  };

  // Function to create content cards
  function createContentCard(item) {
    return `
      <div class="content-card" data-type="${item.type}">
        <div class="card-image">
          <svg width="48" height="48" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
            <path d="M12 6v6l4 2" stroke="currentColor" fill="none"/>
          </svg>
        </div>
        <div class="card-content">
          <h3 class="card-title">${item.title}</h3>
          <div class="card-meta">
            <p>${item.creator}</p>
            <p>${new Date(item.date).toLocaleDateString()}</p>
          </div>
          <div class="card-tags">
            ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // Populate content sections
  Object.entries(approvedContent).forEach(([category, items]) => {
    const container = document.getElementById(`${category}-content`);
    if (container) {
      items.forEach(item => {
        container.innerHTML += createContentCard(item);
      });
    }
  });

  // Filter functionality
  const filterButtons = document.querySelectorAll('.filter-btn');
  const contentCards = document.querySelectorAll('.content-card');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Filter content
      const filter = button.dataset.filter;
      contentCards.forEach(card => {
        if (filter === 'all' || card.dataset.type === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Pagination functionality
  let currentPage = 1;
  const itemsPerPage = 8;
  const totalPages = Math.ceil(contentCards.length / itemsPerPage);

  document.querySelector('.total-pages').textContent = totalPages;

  function updatePage(page) {
    contentCards.forEach((card, index) => {
      if (index >= (page - 1) * itemsPerPage && index < page * itemsPerPage) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
    document.querySelector('.current-page').textContent = page;
  }

  document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      updatePage(currentPage);
    }
  });

  document.getElementById('next-page').addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      updatePage(currentPage);
    }
  });

  // Initialize first page
  updatePage(1);
});