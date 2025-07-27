// assets/js/contact.js

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

    // Call setActiveNavigation for the 'contact' page
    setActiveNavigation('contact');

    // --- Contact Form Handling ---
    function initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return; // Exit if form not found

        const submitBtn = form.querySelector('button[type="submit"]');
        const messageContainer = document.createElement('div');
        messageContainer.className = 'form-message';
        messageContainer.setAttribute('role', 'alert'); // Accessibility
        form.parentNode.insertBefore(messageContainer, form); // Insert above form

        // Function to show form messages
        function showFormMessage(message, isSuccess = false) {
            messageContainer.textContent = message;
            messageContainer.className = `form-message ${isSuccess ? 'success' : 'error'}`;
            messageContainer.style.display = 'block';
            messageContainer.focus(); // Accessibility

            // Scroll message into view smoothly
            messageContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            // Hide message after a delay (optional)
            // setTimeout(() => {
            //     messageContainer.style.display = 'none';
            // }, 5000);
        }

        // Function to clear form messages
        function clearFormMessage() {
            messageContainer.style.display = 'none';
        }

        // Form validation function
        function validateContactForm(data) {
            const errors = [];
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,20}$/;

            if (!data.firstName || data.firstName.trim().length < 2) {
                errors.push('Le prénom doit contenir au moins 2 caractères.');
            }
            if (!data.lastName || data.lastName.trim().length < 2) {
                errors.push('Le nom doit contenir au moins 2 caractères.');
            }
            if (!data.email || !emailRegex.test(data.email)) {
                errors.push('Veuillez entrer une adresse email valide.');
            }
            // Phone validation (if provided)
            if (data.phone && data.phone.length > 0) {
                if (!phoneRegex.test(data.phone)) {
                   errors.push('Le numéro de téléphone n\'est pas valide.');
                }
            }
            if (!data.subject) {
                errors.push('Veuillez sélectionner le type de demande.');
            }
            if (!data.message || data.message.trim().length < 20) {
                errors.push('Le message doit contenir au moins 20 caractères.');
            }
            if (data.message && data.message.length > 1000) {
                errors.push('Le message est trop long (maximum 1000 caractères).');
            }
            if (!data.privacy) {
                 errors.push('Vous devez accepter la politique de confidentialité.');
            }
            return errors;
        }

        // Handle form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            clearFormMessage(); // Clear any previous messages

            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);

            // Validate form
            const errors = validateContactForm(data);

            if (errors.length > 0) {
                showFormMessage(errors.join(' ')); // Join errors into one string
                return;
            }

            // Show loading state
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '⏳ Envoi en cours...';
            submitBtn.disabled = true;

            // --- Simulate Form Submission ---
            // In a real application, you would send the data to your server here.
            // Example using fetch:
            /*
            fetch('/submit-contact-form', { // Replace with your actual endpoint
                method: 'POST',
                body: formData // Or JSON.stringify(data) if your backend expects JSON
                // headers: { 'Content-Type': 'application/json' } // If sending JSON
            })
            .then(response => {
                if (response.ok) {
                    return response.json(); // Or response.text() if not JSON
                } else {
                    throw new Error('Network response was not ok.');
                }
            })
            .then(result => {
                // Handle success response from server
                showFormMessage('✅ Votre message a été envoyé avec succès ! Je vous répondrai dans les plus brefs délais.', true);
                form.reset();
                // Reset character counter if applicable
                const messageTextarea = document.getElementById('message');
                if (messageTextarea) {
                    updateCharCount(0);
                }
            })
            .catch(error => {
                // Handle errors (network, server errors)
                console.error('Error submitting form:', error);
                showFormMessage('❌ Une erreur est survenue lors de l\'envoi du formulaire. Veuillez réessayer plus tard.');
            })
            .finally(() => {
                // Reset button state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
            */

            // --- Simulated Success for Demo ---
            setTimeout(() => {
                showFormMessage('✅ Votre message a été envoyé avec succès ! Je vous répondrai dans les plus brefs délais.', true);
                form.reset();
                // Reset character counter if applicable
                const messageTextarea = document.getElementById('message');
                if (messageTextarea) {
                    updateCharCount(0);
                }
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 1500); // Simulate network delay
        });
    }

    // --- FAQ Accordion ---
    function initFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        if (faqItems.length === 0) return; // Exit if no FAQ items

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (!question) return; // Safety check

            question.addEventListener('click', function() {
                const isActive = item.classList.contains('active');

                // Close all FAQ items
                faqItems.forEach(faqItem => {
                    faqItem.classList.remove('active');
                });

                // Open clicked item if it wasn't active
                if (!isActive) {
                    item.classList.add('active');
                    // Optional: Scroll the opened answer into view
                    const answer = item.querySelector('.faq-answer');
                    if (answer) {
                         answer.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                    }
                }
                // If it was active, it's now closed (toggled off)
            });
        });
    }

    // --- Character Counter for Message Textarea ---
    function initCharacterCounter() {
        const messageTextarea = document.getElementById('message');
        if (!messageTextarea) return; // Exit if textarea not found

        const counterContainer = document.createElement('div');
        counterContainer.className = 'char-counter';
        counterContainer.textContent = '0 / 1000';
        messageTextarea.parentNode.appendChild(counterContainer); // Add counter below textarea

        const maxLength = 1000;

        function updateCharCount(count) {
             counterContainer.textContent = `${count} / ${maxLength}`;
             counterContainer.classList.remove('near-limit', 'over-limit');
             if (count > maxLength * 0.9) { // 90% limit
                 counterContainer.classList.add('near-limit');
             }
             if (count > maxLength) {
                 counterContainer.classList.add('over-limit');
             }
        }

        messageTextarea.addEventListener('input', function() {
            const currentLength = this.value.length;
            updateCharCount(currentLength);
        });

        // Initialize count on page load if there's pre-filled content
        updateCharCount(messageTextarea.value.length);
    }


    // --- Analytics ---
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            page_title: document.title,
            page_location: window.location.href
        });
    }

    // Initialize components after setting up navigation
    initContactForm();
    initFAQ();
    initCharacterCounter();


}); // End of DOMContentLoaded