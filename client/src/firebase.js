// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-fab79.firebaseapp.com",
  projectId: "mern-estate-fab79",
  storageBucket: "mern-estate-fab79.appspot.com",
  messagingSenderId: "813059041150",
  appId: "1:813059041150:web:d91afb3c58f15afb01752f",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
