import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { globalCSS } from './utils/theme';

const style = document.createElement('style');
style.textContent = globalCSS;
document.head.appendChild(style);

// Restore path from GitHub Pages 404.html redirect
const redirect = sessionStorage.getItem('spa-redirect');
if (redirect) {
  sessionStorage.removeItem('spa-redirect');
  window.history.replaceState(null, '', redirect);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/petroamid-web">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
