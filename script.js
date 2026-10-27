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

    const normalizeSearch = (text) => text.toLowerCase()
        .replace(/[’']/g, '')
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .replace(/\bcoke\b/g, 'cola')
        .replace(/\bbbq\b/g, 'barbecue')
        .replace(/\bredbull\b/g, 'red bull')
        .replace(/\bmilk shake\b/g, 'milkshake')
        .replace(/\bthick shake\b/g, 'thickshake')
        .trim();

    const updateVisibleSections = (isFiltered) => {
        sections.forEach(section => {
            const hasVisibleItems = Array.from(section.querySelectorAll('.menu-item'))
                .some(item => !item.hidden);
            section.classList.toggle('active', hasVisibleItems);
            section.classList.toggle('is-filtered', isFiltered);
            section.querySelectorAll('.subsection, .drink-group').forEach(group => {
                group.hidden = !Array.from(group.querySelectorAll('.menu-item')).some(item => !item.hidden);
            });
            const flavours = section.querySelector('.flavor-chips-container');
            if (flavours) {
                flavours.hidden = !Array.from(section.querySelectorAll('.milkshake-card')).some(item => !item.hidden);
            }
        });
    };

    const applyFilter = (targetId, query = '') => {
        const normalizedQuery = normalizeSearch(query);
        const terms = normalizedQuery.split(/\s+/).filter(Boolean);
        let visibleCount = 0;

        menuItems.forEach(item => {
            const searchableText = normalizeSearch(`${item.querySelector('h3')?.textContent || ''} ${item.querySelector('.description')?.textContent || ''}`);
            const matchesSearch = terms.every(term => searchableText.includes(term));
            const matchesCategory = targetId === 'all'
                ? true
                : targetId === 'chef'
                    ? item.classList.contains('chef-choice')
                    : item.closest('.menu-section')?.id === targetId;
            const isVisible = matchesSearch && matchesCategory;

            item.hidden = !isVisible;
            if (isVisible) visibleCount += 1;
        });

        updateVisibleSections(terms.length > 0 || targetId === 'chef');

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

    const resetSearch = () => {
        if (searchInput) searchInput.value = '';
        if (clearSearchBtn) clearSearchBtn.hidden = true;
    };

    const scrollToMenu = (element) => {
        if (!element) return;
        const navHeight = document.getElementById('categoryNav')?.offsetHeight || 0;
        window.scrollTo({
            top: Math.max(0, element.getBoundingClientRect().top + window.scrollY - navHeight - 16),
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        });
    };

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');

            resetSearch();
            setActiveButton(targetId);
            applyFilter(targetId);
            button.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
            scrollToMenu(document.querySelector('.menu-section.active'));
        });
    });

    document.querySelectorAll('.meal-upgrade-link').forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            resetSearch();
            setActiveButton('deals');
            applyFilter('deals');
            const dealsButton = document.querySelector('.nav-btn[data-target="deals"]');
            dealsButton?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
            const mealDeals = document.getElementById('mealDeals');
            scrollToMenu(mealDeals);
            mealDeals?.focus({ preventScroll: true });
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

    // --- Image Carousel Label Switching ---
    document.querySelectorAll('.item-img-carousel').forEach(carousel => {
        const labels = carousel.querySelectorAll('.carousel-label');
        const imgs = carousel.querySelectorAll('.carousel-img');
        labels.forEach((label, i) => {
            label.addEventListener('click', () => {
                labels.forEach(l => l.classList.remove('active'));
                imgs.forEach(img => img.classList.remove('active'));
                labels.forEach(l => l.setAttribute('aria-pressed', 'false'));
                label.classList.add('active');
                label.setAttribute('aria-pressed', 'true');
                if (imgs[i]) imgs[i].classList.add('active');
            });
        });
    });

    console.log("Sweet & Salt Menu Engine Loaded (English Only, Clean & Emoji-Free)! 🍔");
});
