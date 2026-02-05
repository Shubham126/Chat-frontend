const ConfigurationPage = {
    selectedTheme: 'default',

    async init() {
        console.log('🎨 Initializing Configuration Page...');

        // Load the configuration HTML
        const response = await fetch('pages/configuration/configuration.html');
        const html = await response.text();

        // Insert into main content
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = html;
        }

        // Bind events
        this.bindEvents();
    },

    bindEvents() {
        // Theme selection buttons
        const themeButtons = document.querySelectorAll('.select-theme-btn');
        themeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.currentTarget.getAttribute('data-theme');
                this.selectTheme(theme);
            });
        });
    },

    selectTheme(theme) {
        this.selectedTheme = theme;

        // Update UI
        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.remove('selected');
        });

        const selectedCard = document.querySelector(`.theme-card[data-theme="${theme}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }

        // Show applied message
        const appliedDiv = document.getElementById('theme-applied');
        if (appliedDiv) {
            appliedDiv.style.display = 'block';
        }

        console.log(`✅ Theme selected: ${theme}`);
    }
};

// Global function for copying code
window.copyCode = function (elementId) {
    const codeElement = document.getElementById(elementId);
    if (codeElement) {
        const text = codeElement.textContent;
        navigator.clipboard.writeText(text).then(() => {
            // Show feedback
            const btn = event.target.closest('button');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="ri-check-line"></i> Copied!';
            btn.style.background = '#10b981';

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
            }, 2000);
        });
    }
};

// Export for use in main app
if (typeof window !== 'undefined') {
    window.ConfigurationPage = ConfigurationPage;
}