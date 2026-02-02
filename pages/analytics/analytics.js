const AnalyticsPage = {
    async init() {
        const container = document.getElementById('analytics-page');
        
        try {
            const response = await fetch('pages/analytics/analytics.html');
            const html = await response.text();
            container.innerHTML = html;
        } catch (error) {
            console.error('Error loading analytics page:', error);
            container.innerHTML = `
                <div class="coming-soon-container">
                    <div class="coming-soon-content">
                        <div class="coming-soon-icon">📈</div>
                        <h2>Analytics Dashboard</h2>
                        <p>Advanced analytics and insights coming soon!</p>
                    </div>
                </div>
            `;
        }
    }
}; 