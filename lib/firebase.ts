import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyArbTjxUt20KNI1mKLS5sBOhFKxB0pLbUs",
  authDomain: "sinhviennet-fc858.firebaseapp.com",
  databaseURL: "https://sinhviennet-fc858-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sinhviennet-fc858",
  storageBucket: "sinhviennet-fc858.firebasestorage.app",
  messagingSenderId: "322852182802",
  appId: "1:322852182802:web:cdae1e0a267a23dcbcb1cb",
  measurementId: "G-HRTLPKBFB1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();