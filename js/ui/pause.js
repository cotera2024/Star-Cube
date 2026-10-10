(function() {
    "use strict";
    const modal = document.getElementById("pause-modal");
    const btn = document.getElementById("pause-btn");
    if (!modal || !btn) return;
    let paused = false;
    function canPause() {
        try {
            const inDialog = typeof isDialogActive !== "undefined" && isDialogActive;
            return typeof gameState !== "undefined" && gameState === "playing" && !inDialog;
        } catch (e) {
            return false;
        }
    }
    let _pausedBGM = null;
    function getActiveBossBGM() {
        try {
            if (typeof audios === "undefined" || !audios) return null;
            if (typeof currentLevel === "number" && typeof game !== "undefined" && game) {
                if (currentLevel === 0 && game.blueSquare && game.blueSquare.state === "boss_fight" && !game.blueSquare.defeated) {
                    return audios.bgm_boss_ice;
                }
                if (currentLevel === 1 && game.techBoss && (game.techBoss.state === "fighting" || game.techBoss.state === "battle") && game.techBoss.health > 0) {
                    return audios.bgm_boss_hacker;
                }
                if (currentLevel === 2) {
                    if (window.ValkyrieBoss && window.ValkyrieBoss.state === "fight" && window.ValkyrieBoss.boss && !game.valkBossDefeated) {
                        return audios.bgm_boss_valkyrie;
                    }
                    if (game.yellowSquare && game.yellowSquare.state === "boss_fight" && game.yellowSquare.health > 0) {
                        return audios.bgm_boss_valkyrie;
                    }
                }
                if (currentLevel === 3 && game.krakatoa && (game.krakatoa.state === "attack" || game.krakatoa.state === "submerged" || game.krakatoa.rageMode) && game.krakatoa.health > 0) {
                    return audios.bgm_boss_kraken;
                }
                if (currentLevel === 6 && game.pumpkinBoss && game.pumpkinBoss.health > 0) {
                    if (game.pumpkinBoss.state === "chase") return audios.bgm_pumpkin_chase;
                    if (game.pumpkinBoss.state === "battle") return audios.bgm_boss_pumpkin;
                }
            }
        } catch (e) {}
        return null;
    }

    function pauseBGM() {
        try {
            if (typeof currentBGM !== "undefined" && currentBGM && !currentBGM.paused) {
                _pausedBGM = currentBGM;
                currentBGM.pause();
            } else {
                _pausedBGM = null;
            }
        } catch (e) {}
    }

    function resumeBGM() {
        try {
            const track = _pausedBGM || (typeof currentBGM !== "undefined" && currentBGM ? currentBGM : null) || getActiveBossBGM();
            if (track) {
                track.muted = false;
                track.loop = true;
                if (typeof _attachLoopSafety === "function") _attachLoopSafety(track);
                if (typeof window.isMusicMuted === "function") {
                    track.volume = window.isMusicMuted() ? 0 : (typeof window.getMusicVolume === "function" ? window.getMusicVolume() : 0.8);
                }
                if (typeof currentBGM !== "undefined" && currentBGM && currentBGM !== track) {
                    try {
                        currentBGM.pause();
                    } catch (_) {}
                }
                currentBGM = track;
                const p = track.play();
                if (p && typeof p.catch === "function") p.catch(function() {});
            }
        } catch (e) {}
        _pausedBGM = null;
    }
    function pauseGame() {
        if (paused || !canPause()) return;
        paused = true;
        window.GAME_PAUSED = true;
        if (typeof gsap !== "undefined" && gsap.globalTimeline) {
            try { gsap.globalTimeline.pause(); } catch(e){}
        }
        pauseBGM();
        const isHub = typeof game !== "undefined" && game && game.isHub || typeof currentLevel !== "undefined" && currentLevel === "hub";
        const retryBtn = document.getElementById("pause-retry-btn");
        const exitBtn = document.getElementById("pause-exit-btn");
        const titleBtn = document.getElementById("pause-title-btn");
        if (isHub) {
            if (retryBtn) retryBtn.style.display = "none";
            if (exitBtn) exitBtn.style.display = "none";
            if (titleBtn) titleBtn.style.display = "inline-block";
        } else {
            if (retryBtn) retryBtn.style.display = "inline-block";
            if (exitBtn) exitBtn.style.display = "inline-block";
            if (titleBtn) titleBtn.style.display = "none";
        }
        if (typeof keys !== "undefined") {
            for (let k in keys) keys[k] = false;
        }
        modal.classList.add("active");
        btn.classList.add("active");
    }
    function resumeGame() {
        if (!paused) return;
        if (typeof keys !== "undefined") {
            for (let k in keys) keys[k] = false;
        }
        paused = false;
        window.GAME_PAUSED = false;
        if (typeof gsap !== "undefined" && gsap.globalTimeline) {
            try { gsap.globalTimeline.resume(); } catch(e){}
        }
        resumeBGM();
        modal.classList.remove("active");
        btn.classList.remove("active");
        const optModal = document.getElementById("options-modal");
        if (optModal) optModal.classList.remove("active");
        if (typeof window.focusGameCanvas === "function") window.focusGameCanvas();
    }
    function unpauseSilently() {
        paused = false;
        window.GAME_PAUSED = false;
        if (typeof gsap !== "undefined" && gsap.globalTimeline) {
            try { gsap.globalTimeline.resume(); } catch(e){}
        }
        _pausedBGM = null;
        if (typeof game !== "undefined" && game) game.paused = false;
        if (typeof window.focusGameCanvas === "function") window.focusGameCanvas();
        modal.classList.remove("active");
        btn.classList.remove("active");
        const optModal = document.getElementById("options-modal");
        if (optModal) optModal.classList.remove("active");
    }
    window.forceUnpauseGame = unpauseSilently;
    window.closePauseModal = unpauseSilently;
    window.togglePause = function() {
        if (paused) resumeGame(); else pauseGame();
    };
    window.isGamePaused = function() {
        return paused;
    };
    window.addEventListener("keydown", function(e) {
        if (e.key === "p" || e.key === "P") {
            e.preventDefault();
            if (paused) resumeGame(); else pauseGame();
        }
    });

    window.addEventListener("blur", function() {
        if (typeof keys !== "undefined") {
            for (let k in keys) keys[k] = false;
        }
        if (!paused && canPause()) {
            pauseGame();
        }
    });
    document.addEventListener("visibilitychange", function() {
        if (typeof keys !== "undefined") {
            for (let k in keys) keys[k] = false;
        }
        if (document.hidden && !paused && canPause()) {
            pauseGame();
        }
    });

    btn.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.triggerHaptic === "function") window.triggerHaptic("light");
        if (paused) resumeGame(); else pauseGame();
    });
    const resumeBtn = document.getElementById("pause-resume-btn");
    const pauseFsBtn = document.getElementById("pause-fullscreen-btn");
    const retryBtn = document.getElementById("pause-retry-btn");
    const exitBtn = document.getElementById("pause-exit-btn");
    if (resumeBtn) resumeBtn.addEventListener("click", resumeGame);
    if (pauseFsBtn) pauseFsBtn.addEventListener("click", function() {
        if (typeof window.toggleFullscreen === "function") window.toggleFullscreen();
    });
    if (retryBtn) retryBtn.addEventListener("click", function() {
        unpauseSilently();
        try {
            if (typeof retryCurrentLevel === "function") retryCurrentLevel();
        } catch (e) {}
    });
    if (exitBtn) exitBtn.addEventListener("click", function() {
        unpauseSilently();
        try {
            if (typeof exitToLevelMap === "function") exitToLevelMap();
        } catch (e) {}
    });
    const titleBtn = document.getElementById("pause-title-btn");
    if (titleBtn) titleBtn.addEventListener("click", function() {
        unpauseSilently();
        try {
            if (typeof returnToTitleScreen === "function") returnToTitleScreen();
        } catch (e) {}
    });

    setInterval(function() {
        try {
            const inDialog = typeof isDialogActive !== "undefined" && isDialogActive;
            const inGame = typeof gameState !== "undefined" && gameState === "playing" && !inDialog;
            btn.style.display = inGame ? "flex" : "none";
        } catch (e) {}
    }, 300);
})();
