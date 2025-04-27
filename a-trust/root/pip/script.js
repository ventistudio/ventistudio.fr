document.addEventListener('DOMContentLoaded', () => {
    const videoPlayer = document.getElementById('videoPlayer');
    const pipButton = document.getElementById('pipButton');
    const prevButton = document.getElementById('prevVideo');
    const nextButton = document.getElementById('nextVideo');
    const localFilesInput = document.getElementById('localFiles');
    const videoUrlInput = document.getElementById('videoUrl');
    const addUrlButton = document.getElementById('addUrlVideo');
    const playlistContainer = document.getElementById('playlistContainer');
    
    let playlist = [];
    let currentVideoIndex = -1;

    // Fonction pour activer/désactiver le mode PIP
    async function togglePiP() {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else if (document.pictureInPictureEnabled && videoPlayer.readyState >= 2) {
                await videoPlayer.requestPictureInPicture();
            }
        } catch (error) {
            console.error('Erreur PiP:', error);
        }
    }

    // Gestionnaire de fichiers locaux
    localFilesInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (file.type.startsWith('video/')) {
                const videoUrl = URL.createObjectURL(file);
                addToPlaylist({
                    name: file.name,
                    url: videoUrl,
                    type: 'local'
                });
            }
        });
        updatePlaylistUI();
    });

    // Gestionnaire d'URL
    addUrlButton.addEventListener('click', () => {
        const url = videoUrlInput.value.trim();
        if (url) {
            addToPlaylist({
                name: url.split('/').pop(),
                url: url,
                type: 'url'
            });
            videoUrlInput.value = '';
            updatePlaylistUI();
        }
    });

    // Ajouter à la playlist
    function addToPlaylist(video) {
        playlist.push(video);
        if (playlist.length === 1) {
            loadVideo(0);
        }
        updateNavigationButtons();
    }

    // Mettre à jour l'interface de la playlist
    function updatePlaylistUI() {
        playlistContainer.innerHTML = '';
        playlist.forEach((video, index) => {
            const item = document.createElement('div');
            item.className = `playlist-item ${index === currentVideoIndex ? 'active' : ''}`;
            item.innerHTML = `
                <div class="drag-handle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4 8h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                    </svg>
                </div>
                <span class="video-title">${video.name}</span>
                <div class="playlist-item-controls">
                    <button class="move-up" ${index === 0 ? 'disabled' : ''}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 14l5-5 5 5z"/>
                        </svg>
                    </button>
                    <button class="move-down" ${index === playlist.length - 1 ? 'disabled' : ''}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 10l5 5 5-5z"/>
                        </svg>
                    </button>
                    <button class="remove-video">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>
            `;

            // Ajouter les gestionnaires d'événements pour les boutons
            const moveUp = item.querySelector('.move-up');
            const moveDown = item.querySelector('.move-down');
            
            moveUp.addEventListener('click', (e) => {
                e.stopPropagation();
                if (index > 0) {
                    [playlist[index], playlist[index - 1]] = [playlist[index - 1], playlist[index]];
                    if (currentVideoIndex === index) currentVideoIndex--;
                    else if (currentVideoIndex === index - 1) currentVideoIndex++;
                    updatePlaylistUI();
                    updateNavigationButtons();
                }
            });

            moveDown.addEventListener('click', (e) => {
                e.stopPropagation();
                if (index < playlist.length - 1) {
                    [playlist[index], playlist[index + 1]] = [playlist[index + 1], playlist[index]];
                    if (currentVideoIndex === index) currentVideoIndex++;
                    else if (currentVideoIndex === index + 1) currentVideoIndex--;
                    updatePlaylistUI();
                    updateNavigationButtons();
                }
            });

            item.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    loadVideo(index);
                }
            });

            playlistContainer.appendChild(item);
        });
    }

    // Charger une vidéo
    function loadVideo(index) {
        if (index >= 0 && index < playlist.length) {
            currentVideoIndex = index;
            videoPlayer.src = playlist[index].url;
            videoPlayer.play();
            updateNavigationButtons();
            updatePlaylistUI();
        }
    }

    // Mettre à jour les boutons de navigation
    function updateNavigationButtons() {
        prevButton.disabled = currentVideoIndex <= 0;
        nextButton.disabled = currentVideoIndex >= playlist.length - 1;
    }

    // Événements des boutons
    pipButton.addEventListener('click', togglePiP);
    prevButton.addEventListener('click', () => loadVideo(currentVideoIndex - 1));
    nextButton.addEventListener('click', () => loadVideo(currentVideoIndex + 1));

    // Événements de la vidéo
    videoPlayer.addEventListener('ended', () => {
        if (currentVideoIndex < playlist.length - 1) {
            loadVideo(currentVideoIndex + 1);
        }
    });

    // Suppression d'une vidéo
    playlistContainer.addEventListener('click', (e) => {
        const removeButton = e.target.closest('.remove-video');
        if (removeButton) {
            const index = parseInt(removeButton.dataset.index);
            playlist.splice(index, 1);
            if (currentVideoIndex === index) {
                if (playlist.length > 0) {
                    loadVideo(Math.min(index, playlist.length - 1));
                } else {
                    videoPlayer.src = '';
                    currentVideoIndex = -1;
                }
            } else if (currentVideoIndex > index) {
                currentVideoIndex--;
            }
            updatePlaylistUI();
            updateNavigationButtons();
        }
    });

    // Initialiser Sortable pour la playlist
    const sortable = new Sortable(playlistContainer, {
        animation: 150,
        ghostClass: 'playlist-item-ghost',
        handle: '.drag-handle',
        onEnd: (evt) => {
            const item = playlist[evt.oldIndex];
            playlist.splice(evt.oldIndex, 1);
            playlist.splice(evt.newIndex, 0, item);
            
            // Ajuster l'index actuel si nécessaire
            if (currentVideoIndex === evt.oldIndex) {
                currentVideoIndex = evt.newIndex;
            } else if (currentVideoIndex > evt.oldIndex && currentVideoIndex <= evt.newIndex) {
                currentVideoIndex--;
            } else if (currentVideoIndex < evt.oldIndex && currentVideoIndex >= evt.newIndex) {
                currentVideoIndex++;
            }
            
            updateNavigationButtons();
        }
    });

    const video = document.querySelector('#videoPlayer');
    const mkvHandler = new MKVHandler(video);
    
    // Initialize Plyr
    const player = new Plyr(video, {
        controls: [
            'play-large',
            'play',
            'progress',
            'current-time',
            'mute',
            'volume',
            'captions',
            'settings',
            'pip',
            'airplay',
            'fullscreen'
        ],
        settings: ['captions', 'quality', 'speed'],
        quality: {
            default: 576,
            options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240]
        }
    });

    // Initialize HLS for streaming if needed
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.on(Hls.Events.MEDIA_ATTACHED, function () {
            console.log('HLS attached to video element');
        });

        video.addEventListener('sourcechange', function() {
            const source = video.querySelector('source');
            if (source && source.src) {
                if (source.src.indexOf('.m3u8') !== -1) {
                    hls.loadSource(source.src);
                    hls.attachMedia(video);
                }
            }
        });
    }

    document.getElementById('localFiles').addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.name.toLowerCase().endsWith('.mkv')) {
                try {
                    await mkvHandler.handleMKVFile(file);
                } catch (error) {
                    console.error('Erreur lors de la lecture du fichier MKV:', error);
                    alert('Erreur lors de la lecture du fichier MKV. Le codec n\'est peut-être pas supporté.');
                }
            } else {
                // Gérer les autres formats vidéo normalement
                const url = URL.createObjectURL(file);
                video.src = url;
            }
        }
    });
});