// scripts/register.js
import { auth, db } from "./firebase.js";

import { 
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { 
  doc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const form = document.getElementById("registerForm");
const errorDiv = document.getElementById("error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorDiv.textContent = "";

  try {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    await updateProfile(user, { displayName: username });

    await setDoc(doc(db, "users", user.uid), {
      username,
      email,
      approved: false,          // Admin must approve
      tokens: 0,
      goldsUnlocked: 0,
      packsOpened: 0,
      messagesSent: 0,
      friends: [],
      friendRequests: []
    });

    alert("Account created! Waiting for admin approval.");
    window.location.href = "login.html";

  } catch (err) {
    errorDiv.textContent = err.message;
  }
});
