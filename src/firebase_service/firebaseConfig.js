// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging,getToken } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBMShj8yFE4oN3gK7YStm2Lhgihn5EqWN4",
  authDomain: "internal-project-be8eb.firebaseapp.com",
  projectId: "internal-project-be8eb",
  storageBucket: "internal-project-be8eb.firebasestorage.app",
  messagingSenderId: "945192117731",
  appId: "1:945192117731:web:b9c9718d5c38b3c31f6cd6",
  measurementId: "G-8J0Z9M8MEG"
};
getToken(messaging, {vapidKey: "BPRGFHQY1lsEbWVSqe7ovs4IP3Cdh2AnDm372BY7vl27eUkOSYBgx-LkAGrqQ6D9-R_m9TKUsa8FtPgXjEde_zg"});
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const messaging = getMessaging(app);