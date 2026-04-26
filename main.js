// ============================================
// James Adewara Resume - Visitor Counter
// Fetches & Posts visitor data to FastAPI backend
// ============================================

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION — UPDATE THIS
  // ============================================
  const CONFIG = {
    // Your FastAPI backend URL
    // Local dev:  'http://localhost:8000/api'
    // Production: 'https://your-api.onrender.com/api'
    API_BASE_URL: 'http://localhost:8000/api',

    // Session key to prevent duplicate counting per session
    SESSION_KEY: 'ja_resume_visit_recorded_v1',

    // Animation duration for counter (ms)
    ANIMATION_DURATION: 1500,

    // Retry config
    MAX_RETRIES: 2,
    RETRY_DELAY: 1000
  };

  // ============================================
  // DOM REFERENCES
  // ============================================
  const els = {
    display: document.getElementById('visitorDisplay'),
    navCount: document.getElementById('navCount'),
    navBadge: document.getElementById('navCounter')
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  /**
   * Format number with commas (e.g. 1,234)
   */
  function formatNumber(num) {
    return num.toLocaleString('en-US');
  }

  /**
   * Animate a number from 0 to target with ease-out
   */
  function animateCount(target, element) {
    const start = performance.now();
    const from = 0;

    function frame(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / CONFIG.ANIMATION_DURATION, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(from + (target - from) * eased);
      element.textContent = formatNumber(current);

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    }

    requestAnimationFrame(frame);
  }

  /**
   * Show loading state
   */
  function showLoading() {
    if (!els.display) return;
    els.display.innerHTML = `
      <div class="visitor-loading">
        <div class="spinner"></div>
        <span>Connecting to database...</span>
      </div>
    `;
  }

  /**
   * Show error state
   */
  function showError(message) {
    if (!els.display) return;
    els.display.innerHTML = `
      <div class="visitor-error">
        ⚠️ ${message}
      </div>
    `;
  }

  /**
   * Render the counter display
   */
  function renderCounter(count) {
    if (!els.display) return;
    els.display.innerHTML = `<div class="visitor-count" id="counterNumber">0</div>`;
    const counterEl = document.getElementById('counterNumber');
    if (counterEl) {
      animateCount(count, counterEl);
    }
  }

  /**
   * Update nav badge
   */
  function updateNavBadge(count) {
    if (els.navCount) {
      els.navCount.textContent = formatNumber(count) + ' visitors';
    }
  }

  /**
   * Sleep utility for retries
   */
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================
  // API FUNCTIONS
  // ============================================

  /**
   * GET /api/visits — fetch current count
   */
  async function fetchVisitCount(retries = 0) {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/visits`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.count;

    } catch (error) {
      console.warn(`[VisitorCounter] fetchVisitCount failed (attempt ${retries + 1}):`, error.message);

      if (retries < CONFIG.MAX_RETRIES) {
        await sleep(CONFIG.RETRY_DELAY);
        return fetchVisitCount(retries + 1);
      }

      throw error;
    }
  }

  /**
   * POST /api/visit — record a new visit
   */
  async function recordVisit(retries = 0) {
    try {
      const payload = {
        page: window.location.pathname,
        referrer: document.referrer || 'direct'
      };

      const response = await fetch(`${CONFIG.API_BASE_URL}/visit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.count;

    } catch (error) {
      console.warn(`[VisitorCounter] recordVisit failed (attempt ${retries + 1}):`, error.message);

      if (retries < CONFIG.MAX_RETRIES) {
        await sleep(CONFIG.RETRY_DELAY);
        return recordVisit(retries + 1);
      }

      throw error;
    }
  }

  // ============================================
  // FALLBACK (localStorage)
  // ============================================

  function getFallbackCount() {
    const stored = localStorage.getItem('ja_resume_visitor_count');
    return stored ? parseInt(stored, 10) : 0;
  }

  function incrementFallback() {
    const current = getFallbackCount();
    const updated = current + 1;
    localStorage.setItem('ja_resume_visitor_count', updated.toString());
    return updated;
  }

  // ============================================
  // MAIN LOGIC
  // ============================================

  async function init() {
    showLoading();

    const hasRecordedThisSession = sessionStorage.getItem(CONFIG.SESSION_KEY);
    let count;
    let usedFallback = false;

    try {
      if (!hasRecordedThisSession) {
        // New session — record visit
        count = await recordVisit();
        sessionStorage.setItem(CONFIG.SESSION_KEY, 'true');
        console.log('[VisitorCounter] Visit recorded via API. Count:', count);
      } else {
        // Already recorded this session — just fetch
        count = await fetchVisitCount();
        console.log('[VisitorCounter] Count fetched via API:', count);
      }
    } catch (apiError) {
      // API failed — use localStorage fallback
      console.warn('[VisitorCounter] API unavailable, falling back to localStorage');
      usedFallback = true;

      if (!hasRecordedThisSession) {
        count = incrementFallback();
        sessionStorage.setItem(CONFIG.SESSION_KEY, 'true');
      } else {
        count = getFallbackCount();
      }
    }

    // Render
    renderCounter(count);
    updateNavBadge(count);

    // If fallback was used, show subtle indicator
    if (usedFallback && els.navBadge) {
      els.navBadge.style.opacity = '0.7';
      els.navBadge.title = 'Offline mode — using local count';
    }
  }

  // ============================================
  // BOOT
  // ============================================

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();