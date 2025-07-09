import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuración del entorno
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyBh2h_MSwfGvsY8j4Ld9TXk_GXDuu9my2o",
    authDomain: "chat-zaira.firebaseapp.com",
    databaseURL: "https://chat-zaira-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "chat-zaira",
    storageBucket: "chat-zaira.firebasestorage.app",
    messagingSenderId: "740980826094",
    appId: "1:740980826094:web:0b0ce062017222edc4f8ff",
    measurementId: "G-W0CS2FETLR"
  }
};

// Inicializacion de firebase
const app = initializeApp(environment.firebaseConfig);

// Exportaciones para usar en tu app
export const firebaseApp = app;
export const analytics = getAnalytics(app);
export const auth = getAuth(app); //trae la info del usuario logueado
export const db = getFirestore(app);
