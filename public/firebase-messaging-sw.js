/* eslint-disable no-undef */

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyA0MAbBcK02N2VdpqiPaYgGW5rfy_zhd1s",
  authDomain: "lost-and-found-app-3bad6.firebaseapp.com",
  projectId: "lost-and-found-app-3bad6",
  storageBucket: "lost-and-found-app-3bad6.firebasestorage.app",
  messagingSenderId: "774841834382",
  appId: "1:774841834382:web:9ec80d2c1798bd6f4be2df",
  measurementId: "G-VH9WM1XVEC"
});

const messaging = firebase.messaging();
