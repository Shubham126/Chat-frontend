const DashboardState = {
    data: {
        isLoading: false,
        currentResult: null,
        history: [],
        error: null
    },

    setState(updates) {
        this.data = { ...this.data, ...updates };
        this.notifyListeners();
    },

    getState() {
        return { ...this.data };
    },

    setLoading(isLoading) {
        this.setState({ isLoading, error: null });
    },

    setResult(result) {
        this.setState({ 
            currentResult: result, 
            isLoading: false, 
            error: null 
        });
    },

    setHistory(history) {
        this.setState({ history });
    },

    setError(error) {
        this.setState({ 
            error: error.message || 'An error occurred', 
            isLoading: false 
        });
    },

    clearError() {
        this.setState({ error: null });
    },

    clearResult() {
        this.setState({ currentResult: null });
    },

    listeners: [],

    addListener(callback) {
        this.listeners.push(callback);
    },

    removeListener(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    },

    notifyListeners() {
        this.listeners.forEach(callback => callback(this.data));
    }
}; 