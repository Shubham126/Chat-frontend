class AuthManager {
    constructor() {
        // Use local backend IP
        this.apiBase = 'http://192.168.1.12:3000/api/auth';

        console.log('🔌 API Base set to:', this.apiBase);
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Form submissions
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Real-time validation
        document.getElementById('register-password').addEventListener('input', (e) => {
            this.validatePassword(e.target.value, 'register-password-error');
            this.updatePasswordStrength(e.target.value);
        });

        document.getElementById('register-confirm-password').addEventListener('input', (e) => {
            this.validateConfirmPassword(e.target.value, 'register-confirm-password-error');
        });

        document.getElementById('register-email').addEventListener('input', (e) => {
            this.validateEmail(e.target.value, 'register-email-error');
        });

        document.getElementById('register-name').addEventListener('input', (e) => {
            this.validateName(e.target.value, 'register-name-error');
        });
    }

    switchTab(tabName) {
        // Update tab appearance
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update form visibility
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${tabName}-form`).classList.add('active');

        // Clear alerts and errors
        this.hideAlert();
        this.clearErrors();
    }

    async checkAuthStatus() {
        try {
            const response = await fetch(`${this.apiBase}/check`, {
                method: 'GET',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success && data.authenticated) {
                // User is already authenticated, redirect to main app
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        }
    }

    async handleLogin() {
        const form = document.getElementById('login-form');
        const formData = new FormData(form);
        const data = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        // Validate inputs
        if (!this.validateLoginForm(data)) {
            return;
        }

        this.setLoading('login-button', true);
        this.hideAlert();

        try {
            const response = await fetch(`${this.apiBase}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                this.showAlert('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            } else {
                this.showAlert(result.message || 'Login failed. Please try again.', 'error');
                this.handleValidationErrors(result.errors);
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showAlert('Network error. Please check your connection and try again.', 'error');
        } finally {
            this.setLoading('login-button', false);
        }
    }

    async handleRegister() {
        const form = document.getElementById('register-form');
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword')
        };

        // Validate inputs
        if (!this.validateRegisterForm(data)) {
            return;
        }

        this.setLoading('register-button', true);
        this.hideAlert();

        try {
            const response = await fetch(`${this.apiBase}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                this.showAlert('Account created successfully! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            } else {
                this.showAlert(result.message || 'Registration failed. Please try again.', 'error');
                this.handleValidationErrors(result.errors);
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showAlert('Network error. Please check your connection and try again.', 'error');
        } finally {
            this.setLoading('register-button', false);
        }
    }

    validateLoginForm(data) {
        let isValid = true;

        // Email validation
        if (!this.validateEmail(data.email, 'login-email-error')) {
            isValid = false;
        }

        // Password validation
        if (!data.password) {
            this.showFieldError('login-password-error', 'Password is required');
            isValid = false;
        } else {
            this.hideFieldError('login-password-error');
        }

        return isValid;
    }

    validateRegisterForm(data) {
        let isValid = true;

        // Name validation
        if (!this.validateName(data.name, 'register-name-error')) {
            isValid = false;
        }

        // Email validation
        if (!this.validateEmail(data.email, 'register-email-error')) {
            isValid = false;
        }

        // Password validation
        if (!this.validatePassword(data.password, 'register-password-error')) {
            isValid = false;
        }

        // Confirm password validation
        if (!this.validateConfirmPassword(data.confirmPassword, 'register-confirm-password-error')) {
            isValid = false;
        }

        return isValid;
    }

    validateEmail(email, errorElementId) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            this.showFieldError(errorElementId, 'Email is required');
            return false;
        }

        if (!emailRegex.test(email)) {
            this.showFieldError(errorElementId, 'Please enter a valid email address');
            return false;
        }

        this.hideFieldError(errorElementId);
        return true;
    }

    validatePassword(password, errorElementId) {
        if (!password) {
            this.showFieldError(errorElementId, 'Password is required');
            return false;
        }

        if (password.length < 6) {
            this.showFieldError(errorElementId, 'Password must be at least 6 characters long');
            return false;
        }

        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);

        if (!hasUppercase || !hasLowercase || !hasNumber) {
            this.showFieldError(errorElementId, 'Password must contain uppercase, lowercase, and number');
            return false;
        }

        this.hideFieldError(errorElementId);
        return true;
    }

    validateName(name, errorElementId) {
        if (!name) {
            this.showFieldError(errorElementId, 'Name is required');
            return false;
        }

        if (name.length < 2) {
            this.showFieldError(errorElementId, 'Name must be at least 2 characters long');
            return false;
        }

        if (name.length > 50) {
            this.showFieldError(errorElementId, 'Name cannot exceed 50 characters');
            return false;
        }

        if (!/^[a-zA-Z\s]+$/.test(name)) {
            this.showFieldError(errorElementId, 'Name can only contain letters and spaces');
            return false;
        }

        this.hideFieldError(errorElementId);
        return true;
    }

    showFieldError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        const inputElement = errorElement.previousElementSibling;

        errorElement.textContent = message;
        errorElement.classList.add('show');
        inputElement.classList.add('error');
    }

    hideFieldError(elementId) {
        const errorElement = document.getElementById(elementId);
        const inputElement = errorElement.previousElementSibling;

        errorElement.classList.remove('show');
        inputElement.classList.remove('error');
    }

    handleValidationErrors(errors) {
        if (!errors) return;

        errors.forEach(error => {
            const field = error.path || error.param;
            const errorElementId = `${document.querySelector('.auth-form.active').id.split('-')[0]}-${field}-error`;
            this.showFieldError(errorElementId, error.msg || error.message);
        });
    }

    clearErrors() {
        document.querySelectorAll('.error-message').forEach(error => {
            error.classList.remove('show');
        });

        document.querySelectorAll('input').forEach(input => {
            input.classList.remove('error');
        });
    }

    showAlert(message, type) {
        const alert = document.getElementById('alert');
        alert.textContent = message;
        alert.className = `alert ${type} show`;
    }

    hideAlert() {
        const alert = document.getElementById('alert');
        alert.classList.remove('show');
    }

    setLoading(buttonId, isLoading) {
        const button = document.getElementById(buttonId);
        const buttonText = button.querySelector('.button-text');
        const loading = button.querySelector('.loading');

        if (isLoading) {
            buttonText.style.display = 'none';
            loading.classList.add('show');
            button.disabled = true;
        } else {
            buttonText.style.display = 'inline';
            loading.classList.remove('show');
            button.disabled = false;
        }
    }

    validateConfirmPassword(confirmPassword, errorElementId) {
        const password = document.getElementById('register-password').value;

        if (!confirmPassword) {
            this.showFieldError(errorElementId, 'Please confirm your password');
            return false;
        }

        if (password !== confirmPassword) {
            this.showFieldError(errorElementId, 'Passwords do not match');
            return false;
        }

        this.hideFieldError(errorElementId);
        return true;
    }

    updatePasswordStrength(password) {
        const strengthContainer = document.getElementById('password-strength');
        const strengthText = strengthContainer.querySelector('.strength-text');

        if (!password) {
            strengthContainer.className = 'password-strength';
            strengthText.textContent = 'Enter a password';
            return;
        }

        const strength = this.calculatePasswordStrength(password);

        // Remove all strength classes
        strengthContainer.className = 'password-strength';

        // Add appropriate strength class
        strengthContainer.classList.add(`strength-${strength.level}`);
        strengthText.textContent = strength.text;
    }

    calculatePasswordStrength(password) {
        let score = 0;
        let feedback = [];

        // Length check
        if (password.length >= 8) score += 1;
        else if (password.length >= 6) score += 0.5;

        // Character variety checks
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        // Determine strength level
        if (score < 2) {
            return { level: 'weak', text: 'Weak - Add more characters' };
        } else if (score < 3) {
            return { level: 'fair', text: 'Fair - Add numbers or symbols' };
        } else if (score < 4) {
            return { level: 'good', text: 'Good - Almost there!' };
        } else {
            return { level: 'strong', text: 'Strong - Great password!' };
        }
    }
}

// Initialize authentication manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});