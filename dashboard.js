import { 
  auth,
  db,
  onAuthStateChanged,
  getUserData,
  saveUserData,
  logoutUser
} from "./firebase.js";

import { 
  doc, 
  getDoc, 
  collection, 
  query,
  where,
  getDocs,
  updateDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const usernameField = document.getElementById("usernameField");
const rankField = document.getElementById("rankField");
const tokensField = document.getElementById("tokens");
const goldField = document.getElementById("goldsUnlocked");
const packsField = document.getElementById("packsOpened");
const msgField = document.getElementById("messagesSent");
const friendsList = document.getElementById("friendsList");

const lookupBtn = document.getElementById("lookupBtn");
const logoutBtn = document.getElementById("logoutBtn");

const popup = document.getElementById("lookupPopup");
const lookupInput = document.getElementById("lookupInput");
const searchUserBtn = document.getElementById("searchUserBtn");
const closePopupBtn = document.getElementById("closePopupBtn");
const lookupError = document.getElementById("lookupError");

let currentUserID = null;
let currentUserData = null;

// -----------------------
// REAL-TIME USER DATA
// -----------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  currentUserID = user.uid;

  const ref = doc(db, "users", user.uid);

  onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;

    const data = snap.data();
    currentUserData = data;

    usernameField.textContent = data.username;
    rankField.textContent = data.rank ?? "New Player";
    tokensField.textContent = data.tokens ?? 0;
    goldField.textContent = data.goldsUnlocked ?? 0;
    packsField.textContent = data.packsOpened ?? 0;
    msgField.textContent = data.messagesSent ?? 0;

    friendsList.innerHTML = "";

    (data.friends || []).forEach(f => {
      const div = document.createElement("div");
      div.className = "friend-item";
      div.textContent = f;
      friendsList.appendChild(div);
    });
  });
});

// -----------------------
// LOOKUP POPUP
// -----------------------
lookupBtn.addEventListener("click", () => {
  lookupInput.value = "";
  lookupError.textContent = "";
  popup.style.display = "flex";
});

closePopupBtn.addEventListener("click", () => {
  popup.style.display = "none";
});

// -----------------------
// SEARCH USER BY USERNAME
// -----------------------
searchUserBtn.addEventListener("click", async () => {
  const name = lookupInput.value.trim();
  
  if (!name) return;

  try {
    const q = query(collection(db, "users"), where("username", "==", name));
    const results = await getDocs(q);

    if (results.empty) {
      lookupError.textContent = "User not found!";
      return;
    }

    const userDoc = results.docs[0];
    const userData = userDoc.data();
    const uid = userDoc.id;

    showLookedUpUser(userData, uid);

  } catch (err) {
    lookupError.textContent = err.message;
  }
});

// -----------------------
// DISPLAY OTHER USER PROFILE
// -----------------------
function showLookedUpUser(data, uid) {
  document.body.innerHTML = `
    <div class="top-bar">
      <h2>${data.username}</h2>
      <button class="top-btn" id="friendBtn">Add Friend</button>
      <button class="top-btn" id="backBtn">Back</button>
    </div>

    <div class="dashboard-grid">
      <div class="card"><h3>Rank</h3><div class="stat-number">${data.rank ?? 'New'}</div></div>
      <div class="card"><h3>Tokens</h3><div class="stat-number">${data.tokens ?? 0}</div></div>
      <div class="card"><h3>Gold Unlocked</h3><div class="stat-number">${data.goldsUnlocked ?? 0}</div></div>
      <div class="card"><h3>Packs Opened</h3><div class="stat-number">${data.packsOpened ?? 0}</div></div>
      <div class="card"><h3>Messages Sent</h3><div class="stat-number">${data.messagesSent ?? 0}</div></div>
    </div>
  `;

  document.getElementById("backBtn").onclick = () => window.location.reload();

  document.getElementById("friendBtn").onclick = async () => {
    const otherRef = doc(db, "users", uid);

    await updateDoc(otherRef, {
      friendRequests: [...(data.friendRequests || []), currentUserData.username]
    });

    alert("Friend request sent!");
    window.location.reload();
  };
}

// -----------------------
// LOGOUT
// -----------------------
logoutBtn.addEventListener("click", () => {
  logoutUser();
});
