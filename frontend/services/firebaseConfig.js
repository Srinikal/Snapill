import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';  // Import Firebase Storage
import { FIREBASE_KEY} from '@env';
// Your Firebase project configuration
const firebaseConfig = {
  apiKey: FIREBASE_KEY ,
  authDomain: "snapill.firebaseapp.com",
  projectId: "snapill",
  storageBucket: "snapill.appspot.com",
  messagingSenderId: "575603483926",
  appId: "1:575603483926:web:30fbb6029398e39c8c9c37",
  measurementId: "G-KEEHN55MF7"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); 

export { db, auth, storage };