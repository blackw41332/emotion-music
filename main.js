// 1) Replace with your deployed backend URL:
const API_URL = "https://yourapp.onrender.com/analyze";

// 2) Emotion → Spotify playlist mapping (free embeds; full songs require login/Premium)
const EMOTION_TO_SPOTIFY = {
  happy:   "https://open.spotify.com/embed/playlist/37i9dQZF1DXdPec7aLTmlC",
  sad:     "https://open.spotify.com/embed/playlist/37i9dQZF1DX7qK8ma5wgG1",
  angry:   "https://open.spotify.com/embed/playlist/37i9dQZF1DX76Wlfdnj7AP",
  disgust: "https://open.spotify.com/embed/playlist/37i9dQZF1DX6xOPeSOGone",
  fear:    "https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO",
  surprise:"https://open.spotify.com/embed/playlist/37i9dQZF1DX4fpCWaHOned",
  neutral: "https://open.spotify.com/embed/playlist/37i9dQZF1DX3rxVfibe1L0",
};

// 3) Elements
const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const ctx = overlay.getContext('2d');
const statusEl = document.getElementById('status');
const emotionEl = document.getElementById('emotion');
const player = document.getElementById('player');

// 4) Camera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
      overlay.width = video.videoWidth || 640;
      overlay.height = video.videoHeight || 480;
      statusEl.textContent = "Camera ready";
      setInterval(captureAndSend, 5000); // every 5s
    });
  })
  .catch(err => {
    statusEl.textContent = "Camera error: " + err.message;
  });

// 5) Capture and call backend
function captureAndSend() {
  // Draw current frame to an offscreen canvas
  const c = document.createElement('canvas');
  c.width = video.videoWidth || 640;
  c.height = video.videoHeight || 480;
  c.getContext('2d').drawImage(video, 0, 0, c.width, c.height);
  const dataUrl = c.toDataURL('image/jpeg');

  statusEl.textContent = "Reading emotion…";

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: dataUrl })
  })
  .then(r => r.json())
  .then(data => {
    if (data.error) throw new Error(data.error);

    const emotion = (data.emotion || 'neutral').toLowerCase();
    emotionEl.textContent = emotion;
    player.src = EMOTION_TO_SPOTIFY[emotion] || EMOTION_TO_SPOTIFY.neutral;

    // Simple pulse border to signal update
    pulseOverlay();

    statusEl.textContent = "Emotion detected";
  })
  .catch(err => {
    statusEl.textContent = "Error: " + err.message;
  });
}

// 6) A small visual pulse on update
function pulseOverlay() {
  ctx.clearRect(0, 0, overlay.width, overlay.height);
  ctx.lineWidth = 6; ctx.strokeStyle = "rgba(29,185,84,0.8)";
  ctx.strokeRect(6, 6, overlay.width - 12, overlay.height - 12);
  setTimeout(() => ctx.clearRect(0, 0, overlay.width, overlay.height), 250);
}
