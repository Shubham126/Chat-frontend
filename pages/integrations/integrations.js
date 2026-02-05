// Integrations Page - Website-Specific API Keys
const IntegrationsPage = {
    websites: [],
    currentRegenerateId: null,

    async init() {
        const container = document.getElementById('integrations-page');

        try {
            const response = await fetch('pages/integrations/integrations.html');
            const html = await response.text();
            container.innerHTML = html;

            // Load websites after HTML is loaded
            await this.loadWebsites();
        } catch (error) {
            console.error('Error loading integrations page:', error);
            container.innerHTML = '<div class="error">Failed to load integrations page</div>';
        }
    },

    async loadWebsites() {
        const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '192.168.1.11'
            ? 'http://localhost:3000/api'
            : 'https://chat-backend-12wo.onrender.com/api';

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                this.showError('No authentication token found. Please log in again.');
                this.showEmptyState();
                return;
            }

            this.showLoading();

            const response = await fetch(`${API_BASE_URL}/scrape/dashboard/files`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success && data.data && data.data.length > 0) {
                this.websites = data.data;
                this.displayWebsites(this.websites);
                // Show testing and troubleshooting sections
                this.showAdditionalSections();
            } else {
                this.showEmptyState();
            }
        } catch (error) {
            console.error('Error loading websites:', error);
            this.showError('Failed to load websites. Please try again.');
            this.showEmptyState();
        }
    },

    showAdditionalSections() {
        const testSection = document.getElementById('test-section');
        const troubleshootingSection = document.getElementById('troubleshooting-section');

        if (testSection) testSection.style.display = 'block';
        if (troubleshootingSection) troubleshootingSection.style.display = 'block';
    },

    displayWebsites(websitesList) {
        const grid = document.getElementById('websites-grid');
        const loading = document.getElementById('loading-state');
        const empty = document.getElementById('empty-state');

        if (!grid || !loading || !empty) return;

        loading.style.display = 'none';
        empty.style.display = 'none';
        grid.style.display = 'grid';
        grid.innerHTML = '';

        websitesList.forEach(website => {
            const card = this.createWebsiteCard(website);
            grid.appendChild(card);
        });
    },

    createWebsiteCard(website) {
        const card = document.createElement('div');
        card.className = 'website-card';

        const hasApiKey = website.websiteApiKey && website.websiteApiKey.length > 0;

        card.innerHTML = `
            <div class="website-card-header">
                <div class="website-icon">
                    <i class="ri-global-line"></i>
                </div>
                <div class="website-info">
                    <h3>${this.escapeHtml(website.displayName || website.title)}</h3>
                    <a href="${this.escapeHtml(website.url)}" target="_blank" class="website-url">
                        ${this.escapeHtml(website.url)}
                    </a>
                </div>
            </div>

            <div class="api-key-section">
                <label>API Key:</label>
                ${hasApiKey ? `
                    <div class="api-key-container">
                        <input 
                            type="password" 
                            class="api-key-input" 
                            value="${this.escapeHtml(website.websiteApiKey)}" 
                            readonly
                            id="api-key-${website.id}"
                        >
                        <button 
                            class="btn btn-icon" 
                            onclick="IntegrationsPage.toggleApiKeyVisibility('${website.id}')"
                            title="Show/Hide API Key"
                            id="toggle-${website.id}"
                        >
                            <i class="ri-eye-line"></i>
                        </button>
                        <button 
                            class="btn btn-icon btn-copy" 
                            onclick="IntegrationsPage.copyApiKey('${website.id}')"
                            title="Copy API Key"
                        >
                            <i class="ri-file-copy-line"></i>
                        </button>
                    </div>
                ` : `
                    <div class="api-key-missing">
                        <i class="ri-error-warning-line"></i>
                        <span>No API key generated</span>
                    </div>
                `}
            </div>

            <div class="card-actions">
                ${hasApiKey ? `
                    <button 
                        class="btn btn-primary" 
                        onclick="IntegrationsPage.showIntegrationCode('${website.id}', '${this.escapeHtml(website.websiteApiKey)}')"
                    >
                        <i class="ri-code-s-slash-line"></i>
                        View Integration Code
                    </button>
                    <button 
                        class="btn btn-secondary" 
                        onclick="IntegrationsPage.showRegenerateModal('${website.id}')"
                    >
                        <i class="ri-refresh-line"></i>
                        Regenerate Key
                    </button>
                ` : `
                    <button class="btn btn-secondary" disabled>
                        <i class="ri-alert-line"></i>
                        API Key Missing
                    </button>
                `}
            </div>
        `;

        return card;
    },

    toggleApiKeyVisibility(websiteId) {
        const input = document.getElementById(`api-key-${websiteId}`);
        const button = document.getElementById(`toggle-${websiteId}`);
        if (!input || !button) return;

        const icon = button.querySelector('i');

        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'ri-eye-off-line';
        } else {
            input.type = 'password';
            icon.className = 'ri-eye-line';
        }
    },

    async copyApiKey(websiteId) {
        const input = document.getElementById(`api-key-${websiteId}`);
        if (!input) return;

        const apiKey = input.value;

        try {
            await navigator.clipboard.writeText(apiKey);
            this.showSuccess('API key copied to clipboard!');
        } catch (error) {
            // Fallback for older browsers
            input.type = 'text';
            input.select();
            document.execCommand('copy');
            input.type = 'password';
            this.showSuccess('API key copied to clipboard!');
        }
    },

    showRegenerateModal(websiteId) {
        this.currentRegenerateId = websiteId;
        const modal = document.getElementById('confirm-regenerate-modal');
        if (!modal) return;

        modal.style.display = 'flex';

        // Bind confirm button
        const confirmBtn = document.getElementById('confirm-regenerate-btn');
        if (confirmBtn) {
            confirmBtn.onclick = () => this.regenerateApiKey(websiteId);
        }
    },

    closeRegenerateModal() {
        const modal = document.getElementById('confirm-regenerate-modal');
        if (!modal) return;

        modal.style.display = 'none';
        this.currentRegenerateId = null;
    },

    async regenerateApiKey(websiteId) {
        const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '192.168.1.11'
            ? 'http://localhost:3000/api'
            : 'https://chat-backend-12wo.onrender.com/api';

        try {
            this.closeRegenerateModal();
            this.showLoading();

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/scrape/files/${websiteId}/regenerate-key`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                this.showSuccess('API key regenerated successfully!');
                // Reload websites to show new key
                await this.loadWebsites();
            } else {
                this.showError(data.message || 'Failed to regenerate API key');
                this.hideLoading();
            }
        } catch (error) {
            console.error('Error regenerating API key:', error);
            this.showError('Failed to regenerate API key. Please try again.');
            this.hideLoading();
        }
    },

    showIntegrationCode(websiteId, apiKey) {
        const website = this.websites.find(w => w.id === websiteId);
        if (!website) return;

        const modal = document.getElementById('integration-modal');
        const codeElement = document.getElementById('integration-code');
        if (!modal || !codeElement) return;

        const codeBlock = codeElement.querySelector('code');
        if (!codeBlock) return;

        const sdkUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '192.168.1.11'
            ? 'http://localhost:8080/chatbot-sdk.js'
            : 'https://chat-sdk.netlify.app/chatbot-sdk.min.js';

        const integrationCode = `<!-- ChatFlow AI Chatbot for ${website.displayName || website.title} -->
<script 
  src="${sdkUrl}" 
  data-api-key="${apiKey}">
</script>`;

        codeBlock.textContent = integrationCode;
        modal.style.display = 'flex';
    },

    closeIntegrationModal() {
        const modal = document.getElementById('integration-modal');
        if (!modal) return;

        modal.style.display = 'none';
    },

    async copyIntegrationCode() {
        const codeElement = document.getElementById('integration-code');
        if (!codeElement) return;

        const codeBlock = codeElement.querySelector('code');
        if (!codeBlock) return;

        const code = codeBlock.textContent;

        try {
            await navigator.clipboard.writeText(code);
            this.showSuccess('Integration code copied to clipboard!');
        } catch (error) {
            this.showError('Failed to copy code');
        }
    },

    showLoading() {
        const loading = document.getElementById('loading-state');
        const empty = document.getElementById('empty-state');
        const grid = document.getElementById('websites-grid');

        if (loading) loading.style.display = 'flex';
        if (empty) empty.style.display = 'none';
        if (grid) grid.style.display = 'none';
    },

    hideLoading() {
        const loading = document.getElementById('loading-state');
        if (loading) loading.style.display = 'none';
    },

    showEmptyState() {
        const loading = document.getElementById('loading-state');
        const grid = document.getElementById('websites-grid');
        const empty = document.getElementById('empty-state');

        if (loading) loading.style.display = 'none';
        if (grid) grid.style.display = 'none';
        if (empty) empty.style.display = 'flex';
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    showSuccess(message) {
        alert(message);
    },

    showError(message) {
        alert(message);
    }
};

// Global function for accordion toggle
window.toggleAccordion = function (button) {
    const content = button.nextElementSibling;
    const isActive = button.classList.contains('active');

    // Close all accordions
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.classList.remove('active');
        header.nextElementSibling.classList.remove('active');
    });

    // Toggle current accordion
    if (!isActive) {
        button.classList.add('active');
        content.classList.add('active');
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.IntegrationsPage = IntegrationsPage;
}

// Make functions globally accessible for onclick handlers
window.IntegrationsPage = IntegrationsPage;
window.toggleApiKeyVisibility = (id) => IntegrationsPage.toggleApiKeyVisibility(id);
window.copyApiKey = (id) => IntegrationsPage.copyApiKey(id);
window.showRegenerateModal = (id) => IntegrationsPage.showRegenerateModal(id);
window.closeRegenerateModal = () => IntegrationsPage.closeRegenerateModal();
window.showIntegrationCode = (id, key) => IntegrationsPage.showIntegrationCode(id, key);
window.closeIntegrationModal = () => IntegrationsPage.closeIntegrationModal();
window.copyIntegrationCode = () => IntegrationsPage.copyIntegrationCode();
