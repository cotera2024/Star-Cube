(function() {
    "use strict";
    function cinema(fn) {
        const token = typeof CINEMA_TOKEN !== "undefined" ? CINEMA_TOKEN : 0;
        return function(...args) {
            if (typeof CINEMA_TOKEN !== "undefined" && token !== CINEMA_TOKEN) return;
            fn.apply(this, args);
        };
    }
    function createKrakatoaBoss() {
        return {
            x: 22850,
            y: 580,
            targetY: 300,
            w: 160,
            h: 180,
            health: typeof window !== "undefined" && window.postGameHorror ? 640 : 320,
            maxHealth: typeof window !== "undefined" && window.postGameHorror ? 640 : 320,
            state: "idle",
            stateTimer: 0,
            emergePositions: [ 22450, 22850, 23200 ],
            posIndex: 1,
            salvosLeft: 1,
            salvoTimer: 0,
            hitFlash: 0,
            facing: -1,
            tentaclePhase: 0,
            defeatedTimer: 0,
            rageMode: false,
            cycleCount: 0,
            patternIndex: 0,
            buttons: [],
            sealActive: false,
            stoneX: 0,
            stoneY: -999,
            stoneRestingY: 0,
            stoneImpactY: 225,
            stoneTimer: 0,
            get hitX() {
                return this.x - this.w / 2;
            },
            get hitY() {
                return this.y - 70;
            },
            get hitW() {
                return this.w;
            },
            get hitH() {
                return this.h;
            },
            isHittable: function(proj) {
                if (this.state !== "stunned") return false;
                if (this.y > 450) return false;
                const hx = this.hitX;
                const hy = this.hitY;
                const hw = this.hitW;
                const hh = this.hitH;
                return proj.x < hx + hw && proj.x + (proj.w || 10) > hx && proj.y < hy + hh && proj.y + (proj.h || 10) > hy;
            },
            takeDamage: function(amount, chargeLevel) {
                if (this.health <= 0 || this.state === "defeated") return;
                if (game.godMode) amount = 999;
                const mult = this.state === "vulnerable" || this.state === "stunned" ? 1.5 : .8;
                const actualDmg = Math.max(1, Math.round(amount * mult));
                this.health = Math.max(0, this.health - actualDmg);
                this.hitFlash = 10;
                applyShake(this.state === "vulnerable" ? 10 : 5);
                playSound(160, .15, "sawtooth", .25, 70);
                const hx = this.x + (Math.random() - .5) * 40;
                const hy = this.hitY + 20 + (Math.random() - .5) * 30;
                const dmgCol = this.state === "vulnerable" ? "#fde047" : "#38bdf8";
                addFloatingText(hx, hy, "-" + actualDmg, dmgCol, this.state === "vulnerable" ? 22 : 16);
                for (let k = 0; k < 8; k++) {
                    particles.push({
                        x: hx,
                        y: hy,
                        vx: (Math.random() - .5) * 8,
                        vy: (Math.random() - .5) * 8,
                        life: 14,
                        color: [ "#06b6d4", "#ec4899", "#ffffff", "#38bdf8" ][Math.floor(Math.random() * 4)],
                        size: 3 + Math.random() * 3,
                        type: "spark"
                    });
                }
                if (window.BossHUD) {
                    const hudColor = this.health <= this.maxHealth * .35 ? "#ef4444" : "#06b6d4";
                    window.BossHUD.update(this.health, this.maxHealth, hudColor);
                }
                if (this.health <= this.maxHealth * .5 && !this.rageMode) {
                    this.rageMode = true;
                    addFloatingText(this.x, this.hitY - 20, __("flt_furia_abismo"), "#ef4444", 22);
                    playSound(90, .5, "sawtooth", .4, 40);
                    applyShake(18);
                    if (typeof showAnimatedDialogue === "function") {
                        showAnimatedDialogue(__("dlg_krakatoa_name") || "Krakatoaaa", "🐙", __("dlg_krakatoa_rage"), null, 2600);
                    }
                }
                if (this.health <= 0) {
                    this.triggerDefeat();
                }
            },
            triggerDefeat: function() {
                this.state = "defeated";
                this.defeatedTimer = 0;
                applyShake(30);
                try {
                    stopAllSFX();
                } catch (e) {}
                playSound(70, .8, "sawtooth", .5, 30);
                createExplosion(this.x, this.y, "#06b6d4", 70, 50, [ "#00ffff", "#ffffff", "#ec4899", "#38bdf8" ]);
                addFloatingText(this.x, this.hitY - 30, __("flt_jefe_derrotado"), "#00ff88", 28);
                if (window.BossHUD) {
                    window.BossHUD.hide();
                }
                const self = this;
                if (game.player) game.player.frozen = true;
                if (typeof showAnimatedDialogue === "function") {
                    showAnimatedDialogue(__("dlg_krakatoa_name") || "Krakatoaaa", "🐙", __("dlg_krakatoa_defeat"), cinema(() => {
                        if (game.player) game.player.frozen = false;
                        finishKrakatoaDefeat(self);
                    }), 3200);
                } else {
                    if (game.player) game.player.frozen = false;
                    finishKrakatoaDefeat(self);
                }
            }
        };
    }
    function finishKrakatoaDefeat(boss) {
        removeKrakatoaButtons();
        boss.sealActive = false;
        game.arenaLocked = false;
        const entranceGateDef = game.platforms.find(p => p.isArenaGate === "entrance");
        const exitGateDef = game.platforms.find(p => p.isArenaGate === "exit");
        [ entranceGateDef, exitGateDef ].forEach(gate => {
            if (gate && typeof gsap !== "undefined") {
                try {
                    gsap.killTweensOf(gate);
                } catch (e) {}
                gsap.to(gate, {
                    y: -250,
                    duration: 1.2,
                    ease: "power2.out"
                });
            }
        });
        if (typeof stopAllSFX === "function") stopAllSFX();
        const strikeLightning = (intensity, duration) => {
            game.flash = intensity;
            applyShake(intensity);
            playSound(100, .8, "sawtooth", .6, duration);
        };
        setTimeout(cinema(() => {
            strikeLightning(20, 25);
            setTimeout(cinema(() => {
                strikeLightning(25, 30);
                setTimeout(cinema(() => {
                    strikeLightning(35, 45);
                    game.stormMode = true;
                    if (typeof window.initStormMode === "function") {
                        window.initStormMode(true);
                    }
                    if (!window.postGameHorror) {
                        try {
                            playBGM("bgm_world4_storm");
                        } catch (e) {}
                    }
                    try {
                        addFloatingText(boss.x, boss.hitY - 65, __("ui_storm_alert") || "⛈️ ¡TEMPESTAD MAREADA!", "#38bdf8", 26);
                        if (exitGateDef) {
                            addFloatingText(exitGateDef.x + exitGateDef.w / 2, 280, __("flt_camino_libre"), "#38bdf8", 18);
                        }
                    } catch (e) {}
                }), 800);
            }), 600);
        }), 400);
    }
    function updateKrakatoa(boss) {
        if (!game.player) return;
        boss.tentaclePhase += .08;
        if (boss.hitFlash > 0) boss.hitFlash--;
        const playerX = game.player.x + game.player.w / 2;
        boss.facing = playerX < boss.x ? -1 : 1;
        if (boss.sealActive && boss.buttons && boss.buttons.length > 0) {
            let allPressed = true;
            for (let k = 0; k < boss.buttons.length; k++) {
                const btn = boss.buttons[k];
                if (btn.pressed) continue;
                const pbx = game.player.x + game.player.w / 2;
                const pby = game.player.y + game.player.h;
                if (game.player.onGround && pbx > btn.x && pbx < btn.x + btn.w && Math.abs(pby - (btn.y + btn.h)) < 15) {
                    btn.pressed = true;
                    try {
                        playSound(140, .22, "sawtooth", .45, 50);
                        playSound(660, .1, "square", .2, 300);
                    } catch (e) {}
                    if (typeof screenShake !== "undefined") screenShake.intensity = 5;
                    createExplosion(btn.x + btn.w / 2, btn.y + btn.h / 2, "#ff1744", 26, 16, [ "#ffffff", "#ff1744", "#ff9500" ]);
                    addFloatingText(btn.x + btn.w / 2, btn.y - 14, __("flt_btn_activado"), "#4ade80", 20);
                }
                if (!btn.pressed) allPressed = false;
            }
            if (allPressed) {
                removeKrakatoaButtons();
                boss.sealActive = false;
                startStoneCinematic(boss);
                return;
            }
        }
        if (boss.state === "idle") {
            if (currentLevel === 3 && game.player.x > 22300 && game.player.x < 23300 && game.player.onGround && !game.arenaLocked) {
                boss.state = "arena_closing";
                boss.stateTimer = 0;
                game.player.frozen = true;
                closeKrakatoaArena(boss);
            }
            return;
        }
        if (boss.state === "arena_closing") {
            return;
        }
        if (boss.state === "intro") return;
        if (boss.state === "emerging") {
            if (boss.stateTimer === 0 && game.player && game.player.frozen) {
                game.player.frozen = false;
            }
            boss.y += (boss.targetY - boss.y) * .08;
            if (Math.random() < .6) {
                particles.push({
                    x: boss.x + (Math.random() - .5) * 120,
                    y: 495,
                    vx: (Math.random() - .5) * 6,
                    vy: -Math.random() * 6 - 2,
                    life: 14,
                    color: "#38bdf8",
                    size: 3 + Math.random() * 3,
                    type: "spark"
                });
            }
            if (Math.abs(boss.y - boss.targetY) < 6) {
                boss.y = boss.targetY;
                boss.state = "attack";
                boss.salvosLeft = 1;
                boss.salvoTimer = 40;
                playSound(220, .4, "sawtooth", .3, 90);
            }
            return;
        }
        if (boss.state === "attack") {
            boss.salvoTimer--;
            if (boss.salvoTimer <= 0) {
                if (boss.patternIndex === 0) fireBigBallPattern(boss); else fireInkRainPattern(boss);
                boss.state = "submerging";
                playSound(320, .2, "triangle", .25, 120);
            }
            return;
        }
        if (boss.state === "vulnerable" || boss.state === "stunned") {
            boss.stateTimer--;
            const restY = boss.targetY + 25;
            boss.y += (restY - boss.y) * .05;
            const starFreq = boss.state === "stunned" ? 12 : 18;
            if (boss.stateTimer % starFreq === 0) {
                particles.push({
                    x: boss.x + (Math.random() - .5) * 60,
                    y: boss.hitY + (Math.random() - .5) * 20,
                    vx: (Math.random() - .5) * 2,
                    vy: -1.5,
                    life: 20,
                    color: "#fde047",
                    size: 3.5,
                    type: "spark"
                });
            }
            if (boss.stateTimer <= 0) {
                boss.state = "submerging";
                boss.stoneY = -999;
                try {
                    stopAllSFX();
                } catch (e) {}
                playSound(140, .4, "sine", .35, 60);
                createExplosion(boss.x, 495, "#06b6d4", 35, 20, [ "#00ffff", "#ffffff", "#38bdf8" ]);
            }
            return;
        }
        if (boss.state === "submerging") {
            boss.y += 6.5;
            particles.push({
                x: boss.x + (Math.random() - .5) * 110,
                y: 495,
                vx: (Math.random() - .5) * 6,
                vy: -Math.random() * 5,
                life: 12,
                color: "#38bdf8",
                size: 3,
                type: "spark"
            });
            if (boss.y >= 580) {
                boss.y = 580;
                boss.cycleCount++;
                if (boss.cycleCount % 3 === 0 && !boss.sealActive) {
                    spawnKrakatoaButtons(boss);
                    boss.sealActive = true;
                    playSound(260, .25, "square", .25, 100);
                    addFloatingText(boss.x, 300, __("flt_krakatoa_buttons"), "#ff1744", 26);
                    if (typeof showAnimatedDialogue === "function") {
                        showAnimatedDialogue(__("dlg_krakatoa_name") || "Krakatoaaa", "🐙", __("dlg_krakatoa_buttons"), null, 2400);
                    }
                }
                boss.state = "submerged";
                boss.stateTimer = 80;
                boss.patternIndex = (boss.patternIndex + 1) % 2;
                let nextPos;
                do {
                    nextPos = Math.floor(Math.random() * boss.emergePositions.length);
                } while (nextPos === boss.posIndex);
                boss.posIndex = nextPos;
            }
            return;
        }
        if (boss.state === "stone_cin") {
            boss.stoneTimer++;
            const st = boss.stoneTimer;
            if (st < 55) {
                boss.x += (boss.stoneX - boss.x) * .1;
                boss.y += (boss.targetY - boss.y) * .07;
                if (st % 11 === 0) applyShake(4);
            } else if (st === 55) {
                playSound(70, .8, "sawtooth", .5, 30);
                applyShake(20);
                createExplosion(boss.x, 495, "#06b6d4", 40, 24, [ "#00ffff", "#ffffff", "#38bdf8" ]);
            }
            if (st >= 55 && boss.stoneY < boss.stoneImpactY) boss.stoneY += 11;
            if (boss.stoneY >= boss.stoneImpactY) {
                boss.stoneY = boss.stoneImpactY;
                boss.stoneRestingY = boss.stoneImpactY;
                boss.stoneTimer = 0;
                boss.state = "stunned";
                boss.stateTimer = boss.rageMode ? 150 : 200;
                applyShake(34);
                game.flash = 28;
                playSound(60, 1, "sawtooth", .6, 30);
                try {
                    playSFX("sfx_rock_impact");
                } catch (e) {}
                setTimeout(cinema(() => {
                    try {
                        playSFX("sfx_pain_grunt");
                    } catch (e) {}
                }), 350);
                try {
                    playSFX("sfx_dizzy_loop");
                } catch (e) {}
                createExplosion(boss.x, boss.stoneImpactY + 10, "#9aa5b1", 44, 30, [ "#ffffff", "#9aa5b1", "#52525b" ]);
                addFloatingText(boss.x, boss.hitY - 40, __("flt_krakatoa_stone"), "#e2e8f0", 26);
                addFloatingText(boss.x, boss.hitY - 66, __("flt_krakatoa_stunned"), "#fde047", 24);
                if (game.player) game.player.frozen = false;
                if (window.BossHUD) window.BossHUD.update(boss.health, boss.maxHealth, "#06b6d4");
                delete game.cameraOverrideX;
            }
            return;
        }
        if (boss.state === "submerged") {
            boss.stateTimer--;
            const destX = boss.emergePositions[boss.posIndex];
            boss.x += (destX - boss.x) * .08;
            if (boss.stateTimer % 6 === 0) {
                particles.push({
                    x: boss.x + (Math.random() - .5) * 40,
                    y: 495,
                    vx: (Math.random() - .5) * 2,
                    vy: -1.2,
                    life: 18,
                    color: "#e0f2fe",
                    size: 2.5,
                    type: "spark"
                });
            }
            if (boss.stateTimer <= 0) {
                boss.x = destX;
                boss.state = "emerging";
                boss.targetY = 290 + Math.random() * 30;
                playSound(180, .4, "sine", .4, 90);
                applyShake(14);
                createExplosion(boss.x, 495, "#06b6d4", 40, 24, [ "#00ffff", "#ffffff", "#38bdf8" ]);
            }
            return;
        }
        if (boss.state === "defeated") {
            boss.defeatedTimer++;
            boss.y += 1.8;
            if (boss.defeatedTimer % 12 === 0 && boss.y < 580) {
                createExplosion(boss.x + (Math.random() - .5) * 80, boss.y - 30 + (Math.random() - .5) * 50, "#06b6d4", 25, 14);
            }
        }
    }
    function fireBigBallPattern(boss) {
        if (!game.player) return;
        const cx = boss.x;
        const cy = boss.y - 10;
        const targetX = game.player.x + game.player.w / 2;
        const targetY = game.player.y + game.player.h / 2;
        const angle = Math.atan2(targetY - cy, targetX - cx);
        playSound(120, .8, "sine", .5, 60);
        applyShake(10);
        const ballSpeed = (boss.rageMode ? 2.6 : 1.6) * (window.postGameHorror ? 1.3 : 1);
        enemyProjectiles.push({
            x: cx,
            y: cy - 10,
            w: 62,
            h: 62,
            radius: 31,
            vx: Math.cos(angle) * ballSpeed,
            vy: Math.sin(angle) * ballSpeed,
            damage: 50,
            isKrakenBigBall: true,
            color: boss.rageMode ? "#ff1744" : "#0284c7",
            life: 1500
        });
        addFloatingText(cx + Math.cos(angle) * 70, cy + Math.sin(angle) * 70 - 24, __("flt_krakatoa_bigball"), "#38bdf8", 24);
        const count = (boss.rageMode ? 7 : 5) + (window.postGameHorror ? 2 : 0);
        const spread = boss.rageMode ? .5 : .36;
        const startAng = angle - spread * (count - 1) / 2;
        const fanSpeed = (boss.rageMode ? 6.2 : 5) * (window.postGameHorror ? 1.25 : 1);
        for (let s = 0; s < count; s++) {
            const curAng = startAng + s * spread;
            enemyProjectiles.push({
                x: cx + Math.cos(curAng) * 30,
                y: cy + Math.sin(curAng) * 30,
                vx: Math.cos(curAng) * fanSpeed,
                vy: Math.sin(curAng) * fanSpeed,
                w: 13,
                h: 13,
                radius: 6.5,
                damage: boss.rageMode ? 16 : 13,
                isWaterBullet: true,
                color: boss.rageMode ? "#f43f5e" : "#06b6d4",
                life: 260
            });
        }
    }
    function fireInkRainPattern(boss) {
        if (!game.player) return;
        const cx = boss.x;
        const cy = boss.y - 10;
        const targetX = game.player.x + game.player.w / 2;
        const targetY = game.player.y + game.player.h / 2;
        const angle = Math.atan2(targetY - cy, targetX - cx);
        playSound(150, .3, "sawtooth", .35, 70);
        applyShake(8);
        const count = boss.rageMode ? 5 : 3;
        const spread = .5;
        const startAng = angle - spread * (count - 1) / 2;
        const inkSpeed = boss.rageMode ? 4.8 : 3.9;
        for (let s = 0; s < count; s++) {
            const curAng = startAng + s * spread;
            enemyProjectiles.push({
                x: cx + Math.cos(curAng) * 26,
                y: cy + Math.sin(curAng) * 26,
                vx: Math.cos(curAng) * inkSpeed,
                vy: Math.sin(curAng) * inkSpeed,
                w: 20,
                h: 20,
                radius: 10,
                damage: 25,
                isInkBullet: true,
                color: "#0a0614",
                trail: []
            });
        }
        addFloatingText(cx, cy - 70, __("flt_krakatoa_ink3"), "#c084fc", 22);
    }
    function spawnKrakatoaButtons(boss) {
        removeKrakatoaButtons();
        boss.buttons = [];
        const lanes = [ {
            minX: 22290,
            maxX: 22440,
            surfaceY: 400
        }, {
            minX: 23110,
            maxX: 23250,
            surfaceY: 400
        }, {
            minX: 22660,
            maxX: 22830,
            surfaceY: 240
        } ];
        for (let k = 0; k < 3; k++) {
            const lane = lanes[k];
            const bx = lane.minX + Math.random() * (lane.maxX - lane.minX);
            const w = 56, h = 16;
            if (k === 2) {
                const ped = new Platform({
                    x: bx - w / 2,
                    y: lane.surfaceY,
                    w: w + 24,
                    h: 12
                });
                ped._krakBtn = 1;
                game.platforms.push(ped);
            }
            boss.buttons.push({
                x: bx - w / 2,
                y: lane.surfaceY - h,
                w: w,
                h: h,
                pressed: false
            });
        }
    }
    function removeKrakatoaButtons() {
        for (let i = game.platforms.length - 1; i >= 0; i--) {
            if (game.platforms[i]._krakBtn) game.platforms.splice(i, 1);
        }
    }
    function startStoneCinematic(boss) {
        boss.state = "stone_cin";
        boss.stoneX = 22850;
        boss.stoneY = -160;
        boss.stoneRestingY = 0;
        boss.stoneImpactY = 215;
        boss.stoneTimer = 0;
        boss.targetY = 300;
        boss.y = 580;
        boss.x = boss.stoneX;
        if (game.player) game.player.frozen = true;
        applyShake(12);
        playSound(90, .6, "sawtooth", .5, 35);
        if (typeof gsap !== "undefined") {
            gsap.to(game, {
                cameraOverrideX: boss.stoneX - VIEW_W / 2,
                duration: .7,
                ease: "power2.inOut"
            });
        }
    }
    function closeKrakatoaArena(boss) {
        const entranceGateDef = game.platforms.find(p => p.isArenaGate === "entrance");
        const exitGateDef = game.platforms.find(p => p.isArenaGate === "exit");
        game.arenaLocked = true;
        game.arenaMinX = entranceGateDef ? entranceGateDef.x + entranceGateDef.w : 22210;
        game.arenaMaxX = exitGateDef ? exitGateDef.x : 23480;
        if (!entranceGateDef || !exitGateDef || typeof gsap === "undefined") {
            startKrakatoaBattle(boss);
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
            cameraOverrideX: exitGateDef.x - VIEW_W / 2 + exitGateDef.w / 2,
            duration: .7,
            ease: "power2.inOut",
            onComplete: () => {
                gsap.to(exitGateDef, {
                    y: 160,
                    duration: .4,
                    ease: "bounce.out",
                    onComplete: () => {
                        playSound(110, .45, "sawtooth", .4, 40);
                        applyShake(16);
                        gsap.to(game, {
                            cameraOverrideX: entranceGateDef.x - VIEW_W / 2 + entranceGateDef.w / 2,
                            duration: .7,
                            ease: "power2.inOut",
                            onComplete: () => {
                                gsap.to(entranceGateDef, {
                                    y: 160,
                                    duration: .4,
                                    ease: "bounce.out",
                                    onComplete: () => {
                                        playSound(110, .45, "sawtooth", .4, 40);
                                        applyShake(18);
                                        gsap.to(game, {
                                            cameraOverrideX: boss.x - VIEW_W / 2,
                                            duration: .8,
                                            ease: "power2.inOut",
                                            onComplete: () => {
                                                delete game.cameraOverrideX;
                                                startKrakatoaBattle(boss);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
    function startKrakatoaBattle(boss) {
        boss.state = "intro";
        boss.targetY = 300;
        boss.y = 580;
        boss.cycleCount = 0;
        boss.patternIndex = 0;
        boss.buttons = [];
        boss.sealActive = false;
        if (!window.postGameHorror) {
            try {
                playBGM("bgm_boss_kraken");
            } catch (e) {}
        }
        applyShake(28);
        playSound(80, .8, "sawtooth", .5, 30);
        createExplosion(boss.x, 495, "#06b6d4", 60, 36, [ "#00ffff", "#ffffff", "#38bdf8", "#ec4899" ]);
        if (game.player) game.player.frozen = true;
        if (typeof showAnimatedDialogue === "function") {
            showAnimatedDialogue(__("dlg_krakatoa_name") || "Krakatoaaa", "🐙", __("dlg_krakatoa_intro_1"), cinema(() => {
                showAnimatedDialogue(__("dlg_krakatoa_name") || "Krakatoaaa", "🐙", __("dlg_krakatoa_intro_2"), cinema(() => {
                    boss.state = "emerging";
                    boss.y = 350;
                    if (typeof window.playBossPresentation === "function") {
                        window.playBossPresentation({
                            name: __("boss_name_4") || "KRAKATOAAA",
                            title: __("boss_title_4") || "EL COLOSO DE LAS MAREAS ABISALES",
                            icon: "🐙",
                            themeColor: "#06b6d4",
                            accentColor: "#a855f7",
                            targetX: boss.x,
                            targetY: 340,
                            zoom: 1.45,
                            duration: 2.8
                        }, cinema(() => {
                            if (game.player) game.player.frozen = false;
                            if (window.BossHUD) {
                                window.BossHUD.show(__("boss_name_4") || "KRAKATOAAA", boss.health, boss.maxHealth, "#06b6d4");
                            }
                        }));
                    } else {
                        if (game.player) game.player.frozen = false;
                        if (window.BossHUD) {
                            window.BossHUD.show(__("boss_name_4") || "KRAKATOAAA", boss.health, boss.maxHealth, "#06b6d4");
                        }
                    }
                }), 3200);
            }), 2800);
        } else {
            boss.state = "emerging";
            boss.y = 350;
            if (game.player) game.player.frozen = false;
            if (window.BossHUD) {
                window.BossHUD.show(__("boss_name_4") || "KRAKATOAAA", boss.health, boss.maxHealth, "#06b6d4");
            }
        }
    }
    function drawKrakatoa(ctx, boss, cameraX, time) {
        if (boss.state === "idle" || boss.state === "arena_closing") return;
        if (boss.state === "submerged" || boss.state === "intro") {
            const bx = boss.x - cameraX;
            ctx.save();
            ctx.fillStyle = "rgba(6, 182, 212, 0.4)";
            ctx.beginPath();
            ctx.ellipse(bx, 495, 45 + Math.sin(time * .2) * 8, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
        }
        const bx = boss.x - cameraX;
        const by = boss.y;
        if (bx < -250 || bx > VIEW_W + 250) return;
        ctx.save();
        const isHit = boss.hitFlash > 0;
        const isVuln = boss.state === "vulnerable" || boss.state === "stunned";
        const isRage = boss.rageMode;
        ctx.shadowColor = isHit ? "#ffffff" : window.postGameHorror ? "#990000" : isRage ? "#ef4444" : isVuln ? "#fde047" : "#06b6d4";
        ctx.shadowBlur = isHit ? 24 : 16;
        const tentacleBaseY = by + 30;
        const tCount = 6;
        for (let t = 0; t < tCount; t++) {
            const side = t < 3 ? -1 : 1;
            const tIdx = t % 3;
            const waveSpeed = isVuln ? .04 : isRage ? .22 : .14;
            const wave = Math.sin(boss.tentaclePhase * (1 + tIdx * .2) + t * .8) * (isVuln ? 8 : 28);
            const reachX = side * (55 + tIdx * 35);
            const tipX = bx + reachX + (isVuln ? 0 : wave * 1.2);
            const tipY = isVuln ? tentacleBaseY + 65 + tIdx * 8 : tentacleBaseY - 45 + wave + tIdx * 20;
            const tGrad = ctx.createLinearGradient(bx + side * 20, tentacleBaseY, tipX, tipY);
            if (window.postGameHorror) {
                tGrad.addColorStop(0, "#1c0f16");
                tGrad.addColorStop(.5, "#3b1424");
                tGrad.addColorStop(1, "#6b172a");
            } else {
                tGrad.addColorStop(0, isRage ? "#be123c" : "#0e7490");
                tGrad.addColorStop(.5, isRage ? "#f43f5e" : "#06b6d4");
                tGrad.addColorStop(1, isRage ? "#fda4af" : "#a5f3fc");
            }
            ctx.strokeStyle = isHit ? "#ffffff" : tGrad;
            ctx.lineWidth = Math.max(6, 16 - tIdx * 3);
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(bx + side * 25, tentacleBaseY);
            ctx.quadraticCurveTo(bx + side * (45 + tIdx * 20), tentacleBaseY - 20 + wave * .5, tipX, tipY);
            ctx.stroke();
            ctx.fillStyle = isHit ? "#ffffff" : window.postGameHorror ? "#e4e4e7" : isRage ? "#ffedd5" : "#e0f2fe";
            for (let v = .2; v <= .85; v += .22) {
                const vx = (bx + side * 25) * (1 - v) + tipX * v;
                const vy = tentacleBaseY * (1 - v) + tipY * v;
                ctx.beginPath();
                ctx.arc(vx, vy, 3.2 - tIdx * .5, 0, Math.PI * 2);
                ctx.fill();
                if (window.postGameHorror) {
                    ctx.fillStyle = "#7f1d1d";
                    ctx.beginPath();
                    ctx.arc(vx, vy, 1.4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#e4e4e7";
                }
            }
        }
        const headW = 75;
        const headH = 95;
        const headGrad = ctx.createRadialGradient(bx - 10, by - 30, 8, bx, by, 90);
        if (isHit) {
            headGrad.addColorStop(0, "#ffffff");
            headGrad.addColorStop(1, "#ffffff");
        } else if (window.postGameHorror) {
            headGrad.addColorStop(0, "#2d1527");
            headGrad.addColorStop(.35, "#1e0d19");
            headGrad.addColorStop(.75, "#120710");
            headGrad.addColorStop(1, "#080208");
        } else if (isRage) {
            headGrad.addColorStop(0, "#fca5a5");
            headGrad.addColorStop(.4, "#ef4444");
            headGrad.addColorStop(.85, "#881337");
            headGrad.addColorStop(1, "#4c0519");
        } else {
            headGrad.addColorStop(0, "#67e8f9");
            headGrad.addColorStop(.35, "#06b6d4");
            headGrad.addColorStop(.75, "#0e7490");
            headGrad.addColorStop(1, "#0c4a6e");
        }
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.moveTo(bx - headW, by + 35);
        ctx.bezierCurveTo(bx - headW * 1.1, by - 40, bx - headW * .6, by - headH, bx, by - headH - 12);
        ctx.bezierCurveTo(bx + headW * .6, by - headH, bx + headW * 1.1, by - 40, bx + headW, by + 35);
        ctx.quadraticCurveTo(bx, by + 48, bx - headW, by + 35);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = isHit ? "#ffffff" : window.postGameHorror ? "#854d0e" : isRage ? "#fb7185" : "#ec4899";
        for (let c = -2; c <= 2; c++) {
            const cx = bx + c * 15;
            const cy = by - headH - 4 + Math.abs(c) * 4;
            ctx.beginPath();
            ctx.arc(cx, cy, 5 - Math.abs(c) * .8, 0, Math.PI * 2);
            ctx.fill();
        }
        if (window.postGameHorror) {
            ctx.fillStyle = "#050505";
            ctx.beginPath();
            ctx.arc(bx - 14, by - headH * .45, 6, 0, Math.PI * 2);
            ctx.arc(bx + 14, by - headH * .45, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#f8fafc";
            ctx.beginPath();
            ctx.arc(bx - 14, by - headH * .45, 4.5, 0, Math.PI * 2);
            ctx.arc(bx + 14, by - headH * .45, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#990000";
            ctx.beginPath();
            ctx.arc(bx - 14, by - headH * .45, 1.8, 0, Math.PI * 2);
            ctx.arc(bx + 14, by - headH * .45, 1.8, 0, Math.PI * 2);
            ctx.fill();
        }
        const eyeSpacing = 32;
        const eyeY = by - 10;
        for (let side = -1; side <= 1; side += 2) {
            const ex = bx + side * eyeSpacing;
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.ellipse(ex, eyeY, 15, 12, side * .15, 0, Math.PI * 2);
            ctx.fill();
            if (window.postGameHorror) {
                ctx.fillStyle = "#f8fafc";
                ctx.beginPath();
                ctx.ellipse(ex, eyeY, 13, 10, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#dc2626";
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(ex - side * 12, eyeY - 5);
                ctx.lineTo(ex - side * 3, eyeY);
                ctx.moveTo(ex - side * 11, eyeY + 6);
                ctx.lineTo(ex - side * 4, eyeY + 2);
                ctx.stroke();
                ctx.fillStyle = "#7f1d1d";
                ctx.beginPath();
                ctx.ellipse(ex - 2, eyeY, 2.2, 7, 0, 0, Math.PI * 2);
                ctx.ellipse(ex + 2, eyeY, 2.2, 7, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#000000";
                ctx.beginPath();
                ctx.arc(ex - 2, eyeY, 1.2, 0, Math.PI * 2);
                ctx.arc(ex + 2, eyeY, 1.2, 0, Math.PI * 2);
                ctx.fill();
            } else if (isVuln) {
                ctx.strokeStyle = "#fde047";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(ex, eyeY, 7, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = "#fde047";
                ctx.beginPath();
                ctx.arc(ex, eyeY, 3, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = isRage ? "#ff0044" : "#f59e0b";
                ctx.beginPath();
                ctx.ellipse(ex, eyeY, 10, 8, 0, 0, Math.PI * 2);
                ctx.fill();
                const pDir = game.player ? game.player.x > boss.x ? 2.5 : -2.5 : 0;
                ctx.fillStyle = "#050811";
                ctx.beginPath();
                ctx.ellipse(ex + pDir, eyeY, 2.5, 7, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(ex + side * 3 - 2, eyeY - 3, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.strokeStyle = window.postGameHorror ? "#7f1d1d" : isRage ? "#991b1b" : "#155e75";
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(ex - side * 15, eyeY - 14);
            ctx.lineTo(ex + side * 12, eyeY - 8);
            ctx.stroke();
        }
        const mouthY = by + 22;
        const isFiring = boss.state === "attack" && boss.salvoTimer < 16;
        ctx.fillStyle = "#090d16";
        ctx.beginPath();
        ctx.ellipse(bx, mouthY, 18, isFiring ? 14 : 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#e2e8f0";
        ctx.beginPath();
        ctx.moveTo(bx - 8, mouthY - 4);
        ctx.lineTo(bx, mouthY + (isFiring ? 8 : 4));
        ctx.lineTo(bx + 8, mouthY - 4);
        ctx.closePath();
        ctx.fill();
        if (isFiring) {
            ctx.fillStyle = isRage ? "#ff0055" : "#00ffff";
            ctx.beginPath();
            ctx.arc(bx, mouthY, 8, 0, Math.PI * 2);
            ctx.fill();
        }
        const waterLine = 495;
        if (by + 40 >= waterLine - 30) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            for (let w = -4; w <= 4; w++) {
                const wx = bx + w * 22;
                const wy = waterLine + Math.sin(time * .2 + w) * 4;
                ctx.beginPath();
                ctx.arc(wx, wy, 8 + Math.abs(w) * 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        if (boss.state === "stone_cin" || boss.state === "stunned") {
            const stoneScreenX = boss.stoneX - cameraX;
            const stoneScreenY = boss.state === "stunned" ? boss.stoneRestingY : boss.stoneY;
            if (stoneScreenX > -150 && stoneScreenX < VIEW_W + 150 && stoneScreenY > -220 && stoneScreenY < VIEW_H + 100) {
                ctx.save();
                ctx.translate(stoneScreenX, stoneScreenY);
                ctx.rotate(Math.sin(time * .3) * (boss.state === "stunned" ? .08 : .5));
                const stoneGrad = ctx.createRadialGradient(-6, -8, 3, 0, 0, 34);
                stoneGrad.addColorStop(0, "#d1d5db");
                stoneGrad.addColorStop(.6, "#9aa2ad");
                stoneGrad.addColorStop(1, "#52525b");
                ctx.fillStyle = stoneGrad;
                ctx.shadowColor = "#000000";
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.moveTo(-28, -14);
                ctx.lineTo(-12, -30);
                ctx.lineTo(14, -25);
                ctx.lineTo(30, -8);
                ctx.lineTo(26, 16);
                ctx.lineTo(6, 24);
                ctx.lineTo(-24, 18);
                ctx.lineTo(-32, 0);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.strokeStyle = "#e5e7eb";
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(-16, -18);
                ctx.lineTo(0, -2);
                ctx.lineTo(10, 8);
                ctx.stroke();
                ctx.restore();
            }
        }
        if (boss.state === "stunned") {
            ctx.save();
            ctx.font = "15px Arial";
            ctx.textAlign = "center";
            ctx.fillStyle = "#fde047";
            for (let s = 0; s < 4; s++) {
                const sa = time * .12 + s * (Math.PI / 2);
                const sx = bx + Math.cos(sa) * 58;
                const sy = boss.hitY - 26 + Math.sin(sa) * 16;
                ctx.fillText("★", sx, sy);
            }
            ctx.restore();
        }
        ctx.restore();
    }
    function drawKrakatoaButtons(ctx, boss, cameraX, time) {
        if (!boss.buttons || boss.buttons.length === 0) return;
        boss.buttons.forEach(btn => {
            const bsx = btn.x - cameraX;
            if (bsx < -120 || bsx > VIEW_W + 120) return;
            const bsy = btn.y;
            if (btn.pressed) {
                if (btn.sinkOffset === undefined) btn.sinkOffset = 0;
                if (btn.sinkOffset < 11) {
                    btn.sinkOffset += (11 - btn.sinkOffset) * .45;
                }
            } else {
                btn.sinkOffset = 0;
            }
            ctx.save();
            const glow = .55 + Math.sin(time * .14) * .35;
            const isPressed = btn.pressed;
            const sink = btn.sinkOffset || 0;
            const baseH = btn.h;
            const baseGrad = ctx.createLinearGradient(bsx, bsy + 4, bsx, bsy + 4 + baseH);
            baseGrad.addColorStop(0, "#334155");
            baseGrad.addColorStop(.5, "#1e293b");
            baseGrad.addColorStop(1, "#0b0f19");
            ctx.fillStyle = baseGrad;
            ctx.beginPath();
            ctx.roundRect(bsx, bsy + 4, btn.w, baseH, 5);
            ctx.fill();
            ctx.fillStyle = isPressed ? "#15803d" : "#eab308";
            for (let fx = bsx + 8; fx < bsx + btn.w - 8; fx += 14) {
                ctx.beginPath();
                ctx.moveTo(fx, bsy + baseH + 3);
                ctx.lineTo(fx + 6, bsy + 5);
                ctx.lineTo(fx + 9, bsy + 5);
                ctx.lineTo(fx + 3, bsy + baseH + 3);
                ctx.closePath();
                ctx.fill();
            }
            ctx.fillStyle = "#94a3b8";
            [ [ bsx + 4, bsy + 6 ], [ bsx + btn.w - 4, bsy + 6 ], [ bsx + 4, bsy + baseH + 2 ], [ bsx + btn.w - 4, bsy + baseH + 2 ] ].forEach(([sx, sy]) => {
                ctx.beginPath();
                ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.fillStyle = "#06090e";
            ctx.beginPath();
            ctx.roundRect(bsx + 7, bsy + 2, btn.w - 14, 8, 3);
            ctx.fill();
            const ledColor = isPressed ? "#22c55e" : "#ff1744";
            ctx.fillStyle = ledColor;
            ctx.shadowColor = ledColor;
            ctx.shadowBlur = isPressed ? 14 : 10 + glow * 4;
            ctx.beginPath();
            ctx.roundRect(bsx + 8, bsy + 1, btn.w - 16, 2.5, 1);
            ctx.fill();
            ctx.shadowBlur = 0;
            const plungerY = bsy - 8 + sink;
            const plungerH = 11;
            const btnGrad = ctx.createLinearGradient(bsx + 8, plungerY, bsx + 8, plungerY + plungerH);
            if (isPressed) {
                btnGrad.addColorStop(0, "#22c55e");
                btnGrad.addColorStop(.5, "#16a34a");
                btnGrad.addColorStop(1, "#14532d");
            } else {
                btnGrad.addColorStop(0, "#ff4d6d");
                btnGrad.addColorStop(.4, "#ef4444");
                btnGrad.addColorStop(.85, "#dc2626");
                btnGrad.addColorStop(1, "#880818");
            }
            if (!isPressed) {
                ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
                ctx.beginPath();
                ctx.ellipse(bsx + btn.w / 2, bsy + 3, (btn.w - 20) / 2, 3, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = btnGrad;
            ctx.beginPath();
            ctx.roundRect(bsx + 9, plungerY, btn.w - 18, plungerH, [ 6, 6, 3, 3 ]);
            ctx.fill();
            ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
            ctx.beginPath();
            ctx.ellipse(bsx + btn.w / 2, plungerY + 3, (btn.w - 26) / 2, 2.2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = isPressed ? "#4ade80" : "#ffffff";
            ctx.shadowBlur = 6;
            ctx.font = 'bold 12px "Fredoka One", Arial, sans-serif';
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(isPressed ? "✓" : "▼ PISA", bsx + btn.w / 2, plungerY + plungerH / 2);
            ctx.restore();
        });
    }
    window.createKrakatoaBoss = createKrakatoaBoss;
    window.updateAndDrawKrakatoa = function(ctx, cameraX, time) {
        if (currentLevel !== 3 || !game.krakatoa) return;
        updateKrakatoa(game.krakatoa);
        drawKrakatoa(ctx, game.krakatoa, cameraX, time);
        if (game.krakatoa.sealActive) drawKrakatoaButtons(ctx, game.krakatoa, cameraX, time);
    };
})();
// Isaac Daniel Cotera - 2026 | Correo: isaacdanielcotera@gmail.com | Itch.io: https://cotera.itch.io | GitHub: https://github.com/cotera2024
