(function() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const messageDiv = document.getElementById("message");
    const uiOverlay = document.getElementById("ui-overlay");
    const controlsInfo = document.getElementById("controls-info");
    const blackoutDiv = document.getElementById("blackout");
    const choiceDiv = document.getElementById("choice");
    const btnSi = document.getElementById("btnSi");
    const btnNo = document.getElementById("btnNo");
    const handDiv = document.getElementById("handOverlay");
    const cursorDiv = document.getElementById("cursorOverlay");
    const choiceText = document.getElementById("choice-text");
    const choiceSub = document.getElementById("choice-sub");
    const splashScreen = document.getElementById("splash-screen");
    const langSelect = document.getElementById("lang-select");
    const gameTitle = document.getElementById("game-title");
    const langTitle = document.getElementById("lang-title");
    const splashAuthor = document.getElementById("splash-author");
    canvas.width = VIEW_W;
    canvas.height = VIEW_H;
    function spawnHuntEnemy() {
        const vw = (typeof window.VIEW_W === "number" && window.VIEW_W) ? window.VIEW_W : 1024;
        const ex = cameraX + Math.min(vw * 0.72, vw - 140) + Math.random() * 30;
        const friendCols = [ "#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#ff8f6b", "#c77dff", "#ff5d8f", "#5fd0e8" ];
        const fCol = friendCols[(game.huntKills || 0) % friendCols.length];
        game.huntEnemy = new Enemy({
            x: ex,
            y: 442,
            w: 40,
            h: 40,
            health: 1,
            speed: 0,
            range: 0,
            shoot: false,
            color: fCol
        });
        game.huntEnemy.color = fCol;
        game.huntEnemy.fleeSpeed = 4.0 + Math.random() * .4;
        game.huntEnemy.spotted = false;
        game.huntEnemy.wanderT = 0;
        game.huntEnemy.killProcessed = false;
        game.enemies = [ game.huntEnemy ];
        game.huntEnemy.spotted = false;
    }
    function startCaceria() {
        gsap.to(messageDiv, {
            scale: 0,
            opacity: 0,
            duration: .3
        });
        game.lvl4State = "hunt";
        game.lvl4Timer = 0;
        game.inHunt = true;
        game.demon.vanish();
        worldWidth = 2e5;
        game.platforms = [ new Platform({
            x: -1e5,
            y: 500,
            w: 3e5,
            h: 80
        }) ];
        game.happyMode = true;
        game.sadEnemies = true;
        game.huntKills = 0;
        game.dread = 0;
        game.freeRoam = true;
        game.vignette = false;
        game.vignetteRadius = 300;
        game.player.frozen = false;
        game.player.invulnerable = 60;
        game.player.slashCooldown = 0;
        game.player.x = 320;
        game.player.y = 440;
        game.player.vy = 0;
        game.camY = 0;
        document.body.style.background = "#87CEEB";
        blackoutDiv.style.opacity = 0;
        game.flash = 22;
        spawnHuntEnemy();
        playBGM("bgm_world1_meadow");
        window.showAnimatedMessage(__("msg_superate"), false);
    }
    function drawCheckpoint(ctx, cp, cameraX, t) {
        let groundY = cp.y + 60;
        if (game && Array.isArray(game.platforms)) {
            for (let p of game.platforms) {
                if (!p.broken && !p.spikes && cp.x + 12 >= p.x && cp.x + 12 <= p.x + p.w && p.y >= cp.y - 20 && p.y <= cp.y + 110) {
                    groundY = p.y;
                    break;
                }
            }
        }
        cp.groundY = groundY;
        const screenX = cp.x - cameraX;
        const screenY = groundY - 60;
        if (screenX < -120 || screenX > VIEW_W + 120) return;
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath();
        ctx.ellipse(screenX + 12, groundY, 20, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = cp.activated ? "#38bdf8" : "#475569";
        ctx.fillRect(screenX - 4, groundY - 12, 32, 8);
        ctx.fillStyle = cp.activated ? "#0284c7" : "#334155";
        ctx.fillRect(screenX - 8, groundY - 4, 40, 4);
        ctx.fillStyle = cp.activated ? "#ffffff" : "#94a3b8";
        ctx.fillRect(screenX + 10, screenY - 24, 5, 72);
        ctx.fillStyle = cp.activated ? "#00ffff" : "#64748b";
        if (cp.activated) {
            ctx.shadowColor = "#00ffff";
            ctx.shadowBlur = 15 + Math.sin(t * .1) * 8;
        }
        ctx.beginPath();
        ctx.arc(screenX + 12.5, screenY - 26, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        const wave = Math.sin(t * .08 + cp.x * .02) * 6;
        ctx.beginPath();
        ctx.moveTo(screenX + 15, screenY - 22);
        ctx.quadraticCurveTo(screenX + 32, screenY - 22 + wave, screenX + 50, screenY - 14 + wave);
        ctx.quadraticCurveTo(screenX + 32, screenY + 4 + wave, screenX + 15, screenY + 8);
        ctx.closePath();
        if (cp.activated) {
            const flagGrad = ctx.createLinearGradient(screenX + 15, screenY - 22, screenX + 50, screenY + 8);
            flagGrad.addColorStop(0, "#00ffff");
            flagGrad.addColorStop(.5, "#ff3388");
            flagGrad.addColorStop(1, "#ffd700");
            ctx.fillStyle = flagGrad;
            ctx.shadowColor = "#00ffff";
            ctx.shadowBlur = 8;
        } else {
            ctx.fillStyle = "#64748b";
        }
        ctx.fill();
        ctx.shadowBlur = 0;
        if (cp.activated) {
            ctx.fillStyle = "#ffffff";
            ctx.font = "14px sans-serif";
            ctx.fillText("★", screenX + 24, screenY - 4 + wave * .5);
            if (Math.random() < .35) {
                particles.push({
                    x: cp.x + 12 + (Math.random() - .5) * 30,
                    y: cp.y + 40 - Math.random() * 60,
                    vx: (Math.random() - .5) * 1.2,
                    vy: -Math.random() * 1.8 - .5,
                    life: 30,
                    color: Math.random() > .5 ? "#00ffff" : "#ffd700",
                    size: Math.random() * 4 + 2,
                    type: "spark"
                });
            }
        } else {
            ctx.fillStyle = "#cbd5e1";
            ctx.font = "12px sans-serif";
            ctx.fillText("🚩", screenX + 24, screenY - 4 + wave * .5);
        }
        ctx.restore();
    }
    function updateAndDrawSpawnPortal(ctx, cameraX) {
        if (!game.spawnPortal) return;
        const p = game.spawnPortal;
        p.timer = (p.timer || 0) + 1;
        p.rotation = (p.rotation || 0) + .08;
        if (p.state === "opening") {
            p.scale = (p.scale || 0) + (1.05 - (p.scale || 0)) * .16;
            if (Math.random() < .6) {
                const ang = Math.random() * Math.PI * 2;
                const dist = 36 + Math.random() * 20;
                particles.push({
                    x: p.x + Math.cos(ang) * dist,
                    y: p.y + Math.sin(ang) * dist,
                    vx: -Math.cos(ang) * 2.8,
                    vy: -Math.sin(ang) * 2.8,
                    color: Math.random() > .5 ? "#a855f7" : "#c084fc",
                    size: 2.5,
                    life: 14,
                    type: "spark"
                });
            }
            if (p.scale >= .95 && p.timer > 16) {
                p.state = "emerging";
                p.timer = 0;
                if (game.player) {
                    game.player.hidden = false;
                    game.player.x = p.x - game.player.w / 2;
                    game.player.y = p.y - 12;
                    game.player.scaleX = .5;
                    game.player.scaleY = 1.35;
                    game.player.vy = -3.6;
                    game.player.vx = 1;
                    try {
                        playSound(520, .2, "sine", .35, 820);
                    } catch (e) {}
                }
            }
        } else if (p.state === "emerging") {
            if (game.player) {
                game.player.scaleX += (1 - game.player.scaleX) * .14;
                game.player.scaleY += (1 - game.player.scaleY) * .14;
                game.player.y += game.player.vy;
                game.player.vy += .38;
                if (p.timer > 15) {
                    p.state = "closing";
                    p.timer = 0;
                }
            } else {
                p.state = "closing";
            }
        } else if (p.state === "closing") {
            p.scale -= .085;
            if (p.scale <= .05) {
                try {
                    createExplosion(p.x, p.y, "#9333ea", 18, 14, [ "#9333ea", "#c084fc", "#000000", "#ffffff" ]);
                } catch (e) {}
                if (game.player) {
                    game.player.frozen = false;
                    game.player.hidden = false;
                    game.player.scaleX = 1;
                    game.player.scaleY = 1;
                }
                game.spawnPortal = null;
                return;
            }
        }
        const sx = p.x - cameraX;
        const sy = p.y;
        const curScale = Math.max(.01, p.scale || 0);
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(p.rotation);
        ctx.scale(curScale, curScale);
        ctx.beginPath();
        ctx.ellipse(0, 0, 36, 54, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#000000";
        ctx.fill();
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 7;
        ctx.stroke();
        ctx.shadowColor = "#c084fc";
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.ellipse(0, 0, 31, 48, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.shadowBlur = 0;
        const vGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 30);
        vGrad.addColorStop(0, "#f5d0fe");
        vGrad.addColorStop(.35, "#c084fc");
        vGrad.addColorStop(.7, "#7e22ce");
        vGrad.addColorStop(1, "#2e1065");
        ctx.fillStyle = vGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 28, 44, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3.5;
        for (let a = 0; a < 4; a++) {
            const ang = a * Math.PI / 2 + p.timer * .05;
            ctx.beginPath();
            ctx.arc(0, 0, 20, ang, ang + .8);
            ctx.stroke();
        }
        ctx.fillStyle = "rgba(255, 255, 255, " + (.7 + Math.sin(p.timer * .2) * .25) + ")";
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    function triggerHandTrap(e) {
        const siRect = btnSi.getBoundingClientRect();
        const siX = siRect.left + siRect.width / 2;
        const siY = siRect.top + siRect.height / 2;
        const cursorX = e.clientX;
        const cursorY = e.clientY;
        document.body.classList.add("no-cursor");
        cursorDiv.style.display = "block";
        cursorDiv.style.left = cursorX + "px";
        cursorDiv.style.top = cursorY + "px";
        cursorDiv.innerText = "👆";
        handDiv.style.display = "block";
        handDiv.innerText = "✋";
        let handX = cursorX + 130;
        let handY = cursorY;
        handDiv.style.left = handX + "px";
        handDiv.style.top = handY + "px";
        playSound(200, .5, "sawtooth", .3, 80);
        const fase1 = () => {
            const dx = cursorX - handX;
            const dy = cursorY - handY;
            const d = Math.hypot(dx, dy);
            const step = Math.min(d, Math.max(22, d * .4));
            if (d > 10) {
                handX += dx / d * step;
                handY += dy / d * step;
                handDiv.style.left = handX + "px";
                handDiv.style.top = handY + "px";
                requestAnimationFrame(fase1);
            } else {
                handX = cursorX;
                handY = cursorY;
                handDiv.style.left = handX + "px";
                handDiv.style.top = handY + "px";
                handDiv.innerText = "✊";
                cursorDiv.style.display = "none";
                playSound(70, .5, "sawtooth", .4, 30);
                setTimeout(fase2, 400);
            }
        };
        const fase2 = () => {
            const dx = siX - handX;
            const dy = siY - handY;
            const d = Math.hypot(dx, dy);
            const step = Math.min(d, Math.max(18, d * .3));
            if (d > 8) {
                handX += dx / d * step;
                handY += dy / d * step;
                handDiv.style.left = handX + "px";
                handDiv.style.top = handY + "px";
                requestAnimationFrame(fase2);
            } else {
                handX = siX;
                handY = siY;
                handDiv.style.left = handX + "px";
                handDiv.style.top = handY + "px";
                handDiv.innerText = "✋";
                cursorDiv.style.display = "block";
                cursorDiv.style.left = siX + "px";
                cursorDiv.style.top = siY + "px";
                cursorDiv.innerText = "👉";
                playSound(900, .15, "square", .25, 1500);
                setTimeout(() => {
                    handDiv.style.display = "none";
                    cursorDiv.style.display = "none";
                    document.body.classList.remove("no-cursor");
                    btnSi.click();
                }, 200);
            }
        };
        requestAnimationFrame(fase1);
    }
    function confirmDeal() {
        window.hideChoice();
        handDiv.style.display = "none";
        cursorDiv.style.display = "none";
        document.body.classList.remove("no-cursor");
        bfShow = true;
        startCaceria();
    }
    // Bind táctil + ratón para las elecciones Sí/No (evita el click sintético duplicado en móvil)
    function bindChoiceAction(btn, action) {
        let lastTouch = 0;
        btn.addEventListener("touchstart", e => {
            e.preventDefault();
            e.stopPropagation();
            if (Date.now() - lastTouch < 500) return;
            lastTouch = Date.now();
            const t = e.touches && e.touches[0];
            const fake = t ? { clientX: t.clientX, clientY: t.clientY } : e;
            action(fake);
        }, { passive: false });
        btn.addEventListener("click", e => {
            if (Date.now() - lastTouch < 800) return;
            action(e);
        });
    }
    bindChoiceAction(btnNo, triggerHandTrap);
    bindChoiceAction(btnSi, confirmDeal);
    function startGameFromButton() {
        initAudio();
        if (gameState !== "start") return;
        gameReady = true;
        window.gameReady = true;
        gameTitle.style.opacity = "0";
        const titleBtns = document.getElementById("title-buttons");
        if (titleBtns) titleBtns.classList.add("hidden");
        const langToggleBtn = document.getElementById("btn-lang-toggle");
        if (langToggleBtn) langToggleBtn.style.display = "none";
        if (window.postGameHorror) {
            loadHubLevel(Math.min(unlockedLevel - 1, 5));
            return;
        }
        try {
            playBGM("bgm_menu_title");
        } catch (e) {}
        if (typeof window.startIntroCinematic === "function") {
            window.startIntroCinematic();
        } else {
            gameState = "introStory";
        }
        if (typeof window.focusGameCanvas === "function") {
            window.focusGameCanvas();
        }
    }
    window.startGameFromButton = startGameFromButton;
    window.addEventListener("keydown", e => {
        const inv = game.invertControls && gameState === "playing" && currentLevel === 1;
        const isArrowKey = e.key === "ArrowLeft" || e.key === "ArrowRight";
        const isZXKey = e.key === "z" || e.key === "Z" || e.key === "x" || e.key === "X";
        if (inv && (isArrowKey || isZXKey)) {
            if (e.key === "ArrowLeft") keys["ArrowRight"] = true; else if (e.key === "ArrowRight") keys["ArrowLeft"] = true; else if (e.key === "z" || e.key === "Z") keys["x"] = true; else if (e.key === "x" || e.key === "X") keys[" "] = true;
        } else {
            keys[e.key] = true;
        }
        if (gameState === "playing" && game.player && !game.player.frozen) {
            const invJump = inv && (e.key === "x" || e.key === "X");
            const isJumpKey = e.key === " " || e.key === "Spacebar" || e.key === "w" || e.key === "W" || invJump;
            if (isJumpKey) game.player.jumpBufferTimer = Math.max(game.player.jumpBufferTimer, 12);
        }
        if ((e.key === "c" || e.key === "C") && gameState === "playing" && currentLevel !== 4 && game.player && !game.player.frozen) {
            game.player.dashBufferTimer = 30;
        }
        initAudio();
        if (e.key === "Enter" && !e.repeat && gameState === "playing" && !isDialogActive) {
            e.preventDefault();
            game.godMode = !game.godMode;
            const pGod = game.player;
            if (pGod && typeof addFloatingText === "function") {
                addFloatingText(pGod.x + pGod.w / 2, pGod.y - 34, game.godMode ? __("flt_god_on") : __("flt_god_off"), game.godMode ? "#ffd700" : "#aaaaaa", 20);
            }
            try {
                playSound(game.godMode ? 880 : 220, .25, "square", .2, game.godMode ? 660 : 110);
            } catch (err) {}
            return;
        }
        if (e.key === "0" && !e.repeat && gameState === "playing" && !isDialogActive) {
            e.preventDefault();
            if (unlockedLevel < 5) {
                unlockedLevel = 5;
                try {
                    localStorage.setItem("starcube_unlocked_v2", unlockedLevel);
                } catch (err) {}
                window.pendingUnlockDoorNum = null;
                if (game.isHub && Array.isArray(game.hubDoors)) {
                    game.hubDoors.forEach(d => {
                        if (d.levelNum <= 5 && d.unlockAnim) d.unlockAnim.unlocked = true;
                    });
                    if (typeof initHubFriends === "function") initHubFriends();
                }
                const pU = game.player;
                if (pU && typeof addFloatingText === "function") {
                    addFloatingText(pU.x + pU.w / 2, pU.y - 34, __("flt_puertas_desbloq"), "#7dd3fc", 20);
                }
                try {
                    playSound(1040, .3, "triangle", .22, 780);
                } catch (err) {}
            }
            return;
        }
        if (e.key === "9" && !e.repeat && gameState === "playing" && !isDialogActive) {
            e.preventDefault();
            if (!window.postGameHorror) {
                unlockedLevel = 6;
                try {
                    localStorage.setItem("starcube_unlocked_v2", unlockedLevel);
                } catch (err) {}
                try {
                    localStorage.setItem("starcube_horror_mode", "true");
                } catch (err) {}
                window.postGameHorror = true;
                window.pendingUnlockDoorNum = null;
                try {
                    playSound(90, .5, "sawtooth", .3, 45);
                } catch (err) {}
                window.loadHubLevel();
                if (typeof window.showAnimatedMessage === "function") {
                    window.showAnimatedMessage(__("flt_modo_terror_on"));
                }
            }
            return;
        }
        if (game.techBoss && game.techBoss.showChoice) {
            if (e.key === " " || e.key === "Spacebar" || e.key === "Enter") e.preventDefault();
            return;
        }
        if (isDialogActive && (e.key === " " || e.key === "Spacebar" || e.key === "Enter" || e.key === "z" || e.key === "Z" || e.key === "x" || e.key === "X")) {
            if (currentLevel === 1 && game.techBoss && (game.techBoss.state === "fighting" || game.techBoss.state === "intro_boot" || game.techBoss.state === "intro_dialog" || game.techBoss.state === "defeated")) {
                return;
            }
            advanceOrSkipDialogue();
            return;
        }
        if (gameState === "introStory") {
            if (e.key === " " || e.key === "Spacebar" || e.key === "Enter" || e.key === "Escape") {
                if (typeof window.handleIntroInput === "function") {
                    window.handleIntroInput(e.key);
                }
                return;
            }
        }
        if ((e.key === " " || e.key === "Spacebar" || e.key === "Enter") && gameState === "start") {
            gameReady = true;
            window.gameReady = true;
            startGameFromButton();
        } else if ((e.key === " " || e.key === "Spacebar") && gameState === "preNivel4") {
            let lines = [ __("story_prenivel4_1"), __("story_prenivel4_2"), __("story_prenivel4_3"), __("story_prenivel4_4"), __("story_prenivel4_5"), __("story_prenivel4_6"), __("story_prenivel4_7"), __("story_prenivel4_8"), __("story_prenivel4_9"), __("story_prenivel4_10"), __("story_prenivel4_11"), __("story_prenivel4_12") ];
            const fullLine = lines[game.storyLine] || "";
            if (game.storyChar >= fullLine.length) {
                if (game.storyLine < lines.length - 1) {
                    game.storyLine++;
                    game.storyChar = 0;
                    game.storyTimer = 0;
                    game.storyHold = 0;
                } else {
                    game.storyHold = 9999;
                }
            } else {
                game.storyChar = fullLine.length;
                game.storyHold = 0;
            }
        }
    });
    window.addEventListener("keyup", e => {
        const invUp = game.invertControls && gameState === "playing" && currentLevel === 1;
        const isArrowUp = e.key === "ArrowLeft" || e.key === "ArrowRight";
        const isZXUp = e.key === "z" || e.key === "Z" || e.key === "x" || e.key === "X";
        if (invUp && (isArrowUp || isZXUp)) {
            if (e.key === "ArrowLeft") keys["ArrowRight"] = false; else if (e.key === "ArrowRight") keys["ArrowLeft"] = false; else if (e.key === "z" || e.key === "Z") keys["x"] = false; else if (e.key === "x" || e.key === "X") keys[" "] = false;
        } else {
            keys[e.key] = false;
        }
    });
    function loadLevel(idx, keepCheckpoint = false) {
        game.isHub = false;
        window.canEnterDoor = false;
        if (idx >= levels.length) {
            window.showVictoryModal();
            return;
        }
        if (!keepCheckpoint && idx === 0) {
            game.boss1Defeated = false;
        }
        currentLevel = idx;
        const lvl = levels[idx];
        worldWidth = lvl.worldWidth;
        if (!keepCheckpoint || currentCheckpoint && currentCheckpoint.level !== idx) {
            currentCheckpoint = null;
        }
        if (!keepCheckpoint) {
            playerLives = typeof MAX_LIVES !== "undefined" ? MAX_LIVES : 3;
            adReviveUsed = false;
        }
        if (typeof window.updateLivesDisplay === "function") window.updateLivesDisplay();
        let startX = lvl.playerStart.x;
        let startY = lvl.playerStart.y;
        if (keepCheckpoint && currentCheckpoint && currentCheckpoint.level === idx) {
            startX = currentCheckpoint.x;
            startY = currentCheckpoint.y;
        }
        let boatRideState = null;
        if (idx === 3 && keepCheckpoint && currentCheckpoint && currentCheckpoint.level === 3 && currentCheckpoint.x >= 12350 && currentCheckpoint.x < 21750 && typeof window.isBoatTraveling === "function" && window.isBoatTraveling()) {
            boatRideState = typeof window.getBoatTravelState === "function" ? window.getBoatTravelState() : null;
            if (boatRideState && typeof window.getBoatSafeRespawn === "function") {
                const bSafe = window.getBoatSafeRespawn();
                startX = bSafe.x;
                startY = bSafe.y;
            } else {
                boatRideState = null;
            }
        }
        let krakFightRespawn = false;
        let krakPrevHealth = 0;
        if (idx === 3 && keepCheckpoint && currentCheckpoint && currentCheckpoint.level === 3 && currentCheckpoint.x >= 22e3 && currentCheckpoint.x < 23650 && game.krakatoa && game.krakatoa.state !== "idle" && game.krakatoa.state !== "defeated") {
            krakFightRespawn = true;
            krakPrevHealth = game.krakatoa.health;
            startX = 22350;
            startY = 360;
        }
        if (typeof gsap !== "undefined") {
            try {
                gsap.killTweensOf(game);
            } catch (e) {}
            try {
                if (game.player) gsap.killTweensOf(game.player);
            } catch (e) {}
            try {
                if (Array.isArray(game.platforms)) game.platforms.forEach(function(pf) {
                    gsap.killTweensOf(pf);
                });
            } catch (e) {}
            try {
                gsap.killTweensOf(getMessageDiv());
            } catch (e) {}
            try {
                gsap.set(getMessageDiv(), {
                    scale: 0,
                    opacity: 0
                });
            } catch (e) {}
        }
        try {
            CINEMA_TOKEN++;
        } catch (e) {}
        delete game.cameraOverrideX;
        delete game.cameraOverrideY;
        game.subCaveMode = false;
        game.subCaveTransitioning = false;
        game.meadowNight = false;
        game.eruptingMode = false;
        game.nightTransitionProgress = null;
        game.invertControls = false;
        game.hideHealthBar = false;
        keys = {};
        try {
            // Mata tweens de jefes de la sesión anterior (callbacks residuales de boss2/boss3)
            [ game.techBoss, game.yellowSquare, game.krakatoa, game.pumpkinBoss, game.blueSquare ].forEach(function(b) {
                if (b && typeof gsap !== "undefined") gsap.killTweensOf(b);
            });
        } catch (e) {}
        if (typeof screenShake !== "undefined") {
            screenShake.intensity = 0;
            screenShake.x = 0;
        }
        delete game.cameraZoom;
        delete game.zoomTargetWorldX;
        delete game.zoomTargetWorldY;
        game.isEnteringDoor = false;
        game.player = new Player(startX, startY);
        if (typeof window.initLithiumLevel === "function") {
            window.initLithiumLevel(idx);
        }
        if (typeof window.initHalloweenLevel === "function") {
            window.initHalloweenLevel(idx);
        }
        if (idx === 3 && typeof window.initBoatLevel4 === "function") {
            window.initBoatLevel4();
            if (boatRideState && typeof window.restoreBoatTravelState === "function") {
                window.restoreBoatTravelState(boatRideState);
            }
        }
        const portalSpawnX = startX + game.player.w / 2;
        const portalSpawnY = Math.max(50, startY - 26);
        game.spawnPortal = {
            x: portalSpawnX,
            y: portalSpawnY,
            groundY: startY,
            state: "opening",
            scale: 0,
            rotation: 0,
            timer: 0
        };
        game.player.y = portalSpawnY;
        game.player.frozen = true;
        game.player.hidden = true;
        game.player.vx = 0;
        game.player.vy = 0;
        try {
            playSound(240, .45, "triangle", .35, 700);
        } catch (e) {}
        if (idx === 0) {
            const respawnX = keepCheckpoint && currentCheckpoint && currentCheckpoint.level === idx ? currentCheckpoint.x : 0;
            const isSubCaveRespawn = respawnX >= 28e3 && respawnX <= 34e3;
            game.subCaveMode = isSubCaveRespawn;
            if (keepCheckpoint && currentCheckpoint && currentCheckpoint.level === idx) {
                game.gate1Open = currentCheckpoint.gate1Open || respawnX >= 3800;
                game.gate2Open = currentCheckpoint.gate2Open || respawnX >= 7400 && !isSubCaveRespawn;
                game.meadowNight = currentCheckpoint.meadowNight !== false;
                game.boss1Defeated = currentCheckpoint.boss1Defeated || false;
                // Sincroniza la transición visual día/noche con el estado restaurado
                if (game.meadowNight) game.nightTransitionProgress = 1;
                else delete game.nightTransitionProgress;
            } else {
                game.gate1Open = respawnX >= 3800;
                game.gate2Open = respawnX >= 7400 && !isSubCaveRespawn;
                game.meadowNight = respawnX >= 7400 && !isSubCaveRespawn && !game.boss1Defeated;
                delete game.nightTransitionProgress;
            }
        } else {
            game.gate1Open = false;
            game.gate2Open = false;
            game.meadowNight = false;
            game.subCaveMode = false;
        }
        game.platforms = lvl.platforms.map(p => new Platform(p));
        game.enemies = (lvl.enemies || []).filter(e => !(currentLevel === 2 && e.type === "fire_spawner")).map(e => new Enemy(e));
        if (window.postGameHorror && currentLevel !== 4) {
            game.enemies.forEach(en => {
                if (en.speed) en.speed *= 1.35;
                if (en.shootInterval) en.shootInterval = Math.max(30, Math.floor(en.shootInterval * .7));
            });
            const extraEnemies = [];
            game.enemies.forEach((en, i) => {
                if (i % 2 === 0 && en.x && en.y && !en.isBoss && en.type !== "boss") {
                    const cloneDef = Object.assign({}, en, {
                        x: en.x + (en.w || 32) * 2.5,
                        y: en.y,
                        health: en.health || 20,
                        maxHealth: en.maxHealth || 20,
                        speed: (en.speed || 1.5) * 1.1
                    });
                    extraEnemies.push(new Enemy(cloneDef));
                }
            });
            game.enemies.push(...extraEnemies);
        }
        game.demon = new BossDemon;
        window.hideChoice();
        if (game.subCaveMode) {
            cameraX = 28e3;
        } else {
            cameraX = Math.max(0, Math.min(startX - VIEW_W / 2 + game.player.w / 2, worldWidth - VIEW_W));
        }
        projectiles = [];
        enemyProjectiles = [];
        particles = [];
        blood = [];
        restos = [];
        stars = [];
        floatingTexts = [];
        if (lvl.stars) {
            stars = lvl.stars.map(s => ({
                x: s.x,
                y: s.y,
                collected: false
            }));
        }
        checkpoints = [];
        if (lvl.checkpoints) {
            checkpoints = lvl.checkpoints.map(cp => ({
                x: cp.x,
                y: cp.y,
                activated: !!(currentCheckpoint && currentCheckpoint.level === idx && currentCheckpoint.x === cp.x && currentCheckpoint.y === cp.y)
            }));
        }
        game.iceMode = idx === 0 && game.boss1Defeated && !game.subCaveMode && startX >= 12400;
        game.fireMode = false;
        game.iceGlitchTriggered = false;
        game.arenaLocked = false;
        game.arenaMinX = 0;
        game.arenaMaxX = worldWidth;
        game.flash = 0;
        game.glitchT = 0;
        game.camY = 0;
        try {
            if (typeof window.BossHUD !== "undefined" && typeof window.BossHUD.hide === "function") {
                window.BossHUD.hide();
            }
        } catch (e) {}
        game._entryLock = 90;
        if (idx === 0) {
            if (!game.boss1Defeated) {
                const arenaPlat = game.platforms && game.platforms.find(p => p.w >= 2e3 && p.y >= 500 && p.x >= 7e3) || {
                    x: 9600
                };
                game.blueSquare = {
                    x: arenaPlat.x + 550,
                    y: 472,
                    w: 28,
                    h: 28,
                    state: "sweating",
                    dialogTimer: 0,
                    health: 20,
                    maxHealth: 20,
                    shootTimer: 0,
                    hitFlash: 0,
                    isBoss: false,
                    transformTimer: 0
                };
            } else {
                game.blueSquare = null;
            }
        } else {
            game.blueSquare = null;
            try {
                if (window.TurretSystem) {
                    window.TurretSystem.init(game);
                }
            } catch (e) {}
        }
        if (idx === 1) {
            const passedTechBoss = keepCheckpoint && currentCheckpoint && currentCheckpoint.level === 1 && currentCheckpoint.x > 15300;
            game.pixelMode = passedTechBoss;
            const tbHp = window.postGameHorror ? 160 : 80;
            game.techBoss = {
                x: 14800,
                y: 100,
                w: 100,
                h: 100,
                state: passedTechBoss ? "defeated" : "idle",
                health: tbHp,
                maxHealth: tbHp,
                phase: 1,
                turnTimer: 0,
                turnPhase: "intro",
                bulletCount: 7,
                speed: 1,
                growScale: 1,
                hitFlash: 0,
                vulnerable: false,
                isAttacking: false,
                attackTimer: 0,
                dialogStep: 0,
                dialogTimer: 0,
                yesNoChoice: false,
                dodgeMode: false,
                bonusHp: false,
                defeated: false,
                defeatTimer: 0,
                pixelActivate: 0
            };
            if (passedTechBoss) {
                game.arenaLocked = false;
                game.pinkSquare = null;
            }
            if (!passedTechBoss) {
                game.pinkSquare = {
                    x: 13400,
                    y: 468,
                    w: 30,
                    h: 40,
                    state: "hostile",
                    animTimer: 0,
                    shootTimer: 0,
                    showChoice: false,
                    health: 30,
                    maxHealth: 30
                };
            }
        } else {
            game.pixelMode = false;
            game.techBoss = null;
            game.pinkSquare = null;
        }
        if (idx === 2) {
            const hasCheckpointPassedRescue = keepCheckpoint && currentCheckpoint && currentCheckpoint.level === 2 && currentCheckpoint.x > 3e3;
            game.yellowSquare = {
                x: hasCheckpointPassedRescue ? startX - 40 : startX + 60,
                y: hasCheckpointPassedRescue ? startY : 440,
                w: 24,
                h: 24,
                vx: 0,
                vy: 0,
                state: "invisible",
                guardsCount: 0,
                shootTimer: 0,
                facing: 1,
                health: 20,
                maxHealth: 20,
                scale: 1,
                dialogTimer: 0,
                bossShootTimer: 0,
                hitFlash: 0,
                isBoss: false,
                _betrayalShown: false,
                _dialogPhase1: false,
                _dialogPhase2: false,
                _dialogPhase3: false,
                _dialogPhase4: false,
                _dialogPhase5: false
            };
            const passedValkyrie = !!(keepCheckpoint && currentCheckpoint && currentCheckpoint.level === 2 && currentCheckpoint.x >= 19400);
            game.valkBossDefeated = passedValkyrie;
            game.eruptingMode = passedValkyrie;
            game.arenaLocked = false;
            try {
                if (window.ValkyrieBoss) {
                    window.ValkyrieBoss.state = passedValkyrie ? "defeated" : "idle";
                    window.ValkyrieBoss.boss = null;
                    window.ValkyrieBoss.pillars = [];
                    window.ValkyrieBoss._lastLevel = passedValkyrie ? 2 : -1;
                    if (window.BossHUD) window.BossHUD.hide();
                }
            } catch (e) {}
        } else {
            game.yellowSquare = null;
        }
        if (idx === 3) {
            const passedKraken = keepCheckpoint && currentCheckpoint && currentCheckpoint.level === 3 && currentCheckpoint.x > 23500;
            game.krakatoa = typeof window.createKrakatoaBoss === "function" ? window.createKrakatoaBoss() : null;
            if (game.krakatoa && passedKraken) {
                game.krakatoa.state = "defeated";
                game.krakatoa.health = 0;
                game.arenaLocked = false;
            } else if (game.krakatoa && krakFightRespawn) {
                game.krakatoa.health = Math.max(1, krakPrevHealth);
                game.krakatoa.state = "idle";
            }
            if (passedKraken) {
                game.stormMode = true;
                if (typeof window.initStormMode === "function") window.initStormMode(false);
            } else {
                game.stormMode = false;
            }
        } else {
            game.krakatoa = null;
            game.stormMode = false;
        }
        if (idx === 6) {
            const passedPumpkin = keepCheckpoint && currentCheckpoint && currentCheckpoint.level === 6 && currentCheckpoint.x > 26700;
            game.pumpkinBoss = typeof window.createPumpkinBoss === "function" ? window.createPumpkinBoss() : null;
            if (game.pumpkinBoss && passedPumpkin) {
                if (currentCheckpoint.x >= 26800 && currentCheckpoint.x < 42800) {
                    game.pumpkinBoss.state = "chase";
                    game.pumpkinBoss.x = currentCheckpoint.x - 560;
                    game.pumpkinBoss.y = 330;
                    game.pumpkinBoss.metamorphosisTriggered = true;
                    game.pumpkinBoss.chaseGraceTimer = 180;
                    game.arenaLocked = false;
                    if (!window.postGameHorror) {
                        try {
                            playBGM("bgm_pumpkin_chase");
                        } catch (e) {}
                    }
                } else {
                    game.pumpkinBoss.state = "defeated";
                    game.pumpkinBoss.health = 0;
                    game.arenaLocked = false;
                }
            }
        } else {
            game.pumpkinBoss = null;
        }
        game.lvl4State = null;
        game.lvl4Timer = 0;
        game.pasosPlayed = false;
        game.freeRoam = false;
        game.vignette = false;
        game.vignetteShrink = false;
        game.vignetteRadius = 260;
        game.happyMode = false;
        game.sadEnemies = false;
        game.forceRunDir = 0;
        game.corruption = 0;
        game.flash = 0;
        game.flashMode = false;
        game.happyCycle = 0;
        game.camY = 0;
        game.glitchT = 0;
        game.inHunt = false;
        game.huntKills = 0;
        game.dread = 0;
        game.huntEnemy = null;
        game.companionMsg = false;
        game.oopsShown = false;
        game.endingTimer = 0;
        game.endingStep = 0;
        game.msgShown1 = false;
        game.msgShown2 = false;
        game.msgShown3 = false;
        game.msgShown4 = false;
        game.msgShown5 = false;
        game.endingDone = false;
        bfShow = false;
        bfAlpha = 0;
        bfStalk = 0;
        bfTeeth = 0;
        bfLaugh = 0;
        bfAnnoyed = 0;
        bfEnraged = 0;
        bfShock = 0;
        bfNightmare = 0;
        game.textIdx = -1;
        game.doorMsg = false;
        game.doorStep = 0;
        game.doorTimer = 0;
        game.cageState = 0;
        game.cageTimer = 0;
        game.cageBtnPressed = false;
        game.cageOpenProgress = 0;
        game.cageGearsAngle = 0;
        game.cageCelebrateTimer = 0;
        game.cageFriends = null;
        if (lvl.jaula) {
            game.cageFriends = [];
            const cols = [ "#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#ff8f6b", "#c77dff", "#ff5d8f", "#5fd0e8" ];
            for (let cf = 0; cf < lvl.jaula.friends; cf++) game.cageFriends.push(cols[cf % cols.length]);
        }
        slashes.length = 0;
        blood.length = 0;
        restos.length = 0;
        window.hideChoice();
        handDiv.style.display = "none";
        cursorDiv.style.display = "none";
        document.body.classList.remove("no-cursor");
        if (uiOverlay) {
            uiOverlay.style.display = "flex";
            uiOverlay.style.borderColor = window.postGameHorror || currentLevel >= 2 ? "#aa0000" : "#fff";
            uiOverlay.style.background = window.postGameHorror || currentLevel >= 2 ? "rgba(0,0,0,0.8)" : "rgba(255, 255, 255, 0.8)";
            uiOverlay.style.color = window.postGameHorror || currentLevel >= 2 ? "#fff" : "#333";
        }
        if (typeof window.updateTouchControlsVisibility === "function") window.updateTouchControlsVisibility();
        levelDisplay.innerText = window.postGameHorror ? "????" : __("level_name_" + (idx + 1));
        levelDisplay.style.color = window.postGameHorror || currentLevel >= 2 ? "#ff0000" : "#ff9900";
        document.body.style.background = window.postGameHorror || currentLevel >= 2 ? "#0a0000" : "#000";
        hpContainer.style.borderColor = window.postGameHorror || currentLevel >= 2 ? "#aa0000" : "#ff66aa";
        healthFill.style.background = window.postGameHorror || currentLevel >= 2 ? "#ff0000" : "linear-gradient(90deg, #ff66aa, #ff3388)";
        gsap.to(healthFill, {
            width: "100%",
            duration: .5
        });
        if (idx === 0) {
            score = 0;
            updateScore(score);
        }
        if (idx === 0 && game.subCaveMode) playBGM("bgm_world1_cave"); else if (idx === 0 && (game.meadowNight || game.gate2Open)) playBGM("bgm_world1_night"); else if (idx === 1 && game.pixelMode) playBGM("bgm_world2_pixel_mode"); else if (idx === 2 && game.eruptingMode) playBGM("bgm_world3_volcano"); else if (idx === 3 && game.stormMode) playBGM("bgm_world4_storm"); else playBGM(lvl.bgm);
        try {
            preloadNextLevelBGM(idx);
        } catch (e) {}
        gameState = "playing";
        if (typeof window.focusGameCanvas === "function") {
            window.focusGameCanvas();
        }
    }
    function loadHubLevel(focusDoorIndex = 0) {
        playerLives = typeof MAX_LIVES !== "undefined" ? MAX_LIVES : 3;
        if (typeof window.updateLivesDisplay === "function") window.updateLivesDisplay();
        if (typeof gsap !== "undefined") {
            try {
                gsap.killTweensOf(game);
            } catch (e) {}
            try {
                if (game.player) gsap.killTweensOf(game.player);
            } catch (e) {}
            try {
                if (Array.isArray(game.platforms)) game.platforms.forEach(function(pf) {
                    gsap.killTweensOf(pf);
                });
            } catch (e) {}
            try {
                gsap.killTweensOf(getMessageDiv());
            } catch (e) {}
            try {
                gsap.set(getMessageDiv(), {
                    scale: 0,
                    opacity: 0
                });
            } catch (e) {}
        }
        try {
            CINEMA_TOKEN++;
        } catch (e) {}
        delete game.cameraOverrideX;
        if (typeof screenShake !== "undefined") {
            screenShake.intensity = 0;
            screenShake.x = 0;
            screenShake.y = 0;
        }
        gameState = "playing";
        keys = {};
        delete game.vignette;
        delete game.vignetteRadius;
        delete game.corruption;
        delete game.glitchT;
        delete game.doorDialog;
        delete game.doorDialogTimer;
        delete game.lvl4State;
        delete game.dread;
        delete game.inHunt;
        delete game.huntEnemy;
        delete game.huntKills;
        delete game.endingTimer;
        delete game.endingStep;
        delete game.endingDone;
        delete game.msgShown1;
        delete game.msgShown2;
        delete game.msgShown3;
        delete game.msgShown4;
        delete game.msgShown5;
        bfShow = false;
        bfAlpha = 0;
        bfStalk = 0;
        bfTeeth = 0;
        bfLaugh = 0;
        bfAnnoyed = 0;
        bfEnraged = 0;
        if (typeof gsap !== "undefined") {
            gsap.to(getBlackoutDiv(), {
                opacity: 0,
                duration: 1.5,
                ease: "power2.out"
            });
        } else {
            getBlackoutDiv().style.opacity = 0;
        }
        game.isHub = true;
        currentLevel = "hub";
        worldWidth = 2300;
        currentCheckpoint = null;
        game.iceMode = false;
        game.fireMode = false;
        game.arenaLocked = false;
        game.arenaMinX = 0;
        game.arenaMaxX = worldWidth;
        game.flash = 0;
        game.camY = 0;
        game.blueSquare = null;
        game.demon = null;
        try {
            // Mata tweens residuales de jefes de la sesión anterior
            [ game.techBoss, game.yellowSquare, game.krakatoa, game.pumpkinBoss, game.blueSquare ].forEach(function(b) {
                if (b && typeof gsap !== "undefined") gsap.killTweensOf(b);
            });
        } catch (e) {}
        game.krakatoa = null;
        game.pumpkinBoss = null;
        game.techBoss = null;
        game.yellowSquare = null;
        game.stormMode = false;
        game.meadowNight = false;
        game.subCaveMode = false;
        game.pixelMode = false;
        game.eruptingMode = false;
        game.nightTransitionProgress = null;
        game.invertControls = false;
        game.hideHealthBar = false;
        game.forceRunDir = 0;
        game.happyMode = false;
        game.sadEnemies = false;
        if (typeof window.stopHalloweenAudio === "function") {
            window.stopHalloweenAudio();
        }
        if (typeof window.initHalloweenLevel === "function") {
            window.initHalloweenLevel("hub");
        }
        try {
            if (typeof window.BossHUD !== "undefined" && typeof window.BossHUD.hide === "function") {
                window.BossHUD.hide();
            }
        } catch (e) {}
        projectiles = [];
        enemyProjectiles = [];
        particles = [];
        blood = [];
        restos = [];
        stars = [];
        floatingTexts = [];
        slashes.length = 0;
        blood.length = 0;
        restos.length = 0;
        window.hideChoice();
        if (handDiv) handDiv.style.display = "none";
        if (cursorDiv) cursorDiv.style.display = "none";
        document.body.classList.remove("no-cursor");
        game.platforms = [ new Platform({
            x: 0,
            y: 500,
            w: 2300,
            h: 80,
            unbreakable: true
        }), new Platform({
            x: 0,
            y: 0,
            w: 80,
            h: 580,
            unbreakable: true
        }), new Platform({
            x: 2220,
            y: 0,
            w: 80,
            h: 580,
            unbreakable: true
        }), new Platform({
            x: 0,
            y: -40,
            w: 2300,
            h: 60,
            unbreakable: true
        }) ];
        game.enemies = [];
        game.hubDoors = [ {
            levelIndex: 0,
            levelNum: 1,
            x: 240,
            y: 414,
            w: 64,
            h: 86,
            titleKey: "level_name_1"
        }, {
            levelIndex: 1,
            levelNum: 4,
            x: 1200,
            y: 414,
            w: 64,
            h: 86,
            titleKey: "level_name_2"
        }, {
            levelIndex: 2,
            levelNum: 3,
            x: 880,
            y: 414,
            w: 64,
            h: 86,
            titleKey: "level_name_3"
        }, {
            levelIndex: 3,
            levelNum: 2,
            x: 560,
            y: 414,
            w: 64,
            h: 86,
            titleKey: "level_name_4"
        }, {
            levelIndex: 6,
            levelNum: 5,
            x: 1520,
            y: 414,
            w: 64,
            h: 86,
            titleKey: "level_name_7"
        }, {
            levelIndex: 4,
            levelNum: 6,
            x: 1840,
            y: 414,
            w: 64,
            h: 86,
            titleKey: "level_name_5"
        } ];
        const targetDoor = game.hubDoors[Math.max(0, Math.min(focusDoorIndex, game.hubDoors.length - 1))];
        const startX = targetDoor ? targetDoor.x + targetDoor.w / 2 - 16 : 180;
        game.player = new Player(startX, 440);
        cameraX = Math.max(0, Math.min(game.player.x - VIEW_W / 2 + game.player.w / 2, worldWidth - VIEW_W));
        delete game.cameraZoom;
        delete game.zoomTargetWorldX;
        delete game.zoomTargetWorldY;
        game.spawnPortal = null;
        game.isEnteringDoor = false;
        window.canEnterDoor = false;
        function initHubFriends() {
            game.hubFriends = [];
            if (window.postGameHorror) {
                game.hubDoors.forEach(d => {
                    if (d.levelNum === 6) d.boarded = true;
                });
                restos.length = 0;
                const deadConfigs = [ {
                    name: "Azulín",
                    color: "#0284c7",
                    x: 400
                }, {
                    name: "Verdecito",
                    color: "#16a34a",
                    x: 720
                }, {
                    name: "Amarillín",
                    color: "#ca8a04",
                    x: 1040
                }, {
                    name: "Moradito",
                    color: "#7c3aed",
                    x: 1360
                }, {
                    name: "Naranjita",
                    color: "#ea580c",
                    x: 1680
                } ];
                deadConfigs.forEach(f => {
                    restos.push({
                        x: f.x - 18,
                        y: 500 - 9,
                        w: 32,
                        h: 18,
                        color: f.color,
                        part: "top",
                        rot: -.25,
                        groundY: 500,
                        settled: true,
                        poolRadius: 26,
                        vx: 0,
                        vy: 0,
                        vRot: 0
                    });
                    restos.push({
                        x: f.x + 20,
                        y: 500 - 8,
                        w: 32,
                        h: 16,
                        color: f.color,
                        part: "bottom",
                        rot: .2,
                        groundY: 500,
                        settled: true,
                        poolRadius: 22,
                        vx: 0,
                        vy: 0,
                        vRot: 0
                    });
                });
                for (let i = 0; i < 30; i++) {
                    restos.push({
                        x: 220 + Math.random() * (worldWidth - 440),
                        y: 500 - 2,
                        vx: 0,
                        vy: 0,
                        size: 4 + Math.random() * 8,
                        color: "#7f1d1d",
                        life: 99999,
                        type: "gibs",
                        groundY: 500,
                        settled: true,
                        poolRadius: 8 + Math.random() * 12
                    });
                }
                return;
            }
            const effectiveRescued = Math.max(unlockedLevel ? unlockedLevel - 1 : 0, window.pendingUnlockDoorNum ? window.pendingUnlockDoorNum - 1 : 0);
            const configs = [ {
                name: "Azulín",
                topColor: "#7dd3fc",
                botColor: "#0284c7",
                cheekColor: "rgba(255, 102, 170, 0.65)",
                x: 400
            }, {
                name: "Verdecito",
                topColor: "#86efac",
                botColor: "#16a34a",
                cheekColor: "rgba(255, 120, 160, 0.65)",
                x: 720
            }, {
                name: "Amarillín",
                topColor: "#fde047",
                botColor: "#ca8a04",
                cheekColor: "rgba(255, 90, 140, 0.65)",
                x: 1040
            }, {
                name: "Moradito",
                topColor: "#d8b4fe",
                botColor: "#7c3aed",
                cheekColor: "rgba(255, 105, 180, 0.65)",
                x: 1360
            }, {
                name: "Naranjita",
                topColor: "#fdba74",
                botColor: "#ea580c",
                cheekColor: "rgba(255, 100, 150, 0.65)",
                x: 1680
            } ];
            for (let i = 0; i < effectiveRescued && i < configs.length; i++) {
                const cfg = configs[i];
                game.hubFriends.push({
                    name: cfg.name,
                    topColor: cfg.topColor,
                    botColor: cfg.botColor,
                    cheekColor: cfg.cheekColor,
                    x: cfg.x,
                    baseX: cfg.x,
                    y: 468,
                    w: 32,
                    h: 32,
                    facing: 1,
                    hopTimer: Math.floor(Math.random() * 100),
                    wanderTimer: Math.floor(Math.random() * 80)
                });
            }
        }
        window.initHubFriends = initHubFriends;
        initHubFriends();
        try {
            if (uiOverlay) uiOverlay.style.display = "flex";
            levelDisplay.innerText = window.postGameHorror ? "????" : __("ui_hub_title") || "Cuarto de Puertas";
            levelDisplay.style.color = window.postGameHorror ? "#ff0000" : "#38bdf8";
            document.body.style.background = window.postGameHorror ? "#000000" : "#03000a";
            uiOverlay.style.borderColor = window.postGameHorror ? "#4a0000" : "#a855f7";
            uiOverlay.style.background = window.postGameHorror ? "rgba(10, 0, 0, 0.95)" : "rgba(15, 8, 28, 0.88)";
            uiOverlay.style.color = window.postGameHorror ? "#ff5555" : "#ffffff";
            hpContainer.style.borderColor = window.postGameHorror ? "#aa0000" : "#c084fc";
            healthFill.style.background = window.postGameHorror ? "linear-gradient(90deg, #550000, #ff0000)" : "linear-gradient(90deg, #ff66aa, #a855f7)";
            gsap.to(healthFill, {
                width: "100%",
                duration: .3
            });
        } catch (e) {}
        if (window.postGameHorror) {
            playBGM("bgm_world5_dread");
        } else {
            playBGM("bgm_menu_level_select");
        }
        [ "pause-modal", "gameover-modal", "defeat-modal", "victory-modal", "level-map-modal" ].forEach(id => {
            const m = document.getElementById(id);
            if (m) m.classList.remove("active");
        });
        gameState = "playing";
        if (typeof window.updateTouchControlsVisibility === "function") window.updateTouchControlsVisibility();
        if (typeof window.focusGameCanvas === "function") window.focusGameCanvas();
        if (window.pendingUnlockDoorNum && window.pendingUnlockDoorNum > unlockedLevel) {
            playDoorUnlockCinematic(window.pendingUnlockDoorNum);
        }
    }
    window.loadHubLevel = loadHubLevel;
    function playDoorUnlockCinematic(targetDoorNum) {
        if (!game.isHub || !Array.isArray(game.hubDoors)) return;
        const targetDoor = game.hubDoors.find(d => d.levelNum === targetDoorNum);
        if (!targetDoor) return;
        if (typeof gsap === "undefined") {
            unlockedLevel = Math.max(unlockedLevel, targetDoorNum);
            try {
                localStorage.setItem("starcube_unlocked_v2", unlockedLevel);
            } catch (e) {}
            window.pendingUnlockDoorNum = null;
            if (game.player) game.player.frozen = false;
            return;
        }
        const thisToken = CINEMA_TOKEN;
        if (game.player) {
            game.player.frozen = true;
            game.player.vx = 0;
            game.player.vy = 0;
        }
        targetDoor.unlockAnim = {
            glow: 0,
            unlocked: false
        };
        const doorCamX = Math.max(0, Math.min(targetDoor.x + targetDoor.w / 2 - VIEW_W / 2, worldWidth - VIEW_W));
        const peggyCamX = game.player ? Math.max(0, Math.min(game.player.x + game.player.w / 2 - VIEW_W / 2, worldWidth - VIEW_W)) : 0;
        game.cameraOverrideX = cameraX;
        gsap.to(game, {
            cameraOverrideX: doorCamX,
            duration: 1.5,
            ease: "power2.inOut",
            onComplete: () => {
                if (CINEMA_TOKEN !== thisToken) return;
                setTimeout(() => {
                    if (CINEMA_TOKEN !== thisToken) return;
                    try {
                        playSound(220, .45, "sine", .6, 520);
                    } catch (e) {}
                    gsap.to(targetDoor.unlockAnim, {
                        glow: 1,
                        duration: 1.8,
                        ease: "power1.in",
                        onUpdate: () => {
                            if (CINEMA_TOKEN !== thisToken) return;
                            if (Math.random() < .6) {
                                particles.push({
                                    x: targetDoor.x + Math.random() * targetDoor.w,
                                    y: targetDoor.y + targetDoor.h - 8,
                                    vx: (Math.random() - .5) * 3,
                                    vy: -Math.random() * 3.5 - 1.2,
                                    color: Math.random() < .5 ? "#38bdf8" : "#ffffff",
                                    life: 24,
                                    maxLife: 24,
                                    size: 3 + Math.random() * 3,
                                    type: "spark"
                                });
                            }
                        },
                        onComplete: () => {
                            if (CINEMA_TOKEN !== thisToken) return;
                            game.flash = .8;
                            if (typeof screenShake !== "undefined") {
                                screenShake.intensity = 8;
                            }
                            try {
                                playSound(523.25, .3, "triangle", .4);
                                setTimeout(() => {
                                    try {
                                        playSound(659.25, .3, "triangle", .4);
                                    } catch (e) {}
                                }, 120);
                                setTimeout(() => {
                                    try {
                                        playSound(783.99, .35, "triangle", .4);
                                    } catch (e) {}
                                }, 240);
                                setTimeout(() => {
                                    try {
                                        playSound(1046.5, .65, "sine", .6);
                                    } catch (e) {}
                                }, 360);
                            } catch (e) {}
                            try {
                                createExplosion(targetDoor.x + targetDoor.w / 2, targetDoor.y + targetDoor.h / 2, "#38bdf8", 35, 25);
                                createExplosion(targetDoor.x + targetDoor.w / 2, targetDoor.y + targetDoor.h / 2, "#ffffff", 25, 18);
                            } catch (e) {}
                            targetDoor.unlockAnim.unlocked = true;
                            unlockedLevel = Math.max(unlockedLevel, targetDoorNum);
                            try {
                                localStorage.setItem("starcube_unlocked_v2", unlockedLevel);
                            } catch (e) {}
                            window.pendingUnlockDoorNum = null;
                            if (typeof initHubFriends === "function") initHubFriends();
                            addFloatingText(targetDoor.x + targetDoor.w / 2, targetDoor.y - 48, __("ui_nivel_desbloqueado"), "#38bdf8", 22);
                            setTimeout(() => {
                                if (CINEMA_TOKEN !== thisToken) return;
                                gsap.to(game, {
                                    cameraOverrideX: peggyCamX,
                                    duration: 1.3,
                                    ease: "power2.inOut",
                                    onComplete: () => {
                                        if (CINEMA_TOKEN !== thisToken) return;
                                        delete game.cameraOverrideX;
                                        targetDoor.unlockAnim = null;
                                        if (game.player) game.player.frozen = false;
                                        window.showAnimatedMessage(__("msg_puerta_desbloqueada"));
                                        if (typeof window.focusGameCanvas === "function") window.focusGameCanvas();
                                    }
                                });
                            }, 1100);
                        }
                    });
                }, 500);
            }
        });
    }
    window.playDoorUnlockCinematic = playDoorUnlockCinematic;
    function updateUITranslations() {
        if (healthLabel) healthLabel.textContent = __("ui_health");
        if (controlsInfo) controlsInfo.textContent = __("ui_controls");
        if (choiceText) choiceText.textContent = __("ui_choice_question");
        if (choiceSub) choiceSub.textContent = __("ui_choice_sub");
        if (btnSi) btnSi.textContent = __("ui_choice_yes");
        if (btnNo) btnNo.textContent = __("ui_choice_no");
        if (langTitle) langTitle.textContent = __("ui_select_language");
        if (splashAuthor) splashAuthor.textContent = __("ui_splash_author");
        document.title = __("ui_page_title");
        const subEl = gameTitle?.querySelector(".starcube-subtitle");
        if (subEl) subEl.textContent = __("ui_subtitle");
        const titleEl = gameTitle?.querySelector(".starcube-title");
        if (titleEl) {
            if (window.postGameHorror) {
                titleEl.classList.add("horror");
            } else {
                titleEl.classList.remove("horror");
            }
        }
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.dataset.i18n;
            if (key) el.textContent = __(key);
            if (key) {
                const text = __(key);
                if (text && text.includes("<br>")) {
                    el.innerHTML = text;
                } else {
                    el.textContent = text;
                }
            }
        });
        if (typeof updateScore === "function" && typeof score !== "undefined") {
            updateScore(score);
        }
        if (typeof selectLevelNode === "function" && typeof selectedMapLevel !== "undefined") {
            selectLevelNode(selectedMapLevel);
        }
        if (window.postGameHorror) {
            document.body.classList.add("horror-mode");
        } else {
            document.body.classList.remove("horror-mode");
        }
        const curLang = typeof getCurrentLang === "function" ? getCurrentLang() : "es";
        const langCodeEl = document.getElementById("lang-toggle-code");
        if (langCodeEl) langCodeEl.textContent = curLang.toUpperCase();
        document.querySelectorAll(".lang-btn").forEach(btn => {
            const code = btn.dataset.lang;
            const nameEl = btn.querySelector(".name");
            if (nameEl) nameEl.textContent = getLangName(code, code);
            if (code === curLang) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });
    }
    window.updateUITranslations = updateUITranslations;
    function initGameFlow() {
        const langToggleBtn = document.getElementById("btn-lang-toggle");
        const closeLangBtn = document.getElementById("close-lang-btn");
        let splashDismissed = false;

        function dismissSplashScreen() {
            if (splashDismissed) return;
            splashDismissed = true;
            if (splashScreen) {
                splashScreen.classList.add("hidden");
                setTimeout(() => {
                    splashScreen.style.display = "none";
                    if (langSelect) {
                        if (closeLangBtn) closeLangBtn.style.display = "none";
                        langSelect.style.display = "flex";
                        setTimeout(() => langSelect.classList.add("visible"), 50);
                        updateUITranslations();
                    }
                }, 500);
            }
        }
        window.dismissSplashScreen = dismissSplashScreen;

        const splashTimer = setTimeout(() => {
            dismissSplashScreen();
        }, 2200);

        if (splashScreen) {
            splashScreen.addEventListener("click", () => {
                clearTimeout(splashTimer);
                dismissSplashScreen();
            });
        }
        window.addEventListener("keydown", function onSplashKey(e) {
            if (!splashDismissed && splashScreen && !splashScreen.classList.contains("hidden")) {
                clearTimeout(splashTimer);
                dismissSplashScreen();
                window.removeEventListener("keydown", onSplashKey);
            }
        });

        document.querySelectorAll(".lang-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const lang = btn.dataset.lang;
                await setLanguage(lang);
                updateUITranslations();
                if (langSelect) langSelect.classList.remove("visible");
                setTimeout(() => {
                    if (langSelect) langSelect.style.display = "none";
                    gameTitle.style.opacity = "1";
                    const titleBtns = document.getElementById("title-buttons");
                    if (titleBtns) titleBtns.classList.remove("hidden");
                    if (langToggleBtn) langToggleBtn.style.display = "flex";
                    gameReady = true;
                    window.gameReady = true;
                    window.GAME_PAUSED = false;
                    try {
                        if (typeof drawEnhancedBackground === "function") {
                            drawEnhancedBackground(ctx, currentLevel, cameraX, 0, game);
                        }
                    } catch (err) {}
                    try {
                        if (typeof currentBGM === "undefined" || !currentBGM || currentBGM.paused) {
                            playBGM("bgm_menu_title");
                        }
                    } catch (e) {}
                }, 350);
            });
        });

        if (langToggleBtn) {
            langToggleBtn.addEventListener("click", () => {
                if (langSelect) {
                    if (closeLangBtn) closeLangBtn.style.display = "inline-block";
                    langSelect.style.display = "flex";
                    setTimeout(() => langSelect.classList.add("visible"), 30);
                    updateUITranslations();
                }
            });
        }

        if (closeLangBtn) {
            closeLangBtn.addEventListener("click", () => {
                if (langSelect) {
                    langSelect.classList.remove("visible");
                    setTimeout(() => {
                        langSelect.style.display = "none";
                    }, 300);
                }
            });
        }

        const startBtn = document.getElementById("start-btn");
        if (startBtn) {
            startBtn.addEventListener("click", () => {
                startGameFromButton();
            });
        }

        const hubBtn = document.getElementById("hub-btn");
        if (hubBtn) {
            hubBtn.addEventListener("click", () => {
                initAudio();
                gameTitle.style.opacity = "0";
                const titleBtns = document.getElementById("title-buttons");
                if (titleBtns) titleBtns.classList.add("hidden");
                if (langToggleBtn) langToggleBtn.style.display = "none";
                loadHubLevel(Math.min(unlockedLevel - 1, 5));
            });
        }
    }
    initGameFlow();
    document.addEventListener("languageChanged", () => {
        updateUITranslations();
        if (currentLevel >= 0 && currentLevel < levels.length) {
            levelDisplay.innerText = __("level_name_" + (currentLevel + 1));
        }
        updateScore(score);
    });
    let _lastFrameTime = 0;
    let _hasFrameTime = false;
    let _acc = 0;
    let _pixelTempCanvas = null, _pixelTempCtx = null;
    const FRAME_INTERVAL = 1e3 / 60;
    const MAX_FRAME_DT = 250;
    const MAX_STEPS = 5;
    function step() {
        time++;
        if (window.GAME_PAUSED) return;
        if (gameState === "levelmap") return;
        if (typeof checkAndUpdateLevelCard === "function") {
            checkAndUpdateLevelCard();
        }
        if (typeof window.pollGamepad === "function") {
            window.pollGamepad();
        }
        if (typeof window.updateTouchControlsState === "function") {
            window.updateTouchControlsState();
        }
        if (game.isHub || currentLevel === "hub" || currentLevel < 4 || currentLevel === 6) {
            drawEnhancedBackground(ctx, currentLevel, cameraX, time, game);
        } else {
            ctx.fillStyle = game.happyMode ? "#87CEEB" : currentLevel >= 2 ? Math.random() > .95 ? "#1a0000" : "#000" : "#000";
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        }
        if (!game.isHub && currentLevel !== "hub") {
            bfRenderFace(ctx);
        }
        ctx.save();
        applyCameraShake(ctx);
        ctx.translate(0, -(game.camY || 0));
        if (game.cameraZoom && game.cameraZoom !== 1) {
            const zx = game.zoomTargetWorldX != null ? game.zoomTargetWorldX - cameraX : VIEW_W / 2;
            const zy = game.zoomTargetWorldY != null ? game.zoomTargetWorldY : VIEW_H / 2;
            ctx.translate(zx, zy);
            ctx.scale(game.cameraZoom, game.cameraZoom);
            ctx.translate(-zx, -zy);
        }
        if (gameState === "start") {
            ctx.restore();
            return;
        }
        if (gameState === "introStory") {
            ctx.restore();
            if (typeof window.updateAndDrawIntro === "function") {
                window.updateAndDrawIntro(ctx, time);
            }
            return;
        }
        if (gameState === "friendCinematicL1") {
            if (!game._friendsJumped) {
                game._friendsJumpTimer = (game._friendsJumpTimer || 0) + 1;
                ctx.restore();
                ctx.save();
                ctx.fillStyle = "rgba(0,0,0,0.7)";
                ctx.fillRect(0, 0, VIEW_W, VIEW_H);
                const jumpProgress = Math.min(1, game._friendsJumpTimer / 50);
                for (let f = 0; f < 5; f++) {
                    const fx = 300 + f * 100 + Math.sin(game._friendsJumpTimer * .1 + f) * 30;
                    const fy = VIEW_H / 2 + 50 - jumpProgress * 180 + Math.sin(game._friendsJumpTimer * .15 + f * 2) * 10;
                    ctx.fillStyle = [ "#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#ff6bff" ][f];
                    ctx.shadowColor = "#ffffff";
                    ctx.shadowBlur = 10 * (1 - jumpProgress);
                    ctx.font = "48px sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText([ "😊", "😃", "😄", "😁", "🤩" ][f], fx, fy);
                }
                ctx.shadowBlur = 0;
                ctx.restore();
                if (game._friendsJumpTimer >= 60) {
                    game._friendsJumped = true;
                    gsap.to(messageDiv, {
                        scale: 0,
                        opacity: 0,
                        duration: .1
                    });
                }
                return;
            }
            const l1Lines = [ __("dlg_friends_cage_si") ];
            game.friendCineTimer = (game.friendCineTimer || 0) + 1;
            const step = Math.floor(game.friendCineTimer / 90);
            if (step < l1Lines.length) {
                if (step !== game._lastCineStep) {
                    game._lastCineStep = step;
                    if (l1Lines[step] === "") {
                        gsap.to(messageDiv, {
                            scale: 0,
                            opacity: 0,
                            duration: .2
                        });
                    } else {
                        window.showAnimatedMessage(l1Lines[step], true);
                    }
                }
            } else if (step >= l1Lines.length && !game._cineDone) {
                game._cineDone = true;
                gsap.to(messageDiv, {
                    scale: 0,
                    opacity: 0,
                    duration: .3
                });
                game.player.frozen = false;
                setTimeout(() => {
                    window.unlockAndShowMap(2);
                    gameState = "playing";
                    game.cageTriggered = false;
                    game._cineDone = false;
                    game._friendsJumped = false;
                    game._friendsJumpTimer = 0;
                }, 600);
            }
        }
        if (gameState === "friendCinematic") {
            ctx.restore();
            ctx.save();
            ctx.fillStyle = "rgba(0,0,0,0.85)";
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            const lines = [ __("story_friends_1"), __("story_friends_2"), __("story_friends_3"), __("story_friends_4"), __("story_friends_5"), __("story_friends_6"), __("story_friends_7"), __("story_friends_8"), __("story_friends_9"), __("story_friends_10") ];
            const fullLine = lines[game.friendLine] || "";
            const visible = fullLine.substring(0, game.friendChar);
            ctx.font = "40px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("😊 😃 😄", VIEW_W / 2, VIEW_H / 2 - 100);
            ctx.fillStyle = "#fff";
            ctx.font = '22px "Courier Prime"';
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            if (visible) {
                const a = visible.split("\n");
                a.forEach((l, i) => ctx.fillText(l, VIEW_W / 2, VIEW_H / 2 + i * 35));
            }
            if (game.friendLine >= 7) {
                ctx.fillStyle = "#f44";
                ctx.font = '28px "Fredoka One"';
                ctx.textAlign = "center";
            }
            ctx.font = '14px "Courier Prime"';
            ctx.fillStyle = "rgba(255,255,255,0.45)";
            ctx.fillText(__("ui_press_space"), VIEW_W / 2, VIEW_H - 55);
            game.friendTimer = (game.friendTimer || 0) + 1;
            if (game.friendChar < fullLine.length) {
                if (game.friendTimer % 2 === 0) game.friendChar++;
            } else {
                game.friendHold = (game.friendHold || 0) + 1;
                const holdNeeded = fullLine.length === 0 ? 30 : 100;
                if (game.friendHold >= holdNeeded) {
                    game.friendHold = 0;
                    if (game.friendLine < lines.length - 1) {
                        game.friendLine++;
                        game.friendChar = 0;
                        game.friendTimer = 0;
                    } else {
                        gameState = "playing";
                        window.unlockAndShowMap(4);
                    }
                }
            }
            ctx.restore();
            return;
        }
        if (typeof game.cameraOverrideY === "number") {
            game.camY = (game.camY || 0) + (game.cameraOverrideY - (game.camY || 0)) * .08;
        } else if (game.lvl4State === "falling" && game.player) {
            const targetY = Math.max(0, game.player.y - 300);
            game.camY = (game.camY || 0) + (targetY - (game.camY || 0)) * .08;
        } else {
            game.camY = (game.camY || 0) * .88;
            if (game.camY < 1) game.camY = 0;
        }
        if (game._entryLock > 0) game._entryLock--;
        if (typeof game.cameraOverrideX === "number" && game._entryLock <= 0) {
            cameraX += (game.cameraOverrideX - cameraX) * .1;
        } else if (game.player) {
            if (currentLevel === 0 && (game.subCaveMode || game.player.x >= 27950 && game.player.x <= 34e3)) {
                let targetCamX = game.player.x - VIEW_W / 2 + game.player.w / 2;
                const minCam = 28e3;
                const maxCam = Math.max(minCam, 33650 - VIEW_W);
                targetCamX = Math.max(minCam, Math.min(targetCamX, maxCam));
                cameraX += (targetCamX - cameraX) * .1;
            } else if (game.freeRoam) {
                cameraX += (game.player.x - VIEW_W / 2 + game.player.w / 2 - cameraX) * .1;
            } else {
                let targetCamX = game.player.x - VIEW_W / 2 + game.player.w / 2;
                if (targetCamX < 0) targetCamX = 0;
                if (targetCamX > worldWidth - VIEW_W) targetCamX = worldWidth - VIEW_W;
                cameraX += (targetCamX - cameraX) * .1;
            }
        }
        if (currentLevel === 4 && game.lvl4State === "run_to_door") {
            const dX = 3500;
            ctx.fillStyle = "#1d3d1d";
            ctx.fillRect(dX - cameraX, 400, 50, 100);
            ctx.fillStyle = "#5fdf5f";
            ctx.fillRect(dX - cameraX + 5, 442, 40, 10);
            ctx.fillStyle = "#0f2a0f";
            ctx.fillRect(dX - cameraX, 400, 50, 8);
        }
        if (gameState === "introStory" || gameState === "preNivel4") {
            if (game.storyChar === undefined) {
                game.storyLine = 0;
                game.storyChar = 0;
                game.storyTimer = 0;
                game.storyHold = 0;
            }
            let lines;
            let totalLines;
            if (gameState === "introStory") {
                lines = [ __("story_intro_1"), __("story_intro_2"), __("story_intro_3"), __("story_intro_4"), __("story_intro_5"), __("story_intro_6"), __("story_intro_7"), __("story_intro_8") ];
                totalLines = 8;
            } else {
                lines = [ __("story_prenivel4_1"), __("story_prenivel4_2"), __("story_prenivel4_3"), __("story_prenivel4_4"), __("story_prenivel4_5"), __("story_prenivel4_6"), __("story_prenivel4_7"), __("story_prenivel4_8"), __("story_prenivel4_9"), __("story_prenivel4_10"), __("story_prenivel4_11"), __("story_prenivel4_12") ];
                totalLines = 12;
            }
            const fullLine = lines[game.storyLine] || "";
            if (game.storyChar < fullLine.length) {
                game.storyTimer = (game.storyTimer || 0) + 1;
                if (game.storyTimer % 2 === 0) {
                    game.storyChar++;
                }
            } else {
                game.storyHold = (game.storyHold || 0) + 1;
                const holdNeeded = fullLine.length === 0 ? 30 : 100;
                if (game.storyHold >= holdNeeded) {
                    game.storyHold = 0;
                    if (game.storyLine < totalLines - 1) {
                        game.storyLine++;
                        game.storyChar = 0;
                        game.storyTimer = 0;
                    } else {
                        if (gameState === "introStory") {
                            gameState = "playing";
                            game.storyChar = undefined;
                            loadLevel(0);
                            window.showAnimatedMessage(__("msg_mundo1"));
                        } else {
                            gameState = "playing";
                            game.storyChar = undefined;
                            loadLevel(3);
                            startCaceria();
                            window.showAnimatedMessage(__("msg_haz_lo_que_debas"));
                        }
                        return;
                    }
                }
            }
        }
        if (gameState === "playing") {
            game.player.update(keys, game.platforms);
            game.platforms.forEach(p => {
                p._px = p.x;
                p._py = p.y;
            });
            game.platforms.forEach(p => p.update());
            if (currentLevel === 0 && game.iceMode) {
                game.platforms.forEach(p => {
                    if (p.y < 480 && !p.button && !p.broken && !p.moving && !p.cage && p.x < 9600) {
                        const baseX = p._baseX || p.x;
                        if (!p._baseX) p._baseX = p.x;
                        p.x = baseX + Math.sin(time * .02 + p._baseX * .001) * 30;
                    }
                });
            }
            if (currentLevel === 0 && game.fireMode && !game.arenaLocked && game.player.x > 5e3 && game.player.x < 9600) {
                if (Math.random() < .035 && enemyProjectiles.length < 15) {
                    const spawnX = game.player.x + VIEW_W / 2 + 80;
                    const spawnY = 120 + Math.random() * 260;
                    enemyProjectiles.push({
                        x: spawnX,
                        y: spawnY,
                        w: 20,
                        h: 20,
                        radius: 10,
                        vx: -3.4 - Math.random() * .6,
                        vy: Math.sin(time * .04) * 1.2,
                        color: "#ff4400",
                        isGiant: false,
                        isFireball: true,
                        damage: 12
                    });
                }
            }
            game.enemies.forEach(e => e.update(game.platforms));
            game.platforms.forEach(p => {
                if (!game.player.frozen && game.player.onGround && game.player.currentPlatform === p) {
                    game.player.x += p.x - p._px;
                    game.player.y += p.y - p._py;
                }
            });
            if (currentLevel === 4) {
                if (!game.lvl4State) {
                    game.lvl4State = "walk_right";
                    game.lvl4Timer = 0;
                }
                game.lvl4Timer++;
                if (game.lvl4State === "walk_right") {
                    if (game.lvl4Timer >= 15 * 60 && !game.pasosPlayed) {
                        playSFX("sfx_footsteps");
                        game.pasosPlayed = true;
                    }
                    if (game.lvl4Timer >= 20 * 60) {
                        game.lvl4State = "blackout";
                        game.lvl4Timer = 0;
                        blackoutDiv.style.opacity = 1;
                        document.body.style.background = "#000";
                        playSound(100, 1.5, "sawtooth", .7);
                        applyShake(35);
                    }
                } else if (game.lvl4State === "blackout") {
                    game.player.vx = 0;
                    game.player.frozen = true;
                    if (game.lvl4Timer >= 3 * 60) {
                        blackoutDiv.style.opacity = .95;
                        game.player.scared = true;
                        document.body.style.background = "#000";
                        game.lvl4State = "dread";
                        game.lvl4Timer = 0;
                        game.demon.active = true;
                        game.demon.state = "stalk";
                        game.demon.animRow = 1;
                        game.demon.animFrame = 0;
                        game.demon.facing = -1;
                        game.demon.x = cameraX + VIEW_W - 30;
                        game.demon.visualOnly = true;
                        game.glitchT = 55;
                        game.forceRunDir = 0;
                        window.showAnimatedMessage(__("msg_silencio"), true);
                        setTimeout(() => {
                            if (game.lvl4State === "dread") {
                                game.demon.visualOnly = false;
                                playSFX("sfx_demon_growl_1");
                                setTimeout(() => playSFX("sfx_demon_scream"), 600);
                                applyShake(20);
                                game.forceRunDir = 1;
                                game.player.frozen = false;
                                game.player.vx = MOVE_SPEED * 1.15;
                                game.demon.rage = .7;
                            }
                        }, 180);
                    }
                } else if (game.lvl4State === "dread") {
                    game.demon.x = cameraX + VIEW_W - 30;
                    game.demon.animTimer++;
                    if (game.demon.animTimer >= 6) {
                        game.demon.animTimer = 0;
                        game.demon.animFrame++;
                        if (game.demon.animFrame >= 4) game.demon.animFrame = 0;
                    }
                    if (Math.abs(game.player.vx) < .5) game.player.vx = MOVE_SPEED * 1.2;
                    game.player.frozen = false;
                    game.demon.opacity = Math.min(1, game.lvl4Timer / (4 * 60) * .8);
                    game.demon.visualOnly = true;
                    if (game.lvl4Timer >= 4 * 60) {
                        game.lvl4State = "stalk_left";
                        game.lvl4Timer = 0;
                        game.forceRunDir = -1;
                        game.demon.x = cameraX + VIEW_W / 2;
                        game.demon.state = "chase";
                        game.demon.visualOnly = false;
                        game.demon.opacity = 1;
                        applyShake(25);
                        playSFX("sfx_demon_scream");
                        game.player.vx = -MOVE_SPEED * 1.3;
                        game.player.facing = -1;
                        game.demon.rage = .9;
                        setTimeout(() => {
                            if (game.lvl4State === "stalk_left") playSFX("sfx_demon_growl_1");
                        }, 300);
                    }
                } else if (game.lvl4State === "stalk_left") {
                    game.demon.update(game.player);
                    game.demon.rage = Math.min(1, game.demon.rage + .005);
                    if (Math.abs(game.player.vx) < .5) game.player.vx = -MOVE_SPEED * .9;
                    game.player.frozen = false;
                    blackoutDiv.style.opacity = .7 + Math.sin(game.lvl4Timer * .1) * .15;
                    if (game.player.x + game.player.w > 858 && game.player.x < 1122) {
                        game.lvl4State = "falling";
                        game.lvl4Timer = 0;
                        game.forceRunDir = 0;
                        game.demon.vanish();
                        playSound(300, .6, "sawtooth", .3, 80);
                    }
                    const distToDemon = Math.abs(game.demon.x - game.player.x);
                    if (distToDemon < 120 && !game.oopsShown) {
                        game.oopsShown = true;
                        applyShake(30);
                        window.showAnimatedMessage(__("msg_oops"), false);
                        setTimeout(() => {
                            if (game.lvl4State === "stalk_left") window.showAnimatedMessage(__("msg_corre_mas"), false);
                        }, 500);
                    }
                } else if (game.lvl4State === "falling") {
                    game.player.y += 8 + game.lvl4Timer * .15;
                    game.player.vy = 0;
                    if (game.lvl4Timer >= 5 * 60) {
                        playSound(45, .9, "sawtooth", .75, 22);
                        applyShake(46);
                        blackoutDiv.style.opacity = 1;
                        game.flash = 10;
                        game.lvl4State = "companion";
                        game.lvl4Timer = 0;
                        game.companionMsg = false;
                        game.player.frozen = true;
                        game.camY = 0;
                    }
                } else if (game.lvl4State === "companion") {
                    const lines = [ __("story_companion_1"), __("story_companion_2"), __("story_companion_3"), __("story_companion_4"), __("story_companion_5"), __("story_companion_6") ];
                    const idx = Math.floor(game.lvl4Timer / (3 * 60));
                    if (idx < lines.length) {
                        if (game.textIdx !== idx) {
                            game.textIdx = idx;
                            window.showAnimatedMessage(lines[idx], true);
                            playSound(60 + idx * 60, .6, "sine", .2, 90);
                        }
                    } else {
                        const isMobile = window.isMobileDevice || (typeof window.isMobileOrTouch === "function" && window.isMobileOrTouch()) || (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) || (window.innerWidth <= 768);
                        if (isMobile) {
                            game.lvl4State = "meta";
                            game.lvl4Timer = 0;
                            game.player.frozen = false;
                            bfShow = true;
                            if (typeof window.hideChoice === "function") window.hideChoice();
                            if (choiceDiv) choiceDiv.style.display = "none";
                            if (handDiv) handDiv.style.display = "none";
                            if (cursorDiv) cursorDiv.style.display = "none";
                            document.body.classList.remove("no-cursor");
                            gsap.to(messageDiv, {
                                scale: 0,
                                opacity: 0,
                                duration: .15
                            });
                            if (typeof startCaceria === "function") {
                                startCaceria();
                            }
                        } else {
                            game.lvl4State = "meta";
                            game.lvl4Timer = 0;
                            game.player.frozen = true;
                            if (choiceText) choiceText.textContent = __("ui_choice_question");
                            if (choiceSub) choiceSub.textContent = __("ui_choice_sub");
                            gsap.to(messageDiv, {
                                scale: 0,
                                opacity: 0,
                                duration: .3
                            });
                            setTimeout(() => {
                                window.showChoice();
                            }, 500);
                        }
                    }
                } else if (game.lvl4State === "hunt") {
                    if (currentBGM && game.dread > 0) currentBGM.volume = Math.max(.05, 1 - game.dread * .7);
                    if (game.huntEnemy && !game.huntEnemy.active && !game.huntEnemy.killProcessed) {
                        game.huntEnemy.killProcessed = true;
                        game.huntKills++;
                        game.dread = Math.min(1, game.huntKills / 8);
                        const isFirstKill = game.huntKills === 1;
                        const blackoutMs = isFirstKill ? 750 : 180;
                        blackoutDiv.style.opacity = 1;
                        applyShake(12 + game.huntKills * 5);
                        gsap.to(messageDiv, {
                            scale: 0,
                            opacity: 0,
                            duration: .2
                        });
                        setTimeout(() => {
                            blackoutDiv.style.opacity = 0;
                            if (game.huntKills >= 8) {
                                game.lvl4State = "run_to_door";
                                game.lvl4Timer = 0;
                                game.inHunt = false;
                                bfShow = false;
                                game.happyMode = true;
                                game.sadEnemies = false;
                                game.freeRoam = false;
                                game.forceRunDir = 0;
                                game.vignette = false;
                                game.doorMsg = false;
                                game.doorStep = 0;
                                game.doorTimer = 0;
                                game.oopsShown = false;
                                worldWidth = 4e3;
                                game.platforms = [ new Platform({
                                    x: 0,
                                    y: 500,
                                    w: 4e3,
                                    h: 80
                                }) ];
                                game.player.frozen = false;
                                game.player.invulnerable = 120;
                                game.player.x = 280;
                                game.player.y = 440;
                                game.player.vy = 0;
                                game.camY = 0;
                                game.demon.vanish();
                                if (currentBGM) {
                                    currentBGM.pause();
                                    currentBGM.volume = 1;
                                }
                                document.body.style.background = "#87CEEB";
                                blackoutDiv.style.opacity = 0;
                                setTimeout(() => window.showAnimatedMessage(__("msg_avanza_derecha"), false), 400);
                            } else {
                                spawnHuntEnemy();
                            }
                        }, blackoutMs);
                    }
                } else if (game.lvl4State === "meta") {} else if (game.lvl4State === "dark_chase") {
                    game.lvl4Timer++;
                    const t = game.lvl4Timer / 60;
                    if (t < 6) {
                        game.vignetteRadius = 30 + 4.5 * t;
                        blackoutDiv.style.opacity = Math.max(.3, .7 - t * .04);
                        game.vignette = true;
                        if (Math.abs(game.player.vx) < .5) game.player.vx = MOVE_SPEED;
                        document.body.style.background = "#000";
                        if (Math.sin(t * 1.7) > .85 && Math.cos(t * .7) > .5) {
                            ctx.fillStyle = "rgba(255,0,0," + (.1 + Math.sin(t * 2.3) * .08) + ")";
                            ctx.fillRect(VIEW_W * .4, VIEW_H * .33, 3, 3);
                            ctx.fillRect(VIEW_W * .6, VIEW_H * .35, 3, 3);
                        }
                        if (Math.abs(Math.sin(t * 3.14)) < .1) {
                            ctx.fillStyle = "rgba(60,0,0,0.03)";
                            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
                        }
                        applyShake(1 + t * .2);
                    } else {
                        if (t > 5.99 && t < 6.1) {
                            game.demon.startChase(game.player.x - 260, false);
                            playSFX("sfx_demon_growl_1");
                            setTimeout(() => playSFX("sfx_demon_scream"), 650);
                            game.demon.rage = .9;
                            playSound(30, 3, "sawtooth", .3, 15);
                        }
                        if (game.demon.state !== "eating") {
                            const dist = Math.abs(game.demon.x - game.player.x);
                            const closeness = Math.max(0, 1 - dist / 500);
                            game.vignetteRadius = Math.min(500, 65 + (t - 6) * 60);
                            blackoutDiv.style.opacity = Math.max(0, .45 - (t - 6) * .05);
                            applyShake(2 + closeness * 28 + (t - 6) * 2);
                            if (Math.abs(game.player.vx) < .5) game.player.vx = MOVE_SPEED * 1.2;
                            game.demon.update(game.player);
                            if (t >= 9) {
                                applyShake(0);
                                screenShake.intensity = 0;
                                game.player.frozen = true;
                                game.demon.state = "eating";
                                game.demon.animRow = 4;
                                game.demon.animFrame = 0;
                                game.demon.animTimer = 0;
                                game.demon.eatTriggered = false;
                                game.demon.x = game.player.x - game.demon.w * .35;
                            }
                        } else {
                            game.demon.update(game.player);
                        }
                    }
                } else if (game.lvl4State === "run_to_door") {
                    game.lvl4Timer++;
                    const dX = 3500;
                    if (!game.doorMsg && game.player.x + game.player.w > dX - 620) {
                        game.doorMsg = true;
                        game.doorStep = 1;
                        game.doorTimer = 0;
                        game.player.frozen = true;
                        window.showAnimatedMessage(__("msg_salida_prometida"), true);
                        playBGM("bgm_world1_meadow");
                    } else if (game.doorMsg && game.player.frozen) {
                        game.doorTimer++;
                        if (game.doorStep === 1 && game.doorTimer >= 2 * 60) {
                            game.doorStep = 2;
                            game.doorTimer = 0;
                            window.showAnimatedMessage(__("msg_buen_trabajo"), true);
                        }
                        if (game.doorStep === 2 && game.doorTimer >= 2 * 60) {
                            game.player.frozen = false;
                        }
                    }
                    if (game.player.x + game.player.w > dX) {
                        gsap.to(messageDiv, {
                            scale: 0,
                            opacity: 0,
                            duration: .1
                        });
                        blackoutDiv.style.opacity = 1;
                        applyShake(25);
                        playSound(50, 1.5, "sawtooth", .6, 20);
                        setTimeout(() => {
                            game.lvl4State = "dark_chase";
                            game.lvl4Timer = 0;
                            game.inHunt = false;
                            game.freeRoam = true;
                            game.forceRunDir = 1;
                            game.player.frozen = false;
                            game.player.invulnerable = 180;
                            game.player.x = VIEW_W / 2;
                            game.player.y = 440;
                            game.player.vy = 0;
                            game.player.vx = MOVE_SPEED;
                            game.vignette = true;
                            game.vignetteShrink = true;
                            game.vignetteRadius = 40;
                            worldWidth = 999999;
                            game.platforms = [ new Platform({
                                x: -999999,
                                y: 500,
                                w: 9999999,
                                h: 80
                            }) ];
                            document.body.style.background = "#000";
                            blackoutDiv.style.opacity = .5;
                            if (currentBGM) {
                                currentBGM.pause();
                                currentBGM.volume = 1;
                            }
                            playBGM("bgm_world5_dread");
                            if (currentBGM) currentBGM.volume = .35;
                        }, 400);
                    }
                } else if (game.lvl4State === "final_escape") {
                    game.lvl4Timer++;
                    const dist = Math.abs(game.demon.x - game.player.x);
                    const close = Math.max(0, 1 - dist / 520);
                    applyShake(6 + close * 30);
                    game.vignetteRadius = Math.max(140, 300 - game.lvl4Timer * .8 - close * 150);
                    if (Math.abs(game.player.vx) < .5) game.player.vx = MOVE_SPEED;
                    game.demon.update(game.player);
                    if (dist < 130 && !game.oopsShown) {
                        game.oopsShown = true;
                        window.showAnimatedMessage(__("msg_oops"), false);
                        setTimeout(() => {
                            if (game.lvl4State === "final_escape") window.showAnimatedMessage(__("msg_corre_mas"), false);
                        }, 700);
                    }
                }
            }
            const curLvlObj = levels[currentLevel];
            if (curLvlObj) {
                const door = curLvlObj.door;
                if (curLvlObj.jaula && (currentLevel < 4 || currentLevel === 6) && game.cageFriends && game.cageState === 0) {
                    const cj = curLvlObj.jaula;
                    if (game.player.x + game.player.w > cj.x && game.player.x < cj.x + cj.w && game.player.y + game.player.h > cj.y && game.player.y < cj.y + cj.h) {
                        if (game.player.x + game.player.w / 2 < cj.x + cj.w / 2) {
                            game.player.x = cj.x - game.player.w;
                        } else {
                            game.player.x = cj.x + cj.w;
                        }
                        game.player.vx = 0;
                        if (game.player.dashTimer > 0) game.player.dashTimer = 0;
                    }
                }
                if (door && door.active && game.player.x + game.player.w > door.x && game.player.x < door.x + door.w && game.player.y + game.player.h > door.y && !game.player.frozen) {
                    if (currentLevel === 4) {
                        loadLevel(3);
                        window.showAnimatedMessage(__("msg_puntos"));
                    } else {
                        window.unlockAndShowMap(currentLevel + 2);
                    }
                }
            }
        }
        if (game.happyMode || currentLevel === 0) {
            const mood = game.inHunt ? 0 : game.happyMode ? game.happyCycle || 0 : 0;
            const cloudColor = window.postGameHorror ? "rgba(40, 36, 44, 0.95)" : game.inHunt ? "rgba(235,235,240,0.95)" : mood === 0 ? "rgba(255,255,255,0.95)" : mood === 1 ? "rgba(210,210,215,0.9)" : mood === 2 ? "rgba(150,140,140,0.9)" : "rgba(55,25,25,0.95)";
            for (let i = 0; i < 6; i++) {
                const cx = (i * 420 + 130 - cameraX * .5) % (VIEW_W + 300) - 150;
                const cy = 70 + i % 3 * 55;
                ctx.fillStyle = cloudColor;
                ctx.beginPath();
                ctx.arc(cx, cy, 26, 0, Math.PI * 2);
                ctx.arc(cx + 26, cy - 8, 20, 0, Math.PI * 2);
                ctx.arc(cx + 50, cy, 24, 0, Math.PI * 2);
                ctx.arc(cx + 25, cy + 10, 22, 0, Math.PI * 2);
                ctx.fill();
                const ex = cx + 25, ey = cy + 2;
                if (window.postGameHorror) {
                    ctx.fillStyle = "#050202";
                    ctx.beginPath();
                    ctx.arc(ex - 9, ey - 3, 6, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(ex + 9, ey - 3, 6, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#ff0000";
                    ctx.fillRect(ex - 10, ey - 4, 2.5, 2.5);
                    ctx.fillRect(ex + 8, ey - 4, 2.5, 2.5);
                    ctx.fillStyle = "rgba(180, 0, 0, 0.85)";
                    ctx.fillRect(ex - 10, ey + 3, 2, 9);
                    ctx.fillRect(ex + 8, ey + 3, 2, 9);
                    ctx.fillStyle = "#050202";
                    ctx.beginPath();
                    ctx.ellipse(ex, ey + 10, 6, 8, 0, 0, Math.PI * 2);
                    ctx.fill();
                } else if (game.inHunt) {
                    ctx.fillStyle = "#333";
                    ctx.beginPath();
                    ctx.arc(ex - 8, ey - 4, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(ex + 8, ey - 4, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = "#333";
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(ex, ey + 6, 7, 1.1 * Math.PI, 1.9 * Math.PI);
                    ctx.stroke();
                    ctx.fillStyle = "#aef";
                    ctx.beginPath();
                    ctx.arc(ex + 11, ey - 9, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                } else if (mood === 0) {
                    ctx.fillStyle = "#333";
                    ctx.fillRect(ex - 12, ey - 6, 5, 6);
                    ctx.fillRect(ex + 7, ey - 6, 5, 6);
                    ctx.strokeStyle = "#333";
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(ex, ey + 2, 10, .15 * Math.PI, .85 * Math.PI);
                    ctx.stroke();
                } else if (mood === 1) {
                    ctx.fillStyle = "#222";
                    ctx.fillRect(ex - 12, ey - 6, 5, 6);
                    ctx.fillRect(ex + 7, ey - 6, 5, 6);
                    ctx.fillRect(ex - 9, ey + 8, 18, 3);
                } else if (mood === 2) {
                    ctx.strokeStyle = "#300";
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(ex - 14, ey - 11);
                    ctx.lineTo(ex - 4, ey - 6);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(ex + 14, ey - 11);
                    ctx.lineTo(ex + 4, ey - 6);
                    ctx.stroke();
                    ctx.fillStyle = "#300";
                    ctx.fillRect(ex - 11, ey - 5, 5, 6);
                    ctx.fillRect(ex + 6, ey - 5, 5, 6);
                    ctx.beginPath();
                    ctx.arc(ex, ey + 16, 9, 1.15 * Math.PI, 1.85 * Math.PI);
                    ctx.stroke();
                } else {
                    ctx.fillStyle = "#000";
                    ctx.beginPath();
                    ctx.arc(ex - 9, ey - 3, 6, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(ex + 9, ey - 3, 6, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#ff0000";
                    ctx.fillRect(ex - 11, ey - 5, 3, 3);
                    ctx.fillRect(ex + 7, ey - 5, 3, 3);
                    ctx.fillStyle = "#000";
                    ctx.beginPath();
                    ctx.arc(ex, ey + 11, 9, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#fff";
                    ctx.beginPath();
                    ctx.moveTo(ex - 8, ey + 4);
                    ctx.lineTo(ex - 4, ey + 10);
                    ctx.lineTo(ex - 1, ey + 4);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.moveTo(ex + 1, ey + 4);
                    ctx.lineTo(ex + 5, ey + 10);
                    ctx.lineTo(ex + 8, ey + 4);
                    ctx.fill();
                }
            }
        }
        const isMobileTutorial = window.isMobileDevice || typeof window.isMobileOrTouch === "function" && window.isMobileOrTouch();
        if (currentLevel === 0 && !isMobileTutorial) {
            const drawBigSign = (sx, sw, sh, renderContents) => {
                const drawX = sx - cameraX;
                if (drawX + sw < -50 || drawX - sw > VIEW_W + 50) return;
                ctx.save();
                ctx.translate(drawX, 500);
                ctx.fillStyle = "#4a2f18";
                ctx.fillRect(-sw / 2 + 20, -sh - 20, 16, sh + 20);
                ctx.fillRect(sw / 2 - 36, -sh - 20, 16, sh + 20);
                ctx.fillStyle = "#b58b5e";
                ctx.fillRect(-sw / 2, -sh - 30, sw, sh);
                ctx.lineWidth = 4;
                ctx.strokeStyle = "#3e2723";
                ctx.strokeRect(-sw / 2, -sh - 30, sw, sh);
                ctx.fillStyle = "#777";
                ctx.beginPath();
                ctx.arc(-sw / 2 + 28, -sh - 16, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(-sw / 2 + 28, -44, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(sw / 2 - 28, -sh - 16, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(sw / 2 - 28, -44, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.translate(0, -sh / 2 - 30);
                renderContents();
                ctx.restore();
            };
            const drawKey = (kx, ky, label, kw = 28) => {
                ctx.fillStyle = "#222";
                ctx.fillRect(kx - kw / 2, ky - 14, kw, 28);
                ctx.fillStyle = "#e5e5e5";
                ctx.fillRect(kx - kw / 2 + 1, ky - 12, kw - 2, 24);
                ctx.fillStyle = "#111";
                ctx.font = "bold 12px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(label, kx, ky);
            };
            const drawDPad = (dx, dy) => {
                ctx.fillStyle = "#222";
                ctx.fillRect(dx - 22, dy - 8, 44, 16);
                ctx.fillRect(dx - 8, dy - 22, 16, 44);
                ctx.fillStyle = time % 60 < 30 ? "#ef4444" : "#666";
                ctx.beginPath();
                ctx.moveTo(dx - 18, dy);
                ctx.lineTo(dx - 10, dy - 5);
                ctx.lineTo(dx - 10, dy + 5);
                ctx.fill();
                ctx.fillStyle = time % 60 >= 30 ? "#ef4444" : "#666";
                ctx.beginPath();
                ctx.moveTo(dx + 18, dy);
                ctx.lineTo(dx + 10, dy - 5);
                ctx.lineTo(dx + 10, dy + 5);
                ctx.fill();
            };
            const drawRealPeggy = (px, py, fakeRef) => {
                const pColor = game.iceMode ? "#66ccff" : "#ff66aa";
                if (typeof drawPlayerEnhanced === "function") {
                    const savedTime = time;
                    time = 100;
                    drawPlayerEnhanced(ctx, px - 16, py - 16, 32, 32, fakeRef.facing || 1, 1, 1, pColor, 0, [], false, fakeRef);
                    time = savedTime;
                }
            };
            drawBigSign(450, 520, 140, () => {
                ctx.fillStyle = "#3e2723";
                ctx.font = "bold 14px sans-serif";
                ctx.textAlign = "center";
                drawDPad(-180, -30);
                drawRealPeggy(-180, 30, {
                    state: "run",
                    facing: time % 60 < 30 ? -1 : 1
                });
                ctx.fillText("MOVER", -180, -60);
                drawKey(-60, -30, "ESPACIO", 70);
                ctx.fillText(typeof __ === "function" ? __("ui_ctrl_move_short") : "MOVER", -180, -60);
                drawKey(-60, -30, typeof __ === "function" ? __("ui_key_space") : "ESPACIO", 70);
                drawRealPeggy(-60, 30, {
                    state: "jump",
                    vy: time % 60 < 30 ? -2 : 2
                });
                ctx.fillText("SALTAR", -60, -60);
                ctx.fillText(typeof __ === "function" ? __("ui_ctrl_jump_short") : "SALTAR", -60, -60);
                drawKey(60, -30, "X");
                drawRealPeggy(60, 30, {
                    state: "idle",
                    facing: 1
                });
                ctx.fillStyle = "#fbbf24";
                ctx.fillRect(80, 26, 6, 6);
                ctx.fillText("DISPARAR", 60, -60);
                ctx.fillText(typeof __ === "function" ? __("ui_ctrl_shoot_short") : "DISPARAR", 60, -60);
                drawKey(180, -30, "C");
                drawRealPeggy(180, 30, {
                    state: "run",
                    facing: 1,
                    dashTimer: 10
                });
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(150, 28);
                ctx.lineTo(165, 28);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(145, 36);
                ctx.lineTo(160, 36);
                ctx.stroke();
                ctx.fillText("DASH", 180, -60);
                ctx.fillText(typeof __ === "function" ? __("ui_ctrl_dash_short") : "DASH", 180, -60);
            });
            drawBigSign(1250, 420, 140, () => {
                ctx.fillStyle = "#3e2723";
                ctx.font = "bold 14px sans-serif";
                ctx.textAlign = "center";
                drawKey(-140, -30, "X");
                ctx.fillText("MANTENER", -140, -60);
                ctx.fillText(typeof __ === "function" ? __("ui_ctrl_hold") : "MANTENER", -140, -60);
                drawRealPeggy(-60, 30, {
                    state: "idle",
                    facing: 1,
                    charging: true,
                    chargeLevel: 1
                });
                drawRealPeggy(0, 30, {
                    state: "idle",
                    facing: 1,
                    charging: true,
                    chargeLevel: 2
                });
                drawRealPeggy(60, 30, {
                    state: "idle",
                    facing: 1,
                    charging: true,
                    chargeLevel: 3
                });
                drawRealPeggy(120, 30, {
                    state: "idle",
                    facing: 1,
                    charging: true,
                    chargeLevel: 4
                });
                ctx.fillStyle = "#ef4444";
                ctx.fillRect(160, 22, 10, 10);
            });
            drawBigSign(1750, 300, 140, () => {
                ctx.fillStyle = "#3e2723";
                ctx.font = "bold 14px sans-serif";
                ctx.textAlign = "center";
                drawKey(-70, -42, "ESPACIO", 66);
                drawKey(-70, -42, typeof __ === "function" ? __("ui_key_space") : "ESPACIO", 66);
                ctx.fillText("+", -70, -20);
                drawKey(-70, -2, "C");
                drawRealPeggy(-70, 40, {
                    state: "jump",
                    facing: 1,
                    vy: 2,
                    dashTimer: 10
                });
                ctx.fillStyle = "rgba(255,255,255,0.4)";
                ctx.beginPath();
                ctx.ellipse(-70, 60, 15, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#3e2723";
                ctx.fillText("AIR DASH", -70, -64);
                ctx.fillText(typeof __ === "function" ? __("ui_ctrl_air_dash") : "AIR DASH", -70, -64);
                drawKey(70, -42, "↑");
                ctx.fillText("+", 70, -20);
                drawKey(70, -2, "X");
                drawRealPeggy(70, 40, {
                    state: "jump",
                    facing: 1,
                    vy: -1
                });
                ctx.fillStyle = "#fbbf24";
                ctx.fillRect(66, 8, 6, 6);
                ctx.fillStyle = "#3e2723";
                ctx.fillText("DISPARO ARRIBA", 70, -64);
                ctx.fillText(typeof __ === "function" ? __("ui_ctrl_shoot_up") : "DISPARO ARRIBA", 70, -64);
            });
            drawBigSign(13050, 280, 140, () => {
                ctx.fillStyle = "#3e2723";
                ctx.font = "bold 14px sans-serif";
                ctx.textAlign = "center";
                drawKey(-60, -42, "X");
                ctx.font = "bold 10px sans-serif";
                ctx.fillText("NIVEL 4", -20, -42);
                ctx.fillText(typeof __ === "function" ? __("ui_ctrl_lvl4") : "NIVEL 4", -20, -42);
                ctx.font = "bold 14px sans-serif";
                ctx.fillText("+", -60, -20);
                drawKey(-60, -2, "C");
                drawRealPeggy(50, 30, {
                    state: "run",
                    facing: 1,
                    dashTimer: 10,
                    dashMax: true,
                    dashDir: 1,
                    charging: true,
                    chargeLevel: 4
                });
                ctx.fillText("ENERGY DASH", 0, -64);
                ctx.fillText(typeof __ === "function" ? __("ui_ctrl_edash_short") : "ENERGY DASH", 0, -64);
            });
        }
        if (Array.isArray(game.platforms) && game.platforms.length > 0) {
            game.platforms.forEach(p => p.draw(ctx, cameraX));
        }
        if (currentLevel === 3) {
            ctx.save();
            const waterY = 495;
            const seaGrad = ctx.createLinearGradient(0, waterY, 0, VIEW_H + 100);
            if (window.postGameHorror) {
                seaGrad.addColorStop(0, "rgba(28, 8, 8, 0.96)");
                seaGrad.addColorStop(.35, "rgba(42, 10, 10, 0.98)");
                seaGrad.addColorStop(1, "rgba(10, 2, 2, 1)");
            } else if (game.stormMode) {
                seaGrad.addColorStop(0, "rgba(8, 47, 73, 0.88)");
                seaGrad.addColorStop(.3, "rgba(12, 74, 110, 0.94)");
                seaGrad.addColorStop(1, "rgba(2, 18, 36, 0.98)");
            } else {
                seaGrad.addColorStop(0, "rgba(6, 182, 212, 0.72)");
                seaGrad.addColorStop(.3, "rgba(14, 116, 144, 0.85)");
                seaGrad.addColorStop(1, "rgba(3, 37, 65, 0.96)");
            }
            ctx.fillStyle = seaGrad;
            const waveAmp = game.stormMode || window.postGameHorror ? 8.5 : 5;
            ctx.beginPath();
            ctx.moveTo(-60, VIEW_H + 120);
            ctx.lineTo(-60, waterY);
            for (let xScreen = -60; xScreen <= VIEW_W + 60; xScreen += 16) {
                const worldX = xScreen + cameraX;
                const wave = Math.sin(time * .1 + worldX * .022) * waveAmp + Math.cos(time * .06 + worldX * .008) * (waveAmp * .5);
                ctx.lineTo(xScreen, waterY + wave);
            }
            ctx.lineTo(VIEW_W + 60, VIEW_H + 120);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = window.postGameHorror ? "rgba(153, 27, 27, 0.85)" : game.stormMode ? "rgba(235, 248, 255, 0.92)" : "rgba(255, 255, 255, 0.82)";
            ctx.lineWidth = game.stormMode || window.postGameHorror ? 3.5 : 2.5;
            ctx.beginPath();
            for (let xScreen = -60; xScreen <= VIEW_W + 60; xScreen += 16) {
                const worldX = xScreen + cameraX;
                const wave = Math.sin(time * .1 + worldX * .022) * waveAmp + Math.cos(time * .06 + worldX * .008) * (waveAmp * .5);
                if (xScreen === -60) ctx.moveTo(xScreen, waterY + wave); else ctx.lineTo(xScreen, waterY + wave);
            }
            ctx.stroke();
            ctx.fillStyle = window.postGameHorror ? "rgba(185, 28, 28, 0.65)" : "rgba(255, 255, 255, 0.65)";
            for (let s = 0; s < 7; s++) {
                const spX = (time * 24 + s * 130) % (VIEW_W + 200) - 100;
                const worldX = spX + cameraX;
                const waveY = waterY + Math.sin(time * .08 + worldX * .02) * 5;
                ctx.fillRect(spX, waveY + 2, 7, 2);
            }
            ctx.restore();
        }
        if (game.isHub && Array.isArray(game.hubDoors)) {
            let standingDoor = null;
            window.canEnterDoor = false;
            game.hubDoors.forEach(door => {
                const dx = door.x - cameraX;
                const isAnimLocked = door.unlockAnim && !door.unlockAnim.unlocked;
                const isUnlocked = door.levelNum <= unlockedLevel && !isAnimLocked && !door.boarded;
                if (isUnlocked) {
                    const pulse = Math.sin(time * .08) * 5;
                    ctx.save();
                    ctx.shadowColor = "#ffffff";
                    ctx.shadowBlur = 18 + pulse;
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.roundRect(dx - 4, door.y - 4, door.w + 8, door.h + 4, [ 32, 32, 0, 0 ]);
                    ctx.fill();
                    ctx.restore();
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.roundRect(dx - 2, door.y - 2, door.w + 4, door.h + 2, [ 30, 30, 0, 0 ]);
                    ctx.fill();
                    const pGrad = ctx.createLinearGradient(dx, door.y, dx, door.y + door.h);
                    pGrad.addColorStop(0, "#ffffff");
                    pGrad.addColorStop(.35, "#d4f2ff");
                    pGrad.addColorStop(.7, "#60b8ff");
                    pGrad.addColorStop(1, "#004488");
                    ctx.fillStyle = pGrad;
                    ctx.beginPath();
                    ctx.roundRect(dx, door.y, door.w, door.h, [ 28, 28, 0, 0 ]);
                    ctx.fill();
                    ctx.fillStyle = "rgba(255, 255, 255, " + (.45 + Math.sin(time * .1) * .25) + ")";
                    ctx.beginPath();
                    ctx.arc(dx + door.w / 2, door.y + door.h * .45, 15 + pulse * .5, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    const animGlow = door.unlockAnim && door.unlockAnim.glow ? door.unlockAnim.glow : 0;
                    if (animGlow > 0) {
                        ctx.save();
                        ctx.shadowColor = "#38bdf8";
                        ctx.shadowBlur = 24 * animGlow;
                        ctx.fillStyle = "rgba(56, 189, 248, " + .35 * animGlow + ")";
                        ctx.beginPath();
                        ctx.roundRect(dx - 4, door.y - 4, door.w + 8, door.h + 4, [ 32, 32, 0, 0 ]);
                        ctx.fill();
                        ctx.restore();
                    }
                    ctx.fillStyle = animGlow > 0 ? "#2a3442" : "#22242b";
                    ctx.beginPath();
                    ctx.roundRect(dx - 3, door.y - 3, door.w + 6, door.h + 3, [ 30, 30, 0, 0 ]);
                    ctx.fill();
                    ctx.fillStyle = animGlow > 0 ? "#1b2330" : "#16181e";
                    ctx.beginPath();
                    ctx.roundRect(dx, door.y, door.w, door.h, [ 28, 28, 0, 0 ]);
                    ctx.fill();
                    if (animGlow > 0) {
                        const innerGrad = ctx.createLinearGradient(dx, door.y, dx, door.y + door.h);
                        innerGrad.addColorStop(0, "rgba(255, 255, 255, " + .85 * animGlow + ")");
                        innerGrad.addColorStop(.5, "rgba(56, 189, 248, " + .65 * animGlow + ")");
                        innerGrad.addColorStop(1, "rgba(10, 30, 60, " + .45 * animGlow + ")");
                        ctx.fillStyle = innerGrad;
                        ctx.beginPath();
                        ctx.roundRect(dx, door.y, door.w, door.h, [ 28, 28, 0, 0 ]);
                        ctx.fill();
                    }
                    ctx.strokeStyle = animGlow > 0 ? "#38bdf8" : "#2b2e38";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(dx, door.y + 40);
                    ctx.lineTo(dx + door.w, door.y + 40);
                    ctx.moveTo(dx + door.w / 2, door.y + 20);
                    ctx.lineTo(dx + door.w / 2, door.y + door.h);
                    ctx.stroke();
                    ctx.font = 22 + Math.floor(animGlow * 4) + "px sans-serif";
                    ctx.textAlign = "center";
                    const shakeOffset = animGlow > 0 ? Math.sin(time * .8) * (4 * animGlow) : 0;
                    ctx.fillText("🔒", dx + door.w / 2 + shakeOffset, door.y + door.h / 2 + 10);
                }
                if (door.boarded) {
                    ctx.fillStyle = "#3a200e";
                    ctx.strokeStyle = "#231206";
                    ctx.lineWidth = 2;
                    ctx.fillRect(dx - 5, door.y + 20, door.w + 10, 16);
                    ctx.strokeRect(dx - 5, door.y + 20, door.w + 10, 16);
                    ctx.translate(dx + door.w / 2, door.y + 50);
                    ctx.rotate(.2);
                    ctx.fillRect(-door.w / 2 - 5, -8, door.w + 10, 16);
                    ctx.strokeRect(-door.w / 2 - 5, -8, door.w + 10, 16);
                    ctx.rotate(-.4);
                    ctx.fillRect(-door.w / 2 - 5, -8, door.w + 10, 16);
                    ctx.strokeRect(-door.w / 2 - 5, -8, door.w + 10, 16);
                    ctx.rotate(.2);
                    ctx.translate(-(dx + door.w / 2), -(door.y + 50));
                }
                ctx.save();
                const plateY = door.y - 34;
                const plateW = door.w + 24;
                const plateH = 22;
                const isPlateActive = isUnlocked || door.unlockAnim && door.unlockAnim.unlocked;
                ctx.fillStyle = isPlateActive ? "rgba(10, 15, 30, 0.95)" : "rgba(15, 12, 22, 0.95)";
                ctx.strokeStyle = isPlateActive ? "#38bdf8" : "#475569";
                ctx.lineWidth = 1.5;
                if (isPlateActive) {
                    ctx.shadowColor = "#38bdf8";
                    ctx.shadowBlur = 8;
                }
                ctx.beginPath();
                ctx.roundRect(dx - 12, plateY, plateW, plateH, [ 6, 6, 6, 6 ]);
                ctx.fill();
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.font = "bold 12px sans-serif";
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                ctx.fillStyle = isPlateActive ? "#ffffff" : "#94a3b8";
                ctx.fillText("NIVEL " + door.levelNum, dx + door.w / 2, plateY + plateH / 2);
                ctx.fillText(typeof __ === "function" ? __("ui_level_n", door.levelNum) : "NIVEL " + door.levelNum, dx + door.w / 2, plateY + plateH / 2);
                ctx.restore();
                if (game.player && game.player.x + game.player.w > door.x + 8 && game.player.x < door.x + door.w - 8 && game.player.y + game.player.h >= door.y && game.player.y <= door.y + door.h + 20) {
                    standingDoor = door;
                }
            });
            if (Array.isArray(game.hubFriends) && game.hubFriends.length > 0 && !window.postGameHorror) {
                game.hubFriends.forEach(f => {
                    f.hopTimer = (f.hopTimer || 0) + 1;
                    const pDist = game.player ? game.player.x - f.x : 0;
                    const isNearPeggy = Math.abs(pDist) < 130;
                    if (isNearPeggy) {
                        f.facing = pDist >= 0 ? 1 : -1;
                    }
                    const jumpCycle = isNearPeggy ? 65 : 120;
                    const isHop = f.hopTimer % jumpCycle < 22;
                    let hopOffset = 0;
                    let scaleX = 1;
                    let scaleY = 1;
                    if (isHop) {
                        const progress = f.hopTimer % jumpCycle / 22;
                        hopOffset = Math.sin(progress * Math.PI) * (isNearPeggy ? 24 : 16);
                        scaleX = .9;
                        scaleY = 1.15;
                    } else if (f.hopTimer % jumpCycle >= 22 && f.hopTimer % jumpCycle < 26) {
                        scaleX = 1.15;
                        scaleY = .85;
                    } else {
                        const breath = Math.sin(time * .12 + (f.baseX || 0)) * .035;
                        scaleX = 1 + breath;
                        scaleY = 1 - breath;
                    }
                    if (!isNearPeggy) {
                        f.wanderTimer = (f.wanderTimer || 0) + 1;
                        const wOffset = Math.sin(f.wanderTimer * .025) * 24;
                        f.x = (f.baseX || f.x) + wOffset;
                        f.facing = Math.cos(f.wanderTimer * .025) >= 0 ? 1 : -1;
                    }
                    const fx = f.x - cameraX;
                    const fy = f.y - hopOffset;
                    const cx = fx + f.w / 2;
                    ctx.save();
                    ctx.translate(cx, fy + f.h / 2);
                    ctx.scale(scaleX, scaleY);
                    ctx.translate(-cx, -(fy + f.h / 2));
                    const shadowScale = Math.max(.35, 1 - hopOffset / 32);
                    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
                    ctx.beginPath();
                    ctx.ellipse(cx, f.y + f.h + 2, f.w * .44 * shadowScale, 4 * shadowScale, 0, 0, Math.PI * 2);
                    ctx.fill();
                    const fGrad = ctx.createLinearGradient(fx, fy, fx, fy + f.h);
                    fGrad.addColorStop(0, f.topColor || "#7dd3fc");
                    fGrad.addColorStop(1, f.botColor || "#0284c7");
                    ctx.fillStyle = fGrad;
                    ctx.beginPath();
                    ctx.roundRect(fx, fy, f.w, f.h, 10);
                    ctx.fill();
                    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                    ctx.beginPath();
                    ctx.ellipse(fx + f.w * .35, fy + 6, f.w * .28, 3.5, 0, 0, Math.PI * 2);
                    ctx.fill();
                    const cheekY = fy + f.h * .52;
                    ctx.fillStyle = f.cheekColor || "rgba(255, 102, 170, 0.65)";
                    ctx.beginPath();
                    ctx.ellipse(fx + f.w * .2, cheekY, 3.5, 2.2, 0, 0, Math.PI * 2);
                    ctx.ellipse(fx + f.w * .8, cheekY, 3.5, 2.2, 0, 0, Math.PI * 2);
                    ctx.fill();
                    const eyeY = fy + f.h * .36;
                    const lookX = f.facing * 2.2;
                    const lookY = isHop ? -1.2 : 0;
                    if (isHop || isNearPeggy) {
                        ctx.fillStyle = "#ffffff";
                        ctx.beginPath();
                        ctx.arc(fx + f.w * .3, eyeY, 5.8, 0, Math.PI * 2);
                        ctx.arc(fx + f.w * .7, eyeY, 5.8, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = "#111111";
                        ctx.beginPath();
                        ctx.arc(fx + f.w * .3 + lookX, eyeY + lookY, 3.2, 0, Math.PI * 2);
                        ctx.arc(fx + f.w * .7 + lookX, eyeY + lookY, 3.2, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = "#ffffff";
                        ctx.beginPath();
                        ctx.arc(fx + f.w * .25 + lookX, eyeY - 1.5, 1.4, 0, Math.PI * 2);
                        ctx.arc(fx + f.w * .65 + lookX, eyeY - 1.5, 1.4, 0, Math.PI * 2);
                        ctx.arc(fx + f.w * .33 + lookX, eyeY + 1.2, .8, 0, Math.PI * 2);
                        ctx.arc(fx + f.w * .73 + lookX, eyeY + 1.2, .8, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        ctx.fillStyle = "#ffffff";
                        ctx.beginPath();
                        ctx.arc(fx + f.w * .3, eyeY, 5.2, 0, Math.PI * 2);
                        ctx.arc(fx + f.w * .7, eyeY, 5.2, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = "#111111";
                        ctx.beginPath();
                        ctx.arc(fx + f.w * .3 + lookX, eyeY, 2.8, 0, Math.PI * 2);
                        ctx.arc(fx + f.w * .7 + lookX, eyeY, 2.8, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = "#ffffff";
                        ctx.beginPath();
                        ctx.arc(fx + f.w * .25 + lookX, eyeY - 1.5, 1.3, 0, Math.PI * 2);
                        ctx.arc(fx + f.w * .65 + lookX, eyeY - 1.5, 1.3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.strokeStyle = "#111111";
                    ctx.lineWidth = 1.8;
                    ctx.beginPath();
                    ctx.arc(fx + f.w * .3, eyeY - 7, 3, 1.1 * Math.PI, 1.9 * Math.PI);
                    ctx.arc(fx + f.w * .7, eyeY - 7, 3, 1.1 * Math.PI, 1.9 * Math.PI);
                    ctx.stroke();
                    const mouthY = fy + f.h * .66;
                    ctx.fillStyle = "#111111";
                    ctx.beginPath();
                    ctx.arc(cx, mouthY - 1, 5.2, 0, Math.PI);
                    ctx.fill();
                    ctx.fillStyle = "#ff6688";
                    ctx.beginPath();
                    ctx.arc(cx, mouthY + 1.4, 2.6, 0, Math.PI);
                    ctx.fill();
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(cx - 2, mouthY - 1, 4, 1.5);
                    if (isNearPeggy) {
                        const iconY = fy - 14 + Math.sin(time * .15 + (f.baseX || 0)) * 4;
                        ctx.fillStyle = "#ff3388";
                        ctx.font = "14px sans-serif";
                        ctx.textAlign = "center";
                        ctx.fillText("♥", cx, iconY);
                    }
                    ctx.restore();
                });
            }
            if (standingDoor && !game.player.frozen && !game.isEnteringDoor) {
                const isUnlocked = standingDoor.levelNum <= unlockedLevel && (!standingDoor.unlockAnim || standingDoor.unlockAnim.unlocked) && !standingDoor.boarded;
                const sdx = standingDoor.x - cameraX + standingDoor.w / 2;
                const floatY = standingDoor.y - 74 + Math.sin(time * .1) * 3;
                window.canEnterDoor = !!isUnlocked;
                ctx.save();
                ctx.font = "bold 13px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                if (isUnlocked) {
                    if (!window.postGameHorror) {
                        const enterLabel = "▲ " + __("ui_presiona_arriba_entrar");
                        const enterW = Math.max(130, ctx.measureText(enterLabel).width + 30);
                        ctx.fillStyle = "rgba(10, 15, 30, 0.94)";
                        ctx.strokeStyle = "#00ffff";
                        ctx.lineWidth = 2;
                        ctx.shadowColor = "#00ffff";
                        ctx.shadowBlur = 10;
                        ctx.beginPath();
                        ctx.roundRect(sdx - enterW / 2, floatY - 14, enterW, 28, [ 8, 8, 8, 8 ]);
                        ctx.fill();
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                        ctx.fillStyle = "#ffffff";
                        ctx.fillText(enterLabel, sdx, floatY);
                        ctx.fillStyle = "#00ffff";
                        ctx.beginPath();
                        ctx.moveTo(sdx - 5, floatY + 14);
                        ctx.lineTo(sdx + 5, floatY + 14);
                        ctx.lineTo(sdx, floatY + 20);
                        ctx.fill();
                    }
                    if (keys["ArrowUp"] || keys["w"] || keys["W"]) {
                        keys["ArrowUp"] = false;
                        keys["w"] = false;
                        keys["W"] = false;
                        game.isEnteringDoor = true;
                        game.player.frozen = true;
                        window.canEnterDoor = false;
                        const targetDoorX = standingDoor.x + standingDoor.w / 2;
                        const targetDoorY = standingDoor.y + standingDoor.h / 2;
                        try {
                            playSound(380, .7, "sine", .4, 980);
                        } catch (e) {}
                        try {
                            createExplosion(targetDoorX, targetDoorY, "#ffffff", 40, 30);
                        } catch (e) {}
                        if (typeof gsap !== "undefined") {
                            gsap.to(game.player, {
                                x: targetDoorX - game.player.w / 2,
                                scaleX: .05,
                                scaleY: .05,
                                duration: .65,
                                ease: "power2.in"
                            });
                            game.cameraZoom = 1;
                            game.zoomTargetWorldX = targetDoorX;
                            game.zoomTargetWorldY = targetDoorY;
                            gsap.to(game, {
                                cameraZoom: 2.9,
                                duration: .75,
                                ease: "power2.inOut",
                                onComplete: () => {
                                    game.flash = 1;
                                    game.cameraZoom = 1;
                                    delete game.zoomTargetWorldX;
                                    delete game.zoomTargetWorldY;
                                    game.isEnteringDoor = false;
                                    loadLevel(standingDoor.levelIndex);
                                }
                            });
                        } else {
                            setTimeout(() => {
                                loadLevel(standingDoor.levelIndex);
                            }, 350);
                        }
                    }
                } else {
                    ctx.fillStyle = "rgba(25, 10, 18, 0.94)";
                    ctx.strokeStyle = "#ef4444";
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.roundRect(sdx - 58, floatY - 13, 116, 26, [ 6, 6, 6, 6 ]);
                    ctx.fill();
                    ctx.stroke();
                    ctx.fillStyle = "#fca5a5";
                    ctx.fillText("🔒 BLOQUEADO", sdx, floatY);
                    ctx.fillText(typeof __ === "function" ? __("ui_locked") : "🔒 BLOQUEADO", sdx, floatY);
                    ctx.fillStyle = "#ef4444";
                    ctx.beginPath();
                    ctx.moveTo(sdx - 4, floatY + 13);
                    ctx.lineTo(sdx + 4, floatY + 13);
                    ctx.lineTo(sdx, floatY + 18);
                    ctx.fill();
                    if (keys["ArrowUp"] || keys["w"] || keys["W"]) {
                        keys["ArrowUp"] = false;
                        keys["w"] = false;
                        keys["W"] = false;
                        try {
                            playSound(120, .15, "sawtooth", .2, 70);
                        } catch (e) {}
                        try {
                            addFloatingText(standingDoor.x + standingDoor.w / 2, standingDoor.y - 10, "¡SUPERAR NIVEL ANTERIOR!", "#ff3355", 18);
                            addFloatingText(standingDoor.x + standingDoor.w / 2, standingDoor.y - 10, typeof __ === "function" ? __("flt_superar_nivel_anterior") : "¡SUPERAR NIVEL ANTERIOR!", "#ff3355", 18);
                        } catch (e) {}
                    }
                }
                ctx.restore();
            }
        } else {
            window.canEnterDoor = false;
        }
        if (game.iceWaveActive) {
            game.iceWaveRadius = (game.iceWaveRadius || 10) + 35;
            ctx.save();
            const wx = game.iceWaveX - cameraX;
            const wy = game.iceWaveY;
            ctx.beginPath();
            ctx.arc(wx, wy, game.iceWaveRadius, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(0, 229, 255, 0.85)";
            ctx.lineWidth = 14;
            ctx.shadowColor = "#00ffff";
            ctx.shadowBlur = 15;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(wx, wy, game.iceWaveRadius, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.restore();
            for (let k = 0; k < 6; k++) {
                const angle = Math.random() * Math.PI * 2;
                particles.push({
                    x: game.iceWaveX + Math.cos(angle) * game.iceWaveRadius,
                    y: game.iceWaveY + Math.sin(angle) * game.iceWaveRadius,
                    vx: Math.cos(angle) * 4,
                    vy: Math.sin(angle) * 4,
                    life: 25,
                    color: "#00ffff",
                    size: 6 + Math.random() * 5,
                    type: "spark"
                });
            }
            if (game.iceWaveRadius > VIEW_W * 2.5) {
                game.iceWaveActive = false;
            }
        }
        if (currentLevel === 1 && game.arenaLocked) {
            const muroX1 = game.arenaMinX - cameraX;
            const muroX2 = game.arenaMaxX - cameraX;
            const grad1 = ctx.createLinearGradient(muroX1 - 30, 0, muroX1, 0);
            grad1.addColorStop(0, "rgba(0,255,170,0.9)");
            grad1.addColorStop(.5, "rgba(0,200,255,0.6)");
            grad1.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = grad1;
            ctx.fillRect(muroX1 - 30, 0, 30, VIEW_H);
            const grad2 = ctx.createLinearGradient(muroX2, 0, muroX2 + 30, 0);
            grad2.addColorStop(0, "rgba(0,0,0,0)");
            grad2.addColorStop(.5, "rgba(0,200,255,0.6)");
            grad2.addColorStop(1, "rgba(0,255,170,0.9)");
            ctx.fillStyle = grad2;
            ctx.fillRect(muroX2, 0, 30, VIEW_H);
            ctx.fillStyle = "#00ffaa";
            ctx.font = "11px monospace";
            ctx.textAlign = "center";
            for (let c = 0; c < 16; c++) {
                const cy = (time * 4 + c * 40) % VIEW_H;
                const char1 = String.fromCharCode(12448 + c * 7 % 60);
                const char2 = c % 2 === 0 ? "1" : "0";
                ctx.fillText(char1, muroX1 - 12, cy);
                ctx.fillText(char2, muroX2 + 12, cy);
            }
        }
        if (currentLevel === 2 && game.arenaLocked) {
            const muroX1 = game.arenaMinX - cameraX;
            const muroX2 = game.arenaMaxX - cameraX;
            const gradF1 = ctx.createLinearGradient(muroX1 - 30, 0, muroX1, 0);
            gradF1.addColorStop(0, "rgba(120,20,0,0.95)");
            gradF1.addColorStop(.5, "rgba(255,80,0,0.75)");
            gradF1.addColorStop(1, "rgba(255,120,0,0)");
            ctx.fillStyle = gradF1;
            ctx.fillRect(muroX1 - 30, 0, 30, VIEW_H);
            for (let c = 0; c < 10; c++) {
                const fy = 30 + c * 58 + Math.sin(time * .1 + c) * 10;
                const fh = 14 + Math.sin(time * .15 + c * 2) * 6;
                ctx.fillStyle = c % 2 === 0 ? "#ff6600" : "#ffaa00";
                ctx.shadowColor = "#ff4400";
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.moveTo(muroX1 - 2, fy + fh);
                ctx.quadraticCurveTo(muroX1 - 14 - fh * .5, fy + fh * .4, muroX1 - 2, fy);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            const gradF2 = ctx.createLinearGradient(muroX2, 0, muroX2 + 30, 0);
            gradF2.addColorStop(0, "rgba(255,120,0,0)");
            gradF2.addColorStop(.5, "rgba(255,80,0,0.75)");
            gradF2.addColorStop(1, "rgba(120,20,0,0.95)");
            ctx.fillStyle = gradF2;
            ctx.fillRect(muroX2, 0, 30, VIEW_H);
            for (let c = 0; c < 10; c++) {
                const fy = 50 + c * 58 + Math.sin(time * .1 + c + 4) * 10;
                const fh = 14 + Math.sin(time * .15 + c * 2 + 1) * 6;
                ctx.fillStyle = c % 2 === 0 ? "#ffaa00" : "#ff6600";
                ctx.shadowColor = "#ff4400";
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.moveTo(muroX2 + 2, fy + fh);
                ctx.quadraticCurveTo(muroX2 + 14 + fh * .5, fy + fh * .4, muroX2 + 2, fy);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            const obsGradR = ctx.createLinearGradient(muroX2, 0, muroX2 + 36, 0);
            obsGradR.addColorStop(0, "rgba(40,10,10,0.95)");
            obsGradR.addColorStop(.7, "rgba(20,5,5,0.98)");
            obsGradR.addColorStop(1, "rgba(10,2,2,0.9)");
            ctx.fillStyle = obsGradR;
            ctx.fillRect(muroX2 + 2, 0, 36, VIEW_H);
            ctx.fillStyle = "#ff5500";
            ctx.shadowColor = "#ff2200";
            ctx.shadowBlur = 5;
            for (let v = 0; v < 8; v++) {
                const vy = (time * 2 + v * 70) % VIEW_H;
                ctx.fillRect(muroX2 + 6 + v % 3 * 10, vy, 5, 18 + v % 4 * 5);
            }
            ctx.shadowBlur = 0;
            const obsGradL = ctx.createLinearGradient(muroX1 - 36, 0, muroX1, 0);
            obsGradL.addColorStop(0, "rgba(10,2,2,0.9)");
            obsGradL.addColorStop(.3, "rgba(20,5,5,0.98)");
            obsGradL.addColorStop(1, "rgba(40,10,10,0.95)");
            ctx.fillStyle = obsGradL;
            ctx.fillRect(muroX1 - 36, 0, 36, VIEW_H);
        }
        if (currentLevel === 4 && (game.lvl4State === "walk_right" || game.lvl4State === "blackout" || game.lvl4State === "dread" || game.lvl4State === "final_escape")) {
            const wallGrad = ctx.createLinearGradient(0, 0, 60, 0);
            wallGrad.addColorStop(0, "rgba(20,0,0,0.95)");
            wallGrad.addColorStop(1, "rgba(20,0,0,0)");
            ctx.fillStyle = wallGrad;
            ctx.fillRect(0, 0, 60, VIEW_H);
        }
        if (currentLevel === 4 && !game.happyMode && (game.lvl4State === "stalk_left" || game.lvl4State === "falling")) {
            ctx.fillStyle = "#000";
            ctx.fillRect(860 - cameraX, 500, 260, 80);
            ctx.fillStyle = "#1a0000";
            ctx.fillRect(860 - cameraX, 500, 14, 10);
            ctx.fillRect(1106 - cameraX, 500, 14, 10);
        }
        if (currentLevel === 4 && game.demon) game.demon.draw(ctx, cameraX);
        updateAndDrawSpawnPortal(ctx, cameraX);
        if (currentLevel === 3 && typeof window.updateAndDrawBoat === "function") {
            window.updateAndDrawBoat(ctx, cameraX);
        }
        if (game.player) game.player.draw(ctx, cameraX);
        if (currentLevel !== 6 && typeof window.drawPlayerParalyzePrism === "function" && game.player && game.player.paralyzed && game.player.paralyzeTimer > 0) {
            window.drawPlayerParalyzePrism(ctx, game.player, cameraX, time, currentLevel === 0 ? "ice" : "diamond");
        }
        if (Array.isArray(game.enemies) && game.enemies.length > 0) {
            game.enemies.forEach(e => e.draw(ctx, cameraX));
        }
        if (window.TurretSystem) {
            try {
                window.TurretSystem.draw(ctx, cameraX);
            } catch (e) {}
        }
        if (currentLevel === 2 && window.ValkyrieBoss) {
            try {
                window.ValkyrieBoss.draw(ctx);
            } catch (e) {}
        }
        updateAndDrawBlueSquare(ctx, cameraX, time);
        updateAndDrawTechBoss(ctx, cameraX, time);
        updateAndDrawYellowSquare(ctx, cameraX, time);
        updateAndDrawPinkSquare(ctx, cameraX, time);
        if (window.updateAndDrawKrakatoa) updateAndDrawKrakatoa(ctx, cameraX, time);
        drawFriendsCage(ctx, cameraX, time);
        if (typeof window.updateAndDrawLithiumCage === "function") {
            window.updateAndDrawLithiumCage(ctx, cameraX, time);
        }
        if (typeof window.updateAndDrawLithiumCompanion === "function") {
            window.updateAndDrawLithiumCompanion(ctx, cameraX, time);
        }
        if (typeof window.updateAndDrawHalloween === "function") {
            window.updateAndDrawHalloween(ctx, cameraX, time);
        }
        if (typeof window.updateAndDrawPumpkinBoss === "function") {
            window.updateAndDrawPumpkinBoss(ctx, cameraX, time);
        }
        if (typeof window.updateAndDrawRestos === "function") {
            window.updateAndDrawRestos(ctx, cameraX);
        } else if (typeof updateAndDrawRestos === "function") {
            updateAndDrawRestos(ctx, cameraX);
        }
        for (let i = projectiles.length - 1; i >= 0; i--) {
            let p = projectiles[i];
            p.x += p.vx;
            p.y += p.vy;
            const maxTrailLen = p.chargeLevel === 4 ? 10 : p.chargeLevel === 3 ? 8 : p.chargeLevel === 2 ? 6 : p.chargeLevel === 1 ? 5 : 4;
            if (!p.trail) p.trail = [];
            p.trail.push({
                x: p.x,
                y: p.y
            });
            if (p.trail.length > maxTrailLen) p.trail.shift();
            const sparkFreq = p.chargeLevel === 4 ? .45 : p.chargeLevel === 3 ? .35 : p.chargeLevel >= 1 ? .25 : .15;
            if (Math.random() < sparkFreq) {
                let sparkCol;
                if (p.chargeLevel === 4) sparkCol = [ "#ff0055", "#00ffff", "#ffffff", "#ffd700" ][Math.floor(Math.random() * 4)]; else if (p.chargeLevel === 3) sparkCol = [ "#ff3300", "#ff9900", "#ffd700", "#ffffff" ][Math.floor(Math.random() * 4)]; else if (p.chargeLevel === 2) sparkCol = [ "#00f0ff", "#3b82f6", "#a855f7", "#ffffff" ][Math.floor(Math.random() * 4)]; else if (p.chargeLevel === 1) sparkCol = [ "#00e5ff", "#38bdf8", "#7dd3fc", "#ffffff" ][Math.floor(Math.random() * 4)]; else sparkCol = p.color || "#00ffff";
                particles.push({
                    x: p.x + p.w / 2 + (Math.random() - .5) * p.w * .6,
                    y: p.y + p.h / 2 + (Math.random() - .5) * p.h * .6,
                    vx: -p.vx * .12 + (Math.random() - .5) * 1.5,
                    vy: -p.vy * .12 + (Math.random() - .5) * 1.5,
                    life: 8 + (p.chargeLevel || 0) * 2,
                    color: sparkCol,
                    glow: p.chargeLevel >= 3 ? 1 : 0,
                    size: (p.chargeLevel === 4 ? 3 : 2) + Math.random() * 1.5,
                    type: "spark"
                });
            }
            ctx.save();
            let trailColors;
            if (p.chargeLevel === 4) trailColors = [ "#ff0055", "#00ffff", "#ffffff", "#ffd700" ]; else if (p.chargeLevel === 3) trailColors = [ "#ff3300", "#ff9900", "#ffd700", "#ffffff" ]; else if (p.chargeLevel === 2) trailColors = [ "#00f0ff", "#3b82f6", "#a855f7", "#ffffff" ]; else if (p.chargeLevel === 1) trailColors = [ "#00e5ff", "#38bdf8", "#7dd3fc", "#ffffff" ]; else trailColors = [ p.color || "#00ffff", "#ffffff" ];
            for (let tIdx = 0; tIdx < p.trail.length; tIdx++) {
                const pt = p.trail[tIdx];
                const alpha = (tIdx + 1) / p.trail.length;
                const col = trailColors[tIdx % trailColors.length];
                const trailX = pt.x - cameraX + p.w / 2;
                if (trailX < -60 || trailX > VIEW_W + 60) continue;
                ctx.fillStyle = col;
                ctx.globalAlpha = alpha * .65;
                const trailSize = p.w / 2 * (.3 + .7 * (tIdx / p.trail.length));
                ctx.beginPath();
                ctx.arc(trailX, pt.y + p.h / 2, Math.max(2, trailSize), 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            const px = p.x - cameraX;
            const pcx = px + p.w / 2;
            const pcy = p.y + p.h / 2;
            const pAngle = Math.atan2(p.vy || 0, p.vx || (p.facing || 1));
            if (p.chargeLevel === 4) {
                ctx.save();
                ctx.translate(pcx, pcy);
                ctx.fillStyle = "rgba(255, 0, 85, 0.25)";
                ctx.beginPath();
                ctx.arc(0, 0, p.w * 1.25, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "rgba(0, 255, 255, 0.35)";
                ctx.beginPath();
                ctx.arc(0, 0, p.w * .9, 0, Math.PI * 2);
                ctx.fill();
                ctx.save();
                ctx.rotate(time * .22);
                ctx.strokeStyle = "#00ffff";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(0, 0, p.w * .85, p.h * .45, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
                ctx.save();
                ctx.rotate(-time * .28);
                ctx.strokeStyle = "#ffd700";
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.ellipse(0, 0, p.w * .75, p.h * .4, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
                ctx.fillStyle = "#ff0055";
                ctx.beginPath();
                ctx.arc(0, 0, p.w * .65, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(0, 0, p.w * .4, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                const flareSize = p.w * .75;
                ctx.beginPath();
                ctx.moveTo(-flareSize, 0);
                ctx.lineTo(flareSize, 0);
                ctx.moveTo(0, -flareSize * .55);
                ctx.lineTo(0, flareSize * .55);
                ctx.stroke();
                ctx.restore();
            } else if (p.chargeLevel === 3) {
                ctx.save();
                ctx.translate(pcx, pcy);
                ctx.rotate(pAngle);
                ctx.fillStyle = "rgba(255, 102, 0, 0.25)";
                ctx.beginPath();
                ctx.ellipse(0, 0, p.w * .95, p.h * .7, 0, 0, Math.PI * 2);
                ctx.fill();
                for (let sw = 1; sw <= 2; sw++) {
                    const ringBack = sw * 12 + time * 20 % 16;
                    const ringH = p.h * .55 + sw * 3;
                    ctx.strokeStyle = sw === 1 ? "#ffffff" : "#ffd700";
                    ctx.lineWidth = 1.8;
                    ctx.globalAlpha = Math.max(.2, .85 - sw * .35);
                    ctx.beginPath();
                    ctx.ellipse(-ringBack, 0, 4, ringH, 0, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.globalAlpha = 1;
                ctx.fillStyle = "#ff6600";
                ctx.beginPath();
                ctx.ellipse(0, 0, p.w * .65, p.h * .48, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffe600";
                ctx.beginPath();
                ctx.ellipse(p.w * .1, 0, p.w * .45, p.h * .32, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.ellipse(p.w * .15, 0, p.w * .25, p.h * .18, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else if (p.chargeLevel === 2) {
                ctx.save();
                ctx.translate(pcx, pcy);
                ctx.rotate(pAngle);
                const waveLen = p.w * 1.3;
                for (let strand = 0; strand < 2; strand++) {
                    const phase = strand * Math.PI + time * .35;
                    ctx.strokeStyle = strand === 0 ? "#00ffff" : "#c084fc";
                    ctx.lineWidth = 1.8;
                    ctx.beginPath();
                    for (let wx = -waveLen / 2; wx <= waveLen / 2; wx += 5) {
                        const wy = Math.sin(wx / waveLen * Math.PI * 2 + phase) * (p.h * .45);
                        if (wx === -waveLen / 2) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
                    }
                    ctx.stroke();
                }
                ctx.fillStyle = "rgba(0, 240, 255, 0.25)";
                ctx.beginPath();
                ctx.arc(0, 0, p.w * .65, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#00f0ff";
                ctx.beginPath();
                ctx.arc(0, 0, p.w * .42, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(0, 0, p.w * .22, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else if (p.chargeLevel === 1) {
                ctx.save();
                ctx.translate(pcx, pcy);
                ctx.rotate(pAngle);
                ctx.fillStyle = "rgba(0, 229, 255, 0.25)";
                ctx.beginPath();
                ctx.moveTo(p.w * .72, 0);
                ctx.lineTo(-p.w * .52, -p.h * .5);
                ctx.lineTo(-p.w * .25, 0);
                ctx.lineTo(-p.w * .52, p.h * .5);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = "#00e5ff";
                ctx.beginPath();
                ctx.moveTo(p.w * .62, 0);
                ctx.lineTo(-p.w * .42, -p.h * .38);
                ctx.lineTo(-p.w * .18, 0);
                ctx.lineTo(-p.w * .42, p.h * .38);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.moveTo(p.w * .42, 0);
                ctx.lineTo(-p.w * .12, -p.h * .18);
                ctx.lineTo(-p.w * .04, 0);
                ctx.lineTo(-p.w * .12, p.h * .18);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            } else {
                ctx.save();
                ctx.translate(pcx, pcy);
                ctx.rotate(pAngle);
                ctx.fillStyle = "rgba(0, 255, 255, 0.22)";
                ctx.beginPath();
                ctx.ellipse(0, 0, p.w / 2 + 3, p.h / 2 + 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = p.color || "#00ffff";
                ctx.beginPath();
                ctx.ellipse(0, 0, p.w / 2 + 1, p.h / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.ellipse(p.w * .08, 0, p.w / 3.5, p.h / 3.5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            ctx.restore();
            let hit = false;
            for (let e of game.enemies) {
                if (e.active && p.x < e.x + e.w && p.x + p.w > e.x && p.y < e.y + e.h && p.y + p.h > e.y) {
                    e.takeDamage(p.damage);
                    hit = true;
                    if (p.chargeLevel === 4) {
                        try {
                            createExplosion(p.x + p.w / 2, p.y + p.h / 2, "#ff0055", 40, 25, [ "#ff0055", "#00ffff", "#ffffff", "#ffd700" ]);
                            applyShake(9);
                        } catch (err) {}
                    }
                    break;
                }
            }
            if (!hit && game.platforms) {
                for (let plat of game.platforms) {
                    if (!plat.dashBlock || plat.broken) continue;
                    if (p.x + p.w > plat.x && p.x < plat.x + plat.w && p.y + p.h > plat.y && p.y < plat.y + plat.h) {
                        hit = true;
                        playSound(520, .1, "sawtooth", .15, 250);
                        if ((plat._projCooldown || 0) <= 0) {
                            plat._projCooldown = 30;
                            addFloatingText(plat.x + plat.w / 2, plat.y - 14, "🛡️ ¡INMUNE! ¡USA ENERGY DASH! ⚡", "#ff00a0", 14);
                        }
                        for (let k = 0; k < 6; k++) {
                            particles.push({
                                x: p.x,
                                y: p.y,
                                vx: (Math.random() - .5) * 5,
                                vy: (Math.random() - .5) * 5,
                                life: 12,
                                color: "#ff007f",
                                size: 3,
                                type: "spark"
                            });
                        }
                        break;
                    }
                }
            }
            if (!hit && game.yellowSquare && game.yellowSquare.state === "boss_fight" && !p.isCompanion) {
                const ys = game.yellowSquare;
                if (p.x < ys.x + ys.w && p.x + p.w > ys.x && p.y < ys.y + ys.h && p.y + p.h > ys.y) {
                    const bossDmg = [ 1, 2, 3, 4, 6 ][p.chargeLevel || 0];
                    ys.health -= __godDmg(bossDmg);
                    ys.hitFlash = 6;
                    hit = true;
                    applyShake(6);
                    playSound(450, .15, "square", .2, 200);
                    addFloatingText(ys.x + ys.w / 2, ys.y - 10, `${ys.health} / ${ys.maxHealth}`, "#ffea00", 20);
                    for (let k = 0; k < 10; k++) {
                        particles.push({
                            x: p.x,
                            y: p.y,
                            vx: (Math.random() - .5) * 8,
                            vy: (Math.random() - .5) * 8,
                            life: 18,
                            color: "#ffff00",
                            size: 4,
                            type: "spark"
                        });
                    }
                    if (ys.health <= 0) {
                        ys.state = "defeated";
                        ys._defeatTimer = 60;
                        game.arenaLocked = false;
                        stopAllSFX();
                        playBGM("bgm_world3_volcano");
                        applyShake(30);
                        game.flash = 40;
                        game.glitchT = 60;
                        playSound(80, .8, "sawtooth", .5, 30);
                        createExplosion(ys.x + ys.w / 2, ys.y + ys.h / 2, "#ff4400", 50, 40);
                        addFloatingText(game.player.x, game.player.y - 60, __("flt_jefe_derrotado"), "#00ff00", 30);
                        for (let k = 0; k < 60; k++) {
                            particles.push({
                                x: ys.x + ys.w / 2,
                                y: ys.y + ys.h / 2,
                                vx: (Math.random() - .5) * 16,
                                vy: (Math.random() - .5) * 16 - 3,
                                life: 40 + Math.random() * 30,
                                color: [ "#ffff00", "#ffaa00", "#ffffff", "#ff3300" ][Math.floor(Math.random() * 4)],
                                size: 6 + Math.random() * 8,
                                type: "spark"
                            });
                        }
                    }
                }
            }
            if (!hit && game.techBoss && game.techBoss.state === "fighting" && game.techBoss.vulnerable && game.techBoss.turnPhase === "player_turn" && !p.isCompanion) {
                const tb = game.techBoss;
                if (p.x < tb.x + tb.w && p.x + p.w > tb.x && p.y < tb.y + tb.h && p.y + p.h > tb.y) {
                    hit = true;
                    if (tb.dodgeMode) {
                        if (!tb.hasTakenDodgeDmg) {
                            const actualDmg = Math.min(__godDmg(5), tb.health);
                            tb.health -= actualDmg;
                            tb.turnDamageTaken = (tb.turnDamageTaken || 0) + actualDmg;
                            tb.hasTakenDodgeDmg = true;
                            tb.hitFlash = 8;
                            addFloatingText(tb.x + tb.w / 2, tb.y - 10, actualDmg + " " + __("ui_dmg"), "#00ff00", 18);
                            playSound(500, .1, "sawtooth", .2, 100);
                        } else {
                            addFloatingText(tb.x + tb.w / 2 + (Math.random() - .5) * 30, tb.y - 20, __("flt_miss"), "#ff0055", 22);
                            playSound(200, .08, "sine", .1, 50);
                            tb.missCount = (tb.missCount || 0) + 1;
                            if (tb.missCount >= 15) {
                                tb.missCount = 0;
                                tb.dodgeMode = false;
                                tb.hasTakenDodgeDmg = false;
                                tb.vulnerable = false;
                                game.player.frozen = true;
                                showAnimatedDialogue(__("ui_speaker_system"), "💻", __("dlg_se_paso_mano"), () => {
                                    showAnimatedDialogue(__("ui_speaker_system"), "💻", __("dlg_así_imposible"), () => {
                                        tb.vibeTerminal = true;
                                        tb.vibeStep = 4;
                                        tb.vibeTimer = 0;
                                        playSound(800, .2, "sine", .25);
                                        setTimeout(() => {
                                            tb.vibeTerminal = false;
                                            tb.vulnerable = true;
                                            tb.hasTakenDodgeDmg = true;
                                            game.player.frozen = false;
                                            playSound(400, .4, "sawtooth", .3, 100);
                                            applyShake(10);
                                            addFloatingText(tb.x + tb.w / 2, tb.y - 30, __("flt_rematalo"), "#ffff00", 26);
                                        }, 2500);
                                    }, 3e3);
                                }, 3e3);
                            }
                        }
                    } else {
                        const bossDmg = [ 1, 2, 3, 5, 8 ][p.chargeLevel || 0];
                        const actualDmg = Math.min(__godDmg(bossDmg), tb.health);
                        tb.health -= actualDmg;
                        tb.turnDamageTaken = (tb.turnDamageTaken || 0) + actualDmg;
                        tb.hitFlash = 8;
                        addFloatingText(tb.x + tb.w / 2, tb.y - 10, actualDmg + " " + __("ui_dmg"), "#00ff00", 18);
                        playSound(500, .1, "sawtooth", .2, 100);
                    }
                    applyShake(5);
                    for (let k = 0; k < 10; k++) {
                        particles.push({
                            x: p.x,
                            y: p.y,
                            vx: (Math.random() - .5) * 10,
                            vy: (Math.random() - .5) * 10,
                            life: 20,
                            color: tb.dodgeMode ? "#ff0055" : "#00ffaa",
                            size: 5,
                            type: "spark"
                        });
                    }
                }
            }
            if (!hit && game.blueSquare && game.blueSquare.state === "boss_fight" && !p.isCompanion) {
                const bs = game.blueSquare;
                if (p.x < bs.x + bs.w && p.x + p.w > bs.x && p.y < bs.y + bs.h && p.y + p.h > bs.y) {
                    const bossDmg2 = [ 1, 2, 3, 4, 6 ][p.chargeLevel || 0];
                    bs.health -= __godDmg(bossDmg2);
                    bs.hitFlash = 6;
                    hit = true;
                    applyShake(5);
                    playSound(500, .15, "square", .2, 300);
                    addFloatingText(bs.x + bs.w / 2, bs.y - 10, `${bs.health} / ${bs.maxHealth}`, "#00aaff", 20);
                    for (let k = 0; k < 10; k++) {
                        particles.push({
                            x: p.x,
                            y: p.y,
                            vx: (Math.random() - .5) * 8,
                            vy: (Math.random() - .5) * 8,
                            life: 18,
                            color: "#00aaff",
                            size: 4,
                            type: "spark"
                        });
                    }
                    if (bs.health <= 0) {
                        bs.state = "defeated";
                        applyShake(30);
                        game.flash = 40;
                        game.glitchT = 60;
                        playSound(80, .8, "sawtooth", .5, 30);
                        addFloatingText(game.player.x, game.player.y - 60, __("flt_vencido"), "#00ffff", 30);
                        for (let k = 0; k < 60; k++) {
                            particles.push({
                                x: bs.x + bs.w / 2,
                                y: bs.y + bs.h / 2,
                                vx: (Math.random() - .5) * 16,
                                vy: (Math.random() - .5) * 16 - 3,
                                life: 40 + Math.random() * 30,
                                color: [ "#00ffff", "#0088ff", "#ffffff", "#00ffaa" ][Math.floor(Math.random() * 4)],
                                size: 6 + Math.random() * 8,
                                type: "spark"
                            });
                        }
                    }
                }
            }
            if (!hit && game.pinkSquare && game.pinkSquare.state === "hostile" && !p.isCompanion) {
                const psE = game.pinkSquare;
                if (p.x < psE.x + psE.w && p.x + p.w > psE.x && p.y < psE.y + psE.h && p.y + p.h > psE.y) {
                    const pinkDmg = p.damage || 10;
                    psE.health -= __godDmg(pinkDmg);
                    hit = true;
                    applyShake(4);
                    playSound(600, .12, "square", .2, 250);
                    addFloatingText(psE.x + 15, psE.y - 12, `${Math.max(0, psE.health)} / ${psE.maxHealth}`, "#ff69b4", 18);
                    for (let k = 0; k < 8; k++) {
                        particles.push({
                            x: p.x,
                            y: p.y,
                            vx: (Math.random() - .5) * 8,
                            vy: (Math.random() - .5) * 8,
                            life: 18,
                            color: "#ff69b4",
                            size: 4,
                            type: "spark"
                        });
                    }
                    if (psE.health <= 0) {
                        psE.state = "dead";
                        applyShake(15);
                        game.flash = 25;
                        createExplosion(psE.x + 15, psE.y + 20, "#ff69b4", 35);
                        addFloatingText(psE.x + 15, psE.y - 40, __("flt_cañon_destruido"), "#ff1493", 24);
                        playSound(120, .5, "sawtooth", .4, 40);
                        score += 500;
                        updateScore(score);
                    }
                }
            }
            if (!hit && game.krakatoa && game.krakatoa.isHittable(p)) {
                hit = true;
                const bossDmg = [ 4, 8, 14, 22, 34 ][p.chargeLevel || 0];
                game.krakatoa.takeDamage(bossDmg, p.chargeLevel || 0);
            }
            if (!hit && game.pumpkinBoss && game.pumpkinBoss.isHittable(p)) {
                hit = true;
                if (game.pumpkinBoss.isVulnerable) {
                    const bossDmg = [ 6, 12, 20, 32, 48 ][p.chargeLevel || 0];
                    game.pumpkinBoss.takeDamage(bossDmg, p.chargeLevel || 0);
                } else {
                    game.pumpkinBoss.onImmuneHit(p);
                }
            }
            if (hit || p.x < cameraX || p.x > cameraX + VIEW_W) projectiles.splice(i, 1);
        }
        for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
            let p = enemyProjectiles[i];
            const camNear = p.x > cameraX - 200 && p.x < cameraX + VIEW_W + 200 && p.y > -200 && p.y < VIEW_H + 200;
            if (p.isArc || p.gravity) {
                p.vy = (p.vy || 0) + (p.gravity || .28);
            }
            if (p.life !== undefined) {
                p.life--;
                if (p.life <= 0) {
                    enemyProjectiles.splice(i, 1);
                    continue;
                }
            }
            if (p.isElectric) {
                if (p.homing && p.homingTimer > 0 && game.player && !game.player.frozen) {
                    p.homingTimer--;
                    const targetX = game.player.x + game.player.w / 2;
                    const targetY = game.player.y + game.player.h / 2;
                    const curX = p.x + (p.w ? p.w / 2 : 8);
                    const curY = p.y + (p.h ? p.h / 2 : 8);
                    const targetAngle = Math.atan2(targetY - curY, targetX - curX);
                    const currentAngle = Math.atan2(p.vy, p.vx);
                    let diff = targetAngle - currentAngle;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    const turn = Math.sign(diff) * Math.min(Math.abs(diff), p.turnSpeed || .048);
                    const newAngle = currentAngle + turn;
                    const spd = p.speed || Math.hypot(p.vx, p.vy) || 4.6;
                    p.vx = Math.cos(newAngle) * spd;
                    p.vy = Math.sin(newAngle) * spd;
                    if (p.homingTimer <= 0) {
                        p.homing = false;
                        for (let k = 0; k < 6; k++) {
                            particles.push({
                                x: curX,
                                y: curY,
                                vx: (Math.random() - .5) * 5,
                                vy: (Math.random() - .5) * 5,
                                life: 12,
                                color: "#00ffff",
                                size: 3,
                                type: "spark"
                            });
                        }
                    }
                }
            }
            if (!p.isRollingSnowball) {
                p.x += p.vx;
                p.y += p.vy;
            } else {
                p.vy = (p.vy || 0) + .55;
                p.y += p.vy;
                p.x += p.vx;
                const pr = p.radius || 28;
                p.rot = (p.rot || 0) + p.vx / pr;
                if (game.platforms) {
                    for (let plat of game.platforms) {
                        if (plat.broken) continue;
                        if (p.x + pr * 2 > plat.x && p.x < plat.x + plat.w && p.y + pr * 2 >= plat.y && p.y + pr * 2 <= plat.y + plat.h + Math.abs(p.vy) + 6) {
                            p.y = plat.y - pr * 2;
                            p.vy = 0;
                            break;
                        }
                    }
                }
                if (camNear && Math.random() < .45) {
                    particles.push({
                        x: p.x + pr + (Math.random() - .5) * 12,
                        y: p.y + pr * 2,
                        vx: -p.vx * .15 + (Math.random() - .5) * 2,
                        vy: -Math.random() * 2.5 - .5,
                        life: 12,
                        color: Math.random() < .5 ? "#ffffff" : "#bae6fd",
                        size: 3 + Math.random() * 3,
                        type: "spark"
                    });
                }
            }
            if (p.isCluster) {
                p.splitTimer = (p.splitTimer || 38) - 1;
                if (p.splitTimer <= 0 && !p.hasSplit) {
                    p.hasSplit = true;
                    const baseAngle = Math.atan2(p.vy, p.vx);
                    const spreadAngles = [ -.32, 0, .32 ];
                    const childSpeed = 4.5;
                    spreadAngles.forEach(off => {
                        const ang = baseAngle + off;
                        enemyProjectiles.push({
                            x: p.x,
                            y: p.y,
                            w: 12,
                            h: 12,
                            vx: Math.cos(ang) * childSpeed,
                            vy: Math.sin(ang) * childSpeed,
                            color: "#ff5500",
                            damage: 10,
                            isFireball: true,
                            isClusterChild: true,
                            trail: []
                        });
                    });
                    if (camNear) playSound(300, .16, "sawtooth", .18, 140);
                    for (let k = 0; k < 12; k++) {
                        particles.push({
                            x: p.x + 9,
                            y: p.y + 9,
                            vx: (Math.random() - .5) * 6,
                            vy: (Math.random() - .5) * 6,
                            life: 18,
                            color: Math.random() < .5 ? "#ff9900" : "#ff3300",
                            size: 4,
                            type: "spark"
                        });
                    }
                    enemyProjectiles.splice(i, 1);
                    continue;
                }
            }
            if (p.isExplosiveFireball) {
                p.life = (p.life || 140) - 1;
                let detonated = false;
                const pr = p.radius || 18;
                if (game.platforms) {
                    for (let plat of game.platforms) {
                        if (plat.broken) continue;
                        if (p.x + (p.w || 36) > plat.x && p.x < plat.x + plat.w && p.y + (p.h || 36) > plat.y && p.y < plat.y + plat.h) {
                            detonated = true;
                            break;
                        }
                    }
                }
                const pDist = Math.hypot(game.player.x + game.player.w / 2 - (p.x + pr), game.player.y + game.player.h / 2 - (p.y + pr));
                if (pDist < pr + game.player.w / 2) detonated = true;
                if (p.life <= 0) detonated = true;
                if (detonated) {
                    if (camNear) {
                        createExplosion(p.x + pr, p.y + pr, "#ff4400", 50, 26, [ "#ffffff", "#ffff00", "#ff5500", "#660000" ]);
                        applyShake(8);
                        playSound(110, .35, "sawtooth", .28, 40);
                    }
                    if (gameState === "playing" && !game.player.frozen && pDist < 75) {
                        const energyDash = game.player.dashMax && game.player.dashTimer > 0;
                        if (!energyDash) {
                            game.player.takeDamage(p.damage || 28);
                        }
                    }
                    enemyProjectiles.splice(i, 1);
                    continue;
                }
            }
            if (p.isSpike) {
                p.spikeTimer = (p.spikeTimer || 60) - 1;
                ctx.save();
                const sx = p.x - cameraX;
                ctx.shadowColor = "#00ffff";
                ctx.shadowBlur = 18;
                ctx.fillStyle = p.color || "#00ddff";
                ctx.beginPath();
                ctx.moveTo(sx - p.w / 2, p.y + p.h);
                ctx.lineTo(sx, p.y);
                ctx.lineTo(sx + p.w / 2, p.y + p.h);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2.5;
                ctx.stroke();
                ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
                ctx.beginPath();
                ctx.moveTo(sx - p.w * .22, p.y + p.h);
                ctx.lineTo(sx, p.y + p.h * .12);
                ctx.lineTo(sx + p.w * .22, p.y + p.h);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(sx - 3.5, p.y + 8, 7, p.h * .45);
                ctx.restore();
                if (gameState === "playing" && !game.player.frozen) {
                    const spx = p.x - p.w / 2;
                    if (spx < game.player.x + game.player.w && spx + p.w > game.player.x && p.y < game.player.y + game.player.h && p.y + p.h > game.player.y) {
                        const energyDash = game.player.dashMax && game.player.dashTimer > 0;
                        if (energyDash) {
                            try {
                                createExplosion(p.x, p.y + p.h / 2, "#ff00e0", 16, 10, [ "#ff00e0", "#00ffff", "#ffffff" ]);
                                playSound(400, .1, "square", .15, 800);
                            } catch (e) {}
                            enemyProjectiles.splice(i, 1);
                            continue;
                        }
                        game.player.takeDamage(p.damage || 32);
                    }
                }
                if (p.spikeTimer <= 0) {
                    for (let k = 0; k < 12; k++) particles.push({
                        x: p.x + (Math.random() - .5) * p.w,
                        y: p.y + p.h / 2,
                        vx: (Math.random() - .5) * 4,
                        vy: -Math.random() * 4,
                        life: 25,
                        color: "#00ccff",
                        size: 5 + Math.random() * 4,
                        type: "spark"
                    });
                    enemyProjectiles.splice(i, 1);
                }
                if (p.x < cameraX - 200 || p.x > cameraX + VIEW_W + 200) enemyProjectiles.splice(i, 1);
                continue;
            }
            if (p.isSnowball) {
                p.rot = (p.rot || 0) + (p.rotSpeed || .1);
                if (game.platforms) {
                    let hitPlat = false;
                    const pr = p.radius || (p.w ? p.w / 2 : 11);
                    for (let plat of game.platforms) {
                        if (plat.broken) continue;
                        if (plat.y + plat.h < 480) continue;
                        if (p.x + pr > plat.x && p.x - pr < plat.x + plat.w && p.y + pr > plat.y && p.y - pr < plat.y + plat.h) {
                            hitPlat = true;
                            break;
                        }
                    }
                    if (hitPlat) {
                        if (camNear) {
                            createExplosion(p.x + pr, p.y + pr, "#ffffff", p.isGiantSnowball ? 28 : 16, 12, [ "#ffffff", "#e0f7ff", "#80d8ff" ]);
                            playSound(210, .14, "triangle", .16, 85);
                        }
                        enemyProjectiles.splice(i, 1);
                        continue;
                    }
                }
            }
            if (p.isAppleArc) {
                p.rot = (p.rot || 0) + (p.rotSpeed || .15);
                if (game.platforms) {
                    let hitPlat = false;
                    const pr = p.radius || 10;
                    for (let plat of game.platforms) {
                        if (plat.broken) continue;
                        if (p.x + pr > plat.x && p.x - pr < plat.x + plat.w && p.y + pr > plat.y && p.y - pr < plat.y + plat.h) {
                            hitPlat = true;
                            break;
                        }
                    }
                    if (hitPlat) {
                        if (camNear) {
                            createExplosion(p.x + pr, p.y + pr, "#ef4444", 16, 12, [ "#ef4444", "#f87171", "#fbbf24", "#22c55e" ]);
                            playSound(380, .12, "triangle", .15, 200);
                        }
                        enemyProjectiles.splice(i, 1);
                        continue;
                    }
                }
            }
            ctx.save();
            const sx = p.x - cameraX;
            if (camNear && Math.random() < .25) {
                if (p.isSnowball) {
                    particles.push({
                        x: p.x + (p.radius || 10) + (Math.random() - .5) * 6,
                        y: p.y + (p.radius || 10) + (Math.random() - .5) * 6,
                        vx: -p.vx * .15 + (Math.random() - .5) * 1.5,
                        vy: -p.vy * .15 + (Math.random() - .5) * 1.5,
                        life: 14,
                        color: Math.random() < .6 ? "#ffffff" : "#b8e8ff",
                        size: p.isGiantSnowball ? 3 + Math.random() * 3 : 2 + Math.random() * 2,
                        type: "spark"
                    });
                } else if (p.isSlowBubble || p.isBubbleSpray) {
                    particles.push({
                        x: p.x + (p.radius || 9) + (Math.random() - .5) * 4,
                        y: p.y + (p.radius || 9) + (Math.random() - .5) * 4,
                        vx: (Math.random() - .5) * .8,
                        vy: -Math.random() * .8,
                        life: 10,
                        color: "#38bdf8",
                        size: 2,
                        type: "spark"
                    });
                } else if (p.isFrostBreath) {
                    particles.push({
                        x: p.x + 10 + (Math.random() - .5) * 8,
                        y: p.y + 10 + (Math.random() - .5) * 8,
                        vx: -p.vx * .1 + (Math.random() - .5) * 1.2,
                        vy: (Math.random() - .5) * 1.2,
                        life: 12,
                        color: "#a5f3fc",
                        size: 2.5,
                        type: "spark"
                    });
                } else if (p.isElectric) {
                    particles.push({
                        x: p.x + (p.w ? p.w / 2 : 8) + (Math.random() - .5) * 4,
                        y: p.y + (p.h ? p.h / 2 : 8) + (Math.random() - .5) * 4,
                        vx: -p.vx * .15 + (Math.random() - .5) * 1.5,
                        vy: -p.vy * .15 + (Math.random() - .5) * 1.5,
                        life: 10,
                        color: Math.random() < .5 ? "#00ffff" : "#ffffff",
                        size: 2.5,
                        type: "spark"
                    });
                } else if (p.isFlameSpray || p.isExplosiveFireball || p.isFireball) {
                    particles.push({
                        x: p.x + (p.w ? p.w / 2 : 8),
                        y: p.y + (p.h ? p.h / 2 : 8),
                        vx: -p.vx * .2 + (Math.random() - .5) * 2,
                        vy: -p.vy * .2 + (Math.random() - .5) * 2,
                        life: 12,
                        color: Math.random() < .5 ? "#ff4400" : "#ffaa00",
                        size: 3.5,
                        type: "spark"
                    });
                } else {
                    particles.push({
                        x: p.x + (p.w ? p.w / 2 : 6),
                        y: p.y + (p.h ? p.h / 2 : 6),
                        vx: -p.vx * .2,
                        vy: -p.vy * .2,
                        life: 10,
                        color: p.color || "#ff4400",
                        size: 3,
                        type: "spark"
                    });
                }
            }
            if (p.isFlameSpray) {
                const pr = p.radius || 12;
                const pcx = sx + pr, pcy = p.y + pr;
                const alpha = p.life !== undefined && p.maxLife ? Math.max(.1, p.life / p.maxLife) : .85;
                ctx.globalAlpha = alpha;
                ctx.shadowBlur = 14;
                ctx.shadowColor = "#ff3b00";
                const flGrad = ctx.createRadialGradient(pcx, pcy, 1, pcx, pcy, pr);
                flGrad.addColorStop(0, "#ffffff");
                flGrad.addColorStop(.35, "#facc15");
                flGrad.addColorStop(.7, "#ea580c");
                flGrad.addColorStop(.95, "#b91c1c");
                flGrad.addColorStop(1, "rgba(185, 28, 28, 0)");
                ctx.fillStyle = flGrad;
                ctx.beginPath();
                ctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(pcx - 1, pcy - 1, pr * .35, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
            } else if (p.isRollingSnowball) {
                const pr = p.radius || 28;
                const pcx = sx + pr, pcy = p.y + pr;
                ctx.save();
                ctx.translate(pcx, pcy);
                ctx.rotate(p.rot || 0);
                ctx.fillStyle = "rgba(0, 30, 70, 0.25)";
                ctx.beginPath();
                ctx.ellipse(0, pr - 2, pr * .85, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 10;
                ctx.shadowColor = "#38bdf8";
                const sGrad = ctx.createRadialGradient(-pr * .3, -pr * .3, 2, 0, 0, pr);
                sGrad.addColorStop(0, "#ffffff");
                sGrad.addColorStop(.6, "#e0f2fe");
                sGrad.addColorStop(.9, "#93c5fd");
                sGrad.addColorStop(1, "#60a5fa");
                ctx.fillStyle = sGrad;
                ctx.beginPath();
                ctx.arc(0, 0, pr, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                if (p.isHead) {
                    ctx.fillStyle = "#0f172a";
                    ctx.beginPath();
                    ctx.arc(-pr * .25, -pr * .15, 3, 0, Math.PI * 2);
                    ctx.arc(pr * .25, -pr * .15, 3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = "#0f172a";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(-pr * .38, -pr * .35);
                    ctx.lineTo(-pr * .12, -pr * .22);
                    ctx.moveTo(pr * .38, -pr * .35);
                    ctx.lineTo(pr * .12, -pr * .22);
                    ctx.stroke();
                    ctx.fillStyle = "#f97316";
                    ctx.beginPath();
                    ctx.moveTo(0, -pr * .05);
                    ctx.lineTo(pr * .7, 0);
                    ctx.lineTo(0, pr * .1);
                    ctx.closePath();
                    ctx.fill();
                } else {
                    ctx.fillStyle = "#1e293b";
                    ctx.beginPath();
                    ctx.arc(pr * .3, 0, 3.5, 0, Math.PI * 2);
                    ctx.arc(-pr * .3, 0, 3.5, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            } else if (p.isLongThorn) {
                const pl = p.w || 36, ph = p.h || 10;
                const pcx = sx + pl / 2, pcy = p.y + ph / 2;
                const angle = p.angle !== undefined ? p.angle : Math.atan2(p.vy || 0, p.vx || 1);
                ctx.save();
                ctx.translate(pcx, pcy);
                ctx.rotate(angle);
                ctx.shadowBlur = 8;
                ctx.shadowColor = "#84cc16";
                ctx.fillStyle = "#4d7c0f";
                ctx.beginPath();
                ctx.moveTo(pl * .5, 0);
                ctx.lineTo(-pl * .5, -ph * .45);
                ctx.lineTo(-pl * .3, 0);
                ctx.lineTo(-pl * .5, ph * .45);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = "#facc15";
                ctx.beginPath();
                ctx.moveTo(pl * .45, 0);
                ctx.lineTo(-pl * .25, -ph * .2);
                ctx.lineTo(-pl * .25, ph * .2);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.restore();
            } else if (p.isGiant) {
                const pr = p.radius || 24;
                const isIce = p.isBigIceBall || p.color === "#ffffff" || p.color === "#00ddff" || p.color === "#00ffff";
                const gradKey = (p.color || "#ff6600") + "|" + pr + (isIce ? "|ice" : "");
                if (!p._gradCache || p._gradKey !== gradKey) {
                    const gx = ctx.createRadialGradient(0, 0, 2, 0, 0, pr);
                    gx.addColorStop(0, "#ffffff");
                    gx.addColorStop(.4, p.color || "#ffaa00");
                    gx.addColorStop(1, isIce ? "#0a4d73" : "#660000");
                    p._gradCache = gx;
                    p._gradKey = gradKey;
                }
                ctx.save();
                ctx.translate(sx, p.y);
                ctx.shadowBlur = 12;
                ctx.shadowColor = p.color || "#ff6600";
                ctx.fillStyle = p._gradCache;
                ctx.beginPath();
                ctx.arc(0, 0, pr, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = isIce ? "#b3ecff" : "#ffff00";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, pr * (1 + .1 * Math.sin(time * .2)), 0, Math.PI * 2);
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.restore();
            } else if (p.isSlowBubble || p.isBubbleSpray) {
                const pr = p.radius || 10;
                const pcx = sx + pr, pcy = p.y + pr;
                const alpha = p.life !== undefined && p.maxLife ? Math.max(.1, p.life / p.maxLife) : .85;
                ctx.globalAlpha = alpha;
                ctx.shadowBlur = 8;
                ctx.shadowColor = "#38bdf8";
                const bGrad = ctx.createRadialGradient(pcx - pr * .35, pcy - pr * .35, 1, pcx, pcy, pr);
                bGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
                bGrad.addColorStop(.4, "rgba(125, 211, 252, 0.6)");
                bGrad.addColorStop(.8, "rgba(56, 189, 248, 0.45)");
                bGrad.addColorStop(1, "rgba(14, 165, 233, 0.8)");
                ctx.fillStyle = bGrad;
                ctx.beginPath();
                ctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(pcx - pr * .38, pcy - pr * .38, pr * .3, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
            } else if (p.isAppleArc) {
                const pr = p.radius || 10;
                const pcx = sx + pr, pcy = p.y + pr;
                ctx.save();
                ctx.translate(pcx, pcy);
                ctx.rotate(p.rot || 0);
                ctx.fillStyle = "rgba(0,0,0,0.2)";
                ctx.beginPath();
                ctx.ellipse(0, pr - 1, pr * .8, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                const aGrad = ctx.createRadialGradient(-pr * .3, -pr * .3, 1, 0, 0, pr);
                aGrad.addColorStop(0, "#f87171");
                aGrad.addColorStop(.6, "#ef4444");
                aGrad.addColorStop(1, "#991b1b");
                ctx.fillStyle = aGrad;
                ctx.beginPath();
                ctx.arc(-pr * .28, 0, pr * .72, 0, Math.PI * 2);
                ctx.arc(pr * .28, 0, pr * .72, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                ctx.beginPath();
                ctx.arc(-pr * .35, -pr * .35, pr * .25, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#5a3d28";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, -pr * .6);
                ctx.quadraticCurveTo(2, -pr * 1.1, 4, -pr * 1.2);
                ctx.stroke();
                ctx.fillStyle = "#22c55e";
                ctx.beginPath();
                ctx.ellipse(3, -pr * .9, 4, 2, .4, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else if (p.isFrostBreath) {
                const pr = p.radius || 11;
                const pcx = sx + pr, pcy = p.y + pr;
                const alpha = p.life !== undefined && p.maxLife ? Math.max(.1, p.life / p.maxLife) : .8;
                ctx.globalAlpha = alpha;
                ctx.shadowBlur = 10;
                ctx.shadowColor = "#38bdf8";
                const fGrad = ctx.createRadialGradient(pcx, pcy, 1, pcx, pcy, pr);
                fGrad.addColorStop(0, "#ffffff");
                fGrad.addColorStop(.5, "#bae6fd");
                fGrad.addColorStop(.85, "#38bdf8");
                fGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
                ctx.fillStyle = fGrad;
                ctx.beginPath();
                ctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(pcx - 4, pcy);
                ctx.lineTo(pcx + 4, pcy);
                ctx.moveTo(pcx, pcy - 4);
                ctx.lineTo(pcx, pcy + 4);
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
            } else if (p.isElectric) {
                const pr = p.w ? p.w / 2 : 8;
                const pcx = sx + pr, pcy = p.y + pr;
                ctx.shadowBlur = 14;
                ctx.shadowColor = "#00f0ff";
                const pulse = Math.sin(time * .3) * 2;
                const grad = ctx.createRadialGradient(pcx, pcy, 2, pcx, pcy, pr + 4 + pulse);
                grad.addColorStop(0, "#ffffff");
                grad.addColorStop(.4, "#00ffff");
                grad.addColorStop(.75, "#7928ca");
                grad.addColorStop(1, "rgba(0, 255, 255, 0)");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(pcx, pcy, pr + 4 + pulse, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(pcx, pcy, pr * .45, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1.6;
                for (let a = 0; a < 3; a++) {
                    const aAngle = time * .35 + a * (Math.PI * 2 / 3);
                    const ex = pcx + Math.cos(aAngle) * (pr + 3);
                    const ey = pcy + Math.sin(aAngle) * (pr + 3);
                    const mx = pcx + Math.cos(aAngle + .3) * (pr * .7);
                    const my = pcy + Math.sin(aAngle + .3) * (pr * .7);
                    ctx.beginPath();
                    ctx.moveTo(pcx, pcy);
                    ctx.lineTo(mx, my);
                    ctx.lineTo(ex, ey);
                    ctx.stroke();
                }
                ctx.shadowBlur = 0;
            } else if (p.isExplosiveFireball) {
                const pr = p.radius || 18;
                const pcx = sx + pr, pcy = p.y + pr;
                ctx.shadowBlur = 16;
                ctx.shadowColor = "#ff3300";
                const grad = ctx.createRadialGradient(pcx, pcy, 2, pcx, pcy, pr);
                grad.addColorStop(0, "#ffffff");
                grad.addColorStop(.3, "#ffff00");
                grad.addColorStop(.6, "#ff4400");
                grad.addColorStop(1, "#4a0000");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#ffff66";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(pcx, pcy, pr * (1 + .12 * Math.sin(time * .25)), 0, Math.PI * 2);
                ctx.stroke();
                ctx.shadowBlur = 0;
            } else if (p.isCluster) {
                const pr = p.w ? p.w / 2 : 9;
                const pcx = sx + pr, pcy = p.y + pr;
                ctx.shadowBlur = 12;
                ctx.shadowColor = "#ff6600";
                const grad = ctx.createRadialGradient(pcx, pcy, 2, pcx, pcy, pr);
                grad.addColorStop(0, "#ffffff");
                grad.addColorStop(.35, "#ffaa00");
                grad.addColorStop(.7, "#ff3300");
                grad.addColorStop(1, "#550000");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
                ctx.fill();
                if (p.splitTimer < 14 && Math.floor(time * .4) % 2 === 0) {
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(pcx, pcy, pr * .7, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.shadowBlur = 0;
            } else if (p.isFireball) {
                const pr = p.w ? p.w / 2 : 9;
                ctx.shadowBlur = 9;
                ctx.shadowColor = "#ff6600";
                const grad = ctx.createRadialGradient(sx + pr, p.y + pr, 2, sx + pr, p.y + pr, pr);
                grad.addColorStop(0, "#ffff00");
                grad.addColorStop(.5, "#ff4400");
                grad.addColorStop(1, "#4a0000");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(sx + pr, p.y + pr, pr, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(sx + pr - 2, p.y + pr - 2, pr * .35, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else if (p.isSnowball) {
                const pr = p.radius || (p.w ? p.w / 2 : 11);
                const pcx = sx + pr, pcy = p.y + pr;
                ctx.shadowBlur = p.isGiantSnowball ? 12 : 6;
                ctx.shadowColor = "#80d8ff";
                const grad = ctx.createRadialGradient(pcx - pr * .35, pcy - pr * .35, 1, pcx, pcy, pr);
                grad.addColorStop(0, "#ffffff");
                grad.addColorStop(.55, "#e8f7ff");
                grad.addColorStop(.85, "#b0daf5");
                grad.addColorStop(1, "#78aed4");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
                ctx.fill();
                ctx.save();
                ctx.translate(pcx, pcy);
                ctx.rotate(p.rot || 0);
                ctx.fillStyle = "#ffffff";
                const dotCount = p.isGiantSnowball ? 6 : 3;
                for (let d = 0; d < dotCount; d++) {
                    const dAng = d * (Math.PI * 2 / dotCount);
                    const dDist = pr * .5;
                    ctx.beginPath();
                    ctx.arc(Math.cos(dAng) * dDist, Math.sin(dAng) * dDist, p.isGiantSnowball ? 2.5 : 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }
                if (p.isGiantSnowball) {
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.arc(0, 0, pr * .9, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.restore();
                ctx.shadowBlur = 0;
            } else if (p.isWaterBullet) {
                const pr = p.w ? p.w / 2 : 7;
                const pcx = sx + pr, pcy = p.y + pr;
                ctx.shadowBlur = 10;
                ctx.shadowColor = "#06b6d4";
                const wGrad = ctx.createRadialGradient(pcx - 1, pcy - 1, 1, pcx, pcy, pr);
                wGrad.addColorStop(0, "#ffffff");
                wGrad.addColorStop(.4, "#38bdf8");
                wGrad.addColorStop(.85, "#0284c7");
                wGrad.addColorStop(1, "rgba(6, 182, 212, 0.4)");
                ctx.fillStyle = wGrad;
                ctx.beginPath();
                ctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(pcx - 2, pcy - 2, 2, 0, Math.PI * 2);
                ctx.fill();
                if (Math.random() < .35) {
                    particles.push({
                        x: p.x + pr,
                        y: p.y + pr,
                        vx: -p.vx * .2 + (Math.random() - .5) * 1,
                        vy: -p.vy * .2 + (Math.random() - .5) * 1,
                        life: 10,
                        color: "#38bdf8",
                        size: 2,
                        type: "spark"
                    });
                }
                ctx.shadowBlur = 0;
            } else if (p.isInkBullet) {
                const pr = p.w ? p.w / 2 : 8;
                const pcx = sx + pr, pcy = p.y + pr;
                ctx.shadowBlur = p.isGiantInk ? 16 : 10;
                ctx.shadowColor = "#7c3aed";
                const iGrad = ctx.createRadialGradient(pcx - 1, pcy - 1, 1, pcx, pcy, pr);
                iGrad.addColorStop(0, "#2e1065");
                iGrad.addColorStop(.5, "#0f051d");
                iGrad.addColorStop(1, "#000000");
                ctx.fillStyle = iGrad;
                ctx.beginPath();
                ctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#a855f7";
                ctx.beginPath();
                ctx.arc(pcx - 2, pcy - 2, pr * .28, 0, Math.PI * 2);
                ctx.fill();
                if (Math.random() < .45) {
                    particles.push({
                        x: p.x + pr,
                        y: p.y + pr,
                        vx: -p.vx * .15 + (Math.random() - .5) * 1.5,
                        vy: -p.vy * .15 + (Math.random() - .5) * 1.5,
                        life: 14,
                        color: "#090514",
                        size: p.isGiantInk ? 4 : 2.5,
                        type: "spark"
                    });
                }
                ctx.shadowBlur = 0;
            } else if (p.isKrakenBigBall) {
                const pr = p.w ? p.w / 2 : 30;
                const pcx = sx + pr, pcy = p.y + pr;
                ctx.shadowBlur = 20;
                ctx.shadowColor = "#38bdf8";
                const bGrad = ctx.createRadialGradient(pcx - 2, pcy - 3, 2, pcx, pcy, pr);
                bGrad.addColorStop(0, "#ffffff");
                bGrad.addColorStop(.35, "#7dd3fc");
                bGrad.addColorStop(.7, p.color || "#0284c7");
                bGrad.addColorStop(1, "rgba(2, 18, 40, 0.85)");
                ctx.fillStyle = bGrad;
                ctx.beginPath();
                ctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.save();
                ctx.translate(pcx, pcy);
                ctx.rotate(time * .04);
                ctx.strokeStyle = "rgba(56, 189, 248, 0.8)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, pr * .72, 0, Math.PI * 2);
                ctx.stroke();
                ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
                ctx.beginPath();
                ctx.arc(0, 0, pr * .45, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
                if (Math.random() < .3) {
                    particles.push({
                        x: pcx + (Math.random() - .5) * pr * 2,
                        y: pcy + (Math.random() - .5) * pr * 2,
                        vx: (Math.random() - .5) * 1.5,
                        vy: (Math.random() - .5) * 1.5,
                        life: 16,
                        color: "#0b2a4a",
                        size: 3,
                        type: "spark"
                    });
                }
            } else if (p.isParalyzeDiamond && window.HalloweenSystem) {
                window.HalloweenSystem.drawParalyzeDiamond(ctx, p, cameraX, time);
            } else if (p.isHalloweenFire && window.HalloweenSystem) {
                window.HalloweenSystem.drawHalloweenFire(ctx, p, cameraX, time);
            } else if (p.isWhiteGhostBullet && window.HalloweenSystem) {
                window.HalloweenSystem.drawWhiteGhostBullet(ctx, p, cameraX, time);
            } else {
                const pr = p.w ? p.w / 2 : 6;
                ctx.shadowBlur = 6;
                ctx.shadowColor = p.color || "#ff0000";
                ctx.fillStyle = p.color || "#ff0000";
                ctx.beginPath();
                ctx.arc(sx + pr, p.y + pr, pr, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(sx + pr, p.y + pr, pr * .4, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
            let hitPlayer = false;
            if (p.isGiant || p.isGiantSnowball || p.isSnowball || p.isRollingSnowball || p.isColossalFireball || p.isKrakenBigBall || p.isParalyzeDiamond) {
                const pr = p.radius || 20;
                const pcx = p.x + (p.w ? p.w / 2 : pr);
                const pcy = p.y + (p.h ? p.h / 2 : pr);
                const dist = Math.hypot(pcx - (game.player.x + game.player.w / 2), pcy - (game.player.y + game.player.h / 2));
                if (dist < pr + game.player.w / 2) hitPlayer = true;
            } else {
                const pw = p.w || 8, ph = p.h || 8;
                if (p.x < game.player.x + game.player.w && p.x + pw > game.player.x && p.y < game.player.y + game.player.h && p.y + ph > game.player.y) {
                    hitPlayer = true;
                }
            }
            if (gameState === "playing" && hitPlayer && !game.player.frozen) {
                const energyDash = game.player.dashMax && game.player.dashTimer > 0;
                if (energyDash) {
                    try {
                        createExplosion(p.x, p.y, "#ff00e0", 18, 12, [ "#ff00e0", "#00ffff", "#ffffff" ]);
                        playSound(450, .12, "square", .18, 900);
                    } catch (e) {}
                    enemyProjectiles.splice(i, 1);
                    continue;
                }
                if (p.isRollingSnowball) {
                    playSound(110, .45, "sawtooth", .35, 40);
                    createExplosion(p.x + (p.radius || 25), p.y + (p.radius || 25), "#ffffff", 40, 24, [ "#ffffff", "#bae6fd", "#38bdf8" ]);
                    applyShake(9);
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 15, "⛄ ¡AVALANCHA!", "#38bdf8", 18);
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 15, typeof __ === "function" ? __("flt_avalancha") : "⛄ ¡AVALANCHA!", "#38bdf8", 18);
                } else if (p.isLongThorn) {
                    playSound(520, .18, "square", .22, 920);
                    createExplosion(p.x, p.y, "#84cc16", 20, 14, [ "#84cc16", "#a3e635", "#fef08a" ]);
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 15, "🌵 ¡PINCHAZO!", "#84cc16", 16);
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 15, typeof __ === "function" ? __("flt_pinchazo") : "🌵 ¡PINCHAZO!", "#84cc16", 16);
                } else if (p.isFlameSpray) {
                    playSound(280, .2, "sawtooth", .22, 110);
                    createExplosion(p.x, p.y, "#ff4500", 24, 16, [ "#ffffff", "#facc15", "#ff4500" ]);
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 15, "🔥 ¡LLAMARADA!", "#ff4500", 16);
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 15, typeof __ === "function" ? __("flt_llamarada") : "🔥 ¡LLAMARADA!", "#ff4500", 16);
                } else if (p.isElectric) {
                    playSound(700, .14, "sawtooth", .2, 120);
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 15, "⚡ ¡DESCARGA!", "#00f0ff", 16);
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 15, typeof __ === "function" ? __("flt_descarga") : "⚡ ¡DESCARGA!", "#00f0ff", 16);
                } else if (p.isParalyzeDiamond) {
                    if (typeof window.applyParalyzeEffect === "function") {
                        window.applyParalyzeEffect(game.player, 180);
                    }
                } else if (p.isHalloweenFire) {
                    playSound(320, .2, "sawtooth", .22, 110);
                    createExplosion(p.x, p.y, "#ea580c", 20, 14, [ "#ea580c", "#f97316", "#fef08a" ]);
                } else if (p.isWhiteGhostBullet) {
                    playSound(440, .15, "triangle", .16, 220);
                    createExplosion(p.x, p.y, "#ffffff", 18, 12, [ "#ffffff", "#cbd5e1", "#e2e8f0" ]);
                } else if (p.isSnowball) {
                    playSound(190, .16, "triangle", .18, 90);
                    createExplosion(p.x, p.y, "#ffffff", p.isGiantSnowball ? 24 : 14, 10, [ "#ffffff", "#e0f7ff", "#80d8ff" ]);
                } else if (p.isWaterBullet) {
                    playSound(240, .14, "sine", .18, 80);
                    createExplosion(p.x, p.y, "#06b6d4", 16, 12, [ "#00ffff", "#ffffff", "#0284c7" ]);
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 15, "💧 ¡SPLASH!", "#38bdf8", 15);
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 15, typeof __ === "function" ? __("flt_splash") : "💧 ¡SPLASH!", "#38bdf8", 15);
                } else if (p.isKrakenBigBall) {
                    playSound(70, .9, "sawtooth", .55, 26);
                    createExplosion(p.x, p.y, "#0284c7", p.radius ? p.radius * 2 : 56, 40, [ "#00ffff", "#0e7490", "#38bdf8", "#ffffff" ]);
                    applyShake(14);
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 18, __("flt_krakatoa_nearly"), "#38bdf8", 18);
                } else if (p.isSlowBubble || p.isBubbleSpray) {
                    playSound(560, .18, "sine", .2, 350);
                    createExplosion(p.x, p.y, "#38bdf8", 16, 10, [ "#38bdf8", "#7dd3fc", "#ffffff" ]);
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 15, "🫧 ¡POP!", "#38bdf8", 15);
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 15, typeof __ === "function" ? __("flt_pop") : "🫧 ¡POP!", "#38bdf8", 15);
                } else if (p.isAppleArc) {
                    playSound(400, .18, "triangle", .2, 220);
                    createExplosion(p.x, p.y, "#ef4444", 18, 12, [ "#ef4444", "#f87171", "#22c55e", "#ffffff" ]);
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 15, "🍎 ¡MANZANAZO!", "#ef4444", 16);
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 15, typeof __ === "function" ? __("flt_manzanazo") : "🍎 ¡MANZANAZO!", "#ef4444", 16);
                } else if (p.isFrostBreath) {
                    playSound(280, .25, "sawtooth", .28, 100);
                    createExplosion(p.x, p.y, "#a5f3fc", 22, 14, [ "#a5f3fc", "#38bdf8", "#ffffff" ]);
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 15, "❄️ ¡CONGELADA!", "#38bdf8", 18);
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 15, typeof __ === "function" ? __("flt_congelada") : "❄️ ¡CONGELADA!", "#38bdf8", 18);
                    if (typeof window.applyParalyzeEffect === "function") {
                        window.applyParalyzeEffect(game.player, 240);
                    } else if (game.player) {
                        game.player.paralyzeTimer = 240;
                    }
                } else if (p.isInkBullet) {
                    playSound(140, .25, "sawtooth", .28, 40);
                    createExplosion(p.x, p.y, "#0a0614", p.isGiantInk ? 30 : 18, 14, [ "#000000", "#2e1065", "#a855f7" ]);
                    if (typeof window.triggerInkSplatter === "function") {
                        window.triggerInkSplatter(p.isGiantInk);
                    }
                }
                game.player.takeDamage(p.damage || 15);
                enemyProjectiles.splice(i, 1);
                continue;
            }
            if (p.x < cameraX - 100 || p.x > cameraX + VIEW_W + 100 || p.y > VIEW_H + 100) enemyProjectiles.splice(i, 1);
        }
        if (game.player && window.TurretSystem) {
            try {
                window.TurretSystem.update(VIEW_W, VIEW_H);
                window.TurretSystem.checkBulletCollisions(game.player);
                if (projectiles && projectiles.length > 0) {
                    window.TurretSystem.checkPlayerProjectileCollisions(projectiles);
                }
            } catch (e) {}
        }
        if (currentLevel === 2 && window.ValkyrieBoss) {
            try {
                window.ValkyrieBoss.update(game, cameraX, VIEW_W, VIEW_H, projectiles);
            } catch (e) {}
        }
        updateAndDrawParticles(ctx, cameraX);
        for (let s of stars) {
            if (!s.collected) {
                const drawX = s.x - cameraX;
                if (drawX > -40 && drawX < VIEW_W + 40) {
                    ctx.save();
                    const beat = 1 + Math.sin(time * .12 + s.x) * .12;
                    const hoverY = s.y + Math.sin(time * .08 + s.x) * 4;
                    ctx.translate(drawX + 12, hoverY + 12);
                    ctx.rotate(Math.sin(time * .05 + s.x) * .12);
                    ctx.scale(beat, beat);
                    ctx.fillStyle = "#ff4d6d";
                    ctx.shadowColor = "#ff2e63";
                    ctx.shadowBlur = 10;
                    ctx.beginPath();
                    ctx.moveTo(0, 6);
                    ctx.bezierCurveTo(-13, -3, -9, -14, 0, -7);
                    ctx.bezierCurveTo(9, -14, 13, -3, 0, 6);
                    ctx.closePath();
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = "rgba(255,255,255,0.65)";
                    ctx.beginPath();
                    ctx.ellipse(-4.5, -5.5, 3, 2, -.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                    if (game.player && !game.player.frozen && game.player.x < s.x + 24 && game.player.x + game.player.w > s.x && game.player.y < s.y + 24 && game.player.y + game.player.h > s.y) {
                        s.collected = true;
                        score += 50;
                        updateScore(score);
                        if (game.player) {
                            game.player.health = Math.min(game.player.health + 25, PLAYER_MAX_HEALTH);
                            game.player.healShowTimer = 55;
                            gsap.to(healthFill, {
                                width: game.player.health / PLAYER_MAX_HEALTH * 100 + "%",
                                duration: .3
                            });
                            addFloatingText(s.x + 12, s.y - 30, "⭐ +50 ❤️ +25", "#ffd700", 16);
                            addFloatingText(s.x + 12, s.y - 10, "+25 ❤️", "#ff4d6d", 18);
                            for (let k = 0; k < 6; k++) {
                                particles.push({
                                    x: game.player.x + game.player.w / 2 + (Math.random() - .5) * 16,
                                    y: game.player.y,
                                    vx: (Math.random() - .5) * .8,
                                    vy: -1.4 - Math.random() * .8,
                                    life: 48,
                                    maxLife: 48,
                                    type: "emoji",
                                    text: [ "❤️", "💖", "💕", "🥰" ][Math.floor(Math.random() * 4)],
                                    size: 20,
                                    sineWave: true
                                });
                            }
                        }
                        addFloatingText(s.x + 12, s.y - 10, "+50 ❤️", "#ff4d6d", 18);
                        playSound(880, .15, "sine", .25, 1320);
                        try {
                            playSFX("sfx_heart_pickup_1");
                        } catch (e) {}
                        createExplosion(s.x + 12, s.y + 12, "#ff4d6d", 15, 12, [ "#ffffff", "#ff2e63" ]);
                    }
                }
            }
        }
        for (let cp of checkpoints) {
            drawCheckpoint(ctx, cp, cameraX, time);
            if (!cp.activated && game.player && !game.player.frozen) {
                const px = game.player.x + game.player.w / 2;
                const py = game.player.y + game.player.h / 2;
                const checkY = cp.groundY != null ? cp.groundY - 35 : cp.y + 20;
                if (Math.abs(px - (cp.x + 12)) < 40 && Math.abs(py - checkY) < 65) {
                    cp.activated = true;
                    currentCheckpoint = {
                        level: currentLevel,
                        x: cp.x,
                        y: cp.groundY != null ? cp.groundY - 60 : cp.y,
                        meadowNight: game.meadowNight,
                        gate2Open: game.gate2Open,
                        gate1Open: game.gate1Open,
                        boss1Defeated: game.boss1Defeated
                    };
                    game.player.checkpointShowTimer = 65;
                    game.player.vy = -6;
                    game.player.scaleY = 1.35;
                    game.player.scaleX = .75;
                    for (let k = 0; k < 12; k++) {
                        const ang = Math.random() * Math.PI * 2;
                        const spd = 2.5 + Math.random() * 5.5;
                        particles.push({
                            x: game.player.x + game.player.w / 2,
                            y: game.player.y + game.player.h / 2,
                            vx: Math.cos(ang) * spd,
                            vy: Math.sin(ang) * spd,
                            life: 40,
                            maxLife: 40,
                            type: "emoji",
                            text: [ "⭐", "✨", "🌟" ][Math.floor(Math.random() * 3)],
                            size: 18
                        });
                    }
                    playSound(523.25, .15, "sine", .25, 1046.5);
                    setTimeout(() => playSound(659.25, .2, "sine", .25, 1318.5), 100);
                    setTimeout(() => playSound(783.99, .25, "sine", .3, 1567.98), 200);
                    setTimeout(() => playSound(1046.5, .35, "triangle", .35, 2093), 300);
                    game.flash = 22;
                    applyShake(7);
                    createExplosion(cp.x + 12, cp.y + 10, "#00ffff", 45, 30, [ "#ffd700", "#ff3388", "#ffffff", "#00ffaa" ]);
                    addFloatingText(cp.x + 12, cp.y - 20, __("flt_checkpoint"), "#00ffff", 24);
                }
            }
        }
        updateAndDrawFloatingTexts(ctx, cameraX);
        if (game.vignette) {
            const px = game.player.x - cameraX + game.player.w / 2;
            const py = game.player.y + game.player.h / 2 - (game.camY || 0);
            const r = game.vignetteRadius || 260;
            const grad = ctx.createRadialGradient(px, py, r * .35, px, py, r);
            grad.addColorStop(0, "rgba(0,0,0,0)");
            grad.addColorStop(1, "rgba(0,0,0,0.97)");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        }
        if (game.corruption > 0) {
            ctx.fillStyle = "rgba(0,0,0," + game.corruption * .85 + ")";
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            if (game.corruption > .4 && Math.random() > .7) {
                ctx.fillStyle = "rgba(120,0,0,0.25)";
                ctx.fillRect(0, Math.random() * VIEW_H, VIEW_W, 5 + Math.random() * 30);
            }
        }
        if (game.glitchT > 0) {
            game.glitchT--;
            if (game.glitchT > 48) {
                ctx.fillStyle = "rgba(255,255,255,0.9)";
                ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            }
            for (let i = 0; i < 14; i++) {
                const gy = Math.random() * VIEW_H;
                const gh = 4 + Math.random() * 26;
                const gx = (Math.random() - .5) * 80;
                ctx.globalCompositeOperation = "lighter";
                ctx.fillStyle = "rgba(255,0,0,0.35)";
                ctx.fillRect(gx - 20, gy, VIEW_W, gh);
                ctx.fillStyle = "rgba(0,255,255,0.35)";
                ctx.fillRect(-gx + 20, gy, VIEW_W, gh);
                ctx.globalCompositeOperation = "source-over";
                ctx.fillStyle = "rgba(0,0,0," + (.3 + Math.random() * .5) + ")";
                ctx.fillRect(gx, gy, VIEW_W, gh);
            }
            for (let i = 0; i < 300; i++) {
                ctx.fillStyle = Math.random() > .5 ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.4)";
                ctx.fillRect(Math.random() * VIEW_W, Math.random() * VIEW_H, 3, 2);
            }
            if (game.glitchT % 12 < 6) {
                ctx.fillStyle = "#000";
                ctx.fillRect(VIEW_W / 2 - 110, VIEW_H / 2 - 22, 220, 44);
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 2;
                ctx.strokeRect(VIEW_W / 2 - 110, VIEW_H / 2 - 22, 220, 44);
                ctx.fillStyle = "#fff";
                ctx.font = '22px "Courier Prime"';
                ctx.textAlign = "center";
                ctx.fillText(__("ui_no_signal"), VIEW_W / 2, VIEW_H / 2 + 8);
            }
        }
        if (game.flash > 0) {
            ctx.fillStyle = "rgba(255,255,255," + game.flash / 25 + ")";
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            game.flash--;
        }
        if (currentLevel === 5) {
            ctx.restore();
            ctx.save();
            game.camY = 0;
            if (game.holeTimer === undefined) game.holeTimer = 0;
            game.holeTimer++;
            if (game.doorDialog === undefined) game.doorDialog = null;
            if (game.doorDialogTimer === undefined) game.doorDialogTimer = 0;
            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.fillRect(0, 0, VIEW_W, 140);
            ctx.fillStyle = "#f44";
            ctx.font = '36px "Fredoka One"';
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(__("ui_choose_door_title"), VIEW_W / 2, 60);
            ctx.font = '18px "Courier Prime"';
            ctx.fillStyle = "#aaa";
            ctx.fillText(__("ui_walk_to_choose"), VIEW_W / 2, 105);
            const doorW = 80, doorH = 140, whiteX = 250, blackX = 650;
            ctx.save();
            ctx.shadowColor = "#fff";
            ctx.shadowBlur = 13;
            ctx.fillStyle = "#ddd";
            ctx.fillRect(whiteX - cameraX, 360, doorW, doorH);
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 3;
            ctx.strokeRect(whiteX - cameraX, 360, doorW, doorH);
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.fillRect(whiteX + 10 - cameraX, 370, doorW - 20, doorH - 20);
            ctx.font = "50px sans-serif";
            ctx.fillText("😇", whiteX + doorW / 2 - cameraX, 450);
            ctx.font = '14px "Courier Prime"';
            ctx.fillStyle = "#fff";
            ctx.fillText(__("door_white"), whiteX + doorW / 2 - cameraX, 520);
            ctx.restore();
            ctx.save();
            ctx.shadowColor = "#800";
            ctx.shadowBlur = 13;
            ctx.fillStyle = "#1a1a1a";
            ctx.fillRect(blackX - cameraX, 360, doorW, doorH);
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "#600";
            ctx.lineWidth = 3;
            ctx.strokeRect(blackX - cameraX, 360, doorW, doorH);
            ctx.fillStyle = "rgba(100,0,0,0.4)";
            ctx.fillRect(blackX + 10 - cameraX, 370, doorW - 20, doorH - 20);
            ctx.font = "50px sans-serif";
            ctx.fillText("👿", blackX + doorW / 2 - cameraX, 450);
            ctx.font = '14px "Courier Prime"';
            ctx.fillStyle = "#f44";
            ctx.fillText(__("door_black"), blackX + doorW / 2 - cameraX, 520);
            ctx.restore();
            const t = game.holeTimer * .03;
            ctx.globalAlpha = .3 + Math.sin(t) * .1;
            ctx.fillStyle = "#fff";
            for (let i = 0; i < 5; i++) {
                const px = VIEW_W / 2 + Math.sin(t * 1.7 + i) * 200, py = 250 + Math.cos(t * 2.1 + i * 1.3) * 80;
                ctx.beginPath();
                ctx.arc(px, py, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            if (game.doorDialog) {
                game.doorDialogTimer++;
                ctx.fillStyle = "rgba(0,0,0,0.85)";
                ctx.fillRect(0, 0, VIEW_W, VIEW_H);
                const dl = game.doorDialog === "white" ? [ __("door_dialog_white_1"), __("door_dialog_white_2"), __("door_dialog_white_3"), __("door_dialog_white_4"), __("door_dialog_white_5"), __("door_dialog_white_6") ] : [ __("door_dialog_black_1"), __("door_dialog_black_2"), __("door_dialog_black_3"), __("door_dialog_black_4"), __("door_dialog_black_5"), __("door_dialog_black_6"), __("door_dialog_black_7"), __("door_dialog_black_8"), __("door_dialog_black_9"), __("door_dialog_black_10") ];
                const idx = Math.min(Math.floor(game.doorDialogTimer / 90), dl.length - 1);
                ctx.fillStyle = game.doorDialog === "white" ? "#fff" : "#f44";
                ctx.font = '24px "Fredoka One"';
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                for (let i = 0; i <= idx && i < dl.length; i++) {
                    ctx.fillText(dl[i], VIEW_W / 2, VIEW_H / 2 - 60 + i * 38);
                }
                if (idx >= dl.length - 1 && game.doorDialogTimer > dl.length * 90 + 40) {
                    ctx.font = '16px "Courier Prime"';
                    ctx.fillStyle = "#888";
                    ctx.fillText(__("msg_puntos"), VIEW_W / 2, VIEW_H / 2 + dl.length * 20);
                    if (game.doorDialogTimer > dl.length * 90 + 120) {
                        game.doorDialog = null;
                        game.doorDialogTimer = 0;
                        if (currentBGM) {
                            currentBGM.pause();
                            currentBGM.volume = 1;
                        }
                        gameState = "ending";
                        game.endingTimer = 0;
                        game.endingStep = 0;
                        game.player.x = VIEW_W / 2 - game.player.w / 2;
                        game.player.y = 440;
                        game.player.frozen = true;
                        bfShow = true;
                        bfTargetX = VIEW_W / 2;
                        bfTargetY = VIEW_H / 2;
                        getBlackoutDiv().style.opacity = 1;
                        window.showAnimatedMessage(__("msg_puntos"));
                    }
                }
                ctx.restore();
                return;
            }
            if (!game.doorDialog && !game.player.frozen) {
                let nearDoor = null;
                if (game.player.x + game.player.w > whiteX - 30 && game.player.x < whiteX + doorW + 30 && game.player.y + game.player.h > 360 && game.player.y < 500) {
                    nearDoor = "white";
                    ctx.fillStyle = `rgba(255,255,255,${.6 + Math.sin(game.holeTimer * .08) * .3})`;
                    ctx.font = '18px "Fredoka One"';
                    ctx.textAlign = "center";
                    ctx.fillText(__("ui_press_interact"), whiteX + doorW / 2 - cameraX, 340);
                    if (keys[" "] || keys["Spacebar"]) {
                        game.doorDialog = "white";
                        game.doorDialogTimer = 0;
                        game.player.frozen = true;
                        delete keys[" "];
                        delete keys["Spacebar"];
                    }
                }
                if (game.player.x + game.player.w > blackX - 30 && game.player.x < blackX + doorW + 30 && game.player.y + game.player.h > 360 && game.player.y < 500) {
                    nearDoor = "black";
                    ctx.fillStyle = `rgba(255,100,100,${.6 + Math.sin(game.holeTimer * .08) * .3})`;
                    ctx.font = '18px "Fredoka One"';
                    ctx.textAlign = "center";
                    ctx.fillText(__("ui_press_interact"), blackX + doorW / 2 - cameraX, 340);
                    if (keys[" "] || keys["Spacebar"]) {
                        game.doorDialog = "black";
                        game.doorDialogTimer = 0;
                        game.player.frozen = true;
                        delete keys[" "];
                        delete keys["Spacebar"];
                    }
                }
            }
            ctx.restore();
            return;
        }
        if (game.flashMode && Math.random() > .92) {
            ctx.fillStyle = "rgba(255,255,255,0.25)";
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        }
        if (game.lvl4State === "falling") {
            ctx.strokeStyle = "rgba(255,255,255,0.5)";
            ctx.lineWidth = 2;
            for (let i = 0; i < 12; i++) {
                const lx = (i * 97 + time * 13 % 97) % VIEW_W;
                const ly = (time * 31 + i * 137) % VIEW_H;
                ctx.beginPath();
                ctx.moveTo(lx, ly);
                ctx.lineTo(lx, ly + 60 + Math.random() * 60);
                ctx.stroke();
            }
        }
        if (blood.length > MAX_BLOOD) blood.splice(0, blood.length - MAX_BLOOD);
        for (let b of blood) {
            b.x += b.vx;
            b.y += b.vy;
            b.vy += .4;
            b.life--;
            ctx.fillStyle = b.color;
            ctx.fillRect(b.x, b.y, 5, 5);
        }
        blood = blood.filter(b => b.life > 0);
        if (game.inHunt || game.lvl4State === "hunt") {
            slashes.forEach(s => {
                s.t++;
            });
            slashes.forEach(s => {
                const prog = s.t / 7;
                const alpha = Math.max(0, 1 - prog);
                const bright = alpha > .5;
                const killScale = 1 + (game.huntKills || 0) / 8 * .8;
                const dir = s.facing;
                const baseX = game.player.x - cameraX + (dir > 0 ? game.player.w * .35 : game.player.w * .65);
                const baseY = game.player.y + game.player.h * .4;
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.translate(baseX, baseY);
                if (dir < 0) ctx.scale(-1, 1);
                ctx.scale(killScale, killScale);
                ctx.shadowColor = "#fff";
                ctx.shadowBlur = bright ? 22 + (game.huntKills || 0) * 2 : 12;
                const bloodAlpha = Math.min(1, .4 + (game.huntKills || 0) / 8 * .5);
                ctx.strokeStyle = `rgba(225, 29, 72, ${alpha * bloodAlpha})`;
                ctx.lineWidth = 32;
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(-18, -38);
                ctx.quadraticCurveTo(35, -20, 58, 28);
                ctx.stroke();
                ctx.strokeStyle = bright ? "rgba(255, 255, 255, 0.95)" : "rgba(254, 205, 211, 0.8)";
                ctx.lineWidth = 18;
                ctx.beginPath();
                ctx.moveTo(-12, -32);
                ctx.quadraticCurveTo(38, -16, 52, 24);
                ctx.stroke();
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.moveTo(-8, -30);
                ctx.quadraticCurveTo(40, -14, 50, 22);
                ctx.stroke();
                ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
                ctx.lineWidth = 8;
                ctx.beginPath();
                ctx.moveTo(8, 22);
                ctx.quadraticCurveTo(46, 0, 68, -14);
                ctx.stroke();
                if (s.t <= 3) {
                    ctx.save();
                    ctx.translate(45, -5);
                    ctx.fillStyle = "#ffffff";
                    ctx.shadowColor = "#ff1744";
                    ctx.shadowBlur = 14;
                    ctx.fillRect(-12, -2, 24, 4);
                    ctx.fillRect(-2, -12, 4, 24);
                    ctx.shadowBlur = 0;
                    ctx.restore();
                }
                if ((game.huntKills || 0) >= 1) {
                    ctx.fillStyle = "#b91c1c";
                    for (let sp = 0; sp < 4; sp++) {
                        const spAng = -.4 + sp * .35;
                        const spDist = 35 + sp * 10;
                        ctx.beginPath();
                        ctx.arc(Math.cos(spAng) * spDist, Math.sin(spAng) * spDist, 2.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                ctx.restore();
            });
            slashes = slashes.filter(s => s.t < 7);
        }
        if (game.lvl4State === "hunt") {
            const d = game.dread || 0;
            if (d > 0) {
                ctx.fillStyle = "rgba(150,0,0," + d * .55 + ")";
                ctx.fillRect(0, 0, VIEW_W, VIEW_H);
                ctx.fillStyle = "rgba(0,0,0," + d * .5 + ")";
                ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            }
            if (d > 0 && Math.random() < d * .9) applyShake(2 + d * 16);
            if (d > .05 && Math.random() < d * .5) {
                ctx.fillStyle = "rgba(255,20,20," + d * .22 + ")";
                ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            }
        }
        if (currentLevel >= 2 && Math.random() > .98) {
            ctx.fillStyle = "rgba(255,255,255,0.1)";
            ctx.fillRect(0, Math.random() * VIEW_H, VIEW_W, 10 + Math.random() * 40);
            ctx.translate((Math.random() - .5) * 10, 0);
        }
        if (window.postGameHorror) {
            const grd = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H * .3, VIEW_W / 2, VIEW_H / 2, VIEW_W);
            grd.addColorStop(0, "rgba(0,0,0,0.2)");
            grd.addColorStop(1, "rgba(15,0,0,0.85)");
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            if (Math.random() > .95) {
                ctx.fillStyle = "rgba(255, 0, 0, 0.05)";
                ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            }
        }
        if (gameState === "ending") {
            game.endingTimer++;
            const et = game.endingTimer / 60;
            if (et < 1) {
                blackoutDiv.style.opacity = Math.max(0, 1 - et * 2);
            } else if (et < 3) {
                blackoutDiv.style.opacity = 0;
                bfAlpha = Math.min(1, (et - 1) * 2);
                bfStalk = 1;
                bfTeeth = 0;
                bfLaugh = 0;
                bfAnnoyed = 0;
                bfEnraged = 0;
                bfPointerX += (VIEW_W / 2 - bfPointerX) * .05;
                bfPointerY += (VIEW_H / 2 - bfPointerY) * .05;
                if (!game.msgShown1) {
                    game.msgShown1 = true;
                    window.showAnimatedMessage(__("msg_por_que_sorprende"), true);
                }
            } else if (et < 6) {
                if (et >= 4 && !game.msgShown2) {
                    game.msgShown2 = true;
                    window.showAnimatedMessage(__("msg_desde_primer_dia"), true);
                }
                if (et >= 5.5 && !game.msgShown3) {
                    game.msgShown3 = true;
                    window.showAnimatedMessage(__("msg_nunca_aclare"), true);
                }
            } else if (et >= 6) {
                if (et >= 7 && !game.msgShown4) {
                    game.msgShown4 = true;
                    window.showAnimatedMessage(__("msg_todo_este_tiempo"), true);
                }
                if (et >= 8.5 && !game.msgShown5) {
                    game.msgShown5 = true;
                    window.showAnimatedMessage(__("msg_sonaba_tan_sola"), true);
                }
                if (et >= 13.5 && !game.endingDone) {
                    game.endingDone = true;
                    try {
                        gsap.to(getMessageDiv(), {
                            scale: 0,
                            opacity: 0,
                            duration: .5
                        });
                    } catch (e) {}
                    gsap.to(getBlackoutDiv(), {
                        opacity: 1,
                        duration: 3,
                        ease: "power2.inOut",
                        onComplete: () => {
                            try {
                                localStorage.setItem("starcube_horror_mode", "true");
                                window.postGameHorror = true;
                            } catch (e) {}
                            window.loadHubLevel();
                        }
                    });
                }
            }
        }
        ctx.restore();
        if (game.pixelTransitionProgress != null && game.pixelTransitionProgress < 1 && currentLevel === 1) {
            ctx.save();
            ctx.translate(VIEW_W / 2, VIEW_H / 2);
            const rTime = Date.now() * .005;
            ctx.rotate(rTime);
            const radius = 60 + game.pixelTransitionProgress * 200;
            const alpha = 1 - game.pixelTransitionProgress;
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = "#00ffff";
            ctx.lineWidth = 8;
            ctx.shadowColor = "#00ffff";
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2 * game.pixelTransitionProgress);
            ctx.stroke();
            ctx.rotate(-rTime * 2);
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            for (let i = 0; i < 3; i++) {
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, radius * .8, i * Math.PI * 2 / 3, i * Math.PI * 2 / 3 + .5);
            }
            ctx.fill();
            ctx.restore();
        }
        if ((game.pixelMode || game.pixelTransitionProgress > 0) && currentLevel === 1) {
            let pixelSize = 5;
            if (game.pixelTransitionProgress != null && game.pixelTransitionProgress < 1) {
                pixelSize = 1 + game.pixelTransitionProgress * 4;
                if (pixelSize < 1.2) pixelSize = 1;
            }
            if (pixelSize > 1) {
                const pw = Math.ceil(VIEW_W / pixelSize);
                const ph = Math.ceil(VIEW_H / pixelSize);
                const perfScale = typeof window.PerfQuality !== "undefined" ? window.PerfQuality.pixelScale : 1;
                const sw = Math.max(48, Math.ceil(pw * perfScale));
                const sh = Math.max(32, Math.ceil(ph * perfScale));
                if (!_pixelTempCanvas) {
                    _pixelTempCanvas = document.createElement("canvas");
                    _pixelTempCtx = _pixelTempCanvas.getContext("2d");
                }
                _pixelTempCanvas.width = sw;
                _pixelTempCanvas.height = sh;
                const tctx = _pixelTempCtx;
                tctx.imageSmoothingEnabled = false;
                tctx.drawImage(canvas, 0, 0, sw, sh);
                ctx.imageSmoothingEnabled = false;
                ctx.clearRect(0, 0, VIEW_W, VIEW_H);
                ctx.drawImage(_pixelTempCanvas, 0, 0, sw, sh, 0, 0, VIEW_W, VIEW_H);
                ctx.imageSmoothingEnabled = true;
                ctx.fillStyle = "rgba(0,0,0,0.15)";
                for (let s = 0; s < VIEW_H; s += 4) {
                    ctx.fillRect(0, s, VIEW_W, 2);
                }
            }
        }
        if (gameState === "playing" && game.player && !game.hideHealthBar) {
            drawHealthBar(ctx, game.player.health, PLAYER_MAX_HEALTH, time);
        }
        if (gameState === "playing" && currentLevel === 1 && game.invertControls && typeof window.drawInvertControlsHUD === "function") {
            window.drawInvertControlsHUD(ctx, time);
        }
        if (gameState === "playing" && currentLevel === 3 && game.stormMode && typeof window.updateAndDrawStorm === "function") {
            window.updateAndDrawStorm(ctx, cameraX, time, game.player);
        }
        if (gameState === "playing" && typeof window.drawInkSplatter === "function") {
            window.drawInkSplatter(ctx);
        }
        ctx.restore();
        if (typeof window.drawBossPresentation === "function") {
            window.drawBossPresentation(ctx);
        }
    }
    function gameLoop(now) {
        requestAnimationFrame(gameLoop);
        if (now == null) now = performance.now();
        if (!_hasFrameTime) {
            _lastFrameTime = now;
            _hasFrameTime = true;
            return;
        }
        let dt = now - _lastFrameTime;
        _lastFrameTime = now;
        if (dt > MAX_FRAME_DT) dt = MAX_FRAME_DT;
        if (window.GAME_PAUSED) {
            _acc = 0;
            return;
        }
        _acc += dt;
        let steps = 0;
        while (_acc >= FRAME_INTERVAL && steps < MAX_STEPS) {
            step();
            _acc -= FRAME_INTERVAL;
            steps++;
        }
        if (steps >= MAX_STEPS) _acc = 0;
    }
    canvas.addEventListener("click", e => {
        if (game.techBoss && game.techBoss.showChoice) {
            const rect = canvas.getBoundingClientRect();
            const clickX = (e.clientX - rect.left) * (VIEW_W / rect.width);
            const clickY = (e.clientY - rect.top) * (VIEW_H / rect.height);
            const modalY = VIEW_H / 2 - 90;
            const btnY = modalY + 95;
            if (clickY >= btnY && clickY <= btnY + 45) {
                if (clickX >= VIEW_W / 2 - 140 && clickX <= VIEW_W / 2 - 20) {
                    game.techBoss.selectedOption = 0;
                    confirmTechBossChoice();
                    return;
                } else if (clickX >= VIEW_W / 2 + 20 && clickX <= VIEW_W / 2 + 140) {
                    game.techBoss.selectedOption = 1;
                    confirmTechBossChoice();
                    return;
                }
            }
        }
        if (gameState === "introStory") {
            if (typeof window.handleIntroInput === "function") {
                window.handleIntroInput("click");
            }
            return;
        }
        if (gameState === "preNivel4") {
            let lines = [ __("story_prenivel4_1"), __("story_prenivel4_2"), __("story_prenivel4_3"), "", __("story_prenivel4_5"), "", __("story_prenivel4_7"), __("story_prenivel4_9"), __("story_prenivel4_10"), "", __("story_prenivel4_11"), __("story_prenivel4_12") ];
            const fullLine = lines[game.storyLine] || "";
            if (game.storyChar >= fullLine.length) {
                if (game.storyLine < lines.length - 1) {
                    game.storyLine++;
                    game.storyChar = 0;
                    game.storyTimer = 0;
                    game.storyHold = 0;
                } else {
                    game.storyHold = 9999;
                }
            } else {
                game.storyChar = fullLine.length;
                game.storyHold = 0;
            }
        }
    });
    window.loadLevel = loadLevel;
    window.messageDiv = messageDiv;
    window.choiceDiv = choiceDiv;
    window.blackoutDiv = blackoutDiv;
    requestAnimationFrame(gameLoop);
})();