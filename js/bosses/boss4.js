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
            health: typeof window !== "undefined" && window.postGameHorror ? 760 : 380,
            maxHealth: typeof window !== "undefined" && window.postGameHorror ? 760 : 380,
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
                const isBeam = (chargeLevel === 5);
                const actualDmg = isBeam ? (amount * mult) : Math.max(1, Math.round(amount * mult));
                this.health = Math.max(0, this.health - actualDmg);
                this.hitFlash = isBeam ? 3 : 10;
                applyShake(this.state === "vulnerable" ? 10 : (isBeam ? 2 : 5));
                if (!isBeam || Math.random() < 0.2) {
                    playSound(160, .15, "sawtooth", .25, 70);
                }
                const hx = this.x + (Math.random() - .5) * 40;
                const hy = this.hitY + 20 + (Math.random() - .5) * 30;
                const dmgCol = this.state === "vulnerable" ? "#fde047" : "#38bdf8";
                if (!isBeam) {
                    const tag = "";
                    addFloatingText(hx, hy, tag + "-" + actualDmg, dmgCol, this.state === "vulnerable" ? 22 : 16);
                }
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
                if (this.health <= this.maxHealth * .5 && !this.rageMode && !this._rageCineActive && !this._rageCineDone) {
                    startKrakatoaRageCinematic(this);
                }
                if (this.health <= 0) {
                    this.triggerDefeat();
                }
            },
            triggerDefeat: function() {
                this._finishDefeat();
            },
            _finishDefeat: function() {
                this.state = "defeated";
                this.defeatedTimer = 0;
                this.stoneY = -999;
                removeKrakatoaButtons();
                this.sealActive = false;
                if (typeof window.triggerHappyMoment === "function") window.triggerHappyMoment();
                try {
                    if (typeof audios !== "undefined" && audios["sfx_dizzy_loop"]) {
                        audios["sfx_dizzy_loop"].pause();
                        audios["sfx_dizzy_loop"].currentTime = 0;
                    }
                    stopAllSFX();
                } catch (e) {}
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
                        addFloatingText(boss.x, boss.hitY - 65, __("ui_storm_alert") || "¡TEMPESTAD MAREADA!", "#38bdf8", 26);
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
                if ((game.player.onGround || game.player.vy >= 0) && pbx >= btn.x - 10 && pbx <= btn.x + btn.w + 10 && pby >= btn.y - 12 && pby <= btn.y + btn.h + 16) {
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
        if (boss.health > 0 && boss.health <= boss.maxHealth * .5 && !boss.rageMode && !boss._rageCineActive && !boss._rageCineDone) {
            startKrakatoaRageCinematic(boss);
            return;
        }
        if (boss.state === "rage_cin") {
            boss.y += (boss.targetY - boss.y) * .08;
            boss.tentaclePhase += .16;
            return;
        }
        if (boss.state === "intro") return;
        if (boss.state === "presentation" || boss.state === "emerging") {
            boss.y += (boss.targetY - boss.y) * (window.postGameHorror ? .15 : .048);
            boss.tentaclePhase += .14;
            if (Math.random() < .7) {
                particles.push({
                    x: boss.x + (Math.random() - .5) * 160,
                    y: 495,
                    vx: (Math.random() - .5) * 8,
                    vy: -Math.random() * 7 - 2,
                    life: 18,
                    color: Math.random() < .5 ? "#38bdf8" : "#ffffff",
                    size: 3 + Math.random() * 4,
                    type: "spark"
                });
            }
            if (Math.abs(boss.y - boss.targetY) < 4) {
                boss.y = boss.targetY;
                if (boss.state === "emerging") {
                    boss.state = "attack";
                    boss.salvosLeft = window.postGameHorror ? 2 : 1;
                    boss.salvoTimer = window.postGameHorror ? 20 : 35;
                    playSound(220, .4, "sawtooth", .3, 90);
                }
            }
            if (boss.state === "presentation") {
                boss.presentationTimer = (boss.presentationTimer || 0) + 1;
                if (boss.presentationTimer > 280 && (!window.BossHUD || !window.BossHUD._activePres)) {
                    boss.state = "appreciate";
                    boss.stateTimer = 40;
                }
            }
            return;
        }
        if (boss.state === "appreciate") {
            boss.stateTimer--;
            boss.tentaclePhase += .08;
            if (boss.stateTimer <= 0) {
                boss.state = "attack";
                if (game.player) game.player.frozen = false;
                if (window.BossHUD) {
                    window.BossHUD.show(__("boss_name_4") || "KRAKATOAAA", boss.health, boss.maxHealth, "#06b6d4");
                }
                boss.salvosLeft = window.postGameHorror ? 2 : 1;
                boss.salvoTimer = window.postGameHorror ? 22 : 40;
                playSound(220, .4, "sawtooth", .3, 90);
            }
            return;
        }
        if (boss.state === "attack") {
            boss.salvoTimer--;
            if (boss.salvoTimer <= 0) {
                if (boss.patternIndex === 0) fireBigBallPattern(boss); else fireInkRainPattern(boss);
                playSound(320, .2, "triangle", .25, 120);
                boss.salvosLeft--;
                if (boss.salvosLeft > 0) {
                    boss.salvoTimer = window.postGameHorror ? 20 : 30;
                    boss.patternIndex = (boss.patternIndex + 1) % 2;
                } else {
                    boss.state = "submerging";
                }
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
                    if (typeof audios !== "undefined" && audios["sfx_dizzy_loop"]) {
                        audios["sfx_dizzy_loop"].pause();
                        audios["sfx_dizzy_loop"].currentTime = 0;
                    }
                    stopAllSFX();
                } catch (e) {}
                playSound(140, .4, "sine", .35, 60);
                createExplosion(boss.x, 495, "#06b6d4", 35, 20, [ "#00ffff", "#ffffff", "#38bdf8" ]);
            }
            return;
        }
        if (boss.state === "submerging") {
            boss.y += window.postGameHorror ? 11 : 6.5;
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
                boss.stateTimer = window.postGameHorror ? 42 : 80;
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
            isElectric: boss.rageMode,
            color: boss.rageMode ? "#00f0ff" : "#0284c7",
            life: 1500
        });
        addFloatingText(cx + Math.cos(angle) * 70, cy + Math.sin(angle) * 70 - 24, __("flt_krakatoa_bigball"), "#38bdf8", 24);
        const count = (boss.rageMode ? 7 : 5) + (window.postGameHorror ? 2 : 0);
        const spread = boss.rageMode ? .5 : .36;
        const startAng = angle - spread * (count - 1) / 2;
        const fanSpeed = (boss.rageMode ? 6.2 : 5) * (window.postGameHorror ? 1.25 : 1);
        for (let s = 0; s < count; s++) {
            const curAng = startAng + s * spread;
            const isElec = boss.rageMode && (s % 2 === 0);
            enemyProjectiles.push({
                x: cx + Math.cos(curAng) * 30,
                y: cy + Math.sin(curAng) * 30,
                vx: Math.cos(curAng) * fanSpeed,
                vy: Math.sin(curAng) * fanSpeed,
                w: isElec ? 16 : 13,
                h: isElec ? 16 : 13,
                radius: isElec ? 8 : 6.5,
                damage: boss.rageMode ? 16 : 13,
                isWaterBullet: !isElec,
                isElectric: isElec,
                homing: isElec,
                homingTimer: isElec ? 60 : 0,
                turnSpeed: .042,
                color: isElec ? "#00f0ff" : boss.rageMode ? "#f43f5e" : "#06b6d4",
                life: 260
            });
        }
        if (boss.rageMode) {
            for (let e = -1; e <= 1; e += 2) {
                const eAng = angle + e * .55;
                enemyProjectiles.push({
                    x: cx + Math.cos(eAng) * 38,
                    y: cy + Math.sin(eAng) * 38,
                    w: 18,
                    h: 18,
                    speed: 4.8,
                    vx: Math.cos(eAng) * 4.8,
                    vy: Math.sin(eAng) * 4.8,
                    color: "#00f0ff",
                    damage: 20,
                    isElectric: true,
                    homing: true,
                    homingTimer: 75,
                    turnSpeed: .045,
                    trail: []
                });
            }
            try {
                playSound(640, .2, "sawtooth", .3, 220);
            } catch (err) {}
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
        const count = (boss.rageMode ? 5 : 3) + (window.postGameHorror ? 2 : 0);
        const spread = .5;
        const startAng = angle - spread * (count - 1) / 2;
        const inkSpeed = (boss.rageMode ? 4.8 : 3.9) * (window.postGameHorror ? 1.25 : 1);
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
        if (boss.rageMode) {
            for (let e = -1; e <= 1; e += 2) {
                const eAng = angle + e * .45;
                enemyProjectiles.push({
                    x: cx + Math.cos(eAng) * 35,
                    y: cy + Math.sin(eAng) * 35,
                    w: 18,
                    h: 18,
                    speed: 4.5,
                    vx: Math.cos(eAng) * 4.5,
                    vy: Math.sin(eAng) * 4.5,
                    color: "#00f0ff",
                    damage: 20,
                    isElectric: true,
                    homing: true,
                    homingTimer: 80,
                    turnSpeed: .04,
                    trail: []
                });
            }
            try {
                playSound(640, .2, "sawtooth", .3, 220);
            } catch (err) {}
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
            const w = 68, h = 24;
            if (k === 2) {
                const ped = new Platform({
                    x: bx - w / 2,
                    y: lane.surfaceY,
                    w: w + 24,
                    h: 14
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
    function startKrakatoaRageCinematic(boss) {
        if (boss._rageCineActive || boss._rageCineDone) return;
        boss._rageCineActive = true;
        boss._rageCineDone = true;
        removeKrakatoaButtons();
        boss.sealActive = false;
        boss.stoneY = -999;
        try {
            if (typeof audios !== "undefined" && audios["sfx_dizzy_loop"]) {
                audios["sfx_dizzy_loop"].pause();
                audios["sfx_dizzy_loop"].currentTime = 0;
            }
            if (typeof stopAllSFX === "function") stopAllSFX();
        } catch (e) {}
        boss.state = "rage_cin";
        boss.rageMorphProgress = 0;
        boss.targetY = 270;
        boss.x = 22850;
        if (boss.y > 450) boss.y = 450;
        if (game.player) game.player.frozen = true;
        if (window.BossHUD) window.BossHUD.update(boss.health, boss.maxHealth, "#ef4444");

        playSound(90, .6, "sawtooth", .4, 30);
        applyShake(14);

        if (typeof gsap !== "undefined") {
            gsap.to(game, {
                cameraOverrideX: boss.x - VIEW_W / 2,
                duration: .7,
                ease: "power2.inOut",
                onComplete: () => {
                    playSound(70, .9, "sawtooth", .6, 35);
                    playSound(50, 1, "sawtooth", .7, 20);
                    applyShake(16);
                    addFloatingText(boss.x, boss.hitY - 45, typeof __ === "function" ? __("flt_krakatoa_abyss") : "¡¡¡EL ABISMO SE DESPIERTA!!!", "#ef4444", 28);
                    if (typeof showAnimatedDialogue === "function") {
                        showAnimatedDialogue(__("dlg_krakatoa_name") || "Krakatoaaa", "🐙", __("dlg_krakatoa_rage") || "¡Sentirás el verdadero terror de las profundidades!", null, 2500);
                    }
                    const animObj = { progress: 0 };
                    gsap.to(animObj, {
                        progress: 1,
                        duration: 1.6,
                        ease: "power2.in",
                        onUpdate: () => {
                            boss.rageMorphProgress = animObj.progress;
                            applyShake(6 + animObj.progress * 18);
                            boss.hitFlash = Math.random() < .65 ? 4 : 0;
                            if (typeof particles !== "undefined") {
                                for (let i = 0; i < 3; i++) {
                                    const ang = Math.random() * Math.PI * 2;
                                    const dist = 160 + Math.random() * 100;
                                    particles.push({
                                        x: boss.x + Math.cos(ang) * dist,
                                        y: boss.y + Math.sin(ang) * dist,
                                        vx: -Math.cos(ang) * (6 + animObj.progress * 7),
                                        vy: -Math.sin(ang) * (6 + animObj.progress * 7),
                                        life: 20,
                                        color: Math.random() < .5 ? "#ff1744" : "#fde047",
                                        size: 4 + Math.random() * 3,
                                        type: "spark"
                                    });
                                }
                                particles.push({
                                    x: boss.x + (Math.random() - .5) * 160,
                                    y: 495,
                                    vx: (Math.random() - .5) * 8,
                                    vy: -4 - Math.random() * 10 * animObj.progress,
                                    life: 18,
                                    color: "#38bdf8",
                                    size: 3.5,
                                    type: "spark"
                                });
                            }
                        },
                        onComplete: () => {
                            boss.rageMode = true;
                            boss.rageMorphProgress = 1;
                            boss.hitFlash = 32;
                            game.flash = 38;
                            applyShake(34);
                            playSound(55, 1.2, "sawtooth", .8, 20);
                            playSound(950, .45, "sawtooth", .4, 260);
                            createExplosion(boss.x, boss.y, "#ef4444", 80, 50, [ "#ff1744", "#00ffff", "#ffffff", "#4c0519", "#fde047" ]);
                            addFloatingText(boss.x, boss.hitY - 60, typeof __ === "function" ? __("flt_krakatoa_enraged") : "¡¡¡KRAKATOA ENFURECIDO!!!", "#fde047", 32);
                            setTimeout(() => {
                                if (game.player && typeof gsap !== "undefined") {
                                    gsap.to(game, {
                                        cameraOverrideX: game.player.x - VIEW_W / 2,
                                        duration: .8,
                                        ease: "power2.inOut",
                                        onComplete: () => {
                                            delete game.cameraOverrideX;
                                            if (game.player) game.player.frozen = false;
                                            boss._rageCineActive = false;
                                            boss.state = "attack";
                                            boss.salvoTimer = 35;
                                        }
                                    });
                                } else {
                                    delete game.cameraOverrideX;
                                    if (game.player) game.player.frozen = false;
                                    boss._rageCineActive = false;
                                    boss.state = "attack";
                                    boss.salvoTimer = 35;
                                }
                            }, 750);
                        }
                    });
                }
            });
        } else {
            boss.rageMode = true;
            boss._rageCineActive = false;
            if (game.player) game.player.frozen = false;
            boss.state = "attack";
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
        if (typeof audios !== "undefined" && audios.bgm_world4_sea) {
            try {
                audios.bgm_world4_sea.pause();
                audios.bgm_world4_sea.currentTime = 0;
            } catch (_) {}
        }
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
                if (typeof audios !== "undefined") {
                    if (audios.bgm_world4_sea) {
                        audios.bgm_world4_sea.pause();
                        audios.bgm_world4_sea.currentTime = 0;
                    }
                    if (audios.bgm_world4_storm) {
                        audios.bgm_world4_storm.pause();
                        audios.bgm_world4_storm.currentTime = 0;
                    }
                }
                playBGM("bgm_boss_kraken");
            } catch (e) {}
        }
        applyShake(28);
        playSound(80, .8, "sawtooth", .5, 30);
        createExplosion(boss.x, 495, "#06b6d4", 60, 36, [ "#00ffff", "#ffffff", "#38bdf8", "#ec4899" ]);
        if (game.player) game.player.frozen = true;
        if (typeof showAnimatedDialogue === "function") {
            showAnimatedDialogue(__("dlg_krakatoa_name") || "Krakatoaaa", "🐙", __("dlg_krakatoa_intro_1"), () => {
                showAnimatedDialogue(__("dlg_krakatoa_name") || "Krakatoaaa", "🐙", __("dlg_krakatoa_intro_2"), () => {
                    boss.state = "presentation";
                    boss.presentationTimer = 0;
                    boss.y = 580;
                    boss.targetY = 300;
                    if (game.player) game.player.frozen = true;
                    const onPresFinish = () => {
                        boss.y = boss.targetY;
                        boss.state = "appreciate";
                        boss.stateTimer = 60;
                        if (game.player) game.player.frozen = true;
                        playSound(90, .7, "sawtooth", .5, 50);
                        applyShake(16);
                        createExplosion(boss.x, 495, "#06b6d4", 45, 25, [ "#00ffff", "#ffffff", "#38bdf8" ]);
                    };
                    if (typeof window.playBossPresentation === "function") {
                        window.playBossPresentation({
                            name: "boss_name_4",
                            title: "boss_title_4",
                            icon: "🐙",
                            themeColor: "#06b6d4",
                            accentColor: "#a855f7",
                            targetX: boss.x,
                            targetY: 340,
                            zoom: 1.45,
                            duration: 3.2
                        }, onPresFinish);
                    } else {
                        onPresFinish();
                    }
                }, 3200);
            }, 2800);
        } else {
            boss.y = boss.targetY;
            boss.state = "appreciate";
            boss.stateTimer = 60;
            if (game.player) game.player.frozen = true;
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
        const isRage = boss.rageMode || (boss.rageMorphProgress && boss.rageMorphProgress > .4);
        ctx.shadowColor = isHit ? "#ffffff" : window.postGameHorror ? "#990000" : isRage ? "#ef4444" : isVuln ? "#fde047" : "#06b6d4";
        ctx.shadowBlur = isHit ? 24 : 16;
        if (boss.state === "rage_cin") {
            ctx.save();
            const morph = boss.rageMorphProgress || 0;
            const auraR = 110 + Math.sin(time * .35) * 15 + morph * 60;
            const auraGrad = ctx.createRadialGradient(bx, by, 20, bx, by, auraR);
            auraGrad.addColorStop(0, "rgba(239, 68, 68, 0.5)");
            auraGrad.addColorStop(.6, "rgba(185, 28, 28, 0.25)");
            auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = auraGrad;
            ctx.beginPath();
            ctx.arc(bx, by, auraR, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = Math.random() < .5 ? "#ff1744" : "#fde047";
            ctx.lineWidth = 2.5;
            for (let a = 0; a < 3; a++) {
                const ringR = (time * 40 + a * 35) % 120 + 30;
                const ringAlpha = 1 - (ringR - 30) / 120;
                ctx.globalAlpha = Math.max(0, ringAlpha * .7);
                ctx.beginPath();
                ctx.arc(bx, by, ringR, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
        const tentacleBaseY = by + 30;
        const tCount = isRage ? 10 : 6;
        const perSide = tCount / 2;
        for (let t = 0; t < tCount; t++) {
            const side = t < perSide ? -1 : 1;
            const tIdx = t % perSide;
            const waveSpeed = isVuln ? .04 : isRage ? .26 : .14;
            const wave = Math.sin(boss.tentaclePhase * (1 + tIdx * .2) + t * .8) * (isVuln ? 8 : isRage ? 36 : 28);
            const reachX = side * (isRage ? 45 + tIdx * 28 : 55 + tIdx * 35);
            const tipX = bx + reachX + (isVuln ? 0 : wave * 1.25);
            const tipY = isVuln ? tentacleBaseY + 65 + tIdx * 8 : tentacleBaseY - 45 + wave + tIdx * (isRage ? 14 : 20);
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
            ctx.lineWidth = isRage ? Math.max(8, 22 - tIdx * 2.8) : Math.max(6, 16 - tIdx * 3);
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(bx + side * 25, tentacleBaseY);
            ctx.quadraticCurveTo(bx + side * (45 + tIdx * 20), tentacleBaseY - 20 + wave * .5, tipX, tipY);
            ctx.stroke();
            ctx.fillStyle = isHit ? "#ffffff" : window.postGameHorror ? "#e4e4e7" : isRage ? "#fef08a" : "#e0f2fe";
            for (let v = .2; v <= .85; v += .2) {
                const vx = (bx + side * 25) * (1 - v) + tipX * v;
                const vy = tentacleBaseY * (1 - v) + tipY * v;
                ctx.beginPath();
                ctx.arc(vx, vy, (isRage ? 4 : 3.2) - tIdx * .35, 0, Math.PI * 2);
                ctx.fill();
                if (isRage) {
                    ctx.fillStyle = "#ef4444";
                    ctx.beginPath();
                    ctx.arc(vx, vy, 1.8, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = isHit ? "#ffffff" : "#fef08a";
                } else if (window.postGameHorror) {
                    ctx.fillStyle = "#7f1d1d";
                    ctx.beginPath();
                    ctx.arc(vx, vy, 1.4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#e4e4e7";
                }
            }
        }
        const breath = Math.sin(time * 0.12) * 2.5;
        const headW = 76 + (isRage ? 8 : 0);
        const headH = 96 + (isRage ? 10 : 0) + breath;

        const finWaveL = Math.sin(time * 0.15) * 6;
        const finWaveR = Math.sin(time * 0.15 + Math.PI) * 6;
        ctx.fillStyle = isRage ? "rgba(190, 18, 60, 0.45)" : "rgba(8, 145, 178, 0.45)";
        ctx.strokeStyle = isRage ? "#f43f5e" : "#22d3ee";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(bx - headW * 0.6, by - headH * 0.7);
        ctx.bezierCurveTo(bx - headW * 1.35 + finWaveL, by - headH * 0.5, bx - headW * 1.3 + finWaveL, by - headH * 0.1, bx - headW * 0.85, by + 10);
        ctx.quadraticCurveTo(bx - headW * 0.7, by - headH * 0.3, bx - headW * 0.6, by - headH * 0.7);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bx + headW * 0.6, by - headH * 0.7);
        ctx.bezierCurveTo(bx + headW * 1.35 + finWaveR, by - headH * 0.5, bx + headW * 1.3 + finWaveR, by - headH * 0.1, bx + headW * 0.85, by + 10);
        ctx.quadraticCurveTo(bx + headW * 0.7, by - headH * 0.3, bx + headW * 0.6, by - headH * 0.7);
        ctx.fill();
        ctx.stroke();

        if (isRage) {
            ctx.fillStyle = isHit ? "#ffffff" : "#4c0519";
            ctx.strokeStyle = isHit ? "#ffffff" : "#ff1744";
            ctx.lineWidth = 2.5;
            const spikeCount = 4;
            for (let s = 0; s < spikeCount; s++) {
                const progress = (s + .6) / (spikeCount + .5);
                const sy = by + 28 - progress * 85;
                const sxOffset = headW * Math.sin(progress * Math.PI * .88);
                const spikeLen = 22 + Math.sin(boss.tentaclePhase + s * 1.2) * 5;
                ctx.beginPath();
                ctx.moveTo(bx - sxOffset + 4, sy - 8);
                ctx.lineTo(bx - sxOffset - spikeLen, sy);
                ctx.lineTo(bx - sxOffset + 4, sy + 8);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(bx + sxOffset - 4, sy - 8);
                ctx.lineTo(bx + sxOffset + spikeLen, sy);
                ctx.lineTo(bx + sxOffset - 4, sy + 8);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        }

        const headGrad = ctx.createRadialGradient(bx - 15, by - 35, 12, bx, by, 95);
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
            headGrad.addColorStop(.3, "#ef4444");
            headGrad.addColorStop(.7, "#881337");
            headGrad.addColorStop(1, "#3f0714");
        } else {
            headGrad.addColorStop(0, "#a5f3fc");
            headGrad.addColorStop(.25, "#22d3ee");
            headGrad.addColorStop(.65, "#0891b2");
            headGrad.addColorStop(.9, "#0e7490");
            headGrad.addColorStop(1, "#083344");
        }
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.moveTo(bx - headW, by + 35);
        ctx.bezierCurveTo(bx - headW * 1.12, by - 40, bx - headW * .62, by - headH, bx, by - headH - 12);
        ctx.bezierCurveTo(bx + headW * .62, by - headH, bx + headW * 1.12, by - 40, bx + headW, by + 35);
        ctx.quadraticCurveTo(bx, by + 48, bx - headW, by + 35);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.beginPath();
        ctx.ellipse(bx - headW * 0.35, by - headH * 0.45, headW * 0.32, headH * 0.38, -0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.beginPath();
        ctx.ellipse(bx - headW * 0.38, by - headH * 0.52, headW * 0.14, headH * 0.16, -0.4, 0, Math.PI * 2);
        ctx.fill();

        const spotColor = isRage ? "rgba(254, 240, 138, 0.75)" : "rgba(165, 243, 252, 0.65)";
        ctx.fillStyle = spotColor;
        const spots = [
            { rx: -22, ry: -65, r: 4.5 }, { rx: 0, ry: -78, r: 5.5 }, { rx: 24, ry: -62, r: 4.8 },
            { rx: -38, ry: -42, r: 5.2 }, { rx: -15, ry: -48, r: 6.2 }, { rx: 18, ry: -45, r: 5.8 },
            { rx: 36, ry: -38, r: 4.4 }, { rx: -4, ry: -32, r: 6.5 }
        ];
        for (let sp = 0; sp < spots.length; sp++) {
            const s = spots[sp];
            const sPulse = Math.sin(time * 0.1 + sp * 0.8) * 1.2;
            ctx.beginPath();
            ctx.arc(bx + s.rx, by + s.ry, Math.max(2, s.r + sPulse), 0, Math.PI * 2);
            ctx.fill();
        }

        if (isRage || window.postGameHorror) {
            ctx.fillStyle = isHit ? "#ffffff" : window.postGameHorror ? "#080104" : "#4c0519";
            ctx.strokeStyle = isHit ? "#ffffff" : window.postGameHorror ? "#ff1744" : "#ff1744";
            ctx.lineWidth = window.postGameHorror ? 3 : 2;
            for (let c = -2; c <= 2; c++) {
                const cx = bx + c * 16;
                const cy = by - headH - 8 + Math.abs(c) * 5;
                const hornH = (window.postGameHorror ? 26 : 18) - Math.abs(c) * 3;
                ctx.beginPath();
                ctx.moveTo(cx - (window.postGameHorror ? 7 : 5), cy + 8);
                ctx.lineTo(cx, cy - hornH);
                ctx.lineTo(cx + (window.postGameHorror ? 7 : 5), cy + 8);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        }

        const eyeSpacing = 34;
        const eyeY = by - 8;
        const isFiring = boss.state === "attack" && boss.salvoTimer < 16;
        const pDir = game.player ? (game.player.x > boss.x ? 3.5 : -3.5) : 0;
        const pYDir = game.player ? (game.player.y > boss.y ? 2 : -2) : 0;

        for (let side = -1; side <= 1; side += 2) {
            const ex = bx + side * eyeSpacing;

            if (window.postGameHorror) {
                ctx.fillStyle = "#050005";
                ctx.beginPath();
                ctx.ellipse(ex, eyeY, 19, 15, side * 0.12, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#990000";
                ctx.lineWidth = 2;
                ctx.stroke();

                const eyeGrad = ctx.createRadialGradient(ex, eyeY, 2, ex, eyeY, 14);
                eyeGrad.addColorStop(0, "#fef08a");
                eyeGrad.addColorStop(0.35, "#ff0033");
                eyeGrad.addColorStop(1, "#3b020c");
                ctx.fillStyle = eyeGrad;
                ctx.beginPath();
                ctx.ellipse(ex, eyeY, 15, 12, side * 0.1, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "#000000";
                ctx.beginPath();
                ctx.ellipse(ex + pDir * 0.8, eyeY + pYDir * 0.8, 2.8, 10, side * -0.15, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "#ffffff";
                ctx.fillRect(ex + side * 3, eyeY - 4, 2, 3);

                for (let o = 1; o <= 2; o++) {
                    const subX = ex + (o === 1 ? -side * 12 : side * 14);
                    const subY = eyeY + 14 + o * 4;
                    ctx.fillStyle = "#020002";
                    ctx.beginPath();
                    ctx.arc(subX, subY, 6, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#ff1744";
                    ctx.beginPath();
                    ctx.arc(subX, subY, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#000000";
                    ctx.fillRect(subX - 1 + pDir * 0.3, subY - 3 + pYDir * 0.3, 2, 6);
                }

                ctx.strokeStyle = "#ff0033";
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(ex - side * 18, eyeY - 18);
                ctx.lineTo(ex + side * 14, eyeY - 9);
                ctx.stroke();

            } else {
                ctx.fillStyle = isRage ? "#2d0611" : "#042f2e";
                ctx.beginPath();
                ctx.ellipse(ex, eyeY, 18, 14, side * .12, 0, Math.PI * 2);
                ctx.fill();

                const eyeGrad = ctx.createRadialGradient(ex, eyeY, 2, ex, eyeY, 13);
                if (isVuln) {
                    eyeGrad.addColorStop(0, "#fef08a");
                    eyeGrad.addColorStop(0.6, "#facc15");
                    eyeGrad.addColorStop(1, "#ca8a04");
                } else if (isRage) {
                    eyeGrad.addColorStop(0, "#fef08a");
                    eyeGrad.addColorStop(0.3, "#f97316");
                    eyeGrad.addColorStop(0.75, "#dc2626");
                    eyeGrad.addColorStop(1, "#7f1d1d");
                } else {
                    eyeGrad.addColorStop(0, "#fef3c7");
                    eyeGrad.addColorStop(0.35, "#f59e0b");
                    eyeGrad.addColorStop(0.8, "#d97706");
                    eyeGrad.addColorStop(1, "#78350f");
                }
                ctx.fillStyle = eyeGrad;
                ctx.beginPath();
                ctx.ellipse(ex, eyeY, 14, 11, side * .1, 0, Math.PI * 2);
                ctx.fill();

                if (isVuln) {
                    ctx.strokeStyle = "#451a03";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    for (let a = 0; a < Math.PI * 4; a += 0.2) {
                        const spR = a * 1.5;
                        const spX = ex + Math.cos(a + time * 0.3) * spR;
                        const spY = eyeY + Math.sin(a + time * 0.3) * spR;
                        if (a === 0) ctx.moveTo(spX, spY); else ctx.lineTo(spX, spY);
                    }
                    ctx.stroke();
                } else {
                    ctx.fillStyle = "#020617";
                    ctx.beginPath();
                    if (isFiring) {
                        ctx.ellipse(ex + pDir * 0.7, eyeY + pYDir * 0.7, 7, 7, 0, 0, Math.PI * 2);
                    } else if (isRage) {
                        ctx.ellipse(ex + pDir * 0.8, eyeY + pYDir * 0.8, 3, 9, side * -0.15, 0, Math.PI * 2);
                    } else {
                        ctx.ellipse(ex + pDir * 0.7, eyeY + pYDir * 0.7, 7.5, 3.2, pYDir * 0.1, 0, Math.PI * 2);
                    }
                    ctx.fill();

                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(ex + side * 3 - 1, eyeY - 3, 2.2, 0, Math.PI * 2);
                    ctx.arc(ex + side * 3 + 2, eyeY + 1, 1.2, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.strokeStyle = isRage ? "#ff1744" : isVuln ? "#ca8a04" : "#083344";
                ctx.lineWidth = isRage ? 4.5 : 3.8;
                ctx.lineCap = "round";
                ctx.beginPath();
                if (isVuln) {
                    ctx.moveTo(ex - side * 14, eyeY - 10);
                    ctx.quadraticCurveTo(ex, eyeY - 18, ex + side * 12, eyeY - 11);
                } else if (isFiring || isRage) {
                    ctx.moveTo(ex - side * 16, eyeY - 17);
                    ctx.lineTo(ex + side * 13, eyeY - 8);
                } else {
                    ctx.moveTo(ex - side * 15, eyeY - 14);
                    ctx.quadraticCurveTo(ex - side * 2, eyeY - 16, ex + side * 12, eyeY - 9);
                }
                ctx.stroke();
            }
        }

        const mouthY = by + (isRage || window.postGameHorror ? 28 : 24);
        const mouthW = window.postGameHorror ? 52 : isRage ? 44 : 24;
        const mouthH = window.postGameHorror ? 34 : isRage ? (isFiring ? 28 : 18) : (isFiring ? 18 : 10);

        ctx.fillStyle = window.postGameHorror ? "#0a0104" : isRage ? "#3b0714" : "#0e7490";
        ctx.beginPath();
        ctx.ellipse(bx, mouthY, mouthW + 5, mouthH + 4, 0, 0, Math.PI * 2);
        ctx.fill();
        if (window.postGameHorror) {
            ctx.strokeStyle = "#ff0033";
            ctx.lineWidth = 2.5;
            ctx.stroke();
        }

        if (window.postGameHorror) {
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.ellipse(bx, mouthY, mouthW - 4, mouthH - 4, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#ff1744";
            ctx.beginPath();
            ctx.arc(bx, mouthY, 7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#fef08a";
            for (let fang = 0; fang < 14; fang++) {
                const fAng = fang * (Math.PI * 2 / 14);
                const fx = bx + Math.cos(fAng) * (mouthW - 10);
                const fy = mouthY + Math.sin(fAng) * (mouthH - 8);
                ctx.beginPath();
                ctx.moveTo(fx, fy);
                ctx.lineTo(bx + Math.cos(fAng) * (mouthW - 18), mouthY + Math.sin(fAng) * (mouthH - 16));
                ctx.lineTo(fx + 2, fy);
                ctx.fill();
            }
        }

        ctx.fillStyle = "#020617";
        ctx.beginPath();
        ctx.ellipse(bx, mouthY, mouthW, mouthH, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isRage ? "#ff1744" : "#22d3ee";
        ctx.lineWidth = isRage ? 2.5 : 1.5;
        ctx.stroke();

        if (isRage) {
            const upperFangs = 6;
            for (let f = 0; f < upperFangs; f++) {
                const fx = bx - mouthW * .75 + (f / (upperFangs - 1)) * (mouthW * 1.5);
                const fangH = 10 + (f % 2 === 1 ? 5 : 0);
                ctx.fillStyle = isHit ? "#ffffff" : "#f8fafc";
                ctx.beginPath();
                ctx.moveTo(fx - 4, mouthY - mouthH * .65);
                ctx.lineTo(fx + 4, mouthY - mouthH * .65);
                ctx.lineTo(fx, mouthY - mouthH * .65 + fangH);
                ctx.closePath();
                ctx.fill();
            }
            const lowerFangs = 5;
            for (let f = 0; f < lowerFangs; f++) {
                const fx = bx - mouthW * .6 + (f / (lowerFangs - 1)) * (mouthW * 1.2);
                const fangH = 9 + (f % 2 === 0 ? 4 : 0);
                ctx.fillStyle = isHit ? "#ffffff" : "#f8fafc";
                ctx.beginPath();
                ctx.moveTo(fx - 3.5, mouthY + mouthH * .65);
                ctx.lineTo(fx + 3.5, mouthY + mouthH * .65);
                ctx.lineTo(fx, mouthY + mouthH * .65 - fangH);
                ctx.closePath();
                ctx.fill();
            }
        } else {
            const beakGrad = ctx.createLinearGradient(bx, mouthY - mouthH, bx, mouthY + mouthH);
            beakGrad.addColorStop(0, "#1e293b");
            beakGrad.addColorStop(0.5, "#475569");
            beakGrad.addColorStop(0.85, "#cbd5e1");
            beakGrad.addColorStop(1, "#f8fafc");
            ctx.fillStyle = beakGrad;

            ctx.beginPath();
            ctx.moveTo(bx - 10, mouthY - 5);
            ctx.quadraticCurveTo(bx - 3, mouthY + (isFiring ? 10 : 6), bx, mouthY + (isFiring ? 12 : 8));
            ctx.quadraticCurveTo(bx + 3, mouthY + (isFiring ? 10 : 6), bx + 10, mouthY - 5);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.moveTo(bx - 7, mouthY + (isFiring ? 14 : 9));
            ctx.lineTo(bx, mouthY + (isFiring ? 8 : 4));
            ctx.lineTo(bx + 7, mouthY + (isFiring ? 14 : 9));
            ctx.closePath();
            ctx.fill();
        }

        if (isFiring) {
            ctx.fillStyle = isRage ? "#fde047" : "#00ffff";
            ctx.shadowColor = isRage ? "#ef4444" : "#00ffff";
            ctx.shadowBlur = 16;
            ctx.beginPath();
            ctx.arc(bx, mouthY, isRage ? 14 : 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
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
                if (btn.sinkOffset < 16) {
                    btn.sinkOffset += (16 - btn.sinkOffset) * .45;
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
            baseGrad.addColorStop(0, "#475569");
            baseGrad.addColorStop(.5, "#1e293b");
            baseGrad.addColorStop(1, "#0b0f19");
            ctx.fillStyle = baseGrad;
            ctx.beginPath();
            ctx.roundRect(bsx, bsy + 4, btn.w, baseH, 6);
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
                ctx.arc(sx, sy, 2, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.fillStyle = "#06090e";
            ctx.beginPath();
            ctx.roundRect(bsx + 6, bsy + 2, btn.w - 12, 10, 4);
            ctx.fill();
            const ledColor = isPressed ? "#22c55e" : "#ff1744";
            ctx.fillStyle = ledColor;
            ctx.shadowColor = ledColor;
            ctx.shadowBlur = isPressed ? 14 : 10 + glow * 4;
            ctx.beginPath();
            ctx.roundRect(bsx + 8, bsy + 1, btn.w - 16, 3, 1.5);
            ctx.fill();
            ctx.shadowBlur = 0;
            const plungerH = 22;
            const plungerY = bsy - 15 + sink;
            const btnGrad = ctx.createLinearGradient(bsx + 8, plungerY, bsx + 8, plungerY + plungerH);
            if (isPressed) {
                btnGrad.addColorStop(0, "#4ade80");
                btnGrad.addColorStop(.4, "#22c55e");
                btnGrad.addColorStop(.8, "#16a34a");
                btnGrad.addColorStop(1, "#14532d");
            } else {
                btnGrad.addColorStop(0, "#ff4d6d");
                btnGrad.addColorStop(.35, "#ef4444");
                btnGrad.addColorStop(.75, "#dc2626");
                btnGrad.addColorStop(1, "#7f1d1d");
            }
            if (!isPressed) {
                ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
                ctx.beginPath();
                ctx.ellipse(bsx + btn.w / 2, bsy + 3, (btn.w - 16) / 2, 4, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = btnGrad;
            ctx.shadowColor = isPressed ? "#22c55e" : "#ef4444";
            ctx.shadowBlur = isPressed ? 8 : 12 + glow * 4;
            ctx.beginPath();
            ctx.roundRect(bsx + 7, plungerY, btn.w - 14, plungerH, [ 10, 10, 4, 4 ]);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
            ctx.beginPath();
            ctx.ellipse(bsx + btn.w / 2, plungerY + 4, (btn.w - 24) / 2, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            if (!isPressed) {
                ctx.fillStyle = "#ffffff";
                ctx.shadowColor = "#fde047";
                ctx.shadowBlur = 8;
                ctx.font = '900 20px "Fredoka One", Arial, sans-serif';
                ctx.fillText("?", bsx + btn.w / 2, plungerY + plungerH / 2 + 1);
                ctx.shadowBlur = 0;
                const bounceY = plungerY - 14 - Math.abs(Math.sin(time * .18)) * 7;
                ctx.fillStyle = "#fde047";
                ctx.shadowColor = "#e11d48";
                ctx.shadowBlur = 8;
                ctx.font = '900 13px "Fredoka One", Arial, sans-serif';
                ctx.fillText(typeof __ === "function" ? __("ui_step_btn") : "▼ PISA ▼", bsx + btn.w / 2, bounceY);
            } else {
                ctx.fillStyle = "#ffffff";
                ctx.shadowColor = "#4ade80";
                ctx.shadowBlur = 8;
                ctx.font = 'bold 18px "Fredoka One", Arial, sans-serif';
                ctx.fillText("✓", bsx + btn.w / 2, plungerY + plungerH / 2);
            }
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
