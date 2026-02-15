document.addEventListener('DOMContentLoaded', () => {
  // Sample content data
  const contents = [
    {
      id: 1,
      title: "Introduction à VentiStudio",
      creator: "Team VentiStudio",
      duration: "5:30",
      type: "video",
      url: "https://example.com/video1.mp4"
    },
    {
      id: 2,
      title: "Tutoriel Animation 3D",
      creator: "Studio Design",
      duration: "12:45",
      type: "video",
      url: "https://example.com/video2.mp4"
    },
    {
      id: 3,
      title: "Ambient Music Mix",
      creator: "Music Lab",
      duration: "1:30:00",
      type: "music",
      url: "https://example.com/music1.mp3"
    },
    {
      id: 4,
      title: "Electronic Beats",
      creator: "Sound Wave",
      duration: "45:20",
      type: "music",
      url: "https://example.com/music2.mp3"
    }
  ];

  // DOM elements
  const contentList = document.getElementById('content-list');
  const pipToggle = document.getElementById('pip-toggle');
  const fullscreenBtn = document.getElementById('fullscreen');
  const filterButtons = document.querySelectorAll('.filter-btn');
  let currentVideo = null;

  // Create content items
  function createContentItem(content) {
    return `
      <div class="content-item" data-id="${content.id}" data-type="${content.type}">
        <div class="content-thumbnail">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            ${content.type === 'video' 
              ? '<path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>'
              : '<circle cx="12" cy="12" r="10"/><path d="M10 8l6 4-6 4V8z"/>'}
          </svg>
        </div>
        <div class="content-info">
          <h3>${content.title}</h3>
          <p>${content.creator} • ${content.duration}</p>
        </div>
      </div>
    `;
  }

  // Populate content list
  contents.forEach(content => {
    contentList.innerHTML += createContentItem(content);
  });

  // Filter functionality
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.type;
      
      // Update active button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Filter content items
      document.querySelectorAll('.content-item').forEach(item => {
        if (filter === 'all' || item.dataset.type === filter) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Handle content selection
  document.querySelectorAll('.content-item').forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all items
      document.querySelectorAll('.content-item').forEach(i => i.classList.remove('active'));
      
      // Add active class to clicked item
      item.classList.add('active');

      // Enable controls
      pipToggle.disabled = false;
      fullscreenBtn.disabled = false;

      // Get content data
      const contentId = parseInt(item.dataset.id);
      const content = contents.find(c => c.id === contentId);

      // Update player (simplified for demo)
      const playerContainer = document.getElementById('player-container');
      playerContainer.innerHTML = `
        <video id="active-video" controls style="width: 100%; height: 100%;">
          <source src="${content.url}" type="video/${content.type === 'video' ? 'mp4' : 'mp3'}">
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>
      `;

      currentVideo = document.getElementById('active-video');
    });
  });

  // Picture-in-Picture functionality
  pipToggle.addEventListener('click', async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        pipToggle.textContent = 'Activer PIP';
      } else if (currentVideo) {
        await currentVideo.requestPictureInPicture();
        pipToggle.textContent = 'Désactiver PIP';
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Picture-in-Picture n\'est pas supporté ou n\'est pas autorisé.');
    }
  });

  // Fullscreen functionality
  fullscreenBtn.addEventListener('click', () => {
    if (currentVideo) {
      if (!document.fullscreenElement) {
        currentVideo.requestFullscreen().catch(err => {
          alert(`Erreur lors du passage en plein écran : ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  });

  // Handle PIP change events
  document.addEventListener('enterpictureinpicture', () => {
    pipToggle.textContent = 'Désactiver PIP';
  });

  document.addEventListener('leavepictureinpicture', () => {
    pipToggle.textContent = 'Activer PIP';
  });
});