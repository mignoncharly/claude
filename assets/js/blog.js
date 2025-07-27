/* assets/js/blog.js */

// Global variables
let mobileMenuOpen = false;
let currentLang = 'fr';
let searchTimeout = null;
let activeFilter = 'all';
let currentPage = 1;
let articlesPerPage = 6;
let allArticles = [];
let filteredArticles = [];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeLanguageSwitcher();
    initializeBlogSearch();
    initializeBlogFilters();
    initializeArticles();
    initializePagination();
    initializeAnimations();
    initializeSidebar();
    
    console.log('Blog page initialized');
});

// Navigation functionality
function initializeNavigation() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            toggleMobileMenu();
        });
    }

    // Close mobile menu when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (mobileMenuOpen) {
                closeMobileMenu();
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (mobileMenuOpen && navMenu && !navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && mobileMenuOpen) {
            closeMobileMenu();
        }
    });
}

function toggleMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    const mobileBtn = document.getElementById('mobile-menu-btn');
    
    if (!navMenu || !mobileBtn) return;
    
    mobileMenuOpen = !mobileMenuOpen;
    navMenu.classList.toggle('active');
    mobileBtn.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
}

function closeMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    const mobileBtn = document.getElementById('mobile-menu-btn');
    
    if (!navMenu || !mobileBtn) return;
    
    navMenu.classList.remove('active');
    mobileBtn.classList.remove('active');
    mobileMenuOpen = false;
    document.body.style.overflow = '';
}

// Language switcher functionality
function initializeLanguageSwitcher() {
    const langBtns = document.querySelectorAll('.lang-btn');
    
    langBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const newLang = this.dataset.lang;
            
            if (newLang !== currentLang) {
                switchLanguage(newLang);
            }
        });
    });
}

function switchLanguage(lang) {
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-lang="${lang}"]`).classList.add('active');
    
    // Update current language
    currentLang = lang;
    
    // Update HTML lang attribute
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('data-lang', lang);
    
    console.log(`Language switched to: ${lang}`);
    
    // Track language change
    if (typeof gtag !== 'undefined') {
        gtag('event', 'language_change', {
            language: lang,
            page: 'blog'
        });
    }
}

// Blog search functionality
function initializeBlogSearch() {
    const searchInput = document.getElementById('blogSearch');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const searchTerm = this.value.trim();
        
        // Debounce search
        searchTimeout = setTimeout(() => {
            performSearch(searchTerm);
        }, 300);
    });
    
    // Clear search on escape
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            performSearch('');
            this.blur();
        }
    });
}

function performSearch(searchTerm) {
    if (searchTerm === '') {
        // Reset to show all articles with current filter
        filterArticles(activeFilter);
    } else {
        // Filter articles by search term
        filteredArticles = allArticles.filter(article => {
            const title = article.title.toLowerCase();
            const excerpt = article.excerpt.toLowerCase();
            const category = article.category.toLowerCase();
            const searchLower = searchTerm.toLowerCase();
            
            return title.includes(searchLower) || 
                   excerpt.includes(searchLower) || 
                   category.includes(searchLower);
        });
        
        currentPage = 1;
        displayArticles();
    }
    
    // Track search
    if (searchTerm && typeof gtag !== 'undefined') {
        gtag('event', 'blog_search', {
            search_term: searchTerm,
            results_count: filteredArticles.length
        });
    }
}

// Blog filters functionality
function initializeBlogFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            if (filter === activeFilter) return;
            
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update active filter
            activeFilter = filter;
            
            // Filter articles
            filterArticles(filter);
            
            // Clear search
            const searchInput = document.getElementById('blogSearch');
            if (searchInput) {
                searchInput.value = '';
            }
            
            // Track filter selection
            if (typeof gtag !== 'undefined') {
                gtag('event', 'blog_filter', {
                    filter: filter
                });
            }
        });
    });
}

function filterArticles(filter) {
    if (filter === 'all') {
        filteredArticles = [...allArticles];
    } else {
        filteredArticles = allArticles.filter(article => {
            return article.category.toLowerCase() === filter.toLowerCase();
        });
    }
    
    currentPage = 1;
    displayArticles();
    updatePagination();
}

// Articles management
function initializeArticles() {
    // Sample articles data - in a real application, this would come from an API or CMS
    allArticles = [
        {
            id: 1,
            title: "Nouvelles règles fiscales allemandes 2025",
            excerpt: "Découvrez les principales modifications du code fiscal allemand en 2025 et leur impact sur les entreprises françaises implantées en Allemagne.",
            category: "Fiscalité",
            date: "2025-01-15",
            author: "Expert Comptable",
            readTime: "5 min",
            views: 1250,
            image: null,
            featured: true
        },
        {
            id: 2,
            title: "GmbH vs UG : Quel statut choisir pour votre entreprise ?",
            excerpt: "Comparaison détaillée entre GmbH et UG pour les entrepreneurs français : capital, fiscalité, responsabilité et évolution possible.",
            category: "Création",
            date: "2025-01-10",
            author: "Expert Comptable",
            readTime: "7 min",
            views: 980,
            image: null,
            featured: false
        },
        {
            id: 3,
            title: "Clôture comptable 2024 : Check-list complète",
            excerpt: "Guide pratique pour réussir votre clôture comptable allemande : échéances, documents obligatoires et bonnes pratiques à suivre.",
            category: "Comptabilité",
            date: "2024-12-28",
            author: "Expert Comptable",
            readTime: "6 min",
            views: 756,
            image: null,
            featured: false
        },
        {
            id: 4,
            title: "TVA intracommunautaire : éviter les pièges",
            excerpt: "Les erreurs courantes dans la gestion de la TVA intracommunautaire et comment les éviter. Focus sur les relations France-Allemagne.",
            category: "Fiscalité",
            date: "2024-12-20",
            author: "Expert Comptable",
            readTime: "8 min",
            views: 1120,
            image: null,
            featured: false
        },
        {
            id: 5,
            title: "Digitalisation comptable en Allemagne",
            excerpt: "Comment la digitalisation transforme la comptabilité allemande. Outils, obligations légales et opportunités pour les entreprises.",
            category: "Comptabilité",
            date: "2024-12-15",
            author: "Expert Comptable",
            readTime: "6 min",
            views: 890,
            image: null,
            featured: false
        },
        {
            id: 6,
            title: "Optimisation fiscale légale : stratégies 2025",
            excerpt: "Découvrez les stratégies d'optimisation fiscale légales disponibles en Allemagne pour réduire votre charge fiscale en toute conformité.",
            category: "Fiscalité",
            date: "2024-12-10",
            author: "Expert Comptable",
            readTime: "9 min",
            views: 1340,
            image: null,
            featured: false
        },
        {
            id: 7,
            title: "Reporting IFRS vs HGB : principales différences",
            excerpt: "Analyse comparative des normes comptables IFRS et HGB pour les groupes internationaux opérant en Allemagne.",
            category: "Comptabilité",
            date: "2024-12-05",
            author: "Expert Comptable",
            readTime: "10 min",
            views: 567,
            image: null,
            featured: false
        },
        {
            id: 8,
            title: "Contrôle fiscal en Allemagne : se préparer efficacement",
            excerpt: "Guide complet pour préparer et gérer un contrôle fiscal allemand. Documents à préparer, droits et devoirs de l'entreprise.",
            category: "Fiscalité",
            date: "2024-11-30",
            author: "Expert Comptable",
            readTime: "12 min",
            views: 445,
            image: null,
            featured: false
        }
    ];
    
    // Initialize with all articles
    filteredArticles = [...allArticles];
    displayArticles();
    updatePagination();
}

function displayArticles() {
    const articlesContainer = document.querySelector('.articles-list');
    if (!articlesContainer) return;
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * articlesPerPage;
    const endIndex = startIndex + articlesPerPage;
    const articlesToShow = filteredArticles.slice(startIndex, endIndex);
    
    // Clear container
    articlesContainer.innerHTML = '';
    
    if (articlesToShow.length === 0) {
        showNoResults();
        return;
    }
    
    // Display articles
    articlesToShow.forEach((article, index) => {
        const articleElement = createArticleElement(article);
        articlesContainer.appendChild(articleElement);
        
        // Add animation delay
        setTimeout(() => {
            articleElement.classList.add('fade-in-up');
        }, index * 100);
    });
    
    // Display featured article if it's the first page and no search/filter
    if (currentPage === 1 && activeFilter === 'all' && !document.getElementById('blogSearch').value) {
        displayFeaturedArticle();
    }
    
    updatePagination();
}

function createArticleElement(article) {
    const articleEl = document.createElement('article');
    articleEl.className = 'article-card';
    articleEl.dataset.category = article.category.toLowerCase();
    
    const formattedDate = formatDate(article.date);
    const categoryIcon = getCategoryIcon(article.category);
    
    articleEl.innerHTML = `
        <div class="article-image">
            ${article.image ? 
                `<img src="${article.image}" alt="${article.title}">` : 
                `<div class="article-placeholder">${categoryIcon}</div>`
            }
        </div>
        <div class="article-content">
            <div class="article-meta">
                <span class="article-category">${article.category}</span>
                <span class="article-date">
                    📅 ${formattedDate}
                </span>
            </div>
            <h2 class="article-title">
                <a href="blog-post.html?id=${article.id}">${article.title}</a>
            </h2>
            <p class="article-excerpt">${article.excerpt}</p>
            <div class="article-footer">
                <a href="blog-post.html?id=${article.id}" class="read-more">
                    Lire la suite →
                </a>
                <div class="article-stats">
                    <span class="article-stat">
                        ⏱️ ${article.readTime}
                    </span>
                    <span class="article-stat">
                        👁️ ${article.views}
                    </span>
                </div>
            </div>
        </div>
    `;
    
    // Add click tracking
    const readMoreBtn = articleEl.querySelector('.read-more');
    readMoreBtn.addEventListener('click', function() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'blog_article_click', {
                article_id: article.id,
                article_title: article.title,
                category: article.category
            });
        }
    });
    
    return articleEl;
}

function displayFeaturedArticle() {
    const featuredArticle = allArticles.find(article => article.featured);
    if (!featuredArticle) return;
    
    const articlesContainer = document.querySelector('.articles-list');
    const featuredEl = document.createElement('div');
    featuredEl.className = 'featured-article';
    
    featuredEl.innerHTML = `
        <div class="featured-content">
            <span class="featured-badge">⭐ Article en vedette</span>
            <h2>${featuredArticle.title}</h2>
            <p>${featuredArticle.excerpt}</p>
            <a href="blog-post.html?id=${featuredArticle.id}" class="featured-cta">
                Lire l'article complet →
            </a>
        </div>
    `;
    
    // Insert at the beginning
    articlesContainer.insertBefore(featuredEl, articlesContainer.firstChild);
    
    // Add click tracking
    const ctaBtn = featuredEl.querySelector('.featured-cta');
    ctaBtn.addEventListener('click', function() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'featured_article_click', {
                article_id: featuredArticle.id,
                article_title: featuredArticle.title
            });
        }
    });
}

function showNoResults() {
    const articlesContainer = document.querySelector('.articles-list');
    articlesContainer.innerHTML = `
        <div class="no-results">
            <h3>🔍 Aucun article trouvé</h3>
            <p>Essayez d'autres mots-clés ou consultez tous nos articles.</p>
        </div>
    `;
}

// Pagination functionality
function initializePagination() {
    // Pagination will be handled by displayArticles() and updatePagination()
}

function updatePagination() {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;
    
    const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
    
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }
    
    paginationContainer.style.display = 'flex';
    paginationContainer.innerHTML = '';
    
    // Previous button
    const prevBtn = createPaginationButton('‹', currentPage - 1, currentPage === 1);
    paginationContainer.appendChild(prevBtn);
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            const pageBtn = createPaginationButton(i, i, false, i === currentPage);
            paginationContainer.appendChild(pageBtn);
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'pagination-ellipsis';
            paginationContainer.appendChild(ellipsis);
        }
    }
    
    // Next button
    const nextBtn = createPaginationButton('›', currentPage + 1, currentPage === totalPages);
    paginationContainer.appendChild(nextBtn);
}

function createPaginationButton(text, page, disabled = false, active = false) {
    const btn = document.createElement('button');
    btn.className = 'pagination-btn';
    btn.textContent = text;
    
    if (disabled) {
        btn.disabled = true;
    }
    
    if (active) {
        btn.classList.add('active');
    }
    
    if (!disabled) {
        btn.addEventListener('click', function() {
            currentPage = page;
            displayArticles();
            
            // Scroll to top of articles
            document.querySelector('.blog-content').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        });
    }
    
    return btn;
}

// Sidebar functionality
function initializeSidebar() {
    initializeCategoriesWidget();
    initializeRecentPostsWidget();
    initializeTagsWidget();
    initializeNewsletterWidget();
}

function initializeCategoriesWidget() {
    const categoriesContainer = document.querySelector('.categories-list');
    if (!categoriesContainer) return;
    
    // Count articles by category
    const categoryCounts = {};
    allArticles.forEach(article => {
        const category = article.category;
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    // Create category items
    categoriesContainer.innerHTML = '';
    Object.entries(categoryCounts).forEach(([category, count]) => {
        const categoryEl = document.createElement('div');
        categoryEl.className = 'category-item';
        categoryEl.innerHTML = `
            <span class="category-name">${category}</span>
            <span class="category-count">${count}</span>
        `;
        
        categoryEl.addEventListener('click', function() {
            // Find and click the corresponding filter button
            const filterBtn = document.querySelector(`[data-filter="${category.toLowerCase()}"]`);
            if (filterBtn) {
                filterBtn.click();
            }
        });
        
        categoriesContainer.appendChild(categoryEl);
    });
}

function initializeRecentPostsWidget() {
    const recentPostsContainer = document.querySelector('.recent-posts-list');
    if (!recentPostsContainer) return;
    
    // Get 5 most recent articles
    const recentPosts = allArticles
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    recentPostsContainer.innerHTML = '';
    recentPosts.forEach(article => {
        const postEl = document.createElement('div');
        postEl.className = 'recent-post-item';
        
        const categoryIcon = getCategoryIcon(article.category);
        const formattedDate = formatDate(article.date);
        
        postEl.innerHTML = `
            <div class="recent-post-image">
                ${categoryIcon}
            </div>
            <div class="recent-post-content">
                <h4 class="recent-post-title">
                    <a href="blog-post.html?id=${article.id}">${article.title}</a>
                </h4>
                <span class="recent-post-date">${formattedDate}</span>
            </div>
        `;
        
        recentPostsContainer.appendChild(postEl);
    });
}

function initializeTagsWidget() {
    const tagsContainer = document.querySelector('.tags-cloud');
    if (!tagsContainer) return;
    
    // Sample tags - in a real app, these would be extracted from articles
    const tags = [
        'TVA', 'GmbH', 'UG', 'ELSTER', 'HGB', 'IFRS', 
        'Création entreprise', 'Fiscalité', 'Comptabilité', 
        'Finanzamt', 'Contrôle fiscal', 'Optimisation'
    ];
    
    tagsContainer.innerHTML = '';
    tags.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'tag-item';
        tagEl.textContent = tag;
        
        tagEl.addEventListener('click', function() {
            // Search for this tag
            const searchInput = document.getElementById('blogSearch');
            if (searchInput) {
                searchInput.value = tag;
                performSearch(tag);
            }
        });
        
        tagsContainer.appendChild(tagEl);
    });
}

function initializeNewsletterWidget() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        
        // Here you would typically send the email to your newsletter service
        showNotification('Merci pour votre inscription à la newsletter !', 'success');
        
        // Track newsletter signup
        if (typeof gtag !== 'undefined') {
            gtag('event', 'newsletter_signup', {
                source: 'blog_sidebar',
                email: email
            });
        }
        
        // Reset form
        this.reset();
    });
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('fr-FR', options);
}

function getCategoryIcon(category) {
    const icons = {
        'Fiscalité': '💰',
        'Comptabilité': '📊',
        'Création': '🏢',
        'Collaboration': '🤝',
        'Audit': '🔍'
    };
    return icons[category] || '📝';
}

// Animations
function initializeAnimations() {
    const animatedElements = document.querySelectorAll('.article-card, .sidebar-widget, .featured-article');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// Notification system
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '5px',
        color: 'white',
        fontWeight: 'bold',
        zIndex: '10000',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease'
    });
    
    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#4a6fa5'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    });
    
    // Auto remove
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// Set active navigation item
function setActiveNavigation(pageName) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-i18n="nav.${pageName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Scroll handling
const handleScroll = debounce(function() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}, 100);

window.addEventListener('scroll', handleScroll);

// Performance monitoring
function trackPagePerformance() {
    window.addEventListener('load', function() {
        if ('performance' in window) {
            const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_load_time', {
                    value: loadTime,
                    page: 'blog',
                    page_location: window.location.pathname
                });
            }
            
            console.log(`Blog page loaded in ${loadTime}ms`);
        }
    });
}

// Initialize performance tracking
trackPagePerformance();

// Export functions for global use
window.ComptaFreelanceBlog = {
    setActiveNavigation,
    performSearch,
    filterArticles,
    switchLanguage,
    toggleMobileMenu,
    showNotification
};