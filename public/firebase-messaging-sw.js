// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize Firebase
firebase.initializeApp({
    apiKey: "AIzaSyBMShj8yFE4oN3gK7YStm2Lhgihn5EqWN4",
    authDomain: "internal-project-be8eb.firebaseapp.com",
    projectId: "internal-project-be8eb",
    storageBucket: "internal-project-be8eb.firebasestorage.app",
    messagingSenderId: "945192117731",
    appId: "1:945192117731:web:b9c9718d5c38b3c31f6cd6",
    measurementId: "G-8J0Z9M8MEG"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'New Notification';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new message',
        icon: '/firebase-logo.png', // Make sure this exists in public folder
        badge: '/firebase-logo.png',
        data: payload.data || {}
    };

    // Show the notification
    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);

    event.notification.close();

    // Focus or open the app
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === self.registration.scope && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});