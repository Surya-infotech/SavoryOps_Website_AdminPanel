import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProider } from './Middleware/Auth.jsx';
import { applyThemeFavicon } from './utils/applyThemeFavicon.js';
import {
  applyCachedThemeColors,
  applyThemeColors,
} from './utils/applyThemeColors.js';

// Apply cached theme immediately to avoid flicker, then refresh from API.
applyCachedThemeColors();

async function bootstrap() {
  await applyThemeColors();
  applyThemeFavicon();

  createRoot(document.getElementById('root')).render(
    <AuthProider>
      <StrictMode>
        <App />
      </StrictMode>
    </AuthProider>,
  );
}

bootstrap();
