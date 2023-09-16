// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBG8b9p1jGLZ8G3LJtOQk50fE8QPFGqn28",
  authDomain: "shellhax2023.firebaseapp.com",
  projectId: "shellhax2023",
  storageBucket: "shellhax2023.appspot.com",
  messagingSenderId: "910147140299",
  appId: "1:910147140299:web:be936abd23412b2d5cf94e",
  measurementId: "G-2DFHDDXQ5S",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);


export default app;
