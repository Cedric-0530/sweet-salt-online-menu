document.addEventListener('DOMContentLoaded', () => {
    // --- Category, Chef & Search Filters ---
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

            if (searchInput) searchInput.value = '';
            if (clearSearchBtn) clearSearchBtn.hidden = true;
            setActiveButton(targetId);
            applyFilter(targetId);
        });
    });

    // --- Live Search Filter ---
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
