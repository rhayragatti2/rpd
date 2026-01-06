import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Renderização do React
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registro do Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // O caminho '/sw.js' assume que o arquivo está dentro da pasta 'public'
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('Service Worker registrado com sucesso! Escopo:', reg.scope);
      })
      .catch((err) => {
        console.error('Falha ao registrar o Service Worker:', err);
      });
  });
}
