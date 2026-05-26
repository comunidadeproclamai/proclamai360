import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App.jsx';
import { AuthProvider } from './modules/auth/context/AuthContext.jsx';
import { ThemeModeProvider } from './contexts/ThemeModeContext.jsx';
import { GlobalStyles } from './styles/GlobalStyles.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeModeProvider>
          <GlobalStyles />
          <App />
        </ThemeModeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

