import { onMessageListener, requestForToken } from "./firebase/firebase";


export const initializeNotifications = async () => {
    try {
        console.log("Initializing notifications...");

        const token = await requestForToken();

        if (token) {
            console.log("FCM Token obtained successfully");

            // Send token to your backend (optional)
            await sendTokenToBackend(token);

            // Set up foreground message listener
            setupForegroundListener();

            return token;
        }

        return null;
    } catch (error) {
        console.error("Error initializing notifications:", error);
        return null;
    }
};

const sendTokenToBackend = async (token) => {
    try {
        // Replace with your actual backend endpoint
        // Example:
        // const response = await fetch('/api/save-fcm-token', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({ token }),
        // });

        console.log("Token ready to send to backend:", token);
    } catch (error) {
        console.error("Error sending token to backend:", error);
    }
};

const setupForegroundListener = () => {
    onMessageListener()
        .then((payload) => {
            console.log("Foreground message received:", payload);

            // Show notification to user
            if (payload.notification) {
                showNotification(payload.notification);
            }
        })
        .catch((err) => {
            console.error("Error in foreground message listener:", err);
        });
};

const showNotification = (notification) => {
    // Check if browser supports notifications
    if (!("Notification" in window)) {
        console.log("This browser does not support notifications");
        return;
    }

    // If the user has granted permission, show notification
    if (Notification.permission === "granted") {
        new Notification(notification.title, {
            body: notification.body,
            icon: "/firebase-logo.png", // Make sure this file exists in public folder
        });
    }
};

// Utility function to check notification permission
export const checkNotificationPermission = () => {
    return Notification.permission;
};

// Request notification permission separately if needed
export const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        return permission;
    } catch (error) {
        console.error("Error requesting notification permission:", error);
        return "denied";
    }
};