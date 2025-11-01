import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBMShj8yFE4oN3gK7YStm2Lhgihn5EqWN4",
  authDomain: "internal-project-be8eb.firebaseapp.com",
  projectId: "internal-project-be8eb",
  storageBucket: "internal-project-be8eb.firebasestorage.app",
  messagingSenderId: "945192117731",
  appId: "1:945192117731:web:b9c9718d5c38b3c31f6cd6",
  measurementId: "G-8J0Z9M8MEG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging = null;

// Initialize messaging only if supported
const initializeMessaging = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      messaging = getMessaging(app);
      console.log("Firebase Messaging initialized successfully");
      return messaging;
    } else {
      console.warn("Firebase Messaging is not supported in this environment");
      return null;
    }
  } catch (error) {
    console.error("Error initializing Firebase Messaging:", error);
    return null;
  }
};

// Request permission and get FCM token
export const requestForToken = async () => {
  try {
    // Initialize messaging if not already done
    if (!messaging) {
      messaging = await initializeMessaging();
    }

    if (!messaging) {
      console.warn("Messaging not available");
      return null;
    }

    // Check if we're in a browser environment
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.warn("Notifications not supported in this environment");
      return null;
    }

    // Request notification permission
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      console.log("Notification permission granted.");

      // Get FCM token
      const currentToken = await getToken(messaging, {
        vapidKey: "BPRGFHQY1lsEbWVSqe7ovs4IP3Cdh2AnDm372BY7vl27eUkOSYBgx-LkAGrqQ6D9-R_m9TKUsa8FtPgXjEde_zg",
      });

      if (currentToken) {
        console.log("FCM token:", currentToken);
        return currentToken;
      } else {
        console.warn("No registration token available.");
        return null;
      }
    } else {
      console.warn("Notification permission not granted.");
      return null;
    }
  } catch (err) {
    console.error("An error occurred while retrieving token:", err);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve, reject) => {
    if (!messaging) {
      initializeMessaging().then(messagingInstance => {
        if (messagingInstance) {
          onMessage(messagingInstance, (payload) => {
            console.log("Received foreground message:", payload);
            resolve(payload);
          });
        } else {
          reject(new Error("Messaging not available"));
        }
      });
    } else {
      onMessage(messaging, (payload) => {
        console.log("Received foreground message:", payload);
        resolve(payload);
      });
    }
  });

// Get messaging instance (for use in other parts of your app)
export const getMessagingInstance = async () => {
  if (!messaging) {
    messaging = await initializeMessaging();
  }
  return messaging;
};

// Export the app instance as well
export { app };