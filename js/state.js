let time = 0;

let currentLevel = 0;

let gameState = "start";

let projectiles = [];

let enemyProjectiles = [];

let slashes = [];

let blood = [];

let restos = [];

let stars = [];

let checkpoints = [];

let currentCheckpoint = null;

let keys = {};

let game = {};

window.__godDmg = function(base) {
    return game && game.godMode ? 999 : typeof base === "number" ? base : 0;
};

window.isMobileDevice = typeof window !== "undefined" && (window.matchMedia && window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window || typeof navigator !== "undefined" && (navigator.maxTouchPoints > 0 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent)));

window.isMobileOrTouch = function() {
    if (window.isMobileDevice) return true;
    if (typeof document !== "undefined") {
        const tc = document.getElementById("touch-controls");
        if (tc && (tc.style.display === "block" || window.getComputedStyle && window.getComputedStyle(tc).display === "block")) return true;
    }
    if ("ontouchstart" in window || typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) return true;
    return false;
};

let score = 0;

let unlockedLevel = 1;

try {
    const savedLvl = parseInt(localStorage.getItem("starcube_unlocked_v2"), 10);
    if (!isNaN(savedLvl) && savedLvl >= 1 && savedLvl <= 6) {
        unlockedLevel = savedLvl;
    }
} catch (e) {}

let postGameHorror = false;

try {
    if (localStorage.getItem("starcube_horror_mode") === "true") {
        postGameHorror = true;
    }
} catch (e) {}

window.postGameHorror = postGameHorror;

let gameReady = false;

let playerLives = 3;

const MAX_LIVES = 3;

let adReviveUsed = false;
window.adReviveUsed = adReviveUsed;

let CINEMA_TOKEN = 0;

let bfShow = false;

let bfTargetX = VIEW_W / 2;

let bfTargetY = VIEW_H / 2;

let bfAlpha = 0;

let bfStalk = 0, bfTeeth = 0, bfLaugh = 0, bfAnnoyed = 0, bfEnraged = 0;

let bfShock = 0, bfNightmare = 0;

let bfHitFrames = 0;

let bfPointerX = VIEW_W / 2, bfPointerY = VIEW_H / 2;