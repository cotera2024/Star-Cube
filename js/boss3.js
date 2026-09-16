function updateAndDrawYellowSquare(ctx, cameraX, time) {
    if (currentLevel !== 2 || !game.yellowSquare) return;
    const ys = game.yellowSquare;
    if (ys.state === "defeated" && ys._defeatDialogShown) return;
    if (!game.player) return;
    function triggerValkyrie() {
        if (ys._bossDialogStarted) return;
        if (game.valkBossDefeated) return;
        ys._bossDialogStarted = true;
        game.arenaLocked = true;
        game.arenaMinX = 18300;
        game.arenaMaxX = 19100;
        game.player.frozen = true;
        game.player.vx = 0;
        applyShake(25);
        if (currentBGM) {
            currentBGM.pause();
            currentBGM.currentTime = 0;
        }
        playSFX("sfx_boss3_entry");
        game.flash = 35;
        game.glitchT = 50;
        playSound(100, .6, "sawtooth", .45, 30);
        const spawnValkyrie = function() {
            showAnimatedDialogue(__("ui_speaker_system"), "⚙️", __("dlg_valkyrie_intro"), function() {
                if (typeof window.playBossPresentation === "function") {
                    window.playBossPresentation({
                        name: __("boss_name_3") || "VALKYRIE CENTINELA",
                        title: __("boss_title_3") || "PROTOCOLO DE EXTERMINIO Y FUEGO",
                        icon: "💣",
                        themeColor: "#ff4400",
                        accentColor: "#ffd700",
                        targetX: 18700,
                        targetY: 150,
                        zoom: 1.45,
                        duration: 2.8
                    }, function() {
                        try {
                            if (window.ValkyrieBoss) window.ValkyrieBoss.trigger();
                        } catch (e) {}
                        delete game.cameraOverrideX;
                        game.player.frozen = false;
                    });
                } else {
                    try {
                        if (window.ValkyrieBoss) window.ValkyrieBoss.trigger();
                    } catch (e) {}
                    delete game.cameraOverrideX;
                    game.player.frozen = false;
                }
            }, 3500);
        };
        if (typeof window.closeArenaWithHammers === "function") {
            try {
                window.closeArenaWithHammers._busyUntil = 0;
            } catch (e) {}
            try {
                if (Array.isArray(game.platforms)) {
                    game.platforms.forEach(function(gp) {
                        if (gp.isArenaGate) {
                            try {
                                gsap.killTweensOf(gp);
                            } catch (e) {}
                        }
                    });
                }
            } catch (e) {}
            window.closeArenaWithHammers(function() {
                delete game.cameraOverrideX;
                spawnValkyrie();
            });
        } else {
            spawnValkyrie();
        }
    }
    if (ys.state === "trapped") {
        const guards = game.enemies.filter(e => e.isGuard && e.active);
        ys.guardsCount = guards.length;
        if (ys.guardsCount === 0) {
            ys.state = "rescued";
            ys.dialogTimer = 180;
            playSound(600, .3, "sine", .2, 1200);
            addFloatingText(ys.x, ys.y - 30, __("flt_libre"), "#ffff00", 22);
        }
    }
    if (ys.state === "rescued") {
        const targetX = game.player.x + 35;
        const targetY = game.player.y;
        ys.x += (targetX - ys.x) * .1;
        ys.y += (targetY - ys.y) * .1;
        if (Math.abs(ys.x - targetX) < 25 && !ys._thanksTriggered) {
            ys._thanksTriggered = true;
            ys.state = "dialog_thanks";
            showAnimatedDialogue(__("ui_speaker_yellow_square"), "🟡", __("lvl3_thanks"), () => {
                ys.state = "following";
            });
        }
    }
    if (ys.state === "following") {
        const targetX = game.player.x - game.player.facing * 35;
        const targetY = game.player.y - 18 + Math.sin(time * .08) * 6;
        ys.x += (targetX - ys.x) * .12;
        ys.y += (targetY - ys.y) * .12;
        ys.shootTimer = (ys.shootTimer || 0) + 1;
        if (ys.shootTimer >= 35) {
            ys.shootTimer = 0;
            let nearestEnemy = null;
            let minDist = 450;
            for (let e of game.enemies) {
                if (!e.active || e.health <= 0 || e.isObstacle) continue;
                const d = Math.hypot(e.x + e.w / 2 - ys.x, e.y + e.h / 2 - ys.y);
                if (d < minDist) {
                    minDist = d;
                    nearestEnemy = e;
                }
            }
            if (!nearestEnemy && window.ValkyrieBoss && window.ValkyrieBoss.state === "fight" && window.ValkyrieBoss.boss) {
                const vbx = window.ValkyrieBoss.ARENA_X;
                const vby = window.ValkyrieBoss.BOSS_Y;
                const vd = Math.hypot(vbx - ys.x, vby - ys.y);
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
                const angle = Math.atan2(ey - ys.y, ex - ys.x);
                projectiles.push({
                    x: ys.x,
                    y: ys.y,
                    w: 12,
                    h: 12,
                    vx: Math.cos(angle) * 12,
                    vy: Math.sin(angle) * 12,
                    color: "#ffff00",
                    isCompanion: true,
                    damage: 30,
                    trail: []
                });
                playSound(800, .1, "sine", .15, 1200);
            }
        }
        if (game.player.x >= 18400 && !ys._bossDialogStarted) {
            triggerValkyrie();
        }
    } else if (ys.state === "invisible") {
        if (game.player.x >= 18400 && !ys._bossDialogStarted) {
            triggerValkyrie();
        }
    }
    if (ys.state === "boss_transform") {
        ys.transformTimer--;
        const progress = 1 - ys.transformTimer / 180;
        ys.w = 24 + (90 - 24) * progress;
        ys.h = 24 + (90 - 24) * progress;
        applyShake(3 + progress * 8);
        game.flash = Math.max(game.flash, 5 + progress * 15);
        if (ys.transformTimer <= 0) {
            ys.state = "boss_fight";
            ys.isBoss = true;
            ys.w = 90;
            ys.h = 90;
            ys.health = 50;
            ys.maxHealth = 50;
            applyShake(30);
            game.flash = 40;
            game.glitchT = 60;
        }
    }
    if (ys.state === "boss_fight") {
        const isSupernova = ys.health <= ys.maxHealth * .4;
        if (ys._dashPendingDmg) {
            const d = ys._dashPendingDmg;
            ys._dashPendingDmg = 0;
            ys.health -= d;
            ys.hitFlash = 10;
            addFloatingText(ys.x + ys.w / 2, ys.y - 12, "⚡-" + d + " ⚡", "#ff00e0", 22);
            playSound(700, .18, "square", .25, 400);
            try {
                applyShake(6);
            } catch (e) {}
            try {
                createExplosion(ys.x + ys.w / 2, ys.y + ys.h / 2, "#ff8800", 26, 16, [ "#ff8800", "#ffffff", "#ffff00" ]);
            } catch (e) {}
            if (ys.health <= 0) {
                ys.state = "defeated";
                ys._defeatTimer = 60;
                game.arenaLocked = false;
                stopAllSFX();
                playBGM("bgm_world3_volcano");
                applyShake(30);
                game.flash = 40;
                game.glitchT = 60;
                playSound(80, .8, "sawtooth", .5, 30);
                addFloatingText(game.player.x, game.player.y - 60, __("flt_jefe_derrotado"), "#00ff00", 30);
            }
        }
        const moveSpeed = isSupernova ? .05 : .03;
        ys.x = cameraX + VIEW_W / 2 - ys.w / 2 + Math.sin(time * moveSpeed) * (isSupernova ? 240 : 200);
        ys.y = 130 + Math.cos(time * moveSpeed * 2) * (isSupernova ? 60 : 40);
        if (Math.floor(time) % 30 === 0) {
            game.flash = Math.max(game.flash, isSupernova ? 8 : 4);
            game.glitchT = Math.max(game.glitchT, 8);
        }
        ys.bossShootTimer = (ys.bossShootTimer || 0) + 1;
        const shootFreq = isSupernova ? 50 : 75;
        if (ys.bossShootTimer >= shootFreq) {
            ys.bossShootTimer = 0;
            const px = game.player.x + game.player.w / 2;
            const py = game.player.y + game.player.h / 2;
            const bx = ys.x + ys.w / 2;
            const by = ys.y + ys.h / 2;
            const angle = Math.atan2(py - by, px - bx);
            const spreads = isSupernova ? [ -.4, -.2, 0, .2, .4 ] : [ -.3, 0, .3 ];
            for (let spread of spreads) {
                enemyProjectiles.push({
                    x: bx,
                    y: by,
                    w: 48,
                    h: 48,
                    radius: 24,
                    vx: Math.cos(angle + spread) * (isSupernova ? 7.5 : 6),
                    vy: Math.sin(angle + spread) * (isSupernova ? 7.5 : 6),
                    color: "#ff4400",
                    isGiant: true,
                    isFireball: true,
                    damage: 20,
                    trail: []
                });
            }
            playSound(140, .3, "square", .3, 40);
        }
        if (isSupernova) {
            ys.meteorTimer = (ys.meteorTimer || 0) + 1;
            if (ys.meteorTimer >= 140) {
                ys.meteorTimer = 0;
                addFloatingText(VIEW_W / 2, 170, __("flt_lluvia_meteoros"), "#ff4400", 26);
                for (let m = 0; m < 4; m++) {
                    const mx = cameraX + 100 + Math.random() * (VIEW_W - 200);
                    enemyProjectiles.push({
                        x: mx,
                        y: -40,
                        w: 36,
                        h: 36,
                        radius: 18,
                        vx: (Math.random() - .5) * 2,
                        vy: 6 + Math.random() * 3,
                        color: "#ff2200",
                        isGiant: true,
                        isFireball: true,
                        damage: 18
                    });
                }
                playSound(80, .6, "sawtooth", .5, 30);
            }
        }
    }
    const drawX = ys.x - cameraX;
    const drawY = ys.y;
    if (!ys.isBoss && ys.state !== "invisible") {
        ctx.save();
        ctx.shadowColor = "#ffff00";
        ctx.shadowBlur = 6;
        ctx.fillStyle = "#ffea00";
        ctx.beginPath();
        ctx.roundRect(drawX, drawY, ys.w, ys.h, 4);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#000";
        if (ys.state === "trapped") {
            ctx.beginPath();
            ctx.arc(drawX + 6, drawY + 8, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(drawX + 18, drawY + 8, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(drawX + 8, drawY + 16, 8, 2);
        } else {
            ctx.beginPath();
            ctx.arc(drawX + 6, drawY + 9, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(drawX + 18, drawY + 9, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(drawX + 12, drawY + 13, 3.5, 0, Math.PI);
            ctx.stroke();
        }
        ctx.restore();
        if (ys.state === "trapped") {
            ctx.save();
            ctx.fillStyle = "#ffffff";
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 2;
            const text = __("lvl3_help");
            ctx.font = 'bold 14px "Fredoka One", cursive, sans-serif';
            const tw = ctx.measureText(text).width + 16;
            const bx = drawX + ys.w / 2 - tw / 2;
            const by = drawY - 30;
            ctx.beginPath();
            ctx.roundRect(bx, by, tw, 22, 6);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#ff0000";
            ctx.fillText(text, bx + 8, by + 16);
            ctx.restore();
        }
    } else if (ys.isBoss) {
        ctx.save();
        const isSupernova = ys.health <= ys.maxHealth * .4;
        const flameCount = 12;
        ctx.fillStyle = isSupernova ? "#ffff00" : "#ff4400";
        ctx.shadowColor = "#ff3300";
        ctx.shadowBlur = isSupernova ? 20 : 13;
        for (let f = 0; f < flameCount; f++) {
            const angle = f * Math.PI * 2 / flameCount + Math.sin(time * .1 + f) * .2;
            const dist = ys.w / 2 + 8 + Math.sin(time * .15 + f * 2) * 10;
            const fx = drawX + ys.w / 2 + Math.cos(angle) * dist;
            const fy = drawY + ys.h / 2 + Math.sin(angle) * dist;
            ctx.beginPath();
            ctx.arc(fx, fy, isSupernova ? 12 : 8, 0, Math.PI * 2);
            ctx.fill();
        }
        if (ys.hitFlash && ys.hitFlash > 0) {
            ys.hitFlash--;
            ctx.fillStyle = "#ffffff";
        } else {
            const grad = ctx.createRadialGradient(drawX + ys.w / 2, drawY + ys.h / 2, 5, drawX + ys.w / 2, drawY + ys.h / 2, ys.w * .55);
            grad.addColorStop(0, isSupernova ? "#ffffff" : "#ffff00");
            grad.addColorStop(.5, "#ff4400");
            grad.addColorStop(1, "#4a0000");
            ctx.fillStyle = grad;
        }
        ctx.fillRect(drawX, drawY, ys.w, ys.h);
        ctx.strokeStyle = isSupernova ? "#ffffff" : "#ffea00";
        ctx.lineWidth = 4;
        ctx.strokeRect(drawX, drawY, ys.w, ys.h);
        ctx.fillStyle = isSupernova ? "#ff0000" : "#ff2200";
        ctx.shadowColor = "#ffff00";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(drawX + 18, drawY + 24);
        ctx.lineTo(drawX + 38, drawY + 34);
        ctx.lineTo(drawX + 18, drawY + 36);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(drawX + ys.w - 18, drawY + 24);
        ctx.lineTo(drawX + ys.w - 38, drawY + 34);
        ctx.lineTo(drawX + ys.w - 18, drawY + 36);
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.fillRect(drawX + 22, drawY + 54, ys.w - 44, 20);
        ctx.fillStyle = "#ffaa00";
        for (let t = 0; t < 5; t++) {
            ctx.fillRect(drawX + 25 + t * 8, drawY + 54, 4, 10);
        }
        ctx.restore();
        ctx.save();
        const barW = 360, barH = 22;
        const barX = VIEW_W / 2 - barW / 2;
        const barY = 28;
        ctx.fillStyle = "rgba(0, 0, 0, 0.88)";
        ctx.fillRect(barX - 5, barY - 5, barW + 10, barH + 10);
        ctx.strokeStyle = isSupernova ? "#ffff00" : "#ff3300";
        ctx.lineWidth = 2.5;
        ctx.strokeRect(barX - 5, barY - 5, barW + 10, barH + 10);
        const hpPercent = Math.max(0, ys.health / ys.maxHealth);
        ctx.fillStyle = isSupernova ? "#ffea00" : "#ff2200";
        ctx.fillRect(barX, barY, barW * hpPercent, barH);
        ctx.fillStyle = "#ffffff";
        ctx.font = 'bold 13px "Courier Prime", monospace';
        ctx.textAlign = "center";
        ctx.fillText(__("ui_boss_fire_hp", ys.health, ys.maxHealth), VIEW_W / 2, barY + 15);
        ctx.restore();
    }
    if (ys.state === "defeated" && ys._defeatTimer > 0) {
        ys._defeatTimer--;
        const progress = ys._defeatTimer / 60;
        const scale = progress * .8 + .2;
        const dw = ys.w * scale;
        const dh = ys.h * scale;
        const dx2 = ys.x + ys.w / 2 - dw / 2 - cameraX;
        const dy2 = ys.y + ys.h / 2 - dh / 2;
        ctx.save();
        ctx.globalAlpha = progress;
        ctx.fillStyle = "#ff4400";
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur = 15 * progress;
        ctx.fillRect(dx2, dy2, dw, dh);
        ctx.shadowBlur = 0;
        if (Math.random() < .3) {
            particles.push({
                x: ys.x + ys.w / 2 + (Math.random() - .5) * ys.w,
                y: ys.y + ys.h / 2 + (Math.random() - .5) * ys.h,
                vx: (Math.random() - .5) * 6,
                vy: -Math.random() * 6 - 2,
                life: 15 + Math.random() * 10,
                color: [ "#ff4400", "#ffaa00", "#ffffff" ][Math.floor(Math.random() * 3)],
                size: 4 + Math.random() * 6,
                type: "spark"
            });
        }
        ctx.restore();
        if (ys._defeatTimer <= 0) {
            ys.isBoss = false;
            ys.w = 0;
            ys.h = 0;
        }
    }
}
// Isaac Daniel Cotera - 2026 | Correo: isaacdanielcotera@gmail.com | Itch.io: https://cotera.itch.io | GitHub: https://github.com/cotera2024
