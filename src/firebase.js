import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCO0vhsXe2pE5fbHfo6020G1_aR_NChlHA",
  authDomain: "funmotion-a4585.firebaseapp.com",
  projectId: "funmotion-a4585",
  storageBucket: "funmotion-a4585.firebasestorage.app",
  messagingSenderId: "149572188919",
  appId: "1:149572188919:web:83a6c7226fbc42e1f171f2",
  measurementId: "G-HPB6KQD1F2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// const analytics = getAnalytics(app);

export { auth, db };
