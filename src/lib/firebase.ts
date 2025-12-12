"use client"

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyC5bZuOefNBdn5-pe9Tdf8YUZRfpWgjry0",
    authDomain: "cleit-cdc.firebaseapp.com",
    projectId: "cleit-cdc",
    storageBucket: "cleit-cdc.firebasestorage.app",
    messagingSenderId: "762411482665",
    appId: "1:762411482665:web:0031e39337d854e957e638",
    measurementId: "G-VJJRRGLS62"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

export { auth, storage }; 
