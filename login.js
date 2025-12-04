// scripts/login.js
import { 
  auth, 
  db,
  onAuthStateChanged
} from "./firebase.js";

import { 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { 
  doc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const form = document.getElementById("loginForm");
const errorDiv = document.getElementById("error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorDiv.textContent = "";

  try {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists() || snap.data().approved !== true) {
      errorDiv.textContent = "Your account has not yet been approved by an admin.";
      await auth.signOut();
      return;
    }

    window.location.href = "dashboard.html";

  } catch (err) {
    errorDiv.textContent = err.message;
  }
});

// Auto redirect if logged in already
onAuthStateChanged(auth, user => {
  if (user) window.location.href = "dashboard.html";
});
