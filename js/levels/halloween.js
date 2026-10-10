(function() {
    "use strict";
    let halloweenActive = false;
    let rebornGhosts = [];
    let ambientSoundTimer = 0;
    let cometTimer = 0;
    let halloweenComets = [];
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
        halloweenComets = [];
        cometTimer = 0;
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
            addFloatingText(player.x + player.w / 2, player.y - 28, __("flt_paralyzed") || "¡PARALIZADO!", "#f0abfc", 20);
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
            addFloatingText(spawnX, spawnY - 24, __("flt_ghost_reborn") || "¡ALMA VENGATIVA!", "#ffffff", 17);
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
            health: 20,
            maxHealth: 20,
            hitsTaken: 0,
            active: true,
            isRebornGhost: true,
            floatSeed: Math.random() * 100,
            shootTimer: 45 + Math.floor(Math.random() * 60),
            alpha: .2,
            facing: -1
        });
    }
    function takeGhostDamage(g, amount) {
        if (!g || !g.active) return false;
        const dmg = typeof __godDmg === "function" ? __godDmg(amount || 10) : (amount || 10);
        g.hitsTaken = (g.hitsTaken || 0) + 1;
        g.health -= dmg;
        if (g.health <= 0 || dmg >= 20 || g.hitsTaken >= 2) {
            g.health = 0;
            g.active = false;
            try {
                playSound(220, .28, "sine", .25, 120);
            } catch (e) {}
            if (typeof createExplosion === "function") {
                createExplosion(g.x + g.w / 2, g.y + g.h / 2, "#ffffff", 28, 18, [ "#ffffff", "#e2e8f0", "#cbd5e1", "#c084fc" ]);
            }
        }
        try {
            playSound(420, .1, "square", .1, 200);
        } catch (e) {}
        if (typeof addFloatingText === "function") {
            addFloatingText(g.x + g.w / 2, g.y - 10, "-" + dmg, "#ffffff", 14);
        }
        return true;
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
                    const prW = pr.w || 10;
                    const prH = pr.h || 10;
                    if (pr.x + prW > g.x && pr.x < g.x + g.w && pr.y + prH > g.y && pr.y < g.y + g.h) {
                        takeGhostDamage(g, pr.damage || 10);
                        projectiles.splice(pIdx, 1);
                        if (!g.active) break;
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
        if (sx < -60 || sx > VIEW_W + 60) return;
        ctx.save();
        ctx.translate(sx, sy);
        
        ctx.rotate((p.x + p.y) * 0.04);

        const r = Math.max(14, p.radius || 14);
        
        ctx.shadowColor = "#f97316";
        ctx.shadowBlur = 14 + Math.sin(t * 0.4) * 4;

        ctx.fillStyle = "#2d0a02";
        ctx.beginPath();
        ctx.ellipse(0, 0, r + 2.5, r * 0.96 + 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#c2410c";
        ctx.beginPath();
        ctx.ellipse(-r * 0.45, 0, r * 0.58, r * 0.95, -0.1, 0, Math.PI * 2);
        ctx.ellipse(r * 0.45, 0, r * 0.58, r * 0.95, 0.1, 0, Math.PI * 2);
        ctx.fill();

        const gradBody = ctx.createRadialGradient(0, -r * 0.2, 2, 0, 0, r);
        gradBody.addColorStop(0, "#fb923c");
        gradBody.addColorStop(0.5, "#ea580c");
        gradBody.addColorStop(1, "#9a3412");
        ctx.fillStyle = gradBody;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.72, r * 0.98, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(45, 10, 2, 0.65)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(-r * 0.42, 0, r * 0.4, r * 0.9, -0.1, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(r * 0.42, 0, r * 0.4, r * 0.9, 0.1, 0, Math.PI * 2);
        ctx.stroke();

        ctx.shadowBlur = 0;

        ctx.fillStyle = "#15803d";
        ctx.beginPath();
        ctx.moveTo(-r * 0.12, -r * 0.88);
        ctx.quadraticCurveTo(r * 0.1, -r * 1.35, r * 0.35, -r * 1.25);
        ctx.lineTo(r * 0.12, -r * 0.88);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#052e16";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "#fef08a";
        ctx.shadowColor = "#fef08a";
        ctx.shadowBlur = 6;
        
        ctx.beginPath();
        ctx.moveTo(-r * 0.52, -r * 0.24);
        ctx.lineTo(-r * 0.14, -r * 0.08);
        ctx.lineTo(-r * 0.48, 0.02);
        ctx.closePath();
        ctx.moveTo(r * 0.52, -r * 0.24);
        ctx.lineTo(r * 0.14, -r * 0.08);
        ctx.lineTo(r * 0.48, 0.02);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(-r * 0.32, -r * 0.12, r * 0.1, 0, Math.PI * 2);
        ctx.arc(r * 0.32, -r * 0.12, r * 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#fef08a";
        ctx.beginPath();
        ctx.moveTo(-r * 0.55, r * 0.26);
        ctx.lineTo(-r * 0.28, r * 0.2);
        ctx.lineTo(-r * 0.18, r * 0.4);
        ctx.lineTo(0, r * 0.22);
        ctx.lineTo(r * 0.18, r * 0.4);
        ctx.lineTo(r * 0.28, r * 0.2);
        ctx.lineTo(r * 0.55, r * 0.26);
        ctx.lineTo(r * 0.35, r * 0.6);
        ctx.lineTo(0, r * 0.66);
        ctx.lineTo(-r * 0.35, r * 0.6);
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
    function spawnHalloweenComet(cameraX) {
        if (typeof game === "undefined" || !game.player) return;
        if (game.arenaLocked || (game.pumpkinBoss && game.pumpkinBoss.state !== "idle" && game.pumpkinBoss.state !== "defeated") || (game.player && game.player.x >= 25000)) {
            return;
        }

        const minX = cameraX - 20;
        const maxX = cameraX + VIEW_W + 20;
        const eligiblePlatforms = (game.platforms || []).filter(p => {
            if (!p || p.broken || p.active === false) return false;
            if (p.isGateButton || p.isGateObstacle || p.isArenaGate || p.isTreeArenaGate || p.isDrawbridge) return false;
            if (p.x >= 25000) return false;
            return (p.x + p.w > minX + 30 && p.x < maxX - 30);
        });

        let targetX = 0;
        let targetY = 560;

        if (eligiblePlatforms.length > 0) {
            const chosen = eligiblePlatforms[Math.floor(Math.random() * eligiblePlatforms.length)];
            const leftBound = Math.max(chosen.x + 30, minX + 50);
            const rightBound = Math.min(chosen.x + chosen.w - 30, maxX - 50);
            if (rightBound > leftBound) {
                targetX = leftBound + Math.random() * (rightBound - leftBound);
            } else {
                targetX = chosen.x + chosen.w / 2;
            }
            targetY = chosen.y;
        } else {
            if (cameraX >= 24800) return;
            targetX = cameraX + 80 + Math.random() * (VIEW_W - 160);
            targetY = 560;
        }

        const dir = Math.random() < 0.5 ? -1 : 1;
        const startX = targetX - dir * (320 + Math.random() * 120);
        const startY = targetY - 560;
        const dx = targetX - startX;
        const dy = targetY - startY;
        const dist = Math.hypot(dx, dy) || 1;
        const speed = 32;

        try {
            playSound(950, .3, "sine", .35, 140);
            playSound(620, .22, "triangle", .25, 90);
        } catch (e) {}

        halloweenComets.push({
            x: startX,
            y: startY,
            vx: (dx / dist) * speed,
            vy: (dy / dist) * speed,
            targetX: targetX,
            targetY: targetY,
            trail: [],
            active: true,
            life: 0
        });
    }

    function impactHalloweenComet(hitX, hitY) {
        try {
            if (typeof triggerDashHitImpact === "function") {
                triggerDashHitImpact(hitX, hitY, true);
            }
            playSound(65, .35, "sawtooth", .75, 25);
            playSound(1100, .14, "triangle", .55, 160);
            playSound(320, .22, "square", .45, 80);
            playSound(180, .3, "sawtooth", .5, 45);
            if (typeof playSFX === "function") playSFX("sfx_rock_impact");
        } catch (_) {}

        if (typeof applyShake === "function") applyShake(16);

        if (typeof createExplosion === "function") {
            createExplosion(hitX, hitY, "#ff3b00", 42, 22, ["#ffffff", "#facc15", "#ff4500", "#c084fc", "#18181b"]);
            createExplosion(hitX, hitY - 12, "#a855f7", 32, 18, ["#ffffff", "#38bdf8", "#c084fc", "#e879f9"]);
        }

        if (typeof particles !== "undefined" && Array.isArray(particles)) {
            for (let i = 0; i < 30; i++) {
                const ang = Math.random() * Math.PI * 2;
                const spd = 3 + Math.random() * 8;
                particles.push({
                    x: hitX,
                    y: hitY,
                    vx: Math.cos(ang) * spd,
                    vy: Math.sin(ang) * spd - 3,
                    life: 24 + Math.random() * 16,
                    color: ["#ffffff", "#facc15", "#ff4500", "#c084fc", "#e879f9", "#38bdf8"][i % 6],
                    size: 3.5 + Math.random() * 4,
                    type: "spark"
                });
            }
        }

        if (typeof game !== "undefined" && game.player && !game.player.dead) {
            const p = game.player;
            const pDist = Math.hypot((p.x + p.w / 2) - hitX, (p.y + p.h / 2) - hitY);
            if (pDist < 85) {
                if (typeof p.takeDamage === "function") {
                    p.takeDamage(40);
                } else {
                    p.health = Math.max(0, (p.health || 100) - 40);
                }
                if (typeof addFloatingText === "function") {
                    addFloatingText(p.x + p.w / 2, p.y - 25, "-40", "#ef4444", 22);
                }
            }
        }

        if (typeof game !== "undefined" && Array.isArray(game.enemies)) {
            game.enemies.forEach(e => {
                if (!e || !e.active || e.dead) return;
                const ex = e.x + (e.w || 30) / 2;
                const ey = e.y + (e.h || 30) / 2;
                if (Math.hypot(ex - hitX, ey - hitY) < 95) {
                    try {
                        if (typeof e.takeDamage === "function") {
                            e.takeDamage(999);
                        } else {
                            e.health = 0;
                            e.active = false;
                        }
                    } catch (_) {
                        e.health = 0;
                        e.active = false;
                    }
                    if (typeof addFloatingText === "function") {
                        addFloatingText(ex, ey - 20, typeof __ === "function" ? __("flt_aplastado") : "¡APLASTADO!", "#ef4444", 20);
                    }
                }
            });
        }

        if (typeof game !== "undefined" && Array.isArray(game.platforms)) {
            const targetPlats = game.platforms.filter(p => {
                if (!p || p.broken || p.active === false) return false;
                if (p.isGateButton || p.isGateObstacle || p.isArenaGate || p.isTreeArenaGate || p.isDrawbridge) return false;
                if (p.x >= 25000) return false;
                const inX = hitX >= p.x - 25 && hitX <= p.x + p.w + 25;
                const inY = Math.abs(p.y - hitY) <= 45 || (hitY >= p.y - 15 && hitY <= p.y + (p.h || 30) + 20);
                return inX && inY;
            });

            const holeW = 150;
            const holeLeft = hitX - holeW / 2;
            const holeRight = hitX + holeW / 2;

            targetPlats.forEach(plat => {
                const origX = plat.x;
                const origW = plat.w;
                const origY = plat.y;
                const origH = plat.h;

                if (typeof particles !== "undefined" && Array.isArray(particles)) {
                    for (let d = 0; d < 20; d++) {
                        particles.push({
                            x: hitX + (Math.random() - 0.5) * 50,
                            y: plat.y + (Math.random() - 0.5) * 20,
                            vx: (Math.random() - 0.5) * 14,
                            vy: -Math.random() * 9 - 2,
                            life: 25 + Math.random() * 15,
                            color: ["#5c2e14", "#78350f", "#475569", "#f97316", "#ffffff"][d % 5],
                            size: 4 + Math.random() * 4,
                            type: "spark"
                        });
                    }
                }

                if (origW <= holeW + 30) {
                    plat.broken = true;
                    plat.active = false;
                    if (game.player && game.player.currentPlatform === plat) {
                        game.player.onGround = false;
                    }
                    if (typeof addFloatingText === "function") {
                        addFloatingText(hitX, plat.y - 25, typeof __ === "function" ? __("flt_plataforma_rota") : "¡PLATAFORMA DESTRUIDA!", "#ef4444", 22);
                    }
                } else if (holeLeft <= origX + 35) {
                    plat.x = holeRight;
                    plat.w = Math.max(25, (origX + origW) - holeRight);
                    if (typeof addFloatingText === "function") {
                        addFloatingText(hitX, plat.y - 25, typeof __ === "function" ? __("flt_hueco_vacio") : "¡CRÁTER GIGANTE!", "#ef4444", 20);
                    }
                } else if (holeRight >= origX + origW - 35) {
                    plat.w = Math.max(25, holeLeft - origX);
                    if (typeof addFloatingText === "function") {
                        addFloatingText(hitX, plat.y - 25, typeof __ === "function" ? __("flt_hueco_vacio") : "¡CRÁTER GIGANTE!", "#ef4444", 20);
                    }
                } else {
                    plat.w = holeLeft - origX;
                    const rightPlat = (typeof Platform !== "undefined") ? new Platform({
                        x: holeRight,
                        y: origY,
                        w: (origX + origW) - holeRight,
                        h: origH,
                        unbreakable: plat.unbreakable,
                        color: plat.color,
                        spikes: plat.spikes
                    }) : {
                        x: holeRight,
                        y: origY,
                        w: (origX + origW) - holeRight,
                        h: origH,
                        unbreakable: plat.unbreakable,
                        color: plat.color,
                        spikes: plat.spikes
                    };
                    if (plat.notches) {
                        rightPlat.notches = plat.notches.filter(n => n.x >= holeRight).map(n => ({
                            ...n,
                            relX: n.x - rightPlat.x
                        }));
                        plat.notches = plat.notches.filter(n => n.x <= holeLeft);
                    }
                    game.platforms.push(rightPlat);

                    if (typeof addFloatingText === "function") {
                        addFloatingText(hitX, plat.y - 25, typeof __ === "function" ? __("flt_hueco_vacio") : "¡CRÁTER GIGANTE!", "#ef4444", 20);
                    }
                }

                if (game.player && !game.player.dead) {
                    const p = game.player;
                    const pMidX = p.x + p.w / 2;
                    if (pMidX >= holeLeft && pMidX <= holeRight && Math.abs((p.y + p.h) - origY) < 18) {
                        p.onGround = false;
                        p.y += 4;
                    }
                }
            });
        }
    }

    function drawHalloweenComet(ctx, c, cameraX, t) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";

        if (c.trail.length > 1) {
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            for (let i = 0; i < c.trail.length - 1; i++) {
                const tr = c.trail[i];
                const trNext = c.trail[i + 1];
                tr.alpha -= 0.035;
                if (tr.alpha > 0) {
                    const x1 = tr.x - cameraX;
                    const y1 = tr.y;
                    const x2 = trNext.x - cameraX;
                    const y2 = trNext.y;

                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);

                    const thickness = Math.max(1, 26 * tr.alpha);
                    ctx.lineWidth = thickness;
                    ctx.strokeStyle = `rgba(168, 85, 247, ${tr.alpha * 0.85})`;
                    ctx.stroke();

                    ctx.lineWidth = thickness * 1.5;
                    ctx.strokeStyle = `rgba(56, 189, 248, ${tr.alpha * 0.45})`;
                    ctx.stroke();
                }
            }
            while (c.trail.length > 0 && c.trail[0].alpha <= 0) {
                c.trail.shift();
            }
        }

        if (c.active) {
            const headX = c.x - cameraX;
            const headY = c.y;

            const headGlow = ctx.createRadialGradient(headX, headY, 2, headX, headY, 52);
            headGlow.addColorStop(0, "rgba(255, 255, 255, 1)");
            headGlow.addColorStop(0.3, "rgba(168, 85, 247, 0.95)");
            headGlow.addColorStop(0.6, "rgba(56, 189, 248, 0.65)");
            headGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = headGlow;
            ctx.beginPath();
            ctx.arc(headX, headY, 52, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(headX, headY, 11, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    function updateAndDrawHalloweenComets(ctx, cameraX, t) {
        if (!halloweenActive || (typeof currentLevel !== "undefined" && currentLevel !== 6)) {
            halloweenComets = [];
            cometTimer = 0;
            return;
        }

        const isBossOrChase = typeof game !== "undefined" && (
            game.arenaLocked ||
            (game.pumpkinBoss && game.pumpkinBoss.state !== "idle" && game.pumpkinBoss.state !== "defeated") ||
            (game.player && game.player.x >= 25000)
        );

        if (!isBossOrChase && (typeof window.GAME_PAUSED === "undefined" || !window.GAME_PAUSED)) {
            cometTimer++;
            const cometLimit = (typeof window !== "undefined" && window.postGameHorror) ? 130 : 360;
            if (cometTimer >= cometLimit) {
                cometTimer = 0;
                spawnHalloweenComet(cameraX);
                if (typeof window !== "undefined" && window.postGameHorror && Math.random() < 0.45) {
                    setTimeout(() => {
                        if (halloweenActive) spawnHalloweenComet(cameraX);
                    }, 350);
                }
            }
        }

        for (let i = halloweenComets.length - 1; i >= 0; i--) {
            const c = halloweenComets[i];
            if (c.active) {
                c.x += c.vx;
                c.y += c.vy;
                c.life++;
                c.trail.push({ x: c.x, y: c.y, alpha: 1.0 });

                if (Math.random() < 0.6 && typeof particles !== "undefined" && Array.isArray(particles)) {
                    particles.push({
                        x: c.x + (Math.random() - 0.5) * 10,
                        y: c.y + (Math.random() - 0.5) * 10,
                        vx: -c.vx * 0.08 + (Math.random() - 0.5) * 2,
                        vy: -c.vy * 0.08 + (Math.random() - 0.5) * 2,
                        life: 14 + Math.random() * 10,
                        color: Math.random() < 0.5 ? "#c084fc" : "#38bdf8",
                        size: 2 + Math.random() * 2,
                        type: "spark"
                    });
                }

                let platHit = false;
                if (c.life > 1 && typeof game !== "undefined" && Array.isArray(game.platforms)) {
                    for (let p of game.platforms) {
                        if (!p || p.broken || p.active === false) continue;
                        if (p.isGateButton || p.isGateObstacle || p.isArenaGate || p.isTreeArenaGate || p.isDrawbridge) continue;
                        if (p.x >= 25000) continue;
                        if (c.x >= p.x - 8 && c.x <= p.x + p.w + 8 && c.y >= p.y - 12 && c.y <= p.y + Math.max(30, p.h || 20) + 12) {
                            c.active = false;
                            impactHalloweenComet(c.x, p.y);
                            platHit = true;
                            break;
                        }
                    }
                }

                if (!platHit) {
                    const remDist = Math.hypot(c.targetX - c.x, c.targetY - c.y);
                    if (c.y >= c.targetY || remDist <= 34 || c.life > 45) {
                        c.active = false;
                        impactHalloweenComet(c.targetX, c.targetY);
                    }
                }
            }

            drawHalloweenComet(ctx, c, cameraX, t);

            if (!c.active && c.trail.length === 0) {
                halloweenComets.splice(i, 1);
            }
        }
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
        updateAndDrawHalloweenComets(ctx, cameraX, t);
        if (typeof game !== "undefined" && game.player) {
            drawPlayerParalyzePrism(ctx, game.player, cameraX, t);
        }
    }
    function drawPumpkinEnemy(ctx, x, y, w, h, facing, mouthOpenTimer, isEnraged, t) {
        ctx.save();
        const cx = x + w / 2;
        const cy = y + h / 2;
        
        const hop = Math.abs(Math.sin(t * 0.16)) * 14;
        const isGrounded = hop < 1.5;
        const squishX = isGrounded ? 1.15 : 0.9;
        const squishY = isGrounded ? 0.85 : 1.12;
        
        ctx.translate(cx, cy - hop + (h/2 * (1 - squishY)));
        ctx.scale(squishX, squishY);

        const isAngry = isEnraged || mouthOpenTimer > 0;
        ctx.shadowColor = isAngry ? "#ef4444" : "#f97316";
        ctx.shadowBlur = 15;
        
        const pGrad = ctx.createRadialGradient(0, -h * 0.15, 2, 0, 0, w * 0.55);
        pGrad.addColorStop(0, "#fb923c");
        pGrad.addColorStop(0.5, "#ea580c");
        pGrad.addColorStop(1, "#9a3412");

        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, w * 0.46, h * 0.44, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(124, 45, 18, 0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, w * 0.28, h * 0.43, 0, 0, Math.PI * 2);
        ctx.ellipse(0, 0, w * 0.12, h * 0.44, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.shadowBlur = 0;

        ctx.fillStyle = "#15803d";
        ctx.beginPath();
        ctx.moveTo(-3, -h * 0.42);
        ctx.quadraticCurveTo(-5, -h * 0.65, 6, -h * 0.62);
        ctx.lineTo(4, -h * 0.42);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = "#4ade80";
        ctx.beginPath();
        ctx.ellipse(6, -h * 0.46, 5, 2.5, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        const eyeGlow = Math.sin(t * 0.2) * 0.2 + 0.8;
        ctx.fillStyle = isAngry ? `rgba(255, 60, 60, ${eyeGlow})` : `rgba(254, 240, 138, ${eyeGlow})`;
        ctx.shadowColor = isAngry ? "#ff0000" : "#fef08a";
        ctx.shadowBlur = 12;

        const eyeX1 = -8 + (facing === 1 ? 3 : -3);
        const eyeX2 = 8 + (facing === 1 ? 3 : -3);
        const eyeY = -5;

        ctx.beginPath();
        ctx.moveTo(eyeX1, eyeY - 6); ctx.lineTo(eyeX1 + 5, eyeY + 4); ctx.lineTo(eyeX1 - 5, eyeY + 4);
        ctx.closePath(); ctx.fill();

        ctx.beginPath();
        ctx.moveTo(eyeX2, eyeY - 6); ctx.lineTo(eyeX2 + 5, eyeY + 4); ctx.lineTo(eyeX2 - 5, eyeY + 4);
        ctx.closePath(); ctx.fill();

        ctx.beginPath();
        ctx.moveTo((facing === 1 ? 3 : -3), eyeY + 5);
        ctx.lineTo((facing === 1 ? 6 : 0), eyeY + 9);
        ctx.lineTo((facing === 1 ? 0 : -6), eyeY + 9);
        ctx.closePath(); ctx.fill();

        ctx.beginPath();
        const mY = 11;
        const mOpen = mouthOpenTimer > 0 ? 5 : 0;
        ctx.moveTo(-12, mY - mOpen);
        ctx.lineTo(-7, mY + 4 + mOpen);
        ctx.lineTo(-3, mY + 1 + mOpen);
        ctx.lineTo(0, mY + 6 + mOpen);
        ctx.lineTo(3, mY + 1 + mOpen);
        ctx.lineTo(7, mY + 4 + mOpen);
        ctx.lineTo(12, mY - mOpen);
        ctx.lineTo(8, mY - 2 - mOpen);
        ctx.lineTo(4, mY + 2 - mOpen);
        ctx.lineTo(0, mY - 3 - mOpen);
        ctx.lineTo(-4, mY + 2 - mOpen);
        ctx.lineTo(-8, mY - 2 - mOpen);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
    function drawCrowEnemy(ctx, x, y, w, h, facing, isDiving, t) {
        ctx.save();
        const cx = x + w / 2;
        const cy = y + h / 2;
        
        const diveTilt = isDiving ? facing * 0.5 : 0;
        const bounce = Math.sin(t * 0.3) * 3;
        
        ctx.translate(cx, cy + bounce);
        ctx.rotate(diveTilt);

        ctx.shadowColor = "#4338ca";
        ctx.shadowBlur = 15;
        
        ctx.fillStyle = "#090514";
        ctx.beginPath();
        ctx.ellipse(0, 0, w * .45, h * .35, 0, 0, Math.PI * 2);
        ctx.fill();

        const wingFlap = isDiving ? -5 : Math.sin(t * .4) * 16;
        ctx.fillStyle = "#1e1b4b";
        ctx.beginPath();
        ctx.moveTo(-6, -2);
        ctx.quadraticCurveTo(-facing * 20, -18 - wingFlap, -facing * 28, 2 - wingFlap);
        ctx.lineTo(-6, 8);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = "#312e81";
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(-6,0); ctx.lineTo(-facing*20, -10 - wingFlap*0.8); ctx.stroke();

        const headX = facing * 12;
        const headY = -6;
        ctx.fillStyle = "#020617";
        ctx.beginPath();
        ctx.arc(headX, headY, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ef4444";
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(headX + facing * 3, headY - 2, 2.5, 1.5, facing*0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.moveTo(headX + facing * 6, headY - 2);
        ctx.lineTo(headX + facing * 18, headY + 2);
        ctx.lineTo(headX + facing * 6, headY + 4);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.moveTo(-facing * 12, 2);
        ctx.lineTo(-facing * 24, 12);
        ctx.lineTo(-facing * 16, -2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
    function drawWitchEnemy(ctx, x, y, w, h, facing, t) {
        ctx.save();
        const cx = x + w / 2;
        const cy = y + h / 2;
        
        const floatY = Math.sin(t * 0.15) * 12;
        const tilt = Math.cos(t * 0.1) * 0.15 - (facing*0.1);
        
        ctx.translate(cx, cy + floatY);
        ctx.rotate(tilt);

        ctx.shadowColor = "#a855f7";
        ctx.shadowBlur = 20;

        ctx.fillStyle = "rgba(168, 85, 247, 0.5)";
        for(let p=0; p<6; p++) {
            ctx.beginPath();
            ctx.arc(-facing*(30 + Math.random()*20), 10 + Math.random()*15, Math.random()*4+1, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.fillStyle = "#ffffff";
        for(let p=0; p<3; p++) {
            ctx.fillRect(-facing*(20 + Math.random()*30), 5 + Math.random()*15, 2, 2);
        }

        const broomY = 10;
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 4.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-facing * 35, broomY + 4);
        ctx.lineTo(facing * 35, broomY - 4);
        ctx.stroke();
        
        ctx.fillStyle = "#a855f7";
        ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(facing * 35, broomY - 4, 3.5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#ffffff"; ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.arc(facing * 35, broomY - 4, 1.5, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = "#d97706";
        ctx.beginPath();
        const bEndX = -facing * 30;
        ctx.moveTo(bEndX, broomY + 2);
        ctx.lineTo(bEndX - facing * 20, broomY - 10 + Math.sin(t*0.5)*3);
        ctx.quadraticCurveTo(bEndX - facing * 25, broomY + 5, bEndX - facing * 20, broomY + 18 - Math.sin(t*0.5)*3);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#92400e";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bEndX, broomY+2); ctx.lineTo(bEndX - facing*18, broomY-5);
        ctx.moveTo(bEndX, broomY+2); ctx.lineTo(bEndX - facing*19, broomY+12);
        ctx.stroke();

        const dressWave1 = Math.sin(t * 0.3) * 6;
        const dressWave2 = Math.cos(t * 0.25) * 8;
        
        const dressGrad = ctx.createLinearGradient(0, -15, 0, broomY);
        dressGrad.addColorStop(0, "#581c87");
        dressGrad.addColorStop(1, "#3b0764");
        ctx.fillStyle = dressGrad;
        
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.quadraticCurveTo(facing*18, broomY - 5, facing * (12 + dressWave1*0.5), broomY - 2);
        ctx.lineTo(facing * 5, broomY + 5 + dressWave1);
        ctx.lineTo(-facing * 5, broomY - 2 + dressWave2);
        ctx.lineTo(-facing * 16, broomY + 8 + dressWave1);
        ctx.quadraticCurveTo(-facing*15, -5, 0, -12);
        ctx.closePath();
        ctx.fill();

        const headY = -18;
        ctx.fillStyle = "#86efac";
        ctx.beginPath();
        ctx.arc(0, headY, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#022c22";
        ctx.beginPath();
        ctx.moveTo(facing * 3, headY + 3);
        ctx.quadraticCurveTo(facing * 6, headY + 8 + Math.abs(Math.sin(t*0.5)*4), facing * 10, headY + 4);
        ctx.quadraticCurveTo(facing * 6, headY + 2, facing * 3, headY + 3);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(facing * 6, headY + 3, 2, 2);

        ctx.fillStyle = "#4ade80";
        ctx.beginPath();
        ctx.moveTo(facing * 6, headY - 3);
        ctx.quadraticCurveTo(facing * 18, headY - 2, facing * 18, headY + 5);
        ctx.quadraticCurveTo(facing * 12, headY + 6, facing * 6, headY + 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#166534";
        ctx.beginPath(); ctx.arc(facing*14, headY+3, 1.5, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = "#fbbf24";
        ctx.shadowColor = "#fef08a";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(facing * 4, headY - 5, 3.5, 2.5, facing*0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#b45309";
        ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.arc(facing*5, headY-5, 1.5, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = "#064e3b";
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(facing*1, headY-8); ctx.lineTo(facing*7, headY-5); ctx.stroke();

        ctx.fillStyle = "#1e1b4b";
        ctx.beginPath();
        ctx.ellipse(0, headY - 9, 28, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        
        const hatFlop = Math.sin(t * 0.2) * 15;
        ctx.beginPath();
        ctx.moveTo(-14, headY - 10);
        ctx.quadraticCurveTo(-facing * 10, headY - 35, -facing * (28 + hatFlop), headY - 45 + Math.abs(hatFlop*0.5));
        ctx.quadraticCurveTo(facing * 5, headY - 25, 14, headY - 10);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = "#111827";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-6, headY - 15); ctx.lineTo(8, headY - 20); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, headY - 22); ctx.lineTo(4, headY - 28); ctx.stroke();

        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.ellipse(0, headY - 12, 14, 5, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(facing * 2 - 4, headY - 15, 8, 8);
        ctx.fillStyle = "#1e1b4b";
        ctx.fillRect(facing * 2 - 1.5, headY - 12.5, 3, 3);

        ctx.restore();
    }
    function drawHoodedEnemy(ctx, x, y, w, h, facing, t) {
        ctx.save();
        const cx = x + w / 2;
        const cy = y + h / 2;
        
        const floatY = Math.sin(t * 0.1) * 8 + Math.cos(t * 0.15) * 4;
        const squishX = 1 - Math.sin(t * 0.1) * 0.05;
        const squishY = 1 + Math.sin(t * 0.1) * 0.05;
        
        ctx.translate(cx, cy + floatY);
        ctx.scale(squishX, squishY);

        ctx.shadowColor = "#7e22ce";
        ctx.shadowBlur = 20;

        ctx.fillStyle = "rgba(168, 85, 247, 0.6)";
        ctx.shadowBlur = 10;
        for(let r=0; r<5; r++) {
            const rPhase = t*0.03 + r*(Math.PI*2/5);
            const rx = Math.cos(rPhase)*22;
            const ry = Math.sin(rPhase)*18 + 5;
            const rtilt = rPhase*2;
            
            ctx.save();
            ctx.translate(rx, ry);
            ctx.rotate(rtilt);
            ctx.beginPath();
            ctx.moveTo(0, -6); ctx.lineTo(3, 0); ctx.lineTo(0, 6); ctx.lineTo(-3, 0);
            ctx.moveTo(-4, -2); ctx.lineTo(4, -2);
            ctx.stroke();
            ctx.restore();
        }
        ctx.shadowBlur = 15;

        const tGrad = ctx.createLinearGradient(0, -h/2, 0, h/2);
        tGrad.addColorStop(0, "#4c1d95");
        tGrad.addColorStop(0.5, "#2e1065");
        tGrad.addColorStop(1, "#0f172a");
        ctx.fillStyle = tGrad;
        
        ctx.beginPath();
        ctx.moveTo(0, -h/2 + 8);
        const wave1 = Math.sin(t*0.2)*4;
        const wave2 = Math.cos(t*0.2)*4;
        const hemY = h/2 - 2;
        ctx.lineTo(w*.45 + wave1, hemY);
        ctx.lineTo(-w*.45 + wave2, hemY);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = "rgba(2, 6, 23, 0.6)";
        ctx.beginPath(); ctx.moveTo(0, -10); ctx.quadraticCurveTo(-5, 0, -8+wave2, hemY); ctx.lineTo(-12+wave2, hemY); ctx.fill();
        ctx.beginPath(); ctx.moveTo(0, -10); ctx.quadraticCurveTo(5, 0, 8+wave1, hemY); ctx.lineTo(12+wave1, hemY); ctx.fill();

        ctx.fillStyle = "#05010a";
        ctx.beginPath();
        for(let tx = -w*.45; tx <= w*.45; tx += 5) {
            ctx.moveTo(tx, hemY+2);
            ctx.lineTo(tx + 2, hemY - Math.random()*8 - 2);
            ctx.lineTo(tx + 4, hemY+2);
        }
        ctx.fill();

        ctx.fillStyle = "#020617";
        ctx.beginPath();
        ctx.arc(facing * 2, -h/2 + 15, 12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = "rgba(88, 28, 135, 0.5)";
        ctx.lineWidth = 1;
        for(let tn=0; tn<4; tn++) {
            ctx.beginPath();
            ctx.moveTo(facing*2, -h/2 + 10);
            ctx.quadraticCurveTo(facing*2 + (Math.random()-0.5)*10, -h/2+15 + (Math.random()-0.5)*10, facing*2 + (Math.random()-0.5)*8, -h/2+20);
            ctx.stroke();
        }

        ctx.fillStyle = "#3b0764";
        ctx.beginPath();
        ctx.moveTo(-16, -h/2 + 18);
        ctx.quadraticCurveTo(0, -h/2 - 12, 16, -h/2 + 18);
        ctx.quadraticCurveTo(0, -h/2 + 4, -16, -h/2 + 18);
        ctx.fill();
        
        const tipSway = Math.sin(t*0.1)*3;
        ctx.beginPath();
        ctx.moveTo(-16, -h/2 + 18);
        ctx.quadraticCurveTo(-22, -h/2 + 28, -8 + tipSway, -h/2 + 20);
        ctx.fill();
        
        ctx.strokeStyle = "#1e1b4b";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-12, -h/2 + 12); ctx.lineTo(-2, -h/2 + 4); ctx.stroke();

        ctx.fillStyle = "#ef4444";
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 15;
        const eDir = facing === 1 ? 4 : -4;
        ctx.beginPath();
        ctx.ellipse(eDir - 4, -h/2 + 15, 2.5, 1.5, facing*0.2, 0, Math.PI * 2);
        ctx.ellipse(eDir + 4, -h/2 + 15, 2.5, 1.5, facing*0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff"; ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.arc(eDir - 3.5, -h/2 + 15, 0.8, 0, Math.PI*2); ctx.arc(eDir + 4.5, -h/2 + 15, 0.8, 0, Math.PI*2); ctx.fill();

        const orbX = facing * 20;
        const orbY = 2 + Math.sin(t * .2) * 5;
        
        ctx.fillStyle = "#000000";
        ctx.shadowColor = "#c084fc";
        ctx.shadowBlur = 25 + Math.sin(t*0.3)*15;
        ctx.beginPath();
        ctx.arc(orbX, orbY, 7, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = "rgba(216, 180, 254, 0.8)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(orbX, orbY, 12, 3, t*0.1, 0, Math.PI*2);
        ctx.stroke();
        
        ctx.fillStyle = `rgba(216, 180, 254, ${Math.sin(t*0.5)*0.5 + 0.5})`;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(orbX, orbY, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
    function drawGhostEnemy(ctx, x, y, w, h, facing, isDashing, dashCooldown, t) {
        ctx.save();
        const cx = x + w / 2;
        const cy = y + h / 2;
        const isHorror = !!window.postGameHorror;
        const isPreparing = dashCooldown > 0 && dashCooldown < 35;
        
        const floatY = Math.sin(t * 0.2) * 4;
        const squishX = isDashing ? 1.4 : isPreparing ? 0.8 : 1 + Math.sin(t*0.1)*0.05;
        const squishY = isDashing ? 0.6 : isPreparing ? 1.2 : 1 - Math.sin(t*0.1)*0.05;
        const tilt = isDashing ? facing * 0.4 : Math.cos(t * 0.1) * 0.1;

        ctx.translate(cx, cy + floatY);
        ctx.scale(squishX, squishY);
        ctx.rotate(tilt);

        if (isHorror) {
            ctx.shadowColor = isPreparing || isDashing ? "#ff0000" : "#7f1d1d";
            ctx.shadowBlur = isDashing ? 30 : 20;
            ctx.fillStyle = isDashing ? "rgba(100, 10, 10, 0.95)" : "rgba(35, 10, 15, 0.9)";
        } else {
            ctx.shadowColor = isPreparing ? "#ef4444" : isDashing ? "#f43f5e" : "#c084fc";
            ctx.shadowBlur = isDashing ? 28 : 18;
            ctx.fillStyle = isDashing ? "rgba(254, 205, 211, 0.9)" : "rgba(233, 213, 255, 0.85)";
        }
        
        ctx.beginPath();
        ctx.arc(0, -h/2 + 6, w * .4, Math.PI, 0, false);
        const tailWave1 = Math.sin(t * .3) * 6;
        const tailWave2 = Math.cos(t * .25) * 8;
        const tailWave3 = Math.sin(t * .35) * 5;
        
        ctx.lineTo(w * .4, h/2 - 4 + tailWave1);
        ctx.quadraticCurveTo(w * .2, h/2 - 12, w * .1, h/2 + tailWave2);
        ctx.quadraticCurveTo(-w * .1, h/2 - 12, -w * .2, h/2 + tailWave3);
        ctx.quadraticCurveTo(-w * .3, h/2 - 12, -w * .4, h/2 - 4 - tailWave1);
        ctx.closePath();
        ctx.fill();

        if (isDashing) {
            ctx.fillStyle = isHorror ? "rgba(255,0,0,0.3)" : "rgba(255,255,255,0.4)";
            for(let g=0; g<4; g++) {
                ctx.beginPath();
                ctx.arc(-facing*w*(0.5 + g*0.3), (Math.random()-0.5)*h, Math.random()*5+2, 0, Math.PI*2);
                ctx.fill();
            }
        }

        const eyeX = facing * 4;
        if (isHorror) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(eyeX - 8, -h/2 + 4, 5.5, 0, Math.PI * 2);
            ctx.arc(eyeX + 8, -h/2 + 4, 5.5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = "#991b1b";
            ctx.beginPath();
            ctx.arc(eyeX - 8 + facing * 2, -h/2 + 4, 2, 0, Math.PI * 2);
            ctx.arc(eyeX + 8 + facing * 2, -h/2 + 4, 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.ellipse(eyeX, 2, 5.5, isDashing || isPreparing ? 12 : 7, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = "#fef08a";
            ctx.beginPath();
            ctx.moveTo(eyeX - 5, -1); ctx.lineTo(eyeX - 2, 5); ctx.lineTo(eyeX, -1);
            ctx.moveTo(eyeX, -1); ctx.lineTo(eyeX + 2, 5); ctx.lineTo(eyeX + 5, -1);
            ctx.fill();
            
            ctx.fillStyle = "#dc2626";
            ctx.fillRect(eyeX - 8, -h/2 + 8, 2, 8);
            ctx.fillRect(eyeX + 6, -h/2 + 8, 2, 8);
        } else {
            if (isPreparing || isDashing) {
                ctx.fillStyle = "#ef4444";
                ctx.shadowColor = "#ef4444";
                ctx.shadowBlur = 15;
            } else {
                ctx.shadowBlur = 0;
                ctx.fillStyle = "#1e1b4b";
            }
            ctx.beginPath();
            if (isPreparing || isDashing) {
                ctx.ellipse(eyeX - 6, -h/2 + 4, 3, 4, -facing*0.2, 0, Math.PI * 2);
                ctx.ellipse(eyeX + 6, -h/2 + 4, 3, 4, facing*0.2, 0, Math.PI * 2);
            } else {
                ctx.arc(eyeX - 6, -h/2 + 4, 3.5, 0, Math.PI * 2);
                ctx.arc(eyeX + 6, -h/2 + 4, 3.5, 0, Math.PI * 2);
            }
            ctx.fill();
            
            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.ellipse(eyeX, 2, 4, isDashing ? 9 : isPreparing ? 6 : 4, 0, 0, Math.PI * 2);
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
        drawGhostEnemy: drawGhostEnemy,
        getRebornGhosts: function() { return rebornGhosts; },
        takeGhostDamage: takeGhostDamage
    };
    window.initHalloweenLevel = initHalloweenLevel;
    window.stopHalloweenAudio = stopHalloweenAudio;
    window.applyParalyzeEffect = applyParalyzeEffect;
    window.onHalloweenEnemyDied = onHalloweenEnemyDied;
    window.drawPlayerParalyzePrism = drawPlayerParalyzePrism;
    window.updateAndDrawHalloween = updateAndDrawHalloween;
})();
