(function() {
    "use strict";
    if (typeof document === "undefined") return;
    const isTouch = typeof window !== "undefined" && (window.matchMedia && window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window || navigator.maxTouchPoints > 0);
    window.isMobileDevice = isTouch;
    const touchCtl = document.getElementById("touch-controls");
    if (touchCtl) touchCtl.style.display = "none";
    function triggerHaptic(type = "light") {
        if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
        try {
            if (type === "light") navigator.vibrate(12);
            else if (type === "medium") navigator.vibrate(20);
            else if (type === "dash") navigator.vibrate(28);
            else if (type === "heavy") navigator.vibrate([35, 25, 35]);
            else if (typeof type === "number" || Array.isArray(type)) navigator.vibrate(type);
        } catch (e) {}
    }
    window.triggerHaptic = triggerHaptic;

    function updateTouchControlsVisibility() {
        if (!touchCtl) return;
        const shouldShow = isTouch && !window.hasGamepad && (typeof gameState !== "undefined" && (gameState === "playing" || gameState === "hub" || gameState === "caceria"));
        touchCtl.style.display = shouldShow ? "block" : "none";
    }
    window.updateTouchControlsVisibility = updateTouchControlsVisibility;
    function forceFullscreen() {
        const doc = document;
        const docEl = doc.documentElement;
        try {
            const req = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
            if (req && !doc.fullscreenElement && !doc.webkitFullscreenElement) {
                const p = req.call(docEl);
                if (p && typeof p.then === "function") p.catch(function() {});
            }
        } catch (e) {}
        try {
            if (typeof screen !== "undefined" && screen.orientation && screen.orientation.lock) {
                screen.orientation.lock("landscape").catch(function() {});
            }
        } catch (e) {}
    }
    window.forceFullscreen = forceFullscreen;
    let fsTriggered = false;
    document.addEventListener("pointerdown", function onFirstTouch() {
        if (!fsTriggered) {
            fsTriggered = true;
            forceFullscreen();
        }
    }, {
        passive: true
    });
    const startBtn = document.getElementById("start-btn");
    if (startBtn) startBtn.addEventListener("click", forceFullscreen, {
        capture: true
    });
    const fsToggleBtn = document.getElementById("btn-fullscreen-toggle");
    if (fsToggleBtn) {
        fsToggleBtn.addEventListener("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                forceFullscreen();
            } else {
                try {
                    const exit = document.exitFullscreen || document.webkitExitFullscreen;
                    if (exit) exit.call(document);
                } catch (er) {}
            }
        });
    }
    if (typeof window !== "undefined" && window.tagName === undefined) {
        try {
            Object.defineProperty(window, "tagName", {
                value: "",
                configurable: true,
                writable: true
            });
        } catch (e) {
            try {
                window.tagName = "";
            } catch (err) {}
        }
    }
    function invActive() {
        return typeof game !== "undefined" && !!game.invertControls && typeof gameState !== "undefined" && gameState === "playing" && (typeof currentLevel !== "undefined" && currentLevel === 1);
    }
    function applyGameKey(type, key, code) {
        window.isMobileDevice = true;
        const isDown = type === "keydown";
        if (typeof keys !== "undefined") {
            const inv = invActive();
            if (inv) {
                if (key === "ArrowLeft") keys["ArrowRight"] = isDown; else if (key === "ArrowRight") keys["ArrowLeft"] = isDown; else if (key === "z" || key === "Z") keys["x"] = isDown; else if (key === "x" || key === "X") keys[" "] = isDown; else keys[key] = isDown;
            } else {
                keys[key] = isDown;
                if (key === "z" || key === "Z") keys[" "] = isDown;
            }
        }
        if (isDown) {
            if (typeof initAudio === "function") initAudio();
            if (typeof gameState !== "undefined" && gameState === "playing" && typeof game !== "undefined" && game.player && !game.player.frozen) {
                const inv = invActive();
                const invJump = inv ? key === "x" || key === "X" : key === "z" || key === "Z";
                const isJumpKey = key === " " || key === "Spacebar" || key === "w" || key === "W" || invJump;
                if (isJumpKey && (typeof currentLevel === "undefined" || currentLevel !== 4)) {
                    game.player.jumpBufferTimer = Math.max(game.player.jumpBufferTimer, 12);
                }
                if ((key === "c" || key === "C") && (typeof currentLevel === "undefined" || currentLevel !== 4)) {
                    game.player.dashBufferTimer = 30;
                }
            }
        }
    }
    function emit(type, key, code) {
        if (!key) return;
        applyGameKey(type, key, code);
        try {
            const charCode = key && key.length === 1 ? key.toUpperCase().charCodeAt(0) : 0;
            const keyCode = charCode || (key === " " ? 32 : key === "ArrowLeft" ? 37 : key === "ArrowUp" ? 38 : key === "ArrowRight" ? 39 : key === "ArrowDown" ? 40 : key === "c" || key === "C" ? 67 : key === "x" || key === "X" ? 88 : key === "z" || key === "Z" ? 90 : 0);
            const ev = new KeyboardEvent(type, {
                key: key,
                code: code || (key.length === 1 ? "Key" + key.toUpperCase() : key),
                keyCode: keyCode,
                which: keyCode,
                charCode: charCode,
                bubbles: true,
                cancelable: true,
                composed: true,
                view: window
            });
            const targetEl = document.getElementById("gameCanvas") || document.body || document.documentElement || window;
            targetEl.dispatchEvent(ev);
        } catch (e) {}
    }
    function dirKey(d) {
        const inv = invActive();
        if (d === "left") return inv ? {
            key: "ArrowRight",
            code: "ArrowRight"
        } : {
            key: "ArrowLeft",
            code: "ArrowLeft"
        };
        if (d === "right") return inv ? {
            key: "ArrowLeft",
            code: "ArrowLeft"
        } : {
            key: "ArrowRight",
            code: "ArrowRight"
        };
        if (d === "up") return {
            key: "ArrowUp",
            code: "ArrowUp"
        };
        if (d === "down") return {
            key: "ArrowDown",
            code: "ArrowDown"
        };
        return null;
    }
    function shootKey() {
        return invActive() ? {
            key: "z",
            code: "KeyZ"
        } : {
            key: "x",
            code: "KeyX"
        };
    }
    function jumpKey() {
        return {
            key: " ",
            code: "Space"
        };
    }
    function dashKey() {
        return {
            key: "c",
            code: "KeyC"
        };
    }
    const padZone = document.getElementById("pad-zone");
    const padUpEl = document.getElementById("pad-up");
    const padDownEl = document.getElementById("pad-down");
    const padLeftEl = document.getElementById("pad-left");
    const padRightEl = document.getElementById("pad-right");
    const DEAD_ZONE = 14;
    let dpadPointerId = null, dpadCenterX = 0, dpadCenterY = 0;
    const dpadState = {
        left: false,
        right: false,
        up: false,
        down: false
    };
    function updateDpadVisuals() {
        if (padUpEl) padUpEl.classList.toggle("active", dpadState.up);
        if (padDownEl) padDownEl.classList.toggle("active", dpadState.down);
        if (padLeftEl) padLeftEl.classList.toggle("active", dpadState.left);
        if (padRightEl) padRightEl.classList.toggle("active", dpadState.right);
    }
    function applyDpadDirections(dirs) {
        let changed = false;
        [ "left", "right", "up", "down" ].forEach(function(d) {
            const want = dirs.indexOf(d) >= 0;
            if (want && !dpadState[d]) {
                const k = dirKey(d);
                if (k) emit("keydown", k.key, k.code);
                changed = true;
            }
            if (!want && dpadState[d]) {
                const k = dirKey(d);
                if (k) emit("keyup", k.key, k.code);
            }
            dpadState[d] = want;
        });
        if (changed) triggerHaptic("light");
        updateDpadVisuals();
    }
    function calculateDpadDirs(dx, dy) {
        if (Math.hypot(dx, dy) < DEAD_ZONE) return [];
        const angle = Math.atan2(-dy, dx);
        const octant = Math.round(angle / (Math.PI / 4));
        switch (octant) {
          case 0:
            return [ "right" ];

          case 1:
            return [ "up", "right" ];

          case 2:
            return [ "up" ];

          case 3:
            return [ "up", "left" ];

          case 4:
          case -4:
            return [ "left" ];

          case -3:
            return [ "down", "left" ];

          case -2:
            return [ "down" ];

          case -1:
            return [ "down", "right" ];
        }
        return [];
    }
    if (padZone) {
        padZone.addEventListener("pointerdown", function(e) {
            e.preventDefault();
            e.stopPropagation();
            forceFullscreen();
            if (dpadPointerId !== null || typeof window.GAME_PAUSED !== "undefined" && window.GAME_PAUSED) return;
            dpadPointerId = e.pointerId;
            const r = padZone.getBoundingClientRect();
            dpadCenterX = r.left + r.width / 2;
            dpadCenterY = r.top + r.height / 2;
            try {
                padZone.setPointerCapture(e.pointerId);
            } catch (er) {}
            applyDpadDirections(calculateDpadDirs(e.clientX - dpadCenterX, e.clientY - dpadCenterY));
        });
        padZone.addEventListener("pointermove", function(e) {
            if (e.pointerId !== dpadPointerId) return;
            e.preventDefault();
            applyDpadDirections(calculateDpadDirs(e.clientX - dpadCenterX, e.clientY - dpadCenterY));
        });
        function onDpadEnd(e) {
            if (e.pointerId !== dpadPointerId) return;
            applyDpadDirections([]);
            dpadPointerId = null;
        }
        padZone.addEventListener("pointerup", onDpadEnd);
        padZone.addEventListener("pointercancel", onDpadEnd);
    }
    const actionZone = document.getElementById("action-zone");
    const jumpBtnEl = document.getElementById("btn-jump");
    const shootBtnEl = document.getElementById("btn-shoot");
    const dashBtnEl = document.getElementById("btn-dash");
    const enterDoorBtn = document.getElementById("btn-enter-door");
    const energyDashBtn = document.getElementById("btn-energy-dash");
    const huntZone = document.getElementById("hunt-action-zone");
    const slashHuntBtn = document.getElementById("btn-slash-hunt");
    if (dashBtnEl) {
        dashBtnEl.addEventListener("pointerdown", function(e) {
            e.preventDefault();
            e.stopPropagation();
            forceFullscreen();
            dashBtnEl.classList.add("active");
            emit("keydown", dashKey().key, dashKey().code);
            if (typeof game !== "undefined" && game.player) game.player.dashBufferTimer = 6;
        });
        function onDashEnd(e) {
            dashBtnEl.classList.remove("active");
            emit("keyup", dashKey().key, dashKey().code);
        }
        dashBtnEl.addEventListener("pointerup", onDashEnd);
        dashBtnEl.addEventListener("pointercancel", onDashEnd);
    }
    if (enterDoorBtn) {
        function onDoorEnd(e) {
            enterDoorBtn.classList.remove("active");
            emit("keyup", "ArrowUp", "ArrowUp");
            if (typeof keys !== "undefined") keys.ArrowUp = false;
        }
        enterDoorBtn.addEventListener("pointerdown", function(e) {
            e.preventDefault();
            e.stopPropagation();
            forceFullscreen();
            enterDoorBtn.classList.add("active");
            emit("keydown", "ArrowUp", "ArrowUp");
            if (typeof keys !== "undefined") keys.ArrowUp = true;
            triggerHaptic("medium");
        });
        enterDoorBtn.addEventListener("pointerup", onDoorEnd);
        enterDoorBtn.addEventListener("pointercancel", onDoorEnd);
    }
    if (energyDashBtn) {
        energyDashBtn.addEventListener("pointerdown", function(e) {
            e.preventDefault();
            e.stopPropagation();
            forceFullscreen();
            energyDashBtn.classList.add("active");
            emit("keydown", "c", "KeyC");
            if (typeof game !== "undefined" && game.player) {
                game.player.dashBufferTimer = 8;
            }
        });
        function onEdEnd(e) {
            energyDashBtn.classList.remove("active");
            emit("keyup", "c", "KeyC");
        }
        energyDashBtn.addEventListener("pointerup", onEdEnd);
        energyDashBtn.addEventListener("pointercancel", onEdEnd);
    }
    if (slashHuntBtn) {
        slashHuntBtn.addEventListener("pointerdown", function(e) {
            e.preventDefault();
            e.stopPropagation();
            forceFullscreen();
            slashHuntBtn.classList.add("active");
            emit("keydown", "x", "KeyX");
            if (typeof keys !== "undefined") {
                keys["x"] = true;
                keys["X"] = true;
            }
            if (typeof triggerHaptic === "function") triggerHaptic("medium");
        });
        function onSlashEnd(e) {
            slashHuntBtn.classList.remove("active");
            emit("keyup", "x", "KeyX");
            if (typeof keys !== "undefined") {
                keys["x"] = false;
                keys["X"] = false;
            }
        }
        slashHuntBtn.addEventListener("pointerup", onSlashEnd);
        slashHuntBtn.addEventListener("pointercancel", onSlashEnd);
    }
    let actionPointerId = null, currentActionBtn = null;
    function getActionBtnAt(x, y) {
        const pad = 12;
        const dDoor = enterDoorBtn && enterDoorBtn.style.display !== "none" ? enterDoorBtn.getBoundingClientRect() : null;
        const s = shootBtnEl && shootBtnEl.style.display !== "none" ? shootBtnEl.getBoundingClientRect() : null;
        const j = jumpBtnEl ? jumpBtnEl.getBoundingClientRect() : null;
        const d = dashBtnEl ? dashBtnEl.getBoundingClientRect() : null;
        if (dDoor && x >= dDoor.left - pad && x <= dDoor.left + dDoor.width + pad && y >= dDoor.top - pad && y <= dDoor.top + dDoor.height + pad) return "enter";
        if (s && x >= s.left - pad && x <= s.left + s.width + pad && y >= s.top - pad && y <= s.top + s.height + pad) return "shoot";
        if (j && x >= j.left - pad && x <= j.left + j.width + pad && y >= j.top - pad && y <= j.top + j.height + pad) return "jump";
        if (d && x >= d.left - pad && x <= d.left + d.width + pad && y >= d.top - pad && y <= d.top + d.height + pad) return "dash";
        return null;
    }
    function setActionState(which) {
        if (which === currentActionBtn) return;
        if (currentActionBtn === "shoot") {
            if (shootBtnEl) shootBtnEl.classList.remove("active");
            emit("keyup", shootKey().key, shootKey().code);
        }
        if (currentActionBtn === "jump") {
            if (jumpBtnEl) jumpBtnEl.classList.remove("active");
            emit("keyup", jumpKey().key, jumpKey().code);
        }
        if (currentActionBtn === "dash") {
            if (dashBtnEl) dashBtnEl.classList.remove("active");
            emit("keyup", dashKey().key, dashKey().code);
        }
        if (currentActionBtn === "enter") {
            if (enterDoorBtn) enterDoorBtn.classList.remove("active");
            emit("keyup", "ArrowUp", "ArrowUp");
            if (typeof keys !== "undefined") keys.ArrowUp = false;
        }
        currentActionBtn = which;
        if (which === "shoot") {
            if (shootBtnEl) shootBtnEl.classList.add("active");
            emit("keydown", shootKey().key, shootKey().code);
            triggerHaptic("light");
        }
        if (which === "jump") {
            if (jumpBtnEl) jumpBtnEl.classList.add("active");
            emit("keydown", jumpKey().key, jumpKey().code);
            triggerHaptic("light");
        }
        if (which === "dash") {
            if (dashBtnEl) dashBtnEl.classList.add("active");
            emit("keydown", dashKey().key, dashKey().code);
            triggerHaptic("dash");
            if (typeof game !== "undefined" && game.player) game.player.dashBufferTimer = 6;
        }
        if (which === "enter") {
            if (enterDoorBtn) enterDoorBtn.classList.add("active");
            emit("keydown", "ArrowUp", "ArrowUp");
            if (typeof keys !== "undefined") keys.ArrowUp = true;
            triggerHaptic("medium");
        }
    }
    if (actionZone) {
        actionZone.addEventListener("pointerdown", function(e) {
            e.preventDefault();
            e.stopPropagation();
            forceFullscreen();
            if (actionPointerId !== null || typeof window.GAME_PAUSED !== "undefined" && window.GAME_PAUSED) return;
            actionPointerId = e.pointerId;
            try {
                actionZone.setPointerCapture(e.pointerId);
            } catch (er) {}
            setActionState(getActionBtnAt(e.clientX, e.clientY));
        });
        actionZone.addEventListener("pointermove", function(e) {
            if (e.pointerId !== actionPointerId) return;
            e.preventDefault();
            setActionState(getActionBtnAt(e.clientX, e.clientY));
        });
        function onActionEnd(e) {
            if (e.pointerId !== actionPointerId) return;
            setActionState(null);
            actionPointerId = null;
        }
        actionZone.addEventListener("pointerup", onActionEnd);
        actionZone.addEventListener("pointercancel", onActionEnd);
    }
    function updateTouchControlsState() {
        if (!touchCtl) return;
        const shouldShow = isTouch && !window.hasGamepad && (typeof gameState !== "undefined" && (gameState === "playing" || gameState === "hub" || gameState === "caceria"));
        touchCtl.style.display = shouldShow ? "block" : "none";
        const inHunt = typeof game !== "undefined" && (game.inHunt || game.lvl4State === "hunt");
        const isLevel6Dark = typeof currentLevel !== "undefined" && currentLevel === 4;
        if (energyDashBtn) {
            const hasMaxCharge = typeof game !== "undefined" && game.player && game.player.chargeLevel >= 4 && !game.inHunt && !game.player.frozen && !isLevel6Dark;
            energyDashBtn.style.display = hasMaxCharge ? "flex" : "none";
        }
        const canEnter = !!window.canEnterDoor;
        if (enterDoorBtn) {
            enterDoorBtn.style.display = canEnter && !isLevel6Dark && !inHunt ? "flex" : "none";
        }
        if (shootBtnEl) {
            const isHubLevel = typeof game !== "undefined" && (game.isHub || currentLevel === "hub");
            shootBtnEl.style.display = (canEnter || isHubLevel || isLevel6Dark || inHunt) ? "none" : "flex";
        }
        if (jumpBtnEl) {
            jumpBtnEl.style.display = inHunt ? "none" : "flex";
        }
        if (dashBtnEl) {
            dashBtnEl.style.display = inHunt ? "none" : "flex";
        }
        if (actionZone && huntZone) {
            if (inHunt) {
                actionZone.style.display = "none";
                huntZone.style.display = "block";
            } else if (isLevel6Dark) {
                actionZone.style.display = "none";
                huntZone.style.display = "none";
            } else {
                actionZone.style.display = "block";
                huntZone.style.display = "none";
            }
        }
        const inv = typeof game !== "undefined" && !!game.invertControls && typeof currentLevel !== "undefined" && currentLevel === 1;
        touchCtl.classList.toggle("inverted-hands", inv);
    }
    window.updateTouchControlsState = updateTouchControlsState;
    const canvas = document.getElementById("gameCanvas");
    if (canvas) {
        canvas.addEventListener("pointerup", function(e) {
            if (e.pointerType === "mouse") return;
            e.preventDefault();
            forceFullscreen();
            try {
                if (typeof isDialogActive !== "undefined" && isDialogActive) {
                    const locked = typeof techDialogLock !== "undefined" && techDialogLock;
                    const isTech = typeof currentLevel !== "undefined" && currentLevel === 1 && typeof game !== "undefined" && game.techBoss && (game.techBoss.state === "fighting" || game.techBoss.state === "intro_boot" || game.techBoss.state === "intro_dialog" || game.techBoss.state === "defeated");
                    if (locked || isTech) return;
                    if (typeof advanceOrSkipDialogue === "function") advanceOrSkipDialogue();
                } else if (typeof game !== "undefined" && game && game.lvl4State === "companion") {
                    const curIdx = Math.floor((game.lvl4Timer || 0) / 180);
                    game.lvl4Timer = (curIdx + 1) * 180;
                } else if (typeof gameState !== "undefined" && (gameState === "introStory" || gameState === "preNivel4")) {
                    emit("keydown", " ", "Space");
                    emit("keyup", " ", "Space");
                }
            } catch (err) {}
        }, {
            passive: false
        });
    }
    const hand = document.getElementById("handOverlay");
    const cursor = document.getElementById("cursorOverlay");
    if (hand) hand.style.display = "none";
    if (cursor) cursor.style.display = "none";
})();
// Isaac Daniel Cotera - 2026 | Correo: isaacdanielcotera@gmail.com | Itch.io: https://cotera.itch.io | GitHub: https://github.com/cotera2024
