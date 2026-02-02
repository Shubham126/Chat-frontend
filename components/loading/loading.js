const LoadingComponent = {
    async init() {
        const container = document.getElementById('loading-container');
        
        try {
            const response = await fetch('components/loading/loading.html');
            const html = await response.text();
            container.innerHTML = html;
        } catch (error) {
            console.error('Error loading loading component:', error);
            // Fallback HTML
            container.innerHTML = `
                <div class="loading-screen">
                    <div class="loading-content">
                        <div class="logo">
                            <h1>ChatFlow AI</h1>
                            <p>Intelligent Website Analysis</p>
                        </div>
                        <div class="loading-spinner">
                            <div class="spinner"></div>
                        </div>
                        <div class="loading-text">
                            <p>Initializing ChatFlow AI...</p>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    async hide() {
        const loadingScreen = document.querySelector('.loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            
            return new Promise(resolve => {
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    resolve();
                }, 500);
            });
        }
    }
}; 