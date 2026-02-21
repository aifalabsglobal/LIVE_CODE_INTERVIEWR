import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const hasValidFirebaseConfig =
  firebaseApiKey && firebaseApiKey !== "xxx" && firebaseApiKey.length > 10;

const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "live-code-interviewer-sv.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "live-code-interviewer-sv",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "live-code-interviewer-sv.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "801834174909",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:801834174909:web:33da1136e14a901f862ad4",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-75Z1VG7Z60",
};

let app: FirebaseApp | undefined;
if (hasValidFirebaseConfig) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : (getApps()[0] as FirebaseApp);
  if (typeof window !== "undefined") {
    isSupported().then((supported) => {
      if (supported && app) getAnalytics(app);
    });
  }
}

export const firestore: Firestore | null = app ? getFirestore(app) : null;
