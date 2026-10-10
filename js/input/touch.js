(function() {
    "use strict";
    if (typeof document === "undefined") return;
    const isTouch = typeof window !== "undefined" && (window.matchMedia && window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window || navigator.maxTouchPoints > 0);
    window.isMobileDevice = isTouch;
    const touchCtl = document.getElementById("touch-controls");
    if (touchCtl) touchCtl.style.display = "none";
    let _lastVibe = 0;
    function triggerHaptic(type = "light") {
        const now = performance.now();
        const isPriority = type === "heavy" || type === "defeat" || type === "shoot4" || type === "damage" || type === "rock";
        if (!isPriority && now - _lastVibe < 50) return;
        _lastVibe = now;

        if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
            try {
                if (type === "light") navigator.vibrate(12);
                else if (type === "medium") navigator.vibrate(22);
                else if (type === "dash") navigator.vibrate(35);
                else if (type === "rock") navigator.vibrate([35, 20, 50]);
                else if (type === "damage") navigator.vibrate([45, 30, 85]);
                else if (type === "shoot4") navigator.vibrate([50, 30, 95]);
                else if (type === "heavy") navigator.vibrate([40, 25, 45]);
                else if (type === "defeat") navigator.vibrate([80, 40, 140, 50, 220]);
                else if (typeof type === "number" || Array.isArray(type)) navigator.vibrate(type);
            } catch (e) {}
        }

        if (typeof window.triggerGamepadRumble === "function") {
            try {
                if (type === "light") window.triggerGamepadRumble(60, 0.2, 0.3);
                else if (type === "medium") window.triggerGamepadRumble(90, 0.4, 0.5);
                else if (type === "dash") window.triggerGamepadRumble(110, 0.5, 0.6);
                else if (type === "rock") window.triggerGamepadRumble(120, 0.65, 0.55);
                else if (type === "damage") window.triggerGamepadRumble(190, 0.85, 0.65);
                else if (type === "shoot4") window.triggerGamepadRumble(170, 0.75, 0.9);
                else if (type === "heavy") window.triggerGamepadRumble(180, 0.7, 0.8);
                else if (type === "defeat") window.triggerGamepadRumble(480, 0.95, 1.0);
            } catch (e) {}
        }
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
        const isSpace = key === " " || key === "Spacebar" || code === "Space";
        const isX = key === "x" || key === "X" || code === "KeyX";
        if (typeof keys !== "undefined") {
            const inv = invActive();
            if (inv) {
                if (key === "ArrowLeft") keys["ArrowRight"] = isDown;
                else if (key === "ArrowRight") keys["ArrowLeft"] = isDown;
                else if (isSpace) keys["x"] = isDown;
                else if (isX) keys[" "] = isDown;
                else if (key === "z" || key === "Z") {}
                else keys[key] = isDown;
            } else {
                keys[key] = isDown;
            }
        }
        if (isDown) {
            if (typeof initAudio === "function") initAudio();
            if (typeof gameState !== "undefined" && gameState === "playing" && typeof game !== "undefined" && game.player && !game.player.frozen) {
                const inv = invActive();
                const isJumpKey = inv ? isX : (isSpace || key === "w" || key === "W");
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
        applyGameKey(type, key, code);
        try {
            const evt = new KeyboardEvent(type, {
                key: key,
                code: code || key,
                bubbles: true,
                cancelable: true
            });
            if (document.body) {
                document.body.dispatchEvent(evt);
            } else {
                window.dispatchEvent(evt);
            }
        } catch (e) {}
    }
    function dpadKey(d) {
        if (d === "left") return {
            key: "ArrowLeft",
            code: "ArrowLeft"
        };
        if (d === "right") return {
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
    function dirKey(d) {
        return dpadKey(d);
    }
    function shootKey() {
        return invActive() ? {
            key: " ",
            code: "Space"
        } : {
            key: "x",
            code: "KeyX"
        };
    }
    function jumpKey() {
        return invActive() ? {
            key: "x",
            code: "KeyX"
        } : {
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
    const huntZone = document.getElementById("hunt-action-zone");
    const slashHuntBtn = document.getElementById("btn-slash-hunt");
    const activeActionPointers = new Map();
    let _isJumpPressed = false;
    let _isShootPressed = false;
    let _isDashPressed = false;
    let _isEnterPressed = false;
    let _isSlashPressed = false;

    function getActionBtnAt(x, y) {
        const pad = 20;
        const dDoor = enterDoorBtn && enterDoorBtn.style.display !== "none" ? enterDoorBtn.getBoundingClientRect() : null;
        const s = shootBtnEl && shootBtnEl.style.display !== "none" ? shootBtnEl.getBoundingClientRect() : null;
        const j = jumpBtnEl && jumpBtnEl.style.display !== "none" ? jumpBtnEl.getBoundingClientRect() : null;
        const d = dashBtnEl && dashBtnEl.style.display !== "none" ? dashBtnEl.getBoundingClientRect() : null;
        const sh = slashHuntBtn && slashHuntBtn.style.display !== "none" ? slashHuntBtn.getBoundingClientRect() : null;

        if (dDoor && x >= dDoor.left - pad && x <= dDoor.right + pad && y >= dDoor.top - pad && y <= dDoor.bottom + pad) return "enter";
        if (s && x >= s.left - pad && x <= s.right + pad && y >= s.top - pad && y <= s.bottom + pad) return "shoot";
        if (j && x >= j.left - pad && x <= j.right + pad && y >= j.top - pad && y <= j.bottom + pad) return "jump";
        if (d && x >= d.left - pad && x <= d.right + pad && y >= d.top - pad && y <= d.bottom + pad) return "dash";
        if (sh && x >= sh.left - pad && x <= sh.right + pad && y >= sh.top - pad && y <= sh.bottom + pad) return "slash";
        return null;
    }

    function updateActionButtonsState() {
        const activeTypes = new Set(activeActionPointers.values());

        const wantJump = activeTypes.has("jump");
        if (wantJump !== _isJumpPressed) {
            _isJumpPressed = wantJump;
            if (jumpBtnEl) jumpBtnEl.classList.toggle("active", wantJump);
            const jk = jumpKey();
            emit(wantJump ? "keydown" : "keyup", jk.key, jk.code);
            if (wantJump) triggerHaptic("light");
        }

        const wantShoot = activeTypes.has("shoot");
        if (wantShoot !== _isShootPressed) {
            _isShootPressed = wantShoot;
            if (shootBtnEl) shootBtnEl.classList.toggle("active", wantShoot);
            const sk = shootKey();
            emit(wantShoot ? "keydown" : "keyup", sk.key, sk.code);
            if (wantShoot) {
                triggerHaptic("light");
                if (typeof game !== "undefined" && game && game.player && !game.inHunt && !game.player.frozen && (typeof currentLevel !== "undefined" && (currentLevel < 4 || currentLevel === 6 || currentLevel === "hub"))) {
                    game.player.charging = true;
                    game.player.chargeTimer = 0;
                    game.player.chargeLevel = 0;
                }
            } else {
                if (typeof game !== "undefined" && game && game.player && !game.inHunt && !game.player.frozen && (typeof currentLevel !== "undefined" && (currentLevel < 4 || currentLevel === 6 || currentLevel === "hub"))) {
                    const k = typeof keys !== "undefined" ? keys : {};
                    game.player.fireChargedShot(k);
                    game.player.charging = false;
                    game.player.chargeTimer = 0;
                    game.player.chargeLevel = 0;
                }
            }
        }

        const wantDash = activeTypes.has("dash");
        if (wantDash !== _isDashPressed) {
            _isDashPressed = wantDash;
            if (dashBtnEl) dashBtnEl.classList.toggle("active", wantDash);
            const dk = dashKey();
            emit(wantDash ? "keydown" : "keyup", dk.key, dk.code);
            if (wantDash) triggerHaptic("dash");
        }

        const wantEnter = activeTypes.has("enter");
        if (wantEnter !== _isEnterPressed) {
            _isEnterPressed = wantEnter;
            if (enterDoorBtn) enterDoorBtn.classList.toggle("active", wantEnter);
            emit(wantEnter ? "keydown" : "keyup", "ArrowUp", "ArrowUp");
            if (wantEnter) triggerHaptic("medium");
        }

        const wantSlash = activeTypes.has("slash");
        if (wantSlash !== _isSlashPressed) {
            _isSlashPressed = wantSlash;
            if (slashHuntBtn) slashHuntBtn.classList.toggle("active", wantSlash);
            emit(wantSlash ? "keydown" : "keyup", "x", "KeyX");
            if (wantSlash) triggerHaptic("medium");
        }
    }

    function attachButtonListeners(el, typeName) {
        if (!el) return;
        el.addEventListener("pointerdown", function(e) {
            e.preventDefault();
            e.stopPropagation();
            activeActionPointers.set(e.pointerId, typeName);
            try { el.setPointerCapture(e.pointerId); } catch (er) {}
            updateActionButtonsState();
        });
        el.addEventListener("pointermove", function(e) {
            if (!activeActionPointers.has(e.pointerId)) return;
            e.preventDefault();
            const btn = getActionBtnAt(e.clientX, e.clientY);
            if (btn && activeActionPointers.get(e.pointerId) !== btn) {
                activeActionPointers.set(e.pointerId, btn);
                updateActionButtonsState();
            }
        });
        function onEnd(e) {
            if (activeActionPointers.has(e.pointerId)) {
                activeActionPointers.delete(e.pointerId);
                updateActionButtonsState();
            }
        }
        el.addEventListener("pointerup", onEnd);
        el.addEventListener("pointercancel", onEnd);
    }

    attachButtonListeners(jumpBtnEl, "jump");
    attachButtonListeners(shootBtnEl, "shoot");
    attachButtonListeners(dashBtnEl, "dash");
    attachButtonListeners(enterDoorBtn, "enter");
    attachButtonListeners(slashHuntBtn, "slash");

    if (actionZone) {
        actionZone.addEventListener("pointerdown", function(e) {
            e.preventDefault();
            e.stopPropagation();
            const btn = getActionBtnAt(e.clientX, e.clientY);
            if (btn) {
                activeActionPointers.set(e.pointerId, btn);
                try { actionZone.setPointerCapture(e.pointerId); } catch (er) {}
                updateActionButtonsState();
            }
        });
        actionZone.addEventListener("pointermove", function(e) {
            if (!activeActionPointers.has(e.pointerId)) return;
            e.preventDefault();
            const btn = getActionBtnAt(e.clientX, e.clientY);
            if (activeActionPointers.get(e.pointerId) !== btn) {
                if (btn) activeActionPointers.set(e.pointerId, btn);
                else activeActionPointers.delete(e.pointerId);
                updateActionButtonsState();
            }
        });
        function onZoneEnd(e) {
            if (activeActionPointers.has(e.pointerId)) {
                activeActionPointers.delete(e.pointerId);
                updateActionButtonsState();
            }
        }
        actionZone.addEventListener("pointerup", onZoneEnd);
        actionZone.addEventListener("pointercancel", onZoneEnd);
    }

    window.addEventListener("pointerup", function(e) {
        if (dpadPointerId !== null && e.pointerId === dpadPointerId) {
            applyDpadDirections([]);
            dpadPointerId = null;
        }
        if (activeActionPointers.has(e.pointerId)) {
            activeActionPointers.delete(e.pointerId);
            updateActionButtonsState();
        }
    });
    window.addEventListener("pointercancel", function(e) {
        if (dpadPointerId !== null && e.pointerId === dpadPointerId) {
            applyDpadDirections([]);
            dpadPointerId = null;
        }
        if (activeActionPointers.has(e.pointerId)) {
            activeActionPointers.delete(e.pointerId);
            updateActionButtonsState();
        }
    });
    window.addEventListener("touchend", function(e) {
        if (e.touches && e.touches.length === 0) {
            if (dpadPointerId !== null) {
                applyDpadDirections([]);
                dpadPointerId = null;
            }
            if (activeActionPointers.size > 0) {
                activeActionPointers.clear();
                updateActionButtonsState();
            }
        }
    }, { passive: true });
    window.addEventListener("touchcancel", function(e) {
        if (e.touches && e.touches.length === 0) {
            if (dpadPointerId !== null) {
                applyDpadDirections([]);
                dpadPointerId = null;
            }
            if (activeActionPointers.size > 0) {
                activeActionPointers.clear();
                updateActionButtonsState();
            }
        }
    }, { passive: true });
    window.addEventListener("blur", function() {
        if (dpadPointerId !== null) {
            applyDpadDirections([]);
            dpadPointerId = null;
        }
        if (activeActionPointers.size > 0) {
            activeActionPointers.clear();
            updateActionButtonsState();
        }
    });
    let _lastShow = null, _lastMaxCharge = null, _lastCanEnter = null, _lastShoot = null, _lastJump = null, _lastDash = null, _lastZone = null, _lastInv = null;
    function updateTouchControlsState() {
        if (!touchCtl) return;
        const shouldShow = isTouch && !window.hasGamepad && (typeof gameState !== "undefined" && (gameState === "playing" || gameState === "hub" || gameState === "caceria"));
        if (_lastShow !== shouldShow) {
            _lastShow = shouldShow;
            touchCtl.style.display = shouldShow ? "block" : "none";
        }
        if (!shouldShow) return;
        const inHunt = typeof game !== "undefined" && (game.inHunt || game.lvl4State === "hunt");
        const isLevel6Dark = typeof currentLevel !== "undefined" && currentLevel === 4;

        const canEnter = !!window.canEnterDoor;
        if (enterDoorBtn) {
            const showEnter = canEnter && !isLevel6Dark && !inHunt;
            if (_lastCanEnter !== showEnter) {
                _lastCanEnter = showEnter;
                enterDoorBtn.style.display = showEnter ? "flex" : "none";
            }
        }
        if (shootBtnEl) {
            const isHubLevel = typeof game !== "undefined" && (game.isHub || currentLevel === "hub");
            const showShoot = !(canEnter || isHubLevel || isLevel6Dark || inHunt);
            if (_lastShoot !== showShoot) {
                _lastShoot = showShoot;
                shootBtnEl.style.display = showShoot ? "flex" : "none";
            }
        }
        if (jumpBtnEl) {
            const showJump = !inHunt;
            if (_lastJump !== showJump) {
                _lastJump = showJump;
                jumpBtnEl.style.display = showJump ? "flex" : "none";
            }
        }
        if (dashBtnEl) {
            const showDash = !inHunt;
            if (_lastDash !== showDash) {
                _lastDash = showDash;
                dashBtnEl.style.display = showDash ? "flex" : "none";
            }
        }
        if (actionZone && huntZone) {
            const zoneMode = inHunt ? "hunt" : isLevel6Dark ? "dark" : "normal";
            if (_lastZone !== zoneMode) {
                _lastZone = zoneMode;
                if (zoneMode === "hunt") {
                    actionZone.style.display = "none";
                    huntZone.style.display = "block";
                } else if (zoneMode === "dark") {
                    actionZone.style.display = "none";
                    huntZone.style.display = "none";
                } else {
                    actionZone.style.display = "block";
                    huntZone.style.display = "none";
                }
            }
        }
        const inv = typeof game !== "undefined" && !!game.invertControls && typeof currentLevel !== "undefined" && currentLevel === 1;
        if (_lastInv !== inv) {
            _lastInv = inv;
            touchCtl.classList.toggle("inverted-hands", inv);
        }
    }
    window.updateTouchControlsState = updateTouchControlsState;
    const canvas = document.getElementById("gameCanvas");
    if (canvas) {
        canvas.addEventListener("pointerup", function(e) {
            if (e.pointerType === "mouse") return;
            e.preventDefault();
            try {
                if (typeof isDialogActive !== "undefined" && isDialogActive) {
                    const locked = typeof techDialogLock !== "undefined" && techDialogLock;
                    const isTech = typeof currentLevel !== "undefined" && currentLevel === 1 && typeof game !== "undefined" && game.techBoss && (game.techBoss.state === "fighting" || game.techBoss.state === "intro_boot" || game.techBoss.state === "intro_dialog" || game.techBoss.state === "presentation" || game.techBoss.state === "defeated");
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
