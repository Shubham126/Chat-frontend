/**
 * Header Component - Simple, Clean Design
 * 
 * This header uses a single, self-contained structure defined in JavaScript.
 * No external HTML files are loaded to prevent duplication and conflicts.
 * 
 * Structure:
 * - Logo section (left): Robot icon + ChatFlow AI text
 * - Navigation (center): Dashboard, Analytics, Integrations, Configuration
 * - Actions (right): Settings button
 * 
 * Responsive behavior:
 * - Desktop: All elements in one row
 * - Mobile (768px): Logo + settings on top row, navigation on second row
 * - Small mobile (640px): Icons-only navigation
 */
const HeaderComponent = {
    async init() {
        const container = document.getElementById('header-container');

        // Simple, clean header structure - no external file dependencies
        container.innerHTML = `
            <header class="main-header">
                <div class="header-container">
                    <div class="logo-section">
                        <div class="logo-icon">
                            <i class="ri-robot-2-fill logo-emoji"></i>
                        </div>
                        <div class="logo-text">
                            <h1 class="site-title">ChatFlow AI</h1>
                            <span class="site-subtitle">Intelligent Website Analysis</span>
                        </div>
                    </div>
                    
                    <nav class="main-nav">
                        <ul class="nav-tabs">
                            <li class="nav-item">
                                <button class="nav-tab active" data-page="dashboard">
                                    <i class="ri-dashboard-3-fill"></i>
                                    <span class="tab-text">Dashboard</span>
                                </button>
                            </li>
                            <li class="nav-item">
                                <button class="nav-tab" data-page="analytics">
                                    <i class="ri-bar-chart-fill"></i>
                                    <span class="tab-text">Analytics</span>
                                </button>
                            </li>
                            <li class="nav-item">
                                <button class="nav-tab" data-page="integrations">
                                    <i class="ri-plug-fill"></i>
                                    <span class="tab-text">Integrations</span>
                                </button>
                            </li>
                            <li class="nav-item">
                                <button class="nav-tab" data-page="configuration">
                                    <i class="ri-settings-3-fill"></i>
                                    <span class="tab-text">Configuration</span>
                                </button>
                            </li>
                        </ul>
                    </nav>
                    
                    <div class="header-actions">
                        <div class="user-info">
                            <span class="user-name" id="user-name">Loading...</span>
                            <div class="user-menu">
                                <button class="user-menu-btn" title="User Menu">
                                    <i class="ri-user-3-fill"></i>
                                </button>
                                <div class="user-dropdown">
                                    <div class="user-dropdown-item">
                                        <i class="ri-user-line"></i>
                                        <span id="user-email">user@example.com</span>
                                    </div>
                                    <div class="user-dropdown-divider"></div>
                                    <button class="user-dropdown-item logout-btn">
                                        <i class="ri-logout-box-line"></i>
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        `;

        this.bindEvents();
        this.initAnimations();
    },

    bindEvents() {
        // Navigation tabs
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const pageName = e.currentTarget.getAttribute('data-page');
                if (pageName) {
                    this.handleNavigation(pageName);
                }
            });

            // Hover effects
            tab.addEventListener('mouseenter', (e) => {
                if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                }
            });

            tab.addEventListener('mouseleave', (e) => {
                if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.transform = '';
                }
            });
        });

        // User menu button
        const userMenuBtn = document.querySelector('.user-menu-btn');
        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', this.toggleUserMenu.bind(this));
        }

        // Logout button
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }

        // Close user menu when clicking outside
        document.addEventListener('click', (e) => {
            const userMenu = document.querySelector('.user-menu');
            if (userMenu && !userMenu.contains(e.target)) {
                this.closeUserMenu();
            }
        });

        // Logo click for home
        const logoSection = document.querySelector('.logo-section');
        if (logoSection) {
            logoSection.addEventListener('click', () => {
                this.handleNavigation('dashboard');
            });
        }
    },

    handleNavigation(pageName) {
        // Click animation
        const activeTab = document.querySelector('.nav-tab.active');
        if (activeTab) {
            activeTab.style.transform = 'scale(0.95)';
            setTimeout(() => {
                activeTab.style.transform = '';
            }, 150);
        }

        // Navigate to page
        if (window.navigateToPage) {
            window.navigateToPage(pageName);
        }
    },

    updateActiveTab(activePage) {
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            const pageName = tab.getAttribute('data-page');

            if (pageName === activePage) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    },

    initAnimations() {
        // Simple entrance animation
        const header = document.querySelector('.main-header');
        if (header) {
            header.style.transform = 'translateY(-10px)';
            header.style.opacity = '0';

            setTimeout(() => {
                header.style.transition = 'all 0.3s ease';
                header.style.transform = 'translateY(0)';
                header.style.opacity = '1';
            }, 100);
        }

        // Load user data
        this.loadUserData();
    },

    async loadUserData() {
        try {
            // Use Render backend
            const url = 'https://chat-backend-12wo.onrender.com/api/auth/profile';
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success && data.user) {
                document.getElementById('user-name').textContent = data.user.name;
                document.getElementById('user-email').textContent = data.user.email;
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
            document.getElementById('user-name').textContent = 'User';
        }
    },

    toggleUserMenu() {
        const dropdown = document.querySelector('.user-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    },

    closeUserMenu() {
        const dropdown = document.querySelector('.user-dropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    },

    async handleLogout() {
        try {
            // Use Render backend
            const url = 'https://chat-backend-12wo.onrender.com/api/auth/logout';
            const response = await fetch(url, {
                method: 'POST',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                // Redirect to auth page
                window.location.href = '/auth.html';
            } else {
                console.error('Logout failed:', data.message);
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Force redirect even if logout request fails
            window.location.href = '/auth.html';
        }
    }
};