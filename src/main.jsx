import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Inicializa a renderização do React na div #root
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/**
 * Registro do Service Worker para PWA e Notificações Push
 * O arquivo sw.js deve estar localizado na pasta /public
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registrado com sucesso! Escopo:', registration.scope);
      })
      .catch((error) => {
        console.error('Falha ao registrar o Service Worker:', error);
      });
  });
}
