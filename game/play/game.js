/**
 * One Feeling, One Promise — playable neon rhythm game
 * Self-contained; no build step. Keys: D/F/J or ←/↓/→ + on-screen pads.
 */
(function () {
  "use strict";

  const FALL_TIME = 2.0;
  const HIT_Y_PCT = 78; // matches --hit-y
  const SPAWN_Y_PCT = 6;
  const BASE_WINDOWS = {
    perfect: 0.045,
    great: 0.09,
    good: 0.14,
    miss: 0.2,
  };
  const SCORE = { perfect: 300, great: 200, good: 100, miss: 0 };
  const BESTS_KEY = "emciix-rhythm-bests";
  const SAVE_KEY = "emciix-savepoint";
  function readSaveIndex(list) { try { const raw = localStorage.getItem(SAVE_KEY); if (!raw) return 0; const data = JSON.parse(raw); if (!data || !list || !list.length) return 0; if (data.id) { const i = list.findIndex((l) => l && l.id === data.id); if (i >= 0) return i; } const idx = Math.floor(Number(data.index) || 0); return Math.max(0, Math.min(list.length - 1, idx)); } catch (_) { return 0; } }
  function writeSavePoint(index, meta) { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ index: index, id: meta && meta.id ? meta.id : "", title: meta && meta.title ? meta.title : "", at: Date.now() })); } catch (_) {} }
  const UPGRADES_GUEST_KEY = "emciix-upgrades";
  const UPGRADE_LAYOUT_KEY = "emciix-upgrade-layout";
  const MAX_UPGRADE_LV = 5;
  const UPGRADE_TRACKS = {
    focus: {
      name: "FOCUS",
      blurb: "Widen hit timing",
      costs: [800, 1600, 3200, 6400, 12800],
      color: "focus",
    },
    power: {
      name: "POWER",
      blurb: "Fever / score boost",
      costs: [1000, 2000, 4000, 8000, 16000],
      color: "power",
    },
    flow: {
      name: "FLOW",
      blurb: "NOS recovery / miss soften",
      costs: [900, 1800, 3600, 7200, 14400],
      color: "flow",
    },
    pulse: {
      name: "PULSE",
      blurb: "Combo armor on GOOD hits",
      costs: [1100, 2200, 4400, 8800, 17600],
      color: "pulse",
    },
    reach: {
      name: "REACH",
      blurb: "Notes fall a bit slower",
      costs: [950, 1900, 3800, 7600, 15200],
      color: "reach",
    },
    vault: {
      name: "VAULT",
      blurb: "Extra points on PERFECT",
      costs: [1200, 2400, 4800, 9600, 19200],
      color: "vault",
    },
    perfect: {
      name: "PERFECTOMUS",
      blurb: "One tap hits all 3. Auto-catch before a miss.",
      costs: [19200],
      color: "perfect",
    },
    echo: {
      name: "ECHO",
      blurb: "Combo adds score",
      costs: [700, 1400, 2800, 5600, 11200],
      color: "echo",
    },
    shield: {
      name: "SHIELD",
      blurb: "Misses cut less health",
      costs: [850, 1700, 3400, 6800, 13600],
      color: "shield",
    },
    rush: {
      name: "RUSH",
      blurb: "NOS fills faster",
      costs: [1050, 2100, 4200, 8400, 16800],
      color: "rush",
    },
  };
  const SECTIONS = [
    [0.0, 30.0, "ONE FEELING", "LIVE TAKE", "HOPE NODE"],
    [30.0, 45.0, "ONE FEELING", "KEEP IT CLEAN", "HOPE NODE"],
    [45.0, 75.0, "ONE PROMISE", "LIVE TAKE", "FEELING LOCK"],
    [75.0, 100.0, "ONE FEELING", "KEEP IT CLEAN", "HOPE NODE"],
    [100.0, 142.0, "ONE PROMISE", "START TODAY", "FEELING LOCK"],
    [142.0, 160.0, "ONE PROMISE", "START TODAY", "HOPE NODE"],
  ];

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const audio = $("#audio");
  const startOverlay = $("#start-overlay");
  const resultsOverlay = $("#results-overlay");
  const pauseOverlay = $("#pause-overlay");
  const levelsOverlay = $("#levels-overlay");
  const levelsGrid = $("#levels-grid");
  const gameEl = $("#game");
  const startBtn = $("#start-btn");
  const retryBtn = $("#retry-btn");
  const loadStatus = $("#load-status");
  const notesLayer = $("#notes-layer");
  const lyricStrip = $("#lyric-strip");
  const judgeEl = $("#judge");
  const scoreEl = $("#score");
  const comboEl = $("#combo");
  const chainVal = $("#chain-val");
  const timerEl = $("#timer");
  const sectionPill = $("#section-pill");
  const feverFill = $("#fever-fill");
  const feverTag = $("#fever-tag");
  const healthFill = $("#health-fill");
  const sideLeftLabel = $("#side-left-label");
  const sideRightLabel = $("#side-right-label");
  const sideLeftScroll = $("#side-left-scroll");
  const sideRightScroll = $("#side-right-scroll");
  const pauseBtn = $("#btn-pause");

  let levels = [];
  let levelIndex = 0;
  let levelMeta = null;
  let chart = null;
  let lyrics = [];
  let notes = []; // runtime note objects
  let playing = false;
  let paused = false;
  let raf = 0;
  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let chain = 0;
  let health = 1;
  let fever = false;
  const NOS_TRIGGER = 0.02; // ~2% — close to empty
  const NOS_CAP = 0.25;     // recovery ceiling
  const NOS_MODES = [
    { id: "perfect", hint: "HIT PERFECTS — fill to 25%", boost: 0.045 },
    { id: "sync", hint: "MASH SYNC (F) — fill to 25%", boost: 0.018 },
    { id: "alt", hint: "ALT A ↔ B (D/J) — fill to 25%", boost: 0.022 },
  ];
  let nosActive = false;
  let nosMode = null;
  let nosAltLast = -1;
  let nosModeIdx = 0;
  const healthRow = document.querySelector(".health-row");
  const nosBanner = $("#nos-banner");
  const nosHint = $("#nos-hint");
  const nosPill = $("#nos-pill");
  let counts = { perfect: 0, great: 0, good: 0, miss: 0 };
  let judgeTimer = 0;
  let laneCenters = [0, 0, 0];
  let lanesEl = null;

  /** @type {'start'|'results'|'pause'|null} */
  let levelsFrom = null;
  let confirmFromLevels = false;
  /** @type {'start'|'results'|'pause'|null} */
  let upgradeFrom = null;
  let upgradeSelectedTrack = "focus";
  /** @type {{focus:number,power:number,flow:number,pulse:number,reach:number,vault:number,spent:number,layout:string}} */
  let upgradesState = { focus: 0, power: 0, flow: 0, pulse: 0, reach: 0, vault: 0, spent: 0, layout: "a" };
  let pulseArmor = 0;

  /** @type {{displayName:string|null,totalScore:number}|null} */
  let cloudProfile = null;

  const KEY_MAP = {
    KeyD: 0,
    KeyF: 1,
    KeyJ: 2,
    ArrowLeft: 0,
    ArrowDown: 1,
    ArrowRight: 2,
  };

  function loadBests() {
    try {
      const raw = localStorage.getItem(BESTS_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function saveBests(bests) {
    try {
      localStorage.setItem(BESTS_KEY, JSON.stringify(bests));
    } catch (_) {}
  }

  function getBest(levelId) {
    if (!levelId) return null;
    const bests = loadBests();
    return bests[levelId] || null;
  }

  function showAuthError(msg) {
    const el = $("#auth-error");
    if (!el) return;
    if (!msg) {
      el.textContent = "";
      el.classList.add("hidden");
      return;
    }
    el.textContent = msg;
    el.classList.remove("hidden");
  }

  function setSyncStatus(text, kind) {
    const el = $("#sync-status");
    if (!el) return;
    el.textContent = text || "";
    el.classList.remove("synced", "error");
    if (kind === "synced") el.classList.add("synced");
    if (kind === "error") el.classList.add("error");
  }

  function formatPoints(n) {
    const v = Math.max(0, Math.floor(Number(n) || 0));
    try {
      return v.toLocaleString();
    } catch (_) {
      return String(v);
    }
  }

  function sumLocalBests() {
    const bests = loadBests();
    return Object.values(bests).reduce((s, b) => s + (Number(b && b.score) || 0), 0);
  }

  function setPointsUI(total) {
    const val = Math.max(0, Math.floor(Number(total) || 0));
    const authVal = $("#auth-points-val");
    if (authVal) authVal.textContent = formatPoints(val);
    const levelsVal = $("#levels-points-val");
    if (levelsVal) levelsVal.textContent = formatPoints(val);
    const levelsPts = $("#levels-points");
    if (levelsPts) {
      const signedIn = !!(cloudProfile || (window.EmciixScores && window.EmciixScores.getCurrentUser && window.EmciixScores.getCurrentUser()));
      levelsPts.classList.toggle("hidden", !signedIn);
    }
  }

  function clampLevel(n) {
    const v = Math.floor(Number(n) || 0);
    return Math.max(0, Math.min(MAX_UPGRADE_LV, v));
  }

  function trackMaxLevel(track) {
    const meta = UPGRADE_TRACKS[track];
    return meta && meta.costs ? meta.costs.length : MAX_UPGRADE_LV;
  }

  function getFallTime() {
    const reach = clampLevel(upgradesState && upgradesState.reach);
    return FALL_TIME * (1 + 0.04 * reach);
  }

  function defaultUpgrades(layout) {
    return {
      focus: 0,
      power: 0,
      flow: 0,
      pulse: 0,
      reach: 0,
      vault: 0,
      perfect: 0,
      echo: 0,
      shield: 0,
      rush: 0,
      spent: 0,
      layout: layout === "b" || layout === "c" ? layout : "a",
    };
  }

  function normalizeUpgrades(raw, layoutHint) {
    const d = defaultUpgrades(layoutHint);
    if (!raw || typeof raw !== "object") return d;
    Object.keys(UPGRADE_TRACKS).forEach((key) => {
      d[key] = clampLevel(raw[key]);
    });
    d.spent = Math.max(0, Math.floor(Number(raw.spent) || 0));
    const lay = String(raw.layout || layoutHint || "a").toLowerCase();
    d.layout = lay === "b" || lay === "c" ? lay : "a";
    const minSpent = minSpentForLevels(d);
    if (d.spent < minSpent) d.spent = minSpent;
    return d;
  }

  function minSpentForLevels(levels) {
    let sum = 0;
    const src = levels && typeof levels === "object" ? levels : {};
    Object.keys(UPGRADE_TRACKS).forEach((track) => {
      const lv = clampLevel(src[track]);
      const costs = UPGRADE_TRACKS[track].costs;
      for (let i = 0; i < lv && i < costs.length; i++) sum += costs[i];
    });
    return sum;
  }

  function upgradesStorageKey(uid) {
    if (uid) return UPGRADES_GUEST_KEY + ":" + uid;
    return UPGRADES_GUEST_KEY;
  }

  function readUpgradesKey(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function writeUpgradesKey(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (_) {}
  }

  function readLayoutPref() {
    try {
      const lay = String(localStorage.getItem(UPGRADE_LAYOUT_KEY) || "").toLowerCase();
      if (lay === "a" || lay === "b" || lay === "c") return lay;
    } catch (_) {}
    return null;
  }

  function writeLayoutPref(layout) {
    try {
      localStorage.setItem(UPGRADE_LAYOUT_KEY, layout);
    } catch (_) {}
  }

  function currentAuthUid() {
    try {
      const api = window.EmciixScores;
      const user = api && api.getCurrentUser && api.getCurrentUser();
      return user && user.uid ? String(user.uid) : null;
    } catch (_) {
      return null;
    }
  }

  function loadUpgrades() {
    const uid = currentAuthUid();
    const layoutPref = readLayoutPref();
    const guest = normalizeUpgrades(readUpgradesKey(UPGRADES_GUEST_KEY), layoutPref || "a");
    if (!uid) {
      if (layoutPref) guest.layout = layoutPref;
      upgradesState = guest;
      return upgradesState;
    }
    const userRaw = readUpgradesKey(upgradesStorageKey(uid));
    if (!userRaw) {
      // seed user key from guest
      const seeded = Object.assign({}, guest);
      if (layoutPref) seeded.layout = layoutPref;
      writeUpgradesKey(upgradesStorageKey(uid), seeded);
      upgradesState = seeded;
      return upgradesState;
    }
    const user = normalizeUpgrades(userRaw, layoutPref || userRaw.layout || "a");
    if (layoutPref) user.layout = layoutPref;
    upgradesState = user;
    return upgradesState;
  }

  function saveUpgrades(state) {
    const next = normalizeUpgrades(state, state && state.layout);
    upgradesState = next;
    writeUpgradesKey(UPGRADES_GUEST_KEY, next);
    const uid = currentAuthUid();
    if (uid) writeUpgradesKey(upgradesStorageKey(uid), next);
    writeLayoutPref(next.layout);
    return next;
  }

  function mergeUpgradesOnSignIn(uid) {
    if (!uid) {
      loadUpgrades();
      return upgradesState;
    }
    const guest = normalizeUpgrades(readUpgradesKey(UPGRADES_GUEST_KEY), readLayoutPref() || "a");
    const user = normalizeUpgrades(readUpgradesKey(upgradesStorageKey(uid)), guest.layout);
    const merged = {
      focus: Math.max(guest.focus, user.focus),
      power: Math.max(guest.power, user.power),
      flow: Math.max(guest.flow, user.flow),
      pulse: Math.max(guest.pulse || 0, user.pulse || 0),
      reach: Math.max(guest.reach || 0, user.reach || 0),
      vault: Math.max(guest.vault || 0, user.vault || 0),
      spent: Math.max(guest.spent, user.spent),
      layout: readLayoutPref() || user.layout || guest.layout || "a",
    };
    const minSpent = minSpentForLevels(merged);
    merged.spent = Math.max(merged.spent, minSpent);
    upgradesState = normalizeUpgrades(merged, merged.layout);
    writeUpgradesKey(upgradesStorageKey(uid), upgradesState);
    writeUpgradesKey(UPGRADES_GUEST_KEY, upgradesState);
    writeLayoutPref(upgradesState.layout);
    return upgradesState;
  }

  function lifetimePoints() {
    if (cloudProfile && typeof cloudProfile.totalScore === "number") {
      return Math.max(0, Math.floor(cloudProfile.totalScore), sumLocalBests());
    }
    return sumLocalBests();
  }

  function spendablePoints() {
    const life = lifetimePoints();
    const spent = Math.max(0, Math.floor((upgradesState && upgradesState.spent) || 0));
    return Math.max(0, life - spent);
  }

  function nextCost(track) {
    const meta = UPGRADE_TRACKS[track];
    if (!meta) return null;
    const lv = clampLevel(upgradesState[track]);
    const maxLv = trackMaxLevel(track);
    if (lv >= maxLv) return null;
    return meta.costs[lv];
  }

  function getWindows() {
    const focus = clampLevel(upgradesState && upgradesState.focus);
    const scale = 1 + 0.08 * focus;
    return {
      perfect: BASE_WINDOWS.perfect * scale,
      great: BASE_WINDOWS.great * scale,
      good: BASE_WINDOWS.good * scale,
      miss: BASE_WINDOWS.miss * scale,
    };
  }

  function powerScoreMult() {
    return 1 + 0.05 * clampLevel(upgradesState && upgradesState.power);
  }

  function feverComboThreshold() {
    const power = clampLevel(upgradesState && upgradesState.power);
    return Math.max(12, 20 - power * 2);
  }

  function feverFillDenom() {
    const power = clampLevel(upgradesState && upgradesState.power);
    return Math.max(28, 40 - power * 3);
  }

  function tryBuyTrack(track) {
    const meta = UPGRADE_TRACKS[track];
    if (!meta) return false;
    loadUpgrades();
    const lv = clampLevel(upgradesState[track]);
    const maxLv = trackMaxLevel(track);
    if (lv >= maxLv) return false;
    const cost = meta.costs[lv];
    if (spendablePoints() < cost) return false;
    const next = Object.assign({}, upgradesState);
    next[track] = lv + 1;
    next.spent = Math.max(0, Math.floor(next.spent || 0)) + cost;
    saveUpgrades(next);
    refreshUpgradeUI();
    return true;
  }

  function hideNameEdit() {
    const row = $("#auth-name-edit");
    if (row) row.classList.add("hidden");
  }


  function formatPoints(n) {
    const v = Math.max(0, Math.floor(Number(n) || 0));
    return v.toLocaleString("en-US");
  }

  function renderPublicRanks(rows) {
    const list = $("#public-rank-list");
    if (!list) return;
    list.innerHTML = "";
    if (!rows || !rows.length) {
      const li = document.createElement("li");
      li.className = "public-rank-empty";
      li.textContent = "No public scores yet — be first";
      list.appendChild(li);
      return;
    }
    rows.forEach((row, i) => {
      const li = document.createElement("li");
      li.innerHTML =
        '<span class="rank-pos">' + (i + 1) + '</span>' +
        '<span class="rank-player">' +
          '<img class="rank-avatar" alt="" width="24" height="24" data-placeholder="1" />' +
          '<span class="rank-name"></span>' +
        '</span>' +
        '<span class="rank-pts"></span>';
      li.querySelector(".rank-name").textContent = row.displayName || "Player";
      li.querySelector(".rank-pts").textContent = formatPoints(row.totalScore);
      const img = li.querySelector(".rank-avatar");
      const photo = row.photoURL ? String(row.photoURL) : "";
      if (img) {
        if (/^https?:\/\//i.test(photo)) {
          img.src = photo;
          img.removeAttribute("data-placeholder");
          img.onerror = function () {
            this.removeAttribute("src");
            this.setAttribute("data-placeholder", "1");
            this.onerror = null;
          };
        } else {
          img.removeAttribute("src");
          img.setAttribute("data-placeholder", "1");
        }
      }
      list.appendChild(li);
    });
  }

  async function refreshPublicRanks() {
    const list = $("#public-rank-list");
    if (!list) return;
    const api = window.EmciixScores || (await waitForEmciixScores(10000));
    if (!api || !api.loadPublicRanks) {
      renderPublicRanks([]);
      return;
    }
    try {
      const rows = await api.loadPublicRanks(10);
      renderPublicRanks(rows);
    } catch (err) {
      console.error(err);
      list.innerHTML = "";
      const li = document.createElement("li");
      li.className = "public-rank-empty";
      li.textContent = "Ranks unavailable";
      list.appendChild(li);
    }
  }

  function updateAuthChip(user) {
    const chip = $("#auth-chip");
    const nameEl = $("#auth-chip-name");
    const avatarEl = $("#auth-chip-avatar");
    const signInRow = $("#auth-signin-row");
    const signInBtn = $("#btn-google-signin");
    const signInXBtn = $("#btn-x-signin");
    const badgeGoogle = $("#auth-badge-google");
    const badgeX = $("#auth-badge-x");
    const linkGoogleBtn = $("#btn-link-google");
    const linkXBtn = $("#btn-link-x");
    if (!chip) return;
    if (user) {
      chip.classList.remove("hidden");
      if (signInRow) signInRow.classList.add("hidden");
      if (signInBtn) signInBtn.classList.add("hidden");
      if (signInXBtn) signInXBtn.classList.add("hidden");
      if (nameEl) {
        const name =
          (cloudProfile && cloudProfile.displayName) ||
          user.displayName ||
          user.email ||
          "Signed in";
        nameEl.textContent = name;
      }
      const photo =
        (cloudProfile && cloudProfile.photoURL) ||
        user.photoURL ||
        "";
      if (avatarEl) {
        if (photo) {
          avatarEl.src = photo;
          avatarEl.alt = "Profile photo";
          avatarEl.removeAttribute("data-placeholder");
        } else {
          avatarEl.removeAttribute("src");
          avatarEl.alt = "";
          avatarEl.setAttribute("data-placeholder", "1");
        }
      }
      const pts =
        cloudProfile && typeof cloudProfile.totalScore === "number"
          ? cloudProfile.totalScore
          : 0;
      setPointsUI(pts);

      // Linked provider badges / connect buttons
      let linked = [];
      try {
        const api = window.EmciixScores;
        if (api && api.getLinkedProviders) linked = api.getLinkedProviders() || [];
        else if (Array.isArray(user.providerData)) {
          linked = user.providerData.map((p) => p && p.providerId).filter(Boolean);
        }
      } catch (_) {}
      const hasGoogle = linked.indexOf("google.com") !== -1;
      const hasX = linked.indexOf("twitter.com") !== -1;
      if (badgeGoogle) badgeGoogle.classList.toggle("hidden", !hasGoogle);
      if (badgeX) badgeX.classList.toggle("hidden", !hasX);
      if (linkGoogleBtn) linkGoogleBtn.classList.toggle("hidden", hasGoogle);
      if (linkXBtn) linkXBtn.classList.toggle("hidden", hasX);
    } else {
      chip.classList.add("hidden");
      hideNameEdit();
      cloudProfile = null;
      if (signInRow) signInRow.classList.remove("hidden");
      if (signInBtn) signInBtn.classList.remove("hidden");
      if (signInXBtn) signInXBtn.classList.remove("hidden");
      if (nameEl) nameEl.textContent = "";
      if (avatarEl) {
        avatarEl.removeAttribute("src");
        avatarEl.alt = "";
      }
      if (badgeGoogle) badgeGoogle.classList.add("hidden");
      if (badgeX) badgeX.classList.add("hidden");
      if (linkGoogleBtn) linkGoogleBtn.classList.add("hidden");
      if (linkXBtn) linkXBtn.classList.add("hidden");
      setPointsUI(0);
      const levelsPts = $("#levels-points");
      if (levelsPts) levelsPts.classList.add("hidden");
    }
  }

  function mergeCloudIntoLocal(cloud) {
    const bests = loadBests();
    let changed = false;
    Object.keys(cloud || {}).forEach((id) => {
      const c = cloud[id];
      if (!c) return;
      const local = bests[id];
      if (!local || Number(c.score) > Number(local.score)) {
        bests[id] = {
          score: Number(c.score) || 0,
          maxCombo: Number(c.maxCombo) || 0,
          rank: String(c.rank || "D"),
          accuracy: typeof c.accuracy === "number" ? c.accuracy : 0,
        };
        changed = true;
      }
    });
    if (changed) saveBests(bests);
    updateLevelBestLabel();
    if (levelsOverlay && !levelsOverlay.classList.contains("hidden")) {
      populateLevelsGrid();
    }
    return changed;
  }

  function waitForEmciixScores(timeoutMs) {
    return new Promise((resolve) => {
      if (window.EmciixScores) {
        resolve(window.EmciixScores);
        return;
      }
      const start = Date.now();
      const t = setInterval(() => {
        if (window.EmciixScores) {
          clearInterval(t);
          resolve(window.EmciixScores);
        } else if (Date.now() - start > (timeoutMs || 8000)) {
          clearInterval(t);
          resolve(null);
        }
      }, 50);
    });
  }

  async function refreshCloudProfile(api, user) {
    if (!api || !user) {
      cloudProfile = null;
      return null;
    }
    let profile = null;
    try {
      if (api.getUserProfile) profile = await api.getUserProfile();
    } catch (err) {
      console.warn(err);
    }
    const localSum = sumLocalBests();
    const totalScore =
      profile && typeof profile.totalScore === "number"
        ? Math.max(profile.totalScore, localSum)
        : localSum;
    const displayName =
      (profile && profile.displayName) ||
      user.displayName ||
      user.email ||
      "Player";
    const photoURL =
      (profile && profile.photoURL) || user.photoURL || null;
    cloudProfile = {
      displayName: displayName,
      totalScore: totalScore,
      photoURL: photoURL,
    };
    updateAuthChip(user);
    return cloudProfile;
  }

  async function syncScoresForUser(user) {
    const api = window.EmciixScores;
    if (!api) {
      setSyncStatus("Local only");
      updateAuthChip(null);
      return;
    }
    if (!user) {
      setSyncStatus("Local only");
      updateAuthChip(null);
      loadUpgrades();
      return;
    }
    cloudProfile = cloudProfile || {
      displayName: user.displayName || user.email || "Player",
      totalScore: 0,
    };
    mergeUpgradesOnSignIn(user.uid);
    updateAuthChip(user);
    setSyncStatus("Syncing…");
    try {
      await refreshCloudProfile(api, user);
      const cloud = await api.loadCloudBests();
      mergeCloudIntoLocal(cloud);
      const bests = loadBests();
      const titleById = {};
      levels.forEach((m) => {
        if (m && m.id) titleById[m.id] = m.title || m.id;
      });
      for (const id of Object.keys(bests)) {
        const local = bests[id];
        const c = cloud[id];
        if (!c || Number(local.score) > Number(c.score)) {
          await api.saveCloudBest(id, local, titleById[id] || id);
        }
      }
      // Recompute from cloud bests after upload (never trust stale totalScore alone)
      let cloudSum = 0;
      try {
        const cloudAfter = await api.loadCloudBests();
        cloudSum = Object.values(cloudAfter || {}).reduce(
          (s, b) => s + (Math.max(0, Math.floor(Number(b && b.score) || 0))),
          0
        );
      } catch (_) {}
      const localSum = sumLocalBests();
      const totalAfter = Math.max(localSum, cloudSum);
      if (cloudProfile) cloudProfile.totalScore = totalAfter;
      else cloudProfile = {
        displayName: user.displayName || "Player",
        totalScore: totalAfter,
      };
      try {
        const profile = api.getUserProfile ? await api.getUserProfile() : null;
        if (profile) {
          if (profile.displayName) cloudProfile.displayName = profile.displayName;
          if (profile.photoURL) cloudProfile.photoURL = profile.photoURL;
          if (typeof profile.totalScore === "number") {
            cloudProfile.totalScore = Math.max(profile.totalScore, totalAfter);
          }
        }
      } catch (_) {}
      updateAuthChip(user);
      setSyncStatus("Synced", "synced");
      populateLevelsGrid();
      updateLevelBestLabel();
      // Seed / refresh public rank from current totals (even with no new level clear)
      try {
        if (api.publishPublicRank && cloudProfile) {
          await api.publishPublicRank(
            user,
            cloudProfile.displayName || user.displayName || "Player",
            cloudProfile.totalScore || 0,
            cloudProfile.photoURL || user.photoURL || null
          );
        } else if (api.upsertUserProfile && cloudProfile) {
          await api.upsertUserProfile(
            user,
            cloudProfile.totalScore || 0,
            Object.keys(loadBests()).length,
            { displayName: cloudProfile.displayName }
          );
        }
      } catch (pubErr) {
        console.warn("public rank publish", pubErr);
      }
      await refreshPublicRanks();
    } catch (err) {
      console.error(err);
      setSyncStatus("Sync error", "error");
      refreshPublicRanks().catch(() => {});
    }
  }

  function bindAuthUI() {
    const signInBtn = $("#btn-google-signin");
    const signInXBtn = $("#btn-x-signin");
    const signOutBtn = $("#btn-google-signout");

    function authMessage(err) {
      const code = String((err && err.code) || "");
      const msg = String((err && err.message) || err || "Sign-in failed");
      if (code.includes("operation-not-allowed")) return "Provider not enabled in Firebase";
      if (code.includes("unauthorized-domain")) return "Domain not authorized for sign-in";
      if (code.includes("popup-blocked")) return "Popup blocked — allow popups and retry";
      if (code.includes("popup-closed")) return "Sign-in window closed";
      if (code.includes("network-request-failed")) return "Network error during sign-in";
      if (code.includes("invalid-credential")) return "X sign-in misconfigured — check Twitter API key/secret in Firebase";
      if (code.includes("invalid-api-key")) return "Firebase API key invalid";
      if (code.includes("credential-already-in-use")) {
        return "Merging with existing account…";
      }
      if (code.includes("provider-already-linked")) return "That provider is already linked to this account";
      if (code.includes("email-already-in-use")) {
        return "Merging with existing account…";
      }
      return msg.length > 120 ? msg.slice(0, 117) + "…" : msg;
    }

    async function runSignIn(which) {
      showAuthError("");
      const api = window.EmciixScores || (await waitForEmciixScores(8000));
      if (!api) {
        showAuthError("Auth module failed to load — hard-refresh and try again");
        setSyncStatus("Local only", "error");
        return;
      }
      const method = which === "x" ? api.signInX : api.signInGoogle;
      if (!method) {
        showAuthError("Sign-in method missing");
        return;
      }
      if (signInBtn) signInBtn.disabled = true;
      if (signInXBtn) signInXBtn.disabled = true;
      try {
        await method();
        showAuthError("");
      } catch (err) {
        console.error(err);
        const text = authMessage(err);
        showAuthError(text);
        setSyncStatus(text, "error");
      } finally {
        if (signInBtn) signInBtn.disabled = false;
        if (signInXBtn) signInXBtn.disabled = false;
      }
    }

    if (signInBtn) {
      signInBtn.addEventListener("click", () => { runSignIn("google").catch(console.error); });
    }
    if (signInXBtn) {
      signInXBtn.addEventListener("click", () => { runSignIn("x").catch(console.error); });
    }
    if (signOutBtn) {
      signOutBtn.addEventListener("click", () => {
        const api = window.EmciixScores;
        hideNameEdit();
        if (api) api.signOutUser().catch(console.error);
      });
    }

    async function runLink(which) {
      showAuthError("");
      const api = window.EmciixScores || (await waitForEmciixScores(8000));
      if (!api) {
        showAuthError("Auth module failed to load — hard-refresh and try again");
        return;
      }
      const method = which === "x" ? api.linkX : api.linkGoogle;
      if (!method) {
        showAuthError("Link method missing — hard-refresh");
        return;
      }
      const linkGoogleBtn = $("#btn-link-google");
      const linkXBtn = $("#btn-link-x");
      if (linkGoogleBtn) linkGoogleBtn.disabled = true;
      if (linkXBtn) linkXBtn.disabled = true;
      try {
        try {
          api.lastLinkMerged = false;
        } catch (_) {}
        await method();
        const user = api.getCurrentUser && api.getCurrentUser();
        const didMerge = !!(api.lastLinkMerged || window.EmciixAuthDidMerge);
        try {
          window.EmciixAuthDidMerge = false;
        } catch (_) {}
        updateAuthChip(user);
        showAuthError("");
        if (user) {
          await syncScoresForUser(user);
          try {
            await refreshPublicRanks();
          } catch (_) {}
        }
        if (didMerge) {
          setSyncStatus("Accounts merged", "synced");
        } else {
          setSyncStatus(which === "x" ? "𝕏 linked" : "Google linked", "synced");
        }
      } catch (err) {
        console.error(err);
        const code = String((err && err.code) || "");
        // Merge should be handled inside linkX/linkGoogle; if it somehow still throws
        // credential-already-in-use after a partial merge, treat as soft success only when signed in.
        if (
          (code.includes("credential-already-in-use") || code.includes("email-already-in-use")) &&
          api.getCurrentUser &&
          api.getCurrentUser() &&
          api.lastLinkMerged
        ) {
          const user = api.getCurrentUser();
          updateAuthChip(user);
          showAuthError("");
          await syncScoresForUser(user);
          try {
            await refreshPublicRanks();
          } catch (_) {}
          setSyncStatus("Accounts merged", "synced");
        } else {
          const text = authMessage(err);
          showAuthError(text);
          setSyncStatus(text, "error");
        }
      } finally {
        if (linkGoogleBtn) linkGoogleBtn.disabled = false;
        if (linkXBtn) linkXBtn.disabled = false;
      }
    }

    const linkGoogleBtn = $("#btn-link-google");
    const linkXBtn = $("#btn-link-x");
    if (linkGoogleBtn) {
      linkGoogleBtn.addEventListener("click", () => {
        runLink("google").catch(console.error);
      });
    }
    if (linkXBtn) {
      linkXBtn.addEventListener("click", () => {
        runLink("x").catch(console.error);
      });
    }

    const editNameBtn = $("#btn-edit-name");
    const saveNameBtn = $("#btn-save-name");
    const cancelNameBtn = $("#btn-cancel-name");
    const nameInput = $("#auth-name-input");

    if (editNameBtn) {
      editNameBtn.addEventListener("click", () => {
        const row = $("#auth-name-edit");
        if (!row) return;
        const current =
          (cloudProfile && cloudProfile.displayName) ||
          (nameInput && nameInput.value) ||
          "";
        if (nameInput) {
          const chipName = $("#auth-chip-name");
          nameInput.value =
            current ||
            (chipName && chipName.textContent) ||
            "";
          nameInput.focus();
          nameInput.select();
        }
        row.classList.remove("hidden");
      });
    }
    if (cancelNameBtn) {
      cancelNameBtn.addEventListener("click", () => {
        hideNameEdit();
        showAuthError("");
      });
    }
    if (saveNameBtn) {
      saveNameBtn.addEventListener("click", async () => {
        showAuthError("");
        const api = window.EmciixScores;
        if (!api || !api.updateDisplayName) {
          showAuthError("Auth module not ready");
          return;
        }
        const raw = nameInput ? nameInput.value : "";
        saveNameBtn.disabled = true;
        try {
          const saved = await api.updateDisplayName(raw);
          if (!cloudProfile) cloudProfile = { displayName: saved, totalScore: 0 };
          else cloudProfile.displayName = saved;
          try {
            const profile = api.getUserProfile ? await api.getUserProfile() : null;
            if (profile && typeof profile.totalScore === "number") {
              cloudProfile.totalScore = Math.max(
                cloudProfile.totalScore || 0,
                profile.totalScore
              );
            }
          } catch (_) {}
          const user = api.getCurrentUser && api.getCurrentUser();
          updateAuthChip(user || { displayName: saved });
          hideNameEdit();
          refreshPublicRanks().catch(() => {});
        } catch (err) {
          console.error(err);
          showAuthError(String((err && err.message) || err || "Could not save name"));
        } finally {
          saveNameBtn.disabled = false;
        }
      });
    }
    if (nameInput) {
      nameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (saveNameBtn) saveNameBtn.click();
        } else if (e.key === "Escape") {
          hideNameEdit();
        }
      });
    }

    async function runAvatarUpload(file) {
      showAuthError("");
      const api = window.EmciixScores || (await waitForEmciixScores(8000));
      if (!api || !api.uploadAvatar) {
        showAuthError("Avatar upload not available — hard-refresh");
        return;
      }
      if (!file) return;
      const avatarImg = $("#auth-chip-avatar");
      const avatarBtn = $("#auth-avatar-btn");
      const changePhotoBtn = $("#auth-change-photo");
      const prevPhoto =
        (cloudProfile && cloudProfile.photoURL) ||
        (avatarImg && avatarImg.getAttribute("src")) ||
        "";
      let previewUrl = "";
      try {
        previewUrl = URL.createObjectURL(file);
        if (avatarImg && previewUrl) {
          avatarImg.src = previewUrl;
          avatarImg.removeAttribute("data-placeholder");
        }
      } catch (_) {}
      if (avatarBtn) avatarBtn.disabled = true;
      if (changePhotoBtn) changePhotoBtn.disabled = true;
      showAuthError("Uploading…");
      setSyncStatus("Uploading…");
      try {
        const url = await api.uploadAvatar(file);
        if (!cloudProfile) cloudProfile = { displayName: null, totalScore: 0, photoURL: url };
        else cloudProfile.photoURL = url;
        const user = api.getCurrentUser && api.getCurrentUser();
        updateAuthChip(user);
        showAuthError("");
        setSyncStatus("Photo updated", "synced");
        refreshPublicRanks().catch(() => {});
      } catch (err) {
        console.error(err);
        if (avatarImg) {
          if (prevPhoto) avatarImg.src = prevPhoto;
          else {
            avatarImg.removeAttribute("src");
            avatarImg.setAttribute("data-placeholder", "1");
          }
        }
        if (cloudProfile) cloudProfile.photoURL = prevPhoto || cloudProfile.photoURL || null;
        const msg = String((err && err.message) || err || "Upload failed");
        showAuthError(msg.length > 120 ? msg.slice(0, 117) + "…" : msg);
        setSyncStatus("Upload failed", "error");
      } finally {
        if (previewUrl) {
          try { URL.revokeObjectURL(previewUrl); } catch (_) {}
        }
        if (avatarBtn) avatarBtn.disabled = false;
        if (changePhotoBtn) changePhotoBtn.disabled = false;
      }
    }

    function openAvatarPicker() {
      const input = $("#auth-avatar-input");
      if (input) input.click();
    }

    const avatarInput = $("#auth-avatar-input");
    const avatarBtn = $("#auth-avatar-btn");
    const changePhotoBtn = $("#auth-change-photo");
    if (avatarBtn) {
      avatarBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openAvatarPicker();
      });
    }
    if (changePhotoBtn) {
      changePhotoBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openAvatarPicker();
      });
    }
    if (avatarInput) {
      avatarInput.addEventListener("change", () => {
        const file = avatarInput.files && avatarInput.files[0];
        avatarInput.value = "";
        if (file) runAvatarUpload(file).catch(console.error);
      });
    }

    waitForEmciixScores(10000).then((api) => {
      if (!api) {
        setSyncStatus("Local only");
        return;
      }
      try {
        if (window.EmciixAuthRedirectError && !window.EmciixAuthDidMerge) {
          const err = window.EmciixAuthRedirectError;
          const text = authMessage(err);
          // Don't surface merge-in-progress as a dead-end if we already switched accounts
          if (!(api.lastLinkMerged || window.EmciixAuthRedirectOp === "merge")) {
            showAuthError(text);
            setSyncStatus(text, "error");
          }
        }
      } catch (_) {}
      window.addEventListener("emciix-auth-redirect-error", (ev) => {
        if (window.EmciixAuthDidMerge || window.EmciixAuthRedirectOp === "merge") return;
        const err = ev && ev.detail;
        const text = authMessage(err || { message: "Sign-in redirect failed" });
        showAuthError(text);
        setSyncStatus(text, "error");
      });
      api.onAuth((user) => {
        (async () => {
          let merged = false;
          if (user && api.applyPendingMergeIfAny) {
            try {
              merged = !!(await api.applyPendingMergeIfAny());
            } catch (mergeErr) {
              console.warn("pending merge on auth", mergeErr);
            }
          }
          if (window.EmciixAuthDidMerge || window.EmciixAuthRedirectOp === "merge") {
            merged = true;
            try {
              window.EmciixAuthDidMerge = false;
            } catch (_) {}
          }
          await syncScoresForUser(user);
          if (merged && user) {
            setSyncStatus("Accounts merged", "synced");
            try {
              await refreshPublicRanks();
            } catch (_) {}
          }
        })().catch(console.error);
      });
    });
  }

  function rankFromAccuracy(acc) {
    if (acc >= 0.97) return "SS";
    if (acc >= 0.90) return "S";
    if (acc >= 0.80) return "A";
    if (acc >= 0.65) return "B";
    if (acc >= 0.50) return "C";
    return "D";
  }

  function computeAccuracy() {
    const totalJudged = counts.perfect + counts.great + counts.good + counts.miss;
    const weighted =
      counts.perfect * 1 + counts.great * 0.8 + counts.good * 0.5;
    return weighted / Math.max(1, totalJudged);
  }

  function updateLevelBestLabel() {
    const el = $("#level-best");
    if (!el) return;
    const id = levelMeta && levelMeta.id;
    const best = getBest(id);
    if (!best) {
      el.classList.add("hidden");
      el.textContent = "";
      return;
    }
    el.textContent =
      "BEST · " + String(best.score) + " · " + String(best.rank || "D");
    el.classList.remove("hidden");
  }

  function formatStartTitleHtml(title) {
    const raw = String(title || "").trim();
    if (!raw) return "ONE FEELING,<br />ONE PROMISE";
    // Explicit overrides
    if (raw === "Make up shit") return "MAKE UP<br />SHIT";
    if (raw === "One Feeling, One Promise") return "ONE FEELING,<br />ONE PROMISE";
    const upper = raw.toUpperCase();
    // Break after comma if present (keep comma on first line)
    const commaIdx = upper.indexOf(",");
    if (commaIdx !== -1) {
      const left = upper.slice(0, commaIdx + 1).trim();
      const right = upper.slice(commaIdx + 1).trim();
      if (left && right) return left + "<br />" + right;
      return upper;
    }
    const words = upper.split(/\s+/).filter(Boolean);
    if (words.length <= 1) return upper;
    if (words.length === 2) return words[0] + "<br />" + words[1];
    // Split into two roughly equal lines by word count
    const mid = Math.ceil(words.length / 2);
    return words.slice(0, mid).join(" ") + "<br />" + words.slice(mid).join(" ");
  }

  function updateLevelChrome() {
    const title = (levelMeta && levelMeta.title) || (chart && chart.title) || "ONE FEELING, ONE PROMISE";
    const h2 = document.querySelector(".title-box h2");
    if (h2) h2.textContent = title.toUpperCase();
    const startH1 = document.querySelector("#start-overlay h1");
    if (startH1) startH1.innerHTML = formatStartTitleHtml(title);
    const lvl = $("#level-label");
    if (lvl) lvl.textContent = "Level " + (levelIndex + 1) + " / " + Math.max(levels.length, 1) + " · " + title;
    updateLevelBestLabel();
    if (sideLeftLabel && levelMeta) {
      sideLeftLabel.innerHTML = String(levelMeta.sideLeft || "ONE<br />FEELING").replace(/ /g, "<br />");
    }
    if (sideRightLabel && levelMeta) {
      sideRightLabel.innerHTML = String(levelMeta.sideRight || "KEEP IT<br />CLEAN").replace(/ /g, "<br />");
    }
    document.title = "Emciix";
    const app = document.getElementById("app");
    if (app) app.dataset.theme = (levelMeta && levelMeta.theme) || "";
    const metaLevel = $("#meta-level");
    const metaBpm = $("#meta-bpm");
    const metaNext = $("#meta-next");
    if (metaLevel) metaLevel.textContent = "LEVEL " + (levelIndex + 1) + "/" + Math.max(levels.length, 1);
    if (metaBpm) metaBpm.textContent = "BPM " + ((chart && chart.bpm) || "—");
    if (metaNext) {
      if (levelIndex < levels.length - 1) {
        const nxt = levels[levelIndex + 1];
        metaNext.textContent = "NEXT · " + (nxt.short || nxt.title || "LEVEL").toUpperCase();
      } else {
        metaNext.textContent = "FINAL STAGE";
      }
    }
  }

  async function loadLevel(index) {
    if (!levels.length) throw new Error("no levels");
    levelIndex = Math.max(0, Math.min(index, levels.length - 1));
    levelMeta = levels[levelIndex];
    writeSavePoint(levelIndex, levelMeta);
    loadStatus.textContent = "Loading level " + (levelIndex + 1) + "…";
    const [chartRes, lyricRes] = await Promise.all([
      fetch(levelMeta.chart),
      fetch(levelMeta.lyrics),
    ]);
    if (!chartRes.ok) throw new Error("chart missing for " + levelMeta.id);
    chart = await chartRes.json();
    lyrics = lyricRes.ok ? await lyricRes.json() : [];
    audio.src = levelMeta.audio;
    loadStatus.textContent = "Loading audio…";
    await new Promise((resolve) => {
      const ok = () => {
        cleanup();
        resolve();
      };
      const cleanup = () => {
        audio.removeEventListener("canplaythrough", ok);
        audio.removeEventListener("error", ok);
      };
      audio.addEventListener("canplaythrough", ok);
      audio.addEventListener("error", ok);
      audio.load();
      setTimeout(ok, 2500);
    });
    updateLevelChrome();
    loadStatus.textContent = "Ready — tap to start";
    startBtn.disabled = false;
    const nextBtn = $("#next-level-btn");
    if (nextBtn) nextBtn.classList.add("hidden");
  }

  async function loadAssets() {
    loadStatus.textContent = "Loading levels…";
    const res = await fetch("/game/play/levels.json");
    if (!res.ok) throw new Error("levels.json missing");
    levels = await res.json();
    let resume = 0;
    let portalIn = false;
    try {
      const q = new URLSearchParams(location.search);
      const want = q.get("level");
      if (want) {
        const found = levels.findIndex((l) => l && l.id === want);
        if (found >= 0) resume = found;
      } else {
        resume = readSaveIndex(levels);
      }
      portalIn = q.get("perfect") === "1";
    } catch (_) {}
    await loadLevel(resume);
    if (levelMeta && levelMeta.perfect && startBtn) startBtn.textContent = "PERFECT MODE";
    if (levelMeta && levelMeta.perfect && loadStatus) loadStatus.textContent = "PERFECT MODE — tap to start";
    if (portalIn) {
      await startGame();
      if (!playing) {
        if (startBtn) startBtn.textContent = "PERFECT MODE";
        if (loadStatus) loadStatus.textContent = "PERFECT MODE — tap to start";
      }
    }
  }

  function sectionAt(t) {
    for (let i = 0; i < SECTIONS.length; i++) {
      const s = SECTIONS[i];
      if (t >= s[0] && t < s[1]) return s;
    }
    return SECTIONS[SECTIONS.length - 1];
  }

  function lyricAt(t) {
    for (let i = 0; i < lyrics.length; i++) {
      const L = lyrics[i];
      if (t >= L.start && t < L.end) return L.text;
    }
    return "";
  }

  function formatTime(t) {
    const s = Math.max(0, Math.floor(t));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ":" + String(r).padStart(2, "0");
  }

  function measureLanes() {
    lanesEl = $("#lanes");
    const lanes = $$(".lane", lanesEl);
    const layerRect = notesLayer.getBoundingClientRect();
    laneCenters = lanes.map((lane) => {
      const r = lane.getBoundingClientRect();
      return r.left + r.width / 2 - layerRect.left;
    });
  }

  function resetState() {
    score = 0;
    combo = 0;
    maxCombo = 0;
    pulseArmor = 0;
    chain = 0;
    health = 1;
    fever = false;
    nosActive = false;
    nosMode = null;
    nosAltLast = -1;
    setNosUi(false);
    counts = { perfect: 0, great: 0, good: 0, miss: 0 };
    notesLayer.innerHTML = "";
    notes = (chart.notes || []).map((n, idx) => ({
      id: idx,
      t: n.t,
      lane: n.lane,
      kind: n.kind || "circle",
      hold: n.hold || 0,
      hit: false,
      missed: false,
      el: null,
    }));
    updateHUD(0);
    lyricStrip.textContent = "";
    judgeEl.className = "judge";
    judgeEl.textContent = "";
  }

  function spawnNoteEl(note) {
    const el = document.createElement("div");
    const kind = note.kind === "hold" ? "hold" : note.kind === "pill" ? "pill" : "circle";
    el.className = "note " + kind + " lane-" + note.lane;
    el.dataset.id = String(note.id);
    if (kind === "hold") {
      const holdPx = Math.max(40, note.hold * 80);
      el.style.height = holdPx + "px";
    }
    notesLayer.appendChild(el);
    note.el = el;
    return el;
  }

  function yForNote(tNow, hitTime) {
    // note reaches HIT_Y_PCT at hitTime; travels from SPAWN_Y_PCT over fall time
    const fall = getFallTime();
    const progress = 1 - (hitTime - tNow) / fall;
    return SPAWN_Y_PCT + progress * (HIT_Y_PCT - SPAWN_Y_PCT);
  }

  function updateNotePositions(tNow) {
    const h = notesLayer.clientHeight || 1;
    const w = notesLayer.clientWidth || 1;
    const missWin = getWindows().miss;
    for (let i = 0; i < notes.length; i++) {
      const n = notes[i];
      if (n.hit) continue;
      const appear = n.t - getFallTime();
      const gone = n.t + missWin + 0.15;
      if (tNow < appear || tNow > gone + (n.hold || 0)) {
        if (n.el) {
          n.el.remove();
          n.el = null;
        }
        continue;
      }
      if (!n.el) spawnNoteEl(n);
      const yPct = yForNote(tNow, n.t);
      const x = laneCenters[n.lane] || w * ((n.lane + 0.5) / 3);
      if (n.kind === "hold") {
        n.el.style.left = x + "px";
        n.el.style.top = (yPct / 100) * h - parseFloat(n.el.style.height || 40) + "px";
      } else {
        n.el.style.left = x + "px";
        n.el.style.top = (yPct / 100) * h + "px";
      }
      if (!n.missed && perfectUnlocked() && tNow >= n.t + missWin - 0.02) {
        autoCapture(n);
      } else if (!n.missed && tNow > n.t + missWin) {
        registerMiss(n);
      }
    }
  }

  function showJudge(label) {
    judgeEl.textContent = label.toUpperCase();
    judgeEl.className = "judge show " + label.toLowerCase();
    clearTimeout(judgeTimer);
    judgeTimer = setTimeout(() => {
      judgeEl.classList.remove("show");
    }, 420);
  }

  function flashLane(lane, spark) {
    const el = $$(".lane")[lane];
    if (!el) return;
    el.classList.add("flash");
    setTimeout(() => el.classList.remove("flash"), 100);
    if (spark) {
      const flash = el.querySelector(".hit-flash");
      if (flash) {
        flash.classList.remove("spark");
        // force reflow so animation retriggers
        void flash.offsetWidth;
        flash.classList.add("spark");
        setTimeout(() => flash.classList.remove("spark"), 300);
      }
    }
  }

  function pickNosMode() {
    nosMode = NOS_MODES[nosModeIdx % NOS_MODES.length];
    nosModeIdx += 1;
    nosAltLast = -1;
    if (nosHint && nosMode) nosHint.textContent = nosMode.hint;
  }

  function setNosUi(on) {
    if (healthRow) healthRow.classList.toggle("nos-critical", on);
    if (nosBanner) nosBanner.classList.toggle("hidden", !on);
    if (nosPill) nosPill.classList.toggle("hidden", !on);
  }

  function maybeStartNos() {
    if (nosActive) return;
    if (health > NOS_TRIGGER) return;
    if (health >= NOS_CAP) return;
    nosActive = true;
    pickNosMode();
    setNosUi(true);
  }

  function endNosIfFull() {
    if (!nosActive) return;
    if (health >= NOS_CAP - 0.0001) {
      health = Math.min(health, NOS_CAP);
      nosActive = false;
      nosMode = null;
      setNosUi(false);
    }
  }

  function echoScore(pts) {
    const echo = clampLevel(upgradesState && upgradesState.echo);
    if (!echo || combo <= 0) return pts;
    return Math.round(pts * (1 + 0.05 * echo * Math.min(combo, 20) / 20));
  }

  function applyNosBoost(amount) {
    if (!nosActive || !nosMode) return false;
    const rush = clampLevel(upgradesState && upgradesState.rush);
    amount *= 1 + 0.25 * rush;
    const before = health;
    health = Math.min(NOS_CAP, health + amount);
    endNosIfFull();
    return health > before;
  }

  function tryNosActivity(lane, hitLabel) {
    if (!nosActive || !nosMode) {
      maybeStartNos();
      return;
    }
    const mode = nosMode.id;
    if (mode === "perfect") {
      if (hitLabel === "perfect") applyNosBoost(nosMode.boost);
    } else if (mode === "sync") {
      if (lane === 1) applyNosBoost(nosMode.boost);
    } else if (mode === "alt") {
      if (lane === 0 || lane === 2) {
        if (nosAltLast !== -1 && nosAltLast !== lane) {
          applyNosBoost(nosMode.boost);
        }
        nosAltLast = lane;
      }
    }
    updateHUD(audio.currentTime || 0);
  }

  function autoCapture(n) {
    if (!n || n.hit || n.missed) return;
    n.hit = true;
    if (n.el) {
      n.el.classList.add("hit");
      const el = n.el;
      setTimeout(() => { if (el.parentNode) el.remove(); }, 80);
      n.el = null;
    }
    const label = "perfect";
    let pts = SCORE[label];
    if (fever) pts *= 2;
    pts = Math.round(pts * powerScoreMult());
    const vaultLv = clampLevel(upgradesState && upgradesState.vault);
    if (vaultLv > 0) pts += Math.floor(SCORE.perfect * 0.08 * vaultLv);
    score += echoScore(pts);
    combo += 1;
    chain += 1;
    maxCombo = Math.max(maxCombo, combo);
    if (!nosActive) health = Math.min(1, health + 0.02);
    counts[label]++;
    if (combo >= feverComboThreshold()) fever = true;
    showJudge(label);
    flashLane(n.lane, true);
    tryNosActivity(n.lane, label);
    maybeStartNos();
    updateHUD(audio.currentTime || 0);
  }

  function registerMiss(n) {
    if (n.hit || n.missed) return;
    n.missed = true;
    if (n.el) n.el.classList.add("missed");
    const flow = clampLevel(upgradesState && upgradesState.flow);
    if (pulseArmor > 0) {
      pulseArmor -= 1;
      // PULSE combo armor: keep combo/chain intact on this miss
    } else {
      const keepCombo = Math.min(combo, flow);
      combo = keepCombo;
      chain = keepCombo > 0 ? Math.min(chain, keepCombo) : 0;
      if (keepCombo < feverComboThreshold()) fever = false;
    }
    const shield = clampLevel(upgradesState && upgradesState.shield);
    let missPenalty = Math.max(0.02, 0.08 - 0.015 * flow);
    missPenalty *= Math.max(0.4, 1 - 0.12 * shield);
    health = Math.max(0, health - missPenalty);
    if (flow > 0) {
      health = Math.min(1, health + 0.015 * flow);
      if (nosActive) applyNosBoost(0.01 * flow);
    }
    counts.miss++;
    showJudge("miss");
    maybeStartNos();
    updateHUD(audio.currentTime || 0);
  }

  function findHitNote(lane, tNow) {
    let best = null;
    let bestAbs = Infinity;
    const missWin = getWindows().miss;
    for (let i = 0; i < notes.length; i++) {
      const n = notes[i];
      if (n.lane !== lane || n.hit || n.missed) continue;
      const dt = Math.abs(n.t - tNow);
      if (dt <= missWin && dt < bestAbs) {
        bestAbs = dt;
        best = n;
      }
    }
    return best ? { note: best, dt: bestAbs } : null;
  }

  function judgeHit(lane) {
    if (!playing || paused) return;
    const tNow = audio.currentTime;
    const found = findHitNote(lane, tNow);
    if (!found) {
      flashLane(lane, false);
      tryNosActivity(lane, null);
      return;
    }
    const { note, dt } = found;
    const win = getWindows();
    let label = "miss";
    if (dt <= win.perfect) label = "perfect";
    else if (dt <= win.great) label = "great";
    else if (dt <= win.good) label = "good";
    else label = "miss";

    flashLane(lane, label === "perfect" || label === "great");

    if (label === "miss") {
      registerMiss(note);
      return;
    }

    note.hit = true;
    if (note.el) {
      note.el.classList.add("hit");
      const el = note.el;
      setTimeout(() => {
        if (el.parentNode) el.remove();
      }, 80);
      note.el = null;
    }

    let pts = SCORE[label];
    if (fever) pts *= 2;
    pts = Math.round(pts * powerScoreMult());
    if (label === "perfect") {
      const vaultLv = clampLevel(upgradesState && upgradesState.vault);
      if (vaultLv > 0) pts += Math.floor(SCORE.perfect * 0.08 * vaultLv);
    }
    if (label === "good") {
      const pulseLv = clampLevel(upgradesState && upgradesState.pulse);
      if (pulseLv > 0) {
        // GOOD hits grant combo armor charges (up to pulse level)
        pulseArmor = Math.min(pulseLv, pulseArmor + 1);
      }
    }
    score += echoScore(pts);
    combo += 1;
    chain += 1;
    maxCombo = Math.max(maxCombo, combo);
    // Normal regen only above NOS recovery; while NOS active, recovery is activity-gated to 25%
    if (!nosActive) {
      health = Math.min(1, health + 0.02);
    }
    counts[label]++;
    if (combo >= feverComboThreshold()) fever = true;
    showJudge(label);
    tryNosActivity(lane, label);
    maybeStartNos();
    updateHUD(tNow);
  }

  function updateHUD(t) {
    scoreEl.textContent = String(Math.min(999999, score));
    comboEl.textContent = combo + "X";
    chainVal.textContent = String(chain);
    timerEl.textContent = formatTime(t);
    feverFill.style.width = Math.min(100, (combo / feverFillDenom()) * 100) + "%";
    feverTag.classList.toggle("hidden", !fever);
    healthFill.style.width = Math.max(0, health * 100) + "%";
    if (nosActive) {
      setNosUi(true);
      if (nosHint && nosMode) nosHint.textContent = nosMode.hint;
    }

    const sec = sectionAt(t);
    sectionPill.textContent = sec[4] + " [SEC-01]";
    sideLeftLabel.innerHTML = String(sec[2]).replace(/ /g, "<br />");
    sideRightLabel.innerHTML = String(sec[3]).replace(/ /g, "<br />");

    const ly = lyricAt(t);
    if (lyricStrip.textContent !== ly) lyricStrip.textContent = ly;
  }

  function animateSides(t) {
    if (!sideLeftScroll || !sideRightScroll) return;
    // Lightweight decorative motion via transform on children
    if (!sideLeftScroll.children.length) {
      for (let i = 0; i < 5; i++) {
        const p = document.createElement("div");
        p.className = "side-pill" + (i % 3 === 0 ? " filled" : "");
        sideLeftScroll.appendChild(p);
      }
      for (let i = 0; i < 6; i++) {
        const c = document.createElement("div");
        c.className = "side-circle";
        sideRightScroll.appendChild(c);
      }
    }
    const lh = sideLeftScroll.clientHeight || 400;
    const rh = sideRightScroll.clientHeight || 400;
    Array.from(sideLeftScroll.children).forEach((el, i) => {
      const phase = (t * 170 + i * 120) % Math.max(1, lh - 40);
      el.style.top = 20 + phase + "px";
    });
    Array.from(sideRightScroll.children).forEach((el, i) => {
      const phase = (t * 155 + i * 100) % Math.max(1, rh - 50);
      el.style.top = 20 + phase + "px";
    });
  }

  function loop() {
    if (!playing) return;
    raf = requestAnimationFrame(loop);
    if (paused) return;
    const t = audio.currentTime;
    updateNotePositions(t);
    updateHUD(t);
    animateSides(t);

    const dur = chart.duration || audio.duration || 151.2;
    if (audio.ended || t >= dur - 0.05) {
      endSong();
    }
  }

  function endSong() {
    playing = false;
    paused = false;
    cancelAnimationFrame(raf);
    try {
      audio.pause();
    } catch (_) {}
    if (pauseOverlay) pauseOverlay.classList.add("hidden");
    if (pauseBtn) pauseBtn.textContent = "❚❚";

    const accuracy = computeAccuracy();
    const rank = rankFromAccuracy(accuracy);
    const accPct = Math.round(accuracy * 1000) / 10; // one decimal

    const resRank = $("#res-rank");
    const resAcc = $("#res-acc");
    const resBest = $("#res-best");
    const resNewBest = $("#res-new-best");
    if (resRank) {
      resRank.textContent = rank;
      resRank.className = "res-rank rank-" + rank.toLowerCase();
    }
    if (resAcc) resAcc.textContent = accPct.toFixed(1) + "%";

    let isNewBest = false;
    const levelId = levelMeta && levelMeta.id;
    if (levelId) {
      const bests = loadBests();
      const prev = bests[levelId];
      if (!prev || score > prev.score) {
        bests[levelId] = {
          score: score,
          maxCombo: maxCombo,
          rank: rank,
          accuracy: accuracy,
        };
        saveBests(bests);
        isNewBest = true;
      }
      const shown = bests[levelId] || prev;
      if (resBest && shown) {
        resBest.textContent = "BEST " + String(shown.score);
      } else if (resBest) {
        resBest.textContent = "BEST " + String(score);
      }
    } else if (resBest) {
      resBest.textContent = "BEST " + String(score);
    }
    if (resNewBest) resNewBest.classList.toggle("hidden", !isNewBest);

    $("#res-score").textContent = String(score);
    $("#res-combo").textContent = String(maxCombo);
    $("#res-perfect").textContent = String(counts.perfect);
    $("#res-great").textContent = String(counts.great);
    $("#res-good").textContent = String(counts.good);
    $("#res-miss").textContent = String(counts.miss);
    const nextBtn = $("#next-level-btn");
    if (nextBtn) {
      if (levelIndex < levels.length - 1) {
        nextBtn.classList.remove("hidden");
        nextBtn.textContent = "NEXT LEVEL → " + (levels[levelIndex + 1].title || "").toUpperCase();
      } else {
        nextBtn.classList.add("hidden");
      }
    }
    updateLevelBestLabel();

    const api = window.EmciixScores;
    if (levelId && api && api.getCurrentUser && api.getCurrentUser()) {
      const title = (levelMeta && levelMeta.title) || levelId;
      setSyncStatus("Saving…");
      api
        .saveCloudBest(
          levelId,
          {
            score: score,
            maxCombo: maxCombo,
            rank: rank,
            accuracy: accuracy,
          },
          title
        )
        .then(async (res) => {
          if (res && res.saved) setSyncStatus("Synced", "synced");
          else setSyncStatus("Synced", "synced");
          try {
            const user = api.getCurrentUser && api.getCurrentUser();
            if (user) {
              await refreshCloudProfile(api, user);
              const pts =
                cloudProfile && typeof cloudProfile.totalScore === "number"
                  ? cloudProfile.totalScore
                  : sumLocalBests();
              setPointsUI(pts);
            } else {
              const totalAfter = sumLocalBests();
              if (cloudProfile) cloudProfile.totalScore = totalAfter;
              setPointsUI(totalAfter);
            }
          } catch (_) {}
          await refreshPublicRanks().catch(() => {});
        })
        .catch((err) => {
          console.error(err);
          setSyncStatus("Sync error", "error");
        });
    }

    resultsOverlay.classList.remove("hidden");
  }

  const confirmOverlay = $("#confirm-overlay");
  const confirmKicker = $("#confirm-kicker");
  const confirmTitle = $("#confirm-title");
  const confirmBlurb = $("#confirm-blurb");
  let pendingLevelIndex = null;
  let confirmWasPlaying = false;

  function defaultBlurb(meta) {
    if (!meta) return "Jump to this stage?";
    if (meta.blurb) return meta.blurb;
    return "Play " + (meta.title || "this level") + " — hit the notes in time.";
  }

  let confirmFromResults = false;

  function populateLevelsGrid() {
    if (!levelsGrid) return;
    levelsGrid.innerHTML = "";
    const bests = loadBests();
    levels.forEach((meta, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "level-tile" + (idx === levelIndex ? " current" : "");
      if (meta.theme) btn.classList.add("theme-" + meta.theme);
      const shortTitle = meta.short || meta.title || ("Level " + (idx + 1));
      const best = bests[meta.id];
      const bestText = best
        ? "BEST " + best.score + " · " + (best.rank || "D")
        : "—";
      const art = meta.theme === "device"
        ? '<span class="lt-art device-art" aria-hidden="true"><i></i><i></i></span>'
        : meta.theme === "tabs"
        ? '<span class="lt-art tabs-art" aria-hidden="true"><i></i><i></i><i></i></span>'
        : "";
      btn.innerHTML =
        art +
        '<span class="lt-num">LVL ' + (idx + 1) + "</span>" +
        '<span class="lt-title"></span>' +
        '<span class="lt-best' + (best ? " has-best" : "") + '"></span>';
      btn.querySelector(".lt-title").textContent = String(shortTitle).toUpperCase();
      btn.querySelector(".lt-best").textContent = bestText;
      btn.addEventListener("click", () => {
        askLevelJump(idx);
      });
      levelsGrid.appendChild(btn);
    });
  }

  function openLevels(from) {
    levelsFrom = from || "start";
    populateLevelsGrid();
    if (levelsFrom === "results" && resultsOverlay) {
      resultsOverlay.classList.add("hidden");
    }
    if (levelsFrom === "start" && startOverlay) {
      startOverlay.classList.add("hidden");
    }
    if (levelsFrom === "pause" && pauseOverlay) {
      pauseOverlay.classList.add("hidden");
    }
    if (levelsOverlay) levelsOverlay.classList.remove("hidden");
  }

  function closeLevels() {
    if (levelsOverlay) levelsOverlay.classList.add("hidden");
    const from = levelsFrom;
    levelsFrom = null;
    if (from === "results" && resultsOverlay) {
      resultsOverlay.classList.remove("hidden");
    } else if (from === "start" && startOverlay) {
      startOverlay.classList.remove("hidden");
      resumeStartBgmIfOnMenu();
    } else if (from === "pause" && pauseOverlay) {
      // stay paused until they pick or resume
      pauseOverlay.classList.remove("hidden");
    }
  }

  function askLevelJump(targetIndex) {
    if (!levels.length) return;
    if (targetIndex < 0 || targetIndex >= levels.length) return;
    if (targetIndex === levelIndex) return;
    const meta = levels[targetIndex];
    pendingLevelIndex = targetIndex;
    confirmWasPlaying = playing && !paused;
    confirmFromResults = !!(resultsOverlay && !resultsOverlay.classList.contains("hidden"));
    confirmFromLevels = !!(levelsOverlay && !levelsOverlay.classList.contains("hidden"));
    if (confirmFromLevels && levelsOverlay) {
      levelsOverlay.classList.add("hidden");
    }
    if (playing && !paused) {
      try { audio.pause(); } catch (_) {}
      paused = true;
      if (pauseBtn) pauseBtn.textContent = "▶";
      if (pauseOverlay) pauseOverlay.classList.add("hidden");
    }
    // Results sits above confirm in the stack — hide it or Yes/No is unreachable
    if (confirmFromResults && resultsOverlay) resultsOverlay.classList.add("hidden");
    if (confirmKicker) {
      confirmKicker.textContent =
        "LEVEL " + (targetIndex + 1) + " / " + levels.length +
        (targetIndex > levelIndex ? " · NEXT" : " · PREV");
    }
    if (confirmTitle) confirmTitle.textContent = String(meta.title || "LEVEL").toUpperCase();
    if (confirmBlurb) confirmBlurb.textContent = defaultBlurb(meta);
    if (confirmOverlay) {
      confirmOverlay.dataset.theme = meta.theme || "";
      confirmOverlay.classList.remove("hidden");
    }
  }

  function hideConfirm() {
    if (confirmOverlay) {
      confirmOverlay.classList.add("hidden");
      confirmOverlay.dataset.theme = "";
    }
    pendingLevelIndex = null;
  }

  function cancelLevelJump() {
    hideConfirm();
    if (confirmFromLevels) {
      confirmFromLevels = false;
      confirmFromResults = false;
      confirmWasPlaying = false;
      if (levelsOverlay) {
        populateLevelsGrid();
        levelsOverlay.classList.remove("hidden");
      }
      return;
    }
    if (confirmFromResults && resultsOverlay) {
      resultsOverlay.classList.remove("hidden");
    } else if (confirmWasPlaying && playing) {
      paused = false;
      if (pauseBtn) pauseBtn.textContent = "❚❚";
      if (pauseOverlay) pauseOverlay.classList.add("hidden");
      audio.play().catch(() => {});
    } else if (playing && paused && pauseOverlay) {
      pauseOverlay.classList.remove("hidden");
    }
    confirmFromResults = false;
    confirmWasPlaying = false;
    confirmFromLevels = false;
  }

  async function applyLevelJump(targetIndex) {
    hideConfirm();
    confirmWasPlaying = false;
    confirmFromResults = false;
    confirmFromLevels = false;
    levelsFrom = null;
    if (levelsOverlay) levelsOverlay.classList.add("hidden");
    if (pauseOverlay) pauseOverlay.classList.add("hidden");
    resultsOverlay.classList.add("hidden");
    startOverlay.classList.remove("hidden");
    gameEl.classList.add("hidden");
    playing = false;
    paused = false;
    cancelAnimationFrame(raf);
    try { audio.pause(); } catch (_) {}
    startBtn.disabled = true;
    startBtn.textContent = "YES — START";
    await loadLevel(targetIndex);
    // Stay on start screen — second confirm before play
    startBtn.disabled = false;
    startBtn.textContent = "YES — START";
    loadStatus.textContent = "Ready — confirm to start";
    resumeStartBgmIfOnMenu();
  }

  async function goNextLevel() {
    if (levelIndex >= levels.length - 1) return;
    askLevelJump(levelIndex + 1);
  }

  async function goPrevLevel() {
    if (levelIndex <= 0) return;
    askLevelJump(levelIndex - 1);
  }

  async function startGame() {
    if (!chart) return;
    if (startBtn) startBtn.textContent = "TAP TO START";
    pauseStartBgm();
    startOverlay.classList.add("hidden");
    resultsOverlay.classList.add("hidden");
    if (pauseOverlay) pauseOverlay.classList.add("hidden");
    if (levelsOverlay) levelsOverlay.classList.add("hidden");
    levelsFrom = null;
    gameEl.classList.remove("hidden");
    resetState();
    measureLanes();
    paused = false;
    playing = true;
    pauseBtn.textContent = "❚❚";
    try {
      audio.currentTime = 0;
      await audio.play();
    } catch (err) {
      loadStatus.textContent = "Tap again to unlock audio";
      startOverlay.classList.remove("hidden");
      playing = false;
      resumeStartBgmIfOnMenu();
      return;
    }
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  }

  function togglePause() {
    if (!playing) return;
    // Don't toggle while confirm or levels is open
    if (confirmOverlay && !confirmOverlay.classList.contains("hidden")) return;
    if (levelsOverlay && !levelsOverlay.classList.contains("hidden")) return;
    paused = !paused;
    if (paused) {
      audio.pause();
      pauseBtn.textContent = "▶";
      if (pauseOverlay) pauseOverlay.classList.remove("hidden");
    } else {
      if (pauseOverlay) pauseOverlay.classList.add("hidden");
      audio.play().catch(() => {});
      pauseBtn.textContent = "❚❚";
    }
  }

  function resumeFromPause() {
    if (!playing || !paused) return;
    paused = false;
    if (pauseOverlay) pauseOverlay.classList.add("hidden");
    pauseBtn.textContent = "❚❚";
    audio.play().catch(() => {});
  }

  function onKeyDown(e) {
    if (e.repeat) return;
    if (e.code === "Space" || e.key === " ") {
      e.preventDefault();
      if (playing) togglePause();
      return;
    }
    const lane = KEY_MAP[e.code];
    if (lane === undefined) return;
    e.preventDefault();
    strike(lane);
  }

  function perfectUnlocked() {
    if (levelMeta && levelMeta.perfect) return true;
    return clampLevel(upgradesState.perfect) >= 1;
  }

  function setPad(lane, down) {
    const pad = $('.pad[data-lane="' + lane + '"]');
    if (pad) pad.classList.toggle("pressed", !!down);
  }

  function strike(lane) {
    if (perfectUnlocked()) {
      for (let i = 0; i < 3; i++) {
        setPad(i, true);
        judgeHit(i);
      }
      return;
    }
    setPad(lane, true);
    judgeHit(lane);
  }

  function releaseStrike(lane) {
    if (perfectUnlocked()) {
      for (let i = 0; i < 3; i++) setPad(i, false);
      return;
    }
    setPad(lane, false);
  }

  function onKeyUp(e) {
    const lane = KEY_MAP[e.code];
    if (lane === undefined) return;
    releaseStrike(lane);
  }

  function bindPads() {
    $$(".pad").forEach((pad) => {
      const lane = Number(pad.dataset.lane);
      const down = (ev) => {
        ev.preventDefault();
        strike(lane);
      };
      const up = () => pad.classList.remove("pressed");
      pad.addEventListener("pointerdown", down);
      pad.addEventListener("pointerup", up);
      pad.addEventListener("pointerleave", up);
      pad.addEventListener("pointercancel", up);
    });
    // Also allow tapping lanes themselves
    $$(".lane").forEach((laneEl) => {
      laneEl.addEventListener("pointerdown", (ev) => {
        ev.preventDefault();
        strike(Number(laneEl.dataset.lane));
      });
    });
  }

  function setUpgradeLayout(layout, persist) {
    const lay = layout === "b" || layout === "c" ? layout : "a";
    upgradesState.layout = lay;
    writeLayoutPref(lay);
    if (persist !== false) {
      try {
        const key = upgradesStorageKey(currentAuthUid());
        writeUpgradesKey(UPGRADES_GUEST_KEY, upgradesState);
        if (currentAuthUid()) writeUpgradesKey(key, upgradesState);
      } catch (_) {}
    }
    $$(".upgrade-tab").forEach((btn) => {
      const on = btn.getAttribute("data-layout") === lay;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    $$(".upgrade-panel").forEach((panel) => {
      const on = panel.getAttribute("data-layout") === lay;
      panel.classList.toggle("hidden", !on);
    });
  }

  function selectUpgradeTrack(track) {
    if (!UPGRADE_TRACKS[track]) return;
    upgradeSelectedTrack = track;
    $$("#upgrade-panel-a .upgrade-node").forEach((node) => {
      const on = node.getAttribute("data-track") === track;
      node.setAttribute("aria-pressed", on ? "true" : "false");
    });
    const meta = UPGRADE_TRACKS[track];
    const nameEl = $("#upgrade-a-name");
    const blurbEl = $("#upgrade-a-blurb");
    const costEl = $("#upgrade-a-cost");
    const buyBtn = $("#upgrade-a-buy");
    if (nameEl) {
      nameEl.textContent = meta.name;
      nameEl.className = "upgrade-detail-name " + meta.color;
    }
    if (blurbEl) blurbEl.textContent = meta.blurb;
    const cost = nextCost(track);
    const lv = clampLevel(upgradesState[track]);
    if (costEl) costEl.textContent = cost == null ? "MAX" : formatPoints(cost);
    if (buyBtn) {
      buyBtn.setAttribute("data-track", track);
      const can = cost != null && spendablePoints() >= cost;
      buyBtn.disabled = !can;
      buyBtn.classList.toggle("disabled", !can);
      buyBtn.textContent = lv >= trackMaxLevel(track) ? "MAX" : "BUY";
    }
  }

  function updateRadarPolygon() {
    const fill = $("#upgrade-radar-fill");
    if (!fill) return;
    const focus = clampLevel(upgradesState.focus) / MAX_UPGRADE_LV;
    const power = clampLevel(upgradesState.power) / MAX_UPGRADE_LV;
    const flow = clampLevel(upgradesState.flow) / MAX_UPGRADE_LV;
    // vertices: focus top (100,18), power br (178,150), flow bl (22,150); center ~ (100,106)
    const cx = 100, cy = 106;
    const f = { x: 100, y: 18 };
    const p = { x: 178, y: 150 };
    const l = { x: 22, y: 150 };
    function lerp(a, t) {
      return { x: cx + (a.x - cx) * t, y: cy + (a.y - cy) * t };
    }
    // scale from center; min 0.12 so empty still shows a tiny core
    const tf = lerp(f, 0.12 + 0.88 * focus);
    const tp = lerp(p, 0.12 + 0.88 * power);
    const tl = lerp(l, 0.12 + 0.88 * flow);
    fill.setAttribute(
      "points",
      tf.x.toFixed(1) + "," + tf.y.toFixed(1) + " " +
      tp.x.toFixed(1) + "," + tp.y.toFixed(1) + " " +
      tl.x.toFixed(1) + "," + tl.y.toFixed(1)
    );
  }

  function refreshUpgradeUI() {
    loadUpgrades();
    const spend = spendablePoints();
    const ptsVal = $("#upgrade-points-val");
    if (ptsVal) ptsVal.textContent = formatPoints(spend);
    const bPts = $("#upgrade-b-points");
    if (bPts) bPts.textContent = formatPoints(spend);
    const starMult = $("#upgrade-star-mult");
    if (starMult) starMult.textContent = "Score ×" + powerScoreMult().toFixed(2);

    Object.keys(UPGRADE_TRACKS).forEach((track) => {
      const lv = clampLevel(upgradesState[track]);
      const maxLv = trackMaxLevel(track);
      $$( '[data-lv-for="' + track + '"]' ).forEach((el) => {
        if (el.closest && el.closest(".upgrade-radar-buys")) {
          el.textContent = lv + "/" + maxLv;
        } else {
          el.textContent = "Lv " + lv + "/" + maxLv;
        }
      });
      const cost = nextCost(track);
      $$( '[data-cost-for="' + track + '"]' ).forEach((el) => {
        el.textContent = cost == null ? "MAX" : formatPoints(cost);
      });
    });

    // disable all buy buttons appropriately
    $$("#upgrade-overlay .upgrade-buy").forEach((btn) => {
      const track = btn.getAttribute("data-track");
      if (!track || !UPGRADE_TRACKS[track]) return;
      const cost = nextCost(track);
      const lv = clampLevel(upgradesState[track]);
      const maxLv = trackMaxLevel(track);
      const can = cost != null && spendablePoints() >= cost;
      btn.disabled = !can;
      btn.classList.toggle("disabled", !can);
      if (btn.id === "upgrade-a-buy") {
        btn.textContent = lv >= maxLv ? "MAX" : "BUY";
      } else if (!btn.closest(".upgrade-radar-buys")) {
        btn.textContent = lv >= maxLv ? "MAX" : "BUY";
      }
    });

    setUpgradeLayout(upgradesState.layout || "a", false);
    selectUpgradeTrack(upgradeSelectedTrack || "focus");
    updateRadarPolygon();
  }

  function openUpgrade(from) {
    upgradeFrom = from || "start";
    loadUpgrades();
    if (upgradeFrom === "results" && resultsOverlay) resultsOverlay.classList.add("hidden");
    if (upgradeFrom === "start" && startOverlay) startOverlay.classList.add("hidden");
    if (upgradeFrom === "pause" && pauseOverlay) pauseOverlay.classList.add("hidden");
    const overlay = $("#upgrade-overlay");
    if (overlay) overlay.classList.remove("hidden");
    refreshUpgradeUI();
  }

  function closeUpgrade() {
    const overlay = $("#upgrade-overlay");
    if (overlay) overlay.classList.add("hidden");
    const from = upgradeFrom;
    upgradeFrom = null;
    if (from === "results" && resultsOverlay) resultsOverlay.classList.remove("hidden");
    else if (from === "start" && startOverlay) {
      startOverlay.classList.remove("hidden");
      resumeStartBgmIfOnMenu();
    } else if (from === "pause" && pauseOverlay) pauseOverlay.classList.remove("hidden");
  }


  /* ---- start-screen background music (daily most-popular /media) ---- */
  const START_BGM_KEY = "emciix.game.startBgm";
  const START_BGM_FALLBACK_ID = "05AgmKvd3NI";
  let startBgmEl = null;
  let startBgmReady = null;
  let startBgmUnlocked = false;
  const START_BGM_MUTE_KEY = "emciix.game.startBgmMuted";
  let startBgmMuted = false;
  try {
    startBgmMuted = localStorage.getItem(START_BGM_MUTE_KEY) === "1";
  } catch (_) {}


  function todayLocalDateStr() {
    try {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Toronto",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
    } catch (_) {
      const d = new Date();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return d.getFullYear() + "-" + m + "-" + day;
    }
  }

  function readStartBgmCache() {
    try {
      const raw = localStorage.getItem(START_BGM_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      if (!parsed.day || !parsed.src) return null;
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function writeStartBgmCache(entry) {
    try {
      localStorage.setItem(START_BGM_KEY, JSON.stringify(entry));
    } catch (_) {}
  }

  function isMediaSrc(src) {
    return typeof src === "string" && src.indexOf("/media/") === 0;
  }

  function pickStartBgmFromMaps(viewsPayload, driveMap) {
    const viewsObj =
      viewsPayload && typeof viewsPayload === "object"
        ? (viewsPayload.views && typeof viewsPayload.views === "object"
            ? viewsPayload.views
            : viewsPayload)
        : {};
    const map = driveMap && typeof driveMap === "object" ? driveMap : {};
    const ranked = Object.keys(viewsObj)
      .filter((id) => id !== "updatedAt" && id !== "source" && id !== "views")
      .map((id) => ({ id, count: Number(viewsObj[id]) || 0 }))
      .sort((a, b) => b.count - a.count);

    for (let i = 0; i < ranked.length; i++) {
      const entry = map[ranked[i].id];
      if (entry && isMediaSrc(entry.src)) {
        return {
          id: ranked[i].id,
          src: entry.src,
          title: entry.title || ranked[i].id,
        };
      }
    }

    // Highest views overall even without media — then fall back to drive-map
    if (ranked.length) {
      const top = ranked[0];
      const entry = map[top.id];
      if (entry && isMediaSrc(entry.src)) {
        return { id: top.id, src: entry.src, title: entry.title || top.id };
      }
    }

    if (map[START_BGM_FALLBACK_ID] && isMediaSrc(map[START_BGM_FALLBACK_ID].src)) {
      const fb = map[START_BGM_FALLBACK_ID];
      return { id: START_BGM_FALLBACK_ID, src: fb.src, title: fb.title || "Make up shit" };
    }

    const firstId = Object.keys(map).find((id) => map[id] && isMediaSrc(map[id].src));
    if (firstId) {
      const fb = map[firstId];
      return { id: firstId, src: fb.src, title: fb.title || firstId };
    }
    return null;
  }

  async function resolveStartBgmTrack() {
    const day = todayLocalDateStr();
    const cached = readStartBgmCache();
    if (cached && cached.day === day && isMediaSrc(cached.src)) {
      return cached;
    }

    let viewsPayload = null;
    let driveMap = null;
    try {
      const [viewsRes, mapRes] = await Promise.all([
        fetch("/views.json?t=" + Date.now(), { cache: "no-store" }),
        fetch("/media/drive-map.json", { cache: "no-store" }),
      ]);
      if (viewsRes.ok) viewsPayload = await viewsRes.json();
      if (mapRes.ok) driveMap = await mapRes.json();
    } catch (err) {
      console.warn("start-bgm fetch failed", err);
    }

    let picked = pickStartBgmFromMaps(viewsPayload, driveMap);
    if (!picked && cached && isMediaSrc(cached.src)) {
      picked = { id: cached.id, src: cached.src, title: cached.title };
    }
    if (!picked) return null;

    const entry = {
      day,
      id: picked.id,
      src: picked.src,
      title: picked.title || picked.id,
      pickedAt: Date.now(),
    };
    writeStartBgmCache(entry);
    return entry;
  }

  function startOverlayVisible() {
    return !!(startOverlay && !startOverlay.classList.contains("hidden"));
  }

  function shouldPlayStartBgm() {
    return startOverlayVisible() && !playing && !startBgmMuted;
  }

  function pauseStartBgm() {
    if (!startBgmEl) return;
    try {
      startBgmEl.pause();
    } catch (_) {}
  }

  function tryPlayStartBgm() {
    if (!startBgmEl || !shouldPlayStartBgm()) return;
    if (!startBgmEl.src && !startBgmEl.getAttribute("src")) return;
    const p = startBgmEl.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }

  function applyStartBgmTrack(track) {
    if (!startBgmEl || !track || !isMediaSrc(track.src)) return;
    const abs = track.src;
    const current = startBgmEl.getAttribute("src") || "";
    if (current !== abs) {
      startBgmEl.src = abs;
      try {
        startBgmEl.load();
      } catch (_) {}
    }
    startBgmEl.loop = true;
    startBgmEl.muted = !!startBgmMuted;
    startBgmEl.volume = startBgmMuted ? 0 : 0.32;
    tryPlayStartBgm();
  }

  function unlockStartBgmFromGesture() {
    startBgmUnlocked = true;
    if (startBgmReady) {
      startBgmReady.then((track) => {
        if (track) applyStartBgmTrack(track);
        else tryPlayStartBgm();
      }).catch(() => {});
    } else {
      tryPlayStartBgm();
    }
  }

  function initStartBgm() {
    startBgmEl = document.getElementById("start-bgm");
    if (!startBgmEl) {
      startBgmEl = document.createElement("audio");
      startBgmEl.id = "start-bgm";
      startBgmEl.loop = true;
      startBgmEl.preload = "none";
      document.body.appendChild(startBgmEl);
    }
    startBgmEl.volume = 0.32;

    startBgmReady = resolveStartBgmTrack()
      .then((track) => {
        if (track) applyStartBgmTrack(track);
        return track;
      })
      .catch((err) => {
        console.warn("start-bgm init failed", err);
        return null;
      });

    if (startOverlay) {
      const unlock = () => unlockStartBgmFromGesture();
      startOverlay.addEventListener("pointerdown", unlock, { passive: true });
      startOverlay.addEventListener("keydown", unlock);
    }

    const muteBtn = document.getElementById("start-bgm-mute");
    function paintMuteBtn() {
      if (!muteBtn) return;
      muteBtn.setAttribute("aria-pressed", startBgmMuted ? "true" : "false");
      muteBtn.setAttribute("aria-label", startBgmMuted ? "Unmute menu music" : "Mute menu music");
      muteBtn.title = startBgmMuted ? "Unmute" : "Mute";
      const icon = muteBtn.querySelector(".start-bgm-mute-icon");
      const label = muteBtn.querySelector(".start-bgm-mute-label");
      if (icon) icon.textContent = startBgmMuted ? "🔇" : "🔊";
      if (label) label.textContent = startBgmMuted ? "UNMUTE" : "MUTE";
    }
    paintMuteBtn();
    if (muteBtn && !muteBtn._emciixBound) {
      muteBtn._emciixBound = true;
      muteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        startBgmMuted = !startBgmMuted;
        try {
          localStorage.setItem(START_BGM_MUTE_KEY, startBgmMuted ? "1" : "0");
        } catch (_) {}
        if (startBgmEl) {
          startBgmEl.muted = !!startBgmMuted;
          startBgmEl.volume = startBgmMuted ? 0 : 0.32;
        }
        paintMuteBtn();
        if (startBgmMuted) pauseStartBgm();
        else {
          startBgmUnlocked = true;
          tryPlayStartBgm();
        }
      });
    }

    if (startBgmEl) {
      startBgmEl.muted = !!startBgmMuted;
      startBgmEl.volume = startBgmMuted ? 0 : 0.32;
    }

    // Autoplay attempt (often blocked until gesture)
    tryPlayStartBgm();
  }

  function resumeStartBgmIfOnMenu() {
    if (!shouldPlayStartBgm()) return;
    if (startBgmReady) {
      startBgmReady.then((track) => {
        if (track) applyStartBgmTrack(track);
        else tryPlayStartBgm();
      }).catch(() => {});
    } else {
      tryPlayStartBgm();
    }
  }

  function bindUI() {
    startBtn.addEventListener("click", startGame);
    retryBtn.addEventListener("click", startGame);
    const nextLevelBtn = $("#next-level-btn");
    if (nextLevelBtn) nextLevelBtn.addEventListener("click", () => { goNextLevel().catch(console.error); });
    const confirmYes = $("#confirm-yes");
    const confirmNo = $("#confirm-no");
    if (confirmYes) {
      confirmYes.addEventListener("click", () => {
        if (pendingLevelIndex == null) return;
        applyLevelJump(pendingLevelIndex).catch(console.error);
      });
    }
    if (confirmNo) confirmNo.addEventListener("click", cancelLevelJump);
    if (confirmOverlay) {
      confirmOverlay.addEventListener("click", (ev) => {
        if (ev.target === confirmOverlay) cancelLevelJump();
      });
    }

    const levelsBtnStart = $("#levels-btn-start");
    const levelsBtnResults = $("#levels-btn-results");
    const levelsBtnPause = $("#levels-btn-pause");
    const levelsClose = $("#levels-close");
    if (levelsBtnStart) levelsBtnStart.addEventListener("click", () => openLevels("start"));
    if (levelsBtnResults) levelsBtnResults.addEventListener("click", () => openLevels("results"));
    if (levelsBtnPause) levelsBtnPause.addEventListener("click", () => openLevels("pause"));
    if (levelsClose) levelsClose.addEventListener("click", closeLevels);
    if (levelsOverlay) {
      levelsOverlay.addEventListener("click", (ev) => {
        if (ev.target === levelsOverlay) closeLevels();
      });
    }

    const upgradeBtnStart = $("#upgrade-btn-start");
    const upgradeBtnResults = $("#upgrade-btn-results");
    const upgradeBtnPause = $("#upgrade-btn-pause");
    const upgradeClose = $("#upgrade-close");
    const upgradeOverlay = $("#upgrade-overlay");
    if (upgradeBtnStart) upgradeBtnStart.addEventListener("click", () => openUpgrade("start"));
    if (upgradeBtnResults) upgradeBtnResults.addEventListener("click", () => openUpgrade("results"));
    if (upgradeBtnPause) upgradeBtnPause.addEventListener("click", () => openUpgrade("pause"));
    if (upgradeClose) upgradeClose.addEventListener("click", closeUpgrade);
    if (upgradeOverlay) {
      upgradeOverlay.addEventListener("click", (ev) => {
        if (ev.target === upgradeOverlay) closeUpgrade();
      });
      upgradeOverlay.addEventListener("click", (ev) => {
        const tab = ev.target.closest && ev.target.closest(".upgrade-tab");
        if (tab) {
          setUpgradeLayout(tab.getAttribute("data-layout"), true);
          return;
        }
        const node = ev.target.closest && ev.target.closest(".upgrade-node");
        if (node) {
          selectUpgradeTrack(node.getAttribute("data-track"));
          return;
        }
        const buy = ev.target.closest && ev.target.closest(".upgrade-buy");
        if (buy && !buy.disabled) {
          tryBuyTrack(buy.getAttribute("data-track"));
        }
      });
    }

    const pauseResume = $("#pause-resume");
    const pauseRestart = $("#pause-restart");
    if (pauseResume) pauseResume.addEventListener("click", resumeFromPause);
    if (pauseRestart) {
      pauseRestart.addEventListener("click", () => {
        if (pauseOverlay) pauseOverlay.classList.add("hidden");
        startGame().catch(console.error);
      });
    }

    pauseBtn.addEventListener("click", togglePause);
    $("#btn-back").addEventListener("click", () => {
      if (playing) startGame();
    });
    $("#btn-prev").addEventListener("click", () => {
      goPrevLevel().catch(console.error);
    });
    $("#btn-fwd").addEventListener("click", () => {
      if (!playing) return;
      audio.currentTime = Math.min(audio.duration || 151, audio.currentTime + 5);
    });
    $("#btn-next").addEventListener("click", () => {
      goNextLevel().catch(console.error);
    });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", () => {
      if (playing) measureLanes();
    });
    window.addEventListener("orientationchange", () => {
      setTimeout(measureLanes, 200);
    });
  }

  // Boot
  startBtn.disabled = true;
  loadUpgrades();
  bindPads();
  bindUI();
  bindAuthUI();
  initStartBgm();
  refreshPublicRanks().catch(console.error);
  setTimeout(() => refreshPublicRanks().catch(() => {}), 1500);
  setTimeout(() => refreshPublicRanks().catch(() => {}), 4000);
  loadAssets().catch((err) => {
    console.error(err);
    loadStatus.textContent = "Load error — check chart/audio paths";
    startBtn.disabled = false;
  });
})();
