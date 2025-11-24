importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBMShj8yFE4oN3gK7YStm2Lhgihn5EqWN4",
  authDomain: "internal-project-be8eb.firebaseapp.com",
  projectId: "internal-project-be8eb",
  storageBucket: "internal-project-be8eb.appspot.com",
  messagingSenderId: "945192117731",
  appId: "1:945192117731:web:b9c9718d5c38b3c31f6cd6",
  measurementId: "G-8J0Z9M8MEG"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {


  const notificationTitle = payload.notification.title || "New Notification";
  const notificationOptions = {
    body: payload.notification.body || "",
    icon: "/logo.png",
    badge: "/badge.png",
    tag: payload.data?.notificationId || "notification",
    requireInteraction: payload.data?.priority === "urgent",
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event.notification);

  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("/notifications") && "focus" in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow("/notifications");
      }
    })
  );
});