import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { commandLibrary } from "./server/command_assist.js";
import { applyCorrections, normalizeInput, detectVendor, hasKeyword } from "./server/bot_utils.js";
import { getWebToolsReply } from "./server/bot_webtools.js";
import { getTriageReply } from "./server/bot_triage.js";
import { getIntelReply } from "./server/bot_intel.js";
import { getPhishingReply } from "./server/bot_phishing.js";
import { getComplianceReply } from "./server/bot_compliance.js";
import { initToolKit, renderToolKit, resetToolKit, stopAllSpeechForToolKit, clearToolKit } from "./components/toolkit_panel.js";
import {
  initCommandAssist,
  renderCommandAssist,
  resetCommandAssist,
  stopAllSpeechForCommand,
  clearCommandAssist,
} from "./components/command_assist_panel.js";
import {
  initIncidentTriage,
  renderIncidentTriage,
  resetIncidentTriage,
  stopIncidentTriageSpeech,
  clearIncidentTriage,
} from "./components/incident_triage_panel.js";
import {
  initThreatIntel,
  renderThreatIntel,
  resetThreatIntel,
  stopThreatIntelSpeech,
  clearThreatIntel,
} from "./components/threat_intel_panel.js";
import {
  initPhishingAnalyzer,
  renderPhishingAnalyzer,
  resetPhishingAnalyzer,
  stopPhishingAnalyzerSpeech,
  clearPhishingAnalyzer,
} from "./components/phishing_analyzer_panel.js";
import {
  initComplianceHelper,
  renderComplianceHelper,
  resetComplianceHelper,
  stopComplianceHelperSpeech,
  clearComplianceHelper,
} from "./components/compliance_helper_panel.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  where,
  setDoc,
  onSnapshot,
  Timestamp,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const invoke = getTauriInvoke();
let firebaseConfig = null;
if (invoke) {
  try {
    firebaseConfig = await invoke("firebase_config");
    console.log("firebaseConfig from Rust:", firebaseConfig);
  } catch (err) {
    console.warn("invoke(firebase_config) failed, falling back to local config", err);
  }
}
if (!firebaseConfig) {
  try {
    firebaseConfig = await fetch("firebase.config.json").then((r) => r.json());
    console.log("firebaseConfig from local file:", firebaseConfig);
  } catch (err) {
    console.warn("firebase.config.json not available; using empty config", err);
    firebaseConfig = {};
  }
}const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window._firebase = { app, auth, db };

const LOGIN_ACTIVITY_KEY = "ck_login_activity_pending";
const OFFLINE_MODE_KEY = "ck_offline_mode";
const STEALTH_MODE_KEY = "ck_stealth_mode";
const STEALTH_IP_KEY = "ck_stealth_ip";
const LAST_ACTIVITY_PREFIX = "ck_last_active_";
const SPEECH_MUTE_KEY = "ck_speech_muted";
const CIPHER_AUTOSHOW_KEY = "ck_cipher_autoshow";

function getUserKey() {
  return state.currentUser?.uid || state.currentUser?.email || "guest";
}

function isGuestUser() {
  return Boolean(state.isGuest || state.currentUser?.isGuest);
}

function requireFullAccount(reason) {
  if (isGuestUser()) {
    alert(`Create an account to ${reason}. Guest mode is read-only and cannot use cloud features.`);
    return false;
  }
  return true;
}

function loadUserSessions() {
  const key = `ck_activity_${getUserKey()}`;
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUserSessions() {
  const key = `ck_activity_${getUserKey()}`;
  localStorage.setItem(key, JSON.stringify(state.sessions));
  scheduleUserDataSave();
}

function loadUserNotifications() {
  const key = `ck_notifications_${getUserKey()}`;
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUserNotifications() {
  const key = `ck_notifications_${getUserKey()}`;
  localStorage.setItem(key, JSON.stringify(state.notifications));
}

function getUserStatsKey() {
  return `ck_user_stats_${getUserKey()}`;
}

function loadUserStats() {
  const raw = localStorage.getItem(getUserStatsKey());
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveUserStats() {
  const payload = {
    metrics: state.metrics,
    toolUsage: state.toolUsage,
    failedLogins: state.failedLogins,
    loginSessions: state.loginSessions,
    whoisCountries: state.whoisCountries,
  };
  localStorage.setItem(getUserStatsKey(), JSON.stringify(payload));
  scheduleUserDataSave();
}

function loadOfflineState() {
  return localStorage.getItem(OFFLINE_MODE_KEY) === "1";
}

function saveOfflineState() {
  localStorage.setItem(OFFLINE_MODE_KEY, state.isOffline ? "1" : "0");
}

function loadStealthState() {
  state.isStealth = localStorage.getItem(STEALTH_MODE_KEY) === "1";
  state.stealthIp = localStorage.getItem(STEALTH_IP_KEY) || "";
}

function saveStealthState() {
  localStorage.setItem(STEALTH_MODE_KEY, state.isStealth ? "1" : "0");
  if (state.stealthIp) {
    localStorage.setItem(STEALTH_IP_KEY, state.stealthIp);
  } else {
    localStorage.removeItem(STEALTH_IP_KEY);
  }
}

async function fetchExternalIp() {
  const endpoints = [
    "https://api.ipify.org?format=json",
    "https://api64.ipify.org?format=json",
  ];
  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(url, { cache: "no-store", signal: controller.signal });
      clearTimeout(timer);
      if (!response.ok) continue;
      const data = await response.json();
      const ip = data.ip || data.IP || data.address;
      if (typeof ip === "string" && ip.trim()) {
        return ip.trim();
      }
    } catch {
      // Try next endpoint.
    }
  }
  return "";
}

async function resolveIpFromDomain(domain) {
  try {
    const response = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data?.Answer?.find((answer) => answer.type === 1)?.data || null;
  } catch {
    return null;
  }
}

async function fetchGeoFromIp(ip) {
  if (!ip) return { countryName: null, location: "Unknown" };
  const geoEndpoints = [
    `https://ipapi.co/${ip}/json/`,
    `https://ipwho.is/${ip}`,
    `https://ipinfo.io/${ip}/json`,
  ];
  for (const geoUrl of geoEndpoints) {
    try {
      const geoResponse = await fetch(geoUrl);
      if (!geoResponse.ok) continue;
      const geo = await geoResponse.json();
      const countryName =
        geo.country_name ||
        geo.country ||
        geo.countryName ||
        geo.country_code ||
        geo.countryCode ||
        null;
      const parts = [geo.city, geo.region, geo.country_name || geo.country].filter(Boolean);
      const location = parts.join(", ") || "Unknown";
      return { countryName, location };
    } catch {
      // Try next endpoint.
    }
  }
  return { countryName: null, location: "Unknown" };
}

function incrementGeoCountry(countryName) {
  if (!countryName) return;
  state.whoisCountries[countryName] = (state.whoisCountries[countryName] || 0) + 1;
  saveUserStats();
  renderGeoDistribution();
}

function toBase64(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function fromBase64(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function updateStealthUI() {
  if (!stealthStatus || !stealthToggleBtn) return;
  stealthToggleBtn.classList.toggle("active", state.isStealth);
  if (!state.isStealth) {
    stealthStatus.textContent = "Stealth off";
    return;
  }
  const ipLabel = state.stealthIp ? `IP ${state.stealthIp}` : "IP pending";
  stealthStatus.textContent = `Stealth on • ${ipLabel}`;
}

function getAuthFailureKey(email) {
  if (!email) return null;
  return `ck_auth_failures_${email.toLowerCase()}`;
}

function loadAuthFailureCount(email) {
  const key = getAuthFailureKey(email);
  if (!key) return 0;
  const raw = localStorage.getItem(key);
  const count = Number.parseInt(raw || "0", 10);
  return Number.isNaN(count) ? 0 : count;
}

function saveAuthFailureCount(email, count) {
  const key = getAuthFailureKey(email);
  if (!key) return;
  if (!count) {
    localStorage.removeItem(key);
    return;
  }
  localStorage.setItem(key, String(count));
}

function getUserStatsDocRef() {
  if (!auth.currentUser || isGuestUser()) return null;
  return doc(db, "userStats", auth.currentUser.uid);
}

let userDataSaveTimer = null;

function scheduleUserDataSave() {
  if (!auth.currentUser || isGuestUser()) return;
  if (userDataSaveTimer) {
    clearTimeout(userDataSaveTimer);
  }
  userDataSaveTimer = setTimeout(() => {
    void saveUserDataToFirestore();
  }, 800);
}

async function saveUserDataToFirestore() {
  const ref = getUserStatsDocRef();
  if (!ref) return;
  const payload = {
    metrics: state.metrics,
    toolUsage: state.toolUsage,
    failedLogins: state.failedLogins,
    loginSessions: state.loginSessions,
    whoisCountries: state.whoisCountries,
    sessions: state.sessions,
    updatedAt: Timestamp.now(),
  };
  try {
    await setDoc(ref, payload, { merge: true });
  } catch (error) {
    console.warn("Unable to save user stats:", error);
  }
}

async function loadUserDataFromFirestore() {
  const ref = getUserStatsDocRef();
  if (!ref) return null;
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data();
  } catch (error) {
    console.warn("Unable to load user stats:", error);
    return null;
  }
}

function getLocalReportKey() {
  return `ck_local_reports_${getUserKey()}`;
}

function loadLocalReports() {
  const raw = localStorage.getItem(getLocalReportKey());
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    let changed = false;
    const normalized = parsed.map((report) => {
      if (report.id) return report;
      changed = true;
      return { ...report, id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}` };
    });
    if (changed) {
      saveLocalReports(normalized);
    }
    return normalized;
  } catch {
    return [];
  }
}

function saveLocalReports(reports) {
  localStorage.setItem(getLocalReportKey(), JSON.stringify(reports.slice(0, 5)));
}

async function saveReportToFirestore(payload) {
  if (!auth.currentUser || !requireFullAccount("save reports to the cloud")) {
    return null;
  }
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));
  const report = {
    ...payload,
    createdAt: Timestamp.now(),
    expiresAt,
  };
  const ref = await addDoc(collection(db, "users", auth.currentUser.uid, "reports"), report);
  return { id: ref.id, ...report };
}

function renderReportList() {
  if (!reportList) return;
  reportList.innerHTML = "";
  if (!state.reports.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No saved reports yet.";
    reportList.appendChild(empty);
    return;
  }
  state.reports.forEach((report) => {
    const item = document.createElement("div");
    item.className = "report-item";
    const created = report.createdAt?.toDate
      ? report.createdAt.toDate().toLocaleString()
      : report.savedAt
        ? new Date(report.savedAt).toLocaleString()
        : "Unknown date";
    const expires = report.expiresAt?.toDate
      ? report.expiresAt.toDate().toLocaleDateString()
      : null;
    const sessionLabel = report.sessionId
      ? state.sessions.find((session) => session.id === report.sessionId)?.label
      : null;
    const metaParts = [
      `Session: ${sessionLabel || "Unknown"}`,
      `Saved: ${created}`,
    ];
    if (expires) {
      metaParts.push(`Expires: ${expires}`);
    }
    item.innerHTML = `
      <div>
        <strong>${report.title || "Untitled report"}</strong>
        <span>${metaParts.join(" - ")}</span>
      </div>
      <div class="report-actions-inline">
        <label class="report-select">
          <input type="checkbox" data-report-id="${report.id}" class="report-checkbox" />
          Select
        </label>
        <button class="ghost" data-report-action="open" data-report-id="${report.id}">Open</button>
        <button class="ghost" data-report-action="pdf" data-report-id="${report.id}">PDF</button>
        <button class="ghost" data-report-action="delete" data-report-id="${report.id}">Delete</button>
      </div>
    `;
    reportList.appendChild(item);
  });
}

function updateReportWarning() {
  if (!reportWarning) return;
  const soon = state.reports.some((report) => {
    if (!report.expiresAt?.toDate) return false;
    const daysLeft = (report.expiresAt.toDate() - new Date()) / (1000 * 60 * 60 * 24);
    return daysLeft <= 7;
  });
  if (soon) {
    reportWarning.textContent =
      "Some reports expire within 7 days. Export now if you need them later.";
    return;
  }
  reportWarning.textContent = "Max 5 local reports. Export if you need more.";
}

async function loadReports() {
  if (!auth.currentUser || isGuestUser()) return;
  const q = query(
    collection(db, "users", auth.currentUser.uid, "reports"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  const now = new Date();
  const reports = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const expired = reports.filter((report) => {
    if (!report.expiresAt?.toDate) return false;
    return report.expiresAt.toDate() <= now;
  });
  if (expired.length) {
    await Promise.all(
      expired.map((report) =>
        deleteDoc(doc(db, "users", auth.currentUser.uid, "reports", report.id))
      )
    );
  }
  state.reports = reports.filter((report) => !expired.includes(report));
  renderReportList();
  updateReportWarning();
}

const state = {
  currentUser: null,
  isGuest: false,
  toolData: {},
  notifications: [],
  activities: [],
  sessions: [],
  currentSessionId: null,
  reports: [],
  toolSessionSelection: {},
  metrics: {
    checksRun: 0,
    reports: 0,
  },
  toolUsage: {},
  failedLogins: 0,
  loginSessions: [],
  whoisCountries: {},
  authSessionStart: null,
  userHandle: null,
  chat: {
    invites: [],
    activeChatId: null,
    chats: {},
  },
  isOffline: false,
  isStealth: false,
  stealthIp: "",
};

// Global speech synthesis mute flag
let initialSpeechMuted = false;
try {
  initialSpeechMuted = localStorage.getItem(SPEECH_MUTE_KEY) === "1";
} catch {
  initialSpeechMuted = false;
}
window.isSpeechMuted = initialSpeechMuted;

let cipherAutoEnabled = true;
try {
  const storedAuto = localStorage.getItem(CIPHER_AUTOSHOW_KEY);
  if (storedAuto !== null) {
    cipherAutoEnabled = storedAuto === "1";
  }
} catch {
  cipherAutoEnabled = true;
}

const honeyEvents = [];

let wifiScanTimer = null;
let wifiLiveActive = false;
let wifiScanInProgress = false;
const WIFI_SCAN_TIMEOUT_MS = 12000;
let wifiSelectedChannel = null;
let wifiSelectedSsid = null;
const wifiNetworkHistory = new Map();
const WIFI_PRUNE_AFTER = 10;
var pcapActive = false;
var pcapPackets = [];
var pcapTimer = null;
var pcapStartedAt = 0;
var pcapDurationMs = 0;
const PCAP_MAX_PACKETS = 240;
const PCAP_SAVES_KEY = "ck_pcap_saves";
let pcapSelectedInterface = "auto";
var pcapStartBtn;
var pcapStopBtn;
var pcapClearBtn;
var pcapSaveBtn;
var pcapExportBtn;
var pcapExportFormat;
var pcapViewSavedBtn;
var pcapInfoBtn;
var pcapInfoPanel;
var pcapSavedModal;
var pcapSavedList;
var pcapSavedCloseBtn;
var pcapSavedDeleteBtn;
var pcapSavedCheckAllBtn;
var pcapSavedUncheckAllBtn;
var pcapStatus;
var pcapFeed;
var pcapStats;
var pcapInterface;
var pcapInterfaceSelect;
var pcapInterfaceList;
var pcapInterfacesList;
var pcapFilterInput;
var pcapProtocolFilters;
var pcapUnlistenPacket;
var pcapUnlistenStatus;
var pcapUnlistenError;
var pcapActiveInterface = "auto";
let npcapReady = false;
var pcapRefreshBtn;
let pcapInterfaces = [];
const hasNativePcap = isDesktopApp() && Boolean(getTauriInvoke());
// Expose for debugging in console
if (typeof window !== "undefined") {
  window.hasNativePcap = hasNativePcap;
  window.getTauriInvokeFn = getTauriInvoke;
}
let chatInvitesUnsub = null;
let chatMessagesUnsub = null;
let chatMessagesChatId = null;
let chatRoomsUnsub = null;

const INACTIVITY_LIMIT_MS = 15 * 60 * 1000;
const HIDDEN_LOGOUT_MS = 5 * 60 * 1000;
let inactivityTimer = null;
let pendingLogoutMessage = "";
let hiddenLogoutTimer = null;
let lastActivitySavedAt = 0;

function getLastActivityKey() {
  return `${LAST_ACTIVITY_PREFIX}${getUserKey()}`;
}

function loadLastActivity() {
  const raw = localStorage.getItem(getLastActivityKey());
  const parsed = Number.parseInt(raw || "0", 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function saveLastActivity(timestamp = Date.now()) {
  if (!state.currentUser) return;
  if (timestamp - lastActivitySavedAt < 1000) return;
  lastActivitySavedAt = timestamp;
  localStorage.setItem(getLastActivityKey(), String(timestamp));
}

function clearLastActivity() {
  if (!state.currentUser) return;
  lastActivitySavedAt = 0;
  localStorage.removeItem(getLastActivityKey());
}

function getFallbackLastActive() {
  const meta = state.currentUser?.metadata;
  if (!meta) return null;
  const numeric = Number.parseInt(meta.lastLoginAt || "", 10);
  if (!Number.isNaN(numeric) && numeric > 0) {
    return numeric;
  }
  if (meta.lastSignInTime) {
    const parsed = new Date(meta.lastSignInTime);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.getTime();
    }
  }
  return null;
}

function shouldForceInactivityLogout() {
  if (!state.currentUser) return false;
  const lastActive = loadLastActivity() || getFallbackLastActive();
  if (!lastActive) return false;
  return Date.now() - lastActive >= INACTIVITY_LIMIT_MS;
}

function resetInactivityTimer() {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }
  if (!state.currentUser) return;
  saveLastActivity();
  inactivityTimer = setTimeout(() => {
    pendingLogoutMessage = "Logged out due to inactivity.";
    void signOut(auth);
  }, INACTIVITY_LIMIT_MS);
}

function stopInactivityTimer() {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
}

const userActivityEvents = ["click", "keydown", "mousemove", "scroll", "touchstart"];
userActivityEvents.forEach((eventName) => {
  window.addEventListener(
    eventName,
    () => {
      if (state.currentUser) {
        resetInactivityTimer();
      }
    },
    { passive: true }
  );
});

window.addEventListener("beforeunload", () => {
  stopInactivityTimer();
  finalizeLoginSession();
});

function startHiddenLogoutTimer() {
  if (hiddenLogoutTimer) return;
  hiddenLogoutTimer = setTimeout(() => {
    pendingLogoutMessage = "Logged out due to inactivity.";
    void signOut(auth);
  }, HIDDEN_LOGOUT_MS);
}

function stopHiddenLogoutTimer() {
  if (hiddenLogoutTimer) {
    clearTimeout(hiddenLogoutTimer);
    hiddenLogoutTimer = null;
  }
}

document.addEventListener("visibilitychange", () => {
  if (!state.currentUser) return;
  if (document.hidden) {
    startHiddenLogoutTimer();
  } else {
    stopHiddenLogoutTimer();
  }
});

const body = document.body;
const authCanvas = document.getElementById("authCanvas");
const authCtx = authCanvas ? authCanvas.getContext("2d") : null;
let authNodes = [];
const authMotion = true;
const authConfig = {
  lineDistance: 220,
  nodeMin: 1.7,
  nodeMax: 4.2,
  speed: 0.28,
  bg: "rgba(2, 20, 11, 0.25)",
  lineRgb: "44, 255, 103",
  nodeRgb: "160, 255, 210",
};

const authView = document.getElementById("authView");
const dashboardView = document.getElementById("dashboardView");
const tabs = document.querySelectorAll(".tab");
const forms = {
  login: document.getElementById("loginForm"),
  signup: document.getElementById("signupForm"),
};
const loginMessage = document.getElementById("loginMessage");
const welcome = document.getElementById("welcome");
const guestAuthBtn = document.getElementById("guestLoginBtn");
const notifBtn = document.getElementById("notifBtn");
const notifPanel = document.getElementById("notifPanel");
const notifList = document.getElementById("notifList");
const notifBadge = document.getElementById("notifBadge");
const friendChatBtn = document.getElementById("friendChatBtn");
const toolsReadyValue = document.getElementById("toolsReadyValue");
const mostUsedToolValue = document.getElementById("mostUsedToolValue");
const mostUsedToolDetail = document.getElementById("mostUsedToolDetail");
const checksRunValue = document.getElementById("checksRunValue");
const riskFlagsValue = document.getElementById("riskFlagsValue");
const reportsValue = document.getElementById("reportsValue");
const resetMostUsedBtn = document.getElementById("resetMostUsedBtn");
const resetChecksBtn = document.getElementById("resetChecksBtn");
const resetRiskFlagsBtn = document.getElementById("resetRiskFlagsBtn");
const resetReportsBtn = document.getElementById("resetReportsBtn");
const resetGeoBtn = document.getElementById("resetGeoBtn");
const stealthToggleBtn = document.getElementById("stealthToggleBtn");
const stealthStatus = document.getElementById("stealthStatus");
const connectionStatus = document.getElementById("connectionStatus");
const offlineToggleBtn = document.getElementById("offlineToggleBtn");
const recentActivityList = document.getElementById("recentActivityList");
const activityChart = document.getElementById("activityChart");
const activityBars = document.getElementById("activityBars");
const activityEmpty = document.getElementById("activityEmpty");
const resetActivityGraphBtn = document.getElementById("resetActivityGraphBtn");
const geoList = document.getElementById("geoList");
const viewAllActivityBtn = document.getElementById("viewAllActivityBtn");
const activityClearBtn = document.getElementById("activityClearBtn");
const activityModal = document.getElementById("activityModal");
const activityModalList = document.getElementById("activityModalList");
const activityCloseBtn = document.getElementById("activityCloseBtn");
const activityToReportBtn = document.getElementById("activityToReportBtn");
const reportSessionSelect = document.getElementById("reportSessionSelect");
const reportList = document.getElementById("reportList");
const reportWarning = document.getElementById("reportWarning");
const reportSelectBtn = document.getElementById("reportSelectBtn");
const reportSelectAllBtn = document.getElementById("reportSelectAllBtn");
const reportDeleteSelectedBtn = document.getElementById("reportDeleteSelectedBtn");
const notifViewAllBtn = document.getElementById("notifViewAllBtn");
const notifClearAllBtn = document.getElementById("notifClearAllBtn");
const notifModal = document.getElementById("notifModal");
const notifModalList = document.getElementById("notifModalList");
const notifCloseBtn = document.getElementById("notifCloseBtn");
const activeSessionSelect = document.getElementById("activeSessionSelect");
const activeSessionCreateBtn = document.getElementById("activeSessionCreateBtn");
const toolSessionSelects = document.querySelectorAll(".tool-session");
const sessionCreateBtn = document.getElementById("sessionCreateBtn");
const sessionList = document.getElementById("sessionList");
const sessionSelectAllBtn = document.getElementById("sessionSelectAllBtn");
const sessionDeleteSelectedBtn = document.getElementById("sessionDeleteSelectedBtn");
const promptModal = document.getElementById("promptModal");
const promptTitle = document.getElementById("promptTitle");
const promptMessage = document.getElementById("promptMessage");
const promptInput = document.getElementById("promptInput");
const promptCancelBtn = document.getElementById("promptCancelBtn");
const promptConfirmBtn = document.getElementById("promptConfirmBtn");
const cipherToggle = document.getElementById("cipherToggle");
const cipherWidget = document.getElementById("cipherWidget");
const cipherBody = document.getElementById("cipherBody");
const cipherCloseBtn = document.getElementById("cipherCloseBtn");
const cipherAutoBtn = document.getElementById("cipherAutoBtn");
const cipherAiBtn = document.getElementById("cipherAiBtn");
const cipherTopBtn = document.getElementById("cipherTopBtn");
const cipherDeepBody = document.getElementById("cipherDeepBody");
const cipherDeepPanel = document.getElementById("cipherDeepPanel");
const cipherDeepCloseBtn = document.getElementById("cipherDeepCloseBtn");
const cipherSpeakBtn = document.getElementById("cipherSpeakBtn");
const cipherNextBtn = document.getElementById("cipherNextBtn");
const cipherRestartBtn = document.getElementById("cipherRestartBtn");
const cipherNewChatBtn = document.getElementById("cipherNewChatBtn");
const cipherChatList = document.getElementById("cipherChatList");
const cipherBotButtons = document.querySelectorAll(".cipher-bots [data-bot]");
const cipherAvatar = document.getElementById("cipherAvatar");
const profileBtn = document.getElementById("profileBtn");
const profileDropdown = document.getElementById("profileDropdown");
const profileSettingsBtn = document.getElementById("profileSettingsBtn");
const profileLogoutBtn = document.getElementById("profileLogoutBtn");
const settingsModal = document.getElementById("settingsModal");
const settingsForm = document.getElementById("settingsForm");
const settingsFullName = document.getElementById("settingsFullName");
const settingsAddress = document.getElementById("settingsAddress");
const settingsPhone = document.getElementById("settingsPhone");
const settingsPassword = document.getElementById("settingsPassword");
const settingsPasswordCurrent = document.getElementById("settingsPasswordCurrent");
const settingsPasswordConfirm = document.getElementById("settingsPasswordConfirm");
const settingsCloseBtn = document.getElementById("settingsCloseBtn");
const settingsCancelBtn = document.getElementById("settingsCancelBtn");

closeProfileDropdown();
updateCipherAutoBtn();


const setCurrentUser = (user) => {
  state.currentUser = user;
};

const PROFILE_SETTINGS_PREFIX = "ck_profile_info_";

function getProfileSettingsKey() {
  return `${PROFILE_SETTINGS_PREFIX}${getUserKey()}`;
}

function loadProfileSettings() {
  const raw = localStorage.getItem(getProfileSettingsKey());
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveProfileSettings(values) {
  localStorage.setItem(getProfileSettingsKey(), JSON.stringify(values));
}

function resetCipherChats() {
  cipherChats.list = [];
  cipherChats.activeId = null;
  cipherChats.bot = "general";
}

function setLoginMessage(message) {
  if (!loginMessage) return;
  loginMessage.textContent = message;
  loginMessage.classList.remove("hidden");
}

function clearLoginMessage() {
  if (!loginMessage) return;
  loginMessage.textContent = "";
  loginMessage.classList.add("hidden");
}

function setProfileInitials(name) {
  if (!profileBtn) return;
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
  profileBtn.querySelector(".profile-initials").textContent =
    initials || "NK";
}

function closeProfileDropdown() {
  if (profileDropdown) {
    profileDropdown.classList.add("hidden");
  }
  if (profileBtn) {
    profileBtn.setAttribute("aria-expanded", "false");
  }
}

function toggleProfileDropdown(force) {
  if (!profileDropdown) return;
  const shouldOpen =
    typeof force === "boolean" ? force : profileDropdown.classList.contains("hidden");
  profileDropdown.classList.toggle("hidden", !shouldOpen);
  if (profileBtn) {
    profileBtn.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
  }
}

function openSettingsModal() {
  if (!settingsModal) return;
  settingsModal.classList.remove("hidden");
  const saved = loadProfileSettings();
  if (settingsFullName) {
    settingsFullName.value =
      saved.fullName || state.currentUser?.displayName || state.currentUser?.email || "";
  }
  if (settingsAddress) {
    settingsAddress.value = saved.address || "";
  }
  if (settingsPhone) {
    settingsPhone.value = saved.phone || "";
  }
  if (settingsPassword) {
    settingsPassword.value = "";
  }
  if (settingsPasswordCurrent) {
    settingsPasswordCurrent.value = "";
  }
  if (settingsPasswordConfirm) {
    settingsPasswordConfirm.value = "";
  }
}

function closeSettingsModal() {
  if (!settingsModal) return;
  settingsModal.classList.add("hidden");
}

const showDashboard = () => {
  body.classList.remove("auth-mode");
  authView.classList.add("hidden");
  dashboardView.classList.remove("hidden");
  const savedProfile = loadProfileSettings();
  const displayName =
    savedProfile.fullName ||
    state.currentUser?.displayName ||
    state.currentUser?.email ||
    "user";
  welcome.textContent = `Welcome, ${displayName}`;
  if (chatHandleDisplay) {
    if (state.userHandle?.handle) {
      chatHandleDisplay.textContent = state.userHandle.handle;
    }
  }
  setProfileInitials(displayName);
  updateOverview();
  if (cipherAutoEnabled) {
    cipherWidget.classList.remove("hidden");
    cipherState.opened = true;
    renderCipherGuide();
  } else {
    cipherWidget.classList.add("hidden");
    cipherState.opened = false;
  }
  setMobileNavState(false);
  resetInactivityTimer();
};

const showAuth = () => {
  body.classList.add("auth-mode");
  dashboardView.classList.add("hidden");
  authView.classList.remove("hidden");
  if (notifPanel) {
    notifPanel.classList.add("hidden");
  }
  if (activityModal) {
    activityModal.classList.add("hidden");
  }
  if (notifModal) {
    notifModal.classList.add("hidden");
  }
  if (promptModal) {
    promptModal.classList.add("hidden");
  }
  if (cipherWidget) {
    cipherWidget.classList.add("hidden");
  }
  if (cipherDeepPanel) {
    cipherDeepPanel.classList.add("hidden");
  }
  cipherState.opened = false;
  resetCipherChats();
  clearLoginMessage();
  closeProfileDropdown();
  closeSettingsModal();
  stopInactivityTimer();
  setMobileNavState(false);
  if (pendingLogoutMessage) {
    const message = pendingLogoutMessage;
    pendingLogoutMessage = "";
    setTimeout(() => setLoginMessage(message), 60);
  }
};

function updateOverview() {
  if (!toolsReadyValue) return;
  const toolButtons = document.querySelectorAll("#toolNav button");
  const readyCount = Math.max(0, toolButtons.length - 1);
  toolsReadyValue.textContent = readyCount.toString();
  checksRunValue.textContent = state.metrics.checksRun.toString();
  reportsValue.textContent = state.metrics.reports.toString();
  riskFlagsValue.textContent = state.failedLogins.toString();
  if (mostUsedToolValue && mostUsedToolDetail) {
    const entries = Object.entries(state.toolUsage);
    if (!entries.length) {
      mostUsedToolValue.textContent = "-";
      mostUsedToolDetail.textContent = "No usage yet";
    } else {
      entries.sort((a, b) => b[1] - a[1]);
      const [tool, count] = entries[0];
      const label = tool
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
      mostUsedToolValue.textContent = label;
      mostUsedToolDetail.textContent = `${count} runs`;
    }
  }
}

function rebuildActivityCache() {
  const all = state.sessions.flatMap((session) =>
    session.activities.map((entry) => ({ ...entry, sessionId: session.id }))
  );
  state.activities = all.sort((a, b) => b.ts - a.ts);
}

function renderActivity() {
  if (!recentActivityList) return;
  recentActivityList.innerHTML = "";
  const recent = state.activities.slice(0, 5);
  if (!recent.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No activity yet.";
    recentActivityList.appendChild(empty);
    return;
  }
  recent.forEach((item) => {
    const row = document.createElement("div");
    row.className = "activity-item";
    row.innerHTML = `
      <span class="dot"></span>
      <div>
        <p>${item.message}</p>
        <span>${item.time}</span>
      </div>
    `;
    recentActivityList.appendChild(row);
  });
  const activeRange = document.querySelector(".panel-tabs .chip.active")?.dataset.range || "24h";
  setActivityRange(activeRange);
}

function renderAllActivity() {
  if (!activityModalList) return;
  activityModalList.innerHTML = "";
  if (!state.activities.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No activity yet.";
    activityModalList.appendChild(empty);
    return;
  }
  state.activities.forEach((item) => {
    const row = document.createElement("div");
    row.className = "activity-item";
    row.innerHTML = `
      <span class="dot"></span>
      <div>
        <p>${item.message}</p>
        <span>${item.time}</span>
      </div>
    `;
    activityModalList.appendChild(row);
  });
}

function ensureActiveSession() {
  if (state.currentSessionId) return;
  const now = new Date();
  const sessionId = `${now.getTime()}`;
  state.currentSessionId = sessionId;
  state.sessions.unshift({
    id: sessionId,
    label: "General session",
    startedAt: now.toISOString(),
    activities: [],
    outputs: {},
  });
  state.sessions = state.sessions.slice(0, 20);
  saveUserSessions();
}

function addActivity(message) {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const entry = { message, time, ts: now.getTime() };
  ensureActiveSession();
  const session = state.sessions.find((item) => item.id === state.currentSessionId);
  if (session) {
    session.activities.unshift(entry);
    session.activities = session.activities.slice(0, 200);
    saveUserSessions();
  }
  rebuildActivityCache();
  renderActivity();
  renderAllActivity();
  saveUserStats();
}

function clearAllActivities() {
  state.sessions.forEach((session) => {
    session.activities = [];
  });
  saveUserSessions();
  rebuildActivityCache();
  renderActivity();
  renderAllActivity();
  const activeRange = document.querySelector(".panel-tabs .chip.active")?.dataset.range || "24h";
  setActivityRange(activeRange);
}

function getSessionForTool(toolName) {
  const selected = state.toolSessionSelection[toolName];
  if (!selected) return null;
  return state.sessions.find((session) => session.id === selected) || null;
}

function saveToolOutput(toolName, value) {
  const session = getSessionForTool(toolName);
  if (!session) return;
  session.outputs = session.outputs || {};
  session.outputs[toolName] = value;
  saveUserSessions();
  if (cipherState.tool === toolName && shouldAutoAdvance("save")) {
    markActionDone("save");
    advanceCipherStep("Saved to session. You can move to another tool.");
  }
}

const cipherState = {
  tool: "overview",
  stepIndex: 0,
  opened: false,
  completed: {},
};
let cipherSpeechUtterance = null;
let cipherDeepSpeechUtterance = null;
const cipherDeepContext = {
  currentTool: null,
  vendor: null,
  device: null,
  incidentType: null,
  incidentPhase: null,
  intelFocus: null,
  intelDepth: null,
  phishingTopic: null,
  phishingDetail: null,
  complianceFramework: null,
  complianceDetail: null,
};

function updateCipherAutoBtn() {
  if (!cipherAutoBtn) return;
  cipherAutoBtn.textContent = cipherAutoEnabled ? "Auto-popup: On" : "Auto-popup: Off";
  cipherAutoBtn.setAttribute("aria-pressed", cipherAutoEnabled ? "true" : "false");
}

function setCipherAutoEnabled(enabled) {
  cipherAutoEnabled = Boolean(enabled);
  try {
    localStorage.setItem(CIPHER_AUTOSHOW_KEY, cipherAutoEnabled ? "1" : "0");
  } catch {
    // ignore storage failures
  }
  updateCipherAutoBtn();
  if (cipherAutoEnabled && cipherWidget?.classList.contains("hidden")) {
    cipherWidget.classList.remove("hidden");
    cipherState.opened = true;
    renderCipherGuide();
  }
}

const cipherChats = {
  list: [],
  activeId: null,
  bot: "toolkit",
};

const botLabels = {
  toolkit: "Cipher AI (Tool Kit)",
  general: "Cipher AI (Tools Kit)",
  commands: "Cipher AI (Command Assist)",
  triage: "Cipher AI (Incident Triage)",
  intel: "Cipher AI (Threat Intel Summary)",
  phishing: "Cipher AI (Phishing Analyzer)",
  compliance: "Cipher AI (Compliance Helper)",
};

const botIntro = {
  toolkit: "Cipher AI (Tool Kit) connected. Pick a tool to explore.",
  general: "Cipher AI (Tools Kit) connected. Ask me anything about the tools.",
  commands: "Cipher AI (Command Assist) connected. Let me help you find the right command.",
  triage: "Cipher AI (Incident Triage) connected. Ask me about incident response steps.",
  intel: "Cipher AI (Threat Intel Summary) connected. Ask me to summarize IOCs and notes.",
  phishing: "Cipher AI (Phishing Analyzer) connected. Ask me about headers and red flags.",
  compliance: "Cipher AI (Compliance Helper) connected. Ask me about control mapping.",
};

const cipherGuides = {
  overview: [
    "Use the sidebar to pick a tool.",
    "Run a tool and check its result box.",
    "Save outputs to a session if needed.",
  ],
  sessions: [
    "Create a session to track activity.",
    "Use the session dropdown to switch active session.",
    "Delete sessions you no longer need.",
  ],
  password: [
    "Type a password to see strength hints.",
    "Aim for 12+ chars with mixed types.",
    "Save to a session if it is part of a report.",
  ],
  subnet: [
    "Enter CIDR like 192.168.1.10/24.",
    "Click Calculate to see network info.",
    "Save the output to a session if needed.",
  ],
  log: [
    "Paste logs in the text box.",
    "Click Analyze to get errors and IPs.",
    "Save to a session for report output.",
  ],
  url: [
    "Paste a full URL including https://.",
    "Click Check URL to see risk flags.",
    "Save results to a session if needed.",
  ],
  hash: [
    "Choose a file with the picker.",
    "Wait for SHA-256 hash output.",
    "Save results to a session if needed.",
  ],
  whois: [
    "Enter a domain like example.com.",
    "Click Lookup to fetch RDAP data.",
    "Save results to a session if needed.",
  ],
  report: [
    "Pick a session to include its outputs.",
    "Generate the report, then Save local if needed.",
    "Export PDF if you need a file.",
  ],
};

function addCipherMessage(text, type) {
  if (!cipherBody) return;
  const message = document.createElement("div");
  message.className = `cipher-message${type === "user" ? " user" : ""}`;
  message.textContent = text;
  cipherBody.appendChild(message);
  cipherBody.scrollTop = cipherBody.scrollHeight;
}

function getCipherChatKey() {
  return `ck_cipher_chats_${getUserKey()}_${cipherChats.bot || "general"}`;
}

function loadCipherChats() {
  const raw = localStorage.getItem(getCipherChatKey());
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const normalized = parsed.map((chat) => ({
      ...chat,
      updatedAt: chat.updatedAt || Date.now(),
    }));
    return normalized;
  } catch {
    return [];
  }
}

function getNextChatIndex() {
  const existing = cipherChats.list
    .map((chat) => chat.title || "")
    .map((title) => {
      const match = title.match(/^Unnamed chat\s+(\d+)$/i);
      return match ? Number(match[1]) : 0;
    });
  return (existing.length ? Math.max(...existing) : 0) + 1;
}

function saveCipherChats() {
  localStorage.setItem(getCipherChatKey(), JSON.stringify(cipherChats.list));
}

function refreshBotChats(bot) {
  cipherChats.bot = bot;
  cipherChats.list = loadCipherChats();
  ensureActiveChat();
  updateCipherDeepTitle();
  renderCipherChatList();
  renderActiveCipherChat();
  cipherDeepContext.currentTool = null;
  cipherDeepContext.vendor = null;
  cipherDeepContext.device = null;
  cipherDeepContext.incidentType = null;
  cipherDeepContext.incidentPhase = null;
  cipherDeepContext.intelFocus = null;
  cipherDeepContext.intelDepth = null;
  cipherDeepContext.phishingTopic = null;
  cipherDeepContext.phishingDetail = null;
  cipherDeepContext.complianceFramework = null;
  cipherDeepContext.complianceDetail = null;
}

function updateCipherDeepTitle() {
  const label = botLabels[cipherChats.bot] || "Cipher AI";
  if (cipherAvatar) {
    const text = cipherAvatar.querySelector(".cipher-avatar-text");
    if (text) {
      text.textContent = label;
    }
  }
}

function ensureActiveChat() {
  if (cipherChats.activeId && cipherChats.list.find((c) => c.id === cipherChats.activeId)) {
    return;
  }
  if (cipherChats.list.length) {
    cipherChats.activeId = cipherChats.list[0].id;
    return;
  }
  const id = `chat-${Date.now()}`;
  const index = getNextChatIndex();
  cipherChats.activeId = id;
  cipherChats.list.unshift({
    id,
    title: `Unnamed chat ${index}`,
    messages: [],
    updatedAt: Date.now(),
  });
  saveCipherChats();
}

function renderCipherChatList() {
  if (!cipherChatList) return;
  cipherChatList.innerHTML = "";
  if (!cipherChats.list.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No chats yet.";
    cipherChatList.appendChild(empty);
    return;
  }
  const sorted = [...cipherChats.list].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  sorted.forEach((chat) => {
    const item = document.createElement("div");
    item.className = "cipher-chat-item";
    item.classList.toggle("active", chat.id === cipherChats.activeId);
    item.dataset.chatId = chat.id;
    item.innerHTML = `
      <div class="cipher-chat-title" data-chat-id="${chat.id}">${chat.title || "New chat"}</div>
      <div class="cipher-chat-menu">
        <button type="button" data-chat-menu="${chat.id}" aria-label="Chat menu">⋯</button>
        <div class="cipher-chat-dropdown hidden" data-chat-dropdown="${chat.id}">
          <button type="button" data-chat-action="rename" data-chat-id="${chat.id}">Rename</button>
          <button type="button" data-chat-action="delete" data-chat-id="${chat.id}">Delete</button>
        </div>
      </div>
    `;
    cipherChatList.appendChild(item);
  });
}

function renderCipherMessageContent(container, text) {
  container.innerHTML = "";
  const parts = text.split("```");
  if (parts.length === 1) {
    const span = document.createElement("span");
    span.className = "cipher-text";
    span.textContent = text;
    container.appendChild(span);
    return;
  }
  parts.forEach((part, index) => {
    if (index % 2 === 1) {
      const codeText = part.trim();
      const pre = document.createElement("pre");
      pre.className = "cipher-code";
      const copy = document.createElement("button");
      copy.type = "button";
      copy.className = "cipher-copy";
      copy.dataset.copy = codeText;
      copy.textContent = "Copy";
      const code = document.createElement("code");
      code.textContent = codeText;
      pre.appendChild(copy);
      pre.appendChild(code);
      container.appendChild(pre);
    } else if (part.trim()) {
      const span = document.createElement("span");
      span.className = "cipher-text";
      span.textContent = part;
      container.appendChild(span);
    }
  });
}

function renderActiveCipherChat() {
  if (!cipherDeepBody) return;
  const chat = cipherChats.list.find((c) => c.id === cipherChats.activeId);
  cipherDeepBody.innerHTML = "";
  if (!chat) return;
  if (!chat.messages.length) {
    const msg = document.createElement("div");
    msg.className = "cipher-message";
    renderCipherMessageContent(
      msg,
      botIntro[cipherChats.bot] || "Cipher AI (Tools Kit) connected. Pick a tool to explore."
    );
    cipherDeepBody.appendChild(msg);
    return;
  }
  chat.messages.forEach((msg) => {
    const bubble = document.createElement("div");
    bubble.className = `cipher-message${msg.role === "user" ? " user" : ""}`;
    renderCipherMessageContent(bubble, msg.text);
    cipherDeepBody.appendChild(bubble);
  });
  cipherDeepBody.scrollTop = cipherDeepBody.scrollHeight;
}


function renderCipherGuide() {
  if (!cipherBody) return;
  cipherBody.innerHTML = "";
  const lines = [
    "Hi, I am Cipher, your assistant.",
    "To explore tools:",
    "Use the sidebar to pick a tool.",
    "Click Next for the following instruction.",
  ];
  lines.forEach((line) => addCipherMessage(line, "bot"));
}


function getCipherSpeechText() {
  if (!cipherBody) return "";
  const messages = cipherBody.querySelectorAll(".cipher-message");
  const last = messages[messages.length - 1];
  if (last?.innerText?.trim()) {
    return last.innerText.trim();
  }
  return cipherBody.innerText?.trim() || "";
}

function speakCipherText(text) {
  if (!cipherWidget || cipherWidget.classList.contains("hidden")) return;
  if (!text || window.isSpeechMuted) return;
  if (!("speechSynthesis" in window)) {
    addCipherMessage("Speech not supported in this browser.", "bot");
    return;
  }
  if (cipherSpeechUtterance) {
    window.speechSynthesis.cancel();
  }
  cipherSpeechUtterance = new SpeechSynthesisUtterance(text);
  cipherSpeechUtterance.rate = 1;
  window.speechSynthesis.speak(cipherSpeechUtterance);
}

function speakCipherLatest() {
  const steps = getCipherSpeechText();
  if (!steps) return;
  const intro =
    "Hello, my name is Cipher. I am your assistant. To help you with tools in this application, follow my instructions.";
  speakCipherText(`${intro} ${steps}`);
}

// Announce guidance for user actions; speaks unless muted, always logs to chat
function announceCipherStep(message) {
  if (!message) return;
  addCipherMessage(message, "bot");
  speakCipherText(message);
}

function getCipherFollowUp(toolKey) {
  switch (toolKey) {
    case "portscan":
      return "Port scan finished. Review open ports, then consider running a targeted service check.";
    case "ipscan":
      return "IP scan completed. You can pivot to port scanning the active hosts.";
    case "wifi":
      return "Wi-Fi scan done. Save the findings or run a new scan on another channel.";
    case "pcap":
      return "Packet capture saved. Export as PCAP/PCAPNG or start a fresh capture.";
    case "hash":
      return "Hash check completed. Save the verdict or submit another hash.";
    case "url":
      return "URL check done. If risky, block it and notify users; otherwise, move to the next URL.";
    default:
      return "Result recorded. Save it if useful, or pick another tool from the sidebar.";
  }
}

function getCipherDeepSpeechText() {
  if (!cipherDeepBody) return "";
  const messages = cipherDeepBody.querySelectorAll(".cipher-message");
  const last = messages[messages.length - 1];
  if (last?.innerText?.trim()) {
    return last.innerText.trim();
  }
  return cipherDeepBody.innerText?.trim() || "";
}

function speakCipherDeep(text) {
  const content = text || getCipherDeepSpeechText();
  if (!content || window.isSpeechMuted) return;
  if (!("speechSynthesis" in window)) {
    addCipherMessage("Speech not supported in this browser.", "bot");
    return;
  }
  if (cipherDeepSpeechUtterance) {
    window.speechSynthesis.cancel();
  }
  cipherDeepSpeechUtterance = new SpeechSynthesisUtterance(content);
  cipherDeepSpeechUtterance.rate = 1;
  window.speechSynthesis.speak(cipherDeepSpeechUtterance);
}

function stopAllSpeech() {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  cipherSpeechUtterance = null;
  cipherDeepSpeechUtterance = null;
}

function stopAllPanelsSpeech() {
  stopAllSpeech();
  stopAllSpeechForCommand();
  stopAllSpeechForToolKit();
  stopIncidentTriageSpeech();
  stopThreatIntelSpeech();
  stopPhishingAnalyzerSpeech();
  stopComplianceHelperSpeech();
}

let speechControlsBound = false;
function bindGlobalSpeechControls() {
  if (speechControlsBound) return;
  speechControlsBound = true;

  // Global click handler for any mute/stop buttons (covers duplicates in header/footer)
  document.addEventListener("click", (event) => {
    const muteBtn = event.target.closest(".mute-tts-btn");
    if (muteBtn) {
      event.preventDefault();
      setSpeechMuteState(!window.isSpeechMuted);
      return;
    }
    const stopBtn = event.target.closest(".stop-speak-button");
    if (stopBtn) {
      event.preventDefault();
      stopAllPanelsSpeech();
    }
  });

  // Keyboard support for Space/Enter on focused controls
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const active = document.activeElement;
    if (!active) return;
    if (active.classList?.contains("mute-tts-btn")) {
      event.preventDefault();
      setSpeechMuteState(!window.isSpeechMuted);
    } else if (active.classList?.contains("stop-speak-button")) {
      event.preventDefault();
      stopAllPanelsSpeech();
    }
  });
}

function setSpeechMuteState(isMuted) {
  const nextState = Boolean(isMuted);
  const changed = nextState !== window.isSpeechMuted;
  window.isSpeechMuted = nextState;

  if (window.isSpeechMuted) {
    // Halt any active speech across panels and pause synthesis engine
    stopAllPanelsSpeech();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.pause();
    }
  }

  const muteButtons = document.querySelectorAll(".mute-tts-btn");
  muteButtons.forEach((btn) => {
    const unmuteIcon = btn.querySelector(".unmute-icon");
    const muteIcon = btn.querySelector(".mute-icon");
    const labelEl = btn.querySelector(".mute-label");
    btn.classList.toggle("muted", window.isSpeechMuted);
    btn.setAttribute("aria-pressed", window.isSpeechMuted ? "true" : "false");
    btn.setAttribute("aria-label", window.isSpeechMuted ? "Unmute" : "Mute");
    btn.title = window.isSpeechMuted ? "Unmute" : "Mute";
    if (muteIcon) muteIcon.classList.toggle("hidden", window.isSpeechMuted);
    if (unmuteIcon) unmuteIcon.classList.toggle("hidden", !window.isSpeechMuted);
    if (labelEl) labelEl.textContent = window.isSpeechMuted ? "Unmute" : "Mute";
  });

  try {
    localStorage.setItem(SPEECH_MUTE_KEY, window.isSpeechMuted ? "1" : "0");
  } catch {
    // localStorage may be unavailable (private mode); ignore persist errors
  }

  return changed;
}

function advanceCipherStep(message) {
  const steps = cipherGuides[cipherState.tool] || [];
  if (!steps.length) return;
  if (cipherState.stepIndex >= steps.length - 1) {
    addCipherMessage("You are done. Explore other tools on the left.", "bot");
    return;
  }
  cipherState.stepIndex += 1;
  addCipherMessage(message || `Step ${cipherState.stepIndex + 1}: ${steps[cipherState.stepIndex]}`, "bot");
}

function markActionDone(action) {
  cipherState.completed[`${cipherState.tool}:${action}`] = true;
}

function shouldAutoAdvance(action) {
  return !cipherState.completed[`${cipherState.tool}:${action}`];
}

function updateCipherContext(toolName) {
  cipherState.tool = toolName;
  cipherState.stepIndex = 0;
  cipherState.completed = {};
  cipherDeepContext.currentTool = null;
  cipherDeepContext.vendor = null;
  cipherDeepContext.device = null;
  cipherDeepContext.incidentType = null;
  cipherDeepContext.incidentPhase = null;
  cipherDeepContext.intelFocus = null;
  cipherDeepContext.intelDepth = null;
  cipherDeepContext.phishingTopic = null;
  cipherDeepContext.phishingDetail = null;
  if (cipherDeepPanel && !cipherDeepPanel.classList.contains("hidden")) {
    return;
  }
  if (cipherState.opened) {
    renderCipherGuide();
  }
}

function handleCipherInput(text) {
  const cleaned = text.trim().toLowerCase();
  const steps = cipherGuides[cipherState.tool] || cipherGuides.overview;
  if (!steps.length) {
    addCipherMessage("No guide available for this tool yet.", "bot");
    speakCipherText("No guide available for this tool yet.");
    return;
  }
  if (cleaned === "next") {
    if (cipherState.stepIndex >= steps.length - 1) {
      addCipherMessage("End of steps. Explore other tools on the left.", "bot");
      speakCipherText("End of steps. Explore other tools on the left.");
      return;
    }
    cipherState.stepIndex += 1;
    const msg = steps[cipherState.stepIndex];
    addCipherMessage(msg, "bot");
    speakCipherText(msg);
    return;
  }
  if (cleaned === "restart") {
    cipherState.stepIndex = 0;
    const msg = `Restarted. ${steps[0]}`;
    addCipherMessage(msg, "bot");
    speakCipherText(msg);
    return;
  }
  addCipherMessage(`Tip: type "next" for the next step, or "restart".`, "bot");
  speakCipherText(`Tip: click Next for the next step, or Restart to begin again.`);
}

async function fetchBotReply(bot, text, context) {
  const message = (text || "").trim();
  if (!message) return "Ask a question and I will respond.";

  if (bot === "general") return getWebToolsReply(message);
  if (bot === "triage") {
    const reply = getTriageReply(message);
    if (context?.incidentType) {
      return `[${context.incidentType}${context.incidentPhase ? ` - ${context.incidentPhase}` : ""}]\n${reply}`;
    }
    return reply;
  }
  if (bot === "intel") {
    const reply = getIntelReply(message);
    if (context?.intelFocus) {
      return `[${context.intelFocus}${context.intelDepth ? ` - ${context.intelDepth}` : ""}]\n${reply}`;
    }
    return reply;
  }
  if (bot === "phishing") {
    const reply = getPhishingReply(message);
    if (context?.phishingTopic) {
      return `[${context.phishingTopic}${context.phishingDetail ? ` - ${context.phishingDetail}` : ""}]\n${reply}`;
    }
    return reply;
  }
  if (bot === "compliance") {
    const reply = getComplianceReply(message);
    if (context?.complianceFramework) {
      return `[${context.complianceFramework}${context.complianceDetail ? ` - ${context.complianceDetail}` : ""}]\n${reply}`;
    }
    return reply;
  }
  if (bot === "commands") {
    const normalized = applyCorrections(normalizeInput(message));
    const vendor = (context.vendor || "").toString().toLowerCase() || detectVendor(normalized);
    let best = null;
    let bestScore = 0;
    commandLibrary.forEach((entry) => {
      const matches = entry.keywords?.reduce((count, keyword) => {
        return count + (hasKeyword(normalized, [keyword]) ? 1 : 0);
      }, 0);
      if (!matches) return;
      let score = matches * 2;
      if (entry.vendor === vendor) score += 4;
      if (entry.vendor === "any") score += 1;
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    });
    if (!best) {
      return "Sorry, that is outside Command Assist. I can help with IOS basics, routing, VLANs, STP, DHCP, ACLs, NAT, IPv6, security, and management commands.";
    }
    if (vendor && best.vendor !== "any" && best.vendor !== vendor) {
      return `I only have ${best.vendor.toUpperCase()} command blocks for this topic right now. Tell me if you want me to add ${vendor.toUpperCase()} examples.`;
    }
    const vendorDevice = context?.vendor && context?.device ? `[${context.vendor} ${context.device}]\n` : "";
    return vendorDevice + best.response;
  }
  return "Unknown bot.";
}

let promptResolver = null;

function openPrompt(options) {
  if (!promptModal) return Promise.resolve({ confirmed: false, value: "" });
  const {
    title = "Confirm",
    message = "",
    placeholder = "",
    confirmText = "Confirm",
    cancelText = "Cancel",
    requireInput = false,
  } = options;

  promptTitle.textContent = title;
  promptMessage.textContent = message;
  promptInput.placeholder = placeholder;
  promptInput.value = "";
  promptInput.classList.toggle("hidden", !requireInput);
  promptConfirmBtn.textContent = confirmText;
  promptCancelBtn.textContent = cancelText;
  promptModal.classList.remove("hidden");

  return new Promise((resolve) => {
    promptResolver = resolve;
    if (requireInput) {
      promptInput.focus();
    }
  });
}

function closePrompt(result) {
  if (!promptResolver) return;
  promptModal.classList.add("hidden");
  promptResolver(result);
  promptResolver = null;
}

// Expose prompt helper for other modules
window.openPrompt = openPrompt;

function showInfo(message) {
  return openPrompt({
    title: "Info",
    message,
    confirmText: "OK",
    cancelText: "Close",
  });
}

function updateSessionOptions() {
  if (!reportSessionSelect) return;
  reportSessionSelect.innerHTML = "";
  if (!state.sessions.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No sessions available";
    reportSessionSelect.appendChild(option);
  } else {
    state.sessions.forEach((session) => {
      const option = document.createElement("option");
      option.value = session.id;
      option.textContent = `${session.label} (${session.activities.length} events)`;
      reportSessionSelect.appendChild(option);
    });
    if (state.currentSessionId) {
      reportSessionSelect.value = state.currentSessionId;
    }
  }

  if (activeSessionSelect) {
    activeSessionSelect.innerHTML = "";
    if (!state.sessions.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Create session";
      activeSessionSelect.appendChild(option);
      activeSessionSelect.disabled = true;
    } else {
      activeSessionSelect.disabled = false;
      state.sessions.forEach((session) => {
        const option = document.createElement("option");
        option.value = session.id;
        option.textContent = session.label;
        activeSessionSelect.appendChild(option);
      });
      if (state.currentSessionId) {
        activeSessionSelect.value = state.currentSessionId;
      }
    }
  }

    toolSessionSelects.forEach((select) => {
      const toolName = select.dataset.tool;
      const hasSelection = Object.prototype.hasOwnProperty.call(state.toolSessionSelection, toolName);
      const currentValue = hasSelection ? state.toolSessionSelection[toolName] : "";
      select.innerHTML = "";
      const noneOption = document.createElement("option");
      noneOption.value = "";
      noneOption.textContent = "Do not save";
      select.appendChild(noneOption);
      state.sessions.forEach((session) => {
        const option = document.createElement("option");
        option.value = session.id;
        option.textContent = session.label;
        select.appendChild(option);
      });
      select.value = currentValue || "";
    });
  }

function renderSessionList() {
  if (!sessionList) return;
  sessionList.innerHTML = "";
  if (!state.sessions.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No sessions yet.";
    sessionList.appendChild(empty);
    return;
  }
  state.sessions.forEach((session) => {
    const item = document.createElement("div");
    item.className = "session-item";
    item.classList.toggle("active", session.id === state.currentSessionId);
    const created = new Date(session.startedAt).toLocaleString();
    item.innerHTML = `
      <div>
        <strong>${session.label}</strong>
        <span>Created: ${created} • Activities: ${session.activities.length}</span>
      </div>
      <div class="session-actions-inline">
        <label class="session-select">
          <input type="checkbox" data-session-id="${session.id}" class="session-checkbox" />
          Select
        </label>
        <button class="ghost" data-session-action="use" data-session-id="${session.id}">Use</button>
        <button class="ghost" data-session-action="delete" data-session-id="${session.id}">Delete</button>
      </div>
    `;
    sessionList.appendChild(item);
  });
}

function initUserSession() {
  if (!state.sessions.length) {
    state.sessions = loadUserSessions();
  }
  if (!state.sessions.length) {
    const now = new Date();
    const sessionId = `${now.getTime()}`;
    state.currentSessionId = sessionId;
    state.sessions.unshift({
      id: sessionId,
      label: "General session",
      startedAt: now.toISOString(),
      activities: [],
      outputs: {},
    });
    saveUserSessions();
  }
  state.currentSessionId = state.sessions[0]?.id || null;
  rebuildActivityCache();
  renderActivity();
  renderAllActivity();
  updateSessionOptions();
  renderSessionList();
}

function renderNotifications() {
  if (!notifList) return;
  notifList.innerHTML = "";
  const recent = state.notifications.slice(0, 5);
  if (!recent.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No notifications yet.";
    notifList.appendChild(empty);
    return;
  }
  recent.forEach((note) => {
    const item = document.createElement("div");
    item.className = "notif-item";
    const actions =
      note.inviteId && !note.handled
        ? `<div class="chat-buttons">
            <button class="primary" data-invite-action="accept" data-invite-id="${note.inviteId}">Accept</button>
            <button class="ghost" data-invite-action="decline" data-invite-id="${note.inviteId}">Decline</button>
          </div>`
        : "";
    item.innerHTML = `
      <div>
        <strong>${note.message}</strong>
        <span>${note.time}</span>
      </div>
      ${actions}
    `;
    notifList.appendChild(item);
  });
}

function renderAllNotifications() {
  if (!notifModalList) return;
  notifModalList.innerHTML = "";
  if (!state.notifications.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No notifications yet.";
    notifModalList.appendChild(empty);
    return;
  }
  state.notifications.forEach((note) => {
    const item = document.createElement("div");
    item.className = "notif-item";
    item.innerHTML = `
      <strong>${note.message}</strong>
      <span>${note.time}</span>
    `;
    notifModalList.appendChild(item);
  });
}

function updateBadge() {
  if (!notifBadge) return;
  const unread = state.notifications.filter((note) => !note.read).length;
  if (unread > 0) {
    notifBadge.textContent = unread.toString();
    notifBadge.classList.remove("hidden");
  } else {
    notifBadge.classList.add("hidden");
  }
}

function openNotifications(open) {
  if (!notifPanel) return;
  notifPanel.classList.toggle("hidden", !open);
  if (open) {
    state.notifications.forEach((note) => {
      note.read = true;
    });
    updateBadge();
    saveUserNotifications();
  }
}

function addNotification(message, meta = {}) {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  state.notifications.unshift({ message, time, read: false, ...meta });
  state.notifications = state.notifications.slice(0, 10);
  renderNotifications();
  updateBadge();
  saveUserNotifications();
}

function registerRun(message, toolKey) {
  state.metrics.checksRun += 1;
  if (toolKey) {
    state.toolUsage[toolKey] = (state.toolUsage[toolKey] || 0) + 1;
  }
  updateOverview();
  addActivity(message);
  addNotification(message);
  announceCipherStep(`Result: ${message}`);
  const followUp = getCipherFollowUp(toolKey);
  if (followUp) {
    announceCipherStep(followUp);
  }
  saveUserStats();
}

function setActiveTool(toolName) {
  const toolNavEl = document.getElementById("toolNav");
  const toolCards = document.querySelectorAll(".tool-card");
  if (toolNavEl) {
    toolNavEl.querySelectorAll("button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tool === toolName);
    });
  }
  toolCards.forEach((card) => {
    card.classList.toggle("active", card.dataset.tool === toolName);
  });
  updateCipherContext(toolName);
  announceCipherStep(
    `You opened ${toolName}. Run it, review the output, then save or switch tools using the sidebar. Click Next for more guidance.`
  );
  handleWifiAutoScan(toolName);
  if (toolName === "wifi") {
    setTimeout(() => renderWifiCharts(state.toolData.wifiNetworks || []), 0);
  }
}

function applyUserStats() {
  const stats = loadUserStats();
  if (stats) {
    state.metrics = stats.metrics || { checksRun: 0, reports: 0 };
    state.toolUsage = stats.toolUsage || {};
    state.failedLogins = stats.failedLogins || 0;
    state.loginSessions = stats.loginSessions || [];
    state.whoisCountries = stats.whoisCountries || {};
  } else {
    state.metrics = { checksRun: 0, reports: 0 };
    state.toolUsage = {};
    state.failedLogins = 0;
    state.loginSessions = [];
    state.whoisCountries = {};
  }
}

function applyRemoteUserData(data) {
  if (!data) return;
  state.metrics = data.metrics || { checksRun: 0, reports: 0 };
  state.toolUsage = data.toolUsage || {};
  state.failedLogins = data.failedLogins || 0;
  state.loginSessions = data.loginSessions || [];
  state.whoisCountries = data.whoisCountries || {};
  if (Array.isArray(data.sessions)) {
    state.sessions = data.sessions;
  }
  saveUserSessions();
  saveUserStats();
}

function shouldLogSignIn() {
  const pending = sessionStorage.getItem(LOGIN_ACTIVITY_KEY);
  if (!pending) return false;
  sessionStorage.removeItem(LOGIN_ACTIVITY_KEY);
  return true;
}

function finalizeLoginSession() {
  if (!state.authSessionStart) return;
  state.authSessionStart = null;
}

  function applyOfflineState() {
    state.isOffline = loadOfflineState();
    if (connectionStatus) {
      connectionStatus.textContent = state.isOffline ? "Offline" : "Online";
    }
  if (offlineToggleBtn) {
    offlineToggleBtn.textContent = state.isOffline ? "Go online" : "Go offline";
    offlineToggleBtn.classList.toggle("active", state.isOffline);
  }
  const whoisBtn = document.getElementById("whoisBtn");
  const urlCheckBtn = document.getElementById("urlCheckBtn");
    [whoisBtn, urlCheckBtn].forEach((btn) => {
      if (!btn) return;
      btn.disabled = state.isOffline;
      btn.classList.toggle("disabled", state.isOffline);
    });
  }

  function applyStealthState() {
    loadStealthState();
    updateStealthUI();
  }

async function logAuthFailure(email, code) {
  if (!email || isGuestUser()) return;
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    if (!methods.length) return;
    await addDoc(collection(db, "authFailures"), {
      email: email.toLowerCase(),
      code: code || "unknown",
      ts: Timestamp.now(),
    });
  } catch (error) {
    console.warn("Unable to record auth failure:", error);
    const pending = loadAuthFailureCount(email);
    saveAuthFailureCount(email, pending + 1);
  }
}

function shouldCountAuthFailure(code) {
  return (
    code === "auth/wrong-password" ||
    code === "auth/invalid-credential" ||
    code === "auth/invalid-login-credentials" ||
    code === "auth/user-mismatch"
  );
}

async function applyAuthFailures(email) {
  if (!email || isGuestUser()) return;
  const pending = loadAuthFailureCount(email);
  if (pending) {
    state.failedLogins += pending;
    saveAuthFailureCount(email, 0);
  }
  try {
    const q = query(collection(db, "authFailures"), where("email", "==", email.toLowerCase()));
    const snap = await getDocs(q);
    if (snap.empty) return;
    state.failedLogins += snap.size;
    saveUserStats();
    updateOverview();
    await Promise.all(
      snap.docs.map((docItem) => deleteDoc(doc(db, "authFailures", docItem.id)))
    );
  } catch (error) {
    console.warn("Unable to apply auth failure counts:", error);
  }
  saveUserStats();
  updateOverview();
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    state.isGuest = false;
    setCurrentUser(user);
    if (shouldForceInactivityLogout()) {
      pendingLogoutMessage = "Logged out due to inactivity.";
      await signOut(auth);
      return;
    }
    const remote = await loadUserDataFromFirestore();
    if (remote) {
      applyRemoteUserData(remote);
    } else {
      applyUserStats();
    }
    state.toolSessionSelection = {};
    initUserSession();
    state.authSessionStart = Date.now();
    if (shouldLogSignIn()) {
      addLoginEvent(state.authSessionStart);
      addActivity("Signed in");
    }
    state.notifications = loadUserNotifications();
    renderNotifications();
    updateBadge();
    state.reports = loadLocalReports();
    renderReportList();
    updateReportWarning();
    cipherChats.list = loadCipherChats();
    refreshBotChats("general");
    cipherBotButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.bot === "general");
    });
      applyOfflineState();
      applyStealthState();
      await applyAuthFailures(user.email);
    await ensureUserHandle();
    renderChatHandle();
    subscribeToChatInvites();
    await loadExistingChats();
    renderChatInvites();
    renderChatList();
    renderChatMessages();
    setActivityRange(document.querySelector(".panel-tabs .chip.active")?.dataset.range || "24h");
    renderGeoDistribution();
    updateOverview();
    showDashboard();
  } else {
    state.isGuest = false;
    if (state.currentUser) {
      addActivity("Signed out");
      clearLastActivity();
    }
    state.userHandle = null;
    renderChatHandle();
    stopPacketCapture("Capture stopped.", false);
    stopChatListeners();
    state.chat = { invites: [], activeChatId: null, chats: {} };
    renderChatInvites();
    renderChatList();
    renderChatMessages();
    finalizeLoginSession();
    setCurrentUser(null);
    showAuth();
  }
});

function switchTab(tabName) {
  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabName);
  });
  Object.entries(forms).forEach(([name, form]) => {
    form.classList.toggle("active", name === tabName);
  });
  clearLoginMessage();
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => switchTab(tab.dataset.tab));
});

function enterGuestMode() {
  state.isGuest = true;
  const guestUser = { uid: "guest", displayName: "Guest", email: "", isGuest: true };
  setCurrentUser(guestUser);
  state.userHandle = null;
  clearLoginMessage();
  state.sessions = state.sessions || [];
  state.reports = loadLocalReports();
  renderReportList();
  updateReportWarning();
  state.notifications = [];
  renderNotifications();
  updateBadge();
  state.chat = { invites: [], activeChatId: null, chats: {} };
  renderChatInvites();
  renderChatList();
  renderChatMessages();
  renderChatHandle();
  applyOfflineState();
  applyStealthState();
  showDashboard();
  addNotification("Guest mode enabled. Create an account to sync data and use chat features.");
}

if (guestAuthBtn) {
  guestAuthBtn.addEventListener("click", () => {
    enterGuestMode();
  });
}

if (notifBtn) {
  notifBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = !notifPanel.classList.contains("hidden");
    openNotifications(!isOpen);
  });
  document.addEventListener("click", (event) => {
    if (
      !notifPanel.classList.contains("hidden") &&
      !notifPanel.contains(event.target) &&
      !notifBtn.contains(event.target)
    ) {
      openNotifications(false);
    }
  });
}

if (notifList) {
  notifList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-invite-id]");
    if (!button) return;
    const inviteId = button.dataset.inviteId;
    const action = button.dataset.inviteAction;
    if (!inviteId || !action) return;
    state.notifications = state.notifications.map((note) =>
      note.inviteId === inviteId ? { ...note, handled: true } : note
    );
    saveUserNotifications();
    renderNotifications();
    void handleInviteAction(inviteId, action);
  });
}

  if (offlineToggleBtn) {
    offlineToggleBtn.addEventListener("click", () => {
      state.isOffline = !state.isOffline;
      saveOfflineState();
      applyOfflineState();
    });
  }

  if (stealthToggleBtn) {
    stealthToggleBtn.addEventListener("click", async () => {
      state.isStealth = !state.isStealth;
      if (state.isStealth) {
        stealthStatus.textContent = "Stealth on • Resolving IP...";
        state.stealthIp = await fetchExternalIp();
      } else {
        state.stealthIp = "";
      }
      saveStealthState();
      updateStealthUI();
    });
  }

if (resetMostUsedBtn) {
  resetMostUsedBtn.addEventListener("click", () => {
    openPrompt({
      title: "Reset most used",
      message: "Reset the most used tool stats?",
      confirmText: "Reset",
    }).then((result) => {
      if (!result.confirmed) return;
      state.toolUsage = {};
      updateOverview();
      saveUserStats();
    });
  });
}

if (resetChecksBtn) {
  resetChecksBtn.addEventListener("click", () => {
    openPrompt({
      title: "Reset checks",
      message: "Reset checks run counter?",
      confirmText: "Reset",
    }).then((result) => {
      if (!result.confirmed) return;
      state.metrics.checksRun = 0;
      updateOverview();
      saveUserStats();
    });
  });
}

if (resetRiskFlagsBtn) {
  resetRiskFlagsBtn.addEventListener("click", () => {
    openPrompt({
      title: "Reset risk flags",
      message: "Reset failed login counter?",
      confirmText: "Reset",
    }).then((result) => {
      if (!result.confirmed) return;
      state.failedLogins = 0;
      updateOverview();
      saveUserStats();
    });
  });
}

if (resetReportsBtn) {
  resetReportsBtn.addEventListener("click", () => {
    openPrompt({
      title: "Reset reports",
      message: "Reset report counter?",
      confirmText: "Reset",
    }).then((result) => {
      if (!result.confirmed) return;
      state.metrics.reports = 0;
      updateOverview();
      saveUserStats();
    });
  });
}

if (resetGeoBtn) {
  resetGeoBtn.addEventListener("click", () => {
    openPrompt({
      title: "Reset geographic distribution",
      message: "Clear all geographic distribution stats?",
      confirmText: "Reset",
    }).then((result) => {
      if (!result.confirmed) return;
      state.whoisCountries = {};
      saveUserStats();
      renderGeoDistribution();
    });
  });
}

if (profileBtn) {
  profileBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleProfileDropdown();
  });
}

document.addEventListener("click", (event) => {
  if (!profileDropdown || profileDropdown.classList.contains("hidden")) return;
  const clickInsideDropdown = profileDropdown.contains(event.target);
  const clickProfileButton = profileBtn ? profileBtn.contains(event.target) : false;
  if (!clickInsideDropdown && !clickProfileButton) {
    closeProfileDropdown();
  }
});

if (profileSettingsBtn) {
  profileSettingsBtn.addEventListener("click", () => {
    closeProfileDropdown();
    openSettingsModal();
  });
}

if (profileLogoutBtn) {
  profileLogoutBtn.addEventListener("click", async () => {
    if (isGuestUser()) {
      state.isGuest = false;
      setCurrentUser(null);
      closeProfileDropdown();
      showAuth();
      return;
    }
    try {
      pendingLogoutMessage = "";
      await signOut(auth);
    } catch (error) {
      alert(error.message || "Unable to sign out.");
    }
  });
}

if (settingsCloseBtn) {
  settingsCloseBtn.addEventListener("click", () => {
    closeSettingsModal();
  });
}

if (settingsCancelBtn) {
  settingsCancelBtn.addEventListener("click", () => {
    closeSettingsModal();
  });
}

if (settingsModal) {
  settingsModal.addEventListener("click", (event) => {
    if (event.target === settingsModal) {
      closeSettingsModal();
    }
  });
}

async function handleSettingsSave(event) {
  event.preventDefault();
  if (!state.currentUser) {
    alert("Sign in before updating settings.");
    return;
  }
  const fullName = settingsFullName?.value.trim();
  const address = settingsAddress?.value.trim();
  const phone = settingsPhone?.value.trim();
  const password = settingsPassword?.value || "";
  const currentPassword = settingsPasswordCurrent?.value || "";
  const confirmPassword = settingsPasswordConfirm?.value || "";
  saveProfileSettings({ fullName, address, phone, updatedAt: new Date().toISOString() });
  if (fullName && state.currentUser.displayName !== fullName) {
    try {
      await updateProfile(auth.currentUser, { displayName: fullName });
      state.currentUser.displayName = fullName;
    } catch (error) {
      console.error("Unable to update display name", error);
    }
  }
  if (password) {
    if (!currentPassword) {
      alert("Enter your current password to change to a new one.");
      return;
    }
    if (password !== confirmPassword) {
      alert("New password and confirmation do not match.");
      return;
    }
    if (!state.currentUser.email) {
      alert("Unable to confirm your email. Please sign in again.");
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(
        state.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, password);
      alert("Password updated.");
    } catch (error) {
      alert(error.message || "Unable to update password. Try signing in again.");
      return;
    }
  }
  if (settingsPassword) {
    settingsPassword.value = "";
  }
  if (settingsPasswordCurrent) {
    settingsPasswordCurrent.value = "";
  }
  if (settingsPasswordConfirm) {
    settingsPasswordConfirm.value = "";
  }
  const displayName = fullName || state.currentUser.displayName || state.currentUser.email || "user";
  welcome.textContent = `Welcome, ${displayName}`;
  if (chatHandleDisplay) {
    if (state.userHandle?.handle) {
      chatHandleDisplay.textContent = state.userHandle.handle;
    }
  }
  setProfileInitials(displayName);
  closeSettingsModal();
}

if (settingsForm) {
  settingsForm.addEventListener("submit", handleSettingsSave);
}

if (viewAllActivityBtn) {
  viewAllActivityBtn.addEventListener("click", () => {
    renderAllActivity();
    activityModal.classList.remove("hidden");
  });
}

if (activityClearBtn) {
  activityClearBtn.addEventListener("click", () => {
    openPrompt({
      title: "Clear activity",
      message: "Clear all activity logs? This cannot be undone.",
      confirmText: "Clear",
    }).then((result) => {
      if (!result.confirmed) return;
      clearAllActivities();
    });
  });
}

if (activityCloseBtn) {
  activityCloseBtn.addEventListener("click", () => {
    activityModal.classList.add("hidden");
  });
}

if (activityToReportBtn) {
  activityToReportBtn.addEventListener("click", () => {
    activityModal.classList.add("hidden");
    setActiveTool("report");
    if (reportSessionSelect && state.currentSessionId) {
      reportSessionSelect.value = state.currentSessionId;
    }
  });
}

if (notifViewAllBtn) {
  notifViewAllBtn.addEventListener("click", () => {
    renderAllNotifications();
    notifModal.classList.remove("hidden");
  });
}

if (notifClearAllBtn) {
  notifClearAllBtn.addEventListener("click", () => {
    state.notifications = [];
    saveUserNotifications();
    renderNotifications();
    renderAllNotifications();
    updateBadge();
  });
}

if (notifCloseBtn) {
  notifCloseBtn.addEventListener("click", () => {
    notifModal.classList.add("hidden");
  });
}

if (promptCancelBtn) {
  promptCancelBtn.addEventListener("click", () => {
    closePrompt({ confirmed: false, value: "" });
  });
}

if (promptConfirmBtn) {
  promptConfirmBtn.addEventListener("click", () => {
    const requiresInput = !promptInput.classList.contains("hidden");
    const value = promptInput.value.trim();
    if (requiresInput && !value) {
      promptInput.focus();
      return;
    }
    closePrompt({ confirmed: true, value });
  });
}

if (activeSessionCreateBtn) {
  activeSessionCreateBtn.addEventListener("click", async () => {
    const result = await openPrompt({
      title: "New session",
      message: "Enter a session name to start tracking activity.",
      placeholder: "Session name",
      confirmText: "Create",
      requireInput: true,
    });
    if (!result.confirmed) return;
    const now = new Date();
    const sessionId = `${now.getTime()}`;
    state.currentSessionId = sessionId;
    state.sessions.unshift({
      id: sessionId,
      label: result.value,
      startedAt: now.toISOString(),
      activities: [],
      outputs: {},
    });
    state.sessions = state.sessions.slice(0, 20);
    saveUserSessions();
    rebuildActivityCache();
    renderActivity();
    renderAllActivity();
    updateSessionOptions();
    renderSessionList();
  });
}

if (sessionCreateBtn) {
  sessionCreateBtn.addEventListener("click", async () => {
    const result = await openPrompt({
      title: "New session",
      message: "Enter a session name to start tracking activity.",
      placeholder: "Session name",
      confirmText: "Create",
      requireInput: true,
    });
    if (!result.confirmed) return;
    const now = new Date();
    const sessionId = `${now.getTime()}`;
    state.currentSessionId = sessionId;
    state.sessions.unshift({
      id: sessionId,
      label: result.value,
      startedAt: now.toISOString(),
      activities: [],
      outputs: {},
    });
    state.sessions = state.sessions.slice(0, 20);
    saveUserSessions();
    rebuildActivityCache();
    renderActivity();
    renderAllActivity();
    updateSessionOptions();
    renderSessionList();
  });
}

if (cipherAutoBtn) {
  cipherAutoBtn.addEventListener("click", () => {
    setCipherAutoEnabled(!cipherAutoEnabled);
  });
}

if (cipherToggle) {
  cipherToggle.addEventListener("click", () => {
    cipherWidget.classList.toggle("hidden");
    if (!cipherWidget.classList.contains("hidden")) {
      cipherState.opened = true;
      renderCipherGuide();
    }
  });
}

if (cipherTopBtn) {
  cipherTopBtn.addEventListener("click", () => {
    cipherDeepPanel.classList.remove("hidden");
    ensureActiveChat();
    updateCipherDeepTitle();
    renderCipherChatList();
    renderActiveCipherChat();
  });
}

if (cipherCloseBtn) {
  cipherCloseBtn.addEventListener("click", () => {
    cipherWidget.classList.add("hidden");
    if (cipherSpeechUtterance && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  });
}


if (cipherAiBtn) {
  cipherAiBtn.addEventListener("click", () => {
    cipherDeepPanel.classList.remove("hidden");
    
    // Initialize toolkit by default if no specific bot is selected
    if (cipherChats.bot === "toolkit") {
      initToolKit();
      renderToolKit(cipherDeepBody);
    } else if (cipherChats.bot === "commands") {
      initCommandAssist();
      renderCommandAssist(cipherDeepBody);
    } else {
      ensureActiveChat();
      updateCipherDeepTitle();
      renderCipherChatList();
      renderActiveCipherChat();
    }
  });
}

if (cipherDeepCloseBtn) {
  cipherDeepCloseBtn.addEventListener("click", () => {
    cipherDeepPanel.classList.add("hidden");
    stopAllPanelsSpeech();
  });
}

// Clear button handler for Deep Chat tools
const cipherDeepClearBtn = document.getElementById("cipherDeepClearBtn");
if (cipherDeepClearBtn) {
  cipherDeepClearBtn.addEventListener("click", () => {
    // Determine which tool is currently active by checking which bot button has the active class
    const activeBot = document.querySelector(".cipher-bots button.active");
    const botType = activeBot?.dataset.bot;

    // Route to appropriate clear function based on current tool
    if (botType === "toolkit") {
      clearToolKit();
    } else if (botType === "commands") {
      clearCommandAssist();
    } else if (botType === "triage") {
      clearIncidentTriage();
    } else if (botType === "intel") {
      clearThreatIntel();
    } else if (botType === "phishing") {
      clearPhishingAnalyzer();
    } else if (botType === "compliance") {
      clearComplianceHelper();
    }
  });
}

if (cipherNewChatBtn) {
  cipherNewChatBtn.addEventListener("click", () => {
    const id = `chat-${Date.now()}`;
    const index = getNextChatIndex();
    cipherChats.list.unshift({
      id,
      title: `Unnamed chat ${index}`,
      messages: [],
      updatedAt: Date.now(),
    });
    cipherChats.activeId = id;
    saveCipherChats();
    renderCipherChatList();
    renderActiveCipherChat();
  });
}

if (cipherChatList) {
  cipherChatList.addEventListener("click", (event) => {
    const menuBtn = event.target.closest("button[data-chat-menu]");
    if (menuBtn) {
      const chatId = menuBtn.dataset.chatMenu;
      const dropdown = cipherChatList.querySelector(
        `.cipher-chat-dropdown[data-chat-dropdown=\"${chatId}\"]`
      );
      if (dropdown) {
        dropdown.classList.toggle("hidden");
      }
      return;
    }

    const actionBtn = event.target.closest("button[data-chat-action]");
    if (actionBtn) {
      const chatId = actionBtn.dataset.chatId;
      const action = actionBtn.dataset.chatAction;
      if (action === "rename") {
        openPrompt({
          title: "Rename chat",
          message: "Enter a new name for this chat.",
          placeholder: "Chat name",
          confirmText: "Rename",
          requireInput: true,
        }).then((result) => {
          if (!result.confirmed) return;
          const chat = cipherChats.list.find((c) => c.id === chatId);
          if (!chat) return;
          chat.title = result.value;
          chat.updatedAt = Date.now();
          saveCipherChats();
          renderCipherChatList();
        });
        return;
      }
      if (action === "delete") {
        openPrompt({
          title: "Delete chat",
          message: "Delete this chat?",
          confirmText: "Delete",
        }).then((result) => {
          if (!result.confirmed) return;
          cipherChats.list = cipherChats.list.filter((c) => c.id !== chatId);
          if (cipherChats.activeId === chatId) {
            cipherChats.activeId = cipherChats.list[0]?.id || null;
          }
          saveCipherChats();
          ensureActiveChat();
          renderCipherChatList();
          renderActiveCipherChat();
        });
        return;
      }
    }

    const title = event.target.closest(".cipher-chat-title");
    if (title) {
      cipherChats.activeId = title.dataset.chatId;
      renderCipherChatList();
      renderActiveCipherChat();
    }
  });
}

if (cipherBotButtons.length) {
  cipherBotButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Stop any ongoing speech when switching bots
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      const bot = button.dataset.bot;
      cipherBotButtons.forEach((btn) => {
        btn.classList.toggle("active", btn === button);
      });

      // Route to appropriate tool panel
      if (bot === "toolkit") {
        initToolKit();
        renderToolKit(cipherDeepBody);
      } else if (bot === "commands") {
        initCommandAssist();
        renderCommandAssist(cipherDeepBody);
      } else if (bot === "triage") {
        initIncidentTriage();
        renderIncidentTriage(cipherDeepBody);
      } else if (bot === "intel") {
        initThreatIntel();
        renderThreatIntel(cipherDeepBody);
      } else if (bot === "phishing") {
        initPhishingAnalyzer();
        renderPhishingAnalyzer(cipherDeepBody);
      } else if (bot === "compliance") {
        initComplianceHelper();
        renderComplianceHelper(cipherDeepBody);
      } else {
        // Handle traditional chat bots
        refreshBotChats(bot);
      }
    });
  });
}

if (cipherDeepBody) {
  cipherDeepBody.addEventListener("click", (event) => {
    const button = event.target.closest(".cipher-copy");
    if (!button) return;
    const text = button.dataset.copy || "";
    navigator.clipboard
      .writeText(text)
      .then(() => {
        const original = button.textContent;
        button.textContent = "Copied";
        setTimeout(() => {
          button.textContent = original;
        }, 1200);
      })
      .catch(() => {
        button.textContent = "Failed";
        setTimeout(() => {
          button.textContent = "Copy";
        }, 1200);
    });
  });
}

if (cipherDeepBody) {
  cipherDeepBody.addEventListener("click", (event) => {
    const button = event.target.closest(".cipher-copy");
    if (!button) return;
    const text = button.dataset.copy || "";
    navigator.clipboard
      .writeText(text)
      .then(() => {
        const original = button.textContent;
        button.textContent = "Copied";
        setTimeout(() => {
          button.textContent = original;
        }, 1200);
      })
      .catch(() => {
        button.textContent = "Failed";
        setTimeout(() => {
          button.textContent = "Copy";
        }, 1200);
      });
  });
}

if (cipherNextBtn) {
  cipherNextBtn.addEventListener("click", () => {
    handleCipherInput("next");
  });
}

if (cipherRestartBtn) {
  cipherRestartBtn.addEventListener("click", () => {
    cipherState.tool = "overview";
    cipherState.stepIndex = 0;
    renderCipherGuide();
  });
}

if (cipherSpeakBtn) {
  cipherSpeakBtn.addEventListener("click", () => {
    speakCipherLatest();
  });
}

// Stop speaking is handled by the deep chat stop button and panel footers

forms.signup.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(event.target);
  const user = {
    name: data.get("name").toString().trim(),
    email: data.get("email").toString().trim().toLowerCase(),
    password: data.get("password").toString(),
  };
  if (!user.email || !user.password) {
    alert("Email and password required");
    return;
  }
  try {
    const result = await createUserWithEmailAndPassword(auth, user.email, user.password);
    if (user.name) {
      await updateProfile(result.user, { displayName: user.name });
    }
    sessionStorage.setItem(LOGIN_ACTIVITY_KEY, "1");
  } catch (error) {
    alert(error.message || "Unable to create account.");
  }
});

forms.login.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(event.target);
  const email = data.get("email").toString().trim().toLowerCase();
  const password = data.get("password").toString();
  clearLoginMessage();
  try {
    await signInWithEmailAndPassword(auth, email, password);
    sessionStorage.setItem(LOGIN_ACTIVITY_KEY, "1");
  } catch (error) {
    console.error("Login failed:", error);
    if (shouldCountAuthFailure(error?.code)) {
      const pending = loadAuthFailureCount(email);
      saveAuthFailureCount(email, pending + 1);
      await logAuthFailure(email, error?.code);
    }
    const message =
      error?.code === "auth/too-many-requests"
        ? "Too many attempts. Please wait before trying again."
        : error?.code === "auth/network-request-failed"
          ? "Network issue reaching Firebase. Check your connection and try again."
          : "Invalid email or password. Please try again.";
    const detail = error?.code ? ` (${error.code})` : "";
    setLoginMessage(`${message}${detail}`);
  }
});

forms.login.addEventListener("input", () => {
  clearLoginMessage();
});

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    if (isGuestUser()) {
      state.isGuest = false;
      setCurrentUser(null);
      showAuth();
      return;
    }
    try {
      pendingLogoutMessage = "";
      await signOut(auth);
    } catch (error) {
      alert(error.message || "Unable to sign out.");
    }
  });
}

function setMobileNavState(open) {
  const toolNavEl = document.getElementById("toolNav");
  const navBackdropEl = document.getElementById("navBackdrop");
  const mobileNavToggleEl = document.getElementById("mobileNavToggle");
  if (!toolNavEl) return;
  const shouldOpen = Boolean(open);
  toolNavEl.classList.toggle("open", shouldOpen);
  body.classList.toggle("nav-open", shouldOpen);
  if (navBackdropEl) {
    navBackdropEl.classList.toggle("hidden", !shouldOpen);
    navBackdropEl.classList.toggle("visible", shouldOpen);
  }
  if (mobileNavToggleEl) {
    mobileNavToggleEl.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
  }
}

setMobileNavState(false);

const toolNavEl = document.getElementById("toolNav");
const mobileNavToggleEl = document.getElementById("mobileNavToggle");
const navBackdropEl = document.getElementById("navBackdrop");
const globalSearch = document.getElementById("globalSearch");
const globalSearchResults = document.getElementById("globalSearchResults");

if (mobileNavToggleEl) {
  mobileNavToggleEl.addEventListener("click", () => {
    const isOpen = toolNavEl?.classList.contains("open");
    setMobileNavState(!isOpen);
  });
}

if (navBackdropEl) {
  navBackdropEl.addEventListener("click", () => setMobileNavState(false));
}

if (toolNavEl) {
  toolNavEl.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const tool = button.dataset.tool;
    setActiveTool(tool);
    setMobileNavState(false);
    if (cipherState.opened) {
      addCipherMessage(`Selected ${tool}.`, "bot");
    }
  });
}

if (globalSearch) {
  globalSearch.addEventListener("input", (event) => renderGlobalSearch(event.target.value));
  globalSearch.addEventListener("focus", () => renderGlobalSearch(globalSearch.value));
  globalSearch.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const first = globalSearchResults?.querySelector(".search-result");
      if (first) {
        event.preventDefault();
        first.click();
      }
    }
  });
}

document.addEventListener("click", (event) => {
  if (!globalSearchResults || !globalSearch) return;
  if (
    globalSearch.contains(event.target) ||
    globalSearchResults.contains(event.target)
  ) {
    return;
  }
  globalSearchResults.classList.add("hidden");
});

const rangeButtons = document.querySelectorAll(".panel-tabs [data-range]");

function getLoginSessionsWithCurrent() {
  return state.loginSessions.slice();
}

function addLoginEvent(when) {
  state.loginSessions.push({ start: when, end: when, durationMs: 0 });
  state.loginSessions = state.loginSessions.slice(-200);
  saveUserStats();
}

function buildBars(counts) {
  if (!activityBars || !activityEmpty) return;
  activityBars.innerHTML = "";
  const max = Math.max(...counts, 0);
  if (max === 0) {
    activityEmpty.classList.remove("hidden");
    return;
  }
  activityEmpty.classList.add("hidden");
  counts.forEach((value) => {
    const bar = document.createElement("div");
    const height = Math.max(6, (value / max) * 100);
    bar.className = `chart-bar${value > 0 ? " active" : ""}`;
    bar.style.height = `${height}%`;
    const label = document.createElement("span");
    label.className = `chart-label${value > 0 ? "" : " muted"}`;
    label.textContent = `${value}`;
    bar.appendChild(label);
    activityBars.appendChild(bar);
  });
}

function renderGeoDistribution() {
  if (!geoList) return;
  geoList.innerHTML = "";
  const entries = Object.entries(state.whoisCountries || {});
  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No lookups yet.";
    geoList.appendChild(empty);
    return;
  }
  entries.sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map((entry) => entry[1]));
  entries.slice(0, 6).forEach(([country, count]) => {
    const row = document.createElement("div");
    row.className = "geo-row";
    const width = max ? Math.round((count / max) * 100) : 0;
    row.innerHTML = `
      <span>${country}</span>
      <div class="bar"><span style="width: ${width}%"></span></div>
      <span>${count}</span>
    `;
    geoList.appendChild(row);
  });
}

function setActivityRange(range) {
  if (!activityBars || !activityEmpty) return;
  const sessions = getLoginSessionsWithCurrent();
  const now = new Date();
  const normalizeStart = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value?.toDate === "function") return value.toDate();
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };
  if (range === "24h") {
    const counts = Array.from({ length: 24 }, () => 0);
    const windowStart = new Date(now);
    windowStart.setMinutes(0, 0, 0);
    windowStart.setHours(windowStart.getHours() - 23);
    sessions.forEach((session) => {
      const start = normalizeStart(session.start);
      if (!start) return;
      if (start < windowStart || start > now) return;
      const bucketStart = new Date(start);
      bucketStart.setMinutes(0, 0, 0);
      const index = Math.floor((bucketStart - windowStart) / (60 * 60 * 1000));
      if (index >= 0 && index < 24) {
        counts[index] += 1;
      }
    });
    buildBars(counts);
    return;
  }
  const days = range === "7d" ? 7 : 30;
    const counts = Array.from({ length: days }, () => 0);
    const windowStart = new Date(now);
    windowStart.setHours(0, 0, 0, 0);
    windowStart.setDate(now.getDate() - (days - 1));
    sessions.forEach((session) => {
      const start = normalizeStart(session.start);
      if (!start) return;
      if (start < windowStart || start > now) return;
      const dayStart = new Date(start);
      dayStart.setHours(0, 0, 0, 0);
      const index = Math.floor((dayStart - windowStart) / (24 * 60 * 60 * 1000));
    if (index >= 0 && index < days) {
      counts[index] += 1;
    }
  });
  buildBars(counts);
}

rangeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    rangeButtons.forEach((btn) => {
      btn.classList.toggle("active", btn === button);
    });
    setActivityRange(button.dataset.range);
  });
});

setActivityRange("24h");

if (resetActivityGraphBtn) {
  resetActivityGraphBtn.addEventListener("click", () => {
    openPrompt({
      title: "Reset activity graph",
      message: "Clear all login activity graph data?",
      confirmText: "Reset",
    }).then((result) => {
      if (!result.confirmed) return;
      state.loginSessions = [];
      saveUserStats();
      setActivityRange(document.querySelector(".panel-tabs .chip.active")?.dataset.range || "24h");
    });
  });
}

toolSessionSelects.forEach((select) => {
  select.addEventListener("change", () => {
    state.toolSessionSelection[select.dataset.tool] = select.value || "";
  });
});

function applyActiveSessionToTools(sessionId) {
  toolSessionSelects.forEach((select) => {
    const toolName = select.dataset.tool;
    if (!toolName) return;
    state.toolSessionSelection[toolName] = sessionId || "";
    select.value = sessionId || "";
  });
}

if (activeSessionSelect) {
  activeSessionSelect.addEventListener("change", () => {
    state.currentSessionId = activeSessionSelect.value || null;
    updateSessionOptions();
    renderSessionList();
    applyActiveSessionToTools(state.currentSessionId);
    setActivityRange(document.querySelector(".panel-tabs .chip.active")?.dataset.range || "24h");
  });
}

const passwordInput = document.getElementById("passwordInput");
const passwordBar = document.getElementById("passwordBar");
const passwordHints = document.getElementById("passwordHints");
let lastPasswordRunAt = 0;

const passwordRules = [
  { test: (v) => v.length >= 12, text: "At least 12 characters" },
  { test: (v) => /[A-Z]/.test(v), text: "Include uppercase letters" },
  { test: (v) => /[a-z]/.test(v), text: "Include lowercase letters" },
  { test: (v) => /\d/.test(v), text: "Include numbers" },
  { test: (v) => /[^A-Za-z0-9]/.test(v), text: "Include symbols" },
];

passwordInput.addEventListener("input", (event) => {
  const value = event.target.value;
  let score = 0;
  passwordHints.innerHTML = "";
  passwordRules.forEach((rule) => {
    const li = document.createElement("li");
    li.textContent = rule.text;
    if (rule.test(value)) {
      score += 1;
      li.style.color = "#0f5b51";
    }
    passwordHints.appendChild(li);
  });
  const percent = Math.min(100, (score / passwordRules.length) * 100);
  passwordBar.style.width = `${percent}%`;
  state.toolData.password = passwordHints.textContent || "Not run";
  state.toolData.passwordRisk = value.length > 0 && score < 3;
  saveToolOutput("password", state.toolData.password);
  updateOverview();
  if (cipherState.tool === "password" && shouldAutoAdvance("typed")) {
    markActionDone("typed");
    advanceCipherStep("Nice. Next, check the strength hints and meter.");
  }
});

passwordInput.addEventListener("blur", () => {
  if (!passwordInput.value.trim()) return;
  if (Date.now() - lastPasswordRunAt < 900) return;
  const message = state.toolData.passwordRisk
    ? "Password strength check: weak password detected"
    : "Password strength check completed";
  registerRun(message, "password");
  if (cipherState.tool === "password" && shouldAutoAdvance("blur")) {
    markActionDone("blur");
    advanceCipherStep("If needed, save this output to a session.");
  }
});

passwordInput.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  if (!passwordInput.value.trim()) return;
  event.preventDefault();
  lastPasswordRunAt = Date.now();
  const message = state.toolData.passwordRisk
    ? "Password strength check: weak password detected"
    : "Password strength check completed";
  registerRun(message, "password");
  if (cipherState.tool === "password" && shouldAutoAdvance("enter")) {
    markActionDone("enter");
    advanceCipherStep("Review the strength hints and meter.");
  }
});

function ipToInt(ip) {
  const parts = ip.split(".").map((p) => Number(p));
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
    return null;
  }
  return parts.reduce((acc, part) => (acc << 8) + part, 0) >>> 0;
}

function intToIp(int) {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255,
  ].join(".");
}

const subnetCalcBtn = document.getElementById("subnetCalcBtn");
const subnetResult = document.getElementById("subnetResult");
const wifiScanBtn = document.getElementById("wifiScanBtn");
const wifiScanStopBtn = document.getElementById("wifiScanStopBtn");
const wifiReportBtn = document.getElementById("wifiReportBtn");
const wifiResult = document.getElementById("wifiResult");
const wifiStatus = document.getElementById("wifiStatus");
const wifiCanvas24 = document.getElementById("wifiCanvas24");
const wifiCanvas5 = document.getElementById("wifiCanvas5");
const ipScanBtn = document.getElementById("ipScanBtn");
const ipScanStopBtn = document.getElementById("ipScanStopBtn");
const ipScanSubnet = document.getElementById("ipScanSubnet");
const ipScanDeep = document.getElementById("ipScanDeep");
const ipScanStatus = document.getElementById("ipScanStatus");
const ipScanResult = document.getElementById("ipScanResult");
const ipScanProgress = document.getElementById("ipScanProgress");
const speedTestBtn = document.getElementById("speedTestBtn");
const speedTestStopBtn = document.getElementById("speedTestStopBtn");
const speedStatus = document.getElementById("speedStatus");
const speedDownloadValue = document.getElementById("speedDownloadValue");
const speedUploadValue = document.getElementById("speedUploadValue");
const speedLatencyValue = document.getElementById("speedLatencyValue");
const speedArc = document.getElementById("speedArc");
const speedDot = document.getElementById("speedDot");
const speedGaugeLabel = document.getElementById("speedGaugeLabel");
const speedGaugeValue = document.getElementById("speedGaugeValue");
const portScanBtn = document.getElementById("portScanBtn");
const portScanStopBtn = document.getElementById("portScanStopBtn");
const portScanTarget = document.getElementById("portScanTarget");
const portScanPorts = document.getElementById("portScanPorts");
const portScanTimeout = document.getElementById("portScanTimeout");
const portScanStatus = document.getElementById("portScanStatus");
const portScanResult = document.getElementById("portScanResult");
const portScanProgress = document.getElementById("portScanProgress");
const cryptoModeToggle = document.getElementById("cryptoModeToggle");
const cryptoMethod = document.getElementById("cryptoMethod");
const cryptoKey = document.getElementById("cryptoKey");
const cryptoInput = document.getElementById("cryptoInput");
const cryptoOutput = document.getElementById("cryptoOutput");
const cryptoActionBtn = document.getElementById("cryptoActionBtn");
const cryptoCopyBtn = document.getElementById("cryptoCopyBtn");
const cryptoGenerateKeyBtn = document.getElementById("cryptoGenerateKeyBtn");
const cryptoCopyKeyBtn = document.getElementById("cryptoCopyKeyBtn");
const proxyUrl = document.getElementById("proxyUrl");
const proxyMethod = document.getElementById("proxyMethod");
const proxyHeaders = document.getElementById("proxyHeaders");
const proxyBody = document.getElementById("proxyBody");
const proxySendBtn = document.getElementById("proxySendBtn");
const proxyClearBtn = document.getElementById("proxyClearBtn");
const proxyStatus = document.getElementById("proxyStatus");
const proxyOutput = document.getElementById("proxyOutput");
const honeyProfile = document.getElementById("honeyProfile");
const honeyPort = document.getElementById("honeyPort");
const honeyStartBtn = document.getElementById("honeyStartBtn");
const honeyStopBtn = document.getElementById("honeyStopBtn");
const honeySimulateBtn = document.getElementById("honeySimulateBtn");
const honeyClearBtn = document.getElementById("honeyClearBtn");
const honeyStatus = document.getElementById("honeyStatus");
const honeyOutput = document.getElementById("honeyOutput");
let honeyUnlistenEvent = null;
let honeyUnlistenStatus = null;
let honeyUnlistenError = null;
let honeyActive = false;
const siemInput = document.getElementById("siemInput");
const siemAnalyzeBtn = document.getElementById("siemAnalyzeBtn");
const siemClearBtn = document.getElementById("siemClearBtn");
const siemStatus = document.getElementById("siemStatus");
const siemOutput = document.getElementById("siemOutput");
const siemSevChart = document.getElementById("siemSevChart");
const siemSourceChart = document.getElementById("siemSourceChart");
const siemTimeChart = document.getElementById("siemTimeChart");
const chatHandleDisplay = document.getElementById("chatHandleDisplay");
const chatInviteEmail = document.getElementById("chatInviteEmail");
const chatInviteBtn = document.getElementById("chatInviteBtn");
const chatInviteList = document.getElementById("chatInviteList");
const chatActiveSelect = document.getElementById("chatActiveSelect");
const chatMessageList = document.getElementById("chatMessageList");
const chatMessageInput = document.getElementById("chatMessageInput");
const chatMessageSendBtn = document.getElementById("chatMessageSendBtn");
const chatStatus = document.getElementById("chatStatus");
const terminalBtn = document.getElementById("terminalBtn");
const terminalModal = document.getElementById("terminalModal");
const terminalCloseBtn = document.getElementById("terminalCloseBtn");
const terminalInput = document.getElementById("terminalInput");
const terminalRunBtn = document.getElementById("terminalRunBtn");
const terminalClearBtn = document.getElementById("terminalClearBtn");
const terminalOutput = document.getElementById("terminalOutput");
let terminalBusy = false;
const stegModeToggle = document.getElementById("stegModeToggle");
const stegEncodeFile = document.getElementById("stegEncodeFile");
const stegDecodeFile = document.getElementById("stegDecodeFile");
const stegMessage = document.getElementById("stegMessage");
const stegCryptoMethod = document.getElementById("stegCryptoMethod");
const stegCryptoKey = document.getElementById("stegCryptoKey");
const stegCopyKeyBtn = document.getElementById("stegCopyKeyBtn");
const stegGenerateKeyBtn = document.getElementById("stegGenerateKeyBtn");
const stegRunBtn = document.getElementById("stegRunBtn");
const stegCopyBtn = document.getElementById("stegCopyBtn");
const stegDownloadBtn = document.getElementById("stegDownloadBtn");
const stegOutputImage = document.getElementById("stegOutputImage");
const stegOutputText = document.getElementById("stegOutputText");
const stegStatus = document.getElementById("stegStatus");
const stegEncodeInputWrap = document.getElementById("stegEncodeInputWrap");
const stegDecodeInputWrap = document.getElementById("stegDecodeInputWrap");
const stegMessageWrap = document.getElementById("stegMessageWrap");
const cryptoGenerateKeyBtnEl = document.getElementById("cryptoGenerateKeyBtn");
const stegGenerateKeyBtnEl = document.getElementById("stegGenerateKeyBtn");
let ipScanActive = false;
let ipScanDevices = new Map();
let speedTestActive = false;
let speedAbortController = null;
let portScanActive = false;
let portScanPortsOpen = new Map();
let portScanLastTarget = "";

function initAppDomBindings() {
  pcapStartBtn = document.getElementById("pcapStartBtn");
  pcapStopBtn = document.getElementById("pcapStopBtn");
  pcapClearBtn = document.getElementById("pcapClearBtn");
  pcapStatus = document.getElementById("pcapStatus");
  pcapFeed = document.getElementById("pcapFeed");
  pcapStats = document.getElementById("pcapStats");
  pcapInterface = document.getElementById("pcapInterface");
  pcapInterfaceSelect = document.getElementById("pcapInterfaceSelect");
  pcapInterfaceList = document.getElementById("pcapInterfaceList");
  pcapInterfacesList = document.getElementById("pcapInterfacesList");
  pcapFilterInput = document.getElementById("pcapFilterInput");
  pcapProtocolFilters = document.querySelectorAll(".pcap-filter");
  pcapSaveBtn = document.getElementById("pcapSaveBtn");
  pcapExportBtn = document.getElementById("pcapExportBtn");
  pcapExportFormat = document.getElementById("pcapExportFormat");
  pcapViewSavedBtn = document.getElementById("pcapViewSavedBtn");
  pcapInfoBtn = document.getElementById("pcapInfoBtn");
  pcapInfoPanel = document.getElementById("pcapInfoPanel");
  pcapSavedModal = document.getElementById("pcapSavedModal");
  pcapSavedList = document.getElementById("pcapSavedList");
  pcapSavedCloseBtn = document.getElementById("pcapSavedCloseBtn");
  pcapSavedDeleteBtn = document.getElementById("pcapSavedDeleteBtn");
  pcapSavedCheckAllBtn = document.getElementById("pcapSavedCheckAllBtn");
  pcapSavedUncheckAllBtn = document.getElementById("pcapSavedUncheckAllBtn");
  pcapRefreshBtn = document.getElementById("pcapRefreshBtn");
  if (pcapStatus) {
    if (hasNativePcap) {
      pcapStatus.textContent = "Native capture ready. Pick an interface and click Start.";
    } else {
      pcapStatus.textContent = "Ready to capture. Simulated traffic (native capture unavailable).";
    }
  }
  if (hasNativePcap) {
    if (pcapInterfaceSelect) {
      pcapInterfaceSelect.style.display = "block";
    }
    if (pcapInterface) {
      pcapInterface.style.display = "block";
    }
    loadPcapInterfaces();
    // Pre-register capture listeners so packets immediately render
    ensurePcapListeners();
  }
  if (pcapInterfaceSelect) {
    pcapInterfaceSelect.addEventListener("change", () => {
      pcapSelectedInterface = pcapInterfaceSelect.value || "auto";
      if (pcapStatus) {
      pcapStatus.textContent = `Selected interface: ${getPcapInterfaceLabel(pcapSelectedInterface)}`;
      }
    });
  }
  if (pcapRefreshBtn) {
    pcapRefreshBtn.addEventListener("click", () => {
      loadPcapInterfaces({ quiet: false, force: true });
    });
  }
  if (pcapStartBtn) {
    pcapStartBtn.addEventListener("click", startPacketCapture);
  }
  if (pcapStopBtn) {
    pcapStopBtn.addEventListener("click", () => {
      stopPacketCapture("Capture stopped.");
    });
  }
  if (pcapClearBtn) {
    pcapClearBtn.addEventListener("click", () => {
      stopPacketCapture("", false);
      clearPacketCapture();
    });
  }
  if (pcapSaveBtn) {
    pcapSaveBtn.addEventListener("click", saveCurrentCapture);
  }
  if (pcapExportBtn) {
    pcapExportBtn.addEventListener("click", () => {
      const fmt = pcapExportFormat?.value || "pcapng";
      exportCurrentCapture(fmt);
    });
  }
  if (pcapViewSavedBtn) {
    pcapViewSavedBtn.addEventListener("click", openPcapSavedModal);
  }
  if (pcapSavedCloseBtn) {
    pcapSavedCloseBtn.addEventListener("click", closePcapSavedModal);
  }
  if (pcapSavedDeleteBtn) {
    pcapSavedDeleteBtn.addEventListener("click", deleteSelectedSavedPcaps);
  }
  if (pcapSavedCheckAllBtn) {
    pcapSavedCheckAllBtn.addEventListener("click", () => toggleAllSavedPcaps(true));
  }
  if (pcapSavedUncheckAllBtn) {
    pcapSavedUncheckAllBtn.addEventListener("click", () => toggleAllSavedPcaps(false));
  }
  if (pcapInfoBtn && pcapInfoPanel) {
    const toggleInfoPanel = () => {
      const hidden = pcapInfoPanel.hasAttribute("hidden");
      if (hidden) {
        pcapInfoPanel.removeAttribute("hidden");
        pcapInfoBtn.setAttribute("aria-expanded", "true");
        if (pcapStatus) pcapStatus.textContent = "Npcap install steps shown below.";
      } else {
        pcapInfoPanel.setAttribute("hidden", "hidden");
        pcapInfoBtn.setAttribute("aria-expanded", "false");
      }
    };
    pcapInfoBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleInfoPanel();
    });
    pcapInfoBtn.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleInfoPanel();
      }
    });
  }
  (pcapProtocolFilters || []).forEach((box) => {
    box.addEventListener("change", () => {
      if (!pcapActive) {
        renderPcapStats();
      }
    });
  });
  if (pcapFilterInput) {
    pcapFilterInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        startPacketCapture();
      }
    });
  }
  setActiveTool("overview");
  renderNotifications();
  renderActivity();
  updateOverview();
  renderPcapFeed();
  renderPcapStats();
  setPcapActive(false);
  renderChatInvites();
  renderChatList();
  renderChatMessages();
  setChatStatus("Ready.");

  // Initialize mute and stop TTS controls for deep chat
  const muteButtons = document.querySelectorAll(".mute-tts-btn");
  if (muteButtons.length) {
    setSpeechMuteState(window.isSpeechMuted);
    muteButtons.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        setSpeechMuteState(!window.isSpeechMuted);
      });
    });
  }
  const stopSpeechBtn = document.getElementById("stopSpeechBtn");
  if (stopSpeechBtn) {
    stopSpeechBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      stopAllPanelsSpeech();
    });
  }

  bindGlobalSpeechControls();
}

// Bind immediately if DOM is already parsed, otherwise after load
if (document.readyState === "complete" || document.readyState === "interactive") {
  initAppDomBindings();
} else {
  window.addEventListener("DOMContentLoaded", initAppDomBindings);
}

const cryptoState = {
  mode: "encrypt",
};
const stegState = {
  mode: "encrypt",
};

function ensureCryptoSupport() {
  const supported = Boolean(globalThis.crypto?.subtle);
  if (!supported && cryptoOutput) {
    cryptoOutput.value = "Web Crypto not available. Use the desktop app or HTTPS.";
  }
  if (cryptoActionBtn) {
    cryptoActionBtn.title = supported
      ? ""
      : "Requires secure context (HTTPS) or desktop app for encryption.";
  }
  return supported;
}

function generateSecretKey(methodKey = "aes-gcm") {
  const lengths = {
    "aes-gcm": 32,
    "aes-cbc": 32,
    "aes-ctr": 32,
    des: 8,
    "3des": 24,
  };
  const size = lengths[methodKey] || 32;
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  return toBase64(bytes);
}

ensureCryptoSupport();

const SEARCH_ENTRIES = [
  { label: "Dashboard overview", type: "Tool", keywords: "overview dashboard home", action: () => setActiveTool("overview") },
  { label: "Session manager", type: "Tool", keywords: "sessions history", action: () => setActiveTool("sessions") },
  { label: "Password checker", type: "Tool", keywords: "password strength", action: () => setActiveTool("password") },
  { label: "IP subnet calculator", type: "Tool", keywords: "network cidr subnet", action: () => setActiveTool("subnet") },
  { label: "Wi-Fi scanner", type: "Tool", keywords: "wifi wireless scan", action: () => setActiveTool("wifi") },
  { label: "IP scanner", type: "Tool", keywords: "network discovery hosts", action: () => setActiveTool("ipscan") },
  { label: "Speed test", type: "Tool", keywords: "bandwidth throughput speed", action: () => setActiveTool("speed") },
  { label: "Port scanner", type: "Tool", keywords: "nmap ports open", action: () => setActiveTool("portscan") },
  { label: "Packet capture", type: "Tool", keywords: "pcap packets wireshark capture", action: () => setActiveTool("pcap") },
  { label: "Neon Link chat", type: "Tool", keywords: "chat messaging invites realtime", action: () => setActiveTool("chat") },
  { label: "Crypto", type: "Tool", keywords: "encryption decryption aes", action: () => setActiveTool("crypto") },
  { label: "Steganography", type: "Tool", keywords: "steg hide image", action: () => setActiveTool("steg") },
  { label: "Web proxy helper", type: "Tool", keywords: "proxy http https", action: () => setActiveTool("proxy") },
  { label: "Honeypot", type: "Tool", keywords: "decoy trap honey", action: () => setActiveTool("honey") },
  { label: "SIEM", type: "Tool", keywords: "siem log analyzer", action: () => setActiveTool("siem") },
  { label: "Log analyser", type: "Tool", keywords: "logs alerts errors", action: () => setActiveTool("log") },
  { label: "URL safety checker", type: "Tool", keywords: "url phishing", action: () => setActiveTool("url") },
  { label: "File hash checker", type: "Tool", keywords: "hash checksum sha", action: () => setActiveTool("hash") },
  { label: "Whois lookup", type: "Tool", keywords: "rdap whois domain", action: () => setActiveTool("whois") },
  { label: "Report generation", type: "Report", keywords: "reports pdf export", action: () => {
    setActiveTool("report");
    document.getElementById("reportTitle")?.focus();
  } },
  { label: "Notifications", type: "Utility", keywords: "alerts activity", action: () => {
    notifPanel?.classList.remove("hidden");
    notifBtn?.classList.add("active");
  } },
  { label: "Settings", type: "Settings", keywords: "profile account", action: () => openSettingsModal() },
  { label: "Terminal", type: "Utility", keywords: "shell command diagnostics", action: () => openTerminal(true) },
];

function renderGlobalSearch(query) {
  if (!globalSearchResults) return;
  const q = query.trim().toLowerCase();
  globalSearchResults.innerHTML = "";
  if (!q) {
    globalSearchResults.classList.add("hidden");
    return;
  }
  const matches = SEARCH_ENTRIES.filter((item) => {
    const haystack = `${item.label} ${item.keywords || ""}`.toLowerCase();
    return haystack.includes(q);
  }).slice(0, 8);
  if (!matches.length) {
    const empty = document.createElement("div");
    empty.className = "search-result";
    empty.innerHTML = `<span>No matches found</span>`;
    globalSearchResults.appendChild(empty);
    globalSearchResults.classList.remove("hidden");
    return;
  }
  matches.forEach((item) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "search-result";
    row.innerHTML = `<span>${item.label}</span><span class="search-pill">${item.type}</span>`;
    row.addEventListener("click", () => {
      if (typeof item.action === "function") item.action();
      globalSearchResults.classList.add("hidden");
      if (globalSearch) globalSearch.blur();
    });
    globalSearchResults.appendChild(row);
  });
  globalSearchResults.classList.remove("hidden");
}

function getTauriInvoke() {
  const tauri = globalThis.__TAURI__ || window?.__TAURI__ || null;
  if (!tauri) {
    return globalThis.__TAURI_INTERNALS__?.invoke || null;
  }
  return (
    tauri.core?.invoke ||
    tauri.invoke ||
    tauri.tauri?.invoke ||
    globalThis.__TAURI_INTERNALS__?.invoke ||
    null
  );
}

function getTauriEventListen() {
  const tauri = globalThis.__TAURI__ || window?.__TAURI__ || null;
  if (!tauri) {
    return globalThis.__TAURI_INTERNALS__?.event?.listen || null;
  }
  return tauri.event?.listen || globalThis.__TAURI_INTERNALS__?.event?.listen || null;
}

function resizeWifiCanvas(canvas) {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const targetWidth = Math.max(320, Math.floor(rect.width));
  const targetHeight = Math.max(180, Math.floor(rect.height));
  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }
}
function isDesktopApp() {
  const tauriFlag =
    Boolean(globalThis.__TAURI__ || globalThis.__TAURI_INTERNALS__ || globalThis.__TAURI_IPC__) ||
    Boolean(getTauriInvoke());
  const uaFlag = navigator.userAgent.includes("Tauri");
  return tauriFlag || uaFlag;
}

subnetCalcBtn.addEventListener("click", () => {
  const input = document.getElementById("cidrInput").value.trim();
  const [ip, cidrText] = input.split("/");
  const cidr = Number(cidrText);
  const ipInt = ipToInt(ip);
  if (ipInt === null || Number.isNaN(cidr) || cidr < 0 || cidr > 32) {
    subnetResult.textContent = "Invalid CIDR format.";
    return;
  }
  const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  const network = ipInt & mask;
  const broadcast = network + (1 << (32 - cidr)) - 1;
  const first = cidr === 32 ? network : network + 1;
  const last = cidr >= 31 ? broadcast : broadcast - 1;
  subnetResult.textContent = [
    `Network: ${intToIp(network)}`,
    `Broadcast: ${intToIp(broadcast)}`,
    `Host range: ${intToIp(first)} - ${intToIp(last)}`,
    `Mask: ${intToIp(mask)}`,
  ].join("\n");
  state.toolData.subnet = subnetResult.textContent;
  saveToolOutput("subnet", state.toolData.subnet);
  registerRun("Subnet calculation completed", "subnet");
  if (cipherState.tool === "subnet" && shouldAutoAdvance("calculate")) {
    markActionDone("calculate");
    advanceCipherStep("Review the network, broadcast, and host range.");
  }
});

function renderWifiResults(networks, connectedSsid) {
  if (!wifiResult) return;
  wifiResult.innerHTML = "";
  const header = document.createElement("div");
  header.className = "wifi-row header";
  header.innerHTML = `
    <div>SSID</div>
    <div>Signal</div>
    <div>Channel</div>
    <div>Security</div>
    <div>Band</div>
  `;
  wifiResult.appendChild(header);

  if (!networks.length) {
    const empty = document.createElement("div");
    empty.className = "wifi-row";
    empty.innerHTML = `<div>No networks found.</div>`;
    wifiResult.appendChild(empty);
    return;
  }

  const sorted = networks
    .slice()
    .sort((a, b) => normalizeSignal(b.signal) - normalizeSignal(a.signal));

  sorted.forEach((network) => {
    const row = document.createElement("div");
    row.className = "wifi-row";
    const ssid = network.ssid || "Hidden";
    const security = network.security || "Unknown";
    const channelValue =
      typeof network.channel === "number"
        ? network.channel
        : channelFromFrequency(network.frequency);
    const channel = channelValue ? `${channelValue}` : "Unknown";
    const band =
      typeof channelValue === "number"
        ? channelValue <= 14
          ? "2.4 GHz"
          : "5 GHz"
        : "Unknown";
    let signal = "Unknown";
    if (typeof network.signal === "number") {
      signal =
        network.signal < 0 ? `${network.signal} dBm` : `${network.signal}%`;
    }
    row.innerHTML = `
      <div><strong>${ssid}</strong>${connectedSsid && ssid === connectedSsid ? '<span class="badge">Connected</span>' : ""}</div>
      <div>${signal}</div>
      <div>${channel}</div>
      <div>${security}</div>
      <div>${band}</div>
    `;
    if (channelValue) {
      row.dataset.channel = String(channelValue);
    }
    row.dataset.ssid = ssid;
    if (connectedSsid && ssid === connectedSsid) {
      row.classList.add("connected");
    }
    if (wifiSelectedSsid && ssid === wifiSelectedSsid) {
      row.classList.add("selected");
    }
    wifiResult.appendChild(row);
  });
}

function channelFromFrequency(freq) {
  if (!freq) return null;
  if (freq >= 2412 && freq <= 2472) {
    return Math.round((freq - 2407) / 5);
  }
  if (freq === 2484) return 14;
  if (freq >= 5000 && freq <= 5900) {
    return Math.round((freq - 5000) / 5);
  }
  return null;
}

function normalizeSignal(signal) {
  if (typeof signal !== "number") return 0;
  if (signal > 0 && signal <= 100) return signal;
  const clamped = Math.max(-100, Math.min(-30, signal));
  return Math.round(((clamped + 100) / 70) * 100);
}

function updateWifiHistory(networks) {
  const seen = new Set();
  networks.forEach((net) => {
    const ssid = net.ssid || "Hidden";
    const channel =
      typeof net.channel === "number"
        ? net.channel
        : channelFromFrequency(net.frequency);
    if (!channel) return;
    const key = `${ssid}@@${channel}`;
    seen.add(key);
    const existing = wifiNetworkHistory.get(key) || { missing: 0, last: net };
    existing.missing = 0;
    existing.last = { ...net, channel };
    wifiNetworkHistory.set(key, existing);
  });
  wifiNetworkHistory.forEach((value, key) => {
    if (!seen.has(key)) {
      value.missing += 1;
      wifiNetworkHistory.set(key, value);
    }
  });
  Array.from(wifiNetworkHistory.entries()).forEach(([key, value]) => {
    if (value.missing >= WIFI_PRUNE_AFTER) {
      wifiNetworkHistory.delete(key);
    }
  });
}

function getWifiHistorySnapshot() {
  return Array.from(wifiNetworkHistory.values()).map((item) => item.last);
}

function drawWifiChart(canvas, channels, networks, bandLabel) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  const leftPad = 34;
  const rightPad = 12;
  const topPad = 12;
  const bottomPad = 26;
  const plotWidth = width - leftPad - rightPad;
  const plotHeight = height - topPad - bottomPad;

  const minDbm = -90;
  const maxDbm = -30;

  ctx.strokeStyle = "rgba(44, 255, 103, 0.12)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 6; i += 1) {
    const y = topPad + (plotHeight / 6) * i;
    ctx.beginPath();
    ctx.moveTo(leftPad, y);
    ctx.lineTo(width - rightPad, y);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(44, 255, 103, 0.55)";
  ctx.font = "11px Consolas, monospace";
  for (let i = 0; i <= 6; i += 1) {
    const value = maxDbm - ((maxDbm - minDbm) / 6) * i;
    const y = topPad + (plotHeight / 6) * i + 4;
    ctx.fillText(`${Math.round(value)}`, 6, y);
  }

  const step = plotWidth / (channels.length - 1);
  const channelPositions = new Map();
  channels.forEach((channel, idx) => {
    channelPositions.set(channel, leftPad + idx * step);
    ctx.fillStyle = "rgba(44, 255, 103, 0.65)";
    ctx.fillText(String(channel), leftPad + idx * step - 4, height - 8);
  });

  const curveWidth = bandLabel === "2.4" ? 4 : 8;
  const curves = networks
    .map((network) => {
      const channel =
        typeof network.channel === "number"
          ? network.channel
          : channelFromFrequency(network.frequency);
      if (!channel || !channelPositions.has(channel)) return null;
      const signalPercent = normalizeSignal(network.signal);
      const dbm = minDbm + (signalPercent / 100) * (maxDbm - minDbm);
      return {
        ssid: network.ssid || "Hidden",
        channel,
        x: channelPositions.get(channel),
        dbm,
      };
    })
    .filter(Boolean);

  curves.forEach((curve) => {
    const normalized = (curve.dbm - minDbm) / (maxDbm - minDbm);
    const yPeak = topPad + (1 - normalized) * plotHeight;
    const xLeft = curve.x - step * curveWidth * 0.5;
    const xRight = curve.x + step * curveWidth * 0.5;
    const yBase = topPad + plotHeight;

    const isSelected = wifiSelectedSsid && curve.ssid === wifiSelectedSsid;
    ctx.strokeStyle = isSelected ? "rgba(198, 255, 224, 0.95)" : "rgba(44, 255, 103, 0.4)";
    ctx.lineWidth = isSelected ? 2.4 : 1.4;
    ctx.beginPath();
    ctx.moveTo(xLeft, yBase);
    ctx.quadraticCurveTo(curve.x, yPeak, xRight, yBase);
    ctx.stroke();

    if (isSelected) {
      ctx.fillStyle = "rgba(44, 255, 103, 0.2)";
      ctx.fillRect(curve.x - 6, yPeak - 18, 80, 16);
      ctx.fillStyle = "rgba(198, 255, 224, 0.95)";
      ctx.fillText(curve.ssid, curve.x - 4, yPeak - 6);
    }
  });
}

function renderWifiCharts(networks) {
  resizeWifiCanvas(wifiCanvas24);
  resizeWifiCanvas(wifiCanvas5);
  const data = wifiLiveActive ? getWifiHistorySnapshot() : networks;
  drawWifiChart(
    wifiCanvas24,
    Array.from({ length: 14 }, (_, idx) => idx + 1),
    data.filter((net) => {
      const channel =
        typeof net.channel === "number"
          ? net.channel
          : channelFromFrequency(net.frequency);
      return channel && channel <= 14;
    }),
    "2.4"
  );
  drawWifiChart(
    wifiCanvas5,
    [36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 149, 153, 157, 161, 165],
    data.filter((net) => {
      const channel =
        typeof net.channel === "number"
          ? net.channel
          : channelFromFrequency(net.frequency);
      return channel && channel > 14;
    }),
    "5"
  );
}

async function runWifiScan(options = {}) {
  const updateList = options.updateList !== false;
  const countRun = options.countRun !== false;
  if (wifiScanInProgress) return;
  wifiScanInProgress = true;
  if (wifiScanBtn) wifiScanBtn.disabled = true;
  if (wifiScanStopBtn) wifiScanStopBtn.disabled = false;
  if (!wifiStatus) return;
  wifiStatus.textContent = "Scanning Wi-Fi networks...";
  if (wifiResult && updateList) {
    wifiResult.innerHTML = "";
  }
  try {
    const invoke = getTauriInvoke();
    let payload = null;
    const withTimeout = (promise) =>
      Promise.race([
        promise,
        new Promise((_, rej) =>
          setTimeout(() => rej(new Error("Wi-Fi scan timed out. Check adapter state and try again.")), WIFI_SCAN_TIMEOUT_MS)
        ),
      ]);
    if (invoke) {
      // Primary: native Tauri command (desktop app)
      payload = await withTimeout(invoke("wifi_scan"));
    } else {
      // Fallback: local API (dev / web build)
      const response = await withTimeout(fetch("/api/wifi-scan", { method: "POST" }));
      if (!response.ok) {
        const text = await response.text();
        if (text.trim().startsWith("<")) {
          throw new Error(
            "Wi-Fi scan service is unavailable in this build. Start the Net Kit backend (npm run dev:server) or use the desktop app with Wi-Fi permissions."
          );
        }
        throw new Error(text || "Wi-Fi scan failed (fallback).");
      }
      try {
        payload = await response.json();
      } catch (parseError) {
        throw new Error(
          "Wi-Fi scan response was not valid JSON. If you're running npm run dev:tauri, Wi-Fi scanning only works in the desktop build with Npcap installed."
        );
      }
    }

    if (!payload || typeof payload !== "object") {
      throw new Error("No response from the native Wi-Fi scanner.");
    }

    // Normalise data shape
    const networks =
      payload?.networks || payload?.data?.networks || payload?.result?.networks || [];
    const connectedSsid =
      payload?.connectedSsid ||
      payload?.connected_ssid ||
      payload?.data?.connectedSsid ||
      payload?.result?.connectedSsid ||
      null;

    if (payload?.ok === false) {
      throw new Error(payload?.error || "Wi-Fi scan failed.");
    }

    if (!Array.isArray(networks)) {
      throw new Error(payload?.error || "Unable to parse Wi-Fi scan results.");
    }

    state.toolData.wifiNetworks = networks;
    state.toolData.wifiConnectedSsid = connectedSsid;
    updateWifiHistory(networks);
    const summary = `Networks found: ${networks.length}`;
    state.toolData.wifi = summary;
    saveToolOutput("wifi", summary);
    if (updateList) {
      renderWifiResults(networks, connectedSsid);
    }
    renderWifiCharts(networks);
    wifiStatus.textContent = wifiLiveActive ? `${summary} • Live chart running` : summary;
    if (countRun) {
      registerRun("Wi-Fi scan completed", "wifi");
    }
  } catch (error) {
    console.error("Wi-Fi scan failed:", error);
    const message =
      typeof error === "string"
        ? error
        : error?.message || JSON.stringify(error) || "Unable to scan Wi-Fi. Ensure Net Kit desktop is running with Wi-Fi permissions.";
    wifiStatus.textContent = message;
    renderWifiCharts([]);
  } finally {
    wifiScanInProgress = false;
    if (wifiScanBtn) wifiScanBtn.disabled = false;
  }
}



async function generateWifiReport() {
  if (!wifiStatus) return;
  const networks = state.toolData.wifiNetworks || [];
  if (!networks.length) {
    wifiStatus.textContent = "Run a scan before generating a report.";
    return;
  }
  wifiStatus.textContent = "Generating PDF report...";
  try {
    const invoke = getTauriInvoke();
    let blob;
    if (invoke) {
      const base64 = await invoke("wifi_report", {
        payload: {
          title: "Secure Wi-Fi Scanner Report",
          networks,
        },
      });
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      blob = new Blob([bytes], { type: "application/pdf" });
    } else {
      wifiStatus.textContent = "Wi-Fi report is available in the desktop app only.";
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "wifi-report.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    wifiStatus.textContent = "Report downloaded.";
    registerRun("Wi-Fi report generated", "wifi");
  } catch (error) {
    wifiStatus.textContent = error.message || "Unable to generate report.";
  }
}

if (wifiScanBtn) {
  wifiScanBtn.addEventListener("click", () => {
    startWifiAutoScan();
    renderWifiResults(
      state.toolData.wifiNetworks || [],
      state.toolData.wifiConnectedSsid || null
    );
  });
}

if (wifiScanStopBtn) {
  wifiScanStopBtn.addEventListener("click", () => {
    stopWifiAutoScan();
    if (wifiStatus) {
      wifiStatus.textContent = "Live scan stopped.";
    }
  });
}

if (wifiReportBtn) {
  wifiReportBtn.addEventListener("click", generateWifiReport);
}

if (wifiStatus) {
  wifiStatus.textContent = "Ready to scan.";
  renderWifiCharts([]);
}

window.addEventListener("resize", () => {
  renderWifiCharts(state.toolData.wifiNetworks || []);
});

if (wifiResult) {
  wifiResult.addEventListener("click", (event) => {
    const item = event.target.closest(".wifi-row");
    if (!item) return;
    if (item.classList.contains("header")) return;
    const channel = Number(item.dataset.channel);
    wifiSelectedChannel = Number.isNaN(channel) ? null : channel;
    wifiSelectedSsid = item.dataset.ssid || null;
    wifiResult.querySelectorAll(".wifi-row").forEach((row) => {
      row.classList.toggle("selected", row === item);
    });
    renderWifiCharts(state.toolData.wifiNetworks || []);
  });
}

function stopWifiAutoScan() {
  if (wifiScanTimer) {
    clearInterval(wifiScanTimer);
    wifiScanTimer = null;
  }
  wifiLiveActive = false;
}

function startWifiAutoScan() {
  const invoke = getTauriInvoke();
  const hasFallback = typeof fetch === "function";
  if (!invoke && !hasFallback) {
    if (wifiStatus) {
      wifiStatus.textContent = "Wi-Fi scan is available in the desktop app only.";
    }
    return;
  }
  // Run a single scan only (no auto-refresh) to avoid continuous refreshes every 5 seconds
  if (wifiScanTimer) {
    clearInterval(wifiScanTimer);
    wifiScanTimer = null;
  }
  wifiLiveActive = false;
  runWifiScan({ updateList: true, countRun: true });
}


function handleWifiAutoScan(toolName) {
  if (toolName !== "wifi") return;
}

function renderIpResults(devices) {
  if (!ipScanResult) return;
  ipScanResult.innerHTML = "";
  const header = document.createElement("div");
  header.className = "ip-row header";
  header.innerHTML = `
    <div>IP Address</div>
    <div>Hostname</div>
    <div>MAC</div>
    <div>Vendor</div>
  `;
  ipScanResult.appendChild(header);
  if (!devices.length) {
    const empty = document.createElement("div");
    empty.className = "ip-row";
    empty.innerHTML = `<div>No active devices found.</div>`;
    ipScanResult.appendChild(empty);
    return;
  }
  devices.forEach((device) => {
    const row = document.createElement("div");
    row.className = "ip-row";
    row.innerHTML = `
      <div><strong>${device.ip || "-"}</strong></div>
      <div>${device.hostname || "-"}</div>
      <div>${device.mac || "-"}</div>
      <div>${device.vendor || "Unknown"}</div>
    `;
    ipScanResult.appendChild(row);
  });
}

function addIpDevice(device) {
  if (!device?.ip) return;
  if (ipScanDevices.has(device.ip)) return;
  ipScanDevices.set(device.ip, device);
  renderIpResults(Array.from(ipScanDevices.values()));
}

function setIpScanActive(active) {
  ipScanActive = active;
  if (ipScanBtn) ipScanBtn.disabled = active;
  if (ipScanStopBtn) ipScanStopBtn.disabled = !active;
  if (ipScanProgress) {
    ipScanProgress.classList.toggle("active", active);
    const bar = ipScanProgress.querySelector("span");
    if (bar) {
      bar.style.width = active ? "0%" : "0%";
    }
  }
}

async function runIpScan() {
  if (!ipScanStatus || !ipScanSubnet) return;
  const subnet = ipScanSubnet.value.trim();
  if (!subnet) {
    ipScanStatus.textContent = "Enter a subnet in CIDR format.";
    return;
  }
  const deepScan = Boolean(ipScanDeep?.checked);
  const invoke = getTauriInvoke();
  if (!invoke) {
    ipScanStatus.textContent = "IP scan is available in the desktop app only.";
    return;
  }
  ipScanStatus.textContent = "Scanning network...";
  ipScanDevices = new Map();
  setIpScanActive(true);
  renderIpResults([]);
  try {
    await invoke("ip_scan_start", { subnet, deep: deepScan });
  } catch (error) {
    ipScanStatus.textContent = error.message || "Unable to scan network.";
    setIpScanActive(false);
  }
}

if (ipScanBtn) {
  ipScanBtn.addEventListener("click", runIpScan);
}

if (ipScanStopBtn) {
  ipScanStopBtn.addEventListener("click", async () => {
    const invoke = getTauriInvoke();
    if (!invoke) return;
    try {
      ipScanStatus.textContent = "Stopping scan...";
      await invoke("ip_scan_stop");
    } catch (error) {
      ipScanStatus.textContent = error.message || "Unable to stop scan.";
    }
  });
}

function registerIpScanListeners() {
  const ipScanListen = getTauriEventListen();
  if (!ipScanListen) return false;
  ipScanListen("ip_scan_device", (event) => {
    const device = event.payload || {};
    addIpDevice(device);
  });
  ipScanListen("ip_scan_progress", (event) => {
    if (!ipScanStatus) return;
    const percent = event.payload?.percent;
    if (typeof percent === "number") {
      ipScanStatus.textContent = `Scanning network... ${percent}%`;
      if (ipScanProgress) {
        const bar = ipScanProgress.querySelector("span");
        if (bar) {
          bar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
        }
      }
    }
  });
  ipScanListen("ip_scan_done", (event) => {
    const count = event.payload?.count || ipScanDevices.size;
    state.toolData.ipscan = `Devices found: ${count}`;
    saveToolOutput("ipscan", state.toolData.ipscan);
    ipScanStatus.textContent = `Devices found: ${count}`;
    registerRun("IP scan completed", "ipscan");
    if (ipScanProgress) {
      const bar = ipScanProgress.querySelector("span");
      if (bar) {
        bar.style.width = "100%";
      }
    }
    setIpScanActive(false);
  });
  ipScanListen("ip_scan_stopped", () => {
    if (!ipScanStatus) return;
    ipScanStatus.textContent = "Scan stopped.";
    setIpScanActive(false);
  });
  return true;
}

let ipScanListenerRetries = 0;
function ensureIpScanListeners() {
  if (registerIpScanListeners()) return;
  if (ipScanListenerRetries >= 10) return;
  ipScanListenerRetries += 1;
  setTimeout(ensureIpScanListeners, 500);
}

ensureIpScanListeners();

const CRYPTO_METHODS = {
  "aes-gcm": { name: "AES-256-GCM", ivLength: 12 },
  "aes-cbc": { name: "AES-256-CBC", ivLength: 16 },
  "aes-ctr": { name: "AES-256-CTR", ivLength: 16 },
  des: { name: "DES-CBC", ivLength: 8 },
  "3des": { name: "3DES-CBC", ivLength: 8 },
};

async function deriveCryptoKey(passphrase, method) {
  const enc = new TextEncoder();
  const passBytes = enc.encode(passphrase);
  const hash = await crypto.subtle.digest("SHA-256", passBytes);
  if (method === "des" || method === "3des") {
    return new Uint8Array(hash);
  }
  const algo =
    method === "aes-gcm"
      ? "AES-GCM"
      : method === "aes-cbc"
        ? "AES-CBC"
        : "AES-CTR";
  return crypto.subtle.importKey("raw", hash, { name: algo }, false, ["encrypt", "decrypt"]);
}

async function encryptText(text, passphrase, methodKey) {
  const method = CRYPTO_METHODS[methodKey];
  if (!method) throw new Error("Unsupported method");
  const enc = new TextEncoder();
  const data = enc.encode(text);
  if (methodKey === "des" || methodKey === "3des") {
    const keyBytes = await deriveCryptoKey(passphrase, methodKey);
    const iv = crypto.getRandomValues(new Uint8Array(method.ivLength));
    const cipher = softwareDesEncrypt(data, keyBytes, iv, methodKey === "3des");
    return `${toBase64(iv)}:${toBase64(cipher)}`;
  }
  const key = await deriveCryptoKey(passphrase, methodKey);
  const iv = crypto.getRandomValues(new Uint8Array(method.ivLength));
  const algoParams =
    methodKey === "aes-gcm"
      ? { name: "AES-GCM", iv }
      : methodKey === "aes-cbc"
        ? { name: "AES-CBC", iv }
        : { name: "AES-CTR", counter: iv, length: 64 };
  const cipherBuffer = await crypto.subtle.encrypt(algoParams, key, data);
  return `${toBase64(iv)}:${toBase64(cipherBuffer)}`; // iv:cipher
}

async function decryptText(payload, passphrase, methodOverride) {
  const parts = payload.split(":");
  if (parts.length !== 2) throw new Error("Invalid ciphertext format. Expect iv:cipher.");
  const [ivB64, cipherB64] = parts;
  const methodKey = methodOverride || cryptoMethod?.value || "aes-gcm";
  const method = CRYPTO_METHODS[methodKey];
  if (!method) throw new Error("Unsupported method");
  const iv = new Uint8Array(fromBase64(ivB64));
  const cipher = new Uint8Array(fromBase64(cipherB64));
  if (methodKey === "des" || methodKey === "3des") {
    const keyBytes = await deriveCryptoKey(passphrase, methodKey);
    const plainBytes = softwareDesDecrypt(cipher, keyBytes, iv, methodKey === "3des");
    return new TextDecoder().decode(plainBytes);
  }
  const key = await deriveCryptoKey(passphrase, methodKey);
  const algoParams =
    methodKey === "aes-gcm"
      ? { name: "AES-GCM", iv }
      : methodKey === "aes-cbc"
        ? { name: "AES-CBC", iv }
        : { name: "AES-CTR", counter: iv, length: 64 };
  const plainBuffer = await crypto.subtle.decrypt(algoParams, key, cipher);
  return new TextDecoder().decode(plainBuffer);
}

if (cryptoModeToggle) {
  cryptoModeToggle.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-mode]");
    if (!button) return;
    const mode = button.dataset.mode;
    cryptoState.mode = mode;
    cryptoModeToggle.querySelectorAll("button").forEach((btn) => {
      btn.classList.toggle("active", btn === button);
    });
    cryptoActionBtn.textContent = mode === "decrypt" ? "Decrypt" : "Encrypt";
    cryptoInput.placeholder =
      mode === "decrypt"
        ? "Ciphertext (iv:cipher) to decrypt"
        : "Text to encrypt";
    if (mode === "decrypt" && cryptoKey) {
      cryptoKey.value = "";
    }
    if (cryptoInput) cryptoInput.value = "";
    if (cryptoOutput) cryptoOutput.value = "";
  });
}

if (cryptoActionBtn) {
  cryptoActionBtn.addEventListener("click", async () => {
    if (!ensureCryptoSupport()) {
      if (cryptoOutput) {
        cryptoOutput.value = "Web Crypto not available. Use HTTPS or the desktop app.";
      }
      return;
    }
    const mode = cryptoState.mode || "encrypt";
    const methodKey = cryptoMethod?.value || "aes-gcm";
    const passphrase = cryptoKey?.value || "";
    const inputText = cryptoInput?.value || "";
    if (!passphrase.trim()) {
      cryptoOutput.value = "Enter a passphrase.";
      return;
    }
    if (!inputText.trim()) {
      cryptoOutput.value = "Enter text to process.";
      return;
    }
    try {
      if (mode === "encrypt") {
        const cipherText = await encryptText(inputText, passphrase, methodKey);
        cryptoOutput.value = cipherText;
        state.toolData.crypto = `Cipher (${CRYPTO_METHODS[methodKey].name}): ${cipherText}`;
        saveToolOutput("crypto", state.toolData.crypto);
        registerRun("Crypto encryption completed", "crypto");
      } else {
        const plainText = await decryptText(inputText, passphrase);
        cryptoOutput.value = plainText;
        state.toolData.crypto = `Method: ${CRYPTO_METHODS[methodKey].name}\nPlain: ${plainText}`;
        saveToolOutput("crypto", state.toolData.crypto);
        registerRun("Crypto decryption completed", "crypto");
      }
    } catch (error) {
      cryptoOutput.value =
        error?.message || "Decryption failed. Use the same algorithm and passphrase.";
    }
  });
}

if (cryptoGenerateKeyBtnEl) {
  cryptoGenerateKeyBtnEl.addEventListener("click", () => {
    const key = generateSecretKey(cryptoMethod?.value || "aes-gcm");
    if (cryptoKey) cryptoKey.value = key;
  });
}

if (cryptoCopyKeyBtn) {
  cryptoCopyKeyBtn.addEventListener("click", () => {
    const key = cryptoKey?.value || "";
    if (!key) return;
    navigator.clipboard.writeText(key).catch(() => {});
  });
}

if (cryptoCopyBtn) {
  cryptoCopyBtn.addEventListener("click", () => {
    const text = cryptoOutput?.value || "";
    if (!text) return;
    navigator.clipboard.writeText(text).catch(() => {});
  });
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = reader.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

function encodeMessageIntoImage(img, message) {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const enc = new TextEncoder();
  const msgBytes = enc.encode(message);
  const totalBits = (msgBytes.length + 4) * 8;
  const usablePixels = Math.floor(data.length / 4);
  const capacityBits = usablePixels * 3;
  if (totalBits > capacityBits) {
    throw new Error("Message too large for this image.");
  }
  const bytes = new Uint8Array(msgBytes.length + 4);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, msgBytes.length, true);
  bytes.set(msgBytes, 4);
  let dataIndex = 0;
  for (let i = 0; i < bytes.length; i += 1) {
    for (let bit = 0; bit < 8; bit += 1) {
      const bitVal = (bytes[i] >> bit) & 1;
      const channel = dataIndex % 4;
      if (channel === 3) dataIndex += 1;
      data[dataIndex] = (data[dataIndex] & 0xfe) | bitVal;
      dataIndex += 1;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

function decodeMessageFromImage(img) {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const readBits = (count, offsetRef) => {
    const out = [];
    for (let i = 0; i < count; i += 1) {
      const channel = offsetRef.value % 4;
      if (channel === 3) offsetRef.value += 1;
      out.push(data[offsetRef.value] & 1);
      offsetRef.value += 1;
    }
    return out;
  };
  const offsetRef = { value: 0 };
  const lenBits = readBits(32, offsetRef);
  let len = 0;
  for (let i = 0; i < 32; i += 1) {
    len |= lenBits[i] << i;
  }
  const msgBits = readBits(len * 8, offsetRef);
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    let b = 0;
    for (let bit = 0; bit < 8; bit += 1) {
      b |= msgBits[i * 8 + bit] << bit;
    }
    bytes[i] = b;
  }
  return new TextDecoder().decode(bytes);
}

if (stegModeToggle) {
  stegModeToggle.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-mode]");
    if (!button) return;
    const mode = button.dataset.mode;
    stegState.mode = mode;
    stegModeToggle.querySelectorAll("button").forEach((btn) => {
      btn.classList.toggle("active", btn === button);
    });
    const isDecrypt = mode === "decrypt";
    stegEncodeInputWrap.classList.toggle("hidden", isDecrypt);
    stegMessageWrap.classList.toggle("hidden", isDecrypt);
    stegDecodeInputWrap.classList.toggle("hidden", !isDecrypt);
    stegStatus.textContent = "Ready.";
    stegOutputText.value = "";
    if (stegMessage) {
      stegMessage.value = "";
    }
    if (stegDecodeFile) stegDecodeFile.value = "";
    if (stegEncodeFile) stegEncodeFile.value = "";
    if (stegCryptoKey) stegCryptoKey.value = "";
    if (stegCryptoMethod) stegCryptoMethod.selectedIndex = 0;
    if (stegOutputImage) stegOutputImage.classList.add("hidden");
    if (stegDownloadBtn) stegDownloadBtn.classList.add("hidden");
  });
}

if (stegRunBtn) {
  stegRunBtn.addEventListener("click", async () => {
    const mode = stegState.mode || "encrypt";
    stegStatus.textContent = "Processing...";
    try {
      if (mode === "encrypt") {
        const file = stegEncodeFile?.files?.[0];
        let message = stegMessage?.value || "";
        if (!file || !message) throw new Error("Select an image and enter text to embed.");
        const img = await readImageFile(file);
        const stegMethod = stegCryptoMethod?.value || "";
        const stegPass = stegCryptoKey?.value.trim();
        if (stegPass) {
          const methodToUse = stegMethod || "aes-gcm";
          message = await encryptText(message, stegPass, methodToUse);
        }
        const dataUrl = encodeMessageIntoImage(img, message);
        if (stegOutputImage) {
          stegOutputImage.src = dataUrl;
          stegOutputImage.classList.remove("hidden");
        }
        if (stegDownloadBtn) {
          stegDownloadBtn.classList.remove("hidden");
          stegDownloadBtn.onclick = () => {
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = "stego.png";
            a.click();
          };
        }
        stegOutputText.value = "Stego image ready. Click download to save (check Downloads).";
        state.toolData.steg = "Stego image ready for download.";
        saveToolOutput("steg", state.toolData.steg);
      } else {
        const file = stegDecodeFile?.files?.[0];
        if (!file) throw new Error("Select a stego image to decode.");
        const img = await readImageFile(file);
        let text = decodeMessageFromImage(img);
        const stegMethod = stegCryptoMethod?.value || "";
        const stegPass = stegCryptoKey?.value.trim();
        if (stegPass) {
          const methodToUse = stegMethod || "aes-gcm";
          try {
            text = await decryptText(text, stegPass, methodToUse);
          } catch (err) {
            throw new Error("Decryption failed. Use the same algorithm and passphrase.");
          }
        }
        stegOutputText.value = text;
        state.toolData.steg = `Extracted text: ${text}`;
        saveToolOutput("steg", state.toolData.steg);
        if (stegOutputImage) stegOutputImage.classList.add("hidden");
        if (stegDownloadBtn) stegDownloadBtn.classList.add("hidden");
      }
      stegStatus.textContent = "Done.";
    } catch (error) {
      stegStatus.textContent = error?.message || "Steganography failed.";
    }
  });
}

if (stegGenerateKeyBtnEl) {
  stegGenerateKeyBtnEl.addEventListener("click", () => {
    const key = generateSecretKey(stegCryptoMethod?.value || "aes-gcm");
    if (stegCryptoKey) stegCryptoKey.value = key;
  });
}

if (stegCopyKeyBtn) {
  stegCopyKeyBtn.addEventListener("click", () => {
    const key = stegCryptoKey?.value || "";
    if (!key) return;
    navigator.clipboard.writeText(key).catch(() => {});
  });
}

if (stegCopyBtn) {
  stegCopyBtn.addEventListener("click", () => {
    const text = stegOutputText?.value || "";
    if (!text) return;
    navigator.clipboard.writeText(text).catch(() => {});
  });
}

function appendHoneyEvent(message) {
  if (!honeyActive) return;
  const ts = new Date().toLocaleString();
  honeyEvents.push(`[${ts}] ${message}`);
  if (honeyOutput) {
    honeyOutput.value = honeyEvents.slice(-200).join("\n");
  }
  state.toolData.honey = honeyOutput?.value || "";
  saveToolOutput("honey", state.toolData.honey);
}

function ensureHoneyListeners() {
  const listen = getTauriEventListen();
  if (!listen) return;
  if (!honeyUnlistenEvent) {
    listen("honey_event", (event) => {
      const payload = event?.payload;
      if (payload && typeof payload.message === "string") {
        appendHoneyEvent(payload.message);
      } else if (typeof payload === "string") {
        appendHoneyEvent(payload);
      }
    }).then((un) => (honeyUnlistenEvent = un));
  }
  if (!honeyUnlistenStatus) {
    listen("honey_status", (event) => {
      if (honeyStatus) {
        const msg = event?.payload || "Honeypot status update.";
        honeyStatus.textContent = msg;
        const lower = msg.toLowerCase();
        if (lower.includes("active")) {
          honeyActive = true;
        }
        if (lower.includes("stopped")) {
          honeyActive = false;
        }
      }
    }).then((un) => (honeyUnlistenStatus = un));
  }
  if (!honeyUnlistenError) {
    listen("honey_error", (event) => {
      const msg = event?.payload || "Honeypot error.";
      appendHoneyEvent(msg);
      if (honeyStatus) honeyStatus.textContent = msg;
    }).then((un) => (honeyUnlistenError = un));
  }
}

if (honeyStartBtn) {
  honeyStartBtn.addEventListener("click", () => {
    const profile = honeyProfile?.value || "web";
    const port = honeyPort?.value?.trim() || "80";
    const invoke = getTauriInvoke();
    if (isDesktopApp() && invoke) {
      ensureHoneyListeners();
      honeyStatus.textContent = `Starting honeypot (${profile.toUpperCase()} on port ${port})...`;
      const portNum = parseInt(port, 10);
      invoke("honeypot_start", { port: Number.isFinite(portNum) ? portNum : 80, profile })
        .then(() => {
          honeyActive = true;
          honeyStatus.textContent = `Honeypot active (${profile.toUpperCase()} on port ${port})`;
          registerRun("Honeypot started", "honey");
        })
        .catch((error) => {
          const msg = error?.message || "Failed to start honeypot.";
          appendHoneyEvent(msg);
          honeyStatus.textContent = msg;
        });
      return;
    }
    honeyActive = true;
    honeyStatus.textContent = `Honeypot active (${profile.toUpperCase()} on port ${port}, simulated).`;
    registerRun("Honeypot started", "honey");
  });
}

if (honeyStopBtn) {
  honeyStopBtn.addEventListener("click", () => {
    const invoke = getTauriInvoke();
    if (isDesktopApp() && invoke) {
      invoke("honeypot_stop").catch(() => {});
    }
    honeyActive = false;
    honeyStatus.textContent = "Start honeypot";
  });
}

function randomIp() {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join(".");
}

if (honeySimulateBtn) {
  honeySimulateBtn.addEventListener("click", () => {
    if (!honeyActive) return;
    const profile = honeyProfile?.value || "web";
    const port = honeyPort?.value?.trim() || "80";
    const ip = randomIp();
    const msg = `Probe from ${ip} against ${profile.toUpperCase()} on port ${port}`;
    appendHoneyEvent(msg);
    honeyStatus.textContent = "Recorded probe.";
  });
}

if (honeyClearBtn) {
  honeyClearBtn.addEventListener("click", () => {
  honeyEvents.length = 0;
  if (honeyOutput) honeyOutput.value = "";
  honeyStatus.textContent = "Log cleared.";
  state.toolData.honey = "";
  saveToolOutput("honey", state.toolData.honey);
  });
}

function parseProxyHeaders(text) {
  const headers = [];
  const lines = (text || "").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const [key, ...rest] = trimmed.split(":");
    if (!key || !rest.length) return;
    const value = rest.join(":").trim();
    if (value) headers.push([key.trim(), value]);
  });
  return headers;
}

async function sendProxyRequest() {
  if (!proxyUrl || !proxyStatus || !proxyOutput) return;
  const url = proxyUrl.value.trim();
  const method = proxyMethod?.value || "GET";
  const headers = parseProxyHeaders(proxyHeaders?.value || "");
  const body = proxyBody?.value || "";
  if (!/^https?:\/\//i.test(url)) {
    proxyStatus.textContent = "Enter a valid http/https URL.";
    return;
  }
  const invoke = getTauriInvoke();
  if (!invoke) {
    proxyStatus.textContent = "Desktop helper unavailable; trying in-app fetch (CORS dependent)...";
    try {
      const controller = new AbortController();
      const resp = await fetch(url, {
        method,
        headers: Object.fromEntries(headers),
        body: ["GET", "HEAD"].includes(method.toUpperCase()) ? undefined : body,
        signal: controller.signal,
      });
      const text = await resp.text();
      const headerLines = Array.from(resp.headers.entries())
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
      proxyOutput.value = [`Status: ${resp.status} ${resp.statusText}`, headerLines, "", text].join(
        "\n"
      );
      proxyStatus.textContent = "Done (browser fetch).";
      state.toolData.proxy = proxyOutput.value;
      saveToolOutput("proxy", state.toolData.proxy);
      registerRun("Web proxy request sent", "proxy");
      return;
    } catch (err) {
      proxyStatus.textContent =
        "Desktop helper required (CORS blocked in browser). Please run the desktop app.";
      proxyOutput.value = err?.message || "Request failed.";
      return;
    }
  }
  proxyStatus.textContent = "Sending request...";
  proxyOutput.value = "";
  try {
    const response = await invoke("run_proxy_request", {
      url,
      method,
      headers,
      body: ["GET", "HEAD"].includes(method.toUpperCase()) ? "" : body,
    });
    const status = response?.status ?? "-";
    const reason = response?.reason || "";
    const resHeaders = response?.headers || [];
    const resBody = response?.body || "";
    const headerLines = resHeaders.map((h) => `${h[0]}: ${h[1]}`).join("\n");
    proxyOutput.value = [`Status: ${status} ${reason}`, headerLines, "", resBody].join("\n");
    proxyStatus.textContent = "Done.";
    state.toolData.proxy = proxyOutput.value;
    saveToolOutput("proxy", state.toolData.proxy);
    registerRun("Web proxy request sent", "proxy");
  } catch (error) {
    const message = error?.message || "Request failed.";
    proxyStatus.textContent = message;
    proxyOutput.value = message;
    console.error("Proxy request failed", error);
  }
}

if (proxySendBtn) {
  proxySendBtn.addEventListener("click", sendProxyRequest);
}

if (proxyClearBtn) {
  proxyClearBtn.addEventListener("click", () => {
    if (proxyUrl) proxyUrl.value = "";
    if (proxyHeaders) proxyHeaders.value = "";
    if (proxyBody) proxyBody.value = "";
    if (proxyOutput) proxyOutput.value = "";
    if (proxyStatus) proxyStatus.textContent = "Ready. HTTP/HTTPS only.";
  });
}

function openTerminal(open) {
  if (!terminalModal) return;
  terminalModal.classList.toggle("hidden", !open);
  if (open && terminalInput) {
    setTimeout(() => terminalInput.focus(), 50);
  }
}

if (terminalBtn) {
  terminalBtn.addEventListener("click", () => openTerminal(true));
}

if (friendChatBtn) {
  friendChatBtn.addEventListener("click", () => setActiveTool("chat"));
}

if (terminalCloseBtn) {
  terminalCloseBtn.addEventListener("click", () => openTerminal(false));
}

if (terminalClearBtn) {
  terminalClearBtn.addEventListener("click", () => {
    if (terminalInput) terminalInput.value = "";
    if (terminalOutput) terminalOutput.value = "";
  });
}

async function runTerminalCommand(cmd) {
  const invoke = getTauriInvoke();
  if (!invoke) {
    return "Terminal is available in the desktop app only.";
  }
  let finalCmd = cmd;
  const isWindows = navigator.userAgent.includes("Windows");
  if (/^ping\s+/i.test(cmd) && /-t\b/i.test(cmd)) {
    finalCmd = cmd.replace(/-t\b/gi, isWindows ? "-n 5" : "-c 5");
  }
  try {
    const result = await invoke("run_terminal", { cmd: finalCmd });
    const exitCode = result?.exit_code ?? result?.exitCode ?? -1;
    const output = (result?.output || "").trim();
    return output ? `${output}\n\nExit code: ${exitCode}` : `Exit code: ${exitCode}`;
  } catch (error) {
    return error?.message || "Terminal command failed.";
  }
}

if (terminalRunBtn) {
  terminalRunBtn.addEventListener("click", async () => {
    if (terminalBusy) return;
    const cmd = terminalInput?.value.trim() || "";
    if (!cmd) {
      if (terminalOutput) terminalOutput.value = "Enter a command to run.";
      return;
    }
    if (terminalOutput) terminalOutput.value = `Running: ${cmd}\n`;
    terminalBusy = true;
    terminalRunBtn.disabled = true;
    const result = await runTerminalCommand(cmd);
    if (terminalOutput) terminalOutput.value += result;
    terminalRunBtn.disabled = false;
    terminalBusy = false;
  });
}

function setSpeedTestActive(active) {
  speedTestActive = active;
  if (speedTestBtn) speedTestBtn.disabled = active;
  if (speedTestStopBtn) speedTestStopBtn.disabled = !active;
}

function formatMbps(value) {
  if (!Number.isFinite(value)) return "-";
  return `${value.toFixed(1)} Mbps`;
}

function formatMs(value) {
  if (!Number.isFinite(value)) return "-";
  return `${Math.round(value)} ms`;
}

const SPEED_GAUGE_MAX = 100;

function setSpeedGauge(label, value) {
  if (speedGaugeLabel) speedGaugeLabel.textContent = label;
  if (speedGaugeValue) {
    speedGaugeValue.textContent = Number.isFinite(value) ? value.toFixed(1) : "-";
  }
  if (!speedArc) return;
  const clamped = Math.max(0, Math.min(value || 0, SPEED_GAUGE_MAX));
  const offset = 1 - clamped / SPEED_GAUGE_MAX;
  speedArc.style.strokeDasharray = "1";
  speedArc.style.strokeDashoffset = `${offset}`;
  if (speedDot) {
    const t = clamped / SPEED_GAUGE_MAX;
    const angle = Math.PI * (1 + t);
    const cx = 160 + 140 * Math.cos(angle);
    const cy = 170 + 140 * Math.sin(angle);
    speedDot.setAttribute("cx", cx.toFixed(2));
    speedDot.setAttribute("cy", cy.toFixed(2));
  }
}

function resetSpeedGauge(label = "Ready") {
  setSpeedGauge(label, 0);
}

async function runTimedSpeedTest(label, sampleFn, durationMs, tickMs) {
  const samples = [];
  const start = performance.now();
  let nextTick = start;
  while (performance.now() - start < durationMs) {
    const value = await sampleFn();
    samples.push(value);
    setSpeedGauge(label, value);
    nextTick += tickMs;
    const waitMs = Math.max(0, nextTick - performance.now());
    if (waitMs) {
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
  const avg =
    samples.length > 0
      ? samples.reduce((sum, value) => sum + value, 0) / samples.length
      : 0;
  return avg;
}

async function runLatencySampler(durationMs, tickMs, signal) {
  const samples = [];
  const start = performance.now();
  let nextTick = start;
  while (performance.now() - start < durationMs) {
    // eslint-disable-next-line no-await-in-loop
    const value = await measureLatency(signal);
    samples.push(value);
    nextTick += tickMs;
    const waitMs = Math.max(0, nextTick - performance.now());
    if (waitMs) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
  const avg =
    samples.length > 0
      ? samples.reduce((sum, value) => sum + value, 0) / samples.length
      : 0;
  return avg;
}

async function measureDownload(bytes, signal) {
  const url = `https://speed.cloudflare.com/__down?bytes=${bytes}`;
  const start = performance.now();
  const response = await fetch(url, { cache: "no-store", signal });
  const buffer = await response.arrayBuffer();
  const duration = (performance.now() - start) / 1000;
  const size = buffer.byteLength || bytes;
  return (size * 8) / duration / 1e6;
}

async function measureUpload(bytes, signal) {
  const url = "https://speed.cloudflare.com/__up";
  const payload = new Uint8Array(bytes);
  for (let i = 0; i < payload.length; i += 1) {
    payload[i] = i % 256;
  }
  const attemptUpload = async (options) => {
    const start = performance.now();
    await fetch(url, {
      method: "POST",
      body: payload,
      cache: "no-store",
      signal,
      ...options,
    });
    const duration = Math.max((performance.now() - start) / 1000, 0.01);
    return (bytes * 8) / duration / 1e6;
  };
  try {
    return await attemptUpload({ headers: { "Content-Type": "application/octet-stream" } });
  } catch (error) {
    return await attemptUpload({ mode: "no-cors" });
  }
}

async function measureLatency(signal) {
  const url = "https://speed.cloudflare.com/__down?bytes=1000";
  const start = performance.now();
  await fetch(url, { cache: "no-store", signal });
  return performance.now() - start;
}

async function runSpeedTest() {
  if (!speedStatus) return;
  if (state.isOffline) {
    speedStatus.textContent = "Offline mode is enabled. Go online to test.";
    return;
  }
  if (speedTestActive) return;
  speedDownloadValue.textContent = "-";
  speedUploadValue.textContent = "-";
  speedLatencyValue.textContent = "-";
  resetSpeedGauge("Ready");
  speedStatus.textContent = "Running speed test...";
  setSpeedTestActive(true);
  speedAbortController = new AbortController();
  try {
    const latencyPromise = runLatencySampler(20000, 1000, speedAbortController.signal);
    setSpeedGauge("Testing download...", 0);
    const downloadAvg = await runTimedSpeedTest(
      "Testing download...",
      () => measureDownload(4000000, speedAbortController.signal),
      10000,
      1000
    );
    speedDownloadValue.textContent = formatMbps(downloadAvg);

    resetSpeedGauge("Testing upload...");
    const uploadAvg = await runTimedSpeedTest(
      "Testing upload...",
      () => measureUpload(2000000, speedAbortController.signal),
      10000,
      1000
    );
    speedUploadValue.textContent = formatMbps(uploadAvg);

    const latencyAvg = await latencyPromise;
    speedLatencyValue.textContent = formatMs(latencyAvg);

    resetSpeedGauge("Complete");
    speedStatus.textContent = "Speed test complete.";
    const publicIp = await fetchExternalIp();
    const speedGeo = await fetchGeoFromIp(publicIp);
    incrementGeoCountry(speedGeo.countryName);
    state.toolData.speed = `Down: ${formatMbps(downloadAvg)}, Up: ${formatMbps(
      uploadAvg
    )}, Latency: ${formatMs(latencyAvg)}`;
    saveToolOutput("speed", state.toolData.speed);
    registerRun("Speed test completed", "speed");
  } catch (error) {
    if (error.name === "AbortError") {
      speedStatus.textContent = "Speed test stopped.";
      resetSpeedGauge("Stopped");
    } else {
      speedStatus.textContent = error.message || "Speed test failed.";
      resetSpeedGauge("Failed");
    }
  } finally {
    setSpeedTestActive(false);
    speedAbortController = null;
  }
}

if (speedTestBtn) {
  speedTestBtn.addEventListener("click", runSpeedTest);
}

if (speedTestStopBtn) {
  speedTestStopBtn.addEventListener("click", () => {
    if (speedAbortController) {
      speedAbortController.abort();
    }
  });
}

function pickRandom(list) {
  if (!Array.isArray(list) || !list.length) return null;
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPrivateIp() {
  const block = pickRandom([
    () => `10.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`,
    () => `192.168.${randomInt(0, 1)}.${randomInt(1, 254)}`,
    () => `172.${randomInt(16, 31)}.${randomInt(0, 255)}.${randomInt(1, 254)}`,
  ]);
  return block ? block() : "192.168.0.10";
}

function randomPublicIp() {
  return `${randomInt(20, 223)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`;
}

function getPcapInterfaceLabel(iface) {
  const match = (pcapInterfaces || []).find((d) => d.name === iface);
  if (match) return match.description || match.name || iface || "auto";
  if (!iface) return "auto";
  if (iface.includes("\\NPF_")) return iface.split("\\").pop();
  return iface;
}

function randomHostPair() {
  const inside = randomPrivateIp();
  const outside = randomPublicIp();
  return Math.random() > 0.5 ? [inside, outside] : [outside, inside];
}

function randomDomain() {
  const domains = ["example.com", "cyberkit.dev", "updates.local", "cdn.edge.net", "secops.lan"];
  return pickRandom(domains) || "example.com";
}

function getSelectedPcapProtocols() {
  return Array.from(pcapProtocolFilters || [])
    .filter((box) => box.checked)
    .map((box) => box.value);
}

function ensurePcapListeners() {
  const listen = getTauriEventListen();
  if (!listen) return;
  if (!pcapUnlistenPacket) {
    listen("pcap_packet", (event) => {
      const payload = event?.payload?.payload ?? event?.payload;
      if (payload && typeof payload === "object") {
        addPcapPacket(payload);
        if (pcapStatus) {
          pcapStatus.textContent = `Capturing... ${pcapPackets.length} packets`;
        }
      } else if (typeof payload === "string") {
        try {
          const parsed = JSON.parse(payload);
          addPcapPacket(parsed);
        } catch {
          if (pcapStatus) {
            pcapStatus.textContent = `Capture running (payload: ${payload})`;
          }
        }
      }
      console.log("pcap_packet", payload);
    }).then((un) => {
      pcapUnlistenPacket = un;
    });
  }
  if (!pcapUnlistenStatus) {
    listen("pcap_status", (event) => {
      const payload = event?.payload?.payload ?? event?.payload;
      if (pcapStatus) {
        pcapStatus.textContent = payload || "Capture status update.";
      }
      console.log("pcap_status", payload);
      if (typeof payload === "string" && payload.toLowerCase().includes("stopped")) {
        pcapActive = false;
        setPcapActive(false);
        pcapDurationMs = pcapStartedAt ? Date.now() - pcapStartedAt : 0;
        pcapStartedAt = 0;
        renderPcapStats();
      } else if (typeof payload === "string" && payload.toLowerCase().includes("running")) {
        setPcapActive(true);
        if (pcapStatus) {
          pcapStatus.textContent = payload;
        }
      }
    }).then((un) => {
      pcapUnlistenStatus = un;
    });
  }
  if (!pcapUnlistenError) {
    listen("pcap_error", (event) => {
      const payload = event?.payload?.payload ?? event?.payload;
      if (pcapStatus) {
        pcapStatus.textContent = payload || "Capture error.";
      }
      console.error("pcap_error", payload);
      setPcapActive(false);
    }).then((un) => {
      pcapUnlistenError = un;
    });
  }
}

async function ensureNpcapReady() {
  const invoke = getTauriInvoke();
  if (!invoke || !hasNativePcap) {
    return { installed: false, message: "Native capture unavailable." };
  }
  if (npcapReady) {
    return { installed: true, message: "Npcap already ready." };
  }
  try {
    if (pcapStatus) {
      pcapStatus.textContent = "Checking Npcap...";
    }
    const status = await invoke("ensure_npcap");
    if (status?.installed) {
      npcapReady = true;
    }
    if (pcapStatus && status?.message && status.installed) {
      pcapStatus.textContent = status.message;
    }
    return status || { installed: false };
  } catch (error) {
    console.warn("ensure_npcap failed", error);
    const message =
      error?.message || "Npcap not available. Run as Administrator or install Npcap manually.";
    if (pcapStatus) {
      pcapStatus.textContent = message;
    }
    return { installed: false, message };
  }
}

async function loadPcapInterfaces(options = {}) {
  const quiet = options?.quiet || false;
  const invoke = getTauriInvoke();
  if (!invoke) return [];
  if (hasNativePcap) {
    const prep = await ensureNpcapReady();
    if (!prep?.installed) {
    if (pcapStatus) {
      pcapStatus.textContent =
        prep?.message || "Npcap not available. Run as Administrator or install Npcap, then retry.";
    }
      if (pcapInfoPanel) pcapInfoPanel.removeAttribute("hidden");
      return [];
    }
    if (!quiet && pcapStatus) {
      pcapStatus.textContent = prep?.message || "Npcap ready. Loading interfaces...";
    }
  }
  try {
    if (!quiet && pcapStatus) {
      pcapStatus.textContent = "Loading capture interfaces...";
    }
    let devices = await invoke("pcap_interfaces");
    pcapInterfaces = devices || [];
    const priority = ["realtek", "ethernet", "wifi", "wi-fi", "wireless", "wlan"];
    devices = (devices || []).sort((a, b) => {
      const adesc = (a.description || a.name || "").toLowerCase();
      const bdesc = (b.description || b.name || "").toLowerCase();
      const aPri = priority.findIndex((k) => adesc.includes(k));
      const bPri = priority.findIndex((k) => bdesc.includes(k));
      const aScore = aPri === -1 ? 99 : aPri;
      const bScore = bPri === -1 ? 99 : bPri;
      return aScore === bScore ? adesc.localeCompare(bdesc) : aScore - bScore;
    });
    const count = devices?.length || 0;
    console.log("pcap_interfaces loaded:", count, devices);
    if (pcapStatus) {
      pcapStatus.textContent =
        count > 0
          ? `Native capture ready. ${count} interface(s) detected. Pick one and click Start.`
          : "No capture interfaces found. Ensure Npcap is installed/running (try Refresh, run as Admin, or run 'tshark -D').";
    }
    if (pcapInterfacesList) {
      pcapInterfacesList.innerHTML = "";
      devices.forEach((item) => {
        const name = item?.name || item;
        const option = document.createElement("option");
        option.value = name;
        pcapInterfacesList.appendChild(option);
      });
    }
    if (pcapInterfaceSelect) {
      pcapInterfaceSelect.innerHTML = "";
      const autoOpt = document.createElement("option");
      autoOpt.value = "auto";
      autoOpt.textContent = "auto (any available interface)";
      pcapInterfaceSelect.appendChild(autoOpt);
      devices.forEach((item, idx) => {
        const opt = document.createElement("option");
        opt.value = item.name;
        opt.textContent = item.description || item.name || "Interface";
        pcapInterfaceSelect.appendChild(opt);
        if (idx === 0) {
          pcapInterfaceSelect.value = item.name;
          pcapSelectedInterface = item.name;
        }
      });
    }
    if (pcapInterfaceList) {
      pcapInterfaceList.innerHTML = "";
      devices.forEach((item) => {
        const row = document.createElement("div");
        row.className = "pcap-interface-row";
        row.dataset.iface = item.name;
        row.innerHTML = `
          <div class="pcap-iface-name">${item.description || item.name || "Interface"}</div>
          <div class="pcap-iface-desc">${item.name || ""}</div>
        `;
        row.addEventListener("click", () => {
          pcapSelectedInterface = item.name;
          if (pcapInterfaceSelect) pcapInterfaceSelect.value = item.name;
          highlightSelectedInterface();
          if (pcapStatus) {
            pcapStatus.textContent = `Selected interface: ${item.name}`;
          }
        });
        row.addEventListener("dblclick", () => {
          pcapSelectedInterface = item.name;
          if (pcapInterfaceSelect) pcapInterfaceSelect.value = item.name;
          highlightSelectedInterface();
          startPacketCapture();
        });
        pcapInterfaceList.appendChild(row);
      });
      highlightSelectedInterface();
      if (!devices.length && pcapInterfaceList) {
        pcapInterfaceList.style.display = "none";
        if (pcapInfoPanel) pcapInfoPanel.removeAttribute("hidden");
      } else if (pcapInterfaceList) {
        pcapInterfaceList.style.display = "grid";
      }
    }
    return devices;
  } catch (error) {
    console.warn("Unable to load pcap interfaces:", error);
    if (pcapStatus) {
      pcapStatus.textContent = "Failed to load interfaces. Check Npcap/TShark install (try 'tshark -D').";
    }
    return [];
  }
}

function highlightSelectedInterface() {
  if (!pcapInterfaceList) return;
  const rows = pcapInterfaceList.querySelectorAll(".pcap-interface-row");
  rows.forEach((row) => {
    const active = row.dataset.iface === pcapSelectedInterface;
    row.classList.toggle("active", active);
  });
}

function getPcapSummary() {
  const counts = {};
  let bytes = 0;
  pcapPackets.forEach((packet) => {
    counts[packet.protocol] = (counts[packet.protocol] || 0) + 1;
    bytes += packet.length || 0;
  });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || [];
  const spanMs = pcapStartedAt ? Date.now() - pcapStartedAt : pcapDurationMs;
  const durationSec = Math.max(1, spanMs / 1000);
  const pps = pcapPackets.length / durationSec;
  const bps = (bytes * 8) / durationSec;
  return {
    counts,
    bytes,
    pps,
    bps,
    topProto: top[0] || null,
    topCount: top[1] || 0,
    summaryText: `Packets: ${pcapPackets.length}, Top: ${top[0] || "-"}, Bytes: ${bytes}`,
  };
}

function renderPcapStats() {
  const data = getPcapSummary();
  state.toolData.pcap = data.summaryText;
  saveToolOutput("pcap", state.toolData.pcap);
  if (!pcapStats) return;
  pcapStats.innerHTML = "";
  const cards = [
    { label: "Packets", value: pcapPackets.length.toString(), hint: `${data.pps.toFixed(1)} packets/sec` },
    {
      label: "Data moved",
      value: `${(data.bytes / 1024).toFixed(1)} KB`,
      hint: `${(data.bps / 1000).toFixed(1)} Kbps est.`,
    },
    {
      label: "Top protocol",
      value: data.topProto ? `${data.topProto}` : "-",
      hint: data.topProto ? `${data.topCount} seen` : "Waiting for traffic",
    },
  ];
  cards.forEach((card) => {
    const item = document.createElement("div");
    item.className = "pcap-stat";
    item.innerHTML = `
      <p class="label">${card.label}</p>
      <p class="value">${card.value}</p>
      <p class="hint">${card.hint}</p>
    `;
    pcapStats.appendChild(item);
  });
}

function renderPcapFeed() {
  if (!pcapFeed) return;
  pcapFeed.innerHTML = "";
  const header = document.createElement("div");
  header.className = "pcap-row header";
  header.innerHTML = `
    <div>Time</div>
    <div>Source</div>
    <div>Destination</div>
    <div>Protocol</div>
    <div>Bytes</div>
    <div>Info</div>
  `;
  pcapFeed.appendChild(header);
  if (!pcapPackets.length) {
    const empty = document.createElement("div");
    empty.className = "pcap-empty";
    empty.textContent = "No packets captured yet.";
    pcapFeed.appendChild(empty);
    return;
  }
  pcapPackets.slice(0, 80).forEach((packet) => {
    const row = document.createElement("div");
    row.className = "pcap-row";
    row.innerHTML = `
      <div>${packet.time}</div>
      <div>${packet.src}</div>
      <div>${packet.dest}</div>
      <div><span class="pcap-proto">${packet.protocol}</span></div>
      <div class="pcap-byte">${packet.length} B</div>
      <div>${packet.info}</div>
    `;
    pcapFeed.appendChild(row);
  });
}

function getSavedPcaps() {
  try {
    const raw = localStorage.getItem(PCAP_SAVES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistSavedPcaps(list) {
  localStorage.setItem(PCAP_SAVES_KEY, JSON.stringify(list.slice(0, 10)));
}

function refreshSavedSelect() {
  // legacy noop (dropdown removed)
}

function saveCurrentCapture() {
  if (!pcapPackets || !pcapPackets.length) {
    if (pcapStatus) pcapStatus.textContent = "No packets to save.";
    return;
  }
  const saved = getSavedPcaps();
  const ts = new Date().toISOString();
  const label = `Capture ${new Date().toLocaleString()}`;
  const snapshot = {
    id: `pcap-${Date.now()}`,
    label,
    packets: pcapPackets.slice(0, PCAP_MAX_PACKETS),
    savedAt: ts,
  };
  saved.unshift(snapshot);
  if (saved.length > 3) saved.length = 3; // enforce limit
  persistSavedPcaps(saved);
  refreshSavedSelect();
  if (pcapStatus) pcapStatus.textContent = `Saved capture: ${label}`;
  // Attempt to store in Firestore (best effort)
  if (db && auth?.currentUser && !isGuestUser()) {
    const ref = doc(db, "pcapCaptures", auth.currentUser.uid);
    setDoc(ref, { captures: saved }, { merge: true }).catch((err) =>
      console.warn("Unable to store capture in Firestore:", err)
    );
  }
}

function loadSavedCapture(id) {
  if (!id) return;
  let saved = getSavedPcaps();
  // Try Firestore if available
  if (db && auth?.currentUser && !isGuestUser()) {
    const ref = doc(db, "pcapCaptures", auth.currentUser.uid);
    getDoc(ref)
      .then((snap) => {
        if (snap.exists()) {
          saved = snap.data()?.captures || saved;
        }
        const item = saved.find((entry) => entry.id === id);
        if (!item) {
          if (pcapStatus) pcapStatus.textContent = "Saved capture not found.";
          return;
        }
        pcapPackets = Array.isArray(item.packets) ? item.packets.slice() : [];
        pcapDurationMs = 0;
        pcapStartedAt = 0;
        setPcapActive(false);
        renderPcapFeed();
        renderPcapStats();
        if (pcapStatus) {
          pcapStatus.textContent = `Loaded saved capture: ${item.label || id}`;
        }
      })
      .catch(() => {
        const fallback = saved.find((entry) => entry.id === id);
        if (!fallback) {
          if (pcapStatus) pcapStatus.textContent = "Saved capture not found.";
          return;
        }
        pcapPackets = Array.isArray(fallback.packets) ? fallback.packets.slice() : [];
        pcapDurationMs = 0;
        pcapStartedAt = 0;
        setPcapActive(false);
        renderPcapFeed();
        renderPcapStats();
        if (pcapStatus) {
          pcapStatus.textContent = `Loaded saved capture: ${fallback.label || id}`;
        }
      });
    return;
  }
  const item = saved.find((entry) => entry.id === id);
  if (!item) {
    if (pcapStatus) pcapStatus.textContent = "Saved capture not found.";
    return;
  }
  pcapPackets = Array.isArray(item.packets) ? item.packets.slice() : [];
  pcapDurationMs = 0;
  pcapStartedAt = 0;
  setPcapActive(false);
  renderPcapFeed();
  renderPcapStats();
  if (pcapStatus) {
    pcapStatus.textContent = `Loaded saved capture: ${item.label || id}`;
  }
}

function openPcapSavedModal() {
  if (!pcapSavedModal) return;
  renderSavedCapturesModal();
  pcapSavedModal.classList.remove("hidden");
}

function closePcapSavedModal() {
  if (!pcapSavedModal) return;
  pcapSavedModal.classList.add("hidden");
}

function renderSavedCapturesModal() {
  if (!pcapSavedList) return;
  const saved = getSavedPcaps();
  pcapSavedList.innerHTML = "";
  if (!saved.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No saved captures.";
    pcapSavedList.appendChild(empty);
    return;
  }
  saved.forEach((item) => {
    const row = document.createElement("div");
    row.className = "pcap-saved-row";
    row.innerHTML = `
      <input type="checkbox" data-saved-id="${item.id}">
      <div class="meta">
        <span class="label">${item.label || item.id}</span>
        <span>${item.savedAt || ""}</span>
        <span>${(item.packets || []).length} packets</span>
      </div>
      <button class="chip" data-load-saved="${item.id}">Load</button>
    `;
    const loadBtn = row.querySelector("[data-load-saved]");
    if (loadBtn) {
      loadBtn.addEventListener("click", () => {
        closePcapSavedModal();
        loadSavedCapture(item.id);
      });
    }
    pcapSavedList.appendChild(row);
  });
}

function getSelectedSavedIds() {
  if (!pcapSavedList) return [];
  const boxes = pcapSavedList.querySelectorAll('input[type="checkbox"][data-saved-id]');
  return Array.from(boxes)
    .filter((box) => box.checked)
    .map((box) => box.dataset.savedId);
}

function toggleAllSavedPcaps(checked) {
  if (!pcapSavedList) return;
  const boxes = pcapSavedList.querySelectorAll('input[type="checkbox"][data-saved-id]');
  boxes.forEach((box) => {
    box.checked = Boolean(checked);
  });
}

function deleteSelectedSavedPcaps() {
  const ids = getSelectedSavedIds();
  if (!ids.length) return;
  let saved = getSavedPcaps();
  saved = saved.filter((item) => !ids.includes(item.id));
  persistSavedPcaps(saved);
  renderSavedCapturesModal();
  if (pcapStatus) pcapStatus.textContent = `Deleted ${ids.length} saved capture(s).`;
  if (db && auth?.currentUser && !isGuestUser()) {
    const ref = doc(db, "pcapCaptures", auth.currentUser.uid);
    setDoc(ref, { captures: saved }, { merge: true }).catch((err) =>
      console.warn("Unable to update captures in Firestore:", err)
    );
  }
}

function buildPcapBuffer(packets) {
  const caplen = 60; // minimal packet size
  const global = new ArrayBuffer(24);
  const dv = new DataView(global);
  dv.setUint32(0, 0xa1b2c3d4, false); // magic
  dv.setUint16(4, 2, false); // version major
  dv.setUint16(6, 4, false); // version minor
  dv.setInt32(8, 0, false); // thiszone
  dv.setUint32(12, 0, false); // sigfigs
  dv.setUint32(16, 65535, false); // snaplen
  dv.setUint32(20, 1, false); // linktype ethernet

  const chunks = [new Uint8Array(global)];
  const now = Date.now();

  (packets || []).forEach((p, idx) => {
    const ts = Math.floor((now + idx) / 1000);
    const usec = ((now + idx) % 1000) * 1000;
    const rec = new ArrayBuffer(16);
    const rdv = new DataView(rec);
    rdv.setUint32(0, ts, false);
    rdv.setUint32(4, usec, false);
    rdv.setUint32(8, caplen, false);
    rdv.setUint32(12, caplen, false);
    const payload = new Uint8Array(caplen);
    chunks.push(new Uint8Array(rec));
    chunks.push(payload);
  });

  const totalLen = chunks.reduce((sum, arr) => sum + arr.length, 0);
  const out = new Uint8Array(totalLen);
  let offset = 0;
  chunks.forEach((arr) => {
    out.set(arr, offset);
    offset += arr.length;
  });
  return out.buffer;
}

function buildPcapngBuffer(packets) {
  const chunks = [];

  const writeBlock = (type, body) => {
    const totalLen = 12 + body.length;
    const padLen = (4 - (totalLen % 4)) % 4;
    const fullLen = totalLen + padLen;
    const buf = new ArrayBuffer(fullLen);
    const dv = new DataView(buf);
    dv.setUint32(0, type, true);
    dv.setUint32(4, fullLen, true);
    new Uint8Array(buf, 8, body.length).set(body);
    dv.setUint32(fullLen - 4, fullLen, true);
    return new Uint8Array(buf);
  };

  // Section Header Block
  const shbBody = new Uint8Array(16);
  const shbDv = new DataView(shbBody.buffer);
  shbDv.setUint32(0, 0x1a2b3c4d, true); // byte-order magic
  shbDv.setUint16(4, 1, true); // major
  shbDv.setUint16(6, 0, true); // minor
  shbDv.setUint64?.(8, 0xffffffffffffffffn, true);
  if (!shbDv.setUint64) {
    // fallback for environments without BigInt setters
    shbDv.setUint32(8, 0xffffffff, true);
    shbDv.setUint32(12, 0xffffffff, true);
  }
  chunks.push(writeBlock(0x0a0d0d0a, shbBody));

  // Interface Description Block
  const idbBody = new Uint8Array(8);
  const idbDv = new DataView(idbBody.buffer);
  idbDv.setUint16(0, 1, true); // linktype ethernet
  idbDv.setUint16(2, 0, true); // reserved
  idbDv.setUint32(4, 65535, true); // snaplen
  chunks.push(writeBlock(1, idbBody));

  // Packets as Enhanced Packet Blocks
  const now = Date.now();
  (packets || []).forEach((p, idx) => {
    const caplen = 60;
    const epbBody = new Uint8Array(20 + caplen);
    const epbDv = new DataView(epbBody.buffer);
    epbDv.setUint32(0, 0, true); // interface id
    const ts = now + idx;
    epbDv.setUint32(4, Math.floor(ts / 1000), true); // timestamp high
    epbDv.setUint32(8, (ts % 1000) * 1000000, true); // timestamp low (ns-ish)
    epbDv.setUint32(12, caplen, true); // captured len
    epbDv.setUint32(16, caplen, true); // original len
    // payload already zeroed
    chunks.push(writeBlock(6, epbBody));
  });

  const total = chunks.reduce((s, c) => s + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  chunks.forEach((c) => {
    out.set(c, offset);
    offset += c.length;
  });
  return out.buffer;
}
function exportCurrentCapture(format = "json") {
  if (!pcapPackets || !pcapPackets.length) {
    if (pcapStatus) pcapStatus.textContent = "No packets to export.";
    return;
  }
  if (format === "json") {
    const blob = new Blob([JSON.stringify(pcapPackets, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `capture-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (pcapStatus) pcapStatus.textContent = "Exported capture as JSON.";
    return;
  }
  if (format === "csv") {
    const header = ["time", "src", "dest", "protocol", "length", "info"];
    const rows = pcapPackets.map((p) =>
      header
        .map((key) => {
          const val = p[key] ?? "";
          const safe = String(val).replace(/\"/g, '""');
          return `"${safe}"`;
        })
        .join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `capture-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    if (pcapStatus) pcapStatus.textContent = "Exported capture as CSV.";
    return;
  }
  if (format === "pcap" || format === "pcapng") {
    const buffer = format === "pcapng" ? buildPcapngBuffer(pcapPackets) : buildPcapBuffer(pcapPackets);
    const blob = new Blob([buffer], {
      type: format === "pcapng" ? "application/octet-stream" : "application/vnd.tcpdump.pcap",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `capture-${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    if (pcapStatus) pcapStatus.textContent = `Exported capture as ${format}.`;
    return;
  }
}

// Expose lightweight debug helpers for DevTools
if (typeof window !== "undefined") {
  window._pcapDebug = {
    get packets() {
      return pcapPackets;
    },
    renderFeed: () => renderPcapFeed(),
    renderStats: () => renderPcapStats(),
    start: (iface, protocols = ["TCP", "UDP", "ICMP"], bpf = null) =>
      startPacketCaptureWith(iface, protocols, bpf),
    stop: () => {
      stopPacketCapture("Stopped via _pcapDebug.stop()", false);
    },
    saves: () => getSavedPcaps(),
    loadSave: (id) => loadSavedCapture(id),
  };
}

// Direct invoke helper to start capture (used by _pcapDebug.start)
async function startPacketCaptureWith(iface, protocols = ["TCP", "UDP", "ICMP"], bpfFilter = null) {
  const invoke = getTauriInvoke();
  if (!invoke || !hasNativePcap) {
    if (pcapStatus) pcapStatus.textContent = "Native capture unavailable.";
    return;
  }
  const npcapStatus = await ensureNpcapReady();
  if (!npcapStatus?.installed) {
    if (pcapStatus) {
      pcapStatus.textContent =
        npcapStatus?.message ||
        "Npcap not available. Install it (requires Administrator) and restart capture.";
    }
    return;
  }
  ensurePcapListeners();
  pcapSelectedInterface = iface || "auto";
  pcapPackets = [];
  renderPcapFeed();
  renderPcapStats();
  setPcapActive(true);
  pcapStartedAt = Date.now();
  pcapDurationMs = 0;
  if (pcapStatus) {
    const label = getPcapInterfaceLabel(pcapSelectedInterface);
    pcapStatus.textContent = `Starting capture on ${label} (${protocols.join(", ")})...`;
  }
  try {
    await invoke("pcap_start", {
      interface: iface && iface !== "auto" ? iface : null,
      protocols,
      bpfFilter: bpfFilter || null,
    });
    if (pcapStatus) {
      const label = getPcapInterfaceLabel(pcapSelectedInterface);
      pcapStatus.textContent = `Capturing on ${label} (${protocols.join(", ")})...`;
    }
  } catch (error) {
    console.error("pcap_start (debug) failed:", error);
    setPcapActive(false);
    if (pcapStatus) {
      pcapStatus.textContent = error?.message || "Failed to start capture.";
    }
  }
}

function setChatStatus(message) {
  if (chatStatus) {
    chatStatus.textContent = message;
  }
}

function renderChatHandle() {
  if (!chatHandleDisplay) return;
  if (isGuestUser()) {
    chatHandleDisplay.textContent = "Guest mode (chat disabled)";
    setChatStatus("Create an account to use chat and collaboration features.");
    const guestNotice = document.getElementById("guestNotice");
    if (guestNotice) guestNotice.classList.remove("hidden");
    return;
  }
  const guestNotice = document.getElementById("guestNotice");
  if (guestNotice) guestNotice.classList.add("hidden");
  if (state.userHandle?.handle) {
    chatHandleDisplay.textContent = state.userHandle.handle;
    const badge = document.getElementById("userHandleBadge");
    if (badge) badge.textContent = `Handle: ${state.userHandle.handle}`;
    if (chatStatus && (!chatStatus.textContent || chatStatus.textContent === "Ready.")) {
      chatStatus.textContent = `Your handle: ${state.userHandle.handle}. Share it to invite friends.`;
    }
  } else {
    chatHandleDisplay.textContent = "Handle not ready";
    const badge = document.getElementById("userHandleBadge");
    if (badge) badge.textContent = "";
  }
}

function buildBaseUsername() {
  const display = auth.currentUser?.displayName || "";
  const emailLocal = (auth.currentUser?.email || "").split("@")[0] || "";
  const raw = display || emailLocal || "user";
  const cleaned = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (cleaned) return cleaned.slice(0, 12);
  const uid = auth.currentUser?.uid || "user";
  return `user${uid.slice(-4)}`;
}

async function ensureUserHandle() {
  if (!auth.currentUser || isGuestUser()) {
    setChatStatus("Create an account to use chat handles and messaging.");
    return null;
  }
  if (state.userHandle?.uid === auth.currentUser.uid && state.userHandle?.handle) {
    return state.userHandle;
  }
  const ref = doc(db, "userHandles", auth.currentUser.uid);
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() || {};
      const handleValue =
        data.handle || (data.username && data.code ? `${data.username}#${data.code}` : "");
      const handleLower = (handleValue || "").toLowerCase();
      state.userHandle = {
        uid: auth.currentUser.uid,
        username: data.username || "",
        code: data.code || "",
        handle: handleValue,
        handleLower,
        email: data.email || auth.currentUser.email || "",
      };
      if (handleValue && (!data.handle || !data.handleLower)) {
        await setDoc(
          ref,
          { handle: handleValue, handleLower, updatedAt: Timestamp.now() },
          { merge: true }
        );
      }
      renderChatHandle();
      return state.userHandle;
    }
  } catch (error) {
    console.warn("Unable to load user handle", error);
  }
  const base = buildBaseUsername();
  const tryReserveHandle = async (candidate) => {
    const handleLower = candidate.toLowerCase();
    const clash = await getDocs(
      query(collection(db, "userHandles"), where("handleLower", "==", handleLower))
    );
    if (clash.size) return null;
    const payload = {
      uid: auth.currentUser.uid,
      username: base,
      usernameLower: base.toLowerCase(),
      code: candidate.split("#")[1] || "",
      handle: candidate,
      handleLower,
      email: auth.currentUser.email || "",
      emailLower: (auth.currentUser.email || "").toLowerCase(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    await setDoc(ref, payload, { merge: true });
    state.userHandle = payload;
    renderChatHandle();
    return state.userHandle;
  };

  // Try random 4-digit discriminator first
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    const handle = `${base}#${code}`;
    try {
      const reserved = await tryReserveHandle(handle);
      if (reserved) return reserved;
    } catch (error) {
      console.warn("Handle generation attempt failed", error);
    }
  }

  // Fallback: UID-based discriminator to guarantee uniqueness
  const uidTail = (auth.currentUser.uid || "").slice(-6) || String(Date.now());
  const fallbackHandle = `${base}#${uidTail}`;
  try {
    const reserved = await tryReserveHandle(fallbackHandle);
    if (reserved) return reserved;
  } catch (error) {
    console.warn("Handle fallback generation failed", error);
  }

  setChatStatus("Unable to generate a unique handle. Try again shortly.");
  return null;
}

function parseChatHandle(input) {
  const raw = (input || "").trim();
  if (!raw || !raw.includes("#")) return null;
  const [name, code] = raw.split("#");
  const username = (name || "").replace(/[^a-z0-9]/gi, "").toLowerCase();
  const cleanCode = (code || "").trim();
  if (!username || !cleanCode) return null;
  const handle = `${username}#${cleanCode}`;
  return { username, code: cleanCode, handle, handleLower: handle.toLowerCase() };
}

async function findUserByHandle(handleLower) {
  if (isGuestUser()) {
    setChatStatus("Create an account to search and invite other users.");
    return null;
  }
  if (!handleLower) return null;
  try {
    const snap = await getDocs(
      query(collection(db, "userHandles"), where("handleLower", "==", handleLower))
    );
    if (!snap.size) return null;
    const docSnap = snap.docs[0];
    const data = docSnap.data() || {};
    return {
      uid: docSnap.id,
      handle: data.handle,
      handleLower: data.handleLower,
      email: data.email || "",
    };
  } catch (error) {
    console.warn("Lookup handle failed", error);
    return null;
  }
}

function getChatIdentityKey() {
  return (
    state.userHandle?.handleLower ||
    auth.currentUser?.email?.toLowerCase() ||
    (state.userHandle?.handle || "").toLowerCase()
  );
}

function renderChatInvites() {
  if (!chatInviteList) return;
  chatInviteList.innerHTML = "";
  if (!state.chat.invites.length) {
    const empty = document.createElement("div");
    empty.className = "chat-empty";
    empty.textContent = "No invites yet.";
    chatInviteList.appendChild(empty);
    return;
  }
  state.chat.invites.forEach((invite) => {
    const row = document.createElement("div");
    row.className = "chat-invite";
    row.innerHTML = `
      <div>
        <div><strong>${invite.fromHandle || invite.fromEmail || "Unknown"}</strong></div>
        <div>${invite.message || "Chat invite"}</div>
      </div>
      <div class="chat-buttons">
        <button class="primary" data-invite-action="accept" data-invite-id="${invite.id}">Accept</button>
        <button class="ghost" data-invite-action="decline" data-invite-id="${invite.id}">Decline</button>
      </div>
    `;
    chatInviteList.appendChild(row);
  });
}

function renderChatList() {
  if (!chatActiveSelect) return;
  chatActiveSelect.innerHTML = "";
  const entries = Object.entries(state.chat.chats || {});
  if (!entries.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "No active chats";
    chatActiveSelect.appendChild(opt);
    return;
  }
  entries.forEach(([id, chat]) => {
    const opt = document.createElement("option");
    opt.value = id;
    const selfKey = getChatIdentityKey();
    const altKey = (auth.currentUser?.email || "").toLowerCase();
    const other = (chat.participants || []).find((p) => {
      const key = (p || "").toLowerCase();
      return key !== selfKey && key !== altKey;
    });
    opt.textContent = other || id;
    chatActiveSelect.appendChild(opt);
  });
  if (state.chat.activeChatId && state.chat.chats[state.chat.activeChatId]) {
    chatActiveSelect.value = state.chat.activeChatId;
  } else {
    chatActiveSelect.value = entries[0][0];
    state.chat.activeChatId = entries[0][0];
  }
}

function renderChatMessages() {
  if (!chatMessageList) return;
  chatMessageList.innerHTML = "";
  const activeId = state.chat.activeChatId;
  if (!activeId || !state.chat.chats[activeId]) {
    const empty = document.createElement("div");
    empty.className = "chat-empty";
    empty.textContent = "Start a chat to see messages.";
    chatMessageList.appendChild(empty);
    return;
  }
  const messages = state.chat.chats[activeId].messages || [];
  if (!messages.length) {
    const empty = document.createElement("div");
    empty.className = "chat-empty";
    empty.textContent = "No messages yet.";
    chatMessageList.appendChild(empty);
    return;
  }
  const meKeys = new Set([
    getChatIdentityKey(),
    (auth.currentUser?.email || "").toLowerCase(),
    (state.userHandle?.handle || "").toLowerCase(),
  ]);
  messages.forEach((msg) => {
    const bubble = document.createElement("div");
    const fromKey = (msg.from || "").toLowerCase();
    const isMe = meKeys.has(fromKey);
    bubble.className = `chat-bubble${isMe ? " me" : ""}`;
    bubble.innerHTML = `
      <div>${msg.text || ""}</div>
      <div class="chat-meta">
        <span>${msg.from || "Unknown"}</span>
        <span>${msg.time || ""}</span>
      </div>
    `;
    chatMessageList.appendChild(bubble);
  });
}

function stopChatListeners() {
  if (chatInvitesUnsub) {
    chatInvitesUnsub();
    chatInvitesUnsub = null;
  }
  if (chatRoomsUnsub) {
    chatRoomsUnsub();
    chatRoomsUnsub = null;
  }
  if (chatMessagesUnsub) {
    chatMessagesUnsub();
    chatMessagesUnsub = null;
  }
  chatMessagesChatId = null;
}

function subscribeToChatInvites() {
  if (isGuestUser()) {
    setChatStatus("Sign up to receive chat invites.");
    return;
  }
  if (chatInvitesUnsub) {
    chatInvitesUnsub();
    chatInvitesUnsub = null;
  }
  const handleKey = getChatIdentityKey();
  if (!handleKey) return;
  const qInv = query(collection(db, "chatInvites"), where("toHandleLower", "==", handleKey));
  chatInvitesUnsub = onSnapshot(
    qInv,
    (snap) => {
      const previousIds = new Set(state.chat.invites.map((item) => item.id));
      state.chat.invites = snap.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        .filter((invite) => invite.status === "pending")
        .sort((a, b) => {
          const at = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const bt = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return bt - at;
        });
      renderChatInvites();
      state.chat.invites.forEach((invite) => {
        if (!previousIds.has(invite.id)) {
          addNotification(
            `Chat invite from ${invite.fromHandle || invite.fromEmail || "someone"}. Accept to start chatting.`,
            { inviteId: invite.id, inviteFrom: invite.fromHandle || invite.fromEmail || "" }
          );
        }
      });
    },
    (error) => {
      console.warn("Chat invite listener failed", error);
      setChatStatus("Unable to subscribe to invites.");
    }
  );
}

function subscribeToChatMessages(chatId) {
  if (isGuestUser()) {
    setChatStatus("Sign up to view chat messages.");
    return;
  }
  if (!chatId) return;
  if (chatMessagesUnsub) {
    chatMessagesUnsub();
    chatMessagesUnsub = null;
  }
  const ref = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt", "desc")
  );
  chatMessagesChatId = chatId;
  chatMessagesUnsub = onSnapshot(
    ref,
    (snap) => {
      const msgs = snap.docs.map((docSnap) => {
        const data = docSnap.data();
        const ts = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
        return {
          id: docSnap.id,
          text: data.text || "",
          from: data.from,
          time: ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      });
      state.chat.chats[chatId] = state.chat.chats[chatId] || { participants: [] };
      state.chat.chats[chatId].messages = msgs.reverse();
      renderChatMessages();
    },
    (error) => {
      console.warn("Chat message listener failed", error);
      setChatStatus("Unable to load messages.");
    }
  );
}

async function ensureChatDoc(invite, targetEmail) {
  if (!auth.currentUser || isGuestUser()) {
    setChatStatus("Create an account to start chats.");
    return null;
  }
  const chatId = invite?.chatId || invite?.id || `chat-${Date.now()}`;
  const selfHandle = state.userHandle?.handle || auth.currentUser.email;
  const selfHandleLower =
    state.userHandle?.handleLower || auth.currentUser?.email?.toLowerCase() || "";
  const otherHandle = (targetEmail || invite?.fromHandle || invite?.toHandle || invite?.fromEmail || "")
    .toString()
    .trim();
  const otherHandleLower = otherHandle.toLowerCase();
  const selfEmailLower = (auth.currentUser.email || "").toLowerCase();
  const otherEmailLower = (invite?.fromEmail || invite?.toEmail || invite?.to || "").toLowerCase();
  const participants = [selfHandle, otherHandle || "friend"].filter(Boolean);
  const searchKeys = Array.from(
    new Set(
      [selfHandleLower, otherHandleLower, selfEmailLower, otherEmailLower]
        .map((val) => val || "")
        .filter(Boolean)
    )
  );
  await setDoc(
    doc(db, "chats", chatId),
    {
      participants,
      participantsLower: participants.map((item) => item.toLowerCase()),
      searchKeys,
      updatedAt: Timestamp.now(),
      createdAt: invite?.createdAt || Timestamp.now(),
    },
    { merge: true }
  );
  state.chat.chats[chatId] = state.chat.chats[chatId] || { participants };
  state.chat.chats[chatId].participants = participants;
  state.chat.activeChatId = chatId;
  renderChatList();
  subscribeToChatMessages(chatId);
  return chatId;
}

async function loadExistingChats() {
  if (isGuestUser()) {
    setChatStatus("Create an account to sync chats.");
    return;
  }
  if (chatRoomsUnsub) {
    chatRoomsUnsub();
    chatRoomsUnsub = null;
  }
  const handleKey = getChatIdentityKey();
  const email = auth.currentUser?.email || "";
  if (!handleKey && !email) return;
  const subscriptions = [];
  const chatMap = new Map();
  const applyChats = () => {
    const previousIds = new Set(Object.keys(state.chat.chats));
    const nextChats = {};
    Array.from(chatMap.entries())
      .sort((a, b) => {
        const adata = a[1];
        const bdata = b[1];
        const at = adata.updatedAt?.toDate ? adata.updatedAt.toDate().getTime() : 0;
        const bt = bdata.updatedAt?.toDate ? bdata.updatedAt.toDate().getTime() : 0;
        return bt - at;
      })
      .forEach(([id, data]) => {
        const existingMessages = state.chat.chats[id]?.messages || [];
        nextChats[id] = {
          participants: data.participants || [],
          messages: existingMessages,
        };
        if (!previousIds.has(id)) {
          addNotification(`Chat ready with ${data.participants?.join(", ") || "friend"}`);
        }
      });
    state.chat.chats = nextChats;
    renderChatList();
    if (state.chat.activeChatId && state.chat.chats[state.chat.activeChatId]) {
      if (chatMessagesChatId !== state.chat.activeChatId) {
        subscribeToChatMessages(state.chat.activeChatId);
      }
    } else {
      const firstId = Object.keys(state.chat.chats)[0];
      if (firstId) {
        state.chat.activeChatId = firstId;
        subscribeToChatMessages(firstId);
      } else {
        if (chatMessagesUnsub) {
          chatMessagesUnsub();
          chatMessagesUnsub = null;
        }
        chatMessagesChatId = null;
        renderChatMessages();
      }
    }
  };
  const attach = (q) => {
    const unsub = onSnapshot(
      q,
      (snap) => {
        snap.docs.forEach((docSnap) => {
          chatMap.set(docSnap.id, docSnap.data());
        });
        applyChats();
      },
      (error) => {
        console.warn("Unable to load chats", error);
        setChatStatus("Unable to load chats.");
      }
    );
    subscriptions.push(unsub);
  };
  if (handleKey) {
    attach(query(collection(db, "chats"), where("searchKeys", "array-contains", handleKey)));
  }
  if (email) {
    attach(query(collection(db, "chats"), where("participants", "array-contains", email)));
  }
  chatRoomsUnsub = () => {
    subscriptions.forEach((fn) => fn && fn());
  };
}

async function handleInviteAction(inviteId, action) {
  if (!inviteId || !auth.currentUser || isGuestUser()) {
    setChatStatus("Create an account to manage invites.");
    return;
  }
  const invite = state.chat.invites.find((item) => item.id === inviteId);
  if (!invite) return;
  if (action === "accept") {
    await setDoc(doc(db, "chatInvites", inviteId), { status: "accepted" }, { merge: true });
    const chatId = await ensureChatDoc(invite, invite.fromHandle || invite.fromEmail);
    setChatStatus("Invite accepted. Chat ready.");
    state.chat.invites = state.chat.invites.filter((item) => item.id !== inviteId);
    renderChatInvites();
    renderChatList();
    renderChatMessages();
    if (chatId) {
      addNotification(`Chat started with ${invite.fromHandle || invite.fromEmail || "friend"}.`);
    }
  } else {
    await setDoc(doc(db, "chatInvites", inviteId), { status: "declined" }, { merge: true });
    state.chat.invites = state.chat.invites.filter((item) => item.id !== inviteId);
    renderChatInvites();
    setChatStatus("Invite declined.");
  }
}

async function sendChatInvite() {
  if (!auth.currentUser || !chatInviteEmail || !requireFullAccount("send chat invites")) {
    setChatStatus("Sign in to invite.");
    return;
  }
  const myHandle = await ensureUserHandle();
  if (!myHandle?.handle) {
    setChatStatus("Handle not ready. Try again.");
    return;
  }
  const parsed = parseChatHandle(chatInviteEmail.value);
  if (!parsed) {
    setChatStatus("Enter a username with code (example: analyst#2048).");
    return;
  }
  if (parsed.handleLower === myHandle.handleLower) {
    setChatStatus("You cannot invite yourself.");
    return;
  }
  const target = await findUserByHandle(parsed.handleLower);
  if (!target) {
    setChatStatus("That handle was not found.");
    return;
  }
  try {
    await addDoc(collection(db, "chatInvites"), {
      toHandle: target.handle || parsed.handle,
      toHandleLower: target.handleLower || parsed.handleLower,
      toUserId: target.uid || "",
      toEmail: target.email || "",
      fromUid: auth.currentUser.uid,
      fromEmail: auth.currentUser.email,
      fromHandle: myHandle.handle,
      fromHandleLower: myHandle.handleLower,
      message: `Chat invite from ${myHandle.handle}`,
      status: "pending",
      createdAt: Timestamp.now(),
    });
    setChatStatus(
      `Invite sent to ${target.handle || parsed.handle}. They will see it in notifications.`
    );
    addNotification(`Invite sent to ${target.handle || parsed.handle}`);
    chatInviteEmail.value = "";
  } catch (error) {
    console.error("Invite send failed", error);
    setChatStatus(error.message || "Unable to send invite.");
  }
}

async function sendChatMessage() {
  if (!auth.currentUser || !requireFullAccount("chat with others")) {
    setChatStatus("Sign in to chat.");
    return;
  }
  const chatId = state.chat.activeChatId;
  if (!chatId) {
    setChatStatus("Pick a chat first.");
    return;
  }
  const text = (chatMessageInput?.value || "").trim();
  if (!text) return;
  try {
    const fromHandle = state.userHandle?.handle || auth.currentUser.email;
    await addDoc(collection(db, "chats", chatId, "messages"), {
      text,
      from: fromHandle,
      fromUid: auth.currentUser.uid,
      createdAt: Timestamp.now(),
    });
    await setDoc(
      doc(db, "chats", chatId),
      { updatedAt: Timestamp.now() },
      { merge: true }
    );
    chatMessageInput.value = "";
    setChatStatus("Message sent.");
  } catch (error) {
    console.error("Send chat message failed", error);
    setChatStatus(error.message || "Unable to send message.");
  }
}

function buildSyntheticPacket(protocols, filterText) {
  if (!protocols.length) return null;
  const [src, dest] = randomHostPair();
  const protocol = pickRandom(protocols) || "TCP";
  const now = new Date();
  const time = `${now.toLocaleTimeString([], { hour12: false })}.${String(now.getMilliseconds()).padStart(3, "0")}`;
  const length = randomInt(64, 1400);
  const port = randomInt(20, 70000);
  const infoByProto = {
    TCP: pickRandom([`SYN to ${port}`, `ACK ${port}`, `TLS data :${port}`, `RST from ${port}`]),
    UDP: pickRandom([`Len ${length - 20} -> ${port}`, `Datagram to ${port}`, `Probe to ${port}`]),
    ICMP: pickRandom([`Echo request id=0x${randomInt(1000, 9999).toString(16)}`, "Echo reply", "Time exceeded"]),
    ARP: pickRandom([`Who has ${dest}? Tell ${src}`, `Announce ${src}`]),
    DNS: pickRandom([`Query A ${randomDomain()}`, `Query AAAA ${randomDomain()}`, `Response 93.184.216.${randomInt(1, 254)}`]),
    TLS: pickRandom([`ClientHello SNI ${randomDomain()}`, "Application Data", "ChangeCipherSpec"]),
    HTTP: pickRandom([`GET /login 200`, `POST /api/session 204`, `WebSocket upgrade`, `HTTP/1.1 302 redirect`]),
  };
  const info = infoByProto[protocol] || `Traffic on ${port}`;
  const packet = { time, src, dest, protocol, length, info };
  if (filterText) {
    const needle = filterText.toLowerCase();
    const haystack = `${protocol} ${src} ${dest} ${info}`.toLowerCase();
    if (!haystack.includes(needle)) {
      return null;
    }
  }
  return packet;
}

function addPcapPacket(packet) {
  if (!packet) return;
  pcapPackets.unshift(packet);
  if (pcapPackets.length > PCAP_MAX_PACKETS) {
    pcapPackets = pcapPackets.slice(0, PCAP_MAX_PACKETS);
  }
  renderPcapFeed();
  renderPcapStats();
  setPcapActive(true);
  if (pcapStatus) {
    pcapStatus.textContent = `Capturing... ${pcapPackets.length} packets`;
  }
}

function setPcapActive(active) {
  pcapActive = active;
  if (pcapStartBtn) pcapStartBtn.disabled = active;
  if (pcapStopBtn) pcapStopBtn.disabled = !active;
}

function stopPacketCapture(message = "Capture stopped.", recordRun = true) {
  const invoke = getTauriInvoke();
  if (hasNativePcap && invoke) {
    invoke("pcap_stop").catch((err) => {
      console.warn("pcap_stop failed:", err);
      if (pcapStatus) {
        pcapStatus.textContent = err?.message || "Failed to stop capture.";
      }
    });
  }
  if (pcapTimer) {
    clearInterval(pcapTimer);
    pcapTimer = null;
  }
  pcapDurationMs = pcapStartedAt ? Date.now() - pcapStartedAt : 0;
  pcapStartedAt = 0;
  setPcapActive(false);
  if (pcapStatus) {
    const suffix = pcapPackets.length ? ` Saved ${pcapPackets.length} packets.` : "";
    pcapStatus.textContent = `${message}${suffix}`;
  }
  renderPcapStats();
  if (recordRun && pcapPackets.length) {
    registerRun("Packet capture snapshot recorded", "pcap");
  }
}

async function startPacketCapture() {
  if (!pcapStatus) return;
  console.log("pcap_start click");
  if (hasNativePcap) {
    const npcapStatus = await ensureNpcapReady();
    if (!npcapStatus?.installed) {
      pcapStatus.textContent =
        npcapStatus?.message ||
        "Npcap not available. Run the installer (requires Administrator) and restart capture.";
      return;
    }
  }
  // If no interfaces loaded yet, refresh once
  if ((pcapInterfaceSelect?.options?.length || 0) <= 1 && hasNativePcap) {
    pcapStatus.textContent = "Refreshing interfaces...";
    await loadPcapInterfaces({ quiet: false, force: true });
    if ((pcapInterfaceSelect?.options?.length || 0) <= 1) {
      pcapStatus.textContent =
        "No interfaces detected. Run app as Administrator and ensure Npcap/TShark are installed.";
      return;
    }
  }
  const protocols = getSelectedPcapProtocols();
  if (!protocols.length) {
    pcapStatus.textContent = "Select at least one protocol to watch.";
    return;
  }
  const manualIface = (pcapInterface?.value || "").trim();
  const rawIface =
    (manualIface || pcapSelectedInterface || pcapInterfaceSelect?.value || "auto").trim() || "auto";
  if ((pcapInterfaceSelect?.options?.length || 0) <= 1 && rawIface === "auto") {
    pcapStatus.textContent =
      "No interfaces detected yet. Click in the dropdown, or refresh interfaces, or run 'tshark -D' to verify visibility.";
    return;
  }
  // Normalize doubled backslashes users may paste
  const iface = rawIface.replace(/^\\\\+/, "\\");
  if (pcapStatus) {
    const label = getPcapInterfaceLabel(iface);
    pcapStatus.textContent = `Starting capture on ${label} (${protocols.join(", ")})...`;
  }
  pcapPackets = [];
  renderPcapFeed();
  renderPcapStats();
  pcapActiveInterface = iface;
  const invoke = getTauriInvoke();
  const desktop = hasNativePcap;
  if (desktop && invoke) {
    console.log("pcap_start invoked with", iface, protocols);
    ensurePcapListeners();
    setPcapActive(true);
    pcapStartedAt = Date.now();
    pcapDurationMs = 0;
    invoke("pcap_start", {
      interface: iface === "auto" ? null : iface,
      protocols,
      bpfFilter: (pcapFilterInput?.value || "").trim() || null,
    })
      .then(() => {
        const label = getPcapInterfaceLabel(iface);
        pcapStatus.textContent = `Capturing on ${label} (${protocols.join(", ")})...`;
        // Safety: if no status event arrives, keep UI in "capturing" state
        setPcapActive(true);
      })
      .catch((error) => {
        console.error("pcap_start failed:", error);
        setPcapActive(false);
        pcapStatus.textContent = error?.message || "Failed to start capture.";
      });
    return;
  }

  // Fallback simulation for non-desktop environments
  setPcapActive(true);
  pcapStartedAt = Date.now();
  pcapDurationMs = 0;
  if (pcapStatus) {
    const label = getPcapInterfaceLabel(iface);
    pcapStatus.textContent = `Capturing on ${label} (${protocols.join(", ")}) - simulated preview`;
  }
  if (pcapTimer) {
    clearInterval(pcapTimer);
  }
  pcapTimer = setInterval(() => {
    if (!pcapActive) return;
    const currentProtocols = getSelectedPcapProtocols();
    if (!currentProtocols.length) return;
    const liveFilter = (pcapFilterInput?.value || "").trim();
    const packet = buildSyntheticPacket(currentProtocols, liveFilter);
    if (packet) {
      addPcapPacket(packet);
    }
  }, 700);
}

function clearPacketCapture() {
  pcapPackets = [];
  pcapDurationMs = 0;
  pcapStartedAt = 0;
  renderPcapFeed();
  renderPcapStats();
  if (pcapStatus) {
    pcapStatus.textContent = "Capture log cleared.";
  }
}

if (chatInviteBtn) {
  chatInviteBtn.addEventListener("click", sendChatInvite);
}

if (chatInviteList) {
  chatInviteList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-invite-id]");
    if (!button) return;
    const inviteId = button.dataset.inviteId;
    const action = button.dataset.inviteAction;
    if (!action || !inviteId) return;
    void handleInviteAction(inviteId, action);
  });
}

if (chatActiveSelect) {
  chatActiveSelect.addEventListener("change", () => {
    const selected = chatActiveSelect.value || "";
    state.chat.activeChatId = selected;
    renderChatMessages();
    if (selected) {
      subscribeToChatMessages(selected);
    }
  });
}

if (chatMessageSendBtn) {
  chatMessageSendBtn.addEventListener("click", () => {
    void sendChatMessage();
  });
}

if (chatMessageInput) {
  chatMessageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void sendChatMessage();
    }
  });
}

const PORT_SERVICE_MAP = {
  21: "FTP",
  22: "SSH",
  23: "Telnet",
  25: "SMTP",
  53: "DNS",
  80: "HTTP",
  110: "POP3",
  143: "IMAP",
  443: "HTTPS",
  445: "SMB",
  3306: "MySQL",
  3389: "RDP",
  5432: "Postgres",
  6379: "Redis",
  8080: "HTTP-alt",
};

function renderPortScanResults(ports) {
  if (!portScanResult) return;
  portScanResult.innerHTML = "";
  const header = document.createElement("div");
  header.className = "ip-row header";
  header.innerHTML = `
    <div>Port</div>
    <div>Service</div>
    <div>Status</div>
    <div>Notes</div>
  `;
  portScanResult.appendChild(header);
  if (!ports.length) {
    const empty = document.createElement("div");
    empty.className = "ip-row";
    empty.innerHTML = `<div>No open ports found.</div>`;
    portScanResult.appendChild(empty);
    return;
  }
  ports.forEach((port) => {
    const row = document.createElement("div");
    row.className = "ip-row";
    const service = PORT_SERVICE_MAP[port] || "Unknown";
    row.innerHTML = `
      <div><strong>${port}</strong></div>
      <div>${service}</div>
      <div>Open</div>
      <div>-</div>
    `;
    portScanResult.appendChild(row);
  });
}

function isLikelyLocalTarget(target) {
  const t = (target || "").trim().toLowerCase();
  if (!t || t === "localhost" || t === "127.0.0.1" || t === "0.0.0.0") return true;
  if (state.stealthIp && t === state.stealthIp.toLowerCase()) return true;
  return PRIVATE_IP_RANGES.some((re) => re.test(t));
}

function setPortScanActive(active) {
  portScanActive = active;
  if (portScanBtn) portScanBtn.disabled = active;
  if (portScanStopBtn) portScanStopBtn.disabled = !active;
  if (portScanProgress) {
    portScanProgress.classList.toggle("active", active);
    const bar = portScanProgress.querySelector("span");
    if (bar) {
      bar.style.width = active ? "0%" : "0%";
    }
  }
}

async function runPortScan() {
  if (!portScanStatus || !portScanTarget || !portScanPorts) return;
  const target = portScanTarget.value.trim();
  let ports = portScanPorts.value.trim();
  const timeoutMs = Number(portScanTimeout?.value || 200);
  portScanLastTarget = target;
  if (!target) {
    portScanStatus.textContent = "Enter a target host or IP.";
    return;
  }
  if (!ports) {
    const rangeLimit = 10000; // default sweep
    ports = Array.from({ length: rangeLimit }, (_, idx) => idx + 1).join(",");
  } else if (!ports.trim()) {
    portScanStatus.textContent = "Enter ports to scan.";
    return;
  }
  if (state.isOffline) {
    portScanStatus.textContent = "Offline mode is enabled. Go online to scan.";
    return;
  }
  const invoke = getTauriInvoke();
  if (!invoke) {
    portScanStatus.textContent = "Port scan is available in the desktop app only.";
    return;
  }
  portScanStatus.textContent = "Scanning ports...";
  portScanPortsOpen = new Map();
  renderPortScanResults([]);
  setPortScanActive(true);
  try {
    const targetIp =
      /^\d{1,3}(\.\d{1,3}){3}$/.test(target) ? target : await resolveIpFromDomain(target);
    if (targetIp) {
      const geo = await fetchGeoFromIp(targetIp);
      incrementGeoCountry(geo.countryName);
    }
    await invoke("port_scan_start", { target, ports, timeoutMs });
  } catch (error) {
    portScanStatus.textContent = error.message || "Unable to scan ports.";
    setPortScanActive(false);
  }
}

if (portScanBtn) {
  portScanBtn.addEventListener("click", runPortScan);
}

if (portScanStopBtn) {
  portScanStopBtn.addEventListener("click", async () => {
    const invoke = getTauriInvoke();
    if (!invoke) return;
    try {
      portScanStatus.textContent = "Stopping scan...";
      await invoke("port_scan_stop");
    } catch (error) {
      portScanStatus.textContent = error.message || "Unable to stop scan.";
    }
  });
}

function registerPortScanListeners() {
  const portScanListen = getTauriEventListen();
  if (!portScanListen) return false;
  portScanListen("port_scan_port", (event) => {
    const port = event.payload?.port;
    if (!port) return;
    if (!portScanPortsOpen.has(port)) {
      portScanPortsOpen.set(port, true);
      const ports = Array.from(portScanPortsOpen.keys()).sort((a, b) => a - b);
      renderPortScanResults(ports);
    }
    const target = (portScanLastTarget || "").toLowerCase();
    const isLocalTarget = isLikelyLocalTarget(target);
    if (honeyActive && isLocalTarget && typeof appendHoneyEvent === "function") {
      appendHoneyEvent(`Port scan hit on local port ${port} (target ${target || "localhost"})`);
      if (honeyStatus) honeyStatus.textContent = "Recorded probe from port scan.";
    }
  });
  portScanListen("port_scan_progress", (event) => {
    if (!portScanStatus) return;
    const percent = event.payload?.percent;
    if (typeof percent === "number") {
      portScanStatus.textContent = `Scanning ports... ${percent}%`;
      if (portScanProgress) {
        const bar = portScanProgress.querySelector("span");
        if (bar) {
          bar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
        }
      }
    }
  });
  portScanListen("port_scan_done", (event) => {
    const count = event.payload?.count || portScanPortsOpen.size;
    portScanStatus.textContent = `Open ports: ${count}`;
    state.toolData.portscan = `Open ports: ${count}`;
    saveToolOutput("portscan", state.toolData.portscan);
    registerRun("Port scan completed", "portscan");
    if (portScanProgress) {
      const bar = portScanProgress.querySelector("span");
      if (bar) {
        bar.style.width = "100%";
      }
    }
    setPortScanActive(false);
  });
  portScanListen("port_scan_stopped", () => {
    if (!portScanStatus) return;
    portScanStatus.textContent = "Scan stopped.";
    setPortScanActive(false);
  });
  return true;
}

let portScanListenerRetries = 0;
function ensurePortScanListeners() {
  if (registerPortScanListeners()) return;
  if (portScanListenerRetries >= 10) return;
  portScanListenerRetries += 1;
  setTimeout(ensurePortScanListeners, 500);
}

ensurePortScanListeners();
setSpeedTestActive(false);
setPortScanActive(false);

const logAnalyzeBtn = document.getElementById("logAnalyzeBtn");
const logResult = document.getElementById("logResult");

const SEVERITY_NAMES = ["EMERGENCY", "ALERT", "CRITICAL", "ERROR", "WARNING", "NOTICE", "INFO", "DEBUG"];
const PRIVATE_IP_RANGES = [
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^127\./,
  /^169\.254\./,
];

function parseSeverity(line) {
  const syslogMatch = line.match(/^\s*<(\d+)>/);
  if (syslogMatch) {
    const sev = Number(syslogMatch[1]) % 8;
    return SEVERITY_NAMES[sev] || "INFO";
  }
  const wordMatch = line.match(
    /(EMERGENCY|ALERT|CRITICAL|ERROR|WARNING|NOTICE|INFO|DEBUG)/i
  );
  if (wordMatch) {
    return wordMatch[1].toUpperCase();
  }
  return "INFO";
}

function isPrivateIp(ip) {
  return PRIVATE_IP_RANGES.some((re) => re.test(ip));
}

function analyzeLogs(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const severityCounts = {
    EMERGENCY: 0,
    ALERT: 0,
    CRITICAL: 0,
    ERROR: 0,
    WARNING: 0,
    NOTICE: 0,
    INFO: 0,
    DEBUG: 0,
  };
  const highEvents = [];
  const allIps = text.match(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g) || [];
  const ipCounts = new Map();
  allIps.forEach((ip) => {
    ipCounts.set(ip, (ipCounts.get(ip) || 0) + 1);
  });

  lines.forEach((line) => {
    const sev = parseSeverity(line);
    if (severityCounts[sev] !== undefined) severityCounts[sev] += 1;
    if (["EMERGENCY", "ALERT", "CRITICAL", "ERROR", "WARNING"].includes(sev)) {
      if (highEvents.length < 6) {
        highEvents.push(`${sev}: ${line.replace(/^\s*<\d+>\s*/, "")}`);
      }
    }
  });

  const externalIps = Array.from(ipCounts.entries())
    .filter(([ip]) => !isPrivateIp(ip))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const recs = [];
  if (severityCounts.EMERGENCY + severityCounts.ALERT + severityCounts.CRITICAL > 0) {
    recs.push("Investigate critical system/service failures immediately.");
  }
  if (lines.some((l) => /fail-?open/i.test(l))) {
    recs.push("Firewall fail-open event: verify policy and restore protections.");
  }
  if (lines.some((l) => /denied\s+ssh|ssh attempts/i.test(l))) {
    recs.push("Brute-force SSH attempts detected: block offending IPs, enforce MFA.");
  }
  if (lines.some((l) => /port scan/i.test(l))) {
    recs.push("Port scan detected: consider rate limits or geo-blocks on exposed services.");
  }
  if (lines.some((l) => /CPU utilisation|utilization/i.test(l))) {
    recs.push("High CPU: check processes and reduce load or add capacity.");
  }
  if (!recs.length) {
    recs.push("Review high-severity events and external IP sources for anomalies.");
  }

  const summary = [
    `Lines: ${lines.length}`,
    `Severity counts: ` +
      `EMERG ${severityCounts.EMERGENCY} | ALERT ${severityCounts.ALERT} | CRIT ${severityCounts.CRITICAL} | ` +
      `ERR ${severityCounts.ERROR} | WARN ${severityCounts.WARNING} | NOTICE ${severityCounts.NOTICE} | ` +
      `INFO ${severityCounts.INFO} | DEBUG ${severityCounts.DEBUG}`,
  ];

  const highSection = highEvents.length
    ? ["High-severity events:", ...highEvents]
    : ["High-severity events: none captured."];

  const ipSection = externalIps.length
    ? [
        "Top external IPs:",
        ...externalIps.map(([ip, count]) => `- ${ip} (${count} hits)`),
      ]
    : ["Top external IPs: none (only internal/private seen)."];

const recSection = ["Recommendations:", ...recs.map((r) => `- ${r}`)];

  return [...summary, "", ...highSection, "", ...ipSection, "", ...recSection].join("\n");
}

function analyzeSiemLogs(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const severityCounts = {
    EMERGENCY: 0,
    ALERT: 0,
    CRITICAL: 0,
    ERROR: 0,
    WARNING: 0,
    NOTICE: 0,
    INFO: 0,
    DEBUG: 0,
  };
  const ipCounts = new Map();
  const timelineBuckets = new Map();
  const ipsRegex = /\b\d{1,3}(?:\.\d{1,3}){3}\b/g;
  lines.forEach((line, idx) => {
    const sev = parseSeverity(line);
    if (severityCounts[sev] !== undefined) severityCounts[sev] += 1;
    const foundIps = line.match(ipsRegex) || [];
    foundIps.forEach((ip) => ipCounts.set(ip, (ipCounts.get(ip) || 0) + 1));
    const bucket = `Batch ${Math.floor(idx / 10) + 1}`;
    timelineBuckets.set(bucket, (timelineBuckets.get(bucket) || 0) + 1);
  });
  const topSources = Array.from(ipCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({ label, value }));
  const sevList = Object.entries(severityCounts).map(([label, value]) => ({ label, value }));
  const timeList = Array.from(timelineBuckets.entries()).map(([label, value]) => ({
    label,
    value,
  }));
  const summary = [
    `Lines: ${lines.length}`,
    `Severities: ${JSON.stringify(severityCounts)}`,
    `Top sources: ${topSources.map((t) => `${t.label} (${t.value})`).join(", ") || "None"}`,
  ].join("\n");
  return { sevList, topSources, timeList, summary };
}

function renderMiniChart(container, items) {
  if (!container) return;
  container.innerHTML = "";
  if (!items.length) {
    container.textContent = "No data.";
    return;
  }
  const maxVal = Math.max(...items.map((i) => i.value), 1);
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "mini-bar";
    const label = document.createElement("div");
    label.className = "mini-bar-label";
    label.textContent = item.label;
    const track = document.createElement("div");
    track.className = "mini-bar-track";
    const fill = document.createElement("div");
    fill.className = "mini-bar-fill";
    fill.style.width = `${Math.round((item.value / maxVal) * 100)}%`;
    track.appendChild(fill);
    const value = document.createElement("div");
    value.className = "mini-bar-value";
    value.textContent = item.value;
    row.appendChild(label);
    row.appendChild(track);
    row.appendChild(value);
    container.appendChild(row);
  });
}

function renderPieChart(container, items) {
  if (!container) return;
  container.innerHTML = "";
  const total = items.reduce((sum, i) => sum + i.value, 0);
  if (!total) {
    container.textContent = "No data.";
    return;
  }
  const colors = ["#2cff67", "#00d47a", "#00a88f", "#0087a6", "#4fd3ff", "#9b7bff", "#ff7bb6"];
  let start = 0;
  const stops = items.map((item, idx) => {
    const angle = (item.value / total) * 360;
    const end = start + angle;
    const stop = { color: colors[idx % colors.length], start, end };
    start = end;
    return stop;
  });
  const gradient = stops
    .map((s) => `${s.color} ${s.start}deg ${s.end}deg`)
    .join(", ");
  const pie = document.createElement("div");
  pie.className = "mini-pie";
  pie.style.background = `conic-gradient(${gradient})`;
  const legend = document.createElement("div");
  legend.className = "mini-legend";
  items.forEach((item, idx) => {
    const row = document.createElement("div");
    const sw = document.createElement("span");
    sw.className = "mini-swatch";
    sw.style.background = colors[idx % colors.length];
    const label = document.createElement("span");
    label.textContent = `${item.label}: ${item.value}`;
    row.appendChild(sw);
    row.appendChild(label);
    legend.appendChild(row);
  });
  container.appendChild(pie);
  container.appendChild(legend);
}

function renderLineChart(container, items) {
  if (!container) return;
  container.innerHTML = "";
  if (!items.length) {
    container.textContent = "No data.";
    return;
  }
  const width = 280;
  const height = 140;
  const maxVal = Math.max(...items.map((i) => i.value), 1);
  const step = items.length > 1 ? width / (items.length - 1) : 0;
  const points = items
    .map((item, idx) => {
      const x = idx * step;
      const y = height - (item.value / maxVal) * (height - 20) - 10;
      return `${x},${y}`;
    })
    .join(" ");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.classList.add("mini-svg");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "#2cff67");
  path.setAttribute("stroke-width", "2");
  path.setAttribute("points", points);
  svg.appendChild(path);
  container.appendChild(svg);
}

logAnalyzeBtn.addEventListener("click", () => {
  const text = document.getElementById("logInput").value || "";
  const report = analyzeLogs(text);
  logResult.textContent = report;
  state.toolData.log = report;
  state.toolData.logRisk = /EMERGENCY|ALERT|CRITICAL|ERROR|WARNING/i.test(report);
  saveToolOutput("log", state.toolData.log);
  registerRun(
    state.toolData.logRisk ? "Log analysis completed with findings" : "Log analysis completed",
    "log"
  );
  if (cipherState.tool === "log" && shouldAutoAdvance("analyze")) {
    markActionDone("analyze");
    advanceCipherStep("Review findings and recommendations, then save if needed.");
  }
});

if (siemAnalyzeBtn) {
  siemAnalyzeBtn.addEventListener("click", () => {
    const text = siemInput?.value || "";
    if (!text.trim()) {
      siemStatus.textContent = "Paste logs to analyze.";
      return;
    }
    siemStatus.textContent = "Analyzing...";
    const result = analyzeSiemLogs(text);
    renderPieChart(siemSevChart, result.sevList);
    renderMiniChart(siemSourceChart, result.topSources);
    renderLineChart(siemTimeChart, result.timeList);
    siemOutput.value = result.summary;
    siemStatus.textContent = "Done.";
    state.toolData.siem = result.summary;
    saveToolOutput("siem", state.toolData.siem);
    registerRun("SIEM analysis completed", "siem");
  });
}

if (siemClearBtn) {
  siemClearBtn.addEventListener("click", () => {
    if (siemInput) siemInput.value = "";
    if (siemOutput) siemOutput.value = "";
    if (siemStatus) siemStatus.textContent = "Ready.";
    if (siemSevChart) siemSevChart.innerHTML = "";
    if (siemSourceChart) siemSourceChart.innerHTML = "";
    if (siemTimeChart) siemTimeChart.innerHTML = "";
  });
}

const urlCheckBtn = document.getElementById("urlCheckBtn");
const urlResult = document.getElementById("urlResult");

urlCheckBtn.addEventListener("click", async () => {
  if (state.isOffline) {
    urlResult.textContent = "Offline mode enabled. URL checks are disabled.";
    return;
  }
  const input = document.getElementById("urlInput").value.trim();
  let url;
  try {
    url = new URL(input);
  } catch {
    urlResult.textContent = "Invalid URL.";
    return;
  }
  const risks = [];
  if (url.protocol !== "https:") risks.push("Not using HTTPS");
  if (url.hostname.includes("--")) risks.push("Punycode-like hostname");
  if (/(login|verify|update)/i.test(url.pathname)) risks.push("Sensitive path keyword");
  urlResult.textContent = [
    `Host: ${url.hostname}`,
    `Protocol: ${url.protocol}`,
    `Risk flags: ${risks.length ? risks.join(", ") : "None detected"}`,
  ].join("\n");
  state.toolData.url = urlResult.textContent;
  state.toolData.urlRisk = risks.length > 0;
  saveToolOutput("url", state.toolData.url);
  const urlIp = await resolveIpFromDomain(url.hostname);
  const urlGeo = await fetchGeoFromIp(urlIp);
  incrementGeoCountry(urlGeo.countryName);
  registerRun(
    risks.length ? "URL safety check flagged risks" : "URL safety check completed",
    "url"
  );
  if (cipherState.tool === "url" && shouldAutoAdvance("check")) {
    markActionDone("check");
    advanceCipherStep("Review the risk flags, then save if needed.");
  }
});

const hashFile = document.getElementById("hashFile");
const hashResult = document.getElementById("hashResult");

hashFile.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  hashResult.textContent = `SHA-256: ${hashHex}`;
  state.toolData.hash = hashResult.textContent;
  saveToolOutput("hash", state.toolData.hash);
  registerRun("File hash generated", "hash");
  if (cipherState.tool === "hash" && shouldAutoAdvance("file")) {
    markActionDone("file");
    advanceCipherStep("Copy the hash if needed, then save to session.");
  }
});

const whoisBtn = document.getElementById("whoisBtn");
const whoisResult = document.getElementById("whoisResult");

whoisBtn.addEventListener("click", async () => {
  if (state.isOffline) {
    whoisResult.textContent = "Offline mode enabled. Whois lookup is disabled.";
    return;
  }
  const input = document.getElementById("whoisInput").value.trim();
  if (!input) {
    whoisResult.textContent = "Enter a valid domain.";
    return;
  }
  let domain = input;
  try {
    if (input.includes("://")) {
      domain = new URL(input).hostname;
    }
  } catch {
    domain = input;
  }
  domain = domain.replace(/^www\./i, "");
  if (!domain || !domain.includes(".")) {
    whoisResult.textContent = "Enter a valid domain.";
    return;
  }
  whoisResult.textContent = "Looking up domain via RDAP...";
  try {
    const response = await fetch(`https://rdap.org/domain/${domain}`);
    if (!response.ok) {
      throw new Error("Lookup failed.");
    }
    const data = await response.json();
    const registrar = data.entities?.find((entity) =>
      entity.roles?.includes("registrar")
    )?.vcardArray?.[1]?.find((entry) => entry[0] === "fn")?.[3];
    const created = data.events?.find((event) => event.eventAction === "registration")?.eventDate;
    const nameServers = (data.nameservers || [])
      .map((server) => server.ldhName)
      .filter(Boolean)
      .slice(0, 6)
      .join(", ");
      const ip = await resolveIpFromDomain(domain);
      let location = "Unknown";
      let countryName = null;
      if (ip) {
        const geo = await fetchGeoFromIp(ip);
        countryName = geo.countryName;
        location = geo.location;
      }
    whoisResult.textContent = [
      `Domain: ${data.ldhName || domain}`,
      `Registrar: ${registrar || "Unknown"}`,
      `Creation: ${created || "Unknown"}`,
      `Name servers: ${nameServers || "Unknown"}`,
      `IP address: ${ip || "Unknown"}`,
      `Location: ${location}`,
    ].join("\n");
    state.toolData.whois = whoisResult.textContent;
    saveToolOutput("whois", state.toolData.whois);
      incrementGeoCountry(countryName);
    registerRun("Whois lookup completed", "whois");
    if (cipherState.tool === "whois" && shouldAutoAdvance("lookup")) {
      markActionDone("lookup");
      advanceCipherStep("Review registrar/IP info and save if needed.");
    }
  } catch (error) {
    whoisResult.textContent = "Lookup failed. Please try again.";
  }
});

const reportBtn = document.getElementById("reportBtn");
const reportOutput = document.getElementById("reportOutput");
const reportClearBtn = document.getElementById("reportClearBtn");
const reportPdfBtn = document.getElementById("reportPdfBtn");
const reportSaveLocalBtn = document.getElementById("reportSaveLocalBtn");

const REPORT_SECTIONS = [
  { label: "Password", key: "password" },
  { label: "Subnet", key: "subnet" },
  { label: "Wi-Fi Scan", key: "wifi" },
  { label: "IP Scan", key: "ipscan" },
  { label: "Port scan", key: "portscan" },
  { label: "Speed test", key: "speed" },
  { label: "Log Analysis", key: "log" },
  { label: "URL Safety", key: "url" },
  { label: "File Hash", key: "hash" },
  { label: "Whois", key: "whois" },
  { label: "Crypto", key: "crypto" },
  { label: "Steganography", key: "steg" },
  { label: "Web Proxy", key: "proxy" },
  { label: "Honeypot", key: "honey" },
  { label: "SIEM", key: "siem" },
];

reportBtn.addEventListener("click", () => {
  const selectedSessionId = reportSessionSelect?.value || state.currentSessionId;
  const selectedSession = state.sessions.find((session) => session.id === selectedSessionId);
  const sessionOutputs = selectedSession?.outputs || {};
  const activityLines = selectedSession?.activities.length
    ? selectedSession.activities
        .slice()
        .reverse()
        .map((item) => `${item.time} - ${item.message}`)
        .join("\n")
    : "No activity recorded for this session.";
  const titleInput = document.getElementById("reportTitle");
  const storedCount = Number(localStorage.getItem("ck_report_counter") || "0");
  let title = titleInput.value.trim();
    if (!title) {
      const nextCount = storedCount + 1;
      title = `Unnamed report ${nextCount}`;
      titleInput.value = title;
      localStorage.setItem("ck_report_counter", nextCount.toString());
    }
    const sections = REPORT_SECTIONS.map((section) => ({
      label: section.label,
      value:
        sessionOutputs[section.key] ||
        "Not saved to session. Run the tool and save its output to include it here.",
    }));
    sections.push({ label: "Activity log", value: activityLines });
    const reportBody = [
      title,
      "=".repeat(title.length),
      `Generated: ${new Date().toLocaleString()}`,
      "",
    ...sections.map((section) => `${section.label}:\n${section.value}`),
  ].join("\n\n");
  reportOutput.value = reportBody;
  state.metrics.reports += 1;
  updateOverview();
  saveUserStats();
  registerRun("Report generated", "report");
  if (cipherState.tool === "report" && shouldAutoAdvance("generate")) {
    markActionDone("generate");
    advanceCipherStep("Save locally or export PDF if you need it.");
  }
});

reportClearBtn.addEventListener("click", () => {
  reportOutput.value = "";
  document.getElementById("reportTitle").value = "";
});

if (reportSaveLocalBtn) {
  reportSaveLocalBtn.addEventListener("click", () => {
    if (!reportOutput.value.trim()) {
      alert("Generate a report before saving.");
      return;
    }
    const title = document.getElementById("reportTitle").value.trim() || "Net Kit Report";
    const sessionId = reportSessionSelect?.value || state.currentSessionId || null;
    const localReports = loadLocalReports();
    localReports.unshift({
      id: `local-${Date.now()}`,
      title,
      content: reportOutput.value,
      savedAt: new Date().toISOString(),
      sessionId,
    });
    saveLocalReports(localReports);
    state.reports = loadLocalReports();
    renderReportList();
    updateReportWarning();
    addNotification("Report saved locally");
  });
}

function exportReportToPdf(content) {
  if (!content.trim()) {
    alert("Generate a report before exporting.");
    return;
  }
  const title = document.getElementById("reportTitle").value.trim() || "Net Kit Report";
  const reportWindow = window.open("", "reportPdf");
  if (!reportWindow) {
    alert("Popup blocked. Allow popups to export PDF.");
    return;
  }
  reportWindow.document.write(`
    <html>
      <head>
        <title>${title.replace(/</g, "&lt;")}</title>
        <style>
          body { font-family: Consolas, monospace; padding: 32px; color: #111; }
          pre { white-space: pre-wrap; font-size: 12px; }
          h1 { margin: 0 0 16px; font-size: 20px; }
        </style>
      </head>
      <body>
        <h1>${title.replace(/</g, "&lt;")}</h1>
        <pre>${content.replace(/</g, "&lt;")}</pre>
      </body>
    </html>
  `);
  reportWindow.document.close();
  reportWindow.focus();
  reportWindow.print();
}

reportPdfBtn.addEventListener("click", () => {
  exportReportToPdf(reportOutput.value);
});

if (reportList) {
  reportList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-report-id]");
    if (!button) return;
    const report = state.reports.find((item) => item.id === button.dataset.reportId);
    if (!report) return;
    const action = button.dataset.reportAction || "open";
    if (action === "open") {
      reportOutput.value = report.content || "";
      document.getElementById("reportTitle").value = report.title || "";
      return;
    }
    if (action === "pdf") {
      exportReportToPdf(report.content || "");
      return;
    }
    if (action === "delete") {
      openPrompt({
        title: "Delete report",
        message: "Delete this report? This cannot be undone.",
        confirmText: "Delete",
      }).then((result) => {
        if (!result.confirmed) return;
        state.reports = state.reports.filter((item) => item.id !== report.id);
        saveLocalReports(state.reports);
        renderReportList();
        updateReportWarning();
      });
    }
  });
}

if (reportSelectAllBtn) {
  reportSelectAllBtn.addEventListener("click", () => {
    const checkboxes = reportList.querySelectorAll(".report-checkbox");
    const allChecked = Array.from(checkboxes).every((box) => box.checked);
    checkboxes.forEach((box) => {
      box.checked = !allChecked;
    });
  });
}

if (reportSelectBtn) {
  reportSelectBtn.addEventListener("click", () => {
    const selected = Array.from(reportList.querySelectorAll(".report-checkbox:checked")).map(
      (box) => box.dataset.reportId
    );
    if (selected.length !== 1) {
      showInfo("Select exactly one report.");
      return;
    }
    const report = state.reports.find((item) => item.id === selected[0]);
    if (!report) return;
    reportOutput.value = report.content || "";
    document.getElementById("reportTitle").value = report.title || "";
  });
}

if (reportDeleteSelectedBtn) {
  reportDeleteSelectedBtn.addEventListener("click", () => {
    const selected = Array.from(reportList.querySelectorAll(".report-checkbox:checked")).map(
      (box) => box.dataset.reportId
    );
    if (!selected.length) {
      showInfo("Select reports to delete.");
      return;
    }
    openPrompt({
      title: "Delete reports",
      message: `Delete ${selected.length} selected report(s)?`,
      confirmText: "Delete",
    }).then((result) => {
      if (!result.confirmed) return;
      state.reports = state.reports.filter((item) => !selected.includes(item.id));
      saveLocalReports(state.reports);
      renderReportList();
      updateReportWarning();
    });
  });
}

if (sessionList) {
  sessionList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-session-id]");
    if (!button) return;
    const sessionId = button.dataset.sessionId;
    const action = button.dataset.sessionAction;
    const session = state.sessions.find((item) => item.id === sessionId);
    if (!session) return;
    if (action === "use") {
      state.currentSessionId = sessionId;
      applyActiveSessionToTools(sessionId);
      saveUserSessions();
      updateSessionOptions();
      renderSessionList();
      return;
    }
    if (action === "delete") {
      openPrompt({
        title: "Delete session",
        message: "Delete this session and its saved outputs?",
        confirmText: "Delete",
      }).then((result) => {
        if (!result.confirmed) return;
        state.sessions = state.sessions.filter((item) => item.id !== sessionId);
        if (state.currentSessionId === sessionId) {
          state.currentSessionId = state.sessions[0]?.id || null;
        }
        saveUserSessions();
        rebuildActivityCache();
        renderActivity();
        renderAllActivity();
        updateSessionOptions();
        renderSessionList();
      });
    }
  });
}

if (sessionSelectAllBtn) {
  sessionSelectAllBtn.addEventListener("click", () => {
    const checkboxes = sessionList.querySelectorAll(".session-checkbox");
    const allChecked = Array.from(checkboxes).every((box) => box.checked);
    checkboxes.forEach((box) => {
      box.checked = !allChecked;
    });
  });
}

if (sessionDeleteSelectedBtn) {
  sessionDeleteSelectedBtn.addEventListener("click", () => {
    const selected = Array.from(sessionList.querySelectorAll(".session-checkbox:checked")).map(
      (box) => box.dataset.sessionId
    );
    if (!selected.length) return;
    openPrompt({
      title: "Delete sessions",
      message: `Delete ${selected.length} selected session(s)?`,
      confirmText: "Delete",
    }).then((result) => {
      if (!result.confirmed) return;
      state.sessions = state.sessions.filter((session) => !selected.includes(session.id));
      if (!state.sessions.find((session) => session.id === state.currentSessionId)) {
        state.currentSessionId = state.sessions[0]?.id || null;
      }
      saveUserSessions();
      rebuildActivityCache();
      renderActivity();
      renderAllActivity();
      updateSessionOptions();
      renderSessionList();
    });
  });
}


function resizeAuthCanvas() {
  if (!authCanvas) return;
  authCanvas.width = window.innerWidth;
  authCanvas.height = window.innerHeight;
}

function createAuthNodes() {
  if (!authCanvas) return;
  const area = window.innerWidth * window.innerHeight;
  const count = Math.max(90, Math.min(180, Math.floor(area / 12000)));
  authNodes = Array.from({ length: count }, () => ({
    x: Math.random() * authCanvas.width,
    y: Math.random() * authCanvas.height,
    vx: (Math.random() - 0.5) * authConfig.speed,
    vy: (Math.random() - 0.5) * authConfig.speed,
    z: Math.random(),
    phase: Math.random() * Math.PI * 2,
  }));
}

function updateAuthNodes(width, height) {
  authNodes.forEach((node) => {
    node.x += node.vx;
    node.y += node.vy;
    if (node.x < 0 || node.x > width) node.vx *= -1;
    if (node.y < 0 || node.y > height) node.vy *= -1;
  });
}

function drawAuthNetwork(animate, time) {
  if (!authCtx || !authCanvas) return;
  const width = authCanvas.width;
  const height = authCanvas.height;
  authCtx.fillStyle = authConfig.bg;
  authCtx.fillRect(0, 0, width, height);
  if (animate) {
    updateAuthNodes(width, height);
  }

  for (let i = 0; i < authNodes.length; i += 1) {
    for (let j = i + 1; j < authNodes.length; j += 1) {
      const dx = authNodes[i].x - authNodes[j].x;
      const dy = authNodes[i].y - authNodes[j].y;
      const dist = Math.hypot(dx, dy);
      if (dist < authConfig.lineDistance) {
        const depth = (authNodes[i].z + authNodes[j].z) / 2;
        const alpha =
          (0.18 + 0.7 * (1 - dist / authConfig.lineDistance)) * (0.35 + depth);
        authCtx.strokeStyle = `rgba(${authConfig.lineRgb}, ${alpha})`;
        authCtx.lineWidth = 0.8 + depth * 1.2;
        authCtx.beginPath();
        authCtx.moveTo(authNodes[i].x, authNodes[i].y);
        authCtx.lineTo(authNodes[j].x, authNodes[j].y);
        authCtx.stroke();
      }
    }
  }

  const now = typeof time === "number" ? time : 0;
  authCtx.shadowColor = `rgba(${authConfig.nodeRgb}, 0.6)`;
  authCtx.shadowBlur = 14;
  authNodes.forEach((node) => {
    const pulse = 0.35 * Math.sin(now * 1.1 + node.phase);
    const radius =
      authConfig.nodeMin +
      (authConfig.nodeMax - authConfig.nodeMin) * node.z +
      pulse * 0.25;
    const alpha = 0.65 + node.z * 0.35;
    authCtx.fillStyle = `rgba(${authConfig.nodeRgb}, ${alpha})`;
    authCtx.beginPath();
    authCtx.arc(node.x, node.y, Math.max(1, radius), 0, Math.PI * 2);
    authCtx.fill();
  });
  authCtx.shadowBlur = 0;
}

function animateAuth() {
  if (!authCtx || !authCanvas) return;
  if (body.classList.contains("auth-mode")) {
    drawAuthNetwork(true, performance.now() * 0.001);
  }
  requestAnimationFrame(animateAuth);
}

if (authCtx) {
  resizeAuthCanvas();
  createAuthNodes();
  requestAnimationFrame(animateAuth);
  window.addEventListener("resize", () => {
    resizeAuthCanvas();
    createAuthNodes();
    drawAuthNetwork(false, performance.now() * 0.001);
  });
}






function pkcs7Pad(bytes, blockSize) {
  const padLen = blockSize - (bytes.length % blockSize || blockSize);
  const out = new Uint8Array(bytes.length + padLen);
  out.set(bytes, 0);
  out.fill(padLen, bytes.length);
  return out;
}

function pkcs7Unpad(bytes) {
  if (!bytes.length) return bytes;
  const padLen = bytes[bytes.length - 1];
  if (padLen < 1 || padLen > 8 || padLen > bytes.length) {
    throw new Error("Invalid padding");
  }
  for (let i = bytes.length - padLen; i < bytes.length; i += 1) {
    if (bytes[i] !== padLen) throw new Error("Invalid padding");
  }
  return bytes.slice(0, bytes.length - padLen);
}

// Minimal DES / 3DES CBC implementation (software fallback for browsers)
const DES_IP = [
  58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4, 62, 54, 46, 38, 30, 22, 14, 6,
  64, 56, 48, 40, 32, 24, 16, 8, 57, 49, 41, 33, 25, 17, 9, 1, 59, 51, 43, 35, 27, 19, 11, 3, 61,
  53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31, 23, 15, 7,
];
const DES_FP = [
  40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31, 38, 6, 46, 14, 54, 22, 62, 30, 37,
  5, 45, 13, 53, 21, 61, 29, 36, 4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51, 19, 59, 27, 34, 2,
  42, 10, 50, 18, 58, 26, 33, 1, 41, 9, 49, 17, 57, 25,
];
const DES_E = [
  32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13, 12, 13, 14, 15, 16, 17, 16, 17, 18, 19,
  20, 21, 20, 21, 22, 23, 24, 25, 24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32, 1,
];
const DES_P = [
  16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10, 2, 8, 24, 14, 32, 27, 3, 9, 19, 13,
  30, 6, 22, 11, 4, 25,
];
const DES_PC1 = [
  57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60,
  52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21,
  13, 5, 28, 20, 12, 4,
];
const DES_PC2 = [
  14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2, 41, 52,
  31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32,
];
const DES_SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];
const DES_SBOX = [
  [
    [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
    [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
    [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
    [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13],
  ],
  [
    [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
    [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
    [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
    [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9],
  ],
  [
    [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
    [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
    [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
    [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12],
  ],
  [
    [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
    [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
    [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
    [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14],
  ],
  [
    [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
    [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
    [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
    [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3],
  ],
  [
    [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
    [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
    [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
    [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13],
  ],
  [
    [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
    [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
    [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
    [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12],
  ],
  [
    [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
    [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
    [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
    [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11],
  ],
];

function permute(bits, table) {
  const out = new Array(table.length);
  for (let i = 0; i < table.length; i += 1) {
    out[i] = bits[table[i] - 1];
  }
  return out;
}

function leftShift(bits, count) {
  return bits.slice(count).concat(bits.slice(0, count));
}

function bytesToBits(bytes) {
  const bits = [];
  for (let i = 0; i < bytes.length; i += 1) {
    for (let b = 7; b >= 0; b -= 1) {
      bits.push((bytes[i] >> b) & 1);
    }
  }
  return bits;
}

function bitsToBytes(bits) {
  const out = new Uint8Array(bits.length / 8);
  for (let i = 0; i < out.length; i += 1) {
    let val = 0;
    for (let b = 0; b < 8; b += 1) {
      val = (val << 1) | bits[i * 8 + b];
    }
    out[i] = val;
  }
  return out;
}

function xorBits(a, b) {
  return a.map((v, i) => v ^ b[i]);
}

function sboxLookup(input48) {
  const out = [];
  for (let i = 0; i < 8; i += 1) {
    const chunk = input48.slice(i * 6, i * 6 + 6);
    const row = (chunk[0] << 1) | chunk[5];
    const col = (chunk[1] << 3) | (chunk[2] << 2) | (chunk[3] << 1) | chunk[4];
    const val = DES_SBOX[i][row][col];
    for (let b = 3; b >= 0; b -= 1) {
      out.push((val >> b) & 1);
    }
  }
  return out;
}

function desKeySchedule(keyBytes) {
  const keyBits = bytesToBits(keyBytes.slice(0, 8));
  const permuted = permute(keyBits, DES_PC1);
  let c = permuted.slice(0, 28);
  let d = permuted.slice(28);
  const keys = [];
  for (let round = 0; round < 16; round += 1) {
    c = leftShift(c, DES_SHIFTS[round]);
    d = leftShift(d, DES_SHIFTS[round]);
    const cd = c.concat(d);
    keys.push(permute(cd, DES_PC2));
  }
  return keys;
}

function desBlock(blockBytes, subKeys, decrypt = false) {
  let blockBits = bytesToBits(blockBytes);
  blockBits = permute(blockBits, DES_IP);
  let l = blockBits.slice(0, 32);
  let r = blockBits.slice(32);
  const rounds = decrypt ? subKeys.slice().reverse() : subKeys;
  for (let i = 0; i < 16; i += 1) {
    const er = permute(r, DES_E);
    const xr = xorBits(er, rounds[i]);
    const sr = sboxLookup(xr);
    const pr = permute(sr, DES_P);
    const newR = xorBits(l, pr);
    l = r;
    r = newR;
  }
  const preoutput = r.concat(l);
  const finalBits = permute(preoutput, DES_FP);
  return bitsToBytes(finalBits);
}

function desCbc(data, keyBytes, ivBytes, decrypt = false) {
  const subKeys = desKeySchedule(keyBytes);
  const blockSize = 8;
  const blocks = [];
  let prev = ivBytes;
  for (let i = 0; i < data.length; i += blockSize) {
    const block = data.slice(i, i + blockSize);
    if (decrypt) {
      const plain = desBlock(block, subKeys, true);
      const out = new Uint8Array(blockSize);
      for (let b = 0; b < blockSize; b += 1) {
        out[b] = plain[b] ^ prev[b];
      }
      blocks.push(out);
      prev = block;
    } else {
      const xored = new Uint8Array(blockSize);
      for (let b = 0; b < blockSize; b += 1) {
        xored[b] = block[b] ^ prev[b];
      }
      const cipher = desBlock(xored, subKeys, false);
      blocks.push(cipher);
      prev = cipher;
    }
  }
  return blocks.reduce((acc, b) => {
    const merged = new Uint8Array(acc.length + b.length);
    merged.set(acc, 0);
    merged.set(b, acc.length);
    return merged;
  }, new Uint8Array());
}

function softwareDesEncrypt(dataBytes, keyBytes, ivBytes, triple = false) {
  const padded = pkcs7Pad(dataBytes, 8);
  if (!triple) {
    return desCbc(padded, keyBytes.slice(0, 8), ivBytes, false);
  }
  const k1 = keyBytes.slice(0, 8);
  const k2 = keyBytes.slice(8, 16);
  const k3 = keyBytes.slice(16, 24);
  const step1 = desCbc(padded, k1, ivBytes, false);
  const step2 = desCbc(step1, k2, ivBytes, true);
  return desCbc(step2, k3, ivBytes, false);
}

function softwareDesDecrypt(dataBytes, keyBytes, ivBytes, triple = false) {
  let result;
  if (!triple) {
    result = desCbc(dataBytes, keyBytes.slice(0, 8), ivBytes, true);
  } else {
    const k1 = keyBytes.slice(0, 8);
    const k2 = keyBytes.slice(8, 16);
    const k3 = keyBytes.slice(16, 24);
    const step1 = desCbc(dataBytes, k3, ivBytes, true);
    const step2 = desCbc(step1, k2, ivBytes, false);
    result = desCbc(step2, k1, ivBytes, true);
  }
  return pkcs7Unpad(result);
}

// web build fallback marker
