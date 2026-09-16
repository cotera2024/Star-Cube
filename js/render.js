window.getMessageDiv = () => document.getElementById("message");

window.getChoiceDiv = () => document.getElementById("choice");

window.getBlackoutDiv = () => document.getElementById("blackout");

window.getCursorDiv = () => document.getElementById("cursorOverlay");

window.getHandDiv = () => document.getElementById("handOverlay");

window.getGameTitle = () => document.getElementById("game-title");

const _playerGradCache = { key: null, grad: null };

function drawEntityBase(ctx, x, y, w, h, scaleX, scaleY, color, isPlayer, facing, isScared) {
    const cx = x + w / 2;
    const cy = y + h;
    ctx.save();
    let shakeX = isScared ? (Math.random() - .5) * 6 : 0;
    let shakeY = isScared ? (Math.random() - .5) * 6 : 0;
    ctx.translate(cx + shakeX, cy + shakeY);
    ctx.scale(scaleX, scaleY);
    ctx.fillStyle = window.postGameHorror && !isPlayer ? "#27272a" : color;
    ctx.beginPath();
    if (currentLevel >= 2) {
        ctx.rect(-w / 2, -h, w, h);
    } else {
        ctx.roundRect(-w / 2, -h, w, h, 8);
    }
    ctx.fill();
    if (isPlayer) {
        ctx.fillStyle = currentLevel >= 2 ? "#ff0000" : "#fff";
        ctx.fillRect(-w / 2 + (facing === 1 ? 16 : 4), -h + 10, 10, 12);
        ctx.fillStyle = currentLevel >= 2 ? "#000" : "#000";
        ctx.fillRect(-w / 2 + (facing === 1 ? 20 : 4), -h + 14, 6, 6);
    } else {
        if (window.postGameHorror) {
            ctx.fillStyle = "#000";
            ctx.fillRect(-w / 2 + 6, -h + 8, 8, 8);
            ctx.fillRect(-w / 2 + 20, -h + 8, 8, 8);
            ctx.fillStyle = "#ff0000";
            ctx.fillRect(-w / 2 + 8, -h + 10, 2, 2);
            ctx.fillRect(-w / 2 + 22, -h + 10, 2, 2);
        } else {
            ctx.fillStyle = currentLevel >= 2 ? "#f00" : "#fff";
            ctx.fillRect(-w / 2 + 6, -h + 8, 8, 8);
            ctx.fillRect(-w / 2 + 20, -h + 8, 8, 8);
            ctx.fillStyle = "#000";
            ctx.fillRect(-w / 2 + 8, -h + 10, 4, 4);
            ctx.fillRect(-w / 2 + 22, -h + 10, 4, 4);
        }
    }
    ctx.restore();
}

function drawPlayerEnhanced(ctx, x, y, w, h, facing, scaleX, scaleY, color, invulnerable, trail, scared, playerRef) {
    const cx = x + w / 2;
    const cy = y + h;
    ctx.save();
    const currentHp = playerRef ? playerRef.health : 100;
    const isLavaBouncing = playerRef && playerRef.lavaBounceTimer > 0;
    const isHurt = invulnerable > 0 || isLavaBouncing;
    const isCharging = playerRef && playerRef.charging;
    const isJumping = playerRef && (playerRef.state === "jump" || playerRef.state === "fall");
    const isRunning = playerRef && playerRef.state === "run";
    const isLowHp = currentHp < 30;
    const isHalfHp = currentHp >= 30 && currentHp < 50;
    const isMidHp = currentHp >= 50 && currentHp <= 70;
    const chargeLvl = playerRef ? playerRef.chargeLevel || 0 : 0;
    const isDashing = playerRef && playerRef.dashTimer > 0;
    const idleBreath = window.postGameHorror || isRunning || isJumping || isDashing ? 0 : Math.sin(time * .12) * .03;
    const runTilt = window.postGameHorror ? 0 : isRunning ? facing * .08 : isJumping ? facing * .04 : 0;
    const finalScaleX = scaleX * (1 + idleBreath);
    const finalScaleY = scaleY * (1 - idleBreath);
    ctx.translate(cx, y + h / 2);
    ctx.rotate(runTilt);
    ctx.scale(finalScaleX, finalScaleY);
    ctx.translate(-cx, -(y + h / 2));
    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    ctx.beginPath();
    ctx.ellipse(cx, y + h + 2, w * .44, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    const _gradKey = `${currentLevel}|${game && game.iceMode}|${x}|${y}|${h}`;
    if (_playerGradCache.key !== _gradKey) {
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        if (window.postGameHorror) {
            grad.addColorStop(0, "#3f3f46");
            grad.addColorStop(.5, "#27272a");
            grad.addColorStop(1, "#09090b");
        } else if (currentLevel === 0) {
            grad.addColorStop(0, game.iceMode ? "#99e5ff" : "#ff99cc");
            grad.addColorStop(1, game.iceMode ? "#0088cc" : "#ff3388");
        } else if (currentLevel === 1) {
            grad.addColorStop(0, "#80d8ff");
            grad.addColorStop(1, "#0055b3");
        } else if (currentLevel === 4) {
            grad.addColorStop(0, "#e11d48");
            grad.addColorStop(.45, "#9f1239");
            grad.addColorStop(1, "#4c0519");
        } else {
            grad.addColorStop(0, "#ff6666");
            grad.addColorStop(1, "#cc0000");
        }
        _playerGradCache.key = _gradKey;
        _playerGradCache.grad = grad;
    }
    ctx.fillStyle = _playerGradCache.grad;

    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = "rgba(255, 255, 255, 0.48)";
    ctx.beginPath();
    ctx.ellipse(x + w * .35, y + 6, w * .28, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    if (!window.postGameHorror) {
        const cheekY = y + h * .52;
        const cheekGlow = isCharging ? .8 : isJumping ? .6 : isHalfHp ? .65 : .45;
        ctx.fillStyle = `rgba(255, 102, 170, ${cheekGlow})`;
        ctx.beginPath();
        ctx.ellipse(x + w * .2, cheekY, 3.5, 2, 0, 0, Math.PI * 2);
        ctx.ellipse(x + w * .8, cheekY, 3.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    const afkState = window.postGameHorror || !playerRef ? null : playerRef.afkState || null;
    const eyeY = y + h * .36;
    const lookX = facing * 2.8;
    const lookY = isJumping ? playerRef.vy < 0 ? -1.5 : 1.5 : 0;
    const isFrozen = playerRef && playerRef.paralyzeTimer > 0;
    const isBlinking = !isFrozen && !isHurt && !isCharging && !isJumping && !afkState && Math.sin(time * .05) > .96;
    if (window.postGameHorror) {
        ctx.fillStyle = "#050000";
        ctx.beginPath();
        ctx.arc(x + w * .3, eyeY, 6.5, 0, Math.PI * 2);
        ctx.arc(x + w * .7, eyeY, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x + w * .3, eyeY, 2.5, 0, Math.PI * 2);
        ctx.arc(x + w * .7, eyeY, 2.5, 0, Math.PI * 2);
        ctx.fill();
    } else if (isFrozen) {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x + w * .3, eyeY, 6.5, 0, Math.PI * 2);
        ctx.arc(x + w * .7, eyeY, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#111111";
        ctx.beginPath();
        ctx.arc(x + w * .3, eyeY, 2, 0, Math.PI * 2);
        ctx.arc(x + w * .7, eyeY, 2, 0, Math.PI * 2);
        ctx.fill();
    } else if (isLavaBouncing) {
        ctx.strokeStyle = "#ff1100";
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(x + w * .16, eyeY - 5);
        ctx.lineTo(x + w * .36, eyeY);
        ctx.lineTo(x + w * .16, eyeY + 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w * .84, eyeY - 5);
        ctx.lineTo(x + w * .64, eyeY);
        ctx.lineTo(x + w * .84, eyeY + 5);
        ctx.stroke();
        ctx.fillStyle = "#00ffff";
        ctx.beginPath();
        ctx.arc(x + (facing === 1 ? -4 : w + 4), eyeY - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + (facing === 1 ? w + 6 : -6), eyeY + 3, 2, 0, Math.PI * 2);
        ctx.fill();
    } else if (isHurt) {
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(x + w * .18, eyeY - 4);
        ctx.lineTo(x + w * .35, eyeY);
        ctx.lineTo(x + w * .18, eyeY + 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w * .82, eyeY - 4);
        ctx.lineTo(x + w * .65, eyeY);
        ctx.lineTo(x + w * .82, eyeY + 4);
        ctx.stroke();
    } else if (afkState === 1) {
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(x + w * .3, eyeY, 4.5, .1 * Math.PI, .9 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + w * .7, eyeY, 4.5, .1 * Math.PI, .9 * Math.PI);
        ctx.stroke();
        ctx.strokeStyle = "#ff0055";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(cx, y + 5, w * .44, Math.PI, 0);
        ctx.stroke();
        ctx.fillStyle = "#00ffff";
        ctx.beginPath();
        ctx.roundRect(x - 5, y + 10, 6, 14, 3);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(x + w - 1, y + 10, 6, 14, 3);
        ctx.fill();
    } else if (afkState === 2) {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x + w * .3, eyeY, 6, 0, Math.PI * 2);
        ctx.arc(x + w * .7, eyeY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ff0055";
        ctx.shadowColor = "#ff0055";
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(x + w * .3 + lookX * .5, eyeY, 3, 0, Math.PI * 2);
        ctx.arc(x + w * .7 + lookX * .5, eyeY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x + w * .25, eyeY - 1.5, 1.3, 0, Math.PI * 2);
        ctx.arc(x + w * .65, eyeY - 1.5, 1.3, 0, Math.PI * 2);
        ctx.fill();
        const bubbleX = cx + (facing === 1 ? 22 : -22);
        const bubbleY = y - 36;
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.beginPath();
        ctx.arc(cx + (facing === 1 ? 8 : -8), y - 10, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + (facing === 1 ? 14 : -14), y - 20, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.font = "18px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🍰", bubbleX, bubbleY + 1);
    } else if (afkState === 3) {
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(x + w * .2, eyeY);
        ctx.lineTo(x + w * .4, eyeY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w * .6, eyeY);
        ctx.lineTo(x + w * .8, eyeY);
        ctx.stroke();
    } else if (afkState === 4) {
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(x + w * .18, eyeY);
        ctx.lineTo(x + w * .38, eyeY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w * .62, eyeY);
        ctx.lineTo(x + w * .82, eyeY);
        ctx.stroke();
    } else if (isBlinking) {
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(x + w * .3, eyeY, 4, .1 * Math.PI, .9 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + w * .7, eyeY, 4, .1 * Math.PI, .9 * Math.PI);
        ctx.stroke();
    } else if (isCharging) {
        const eyeCol = chargeLvl === 4 ? "#ff0055" : chargeLvl >= 2 ? "#00ffff" : "#ffea00";
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x + w * .3, eyeY, 5.8, 0, Math.PI * 2);
        ctx.arc(x + w * .7, eyeY, 5.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = eyeCol;
        ctx.shadowColor = eyeCol;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(x + w * .3 + lookX, eyeY + lookY, 3.2, 0, Math.PI * 2);
        ctx.arc(x + w * .7 + lookX, eyeY + lookY, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x + w * .26 + lookX, eyeY - 1.5, 1.2, 0, Math.PI * 2);
        ctx.arc(x + w * .66 + lookX, eyeY - 1.5, 1.2, 0, Math.PI * 2);
        ctx.fill();
    } else if (isJumping) {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x + w * .3, eyeY - 1, 6.2, 0, Math.PI * 2);
        ctx.arc(x + w * .7, eyeY - 1, 6.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#111111";
        ctx.beginPath();
        ctx.arc(x + w * .3 + lookX, eyeY - 1 + lookY, 3.2, 0, Math.PI * 2);
        ctx.arc(x + w * .7 + lookX, eyeY - 1 + lookY, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x + w * .24 + lookX, eyeY - 3, 1.3, 0, Math.PI * 2);
        ctx.arc(x + w * .64 + lookX, eyeY - 3, 1.3, 0, Math.PI * 2);
        ctx.fill();
    } else if (isLowHp) {
        const wobbleX = Math.sin(time * .2) * 2;
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + w * .3 + wobbleX, eyeY, 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + w * .7 + wobbleX, eyeY, 4, 0, Math.PI * 2);
        ctx.stroke();
    } else if (isHalfHp) {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x + w * .3, eyeY, 5.5, 0, Math.PI * 2);
        ctx.arc(x + w * .7, eyeY, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#111111";
        ctx.beginPath();
        ctx.arc(x + w * .3 + lookX, eyeY + lookY + .5, 2.7, 0, Math.PI * 2);
        ctx.arc(x + w * .7 + lookX, eyeY + lookY + .5, 2.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x + w * .25 + lookX, eyeY - 1.6, 1.5, 0, Math.PI * 2);
        ctx.arc(x + w * .65 + lookX, eyeY - 1.6, 1.5, 0, Math.PI * 2);
        ctx.fill();
        const tearY = eyeY + 4.5 + Math.sin(time * .2) * .8;
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(x + w * .2 + (facing === 1 ? 0 : -1.5), tearY, 2, 0, Math.PI * 2);
        ctx.fill();
    } else if (isMidHp) {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x + w * .3, eyeY, 5, 0, Math.PI * 2);
        ctx.arc(x + w * .7, eyeY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#111111";
        ctx.beginPath();
        ctx.arc(x + w * .3 + lookX * .8, eyeY + lookY + .3, 2.9, 0, Math.PI * 2);
        ctx.arc(x + w * .7 + lookX * .8, eyeY + lookY + .3, 2.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x + w * .26 + lookX * .8, eyeY - 1.4, 1.2, 0, Math.PI * 2);
        ctx.arc(x + w * .66 + lookX * .8, eyeY - 1.4, 1.2, 0, Math.PI * 2);
        ctx.fill();
    } else if (playerRef && (playerRef.scared || currentLevel === 4 && (game.lvl4State === "stalk_left" || game.lvl4State === "falling" || game.lvl4State === "dark_chase"))) {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x + w * .3, eyeY, 6.5, 0, Math.PI * 2);
        ctx.arc(x + w * .7, eyeY, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0f172a";
        const panicX = (Math.random() - .5) * 1.5;
        const panicY = (Math.random() - .5) * 1.5;
        ctx.beginPath();
        ctx.arc(x + w * .3 + lookX * .4 + panicX, eyeY + lookY + panicY, 2.2, 0, Math.PI * 2);
        ctx.arc(x + w * .7 + lookX * .4 + panicX, eyeY + lookY + panicY, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(x + (facing === 1 ? w * .88 : w * .12), eyeY - 6, 2.2, 0, Math.PI * 2);
        ctx.fill();
    } else if (currentLevel === 4 && game.inHunt) {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x + w * .3, eyeY, 5.4, 0, Math.PI * 2);
        ctx.arc(x + w * .7, eyeY, 5.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1e1b4b";
        ctx.beginPath();
        ctx.arc(x + w * .3 + lookX, eyeY + lookY, 2.8, 0, Math.PI * 2);
        ctx.arc(x + w * .7 + lookX, eyeY + lookY, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(x + w * .3 + lookX, eyeY + lookY, 1.2, 0, Math.PI * 2);
        ctx.arc(x + w * .7 + lookX, eyeY + lookY, 1.2, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x + w * .3, eyeY, 5.2, 0, Math.PI * 2);
        ctx.arc(x + w * .7, eyeY, 5.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#111111";
        ctx.beginPath();
        ctx.arc(x + w * .3 + lookX, eyeY + lookY, 2.8, 0, Math.PI * 2);
        ctx.arc(x + w * .7 + lookX, eyeY + lookY, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x + w * .25 + lookX, eyeY - 1.6, 1.3, 0, Math.PI * 2);
        ctx.arc(x + w * .65 + lookX, eyeY - 1.6, 1.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + w * .33 + lookX, eyeY + 1.2, .7, 0, Math.PI * 2);
        ctx.arc(x + w * .73 + lookX, eyeY + 1.2, .7, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 1.8;
    if (window.postGameHorror) {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(x + w * .16, eyeY - 8);
        ctx.lineTo(x + w * .36, eyeY - 11);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w * .84, eyeY - 8);
        ctx.lineTo(x + w * .64, eyeY - 11);
        ctx.stroke();
    } else if (isFrozen) {
        ctx.beginPath();
        ctx.moveTo(x + w * .16, eyeY - 8);
        ctx.lineTo(x + w * .36, eyeY - 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w * .84, eyeY - 8);
        ctx.lineTo(x + w * .64, eyeY - 10);
        ctx.stroke();
    } else if (isHurt) {
        ctx.beginPath();
        ctx.moveTo(x + w * .18, eyeY - 8);
        ctx.lineTo(x + w * .35, eyeY - 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w * .82, eyeY - 8);
        ctx.lineTo(x + w * .65, eyeY - 6);
        ctx.stroke();
    } else if (afkState === 4) {
        ctx.beginPath();
        ctx.moveTo(x + w * .18, eyeY - 7);
        ctx.lineTo(x + w * .38, eyeY - 7);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w * .62, eyeY - 7);
        ctx.lineTo(x + w * .82, eyeY - 7);
        ctx.stroke();
    } else if (isCharging) {
        const browTilt = chargeLvl * 1.5;
        ctx.beginPath();
        ctx.moveTo(x + w * .18, eyeY - 7 + browTilt);
        ctx.lineTo(x + w * .36, eyeY - 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w * .82, eyeY - 7 + browTilt);
        ctx.lineTo(x + w * .64, eyeY - 5);
        ctx.stroke();
    } else if (isJumping) {
        ctx.beginPath();
        ctx.arc(x + w * .3, eyeY - 7, 3, 1.1 * Math.PI, 1.9 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + w * .7, eyeY - 7, 3, 1.1 * Math.PI, 1.9 * Math.PI);
        ctx.stroke();
    } else if (isMidHp) {
        ctx.beginPath();
        ctx.moveTo(x + w * .18, eyeY - 8);
        ctx.lineTo(x + w * .36, eyeY - 5.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w * .82, eyeY - 8);
        ctx.lineTo(x + w * .64, eyeY - 5.5);
        ctx.stroke();
    } else if (isHalfHp) {
        ctx.beginPath();
        ctx.moveTo(x + w * .18, eyeY - 5.5);
        ctx.lineTo(x + w * .36, eyeY - 8.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w * .82, eyeY - 5.5);
        ctx.lineTo(x + w * .64, eyeY - 8.5);
        ctx.stroke();
    } else if (playerRef && (playerRef.scared || currentLevel === 4 && (game.lvl4State === "stalk_left" || game.lvl4State === "falling" || game.lvl4State === "dark_chase"))) {
        ctx.beginPath();
        ctx.moveTo(x + w * .16, eyeY - 6);
        ctx.lineTo(x + w * .36, eyeY - 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w * .84, eyeY - 6);
        ctx.lineTo(x + w * .64, eyeY - 10);
        ctx.stroke();
    } else if (currentLevel === 4 && game.inHunt) {
        ctx.beginPath();
        ctx.moveTo(x + w * .18, eyeY - 8);
        ctx.lineTo(x + w * .36, eyeY - 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w * .82, eyeY - 8);
        ctx.lineTo(x + w * .64, eyeY - 6);
        ctx.stroke();
    } else if (!isBlinking) {
        ctx.beginPath();
        ctx.moveTo(x + w * .2, eyeY - 7);
        ctx.lineTo(x + w * .36, eyeY - 7);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w * .64, eyeY - 7);
        ctx.lineTo(x + w * .8, eyeY - 7);
        ctx.stroke();
    }
    const mouthY = y + h * .66;
    if (window.postGameHorror) {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(cx - 6, mouthY);
        ctx.lineTo(cx + 6, mouthY);
        ctx.stroke();
        for (let s = -4; s <= 4; s += 2.5) {
            ctx.beginPath();
            ctx.moveTo(cx + s, mouthY - 2.5);
            ctx.lineTo(cx + s, mouthY + 2.5);
            ctx.stroke();
        }
    } else if (isFrozen) {
        ctx.fillStyle = "#111111";
        ctx.beginPath();
        ctx.ellipse(cx, mouthY + 1, 4.5, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.ellipse(cx, mouthY + 3.5, 2.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (isLavaBouncing) {
        ctx.fillStyle = "#111111";
        ctx.beginPath();
        ctx.ellipse(cx, mouthY + 2, 5.5, 7.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ff2200";
        ctx.beginPath();
        ctx.ellipse(cx, mouthY + 5, 3.5, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (isHurt) {
        ctx.fillStyle = "#111111";
        ctx.beginPath();
        ctx.ellipse(cx, mouthY, 3.5, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#00ffff";
        ctx.beginPath();
        ctx.arc(x + w * .15, eyeY + 4, 2, 0, Math.PI * 2);
        ctx.fill();
    } else if (afkState === 1) {
        ctx.fillStyle = "#111111";
        ctx.beginPath();
        ctx.ellipse(cx, mouthY, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (afkState === 2) {
        ctx.fillStyle = "#111111";
        ctx.beginPath();
        ctx.arc(cx, mouthY - 1, 5.5, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = "#ff6688";
        ctx.beginPath();
        ctx.arc(cx, mouthY + 1.5, 2.5, 0, Math.PI);
        ctx.fill();
    } else if (afkState === 3) {
        const sleepMouthR = 2.5 + Math.sin(time * .12) * 1.5;
        ctx.fillStyle = "#111111";
        ctx.beginPath();
        ctx.arc(cx, mouthY, sleepMouthR, 0, Math.PI * 2);
        ctx.fill();
    } else if (afkState === 4) {
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(cx - 5, mouthY);
        ctx.lineTo(cx + 5, mouthY);
        ctx.stroke();
    } else if (isCharging) {
        if (chargeLvl === 4) {
            ctx.fillStyle = "#111111";
            ctx.fillRect(cx - 6, mouthY - 3, 12, 5);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(cx - 4, mouthY - 2, 8, 3);
        } else {
            ctx.fillStyle = "#111111";
            ctx.fillRect(cx - 5, mouthY - 2, 10, 4);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(cx - 3, mouthY - 1, 6, 2);
        }
    } else if (isJumping) {
        ctx.fillStyle = "#111111";
        ctx.beginPath();
        ctx.arc(cx, mouthY - 1, 5.5, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = "#ff6688";
        ctx.beginPath();
        ctx.arc(cx, mouthY + 1.5, 2.5, 0, Math.PI);
        ctx.fill();
    } else if (isLowHp) {
        const sweatY = y + 8 + Math.sin(time * .2) * 3;
        ctx.fillStyle = "#00ffff";
        ctx.beginPath();
        ctx.arc(x + w - 4, sweatY, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + w - 4, sweatY - 2);
        ctx.lineTo(x + w - 6.5, sweatY + 1);
        ctx.lineTo(x + w - 1.5, sweatY + 1);
        ctx.fill();
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(cx, mouthY + 2, 4.5, 1.1 * Math.PI, 1.9 * Math.PI);
        ctx.stroke();
    } else if (isHalfHp) {
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(cx, mouthY + 3.5, 4.8, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();
    } else if (isMidHp) {
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(cx - 4.5, mouthY);
        ctx.lineTo(cx + 4.5, mouthY);
        ctx.stroke();
    } else if (playerRef && (playerRef.scared || currentLevel === 4 && (game.lvl4State === "stalk_left" || game.lvl4State === "falling" || game.lvl4State === "dark_chase"))) {
        ctx.fillStyle = "#111111";
        ctx.beginPath();
        ctx.ellipse(cx, mouthY, 4, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (currentLevel === 4 && game.inHunt) {
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(cx - 5, mouthY);
        ctx.lineTo(cx + 5, mouthY);
        ctx.stroke();
    } else if (isRunning) {
        if (currentLevel === 4) {
            ctx.strokeStyle = "#111111";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(cx - 4.5, mouthY);
            ctx.lineTo(cx + 4.5, mouthY);
            ctx.stroke();
        } else {
            ctx.strokeStyle = "#111111";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.arc(cx, mouthY - 2, 5.5, .1 * Math.PI, .9 * Math.PI);
            ctx.stroke();
        }
    } else {
        if (currentLevel === 4) {
            ctx.strokeStyle = "#111111";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(cx - 4, mouthY);
            ctx.lineTo(cx + 4, mouthY);
            ctx.stroke();
        } else {
            ctx.strokeStyle = "#111111";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.arc(cx, mouthY - 1, 4.8, .12 * Math.PI, .88 * Math.PI);
            ctx.stroke();
        }
    }
    if (isLavaBouncing) {
        ctx.save();
        const flameTime = typeof time !== "undefined" ? time : 0;
        for (let f = 0; f < 5; f++) {
            const fx = x + f / 4 * w;
            const wave = Math.sin(flameTime * .45 + f * 1.6);
            const flameH = 15 + wave * 7;
            const fy = y + h - 1;
            ctx.fillStyle = f % 2 === 0 ? "#ff2200" : "#ff7700";
            ctx.beginPath();
            ctx.moveTo(fx - 5, fy);
            ctx.quadraticCurveTo(fx + wave * 4, fy - flameH, fx, fy - flameH - 4);
            ctx.quadraticCurveTo(fx + 5 + wave * 2, fy - flameH * .5, fx + 5, fy);
            ctx.fill();
            ctx.fillStyle = "#ffea00";
            ctx.beginPath();
            ctx.moveTo(fx - 2.5, fy);
            ctx.quadraticCurveTo(fx + wave * 2, fy - flameH * .6, fx, fy - flameH * .7);
            ctx.quadraticCurveTo(fx + 2.5, fy - flameH * .3, fx + 2.5, fy);
            ctx.fill();
        }
        ctx.fillStyle = "rgba(70, 50, 50, 0.65)";
        const smY = y - 4 + Math.sin(flameTime * .25) * 3;
        ctx.beginPath();
        ctx.arc(cx + Math.sin(flameTime * .35) * 4, smY, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    if (isCharging) {
        const handX = cx + (facing === 1 ? w * .65 : -w * .65);
        const handY = y + h * .55;
        ctx.save();
        if (chargeLvl === 1) {
            ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
            ctx.lineWidth = 4;
            ctx.strokeRect(x - 3, y - 3, w + 6, h + 6);
            ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
            ctx.lineWidth = 1.8;
            ctx.strokeRect(x - 2, y - 2, w + 4, h + 4);
        } else if (chargeLvl === 2) {
            ctx.strokeStyle = "rgba(0, 255, 255, 0.35)";
            ctx.lineWidth = 5;
            ctx.strokeRect(x - 4, y - 4, w + 8, h + 8);
            ctx.strokeStyle = "rgba(0, 255, 255, 0.95)";
            ctx.lineWidth = 2.2;
            ctx.strokeRect(x - 3, y - 3, w + 6, h + 6);
            if (Math.random() < .6) {
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(x + Math.random() * w, y);
                ctx.lineTo(handX, handY);
                ctx.stroke();
            }
        } else if (chargeLvl === 3) {
            ctx.strokeStyle = "rgba(255, 215, 0, 0.35)";
            ctx.lineWidth = 6;
            ctx.strokeRect(x - 5, y - 5, w + 10, h + 10);
            ctx.strokeStyle = "rgba(255, 215, 0, 0.95)";
            ctx.lineWidth = 2.8;
            ctx.strokeRect(x - 4, y - 4, w + 8, h + 8);
            for (let k = 0; k < 3; k++) {
                const lx = x + (k + 1) * (w / 4);
                const ly = y + h + 2;
                ctx.strokeStyle = "rgba(255, 215, 0, 0.7)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(lx, ly);
                ctx.lineTo(lx + (Math.random() - .5) * 6, y - 10);
                ctx.stroke();
            }
        } else if (chargeLvl === 4) {
            ctx.strokeStyle = "rgba(255, 0, 85, 0.4)";
            ctx.lineWidth = 7;
            ctx.strokeRect(x - 6, y - 6, w + 12, h + 12);
            ctx.strokeStyle = "rgba(255, 0, 85, 0.95)";
            ctx.lineWidth = 3.2;
            ctx.strokeRect(x - 5, y - 5, w + 10, h + 10);
            ctx.strokeStyle = "rgba(0, 255, 255, 0.4)";
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.ellipse(cx, y + h + 4, w * .8, 6, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = "#00ffff";
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.ellipse(cx, y + h + 4, w * .8, 6, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            for (let k = 0; k < 4; k++) {
                const lx = x + Math.random() * w;
                ctx.beginPath();
                ctx.moveTo(lx, y + h + 4);
                ctx.lineTo(lx + (Math.random() - .5) * 8, y - 18);
                ctx.stroke();
            }
        }
        ctx.restore();
        if (chargeLvl === 1) {
            const r1 = 8 + Math.sin(time * .3) * 1.5;
            const g1 = ctx.createRadialGradient(handX, handY, 2, handX, handY, r1 * 2);
            g1.addColorStop(0, "#ffffff");
            g1.addColorStop(.4, "#38bdf8");
            g1.addColorStop(1, "rgba(56, 189, 248, 0)");
            ctx.fillStyle = g1;
            ctx.beginPath();
            ctx.arc(handX, handY, r1 * 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.save();
            ctx.translate(handX, handY);
            ctx.rotate(time * .15);
            ctx.strokeStyle = "#bae6fd";
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.ellipse(0, 0, r1 * 1.4, r1 * .6, .4, 0, Math.PI * 2);
            ctx.stroke();
            for (let k = 0; k < 3; k++) {
                const ang = time * .2 + k * (Math.PI * 2 / 3);
                const ox = Math.cos(ang) * (r1 * 1.4);
                const oy = Math.sin(ang) * (r1 * .6);
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(ox, oy, 1.8, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(handX, handY, r1 * .6, 0, Math.PI * 2);
            ctx.fill();
        } else if (chargeLvl === 2) {
            const r2 = 12 + Math.sin(time * .4) * 2;
            const g2 = ctx.createRadialGradient(handX, handY, 2, handX, handY, r2 * 2.2);
            g2.addColorStop(0, "#ffffff");
            g2.addColorStop(.35, "#00ffff");
            g2.addColorStop(.75, "rgba(2, 132, 199, 0.7)");
            g2.addColorStop(1, "rgba(0, 255, 255, 0)");
            ctx.fillStyle = g2;
            ctx.beginPath();
            ctx.arc(handX, handY, r2 * 2.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.save();
            ctx.translate(handX, handY);
            ctx.rotate(time * .2);
            ctx.strokeStyle = "rgba(0, 255, 255, 0.4)";
            ctx.lineWidth = 4.5;
            ctx.beginPath();
            ctx.ellipse(0, 0, r2 * 1.5, r2 * .7, .2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = "#00ffff";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.ellipse(0, 0, r2 * 1.5, r2 * .7, .2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.8;
            for (let k = 0; k < 4; k++) {
                const ang = time * .3 + k * (Math.PI / 2);
                const rx = handX + Math.cos(ang) * (r2 * 1.6);
                const ry = handY + Math.sin(ang) * (r2 * 1.6);
                ctx.beginPath();
                ctx.moveTo(rx, ry);
                ctx.lineTo(handX, handY);
                ctx.stroke();
            }
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(handX, handY, r2 * .65, 0, Math.PI * 2);
            ctx.fill();
        } else if (chargeLvl === 3) {
            const r3 = 16 + Math.sin(time * .45) * 2.5;
            const g3 = ctx.createRadialGradient(handX, handY, 2, handX, handY, r3 * 2.4);
            g3.addColorStop(0, "#ffffff");
            g3.addColorStop(.3, "#ffd700");
            g3.addColorStop(.7, "rgba(255, 107, 0, 0.8)");
            g3.addColorStop(1, "rgba(255, 215, 0, 0)");
            ctx.fillStyle = g3;
            ctx.beginPath();
            ctx.arc(handX, handY, r3 * 2.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.save();
            ctx.translate(handX, handY);
            ctx.rotate(time * .22);
            ctx.strokeStyle = "rgba(255, 215, 0, 0.4)";
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.ellipse(0, 0, r3 * 1.5, r3 * .65, time * .1, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = "#ffd700";
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.ellipse(0, 0, r3 * 1.5, r3 * .65, time * .1, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = "rgba(255, 107, 0, 0.4)";
            ctx.lineWidth = 4.5;
            ctx.beginPath();
            ctx.ellipse(0, 0, r3 * .65, r3 * 1.5, -time * .1, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = "#ff6b00";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, 0, r3 * .65, r3 * 1.5, -time * .1, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
            const sWave = time * 1.5 % 30;
            ctx.strokeStyle = "rgba(255, 215, 0, " + (1 - sWave / 30) * .7 + ")";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(handX, handY, r3 + sWave * 1.2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(handX, handY, r3 * .7, 0, Math.PI * 2);
            ctx.fill();
        } else if (chargeLvl === 4) {
            const r4 = 20 + Math.sin(time * .55) * 3.5;
            ctx.strokeStyle = "rgba(0, 255, 255, 0.85)";
            ctx.lineWidth = 2.5;
            for (let k = 0; k < 7; k++) {
                const ang = time * .4 + k * Math.PI / 3.5;
                const dist = 38 + (Math.random() - .5) * 10;
                const rx = handX + Math.cos(ang) * dist;
                const ry = handY + Math.sin(ang) * dist;
                ctx.beginPath();
                ctx.moveTo(rx, ry);
                ctx.lineTo(handX + (Math.random() - .5) * 8, handY + (Math.random() - .5) * 8);
                ctx.stroke();
            }
            ctx.save();
            ctx.translate(handX, handY);
            ctx.rotate(time * .25);
            ctx.strokeStyle = "rgba(255, 0, 85, 0.4)";
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.ellipse(0, 0, r4 * 1.6, r4 * .7, time * .12, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = "#ff0055";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(0, 0, r4 * 1.6, r4 * .7, time * .12, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = "rgba(0, 255, 255, 0.4)";
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.ellipse(0, 0, r4 * .7, r4 * 1.6, -time * .12, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = "#00ffff";
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.ellipse(0, 0, r4 * .7, r4 * 1.6, -time * .12, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = "#ffd700";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.ellipse(0, 0, r4 * 1.3, r4 * 1.3, time * .2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
            const g4 = ctx.createRadialGradient(handX, handY, 3, handX, handY, r4 * 2.6);
            g4.addColorStop(0, "#ffffff");
            g4.addColorStop(.25, "#ff0055");
            g4.addColorStop(.6, "rgba(0, 255, 255, 0.85)");
            g4.addColorStop(.85, "rgba(255, 215, 0, 0.5)");
            g4.addColorStop(1, "rgba(255, 0, 85, 0)");
            ctx.fillStyle = g4;
            ctx.beginPath();
            ctx.arc(handX, handY, r4 * 2.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(handX, handY, r4 * .75, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2.5;
            const starArm = r4 * 1.8;
            ctx.beginPath();
            ctx.moveTo(handX - starArm, handY);
            ctx.lineTo(handX + starArm, handY);
            ctx.moveTo(handX, handY - starArm);
            ctx.lineTo(handX, handY + starArm);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
    }
    if (currentLevel === 1) {
        ctx.fillStyle = "#ffcc00";
        ctx.fillRect(x + 4, y + 2, w - 8, 4);
    }
    if (playerRef && playerRef.dashMax && playerRef.dashTimer > 0) {
        ctx.save();
        {
            const ps = typeof window.PerfQuality !== "undefined" && window.PerfQuality ? window.PerfQuality.pixelScale : 1;
            const s = typeof ps === "number" && ps > 0 ? ps : 1;
            ctx.setTransform(s, 0, 0, s, 0, 0);
        }
        const dir = playerRef.dashDir || facing;
        const px = x + w / 2;
        const py = y + h / 2;
        const jitterX = (Math.random() - .5) * 3.5;
        const jitterY = (Math.random() - .5) * 3.5;
        const cx = px + jitterX;
        const cy = py + jitterY;
        const pulse = 1 + .16 * Math.sin(time * .85) + (Math.random() - .5) * .08;
        const rad = Math.max(w, h) * .62 * pulse;
        const ghostColors = [ "#ff00e0", "#00ffff", "#a855f7", "#ffd700" ];
        for (let ai = 3; ai >= 1; ai--) {
            const ghostX = cx - dir * (ai * 28);
            const ghostY = cy;
            const ghostAlpha = .42 - ai * .1;
            ctx.save();
            ctx.globalAlpha = Math.max(.08, ghostAlpha);
            ctx.fillStyle = ghostColors[ai % ghostColors.length];
            ctx.shadowColor = ghostColors[ai % ghostColors.length];
            ctx.shadowBlur = 16;
            ctx.beginPath();
            ctx.ellipse(ghostX, ghostY, w * .52 * (1 - ai * .1), h * .52 * (1 - ai * .1), 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        ctx.save();
        for (let sl = 0; sl < 10; sl++) {
            const sOffset = (Math.random() - .5) * (h * 2.2);
            const lineY = cy + sOffset;
            const lineLen = 50 + Math.random() * 80;
            const lineX = cx - dir * (Math.random() * 60 + 5);
            const sGrad = ctx.createLinearGradient(lineX, lineY, lineX - dir * lineLen, lineY);
            sGrad.addColorStop(0, "rgba(255, 255, 255, 0.85)");
            sGrad.addColorStop(.3, sl % 2 === 0 ? "rgba(0, 255, 255, 0.75)" : "rgba(255, 0, 224, 0.75)");
            sGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.strokeStyle = sGrad;
            ctx.lineWidth = 1.6 + Math.random() * 1.8;
            ctx.beginPath();
            ctx.moveTo(lineX, lineY);
            ctx.lineTo(lineX - dir * lineLen, lineY);
            ctx.stroke();
        }
        ctx.restore();
        const tailLen = 95;
        const tailColors = [ "#ff00e0", "#00ffff", "#ffffff", "#ffd700" ];
        for (let i = 15; i >= 0; i--) {
            const t = i / 15;
            const tx = cx - dir * tailLen * t + (Math.random() - .5) * 4;
            const ty = cy + (Math.random() - .5) * 5;
            const rTail = rad * (1 - t * .55);
            const col = tailColors[i % 4];
            ctx.globalAlpha = (1 - t) * .65;
            ctx.fillStyle = col;
            ctx.shadowColor = col;
            ctx.shadowBlur = 22 * (1 - t);
            ctx.beginPath();
            ctx.arc(tx, ty, Math.max(1, rTail), 0, Math.PI * 2);
            ctx.fill();
            if (i % 3 === 0) {
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2 * (1 - t);
                ctx.beginPath();
                ctx.moveTo(tx, ty);
                ctx.lineTo(tx - dir * 14 + (Math.random() - .5) * 16, ty + (Math.random() - .5) * 22);
                ctx.stroke();
            }
        }
        ctx.save();
        for (let r = 0; r < 3; r++) {
            const ringDist = (time * 36 + r * 28) % 80;
            const ringX = cx - dir * ringDist;
            const ringAlpha = 1 - ringDist / 80;
            ctx.strokeStyle = r % 2 === 0 ? "#00ffff" : "#ffd700";
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 14;
            ctx.lineWidth = 2.4;
            ctx.globalAlpha = ringAlpha * .75;
            ctx.beginPath();
            ctx.ellipse(ringX, cy, 8, rad * 1.35, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
        let plasmaGrad = ctx.createRadialGradient(cx, cy, rad * .2, cx, cy, rad * 2.6);
        plasmaGrad.addColorStop(0, "rgba(255, 0, 224, 0.95)");
        plasmaGrad.addColorStop(.35, "rgba(0, 255, 255, 0.85)");
        plasmaGrad.addColorStop(.7, "rgba(255, 215, 0, 0.45)");
        plasmaGrad.addColorStop(1, "rgba(255, 0, 224, 0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = plasmaGrad;
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 38;
        ctx.beginPath();
        ctx.arc(cx, cy, rad * 2.6, 0, Math.PI * 2);
        ctx.fill();
        let innerGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, rad * 1.45);
        innerGrad.addColorStop(0, "#ffffff");
        innerGrad.addColorStop(.35, "#00ffff");
        innerGrad.addColorStop(.75, "#ff00e0");
        innerGrad.addColorStop(1, "rgba(255, 0, 224, 0)");
        ctx.fillStyle = innerGrad;
        ctx.shadowColor = "#ff00e0";
        ctx.shadowBlur = 28;
        ctx.beginPath();
        ctx.arc(cx, cy, rad * 1.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 22;
        ctx.beginPath();
        ctx.arc(cx, cy, rad * .78, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        const noseX = cx + dir * (rad * .95);
        for (let m = 0; m < 3; m++) {
            const coneOffset = m * 15;
            const coneSpread = rad * (1.2 + m * .45);
            const coneBack = 32 + m * 18;
            const mX = noseX - dir * coneOffset;
            ctx.strokeStyle = m === 0 ? "#ffffff" : m === 1 ? "#00ffff" : "#ff00e0";
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 18 - m * 4;
            ctx.lineWidth = 3 - m * .8;
            ctx.globalAlpha = .85 - m * .22;
            ctx.beginPath();
            ctx.moveTo(mX - dir * coneBack, cy - coneSpread);
            ctx.quadraticCurveTo(mX + dir * 14, cy, mX - dir * coneBack, cy + coneSpread);
            ctx.stroke();
        }
        ctx.restore();
        ctx.shadowBlur = 18;
        const arcColors = [ "#ffffff", "#00ffff", "#ffd700", "#ff00e0" ];
        for (let a = 0; a < 6; a++) {
            const angle = Math.random() * Math.PI * 2;
            const dist1 = rad * (.5 + Math.random() * .3);
            const dist2 = rad * (1.5 + Math.random() * .85);
            const x1 = cx + Math.cos(angle) * dist1;
            const y1 = cy + Math.sin(angle) * dist1;
            const midX = cx + Math.cos(angle + (Math.random() - .5) * .5) * ((dist1 + dist2) / 2) + (Math.random() - .5) * 14;
            const midY = cy + Math.sin(angle + (Math.random() - .5) * .5) * ((dist1 + dist2) / 2) + (Math.random() - .5) * 14;
            const x2 = cx + Math.cos(angle) * dist2;
            const y2 = cy + Math.sin(angle) * dist2;
            ctx.strokeStyle = arcColors[a % 4];
            ctx.shadowColor = arcColors[a % 4];
            ctx.lineWidth = 1.8 + Math.random() * 1.6;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(midX, midY);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.restore();
    }
    if (playerRef && playerRef.paralyzeTimer > 0) {
        ctx.save();
        const pcx = x + w / 2;
        const pcy = y + h / 2;
        const iceW = w + 36;
        const iceH = h + 36;
        ctx.fillStyle = "rgba(186, 230, 253, 0.55)";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(pcx - iceW / 2, pcy - iceH / 2, iceW, iceH, 8);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(pcx - iceW / 2 + 4, pcy - iceH / 2 + 6);
        ctx.lineTo(pcx + iceW / 2 - 8, pcy + iceH / 2 - 6);
        ctx.moveTo(pcx + iceW / 2 - 6, pcy - iceH / 2 + 8);
        ctx.lineTo(pcx - iceW / 2 + 8, pcy + iceH / 2 - 4);
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(pcx - iceW / 2 + 6, pcy - iceH / 2 + 6, 2.5, 0, Math.PI * 2);
        ctx.fill();
        for (let s = 0; s < 4; s++) {
            const sAng = time * .08 + s * (Math.PI / 2);
            const sDist = Math.max(iceW, iceH) * .65;
            const sx = pcx + Math.cos(sAng) * sDist;
            const sy = pcy + Math.sin(sAng) * sDist;
            ctx.fillStyle = "#e0f2fe";
            ctx.beginPath();
            ctx.arc(sx, sy, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
    ctx.restore();
}

function drawHorrorEnemyOverlay(ctx, cx, cy, w, h, facing, lookX, lookY) {
    if (!window.postGameHorror) return;
    ctx.save();
    const radX = Math.max(10, w * .42);
    const radY = Math.max(10, h * .42);
    ctx.strokeStyle = "#d4d4d8";
    ctx.lineWidth = 1.6;
    for (let r = -1; r <= 1; r++) {
        const ry = cy + r * (radY * .35);
        ctx.beginPath();
        ctx.moveTo(cx - radX * .65, ry);
        ctx.quadraticCurveTo(cx - radX * .15, ry + 2, cx - 2, ry - 1);
        ctx.moveTo(cx + radX * .65, ry);
        ctx.quadraticCurveTo(cx + radX * .15, ry + 2, cx + 2, ry - 1);
        ctx.stroke();
    }
    const eyeSpacing = Math.min(14, radX * .55);
    const eyeY = cy - radY * .25;
    const eyeR = Math.max(4, Math.min(9, radX * .38));
    for (let s of [ -1, 1 ]) {
        const ex = cx + s * eyeSpacing;
        ctx.fillStyle = "#050505";
        ctx.beginPath();
        ctx.arc(ex, eyeY, eyeR + 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath();
        ctx.arc(ex, eyeY, eyeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = .9;
        ctx.beginPath();
        ctx.moveTo(ex - s * (eyeR - 1), eyeY - 2);
        ctx.lineTo(ex - s * 2, eyeY);
        ctx.stroke();
        ctx.fillStyle = "#990000";
        ctx.beginPath();
        ctx.arc(ex + lookX * .3, eyeY + lookY * .3, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(ex + lookX * .3, eyeY + lookY * .3, .9, 0, Math.PI * 2);
        ctx.fill();
    }
    const mouthY = cy + radY * .35;
    const mouthW = Math.max(10, radX * .9);
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.ellipse(cx, mouthY, mouthW / 2, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e4e4e7";
    const teeth = 4;
    const step = mouthW / (teeth + 1);
    for (let t = 1; t <= teeth; t++) {
        const tx = cx - mouthW / 2 + t * step;
        ctx.beginPath();
        ctx.moveTo(tx - 2, mouthY - 4);
        ctx.lineTo(tx, mouthY + 3);
        ctx.lineTo(tx + 2, mouthY - 4);
        ctx.closePath();
        ctx.fill();
    }
    ctx.fillStyle = "#991b1b";
    ctx.fillRect(cx - 3, mouthY + 5, 2, 4);
    ctx.fillRect(cx + 3, mouthY + 4, 2, 5);
    ctx.restore();
}

function drawEnemyEnhanced(ctx, x, y, w, h, color, facing, scaleX, scaleY, health, maxHealth, type, mouthOpen = 0, blinkTimer = 0, isFire = false, enemyObj = null) {
    ctx.save();
    if (window.postGameHorror) {
        color = "#3f3f46";
    }
    const cx = x + w / 2;
    const cy = y + h / 2;
    const isBlinking = blinkTimer < 0;
    const isFiringMouth = mouthOpen > 0;
    const playerX = game.player ? game.player.x + game.player.w / 2 : cx;
    const playerY = game.player ? game.player.y + game.player.h / 2 : cy;
    const pAngle = Math.atan2(playerY - cy, playerX - cx);
    const lookX = Math.cos(pAngle) * 3;
    const lookY = Math.sin(pAngle) * 2;
    if (type === "fire_spawner") {
        ctx.restore();
        return;
    }
    if (type === "podoboo") {
        ctx.translate(cx, cy);
        ctx.scale(scaleX, scaleY);
        ctx.fillStyle = "#ffff00";
        ctx.shadowColor = "#ffaa00";
        ctx.shadowBlur = 10 + Math.sin(time * .2) * 5;
        ctx.beginPath();
        ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-w / 2, 0);
        ctx.quadraticCurveTo(0, -h, w / 2, 0);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(-5 + lookX, -2 + lookY, 3, 0, Math.PI * 2);
        ctx.arc(5 + lookX, -2 + lookY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
    }
    if (type === "electric_cross") {
        const patrolAngle = enemyObj && enemyObj.patrolAngle || 0;
        const numBalls = enemyObj ? enemyObj.numBalls || 4 : 4;
        const arms = 4;
        const spacing = 32;
        ctx.shadowColor = "#00e5ff";
        ctx.shadowBlur = 15;
        ctx.fillStyle = "#111";
        ctx.beginPath();
        ctx.arc(cx, cy, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#00e5ff";
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();
        for (let a = 0; a < arms; a++) {
            const angle = patrolAngle + Math.PI / 2 * a;
            for (let b = 1; b <= numBalls; b++) {
                const bx = cx + Math.cos(angle) * b * spacing;
                const by = cy + Math.sin(angle) * b * spacing;
                ctx.fillStyle = "#fff";
                ctx.beginPath();
                ctx.arc(bx, by, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "rgba(0, 229, 255, 0.6)";
                ctx.beginPath();
                ctx.arc(bx, by, 12, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.shadowBlur = 0;
        ctx.restore();
        return;
    }
    if (type === "pumpkin" || type === "crow" || type === "witch" || type === "hooded" || type === "ghost") {
        ctx.translate(cx, cy);
        ctx.scale(scaleX, scaleY);
        ctx.translate(-cx, -cy);
        if (type === "pumpkin" && window.HalloweenSystem) {
            window.HalloweenSystem.drawPumpkinEnemy(ctx, x, y, w, h, facing, mouthOpen, enemyObj && enemyObj.enraged, time);
            ctx.restore();
            return;
        } else if (type === "crow" && window.HalloweenSystem) {
            window.HalloweenSystem.drawCrowEnemy(ctx, x, y, w, h, facing, enemyObj && enemyObj.diveState === "diving", time);
            ctx.restore();
            return;
        } else if (type === "witch" && window.HalloweenSystem) {
            window.HalloweenSystem.drawWitchEnemy(ctx, x, y, w, h, facing, time);
            ctx.restore();
            return;
        } else if (type === "hooded" && window.HalloweenSystem) {
            window.HalloweenSystem.drawHoodedEnemy(ctx, x, y, w, h, facing, time);
            ctx.restore();
            return;
        } else if (type === "ghost" && window.HalloweenSystem) {
            window.HalloweenSystem.drawGhostEnemy(ctx, x, y, w, h, facing, enemyObj && enemyObj.ghostState === "dashing", enemyObj ? enemyObj.ghostTimer : 0, time);
            ctx.restore();
            return;
        }
    }
    if (type === "bubble_tree") {
        ctx.translate(cx, cy);
        ctx.scale(scaleX, scaleY);
        ctx.translate(-cx, -cy);
        const dir = facing || 1;
        const isFiring = isFiringMouth;
        const isAggressive = enemyObj && (enemyObj.isAggressive || enemyObj.isGiant) || w >= 90;
        const scaleF = Math.max(1, w / 48);
        ctx.fillStyle = "rgba(15, 23, 42, 0.4)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + h / 2 - 2, w * .46, 6 * scaleF, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isAggressive ? "#271005" : "#451a03";
        ctx.beginPath();
        ctx.moveTo(cx - 16 * scaleF, cy + h / 2 - 2);
        ctx.lineTo(cx - 24 * scaleF, cy + h / 2);
        ctx.lineTo(cx - 10 * scaleF, cy + h / 2);
        ctx.moveTo(cx + 16 * scaleF, cy + h / 2 - 2);
        ctx.lineTo(cx + 24 * scaleF, cy + h / 2);
        ctx.lineTo(cx + 10 * scaleF, cy + h / 2);
        if (isAggressive) {
            ctx.moveTo(cx - 6 * scaleF, cy + h / 2 - 4);
            ctx.lineTo(cx - 12 * scaleF, cy + h / 2);
            ctx.moveTo(cx + 6 * scaleF, cy + h / 2 - 4);
            ctx.lineTo(cx + 12 * scaleF, cy + h / 2);
        }
        ctx.fill();
        const trunkW = 20 * scaleF;
        const trunkH = 34 * scaleF;
        const trunkY = cy + 4 * scaleF;
        const tGrad = ctx.createLinearGradient(cx - trunkW / 2, trunkY, cx + trunkW / 2, trunkY);
        if (isAggressive) {
            tGrad.addColorStop(0, "#381604");
            tGrad.addColorStop(.4, "#542308");
            tGrad.addColorStop(1, "#250d02");
        } else {
            tGrad.addColorStop(0, "#592911");
            tGrad.addColorStop(.4, "#78350f");
            tGrad.addColorStop(1, "#451a03");
        }
        ctx.fillStyle = tGrad;
        ctx.beginPath();
        ctx.roundRect(cx - trunkW / 2, trunkY - trunkH / 2, trunkW, trunkH, 6 * scaleF);
        ctx.fill();
        ctx.strokeStyle = isAggressive ? "rgba(30, 10, 2, 0.7)" : "rgba(69, 26, 3, 0.5)";
        ctx.lineWidth = 1.6 * scaleF;
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scaleF, trunkY - 10 * scaleF);
        ctx.lineTo(cx - 4 * scaleF, trunkY + 8 * scaleF);
        ctx.moveTo(cx + 4 * scaleF, trunkY - 6 * scaleF);
        ctx.lineTo(cx + 4 * scaleF, trunkY + 12 * scaleF);
        if (isAggressive) {
            ctx.moveTo(cx - 8 * scaleF, trunkY - 4 * scaleF);
            ctx.lineTo(cx - 7 * scaleF, trunkY + 6 * scaleF);
            ctx.moveTo(cx + 8 * scaleF, trunkY - 2 * scaleF);
            ctx.lineTo(cx + 7 * scaleF, trunkY + 8 * scaleF);
        }
        ctx.stroke();
        if (isAggressive) {
            ctx.fillStyle = "#381604";
            ctx.beginPath();
            ctx.moveTo(cx - 14 * scaleF, cy - 14 * scaleF);
            ctx.lineTo(cx - 28 * scaleF, cy - 28 * scaleF);
            ctx.lineTo(cx - 18 * scaleF, cy - 18 * scaleF);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(cx + 14 * scaleF, cy - 14 * scaleF);
            ctx.lineTo(cx + 28 * scaleF, cy - 28 * scaleF);
            ctx.lineTo(cx + 18 * scaleF, cy - 18 * scaleF);
            ctx.closePath();
            ctx.fill();
        }
        const foliageY = cy - 14 * scaleF;
        ctx.fillStyle = isAggressive ? "#0f4c24" : "#15803d";
        ctx.beginPath();
        ctx.arc(cx - 14 * scaleF, foliageY + 2 * scaleF, 16 * scaleF, 0, Math.PI * 2);
        ctx.arc(cx + 14 * scaleF, foliageY + 2 * scaleF, 16 * scaleF, 0, Math.PI * 2);
        ctx.fill();
        const fGrad = ctx.createRadialGradient(cx - 4 * scaleF, foliageY - 8 * scaleF, 2 * scaleF, cx, foliageY, 24 * scaleF);
        if (isAggressive) {
            fGrad.addColorStop(0, "#22c55e");
            fGrad.addColorStop(.55, "#15803d");
            fGrad.addColorStop(1, "#052e16");
        } else {
            fGrad.addColorStop(0, "#4ade80");
            fGrad.addColorStop(.55, "#22c55e");
            fGrad.addColorStop(1, "#166534");
        }
        ctx.fillStyle = fGrad;
        ctx.beginPath();
        ctx.arc(cx, foliageY - 4 * scaleF, 20 * scaleF, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isAggressive ? "#b91c1c" : "#ef4444";
        ctx.beginPath();
        ctx.arc(cx - 10 * scaleF, foliageY - 12 * scaleF, 3.5 * scaleF, 0, Math.PI * 2);
        ctx.arc(cx + 11 * scaleF, foliageY - 10 * scaleF, 3.5 * scaleF, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scaleF, foliageY - 18 * scaleF, 3.5 * scaleF, 0, Math.PI * 2);
        ctx.fill();
        const faceY = trunkY - 2 * scaleF;
        const eyeLX = cx - 5 * scaleF + lookX * .3 * scaleF;
        const eyeRX = cx + 5 * scaleF + lookX * .3 * scaleF;
        const eyeY = faceY - 2 * scaleF + lookY * .3 * scaleF;
        if (isAggressive) {
            ctx.strokeStyle = "#1a0802";
            ctx.lineWidth = 3.2 * scaleF;
            ctx.beginPath();
            ctx.moveTo(cx - 9 * scaleF, eyeY - 4 * scaleF);
            ctx.lineTo(cx - 2 * scaleF, eyeY);
            ctx.moveTo(cx + 9 * scaleF, eyeY - 4 * scaleF);
            ctx.lineTo(cx + 2 * scaleF, eyeY);
            ctx.stroke();
            if (!isBlinking) {
                ctx.fillStyle = "#ffcc00";
                ctx.shadowColor = "#ff3300";
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.ellipse(eyeLX, eyeY + 1 * scaleF, 3.8 * scaleF, 2.8 * scaleF, -.2, 0, Math.PI * 2);
                ctx.ellipse(eyeRX, eyeY + 1 * scaleF, 3.8 * scaleF, 2.8 * scaleF, .2, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = "#990000";
                ctx.fillRect(eyeLX - 1 * scaleF + lookX * .2, eyeY - 1.5 * scaleF, 2 * scaleF, 4.5 * scaleF);
                ctx.fillRect(eyeRX - 1 * scaleF + lookX * .2, eyeY - 1.5 * scaleF, 2 * scaleF, 4.5 * scaleF);
            }
            const mouthY = faceY + 7 * scaleF;
            ctx.fillStyle = "#0f0502";
            ctx.beginPath();
            if (isFiring) {
                ctx.ellipse(cx + dir * 3 * scaleF, mouthY, 7 * scaleF, 8 * scaleF, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "rgba(14, 165, 233, 0.85)";
                ctx.shadowColor = "#00ffff";
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(cx + dir * 10 * scaleF, mouthY, 8 * scaleF, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else {
                ctx.ellipse(cx, mouthY, 6 * scaleF, 3.5 * scaleF, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#e2d9cc";
                ctx.beginPath();
                ctx.moveTo(cx - 3 * scaleF, mouthY - 3 * scaleF);
                ctx.lineTo(cx - 1.5 * scaleF, mouthY + 1 * scaleF);
                ctx.lineTo(cx, mouthY - 3 * scaleF);
                ctx.moveTo(cx + 1 * scaleF, mouthY - 3 * scaleF);
                ctx.lineTo(cx + 2.5 * scaleF, mouthY + 1 * scaleF);
                ctx.lineTo(cx + 4 * scaleF, mouthY - 3 * scaleF);
                ctx.fill();
            }
        } else {
            if (!isBlinking) {
                ctx.fillStyle = "#1e1b4b";
                ctx.beginPath();
                ctx.arc(eyeLX, eyeY, 2.8, 0, Math.PI * 2);
                ctx.arc(eyeRX, eyeY, 2.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(eyeLX - .7, eyeY - .7, 1, 0, Math.PI * 2);
                ctx.arc(eyeRX - .7, eyeY - .7, 1, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = "rgba(244, 114, 182, 0.6)";
            ctx.beginPath();
            ctx.arc(cx - 7, faceY + 4, 2.5, 0, Math.PI * 2);
            ctx.arc(cx + 7, faceY + 4, 2.5, 0, Math.PI * 2);
            ctx.fill();
            const mouthY = faceY + 5;
            ctx.fillStyle = "#1e1b4b";
            ctx.beginPath();
            if (isFiring) {
                ctx.ellipse(cx + dir * 2, mouthY, 4, 5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "rgba(56, 189, 248, 0.75)";
                ctx.beginPath();
                ctx.arc(cx + dir * 6, mouthY, 4.5, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.ellipse(cx, mouthY, 2.5, 1.8, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        drawHorrorEnemyOverlay(ctx, cx, trunkY - 2 * scaleF, w, h, dir, lookX, lookY);
        ctx.restore();
        return;
    }
    if (type === "apple") {
        ctx.translate(cx, cy);
        ctx.scale(scaleX, scaleY);
        ctx.translate(-cx, -cy);
        const dir = facing || 1;
        const isFiring = isFiringMouth;
        ctx.fillStyle = "rgba(15, 23, 42, 0.32)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + h / 2 - 2, w * .44, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        const legY = cy + h / 2 - 4;
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.arc(cx - 7, legY, 3, 0, Math.PI * 2);
        ctx.arc(cx + 7, legY, 3, 0, Math.PI * 2);
        ctx.fill();
        const aRad = w * .45;
        const aGrad = ctx.createRadialGradient(cx - dir * 4, cy - 4, 2, cx, cy, aRad);
        aGrad.addColorStop(0, "#f87171");
        aGrad.addColorStop(.55, "#ef4444");
        aGrad.addColorStop(1, "#991b1b");
        ctx.fillStyle = aGrad;
        ctx.beginPath();
        ctx.arc(cx - 6, cy, aRad * .88, 0, Math.PI * 2);
        ctx.arc(cx + 6, cy, aRad * .88, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.beginPath();
        ctx.ellipse(cx - dir * 6, cy - 7, 5, 2.5, -.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#5a3d28";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(cx, cy - aRad * .8);
        ctx.quadraticCurveTo(cx + dir * 3, cy - aRad - 6, cx + dir * 6, cy - aRad - 7);
        ctx.stroke();
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.ellipse(cx + dir * 5, cy - aRad - 5, 5, 2.5, .4, 0, Math.PI * 2);
        ctx.fill();
        const eyeLX = cx - 5 + lookX * .3;
        const eyeRX = cx + 5 + lookX * .3;
        const eyeY = cy - 1 + lookY * .3;
        if (!isBlinking) {
            ctx.fillStyle = "#1e1b4b";
            ctx.beginPath();
            ctx.arc(eyeLX, eyeY, 2.8, 0, Math.PI * 2);
            ctx.arc(eyeRX, eyeY, 2.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(eyeLX - .7, eyeY - .7, 1, 0, Math.PI * 2);
            ctx.arc(eyeRX - .7, eyeY - .7, 1, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = "rgba(254, 202, 202, 0.7)";
        ctx.beginPath();
        ctx.arc(cx - 9, cy + 5, 3, 0, Math.PI * 2);
        ctx.arc(cx + 9, cy + 5, 3, 0, Math.PI * 2);
        ctx.fill();
        const mouthY = cy + 6;
        ctx.fillStyle = "#1e1b4b";
        ctx.beginPath();
        if (isFiring) {
            ctx.ellipse(cx + dir * 3, mouthY, 4.5, 5.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fbbf24";
            ctx.beginPath();
            ctx.arc(cx + dir * 3, mouthY, 3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.arc(cx, mouthY, 3.2, 0, Math.PI);
            ctx.fill();
        }
        drawHorrorEnemyOverlay(ctx, cx, cy, w, h, dir, lookX, lookY);
        ctx.restore();
        return;
    }
    if (type === "bubble_puffer") {
        ctx.translate(cx, cy);
        ctx.scale(scaleX, scaleY);
        ctx.translate(-cx, -cy);
        const dir = facing || 1;
        const isFiring = isFiringMouth;
        ctx.fillStyle = "rgba(15, 23, 42, 0.32)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + h / 2 - 2, w * .48, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        const pRad = w * .46;
        const pGrad = ctx.createRadialGradient(cx - dir * 5, cy - 5, 3, cx, cy, pRad);
        pGrad.addColorStop(0, "#bae6fd");
        pGrad.addColorStop(.5, "#38bdf8");
        pGrad.addColorStop(1, "#0284c7");
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, pRad, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#7dd3fc";
        ctx.beginPath();
        const finWave = Math.sin(time * .25) * 2;
        ctx.ellipse(cx - dir * (pRad - 2), cy + 4, 7, 4 + finWave, -.4, 0, Math.PI * 2);
        ctx.ellipse(cx + dir * (pRad - 2), cy + 4, 7, 4 + finWave, .4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.beginPath();
        ctx.ellipse(cx - dir * 8, cy - 9, 7, 4, -.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(253, 164, 175, 0.7)";
        ctx.beginPath();
        ctx.arc(cx - 12, cy + 6, 5, 0, Math.PI * 2);
        ctx.arc(cx + 12, cy + 6, 5, 0, Math.PI * 2);
        ctx.fill();
        const eyeLX = cx - 7 + lookX * .4;
        const eyeRX = cx + 7 + lookX * .4;
        const eyeY = cy - 2 + lookY * .4;
        if (!isBlinking) {
            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.arc(eyeLX, eyeY, 3.8, 0, Math.PI * 2);
            ctx.arc(eyeRX, eyeY, 3.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(eyeLX - 1.2, eyeY - 1.2, 1.5, 0, Math.PI * 2);
            ctx.arc(eyeRX - 1.2, eyeY - 1.2, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        const mouthY = cy + 8;
        ctx.fillStyle = "#0369a1";
        ctx.beginPath();
        if (isFiring) {
            ctx.ellipse(cx + dir * 6, mouthY, 7, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#e0f2fe";
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            ctx.ellipse(cx, mouthY, 4, 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        drawHorrorEnemyOverlay(ctx, cx, cy, w, h, dir, lookX, lookY);
        ctx.restore();
        return;
    }
    if (type === "daisy_flower") {
        ctx.translate(cx, cy);
        ctx.scale(scaleX, scaleY);
        ctx.translate(-cx, -cy);
        const dir = facing || 1;
        const isPressuring = enemyObj && enemyObj.isPressuring;
        const pressureTimer = enemyObj ? enemyObj.pressureTimer || 0 : 0;
        const pressureRatio = Math.min(1, pressureTimer / 65);
        const isFiring = isFiringMouth;
        ctx.fillStyle = "rgba(15, 23, 42, 0.35)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + h / 2 - 4, w * .45, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        const flowerY = cy - 8;
        ctx.strokeStyle = "#15803d";
        ctx.lineWidth = 10;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(cx, cy + h / 2 - 4);
        const stemBend = Math.sin(time * .1) * 6 - dir * 4;
        ctx.quadraticCurveTo(cx + stemBend, cy + 16, cx, flowerY);
        ctx.stroke();
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 2, cy + h / 2 - 6);
        ctx.quadraticCurveTo(cx + stemBend - 2, cy + 16, cx - 2, flowerY);
        ctx.stroke();
        ctx.fillStyle = "#166534";
        ctx.beginPath();
        ctx.ellipse(cx - 28, cy + 32, 22, 10, -.4, 0, Math.PI * 2);
        ctx.ellipse(cx + 28, cy + 32, 22, 10, .4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(cx - 45, cy + 34);
        ctx.lineTo(cx - 52, cy + 32);
        ctx.moveTo(cx + 45, cy + 34);
        ctx.lineTo(cx + 52, cy + 32);
        ctx.stroke();
        const petalCount = 12;
        const pRad = 38 + (isPressuring ? Math.sin(time * .8) * 4 * pressureRatio : 0);
        ctx.save();
        ctx.translate(cx, flowerY);
        ctx.rotate(time * .02);
        for (let i = 0; i < petalCount; i++) {
            const ang = i * (Math.PI * 2 / petalCount);
            ctx.save();
            ctx.rotate(ang);
            const petalGrad = ctx.createLinearGradient(0, 0, 0, -pRad - 18);
            petalGrad.addColorStop(0, "#f1f5f9");
            petalGrad.addColorStop(.7, "#ffffff");
            petalGrad.addColorStop(1, isPressuring ? "#fecaca" : "#e2e8f0");
            ctx.fillStyle = petalGrad;
            ctx.beginPath();
            ctx.ellipse(0, -pRad * .8, 11, 20, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(203, 213, 225, 0.8)";
            ctx.lineWidth = 1.2;
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
        const cRad = 32;
        ctx.shadowBlur = isPressuring ? 10 + pressureRatio * 15 : 6;
        ctx.shadowColor = isPressuring ? "#ef4444" : "#eab308";
        const bGrad = ctx.createRadialGradient(cx - dir * 6, flowerY - 6, 2, cx, flowerY, cRad);
        if (isPressuring) {
            bGrad.addColorStop(0, "#fef08a");
            bGrad.addColorStop(.4, "#f97316");
            bGrad.addColorStop(.85, "#dc2626");
            bGrad.addColorStop(1, "#991b1b");
        } else {
            bGrad.addColorStop(0, "#fef9c3");
            bGrad.addColorStop(.5, "#facc15");
            bGrad.addColorStop(.85, "#eab308");
            bGrad.addColorStop(1, "#ca8a04");
        }
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(cx, flowerY, cRad, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = isPressuring ? "#7f1d1d" : "#854d0e";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, flowerY, cRad * .72, 0, Math.PI * 2);
        ctx.stroke();
        const eyeLX = cx - 11 + lookX * .4;
        const eyeRX = cx + 11 + lookX * .4;
        const eyeY = flowerY - 4 + lookY * .4;
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 3.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(eyeLX - 9, eyeY - 9);
        ctx.lineTo(eyeLX + 7, eyeY - 2);
        ctx.moveTo(eyeRX + 9, eyeY - 9);
        ctx.lineTo(eyeRX - 7, eyeY - 2);
        ctx.stroke();
        if (!isBlinking) {
            ctx.fillStyle = "#1c1917";
            ctx.beginPath();
            ctx.ellipse(eyeLX, eyeY, 5, isPressuring ? 3 : 5, .2, 0, Math.PI * 2);
            ctx.ellipse(eyeRX, eyeY, 5, isPressuring ? 3 : 5, -.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = isPressuring ? "#ef4444" : "#ffffff";
            ctx.beginPath();
            ctx.arc(eyeLX - 1.2, eyeY - 1, 1.6, 0, Math.PI * 2);
            ctx.arc(eyeRX - 1.2, eyeY - 1, 1.6, 0, Math.PI * 2);
            ctx.fill();
        }
        if (isPressuring) {
            ctx.fillStyle = "rgba(239, 68, 68, 0.75)";
            ctx.beginPath();
            ctx.arc(cx - 18, flowerY + 8, 6 + pressureRatio * 3, 0, Math.PI * 2);
            ctx.arc(cx + 18, flowerY + 8, 6 + pressureRatio * 3, 0, Math.PI * 2);
            ctx.fill();
        }
        const mouthY = flowerY + 12;
        if (isFiring) {
            ctx.fillStyle = "#450a0a";
            ctx.beginPath();
            ctx.ellipse(cx + dir * 3, mouthY, 9, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#facc15";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.moveTo(cx - 4, mouthY - 8);
            ctx.lineTo(cx - 2, mouthY - 2);
            ctx.lineTo(cx, mouthY - 8);
            ctx.moveTo(cx + 2, mouthY - 8);
            ctx.lineTo(cx + 4, mouthY - 2);
            ctx.lineTo(cx + 6, mouthY - 8);
            ctx.fill();
        } else if (isPressuring) {
            ctx.strokeStyle = "#450a0a";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx - 12, mouthY + Math.sin(time * .9) * 2);
            ctx.lineTo(cx - 4, mouthY - 1);
            ctx.lineTo(cx + 4, mouthY + 2);
            ctx.lineTo(cx + 12, mouthY - Math.sin(time * .9) * 2);
            ctx.stroke();
        } else {
            ctx.strokeStyle = "#451a03";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, mouthY + 6, 8, Math.PI * 1.15, Math.PI * 1.85);
            ctx.stroke();
        }
        drawHorrorEnemyOverlay(ctx, cx, flowerY, w, h, dir, lookX, lookY);
        ctx.restore();
        return;
    }
    if (type === "magma_titan") {
        ctx.translate(cx, cy);
        ctx.scale(scaleX, scaleY);
        ctx.translate(-cx, -cy);
        const dir = facing || 1;
        const isFiring = isFiringMouth;
        const rad = w * .46;
        ctx.fillStyle = "rgba(69, 10, 10, 0.45)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + h / 2 - 2, w * .52 * scaleX, 12 * scaleY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 22;
        ctx.shadowColor = "#ff4500";
        const mGrad = ctx.createRadialGradient(cx - dir * 16, cy - 18, 6, cx, cy, rad);
        mGrad.addColorStop(0, "#f97316");
        mGrad.addColorStop(.3, "#c2410c");
        mGrad.addColorStop(.65, "#7c2d12");
        mGrad.addColorStop(.9, "#431407");
        mGrad.addColorStop(1, "#1c1917");
        ctx.fillStyle = mGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255, 237, 213, 0.4)";
        ctx.beginPath();
        ctx.ellipse(cx - dir * 18, cy - 22, rad * .35, rad * .18, -.3 * dir, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ea580c";
        for (let g = 0; g < 4; g++) {
            const gx = cx - 35 + g * 24;
            const dropLen = 8 + Math.sin(time * .15 + g * 1.5) * 5;
            ctx.beginPath();
            ctx.moveTo(gx - 5, cy + rad * .85);
            ctx.quadraticCurveTo(gx, cy + rad * .85 + dropLen + 4, gx, cy + rad * .85 + dropLen + 6);
            ctx.quadraticCurveTo(gx, cy + rad * .85 + dropLen + 4, gx + 5, cy + rad * .85);
            ctx.closePath();
            ctx.fill();
        }
        ctx.strokeStyle = "#fef08a";
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(cx - 36, cy - 20);
        ctx.quadraticCurveTo(cx - 10, cy - 30, cx + 22, cy - 24);
        ctx.lineTo(cx + 38, cy - 34);
        ctx.moveTo(cx - 40, cy + 18);
        ctx.quadraticCurveTo(cx - 15, cy + 28, cx + 18, cy + 22);
        ctx.lineTo(cx + 36, cy + 32);
        ctx.stroke();
        ctx.strokeStyle = "#ea580c";
        ctx.lineWidth = 5.5;
        ctx.stroke();
        const eyeLX = cx - 18 + lookX * .5;
        const eyeRX = cx + 18 + lookX * .5;
        const eyeY = cy - 10 + lookY * .5;
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.moveTo(eyeLX - 16, eyeY - 14);
        ctx.lineTo(cx, eyeY - 2);
        ctx.lineTo(eyeRX + 16, eyeY - 14);
        ctx.lineTo(cx, eyeY - 7);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ffea00";
        ctx.shadowBlur = 14;
        ctx.shadowColor = "#ff2200";
        ctx.beginPath();
        ctx.ellipse(eyeLX, eyeY, 8.5, 9.5, .2, 0, Math.PI * 2);
        ctx.ellipse(eyeRX, eyeY, 8.5, 9.5, -.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(eyeLX + dir * 2, eyeY, 3.8, 0, Math.PI * 2);
        ctx.arc(eyeRX + dir * 2, eyeY, 3.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        const mouthY = cy + 22;
        ctx.save();
        if (isFiring) {
            ctx.fillStyle = "#431407";
            ctx.beginPath();
            ctx.ellipse(cx + dir * 6, mouthY, 20, 24, 0, 0, Math.PI * 2);
            ctx.fill();
            const fGrad = ctx.createRadialGradient(cx + dir * 6, mouthY, 2, cx + dir * 6, mouthY, 20);
            fGrad.addColorStop(0, "#ffffff");
            fGrad.addColorStop(.35, "#facc15");
            fGrad.addColorStop(.75, "#ea580c");
            fGrad.addColorStop(1, "#7c2d12");
            ctx.fillStyle = fGrad;
            ctx.beginPath();
            ctx.ellipse(cx + dir * 6, mouthY, 17, 20, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#0c0a09";
            ctx.beginPath();
            ctx.moveTo(cx - 12, mouthY - 16);
            ctx.lineTo(cx - 7, mouthY - 2);
            ctx.lineTo(cx - 2, mouthY - 16);
            ctx.moveTo(cx + 6, mouthY - 16);
            ctx.lineTo(cx + 11, mouthY - 2);
            ctx.lineTo(cx + 16, mouthY - 16);
            ctx.fill();
        } else {
            ctx.fillStyle = "#1c1917";
            ctx.beginPath();
            ctx.ellipse(cx, mouthY, 15, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#f97316";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(cx, mouthY - 2, 11, .2, Math.PI - .2);
            ctx.stroke();
        }
        ctx.restore();
        drawHorrorEnemyOverlay(ctx, cx, cy, w, h, facing, lookX, lookY);
        ctx.restore();
        return;
    }
    if (type === "ice_orb") {
        ctx.translate(cx, cy);
        ctx.scale(scaleX, scaleY);
        ctx.translate(-cx, -cy);
        const dir = facing || 1;
        const isFiring = isFiringMouth;
        ctx.fillStyle = "rgba(0, 30, 70, 0.35)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + h / 2 - 2, w * .5, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        const iRad = w * .46;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#38bdf8";
        const iGrad = ctx.createRadialGradient(cx - dir * 6, cy - 6, 2, cx, cy, iRad);
        iGrad.addColorStop(0, "#ffffff");
        iGrad.addColorStop(.4, "#bae6fd");
        iGrad.addColorStop(.8, "#38bdf8");
        iGrad.addColorStop(1, "#0284c7");
        ctx.fillStyle = iGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, iRad, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy - 8);
        ctx.lineTo(cx, cy - 18);
        ctx.lineTo(cx + 14, cy - 8);
        ctx.moveTo(cx - 18, cy + 4);
        ctx.lineTo(cx, cy + 18);
        ctx.lineTo(cx + 18, cy + 4);
        ctx.stroke();
        const eyeLX = cx - 7 + lookX * .4;
        const eyeRX = cx + 7 + lookX * .4;
        const eyeY = cy - 3 + lookY * .4;
        if (!isBlinking) {
            ctx.fillStyle = "#082f49";
            ctx.beginPath();
            ctx.arc(eyeLX, eyeY, 3.2, 0, Math.PI * 2);
            ctx.arc(eyeRX, eyeY, 3.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#e0f2fe";
            ctx.beginPath();
            ctx.arc(eyeLX - .9, eyeY - .9, 1.2, 0, Math.PI * 2);
            ctx.arc(eyeRX - .9, eyeY - .9, 1.2, 0, Math.PI * 2);
            ctx.fill();
        }
        const mouthY = cy + 8;
        ctx.fillStyle = "#0c4a6e";
        ctx.beginPath();
        if (isFiring) {
            ctx.ellipse(cx + dir * 6, mouthY, 6, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#bae6fd";
            ctx.lineWidth = 1.8;
            ctx.stroke();
        } else {
            ctx.ellipse(cx, mouthY, 3.5, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        drawHorrorEnemyOverlay(ctx, cx, cy, w, h, facing, lookX, lookY);
        ctx.restore();
        return;
    }
    if (type === "giant_snowman") {
        ctx.translate(cx, cy);
        ctx.scale(scaleX, scaleY);
        ctx.translate(-cx, -cy);
        const dir = facing || 1;
        const isFiring = isFiringMouth;
        ctx.fillStyle = "rgba(0, 30, 70, 0.38)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + h / 2 - 2, w * .55, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        const b1R = 20;
        const b1Y = cy + 14;
        const g1 = ctx.createRadialGradient(cx - dir * 5, b1Y - 6, 2, cx, b1Y, b1R);
        g1.addColorStop(0, "#ffffff");
        g1.addColorStop(.6, "#e0f2fe");
        g1.addColorStop(1, "#93c5fd");
        ctx.fillStyle = g1;
        ctx.beginPath();
        ctx.arc(cx, b1Y, b1R, 0, Math.PI * 2);
        ctx.fill();
        const b2R = 16;
        const b2Y = cy - 6;
        const g2 = ctx.createRadialGradient(cx - dir * 4, b2Y - 5, 2, cx, b2Y, b2R);
        g2.addColorStop(0, "#ffffff");
        g2.addColorStop(.65, "#e0f2fe");
        g2.addColorStop(1, "#93c5fd");
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.arc(cx, b2Y, b2R, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0f172a";
        for (let b = 0; b < 3; b++) {
            ctx.beginPath();
            ctx.arc(cx + dir * 3, b2Y - 5 + b * 5, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 3.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        if (isFiring) {
            ctx.moveTo(cx - dir * 12, b2Y);
            ctx.lineTo(cx - dir * 26, b2Y - 18);
            ctx.lineTo(cx - dir * 18, b2Y - 32);
            ctx.moveTo(cx + dir * 12, b2Y);
            ctx.lineTo(cx + dir * 26, b2Y - 18);
            ctx.lineTo(cx + dir * 18, b2Y - 32);
        } else {
            ctx.moveTo(cx - dir * 12, b2Y);
            ctx.lineTo(cx - dir * 24, b2Y + 4);
            ctx.lineTo(cx - dir * 30, b2Y - 4);
            ctx.moveTo(cx + dir * 12, b2Y);
            ctx.lineTo(cx + dir * 24, b2Y + 4);
            ctx.lineTo(cx + dir * 30, b2Y - 4);
        }
        ctx.stroke();
        if (isFiring) {
            const sRad = 12;
            const sY = cy - 34;
            ctx.fillStyle = "#ffffff";
            ctx.shadowBlur = 8;
            ctx.shadowColor = "#38bdf8";
            ctx.beginPath();
            ctx.arc(cx + dir * 4, sY, sRad, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        const b3R = 13;
        const b3Y = cy - 22;
        const g3 = ctx.createRadialGradient(cx - dir * 3, b3Y - 4, 1, cx, b3Y, b3R);
        g3.addColorStop(0, "#ffffff");
        g3.addColorStop(.65, "#e0f2fe");
        g3.addColorStop(1, "#93c5fd");
        ctx.fillStyle = g3;
        ctx.beginPath();
        ctx.arc(cx, b3Y, b3R, 0, Math.PI * 2);
        ctx.fill();
        const eyeLX = cx - 3 + lookX * .3;
        const eyeRX = cx + 5 + lookX * .3;
        const eyeY = b3Y - 2 + lookY * .3;
        if (!isBlinking) {
            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.arc(eyeLX, eyeY, 2.5, 0, Math.PI * 2);
            ctx.arc(eyeRX, eyeY, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.moveTo(cx + dir * 3, b3Y + 1);
        ctx.lineTo(cx + dir * 18, b3Y + 2);
        ctx.lineTo(cx + dir * 3, b3Y + 4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.ellipse(cx, b3Y + b3R - 1, b3R + 2, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        const scWave = Math.sin(time * .25) * 4;
        ctx.beginPath();
        ctx.moveTo(cx - dir * 4, b3Y + b3R);
        ctx.quadraticCurveTo(cx - dir * 14, b3Y + b3R + 8 + scWave, cx - dir * 18, b3Y + b3R + 18 + scWave);
        ctx.lineTo(cx - dir * 12, b3Y + b3R + 19 + scWave);
        ctx.quadraticCurveTo(cx - dir * 8, b3Y + b3R + 8 + scWave, cx - dir * 2, b3Y + b3R);
        ctx.closePath();
        ctx.fill();
        const hatY = b3Y - b3R + 2;
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.ellipse(cx, hatY, 15, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(cx - 8, hatY - 14, 16, 14);
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(cx - 8, hatY - 4, 16, 3);
        drawHorrorEnemyOverlay(ctx, cx, cy, w, h, facing, lookX, lookY);
        ctx.restore();
        return;
    }
    if (type === "mega_snowman") {
        ctx.translate(cx, cy);
        ctx.scale(scaleX, scaleY);
        ctx.translate(-cx, -cy);
        const dir = facing || 1;
        const isFiring = isFiringMouth;
        const balls = enemyObj ? enemyObj.snowmanBalls || 3 : 3;
        ctx.fillStyle = "rgba(0, 30, 70, 0.42)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + h / 2 - 3, w * .52, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        let baseR, baseY, midR, midY, headR, headY;
        if (balls === 3) {
            baseR = 42;
            baseY = cy + 45;
            midR = 32;
            midY = cy - 15;
            headR = 24;
            headY = cy - 65;
            const g1 = ctx.createRadialGradient(cx - dir * 10, baseY - 12, 4, cx, baseY, baseR);
            g1.addColorStop(0, "#ffffff");
            g1.addColorStop(.65, "#e0f2fe");
            g1.addColorStop(1, "#93c5fd");
            ctx.fillStyle = g1;
            ctx.beginPath();
            ctx.arc(cx, baseY, baseR, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.arc(cx + dir * 6, baseY - 6, 4, 0, Math.PI * 2);
            ctx.arc(cx + dir * 4, baseY + 12, 4, 0, Math.PI * 2);
            ctx.fill();
            const g2 = ctx.createRadialGradient(cx - dir * 8, midY - 10, 3, cx, midY, midR);
            g2.addColorStop(0, "#ffffff");
            g2.addColorStop(.65, "#e0f2fe");
            g2.addColorStop(1, "#93c5fd");
            ctx.fillStyle = g2;
            ctx.beginPath();
            ctx.arc(cx, midY, midR, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.arc(cx + dir * 5, midY - 8, 3.5, 0, Math.PI * 2);
            ctx.arc(cx + dir * 5, midY + 8, 3.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (balls === 2) {
            midR = 35;
            midY = cy + 18;
            headR = 26;
            headY = cy - 35;
            const g2 = ctx.createRadialGradient(cx - dir * 8, midY - 10, 3, cx, midY, midR);
            g2.addColorStop(0, "#ffffff");
            g2.addColorStop(.65, "#e0f2fe");
            g2.addColorStop(1, "#93c5fd");
            ctx.fillStyle = g2;
            ctx.beginPath();
            ctx.arc(cx, midY, midR, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.arc(cx + dir * 5, midY - 5, 4, 0, Math.PI * 2);
            ctx.arc(cx + dir * 5, midY + 10, 4, 0, Math.PI * 2);
            ctx.fill();
        } else {
            headR = 26;
            headY = cy + 12;
        }
        if (balls >= 2) {
            ctx.strokeStyle = "#3e1e04";
            ctx.lineWidth = 6;
            ctx.lineCap = "round";
            ctx.beginPath();
            if (isFiring) {
                ctx.moveTo(cx - dir * 22, midY);
                ctx.lineTo(cx - dir * 48, midY - 32);
                ctx.lineTo(cx - dir * 36, midY - 56);
                ctx.moveTo(cx + dir * 22, midY);
                ctx.lineTo(cx + dir * 48, midY - 32);
                ctx.lineTo(cx + dir * 36, midY - 56);
            } else {
                ctx.moveTo(cx - dir * 22, midY);
                ctx.lineTo(cx - dir * 44, midY + 8);
                ctx.lineTo(cx - dir * 56, midY - 6);
                ctx.moveTo(cx + dir * 22, midY);
                ctx.lineTo(cx + dir * 44, midY + 8);
                ctx.lineTo(cx + dir * 56, midY - 6);
            }
            ctx.stroke();
            if (isFiring) {
                const sRad = 20;
                const sY = headY - 36;
                ctx.fillStyle = "#ffffff";
                ctx.shadowBlur = 12;
                ctx.shadowColor = "#38bdf8";
                ctx.beginPath();
                ctx.arc(cx + dir * 6, sY, sRad, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
        const g3 = ctx.createRadialGradient(cx - dir * 6, headY - 7, 2, cx, headY, headR);
        g3.addColorStop(0, "#ffffff");
        g3.addColorStop(.65, "#e0f2fe");
        g3.addColorStop(1, "#93c5fd");
        ctx.fillStyle = g3;
        ctx.beginPath();
        ctx.arc(cx, headY, headR, 0, Math.PI * 2);
        ctx.fill();
        const eyeLX = cx - 7 + lookX * .4;
        const eyeRX = cx + 8 + lookX * .4;
        const eyeY = headY - 4 + lookY * .4;
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 3.8;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(eyeLX - 9, eyeY - 8);
        ctx.lineTo(eyeLX + 5, eyeY - 2);
        ctx.moveTo(eyeRX + 9, eyeY - 8);
        ctx.lineTo(eyeRX - 5, eyeY - 2);
        ctx.stroke();
        if (!isBlinking) {
            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.arc(eyeLX, eyeY, 4.2, 0, Math.PI * 2);
            ctx.arc(eyeRX, eyeY, 4.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(eyeLX - 1, eyeY - 1, 1.4, 0, Math.PI * 2);
            ctx.arc(eyeRX - 1, eyeY - 1, 1.4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = "#ea580c";
        ctx.beginPath();
        ctx.moveTo(cx + dir * 4, headY);
        ctx.lineTo(cx + dir * 30, headY + 3);
        ctx.lineTo(cx + dir * 4, headY + 7);
        ctx.closePath();
        ctx.fill();
        const mouthY = headY + 11;
        ctx.fillStyle = "#0f172a";
        for (let c = -2; c <= 2; c++) {
            ctx.beginPath();
            ctx.arc(cx + c * 5, mouthY + (c === 0 ? 3 : 0), 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.ellipse(cx, headY + headR - 1, headR + 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        const scWave = Math.sin(time * .3) * 6;
        ctx.beginPath();
        ctx.moveTo(cx - dir * 6, headY + headR);
        ctx.quadraticCurveTo(cx - dir * 20, headY + headR + 12 + scWave, cx - dir * 28, headY + headR + 26 + scWave);
        ctx.lineTo(cx - dir * 18, headY + headR + 28 + scWave);
        ctx.quadraticCurveTo(cx - dir * 10, headY + headR + 12 + scWave, cx - dir * 2, headY + headR);
        ctx.closePath();
        ctx.fill();
        const hatY = headY - headR + 2;
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.ellipse(cx, hatY, 26, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(cx - 14, hatY - 24, 28, 24);
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(cx - 14, hatY - 6, 28, 5);
        drawHorrorEnemyOverlay(ctx, cx, cy, w, h, facing, lookX, lookY);
        ctx.restore();
        return;
    }
    if (currentLevel === 0 && game.iceMode && !isFire) {
        if (type === "snowman_blower") {
            ctx.translate(cx, cy);
            ctx.scale(scaleX, scaleY);
            ctx.translate(-cx, -cy);
            const isBlowing = enemyObj && enemyObj.isBlowing;
            const dir = facing || 1;
            ctx.fillStyle = "rgba(0, 40, 80, 0.28)";
            ctx.beginPath();
            ctx.ellipse(cx, cy + h / 2 - 2, w * .45, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            const baseR = 15.5;
            const baseY = cy + 7;
            const gradBase = ctx.createRadialGradient(cx - dir * 4, baseY - 5, 2, cx, baseY, baseR);
            gradBase.addColorStop(0, "#ffffff");
            gradBase.addColorStop(.65, "#e8f6fc");
            gradBase.addColorStop(1, "#a6cde2");
            ctx.fillStyle = gradBase;
            ctx.beginPath();
            ctx.arc(cx, baseY, baseR, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#1c2028";
            ctx.beginPath();
            ctx.arc(cx + dir * 3, baseY - 2, 2.5, 0, Math.PI * 2);
            ctx.arc(cx + dir * 2, baseY + 6, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(cx + dir * 3 - .7, baseY - 2.7, .9, 0, Math.PI * 2);
            ctx.arc(cx + dir * 2 - .7, baseY + 5.3, .9, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#5a3d28";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(cx - dir * 8, cy + 2);
            ctx.lineTo(cx - dir * 18, cy - 2);
            ctx.lineTo(cx - dir * 22, cy - 8);
            ctx.moveTo(cx + dir * 8, cy + 2);
            ctx.lineTo(cx + dir * 18, cy - (isBlowing ? 5 : 2));
            ctx.lineTo(cx + dir * 23, cy - (isBlowing ? 10 : 4));
            ctx.stroke();
            const headR = 11.5;
            const headY = cy - 11;
            const gradHead = ctx.createRadialGradient(cx - dir * 3, headY - 4, 1, cx, headY, headR);
            gradHead.addColorStop(0, "#ffffff");
            gradHead.addColorStop(.6, "#e8f7ff");
            gradHead.addColorStop(1, "#abd1e7");
            ctx.fillStyle = gradHead;
            ctx.beginPath();
            ctx.arc(cx, headY, headR, 0, Math.PI * 2);
            ctx.fill();
            const eyeX1 = cx + dir * 2 + lookX * .3;
            const eyeX2 = cx + dir * 7 + lookX * .3;
            const eyeY = headY - 2 + lookY * .3;
            if (!isBlinking) {
                ctx.fillStyle = "#1c2028";
                ctx.beginPath();
                ctx.arc(eyeX1, eyeY, 2.2, 0, Math.PI * 2);
                ctx.arc(eyeX2, eyeY, 2.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(eyeX1 - .6, eyeY - .6, .8, 0, Math.PI * 2);
                ctx.arc(eyeX2 - .6, eyeY - .6, .8, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = "#ff6a00";
            ctx.beginPath();
            ctx.moveTo(cx + dir * 5, headY + 1);
            ctx.lineTo(cx + dir * 17, headY + 2);
            ctx.lineTo(cx + dir * 5, headY + 4);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#ffa733";
            ctx.fillRect(cx + dir * 5, headY + 1, dir * 5, 1.5);
            const mouthX = cx + dir * 8;
            const mouthY = headY + 6;
            ctx.fillStyle = "#061a2b";
            ctx.beginPath();
            if (isBlowing) {
                ctx.ellipse(mouthX, mouthY, 4, 5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#00ffff";
                ctx.lineWidth = 1.4;
                ctx.stroke();
            } else {
                ctx.ellipse(mouthX - dir * 2, mouthY, 2.5, 1.8, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = "#d62246";
            ctx.beginPath();
            ctx.ellipse(cx, headY + headR - 1, headR + 1.5, 3.5, 0, 0, Math.PI * 2);
            ctx.fill();
            const scarfWave = Math.sin(time * .25) * 3;
            ctx.beginPath();
            ctx.moveTo(cx - dir * 4, headY + headR);
            ctx.quadraticCurveTo(cx - dir * 12, headY + headR + 6 + scarfWave, cx - dir * 16, headY + headR + 14 + scarfWave);
            ctx.lineTo(cx - dir * 11, headY + headR + 15 + scarfWave);
            ctx.quadraticCurveTo(cx - dir * 8, headY + headR + 6 + scarfWave, cx - dir * 2, headY + headR);
            ctx.closePath();
            ctx.fill();
            const hatY = headY - headR + 2;
            ctx.fillStyle = "#1c202a";
            ctx.beginPath();
            ctx.ellipse(cx, hatY, 13, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(cx - 7, hatY - 11, 14, 11);
            ctx.fillStyle = "#00e5ff";
            ctx.fillRect(cx - 7, hatY - 3.5, 14, 2.5);
            if (isBlowing) {
                ctx.save();
                const coneLen = 175;
                const coneGrad = ctx.createLinearGradient(mouthX, mouthY, mouthX + dir * coneLen, mouthY);
                coneGrad.addColorStop(0, "rgba(255, 255, 255, 0.75)");
                coneGrad.addColorStop(.3, "rgba(0, 240, 255, 0.35)");
                coneGrad.addColorStop(1, "rgba(0, 210, 255, 0)");
                ctx.fillStyle = coneGrad;
                ctx.beginPath();
                ctx.moveTo(mouthX, mouthY);
                const wOff = Math.sin(time * .4) * 5;
                ctx.lineTo(mouthX + dir * coneLen, mouthY - 32 + wOff);
                ctx.lineTo(mouthX + dir * coneLen, mouthY + 32 + wOff);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
                ctx.lineWidth = 1.6;
                for (let w = 0; w < 3; w++) {
                    const waveDist = (time * 6 + w * 50) % coneLen;
                    const curX = mouthX + dir * waveDist;
                    const waveSpread = waveDist / coneLen * 26;
                    ctx.beginPath();
                    ctx.arc(curX, mouthY, waveSpread, dir > 0 ? -Math.PI * .35 : Math.PI * .65, dir > 0 ? Math.PI * .35 : Math.PI * 1.35);
                    ctx.stroke();
                }
                ctx.restore();
            }
            drawHorrorEnemyOverlay(ctx, cx, cy, w, h, facing, lookX, lookY);
            ctx.restore();
            return;
        }
        if (type === "snowman_slammer") {
            ctx.translate(cx, cy);
            ctx.scale(scaleX, scaleY);
            ctx.translate(-cx, -cy);
            const dir = facing || 1;
            const inAir = enemyObj && enemyObj.inSlamAir;
            if (!inAir) {
                ctx.fillStyle = "rgba(0, 30, 70, 0.32)";
                ctx.beginPath();
                ctx.ellipse(cx, cy + h / 2 - 2, w * .52, 7, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            const b1R = 17;
            const b1Y = cy + 11;
            const gradB1 = ctx.createRadialGradient(cx - dir * 4, b1Y - 6, 2, cx, b1Y, b1R);
            gradB1.addColorStop(0, "#ffffff");
            gradB1.addColorStop(.6, "#e2f3fc");
            gradB1.addColorStop(1, "#94c2dd");
            ctx.fillStyle = gradB1;
            ctx.beginPath();
            ctx.arc(cx, b1Y, b1R, 0, Math.PI * 2);
            ctx.fill();
            const b2R = 13.5;
            const b2Y = cy - 7;
            const gradB2 = ctx.createRadialGradient(cx - dir * 3, b2Y - 5, 2, cx, b2Y, b2R);
            gradB2.addColorStop(0, "#ffffff");
            gradB2.addColorStop(.65, "#e4f5fd");
            gradB2.addColorStop(1, "#9dcbe5");
            ctx.fillStyle = gradB2;
            ctx.beginPath();
            ctx.arc(cx, b2Y, b2R, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#181b22";
            for (let b = 0; b < 3; b++) {
                const by = b2Y - 5 + b * 5;
                ctx.beginPath();
                ctx.arc(cx + dir * 3, by, 2.4, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.strokeStyle = "#4e342e";
            ctx.lineWidth = 3.2;
            ctx.lineCap = "round";
            ctx.beginPath();
            if (inAir) {
                ctx.moveTo(cx - dir * 10, b2Y);
                ctx.lineTo(cx - dir * 22, b2Y - 14);
                ctx.lineTo(cx - dir * 26, b2Y - 22);
                ctx.moveTo(cx + dir * 10, b2Y);
                ctx.lineTo(cx + dir * 22, b2Y - 14);
                ctx.lineTo(cx + dir * 26, b2Y - 22);
            } else {
                ctx.moveTo(cx - dir * 10, b2Y);
                ctx.lineTo(cx - dir * 20, b2Y + 4);
                ctx.lineTo(cx - dir * 25, b2Y - 2);
                ctx.moveTo(cx + dir * 10, b2Y);
                ctx.lineTo(cx + dir * 20, b2Y + 4);
                ctx.lineTo(cx + dir * 25, b2Y - 2);
            }
            ctx.stroke();
            const b3R = 11;
            const b3Y = cy - 22;
            const gradB3 = ctx.createRadialGradient(cx - dir * 3, b3Y - 4, 1, cx, b3Y, b3R);
            gradB3.addColorStop(0, "#ffffff");
            gradB3.addColorStop(.65, "#e8f7ff");
            gradB3.addColorStop(1, "#a6d1e9");
            ctx.fillStyle = gradB3;
            ctx.beginPath();
            ctx.arc(cx, b3Y, b3R, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#14171d";
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(cx - dir * 4, b3Y - 5);
            ctx.lineTo(cx + dir * 1, b3Y - 2);
            ctx.moveTo(cx + dir * 7, b3Y - 5);
            ctx.lineTo(cx + dir * 2, b3Y - 2);
            ctx.stroke();
            const eye1X = cx - dir * 2 + lookX * .3;
            const eye2X = cx + dir * 5 + lookX * .3;
            const eyeSlamY = b3Y - 1 + lookY * .3;
            ctx.fillStyle = "#0a1d30";
            ctx.beginPath();
            ctx.arc(eye1X, eyeSlamY, 2.4, 0, Math.PI * 2);
            ctx.arc(eye2X, eyeSlamY, 2.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#00ffff";
            ctx.beginPath();
            ctx.arc(eye1X + .5, eyeSlamY, 1.1, 0, Math.PI * 2);
            ctx.arc(eye2X + .5, eyeSlamY, 1.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#e65100";
            ctx.beginPath();
            ctx.moveTo(cx + dir * 3, b3Y);
            ctx.lineTo(cx + dir * 14, b3Y + 2);
            ctx.lineTo(cx + dir * 3, b3Y + 4);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#1c2028";
            for (let m = 0; m < 4; m++) {
                ctx.beginPath();
                ctx.arc(cx + (m - 1.5) * 3 * dir, b3Y + 6 + Math.abs(m - 1.5) * 1.2, 1.4, 0, Math.PI * 2);
                ctx.fill();
            }
            drawHorrorEnemyOverlay(ctx, cx, cy, w, h, facing, lookX, lookY);
            ctx.restore();
            return;
        }
        if (type === "snowball_head") {
            ctx.translate(cx, cy);
            ctx.scale(scaleX, scaleY);
            ctx.translate(-cx, -cy);
            const dir = facing || 1;
            const rad = 22;
            ctx.shadowColor = "#00f5ff";
            ctx.shadowBlur = 12;
            ctx.fillStyle = "#bce6ff";
            ctx.beginPath();
            ctx.ellipse(cx - 10, cy + 20, 7, 4, 0, 0, Math.PI * 2);
            ctx.ellipse(cx + 10, cy + 20, 7, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            const gradBall = ctx.createRadialGradient(cx - dir * 6, cy - 7, 3, cx, cy, rad);
            gradBall.addColorStop(0, "#ffffff");
            gradBall.addColorStop(.35, "#e5f6ff");
            gradBall.addColorStop(.72, "#9ecced");
            gradBall.addColorStop(1, "#5a96bd");
            ctx.fillStyle = gradBall;
            ctx.beginPath();
            ctx.arc(cx, cy, rad, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "rgba(70, 130, 180, 0.4)";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.arc(cx - dir * 3, cy - 8, 12, .2 * Math.PI, .8 * Math.PI);
            ctx.stroke();
            ctx.fillStyle = "#e0faff";
            for (let c = 0; c < 3; c++) {
                const cAngle = time * .08 + c * (Math.PI * 2 / 3);
                const ox = cx + Math.cos(cAngle) * (rad + 7);
                const oy = cy + Math.sin(cAngle) * (rad + 7);
                ctx.fillRect(ox - 2, oy - 2, 4, 4);
            }
            ctx.strokeStyle = "#00ffff";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx - dir * 10, cy - 14);
            ctx.lineTo(cx - dir * 6, cy - 8);
            ctx.lineTo(cx - dir * 12, cy - 3);
            ctx.stroke();
            ctx.fillStyle = "#3a6688";
            ctx.beginPath();
            ctx.moveTo(cx - 12, cy - 8);
            ctx.lineTo(cx - 2, cy - 3);
            ctx.lineTo(cx - 2, cy - 6);
            ctx.lineTo(cx - 12, cy - 11);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(cx + 12, cy - 8);
            ctx.lineTo(cx + 2, cy - 3);
            ctx.lineTo(cx + 2, cy - 6);
            ctx.lineTo(cx + 12, cy - 11);
            ctx.closePath();
            ctx.fill();
            const eyeLX = cx - 7 + lookX * .4;
            const eyeRX = cx + 7 + lookX * .4;
            const eyeY = cy - 2 + lookY * .4;
            ctx.fillStyle = "#061726";
            ctx.beginPath();
            ctx.ellipse(cx - 6, cy - 2, 5, 3.5, -.15, 0, Math.PI * 2);
            ctx.ellipse(cx + 6, cy - 2, 5, 3.5, .15, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#00f0ff";
            ctx.beginPath();
            ctx.arc(eyeLX, eyeY, 2.5, 0, Math.PI * 2);
            ctx.arc(eyeRX, eyeY, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(eyeLX - .7, eyeY - .7, 1, 0, Math.PI * 2);
            ctx.arc(eyeRX - .7, eyeY - .7, 1, 0, Math.PI * 2);
            ctx.fill();
            const mouthY = cy + 9;
            ctx.fillStyle = "#04121f";
            ctx.beginPath();
            ctx.moveTo(cx - 11, mouthY - 1);
            ctx.quadraticCurveTo(cx, mouthY + 8, cx + 11, mouthY - 1);
            ctx.quadraticCurveTo(cx, mouthY + 2, cx - 11, mouthY - 1);
            ctx.fill();
            ctx.fillStyle = "#dcf8ff";
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1;
            for (let t = 0; t < 3; t++) {
                const tx = cx - 6 + t * 6;
                ctx.beginPath();
                ctx.moveTo(tx - 2, mouthY);
                ctx.lineTo(tx, mouthY + 5);
                ctx.lineTo(tx + 2, mouthY);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
            if (isFiringMouth) {
                ctx.fillStyle = "#00ffff";
                ctx.shadowColor = "#00ffff";
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(cx, mouthY + 3, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            drawHorrorEnemyOverlay(ctx, cx, cy, w, h, facing, lookX, lookY);
            ctx.restore();
            return;
        }
        const rad = Math.max(w, h) / 2;
        const rot = time * .05 + x;
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 9;
        ctx.fillStyle = "rgba(0, 210, 255, 0.88)";
        ctx.beginPath();
        ctx.moveTo(cx, cy - rad * 1.1);
        ctx.lineTo(cx + rad * .95, cy);
        ctx.lineTo(cx, cy + rad * 1.1);
        ctx.lineTo(cx - rad * .95, cy);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.5;
        for (let a = 0; a < 6; a++) {
            const angle = rot + a * Math.PI / 3;
            const ex = cx + Math.cos(angle) * (rad + 6);
            const ey = cy + Math.sin(angle) * (rad + 6);
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(ex, ey);
            ctx.stroke();
            const mx = cx + Math.cos(angle) * rad * .65;
            const my = cy + Math.sin(angle) * rad * .65;
            const bAngle1 = angle + Math.PI / 4, bAngle2 = angle - Math.PI / 4;
            ctx.beginPath();
            ctx.moveTo(mx, my);
            ctx.lineTo(mx + Math.cos(bAngle1) * 6, my + Math.sin(bAngle1) * 6);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(mx, my);
            ctx.lineTo(mx + Math.cos(bAngle2) * 6, my + Math.sin(bAngle2) * 6);
            ctx.stroke();
        }
        if (!isBlinking) {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(cx - 5 + lookX * .5, cy - 2 + lookY * .5, 3.5, 0, Math.PI * 2);
            ctx.arc(cx + 5 + lookX * .5, cy - 2 + lookY * .5, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#00ffff";
            ctx.beginPath();
            ctx.arc(cx - 5 + lookX, cy - 2 + lookY, 1.8, 0, Math.PI * 2);
            ctx.arc(cx + 5 + lookX, cy - 2 + lookY, 1.8, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = "#002244";
        const mouthH = isFiringMouth ? 12 : 3;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 8, 7, mouthH, 0, 0, Math.PI * 2);
        ctx.fill();
        if (isFiringMouth) {
            ctx.fillStyle = "#00ffff";
            ctx.beginPath();
            ctx.ellipse(cx, cy + 8, 3, mouthH * .4, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.restore();
        return;
    }
    ctx.translate(cx, cy);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-cx, -cy);
    if (type === "flaming" || isFire || type === "angry" || type === "demon") {
        const rad = Math.max(w, h) / 2;
        ctx.shadowColor = "#ff3300";
        ctx.shadowBlur = 14;
        const fireGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, rad * 1.3);
        fireGrad.addColorStop(0, "#ffff00");
        fireGrad.addColorStop(.4, color || "#ff4400");
        fireGrad.addColorStop(1, "#660000");
        ctx.fillStyle = fireGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, rad * (1 + Math.sin(time * .2 + x) * .12), 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffcc00";
        for (let f = 0; f < 5; f++) {
            const fAngle = time * .12 + f * Math.PI * 2 / 5;
            const fx = cx + Math.cos(fAngle) * rad * .65;
            const fy = cy + Math.sin(fAngle) * rad * .65 - 4;
            ctx.beginPath();
            ctx.arc(fx, fy, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = "#ff1100";
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy - 10);
        ctx.lineTo(cx - 17, cy - 24);
        ctx.lineTo(cx - 4, cy - 12);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 10, cy - 10);
        ctx.lineTo(cx + 17, cy - 24);
        ctx.lineTo(cx + 4, cy - 12);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#ff0033";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy - 11);
        ctx.lineTo(cx - 3, cy - 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 14, cy - 11);
        ctx.lineTo(cx + 3, cy - 5);
        ctx.stroke();
        if (!isBlinking) {
            ctx.fillStyle = "#ffff00";
            ctx.beginPath();
            ctx.ellipse(cx - 7 + lookX * .5, cy - 3 + lookY * .5, 4.5, 3, -.2, 0, Math.PI * 2);
            ctx.ellipse(cx + 7 + lookX * .5, cy - 3 + lookY * .5, 4.5, 3, .2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ff0000";
            ctx.fillRect(cx - 8 + lookX, cy - 5 + lookY, 2, 5);
            ctx.fillRect(cx + 6 + lookX, cy - 5 + lookY, 2, 5);
        }
        const mouthH = isFiringMouth ? 12 + Math.sin(time * .5) * 4 : 4;
        const mouthW = 10;
        ctx.fillStyle = "#1a0005";
        ctx.beginPath();
        ctx.ellipse(cx, cy + 7, mouthW, mouthH, 0, 0, Math.PI * 2);
        ctx.fill();
        if (isFiringMouth) {
            ctx.fillStyle = "#ffff00";
            ctx.shadowColor = "#ffff00";
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.ellipse(cx, cy + 7, mouthW * .45, mouthH * .5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            for (let k = 0; k < 3; k++) {
                const spX = cx + (Math.random() - .5) * 8;
                const spY = cy + 7 + (Math.random() - .5) * mouthH;
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(spX, spY, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(cx - 6, cy + 7 - mouthH);
        ctx.lineTo(cx - 4, cy + 7 - mouthH + 4);
        ctx.lineTo(cx - 2, cy + 7 - mouthH);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 2, cy + 7 - mouthH);
        ctx.lineTo(cx + 4, cy + 7 - mouthH + 4);
        ctx.lineTo(cx + 6, cy + 7 - mouthH);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy + 7 + mouthH);
        ctx.lineTo(cx - 2, cy + 7 + mouthH - 4);
        ctx.lineTo(cx, cy + 7 + mouthH);
        ctx.fill();
    } else if (type === "happy") {
        const squish = Math.sin(time * .14 + (enemyObj ? enemyObj.x * .05 : 0)) * 2;
        const sw = w * .48 + squish;
        const sh = h * .46 - squish;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        const grad = ctx.createRadialGradient(cx, cy - h * .15, 4, cx, cy, w * .7);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(.28, color);
        grad.addColorStop(1, "#083812");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + squish * .5, sw, sh, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.beginPath();
        ctx.ellipse(cx - sw * .35, cy - sh * .45 + squish * .5, sw * .28, sh * .14, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        if (!isBlinking) {
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(cx - 7 + lookX * .6, cy - 3 + lookY * .6 + squish * .5, 5, 0, Math.PI * 2);
            ctx.arc(cx + 7 + lookX * .6, cy - 3 + lookY * .6 + squish * .5, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#111";
            ctx.beginPath();
            ctx.arc(cx - 7 + lookX, cy - 3 + lookY + squish * .5, 2.6, 0, Math.PI * 2);
            ctx.arc(cx + 7 + lookX, cy - 3 + lookY + squish * .5, 2.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(cx - 8 + lookX, cy - 4 + lookY + squish * .5, 1.2, 0, Math.PI * 2);
            ctx.arc(cx + 6 + lookX, cy - 4 + lookY + squish * .5, 1.2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.strokeStyle = "#111";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.arc(cx - 7, cy - 3 + squish * .5, 4, Math.PI, 0);
            ctx.arc(cx + 7, cy - 3 + squish * .5, 4, Math.PI, 0);
            ctx.stroke();
        }
        ctx.fillStyle = "rgba(255, 110, 160, 0.7)";
        ctx.beginPath();
        ctx.ellipse(cx - 10, cy + 3 + squish * .5, 4, 2.4, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 10, cy + 3 + squish * .5, 4, 2.4, 0, 0, Math.PI * 2);
        ctx.fill();
        if (isFiringMouth) {
            ctx.fillStyle = "#3d0010";
            ctx.beginPath();
            ctx.ellipse(cx, cy + 4 + squish * .5, 4.5, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ff6688";
            ctx.beginPath();
            ctx.arc(cx, cy + 6 + squish * .5, 3, 0, Math.PI);
            ctx.fill();
        } else {
            ctx.strokeStyle = "#111";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.arc(cx, cy + 2 + squish * .5, 4.5, .1 * Math.PI, .9 * Math.PI);
            ctx.stroke();
        }
        const sproutY = cy - sh + squish * .5;
        const leafSway = Math.sin(time * .12) * 4;
        ctx.strokeStyle = "#4ade80";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(cx, sproutY);
        ctx.quadraticCurveTo(cx + leafSway * .5, sproutY - 7, cx + leafSway, sproutY - 11);
        ctx.stroke();
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.ellipse(cx + leafSway - 5, sproutY - 11, 4.5, 2.2, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#4ade80";
        ctx.beginPath();
        ctx.ellipse(cx + leafSway + 5, sproutY - 11, 4.5, 2.2, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
    } else if (type === "chaser") {
        ctx.shadowColor = color;
        ctx.shadowBlur = 14;
        ctx.fillStyle = "#11052c";
        ctx.beginPath();
        ctx.moveTo(cx, cy - h * .5);
        ctx.lineTo(cx + w * .48, cy - h * .1);
        ctx.lineTo(cx + w * .4, cy + h * .48);
        ctx.lineTo(cx - w * .4, cy + h * .48);
        ctx.lineTo(cx - w * .48, cy - h * .1);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
        if (!isBlinking) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(cx - 8 + lookX * .5, cy - 6 + lookY * .5, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx + 8 + lookX * .5, cy - 6 + lookY * .5, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx - 4 + lookX * .5, cy + 1 + lookY * .5, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx + 4 + lookX * .5, cy + 1 + lookY * .5, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        const mandOpen = isFiringMouth ? 6 : 2;
        ctx.beginPath();
        ctx.moveTo(cx - 7 - mandOpen, cy + 6);
        ctx.lineTo(cx, cy + 10 + mandOpen);
        ctx.lineTo(cx + 7 + mandOpen, cy + 6);
        ctx.stroke();
    } else if (type === "sinusoidal") {
        const wingFlop = Math.sin(time * .2 + x) * 12;
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy);
        ctx.quadraticCurveTo(cx - 28, cy - 20 + wingFlop, cx - 34, cy - 5 + wingFlop);
        ctx.quadraticCurveTo(cx - 20, cy + 10, cx - 10, cy + 5);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 10, cy);
        ctx.quadraticCurveTo(cx + 28, cy - 20 + wingFlop, cx + 34, cy - 5 + wingFlop);
        ctx.quadraticCurveTo(cx + 20, cy + 10, cx + 10, cy + 5);
        ctx.fill();
        const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, w * .4);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(.6, color);
        grad.addColorStop(1, "#200020");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, w * .38, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.strokeRect(-w * .45, -h * .45, w * .9, h * .9);
        ctx.fillStyle = "#111";
        ctx.beginPath();
        ctx.arc(cx, cy, w * .35, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(cx, cy, w * .22, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx + facing * 2, cy - 1, 3, 0, Math.PI * 2);
        ctx.fill();
    } else if (type === "electric") {
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 14;
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, "#0a2540");
        grad.addColorStop(.5, "#005f73");
        grad.addColorStop(1, "#001219");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, w - 4, h - 4, 6);
        ctx.fill();
        ctx.strokeStyle = "#00f0ff";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#94d2bd";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 8, y + 2);
        ctx.lineTo(cx - 8, y - 8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 8, y + 2);
        ctx.lineTo(cx + 8, y - 8);
        ctx.stroke();
        ctx.fillStyle = "#00f0ff";
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(cx - 8, y - 8, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 8, y - 8, 3, 0, Math.PI * 2);
        ctx.fill();
        if (Math.random() < .65) {
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx - 8, y - 8);
            ctx.lineTo(cx + (Math.random() - .5) * 6, y - 12 + Math.sin(time * .5) * 3);
            ctx.lineTo(cx + 8, y - 8);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#000";
        ctx.fillRect(cx - 12, cy - 6, 24, 8);
        ctx.fillStyle = "#00f0ff";
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 6;
        ctx.fillRect(cx - 10 + Math.sin(time * .1) * 6, cy - 4, 8, 4);
        ctx.shadowBlur = 0;
        ctx.fillStyle = isFiringMouth ? "#ffffff" : "#00ffff";
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = isFiringMouth ? 16 : 8;
        ctx.beginPath();
        ctx.arc(cx, cy + 7, isFiringMouth ? 6 : 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    } else if (type === "shield") {
        const isEnraged = enemyObj && enemyObj.enraged;
        ctx.fillStyle = isEnraged ? "#3d0814" : "#263238";
        ctx.shadowColor = isEnraged ? "#ff0044" : "#00e5ff";
        ctx.shadowBlur = isEnraged ? 14 : 6;
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, w - 4, h - 4, 6);
        ctx.fill();
        ctx.strokeStyle = isEnraged ? "#ff1744" : "#00e5ff";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = isEnraged ? "#ff0033" : color || "#00e5ff";
        ctx.shadowColor = isEnraged ? "#ff0033" : "#00e5ff";
        ctx.shadowBlur = 8;
        ctx.fillRect(cx - 11, cy - 6, 22, 6);
        ctx.shadowBlur = 0;
        if (isEnraged) {
            ctx.fillStyle = "#ffff00";
            ctx.fillRect(cx - 8 + facing * 3, cy - 5, 4, 4);
            ctx.fillRect(cx + 4 + facing * 3, cy - 5, 4, 4);
            ctx.fillStyle = "#ffffff";
            for (let d = 0; d < 3; d++) ctx.fillRect(cx - 7 + d * 6, cy + 6, 3, 4);
        } else {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(cx - 4 + facing * 4, cy - 5, 4, 4);
        }
    } else if (type === "miniboss") {
        ctx.shadowColor = color;
        ctx.shadowBlur = 24;
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, color);
        grad.addColorStop(1, "#0d001a");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 10);
        ctx.fill();
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.moveTo(x + 4, y);
        ctx.lineTo(x + 12, y - 14);
        ctx.lineTo(x + w * .35, y);
        ctx.lineTo(cx, y - 20);
        ctx.lineTo(x + w * .65, y);
        ctx.lineTo(x + w - 12, y - 14);
        ctx.lineTo(x + w - 4, y);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx - 16, cy - 8, 6, 0, Math.PI * 2);
        ctx.arc(cx + 16, cy - 8, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ff0000";
        ctx.beginPath();
        ctx.arc(cx - 16 + facing * 2, cy - 8, 3, 0, Math.PI * 2);
        ctx.arc(cx + 16 + facing * 2, cy - 8, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000";
        ctx.fillRect(cx - 18, cy + 10, 36, 8);
        ctx.fillStyle = "#ffd700";
        for (let t = 0; t < 4; t++) ctx.fillRect(cx - 16 + t * 9, cy + 10, 4, 4);
    } else if (type === "flying_fish") {
        const fDir = facing || 1;
        const fishVy = enemyObj ? enemyObj.vy || 0 : 0;
        const tilt = Math.max(-.6, Math.min(.6, fishVy * .05)) * fDir;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(tilt);
        ctx.scale(fDir, 1);
        ctx.shadowColor = "#06b6d4";
        ctx.shadowBlur = 10;
        const tailWag = Math.sin(time * .25) * 6;
        ctx.fillStyle = "#ec4899";
        ctx.beginPath();
        ctx.moveTo(-w * .35, 0);
        ctx.lineTo(-w * .65, -h * .45 + tailWag);
        ctx.quadraticCurveTo(-w * .45, tailWag * .5, -w * .65, h * .45 + tailWag);
        ctx.closePath();
        ctx.fill();
        const fishGrad = ctx.createLinearGradient(-w * .4, 0, w * .45, 0);
        fishGrad.addColorStop(0, "#0284c7");
        fishGrad.addColorStop(.5, "#06b6d4");
        fishGrad.addColorStop(1, "#f43f5e");
        ctx.fillStyle = fishGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, w * .46, h * .34, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.beginPath();
        ctx.ellipse(w * .05, h * .14, w * .3, h * .15, 0, 0, Math.PI);
        ctx.fill();
        const finFlap = Math.sin(time * .3) * 5;
        ctx.fillStyle = "rgba(6, 182, 212, 0.65)";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-w * .05, -h * .1);
        ctx.quadraticCurveTo(w * .1, -h * .65 + finFlap, -w * .2, -h * .55 + finFlap);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#f43f5e";
        ctx.beginPath();
        ctx.moveTo(-w * .2, -h * .3);
        ctx.quadraticCurveTo(0, -h * .52, w * .15, -h * .28);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.lineWidth = 1;
        for (let sc = -w * .2; sc <= w * .15; sc += 9) {
            ctx.beginPath();
            ctx.arc(sc, 0, 5, -.6 * Math.PI, .6 * Math.PI);
            ctx.stroke();
        }
        const eyeX = w * .25;
        const eyeY = -h * .08;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(eyeX + 1.2, eyeY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#06b6d4";
        ctx.beginPath();
        ctx.arc(eyeX + 2, eyeY - 1, 1.2, 0, Math.PI * 2);
        ctx.fill();
        const mOpen = isFiringMouth ? 6 : 2;
        ctx.fillStyle = "#881337";
        ctx.beginPath();
        ctx.ellipse(w * .44, h * .05, 3, mOpen, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();
    } else if (type === "coral_crab") {
        ctx.save();
        ctx.shadowColor = "#ec4899";
        ctx.shadowBlur = 8;
        ctx.strokeStyle = "#be123c";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        for (let side = -1; side <= 1; side += 2) {
            for (let leg = 0; leg < 3; leg++) {
                const legAngle = time * .2 + leg * .8 + (side > 0 ? 0 : Math.PI);
                const legWiggle = Math.sin(legAngle) * 4;
                const legBaseX = cx + side * (w * .32);
                const legBaseY = cy + 2 + leg * 4;
                ctx.beginPath();
                ctx.moveTo(legBaseX, legBaseY);
                ctx.lineTo(legBaseX + side * 12, legBaseY + 8 + legWiggle);
                ctx.lineTo(legBaseX + side * 18, legBaseY + 16);
                ctx.stroke();
            }
        }
        const shellGrad = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy, w * .44);
        shellGrad.addColorStop(0, "#fda4af");
        shellGrad.addColorStop(.5, "#f43f5e");
        shellGrad.addColorStop(1, "#9f1239");
        ctx.fillStyle = shellGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2, w * .42, h * .32, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#06b6d4";
        for (let n = -2; n <= 2; n++) {
            ctx.beginPath();
            ctx.arc(cx + n * 6, cy - 3 + Math.abs(n) * 2, 2.2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 7, cy - 4);
        ctx.lineTo(cx - 9, cy - 14);
        ctx.moveTo(cx + 7, cy - 4);
        ctx.lineTo(cx + 9, cy - 14);
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx - 9, cy - 14, 4, 0, Math.PI * 2);
        ctx.arc(cx + 9, cy - 14, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(cx - 9 + lookX * .4, cy - 14 + lookY * .4, 2, 0, Math.PI * 2);
        ctx.arc(cx + 9 + lookX * .4, cy - 14 + lookY * .4, 2, 0, Math.PI * 2);
        ctx.fill();
        const snap = Math.sin(time * .15) * .3;
        for (let side = -1; side <= 1; side += 2) {
            const clawX = cx + side * (w * .44);
            const clawY = cy - 4;
            ctx.fillStyle = "#f43f5e";
            ctx.strokeStyle = "#be123c";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(clawX, clawY, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.save();
            ctx.translate(clawX, clawY);
            ctx.rotate(side * (.4 + snap));
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(side * 8, -12, side * 14, -6);
            ctx.quadraticCurveTo(side * 6, -2, 0, 0);
            ctx.fill();
            ctx.stroke();
            ctx.rotate(-side * (.8 + snap * 2));
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(side * 8, 4, side * 12, 1);
            ctx.quadraticCurveTo(side * 6, -1, 0, 0);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
        ctx.shadowBlur = 0;
        ctx.restore();
    } else if (type === "jellyfish_orb") {
        const pulse = 1 + Math.sin(time * .18 + x) * .12;
        const jRad = w * .42 * pulse;
        ctx.save();
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 14;
        ctx.strokeStyle = "rgba(6, 182, 212, 0.75)";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        for (let t = -3; t <= 3; t++) {
            const tentX = cx + t * (w * .1);
            const tentPhase = time * .12 + t * .7;
            ctx.beginPath();
            ctx.moveTo(tentX, cy + 4);
            ctx.bezierCurveTo(tentX + Math.sin(tentPhase) * 10, cy + 16, tentX - Math.sin(tentPhase * 1.2) * 12, cy + 28, tentX + Math.sin(tentPhase * .8) * 8, cy + 40);
            ctx.stroke();
            ctx.fillStyle = "#e879f9";
            ctx.beginPath();
            ctx.arc(tentX + Math.sin(tentPhase * .8) * 8, cy + 40, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        const bellGrad = ctx.createRadialGradient(cx, cy - 4, 2, cx, cy, jRad);
        bellGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        bellGrad.addColorStop(.4, "rgba(56, 189, 248, 0.8)");
        bellGrad.addColorStop(.85, "rgba(168, 85, 247, 0.6)");
        bellGrad.addColorStop(1, "rgba(6, 182, 212, 0.2)");
        ctx.fillStyle = bellGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 2, jRad, Math.PI, 0, false);
        const folds = 5;
        for (let f = 0; f <= folds; f++) {
            const fx = cx + jRad - f / folds * (jRad * 2);
            const fy = cy - 2 + (f % 2 === 0 ? 4 : -2);
            ctx.lineTo(fx, fy);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx, cy - 8, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 1.2;
        for (let s = 0; s < 3; s++) {
            const sAng = time * .2 + s * (Math.PI * 2 / 3);
            ctx.beginPath();
            ctx.moveTo(cx, cy - 8);
            ctx.lineTo(cx + Math.cos(sAng) * 9, cy - 8 + Math.sin(sAng) * 7);
            ctx.stroke();
        }
        if (!isBlinking) {
            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.arc(cx - 6, cy - 6, 2.5, 0, Math.PI * 2);
            ctx.arc(cx + 6, cy - 6, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(cx - 6.8, cy - 6.8, 1, 0, Math.PI * 2);
            ctx.arc(cx + 5.2, cy - 6.8, 1, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.restore();
    } else if (type === "ink_octopus") {
        const fDir = facing || 1;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(fDir, 1);
        ctx.shadowColor = "#8b5cf6";
        ctx.shadowBlur = 12;
        for (let tIdx = 0; tIdx < 6; tIdx++) {
            const tBaseX = -w * .35 + tIdx * (w * .7) / 5;
            const tPhase = time * .12 + tIdx * .9;
            const tSwayX = Math.sin(tPhase) * 7;
            const tLength = h * .45 + Math.cos(tPhase * .8) * 4;
            ctx.strokeStyle = "#6d28d9";
            ctx.lineWidth = 3.2;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(tBaseX, h * .1);
            ctx.quadraticCurveTo(tBaseX + tSwayX * 1.3, h * .3, tBaseX + tSwayX, h * .1 + tLength);
            ctx.stroke();
            ctx.fillStyle = "#38bdf8";
            ctx.beginPath();
            ctx.arc(tBaseX + tSwayX * .6, h * .28, 1.8, 0, Math.PI * 2);
            ctx.arc(tBaseX + tSwayX * .9, h * .42, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        const octoGrad = ctx.createRadialGradient(-w * .08, -h * .15, 2, 0, -h * .05, w * .45);
        octoGrad.addColorStop(0, "#a855f7");
        octoGrad.addColorStop(.65, "#581c87");
        octoGrad.addColorStop(1, "#2e1065");
        ctx.fillStyle = octoGrad;
        ctx.beginPath();
        ctx.ellipse(0, -h * .08, w * .42, h * .38, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(216, 180, 254, 0.7)";
        ctx.beginPath();
        ctx.arc(-w * .15, -h * .28, 2.5, 0, Math.PI * 2);
        ctx.arc(w * .1, -h * .32, 2, 0, Math.PI * 2);
        ctx.arc(-w * .02, -h * .38, 1.8, 0, Math.PI * 2);
        ctx.arc(w * .22, -h * .22, 2.2, 0, Math.PI * 2);
        ctx.fill();
        const siphonOpen = enemyObj && enemyObj.mouthOpenTimer > 0 ? 1.5 : 1;
        ctx.fillStyle = "#3b0764";
        ctx.beginPath();
        ctx.ellipse(w * .28, h * .12, 5 * siphonOpen, 3.5 * siphonOpen, .2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        const eyeX1 = w * .05, eyeX2 = w * .24;
        const eyeY = -h * .06;
        ctx.fillStyle = "#fef08a";
        ctx.beginPath();
        ctx.ellipse(eyeX1, eyeY, 4.5, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(eyeX2, eyeY, 4.5, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.rect(eyeX1 - 3.2, eyeY - 1.2, 6.4, 2.4);
        ctx.rect(eyeX2 - 3.2, eyeY - 1.2, 6.4, 2.4);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(eyeX1 - 1.2, eyeY - 2, 1.2, 0, Math.PI * 2);
        ctx.arc(eyeX2 - 1.2, eyeY - 2, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
    } else if (type === "electric_squid") {
        const fDir = facing || 1;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(fDir, 1);
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 15;
        for (let tIdx = 0; tIdx < 6; tIdx++) {
            const tBaseX = -w * .32 + tIdx * (w * .64) / 5;
            const tPhase = time * .16 + tIdx * 1.1;
            const tSwayX = Math.sin(tPhase) * 9;
            const tLength = h * .5 + Math.cos(tPhase * .9) * 5;
            ctx.strokeStyle = tIdx === 2 || tIdx === 3 ? "#38bdf8" : "#0284c7";
            ctx.lineWidth = 2.8;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(tBaseX, h * .12);
            ctx.quadraticCurveTo(tBaseX + tSwayX * 1.4, h * .32, tBaseX + tSwayX, h * .12 + tLength);
            ctx.stroke();
            if (Math.sin(time * .3 + tIdx) > 0) {
                ctx.fillStyle = "#fef08a";
                ctx.beginPath();
                ctx.arc(tBaseX + tSwayX, h * .12 + tLength, 2.2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        const finFlap = Math.sin(time * .18) * 4;
        ctx.fillStyle = "#0284c7";
        ctx.beginPath();
        ctx.moveTo(0, -h * .48);
        ctx.lineTo(-w * .42 + finFlap, -h * .22);
        ctx.lineTo(0, -h * .15);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, -h * .48);
        ctx.lineTo(w * .42 - finFlap, -h * .22);
        ctx.lineTo(0, -h * .15);
        ctx.closePath();
        ctx.fill();
        const squidGrad = ctx.createRadialGradient(-w * .05, -h * .18, 3, 0, -h * .08, w * .46);
        squidGrad.addColorStop(0, "#67e8f9");
        squidGrad.addColorStop(.5, "#06b6d4");
        squidGrad.addColorStop(1, "#0e7490");
        ctx.fillStyle = squidGrad;
        ctx.beginPath();
        ctx.moveTo(0, -h * .48);
        ctx.quadraticCurveTo(w * .38, -h * .2, w * .32, h * .14);
        ctx.lineTo(-w * .32, h * .14);
        ctx.quadraticCurveTo(-w * .38, -h * .2, 0, -h * .48);
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = "#083344";
        ctx.stroke();
        ctx.strokeStyle = "#a5f3fc";
        ctx.lineWidth = 1.4;
        for (let r = 0; r < 3; r++) {
            const ry = -h * .3 + r * (h * .12);
            ctx.beginPath();
            ctx.moveTo(-w * .15 + r * 2, ry);
            ctx.lineTo(w * .15 - r * 2, ry);
            ctx.stroke();
        }
        const sEyeX1 = w * .04, sEyeX2 = w * .22;
        const sEyeY = h * .02;
        ctx.fillStyle = "#fef08a";
        ctx.beginPath();
        ctx.arc(sEyeX1, sEyeY, 4.2, 0, Math.PI * 2);
        ctx.arc(sEyeX2, sEyeY, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#082f49";
        ctx.beginPath();
        ctx.ellipse(sEyeX1, sEyeY, 1.8, 3.6, 0, 0, Math.PI * 2);
        ctx.ellipse(sEyeX2, sEyeY, 1.8, 3.6, 0, 0, Math.PI * 2);
        ctx.fill();
        if (enemyObj && enemyObj.mouthOpenTimer > 0) {
            ctx.strokeStyle = "#fef08a";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(w * .25, sEyeY);
            ctx.lineTo(w * .4, sEyeY - 4);
            ctx.lineTo(w * .35, sEyeY + 3);
            ctx.lineTo(w * .5, sEyeY);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
        ctx.restore();
    } else if (type === "burst") {
        const dir = facing || 1;
        const recoil = isFiringMouth ? -3.5 * dir : 0;
        const squishB = Math.sin(time * .12) * 1.5;
        ctx.fillStyle = "rgba(15, 23, 42, 0.35)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + h * .44, w * .42, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        const bodyGrad = ctx.createLinearGradient(cx - w * .4, cy - h * .4, cx + w * .4, cy + h * .4);
        bodyGrad.addColorStop(0, "#5a381e");
        bodyGrad.addColorStop(.5, "#3b2210");
        bodyGrad.addColorStop(1, "#241408");
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.roundRect(cx - w * .42 + recoil * .4, cy - h * .42 - squishB, w * .84, h * .84 + squishB, 8);
        ctx.fill();
        ctx.fillStyle = "#65a30d";
        ctx.beginPath();
        ctx.roundRect(cx - w * .42 + recoil * .4, cy - h * .42 - squishB, w * .84, 6, [ 8, 8, 0, 0 ]);
        ctx.fill();
        const pulse = .7 + Math.sin(time * .15) * .3;
        ctx.shadowColor = color || "#00ffaa";
        ctx.shadowBlur = 12 * pulse;
        ctx.fillStyle = color || "#00ffaa";
        ctx.beginPath();
        ctx.arc(cx - 3 * dir + recoil * .5, cy + 4 - squishB * .5, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        if (!isBlinking) {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.ellipse(cx - 6 + lookX * .5, cy - 6 + lookY * .5 - squishB, 4, 3.2, 0, 0, Math.PI * 2);
            ctx.ellipse(cx + 6 + lookX * .5, cy - 6 + lookY * .5 - squishB, 4, 3.2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = color || "#00ffaa";
            ctx.beginPath();
            ctx.arc(cx - 6 + lookX * .7, cy - 6 + lookY * .7 - squishB, 2, 0, Math.PI * 2);
            ctx.arc(cx + 6 + lookX * .7, cy - 6 + lookY * .7 - squishB, 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.strokeStyle = color || "#00ffaa";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx - 9, cy - 6 - squishB);
            ctx.lineTo(cx - 3, cy - 6 - squishB);
            ctx.moveTo(cx + 3, cy - 6 - squishB);
            ctx.lineTo(cx + 9, cy - 6 - squishB);
            ctx.stroke();
        }
        const cannonX = cx + dir * (w * .36) + recoil;
        const cannonY = cy - 2 - squishB;
        const canGrad = ctx.createLinearGradient(cannonX - 6, cannonY, cannonX + 6, cannonY);
        canGrad.addColorStop(0, "#78350f");
        canGrad.addColorStop(1, "#451a03");
        ctx.fillStyle = canGrad;
        ctx.beginPath();
        ctx.roundRect(dir > 0 ? cannonX : cannonX - 12, cannonY - 6, 12, 12, 3);
        ctx.fill();
        if (isFiringMouth) {
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = color || "#00ffaa";
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.arc(dir > 0 ? cannonX + 12 : cannonX - 12, cannonY, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    } else {
        const breath = Math.sin(time * .12 + (enemyObj ? enemyObj.x * .05 : 0)) * 1.5;
        const drawW = w * .9;
        const drawH = h * .9 + breath;
        ctx.fillStyle = "rgba(15, 23, 42, 0.3)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + h * .44, drawW * .45, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        const sphereGrad = ctx.createRadialGradient(cx - drawW * .2, cy - drawH * .2, 3, cx, cy, drawW * .65);
        sphereGrad.addColorStop(0, "#ffffff");
        sphereGrad.addColorStop(.3, color || "#ff4444");
        sphereGrad.addColorStop(.85, color || "#cc2222");
        sphereGrad.addColorStop(1, "#110505");
        ctx.fillStyle = sphereGrad;
        ctx.shadowColor = color || "#ff4444";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(cx - drawW * .5, cy - drawH * .5, drawW, drawH, 10);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cx - drawW * .45, cy - drawH * .45, drawW * .9, drawH * .4, 6);
        ctx.stroke();
        if (!isBlinking) {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.ellipse(cx - 7 + lookX * .5, cy - 4 + lookY * .5, 4.5, 4, 0, 0, Math.PI * 2);
            ctx.ellipse(cx + 7 + lookX * .5, cy - 4 + lookY * .5, 4.5, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ff0044";
            ctx.beginPath();
            ctx.arc(cx - 7 + lookX, cy - 4 + lookY, 2.5, 0, Math.PI * 2);
            ctx.arc(cx + 7 + lookX, cy - 4 + lookY, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(cx - 8 + lookX, cy - 5 + lookY, 1.2, 0, Math.PI * 2);
            ctx.arc(cx + 6 + lookX, cy - 5 + lookY, 1.2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.strokeStyle = "#111";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx - 7, cy - 4, 3.5, 0, Math.PI);
            ctx.arc(cx + 7, cy - 4, 3.5, 0, Math.PI);
            ctx.stroke();
        }
        if (isFiringMouth) {
            ctx.fillStyle = "#111";
            ctx.beginPath();
            ctx.ellipse(cx, cy + 5, 5, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.strokeStyle = "#111";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy + 4, 4, .1 * Math.PI, .9 * Math.PI);
            ctx.stroke();
        }
    }
    if (enemyObj && enemyObj.enraged) {
        ctx.save();
        ctx.shadowColor = "#ff0033";
        ctx.shadowBlur = 18;
        ctx.strokeStyle = "rgba(255, 0, 50, 0.8)";
        ctx.lineWidth = 2.5;
        ctx.strokeRect(x - 2, y - 2, w + 4, h + 4);
        ctx.restore();
    }
    if (enemyObj && enemyObj.hasShield && enemyObj.shieldActive) {
        ctx.save();
        const sRad = Math.max(w, h) * .85 + Math.sin(time * .15) * 2.5;
        const flash = enemyObj.shieldHitFlash > 0;
        ctx.shadowColor = flash ? "#ffffff" : "#00ffff";
        ctx.shadowBlur = flash ? 24 : 14;
        const shieldGrad = ctx.createRadialGradient(cx, cy, sRad * .2, cx, cy, sRad);
        shieldGrad.addColorStop(0, "rgba(0, 240, 255, 0.04)");
        shieldGrad.addColorStop(.7, flash ? "rgba(255, 255, 255, 0.35)" : "rgba(0, 210, 255, 0.2)");
        shieldGrad.addColorStop(1, flash ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 255, 255, 0.6)");
        ctx.fillStyle = shieldGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, sRad, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = flash ? "#ffffff" : "rgba(0, 255, 255, 0.85)";
        ctx.lineWidth = flash ? 3.5 : 2;
        ctx.stroke();
        const rot = time * .03;
        ctx.strokeStyle = flash ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 240, 255, 0.35)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let a = 0; a < 6; a++) {
            const ang = rot + a * (Math.PI / 3);
            const hx = cx + Math.cos(ang) * sRad * .88;
            const hy = cy + Math.sin(ang) * sRad * .88;
            if (a === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.stroke();
        for (let s = 0; s < 3; s++) {
            const sAng = -time * .05 + s * (Math.PI * 2 / 3);
            const px = cx + Math.cos(sAng) * sRad;
            const py = cy + Math.sin(sAng) * sRad;
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
        const barW = Math.max(w, 40);
        const bx = cx - barW / 2;
        const by = y - (maxHealth > 1 ? 24 : 16);
        ctx.fillStyle = "rgba(0, 20, 40, 0.85)";
        ctx.fillRect(bx - 1, by - 1, barW + 2, 5);
        ctx.fillStyle = "#00f0ff";
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 6;
        ctx.fillRect(bx, by, barW * Math.max(0, enemyObj.shieldHp / enemyObj.shieldMaxHp), 3);
        ctx.shadowBlur = 0;
        if (enemyObj.shieldHitFlash > 0) enemyObj.shieldHitFlash--;
    }
    drawHorrorEnemyOverlay(ctx, cx, cy, w, h, facing, lookX, lookY);
    ctx.restore();
}

function drawHuntFace(ctx, x, y, w, h, mood) {
    const cx = x + w / 2, cy = y + h / 2;
    ctx.save();
    if (mood === 0) {
        ctx.fillStyle = "#000";
        ctx.fillRect(cx - 8, cy - 6, 5, 6);
        ctx.fillRect(cx + 3, cy - 6, 5, 6);
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy + 2, 6, .15 * Math.PI, .85 * Math.PI);
        ctx.stroke();
    } else if (mood === 1) {
        ctx.fillStyle = "#000";
        ctx.fillRect(cx - 8, cy - 6, 5, 6);
        ctx.fillRect(cx + 3, cy - 6, 5, 6);
        ctx.fillRect(cx - 6, cy + 5, 12, 3);
    } else if (mood === 2) {
        ctx.fillStyle = "#000";
        ctx.fillRect(cx - 8, cy - 6, 5, 6);
        ctx.fillRect(cx + 3, cy - 6, 5, 6);
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy + 9, 5, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
    } else if (mood === 3) {
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(cx - 6, cy - 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 6, cy - 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy + 6, 6, 1.1 * Math.PI, 1.9 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = "#6df";
        ctx.beginPath();
        ctx.arc(cx + 10, cy - 9, 2.2, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(cx - 6, cy - 4, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 6, cy - 4, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f00";
        ctx.fillRect(cx - 8, cy - 6, 2, 2);
        ctx.fillRect(cx + 5, cy - 6, 2, 2);
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(cx, cy + 7, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.moveTo(cx - 6, cy + 2);
        ctx.lineTo(cx - 3, cy + 8);
        ctx.lineTo(cx - 1, cy + 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 1, cy + 2);
        ctx.lineTo(cx + 3, cy + 8);
        ctx.lineTo(cx + 6, cy + 2);
        ctx.fill();
    }
    ctx.restore();
}

function huntMood() {
    const k = game.huntKills || 0;
    if (k >= 7) return 4;
    if (k >= 5) return 3;
    if (k >= 3) return 2;
    if (k >= 1) return 1;
    return 0;
}

function drawMacabreFace(a) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, a);
    const cx = VIEW_W / 2, cy = VIEW_H * .42;
    ctx.fillStyle = "rgba(0,0,0,0.9)";
    ctx.beginPath();
    ctx.arc(cx - 70, cy, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 70, cy, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(cx - 78, cy - 8, 16, 16);
    ctx.fillRect(cx + 62, cy - 8, 16, 16);
    ctx.fillStyle = "rgba(0,0,0,0.9)";
    ctx.beginPath();
    ctx.arc(cx, cy + 96, 48, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = "#fff";
    for (let i = -3; i <= 3; i++) {
        const bx = cx + i * 13;
        ctx.beginPath();
        ctx.moveTo(bx - 10, cy + 56);
        ctx.lineTo(bx, cy + 74);
        ctx.lineTo(bx + 10, cy + 56);
        ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
}

function drawPeggyDagger(ctx, kx, ky, facing, knifeShow, kills = 0) {
    ctx.save();
    ctx.translate(kx, ky);
    const stabAngle = knifeShow > 0 ? facing === 1 ? .45 : -.45 : facing === 1 ? .2 : -.2;
    ctx.rotate(stabAngle);
    if (facing === -1) ctx.scale(-1, 1);
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.roundRect(-4, 6, 8, 14, 2);
    ctx.fill();
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(0, 10, 1.4, 0, Math.PI * 2);
    ctx.arc(0, 16, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#64748b";
    ctx.fillRect(-8, 4, 16, 3);
    const bladeGrad = ctx.createLinearGradient(0, 4, 0, -28);
    bladeGrad.addColorStop(0, "#94a3b8");
    bladeGrad.addColorStop(.4, "#e2e8f0");
    bladeGrad.addColorStop(1, "#ffffff");
    ctx.fillStyle = bladeGrad;
    ctx.beginPath();
    ctx.moveTo(-5, 4);
    ctx.lineTo(-4, -18);
    ctx.lineTo(0, -28);
    ctx.lineTo(4, -16);
    ctx.lineTo(5, 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(0, -27);
    ctx.stroke();
    if (knifeShow > 0) {
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, -28, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    if (kills > 0) {
        ctx.fillStyle = "rgba(185, 28, 28, 0.88)";
        ctx.beginPath();
        ctx.moveTo(-2, -6);
        ctx.lineTo(0, -24);
        ctx.lineTo(3, -12);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();
}

function drawNightmareFriend(ctx, enemy, offsetX, t) {
    const x = enemy.x - offsetX;
    const y = enemy.y;
    const w = enemy.w;
    const h = enemy.h;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const facing = enemy.facing || -1;
    const friendCols = [ "#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#ff8f6b", "#c77dff", "#ff5d8f", "#5fd0e8" ];
    const colIdx = Math.abs(Math.floor(enemy.x * .05)) % friendCols.length;
    const baseColor = enemy.color || friendCols[colIdx];
    ctx.save();
    const fearTrembleX = (Math.random() - .5) * 3.5;
    const fearTrembleY = (Math.random() - .5) * 2;
    ctx.translate(cx + fearTrembleX, cy + fearTrembleY);
    const runTilt = facing * .12;
    ctx.rotate(runTilt);
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.ellipse(0, h / 2 + 2, w * .45, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    const legSwing = Math.sin(t * .45) * 6;
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.beginPath();
    ctx.arc(-w * .25, h / 2 + 1 + legSwing, 4, 0, Math.PI * 2);
    ctx.arc(w * .25, h / 2 + 1 - legSwing, 4, 0, Math.PI * 2);
    ctx.fill();
    const bodyGrad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    bodyGrad.addColorStop(0, "#ffffff");
    bodyGrad.addColorStop(.2, baseColor);
    bodyGrad.addColorStop(1, "#111827");
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 10);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 10);
    ctx.stroke();
    ctx.fillStyle = "rgba(244, 63, 94, 0.5)";
    ctx.beginPath();
    ctx.ellipse(-w * .32, h * .1, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.ellipse(w * .32, h * .1, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    const handBob = Math.cos(t * .4) * 4;
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.arc(-w * .5 - 2, -h * .2 + handBob, 4, 0, Math.PI * 2);
    ctx.arc(w * .5 + 2, -h * .2 - handBob, 4, 0, Math.PI * 2);
    ctx.fill();
    const eyeW = 7;
    const eyeH = 8.5;
    const eyeY = -h * .12;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(-w * .22, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
    ctx.ellipse(w * .22, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    const lookPeggy = game.player && game.player.x > enemy.x ? 1 : -1;
    const pupilXOff = lookPeggy * 2.8 + (Math.random() - .5) * 1.2;
    const pupilYOff = (Math.random() - .5) * 1.2;
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(-w * .22 + pupilXOff, eyeY + pupilYOff, 3.2, 0, Math.PI * 2);
    ctx.arc(w * .22 + pupilXOff, eyeY + pupilYOff, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-w * .22 + pupilXOff - 1.2, eyeY + pupilYOff - 1.5, 1.3, 0, Math.PI * 2);
    ctx.arc(w * .22 + pupilXOff - 1.2, eyeY + pupilYOff - 1.5, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-w * .36, eyeY - eyeH - 1);
    ctx.lineTo(-w * .12, eyeY - eyeH - 4);
    ctx.moveTo(w * .36, eyeY - eyeH - 1);
    ctx.lineTo(w * .12, eyeY - eyeH - 4);
    ctx.stroke();
    const mouthY = h * .22;
    ctx.fillStyle = "#09090b";
    ctx.beginPath();
    ctx.ellipse(0, mouthY, 6, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fb7185";
    ctx.beginPath();
    ctx.arc(0, mouthY + 3.5, 3.5, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-3.5, mouthY - 6.5, 7, 3);
    ctx.fillStyle = "#38bdf8";
    const sweatDropX = -facing * (w * .38);
    ctx.beginPath();
    ctx.arc(sweatDropX, -h * .38, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(sweatDropX, -h * .44);
    ctx.lineTo(sweatDropX - 2, -h * .36);
    ctx.lineTo(sweatDropX + 2, -h * .36);
    ctx.fill();
    const tearDir = -facing;
    const tearWave = Math.sin(t * .3) * 2;
    ctx.fillStyle = "rgba(56, 189, 248, 0.85)";
    ctx.beginPath();
    ctx.ellipse(tearDir * (w * .5 + 6), eyeY + 2 + tearWave, 4, 2.2, facing * .3, 0, Math.PI * 2);
    ctx.ellipse(tearDir * (w * .5 + 16), eyeY + tearWave * 1.5, 3, 1.8, facing * .2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function updateAndDrawRestos(ctx, cameraX) {
    if (!Array.isArray(restos) || restos.length === 0) return;
    for (let i = 0; i < restos.length; i++) {
        const r = restos[i];
        if (r.vx === undefined) {
            r.vx = 0;
            r.vy = 0;
            r.rot = 0;
            r.vRot = 0;
            r.settled = true;
            r.poolRadius = r.w * .7;
        }
        if (!r.settled) {
            r.vy += .38;
            r.x += r.vx;
            r.y += r.vy;
            r.rot += r.vRot;
            r.vx *= .985;
            if (Math.random() < .65 && Array.isArray(blood)) {
                blood.push({
                    x: r.x,
                    y: r.y,
                    vx: -r.vx * .15 + (Math.random() - .5) * 2,
                    vy: -r.vy * .15 + (Math.random() - .5) * 2,
                    life: 36,
                    color: "#990000"
                });
            }
            const bottomY = r.y + r.h / 2;
            if (bottomY >= r.groundY) {
                r.y = r.groundY - r.h / 2;
                r.vy = -r.vy * .38;
                r.vx *= .6;
                r.vRot *= .45;
                r.bounces = (r.bounces || 0) + 1;
                if (Array.isArray(blood)) {
                    for (let s = 0; s < 6; s++) {
                        blood.push({
                            x: r.x + (Math.random() - .5) * 16,
                            y: r.groundY - 2,
                            vx: (Math.random() - .5) * 6,
                            vy: -(Math.random() * 3 + 1),
                            life: 28,
                            color: "#aa0000"
                        });
                    }
                }
                if (Math.abs(r.vy) < .7 || r.bounces >= 3) {
                    r.settled = true;
                    r.vy = 0;
                    r.vx = 0;
                    r.vRot = 0;
                    r.y = r.groundY - r.h / 2;
                }
            }
        } else {
            if (r.poolRadius === undefined) r.poolRadius = 0;
            if (r.poolRadius < r.w * .85) {
                r.poolRadius += .35;
            }
        }
        const screenX = r.x - cameraX;
        if (screenX < -150 || screenX > VIEW_W + 150) continue;
        if (r.poolRadius > 2) {
            ctx.save();
            ctx.fillStyle = "rgba(136, 0, 18, 0.85)";
            ctx.beginPath();
            ctx.ellipse(screenX, r.groundY - 1, r.poolRadius, r.poolRadius * .28, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        ctx.save();
        ctx.translate(screenX, r.y);
        ctx.rotate(r.rot);
        const halfW = r.w / 2;
        const halfH = r.h / 2;
        if (r.part === "top") {
            ctx.fillStyle = r.color || "#ff6b6b";
            ctx.beginPath();
            ctx.roundRect(-halfW, -halfH, r.w, r.h, [ 8, 8, 2, 2 ]);
            ctx.fill();
            ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
            ctx.beginPath();
            ctx.ellipse(-halfW * .2, -halfH + 4, halfW * .5, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#111111";
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(-halfW * .65, -halfH * .3);
            ctx.lineTo(-halfW * .35, -halfH * .1);
            ctx.lineTo(-halfW * .65, halfH * .1);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(halfW * .65, -halfH * .3);
            ctx.lineTo(halfW * .35, -halfH * .1);
            ctx.lineTo(halfW * .65, halfH * .1);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-halfW * .7, -halfH * .55);
            ctx.lineTo(-halfW * .3, -halfH * .4);
            ctx.moveTo(halfW * .7, -halfH * .55);
            ctx.lineTo(halfW * .3, -halfH * .4);
            ctx.stroke();
            ctx.fillStyle = "#38bdf8";
            ctx.beginPath();
            ctx.arc(-halfW * .25, halfH * .15, 2.2, 0, Math.PI * 2);
            ctx.arc(halfW * .25, halfH * .15, 2.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#1e1b4b";
            ctx.beginPath();
            ctx.ellipse(0, halfH * .35, 5, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#7f1d1d";
            ctx.fillRect(-halfW, halfH - 4, r.w, 4);
            ctx.fillStyle = "#b91c1c";
            for (let d = -halfW + 3; d < halfW - 2; d += 6) {
                ctx.beginPath();
                ctx.arc(d, halfH - 1, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (r.part === "bottom") {
            ctx.fillStyle = r.color || "#ff6b6b";
            ctx.beginPath();
            ctx.roundRect(-halfW, -halfH, r.w, r.h, [ 2, 2, 6, 6 ]);
            ctx.fill();
            ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
            ctx.beginPath();
            ctx.arc(-halfW * .4, halfH - 1, 3.5, 0, Math.PI * 2);
            ctx.arc(halfW * .4, halfH - 1, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#7f1d1d";
            ctx.fillRect(-halfW, -halfH, r.w, 4);
            ctx.fillStyle = "#dc2626";
            for (let d = -halfW + 4; d < halfW - 2; d += 7) {
                ctx.beginPath();
                ctx.arc(d, -halfH + 1, 2.2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            const hh = r.h / 2;
            ctx.fillStyle = r.color || "#ff6b6b";
            ctx.fillRect(-halfW, -halfH, r.w, r.h);
            ctx.fillStyle = "#b00";
            ctx.fillRect(-halfW, -2, r.w, 4);
        }
        ctx.restore();
    }
}

window.drawPeggyDagger = drawPeggyDagger;

window.drawNightmareFriend = drawNightmareFriend;

window.updateAndDrawRestos = updateAndDrawRestos;

window.drawHuntFace = drawHuntFace;

window.huntMood = huntMood;

window.drawMacabreFace = drawMacabreFace;
// Isaac Daniel Cotera - 2026 | Correo: isaacdanielcotera@gmail.com | Itch.io: https://cotera.itch.io | GitHub: https://github.com/cotera2024
