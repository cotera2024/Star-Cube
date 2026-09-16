


(function() {
    'use strict';

    let activeGamepadIndex = null;
    let prevButtonsState = {};
    window.hasGamepad = false;

    window.addEventListener('gamepadconnected', function(e) {
        activeGamepadIndex = e.gamepad.index;
        window.hasGamepad = true;
        updateTouchUI();
        try {
            if (typeof addFloatingText === 'function' && typeof game !== 'undefined' && game.player) {
                addFloatingText(game.player.x + game.player.w / 2, game.player.y - 20, '🎮 ' + (e.gamepad.id ? e.gamepad.id.substring(0, 20) : 'MANDO CONECTADO'), '#38bdf8', 18);
            }
        } catch (err) {}
    });

    window.addEventListener('gamepaddisconnected', function(e) {
        if (activeGamepadIndex === e.gamepad.index) {
            activeGamepadIndex = null;
            window.hasGamepad = false;
            updateTouchUI();
        }
    });

    function updateTouchUI() {
        const touchCtl = document.getElementById('touch-controls');
        if (!touchCtl) return;
        if (window.hasGamepad) {
            touchCtl.style.display = 'none';
        } else if (typeof window.updateTouchControlsVisibility === 'function') {
            window.updateTouchControlsVisibility();
        }
    }

    function isButtonPressed(gp, btnIndex) {
        if (!gp || !gp.buttons || !gp.buttons[btnIndex]) return false;
        const b = gp.buttons[btnIndex];
        return typeof b === 'object' ? b.pressed : b > 0.5;
    }

    function triggerGamepadRumble(duration = 100, strong = 0.5, weak = 0.5) {
        if (activeGamepadIndex === null || typeof navigator === 'undefined' || !navigator.getGamepads) return;
        const gamepads = navigator.getGamepads();
        const gp = gamepads ? gamepads[activeGamepadIndex] : null;
        if (gp && gp.vibrationActuator && typeof gp.vibrationActuator.playEffect === 'function') {
            try {
                gp.vibrationActuator.playEffect('dual-rumble', {
                    startDelay: 0,
                    duration: duration,
                    weakMagnitude: weak,
                    strongMagnitude: strong
                }).catch(function() {});
            } catch (e) {}
        }
    }
    window.triggerGamepadRumble = triggerGamepadRumble;

    function pollGamepad() {
        if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
        const gamepads = navigator.getGamepads();
        if (!gamepads) return;

        let gp = null;
        if (activeGamepadIndex !== null && gamepads[activeGamepadIndex] && gamepads[activeGamepadIndex].connected) {
            gp = gamepads[activeGamepadIndex];
        } else {
            for (let i = 0; i < gamepads.length; i++) {
                if (gamepads[i] && gamepads[i].connected) {
                    gp = gamepads[i];
                    activeGamepadIndex = i;
                    break;
                }
            }
        }

        const hadGamepad = window.hasGamepad;
        window.hasGamepad = !!(gp && gp.connected);
        if (hadGamepad !== window.hasGamepad) {
            updateTouchUI();
        }

        if (!gp || !gp.connected || typeof keys === 'undefined') return;

        const axisX = gp.axes && gp.axes[0] !== undefined ? gp.axes[0] : 0;
        const axisY = gp.axes && gp.axes[1] !== undefined ? gp.axes[1] : 0;

        
        const left  = isButtonPressed(gp, 14) || axisX < -0.32;
        const right = isButtonPressed(gp, 15) || axisX > 0.32;
        const up    = isButtonPressed(gp, 12) || axisY < -0.4;
        const down  = isButtonPressed(gp, 13) || axisY > 0.4;

        
        const jump = isButtonPressed(gp, 0) || isButtonPressed(gp, 1);

        
        const shoot = isButtonPressed(gp, 2);

        
        const dash = isButtonPressed(gp, 3) || isButtonPressed(gp, 4) || isButtonPressed(gp, 5) || isButtonPressed(gp, 6) || isButtonPressed(gp, 7);

        
        const pause = isButtonPressed(gp, 9);

        
        if (left) { keys['ArrowLeft'] = true; keys['a'] = true; }
        if (right) { keys['ArrowRight'] = true; keys['d'] = true; }
        if (up) { keys['ArrowUp'] = true; keys['w'] = true; }
        if (down) { keys['ArrowDown'] = true; keys['s'] = true; }
        if (jump) { keys[' '] = true; keys['z'] = true; }
        if (shoot) { keys['x'] = true; }
        if (dash) { keys['c'] = true; }

        
        if (!left && (prevButtonsState.left)) { keys['ArrowLeft'] = false; keys['a'] = false; }
        if (!right && (prevButtonsState.right)) { keys['ArrowRight'] = false; keys['d'] = false; }
        if (!up && (prevButtonsState.up)) { keys['ArrowUp'] = false; keys['w'] = false; }
        if (!down && (prevButtonsState.down)) { keys['ArrowDown'] = false; keys['s'] = false; }
        if (!jump && (prevButtonsState.jump)) { keys[' '] = false; keys['z'] = false; }
        if (!shoot && (prevButtonsState.shoot)) { keys['x'] = false; }
        if (!dash && (prevButtonsState.dash)) { keys['c'] = false; }

        
        if (jump && !prevButtonsState.jump) {
            if (typeof initAudio === 'function') initAudio();
            if (typeof isDialogActive !== 'undefined' && isDialogActive) {
                if (typeof advanceOrSkipDialogue === 'function') advanceOrSkipDialogue();
            }
            if (typeof gameState !== 'undefined' && gameState === 'playing' && typeof game !== 'undefined' && game.player && !game.player.frozen) {
                game.player.jumpBufferTimer = Math.max(game.player.jumpBufferTimer || 0, 12);
            }
        }

        
        if (dash && !prevButtonsState.dash) {
            if (typeof initAudio === 'function') initAudio();
            if (typeof gameState !== 'undefined' && gameState === 'playing' && typeof game !== 'undefined' && game.player && !game.player.frozen) {
                game.player.dashBufferTimer = 30;
            }
        }

        
        if (pause && !prevButtonsState.pause) {
            if (typeof window.togglePause === 'function') {
                window.togglePause();
            }
        }

        prevButtonsState = {
            left: left,
            right: right,
            up: up,
            down: down,
            jump: jump,
            shoot: shoot,
            dash: dash,
            pause: pause
        };
    }

    window.pollGamepad = pollGamepad;
})();
