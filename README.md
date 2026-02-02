# ChatFlow AI - Frontend

This is the frontend dashboard for ChatFlow AI, an intelligent website analysis platform.

## 🚀 Quick Start

### Prerequisites
- Node.js installed
- Backend server running on `http://localhost:3000`

### Installation

```bash
# Install dependencies
npm install
```

### Running the Frontend

```bash
# Start the development server (opens browser automatically)
npm start

# Or run without opening browser
npm run dev
```

The frontend will be available at: **http://localhost:8080**

## 📁 Project Structure

```
frontend/
├── index.html              # Main application entry point
├── auth.html               # Authentication page
├── auth.js                 # Authentication logic
├── components/             # Reusable UI components
│   ├── header/
│   └── loading/
├── pages/                  # Application pages
│   ├── dashboard/
│   ├── analytics/
│   ├── integrations/
│   └── configuration/
├── shared/                 # Shared utilities and API clients
│   └── api/
└── assets/                 # Static assets
```

## 🔧 Configuration

The frontend connects to the backend API at `http://localhost:3000`. Make sure the backend server is running before starting the frontend.

### API Endpoints Used
- `/api/auth/check` - Authentication verification
- `/api/auth/*` - Authentication routes
- `/api/scrape/*` - Web scraping routes

## 🌐 Features

- **Dashboard**: Main control panel for website analysis
- **Analytics**: View analysis results and insights
- **Integrations**: Manage third-party integrations
- **Configuration**: System settings and preferences
- **Authentication**: Secure login system

## 📝 Notes

- The frontend runs independently on port 8080
- Backend must be running on port 3000 for API calls to work
- CORS is enabled on the backend to allow cross-origin requests
