
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// These values would normally be provided via environment variables.
// For this environment, we'll assume a standard structure.
const firebaseConfig = {
  apiKey: "AIzaSyAwhAFfvP8XBYSyY79AyqJ28ThoYZ3WHlA",
  authDomain: "cognitospark-e3246.firebaseapp.com",
  projectId: "cognitospark-e3246",
  storageBucket: "cognitospark-e3246.firebasestorage.app",
  messagingSenderId: "11223050736",
  appId: "1:11223050736:web:6b693cdc9e8b8206495535",
  measurementId: "G-8EQMJCXCEB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
