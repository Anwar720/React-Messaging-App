import admin from 'firebase-admin';
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase-admin/firestore'



const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    databaseURL: process.env.databaseURL,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId
};

const firebaseAdmin = admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.projectId,
        clientEmail: process.env.MY_CLIENT_EMAIL,
        privateKey:process.env.MY_PRIVATE_KEY
    }),
});
// Initialize Firebase
const firebase  = initializeApp(firebaseConfig);
const db = getFirestore(firebaseAdmin);



export {firebase,db}
