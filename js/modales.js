window.getMessageDiv = () => document.getElementById("message");

window.getChoiceDiv = () => document.getElementById("choice");

window.getBlackoutDiv = () => document.getElementById("blackout");

window.getCursorDiv = () => document.getElementById("cursorOverlay");

window.getHandDiv = () => document.getElementById("handOverlay");

window.getGameTitle = () => document.getElementById("game-title");

let adReviveRunning = false;

function showAnimatedMessage(text, isGameOver = false) {
    if (isGameOver) {
        document.body.classList.remove("no-cursor");
        getCursorDiv().style.display = "none";
        getHandDiv().style.display = "none";
    }
    getMessageDiv().innerText = text;
    getMessageDiv().style.color = currentLevel >= 2 ? "#ff0000" : "#ffd700";
    getMessageDiv().style.borderColor = currentLevel >= 2 ? "#aa0000" : "#ffd700";
    getMessageDiv().style.fontFamily = "'Fredoka One', cursive";
    getMessageDiv().style.background = "rgba(10,15,30,0.92)";
    gsap.to(getMessageDiv(), {
        scale: 1,
        opacity: 1,
        duration: .5,
        ease: "back.out(1.7)"
    });
    if (!isGameOver) {
        setTimeout(() => {
            gsap.to(getMessageDiv(), {
                scale: 0,
                opacity: 0,
                duration: .5,
                ease: "back.in(1.7)"
            });
        }, 2e3);
    }
}

function levelIndexFromMap(n) {
    if (n === 4) return 4;
    return n - 1;
}

let selectedMapLevel = 1;

const LEVEL_MAP_DATA = {
    1: {
        title: "Nivel 1: Pradera del Amanecer",
        desc: "Inicia la gran aventura con Peggy. Enfrenta los deslices del helado Cuadrado Azul.",
        titleKey: "map_preview_title_1",
        descKey: "map_preview_desc_1",
        icon: "🌄",
        boss: "Jefe: Cuadrado Azul 🧊",
        bossKey: "map_preview_boss_1",
        pos: {
            x: "15%",
            y: "72%"
        }
    },
    2: {
        title: "Nivel 2: Bóveda Cristalina",
        desc: "Laberintos de cristal y tecnología digital con físicas invertidas y zona 8-bit.",
        titleKey: "map_preview_title_2",
        descKey: "map_preview_desc_2",
        icon: "💎",
        boss: "Jefe: Mawlerknight 🤖",
        bossKey: "map_preview_boss_2",
        pos: {
            x: "42%",
            y: "38%"
        }
    },
    3: {
        title: "Nivel 3: Desfiladero Carmesí",
        desc: "Un abismo ardiente infestado por el Demonio Volador y lluvia de fuego.",
        titleKey: "map_preview_title_3",
        descKey: "map_preview_desc_3",
        icon: "🌋",
        boss: "Jefe: Demonio Volador 👹",
        bossKey: "map_preview_boss_3",
        pos: {
            x: "68%",
            y: "70%"
        }
    },
    4: {
        title: "Nivel 4: Cumbres Mareadas",
        desc: "Muelles náuticos y boyas sobre el gran océano. Enfrenta al colosal Kraken marino.",
        titleKey: "map_preview_title_4",
        descKey: "map_preview_desc_4",
        icon: "🌊",
        boss: "Jefe: Krakatoaaa 🐙",
        bossKey: "map_preview_boss_4",
        pos: {
            x: "80%",
            y: "45%"
        }
    },
    5: {
        title: "Nivel 5: El Pasillo Oscuro",
        desc: "La confrontación definitiva en las sombras del pasillo.",
        titleKey: "map_preview_title_5",
        descKey: "map_preview_desc_5",
        icon: "👑",
        boss: "Jefe: ??? 👁️",
        bossKey: "map_preview_boss_5",
        pos: {
            x: "92%",
            y: "24%"
        }
    }
};

function selectLevelNode(n) {
    selectedMapLevel = n;
    const info = LEVEL_MAP_DATA[n] || LEVEL_MAP_DATA[1];
    const pin = document.getElementById("map-player-pin");
    if (pin) {
        pin.style.left = info.pos.x;
        pin.style.top = info.pos.y;
    }
    document.querySelectorAll("#level-map-modal .level-node").forEach(node => {
        const lv = parseInt(node.getAttribute("data-level"), 10);
        node.classList.toggle("selected", lv === n);
    });
    const previewTitle = document.getElementById("preview-title");
    const previewDesc = document.getElementById("preview-desc");
    const previewIcon = document.getElementById("preview-icon");
    const previewBoss = document.getElementById("preview-boss");
    const previewStatus = document.getElementById("preview-status");
    const playBtn = document.getElementById("map-play-btn");
    if (previewTitle) previewTitle.textContent = info.title;
    if (previewDesc) previewDesc.textContent = info.desc;
    if (previewTitle) previewTitle.textContent = typeof __ === "function" ? __(info.titleKey) : (info.title || "");
    if (previewDesc) previewDesc.textContent = typeof __ === "function" ? __(info.descKey) : (info.desc || "");
    if (previewIcon) previewIcon.textContent = info.icon;
    if (previewBoss) previewBoss.textContent = info.boss;
    if (previewBoss) previewBoss.textContent = typeof __ === "function" ? __(info.bossKey) : (info.boss || "");
    const isUnlocked = n <= unlockedLevel;
    if (previewStatus) {
        previewStatus.className = "status-tag " + (isUnlocked ? n < unlockedLevel ? "completed" : "unlocked" : "locked");
        previewStatus.textContent = isUnlocked ? n < unlockedLevel ? "COMPLETADO ✓" : "DESBLOQUEADO ▶" : "BLOQUEADO 🔒";
        previewStatus.textContent = isUnlocked ? (n < unlockedLevel ? (typeof __ === "function" ? __("map_status_completed") : "COMPLETADO ✓") : (typeof __ === "function" ? __("map_status_unlocked") : "DESBLOQUEADO ▶")) : (typeof __ === "function" ? __("map_status_locked") : "BLOQUEADO 🔒");
    }
    if (playBtn) {
        playBtn.style.opacity = isUnlocked ? "1" : "0.5";
        playBtn.style.cursor = isUnlocked ? "pointer" : "not-allowed";
        playBtn.textContent = isUnlocked ? "▶ ¡JUGAR NIVEL!" : "🔒 BLOQUEADO";
        playBtn.textContent = isUnlocked ? (typeof __ === "function" ? __("map_btn_play") : "▶ ¡JUGAR NIVEL!") : (typeof __ === "function" ? __("map_btn_locked") : "🔒 BLOQUEADO");
    }
    try {
        playSound(400 + n * 120, .08, "sine", .15);
    } catch (e) {}
}

window.selectLevelNode = selectLevelNode;

function confirmChooseSelectedLevel() {
    if (selectedMapLevel <= unlockedLevel) {
        chooseLevel(selectedMapLevel);
    }
}

window.confirmChooseSelectedLevel = confirmChooseSelectedLevel;

function showLevelMap() {
    gameState = "levelmap";
    document.body.classList.remove("no-cursor");
    if (getCursorDiv()) getCursorDiv().style.display = "none";
    if (getHandDiv()) getHandDiv().style.display = "none";
    const modal = document.getElementById("level-map-modal");
    if (!modal) return;
    document.querySelectorAll("#level-map-modal .level-node").forEach(card => {
        const lv = parseInt(card.getAttribute("data-level"), 10);
        const unlocked = lv <= unlockedLevel;
        card.classList.toggle("unlocked", unlocked);
        card.classList.toggle("locked", !unlocked);
        const lock = card.querySelector(".level-card-lock");
        if (lock) lock.textContent = unlocked ? "▶" : "🔒";
    });
    const activePath = document.getElementById("map-active-path");
    if (activePath) {
        const strokeDash = [ 0, "260 1000", "520 1000", "780 1000", "1000 1000" ][unlockedLevel] || "1000 1000";
        activePath.style.strokeDasharray = strokeDash;
    }
    selectLevelNode(Math.min(unlockedLevel, 4));
    gsap.fromTo(modal.querySelector(".modal-box"), {
        scale: .85,
        opacity: 0
    }, {
        scale: 1,
        opacity: 1,
        duration: .45,
        ease: "back.out(1.4)"
    });
    modal.classList.add("active");
}

window.showLevelMap = showLevelMap;

function chooseLevel(n) {
    if (n > unlockedLevel) return;
    const modal = document.getElementById("level-map-modal");
    if (modal) modal.classList.remove("active");
    const idx = levelIndexFromMap(n);
    adReviveUsed = false;
    window.loadLevel(idx);
    gameState = "playing";
    if (window.showAnimatedMessage) {
        try {
            window.showAnimatedMessage(__("map_entrando_" + n) || __("level_name_" + n) + " ▶", false);
        } catch (e) {}
    }
}

window.chooseLevel = chooseLevel;

function exitToLevelMapTitle() {
    const modal = document.getElementById("level-map-modal");
    if (modal) modal.classList.remove("active");
    if (typeof returnToTitleScreen === "function") {
        returnToTitleScreen();
    } else {
        cleanupLevelAudioAndFX();
        const gameTitle = document.getElementById("game-title");
        if (gameTitle) gameTitle.style.opacity = "1";
        const titleBtns = document.getElementById("title-buttons");
        if (titleBtns) titleBtns.classList.remove("hidden");
        const langToggleBtn = document.getElementById("btn-lang-toggle");
        if (langToggleBtn) langToggleBtn.style.display = "flex";
        try {
            if (typeof playBGM === "function") playBGM("bgm_menu_title");
        } catch (e) {}
    }
}

window.exitToLevelMapTitle = exitToLevelMapTitle;

function getNextHubDoorNum(lvl) {
    if (lvl === 0) return 2;
    if (lvl === 3) return 3;
    if (lvl === 2) return 4;
    if (lvl === 1) return 5;
    if (lvl === 6) return 6;
    if (typeof lvl === "number" && lvl >= 1 && lvl <= 6) return lvl;
    return 2;
}

window.getNextHubDoorNum = getNextHubDoorNum;

function getHubDoorIndexForLevel(lvl) {
    return lvl === 0 ? 0 : lvl === 3 ? 1 : lvl === 2 ? 2 : lvl === 1 ? 3 : lvl === 6 ? 4 : lvl === 4 ? 5 : 0;
}

window.getHubDoorIndexForLevel = getHubDoorIndexForLevel;

function nowLevelClearAd() {}

window.nowLevelClearAd = nowLevelClearAd;

function unlockAndShowMap(nextLevel) {
    nowLevelClearAd();
    adReviveUsed = false;
    let targetDoorNum = nextLevel;
    if (typeof currentLevel === "number" && (nextLevel === undefined || nextLevel === currentLevel + 2 || nextLevel === currentLevel + 1)) {
        targetDoorNum = getNextHubDoorNum(currentLevel);
    } else if (typeof nextLevel === "number") {
        targetDoorNum = nextLevel;
    }
    if (targetDoorNum > unlockedLevel) {
        window.pendingUnlockDoorNum = targetDoorNum;
    }
    cleanupLevelAudioAndFX();
    let originDoorIndex = (typeof currentLevel === "number" && currentLevel >= 0) ? getHubDoorIndexForLevel(currentLevel) : 0;
    if (typeof window.loadHubLevel === "function") {
        window.loadHubLevel(originDoorIndex);
    } else {
        showLevelMap();
    }
}

window.unlockAndShowMap = unlockAndShowMap;

function cleanupLevelAudioAndFX() {
    try {
        if (typeof currentBGM !== "undefined" && currentBGM) {
            currentBGM.pause();
            currentBGM.currentTime = 0;
        }
    } catch (e) {}
    try {
        if (typeof stopAllSFX === "function") stopAllSFX();
    } catch (e) {}
    try {
        if (typeof window.stopHalloweenAudio === "function") window.stopHalloweenAudio();
    } catch (e) {}
    try {
        if (window.TurretSystem) window.TurretSystem.clear();
    } catch (e) {}
    try {
        if (Array.isArray(projectiles)) projectiles.length = 0;
    } catch (e) {}
    try {
        if (Array.isArray(enemyProjectiles)) enemyProjectiles.length = 0;
    } catch (e) {}
    try {
        if (Array.isArray(particles)) particles.length = 0;
    } catch (e) {}
    try {
        if (Array.isArray(floatingTexts)) floatingTexts.length = 0;
    } catch (e) {}
    try {
        if (Array.isArray(slashes)) slashes.length = 0;
    } catch (e) {}
    try {
        if (Array.isArray(blood)) blood.length = 0;
    } catch (e) {}
    try {
        if (Array.isArray(restos)) restos.length = 0;
    } catch (e) {}
    try {
        window.GAME_PAUSED = false;
    } catch (e) {}
    try {
        if (window.getMessageDiv) {
            getMessageDiv().style.opacity = "0";
        }
    } catch (e) {}
    try {
        gsap.to(getMessageDiv(), {
            scale: 0,
            opacity: 0,
            duration: .2
        });
    } catch (e) {}
    try {
        if (window.hideChoice) hideChoice();
    } catch (e) {}
}

function exitToLevelMap() {
    window.GAME_PAUSED = false;
    if (typeof game !== "undefined" && game) game.paused = false;
    if (typeof window.forceUnpauseGame === "function") window.forceUnpauseGame();
    if (typeof window.crazyGameplayStop === "function") window.crazyGameplayStop();
    [ "pause-modal", "gameover-modal", "defeat-modal", "victory-modal", "level-map-modal" ].forEach(function(id) {
        const m = document.getElementById(id);
        if (m) {
            m.classList.remove("active");
            m.style.display = "";
        }
    });
    document.body.classList.remove("no-cursor");
    document.body.style.overflow = "";
    if (getCursorDiv()) getCursorDiv().style.display = "none";
    if (getHandDiv()) getHandDiv().style.display = "none";
    cleanupLevelAudioAndFX();
    currentCheckpoint = null;
    if (typeof game !== "undefined") {
        game.valkBossDefeated = false;
        game.eruptingMode = false;
    }
    if (typeof window.loadHubLevel === "function") {
        window.loadHubLevel();
    } else {
        showLevelMap();
    }
}

window.exitToLevelMap = exitToLevelMap;

function returnToTitleScreen() {
    [ "pause-modal", "gameover-modal", "defeat-modal", "victory-modal", "level-map-modal" ].forEach(function(id) {
        const m = document.getElementById(id);
        if (m) m.classList.remove("active");
    });
    document.body.classList.remove("no-cursor");
    if (getCursorDiv()) getCursorDiv().style.display = "none";
    if (getHandDiv()) getHandDiv().style.display = "none";
    cleanupLevelAudioAndFX();
    currentCheckpoint = null;
    if (typeof game !== "undefined") {
        game.valkBossDefeated = false;
        game.eruptingMode = false;
    }
    gameState = "start";
    window.GAME_PAUSED = false;
    currentLevel = -1;
    const uiOverlay = document.getElementById("ui-overlay");
    if (uiOverlay) uiOverlay.style.display = "none";
    const touchControls = document.getElementById("touch-controls");
    if (touchControls) touchControls.style.display = "none";
    const dialogBox = document.getElementById("dialog-box");
    if (dialogBox) dialogBox.className = "dialog-hidden";
    const blackout = document.getElementById("blackout");
    if (blackout) blackout.style.opacity = "0";
    const msg = document.getElementById("message");
    if (msg) msg.style.opacity = "0";
    const gameTitle = document.getElementById("game-title");
    if (gameTitle) gameTitle.style.opacity = "1";
    const titleBtns = document.getElementById("title-buttons");
    if (titleBtns) titleBtns.classList.remove("hidden");
    const langToggleBtn = document.getElementById("btn-lang-toggle");
    if (langToggleBtn) langToggleBtn.style.display = "flex";
    if (typeof updateUITranslations === "function") updateUITranslations();
    gameReady = true;
    try {
        playBGM("bgm_menu_title");
    } catch (e) {}
}

window.returnToTitleScreen = returnToTitleScreen;

function showVictoryModal() {
    gameState = "win";
    if (currentBGM) {
        currentBGM.pause();
        currentBGM.currentTime = 0;
    }
    playSound(523.25, .4, "sine", .3, 1046.5);
    const victoryModal = document.getElementById("victory-modal");
    const victoryScore = document.getElementById("victory-score");
    if (victoryScore) victoryScore.textContent = score;
    if (victoryModal) victoryModal.classList.add("active");
}

window.showVictoryModal = showVictoryModal;

function restartGame() {
    score = 0;
    updateScore(score);
    const victoryModal = document.getElementById("victory-modal");
    if (victoryModal) victoryModal.classList.remove("active");
    const goModal = document.getElementById("gameover-modal");
    if (goModal) goModal.classList.remove("active");
    const mapModal = document.getElementById("level-map-modal");
    if (mapModal) mapModal.classList.remove("active");
    getChoiceDiv().style.display = "none";
    getMessageDiv().style.opacity = "0";
    gsap.to(getMessageDiv(), {
        scale: 0,
        opacity: 0,
        duration: .2
    });
    cleanupLevelAudioAndFX();
    window.loadLevel(0);
    gameState = "playing";
    window.showAnimatedMessage(__("msg_mundo1"));
}

window.restartGame = restartGame;

function showGameOverModal() {
    gameState = "defeat";
    document.body.classList.remove("no-cursor");
    document.body.style.overflow = "hidden";
    if (getCursorDiv()) getCursorDiv().style.display = "none";
    if (getHandDiv()) getHandDiv().style.display = "none";
    try {
        getBlackoutDiv().style.opacity = 1;
    } catch (e) {}
    adReviveRunning = false;
    const modal = document.getElementById("gameover-modal");
    if (modal) modal.classList.add("active");
    setupAdReviveUI();
}

function setupAdReviveUI() {}
function startAdRevive() {}
function adRunningNote(txt) {}
function showAdReviveButton() {}
function retryAdRevive() {}
function abortAdRevive() {}
function grantAdRevive() {}

window.showGameOverModal = showGameOverModal;

window.showAnimatedMessage = showAnimatedMessage;

window.showChoice = showChoice;

window.hideChoice = hideChoice;

window.handlePlayerDefeat = function() {
    playerLives = Math.max(0, playerLives - 1);
    if (typeof window.updateLivesDisplay === "function") window.updateLivesDisplay();
    if (playerLives > 0) {
        gameState = "respawning";
        try {
            showAnimatedMessage(__("msg_lives_left").replace("%n", playerLives), true);
        } catch (e) {}
        setTimeout(function() {
            try {
                getBlackoutDiv().style.opacity = 0;
            } catch (e) {}
            try {
                gsap.to(getMessageDiv(), {
                    scale: 0,
                    opacity: 0,
                    duration: .2
                });
            } catch (e) {}
            window.loadLevel(currentLevel, true);
        }, 1100);
    } else {
        setTimeout(function() {
            showGameOverModal();
        }, 600);
    }
};

function retryCurrentLevel() {
    window.GAME_PAUSED = false;
    if (typeof game !== "undefined" && game) game.paused = false;
    if (typeof window.forceUnpauseGame === "function") {
        window.forceUnpauseGame();
    } else {
        const pm = document.getElementById("pause-modal");
        if (pm) pm.classList.remove("active");
        const pb = document.getElementById("pause-btn");
        if (pb) pb.classList.remove("active");
    }
    const modal = document.getElementById("gameover-modal");
    if (modal) {
        modal.classList.remove("active");
        modal.style.display = "";
    }
    document.body.style.overflow = "";

    playerLives = typeof MAX_LIVES !== "undefined" ? MAX_LIVES : 3;
    if (typeof window.updateLivesDisplay === "function") window.updateLivesDisplay();
    getBlackoutDiv().style.opacity = 0;
    gsap.to(getMessageDiv(), {
        scale: 0,
        opacity: 0,
        duration: 0.2
    });
    currentCheckpoint = null;
    adReviveUsed = false;
    if (typeof game !== "undefined") {
        game.valkBossDefeated = false;
        game.eruptingMode = false;
    }
    window.loadLevel(currentLevel, false);
    if (typeof window.focusGameCanvas === "function") window.focusGameCanvas();
}

window.retryCurrentLevel = retryCurrentLevel;

function exitToTitle() {
    try {
        stopAllSFX();
    } catch (e) {}
    try {
        if (currentBGM) {
            currentBGM.pause();
        }
    } catch (e) {}
    window.location.reload();
}

window.exitToTitle = exitToTitle;

function showChoice() {
    getChoiceDiv().style.display = "flex";
}

function hideChoice() {
    getChoiceDiv().style.display = "none";
}
// Isaac Daniel Cotera - 2026 | Correo: isaacdanielcotera@gmail.com | Itch.io: https://cotera.itch.io | GitHub: https://github.com/cotera2024
