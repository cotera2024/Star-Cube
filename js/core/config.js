
let VIEW_W = 1024;
window.VIEW_W = VIEW_W;

const VIEW_H = 576;
window.VIEW_H = VIEW_H;

const GRAVITY = 0.6;
const JUMP_FORCE = -13.5;
const MOVE_SPEED = 5.5;
const FRICTION = 0.82;
const PLAYER_MAX_HEALTH = 100;
const PLAYER_DAMAGE_MULT = 1;
const PROJECTILE_SPEED = 12;
const ENEMY_PROJECTILE_SPEED = 6;
const DASH_SPEED = 22;
const DASH_DURATION = 13;
const DASH_COOLDOWN = 28;
const DASH_INVULN = 16;
const DASH_SHOW_TRAIL = 10;
const DASH_MAX_SPEED = 25;
const DASH_MAX_DURATION = 16;
const DASH_MAX_COOLDOWN = 30;
const DASH_MAX_INVULN = 20;
const DASH_MAX_TRAIL = 16;
const BF_MAX_HIT = 25;

window.addEventListener("keydown", (event) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
        event.preventDefault();
    }
});

window.focusGameCanvas = function() {
    try {
        const canvas = document.getElementById("gameCanvas");
        if (canvas && typeof canvas.focus === "function") {
            canvas.focus();
        }
        if (typeof window.focus === "function") {
            window.focus();
        }
    } catch (e) {}
};

window.addEventListener("DOMContentLoaded", () => {
    try {
        const canvas = document.getElementById("gameCanvas");
        if (canvas) {
            canvas.addEventListener("pointerdown", () => {
                window.focusGameCanvas();
            });
        }
    } catch (e) {}
});

let _cheatBuffer = "";

window.resetProgress = function() {
    unlockedLevel = 1;
    try {
        localStorage.setItem("starcube_unlocked_v2", 1);
    } catch (e) {}
    window.pendingUnlockDoorNum = null;
    window._cavernEntranceBlownPermanently = false;
    if (typeof window.showAnimatedMessage === "function") {
        window.showAnimatedMessage(typeof __ === "function" ? __("msg_progress_reset") : "Progreso reiniciado a Nivel 1", true);
    }
    if (typeof window.loadHubLevel === "function") {
        window.loadHubLevel(0);
    }
};

window.toggleGodMode = function() {
    if (typeof game === "undefined") return;
    game.godMode = !game.godMode;
    if (game.godMode) {
        if (typeof window.showAnimatedMessage === "function") {
            window.showAnimatedMessage(typeof __ === "function" ? __("msg_godmode_on") : "🔥 ¡MODO DIOS ACTIVADO! 🔥", true);
        }
        try {
            playSound(800, 0.3, "square", 0.4, 600);
        } catch (e) {}
    } else {
        if (typeof window.showAnimatedMessage === "function") {
            window.showAnimatedMessage(typeof __ === "function" ? __("msg_godmode_off") : "❌ Modo dios desactivado", true);
        }
    }
};
window.godMode = window.toggleGodMode;
window.godmode = window.toggleGodMode;
window.goodMode = window.toggleGodMode;
window.goodmode = window.toggleGodMode;

window.activateFullGameHorror = function() {
    unlockedLevel = 6;
    window.unlockedLevel = 6;
    try {
        (typeof window !== "undefined" && typeof window.storageSet === "function" ? window.storageSet : (k, v) => localStorage.setItem(k, v))("starcube_unlocked_v2", "6");
    } catch (err) {}
    try {
        (typeof window !== "undefined" && typeof window.storageSet === "function" ? window.storageSet : (k, v) => localStorage.setItem(k, v))("starcube_horror_mode", "true");
    } catch (err) {}
    window.postGameHorror = true;
    if (typeof postGameHorror !== "undefined") postGameHorror = true;
    window.pendingUnlockDoorNum = null;
    document.body.classList.add("horror-mode");

    [ "pause-modal", "gameover-modal", "defeat-modal", "victory-modal", "level-map-modal", "controls-modal", "credits-modal", "options-modal" ].forEach(id => {
        const m = document.getElementById(id);
        if (m) m.classList.remove("active");
    });

    try {
        if (typeof playSFX === "function") {
            playSFX("sfx_demon_scream");
        } else if (typeof playSound === "function") {
            playSound(90, 0.8, "sawtooth", 0.4, 45);
        }
    } catch (err) {}

    try {
        if (typeof applyShake === "function") applyShake(30);
    } catch (e) {}

    if (typeof window.loadHubLevel === "function") {
        window.loadHubLevel();
    }

    if (typeof window.showAnimatedMessage === "function") {
        const msg = typeof __ === "function" ? __("flt_modo_terror_on") : "☠ ¡MODO TERROR ACTIVADO! ☠";
        window.showAnimatedMessage(msg, true);
    }
};
window.fullgame = window.activateFullGameHorror;
window.fullGame = window.activateFullGameHorror;
window.full_game = window.activateFullGameHorror;

window.rayoSupremo = function() {
    if (typeof game === "undefined" || !game.player) {
        if (typeof window.showAnimatedMessage === "function") {
            window.showAnimatedMessage(typeof __ === "function" ? __("msg_game_not_started") : "⚠️ El juego aún no ha iniciado", true);
        }
        return;
    }
    if (game.isHub || currentLevel === "hub" || typeof currentLevel !== "number" || currentLevel < 0 || currentLevel >= levels.length) {
        if (typeof window.showAnimatedMessage === "function") {
            window.showAnimatedMessage(typeof __ === "function" ? __("msg_enter_level_lightning") : "⚠️ Entra a un nivel para usar Rayo Supremo", true);
        }
        return;
    }

    const levelData = levels[currentLevel];
    if (!levelData) return;

    try {
        if (typeof gsap !== "undefined") {
            gsap.killTweensOf(game);
            if (game.player) gsap.killTweensOf(game.player);
        }
    } catch (e) {}
    try {
        CINEMA_TOKEN++;
    } catch (e) {}

    game.arenaLocked = false;
    delete game.arenaMinX;
    delete game.arenaMaxX;
    delete game.cameraOverrideX;
    delete game.cameraOverrideY;
    delete game.cameraZoom;
    delete game.zoomTargetWorldX;
    delete game.zoomTargetWorldY;
    game.camY = 0;
    game._entryLock = 0;

    if (game.blueSquare) {
        game.blueSquare.state = "defeated";
        game.blueSquare._defeatDialogShown = true;
        game.blueSquare.isBoss = false;
    }
    if (game.techBoss) {
        game.techBoss.state = "defeated";
        game.techBoss._deathScreenTimer = 0;
        game.techBoss.showChoice = false;
        game.techBoss.vibeTerminal = false;
    }
    if (game.yellowSquare) {
        game.yellowSquare.state = "defeated";
        game.yellowSquare._defeatDialogShown = true;
        game.yellowSquare.isBoss = false;
    }
    if (game.krakatoa) {
        game.krakatoa.state = "defeated";
        game.krakatoa.health = 0;
        game.krakatoa.sealActive = false;
    }
    if (game.pumpkinBoss) {
        game.pumpkinBoss.state = "defeated";
        game.pumpkinBoss.health = 0;
    }
    if (window.ValkyrieBoss) {
        window.ValkyrieBoss.state = "defeated";
    }
    game.boss1Defeated = true;
    game.valkBossDefeated = true;
    game.eruptingMode = false;
    game.hideHealthBar = false;
    game.invertControls = false;

    if (Array.isArray(game.platforms)) {
        game.platforms.forEach(p => {
            if (p.isArenaGate) {
                p.y = -250;
            }
            if (p.button) {
                p.button = false;
                p.active = false;
            }
        });
    }

    if (window.BossHUD && typeof window.BossHUD.hide === "function") {
        window.BossHUD.hide();
    }
    const dialogBox = document.getElementById("dialog-box");
    if (dialogBox) dialogBox.className = "dialog-hidden";
    if (typeof isDialogActive !== "undefined") isDialogActive = false;

    game.spawnPortal = null;
    if (typeof game.player.dashTimer === "number") game.player.dashTimer = 0;
    game.player.frozen = false;
    game.player.hidden = false;
    game.player.vx = 0;
    game.player.vy = 0;
    game.player.facing = 1;
    game.player.onGround = true;

    if (levelData.jaula) {
        game.player.x = levelData.jaula.x - 140;
        const groundY = levelData.jaula.y + levelData.jaula.h;
        game.player.y = groundY - (game.player.h || 32);

        game.cageState = 0;
        game.cageBtnPressed = false;
        game.cageOpenProgress = 0;
        game.cageCelebrateTimer = 0;
        if (!game.cageFriends || game.cageFriends.length === 0) {
            game.cageFriends = ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#ff8f6b"];
        }
    } else if (levelData.door) {
        game.player.x = levelData.door.x - 140;
        const groundY = levelData.door.y + levelData.door.h;
        game.player.y = groundY - (game.player.h || 32);
        levelData.door.active = true;
    }

    if (typeof cameraX !== "undefined" && typeof worldWidth !== "undefined") {
        cameraX = Math.max(0, Math.min(game.player.x - VIEW_W / 2 + (game.player.w || 32) / 2, worldWidth - VIEW_W));
    }

    if (typeof window.showAnimatedMessage === "function") {
        window.showAnimatedMessage(typeof __ === "function" ? __("msg_supreme_lightning") : "⚡ ¡RAYO SUPREMO! ⚡", true);
    }
    try {
        if (typeof playSound === "function") {
            playSound(1200, 0.3, "sawtooth", 0.5, 800);
        }
    } catch (e) {}
};
window.rayosupremo = window.rayoSupremo;

window.addEventListener("keydown", (event) => {
    if (event.key) {
        if (event.key === "Backspace") {
            _cheatBuffer = _cheatBuffer.slice(0, -1);
        } else if (event.key.length === 1) {
            _cheatBuffer += event.key.toLowerCase();
        }
    }
    if (_cheatBuffer.length > 50) {
        _cheatBuffer = _cheatBuffer.slice(-50);
    }

    const cleanBuf = _cheatBuffer.replace(/[^a-z0-9]/g, "");

    if (cleanBuf.endsWith("resetprogreso") || cleanBuf.endsWith("reset1")) {
        _cheatBuffer = "";
        window.resetProgress();
        return;
    }
    if (cleanBuf.endsWith("goodmode123") || cleanBuf.endsWith("godmode123") || cleanBuf.endsWith("goodmode") || cleanBuf.endsWith("godmode")) {
        _cheatBuffer = "";
        window.toggleGodMode();
        return;
    }
    if (cleanBuf.endsWith("rayosupremo")) {
        _cheatBuffer = "";
        window.rayoSupremo();
        return;
    }
    if (cleanBuf.endsWith("fullgame") || cleanBuf.endsWith("fullgame123")) {
        _cheatBuffer = "";
        window.activateFullGameHorror();
        return;
    }
});

window.triggerHappyMoment = function() {};
window.gameLoadingStart = window.gameLoadingStop = function() {};
window.gameplayStart = window.gameplayStop = function() {};
window.isGamePausedForAd = false;
window._adInProgress = false;
window.requestMidroll = window.requestCrazyMidroll = function(cb) {
    if (typeof cb === "function") cb();
};
window.pauseGameForAd = function() {};
window.resumeGameFromAd = function() {};

if (typeof CanvasRenderingContext2D !== "undefined") {
    if (!CanvasRenderingContext2D.prototype.roundRect) {
        CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
            if (!radii) radii = 0;
            let r = typeof radii === "number" ? radii : (Array.isArray(radii) ? radii[0] : 0);
            r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
            this.moveTo(x + r, y);
            this.arcTo(x + w, y, x + w, y + h, r);
            this.arcTo(x + w, y + h, x, y + h, r);
            this.arcTo(x, y + h, x, y, r);
            this.arcTo(x, y, x + w, y, r);
            this.closePath();
            return this;
        };
    }
    if (!CanvasRenderingContext2D.prototype.ellipse) {
        CanvasRenderingContext2D.prototype.ellipse = function(x, y, rx, ry, rotation, startAngle, endAngle, anticlockwise) {
            this.save();
            this.translate(x, y);
            this.rotate(rotation || 0);
            this.scale(rx, ry);
            this.arc(0, 0, 1, startAngle || 0, endAngle !== undefined ? endAngle : 2 * Math.PI, anticlockwise || false);
            this.restore();
        };
    }
}

