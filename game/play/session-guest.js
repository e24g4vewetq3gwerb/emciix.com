import { initializeApp, getApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "REDACTED",
  authDomain: "emciix-com.firebaseapp.com",
  projectId: "emciix-com",
  storageBucket: "emciix-com.firebasestorage.app",
  messagingSenderId: "679201324638",
  appId: "1:679201324638:web:c0896d0c86108c180dbecf",
};

let app;
try { app = getApp(); } catch (_) { app = initializeApp(firebaseConfig); }
const auth = getAuth(app);
const db = getFirestore(app);

async function publishNamedSession(name, totalScore) {
  let user = auth.currentUser;
  if (!user) {
    const cred = await signInAnonymously(auth);
    user = cred.user;
  }
  const label = String(name || "Player").trim().slice(0, 24) || "Player";
  const pts = Math.max(0, Math.floor(Number(totalScore) || 0));
  await setDoc(
    doc(db, "gamePublicRanks", user.uid),
    { displayName: label, totalScore: pts, updatedAt: Date.now(), guest: true },
    { merge: true }
  );
  return { uid: user.uid, displayName: label, totalScore: pts };
}

window.EmciixPublishNamed = publishNamedSession;
if (window.EmciixScores) window.EmciixScores.publishNamedSession = publishNamedSession;
window.addEventListener("load", () => {
  if (window.EmciixScores && !window.EmciixScores.publishNamedSession) {
    window.EmciixScores.publishNamedSession = publishNamedSession;
  }
});
