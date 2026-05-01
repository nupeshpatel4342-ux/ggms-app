import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDpImkGw-7Bznh9r9_NBK2p8_bTKL5Otz0",
  authDomain: "ggms-app.firebaseapp.com",
  projectId: "ggms-app",
  storageBucket: "ggms-app.firebasestorage.app",
  messagingSenderId: "1016836559617",
  appId: "1:1016836559617:web:0e236f99f3cd1714ce8100"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
