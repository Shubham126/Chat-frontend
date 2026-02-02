const DashboardPage = {
    async init() {
        const container = document.getElementById('dashboard-page');
        
        try {
            const response = await fetch('pages/dashboard/dashboard.html');
            const html = await response.text();
            container.innerHTML = html;
            
            // Show empty state immediately
            this.showEmptyState();
            
            this.bindEvents();
            this.loadHistory();
            
            // Listen for state changes
            DashboardState.addListener(this.handleStateChange.bind(this));
        } catch (error) {
            console.error('Error loading dashboard page:', error);
            container.innerHTML = '<div class="error">Failed to load dashboard</div>';
        }
    },

    showEmptyState() {
        const historyContent = document.getElementById('history-content');
        if (historyContent) {
            historyContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-content">
                        <div class="empty-state-icon">📁</div>
                        <div class="empty-state-title">No Scraped Websites</div>
                        <div class="empty-state-subtitle">Get started by scraping your first website above</div>
                        <div class="empty-state-steps">
                            <div class="empty-state-step">
                                <div class="empty-state-step-icon">🌐</div>
                                <div class="empty-state-step-text">Enter any website URL above</div>
                            </div>
                            <div class="empty-state-step">
                                <div class="empty-state-step-icon">🚀</div>
                                <div class="empty-state-step-text">Click "Scrape" to analyze the content</div>
                            </div>
                            <div class="empty-state-step">
                                <div class="empty-state-step-icon">💬</div>
                                <div class="empty-state-step-text">Start chatting about the website</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    bindEvents() {
        const scrapeBtn = document.getElementById('scrape-btn');
        const refreshBtn = document.getElementById('refresh-history');
        const urlInput = document.getElementById('url-input');
        const scrapeForm = document.getElementById('scrape-form');

        // Chat-related elements
        const openChatBtn = document.getElementById('open-chat');
        const closeChatBtn = document.getElementById('close-chat');
        const websiteSelector = document.getElementById('website-selector');
        const chatForm = document.getElementById('chat-form');
        const chatInput = document.getElementById('chat-input');

        // Prevent form submission
        if (scrapeForm) {
            scrapeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleScrape(e);
            });
        }

        if (scrapeBtn) {
            scrapeBtn.addEventListener('click', this.handleScrape.bind(this));
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', this.loadHistory.bind(this));
        }

        // Allow Enter key to submit
        if (urlInput) {
            urlInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleScrape(e);
                }
            });
        }

        // Chat event handlers - removed toggle functionality since chat is always visible
        if (websiteSelector) {
            websiteSelector.addEventListener('change', this.onWebsiteSelect.bind(this));
        }

        if (chatForm) {
            chatForm.addEventListener('submit', this.handleChatMessage.bind(this));
        }



        if (chatInput) {
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleChatMessage(e);
                }
            });
        }
    },

    async handleScrape(event) {
        // Prevent any form submission behavior
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const urlInput = document.getElementById('url-input');
        const scrapeBtn = document.getElementById('scrape-btn');
        
        if (!urlInput || !scrapeBtn) return;

        const url = urlInput.value.trim();

        if (!url) {
            alert('Please enter a URL');
            return;
        }

        try {
            // Disable input and add loading animation
            urlInput.disabled = true;
            scrapeBtn.disabled = true;
            scrapeBtn.classList.add('loading');
            DashboardState.setLoading(true);
            
            const result = await ScrapeAPI.scrapeAndSaveForDashboard(url);
            
            // Remove loading and add success animation
            scrapeBtn.classList.remove('loading');
            scrapeBtn.classList.add('success');
            
            // Just refresh the history list - no need to show results
            await this.loadHistory();
            
            // Clear form
            urlInput.value = '';

            // Show success message briefly
            this.showSuccessMessage('Website scraped successfully!');

            // Remove success class after animation
            setTimeout(() => {
                scrapeBtn.classList.remove('success');
            }, 600);

        } catch (error) {
            console.error('Scrape error:', error);
            
            // Remove loading state and show error
            scrapeBtn.classList.remove('loading');
            
            DashboardState.setError(error);
        } finally {
            // Ensure loading state is cleared regardless of success or failure
            urlInput.disabled = false;
            scrapeBtn.disabled = false;
            DashboardState.setLoading(false);
        }
    },

    async loadHistory() {
        try {
            const result = await ScrapeAPI.getFilesList();
            const historyData = result.data || [];
            
            // Update state immediately with the loaded data
            DashboardState.setHistory(historyData);
            
            // Update UI immediately
            this.updateHistory(historyData);
            this.updateWebsiteSelector(historyData);
        } catch (error) {
            console.error('Error loading files list:', error);
            // Keep empty state on error
        }
    },

    async deleteFile(id) {
        try {
            if (confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
                await ScrapeAPI.deleteFile(id);
                this.loadHistory(); // Refresh files list
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            alert('Failed to delete file');
        }
    },



    async viewFileContent(id) {
        try {
            const historyItem = document.querySelector(`[data-id="${id}"]`);
            if (!historyItem) return;
            
            const existingDetails = historyItem.nextElementSibling;
            
            // Check if details are already open for this specific item
            if (existingDetails && existingDetails.classList.contains('item-details')) {
                // Close the details if they're already open for this item
                this.closeDetails(id);
                return;
            }
            
            // Close any other open details first (but not this one)
            this.closeAllDetails(id);
            
            // Prevent multiple API calls by checking if already loading
            const viewBtn = historyItem.querySelector('.view-btn');
            if (viewBtn && viewBtn.classList.contains('loading')) {
                return;
            }
            
            // Add loading state to button
            if (viewBtn) {
                viewBtn.classList.add('loading');
                viewBtn.style.opacity = '0.6';
                viewBtn.style.pointerEvents = 'none';
            }
            
            try {
            const result = await ScrapeAPI.getFileContent(id);
            this.showDetailsBelow(id, result.data);
            } finally {
                // Remove loading state
                if (viewBtn) {
                    viewBtn.classList.remove('loading');
                    viewBtn.style.opacity = '';
                    viewBtn.style.pointerEvents = '';
                }
            }
            
        } catch (error) {
            console.error('Error loading file content:', error);
            alert('Failed to load file content');
        }
    },

    closeAllDetails(exceptId = null) {
        const existingDetails = document.querySelectorAll('.item-details');
        existingDetails.forEach(detail => {
            // Find the associated history item
            const historyItem = detail.previousElementSibling;
            const itemId = historyItem?.getAttribute('data-id');
            
            // Skip if this is the item we want to keep open
            if (exceptId && itemId === exceptId) {
                return;
            }
            
            // Close this detail
            detail.classList.remove('open');
            if (historyItem) {
                historyItem.classList.remove('expanded');
            
            // Reset eye button appearance
                const viewBtn = historyItem.querySelector('.view-btn');
            if (viewBtn) {
                viewBtn.style.background = '';
                viewBtn.style.color = '';
                viewBtn.style.borderColor = '';
                viewBtn.title = 'View Content';
            }
            }
            
            // Remove the detail element after animation
            setTimeout(() => {
                if (detail.parentNode) {
                    detail.remove();
                }
            }, 300);
        });
    },

    showDetailsBelow(itemId, fileData) {
        const historyItem = document.querySelector(`[data-id="${itemId}"]`);
        if (!historyItem) return;

        // Check if details already exist for this item (safety check)
        const existingDetails = historyItem.nextElementSibling;
        if (existingDetails && existingDetails.classList.contains('item-details')) {
            return; // Don't create duplicate details
        }

        // Add expanded class to the clicked item
        historyItem.classList.add('expanded');
        
        // Update the eye button to show it's active
        const viewBtn = historyItem.querySelector('.view-btn');
        if (viewBtn) {
            viewBtn.style.background = '#667eea';
            viewBtn.style.color = 'white';
            viewBtn.style.borderColor = '#667eea';
            viewBtn.title = 'Hide Details';
        }

        // Create details element
        const detailsElement = document.createElement('div');
        detailsElement.className = 'item-details';
        
        const scrapingMethodIcon = this.getScrapingMethodIcon(fileData.scrapedData.scrapingMethod);
        const additionalUrlsSection = fileData.scrapedData.additionalUrls && fileData.scrapedData.additionalUrls.length > 0 
            ? `
                <div class="detail-section">
                    <h4><i class="ri-links-line"></i> Additional Sources (${fileData.scrapedData.additionalUrls.length})</h4>
                    <div class="additional-urls-list">
                        ${fileData.scrapedData.additionalUrls.map(urlInfo => `
                            <div class="additional-url-item">
                                <span class="url-source">${urlInfo.source}:</span>
                                <a href="${urlInfo.url}" target="_blank" class="url-link">${urlInfo.url}</a>
                                ${urlInfo.title ? `<span class="url-title">${urlInfo.title}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : '';
        
        detailsElement.innerHTML = `
            <div class="details-content">
                <div class="details-body">
                    <div class="detail-section">
                        <div class="detail-item">
                            <span class="detail-label"><i class="ri-link-m"></i> URL:</span>
                            <span class="detail-value">
                                <a href="${fileData.scrapedData.url}" target="_blank">${fileData.scrapedData.url}</a>
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label"><i class="ri-text"></i> Title:</span>
                            <span class="detail-value">${fileData.scrapedData.title || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">${scrapingMethodIcon} Scraping Method:</span>
                            <span class="detail-value">${fileData.scrapedData.scrapingMethod || 'enhanced'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label"><i class="ri-global-line"></i> URLs Scraped:</span>
                            <span class="detail-value">${fileData.scrapedData.totalUrlsScraped || 1}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label"><i class="ri-save-line"></i> Saved:</span>
                            <span class="detail-value">${new Date(fileData.savedAt).toLocaleString()}</span>
                        </div>
                    </div>
                    
                    ${additionalUrlsSection}
                    
                    <div class="content-stats">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="ri-h-1"></i></div>
                            <div class="stat-number">${fileData.scrapedData.headings ? fileData.scrapedData.headings.length : 0}</div>
                            <div class="stat-label">Headings</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="ri-text-wrap"></i></div>
                            <div class="stat-number">${fileData.scrapedData.paragraphs ? fileData.scrapedData.paragraphs.length : 0}</div>
                            <div class="stat-label">Paragraphs</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="ri-links-line"></i></div>
                            <div class="stat-number">${fileData.scrapedData.links ? fileData.scrapedData.links.length : 0}</div>
                            <div class="stat-label">Links</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="ri-image-line"></i></div>
                            <div class="stat-number">${fileData.scrapedData.images ? fileData.scrapedData.images.length : 0}</div>
                            <div class="stat-label">Images</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="ri-table-line"></i></div>
                            <div class="stat-number">${fileData.scrapedData.tables ? fileData.scrapedData.tables.length : 0}</div>
                            <div class="stat-label">Tables</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="ri-list-unordered"></i></div>
                            <div class="stat-number">${fileData.scrapedData.lists ? fileData.scrapedData.lists.length : 0}</div>
                            <div class="stat-label">Lists</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insert after the history item
        historyItem.insertAdjacentElement('afterend', detailsElement);

        // Animate the details opening
        setTimeout(() => {
            detailsElement.classList.add('open');
        }, 10);

        // Scroll to show the details
        setTimeout(() => {
            detailsElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
    },

    closeDetails(itemId) {
        const historyItem = document.querySelector(`[data-id="${itemId}"]`);
        const detailsElement = historyItem?.nextElementSibling;
        
        if (detailsElement && detailsElement.classList.contains('item-details')) {
            detailsElement.classList.remove('open');
            historyItem.classList.remove('expanded');
            
            // Reset the eye button appearance
            const viewBtn = historyItem.querySelector('.view-btn');
            if (viewBtn) {
                viewBtn.style.background = '';
                viewBtn.style.color = '';
                viewBtn.style.borderColor = '';
                viewBtn.title = 'View Content';
            }
            
            setTimeout(() => {
                detailsElement.remove();
            }, 300);
        }
    },

    // Legacy method for backward compatibility
    async deleteHistoryItem(id) {
        return this.deleteFile(id);
    },

    handleStateChange(state) {
        this.updateUI(state);
    },

    updateUI(state) {
        this.updateLoadingState(state.isLoading);
        this.updateHistory(state.history);
        this.updateError(state.error);
    },

    updateLoadingState(isLoading) {
        const scrapeBtn = document.getElementById('scrape-btn');
        const btnText = document.querySelector('.btn-text');
        const btnLoading = document.querySelector('.btn-loading');

        if (scrapeBtn && btnText && btnLoading) {
            scrapeBtn.disabled = isLoading;
            
            if (isLoading) {
                scrapeBtn.classList.add('loading');
            } else {
                scrapeBtn.classList.remove('loading');
            }
            
            // Legacy support for direct style changes
            btnText.style.display = isLoading ? 'none' : 'inline';
            btnLoading.style.display = isLoading ? 'inline' : 'none';
        }
    },

    updateHistory(history) {
        const historyContent = document.getElementById('history-content');
        
        if (!historyContent) return;

        // If we have history, show it immediately
        if (history && history.length > 0) {
            historyContent.innerHTML = history.map(item => {
                const scrapingMethodIcon = this.getScrapingMethodIcon(item.scrapingMethod);
                const additionalUrlsInfo = item.additionalUrls && item.additionalUrls.length > 0 
                    ? `<span class="additional-urls"><i class="ri-links-line"></i> +${item.additionalUrls.length} sources</span>` 
                    : '';
                
                return `
                    <div class="history-item" data-id="${item.id}">
                        <div class="history-info">
                            <div class="file-display-name">
                                <strong><i class="ri-file-text-line"></i> ${item.displayName}</strong>
                                <span class="scraping-method">${scrapingMethodIcon} ${item.scrapingMethod || 'enhanced'}</span>
                            </div>
                            <div class="history-url">
                                <a href="${item.url}" target="_blank"><i class="ri-link"></i> ${item.url}</a>
                            </div>
                            <div class="file-meta">
                                <span class="file-size"><i class="ri-hard-drive-2-line"></i> ${item.fileSize}</span> • 
                                <span class="urls-scraped"><i class="ri-global-line"></i> ${item.totalUrlsScraped || 1} URLs</span> • 
                                <span class="save-time"><i class="ri-time-line"></i> ${this.formatTime(item.savedAt)}</span>
                                ${additionalUrlsInfo}
                            </div>
                        </div>
                        <div class="history-actions">
                            <button class="history-btn rename-btn" onclick="DashboardPage.renameFile('${item.id}')" title="Rename">
                                <i class="ri-edit-line"></i>
                            </button>
                            <button class="history-btn view-btn" onclick="DashboardPage.viewFileContent('${item.id}')" title="View Content">
                                <i class="ri-eye-line"></i>
                            </button>
                            <button class="history-btn delete-btn" onclick="DashboardPage.deleteFile('${item.id}')" title="Delete">
                                <i class="ri-delete-bin-line"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        // If no history and empty state not already shown, show it
        else if (!historyContent.querySelector('.empty-state')) {
            this.showEmptyState();
        }
    },

    async renameFile(id) {
        try {
            // Find the current file data
            const currentFile = DashboardState.data.history.find(f => f.id === id);
            if (!currentFile) {
                alert('File not found');
                return;
            }

            // Prompt for new name
            const newName = prompt('Enter new name for the file:', currentFile.displayName);
            
            if (newName === null) return; // User cancelled
            
            if (!newName.trim()) {
                alert('Please enter a valid name');
                return;
            }

            // Call API to rename the file
            await ScrapeAPI.renameFile(id, newName.trim());
            
            // Refresh the history to show updated name
            this.loadHistory();
            
            // Also refresh the website selector
            const updatedHistory = DashboardState.data.history;
            this.updateWebsiteSelector(updatedHistory);
            
            this.showSuccessMessage('File renamed successfully!');
        } catch (error) {
            console.error('Error renaming file:', error);
            alert('Failed to rename file');
        }
    },

    updateError(error) {
        if (error) {
            alert(`Error: ${error}`);
            DashboardState.clearError();
        }
    },

    formatTime(timestamp) {
        if (!timestamp) return 'Unknown';
        
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    },

    getScrapingMethodIcon(method) {
        switch (method) {
            case 'enhanced':
                return '<i class="ri-rocket-line" style="color: #10b981;"></i>';
            case 'sitemap':
                return '<i class="ri-map-line" style="color: #3b82f6;"></i>';
            case 'robots':
                return '<i class="ri-robot-line" style="color: #f59e0b;"></i>';
            case 'internal':
                return '<i class="ri-links-line" style="color: #8b5cf6;"></i>';

            default:
                return '<i class="ri-file-line" style="color: #6b7280;"></i>';
        }
    },

    refresh() {
        this.loadHistory();
    },

    updateWebsiteSelector(files) {
        const websiteSelector = document.getElementById('website-selector');
        if (!websiteSelector) return;

        // Clear existing options
        websiteSelector.innerHTML = '<option value="">Select a scraped website...</option>';

        // Add options for each file
        files.forEach(file => {
            const option = document.createElement('option');
            option.value = file.id;
            
            // Create a meaningful display name
            let displayName = file.displayName || file.fileName;
            if (file.scrapedData && file.scrapedData.title) {
                displayName = file.scrapedData.title;
                if (displayName.length > 50) {
                    displayName = displayName.substring(0, 50) + '...';
                }
            }
            
            option.textContent = displayName;
            websiteSelector.appendChild(option);
        });
    },

    // Chat functionality - simplified since chat is always visible
    onWebsiteSelect(event) {
        const fileId = event.target.value;
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        const chatMessages = document.getElementById('chat-messages');

        this.selectedFileId = fileId;

        if (fileId) {
            // Enable chat input
            if (chatInput) {
                chatInput.disabled = false;
                chatInput.focus();
            }
            if (sendBtn) {
                sendBtn.disabled = false;
            }

            // Clear previous messages and show welcome
            if (chatMessages) {
                const selectedFile = DashboardState.data.history.find(f => f.id === fileId);
                const websiteTitle = selectedFile?.scrapedData?.title || 'the selected website';
                
                chatMessages.innerHTML = `
                    <div class="welcome-message">
                        <div class="welcome-message-content">
                            <div class="welcome-icon">🤖</div>
                            <div class="welcome-title">Ready to Chat!</div>
                            <div class="welcome-subtitle">I'm ready to discuss <strong>${websiteTitle}</strong> with you.</div>
                            <div class="welcome-steps">
                                <div class="welcome-step">
                                    <div class="welcome-step-icon">💡</div>
                                    <div class="welcome-step-text">Ask me to summarize the content</div>
                                </div>
                                <div class="welcome-step">
                                    <div class="welcome-step-icon">🔍</div>
                                    <div class="welcome-step-text">Find specific information or details</div>
                                </div>
                                <div class="welcome-step">
                                    <div class="welcome-step-icon">❓</div>
                                    <div class="welcome-step-text">Answer questions about the website</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        } else {
            // Disable chat input
            if (chatInput) {
                chatInput.disabled = true;
                chatInput.value = '';
            }
            if (sendBtn) {
                sendBtn.disabled = true;
            }

            // Reset welcome message
            if (chatMessages) {
                chatMessages.innerHTML = `
                    <div class="welcome-message">
                        <div class="welcome-message-content">
                            <div class="welcome-icon">👋</div>
                            <div class="welcome-title">Welcome to ChatFlow AI</div>
                            <div class="welcome-subtitle">Your intelligent website analysis companion</div>
                            <div class="welcome-steps">
                                <div class="welcome-step">
                                    <div class="welcome-step-icon">1️⃣</div>
                                    <div class="welcome-step-text">First, scrape a website using the URL input</div>
                                </div>
                                <div class="welcome-step">
                                    <div class="welcome-step-icon">2️⃣</div>
                                    <div class="welcome-step-text">Select the scraped website from the dropdown</div>
                                </div>
                                <div class="welcome-step">
                                    <div class="welcome-step-icon">3️⃣</div>
                                    <div class="welcome-step-text">Start chatting and ask me anything!</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
    },

    async handleChatMessage(event) {
        event.preventDefault();
        
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();

        if (!message || !this.selectedFileId) return;

        // Clear input immediately
        chatInput.value = '';

        // Add user message to chat
        this.addMessageToChat('user', message);
        
        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Send message to API
            const response = await ScrapeAPI.chatWithWebsiteForDashboard(this.selectedFileId, message);
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            // Add bot response to chat
            this.addMessageToChat('bot', response.data.response);

        } catch (error) {
            console.error('Chat error:', error);
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            // Show error message
            this.addMessageToChat('bot', `Sorry, I encountered an error: ${error.message}. Please try again.`);
        }
    },

    addMessageToChat(sender, message) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        // Remove welcome message if it exists
        const welcomeMessage = chatMessages.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Format message content based on sender
        const formattedMessage = sender === 'bot' ? this.formatAIMessage(message) : this.escapeHtml(message);

        messageDiv.innerHTML = `
            <div class="message-avatar">
                ${sender === 'user' ? '<i class="ri-user-line"></i>' : '<i class="ri-robot-2-line"></i>'}
            </div>
            <div class="message-content">
                <div class="message-bubble">${formattedMessage}</div>
                <div class="message-time"><i class="ri-time-line"></i> ${timeString}</div>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        
        // Smooth scroll to bottom with a slight delay to ensure content is rendered
        requestAnimationFrame(() => {
            chatMessages.scrollTo({
                top: chatMessages.scrollHeight,
                behavior: 'smooth'
            });
        });
    },

    formatAIMessage(message) {
        if (!message || typeof message !== 'string') return '';

        // Clean up any malformed AI responses first
        let formatted = this.cleanupAIResponse(message);
        
        // Process markdown links BEFORE escaping HTML
        formatted = this.processMarkdownLinks(formatted);
        
        // Escape HTML to prevent any malformed content (but preserve our processed links)
        formatted = this.escapeHtmlExceptLinks(formatted);

        // Convert line breaks to HTML with proper spacing
        formatted = formatted.replace(/\n\n/g, '</p><p class="ai-paragraph">');
        formatted = formatted.replace(/\n/g, '<br>');
        
        // Process markdown headers (## Header)
        formatted = this.processMarkdownHeaders(formatted);
        
        // Simple bold formatting for **text**
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="ai-bold">$1</strong>');
        
        // Simple italic formatting for *text*
        formatted = formatted.replace(/\*(.*?)\*/g, '<em class="ai-italic">$1</em>');
        
        // Process bullet points
        formatted = this.processBulletPoints(formatted);
        
        // Process numbered lists
        formatted = this.processNumberedLists(formatted);
        
        // Process markdown tables
        formatted = this.processMarkdownTables(formatted);
        
        // Clean up any malformed paragraph tags and ensure proper wrapping
        formatted = formatted.replace(/<\/p><p class="ai-paragraph">\s*<\/p>/g, '</p>');
        formatted = formatted.replace(/^<\/p>/, '');
        formatted = formatted.replace(/<p class="ai-paragraph">\s*$/, '');
        
        // Wrap in paragraph tags if not already wrapped
        if (!formatted.includes('<p class="ai-paragraph">')) {
            formatted = `<p class="ai-paragraph">${formatted}</p>`;
        }
        
        // Format as a clean response with proper spacing
        return `<div class="ai-response">${formatted}</div>`;
    },

    processMarkdownLinks(text) {
        // Convert markdown links [text](url) to clickable HTML links
        return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="ai-link">$1</a>');
    },

    escapeHtmlExceptLinks(text) {
        // Split by HTML link tags to preserve them
        const linkRegex = /(<a[^>]*>.*?<\/a>)/g;
        const parts = text.split(linkRegex);
        
        return parts.map(part => {
            // If this part is a link, preserve it
            if (linkRegex.test(part)) {
                return part;
            }
            // Otherwise, escape HTML
            return this.escapeHtml(part);
        }).join('');
    },

    processMarkdownHeaders(text) {
        // Process ## headers
        text = text.replace(/##\s+(.+?)(<br>|$)/g, '<h3 class="ai-header">$1</h3><br>');
        // Process ### headers
        text = text.replace(/###\s+(.+?)(<br>|$)/g, '<h4 class="ai-subheader">$1</h4><br>');
        return text;
    },

    processBulletPoints(text) {
        // Convert bullet points to proper HTML lists
        const lines = text.split('<br>');
        let inList = false;
        let result = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('• ') || line.startsWith('- ')) {
                if (!inList) {
                    result.push('</p><ul class="ai-list"><p class="ai-paragraph">');
                    inList = true;
                }
                const content = line.startsWith('• ') ? line.substring(2) : line.substring(2);
                result.push(`<li class="ai-list-item">${content}</li>`);
            } else {
                if (inList) {
                    result.push('</p></ul><p class="ai-paragraph">');
                    inList = false;
                }
                if (line) {
                    result.push(line);
                }
            }
        }
        
        if (inList) {
            result.push('</p></ul><p class="ai-paragraph">');
        }
        
        return result.join('<br>');
    },

    processNumberedLists(text) {
        // Convert numbered lists to proper HTML ordered lists
        const lines = text.split('<br>');
        let inList = false;
        let result = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Check for numbered list pattern (1. 2. etc.)
            if (/^\d+\.\s/.test(line)) {
                if (!inList) {
                    result.push('</p><ol class="ai-numbered-list"><p class="ai-paragraph">');
                    inList = true;
                }
                const content = line.replace(/^\d+\.\s/, '');
                result.push(`<li class="ai-list-item">${content}</li>`);
            } else {
                if (inList) {
                    result.push('</p></ol><p class="ai-paragraph">');
                    inList = false;
                }
                if (line) {
                    result.push(line);
                }
            }
        }
        
        if (inList) {
            result.push('</p></ol><p class="ai-paragraph">');
        }
        
        return result.join('<br>');
    },

    processMarkdownTables(text) {
        // Convert markdown tables to HTML tables
        const lines = text.split('<br>');
        let result = [];
        let inTable = false;
        let tableRows = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Check if this line is a table row (contains |)
            if (line.includes('|') && line.split('|').length > 2) {
                if (!inTable) {
                    inTable = true;
                    tableRows = [];
                }
                
                // Skip separator rows (contains --- or ===)
                if (line.includes('---') || line.includes('===')) {
                    continue;
                }
                
                // Process table row
                const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
                tableRows.push(cells);
            } else {
                // If we were in a table, close it
                if (inTable) {
                    result.push(this.renderTable(tableRows));
                    inTable = false;
                    tableRows = [];
                }
                
                // Add the non-table line
                if (line) {
                    result.push(line);
                }
            }
        }
        
        // Close table if we ended while in one
        if (inTable) {
            result.push(this.renderTable(tableRows));
        }
        
        return result.join('<br>');
    },

    renderTable(rows) {
        if (rows.length === 0) return '';
        
        let html = '<table class="ai-table">';
        
        // First row is header
        if (rows.length > 0) {
            html += '<thead><tr>';
            rows[0].forEach(cell => {
                html += `<th class="ai-table-header">${cell}</th>`;
            });
            html += '</tr></thead>';
        }
        
        // Remaining rows are body
        if (rows.length > 1) {
            html += '<tbody>';
            for (let i = 1; i < rows.length; i++) {
                html += '<tr>';
                rows[i].forEach(cell => {
                    html += `<td class="ai-table-cell">${cell}</td>`;
                });
                html += '</tr>';
            }
            html += '</tbody>';
        }
        
        html += '</table>';
        return html;
    },

    showTypingIndicator() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot typing-message';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="ri-robot-2-line"></i>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span>AI is thinking</span>
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;

        chatMessages.appendChild(typingDiv);
        
        // Smooth scroll to bottom for typing indicator
        requestAnimationFrame(() => {
            chatMessages.scrollTo({
                top: chatMessages.scrollHeight,
                behavior: 'smooth'
            });
        });
    },

    hideTypingIndicator() {
        const typingMessage = document.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
    },



    showSuccessMessage(message) {
        // Create a temporary success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="ri-checkbox-circle-line"></i> ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show the notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    },



    cleanupAIResponse(message) {
        // Remove any malformed HTML tags that might be in the AI response
        message = message.replace(/\s*target="_blank"[^>]*>/g, '');
        message = message.replace(/\s*class="ai-link"[^>]*>/g, '');
        message = message.replace(/\s*rel="noopener noreferrer"[^>]*>/g, '');
        
        // Remove any incomplete HTML tags
        message = message.replace(/<[^>]*$/g, '');
        
        return message.trim();
    },



    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
};