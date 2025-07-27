/* assets/js/index.js */

// Global variables
let mobileMenuOpen = false;
let currentLang = 'fr';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeLanguageSwitcher();
    initializeAnimations();
    initializeSmoothScrolling();
    
    console.log('Homepage initialized');
});

// Navigation functionality
function initializeNavigation() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenuOpen = !mobileMenuOpen;
            navMenu.classList.toggle('active');
            
            // Update button icon
            this.textContent = mobileMenuOpen ? '✕' : '☰';
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
        });
    }

    // Close mobile menu when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (mobileMenuOpen) {
                navMenu.classList.remove('active');
                mobileMenuBtn.textContent = '☰';
                mobileMenuOpen = false;
                document.body.style.overflow = '';
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (mobileMenuOpen && !navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            navMenu.classList.remove('active');
            mobileMenuBtn.textContent = '☰';
            mobileMenuOpen = false;
            document.body.style.overflow = '';
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && mobileMenuOpen) {
            navMenu.classList.remove('active');
            mobileMenuBtn.textContent = '☰';
            mobileMenuOpen = false;
            document.body.style.overflow = '';
        }
    });
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
    
    // Here you would implement the actual translation logic
    // For now, we'll just log the language change
    console.log(`Language switched to: ${lang}`);
    
    // Track language change
    if (typeof gtag !== 'undefined') {
        gtag('event', 'language_change', {
            language: lang
        });
    }
    
    // You might want to redirect to the appropriate language version
    // Example: window.location.href = `/${lang}/`;
}

// Animation functionality
function initializeAnimations() {
    // Initialize counter animations
    initializeCounterAnimations();
    
    // Initialize scroll animations
    initializeScrollAnimations();
}

function initializeCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number');
    let countersAnimated = false;

    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersAnimated) {
                countersAnimated = true;
                const target = parseInt(entry.target.dataset.target);
                animateCounter(entry.target, target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        if (counter.dataset.target) {
            observer.observe(counter);
        }
    });
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 60; // 60 frames for smooth animation
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16); // ~60fps
}

function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('.service-card, .benefit-item, .client-card, .blog-card-preview');
    
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

// Smooth scrolling functionality
function initializeSmoothScrolling() {
    // Handle anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const headerHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
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

// Form submission handling (if needed)
function handleFormSubmission(formId, callback) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Basic form validation
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Check required fields
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });
        
        if (isValid) {
            if (callback) {
                callback(data);
            } else {
                console.log('Form submitted:', data);
                // Here you would typically send the data to your server
            }
        }
    });
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

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Scroll handling with throttle
const handleScroll = throttle(function() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}, 100);

window.addEventListener('scroll', handleScroll);

// Service card hover effects
function initializeServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.boxShadow = '0 12px 24px rgba(74, 111, 165, 0.2)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
        });
        
        // Track service card clicks
        card.addEventListener('click', function() {
            const serviceTitle = this.querySelector('h3').textContent;
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'service_interest', {
                    service_name: serviceTitle.toLowerCase().replace(/\s+/g, '_')
                });
            }
        });
    });
}

// CTA button tracking
function initializeCTATracking() {
    const ctaButtons = document.querySelectorAll('.btn-primary, .btn-secondary');
    
    ctaButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            const buttonType = this.classList.contains('btn-primary') ? 'primary' : 'secondary';
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'cta_click', {
                    button_text: buttonText,
                    button_type: buttonType,
                    page_location: window.location.pathname
                });
            }
        });
    });
}

// Initialize additional features when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeServiceCards();
    initializeCTATracking();
    
    // Add loading animation removal
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// Lazy loading for images (if any)
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        images.forEach(img => {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
        });
    }
}

// Error handling for missing elements
function safeQuerySelector(selector) {
    try {
        return document.querySelector(selector);
    } catch (error) {
        console.warn(`Element not found: ${selector}`);
        return null;
    }
}

function safeQuerySelectorAll(selector) {
    try {
        return document.querySelectorAll(selector);
    } catch (error) {
        console.warn(`Elements not found: ${selector}`);
        return [];
    }
}

// Newsletter subscription (if implemented)
function initializeNewsletterForm() {
    const newsletterForm = safeQuerySelector('#newsletter-form');
    if (!newsletterForm) return;
    
    handleFormSubmission('newsletter-form', function(data) {
        // Show success message
        showNotification('Merci pour votre inscription !', 'success');
        
        // Track subscription
        if (typeof gtag !== 'undefined') {
            gtag('event', 'newsletter_signup', {
                email: data.email
            });
        }
        
        // Reset form
        newsletterForm.reset();
    });
}

// Notification system
function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
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
    
    // Click to dismiss
    notification.addEventListener('click', () => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

// Performance monitoring
function trackPagePerformance() {
    window.addEventListener('load', function() {
        if ('performance' in window) {
            const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_load_time', {
                    value: loadTime,
                    page_location: window.location.pathname
                });
            }
            
            console.log(`Page loaded in ${loadTime}ms`);
        }
    });
}

// Initialize performance tracking
trackPagePerformance();

// Export functions for global use
window.ComptaFreelance = {
    setActiveNavigation,
    showNotification,
    switchLanguage,
    animateCounter
};