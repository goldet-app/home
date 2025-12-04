// scripts/authGuard.js
import { auth, onAuthStateChanged } from "./firebase.js";

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "login.html";
  }
});
