// public/sw.js
self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('SW Instalado');
});

self.addEventListener('activate', (event) => {
  console.log('SW Ativado');
});

// Escuta comandos do App principal
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(event.data.title, {
      body: event.data.body,
      icon: 'https://cdn-icons-png.flaticon.com/512/3665/3665923.png',
      badge: 'https://cdn-icons-png.flaticon.com/512/3665/3665923.png',
      vibrate: [200, 100, 200],
      tag: 'lembrete-diario' // Evita notificações duplicadas
    });
  }
});
