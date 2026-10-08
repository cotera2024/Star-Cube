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
    const isShocked = playerRef && playerRef.electricShockTimer > 0;
    if (isShocked) {
        x += (Math.random() - .5) * 6;
        y += (Math.random() - .5) * 6;
    }
    const cx = x + w / 2;
    const cy = y + h;
    ctx.save();
    if (isShocked) {
        const isWhite = Math.floor(playerRef.electricShockTimer / 2) % 2 === 0;
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.ellipse(cx, y + h + 2, w * .45, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isWhite ? "#ffffff" : "#050505";
        ctx.shadowColor = isWhite ? "#fde047" : "#00f0ff";
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 10);
        ctx.fill();
        ctx.strokeStyle = isWhite ? "#fde047" : "#00f0ff";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.shadowBlur = 0;

        const featCol = isWhite ? "#050505" : "#ffffff";
        ctx.fillStyle = featCol;
        ctx.strokeStyle = featCol;

        if (isWhite) {
            ctx.beginPath();
            ctx.ellipse(x + w * .3, y + h * .36, 4.5, 6.5, 0, 0, Math.PI * 2);
            ctx.ellipse(x + w * .7, y + h * .36, 4.5, 6.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(cx, y + h * .68, 6, 7.5, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(x + w * .3, y + h * .34, 4.5, 0, Math.PI * 2);
            ctx.arc(x + w * .7, y + h * .34, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(cx - 2, y + h * .47, 4, h * .33);
            ctx.lineWidth = 2.4;
            for (let r = 0; r < 3; r++) {
                const ry = y + h * (.53 + r * .09);
                ctx.beginPath();
                ctx.moveTo(cx - 9, ry);
                ctx.lineTo(cx + 9, ry);
                ctx.stroke();
            }
        }

        ctx.shadowColor = isWhite ? "#fde047" : "#00f0ff";
        ctx.shadowBlur = 12;
        ctx.strokeStyle = Math.random() < .5 ? "#fde047" : "#00f0ff";
        ctx.lineWidth = 2.4;
        for (let s = 0; s < 6; s++) {
            const ang = s / 6 * Math.PI * 2 + (Math.random() - .5) * .4;
            const dist1 = Math.max(w, h) * .55;
            const dist2 = dist1 + 8 + Math.random() * 16;
            const sx1 = cx + Math.cos(ang) * dist1;
            const sy1 = y + h / 2 + Math.sin(ang) * dist1;
            const midX = cx + Math.cos(ang + (Math.random() - .5) * .6) * (dist1 + 6);
            const midY = y + h / 2 + Math.sin(ang + (Math.random() - .5) * .6) * (dist1 + 6);
            const sx2 = cx + Math.cos(ang) * dist2;
            const sy2 = y + h / 2 + Math.sin(ang) * dist2;
            ctx.beginPath();
            ctx.moveTo(sx1, sy1);
            ctx.lineTo(midX, midY);
            ctx.lineTo(sx2, sy2);
            ctx.stroke();

            ctx.fillStyle = isWhite ? "#fde047" : "#ffffff";
            ctx.beginPath();
            ctx.arc(sx2, sy2, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
        return;
    }
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
    const extraRot = (playerRef && playerRef.rotation) || 0;
    const runTilt = (window.postGameHorror ? 0 : isRunning ? facing * .12 : isJumping ? facing * .06 : 0) + extraRot;
    
    let dynStretchY = 0;
    let dynStretchX = 0;
    if (isJumping && playerRef && typeof playerRef.vy !== "undefined") {
        dynStretchY = Math.min(0.25, Math.abs(playerRef.vy) * 0.02);
        dynStretchX = -dynStretchY * 0.7;
    }

    const finalScaleX = scaleX * (1 + idleBreath + dynStretchX);
    const finalScaleY = scaleY * (1 - idleBreath + dynStretchY);
    ctx.translate(cx, y + h / 2);
    ctx.rotate(runTilt);
    ctx.scale(finalScaleX, finalScaleY);
    ctx.translate(-cx, -(y + h / 2));
    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    ctx.beginPath();
    ctx.ellipse(cx, y + h + 2, w * .44, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isCharging) {
        ctx.save();
        const pulse = Math.sin(time * (12 + chargeLvl * 3)) * (1.5 + chargeLvl * 0.5);
        let auraColor, auraFill, auraGlow;
        if (chargeLvl === 0) {
            auraColor = "rgba(0, 210, 255, 0.65)";
            auraFill = "rgba(0, 210, 255, 0.14)";
            auraGlow = 10;
        } else if (chargeLvl === 1) {
            auraColor = "rgba(168, 85, 247, 0.75)";
            auraFill = "rgba(168, 85, 247, 0.18)";
            auraGlow = 14;
        } else if (chargeLvl === 2) {
            auraColor = "rgba(249, 115, 22, 0.82)";
            auraFill = "rgba(249, 115, 22, 0.22)";
            auraGlow = 18;
        } else if (chargeLvl === 3) {
            auraColor = "rgba(239, 68, 68, 0.9)";
            auraFill = "rgba(239, 68, 68, 0.26)";
            auraGlow = 22;
        } else {
            const hue = Math.floor((time * 300) % 360);
            auraColor = `hsl(${hue}, 100%, 68%)`;
            auraFill = `hsla(${hue}, 100%, 68%, 0.32)`;
            auraGlow = 28;
        }
        ctx.shadowColor = auraColor;
        ctx.shadowBlur = auraGlow;
        ctx.fillStyle = auraFill;
        ctx.strokeStyle = auraColor;
        ctx.lineWidth = 2 + (chargeLvl >= 4 ? 2 : chargeLvl * 0.5);
        ctx.beginPath();
        ctx.roundRect(x - 3 - pulse, y - 3 - pulse, w + 6 + pulse * 2, h + 6 + pulse * 2, 13);
        ctx.fill();
        ctx.stroke();

        if (chargeLvl >= 4) {
            const numOrbits = chargeLvl === 5 ? 4 : 2;
            for (let o = 0; o < numOrbits; o++) {
                const ang = time * 8 + (o * Math.PI * 2 / numOrbits);
                const orX = cx + Math.cos(ang) * (w * 0.72 + pulse);
                const orY = y + h * 0.5 + Math.sin(ang) * (h * 0.72 + pulse);
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(orX, orY, 2 + Math.random(), 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    }
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
    if (playerRef && playerRef.colorTop && playerRef.colorBot) {
        const customGrad = ctx.createLinearGradient(x, y, x, y + h);
        customGrad.addColorStop(0, playerRef.colorTop);
        customGrad.addColorStop(1, playerRef.colorBot);
        ctx.fillStyle = customGrad;
    } else {
        ctx.fillStyle = _playerGradCache.grad;
    }

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
        const eyeCol = chargeLvl === 5 ? "#00ffff" : chargeLvl === 4 ? "#ff0055" : chargeLvl >= 2 ? "#00ffff" : "#ffea00";
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x + w * .3, eyeY, 5.8, 0, Math.PI * 2);
        ctx.arc(x + w * .7, eyeY, 5.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = eyeCol;
        ctx.shadowColor = eyeCol;
        ctx.shadowBlur = chargeLvl === 5 ? 12 : 6;
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
    } else if (playerRef && (playerRef.scared || currentLevel === 4 && (game.lvl4State === "stalk_left" || game.lvl4State === "falling" || game.lvl4State === "dark_chase"))) {
        ctx.beginPath();
        ctx.moveTo(x + w * .16, eyeY - 6);
        ctx.lineTo(x + w * .36, eyeY - 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w * .84, eyeY - 6);
        ctx.lineTo(x + w * .64, eyeY - 10);
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
    } else if (playerRef && (playerRef.scared || currentLevel === 4 && (game.lvl4State === "stalk_left" || game.lvl4State === "falling" || game.lvl4State === "dark_chase"))) {
        ctx.fillStyle = "#111111";
        ctx.beginPath();
        ctx.ellipse(cx, mouthY, 4, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
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
        } else if (chargeLvl === 5) {
            const auraR = 34 + Math.sin(time * 0.45) * 3;
            const gAura = ctx.createRadialGradient(cx, cy - h / 2, 8, cx, cy - h / 2, auraR);
            gAura.addColorStop(0, "rgba(255, 255, 255, 0.65)");
            gAura.addColorStop(0.35, "rgba(0, 255, 255, 0.5)");
            gAura.addColorStop(0.7, "rgba(0, 100, 255, 0.35)");
            gAura.addColorStop(1, "rgba(0, 50, 255, 0)");
            ctx.fillStyle = gAura;
            ctx.beginPath();
            ctx.arc(cx, cy - h / 2, auraR, 0, Math.PI * 2);
            ctx.fill();

            ctx.save();
            ctx.translate(cx, cy - h / 2);
            ctx.rotate(time * 0.28);
            ctx.strokeStyle = "rgba(0, 255, 255, 0.85)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.ellipse(0, 0, auraR * 1.05, auraR * 0.45, 0.3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.rotate(-time * 0.55);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, 0, auraR * 0.45, auraR * 1.05, -0.3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.8;
            for (let k = 0; k < 6; k++) {
                const ang = time * 0.3 + k * (Math.PI / 3);
                const rx = cx + Math.cos(ang) * (auraR * 0.9);
                const ry = (cy - h / 2) + Math.sin(ang) * (auraR * 0.9);
                ctx.beginPath();
                ctx.moveTo(rx, ry);
                ctx.lineTo(cx + (Math.random() - 0.5) * 12, (cy - h / 2) + (Math.random() - 0.5) * 12);
                ctx.stroke();
            }

            for (let k = 0; k < 5; k++) {
                const bAng = time * 0.18 + k * (Math.PI * 2 / 5);
                const bx = cx + Math.cos(bAng) * (auraR * 0.85);
                const by = (cy - h / 2) + Math.sin(bAng) * (auraR * 0.65);
                const bRad = 3.5 + Math.sin(time * 0.3 + k) * 1.5;
                const gB = ctx.createRadialGradient(bx, by, bRad * 0.2, bx, by, bRad);
                gB.addColorStop(0, "#ffffff");
                gB.addColorStop(0.5, "#00ffff");
                gB.addColorStop(1, "rgba(0, 50, 255, 0)");
                ctx.fillStyle = gB;
                ctx.beginPath();
                ctx.arc(bx, by, bRad, 0, Math.PI * 2);
                ctx.fill();
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
        } else if (chargeLvl === 5) {
            const r5 = 24 + Math.sin(time * 0.6) * 4;
            const g5 = ctx.createRadialGradient(handX, handY, 4, handX, handY, r5 * 2.8);
            g5.addColorStop(0, "#ffffff");
            g5.addColorStop(0.3, "#00ffff");
            g5.addColorStop(0.65, "rgba(0, 110, 255, 0.85)");
            g5.addColorStop(1, "rgba(0, 50, 255, 0)");
            ctx.fillStyle = g5;
            ctx.beginPath();
            ctx.arc(handX, handY, r5 * 2.8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(handX, handY, r5 * 0.9, 0, Math.PI * 2);
            ctx.fill();

            ctx.save();
            ctx.translate(handX, handY);
            ctx.rotate(time * 0.4);
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, 0, r5 * 1.3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = "#00ffff";
            ctx.lineWidth = 2;
            for (let k = 0; k < 8; k++) {
                const ang = k * (Math.PI / 4);
                ctx.beginPath();
                ctx.moveTo(Math.cos(ang) * (r5 * 0.9), Math.sin(ang) * (r5 * 0.9));
                ctx.lineTo(Math.cos(ang) * (r5 * 2.2), Math.sin(ang) * (r5 * 2.2));
                ctx.stroke();
            }
            ctx.restore();
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
        const jitterX = (Math.random() - .5) * 4.5;
        const jitterY = (Math.random() - .5) * 4.5;
        const cx = px + jitterX;
        const cy = py + jitterY;
        const pulse = 1 + .22 * Math.sin(time * 1.1) + (Math.random() - .5) * .12;
        const rad = Math.max(w, h) * .68 * pulse;

        ctx.save();
        const streakColors = [ "rgba(0, 255, 255, 0.45)", "rgba(255, 0, 224, 0.45)", "rgba(255, 255, 255, 0.7)", "rgba(255, 215, 0, 0.4)" ];
        for (let st = 0; st < 16; st++) {
            const sY = (st * 40 + (time * 210 + st * 83)) % (typeof VIEW_H !== "undefined" ? VIEW_H : 600);
            const sLen = 140 + Math.random() * 260;
            const seed = (time * 980 + st * 150) % ((typeof VIEW_W !== "undefined" ? VIEW_W : 1024) + sLen);
            const sX = dir > 0 ? seed : ((typeof VIEW_W !== "undefined" ? VIEW_W : 1024) - seed);
            const sGrad = ctx.createLinearGradient(sX, sY, sX - dir * sLen, sY);
            sGrad.addColorStop(0, streakColors[st % 4]);
            sGrad.addColorStop(1, "rgba(0,0,0,0)");
            ctx.strokeStyle = sGrad;
            ctx.lineWidth = 1.6 + Math.random() * 2.2;
            ctx.beginPath();
            ctx.moveTo(sX, sY);
            ctx.lineTo(sX - dir * sLen, sY);
            ctx.stroke();
        }
        ctx.restore();

        const ghostColors = [ "#ff00e0", "#00ffff", "#ffd700", "#a855f7", "#ffffff" ];
        for (let ai = 5; ai >= 1; ai--) {
            const ghostX = cx - dir * (ai * 30);
            const ghostY = cy + Math.sin(time * 0.8 + ai) * 2;
            const ghostAlpha = .55 - ai * .09;
            ctx.save();
            ctx.globalAlpha = Math.max(.08, ghostAlpha);
            ctx.fillStyle = ghostColors[ai % ghostColors.length];
            ctx.shadowColor = ghostColors[ai % ghostColors.length];
            ctx.shadowBlur = 24;
            ctx.beginPath();
            ctx.ellipse(ghostX, ghostY, w * .58 * (1 - ai * .07), h * .58 * (1 - ai * .07), 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        ctx.save();
        for (let sl = 0; sl < 18; sl++) {
            const sOffset = (Math.random() - .5) * (h * 2.8);
            const lineY = cy + sOffset;
            const lineLen = 90 + Math.random() * 140;
            const lineX = cx - dir * (Math.random() * 95 + 5);
            const sGrad = ctx.createLinearGradient(lineX, lineY, lineX - dir * lineLen, lineY);
            sGrad.addColorStop(0, "rgba(255, 255, 255, 0.98)");
            sGrad.addColorStop(.3, sl % 2 === 0 ? "rgba(0, 255, 255, 0.9)" : "rgba(255, 0, 224, 0.9)");
            sGrad.addColorStop(.7, "rgba(255, 215, 0, 0.6)");
            sGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.strokeStyle = sGrad;
            ctx.lineWidth = 2.2 + Math.random() * 2.4;
            ctx.beginPath();
            ctx.moveTo(lineX, lineY);
            ctx.lineTo(lineX - dir * lineLen, lineY);
            ctx.stroke();
        }
        ctx.restore();

        const tailLen = 175;
        const tailColors = [ "#ff00e0", "#00ffff", "#ffffff", "#ffd700" ];
        for (let i = 26; i >= 0; i--) {
            const t = i / 26;
            const tx = cx - dir * tailLen * t + (Math.random() - .5) * 6;
            const ty = cy + (Math.random() - .5) * 7;
            const rTail = rad * (1 - t * .45);
            const col = tailColors[i % 4];
            ctx.globalAlpha = (1 - t) * .8;
            ctx.fillStyle = col;
            ctx.shadowColor = col;
            ctx.shadowBlur = 30 * (1 - t);
            ctx.beginPath();
            ctx.arc(tx, ty, Math.max(1, rTail), 0, Math.PI * 2);
            ctx.fill();
            if (i % 2 === 0) {
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2.8 * (1 - t);
                ctx.beginPath();
                ctx.moveTo(tx, ty);
                ctx.lineTo(tx - dir * 22 + (Math.random() - .5) * 24, ty + (Math.random() - .5) * 30);
                ctx.stroke();
            }
        }

        ctx.save();
        for (let r = 0; r < 4; r++) {
            const ringDist = (time * 42 + r * 28) % 110;
            const ringX = cx - dir * ringDist;
            const ringAlpha = 1 - ringDist / 110;
            ctx.strokeStyle = r % 2 === 0 ? "#00ffff" : "#ffd700";
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 18;
            ctx.lineWidth = 3.0;
            ctx.globalAlpha = ringAlpha * .85;
            ctx.beginPath();
            ctx.ellipse(ringX, cy, 10, rad * 1.5, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();

        let plasmaGrad = ctx.createRadialGradient(cx, cy, rad * .15, cx, cy, rad * 3.2);
        plasmaGrad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
        plasmaGrad.addColorStop(.2, "rgba(255, 0, 224, 0.95)");
        plasmaGrad.addColorStop(.45, "rgba(0, 255, 255, 0.88)");
        plasmaGrad.addColorStop(.75, "rgba(255, 215, 0, 0.5)");
        plasmaGrad.addColorStop(1, "rgba(255, 0, 224, 0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = plasmaGrad;
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 46;
        ctx.beginPath();
        ctx.arc(cx, cy, rad * 3.2, 0, Math.PI * 2);
        ctx.fill();

        let innerGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, rad * 1.6);
        innerGrad.addColorStop(0, "#ffffff");
        innerGrad.addColorStop(.3, "#00ffff");
        innerGrad.addColorStop(.7, "#ff00e0");
        innerGrad.addColorStop(1, "rgba(255, 0, 224, 0)");
        ctx.fillStyle = innerGrad;
        ctx.shadowColor = "#ff00e0";
        ctx.shadowBlur = 34;
        ctx.beginPath();
        ctx.arc(cx, cy, rad * 1.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = "#00ffff";
        ctx.fillRect(cx - w * 0.45 + dir * 3, cy - h * 0.45, w * 0.9, h * 0.9);
        ctx.fillStyle = "#ff0055";
        ctx.fillRect(cx - w * 0.45 - dir * 3, cy - h * 0.45, w * 0.9, h * 0.9);
        ctx.restore();

        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 26;
        ctx.beginPath();
        ctx.arc(cx, cy, rad * .82, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        const noseX = cx + dir * (rad * 1.05);
        for (let m = 0; m < 4; m++) {
            const coneOffset = m * 16;
            const coneSpread = rad * (1.3 + m * .5);
            const coneBack = 36 + m * 22;
            const mX = noseX - dir * coneOffset;
            ctx.strokeStyle = m === 0 ? "#ffffff" : m === 1 ? "#00ffff" : m === 2 ? "#ffd700" : "#ff00e0";
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 22 - m * 4;
            ctx.lineWidth = 3.6 - m * .7;
            ctx.globalAlpha = .9 - m * .18;
            ctx.beginPath();
            ctx.moveTo(mX - dir * coneBack, cy - coneSpread);
            ctx.quadraticCurveTo(mX + dir * 18, cy, mX - dir * coneBack, cy + coneSpread);
            ctx.stroke();
        }
        ctx.restore();

        ctx.shadowBlur = 22;
        const arcColors = [ "#ffffff", "#00ffff", "#ffd700", "#ff00e0" ];
        for (let a = 0; a < 10; a++) {
            const angle = Math.random() * Math.PI * 2;
            const dist1 = rad * (.4 + Math.random() * .4);
            const dist2 = rad * (1.6 + Math.random() * 1.1);
            const x1 = cx + Math.cos(angle) * dist1;
            const y1 = cy + Math.sin(angle) * dist1;
            const midX1 = cx + Math.cos(angle + (Math.random() - .5) * .6) * (dist1 + (dist2 - dist1) * 0.35) + (Math.random() - .5) * 18;
            const midY1 = cy + Math.sin(angle + (Math.random() - .5) * .6) * (dist1 + (dist2 - dist1) * 0.35) + (Math.random() - .5) * 18;
            const midX2 = cx + Math.cos(angle + (Math.random() - .5) * .6) * (dist1 + (dist2 - dist1) * 0.7) + (Math.random() - .5) * 18;
            const midY2 = cy + Math.sin(angle + (Math.random() - .5) * .6) * (dist1 + (dist2 - dist1) * 0.7) + (Math.random() - .5) * 18;
            const x2 = cx + Math.cos(angle) * dist2;
            const y2 = cy + Math.sin(angle) * dist2;
            ctx.strokeStyle = arcColors[a % 4];
            ctx.shadowColor = arcColors[a % 4];
            ctx.lineWidth = 2.2 + Math.random() * 1.8;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(midX1, midY1);
            ctx.lineTo(midX2, midY2);
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
    return;
}

function drawHorrorEnemy(ctx, x, y, w, h, facing, scaleX, scaleY, health, maxHealth, type, enemyObj, cx, cy, lookX, lookY, isFiringMouth) {
    const dir = facing || 1;
    const t = typeof time !== "undefined" ? time : 0;

    if (type === "bubble_tree") {
        const scaleF = w / 95;
        const trunkW = 32 * scaleF;
        const trunkH = 55 * scaleF;
        const trunkX = cx - trunkW / 2;
        const trunkY = y + h - trunkH;

        ctx.fillStyle = "#0a0204";
        ctx.beginPath();
        ctx.moveTo(trunkX - 12 * scaleF, y + h);
        ctx.lineTo(trunkX + 6 * scaleF, trunkY + trunkH * 0.6);
        ctx.lineTo(trunkX + trunkW + 12 * scaleF, y + h);
        ctx.lineTo(trunkX + trunkW - 6 * scaleF, trunkY + trunkH * 0.6);
        ctx.fill();

        const trGrad = ctx.createLinearGradient(trunkX, trunkY, trunkX + trunkW, trunkY);
        trGrad.addColorStop(0, "#080103");
        trGrad.addColorStop(0.5, "#1c070b");
        trGrad.addColorStop(1, "#0a0204");
        ctx.fillStyle = trGrad;
        ctx.beginPath();
        ctx.moveTo(trunkX, y + h);
        ctx.quadraticCurveTo(trunkX - 5 * scaleF, trunkY + 15 * scaleF, trunkX + 4 * scaleF, trunkY);
        ctx.lineTo(trunkX + trunkW - 4 * scaleF, trunkY);
        ctx.quadraticCurveTo(trunkX + trunkW + 5 * scaleF, trunkY + 15 * scaleF, trunkX + trunkW, y + h);
        ctx.fill();

        ctx.strokeStyle = "#991b1b";
        ctx.lineWidth = 2 * scaleF;
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scaleF, trunkY + 8 * scaleF);
        ctx.lineTo(cx - 2 * scaleF, trunkY + 28 * scaleF);
        ctx.lineTo(cx - 8 * scaleF, trunkY + 45 * scaleF);
        ctx.stroke();

        const faceY = trunkY + trunkH * 0.42;
        ctx.fillStyle = "#ff1744";
        ctx.beginPath();
        ctx.ellipse(cx - 7 * scaleF, faceY - 5 * scaleF, 4 * scaleF, 5.5 * scaleF, -0.1, 0, Math.PI * 2);
        ctx.ellipse(cx + 7 * scaleF, faceY - 5 * scaleF, 4 * scaleF, 5.5 * scaleF, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(cx - 8 * scaleF + lookX * 0.4, faceY - 6 * scaleF + lookY * 0.4, 2 * scaleF, 2 * scaleF);
        ctx.fillRect(cx + 6 * scaleF + lookX * 0.4, faceY - 6 * scaleF + lookY * 0.4, 2 * scaleF, 2 * scaleF);

        ctx.fillStyle = "#050002";
        ctx.beginPath();
        ctx.ellipse(cx, faceY + 10 * scaleF, 9 * scaleF, 7 * scaleF, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fef08a";
        for (let d = -6; d <= 6; d += 3) {
            ctx.fillRect(cx + d * scaleF, faceY + 5 * scaleF, 1.8 * scaleF, 3.5 * scaleF);
            ctx.fillRect(cx + (d + 1) * scaleF, faceY + 12 * scaleF, 1.8 * scaleF, 3.5 * scaleF);
        }

        const fR = w * 0.46;
        const fY = y + fR * 0.9;
        const fGrad = ctx.createRadialGradient(cx, fY - 10 * scaleF, 10, cx, fY, fR);
        fGrad.addColorStop(0, "#26131c");
        fGrad.addColorStop(0.6, "#140a10");
        fGrad.addColorStop(1, "#070205");
        ctx.fillStyle = fGrad;
        ctx.beginPath();
        ctx.arc(cx, fY, fR, 0, Math.PI * 2);
        ctx.arc(cx - fR * 0.45, fY + 10 * scaleF, fR * 0.55, 0, Math.PI * 2);
        ctx.arc(cx + fR * 0.45, fY + 10 * scaleF, fR * 0.55, 0, Math.PI * 2);
        ctx.arc(cx, fY - fR * 0.35, fR * 0.6, 0, Math.PI * 2);
        ctx.fill();

        const skullLocs = [
            { ox: -fR * 0.45, oy: fY - 5 * scaleF },
            { ox: fR * 0.45, oy: fY - 2 * scaleF },
            { ox: 0, oy: fY - fR * 0.4 }
        ];
        skullLocs.forEach((sk, idx) => {
            const sx = cx + sk.ox;
            const sy = sk.oy + Math.sin(t * 0.05 + idx * 2) * 3;
            ctx.strokeStyle = "#7f1d1d";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(sx, sy - 14 * scaleF);
            ctx.lineTo(sx, sy);
            ctx.stroke();

            ctx.fillStyle = "#e2e8f0";
            ctx.beginPath();
            ctx.arc(sx, sy, 7 * scaleF, 0, Math.PI * 2);
            ctx.fillRect(sx - 4.5 * scaleF, sy + 3 * scaleF, 9 * scaleF, 6 * scaleF);
            ctx.fill();

            ctx.fillStyle = "#050005";
            ctx.beginPath();
            ctx.arc(sx - 2.5 * scaleF, sy, 2 * scaleF, 0, Math.PI * 2);
            ctx.arc(sx + 2.5 * scaleF, sy, 2 * scaleF, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ff1744";
            ctx.fillRect(sx - 3 * scaleF, sy - 0.5 * scaleF, 1.2 * scaleF, 1.2 * scaleF);
            ctx.fillRect(sx + 2 * scaleF, sy - 0.5 * scaleF, 1.2 * scaleF, 1.2 * scaleF);
        });

        return true;
    }

    if (type === "apple") {
        const aRad = w * 0.44;
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + h / 2 - 2, w * 0.42, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#050005";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 9, cy + aRad * 0.5); ctx.lineTo(cx - 14, cy + h / 2);
        ctx.moveTo(cx + 9, cy + aRad * 0.5); ctx.lineTo(cx + 14, cy + h / 2);
        ctx.stroke();

        const apGrad = ctx.createRadialGradient(cx - dir * 4, cy - 4, 3, cx, cy, aRad);
        apGrad.addColorStop(0, "#4a0418");
        apGrad.addColorStop(0.5, "#26020c");
        apGrad.addColorStop(1, "#0a0104");
        ctx.fillStyle = apGrad;
        ctx.beginPath();
        ctx.arc(cx - aRad * 0.35, cy, aRad * 0.75, 0, Math.PI * 2);
        ctx.arc(cx + aRad * 0.35, cy, aRad * 0.75, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#e2e8f0";
        ctx.beginPath();
        ctx.moveTo(cx - dir * 6, cy - aRad * 0.7);
        ctx.lineTo(cx - dir * 2, cy - aRad * 0.1);
        ctx.lineTo(cx - dir * 10, cy - aRad * 0.2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx + dir * 3, cy - 3, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + dir * 3 - 6, cy - 5); ctx.lineTo(cx + dir * 3, cy - 3);
        ctx.moveTo(cx + dir * 3 + 5, cy - 2); ctx.lineTo(cx + dir * 3, cy - 3);
        ctx.stroke();
        ctx.fillStyle = "#7f1d1d";
        ctx.beginPath();
        ctx.arc(cx + dir * 3 + lookX * 0.4, cy - 3 + lookY * 0.4, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(cx + dir * 3 + lookX * 0.4, cy - 3 + lookY * 0.4, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#050005";
        ctx.beginPath();
        ctx.ellipse(cx + dir * 4, cy + 9, 8, isFiringMouth ? 8 : 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fef08a";
        for (let t = -5; t <= 5; t += 2.5) {
            ctx.fillRect(cx + dir * 4 + t, cy + 6, 1.5, 3.5);
            ctx.fillRect(cx + dir * 4 + t + 1, cy + 10, 1.5, 3.5);
        }

        return true;
    }

    if (type === "daisy_flower") {
        const stemW = 8;
        const stemH = h * 0.65;
        const stemX = cx - stemW / 2;
        const stemY = y + h - stemH;

        ctx.fillStyle = "#10180a";
        ctx.fillRect(stemX, stemY, stemW, stemH);
        ctx.strokeStyle = "#991b1b";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(stemX, stemY, stemW, stemH);

        const flowerCy = y + h * 0.35;
        const pCount = 12;
        for (let p = 0; p < pCount; p++) {
            const pAng = (p * Math.PI * 2) / pCount + t * 0.02;
            const pLen = (w * 0.42) + Math.sin(t * 0.06 + p) * 3;
            ctx.save();
            ctx.translate(cx, flowerCy);
            ctx.rotate(pAng);
            ctx.fillStyle = p % 2 === 0 ? "#14050d" : "#240409";
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(12, -pLen * 0.6, 3, -pLen);
            ctx.quadraticCurveTo(-6, -pLen * 0.6, 0, 0);
            ctx.fill();
            ctx.strokeStyle = "#7f1d1d";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        }

        ctx.fillStyle = "#050005";
        ctx.beginPath();
        ctx.arc(cx, flowerCy, w * 0.26, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#fef08a";
        const ring1 = 10;
        for (let i = 0; i < ring1; i++) {
            const ang = (i * Math.PI * 2) / ring1 + t * 0.04;
            const rX = cx + Math.cos(ang) * (w * 0.2);
            const rY = flowerCy + Math.sin(ang) * (w * 0.2);
            ctx.beginPath();
            ctx.arc(rX, rY, 1.8, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = "#ffffff";
        const ring2 = 7;
        for (let i = 0; i < ring2; i++) {
            const ang = (i * Math.PI * 2) / ring2 - t * 0.06;
            const rX = cx + Math.cos(ang) * (w * 0.11);
            const rY = flowerCy + Math.sin(ang) * (w * 0.11);
            ctx.beginPath();
            ctx.arc(rX, rY, 1.4, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = "#ff1744";
        ctx.beginPath();
        ctx.arc(cx, flowerCy, 3.5, 0, Math.PI * 2);
        ctx.fill();

        return true;
    }

    if (type === "bubble_puffer") {
        const rad = w * 0.4;
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath();
        ctx.ellipse(cx, y + h + 2, rad * 1.1, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#7f1d1d";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy - 8); ctx.quadraticCurveTo(cx, cy - 24, cx, cy - 28);
        ctx.moveTo(cx + 10, cy - 8); ctx.quadraticCurveTo(cx, cy - 24, cx, cy - 28);
        ctx.stroke();

        for (let side of [ -1, 1 ]) {
            const cX = cx + side * 10;
            const cY = cy + 2;
            const cGrad = ctx.createRadialGradient(cX - 2, cY - 2, 2, cX, cY, rad * 0.85);
            cGrad.addColorStop(0, "#450a18");
            cGrad.addColorStop(0.5, "#22030d");
            cGrad.addColorStop(1, "#0a0104");
            ctx.fillStyle = cGrad;
            ctx.beginPath();
            ctx.arc(cX, cY, rad * 0.8, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = "#e2e8f0";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cX - 5, cY - 7); ctx.lineTo(cX, cY - 5); ctx.lineTo(cX + 5, cY - 8);
            ctx.stroke();

            ctx.fillStyle = "#cbd5e1";
            ctx.beginPath();
            ctx.arc(cX + side * 2, cY - 1, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ff1744";
            ctx.fillRect(cX + side * 2 - 0.7, cY - 1.7, 1.4, 1.4);

            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(cX - 6, cY + 6); ctx.lineTo(cX + 6, cY + 6);
            ctx.stroke();
            for (let st = -4; st <= 4; st += 2.5) {
                ctx.beginPath();
                ctx.moveTo(cX + st, cY + 4); ctx.lineTo(cX + st, cY + 8);
                ctx.stroke();
            }
        }

        return true;
    }

    if (type === "giant_snowman" || type === "mega_snowman" || type === "snowman_blower" || type === "snowman_slammer" || type === "snowball_head") {
        const bRad = w * 0.44;
        const bGrad = ctx.createRadialGradient(cx - 4, cy - 4, 4, cx, cy, bRad);
        bGrad.addColorStop(0, "#334155");
        bGrad.addColorStop(0.5, "#1e293b");
        bGrad.addColorStop(1, "#090d16");
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, bRad, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(cx - bRad * 0.5, cy - 6); ctx.lineTo(cx - bRad * 0.1, cy - 10);
        ctx.moveTo(cx - bRad * 0.5, cy + 4); ctx.lineTo(cx - bRad * 0.1, cy);
        ctx.moveTo(cx + bRad * 0.5, cy - 6); ctx.lineTo(cx + bRad * 0.1, cy - 10);
        ctx.moveTo(cx + bRad * 0.5, cy + 4); ctx.lineTo(cx + bRad * 0.1, cy);
        ctx.stroke();

        ctx.fillStyle = "#cbd5e1";
        ctx.beginPath();
        ctx.arc(cx, cy - 3, 9, 0, Math.PI * 2);
        ctx.fillRect(cx - 5, cy + 2, 10, 6);
        ctx.fill();
        ctx.fillStyle = "#050005";
        ctx.beginPath();
        ctx.arc(cx - 3.5, cy - 3, 2.5, 0, Math.PI * 2);
        ctx.arc(cx + 3.5, cy - 3, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(cx - 4, cy - 3.5, 1.2, 1.2);
        ctx.fillRect(cx + 3, cy - 3.5, 1.2, 1.2);

        return true;
    }

    const bGrad = ctx.createLinearGradient(x, y, x + w, y + h);
    bGrad.addColorStop(0, "#1c1424");
    bGrad.addColorStop(0.4, "#290814");
    bGrad.addColorStop(1, "#0d0206");
    ctx.fillStyle = bGrad;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, [ 8 ]);
    ctx.fill();
    ctx.strokeStyle = "#7f1d1d";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#991b1b";
    ctx.beginPath();
    ctx.arc(x + w * 0.25, y + 2, 4 + Math.sin(t * 0.1) * 1.5, 0, Math.PI * 2);
    ctx.arc(x + w * 0.72, y + 3, 3 + Math.cos(t * 0.1) * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(226, 232, 240, 0.4)";
    ctx.beginPath();
    ctx.arc(cx, cy - 4, Math.min(w, h) * 0.26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(226, 232, 240, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy + 4); ctx.lineTo(cx + 7, cy + 4);
    ctx.moveTo(cx - 9, cy + 8); ctx.lineTo(cx + 9, cy + 8);
    ctx.stroke();

    ctx.fillStyle = "#050005";
    ctx.beginPath();
    ctx.ellipse(cx - 7, cy - 5, 5, 6, -0.1, 0, Math.PI * 2);
    ctx.ellipse(cx + 7, cy - 5, 6, 7, 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(127, 29, 29, 0.9)";
    ctx.fillRect(cx - 8, cy - 2, 2.5, 12);

    ctx.fillStyle = "#ff1744";
    ctx.beginPath();
    ctx.arc(cx + 7 + lookX * 0.4, cy - 5 + lookY * 0.4, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(cx + 7 + lookX * 0.4, cy - 6 + lookY * 0.4, 1, 1);

    ctx.fillStyle = "#050005";
    ctx.beginPath();
    ctx.ellipse(cx, cy + h * 0.28, w * 0.32, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#450a0a";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#fef08a";
    const tCount = Math.floor(w * 0.16);
    for (let i = 0; i < tCount; i++) {
        const tx = cx - w * 0.24 + i * 5;
        ctx.fillRect(tx, cy + h * 0.28 - 4, 1.8, 3.5);
        ctx.fillRect(tx + 2, cy + h * 0.28 + 1, 1.8, 3.5);
    }

    return true;
}

function drawEnemyEnhanced(ctx, x, y, w, h, color, facing, scaleX, scaleY, health, maxHealth, type, mouthOpen = 0, blinkTimer = 0, isFire = false, enemyObj = null) {
    if (ctx && ctx.isDummy) return;
    const vw = typeof VIEW_W !== "undefined" ? VIEW_W : 1024;
    if (x + w < -150 || x > vw + 150) return;
    ctx.save();
    const cx = x + w / 2;
    const cy = y + h / 2;
    const isBlinking = blinkTimer < 0;
    const isFiringMouth = mouthOpen > 0;
    const playerX = game.player ? game.player.x + game.player.w / 2 : cx;
    const playerY = game.player ? game.player.y + game.player.h / 2 : cy;
    const pAngle = Math.atan2(playerY - cy, playerX - cx);
    const lookX = Math.cos(pAngle) * 3;
    const lookY = Math.sin(pAngle) * 2;

    if (window.postGameHorror) {
        if (drawHorrorEnemy(ctx, x, y, w, h, facing, scaleX, scaleY, health, maxHealth, type, enemyObj, cx, cy, lookX, lookY, isFiringMouth)) {
            ctx.restore();
            return;
        }
    }
    if (type === "fire_spawner") {
        ctx.restore();
        return;
    }
    if (type === "podoboo") {
        const pVy = enemyObj ? enemyObj.vy || 0 : 0;
        const stretchY = Math.max(0.6, Math.min(1.8, 1 + Math.abs(pVy)*0.05));
        const squishX = 1 / stretchY;
        
        ctx.translate(cx, cy);
        ctx.scale(scaleX * squishX, scaleY * stretchY);

        ctx.shadowColor = "#ff4400";
        ctx.shadowBlur = 15 + Math.sin(time * .2) * 5;

        const pGrad = ctx.createLinearGradient(0, -h, 0, h/2);
        pGrad.addColorStop(0, "#ffff00");
        pGrad.addColorStop(0.4, "#ff6600");
        pGrad.addColorStop(1, "#880000");

        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-w / 2, 0);
        ctx.quadraticCurveTo(0, -h - Math.abs(pVy)*2, w / 2, 0);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(-5 + lookX, -2 + lookY + (pVy > 0 ? 2 : -2), 3, 0, Math.PI * 2);
        ctx.arc(5 + lookX, -2 + lookY + (pVy > 0 ? 2 : -2), 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-w/4, 0); ctx.lineTo(-w/8, -h/2);
        ctx.moveTo(w/4, 0); ctx.lineTo(w/8, -h/2);
        ctx.stroke();

        ctx.restore();
        return;
    }
    if (type === "igneous_turret") {
        const baseW = w;
        const baseH = h;
        const turretHeadY = cy - 2;
        const aimAngle = Math.atan2(playerY - turretHeadY, playerX - cx);

        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.beginPath();
        ctx.ellipse(cx, y + baseH - 4, baseW * 0.45, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        const baseGrad = ctx.createLinearGradient(x, y + baseH - 22, x, y + baseH);
        baseGrad.addColorStop(0, "#334155");
        baseGrad.addColorStop(0.4, "#1e293b");
        baseGrad.addColorStop(1, "#0f172a");
        ctx.fillStyle = baseGrad;
        ctx.beginPath();
        ctx.moveTo(x + 4, y + baseH);
        ctx.lineTo(x + baseW - 4, y + baseH);
        ctx.lineTo(x + baseW - 10, y + baseH - 20);
        ctx.lineTo(x + 10, y + baseH - 20);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 68, 0, ${0.7 + Math.sin((time || 0) * 0.2) * 0.3})`;
        ctx.fillRect(cx - 14, y + baseH - 12, 6, 4);
        ctx.fillRect(cx - 3, y + baseH - 12, 6, 4);
        ctx.fillRect(cx + 8, y + baseH - 12, 6, 4);

        ctx.save();
        ctx.translate(cx, turretHeadY);
        ctx.rotate(aimAngle);

        const barrelGrad = ctx.createLinearGradient(0, -6, 26, 6);
        barrelGrad.addColorStop(0, "#475569");
        barrelGrad.addColorStop(0.5, "#1e293b");
        barrelGrad.addColorStop(1, "#0f172a");
        ctx.fillStyle = barrelGrad;
        ctx.fillRect(0, -7, 24, 6);
        ctx.fillRect(0, 1, 24, 6);

        ctx.fillStyle = "#ff4400";
        ctx.fillRect(20, -7, 5, 6);
        ctx.fillRect(20, 1, 5, 6);

        const domeGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 15);
        domeGrad.addColorStop(0, "#94a3b8");
        domeGrad.addColorStop(0.5, "#334155");
        domeGrad.addColorStop(1, "#0f172a");
        ctx.fillStyle = domeGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ff4400";
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 200, 0, ${0.85 + Math.sin((time || 0) * 0.25) * 0.15})`;
        ctx.beginPath();
        ctx.arc(4, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        ctx.restore();
        return;
    }
    if (type === "electric_cross") {
        const patrolAngle = enemyObj && enemyObj.patrolAngle || 0;
        const numBalls = enemyObj ? enemyObj.numBalls || 4 : 4;
        const arms = 4;
        const spacing = 32;
        
        ctx.save();
        
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 20;
        const coreGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 20);
        coreGrad.addColorStop(0, "#ffffff");
        coreGrad.addColorStop(0.3, "#00ffff");
        coreGrad.addColorStop(0.8, "#0055aa");
        coreGrad.addColorStop(1, "#001122");
        ctx.fillStyle = coreGrad;
        ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 4;
        ctx.lineJoin = "bevel";
        ctx.beginPath();
        for(let g=0; g<12; g++) {
            const gAng = patrolAngle * 2 + g * (Math.PI/6);
            const gRad = (g % 2 === 0) ? 25 : 20;
            if(g===0) ctx.moveTo(cx + Math.cos(gAng)*gRad, cy + Math.sin(gAng)*gRad);
            else ctx.lineTo(cx + Math.cos(gAng)*gRad, cy + Math.sin(gAng)*gRad);
        }
        ctx.closePath();
        ctx.stroke();

        for (let a = 0; a < arms; a++) {
            const angle = patrolAngle + Math.PI / 2 * a;
            let prevX = cx;
            let prevY = cy;
            
            for (let b = 1; b <= numBalls; b++) {
                const bx = cx + Math.cos(angle) * b * spacing;
                const by = cy + Math.sin(angle) * b * spacing;
                
                ctx.strokeStyle = "#00ffff";
                ctx.shadowColor = "#00ffff";
                ctx.shadowBlur = 10;
                ctx.lineWidth = 2;
                ctx.beginPath();
                let lx = prevX;
                let ly = prevY;
                ctx.moveTo(lx, ly);
                const steps = 4;
                for(let s=1; s<=steps; s++) {
                    const nx = prevX + (bx - prevX) * (s/steps);
                    const ny = prevY + (by - prevY) * (s/steps);
                    const jitterX = (Math.random()-0.5)*12;
                    const jitterY = (Math.random()-0.5)*12;
                    ctx.lineTo(nx + jitterX, ny + jitterY);
                }
                ctx.stroke();
                ctx.shadowBlur = 0;

                const pulse = Math.sin(time*0.5 + b + a) * 0.2 + 1;
                const orbGrad = ctx.createRadialGradient(bx, by, 2, bx, by, 10 * pulse);
                orbGrad.addColorStop(0, "#ffffff");
                orbGrad.addColorStop(0.4, "#00ffff");
                orbGrad.addColorStop(1, "rgba(0, 50, 150, 0)");
                ctx.fillStyle = orbGrad;
                ctx.beginPath();
                ctx.arc(bx, by, 14 * pulse, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.strokeStyle = "#334155";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(bx, by, 8 * pulse, angle - 0.5, angle + Math.PI + 0.5);
                ctx.stroke();

                prevX = bx;
                prevY = by;
            }
        }
        ctx.restore();
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
    if (type === "bubble_tree" || type === "fire_tree") {
        ctx.translate(cx, cy);
        ctx.scale(scaleX, scaleY);
        ctx.translate(-cx, -cy);
        const dir = facing || 1;
        const isFiring = isFiringMouth;
        const isFire = type === "fire_tree" || (enemyObj && enemyObj.isFireTree);
        const isAggressive = isFire || (enemyObj && (enemyObj.isAggressive || enemyObj.isGiant)) || w >= 90;
        const scaleF = Math.max(1, w / 48);

        const treeSway = Math.sin(time * 0.04 + cx * 0.02) * (2 * scaleF);
        const canopySway = Math.sin(time * 0.06 + cx * 0.03) * (3.5 * scaleF);
        const breath = Math.sin(time * 0.09) * (1.2 * scaleF);

        ctx.fillStyle = "rgba(15, 23, 42, 0.4)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + h / 2 - 2, w * 0.48, 7 * scaleF, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isAggressive ? "#1e0b04" : "#2d1607";
        ctx.beginPath();
        ctx.ellipse(cx, cy + h / 2 - 3 * scaleF, 22 * scaleF, 6 * scaleF, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isAggressive ? "#2b0f04" : "#451a03";
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scaleF, cy + h / 2 - 8 * scaleF);
        ctx.quadraticCurveTo(cx - 20 * scaleF, cy + h / 2 - 4 * scaleF, cx - 28 * scaleF, cy + h / 2 - 1 * scaleF);
        ctx.lineTo(cx - 18 * scaleF, cy + h / 2);
        ctx.quadraticCurveTo(cx - 10 * scaleF, cy + h / 2 - 2 * scaleF, cx - 4 * scaleF, cy + h / 2 - 6 * scaleF);
        ctx.moveTo(cx + 10 * scaleF, cy + h / 2 - 8 * scaleF);
        ctx.quadraticCurveTo(cx + 20 * scaleF, cy + h / 2 - 4 * scaleF, cx + 28 * scaleF, cy + h / 2 - 1 * scaleF);
        ctx.lineTo(cx + 18 * scaleF, cy + h / 2);
        ctx.quadraticCurveTo(cx + 10 * scaleF, cy + h / 2 - 2 * scaleF, cx + 4 * scaleF, cy + h / 2 - 6 * scaleF);
        ctx.moveTo(cx - 4 * scaleF, cy + h / 2 - 6 * scaleF);
        ctx.lineTo(cx, cy + h / 2 + 1 * scaleF);
        ctx.lineTo(cx + 4 * scaleF, cy + h / 2 - 6 * scaleF);
        ctx.fill();

        ctx.fillStyle = isAggressive ? "#14532d" : "#22c55e";
        ctx.beginPath();
        ctx.moveTo(cx - 20 * scaleF, cy + h / 2 - 1);
        ctx.lineTo(cx - 22 * scaleF, cy + h / 2 - 6 * scaleF);
        ctx.lineTo(cx - 17 * scaleF, cy + h / 2 - 1);
        ctx.moveTo(cx + 17 * scaleF, cy + h / 2 - 1);
        ctx.lineTo(cx + 20 * scaleF, cy + h / 2 - 6 * scaleF);
        ctx.lineTo(cx + 23 * scaleF, cy + h / 2 - 1);
        ctx.fill();

        const trunkW = 24 * scaleF;
        const trunkH = 36 * scaleF;
        const trunkY = cy + 4 * scaleF;
        const trunkX = cx + treeSway * 0.3;

        const tGrad = ctx.createLinearGradient(trunkX - trunkW * 0.6, trunkY, trunkX + trunkW * 0.6, trunkY);
        if (isAggressive) {
            tGrad.addColorStop(0, "#250d02");
            tGrad.addColorStop(0.3, "#421806");
            tGrad.addColorStop(0.7, "#582008");
            tGrad.addColorStop(1, "#1c0902");
        } else {
            tGrad.addColorStop(0, "#3f1a07");
            tGrad.addColorStop(0.25, "#5c2b0c");
            tGrad.addColorStop(0.65, "#78350f");
            tGrad.addColorStop(0.9, "#5c2b0c");
            tGrad.addColorStop(1, "#2e1204");
        }
        ctx.fillStyle = tGrad;

        ctx.beginPath();
        ctx.moveTo(trunkX - trunkW * 0.55, trunkY + trunkH * 0.5);
        ctx.bezierCurveTo(trunkX - trunkW * 0.45, trunkY, trunkX - trunkW * 0.5, trunkY - trunkH * 0.4, trunkX - trunkW * 0.6, trunkY - trunkH * 0.5);
        ctx.lineTo(trunkX + trunkW * 0.6, trunkY - trunkH * 0.5);
        ctx.bezierCurveTo(trunkX + trunkW * 0.5, trunkY - trunkH * 0.4, trunkX + trunkW * 0.45, trunkY, trunkX + trunkW * 0.55, trunkY + trunkH * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = isAggressive ? "rgba(20, 6, 2, 0.65)" : "rgba(46, 18, 4, 0.55)";
        ctx.lineWidth = 1.6 * scaleF;
        ctx.beginPath();
        ctx.moveTo(trunkX - 6 * scaleF, trunkY - 14 * scaleF);
        ctx.quadraticCurveTo(trunkX - 8 * scaleF, trunkY, trunkX - 6 * scaleF, trunkY + 12 * scaleF);
        ctx.moveTo(trunkX + 6 * scaleF, trunkY - 12 * scaleF);
        ctx.quadraticCurveTo(trunkX + 8 * scaleF, trunkY, trunkX + 5 * scaleF, trunkY + 14 * scaleF);
        ctx.moveTo(trunkX - 1 * scaleF, trunkY + 6 * scaleF);
        ctx.lineTo(trunkX - 1 * scaleF, trunkY + 16 * scaleF);
        ctx.stroke();

        ctx.strokeStyle = isAggressive ? "#250d02" : "#3f1a07";
        ctx.lineWidth = 1.2 * scaleF;
        ctx.beginPath();
        ctx.ellipse(trunkX + (dir * 7 * scaleF), trunkY + 8 * scaleF, 3 * scaleF, 4 * scaleF, 0.2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = isAggressive ? "#381604" : "#5c2b0c";
        ctx.beginPath();
        ctx.moveTo(trunkX - 8 * scaleF, trunkY - 10 * scaleF);
        ctx.quadraticCurveTo(trunkX - 22 * scaleF, trunkY - 18 * scaleF, trunkX - 32 * scaleF, trunkY - 26 * scaleF);
        ctx.lineTo(trunkX - 26 * scaleF, trunkY - 24 * scaleF);
        ctx.quadraticCurveTo(trunkX - 16 * scaleF, trunkY - 15 * scaleF, trunkX - 4 * scaleF, trunkY - 7 * scaleF);
        ctx.moveTo(trunkX + 8 * scaleF, trunkY - 10 * scaleF);
        ctx.quadraticCurveTo(trunkX + 22 * scaleF, trunkY - 18 * scaleF, trunkX + 32 * scaleF, trunkY - 26 * scaleF);
        ctx.lineTo(trunkX + 26 * scaleF, trunkY - 24 * scaleF);
        ctx.quadraticCurveTo(trunkX + 16 * scaleF, trunkY - 15 * scaleF, trunkX + 4 * scaleF, trunkY - 7 * scaleF);
        ctx.fill();

        const foliageY = cy - 14 * scaleF + breath;
        const foliageX = cx + canopySway;

        ctx.fillStyle = isFire ? "#2b0505" : isAggressive ? "#052e16" : "#14532d";
        ctx.beginPath();
        ctx.arc(foliageX - 20 * scaleF, foliageY + 6 * scaleF, 18 * scaleF, 0, Math.PI * 2);
        ctx.arc(foliageX + 20 * scaleF, foliageY + 6 * scaleF, 18 * scaleF, 0, Math.PI * 2);
        ctx.arc(foliageX - 12 * scaleF, foliageY - 14 * scaleF, 20 * scaleF, 0, Math.PI * 2);
        ctx.arc(foliageX + 12 * scaleF, foliageY - 14 * scaleF, 20 * scaleF, 0, Math.PI * 2);
        ctx.arc(foliageX, foliageY - 18 * scaleF, 22 * scaleF, 0, Math.PI * 2);
        ctx.fill();

        const leafGrad = ctx.createRadialGradient(foliageX - 6 * scaleF, foliageY - 12 * scaleF, 3 * scaleF, foliageX, foliageY, 32 * scaleF);
        if (isFire) {
            leafGrad.addColorStop(0, "#fef08a");
            leafGrad.addColorStop(0.28, "#f97316");
            leafGrad.addColorStop(0.68, "#dc2626");
            leafGrad.addColorStop(1, "#450a0a");
        } else if (isAggressive) {
            leafGrad.addColorStop(0, "#22c55e");
            leafGrad.addColorStop(0.45, "#15803d");
            leafGrad.addColorStop(0.85, "#0f4c24");
            leafGrad.addColorStop(1, "#052e16");
        } else {
            leafGrad.addColorStop(0, "#4ade80");
            leafGrad.addColorStop(0.35, "#22c55e");
            leafGrad.addColorStop(0.75, "#16a34a");
            leafGrad.addColorStop(1, "#15803d");
        }
        ctx.fillStyle = leafGrad;
        ctx.beginPath();
        ctx.arc(foliageX - 18 * scaleF, foliageY + 2 * scaleF, 19 * scaleF, 0, Math.PI * 2);
        ctx.arc(foliageX + 18 * scaleF, foliageY + 2 * scaleF, 19 * scaleF, 0, Math.PI * 2);
        ctx.arc(foliageX - 10 * scaleF, foliageY - 10 * scaleF, 21 * scaleF, 0, Math.PI * 2);
        ctx.arc(foliageX + 10 * scaleF, foliageY - 10 * scaleF, 21 * scaleF, 0, Math.PI * 2);
        ctx.arc(foliageX, foliageY - 8 * scaleF, 25 * scaleF, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isFire ? "rgba(251, 146, 60, 0.65)" : isAggressive ? "rgba(34, 197, 94, 0.45)" : "rgba(134, 239, 172, 0.55)";
        ctx.beginPath();
        ctx.arc(foliageX - 14 * scaleF, foliageY - 14 * scaleF, 12 * scaleF, 0, Math.PI * 2);
        ctx.arc(foliageX + 8 * scaleF, foliageY - 18 * scaleF, 14 * scaleF, 0, Math.PI * 2);
        ctx.arc(foliageX - 2 * scaleF, foliageY - 20 * scaleF, 13 * scaleF, 0, Math.PI * 2);
        ctx.fill();

        if (isFire) {
            for (let fl = 0; fl < 7; fl++) {
                const fAng = fl * (Math.PI / 3.5) + time * 0.08;
                const fx = foliageX + Math.cos(fAng) * (26 * scaleF);
                const fy = foliageY - 10 * scaleF + Math.sin(fAng) * (18 * scaleF);
                const flameH = (14 + Math.sin(time * 0.25 + fl) * 8) * scaleF;
                ctx.fillStyle = fl % 2 === 0 ? "#ea580c" : "#facc15";
                ctx.shadowColor = "#ff2200";
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.moveTo(fx - 4 * scaleF, fy);
                ctx.quadraticCurveTo(fx + Math.sin(time * 0.15 + fl) * 4, fy - flameH, fx + 4 * scaleF, fy);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        ctx.fillStyle = isAggressive ? "#15803d" : "#22c55e";
        for (let l = 0; l < 6; l++) {
            const lAng = l * (Math.PI / 3) + time * 0.02;
            const lx = foliageX + Math.cos(lAng) * (26 * scaleF);
            const ly = foliageY - 6 * scaleF + Math.sin(lAng) * (18 * scaleF);
            ctx.beginPath();
            ctx.ellipse(lx, ly, 4 * scaleF, 2.5 * scaleF, lAng + 0.4, 0, Math.PI * 2);
            ctx.fill();
        }

        const appleConfigs = [
            { rx: -17, ry: -6, size: 5.2, swayOffset: 0 },
            { rx: 17, ry: -4, size: 5.0, swayOffset: 1.6 },
            { rx: -6, ry: -20, size: 5.4, swayOffset: 2.7 },
            { rx: 10, ry: -17, size: 4.8, swayOffset: 3.9 },
            { rx: -22, ry: 10, size: 4.4, swayOffset: 4.8 }
        ];

        for (let i = 0; i < appleConfigs.length; i++) {
            const app = appleConfigs[i];
            const aSway = Math.sin(time * 0.06 + app.swayOffset) * (1.8 * scaleF);
            const ax = foliageX + app.rx * scaleF + aSway;
            const ay = foliageY + app.ry * scaleF;
            const ar = app.size * scaleF;

            ctx.strokeStyle = "#451a03";
            ctx.lineWidth = 1.4 * scaleF;
            ctx.beginPath();
            ctx.moveTo(ax, ay - ar);
            ctx.quadraticCurveTo(ax + 2 * scaleF, ay - ar - 5 * scaleF, ax + 4 * scaleF, ay - ar - 6 * scaleF);
            ctx.stroke();

            ctx.fillStyle = "#22c55e";
            ctx.beginPath();
            ctx.ellipse(ax + 3.5 * scaleF, ay - ar - 5.5 * scaleF, 2.5 * scaleF, 1.4 * scaleF, -0.6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "rgba(5, 46, 22, 0.35)";
            ctx.beginPath();
            ctx.ellipse(ax, ay + ar * 0.9, ar * 0.8, ar * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();

            const aGrad = ctx.createRadialGradient(ax - ar * 0.35, ay - ar * 0.35, 1, ax, ay, ar * 1.1);
            if (isFire) {
                aGrad.addColorStop(0, "#fffbeb");
                aGrad.addColorStop(0.25, "#fbbf24");
                aGrad.addColorStop(0.65, "#ea580c");
                aGrad.addColorStop(1, "#7f1d1d");
            } else if (isAggressive) {
                aGrad.addColorStop(0, "#f87171");
                aGrad.addColorStop(0.4, "#dc2626");
                aGrad.addColorStop(0.85, "#991b1b");
                aGrad.addColorStop(1, "#450a0a");
            } else {
                aGrad.addColorStop(0, "#fca5a5");
                aGrad.addColorStop(0.25, "#ef4444");
                aGrad.addColorStop(0.75, "#b91c1c");
                aGrad.addColorStop(1, "#7f1d1d");
            }
            ctx.fillStyle = aGrad;
            ctx.beginPath();
            ctx.arc(ax - ar * 0.15, ay, ar * 0.95, 0, Math.PI * 2);
            ctx.arc(ax + ar * 0.15, ay, ar * 0.95, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = isFire ? "rgba(255, 240, 180, 0.9)" : "rgba(255, 255, 255, 0.7)";
            ctx.beginPath();
            ctx.ellipse(ax - ar * 0.35, ay - ar * 0.35, ar * 0.35, ar * 0.2, -0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        const faceY = trunkY - 2 * scaleF;
        const faceX = trunkX;
        const eyeLX = faceX - 6 * scaleF + lookX * 0.35 * scaleF;
        const eyeRX = faceX + 6 * scaleF + lookX * 0.35 * scaleF;
        const eyeY = faceY - 3 * scaleF + lookY * 0.35 * scaleF;

        if (isAggressive) {
            ctx.strokeStyle = isFire ? "#ff0000" : "#1a0802";
            ctx.lineWidth = (isFire ? 4.2 : 3.4) * scaleF;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(faceX - 11 * scaleF, eyeY - 6 * scaleF);
            ctx.lineTo(faceX - 2 * scaleF, eyeY + 1 * scaleF);
            ctx.moveTo(faceX + 11 * scaleF, eyeY - 6 * scaleF);
            ctx.lineTo(faceX + 2 * scaleF, eyeY + 1 * scaleF);
            ctx.stroke();

            if (!isBlinking) {
                ctx.fillStyle = "#140501";
                ctx.beginPath();
                ctx.ellipse(eyeLX, eyeY + 1 * scaleF, 4.5 * scaleF, 3.4 * scaleF, -0.2, 0, Math.PI * 2);
                ctx.ellipse(eyeRX, eyeY + 1 * scaleF, 4.5 * scaleF, 3.4 * scaleF, 0.2, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = isFire ? "#ffff00" : "#ffcc00";
                ctx.shadowColor = isFire ? "#ff0000" : "#ff3300";
                ctx.shadowBlur = isFire ? 14 : 8;
                ctx.beginPath();
                ctx.ellipse(eyeLX, eyeY + 1 * scaleF, 3.2 * scaleF, 2.4 * scaleF, -0.2, 0, Math.PI * 2);
                ctx.ellipse(eyeRX, eyeY + 1 * scaleF, 3.2 * scaleF, 2.4 * scaleF, 0.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.fillStyle = isFire ? "#660000" : "#990000";
                ctx.fillRect(eyeLX - 1 * scaleF + lookX * 0.2, eyeY - 1.5 * scaleF, 2 * scaleF, 4.5 * scaleF);
                ctx.fillRect(eyeRX - 1 * scaleF + lookX * 0.2, eyeY - 1.5 * scaleF, 2 * scaleF, 4.5 * scaleF);
            }

            const mouthY = faceY + 7 * scaleF;
            ctx.fillStyle = "#0f0502";
            ctx.beginPath();
            if (isFiring) {
                ctx.ellipse(faceX + dir * 3 * scaleF, mouthY, 8 * scaleF, 9 * scaleF, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = isFire ? "rgba(255, 68, 0, 0.95)" : "rgba(14, 165, 233, 0.85)";
                ctx.shadowColor = isFire ? "#ff2200" : "#00ffff";
                ctx.shadowBlur = isFire ? 16 : 12;
                ctx.beginPath();
                ctx.arc(faceX + dir * 11 * scaleF, mouthY, 9 * scaleF, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.fillStyle = isFire ? "#facc15" : "#22c55e";
                ctx.beginPath();
                ctx.arc(faceX + dir * 16 * scaleF, mouthY - 4 * scaleF, 2.5 * scaleF, 0, Math.PI * 2);
                ctx.arc(faceX + dir * 15 * scaleF, mouthY + 5 * scaleF, 2 * scaleF, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.ellipse(faceX, mouthY, 7 * scaleF, 4 * scaleF, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#e2d9cc";
                ctx.beginPath();
                ctx.moveTo(faceX - 4 * scaleF, mouthY - 3 * scaleF);
                ctx.lineTo(faceX - 2 * scaleF, mouthY + 1.5 * scaleF);
                ctx.lineTo(faceX, mouthY - 3 * scaleF);
                ctx.moveTo(faceX + 1 * scaleF, mouthY - 3 * scaleF);
                ctx.lineTo(faceX + 3 * scaleF, mouthY + 1.5 * scaleF);
                ctx.lineTo(faceX + 5 * scaleF, mouthY - 3 * scaleF);
                ctx.fill();
            }
        } else {
            ctx.strokeStyle = "#451a03";
            ctx.lineWidth = 1.8 * scaleF;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(eyeLX - 4 * scaleF, eyeY - 4 * scaleF);
            ctx.quadraticCurveTo(eyeLX, eyeY - 6 * scaleF, eyeLX + 4 * scaleF, eyeY - 4 * scaleF);
            ctx.moveTo(eyeRX - 4 * scaleF, eyeY - 4 * scaleF);
            ctx.quadraticCurveTo(eyeRX, eyeY - 6 * scaleF, eyeRX + 4 * scaleF, eyeY - 4 * scaleF);
            ctx.stroke();

            if (!isBlinking) {
                ctx.fillStyle = "#fef3c7";
                ctx.beginPath();
                ctx.ellipse(eyeLX, eyeY, 3.8 * scaleF, 4.2 * scaleF, 0, 0, Math.PI * 2);
                ctx.ellipse(eyeRX, eyeY, 3.8 * scaleF, 4.2 * scaleF, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "#1e1b4b";
                ctx.beginPath();
                ctx.arc(eyeLX + lookX * 0.4 * scaleF, eyeY + lookY * 0.4 * scaleF, 2.5 * scaleF, 0, Math.PI * 2);
                ctx.arc(eyeRX + lookX * 0.4 * scaleF, eyeY + lookY * 0.4 * scaleF, 2.5 * scaleF, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(eyeLX - 0.9 * scaleF, eyeY - 1 * scaleF, 1.2 * scaleF, 0, Math.PI * 2);
                ctx.arc(eyeRX - 0.9 * scaleF, eyeY - 1 * scaleF, 1.2 * scaleF, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = "rgba(244, 114, 182, 0.55)";
            ctx.beginPath();
            ctx.arc(faceX - 9 * scaleF, faceY + 4 * scaleF, 3 * scaleF, 0, Math.PI * 2);
            ctx.arc(faceX + 9 * scaleF, faceY + 4 * scaleF, 3 * scaleF, 0, Math.PI * 2);
            ctx.fill();

            const mouthY = faceY + 5.5 * scaleF;
            ctx.fillStyle = "#1e1b4b";
            ctx.beginPath();
            if (isFiring) {
                ctx.ellipse(faceX + dir * 2.5 * scaleF, mouthY, 4.5 * scaleF, 6 * scaleF, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "rgba(56, 189, 248, 0.8)";
                ctx.beginPath();
                ctx.arc(faceX + dir * 7 * scaleF, mouthY, 5 * scaleF, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.lineWidth = 1.8 * scaleF;
                ctx.strokeStyle = "#2d1607";
                ctx.beginPath();
                ctx.arc(faceX, mouthY - 1 * scaleF, 3.5 * scaleF, 0.2 * Math.PI, 0.8 * Math.PI);
                ctx.stroke();
            }
        }

        drawHorrorEnemyOverlay(ctx, cx, trunkY - 2 * scaleF, w, h, dir, lookX, lookY);
        ctx.restore();
        return;
    }
    if (type === "apple") {
        const dir = facing || 1;
        const isFiring = isFiringMouth;

        let vx = enemyObj && enemyObj.vx ? enemyObj.vx : 0;
        let vy = enemyObj && enemyObj.vy ? enemyObj.vy : 0;
        
        let tilt = vx * 0.08;
        let stretchY = Math.min(0.2, Math.abs(vy) * 0.02);
        let stretchX = -stretchY * 0.6;
        
        let bodyScaleX = 1 + stretchX;
        let bodyScaleY = 1 + stretchY;
        
        let faceOffX = lookX * 0.5 + vx * 0.3;
        let faceOffY = lookY * 0.5 + vy * 0.3;

        ctx.save();
        ctx.fillStyle = "rgba(15, 23, 42, 0.32)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + h / 2 - 2, w * .44, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.translate(cx, cy);
        ctx.rotate(tilt);
        ctx.scale(bodyScaleX, bodyScaleY);

        const legY = h / 2 - 4;
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        if (enemyObj && !enemyObj.onGround && Math.abs(vy) > 1) {
            ctx.ellipse(-7, legY - 3, 3, 4, -0.5, 0, Math.PI * 2);
            ctx.ellipse(7, legY - 3, 3, 4, 0.5, 0, Math.PI * 2);
        } else {
            let walk1 = Math.sin(time * 0.3 + (enemyObj ? enemyObj.x * 0.05 : 0)) * (Math.abs(vx) * 1.5);
            let walk2 = Math.sin(time * 0.3 + Math.PI + (enemyObj ? enemyObj.x * 0.05 : 0)) * (Math.abs(vx) * 1.5);
            ctx.ellipse(-7 + walk1, legY - Math.abs(walk1)*0.5, 3.5, 3, 0, 0, Math.PI * 2);
            ctx.ellipse(7 + walk2, legY - Math.abs(walk2)*0.5, 3.5, 3, 0, 0, Math.PI * 2);
        }
        ctx.fill();

        const aRad = w * .45;
        const aGrad = ctx.createRadialGradient(-dir * 4, -4, 2, 0, 0, aRad);
        aGrad.addColorStop(0, "#f87171");
        aGrad.addColorStop(.55, "#ef4444");
        aGrad.addColorStop(1, "#991b1b");
        
        ctx.fillStyle = aGrad;
        ctx.shadowColor = "#991b1b";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(-6, 0, aRad * .88, 0, Math.PI * 2);
        ctx.arc(6, 0, aRad * .88, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.beginPath();
        ctx.ellipse(-dir * 6, -7, 6, 3.5, -.3 * dir, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.beginPath();
        ctx.ellipse(-dir * 8, -4, 3, 2, -.3 * dir, 0, Math.PI * 2);
        ctx.fill();

        let stemBendX = dir * 3 + vx * -0.8;
        let stemBendY = -aRad - 6 + vy * 0.5;
        ctx.strokeStyle = "#5a3d28";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, -aRad * .8);
        ctx.quadraticCurveTo(stemBendX * 0.5, stemBendY + 3, stemBendX, stemBendY - 1);
        ctx.stroke();

        let leafFlap = Math.sin(time * 0.15) * 0.3 + (vx * -0.05);
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.ellipse(stemBendX + dir * 4, stemBendY + 1, 6, 3.5, 0.4 * dir + leafFlap, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#166534";
        ctx.lineWidth = 1;
        ctx.stroke();

        const eyeLX = -5 + faceOffX;
        const eyeRX = 5 + faceOffX;
        const eyeY = -1 + faceOffY;

        let isPuffing = enemyObj && enemyObj.shoot && enemyObj.shootTimer < 30 && enemyObj.shootTimer > 0;
        let isHurt = enemyObj && (enemyObj.stunTimer > 0 || enemyObj.flashTimer > 0 || (enemyObj.hurtTimer && enemyObj.hurtTimer > 0));
        let pDist = enemyObj && typeof game !== 'undefined' && game.player ? Math.hypot(game.player.x - enemyObj.x, game.player.y - enemyObj.y) : 999;
        let isAngry = pDist < 200 && !isHurt && !isPuffing;
        
        if (!isBlinking) {
            if (isHurt) {
                ctx.strokeStyle = "#1e1b4b";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(eyeLX - 2, eyeY - 2); ctx.lineTo(eyeLX + 2, eyeY + 2);
                ctx.moveTo(eyeLX - 2, eyeY + 2); ctx.lineTo(eyeLX + 2, eyeY - 2);
                ctx.moveTo(eyeRX - 2, eyeY - 2); ctx.lineTo(eyeRX + 2, eyeY + 2);
                ctx.moveTo(eyeRX - 2, eyeY + 2); ctx.lineTo(eyeRX + 2, eyeY - 2);
                ctx.stroke();
            } else {
                ctx.fillStyle = "#1e1b4b";
                ctx.beginPath();
                let eyeScaleY = 1 - Math.min(0.4, Math.abs(vy) * 0.03);
                ctx.ellipse(eyeLX, eyeY, 2.8, 3.5 * eyeScaleY, 0, 0, Math.PI * 2);
                ctx.ellipse(eyeRX, eyeY, 2.8, 3.5 * eyeScaleY, 0, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(eyeLX - .7 + lookX * 0.2, eyeY - .7 + lookY * 0.2, 1.2, 0, Math.PI * 2);
                ctx.arc(eyeRX - .7 + lookX * 0.2, eyeY - .7 + lookY * 0.2, 1.2, 0, Math.PI * 2);
                ctx.fill();

                if (isAngry) {
                    ctx.strokeStyle = "#1e1b4b";
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(eyeLX - 3, eyeY - 4); ctx.lineTo(eyeLX + 2, eyeY - 2.5);
                    ctx.moveTo(eyeRX + 3, eyeY - 4); ctx.lineTo(eyeRX - 2, eyeY - 2.5);
                    ctx.stroke();
                }
            }
        } else {
            ctx.strokeStyle = "#1e1b4b";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(eyeLX, eyeY, 2.5, 0, Math.PI);
            ctx.arc(eyeRX, eyeY, 2.5, 0, Math.PI);
            ctx.stroke();
        }

        ctx.fillStyle = isPuffing ? "rgba(254, 150, 150, 0.9)" : "rgba(254, 202, 202, 0.7)";
        ctx.beginPath();
        let cheekSize = isPuffing ? 5.5 + Math.sin(time*0.5)*1.5 : 3.5;
        ctx.arc(-9 + faceOffX, 5 + faceOffY, cheekSize, 0, Math.PI * 2);
        ctx.arc(9 + faceOffX, 5 + faceOffY, cheekSize, 0, Math.PI * 2);
        ctx.fill();

        const mouthY = 6 + faceOffY;
        ctx.fillStyle = "#1e1b4b";
        ctx.beginPath();
        
        if (isHurt) {
            ctx.strokeStyle = "#1e1b4b";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(faceOffX - 3, mouthY - 1);
            ctx.lineTo(faceOffX + 3, mouthY + 1);
            ctx.stroke();
        } else if (isPuffing) {
            ctx.arc(faceOffX, mouthY, 2.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (isFiring) {
            ctx.ellipse(dir * 3 + faceOffX, mouthY, 4.5, 5.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fbbf24";
            ctx.beginPath();
            ctx.arc(dir * 3 + faceOffX, mouthY, 3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            if (vy < -2 || vy > 5) {
                ctx.ellipse(faceOffX, mouthY, 2.5, 3.5, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (isAngry) {
                ctx.moveTo(faceOffX - 3, mouthY); ctx.lineTo(faceOffX + 3, mouthY);
                ctx.lineTo(faceOffX, mouthY + 3); ctx.fill();
            } else {
                ctx.arc(faceOffX, mouthY, 3.2, 0, Math.PI);
                ctx.fill();
            }
        }
        
        drawHorrorEnemyOverlay(ctx, 0, 0, w, h, dir, lookX, lookY);
        ctx.restore();
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
        const dir = facing || 1;
        const isPressuring = enemyObj && enemyObj.isPressuring;
        const pressureTimer = enemyObj ? enemyObj.pressureTimer || 0 : 0;
        const pressureRatio = Math.min(1, pressureTimer / 65);
        const isFiring = isFiringMouth;
        const isHurt = enemyObj && (enemyObj.stunTimer > 0 || enemyObj.flashTimer > 0 || (enemyObj.hurtTimer && enemyObj.hurtTimer > 0));

        let vx = enemyObj && enemyObj.vx ? enemyObj.vx : 0;
        let vy = enemyObj && enemyObj.vy ? enemyObj.vy : 0;
        
        let stemTilt = vx * 0.08;
        let headLagY = vy * 1.5;
        let headLagX = vx * -2;
        
        let headScaleX = 1 + Math.min(0.2, Math.abs(vy) * 0.015);
        let headScaleY = 1 - Math.min(0.3, Math.abs(vy) * 0.02);
        
        let breath = Math.sin(time * 0.1) * 2;
        let wind = Math.sin(time * 0.05 + cx * 0.01) * 3;
        
        ctx.save();
        
        ctx.fillStyle = "rgba(15, 23, 42, 0.35)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + h / 2 - 4, w * .45, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        const flowerY = cy - 8 + headLagY;
        const flowerX = cx + headLagX;
        
        const rootX = cx;
        const rootY = cy + h / 2 - 4;
        
        const cp1x = cx + stemTilt * 30 + wind;
        const cp1y = cy + h / 4;

        ctx.strokeStyle = "#15803d";
        ctx.lineWidth = 10;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.quadraticCurveTo(cp1x, cp1y, flowerX, flowerY);
        ctx.stroke();

        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(rootX - 2, rootY - 2);
        ctx.quadraticCurveTo(cp1x - 2, cp1y, flowerX - 2, flowerY);
        ctx.stroke();

        let leafFlap = vy * 0.1;
        ctx.fillStyle = "#166534";
        ctx.beginPath();
        ctx.ellipse(cx - 28, cy + 32, 22, 10, -.4 + leafFlap, 0, Math.PI * 2);
        ctx.ellipse(cx + 28, cy + 32, 22, 10, .4 - leafFlap, 0, Math.PI * 2);
        ctx.fill();

        const petalCount = 16;
        const pRad = 38 + (isPressuring ? Math.sin(time * .8) * 4 * pressureRatio : 0) + breath;
        let spinSpeed = time * 0.015 + vx * 0.04;

        ctx.translate(flowerX, flowerY);
        ctx.rotate(stemTilt);
        ctx.scale(headScaleX, headScaleY);
        
        for (let layer = 0; layer < 2; layer++) {
            ctx.save();
            const layerOffset = layer * (Math.PI / petalCount);
            ctx.rotate(spinSpeed + layerOffset);
            const curPetalRad = layer === 0 ? pRad + 7 : pRad + 11;
            const curWidth = layer === 0 ? 11 : 9.5;

            for (let i = 0; i < petalCount; i++) {
                const ang = i * (Math.PI * 2 / petalCount);
                ctx.save();
                ctx.rotate(ang);

                const petalFlutter = Math.sin(time * 0.08 + i * 0.8 + layer) * 1.8;
                const bendX = (Math.sin(ang) * headLagY * 0.08) + petalFlutter;

                const petalGrad = ctx.createLinearGradient(0, 0, 0, -curPetalRad);
                if (isPressuring) {
                    if (layer === 0) {
                        petalGrad.addColorStop(0, "#991b1b");
                        petalGrad.addColorStop(0.5, "#dc2626");
                        petalGrad.addColorStop(1, "#f87171");
                    } else {
                        petalGrad.addColorStop(0, "#dc2626");
                        petalGrad.addColorStop(0.6, "#ef4444");
                        petalGrad.addColorStop(1, "#fecaca");
                    }
                } else {
                    if (layer === 0) {
                        petalGrad.addColorStop(0, "#b45309");
                        petalGrad.addColorStop(0.4, "#d97706");
                        petalGrad.addColorStop(0.85, "#f59e0b");
                        petalGrad.addColorStop(1, "#fbbf24");
                    } else {
                        petalGrad.addColorStop(0, "#d97706");
                        petalGrad.addColorStop(0.3, "#f59e0b");
                        petalGrad.addColorStop(0.75, "#fbbf24");
                        petalGrad.addColorStop(0.95, "#fef08a");
                        petalGrad.addColorStop(1, "#ffffff");
                    }
                }

                ctx.fillStyle = petalGrad;
                ctx.beginPath();
                ctx.moveTo(-3, -2);
                ctx.bezierCurveTo(-curWidth * 1.15, -curPetalRad * 0.35, -curWidth * 0.9 + bendX, -curPetalRad * 0.78, 0, -curPetalRad);
                ctx.bezierCurveTo(curWidth * 0.9 + bendX, -curPetalRad * 0.78, curWidth * 1.15, -curPetalRad * 0.35, 3, -2);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = isPressuring ? "rgba(153, 27, 27, 0.45)" : (layer === 0 ? "rgba(180, 83, 9, 0.5)" : "rgba(217, 119, 6, 0.45)");
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(0, -4);
                ctx.quadraticCurveTo(bendX * 0.5, -curPetalRad * 0.55, 0, -curPetalRad + 2);
                ctx.stroke();

                ctx.strokeStyle = isPressuring ? "rgba(220, 38, 38, 0.3)" : (layer === 0 ? "rgba(180, 83, 9, 0.3)" : "rgba(245, 158, 11, 0.3)");
                ctx.lineWidth = 0.8;
                ctx.stroke();

                ctx.restore();
            }
            ctx.restore();
        }

        const cRad = 32;
        ctx.shadowBlur = isPressuring ? 10 + pressureRatio * 15 : 6;
        ctx.shadowColor = isPressuring ? "#ef4444" : "#eab308";
        
        const bGrad = ctx.createRadialGradient(-dir * 6, -6, 2, 0, 0, cRad);
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
        ctx.arc(0, 0, cRad, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        if (isHurt && enemyObj && (enemyObj.hurtTimer > 10 || enemyObj.flashTimer > 0)) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
            ctx.beginPath();
            ctx.arc(0, 0, cRad, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.fillStyle = isPressuring ? "rgba(127, 29, 29, 0.5)" : "rgba(133, 77, 14, 0.5)";
        for(let r = 10; r < cRad-5; r += 6) {
            for(let a = 0; a < Math.PI * 2; a += Math.PI / (r/3)) {
                let sX = Math.cos(a + time*0.01) * r;
                let sY = Math.sin(a + time*0.01) * r;
                ctx.beginPath();
                ctx.arc(sX, sY, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.strokeStyle = isPressuring ? "#7f1d1d" : "#854d0e";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, cRad * .72, 0, Math.PI * 2);
        ctx.stroke();

        let faceOffsetX = dir * 4 + vx * 0.5 + lookX * 0.4;
        let faceOffsetY = vy * 0.5 + lookY * 0.4;

        const eyeLX = -11 + faceOffsetX;
        const eyeRX = 11 + faceOffsetX;
        const eyeY = -4 + faceOffsetY;
        
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 3.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(eyeLX - 9, eyeY - 9 + (vy < -2 ? -4 : 0));
        ctx.lineTo(eyeLX + 7, eyeY - 2);
        ctx.moveTo(eyeRX + 9, eyeY - 9 + (vy < -2 ? -4 : 0));
        ctx.lineTo(eyeRX - 7, eyeY - 2);
        ctx.stroke();

        if (isHurt) {
            ctx.strokeStyle = "#451a03";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(eyeLX - 6, eyeY - 5); ctx.lineTo(eyeLX + 5, eyeY); ctx.lineTo(eyeLX - 6, eyeY + 5);
            ctx.moveTo(eyeRX + 6, eyeY - 5); ctx.lineTo(eyeRX - 5, eyeY); ctx.lineTo(eyeRX + 6, eyeY + 5);
            ctx.stroke();
        } else if (!isBlinking) {
            ctx.fillStyle = "#1c1917";
            ctx.beginPath();
            ctx.ellipse(eyeLX, eyeY, 5, isPressuring ? 3 : 5, .2, 0, Math.PI * 2);
            ctx.ellipse(eyeRX, eyeY, 5, isPressuring ? 3 : 5, -.2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = isPressuring ? "#ef4444" : "#ffffff";
            ctx.beginPath();
            ctx.arc(eyeLX - 1.2 + lookX * 0.3, eyeY - 1 + lookY * 0.3, 1.6, 0, Math.PI * 2);
            ctx.arc(eyeRX - 1.2 + lookX * 0.3, eyeY - 1 + lookY * 0.3, 1.6, 0, Math.PI * 2);
            ctx.fill();
        }

        if (isPressuring) {
            ctx.fillStyle = "rgba(239, 68, 68, 0.75)";
            ctx.beginPath();
            ctx.arc(-18 + faceOffsetX, 8 + faceOffsetY, 6 + pressureRatio * 3, 0, Math.PI * 2);
            ctx.arc(18 + faceOffsetX, 8 + faceOffsetY, 6 + pressureRatio * 3, 0, Math.PI * 2);
            ctx.fill();
        }

        const mouthY = 12 + faceOffsetY;
        if (isHurt) {
            ctx.strokeStyle = "#451a03";
            ctx.lineWidth = 2.8;
            ctx.beginPath();
            ctx.moveTo(faceOffsetX - 8, mouthY);
            ctx.lineTo(faceOffsetX - 3, mouthY + 3);
            ctx.lineTo(faceOffsetX + 3, mouthY - 3);
            ctx.lineTo(faceOffsetX + 8, mouthY);
            ctx.stroke();
        } else if (isFiring) {
            ctx.fillStyle = "#450a0a";
            ctx.beginPath();
            ctx.ellipse(dir * 3, mouthY, 9, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#facc15";
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.moveTo(-4, mouthY - 8);
            ctx.lineTo(-2, mouthY - 2);
            ctx.lineTo(0, mouthY - 8);
            ctx.moveTo(2, mouthY - 8);
            ctx.lineTo(4, mouthY - 2);
            ctx.lineTo(6, mouthY - 8);
            ctx.fill();
        } else if (isPressuring) {
            ctx.strokeStyle = "#450a0a";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-12, mouthY + Math.sin(time * .9) * 2);
            ctx.lineTo(-4, mouthY - 1);
            ctx.lineTo(4, mouthY + 2);
            ctx.lineTo(12, mouthY - Math.sin(time * .9) * 2);
            ctx.stroke();
        } else {
            ctx.strokeStyle = "#451a03";
            ctx.lineWidth = 3;
            ctx.beginPath();
            if (vy < -2 || vy > 5) {
                ctx.ellipse(0, mouthY, 4, 6, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fill();
            } else {
                ctx.arc(0, mouthY + 6, 8, Math.PI * 1.15, Math.PI * 1.85);
                ctx.stroke();
            }
        }
        
        drawHorrorEnemyOverlay(ctx, 0, 0, w, h, dir, lookX, lookY);
        ctx.restore();
        ctx.restore();
        return;
    }
    if (type === "magma_titan") {
        ctx.save();
        const dir = facing || 1;
        const isFiring = isFiringMouth;
        
        const floatY = enemyObj ? (enemyObj.vy || 0) * 1.5 : 0;
        const breath = Math.sin(time * 0.1) * 2;
        
        ctx.translate(cx, cy + floatY);
        ctx.scale(scaleX * (dir), scaleY);

        const rad = w * 0.48 + breath;
        
        ctx.fillStyle = "rgba(69, 10, 10, 0.45)";
        ctx.beginPath();
        ctx.ellipse(0, h / 2 - 2, w * 0.6, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 30 + breath * 5;
        ctx.shadowColor = "#ff3300";
        
        const mGrad = ctx.createRadialGradient(-10, -10, 5, 0, 0, rad);
        mGrad.addColorStop(0, "#ffffff");
        mGrad.addColorStop(0.2, "#ffdd00");
        mGrad.addColorStop(0.5, "#ff3300");
        mGrad.addColorStop(0.8, "#660000");
        mGrad.addColorStop(1, "#110000");
        
        ctx.fillStyle = mGrad;
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = "rgba(255, 200, 100, 0.3)";
        ctx.beginPath();
        ctx.ellipse(-15, -15, rad * 0.4, rad * 0.2, -0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 100, 0, 0.8)";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        for (let v = 0; v < 5; v++) {
            const vAng = time * 0.05 + v * (Math.PI * 2 / 5);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(
                Math.cos(vAng)*rad*0.5, Math.sin(vAng)*rad*0.5,
                Math.cos(vAng + 0.5)*rad*0.9, Math.sin(vAng + 0.5)*rad*0.9
            );
            ctx.stroke();
        }

        ctx.fillStyle = "#110505";
        ctx.strokeStyle = "#330a0a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-rad*0.8, -rad*0.5);
        ctx.lineTo(-rad*0.4, -rad*0.9);
        ctx.lineTo(rad*0.2, -rad*0.95);
        ctx.lineTo(rad*0.7, -rad*0.6);
        ctx.lineTo(rad*0.9, -rad*0.2);
        ctx.lineTo(rad*0.6, 0);
        ctx.lineTo(rad*0.2, -rad*0.4);
        ctx.lineTo(-rad*0.3, -rad*0.2);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(-rad*0.9, rad*0.2);
        ctx.lineTo(-rad*0.7, rad*0.7);
        ctx.lineTo(-rad*0.2, rad*0.95);
        ctx.lineTo(rad*0.4, rad*0.8);
        ctx.lineTo(rad*0.8, rad*0.4);
        ctx.lineTo(rad*0.4, rad*0.2);
        ctx.lineTo(0, rad*0.5);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = "#ffaa00";
        ctx.shadowColor = "#ff4400";
        ctx.shadowBlur = 10;
        for (let g = 0; g < 3; g++) {
            const gx = -20 + g * 20;
            const dropLen = 10 + Math.sin(time * 0.2 + g * 2) * 8;
            ctx.beginPath();
            ctx.moveTo(gx - 4, rad * 0.8);
            ctx.quadraticCurveTo(gx, rad * 0.8 + dropLen + 5, gx, rad * 0.8 + dropLen + 8);
            ctx.quadraticCurveTo(gx, rad * 0.8 + dropLen + 5, gx + 4, rad * 0.8);
            ctx.closePath();
            ctx.fill();
        }
        ctx.shadowBlur = 0;

        const eyeLX = Math.cos(pAngle)*3 - 15;
        const eyeRX = Math.cos(pAngle)*3 + 15;
        const eyeY = Math.sin(pAngle)*2 - 15;
        
        ctx.fillStyle = "#0a0202";
        ctx.beginPath();
        ctx.moveTo(-35, -25); ctx.lineTo(0, -10); ctx.lineTo(35, -25);
        ctx.lineTo(0, -15); ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = "#ffea00";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#ff2200";
        ctx.beginPath();
        ctx.ellipse(eyeLX, eyeY, 8, 5, 0.2, 0, Math.PI * 2);
        ctx.ellipse(eyeRX, eyeY, 8, 5, -0.2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(eyeLX + 2, eyeY, 3, 0, Math.PI * 2);
        ctx.arc(eyeRX + 2, eyeY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        const mouthY = 20;
        ctx.save();
        if (isFiring) {
            ctx.fillStyle = "#220000";
            ctx.beginPath();
            ctx.ellipse(5, mouthY, 22, 26, 0, 0, Math.PI * 2);
            ctx.fill();
            
            const fGrad = ctx.createRadialGradient(5, mouthY, 2, 5, mouthY, 22);
            fGrad.addColorStop(0, "#ffffff");
            fGrad.addColorStop(0.3, "#ffdd00");
            fGrad.addColorStop(0.7, "#ff3300");
            fGrad.addColorStop(1, "#440000");
            
            ctx.fillStyle = fGrad;
            ctx.beginPath();
            ctx.ellipse(5, mouthY, 18, 22, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = "#0c0a09";
            ctx.beginPath();
            ctx.moveTo(-10, mouthY - 18); ctx.lineTo(-5, mouthY - 4); ctx.lineTo(0, mouthY - 18);
            ctx.moveTo(10, mouthY - 18); ctx.lineTo(15, mouthY - 4); ctx.lineTo(20, mouthY - 18);
            ctx.moveTo(-8, mouthY + 18); ctx.lineTo(-3, mouthY + 4); ctx.lineTo(2, mouthY + 18);
            ctx.fill();
        } else {
            ctx.fillStyle = "#1a0202";
            ctx.beginPath();
            ctx.ellipse(0, mouthY, 18, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = "#ff5500";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, mouthY - 2, 14, 0.2, Math.PI - 0.2);
            ctx.stroke();
            
            ctx.fillStyle = "#0c0a09";
            ctx.beginPath();
            ctx.moveTo(-10, mouthY - 8); ctx.lineTo(-6, mouthY); ctx.lineTo(-2, mouthY - 8);
            ctx.moveTo(2, mouthY - 8); ctx.lineTo(6, mouthY); ctx.lineTo(10, mouthY - 8);
            ctx.fill();
        }
        ctx.restore();
        
        drawHorrorEnemyOverlay(ctx, cx, cy, w, h, facing, lookX, lookY);
        ctx.restore();
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
        const fireVy = enemyObj ? enemyObj.vy || 0 : 0;
        const fireVx = enemyObj ? enemyObj.vx || 0 : 0;
        
        const squishX = Math.max(0.75, Math.min(1.25, 1 - Math.abs(fireVy) * 0.025 + Math.abs(fireVx) * 0.015));
        const squishY = Math.max(0.75, Math.min(1.25, 1 + Math.abs(fireVy) * 0.025 - Math.abs(fireVx) * 0.015));
        const tilt = Math.max(-0.4, Math.min(0.4, fireVx * 0.08));

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(tilt);
        ctx.scale(squishX, squishY);

        ctx.shadowColor = "#ff3300";
        ctx.shadowBlur = 18 + Math.sin(time*0.2)*5;

        const pulse = Math.sin(time * 0.2 + x) * 0.1;
        const coreRad = rad * (1 + pulse);
        
        const fireGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, coreRad * 1.3);
        fireGrad.addColorStop(0, "#ffff00");
        fireGrad.addColorStop(.3, "#ff8800");
        fireGrad.addColorStop(.7, color || "#ff2200");
        fireGrad.addColorStop(1, "#550000");
        
        ctx.fillStyle = fireGrad;
        ctx.beginPath();
        ctx.moveTo(0, -coreRad);
        for(let a=0; a<Math.PI*2; a+=0.3) {
            const rOffset = Math.sin(a * 4 + time * 0.3) * 4 + Math.cos(a * 3 - time * 0.2) * 3;
            ctx.lineTo(Math.cos(a) * (coreRad + rOffset), Math.sin(a) * (coreRad + rOffset));
        }
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 0, 0.4)";
        for (let f = 0; f < 5; f++) {
            const fAngle = time * .15 + f * Math.PI * 2 / 5;
            const fx = Math.cos(fAngle) * coreRad * .5;
            const fy = Math.sin(fAngle) * coreRad * .5 - 4;
            ctx.beginPath();
            ctx.arc(fx, fy, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = "#ff1100";
        ctx.strokeStyle = "#880000";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-10, -10); ctx.quadraticCurveTo(-15, -20, -18, -28); ctx.quadraticCurveTo(-8, -18, -4, -12);
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(10, -10); ctx.quadraticCurveTo(15, -20, 18, -28); ctx.quadraticCurveTo(8, -18, 4, -12);
        ctx.fill(); ctx.stroke();

        ctx.shadowBlur = 0;

        const aggroLevel = enemyObj && enemyObj.aggro ? 1.5 : 1;
        const isHurt = enemyObj && (enemyObj.stunTimer > 0 || enemyObj.flashTimer > 0 || (enemyObj.hurtTimer && enemyObj.hurtTimer > 0));
        ctx.strokeStyle = "#4a0000";
        ctx.lineWidth = 4 * aggroLevel;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-16, -11 + aggroLevel*2); ctx.lineTo(-4, -4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(16, -11 + aggroLevel*2); ctx.lineTo(4, -4);
        ctx.stroke();

        if (isHurt) {
            ctx.strokeStyle = "#ffff00";
            ctx.shadowColor = "#ffaa00";
            ctx.shadowBlur = 8;
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(-11 + lookX * .5, -5); ctx.lineTo(-5 + lookX * .5, -2); ctx.lineTo(-11 + lookX * .5, 1);
            ctx.moveTo(11 + lookX * .5, -5); ctx.lineTo(5 + lookX * .5, -2); ctx.lineTo(11 + lookX * .5, 1);
            ctx.stroke();
            ctx.shadowBlur = 0;
        } else if (!isBlinking) {
            ctx.fillStyle = "#ffff00";
            ctx.shadowColor = "#ffaa00";
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.ellipse(-7 + lookX * .5, -2 + lookY * .5, 5, 3.5 - aggroLevel, -.2, 0, Math.PI * 2);
            ctx.ellipse(7 + lookX * .5, -2 + lookY * .5, 5, 3.5 - aggroLevel, .2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            ctx.fillStyle = "#aa0000";
            ctx.beginPath();
            ctx.ellipse(-7 + lookX, -2 + lookY, 1.5, 3.5 - aggroLevel, 0, 0, Math.PI*2);
            ctx.ellipse(7 + lookX, -2 + lookY, 1.5, 3.5 - aggroLevel, 0, 0, Math.PI*2);
            ctx.fill();
        }

        if (isHurt) {
            ctx.strokeStyle = "#3d0000";
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(-7, 7); ctx.lineTo(-3, 9); ctx.lineTo(2, 5); ctx.lineTo(7, 8);
            ctx.stroke();
        } else {
            const mouthH = isFiringMouth ? 14 + Math.sin(time * .5) * 5 : 5 + (aggroLevel>1?3:0);
            const mouthW = 12;
            ctx.fillStyle = "#2a0005";
            ctx.beginPath();
            ctx.ellipse(0, 8, mouthW, mouthH, 0, 0, Math.PI * 2);
            ctx.fill();

            if (isFiringMouth) {
                ctx.fillStyle = "#ffff00";
                ctx.shadowColor = "#ffff00";
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.ellipse(0, 8, mouthW * .5, mouthH * .6, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                for (let k = 0; k < 4; k++) {
                    const spX = (Math.random() - .5) * 12;
                    const spY = 8 + (Math.random() - .5) * mouthH;
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath(); ctx.arc(spX, spY, 2, 0, Math.PI * 2); ctx.fill();
                }
            }

            ctx.fillStyle = "#ffdddd";
            ctx.beginPath();
            ctx.moveTo(-7, 8 - mouthH); ctx.lineTo(-4, 8 - mouthH + 5); ctx.lineTo(-1, 8 - mouthH);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(7, 8 - mouthH); ctx.lineTo(4, 8 - mouthH + 5); ctx.lineTo(1, 8 - mouthH);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(-5, 8 + mouthH); ctx.lineTo(-2, 8 + mouthH - 4); ctx.lineTo(1, 8 + mouthH);
            ctx.fill();
        }

        ctx.restore();
    } else if (type === "happy") {
        const dir = facing || 1;
        const isFiring = isFiringMouth;

        let vx = enemyObj && enemyObj.vx ? enemyObj.vx : 0;
        let vy = enemyObj && enemyObj.vy ? enemyObj.vy : 0;
        
        let tilt = vx * 0.08;
        let stretchY = Math.min(0.25, Math.abs(vy) * 0.02);
        let stretchX = -stretchY * 0.6;
        
        let breath = Math.sin(time * .14 + (enemyObj ? enemyObj.x * .05 : 0)) * 2;
        let bodyScaleX = (1 + stretchX);
        let bodyScaleY = (1 + stretchY);

        let drawW = (w * 0.48) * bodyScaleX + breath;
        let drawH = (h * 0.46) * bodyScaleY - breath;
        
        let faceOffX = lookX * 0.5 + vx * 0.3;
        let faceOffY = lookY * 0.5 + vy * 0.3;

        let isPuffing = enemyObj && enemyObj.shoot && enemyObj.shootTimer < 30 && enemyObj.shootTimer > 0;
        let isHurt = enemyObj && (enemyObj.stunTimer > 0 || enemyObj.flashTimer > 0 || (enemyObj.hurtTimer && enemyObj.hurtTimer > 0));
        let pDist = enemyObj && typeof game !== 'undefined' && game.player ? Math.hypot(game.player.x - enemyObj.x, game.player.y - enemyObj.y) : 999;
        let isAngry = pDist < 200 && !isHurt && !isPuffing;

        ctx.save();
        
        ctx.fillStyle = "rgba(15, 23, 42, 0.32)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + h / 2 - 2, w * .44, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(cx, cy);
        ctx.rotate(tilt);
        
        ctx.shadowColor = color || "#ff9900";
        ctx.shadowBlur = 8;
        const grad = ctx.createRadialGradient(0, -h * .15, 4, 0, 0, w * .7);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(.28, color || "#ff9900");
        grad.addColorStop(1, "#083812");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, drawW, drawH, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.beginPath();
        ctx.ellipse(-drawW * .35, -drawH * .45, drawW * .28, drawH * .14, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        let stemBendX = vx * -0.8;
        let stemBendY = -drawH - 2 + vy * 0.5;
        ctx.strokeStyle = "#4ade80";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, -drawH * 0.9);
        ctx.quadraticCurveTo(stemBendX * 0.5, stemBendY + 4, stemBendX, stemBendY);
        ctx.stroke();

        let leafFlap = Math.sin(time * 0.15) * 0.4 + (vx * -0.05);
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.ellipse(stemBendX - 5, stemBendY - 2, 5.5, 3, -Math.PI/4 + leafFlap, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#4ade80";
        ctx.beginPath();
        ctx.ellipse(stemBendX + 5, stemBendY - 2, 5.5, 3, Math.PI/4 - leafFlap, 0, Math.PI * 2);
        ctx.fill();

        const eyeLX = -7 + faceOffX;
        const eyeRX = 7 + faceOffX;
        const eyeY = -3 + faceOffY;

        if (!isBlinking) {
            if (isHurt) {
                ctx.strokeStyle = "#111";
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(eyeLX - 3, eyeY - 3); ctx.lineTo(eyeLX + 3, eyeY + 3);
                ctx.moveTo(eyeLX - 3, eyeY + 3); ctx.lineTo(eyeLX + 3, eyeY - 3);
                ctx.moveTo(eyeRX - 3, eyeY - 3); ctx.lineTo(eyeRX + 3, eyeY + 3);
                ctx.moveTo(eyeRX - 3, eyeY + 3); ctx.lineTo(eyeRX + 3, eyeY - 3);
                ctx.stroke();
            } else {
                ctx.fillStyle = "#fff";
                ctx.beginPath();
                let eyeScaleY = 1 - Math.min(0.4, Math.abs(vy) * 0.03);
                ctx.arc(eyeLX, eyeY, 5, 0, Math.PI * 2);
                ctx.arc(eyeRX, eyeY, 5, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = "#111";
                ctx.beginPath();
                ctx.arc(eyeLX + lookX * 0.6, eyeY + lookY * 0.6, 2.6, 0, Math.PI * 2);
                ctx.arc(eyeRX + lookX * 0.6, eyeY + lookY * 0.6, 2.6, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = "#fff";
                ctx.beginPath();
                ctx.arc(eyeLX - 1 + lookX * 0.6, eyeY - 1 + lookY * 0.6, 1.2, 0, Math.PI * 2);
                ctx.arc(eyeRX - 1 + lookX * 0.6, eyeY - 1 + lookY * 0.6, 1.2, 0, Math.PI * 2);
                ctx.fill();

                if (isAngry) {
                    ctx.strokeStyle = "#111";
                    ctx.lineWidth = 1.8;
                    ctx.beginPath();
                    ctx.moveTo(eyeLX - 5, eyeY - 5); ctx.lineTo(eyeLX + 2, eyeY - 3);
                    ctx.moveTo(eyeRX + 5, eyeY - 5); ctx.lineTo(eyeRX - 2, eyeY - 3);
                    ctx.stroke();
                }
            }
        } else {
            ctx.strokeStyle = "#111";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.arc(eyeLX, eyeY, 4, Math.PI, 0);
            ctx.arc(eyeRX, eyeY, 4, Math.PI, 0);
            ctx.stroke();
        }

        ctx.fillStyle = isPuffing ? "rgba(255, 100, 150, 0.9)" : "rgba(255, 110, 160, 0.7)";
        ctx.beginPath();
        let cheekW = isPuffing ? 6 + Math.sin(time*0.5)*1.5 : 4;
        let cheekH = isPuffing ? 4 + Math.sin(time*0.5)*1.5 : 2.4;
        ctx.ellipse(-10 + faceOffX, 3 + faceOffY, cheekW, cheekH, 0, 0, Math.PI * 2);
        ctx.ellipse(10 + faceOffX, 3 + faceOffY, cheekW, cheekH, 0, 0, Math.PI * 2);
        ctx.fill();

        const mouthY = 3 + faceOffY;
        if (isHurt) {
            ctx.strokeStyle = "#111";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(faceOffX - 4, mouthY - 1);
            ctx.lineTo(faceOffX + 4, mouthY + 1);
            ctx.stroke();
        } else if (isPuffing) {
            ctx.fillStyle = "#111";
            ctx.beginPath();
            ctx.arc(faceOffX, mouthY + 2, 2.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (isFiringMouth) {
            ctx.fillStyle = "#3d0010";
            ctx.beginPath();
            ctx.ellipse(faceOffX, mouthY + 4, 4.5, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ff6688";
            ctx.beginPath();
            ctx.arc(faceOffX, mouthY + 6, 3, 0, Math.PI);
            ctx.fill();
        } else {
            ctx.strokeStyle = "#111";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            if (vy < -2 || vy > 5) {
                ctx.ellipse(faceOffX, mouthY + 2, 3, 4, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = "#111";
                ctx.fill();
            } else if (isAngry) {
                ctx.moveTo(faceOffX - 4, mouthY + 2); ctx.lineTo(faceOffX + 4, mouthY + 2);
                ctx.lineTo(faceOffX, mouthY + 5); ctx.closePath();
                ctx.fillStyle = "#111"; ctx.fill();
            } else {
                ctx.arc(faceOffX, mouthY + 2, 4.5, .1 * Math.PI, .9 * Math.PI);
                ctx.stroke();
            }
        }
        
        ctx.restore();
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
        const fishVx = enemyObj ? enemyObj.vx || 0 : 0;
        const isFiringMouth = mouthOpen > 0 || (enemyObj && enemyObj.shootTimer && enemyObj.shootTimer > 60);
        const isAngry = enemyObj && enemyObj.aggro;
        
        const speed = Math.sqrt(fishVx * fishVx + fishVy * fishVy);
        const squishX = Math.max(0.6, Math.min(1.4, 1 + speed * 0.03));
        const squishY = Math.max(0.6, Math.min(1.4, 1 - speed * 0.03));
        const tilt = Math.max(-1.2, Math.min(1.2, fishVy * .08)) * fDir;

        const breath = Math.sin(time * 0.15) * 0.03;
        const bodyWagX = Math.cos(time * 0.25) * 6;
        const tailWag = Math.sin(time * 0.4) * 16;
        const tailSegWag = Math.sin(time * 0.4 - 0.5) * 22;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(tilt);
        ctx.scale(fDir * (squishX + breath), squishY - breath);

        ctx.shadowColor = "#0ea5e9";
        ctx.shadowBlur = isAngry ? 25 : 10;

        const finFlap = Math.sin(time * .3) * 6;
        ctx.fillStyle = "rgba(14, 165, 233, 0.9)";
        ctx.beginPath();
        ctx.moveTo(w * .1, -h * .3);
        ctx.quadraticCurveTo(w * .0, -h * .8 - finFlap, -w * .2 + bodyWagX * 0.5, -h * .5);
        ctx.lineTo(-w * .3 + bodyWagX * 0.8, -h * .3);
        ctx.fill();

        ctx.fillStyle = "#0284c7";
        ctx.beginPath();
        ctx.moveTo(-w * .3, h * .1);
        ctx.lineTo(-w * .5 + bodyWagX, h * .05 + tailWag * 0.3);
        ctx.lineTo(-w * .5 + bodyWagX, -h * .15 + tailWag * 0.3);
        ctx.lineTo(-w * .3, -h * .2);
        ctx.fill();
        
        ctx.fillStyle = "rgba(244, 63, 94, 0.95)";
        ctx.beginPath();
        ctx.moveTo(-w * .45 + bodyWagX, -h * .05 + tailWag * 0.3);
        ctx.quadraticCurveTo(-w * .7 + tailSegWag, -h * .6 + tailWag, -w * .85 + tailSegWag, -h * .5 + tailWag);
        ctx.quadraticCurveTo(-w * .65 + tailSegWag, 0, -w * .85 + tailSegWag, h * .4 + tailWag);
        ctx.quadraticCurveTo(-w * .7 + tailSegWag, h * .5 + tailWag, -w * .45 + bodyWagX, h * .05 + tailWag * 0.3);
        ctx.fill();
        
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-w * .5 + bodyWagX, -h * .05 + tailWag * 0.3); ctx.lineTo(-w * .75 + tailSegWag, -h * .4 + tailWag);
        ctx.moveTo(-w * .5 + bodyWagX, -h * .05 + tailWag * 0.3); ctx.lineTo(-w * .8 + tailSegWag, 0);
        ctx.moveTo(-w * .5 + bodyWagX, -h * .05 + tailWag * 0.3); ctx.lineTo(-w * .75 + tailSegWag, h * .3 + tailWag);
        ctx.stroke();

        const fishGrad = ctx.createLinearGradient(-w * .4, -h * .4, w * .5, h * .4);
        fishGrad.addColorStop(0, "#0284c7");
        fishGrad.addColorStop(.4, "#06b6d4");
        fishGrad.addColorStop(.8, "#38bdf8");
        fishGrad.addColorStop(1, "#bae6fd");

        ctx.fillStyle = fishGrad;
        ctx.beginPath();
        ctx.moveTo(w * .5, h * .1);
        ctx.quadraticCurveTo(w * .5, -h * .4, 0, -h * .45);
        ctx.quadraticCurveTo(-w * .4, -h * .3, -w * .4, -h * .05);
        ctx.quadraticCurveTo(-w * .4, h * .35, 0, h * .4);
        ctx.quadraticCurveTo(w * .45, h * .35, w * .5, h * .1);
        ctx.fill();
        
        const fishShadowGrad = ctx.createRadialGradient(-w*.1, h*.2, 0, -w*.1, h*.2, w*.7);
        fishShadowGrad.addColorStop(0, "rgba(0,0,0,0)");
        fishShadowGrad.addColorStop(1, "rgba(2, 6, 23, 0.6)");
        ctx.fillStyle = fishShadowGrad;
        ctx.fill();

        ctx.strokeStyle = "rgba(2, 132, 199, 0.7)";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        for (let g = 0; g < 3; g++) {
            const gillX = w * .15 + g * 5;
            ctx.beginPath();
            ctx.moveTo(gillX, -h * .15 + g * 2);
            ctx.quadraticCurveTo(gillX - 4, h * .05, gillX, h * .2 - g * 2);
            ctx.stroke();
        }

        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 1.5;
        for (let scX = -w * .25; scX <= w * .05; scX += 12) {
            for (let scY = -h*.2; scY <= h*.2; scY += 10) {
                const scOffset = (scX % 24 === 0) ? 5 : 0;
                ctx.beginPath();
                ctx.arc(scX, scY + scOffset, 6, -.6 * Math.PI, .6 * Math.PI);
                ctx.stroke();
            }
        }

        const pecWag = Math.cos(time * 0.4) * 12;
        const pecScale = Math.max(0.2, Math.sin(time * 0.4) * 0.8 + 0.5);
        ctx.fillStyle = "rgba(244, 63, 94, 0.85)";
        ctx.beginPath();
        ctx.moveTo(w * .1, h * .15);
        ctx.quadraticCurveTo(w * .1 - pecWag, h * .5 + pecScale * h*.4, w * .25, h * .3 + pecScale * h*.1);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.stroke();

        const eyeBaseX = w * .28;
        const eyeBaseY = -h * .12;
        
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(eyeBaseX, eyeBaseY, 8, isAngry ? 5 : 9, isAngry ? 0.2 : 0, 0, Math.PI * 2);
        ctx.fill();
        
        const lookX = Math.max(-2, Math.min(4, fishVx * 0.5));
        const lookY = Math.max(-2, Math.min(2, fishVy * 0.5));
        
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(eyeBaseX + 2 + lookX, eyeBaseY + lookY, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(eyeBaseX + 3 + lookX, eyeBaseY - 1 + lookY, 1.5, 0, Math.PI * 2);
        ctx.fill();

        if (isAngry) {
            ctx.fillStyle = "#0284c7";
            ctx.beginPath();
            ctx.moveTo(eyeBaseX - 10, eyeBaseY - 10);
            ctx.quadraticCurveTo(eyeBaseX, eyeBaseY - 2, eyeBaseX + 12, eyeBaseY - 5);
            ctx.lineTo(eyeBaseX + 12, eyeBaseY - 12);
            ctx.lineTo(eyeBaseX - 10, eyeBaseY - 12);
            ctx.fill();
            
            ctx.strokeStyle = "#881337";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(eyeBaseX - 8, eyeBaseY - 6);
            ctx.lineTo(eyeBaseX + 8, eyeBaseY - 2);
            ctx.stroke();
        }

        const mouthX = w * .48;
        const mouthY = h * .08;
        const mOpen = isFiringMouth ? 1 : Math.max(0, Math.sin(time * 0.2));
        
        ctx.fillStyle = "#4c0519";
        ctx.beginPath();
        ctx.moveTo(w * .48, h * .02);
        ctx.quadraticCurveTo(mouthX - 4, mouthY + mOpen * 8, mouthX - 2, mouthY + mOpen * 14);
        ctx.lineTo(w * .42, mouthY + mOpen * 12);
        ctx.fill();
        
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 2;
        ctx.stroke();
        
        if (isFiringMouth) {
            const glowOrb = Math.sin(time*0.8)*4 + 6;
            ctx.fillStyle = "#00e5ff";
            ctx.shadowColor = "#00e5ff";
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(mouthX - 2, mouthY + 6, glowOrb, 0, Math.PI*2);
            ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.restore();
    } else if (type === "coral_crab") {
        ctx.save();
        const bounce = Math.sin(time * 0.4) * 4;
        const speedSquash = enemyObj ? 1 - Math.abs(enemyObj.vx || 0) * 0.05 : 1;
        
        ctx.translate(cx, cy + bounce);
        ctx.scale(1 / speedSquash, speedSquash);
        
        ctx.shadowColor = "#ec4899";
        ctx.shadowBlur = 12;
        ctx.strokeStyle = "#be123c";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        const walkPhase = time * (enemyObj && Math.abs(enemyObj.vx) > 0 ? 0.8 : 0.2);
        for (let side = -1; side <= 1; side += 2) {
            for (let leg = 0; leg < 3; leg++) {
                const legAngle = walkPhase + leg * 1.5 + (side > 0 ? 0 : Math.PI);
                const lift = Math.max(0, Math.sin(legAngle)) * 8;
                const stride = Math.cos(legAngle) * 8 * side;
                const legBaseX = side * (w * .35);
                const legBaseY = 4 + leg * 3;
                
                ctx.beginPath();
                ctx.moveTo(legBaseX, legBaseY);
                ctx.quadraticCurveTo(legBaseX + side * 15, legBaseY - lift, legBaseX + side * 22 + stride, legBaseY + 18 - lift);
                ctx.stroke();
                
                ctx.fillStyle = "#fda4af";
                ctx.beginPath(); ctx.arc(legBaseX + side * 12, legBaseY + 8 - lift/2, 1.5, 0, Math.PI*2); ctx.fill();
            }
        }
        
        const shellGrad = ctx.createRadialGradient(0, -6, 4, 0, 0, w * .48);
        shellGrad.addColorStop(0, "#ffe4e6");
        shellGrad.addColorStop(0.3, "#fda4af");
        shellGrad.addColorStop(.6, "#f43f5e");
        shellGrad.addColorStop(1, "#881337");
        
        ctx.fillStyle = shellGrad;
        ctx.beginPath();
        ctx.moveTo(-w*.45, 0);
        ctx.quadraticCurveTo(-w*.2, -h*.45, 0, -h*.5);
        ctx.quadraticCurveTo(w*.2, -h*.45, w*.45, 0);
        ctx.quadraticCurveTo(w*.3, h*.3, 0, h*.35);
        ctx.quadraticCurveTo(-w*.3, h*.3, -w*.45, 0);
        ctx.fill();

        ctx.fillStyle = "#22d3ee";
        ctx.shadowColor = "#22d3ee";
        for (let n = -2; n <= 2; n++) {
            ctx.beginPath();
            ctx.arc(n * 8, -4 + Math.abs(n) * 3, 2.5 + Math.sin(time*0.1 + n)*0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.strokeStyle = "#e11d48";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-10, -8); ctx.quadraticCurveTo(-14, -20, -12 + lookX, -22 + lookY);
        ctx.moveTo(10, -8); ctx.quadraticCurveTo(14, -20, 12 + lookX, -22 + lookY);
        ctx.stroke();
        
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(-12 + lookX, -22 + lookY, 5, 0, Math.PI * 2);
        ctx.arc(12 + lookX, -22 + lookY, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "#020617";
        ctx.beginPath();
        ctx.arc(-12 + lookX*1.5, -22 + lookY*1.5, 2.5, 0, Math.PI * 2);
        ctx.arc(12 + lookX*1.5, -22 + lookY*1.5, 2.5, 0, Math.PI * 2);
        ctx.fill();

        const snap = Math.max(0, Math.sin(time * 0.3)) * 0.8;
        for (let side = -1; side <= 1; side += 2) {
            const clawX = side * (w * .48);
            const clawY = -2;
            ctx.save();
            ctx.translate(clawX, clawY);
            ctx.rotate(side * (0.2 + snap) + Math.sin(time*0.1)*0.1);
            
            ctx.fillStyle = "#e11d48";
            ctx.strokeStyle = "#9f1239";
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(side * 10, -18, side * 22, -10);
            ctx.quadraticCurveTo(side * 12, -4, 0, 0);
            ctx.fill(); ctx.stroke();
            
            ctx.rotate(-side * (0.6 + snap * 1.5));
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(side * 10, 8, side * 18, 2);
            ctx.quadraticCurveTo(side * 8, 0, 0, 0);
            ctx.fill(); ctx.stroke();
            
            ctx.restore();
        }
        
        if (Math.random() < 0.1) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
            ctx.beginPath(); ctx.arc(0, 8, Math.random()*3+1, 0, Math.PI*2); ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.restore();
    } else if (type === "jellyfish_orb") {
        ctx.save();
        const pulse = 1 + Math.sin(time * 0.15 + x) * 0.15;
        const jRad = w * 0.45 * pulse;
        
        const floatY = enemyObj ? (enemyObj.vy || 0) * 2 : 0;
        ctx.translate(cx, cy + floatY);
        
        const scaleX = 1 / (1 - Math.min(0, floatY)*0.02);
        const scaleY = 1 - Math.min(0, floatY)*0.02;
        ctx.scale(scaleX, scaleY);

        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 20 + pulse * 10;
        
        ctx.strokeStyle = "rgba(34, 211, 238, 0.85)";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        for (let t = -4; t <= 4; t++) {
            const tentX = t * (w * 0.08);
            const tentPhase = time * 0.15 + t * 0.5;
            const tLen = 30 + Math.abs(t)*5 + floatY*2;
            
            ctx.beginPath();
            ctx.moveTo(tentX, 5);
            ctx.bezierCurveTo(
                tentX + Math.sin(tentPhase) * 15, 15 + tLen*0.3, 
                tentX - Math.sin(tentPhase * 1.2) * 20, 15 + tLen*0.6, 
                tentX + Math.sin(tentPhase * 0.8) * 12, 15 + tLen
            );
            ctx.stroke();
            
            ctx.fillStyle = "#f472b6";
            ctx.beginPath();
            ctx.arc(tentX + Math.sin(tentPhase * 0.8) * 12, 15 + tLen, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        const bellGrad = ctx.createRadialGradient(0, -6, 2, 0, 0, jRad);
        bellGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        bellGrad.addColorStop(.3, "rgba(56, 189, 248, 0.85)");
        bellGrad.addColorStop(.7, "rgba(168, 85, 247, 0.65)");
        bellGrad.addColorStop(1, "rgba(6, 182, 212, 0.2)");
        
        ctx.fillStyle = bellGrad;
        ctx.beginPath();
        ctx.arc(0, 0, jRad, Math.PI, 0, false);
        const folds = 7;
        for (let f = 0; f <= folds; f++) {
            const fx = jRad - f / folds * (jRad * 2);
            const fy = (f % 2 === 0 ? 6 : -3) * pulse;
            ctx.lineTo(fx, fy);
        }
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(0, -10, jRad*0.4, jRad*0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = "rgba(168, 85, 247, 0.8)";
        ctx.lineWidth = 1.5;
        for (let s = 0; s < 4; s++) {
            const sAng = time * 0.1 + s * (Math.PI / 2);
            ctx.beginPath(); ctx.moveTo(0, -10);
            ctx.lineTo(Math.cos(sAng) * jRad*0.6, -10 + Math.sin(sAng) * jRad*0.5);
            ctx.stroke();
        }

        if (!isBlinking) {
            ctx.fillStyle = "#020617";
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.ellipse(-8 + lookX, -8 + lookY, 3, 4, -0.2, 0, Math.PI * 2);
            ctx.ellipse(8 + lookX, -8 + lookY, 3, 4, 0.2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = "#38bdf8";
            ctx.beginPath();
            ctx.arc(-8 + lookX, -9 + lookY, 1.5, 0, Math.PI * 2);
            ctx.arc(8 + lookX, -9 + lookY, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.shadowBlur = 0;
        ctx.restore();
    } else if (type === "ink_octopus") {
        const fDir = facing || 1;
        const octopusVy = enemyObj ? enemyObj.vy || 0 : 0;
        const octopusVx = enemyObj ? enemyObj.vx || 0 : 0;
        const speed = Math.sqrt(octopusVx * octopusVx + octopusVy * octopusVy);
        
        const squishX = Math.max(0.6, Math.min(1.4, 1 - Math.abs(octopusVy)*0.03 + Math.abs(octopusVx)*0.02));
        const squishY = Math.max(0.6, Math.min(1.4, 1 + Math.abs(octopusVy)*0.03 - Math.abs(octopusVx)*0.02));
        const tilt = Math.max(-0.6, Math.min(0.6, octopusVx * 0.12)) * fDir;
        
        const breath = Math.sin(time * 0.1) * 0.08;
        const colorPulse = Math.sin(time * 0.2) * 0.5 + 0.5;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(fDir * (squishX + breath), squishY - breath);
        ctx.rotate(tilt);

        ctx.shadowColor = `rgba(139, 92, 246, ${0.5 + colorPulse * 0.5})`;
        ctx.shadowBlur = 20;

        for (let tIdx = 0; tIdx < 8; tIdx++) {
            const tBaseX = -w * .45 + tIdx * (w * .9) / 7;
            const tPhase = time * .15 + tIdx * 1.3;
            
            const tSwayX1 = Math.sin(tPhase) * 6 - (octopusVx * 1.5 * fDir);
            const tSwayX2 = Math.sin(tPhase - 1) * 12 - (octopusVx * 2.5 * fDir);
            
            const tLength = h * .6 + Math.cos(tPhase * 1.2) * 10 - (octopusVy * 2);
            
            ctx.strokeStyle = tIdx % 2 === 0 ? "#581c87" : "#6d28d9";
            ctx.lineWidth = 5;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(tBaseX, h * .1);
            ctx.bezierCurveTo(
                tBaseX + tSwayX1, h * .3,
                tBaseX + tSwayX2, h * .2 + tLength * 0.6,
                tBaseX + tSwayX2 * 1.5, h * .15 + tLength
            );
            ctx.stroke();

            ctx.fillStyle = "#e879f9";
            ctx.strokeStyle = "#c084fc";
            ctx.lineWidth = 1;
            for(let s=0.2; s<=0.9; s+=0.2) {
                const px = tBaseX + tSwayX1 * s + (tSwayX2 - tSwayX1) * s * s * 1.5;
                const py = h * .1 + (tLength + h*.05) * s;
                
                const cupOffset = Math.sin(tPhase - s*2) * 3;
                
                ctx.beginPath(); 
                ctx.ellipse(px + cupOffset, py, 3, 1.5, Math.PI/8 * cupOffset, 0, Math.PI*2);
                ctx.fill(); ctx.stroke();
            }
        }

        const octoShadowGrad = ctx.createRadialGradient(-w*.1, h*.1, 0, -w*.1, h*.1, w*.7);
        octoShadowGrad.addColorStop(0, "rgba(0,0,0,0)");
        octoShadowGrad.addColorStop(1, "rgba(10, 0, 30, 0.7)");

        const octoGrad = ctx.createLinearGradient(-w * .4, -h * .5, w * .4, h * .2);
        octoGrad.addColorStop(0, "#d8b4fe");
        octoGrad.addColorStop(.3, "#a855f7");
        octoGrad.addColorStop(.7, "#7e22ce");
        octoGrad.addColorStop(1, "#3b0764");
        
        ctx.fillStyle = octoGrad;
        ctx.beginPath();
        ctx.moveTo(w * .45, 0);
        ctx.quadraticCurveTo(w * .5, -h * .5, 0, -h * .55);
        ctx.quadraticCurveTo(-w * .5, -h * .5, -w * .45, 0);
        ctx.quadraticCurveTo(-w * .4, h * .3, 0, h * .35);
        ctx.quadraticCurveTo(w * .4, h * .3, w * .45, 0);
        ctx.fill();
        ctx.fillStyle = octoShadowGrad;
        ctx.fill();

        ctx.fillStyle = `rgba(240, 171, 252, ${0.4 + colorPulse * 0.4})`;
        ctx.shadowColor = "#f0abfc";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(-w * .2, -h * .3, 4, 0, Math.PI * 2);
        ctx.arc(w * .15, -h * .35, 3.5, 0, Math.PI * 2);
        ctx.arc(-w * .05, -h * .42, 2.5, 0, Math.PI * 2);
        ctx.arc(w * .28, -h * .25, 4.5, 0, Math.PI * 2);
        ctx.arc(-w * .3, -h * .15, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        const isFiring = enemyObj && enemyObj.mouthOpenTimer > 0;
        const siphonOpen = isFiring ? 2 : 1;
        ctx.fillStyle = "#1e1b4b";
        ctx.beginPath();
        ctx.ellipse(w * .35, h * .15, 7 * siphonOpen, 5 * siphonOpen, .4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#c084fc";
        ctx.lineWidth = 2;
        ctx.stroke();

        if (isFiring) {
            ctx.fillStyle = "#000000";
            ctx.beginPath(); ctx.arc(w*.38, h*.18, 4, 0, Math.PI*2); ctx.fill();
            
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            for(let p=0; p<4; p++) {
                ctx.beginPath();
                ctx.arc(w*.45 + Math.random()*15, h*.2 + (Math.random()-0.5)*15, Math.random()*4+2, 0, Math.PI*2);
                ctx.fill();
            }
        }

        const isAngry = enemyObj && enemyObj.aggro;
        const eyeX1 = w * .05, eyeX2 = w * .28;
        const eyeY = -h * .1;
        
        ctx.fillStyle = isAngry ? "#fca5a5" : "#fef08a";
        ctx.beginPath();
        ctx.ellipse(eyeX1, eyeY, 6, isAngry ? 4.5 : 7, 0, 0, Math.PI * 2);
        ctx.ellipse(eyeX2, eyeY, 6, isAngry ? 4.5 : 7, 0, 0, Math.PI * 2);
        ctx.fill();
        
        const lookX = Math.max(-2, Math.min(2, octopusVx * 0.5));
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.rect(eyeX1 - 4 + lookX, eyeY - 1, 8, 2);
        ctx.rect(eyeX2 - 4 + lookX, eyeY - 1, 8, 2);
        ctx.fill();
        
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(eyeX1 - 1 + lookX, eyeY - 2.5, 1.5, 0, Math.PI * 2);
        ctx.arc(eyeX2 - 1 + lookX, eyeY - 2.5, 1.5, 0, Math.PI * 2);
        ctx.fill();

        if (isAngry) {
            ctx.fillStyle = "#7e22ce";
            ctx.beginPath();
            ctx.moveTo(eyeX1 - 8, eyeY - 10); ctx.lineTo(eyeX1 + 8, eyeY - 10);
            ctx.lineTo(eyeX1 + 8, eyeY - 3); ctx.lineTo(eyeX1 - 8, eyeY - 5);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(eyeX2 - 8, eyeY - 10); ctx.lineTo(eyeX2 + 8, eyeY - 10);
            ctx.lineTo(eyeX2 + 8, eyeY - 5); ctx.lineTo(eyeX2 - 8, eyeY - 3);
            ctx.fill();
            
            ctx.strokeStyle = "#3b0764";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(eyeX1 - 8, eyeY - 5); ctx.lineTo(eyeX1 + 8, eyeY - 3);
            ctx.moveTo(eyeX2 - 8, eyeY - 3); ctx.lineTo(eyeX2 + 8, eyeY - 5);
            ctx.stroke();
        }

        ctx.shadowBlur = 0;
        ctx.restore();
    } else if (type === "electric_squid") {
        const fDir = facing || 1;
        const squidVy = enemyObj ? enemyObj.vy || 0 : 0;
        const squidVx = enemyObj ? enemyObj.vx || 0 : 0;
        const speed = Math.sqrt(squidVx * squidVx + squidVy * squidVy);
        
        const squishX = Math.max(0.6, Math.min(1.4, 1 - Math.abs(squidVy)*0.03 + Math.abs(squidVx)*0.015));
        const squishY = Math.max(0.6, Math.min(1.4, 1 + Math.abs(squidVy)*0.03 - Math.abs(squidVx)*0.015));
        const tilt = Math.max(-0.6, Math.min(0.6, squidVx * 0.15)) * fDir;
        const breath = Math.sin(time * 0.2) * 0.05;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(fDir * (squishX + breath), squishY - breath);
        ctx.rotate(tilt);

        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 18 + Math.sin(time * 0.5) * 8;

        const tentacleEndpoints = [];
        for (let tIdx = 0; tIdx < 8; tIdx++) {
            const tBaseX = -w * .35 + tIdx * (w * .7) / 7;
            const tPhase = time * .18 + tIdx * 1.2;
            
            const tSwayX1 = Math.sin(tPhase) * 8 - (squidVx * 1.5 * fDir);
            const tSwayX2 = Math.sin(tPhase - 1.5) * 15 - (squidVx * 2.5 * fDir);
            
            const tLength = h * .5 + Math.cos(tPhase * 1.1) * 8 - (squidVy * 1.5);
            const endX = tBaseX + tSwayX2 * 1.6;
            const endY = h * .15 + tLength;
            
            tentacleEndpoints.push({x: endX, y: endY});
            
            ctx.strokeStyle = (tIdx === 3 || tIdx === 4) ? "#38bdf8" : "#0284c7";
            ctx.lineWidth = 4;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(tBaseX, h * .15);
            ctx.bezierCurveTo(
                tBaseX + tSwayX1, h * .3,
                tBaseX + tSwayX2, h * .2 + tLength * 0.5,
                endX, endY
            );
            ctx.stroke();
            
            if (Math.sin(time * .4 + tIdx*2) > -0.2) {
                ctx.fillStyle = "#fef08a";
                ctx.shadowColor = "#fef08a";
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(tBaseX + tSwayX1*0.8, h * .15 + tLength*0.4, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 18 + Math.sin(time * 0.5) * 8;
            }
        }

        const isFiring = enemyObj && enemyObj.mouthOpenTimer > 0;
        const isAngry = enemyObj && enemyObj.aggro;
        ctx.strokeStyle = "rgba(165, 243, 252, 0.8)";
        ctx.shadowColor = "#a5f3fc";
        ctx.lineWidth = 1.5;
        if (Math.random() > (isAngry ? 0.1 : 0.4)) {
            for(let a=0; a<(isAngry ? 3 : 1); a++) {
                const startIdx = Math.floor(Math.random() * 4);
                const endIdx = Math.floor(Math.random() * 4) + 4;
                const p1 = tentacleEndpoints[startIdx];
                const p2 = tentacleEndpoints[endIdx];
                
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                const midX = (p1.x + p2.x)/2 + (Math.random()-0.5)*15;
                const midY = (p1.y + p2.y)/2 + (Math.random()-0.5)*15;
                ctx.lineTo(midX, midY);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }

        const finFlap = Math.sin(time * .35) * 8 - (squidVy * 0.8);
        const finWave = Math.cos(time * .35) * 4;
        
        ctx.fillStyle = "#0284c7";
        ctx.beginPath();
        ctx.moveTo(0, -h * .55);
        ctx.quadraticCurveTo(-w * .3, -h * .4 + finWave, -w * .5 + finFlap, -h * .2);
        ctx.lineTo(-w * .1, -h * .15);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, -h * .55);
        ctx.quadraticCurveTo(w * .3, -h * .4 + finWave, w * .5 - finFlap, -h * .2);
        ctx.lineTo(w * .1, -h * .15);
        ctx.closePath();
        ctx.fill();

        const squidShadowGrad = ctx.createRadialGradient(-w*.1, h*.1, 0, -w*.1, h*.1, w*.6);
        squidShadowGrad.addColorStop(0, "rgba(0,0,0,0)");
        squidShadowGrad.addColorStop(1, "rgba(0, 40, 80, 0.7)");

        const squidGrad = ctx.createLinearGradient(-w * .3, -h * .5, w * .3, h * .2);
        squidGrad.addColorStop(0, "#a5f3fc");
        squidGrad.addColorStop(.3, "#22d3ee");
        squidGrad.addColorStop(.7, "#0284c7");
        squidGrad.addColorStop(1, "#082f49");
        
        ctx.fillStyle = squidGrad;
        ctx.beginPath();
        ctx.moveTo(0, -h * .55);
        ctx.quadraticCurveTo(w * .45, -h * .2, w * .35, h * .15);
        ctx.lineTo(-w * .35, h * .15);
        ctx.quadraticCurveTo(-w * .45, -h * .2, 0, -h * .55);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = squidShadowGrad;
        ctx.fill();
        
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#083344";
        ctx.stroke();

        ctx.fillStyle = "#082f49";
        ctx.beginPath();
        ctx.ellipse(0, h*.16, 8, 4, 0, 0, Math.PI*2);
        ctx.fill();
        if (isFiring || isAngry) {
            ctx.fillStyle = "#a5f3fc";
            ctx.beginPath(); ctx.arc(0, h*.18, 5, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = "rgba(165, 243, 252, 0.6)";
            for(let p=0; p<(isFiring ? 6 : 2); p++) {
                ctx.beginPath();
                ctx.arc((Math.random()-0.5)*15, h*.2 + Math.random()*15, Math.random()*3+1, 0, Math.PI*2);
                ctx.fill();
            }
        }

        ctx.strokeStyle = "rgba(165, 243, 252, 0.8)";
        ctx.shadowColor = "#a5f3fc";
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        for (let r = 0; r < 4; r++) {
            const ry = -h * .35 + r * (h * .12);
            ctx.beginPath();
            ctx.moveTo(-w * .18 + r * 2.5, ry);
            ctx.quadraticCurveTo(0, ry + 3, w * .18 - r * 2.5, ry);
            ctx.stroke();
            
            if (Math.sin(time*0.2 + r) > -0.5) {
                ctx.fillStyle = "#ffffff";
                ctx.beginPath(); ctx.arc(0, ry + 1.5, 2, 0, Math.PI*2); ctx.fill();
            }
        }

        const sEyeX1 = w * .1, sEyeX2 = w * .28;
        const sEyeY = h * .03;
        
        ctx.fillStyle = isAngry ? "#fca5a5" : "#fef08a";
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.ellipse(sEyeX1, sEyeY, 5, 6, -0.2, 0, Math.PI * 2);
        ctx.ellipse(sEyeX2, sEyeY, 5, 6, 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        const lookX = Math.max(-2, Math.min(2, squidVx * 0.5));
        ctx.fillStyle = "#082f49";
        ctx.beginPath();
        ctx.arc(sEyeX1 + lookX, sEyeY, 2.5, 0, Math.PI * 2);
        ctx.arc(sEyeX2 + lookX, sEyeY, 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(sEyeX1 - 1 + lookX, sEyeY - 1, 1, 0, Math.PI * 2);
        ctx.arc(sEyeX2 - 1 + lookX, sEyeY - 1, 1, 0, Math.PI * 2);
        ctx.fill();

        if (isAngry) {
            ctx.fillStyle = "#0284c7";
            ctx.beginPath();
            ctx.moveTo(sEyeX1 - 6, sEyeY - 8); ctx.lineTo(sEyeX1 + 6, sEyeY - 8);
            ctx.lineTo(sEyeX1 + 6, sEyeY - 3); ctx.lineTo(sEyeX1 - 6, sEyeY - 5);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(sEyeX2 - 6, sEyeY - 8); ctx.lineTo(sEyeX2 + 6, sEyeY - 8);
            ctx.lineTo(sEyeX2 + 6, sEyeY - 5); ctx.lineTo(sEyeX2 - 6, sEyeY - 3);
            ctx.fill();
            
            ctx.strokeStyle = "#082f49";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(sEyeX1 - 6, sEyeY - 5); ctx.lineTo(sEyeX1 + 6, sEyeY - 3);
            ctx.moveTo(sEyeX2 - 6, sEyeY - 3); ctx.lineTo(sEyeX2 + 6, sEyeY - 5);
            ctx.stroke();
        }

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
        const isHurt = enemyObj && (enemyObj.stunTimer > 0 || enemyObj.flashTimer > 0 || (enemyObj.hurtTimer && enemyObj.hurtTimer > 0));
        if (isHurt) {
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(cx - 9, cy - 9 - squishB); ctx.lineTo(cx - 3, cy - 6 - squishB); ctx.lineTo(cx - 9, cy - 3 - squishB);
            ctx.moveTo(cx + 9, cy - 9 - squishB); ctx.lineTo(cx + 3, cy - 6 - squishB); ctx.lineTo(cx + 9, cy - 3 - squishB);
            ctx.stroke();
        } else if (!isBlinking) {
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
        const dir = facing || 1;
        const breath = Math.sin(time * 0.12 + (enemyObj ? enemyObj.x * 0.05 : 0)) * 1.2;
        let vx = enemyObj && enemyObj.vx ? enemyObj.vx : 0;
        let vy = enemyObj && enemyObj.vy ? enemyObj.vy : 0;
        const onGround = enemyObj ? enemyObj.onGround : true;
        const isPrepJumping = enemyObj && enemyObj.jumpTimer > 0 && enemyObj.jumpTimer <= 12 && onGround;
        const isHurt = enemyObj && (enemyObj.stunTimer > 0 || enemyObj.flashTimer > 0 || (enemyObj.hurtTimer && enemyObj.hurtTimer > 0));
        const isRising = vy < -1.5;
        const isFalling = vy > 2.5;

        let tilt = Math.max(-0.35, Math.min(0.35, vx * 0.08 + (vy * 0.015 * dir)));

        let sX = (scaleX !== undefined ? scaleX : 1);
        let sY = (scaleY !== undefined ? scaleY : 1);

        let drawW = (w * 0.88) * sX;
        let drawH = (h * 0.88 + breath) * sY;

        ctx.save();
        ctx.translate(cx, cy);

        const shadowDist = onGround ? h * 0.44 : h * 0.44 + Math.min(30, Math.max(0, vy * 2));
        const shadowScale = onGround ? 1 : Math.max(0.4, 1 - (shadowDist - h * 0.44) * 0.02);
        ctx.fillStyle = "rgba(15, 23, 42, 0.35)";
        ctx.beginPath();
        ctx.ellipse(0, shadowDist, (drawW * 0.48) * shadowScale, 5 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.rotate(tilt);

        const walkCycle = time * 0.25 * (vx !== 0 ? Math.sign(vx) : 1);
        const footW = 6;
        const footH = 4.5;
        const footBaseY = drawH * 0.48;

        ctx.fillStyle = color || "#ff4444";
        if (onGround) {
            const footLiftL = Math.max(0, Math.sin(walkCycle) * 3);
            const footLiftR = Math.max(0, Math.sin(walkCycle + Math.PI) * 3);
            ctx.beginPath();
            ctx.ellipse(-drawW * 0.28, footBaseY - footLiftL, footW, footH, 0, 0, Math.PI * 2);
            ctx.ellipse(drawW * 0.28, footBaseY - footLiftR, footW, footH, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            const legTrail = isRising ? 3 : (isFalling ? -2 : 0);
            ctx.beginPath();
            ctx.ellipse(-drawW * 0.25, footBaseY + legTrail, footW * 0.9, footH * 1.1, -0.2, 0, Math.PI * 2);
            ctx.ellipse(drawW * 0.25, footBaseY + legTrail, footW * 0.9, footH * 1.1, 0.2, 0, Math.PI * 2);
            ctx.fill();
        }

        const cornerR = Math.max(6, Math.min(12, drawW * 0.28));
        const baseColor = color || "#ff4444";

        ctx.fillStyle = baseColor;
        ctx.shadowColor = baseColor;
        ctx.shadowBlur = isHurt ? 16 : 8;
        ctx.beginPath();
        ctx.roundRect(-drawW / 2, -drawH / 2, drawW, drawH, cornerR);
        ctx.fill();
        ctx.shadowBlur = 0;

        const shadeGrad = ctx.createLinearGradient(0, -drawH * 0.5, 0, drawH * 0.5);
        shadeGrad.addColorStop(0, "rgba(255, 255, 255, 0.42)");
        shadeGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.06)");
        shadeGrad.addColorStop(0.7, "rgba(0, 0, 0, 0.16)");
        shadeGrad.addColorStop(1, "rgba(0, 0, 0, 0.52)");
        ctx.fillStyle = shadeGrad;
        ctx.beginPath();
        ctx.roundRect(-drawW / 2, -drawH / 2, drawW, drawH, cornerR);
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.roundRect(-drawW / 2 + 1, -drawH / 2 + 1, drawW - 2, drawH - 2, cornerR - 1);
        ctx.stroke();

        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.beginPath();
        ctx.ellipse(-drawW * 0.22, -drawH * 0.24, drawW * 0.18, drawH * 0.1, -Math.PI / 8, 0, Math.PI * 2);
        ctx.fill();

        let faceOffX = lookX * 0.55 + vx * 0.25;
        let faceOffY = lookY * 0.45 + (isRising ? -3 : (isFalling ? 3 : (isPrepJumping ? 4 : 0)));

        const eyeSpacing = drawW * 0.22;
        const eyeLX = -eyeSpacing + faceOffX;
        const eyeRX = eyeSpacing + faceOffX;
        const eyeY = -drawH * 0.08 + faceOffY;

        let pDist = enemyObj && typeof game !== 'undefined' && game.player ? Math.hypot(game.player.x - enemyObj.x, game.player.y - enemyObj.y) : 999;
        let isAngry = pDist < 220 && !isHurt;
        let isPuffing = enemyObj && enemyObj.shoot && enemyObj.shootTimer < 30 && enemyObj.shootTimer > 0;

        if (isHurt) {
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = Math.max(1.8, Math.min(2.8, drawW * 0.08));
            const es = Math.max(2.5, Math.min(4.5, drawW * 0.12));
            ctx.beginPath();
            ctx.moveTo(eyeLX - es, eyeY - es); ctx.lineTo(eyeLX + es, eyeY); ctx.lineTo(eyeLX - es, eyeY + es);
            ctx.moveTo(eyeRX + es, eyeY - es); ctx.lineTo(eyeRX - es, eyeY); ctx.lineTo(eyeRX + es, eyeY + es);
            ctx.stroke();

            const swW = Math.max(1.5, Math.min(3, drawW * 0.08));
            const swH = Math.max(2.5, Math.min(4.5, drawH * 0.12));
            ctx.fillStyle = "#38bdf8";
            ctx.beginPath();
            ctx.ellipse(drawW * 0.32, -drawH * 0.32, swW, swH, 0.3, 0, Math.PI * 2);
            ctx.fill();
        } else if (isPrepJumping) {
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 2.6;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(eyeLX - 5, eyeY); ctx.lineTo(eyeLX + 4, eyeY - 2);
            ctx.moveTo(eyeRX + 5, eyeY); ctx.lineTo(eyeRX - 4, eyeY - 2);
            ctx.stroke();
        } else if (isRising) {
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 2.6;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(eyeLX - 4, eyeY + 2); ctx.quadraticCurveTo(eyeLX, eyeY - 5, eyeLX + 4, eyeY + 2);
            ctx.moveTo(eyeRX - 4, eyeY + 2); ctx.quadraticCurveTo(eyeRX, eyeY - 5, eyeRX + 4, eyeY + 2);
            ctx.stroke();
        } else if (isFalling) {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(eyeLX, eyeY, 5.5, 0, Math.PI * 2);
            ctx.arc(eyeRX, eyeY, 5.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.arc(eyeLX + lookX * 0.4, eyeY + 1, 2.8, 0, Math.PI * 2);
            ctx.arc(eyeRX + lookX * 0.4, eyeY + 1, 2.8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(eyeLX - 1, eyeY, 1.2, 0, Math.PI * 2);
            ctx.arc(eyeRX - 1, eyeY, 1.2, 0, Math.PI * 2);
            ctx.fill();
        } else if (!isBlinking) {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.ellipse(eyeLX, eyeY, 4.8, 6, 0, 0, Math.PI * 2);
            ctx.ellipse(eyeRX, eyeY, 4.8, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.arc(eyeLX + lookX * 0.6, eyeY + lookY * 0.6, 2.8, 0, Math.PI * 2);
            ctx.arc(eyeRX + lookX * 0.6, eyeY + lookY * 0.6, 2.8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(eyeLX - 1.2 + lookX * 0.5, eyeY - 1.4 + lookY * 0.5, 1.4, 0, Math.PI * 2);
            ctx.arc(eyeRX - 1.2 + lookX * 0.5, eyeY - 1.4 + lookY * 0.5, 1.4, 0, Math.PI * 2);
            ctx.fill();

            if (isAngry) {
                ctx.strokeStyle = "#0f172a";
                ctx.lineWidth = 2.4;
                ctx.beginPath();
                ctx.moveTo(eyeLX - 5, eyeY - 7); ctx.lineTo(eyeLX + 3, eyeY - 4);
                ctx.moveTo(eyeRX + 5, eyeY - 7); ctx.lineTo(eyeRX - 3, eyeY - 4);
                ctx.stroke();
            }
        } else {
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.arc(eyeLX, eyeY - 2, 4, 0.2 * Math.PI, 0.8 * Math.PI);
            ctx.arc(eyeRX, eyeY - 2, 4, 0.2 * Math.PI, 0.8 * Math.PI);
            ctx.stroke();
        }

        if (!isAngry && !isHurt) {
            ctx.fillStyle = "rgba(255, 100, 100, 0.4)";
            ctx.beginPath();
            ctx.ellipse(eyeLX - 2, eyeY + 8, 3.2, 2, 0, 0, Math.PI * 2);
            ctx.ellipse(eyeRX + 2, eyeY + 8, 3.2, 2, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        const mouthY = eyeY + 8;
        if (isHurt) {
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = Math.max(1.6, Math.min(2.5, drawW * 0.07));
            const mw = Math.max(3, Math.min(6, drawW * 0.14));
            ctx.beginPath();
            ctx.moveTo(faceOffX - mw, mouthY);
            ctx.lineTo(faceOffX - mw * 0.35, mouthY + 2.2);
            ctx.lineTo(faceOffX + mw * 0.35, mouthY - 2.2);
            ctx.lineTo(faceOffX + mw, mouthY);
            ctx.stroke();
        } else if (isPrepJumping) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(faceOffX - 4, mouthY - 1, 8, 3.5);
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(faceOffX - 4, mouthY - 1, 8, 3.5);
            ctx.beginPath();
            ctx.moveTo(faceOffX, mouthY - 1); ctx.lineTo(faceOffX, mouthY + 2.5);
            ctx.stroke();
        } else if (isRising) {
            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.arc(faceOffX, mouthY - 1, 3.8, 0, Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#f43f5e";
            ctx.beginPath();
            ctx.arc(faceOffX, mouthY + 1.5, 2, Math.PI, 0);
            ctx.fill();
        } else if (isFalling) {
            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.ellipse(faceOffX, mouthY + 1, 3.5, 4.8, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (isFiringMouth) {
            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.ellipse(faceOffX + dir * 2, mouthY, 5, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (isAngry) {
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.arc(faceOffX, mouthY + 4, 4, 1.2 * Math.PI, 1.8 * Math.PI);
            ctx.stroke();
        } else {
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.arc(faceOffX, mouthY - 1, 4 + breath * 0.4, 0.15 * Math.PI, 0.85 * Math.PI);
            ctx.stroke();
        }

        ctx.restore();
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
    if (k >= 4) return 4;
    if (k >= 3) return 3;
    if (k >= 2) return 2;
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
    if (ctx && ctx.isDummy) return;
    const x = enemy.x - offsetX;
    const y = enemy.y;
    const w = enemy.w;
    const h = enemy.h;
    const vw = typeof VIEW_W !== "undefined" ? VIEW_W : 1024;
    if (x + w < -150 || x > vw + 150) return;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const facing = enemy.facing || -1;
    const friendCols = [ "#0284c7", "#16a34a", "#ca8a04", "#7c3aed", "#ea580c" ];
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
    const bodyGrad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    bodyGrad.addColorStop(0, "#ffffff");
    bodyGrad.addColorStop(.2, baseColor);
    bodyGrad.addColorStop(1, "#111827");
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 8);
    ctx.stroke();
    ctx.fillStyle = "rgba(244, 63, 94, 0.5)";
    ctx.beginPath();
    ctx.ellipse(-w * .32, h * .1, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.ellipse(w * .32, h * .1, 4, 2.5, 0, 0, Math.PI * 2);
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
