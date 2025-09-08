// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAOo9CO6n8cT_PBSrwd-Un56WSkYf452o4",
  authDomain: "dsavisuals.firebaseapp.com",
  projectId: "dsavisuals",
  storageBucket: "dsavisuals.firebasestorage.app",
  messagingSenderId: "664868099757",
  appId: "1:664868099757:web:d0ea18f55fec38aaba9824",
  measurementId: "G-568E5YY21X"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };