(function() {
    "use strict";
    function cinema(fn) {
        const token = typeof CINEMA_TOKEN !== "undefined" ? CINEMA_TOKEN : 0;
        return function(...args) {
            if (typeof CINEMA_TOKEN !== "undefined" && token !== CINEMA_TOKEN) return;
            fn.apply(this, args);
        };
    }
    const CANDLE_CONFIG = [ {
        id: 0,
        btnX: 25370,
        btnY: 410,
        candleX: 25440,
        candleY: 375
    }, {
        id: 1,
        btnX: 25620,
        btnY: 320,
        candleX: 25690,
        candleY: 285
    }, {
        id: 2,
        btnX: 25950,
        btnY: 230,
        candleX: 26020,
        candleY: 195
    }, {
        id: 3,
        btnX: 26320,
        btnY: 320,
        candleX: 26390,
        candleY: 285
    }, {
        id: 4,
        btnX: 26560,
        btnY: 410,
        candleX: 26630,
        candleY: 375
    } ];
    const CANDLE_PLATFORM_CONFIG = [ {
        x: 25340,
        y: 410
    }, {
        x: 25590,
        y: 320
    }, {
        x: 25920,
        y: 230
    }, {
        x: 26280,
        y: 320
    }, {
        x: 26530,
        y: 410
    } ];
    function createPumpkinBoss() {
        return {
            x: 26e3,
            y: 340,
            baseY: 340,
            w: 140,
            h: 140,
            health: typeof window !== "undefined" && window.postGameHorror ? 2640 : 1320,
            maxHealth: typeof window !== "undefined" && window.postGameHorror ? 2640 : 1320,
            state: "idle",
            stateTimer: 0,
            facing: -1,
            hitFlash: 0,
            rageMode: false,
            defeatedTimer: 0,
            dizzyTimer: 0,
            metamorphosisTriggered: false,
            candles: CANDLE_CONFIG.map(c => ({
                id: c.id,
                btnX: c.btnX,
                btnY: c.btnY,
                btnW: 46,
                btnH: 18,
                candleX: c.candleX,
                candleY: c.candleY,
                offY: 0,
                platform: null,
                lit: false,
                pressed: false,
                pressDepth: 0
            })),
            litCount: 0,
            stunTimer: 0,
            immuneAttackHits: 0,
            immuneAttackTimer: 0,
            hasSpokenImmuneHint: false,
            heartbeatCount: 0,
            heartbeatAlpha: 0,
            heartbeatPhase: 0,
            attackCooldown: 150,
            attackTimer: 0,
            currentAttack: "none",
            attackSubTimer: 0,
            fireballsFired: 0,
            flameActive: false,
            flameAngle: 0,
            projectiles: [],
            chaseSpeed: 4.6,
            chaseGraceTimer: 0,
            chaseLungeCd: 0,
            chaseLungeActive: 0,
            chaseShootTimer: 0,
            chaseDarkTimer: 0,
            chaseDarkAlpha: 0,
            chaseThunderTimer: 0,
            chaseProjectiles: [],
            finalStep: 0,
            finalTimer: 0,
            finalChargeLevel: 0,
            finalBeamActive: false,
            get hitX() {
                return this.x - this.w / 2;
            },
            get hitY() {
                return this.y - this.h / 2;
            },
            get hitW() {
                return this.w;
            },
            get hitH() {
                return this.h;
            },
            get isVulnerable() {
                return this.state === "stunned_light";
            },
            isHittable: function(proj) {
                if (this.health <= 0 || this.state !== "battle" && this.state !== "stunned_light") {
                    return false;
                }
                const hx = this.hitX;
                const hy = this.hitY;
                const hw = this.hitW;
                const hh = this.hitH;
                const pw = proj.w || 12;
                const ph = proj.h || 12;
                return proj.x < hx + hw && proj.x + pw > hx && proj.y < hy + hh && proj.y + ph > hy;
            },
            onImmuneHit: function(proj) {
                if (this.state !== "battle") return;
                this.immuneAttackHits++;
                this.hitFlash = 4;
                try {
                    playSound(280, .1, "square", .2, 200);
                } catch (e) {}
                const px = this.x + (Math.random() - .5) * 40;
                const py = this.y - 30 + (Math.random() - .5) * 30;
                addFloatingText(px, py, __("flt_boss_miss") || "MISS!", "#94a3b8", 16);
                for (let k = 0; k < 5; k++) {
                    particles.push({
                        x: px,
                        y: py,
                        vx: (Math.random() - .5) * 6,
                        vy: (Math.random() - .5) * 6,
                        life: 12,
                        color: [ "#a855f7", "#64748b", "#38bdf8", "#c084fc" ][Math.floor(Math.random() * 4)],
                        size: 3 + Math.random() * 2,
                        type: "spark"
                    });
                }
                if (!this.hasSpokenImmuneHint && this.immuneAttackTimer === 0) {
                    this.immuneAttackTimer = 1;
                }
            },
            takeDamage: function(amount, chargeLevel) {
                if (this.health <= 0 || this.state !== "stunned_light") return;
                if (game.godMode) amount = 999;
                const isBeam = (chargeLevel === 5);
                const actualDmg = isBeam ? (amount * 1.2) : Math.max(1, Math.round(amount * 1.5));
                this.health = Math.max(0, this.health - actualDmg);
                this.hitFlash = isBeam ? 4 : 12;
                applyShake(isBeam ? 2 : 8);
                if (!isBeam || Math.random() < 0.2) {
                    try {
                        playSound(180, .15, "sawtooth", .25, 90);
                    } catch (e) {}
                }
                const hx = this.x + (Math.random() - .5) * 40;
                const hy = this.y + (Math.random() - .5) * 40;
                if (!isBeam) {
                    const tag = "";
                    addFloatingText(hx, hy, tag + "-" + actualDmg, "#fde047", 22);
                }
                for (let k = 0; k < 9; k++) {
                    particles.push({
                        x: hx,
                        y: hy,
                        vx: (Math.random() - .5) * 9,
                        vy: (Math.random() - .5) * 9,
                        life: 16,
                        color: [ "#f97316", "#eab308", "#ef4444", "#ffffff" ][Math.floor(Math.random() * 4)],
                        size: 3 + Math.random() * 4,
                        type: "spark"
                    });
                }
                if (window.BossHUD) {
                    const hudColor = this.health <= this.maxHealth * .5 ? "#ef4444" : "#f97316";
                    window.BossHUD.update(this.health, this.maxHealth, hudColor);
                }
                if (this.health <= this.maxHealth * .5 && !this.rageMode) {
                    this.rageMode = true;
                    applyShake(18);
                    try {
                        playSFX("sfx_pumpkin_roar_3");
                        playSound(140, .4, "sawtooth", .4, 70);
                    } catch (e) {}
                    addFloatingText(this.x, this.y - 70, __("flt_furia_averno"), "#ef4444", 24);
                }
                if (this.health <= 0) {
                    defeatPumpkinBossInArena(this);
                }
            }
        };
    }
    function closePumpkinArena(boss) {
        game.arenaLocked = true;
        const entranceGate = (game.platforms || []).find(p => p.isArenaGate === "entrance" || p.hammer && p.x >= 25180 && p.x <= 25230);
        const exitGate = (game.platforms || []).find(p => p.isArenaGate === "exit" || p.hammer && p.x >= 26680 && p.x <= 26750);
        game.arenaMinX = entranceGate ? entranceGate.x + entranceGate.w : 25270;
        game.arenaMaxX = exitGate ? exitGate.x : 26700;
        if (!entranceGate || !exitGate || typeof gsap === "undefined") {
            startHeartbeatSequence(boss);
            return;
        }
        try {
            gsap.killTweensOf(entranceGate);
        } catch (e) {}
        try {
            gsap.killTweensOf(exitGate);
        } catch (e) {}
        try {
            gsap.killTweensOf(game);
        } catch (e) {}
        gsap.to(game, {
            cameraOverrideX: exitGate.x - VIEW_W / 2 + exitGate.w / 2,
            duration: .65,
            ease: "power2.inOut",
            onComplete: () => {
                gsap.to(exitGate, {
                    y: 160,
                    duration: .38,
                    ease: "bounce.out",
                    onComplete: () => {
                        try {
                            playSound(100, .45, "sawtooth", .45, 35);
                        } catch (e) {}
                        applyShake(16);
                        gsap.to(game, {
                            cameraOverrideX: entranceGate.x - VIEW_W / 2 + entranceGate.w / 2,
                            duration: .65,
                            ease: "power2.inOut",
                            onComplete: () => {
                                gsap.to(entranceGate, {
                                    y: 160,
                                    duration: .38,
                                    ease: "bounce.out",
                                    onComplete: () => {
                                        try {
                                            playSound(100, .45, "sawtooth", .45, 35);
                                        } catch (e) {}
                                        applyShake(18);
                                        gsap.to(game, {
                                            cameraOverrideX: boss.x - VIEW_W / 2,
                                            duration: .8,
                                            ease: "power2.inOut",
                                            onComplete: () => {
                                                delete game.cameraOverrideX;
                                                startHeartbeatSequence(boss);
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
    function startHeartbeatSequence(boss) {
        boss.state = "heartbeat";
        boss.heartbeatCount = 0;
        boss.heartbeatAlpha = 0;
        boss.heartbeatPhase = 0;
        if (game.player) game.player.frozen = true;
        function playBeat(beatNum) {
            try {
                playSound(65, .5, "sine", .5, 30);
            } catch (e) {}
            applyShake(10);
            gsap.to(boss, {
                heartbeatAlpha: .88,
                duration: .4,
                ease: "power1.in",
                onComplete: () => {
                    gsap.to(boss, {
                        heartbeatAlpha: .05,
                        duration: .6,
                        ease: "power1.out",
                        onComplete: () => {
                            if (beatNum < 3) {
                                gsap.delayedCall(.35, () => playBeat(beatNum + 1));
                            } else {
                                startPumpkinDialogue(boss);
                            }
                        }
                    });
                }
            });
        }
        gsap.delayedCall(.2, () => playBeat(1));
    }
    function startPumpkinDialogue(boss) {
        boss.state = "intro_dialogue";
        boss.heartbeatAlpha = 0;
        if (typeof showAnimatedDialogue === "function") {
            showAnimatedDialogue(__("boss_name_5"), "🎃", __("dlg_pumpkin_intro_1"), cinema(() => {
                showAnimatedDialogue(__("boss_name_5"), "🎃", __("dlg_pumpkin_intro_2"), cinema(() => {
                    triggerBossPresentation(boss);
                }), 3200);
            }), 2800);
        } else {
            triggerBossPresentation(boss);
        }
    }
    function triggerBossPresentation(boss) {
        boss.state = "presentation";
        if (!window.postGameHorror) {
            try {
                playBGM("bgm_boss_pumpkin");
            } catch (e) {}
        }
        try {
            playSFX("sfx_pumpkin_roar_1");
        } catch (e) {}
        if (typeof window.playBossPresentation === "function") {
            window.playBossPresentation({
                name: "boss_name_5",
                title: "boss_title_5",
                icon: "🎃",
                themeColor: "#f97316",
                accentColor: "#a855f7",
                targetX: boss.x,
                targetY: boss.y,
                zoom: 1.4,
                duration: 3.2
            }, cinema(() => {
                startCombatPhase(boss);
            }));
        } else {
            startCombatPhase(boss);
        }
    }
    function startCombatPhase(boss) {
        boss.state = "battle";
        if (game.player) game.player.frozen = false;
        boss.candles.forEach(c => {
            c.lit = false;
            c.pressed = false;
            c.pressDepth = 0;
        });
        boss.litCount = 0;
        try {
            playSFX("sfx_halloween_blackout");
        } catch (e) {}
        if (window.BossHUD) {
            window.BossHUD.show(__("boss_name_5"), boss.health, boss.maxHealth, "#f97316");
        }
    }
    function ensureCandlePlatforms(boss) {
        if (boss._candlePlatsLinked || !game.platforms) return;
        let allFound = true;
        boss.candles.forEach((c, idx) => {
            const cfg = CANDLE_PLATFORM_CONFIG[idx];
            const plat = game.platforms.find(pl => !pl.isArenaGate && !pl.hammer && Math.abs(pl.x - cfg.x) < 2 && Math.abs(pl.y - cfg.y) < 2);
            if (plat) {
                c.platform = plat;
                plat._baseX = plat.x;
                plat._baseY = plat.y;
            } else {
                allFound = false;
            }
        });
        if (allFound) boss._candlePlatsLinked = true;
    }
    function updateCandlesAndButtons(boss, time) {
        if (!game.player || boss.state !== "battle" && boss.state !== "stunned_light") {
            return;
        }
        const p = game.player;
        const halfHealth = boss.health <= boss.maxHealth * .5;
        if (halfHealth) {
            ensureCandlePlatforms(boss);
            const t = typeof time === "number" ? time / 60 : 0;
            boss.candles.forEach((c, idx) => {
                const base = CANDLE_CONFIG[idx];
                if (!c.lit) {
                    c.offY = Math.sin(t * 1.6 + idx * 1.1) * 30;
                }
                const offY = c.offY || 0;
                if (c.platform) c.platform.y = c.platform._baseY + offY;
                c.btnY = base.btnY + offY;
                c.candleY = base.candleY + offY;
            });
        } else {
            boss.candles.forEach((c, idx) => {
                const base = CANDLE_CONFIG[idx];
                c.btnY = base.btnY;
                c.candleY = base.candleY;
                c.offY = 0;
            });
        }
        boss.candles.forEach(c => {
            const onBtnHoriz = p.x + p.w > c.btnX && p.x < c.btnX + c.btnW;
            const onBtnVert = Math.abs(p.y + p.h - c.btnY) < 14;
            const isStanding = onBtnHoriz && onBtnVert && p.vy >= 0;
            if (isStanding) {
                if (c.pressDepth < 8) c.pressDepth += 2;
                if (!c.pressed) {
                    c.pressed = true;
                    try {
                        playSound(150, .18, "sawtooth", .3, 80);
                    } catch (e) {}
                    if (!c.lit) {
                        c.lit = true;
                        boss.litCount++;
                        try {
                            playSound(440, .22, "triangle", .35, 600);
                        } catch (e) {}
                        addFloatingText(c.candleX, c.candleY - 30, __("flt_candle_lit") || "¡VELA ENCENDIDA!", "#fbbf24", 16);
                        for (let k = 0; k < 10; k++) {
                            particles.push({
                                x: c.candleX,
                                y: c.candleY - 20,
                                vx: (Math.random() - .5) * 5,
                                vy: -Math.random() * 4 - 1,
                                life: 20,
                                color: [ "#fbbf24", "#f59e0b", "#f97316", "#ffffff" ][Math.floor(Math.random() * 4)],
                                size: 3 + Math.random() * 3,
                                type: "spark"
                            });
                        }
                        if (boss.litCount >= 5) {
                            triggerFullLightStun(boss);
                        }
                    }
                }
            } else {
                if (!c.lit) {
                    if (c.pressDepth > 0) c.pressDepth -= 1;
                    c.pressed = false;
                } else {
                    c.pressDepth = 8;
                }
            }
        });
    }
    function triggerFullLightStun(boss) {
        if (game && Array.isArray(game.enemies)) {
            game.enemies = game.enemies.filter(e => !e.pumpkinSpawn);
        }
        boss.state = "stunned_light";
        boss.stunTimer = 420;
        boss.currentAttack = "none";
        boss.flameActive = false;
        boss.stunFallVy = 0;
        boss.stunGrounded = false;
        game.flash = 35;
        applyShake(16);
        try {
            playSound(520, .5, "sine", .5, 800);
        } catch (e) {}
        addFloatingText(boss.x, boss.y - 70, __("flt_5candles") || "¡5 VELAS! ¡7s DE LUZ TOTAL!", "#38bdf8", 22);
        addFloatingText(boss.x, boss.y - 35, __("flt_boss_stunned") || "¡MAREADA EN EL SUELO! ¡DALE PLOMO!", "#fde047", 20);
        if (typeof showAnimatedDialogue === "function") {
            showAnimatedDialogue(__("boss_name_5"), "🎃", __("dlg_pumpkin_stunned"), null, 2500);
        }
    }
    function resetCandlesAfterStun(boss) {
        boss.state = "battle";
        boss.litCount = 0;
        boss.attackTimer = 40;
        if (typeof gsap !== "undefined") {
            gsap.to(boss, { y: boss.baseY || 340, duration: 1.1, ease: "power2.out" });
        } else {
            boss.y = boss.baseY || 340;
        }
        boss.stunFallVy = 0;
        boss.stunGrounded = false;
        boss.candles.forEach(c => {
            c.lit = false;
            c.pressed = false;
            c.pressDepth = 0;
        });
        try {
            playSFX("sfx_halloween_blackout");
        } catch (e) {}
        boss.candles.forEach(c => {
            for (let k = 0; k < 6; k++) {
                particles.push({
                    x: c.candleX,
                    y: c.candleY - 20,
                    vx: (Math.random() - .5) * 3,
                    vy: -Math.random() * 3 - 1,
                    life: 25,
                    color: [ "#334155", "#475569", "#1e293b" ][Math.floor(Math.random() * 3)],
                    size: 3 + Math.random() * 3,
                    type: "smoke"
                });
            }
        });
    }
    function updatePumpkinAttacks(boss) {
        if (boss.state !== "battle") return;
        const targetP = game.player;
        if (!targetP) return;
        boss.stateTimer++;
        const hoverAmp = boss.rageMode ? 55 : 38;
        const hoverSpeed = boss.rageMode ? .055 : .042;
        boss.y = boss.baseY + Math.sin(boss.stateTimer * hoverSpeed) * hoverAmp;
        const sideOffset = Math.sin(boss.stateTimer * .035) * 170;
        const arenaCenter = 25950;
        const baseDist = boss.rageMode ? 240 : 300;
        const side = targetP.x < arenaCenter ? 1 : -1;
        const targetX = targetP.x + side * (baseDist + sideOffset);
        const clampedTargetX = Math.max(25380, Math.min(26520, targetX));
        boss.x += (clampedTargetX - boss.x) * (boss.rageMode ? .05 : .032);
        boss.facing = targetP.x < boss.x ? -1 : 1;
        if (Math.random() < .007) {
            const rRoar = [ "sfx_pumpkin_roar_1", "sfx_pumpkin_roar_2", "sfx_pumpkin_roar_3" ];
            try {
                playSFX(rRoar[Math.floor(Math.random() * rRoar.length)]);
            } catch (e) {}
        }
        if (boss.state === "battle" || boss.state === "stunned_light") {
            boss.heartTimer = (boss.heartTimer || 0) + 1;
            if (boss.heartTimer >= 900) {
                boss.heartTimer = 0;
                const hx = 25420 + Math.random() * (26380 - 25420);
                stars.push({
                    x: hx,
                    y: 450,
                    collected: false
                });
                try {
                    for (let hk = 0; hk < 8; hk++) {
                        particles.push({
                            x: hx + 12,
                            y: 462,
                            vx: (Math.random() - .5) * 2.2,
                            vy: -Math.random() * 2 - .6,
                            life: 34,
                            maxLife: 34,
                            type: "emoji",
                            text: "💖",
                            size: 14,
                            sineWave: true
                        });
                    }
                } catch (e) {}
                addFloatingText(hx + 12, 430, typeof __ === "function" ? __("flt_corazon_arena") : "¡CORAZÓN!", "#ff4d6d", 18);
                try {
                    playSound(880, .2, "sine", .25, 1320);
                } catch (e) {}
            }
        }
        boss.attackTimer++;
        const cd = boss.rageMode ? 100 : 160;
        if (boss.attackTimer >= cd && boss.currentAttack === "none") {
            boss.attackTimer = 0;
            boss.attackSubTimer = 0;
            const roll = Math.random();
            if (roll < .45) {
                boss.currentAttack = "fireballs";
                boss.fireballsFired = 0;
            } else if (roll < .78) {
                boss.currentAttack = "fan_fireballs";
                boss.fanFired = false;
            } else {
                boss.currentAttack = "spit_minions";
            }
        }
        if (boss.currentAttack === "fireballs") {
            boss.attackSubTimer++;
            const fireInterval = boss.rageMode ? 26 : 36;
            const maxBalls = boss.rageMode ? 3 : 2;
            if (boss.attackSubTimer % fireInterval === 0 && boss.fireballsFired < maxBalls) {
                boss.fireballsFired++;
                firePumpkinFireball(boss, targetP);
            }
            if (boss.fireballsFired >= maxBalls && boss.attackSubTimer > maxBalls * fireInterval + 25) {
                boss.currentAttack = "none";
            }
        } else if (boss.currentAttack === "fan_fireballs") {
            boss.attackSubTimer++;
            if (boss.attackSubTimer < 28) {
                boss.hitFlash = Math.max(boss.hitFlash, 2);
            } else if (boss.attackSubTimer === 28 && !boss.fanFired) {
                boss.fanFired = true;
                firePumpkinFanFireballs(boss, targetP);
            } else if (boss.attackSubTimer > 70) {
                boss.currentAttack = "none";
            }
        } else if (boss.currentAttack === "spit_minions") {
            boss.attackSubTimer++;
            if (boss.attackSubTimer === 30) {
                spitMinions(boss);
            }
            if (boss.attackSubTimer > 60) {
                boss.currentAttack = "none";
            }
        }
    }
    function firePumpkinFireball(boss, p) {
        try {
            playSound(220, .25, "sawtooth", .35, 120);
        } catch (e) {}
        const startX = boss.x + boss.facing * 42;
        const startY = boss.y + 18;
        const targetX = p.x + p.w / 2;
        const targetY = p.y + p.h / 2;
        const dx = targetX - startX;
        const dy = targetY - startY;
        const dist = Math.hypot(dx, dy) || 1;
        const speed = boss.rageMode ? 4.5 : 3.6;
        boss.projectiles.push({
            x: startX,
            y: startY,
            vx: dx / dist * speed,
            vy: dy / dist * speed,
            radius: 20,
            life: 250,
            type: "fireball"
        });
    }
    function firePumpkinFanFireballs(boss, p) {
        try {
            playSound(160, .35, "sawtooth", .45, 90);
            playSFX("sfx_pumpkin_roar_1");
        } catch (e) {}
        applyShake(10);
        const mouthX = boss.x + boss.facing * 42;
        const mouthY = boss.y + 20;
        const dx = p.x + p.w / 2 - mouthX;
        const dy = p.y + p.h / 2 - mouthY;
        const baseAngle = Math.atan2(dy, dx);
        const count = boss.rageMode ? 5 : 4;
        const speed = boss.rageMode ? 4 : 3.2;
        const spreadStep = .24;
        for (let i = 0; i < count; i++) {
            const offset = (i - (count - 1) / 2) * spreadStep;
            const angle = baseAngle + offset;
            boss.projectiles.push({
                x: mouthX,
                y: mouthY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 20,
                life: 280,
                type: "fireball"
            });
        }
    }
    function updatePumpkinEscortSpawns(boss) {
        if (!game || !Array.isArray(game.enemies)) return;
        boss.witchSpawnTimer = (boss.witchSpawnTimer || 0) + 1;
        boss.ghostSpawnTimer = (boss.ghostSpawnTimer || 0) + 1;
        if (boss.witchSpawnTimer >= 900) {
            boss.witchSpawnTimer = 0;
            const dir = Math.random() < .5 ? -1 : 1;
            const wx = Math.max(25380, Math.min(26520, boss.x + dir * 260));
            const witch = new Enemy({
                type: "witch",
                x: wx,
                y: 240 + Math.random() * 70,
                health: 60,
                speed: 1.6,
                range: 190,
                shootInterval: 130
            });
            witch.pumpkinSpawn = true;
            game.enemies.push(witch);
            try {
                playSFX("sfx_witch_cackle_1");
            } catch (e) {}
        }
        if (boss.ghostSpawnTimer >= 600) {
            boss.ghostSpawnTimer = 0;
            const gdir = boss.facing || -1;
            const gx = boss.x + gdir * 60;
            const ghost = new Enemy({
                type: "ghost",
                x: gx,
                y: boss.y + 8,
                health: 45,
                speed: 1.5,
                range: 200
            });
            ghost.pumpkinSpawn = true;
            game.enemies.push(ghost);
            if (typeof addFloatingText === "function") {
                addFloatingText(gx, boss.y - 40, __("flt_ghost_reborn") || "¡ALMA VENGATIVA!", "#c084fc", 15);
            }
            try {
                playSound(150, .25, "sawtooth", .35, 90);
            } catch (e) {}
        }
    }
    function spitMinions(boss) {
        applyShake(12);
        try {
            playSFX("sfx_pumpkin_roar_2");
            playSound(160, .4, "sawtooth", .4, 70);
        } catch (e) {}
        const minionTypes = [ "pumpkin", "crow", "hooded" ];
        for (let i = 0; i < 3; i++) {
            const chosenType = minionTypes[Math.floor(Math.random() * minionTypes.length)];
            const spawnX = boss.x + (i - 1) * 70;
            const spawnY = boss.y - 10;
            enemies.push({
                type: chosenType,
                x: spawnX,
                y: spawnY,
                health: chosenType === "crow" ? 30 : 65,
                speed: 1.4,
                range: 120,
                direction: i % 2 === 0 ? 1 : -1,
                facing: -1,
                state: "alive",
                color: chosenType === "pumpkin" ? "#ea580c" : "#7c3aed",
                vx: (Math.random() - .5) * 4,
                vy: -4 - Math.random() * 3
            });
            for (let k = 0; k < 8; k++) {
                particles.push({
                    x: spawnX,
                    y: spawnY,
                    vx: (Math.random() - .5) * 6,
                    vy: -Math.random() * 5,
                    life: 18,
                    color: [ "#a855f7", "#7c3aed", "#f97316" ][Math.floor(Math.random() * 3)],
                    size: 4 + Math.random() * 3,
                    type: "smoke"
                });
            }
        }
        addFloatingText(boss.x, boss.y - 60, __("flt_esbirros_averno"), "#a855f7", 18);
    }
    function defeatPumpkinBossInArena(boss) {
        boss.state = "defeated_dizzy";
        boss.health = 0;
        if (typeof window.triggerHappyMoment === "function") window.triggerHappyMoment();
        boss.dizzyTimer = 0;
        boss.flameActive = false;
        boss.currentAttack = "none";
        game.arenaLocked = false;
        try {
            if (audios && audios.bgm_boss_pumpkin) {
                audios.bgm_boss_pumpkin.pause();
                audios.bgm_boss_pumpkin.currentTime = 0;
            }
            if (currentBGM && audios && audios.bgm_boss_pumpkin && currentBGM === audios.bgm_boss_pumpkin) {
                currentBGM = null;
            }
        } catch (e) {}
        boss.candles.forEach(c => {
            if (c.platform) c.platform.y = c.platform._baseY;
            const base = CANDLE_CONFIG[c.id];
            c.btnY = base.btnY;
            c.candleY = base.candleY;
            c.offY = 0;
        });
        if (window.BossHUD) window.BossHUD.hide();
        if (game.player) {
            game.player.frozen = true;
            game.player.vx = 0;
        }
        applyShake(18);
        try {
            playSFX("sfx_dizzy_loop");
        } catch (e) {}
        score += 1500;
        updateScore(score);
        const onFallen = () => {
            if (typeof showAnimatedDialogue === "function") {
                showAnimatedDialogue(__("boss_name_5"), "🎃", __("dlg_pumpkin_defeated"), null, 2500);
            }
            const entranceGate = (game.platforms || []).find(p => p.isArenaGate === "entrance" || p.hammer && p.x >= 25180 && p.x <= 25230);
            const exitGate = (game.platforms || []).find(p => p.isArenaGate === "exit" || p.hammer && p.x >= 26680 && p.x <= 26750);
            if (!entranceGate && !exitGate) {
                if (game.player) game.player.frozen = false;
                return;
            }
            setTimeout(() => {
                const VIEW_W = (typeof window.VIEW_W === "number" && window.VIEW_W) ? window.VIEW_W : (typeof canvas !== "undefined" && canvas.width ? canvas.width : 1e3);
                if (exitGate && typeof gsap !== "undefined") {
                    gsap.to(game, {
                        cameraOverrideX: exitGate.x - VIEW_W / 2 + exitGate.w / 2,
                        duration: .7,
                        ease: "power2.inOut",
                        onComplete: () => {
                            gsap.to(exitGate, {
                                y: -250,
                                duration: .6,
                                ease: "power2.out",
                                onComplete: () => {
                                    try {
                                        playSound(200, .4, "sine", .35, 10);
                                    } catch (e) {}
                                    applyShake(8);
                                    if (entranceGate) {
                                        gsap.to(game, {
                                            cameraOverrideX: entranceGate.x - VIEW_W / 2 + entranceGate.w / 2,
                                            duration: .7,
                                            ease: "power2.inOut",
                                            onComplete: () => {
                                                gsap.to(entranceGate, {
                                                    y: -250,
                                                    duration: .6,
                                                    ease: "power2.out",
                                                    onComplete: () => {
                                                        try {
                                                            playSound(200, .4, "sine", .35, 10);
                                                        } catch (e) {}
                                                        applyShake(8);
                                                        const targetCameraX = game.player ? game.player.x - VIEW_W / 2 + game.player.w / 2 : boss.x - VIEW_W / 2;
                                                        gsap.to(game, {
                                                            cameraOverrideX: targetCameraX,
                                                            duration: .7,
                                                            ease: "power2.inOut",
                                                            onComplete: () => {
                                                                delete game.cameraOverrideX;
                                                                if (game.player) game.player.frozen = false;
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    } else {
                                        const targetCameraX = game.player ? game.player.x - VIEW_W / 2 + game.player.w / 2 : boss.x - VIEW_W / 2;
                                        gsap.to(game, {
                                            cameraOverrideX: targetCameraX,
                                            duration: .7,
                                            ease: "power2.inOut",
                                            onComplete: () => {
                                                delete game.cameraOverrideX;
                                                if (game.player) game.player.frozen = false;
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    });
                } else {
                    if (entranceGate) entranceGate.y = -250;
                    if (exitGate) exitGate.y = -250;
                    if (game.player) game.player.frozen = false;
                }
            }, 1e3);
        };
        if (typeof gsap !== "undefined") {
            gsap.to(boss, {
                y: 450,
                duration: .9,
                ease: "bounce.out",
                onComplete: onFallen
            });
        } else {
            boss.y = 450;
            onFallen();
        }
    }
    function startGhostTransformation(boss) {
        boss.state = "ghost_transform";
        if (game.player) {
            game.player.frozen = true;
            game.player.vx = 0;
        }
        if (typeof gsap !== "undefined") {
            gsap.to(game, {
                cameraOverrideX: boss.x - VIEW_W / 2,
                duration: 1.2,
                ease: "power2.inOut",
                onComplete: () => {
                    try {
                        playSFX("sfx_halloween_blackout");
                    } catch (e) {}
                    applyShake(16);
                    for (let i = 0; i < 35; i++) {
                        particles.push({
                            x: boss.x + (Math.random() - .5) * 60,
                            y: boss.y + (Math.random() - .5) * 40,
                            vx: (Math.random() - .5) * 6,
                            vy: -2 - Math.random() * 5,
                            life: 45,
                            color: [ "#ffffff", "#c084fc", "#a855f7", "#38bdf8" ][Math.floor(Math.random() * 4)],
                            size: 6 + Math.random() * 6,
                            type: "smoke"
                        });
                    }
                    gsap.to(boss, {
                        y: 310,
                        duration: 1.4,
                        ease: "power1.out",
                        onComplete: () => {
                            try {
                                playSFX("sfx_pumpkin_roar_1");
                            } catch (e) {}
                            if (typeof showAnimatedDialogue === "function") {
                                showAnimatedDialogue(__("boss_name_5"), "👻", __("dlg_pumpkin_chase"), cinema(() => {
                                    gsap.to(game, {
                                        cameraOverrideX: (game.player ? game.player.x : 26880) - VIEW_W / 2 + 100,
                                        duration: .9,
                                        ease: "power2.inOut",
                                        onComplete: () => {
                                            delete game.cameraOverrideX;
                                            if (game.player) game.player.frozen = false;
                                            boss.state = "chase";
                                            boss.x = (game.player ? game.player.x : 26880) - 560;
                                            boss.y = 330;
                                            boss.chaseGraceTimer = 180;
                                            boss.chaseShootTimer = -90;
                                            boss.chaseLungeCd = 240;
                                            if (!window.postGameHorror) {
                                                try {
                                                    playBGM("bgm_pumpkin_chase");
                                                } catch (e) {}
                                            }
                                            addFloatingText(game.player.x, game.player.y - 45, __("flt_chase_escape") || "¡CORRE POR TU VIDA!", "#ef4444", 22);
                                            applyShake(14);
                                        }
                                    });
                                }), 2600);
                            }
                        }
                    });
                }
            });
        }
    }
    function updateChasePhase(boss) {
        const p = game.player;
        if (!p) return;
        const inGrace = boss.chaseGraceTimer > 0;
        if (inGrace) boss.chaseGraceTimer--;
        const diffX = p.x + p.w / 2 - boss.x;
        const dirX = diffX > 0 ? 1 : -1;
        const diffY = p.y + p.h / 2 - 10 - boss.y;
        const dirY = diffY > 0 ? 1 : -1;
        if (boss.chaseLungeActive > 0) {
            boss.chaseLungeActive--;
            boss.hitFlash = 4;
            boss.x += dirX * 9;
            boss.y += dirY * 7.6;
            for (let k = 0; k < 2; k++) {
                particles.push({
                    x: boss.x - dirX * 40 + (Math.random() - .5) * 20,
                    y: boss.y + (Math.random() - .5) * 20,
                    vx: -dirX * 2,
                    vy: 0,
                    life: 14,
                    color: [ "#ffffff", "#c084fc", "#facc15" ][Math.floor(Math.random() * 3)],
                    size: 5,
                    type: "spark"
                });
            }
        } else {
            if (boss.chaseLungeCd > 0) boss.chaseLungeCd--;
            const baseSpd = boss.chaseSpeed || 5.4;
            let spd = baseSpd;
            if (inGrace) {
                const progress = Math.max(0, Math.min(1, 1 - boss.chaseGraceTimer / 180));
                spd = 2.2 + progress * (baseSpd - 2.2);
            }
            if (Math.abs(diffX) > 620) spd += 1; else if (Math.abs(diffX) < 90) spd *= .85;
            boss.x += dirX * spd;
            boss.y += (p.y - 20 - boss.y) * .055 + Math.sin(p.x * .02) * 1.5;
            if (!inGrace && boss.chaseLungeCd <= 0 && Math.abs(diffX) < 340 && Math.abs(diffY) < 320) {
                boss.chaseLungeActive = 34;
                boss.chaseLungeCd = 170;
                try {
                    playSound(240, .3, "sawtooth", .4, 60);
                } catch (e) {}
                addFloatingText(boss.x, boss.y - 90, __("flt_a_por_ti"), "#ef4444", 18);
            }
        }
        boss.chaseShootTimer = 0;
        boss.chaseDarkTimer = (boss.chaseDarkTimer || 0) + 1;
        if (boss.chaseDarkTimer % 360 < 80) {
            boss.chaseDarkAlpha = Math.sin(boss.chaseDarkTimer % 360 / 80 * Math.PI) * .68;
        } else {
            boss.chaseDarkAlpha = 0;
        }
        boss.chaseThunderTimer = (boss.chaseThunderTimer || 0) + 1;
        if (boss.chaseThunderTimer >= 480) {
            boss.chaseThunderTimer = 0;
            game.flash = 28;
            applyShake(14);
            try {
                playSound(60, .8, "triangle", .5, 20);
            } catch (e) {}
            addFloatingText(p.x, p.y - 40, __("flt_thunder") || "¡ESTRUENDO!", "#fbbf24", 18);
        }
        for (let i = boss.chaseProjectiles.length - 1; i >= 0; i--) {
            const cp = boss.chaseProjectiles[i];
            cp.x += cp.vx;
            cp.life--;
            particles.push({
                x: cp.x + (Math.random() - .5) * 6,
                y: cp.y + (Math.random() - .5) * 6,
                vx: -cp.vx * .2,
                vy: (Math.random() - .5) * 2,
                life: 12,
                color: "#c084fc",
                size: 4,
                type: "spark"
            });
            if (!p.frozen) {
                const distP = Math.hypot(cp.x - (p.x + p.w / 2), cp.y - (p.y + p.h / 2));
                if (distP < cp.radius + 14) {
                    p.takeDamage(18);
                    p.vx = 4;
                    applyShake(8);
                    try {
                        playSound(180, .2, "sawtooth", .35, 80);
                    } catch (e) {}
                    cp.life = 0;
                }
            }
            if (cp.life <= 0 || cp.x > p.x + VIEW_W) {
                boss.chaseProjectiles.splice(i, 1);
            }
        }
        const pcx = p.x + p.w / 2;
        const pcy = p.y + p.h / 2;
        const lungeBonus = boss.chaseLungeActive > 0 ? 12 : 0;
        const halfW = boss.w * .42 + lungeBonus;
        const halfH = boss.h * .44 + lungeBonus;
        const overlapX = Math.abs(pcx - boss.x) < halfW + p.w * .5 - 2;
        const overlapY = Math.abs(pcy - boss.y) < halfH + p.h * .5 - 2;
        const dashing = !!(p.dashTimer > 0);
        if (overlapX && overlapY && !p.frozen && !dashing) {
            triggerSwallowGameOver(boss, p);
            return;
        }
        if (p.x >= 42800) {
            startFinalShotCinematic(boss);
        }
    }
    function triggerSwallowGameOver(boss, p) {
        boss.state = "swallowing";
        p.frozen = true;
        p.dead = true;
        applyShake(28);
        try {
            playSFX("sfx_demon_chomp");
            playSound(70, .7, "sawtooth", .6, 20);
        } catch (e) {}
        for (let k = 0; k < 25; k++) {
            particles.push({
                x: p.x + p.w / 2,
                y: p.y + p.h / 2,
                vx: (Math.random() - .5) * 8,
                vy: (Math.random() - .5) * 8,
                life: 30,
                color: "#0f172a",
                size: 6,
                type: "smoke"
            });
        }
        gsap.delayedCall(.9, cinema(() => {
            if (typeof window.handlePlayerDefeat === "function") window.handlePlayerDefeat(); else if (typeof showGameOverModal === "function") showGameOverModal();
        }));
    }
    function startFinalShotCinematic(boss) {
        boss.state = "final_cinematic";
        boss.finalStep = 0;
        boss.finalChargeLevel = 0;
        boss.finalBeamActive = false;
        const p = game.player;
        if (p) {
            p.frozen = true;
            p.vx = 0;
            p.facing = -1;
        }
        boss.chaseProjectiles = [];
        boss.x = p.x - 190;
        boss.y = p.y - 15;
        gsap.delayedCall(.3, cinema(() => {
            if (boss.state !== "final_cinematic") return;
            boss.finalChargeLevel = 1;
            try {
                playSound(320, .2, "triangle", .25);
            } catch (e) {}
            addFloatingText(p.x, p.y - 35, typeof __ === "function" ? __("flt_carga_x1") : "¡CARGA X1!", "#60a5fa", 18);
        }));
        gsap.delayedCall(.8, cinema(() => {
            if (boss.state !== "final_cinematic") return;
            boss.finalChargeLevel = 2;
            try {
                playSound(440, .2, "triangle", .3);
            } catch (e) {}
            addFloatingText(p.x, p.y - 35, typeof __ === "function" ? __("flt_carga_x2") : "¡CARGA X2!", "#c084fc", 20);
        }));
        gsap.delayedCall(1.3, cinema(() => {
            if (boss.state !== "final_cinematic") return;
            boss.finalChargeLevel = 3;
            try {
                playSound(580, .25, "triangle", .35);
            } catch (e) {}
            addFloatingText(p.x, p.y - 35, typeof __ === "function" ? __("flt_carga_x3") : "¡CARGA X3!", "#f59e0b", 22);
        }));
        gsap.delayedCall(1.8, cinema(() => {
            if (boss.state !== "final_cinematic") return;
            boss.finalChargeLevel = 4;
            applyShake(14);
            try {
                playSound(750, .4, "sine", .45, 950);
            } catch (e) {}
            addFloatingText(p.x, p.y - 45, typeof __ === "function" ? __("flt_carga_max_x4") : "¡¡CARGA MÁXIMA X4!!", "#ef4444", 26);
        }));
        gsap.delayedCall(2.4, cinema(() => {
            if (boss.state !== "final_cinematic") return;
            boss.finalBeamActive = true;
            applyShake(26);
            game.flash = 35;
            try {
                playSFX("sfx_mega_beam");
                playSFX("sfx_pain_grunt");
            } catch (e) {}
            if (typeof showAnimatedDialogue === "function") {
                showAnimatedDialogue(typeof __ === "function" ? __("ui_speaker_peggy") : "Peggy", "🎀", __("dlg_peggy_final_shot"), cinema(() => {
                    boss.finalBeamActive = false;
                    const finishPumpkin = function() {
                        boss.state = "defeated";
                        boss.health = 0;
                        if (typeof window.triggerHappyMoment === "function") window.triggerHappyMoment();
                        if (levels[6] && levels[6].door) levels[6].door.active = true;
                        try {
                            if (audios.bgm_pumpkin_chase) {
                                audios.bgm_pumpkin_chase.pause();
                                audios.bgm_pumpkin_chase.currentTime = 0;
                            }
                            if (!window.postGameHorror) playBGM("bgm_world1_meadow");
                        } catch (e) {}
                        if (game.player) game.player.frozen = false;
                        score += 5e3;
                        updateScore(score);
                    };
                    finishPumpkin();
                }), 2400);
            }
        }));
    }
    function updatePumpkinBoss(boss, time) {
        if (!boss || boss.state === "defeated" && boss.defeatedTimer > 150) return;
        if (boss.state === "idle") {
            if (currentLevel === 6 && game.player && game.player.x > 25320 && game.player.x < 26600 && game.player.onGround && !game.arenaLocked) {
                boss.state = "arena_closing";
                boss.stateTimer = 0;
                game.player.frozen = true;
                closePumpkinArena(boss);
            }
            return;
        }
        if (boss.state === "arena_closing" || boss.state === "heartbeat" || boss.state === "intro_dialogue" || boss.state === "presentation") {
            return;
        }
        if (boss.hitFlash > 0) boss.hitFlash--;
        if (boss.immuneAttackTimer > 0 && !boss.hasSpokenImmuneHint) {
            boss.immuneAttackTimer++;
            if (boss.immuneAttackTimer >= 180) {
                boss.hasSpokenImmuneHint = true;
                if (typeof showAnimatedDialogue === "function") {
                    showAnimatedDialogue(__("boss_name_5"), "🎃", __("dlg_pumpkin_hint"), null, 5e3, true);
                }
            }
        }
        if (boss.state === "stunned_light") {
            boss.stunTimer--;
            const floorY = 445;
            if (boss.y < floorY) {
                boss.stunFallVy = (boss.stunFallVy || 0) + 1.4;
                boss.y += boss.stunFallVy;
                if (boss.y >= floorY) {
                    boss.y = floorY;
                    boss.stunFallVy = 0;
                    boss.stunGrounded = true;
                    applyShake(18);
                    try {
                        playSound(75, .45, "sawtooth", .5, 25);
                        playSound(130, .35, "square", .35, 50);
                        playSFX("sfx_dizzy_loop");
                    } catch (e) {}
                    if (typeof createExplosion === "function") {
                        createExplosion(boss.x, floorY + 45, "#ea580c", 35, 18, [ "#f97316", "#ef4444", "#fbbf24", "#78716c" ]);
                    }
                }
            } else {
                boss.y = floorY;
                boss.x += Math.sin(time * 0.35) * 1.5;
            }
            if (boss.stunTimer <= 0) resetCandlesAfterStun(boss);
        } else if (boss.state === "battle") {
            updatePumpkinAttacks(boss);
            updatePumpkinEscortSpawns(boss);
        }
        if (boss.state === "defeated_dizzy") {
            boss.dizzyTimer++;
            if (game.player && game.player.x > 26880 && !boss.metamorphosisTriggered) {
                boss.metamorphosisTriggered = true;
                startGhostTransformation(boss);
            }
            return;
        }
        if (boss.state === "chase") {
            updateChasePhase(boss);
            return;
        }
        updateCandlesAndButtons(boss, time);
        for (let i = boss.projectiles.length - 1; i >= 0; i--) {
            const p = boss.projectiles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            if (Math.random() < .25) {
                particles.push({
                    x: p.x + (Math.random() - .5) * 8,
                    y: p.y + (Math.random() - .5) * 8,
                    vx: -p.vx * .2,
                    vy: -p.vy * .2 + (Math.random() - .5),
                    life: 12,
                    color: [ "#f97316", "#ef4444", "#fbbf24" ][Math.floor(Math.random() * 3)],
                    size: 3,
                    type: "spark"
                });
            }
            if (game.player && !game.player.frozen) {
                const px = game.player.x + game.player.w / 2;
                const py = game.player.y + game.player.h / 2;
                const dist = Math.hypot(p.x - px, p.y - py);
                if (dist < p.radius + 14) {
                    game.player.takeDamage(12);
                    applyShake(10);
                    try {
                        playSound(180, .2, "sawtooth", .35, 80);
                    } catch (e) {}
                    p.life = 0;
                }
            }
            if (p.life <= 0 || p.x < 25150 || p.x > 26800 || p.y > 520 || p.y < -50) {
                boss.projectiles.splice(i, 1);
            }
        }
        if (game.player && !game.player.frozen && (boss.state === "battle" || boss.state === "stunned_light")) {
            const px = game.player.x + game.player.w / 2;
            const py = game.player.y + game.player.h / 2;
            const overlapX = Math.abs(px - boss.x) < boss.w * .42 + game.player.w / 2;
            const overlapY = Math.abs(py - boss.y) < boss.h * .42 + game.player.h / 2;
            if (overlapX && overlapY) {
                if (boss.isVulnerable) {
                    if (game.player.dashMax && game.player.dashTimer > 0) {
                        boss.takeDamage(35, 3);
                    }
                } else {
                    game.player.takeDamage(16);
                }
            }
        }
    }
    function drawPumpkinBoss(ctx, boss, cameraX, time) {
        if (!boss || boss.state === "idle") return;
        if (boss.state === "defeated") {
            boss.defeatedTimer++;
            if (boss.defeatedTimer > 150) return;
        }
        const sx = boss.x - cameraX;
        const sy = boss.y;
        ctx.save();
        if (boss.state === "defeated_dizzy") {
            ctx.translate(sx, sy);
            for (let i = 0; i < 4; i++) {
                const stAng = time * .1 + i * Math.PI * 2 / 4;
                const starX = Math.cos(stAng) * 45;
                const starY = -60 + Math.sin(stAng) * 16;
                ctx.save();
                ctx.translate(starX, starY);
                ctx.font = "bold 16px Arial";
                ctx.textAlign = "center";
                ctx.fillText("💫", 0, 0);
                ctx.restore();
            }
            ctx.fillStyle = "#166534";
            ctx.beginPath();
            ctx.moveTo(-6, -65);
            ctx.quadraticCurveTo(0, -85, 16, -82);
            ctx.quadraticCurveTo(8, -75, 6, -65);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#7c2d12";
            ctx.beginPath();
            ctx.ellipse(-48, 0, 30, 65, -.15, 0, Math.PI * 2);
            ctx.ellipse(48, 0, 30, 65, .15, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#9a3412";
            ctx.beginPath();
            ctx.ellipse(-26, 0, 32, 68, -.07, 0, Math.PI * 2);
            ctx.ellipse(26, 0, 32, 68, .07, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#c2410c";
            ctx.beginPath();
            ctx.ellipse(0, 0, 34, 70, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(-25, -18);
            ctx.lineTo(-13, -6);
            ctx.moveTo(-13, -18);
            ctx.lineTo(-25, -6);
            ctx.moveTo(13, -18);
            ctx.lineTo(25, -6);
            ctx.moveTo(25, -18);
            ctx.lineTo(13, -6);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-20, 18);
            ctx.quadraticCurveTo(-10, 10, 0, 18);
            ctx.quadraticCurveTo(10, 26, 20, 18);
            ctx.stroke();
            ctx.restore();
            return;
        }
        if (boss.state === "chase" || boss.state === "ghost_transform" || boss.state === "swallowing" || boss.state === "final_cinematic") {
            ctx.translate(sx, sy);
            const isHorrorGhost = typeof window !== "undefined" && (!!window.postGameHorror || (document.body && document.body.classList.contains("horror-mode")));
            const isRageGhost = !!boss.rageMode;
            ctx.save();
            ctx.fillStyle = isHorrorGhost ? "rgba(45, 15, 60, 0.45)" : isRageGhost ? "rgba(220, 38, 38, 0.45)" : "rgba(241, 245, 249, 0.35)";
            for (let k = 1; k <= 4; k++) {
                const tailX = -k * 24;
                const tailY = Math.sin(time * .15 + k * .8) * 16;
                ctx.beginPath();
                ctx.ellipse(tailX, tailY, 34 - k * 5, 48 - k * 8, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
            ctx.fillStyle = isHorrorGhost ? "#1e1b29" : isRageGhost ? "#7f1d1d" : "rgba(226, 232, 240, 0.95)";
            ctx.shadowColor = isHorrorGhost ? "#a855f7" : isRageGhost ? "#ef4444" : "#ffffff";
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.moveTo(-6, -65);
            ctx.quadraticCurveTo(0, -90, 18, -88);
            ctx.quadraticCurveTo(8, -80, 6, -65);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 24 + Math.sin(time * .1) * 8;
            ctx.fillStyle = isHorrorGhost ? "rgba(30, 24, 45, 0.9)" : isRageGhost ? "rgba(153, 27, 27, 0.9)" : "rgba(203, 213, 225, 0.88)";
            ctx.beginPath();
            ctx.ellipse(-48, 0, 30, 65, -.15, 0, Math.PI * 2);
            ctx.ellipse(48, 0, 30, 65, .15, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = isHorrorGhost ? "rgba(40, 32, 60, 0.95)" : isRageGhost ? "rgba(185, 28, 28, 0.95)" : "rgba(241, 245, 249, 0.94)";
            ctx.beginPath();
            ctx.ellipse(-26, 0, 32, 68, -.07, 0, Math.PI * 2);
            ctx.ellipse(26, 0, 32, 68, .07, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = isHorrorGhost ? "#382d54" : isRageGhost ? "#b91c1c" : "rgba(255, 255, 255, 0.98)";
            ctx.beginPath();
            ctx.ellipse(0, 0, 34, 70, 0, 0, Math.PI * 2);
            ctx.fill();
            if (boss.state === "final_cinematic" && boss.finalBeamActive) {
                ctx.fillStyle = "#ef4444";
                ctx.shadowColor = "#dc2626";
                ctx.shadowBlur = 18;
                ctx.beginPath();
                ctx.arc(-22, -15, 14, 0, Math.PI * 2);
                ctx.arc(22, -15, 14, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#0f172a";
                ctx.beginPath();
                ctx.ellipse(0, 24, 30, 36, 0, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = isHorrorGhost ? "#ff0033" : isRageGhost ? "#ff3300" : "#a855f7";
                ctx.shadowColor = isHorrorGhost ? "#dc2626" : isRageGhost ? "#f97316" : "#38bdf8";
                ctx.shadowBlur = 18;
                ctx.beginPath();
                ctx.moveTo(-35, -18);
                ctx.lineTo(-14, -28);
                ctx.lineTo(-16, -10);
                ctx.closePath();
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(14, -28);
                ctx.lineTo(35, -18);
                ctx.lineTo(16, -10);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = "#05050a";
                ctx.beginPath();
                if (boss.state === "swallowing") {
                    ctx.ellipse(0, 20, 42, 38, 0, 0, Math.PI * 2);
                } else {
                    ctx.ellipse(0, 22, 28, 16, 0, 0, Math.PI * 2);
                }
                ctx.fill();
            }
            ctx.restore();
            boss.chaseProjectiles.forEach(cp => {
                const cpx = cp.x - cameraX;
                const cpy = cp.y;
                ctx.save();
                ctx.translate(cpx, cpy);
                const gGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, cp.radius);
                gGrad.addColorStop(0, "#ffffff");
                gGrad.addColorStop(.4, "#c084fc");
                gGrad.addColorStop(1, "rgba(147, 51, 234, 0)");
                ctx.fillStyle = gGrad;
                ctx.shadowColor = "#c084fc";
                ctx.shadowBlur = 14;
                ctx.beginPath();
                ctx.arc(0, 0, cp.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
            if (boss.state === "final_cinematic" && game.player) {
                const px = game.player.x + game.player.w / 2 - cameraX;
                const py = game.player.y + game.player.h / 2;
                if (!boss.finalBeamActive && boss.finalChargeLevel > 0) {
                    ctx.save();
                    const orbR = boss.finalChargeLevel * 14;
                    const oGrad = ctx.createRadialGradient(px - 30, py, 4, px - 30, py, orbR);
                    oGrad.addColorStop(0, "#ffffff");
                    oGrad.addColorStop(.4, "#fde047");
                    oGrad.addColorStop(.8, "#ef4444");
                    oGrad.addColorStop(1, "rgba(239, 68, 68, 0)");
                    ctx.fillStyle = oGrad;
                    ctx.shadowColor = "#fde047";
                    ctx.shadowBlur = 25;
                    ctx.beginPath();
                    ctx.arc(px - 30, py, orbR, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
                if (boss.finalBeamActive) {
                    ctx.save();
                    const targetBX = boss.x - cameraX;
                    const targetBY = boss.y;
                    const beamGrad = ctx.createLinearGradient(0, py - 35, 0, py + 35);
                    beamGrad.addColorStop(0, "rgba(254, 240, 138, 0.9)");
                    beamGrad.addColorStop(.5, "#ffffff");
                    beamGrad.addColorStop(1, "rgba(239, 68, 68, 0.9)");
                    ctx.fillStyle = beamGrad;
                    ctx.shadowColor = "#fde047";
                    ctx.shadowBlur = 35;
                    ctx.fillRect(targetBX, py - 30, px - targetBX, 60);
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.ellipse(targetBX, targetBY, 35, 55, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }
            }
            return;
        }
        if (boss.state === "stunned_light") {
            const starCount = 5;
            const orbitR = 75;
            const starSpeed = time * .08;
            for (let i = 0; i < starCount; i++) {
                const angle = starSpeed + i * Math.PI * 2 / starCount;
                const stx = sx + Math.cos(angle) * orbitR;
                const sty = sy - 65 + Math.sin(angle) * (orbitR * .38);
                ctx.save();
                ctx.translate(stx, sty);
                ctx.rotate(time * .15 + i);
                ctx.font = "bold 18px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("💫", 0, 0);
                ctx.restore();
            }
        }
        ctx.translate(sx, sy);
        if (boss.facing === 1) ctx.scale(-1, 1);
        if (boss.hitFlash > 0) ctx.filter = "brightness(2.2) contrast(1.5)";
        
        const isHorror = typeof window !== "undefined" && (!!window.postGameHorror || (document.body && document.body.classList.contains("horror-mode")));
        const isRage = !!boss.rageMode;
        const isStunned = boss.state === "stunned_light";
        const isMocking = boss.immuneAttackTimer > 0 && !isStunned;
        const isAttacking = boss.currentAttack === "spit_minions" || boss.currentAttack === "fan_fireballs" || boss.mouthGlow;

        ctx.save();
        if (isHorror && isRage) {
            ctx.shadowColor = "#ff0044";
            ctx.shadowBlur = 45 + Math.sin(time * 0.25) * 15;
            ctx.fillStyle = "rgba(35, 0, 18, 0.7)";
            ctx.beginPath();
            ctx.arc(0, 0, 108, 0, Math.PI * 2);
            ctx.fill();
            for (let f = 0; f < 6; f++) {
                const ang = f * Math.PI / 3 + time * 0.05;
                const dist = 76 + Math.sin(time * 0.2 + f) * 18;
                ctx.fillStyle = f % 2 === 0 ? "rgba(185, 28, 28, 0.45)" : "rgba(88, 28, 135, 0.4)";
                ctx.beginPath();
                ctx.arc(Math.cos(ang) * dist, Math.sin(ang) * dist, 22 + Math.sin(time * 0.1 + f) * 8, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (isHorror) {
            ctx.shadowColor = "#3b0764";
            ctx.shadowBlur = 35 + Math.sin(time * 0.15) * 12;
            ctx.fillStyle = "rgba(12, 6, 22, 0.65)";
            ctx.beginPath();
            ctx.arc(0, 0, 96, 0, Math.PI * 2);
            ctx.fill();
            for (let f = 0; f < 4; f++) {
                const ang = f * Math.PI / 2 + time * 0.035;
                const dist = 66 + Math.sin(time * 0.15 + f) * 14;
                ctx.fillStyle = "rgba(49, 10, 75, 0.38)";
                ctx.beginPath();
                ctx.arc(Math.cos(ang) * dist, Math.sin(ang) * dist, 20, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (isRage) {
            ctx.shadowColor = "#ff2200";
            ctx.shadowBlur = 48 + Math.sin(time * 0.25) * 18;
            ctx.fillStyle = "rgba(220, 38, 38, 0.52)";
            ctx.beginPath();
            ctx.arc(0, 0, 100, 0, Math.PI * 2);
            ctx.fill();
            for (let f = 0; f < 5; f++) {
                const ang = f * (Math.PI * 2 / 5) + time * 0.08;
                const dist = 72 + Math.sin(time * 0.3 + f) * 15;
                ctx.fillStyle = "rgba(251, 146, 60, 0.42)";
                ctx.beginPath();
                ctx.arc(Math.cos(ang) * dist, Math.sin(ang) * dist, 18, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();

        if (isHorror) {
            ctx.save();
            ctx.strokeStyle = isRage ? "#5c0e1e" : "#1e1b4b";
            ctx.lineWidth = 3.5;
            ctx.lineCap = "round";
            for (let tIdx = 0; tIdx < 5; tIdx++) {
                const startX = -40 + tIdx * 20;
                const startY = 48;
                const wave = Math.sin(time * 0.12 + tIdx * 1.3) * 16;
                const length = 36 + Math.cos(time * 0.1 + tIdx) * 10;
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.quadraticCurveTo(startX + wave, startY + length * 0.6, startX + wave * 1.5, startY + length);
                ctx.stroke();

                ctx.fillStyle = isRage ? "#ef4444" : "#0f0f17";
                ctx.beginPath();
                ctx.arc(startX + wave * 1.5, startY + length, 2.8, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        ctx.save();
        if (isHorror && isRage) {
            ctx.fillStyle = "#18181b";
            ctx.strokeStyle = "#ff0044";
            ctx.lineWidth = 2.5;
            ctx.shadowColor = "#ff0044";
            ctx.shadowBlur = 16;
            ctx.beginPath();
            ctx.moveTo(-16, -65);
            ctx.quadraticCurveTo(-48, -96, -38, -118 + Math.sin(time * 0.15) * 4);
            ctx.quadraticCurveTo(-22, -90, -4, -65);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(4, -65);
            ctx.quadraticCurveTo(22, -90, 38, -118 + Math.cos(time * 0.15) * 4);
            ctx.quadraticCurveTo(48, -96, 16, -65);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#3f3f46";
            ctx.beginPath();
            ctx.moveTo(-6, -65); ctx.lineTo(0, -90); ctx.lineTo(6, -65); ctx.closePath();
            ctx.fill();
        } else if (isHorror) {
            ctx.fillStyle = "#27272a";
            ctx.strokeStyle = "#7e22ce";
            ctx.lineWidth = 2.2;
            ctx.shadowColor = "#a855f7";
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.moveTo(-8, -65);
            ctx.quadraticCurveTo(-28, -92, -10, -108 + Math.sin(time * 0.1) * 4);
            ctx.quadraticCurveTo(8, -85, 8, -65);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#e2e8f0";
            ctx.beginPath();
            ctx.moveTo(-14, -80); ctx.lineTo(-24, -85); ctx.lineTo(-12, -87);
            ctx.moveTo(2, -86); ctx.lineTo(12, -92); ctx.lineTo(4, -94);
            ctx.fill();
        } else if (isRage) {
            ctx.fillStyle = "#450a0a";
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 2.5;
            ctx.shadowColor = "#f97316";
            ctx.shadowBlur = 18;
            ctx.beginPath();
            ctx.moveTo(-12, -65);
            ctx.quadraticCurveTo(-38, -96, 14, -106 + Math.sin(time * 0.15) * 5);
            ctx.quadraticCurveTo(8, -80, 10, -65);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#fef08a";
            ctx.beginPath();
            ctx.arc(14, -106 + Math.sin(time * 0.15) * 5, 4.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = isStunned ? "#064e3b" : "#14532d";
            ctx.beginPath();
            ctx.moveTo(-10, -65);
            ctx.quadraticCurveTo(-30, -95, 10, -100 + Math.sin(time * 0.1) * 5);
            ctx.quadraticCurveTo(5, -80, 10, -65);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#052e16";
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        ctx.restore();

        const rColor = (isHorror && isRage) ? "#120308" : isHorror ? "#0f0f14" : isRage ? "#5c0e0e" : isStunned ? "#d97706" : "#c2410c";
        const mColor = (isHorror && isRage) ? "#260611" : isHorror ? "#1a1826" : isRage ? "#7f1d1d" : isStunned ? "#f59e0b" : "#ea580c";
        const cColor = (isHorror && isRage) ? "#40091c" : isHorror ? "#28233a" : isRage ? "#991b1b" : isStunned ? "#fbbf24" : "#f97316";
        const hColor = (isHorror && isRage) ? "#660d2b" : isHorror ? "#39324e" : isRage ? "#dc2626" : isStunned ? "#fde68a" : "#fdba74";

        const ribs = [
            { rx: 56, ry: 64, rot: 0.25, color: rColor },
            { rx: 44, ry: 67, rot: 0.15, color: mColor },
            { rx: 28, ry: 69, rot: 0.08, color: cColor },
            { rx: 14, ry: 70, rot: 0, color: hColor }
        ];

        ctx.shadowColor = (isHorror && isRage) ? "#ff0044" : isHorror ? "#3b0764" : isRage ? "#ef4444" : "#000000";
        ctx.shadowBlur = (isHorror || isRage) ? 22 : 10;
        
        for (let i = 0; i < ribs.length; i++) {
            const rib = ribs[i];
            ctx.fillStyle = rib.color;
            ctx.beginPath();
            if (rib.rot === 0) {
                ctx.ellipse(0, 0, rib.rx, rib.ry, 0, 0, Math.PI * 2);
            } else {
                ctx.ellipse(-rib.rx * 0.8, 0, rib.rx, rib.ry, -rib.rot, 0, Math.PI * 2);
                ctx.ellipse(rib.rx * 0.8, 0, rib.rx, rib.ry, rib.rot, 0, Math.PI * 2);
            }
            ctx.fill();
            
            ctx.strokeStyle = (isHorror && isRage) ? "rgba(255, 0, 68, 0.4)" : isHorror ? "rgba(88, 28, 135, 0.45)" : isRage ? "rgba(69, 10, 10, 0.6)" : "rgba(67, 20, 7, 0.4)";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        ctx.shadowBlur = 0;

        if (isRage || (isHorror && isRage)) {
            ctx.save();
            ctx.strokeStyle = (isHorror && isRage) ? "#ff0044" : "#facc15";
            ctx.lineWidth = 2;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(-45, -20); ctx.lineTo(-35, -5); ctx.lineTo(-42, 18); ctx.lineTo(-32, 35);
            ctx.moveTo(42, -25); ctx.lineTo(34, -8); ctx.lineTo(44, 15); ctx.lineTo(35, 38);
            ctx.moveTo(-10, -48); ctx.lineTo(0, -38); ctx.lineTo(8, -44);
            ctx.stroke();
            ctx.restore();
        }

        if (isHorror && !isRage) {
            ctx.save();
            ctx.strokeStyle = "#94a3b8";
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(-35, -42); ctx.lineTo(-15, -30);
            ctx.moveTo(20, -45); ctx.lineTo(38, -32);
            ctx.stroke();
            const drawStitch = (x1, y1, x2, y2) => {
                ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
            };
            drawStitch(-32, -45, -28, -37);
            drawStitch(-25, -40, -21, -32);
            drawStitch(-18, -35, -14, -27);
            drawStitch(23, -48, 27, -40);
            drawStitch(30, -43, 34, -35);
            ctx.restore();
        }

        const eyeY = -18;
        if (isStunned) {
            if (isHorror || isRage) {
                const eyeCenters = [-28, 28];
                eyeCenters.forEach(ecx => {
                    ctx.save();
                    ctx.translate(ecx, eyeY);
                    ctx.fillStyle = "#ffffff";
                    ctx.shadowColor = "#38bdf8";
                    ctx.shadowBlur = 24 + Math.sin(time * 0.3) * 10;
                    ctx.beginPath();
                    ctx.arc(0, 0, 16, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = "#00f0ff";
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(-20, 0); ctx.lineTo(20, 0);
                    ctx.moveTo(0, -20); ctx.lineTo(0, 20);
                    ctx.stroke();
                    ctx.restore();
                });
            } else {
                const eyeCenters = [-28, 28];
                eyeCenters.forEach((ecx, eIdx) => {
                    ctx.save();
                    ctx.translate(ecx, eyeY);
                    ctx.fillStyle = "#ffffff";
                    ctx.strokeStyle = "#1e293b";
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.arc(0, 0, 18, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                    const spinDir = eIdx === 0 ? 1 : -1;
                    const spinAngle = time * 0.22 * spinDir;
                    ctx.rotate(spinAngle);
                    ctx.strokeStyle = "#7c3aed";
                    ctx.lineWidth = 2.4;
                    ctx.beginPath();
                    for (let a = 0; a < Math.PI * 4; a += 0.15) {
                        const r = (a / (Math.PI * 4)) * 14;
                        const sx2 = Math.cos(a) * r;
                        const sy2 = Math.sin(a) * r;
                        if (a === 0) ctx.moveTo(sx2, sy2);
                        else ctx.lineTo(sx2, sy2);
                    }
                    ctx.stroke();
                    const orbR = 8;
                    const pupX = Math.cos(spinAngle * 1.8) * orbR;
                    const pupY = Math.sin(spinAngle * 1.8) * orbR;
                    ctx.fillStyle = "#0f172a";
                    ctx.beginPath();
                    ctx.arc(pupX, pupY, 5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(pupX - 1.5, pupY - 1.5, 1.8, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                });
                ctx.strokeStyle = "#3b82f6";
                ctx.lineWidth = 3.5;
                ctx.beginPath();
                ctx.moveTo(-40, eyeY - 20 + Math.sin(time * 0.2) * 3);
                ctx.quadraticCurveTo(-26, eyeY - 26 - Math.cos(time * 0.2) * 3, -14, eyeY - 18);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(14, eyeY - 18 + Math.cos(time * 0.2) * 3);
                ctx.quadraticCurveTo(26, eyeY - 26 - Math.sin(time * 0.2) * 3, 40, eyeY - 20);
                ctx.stroke();
            }
        } else if (isMocking) {
            const eyeGrad = isRage ? "#ff0044" : isHorror ? "#c084fc" : "#fde047";
            ctx.fillStyle = eyeGrad;
            ctx.shadowColor = eyeGrad; ctx.shadowBlur = 18;
            ctx.beginPath();
            ctx.moveTo(-44, eyeY + 4); ctx.quadraticCurveTo(-28, eyeY - 14, -12, eyeY - 4); ctx.quadraticCurveTo(-26, eyeY, -44, eyeY + 4);
            ctx.closePath(); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(12, eyeY - 4); ctx.quadraticCurveTo(28, eyeY - 14, 44, eyeY + 4); ctx.quadraticCurveTo(26, eyeY, 12, eyeY - 4);
            ctx.closePath(); ctx.fill();
            ctx.shadowBlur = 0;
        } else if (isHorror) {
            ctx.save();
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.moveTo(-52, eyeY - 2);
            ctx.quadraticCurveTo(-35, eyeY - 28, -14, eyeY - 14);
            ctx.quadraticCurveTo(-18, eyeY + 12, -36, eyeY + 10);
            ctx.quadraticCurveTo(-50, eyeY + 8, -52, eyeY - 2);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(14, eyeY - 14);
            ctx.quadraticCurveTo(35, eyeY - 28, 52, eyeY - 2);
            ctx.quadraticCurveTo(50, eyeY + 8, 36, eyeY + 10);
            ctx.quadraticCurveTo(18, eyeY + 12, 14, eyeY - 14);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = isRage ? "#7f1d1d" : "#050508";
            ctx.beginPath();
            ctx.moveTo(-44, eyeY + 6);
            ctx.quadraticCurveTo(-46, eyeY + 28, -42, eyeY + 45 + Math.sin(time * 0.1) * 3);
            ctx.quadraticCurveTo(-38, eyeY + 45, -36, eyeY + 26);
            ctx.lineTo(-34, eyeY + 8);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(34, eyeY + 8);
            ctx.quadraticCurveTo(36, eyeY + 26, 38, eyeY + 45 + Math.cos(time * 0.1) * 3);
            ctx.quadraticCurveTo(42, eyeY + 45, 44, eyeY + 28);
            ctx.lineTo(46, eyeY + 6);
            ctx.closePath();
            ctx.fill();

            const jitterX = (Math.sin(time * 0.5) * 1.5) + (Math.random() - 0.5) * 0.8;
            const jitterY = (Math.cos(time * 0.4) * 1.2) + (Math.random() - 0.5) * 0.8;
            [-32, 32].forEach(ecx => {
                ctx.save();
                ctx.translate(ecx + jitterX, eyeY - 4 + jitterY);
                ctx.fillStyle = isRage ? "#fee2e2" : "#f1f5f9";
                ctx.beginPath();
                ctx.arc(0, 0, 10, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = "#dc2626";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(-8, -4); ctx.lineTo(-3, -1);
                ctx.moveTo(7, -5); ctx.lineTo(2, -2);
                ctx.moveTo(-6, 6); ctx.lineTo(-2, 2);
                ctx.moveTo(6, 5); ctx.lineTo(2, 1);
                ctx.stroke();

                ctx.fillStyle = isRage ? "#991b1b" : "#7c3aed";
                ctx.shadowColor = isRage ? "#ff0000" : "#a855f7";
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "#000000";
                ctx.shadowBlur = 0;
                ctx.beginPath();
                ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(-1, -1, 1.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            ctx.fillStyle = isRage ? "#ff0033" : "#c084fc";
            ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.ellipse(0, eyeY - 26, 7, 3.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.ellipse(0, eyeY - 26, 1.8, 3.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else if (isRage) {
            const eyeBase = "#ff0000";
            ctx.fillStyle = eyeBase;
            ctx.shadowColor = eyeBase; ctx.shadowBlur = 28;
            ctx.beginPath();
            ctx.moveTo(-52, eyeY - 4);
            ctx.lineTo(-18, eyeY - 26);
            ctx.lineTo(-12, eyeY + 4);
            ctx.lineTo(-32, eyeY + 8);
            ctx.closePath(); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(12, eyeY + 4);
            ctx.lineTo(18, eyeY - 26);
            ctx.lineTo(52, eyeY - 4);
            ctx.lineTo(32, eyeY + 8);
            ctx.closePath(); ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = "#fde047"; ctx.shadowBlur = 15;
            ctx.beginPath(); ctx.arc(-26, eyeY - 6, 6, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(26, eyeY - 6, 6, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#000000";
            ctx.shadowBlur = 0;
            ctx.beginPath(); ctx.ellipse(-26, eyeY - 6, 2, 5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(26, eyeY - 6, 2, 5, 0, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = "#ff6600";
            ctx.beginPath();
            ctx.moveTo(-34, eyeY + 8); ctx.lineTo(-30, eyeY + 22); ctx.lineTo(-28, eyeY + 8);
            ctx.moveTo(34, eyeY + 8); ctx.lineTo(30, eyeY + 22); ctx.lineTo(28, eyeY + 8);
            ctx.fill();
        } else {
            const eyeBase = "#fef08a";
            ctx.fillStyle = eyeBase;
            ctx.shadowColor = eyeBase; ctx.shadowBlur = 25;
            ctx.beginPath();
            ctx.moveTo(-50, eyeY - 2); ctx.lineTo(-20, eyeY - 24); ctx.lineTo(-14, eyeY + 2); ctx.lineTo(-30, eyeY + 6);
            ctx.closePath(); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(14, eyeY + 2); ctx.lineTo(20, eyeY - 24); ctx.lineTo(50, eyeY - 2); ctx.lineTo(30, eyeY + 6);
            ctx.closePath(); ctx.fill();

            ctx.fillStyle = "#f97316"; ctx.shadowBlur = 0;
            ctx.beginPath(); ctx.arc(-26, eyeY - 6, 6, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(26, eyeY - 6, 6, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#000000";
            ctx.beginPath(); ctx.ellipse(-26, eyeY - 6, 2, 5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(26, eyeY - 6, 2, 5, 0, 0, Math.PI * 2); ctx.fill();
        }

        if (isHorror) {
            ctx.fillStyle = "#05050a";
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(-8, 8);
            ctx.lineTo(-2, 10);
            ctx.lineTo(0, 5);
            ctx.lineTo(2, 10);
            ctx.lineTo(8, 8);
            ctx.closePath();
            ctx.fill();
        } else if (isRage) {
            ctx.fillStyle = "#ff3b00";
            ctx.shadowColor = "#ff0000"; ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.moveTo(0, -8); ctx.lineTo(-10, 10); ctx.lineTo(0, 6); ctx.lineTo(10, 10); ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = isStunned ? "#60a5fa" : "#fde047";
            ctx.beginPath();
            ctx.moveTo(0, -6); ctx.lineTo(-12, 10); ctx.lineTo(12, 10); ctx.closePath();
            ctx.fill();
        }

        if (isAttacking) {
            if (isHorror) {
                ctx.fillStyle = "#05050a";
                ctx.beginPath();
                ctx.ellipse(0, 32, 48, 36, 0, 0, Math.PI * 2);
                ctx.fill();

                const vGrad = ctx.createRadialGradient(0, 32, 2, 0, 32, 44);
                vGrad.addColorStop(0, isRage ? "#ffffff" : "#f1f5f9");
                vGrad.addColorStop(0.3, isRage ? "#ff0044" : "#a855f7");
                vGrad.addColorStop(0.7, isRage ? "#7f1d1d" : "#3b0764");
                vGrad.addColorStop(1, "#050508");
                ctx.fillStyle = vGrad;
                ctx.beginPath();
                ctx.ellipse(0, 32, 40, 28, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = isRage ? "#fecaca" : "#e2e8f0";
                const upperTeeth = [-36, -26, -16, -6, 6, 16, 26, 36];
                upperTeeth.forEach((tx, idx) => {
                    const tH = 16 + (idx % 3) * 6;
                    ctx.beginPath();
                    ctx.moveTo(tx - 4, 8); ctx.lineTo(tx, 8 + tH); ctx.lineTo(tx + 4, 8);
                    ctx.closePath(); ctx.fill();
                });
                const lowerTeeth = [-30, -20, -10, 0, 10, 20, 30];
                lowerTeeth.forEach((tx, idx) => {
                    const tH = 14 + (idx % 2) * 8;
                    ctx.beginPath();
                    ctx.moveTo(tx - 4, 56); ctx.lineTo(tx, 56 - tH); ctx.lineTo(tx + 4, 56);
                    ctx.closePath(); ctx.fill();
                });
            } else {
                ctx.fillStyle = "#0f172a";
                ctx.beginPath();
                ctx.ellipse(0, 30, 46, 32, 0, 0, Math.PI * 2);
                ctx.fill();
                
                const mouthFire = ctx.createRadialGradient(0, 30, 2, 0, 30, 40);
                mouthFire.addColorStop(0, "#ffffff");
                mouthFire.addColorStop(.35, "#fde047");
                mouthFire.addColorStop(.7, isRage ? "#ff0000" : "#f97316");
                mouthFire.addColorStop(1, isRage ? "#7f1d1d" : "#991b1b");
                ctx.fillStyle = mouthFire;
                ctx.shadowColor = isRage ? "#ef4444" : "#f97316";
                ctx.shadowBlur = 30 + Math.sin(time * 0.5) * 15;
                ctx.beginPath();
                ctx.ellipse(0, 30, 38, 24, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.fillStyle = isRage ? "#7f1d1d" : "#ea580c";
                ctx.beginPath(); ctx.moveTo(-28, 6); ctx.lineTo(-20, 26); ctx.lineTo(-12, 6); ctx.fill();
                ctx.beginPath(); ctx.moveTo(12, 6); ctx.lineTo(20, 26); ctx.lineTo(28, 6); ctx.fill();
                ctx.beginPath(); ctx.moveTo(-6, 2); ctx.lineTo(0, 18); ctx.lineTo(6, 2); ctx.fill();
                ctx.beginPath(); ctx.moveTo(-18, 56); ctx.lineTo(-10, 36); ctx.lineTo(-2, 58); ctx.fill();
                ctx.beginPath(); ctx.moveTo(2, 58); ctx.lineTo(10, 36); ctx.lineTo(18, 56); ctx.fill();
            }
        } else if (isStunned) {
            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.moveTo(-36, 26);
            ctx.quadraticCurveTo(0, 44 + Math.sin(time * 0.25) * 4, 36, 26);
            ctx.quadraticCurveTo(0, 30, -36, 26);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "#f43f5e";
            ctx.beginPath();
            ctx.ellipse(0, 36 + Math.sin(time * 0.25) * 3, 11, 9, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#9f1239";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, 31); ctx.lineTo(0, 42); ctx.stroke();
        } else if (isHorror) {
            ctx.fillStyle = "#05050a";
            ctx.beginPath();
            const gw = 62;
            const gy = 26;
            ctx.moveTo(-gw, gy - 16);
            for (let x = -gw; x <= gw; x += 10) {
                const dip = (x % 20 === 0) ? 8 : -6;
                ctx.lineTo(x, gy + dip);
            }
            for (let x = gw; x >= -gw; x -= 10) {
                const dip = (x % 20 === 0) ? 18 : 6;
                ctx.lineTo(x, gy + dip);
            }
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = isRage ? "#fca5a5" : "#cbd5e1";
            for (let x = -gw + 8; x <= gw - 8; x += 9) {
                ctx.beginPath();
                ctx.moveTo(x - 3, gy - 6); ctx.lineTo(x + 3, gy - 6); ctx.lineTo(x + 2, gy + 5); ctx.lineTo(x - 2, gy + 5);
                ctx.closePath(); ctx.fill();
                ctx.beginPath();
                ctx.moveTo(x - 3, gy + 16); ctx.lineTo(x + 3, gy + 16); ctx.lineTo(x + 2, gy + 7); ctx.lineTo(x - 2, gy + 7);
                ctx.closePath(); ctx.fill();
            }

            ctx.fillStyle = isRage ? "#7f1d1d" : "#050508";
            ctx.beginPath();
            ctx.moveTo(-gw + 4, gy - 12);
            ctx.quadraticCurveTo(-gw + 2, gy + 8, -gw + 6, gy + 26 + Math.sin(time * 0.15) * 4);
            ctx.quadraticCurveTo(-gw + 10, gy + 8, -gw + 12, gy - 6);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(gw - 12, gy - 6);
            ctx.quadraticCurveTo(gw - 10, gy + 8, gw - 6, gy + 26 + Math.cos(time * 0.15) * 4);
            ctx.quadraticCurveTo(gw - 2, gy + 8, gw - 4, gy - 12);
            ctx.fill();
        } else {
            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            const gw = isRage ? 60 : 56;
            const gy = 26;
            ctx.moveTo(-gw, gy - 12);
            ctx.lineTo(-40, gy + 4); ctx.lineTo(-30, gy - 6); ctx.lineTo(-20, gy + 8);
            ctx.lineTo(-10, gy - 4); ctx.lineTo(0, gy + 10); ctx.lineTo(10, gy - 4);
            ctx.lineTo(20, gy + 8); ctx.lineTo(30, gy - 6); ctx.lineTo(40, gy + 4);
            ctx.lineTo(gw, gy - 12);
            ctx.lineTo(48, gy + 14); ctx.lineTo(38, gy + 2); ctx.lineTo(28, gy + 18);
            ctx.lineTo(18, gy + 4); ctx.lineTo(8, gy + 20); ctx.lineTo(-2, gy + 6);
            ctx.lineTo(-12, gy + 20); ctx.lineTo(-22, gy + 4); ctx.lineTo(-32, gy + 18);
            ctx.lineTo(-42, gy + 2); ctx.lineTo(-50, gy + 14);
            ctx.closePath();
            ctx.fill();
            
            ctx.fillStyle = isRage ? "#ff0000" : "#fde047";
            ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = isRage ? 18 : 10;
            ctx.beginPath();
            ctx.moveTo(-46, gy + 2);
            ctx.quadraticCurveTo(0, gy + 22, 46, gy + 2);
            ctx.quadraticCurveTo(0, gy + 8, -46, gy + 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        ctx.restore();
        boss.projectiles.forEach(p => {
            const px = p.x - cameraX;
            const py = p.y;
            ctx.save();
            ctx.translate(px, py);
            
            const angle = Math.atan2(p.vy || 0, p.vx || 1);
            ctx.rotate(angle);

            const r = p.radius || 15;

            ctx.fillStyle = "rgba(185, 28, 28, 0.6)";
            ctx.shadowColor = "#ef4444";
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.moveTo(r*0.5, 0);
            ctx.lineTo(-r*2.5, -r*0.8);
            ctx.lineTo(-r*1.5, 0);
            ctx.lineTo(-r*2.5, r*0.8);
            ctx.closePath();
            ctx.fill();

            const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, r);
            grad.addColorStop(0, "#ffffff");
            grad.addColorStop(.3, "#fde047");
            grad.addColorStop(.7, "#ea580c");
            grad.addColorStop(1, "rgba(185, 28, 28, 0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.ellipse(0, 0, r*0.6, r*0.3, 0, 0, Math.PI*2);
            ctx.fill();

            ctx.restore();
        });
    }
    function drawCandlesAndButtons(ctx, boss, cameraX, time) {
        if (!boss || boss.state === "idle" || boss.state === "chase" || boss.state === "final_cinematic") return;
        boss.candles.forEach(c => {
            const bx = c.btnX - cameraX;
            const by = c.btnY;
            const cx = c.candleX - cameraX;
            const cy = c.candleY;
            ctx.save();
            const btnW = c.btnW;
            const btnH = c.btnH;
            const depth = c.pressDepth;
            ctx.fillStyle = "#1e293b";
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(bx - 4, by - 2, btnW + 8, btnH + 6, 4);
            ctx.fill();
            ctx.stroke();
            const plungerY = by + depth;
            const plungerH = Math.max(4, btnH - depth);
            const redGrad = ctx.createLinearGradient(bx, plungerY, bx, plungerY + plungerH);
            if (c.lit) {
                redGrad.addColorStop(0, "#22c55e");
                redGrad.addColorStop(1, "#15803d");
            } else {
                redGrad.addColorStop(0, "#ef4444");
                redGrad.addColorStop(1, "#991b1b");
            }
            ctx.fillStyle = redGrad;
            ctx.beginPath();
            ctx.roundRect(bx, plungerY, btnW, plungerH, [ 4, 4, 2, 2 ]);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 11px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(c.lit ? "✓" : "▼", bx + btnW / 2, plungerY + plungerH / 2);
            ctx.fillStyle = "#64748b";
            ctx.beginPath();
            ctx.ellipse(cx, cy + 28, 14, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#f1f5f9";
            ctx.strokeStyle = "#cbd5e1";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(cx - 7, cy, 14, 28, 2);
            ctx.fill();
            ctx.stroke();
            ctx.strokeStyle = "#334155";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + (c.lit ? Math.sin(time * .1) * 2 : 0), cy - 6);
            ctx.stroke();
            if (c.lit) {
                const flameY = cy - 8;
                const fWiggle = Math.sin(time * .2 + c.id) * 3;
                const fScale = 1 + Math.sin(time * .15 + c.id) * .15;
                ctx.save();
                ctx.translate(cx + fWiggle, flameY);
                ctx.scale(fScale, fScale);
                const fGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
                fGrad.addColorStop(0, "#ffffff");
                fGrad.addColorStop(.35, "#fde047");
                fGrad.addColorStop(.75, "#f97316");
                fGrad.addColorStop(1, "rgba(239, 68, 68, 0)");
                ctx.fillStyle = fGrad;
                ctx.beginPath();
                ctx.moveTo(0, -18);
                ctx.quadraticCurveTo(8, -8, 6, 2);
                ctx.quadraticCurveTo(0, 6, -6, 2);
                ctx.quadraticCurveTo(-8, -8, 0, -18);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
            ctx.restore();
        });
    }
    function drawDarknessAndLighting(ctx, boss, cameraX, time) {
        if (!boss || boss.state === "idle") return;
        if (boss.state === "heartbeat" && boss.heartbeatAlpha > .01) {
            ctx.save();
            ctx.fillStyle = `rgba(3, 1, 10, ${boss.heartbeatAlpha})`;
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            ctx.restore();
            return;
        }
        if (boss.state === "chase" && boss.chaseDarkAlpha > .02) {
            ctx.save();
            ctx.fillStyle = `rgba(5, 1, 12, ${boss.chaseDarkAlpha})`;
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            ctx.restore();
            return;
        }
        if (boss.state === "chase") {
            boss._chaseDarkness = Math.min((boss._chaseDarkness || 0) + .005, .75);
            ctx.save();
            ctx.fillStyle = `rgba(6, 2, 14, ${boss._chaseDarkness})`;
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            ctx.restore();
            if (game.player && typeof game.player.draw === "function") {
                game.player.draw(ctx, cameraX);
            }
            return;
        }
        if (boss.state !== "battle") {
            return;
        }
        const litCount = boss.litCount || 0;
        const currentDarkAlpha = Math.max(0, .68 - litCount * .13);
        const arenaStartX = 25200 - cameraX;
        const arenaEndX = 26750 - cameraX;
        const drawLeft = Math.max(0, arenaStartX);
        const drawRight = Math.min(VIEW_W, arenaEndX);
        if (drawRight > drawLeft && currentDarkAlpha > .02) {
            ctx.save();
            ctx.fillStyle = `rgba(6, 2, 14, ${currentDarkAlpha})`;
            ctx.fillRect(drawLeft, 0, drawRight - drawLeft, VIEW_H);
            ctx.restore();
            if (game.player && typeof game.player.draw === "function") {
                game.player.draw(ctx, cameraX);
            }
        }
        ctx.save();
        boss.candles.forEach(c => {
            if (c.lit) {
                const cx = c.candleX - cameraX;
                const cy = c.candleY + 12;
                const platY = c.candleY + 24;
                const pGrad = ctx.createLinearGradient(cx - 55, platY, cx + 55, platY);
                pGrad.addColorStop(0, "rgba(254, 240, 138, 0)");
                pGrad.addColorStop(.5, "rgba(254, 240, 138, 0.7)");
                pGrad.addColorStop(1, "rgba(254, 240, 138, 0)");
                ctx.fillStyle = pGrad;
                ctx.fillRect(cx - 55, platY, 110, 4);
                const auraGrad = ctx.createRadialGradient(cx, platY, 2, cx, platY, 45);
                auraGrad.addColorStop(0, "rgba(251, 191, 36, 0.3)");
                auraGrad.addColorStop(1, "rgba(251, 191, 36, 0)");
                ctx.fillStyle = auraGrad;
                ctx.beginPath();
                ctx.ellipse(cx, platY, 55, 14, 0, 0, Math.PI * 2);
                ctx.fill();
                const pulseR = 50 + Math.sin(time * .14 + c.id) * 5;
                const pulseW = 2.6 + Math.sin(time * .18 + c.id) * .8;
                ctx.strokeStyle = "#ffd700";
                ctx.lineWidth = pulseW;
                ctx.beginPath();
                ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
                ctx.stroke();
                ctx.strokeStyle = "#fffbeb";
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.arc(cx, cy, pulseR, -time * .12, -time * .12 + Math.PI * .45);
                ctx.stroke();
            }
        });
        ctx.restore();
    }
    function drawPeggyPanicFace(ctx, cameraX, time) {
        if (!game.player || !game.pumpkinBoss || game.pumpkinBoss.state !== "chase") return;
        const p = game.player;
        const px = p.x - cameraX;
        const py = p.y;
        ctx.save();
        ctx.translate(px, py);
        for (let i = 0; i < 3; i++) {
            const dropX = -6 - (time * .4 + i * 8) % 24;
            const dropY = 4 + i * 6 + Math.sin(time * .2 + i) * 3;
            ctx.fillStyle = "#38bdf8";
            ctx.beginPath();
            ctx.arc(dropX, dropY, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(10, 10, 5, 0, Math.PI * 2);
        ctx.arc(22, 10, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(11, 10, 2.5, 0, Math.PI * 2);
        ctx.arc(23, 10, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1e1b4b";
        ctx.beginPath();
        ctx.ellipse(16, 22, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    window.createPumpkinBoss = createPumpkinBoss;
    window.updateAndDrawPumpkinBoss = function(ctx, cameraX, time) {
        if (currentLevel !== 6 || !game.pumpkinBoss) return;
        updatePumpkinBoss(game.pumpkinBoss, time);
        drawCandlesAndButtons(ctx, game.pumpkinBoss, cameraX, time);
        drawPumpkinBoss(ctx, game.pumpkinBoss, cameraX, time);
        drawDarknessAndLighting(ctx, game.pumpkinBoss, cameraX, time);
        drawPeggyPanicFace(ctx, cameraX, time);
    };
})();
