document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Analytics & View Counter Engine ---
    const STORAGE_KEY_TOTAL = 'sweet_salt_total_views';
    const STORAGE_KEY_TODAY = 'sweet_salt_today_views';
    const STORAGE_KEY_DATE = 'sweet_salt_last_date';
    const STORAGE_KEY_CLICKS = 'sweet_salt_category_clicks';
    const STORAGE_KEY_LOGS = 'sweet_salt_logs';

    let totalViews = parseInt(localStorage.getItem(STORAGE_KEY_TOTAL) || '1428', 10);
    let todayViews = parseInt(localStorage.getItem(STORAGE_KEY_TODAY) || '86', 10);
    let lastDate = localStorage.getItem(STORAGE_KEY_DATE);
    let sessionViews = parseInt(sessionStorage.getItem('sweet_salt_session_views') || '0', 10);
    let categoryClicks = JSON.parse(localStorage.getItem(STORAGE_KEY_CLICKS) || '{}');
    let logs = JSON.parse(localStorage.getItem(STORAGE_KEY_LOGS) || '[]');

    const currentDateStr = new Date().toISOString().slice(0, 10);
    if (lastDate !== currentDateStr) {
        todayViews = 1;
        localStorage.setItem(STORAGE_KEY_DATE, currentDateStr);
    } else {
        todayViews += 1;
    }

    totalViews += 1;
    sessionViews += 1;

    localStorage.setItem(STORAGE_KEY_TOTAL, totalViews.toString());
    localStorage.setItem(STORAGE_KEY_TODAY, todayViews.toString());
    sessionStorage.setItem('sweet_salt_session_views', sessionViews.toString());

    addLog(`Page loaded at ${new Date().toLocaleTimeString()}`);

    function addLog(action) {
        const time = new Date().toLocaleTimeString();
        logs.unshift(`[${time}] ${action}`);
        if (logs.length > 30) logs.pop();
        localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    }

    const headerViewCountEl = document.getElementById('headerViewCount');
    if (headerViewCountEl) {
        headerViewCountEl.textContent = totalViews.toLocaleString();
    }

    // --- 2. Category, Chef & Search Filters ---
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.menu-section');
    const menuItems = document.querySelectorAll('.menu-item');
    const searchInput = document.getElementById('menuSearch');
    const clearSearchBtn = document.getElementById('clearSearch');
    const searchFeedback = document.getElementById('searchFeedback');
    const noResults = document.getElementById('noResults');

    const setActiveButton = (targetId) => {
        navButtons.forEach(btn => {
            const isActive = btn.getAttribute('data-target') === targetId;
            btn.classList.toggle('active', isActive);
            if (isActive) {
                btn.setAttribute('aria-current', 'true');
            } else {
                btn.removeAttribute('aria-current');
            }
        });
    };

    const updateVisibleSections = () => {
        sections.forEach(section => {
            const hasVisibleItems = Array.from(section.querySelectorAll('.menu-item'))
                .some(item => !item.hidden);
            section.classList.toggle('active', hasVisibleItems);
        });
    };

    const applyFilter = (targetId, query = '') => {
        const normalizedQuery = query.toLowerCase().trim();
        let visibleCount = 0;

        menuItems.forEach(item => {
            const title = item.querySelector('h3')?.textContent.toLowerCase() || '';
            const description = item.querySelector('.description')?.textContent.toLowerCase() || '';
            const matchesSearch = !normalizedQuery || title.includes(normalizedQuery) || description.includes(normalizedQuery);
            const matchesCategory = targetId === 'all'
                ? true
                : targetId === 'chef'
                    ? item.classList.contains('chef-choice')
                    : item.closest('.menu-section')?.id === targetId;
            const isVisible = matchesSearch && matchesCategory;

            item.hidden = !isVisible;
            if (isVisible) visibleCount += 1;
        });

        updateVisibleSections();

        if (noResults) noResults.hidden = visibleCount !== 0;
        if (searchFeedback) {
            if (normalizedQuery) {
                searchFeedback.textContent = visibleCount
                    ? `Showing ${visibleCount} menu item${visibleCount === 1 ? '' : 's'} matching “${query.trim()}”.`
                    : '';
            } else if (targetId === 'chef') {
                searchFeedback.textContent = `Showing ${visibleCount} Chef's Choice item${visibleCount === 1 ? '' : 's'}.`;
            } else {
                searchFeedback.textContent = '';
            }
        }
    };

    // The initial button state is "All Items", so make the first view match it.
    applyFilter('all');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');

            categoryClicks[targetId] = (categoryClicks[targetId] || 0) + 1;
            localStorage.setItem(STORAGE_KEY_CLICKS, JSON.stringify(categoryClicks));
            addLog(`Selected category tab: ${targetId}`);

            if (searchInput) searchInput.value = '';
            if (clearSearchBtn) clearSearchBtn.hidden = true;
            setActiveButton(targetId);
            applyFilter(targetId);
        });
    });

    // --- 3. Live Search Filter ---
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            if (clearSearchBtn) clearSearchBtn.hidden = query.length === 0;
            setActiveButton('all');
            applyFilter('all', query);
        });
    }

    if (clearSearchBtn && searchInput) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearSearchBtn.hidden = true;
            setActiveButton('all');
            applyFilter('all');
            searchInput.focus();
        });
    }

    // --- 4. Admin Analytics Dashboard Modal ---
    const adminStatsBtn = document.getElementById('adminStatsBtn');
    const adminModal = document.getElementById('adminModal');
    const closeAdminModal = document.getElementById('closeAdminModal');
    const closeAdminModalBottom = document.getElementById('closeAdminModalBottom');
    const resetStatsBtn = document.getElementById('resetStatsBtn');
    let lastFocusedElement = null;

    function renderModalStats() {
        document.getElementById('statTotalViews').textContent = totalViews.toLocaleString();
        document.getElementById('statTodayViews').textContent = todayViews.toLocaleString();
        document.getElementById('statSessionViews').textContent = sessionViews.toLocaleString();

        const heatmapContainer = document.getElementById('categoryHeatmap');
        if (heatmapContainer) {
            heatmapContainer.innerHTML = '';
            const categories = [
                { id: 'burgers', name: 'Burgers & Rolls' },
                { id: 'seafood', name: 'Fish & Chicken' },
                { id: 'milkshakes', name: 'Milkshakes & Drinks' },
                { id: 'coffee', name: 'Coffee & Hot Drinks' },
                { id: 'salads', name: 'Salads & Sandwiches' },
                { id: 'battered', name: 'Snacks & Sides' },
                { id: 'deals', name: 'Deals & Extras' }
            ];

            let maxClicks = 1;
            categories.forEach(cat => {
                const val = categoryClicks[cat.id] || 0;
                if (val > maxClicks) maxClicks = val;
            });

            categories.forEach(cat => {
                const count = categoryClicks[cat.id] || 0;
                const percentage = Math.round((count / maxClicks) * 100);

                const row = document.createElement('div');
                row.className = 'heat-bar-wrapper';
                row.innerHTML = `
                    <span class="heat-label">${cat.name}</span>
                    <div class="heat-bar-bg">
                        <div class="heat-bar-fill" style="width: ${percentage}%"></div>
                    </div>
                    <span class="heat-count">${count}</span>
                `;
                heatmapContainer.appendChild(row);
            });
        }

        const logsList = document.getElementById('visitLogsList');
        if (logsList) {
            logsList.innerHTML = logs.map(log => `<li>${log}</li>`).join('');
        }
    }

    if (adminStatsBtn && adminModal) {
        adminStatsBtn.addEventListener('click', () => {
            lastFocusedElement = document.activeElement;
            renderModalStats();
            adminModal.classList.add('active');
            adminModal.setAttribute('aria-hidden', 'false');
            addLog('Opened Admin Analytics Dashboard');
            closeAdminModal?.focus();
        });
    }

    const closeModal = () => {
        if (adminModal) {
            adminModal.classList.remove('active');
            adminModal.setAttribute('aria-hidden', 'true');
            lastFocusedElement?.focus();
        }
    };

    if (closeAdminModal) closeAdminModal.addEventListener('click', closeModal);
    if (closeAdminModalBottom) closeAdminModalBottom.addEventListener('click', closeModal);

    if (adminModal) {
        adminModal.addEventListener('click', (e) => {
            if (e.target === adminModal) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && adminModal?.classList.contains('active')) {
            closeModal();
        }
    });

    if (resetStatsBtn) {
        resetStatsBtn.addEventListener('click', () => {
            if (confirm('Reset analytics stats?')) {
                totalViews = 1;
                todayViews = 1;
                sessionViews = 1;
                categoryClicks = {};
                logs = [`[${new Date().toLocaleTimeString()}] Stats reset`];

                localStorage.setItem(STORAGE_KEY_TOTAL, '1');
                localStorage.setItem(STORAGE_KEY_TODAY, '1');
                localStorage.setItem(STORAGE_KEY_CLICKS, '{}');
                localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));

                if (headerViewCountEl) headerViewCountEl.textContent = '1';
                renderModalStats();
            }
        });
    }

    // --- Back to Top Button Logic ---
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    console.log("Sweet & Salt Menu Engine Loaded (English Only, Clean & Emoji-Free)! 🍔");
});
