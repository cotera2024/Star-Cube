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

function drawRescuePortal(ctx, px, py, scale, time) {
    if (scale <= 0.01) return;
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(scale, scale);

    const tiltX = -0.22;
    ctx.rotate(tiltX);

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const auraPulse = 1 + Math.sin(time * 3.5) * 0.12;
    const outerAura = ctx.createRadialGradient(0, 0, 8, 0, 0, 95 * auraPulse);
    outerAura.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    outerAura.addColorStop(0.2, "rgba(56, 189, 248, 0.8)");
    outerAura.addColorStop(0.5, "rgba(168, 85, 247, 0.45)");
    outerAura.addColorStop(0.85, "rgba(244, 63, 94, 0.18)");
    outerAura.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = outerAura;
    ctx.beginPath();
    ctx.ellipse(0, 0, 85 * auraPulse, 105 * auraPulse, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = "rgba(126, 34, 206, 0.65)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(0, 0, 48, 72, 0, Math.PI, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#030008";
    ctx.beginPath();
    ctx.ellipse(0, 0, 42, 64, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    const vortexRot = time * 2.2;
    ctx.rotate(vortexRot);
    ctx.globalCompositeOperation = "screen";

    for (let arm = 0; arm < 4; arm++) {
        const armAng = arm * (Math.PI / 2) - vortexRot * 2.2;
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.45 + Math.sin(time * 4 + arm) * 0.25})`;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let st = 0; st < 16; st++) {
            const r = st * 2.5;
            const tAng = armAng - st * 0.18;
            ctx.lineTo(Math.cos(tAng) * r, Math.sin(tAng) * r * 1.5);
        }
        ctx.stroke();
    }

    const vGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 34);
    vGrad.addColorStop(0, "#ffffff");
    vGrad.addColorStop(0.25, "#bae6fd");
    vGrad.addColorStop(0.65, "#a855f7");
    vGrad.addColorStop(0.9, "#3b0764");
    vGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = vGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 34, 52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    for (let s = 0; s < 10; s++) {
        const sAng = s * (Math.PI / 5) + time * 1.8;
        const ox = Math.cos(sAng) * 44;
        const oy = Math.sin(sAng) * 24;
        const oz = Math.sin(sAng);
        const sRad = Math.max(1, 2.2 + oz * 1.2);
        const sAlpha = Math.max(0.2, 0.5 + (oz + 1) * 0.25);
        ctx.fillStyle = `rgba(255, 255, 255, ${sAlpha})`;
        ctx.beginPath();
        ctx.arc(ox, oy, sRad, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 42, 64, 0, 0, Math.PI);
    ctx.stroke();

    ctx.strokeStyle = "#f0abfc";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 45, 68, 0, 0, Math.PI);
    ctx.stroke();

    if (Math.random() < 0.85) {
        ctx.save();
        ctx.strokeStyle = Math.random() < 0.5 ? "#67e8f9" : "#ffffff";
        ctx.lineWidth = 2;
        const lAng = Math.random() * Math.PI * 2;
        const lx1 = Math.cos(lAng) * 38;
        const ly1 = Math.sin(lAng) * 58;
        const lx2 = Math.cos(lAng + 0.4) * (44 + Math.random() * 12);
        const ly2 = Math.sin(lAng + 0.4) * (64 + Math.random() * 14);
        ctx.beginPath();
        ctx.moveTo(lx1, ly1);
        ctx.lineTo((lx1 + lx2) / 2 + (Math.random() - 0.5) * 10, (ly1 + ly2) / 2 + (Math.random() - 0.5) * 10);
        ctx.lineTo(lx2, ly2);
        ctx.stroke();
        ctx.restore();
    }

    const singPulse = 0.8 + Math.sin(time * 6) * 0.25;
    ctx.fillStyle = `rgba(255, 255, 255, ${singPulse})`;
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

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
    if ((currentLevel >= 4 && currentLevel !== 6) || !levels[currentLevel] || !levels[currentLevel].jaula) return;
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
            if (game.cageAlreadySaved) {
                game.cageState = 4;
                game.player.frozen = true;
                game.player.facing = 1;
                game.player.vx = 0;
                try {
                    playSound(260, .25, "sawtooth", .25, 90);
                    playSound(880, .2, "sine", .25, 1320);
                } catch (e) {}
                if (typeof particles !== "undefined" && Array.isArray(particles)) {
                    for (let k = 0; k < 20; k++) {
                        particles.push({
                            x: worldBtnX + btnW / 2 + (Math.random() - .5) * 35,
                            y: base - 10,
                            vx: (Math.random() - .5) * 6,
                            vy: -Math.random() * 5 - 1.5,
                            life: 22,
                            color: "#ef4444",
                            size: 3.5,
                            type: "spark"
                        });
                    }
                }
                const portalWorldX = Math.min(cj.x + cj.w + 70, Math.max(pl.x + 95, cj.x + 80));
                const portalWorldY = base - 56;
                game.portalSeq = {
                    timer: 0,
                    portalX: portalWorldX,
                    portalY: portalWorldY,
                    startPX: pl.x,
                    startPY: base - 32,
                    soloPeggy: true
                };
                try { playSound(240, 0.45, "sine", 0.35, 750); } catch(e){}
            } else {
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
            game.cageSpeechBubble = {
                text: typeof __ !== "undefined" ? __("dlg_friends_cage_si") : "¡Sí, gracias, Peggy! 🎉",
                timer: 0,
                maxTimer: 130
            };
        }
    }
    const liftY = cj.h * Math.min(1, game.cageOpenProgress || 0);
    ctx.save();
    const btnIsPressed = game.cageBtnPressed || game.cageState >= 1;
    const btnH = btnIsPressed ? 5 : 14;
    const btnY = base - btnH;

    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(btnScreenX + btnW - 4, base - 4);
    ctx.lineTo(cx - 2, base - 4);
    ctx.stroke();

    const conduitColor = btnIsPressed ? "#22c55e" : "#38bdf8";
    ctx.strokeStyle = conduitColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = conduitColor;
    ctx.shadowBlur = btnIsPressed ? 10 : 4;
    ctx.setLineDash([ 8, 8 ]);
    ctx.lineDashOffset = -time * (btnIsPressed ? 36 : 14);
    ctx.beginPath();
    ctx.moveTo(btnScreenX + btnW - 4, base - 4);
    ctx.lineTo(cx - 2, base - 4);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    [ btnScreenX + btnW - 4, cx - 2 ].forEach(jx => {
        ctx.fillStyle = "#b45309";
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(jx - 4, base - 9, 8, 10, 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#fef08a";
        ctx.fillRect(jx - 1.5, base - 7, 3, 2);
    });

    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(btnScreenX, base - 9, btnW, 9, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#94a3b8";
    [ 6, btnW - 6 ].forEach(bx => {
        ctx.beginPath();
        ctx.arc(btnScreenX + bx, base - 5, 2, 0, Math.PI * 2);
        ctx.fill();
    });

    const bGrad = ctx.createLinearGradient(btnScreenX, btnY, btnScreenX, base);
    if (btnIsPressed) {
        bGrad.addColorStop(0, "#4ade80");
        bGrad.addColorStop(0.5, "#22c55e");
        bGrad.addColorStop(1, "#15803d");
        ctx.shadowColor = "#22c55e";
        ctx.shadowBlur = 12;
    } else {
        bGrad.addColorStop(0, "#f87171");
        bGrad.addColorStop(0.5, "#ef4444");
        bGrad.addColorStop(1, "#991b1b");
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 12;
    }
    ctx.fillStyle = bGrad;
    ctx.beginPath();
    ctx.roundRect(btnScreenX + 5, btnY, btnW - 10, btnH, [ 5, 5, 1, 1 ]);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = btnIsPressed ? "#86efac" : "#fca5a5";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (!btnIsPressed) {
        const bounce = Math.sin(time * .18) * 4;
        ctx.fillStyle = "#fde047";
        ctx.font = 'bold 12px "Fredoka One", cursive, sans-serif';
        ctx.textAlign = "center";
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 8;
        const btnLbl = game.cageAlreadySaved
            ? (typeof __ === "function" ? __("ui_abrir_portal") : "🌀 ABRIR PORTAL 🌀")
            : (typeof __ === "function" ? __("ui_pisar_boton") : "▼ PULSA ▼");
        ctx.fillText(btnLbl, btnScreenX + btnW / 2, btnY - 14 + bounce);
        ctx.shadowBlur = 0;
    }

    const bgGrad = ctx.createLinearGradient(cx, cj.y, cx, base);
    bgGrad.addColorStop(0, "#090618");
    bgGrad.addColorStop(0.5, "#130f2c");
    bgGrad.addColorStop(1, "#05030c");
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.roundRect(cx, cj.y, cj.w, cj.h, 6);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1.5;
    for (let px = 25; px < cj.w; px += 35) {
        ctx.beginPath();
        ctx.moveTo(cx + px, cj.y + 4);
        ctx.lineTo(cx + px, base - 4);
        ctx.stroke();
    }

    const baseGrad = ctx.createLinearGradient(cx, base - 14, cx, base + 2);
    baseGrad.addColorStop(0, "#334155");
    baseGrad.addColorStop(0.4, "#1e293b");
    baseGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = baseGrad;
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(cx - 10, base - 14, cj.w + 20, 16, 5);
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cx + 8, base - 11, cj.w - 16, 5, 2);
    ctx.clip();
    ctx.fillStyle = "#facc15";
    ctx.fillRect(cx + 8, base - 11, cj.w - 16, 5);
    ctx.fillStyle = "#1e293b";
    for (let hx = cx + 8; hx < cx + cj.w - 8; hx += 10) {
        ctx.beginPath();
        ctx.moveTo(hx, base - 11);
        ctx.lineTo(hx + 6, base - 11);
        ctx.lineTo(hx + 1, base - 6);
        ctx.lineTo(hx - 5, base - 6);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();

    ctx.fillStyle = "#cbd5e1";
    [ cx - 4, cx + cj.w + 4 ].forEach(bx => {
        ctx.beginPath();
        ctx.arc(bx, base - 6, 2.5, 0, Math.PI * 2);
        ctx.fill();
    });

    const colW = 16;
    const colLeftX = cx - 10;
    const colRightX = cx + cj.w - 6;

    [ colLeftX, colRightX ].forEach((colX, colIdx) => {
        const pGrad = ctx.createLinearGradient(colX, cj.y - 12, colX + colW, cj.y - 12);
        pGrad.addColorStop(0, "#475569");
        pGrad.addColorStop(0.35, "#334155");
        pGrad.addColorStop(0.7, "#1e293b");
        pGrad.addColorStop(1, "#0f172a");
        ctx.fillStyle = pGrad;
        ctx.strokeStyle = "#64748b";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(colX, cj.y - 12, colW, cj.h + 8, 3);
        ctx.fill();
        ctx.stroke();

        const pistonScreenX = colX + colW / 2;
        const pistonH = Math.min(cj.h * 0.9, liftY);
        if (pistonH > 2) {
            const pistGrad = ctx.createLinearGradient(pistonScreenX - 3, 0, pistonScreenX + 3, 0);
            pistGrad.addColorStop(0, "#e2e8f0");
            pistGrad.addColorStop(0.4, "#ffffff");
            pistGrad.addColorStop(1, "#94a3b8");
            ctx.fillStyle = pistGrad;
            ctx.fillRect(pistonScreenX - 3.5, cj.y - 12 - pistonH, 7, pistonH);
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 1;
            ctx.strokeRect(pistonScreenX - 3.5, cj.y - 12 - pistonH, 7, pistonH);
        }

        ctx.fillStyle = "#fbbf24";
        for (let ri = 0; ri < 5; ri++) {
            const ry = cj.y + ri * (cj.h / 4);
            ctx.beginPath();
            ctx.arc(colX + colW / 2, ry, 2.2, 0, Math.PI * 2);
            ctx.fill();
        }

        if (colIdx === 0) {
            const dialY = cj.y + cj.h * 0.45;
            ctx.fillStyle = "#b45309";
            ctx.beginPath();
            ctx.arc(colX + colW / 2, dialY, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fef3c7";
            ctx.beginPath();
            ctx.arc(colX + colW / 2, dialY, 4.5, 0, Math.PI * 2);
            ctx.fill();
            const needleAngle = (btnIsPressed ? 0.8 : -0.6) + Math.sin(time * 0.4) * 0.15;
            ctx.strokeStyle = "#dc2626";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(colX + colW / 2, dialY);
            ctx.lineTo(colX + colW / 2 + Math.cos(needleAngle) * 4, dialY + Math.sin(needleAngle) * 4);
            ctx.stroke();
        } else {
            const ledY = cj.y + cj.h * 0.45;
            ctx.fillStyle = btnIsPressed ? "#22c55e" : (Math.floor(time * 3) % 2 === 0 ? "#f59e0b" : "#78350f");
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(colX + colW / 2, ledY, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    const topW = cj.w + 28;
    const topX = cx - 14;
    const topY = cj.y - 36;
    const topH = 26;

    const topGrad = ctx.createLinearGradient(topX, topY, topX, topY + topH);
    topGrad.addColorStop(0, "#475569");
    topGrad.addColorStop(0.3, "#334155");
    topGrad.addColorStop(0.7, "#1e293b");
    topGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = topGrad;
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(topX, topY, topW, topH, 5);
    ctx.fill();
    ctx.stroke();

    [ topX + 16, topX + topW - 16 ].forEach(vx => {
        ctx.fillStyle = "#64748b";
        ctx.fillRect(vx - 4, topY - 6, 8, 7);
        ctx.fillStyle = "#334155";
        ctx.fillRect(vx - 5, topY - 8, 10, 3);
        if (game.cageState === 1 && Math.random() < 0.35 && typeof particles !== "undefined") {
            particles.push({
                x: cj.x + (vx - topX) - 14, y: cj.y - 44,
                vx: (Math.random() - 0.5) * 2, vy: -Math.random() * 3 - 1,
                color: "#e2e8f0", life: 18, size: 3.5, type: "spark"
            });
        }
    });

    const gAngle = game.cageGearsAngle || 0;
    drawGear(ctx, cx + 18, cj.y - 23, 16, 8, gAngle, "#d97706", "#78350f");
    drawGear(ctx, cx + cj.w - 18, cj.y - 23, 16, 8, gAngle, "#d97706", "#78350f");
    drawGear(ctx, cx + cj.w / 2, cj.y - 23, 14, 7, -gAngle * 1.35, "#b45309", "#451a03");
    drawGear(ctx, cx + cj.w / 2 + 18, cj.y - 30, 8, 5, gAngle * 2.2, "#f59e0b", "#92400e");

    const gridTopY = cj.y - liftY;
    const gridBotY = base - liftY;

    [ cx + 18, cx + cj.w - 18 ].forEach(chX => {
        const chainStart = cj.y - 10;
        const chainEnd = gridTopY + 2;
        const chainLen = chainEnd - chainStart;
        if (chainLen > 2) {
            const links = Math.max(1, Math.floor(chainLen / 6));
            for (let li = 0; li < links; li++) {
                const ly = chainStart + li * 6;
                ctx.fillStyle = li % 2 === 0 ? "#cbd5e1" : "#94a3b8";
                ctx.strokeStyle = "#475569";
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.ellipse(chX, ly, 3, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
        }
    });

    ctx.fillStyle = "#ffffff";
    ctx.font = 'bold 12px "Fredoka One", cursive, monospace';
    ctx.textAlign = "center";
    ctx.shadowColor = "#000000";
    ctx.shadowBlur = 6;
    const cageTitle = game.cageAlreadySaved
        ? (typeof __ === "function" ? __("ui_portal_salida") : "PORTAL DE SALIDA")
        : (typeof __ === "function" ? __("ui_jaula_amigos") : "JAULA DE AMIGOS");
    ctx.fillText(cageTitle, cx + cj.w / 2, topY - 12);
    ctx.shadowBlur = 0;

    if (game.cageState < 2 && !game.cageAlreadySaved && Array.isArray(game.cageFriends) && game.cageFriends.length > 0) {
        const totalWidth = game.cageFriends.length * (AW + 12) - 12;
        const startX = cx + (cj.w - totalWidth) / 2;
        game.cageFriends.forEach((col, i) => {
            const ax = startX + i * (AW + 12);
            const ay = base - AH - 4;
            drawFriendEnhanced(ctx, ax, ay, AW, AH, col, 1, "crying", time, i);
        });
    }

    const gateHeaderGrad = ctx.createLinearGradient(cx, gridTopY, cx, gridTopY + 12);
    gateHeaderGrad.addColorStop(0, "#64748b");
    gateHeaderGrad.addColorStop(0.5, "#475569");
    gateHeaderGrad.addColorStop(1, "#1e293b");
    ctx.fillStyle = gateHeaderGrad;
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx + 2, gridTopY, cj.w - 4, 12, 3);
    ctx.fill();
    ctx.stroke();

    const numBars = 5;
    for (let bi = 1; bi <= numBars; bi++) {
        const barX = cx + cj.w * (bi / (numBars + 1));
        const barH = Math.max(0, gridBotY - gridTopY - 12);

        const barGrad = ctx.createLinearGradient(barX - 4, 0, barX + 4, 0);
        barGrad.addColorStop(0, "#475569");
        barGrad.addColorStop(0.3, "#cbd5e1");
        barGrad.addColorStop(0.7, "#64748b");
        barGrad.addColorStop(1, "#1e293b");
        ctx.fillStyle = barGrad;
        ctx.beginPath();
        ctx.roundRect(barX - 4, gridTopY + 10, 8, barH, 2.5);
        ctx.fill();

        const pulseCore = Math.sin(time * 0.2 + bi * 0.8) * 0.15 + 0.85;
        ctx.fillStyle = bi % 2 === 0 ? "#38bdf8" : "#34d399";
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8 * pulseCore;
        ctx.beginPath();
        ctx.roundRect(barX - 1.5, gridTopY + 12, 3, Math.max(0, barH - 4), 1.5);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(barX - 2.5, gridTopY + 12);
        ctx.lineTo(barX - 2.5, gridBotY - 2);
        ctx.stroke();
    }

    const crossY1 = gridTopY + (gridBotY - gridTopY) * 0.36;
    const crossY2 = gridTopY + (gridBotY - gridTopY) * 0.72;

    [ crossY1, crossY2 ].forEach(cy => {
        ctx.fillStyle = "#334155";
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cx + 4, cy - 3.5, cj.w - 8, 7, 2);
        ctx.fill();
        ctx.stroke();

        for (let bi = 1; bi <= numBars; bi++) {
            const barX = cx + cj.w * (bi / (numBars + 1));
            ctx.fillStyle = "#f59e0b";
            ctx.beginPath();
            ctx.roundRect(barX - 5.5, cy - 4.5, 11, 9, 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(barX - 1.5, cy - 1.5, 3, 3);
        }
    });

    if (game.cageOpenProgress < 1) {
        const lockX = cx + cj.w / 2;
        const lockY = gridTopY + (gridBotY - gridTopY) * 0.52;

        ctx.save();
        ctx.translate(lockX, lockY);
        ctx.rotate(time * 0.05);
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 8;
        ctx.setLineDash([ 6, 6 ]);
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        const lockGrad = ctx.createLinearGradient(lockX - 12, lockY - 12, lockX + 12, lockY + 12);
        lockGrad.addColorStop(0, "#fde047");
        lockGrad.addColorStop(0.5, "#f59e0b");
        lockGrad.addColorStop(1, "#b45309");
        ctx.fillStyle = lockGrad;
        ctx.strokeStyle = "#78350f";
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(lockX, lockY, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        const coreCol = btnIsPressed ? "#22c55e" : (Math.sin(time * 0.25) > 0 ? "#ef4444" : "#991b1b");
        ctx.fillStyle = coreCol;
        ctx.shadowColor = coreCol;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(lockX, lockY, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    ctx.restore();

    if (game.cageState >= 2 && game.cageState < 4) {
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

        if (game.cageSpeechBubble) {
            const sb = game.cageSpeechBubble;
            sb.timer++;
            let alpha = 1;
            let scale = 1;
            if (sb.timer < 14) {
                alpha = sb.timer / 14;
                scale = 0.7 + 0.3 * (sb.timer / 14);
            } else if (sb.timer > sb.maxTimer - 16) {
                alpha = Math.max(0, (sb.maxTimer - sb.timer) / 16);
                scale = 0.9 + 0.1 * alpha;
            }
            if (sb.timer >= sb.maxTimer) {
                game.cageSpeechBubble = null;
            } else {
                const targetWorldX = peggyX + (friendOffsets[0] || 45);
                const jumpCycle = Math.abs(Math.sin(time * .28));
                const jumpH = cTimer < 35 ? Math.sin((cTimer / 35) * Math.PI) * 75 : jumpCycle * 44;
                const curFX = (cTimer < 35 ? (cj.x + 20 + (targetWorldX - (cj.x + 20)) * (cTimer / 35)) : targetWorldX) - cameraX;
                const curFY = base - AH - jumpH;
                const bubbleX = curFX + AW / 2;
                const bubbleY = curFY;
                const friendColor = (game.cageFriends && game.cageFriends[0]) || "#0284c7";
                if (typeof window.drawFriendSpeechBubble === "function") {
                    window.drawFriendSpeechBubble(ctx, sb.text, bubbleX, bubbleY, friendColor, alpha, scale);
                }
            }
        }

        if (cTimer >= 140 && game.cageState === 2) {
            game.cageState = 3;
            if (game.player) game.player.frozen = false;
            if (window.postGameHorror) {
                gameState = "horrorCinematic";
                if (game.player) game.player.frozen = true;
                game.cageSpeechBubble = {
                    text: typeof __ !== "undefined" ? __("msg_wii_gracias") : "¡Wiii gracias!",
                    timer: 0,
                    maxTimer: 120
                };
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
                                slashes.push({ x: fx, y: fy, t: 0, facing: i % 2 === 0 ? 1 : -1 });
                                restos.push({
                                    x: fx, y: fy - hh / 2, w: AW, h: hh, color: col, part: "top", groundY: baseFloor,
                                    vx: (i % 2 === 0 ? 3.5 : -3.5) + (Math.random() - .5) * 2, vy: -(5.5 + Math.random() * 2),
                                    rot: 0, vRot: (i % 2 === 0 ? .2 : -.2) + (Math.random() - .5) * .1, bounces: 0, settled: false, poolRadius: 0
                                });
                                restos.push({
                                    x: fx, y: fy + hh / 2, w: AW, h: hh, color: col, part: "bottom", groundY: baseFloor,
                                    vx: (i % 2 === 0 ? -1.5 : 1.5) + (Math.random() - .5) * 1.5, vy: -(3 + Math.random() * 1.5),
                                    rot: 0, vRot: i % 2 === 0 ? -.12 : .12, bounces: 0, settled: false, poolRadius: 0
                                });
                                if (typeof createExplosion === "function") createExplosion(fx, fy, "#900", 25, 12);
                                for (let b = 0; b < 30; b++) {
                                    blood.push({
                                        x: fx, y: fy, vx: (Math.random() - .5) * 14, vy: (Math.random() - .5) * 14 - 3,
                                        life: 70 + Math.random() * 30, color: "#b91c1c"
                                    });
                                }
                            });
                            game.cageFriends = [];
                        }
                        setTimeout(() => {
                            const bo = typeof window.getBlackoutDiv === "function" ? window.getBlackoutDiv() : document.getElementById("blackout");
                            if (typeof gsap !== "undefined" && bo) {
                                gsap.to(bo, {
                                    opacity: 1, duration: 1.8,
                                    onComplete: () => { if (typeof window.loadHubLevel === "function") window.loadHubLevel(); }
                                });
                            } else {
                                if (bo) bo.style.opacity = 1;
                                setTimeout(() => { if (typeof window.loadHubLevel === "function") window.loadHubLevel(); }, 1800);
                            }
                        }, 2200);
                    }, 3200, true);
                }, 1400);
            } else {
                game.cageSpeechBubble = {
                    text: typeof __ !== "undefined" ? __("msg_sisi_gracias") : "¡Sisi wii, gracias!",
                    timer: 0,
                    maxTimer: 110
                };
            }
        }

        if (cTimer >= 250 && game.cageState === 3 && !window.postGameHorror) {
            game.cageState = 4;
            const friendWorldX = peggyX + (friendOffsets[0] || 45);
            const portalWorldX = Math.min(cj.x + cj.w + 70, Math.max(peggyX + 95, cj.x + 80));
            const portalWorldY = base - 56;
            game.portalSeq = {
                timer: 0,
                portalX: portalWorldX,
                portalY: portalWorldY,
                startPX: peggyX,
                startPY: base - 32,
                startFX: friendWorldX,
                startFY: base - AH
            };
            if (game.player) {
                game.player.frozen = true;
                game.player.vx = 0;
                game.player.facing = 1;
            }
            try { playSound(240, 0.45, "sine", 0.35, 750); } catch(e){}
        }
    }

    if (game.cageState === 4 && game.portalSeq) {
        const pSeq = game.portalSeq;
        pSeq.timer++;

        let portalScale = 0;
        if (pSeq.timer < 28) {
            portalScale = Math.sin((pSeq.timer / 28) * Math.PI * 0.5) * 1.15;
        } else if (pSeq.timer < 36) {
            portalScale = 1.15 - (pSeq.timer - 28) * 0.018;
        } else if (pSeq.timer < 88) {
            portalScale = 1.0 + Math.sin(time * 0.2) * 0.08;
        } else {
            portalScale = Math.max(0, 1 - (pSeq.timer - 88) / 18);
        }

        if (portalScale > 0.02) {
            drawRescuePortal(ctx, pSeq.portalX - cameraX, pSeq.portalY, portalScale, time);
            
            if (portalScale > 0.35 && pSeq.timer < 88 && typeof particles !== "undefined") {
                const sAng = Math.random() * Math.PI * 2;
                const sDist = 48 + Math.random() * 40;
                particles.push({
                    x: pSeq.portalX + Math.cos(sAng) * sDist,
                    y: pSeq.portalY + Math.sin(sAng) * sDist,
                    vx: -Math.cos(sAng) * (2.4 + Math.random() * 1.8),
                    vy: -Math.sin(sAng) * (2.4 + Math.random() * 1.8),
                    color: Math.random() < 0.45 ? "#38bdf8" : (Math.random() < 0.8 ? "#c084fc" : "#ffffff"),
                    size: 2 + Math.random() * 2,
                    life: 18,
                    type: "spark"
                });
            }
        }

        const friendColor = (game.cageFriends && game.cageFriends[0]) || "#0284c7";
        const hasFriend = !pSeq.soloPeggy && Array.isArray(game.cageFriends) && game.cageFriends.length > 0 && pSeq.startFX !== null && pSeq.startFX !== undefined;
        const hasLithium = !window.postGameHorror && (typeof currentLevel !== "undefined" && currentLevel === 2) && 
                           ((typeof isLithiumActive === "function" && isLithiumActive()) || 
                            (window.lithium && window.lithium.rescued));
        if (pSeq.startLX === undefined) {
            pSeq.startLX = pSeq.startPX - 26;
            pSeq.startLY = pSeq.startPY - 22;
        }

        if (pSeq.timer < 35) {
            if (game.player) {
                game.player.facing = 1;
                game.player.scaleX = 1 + Math.sin(time * 0.2) * 0.05;
                game.player.scaleY = 1 - Math.sin(time * 0.2) * 0.05;
            }
            if (hasFriend) {
                drawFriendEnhanced(ctx, pSeq.startFX - cameraX, pSeq.startFY, AW, AH, friendColor, 1, "happy", time, 0);
            }
            if (hasLithium && typeof drawLithiumSprite === "function") {
                const litHover = Math.sin(time * 0.3) * 4;
                drawLithiumSprite(ctx, pSeq.startLX - cameraX, pSeq.startLY + litHover, 26, 26, 1, 1, 1, "happy", 0, time);
            }

            if (pSeq.timer === 32) {
                try { playSound(520, 0.2, "triangle", 0.25, 960); } catch(e){}
            }
        } else if (pSeq.timer < 75) {
            const leapT = (pSeq.timer - 35) / 40;
            const arcH = Math.sin(leapT * Math.PI) * 88;

            const curPX = pSeq.startPX + (pSeq.portalX - pSeq.startPX) * leapT;
            const curPY = pSeq.startPY + (pSeq.portalY - pSeq.startPY) * leapT - arcH;

            let charScale = 1.0;
            let charRot = 0;
            if (leapT > 0.6) {
                const spiralT = (leapT - 0.6) / 0.4;
                charScale = Math.max(0.08, 1 - spiralT * 0.9);
                charRot = spiralT * 2.2;
            }

            if (game.player) {
                game.player.x = curPX;
                game.player.y = curPY;
                game.player.facing = 1;
                game.player.scaleX = charScale;
                game.player.scaleY = charScale;
                game.player.rotation = charRot;
            }

            if (hasFriend && charScale > 0.05) {
                const curFX = pSeq.startFX + (pSeq.portalX - pSeq.startFX) * leapT;
                const curFY = pSeq.startFY + (pSeq.portalY - pSeq.startFY) * leapT - arcH;
                ctx.save();
                const fScreenX = curFX - cameraX + AW / 2;
                const fScreenY = curFY + AH / 2;
                ctx.translate(fScreenX, fScreenY);
                ctx.scale(charScale, charScale);
                ctx.rotate(charRot);
                ctx.translate(-fScreenX, -fScreenY);
                drawFriendEnhanced(ctx, curFX - cameraX, curFY, AW, AH, friendColor, 1, "happy", time, 0);
                ctx.restore();
            }

            if (hasLithium && charScale > 0.05 && typeof drawLithiumSprite === "function") {
                const curLX = pSeq.startLX + (pSeq.portalX - pSeq.startLX) * leapT;
                const curLY = pSeq.startLY + (pSeq.portalY - pSeq.startLY) * leapT - (arcH * 1.1);
                ctx.save();
                const lScreenX = curLX - cameraX + 13;
                const lScreenY = curLY + 13;
                ctx.translate(lScreenX, lScreenY);
                ctx.scale(charScale, charScale);
                ctx.rotate(charRot * 1.2);
                ctx.translate(-lScreenX, -lScreenY);
                drawLithiumSprite(ctx, curLX - cameraX, curLY, 26, 26, 1, 1, 1, "happy", 0, time);
                ctx.restore();

                if (pSeq.timer % 2 === 0 && typeof particles !== "undefined") {
                    particles.push({
                        x: curLX + 13, y: curLY + 13,
                        vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 3,
                        color: [ "#ffd700", "#fde047", "#ffffff" ][Math.floor(Math.random() * 3)],
                        life: 25, size: 3.5, type: "spark"
                    });
                }
            }

            if (pSeq.timer % 2 === 0 && typeof particles !== "undefined") {
                particles.push({
                    x: curPX + 16, y: curPY + 16,
                    vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 3,
                    color: [ "#fbbf24", "#38bdf8", "#f43f5e" ][Math.floor(Math.random() * 3)],
                    life: 25, size: 3.5, type: "spark"
                });
            }

            if (pSeq.timer === 73) {
                try {
                    playSound(980, 0.35, "sine", 0.3, 280);
                    if (typeof createExplosion === "function") {
                        createExplosion(pSeq.portalX, pSeq.portalY, "#38bdf8", 30, 20);
                        createExplosion(pSeq.portalX, pSeq.portalY, "#fbbf24", 25, 15);
                        if (hasLithium) {
                            createExplosion(pSeq.portalX, pSeq.portalY, "#ffd700", 35, 20);
                        }
                    }
                    if (hasLithium && typeof window.markLithiumRescued === "function") {
                        window.markLithiumRescued();
                    }
                } catch(e){}
            }
        } else {
            if (game.player) game.player.hidden = true;
        }

        if (pSeq.timer >= 106 && !pSeq.completed) {
            pSeq.completed = true;
            if (typeof window.markLevelFriendRescued === "function") {
                window.markLevelFriendRescued(currentLevel);
            }
            if (hasLithium && typeof window.markLithiumRescued === "function") {
                window.markLithiumRescued();
            }
            if (game.player) {
                game.player.hidden = false;
                game.player.rotation = 0;
                game.player.scaleX = 1;
                game.player.scaleY = 1;
            }
            window.unlockAndShowMap(currentLevel === 1 ? 3 : currentLevel + 1);
        }
    }
}

function updateAndDrawSingleTank(ctx, cameraX, time, ps) {
    if (!ps || ps.state === "gone") return;
    
    if (typeof ps.w !== "number" || ps.w < 60) ps.w = 70;
    if (typeof ps.h !== "number" || ps.h < 40) ps.h = 46;
    if (typeof ps.minX !== "number") ps.minX = 13580;
    if (typeof ps.maxX !== "number") ps.maxX = 14120;
    if (typeof ps.vx !== "number") ps.vx = 1.35;
    if (typeof ps.wheelAngle !== "number") ps.wheelAngle = 0;
    if (typeof ps.cannonAngle !== "number") ps.cannonAngle = Math.PI;
    if (typeof ps.recoil !== "number") ps.recoil = 0;
    if (typeof ps.maxHealth !== "number") ps.maxHealth = 90;
    if (typeof ps.health !== "number") ps.health = 90;

    const px = ps.x - cameraX;

    if (ps.state === "dead") {
        if (typeof ps.deadTimer === "undefined") {
            ps.deadTimer = 60;
            ps.deadMaxTimer = 60;
        }
        ps.deadTimer--;
        if (ps.deadTimer <= 0) {
            ps.state = "gone";
            if (typeof game !== "undefined" && Array.isArray(game.techTanks)) {
                const idx = game.techTanks.indexOf(ps);
                if (idx !== -1) game.techTanks.splice(idx, 1);
            }
            if (typeof createExplosion === "function") {
                createExplosion(ps.x + ps.w / 2, ps.y + ps.h / 2, "#00ffcc", 18, 10, ["#00ffcc", "#ff007f", "#ffffff"]);
            }
            return;
        }

        if (px + ps.w < -100 || px > VIEW_W + 100) return;
        ctx.save();
        const fadeAlpha = Math.max(0, ps.deadTimer / ps.deadMaxTimer);
        ctx.globalAlpha = fadeAlpha;
        ctx.fillStyle = "#1e1b2e";
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(px, ps.y + 16, ps.w, ps.h - 16, [ 4, 4, 2, 2 ]) : ctx.rect(px, ps.y + 16, ps.w, ps.h - 16);
        ctx.fill();
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(px + 16, ps.y + ps.h - 8, 10, 0, Math.PI * 2);
        ctx.arc(px + ps.w - 16, ps.y + ps.h - 8, 10, 0, Math.PI * 2);
        ctx.fill();
        
        if (Math.random() < .35 && typeof particles !== "undefined") {
            particles.push({
                x: ps.x + 15 + Math.random() * (ps.w - 30),
                y: ps.y + 18,
                vx: (Math.random() - .5) * 1.5,
                vy: -Math.random() * 2 - .5,
                life: 25,
                color: Math.random() < .5 ? "#64748b" : (Math.random() < .5 ? "#00f0ff" : "#ff007f"),
                size: 2 + Math.random() * 3,
                type: "smoke"
            });
        }
        ctx.restore();
        return;
    }

    if (ps.state === "destroying") {
        ps.destroyTimer = (ps.destroyTimer || 110) - 1;
        
        if (ps.turretVy === undefined) {
            ps.turretX = ps.x + ps.w / 2;
            ps.turretY = ps.y + 10;
            ps.turretVx = (Math.random() - .5) * 4;
            ps.turretVy = -7.5;
            ps.turretAngle = ps.cannonAngle || 0;
            ps.turretRotSpeed = (Math.random() - .5) * .25;
        } else {
            ps.turretX += ps.turretVx;
            ps.turretY += ps.turretVy;
            ps.turretVy += .32;
            ps.turretAngle += ps.turretRotSpeed;
            if (ps.turretY > ps.y + ps.h) {
                ps.turretY = ps.y + ps.h;
                ps.turretVy = -ps.turretVy * .4;
                ps.turretVx *= .7;
            }
        }

        if (ps.destroyTimer % 7 === 0) {
            const expX = ps.x + Math.random() * ps.w;
            const expY = ps.y + Math.random() * ps.h;
            if (typeof createExplosion === "function") {
                createExplosion(expX, expY, Math.random() < .6 ? "#ff1493" : "#00e5ff", 18, 10);
            }
            if (typeof applyShake === "function") applyShake(4);
            try {
                playSound(130 + Math.random() * 80, .15, "sawtooth", .3, 40);
            } catch (e) {}
        }

        if (typeof particles !== "undefined") {
            particles.push({
                x: ps.x + Math.random() * ps.w,
                y: ps.y + Math.random() * ps.h,
                vx: (Math.random() - .5) * 2,
                vy: -Math.random() * 2 - 1,
                life: 20,
                color: Math.random() < .4 ? "#ff1493" : "#475569",
                size: 4 + Math.random() * 4,
                type: "smoke"
            });
            particles.push({
                x: ps.turretX,
                y: ps.turretY,
                vx: (Math.random() - .5) * 2,
                vy: -Math.random() * 2,
                life: 18,
                color: "#ff0055",
                size: 3,
                type: "spark"
            });
        }

        const shkX = (Math.random() - .5) * 7;
        const shkY = (Math.random() - .5) * 5;

        ctx.save();
        const dpx = px + shkX;
        const dpy = ps.y + shkY;
        
        ctx.fillStyle = "#1e1b4b";
        ctx.beginPath();
        ctx.roundRect(dpx, dpy + 14, ps.w, ps.h - 14, [ 6, 6, 2, 2 ]);
        ctx.fill();
        ctx.strokeStyle = "#ff007f";
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(dpx + 16, dpy + ps.h - 12, 12, 0, Math.PI * 2);
        ctx.arc(dpx + ps.w - 16, dpy + ps.h - 12, 12, 0, Math.PI * 2);
        ctx.fill();

        const tpx = ps.turretX - cameraX;
        ctx.save();
        ctx.translate(tpx, ps.turretY);
        ctx.rotate(ps.turretAngle);
        ctx.fillStyle = "#ff1493";
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(0, -6, 26, 12);
        ctx.restore();

        ctx.restore();

        if (ps.destroyTimer <= 0) {
            ps.state = "dead";
            if (typeof createExplosion === "function") {
                createExplosion(ps.x + ps.w / 2, ps.y + ps.h / 2, "#ff1493", 45, 25);
                createExplosion(ps.x + ps.w / 2, ps.y + ps.h / 2, "#00e5ff", 35, 18);
                createExplosion(ps.x + ps.w / 2, ps.y + ps.h / 2, "#ffffff", 25, 12);
            }
            if (typeof applyShake === "function") applyShake(18);
            if (typeof game !== "undefined") game.flash = 12;
            try {
                playSound(60, .8, "sawtooth", .6, 20);
                setTimeout(() => playSound(40, .6, "square", .5, 20), 80);
            } catch (e) {}
            if (typeof addFloatingText === "function") {
                addFloatingText(ps.x + ps.w / 2, ps.y - 35, typeof __ === "function" ? __("flt_tanque_destruido") : "¡TANQUE DESTRUIDO!", "#ff1493", 26);
            }
            if (typeof score !== "undefined") {
                score += 1500;
                if (typeof updateScore === "function") updateScore(score);
            }
        }
        return;
    }

    if (ps.state === "hostile") {
        ps.x += ps.vx;
        if (ps.x >= ps.maxX) {
            ps.vx = -Math.abs(ps.vx);
            ps.dir = -1;
        } else if (ps.x <= ps.minX) {
            ps.vx = Math.abs(ps.vx);
            ps.dir = 1;
        }
        ps.wheelAngle += ps.vx * .08;

        const scale = ps.scale || (ps.w >= 100 ? 2 : 1);
        const maxShootTimer = ps.shootCooldown || (scale >= 2 ? 140 : 75);

        const turretCenterX = ps.x + ps.w / 2;
        const turretCenterY = ps.y + 12 * scale;

        let dist = 9999;
        if (game.player && !game.player.frozen && gameState === "playing") {
            const pl = game.player;
            const targetX = pl.x + pl.w / 2;
            const targetY = pl.y + pl.h / 2;
            const targetAngle = Math.atan2(targetY - turretCenterY, targetX - turretCenterX);
            
            let diff = targetAngle - ps.cannonAngle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            ps.cannonAngle += diff * .08;

            dist = Math.hypot(targetX - turretCenterX, targetY - turretCenterY);

            if (pl.x + pl.w > ps.x && pl.x < ps.x + ps.w && pl.y + pl.h > ps.y && pl.y < ps.y + ps.h) {
                if (!pl.invulnerable && typeof pl.takeDamage === "function") {
                    pl.takeDamage(scale >= 2 ? 30 : 22);
                    pl.vx = ps.vx > 0 ? (6 * scale) : (-6 * scale);
                    pl.vy = -5;
                    if (typeof applyShake === "function") applyShake(scale >= 2 ? 10 : 6);
                }
            }
        }

        ps.recoil = (ps.recoil || 0) * .82;

        ps.shootTimer = (ps.shootTimer || 0) + 1;
        if (dist < 750 && gameState === "playing" && game.player && !game.player.frozen) {
            if (ps.shootTimer >= maxShootTimer && typeof enemyProjectiles !== "undefined" && enemyProjectiles.length < 16) {
                ps.shootTimer = 0;
                ps.recoil = 14 * scale;
                const barrelLen = 38 * scale;
                const muzzleX = turretCenterX + Math.cos(ps.cannonAngle) * barrelLen;
                const muzzleY = turretCenterY + Math.sin(ps.cannonAngle) * barrelLen;
                const shellRadius = 18 * (scale >= 2 ? 1.4 : 1);
                
                enemyProjectiles.push({
                    x: muzzleX,
                    y: muzzleY,
                    w: shellRadius * 2,
                    h: shellRadius * 2,
                    vx: Math.cos(ps.cannonAngle) * (scale >= 2 ? 5.2 : 6.5),
                    vy: Math.sin(ps.cannonAngle) * (scale >= 2 ? 5.2 : 6.5),
                    color: "#ff007f",
                    damage: scale >= 2 ? 34 : 30,
                    isGiant: true,
                    isTankShell: true,
                    radius: shellRadius,
                    trail: []
                });
                
                try {
                    playSound(160, .4, "sawtooth", .45, 50);
                    playSound(80, .5, "square", .35, 30);
                } catch (e) {}
                if (typeof applyShake === "function") applyShake(scale >= 2 ? 9 : 6);

                if (typeof particles !== "undefined") {
                    for (let m = 0; m < (scale >= 2 ? 18 : 12); m++) {
                        const sAngle = ps.cannonAngle + (Math.random() - .5) * .8;
                        const sSpd = 4 + Math.random() * 5;
                        particles.push({
                            x: muzzleX,
                            y: muzzleY,
                            vx: Math.cos(sAngle) * sSpd,
                            vy: Math.sin(sAngle) * sSpd,
                            life: 16,
                            color: Math.random() < .5 ? "#ff1493" : "#00ffff",
                            size: 3.5,
                            type: "spark"
                        });
                    }
                }
            }
        }

        ctx.save();

        if (dist < 750 && ps.shootTimer > (maxShootTimer - 40) && game.player) {
            const barrelLen = 38 * scale;
            const muzzleX = (turretCenterX - cameraX) + Math.cos(ps.cannonAngle) * barrelLen;
            const muzzleY = turretCenterY + Math.sin(ps.cannonAngle) * barrelLen;
            const laserLen = 500 * (scale >= 2 ? 1.3 : 1);
            const laserEndX = muzzleX + Math.cos(ps.cannonAngle) * laserLen;
            const laserEndY = muzzleY + Math.sin(ps.cannonAngle) * laserLen;
            
            const laserAlpha = Math.min(.85, (ps.shootTimer - (maxShootTimer - 40)) / 35);
            ctx.strokeStyle = `rgba(255, 0, 127, ${laserAlpha})`;
            ctx.lineWidth = ps.shootTimer > (maxShootTimer - 15) ? (3.5 * (scale >= 2 ? 1.4 : 1)) : 1.5;
            ctx.setLineDash([ 6, 4 ]);
            ctx.beginPath();
            ctx.moveTo(muzzleX, muzzleY);
            ctx.lineTo(laserEndX, laserEndY);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        const wheelR = 14 * scale;
        const leftWheelX = px + 18 * scale;
        const rightWheelX = px + ps.w - 18 * scale;
        const wheelY = ps.y + ps.h - wheelR;

        ctx.fillStyle = "#020617";
        ctx.beginPath();
        ctx.roundRect(px + 2, wheelY - wheelR - 1, ps.w - 4, wheelR * 2 + 2, [ wheelR, wheelR, wheelR, wheelR ]);
        ctx.fill();
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 2.5 * scale;
        ctx.stroke();

        ctx.fillStyle = "#475569";
        for (let tr = px + 8 * scale; tr < px + ps.w - 8 * scale; tr += 8 * scale) {
            const ridgeOffset = (ps.wheelAngle * 5) % (8 * scale);
            ctx.fillRect(tr + ridgeOffset, wheelY + wheelR - 3 * scale, 4 * scale, 3 * scale);
            ctx.fillRect(tr - ridgeOffset, wheelY - wheelR, 4 * scale, 3 * scale);
        }

        const wheels = [ leftWheelX, rightWheelX ];
        for (let w = 0; w < wheels.length; w++) {
            const wx = wheels[w];
            
            ctx.fillStyle = "#1e293b";
            ctx.beginPath();
            ctx.arc(wx, wheelY, wheelR - 2 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#00e5ff";
            ctx.lineWidth = 1.8 * scale;
            ctx.stroke();

            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.arc(wx, wheelY, wheelR - 6 * scale, 0, Math.PI * 2);
            ctx.fill();

            ctx.save();
            ctx.translate(wx, wheelY);
            ctx.rotate(ps.wheelAngle);
            ctx.fillStyle = "#e2e8f0";
            for (let sp = 0; sp < 4; sp++) {
                const sAng = sp * (Math.PI / 2);
                ctx.fillRect(Math.cos(sAng) * 4 * scale - 1.5 * scale, Math.sin(sAng) * 4 * scale - 1.5 * scale, 3 * scale, 3 * scale);
            }
            ctx.fillStyle = "#ff007f";
            ctx.beginPath();
            ctx.arc(0, 0, 2.5 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        const isHorror = !!window.postGameHorror;
        const bodyGrad = ctx.createLinearGradient(px, ps.y + 10 * scale, px, ps.y + ps.h - 10 * scale);
        if (isHorror) {
            bodyGrad.addColorStop(0, "#1f040b");
            bodyGrad.addColorStop(.5, "#0d0104");
            bodyGrad.addColorStop(1, "#030001");
        } else {
            bodyGrad.addColorStop(0, "#2e1065");
            bodyGrad.addColorStop(.5, "#1e1b4b");
            bodyGrad.addColorStop(1, "#0f172a");
        }
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.moveTo(px + 4 * scale, ps.y + ps.h - 12 * scale);
        ctx.lineTo(px + 10 * scale, ps.y + 12 * scale);
        ctx.lineTo(px + ps.w - 10 * scale, ps.y + 12 * scale);
        ctx.lineTo(px + ps.w - 4 * scale, ps.y + ps.h - 12 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = isHorror ? "#ff0033" : "#ff007f";
        ctx.lineWidth = (isHorror ? 2.8 : 2.2) * scale;
        ctx.stroke();

        if (isHorror) {
            ctx.strokeStyle = "#990000";
            ctx.lineWidth = 2 * scale;
            ctx.beginPath();
            ctx.moveTo(px + 14 * scale, ps.y + 20 * scale); ctx.lineTo(px + ps.w / 2, ps.y + 24 * scale); ctx.lineTo(px + ps.w - 14 * scale, ps.y + 18 * scale);
            ctx.stroke();
            ctx.fillStyle = "#ff1744";
            ctx.fillRect(px + ps.w / 2 - 4 * scale, ps.y + 22 * scale, 8 * scale, 3 * scale);
        } else {
            ctx.fillStyle = "rgba(0, 229, 255, 0.4)";
            ctx.fillRect(px + 16 * scale, ps.y + 18 * scale, ps.w - 32 * scale, 3 * scale);
            ctx.fillStyle = "#ff007f";
            ctx.fillRect(px + 22 * scale, ps.y + 24 * scale, ps.w - 44 * scale, 2 * scale);
        }

        const screenTurretX = px + ps.w / 2;
        const screenTurretY = ps.y + 12 * scale;

        ctx.save();
        ctx.translate(screenTurretX, screenTurretY);
        ctx.rotate(ps.cannonAngle);

        const barrelRecoil = -(ps.recoil || 0);
        const barrelLen = 38 * scale;
        const barrelH = 12 * scale;
        
        const bGrad = ctx.createLinearGradient(barrelRecoil, -barrelH / 2, barrelRecoil, barrelH / 2);
        if (isHorror) {
            bGrad.addColorStop(0, "#2b040a");
            bGrad.addColorStop(.5, "#140104");
            bGrad.addColorStop(1, "#050002");
        } else {
            bGrad.addColorStop(0, "#475569");
            bGrad.addColorStop(.5, "#1e293b");
            bGrad.addColorStop(1, "#0f172a");
        }
        ctx.fillStyle = bGrad;
        ctx.fillRect(barrelRecoil + 6 * scale, -barrelH / 2, barrelLen - 6 * scale, barrelH);
        ctx.strokeStyle = isHorror ? "#ff1744" : "#ff007f";
        ctx.lineWidth = 1.5 * scale;
        ctx.strokeRect(barrelRecoil + 6 * scale, -barrelH / 2, barrelLen - 6 * scale, barrelH);

        ctx.fillStyle = isHorror ? "#ff0033" : "#ff007f";
        ctx.fillRect(barrelRecoil + barrelLen - 6 * scale, -barrelH / 2 - 2 * scale, 8 * scale, barrelH + 4 * scale);
        ctx.strokeStyle = isHorror ? "#ff4444" : "#ffffff";
        ctx.lineWidth = 1.2 * scale;
        ctx.strokeRect(barrelRecoil + barrelLen - 6 * scale, -barrelH / 2 - 2 * scale, 8 * scale, barrelH + 4 * scale);

        ctx.fillStyle = isHorror ? "#ff0033" : "#00e5ff";
        ctx.fillRect(barrelRecoil + 14 * scale, -barrelH / 2 - 1 * scale, 3 * scale, barrelH + 2 * scale);
        ctx.fillRect(barrelRecoil + 23 * scale, -barrelH / 2 - 1 * scale, 3 * scale, barrelH + 2 * scale);

        ctx.restore();

        ctx.save();
        ctx.translate(screenTurretX, screenTurretY);
        const domeR = 15 * scale;
        const domeGrad = ctx.createRadialGradient(-3 * scale, -3 * scale, 2 * scale, 0, 0, 16 * scale);
        if (isHorror) {
            domeGrad.addColorStop(0, "#4a0410");
            domeGrad.addColorStop(.6, "#220207");
            domeGrad.addColorStop(1, "#0a0002");
        } else {
            domeGrad.addColorStop(0, "#ec4899");
            domeGrad.addColorStop(.6, "#be185d");
            domeGrad.addColorStop(1, "#831843");
        }
        ctx.fillStyle = domeGrad;
        ctx.beginPath();
        ctx.arc(0, 0, domeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isHorror ? "#ff0033" : "#ffffff";
        ctx.lineWidth = 1.8 * scale;
        ctx.stroke();

        const eyeColor = isHorror ? "#ff0000" : ps.shootTimer > 50 ? "#ff0000" : "#00ffff";
        ctx.fillStyle = eyeColor;
        ctx.shadowColor = eyeColor;
        ctx.shadowBlur = isHorror ? 12 : 6;
        ctx.beginPath();
        ctx.arc(Math.cos(ps.cannonAngle) * 7, Math.sin(ps.cannonAngle) * 7, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();

        const hpPct = Math.max(0, ps.health / ps.maxHealth);
        const barW = 64;
        const barH = 7;
        const barX = px + (ps.w - barW) / 2;
        const barY = ps.y - 18;

        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.beginPath();
        ctx.roundRect(barX - 2, barY - 2, barW + 4, barH + 4, [ 3 ]);
        ctx.fill();
        ctx.strokeStyle = "#ff007f";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        const hpGrad = ctx.createLinearGradient(barX, barY, barX + barW * hpPct, barY);
        if (hpPct > .5) {
            hpGrad.addColorStop(0, "#00ffcc");
            hpGrad.addColorStop(1, "#ff007f");
        } else if (hpPct > .25) {
            hpGrad.addColorStop(0, "#f59e0b");
            hpGrad.addColorStop(1, "#ef4444");
        } else {
            hpGrad.addColorStop(0, "#dc2626");
            hpGrad.addColorStop(1, "#7f1d1d");
        }
        ctx.fillStyle = hpGrad;
        ctx.fillRect(barX, barY, barW * hpPct, barH);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`TANK: ${Math.max(0, Math.ceil(ps.health))}/${ps.maxHealth}`, px + ps.w / 2, barY - 4);

        ctx.restore();
    }
}

function updateAndDrawPinkSquare(ctx, cameraX, time) {
    if (currentLevel !== 1) return;
    if (game.techTanks && game.techTanks.length > 0) {
        for (let i = game.techTanks.length - 1; i >= 0; i--) {
            if (!game.techTanks[i] || game.techTanks[i].state === "gone") {
                game.techTanks.splice(i, 1);
            }
        }
    }
    const tanks = (game.techTanks && game.techTanks.length > 0) ? game.techTanks : (game.pinkSquare ? [game.pinkSquare] : []);
    for (let i = 0; i < tanks.length; i++) {
        updateAndDrawSingleTank(ctx, cameraX, time, tanks[i]);
    }
}
