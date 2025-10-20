# SIOS - Smart Intelligent Orchestration System

A modern full-stack application for intelligent customer profiling and company intelligence analysis.

## 📁 Project Structure

```
SIOS/
├── frontend/          # React + Vite frontend application
│   ├── src/          # React components and pages
│   ├── public/       # Static assets
│   ├── index.html    # HTML template
│   ├── vite.config.js # Vite configuration
│   └── package.json  # Frontend dependencies
├── backend/          # Backend API (to be implemented)
├── package.json      # Root package.json for scripts
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install all dependencies:**
```bash
npm run install:all
```

Or install individually:
```bash
# Install frontend dependencies
npm run install:frontend

# Install backend dependencies
npm run install:backend
```

### Development

**Run frontend:**
```bash
npm run dev:frontend
```

**Run backend:**
```bash
npm run dev:backend
```

**Run both (when backend is ready):**
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or next available port)

## 🎨 Frontend Features

- **Modern UI**: Purple, white, and black theme with smooth animations
- **Responsive Design**: Works beautifully on all devices
- **Sidebar Navigation**: Quick access to different sections
- **Company Intelligence**: Display detailed company data in card slides
- **React Router**: Seamless navigation between pages

## 🛠️ Technologies

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side routing
- **CSS3** - Advanced animations and gradients

### Backend
- To be implemented

## 📦 Build for Production

```bash
npm run build:frontend
```

The optimized production build will be in the `frontend/dist` folder.

## 🌐 Browser Support

Works perfectly on all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## 🔒 Privacy

- All data is stored locally in your browser
- No server or backend required for basic functionality
- Privacy-focused design

---

**SIOS** - Intelligent orchestration at your fingertips.
