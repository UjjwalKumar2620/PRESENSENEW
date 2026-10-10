/**
 * PreSense — Frontend Application
 *
 * Fetches camera data from the API, renders a 3×3 grid with video feeds,
 * handles loading states, errors, and expanded modal view.
 */

(function () {
  'use strict';

  // ---- Configuration ----
  const API_BASE = window.location.origin;
  const ENDPOINTS = {
    cameras: `${API_BASE}/api/cameras`,
    stream: (id) => `${API_BASE}/api/cameras/${id}/stream`,
    health: `${API_BASE}/api/health`,
  };

  // ---- DOM References ----
  const dom = {
    grid: document.getElementById('camera-grid'),
    loadingOverlay: document.getElementById('loading-overlay'),
    errorBanner: document.getElementById('error-banner'),
    errorMessage: document.getElementById('error-message'),
    errorRetry: document.getElementById('error-retry'),
    statusPill: document.getElementById('status-pill'),
    statusText: null, // resolved below
    timestamp: document.getElementById('header-timestamp'),

    // Stats
    statTotal: document.getElementById('stat-total'),
    statAvailable: document.getElementById('stat-available'),
    statResolution: document.getElementById('stat-resolution'),
    statMode: document.getElementById('stat-mode'),

    // Modal
    modalOverlay: document.getElementById('modal-overlay'),
    modalVideo: document.getElementById('modal-video'),
    modalCameraName: document.getElementById('modal-camera-name'),
    modalCameraMeta: document.getElementById('modal-camera-meta'),
    modalClose: document.getElementById('modal-close'),
  };

  dom.statusText = dom.statusPill.querySelector('.status-text');

  // ---- State ----
  let cameras = [];
  let isLoading = true;

  // ---- Initialization ----
  function init() {
    updateTimestamp();
    setInterval(updateTimestamp, 1000);
    loadCameras();

    // Event listeners
    dom.errorRetry.addEventListener('click', loadCameras);
    dom.modalClose.addEventListener('click', closeModal);
    dom.modalOverlay.addEventListener('click', (e) => {
      if (e.target === dom.modalOverlay) closeModal();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  // ---- Timestamp ----
  function updateTimestamp() {
    const now = new Date();
    const opts = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    dom.timestamp.textContent = `${dateStr} • ${now.toLocaleTimeString('en-US', opts)}`;
  }

  // ---- Status ----
  function setStatus(state, text) {
    dom.statusPill.className = `status-pill ${state}`;
    dom.statusText.textContent = text;
  }

  // ---- Error Handling ----
  function showError(message) {
    dom.errorMessage.textContent = message;
    dom.errorBanner.hidden = false;
    setStatus('error', 'Disconnected');
  }

  function hideError() {
    dom.errorBanner.hidden = true;
  }

  // ---- Loading ----
  function showLoading() {
    isLoading = true;
    dom.loadingOverlay.classList.remove('hidden');
    // Show skeleton grid
    dom.grid.innerHTML = Array(9)
      .fill('<div class="camera-card-skeleton"></div>')
      .join('');
  }

  function hideLoading() {
    isLoading = false;
    dom.loadingOverlay.classList.add('hidden');
  }

  // ---- Fetch Cameras ----
  async function loadCameras() {
    showLoading();
    hideError();
    setStatus('', 'Connecting...');

    try {
      const response = await fetch(ENDPOINTS.cameras);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !Array.isArray(data.cameras)) {
        throw new Error('Invalid API response format.');
      }

      cameras = data.cameras;
      setStatus('connected', 'Connected');
      updateStats();
      renderGrid();
    } catch (err) {
      console.error('Failed to load cameras:', err);
      showError(
        err.message.includes('fetch')
          ? 'Cannot connect to the server. Is the backend running?'
          : err.message
      );
      dom.grid.innerHTML = '';
    } finally {
      hideLoading();
    }
  }

  // ---- Update Stats ----
  function updateStats() {
    const total = cameras.length;
    const available = cameras.filter((c) => c.videoAvailable).length;

    dom.statTotal.textContent = total;
    dom.statAvailable.textContent = available;
    dom.statMode.textContent = 'DEMO';

    // Find highest resolution
    const resolutions = cameras.map((c) => {
      const parts = c.resolution.split('×').map(Number);
      return Math.max(...parts);
    });
    const maxRes = Math.max(...resolutions);
    dom.statResolution.textContent = maxRes >= 3840 ? '4K UHD' : maxRes >= 1920 ? 'Full HD' : `${maxRes}p`;
  }

  // ---- Render Camera Grid ----
  function renderGrid() {
    dom.grid.innerHTML = '';

    cameras.forEach((camera, index) => {
      const card = createCameraCard(camera, index);
      dom.grid.appendChild(card);
    });
  }

  function createCameraCard(camera) {
    const card = document.createElement('div');
    card.className = 'camera-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Expand ${camera.name} — ${camera.location}`);
    card.id = `camera-card-${camera.id}`;

    const statusClass = camera.videoAvailable ? 'available' : 'unavailable';
    const statusLabel = camera.videoAvailable ? 'REC' : 'Offline';
    const sizeMB = camera.videoSizeBytes
      ? `${(camera.videoSizeBytes / (1024 * 1024)).toFixed(0)} MB`
      : '—';

    card.innerHTML = `
      ${
        camera.videoAvailable
          ? `<video class="camera-video" muted loop playsinline preload="metadata"
              src="${ENDPOINTS.stream(camera.id)}"
              id="video-${camera.id}"></video>`
          : `<div class="camera-video" style="display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:0.8rem;">
              No Feed Available
            </div>`
      }
      <div class="camera-overlay"></div>
      ${
        camera.videoAvailable
          ? `<div class="camera-rec">
              <span class="rec-dot"></span>
              ${camera.source === 'gridfs' ? 'ATLAS GRIDFS' : 'DEMO'}
            </div>`
          : ''
      }
      <div class="camera-expand-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 3 21 3 21 9"/>
          <polyline points="9 21 3 21 3 15"/>
          <line x1="21" y1="3" x2="14" y2="10"/>
          <line x1="3" y1="21" x2="10" y2="14"/>
        </svg>
      </div>
      <div class="camera-info">
        <div class="camera-id-row">
          <span class="camera-id">${camera.id}</span>
          <span class="camera-status-badge ${statusClass}">${statusLabel}</span>
        </div>
        <div class="camera-name">${camera.location}</div>
        <div class="camera-meta">
          <span>${camera.resolution}</span>
          <span>${camera.fps} fps</span>
          <span>${sizeMB}</span>
        </div>
      </div>
    `;

    // Play video on hover (only thumbnails, to save bandwidth)
    if (camera.videoAvailable) {
      const video = card.querySelector('video');

      // Attempt to play inline for a thumbnail-like experience
      card.addEventListener('mouseenter', () => {
        video.play().catch(() => {});
      });

      card.addEventListener('mouseleave', () => {
        video.pause();
      });

      // Click to expand
      card.addEventListener('click', () => openModal(camera));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal(camera);
        }
      });
    }

    return card;
  }

  // ---- Modal ----
  function openModal(camera) {
    dom.modalCameraName.textContent = `${camera.id} — ${camera.location}`;
    const sourceLabel = camera.source === 'gridfs' ? 'MongoDB Atlas GridFS' : 'Demo Recording';
    dom.modalCameraMeta.textContent = `${camera.resolution} • ${camera.fps} fps • ${sourceLabel}`;
    dom.modalVideo.src = ENDPOINTS.stream(camera.id);
    dom.modalVideo.load();
    dom.modalOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    dom.modalOverlay.hidden = true;
    dom.modalVideo.pause();
    dom.modalVideo.removeAttribute('src');
    dom.modalVideo.load();
    document.body.style.overflow = '';
  }

  // ---- Boot ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
