// src/firebase.js
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// 你從 Firebase Console 拿到的設定
const firebaseConfig = {
  apiKey: "AIzaSyC00vhsXe2pE5BhfHo6020Gl_aR_NChlHA",
  authDomain: "funmotion-a4585.firebaseapp.com",
  projectId: "funmotion-a4585",
  storageBucket: "funmotion-a4585.appspot.com",
  messagingSenderId: "149572188919",
  appId: "1:149572188919:web:83a6c7226fbc42e1f171f2",
  measurementId: "G-HPB6KQD1F2"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 初始化 Firebase Authentication
export const auth = getAuth(app);
