const getApiBaseUrl = () => {
    // Use local backend when on localhost, otherwise use Render
    const baseUrl = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '192.168.1.21' ||
        window.location.hostname === '192.168.1.11'
        ? 'http://localhost:3000/api'
        : 'https://chat-backend-12wo.onrender.com/api';

    console.log(`🔌 ScrapeAPI URL set to: ${baseUrl}`);
    return baseUrl;
};

const ScrapeAPI = {
    baseURL: getApiBaseUrl(),

    async scrapeAndSave(url) {
        try {
            const response = await fetch(`${this.baseURL}/scrape/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to scrape and save URL');
            }

            return data;
        } catch (error) {
            console.error('API Error - Scrape and Save:', error);
            throw error;
        }
    },

    async scrapeAndSaveForDashboard(url) {
        try {
            const response = await fetch(`${this.baseURL}/scrape/dashboard/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies for authentication
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to scrape and save URL');
            }

            return data;
        } catch (error) {
            console.error('API Error - Dashboard Scrape and Save:', error);
            throw error;
        }
    },

    async scrapeUrl(url, question) {
        try {
            const response = await fetch(`${this.baseURL}/scrape/url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies for authentication
                body: JSON.stringify({ url, question })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to scrape URL');
            }

            return data;
        } catch (error) {
            console.error('API Error - Scrape URL:', error);
            throw error;
        }
    },

    async getFilesList() {
        try {
            const response = await fetch(`${this.baseURL}/scrape/dashboard/files`, {
                credentials: 'include' // Include cookies for authentication
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get files list');
            }

            return data;
        } catch (error) {
            console.error('API Error - Get Files List:', error);
            throw error;
        }
    },

    async getFileContent(fileId) {
        try {
            const response = await fetch(`${this.baseURL}/scrape/dashboard/files/${fileId}`, {
                credentials: 'include' // Include cookies for authentication
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get file content');
            }

            return data;
        } catch (error) {
            console.error('API Error - Get File Content:', error);
            throw error;
        }
    },

    async deleteFile(fileId) {
        try {
            const response = await fetch(`${this.baseURL}/scrape/files/${fileId}`, {
                method: 'DELETE',
                credentials: 'include' // Include cookies for authentication
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete file');
            }

            return data;
        } catch (error) {
            console.error('API Error - Delete File:', error);
            throw error;
        }
    },

    async renameFile(fileId, customName) {
        try {
            const response = await fetch(`${this.baseURL}/scrape/files/${fileId}/rename`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies for authentication
                body: JSON.stringify({ customName })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to rename file');
            }

            return data;
        } catch (error) {
            console.error('API Error - Rename File:', error);
            throw error;
        }
    },

    async getStorageStats() {
        try {
            const response = await fetch(`${this.baseURL}/scrape/stats`, {
                credentials: 'include' // Include cookies for authentication
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get storage stats');
            }

            return data;
        } catch (error) {
            console.error('API Error - Get Storage Stats:', error);
            throw error;
        }
    },

    async chatWithWebsite(fileId, message) {
        try {
            const response = await fetch(`${this.baseURL}/scrape/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileId: fileId,
                    message: message
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get AI response');
            }

            return data;
        } catch (error) {
            console.error('API Error - Chat with Website:', error);
            throw error;
        }
    },

    async chatWithWebsiteForDashboard(fileId, message) {
        try {
            const response = await fetch(`${this.baseURL}/scrape/dashboard/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies for authentication
                body: JSON.stringify({
                    fileId: fileId,
                    message: message
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get AI response');
            }

            return data;
        } catch (error) {
            console.error('API Error - Dashboard Chat with Website:', error);
            throw error;
        }
    },

    // Legacy methods for backward compatibility
    async getHistory() {
        return this.getFilesList();
    },

    async deleteHistory(id) {
        return this.deleteFile(id);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScrapeAPI;
}

// Make available globally for browser use
if (typeof window !== 'undefined') {
    window.ScrapeAPI = ScrapeAPI;
}