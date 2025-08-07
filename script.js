// DOM Elements
const audioPlayer = document.getElementById('audio-player');
const playButton = document.getElementById('play-button');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const shuffleButton = document.getElementById('shuffle-button');
const repeatButton = document.getElementById('repeat-button');
const volumeButton = document.getElementById('volume-button');
const progressBar = document.getElementById('progress-bar');
const volumeBar = document.getElementById('volume-bar');
const currentTimeElement = document.getElementById('current-time');
const durationElement = document.getElementById('duration');
const songNameElement = document.getElementById('song-name');
const artistNameElement = document.getElementById('artist-name');
const coverElement = document.getElementById('cover');
const likeButton = document.querySelector('.like-button i');
const playlistElement = document.getElementById('playlist');
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const content = document.querySelector('.content');

// Create song popup element
const songPopup = document.createElement('div');
songPopup.className = 'song-popup';
songPopup.innerHTML = `
    <div class="song-popup-cover">
        <img src="placeholder.svg" alt="Album Cover">
    </div>
    <div class="song-popup-info">
        <div class="song-popup-title">Song Title</div>
        <div class="song-popup-artist">Artist Name</div>
        <div class="song-popup-controls">
            <button class="popup-prev"><i class="fas fa-step-backward"></i></button>
            <button class="popup-play"><i class="fas fa-play"></i></button>
            <button class="popup-next"><i class="fas fa-step-forward"></i></button>
        </div>
    </div>
`;
document.body.appendChild(songPopup);

// Popup elements
const popupCover = songPopup.querySelector('.song-popup-cover img');
const popupTitle = songPopup.querySelector('.song-popup-title');
const popupArtist = songPopup.querySelector('.song-popup-artist');
const popupPlayBtn = songPopup.querySelector('.popup-play');
const popupPrevBtn = songPopup.querySelector('.popup-prev');
const popupNextBtn = songPopup.querySelector('.popup-next');

let popupTimeout;

// Show song popup
function showSongPopup(song) {
    popupTitle.textContent = song.title;
    popupArtist.textContent = song.artist;
    popupCover.src = song.cover;
    
    // Update play/pause button
    const playIcon = popupPlayBtn.querySelector('i');
    playIcon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
    
    // Show popup
    songPopup.classList.add('visible');
    
    // Hide popup after 3 seconds if not hovering
    clearTimeout(popupTimeout);
    popupTimeout = setTimeout(() => {
        if (!songPopup.matches(':hover')) {
            songPopup.classList.remove('visible');
        }
    }, 3000);
}

// Event listeners for popup
songPopup.addEventListener('mouseenter', () => {
    clearTimeout(popupTimeout);
});

songPopup.addEventListener('mouseleave', () => {
    popupTimeout = setTimeout(() => {
        songPopup.classList.remove('visible');
    }, 1000);
});

popupPlayBtn.addEventListener('click', togglePlay);
popupPrevBtn.addEventListener('click', prevSong);
popupNextBtn.addEventListener('click', nextSong);

// App State
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let isMuted = false;
let currentSongIndex = 0;
let volume = 0.7; // Default volume (0-1)

// Local songs array from music folder
let songs = [
    {
        title: 'Tum Hi Ho (Hindi Song Remix)',
        artist: 'Sudarshan Beatz',
        cover: 'placeholder.svg',
        file: 'music/2c25-tum-hi-ho-hindi-song-remix-house-mix-sudarshan-beatz-384024.mp3',
        duration: '3:45',
        liked: false
    },
    {
        title: 'Sahiba',
        artist: 'Jasleen Royal, Vijay Deverakonda',
        cover: 'placeholder.svg',
        file: 'music/Sahiba%20(Music%20Video)%20Jasleen%20Royal%20Vijay%20Deverakonda%20Radhika%20Madan%20Stebin%20PriyaAditya%20Sudhanshu.mp3',
        duration: '4:20',
        liked: true
    },
    {
        title: 'Saiyaara Title Song',
        artist: 'Tanishk Bagchi, Faheem A, Arslan N',
        cover: 'placeholder.svg',
        file: 'music/Saiyaara%20Title%20Song%20%20Ahaan%20Panday,%20Aneet%20Padda%20%20Tanishk%20Bagchi,%20Faheem%20A,%20Arslan%20N%20%20Irshad%20Kamil.mp3',
        duration: '3:15',
        liked: false
    },
    {
        title: 'Lofi Song Kuro',
        artist: 'Lofium',
        cover: 'placeholder.svg',
        file: 'music/lofi-song-kuro-by-lofium-286680.mp3',
        duration: '2:55',
        liked: false
    },
    {
        title: 'The Minstrels Lament',
        artist: 'Medieval Tavern',
        cover: 'placeholder.svg',
        file: 'music/the-minstrels-lament-medieval-tavern-song-377751.mp3',
        duration: '3:30',
        liked: false
    },
    {
        title: 'The Rat In The Stew',
        artist: 'Tavern Song',
        cover: 'placeholder.svg',
        file: 'music/the-rat-in-the-stew-a-tavern-song-378239.mp3',
        duration: '3:30',
        liked: false
    }
];

// Initialize app
function init() {
    // Make sure audioPlayer is available
    if (audioPlayer) {
        // Set initial volume
        audioPlayer.volume = volume;
        updateVolumeBar();
        
        // Load first song
        loadSong(currentSongIndex);
    }
    
    // Update greeting based on time of day
    updateGreeting();
    
    // Populate playlist
    populatePlaylist();
}

// Update greeting based on time of day
function updateGreeting() {
    const greeting = document.querySelector('.greeting');
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
        greeting.textContent = 'Good Morning';
    } else if (hour >= 12 && hour < 18) {
        greeting.textContent = 'Good Afternoon';
    } else {
        greeting.textContent = 'Good Evening';
    }
}

// Populate playlist with songs
function populatePlaylist() {
    playlistElement.innerHTML = '';
    
    songs.forEach((song, index) => {
        const card = document.createElement('div');
        card.className = 'playlist-card';
        if (index < 6) {
            card.classList.add('highlighted-song');
        }
        if (index === currentSongIndex) {
            card.classList.add('active');
        }
        
        const sourceIndicator = song.isUploaded ? 
            '<span class="badge bg-primary ms-2">Uploaded</span>' : '';
        
        card.innerHTML = `
            <div class="song-number">${index + 1}</div>
            <img src="${song.cover}" alt="${song.title}" class="song-cover">
            <div class="song-info">
                <div class="song-title">${song.title} ${sourceIndicator}</div>
                <button class="play-pause-song play-button-grid" data-index="${index}" aria-label="Play/Pause Song">
                    <i class="fas fa-play"></i>
                </button>
                <div class="song-duration">${song.duration}</div>
            </div>
            <div class="song-actions">
                <button class="like-song" data-index="${index}">
                    <i class="${song.liked ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
        `;
        
        playlistElement.appendChild(card);
    });
    
    // Add event listeners to playlist buttons
    document.querySelectorAll('.play-song').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(button.getAttribute('data-index'));
            currentSongIndex = index;
            loadSong(currentSongIndex);
            playSong();
        });
    });

    // Add event listeners to play-pause buttons in grid cards
    document.querySelectorAll('.play-pause-song').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(button.getAttribute('data-index'));
            if (currentSongIndex === index && isPlaying) {
                pauseSong();
            } else {
                currentSongIndex = index;
                loadSong(currentSongIndex);
                playSong();
                
                // Show popup for the current song
                showSongPopup(songs[currentSongIndex]);
                
                // Hide popup after 3 seconds
                setTimeout(() => {
                    if (songPopup.classList.contains('visible') && !songPopup.matches(':hover')) {
                        songPopup.classList.remove('visible');
                    }
                }, 3000);
            }
        });
    });
    
    document.querySelectorAll('.like-song').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(button.getAttribute('data-index'));
            toggleLike(index);
        });
    });
}

// Load song
function loadSong(index) {
    if (index >= 0 && index < songs.length) {
        const song = songs[index];
        
        songNameElement.textContent = song.title;
        artistNameElement.textContent = song.artist;
        coverElement.src = song.cover;
        
        // Update popup with current song info
        showSongPopup(song);
        
        // Update like button
        if (song.liked) {
            likeButton.className = 'fas fa-heart';
        } else {
            likeButton.className = 'far fa-heart';
        }
        
        // Set audio source to the file (local or uploaded)
        // Use the file path directly since we've already encoded local files with spaces
        audioPlayer.src = song.file;
        
        // Update playlist highlighting
        const playlistRows = playlistElement.querySelectorAll('tr');
        playlistRows.forEach((row, i) => {
            if (i === index) {
                row.classList.add('active');
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                row.classList.remove('active');
            }
        });
        
        // Reset progress bar
        progressBar.style.width = '0%';
        currentTimeElement.textContent = '0:00';
        durationElement.textContent = song.duration;
        
        // Load audio metadata to get actual duration
        audioPlayer.addEventListener('loadedmetadata', function() {
            const minutes = Math.floor(audioPlayer.duration / 60);
            const seconds = Math.floor(audioPlayer.duration % 60).toString().padStart(2, '0');
            durationElement.textContent = `${minutes}:${seconds}`;
        });
    }
}

// Play song
function playSong() {
    isPlaying = true;
    // Update main play button
    playButton.innerHTML = '<i class="fas fa-pause"></i>';
    // Update all grid play buttons for the current song
    document.querySelectorAll(`.play-button-grid[data-index="${currentSongIndex}"] i`).forEach(icon => {
        icon.className = 'fas fa-pause';
    });
    // Update popup play button
    const popupPlayIcon = popupPlayBtn?.querySelector('i');
    if (popupPlayIcon) {
        popupPlayIcon.className = 'fas fa-pause';
    }
    audioPlayer.play();
}

// Pause song
function pauseSong() {
    isPlaying = false;
    // Update main play button
    playButton.innerHTML = '<i class="fas fa-play"></i>';
    // Update all grid play buttons for the current song
    document.querySelectorAll(`.play-button-grid[data-index="${currentSongIndex}"] i`).forEach(icon => {
        icon.className = 'fas fa-play';
    });
    // Update popup play button
    const popupPlayIcon = popupPlayBtn?.querySelector('i');
    if (popupPlayIcon) {
        popupPlayIcon.className = 'fas fa-play';
    }
    audioPlayer.pause();
}

// Toggle play/pause
function togglePlay() {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
}

// Play previous song
function prevSong() {
    currentSongIndex--;
    if (currentSongIndex < 0) {
        currentSongIndex = songs.length - 1;
    }
    loadSong(currentSongIndex);
    if (isPlaying) {
        playSong();
    }
}

// Play next song
function nextSong() {
    if (isShuffle) {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * songs.length);
        } while (newIndex === currentSongIndex && songs.length > 1);
        currentSongIndex = newIndex;
    } else {
        currentSongIndex++;
        if (currentSongIndex >= songs.length) {
            currentSongIndex = 0;
        }
    }
    loadSong(currentSongIndex);
    if (isPlaying) {
        playSong();
    }
}

// Toggle shuffle
function toggleShuffle() {
    isShuffle = !isShuffle;
    shuffleButton.classList.toggle('active', isShuffle);
}

// Toggle repeat
function toggleRepeat() {
    isRepeat = !isRepeat;
    repeatButton.classList.toggle('active', isRepeat);
}

// Toggle mute
function toggleMute() {
    isMuted = !isMuted;
    audioPlayer.muted = isMuted;
    updateVolumeIcon();
}

// Update volume icon based on volume level
function updateVolumeIcon() {
    if (isMuted || volume === 0) {
        volumeButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else if (volume < 0.5) {
        volumeButton.innerHTML = '<i class="fas fa-volume-down"></i>';
    } else {
        volumeButton.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
}

// Update progress bar
function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    if (duration) {
        // Update progress bar width
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        
        // Set CSS variable for the progress knob position
        const progressContainer = document.querySelector('.progress-container .progress');
        progressContainer.style.setProperty('--progress-percent', progressPercent);
        
        // Update current time display
        const minutes = Math.floor(currentTime / 60);
        const seconds = Math.floor(currentTime % 60).toString().padStart(2, '0');
        currentTimeElement.textContent = `${minutes}:${seconds}`;
        
        // Update duration display if needed
        if (!durationElement.textContent || durationElement.textContent === '0:00') {
            const durationMinutes = Math.floor(duration / 60);
            const durationSeconds = Math.floor(duration % 60).toString().padStart(2, '0');
            durationElement.textContent = `${durationMinutes}:${durationSeconds}`;
        }
    }
}

// Set progress bar
function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    
    if (duration) {
        // Calculate the new time based on click position
        audioPlayer.currentTime = (clickX / width) * duration;
        
        // Update the progress bar immediately for better visual feedback
        const progressPercent = (audioPlayer.currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        
        // Set CSS variable for the progress knob position
        this.style.setProperty('--progress-percent', progressPercent);
        
        // Update time display
        const minutes = Math.floor(audioPlayer.currentTime / 60);
        const seconds = Math.floor(audioPlayer.currentTime % 60).toString().padStart(2, '0');
        currentTimeElement.textContent = `${minutes}:${seconds}`;
    }
}

// Update volume bar
function updateVolumeBar() {
    volumeBar.style.width = `${volume * 100}%`;
    updateVolumeIcon();
}

// Set volume
function setVolume(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    
    volume = clickX / width;
    audioPlayer.volume = volume;
    
    // If setting volume while muted, unmute
    if (isMuted) {
        isMuted = false;
        audioPlayer.muted = false;
    }
    
    updateVolumeBar();
}

// Handle song end
function handleSongEnd() {
    if (isRepeat) {
        // Replay the same song
        audioPlayer.currentTime = 0;
        playSong();
    } else if (isShuffle) {
        // Play a random song
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * songs.length);
        } while (newIndex === currentSongIndex && songs.length > 1);
        currentSongIndex = newIndex;
        loadSong(currentSongIndex);
        playSong();
    } else {
        // Play next song or stop at the end
        if (currentSongIndex < songs.length - 1) {
            nextSong();
        } else {
            // End of playlist
            loadSong(0);
            currentSongIndex = 0;
            playSong(); // Autoplay from beginning
        }
    }
}

// Toggle like for a song
function toggleLike(index = currentSongIndex) {
    songs[index].liked = !songs[index].liked;
    
    // Update like button in now playing bar if it's the current song
    if (index === currentSongIndex) {
        if (songs[index].liked) {
            likeButton.className = 'fas fa-heart';
        } else {
            likeButton.className = 'far fa-heart';
        }
    }
    
    // Update like button in playlist
    const likeButtons = document.querySelectorAll('.like-song');
    const button = likeButtons[index];
    if (button) {
        const icon = button.querySelector('i');
        if (songs[index].liked) {
            icon.className = 'fas fa-heart';
        } else {
            icon.className = 'far fa-heart';
        }
    }
}

// Toggle sidebar for mobile
function toggleSidebar() {
    const overlay = document.querySelector('.sidebar-overlay');
    const content = document.querySelector('.content');
    
    if (!sidebar.classList.contains('show')) {
        // Opening the sidebar
        document.body.classList.add('sidebar-open');
        sidebar.classList.add('show');
        overlay.classList.add('show');
        content.classList.add('shifted');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
    } else {
        // Closing the sidebar
        document.body.classList.remove('sidebar-open');
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
        content.classList.remove('shifted');
        
        // Re-enable body scroll
        document.body.style.overflow = '';
        document.body.style.height = '';
    }
}

// Initialize overlay
function initOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', toggleSidebar);
}

// Initialize sidebar functionality
function initSidebar() {
    initOverlay();
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 992 && 
            sidebar.classList.contains('show') && 
            !sidebar.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            toggleSidebar();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 992) {
            // Reset styles when resizing to desktop
            document.body.classList.remove('sidebar-open');
            sidebar.classList.remove('show');
            document.querySelector('.sidebar-overlay').classList.remove('show');
            document.querySelector('.content').classList.remove('shifted');
            document.body.style.overflow = '';
            document.body.style.height = '';
        }
    });
}

// Create file input for uploading songs
function createFileInput() {
    // Create a hidden file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'file-input';
    fileInput.accept = 'audio/*';
    fileInput.multiple = true;
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    // Create an "Add Songs" button in the playlist section header
    const playlistHeader = document.querySelector('.playlist-section .section-header');
    const addButton = document.createElement('button');
    addButton.className = 'btn btn-sm btn-outline-light me-2';
    addButton.innerHTML = '<i class="fas fa-plus"></i> Add Songs';
    addButton.onclick = () => fileInput.click();
    
    // Insert before the ellipsis button
    const ellipsisButton = playlistHeader.querySelector('.icon-button');
    playlistHeader.insertBefore(addButton, ellipsisButton);
    
    // Add event listener to handle file selection
    fileInput.addEventListener('change', handleFileSelect);
}

// Handle file selection
function handleFileSelect(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Process each selected file
    Array.from(files).forEach(file => {
        // Create object URL for the file
        const fileUrl = URL.createObjectURL(file);
        
        // Create a temporary audio element to get duration
        const tempAudio = new Audio(fileUrl);
        tempAudio.addEventListener('loadedmetadata', () => {
            // Format duration
            const duration = tempAudio.duration;
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60).toString().padStart(2, '0');
            const formattedDuration = `${minutes}:${seconds}`;
            
            // Extract title from filename (remove extension)
            let title = file.name.replace(/\.[^/.]+$/, '');
            
            // Add to songs array
            songs.push({
                title: title,
                artist: 'Unknown Artist',
                cover: 'placeholder.svg',
                file: fileUrl,
                duration: formattedDuration,
                liked: false,
                isUploaded: true // Flag to identify uploaded songs
            });
            
            // Repopulate playlist to show new song
            populatePlaylist();
            
            // If this is the first song added, load it
            if (songs.length === 1) {
                loadSong(0);
            }
        });
    });
    
    // Reset file input to allow selecting the same file again
    e.target.value = '';
}

// Event Listeners
playButton.addEventListener('click', togglePlay);
prevButton.addEventListener('click', prevSong);
nextButton.addEventListener('click', nextSong);
shuffleButton.addEventListener('click', toggleShuffle);
repeatButton.addEventListener('click', toggleRepeat);
volumeButton.addEventListener('click', toggleMute);

audioPlayer.addEventListener('timeupdate', updateProgress);
audioPlayer.addEventListener('ended', handleSongEnd);

const progressContainer = document.querySelector('.progress-container .progress');
progressContainer.addEventListener('click', setProgress);

const volumeContainer = document.querySelector('.volume-container .progress');
volumeContainer.addEventListener('click', setVolume);

likeButton.parentElement.addEventListener('click', () => toggleLike());

menuToggle.addEventListener('click', toggleSidebar);

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
    // Initialize app
    init();
    
    // Initialize sidebar functionality
    initSidebar();
    
    // Create file input for uploading songs
    createFileInput();
    
    // Add fade-in animation to content
    const content = document.querySelector('.content');
    content.style.opacity = '0';
    content.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        content.style.opacity = '1';
    }, 100);
    
    // Animate greeting cards
    const greetingCards = document.querySelectorAll('.greeting-card');
    greetingCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `all 0.3s ease ${index * 0.1}s`;
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 + (index * 100));
    });
    
    // Handle back button to close sidebar
    window.addEventListener('popstate', () => {
        if (window.innerWidth <= 992 && sidebar.classList.contains('show')) {
            toggleSidebar();
        }
    });
});