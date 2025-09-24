import React from 'react'
import ReactDOM from 'react-dom/client'
import SublimationExperiment from './App.tsx'
import './index.css'

// Loading screen removal
const removeLoadingScreen = () => {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.remove();
    }, 500);
  }
};

// Initialize the app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SublimationExperiment />
  </React.StrictMode>
);

// Remove loading screen after a short delay
setTimeout(removeLoadingScreen, 1500);
