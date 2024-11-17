import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB_ou03DnrvSDnBgPoprevFP5mLe47xGp0",
  authDomain: "online-poradna.firebaseapp.com",
  projectId: "online-poradna",
  storageBucket: "online-poradna.appspot.com",
  messagingSenderId: "432410077776",
  appId: "1:432410077776:web:5622ac5e0168c94003ff55",
  measurementId: "G-2R4H0Z20F2"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
