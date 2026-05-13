import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { KrishiDataProvider } from './context/KrishiDataContext';
import { ToastProvider } from './hooks/useToast.jsx';

// Styles
import './styles/global.css';
import './styles/components.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <KrishiDataProvider>
        <LanguageProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </LanguageProvider>
      </KrishiDataProvider>
    </AuthProvider>
  </React.StrictMode>
);
