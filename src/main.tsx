import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Automatically detect updates, install in background, and update seamlessly
registerSW({
  immediate: true,
  onNeedRefresh() {
    // When a new version is detected and precached, immediately reload to activate
    window.location.reload();
  },
  onRegisteredSW(swUrl, registration) {
    if (registration) {
      // Periodically check for application updates every 10 minutes
      setInterval(() => {
        registration.update().catch(() => {});
      }, 10 * 60 * 1000);
    }
  },
});

createRoot(document.getElementById('root')!).render(<App />);
