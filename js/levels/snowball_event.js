
(function() {
    const STATE_IDLE = 0;
    const STATE_SLIP = 1;
    const STATE_SLOPE_ROLL = 2;
    const STATE_FLAT_ROLL = 3;
    const STATE_CRASH = 4;
    const STATE_FINISHED = 5;

    const SnowballEvent = {
        state: STATE_IDLE,
        active: false,
        timer: 0,

        SUMMIT_X_MIN: 22670,
        SUMMIT_X_MAX: 22920,
        SUMMIT_Y_MAX: 120,
        SLOPE_START_X: 22910,
        SLOPE_START_Y: 60,
        SLOPE_END_X: 23600,
        SLOPE_END_Y: 500,
        FLAT_GROUND_Y: 500,
        CRASH_X: 27000,
        PEGGY_LAND_X: 27080,
        PEGGY_LAND_Y: 468,

        ball: {
            x: 22910,
            y: 60,
            vx: 0,
            vy: 0,
            radius: 18,
            rot: 0
        },

        snowmen: [
            {
                id: 1,
                type: "snowman_blower",
                x: 24600,
                y: 500,
                facing: -1,
                destroyed: false,
                parts: [],
                notes: []
            },
            {
                id: 2,
                type: "snowball_head",
                x: 25300,
                y: 500,
                facing: -1,
                destroyed: false,
                parts: []
            },
            {
                id: 3,
                type: "mega_snowman",
                x: 26000,
                y: 500,
                facing: -1,
                destroyed: false,
                parts: []
            },
            {
                id: 4,
                type: "giant_snowman",
                x: 26650,
                y: 500,
                facing: -1,
                destroyed: false,
                parts: []
            }
        ],

        peggyRecovery: {
            active: false,
            timer: 0
        },

        reset: function(startX) {
            this.state = (startX && startX > 27000) ? STATE_FINISHED : STATE_IDLE;
            this.active = false;
            this.timer = 0;
            this.ball.x = this.SLOPE_START_X;
            this.ball.y = this.SLOPE_START_Y;
            this.ball.vx = 0;
            this.ball.vy = 0;
            this.ball.radius = 18;
            this.ball.rot = 0;
            this.peggyRecovery.active = false;
            this.peggyRecovery.timer = 0;

            for (let sm of this.snowmen) {
                sm.destroyed = false;
                sm.parts = [];
                if (sm.id === 1) {
                    sm.facing = -1;
                    sm.notes = [];
                }
            }

            if (typeof game !== "undefined" && game) {
                game.snowballActive = false;
                game.snowballDone = (typeof startX === "number" && startX > 27000);
            }
        },

        triggerSlip: function() {
            if (this.state === STATE_SLOPE_ROLL || this.state === STATE_FLAT_ROLL || this.state === STATE_CRASH) return;
            const p = game && game.player;
            if (!p) return;

            for (let sm of this.snowmen) {
                sm.destroyed = false;
                sm.parts = [];
                if (sm.id === 1) {
                    sm.facing = -1;
                    sm.notes = [];
                }
            }

            if (game) {
                game.snowballActive = false;
                game.snowballDone = false;
            }

            this.state = STATE_SLIP;
            this.active = true;
            this.timer = 0;
            p.frozen = true;
            p.vx = 3.2;
            p.vy = -3.5;
            p.facing = 1;

            try {
                if (typeof playSound === "function") {
                    playSound(280, 0.35, "sawtooth", 0.45, 960);
                    playSound(750, 0.25, "sine", 0.35, 1200);
                }
            } catch (_) {}

            if (typeof applyShake === "function") applyShake(7);
            if (typeof addFloatingText === "function") {
                addFloatingText(p.x + p.w / 2, p.y - 25, typeof __ === "function" ? __("flt_fuaaap") : "¡¡¡FUAAAP!!!", "#00ffff", 20);
            }

            if (typeof particles !== "undefined" && Array.isArray(particles)) {
                for (let k = 0; k < 15; k++) {
                    particles.push({
                        x: p.x + p.w / 2,
                        y: p.y + p.h,
                        vx: (Math.random() - 0.5) * 8,
                        vy: -Math.random() * 4 - 1,
                        life: 20,
                        color: ["#ffffff", "#67e8f9", "#38bdf8", "#00ffff"][k % 4],
                        size: 4,
                        type: "spark"
                    });
                }
            }
        },

        update: function() {
            if (typeof currentLevel === "undefined" || currentLevel !== 0 || !game) return;
            const p = game.player;
            if (!p) return;

            const isRolling = this.state === STATE_SLIP || this.state === STATE_SLOPE_ROLL || this.state === STATE_FLAT_ROLL || this.state === STATE_CRASH;

            if (!isRolling) {
                const atSummitX = p.x >= 22650 && p.x <= 23150;
                const atSummitY = p.y <= 240;
                const onSummitPlat = p.currentPlatform && (p.currentPlatform.isSummit || (p.currentPlatform.x >= 22650 && p.currentPlatform.x <= 23100 && p.currentPlatform.y <= 200));

                if ((atSummitX && atSummitY) || onSummitPlat) {
                    this.state = STATE_IDLE;
                    if (game) game.snowballDone = false;
                    this.triggerSlip();
                    return;
                }
            }

            if (this.state === STATE_SLIP) {
                this.timer++;
                p.frozen = true;
                p.vx = 3.2;
                p.x += p.vx;
                p.scaleX = 1.35;
                p.scaleY = 0.65;
                p.facing = 1;

                if (this.timer % 4 === 0 && typeof particles !== "undefined") {
                    particles.push({
                        x: p.x + p.w / 2 + (Math.random() - 0.5) * 16,
                        y: p.y - 6,
                        vx: (Math.random() - 0.5) * 3,
                        vy: -2,
                        life: 14,
                        color: "#60a5fa",
                        size: 3,
                        type: "spark"
                    });
                }

                if (this.timer >= 22) {
                    this.state = STATE_SLOPE_ROLL;
                    this.timer = 0;
                    game.snowballActive = true;
                    this.ball.x = Math.max(p.x, this.SLOPE_START_X);
                    this.ball.y = this.SLOPE_START_Y;
                    this.ball.vx = 6;
                    this.ball.radius = 20;

                    try {
                        playSound(160, 0.4, "triangle", 0.4, 40);
                    } catch (_) {}
                }
                return;
            }

            if (this.state === STATE_SLOPE_ROLL) {
                this.timer++;
                this.ball.vx = Math.min(16, this.ball.vx + 0.2);
                this.ball.x += this.ball.vx;

                const slopeRatio = Math.min(1, Math.max(0, (this.ball.x - this.SLOPE_START_X) / (this.SLOPE_END_X - this.SLOPE_START_X)));
                this.ball.y = this.SLOPE_START_Y + slopeRatio * (this.SLOPE_END_Y - this.SLOPE_START_Y) - this.ball.radius * 0.4;

                this.ball.radius = 18 + slopeRatio * 24;
                this.ball.rot += this.ball.vx * 0.09;

                p.x = this.ball.x - p.w / 2;
                p.y = this.ball.y - p.h / 2;
                p.vx = 0;
                p.vy = 0;

                game.cameraOverrideX = this.ball.x - VIEW_W / 2 + 100;

                if (typeof particles !== "undefined" && Math.random() < 0.85) {
                    particles.push({
                        x: this.ball.x - this.ball.radius * 0.8,
                        y: this.ball.y + this.ball.radius * 0.8,
                        vx: -Math.random() * 6 - 2,
                        vy: -Math.random() * 5 - 1,
                        life: 18,
                        color: "#ffffff",
                        size: 3 + Math.random() * 4,
                        type: "spark"
                    });
                }

                if (this.timer % 10 === 0) {
                    try {
                        playSound(75 + Math.random() * 20, 0.12, "triangle", 0.22);
                    } catch (_) {}
                    if (typeof applyShake === "function") applyShake(2);
                }

                if (this.ball.x >= this.SLOPE_END_X) {
                    this.state = STATE_FLAT_ROLL;
                    this.timer = 0;
                    this.ball.y = this.FLAT_GROUND_Y - this.ball.radius;
                    this.ball.vx = 16;

                    try {
                        playSound(110, 0.35, "sawtooth", 0.35, 60);
                    } catch (_) {}
                }
                return;
            }

            if (this.state === STATE_FLAT_ROLL) {
                this.timer++;
                this.ball.vx = 16;
                this.ball.x += this.ball.vx;
                this.ball.y = this.FLAT_GROUND_Y - this.ball.radius;
                this.ball.rot += this.ball.vx * 0.08;

                this.ball.radius = Math.min(68, 42 + (this.timer / 180) * 26);

                p.x = this.ball.x - p.w / 2;
                p.y = this.ball.y - p.h / 2;
                game.cameraOverrideX = this.ball.x - VIEW_W / 2 + 100;

                if (typeof applyShake === "function" && this.timer % 6 === 0) {
                    applyShake(2);
                }

                if (typeof particles !== "undefined") {
                    particles.push({
                        x: this.ball.x - this.ball.radius,
                        y: this.FLAT_GROUND_Y - 4,
                        vx: -Math.random() * 6 - 3,
                        vy: -Math.random() * 3 - 0.5,
                        life: 20,
                        color: "rgba(240, 249, 255, 0.8)",
                        size: 5 + Math.random() * 5,
                        type: "smoke"
                    });
                }

                for (let i = 0; i < this.snowmen.length; i++) {
                    const sm = this.snowmen[i];
                    if (!sm.destroyed && this.ball.x + this.ball.radius >= sm.x - 25) {
                        sm.destroyed = true;
                        this.createSnowmanGibs(sm);
                        if (typeof triggerDashHitImpact === "function") {
                            triggerDashHitImpact(sm.x, sm.y - 30, true);
                        }
                        if (typeof createExplosion === "function") {
                            createExplosion(sm.x, sm.y - 30, "#ffffff", 50, 30, ["#e0f7fa", "#00ffff", "#ffea00"]);
                        }
                        if (typeof applyShake === "function") applyShake(14);

                        const strikeLabels = [
                            typeof __ === "function" ? __("flt_strike_1") : "💥 ¡¡¡FUAAAP!!! 💥",
                            typeof __ === "function" ? __("flt_strike_2") : "💥 ¡¡STRIKE!! 💥",
                            typeof __ === "function" ? __("flt_strike_3") : "💥 ¡¡SPLAAAAT!! 💥",
                            typeof __ === "function" ? __("flt_strike_4") : "💥 ¡¡BOOOOOOM!! 💥"
                        ];
                        if (typeof addFloatingText === "function") {
                            addFloatingText(sm.x, sm.y - 50, strikeLabels[i], "#ffea00", 24);
                        }
                        try {
                            if (typeof playSound === "function") {
                                playSound(200 + i * 50, 0.25, "sawtooth", 0.45, 75);
                                playSound(800 - i * 60, 0.2, "triangle", 0.35, 200);
                            }
                            if (typeof playSFX === "function") {
                                playSFX("sfx_rock_impact");
                            }
                        } catch (_) {}
                    }
                }

                if (this.ball.x + this.ball.radius >= this.CRASH_X) {
                    this.state = STATE_CRASH;
                    this.timer = 0;
                }
                return;
            }

            if (this.state === STATE_CRASH) {
                this.timer++;

                if (this.timer === 1) {
                    if (typeof createExplosion === "function") {
                        createExplosion(this.CRASH_X, this.FLAT_GROUND_Y - 40, "#ffffff", 85, 60, ["#00ffff", "#e0f7fa", "#ffffff", "#80deea"]);
                    }
                    if (typeof applyShake === "function") applyShake(26);
                    if (game) game.flash = 55;

                    try {
                        if (typeof playSound === "function") {
                            playSound(60, 0.6, "sawtooth", 0.7, 25);
                            playSound(1200, 0.25, "sine", 0.5, 300);
                        }
                        if (typeof playSFX === "function") {
                            playSFX("sfx_rock_impact");
                        }
                    } catch (_) {}

                    if (typeof addFloatingText === "function") {
                        addFloatingText(this.CRASH_X, this.FLAT_GROUND_Y - 90, typeof __ === "function" ? __("flt_booooom") : "¡¡¡BOOOOOOOOM!!!", "#00ffff", 30);
                    }

                    p.x = this.PEGGY_LAND_X;
                    p.y = this.PEGGY_LAND_Y - 20;
                    p.vx = 2.5;
                    p.vy = -5.5;
                    p.facing = 1;
                    game.snowballActive = false;
                    this.peggyRecovery.active = true;
                    this.peggyRecovery.timer = 0;
                }

                if (this.peggyRecovery.active) {
                    this.peggyRecovery.timer++;
                    p.vy = Math.min(10, p.vy + 0.4);
                    p.x += p.vx;
                    p.y += p.vy;

                    if (p.y >= this.PEGGY_LAND_Y) {
                        p.y = this.PEGGY_LAND_Y;
                        p.vy = 0;
                        p.vx = 0;
                        p.onGround = true;
                    }

                    p.scaleX = 1 + Math.sin(this.peggyRecovery.timer * 0.45) * 0.22;
                    p.scaleY = 1 - Math.sin(this.peggyRecovery.timer * 0.45) * 0.22;

                    if (this.peggyRecovery.timer % 6 === 0 && typeof particles !== "undefined") {
                        particles.push({
                            x: p.x + p.w / 2 + (Math.random() - 0.5) * 20,
                            y: p.y - 12,
                            vx: (Math.random() - 0.5) * 2,
                            vy: -1.5,
                            life: 18,
                            color: "#ffea00",
                            size: 4,
                            type: "spark"
                        });
                    }

                    if (this.peggyRecovery.timer >= 35) {
                        this.peggyRecovery.active = false;
                        p.frozen = false;
                        p.scaleX = 1;
                        p.scaleY = 1;
                        this.state = STATE_FINISHED;
                        game.snowballDone = true;
                        delete game.cameraOverrideX;

                        try {
                            playSound(600, 0.15, "triangle", 0.3, 900);
                        } catch (_) {}

                        if (typeof addFloatingText === "function") {
                            addFloatingText(p.x + p.w / 2, p.y - 25, typeof __ === "function" ? __("flt_peggy_phew") : "¡Ufff! ¡Estoy bien!", "#ffea00", 18);
                        }
                    }
                }
            }

            for (let sm of this.snowmen) {
                if (sm.destroyed && sm.parts && sm.parts.length > 0) {
                    for (let i = sm.parts.length - 1; i >= 0; i--) {
                        let pt = sm.parts[i];
                        pt.x += pt.vx;
                        pt.y += pt.vy;
                        pt.vy += 0.35;
                        pt.rot += pt.vRot;
                        pt.life--;
                        if (pt.life <= 0) sm.parts.splice(i, 1);
                    }
                }
                if (sm.notes && sm.notes.length > 0) {
                    for (let i = sm.notes.length - 1; i >= 0; i--) {
                        let n = sm.notes[i];
                        n.x += n.vx + Math.sin(n.life * 0.15) * 0.6;
                        n.y += n.vy;
                        n.alpha = Math.max(0, n.life / 45);
                        n.life--;
                        if (n.life <= 0) sm.notes.splice(i, 1);
                    }
                }
            }
        },

        createSnowmanGibs: function(sm) {
            sm.parts = [];
            sm.parts.push({
                x: sm.x,
                y: sm.y - 30,
                vx: -Math.random() * 5 - 4,
                vy: -Math.random() * 7 - 5,
                rot: 0,
                vRot: (Math.random() - 0.5) * 0.3,
                type: "carrot",
                life: 60
            });
            sm.parts.push({
                x: sm.x,
                y: sm.y - 22,
                vx: -Math.random() * 4 - 2,
                vy: -Math.random() * 6 - 4,
                rot: 0,
                vRot: 0.2,
                type: "scarf",
                life: 60
            });
            for (let k = 0; k < 2; k++) {
                sm.parts.push({
                    x: sm.x + (k === 0 ? -12 : 12),
                    y: sm.y - 20,
                    vx: (k === 0 ? -1 : 1) * (Math.random() * 5 + 3),
                    vy: -Math.random() * 6 - 3,
                    rot: 0,
                    vRot: (Math.random() - 0.5) * 0.3,
                    type: "branch",
                    life: 55
                });
            }
            for (let k = 0; k < 4; k++) {
                sm.parts.push({
                    x: sm.x + (Math.random() - 0.5) * 15,
                    y: sm.y - 15 - k * 6,
                    vx: (Math.random() - 0.5) * 8,
                    vy: -Math.random() * 7 - 2,
                    rot: 0,
                    vRot: 0.2,
                    type: "coal",
                    life: 50
                });
            }
            for (let k = 0; k < 18; k++) {
                sm.parts.push({
                    x: sm.x + (Math.random() - 0.5) * 20,
                    y: sm.y - Math.random() * 40,
                    vx: (Math.random() - 0.5) * 12,
                    vy: -Math.random() * 10 - 2,
                    rot: 0,
                    vRot: (Math.random() - 0.5) * 0.2,
                    type: "snow_chunk",
                    size: 4 + Math.random() * 8,
                    life: 50
                });
            }
        },

        draw: function(ctx, cameraX) {
            if (typeof currentLevel === "undefined" || currentLevel !== 0 || !game) return;

            this.drawTerrain(ctx, cameraX);

            this.drawSnowmen(ctx, cameraX);

            if (game.snowballActive && (this.state === STATE_SLOPE_ROLL || this.state === STATE_FLAT_ROLL)) {
                this.drawSnowball(ctx, cameraX);
            }
        },

        drawTerrain: function(ctx, cameraX) {
            const startX = 21700 - cameraX;
            const summitX = this.SUMMIT_X_MIN + 70 - cameraX;
            const endX = this.SLOPE_END_X + 100 - cameraX;

            ctx.save();

            const gMtn = ctx.createLinearGradient(0, 50, 0, 500);
            gMtn.addColorStop(0, "rgba(224, 247, 250, 0.96)");
            gMtn.addColorStop(0.35, "rgba(178, 235, 242, 0.88)");
            gMtn.addColorStop(0.7, "rgba(129, 212, 250, 0.7)");
            gMtn.addColorStop(1, "rgba(79, 195, 247, 0.45)");

            ctx.fillStyle = gMtn;
            ctx.beginPath();
            ctx.moveTo(startX, 500);
            ctx.lineTo(startX + 280, 400);
            ctx.lineTo(startX + 520, 270);
            ctx.lineTo(startX + 740, 160);
            ctx.lineTo(summitX, 60);
            ctx.lineTo(summitX + 180, 100);
            ctx.lineTo(summitX + 380, 240);
            ctx.lineTo(summitX + 580, 380);
            ctx.lineTo(endX, 500);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.moveTo(summitX - 120, 140);
            ctx.lineTo(summitX, 60);
            ctx.lineTo(summitX + 120, 90);
            ctx.lineTo(summitX + 70, 130);
            ctx.lineTo(summitX + 20, 110);
            ctx.lineTo(summitX - 50, 145);
            ctx.closePath();
            ctx.fill();

            const signX = this.SUMMIT_X_MIN + 110 - cameraX;
            const signY = 60;
            ctx.fillStyle = "#8d6e63";
            ctx.fillRect(signX - 3, signY - 24, 6, 24);
            ctx.fillStyle = "#ffea00";
            ctx.strokeStyle = "#b45309";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(signX - 22, signY - 48, 44, 25, 4);
            ctx.fill();
            ctx.stroke();
            ctx.font = "14px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("⚠️", signX, signY - 35);

            const barrierX = this.CRASH_X - cameraX;
            if (barrierX > -100 && barrierX < VIEW_W + 100) {
                const gBar = ctx.createLinearGradient(barrierX, 420, barrierX + 60, 500);
                gBar.addColorStop(0, "#e0f7fa");
                gBar.addColorStop(0.5, "#80deea");
                gBar.addColorStop(1, "#00acc1");
                ctx.fillStyle = gBar;
                ctx.beginPath();
                ctx.moveTo(barrierX, 500);
                ctx.lineTo(barrierX + 10, 430);
                ctx.lineTo(barrierX + 45, 415);
                ctx.lineTo(barrierX + 70, 460);
                ctx.lineTo(barrierX + 80, 500);
                ctx.closePath();
                ctx.fill();
            }

            ctx.restore();
        },

        drawSnowball: function(ctx, cameraX) {
            const b = this.ball;
            const sx = b.x - cameraX;
            const sy = b.y;
            const r = b.radius;

            ctx.save();
            ctx.translate(sx, sy);

            ctx.shadowColor = "#38bdf8";
            ctx.shadowBlur = 18;

            const gBall = ctx.createRadialGradient(-r * 0.25, -r * 0.25, r * 0.1, 0, 0, r);
            gBall.addColorStop(0, "#ffffff");
            gBall.addColorStop(0.65, "#f0fdf4");
            gBall.addColorStop(0.88, "#cffafe");
            gBall.addColorStop(1, "#7dd3fc");
            ctx.fillStyle = gBall;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.rotate(b.rot);
            ctx.strokeStyle = "rgba(147, 197, 253, 0.55)";
            ctx.lineWidth = Math.max(1.5, r * 0.05);
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
                const a = (Math.PI / 2) * i;
                ctx.arc(Math.cos(a) * (r * 0.35), Math.sin(a) * (r * 0.35), r * 0.45, a, a + Math.PI * 0.9);
            }
            ctx.stroke();

            const pScale = Math.min(1, r / 35);
            ctx.save();
            ctx.scale(pScale, pScale);
            ctx.fillStyle = "#ff66aa";
            ctx.fillRect(-12, -12, 24, 24);
            ctx.strokeStyle = "#ff3388";
            ctx.lineWidth = 2;
            ctx.strokeRect(-12, -12, 24, 24);

            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(-5, -4, 4, 0, Math.PI * 2);
            ctx.arc(5, -4, 4, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.arc(-5, -4, 1.8, 0, Math.PI * 2);
            ctx.arc(5, -4, 1.8, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(-5, 4);
            ctx.lineTo(-2, 6);
            ctx.lineTo(2, 3);
            ctx.lineTo(5, 5);
            ctx.stroke();
            ctx.restore();

            ctx.restore();
        },

        drawSnowmen: function(ctx, cameraX) {
            for (let sm of this.snowmen) {
                if (sm.destroyed) {
                    if (sm.parts) {
                        for (let pt of sm.parts) {
                            const px = pt.x - cameraX;
                            ctx.save();
                            ctx.translate(px, pt.y);
                            ctx.rotate(pt.rot);
                            if (pt.type === "carrot") {
                                ctx.fillStyle = "#ff6a00";
                                ctx.beginPath();
                                ctx.moveTo(-8, -3);
                                ctx.lineTo(12, 0);
                                ctx.lineTo(-8, 3);
                                ctx.closePath();
                                ctx.fill();
                            } else if (pt.type === "scarf") {
                                ctx.fillStyle = "#d62246";
                                ctx.fillRect(-10, -4, 20, 8);
                            } else if (pt.type === "branch") {
                                ctx.strokeStyle = "#5a3d28";
                                ctx.lineWidth = 2.5;
                                ctx.beginPath();
                                ctx.moveTo(-10, 0);
                                ctx.lineTo(10, 0);
                                ctx.lineTo(14, -6);
                                ctx.stroke();
                            } else if (pt.type === "coal") {
                                ctx.fillStyle = "#1c2028";
                                ctx.beginPath();
                                ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
                                ctx.fill();
                            } else {
                                ctx.fillStyle = "#e8f7ff";
                                ctx.beginPath();
                                ctx.arc(0, 0, pt.size || 5, 0, Math.PI * 2);
                                ctx.fill();
                            }
                            ctx.restore();
                        }
                    }
                    continue;
                }

                const sx = sm.x - cameraX;
                if (sx < -100 || sx > VIEW_W + 100) continue;

                ctx.save();
                const sy = sm.y + (sm.hopY || 0);
                const f = sm.facing;

                if (sm.id === 1) {
                    const cx = sx;
                    const cy = sy - 23;
                    const w = 38, h = 46;

                    ctx.fillStyle = "rgba(0, 40, 80, 0.28)";
                    ctx.beginPath();
                    ctx.ellipse(cx, cy + h / 2 - 2, w * .45, 6, 0, 0, Math.PI * 2);
                    ctx.fill();

                    const baseR = 15.5;
                    const baseY = cy + 7;
                    const gradBase = ctx.createRadialGradient(cx - f * 4, baseY - 5, 2, cx, baseY, baseR);
                    gradBase.addColorStop(0, "#ffffff");
                    gradBase.addColorStop(.65, "#e8f6fc");
                    gradBase.addColorStop(1, "#a6cde2");
                    ctx.fillStyle = gradBase;
                    ctx.beginPath();
                    ctx.arc(cx, baseY, baseR, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = "#1c2028";
                    ctx.beginPath();
                    ctx.arc(cx + f * 3, baseY - 2, 2.5, 0, Math.PI * 2);
                    ctx.arc(cx + f * 2, baseY + 6, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(cx + f * 3 - .7, baseY - 2.7, .9, 0, Math.PI * 2);
                    ctx.arc(cx + f * 2 - .7, baseY + 5.3, .9, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.strokeStyle = "#5a3d28";
                    ctx.lineWidth = 2.2;
                    ctx.beginPath();
                    ctx.moveTo(cx - f * 8, cy + 2);
                    ctx.lineTo(cx - f * 18, cy - (sm.shocked ? 20 : 2));
                    ctx.lineTo(cx - f * 22, cy - (sm.shocked ? 26 : 8));
                    ctx.moveTo(cx + f * 8, cy + 2);
                    ctx.lineTo(cx + f * 18, cy - (sm.shocked ? 20 : 2));
                    ctx.lineTo(cx + f * 23, cy - (sm.shocked ? 26 : 4));
                    ctx.stroke();

                    const headR = 11.5;
                    const headY = cy - 11;
                    const gradHead = ctx.createRadialGradient(cx - f * 3, headY - 4, 1, cx, headY, headR);
                    gradHead.addColorStop(0, "#ffffff");
                    gradHead.addColorStop(.6, "#e8f7ff");
                    gradHead.addColorStop(1, "#abd1e7");
                    ctx.fillStyle = gradHead;
                    ctx.beginPath();
                    ctx.arc(cx, headY, headR, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = "#d62246";
                    ctx.beginPath();
                    ctx.ellipse(cx, headY + headR - 1, 13, 4, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillRect(cx - f * 5, headY + headR - 1, 5, 12);

                    if (!sm.shocked) {
                        ctx.fillStyle = "#1c2028";
                        ctx.beginPath();
                        ctx.arc(cx + f * 2, headY - 2, 2.2, 0, Math.PI * 2);
                        ctx.arc(cx + f * 7, headY - 2, 2.2, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = "#ffffff";
                        ctx.beginPath();
                        ctx.arc(cx + f * 2 - .6, headY - 2.6, .8, 0, Math.PI * 2);
                        ctx.arc(cx + f * 7 - .6, headY - 2.6, .8, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.fillStyle = "#ff6a00";
                        ctx.beginPath();
                        ctx.moveTo(cx + f * 5, headY + 1);
                        ctx.lineTo(cx + f * 17, headY + 2);
                        ctx.lineTo(cx + f * 5, headY + 4);
                        ctx.closePath();
                        ctx.fill();

                        ctx.fillStyle = "#061a2b";
                        ctx.beginPath();
                        ctx.ellipse(cx + f * 7, headY + 6, 2.5, 2, 0, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        ctx.fillStyle = "#ffffff";
                        ctx.strokeStyle = "#000000";
                        ctx.lineWidth = 1.6;
                        ctx.beginPath();
                        ctx.ellipse(cx - 5, headY - 6, 6, 9, -0.1, 0, Math.PI * 2);
                        ctx.ellipse(cx + 6, headY - 6, 6, 9, 0.1, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();

                        ctx.fillStyle = "#000000";
                        ctx.beginPath();
                        ctx.arc(cx - 6, headY - 6, 1.8, 0, Math.PI * 2);
                        ctx.arc(cx + 5, headY - 6, 1.8, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.fillStyle = "#ff6a00";
                        ctx.beginPath();
                        ctx.moveTo(cx - 2, headY);
                        ctx.lineTo(cx - 18, headY + 1);
                        ctx.lineTo(cx - 2, headY + 3);
                        ctx.closePath();
                        ctx.fill();

                        ctx.fillStyle = "#061a2b";
                        ctx.beginPath();
                        ctx.ellipse(cx, headY + 10, 5, 9, 0, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.fillStyle = "#38bdf8";
                        ctx.beginPath();
                        ctx.arc(cx - 15, headY - 10, 2.5, 0, Math.PI * 2);
                        ctx.arc(cx + 15, headY - 10, 2.5, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    if (sm.notes) {
                        for (let n of sm.notes) {
                            ctx.font = "16px sans-serif";
                            ctx.fillStyle = `rgba(56, 189, 248, ${n.alpha})`;
                            ctx.fillText(n.char, n.x - cameraX, n.y);
                        }
                    }
                }
                else if (sm.type === "snowball_head") {
                    const cx = sx, cy = sy - 23;
                    const r = 18;
                    const grad = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, r);
                    grad.addColorStop(0, "#ffffff");
                    grad.addColorStop(0.7, "#e0f2fe");
                    grad.addColorStop(1, "#93c5fd");
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(cx, cy, r, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = "#0284c7";
                    ctx.beginPath();
                    ctx.arc(cx - r + 2, cy, 5, 0, Math.PI * 2);
                    ctx.arc(cx + r - 2, cy, 5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = "#0284c7";
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.arc(cx, cy, r + 1, Math.PI, 0);
                    ctx.stroke();

                    ctx.fillStyle = "#1c2028";
                    ctx.beginPath();
                    ctx.arc(cx - 5, cy - 2, 2, 0, Math.PI * 2);
                    ctx.arc(cx - 11, cy - 2, 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#ff6a00";
                    ctx.beginPath();
                    ctx.moveTo(cx - 6, cy + 1);
                    ctx.lineTo(cx - 18, cy + 2);
                    ctx.lineTo(cx - 6, cy + 4);
                    ctx.closePath();
                    ctx.fill();
                }
                else if (sm.type === "mega_snowman") {
                    const cx = sx, cy = sy - 45;
                    const gBase = ctx.createRadialGradient(cx - 6, cy + 18, 3, cx, cy + 18, 28);
                    gBase.addColorStop(0, "#ffffff");
                    gBase.addColorStop(0.7, "#e0f2fe");
                    gBase.addColorStop(1, "#7dd3fc");
                    ctx.fillStyle = gBase;
                    ctx.beginPath();
                    ctx.arc(cx, cy + 18, 28, 0, Math.PI * 2);
                    ctx.fill();

                    const gMid = ctx.createRadialGradient(cx - 5, cy - 10, 2, cx, cy - 10, 20);
                    gMid.addColorStop(0, "#ffffff");
                    gMid.addColorStop(0.7, "#e0f2fe");
                    gMid.addColorStop(1, "#7dd3fc");
                    ctx.fillStyle = gMid;
                    ctx.beginPath();
                    ctx.arc(cx, cy - 10, 20, 0, Math.PI * 2);
                    ctx.fill();

                    const gHead = ctx.createRadialGradient(cx - 4, cy - 32, 2, cx, cy - 32, 14);
                    gHead.addColorStop(0, "#ffffff");
                    gHead.addColorStop(0.7, "#e0f2fe");
                    gHead.addColorStop(1, "#7dd3fc");
                    ctx.fillStyle = gHead;
                    ctx.beginPath();
                    ctx.arc(cx, cy - 32, 14, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.strokeStyle = "#451a03";
                    ctx.lineWidth = 3.5;
                    ctx.beginPath();
                    ctx.moveTo(cx - 15, cy - 10);
                    ctx.lineTo(cx - 35, cy - 18);
                    ctx.moveTo(cx + 15, cy - 10);
                    ctx.lineTo(cx + 35, cy - 18);
                    ctx.stroke();

                    ctx.fillStyle = "#d62246";
                    ctx.beginPath();
                    ctx.ellipse(cx, cy - 20, 16, 5, 0, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = "#0f172a";
                    ctx.beginPath();
                    ctx.arc(cx - 5, cy - 34, 2.5, 0, Math.PI * 2);
                    ctx.arc(cx - 11, cy - 34, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#ff6a00";
                    ctx.beginPath();
                    ctx.moveTo(cx - 6, cy - 31);
                    ctx.lineTo(cx - 20, cy - 30);
                    ctx.lineTo(cx - 6, cy - 28);
                    ctx.closePath();
                    ctx.fill();
                }
                else if (sm.type === "giant_snowman") {
                    const cx = sx, cy = sy - 34;
                    const b1R = 20, b1Y = cy + 14;
                    const g1 = ctx.createRadialGradient(cx - 4, b1Y - 6, 2, cx, b1Y, b1R);
                    g1.addColorStop(0, "#ffffff");
                    g1.addColorStop(.6, "#e0f2fe");
                    g1.addColorStop(1, "#93c5fd");
                    ctx.fillStyle = g1;
                    ctx.beginPath();
                    ctx.arc(cx, b1Y, b1R, 0, Math.PI * 2);
                    ctx.fill();

                    const b2R = 15, b2Y = cy - 6;
                    const g2 = ctx.createRadialGradient(cx - 4, b2Y - 5, 2, cx, b2Y, b2R);
                    g2.addColorStop(0, "#ffffff");
                    g2.addColorStop(.65, "#e0f2fe");
                    g2.addColorStop(1, "#93c5fd");
                    ctx.fillStyle = g2;
                    ctx.beginPath();
                    ctx.arc(cx, b2Y, b2R, 0, Math.PI * 2);
                    ctx.fill();

                    const headR = 12, headY = cy - 22;
                    const g3 = ctx.createRadialGradient(cx - 3, headY - 4, 1, cx, headY, headR);
                    g3.addColorStop(0, "#ffffff");
                    g3.addColorStop(.6, "#e8f7ff");
                    g3.addColorStop(1, "#abd1e7");
                    ctx.fillStyle = g3;
                    ctx.beginPath();
                    ctx.arc(cx, headY, headR, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.strokeStyle = "#5a3d28";
                    ctx.lineWidth = 2.8;
                    ctx.beginPath();
                    ctx.moveTo(cx - 10, b2Y);
                    ctx.lineTo(cx - 28, b2Y - 10);
                    ctx.moveTo(cx + 10, b2Y);
                    ctx.lineTo(cx + 28, b2Y - 10);
                    ctx.stroke();

                    ctx.fillStyle = "#000000";
                    ctx.fillRect(cx - 11, headY - 3, 9, 6);
                    ctx.fillRect(cx + 1, headY - 3, 9, 6);
                    ctx.fillRect(cx - 2, headY - 2, 4, 2);

                    ctx.fillStyle = "#ff6a00";
                    ctx.beginPath();
                    ctx.moveTo(cx - 4, headY + 3);
                    ctx.lineTo(cx - 16, headY + 4);
                    ctx.lineTo(cx - 4, headY + 6);
                    ctx.closePath();
                    ctx.fill();
                }

                ctx.restore();
            }
        }
    };

    window.SnowballEventSystem = SnowballEvent;
})();
