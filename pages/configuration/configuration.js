const ConfigurationPage = {
    selectedTheme: 'default',
    websites: [],

    async init() {
        console.log('🎨 Initializing Configuration Page...');

        // Load the configuration HTML
        const response = await fetch('pages/configuration/configuration.html');
        const html = await response.text();

        // Insert into configuration page container (not main-content)
        const configPage = document.getElementById('configuration-page');
        if (configPage) {
            configPage.innerHTML = html;
        }

        // Bind events
        this.bindEvents();

        // Load websites to populate integration code
        this.loadWebsites();
    },

    async loadWebsites() {
        const loadingDiv = document.getElementById('config-website-loading');
        if (loadingDiv) loadingDiv.style.display = 'block';

        const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '192.168.1.11'
            ? 'http://localhost:3000/api'
            : 'https://chat-backend-12wo.onrender.com/api';

        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/scrape/dashboard/files`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (loadingDiv) loadingDiv.style.display = 'none';

            if (data.success && data.data && data.data.length > 0) {
                this.websites = data.data;
                this.populateWebsiteSelector();
            }
        } catch (error) {
            console.error('Error loading websites for config:', error);
            if (loadingDiv) loadingDiv.style.display = 'none';
        }
    },

    populateWebsiteSelector() {
        const selector = document.getElementById('config-website-selector');
        const container = document.getElementById('config-website-selection');
        if (!selector || !container) return;

        // Clear existing options except the first one
        selector.innerHTML = '<option value="">Select a scraped website...</option>';

        this.websites.forEach(website => {
            const hasApiKey = website.websiteApiKey && website.websiteApiKey.length > 0;
            if (hasApiKey) {
                const option = document.createElement('option');
                option.value = website.id;
                let displayName = website.displayName || website.title || website.url;
                option.textContent = displayName;
                selector.appendChild(option);
            }
        });

        // Show the container if there's at least one website with an API key
        if (selector.options.length > 1) {
            container.style.display = 'block';
        }
    },

    updateCodeSnippets() {
        const selector = document.getElementById('config-website-selector');
        if (!selector) return;

        const websiteId = selector.value;
        const website = this.websites.find(w => w.id === websiteId);

        let apiKey = 'YOUR_API_KEY_HERE';
        let webUrl = 'YOUR_WEBSITE_URL';

        if (website) {
            apiKey = website.websiteApiKey;
            webUrl = website.url;
        }

        // Update script snippet
        const scriptElement = document.getElementById('sdk-script');
        if (scriptElement && scriptElement.querySelector('code')) {
            scriptElement.querySelector('code').textContent = `<!-- Add this before the closing </body> tag -->
<script>
    const API_KEY = '${apiKey}';
    const BACKEND_URL = 'https://chat-backend-12wo.onrender.com';
    const WEBSITE_URL = '${webUrl}';
</script>
<script src="https://chat-fn.netlify.app/chatbot-sdk.js"></script>`;
        }

        // Update test page snippet
        const testPageElement = document.getElementById('test-page');
        if (testPageElement && testPageElement.querySelector('code')) {
            testPageElement.querySelector('code').textContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ChatFlow AI Test</title>
</head>
<body>
    <h1>Welcome to ChatFlow AI Test Page</h1>
    <p>This is a test page to verify ChatFlow AI SDK integration.</p>
    
    <!-- ChatFlow AI SDK -->
    <script>
        const API_KEY = '${apiKey}';
        const BACKEND_URL = 'https://chat-backend-12wo.onrender.com';
        const WEBSITE_URL = '${webUrl}';
    </script>
    <script src="https://chat-fn.netlify.app/chatbot-sdk.js"></script>
</body>
</html>`;
        }
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

        // Website selector change
        const websiteSelector = document.getElementById('config-website-selector');
        if (websiteSelector) {
            websiteSelector.addEventListener('change', () => {
                this.updateCodeSnippets();
            });
        }
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