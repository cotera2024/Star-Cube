
(function() {
    'use strict';

    let activeGamepadIndex = null;
    let prevButtonsState = {};
    let pauseNavIndex = 0;
    let navCooldown = 0;
    window.hasGamepad = false;

    function getConnectedGamepads() {
        if (typeof navigator === 'undefined' || !navigator.getGamepads) return [];
        try {
            const raw = navigator.getGamepads();
            return Array.from(raw || []).filter(gp => gp && gp.connected);
        } catch (e) {
            return [];
        }
    }

    function updateTouchUI() {
        const touchCtl = document.getElementById('touch-controls');
        if (!touchCtl) return;
        if (window.hasGamepad) {
            touchCtl.style.display = 'none';
        } else if (typeof window.updateTouchControlsVisibility === 'function') {
            window.updateTouchControlsVisibility();
        }
    }

    window.addEventListener('gamepadconnected', function(e) {
        activeGamepadIndex = e.gamepad.index;
        window.hasGamepad = true;
        updateTouchUI();
        try {
            if (typeof addFloatingText === 'function' && typeof game !== 'undefined' && game.player) {
                const conTxt = typeof __ === 'function' ? __('flt_mando_conectado') : 'MANDO CONECTADO';
                const name = e.gamepad.id ? e.gamepad.id.substring(0, 22) : conTxt;
                addFloatingText(game.player.x + game.player.w / 2, game.player.y - 20, name, '#38bdf8', 18);
            }
        } catch (err) {}
    });

    window.addEventListener('gamepaddisconnected', function(e) {
        if (activeGamepadIndex === e.gamepad.index) {
            activeGamepadIndex = null;
            window.hasGamepad = false;
            updateTouchUI();
            try {
                if (typeof addFloatingText === 'function' && typeof game !== 'undefined' && game.player) {
                    const disTxt = typeof __ === 'function' ? __('flt_mando_desconectado') : 'MANDO DESCONECTADO';
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 20, disTxt, '#f43f5e', 18);
                }
            } catch (err) {}
        }
    });

    function isButtonPressed(gp, btnIndex) {
        if (!gp || !gp.buttons || btnIndex >= gp.buttons.length || !gp.buttons[btnIndex]) return false;
        const b = gp.buttons[btnIndex];
        return typeof b === 'object' ? b.pressed : b > 0.5;
    }

    function triggerGamepadRumble(duration = 100, strong = 0.5, weak = 0.5) {
        const gamepads = getConnectedGamepads();
        for (let i = 0; i < gamepads.length; i++) {
            const gp = gamepads[i];
            if (!gp) continue;
            if (gp.vibrationActuator && typeof gp.vibrationActuator.playEffect === 'function') {
                try {
                    gp.vibrationActuator.playEffect('dual-rumble', {
                        startDelay: 0,
                        duration: duration,
                        weakMagnitude: weak,
                        strongMagnitude: strong
                    }).catch(function() {});
                } catch (e) {}
            } else if (gp.hapticActuators && gp.hapticActuators.length > 0 && typeof gp.hapticActuators[0].pulse === 'function') {
                try {
                    gp.hapticActuators[0].pulse(strong, duration);
                } catch (e) {}
            }
        }
    }
    window.triggerGamepadRumble = triggerGamepadRumble;

    function handleModalNavigation(actions) {
        const { up, down, left, right, jump, shoot, pause, justUp, justDown, justLeft, justRight, justJump, justShoot, justPause } = actions;

        const splashEl = document.getElementById('splash-screen');
        if (splashEl && splashEl.style.display !== 'none') {
            if (justJump || justShoot || justPause) {
                if (typeof window.dismissSplashScreen === 'function') {
                    window.dismissSplashScreen();
                } else {
                    splashEl.click();
                }
                return true;
            }
        }

        if (typeof isDialogActive !== 'undefined' && isDialogActive) {
            if (justJump || justShoot || justPause) {
                if (typeof advanceOrSkipDialogue === 'function') {
                    advanceOrSkipDialogue();
                }
                return true;
            }
        }

        const pauseModal = document.getElementById('pause-modal');
        if (pauseModal && pauseModal.classList.contains('active')) {
            const pauseBtns = Array.from(pauseModal.querySelectorAll('.pause-buttons button')).filter(b => b.style.display !== 'none');
            if (pauseBtns.length > 0) {
                if (justUp) {
                    pauseNavIndex = (pauseNavIndex - 1 + pauseBtns.length) % pauseBtns.length;
                    try { playSound(480, 0.05, "sine", 0.1); } catch (e) {}
                } else if (justDown) {
                    pauseNavIndex = (pauseNavIndex + 1) % pauseBtns.length;
                    try { playSound(480, 0.05, "sine", 0.1); } catch (e) {}
                }
                pauseNavIndex = Math.max(0, Math.min(pauseNavIndex, pauseBtns.length - 1));
                pauseBtns.forEach((btn, idx) => {
                    if (idx === pauseNavIndex) {
                        btn.style.outline = '3px solid #38bdf8';
                        btn.style.outlineOffset = '2px';
                        btn.style.transform = 'scale(1.05)';
                    } else {
                        btn.style.outline = '';
                        btn.style.outlineOffset = '';
                        btn.style.transform = '';
                    }
                });
                if (justJump || justShoot) {
                    try { playSound(720, 0.08, "square", 0.15); } catch (e) {}
                    pauseBtns[pauseNavIndex].click();
                    return true;
                }
            }
            if (justPause) {
                if (typeof window.togglePause === 'function') window.togglePause();
                return true;
            }
            return true;
        }

        const mapModal = document.getElementById('level-map-modal');
        if (mapModal && (mapModal.classList.contains('active') || (typeof gameState !== 'undefined' && gameState === 'levelmap'))) {
            const curLevel = window.selectedMapLevel || 1;
            if (justLeft && curLevel > 1) {
                if (typeof window.selectLevelNode === 'function') window.selectLevelNode(curLevel - 1);
                try { playSound(520, 0.05, "sine", 0.1); } catch (e) {}
            } else if (justRight && curLevel < 5) {
                if (typeof window.selectLevelNode === 'function') window.selectLevelNode(curLevel + 1);
                try { playSound(520, 0.05, "sine", 0.1); } catch (e) {}
            }
            if (justJump || justShoot) {
                const playBtn = document.getElementById('map-play-btn');
                if (playBtn) playBtn.click();
                return true;
            }
            if (justPause) {
                const backBtn = mapModal.querySelector('.map-back-btn');
                if (backBtn) backBtn.click();
                return true;
            }
            return true;
        }

        const optModal = document.getElementById('options-modal');
        if (optModal && optModal.classList.contains('active')) {
            if (justPause || justShoot) {
                const closeBtn = document.getElementById('close-options') || document.getElementById('close-options-btn');
                if (closeBtn) closeBtn.click();
                return true;
            }
            return true;
        }

        const defeatModal = document.getElementById('defeat-modal');
        if (defeatModal && defeatModal.classList.contains('active')) {
            if (justJump || justShoot || justPause) {
                const defBtn = document.getElementById('defeat-map-btn');
                if (defBtn) defBtn.click();
                return true;
            }
            return true;
        }

        const victoryModal = document.getElementById('victory-modal');
        if (victoryModal && victoryModal.classList.contains('active')) {
            if (justJump || justShoot || justPause) {
                const vicBtn = document.getElementById('victory-restart-btn');
                if (vicBtn) vicBtn.click();
                return true;
            }
            return true;
        }

        return false;
    }

    function pollGamepad() {
        if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
        const gamepads = getConnectedGamepads();

        let gp = null;
        if (activeGamepadIndex !== null) {
            gp = gamepads.find(g => g.index === activeGamepadIndex) || null;
        }
        if (!gp && gamepads.length > 0) {
            gp = gamepads[0];
            activeGamepadIndex = gp.index;
        }

        const hadGamepad = window.hasGamepad;
        window.hasGamepad = !!(gp && gp.connected);
        if (hadGamepad !== window.hasGamepad) {
            updateTouchUI();
        }

        if (!gp || !gp.connected) return;

        const axis0 = (gp.axes && typeof gp.axes[0] === 'number') ? gp.axes[0] : 0;
        const axis1 = (gp.axes && typeof gp.axes[1] === 'number') ? gp.axes[1] : 0;
        const axis4 = (gp.axes && typeof gp.axes[4] === 'number') ? gp.axes[4] : 0;
        const axis5 = (gp.axes && typeof gp.axes[5] === 'number') ? gp.axes[5] : 0;
        const axis6 = (gp.axes && typeof gp.axes[6] === 'number') ? gp.axes[6] : 0;
        const axis7 = (gp.axes && typeof gp.axes[7] === 'number') ? gp.axes[7] : 0;

        let povX = 0, povY = 0;
        if (gp.axes && typeof gp.axes[9] === 'number') {
            const p = gp.axes[9];
            if (p >= -1.05 && p <= 1.05) {
                if (Math.abs(p - (-1.0)) < 0.08 || Math.abs(p - 1.0) < 0.08 || Math.abs(p - (-0.714)) < 0.08) povY = -1;
                else if (Math.abs(p - 0.143) < 0.08 || Math.abs(p - (-0.143)) < 0.08 || Math.abs(p - 0.428) < 0.08) povY = 1;
                if (Math.abs(p - (-0.428)) < 0.08 || Math.abs(p - (-0.714)) < 0.08 || Math.abs(p - (-0.143)) < 0.08) povX = 1;
                else if (Math.abs(p - 0.714) < 0.08 || Math.abs(p - 1.0) < 0.08 || Math.abs(p - 0.428) < 0.08) povX = -1;
            }
        }

        const left  = isButtonPressed(gp, 14) || axis0 < -0.32 || axis4 < -0.32 || axis6 < -0.32 || povX < -0.5;
        const right = isButtonPressed(gp, 15) || axis0 > 0.32 || axis4 > 0.32 || axis6 > 0.32 || povX > 0.5;
        const up    = isButtonPressed(gp, 12) || axis1 < -0.35 || axis5 < -0.35 || axis7 < -0.35 || povY < -0.5;
        const down  = isButtonPressed(gp, 13) || axis1 > 0.35 || axis5 > 0.35 || axis7 > 0.35 || povY > 0.5;

        const jump = isButtonPressed(gp, 0) || isButtonPressed(gp, 1);

        const shoot = isButtonPressed(gp, 2) || isButtonPressed(gp, 7);

        const dash = isButtonPressed(gp, 3) || isButtonPressed(gp, 4) || isButtonPressed(gp, 5) || isButtonPressed(gp, 6);

        const pause = isButtonPressed(gp, 9) || isButtonPressed(gp, 8) || isButtonPressed(gp, 16);

        const justUp    = up && !prevButtonsState.up;
        const justDown  = down && !prevButtonsState.down;
        const justLeft  = left && !prevButtonsState.left;
        const justRight = right && !prevButtonsState.right;
        const justJump  = jump && !prevButtonsState.jump;
        const justShoot = shoot && !prevButtonsState.shoot;
        const justDash  = dash && !prevButtonsState.dash;
        const justPause = pause && !prevButtonsState.pause;

        const isMenuHandled = handleModalNavigation({
            up, down, left, right, jump, shoot, pause,
            justUp, justDown, justLeft, justRight, justJump, justShoot, justPause
        });

        if (isMenuHandled) {
            prevButtonsState = { left, right, up, down, jump, shoot, dash, pause };
            return;
        }

        if (typeof keys === 'undefined') return;

        if (left)  { keys['ArrowLeft'] = true; keys['a'] = true; }
        if (right) { keys['ArrowRight'] = true; keys['d'] = true; }
        if (up)    { keys['ArrowUp'] = true; keys['w'] = true; }
        if (down)  { keys['ArrowDown'] = true; keys['s'] = true; }
        if (jump)  { keys[' '] = true; keys['z'] = true; }
        if (shoot) { keys['x'] = true; }
        if (dash)  { keys['c'] = true; }

        if (!left  && prevButtonsState.left)  { keys['ArrowLeft'] = false; keys['a'] = false; }
        if (!right && prevButtonsState.right) { keys['ArrowRight'] = false; keys['d'] = false; }
        if (!up    && prevButtonsState.up)    { keys['ArrowUp'] = false; keys['w'] = false; }
        if (!down  && prevButtonsState.down)  { keys['ArrowDown'] = false; keys['s'] = false; }
        if (!jump  && prevButtonsState.jump)  { keys[' '] = false; keys['z'] = false; }
        if (!shoot && prevButtonsState.shoot) { keys['x'] = false; }
        if (!dash  && prevButtonsState.dash)  { keys['c'] = false; }

        if (justJump) {
            if (typeof initAudio === 'function') initAudio();
            if (typeof gameState !== 'undefined' && gameState === 'playing' && typeof game !== 'undefined' && game.player && !game.player.frozen) {
                game.player.jumpBufferTimer = Math.max(game.player.jumpBufferTimer || 0, 12);
            }
        }

        if (typeof game !== 'undefined' && game && game.player && !game.inHunt && !game.player.frozen && (typeof currentLevel !== 'undefined' && (currentLevel < 4 || currentLevel === 6 || currentLevel === 'hub'))) {
            if (justShoot) {
                game.player.charging = true;
                game.player.chargeTimer = 0;
                game.player.chargeLevel = 0;
            } else if (!shoot && prevButtonsState.shoot && game.player.charging) {
                const k = typeof keys !== 'undefined' ? keys : {};
                game.player.fireChargedShot(k);
                game.player.charging = false;
                game.player.chargeTimer = 0;
                game.player.chargeLevel = 0;
            }
        }

        if (justDash) {
            if (typeof initAudio === 'function') initAudio();
            if (typeof gameState !== 'undefined' && gameState === 'playing' && typeof game !== 'undefined' && game.player && !game.player.frozen) {
                game.player.dashBufferTimer = 30;
            }
        }

        if (justPause) {
            if (typeof window.togglePause === 'function') {
                window.togglePause();
            }
        }

        prevButtonsState = { left, right, up, down, jump, shoot, dash, pause };
    }

    window.pollGamepad = pollGamepad;
})();
