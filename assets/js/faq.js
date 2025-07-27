/* assets/js/faq.js */

// Global variables
let mobileMenuOpen = false;
let currentLang = 'fr';
let searchTimeout = null;
let activeCategory = 'all';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeLanguageSwitcher();
    initializeFAQ();
    initializeFAQSearch();
    initializeFAQCategories();
    initializeAnimations();
    initializeKeyboardNavigation();
    
    console.log('FAQ page initialized');
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
            page: 'faq'
        });
    }
}

// FAQ functionality
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach((item, index) => {
        const question = item.querySelector('.faq-question');
        const toggle = item.querySelector('.faq-toggle');
        const answer = item.querySelector('.faq-answer');
        
        if (!question || !toggle || !answer) return;
        
        // Add data attribute for tracking
        item.setAttribute('data-faq-index', index);
        
        question.addEventListener('click', function() {
            toggleFAQItem(item, question, toggle, answer);
        });
        
        // Add keyboard accessibility
        question.setAttribute('tabindex', '0');
        question.setAttribute('role', 'button');
        question.setAttribute('aria-expanded', 'false');
        
        question.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFAQItem(item, question, toggle, answer);
            }
        });
    });
}

function toggleFAQItem(item, question, toggle, answer) {
    const isActive = item.classList.contains('active');
    const questionText = question.querySelector('h3').textContent;
    
    // Toggle current item
    if (isActive) {
        item.classList.remove('active');
        toggle.textContent = '+';
        question.setAttribute('aria-expanded', 'false');
    } else {
        item.classList.add('active');
        toggle.textContent = '−';
        question.setAttribute('aria-expanded', 'true');
    }
    
    // Track FAQ interaction
    if (typeof gtag !== 'undefined') {
        gtag('event', 'faq_interaction', {
            question: questionText.substring(0, 100), // Limit length for analytics
            action: isActive ? 'close' : 'open',
            category: item.dataset.category || 'general',
            faq_index: item.dataset.faqIndex
        });
    }
    
    // Scroll to item if opening
    if (!isActive) {
        setTimeout(() => {
            const headerHeight = document.querySelector('.navbar').offsetHeight + 20;
            const itemTop = item.offsetTop - headerHeight;
            
            window.scrollTo({
                top: itemTop,
                behavior: 'smooth'
            });
        }, 150);
    }
}

// FAQ Search functionality
function initializeFAQSearch() {
    const searchInput = document.getElementById('faqSearch');
    const searchBtn = document.querySelector('.search-btn');
    
    if (!searchInput) return;
    
    // Search input events
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const searchTerm = this.value.trim();
        
        // Debounce search
        searchTimeout = setTimeout(() => {
            performSearch(searchTerm);
        }, 300);
    });
    
    // Search button click
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const searchTerm = searchInput.value.trim();
            performSearch(searchTerm);
        });
    }
    
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
    const faqItems = document.querySelectorAll('.faq-item');
    const categorySections = document.querySelectorAll('.faq-category-section');
    let visibleCount = 0;
    
    // Remove previous highlights
    removeAllHighlights();
    
    // Show all categories when searching
    if (searchTerm) {
        resetCategoryFilter();
    }
    
    faqItems.forEach(item => {
        const question = item.querySelector('h3');
        const answer = item.querySelector('.faq-answer');
        
        if (!question || !answer) return;
        
        const questionText = question.textContent.toLowerCase();
        const answerText = answer.textContent.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        if (searchTerm === '' || questionText.includes(searchLower) || answerText.includes(searchLower)) {
            item.style.display = 'block';
            visibleCount++;
            
            // Highlight search terms
            if (searchTerm !== '') {
                highlightSearchTerms(item, searchTerm);
            }
        } else {
            item.style.display = 'none';
            // Close hidden items
            item.classList.remove('active');
            const toggle = item.querySelector('.faq-toggle');
            if (toggle) toggle.textContent = '+';
        }
    });
    
    // Show/hide category sections
    categorySections.forEach(section => {
        const visibleItems = section.querySelectorAll('.faq-item[style*="block"], .faq-item:not([style*="none"])').length;
        section.style.display = visibleItems > 0 ? 'block' : 'none';
    });
    
    // Show no results message
    showNoResultsMessage(visibleCount === 0 && searchTerm !== '');
    
    // Track search
    if (searchTerm && typeof gtag !== 'undefined') {
        gtag('event', 'faq_search', {
            search_term: searchTerm,
            results_count: visibleCount
        });
    }
}

function highlightSearchTerms(item, term) {
    const elements = item.querySelectorAll('h3, .faq-answer p, .faq-answer li');
    const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
    
    elements.forEach(element => {
        const originalText = element.textContent;
        const highlightedHTML = originalText.replace(regex, '<mark class="search-highlight">$1</mark>');
        
        // Only update if there are matches
        if (highlightedHTML !== originalText) {
            element.innerHTML = highlightedHTML;
        }
    });
}

function removeAllHighlights() {
    const highlights = document.querySelectorAll('.search-highlight');
    highlights.forEach(highlight => {
        const parent = highlight.parentNode;
        parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        parent.normalize(); // Merge adjacent text nodes
    });
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function showNoResultsMessage(show) {
    let noResultsEl = document.querySelector('.no-results-message');
    
    if (show && !noResultsEl) {
        noResultsEl = document.createElement('div');
        noResultsEl.className = 'no-results-message';
        noResultsEl.innerHTML = `
            <div class="no-results-content">
                <h3>🔍 Aucun résultat trouvé</h3>
                <p>Essayez d'autres mots-clés ou <a href="contact.html">contactez-moi directement</a> pour une réponse personnalisée.</p>
            </div>
        `;
        
        // Insert after categories nav
        const faqContent = document.querySelector('.faq-content .container');
        if (faqContent) {
            faqContent.appendChild(noResultsEl);
        }
    } else if (!show && noResultsEl) {
        noResultsEl.remove();
    }
}

// FAQ Categories functionality
function initializeFAQCategories() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            
            if (category === activeCategory) return;
            
            // Update active button
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update active category
            activeCategory = category;
            
            // Filter by category
            filterByCategory(category);
            
            // Clear search
            const searchInput = document.getElementById('faqSearch');
            if (searchInput) {
                searchInput.value = '';
                removeAllHighlights();
            }
            
            // Track category selection
            if (typeof gtag !== 'undefined') {
                gtag('event', 'faq_category_filter', {
                    category: category
                });
            }
        });
    });
}

function filterByCategory(category) {
    const faqItems = document.querySelectorAll('.faq-item');
    const categorySections = document.querySelectorAll('.faq-category-section');
    
    // Remove no results message
    showNoResultsMessage(false);
    
    if (category === 'all') {
        // Show all items and sections
        faqItems.forEach(item => {
            item.style.display = 'block';
        });
        categorySections.forEach(section => {
            section.style.display = 'block';
        });
    } else {
        // Show only items from selected category
        faqItems.forEach(item => {
            if (item.dataset.category === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
                // Close hidden items
                item.classList.remove('active');
                const toggle = item.querySelector('.faq-toggle');
                if (toggle) toggle.textContent = '+';
            }
        });
        
        // Show only relevant sections
        categorySections.forEach(section => {
            if (section.dataset.category === category) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
    }
}

function resetCategoryFilter() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    
    // Reset to "all" category
    categoryBtns.forEach(btn => btn.classList.remove('active'));
    const allBtn = document.querySelector('[data-category="all"]');
    if (allBtn) {
        allBtn.classList.add('active');
        activeCategory = 'all';
    }
}

// Animations
function initializeAnimations() {
    const animatedElements = document.querySelectorAll('.faq-item, .faq-category-section');
    
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

// Keyboard navigation
function initializeKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // Escape key handling
        if (e.key === 'Escape') {
            // Close all open FAQ items
            const activeFAQs = document.querySelectorAll('.faq-item.active');
            activeFAQs.forEach(item => {
                item.classList.remove('active');
                const toggle = item.querySelector('.faq-toggle');
                if (toggle) toggle.textContent = '+';
                const question = item.querySelector('.faq-question');
                if (question) question.setAttribute('aria-expanded', 'false');
            });
            
            // Clear search
            const searchInput = document.getElementById('faqSearch');
            if (searchInput && searchInput.value) {
                searchInput.value = '';
                performSearch('');
            }
        }
        
        // Ctrl/Cmd + F to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            const searchInput = document.getElementById('faqSearch');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
    });
}

// URL handling for direct links to FAQ items
function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const faqId = urlParams.get('faq');
    const searchTerm = urlParams.get('search');
    
    if (faqId) {
        // Open specific FAQ item
        const faqItem = document.querySelector(`[data-faq-id="${faqId}"]`);
        if (faqItem) {
            setTimeout(() => {
                const question = faqItem.querySelector('.faq-question');
                if (question) {
                    question.click();
                    faqItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 500);
        }
    }
    
    if (searchTerm) {
        // Perform search from URL
        const searchInput = document.getElementById('faqSearch');
        if (searchInput) {
            searchInput.value = decodeURIComponent(searchTerm);
            performSearch(searchInput.value);
        }
    }
}

// CTA tracking
function initializeCTATracking() {
    const ctaButtons = document.querySelectorAll('.btn-primary, .btn-secondary');
    
    ctaButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            const buttonType = this.classList.contains('btn-primary') ? 'primary' : 'secondary';
            const section = this.closest('section')?.className || 'unknown';
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'cta_click', {
                    button_text: buttonText,
                    button_type: buttonType,
                    section: section,
                    page: 'faq'
                });
            }
        });
    });
}

// FAQ sharing functionality
function initializeFAQSharing() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach((item, index) => {
        const question = item.querySelector('.faq-question');
        
        if (question) {
            // Add share functionality on right-click or long press
            question.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                shareFAQ(item, index);
            });
        }
    });
}

function shareFAQ(faqItem, index) {
    const questionText = faqItem.querySelector('h3')?.textContent;
    const url = `${window.location.origin}${window.location.pathname}?faq=${index}`;
    
    if (navigator.share) {
        navigator.share({
            title: questionText,
            url: url
        }).catch(console.error);
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            showNotification('Lien copié dans le presse-papiers !', 'success');
        }).catch(() => {
            showNotification('Impossible de copier le lien', 'error');
        });
    }
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'faq_share', {
            question: questionText.substring(0, 100),
            method: navigator.share ? 'native' : 'clipboard'
        });
    }
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

// Initialize additional features when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeCTATracking();
    initializeFAQSharing();
    handleURLParameters();
    
    // Add loading animation removal
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// Performance monitoring
function trackPagePerformance() {
    window.addEventListener('load', function() {
        if ('performance' in window) {
            const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_load_time', {
                    value: loadTime,
                    page: 'faq',
                    page_location: window.location.pathname
                });
            }
            
            console.log(`FAQ page loaded in ${loadTime}ms`);
        }
    });
}

// Initialize performance tracking
trackPagePerformance();

// Export functions for global use
window.ComptaFreelanceFAQ = {
    setActiveNavigation,
    performSearch,
    filterByCategory,
    toggleFAQItem,
    switchLanguage,
    toggleMobileMenu,
    showNotification
};