(function() {
    var boat = {
        active: false,
        started: false,
        arrived: false,
        x: 12550,
        y: 470,
        w: 260,
        h: 60,
        deckY: 470,
        speed: 2.486,
        targetX: 21245,
        startX: 12550,
        timer: 0,
        bobOffset: 0,
        bannerAlpha: 1,
        bannerYOffset: 0,
        flags: [ {
            xRel: 40,
            yRel: -70,
            color: "#e74c3c",
            poleH: 70
        }, {
            xRel: 130,
            yRel: -105,
            color: "#f1c40f",
            poleH: 105
        }, {
            xRel: 210,
            yRel: -65,
            color: "#3498db",
            poleH: 65
        } ],
        enemySpawns: [],
        spawnIndex: 0
    };
    function generateSpawns() {
        var spawns = [];
        for (var d = 350; d < 8500; d += 480) {
            var spawnX = boat.startX + d;
            if (d % 960 === 350) {
                spawns.push({
                    type: "electric_squid",
                    triggerX: spawnX - 450,
                    spawnX: spawnX + 320,
                    spawnY: 260 + Math.random() * 80
                });
            } else {
                spawns.push({
                    type: "flying_fish",
                    triggerX: spawnX - 350,
                    spawnX: spawnX + 220,
                    spawnY: 485
                });
            }
        }
        return spawns;
    }
    window.initBoatLevel4 = function() {
        boat.active = true;
        boat.started = false;
        boat.arrived = false;
        boat.x = boat.startX;
        boat.y = 470;
        boat.deckY = 470;
        boat.timer = 0;
        boat.bobOffset = 0;
        boat.bannerAlpha = 1;
        boat.bannerYOffset = 0;
        boat.enemySpawns = generateSpawns();
        boat.spawnIndex = 0;
        boat.introCinematic = null;
        boat.introDone = false;
        boat.outroCinematic = null;
        boat.outroDone = false;
        boat.sinkY = 0;
        boat.sinkPitch = 0;
        boat.voyageQuote1 = false;
        boat.voyageQuote2 = false;
        boat.voyageQuote3 = false;
        boat.voyageQuote4 = false;
        boat.captain = {
            scared: false,
            speechBubble: null
        };
    };
    window.getBoatTravelState = function() {
        return {
            x: boat.x,
            started: boat.started,
            arrived: boat.arrived,
            spawnIndex: boat.spawnIndex,
            introDone: boat.introDone,
            outroDone: boat.outroDone
        };
    };
    window.restoreBoatTravelState = function(st) {
        if (!st) return;
        boat.active = !st.outroDone;
        boat.x = st.x;
        boat.started = st.started;
        boat.arrived = st.arrived;
        boat.spawnIndex = st.spawnIndex;
        boat.introDone = !!st.introDone;
        boat.outroDone = !!st.outroDone;
    };
    window.isBoatActive = function() {
        return boat.active && !boat.outroDone && (typeof currentLevel !== "undefined" && currentLevel === 3);
    };
    window.isBoatTraveling = function() {
        return boat.active && boat.started && !boat.arrived && (typeof currentLevel !== "undefined" && currentLevel === 3);
    };
    window.getBoatSafeRespawn = function() {
        return {
            x: boat.x + boat.w * .45,
            y: boat.deckY - 45
        };
    };
    window.updateAndDrawBoat = function(ctx, cameraX) {
        if (!window.isBoatActive()) return;
        var camX = cameraX != null ? cameraX : 0;
        var p = typeof game !== "undefined" && game.player ? game.player : null;
        boat.timer++;
        boat.bobOffset = Math.sin(boat.timer * .05) * 4;
        boat.deckY = boat.y + boat.bobOffset;

        var onBoat = false;
        if (p && !p.dead) {
            var feetX = p.x + p.w * .5;
            var feetY = p.y + p.h;
            if (p.vy >= 0 && feetX >= boat.x + 8 && feetX <= boat.x + boat.w - 8 && feetY >= boat.deckY - 16 && feetY <= boat.deckY + 18) {
                onBoat = true;
                p.y = boat.deckY - p.h;
                p.vy = 0;
                p.onGround = true;
            }
        }

        if (!boat.started && onBoat && !boat.introDone) {
            const isHorror = typeof window !== "undefined" && window.postGameHorror;
            if (isHorror) {
                boat.introDone = true;
                boat.started = true;
                boat.introCinematic = null;
                if (boat.captain) boat.captain.speechBubble = null;
                if (p) {
                    p.frozen = false;
                }
                try {
                    playSound(60, 0.6, "sawtooth", 0.6, 25);
                    playSound(180, 0.4, "triangle", 0.4, 60);
                } catch(e) {}
                if (typeof showFloatingText === "function") {
                    showFloatingText(boat.x + boat.w * 0.5, boat.deckY - 50, typeof __ === "function" ? __("flt_barco_fantasma") : "☠️ ¡BARCO FANTASMA ZARPANDO!", "#ef4444");
                }
            } else if (!boat.introCinematic) {
                boat.introCinematic = { timer: 0 };
                if (typeof game !== "undefined" && Array.isArray(game.enemies)) {
                    for (let i = game.enemies.length - 1; i >= 0; i--) {
                        const en = game.enemies[i];
                        if (en && Math.abs(en.x - (boat.x + boat.w * 0.5)) < 800) {
                            if (typeof createExplosion === "function") {
                                createExplosion(en.x, en.y, "#ff3366", 24, 18);
                                createExplosion(en.x, en.y, "#ffd700", 18, 12);
                            }
                            try { playSound(320, 0.25, "sawtooth", 0.2, 110); } catch(e){}
                            game.enemies.splice(i, 1);
                        }
                    }
                }
                if (p) {
                    p.frozen = true;
                    p.vx = 0;
                    p.facing = -1;
                }
            }
        }

        if (boat.introCinematic) {
            boat.introCinematic.timer++;
            const it = boat.introCinematic.timer;
            if (p) {
                p.frozen = true;
                p.vx = 0;
                p.facing = -1;
            }
            if (it === 1) {
                boat.captain.speechBubble = {
                    text: typeof __ === "function" ? __("cpt_intro_1") : "¡Arrrr grumete!\n¿Qué te trae por aquí?",
                    timer: 0,
                    maxTimer: 135
                };
                try { playSound(180, 0.09, "triangle", 0.08, 130); } catch(e){}
            } else if (it === 140) {
                boat.captain.speechBubble = {
                    text: typeof __ === "function" ? __("cpt_intro_2") : "¿Cómo? ¿Que quieres\nllegar al otro lado?",
                    timer: 0,
                    maxTimer: 135
                };
                try { playSound(200, 0.09, "triangle", 0.08, 140); } catch(e){}
            } else if (it === 280) {
                boat.captain.speechBubble = {
                    text: typeof __ === "function" ? __("cpt_intro_3") : "¡Pues a zarparrr!",
                    timer: 0,
                    maxTimer: 120
                };
                try { playSound(380, 0.25, "triangle", 0.3, 760); } catch(e){}
            } else if (it >= 410) {
                boat.introCinematic = null;
                boat.introDone = true;
                boat.started = true;
                boat.captain.speechBubble = null;
                if (p) p.frozen = false;
                if (typeof showFloatingText === "function") {
                    showFloatingText(boat.x + boat.w * 0.5, boat.deckY - 60, typeof __ === "function" ? __("flt_barco_zarpar") : "¡A ZARPAR!", "#f1c40f");
                }
            }
        }

        var deltaX = 0;
        if (boat.started && !boat.arrived) {
            deltaX = boat.speed;
            boat.x += deltaX;
            if (p && p.x + p.w * .5 >= boat.x && p.x + p.w * .5 <= boat.x + boat.w && p.y + p.h <= boat.deckY + 20) {
                p.x += deltaX;
            }
            if (boat.bannerAlpha > 0) {
                boat.bannerAlpha = Math.max(0, boat.bannerAlpha - .02);
                boat.bannerYOffset -= .5;
            }

            if (boat.x >= 14400 && !boat.voyageQuote1) {
                boat.voyageQuote1 = true;
                boat.captain.speechBubble = {
                    text: typeof __ === "function" ? __("cpt_voyage_1") : "¡Aggg esas molestas\ncriaturas!",
                    timer: 0,
                    maxTimer: 160
                };
                try { playSound(180, 0.08, "triangle", 0.08, 120); } catch(e){}
            } else if (boat.x >= 16400 && !boat.voyageQuote2) {
                boat.voyageQuote2 = true;
                boat.captain.speechBubble = {
                    text: typeof __ === "function" ? __("cpt_voyage_2") : "Mmmm... ¿eso sigue así?",
                    timer: 0,
                    maxTimer: 160
                };
                try { playSound(180, 0.08, "triangle", 0.08, 120); } catch(e){}
            } else if (boat.x >= 18400 && !boat.voyageQuote3) {
                boat.voyageQuote3 = true;
                boat.captain.speechBubble = {
                    text: typeof __ === "function" ? __("cpt_voyage_3") : "¡Arrrr! ¡Hoy comeremos\ncalamar asado!",
                    timer: 0,
                    maxTimer: 160
                };
                try { playSound(180, 0.08, "triangle", 0.08, 120); } catch(e){}
            } else if (boat.x >= 20200 && !boat.voyageQuote4) {
                boat.voyageQuote4 = true;
                boat.captain.speechBubble = {
                    text: typeof __ === "function" ? __("cpt_voyage_4") : "Mmmm... espero que no\nhayan más grandes...",
                    timer: 0,
                    maxTimer: 160
                };
                try { playSound(180, 0.08, "triangle", 0.08, 120); } catch(e){}
            }

            if (p && boat.active && !boat.outroDone && p.x > 21640) {
                p.x = 21640;
                if (p.vx > 0) p.vx = 0;
            }

            const reachedNearDock = boat.x >= boat.targetX - 5;
            const playerJumpedAhead = p && p.x >= 21460;

            if ((reachedNearDock || playerJumpedAhead) && !boat.arrived) {
                boat.arrived = true;
                deltaX = 0;

                if (typeof game !== "undefined" && Array.isArray(game.enemies)) {
                    for (let i = game.enemies.length - 1; i >= 0; i--) {
                        const en = game.enemies[i];
                        if (en && en.x > 18000 && en.x < 22100) {
                            if (typeof createExplosion === "function") {
                                createExplosion(en.x, en.y, "#ff3366", 20, 15);
                            }
                            game.enemies.splice(i, 1);
                        }
                    }
                }
                if (typeof enemyProjectiles !== "undefined" && Array.isArray(enemyProjectiles)) {
                    enemyProjectiles.length = 0;
                }

                if (playerJumpedAhead) {
                    boat.outroCinematic = { stage: 0, timer: 0, jumpedEarly: true, saidArrival: false };
                    if (p) {
                        p.x = 21640;
                        p.y = 480 - p.h;
                        p.vy = 0;
                        p.vx = 0;
                        p.onGround = true;
                        p.state = "idle";
                        p.frozen = true;
                        p.facing = -1;
                        p.invulnerable = 999;
                    }
                } else {
                    boat.outroCinematic = { stage: 0, timer: 0, jumpedEarly: false, saidArrival: false };
                }
            }

            if (typeof game !== "undefined" && game.enemies && !boat.arrived) {
                while (boat.spawnIndex < boat.enemySpawns.length) {
                    var sp = boat.enemySpawns[boat.spawnIndex];
                    if (boat.x >= sp.triggerX) {
                        boat.spawnIndex++;
                        if (sp.type === "flying_fish") {
                            game.enemies.push(new Enemy({
                                x: sp.spawnX,
                                y: sp.spawnY,
                                type: "flying_fish",
                                color: "#ff6b81",
                                health: 1,
                                speed: 0,
                                range: 0,
                                isBoatFish: true
                            }));
                        } else if (sp.type === "electric_squid") {
                            game.enemies.push(new Enemy({
                                x: sp.spawnX,
                                y: sp.spawnY,
                                type: "electric_squid",
                                color: "#00f0ff",
                                health: 2,
                                speed: 1.4,
                                range: 120,
                                bulletType: "electric",
                                isElectricSquid: true
                            }));
                        }
                    } else {
                        break;
                    }
                }
            }
        }

        if (boat.arrived && !boat.outroDone) {
            if (!boat.outroCinematic) {
                boat.outroCinematic = { stage: 0, timer: 0, jumpedEarly: false, saidArrival: false };
            }
            const out = boat.outroCinematic;
            out.timer++;

            if (typeof game !== "undefined") {
                const dockCamX = 21500 - (typeof VIEW_W !== "undefined" ? VIEW_W : 800) * 0.40;
                game.cameraOverrideX = Math.max(0, dockCamX);
            }

            if (boat.x < boat.targetX) {
                const glideStep = out.jumpedEarly ? Math.max(3.5, (boat.targetX - boat.x) * 0.12) : Math.max(0.8, (boat.targetX - boat.x) * 0.08);
                boat.x = Math.min(boat.targetX, boat.x + glideStep);
                if (!out.jumpedEarly && p && p.x + p.w * 0.5 <= boat.x + boat.w) {
                    p.x += glideStep;
                }
            }

            if (p && p.x > 21640) {
                p.x = 21640;
                if (p.vx > 0) p.vx = 0;
            }

            if (out.stage === 0) {
                if (p) {
                    p.frozen = true;
                    p.vx = 0;
                    p.facing = -1;
                    p.invulnerable = 999;
                    if (out.jumpedEarly) {
                        p.x = 21640;
                        p.y = 480 - p.h;
                        p.vy = 0;
                        p.onGround = true;
                        p.state = "idle";
                    }
                }

                if (boat.x >= boat.targetX && !out.saidArrival) {
                    out.saidArrival = true;
                    out.speechTimer = 0;
                    boat.captain.speechBubble = {
                        text: typeof __ === "function" ? __("cpt_outro_1") : "¡Arrrr grumete,\nhasta aquí llegamos!",
                        timer: 0,
                        maxTimer: 125
                    };
                    try { playSound(190, 0.09, "triangle", 0.09, 140); } catch(e){}
                }

                if (out.saidArrival) {
                    out.speechTimer = (out.speechTimer || 0) + 1;
                    if (out.speechTimer >= 130) {
                        if (out.jumpedEarly) {
                            out.stage = 2;
                        } else {
                            out.stage = 1;
                        }
                        out.timer = 0;
                    }
                }
            } else if (out.stage === 1) {
                const hopDuration = 32;
                const startX = boat.x + boat.w - 35;
                const dockEdgeX = 21525;
                if (p) {
                    p.invulnerable = 999;
                    p.frozen = true;
                    if (out.timer <= hopDuration) {
                        p.facing = 1;
                        const hopT = Math.min(1, out.timer / hopDuration);
                        p.x = startX + (dockEdgeX - startX) * hopT;
                        const arc = Math.sin(hopT * Math.PI) * 24;
                        p.y = 480 - p.h - arc;
                    } else {
                        p.x = dockEdgeX;
                        p.y = 480 - p.h;
                        p.vy = 0;
                        p.vx = 0;
                        p.onGround = true;
                        p.state = "idle";
                        p.facing = 1;
                    }
                }
                if (out.timer === hopDuration) {
                    try { playSound(140, 0.15, "triangle", 0.2, 50); } catch(e){}
                    if (p) {
                        p.scaleX = 1.18;
                        p.scaleY = 0.82;
                    }
                    if (typeof particles !== "undefined") {
                        for (let d = 0; d < 8; d++) {
                            particles.push({
                                x: dockEdgeX + (p ? p.w * 0.5 : 16),
                                y: 480,
                                vx: (Math.random() - 0.5) * 4,
                                vy: -Math.random() * 2,
                                color: "#94a3b8",
                                size: 2.5,
                                life: 14,
                                type: "smoke"
                            });
                        }
                    }
                }
                if (out.timer >= hopDuration + 12) {
                    if (p) {
                        p.x = dockEdgeX;
                        p.y = 480 - p.h;
                        p.vy = 0;
                        p.vx = 0;
                        p.onGround = true;
                        p.state = "idle";
                        p.scaleX = 1;
                        p.scaleY = 1;
                    }
                    out.stage = 1.5;
                    out.timer = 0;
                }
            } else if (out.stage === 1.5) {
                const targetWalkX = 21635;
                if (p) {
                    p.invulnerable = 999;
                    p.frozen = true;
                    p.facing = 1;
                    p.y = 480 - p.h;
                    p.vy = 0;
                    p.onGround = true;
                    p.state = "run";
                    p.x += 1.8;
                    p.scaleY = 1 + Math.sin(out.timer * 0.45) * 0.06;
                    p.scaleX = 1 - Math.sin(out.timer * 0.45) * 0.04;

                    if (out.timer % 10 === 0 && typeof particles !== "undefined") {
                        particles.push({
                            x: p.x + 8,
                            y: 480,
                            vx: -1,
                            vy: -0.8,
                            color: "#cbd5e1",
                            size: 2,
                            life: 10,
                            type: "smoke"
                        });
                    }

                    if (p.x >= targetWalkX) {
                        p.x = targetWalkX;
                        p.scaleX = 1;
                        p.scaleY = 1;
                        p.state = "idle";
                        out.stage = 2;
                        out.timer = 0;
                    }
                } else {
                    out.stage = 2;
                    out.timer = 0;
                }
            } else if (out.stage === 2) {
                if (typeof applyShake === "function") applyShake(9);
                if (out.timer % 32 === 0) {
                    try { playSound(65, 0.35, "sawtooth", 0.3, 35); } catch(e){}
                }
                if (p) {
                    p.scared = true;
                    p.state = "idle";
                    p.onGround = true;
                    p.y = 480 - p.h;
                    p.vy = 0;
                    p.vx = 0;
                    p.facing = -1;
                    p.invulnerable = 999;
                    p.scaleX = 1 + (Math.random() - 0.5) * 0.08;
                    p.scaleY = 1 + (Math.random() - 0.5) * 0.08;
                }
                boat.captain.scared = true;
                if (out.timer === 18) {
                    boat.captain.speechBubble = {
                        text: typeof __ === "function" ? __("cpt_outro_2") : "Mmmm... ¿qué fue eso?",
                        timer: 0,
                        maxTimer: 115
                    };
                    try { playSound(180, 0.08, "triangle", 0.08, 120); } catch(e){}
                }
                if (out.timer >= 135) {
                    out.stage = 3;
                    out.timer = 0;
                }
            } else if (out.stage === 3) {
                if (out.timer === 1) {
                    if (typeof applyShake === "function") applyShake(16);
                    try { playSound(120, 0.6, "sawtooth", 0.6, 45); } catch(e){}
                    if (typeof createExplosion === "function") {
                        createExplosion(boat.x + 10, 520, "#38bdf8", 25, 18);
                        createExplosion(boat.x + 130, 520, "#06b6d4", 30, 22);
                        createExplosion(boat.x + 260, 520, "#38bdf8", 25, 18);
                    }
                }
                if (p) {
                    p.scared = true;
                    p.state = "idle";
                    p.onGround = true;
                    p.y = 480 - p.h;
                    p.vy = 0;
                    p.vx = 0;
                    p.facing = -1;
                    p.invulnerable = 999;
                    p.scaleX = 1 + (Math.random() - 0.5) * 0.08;
                    p.scaleY = 1 + (Math.random() - 0.5) * 0.08;
                }
                boat.captain.scared = true;
                if (out.timer === 25) {
                    boat.captain.speechBubble = {
                        text: typeof __ === "function" ? __("cpt_outro_3") : "¡¡Ayyyyyyyyyyy!!",
                        timer: 0,
                        maxTimer: 130,
                        isScream: true
                    };
                    try { playSound(580, 0.35, "sine", 0.3, 240); } catch(e){}
                }
                if (out.timer >= 160) {
                    out.stage = 4;
                    out.timer = 0;
                }
            } else if (out.stage === 4) {
                boat.sinkY = (boat.sinkY || 0) + 1.6;
                boat.sinkPitch = (boat.sinkPitch || 0) + 0.005;
                if (typeof applyShake === "function") applyShake(5);
                if (p) {
                    p.scared = true;
                    p.state = "idle";
                    p.onGround = true;
                    p.y = 480 - p.h;
                    p.vy = 0;
                    p.vx = 0;
                    p.facing = -1;
                    p.invulnerable = 999;
                    p.scaleX = 1 + (Math.random() - 0.5) * 0.08;
                    p.scaleY = 1 + (Math.random() - 0.5) * 0.08;
                }
                boat.captain.scared = true;
                if (out.timer % 4 === 0 && typeof particles !== "undefined") {
                    particles.push({
                        x: boat.x + Math.random() * boat.w,
                        y: 520 + Math.random() * 10,
                        vx: (Math.random() - 0.5) * 4,
                        vy: -Math.random() * 3 - 1,
                        color: Math.random() < 0.5 ? "#ffffff" : "#38bdf8",
                        size: 2 + Math.random() * 3,
                        life: 25,
                        type: "spark"
                    });
                }
                if (out.timer % 30 === 0) {
                    try { playSound(95, 0.35, "triangle", 0.35, 45); } catch(e){}
                }
                if (out.timer === 20) {
                    boat.captain.speechBubble = {
                        text: typeof __ === "function" ? __("cpt_outro_4") : "¡Un marinero se hunde\ncon su barcooooooooo!",
                        timer: 0,
                        maxTimer: 180,
                        isScream: true
                    };
                    try { playSound(520, 0.35, "sawtooth", 0.4, 280); } catch(e){}
                }
                if (out.timer >= 220) {
                    out.stage = 5;
                    out.timer = 0;
                    if (typeof createExplosion === "function") {
                        createExplosion(boat.x + boat.w * 0.5, 520, "#38bdf8", 35, 25);
                    }
                    try { playSound(80, 0.4, "triangle", 0.4, 40); } catch(e){}
                }
            } else if (out.stage === 5) {
                if (p) {
                    p.y = 480 - p.h;
                    p.vy = 0;
                    p.vx = 0;
                    p.onGround = true;
                    p.state = "idle";
                    p.scaleX = 1;
                    p.scaleY = 1;
                }
                if (out.timer >= 65) {
                    if (p) {
                        p.scared = false;
                        p.frozen = false;
                        p.invulnerable = 0;
                    }
                    if (typeof game !== "undefined") {
                        delete game.cameraOverrideX;
                    }
                    boat.outroCinematic = null;
                    boat.outroDone = true;
                    boat.active = false;
                }
            }
        }

        if (boat.captain && boat.captain.speechBubble) {
            boat.captain.speechBubble.timer++;
            if (boat.captain.speechBubble.timer >= boat.captain.speechBubble.maxTimer) {
                boat.captain.speechBubble = null;
            }
        }

        drawBoat(ctx, camX);
    };
    function drawBoat(ctx, camX) {
        var bx = boat.x - camX;
        var by = boat.deckY + (boat.sinkY || 0);
        var bw = boat.w;
        var bh = boat.h;
        if (bx + bw < -150 || bx > (typeof VIEW_W !== "undefined" ? VIEW_W : 800) + 150) {
            return;
        }

        const isHorror = typeof window !== "undefined" && window.postGameHorror;
        const t = boat.timer;
        const isMoving = boat.started && !boat.arrived;
        
        const pitch = Math.sin(t * 0.038) * 0.032 + (isMoving ? Math.sin(t * 0.075) * 0.018 : 0) + (boat.sinkPitch || 0);
        const pivotX = bx + bw * 0.5;
        const pivotY = by + bh * 0.45;

        ctx.save();

        if (isMoving) {
            ctx.save();
            const foamGrad = ctx.createLinearGradient(bx, by + bh, bx + bw, by + bh);
            foamGrad.addColorStop(0, "rgba(255,255,255,0.6)");
            foamGrad.addColorStop(0.5, "rgba(200,240,255,0.4)");
            foamGrad.addColorStop(1, "rgba(100,200,255,0.1)");

            ctx.fillStyle = isHorror ? "rgba(180, 20, 20, 0.4)" : "rgba(220, 245, 255, 0.45)";
            for (let f = 0; f < 3; f++) {
                const fx = bx - 15 - f * 22 + Math.sin(t * 0.2 + f) * 5;
                const fy = by + bh * 0.55 + Math.cos(t * 0.15 + f) * 3;
                ctx.beginPath();
                ctx.ellipse(fx, fy, 20 + f * 8, 5 + f * 2, -0.08, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = isHorror ? "rgba(220, 38, 38, 0.55)" : "rgba(255, 255, 255, 0.65)";
            const bowX = bx + bw + 6;
            const bowY = by + bh * 0.48;
            ctx.beginPath();
            ctx.ellipse(bowX, bowY, 18 + Math.sin(t * 0.3) * 6, 7, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        ctx.translate(pivotX, pivotY);
        ctx.rotate(pitch);
        ctx.translate(-pivotX, -pivotY);

        ctx.fillStyle = "rgba(0, 10, 25, 0.35)";
        ctx.beginPath();
        ctx.ellipse(bx + bw * 0.5, by + bh + 4, bw * 0.48, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(bx + 14, by);
        ctx.lineTo(bx + bw - 18, by);
        ctx.bezierCurveTo(bx + bw + 32, by + bh * 0.25, bx + bw + 15, by + bh * 0.85, bx + bw - 28, by + bh);
        ctx.lineTo(bx + 38, by + bh);
        ctx.bezierCurveTo(bx - 12, by + bh * 0.7, bx - 14, by + bh * 0.25, bx + 14, by);
        ctx.closePath();

        const hullGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
        if (isHorror) {
            hullGrad.addColorStop(0, "#2a1515");
            hullGrad.addColorStop(0.35, "#1a0808");
            hullGrad.addColorStop(0.75, "#0d0202");
            hullGrad.addColorStop(1, "#050000");
        } else {
            hullGrad.addColorStop(0, "#8d5223");
            hullGrad.addColorStop(0.25, "#6b3c14");
            hullGrad.addColorStop(0.65, "#4a2609");
            hullGrad.addColorStop(1, "#2b1404");
        }
        ctx.fillStyle = hullGrad;
        ctx.fill();

        ctx.strokeStyle = isHorror ? "#450a0a" : "#1a0b02";
        ctx.lineWidth = 3.5;
        ctx.stroke();

        ctx.strokeStyle = isHorror ? "rgba(0,0,0,0.6)" : "rgba(20, 8, 2, 0.45)";
        ctx.lineWidth = 1.5;
        for (let p = 1; p <= 4; p++) {
            const py = by + (bh / 5) * p;
            ctx.beginPath();
            ctx.moveTo(bx + 12 + p * 3, py);
            ctx.lineTo(bx + bw - 16 - p * 2, py);
            ctx.stroke();

            ctx.fillStyle = isHorror ? "#44403c" : "#d97706";
            for (let r = 0; r < 6; r++) {
                const rx = bx + 35 + r * 36 + ((p % 2) * 16);
                if (rx < bx + bw - 30) {
                    ctx.beginPath();
                    ctx.arc(rx, py - 1, 1.2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        if (isHorror) {
            ctx.strokeStyle = "#ff0033";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(bx + 40, by + 6); ctx.lineTo(bx + 62, by + 24); ctx.lineTo(bx + 54, by + 34);
            ctx.moveTo(bx + 110, by + 8); ctx.lineTo(bx + 135, by + 28); ctx.lineTo(bx + 150, by + 18);
            ctx.moveTo(bx + bw - 45, by + 4); ctx.lineTo(bx + bw - 65, by + 22); ctx.lineTo(bx + bw - 50, by + 32);
            ctx.stroke();

            ctx.fillStyle = "rgba(220, 20, 60, 0.75)";
            for (let d = 0; d < 5; d++) {
                const dripX = bx + 50 + d * 38;
                const dripLen = 4 + Math.sin(t * 0.1 + d) * 3;
                ctx.fillRect(dripX, by + bh - 2, 2.5, dripLen);
            }
        }

        ctx.fillStyle = isHorror ? "#1c1917" : "#3b220d";
        ctx.beginPath();
        ctx.rect(bx + 35, by + bh - 6, bw - 68, 6);
        ctx.fill();

        const cabinW = 54;
        const cabinH = 26;
        const cabinX = bx + 8;
        const cabinY = by - cabinH;

        ctx.fillStyle = isHorror ? "#1a0a0a" : "#5a3110";
        ctx.strokeStyle = isHorror ? "#3f0a0a" : "#2e1504";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cabinX, cabinY, cabinW, cabinH + 6, [6, 2, 0, 0]);
        ctx.fill();
        ctx.stroke();

        const winX = cabinX + 12;
        const winY = cabinY + 7;
        const winGrad = ctx.createRadialGradient(winX + 14, winY + 6, 2, winX + 14, winY + 6, 20);
        if (isHorror) {
            winGrad.addColorStop(0, "rgba(239, 68, 68, 0.9)");
            winGrad.addColorStop(1, "rgba(127, 29, 29, 0.2)");
        } else {
            winGrad.addColorStop(0, "rgba(254, 240, 138, 0.95)");
            winGrad.addColorStop(0.6, "rgba(245, 158, 11, 0.7)");
            winGrad.addColorStop(1, "rgba(180, 83, 9, 0.2)");
        }
        ctx.fillStyle = winGrad;
        ctx.fillRect(winX, winY, 28, 13);
        ctx.strokeStyle = isHorror ? "#000000" : "#451a03";
        ctx.lineWidth = 1;
        ctx.strokeRect(winX, winY, 28, 13);
        ctx.beginPath();
        ctx.moveTo(winX + 14, winY);
        ctx.lineTo(winX + 14, winY + 13);
        ctx.moveTo(winX, winY + 6.5);
        ctx.lineTo(winX + 28, winY + 6.5);
        ctx.stroke();

        ctx.fillStyle = isHorror ? "#291515" : "#925227";
        ctx.fillRect(bx + 4, by - 6, bw - 8, 8);
        ctx.strokeStyle = isHorror ? "#3d0b0b" : "#3e1c05";
        ctx.lineWidth = 2;
        ctx.strokeRect(bx + 4, by - 6, bw - 8, 8);

        const railTopY = by - 16;
        ctx.strokeStyle = isHorror ? "#52525b" : "#b45309";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(bx + 66, railTopY);
        ctx.lineTo(bx + bw - 26, railTopY);
        ctx.stroke();

        for (let postX = bx + 70; postX <= bx + bw - 30; postX += 24) {
            ctx.fillStyle = isHorror ? "#3f3f46" : "#d97706";
            ctx.fillRect(postX - 1.5, railTopY, 3, 10);
            ctx.fillStyle = isHorror ? "#71717a" : "#fef08a";
            ctx.beginPath();
            ctx.arc(postX, railTopY - 1, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = isHorror ? "#1e1b18" : "#854d0e";
        ctx.fillRect(bx + 74, by - 22, 16, 16);
        ctx.strokeStyle = isHorror ? "#0a0a0a" : "#451a03";
        ctx.lineWidth = 1.2;
        ctx.strokeRect(bx + 74, by - 22, 16, 16);
        ctx.beginPath();
        ctx.moveTo(bx + 74, by - 22);
        ctx.lineTo(bx + 90, by - 6);
        ctx.stroke();

        const barrelX = bx + 96;
        const bGrad = ctx.createLinearGradient(barrelX, by - 20, barrelX + 14, by - 20);
        bGrad.addColorStop(0, isHorror ? "#1f1f23" : "#713f12");
        bGrad.addColorStop(0.5, isHorror ? "#3f3f46" : "#a16207");
        bGrad.addColorStop(1, isHorror ? "#18181b" : "#582f0e");
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.roundRect(barrelX, by - 20, 14, 15, 3);
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.stroke();

        const helmX = cabinX + cabinW - 10;
        const helmY = cabinY - 8;
        ctx.strokeStyle = isHorror ? "#57534e" : "#b45309";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(helmX, helmY, 7, 0, Math.PI * 2);
        ctx.stroke();
        for (let sp = 0; sp < 4; sp++) {
            const ang = (sp * Math.PI) / 4 + t * 0.02;
            ctx.beginPath();
            ctx.moveTo(helmX - Math.cos(ang) * 9, helmY - Math.sin(ang) * 9);
            ctx.lineTo(helmX + Math.cos(ang) * 9, helmY + Math.sin(ang) * 9);
            ctx.stroke();
        }

        ctx.strokeStyle = isHorror ? "#292524" : "#5a3110";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(bx + bw - 20, by - 5);
        ctx.lineTo(bx + bw + 38, by - 28);
        ctx.stroke();

        const figX = bx + bw + 14;
        const figY = by + 2;
        ctx.fillStyle = isHorror ? "#dc2626" : "#fbbf24";
        ctx.shadowColor = isHorror ? "#ff0000" : "#f59e0b";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        if (isHorror) {
            ctx.arc(figX, figY, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#000";
            ctx.fillRect(figX - 3, figY - 2, 2, 3);
            ctx.fillRect(figX + 1, figY - 2, 2, 3);
        } else {
            ctx.arc(figX, figY, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(figX - 1.5, figY - 1.5, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;

        ctx.strokeStyle = isHorror ? "#52525b" : "#94a3b8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bx + bw - 15, by + 18, 5, 0, Math.PI);
        ctx.moveTo(bx + bw - 15, by + 10);
        ctx.lineTo(bx + bw - 15, by + 20);
        ctx.stroke();

        ctx.strokeStyle = isHorror ? "rgba(40, 20, 20, 0.45)" : "rgba(30, 20, 15, 0.35)";
        ctx.lineWidth = 1.2;
        const mast1X = bx + 125;
        const mast2X = bx + 195;
        const mast1TopY = by - 120;
        const mast2TopY = by - 90;

        ctx.beginPath();
        ctx.moveTo(mast1X, mast1TopY + 10);
        ctx.lineTo(bx + 40, by - 6);
        ctx.moveTo(mast1X, mast1TopY + 10);
        ctx.lineTo(bx + bw - 35, by - 6);
        ctx.moveTo(mast1X, mast1TopY + 20);
        ctx.lineTo(bx + bw + 30, by - 24);
        ctx.moveTo(mast2X, mast2TopY + 10);
        ctx.lineTo(bx + 110, by - 6);
        ctx.moveTo(mast2X, mast2TopY + 10);
        ctx.lineTo(bx + bw - 20, by - 6);
        ctx.stroke();

        [ { x: mast1X, topY: mast1TopY, h: 120, yardW: 56, sailW: 50, sailH: 52 },
          { x: mast2X, topY: mast2TopY, h: 90, yardW: 46, sailW: 40, sailH: 42 } ].forEach((m, mIdx) => {
            ctx.fillStyle = isHorror ? "#1c1917" : "#5c3317";
            ctx.fillRect(m.x - 3.5, m.topY, 7, m.h);
            ctx.strokeStyle = isHorror ? "#09090b" : "#3b1e08";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(m.x - 3.5, m.topY, 7, m.h);

            const yardY = m.topY + 22;
            ctx.fillStyle = isHorror ? "#292524" : "#451a03";
            ctx.fillRect(m.x - m.yardW * 0.5, yardY - 2.5, m.yardW, 5);

            const sailBelly = Math.sin(t * 0.08 + mIdx * 1.5) * 8 + (isMoving ? 10 : 4);
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(m.x - m.sailW * 0.5, yardY + 2);
            ctx.lineTo(m.x + m.sailW * 0.5, yardY + 2);
            ctx.quadraticCurveTo(m.x + m.sailW * 0.5 + sailBelly, yardY + m.sailH * 0.5, m.x + m.sailW * 0.45, yardY + m.sailH);
            ctx.lineTo(m.x - m.sailW * 0.45, yardY + m.sailH);
            ctx.quadraticCurveTo(m.x - m.sailW * 0.5 + sailBelly, yardY + m.sailH * 0.5, m.x - m.sailW * 0.5, yardY + 2);
            ctx.closePath();

            const sailGrad = ctx.createLinearGradient(m.x, yardY, m.x, yardY + m.sailH);
            if (isHorror) {
                sailGrad.addColorStop(0, "#262626");
                sailGrad.addColorStop(0.5, "#171717");
                sailGrad.addColorStop(1, "#0a0a0a");
            } else {
                sailGrad.addColorStop(0, "#fef3c7");
                sailGrad.addColorStop(0.4, "#fde68a");
                sailGrad.addColorStop(0.85, "#f59e0b");
                sailGrad.addColorStop(1, "#d97706");
            }
            ctx.fillStyle = sailGrad;
            ctx.fill();

            ctx.strokeStyle = isHorror ? "rgba(0,0,0,0.8)" : "rgba(180, 83, 9, 0.6)";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.strokeStyle = isHorror ? "rgba(220, 38, 38, 0.4)" : "rgba(217, 119, 6, 0.35)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(m.x, yardY + 2);
            ctx.lineTo(m.x, yardY + m.sailH);
            ctx.stroke();

            if (mIdx === 0 && !isHorror) {
                ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
                ctx.beginPath();
                ctx.arc(m.x + sailBelly * 0.4, yardY + m.sailH * 0.45, 6, 0, Math.PI * 2);
                ctx.fill();
            }

            if (isHorror) {
                ctx.fillStyle = "#000000";
                ctx.beginPath();
                ctx.arc(m.x - 8, yardY + m.sailH * 0.4, 4, 0, Math.PI * 2);
                ctx.arc(m.x + 10, yardY + m.sailH * 0.65, 5.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = "#7f1d1d";
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(m.x - m.sailW * 0.35, yardY + m.sailH * 0.25);
                ctx.lineTo(m.x - m.sailW * 0.1, yardY + m.sailH * 0.7);
                ctx.moveTo(m.x + m.sailW * 0.1, yardY + m.sailH * 0.3);
                ctx.lineTo(m.x + m.sailW * 0.35, yardY + m.sailH * 0.85);
                ctx.stroke();
            }

            ctx.restore();

            ctx.fillStyle = isHorror ? "#991b1b" : "#fbbf24";
            ctx.beginPath();
            ctx.arc(m.x, m.topY, 4, 0, Math.PI * 2);
            ctx.fill();

            const fWave1 = Math.sin(t * 0.16 + mIdx * 2) * 5;
            const fWave2 = Math.cos(t * 0.2 + mIdx * 2) * 4;
            const flagColor = isHorror ? "#dc2626" : (mIdx === 0 ? "#e11d48" : "#0284c7");

            ctx.save();
            ctx.fillStyle = flagColor;
            ctx.beginPath();
            ctx.moveTo(m.x, m.topY);
            ctx.quadraticCurveTo(m.x + 16, m.topY + fWave1 - 2, m.x + 30, m.topY + fWave2 + 4);
            ctx.lineTo(m.x + 22, m.topY + fWave1 + 10);
            ctx.quadraticCurveTo(m.x + 12, m.topY + fWave2 + 8, m.x, m.topY + 12);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        });

        const lanternSway = Math.sin(t * 0.08) * 0.18;
        const lantX = cabinX + 3;
        const lantY = cabinY + 2;

        ctx.save();
        ctx.translate(lantX, lantY);
        ctx.rotate(lanternSway);

        const lightGrad = ctx.createRadialGradient(0, 10, 2, 0, 10, 28);
        if (isHorror) {
            lightGrad.addColorStop(0, "rgba(239, 68, 68, 0.65)");
            lightGrad.addColorStop(1, "rgba(239, 68, 68, 0)");
        } else {
            lightGrad.addColorStop(0, "rgba(254, 240, 138, 0.75)");
            lightGrad.addColorStop(0.5, "rgba(245, 158, 11, 0.25)");
            lightGrad.addColorStop(1, "rgba(245, 158, 11, 0)");
        }
        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        ctx.arc(0, 10, 28, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isHorror ? "#18181b" : "#78350f";
        ctx.fillRect(-4, 0, 8, 3);
        ctx.fillStyle = isHorror ? "#ef4444" : "#fef08a";
        ctx.fillRect(-3, 3, 6, 8);
        ctx.fillStyle = isHorror ? "#18181b" : "#78350f";
        ctx.fillRect(-4, 11, 8, 3);
        ctx.strokeStyle = isHorror ? "#450a0a" : "#451a03";
        ctx.lineWidth = 1;
        ctx.strokeRect(-3, 3, 6, 8);
        ctx.restore();

        if (boat.bannerAlpha > 0.01) {
            ctx.save();
            ctx.globalAlpha = boat.bannerAlpha;
            var bannerX = bx + bw * 0.5;
            var bannerY = by - 130 + boat.bannerYOffset + Math.sin(t * 0.08) * 5;
            var text = typeof __ === "function" ? __("ui_a_zarpar") : "¡A ZARPAR!";
            ctx.font = 'bold 18px "Courier New", monospace, sans-serif';
            var textWidth = ctx.measureText(text).width;
            var padX = 16;
            var padY = 8;
            ctx.fillStyle = "#f59e0b";
            ctx.strokeStyle = "#b45309";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(bannerX - textWidth * 0.5 - padX, bannerY - 14 - padY, textWidth + padX * 2, 28 + padY, 8);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#b45309";
            ctx.beginPath();
            ctx.moveTo(bannerX - 8, bannerY + 14 + padY * 0.5);
            ctx.lineTo(bannerX + 8, bannerY + 14 + padY * 0.5);
            ctx.lineTo(bannerX, bannerY + 22 + padY * 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.shadowColor = "rgba(0,0,0,0.8)";
            ctx.shadowBlur = 4;
            ctx.restore();
        }

        const capX = cabinX + 10;
        const capY = cabinY - 28;
        drawCaptain(ctx, capX, capY, 1, boat.captain ? boat.captain.scared : false, !!(boat.captain && boat.captain.speechBubble), t, boat.captain ? boat.captain.speechBubble : null);

        ctx.restore();

        if (boat.outroCinematic && boat.outroCinematic.stage >= 3) {
            drawSinkingTentacles(ctx, camX, t, boat.outroCinematic.stage, boat.outroCinematic.timer, boat.x, boat.deckY, boat.sinkY || 0);
        }
    }

    function drawCaptain(ctx, cx, cy, facing, isScared, isTalking, time, bubble) {
        if (typeof window !== "undefined" && window.postGameHorror) return;
        ctx.save();
        
        const bob = Math.sin(time * 0.08) * 0.8;
        const capY = cy + bob;
        const cw = 28;
        const ch = 28;

        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.ellipse(cx + cw / 2, capY + ch + 1, cw * 0.42, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        const coatGrad = ctx.createLinearGradient(cx, capY, cx, capY + ch);
        coatGrad.addColorStop(0, "#1e293b");
        coatGrad.addColorStop(0.5, "#0f172a");
        coatGrad.addColorStop(1, "#020617");
        ctx.fillStyle = coatGrad;
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cx, capY, cw, ch, [6, 6, 4, 4]);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(cx + cw / 2, capY + ch * 0.62, 1.5, 0, Math.PI * 2);
        ctx.arc(cx + cw / 2, capY + ch * 0.82, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        const hatBaseY = capY + 4;
        ctx.fillStyle = "#090d16";
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(cx - 5, hatBaseY);
        ctx.quadraticCurveTo(cx + cw / 2, hatBaseY - 14, cx + cw + 5, hatBaseY);
        ctx.lineTo(cx + cw + 3, hatBaseY - 3);
        ctx.quadraticCurveTo(cx + cw / 2, hatBaseY - 18, cx - 3, hatBaseY - 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(cx + cw / 2, hatBaseY - 8, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx + cw / 2, hatBaseY - 8, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.fillStyle = "#f8fafc";
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1;

        ctx.beginPath();
        const beardTopY = capY + ch * 0.46;
        ctx.moveTo(cx + 2, beardTopY);
        ctx.lineTo(cx + cw - 2, beardTopY);
        ctx.quadraticCurveTo(cx + cw + 2, capY + ch + 3, cx + cw * 0.7, capY + ch + 7);
        ctx.quadraticCurveTo(cx + cw / 2, capY + ch + 9, cx + cw * 0.3, capY + ch + 7);
        ctx.quadraticCurveTo(cx - 2, capY + ch + 3, cx + 2, beardTopY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + cw * 0.35, beardTopY + 4);
        ctx.lineTo(cx + cw * 0.35, capY + ch + 5);
        ctx.moveTo(cx + cw * 0.65, beardTopY + 4);
        ctx.lineTo(cx + cw * 0.65, capY + ch + 5);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        const mustY = capY + ch * 0.44;
        ctx.ellipse(cx + cw * 0.35, mustY, 6, 3, -0.2, 0, Math.PI * 2);
        ctx.ellipse(cx + cw * 0.65, mustY, 6, 3, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (!isScared) {
            ctx.save();
            const pipeX = cx + cw - 1;
            const pipeY = capY + ch * 0.52;
            ctx.strokeStyle = "#78350f";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(pipeX - 4, pipeY);
            ctx.lineTo(pipeX + 5, pipeY - 2);
            ctx.lineTo(pipeX + 7, pipeY - 6);
            ctx.stroke();
            ctx.fillStyle = "#92400e";
            ctx.fillRect(pipeX + 5, pipeY - 8, 4, 5);
            ctx.fillStyle = "#f97316";
            ctx.fillRect(pipeX + 6, pipeY - 9, 2, 2);
            if (Math.sin(time * 0.1) > 0.3) {
                ctx.fillStyle = "rgba(226, 232, 240, 0.55)";
                ctx.beginPath();
                ctx.arc(pipeX + 8 + Math.sin(time * 0.15) * 2, pipeY - 14 - (time % 20) * 0.4, 2 + (time % 20) * 0.15, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        const eyeY = capY + ch * 0.32;
        if (isScared) {
            ctx.fillStyle = "#f1f5f9";
            ctx.beginPath();
            ctx.rect(cx + 3, capY + 2, 8, 3);
            ctx.rect(cx + cw - 11, capY + 2, 8, 3);
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(cx + 8, eyeY, 4.5, 0, Math.PI * 2);
            ctx.arc(cx + cw - 8, eyeY, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1;
            ctx.stroke();

            const jitX = (Math.random() - 0.5) * 1.5;
            const jitY = (Math.random() - 0.5) * 1.5;
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.arc(cx + 8 + jitX, eyeY + jitY, 1.6, 0, Math.PI * 2);
            ctx.arc(cx + cw - 8 + jitX, eyeY + jitY, 1.6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#38bdf8";
            ctx.beginPath();
            ctx.arc(cx - 3, capY + 6, 2.5, 0, Math.PI * 2);
            ctx.arc(cx + cw + 3, capY + 9, 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.ellipse(cx + cw / 2, capY + ch * 0.54, 4, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = "#f1f5f9";
            ctx.beginPath();
            ctx.rect(cx + 4, capY + 6, 7, 2.5);
            ctx.rect(cx + cw - 11, capY + 6, 7, 2.5);
            ctx.fill();

            const isBlink = Math.sin(time * 0.04) > 0.95;
            if (isBlink) {
                ctx.strokeStyle = "#0f172a";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(cx + 4, eyeY);
                ctx.lineTo(cx + 10, eyeY);
                ctx.moveTo(cx + cw - 10, eyeY);
                ctx.lineTo(cx + cw - 4, eyeY);
                ctx.stroke();
            } else {
                ctx.fillStyle = "#0f172a";
                ctx.beginPath();
                ctx.arc(cx + 8, eyeY, 2.2, 0, Math.PI * 2);
                ctx.arc(cx + cw - 8, eyeY, 2.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(cx + 7.5, eyeY - 0.7, 0.9, 0, Math.PI * 2);
                ctx.arc(cx + cw - 8.5, eyeY - 0.7, 0.9, 0, Math.PI * 2);
                ctx.fill();
            }

            if (isTalking) {
                const mouthOpen = (Math.floor(time * 0.2) % 2 === 0);
                if (mouthOpen) {
                    ctx.fillStyle = "#450a0a";
                    ctx.beginPath();
                    ctx.ellipse(cx + cw / 2, capY + ch * 0.52, 2.5, 2.5, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        ctx.restore();

        if (bubble && bubble.text) {
            drawCaptainSpeechBubble(ctx, bubble.text, cx + cw / 2, capY - 14, bubble.isScream);
        }
    }

    function drawCaptainSpeechBubble(ctx, text, bx, by, isScream) {
        if (!text) return;
        if (typeof __ === "function") text = __(text);
        if (!text) return;
        ctx.save();
        ctx.font = 'bold 12px "Fredoka One", "Segoe UI", sans-serif';
        const lines = text.split('\n');
        let maxW = 0;
        for (let l of lines) {
            maxW = Math.max(maxW, ctx.measureText(l).width);
        }
        const padX = 14;
        const padY = 8;
        const bw = maxW + padX * 2;
        const bh = lines.length * 16 + padY * 2;
        const bLeft = bx - bw / 2;
        const bTop = by - bh - 8;

        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.roundRect(bLeft + 2, bTop + 3, bw, bh, 8);
        ctx.fill();

        ctx.fillStyle = isScream ? "#fff1f2" : "#ffffff";
        ctx.beginPath();
        ctx.roundRect(bLeft, bTop, bw, bh, 8);
        ctx.fill();

        ctx.strokeStyle = isScream ? "#ef4444" : "#d97706";
        ctx.lineWidth = isScream ? 2.5 : 2;
        ctx.stroke();

        ctx.fillStyle = isScream ? "#fff1f2" : "#ffffff";
        ctx.beginPath();
        ctx.moveTo(bx - 6, bTop + bh);
        ctx.lineTo(bx + 6, bTop + bh);
        ctx.lineTo(bx, bTop + bh + 7);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = isScream ? "#ef4444" : "#d97706";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx - 6, bTop + bh - 1);
        ctx.lineTo(bx, bTop + bh + 7);
        ctx.lineTo(bx + 6, bTop + bh - 1);
        ctx.stroke();

        ctx.fillStyle = isScream ? "#991b1b" : "#0f172a";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], bx, bTop + padY + 8 + i * 16);
        }
        ctx.restore();
    }

    function drawSinkingTentacles(ctx, camX, time, stage, stageTimer, boatX, boatDeckY, sinkY) {
        const waterY = 470 + 60;
        const tConfigs = [
            { relX: 14, reachH: 155, curveDir: 1, phaseOff: 0 },
            { relX: boat.w * 0.48, reachH: 185, curveDir: -1, phaseOff: 1.5 },
            { relX: boat.w + 12, reachH: 160, curveDir: -1, phaseOff: 3.0 }
        ];

        let riseProgress = 0;
        if (stage === 3) {
            riseProgress = Math.min(1, stageTimer / 65);
        } else if (stage >= 4) {
            riseProgress = 1;
        }

        if (riseProgress <= 0.02) return;

        ctx.save();
        for (let i = 0; i < tConfigs.length; i++) {
            const cfg = tConfigs[i];
            const baseX = boatX - camX + cfg.relX;
            const baseY = waterY + (stage >= 4 ? sinkY * 0.35 : 0);
            const currentH = cfg.reachH * riseProgress;

            const wave = Math.sin(time * 0.12 + cfg.phaseOff) * 14;
            const tipX = baseX + cfg.curveDir * (45 + wave);
            const tipY = baseY - currentH + Math.abs(wave) * 0.5;
            const ctrlX = baseX + cfg.curveDir * (70 + wave * 1.5);
            const ctrlY = baseY - currentH * 0.55;

            const tGrad = ctx.createLinearGradient(baseX, baseY, tipX, tipY);
            tGrad.addColorStop(0, "#083344");
            tGrad.addColorStop(0.3, "#0e7490");
            tGrad.addColorStop(0.7, "#06b6d4");
            tGrad.addColorStop(1, "#a5f3fc");

            ctx.strokeStyle = tGrad;
            ctx.lineWidth = Math.max(6, 22 * riseProgress);
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(baseX, baseY);
            ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
            ctx.stroke();

            ctx.fillStyle = "#fef08a";
            for (let s = 0.2; s <= 0.85; s += 0.15) {
                const sx = (1 - s) * (1 - s) * baseX + 2 * (1 - s) * s * ctrlX + s * s * tipX;
                const sy = (1 - s) * (1 - s) * baseY + 2 * (1 - s) * s * ctrlY + s * s * tipY;
                const cupOffX = cfg.curveDir * -5;
                ctx.beginPath();
                ctx.arc(sx + cupOffX, sy, 3.2 * (1 - s * 0.4), 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
            for (let sp = 0; sp < 4; sp++) {
                const spX = baseX + (sp - 2) * 8 + Math.sin(time * 0.2 + sp) * 3;
                const spY = baseY - 2 - Math.abs(Math.cos(time * 0.25 + sp)) * 6;
                ctx.beginPath();
                ctx.arc(spX, spY, 3.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    }
})();
