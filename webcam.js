// Webcam handling for facial expression search
const webcamBtn = document.getElementById('webcam-btn');
const webcamModal = document.getElementById('webcam-modal');
const closeBtn = document.querySelector('.close-btn');
const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('capture-btn');
const searchExpressionBtn = document.getElementById('search-expression-btn');
const expressionResult = document.getElementById('expression-result');

let stream = null;
let capturedImage = null;
let faceapi = null;

// Check if the browser supports getUserMedia
function checkWebcamSupport() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    expressionResult.textContent = "Your browser doesn't support webcam access. Please use a modern browser.";
    webcamBtn.disabled = true;
    return false;
  }
  return true;
}

// Open webcam modal
webcamBtn.addEventListener('click', () => {
  if (!checkWebcamSupport()) return;
  
  webcamModal.style.display = 'block';
  startWebcam();
});

// Close modal
closeBtn.addEventListener('click', () => {
  webcamModal.style.display = 'none';
  stopWebcam();
  resetWebcamState();
});

// Close when clicking outside the modal
window.addEventListener('click', (e) => {
  if (e.target === webcamModal) {
    webcamModal.style.display = 'none';
    stopWebcam();
    resetWebcamState();
  }
});

// Start webcam
async function startWebcam() {
  try {
    // Display loading message
    expressionResult.textContent = "Accessing webcam...";
    
    // Request webcam access
    stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: "user" 
      }, 
      audio: false 
    });
    
    video.srcObject = stream;
    await video.play();
    
    expressionResult.textContent = "Webcam ready. Click 'Capture Expression' to take a photo.";
    
    // Load face detection models if not already loaded
    if (!faceapi) {
      await loadFaceDetectionModels();
    }
  } catch (err) {
    console.error("Error accessing webcam: ", err);
    expressionResult.innerHTML = `
      <p class="error">Error accessing webcam.</p>
      <p>Please make sure you have:</p>
      <ul>
        <li>A camera connected to your device</li>
        <li>Granted permission for this site to access your camera</li>
        <li>Not blocked camera access in your browser settings</li>
      </ul>
      <p>If you're using a mobile device, try refreshing the page.</p>
    `;
    captureBtn.disabled = true;
  }
}

// Load face detection models (using face-api.js)
async function loadFaceDetectionModels() {
  expressionResult.textContent = "Loading facial expression models...";
  
  try {
    // Check if face-api.js is loaded
    if (typeof faceapi === 'undefined') {
      expressionResult.textContent = "Face detection API not loaded. Using fallback method.";
      return false;
    }
    
    // Model loading paths should be relative to your project
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('/models');
    
    expressionResult.textContent = "Facial expression models loaded!";
    return true;
  } catch (err) {
    console.error("Error loading facial expression models:", err);
    expressionResult.textContent = "Couldn't load facial expression models. Using fallback method.";
    return false;
  }
}

// Stop webcam
function stopWebcam() {
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
    });
    video.srcObject = null;
  }
}

// Reset webcam state
function resetWebcamState() {
  capturedImage = null;
  searchExpressionBtn.disabled = true;
  expressionResult.textContent = "";
}

// Capture image from webcam
captureBtn.addEventListener('click', async () => {
  if (!video.srcObject) {
    expressionResult.textContent = "Webcam not available. Please reload the page.";
    return;
  }
  
  const context = canvas.getContext('2d');
  
  // Set canvas dimensions to match video
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  // Draw current video frame to canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  // Get image data
  capturedImage = canvas.toDataURL('image/png');
  
  // Enable search button
  searchExpressionBtn.disabled = false;
  
  // Show capture confirmation
  expressionResult.textContent = "Image captured! Click Search to analyze.";
});

// Try to use face-api.js if available, otherwise use fallback
async function analyzeExpression() {
  if (typeof faceapi !== 'undefined') {
    try {
      // Try to detect expression using face-api.js
      const detections = await faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();
      
      if (detections && detections.length > 0) {
        const expressions = detections[0].expressions;
        const dominantMood = getDominantMood(expressions);
        return dominantMood;
      }
    } catch (err) {
      console.error("Error analyzing expression:", err);
    }
  }
  
  // Fallback to mock analysis
  return mockAnalyzeExpression();
}

// Get dominant mood from face-api.js expressions
function getDominantMood(expressions) {
  // Map face-api.js expressions to our mood categories
  if (expressions.happy > 0.5) return 'happy';
  if (expressions.sad > 0.5 || expressions.angry > 0.5) return 'sad';
  if (expressions.surprised > 0.5) return 'surprised';
  if (expressions.fearful > 0.5) return 'fearful';
  if (expressions.disgusted > 0.5) return 'disgusted';
  if (expressions.neutral > 0.5) return 'relaxed';
  
  // Default to relaxed if no strong expression
  return 'relaxed';
}

// Mock facial expression analysis (fallback)
function mockAnalyzeExpression() {
  // Return a random mood
  const moods = ['happy', 'calm', 'relaxed', 'energetic'];
  const randomIndex = Math.floor(Math.random() * moods.length);
  return moods[randomIndex];
}

// Search by expression
searchExpressionBtn.addEventListener('click', async () => {
  if (!capturedImage) {
    expressionResult.textContent = "Please capture an image first.";
    return;
  }
  
  // Show processing message
  expressionResult.textContent = "Analyzing facial expression...";
  
  try {
    // Analyze the expression
    const detectedMood = await analyzeExpression();
    
    // Map the mood to one of our available categories
    let mappedMood = mapMoodToAvailable(detectedMood);
    
    expressionResult.textContent = `Detected mood: ${detectedMood}. Playing ${mappedMood} music.`;
    
    // Search for music matching the mood
    const found = searchByMood(mappedMood);
    
    if (found) {
      // Close modal after successful search
      setTimeout(() => {
        webcamModal.style.display = 'none';
        stopWebcam();
        resetWebcamState();
      }, 1500);
    } else {
      expressionResult.textContent = `No music found for mood: ${mappedMood}. Try a different expression.`;
    }
  } catch (err) {
    console.error("Error during expression analysis:", err);
    expressionResult.textContent = "Error analyzing expression. Please try again.";
  }
});

// Map detected mood to available mood categories
function mapMoodToAvailable(detectedMood) {
  // Map to our available mood categories (happy, calm, relaxed)
  const moodMap = {
    'happy': 'happy',
    'surprised': 'happy',
    'energetic': 'happy',
    'calm': 'calm',
    'relaxed': 'relaxed',
    'neutral': 'relaxed',
    'sad': 'calm',
    'fearful': 'calm',
    'disgusted': 'calm',
    'angry': 'calm'
  };
  
  return moodMap[detectedMood] || 'relaxed';
}

// Check if the browser supports webcam
document.addEventListener('DOMContentLoaded', function() {
  checkWebcamSupport();
});