import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App.jsx';
import { AuthProvider } from './modules/auth/context/AuthContext.jsx';
import { ThemeModeProvider } from './contexts/ThemeModeContext.jsx';
import { ToastProvider } from './contexts/ToastContext.jsx';
import { ErrorBoundary } from './components/feedback/ErrorBoundary.jsx';
import { GlobalStyles } from './styles/GlobalStyles.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeModeProvider>
          <ToastProvider>
            <GlobalStyles />
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </ToastProvider>
        </ThemeModeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
