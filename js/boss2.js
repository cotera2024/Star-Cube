var btnSi = typeof btnSi !== "undefined" ? btnSi : typeof document !== "undefined" ? document.getElementById("btnSi") : null;

var btnNo = typeof btnNo !== "undefined" ? btnNo : typeof document !== "undefined" ? document.getElementById("btnNo") : null;

function confirmTechBossChoice() {
    if (!game.techBoss || !game.techBoss.showChoice) return;
    const tb = game.techBoss;
    tb.showChoice = false;
    playSound(800, .2, "square", .3, 1200);
    const txt = tb.selectedOption === 0 ? __("dlg_mas_animos") : __("dlg_no_importa_animos");
    showAnimatedDialogue(__("ui_speaker_system"), "⚙️", txt, () => {
        tb._codeRain = 180;
        tb._codeRainActive = true;
        tb._transformCallback = () => {
            tb.health += 20;
            tb.maxHealth = Math.max(tb.maxHealth, tb.health);
            tb.bonusHp = true;
            tb.glowTimer = 90;
            tb.phase = 5;
            tb.bulletCount = 9;
            for (let i = 0; i < 45; i++) {
                particles.push({
                    x: tb.x + tb.w / 2,
                    y: tb.y + tb.h / 2,
                    vx: (Math.random() - .5) * 14,
                    vy: (Math.random() - .5) * 14,
                    life: 45,
                    color: [ "#ffd700", "#ff00ff", "#00ffff" ][Math.floor(Math.random() * 3)],
                    size: 6,
                    type: "spark"
                });
            }
            showAnimatedDialogue(__("ui_speaker_system"), "😈", __("dlg_sistema_sin_reglas"), () => {
                showAnimatedDialogue(__("ui_speaker_mawlerknight"), "😈", __("dlg_spawn_vida"), () => {
                    tb.turnPhase = "boss_turn";
                    tb.attackTimer = 0;
                    game.player.frozen = false;
                }, 3e3);
            }, 3e3);
        };
    }, 3e3);
}

function updateAndDrawTechBoss(ctx, cameraX, time) {
    if (currentLevel !== 1 || !game.techBoss) return;
    const tb = game.techBoss;
    if (tb.state === "defeated") {
        if (tb._deathScreenTimer > 0) {
            tb._deathScreenTimer--;
            const dt = tb._deathScreenTimer;
            ctx.save();
            ctx.fillStyle = "#0a4fd6";
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            if (Math.random() < .3) {
                for (let g = 0; g < 3; g++) {
                    const gy = Math.random() * VIEW_H;
                    ctx.fillStyle = "rgba(255,255,255,0.12)";
                    ctx.fillRect(0, gy, VIEW_W, 3 + Math.random() * 6);
                }
            }
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "left";
            ctx.font = "bold 100px Arial";
            ctx.fillText(__("ui_cara_triste"), 80, 160);
            ctx.font = 'bold 22px "Courier Prime", monospace';
            ctx.fillText(__("bsod_titulo"), 80, 240);
            ctx.font = '16px "Courier Prime", monospace';
            ctx.fillText(__("bsod_error"), 80, 280);
            ctx.fillText(__("bsod_proceso"), 80, 308);
            const pct = Math.min(100, Math.floor((210 - dt) / 210 * 100));
            ctx.fillText(__("bsod_recopilando", pct), 80, 360);
            ctx.fillStyle = "rgba(255,255,255,0.25)";
            ctx.fillRect(80, 375, VIEW_W - 160, 10);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(80, 375, (VIEW_W - 160) * pct / 100, 10);
            const errLines = [ __("bsod_deteniendo1"), __("bsod_deteniendo2"), __("bsod_deteniendo3"), __("bsod_deteniendo4"), __("bsod_deteniendo5"), __("bsod_deteniendo6") ];
            ctx.font = "13px monospace";
            for (let k = 0; k < 3; k++) {
                const idx = (Math.floor(dt / 35) + k) % errLines.length;
                ctx.fillText(errLines[idx], 80, 420 + k * 24);
            }
            ctx.font = "italic 13px monospace";
            ctx.fillText(__("bsod_no_apagues"), 80, VIEW_H - 60);
            ctx.restore();
            if (dt % 35 === 0) {
                createExplosion(tb.x + Math.random() * tb.w, tb.y + Math.random() * tb.h, [ "#00ffaa", "#ff1493", "#ffffff" ][Math.floor(Math.random() * 3)], 25);
                applyShake(8);
                playSound(200 + Math.random() * 300, .25, "sawtooth", .3, 60);
            }
            if (dt <= 0 && !tb._defeatDialogsStarted) {
                tb._defeatDialogsStarted = true;
                applyShake(20);
                showAnimatedDialogue(__("ui_speaker_mawlerknight"), "😎", __("dlg_regalito"), () => {
                    tb.pixelActivate = 0;
                    showAnimatedDialogue(__("ui_speaker_system"), "💻", __("dlg_downgrade"), () => {
                        showAnimatedDialogue(__("ui_speaker_mawlerknight"), "😎", __("dlg_fps_mediocridad"), () => {
                            game.pixelTransitionProgress = 0;
                            playSound(100, .5, "square", .5, 3e3);
                            gsap.to(game, {
                                pixelTransitionProgress: 1,
                                duration: 3,
                                ease: "power2.in",
                                onUpdate: () => {
                                    applyShake(Math.random() * 5);
                                },
                                onComplete: () => {
                                    game.pixelMode = true;
                                    playBGM("bgm_world2_pixel_mode");
                                    addFloatingText(VIEW_W / 2, VIEW_H / 3, __("flt_modo8bit"), "#ff00ff", 30);
                                    setTimeout(() => {
                                        gsap.to(getMessageDiv(), {
                                            scale: 0,
                                            opacity: 0,
                                            duration: .2
                                        });
                                    }, 2e3);
                                    game.player.frozen = true;
                                    if (typeof window.raiseArenaHammers === "function") {
                                        window.raiseArenaHammers(() => {
                                            game.player.frozen = false;
                                        });
                                    } else {
                                        game.player.frozen = false;
                                    }
                                }
                            });
                        }, 3e3);
                    }, 3e3);
                }, 3e3);
            }
            return;
        }
        return;
    }
    const drawX = tb.x - cameraX;
    const drawY = tb.y;
    if (tb.state === "idle" && game.player) {
        const dist = Math.hypot(game.player.x + game.player.w / 2 - (tb.x + tb.w / 2), game.player.y + game.player.h / 2 - (tb.y + tb.h / 2));
        if (dist < 450 || game.player.x >= 14300) {
            game.arenaLocked = true;
            game.arenaMinX = 14200;
            game.arenaMaxX = 15300;
            if (!tb._entranceClosed) {
                tb._entranceClosed = true;
                game.player.frozen = true;
                game.player.vx = 0;
                const bootIt = function() {
                    tb.state = "intro_boot";
                    tb.bootTimer = 0;
                    tb.bootLines = [ __("sys_init_cyber"), __("sys_loading_mawler"), __("sys_system_online"), __("sys_detecting_intruder"), __("sys_target_locked") ];
                    tb.bootLineIdx = 0;
                    tb.bootCharIdx = 0;
                };
                if (typeof window.closeArenaWithHammers === "function") {
                    window.closeArenaWithHammers(function() {
                        delete game.cameraOverrideX;
                        bootIt();
                    });
                } else {
                    bootIt();
                }
            }
        }
    }
    if (tb.state === "idle") {
        return;
    }
    if (tb.state === "intro_boot") {
        tb.bootTimer = (tb.bootTimer || 0) + 1;
        if (tb.bootTimer % 3 === 0) {
            playSound(850 + Math.random() * 300, .03, "square", .08, 100);
        }
        if (tb.bootLineIdx < tb.bootLines.length && tb.bootCharIdx < tb.bootLines[tb.bootLineIdx].length) {
            if (tb.bootTimer % 2 === 0) {
                tb.bootCharIdx++;
            }
        } else {
            if (tb.bootTimer > 40) {
                tb.bootLineIdx++;
                tb.bootCharIdx = 0;
                tb.bootTimer = 0;
                if (tb.bootLineIdx >= tb.bootLines.length) {
                    if (!tb._bootDialogShown) {
                        tb._bootDialogShown = true;
                        showAnimatedDialogue(__("ui_speaker_mawlerknight"), "😎", __("dlg_guerrero"), () => {
                            if (typeof window.playBossPresentation === "function") {
                                window.playBossPresentation({
                                    name: __("boss_name_2") || "MAWLERKNIGHT",
                                    title: __("boss_title_2") || "GUERRERO CIBERNÉTICO DE ÉLITE",
                                    icon: "⚡",
                                    themeColor: "#00ffaa",
                                    accentColor: "#00f0ff",
                                    targetX: tb.x + tb.w / 2,
                                    targetY: tb.y + tb.h / 2,
                                    zoom: 1.45,
                                    duration: 2.8
                                }, () => {
                                    tb.state = "fighting";
                                    if (typeof window.BossHUD !== "undefined") {
                                        window.BossHUD.show(__("boss_name_2") || "MAWLERKNIGHT", tb.health, tb.maxHealth, "#00ffaa");
                                    }
                                    tb.turnPhase = "player_turn";
                                    tb.vulnerable = true;
                                    tb.turnDamageTaken = 0;
                                    game.player.frozen = false;
                                    playBGM("bgm_boss_hacker");
                                    showAnimatedDialogue(__("ui_speaker_system"), "💻", __("dlg_tu_turno"), null, 3e3);
                                });
                            } else {
                                tb.state = "fighting";
                                if (typeof window.BossHUD !== "undefined") {
                                    window.BossHUD.show(__("boss_name_2") || "MAWLERKNIGHT", tb.health, tb.maxHealth, "#00ffaa");
                                }
                                tb.turnPhase = "player_turn";
                                tb.vulnerable = true;
                                tb.turnDamageTaken = 0;
                                game.player.frozen = false;
                                playBGM("bgm_boss_hacker");
                                showAnimatedDialogue(__("ui_speaker_system"), "💻", __("dlg_tu_turno"), null, 3e3);
                            }
                        }, 3e3);
                    }
                }
            }
        }
        ctx.save();
        ctx.fillStyle = "rgba(2, 10, 20, 0.94)";
        ctx.fillRect(VIEW_W / 2 - 250, 100, 500, 260);
        ctx.strokeStyle = "#00ffaa";
        ctx.lineWidth = 3;
        ctx.strokeRect(VIEW_W / 2 - 250, 100, 500, 260);
        ctx.fillStyle = "#00ffaa";
        ctx.font = "bold 15px monospace";
        ctx.textAlign = "left";
        for (let i = 0; i < tb.bootLineIdx; i++) {
            ctx.fillText(tb.bootLines[i], VIEW_W / 2 - 230, 140 + i * 35);
        }
        if (tb.bootLineIdx < tb.bootLines.length) {
            const txt = tb.bootLines[tb.bootLineIdx].substring(0, tb.bootCharIdx) + (tb.bootTimer % 20 < 10 ? "█" : "");
            ctx.fillText(txt, VIEW_W / 2 - 230, 140 + tb.bootLineIdx * 35);
        }
        ctx.restore();
        return;
    }
    if (tb.state === "fighting") {
        if (typeof window.BossHUD !== "undefined") {
            const hudColor = tb.bonusHp ? "#ffd700" : tb.dodgeMode ? "#ff0055" : "#00ffaa";
            window.BossHUD.update(tb.health, tb.maxHealth, hudColor);
        }
        const targetY = tb.vulnerable ? 380 : 90;
        tb.y += (targetY - tb.y) * .1;
        if (tb.turnPhase === "vibe_sequence") {
            tb.vulnerable = false;
            game.player.frozen = true;
            tb.vibeTimer++;
            if (tb.vibeStep === 1 && tb.vibeTimer === 1) {
                showAnimatedDialogue(__("ui_speaker_mawlerknight"), "😎", __("dlg_ia_ayudantes"), () => {}, 3e3);
            }
            if (tb.vibeStep === 1 && tb.vibeTimer > 150) {
                playSound(900, .3, "sine", .25);
                addFloatingText(VIEW_W / 2, VIEW_H / 2 + 60, __("flt_enemigos_generados"), "#00ffcc", 20);
                tb.vibeStep = 2;
                tb.vibeTimer = 0;
            }
            if (tb.vibeStep === 2 && tb.vibeTimer > 80) {
                tb.vibeStep = 3;
                tb.vibeTimer = 0;
                showAnimatedDialogue(__("ui_speaker_mawlerknight"), "😎", __("dlg_mas_grandes"), () => {
                    tb.vibeStep = 4;
                    tb.vibeTimer = 0;
                }, 3e3);
            }
            if (tb.vibeStep === 4) {
                if (tb.vibeTimer > 130) {
                    tb.vibeStep = 5;
                    tb.vibeTerminal = false;
                    const px = game.player.x;
                    tb.vibeEnemies = [ new Enemy({
                        x: px - 300,
                        y: 420,
                        w: 75,
                        h: 75,
                        health: 110,
                        maxHealth: 110,
                        speed: 1.5,
                        range: 130,
                        shoot: true,
                        shootInterval: 70,
                        type: "angry",
                        color: "#00ffcc"
                    }), new Enemy({
                        x: px + 260,
                        y: 420,
                        w: 75,
                        h: 75,
                        health: 110,
                        maxHealth: 110,
                        speed: 1.5,
                        range: 130,
                        shoot: true,
                        shootInterval: 70,
                        type: "angry",
                        color: "#00ffcc"
                    }) ];
                    tb.vibeEnemies.forEach(e => {
                        game.enemies.push(e);
                        createExplosion(e.x + e.w / 2, e.y + e.h / 2, "#00ffcc", 14);
                    });
                    playSound(500, .4, "sawtooth", .35, 200);
                    addFloatingText(VIEW_W / 2, VIEW_H / 2 + 60, __("flt_enemigos_amplificados"), "#ff00aa", 20);
                    game.player.frozen = true;
                    showAnimatedDialogue(__("ui_speaker_mawlerknight"), "😈", __("dlg_conoce_creacion"), () => {
                        game.player.frozen = false;
                        tb.turnPhase = "vibe_wait_minions";
                        tb.vibeTimer = 0;
                    }, 3e3);
                }
            }
        }
        if (tb.turnPhase === "vibe_wait_minions") {
            game.player.frozen = false;
            tb.vulnerable = false;
            if (!tb._vibeDeliveryShown && (!tb.vibeEnemies || tb.vibeEnemies.every(e => e.health <= 0))) {
                tb._vibeDeliveryShown = true;
                tb.turnDamageTaken = 0;
                tb.vulnerable = true;
                tb.turnPhase = "player_turn";
                addFloatingText(VIEW_W / 2, VIEW_H / 2 + 60, __("flt_entrega_completada"), "#00ffcc", 18);
            }
        }
        if (tb.turnPhase === "player_turn") {
            tb.vulnerable = true;
            if (tb._dashPendingDmg) {
                const d = tb._dashPendingDmg;
                tb._dashPendingDmg = 0;
                const actual = Math.min(d, tb.health);
                tb.health -= actual;
                tb.turnDamageTaken = (tb.turnDamageTaken || 0) + actual;
                tb.hitFlash = 10;
                addFloatingText(tb.x + tb.w / 2, tb.y - 14, "⚡-" + actual + " ⚡", "#ff00e0", 20);
                playSound(700, .15, "square", .25, 300);
                try {
                    applyShake(5);
                } catch (e) {}
                try {
                    createExplosion(tb.x + tb.w / 2, tb.y + tb.h / 2, "#00ffaa", 22, 12, [ "#00ffaa", "#ffffff" ]);
                } catch (e) {}
            }
            if ((tb.turnDamageTaken || 0) >= 10) {
                tb.attackTimer = 0;
                game.player.frozen = true;
                tb.turnPhase = "dialog_boss_turn";
                tb.vulnerable = false;
                if (tb.health <= tb.maxHealth * (70 / 80) && !tb._hudDestroyed) {
                    tb._hudDestroyed = true;
                    showAnimatedDialogue(__("ui_speaker_mawlerknight"), "😎", __("dlg_barra_vida"), () => {
                        tb._codeRain = 100;
                        tb._codeRainActive = true;
                        tb._transformCallback = () => {
                            game.hideHealthBar = true;
                            const bx0 = VIEW_W - 200, by0 = 15;
                            for (let k = 0; k < 45; k++) {
                                particles.push({
                                    x: bx0 + Math.random() * 180,
                                    y: by0 + Math.random() * 30,
                                    vx: (Math.random() - .5) * 7,
                                    vy: -Math.random() * 6 - 1,
                                    life: 60,
                                    color: [ "#ffd700", "#ffffff", "#ff69b4" ][Math.floor(Math.random() * 3)],
                                    size: 4 + Math.random() * 4,
                                    type: "spark"
                                });
                            }
                            playSound(1100, .35, "sine", .3, 2200);
                            applyShake(6);
                            addFloatingText(VIEW_W / 2, VIEW_H / 2, __("flt_hud_destruido"), "#ff1493", 26);
                            game.player.frozen = false;
                            tb.turnPhase = "boss_turn";
                            tb.attackTimer = 0;
                        };
                    }, 3e3);
                } else if (tb.health <= tb.maxHealth * (60 / 80) && !tb._controlsInverted) {
                    tb._controlsInverted = true;
                    showAnimatedDialogue(__("ui_speaker_mawlerknight"), "😎", __("dlg_invertir_controles"), () => {
                        tb._codeRain = 100;
                        tb._codeRainActive = true;
                        tb._transformCallback = () => {
                            game.invertControls = true;
                            keys["ArrowLeft"] = keys["ArrowRight"] = keys["x"] = keys[" "] = false;
                            addFloatingText(VIEW_W / 2, VIEW_H / 2, __("flt_controles_invertidos"), "#00ffcc", 26);
                            playSound(600, .3, "square", .3, 150);
                            showAnimatedDialogue(__("ui_speaker_mawlerknight"), "😈", __("dlg_mas_divertido"), () => {
                                game.player.frozen = false;
                                tb.turnPhase = "boss_turn";
                                tb.attackTimer = 0;
                            }, 3e3);
                        };
                    }, 3e3);
                } else {
                    showAnimatedDialogue(__("ui_speaker_mawlerknight"), "😎", __("dlg_mi_turno"), () => {
                        game.player.frozen = false;
                        tb.turnPhase = "boss_turn";
                        tb.attackTimer = 0;
                    }, 3e3);
                }
            }
        }
        if (tb.turnPhase === "boss_turn") {
            tb.vulnerable = false;
            tb.attackTimer++;
            if (tb.attackTimer === (window.postGameHorror ? 18 : 25)) {
                const count = (tb.bulletCount || 5) + (window.postGameHorror ? 3 : 0);
                const speed = (tb.phase >= 2 ? 5.5 : 4.5) * (window.postGameHorror ? 1.25 : 1);
                const px = game.player.x + game.player.w / 2;
                const py = game.player.y + game.player.h / 2;
                const originX = tb.x + tb.w / 2;
                const originY = tb.y + tb.h / 2;
                const baseAngle = Math.atan2(py - originY, px - originX);
                const spreadAngle = count >= 8 ? .28 : .35;
                for (let i = 0; i < count; i++) {
                    const offset = (i - (count - 1) / 2) * (spreadAngle / Math.max(1, count - 1));
                    const finalAngle = baseAngle + offset;
                    enemyProjectiles.push({
                        x: originX,
                        y: originY,
                        w: 16,
                        h: 16,
                        radius: 8,
                        vx: Math.cos(finalAngle) * speed,
                        vy: Math.sin(finalAngle) * speed,
                        color: tb.phase >= 5 ? "#ffd700" : tb.phase >= 2 ? "#ff00aa" : "#00ffaa",
                        isGiant: false,
                        damage: 12,
                        tbShot: true
                    });
                }
                playSound(320, .2, "square", .3, 180);
            }
            if (tb.attackTimer === 50 && tb.phase >= 3) {
                const count2 = Math.floor((tb.bulletCount || 5) * .7);
                const speed2 = (tb.phase >= 2 ? 5.5 : 4.5) * 1.2;
                const px2 = game.player.x + game.player.w / 2;
                const py2 = game.player.y + game.player.h / 2;
                const originX2 = tb.x + tb.w / 2;
                const originY2 = tb.y + tb.h / 2;
                const baseAngle2 = Math.atan2(py2 - originY2, px2 - originX2);
                for (let i = 0; i < count2; i++) {
                    const offset2 = (i - (count2 - 1) / 2) * .15;
                    const finalAngle2 = baseAngle2 + offset2;
                    enemyProjectiles.push({
                        x: originX2,
                        y: originY2,
                        w: 14,
                        h: 14,
                        radius: 7,
                        vx: Math.cos(finalAngle2) * speed2,
                        vy: Math.sin(finalAngle2) * speed2,
                        color: "#ff0055",
                        isGiant: false,
                        damage: 15,
                        tbShot: true
                    });
                }
                playSound(500, .2, "sawtooth", .3, 300);
            }
            if (tb.attackTimer > 95) {
                tb.turnPhase = "boss_turn_wait";
                tb.waitTimer = 0;
            }
        }
        if (tb.turnPhase === "boss_turn_wait") {
            tb.vulnerable = false;
            game.player.frozen = false;
            tb.waitTimer++;
            const bossBulletsLeft = enemyProjectiles.some(p => p.tbShot);
            if (!bossBulletsLeft || tb.waitTimer > 420) {
                tb.turnPhase = "dialog_player_turn";
                tb.vulnerable = true;
                tb.turnDamageTaken = 0;
                tb.hasTakenDodgeDmg = false;
                tb.missCount = 0;
                game.player.frozen = true;
                showAnimatedDialogue(__("ui_speaker_system"), "💻", __("dlg_tu_turno"), () => {
                    game.player.frozen = false;
                    tb.turnDamageTaken = 0;
                    tb.turnPhase = "player_turn";
                }, 3e3);
            }
        }
        function transformPhase(dialogText, callback) {
            tb.turnPhase = "phase_dialog";
            tb.vulnerable = false;
            tb._codeRain = 0;
            tb._codeRainActive = false;
            game.player.frozen = true;
            showAnimatedDialogue(__("ui_speaker_mawlerknight"), "😎", dialogText, () => {
                tb._codeRain = 180;
                tb._codeRainActive = true;
                tb._transformCallback = callback;
            }, 3e3);
        }
        if (tb.health <= tb.maxHealth * (50 / 80) && tb.phase < 2) {
            tb.phase = 2;
            tb.bulletCount = 10;
            transformPhase(__("dlg_alteremos_sistema"), () => {
                game.player.frozen = true;
                showAnimatedDialogue(__("ui_speaker_mawlerknight"), "😎", __("dlg_editemos_estadisticas"), () => {
                    tb.bulletCount = 10;
                    game.player.frozen = false;
                    tb.turnPhase = "boss_turn";
                    tb.attackTimer = 0;
                }, 3e3);
            });
        }
        if (tb.health <= tb.maxHealth * (40 / 80) && !tb.vibeCoding && tb.phase >= 2) {
            tb.vibeCoding = true;
            tb.turnPhase = "vibe_sequence";
            tb.vibeStep = 0;
            tb.vibeTimer = 0;
            tb.vibeEnemies = null;
            tb.vibeTerminal = false;
            tb._vibeDeliveryShown = false;
            tb.vulnerable = false;
            game.player.frozen = true;
            showAnimatedDialogue(__("ui_speaker_mawlerknight"), "😎", __("dlg_vibe_codear"), () => {
                tb.vibeTerminal = true;
                tb.vibeStep = 1;
                tb.vibeTimer = 0;
            }, 3e3);
        }
        if (tb.health <= tb.maxHealth * (30 / 80) && tb.phase < 3 && !tb.bonusHp && tb.turnPhase !== "vibe_sequence" && tb.turnPhase !== "vibe_wait_minions" && tb.turnPhase !== "boss_turn_wait" && tb.turnPhase !== "dialog_boss_turn" && tb.turnPhase !== "dialog_player_turn" && tb.turnPhase !== "phase_dialog") {
            tb.phase = 3;
            tb.bulletCount = 18;
            tb.growScale = 1.45;
            tb.w = 145;
            tb.h = 145;
            transformPhase(__("dlg_si_fuera_mas_grande"), () => {
                game.player.frozen = false;
                tb.turnPhase = "boss_turn";
                tb.attackTimer = 0;
            });
        }
        if (tb.health <= tb.maxHealth * (20 / 80) && tb.phase < 4 && !tb.bonusHp && tb.turnPhase !== "vibe_sequence" && tb.turnPhase !== "vibe_wait_minions" && tb.turnPhase !== "boss_turn_wait" && tb.turnPhase !== "dialog_boss_turn" && tb.turnPhase !== "dialog_player_turn" && tb.turnPhase !== "phase_dialog") {
            tb.phase = 4;
            tb.bulletCount = 20;
        }
        if (tb.health <= tb.maxHealth * (10 / 80) && !tb.askedYesNo && !tb.bonusHp && tb.turnPhase !== "vibe_sequence" && tb.turnPhase !== "vibe_wait_minions" && tb.turnPhase !== "boss_turn_wait" && tb.turnPhase !== "dialog_boss_turn" && tb.turnPhase !== "dialog_player_turn" && tb.turnPhase !== "phase_dialog") {
            tb.askedYesNo = true;
            tb.showChoice = true;
            tb.turnPhase = "choice_dialog";
            tb.vulnerable = false;
            game.player.frozen = true;
            if (btnSi) btnSi.blur();
            if (btnNo) btnNo.blur();
        }
        if (tb.health <= tb.maxHealth * (10 / 80) && tb.bonusHp && !tb.dodgeMode && tb.turnPhase !== "vibe_sequence" && tb.turnPhase !== "vibe_wait_minions" && tb.turnPhase !== "boss_turn_wait" && tb.turnPhase !== "dialog_boss_turn" && tb.turnPhase !== "dialog_player_turn" && tb.turnPhase !== "phase_dialog") {
            tb.dodgeMode = true;
            tb.phase = 6;
            tb.bulletCount = 22;
            tb.missCount = 0;
            transformPhase(__("dlg_alteremos_archivos"), () => {
                game.player.frozen = false;
                tb.turnPhase = "boss_turn";
                tb.attackTimer = 0;
            });
        }
        if (tb.health <= 0) {
            tb.state = "defeated";
            tb.defeatTimer = 30;
            if (typeof window.BossHUD !== "undefined") window.BossHUD.hide();
            game.player.frozen = true;
            game.arenaLocked = false;
            game.hideHealthBar = false;
            game.invertControls = false;
            keys["ArrowLeft"] = keys["ArrowRight"] = keys["x"] = keys[" "] = false;
            stopAllSFX();
            createExplosion(tb.x + tb.w / 2, tb.y + tb.h / 2, "#00ffaa", 80, 60);
            setTimeout(() => createExplosion(tb.x + 20, tb.y + 20, "#ff1493", 40, 40), 200);
            setTimeout(() => createExplosion(tb.x + tb.w - 20, tb.y + tb.h - 20, "#00ffcc", 40, 40), 400);
            setTimeout(() => createExplosion(tb.x + tb.w / 2, tb.y + 60, "#ffffff", 55, 50), 650);
            setTimeout(() => createExplosion(tb.x + tb.w / 2, tb.y + tb.h / 2, "#ffdd00", 60, 60), 900);
            playSound(150, .5, "sawtooth", .4, 40);
            applyShake(25);
            tb._deathScreenTimer = 210;
            tb._defeatDialogsStarted = false;
            return;
        }
        if (tb._codeRainActive && tb._codeRain > 0) {
            tb._codeRain--;
            ctx.save();
            ctx.fillStyle = "rgba(2, 10, 20, 0.88)";
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            ctx.fillStyle = "#00ffaa";
            ctx.font = "bold 14px monospace";
            ctx.textAlign = "center";
            ctx.fillText(__("sys_rewriting"), VIEW_W / 2, VIEW_H / 2 - 60);
            ctx.fillText(__("sys_overclock_level") + "=".repeat(30 - Math.floor(tb._codeRain / 6)) + " " + "]", VIEW_W / 2, VIEW_H / 2 - 30);
            ctx.font = "12px monospace";
            ctx.fillStyle = "#00ffaa";
            for (let c = 0; c < 35; c++) {
                const cx = 20 + c * 34;
                const cy = (tb._codeRain * 4 + c * 45) % (VIEW_H + 80) - 40;
                ctx.fillText(String.fromCharCode(12448 + c * 7 % 60), cx, cy);
            }
            ctx.restore();
            if (tb._codeRain <= 0) {
                tb._codeRainActive = false;
                tb.glowTimer = 60;
                playSound(650, .4, "sawtooth", .5, 300);
                if (tb._transformCallback) tb._transformCallback();
            }
            return;
        }
    }
    const arenaCenterX = 14750;
    const arenaScreenCenter = arenaCenterX - cameraX;
    if (arenaScreenCenter > -VIEW_W && arenaScreenCenter < VIEW_W * 2) {
        ctx.save();
        const gridFloorY = 480;
        ctx.strokeStyle = "rgba(0, 255, 204, 0.18)";
        ctx.lineWidth = 1;
        for (let gx = -VIEW_W; gx <= VIEW_W * 2; gx += 60) {
            const screenGX = gx - cameraX * .4 % 60;
            ctx.beginPath();
            ctx.moveTo(screenGX, gridFloorY);
            ctx.lineTo(screenGX * 1.3 - VIEW_W * .15, VIEW_H);
            ctx.stroke();
        }
        for (let gy = gridFloorY; gy <= VIEW_H; gy += 15) {
            ctx.beginPath();
            ctx.moveTo(0, gy);
            ctx.lineTo(VIEW_W, gy);
            ctx.stroke();
        }
        ctx.font = "10px monospace";
        const glyphs = [ "0", "1", "0x8F", "ACK", "SYN", "0xFF", "{ }", "< >", "CPU", "DATA" ];
        const seed = Math.floor(time * 8);
        for (let col = 0; col < 22; col++) {
            const colX = col * 48 + col * 17 % 31 - cameraX * .2 % (VIEW_W + 100);
            if (colX < -50 || colX > VIEW_W + 50) continue;
            const colSpeed = 1.2 + col % 4 * .6;
            const dropY = (time * 60 * colSpeed + col * 73) % (VIEW_H + 120) - 40;
            ctx.fillStyle = col % 2 === 0 ? "#ffffff" : "#00ffff";
            ctx.fillText(glyphs[(col + seed) % glyphs.length], colX, dropY);
            for (let trail = 1; trail <= 4; trail++) {
                const trailY = dropY - trail * 14;
                if (trailY > 0 && trailY < VIEW_H) {
                    ctx.fillStyle = `rgba(0, 255, 170, ${.45 - trail * .09})`;
                    ctx.fillText(glyphs[(col + seed + trail) % glyphs.length], colX, trailY);
                }
            }
        }
        ctx.restore();
    }
    if (tb.state === "fighting") {
        ctx.save();
        const term1W = 340, term1H = 165;
        const term1X = 14420 - cameraX;
        const term1Y = 24;
        if (term1X + term1W > -100 && term1X < VIEW_W + 100) {
            ctx.fillStyle = "#080d1a";
            ctx.strokeStyle = tb.phase >= 5 ? "#ff00ff" : tb.vulnerable ? "#00ffaa" : "#00f0ff";
            ctx.lineWidth = 3;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.roundRect(term1X, term1Y, term1W, term1H, 8);
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#101c33";
            ctx.fillRect(term1X + 2, term1Y + 2, term1W - 4, 24);
            ctx.fillStyle = "#00f0ff";
            ctx.font = "bold 11px monospace";
            ctx.textAlign = "left";
            ctx.fillText("💻 KERNEL v9.4 // MAWLERKNIGHT.SYS", term1X + 8, term1Y + 17);
            ctx.fillStyle = "#22c55e";
            ctx.beginPath();
            ctx.arc(term1X + term1W - 40, term1Y + 14, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#eab308";
            ctx.beginPath();
            ctx.arc(term1X + term1W - 26, term1Y + 14, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ef4444";
            ctx.beginPath();
            ctx.arc(term1X + term1W - 12, term1Y + 14, 4, 0, Math.PI * 2);
            ctx.fill();
            const scr1X = term1X + 8, scr1Y = term1Y + 30, scr1W = term1W - 16, scr1H = term1H - 38;
            ctx.fillStyle = "#020914";
            ctx.fillRect(scr1X, scr1Y, scr1W, scr1H);
            ctx.fillStyle = "rgba(0, 240, 255, 0.04)";
            for (let l = 0; l < scr1H; l += 3) {
                ctx.fillRect(scr1X, scr1Y + l, scr1W, 1.5);
            }
            ctx.font = "10px monospace";
            ctx.fillStyle = tb.phase >= 5 ? "#ff00ff" : "#00ffaa";
            const hpBars = Math.max(0, Math.floor(tb.health / 10));
            const hpBarStr = "[" + "█".repeat(hpBars) + "░".repeat(Math.max(0, 10 - hpBars)) + "]";
            ctx.fillText(`▶ INTEGRITY: ${hpBarStr} ${Math.ceil(tb.health)} HP`, scr1X + 8, scr1Y + 16);
            ctx.fillText(`▶ FIREWALL : ${tb.vulnerable ? "🔴 COMPROMISED [VULNERABLE]" : "🟢 SHIELD_ACTIVE [LOCK]"}`, scr1X + 8, scr1Y + 32);
            ctx.fillText(`▶ SYS_PHASE: PHASE ${tb.phase}/6 | OC: ${tb.phase >= 5 ? "MAX_OVERCLOCK" : "STABLE"}`, scr1X + 8, scr1Y + 48);
            ctx.fillText(`▶ THREAD   : ${tb.turnPhase === "player_turn" ? "EVASION_SUBROUTINE" : tb.turnPhase === "boss_turn" ? "OFFENSIVE_EXPLOIT" : "NEURAL_THINKING"}`, scr1X + 8, scr1Y + 64);
            ctx.strokeStyle = tb.vulnerable ? "#00ffaa" : "#00f0ff";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let ox = 0; ox < scr1W - 16; ox += 4) {
                const waveY = scr1Y + scr1H - 14 + Math.sin(time * .25 + ox * .12) * 7 * (tb.turnPhase === "boss_turn" ? 1.5 : .8);
                if (ox === 0) ctx.moveTo(scr1X + 8 + ox, waveY); else ctx.lineTo(scr1X + 8 + ox, waveY);
            }
            ctx.stroke();
        }
        const term2W = 340, term2H = 165;
        const term2X = 14880 - cameraX;
        const term2Y = 24;
        if (term2X + term2W > -100 && term2X < VIEW_W + 100 && game.player) {
            ctx.fillStyle = "#080d1a";
            ctx.strokeStyle = game.invertControls ? "#ff007f" : "#38bdf8";
            ctx.lineWidth = 3;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.roundRect(term2X, term2Y, term2W, term2H, 8);
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#101c33";
            ctx.fillRect(term2X + 2, term2Y + 2, term2W - 4, 24);
            ctx.fillStyle = "#38bdf8";
            ctx.font = "bold 11px monospace";
            ctx.textAlign = "left";
            ctx.fillText("🎯 TARGET MONITOR // PEGGY.EXE", term2X + 8, term2Y + 17);
            const scr2X = term2X + 8, scr2Y = term2Y + 30, scr2W = term2W - 16, scr2H = term2H - 38;
            ctx.fillStyle = "#020914";
            ctx.fillRect(scr2X, scr2Y, scr2W, scr2H);
            ctx.fillStyle = "rgba(56, 189, 248, 0.04)";
            for (let l = 0; l < scr2H; l += 3) {
                ctx.fillRect(scr2X, scr2Y + l, scr2W, 1.5);
            }
            const p = game.player;
            ctx.font = "10px monospace";
            ctx.fillStyle = game.invertControls ? "#ff007f" : "#38bdf8";
            ctx.fillText(`▶ POSITION : X=${Math.floor(p.x)}  Y=${Math.floor(p.y)}`, scr2X + 8, scr2Y + 16);
            ctx.fillText(`▶ VELOCITY : VX=${(p.vx || 0).toFixed(1)}  VY=${(p.vy || 0).toFixed(1)}`, scr2X + 8, scr2Y + 32);
            ctx.fillText(`▶ HACK_CTRL: ${game.invertControls ? "⚠️ INVERTED [ACTIVE]" : "🟢 NORMAL [BYPASS]"}`, scr2X + 8, scr2Y + 48);
            ctx.fillText(`▶ MATRIX   : ${tb.dodgeMode ? "⚡ DODGE_MATRIX_ENABLED" : "⚪ IDLE_TRACKING"}`, scr2X + 8, scr2Y + 64);
            const retX = scr2X + scr2W - 35, retY = scr2Y + scr2H - 24;
            const retR = 14;
            ctx.strokeStyle = game.invertControls ? "#ff007f" : "#38bdf8";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(retX, retY, retR, time * .1, time * .1 + Math.PI * 1.5);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(retX, retY, retR * .5, -time * .15, -time * .15 + Math.PI);
            ctx.stroke();
            ctx.fillStyle = game.invertControls ? "#ff007f" : "#38bdf8";
            ctx.fillRect(retX - 1.5, retY - 1.5, 3, 3);
        }
        ctx.restore();
    }
    ctx.save();
    const bossDrawX = drawX;
    const bossDrawY = drawY;
    const scaledW = tb.w;
    const scaledH = tb.h;
    const cx = bossDrawX + scaledW / 2;
    const cy = bossDrawY + scaledH / 2;
    const mainColor = window.postGameHorror ? "#dc2626" : tb.phase >= 5 ? "#ffd700" : tb.phase >= 2 ? "#ff00aa" : "#00f0ff";
    const isHit = tb.hitFlash && tb.hitFlash > 0;
    if (isHit) tb.hitFlash--;
    ctx.font = "bold 9px monospace";
    ctx.fillStyle = window.postGameHorror ? "#7f1d1d" : mainColor;
    const glyphsOrb = window.postGameHorror ? [ "DIE", "0x00", "VOID", "DEAD", "NULL", "666" ] : [ "0x7F", "0xFF", "ACK", "0x1A", "SYN", "0x9C" ];
    for (let g = 0; g < 4; g++) {
        const gAng = time * .04 + g * (Math.PI / 2);
        const gx = cx + Math.cos(gAng) * (scaledW * .95);
        const gy = cy + Math.sin(gAng) * (scaledH * .8) - 10;
        ctx.globalAlpha = .55 + .35 * Math.sin(time * .1 + g);
        ctx.fillText(glyphsOrb[(g + Math.floor(time * .1)) % glyphsOrb.length], gx - 12, gy);
    }
    ctx.globalAlpha = 1;
    const shoulderW = 28, shoulderH = 44;
    const leftShX = bossDrawX - 18, leftShY = bossDrawY + 18;
    ctx.fillStyle = isHit ? "#ffffff" : window.postGameHorror ? "#07070a" : "#0f172a";
    ctx.strokeStyle = window.postGameHorror ? "#7f1d1d" : mainColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(leftShX, leftShY);
    ctx.lineTo(leftShX + shoulderW, leftShY - 8);
    ctx.lineTo(leftShX + shoulderW, leftShY + shoulderH);
    ctx.lineTo(leftShX - 6, leftShY + shoulderH - 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    const rightShX = bossDrawX + scaledW - 10, rightShY = bossDrawY + 18;
    ctx.beginPath();
    ctx.moveTo(rightShX, rightShY - 8);
    ctx.lineTo(rightShX + shoulderW, rightShY);
    ctx.lineTo(rightShX + shoulderW + 6, rightShY + shoulderH - 10);
    ctx.lineTo(rightShX, rightShY + shoulderH);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (tb.phase >= 2 && Math.random() < .3) {
        particles.push({
            x: Math.random() < .5 ? leftShX : rightShX + shoulderW,
            y: leftShY + Math.random() * shoulderH,
            vx: (Math.random() - .5) * 4,
            vy: -Math.random() * 4 - 1,
            life: 14,
            color: mainColor,
            size: 2.5,
            type: "spark"
        });
    }
    ctx.fillStyle = isHit ? "#ffffff" : window.postGameHorror ? "#050508" : "#0a0f1d";
    ctx.strokeStyle = tb.vulnerable ? "#00ffaa" : window.postGameHorror ? "#990000" : mainColor;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = tb.vulnerable ? 25 : window.postGameHorror ? 10 : 16;
    ctx.beginPath();
    ctx.moveTo(bossDrawX + 16, bossDrawY);
    ctx.lineTo(bossDrawX + scaledW - 16, bossDrawY);
    ctx.lineTo(bossDrawX + scaledW, bossDrawY + 20);
    ctx.lineTo(bossDrawX + scaledW, bossDrawY + scaledH - 18);
    ctx.lineTo(bossDrawX + scaledW - 20, bossDrawY + scaledH);
    ctx.lineTo(bossDrawX + 20, bossDrawY + scaledH);
    ctx.lineTo(bossDrawX, bossDrawY + scaledH - 18);
    ctx.lineTo(bossDrawX, bossDrawY + 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = window.postGameHorror ? "rgba(220, 38, 38, 0.4)" : "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bossDrawX + 12, bossDrawY + 12);
    ctx.lineTo(bossDrawX + 30, bossDrawY + 12);
    ctx.moveTo(bossDrawX + scaledW - 30, bossDrawY + 12);
    ctx.lineTo(bossDrawX + scaledW - 12, bossDrawY + 12);
    ctx.stroke();
    const reactorY = cy + 16;
    const reactorR = 24;
    ctx.save();
    ctx.translate(cx, reactorY);
    ctx.rotate(time * .05);
    ctx.strokeStyle = window.postGameHorror ? "#7f1d1d" : mainColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, reactorR, 0, Math.PI * 1.5);
    ctx.stroke();
    ctx.fillStyle = window.postGameHorror ? "#990000" : "#ffffff";
    ctx.fillRect(reactorR - 3, -2, 6, 4);
    ctx.fillRect(-reactorR - 3, -2, 6, 4);
    ctx.restore();
    ctx.save();
    ctx.translate(cx, reactorY);
    ctx.rotate(-time * .08);
    ctx.strokeStyle = window.postGameHorror ? "#ff0000" : "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, reactorR * .65, 0, Math.PI * 1.2);
    ctx.stroke();
    ctx.restore();
    const coreGlow = ctx.createRadialGradient(cx, reactorY, 2, cx, reactorY, reactorR * .6);
    if (window.postGameHorror) {
        coreGlow.addColorStop(0, "#7f1d1d");
        coreGlow.addColorStop(.4, "#1c0505");
        coreGlow.addColorStop(1, "rgba(0,0,0,0)");
    } else {
        coreGlow.addColorStop(0, "#ffffff");
        coreGlow.addColorStop(.4, mainColor);
        coreGlow.addColorStop(1, "rgba(0,0,0,0)");
    }
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(cx, reactorY, reactorR * .6, 0, Math.PI * 2);
    ctx.fill();
    const visorW = scaledW * .78, visorH = 28;
    const visorX = cx - visorW / 2, visorY = bossDrawY + 22;
    if (window.postGameHorror) {
        ctx.fillStyle = "#020205";
        ctx.strokeStyle = "#990000";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(visorX - 2, visorY - 2, visorW + 4, visorH + 6, [ 8, 8, 4, 4 ]);
        ctx.fill();
        ctx.stroke();
        const eyeW = 16, eyeH = 14;
        const eyeSpacing = visorW * .26;
        for (let side of [ -1, 1 ]) {
            const ex = cx + side * eyeSpacing;
            const ey = visorY + 12;
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.ellipse(ex, ey, eyeW, eyeH, side * .08, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#450a0a";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
            ctx.beginPath();
            ctx.arc(ex, ey, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.moveTo(cx - 3, visorY + visorH - 2);
        ctx.lineTo(cx, visorY + visorH - 7);
        ctx.lineTo(cx + 3, visorY + visorH - 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#d4d4d8";
        for (let d = -4; d <= 4; d++) {
            const dx = cx + d * 6;
            const dy = visorY + visorH + 3;
            ctx.beginPath();
            ctx.moveTo(dx - 2.5, dy);
            ctx.lineTo(dx, dy + 5);
            ctx.lineTo(dx + 2.5, dy);
            ctx.closePath();
            ctx.fill();
        }
    } else {
        ctx.fillStyle = "#030712";
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(visorX, visorY, visorW, visorH, 5);
        ctx.fill();
        ctx.stroke();
        const vGrad = ctx.createLinearGradient(visorX, visorY, visorX + visorW, visorY + visorH);
        vGrad.addColorStop(0, "rgba(0, 240, 255, 0.85)");
        vGrad.addColorStop(.5, "rgba(255, 0, 170, 0.85)");
        vGrad.addColorStop(1, "rgba(0, 255, 170, 0.85)");
        ctx.fillStyle = vGrad;
        ctx.fillRect(visorX + 4, visorY + 3, visorW - 8, visorH - 6);
        let targetAngle = 0;
        if (game.player) {
            targetAngle = Math.atan2(game.player.y - (tb.y + 35), game.player.x - tb.x);
        }
        const eyeOffsetX = Math.cos(targetAngle) * 8;
        const eyeOffsetY = Math.sin(targetAngle) * 3;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx + eyeOffsetX, visorY + visorH / 2 + eyeOffsetY, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ff0033";
        ctx.beginPath();
        ctx.arc(cx + eyeOffsetX, visorY + visorH / 2 + eyeOffsetY, 2.8, 0, Math.PI * 2);
        ctx.fill();
        if (tb.state === "fighting" && game.player) {
            ctx.strokeStyle = "rgba(255, 0, 50, 0.22)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx + eyeOffsetX, visorY + visorH / 2 + eyeOffsetY);
            ctx.lineTo(game.player.x + game.player.w / 2 - cameraX, game.player.y + game.player.h / 2);
            ctx.stroke();
        }
    }
    const mouthY = bossDrawY + scaledH - 22;
    const mouthW = scaledW * .5;
    const mouthX = cx - mouthW / 2;
    ctx.fillStyle = "#020617";
    ctx.fillRect(mouthX, mouthY, mouthW, 10);
    ctx.fillStyle = tb.vulnerable ? "#00ffaa" : window.postGameHorror ? "#dc2626" : mainColor;
    for (let b = 0; b < 8; b++) {
        const barH = 2 + Math.sin(time * .28 + b * .9) * 4;
        ctx.fillRect(mouthX + 3 + b * 6, mouthY + 5 - barH / 2, 4, barH);
    }
    for (let k = 0; k < 4; k++) {
        const angle = time * .05 + k * Math.PI / 2;
        const orbX = cx + Math.cos(angle) * (scaledW * .78);
        const orbY = cy + Math.sin(angle) * (scaledH * .65);
        ctx.strokeStyle = "rgba(0, 240, 255, 0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(orbX, orbY);
        ctx.stroke();
        ctx.fillStyle = "#0f172a";
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(orbX, orbY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.arc(orbX, orbY, 2.5, 0, Math.PI * 2);
        ctx.fill();
    }
    if (!tb.vulnerable && tb.state === "fighting") {
        ctx.strokeStyle = "rgba(0, 240, 255, 0.75)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy, scaledW * .85, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
    if (tb.vibeTerminal) {
        ctx.save();
        const vtW = 520, vtH = 300;
        const vtX = VIEW_W / 2 - vtW / 2;
        const vtY = VIEW_H / 2 - vtH / 2;
        ctx.fillStyle = "rgba(5, 10, 20, 0.97)";
        ctx.strokeStyle = "#00ffcc";
        ctx.lineWidth = 4;
        ctx.shadowColor = "#00ffcc";
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.roundRect(vtX, vtY, vtW, vtH, 12);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#0a2030";
        ctx.fillRect(vtX + 2, vtY + 2, vtW - 4, 30);
        ctx.fillStyle = "#00ffcc";
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "left";
        ctx.fillText(__("neuronika_terminal"), vtX + 14, vtY + 22);
        ctx.fillStyle = "#ff5f56";
        ctx.beginPath();
        ctx.arc(vtX + vtW - 20, vtY + 17, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.textAlign = "center";
        ctx.font = "bold 30px monospace";
        ctx.fillStyle = "#00ffcc";
        ctx.shadowColor = "#00ffcc";
        ctx.shadowBlur = 15;
        ctx.fillText(__("neuronika_titulo"), VIEW_W / 2, vtY + 75);
        ctx.shadowBlur = 0;
        ctx.font = "11px monospace";
        ctx.fillStyle = "#66ffdd";
        ctx.fillText(__("neuronika_sub"), VIEW_W / 2, vtY + 95);
        const spinnerChars = [ "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏" ];
        const spin = spinnerChars[Math.floor(tb.vibeTimer / 6) % spinnerChars.length];
        ctx.textAlign = "left";
        ctx.font = "13px monospace";
        ctx.fillStyle = "#00ffcc";
        const promptLines = [];
        if (tb.vibeStep === 1) {
            promptLines.push(__("sys_neuronika_cmd1"));
            promptLines.push("");
            promptLines.push(__("term_thinking"));
            promptLines.push(__("term_log_import"));
            promptLines.push(__("term_log_compile"));
            promptLines.push(__("term_log_calibrate"));
        } else if (tb.vibeStep === 2 || tb.vibeStep === 3) {
            promptLines.push(__("sys_neuronika_cmd2"));
            promptLines.push("");
            promptLines.push(__("term_amplifying"));
            promptLines.push(__("term_log_scale"));
            promptLines.push(__("term_log_aggro"));
            promptLines.push(__("term_log_inject"));
        } else if (tb.vibeStep === 4) {
            promptLines.push(__("sys_neuronika_cmd2"));
            promptLines.push("");
            promptLines.push(__("term_amplifying_pct", Math.min(100, Math.floor(tb.vibeTimer / 1.3))));
        }
        promptLines.forEach((line, idx) => {
            if (line) ctx.fillText(line, vtX + 20, vtY + 125 + idx * 22);
        });
        if (Math.floor(tb.vibeTimer / 15) % 2 === 0) {
            ctx.fillStyle = "#00ffcc";
            ctx.fillRect(vtX + 20 + ctx.measureText("$").width + 12, vtY + 125 + promptLines.length * 22 - 12, 10, 16);
        }
        ctx.restore();
    }
    if (tb.showChoice) {
        ctx.save();
        const modalW = 380, modalH = 180;
        const modalX = VIEW_W / 2 - modalW / 2;
        const modalY = VIEW_H / 2 - modalH / 2;
        ctx.fillStyle = "rgba(15, 23, 42, 0.96)";
        ctx.fillRect(modalX, modalY, modalW, modalH);
        ctx.strokeStyle = "#00ffaa";
        ctx.lineWidth = 4;
        ctx.shadowColor = "#00ffaa";
        ctx.shadowBlur = 20;
        ctx.strokeRect(modalX, modalY, modalW, modalH);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#00ffaa";
        ctx.font = "bold 14px monospace";
        ctx.textAlign = "center";
        ctx.fillText(__("sys_prompt"), VIEW_W / 2, modalY + 30);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px monospace";
        ctx.fillText(__("ui_crees_ganar"), VIEW_W / 2, modalY + 65);
        const btnW = 120, btnH = 45;
        const btn1X = VIEW_W / 2 - 140;
        const btn2X = VIEW_W / 2 + 20;
        const btnY = modalY + 95;
        ctx.fillStyle = tb.selectedOption === 0 ? "#00ffaa" : "#1e293b";
        ctx.fillRect(btn1X, btnY, btnW, btnH);
        ctx.strokeStyle = "#00ffaa";
        ctx.lineWidth = 2;
        ctx.strokeRect(btn1X, btnY, btnW, btnH);
        ctx.fillStyle = tb.selectedOption === 0 ? "#0f172a" : "#ffffff";
        ctx.font = "bold 18px monospace";
        ctx.fillText(__("ui_si_btn"), btn1X + btnW / 2, btnY + 28);
        ctx.fillStyle = tb.selectedOption === 1 ? "#00ffaa" : "#1e293b";
        ctx.fillRect(btn2X, btnY, btnW, btnH);
        ctx.strokeStyle = "#00ffaa";
        ctx.lineWidth = 2;
        ctx.strokeRect(btn2X, btnY, btnW, btnH);
        ctx.fillStyle = tb.selectedOption === 1 ? "#0f172a" : "#ffffff";
        ctx.fillText(__("ui_no_btn"), btn2X + btnW / 2, btnY + 28);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "11px monospace";
        ctx.fillText(__("ui_flechas_enter"), VIEW_W / 2, modalY + 165);
        ctx.restore();
    }
    if (tb.state === "defeated" && tb.defeatTimer > 0) {
        tb.defeatTimer--;
        if (Math.random() < .5) {
            particles.push({
                x: tb.x + tb.w / 2 + (Math.random() - .5) * tb.w,
                y: tb.y + tb.h / 2 + (Math.random() - .5) * tb.h,
                vx: (Math.random() - .5) * 12,
                vy: (Math.random() - .5) * 12,
                life: 30,
                color: [ "#00ffaa", "#ff00ff", "#ffd700" ][Math.floor(Math.random() * 3)],
                size: 6 + Math.random() * 6,
                type: "spark"
            });
        }
    }
    if (game.invertControls && currentLevel === 1) {
        drawInvertControlsHUD(ctx, time);
    }
}

function drawInvertControlsHUD(ctx, time) {
    ctx.save();
    const hudW = 210;
    const hudH = 46;
    const hudX = VIEW_W - hudW - 14;
    const hudY = 82;
    const isBlink = Math.floor(time * 12) % 2 === 0;
    ctx.fillStyle = "rgba(20, 5, 25, 0.92)";
    ctx.strokeStyle = isBlink ? "#ff007f" : "#00ffff";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(hudX, hudY, hudW, hudH, 6); else ctx.rect(hudX, hudY, hudW, hudH);
    ctx.fill();
    ctx.stroke();
    const badgeX = hudX + 8;
    const badgeY = hudY + 6;
    const badgeS = 24;
    ctx.fillStyle = "rgba(255, 0, 128, 0.22)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(badgeX, badgeY, badgeS, badgeS, 5); else ctx.fillRect(badgeX, badgeY, badgeS, badgeS);
    ctx.fill();
    ctx.font = "bold 15px sans-serif";
    ctx.fillStyle = "#ff007f";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🕹️", badgeX + badgeS / 2, badgeY + badgeS / 2 + 1);
    const titleText = (typeof __ === "function" ? __("flt_controles_invertidos") : "🔄 CONTROLES INVERTIDOS").replace(/^[🔄🎮🕹️\s]+/, "");
    ctx.font = 'bold 11px "Segoe UI", monospace, sans-serif';
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(titleText, badgeX + badgeS + 7, badgeY + 7, hudW - badgeS - 18);
    ctx.font = "bold 10px monospace";
    ctx.fillStyle = isBlink ? "#ffd700" : "#00ffff";
    ctx.fillText("⬅️ = ➡️  |  ➡️ = ⬅️", badgeX + badgeS + 7, badgeY + 20);
    const barX = hudX + 8;
    const barY = hudY + hudH - 8;
    const barW = hudW - 16;
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.fillRect(barX, barY, barW, 3);
    ctx.fillStyle = isBlink ? "#ff007f" : "#00ffff";
    const pulseOffset = time * 60 % barW;
    ctx.fillRect(barX + pulseOffset % (barW - 30), barY, 30, 3);
    ctx.restore();
}

window.drawInvertControlsHUD = drawInvertControlsHUD;
// Isaac Daniel Cotera - 2026 | Correo: isaacdanielcotera@gmail.com | Itch.io: https://cotera.itch.io | GitHub: https://github.com/cotera2024
