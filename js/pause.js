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
    function pauseBGM() {
        try {
            if (typeof currentBGM !== "undefined" && currentBGM) currentBGM.pause();
        } catch (e) {}
    }
    function resumeBGM() {
        try {
            if (typeof currentBGM !== "undefined" && currentBGM) {
                const p = currentBGM.play();
                if (p && typeof p.catch === "function") p.catch(function() {});
            }
        } catch (e) {}
    }
    function pauseGame() {
        if (paused || !canPause()) return;
        paused = true;
        window.GAME_PAUSED = true;
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
        modal.classList.add("active");
        btn.classList.add("active");
    }
    function resumeGame() {
        if (!paused) return;
        paused = false;
        window.GAME_PAUSED = false;
        resumeBGM();
        modal.classList.remove("active");
        btn.classList.remove("active");
        if (typeof window.focusGameCanvas === "function") window.focusGameCanvas();
    }
    function unpauseSilently() {
        paused = false;
        window.GAME_PAUSED = false;
        if (typeof game !== "undefined" && game) game.paused = false;
        if (typeof window.focusGameCanvas === "function") window.focusGameCanvas();
        modal.classList.remove("active");
        btn.classList.remove("active");
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
        if (!paused && canPause()) {
            pauseGame();
        }
    });
    document.addEventListener("visibilitychange", function() {
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
    const retryBtn = document.getElementById("pause-retry-btn");
    const exitBtn = document.getElementById("pause-exit-btn");
    if (resumeBtn) resumeBtn.addEventListener("click", resumeGame);
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
// Isaac Daniel Cotera - 2026 | Correo: isaacdanielcotera@gmail.com | Itch.io: https://cotera.itch.io | GitHub: https://github.com/cotera2024
