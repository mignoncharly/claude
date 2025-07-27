// assets/js/about.js

document.addEventListener('DOMContentLoaded', function () {

    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function () {
            navMenu.classList.toggle('active');
        });
    }

    // --- Language Switcher ---
    const langButtons = document.querySelectorAll('.lang-btn');
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/').filter(part => part);

    langButtons.forEach(button => {
        button.addEventListener('click', function () {
            const selectedLang = this.getAttribute('data-lang');
            let newPath = '';

            if (pathParts.length > 0 && ['fr', 'de', 'en'].includes(pathParts[0])) {
                pathParts[0] = selectedLang;
                if (pathParts.length === 1) {
                    pathParts.push('index.html'); // Default to index if only lang
                }
                newPath = '/' + pathParts.join('/');
            } else {
                if (currentPath === '/' || currentPath === '/index.html') {
                    newPath = `/${selectedLang}/`;
                } else {
                    newPath = `/${selectedLang}/${pathParts[pathParts.length - 1] || 'index.html'}`;
                }
            }

            if (!newPath.startsWith('/')) newPath = '/' + newPath;
            if (newPath === '/') newPath = `/${selectedLang}/`;

            window.location.href = newPath;
        });
    });

    // --- Set Active Navigation Link ---
    function setActiveNavigation(currentPage) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            const pathParts = window.location.pathname.split('/').filter(part => part);
            let fileName = 'index.html';
            if (pathParts.length > 0) {
                if(pathParts[pathParts.length - 1].includes('.')) {
                     fileName = pathParts[pathParts.length - 1];
                } else {
                     if(pathParts.length > 1) {
                          fileName = pathParts[pathParts.length - 1] + '.html';
                     } else if (['fr', 'de', 'en'].includes(pathParts[0])) {
                          fileName = 'index.html';
                     } else {
                          fileName = pathParts[0] + '.html';
                     }
                }
            }

            const linkHref = link.getAttribute('href').split('/').pop();
            if (linkHref && fileName.toLowerCase() === linkHref.toLowerCase()) {
                link.classList.add('active');
            }
        });
    }

    // Call setActiveNavigation for the 'about' page
    setActiveNavigation('about');


    // --- Skill Bar Animations ---
    function initSkillBars() {
        const skillBars = document.querySelectorAll('.skill-level');
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const width = entry.target.style.width;
                    entry.target.style.width = '0%';
                    setTimeout(() => {
                        entry.target.style.transition = 'width 1s ease-in-out';
                        entry.target.style.width = width;
                    }, 100); // Small delay to ensure 0% is applied
                    observer.unobserve(entry.target); // Stop observing once animated
                }
            });
        }, { threshold: 0.5 }); // Trigger when 50% of the element is visible

        skillBars.forEach(bar => observer.observe(bar));
    }

    // --- Timeline Animations ---
    function initTimelineAnimations() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    observer.unobserve(entry.target); // Stop observing once animated
                }
            });
        }, { threshold: 0.3 }); // Trigger when 30% of the element is visible

        timelineItems.forEach(item => observer.observe(item));
    }

    // --- Analytics ---
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            page_title: document.title,
            page_location: window.location.href
        });
    }

    // Initialize animations after setting up navigation
    initSkillBars();
    initTimelineAnimations();

}); // End of DOMContentLoaded