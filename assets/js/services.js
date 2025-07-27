// assets/js/services.js

document.addEventListener('DOMContentLoaded', function () {

    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            // Optional: Change hamburger icon
            // this.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
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
                // Replace existing language code
                pathParts[0] = selectedLang;
                 // Ensure index.html is added if it's the root path
                if (pathParts.length === 1) {
                    pathParts.push('index.html');
                }
                newPath = '/' + pathParts.join('/');
            } else {
                // Add language code to the path
                if (currentPath === '/' || currentPath === '/index.html') {
                    newPath = `/${selectedLang}/`;
                } else {
                    // For other pages like services.html
                     // Handle cases where the file might already have a language prefix implicitly handled by server
                     // This assumes the base path structure is /{lang}/filename.html
                     // If current path is /services.html, we want /fr/services.html etc.
                     // If current path is /fr/services.html, we want /de/services.html etc.
                     // This logic handles the latter case correctly.
                     // For the former, we assume it defaults to 'fr' or a default lang, or we redirect to /fr/
                     // Let's simplify: always assume the file name is the last part and the lang is the first part after domain.
                     // If no lang prefix, default to adding /fr/ (or the selected lang)
                     // A more robust solution would involve server-side routing or more complex JS path manipulation,
                     // but this covers the common case.
                    newPath = `/${selectedLang}/${pathParts[pathParts.length - 1] || 'index.html'}`;
                }
            }

            // Ensure newPath starts and ends correctly
            if (!newPath.startsWith('/')) newPath = '/' + newPath;
            if (newPath === '/') newPath = `/${selectedLang}/`; // Default to lang root

            window.location.href = newPath;
        });
    });


    // --- Set Active Navigation Link ---
    function setActiveNavigation(currentPage) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            // Check if the link's href matches the current page
            // This assumes the href is like 'services.html', 'index.html', etc.
             // We also need to handle potential language prefixes in the URL.
             // Get the last part of the current URL path
            const pathParts = window.location.pathname.split('/').filter(part => part);
            let fileName = 'index.html'; // Default
            if (pathParts.length > 0) {
                 // If the last part has an extension, it's the file
                 if(pathParts[pathParts.length - 1].includes('.')) {
                      fileName = pathParts[pathParts.length - 1];
                 } else {
                      // If the last part doesn't have an extension, it might be a directory, default to index.html
                      // Or it could be the language code if it's the root like /fr/
                      // This logic assumes if only one part and it's a lang code, it's the root
                      // If more than one part, the last one is the file.
                      if(pathParts.length > 1) {
                           fileName = pathParts[pathParts.length - 1] + '.html'; // e.g., /fr/services -> services.html
                      } else if (['fr', 'de', 'en'].includes(pathParts[0])) {
                           fileName = 'index.html';
                      } else {
                           fileName = pathParts[0] + '.html'; // e.g., /services -> services.html
                      }
                 }
            }

            // Compare the extracted filename with the link's href attribute
            // Make sure the comparison is case-insensitive and handles potential leading/trailing slashes
             const linkHref = link.getAttribute('href').split('/').pop(); // Get the filename part of the href

             if (linkHref && fileName.toLowerCase() === linkHref.toLowerCase()) {
                 link.classList.add('active');
             }
        });
    }

    // Call setActiveNavigation, passing the current page identifier (e.g., 'services')
    // We can derive this from the filename or the hash/URL structure if needed.
    // For simplicity, let's derive it from the current filename.
    const currentPageName = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    setActiveNavigation(currentPageName);


     // --- Services Tabs Functionality ---
    function initServicesTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const serviceSections = document.querySelectorAll('.service-detail');

        // Function to show a specific service section
        function showService(serviceId) {
            // Hide all service sections
            serviceSections.forEach(section => {
                section.classList.remove('active');
            });
            // Show the target service section
            const targetSection = document.getElementById(serviceId);
            if (targetSection) {
                targetSection.classList.add('active');
                // Scroll smoothly to the top of the service section
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }

        // Add click event listeners to tab buttons
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault(); // Prevent default anchor behavior if it's an <a> tag
                const targetService = this.getAttribute('data-tab');

                // Update active tab button
                tabBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                // Show the corresponding service section
                showService(targetService);

                // Update URL hash for direct linking/bookmarking
                window.location.hash = targetService;

                // Analytics tracking (if gtag is available)
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'service_view', {
                        service_name: targetService
                    });
                }
            });
        });

        // Handle direct navigation via URL hash (e.g., services.html#tax)
        function handleHashChange() {
            const hash = window.location.hash.substring(1); // Remove the '#'
            const validServices = ['accounting', 'tax', 'creation', 'finanzamt', 'reporting', 'audit'];
            if (validServices.includes(hash)) {
                // Find the corresponding tab button and trigger a click
                const targetTabBtn = document.querySelector(`[data-tab="${hash}"]`);
                if (targetTabBtn) {
                    // Temporarily remove the event listener to prevent double execution
                    const oldListener = targetTabBtn.onclick;
                    targetTabBtn.onclick = null;
                    targetTabBtn.click();
                    // Re-attach the listener after a short delay
                    setTimeout(() => {
                        targetTabBtn.onclick = oldListener;
                    }, 100);
                }
            } else {
                 // If hash is invalid or empty, show the default (first) service
                 if(tabBtns.length > 0 && serviceSections.length > 0) {
                      tabBtns[0].click(); // This will trigger the showService for the first tab
                 }
            }
        }

        // Initial check on page load
        handleHashChange();

        // Listen for hash changes (e.g., back/forward button)
        window.addEventListener('hashchange', handleHashChange);
    }

    // Initialize the services tabs functionality
    initServicesTabs();

    // --- Analytics ---
    // Basic page view tracking (assuming gtag is loaded in the HTML)
    if (typeof gtag !== 'undefined') {
        // The config call is in the HTML, so just send the page view event
        gtag('event', 'page_view', {
            page_title: document.title,
            page_location: window.location.href
        });
    }

}); // End of DOMContentLoaded