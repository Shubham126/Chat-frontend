const ConfigurationState = {
    data: {
        isLoading: false,
        settings: {},
        error: null
    },

    setState(updates) {
        this.data = { ...this.data, ...updates };
        this.notifyListeners();
    },

    getState() {
        return { ...this.data };
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