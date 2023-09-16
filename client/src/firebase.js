import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyBG8b9p1jGLZ8G3LJtOQk50fE8QPFGqn28",
  authDomain: "shellhax2023.firebaseapp.com",
  projectId: "shellhax2023",
  storageBucket: "shellhax2023.appspot.com",
  messagingSenderId: "910147140299",
  appId: "1:910147140299:web:be936abd23412b2d5cf94e",
  measurementId: "G-2DFHDDXQ5S",
});

export const auth = firebaseApp.auth();
export const db = firebaseApp.firestore();
export default firebaseApp;
