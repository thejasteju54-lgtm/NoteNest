import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { NoteNestProvider } from './context/NoteNestContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <NoteNestProvider>
          <App />
        </NoteNestProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);
