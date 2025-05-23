// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyC2Ni-OI8MEp3yjuH0tWX6dt7xPTVxZ8ro',
  authDomain: 'gymmatch-9f827.firebaseapp.com',
  projectId: 'gymmatch-9f827',
  storageBucket: 'gymmatch-9f827.appspot.com',
  messagingSenderId: '314283386435',
  appId: '1:314283386435:web:bebc29098d7b558baa56f6',
  measurementId: 'G-F6ESNHYV6R',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Log initialization
console.log('Firebase initialized with project ID:', firebaseConfig.projectId);
console.log('Firestore instance created:', db ? 'Yes' : 'No');

export { auth, db };
