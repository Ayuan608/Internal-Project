// src/firebase/notificationService.js
import { requestForToken, onMessageListener } from "./firebase";

export const initializeNotification = async () => {
  const token = await requestForToken();
  if (token) {
    console.log("FCM Token:", token);
    // Optionally, send this token to your backend to store per user
  }

  onMessageListener()
    .then((payload) => {
      console.log("Received in foreground:", payload);
      alert(`${payload.notification.title} - ${payload.notification.body}`);
    })
    .catch((err) => console.error("Error receiving foreground message: ", err));
};
