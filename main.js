(function () {
  'use strict';

  const CONFIG = {
    API_BASE_URL: 'https://z96esr7lvj.execute-api.us-east-1.amazonaws.com/prod/api',
    SESSION_KEY: 'ja_resume_visit_recorded_v1',
    ANIMATION_DURATION: 1500,
    MAX_RETRIES: 2,
    RETRY_DELAY: 1000
  };

  const els = {
    display: document.getElementById('visitorDisplay'),
    navCount: document.getElementById('navCount'),
    navBadge: document.getElementById('navCounter'),
    toggleBtn: document.getElementById('toggleDetails'),
    listContainer: document.getElementById('visitorList'),
    tableBody: document.getElementById('visitorTableBody'),
    totalLogs: document.getElementById('totalLogs')
  };

  function formatNumber(num) {
    return num.toLocaleString('en-US');
  }

  function showToast(message, type = 'error') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-2xl transition-all duration-500 transform translate-y-10 opacity-0 z-50 flex items-center space-x-3 ${type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'
      }`;
    toast.innerHTML = `<span>${type === 'error' ? '⚠️' : '✅'}</span><span class="font-medium">${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-y-10', 'opacity-0'), 100);
    setTimeout(() => {
      toast.classList.add('translate-y-10', 'opacity-0');
      setTimeout(() => toast.remove(), 500);
    }, 5000);
  }

  function animateCount(target, element) {
    const start = performance.now();
    const from = 0;
    function frame(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / CONFIG.ANIMATION_DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(from + (target - from) * eased);
      element.textContent = formatNumber(current);
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function renderCounter(count) {
    if (!els.display) return;
    els.display.innerHTML = `<div class="visitor-count" id="counterNumber">0</div>`;
    const counterEl = document.getElementById('counterNumber');
    if (counterEl) animateCount(count, counterEl);
  }

  function updateNavBadge(count) {
    if (els.navCount) els.navCount.textContent = formatNumber(count) + ' visitors';
  }

  async function fetchVisitorDetails() {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/visits/details`);
      if (!response.ok) throw new Error('Failed to fetch details');
      const data = await response.json();
      renderVisitorList(data.recent_visits, data.total_visits);
    } catch (error) {
      console.error('Error fetching details:', error);
      showToast('Could not load visitor details', 'error');
    }
  }

  function renderVisitorList(visits, total) {
    if (!els.tableBody) return;
    els.tableBody.innerHTML = '';
    if (els.totalLogs) els.totalLogs.textContent = `${formatNumber(total)} logs`;

    visits.forEach(visit => {
      const row = document.createElement('tr');
      const date = new Date(visit.timestamp).toLocaleString([], {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      row.innerHTML = `
        <td class="whitespace-nowrap">${date}</td>
        <td><span class="ip-badge">${visit.ip || 'Unknown'}</span></td>
        <td class="max-w-[100px] truncate" title="${visit.page}">${visit.page}</td>
        <td class="max-w-[100px] truncate" title="${visit.referrer}">${visit.referrer}</td>
      `;
      els.tableBody.appendChild(row);
    });
  }

  async function recordVisit() {
    const response = await fetch(`${CONFIG.API_BASE_URL}/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: window.location.pathname,
        referrer: document.referrer || 'direct'
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.count;
  }

  async function fetchVisitCount() {
    const response = await fetch(`${CONFIG.API_BASE_URL}/visits`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.count;
  }

  async function init() {
    const hasRecordedThisSession = sessionStorage.getItem(CONFIG.SESSION_KEY);
    let count;

    try {
      if (!hasRecordedThisSession) {
        count = await recordVisit();
        sessionStorage.setItem(CONFIG.SESSION_KEY, 'true');
      } else {
        count = await fetchVisitCount();
      }
      renderCounter(count);
      updateNavBadge(count);
    } catch (apiError) {
      console.error('Connection error:', apiError);
      showToast('Network issue: Unable to connect to visitor database', 'error');
    }

    if (els.toggleBtn) {
      els.toggleBtn.addEventListener('click', () => {
        const isHidden = els.listContainer.classList.toggle('hidden');
        els.toggleBtn.querySelector('span').textContent = isHidden ? 'Show Recent Visitors' : 'Hide Recent Visitors';
        els.toggleBtn.querySelector('svg').style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
        if (!isHidden) fetchVisitorDetails();
      });
    }
  }

  init();
})();