const ConfigurationPage = {
    async init() {
        const container = document.getElementById('configuration-page');
        
        try {
            const response = await fetch('pages/configuration/configuration.html');
            const html = await response.text();
            container.innerHTML = html;
        } catch (error) {
            console.error('Error loading configuration page:', error);
            container.innerHTML = `
                <div class="coming-soon-container">
                    <div class="coming-soon-content">
                        <div class="coming-soon-icon">⚙️</div>
                        <h2>Configuration Settings</h2>
                        <p>Customize ChatFlow AI to fit your needs perfectly!</p>
                    </div>
                </div>
            `;
        }
    }
}; 