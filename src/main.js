import { loadTemplate } from "./loadTemplate.js";
import { fillTemplate, fillGlobals } from "./templating.js";

// ============================================================================
// Constants
// ============================================================================

const BASE_URL = "https://auditcom.onrender.com";
const API_URL = `${BASE_URL}/api`;
const ESTIMATED_FILE_SIZE_MB = 250;
const PROGRESS_UPDATE_INTERVAL_MS = 50;
const SUCCESS_MESSAGE_DURATION_MS = 5000;
const PDF_FILENAME = "rapport-auditcom.pdf";

const API_ENDPOINTS = {
  pdfs: `${API_URL}/pdfs`,
  submit: `${API_URL}/submit`,
};

const SELECTORS = {
  teamList: "#teamList",
  downloadForm: "#downloadForm",
  messageContainer: "#messageContainer",
};

// ============================================================================
// DOM Elements
// ============================================================================

const container = document.querySelector(SELECTORS.teamList);
const form = document.querySelector(SELECTORS.downloadForm);
const messageContainer = document.querySelector(SELECTORS.messageContainer);

// ============================================================================
// Templates
// ============================================================================

const template = await loadTemplate("./templates/teamItem.html");
const messageTemplate = await loadTemplate("./templates/messageItem.html");

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Formats a date string to a localized date format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date or original string if invalid
 */
function formatDate(dateString) {
  if (!dateString) return "";
  
  const isoString = dateString.replace(" ", "T");
  const date = new Date(isoString);
  
  return Number.isNaN(date.getTime()) ? dateString : date.toLocaleDateString();
}

/**
 * Converts bytes to megabytes
 * @param {number} bytes - Size in bytes
 * @returns {number} Size in megabytes
 */
function bytesToMB(bytes) {
  return bytes / (1024 * 1024);
}

/**
 * Builds a full URL from a relative path
 * @param {string} relativePath - Relative path from API
 * @returns {string} Full URL or empty string if path is invalid
 */
function buildLogoUrl(relativePath) {
  return relativePath ? `${BASE_URL}${relativePath}` : "";
}

// ============================================================================
// Message Display Functions
// ============================================================================

/**
 * Displays a message with optional progress indicator
 * @param {string} message - Message text to display
 * @param {string} type - Message type: "success", "error", or "loading"
 * @param {number|null} progressPercent - Progress percentage (0-100) or null
 * @param {number} progressMax - Maximum value for progress element
 * @returns {HTMLProgressElement|null} Progress element or null
 */
function showMessage(message, type = "success", progressPercent = null, progressMax = 100) {
  messageContainer.innerHTML = "";
  
  const showProgress = type === "loading" && progressPercent !== null;
  const progressContainerStyle = showProgress ? "display: block" : "display: none";
  const progressValue = progressPercent !== null ? progressPercent : 0;
  const progressText = progressPercent !== null ? `${Math.round(progressPercent)}%` : "";
  
  const messageElement = fillTemplate(messageTemplate, {
    message,
    messageClass: type,
    progressPercent: progressText,
    progressContainerStyle,
    progressValue,
    progressMax,
  });
  
  messageContainer.appendChild(messageElement);
  
  // Auto-hide success messages
  if (type === "success") {
    setTimeout(() => {
      messageContainer.innerHTML = "";
    }, SUCCESS_MESSAGE_DURATION_MS);
  }
  
  return messageContainer.querySelector("progress");
}

// ============================================================================
// Progress Tracking Functions
// ============================================================================

/**
 * Creates a throttled progress update function
 * @param {HTMLProgressElement} progressElement - Progress element to update
 * @param {HTMLElement} progressText - Text element to update
 * @param {number|null} totalBytes - Total file size in bytes or null
 * @returns {Function} Throttled update function
 */
function createProgressUpdater(progressElement, progressText, totalBytes) {
  let lastUpdate = 0;
  
  return (loadedBytes, force = false) => {
    const now = Date.now();
    if (!force && now - lastUpdate < PROGRESS_UPDATE_INTERVAL_MS) return;
    lastUpdate = now;
    
    if (!progressElement || !progressText) return;
    
    // Update progress element value
    progressElement.value = loadedBytes;
    
    // Adjust max if Content-Length was incorrect
    if (loadedBytes > progressElement.max) {
      progressElement.max = loadedBytes;
    }
    
    // Update text display
    if (totalBytes && totalBytes > 0) {
      const percent = (loadedBytes / progressElement.max) * 100;
      progressText.textContent = `${Math.round(percent)}%`;
    } else {
      const mbDownloaded = bytesToMB(loadedBytes);
      progressText.textContent = `${mbDownloaded.toFixed(1)} MB`;
    }
  };
}

/**
 * Initializes the progress element with appropriate max value
 * @param {HTMLProgressElement} progressElement - Progress element to initialize
 * @param {number|null} contentLength - Content-Length header value or null
 * @returns {number} The max value set on the progress element
 */
function initializeProgress(progressElement, contentLength) {
  const estimatedTotal = ESTIMATED_FILE_SIZE_MB * 1024 * 1024;
  const maxValue = contentLength && contentLength > 0 ? contentLength : estimatedTotal;
  
  progressElement.max = maxValue;
  progressElement.value = 0;
  
  return maxValue;
}

/**
 * Downloads a file from a blob URL
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Filename for the download
 */
function downloadBlob(blob, filename) {
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(link);
  }, 100);
}

// ============================================================================
// Data Fetching Functions
// ============================================================================

/**
 * Fetches PDF list from API and renders items
 */
async function loadPDFList() {
  try {
    const response = await fetch(API_ENDPOINTS.pdfs);
    const payload = await response.json();
    
    // Set global metadata
    fillGlobals({
      count: payload.count,
    });
    
    // Render PDF items
    const items = Array.isArray(payload.pdfs) ? payload.pdfs : [];
    
    items.forEach((item) => {
      container.append(
        fillTemplate(template, {
          teamName: item.teamName ?? "—",
          title: item.title ?? "",
          author: item.author ?? "",
          uploadedAt: formatDate(item.uploadedAt),
          logoUrl: buildLogoUrl(item.logoUrl),
        })
      );
    });
  } catch (error) {
    console.error("Error loading PDF list:", error);
    showMessage("Erreur lors du chargement de la liste", "error");
  }
}

/**
 * Streams PDF download with progress tracking
 * @param {Response} response - Fetch response object
 * @returns {Promise<Blob>} Downloaded blob
 */
async function streamPDFDownload(response) {
  const contentLength = response.headers.get("Content-Length");
  const totalBytes = contentLength ? parseInt(contentLength, 10) : null;
  
  const reader = response.body.getReader();
  const chunks = [];
  let loadedBytes = 0;
  
  // Get progress elements
  const progressElement = messageContainer.querySelector("progress");
  const progressText = messageContainer.querySelector(".progress-text");
  
  // Initialize progress
  if (progressElement) {
    initializeProgress(progressElement, totalBytes);
  }
  
  // Create progress updater
  const updateProgress = createProgressUpdater(progressElement, progressText, totalBytes);
  
  // Stream download
  while (true) {
    const { done, value } = await reader.read();
    
    if (done) {
      // Final update
      updateProgress(loadedBytes, true);
      break;
    }
    
    chunks.push(value);
    loadedBytes += value.length;
    updateProgress(loadedBytes);
  }
  
  return new Blob(chunks);
}

/**
 * Handles form submission and PDF download
 * @param {FormData} formData - Form data from the form
 */
async function handleFormSubmit(formData) {
  const data = Object.fromEntries(formData);
  data.newsletterAgreement = data.newsletterAgreement ? "true" : "false";
  
  console.log("Submitting form data:", data);
  
  try {
    const response = await fetch(API_ENDPOINTS.submit, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      showMessage("le formulaire contient des champs invalides", "error");
      console.error("Error:", response.status, response.statusText);
      return;
    }
    
    // Stream download with progress
    const blob = await streamPDFDownload(response);
    
    // Trigger download
    downloadBlob(blob, PDF_FILENAME);
    
    // Show success message
    showMessage("PDF téléchargé avec succès !", "success");
  } catch (error) {
    showMessage("Le formulaire contient des champs invalides", "error");
    console.error("Error:", error);
  }
}

// ============================================================================
// Event Listeners
// ============================================================================

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  messageContainer.innerHTML = "";
  
  // Show initial loading state
  const estimatedTotal = ESTIMATED_FILE_SIZE_MB * 1024 * 1024;
  showMessage("Téléchargement du PDF en cours...", "loading", 0, estimatedTotal);
  
  // Handle form submission
  const formData = new FormData(form);
  await handleFormSubmit(formData);
});

// ============================================================================
// Initialization
// ============================================================================

loadPDFList();
