(function() {
    "use strict";
    let halloweenActive = false;
    let rebornGhosts = [];
    let ambientSoundTimer = 0;
    function stopHalloweenAudio() {
        const hwKeys = [ "sfx_halloween_stinger", "sfx_enemy_to_ghost", "sfx_witch_cackle_1", "sfx_witch_cackle_2", "sfx_pumpkin_roar_1", "sfx_pumpkin_roar_2", "sfx_pumpkin_roar_3", "sfx_halloween_blackout", "sfx_dizzy_loop", "sfx_demon_chomp", "bgm_world7_halloween", "bgm_pumpkin_chase", "bgm_boss_pumpkin" ];
        if (typeof audios !== "undefined" && audios) {
            hwKeys.forEach(k => {
                if (audios[k]) {
                    try {
                        audios[k].pause();
                        audios[k].currentTime = 0;
                    } catch (e) {}
                }
            });
        }
    }
    function initHalloweenLevel(levelIndex) {
        halloweenActive = levelIndex === 6;
        rebornGhosts = [];
        ambientSoundTimer = 0;
        if (!halloweenActive) {
            stopHalloweenAudio();
        }
    }
    function applyParalyzeEffect(player, frames = 180) {
        if (!player || player.dead || player.paralyzed || player.paralyzeImmunityTimer > 0) return;
        player.paralyzeTimer = frames;
        player.paralyzed = true;
        player.vx = 0;
        try {
            playSound(780, .35, "sine", .3, 390);
            playSound(950, .25, "triangle", .25, 480);
        } catch (e) {}
        if (typeof applyShake === "function") applyShake(6);
        if (typeof addFloatingText === "function") {
            addFloatingText(player.x + player.w / 2, player.y - 28, __("flt_paralyzed") || "💎 ¡PARALIZADO!", "#f0abfc", 20);
        }
        if (typeof particles !== "undefined" && Array.isArray(particles)) {
            for (let i = 0; i < 22; i++) {
                const ang = Math.random() * Math.PI * 2;
                const spd = 2 + Math.random() * 5;
                particles.push({
                    x: player.x + player.w / 2,
                    y: player.y + player.h / 2,
                    vx: Math.cos(ang) * spd,
                    vy: Math.sin(ang) * spd,
                    life: 25,
                    color: i % 2 === 0 ? "#e879f9" : "#ffffff",
                    size: 3 + Math.random() * 3,
                    type: "spark"
                });
            }
        }
    }
    function onHalloweenEnemyDied(enemy) {
        if (!halloweenActive || !enemy || enemy.isRebornGhost) return;
        const spawnX = enemy.x + (enemy.w ? enemy.w / 2 : 16);
        const spawnY = enemy.y + (enemy.h ? enemy.h / 2 : 16);
        try {
            playSFX("sfx_enemy_to_ghost");
            playSound(520, .3, "sine", .25, 260);
        } catch (e) {}
        if (typeof addFloatingText === "function") {
            addFloatingText(spawnX, spawnY - 24, __("flt_ghost_reborn") || "👻 ¡ALMA VENGATIVA!", "#ffffff", 17);
        }
        if (typeof particles !== "undefined" && Array.isArray(particles)) {
            for (let i = 0; i < 18; i++) {
                particles.push({
                    x: spawnX + (Math.random() - .5) * 20,
                    y: spawnY + (Math.random() - .5) * 20,
                    vx: (Math.random() - .5) * 3,
                    vy: -1.5 - Math.random() * 3.5,
                    life: 30,
                    color: "#ffffff",
                    size: 3 + Math.random() * 4,
                    type: "spark"
                });
            }
        }
        rebornGhosts.push({
            x: spawnX - 16,
            y: spawnY - 24,
            w: 32,
            h: 36,
            vx: 0,
            vy: -1.2,
            health: 26,
            maxHealth: 26,
            active: true,
            isRebornGhost: true,
            floatSeed: Math.random() * 100,
            shootTimer: 45 + Math.floor(Math.random() * 60),
            alpha: .2,
            facing: -1
        });
    }
    function updateAndDrawRebornGhosts(ctx, cameraX, t) {
        const player = typeof game !== "undefined" && game.player ? game.player : null;
        for (let i = rebornGhosts.length - 1; i >= 0; i--) {
            const g = rebornGhosts[i];
            if (!g.active) {
                rebornGhosts.splice(i, 1);
                continue;
            }
            if (g.alpha < .78) g.alpha += .03;
            g.floatSeed += .04;
            const targetX = player ? player.x : g.x;
            const targetY = player ? player.y - 40 : g.y;
            const dx = targetX - g.x;
            const dy = targetY - g.y;
            const dist = Math.hypot(dx, dy);
            g.facing = dx < 0 ? -1 : 1;
            if (dist > 50) {
                g.vx += dx / dist * .08;
                g.vy += dy / dist * .08;
            }
            g.vx *= .95;
            g.vy *= .95;
            g.x += g.vx + Math.cos(g.floatSeed) * .7;
            g.y += g.vy + Math.sin(g.floatSeed * 1.5) * 1.1;
            g.shootTimer--;
            if (g.shootTimer <= 0 && dist < 580 && player && !player.dead) {
                g.shootTimer = 110 + Math.floor(Math.random() * 40);
                const bAng = Math.atan2(player.y + player.h / 2 - (g.y + g.h / 2), player.x + player.w / 2 - (g.x + g.w / 2));
                const bSpd = 4.2;
                try {
                    playSound(650, .14, "triangle", .16, 320);
                } catch (e) {}
                if (typeof enemyProjectiles !== "undefined" && Array.isArray(enemyProjectiles)) {
                    enemyProjectiles.push({
                        x: g.x + g.w / 2,
                        y: g.y + g.h / 2,
                        w: 12,
                        h: 12,
                        radius: 6,
                        vx: Math.cos(bAng) * bSpd,
                        vy: Math.sin(bAng) * bSpd,
                        isWhiteGhostBullet: true,
                        damage: 14,
                        color: "#ffffff",
                        glowColor: "rgba(255, 255, 255, 0.85)"
                    });
                }
            }
            if (typeof projectiles !== "undefined" && Array.isArray(projectiles)) {
                for (let pIdx = projectiles.length - 1; pIdx >= 0; pIdx--) {
                    const pr = projectiles[pIdx];
                    if (pr.x > g.x && pr.x < g.x + g.w && pr.y > g.y && pr.y < g.y + g.h) {
                        g.health -= __godDmg(pr.damage || 25);
                        projectiles.splice(pIdx, 1);
                        try {
                            playSound(420, .1, "square", .1, 200);
                        } catch (e) {}
                        if (typeof addFloatingText === "function") {
                            addFloatingText(g.x + g.w / 2, g.y - 10, "-25", "#ffffff", 14);
                        }
                        if (g.health <= 0) {
                            g.active = false;
                            try {
                                playSound(220, .28, "sine", .25, 120);
                            } catch (e) {}
                            if (typeof createExplosion === "function") {
                                createExplosion(g.x + g.w / 2, g.y + g.h / 2, "#ffffff", 28, 18, [ "#ffffff", "#e2e8f0", "#cbd5e1", "#c084fc" ]);
                            }
                            break;
                        }
                    }
                }
            }
            const scrX = g.x - cameraX;
            if (scrX < -80 || scrX > VIEW_W + 80) continue;
            ctx.save();
            ctx.globalAlpha = g.alpha;
            ctx.shadowColor = "#ffffff";
            ctx.shadowBlur = 14;
            ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
            ctx.beginPath();
            const cx = scrX + g.w / 2;
            const cy = g.y + 14;
            ctx.arc(cx, cy, 14, Math.PI, 0, false);
            const tailY = g.y + g.h;
            const wave1 = Math.sin(t * .15 + g.floatSeed) * 4;
            const wave2 = Math.cos(t * .15 + g.floatSeed) * 4;
            ctx.lineTo(scrX + g.w, tailY - 4 + wave1);
            ctx.quadraticCurveTo(scrX + g.w * .75, tailY - 12, scrX + g.w * .5, tailY + wave2);
            ctx.quadraticCurveTo(scrX + g.w * .25, tailY - 12, scrX, tailY - 4 - wave1);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#0f172a";
            const eyeOffX = g.facing === 1 ? 2 : -2;
            ctx.beginPath();
            ctx.arc(cx - 5 + eyeOffX, cy - 1, 2.5, 0, Math.PI * 2);
            ctx.arc(cx + 5 + eyeOffX, cy - 1, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(cx + eyeOffX, cy + 6, 2.5, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            if (g.health < g.maxHealth) {
                const bw = 24, bh = 3;
                const bx = cx - bw / 2, by = g.y - 6;
                ctx.fillStyle = "rgba(0,0,0,0.6)";
                ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(bx, by, bw * Math.max(0, g.health / g.maxHealth), bh);
            }
            ctx.restore();
        }
    }
    function drawParalyzeDiamond(ctx, p, cameraX, t) {
        const sx = p.x - cameraX;
        const sy = p.y;
        if (sx < -60 || sx > VIEW_W + 60) return;
        ctx.save();
        ctx.translate(sx, sy);
        p.rot = (p.rot || 0) + .08;
        ctx.rotate(p.rot);
        ctx.shadowColor = "#e879f9";
        ctx.shadowBlur = 18;
        const size = p.radius || 13;
        const grad = ctx.createLinearGradient(-size, -size, size, size);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(.35, "#f0abfc");
        grad.addColorStop(.7, "#c084fc");
        grad.addColorStop(1, "#9333ea");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, -size * 1.35);
        ctx.lineTo(size * .95, -size * .4);
        ctx.lineTo(size * .95, size * .4);
        ctx.lineTo(0, size * 1.35);
        ctx.lineTo(-size * .95, size * .4);
        ctx.lineTo(-size * .95, -size * .4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -size * 1.35);
        ctx.lineTo(0, size * 1.35);
        ctx.moveTo(-size * .95, 0);
        ctx.lineTo(size * .95, 0);
        ctx.stroke();
        const sparkle = Math.sin(t * .2 + (p.sparkleSeed || 0)) * 2 + 5;
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, -sparkle);
        ctx.lineTo(sparkle * .3, 0);
        ctx.lineTo(0, sparkle);
        ctx.lineTo(-sparkle * .3, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    function drawHalloweenFire(ctx, p, cameraX, t) {
        const sx = p.x - cameraX;
        const sy = p.y;
        if (sx < -50 || sx > VIEW_W + 50) return;
        ctx.save();
        ctx.translate(sx, sy);
        const r = p.radius || 9;
        ctx.shadowColor = "#f97316";
        ctx.shadowBlur = 15;
        const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, r * 1.4);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(.3, "#fef08a");
        grad.addColorStop(.65, "#f97316");
        grad.addColorStop(1, "rgba(220, 38, 38, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ea580c";
        const angle = Math.atan2(p.vy || 0, p.vx || 1);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(-r, 0);
        ctx.lineTo(-r * 2.2, -r * .6);
        ctx.lineTo(-r * 1.4, 0);
        ctx.lineTo(-r * 2.2, r * .6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    function drawWhiteGhostBullet(ctx, p, cameraX, t) {
        const sx = p.x - cameraX;
        const sy = p.y;
        if (sx < -40 || sx > VIEW_W + 40) return;
        ctx.save();
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 12;
        const r = p.radius || 6;
        const grad = ctx.createRadialGradient(sx, sy, 1, sx, sy, r * 1.3);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(.5, "rgba(241, 245, 249, 0.9)");
        grad.addColorStop(1, "rgba(203, 213, 225, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, r * 1.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(sx, sy, r * .65, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    function drawPlayerParalyzePrism(ctx, player, cameraX, t, style) {
        if (!player || !player.paralyzed || player.paralyzeTimer <= 0) return;
        const px = player.x - cameraX + player.w / 2;
        const py = player.y + player.h / 2;
        const isIce = style === "ice";
        ctx.save();
        ctx.translate(px, py);
        const prismW = player.w * 1.4;
        const prismH = player.h * 1.6;
        ctx.shadowColor = isIce ? "#7dd3fc" : "#e879f9";
        ctx.shadowBlur = 20;
        ctx.fillStyle = isIce ? "rgba(125, 211, 252, 0.32)" : "rgba(232, 121, 249, 0.28)";
        ctx.beginPath();
        ctx.moveTo(0, -prismH);
        ctx.lineTo(prismW, -prismH * .3);
        ctx.lineTo(prismW, prismH * .3);
        ctx.lineTo(0, prismH);
        ctx.lineTo(-prismW, prismH * .3);
        ctx.lineTo(-prismW, -prismH * .3);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.strokeStyle = isIce ? "rgba(148, 233, 255, 0.65)" : "rgba(192, 132, 252, 0.6)";
        ctx.beginPath();
        ctx.moveTo(0, -prismH);
        ctx.lineTo(0, prismH);
        ctx.moveTo(-prismW, 0);
        ctx.lineTo(prismW, 0);
        ctx.stroke();
        const glintX = Math.sin(t * .08) * (prismW * .6);
        const glintY = Math.cos(t * .08) * (prismH * .6);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(glintX, glintY, 3, 0, Math.PI * 2);
        ctx.fill();
        const secLeft = (player.paralyzeTimer / 60).toFixed(1);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = isIce ? "#7dd3fc" : "#e879f9";
        ctx.shadowBlur = 8;
        ctx.font = 'bold 13px "Courier Prime", monospace';
        ctx.textAlign = "center";
        ctx.fillText(`${isIce ? "❄️" : "💎"} ${secLeft}s`, 0, -prismH - 8);
        ctx.restore();
    }
    function updateAndDrawHalloween(ctx, cameraX, t) {
        if (!halloweenActive || typeof currentLevel !== "undefined" && currentLevel !== 6) {
            if (halloweenActive) {
                halloweenActive = false;
                stopHalloweenAudio();
            }
            return;
        }
        if (typeof window.GAME_PAUSED === "undefined" || !window.GAME_PAUSED) {
            ambientSoundTimer++;
            if (ambientSoundTimer >= 480) {
                ambientSoundTimer = 0;
                try {
                    playSFX("sfx_halloween_stinger");
                } catch (e) {}
            }
        }
        updateAndDrawRebornGhosts(ctx, cameraX, t);
        if (typeof game !== "undefined" && game.player) {
            drawPlayerParalyzePrism(ctx, game.player, cameraX, t);
        }
    }
    function drawPumpkinEnemy(ctx, x, y, w, h, facing, mouthOpenTimer, isEnraged, t) {
        ctx.save();
        const cx = x + w / 2;
        const cy = y + h / 2;
        ctx.shadowColor = "#f97316";
        ctx.shadowBlur = 14;
        const pGrad = ctx.createLinearGradient(cx, y, cx, y + h);
        pGrad.addColorStop(0, "#fb923c");
        pGrad.addColorStop(.5, "#ea580c");
        pGrad.addColorStop(1, "#9a3412");
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy, w * .46, h * .48, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#c2410c";
        ctx.beginPath();
        ctx.ellipse(cx - w * .28, cy, w * .22, h * .44, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + w * .28, cy, w * .22, h * .44, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#15803d";
        ctx.beginPath();
        ctx.moveTo(cx - 3, y + 3);
        ctx.quadraticCurveTo(cx - 1, y - 8, cx + 5, y - 7);
        ctx.lineTo(cx + 3, y + 3);
        ctx.closePath();
        ctx.fill();
        const eyeGlow = Math.sin(t * .15) * .2 + .8;
        ctx.fillStyle = `rgba(254, 240, 138, ${eyeGlow})`;
        ctx.shadowColor = "#fef08a";
        ctx.shadowBlur = 8;
        const eyeX1 = cx - 7 + (facing === 1 ? 2 : -2);
        const eyeX2 = cx + 7 + (facing === 1 ? 2 : -2);
        const eyeY = cy - 4;
        ctx.beginPath();
        ctx.moveTo(eyeX1, eyeY - 4);
        ctx.lineTo(eyeX1 + 4, eyeY + 3);
        ctx.lineTo(eyeX1 - 4, eyeY + 3);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(eyeX2, eyeY - 4);
        ctx.lineTo(eyeX2 + 4, eyeY + 3);
        ctx.lineTo(eyeX2 - 4, eyeY + 3);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + (facing === 1 ? 2 : -2), eyeY + 3);
        ctx.lineTo(cx + (facing === 1 ? 4 : 0), eyeY + 7);
        ctx.lineTo(cx + (facing === 1 ? 0 : -4), eyeY + 7);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        const mY = cy + 8;
        ctx.moveTo(cx - 11, mY);
        ctx.lineTo(cx - 6, mY + 6);
        ctx.lineTo(cx - 3, mY + 2);
        ctx.lineTo(cx, mY + 7);
        ctx.lineTo(cx + 3, mY + 2);
        ctx.lineTo(cx + 6, mY + 6);
        ctx.lineTo(cx + 11, mY);
        ctx.lineTo(cx + 7, mY - 2);
        ctx.lineTo(cx + 4, mY + 2);
        ctx.lineTo(cx, mY - 3);
        ctx.lineTo(cx - 4, mY + 2);
        ctx.lineTo(cx - 7, mY - 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    function drawCrowEnemy(ctx, x, y, w, h, facing, isDiving, t) {
        ctx.save();
        const cx = x + w / 2;
        const cy = y + h / 2;
        ctx.shadowColor = "#4338ca";
        ctx.shadowBlur = 8;
        ctx.fillStyle = "#090514";
        ctx.beginPath();
        ctx.ellipse(cx, cy, w * .42, h * .36, 0, 0, Math.PI * 2);
        ctx.fill();
        const wingFlap = Math.sin(t * .25) * 12;
        ctx.fillStyle = "#1e1b4b";
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy - 2);
        ctx.quadraticCurveTo(cx - facing * 18, cy - 14 - wingFlap, cx - facing * 24, cy + 4 - wingFlap * .5);
        ctx.lineTo(cx - 4, cy + 6);
        ctx.closePath();
        ctx.fill();
        const headX = cx + facing * 10;
        const headY = cy - 4;
        ctx.fillStyle = "#020617";
        ctx.beginPath();
        ctx.arc(headX, headY, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ef4444";
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(headX + facing * 2, headY - 1, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.moveTo(headX + facing * 5, headY - 2);
        ctx.lineTo(headX + facing * 14, headY + 1);
        ctx.lineTo(headX + facing * 5, headY + 3);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.moveTo(cx - facing * 10, cy);
        ctx.lineTo(cx - facing * 20, cy + 8);
        ctx.lineTo(cx - facing * 14, cy - 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    function drawWitchEnemy(ctx, x, y, w, h, facing, t) {
        ctx.save();
        const cx = x + w / 2;
        const cy = y + h / 2;
        ctx.shadowColor = "#a855f7";
        ctx.shadowBlur = 12;
        const broomY = cy + 10;
        ctx.strokeStyle = "#78350f";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(cx - facing * 26, broomY + 4);
        ctx.lineTo(cx + facing * 26, broomY - 4);
        ctx.stroke();
        ctx.fillStyle = "#d97706";
        ctx.beginPath();
        const bEndX = cx - facing * 24;
        ctx.moveTo(bEndX, broomY + 2);
        ctx.lineTo(bEndX - facing * 14, broomY - 6);
        ctx.lineTo(bEndX - facing * 16, broomY + 10);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#581c87";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 10);
        ctx.lineTo(cx + facing * 12, broomY);
        ctx.lineTo(cx - facing * 14, broomY + 2);
        ctx.closePath();
        ctx.fill();
        const headY = cy - 14;
        ctx.fillStyle = "#a7f3d0";
        ctx.beginPath();
        ctx.arc(cx, headY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#6ee7b7";
        ctx.beginPath();
        ctx.moveTo(cx + facing * 4, headY - 1);
        ctx.lineTo(cx + facing * 11, headY + 2);
        ctx.lineTo(cx + facing * 4, headY + 3);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(cx + facing * 3, headY - 2, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1e1b4b";
        ctx.beginPath();
        ctx.ellipse(cx, headY - 4, 18, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - 10, headY - 5);
        ctx.quadraticCurveTo(cx - facing * 6, headY - 22, cx - facing * 18, headY - 28);
        ctx.lineTo(cx + 8, headY - 5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#f97316";
        ctx.fillRect(cx - 7, headY - 8, 14, 3);
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(cx + facing * 1 - 2, headY - 9, 5, 5);
        ctx.restore();
    }
    function drawHoodedEnemy(ctx, x, y, w, h, facing, t) {
        ctx.save();
        const cx = x + w / 2;
        const cy = y + h / 2;
        ctx.shadowColor = "#7e22ce";
        ctx.shadowBlur = 10;
        const tGrad = ctx.createLinearGradient(cx, y, cx, y + h);
        tGrad.addColorStop(0, "#2e1065");
        tGrad.addColorStop(1, "#090514");
        ctx.fillStyle = tGrad;
        ctx.beginPath();
        ctx.moveTo(cx, y + 4);
        ctx.lineTo(cx + w * .42, y + h);
        ctx.lineTo(cx - w * .42, y + h);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#05010a";
        ctx.beginPath();
        ctx.arc(cx + facing * 2, y + 15, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#3b0764";
        ctx.beginPath();
        ctx.moveTo(cx - 12, y + 16);
        ctx.quadraticCurveTo(cx, y - 2, cx + 12, y + 16);
        ctx.quadraticCurveTo(cx, y + 6, cx - 12, y + 16);
        ctx.fill();
        ctx.fillStyle = "#ef4444";
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 8;
        const eDir = facing === 1 ? 2 : -2;
        ctx.beginPath();
        ctx.arc(cx + eDir - 4, y + 15, 2, 0, Math.PI * 2);
        ctx.arc(cx + eDir + 4, y + 15, 2, 0, Math.PI * 2);
        ctx.fill();
        const orbX = cx + facing * 16;
        const orbY = cy + 4 + Math.sin(t * .1) * 3;
        ctx.fillStyle = "#c084fc";
        ctx.shadowColor = "#e879f9";
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(orbX, orbY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    function drawGhostEnemy(ctx, x, y, w, h, facing, isDashing, dashCooldown, t) {
        ctx.save();
        const cx = x + w / 2;
        const cy = y + h / 2;
        const isHorror = !!window.postGameHorror;
        const isPreparing = dashCooldown > 0 && dashCooldown < 35;
        if (isHorror) {
            ctx.shadowColor = isPreparing || isDashing ? "#ff0000" : "#7f1d1d";
            ctx.shadowBlur = isDashing ? 25 : 15;
            ctx.fillStyle = isDashing ? "rgba(80, 10, 10, 0.95)" : "rgba(25, 25, 30, 0.9)";
        } else {
            ctx.shadowColor = isPreparing ? "#ef4444" : isDashing ? "#f43f5e" : "#c084fc";
            ctx.shadowBlur = isDashing ? 22 : 12;
            ctx.fillStyle = isDashing ? "rgba(254, 205, 211, 0.88)" : "rgba(233, 213, 255, 0.78)";
        }
        ctx.beginPath();
        ctx.arc(cx, cy - 4, w * .38, Math.PI, 0, false);
        const tailWave = Math.sin(t * .2) * 5;
        ctx.lineTo(cx + w * .4, y + h + tailWave);
        ctx.quadraticCurveTo(cx + w * .2, y + h - 8, cx, y + h + tailWave * .6);
        ctx.quadraticCurveTo(cx - w * .2, y + h - 8, cx - w * .4, y + h - tailWave);
        ctx.closePath();
        ctx.fill();
        const eyeX = cx + facing * 3;
        if (isHorror) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(eyeX - 6, cy - 6, 4.5, 0, Math.PI * 2);
            ctx.arc(eyeX + 6, cy - 6, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#991b1b";
            ctx.beginPath();
            ctx.arc(eyeX - 6 + facing * .8, cy - 6, 1.2, 0, Math.PI * 2);
            ctx.arc(eyeX + 6 + facing * .8, cy - 6, 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.ellipse(eyeX, cy + 4, 4.5, isDashing ? 9 : 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fef08a";
            ctx.beginPath();
            ctx.moveTo(eyeX - 4, cy + 1);
            ctx.lineTo(eyeX - 2, cy + 6);
            ctx.lineTo(eyeX, cy + 1);
            ctx.moveTo(eyeX, cy + 1);
            ctx.lineTo(eyeX + 2, cy + 6);
            ctx.lineTo(eyeX + 4, cy + 1);
            ctx.fill();
            ctx.fillStyle = "#dc2626";
            ctx.fillRect(eyeX - 7, cy - 2, 1.5, 6);
            ctx.fillRect(eyeX + 5, cy - 2, 1.5, 6);
        } else {
            if (isPreparing || isDashing) {
                ctx.fillStyle = "#ef4444";
                ctx.shadowColor = "#ef4444";
                ctx.shadowBlur = 10;
            } else {
                ctx.shadowBlur = 0;
                ctx.fillStyle = "#1e1b4b";
            }
            ctx.beginPath();
            ctx.arc(eyeX - 5, cy - 6, 3, 0, Math.PI * 2);
            ctx.arc(eyeX + 5, cy - 6, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.ellipse(eyeX, cy + 3, 3, isDashing ? 7 : 4, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
    window.HalloweenSystem = {
        initHalloweenLevel: initHalloweenLevel,
        stopHalloweenAudio: stopHalloweenAudio,
        applyParalyzeEffect: applyParalyzeEffect,
        onHalloweenEnemyDied: onHalloweenEnemyDied,
        updateAndDrawHalloween: updateAndDrawHalloween,
        drawParalyzeDiamond: drawParalyzeDiamond,
        drawHalloweenFire: drawHalloweenFire,
        drawWhiteGhostBullet: drawWhiteGhostBullet,
        drawPumpkinEnemy: drawPumpkinEnemy,
        drawCrowEnemy: drawCrowEnemy,
        drawWitchEnemy: drawWitchEnemy,
        drawHoodedEnemy: drawHoodedEnemy,
        drawGhostEnemy: drawGhostEnemy
    };
    window.initHalloweenLevel = initHalloweenLevel;
    window.stopHalloweenAudio = stopHalloweenAudio;
    window.applyParalyzeEffect = applyParalyzeEffect;
    window.onHalloweenEnemyDied = onHalloweenEnemyDied;
    window.drawPlayerParalyzePrism = drawPlayerParalyzePrism;
    window.updateAndDrawHalloween = updateAndDrawHalloween;
})();
// Isaac Daniel Cotera - 2026 | Correo: isaacdanielcotera@gmail.com | Itch.io: https://cotera.itch.io | GitHub: https://github.com/cotera2024
