(function() {
    "use strict";
    const lithium = {
        active: false,
        rescued: false,
        x: 1080,
        y: 430,
        w: 26,
        h: 26,
        scaleX: 1,
        scaleY: 1,
        facing: 1,
        vx: 0,
        vy: 0,
        shockTimer: 0,
        attackTimer: 0,
        playMode: null,
        playTimer: 0,
        orbitAngle: 0,
        trail: [],
        cage: {
            x: 1060,
            y: 395,
            w: 80,
            h: 105,
            baseY: 500,
            state: 0,
            openProgress: 0,
            btnX: 980,
            btnY: 480,
            btnW: 52,
            btnH: 20,
            btnPressed: false,
            btnSinkOffset: 0,
            helpTimer: 0,
            helpIndex: 0,
            dialogueStep: 0,
            dialogueChar: 0,
            dialogueTimer: 0
        }
    };
    function initLithiumLevel(levelIndex) {
        lithium._farewellDone = false;
        if (levelIndex === 2) {
            const hasPassedLithium = !!(typeof currentCheckpoint !== "undefined" && currentCheckpoint && currentCheckpoint.level === 2 && currentCheckpoint.x > 1100);
            lithium.rescued = hasPassedLithium;
            if (!lithium.rescued) {
                lithium.active = false;
                lithium.cage.state = 0;
                lithium.cage.openProgress = 0;
                lithium.cage.btnPressed = false;
                lithium.cage.btnSinkOffset = 0;
                lithium.cage.dialogueStep = 0;
                lithium.cage.dialogueChar = 0;
                lithium.x = lithium.cage.x + 27;
                lithium.y = lithium.cage.baseY - 30;
            } else {
                lithium.active = true;
            }
        } else {
            lithium.active = false;
            lithium.rescued = false;
        }
    }
    function isLithiumActive() {
        return typeof currentLevel !== "undefined" && currentLevel === 2 && lithium.active && lithium.cage.state !== 2;
    }
    function onPlayerAttackLithium() {
        if (typeof currentLevel !== "undefined" && currentLevel !== 2) return;
        if (!lithium.active) return;
        lithium.attackTimer = 22;
        lithium.scaleX = 1.15;
        lithium.scaleY = .88;
    }
    function onPlayerHurtLithium() {
        if (typeof currentLevel !== "undefined" && currentLevel !== 2) return;
        if (!lithium.active) return;
        lithium.shockTimer = 45;
        lithium.scaleX = .85;
        lithium.scaleY = 1.25;
    }
    function updateAndDrawLithiumCage(ctx, cameraX, time) {
        if (currentLevel !== 2 || lithium.rescued) return;
        const c = lithium.cage;
        const screenCageX = c.x - cameraX;
        if (screenCageX < -150 || screenCageX > VIEW_W + 150) return;
        const pl = game.player;
        if (c.state === 0 && pl && !pl.frozen) {
            const onBtnX = pl.x + pl.w > c.btnX + 4 && pl.x < c.btnX + c.btnW - 4;
            const onBtnY = Math.abs(pl.y + pl.h - c.baseY) < 18 && pl.vy >= 0;
            if (onBtnX && onBtnY) {
                c.btnPressed = true;
                c.state = 1;
                c.openProgress = 0;
                pl.frozen = true;
                pl.vx = 0;
                pl.facing = 1;
                try {
                    playSound(160, .2, "sawtooth", .4, 60);
                    playSound(700, .15, "sine", .25, 1100);
                } catch (e) {}
                if (typeof screenShake !== "undefined") screenShake.intensity = 6;
                if (typeof createExplosion === "function") {
                    createExplosion(c.btnX + c.btnW / 2, c.btnY + 5, "#ff1744", 18, 12, [ "#ffffff", "#ff1744", "#f59e0b" ]);
                }
            }
        }
        if (c.btnPressed && c.btnSinkOffset < 10) {
            c.btnSinkOffset += (10 - c.btnSinkOffset) * .35;
        }
        if (c.state === 1) {
            c.openProgress += .022;
            if (c.openProgress >= 1) {
                c.openProgress = 1;
                c.state = 3;
                lithium.rescued = true;
                lithium.active = true;
                if (pl) pl.frozen = false;
                if (typeof addFloatingText === "function") {
                    addFloatingText(c.x + c.w / 2, c.y - 20, __("flt_lithium_rescue") || "💛 ¡LITIO SE UNIÓ!", "#ffd700", 22);
                }
                if (typeof createExplosion === "function") {
                    createExplosion(lithium.x + 13, lithium.y + 13, "#ffd700", 25, 16, [ "#ffffff", "#fff066", "#f59e0b" ]);
                }
                try {
                    playSound(660, .3, "sine", .5, 1320);
                } catch (e) {}
            }
        }
        drawMechanicalButton(ctx, c.btnX - cameraX, c.btnY, c.btnW, c.btnH, c.btnSinkOffset, c.btnPressed, time);
        const litX = c.state >= 2 ? c.x + 30 + Math.sin(time * .1) * 4 : c.x + 28;
        const litY = c.state >= 2 ? c.baseY - 42 - Math.abs(Math.sin(time * .15)) * 16 : c.baseY - 30 + Math.sin(time * .2) * 2;
        lithium.x = litX;
        lithium.y = litY;
        drawLithiumSprite(ctx, litX - cameraX, litY, 26, 26, 1, 1, 1, c.state < 2 ? "trapped" : "happy", 0, time);
        drawCyberCage(ctx, screenCageX, c.y, c.w, c.h, c.openProgress, time);
        if (c.state === 0) {
            c.helpTimer++;
            if (c.helpTimer % 180 < 110) {
                const helpKeys = [ "cage_lithium_help_1", "cage_lithium_help_2", "cage_lithium_help_3" ];
                const hKey = helpKeys[Math.floor(c.helpTimer / 180) % helpKeys.length];
                drawHelpBubble(ctx, __(hKey), screenCageX + c.w / 2, c.y - 25);
            }
        }
    }
    function drawMechanicalButton(ctx, bx, by, bw, bh, sinkOffset, pressed, t) {
        ctx.save();
        const baseH = bh;
        const baseGrad = ctx.createLinearGradient(bx, by, bx, by + baseH);
        baseGrad.addColorStop(0, "#334155");
        baseGrad.addColorStop(.5, "#1e293b");
        baseGrad.addColorStop(1, "#0f172a");
        ctx.fillStyle = baseGrad;
        ctx.beginPath();
        ctx.roundRect(bx, by + 4, bw, baseH, 5);
        ctx.fill();
        ctx.fillStyle = "#94a3b8";
        [ [ bx + 4, by + 7 ], [ bx + bw - 4, by + 7 ] ].forEach(([sx, sy]) => {
            ctx.beginPath();
            ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
            ctx.fill();
        });
        const ledColor = pressed ? "#22c55e" : "#ef4444";
        ctx.fillStyle = ledColor;
        ctx.shadowColor = ledColor;
        ctx.shadowBlur = pressed ? 12 : 8;
        ctx.beginPath();
        ctx.roundRect(bx + 6, by + 3, bw - 12, 3, 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        const plungerY = by - 6 + sinkOffset;
        const plungerH = 10;
        const btnGrad = ctx.createLinearGradient(bx + 6, plungerY, bx + 6, plungerY + plungerH);
        if (pressed) {
            btnGrad.addColorStop(0, "#22c55e");
            btnGrad.addColorStop(1, "#15803d");
        } else {
            btnGrad.addColorStop(0, "#ff4d6d");
            btnGrad.addColorStop(.6, "#ef4444");
            btnGrad.addColorStop(1, "#990022");
        }
        ctx.fillStyle = btnGrad;
        ctx.beginPath();
        ctx.roundRect(bx + 8, plungerY, bw - 16, plungerH, [ 5, 5, 2, 2 ]);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.beginPath();
        ctx.ellipse(bx + bw / 2, plungerY + 3, (bw - 20) / 2, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    function drawCyberCage(ctx, x, y, w, h, openProgress, t) {
        ctx.save();
        const liftY = openProgress * (h - 15);
        const roofY = y - liftY;
        const roofGrad = ctx.createLinearGradient(x, roofY, x, roofY + 14);
        roofGrad.addColorStop(0, "#475569");
        roofGrad.addColorStop(1, "#1e293b");
        ctx.fillStyle = roofGrad;
        ctx.beginPath();
        ctx.roundRect(x - 4, roofY, w + 8, 14, 4);
        ctx.fill();
        ctx.fillStyle = openProgress > 0 ? "#22c55e" : Math.sin(t * .15) > 0 ? "#ef4444" : "#7f1d1d";
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(x + w / 2, roofY + 6, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        const barSpacing = 13;
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = "#94a3b8";
        ctx.lineCap = "round";
        for (let bx = x + 8; bx <= x + w - 8; bx += barSpacing) {
            ctx.beginPath();
            ctx.moveTo(bx, roofY + 12);
            ctx.lineTo(bx, y + h - liftY);
            ctx.stroke();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(bx - .8, roofY + 14);
            ctx.lineTo(bx - .8, y + h - liftY);
            ctx.stroke();
            ctx.lineWidth = 3.5;
            ctx.strokeStyle = "#94a3b8";
        }
        const baseGrad = ctx.createLinearGradient(x, y + h - 8, x, y + h);
        baseGrad.addColorStop(0, "#334155");
        baseGrad.addColorStop(1, "#0f172a");
        ctx.fillStyle = baseGrad;
        ctx.beginPath();
        ctx.roundRect(x - 6, y + h - 8, w + 12, 10, 3);
        ctx.fill();
        ctx.restore();
    }
    function drawHelpBubble(ctx, text, cx, cy) {
        ctx.save();
        ctx.font = 'bold 13px "Fredoka One", cursive, sans-serif';
        const tw = ctx.measureText(text).width;
        const bw = tw + 20;
        const bh = 24;
        const bx = cx - bw / 2;
        const by = cy - bh / 2;
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 8);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(cx - 5, by + bh);
        ctx.lineTo(cx, by + bh + 6);
        ctx.lineTo(cx + 5, by + bh);
        ctx.fill();
        ctx.fillStyle = "#b45309";
        ctx.textAlign = "center";
        ctx.fillText(text, cx, by + 16);
        ctx.restore();
    }
    function drawDialogueBubble(ctx, fullText, visibleChars, cx, cy, speaker) {
        ctx.save();
        ctx.font = 'bold 15px "Fredoka One", cursive, sans-serif';
        const maxW = 340;
        const words = fullText.split(" ");
        const lines = [];
        let curLine = "";
        for (let w of words) {
            const test = curLine ? curLine + " " + w : w;
            if (ctx.measureText(test).width > maxW - 24 && curLine) {
                lines.push(curLine);
                curLine = w;
            } else {
                curLine = test;
            }
        }
        if (curLine) lines.push(curLine);
        const lineH = 20;
        const bh = lines.length * lineH + 40;
        const bw = maxW;
        const bx = Math.max(15, Math.min(cx - bw / 2, VIEW_W - bw - 15));
        const by = Math.max(6, cy - bh);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 12);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.font = 'bold 12px "Fredoka One", sans-serif';
        ctx.fillStyle = "#d97706";
        ctx.textAlign = "left";
        ctx.fillText(speaker.toUpperCase(), bx + 12, by + 16);
        ctx.font = '15px "Fredoka One", cursive, sans-serif';
        ctx.fillStyle = "#1e1b4b";
        let remaining = visibleChars;
        for (let i = 0; i < lines.length && remaining > 0; i++) {
            const take = Math.min(lines[i].length, remaining);
            ctx.fillText(lines[i].substring(0, take), bx + 12, by + 34 + i * lineH);
            remaining -= take;
        }
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 7, by + bh);
        ctx.lineTo(cx, by + bh + 10);
        ctx.lineTo(cx + 7, by + bh);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
    function updateAndDrawLithiumCompanion(ctx, cameraX, time) {
        if (typeof currentLevel === "undefined" || currentLevel !== 2 || !lithium.active) return;
        const pl = game.player;
        if (!pl || pl.health <= 0) return;
        if (typeof game !== "undefined" && (game.cageState >= 1 || game.door && game.door.active)) {
            if (!lithium._farewellDone) {
                lithium._farewellDone = true;
                try {
                    if (typeof addFloatingText === "function") {
                        addFloatingText(lithium.x + lithium.w / 2, lithium.y - 15, "💛 ¡Hasta luego, Peggy!", "#ffd700", 20);
                    }
                    if (typeof createExplosion === "function") {
                        createExplosion(lithium.x + lithium.w / 2, lithium.y + lithium.h / 2, "#ffd700", 25, 20, [ "#ffffff", "#fff066", "#f59e0b" ]);
                    }
                    if (typeof playSound === "function") {
                        playSound(880, .2, "sine", .25, 1320);
                    }
                } catch (e) {}
            }
            lithium.active = false;
            return;
        }
        if (lithium.shockTimer > 0) lithium.shockTimer--;
        if (lithium.attackTimer > 0) lithium.attackTimer--;
        if (pl.invulnerable > 0 && lithium.shockTimer <= 0) {
            lithium.shockTimer = 30;
        }
        const isPeggyIdle5s = pl.afkTimer >= 300;
        let targetX = 0;
        let targetY = 0;
        let currentMood = "happy";
        if (lithium.shockTimer > 0) {
            currentMood = "shock";
        } else if (lithium.attackTimer > 0) {
            currentMood = "attack";
        }
        if (isPeggyIdle5s) {
            lithium.playTimer++;
            const cycle = lithium.playTimer % 360;
            if (cycle < 140) {
                const bounce = Math.abs(Math.sin(cycle * .12));
                targetX = pl.x + pl.w / 2 - lithium.w / 2;
                targetY = pl.y - lithium.h - 4 - bounce * 24;
                lithium.scaleX = 1 + (1 - bounce) * .25;
                lithium.scaleY = 1 - (1 - bounce) * .25;
                currentMood = "playful";
                pl.scaleX = 1.08;
                pl.scaleY = .94;
            } else if (cycle < 270) {
                lithium.orbitAngle += .08;
                const orbR = 38;
                targetX = pl.x + pl.w / 2 + Math.cos(lithium.orbitAngle) * orbR - lithium.w / 2;
                targetY = pl.y + pl.h / 2 + Math.sin(lithium.orbitAngle) * (orbR * .7) - lithium.h / 2;
                lithium.scaleX = 1;
                lithium.scaleY = 1;
                currentMood = "playful";
                if (Math.random() < .35 && typeof particles !== "undefined" && Array.isArray(particles)) {
                    particles.push({
                        x: lithium.x + lithium.w / 2,
                        y: lithium.y + lithium.h / 2,
                        vx: (Math.random() - .5) * 1.5,
                        vy: (Math.random() - .5) * 1.5,
                        life: 16,
                        color: "#fef08a",
                        size: 2.5,
                        type: "spark"
                    });
                }
            } else {
                targetX = pl.x + (pl.facing === 1 ? -18 : pl.w + 4);
                targetY = pl.y + 6 + Math.sin(cycle * .1) * 3;
                currentMood = "love";
            }
        } else {
            lithium.playTimer = 0;
            const followDistX = 28;
            targetX = pl.x - pl.facing * followDistX;
            targetY = pl.y - 14 + Math.sin(time * .08) * 4;
            lithium.scaleX += (1 - lithium.scaleX) * .15;
            lithium.scaleY += (1 - lithium.scaleY) * .15;
        }
        const ease = isPeggyIdle5s ? .18 : .12;
        lithium.x += (targetX - lithium.x) * ease;
        lithium.y += (targetY - lithium.y) * ease;
        lithium.facing = pl.facing;
        lithium.shootTimer = (lithium.shootTimer || 0) + 1;
        if (lithium.shootTimer >= 35) {
            lithium.shootTimer = 0;
            let nearestEnemy = null;
            let minDist = 450;
            if (Array.isArray(game.enemies)) {
                for (let e of game.enemies) {
                    if (!e.active) continue;
                    const d = Math.hypot(e.x + e.w / 2 - lithium.x, e.y + e.h / 2 - lithium.y);
                    if (d < minDist) {
                        minDist = d;
                        nearestEnemy = e;
                    }
                }
            }
            if (!nearestEnemy && typeof window.ValkyrieBoss !== "undefined" && window.ValkyrieBoss && window.ValkyrieBoss.state === "fight" && window.ValkyrieBoss.boss) {
                const vbx = window.ValkyrieBoss.ARENA_X;
                const vby = window.ValkyrieBoss.BOSS_Y;
                const vd = Math.hypot(vbx - lithium.x, vby - lithium.y);
                if (vd < 700) {
                    nearestEnemy = {
                        x: vbx - 12,
                        y: vby - 12,
                        w: 24,
                        h: 24
                    };
                    minDist = vd;
                }
            }
            if (nearestEnemy) {
                const ex = nearestEnemy.x + nearestEnemy.w / 2;
                const ey = nearestEnemy.y + nearestEnemy.h / 2;
                const angle = Math.atan2(ey - lithium.y, ex - lithium.x);
                if (typeof projectiles !== "undefined" && Array.isArray(projectiles)) {
                    projectiles.push({
                        x: lithium.x,
                        y: lithium.y,
                        w: 12,
                        h: 12,
                        vx: Math.cos(angle) * 12,
                        vy: Math.sin(angle) * 12,
                        color: "#ffff00",
                        isCompanion: true,
                        damage: 30,
                        trail: []
                    });
                    try {
                        playSound(800, .1, "sine", .15, 1200);
                    } catch (e) {}
                }
            }
        }
        const shakeX = currentMood === "shock" ? (Math.random() - .5) * 4 : 0;
        const shakeY = currentMood === "shock" ? (Math.random() - .5) * 4 : 0;
        const screenX = lithium.x - cameraX + shakeX;
        const screenY = lithium.y + shakeY;
        drawLithiumSprite(ctx, screenX, screenY, lithium.w, lithium.h, lithium.facing, lithium.scaleX, lithium.scaleY, currentMood, lithium.shockTimer, time);
    }
    function drawLithiumSprite(ctx, x, y, w, h, facing, scaleX, scaleY, mood, shockTimer, t) {
        ctx.save();
        const cx = x + w / 2;
        const cy = y + h / 2;
        ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
        ctx.beginPath();
        ctx.ellipse(cx, y + h + 4, w / 2 * scaleX, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.translate(cx, cy);
        ctx.scale(scaleX, scaleY);
        ctx.translate(-cx, -cy);
        ctx.shadowColor = "#facc15";
        ctx.shadowBlur = mood === "attack" ? 16 : 8;
        const bodyGrad = ctx.createLinearGradient(x, y, x, y + h);
        bodyGrad.addColorStop(0, "#fef08a");
        bodyGrad.addColorStop(.4, "#fde047");
        bodyGrad.addColorStop(1, "#eab308");
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 6);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.beginPath();
        ctx.ellipse(x + w * .35, y + 4.5, w * .26, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(244, 63, 94, 0.45)";
        ctx.beginPath();
        ctx.ellipse(x + 4.5, y + h * .58, 2.8, 1.6, 0, 0, Math.PI * 2);
        ctx.ellipse(x + w - 4.5, y + h * .58, 2.8, 1.6, 0, 0, Math.PI * 2);
        ctx.fill();
        const eyeY = y + h * .4;
        const lookOffset = facing * 1.8;
        if (mood === "shock") {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(x + 7, eyeY, 4.2, 0, Math.PI * 2);
            ctx.arc(x + w - 7, eyeY, 4.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#111111";
            ctx.beginPath();
            ctx.arc(x + 7, eyeY, 1.4, 0, Math.PI * 2);
            ctx.arc(x + w - 7, eyeY, 1.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#7f1d1d";
            ctx.beginPath();
            ctx.ellipse(x + w / 2, y + h * .74, 3, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ef4444";
            ctx.font = 'bold 12px "Fredoka One", sans-serif';
            ctx.fillText("❗", x + w - 2, y - 4);
        } else if (mood === "attack") {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(x + 7, eyeY, 3.8, 0, Math.PI * 2);
            ctx.arc(x + w - 7, eyeY, 3.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#b45309";
            ctx.beginPath();
            ctx.arc(x + 7 + lookOffset, eyeY, 2, 0, Math.PI * 2);
            ctx.arc(x + w - 7 + lookOffset, eyeY, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#991b1b";
            ctx.beginPath();
            ctx.ellipse(x + w / 2 + lookOffset * .5, y + h * .72, 4, 4.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fde047";
            ctx.beginPath();
            ctx.arc(x + w / 2 + facing * 8, y + h * .72, 2.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (mood === "love") {
            ctx.strokeStyle = "#111111";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(x + 7, eyeY, 3, .1 * Math.PI, .9 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x + w - 7, eyeY, 3, .1 * Math.PI, .9 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x + w / 2, y + h * .68, 3.5, 0, Math.PI);
            ctx.stroke();
            ctx.fillStyle = "#f43f5e";
            ctx.font = "11px sans-serif";
            ctx.fillText("💖", x + w - 3, y - 5);
        } else {
            const isBlinking = Math.sin(t * .06) > .96;
            if (isBlinking) {
                ctx.strokeStyle = "#111111";
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.arc(x + 7, eyeY, 3, .1 * Math.PI, .9 * Math.PI);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(x + w - 7, eyeY, 3, .1 * Math.PI, .9 * Math.PI);
                ctx.stroke();
            } else {
                ctx.fillStyle = "#111111";
                ctx.beginPath();
                ctx.arc(x + 7 + lookOffset * .5, eyeY, 2.2, 0, Math.PI * 2);
                ctx.arc(x + w - 7 + lookOffset * .5, eyeY, 2.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(x + 6 + lookOffset * .5, eyeY - .8, .9, 0, Math.PI * 2);
                ctx.arc(x + w - 8 + lookOffset * .5, eyeY - .8, .9, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.strokeStyle = "#111111";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(x + w / 2, y + h * .68, 3.5, 0, Math.PI);
            ctx.stroke();
        }
        ctx.restore();
    }
    window.initLithiumLevel = initLithiumLevel;
    window.updateAndDrawLithiumCage = updateAndDrawLithiumCage;
    window.updateAndDrawLithiumCompanion = updateAndDrawLithiumCompanion;
    window.onPlayerAttackLithium = onPlayerAttackLithium;
    window.onPlayerHurtLithium = onPlayerHurtLithium;
    window.isLithiumActive = isLithiumActive;
})();