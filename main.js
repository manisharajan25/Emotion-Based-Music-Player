let now_playing = document.querySelector(".now-playing");
let track_art = document.querySelector(".track-art");
let track_name = document.querySelector(".track-name");
let track_artist = document.querySelector(".track-artist");

let playpause_btn = document.querySelector(".playpause-track");
let next_btn = document.querySelector(".next-track");
let prev_btn = document.querySelector(".prev-track");

let seek_slider = document.querySelector(".seek_slider");
let volume_slider = document.querySelector(".volume_slider");
let curr_time = document.querySelector(".current-time");
let total_duration = document.querySelector(".total-duration");

// Search elements
let search_input = document.getElementById("search-input");
let search_btn = document.getElementById("search-btn");

let track_index = 0;
let isPlaying = false;
let updateTimer;

// Create new audio element
let curr_track = document.createElement('audio');

// Base list of tracks with local paths
let base_tracks = [
  {
    name: "Night Owl",
    artist: "Broke For Free",
    image: "assets/images/night_owl.jpg",
    path: "assets/music/night_owl.mp3",
    mood: "calm"
  },
  {
    name: "Enthusiast",
    artist: "Tours",
    image: "assets/images/enthusiast.jpg",
    path: "assets/music/enthusiast.mp3",
    mood: "happy"
  },
  {
    name: "Shipping Lanes",
    artist: "Chad Crouch",
    image: "assets/images/shipping_lanes.jpg",
    path: "assets/music/shipping_lanes.mp3",
    mood: "relaxed"
  }
];

// Additional tracks with local paths
let additional_tracks = [
  {
    name: "Carefree",
    artist: "Kevin MacLeod",
    image: "assets/images/carefree.jpg",
    path: "assets/music/carefree.mp3",
    mood: "happy"
  },
  {
    name: "Dreams",
    artist: "Joakim Karud",
    image: "assets/images/dreams.jpg",
    path: "assets/music/dreams.mp3",
    mood: "relaxed"
  },
  {
    name: "Chill",
    artist: "Sakura Girl",
    image: "assets/images/chill.jpg",
    path: "assets/music/chill.mp3",
    mood: "calm"
  },
  {
    name: "Summer Splash",
    artist: "Audionautix",
    image: "assets/images/summer_splash.jpg",
    path: "assets/music/summer_splash.mp3",
    mood: "happy"
  },
  {
    name: "Acoustic Breeze",
    artist: "Benjamin Tissot",
    image: "assets/images/acoustic_breeze.jpg",
    path: "assets/music/acoustic_breeze.mp3",
    mood: "relaxed"
  },
  {
    name: "Buddy",
    artist: "Benjamin Tissot",
    image: "assets/images/buddy.jpg",
    path: "assets/music/buddy.mp3",
    mood: "happy"
  }
];

// Combine and shuffle tracks
let all_tracks = [...base_tracks, ...additional_tracks];
let track_list = [];

// Function to shuffle array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Initialize with random tracks
function initializeRandomTracks() {
  track_list = shuffleArray([...all_tracks]);
  
  // Start with a random track
  track_index = Math.floor(Math.random() * track_list.length);
  
  // Update mood map
  updateMoodMap();
  
  // Load the first track
  loadTrack(track_index);
}

// Map for easy searching by mood
let mood_map = {};

// Update mood map based on current track list
function updateMoodMap() {
  mood_map = {};
  
  track_list.forEach((track, index) => {
    if (!mood_map[track.mood]) {
      mood_map[track.mood] = [];
    }
    mood_map[track.mood].push(index);
  });
}

function random_bg_color() {
  // Get a number between 64 to 256 (for getting lighter colors)
  let red = Math.floor(Math.random() * 192) + 64;
  let green = Math.floor(Math.random() * 192) + 64;
  let blue = Math.floor(Math.random() * 192) + 64;

  // Construct a color with the given values
  let bgColor = "rgb(" + red + "," + green + "," + blue + ")";

  // Set the background to that color
  document.body.style.background = bgColor;
}

function loadTrack(track_index) {
  clearInterval(updateTimer);
  resetValues();
  
  try {
    curr_track.src = track_list[track_index].path;
    curr_track.load();

    track_art.style.backgroundImage = "url(" + track_list[track_index].image + ")";
    track_name.textContent = track_list[track_index].name;
    track_artist.textContent = track_list[track_index].artist;
    now_playing.textContent = "PLAYING " + (track_index + 1) + " OF " + track_list.length;

    updateTimer = setInterval(seekUpdate, 1000);
    curr_track.addEventListener("ended", nextTrack);
    random_bg_color();
  } catch (error) {
    console.error("Error loading track:", error);
    displayError("Couldn't load this track. Skipping to the next one.");
    nextTrack(); // Skip to next track if there's an error
  }
}

// Display error message to user
function displayError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  
  document.querySelector('.player').prepend(errorDiv);
  
  // Remove error message after 5 seconds
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

function resetValues() {
  curr_time.textContent = "00:00";
  total_duration.textContent = "00:00";
  seek_slider.value = 0;
}

// Initialize with random tracks
initializeRandomTracks();

function playpauseTrack() {
  if (!isPlaying) playTrack();
  else pauseTrack();
}

function playTrack() {
  curr_track.play().catch(error => {
    console.error("Error playing track:", error);
    displayError("Couldn't play this track. Check your internet connection or try another track.");
    nextTrack(); // Try next track if there's an error
  });
  isPlaying = true;
  playpause_btn.innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';
}

function pauseTrack() {
  curr_track.pause();
  isPlaying = false;
  playpause_btn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';
}

function nextTrack() {
  if (track_index < track_list.length - 1)
    track_index += 1;
  else track_index = 0;
  loadTrack(track_index);
  playTrack();
}

function prevTrack() {
  if (track_index > 0)
    track_index -= 1;
  else track_index = track_list.length - 1;
  loadTrack(track_index);
  playTrack();
}

function seekTo() {
  let seekto = curr_track.duration * (seek_slider.value / 100);
  curr_track.currentTime = seekto;
}

function setVolume() {
  curr_track.volume = volume_slider.value / 100;
}

function seekUpdate() {
  let seekPosition = 0;

  if (!isNaN(curr_track.duration)) {
    seekPosition = curr_track.currentTime * (100 / curr_track.duration);

    seek_slider.value = seekPosition;

    let currentMinutes = Math.floor(curr_track.currentTime / 60);
    let currentSeconds = Math.floor(curr_track.currentTime - currentMinutes * 60);
    let durationMinutes = Math.floor(curr_track.duration / 60);
    let durationSeconds = Math.floor(curr_track.duration - durationMinutes * 60);

    if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
    if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
    if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; }
    if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes; }

    curr_time.textContent = currentMinutes + ":" + currentSeconds;
    total_duration.textContent = durationMinutes + ":" + durationSeconds;
  }
}

// Handle errors
curr_track.addEventListener('error', function(e) {
  console.error("Error with current track:", e);
  displayError("Error playing this track. Skipping to next track.");
  nextTrack();
});

// Search functionality
function searchTracks(query) {
  query = query.toLowerCase().trim();
  
  if (!query) {
    displayError("Please enter a search term.");
    return false;
  }
  
  // Check if query is a mood
  if (mood_map[query] && mood_map[query].length > 0) {
    // Pick a random track with that mood
    const moodTracks = mood_map[query];
    const randomIndex = Math.floor(Math.random() * moodTracks.length);
    track_index = moodTracks[randomIndex];
    loadTrack(track_index);
    playTrack();
    return true;
  }
  
  // Search by track name or artist
  for (let i = 0; i < track_list.length; i++) {
    if (track_list[i].name.toLowerCase().includes(query) || 
        track_list[i].artist.toLowerCase().includes(query)) {
      track_index = i;
      loadTrack(track_index);
      playTrack();
      return true;
    }
  }
  
  // No match found
  displayError("No matching tracks found for: " + query);
  return false;
}

// Set up search event listeners
search_btn.addEventListener("click", function() {
  searchTracks(search_input.value);
});

search_input.addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    searchTracks(search_input.value);
  }
});

// Function to search by mood (called from webcam.js)
function searchByMood(mood) {
  return searchTracks(mood);
}

// Button to reshuffle tracks
function reshuffleTracks() {
  initializeRandomTracks();
}

// Check if the browser supports audio
window.addEventListener('load', function() {
  if (typeof Audio === 'undefined') {
    displayError("Your browser doesn't support audio playback. Please use a modern browser.");
    document.querySelector('.buttons').style.display = 'none';
  }
});