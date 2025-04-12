// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2Ni-OI8MEp3yjuH0tWX6dt7xPTVxZ8ro",
  authDomain: "gymmatch-9f827.firebaseapp.com",
  projectId: "gymmatch-9f827",
  storageBucket: "gymmatch-9f827.firebasestorage.app",
  messagingSenderId: "314283386435",
  appId: "1:314283386435:web:bebc29098d7b558baa56f6",
  measurementId: "G-F6ESNHYV6R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);