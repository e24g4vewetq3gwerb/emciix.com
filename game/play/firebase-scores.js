/**
 * EMCIIX rhythm game — Firebase Auth + Firestore score sync
 * Loads as ES module; exposes window.EmciixScores for classic game.js.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signInWithCredential,
  linkWithPopup,
  linkWithRedirect,
  unlink,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  writeBatch,
  query,
  orderBy,
  limit,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "REDACTED",
  authDomain: "emciix-com.firebaseapp.com",
  projectId: "emciix-com",
  storageBucket: "emciix-com.firebasestorage.app",
  messagingSenderId: "679201324638",
  appId: "1:679201324638:web:c0896d0c86108c180dbecf",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();
const xProvider = new TwitterAuthProvider();
xProvider.setCustomParameters({ lang: "en" });

function clampStr(s, max) {
  const t = String(s == null ? "" : s);
  return t.length <= max ? t : t.slice(0, max);
}

const PENDING_MERGE_KEY = "emciix.game.pendingMerge";

function sumCloudBests(bests) {
  return Object.values(bests || {}).reduce(
    (s, b) => s + (Math.max(0, Math.floor(Number(b && b.score) || 0))),
    0
  );
}

/** @deprecated alias — prefer sumCloudBests */
function sumCloudBestsTotal(bests) {
  return sumCloudBests(bests);
}

/**
 * Per-level max by score; keep richer meta from the higher-scoring entry.
 * @param {Record<string, object>|null|undefined} a
 * @param {Record<string, object>|null|undefined} b
 */
function mergeBestsMaps(a, b) {
  const out = {};
  const ids = new Set([
    ...Object.keys(a || {}),
    ...Object.keys(b || {}),
  ]);
  ids.forEach((id) => {
    const left = (a && a[id]) || null;
    const right = (b && b[id]) || null;
    if (!left && !right) return;
    if (!left) {
      out[id] = { ...right };
      return;
    }
    if (!right) {
      out[id] = { ...left };
      return;
    }
    const ls = Math.max(0, Math.floor(Number(left.score) || 0));
    const rs = Math.max(0, Math.floor(Number(right.score) || 0));
    out[id] = rs > ls ? { ...right } : { ...left };
  });
  return out;
}

function writePendingMerge(fromUid, bests, profile) {
  try {
    localStorage.setItem(
      PENDING_MERGE_KEY,
      JSON.stringify({
        fromUid: String(fromUid || ""),
        bests: bests || {},
        displayName: profile && profile.displayName ? String(profile.displayName) : null,
        photoURL: profile && profile.photoURL ? String(profile.photoURL) : null,
        at: Date.now(),
      })
    );
  } catch (_) {}
}

function readPendingMerge() {
  try {
    const raw = localStorage.getItem(PENDING_MERGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.fromUid) return null;
    return parsed;
  } catch (_) {
    return null;
  }
}

function clearPendingMerge() {
  try {
    localStorage.removeItem(PENDING_MERGE_KEY);
  } catch (_) {}
}

function credentialFromAuthError(err) {
  if (!err) return null;
  try {
    return (
      GoogleAuthProvider.credentialFromError(err) ||
      TwitterAuthProvider.credentialFromError(err) ||
      err.credential ||
      null
    );
  } catch (_) {
    return err.credential || null;
  }
}

function isCredentialInUseError(err) {
  const code = String((err && err.code) || "");
  return (
    code === "auth/credential-already-in-use" ||
    code === "auth/email-already-in-use" ||
    code.includes("credential-already-in-use") ||
    code.includes("email-already-in-use")
  );
}

async function totalFromCloudBests() {
  try {
    return sumCloudBestsTotal(await loadCloudBests());
  } catch (_) {
    return 0;
  }
}

function getCurrentUser() {
  return auth.currentUser;
}

async function signInWithProvider(provider) {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err) {
    const code = (err && err.code) || "";
    // Popup blocked / COOP / third-party cookie issues → redirect flow
    if (
      code === "auth/popup-blocked" ||
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request" ||
      code === "auth/operation-not-supported-in-this-environment"
    ) {
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw err;
  }
}

async function signInGoogle() {
  return signInWithProvider(googleProvider);
}

async function signInX() {
  // Credentials fixed: try popup first; fall back to redirect if blocked/closed
  return signInWithProvider(xProvider);
}

/**
 * Remove this uid from the public board (monotonic totals cannot be zeroed).
 */
async function abandonPublicRank() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  await deleteDoc(doc(db, "gamePublicRanks", user.uid));
}

/**
 * Write any level where merged score > current cloud score, then refresh profile totals.
 * @param {Record<string, object>|null|undefined} fromBests
 * @param {{displayName?:string|null, photoURL?:string|null}|null} [fromProfile]
 */
async function applyMergedBests(fromBests, fromProfile) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  const cloud = await loadCloudBests();
  const merged = mergeBestsMaps(cloud, fromBests || {});
  const ids = Object.keys(merged);
  for (const levelId of ids) {
    const m = merged[levelId];
    if (!m) continue;
    const c = cloud[levelId];
    const mScore = Math.max(0, Math.floor(Number(m.score) || 0));
    const cScore = c ? Math.max(0, Math.floor(Number(c.score) || 0)) : -1;
    if (mScore > cScore) {
      await saveCloudBest(levelId, m, (m.title && String(m.title)) || levelId);
    }
  }
  const after = await loadCloudBests();
  const total = sumCloudBests(after);
  const surviving = await getUserProfile();
  const opts = {};
  if (fromProfile) {
    const survName = surviving && surviving.displayName ? String(surviving.displayName).trim() : "";
    const fromName = fromProfile.displayName ? String(fromProfile.displayName).trim() : "";
    if (fromName && (!survName || survName === "Player")) {
      opts.displayName = fromName;
    }
    const survPhoto = surviving && surviving.photoURL ? String(surviving.photoURL).trim() : "";
    const fromPhoto = fromProfile.photoURL ? String(fromProfile.photoURL).trim() : "";
    if (fromPhoto && !survPhoto) {
      opts.photoURL = fromPhoto;
    }
  }
  await upsertUserProfile(user, total, Object.keys(after).length, opts);
  return after;
}

/**
 * If a pending merge snapshot exists for a different uid, apply it into the current account.
 * @returns {Promise<boolean>} true if a merge was applied
 */
async function applyPendingMergeIfAny() {
  const pending = readPendingMerge();
  const user = auth.currentUser;
  if (!pending || !user) return false;
  if (String(pending.fromUid) === String(user.uid)) {
    clearPendingMerge();
    return false;
  }
  try {
    await applyMergedBests(pending.bests || {}, {
      displayName: pending.displayName || null,
      photoURL: pending.photoURL || null,
    });
    clearPendingMerge();
    try {
      api.lastLinkMerged = true;
    } catch (_) {}
    return true;
  } catch (err) {
    console.error("pending merge failed", err);
    throw err;
  }
}

/**
 * Handle credential-already-in-use during link: abandon this public rank, switch to
 * the account that owns the credential, merge max-per-level scores.
 */
async function mergeOnCredentialConflict(err, snapshot) {
  const cred = credentialFromAuthError(err);
  if (!cred) throw err;
  const fromUid = snapshot && snapshot.fromUid;
  const fromBests = (snapshot && snapshot.bests) || {};
  const fromProfile = (snapshot && snapshot.profile) || null;

  // Drop abandoned uid from public board while still signed in as that uid
  try {
    await abandonPublicRank();
  } catch (abandonErr) {
    console.warn("abandonPublicRank", abandonErr);
  }

  const result = await signInWithCredential(auth, cred);
  await applyMergedBests(fromBests, fromProfile);
  try {
    api.lastLinkMerged = true;
  } catch (_) {}
  clearPendingMerge();
  return result.user;
}

async function snapshotForPendingMerge(user) {
  const fromUid = user.uid;
  let fromBests = {};
  let fromProfile = null;
  try {
    fromBests = await loadCloudBests();
  } catch (_) {}
  try {
    fromProfile = await getUserProfile();
  } catch (_) {}
  writePendingMerge(fromUid, fromBests, fromProfile);
  return { fromUid, bests: fromBests, profile: fromProfile };
}

async function linkWithProvider(provider) {
  const user = auth.currentUser;
  if (!user) {
    // Not signed in — fall back to normal sign-in with that provider
    return signInWithProvider(provider);
  }
  try {
    api.lastLinkMerged = false;
  } catch (_) {}
  try {
    const result = await linkWithPopup(user, provider);
    clearPendingMerge();
    return result.user;
  } catch (err) {
    const code = (err && err.code) || "";
    if (
      code === "auth/popup-blocked" ||
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request" ||
      code === "auth/operation-not-supported-in-this-environment"
    ) {
      // Snapshot before redirect so conflict merge can proceed after return
      await snapshotForPendingMerge(user);
      await linkWithRedirect(user, provider);
      return null;
    }
    if (isCredentialInUseError(err)) {
      const snapshot = await snapshotForPendingMerge(user);
      return mergeOnCredentialConflict(err, snapshot);
    }
    throw err;
  }
}

async function linkGoogle() {
  return linkWithProvider(googleProvider);
}

async function linkX() {
  return linkWithProvider(xProvider);
}

/**
 * @returns {string[]} providerIds from current user (e.g. google.com, twitter.com)
 */
function getLinkedProviders() {
  const user = auth.currentUser;
  if (!user || !Array.isArray(user.providerData)) return [];
  return user.providerData
    .map((p) => (p && p.providerId) || "")
    .filter(Boolean);
}

async function unlinkProvider(providerId) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  await unlink(user, providerId);
  return user;
}

// Complete redirect return if any (sign-in or link); expose error for the game UI
getRedirectResult(auth)
  .then(async (result) => {
    if (result && result.user) {
      try {
        window.EmciixAuthRedirectUser = result.user;
        // operationType is "link" or "signIn" when available
        if (result.operationType) {
          window.EmciixAuthRedirectOp = result.operationType;
        }
      } catch (_) {}
      try {
        const merged = await applyPendingMergeIfAny();
        if (merged) {
          try {
            window.EmciixAuthRedirectOp = "merge";
          } catch (_) {}
        }
      } catch (mergeErr) {
        console.error("redirect pending merge", mergeErr);
      }
    }
  })
  .catch(async (err) => {
    console.error("redirect sign-in/link", err);
    if (isCredentialInUseError(err)) {
      try {
        const pending = readPendingMerge();
        const snapshot = pending
          ? {
              fromUid: pending.fromUid,
              bests: pending.bests || {},
              profile: {
                displayName: pending.displayName || null,
                photoURL: pending.photoURL || null,
              },
            }
          : null;
        // Prefer live snapshot if still signed in as the abandoned uid
        if (auth.currentUser && (!snapshot || auth.currentUser.uid === snapshot.fromUid)) {
          try {
            const live = await snapshotForPendingMerge(auth.currentUser);
            const user = await mergeOnCredentialConflict(err, live);
            try {
              window.EmciixAuthRedirectUser = user;
              window.EmciixAuthRedirectOp = "merge";
              window.EmciixAuthDidMerge = true;
            } catch (_) {}
            return;
          } catch (liveErr) {
            console.warn("live redirect merge failed, trying pending", liveErr);
          }
        }
        if (snapshot) {
          const user = await mergeOnCredentialConflict(err, snapshot);
          try {
            window.EmciixAuthRedirectUser = user;
            window.EmciixAuthRedirectOp = "merge";
            window.EmciixAuthDidMerge = true;
          } catch (_) {}
          return;
        }
      } catch (mergeErr) {
        console.error("redirect credential merge", mergeErr);
        err = mergeErr;
      }
    }
    try {
      window.EmciixAuthRedirectError = err;
      window.dispatchEvent(
        new CustomEvent("emciix-auth-redirect-error", { detail: err })
      );
    } catch (_) {}
  });

async function signOutUser() {
  await signOut(auth);
}

function onAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

/**
 * @returns {Promise<{displayName:string|null,totalScore:number,levelsCleared:number,photoURL:string|null}|null>}
 */
async function getUserProfile() {
  const user = auth.currentUser;
  if (!user) return null;
  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return null;
  const data = snap.data() || {};
  return {
    displayName: data.displayName ? String(data.displayName) : null,
    totalScore: Math.max(0, Math.floor(Number(data.totalScore) || 0)),
    levelsCleared: Math.max(0, Math.floor(Number(data.levelsCleared) || 0)),
    photoURL: data.photoURL ? String(data.photoURL) : null,
  };
}

/**
 * Resolve display name without clobbering a saved custom name.
 * @param {import('firebase/auth').User} user
 * @param {{displayName?:string}|null|undefined} opts
 * @param {{displayName?:string}|null|undefined} existing
 */
function resolveDisplayName(user, opts, existing) {
  const fromOpts =
    opts && opts.displayName != null ? String(opts.displayName).trim() : "";
  if (fromOpts) return clampStr(fromOpts, 80) || "Player";
  if (existing && existing.displayName) {
    const ex = String(existing.displayName).trim();
    if (ex) return clampStr(ex, 80) || "Player";
  }
  return clampStr((user && user.displayName) || "Player", 80) || "Player";
}

/**
 * @param {import('firebase/auth').User} user
 * @param {number} totalScore
 * @param {number} levelsCleared
 * @param {{displayName?:string}} [opts]
 * @returns {Promise<string>} resolved displayName
 */

async function publishPublicRank(user, displayName, totalScore, photoURL) {
  if (!user) return;
  let resolvedPhoto = photoURL != null ? String(photoURL) : "";
  if (!resolvedPhoto) {
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists() && snap.data().photoURL) {
        resolvedPhoto = String(snap.data().photoURL);
      }
    } catch (_) {}
  }
  if (!resolvedPhoto && user.photoURL) {
    resolvedPhoto = String(user.photoURL);
  }
  let existingRankTotal = 0;
  try {
    const rankSnap = await getDoc(doc(db, "gamePublicRanks", user.uid));
    if (rankSnap.exists()) {
      existingRankTotal = Math.max(
        0,
        Math.floor(Number(rankSnap.data().totalScore) || 0)
      );
    }
  } catch (_) {}
  const newTotal = Math.max(0, Math.floor(Number(totalScore) || 0));
  const payload = {
    displayName: clampStr(displayName || "Player", 80) || "Player",
    totalScore: Math.max(existingRankTotal, newTotal),
    updatedAt: Date.now(),
  };
  if (resolvedPhoto) {
    payload.photoURL = clampStr(resolvedPhoto, 100000);
  }
  await setDoc(doc(db, "gamePublicRanks", user.uid), payload, { merge: true });
}

async function upsertUserProfile(user, totalScore, levelsCleared, opts) {
  const existingSnap = await getDoc(doc(db, "users", user.uid));
  const existing = existingSnap.exists() ? existingSnap.data() : null;
  const displayName = resolveDisplayName(user, opts || {}, existing);
  const existingTotal = existing
    ? Math.max(0, Math.floor(Number(existing.totalScore) || 0))
    : 0;
  const payload = {
    displayName,
    updatedAt: Date.now(),
    totalScore: Math.max(existingTotal, Math.max(0, Math.floor(Number(totalScore) || 0))),
    levelsCleared: Math.max(
      existing ? Math.max(0, Math.floor(Number(existing.levelsCleared) || 0)) : 0,
      Math.max(0, Math.floor(Number(levelsCleared) || 0))
    ),
  };
  // Prefer explicit opts.photoURL, else existing custom photo, else Auth provider photo
  let photo = "";
  if (opts && opts.photoURL != null && String(opts.photoURL).trim()) {
    photo = String(opts.photoURL).trim();
  } else if (existing && existing.photoURL) {
    photo = String(existing.photoURL);
  } else if (user.photoURL) {
    photo = String(user.photoURL);
  }
  if (photo) payload.photoURL = clampStr(photo, 100000);
  if (user.email) payload.email = clampStr(user.email, 200);
  await setDoc(doc(db, "users", user.uid), payload, { merge: true });
  await publishPublicRank(user, payload.displayName, payload.totalScore, payload.photoURL);
  return displayName;
}

/**
 * Update the player's game display name (1–80 chars). Preserves totals.
 * Best-effort: refreshes leaderboard entry displayNames for scored levels.
 * @param {string} name
 * @returns {Promise<string>}
 */
async function updateDisplayName(name) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  const trimmed = String(name == null ? "" : name).trim();
  if (trimmed.length < 1 || trimmed.length > 80) {
    throw new Error("Name must be 1–80 characters");
  }
  const displayName = clampStr(trimmed, 80);
  const existing = await getUserProfile();
  const bests = await loadCloudBests();
  const cloudSum = sumCloudBestsTotal(bests);
  const totalScore = Math.max(existing ? existing.totalScore : 0, cloudSum);
  const levelsCleared = Math.max(
    existing ? existing.levelsCleared : 0,
    Object.keys(bests).length
  );
  const payload = {
    displayName,
    updatedAt: Date.now(),
    totalScore,
    levelsCleared,
  };
  // Prefer existing custom photoURL over Auth provider photo
  let photo = "";
  if (existing && existing.photoURL) {
    photo = String(existing.photoURL);
  } else if (user.photoURL) {
    photo = String(user.photoURL);
  }
  if (photo) payload.photoURL = clampStr(photo, 100000);
  if (user.email) payload.email = clampStr(user.email, 200);
  await setDoc(doc(db, "users", user.uid), payload, { merge: true });
  await publishPublicRank(user, payload.displayName, payload.totalScore, payload.photoURL);

  // Best-effort: keep leaderboard names in sync for levels the user has scored
  try {
    const bests = await loadCloudBests();
    const ids = Object.keys(bests);
    for (const levelId of ids.slice(0, 400)) {
      try {
        const lbRef = doc(db, "gameLeaderboard", levelId, "entries", user.uid);
        await updateDoc(lbRef, { displayName });
      } catch (_) {
        /* entry may not exist yet */
      }
    }
  } catch (err) {
    console.warn("leaderboard name sync", err);
  }

  return displayName;
}

/**
 * @returns {Promise<Record<string, {score:number,maxCombo:number,rank:string,accuracy:number,title?:string}>>}
 */
async function loadCloudBests() {
  const user = auth.currentUser;
  if (!user) return {};
  const col = collection(db, "users", user.uid, "scores");
  const snap = await getDocs(col);
  const out = {};
  snap.forEach((d) => {
    const data = d.data() || {};
    out[d.id] = {
      score: Number(data.score) || 0,
      maxCombo: Number(data.maxCombo) || 0,
      rank: String(data.rank || "D"),
      accuracy: typeof data.accuracy === "number" ? data.accuracy : 0,
      title: data.title ? String(data.title) : undefined,
    };
  });
  return out;
}

/**
 * Save a best score if it improves. Mirrors to leaderboard and updates user totals.
 * @param {string} levelId
 * @param {{score:number,maxCombo:number,rank:string,accuracy:number}} best
 * @param {string} [title]
 * @returns {Promise<{saved:boolean,improved:boolean}>}
 */
async function saveCloudBest(levelId, best, title) {
  const user = auth.currentUser;
  if (!user || !levelId || !best) return { saved: false, improved: false };

  const score = Math.max(0, Math.floor(Number(best.score) || 0));
  const maxCombo = Math.max(0, Math.floor(Number(best.maxCombo) || 0));
  const rank = ["SS", "S", "A", "B", "C", "D"].includes(best.rank)
    ? best.rank
    : "D";
  let accuracy = Number(best.accuracy);
  if (!Number.isFinite(accuracy)) accuracy = 0;
  accuracy = Math.min(1, Math.max(0, accuracy));
  const titleStr = clampStr(title || levelId, 80);
  const now = Date.now();

  const scoreRef = doc(db, "users", user.uid, "scores", levelId);
  const existing = await getDoc(scoreRef);
  const prevScore = existing.exists() ? Number(existing.data().score) || 0 : -1;
  const improved = score > prevScore;

  // Resolve Firestore display name (never clobber custom names via Auth)
  const profileSnap = await getDoc(doc(db, "users", user.uid));
  const profileData = profileSnap.exists() ? profileSnap.data() : null;
  const displayName = resolveDisplayName(user, null, profileData);

  if (!improved && existing.exists()) {
    // Still refresh profile totals from cloud in case of drift
    const all = await loadCloudBests();
    const totalScore = Object.values(all).reduce((s, b) => s + (b.score || 0), 0);
    await upsertUserProfile(user, totalScore, Object.keys(all).length);
    return { saved: false, improved: false };
  }

  const scorePayload = {
    score,
    maxCombo,
    rank,
    accuracy,
    updatedAt: now,
    title: titleStr,
  };

  const batch = writeBatch(db);
  batch.set(scoreRef, scorePayload, { merge: true });

  const lbRef = doc(db, "gameLeaderboard", levelId, "entries", user.uid);
  batch.set(
    lbRef,
    {
      ...scorePayload,
      displayName,
    },
    { merge: true }
  );
  await batch.commit();

  try {
    await publishLevelRank(levelId, {
      uid: user.uid,
      displayName,
      score,
      rank,
      title: titleStr,
    });
  } catch (err) {
    console.warn("level rank", err);
  }

  // Recompute totals from all bests (include this write)
  const all = await loadCloudBests();
  all[levelId] = {
    score,
    maxCombo,
    rank,
    accuracy,
    title: titleStr,
  };
  const totalScore = Object.values(all).reduce((s, b) => s + (b.score || 0), 0);
  await upsertUserProfile(user, totalScore, Object.keys(all).length);

  return { saved: true, improved: true };
}


function compressAvatarFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const max = 96;
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        if (!w || !h) throw new Error("Invalid image");
        const scale = Math.min(1, max / Math.max(w, h));
        w = Math.max(1, Math.round(w * scale));
        h = Math.max(1, Math.round(h * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        let quality = 0.65;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);
        while (dataUrl.length > 60000 && quality > 0.35) {
          quality -= 0.08;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        if (dataUrl.length > 60000) {
          const c2 = document.createElement("canvas");
          c2.width = 64;
          c2.height = 64;
          c2.getContext("2d").drawImage(img, 0, 0, 64, 64);
          dataUrl = c2.toDataURL("image/jpeg", 0.55);
          quality = 0.55;
        }
        URL.revokeObjectURL(url);
        if (dataUrl.length > 100000) {
          reject(new Error("Could not compress image enough — try a smaller photo"));
          return;
        }
        canvas.toBlob(
          (blob) => resolve({ dataUrl, blob: blob || null }),
          "image/jpeg",
          quality
        );
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

async function tryAvatarStorageUpload(user, blob) {
  if (!blob) return null;
  let useStorage = false;
  try {
    useStorage = localStorage.getItem("emciix.useAvatarStorage") === "1";
  } catch (_) {}
  if (!useStorage) return null;
  const path = "avatars/" + user.uid + "/avatar.jpg";
  const r = ref(storage, path);
  const uploadPromise = (async () => {
    await uploadBytes(r, blob, { contentType: "image/jpeg" });
    return await getDownloadURL(r);
  })();
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("avatar storage timeout")), 1500);
  });
  return await Promise.race([uploadPromise, timeoutPromise]);
}

async function uploadAvatar(file) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  if (!file || !String(file.type || "").startsWith("image/")) throw new Error("Choose an image file");
  if (file.size > 2 * 1024 * 1024) throw new Error("Image must be under 2MB");

  const compressed = await compressAvatarFile(file);
  let url = compressed.dataUrl;

  // Skip Firebase Storage by default (no Blaze) — data-URL → Firestore is fast.
  // Opt-in via localStorage.emciix.useAvatarStorage === "1" with a 1.5s race.
  try {
    const stored = await tryAvatarStorageUpload(user, compressed.blob);
    if (stored) url = stored;
  } catch (err) {
    console.warn("avatar storage skipped/failed, using inline photo", err);
    url = compressed.dataUrl;
  }

  const existing = await getUserProfile();
  const bests = await loadCloudBests();
  const cloudSum = sumCloudBestsTotal(bests);
  const totalScore = Math.max(existing ? existing.totalScore : 0, cloudSum);
  const levelsCleared = Math.max(
    existing ? existing.levelsCleared : 0,
    Object.keys(bests).length
  );
  const payload = {
    displayName: (existing && existing.displayName) || user.displayName || "Player",
    photoURL: clampStr(url, 100000),
    updatedAt: Date.now(),
    totalScore,
    levelsCleared,
  };
  if (user.email) payload.email = clampStr(user.email, 200);
  await setDoc(doc(db, "users", user.uid), payload, { merge: true });
  await publishPublicRank(user, payload.displayName, payload.totalScore, payload.photoURL);
  return payload.photoURL;
}

/**
 * Top public totals for the start-screen rank card.
 * @param {number} [n=10]
 * @returns {Promise<Array<{uid:string,displayName:string,totalScore:number}>>}
 */
async function loadPublicRanks(n) {
  const take = Math.max(1, Math.min(25, Number(n) || 10));
  const mapDoc = (d) => {
    const data = d.data() || {};
    return {
      uid: d.id,
      displayName: String(data.displayName || "Player"),
      totalScore: Math.max(0, Math.floor(Number(data.totalScore) || 0)),
      photoURL: data.photoURL ? String(data.photoURL) : null,
    };
  };
  try {
    const q = query(
      collection(db, "gamePublicRanks"),
      orderBy("totalScore", "desc"),
      limit(take)
    );
    const snap = await getDocs(q);
    const out = [];
    snap.forEach((d) => out.push(mapDoc(d)));
    return out;
  } catch (err) {
    console.warn("loadPublicRanks ordered query failed, falling back", err);
    const snap = await getDocs(collection(db, "gamePublicRanks"));
    const out = [];
    snap.forEach((d) => out.push(mapDoc(d)));
    out.sort((a, b) => b.totalScore - a.totalScore);
    return out.slice(0, take);
  }
}

const LEVEL_RANKS = () => doc(db, "gameLevelRanks", "board");

async function publishLevelRank(levelId, entry) {
  if (!levelId || !entry || !entry.uid) return;
  const ref = LEVEL_RANKS();
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const levels = snap.exists() && snap.data().levels ? { ...snap.data().levels } : {};
    const current = levels[levelId] && Array.isArray(levels[levelId].tops) ? levels[levelId].tops : [];
    const tops = current.filter((row) => row && row.uid !== entry.uid);
    tops.push({
      uid: String(entry.uid),
      displayName: clampStr(entry.displayName || "Player", 40) || "Player",
      score: Math.max(0, Math.floor(Number(entry.score) || 0)),
      rank: ["SS", "S", "A", "B", "C", "D"].includes(entry.rank) ? entry.rank : "D",
    });
    tops.sort((a, b) => b.score - a.score);
    levels[levelId] = {
      title: clampStr(entry.title || levelId, 80),
      tops: tops.slice(0, 5),
    };
    tx.set(ref, { levels, updatedAt: Date.now() }, { merge: true });
  });
}

async function syncLevelRanks(bests, titles) {
  const user = auth.currentUser;
  if (!user || !bests) return;
  const ids = Object.keys(bests).filter((id) => bests[id] && Number(bests[id].score) > 0);
  if (!ids.length) return;
  let key = user.uid + ":" + ids.map((id) => id + "=" + Math.floor(Number(bests[id].score) || 0)).sort().join(",");
  try {
    if (localStorage.getItem("emciix.levelRankSeed") === key) return;
  } catch (_) {}
  const profile = await getUserProfile();
  const displayName = (profile && profile.displayName) || user.displayName || "Player";
  for (const id of ids) {
    const best = bests[id];
    await publishLevelRank(id, {
      uid: user.uid,
      displayName,
      score: best.score,
      rank: best.rank || "D",
      title: (titles && titles[id]) || best.title || id,
    });
  }
  try { localStorage.setItem("emciix.levelRankSeed", key); } catch (_) {}
}

async function loadLevelRanks() {
  const snap = await getDoc(LEVEL_RANKS());
  if (!snap.exists()) return {};
  const levels = snap.data().levels;
  return levels && typeof levels === "object" ? levels : {};
}

const api = {
  signInGoogle,
  signInX,
  linkGoogle,
  linkX,
  getLinkedProviders,
  unlinkProvider,
  signOutUser,
  onAuth,
  loadCloudBests,
  saveCloudBest,
  getCurrentUser,
  getUserProfile,
  updateDisplayName,
  upsertUserProfile,
  loadPublicRanks,
  loadLevelRanks,
  publishLevelRank,
  syncLevelRanks,
  publishPublicRank,
  uploadAvatar,
  abandonPublicRank,
  applyMergedBests,
  applyPendingMergeIfAny,
  mergeBestsMaps,
  sumCloudBests,
  lastLinkMerged: false,
};

window.EmciixScores = api;
window.EmciixScoresBoot = "ready";
export {
  signInGoogle,
  signInX,
  linkGoogle,
  linkX,
  getLinkedProviders,
  unlinkProvider,
  signOutUser,
  onAuth,
  loadCloudBests,
  saveCloudBest,
  getCurrentUser,
  getUserProfile,
  updateDisplayName,
  upsertUserProfile,
  loadPublicRanks,
  loadLevelRanks,
  publishLevelRank,
  syncLevelRanks,
  publishPublicRank,
  uploadAvatar,
  abandonPublicRank,
  applyMergedBests,
  applyPendingMergeIfAny,
  mergeBestsMaps,
  sumCloudBests,
};
