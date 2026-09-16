function cinema(cb) {
    var tok = typeof CINEMA_TOKEN !== "undefined" ? CINEMA_TOKEN : 0;
    return function() {
        if (typeof CINEMA_TOKEN === "undefined" || CINEMA_TOKEN !== tok) return;
        if (cb) return cb.apply(this, arguments);
    };
}

function updateAndDrawBlueSquare(ctx, cameraX, time) {
    if (currentLevel !== 0 || !game.blueSquare || game.subCaveMode) return;
    const bs = game.blueSquare;
    if (bs.state === "defeated" && bs._defeatDialogShown) return;
    if (!game.player) return;
    const dist = Math.hypot(game.player.x + game.player.w / 2 - (bs.x + bs.w / 2), game.player.y + game.player.h / 2 - (bs.y + bs.h / 2));
    const entranceGate = game.platforms.find(p => p.isArenaGate === "entrance");
    const exitGate = game.platforms.find(p => p.isArenaGate === "exit");
    if (bs.state === "sweating" && dist < 160 && !game.player.frozen) {
        bs.state = "dialog_help";
        game.player.frozen = true;
        showAnimatedDialogue(__("ui_speaker_blue_square"), "🔷", __("dlg_cuadro_azul_pide_ayuda"), cinema(() => {
            const buttonPlat = game.platforms.find(p => p.button);
            if (buttonPlat && typeof gsap !== "undefined") {
                gsap.to(game, {
                    cameraOverrideX: buttonPlat.x - VIEW_W / 2 + buttonPlat.w / 2,
                    duration: 1,
                    ease: "power2.inOut",
                    onComplete: cinema(() => {
                        setTimeout(cinema(() => {
                            gsap.to(game, {
                                cameraOverrideX: game.player.x - VIEW_W / 2,
                                duration: .9,
                                ease: "power2.inOut",
                                onComplete: cinema(() => {
                                    delete game.cameraOverrideX;
                                    bs.state = "waiting_button";
                                    game.player.frozen = false;
                                })
                            });
                        }), 1e3);
                    })
                });
            } else {
                bs.state = "waiting_button";
                game.player.frozen = false;
            }
        }));
    }
    if (!game.subCaveMode && (bs.state === "sweating" || bs.state === "waiting_button") && exitGate && entranceGate && !game.player.frozen && !game.arenaLocked && !bs._exitGuardBusy && game.player.x >= entranceGate.x && game.player.x + game.player.w > exitGate.x - 30 && game.player.x < exitGate.x + 200) {
        bs._exitGuardBusy = true;
        game.player.frozen = true;
        game.player.vx = 0;
        playSound(660, .25, "triangle", .3, 880);
        if (typeof gsap !== "undefined") {
            gsap.to(game, {
                cameraOverrideX: bs.x - VIEW_W / 2 + bs.w / 2,
                duration: .9,
                ease: "power2.inOut",
                onComplete: cinema(() => {
                    showAnimatedDialogue(__("ui_speaker_blue_square"), "🔷", __("dlg_cuadro_azul_pide_ayuda"), cinema(() => {
                        game.player.x = exitGate.x - 1e3;
                        game.player.y = 500 - game.player.h;
                        game.player.vx = 0;
                        game.player.vy = 0;
                        gsap.to(game, {
                            cameraOverrideX: game.player.x - VIEW_W / 2,
                            duration: .9,
                            ease: "power2.inOut",
                            onComplete: cinema(() => {
                                delete game.cameraOverrideX;
                                bs._exitGuardBusy = false;
                                game.player.frozen = false;
                            })
                        });
                    }));
                })
            });
        } else {
            game.player.x = exitGate.x - 1e3;
            game.player.y = 500 - game.player.h;
            bs._exitGuardBusy = false;
            game.player.frozen = false;
        }
    }
    if (bs.state === "waiting_button") {
        const buttonPlat = game.platforms.find(p => p.button);
        if (buttonPlat) {
            const px = game.player.x + game.player.w / 2;
            const py = game.player.y + game.player.h;
            if (px > buttonPlat.x && px < buttonPlat.x + buttonPlat.w && py >= buttonPlat.y && py <= buttonPlat.y + buttonPlat.h + 6 && game.player.onGround) {
                bs.state = "button_pressed";
                game.player.frozen = true;
                game.iceMode = true;
                game.platforms.forEach(p => {
                    p.broken = false;
                    p.jumpHits = 0;
                });
                applyShake(15);
                game.flash = 20;
                playSound(1200, .5, "sine", .4, 300);
                const startMock = cinema(() => {
                    if (typeof gsap !== "undefined") {
                        gsap.to(game, {
                            cameraOverrideX: bs.x - VIEW_W / 2 + bs.w / 2,
                            duration: 1,
                            ease: "power2.inOut",
                            onComplete: cinema(() => {
                                showAnimatedDialogue(__("ui_speaker_blue_square"), "😈", "¡Jajaja! ¿Creíste que te pedía ayuda? ¡El frío es mi poder absoluto!", cinema(() => {
                                    bs.state = "boss_transform";
                                    bs.transformTimer = 75;
                                    playSound(150, .5, "sawtooth", .4, 40);
                                }), 2800);
                            })
                        });
                    } else {
                        bs.state = "boss_transform";
                        bs.transformTimer = 75;
                        playSound(150, .5, "sawtooth", .4, 40);
                    }
                });
                if (typeof window.closeArenaWithHammers === "function") {
                    window.closeArenaWithHammers(cinema(() => startMock()));
                } else {
                    startMock();
                }
            }
        }
    }
    if (bs.state === "boss_transform") {
        bs.transformTimer--;
        applyShake(7);
        game.flash = Math.max(game.flash, 6);
        bs.w = 28 + (90 - 28) * (1 - bs.transformTimer / 75);
        bs.h = 28 + (90 - 28) * (1 - bs.transformTimer / 75);
        if (bs.transformTimer <= 0) {
            bs.state = "boss_fight";
            bs.isBoss = true;
            bs.w = 90;
            bs.h = 90;
            const baseHp = window.postGameHorror ? 36 : 18;
            bs.health = baseHp;
            bs.maxHealth = baseHp;
            const entranceGateObj = game.platforms.find(p => p.isArenaGate === "entrance");
            const exitGateObj = game.platforms.find(p => p.isArenaGate === "exit");
            game.arenaLocked = true;
            game.arenaMinX = entranceGateObj ? entranceGateObj.x + entranceGateObj.w : 16550 + 90;
            game.arenaMaxX = exitGateObj ? exitGateObj.x : 19200;
            game.platforms.forEach(p => {
                if (p.moving) {
                    p.unbreakable = true;
                    p.broken = false;
                }
            });
            if (typeof window.playBossPresentation === "function") {
                window.playBossPresentation({
                    name: __("boss_name_1") || "CUADRITO AZUL",
                    title: __("boss_title_1") || "TITÁN DEL PÁRAMO GLACIAL",
                    icon: "❄️",
                    themeColor: "#00e5ff",
                    accentColor: "#ffffff",
                    targetX: bs.x + bs.w / 2,
                    targetY: bs.y + bs.h / 2,
                    zoom: 1.45,
                    duration: 2.8
                }, cinema(() => {
                    if (typeof window.BossHUD !== "undefined") {
                        window.BossHUD.show(__("boss_name_1") || "CUADRITO AZUL", bs.health, bs.maxHealth, "#00e5ff");
                    }
                    if (!window.postGameHorror) {
                        if (currentBGM) {
                            currentBGM.pause();
                            currentBGM.currentTime = 0;
                        }
                        playSFX("bgm_boss_ice");
                    }
                }));
            } else {
                if (typeof window.BossHUD !== "undefined") {
                    window.BossHUD.show(__("boss_name_1") || "CUADRITO AZUL", bs.health, bs.maxHealth, "#00e5ff");
                }
                if (!window.postGameHorror) {
                    if (currentBGM) {
                        currentBGM.pause();
                        currentBGM.currentTime = 0;
                    }
                    playSFX("bgm_boss_ice");
                }
                delete game.cameraOverrideX;
                game.player.frozen = false;
            }
        }
    }
    if (bs.state === "boss_fight") {
        if (!bs._camRecovered && !game.player.frozen && !bs._enrageCineActive) {
            bs._camRecovered = true;
            if (typeof game.cameraOverrideX === "number" || typeof game.cameraZoom === "number") {
                const camTarget = game.player.x - VIEW_W / 2;
                if (typeof gsap !== "undefined") {
                    gsap.to(game, {
                        cameraOverrideX: camTarget,
                        cameraZoom: 1,
                        duration: .6,
                        ease: "power2.inOut",
                        onComplete: () => {
                            delete game.cameraOverrideX;
                            delete game.cameraZoom;
                            delete game.zoomTargetWorldX;
                            delete game.zoomTargetWorldY;
                        }
                    });
                } else {
                    delete game.cameraOverrideX;
                    delete game.cameraZoom;
                }
            }
        }
        if (typeof window.BossHUD !== "undefined") {
            window.BossHUD.update(bs.health, bs.maxHealth, bs.health <= bs.maxHealth * .5 ? "#ff0044" : "#00e5ff");
        }
        if (bs._dashPendingDmg) {
            const d = bs._dashPendingDmg;
            bs._dashPendingDmg = 0;
            bs.health -= d;
            bs.hitFlash = 10;
            bs.impactTimer = 12;
            addFloatingText(bs.x + bs.w / 2, bs.y - 12, "⚡-" + d + " ⚡", "#ff00e0", 22);
            playSound(700, .18, "square", .25, 400);
            try {
                applyShake(6);
            } catch (e) {}
            try {
                createExplosion(bs.x + bs.w / 2, bs.y + bs.h / 2, "#ff0055", 26, 16, [ "#ff0055", "#00ffff", "#ffffff" ]);
            } catch (e) {}
            if (bs.health <= 0) {
                bs.state = "defeated";
                applyShake(30);
                game.flash = 40;
                game.glitchT = 60;
                playSound(80, .8, "sawtooth", .5, 30);
            }
        }
        if (!bs._enrageCineActive) game.player.frozen = false;
        if (!bs._enrageCineDone && bs.health > 0 && bs.health <= bs.maxHealth * .5) {
            bs._enrageCineDone = true;
            bs._enrageCineActive = true;
            game.player.frozen = true;
            game._furiaTint = 0;
            playSound(90, .9, "sawtooth", .45, 35);
            addFloatingText(bs.x + bs.w / 2, bs.y - 50, __("flt_jefe_furia"), "#ff3355", 26);
            if (typeof gsap !== "undefined") {
                gsap.to(game, {
                    cameraOverrideX: bs.x - VIEW_W / 2 + bs.w / 2,
                    duration: .8,
                    ease: "power2.inOut",
                    onComplete: cinema(() => {
                        gsap.to(game, {
                            _furiaTint: .45,
                            duration: .6,
                            ease: "power2.in",
                            onUpdate: () => {
                                applyShake(6);
                                bs.hitFlash = 4;
                            },
                            onComplete: cinema(() => {
                                bs.hitFlash = 30;
                                applyShake(20);
                                game.flash = 25;
                                playSound(70, .8, "sawtooth", .5, 28);
                                gsap.to(game, {
                                    _furiaTint: .15,
                                    duration: 1.4,
                                    delay: .5
                                });
                                gsap.to(game, {
                                    cameraOverrideX: game.player.x - VIEW_W / 2,
                                    duration: .8,
                                    ease: "power2.inOut",
                                    onComplete: cinema(() => {
                                        delete game.cameraOverrideX;
                                        bs._enrageCineActive = false;
                                        game.player.frozen = false;
                                    })
                                });
                            })
                        });
                    })
                });
            } else {
                game._furiaTint = .15;
                bs._enrageCineActive = false;
                game.player.frozen = false;
            }
        }
        if (bs.slamState === undefined) {
            bs.slamState = "idle";
            bs.slamTimer = 0;
            bs.blinkCount = 0;
            bs.shootTimer = 0;
            bs.rainTimer = 0;
            bs.squishX = 1;
            bs.squishY = 1;
            bs.mouthOpenTimer = 0;
            bs.mouthCycle = 0;
            bs.eyeBlinkTimer = 0;
            bs.impactTimer = 0;
        }
        bs.squishX += (1 - bs.squishX) * .12;
        bs.squishY += (1 - bs.squishY) * .12;
        if (bs.impactTimer > 0) bs.impactTimer--;
        bs.eyeBlinkTimer = (bs.eyeBlinkTimer || 0) + 1;
        if (bs.eyeBlinkTimer > 160 + Math.sin(time) * 40) {
            bs.eyeBlinkTimer = -14;
        }
        if (bs.mouthOpenTimer > 0) {
            bs.mouthOpenTimer--;
            bs.mouthCycle = Math.sin((35 - bs.mouthOpenTimer) * .35);
        } else {
            bs.mouthCycle *= .8;
        }
        const isLowHp = bs.health <= bs.maxHealth * .4;
        const isEnraged = bs.health <= bs.maxHealth * .5;
        const isAttacking = (bs.mouthOpenTimer || 0) > 0 || bs.slamState === "blink" || bs.slamState === "slamming";
        const arenaCenterX = (game.arenaMinX + game.arenaMaxX) / 2;
        const floatAmplitude = isEnraged ? 220 : 160;
        const targetX = arenaCenterX + Math.sin(time * .05) * floatAmplitude - bs.w / 2;
        const targetY = 130 + Math.sin(time * .07) * (isAttacking ? 35 : 25);
        bs.x += (targetX - bs.x) * .08;
        bs.y += (targetY - bs.y) * .08;
        if (Math.random() < .25) {
            particles.push({
                x: bs.x + bs.w / 2 + (Math.random() - .5) * bs.w,
                y: bs.y + bs.h / 2 + (Math.random() - .5) * bs.h,
                vx: (Math.random() - .5) * 1.5,
                vy: -Math.random() * 1.5 - .5,
                life: 18 + Math.random() * 10,
                color: Math.random() > .5 ? "#00ffff" : "#80e5ff",
                size: 6 + Math.random() * 6,
                type: "spark"
            });
        }
        bs.slamTimer = (bs.slamTimer || 0) + 1;
        const slamThreshold = window.postGameHorror ? isEnraged ? 240 : 360 : isEnraged ? 380 : 540;
        if (bs.slamTimer >= slamThreshold && bs.slamState === "idle" && !bs._enrageCineActive) {
            bs.slamState = "blink";
            bs.slamTimer = 0;
            bs.blinkCount = 0;
        }
        if (bs.slamState === "blink") {
            bs.squishY = .9;
            bs.squishX = 1.1;
            if (bs.slamTimer % 25 === 0) {
                bs.blinkCount++;
                bs.hitFlash = 12;
                playSound(350 + bs.blinkCount * 80, .2, "sine", .2, 400);
                if (bs.blinkCount >= 3) {
                    bs.slamState = "slamming";
                    bs.slamTimer = 0;
                    bs._slamY = bs.y;
                }
            }
        }
        if (bs.slamState === "slamming") {
            bs.squishY = 1.25;
            bs.squishX = .8;
            const progress = Math.min(1, bs.slamTimer / 16);
            bs.y = bs._slamY + (410 - bs._slamY) * progress;
            if (progress >= 1) {
                bs.squishY = .65;
                bs.squishX = 1.35;
                bs.impactTimer = 30;
                applyShake(16);
                playSound(60, .6, "sawtooth", .4, 25);
                for (let i = stars.length - 1; i >= 0; i--) {
                    if (stars[i]._bossDrop && Date.now() - stars[i]._born > 15e3) stars.splice(i, 1);
                }
                for (let i = 0; i < 4; i++) {
                    stars.push({
                        x: game.player.x + game.player.w / 2 - 12 + (i - 1.5) * 55 + (Math.random() * 16 - 8),
                        y: 415 + Math.random() * 40,
                        collected: false,
                        _bossDrop: true,
                        _born: Date.now()
                    });
                }
                playSound(880, .3, "sine", .25, 1320);
                const spikeCount = 5;
                for (let i = 0; i < spikeCount; i++) {
                    const spikeX = game.arenaMinX + 100 + i * ((game.arenaMaxX - game.arenaMinX - 200) / (spikeCount - 1));
                    enemyProjectiles.push({
                        x: spikeX,
                        y: 448,
                        w: 56,
                        h: 92,
                        radius: 18,
                        vx: 0,
                        vy: 0,
                        color: "#00ffff",
                        isGiant: false,
                        damage: 12,
                        isSpike: true,
                        spikeTimer: 90
                    });
                }
                bs.slamState = "idle";
                bs.slamTimer = 0;
            }
        }
        bs.shootTimer = (bs.shootTimer || 0) + 1;
        const shootInterval = window.postGameHorror ? isEnraged ? 34 : 48 : isEnraged ? 52 : 75;
        if (bs.shootTimer >= shootInterval && bs.slamState === "idle" && !bs._enrageCineActive) {
            bs.shootTimer = 0;
            bs.mouthOpenTimer = 30;
            const mouthX = bs.x + bs.w / 2;
            const mouthY = bs.y + bs.h * .65;
            const angle = Math.atan2(game.player.y + game.player.h / 2 - mouthY, game.player.x + game.player.w / 2 - mouthX);
            const spreads = isEnraged ? [ -.35, -.15, 0, .15, .35 ] : [ -.25, 0, .25 ];
            bs.bigShotCounter = (bs.bigShotCounter || 0) + 1;
            const speedMult = window.postGameHorror ? 1.3 : 1;
            if (bs.bigShotCounter % 4 === 0) {
                enemyProjectiles.push({
                    x: mouthX - 26,
                    y: mouthY - 26,
                    w: 52,
                    h: 52,
                    radius: 26,
                    vx: Math.cos(angle) * 4.3 * speedMult,
                    vy: Math.sin(angle) * 4.3 * speedMult,
                    color: "#ffffff",
                    isGiant: true,
                    damage: 20,
                    isBigIceBall: true
                });
                for (let p = 0; p < 10; p++) {
                    const pa = Math.random() * Math.PI * 2;
                    particles.push({
                        x: mouthX,
                        y: mouthY,
                        vx: Math.cos(pa) * (3 + Math.random() * 4),
                        vy: Math.sin(pa) * (3 + Math.random() * 4),
                        life: 24,
                        color: "#ffffff",
                        size: 5,
                        type: "spark"
                    });
                }
                playSound(130, .45, "sine", .3, 55);
            } else {
                for (let sp of spreads) {
                    enemyProjectiles.push({
                        x: mouthX,
                        y: mouthY,
                        w: 24,
                        h: 24,
                        radius: 12,
                        vx: Math.cos(angle + sp) * 6.3 * speedMult,
                        vy: Math.sin(angle + sp) * 6.3 * speedMult,
                        color: "#00ddff",
                        isGiant: true,
                        damage: 12
                    });
                    for (let p = 0; p < 4; p++) {
                        particles.push({
                            x: mouthX,
                            y: mouthY,
                            vx: Math.cos(angle + sp) * (4 + Math.random() * 4),
                            vy: Math.sin(angle + sp) * (4 + Math.random() * 4),
                            life: 18,
                            color: "#ffffff",
                            size: 4,
                            type: "spark"
                        });
                    }
                }
                playSound(220, .25, "sine", .25, 120);
            }
        }
        if (isEnraged && bs.slamState === "idle" && !bs._enrageCineActive) {
            bs.rainTimer = (bs.rainTimer || 0) + 1;
            const rainThreshold = window.postGameHorror ? 70 : 115;
            if (bs.rainTimer >= rainThreshold) {
                bs.rainTimer = 0;
                for (let i = 0; i < 3; i++) {
                    const rx = cameraX + 80 + Math.random() * (VIEW_W - 160);
                    enemyProjectiles.push({
                        x: rx,
                        y: -30,
                        w: 20,
                        h: 30,
                        radius: 10,
                        vx: 0,
                        vy: 5.2 + Math.random() * 2.2,
                        color: "#00ffff",
                        isGiant: false,
                        damage: 10
                    });
                }
                playSound(450, .15, "triangle", .2, 220);
            }
        }
        if (dist < 60) game.player.takeDamage(4);
    }
    const drawX = bs.x - cameraX;
    const drawY = bs.y;
    if (drawX < -250 || drawX > VIEW_W + 250) return;
    if (!bs.isBoss) {
        ctx.save();
        const heatWaveAlpha = .3 + Math.sin(time * .15) * .2;
        ctx.strokeStyle = `rgba(255, 140, 0, ${heatWaveAlpha})`;
        ctx.lineWidth = 2;
        for (let hw = 0; hw < 3; hw++) {
            const hwR = bs.w * .6 + hw * 8 + Math.sin(time * .2 + hw) * 4;
            ctx.beginPath();
            ctx.arc(drawX + bs.w / 2, drawY + bs.h / 2, hwR, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.shadowColor = "#ff6600";
        ctx.shadowBlur = 8;
        const grad = ctx.createLinearGradient(drawX, drawY, drawX, drawY + bs.h);
        grad.addColorStop(0, "#55aaff");
        grad.addColorStop(1, "#0277bd");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(drawX, drawY, bs.w, bs.h, 7);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255, 60, 60, 0.45)";
        ctx.beginPath();
        ctx.ellipse(drawX + 6, drawY + 20, 4, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(drawX + bs.w - 6, drawY + 20, 4, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.fillRect(drawX + 7, drawY + 9, 6, 3);
        ctx.fillRect(drawX + bs.w - 13, drawY + 9, 6, 3);
        const pantH = 3 + Math.sin(time * .25) * 2;
        ctx.fillStyle = "#111111";
        ctx.beginPath();
        ctx.ellipse(drawX + bs.w / 2, drawY + 22, 5, pantH, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ff4444";
        ctx.beginPath();
        ctx.arc(drawX + bs.w / 2, drawY + 22 + pantH * .4, 2.5, 0, Math.PI);
        ctx.fill();
        for (let s = 0; s < 4; s++) {
            const sOffset = (time * .12 + s * 1.8) % 24;
            const dropX = drawX + 4 + s * 8;
            const dropY = drawY + 2 + sOffset;
            ctx.fillStyle = "#00ffff";
            ctx.shadowColor = "#00ffff";
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(dropX, dropY, Math.max(.5, 2.2 - sOffset / 24 * 1.2), 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        const mainSweatY = drawY + 4 + time * .1 % 28;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(drawX + bs.w - 5, mainSweatY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        if (bs.state === "sweating") {
            ctx.save();
            ctx.fillStyle = "#ffffff";
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 2;
            const bubble = __("dlg_me_derrito");
            ctx.font = 'bold 11px "Courier Prime", monospace';
            const tw = ctx.measureText(bubble).width + 16;
            const bx2 = drawX + bs.w / 2 - tw / 2;
            ctx.beginPath();
            ctx.roundRect(bx2, drawY - 24, tw, 20, 6);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#111111";
            ctx.fillText(bubble, bx2 + 8, drawY - 10);
            ctx.restore();
        }
    } else {
        ctx.save();
        const isEnraged = bs.health <= bs.maxHealth * .5;
        const isLowHp = bs.health <= bs.maxHealth * .4;
        const isImpact = (bs.impactTimer || 0) > 0 || bs.slamState === "slamming";
        const isAttacking = (bs.mouthOpenTimer || 0) > 0 || bs.slamState === "blink" || bs.slamState === "slamming";
        let currentEmotion = "serio";
        if (isImpact || bs.slamState === "blink") {
            currentEmotion = "furia";
        } else if (isLowHp) {
            currentEmotion = "asustado";
        }
        const centerX = drawX + bs.w / 2;
        const centerY = drawY + bs.h / 2;
        ctx.save();
        const auraColor = window.postGameHorror ? "rgba(180, 0, 20, 0.38)" : currentEmotion === "furia" ? "rgba(255, 0, 80, 0.22)" : currentEmotion === "asustado" ? "rgba(128, 229, 255, 0.25)" : "rgba(0, 229, 255, 0.2)";
        const auraR = bs.w * .7 + Math.sin(time * .1) * 6;
        ctx.fillStyle = auraColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY, auraR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        const bladeCount = isEnraged ? 5 : 4;
        const spinRot = time * (isEnraged ? .08 : .04);
        const orbitR = bs.w * .72;
        for (let b = 0; b < bladeCount; b++) {
            const bAngle = spinRot + b * Math.PI * 2 / bladeCount;
            const bx = centerX + Math.cos(bAngle) * orbitR;
            const by = centerY + Math.sin(bAngle) * orbitR;
            ctx.fillStyle = window.postGameHorror ? "#990011" : currentEmotion === "furia" ? "#ff0055" : currentEmotion === "asustado" ? "#80e5ff" : "#00e5ff";
            ctx.shadowColor = window.postGameHorror ? "#ff0000" : currentEmotion === "furia" ? "#ff0033" : "#00ffff";
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(bx, by, 7.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.translate(centerX, centerY);
        const tiltAngle = currentEmotion === "asustado" ? Math.sin(time * 15) * .08 : Math.sin(time * .06) * .04;
        ctx.rotate(tiltAngle);
        const sqX = bs.squishX || 1;
        const sqY = bs.squishY || 1;
        ctx.scale(sqX, sqY);
        if (currentEmotion === "asustado" || isImpact) {
            const tremorMag = isImpact ? 4 : 2;
            ctx.translate((Math.random() - .5) * tremorMag, (Math.random() - .5) * tremorMag);
        }
        const hw = bs.w / 2;
        const hh = bs.h / 2;
        if (bs.hitFlash && bs.hitFlash > 0) {
            bs.hitFlash--;
            ctx.fillStyle = "#ffffff";
        } else if (window.postGameHorror) {
            ctx.fillStyle = "#080808";
        } else if (currentEmotion === "furia") {
            ctx.fillStyle = "#450a0a";
        } else if (currentEmotion === "asustado") {
            ctx.fillStyle = "#0369a1";
        } else {
            ctx.fillStyle = "#0284c7";
        }
        ctx.shadowColor = window.postGameHorror ? "#dc2626" : currentEmotion === "furia" ? "#ef4444" : "#38bdf8";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(0, -hh);
        ctx.lineTo(hw, -hh * .5);
        ctx.lineTo(hw, hh * .5);
        ctx.lineTo(0, hh);
        ctx.lineTo(-hw, hh * .5);
        ctx.lineTo(-hw, -hh * .5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = window.postGameHorror ? "#990000" : currentEmotion === "furia" ? "#ff3366" : currentEmotion === "asustado" ? "#80e5ff" : "#00ffff";
        ctx.lineWidth = 3.5;
        ctx.stroke();
        ctx.strokeStyle = window.postGameHorror ? "rgba(220, 38, 38, 0.45)" : "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -hh);
        ctx.lineTo(0, hh);
        ctx.moveTo(-hw, -hh * .5);
        ctx.lineTo(hw, hh * .5);
        ctx.moveTo(-hw, hh * .5);
        ctx.lineTo(hw, -hh * .5);
        ctx.stroke();
        ctx.fillStyle = window.postGameHorror ? "#7f1d1d" : currentEmotion === "furia" ? "#ff0044" : "#00ffff";
        ctx.beginPath();
        ctx.moveTo(-hw + 10, -hh + 5);
        ctx.lineTo(-hw + 20, -hh - (window.postGameHorror ? 24 : 16));
        ctx.lineTo(0, -hh - 6);
        ctx.lineTo(hw - 20, -hh - (window.postGameHorror ? 24 : 16));
        ctx.lineTo(hw - 10, -hh + 5);
        ctx.closePath();
        ctx.fill();
        const playerX = game.player ? game.player.x + game.player.w / 2 : bs.x + bs.w / 2;
        const playerY = game.player ? game.player.y + game.player.h / 2 : bs.y + bs.h / 2;
        const lookAngle = Math.atan2(playerY - (bs.y + bs.h / 2), playerX - (bs.x + bs.w / 2));
        const pupilShiftX = Math.cos(lookAngle) * 3;
        const pupilShiftY = Math.sin(lookAngle) * 3;
        const isBlinking = (bs.eyeBlinkTimer || 0) < 0;
        const eyeY = -hh * .2;
        const eyeSpacing = hw * .48;
        for (let side of [ -1, 1 ]) {
            const eyeX = side * eyeSpacing;
            ctx.save();
            ctx.translate(eyeX, eyeY);
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            if (window.postGameHorror) {
                ctx.ellipse(0, 0, 14, 12, 0, 0, Math.PI * 2);
            } else if (isBlinking) {
                ctx.ellipse(0, 0, 11, 2, 0, 0, Math.PI * 2);
            } else if (currentEmotion === "asustado") {
                ctx.ellipse(0, 0, 11, 10, 0, 0, Math.PI * 2);
            } else if (currentEmotion === "furia") {
                ctx.ellipse(0, 0, 12, 6, side * -.25, 0, Math.PI * 2);
            } else {
                ctx.ellipse(0, 0, 11, 7, side * -.1, 0, Math.PI * 2);
            }
            ctx.fill();
            ctx.strokeStyle = window.postGameHorror ? "#dc2626" : currentEmotion === "furia" ? "#ff0000" : "#00ffff";
            ctx.lineWidth = 1.5;
            ctx.stroke();
            if (!isBlinking || window.postGameHorror) {
                if (window.postGameHorror) {
                    ctx.fillStyle = "#f8fafc";
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 12, 10, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = "#dc2626";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(-10 * side, -4);
                    ctx.lineTo(-4 * side, -1);
                    ctx.moveTo(-9 * side, 4);
                    ctx.lineTo(-3 * side, 1);
                    ctx.stroke();
                    ctx.fillStyle = "#990000";
                    ctx.beginPath();
                    ctx.arc(pupilShiftX * .8, pupilShiftY * .8, 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#000000";
                    ctx.beginPath();
                    ctx.arc(pupilShiftX * .8, pupilShiftY * .8, 1, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    const irisColor = currentEmotion === "furia" ? "#ff0033" : currentEmotion === "asustado" ? "#00e5ff" : "#ff1a1a";
                    ctx.fillStyle = irisColor;
                    ctx.shadowColor = irisColor;
                    ctx.shadowBlur = 6;
                    let pSize = currentEmotion === "asustado" ? 3.5 : currentEmotion === "furia" ? 2 : 3;
                    if (currentEmotion === "asustado") {
                        pSize += Math.sin(time * 30 + side) * .8;
                    }
                    ctx.beginPath();
                    ctx.arc(pupilShiftX, pupilShiftY, pSize, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(pupilShiftX - 1, pupilShiftY - 1, pSize * .35, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.strokeStyle = window.postGameHorror ? "#7f1d1d" : currentEmotion === "furia" ? "#ff0055" : currentEmotion === "asustado" ? "#80e5ff" : "#00ffff";
            ctx.lineWidth = 3;
            ctx.beginPath();
            if (window.postGameHorror || currentEmotion === "furia") {
                ctx.moveTo(-10 * side, -10);
                ctx.lineTo(8 * side, -4);
            } else if (currentEmotion === "asustado") {
                ctx.moveTo(-10 * side, -5);
                ctx.lineTo(8 * side, -11);
            } else {
                ctx.moveTo(-10 * side, -8);
                ctx.lineTo(8 * side, -6);
            }
            ctx.stroke();
            ctx.restore();
        }
        if (currentEmotion === "asustado" && !window.postGameHorror) {
            for (let s = 0; s < 3; s++) {
                const sProgress = (time * .15 + s * .7) % 1;
                const dropX = s === 0 ? -hw * .6 : s === 1 ? hw * .6 : 0;
                const dropY = -hh * .1 + sProgress * (hh * .8);
                ctx.fillStyle = "#00ffff";
                ctx.beginPath();
                ctx.arc(dropX, dropY, 2.5 * (1 - sProgress * .5), 0, Math.PI * 2);
                ctx.fill();
            }
        }
        const isMouthFiring = (bs.mouthOpenTimer || 0) > 0;
        const mouthCycleVal = Math.max(0, bs.mouthCycle || 0);
        let mouthOpening = window.postGameHorror ? 18 : 4;
        if (isMouthFiring) {
            mouthOpening = 18 + mouthCycleVal * 12;
        } else if (currentEmotion === "furia") {
            mouthOpening = 16 + Math.sin(time * 12) * 3;
        } else if (currentEmotion === "asustado") {
            mouthOpening = 12 + Math.sin(time * 20) * 4;
        }
        const mouthWidth = hw * 1.15;
        const mouthY = hh * .35;
        ctx.save();
        ctx.translate(0, mouthY);
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.ellipse(0, 0, mouthWidth / 2, mouthOpening / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        if (isAttacking || currentEmotion === "furia" || window.postGameHorror) {
            ctx.fillStyle = window.postGameHorror ? "rgba(220, 38, 38, 0.7)" : isAttacking ? "rgba(0, 255, 255, 0.75)" : "rgba(255, 0, 60, 0.65)";
            ctx.shadowColor = window.postGameHorror ? "#ff0000" : isAttacking ? "#00ffff" : "#ff0044";
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.ellipse(0, 0, mouthWidth * .3, mouthOpening * .35, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = window.postGameHorror ? "#e4e4e7" : "#ffffff";
        const toothCount = window.postGameHorror ? 7 : 5;
        const tSpacing = mouthWidth / (toothCount + 1);
        for (let i = 1; i <= toothCount; i++) {
            const tx = -mouthWidth / 2 + i * tSpacing;
            const tHeight = i === 2 || i === 4 || window.postGameHorror && i === 6 ? window.postGameHorror ? 10 : 7 : 5;
            ctx.beginPath();
            ctx.moveTo(tx - 3, -mouthOpening / 2);
            ctx.lineTo(tx, -mouthOpening / 2 + Math.min(tHeight, mouthOpening * .75));
            ctx.lineTo(tx + 3, -mouthOpening / 2);
            ctx.closePath();
            ctx.fill();
        }
        for (let i = 1; i <= toothCount; i++) {
            const tx = -mouthWidth / 2 + i * tSpacing;
            const tHeight = i === 3 || window.postGameHorror && i === 5 ? window.postGameHorror ? 9 : 6 : 4;
            ctx.beginPath();
            ctx.moveTo(tx - 3, mouthOpening / 2);
            ctx.lineTo(tx, mouthOpening / 2 - Math.min(tHeight, mouthOpening * .75));
            ctx.lineTo(tx + 3, mouthOpening / 2);
            ctx.closePath();
            ctx.fill();
        }
        ctx.strokeStyle = window.postGameHorror ? "#7f1d1d" : currentEmotion === "furia" ? "#ff0044" : currentEmotion === "asustado" ? "#80e5ff" : "#00d5ff";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, mouthWidth / 2, mouthOpening / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        ctx.restore();
        if (game._furiaTint > 0) {
            ctx.fillStyle = `rgba(255, 30, 50, ${Math.min(.5, game._furiaTint)})`;
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        }
    }
    if (bs.state === "defeated" && !bs._defeatDialogShown) {
        bs._defeatDialogShown = true;
        game.boss1Defeated = true;
        game._furiaTint = 0;
        if (typeof window.BossHUD !== "undefined") {
            window.BossHUD.hide();
        }
        game.player.frozen = true;
        game.arenaLocked = false;
        stopAllSFX();
        gsap.to(getMessageDiv(), {
            scale: 0,
            opacity: 0,
            duration: .2
        });
        if (!window.postGameHorror) playBGM("bgm_world1_ice");
        applyShake(38);
        game.flash = 45;
        game.platforms.forEach(p => {
            if (p.button) {
                p.button = false;
                p.active = false;
            }
        });
        createExplosion(bs.x + bs.w / 2, bs.y + bs.h / 2, "#00e5ff", 80, 70, [ "#00e5ff", "#80e5ff", "#ffffff" ]);
        const entranceGateDef = game.platforms.find(p => p.isArenaGate === "entrance");
        const exitGateDef = game.platforms.find(p => p.isArenaGate === "exit");
        try {
            gsap.killTweensOf(entranceGateDef);
        } catch (e) {}
        try {
            gsap.killTweensOf(exitGateDef);
        } catch (e) {}
        if (entranceGateDef && exitGateDef) {
            gsap.to(game, {
                cameraOverrideX: entranceGateDef.x - VIEW_W / 2 + entranceGateDef.w / 2,
                duration: 1,
                ease: "power2.inOut",
                onComplete: cinema(() => {
                    gsap.to(entranceGateDef, {
                        y: -250,
                        duration: .6,
                        ease: "power2.out",
                        onComplete: cinema(() => {
                            playSound(120, .4, "sine", .3, 80);
                            gsap.to(game, {
                                cameraOverrideX: exitGateDef.x - VIEW_W / 2 + exitGateDef.w / 2,
                                duration: 1,
                                ease: "power2.inOut",
                                onComplete: cinema(() => {
                                    gsap.to(exitGateDef, {
                                        y: -250,
                                        duration: .6,
                                        ease: "power2.out",
                                        onComplete: cinema(() => {
                                            playSound(120, .4, "sine", .3, 80);
                                            gsap.to(game, {
                                                cameraOverrideX: game.player.x - VIEW_W / 2,
                                                duration: 1,
                                                ease: "power2.inOut",
                                                onComplete: cinema(() => {
                                                    delete game.cameraOverrideX;
                                                    game.player.frozen = false;
                                                })
                                            });
                                        })
                                    });
                                })
                            });
                        })
                    });
                })
            });
        } else {
            game.player.frozen = false;
        }
        showAnimatedDialogue(__("ui_speaker_blue_square"), "😖", "¡¡AHHGGGGG!!", null, 1600);
    }
}

function closeArenaWithHammers(onDone) {
    const entranceGateDef = game.platforms.find(p => p.isArenaGate === "entrance");
    const exitGateDef = game.platforms.find(p => p.isArenaGate === "exit");
    if (!entranceGateDef || !exitGateDef || typeof gsap === "undefined") {
        if (onDone) onDone();
        return;
    }
    if (closeArenaWithHammers._busyUntil && Date.now() < closeArenaWithHammers._busyUntil) {
        const waitIv = setInterval(cinema(() => {
            if (!closeArenaWithHammers._busyUntil || Date.now() >= closeArenaWithHammers._busyUntil) {
                clearInterval(waitIv);
                closeArenaWithHammers._busyUntil = 0;
                closeArenaWithHammers(onDone);
            }
        }), 300);
        setTimeout(() => clearInterval(waitIv), 11e3);
        return;
    }
    closeArenaWithHammers._busyUntil = Date.now() + 9e3;
    try {
        gsap.killTweensOf(entranceGateDef);
    } catch (e) {}
    try {
        gsap.killTweensOf(exitGateDef);
    } catch (e) {}
    try {
        gsap.killTweensOf(game);
    } catch (e) {}
    const finish = cinema(() => {
        closeArenaWithHammers._busyUntil = 0;
        if (onDone) onDone();
    });
    gsap.to(game, {
        cameraOverrideX: exitGateDef.x - VIEW_W / 2 + exitGateDef.w / 2,
        duration: .8,
        ease: "power2.inOut",
        onComplete: cinema(() => {
            gsap.to(exitGateDef, {
                y: 160,
                duration: .4,
                ease: "bounce.out",
                onComplete: cinema(() => {
                    playSound(120, .4, "sine", .3, 80);
                    applyShake(14);
                    gsap.to(game, {
                        cameraOverrideX: entranceGateDef.x - VIEW_W / 2 + entranceGateDef.w / 2,
                        duration: .8,
                        ease: "power2.inOut",
                        onComplete: cinema(() => {
                            gsap.to(entranceGateDef, {
                                y: 160,
                                duration: .4,
                                ease: "bounce.out",
                                onComplete: finish
                            });
                        })
                    });
                })
            });
        })
    });
}

window.closeArenaWithHammers = closeArenaWithHammers;

window.raiseArenaHammers = function(onDone) {
    const entranceGateDef = game.platforms.find(p => p.isArenaGate === "entrance");
    const exitGateDef = game.platforms.find(p => p.isArenaGate === "exit");
    if (!entranceGateDef || !exitGateDef || typeof gsap === "undefined") {
        if (onDone) onDone();
        return;
    }
    try {
        gsap.killTweensOf(entranceGateDef);
    } catch (e) {}
    try {
        gsap.killTweensOf(exitGateDef);
    } catch (e) {}
    try {
        gsap.killTweensOf(game);
    } catch (e) {}
    gsap.to(game, {
        cameraOverrideX: entranceGateDef.x - VIEW_W / 2 + entranceGateDef.w / 2,
        duration: 1,
        ease: "power2.inOut",
        onComplete: cinema(() => {
            gsap.to(entranceGateDef, {
                y: -250,
                duration: .6,
                ease: "power2.out",
                onComplete: cinema(() => {
                    playSound(120, .4, "sine", .3, 80);
                    gsap.to(game, {
                        cameraOverrideX: exitGateDef.x - VIEW_W / 2 + exitGateDef.w / 2,
                        duration: 1,
                        ease: "power2.inOut",
                        onComplete: cinema(() => {
                            gsap.to(exitGateDef, {
                                y: -250,
                                duration: .6,
                                ease: "power2.out",
                                onComplete: cinema(() => {
                                    playSound(120, .4, "sine", .3, 80);
                                    gsap.to(game, {
                                        cameraOverrideX: game.player.x - VIEW_W / 2,
                                        duration: 1,
                                        ease: "power2.inOut",
                                        onComplete: cinema(() => {
                                            delete game.cameraOverrideX;
                                            if (onDone) onDone();
                                        })
                                    });
                                })
                            });
                        })
                    });
                })
            });
        })
    });
};

window.triggerSolarGateCutscene = function() {
    if (!game.player || typeof gsap === "undefined") return;
    game.player.frozen = true;
    game.player.vx = 0;
    if (typeof game.player.dashTimer === "number") game.player.dashTimer = 0;
    const gate = (game.platforms || []).find(p => p.isGateObstacle === 2);
    const pipe = (game.platforms || []).find(p => p.isMarioPipe === 2);
    const pitX = 7370;
    const bo = typeof window.getBlackoutDiv === "function" ? window.getBlackoutDiv() : document.getElementById("blackout");
    try {
        gsap.killTweensOf(game);
    } catch (e) {}
    try {
        playSound(520, .25, "triangle", .3, 1040);
    } catch (e) {}
    if (bo) {
        bo.style.transition = "opacity 0.45s ease";
        bo.style.opacity = "1";
    }
    setTimeout(cinema(() => {
        game.subCaveMode = false;
        game.gate2Open = true;
        game.meadowNight = false;
        game.nightTransitionProgress = 0;
        const gateCamTarget = gate ? gate.x - VIEW_W / 2 + gate.w / 2 : 7520 - VIEW_W / 2;
        if (typeof cameraX !== "undefined") cameraX = gateCamTarget;
        game.cameraOverrideX = gateCamTarget;
        delete game.cameraOverrideY;
        game.camY = 0;
        if (pipe) pipe.y = 700;
        if (bo) bo.style.opacity = "0";
        setTimeout(cinema(() => {
            if (typeof applyShake === "function") applyShake(8);
            try {
                playSound(300, .4, "sawtooth", .4, 600);
            } catch (e) {}
            if (gate && typeof addFloatingText === "function") {
                addFloatingText(gate.x + gate.w / 2, 260, typeof __ === "function" ? __("flt_gate2_opened") : "☀️ ¡PUERTA SOLAR ELEVADA!", "#f59e0b", 24);
            }
            setTimeout(cinema(() => {
                gsap.to(game, {
                    cameraOverrideX: pitX - VIEW_W / 2,
                    cameraOverrideY: 0,
                    duration: .9,
                    ease: "power2.inOut",
                    onComplete: cinema(() => {
                        if (pipe) {
                            gsap.to(pipe, {
                                y: pipe.originY || 460,
                                duration: .8,
                                ease: "power2.out",
                                onComplete: cinema(() => {
                                    if (typeof applyShake === "function") applyShake(5);
                                    try {
                                        playSound(160, .12, "sawtooth");
                                        setTimeout(() => playSound(220, .12, "sawtooth"), 70);
                                        setTimeout(() => playSound(330, .16, "sawtooth"), 140);
                                    } catch (e) {}
                                    if (typeof addFloatingText === "function") {
                                        addFloatingText(pitX, 360, typeof __ === "function" ? __("flt_mario_pipe") : "🍄 ¡TUBERÍA WARP!", "#22c55e", 24);
                                    }
                                    setTimeout(cinema(() => {
                                        if (typeof window.spawnShootingStarsBurst === "function") window.spawnShootingStarsBurst(4);
                                        game.player.x = pitX - (game.player.w || 32) / 2;
                                        game.player.y = 430;
                                        game.player.vx = 0;
                                        game.player.vy = 0;
                                        try {
                                            playSound(400, .15, "sine", .3, 800);
                                            setTimeout(() => playSound(600, .2, "triangle", .3, 1200), 80);
                                        } catch (e) {}
                                        if (typeof particles !== "undefined") {
                                            for (let i = 0; i < 28; i++) {
                                                particles.push({
                                                    x: pitX + (Math.random() - .5) * 50,
                                                    y: 450,
                                                    vx: (Math.random() - .5) * 7,
                                                    vy: -Math.random() * 9 - 4,
                                                    life: 35,
                                                    color: "#86efac",
                                                    size: 4.5,
                                                    type: "spark"
                                                });
                                            }
                                        }
                                        gsap.to(game.player, {
                                            y: 300,
                                            x: pitX + 60,
                                            duration: .5,
                                            ease: "power1.out",
                                            onComplete: cinema(() => {
                                                gsap.to(game.player, {
                                                    y: 456,
                                                    x: pitX + 110,
                                                    duration: .38,
                                                    ease: "power2.in",
                                                    onComplete: cinema(() => {
                                                        if (typeof applyShake === "function") applyShake(4);
                                                        try {
                                                            playSound(440, .15, "sine", .2);
                                                        } catch (e) {}
                                                        gsap.to(game, {
                                                            nightTransitionProgress: 1,
                                                            duration: 4,
                                                            ease: "power1.inOut",
                                                            onComplete: () => {
                                                                game.meadowNight = true;
                                                            }
                                                        });
                                                        if (typeof currentBGM !== "undefined" && currentBGM) {
                                                            gsap.to(currentBGM, {
                                                                volume: 0,
                                                                duration: 2,
                                                                onComplete: () => {
                                                                    if (typeof playBGM === "function") playBGM("bgm_world1_night");
                                                                }
                                                            });
                                                        } else {
                                                            if (typeof playBGM === "function") playBGM("bgm_world1_night");
                                                        }
                                                        if (typeof currentLevel !== "undefined") {
                                                            currentCheckpoint = {
                                                                level: currentLevel,
                                                                x: 7460,
                                                                y: 440
                                                            };
                                                        }
                                                        if (typeof window.spawnShootingStarsBurst === "function") window.spawnShootingStarsBurst(3);
                                                        if (typeof addFloatingText === "function") {
                                                            addFloatingText(pitX + 110, 390, typeof __ === "function" ? __("flt_meadow_night") : "🌙 ¡NOCHE EN LA PRADERA!", "#a78bfa", 22);
                                                        }
                                                        delete game.cameraOverrideX;
                                                        delete game.cameraOverrideY;
                                                        game.camY = 0;
                                                        game.player.frozen = false;
                                                    })
                                                });
                                            })
                                        });
                                    }), 500);
                                })
                            });
                        } else {
                            game.player.x = pitX + 75;
                            game.player.y = 456;
                            game.nightTransitionProgress = 1;
                            game.meadowNight = true;
                            if (typeof playBGM === "function") playBGM("bgm_world1_night");
                            if (typeof currentLevel !== "undefined") {
                                currentCheckpoint = {
                                    level: currentLevel,
                                    x: 7460,
                                    y: 440
                                };
                            }
                            delete game.cameraOverrideX;
                            delete game.cameraOverrideY;
                            game.camY = 0;
                            game.player.frozen = false;
                        }
                    })
                });
            }), 900);
        }), 150);
    }), 480);
};
// Isaac Daniel Cotera - 2026 | Correo: isaacdanielcotera@gmail.com | Itch.io: https://cotera.itch.io | GitHub: https://github.com/cotera2024
