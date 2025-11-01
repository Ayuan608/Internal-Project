// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// 🔥 Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBMShj8yFE4oN3gK7YStm2Lhgihn5EqWN4",
  authDomain: "internal-project-be8eb.firebaseapp.com",
  projectId: "internal-project-be8eb",
  storageBucket: "internal-project-be8eb.appspot.comeDRaUrRi4k6u54-_Gy6qpr:APA91bF5WNmqlmDUO_4vPj7q12GUFG_wxAyr9nGtSfQZj_E7I2jyfAsk3qUzNr4DtJ75xd66pV243Y1EFsFs4i_xy3FU2RZ90jcb_g4AAASHh9rgMgeV8yc",
  messagingSenderId: "945192117731",
  appId: "1:945192117731:web:b9c9718d5c38b3c31f6cd6",
  measurementId: "G-8J0Z9M8MEG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // 👇 register the service worker manually
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
        scope: "/firebase-cloud-messaging-push-scope",
      });

      const currentToken = await getToken(messaging, {
        vapidKey: "BPRGFHQY1lsEbWVSqe7ovs4IP3Cdh2AnDm372BY7vl27eUkOSYBgx-LkAGrqQ6D9-R_m9TKUsa8FtPgXjEde_zg",
        serviceWorkerRegistration: registration,
      });


      if (currentToken) {
        console.log("✅ Firebase token:", currentToken);
        return currentToken;
      } else {
        console.warn("⚠️ No registration token available.");
        return null;
      }
    } else {
      console.warn("🚫 Notification permission not granted.");
      return null;
    }
  } catch (e) {
    console.error("🔥 Error retrieving token:", e);
    return null;
  }
};


// 👇 Listen for messages while the app is in the foreground
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("📩 Foreground notification:", payload);
      resolve(payload);
    });
  });
