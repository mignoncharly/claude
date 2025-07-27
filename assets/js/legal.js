// assets/js/legal.js

class LegalPageManager {
    constructor() {
        this.currentLanguage = 'fr';
        this.translations = {};
        this.init();
    }

    async init() {
        await this.loadTranslations();
        this.initializeElements();
        this.setupEventListeners();
        this.updateContent();
        this.setupScrollEffects();
    }

    async loadTranslations() {
        try {
            // Load French translations
            const frResponse = await fetch('/assets/data/legal-fr.json');
            const frData = await frResponse.json();
            
            // Load English translations
            const enResponse = await fetch('/assets/data/legal-en.json');
            const enData = await enResponse.json();
            
            this.translations = {
                fr: frData,
                en: enData
            };
        } catch (error) {
            console.error('Error loading translations:', error);
            // Fallback to basic translations
            this.translations = this.getFallbackTranslations();
        }
    }

    getFallbackTranslations() {
        return {
            fr: {
                nav: {
                    home: "Accueil",
                    services: "Services",
                    about: "À propos",
                    contact: "Contact",
                    cta: "Rendez-vous"
                },
                breadcrumb: {
                    home: "Accueil",
                    legal: "Mentions légales",
                    privacy: "Confidentialité"
                },
                legal: {
                    title: "Mentions légales",
                    subtitle: "Informations légales et conditions d'utilisation",
                    lastUpdated: "Dernière mise à jour",
                    tableOfContents: "Table des matières"
                },
                privacy: {
                    title: "Politique de confidentialité",
                    subtitle: "Protection et traitement de vos données personnelles",
                    lastUpdated: "Dernière mise à jour",
                    tableOfContents: "Table des matières"
                },
                common: {
                    backToTop: "Retour en haut",
                    contact: "Contact",
                    phone: "Téléphone",
                    email: "Email"
                }
            },
            en: {
                nav: {
                    home: "Home",
                    services: "Services",
                    about: "About",
                    contact: "Contact",
                    cta: "Book Appointment"
                },
                breadcrumb: {
                    home: "Home",
                    legal: "Legal Notice",
                    privacy: "Privacy Policy"
                },
                legal: {
                    title: "Legal Notice",
                    subtitle: "Legal information and terms of use",
                    lastUpdated: "Last updated",
                    tableOfContents: "Table of Contents"
                },
                privacy: {
                    title: "Privacy Policy",
                    subtitle: "Protection and processing of your personal data",
                    lastUpdated: "Last updated",
                    tableOfContents: "Table of Contents"
                },
                common: {
                    backToTop: "Back to Top",
                    contact: "Contact",
                    phone: "Phone",
                    email: "Email"
                }
            }
        };
    }

    initializeElements() {
        // Get current page type
        this.pageType = document.body.dataset.page || 'legal';
        
        // Mobile menu toggle
        this.mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        this.navMenu = document.querySelector('.nav-menu');
        
        // Language switcher
        this.langButtons = document.querySelectorAll('.lang-btn');
        
        // Back to top button
        this.backToTopBtn = document.querySelector('.back-to-top');
        
        // TOC links
        this.tocLinks = document.querySelectorAll('.toc-list a');
        
        // Get current language from URL or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        const storedLang = localStorage.getItem('preferredLanguage');
        this.currentLanguage = urlLang || storedLang || 'fr';
    }

    setupEventListeners() {
        // Mobile menu toggle
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => {
                this.navMenu.classList.toggle('active');
            });
        }

        // Language switcher
        this.langButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = btn.dataset.lang;
                this.switchLanguage(lang);
            });
        });

        // Back to top button
        if (this.backToTopBtn) {
            this.backToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }

        // Smooth scrolling for TOC links
        this.tocLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    const headerOffset = 100;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.navMenu && this.navMenu.classList.contains('active')) {
                if (!this.navMenu.contains(e.target) && !this.mobileMenuBtn.contains(e.target)) {
                    this.navMenu.classList.remove('active');
                }
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.navMenu) {
                this.navMenu.classList.remove('active');
            }
        });
    }

    setupScrollEffects() {
        // Back to top button visibility
        window.addEventListener('scroll', () => {
            if (this.backToTopBtn) {
                if (window.pageYOffset > 300) {
                    this.backToTopBtn.classList.add('visible');
                } else {
                    this.backToTopBtn.classList.remove('visible');
                }
            }
        });

        // Add scroll animation to sections
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe all legal sections
        document.querySelectorAll('.legal-section').forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(section);
        });
    }

    switchLanguage(lang) {
        if (lang === this.currentLanguage) return;
        
        this.currentLanguage = lang;
        localStorage.setItem('preferredLanguage', lang);
        
        // Update URL without reload
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        window.history.replaceState({}, '', url);
        
        this.updateContent();
        this.updateLanguageButtons();
    }

    updateLanguageButtons() {
        this.langButtons.forEach(btn => {
            if (btn.dataset.lang === this.currentLanguage) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    updateContent() {
        const t = this.translations[this.currentLanguage];
        if (!t) return;

        // Update navigation
        this.updateNavigation(t);
        
        // Update breadcrumb
        this.updateBreadcrumb(t);
        
        // Update page content based on page type
        if (this.pageType === 'legal') {
            this.updateLegalContent(t);
        } else if (this.pageType === 'privacy') {
            this.updatePrivacyContent(t);
        }
        
        // Update common elements
        this.updateCommonElements(t);
        
        // Update language buttons
        this.updateLanguageButtons();
    }

    updateNavigation(t) {
        // Update navigation links
        const navLinks = {
            'nav-home': t.nav.home,
            'nav-services': t.nav.services,
            'nav-about': t.nav.about,
            'nav-contact': t.nav.contact
        };

        Object.entries(navLinks).forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = text;
        });

        // Update CTA button
        const ctaBtn = document.querySelector('.nav-cta');
        if (ctaBtn) ctaBtn.textContent = t.nav.cta;
    }

    updateBreadcrumb(t) {
        const breadcrumbLinks = document.querySelectorAll('.breadcrumb [data-i18n]');
        breadcrumbLinks.forEach(link => {
            const key = link.dataset.i18n;
            const keys = key.split('.');
            let value = t;
            keys.forEach(k => {
                value = value?.[k];
            });
            if (value) link.textContent = value;
        });
    }

    updateLegalContent(t) {
        // Update page title and subtitle
        const pageTitle = document.querySelector('.page-header h1');
        const pageSubtitle = document.querySelector('.page-subtitle');
        
        if (pageTitle) pageTitle.textContent = t.legal.title;
        if (pageSubtitle) pageSubtitle.textContent = t.legal.subtitle;

        // Update last updated text
        const lastUpdated = document.querySelector('.last-updated');
        if (lastUpdated) {
            const date = new Date().toLocaleDateString(this.currentLanguage === 'fr' ? 'fr-FR' : 'en-US');
            lastUpdated.innerHTML = `<strong>${t.legal.lastUpdated}:</strong> ${date}`;
        }

        // Update table of contents title
        const tocTitle = document.querySelector('.toc-title');
        if (tocTitle) tocTitle.textContent = t.legal.tableOfContents;

        // Update sections if translations available
        if (t.legal.sections) {
            this.updateSectionContent(t.legal.sections);
        }
    }

    updatePrivacyContent(t) {
        // Update page title and subtitle
        const pageTitle = document.querySelector('.page-header h1');
        const pageSubtitle = document.querySelector('.page-subtitle');
        
        if (pageTitle) pageTitle.textContent = t.privacy.title;
        if (pageSubtitle) pageSubtitle.textContent = t.privacy.subtitle;

        // Update last updated text
        const lastUpdated = document.querySelector('.last-updated');
        if (lastUpdated) {
            const date = new Date().toLocaleDateString(this.currentLanguage === 'fr' ? 'fr-FR' : 'en-US');
            lastUpdated.innerHTML = `<strong>${t.privacy.lastUpdated}:</strong> ${date}`;
        }

        // Update table of contents title
        const tocTitle = document.querySelector('.toc-title');
        if (tocTitle) tocTitle.textContent = t.privacy.tableOfContents;

        // Update sections if translations available
        if (t.privacy.sections) {
            this.updateSectionContent(t.privacy.sections);
        }
    }

    updateSectionContent(sections) {
        Object.entries(sections).forEach(([sectionId, content]) => {
            const section = document.getElementById(sectionId);
            if (section) {
                const title = section.querySelector('.section-title');
                const contentDiv = section.querySelector('.section-content');
                
                if (title && content.title) {
                    title.textContent = content.title;
                }
                
                if (contentDiv && content.content) {
                    contentDiv.innerHTML = content.content;
                }
            }
        });
    }

    updateCommonElements(t) {
        // Update back to top button
        if (this.backToTopBtn) {
            this.backToTopBtn.title = t.common.backToTop;
        }

        // Update contact info
        const contactElements = document.querySelectorAll('[data-i18n]');
        contactElements.forEach(element => {
            const key = element.dataset.i18n;
            const keys = key.split('.');
            let value = t;
            keys.forEach(k => {
                value = value?.[k];
            });
            if (value) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = value;
                } else {
                    element.textContent = value;
                }
            }
        });
    }

    // Utility method to format dates
    formatDate(date, locale = 'fr-FR') {
        return new Date(date).toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Method to generate table of contents
    generateTableOfContents() {
        const sections = document.querySelectorAll('.legal-section');
        const tocList = document.querySelector('.toc-list');
        
        if (!tocList || sections.length === 0) return;
        
        tocList.innerHTML = '';
        
        sections.forEach((section, index) => {
            const title = section.querySelector('.section-title');
            if (title) {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = `#${section.id}`;
                a.textContent = title.textContent;
                li.appendChild(a);
                tocList.appendChild(li);
            }
        });
    }

    // Print functionality
    printPage() {
        window.print();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LegalPageManager();
});

// Smooth scrolling polyfill for older browsers
if (!CSS.supports('scroll-behavior: smooth')) {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}