function drawGear(ctx, gx, gy, radius, teeth, angle, primaryColor, secondaryColor) {
    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(angle);
    ctx.fillStyle = primaryColor || "#d97706";
    ctx.strokeStyle = secondaryColor || "#78350f";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    const toothDepth = radius * .28;
    const numPoints = teeth * 2;
    for (let i = 0; i < numPoints; i++) {
        const a = i / numPoints * Math.PI * 2;
        const r = i % 2 === 0 ? radius : radius - toothDepth;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = secondaryColor || "#92400e";
    ctx.beginPath();
    ctx.arc(0, 0, radius * .52, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = primaryColor || "#d97706";
    for (let h = 0; h < 4; h++) {
        const ha = h / 4 * Math.PI * 2;
        const hx = Math.cos(ha) * radius * .33;
        const hy = Math.sin(ha) * radius * .33;
        ctx.beginPath();
        ctx.arc(hx, hy, radius * .1, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = "#fde68a";
    ctx.beginPath();
    ctx.arc(0, 0, radius * .22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#451a03";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
}

function drawFriendEnhanced(ctx, x, y, w, h, baseColor, facing, mood, time, index) {
    ctx.save();
    const cx = x + w / 2;
    const cy = y + h;
    let scaleX = 1, scaleY = 1;
    if (mood === "crying") {
        const sob = Math.sin(time * .22 + index * 1.5);
        scaleY = .94 + sob * .05;
        scaleX = 1.05 - sob * .03;
    } else {
        const breath = Math.sin(time * .15 + index) * .04;
        scaleX = 1 + breath;
        scaleY = 1 - breath;
    }
    ctx.translate(cx, y + h / 2);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-cx, -(y + h / 2));
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.ellipse(cx, cy - 2, w * .45, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, baseColor || "#ff66cc");
    grad.addColorStop(1, "#111827");
    let topCol = baseColor || "#ff66cc";
    let botCol = "#374151";
    if (baseColor === "#ff66cc") {
        topCol = "#f472b6";
        botCol = "#be185d";
    } else if (baseColor === "#00e5ff") {
        topCol = "#38bdf8";
        botCol = "#0369a1";
    } else if (baseColor === "#ffd700") {
        topCol = "#fde047";
        botCol = "#b45309";
    } else if (baseColor === "#00ff88") {
        topCol = "#4ade80";
        botCol = "#15803d";
    } else if (baseColor === "#ff5533") {
        topCol = "#fb923c";
        botCol = "#c2410c";
    }
    const cGrad = ctx.createLinearGradient(x, y, x, y + h);
    cGrad.addColorStop(0, topCol);
    cGrad.addColorStop(1, botCol);
    ctx.fillStyle = cGrad;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.beginPath();
    ctx.ellipse(x + w * .35, y + 5, w * .26, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    const cheekY = y + h * .54;
    ctx.fillStyle = "rgba(255, 105, 180, 0.55)";
    ctx.beginPath();
    ctx.ellipse(x + w * .18, cheekY, 3.2, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * .82, cheekY, 3.2, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    const eyeY = y + h * .38;
    if (mood === "crying") {
        ctx.strokeStyle = "#1e1b4b";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + w * .18, eyeY - 6);
        ctx.lineTo(x + w * .34, eyeY - 3);
        ctx.moveTo(x + w * .82, eyeY - 6);
        ctx.lineTo(x + w * .66, eyeY - 3);
        ctx.stroke();
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.ellipse(x + w * .3, eyeY, 3.2, 4.2, 0, 0, Math.PI * 2);
        ctx.ellipse(x + w * .7, eyeY, 3.2, 4.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x + w * .28, eyeY - 1.5, 1.2, 0, Math.PI * 2);
        ctx.arc(x + w * .68, eyeY - 1.5, 1.2, 0, Math.PI * 2);
        ctx.fill();
        const tearTime = (time * .08 + index * .33) % 1;
        const tearY = eyeY + 2 + tearTime * (h * .5);
        ctx.fillStyle = "#38bdf8";
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(x + (index % 2 === 0 ? w * .28 : w * .72), tearY, 2.2 * (1 - tearTime * .3), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        const sobMouth = Math.sin(time * .25 + index) * 1.5;
        ctx.strokeStyle = "#312e81";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(cx, y + h * .74 + sobMouth, 5, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
    } else {
        ctx.strokeStyle = "#1e1b4b";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(x + w * .22, eyeY - 5);
        ctx.quadraticCurveTo(x + w * .32, eyeY - 7, x + w * .4, eyeY - 5);
        ctx.moveTo(x + w * .6, eyeY - 5);
        ctx.quadraticCurveTo(x + w * .68, eyeY - 7, x + w * .78, eyeY - 5);
        ctx.stroke();
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 2.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x + w * .22, eyeY + 1);
        ctx.quadraticCurveTo(x + w * .31, eyeY - 4, x + w * .4, eyeY + 1);
        ctx.moveTo(x + w * .6, eyeY + 1);
        ctx.quadraticCurveTo(x + w * .69, eyeY - 4, x + w * .78, eyeY + 1);
        ctx.stroke();
        ctx.fillStyle = "#7f1d1d";
        ctx.beginPath();
        ctx.arc(cx, y + h * .66, 6, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = "#fb7185";
        ctx.beginPath();
        ctx.arc(cx, y + h * .7, 3.5, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(cx - 2.5, y + h * .65, 5, 1.8);
        const hPulse = 1 + Math.sin(time * .3 + index) * .18;
        ctx.save();
        ctx.translate(cx, y - 10);
        ctx.scale(hPulse, hPulse);
        ctx.fillStyle = "#ff2d75";
        ctx.shadowColor = "#ff66aa";
        ctx.shadowBlur = 8;
        ctx.font = "16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("♥", 0, 0);
        ctx.restore();
    }
    ctx.restore();
}

function drawFriendsCage(ctx, cameraX, time) {
    if (currentLevel >= 4 && currentLevel !== 6 || !game.cageFriends) return;
    const cj = levels[currentLevel] ? levels[currentLevel].jaula : null;
    if (!cj) return;
    const cx = cj.x - cameraX;
    if (cx + cj.w < -200 || cx > VIEW_W + 200) return;
    const base = cj.y + cj.h;
    const AW = 32;
    const AH = 32;
    const worldBtnX = cj.x - 85;
    const btnW = 50;
    const btnScreenX = worldBtnX - cameraX;
    if (game.cageState === 0 && game.player && !game.player.frozen) {
        const pl = game.player;
        const onBtnX = pl.x + pl.w > worldBtnX + 2 && pl.x < worldBtnX + btnW - 2;
        const onBtnY = Math.abs(pl.y + pl.h - base) < 20 && pl.vy >= 0;
        if (onBtnX && onBtnY) {
            game.cageBtnPressed = true;
            game.cageState = 1;
            game.cageOpenProgress = 0;
            game.cageGearsAngle = 0;
            game.player.frozen = true;
            game.player.facing = 1;
            game.player.vx = 0;
            try {
                playSound(260, .25, "sawtooth", .25, 90);
                playSound(880, .15, "sine", .2, 1320);
            } catch (e) {}
            if (typeof particles !== "undefined" && Array.isArray(particles)) {
                for (let k = 0; k < 15; k++) {
                    particles.push({
                        x: worldBtnX + btnW / 2 + (Math.random() - .5) * 35,
                        y: base - 10,
                        vx: (Math.random() - .5) * 5,
                        vy: -Math.random() * 4 - 1.5,
                        life: 20,
                        color: "#ef4444",
                        size: 3,
                        type: "spark"
                    });
                }
            }
        }
    }
    if (game.cageState === 1) {
        game.cageOpenProgress = (game.cageOpenProgress || 0) + .012;
        game.cageGearsAngle = (game.cageGearsAngle || 0) + .28;
        if (Math.floor(time * 60) % 8 === 0) {
            try {
                playSound(160 + game.cageOpenProgress * 260, .06, "triangle", .12, 110);
            } catch (e) {}
        }
        if (Math.random() < .35 && typeof particles !== "undefined" && Array.isArray(particles)) {
            particles.push({
                x: cj.x + (Math.random() < .5 ? 18 : cj.w - 18),
                y: cj.y - 12 + (Math.random() - .5) * 10,
                vx: (Math.random() - .5) * 3,
                vy: Math.random() * 3,
                life: 14,
                color: "#ffd700",
                size: 2.5,
                type: "spark"
            });
        }
        if (game.cageOpenProgress >= 1) {
            game.cageOpenProgress = 1;
            game.cageState = 2;
            game.cageCelebrateTimer = 0;
            try {
                playSound(523, .3, "triangle", .3, 1046);
                playSound(880, .45, "sine", .35, 1760);
            } catch (e) {}
            if (typeof particles !== "undefined" && Array.isArray(particles)) {
                for (let i = 0; i < 55; i++) {
                    particles.push({
                        x: cj.x + cj.w / 2 + (Math.random() - .5) * 90,
                        y: cj.y + (Math.random() - .5) * 40,
                        vx: (Math.random() - .5) * 9,
                        vy: -Math.random() * 8 - 3,
                        life: 45 + Math.random() * 25,
                        color: [ "#ff007f", "#00ffff", "#ffd700", "#00ff88", "#ffffff", "#ff9900" ][Math.floor(Math.random() * 6)],
                        size: 4 + Math.random() * 6,
                        type: "spark"
                    });
                }
            }
            window.showAnimatedMessage(__("dlg_friends_cage_si"));
        }
    }
    const liftY = cj.h * Math.min(1, game.cageOpenProgress || 0);
    ctx.save();
    const btnIsPressed = game.cageBtnPressed || game.cageState >= 1;
    const btnH = btnIsPressed ? 5 : 14;
    const btnY = base - btnH;
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(btnScreenX, base - 8, btnW, 8, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#94a3b8";
    ctx.beginPath();
    ctx.arc(btnScreenX + 5, base - 4, 1.8, 0, Math.PI * 2);
    ctx.arc(btnScreenX + btnW - 5, base - 4, 1.8, 0, Math.PI * 2);
    ctx.fill();
    const bGrad = ctx.createLinearGradient(btnScreenX, btnY, btnScreenX, base);
    if (btnIsPressed) {
        bGrad.addColorStop(0, "#4ade80");
        bGrad.addColorStop(1, "#15803d");
        ctx.shadowColor = "#22c55e";
        ctx.shadowBlur = 10;
    } else {
        bGrad.addColorStop(0, "#f87171");
        bGrad.addColorStop(.5, "#ef4444");
        bGrad.addColorStop(1, "#991b1b");
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 12;
    }
    ctx.fillStyle = bGrad;
    ctx.beginPath();
    ctx.roundRect(btnScreenX + 6, btnY, btnW - 12, btnH, [ 4, 4, 1, 1 ]);
    ctx.fill();
    ctx.shadowBlur = 0;
    if (!btnIsPressed) {
        const bounce = Math.sin(time * .15) * 4;
        ctx.fillStyle = "#fde047";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 6;
        ctx.fillText(__("ui_pisar_boton") || "▼ PISAR ▼", btnScreenX + btnW / 2, btnY - 8 + bounce);
        ctx.shadowBlur = 0;
    }
    ctx.fillStyle = "rgba(15, 10, 30, 0.65)";
    ctx.beginPath();
    ctx.roundRect(cx, cj.y, cj.w, cj.h, 6);
    ctx.fill();
    const baseGrad = ctx.createLinearGradient(cx, base - 10, cx, base);
    baseGrad.addColorStop(0, "#7c3aed");
    baseGrad.addColorStop(1, "#3b0764");
    ctx.fillStyle = baseGrad;
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(cx - 4, base - 10, cj.w + 8, 12, 4);
    ctx.fill();
    ctx.stroke();
    const colGrad = ctx.createLinearGradient(cx, cj.y, cx + 12, cj.y);
    colGrad.addColorStop(0, "#8b5cf6");
    colGrad.addColorStop(1, "#4c1d95");
    ctx.fillStyle = colGrad;
    ctx.strokeStyle = "#c084fc";
    ctx.lineWidth = 2;
    ctx.fillRect(cx - 4, cj.y - 12, 14, cj.h + 6);
    ctx.strokeRect(cx - 4, cj.y - 12, 14, cj.h + 6);
    ctx.fillRect(cx + cj.w - 10, cj.y - 12, 14, cj.h + 6);
    ctx.strokeRect(cx + cj.w - 10, cj.y - 12, 14, cj.h + 6);
    ctx.fillStyle = "#ffd700";
    for (let ri = 0; ri < 4; ri++) {
        const ry = cj.y + ri * (cj.h / 3);
        ctx.beginPath();
        ctx.arc(cx + 3, ry, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + cj.w - 3, ry, 2.2, 0, Math.PI * 2);
        ctx.fill();
    }
    const topGrad = ctx.createLinearGradient(cx, cj.y - 32, cx, cj.y);
    topGrad.addColorStop(0, "#6d28d9");
    topGrad.addColorStop(1, "#4c1d95");
    ctx.fillStyle = topGrad;
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(cx - 6, cj.y - 32, cj.w + 12, 24, 6);
    ctx.fill();
    ctx.stroke();
    const gAngle = game.cageGearsAngle || 0;
    drawGear(ctx, cx + 16, cj.y - 20, 16, 8, gAngle, "#d97706", "#78350f");
    drawGear(ctx, cx + cj.w - 16, cj.y - 20, 16, 8, gAngle, "#d97706", "#78350f");
    drawGear(ctx, cx + cj.w / 2, cj.y - 20, 12, 6, -gAngle * 1.35, "#b45309", "#451a03");
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([ 4, 4 ]);
    ctx.beginPath();
    ctx.moveTo(cx + 16, cj.y - 8);
    ctx.lineTo(cx + 16, cj.y - liftY);
    ctx.moveTo(cx + cj.w - 16, cj.y - 8);
    ctx.lineTo(cx + cj.w - 16, cj.y - liftY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#ffffff";
    ctx.font = 'bold 13px "Courier Prime", monospace';
    ctx.textAlign = "center";
    ctx.shadowColor = "#000000";
    ctx.shadowBlur = 5;
    ctx.fillText(__("ui_jaula_amigos"), cx + cj.w / 2, cj.y - 38);
    ctx.shadowBlur = 0;
    if (game.cageState < 2) {
        const totalWidth = game.cageFriends.length * (AW + 12) - 12;
        const startX = cx + (cj.w - totalWidth) / 2;
        game.cageFriends.forEach((col, i) => {
            const ax = startX + i * (AW + 12);
            const ay = base - AH - 4;
            drawFriendEnhanced(ctx, ax, ay, AW, AH, col, 1, "crying", time, i);
        });
    }
    const gridTopY = cj.y - liftY;
    const gridBotY = base - liftY;
    ctx.save();
    const rGrad = ctx.createLinearGradient(cx, gridTopY, cx, gridTopY + 10);
    rGrad.addColorStop(0, "#a855f7");
    rGrad.addColorStop(1, "#581c87");
    ctx.fillStyle = rGrad;
    ctx.strokeStyle = "#c084fc";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx + 4, gridTopY, cj.w - 8, 10, 3);
    ctx.fill();
    ctx.stroke();
    const numBars = 4;
    for (let bi = 1; bi <= numBars; bi++) {
        const barX = cx + cj.w * (bi / (numBars + 1));
        const barGrad = ctx.createLinearGradient(barX - 4, 0, barX + 4, 0);
        barGrad.addColorStop(0, "#059669");
        barGrad.addColorStop(.3, "#34d399");
        barGrad.addColorStop(.6, "#10b981");
        barGrad.addColorStop(1, "#065f46");
        ctx.fillStyle = barGrad;
        ctx.shadowColor = "#10b981";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(barX - 3.5, gridTopY + 8, 7, Math.max(0, gridBotY - gridTopY - 14), 3);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(barX - .5, gridTopY + 10);
        ctx.lineTo(barX - .5, gridBotY - 8);
        ctx.stroke();
    }
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 3.5;
    ctx.shadowColor = "#059669";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(cx + 8, gridTopY + (gridBotY - gridTopY) * .38);
    ctx.lineTo(cx + cj.w - 8, gridTopY + (gridBotY - gridTopY) * .38);
    ctx.moveTo(cx + 8, gridTopY + (gridBotY - gridTopY) * .72);
    ctx.lineTo(cx + cj.w - 8, gridTopY + (gridBotY - gridTopY) * .72);
    ctx.stroke();
    ctx.shadowBlur = 0;
    if (game.cageOpenProgress < .2) {
        ctx.fillStyle = "#ffd700";
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(cx + cj.w / 2, gridTopY + (gridBotY - gridTopY) * .5, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    ctx.restore();
    if (game.cageState >= 2) {
        game.cageCelebrateTimer = (game.cageCelebrateTimer || 0) + 1;
        const cTimer = game.cageCelebrateTimer;
        const pl = game.player || {
            x: cj.x - 120,
            y: base - 32,
            w: 32,
            h: 32
        };
        const peggyX = pl.x;
        if (game.player) {
            game.player.checkpointShowTimer = 50;
            if (cTimer % 28 === 0) game.player.vy = -4;
        }
        const friendOffsets = [ -44, 46, -82, 84, -120 ];
        game.cageFriends.forEach((col, i) => {
            const targetWorldX = peggyX + (friendOffsets[i % friendOffsets.length] || 45);
            const startWorldX = cj.x + 20 + i * 36;
            let curWorldX, curWorldY;
            if (cTimer < 35) {
                const t = cTimer / 35;
                curWorldX = startWorldX + (targetWorldX - startWorldX) * t;
                const arcH = Math.sin(t * Math.PI) * 75;
                curWorldY = base - AH - arcH;
            } else {
                const jumpCycle = Math.abs(Math.sin(time * .28 + i * 1.5));
                const jumpH = jumpCycle * 44;
                curWorldX = targetWorldX;
                curWorldY = base - AH - jumpH;
            }
            const facingPeggy = curWorldX < peggyX ? 1 : -1;
            drawFriendEnhanced(ctx, curWorldX - cameraX, curWorldY, AW, AH, col, facingPeggy, "happy", time, i);
        });
        if (cTimer >= 140 && game.cageState === 2) {
            game.cageState = 3;
            if (game.player) game.player.frozen = false;
            if (window.postGameHorror) {
                gameState = "horrorCinematic";
                if (game.player) game.player.frozen = true;
                window.showAnimatedMessage( __("msg_wii_gracias"));
                setTimeout(() => {
                    const creepyTexts = [ __("dlg_horror_amigo_1"), __("dlg_horror_amigo_2"), __("dlg_horror_amigo_3"), __("dlg_horror_amigo_4"), __("dlg_horror_amigo_5") ];
                    const lvlIdx = typeof currentLevel === "number" ? currentLevel : 0;
                    const msg = creepyTexts[lvlIdx % creepyTexts.length];
                    window.showAnimatedDialogue(__("ui_speaker_friend"), "😨", msg, () => {
                        playSound(70, .5, "sawtooth", .5, 25);
                        playSound(100, .6, "sawtooth", .4, 40);
                        if (typeof applyShake === "function") applyShake(16);
                        if (typeof game !== "undefined") game.flash = 25;
                        const friendOffsets = [ -44, 46, -82, 84, -120 ];
                        const baseFloor = cj.y + cj.h;
                        if (Array.isArray(game.cageFriends) && Array.isArray(restos)) {
                            game.cageFriends.forEach((col, i) => {
                                const fx = peggyX + (friendOffsets[i % friendOffsets.length] || 45);
                                const fy = baseFloor - AH / 2;
                                const hh = AH / 2;
                                slashes.push({
                                    x: fx,
                                    y: fy,
                                    t: 0,
                                    facing: i % 2 === 0 ? 1 : -1
                                });
                                restos.push({
                                    x: fx,
                                    y: fy - hh / 2,
                                    w: AW,
                                    h: hh,
                                    color: col,
                                    part: "top",
                                    groundY: baseFloor,
                                    vx: (i % 2 === 0 ? 3.5 : -3.5) + (Math.random() - .5) * 2,
                                    vy: -(5.5 + Math.random() * 2),
                                    rot: 0,
                                    vRot: (i % 2 === 0 ? .2 : -.2) + (Math.random() - .5) * .1,
                                    bounces: 0,
                                    settled: false,
                                    poolRadius: 0
                                });
                                restos.push({
                                    x: fx,
                                    y: fy + hh / 2,
                                    w: AW,
                                    h: hh,
                                    color: col,
                                    part: "bottom",
                                    groundY: baseFloor,
                                    vx: (i % 2 === 0 ? -1.5 : 1.5) + (Math.random() - .5) * 1.5,
                                    vy: -(3 + Math.random() * 1.5),
                                    rot: 0,
                                    vRot: i % 2 === 0 ? -.12 : .12,
                                    bounces: 0,
                                    settled: false,
                                    poolRadius: 0
                                });
                                if (typeof createExplosion === "function") {
                                    createExplosion(fx, fy, "#900", 25, 12);
                                }
                                for (let b = 0; b < 30; b++) {
                                    blood.push({
                                        x: fx,
                                        y: fy,
                                        vx: (Math.random() - .5) * 14,
                                        vy: (Math.random() - .5) * 14 - 3,
                                        life: 70 + Math.random() * 30,
                                        color: "#b91c1c"
                                    });
                                }
                            });
                            game.cageFriends = [];
                        }
                        setTimeout(() => {
                            const bo = typeof window.getBlackoutDiv === "function" ? window.getBlackoutDiv() : document.getElementById("blackout");
                            if (typeof gsap !== "undefined" && bo) {
                                gsap.to(bo, {
                                    opacity: 1,
                                    duration: 1.8,
                                    onComplete: () => {
                                        if (typeof window.loadHubLevel === "function") window.loadHubLevel();
                                    }
                                });
                            } else {
                                if (bo) bo.style.opacity = 1;
                                setTimeout(() => {
                                    if (typeof window.loadHubLevel === "function") window.loadHubLevel();
                                }, 1800);
                            }
                        }, 2200);
                    }, 3200, true);
                }, 1400);
            } else {
                window.showAnimatedMessage( __("msg_sisi_gracias"));
                setTimeout(() => {
                    window.unlockAndShowMap(currentLevel === 1 ? 3 : currentLevel + 1);
                }, 1500);
            }
        }
    }
    ctx.restore();
}

function updateAndDrawPinkSquare(ctx, cameraX, time) {
    if (currentLevel !== 1 || !game.pinkSquare) return;
    const ps = game.pinkSquare;
    if (ps.state === "gone" || ps.state === "dead") return;
    const px = ps.x - cameraX;
    if (ps.state === "hostile") {
        ps.shootTimer = (ps.shootTimer || 0) + 1;
        if (game.player && !game.player.frozen && gameState === "playing") {
            const dist = Math.abs(game.player.x + game.player.w / 2 - (ps.x + 15));
            if (dist < 520) {
                if (ps.shootTimer >= 55 && enemyProjectiles.length < 16) {
                    ps.shootTimer = 0;
                    const angle = Math.atan2(game.player.y + game.player.h / 2 - (ps.y + 20), game.player.x + game.player.w / 2 - (ps.x + 15));
                    enemyProjectiles.push({
                        x: ps.x + 15,
                        y: ps.y + 20,
                        w: 26,
                        h: 26,
                        vx: Math.cos(angle) * 6,
                        vy: Math.sin(angle) * 6,
                        color: "#ff66aa",
                        damage: 25,
                        isGiant: true,
                        radius: 16,
                        trail: []
                    });
                    playSound(300, .18, "triangle", .2, 200);
                    applyShake(4);
                }
            }
        }
        ctx.fillStyle = "#ff69b4";
        ctx.fillRect(px, ps.y, 30, 40);
        ctx.fillStyle = "#ff1493";
        ctx.beginPath();
        ctx.arc(px + 22, ps.y + 4, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ff4d88";
        ctx.fillRect(px + 26, ps.y - 6, 8, 6);
        ctx.fillRect(px + 22, ps.y - 8, 14, 4);
        ctx.fillStyle = "#ff2222";
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur = 8;
        ctx.fillRect(px + 5, ps.y + 12, 8, 8);
        ctx.fillRect(px + 17, ps.y + 12, 8, 8);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#000";
        ctx.fillRect(px + 7, ps.y + 14, 3, 3);
        ctx.fillRect(px + 19, ps.y + 14, 3, 3);
        ctx.fillStyle = "#5a0022";
        ctx.beginPath();
        ctx.moveTo(px + 4, ps.y + 31);
        ctx.quadraticCurveTo(px + 15, ps.y + 43, px + 26, ps.y + 31);
        ctx.quadraticCurveTo(px + 15, ps.y + 26, px + 4, ps.y + 31);
        ctx.fill();
        const eggX2 = px - 28, eggY2 = ps.y + 8;
        ctx.fillStyle = "#ddd";
        ctx.beginPath();
        ctx.ellipse(eggX2 + 14, eggY2 + 16, 14, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        const lightOn2 = Math.floor(time * .12) % 2 === 0;
        ctx.fillStyle = lightOn2 ? "#ffdd00" : "#ff4444";
        ctx.beginPath();
        ctx.arc(eggX2 + 6, eggY2 + 10, 4, 0, Math.PI * 2);
        ctx.arc(eggX2 + 22, eggY2 + 10, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#777";
        ctx.fillRect(eggX2 + 11, eggY2 + 2, 6, 8);
        ctx.font = "18px Arial";
        ctx.fillText("🚀", eggX2 + 3, eggY2 + 40);
        const hpPct = Math.max(0, game.pinkSquare.health / game.pinkSquare.maxHealth);
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(px - 5, ps.y - 18, 40, 7);
        ctx.fillStyle = hpPct > .5 ? "#ff1493" : hpPct > .25 ? "#ff8800" : "#ff2222";
        ctx.fillRect(px - 4, ps.y - 17, 38 * hpPct, 5);
        return;
    }
    ctx.fillStyle = "#ff69b4";
    ctx.fillRect(px, ps.y, 30, 40);
    ctx.fillStyle = "#ff1493";
    ctx.beginPath();
    ctx.arc(px + 22, ps.y + 4, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff4d88";
    ctx.fillRect(px + 26, ps.y - 6, 8, 6);
    ctx.fillRect(px + 22, ps.y - 8, 14, 4);
    ctx.fillStyle = "#fff";
    ctx.fillRect(px + 5, ps.y + 12, 8, 8);
    ctx.fillRect(px + 17, ps.y + 12, 8, 8);
    ctx.fillStyle = "#000";
    ctx.fillRect(px + 7, ps.y + 14, 4, 4);
    ctx.fillRect(px + 19, ps.y + 14, 4, 4);
    ctx.fillStyle = "#c33";
    ctx.fillRect(px + 8, ps.y + 28, 14, 3);
    const eggX = px - 28, eggY = ps.y + 8;
    ctx.fillStyle = "#ddd";
    ctx.beginPath();
    ctx.ellipse(eggX + 14, eggY + 16, 14, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    const lightOn = Math.floor(time * .12) % 2 === 0;
    ctx.fillStyle = lightOn ? "#ffdd00" : "#ff4444";
    ctx.beginPath();
    ctx.arc(eggX + 6, eggY + 10, 4, 0, Math.PI * 2);
    ctx.arc(eggX + 22, eggY + 10, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#777";
    ctx.fillRect(eggX + 11, eggY + 2, 6, 8);
    ctx.font = "18px Arial";
    ctx.fillText("🚀", eggX + 3, eggY + 40);
}
// Isaac Daniel Cotera - 2026 | Correo: isaacdanielcotera@gmail.com | Itch.io: https://cotera.itch.io | GitHub: https://github.com/cotera2024
