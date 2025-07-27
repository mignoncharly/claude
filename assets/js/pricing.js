/* assets/js/pricing.js */

// Global variables
let mobileMenuOpen = false;
let currentLang = 'fr';
let calculatorInitialized = false;

// Pricing calculation constants
const PRICING_CONFIG = {
  basePrices: {
    freelance: 250,
    tpe: 250,
    pme: 450,
    groupe: 800
  },
  transactionMultipliers: {
    low: 0.9,
    medium: 1.0,
    high: 1.3,
    'very-high': 1.6
  },
  complexityMultipliers: {
    simple: 0.85,
    medium: 1.0,
    complex: 1.4
  },
  serviceMultipliers: {
    accounting: 1.0,
    tax: 1.0,
    reporting: 1.2,
    consulting: 1.15
  }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeLanguageSwitcher();
    initializePricingCalculator();
    initializeAnimations();
    initializePricingCards();
    
    console.log('Pricing page initialized');
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
            page: 'pricing'
        });
    }
}

// Pricing calculator functionality
function initializePricingCalculator() {
    const companyType = document.getElementById('companyType');
    const transactions = document.getElementById('transactions');
    const complexity = document.getElementById('complexity');
    const servicesCheckboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
    
    if (!companyType || !transactions || !complexity) {
        console.warn('Pricing calculator elements not found');
        return;
    }
    
    // Add event listeners
    [companyType, transactions, complexity].forEach(element => {
        element.addEventListener('change', calculatePrice);
    });
    
    servicesCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', calculatePrice);
    });
    
    // Initial calculation
    calculatePrice();
    calculatorInitialized = true;
}

function calculatePrice() {
    if (!calculatorInitialized) return;
    
    const companyType = document.getElementById('companyType')?.value;
    const transactions = document.getElementById('transactions')?.value;
    const complexity = document.getElementById('complexity')?.value;
    const services = Array.from(document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked')).map(cb => cb.value);
    
    if (!companyType || !transactions || !complexity) return;
    
    let basePrice = PRICING_CONFIG.basePrices[companyType] || 450;
    let multiplier = 1;
    
    // Apply transaction volume multiplier
    multiplier *= PRICING_CONFIG.transactionMultipliers[transactions] || 1;
    
    // Apply complexity multiplier
    multiplier *= PRICING_CONFIG.complexityMultipliers[complexity] || 1;
    
    // Apply service multipliers
    services.forEach(service => {
        if (service === 'reporting') {
            multiplier *= PRICING_CONFIG.serviceMultipliers.reporting;
        } else if (service === 'consulting') {
            multiplier *= PRICING_CONFIG.serviceMultipliers.consulting;
        }
    });
    
    // Calculate final price
    const finalPrice = Math.round(basePrice * multiplier);
    const minPrice = Math.round(finalPrice * 0.9);
    const maxPrice = Math.round(finalPrice * 1.1);
    
    // Update display
    updatePriceDisplay(finalPrice, minPrice, maxPrice);
    
    // Update included services
    updateIncludedServices(services, companyType);
    
    // Track calculator usage
    if (typeof gtag !== 'undefined') {
        gtag('event', 'pricing_calculated', {
            company_type: companyType,
            estimated_price: finalPrice,
            services_selected: services.length
        });
    }
}

function updatePriceDisplay(finalPrice, minPrice, maxPrice) {
    const estimateAmount = document.getElementById('estimateAmount');
    const priceRange = document.getElementById('priceRange');
    
    if (estimateAmount) {
        estimateAmount.textContent = finalPrice;
        
        // Add animation effect
        estimateAmount.style.transform = 'scale(1.1)';
        setTimeout(() => {
            estimateAmount.style.transform = 'scale(1)';
        }, 200);
    }
    
    if (priceRange) {
        priceRange.textContent = `${minPrice}€ - ${maxPrice}€`;
    }
}

function updateIncludedServices(services, companyType) {
    const includedList = document.getElementById('includedServices');
    if (!includedList) return;
    
    let included = [];
    
    // Base services based on selections
    if (services.includes('accounting')) {
        included.push('Tenue comptable mensuelle');
    }
    if (services.includes('tax')) {
        included.push('Déclarations fiscales TVA et IS');
    }
    if (services.includes('reporting')) {
        included.push('Reporting détaillé mensuel');
    }
    if (services.includes('consulting')) {
        included.push('Conseil fiscal personnalisé');
    }
    
    // Default services for non-basic plans
    if (companyType !== 'freelance') {
        included.push('Support client prioritaire');
        included.push('Interface avec Finanzamt');
    }
    
    // Premium services for enterprise
    if (companyType === 'groupe') {
        included.push('Account manager dédié');
        included.push('SLA personnalisé');
    }
    
    // Ensure minimum services
    if (included.length === 0) {
        included = [
            'Tenue comptable de base',
            'Déclarations TVA',
            'Support standard'
        ];
    }
    
    includedList.innerHTML = included.map(service => `<li>${service}</li>`).join('');
}

// Pricing cards animations
function initializePricingCards() {
    const pricingCards = document.querySelectorAll('.pricing-card');
    
    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (!this.classList.contains('featured')) {
                this.style.transform = 'translateY(-8px) scale(1.02)';
                this.style.boxShadow = '0 12px 24px rgba(74, 111, 165, 0.2)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('featured')) {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
            }
        });
        
        // Track plan selection
        const ctaButton = card.querySelector('.pricing-cta .btn');
        if (ctaButton) {
            ctaButton.addEventListener('click', function() {
                const planName = card.querySelector('h3').textContent;
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'plan_selected', {
                        plan_name: planName.toLowerCase().replace(/\s+/g, '_'),
                        plan_type: this.classList.contains('btn-primary') ? 'featured' : 'standard'
                    });
                }
            });
        }
    });
    
    // Service pricing cards
    const servicePricingCards = document.querySelectorAll('.service-pricing-card');
    
    servicePricingCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
            this.style.boxShadow = '0 12px 24px rgba(74, 111, 165, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 8px 20px rgba(74, 111, 165, 0.1)';
        });
    });
}

// Scroll animations
function initializeAnimations() {
    const animatedElements = document.querySelectorAll('.pricing-card, .service-pricing-card, .note-card, .payment-option');
    
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

// CTA button tracking
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
                    page: 'pricing'
                });
            }
        });
    });
}

// Form handling for pricing inquiries
function handlePricingInquiry(planType) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'pricing_inquiry', {
            plan_type: planType,
            source: 'pricing_page'
        });
    }
    
    // Redirect to contact form with plan parameter
    window.location.href = `contact.html?plan=${planType}&source=pricing`;
}

// URL parameter handling
function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const highlightPlan = urlParams.get('highlight');
    
    if (highlightPlan) {
        // Highlight specific plan
        const planCard = document.querySelector(`[data-plan="${highlightPlan}"]`);
        if (planCard) {
            planCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            planCard.style.animation = 'pulse 2s ease-in-out';
        }
    }
}

// Pricing comparison functionality
function initializePricingComparison() {
    const compareButton = document.querySelector('.compare-plans-btn');
    
    if (compareButton) {
        compareButton.addEventListener('click', function() {
            showPricingComparison();
        });
    }
}

function showPricingComparison() {
    // Create comparison modal or scroll to comparison section
    const comparisonSection = document.querySelector('.pricing-comparison');
    
    if (comparisonSection) {
        comparisonSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'pricing_comparison_viewed');
    }
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

function formatCurrency(amount, currency = 'EUR') {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
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
    initializePricingComparison();
    handleURLParameters();
    
    // Add loading animation removal
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// FAQ toggle functionality (if FAQ section exists)
function initializeFAQToggles() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (question && answer) {
            question.addEventListener('click', function() {
                const isOpen = item.classList.contains('open');
                
                // Close all other items
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('open');
                });
                
                // Toggle current item
                if (!isOpen) {
                    item.classList.add('open');
                }
                
                // Track FAQ interaction
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'faq_interaction', {
                        question: question.textContent.trim().substring(0, 50),
                        action: isOpen ? 'close' : 'open'
                    });
                }
            });
        }
    });
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

// Performance monitoring
function trackPagePerformance() {
    window.addEventListener('load', function() {
        if ('performance' in window) {
            const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_load_time', {
                    value: loadTime,
                    page: 'pricing',
                    page_location: window.location.pathname
                });
            }
            
            console.log(`Pricing page loaded in ${loadTime}ms`);
        }
    });
}

// Initialize performance tracking
trackPagePerformance();

// Export functions for global use
window.ComptaFreelancePricing = {
    setActiveNavigation,
    calculatePrice,
    handlePricingInquiry,
    switchLanguage,
    toggleMobileMenu
};