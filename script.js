// Global variables
let uploadedImages = [];
let detectionResults = [];
let processingQueue = [];
let isProcessing = false;

// DOM elements
const uploadArea = document.getElementById("uploadArea");
const imageInput = document.getElementById("imageInput");
const resultsSection = document.getElementById("resultsSection");
const loadingSection = document.getElementById("loadingSection");
const errorSection = document.getElementById("errorSection");
const imagesGallery = document.getElementById("imagesGallery");
const batchCount = document.getElementById("batchCount");
const batchTime = document.getElementById("batchTime");
const loadingText = document.getElementById("loadingText");

// Initialize event listeners
document.addEventListener("DOMContentLoaded", function () {
  initializeEventListeners();
});

function initializeEventListeners() {
  // File input change
  imageInput.addEventListener("change", handleFileSelect);

  // Drag and drop events
  uploadArea.addEventListener("dragover", handleDragOver);
  uploadArea.addEventListener("dragleave", handleDragLeave);
  uploadArea.addEventListener("drop", handleDrop);
  uploadArea.addEventListener("click", (e) => {
    // Only trigger if clicking on the upload area itself, not on the button
    if (e.target === uploadArea || e.target.closest(".upload-content")) {
      console.log("Upload area clicked");
      if (imageInput) imageInput.click();
    }
  });
}

// Drag and drop handlers
function handleDragOver(e) {
  e.preventDefault();
  uploadArea.classList.add("dragover");
}

function handleDragLeave(e) {
  e.preventDefault();
  uploadArea.classList.remove("dragover");
}

function handleDrop(e) {
  e.preventDefault();
  uploadArea.classList.remove("dragover");

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    pendingFiles = Array.from(files);
    setTimeout(() => {
      if (pendingFiles) {
        handleFiles(pendingFiles);
        pendingFiles = null;
      }
    }, 0);
  }
  pendingFiles = null;
  // Reset the file input to allow selecting the same file again
  // imageInput.value = "";
}

// File selection handler
function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  if (files.length > 0) {
    handleFiles(files);
  }
  // Reset the input value to allow selecting the same file again
  e.target.value = "";
}

// Clear previous state when new files are selected
function clearPreviousState() {
  // Reset global variables
  uploadedImages = [];
  detectionResults = [];
  let pendingFiles = [];
  processingQueue = [];
  isProcessing = false;

  // Clear gallery
  imagesGallery.innerHTML = "";

  // Reset batch info
  if (batchCount) batchCount.textContent = "0 images processed";
  if (batchTime) batchTime.textContent = "Total time: 0ms";
}

// Main file handling function for multiple files
function handleFiles(files) {
  // Validate files
  const validFiles = [];
  const errors = [];

  files.forEach((file, index) => {
    if (!file.type.startsWith("image/")) {
      errors.push(`File ${index + 1}: Please select a valid image file.`);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      errors.push(`File ${index + 1}: Image size must be less than 10MB.`);
      return;
    }

    validFiles.push(file);
  });

  if (errors.length > 0) {
    showError(errors.join(" "));
    return;
  }

  if (validFiles.length === 0) {
    showError("No valid image files selected.");
    return;
  }

  // Clear previous state
  clearPreviousState();

  // Process all valid files
  processMultipleImages(validFiles);
}

// Process multiple images
async function processMultipleImages(files) {
  const startTime = Date.now();

  // Show loading section
  showSection("loading");
  updateLoadingText(`Processing ${files.length} images...`);

  // Create image cards for each file
  files.forEach((file, index) => {
    createImageCard(file, index);
  });

  // Show results section immediately to display image cards
  showSection("results");

  // Process images sequentially to avoid overwhelming the server
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const cardId = `image-card-${i}`;

    try {
      await processSingleImage(file, cardId);
    } catch (error) {
      console.error(`Error processing image ${i + 1}:`, error);
      updateImageCardError(cardId, error.message);
    }
  }

  // Update batch info
  const totalTime = Date.now() - startTime;
  updateBatchInfo(files.length, totalTime);
}

// Create image card for display
function createImageCard(file, index) {
  const cardId = `image-card-${index}`;
  const card = document.createElement("div");
  card.className = "image-result-card";
  card.id = cardId;

  card.innerHTML = `
    <div class="processing-status">
      <i class="fas fa-cog fa-spin"></i>
      <span>Processing...</span>
    </div>
    <div class="image-container">
      <div class="image-wrapper">
        <img class="result-image" alt="${file.name}" />
        <canvas class="detection-canvas"></canvas>
      </div>
    </div>
    <div class="image-info">
      <div class="confidence-meter">
        <label>Confidence Score:</label>
        <div class="meter">
          <div class="meter-fill"></div>
          <span class="meter-text">0%</span>
        </div>
      </div>
      <div class="detection-details">
        <div class="detail-item">
          <i class="fas fa-check-circle"></i>
          <span>Object Detected: <strong>Processing...</strong></span>
        </div>
        <div class="detail-item">
          <i class="fas fa-ruler"></i>
          <span>Bounding Box: <span>Processing...</span></span>
        </div>
        <div class="detail-item">
          <i class="fas fa-clock"></i>
          <span>Processing Time: <span>Processing...</span></span>
        </div>
      </div>
    </div>
  `;

  imagesGallery.appendChild(card);

  // Load and display the image
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = card.querySelector(".result-image");
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Process single image with AI model
async function processSingleImage(file, cardId) {
  const startTime = Date.now();

  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append("image", file);

    // Send to backend API
    const response = await fetch("/api/detect", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const results = await response.json();
    const processingTime = Date.now() - startTime;

    // Update the specific image card with results
    updateImageCard(cardId, results, processingTime);

    // Store results
    detectionResults.push({
      file: file,
      results: results,
      processingTime: processingTime,
    });
  } catch (error) {
    console.error("Detection error:", error);
    updateImageCardError(cardId, "Detection failed. Please try again.");
  }
}

// Update image card with detection results
function updateImageCard(cardId, results, processingTime) {
  const card = document.getElementById(cardId);
  if (!card) return;

  // Remove processing status
  const processingStatus = card.querySelector(".processing-status");
  if (processingStatus) {
    processingStatus.remove();
  }

  // Update confidence meter
  const confidence = results.confidence || 0;
  const meterFill = card.querySelector(".meter-fill");
  const meterText = card.querySelector(".meter-text");

  if (meterFill) meterFill.style.width = `${confidence * 100}%`;
  if (meterText) meterText.textContent = `${Math.round(confidence * 100)}%`;

  // Update detection details
  const objectType = card.querySelector(".detail-item strong");
  const bboxCoords = card.querySelector(".detail-item span span");
  const processingTimeEl = card.querySelectorAll(".detail-item span span")[2];

  if (objectType)
    objectType.textContent = results.class_name || "No tower detected";
  if (bboxCoords) {
    bboxCoords.textContent = results.bbox
      ? `x:${Math.round(results.bbox[0])}, y:${Math.round(
          results.bbox[1]
        )}, w:${Math.round(results.bbox[2])}, h:${Math.round(results.bbox[3])}`
      : "Not available";
  }
  if (processingTimeEl) processingTimeEl.textContent = `${processingTime}ms`;

  // Draw bounding box if detection exists
  if (results.bbox && confidence > 0) {
    const canvas = card.querySelector(".detection-canvas");
    const img = card.querySelector(".result-image");
    if (canvas && img) {
      drawBoundingBoxOnCanvas(
        canvas,
        img,
        results.bbox,
        confidence,
        results.class_name
      );
    }
  }

  // Add animation
  card.classList.add("fade-in");
}

// Update image card with error
function updateImageCardError(cardId, errorMessage) {
  const card = document.getElementById(cardId);
  if (!card) return;

  // Remove processing status
  const processingStatus = card.querySelector(".processing-status");
  if (processingStatus) {
    processingStatus.innerHTML = `
      <i class="fas fa-exclamation-triangle"></i>
      <span>${errorMessage}</span>
    `;
    processingStatus.style.background = "rgba(244, 67, 54, 0.1)";
    processingStatus.style.borderLeftColor = "#f44336";
  }

  // Update detection details to show error
  const objectType = card.querySelector(".detail-item strong");
  const bboxCoords = card.querySelector(".detail-item span span");
  const processingTimeEl = card.querySelectorAll(".detail-item span span")[2];

  if (objectType) objectType.textContent = "Error";
  if (bboxCoords) bboxCoords.textContent = "Not available";
  if (processingTimeEl) processingTimeEl.textContent = "Failed";
}

// Update loading text
function updateLoadingText(text) {
  if (loadingText) {
    loadingText.textContent = text;
  }
}

// Update batch info
function updateBatchInfo(count, totalTime) {
  if (batchCount) {
    batchCount.textContent = `${count} image${
      count !== 1 ? "s" : ""
    } processed`;
  }
  if (batchTime) {
    batchTime.textContent = `Total time: ${totalTime}ms`;
  }
}

// Draw bounding box on canvas for individual image cards
function drawBoundingBoxOnCanvas(
  canvas,
  img,
  bbox,
  confidence,
  class_name = "Object"
) {
  const ctx = canvas.getContext("2d");

  // Set canvas size to match image
  canvas.width = img.offsetWidth;
  canvas.height = img.offsetHeight;

  // Calculate bounding box coordinates
  const [x, y, w, h] = bbox;
  const scaleX = canvas.width / img.naturalWidth;
  const scaleY = canvas.height / img.naturalHeight;

  const scaledX = x * scaleX;
  const scaledY = y * scaleY;
  const scaledW = w * scaleX;
  const scaledH = h * scaleY;

  // Draw bounding box
  ctx.strokeStyle =
    confidence > 0.5 ? "#4CAF50" : confidence > 0.3 ? "#FF9800" : "#F44336";
  ctx.lineWidth = 2;
  ctx.strokeRect(scaledX, scaledY, scaledW, scaledH);

  // Draw label background
  const labelText = `${class_name} ${Math.round(confidence * 100)}%`;
  const textMetrics = ctx.measureText(labelText);
  const labelWidth = textMetrics.width + 16;
  const labelHeight = 20;

  ctx.fillStyle = ctx.strokeStyle;
  ctx.fillRect(scaledX, scaledY - labelHeight, labelWidth, labelHeight);

  // Draw label text
  ctx.fillStyle = "white";
  ctx.font = "12px Arial";
  ctx.fillText(labelText, scaledX + 8, scaledY - 6);
}

// Note: drawBoundingBox function replaced with drawBoundingBoxOnCanvas for multiple images

// Show specific section
function showSection(sectionName) {
  // Hide all sections
  const uploadSection = document.querySelector(".upload-section");
  const uploadBtn = document.getElementById(".upload-btn");
  resultsSection.style.display = "none";
  loadingSection.style.display = "none";
  errorSection.style.display = "none";

  // Show selected section
  switch (sectionName) {
    case "upload":
      if (uploadSection) uploadSection.style.display = "block";
      break;
    case "results":
      resultsSection.style.display = "block";
      break;
    case "loading":
      loadingSection.style.display = "block";
      break;
    case "error":
      errorSection.style.display = "block";
      break;
  }
}

// Show error message
function showError(message) {
  document.getElementById("errorMessage").textContent = message;
  showSection("error");
}

// Show error message but keep image displayed
function showErrorWithImage(message) {
  // Show error in a less intrusive way - maybe as a notification
  console.warn("Detection error:", message);
  // Still show the results section to display the uploaded image
  showSection("results");
}

// Reset upload
function resetUpload() {
  imageInput.value = "";
  clearPreviousState();
  showSection("upload");
}

// Note: Image load handling is now done individually for each image card

// Add some demo functionality for testing without backend
function simulateDetection() {
  // This is for demo purposes - replace with actual API call
  const mockResults = {
    confidence: 0.85,
    class_name: "Tower",
    bbox: [100, 50, 200, 300], // [x, y, width, height]
  };

  setTimeout(() => {
    displayDetectionResults(mockResults, 1200);
  }, 2000);
}

// Uncomment the line below to enable demo mode (for testing without backend)
// window.simulateDetection = simulateDetection;
