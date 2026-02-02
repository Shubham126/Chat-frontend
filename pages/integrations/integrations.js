const IntegrationsPage = {
    currentApiKey: null,

    async init() {
        const container = document.getElementById('integrations-page');

        try {
            const response = await fetch('pages/integrations/integrations.html');
            const html = await response.text();
            container.innerHTML = html;

            // Wait for DOM to be ready before initializing
            setTimeout(async () => {
                // Initialize page functionality
                this.bindEvents();
                await this.loadApiKey();
                await this.loadAvailableWebsites();
                this.loadSavedThemeSelection();
            }, 50);

        } catch (error) {
            console.error('Error loading integrations page:', error);
            container.innerHTML = `
                <div class="error-container">
                    <div class="error-content">
                        <i class="ri-error-warning-line"></i>
                        <h2>Error Loading Page</h2>
                        <p>Unable to load the integrations page. Please try again.</p>
                    </div>
                </div>
            `;
        }
    },

    bindEvents() {
        // API Key management buttons
        const generateBtn = document.getElementById('generate-api-key-btn');
        const regenerateBtn = document.getElementById('regenerate-api-key-btn');
        const revokeBtn = document.getElementById('revoke-api-key-btn');
        const copyBtn = document.getElementById('copy-api-key');
        const toggleVisibilityBtn = document.getElementById('toggle-api-key-visibility');

        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateApiKey());
        }

        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => this.regenerateApiKey());
        }

        if (revokeBtn) {
            revokeBtn.addEventListener('click', () => this.revokeApiKey());
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyApiKey());
        }

        if (toggleVisibilityBtn) {
            toggleVisibilityBtn.addEventListener('click', () => this.toggleApiKeyVisibility());
        }

        // Website selector for integration
        const websiteSelector = document.getElementById('website-selector-integration');
        if (websiteSelector) {
            websiteSelector.addEventListener('change', () => {
                this.updateCodeExamples();
                this.updateApplyButtonState();
                this.saveWebsiteSelection(); // Save selection when changed
                this.handleWebsiteSelection(); // Handle theme-related changes
            });
        }

        // Theme card selection
        const themeCards = document.querySelectorAll('.theme-card');
        themeCards.forEach(card => {
            card.addEventListener('click', () => {
                // Remove selected class from all cards
                themeCards.forEach(c => c.classList.remove('selected'));
                // Add selected class to clicked card
                card.classList.add('selected');

                // Update apply button state
                this.updateThemeApplyButtonState();

                this.saveThemeSelection(card.dataset.theme);
            });
        });

        // Apply theme button
        const applyThemeBtn = document.getElementById('apply-theme-btn');
        if (applyThemeBtn) {
            applyThemeBtn.addEventListener('click', () => {
                this.applySelectedTheme();
            });
        }

        // Apply website configuration button
        const applyConfigBtn = document.getElementById('apply-website-config');
        if (applyConfigBtn) {
            applyConfigBtn.addEventListener('click', () => {
                this.applyWebsiteConfiguration();
            });
        }

        // Copy code buttons
        const copyCodeBtns = document.querySelectorAll('.copy-code');
        copyCodeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.closest('.copy-code').getAttribute('data-target');
                this.copyCode(target);
            });
        });

        // Troubleshooting accordion with smooth animations
        const troubleQuestions = document.querySelectorAll('.trouble-question');
        troubleQuestions.forEach(question => {
            const item = question.closest('.trouble-item');
            const answer = item.querySelector('.trouble-answer');
            const chevron = question.querySelector('.trouble-chevron');

            question.addEventListener('click', () => {
                const isOpen = item.classList.contains('open');

                // Close all other items
                document.querySelectorAll('.trouble-item').forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('open');
                    }
                });

                // Toggle current item
                if (!isOpen) {
                    item.classList.add('open');

                    // Add smooth scroll to bring the opened item into view
                    setTimeout(() => {
                        item.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest'
                        });
                    }, 100);
                } else {
                    item.classList.remove('open');
                }
            });

            // Add ripple effect on click
            question.addEventListener('click', function (e) {
                const ripple = document.createElement('div');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(59, 130, 246, 0.2);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: troubleRipple 0.6s linear;
                    pointer-events: none;
                    z-index: 1;
                `;

                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });

        // Add CSS for trouble ripple animation
        if (!document.querySelector('#trouble-ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'trouble-ripple-styles';
            style.textContent = `
                @keyframes troubleRipple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Add smooth scroll behavior and enhanced interactions
        this.initEnhancedInteractions();
    },

    async loadApiKey() {
        try {
            this.showLoading();

            // Use local backend IP
            const url = 'https://chat-backend-12wo.onrender.com/api/auth/api-key';
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                this.currentApiKey = data.apiKey;
                if (data.apiKey) {
                    this.showApiKey(data.apiKey);
                } else {
                    this.showNoApiKey();
                }
            } else {
                this.showError('Failed to load API key');
            }

        } catch (error) {
            console.error('Error loading API key:', error);
            this.showError('Error loading API key');
        }
    },

    async generateApiKey() {
        try {
            this.setButtonLoading('generate-api-key-btn', true);

            // Use local backend IP
            const url = 'https://chat-backend-12wo.onrender.com/api/auth/api-key/generate';
            const response = await fetch(url, {
                method: 'POST',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                this.currentApiKey = data.apiKey;
                this.showApiKey(data.apiKey);
                this.showAlert('API key generated successfully!', 'success');
            } else {
                this.showAlert(data.message || 'Failed to generate API key', 'error');
            }

        } catch (error) {
            console.error('Error generating API key:', error);
            this.showAlert('Error generating API key', 'error');
        } finally {
            this.setButtonLoading('generate-api-key-btn', false);
        }
    },

    async regenerateApiKey() {
        if (!confirm('Are you sure you want to regenerate your API key? This will invalidate your current key and may break existing integrations.')) {
            return;
        }

        try {
            this.setButtonLoading('regenerate-api-key-btn', true);

            // Use local backend IP
            const url = 'https://chat-backend-12wo.onrender.com/api/auth/api-key/generate';
            const response = await fetch(url, {
                method: 'POST',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                this.currentApiKey = data.apiKey;
                this.showApiKey(data.apiKey);
                this.showAlert('API key regenerated successfully!', 'success');
            } else {
                this.showAlert(data.message || 'Failed to regenerate API key', 'error');
            }

        } catch (error) {
            console.error('Error regenerating API key:', error);
            this.showAlert('Error regenerating API key', 'error');
        } finally {
            this.setButtonLoading('regenerate-api-key-btn', false);
        }
    },

    async revokeApiKey() {
        if (!confirm('Are you sure you want to revoke your API key? This will disable all existing integrations using this key.')) {
            return;
        }

        try {
            this.setButtonLoading('revoke-api-key-btn', true);

            // Use local backend IP
            const url = 'https://chat-backend-12wo.onrender.com/api/auth/api-key';
            const response = await fetch(url, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                this.currentApiKey = null;
                this.showNoApiKey();
                this.showAlert('API key revoked successfully', 'success');
            } else {
                this.showAlert(data.message || 'Failed to revoke API key', 'error');
            }

        } catch (error) {
            console.error('Error revoking API key:', error);
            this.showAlert('Error revoking API key', 'error');
        } finally {
            this.setButtonLoading('revoke-api-key-btn', false);
        }
    },

    copyApiKey() {
        if (!this.currentApiKey) return;

        const copyBtn = document.getElementById('copy-api-key');
        const icon = copyBtn.querySelector('i');
        const originalIcon = icon.className;

        // Use modern clipboard API if available
        if (navigator.clipboard) {
            navigator.clipboard.writeText(this.currentApiKey).then(() => {
                this.showCopySuccess(copyBtn, icon, originalIcon);
            }).catch(() => {
                this.fallbackCopy(copyBtn, icon, originalIcon);
            });
        } else {
            this.fallbackCopy(copyBtn, icon, originalIcon);
        }
    },

    fallbackCopy(copyBtn, icon, originalIcon) {
        const apiKeyInput = document.getElementById('api-key-value');
        apiKeyInput.select();
        document.execCommand('copy');
        this.showCopySuccess(copyBtn, icon, originalIcon);
    },

    showCopySuccess(copyBtn, icon, originalIcon) {
        this.showAlert('API key copied to clipboard!', 'success');

        // Animate button
        copyBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            icon.className = 'ri-check-line';
            copyBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            copyBtn.style.color = 'white';
            copyBtn.style.transform = 'scale(1)';
            copyBtn.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
        }, 100);

        setTimeout(() => {
            icon.className = originalIcon;
            copyBtn.style.background = '';
            copyBtn.style.color = '';
            copyBtn.style.boxShadow = '';
        }, 2000);
    },

    toggleApiKeyVisibility() {
        const input = document.getElementById('api-key-value');
        const icon = document.querySelector('#toggle-api-key-visibility i');

        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'ri-eye-off-line';
        } else {
            input.type = 'password';
            icon.className = 'ri-eye-line';
        }
    },

    copyCode(targetId) {
        const element = document.getElementById(targetId);
        if (!element) return;

        const text = element.textContent;
        const copyBtn = event.target.closest('.copy-code');

        // Use modern clipboard API if available
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showCodeCopySuccess(copyBtn);
            }).catch(() => {
                this.fallbackCodeCopy(text, copyBtn);
            });
        } else {
            this.fallbackCodeCopy(text, copyBtn);
        }
    },

    fallbackCodeCopy(text, btn) {
        // Create temporary textarea for fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this.showCodeCopySuccess(btn);
    },

    showCodeCopySuccess(btn) {
        const originalIcon = btn.innerHTML;

        // Animate button with ripple effect
        btn.style.transform = 'scale(0.95)';
        btn.style.transition = 'all 0.2s ease';

        setTimeout(() => {
            btn.innerHTML = '<i class="ri-check-line"></i>';
            btn.style.background = 'rgba(16, 185, 129, 0.3)';
            btn.style.color = '#10b981';
            btn.style.transform = 'scale(1.05)';
            btn.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.3)';
        }, 100);

        setTimeout(() => {
            btn.innerHTML = originalIcon;
            btn.style.background = '';
            btn.style.color = '';
            btn.style.transform = 'scale(1)';
            btn.style.boxShadow = '';
        }, 2000);

        this.showAlert('Code copied to clipboard!', 'success');
    },

    showLoading() {
        const loadingEl = document.getElementById('api-key-loading');
        const noKeyEl = document.getElementById('no-api-key');
        const hasKeyEl = document.getElementById('has-api-key');

        // Check if elements exist before accessing them
        if (!loadingEl || !noKeyEl || !hasKeyEl) {
            console.warn('API key elements not found in DOM');
            return;
        }

        // Fade out existing content
        if (noKeyEl.style.display !== 'none') {
            noKeyEl.style.opacity = '0';
            setTimeout(() => {
                noKeyEl.style.display = 'none';
                loadingEl.style.display = 'flex';
                loadingEl.style.opacity = '0';
                setTimeout(() => loadingEl.style.opacity = '1', 50);
            }, 300);
        } else if (hasKeyEl.style.display !== 'none') {
            hasKeyEl.style.opacity = '0';
            setTimeout(() => {
                hasKeyEl.style.display = 'none';
                loadingEl.style.display = 'flex';
                loadingEl.style.opacity = '0';
                setTimeout(() => loadingEl.style.opacity = '1', 50);
            }, 300);
        } else {
            loadingEl.style.display = 'flex';
            loadingEl.style.opacity = '0';
            setTimeout(() => loadingEl.style.opacity = '1', 50);
        }
    },

    showNoApiKey() {
        const loadingEl = document.getElementById('api-key-loading');
        const noKeyEl = document.getElementById('no-api-key');
        const hasKeyEl = document.getElementById('has-api-key');

        // Fade out loading
        loadingEl.style.opacity = '0';
        hasKeyEl.style.display = 'none';

        setTimeout(() => {
            loadingEl.style.display = 'none';
            noKeyEl.style.display = 'block';
            noKeyEl.style.opacity = '0';
            noKeyEl.style.transform = 'translateY(20px)';

            setTimeout(() => {
                noKeyEl.style.opacity = '1';
                noKeyEl.style.transform = 'translateY(0)';
            }, 50);
        }, 300);

        // Update code examples with generic placeholder
        this.updateCodeExamples();
    },

    showApiKey(apiKey) {
        const loadingEl = document.getElementById('api-key-loading');
        const noKeyEl = document.getElementById('no-api-key');
        const hasKeyEl = document.getElementById('has-api-key');

        // Fade out current content
        loadingEl.style.opacity = '0';
        noKeyEl.style.display = 'none';

        setTimeout(() => {
            loadingEl.style.display = 'none';
            hasKeyEl.style.display = 'block';
            hasKeyEl.style.opacity = '0';
            hasKeyEl.style.transform = 'translateY(20px)';

            const input = document.getElementById('api-key-value');
            if (input) {
                input.value = apiKey;
            }

            // Update code examples with generic placeholder
            this.updateCodeExamples();

            setTimeout(() => {
                hasKeyEl.style.opacity = '1';
                hasKeyEl.style.transform = 'translateY(0)';
            }, 50);
        }, 300);
    },

    updateCodeExamples(apiKey) {
        const sdkScript = document.getElementById('sdk-script');
        if (sdkScript) {
            const currentDomain = window.location.origin;
            // Always show generic placeholder for better user experience
            sdkScript.innerHTML = `<code>&lt;script src="${currentDomain}/chatbot-sdk.js" data-api-key="YOUR_API_KEY_HERE"&gt;&lt;/script&gt;</code>`;
        }
    },

    showError(message) {
        const loadingEl = document.getElementById('api-key-loading');
        const noKeyEl = document.getElementById('no-api-key');
        const hasKeyEl = document.getElementById('has-api-key');
        const statusDiv = document.getElementById('api-key-status');

        // Check if elements exist
        if (!loadingEl || !noKeyEl || !hasKeyEl || !statusDiv) {
            console.error('API key elements not found in DOM');
            return;
        }

        loadingEl.style.display = 'none';
        noKeyEl.style.display = 'none';
        hasKeyEl.style.display = 'none';

        // Show error state
        statusDiv.innerHTML = `
            <div class="error-state">
                <i class="ri-error-warning-line"></i>
                <h3>Error</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="IntegrationsPage.loadApiKey()">
                    <i class="ri-refresh-line"></i>
                    Retry
                </button>
            </div>
        `;
    },

    setButtonLoading(buttonId, loading) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        if (loading) {
            button.disabled = true;
            const icon = button.querySelector('i');
            if (icon) {
                icon.className = 'ri-loader-4-line';
                icon.style.animation = 'spin 1s linear infinite';
            }
        } else {
            button.disabled = false;
            const icon = button.querySelector('i');
            if (icon) {
                icon.style.animation = '';
                // Restore original icon based on button
                if (buttonId === 'generate-api-key-btn') {
                    icon.className = 'ri-add-line';
                } else if (buttonId === 'regenerate-api-key-btn') {
                    icon.className = 'ri-refresh-line';
                } else if (buttonId === 'revoke-api-key-btn') {
                    icon.className = 'ri-delete-bin-line';
                } else if (buttonId === 'apply-website-config') {
                    icon.className = 'ri-check-line';
                }
            }
        }
    },

    showAlert(message, type = 'info') {
        // Remove existing alerts with fade out
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => {
            alert.style.opacity = '0';
            alert.style.transform = 'translateY(-20px)';
            setTimeout(() => alert.remove(), 300);
        });

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;

        const icon = type === 'success' ? 'ri-check-circle-line' :
            type === 'error' ? 'ri-error-warning-line' : 'ri-information-line';

        alert.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
            <button class="alert-close" onclick="this.parentElement.remove()" style="
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                padding: 0;
                margin-left: auto;
                font-size: 1.2rem;
                opacity: 0.7;
                transition: opacity 0.2s;
            ">
                <i class="ri-close-line"></i>
            </button>
        `;

        // Add hover effect to close button
        const closeBtn = alert.querySelector('.alert-close');
        closeBtn.addEventListener('mouseenter', () => closeBtn.style.opacity = '1');
        closeBtn.addEventListener('mouseleave', () => closeBtn.style.opacity = '0.7');

        const container = document.querySelector('.integrations-container');
        container.insertBefore(alert, container.firstChild);

        // Initial animation
        alert.style.opacity = '0';
        alert.style.transform = 'translateY(-30px) scale(0.95)';

        setTimeout(() => {
            alert.style.opacity = '1';
            alert.style.transform = 'translateY(0) scale(1)';
        }, 50);

        // Auto remove after 6 seconds with enhanced animation
        setTimeout(() => {
            if (alert.parentNode) {
                alert.style.opacity = '0';
                alert.style.transform = 'translateY(-20px) scale(0.95)';
                setTimeout(() => alert.remove(), 400);
            }
        }, 6000);
    },

    initEnhancedInteractions() {
        // Add smooth scroll to anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
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

        // Add intersection observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe sections for fade-in effect
        document.querySelectorAll('.section').forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(section);
        });

        // Add ripple effect to buttons
        document.querySelectorAll('.btn, .icon-btn').forEach(button => {
            button.addEventListener('click', function (e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                `;

                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });

        // Add CSS for ripple animation
        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Add loading animation to page
        document.body.style.opacity = '0';
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.5s ease';
            document.body.style.opacity = '1';
        }, 100);
    },

    async loadAvailableWebsites() {
        try {
            // Use Render backend
            const url = 'https://chat-backend-12wo.onrender.com/api/scrape/dashboard/files';
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success && data.data.length > 0) {
                this.populateWebsiteSelector(data.data);
                this.loadSavedWebsiteSelection(); // Load saved selection after populating
            } else {
                this.showNoWebsitesMessage();
            }

        } catch (error) {
            console.error('Error loading websites:', error);
            this.showNoWebsitesMessage();
        }
    },

    populateWebsiteSelector(websites) {
        const selector = document.getElementById('website-selector-integration');
        if (!selector) return;

        // Clear existing options
        selector.innerHTML = '<option value="">Select a website...</option>';

        // Store website data for theme extraction
        this.websiteData = {};

        // Add website options
        websites.forEach(site => {
            const option = document.createElement('option');
            option.value = site.url || site.id;
            option.setAttribute('data-site-id', site.id);

            // Store full site data for theme access
            this.websiteData[site.id] = site;

            // Create a meaningful display name
            let displayName = site.displayName || site.fileName;
            if (site.scrapedData && site.scrapedData.title) {
                displayName = site.scrapedData.title;
                if (displayName.length > 50) {
                    displayName = displayName.substring(0, 50) + '...';
                }
            }

            option.textContent = displayName;
            selector.appendChild(option);
        });

        // Update code examples after loading
        this.updateCodeExamples();
        this.updateApplyButtonState(); // Initialize button state
    },

    showNoWebsitesMessage() {
        const selector = document.getElementById('website-selector-integration');
        if (!selector) return;

        selector.innerHTML = '<option value="">No scraped websites available</option>';
        selector.disabled = true;
    },

    applyWebsiteConfiguration() {
        const websiteSelector = document.getElementById('website-selector-integration');
        const applyBtn = document.getElementById('apply-website-config');

        if (!websiteSelector || !websiteSelector.value) {
            this.showAlert('Please select a website first', 'error');
            return;
        }

        try {
            // Set button loading state
            this.setButtonLoading('apply-website-config', true);

            // Save the applied website configuration
            localStorage.setItem('chatflow-applied-website', websiteSelector.value);

            // Reset to default theme and apply it
            this.resetThemeToDefault();

            // Save applied theme to localStorage
            localStorage.setItem('chatflow-applied-theme', 'default');

            // Save integration settings with default theme
            const selectedWebsiteOption = websiteSelector.options[websiteSelector.selectedIndex];
            this.saveIntegrationSettings({
                selectedWebsiteId: selectedWebsiteOption.getAttribute('data-site-id'),
                selectedWebsiteUrl: selectedWebsiteOption.value,
                themeChoice: 'default'
            });

            // Update code examples with selected website and default theme
            this.updateCodeExamples('default');

            // Show success message
            setTimeout(() => {
                this.showAlert('Website configuration applied with default theme!', 'success');
                this.setButtonLoading('apply-website-config', false);
                // Keep the website selected and mark as applied
                this.setApplyButtonApplied();
                // Update theme button state to show applied
                this.updateThemeApplyButtonState();
            }, 500);

        } catch (error) {
            console.error('Error applying website configuration:', error);
            this.showAlert('Error applying configuration', 'error');
            this.setButtonLoading('apply-website-config', false);
        }
    },

    updateCodeExamples(selectedTheme = null) {
        const sdkScript = document.getElementById('sdk-script');
        const testHtml = document.getElementById('test-html');
        if (!sdkScript) return;

        const currentDomain = window.location.origin;
        const websiteSelector = document.getElementById('website-selector-integration');
        const selectedWebsite = websiteSelector?.value || '';

        // Use provided theme or get from localStorage or default
        const theme = selectedTheme || localStorage.getItem('chatflow-selected-theme') || 'default';

        let scriptAttributes = `src="${currentDomain}/chatbot-sdk.js" data-api-key="YOUR_API_KEY_HERE"`;

        // Add preselected website if one is selected
        if (selectedWebsite) {
            scriptAttributes += ` data-preselected-site="${selectedWebsite}"`;
        }

        // Always add theme selection
        if (theme === 'website') {
            scriptAttributes += ` data-theme="website"`;
        } else {
            scriptAttributes += ` data-theme="default"`;
        }

        // Update the SDK script code block
        sdkScript.innerHTML = `<code>&lt;script ${scriptAttributes}&gt;&lt;/script&gt;</code>`;

        // Update the test HTML code block
        if (testHtml) {
            const testHtmlContent = `&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
&lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;
    &lt;title&gt;ChatFlow AI Test&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;h1&gt;Welcome to ChatFlow AI Test Page&lt;/h1&gt;
    &lt;p&gt;This is a test page to verify ChatFlow AI SDK integration.&lt;/p&gt;
    
    &lt;!-- ChatFlow AI SDK --&gt;
    &lt;script ${scriptAttributes}&gt;&lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;`;

            testHtml.innerHTML = `<code>${testHtmlContent}</code>`;
        }
    },

    // Save selected website to localStorage
    saveWebsiteSelection() {
        const websiteSelector = document.getElementById('website-selector-integration');
        if (websiteSelector && websiteSelector.value) {
            localStorage.setItem('chatflow-selected-website', websiteSelector.value);
        } else {
            localStorage.removeItem('chatflow-selected-website');
        }
    },

    // Load saved website selection from localStorage
    loadSavedWebsiteSelection() {
        const savedWebsite = localStorage.getItem('chatflow-selected-website');
        const appliedWebsite = localStorage.getItem('chatflow-applied-website');
        const websiteSelector = document.getElementById('website-selector-integration');

        if (savedWebsite && websiteSelector) {
            // Check if the saved website still exists in the options
            const option = Array.from(websiteSelector.options).find(opt => opt.value === savedWebsite);
            if (option) {
                websiteSelector.value = savedWebsite;
                this.updateCodeExamples();
                this.updateApplyButtonState();
                this.handleWebsiteSelection(); // Handle theme updates
            } else {
                // Website no longer exists - reset everything
                this.handleDeletedWebsite(savedWebsite);
            }
        }

        // Also check if applied website still exists
        if (appliedWebsite && websiteSelector) {
            const appliedOption = Array.from(websiteSelector.options).find(opt => opt.value === appliedWebsite);
            if (!appliedOption) {
                // Applied website was deleted - reset to default
                this.handleDeletedWebsite(appliedWebsite);
            }
        }
    },

    // Handle when a selected/applied website gets deleted
    handleDeletedWebsite(deletedWebsiteUrl) {
        console.log('Handling deleted website:', deletedWebsiteUrl);

        // Clear all website-related localStorage
        localStorage.removeItem('chatflow-selected-website');
        localStorage.removeItem('chatflow-applied-website');
        localStorage.removeItem('chatflow-applied-theme');
        localStorage.removeItem('chatflow-selected-theme');

        // Reset website selector to default
        const websiteSelector = document.getElementById('website-selector-integration');
        if (websiteSelector) {
            websiteSelector.value = '';
        }

        // Reset theme to default
        this.resetThemeToDefault();

        // Hide theme selection area
        const themeSelectionArea = document.getElementById('theme-selection-area');
        if (themeSelectionArea) {
            themeSelectionArea.style.display = 'none';
        }

        // Update UI states
        this.updateApplyButtonState();
        this.updateThemeApplyButtonState();
        this.updateCodeExamples();

        // Show notification about the reset
        this.showAlert('Selected website was deleted. Configuration reset to default.', 'info');
    },

    // Update apply button color based on selection state
    updateApplyButtonState() {
        const websiteSelector = document.getElementById('website-selector-integration');
        const applyBtn = document.getElementById('apply-website-config');

        if (!applyBtn) return;

        const selectedWebsite = websiteSelector && websiteSelector.value ? websiteSelector.value : '';
        const appliedWebsite = localStorage.getItem('chatflow-applied-website');

        // Remove existing color classes and applied state
        applyBtn.classList.remove('btn-success', 'btn-primary', 'applied');

        if (selectedWebsite) {
            if (selectedWebsite === appliedWebsite) {
                // Same website is already applied - keep green
                applyBtn.classList.add('btn-success', 'applied');
                applyBtn.innerHTML = '<i class="ri-check-line"></i> Applied';
                applyBtn.title = 'Configuration applied successfully';
            } else {
                // Different website selected - make button blue
                applyBtn.classList.add('btn-primary');
                applyBtn.innerHTML = '<i class="ri-check-line"></i> Apply Configuration';
                applyBtn.title = 'Apply website configuration';
            }
            applyBtn.disabled = false;
        } else {
            // Disabled state when no selection
            applyBtn.classList.add('btn-primary');
            applyBtn.title = 'Please select a website first';
            applyBtn.innerHTML = '<i class="ri-check-line"></i> Apply Configuration';
        }
    },

    updateThemeApplyButtonState() {
        const selectedCard = document.querySelector('.theme-card.selected');
        const applyBtn = document.getElementById('apply-theme-btn');

        if (!applyBtn) return;

        if (!selectedCard) {
            // No theme selected - disable button
            applyBtn.innerHTML = '<i class="ri-palette-line"></i> Apply Theme';
            applyBtn.style.background = '#6b7280';
            applyBtn.disabled = true;
            return;
        }

        const selectedTheme = selectedCard.dataset.theme;
        const appliedTheme = localStorage.getItem('chatflow-applied-theme');

        if (selectedTheme === appliedTheme) {
            // Theme is already applied - show green "Applied" state
            applyBtn.innerHTML = '<i class="ri-check-line"></i> Applied';
            applyBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            applyBtn.disabled = false;
        } else {
            // Theme selected but not applied - show blue "Apply" state
            applyBtn.innerHTML = '<i class="ri-palette-line"></i> Apply Theme';
            applyBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            applyBtn.disabled = false;
        }
    },

    // Set apply button to applied state (green)
    setApplyButtonApplied() {
        const applyBtn = document.getElementById('apply-website-config');
        if (!applyBtn) return;

        // Remove primary class and add success class
        applyBtn.classList.remove('btn-primary');
        applyBtn.classList.add('btn-success', 'applied');
        applyBtn.innerHTML = '<i class="ri-check-line"></i> Applied';
        applyBtn.title = 'Configuration applied successfully';
    },

    // Reset theme selection to default
    resetThemeToDefault() {
        // Remove selected class from all theme cards
        const themeCards = document.querySelectorAll('.theme-card');
        themeCards.forEach(card => card.classList.remove('selected'));

        // Select the default theme card
        const defaultThemeCard = document.querySelector('.theme-card[data-theme="default"]');
        if (defaultThemeCard) {
            defaultThemeCard.classList.add('selected');
        }

        // Save default theme selection
        this.saveThemeSelection('default');

        // Update code examples with default theme
        this.updateCodeExamples('default');
    },

    // Handle website selection - show/hide theme options and update theme preview
    handleWebsiteSelection() {
        const websiteSelector = document.getElementById('website-selector-integration');
        const themeSelectionArea = document.getElementById('theme-selection-area');
        const themeExtractionInfo = document.getElementById('theme-extraction-info');

        if (!websiteSelector || !themeSelectionArea) return;

        const selectedValue = websiteSelector.value;

        if (selectedValue) {
            // Show theme selection area
            themeSelectionArea.style.display = 'block';

            // Get selected website data
            const selectedOption = websiteSelector.options[websiteSelector.selectedIndex];
            const siteId = selectedOption.getAttribute('data-site-id');
            const siteData = this.websiteData[siteId];

            console.log('Selected website data:', siteData);
            console.log('Theme data:', siteData?.theme);

            if (siteData && siteData.theme && siteData.theme.colors && Object.keys(siteData.theme.colors).length > 0) {
                console.log('Updating theme preview with colors:', siteData.theme.colors);
                this.updateThemePreview(siteData.theme);
                this.showThemeExtractionInfo(siteData.displayName || siteData.fileName);
            } else {
                console.log('No theme data available - showing default info');
                console.log('Theme check details:', {
                    hasSiteData: !!siteData,
                    hasTheme: !!(siteData && siteData.theme),
                    hasColors: !!(siteData && siteData.theme && siteData.theme.colors),
                    colorCount: siteData && siteData.theme && siteData.theme.colors ? Object.keys(siteData.theme.colors).length : 0
                });
                this.showNoThemeInfo();
            }
        } else {
            // Hide theme selection area
            themeSelectionArea.style.display = 'none';
            themeExtractionInfo.style.display = 'none';
        }
    },

    // Update the website theme preview with actual colors
    updateThemePreview(theme) {
        const websiteThemePreview = document.getElementById('website-theme-preview');
        const themeColorsPreview = document.getElementById('theme-colors-preview');
        const themeStatusBadge = document.getElementById('theme-status-badge');
        const themeExtractionStatus = document.getElementById('theme-extraction-status');

        if (!websiteThemePreview || !theme || !theme.colors) return;

        const colors = theme.colors;

        // Update theme preview colors
        const style = document.createElement('style');
        style.textContent = `
            #website-theme-preview .theme-preview-header {
                background: linear-gradient(135deg, ${colors.primary || '#007bff'} 0%, ${this.darkenColor(colors.primary || '#007bff', 20)} 100%) !important;
            }
            #website-theme-preview .theme-preview-content {
                background: ${colors.background || '#ffffff'} !important;
            }
            #website-theme-preview .theme-preview-bubble.user {
                background: ${colors.primary || '#007bff'} !important;
            }
            #website-theme-preview .theme-preview-bubble.bot {
                background: ${colors.secondary || '#f8f9fa'} !important;
                color: ${colors.text || '#333333'} !important;
            }
            #website-theme-preview .send-button {
                background: ${colors.primary || '#007bff'} !important;
            }
        `;

        // Remove existing style and add new one
        const existingStyle = document.getElementById('dynamic-theme-preview-style');
        if (existingStyle) {
            existingStyle.remove();
        }
        style.id = 'dynamic-theme-preview-style';
        document.head.appendChild(style);

        // Update status badge
        if (themeStatusBadge) {
            themeStatusBadge.textContent = 'Extracted';
            themeStatusBadge.style.background = 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)';
            themeStatusBadge.style.color = '#166534';
        }

        // Update extraction status
        if (themeExtractionStatus) {
            themeExtractionStatus.innerHTML = '<span class="status-text">✓ Theme colors extracted and ready to use</span>';
        }

        // Update color swatches with extracted theme data and text display
        if (themeColorsPreview) {
            themeColorsPreview.innerHTML = '';
            const colorKeys = ['primary', 'secondary', 'background', 'text', 'border'];

            let hasColors = false;

            // First, process main color keys
            colorKeys.forEach(key => {
                if (colors[key]) {
                    hasColors = true;

                    // Create a container for this color item (dot + text)
                    const colorItem = document.createElement('div');
                    colorItem.style.display = 'flex';
                    colorItem.style.alignItems = 'center';
                    colorItem.style.marginBottom = '4px';
                    colorItem.style.fontSize = '0.85rem';
                    colorItem.style.width = '100%';
                    colorItem.style.clear = 'both';

                    // Create color dot
                    const colorDiv = document.createElement('div');
                    colorDiv.className = 'color-dot';
                    colorDiv.style.backgroundColor = colors[key];
                    colorDiv.style.marginRight = '8px';
                    colorDiv.style.flexShrink = '0';
                    colorDiv.title = `${key.charAt(0).toUpperCase() + key.slice(1)}: ${colors[key]}`;

                    // Create text description
                    const colorText = document.createElement('span');
                    colorText.style.color = '#64748b';
                    colorText.innerHTML = `<strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${colors[key]}`;

                    // Add dot and text to the item container
                    colorItem.appendChild(colorDiv);
                    colorItem.appendChild(colorText);

                    // Add the complete item to the preview
                    themeColorsPreview.appendChild(colorItem);
                }
            });

            // Then, process additional colors that were extracted
            const additionalColors = ['button', 'link', 'accent'];
            additionalColors.forEach(key => {
                if (colors[key] && !colorKeys.includes(key)) {
                    hasColors = true;

                    // Create a container for this color item (dot + text)
                    const colorItem = document.createElement('div');
                    colorItem.style.display = 'flex';
                    colorItem.style.alignItems = 'center';
                    colorItem.style.marginBottom = '4px';
                    colorItem.style.fontSize = '0.85rem';
                    colorItem.style.width = '100%';
                    colorItem.style.clear = 'both';

                    // Create color dot
                    const colorDiv = document.createElement('div');
                    colorDiv.className = 'color-dot';
                    colorDiv.style.backgroundColor = colors[key];
                    colorDiv.style.marginRight = '8px';
                    colorDiv.style.flexShrink = '0';
                    colorDiv.title = `${key.charAt(0).toUpperCase() + key.slice(1)}: ${colors[key]}`;

                    // Create text description
                    const colorText = document.createElement('span');
                    colorText.style.color = '#64748b';
                    colorText.innerHTML = `<strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${colors[key]}`;

                    // Add dot and text to the item container
                    colorItem.appendChild(colorDiv);
                    colorItem.appendChild(colorText);

                    // Add the complete item to the preview
                    themeColorsPreview.appendChild(colorItem);
                }
            });
        }
    },

    // Show theme extraction success info
    showThemeExtractionInfo(siteName) {
        const themeExtractionInfo = document.getElementById('theme-extraction-info');
        const extractedWebsiteName = document.getElementById('extracted-website-name');

        if (themeExtractionInfo) {
            themeExtractionInfo.style.display = 'block';
            if (extractedWebsiteName) {
                extractedWebsiteName.textContent = siteName;
            }
        }
    },

    // Save theme selection to localStorage
    saveThemeSelection(theme) {
        if (theme) {
            localStorage.setItem('chatflow-selected-theme', theme);
        }
    },

    // Load saved theme selection
    loadSavedThemeSelection() {
        const savedTheme = localStorage.getItem('chatflow-selected-theme') || 'default';
        const themeCard = document.querySelector(`.theme-card[data-theme="${savedTheme}"]`);
        if (themeCard) {
            // Remove selected class from all cards
            document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('selected'));
            // Select the saved theme card
            themeCard.classList.add('selected');

            // Update apply button state
            this.updateThemeApplyButtonState();
        }
    },

    // Apply selected theme and update code examples
    async applySelectedTheme() {
        const selectedCard = document.querySelector('.theme-card.selected');
        if (!selectedCard) return;

        const selectedTheme = selectedCard.dataset.theme;
        const websiteSelector = document.getElementById('website-selector-integration');
        const selectedWebsiteOption = websiteSelector.options[websiteSelector.selectedIndex];

        if (!selectedWebsiteOption || !selectedWebsiteOption.value) {
            this.showAlert('Please select a website first', 'error');
            return;
        }

        try {
            // Save integration settings to database
            await this.saveIntegrationSettings({
                selectedWebsiteId: selectedWebsiteOption.getAttribute('data-site-id'),
                selectedWebsiteUrl: selectedWebsiteOption.value,
                themeChoice: selectedTheme
            });

            // Save applied theme to localStorage
            localStorage.setItem('chatflow-applied-theme', selectedTheme);

            // Update code examples with selected theme
            this.updateCodeExamples(selectedTheme);

            // Show success message and update button state
            this.showThemeAppliedMessage(selectedTheme);

            // Scroll to code examples
            const codeSection = document.querySelector('.integration-section');
            if (codeSection) {
                codeSection.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (error) {
            console.error('Failed to save integration settings:', error);
            this.showAlert('Failed to save settings. Please try again.', 'error');
        }
    },

    // Save integration settings to database
    async saveIntegrationSettings(settings) {
        const response = await fetch('/api/scrape/dashboard/integration-settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(settings)
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to save settings');
        }

        console.log('✅ Integration settings saved:', data.data);
        return data.data;
    },

    // Show theme applied success message
    showThemeAppliedMessage(theme) {
        const applyBtn = document.getElementById('apply-theme-btn');
        if (!applyBtn) return;

        // Show temporary success message
        const originalText = applyBtn.innerHTML;
        applyBtn.innerHTML = '<i class="ri-check-line"></i> Theme Applied!';
        applyBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

        setTimeout(() => {
            // Update to permanent applied state instead of reverting
            this.updateThemeApplyButtonState();
        }, 2000);
    },

    // Helper function to darken a color
    darkenColor(color, percent) {
        if (!color || !color.startsWith('#')) return color;

        const hex = color.slice(1);
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        const factor = (100 - percent) / 100;
        const newR = Math.round(r * factor);
        const newG = Math.round(g * factor);
        const newB = Math.round(b * factor);

        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
};
