// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// --- COLLE TES CLÉS ICI (Remplacer tout ce bloc) ---
const firebaseConfig = {
  apiKey: "AIzaSyBb0rXpzCm1118HlCUj5uuf7Pqspn9yeUQ",
  authDomain: "rawdio-5901d.firebaseapp.com",
  projectId: "rawdio-5901d",
  messagingSenderId: "305943933508",
  appId: "1:305943933508:web:04565d41fb019555f64211"
};
// ---------------------------------------------------

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// On exporte les outils pour s'en servir ailleurs
export const db = getFirestore(app);    // Pour la liste de lecture
export const auth = getAuth(app);       // Pour l'authentification