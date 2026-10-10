const demonSprite = { complete: false, naturalWidth: 0, width: 0, height: 0 };

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 32;
        this.h = 32;
        this.vx = 0;
        this.vy = 0;
        this.health = PLAYER_MAX_HEALTH;
        this.onGround = false;
        this.facing = 1;
        this.shootCooldown = 0;
        this.invulnerable = 0;
        this.slashCooldown = 0;
        this.trail = [];
        this.scaleX = 1;
        this.scaleY = 1;
        this.scared = false;
        this.frozen = false;
        this.animFrame = 0;
        this.animTimer = 0;
        this.state = "idle";
        this.knifeShow = 0;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.lastVy = 0;
        this._bounceGuard = 0;
        this._jumpHeldAtStart = false;
        this.dashTimer = 0;
        this.dashCooldown = 0;
        this.dashBufferTimer = 0;
        this.dashTrailT = 0;
        this.dashDir = 1;
        this.dashMax = false;
        this.dashColor = "#9be7ff";
        this._dashHitBump = 0;
        this.afkTimer = 0;
        this.afkState = null;
        this.afkStateTimer = 0;
        this.afkPauseTimer = 0;
        this.healShowTimer = 0;
        this.checkpointShowTimer = 0;
        this.lavaBounceTimer = 0;
        this.electricShockTimer = 0;
    }
    update(keys, platforms) {
        if (this.electricShockTimer > 0) {
            this.electricShockTimer--;
            if (this.invulnerable > 0) this.invulnerable--;
            this.vx *= .5;
            this.vy += GRAVITY;
            this.y += this.vy;
            if (platforms && Array.isArray(platforms)) {
                const pxMin = this.x - 100, pxMax = this.x + this.w + 100;
                for (let plat of platforms) {
                    if (plat.x > pxMax || plat.x + plat.w < pxMin) continue;
                    if (plat.broken) continue;
                    if (this.x + this.w > plat.x && this.x < plat.x + plat.w && this.y + this.h >= plat.y && this.y + this.h <= plat.y + plat.h + this.vy + 2) {
                        this.y = plat.y - this.h;
                        this.vy = 0;
                        this.onGround = true;
                        break;
                    }
                }
            }
            if (this.electricShockTimer <= 0) {
                this.invulnerable = Math.max(this.invulnerable || 0, 20);
            }
            return;
        }
        if (this.paralyzeTimer > 0) {
            this.paralyzeTimer--;
            this.vx *= .82;
            this.vy += GRAVITY;
            this.y += this.vy;

            const maxFallLimit = (typeof VIEW_H !== "undefined" ? VIEW_H : 600) + 40;
            if (this.y > maxFallLimit && !(currentLevel === 4 && (game.lvl4State === "falling" || game.lvl4State === "companion" || game.lvl4State === "meta" || game.inHunt || game.lvl4State === "hunt"))) {
                this.paralyzed = false;
                this.paralyzeTimer = 0;
                this.invulnerable = 0;
                this.takeDamage(100);
                return;
            }

            if (platforms && Array.isArray(platforms)) {
                const pxMin = this.x - 100, pxMax = this.x + this.w + 100;
                for (let plat of platforms) {
                    if (plat.x > pxMax || plat.x + plat.w < pxMin) continue;
                    if (plat.broken) continue;
                    if (this.x + this.w > plat.x && this.x < plat.x + plat.w && this.y + this.h >= plat.y && this.y + this.h <= plat.y + plat.h + this.vy + 2) {
                        this.y = plat.y - this.h;
                        this.vy = 0;
                        this.onGround = true;
                        break;
                    }
                }
            }
            if (this.paralyzeTimer <= 0) {
                this.paralyzed = false;
                this.paralyzeImmunityTimer = 120;
                this.invulnerable = 120;
                try {
                    playSound(900, .25, "sawtooth", .25, 450);
                    createExplosion(this.x + this.w / 2, this.y + this.h / 2, "#e879f9", 24, 16, [ "#ffffff", "#f0abfc", "#c084fc" ]);
                } catch (e) {}
            }
            return;
        }
        if (this.paralyzeImmunityTimer > 0) {
            this.paralyzeImmunityTimer--;
        }
        if (this.frozen) return;
        if (this._bounceGuard > 0) this._bounceGuard--;
        if (this.healShowTimer > 0) this.healShowTimer--;
        if (this.checkpointShowTimer > 0) this.checkpointShowTimer--;
        if (game.forceRunDir === -1) keys = {
            ArrowLeft: true,
            a: true
        }; else if (game.forceRunDir === 1) keys = {
            ArrowRight: true,
            d: true
        };
        let moving = false;
        if (currentLevel === 0 && game.iceMode && this.onGround) {
            if (keys["ArrowLeft"] || keys["a"]) {
                if (this.vx > 0) this.vx -= .65; else this.vx -= .55;
                if (this.vx < -MOVE_SPEED * 1.05) this.vx = -MOVE_SPEED * 1.05;
                this.facing = -1;
                moving = true;
            } else if (keys["ArrowRight"] || keys["d"]) {
                if (this.vx < 0) this.vx += .65; else this.vx += .55;
                if (this.vx > MOVE_SPEED * 1.05) this.vx = MOVE_SPEED * 1.05;
                this.facing = 1;
                moving = true;
            } else {
                this.vx *= .935;
                if (Math.abs(this.vx) < .12) this.vx = 0;
            }
        } else if (currentLevel === 3 && game.stormMode && typeof window.applyStormPhysics === "function") {
            if (keys["ArrowLeft"] || keys["a"]) {
                this.vx = -MOVE_SPEED;
                this.facing = -1;
                moving = true;
            } else if (keys["ArrowRight"] || keys["d"]) {
                this.vx = MOVE_SPEED;
                this.facing = 1;
                moving = true;
            } else {
                this.vx *= FRICTION;
                if (Math.abs(this.vx) < .1) this.vx = 0;
            }
            window.applyStormPhysics(this, keys);
            if (Math.abs(this.vx) > .1) moving = true;
        } else {
            if (keys["ArrowLeft"] || keys["a"]) {
                this.vx = -MOVE_SPEED;
                this.facing = -1;
                moving = true;
            } else if (keys["ArrowRight"] || keys["d"]) {
                this.vx = MOVE_SPEED;
                this.facing = 1;
                moving = true;
            } else {
                this.vx *= FRICTION;
                if (Math.abs(this.vx) < .1) this.vx = 0;
            }
        }
        if (this.lavaBounceTimer > 0) {
            this.lavaBounceTimer--;
            const airSpeed = MOVE_SPEED * 1.25;
            if (keys["ArrowLeft"] || keys["a"]) {
                this.vx = -airSpeed;
                this.facing = -1;
                moving = true;
            } else if (keys["ArrowRight"] || keys["d"]) {
                this.vx = airSpeed;
                this.facing = 1;
                moving = true;
            }
            if (typeof particles !== "undefined" && Array.isArray(particles)) {
                particles.push({
                    x: this.x + this.w / 2 + (Math.random() - .5) * (this.w * .8),
                    y: this.y + this.h * .8,
                    vx: (Math.random() - .5) * 3 - this.vx * .15,
                    vy: Math.random() * 2 + 1,
                    life: 16 + Math.floor(Math.random() * 8),
                    maxLife: 24,
                    color: [ "#ff0000", "#ff4400", "#ff8800", "#ffea00" ][Math.floor(Math.random() * 4)],
                    size: 4 + Math.random() * 4,
                    type: "spark"
                });
                if (this.lavaBounceTimer % 2 === 0) {
                    particles.push({
                        x: this.x + this.w / 2 + (Math.random() - .5) * 10,
                        y: this.y + this.h * .3,
                        vx: (Math.random() - .5) * 2,
                        vy: -Math.random() * 2 - 1,
                        life: 24,
                        maxLife: 24,
                        color: "rgba(50, 40, 40, 0.7)",
                        size: 5 + Math.random() * 4,
                        type: "spark"
                    });
                }
            }
        }
        if (this.dashCooldown > 0) this.dashCooldown--;
        if (this.dashTrailT > 0) this.dashTrailT--;
        if (this.dashBufferTimer > 0) this.dashBufferTimer--;
        const wantDash = currentLevel !== 4 && (!game || !game.inHunt) && (keys["c"] || keys["C"] || keys["l"] || keys["L"] || this.dashBufferTimer > 0);
        const maxCharge = this.chargeLevel >= 4;
        if (wantDash && this.dashTimer <= 0 && this.dashCooldown <= 0 && !this.frozen) {
            this.dashBufferTimer = 0;
            if (maxCharge) {
                this.dashTimer = DASH_MAX_DURATION;
                this.dashCooldown = DASH_MAX_COOLDOWN;
                this.dashTrailT = DASH_MAX_TRAIL;
                this.dashDir = this.facing;
                this.invulnerable = Math.max(this.invulnerable, DASH_MAX_INVULN);
                this.dashMax = true;
                this.dashColor = "#00e5ff";
                this._dashHitBump++;
                this.charging = false;
                this.chargeLevel = 0;
                this.chargeTimer = 0;
                try {
                    applyShake(8);
                } catch (e) {}
                try {
                    if (typeof window.triggerHaptic === "function") window.triggerHaptic("medium");
                    if (typeof window.triggerGamepadRumble === "function") window.triggerGamepadRumble(130, 0.5, 0.5);
                } catch (e) {}
                try {
                    playSound(260, .2, "sawtooth", .3, 500);
                    playSFX("sfx_energy_dash");
                } catch (e) {}
                try {
                    const txt = typeof __ === "function" ? __("flt_energy_dash") : "⚡ ENERGY DASH ⚡";
                    addFloatingText(this.x + this.w / 2, this.y - 14, txt, "#00e5ff", 20);
                } catch (e) {}
                try {
                    createExplosion(this.x + this.w / 2, this.y + this.h / 2, "#00e5ff", 22, 14, [ "#00e5ff", "#ffffff", "#0088ff" ]);
                } catch (e) {}
                if (typeof window.onPlayerAttackLithium === "function") window.onPlayerAttackLithium();
            } else {
                this.dashTimer = DASH_DURATION;
                this.dashCooldown = DASH_COOLDOWN;
                this.dashTrailT = DASH_SHOW_TRAIL;
                this.dashDir = this.facing;
                this.invulnerable = Math.max(this.invulnerable, DASH_INVULN);
                this.dashMax = false;
                this.dashColor = "#9be7ff";
                this._normalDashBump = (this._normalDashBump || 0) + 1;
                try {
                    if (typeof window.triggerHaptic === "function") window.triggerHaptic("dash");
                    if (typeof window.triggerGamepadRumble === "function") window.triggerGamepadRumble(80, 0.3, 0.4);
                    playSound(500, .15, "sine", .22, 900);
                } catch (e) {}
                if (typeof window.onPlayerAttackLithium === "function") window.onPlayerAttackLithium();
            }
        }
        if (this.dashTimer > 0) {
            this.dashTimer--;
            if (this.dashTimer <= 0) {
                if (this.dashMax) {
                    try {
                        const cx = this.x + this.w / 2;
                        const cy = this.y + this.h / 2;
                        createExplosion(cx, cy, "#ff00e0", 35, 12, [ "#ff00e0", "#00ffff" ]);
                        try {
                            applyShake(5);
                        } catch (e) {}
                        try {
                            playSound(680, .2, "sawtooth", .3, 180);
                        } catch (e) {}
                    } catch (e) {}
                }
                this.dashTrailT = 0;
                this.dashMax = false;
            }
            if (this.dashMax) {
                this.vx = DASH_MAX_SPEED * this.dashDir;
                try {
                    const cx = this.x + this.w / 2;
                    const cy = this.y + this.h / 2;
                    if (this.dashTimer % 2 === 0) {
                        particles.push({
                            type: "ring",
                            x: cx - this.dashDir * 22,
                            y: cy,
                            radius: 8,
                            maxRadius: 75,
                            life: 14,
                            maxLife: 14,
                            lineWidth: 5,
                            color: this.dashTimer % 4 === 0 ? "#00ffff" : "#ff0077"
                        });
                    }
                    particles.push({
                        x: cx - this.dashDir * 14,
                        y: cy,
                        vx: -this.dashDir * 2.2,
                        vy: (Math.random() - .5) * 2.5,
                        life: 16,
                        maxLife: 16,
                        color: [ "#ff00e0", "#00ffff", "#ffd700", "#ff0055" ][Math.floor(Math.random() * 4)],
                        size: Math.max(this.w, this.h) * .75,
                        type: "afterimage"
                    });
                    for (let sp = 0; sp < 3; sp++) {
                        const ang = Math.random() * Math.PI * 2;
                        const spd = 4 + Math.random() * 6;
                        particles.push({
                            x: this.x + this.w / 2 + (Math.random() - .5) * this.w,
                            y: this.y + Math.random() * this.h,
                            vx: -this.dashDir * (3.5 + Math.random() * 3.5) + Math.cos(ang) * spd,
                            vy: (Math.random() - .5) * 5 + Math.sin(ang) * spd,
                            life: 12 + Math.random() * 10,
                            color: [ "#ff00e0", "#00ffff", "#ffff00", "#ffffff" ][Math.floor(Math.random() * 4)],
                            size: 3 + Math.random() * 3,
                            type: "spark"
                        });
                    }
                } catch (e) {}
            } else {
                this.vx = DASH_SPEED * this.dashDir;
            }
            moving = true;
        }
        if (!this.onGround && this.vy < 0) this.state = "jump"; else if (!this.onGround && this.vy >= 0) this.state = "fall"; else if (moving) this.state = "run"; else this.state = "idle";
        const hasInput = moving || wantDash || this.charging || (keys["x"] || keys["X"] || keys["j"] || keys["J"]) || (keys["z"] || keys["Z"] || keys[" "] || keys["k"] || keys["K"]) || (keys["ArrowUp"] || keys["w"] || keys["W"]) || !this.onGround;
        if (hasInput || window.postGameHorror) {
            this.afkTimer = 0;
            this.afkState = null;
            this.afkStateTimer = 0;
            this.afkPauseTimer = 0;
        } else if (this.state === "idle") {
            this.afkTimer++;
            if (this.afkState === null) {
                if (this.afkPauseTimer > 0) {
                    this.afkPauseTimer--;
                } else if (this.afkTimer >= 300) {
                    if (typeof window.isLithiumActive === "function" && window.isLithiumActive()) {
                        this.afkState = null;
                    } else {
                        this.afkState = Math.floor(Math.random() * 4) + 1;
                        this.afkStateTimer = 360;
                    }
                }
            } else {
                this.afkStateTimer--;
                const cx = this.x + this.w / 2;
                if (this.afkState === 1 && this.afkStateTimer % 22 === 0) {
                    particles.push({
                        x: cx + (Math.random() - .5) * 12,
                        y: this.y - 12,
                        vx: (Math.random() - .5) * .4,
                        vy: -1.2,
                        life: 48,
                        maxLife: 48,
                        type: "emoji",
                        text: [ "🎵", "🎶", "🎼" ][Math.floor(Math.random() * 3)],
                        size: 20,
                        sineWave: true
                    });
                } else if (this.afkState === 3 && this.afkStateTimer % 35 === 0) {
                    particles.push({
                        x: cx + (this.facing === 1 ? 14 : -14),
                        y: this.y - 6,
                        vx: .35,
                        vy: -.85,
                        life: 52,
                        maxLife: 52,
                        type: "emoji",
                        text: [ "💤", "🫧" ][Math.floor(Math.random() * 2)],
                        size: 18,
                        sineWave: true
                    });
                } else if (this.afkState === 4 && this.afkStateTimer % 65 === 0) {
                    particles.push({
                        x: cx + (this.facing === 1 ? 16 : -16),
                        y: this.y + 4,
                        vx: .5 * this.facing,
                        vy: -.3,
                        life: 40,
                        maxLife: 40,
                        type: "emoji",
                        text: "💨",
                        size: 16
                    });
                }
                if (this.afkStateTimer <= 0) {
                    this.afkState = null;
                    this.afkPauseTimer = 180;
                }
            }
        }
        this.animTimer++;
        if (this.state === "run") {
            if (this.animTimer % 6 === 0) this.animFrame = (this.animFrame + 1) % 4;
        } else if (this.state === "idle") {
            if (this.animTimer % 20 === 0) this.animFrame = (this.animFrame + 1) % 2;
        } else {
            this.animFrame = 0;
        }
        if ((!game || !game.inHunt) && (keys[" "] || keys["k"] || keys["K"])) {
            this.jumpBufferTimer = 8;
        }
        if (this.onGround) {
            this.coyoteTimer = 8;
        } else if (this.coyoteTimer > 0) {
            this.coyoteTimer--;
        }
        if (this.jumpBufferTimer > 0) {
            this.jumpBufferTimer--;
        }
        if ((!game || !game.inHunt) && this.jumpBufferTimer > 0 && this.coyoteTimer > 0 && !this.frozen) {
            this._jumpHeldAtStart = !!(keys[" "] || keys["z"] || keys["Z"] || keys["k"] || keys["K"]);
            let stormJumpMult = 1;
            if (currentLevel === 3 && game.stormMode && typeof window.getStormWind === "function") {
                const wind = window.getStormWind();
                if (wind.dir === "UP") stormJumpMult = 1.22; else if (wind.dir === "DOWN") stormJumpMult = .80;
            }
            this.vy = JUMP_FORCE * stormJumpMult;
            this.onGround = false;
            this.coyoteTimer = 0;
            this.jumpBufferTimer = 0;
            this.scaleX = .7;
            this.scaleY = 1.3;
            let freq = currentLevel >= 2 ? 150 : 350;
            playSound(freq, .2, currentLevel >= 2 ? "sawtooth" : "sine", .2, freq * 1.5);
            if (currentLevel === 0 && game.iceMode && this.currentPlatform) {
                const cp = this.currentPlatform;
                if (cp.y < 480 && !cp.moving && !cp.unbreakable) {
                    cp.jumpHits = (cp.jumpHits || 0) + 1;
                    if (cp.jumpHits >= 2) {
                        cp.broken = true;
                        playSound(300, .25, "sawtooth", .25, 80);
                        addFloatingText(cp.x + cp.w / 2, cp.y - 10, __("flt_roto"), "#00ffff", 16);
                        for (let i = 0; i < 20; i++) {
                            particles.push({
                                x: cp.x + Math.random() * cp.w,
                                y: cp.y + Math.random() * cp.h,
                                vx: (Math.random() - .5) * 6,
                                vy: (Math.random() - .5) * 6 - 2,
                                life: 20 + Math.random() * 15,
                                color: Math.random() < .5 ? "#00ffff" : "#ffffff",
                                size: 4 + Math.random() * 6,
                                type: "spark"
                            });
                        }
                    }
                }
            }
            if (currentLevel < 4 || currentLevel === 6 || currentLevel === "hub") {
                for (let i = 0; i < 6; i++) {
                    particles.push({
                        x: this.x + this.w / 2 + (Math.random() - .5) * 10,
                        y: this.y + this.h,
                        vx: (Math.random() - .5) * 2,
                        vy: -Math.random() * 3,
                        life: 15,
                        color: "#fff",
                        size: 3 + Math.random() * 4,
                        type: "spark"
                    });
                }
            }
        }
        const charging = (!game || !game.inHunt) && (keys["x"] || keys["X"] || keys["j"] || keys["J"]) && (currentLevel < 4 || currentLevel === 6 || currentLevel === "hub") && !this.frozen;
        const jumpHeld = keys[" "] || keys["k"] || keys["K"];
        if (!charging && this._jumpHeldAtStart && this._bounceGuard <= 0 && !jumpHeld && this.vy < -4) {
            this.vy *= .6;
        }
        this.scaleX += (1 - this.scaleX) * .15;
        this.scaleY += (1 - this.scaleY) * .15;
        if ((!game || !game.inHunt) && (keys["x"] || keys["X"] || keys["j"] || keys["J"]) && (currentLevel < 4 || currentLevel === 6 || currentLevel === "hub") && !this.frozen) {
            if (!this.charging) {
                this.charging = true;
                this.chargeTimer = 0;
                this.chargeLevel = 0;
            } else {
                this.chargeTimer++;
                let prevLevel = this.chargeLevel;
                if (this.chargeTimer >= 220) this.chargeLevel = 5;
                else if (this.chargeTimer >= 110) this.chargeLevel = 4;
                else if (this.chargeTimer >= 75) this.chargeLevel = 3;
                else if (this.chargeTimer >= 45) this.chargeLevel = 2;
                else if (this.chargeTimer >= 20) this.chargeLevel = 1;

                if (this.chargeLevel > prevLevel) {
                    applyShake(3 + this.chargeLevel * 3);
                    const pitch = 450 + this.chargeLevel * 220;
                    playSound(pitch, .22, "sine", .3, pitch + 300);
                    if (this.chargeLevel === 5) {
                        playSound(1100, .45, "sawtooth", .45, 1800);
                        applyShake(16);
                        const label = typeof __ === "function" ? __("flt_carga_max") : "💥 ¡NIVEL MAX! 💥";
                        addFloatingText(this.x + this.w / 2, this.y - 28, label, "#00ffff", 24);
                    } else {
                        const label = typeof __ === "function" ? __("flt_carga_level", this.chargeLevel) : `¡NIVEL ${this.chargeLevel}!`;
                        const color = [ "#ffffff", "#66ccff", "#00ffff", "#ffea00", "#ff0055", "#00ffff" ][this.chargeLevel];
                        addFloatingText(this.x + this.w / 2, this.y - 20, label, color, 16 + this.chargeLevel * 2);
                    }
                }
                if (this.chargeLevel === 5) {
                    if (this.chargeTimer % 10 === 0) {
                        applyShake(2);
                        try { playSound(180 + Math.random() * 160, .05, "sawtooth", .1, 400); } catch (e) {}
                    }
                    if (this.chargeTimer % 2 === 0 && typeof particles !== "undefined") {
                        const cx = this.x + this.w / 2;
                        const cy = this.y + this.h / 2;
                        const ang = Math.random() * Math.PI * 2;
                        const dist = 32 + Math.random() * 18;
                        const px = cx + Math.cos(ang) * dist;
                        const py = cy + Math.sin(ang) * dist;
                        particles.push({
                            x: px,
                            y: py,
                            vx: (cx - px) * .18 + (Math.random() - .5) * 2,
                            vy: (cy - py) * .18 + (Math.random() - .5) * 2,
                            life: 12,
                            maxLife: 12,
                            color: [ "#00ffff", "#ffffff", "#38bdf8", "#0284c7" ][Math.floor(Math.random() * 4)],
                            glow: 1,
                            size: 3 + Math.random() * 2,
                            type: "spark"
                        });
                    }
                } else if (this.chargeLevel > 0 && this.chargeTimer % 2 === 0) {
                    const hx = this.x + (this.facing === 1 ? this.w * 1.1 : -this.w * .1);
                    const hy = this.y + this.h * .55;
                    const ang = Math.random() * Math.PI * 2;
                    const dist = 16 + this.chargeLevel * 8;
                    const px = hx + Math.cos(ang) * dist;
                    const py = hy + Math.sin(ang) * dist;
                    const pCol = [ "#ffffff", "#66ccff", "#00ffff", "#ffea00", "#ff0055" ][this.chargeLevel];
                    particles.push({
                        x: px,
                        y: py,
                        vx: (hx - px) * .14,
                        vy: (hy - py) * .14,
                        life: 8,
                        maxLife: 8,
                        color: pCol,
                        glow: this.chargeLevel >= 3 ? 1 : 0,
                        size: 2.5,
                        type: "spark"
                    });
                }
            }
        } else if (this.charging) {
            this.fireChargedShot(keys);
            this.charging = false;
            this.chargeTimer = 0;
            this.chargeLevel = 0;
        }
        if (game.inHunt && (keys["x"] || keys["X"] || keys["j"] || keys["J"]) && this.slashCooldown <= 0 && !this.frozen) {
            this.slashCooldown = 24;
            const sx = this.x + (this.facing === 1 ? this.w : 0);
            const sy = this.y + this.h * .5;
            this.knifeShow = 12;
            slashes.push({
                x: sx,
                y: sy,
                facing: this.facing,
                t: 0
            });
            playSound(780, .12, "square", .25, 1600);
            game.flash = Math.max(game.flash, 8);
            for (let i = 0; i < 10; i++) {
                particles.push({
                    x: sx,
                    y: sy,
                    vx: (Math.random() - .5) * 9 - this.facing * 2,
                    vy: (Math.random() - .5) * 9,
                    life: 14,
                    maxLife: 14,
                    color: "#fff",
                    size: 5
                });
            }
            game.enemies.forEach(e => {
                if (!e.active) return;
                const inFront = this.facing === 1 ? e.x > this.x : e.x + e.w < this.x + this.w;
                const centerDist = Math.abs(e.x + e.w / 2 - (this.x + this.w / 2));
                if (inFront && centerDist < 210 && Math.abs(e.y + e.h / 2 - sy) < 110) {
                    const v = Math.min(8, (game.huntKills || 0) + 1);
                    const amount = 50 + v * 14;
                    for (let i = 0; i < amount; i++) {
                        blood.push({
                            x: e.x + e.w / 2,
                            y: e.y + e.h / 2,
                            vx: (Math.random() - .5) * (12 + v),
                            vy: (Math.random() - .5) * (12 + v) - 4,
                            life: 48,
                            color: "#b00"
                        });
                    }
                    const hh = e.h / 2;
                    restos.push({
                        x: e.x + e.w / 2,
                        y: e.y + hh / 2,
                        w: e.w,
                        h: hh,
                        color: e.color || "#ff6b6b",
                        part: "top",
                        groundY: e.y + e.h,
                        vx: this.facing * (3.8 + Math.random() * 2) + (Math.random() - .5) * 2,
                        vy: -(6.5 + Math.random() * 2.5),
                        rot: 0,
                        vRot: this.facing * (.18 + Math.random() * .12),
                        bounces: 0,
                        settled: false,
                        poolRadius: 0
                    });
                    restos.push({
                        x: e.x + e.w / 2,
                        y: e.y + hh + hh / 2,
                        w: e.w,
                        h: hh,
                        color: e.color || "#ff6b6b",
                        part: "bottom",
                        groundY: e.y + e.h,
                        vx: -this.facing * (1.2 + Math.random() * 1.5),
                        vy: -(3.5 + Math.random() * 1.5),
                        rot: 0,
                        vRot: -this.facing * (.1 + Math.random() * .08),
                        bounces: 0,
                        settled: false,
                        poolRadius: 0
                    });
                    createExplosion(e.x + e.w / 2, e.y + e.h / 2, "#a00", 20 + v * 4, 10 + v * 2);
                    playSound(90, .5, "sawtooth", .35, 30);
                    applyShake(5 + v * 2);
                    e.health = 0;
                    e.active = false;
                }
            });
        }
        if (this.slashCooldown > 0) this.slashCooldown--;
        if (this.knifeShow > 0) this.knifeShow--;
        if ((this._knockbackTimer || 0) > 0) {
            this._knockbackTimer--;
            this.vx = this._knockbackVx || 0;
            this._knockbackVx = (this._knockbackVx || 0) * 0.84;
            if (Math.abs(this._knockbackVx) < 0.25) this._knockbackVx = 0;
        }
        this.vy += GRAVITY;
        if (this.vy > 18) this.vy = 18;
        const prevX = this.x;
        const prevY = this.y;
        this.x += this.vx;
        this.y += this.vy;
        if (Array.isArray(platforms)) {
            for (let i = 0; i < platforms.length; i++) {
                const pl = platforms[i];
                if (pl.broken || pl.dashBlock) continue;
                if (pl.isGateObstacle) {
                    const isG1 = pl.isGateObstacle === 1;
                    const isGOpen = isG1 ? typeof game !== "undefined" && game.gate1Open : typeof game !== "undefined" && game.gate2Open;
                    if (!isGOpen || pl.y > pl.originY - 350) {
                        if (this.x + this.w > pl.x && this.x < pl.x + pl.w && this.y + this.h > pl.y && this.y < pl.y + pl.h + 20) {
                            if (this.x + this.w / 2 < pl.x + pl.w / 2) {
                                this.x = pl.x - this.w;
                            } else {
                                this.x = pl.x + pl.w;
                            }
                            this.vx = 0;
                            if (this.dashTimer > 0) {
                                this.dashTimer = 0;
                                try {
                                    playSound(180, .15, "square", .25, 80);
                                } catch (e) {}
                                if (typeof createExplosion === "function") {
                                    createExplosion(this.x + (this.vx >= 0 ? this.w : 0), this.y + this.h / 2, "#ffffff", 8, 4);
                                }
                            }
                        }
                    }
                    continue;
                }
                if ((pl.isArenaGate || pl.isTreeArenaGate) && pl.y > (pl.originY || -250) + 30) {
                    if (this.x + this.w > pl.x && this.x < pl.x + pl.w && this.y + this.h > -9999 && this.y < pl.y + pl.h + 50) {
                        if (this.x + this.w / 2 < pl.x + pl.w / 2) {
                            this.x = pl.x - this.w;
                        } else {
                            this.x = pl.x + pl.w;
                        }
                        this.vx = 0;
                        if (this.dashTimer > 0) this.dashTimer = 0;
                    }
                    continue;
                }
            }
        }
        if (this.dashMax && this.dashTimer > 0 && game.enemies) {
            for (let i = 0; i < game.enemies.length; i++) {
                const e = game.enemies[i];
                if (!e.active || e.type === "electric_cross") continue;
                if (e._dashMark === this._dashHitBump) continue;
                if (this.x + this.w > e.x && this.x < e.x + e.w && this.y + this.h > e.y && this.y < e.y + e.h) {
                    e._dashMark = this._dashHitBump;
                    try {
                        e.takeDamage(__godDmg(120));
                    } catch (err) {}
                    try {
                        if (typeof e.x === "number") e.x += this.dashDir * 20;
                    } catch (err) {}
                    try {
                        applyShake(10);
                    } catch (err) {}

                    try {
                        createExplosion(e.x + e.w / 2, e.y + e.h / 2, "#00e5ff", 24, 16, [ "#00e5ff", "#ffffff", "#ffd700" ]);
                        playSound(180, .25, "sawtooth", .3, 150);
                        playSFX("sfx_rock_impact");
                        if (typeof window.triggerHaptic === "function") window.triggerHaptic("rock");
                        if (typeof particles !== "undefined") {
                            particles.push({ type: "ring", x: e.x + e.w / 2, y: e.y + e.h / 2, radius: 8, maxRadius: 80, life: 14, maxLife: 14, lineWidth: 4, color: "#00e5ff" });
                        }
                        addFloatingText(e.x + e.w / 2, e.y - 18, typeof __ === "function" ? __("flt_energy_dash_hit") : "¡ENERGY DASH!", "#00e5ff", 20);
                    } catch (err) {}
                }
            }
        }
        if (this.dashMax && this.dashTimer > 0) {
            const dmgBump = this._dashHitBump;
            const markHit = o => {
                if (!o || o._dashMark === dmgBump) return false;
                o._dashMark = dmgBump;
                try {
                    applyShake(14);
                    playSound(200, .3, "sawtooth", .4, 100);
                    playSFX("sfx_rock_impact");
                    if (typeof window.triggerHaptic === "function") window.triggerHaptic("rock");
                    createExplosion(this.x + this.w / 2, this.y + this.h / 2, "#00e5ff", 28, 20, [ "#00e5ff", "#ffffff", "#ffd700" ]);
                    if (typeof particles !== "undefined") {
                        particles.push({ type: "ring", x: this.x + this.w / 2, y: this.y + this.h / 2, radius: 10, maxRadius: 100, life: 16, maxLife: 16, lineWidth: 5, color: "#00e5ff" });
                    }
                    addFloatingText(this.x + this.w / 2, this.y - 20, typeof __ === "function" ? __("flt_energy_dash_hit") : "¡ENERGY DASH!", "#00e5ff", 22);
                } catch (ex) {}
                return true;
            };
            const touch = (ox, oy, ow, oh) => this.x + this.w > ox && this.x < ox + ow && this.y + this.h > oy && this.y < oy + oh;
            try {
                const bs = game.blueSquare;
                if (bs && bs.state === "boss_fight" && touch(bs.x, bs.y, bs.w, bs.h) && markHit(bs)) {
                    bs._dashPendingDmg = (bs._dashPendingDmg || 0) + __godDmg(20);
                }
            } catch (e) {}
            try {
                const ys = game.yellowSquare;
                if (ys && ys.state === "boss_fight" && touch(ys.x, ys.y, ys.w, ys.h) && markHit(ys)) {
                    ys._dashPendingDmg = (ys._dashPendingDmg || 0) + __godDmg(20);
                }
            } catch (e) {}
            try {
                const tb = game.techBoss;
                if (tb && tb.state === "fighting" && tb.vulnerable && tb.turnPhase === "player_turn" && touch(tb.x, tb.y, tb.w, tb.h) && markHit(tb)) {
                    tb._dashPendingDmg = (tb._dashPendingDmg || 0) + __godDmg(26);
                }
            } catch (e) {}
            try {
                if (window.ValkyrieBoss && window.ValkyrieBoss.boss && window.ValkyrieBoss.boss.alive) {
                    const vb = window.ValkyrieBoss.boss;
                    if (touch(vb.x, vb.y, vb.width, vb.height) && markHit(vb)) {
                        vb.takeDamage(__godDmg(35), "normal");
                    }
                }
            } catch (e) {}
            try {
                const kk = game.krakatoa;
                if (kk && kk.state === "stunned" && kk.y < 460 && touch(kk.hitX, kk.hitY, kk.hitW, kk.hitH) && markHit(kk)) {
                    kk.takeDamage(__godDmg(40), 3);
                }
            } catch (e) {}
            try {
                if (window.TurretSystem && Array.isArray(window.TurretSystem.turrets)) {
                    for (const t of window.TurretSystem.turrets) {
                        if (!t || t._alive === false || t._buried) continue;
                        const trad = (t.baseRadius || 36) * (t.scale || 1);
                        const tx1 = t.x - trad, tx2 = t.x + trad;
                        const ty1 = t.y - trad, ty2 = t.y + trad;
                        if (this.x + this.w > tx1 && this.x < tx2 && this.y + this.h > ty1 && this.y < ty2 && markHit(t)) {
                            t._dashPendingDmg = (t._dashPendingDmg || 0) + __godDmg(120);
                            if (typeof t.takeDamage === "function") {
                                t.takeDamage(__godDmg(120), "energy");
                            }
                        }
                    }
                }
            } catch (e) {}
            try {
                if (window.HalloweenSystem && typeof window.HalloweenSystem.getRebornGhosts === "function") {
                    const rGhosts = window.HalloweenSystem.getRebornGhosts();
                    if (Array.isArray(rGhosts)) {
                        for (const g of rGhosts) {
                            if (!g || !g.active) continue;
                            if (touch(g.x, g.y, g.w, g.h) && markHit(g)) {
                                if (typeof window.HalloweenSystem.takeGhostDamage === "function") {
                                    window.HalloweenSystem.takeGhostDamage(g, 175);
                                } else {
                                    g.health = 0;
                                    g.active = false;
                                }
                            }
                        }
                    }
                }
            } catch (e) {}
        }
        if (!this.dashMax && this.dashTimer > 0 && game.enemies) {
            for (let i = 0; i < game.enemies.length; i++) {
                const e = game.enemies[i];
                if (!e.active || e.type === "electric_cross") continue;
                if (e._normalDashMark === this._normalDashBump) continue;
                if (this.x + this.w > e.x && this.x < e.x + e.w &&
                    this.y + this.h > e.y && this.y < e.y + e.h) {
                    e._normalDashMark = this._normalDashBump;
                    const _area = e.w * e.h;
                    const _isBoss = e.isBoss || e.isMiniBoss || e.miniBoss || e.isGiant || e.giant ||
                        e.type === "miniboss" || e.type === "daisy_flower" || e.type === "mega_snowman" ||
                        e.type === "giant_snowman" || e.type === "magma_titan" || e.type === "bubble_tree" ||
                        (e.w >= 64 && e.h >= 64);
                    if (_isBoss) {
                        const _bossDir = (this.x + this.w / 2) < (e.x + e.w / 2) ? -1 : 1;
                        this._knockbackVx = _bossDir * 15;
                        this._knockbackTimer = 22;
                        this.vx = _bossDir * 15;
                        this.vy = -7;
                        this.onGround = false;
                        this.dashTimer = 0;
                        try { applyShake(10); } catch (_) {}
                        try {
                            createExplosion(e.x + e.w / 2, e.y + e.h / 2, "#ff6600", 16, 10, ["#ff8800", "#ffea00", "#ffffff"]);
                            playSound(130, .35, "sawtooth", .35, 45);
                            addFloatingText(e.x + e.w / 2, e.y - 20, typeof __ === "function" ? __("ui_repelido") : "¡REPELIDO!", "#ff9900", 18);
                        } catch (_) {}
                    } else {
                        const _dmg = Math.min(22, Math.max(6, Math.round(6 + _area / 1000)));
                        try { e.takeDamage(__godDmg(_dmg)); } catch (_) {}
                        const _isStunImmune = e.type === "ghost" || e.type === "igneous_turret" || e.isTurret || e.isGhost || e.immuneToStun || false;
                        if (!_isStunImmune) {
                            const _stunDur = Math.max(40, Math.min(160, Math.round(160 - _area / 80)));
                            const _kbX = Math.min(10, 4 + _area / 2000);
                            e.stunTimer = _stunDur;
                            e.stunKbX   = this.dashDir * _kbX;
                            e.stunKbY   = -3;
                            e._stunAngle = 0;
                            e.isStunAscending = false;
                        } else {
                            e.stunTimer = 0;
                            e.stunKbX = 0;
                            e.stunKbY = 0;
                        }
                        try {
                            if (typeof triggerDashHitImpact === "function") {
                                triggerDashHitImpact(e.x + e.w / 2, e.y + e.h / 2, false);
                            } else {
                                createExplosion(e.x + e.w / 2, e.y + e.h / 2, "#ffea00", 12, 8, ["#ffea00","#ffffff","#ffaa00"]);
                                playSound(420, .18, "sawtooth", .22, 180);
                            }
                            addFloatingText(e.x + e.w / 2, e.y - 14, typeof __ === "function" ? __("flt_dash_hit") : "¡GOLPE!", "#ffea00", 15);
                        } catch (_) {}
                    }
                }
            }
        }
        if (!this.dashMax && this.dashTimer > 0 && window.TurretSystem && Array.isArray(window.TurretSystem.turrets)) {
            for (const t of window.TurretSystem.turrets) {
                if (!t || t._alive === false || t._buried) continue;
                if (t._normalDashMark === this._normalDashBump) continue;
                const trad = (t.baseRadius || 36) * (t.scale || 1);
                const tx1 = t.x - trad, tx2 = t.x + trad;
                const ty1 = t.y - trad, ty2 = t.y + trad;
                if (this.x + this.w > tx1 && this.x < tx2 && this.y + this.h > ty1 && this.y < ty2) {
                    t._normalDashMark = this._normalDashBump;
                    const dmg = 24;
                    if (typeof t.takeDamage === "function") {
                        t.takeDamage(__godDmg(dmg), "normal");
                    }
                    try {
                        if (typeof triggerDashHitImpact === "function") {
                            triggerDashHitImpact(t.x, t.y, false);
                        } else {
                            createExplosion(t.x, t.y, "#ffea00", 16, 10, ["#ffea00", "#ffffff", "#00ffff"]);
                            playSound(420, .18, "sawtooth", .22, 180);
                        }
                        addFloatingText(t.x, t.y - trad - 15, typeof __ === "function" ? __("flt_dash_hit") : "¡GOLPE!", "#ffea00", 16);
                    } catch (_) {}
                }
            }
        }
        if (!this.dashMax && this.dashTimer > 0 && window.HalloweenSystem && typeof window.HalloweenSystem.getRebornGhosts === "function") {
            const rGhosts = window.HalloweenSystem.getRebornGhosts();
            if (Array.isArray(rGhosts)) {
                for (const g of rGhosts) {
                    if (!g || !g.active) continue;
                    if (g._normalDashMark === this._normalDashBump) continue;
                    if (this.x + this.w > g.x && this.x < g.x + g.w && this.y + this.h > g.y && this.y < g.y + g.h) {
                        g._normalDashMark = this._normalDashBump;
                        const dmg = 20;
                        if (typeof window.HalloweenSystem.takeGhostDamage === "function") {
                            window.HalloweenSystem.takeGhostDamage(g, dmg);
                        } else {
                            g.health = 0;
                            g.active = false;
                        }
                        try {
                            if (typeof triggerDashHitImpact === "function") {
                                triggerDashHitImpact(g.x + g.w / 2, g.y + g.h / 2, false);
                            }
                            addFloatingText(g.x + g.w / 2, g.y - 14, typeof __ === "function" ? __("flt_dash_hit") : "¡GOLPE!", "#ffffff", 16);
                        } catch (_) {}
                    }
                }
            }
        }
        if (platforms && Array.isArray(platforms)) {
            const pxMin = this.x - 120, pxMax = this.x + this.w + 120;
            for (let plat of platforms) {
                if (plat.x > pxMax || plat.x + plat.w < pxMin) continue;
                if (!plat.dashBlock || plat.broken) continue;
                if (plat._hitCooldown > 0) plat._hitCooldown--;
                if (plat._dashImpactCd > 0) plat._dashImpactCd--;
                if (this.x + this.w > plat.x && this.x < plat.x + plat.w && this.y + this.h > plat.y && this.y < plat.y + plat.h) {
                    const isEnergyDash = this.dashMax && this.dashTimer > 0;
                    if (isEnergyDash) {
                        if ((plat._dashImpactCd || 0) <= 0) {
                            plat._dashImpactCd = 30;
                            plat._dashImpacts = (plat._dashImpacts || 0) + 1;
                            plat.maybeSpawnEnemies();
                            if (plat._dashImpacts >= (plat.dashHits || 1)) {
                                plat.shatter(this);
                            } else {
                                plat.crack(this);
                            }
                        }
                        if (!plat.broken) {
                            if (this.x + this.w / 2 < plat.x + plat.w / 2) {
                                this.x = plat.x - this.w;
                            } else {
                                this.x = plat.x + plat.w;
                            }
                            this.vx = 0;
                            this.dashTimer = 0;
                            this.charging = false;
                        }
                    } else {
                        if (this.x + this.w / 2 < plat.x + plat.w / 2) {
                            this.x = plat.x - this.w;
                            } else {
                            this.x = plat.x + plat.w;
                        }
                        this.vx = 0;
                        if ((plat._hitCooldown || 0) <= 0) {
                            plat._hitCooldown = 35;
                            playSound(420, .12, "sawtooth", .2, 180);
                            addFloatingText(plat.x + plat.w / 2, plat.y - 16, typeof __ === "function" ? __("flt_requiere_edash") : "REQUIERE ENERGY DASH (C + Carga)", "#ff00a0", 15);
                            for (let k = 0; k < 8; k++) {
                                particles.push({
                                    x: this.facing === 1 ? plat.x : plat.x + plat.w,
                                    y: this.y + this.h / 2 + (Math.random() - .5) * 20,
                                    vx: -this.facing * (2 + Math.random() * 3),
                                    vy: (Math.random() - .5) * 4,
                                    life: 14,
                                    color: "#ff007f",
                                    size: 3,
                                    type: "spark"
                                });
                            }
                        }
                    }
                }
            }
        }
        if (!game.freeRoam && !game.subCaveMode && !(currentLevel === 0 && this.x >= 27950 && this.x <= 34e3)) {
            if (this.x < 0) this.x = 0;
            if (this.x + this.w > worldWidth) this.x = worldWidth - this.w;
        }
        if (currentLevel === 0 && (game.subCaveMode || this.x >= 27900 && this.x <= 34e3)) {
            const caveWallLeft = 28030;
            const caveWallRight = 33650;
            if (this.x < caveWallLeft) {
                this.x = caveWallLeft;
                this.vx = 0;
                if (this.dashTimer > 0) this.dashTimer = 0;
            }
            if (this.x + this.w > caveWallRight) {
                this.x = caveWallRight - this.w;
                this.vx = 0;
                if (this.dashTimer > 0) this.dashTimer = 0;
            }
            if (this.y < 20) {
                this.y = 20;
                if (this.vy < 0) this.vy = 0;
            }
        }
        if (game.arenaLocked) {
            if (this.x < game.arenaMinX) {
                this.x = game.arenaMinX;
                this.vx = 0;
                if (this.dashTimer > 0) this.dashTimer = 0;
            }
            if (this.x + this.w > game.arenaMaxX) {
                this.x = game.arenaMaxX - this.w;
                this.vx = 0;
                if (this.dashTimer > 0) this.dashTimer = 0;
            }
        }
        if (game.isHub || currentLevel === "hub") {
            const wallLeft = 80;
            const wallRight = (typeof worldWidth !== "undefined" && worldWidth > 80) ? (worldWidth - 80) : 2220;
            if (this.x < wallLeft) {
                this.x = wallLeft;
                this.vx = 0;
                if (this.dashTimer > 0) this.dashTimer = 0;
            }
            if (this.x + this.w > wallRight) {
                this.x = wallRight - this.w;
                this.vx = 0;
                if (this.dashTimer > 0) this.dashTimer = 0;
            }
        }
        if (currentLevel === 4 && !game.inHunt) {
            if (this.x < 10) this.x = 10;
            if (this.x + this.w > worldWidth - 10) this.x = worldWidth - this.w - 10;
        }
        if (currentLevel === 4 && (game.lvl4State === "blackout" || game.lvl4State === "dread") && this.x < 1400) this.x = 1400;
        if (game.lvl4State === "walk_right" && this.x < 40) this.x = 40;
        if (game.lvl4State === "final_escape" && this.x < cameraX + 20) this.x = cameraX + 20;
        if (game.lvl4State === "run_to_door" && this.x < 260) this.x = 260;
        let wasOnGround = this.onGround;
        this.onGround = false;
        this.currentPlatform = null;
        if (game.lvl4State !== "falling" && platforms && Array.isArray(platforms)) {
            const pxMin = this.x - 250, pxMax = this.x + this.w + 250;
            for (let plat of platforms) {
                if (plat.x > pxMax || plat.x + plat.w < pxMin) continue;
                if (plat.broken || plat.dashBlock || plat.isGateObstacle || plat.isArenaGate || plat.isTreeArenaGate) continue;
                if (plat.spikes && (currentLevel < 4 || currentLevel === 6 || currentLevel === "hub")) {
                    if (this.x + this.w > plat.x && this.x < plat.x + plat.w && this.y + this.h > plat.y && this.y < plat.y + plat.h && this.vy >= 0) {
                        this.y = plat.y - this.h;
                        this.vy = -17;
                        this.onGround = false;
                        this._jumpHeldAtStart = false;
                        this._bounceGuard = 25;
                        this.scaleX = .55;
                        this.scaleY = 1.5;
                        this.takeDamage(26);
                        try {
                            playSound(160, .45, "sawtooth", .4, 70);
                            playSound(420, .35, "sine", .3, 160);
                        } catch (e) {}
                        if (typeof createExplosion === "function") {
                            createExplosion(this.x + this.w / 2, plat.y, "#cc0000", 32, 22, [ "#ff1100", "#ff4444", "#ffaaaa", "#ffffff", "#333333" ]);
                        }
                        addFloatingText(this.x + this.w / 2, this.y - 18, typeof __ === "function" ? __("flt_hay_pinchos") : "¡HAY PINCHOS!", "#ff3333", 20);
                    }
                }
                if (plat.lava && (currentLevel < 4 || currentLevel === 6 || currentLevel === "hub")) {
                    if (this.x + this.w > plat.x && this.x < plat.x + plat.w && this.y + this.h >= plat.y && this.y < plat.y + plat.h + 80) {
                        this.y = plat.y - this.h;
                        this.vy = -17;
                        this.onGround = false;
                        this._jumpHeldAtStart = false;
                        this._bounceGuard = 25;
                        this.lavaBounceTimer = 75;
                        this.scaleX = .55;
                        this.scaleY = 1.5;
                        this.takeDamage(30);
                        try {
                            playSound(160, .45, "sawtooth", .4, 70);
                            playSound(420, .35, "sine", .3, 160);
                        } catch (e) {}
                        if (typeof createExplosion === "function") {
                            createExplosion(this.x + this.w / 2, plat.y, "#ff4500", 32, 22, [ "#ff1100", "#ff6600", "#ffea00", "#ffffff", "#333333" ]);
                        }
                        addFloatingText(this.x + this.w / 2, this.y - 18, typeof __ === "function" ? __("flt_quema") : "¡QUEMA! ¡QUEMA!", "#ff3300", 20);
                    }
                    continue;
                }
                if (this.vy >= 0 && this.x + this.w > plat.x && this.x < plat.x + plat.w && this.y + this.h >= plat.y && this.y + this.h <= plat.y + plat.h + this.vy + 8) {
                    this.y = plat.y - this.h;
                    if (plat.notches && plat.notches.length > 0) {
                        const pMidX = this.x + this.w / 2;
                        for (let n of plat.notches) {
                            const nWorldX = plat.x + n.relX;
                            const dist = Math.abs(pMidX - nWorldX);
                            if (dist < n.w / 2) {
                                const dip = Math.cos((dist / (n.w / 2)) * Math.PI * 0.5) * (n.depth * 0.65);
                                this.y += dip;
                                break;
                            }
                        }
                    }
                    this.onGround = true;
                    this.currentPlatform = plat;
                    if (this.lavaBounceTimer > 0) {
                        this.lavaBounceTimer = 0;
                        addFloatingText(this.x + this.w / 2, this.y - 12, __("flt_a_salvo"), "#00ff88", 16);
                    }
                    if (plat.trampoline) {
                        this.vy = -18.5;
                        this.onGround = false;
                        this._jumpHeldAtStart = false;
                        this._bounceGuard = 6;
                        this.scaleX = .6;
                        this.scaleY = 1.4;
                        playSound(700, .25, "sine", .3, 1400);
                        addFloatingText(plat.x + plat.w / 2, plat.y - 20, __("flt_super_salto"), "#00ffff", 18);
                        createExplosion(plat.x + plat.w / 2, plat.y, "#00ffff", 20, 12, [ "#ffffff", "#0088ff" ]);
                    } else {
                        if (!wasOnGround && this.lastVy > 3) {
                            this.scaleX = 1.35;
                            this.scaleY = .65;
                            if (typeof applyShake === "function" && this.lastVy > 6) {
                                applyShake(Math.min(4, this.lastVy * 0.3));
                            }
                            playSound(200, .1, "triangle", .1);
                            if (currentLevel < 4 || currentLevel === 6 || currentLevel === "hub") {
                                for (let i = 0; i < 12; i++) {
                                    particles.push({
                                        x: this.x + this.w / 2 + (Math.random() - .5) * 18,
                                        y: this.y + this.h - 2,
                                        vx: (Math.random() - .5) * 4,
                                        vy: -Math.random() * 2,
                                        life: 14 + Math.random() * 10,
                                        color: "rgba(255,255,255,0.7)",
                                        size: 3 + Math.random() * 4,
                                        type: "spark"
                                    });
                                }
                            }
                        }
                        this.vy = 0;
                    }
                }
            }
        }
        if (currentLevel === 3 && this.y >= 505 && !this.dead && !this.frozen) {
            createExplosion(this.x + this.w / 2, 500, "#06b6d4", 24, 16, [ "#00ffff", "#ffffff", "#38bdf8" ]);
            playSound(180, .3, "sine", .2, 50);
            this.takeDamage(26);
            if (!this.dead) {
                let safeX = currentCheckpoint && currentCheckpoint.level === 3 ? currentCheckpoint.x : 100;
                let safeY = currentCheckpoint && currentCheckpoint.level === 3 ? currentCheckpoint.y : 360;
                if (typeof window.isBoatTraveling === "function" && window.isBoatTraveling()) {
                    const bSafe = window.getBoatSafeRespawn();
                    safeX = bSafe.x;
                    safeY = bSafe.y;
                }
                if (game.krakatoa && game.krakatoa.state !== "idle" && game.krakatoa.state !== "defeated" && this.x > 22100 && this.x < 23500) {
                    safeX = 22350;
                    safeY = 360;
                }
                this.x = safeX;
                this.y = safeY;
                this.vx = 0;
                this.vy = -3;
                this.onGround = true;
                addFloatingText(this.x + this.w / 2, this.y - 15, typeof __ === "function" ? __("ui_agua_profunda") : "AGUA PROFUNDA", "#38bdf8", 15);
            }
        }
        if (currentLevel === 0 && !game.gate2Open && !game.subCaveMode && !game.subCaveTransitioning && game.cavernEntranceBlown) {
            if (this.x >= 7300 && this.x <= 7440 && this.y > 515) {
                if (typeof window.triggerSubCaveFall === "function") {
                    window.triggerSubCaveFall();
                }
            }
        }
        const maxFallLimit = VIEW_H + (game.subCaveTransitioning ? 220 : 100);
        if (this.y > maxFallLimit && !(currentLevel === 4 && (game.lvl4State === "falling" || game.lvl4State === "companion" || game.lvl4State === "meta" || game.inHunt || game.lvl4State === "hunt"))) this.takeDamage(100);
        if (this.invulnerable > 0) this.invulnerable--;
        if ((currentLevel < 4 || currentLevel === 6 || currentLevel === "hub") && this.state === "run" && this.onGround) {
            if (this.animTimer % 2 === 0) {
                particles.push({
                    x: this.x + (this.facing === 1 ? 0 : this.w),
                    y: this.y + this.h - 4,
                    vx: (this.facing === 1 ? -1 : 1) * .5,
                    vy: -.5,
                    life: 12,
                    color: "rgba(255,255,255,0.4)",
                    size: 3,
                    type: "spark"
                });
            }
        }
        if (this.dashTrailT > 0) {
            if (this.dashMax) {
                for (let i = 0; i < 6; i++) {
                    particles.push({
                        x: this.x + (this.dashDir === 1 ? 0 : this.w) + (Math.random() - .5) * 8,
                        y: this.y + this.h * .5 + (Math.random() - .5) * this.h,
                        vx: (this.dashDir === 1 ? -1 : 1) * (2 + Math.random() * 3),
                        vy: (Math.random() - .5) * 3,
                        life: 12 + Math.random() * 8,
                        color: [ "#ff0055", "#00ffff", "#ffffff", "#ffd700" ][Math.floor(Math.random() * 4)],
                        size: 3 + Math.random() * 4,
                        type: "spark"
                    });
                }
            } else {
                for (let i = 0; i < 3; i++) {
                    particles.push({
                        x: this.x + (this.dashDir === 1 ? 0 : this.w) + (Math.random() - .5) * 6,
                        y: this.y + this.h * .5 + (Math.random() - .5) * this.h,
                        vx: (this.dashDir === 1 ? -1 : 1) * (1 + Math.random() * 2),
                        vy: (Math.random() - .5) * 1.5,
                        life: 10 + Math.random() * 6,
                        color: Math.random() < .7 ? "#9be7ff" : "#7fd1ff",
                        size: 4 + Math.random() * 4,
                        type: "spark"
                    });
                }
            }
        }
        this.trail.unshift({
            x: this.x,
            y: this.y,
            sx: this.scaleX,
            sy: this.scaleY
        });
        if (this.trail.length > 5) this.trail.pop();
    }
    shoot(keys) {
        this.fireChargedShot(keys);
    }
    fireChargedShot(keys) {
        let dirX = 0, dirY = 0;
        if (keys["ArrowUp"] || keys["w"] || keys["W"]) {
            dirY = -1;
            dirX = 0;
        } else if (keys["ArrowDown"] || keys["s"] || keys["S"]) {
            dirY = 1;
            dirX = 0;
        } else {
            dirX = this.facing;
            dirY = 0;
        }
        const lvl = this.chargeLevel || 0;
        if (lvl === 5) {
            if (typeof window.triggerHaptic === "function") window.triggerHaptic("shoot4");
            if (typeof window.fireKamehamehaBeam === "function") {
                window.fireKamehamehaBeam(this, dirX, dirY);
            }
            if (typeof window.onPlayerAttackLithium === "function") {
                window.onPlayerAttackLithium();
            }
            return;
        }
        const baseDamage = [ 10, 20, 35, 72, 105 ][lvl];
        const scale = [ 1, 1.5, 2.2, 3, 4 ][lvl];
        const pColor = lvl === 4 ? "#ff0055" : lvl >= 2 ? "#00ffff" : currentLevel === 0 ? "#00e5ff" : "#66ccff";
        const w = (dirX !== 0 ? 14 : 10) * scale;
        const h = (dirY !== 0 ? 14 : 10) * scale;
        const offset = dirX === 1 ? this.w : dirX === -1 ? -w : 0;
        projectiles.push({
            x: this.x + (dirX !== 0 ? offset : this.w / 2 - w / 2),
            y: this.y + (dirY !== 0 ? dirY > 0 ? this.h : -h : this.h / 2 - h / 2),
            w: w,
            h: h,
            vx: dirX * (PROJECTILE_SPEED + lvl * 1.5),
            vy: dirY * (PROJECTILE_SPEED + lvl * 1.5),
            color: pColor,
            damage: baseDamage,
            chargeLevel: lvl,
            trail: []
        });
        if (lvl > 0) {
            applyShake(4 + lvl * 4);
            playSound(220 + lvl * 160, .25, "sawtooth", .35, 600 + lvl * 180);
            if (lvl >= 4) {
                if (typeof window.triggerHaptic === "function") window.triggerHaptic("shoot4");
                try {
                    playSFX("sfx_max_charge_shot");
                } catch (e) {}
            }
        } else {
            playSound(currentLevel >= 2 ? 300 : 600, .1, "square", .1, 400);
        }
        if (typeof window.onPlayerAttackLithium === "function") {
            window.onPlayerAttackLithium();
        }
    }
    takeDamage(amount) {
        if (game.godMode) return;
        if (this.invulnerable > 0 || this.frozen) return;
        const dmgMult = typeof PLAYER_DAMAGE_MULT !== "undefined" ? PLAYER_DAMAGE_MULT : 1;
        this.health -= Math.max(1, Math.round(amount * dmgMult));
        this.invulnerable = 40;
        applyShake(10);
        playSound(150, .4, "sawtooth", .3, 100);
        if (typeof window.triggerHaptic === "function") {
            window.triggerHaptic("damage");
        }
        if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
            try {
                navigator.vibrate([70, 45, 110]);
            } catch (e) {}
        }
        if (typeof window.triggerGamepadRumble === "function") {
            try {
                window.triggerGamepadRumble(240, 0.9, 0.7);
            } catch (e) {}
        }
        if (typeof window.onPlayerHurtLithium === "function") {
            window.onPlayerHurtLithium();
        }
        if (typeof window.updateHealthUI === "function") {
            window.updateHealthUI(this.health, PLAYER_MAX_HEALTH);
        } else if (typeof healthFill !== "undefined" && typeof gsap !== "undefined") {
            gsap.to(healthFill, {
                width: Math.max(0, this.health / PLAYER_MAX_HEALTH * 100) + "%",
                duration: .3
            });
        }
        if (currentLevel < 4 || currentLevel === 6 || currentLevel === "hub") {
            for (let i = 0; i < 15; i++) {
                blood.push({
                    x: this.x + this.w / 2 + (Math.random() - .5) * 20,
                    y: this.y + this.h / 2 + (Math.random() - .5) * 20,
                    vx: (Math.random() - .5) * 6,
                    vy: (Math.random() - .5) * 6 - 2,
                    life: 30,
                    color: "#f44"
                });
            }
        }
        if (this.health <= 0) {
            this.health = 0;
            stopAllSFX();
            createExplosion(this.x, this.y, "#ff66aa", 50, 30);
            if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
                try {
                    navigator.vibrate([ 180, 80, 220 ]);
                } catch (e) {}
            }
            if (typeof window.handlePlayerDefeat === "function") {
                window.handlePlayerDefeat();
            } else {
                gameState = "gameOver";
                setTimeout(() => {
                    window.showGameOverModal();
                }, 600);
            }
        }
    }
    draw(ctx, offsetX) {
        if (ctx && ctx.isDummy) return;
        if (this.hidden || this.eaten || (typeof game !== "undefined" && game && game.snowballActive)) return;
        ctx.globalAlpha = this.alpha != null ? this.alpha : 1;
        if (this.electricShockTimer <= 0 && this.lavaBounceTimer <= 0 && this.invulnerable > 0 && Math.floor(this.invulnerable / 4) % 2 === 0) return;
        const isPeggy = currentLevel === "hub" || typeof game !== "undefined" && game.isHub || typeof currentLevel === "number" && (currentLevel <= 4 || currentLevel === 6);
        if (isPeggy) {
            const pColor = currentLevel === "hub" || game.isHub ? "#ff66aa" : currentLevel === 6 ? "#f472b6" : currentLevel === 4 ? "#e11d48" : currentLevel === 0 ? game.iceMode ? "#66ccff" : "#ff66aa" : currentLevel === 1 ? "#66ccff" : "#ff6666";
            drawPlayerEnhanced(ctx, this.x - offsetX, this.y, this.w, this.h, this.facing, this.scaleX, this.scaleY, pColor, this.invulnerable, this.trail, this.scared, this);
        } else {
            let pColor = currentLevel >= 2 ? "#cc0044" : "#ff66aa";
            drawEntityBase(ctx, this.x - offsetX, this.y, this.w, this.h, this.scaleX, this.scaleY, pColor, true, this.facing, this.scared);
        }
        if (game.inHunt || game.lvl4State === "run_to_door") {
            const hpBarW = 50, hpBarH = 6;
            const hpX = this.x - offsetX + (this.w - hpBarW) / 2;
            const hpY = this.y - 12;
            const hpPct = Math.max(0, this.health / PLAYER_MAX_HEALTH);
            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.fillRect(hpX - 1, hpY - 1, hpBarW + 2, hpBarH + 2);
            ctx.fillStyle = hpPct > .5 ? "#4caf50" : hpPct > .25 ? "#ff9800" : "#f44336";
            ctx.fillRect(hpX, hpY, hpBarW * hpPct, hpBarH);
        }
        if (game.inHunt) {
            const kx = this.x - offsetX + (this.facing === 1 ? this.w * .76 : this.w * .24);
            const ky = this.y + this.h * .58;
            if (typeof window.drawPeggyDagger === "function") {
                window.drawPeggyDagger(ctx, kx, ky, this.facing, this.knifeShow || 0, game.huntKills || 0);
            }
        }
    }
}

function enemyIsNearCamera(e) {
    try {
        if (typeof cameraX === "undefined" || typeof VIEW_W === "undefined") return true;
        const cx = e.x + e.w / 2;
        return cx > cameraX - 300 && cx < cameraX + VIEW_W + 300;
    } catch (err) {
        return true;
    }
}

function triggerHorrorEnemyDeath(enemy) {
    if (!enemy) return;
    const ex = enemy.x + enemy.w / 2;
    const ey = enemy.y + enemy.h / 2;
    if (typeof applyShake === "function") applyShake(14);

    if (Math.random() < 0.45 && typeof stars !== "undefined" && Array.isArray(stars)) {
        stars.push({
            x: ex - 12,
            y: ey - 12,
            collected: false,
            _bossDrop: true,
            _born: Date.now()
        });
    }

    const visceraCount = 16 + Math.floor(Math.random() * 8);
    for (let v = 0; v < visceraCount; v++) {
        const spd = 3.0 + Math.random() * 6.8;
        const ang = -Math.PI * 0.5 + (Math.random() - 0.5) * 2.4;
        particles.push({
            x: ex + (Math.random() - 0.5) * enemy.w * 0.4,
            y: ey + (Math.random() - 0.5) * enemy.h * 0.4,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            vRot: (Math.random() - 0.5) * 0.35,
            rot: Math.random() * Math.PI * 2,
            life: 32 + Math.random() * 20,
            maxLife: 48,
            color: Math.random() < 0.45 ? "#880808" : (Math.random() < 0.5 ? "#580404" : "#b91c1c"),
            size: 4 + Math.random() * 4,
            isGuts: Math.random() < 0.6,
            type: "horror_viscera"
        });
    }

    if (typeof blood !== "undefined" && Array.isArray(blood)) {
        for (let b = 0; b < 20; b++) {
            blood.push({
                x: ex + (Math.random() - 0.5) * 18,
                y: ey + (Math.random() - 0.5) * 18,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 2,
                life: 38,
                color: Math.random() < 0.6 ? "#7f1d1d" : "#ff0033"
            });
        }
    }

    for (let s = 0; s < 18; s++) {
        particles.push({
            x: ex,
            y: ey,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10 - 2,
            life: 22,
            color: Math.random() < 0.5 ? "#ff0033" : "#991b1b",
            size: 3 + Math.random() * 2,
            type: "spark"
        });
    }

    const splitInTwo = Math.random() < 0.5;

    if (splitInTwo) {
        particles.push({
            x: ex,
            y: ey,
            life: 14,
            maxLife: 14,
            size: Math.max(enemy.w, enemy.h) * 1.15,
            type: "horror_slash"
        });

        particles.push({
            x: ex - enemy.w * 0.22,
            y: ey,
            vx: -3.8 - Math.random() * 2.2,
            vy: -4.5 - Math.random() * 2,
            rot: 0,
            vRot: -0.18,
            w: enemy.w * 0.58,
            h: enemy.h * 0.68,
            side: "left",
            life: 42,
            maxLife: 42,
            color: enemy.color || "#1e1422",
            type: "horror_corpse_half"
        });

        particles.push({
            x: ex + enemy.w * 0.22,
            y: ey,
            vx: 3.8 + Math.random() * 2.2,
            vy: -4.2 - Math.random() * 2,
            rot: 0,
            vRot: 0.18,
            w: enemy.w * 0.58,
            h: enemy.h * 0.68,
            side: "right",
            life: 42,
            maxLife: 42,
            color: enemy.color || "#1e1422",
            type: "horror_corpse_half"
        });

        playSound(95, 0.5, "sawtooth", 0.45, 30);
        addFloatingText(ex, ey - 25, "¡PARTIDO EN DOS!", "#ff1744", 18);
    } else {
        const gibCount = 5 + Math.floor(Math.random() * 3);
        for (let g = 0; g < gibCount; g++) {
            const gAng = (g / gibCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
            const gSpd = 3.8 + Math.random() * 4.8;
            particles.push({
                x: ex,
                y: ey,
                vx: Math.cos(gAng) * gSpd,
                vy: Math.sin(gAng) * gSpd - 2,
                rot: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.4,
                w: enemy.w * 0.36,
                h: enemy.h * 0.36,
                life: 40,
                maxLife: 40,
                color: enemy.color || "#2b0a0a",
                type: "horror_corpse_half"
            });
        }
        playSound(75, 0.55, "sawtooth", 0.5, 25);
        addFloatingText(ex, ey - 25, "¡EXPLOSIÓN VISCERAL!", "#ff0033", 18);
    }

    if (enemy.type && (enemy.type.indexOf("snowman") !== -1 || enemy.type === "snowball_head" || enemy.type === "magma_titan")) {
        particles.push({
            x: ex,
            y: ey - 8,
            vx: (Math.random() - 0.5) * 6,
            vy: -5.5,
            vRot: 0.18,
            life: 45,
            maxLife: 45,
            type: "horror_bone",
            isSkull: true
        });
    }
}

function drawDarkSummoningCloud(ctx, cx, cy, w, h, timer, time) {
    ctx.save();
    const pulse = Math.sin((time || 0) * 0.18) * 4;
    const baseR = Math.max(w, h) * 0.72 + pulse;
    const groundY = cy + h * 0.44;

    ctx.fillStyle = "rgba(12, 2, 8, 0.7)";
    ctx.beginPath();
    ctx.ellipse(cx, groundY, baseR * 1.25, baseR * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(255, 60, 0, ${0.45 + Math.sin((time || 0) * 0.2) * 0.3})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(cx, groundY, baseR * 1.12, baseR * 0.32, 0, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 6; i++) {
        const ang = ((time || 0) * 0.08 + i * (Math.PI / 3));
        const rOffset = Math.sin((time || 0) * 0.12 + i) * (baseR * 0.35);
        const cloudX = cx + Math.cos(ang) * (baseR * 0.45 + rOffset);
        const cloudY = cy + Math.sin(ang) * (baseR * 0.32) - (i * 2.5);
        const cloudR = baseR * (0.45 + (i % 3) * 0.16);

        const smkGrad = ctx.createRadialGradient(cloudX, cloudY, 2, cloudX, cloudY, cloudR);
        if (i % 2 === 0) {
            smkGrad.addColorStop(0, "rgba(25, 3, 8, 0.95)");
            smkGrad.addColorStop(0.6, "rgba(75, 12, 20, 0.75)");
            smkGrad.addColorStop(1, "rgba(15, 0, 0, 0)");
        } else {
            smkGrad.addColorStop(0, "rgba(220, 38, 38, 0.78)");
            smkGrad.addColorStop(0.5, "rgba(130, 20, 15, 0.52)");
            smkGrad.addColorStop(1, "rgba(35, 0, 5, 0)");
        }
        ctx.fillStyle = smkGrad;
        ctx.beginPath();
        ctx.arc(cloudX, cloudY, cloudR, 0, Math.PI * 2);
        ctx.fill();
    }

    for (let e = 0; e < 4; e++) {
        const eAng = (time || 0) * 0.15 + e * 1.6;
        const eDist = ((time || 0) * 2.6 + e * 22) % Math.max(20, h * 0.95);
        const ex = cx + Math.sin(eAng) * (baseR * 0.42);
        const ey = groundY - eDist;
        ctx.fillStyle = e % 2 === 0 ? "#ffcc00" : "#ff3300";
        ctx.beginPath();
        ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
        ctx.fill();
    }

    if (timer < 145) {
        const eyeAlpha = Math.min(1, (145 - timer) / 30);
        ctx.fillStyle = `rgba(255, 30, 30, ${eyeAlpha})`;
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(cx - 10, cy - 4, 4.5, 2.5, -0.2, 0, Math.PI * 2);
        ctx.ellipse(cx + 10, cy - 4, 4.5, 2.5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    const secondsLeft = Math.ceil(timer / 60);
    ctx.fillStyle = secondsLeft === 1 ? "#ef4444" : secondsLeft === 2 ? "#f97316" : "#eab308";
    ctx.font = 'bold 13px "Fredoka One", "Courier New", monospace, sans-serif';
    ctx.textAlign = "center";
    ctx.shadowColor = "#000000";
    ctx.shadowBlur = 5;
    ctx.fillText(`⚠️ ${secondsLeft}s`, cx, cy - h * 0.65 + pulse * 0.5);

    ctx.restore();
}

class Enemy {
    constructor(cfg) {
        this.x = cfg.x;
        this.y = cfg.y;
        this.w = cfg.w || 32;
        this.h = cfg.h || 32;
        this.color = cfg.color || (game.sadEnemies ? [ "#ffaa00", "#b08050", "#803010", "#3d0000" ][game.happyCycle || 0] : currentLevel >= 2 ? "#880000" : "#ff9900");
        const MINI_BOSS_TYPES = [ "daisy_flower", "magma_titan", "mega_snowman", "bubble_tree" ];
        const isMiniBoss = MINI_BOSS_TYPES.indexOf(this.type) !== -1 || cfg.isMiniBoss === true || cfg.miniBoss === true || cfg.giant === true;
        let HEALTH_MULT = isMiniBoss || cfg.health === undefined ? 1 : .75;
        if (window.postGameHorror) {
            HEALTH_MULT *= 1.5;
        }
        const baseHealth = Math.max(1, Math.round(cfg.health * HEALTH_MULT));
        this.maxHealth = baseHealth;
        this.health = baseHealth;
        if (window.postGameHorror) {
            this.color = "#330000";
        }
        if ([ "podoboo", "fire_spawner", "electric_cross" ].includes(this.type)) {
            this.isObstacle = true;
            this.maxHealth = 0;
            this.health = 0;
        }
        this.speed = cfg.speed;
        this.range = cfg.range;
        this.direction = 1;
        this.shoot = cfg.shoot;
        if (game.sadEnemies) this.shoot = false;
        if (window.postGameHorror && !this.isObstacle && !this.isBoss && cfg.type !== "similar_harmless") {
            this.shoot = true;
            this.bulletType = "horror_blood_ball";
            if (!cfg.shootInterval) cfg.shootInterval = 140;
        }
        this.shootInterval = cfg.shootInterval;
        this.shootTimer = Math.floor(Math.random() * this.shootInterval);
        this.jump = cfg.jump;
        this.jumpInterval = cfg.jumpInterval;
        this.jumpTimer = Math.floor(Math.random() * this.jumpInterval);
        this.originX = cfg.x;
        this.vy = 0;
        this.active = true;
        this.onGround = true;
        this.hoverOffset = Math.random() * Math.PI * 2;
        this.scaleX = 1;
        this.scaleY = 1;
        this.facing = 1;
        this.escapeBoost = 0;
        this.hurtTimer = 0;
        this.type = cfg.type || "normal";
        this.bulletType = cfg.bulletType || null;
        this.texture = cfg.texture || null;
        this.enraged = false;
        this.baseSpeed = cfg.speed || 1.2;
        this.patrolAngle = Math.random() * Math.PI * 2;
        this.shootBurst = 0;
        this.shootBurstCount = 0;
        this.isGuard = cfg.isGuard || false;
        this.isOnFire = cfg.isOnFire || false;
        if (this.type === "shield" || cfg.hasShield) {
            this.hasShield = true;
            this.shieldActive = true;
            this.shieldMaxHp = cfg.shieldHp || Math.max(40, Math.floor((this.health || 60) * .75));
            this.shieldHp = this.shieldMaxHp;
            this.shieldHitFlash = 0;
            this.shieldRadius = Math.max(this.w, this.h) * .85;
        }
        if (this.type === "sinusoidal") {
            this.isFlying = true;
            this.originY = cfg.y !== undefined ? cfg.y : this.y;
            this._originY = this.originY;
            this.health = Math.max(15, Math.floor(this.health * .5));
            this.maxHealth = this.health;
        }
        if (this.type === "snowman_blower") {
            this.w = 38;
            this.h = 46;
            this.health = cfg.health || 75;
            this.maxHealth = this.health;
            this.blowCycle = Math.floor(Math.random() * 80);
            this.isBlowing = false;
            this.shoot = false;
        } else if (this.type === "snowman_slammer") {
            this.w = 42;
            this.h = 56;
            this.health = cfg.health || 95;
            this.maxHealth = this.health;
            this.slamTimer = 70 + Math.floor(Math.random() * 50);
            this.inSlamAir = false;
            this.shoot = false;
        } else if (this.type === "snowball_head") {
            this.w = 46;
            this.h = 46;
            this.health = cfg.health || 85;
            this.maxHealth = this.health;
            this.bulletType = "giant_snowball";
            this.shoot = true;
            this.shootInterval = cfg.shootInterval || 130;
            this.shootTimer = Math.floor(Math.random() * 40);
            this.speed = cfg.speed || 1.4;
            this.range = cfg.range || 80;
            this.direction = 1;
        } else if (this.type === "flying_fish") {
            this.w = 36;
            this.h = 32;
            this.health = cfg.health || 45;
            this.maxHealth = this.health;
            this.waterY = cfg.y || 550;
            this.jumpTimer = 35 + Math.floor(Math.random() * 60);
            this.inWater = true;
            this.hasShot = false;
            this.shoot = false;
            if (cfg.isBoatFish) this.isBoatFish = true;
        } else if (this.type === "coral_crab") {
            this.w = 38;
            this.h = 28;
            this.health = cfg.health || 70;
            this.maxHealth = this.health;
            this.clawTimer = 0;
        } else if (this.type === "jellyfish_orb") {
            this.isFlying = true;
            this.w = 40;
            this.h = 40;
            this.health = cfg.health || 80;
            this.maxHealth = this.health;
            this.bulletType = "electric";
            this.shoot = true;
            this.shootInterval = cfg.shootInterval || 120;
            this.shootTimer = Math.floor(Math.random() * 50);
            this.originY = cfg.y !== undefined ? cfg.y : this.y;
            this._originY = this.originY;
        } else if (this.type === "ink_octopus") {
            this.isFlying = true;
            this.w = 42;
            this.h = 42;
            this.health = cfg.health || 85;
            this.maxHealth = this.health;
            this.bulletType = "ink";
            this.shoot = true;
            this.shootInterval = cfg.shootInterval || 135;
            this.shootTimer = Math.floor(Math.random() * 60);
            this.originY = cfg.y !== undefined ? cfg.y : this.y;
            this._originY = this.originY;
        } else if (this.type === "electric_squid") {
            this.isFlying = true;
            this.w = 42;
            this.h = 46;
            this.health = cfg.health || 40;
            this.maxHealth = this.health;
            this.bulletType = "electric";
            this.shoot = true;
            this.shootInterval = cfg.shootInterval || 110;
            this.shootTimer = Math.floor(Math.random() * 50);
            this.originY = cfg.y !== undefined ? cfg.y : this.y;
            this._originY = this.originY;
            this.isElectricSquid = true;
        } else if (this.type === "pumpkin") {
            this.w = 38;
            this.h = 36;
            this.health = cfg.health || 65;
            this.maxHealth = this.health;
            this.color = "#ea580c";
            this.bulletType = "halloween_fire";
            this.shoot = true;
            this.shootInterval = cfg.shootInterval || 190;
            this.shootTimer = Math.floor(Math.random() * 80);
            this.speed = cfg.speed || 1.1;
            this.range = cfg.range || 120;
            this.jump = true;
            this.jumpInterval = cfg.jumpInterval || 85;
            this.jumpTimer = Math.floor(Math.random() * 50);
            this.jumpForce = 8.5;
        } else if (this.type === "crow") {
            this.isFlying = true;
            this.w = 34;
            this.h = 28;
            this.health = cfg.health || 35;
            this.maxHealth = this.health;
            this.color = "#0f0a1c";
            this.speed = cfg.speed || 2.4;
            this.originY = cfg.y !== undefined ? cfg.y : this.y;
            this._originY = this.originY;
            this.diveState = "perched";
            this.diveTimer = 0;
            this.shoot = false;
        } else if (this.type === "witch") {
            this.isFlying = true;
            this.w = 44;
            this.h = 44;
            this.health = cfg.health || 80;
            this.maxHealth = this.health;
            this.color = "#581c87";
            this.bulletType = "paralyze_diamond";
            this.shoot = true;
            this.shootInterval = cfg.shootInterval || 140;
            this.shootTimer = 40 + Math.floor(Math.random() * 50);
            this.originY = cfg.y !== undefined ? cfg.y : this.y;
            this._originY = this.originY;
            this.speed = cfg.speed || 1.6;
            this.range = cfg.range || 180;
        } else if (this.type === "hooded") {
            this.w = 36;
            this.h = 48;
            this.health = cfg.health || 75;
            this.maxHealth = this.health;
            this.color = "#1e0836";
            this.bulletType = "halloween_fire";
            this.shoot = true;
            this.shootInterval = cfg.shootInterval || 110;
            this.shootTimer = Math.floor(Math.random() * 50);
            this.speed = cfg.speed || 1.2;
            this.range = cfg.range || 140;
        } else if (this.type === "ghost") {
            this.isFlying = true;
            this.w = 38;
            this.h = 42;
            this.health = cfg.health || 20;
            this.maxHealth = this.health;
            this.ghostHits = 0;
            this.color = "#c084fc";
            this.originY = cfg.y !== undefined ? cfg.y : this.y;
            this._originY = this.originY;
            this.ghostState = "floating";
            this.ghostTimer = 60 + Math.floor(Math.random() * 80);
            this.dashCooldown = 0;
            this.shoot = false;
        } else if (this.type === "bubble_tree") {
            this.isGiant = cfg.giant || cfg.w >= 90 || false;
            this.w = cfg.w || (this.isGiant ? 128 : 48);
            this.h = cfg.h || (this.isGiant ? 144 : 56);
            this.isAggressive = cfg.aggressive || this.isGiant;
            this.health = cfg.health || (this.isGiant ? 210 : 70);
            this.maxHealth = this.health;
            this.bulletType = "slow_bubble";
            this.shoot = true;
            this.shootInterval = cfg.shootInterval || (this.isGiant ? 110 : 140);
        } else if (this.type === "fire_tree") {
            this.isGiant = cfg.giant || cfg.w >= 90 || false;
            this.w = cfg.w || (this.isGiant ? 105 : 80);
            this.h = cfg.h || (this.isGiant ? 140 : 120);
            this.isAggressive = true;
            this.isFireTree = true;
            this.health = cfg.health || (this.isGiant ? 260 : 160);
            this.maxHealth = this.health;
            this.bulletType = "fire_bubble";
            this.shoot = true;
            this.shootInterval = cfg.shootInterval || (this.isGiant ? 70 : 85);
            this.shootTimer = 25;
            this.speed = 0;
        } else if (this.type === "igneous_turret") {
            this.w = cfg.w || 54;
            this.h = cfg.h || 46;
            this.health = cfg.health || 100;
            this.maxHealth = this.health;
            this.speed = 0;
            this.range = 0;
            this.shoot = true;
            this.shootInterval = cfg.shootInterval || 75;
            this.shootTimer = 25 + Math.floor(Math.random() * 20);
            this.bulletType = "fireball";
            this.color = "#ff4400";
            this.isIgneousTurret = true;
        } else if (this.type === "apple") {
            this.w = 36;
            this.h = 36;
            this.health = cfg.health || 50;
            this.maxHealth = this.health;
            this.bulletType = "apple_arc";
            this.shoot = true;
            this.shootInterval = cfg.shootInterval || 120;
            this.shootTimer = 30 + Math.floor(Math.random() * 40);
            this.speed = cfg.speed || 1.1;
            this.range = cfg.range || 70;
        } else if (this.type === "bubble_puffer") {
            this.w = 52;
            this.h = 52;
            this.health = cfg.health || 85;
            this.maxHealth = this.health;
            this.bulletType = "bubble_spray";
            this.shoot = true;
            this.shootInterval = cfg.shootInterval || 150;
            this.shootTimer = 40 + Math.floor(Math.random() * 40);
            this.speed = cfg.speed || .8;
            this.range = cfg.range || 50;
        } else if (this.type === "ice_orb") {
            this.w = 54;
            this.h = 54;
            this.health = cfg.health || 150;
            this.maxHealth = this.health;
            this.bulletType = "frost_breath";
            this.shoot = true;
            this.shootInterval = cfg.shootInterval || 210;
            this.shootTimer = 45 + Math.floor(Math.random() * 50);
            this.speed = cfg.speed || .8;
            this.range = cfg.range || 60;
        } else if (this.type === "giant_snowman") {
            this.w = 56;
            this.h = 68;
            this.health = cfg.health || 125;
            this.maxHealth = this.health;
            this.bulletType = "giant_snowball_arc";
            this.shoot = true;
            this.shootInterval = cfg.shootInterval || 140;
            this.shootTimer = 40 + Math.floor(Math.random() * 40);
            this.speed = cfg.speed || 1.1;
            this.range = cfg.range || 80;
        } else if (this.type === "daisy_flower") {
            this.w = 115;
            this.h = 125;
            this.health = cfg.health || 180;
            this.maxHealth = this.health;
            this.bulletType = "long_thorns";
            this.shoot = false;
            this.pressureTimer = 0;
            this.isPressuring = false;
            this.pressureCooldown = 20;
            this.speed = 0;
            this.range = 0;
        } else if (this.type === "magma_titan") {
            this.w = 145;
            this.h = 145;
            this.health = cfg.health || 340;
            this.maxHealth = this.health;
            this.bulletType = "flame_spray";
            this.shoot = cfg.shoot !== undefined ? cfg.shoot : true;
            this.shootInterval = cfg.shootInterval || 125;
            this.shootTimer = 40 + Math.floor(Math.random() * 30);
            this.speed = cfg.speed || .8;
            this.range = cfg.range || 90;
            this.jumpTimer = 0;
        } else if (this.type === "mega_snowman") {
            this.w = 145;
            this.h = 180;
            this.health = cfg.health || 290;
            this.maxHealth = this.health;
            this.snowmanBalls = 3;
            this.bulletType = "giant_snowball_arc";
            this.shoot = true;
            this.shootInterval = cfg.shootInterval || 130;
            this.shootTimer = 40 + Math.floor(Math.random() * 40);
            this.speed = cfg.speed || .7;
            this.range = cfg.range || 80;
        }
        this.blinkTimer = Math.floor(Math.random() * 160);
        this.mouthOpenTimer = 0;
    }
    update(platforms) {
        if (!this.active) return;
        if (this.summoningTimer > 0) {
            this.summoningTimer--;
            if (this.summoningTimer === 0) {
                try {
                    if (typeof createExplosion === "function") {
                        createExplosion(this.x + this.w / 2, this.y + this.h / 2, "#ff4400", 35, 18, ["#ff9900", "#ff3300", "#ffffff"]);
                    }
                    if (typeof playSound === "function") {
                        playSound(160, 0.35, "sawtooth", 0.3, 70);
                    }
                    if (typeof applyShake === "function") applyShake(8);
                } catch (e) {}
            }
            return;
        }
        if (currentLevel === 0 && !game.iceMode && (this.type === "snowman_blower" || this.type === "snowman_slammer" || this.type === "snowball_head" || this.type === "ice_orb" || this.type === "giant_snowman" || this.type === "mega_snowman")) {
            return;
        }
        if (typeof cameraX !== "undefined" && typeof VIEW_W !== "undefined") {
            const isFar = (this.x + this.w < cameraX - 450 || this.x > cameraX + VIEW_W + 450) &&
                !(game.inHunt && this === game.huntEnemy) &&
                !this.isBoss && !this.isMiniBoss;
            if (isFar) {
                if ((this.hurtTimer || 0) > 0) this.hurtTimer--;
                if ((this.mouthOpenTimer || 0) > 0) this.mouthOpenTimer--;
                if ((this.stunTimer || 0) > 0) this.stunTimer--;
                return;
            }
        }
        this.blinkTimer = (this.blinkTimer || 0) + 1;
        if (this.blinkTimer > 170 + Math.sin(time) * 40) {
            this.blinkTimer = -12;
        }
        if ((this.mouthOpenTimer || 0) > 0) {
            this.mouthOpenTimer--;
        }
        if ((this.hurtTimer || 0) > 0) {
            this.hurtTimer--;
        }
        this.scaleX += (1 - this.scaleX) * .12;
        this.scaleY += (1 - this.scaleY) * .12;
        if (this.type === "ghost" || this.type === "igneous_turret" || this.isTurret || this.isGhost || this.immuneToStun) {
            this.stunTimer = 0;
            this.stunKbX = 0;
            this.stunKbY = 0;
        }
        if ((this.stunTimer || 0) > 0) {
            this.stunTimer--;
            if (this.stunTimer === (this._lastStunDur || 0) - 1) {
            }
            this._stunAngle = ((this._stunAngle || 0) + 0.12) % (Math.PI * 2);
            if (this.stunKbX) {
                this.x += this.stunKbX;
                this.stunKbX *= 0.78;
                if (Math.abs(this.stunKbX) < 0.15) this.stunKbX = 0;
            }
            this.vy = (this.vy || 0) + (typeof GRAVITY !== "undefined" ? GRAVITY : 0.5);
            if (this.vy > 18) this.vy = 18;
            this.y += this.vy;
            if (this.vy >= 0 && platforms) {
                for (let _pl of platforms) {
                    if (this.x + this.w > _pl.x && this.x < _pl.x + _pl.w &&
                        this.y + this.h >= _pl.y && this.y + this.h <= _pl.y + _pl.h + this.vy + 2) {
                        this.y = _pl.y - this.h;
                        this.vy = 0;
                        break;
                    }
                }
            }
            if (this.stunTimer === 0) {
                const isFlyingEnemy = this.isFlying || this.type === "sinusoidal" || this.type === "witch" ||
                    this.type === "crow" || this.type === "ghost" || this.type === "ink_octopus" ||
                    this.type === "electric_squid" || this.type === "jellyfish_orb";
                const baseFlightY = this.originY !== undefined ? this.originY : (this._originY !== undefined ? this._originY : null);
                if (isFlyingEnemy && baseFlightY !== null && this.y > baseFlightY) {
                    this.isStunAscending = true;
                    this.vy = 0;
                    this.scaleX = 0.86;
                    this.scaleY = 1.22;
                    if (typeof particles !== "undefined" && Array.isArray(particles)) {
                        for (let k = 0; k < 6; k++) {
                            particles.push({
                                x: this.x + this.w / 2 + (Math.random() - .5) * this.w,
                                y: this.y + this.h,
                                vx: (Math.random() - .5) * 3,
                                vy: -Math.random() * 2.2 - 0.4,
                                life: 18,
                                maxLife: 18,
                                color: "#ffffff",
                                size: 2.5 + Math.random() * 2,
                                type: "smoke"
                            });
                        }
                    }
                }
            }
            return;
        }

        if (game.inHunt && this === game.huntEnemy && game.huntEnemy) {
            const p = game.player;
            const center = p.x + p.w / 2;
            const myCenter = this.x + this.w / 2;
            const dist = Math.abs(myCenter - center);
            const curVW = (typeof window.VIEW_W === "number" && window.VIEW_W) ? window.VIEW_W : 1024;
            const padX = 40;
            const minX = cameraX + padX;
            const maxX = cameraX + curVW - this.w - padX;

            if (!this.spotted && dist < 420) {
                this.spotted = true;
                this.escapeBoost = 8;
                playSound(520, .4, "sawtooth", .25, 900);
                if (this.onGround) {
                    this.vy = -10;
                    this.onGround = false;
                }
            }
            if (this.spotted) {
                const away = center < myCenter ? 1 : -1;
                this.facing = away;
                const boost = this.escapeBoost > 0 ? this.escapeBoost : 0;
                this.x += away * ((this.fleeSpeed || 3.8) + boost);
                if (this.escapeBoost > 0) this.escapeBoost--;
                this.wanderT = (this.wanderT || 0) + 1;
                if (this.wanderT % 90 === 0 && this.onGround) {
                    this.vy = -9;
                    this.onGround = false;
                }
                if (dist < 140 && this.onGround) {
                    this.vy = -12;
                    this.onGround = false;
                }
            } else {
                this.facing = myCenter < center ? 1 : -1;
            }

            if (this.x < minX) {
                this.x = minX;
                if (this.facing === -1) this.facing = 1;
            }
            if (this.x > maxX) {
                this.x = maxX;
                if (this.facing === 1) this.facing = -1;
            }

            this.vy += GRAVITY;
            this.y += this.vy;
            let g = false;
            for (let plat of platforms) {
                if (this.vy >= 0 && this.x + this.w > plat.x && this.x < plat.x + plat.w && this.y + this.h >= plat.y && this.y + this.h <= plat.y + plat.h + this.vy + 2) {
                    this.y = plat.y - this.h;
                    this.vy = 0;
                    this.onGround = true;
                    g = true;
                    break;
                }
            }
            if (!g) this.onGround = false;
            return;
        }
        if (this.type === "podoboo") {
            if (this.startY === undefined) {
                this.startY = this.y;
                this.vy = 0;
                this.jumpTimer = 0;
            }
            if (this.y >= this.startY) {
                this.y = this.startY;
                this.vy = 0;
                this.jumpTimer++;
                if (this.jumpTimer > (this.jumpDelay || 120)) {
                    this.vy = -16;
                    this.jumpTimer = 0;
                }
            } else {
                this.vy += .4;
            }
            this.y += this.vy;
            if (Math.random() < .3) {
                particles.push({
                    x: this.x + this.w / 2 + (Math.random() - .5) * this.w,
                    y: this.y + this.h / 2 + (Math.random() - .5) * this.h,
                    vx: (Math.random() - .5) * 2,
                    vy: -Math.random() * 2 - 1,
                    life: 20 + Math.random() * 10,
                    color: Math.random() < .5 ? "#ffff00" : "#ffaa00",
                    size: 3 + Math.random() * 2,
                    type: "spark"
                });
            }
            const p = game.player;
            if (p && p.invulnerable <= 0) {
                if (p.x + p.w > this.x && p.x < this.x + this.w && p.y + p.h > this.y && p.y < this.y + this.h) {
                    p.takeDamage(28);
                    p.vy = -6;
                }
            }
            return;
        }
        if (this.type === "fire_spawner") {
            if (enemyIsNearCamera(this, 1e3)) {
                this.shootTimer = (this.shootTimer || 0) + 1;
                if (this.shootTimer > (this.shootInterval || 120)) {
                    this.shootTimer = 0;
                    enemyProjectiles.push({
                        x: this.x,
                        y: this.y,
                        vx: -5,
                        vy: 0,
                        w: 24,
                        h: 24,
                        type: "horizontal_fireball",
                        isFireball: true,
                        color: "#ffff00",
                        damage: 20
                    });
                }
            }
            return;
        }
        if (this.type === "electric_cross") {
            this.patrolAngle = (this.patrolAngle || 0) - (this.spinSpeed || .03);
            if (enemyIsNearCamera(this, 800)) {
                const p = game.player;
                if (p && !p.dead && !p.frozen && !game.godMode) {
                    const isDashing = (p.dashTimer > 0) || !!p.dashMax;
                    const canBeHurt = isDashing || (p.invulnerable <= 0);

                    if (canBeHurt) {
                        const numBalls = this.numBalls || 4;
                        const arms = 4;
                        const spacing = 32;
                        const cx = this.x + this.w / 2;
                        const cy = this.y + this.h / 2;

                        let hit = false;
                        let hitX = cx;
                        let hitY = cy;

                        const cClosestX = Math.max(p.x, Math.min(cx, p.x + p.w));
                        const cClosestY = Math.max(p.y, Math.min(cy, p.y + p.h));
                        const cDx = cx - cClosestX;
                        const cDy = cy - cClosestY;
                        if ((cDx * cDx + cDy * cDy) < (18 * 18)) {
                            hit = true;
                            hitX = cx;
                            hitY = cy;
                        }

                        if (!hit) {
                            for (let a = 0; a < arms; a++) {
                                const angle = this.patrolAngle + (Math.PI / 2) * a;
                                const cosA = Math.cos(angle);
                                const sinA = Math.sin(angle);
                                for (let b = 1; b <= numBalls; b++) {
                                    const bx = cx + cosA * b * spacing;
                                    const by = cy + sinA * b * spacing;

                                    const bClosestX = Math.max(p.x, Math.min(bx, p.x + p.w));
                                    const bClosestY = Math.max(p.y, Math.min(by, p.y + p.h));
                                    const bDx = bx - bClosestX;
                                    const bDy = by - bClosestY;
                                    if ((bDx * bDx + bDy * bDy) < (15 * 15)) {
                                        hit = true;
                                        hitX = bx;
                                        hitY = by;
                                        break;
                                    }

                                    const mx = cx + cosA * (b - 0.5) * spacing;
                                    const my = cy + sinA * (b - 0.5) * spacing;
                                    const mClosestX = Math.max(p.x, Math.min(mx, p.x + p.w));
                                    const mClosestY = Math.max(p.y, Math.min(my, p.y + p.h));
                                    const mDx = mx - mClosestX;
                                    const mDy = my - mClosestY;
                                    if ((mDx * mDx + mDy * mDy) < (9 * 9)) {
                                        hit = true;
                                        hitX = mx;
                                        hitY = my;
                                        break;
                                    }
                                }
                                if (hit) break;
                            }
                        }

                        if (hit) {
                            if (isDashing) {
                                p.dashTimer = 0;
                                p.dashTrailT = 0;
                                p.dashMax = false;
                                p.invulnerable = 0;
                            }

                            p.takeDamage(26);
                            if (typeof window.applyElectricShock === "function") {
                                window.applyElectricShock(p, 30);
                            }

                            const pushDir = (p.x + p.w / 2) < hitX ? -1 : 1;
                            p.vx = pushDir * 9;
                            p.vy = -6;
                            p.onGround = false;
                        }
                    }
                }
            }
            return;
        }
        if (this.type === "sinusoidal") {
            this.patrolAngle += .04;
            const ampX = this.range > 0 ? this.range : 110;
            const ampY = 32;
            if (this._originY === undefined) this._originY = this.originY !== undefined ? this.originY : this.y;
            this.x = this.originX + Math.sin(this.patrolAngle) * ampX;
            const idealY = this._originY + Math.sin(this.patrolAngle * 2) * ampY;
            if (this.isStunAscending) {
                if (this.y > idealY) {
                    this.y -= Math.min(2.8, this.y - idealY);
                    this.scaleY = 1.15;
                    this.scaleX = 0.9;
                } else {
                    this.y = idealY;
                    this.isStunAscending = false;
                }
            } else {
                this.y = idealY;
            }
            this.facing = Math.cos(this.patrolAngle) > 0 ? 1 : -1;
            if (!this.isStunAscending && this.shoot && enemyIsNearCamera(this)) {
                this.shootTimer = (this.shootTimer || 0) + 1;
                if (this.shootTimer >= (this.shootInterval || 110)) {
                    this.shootTimer = 0;
                    this.fireProjectile();
                }
            }
            return;
        }
        if (this.type === "snowball_head") {
            const p = game.player;
            if (p && enemyIsNearCamera(this)) {
                this.facing = p.x + p.w / 2 < this.x + this.w / 2 ? -1 : 1;
            }
            this.rot = (this.rot || 0) + (this.direction || 1) * .04;
        }
        if (this.type === "ink_octopus") {
            if (this._originY === undefined) this._originY = this.originY !== undefined ? this.originY : this.y;
            this.patrolAngle = (this.patrolAngle || 0) + .04;
            const idealY = this._originY + Math.sin(this.patrolAngle) * 14;
            if (this.isStunAscending) {
                if (this.y > idealY) {
                    this.y -= Math.min(2.6, this.y - idealY);
                    this.scaleY = 1.15;
                    this.scaleX = 0.9;
                } else {
                    this.y = idealY;
                    this.isStunAscending = false;
                }
            } else {
                this.y = idealY;
            }
            this.x = this.originX + Math.sin(this.patrolAngle * .5) * (this.range > 0 ? this.range : 50);
            const p = game.player;
            if (p) this.facing = p.x + p.w / 2 < this.x + this.w / 2 ? -1 : 1;
            if (!this.isStunAscending && this.shoot && enemyIsNearCamera(this)) {
                this.shootTimer = (this.shootTimer || 0) + 1;
                if (this.shootTimer >= (this.shootInterval || 135)) {
                    this.shootTimer = 0;
                    this.mouthOpenTimer = 22;
                    this.scaleX = .8;
                    this.scaleY = 1.25;
                    this.fireProjectile();
                }
            }
            return;
        }
        if (this.type === "electric_squid") {
            if (this._originY === undefined) this._originY = this.originY !== undefined ? this.originY : this.y;
            if (this.originX === undefined) this.originX = this.x;
            this.patrolAngle = (this.patrolAngle || 0) + .05;
            const idealY = this._originY + Math.sin(this.patrolAngle) * 22;
            if (this.isStunAscending) {
                if (this.y > idealY) {
                    this.y -= Math.min(2.8, this.y - idealY);
                    this.scaleY = 1.15;
                    this.scaleX = 0.9;
                } else {
                    this.y = idealY;
                    this.isStunAscending = false;
                }
            } else {
                this.y = idealY;
            }
            if (this.vx) {
                this.x += this.vx;
            } else {
                this.x = this.originX + Math.sin(this.patrolAngle * .4) * (this.range > 0 ? this.range : 45);
            }
            const p = game.player;
            if (p) this.facing = p.x + p.w / 2 < this.x + this.w / 2 ? -1 : 1;
            if (!this.isStunAscending && this.shoot && enemyIsNearCamera(this)) {
                this.shootTimer = (this.shootTimer || 0) + 1;
                if (this.shootTimer >= (this.shootInterval || 110)) {
                    this.shootTimer = 0;
                    this.mouthOpenTimer = 22;
                    this.scaleX = .8;
                    this.scaleY = 1.25;
                    this.fireProjectile();
                }
            }
            return;
        }
        if (this.type === "flying_fish") {
            const p = game.player;
            const nearCam = enemyIsNearCamera(this);
            if (this.inWater) {
                this.jumpTimer--;
                if (this.jumpTimer <= 0 && nearCam) {
                    this.inWater = false;
                    this.hasShot = false;
                    this.vy = -13.8;
                    this.vx = (Math.random() - .5) * 1.5;
                    this.scaleX = .75;
                    this.scaleY = 1.35;
                    if (nearCam) {
                        playSound(320, .14, "sine", .12, 160);
                        for (let k = 0; k < 10; k++) {
                            particles.push({
                                x: this.x + this.w / 2 + (Math.random() - .5) * 20,
                                y: this.waterY,
                                vx: (Math.random() - .5) * 4,
                                vy: -Math.random() * 5 - 2,
                                life: 18,
                                color: Math.random() < .5 ? "#ffffff" : "#00d2d3",
                                size: 3 + Math.random() * 3,
                                type: "spark"
                            });
                        }
                    }
                }
            } else {
                this.vy += GRAVITY * .85;
                this.y += this.vy;
                this.x += this.vx || 0;
                if (p) this.facing = p.x + p.w / 2 < this.x + this.w / 2 ? -1 : 1;
                if (this.vy >= -2.5 && this.vy <= 2.5 && !this.hasShot && nearCam) {
                    this.hasShot = true;
                    this.mouthOpenTimer = 18;
                    const px = this.x + this.w / 2, py = this.y + this.h / 2;
                    const targetX = p ? p.x + p.w / 2 : px;
                    const targetY = p ? p.y + p.h / 2 : py;
                    const angle = Math.atan2(targetY - py, targetX - px);
                    const spd = 4.8;
                    enemyProjectiles.push({
                        x: px - 8,
                        y: py - 8,
                        w: 16,
                        h: 16,
                        vx: Math.cos(angle) * spd,
                        vy: Math.sin(angle) * spd,
                        damage: 16,
                        isWaterBullet: true,
                        color: "#00d2d3",
                        life: 180,
                        trail: []
                    });
                    playSound(440, .12, "sine", .14, 220);
                }
                if (this.y >= this.waterY && this.vy > 0) {
                    this.inWater = true;
                    this.y = this.waterY;
                    this.vy = 0;
                    this.jumpTimer = 100 + Math.floor(Math.random() * 70);
                    if (nearCam) {
                        playSound(260, .15, "sine", .18, 90);
                        for (let k = 0; k < 12; k++) {
                            particles.push({
                                x: this.x + this.w / 2 + (Math.random() - .5) * 20,
                                y: this.waterY,
                                vx: (Math.random() - .5) * 5,
                                vy: -Math.random() * 4 - 1,
                                life: 16,
                                color: Math.random() < .5 ? "#ffffff" : "#48dbfb",
                                size: 3 + Math.random() * 3,
                                type: "spark"
                            });
                        }
                    }
                }
            }
            return;
        }
        if (this.type === "jellyfish_orb") {
            if (this._originY === undefined) this._originY = this.originY !== undefined ? this.originY : this.y;
            this.patrolAngle += .038;
            const idealY = this._originY + Math.sin(this.patrolAngle) * 18;
            if (this.isStunAscending) {
                if (this.y > idealY) {
                    this.y -= Math.min(2.5, this.y - idealY);
                    this.scaleY = 1.15;
                    this.scaleX = 0.9;
                } else {
                    this.y = idealY;
                    this.isStunAscending = false;
                }
            } else {
                this.y = idealY;
            }
            this.x = this.originX + Math.sin(this.patrolAngle * .4) * (this.range > 0 ? this.range : 45);
            const p = game.player;
            if (p) this.facing = p.x + p.w / 2 < this.x + this.w / 2 ? -1 : 1;
            if (!this.isStunAscending && this.shoot && enemyIsNearCamera(this)) {
                this.shootTimer = (this.shootTimer || 0) + 1;
                if (this.shootTimer >= (this.shootInterval || 120)) {
                    this.shootTimer = 0;
                    this.fireProjectile();
                }
            }
            return;
        }
        if (this.type === "crow") {
            const p = game.player;
            const nearCam = enemyIsNearCamera(this);
            if (this.diveState === "perched") {
                if (this.originY === undefined) this.originY = this.y;
                const idealY = this.originY + Math.sin(time * .05 + this.hoverOffset) * 4;
                if (this.isStunAscending) {
                    if (this.y > idealY) {
                        this.y -= Math.min(3.2, this.y - idealY);
                        this.scaleY = 1.15;
                        this.scaleX = 0.9;
                    } else {
                        this.y = idealY;
                        this.isStunAscending = false;
                    }
                } else {
                    this.y = idealY;
                }
                if (!this.isStunAscending && p && nearCam) {
                    const dx = p.x + p.w / 2 - (this.x + this.w / 2);
                    const dy = p.y + p.h / 2 - this.y;
                    this.facing = dx < 0 ? -1 : 1;
                    if (Math.abs(dx) < 360 && dy > 10 && dy < 320) {
                        this.diveState = "diving";
                        this.vx = this.facing * 6.2;
                        this.vy = 4.2;
                        this.diveTimer = 0;
                        try {
                            playSound(580, .16, "sawtooth", .14, 280);
                        } catch (e) {}
                    }
                }
            } else if (this.diveState === "diving") {
                if (this.isStunAscending) {
                    this.diveState = "climbing";
                } else {
                    this.x += this.vx;
                    this.y += this.vy;
                    this.diveTimer++;
                    const p = game.player;
                    if (this.diveTimer > 35 || p && this.y >= p.y + 15 || this.y > VIEW_H - 100) {
                        this.diveState = "climbing";
                    }
                }
            } else if (this.diveState === "climbing") {
                this.x += this.vx * .6;
                this.vy = -3.5;
                this.y += this.vy;
                if (this.y <= (this.originY || 200)) {
                    this.y = this.originY || 200;
                    this.diveState = "perched";
                    this.isStunAscending = false;
                }
            }
            return;
        }
        if (this.type === "witch") {
            if (this.originY === undefined) this.originY = this.y;
            this.patrolAngle = (this.patrolAngle || 0) + .035;
            const idealY = this.originY + Math.sin(this.patrolAngle) * 20;
            if (this.isStunAscending) {
                if (this.y > idealY) {
                    this.y -= Math.min(2.8, this.y - idealY);
                    this.scaleY = 1.15;
                    this.scaleX = 0.9;
                    if (Math.random() < 0.25 && typeof particles !== "undefined" && Array.isArray(particles)) {
                        particles.push({
                            x: this.x + this.w / 2 + (Math.random() - .5) * 16,
                            y: this.y + this.h * .85,
                            vx: (Math.random() - .5) * 1.5,
                            vy: Math.random() * 1.5 + 0.5,
                            life: 14,
                            maxLife: 14,
                            color: "#c084fc",
                            size: 2.5,
                            type: "spark"
                        });
                    }
                } else {
                    this.y = idealY;
                    this.isStunAscending = false;
                }
            } else {
                this.y = idealY;
            }
            this.x += (this.direction || 1) * (this.speed || 1.6);
            if (Math.abs(this.x - this.originX) > (this.range || 160)) {
                this.direction *= -1;
            }
            const p = game.player;
            if (p) this.facing = p.x + p.w / 2 < this.x + this.w / 2 ? -1 : 1;
            if (!this.isStunAscending && enemyIsNearCamera(this)) {
                if (!this.spottedPlayerSFX) {
                    this.spottedPlayerSFX = true;
                    try {
                        playSFX(Math.random() < .5 ? "sfx_witch_cackle_1" : "sfx_witch_cackle_2");
                    } catch (e) {}
                }
                if (this.shoot) {
                    const isPlayerParalyzedOrImmune = p && (p.paralyzed || p.paralyzeTimer > 0 || p.paralyzeImmunityTimer > 0);
                    if (!isPlayerParalyzedOrImmune) {
                        this.shootTimer = (this.shootTimer || 0) + 1;
                        if (this.shootTimer >= (this.shootInterval || 140)) {
                            this.shootTimer = 0;
                            this.fireProjectile();
                        }
                    } else {
                        this.shootTimer = 0;
                    }
                }
            }
            return;
        }
        if (this.type === "ghost") {
            if (this.originY === undefined) this.originY = this.y;
            const p = game.player;
            const nearCam = enemyIsNearCamera(this);
            if (this.ghostState === "floating") {
                this.patrolAngle = (this.patrolAngle || 0) + .028;
                const idealY = this.originY + Math.sin(this.patrolAngle) * 16;
                if (this.isStunAscending) {
                    if (this.y > idealY) {
                        this.y -= Math.min(2.6, this.y - idealY);
                        this.scaleY = 1.15;
                        this.scaleX = 0.9;
                    } else {
                        this.y = idealY;
                        this.isStunAscending = false;
                    }
                } else {
                    this.y = idealY;
                }
                this.x = this.originX + Math.sin(this.patrolAngle * .6) * (this.range || 60);
                if (p) this.facing = p.x + p.w / 2 < this.x + this.w / 2 ? -1 : 1;
                if (!this.isStunAscending) {
                    this.ghostTimer--;
                    if (this.ghostTimer === 30 && nearCam) {
                        try {
                            playSound(480, .25, "sawtooth", .2, 180);
                            addFloatingText(this.x + this.w / 2, this.y - 18, __("flt_ghost_dash") || "¡EMBESTIDA!", "#f87171", 17);
                        } catch (e) {}
                    }
                    if (this.ghostTimer <= 0 && nearCam && p && !p.dead) {
                        this.ghostState = "dashing";
                        this.dashDir = p.x + p.w / 2 < this.x + this.w / 2 ? -1 : 1;
                        this.facing = this.dashDir;
                        this.dashSpeed = 9.5;
                        this.dashDuration = 32;
                    }
                }
            } else if (this.ghostState === "dashing") {
                this.x += this.dashDir * this.dashSpeed;
                this.dashSpeed *= .96;
                this.dashDuration--;
                if (p && !p.dead && p.invulnerable <= 0) {
                    const hitX = Math.abs(p.x + p.w / 2 - (this.x + this.w / 2)) < p.w / 2 + this.w / 2;
                    const hitY = Math.abs(p.y + p.h / 2 - (this.y + this.h / 2)) < p.h / 2 + this.h / 2;
                    if (hitX && hitY) {
                        p.takeDamage(25);
                        p.vx = this.dashDir * 11;
                        p.vy = -6.5;
                        try {
                            applyShake(10);
                            playSound(110, .35, "sawtooth", .3, 40);
                        } catch (e) {}
                    }
                }
                if (this.dashDuration <= 0) {
                    this.ghostState = "floating";
                    this.ghostTimer = 190 + Math.floor(Math.random() * 60);
                }
            }
            return;
        }
        if (currentLevel < 4 || currentLevel === 6 || currentLevel === "hub") {
            if (this.type === "chaser" || this.enraged) {
                const p = game.player;
                if (p) {
                    const dx = p.x + p.w / 2 - (this.x + this.w / 2);
                    const dy = p.y + p.h / 2 - (this.y + this.h / 2);
                    const dist = Math.hypot(dx, dy);
                    if (dist < 480 || this.enraged) {
                        const curSpd = this.enraged ? Math.max(3.2, this.speed) : this.speed * .8;
                        this.x += Math.sign(dx) * curSpd;
                        this.facing = Math.sign(dx);
                        if (this.enraged && this.onGround && Math.random() < .04) {
                            this.vy = -10.5;
                            this.onGround = false;
                        }
                    } else {
                        if (this.onGround && (this.type === "apple" || this.type === "happy" || this.type === undefined)) {
                            this.jumpDelay = (this.jumpDelay || 0) - 1;
                            this.vx = 0;
                            if (this.jumpDelay <= 0) {
                                this.vy = -(6.5 + Math.random() * 2.5);
                                this.vx = this.speed * this.direction * 1.6;
                                this.onGround = false;
                                this.jumpDelay = 20 + Math.random() * 30;
                            }
                        } else if (this.type === "apple" || this.type === "happy" || this.type === undefined) {
                            this.x += this.vx || 0;
                        } else {
                            this.x += this.speed * this.direction;
                        }
                        if (this.x > this.originX + this.range) { this.direction = -1; this.facing = -1; }
                        else if (this.x < this.originX - this.range) { this.direction = 1; this.facing = 1; }
                    }
                }
            } else {
                if (this.range > 0 && this.speed > 0) {
                    if (this.type === "apple" || this.type === "happy" || this.type === undefined) {
                        if (this.onGround) {
                            this.jumpDelay = (this.jumpDelay || 0) - 1;
                            this.vx = 0;
                            if (this.jumpDelay <= 0) {
                                this.vy = -(6.5 + Math.random() * 2.5);
                                this.vx = this.speed * this.direction * 1.6;
                                this.onGround = false;
                                this.jumpDelay = 20 + Math.random() * 30;
                            }
                        } else {
                            this.x += this.vx || 0;
                        }
                    } else {
                        this.x += this.speed * this.direction;
                    }
                    if (this.x > this.originX + this.range) { this.direction = -1; this.facing = -1; }
                    else if (this.x < this.originX - this.range) { this.direction = 1; this.facing = 1; }
                }
            }
        } else {
            if (this.range > 0 && this.speed > 0) {
                if (this.type === "apple" || this.type === "happy" || this.type === undefined) {
                    if (this.onGround) {
                        this.jumpDelay = (this.jumpDelay || 0) - 1;
                        this.vx = 0;
                        if (this.jumpDelay <= 0) {
                            this.vy = -(6.5 + Math.random() * 2.5);
                            this.vx = this.speed * this.direction * 1.6;
                            this.onGround = false;
                            this.jumpDelay = 20 + Math.random() * 30;
                        }
                    } else {
                        this.x += this.vx || 0;
                    }
                } else {
                    this.x += this.speed * this.direction;
                }
                if (this.x > this.originX + this.range) { this.direction = -1; this.facing = -1; }
                else if (this.x < this.originX - this.range) { this.direction = 1; this.facing = 1; }
            }
        }
        if (this.type === "snowman_blower") {
            const p = game.player;
            if (p) this.facing = p.x + p.w / 2 < this.x + this.w / 2 ? -1 : 1;
            const nearCam = enemyIsNearCamera(this);
            if (nearCam) {
                this.blowCycle = (this.blowCycle || 0) + 1;
                const cycleLen = 220;
                const blowDuration = 145;
                this.isBlowing = this.blowCycle % cycleLen < blowDuration;
                if (this.isBlowing) {
                    this.mouthOpenTimer = 4;
                    const mouthX = this.x + (this.facing === 1 ? this.w : 0);
                    const mouthY = this.y + 16;
                    for (let k = 0; k < 2; k++) {
                        particles.push({
                            x: mouthX,
                            y: mouthY + (Math.random() - .5) * 10,
                            vx: this.facing * (5.8 + Math.random() * 4.2),
                            vy: (Math.random() - .5) * 2.2,
                            life: 28,
                            color: Math.random() < .65 ? "#ffffff" : "#b0f0ff",
                            size: 2.2 + Math.random() * 3.2,
                            type: "spark"
                        });
                    }
                    if (this.blowCycle % 38 === 0 && p && Math.abs(p.x - this.x) < 420) {
                        playSound(150, .16, "sine", .12, 110);
                    }
                    if (p && !p.frozen && !p.dead && gameState === "playing") {
                        const pCenter = p.x + p.w / 2;
                        const thisCenter = this.x + this.w / 2;
                        const distX = pCenter - thisCenter;
                        const isInFront = this.facing === 1 && distX > 0 && distX < 400 || this.facing === -1 && distX < 0 && distX > -400;
                        const isInHeight = Math.abs(p.y + p.h / 2 - (this.y + this.h / 2)) < 130;
                        if (isInFront && isInHeight) {
                            p.x += this.facing * 1.95;
                            p.vx += this.facing * .42;
                            if (p.vx * this.facing < 0) {
                                p.vx *= .78;
                            }
                            if (Math.random() < .3) {
                                particles.push({
                                    x: p.x + Math.random() * p.w,
                                    y: p.y + Math.random() * p.h,
                                    vx: this.facing * (2 + Math.random() * 2),
                                    vy: (Math.random() - .5) * 2,
                                    life: 14,
                                    color: "#d0f4ff",
                                    size: 2,
                                    type: "spark"
                                });
                            }
                        }
                    }
                }
            }
        }
        if (this.type === "snowman_slammer") {
            const p = game.player;
            const nearCam = enemyIsNearCamera(this);
            if (p && nearCam) this.facing = p.x + p.w / 2 < this.x + this.w / 2 ? -1 : 1;
            if (nearCam && this.onGround) {
                this.slamTimer--;
                if (this.slamTimer <= 24 && this.slamTimer > 0) {
                    this.scaleX = 1.25;
                    this.scaleY = .75;
                    if (Math.random() < .4) {
                        particles.push({
                            x: this.x + this.w / 2 + (Math.random() - .5) * this.w,
                            y: this.y + this.h,
                            vx: (Math.random() - .5) * 2,
                            vy: -Math.random() * 2,
                            life: 10,
                            color: "#ffffff",
                            size: 2.5,
                            type: "spark"
                        });
                    }
                }
                if (this.slamTimer <= 0) {
                    this.vy = -12.5;
                    this.vx = (p ? Math.sign(p.x - this.x) : this.facing) * 1.5;
                    this.onGround = false;
                    this.inSlamAir = true;
                    this.scaleX = .75;
                    this.scaleY = 1.35;
                    playSound(170, .16, "triangle", .14, 280);
                }
            } else if (this.inSlamAir) {
                this.x += this.vx || 0;
                if (this.vy > 0) {
                    this.vy += .45;
                }
            }
        }
        if (this.type === "daisy_flower") {
            const p = game.player;
            const nearCam = enemyIsNearCamera(this);
            if (p) this.facing = p.x + p.w / 2 < this.x + this.w / 2 ? -1 : 1;
            if (nearCam && p && !p.dead) {
                const dist = Math.hypot(p.x + p.w / 2 - (this.x + this.w / 2), p.y + p.h / 2 - (this.y + this.h / 2));
                if (this.pressureCooldown > 0) {
                    this.pressureCooldown--;
                } else if (dist < 480) {
                    this.isPressuring = true;
                    this.pressureTimer = (this.pressureTimer || 0) + 1;
                    const pressRatio = Math.min(1, this.pressureTimer / 65);
                    this.scaleX = 1 + Math.sin(time * .7) * (.05 + .15 * pressRatio);
                    this.scaleY = 1 - Math.sin(time * .7) * (.05 + .15 * pressRatio);
                    if (Math.random() < .35) {
                        particles.push({
                            x: this.x + this.w / 2 + (Math.random() - .5) * (this.w * .6),
                            y: this.y + this.h * .4 + (Math.random() - .5) * 30,
                            vx: (Math.random() - .5) * 3,
                            vy: -Math.random() * 3 - 1,
                            life: 14,
                            color: Math.random() < .5 ? "#eab308" : "#ef4444",
                            size: 2.5 + Math.random() * 2,
                            type: "spark"
                        });
                    }
                    if (this.pressureTimer % 20 === 1) {
                        playSound(280 + this.pressureTimer * 4, .12, "sawtooth", .12, 180);
                    }
                    if (this.pressureTimer >= 65) {
                        this.pressureTimer = 0;
                        this.isPressuring = false;
                        this.pressureCooldown = 120;
                        this.mouthOpenTimer = 28;
                        this.scaleX = 1.35;
                        this.scaleY = .75;
                        applyShake(4);
                        playSound(420, .25, "sawtooth", .22, 900);
                        const flowerCenterX = this.x + this.w / 2;
                        const flowerCenterY = this.y + this.h * .42;
                        const targetAngle = Math.atan2(p.y + p.h / 2 - flowerCenterY, p.x + p.w / 2 - flowerCenterX);
                        const thornCount = 4;
                        for (let t = 0; t < thornCount; t++) {
                            const spread = (t - (thornCount - 1) / 2) * .2;
                            const tAngle = targetAngle + spread;
                            const tSpeed = 5.8;
                            enemyProjectiles.push({
                                x: flowerCenterX - 10,
                                y: flowerCenterY - 6,
                                w: 36,
                                h: 10,
                                vx: Math.cos(tAngle) * tSpeed,
                                vy: Math.sin(tAngle) * tSpeed,
                                angle: tAngle,
                                damage: 20,
                                isLongThorn: true,
                                color: "#84cc16",
                                life: 140
                            });
                        }
                    }
                } else {
                    this.isPressuring = false;
                    if (this.pressureTimer > 0) this.pressureTimer--;
                }
            } else {
                this.isPressuring = false;
                this.pressureTimer = 0;
            }
        }
        if (this.type === "magma_titan") {
            const p = game.player;
            const nearCam = enemyIsNearCamera(this);
            if (p && nearCam) {
                const dx = p.x + p.w / 2 - (this.x + this.w / 2);
                const dist = Math.abs(dx);
                if (dist < 650) {
                    this.facing = dx < 0 ? -1 : 1;
                    if (this.onGround) {
                        this.jumpTimer = (this.jumpTimer || 0) + 1;
                        if (this.jumpTimer >= 35 && this.jumpTimer < 55) {
                            this.scaleX = 1.4;
                            this.scaleY = .6;
                            if (Math.random() < .35) {
                                particles.push({
                                    x: this.x + this.w / 2 + (Math.random() - .5) * this.w * .6,
                                    y: this.y + this.h - 4,
                                    vx: (Math.random() - .5) * 2,
                                    vy: -Math.random() * 2,
                                    life: 14,
                                    color: Math.random() < .5 ? "#ff4500" : "#ea580c",
                                    size: 3,
                                    type: "spark"
                                });
                            }
                        }
                        if (this.jumpTimer >= 55) {
                            this.jumpTimer = 0;
                            this.vy = -11.8;
                            this.vx = this.facing * 3.2;
                            this.onGround = false;
                            this.scaleX = .65;
                            this.scaleY = 1.45;
                            playSound(150, .22, "triangle", .18, 60);
                        }
                    } else {
                        this.x += this.vx || 0;
                    }
                }
            }
        }
        if (this.jump && this.jumpInterval > 0 && this.type !== "snowman_slammer" && this.type !== "snowman_blower") {
            this.jumpTimer--;
            if (this.onGround && this.jumpTimer > 0 && this.jumpTimer <= 12) {
                const prep = (12 - this.jumpTimer) / 12;
                this.scaleX = 1 + prep * 0.32;
                this.scaleY = 1 - prep * 0.35;
            }
            if (this.jumpTimer <= 0 && this.onGround) {
                this.jumpTimer = this.jumpInterval;
                this.vy = -11;
                this.onGround = false;
                this.scaleX = 0.68;
                this.scaleY = 1.42;
                if (currentLevel < 3) {
                    for (let i = 0; i < 6; i++) {
                        particles.push({
                            x: this.x + this.w / 2 + (Math.random() - .5) * 14,
                            y: this.y + this.h,
                            vx: (Math.random() - .5) * 3,
                            vy: -Math.random() * 2.5 - 0.5,
                            life: 14,
                            color: "#cbd5e1",
                            size: 2 + Math.random() * 3,
                            type: "spark"
                        });
                    }
                }
            }
        }
        if (!this.onGround) {
            if (this.vy < -2) {
                const rise = Math.min(0.35, Math.abs(this.vy) * 0.028);
                this.scaleX += ((1 - rise * 0.55) - this.scaleX) * 0.2;
                this.scaleY += ((1 + rise) - this.scaleY) * 0.2;
            } else if (this.vy > 2.5) {
                const fall = Math.min(0.28, this.vy * 0.022);
                this.scaleX += ((1 + fall * 0.55) - this.scaleX) * 0.2;
                this.scaleY += ((1 - fall * 0.4) - this.scaleY) * 0.2;
            } else {
                this.scaleX += (1 - this.scaleX) * .15;
                this.scaleY += (1 - this.scaleY) * .15;
            }
        } else {
            this.scaleX += (1 - this.scaleX) * .18;
            this.scaleY += (1 - this.scaleY) * .18;
        }
        this.vy += GRAVITY;
        this.y += this.vy;
        let wasOnGround = this.onGround;
        this.onGround = false;
        if (this.vy >= 0) {
            for (let plat of platforms) {
                if (this.x + this.w > plat.x && this.x < plat.x + plat.w && this.y + this.h >= plat.y && this.y + this.h <= plat.y + plat.h + this.vy + 2) {
                    this.y = plat.y - this.h;
                    this.vy = 0;
                    this.onGround = true;
                    if (!wasOnGround) {
                        this.scaleX = 1.38;
                        this.scaleY = 0.64;
                        if (this.type === "magma_titan") {
                            this.scaleX = 1.55;
                            this.scaleY = .45;
                            this.vx = 0;
                            const nearCam = enemyIsNearCamera(this);
                            if (nearCam) {
                                applyShake(3);
                                playSound(120, .16, "sawtooth", .14, 45);
                            }
                        }
                        if (this.type === "snowman_slammer" && this.inSlamAir) {
                            this.inSlamAir = false;
                            this.scaleX = 1.45;
                            this.scaleY = .55;
                            const nearCam = enemyIsNearCamera(this);
                            if (nearCam) {
                                applyShake(5);
                                playSound(95, .28, "sawtooth", .24, 40);
                                for (let k = 0; k < 12; k++) {
                                    particles.push({
                                        x: this.x + this.w / 2 + (Math.random() - .5) * this.w,
                                        y: this.y + this.h,
                                        vx: (Math.random() - .5) * 8,
                                        vy: -Math.random() * 4.5,
                                        life: 18,
                                        color: Math.random() < .5 ? "#ffffff" : "#80d8ff",
                                        size: 3 + Math.random() * 3,
                                        type: "spark"
                                    });
                                }
                                const p = game.player;
                                if (p) this.facing = p.x + p.w / 2 < this.x + this.w / 2 ? -1 : 1;
                                const spawnX = this.x + (this.facing === 1 ? this.w + 4 : -24);
                                const spawnY = this.y + this.h * .45;
                                for (let k = 0; k < 2; k++) {
                                    const speed = 4.8 + k * 1.5;
                                    enemyProjectiles.push({
                                        x: spawnX,
                                        y: spawnY + (k === 0 ? 0 : -8),
                                        w: 20,
                                        h: 20,
                                        radius: 10,
                                        vx: this.facing * speed,
                                        vy: -1.2 + k * .8,
                                        damage: 16,
                                        isSnowball: true,
                                        color: "#e8f8ff",
                                        rot: Math.random() * Math.PI * 2,
                                        rotSpeed: this.facing * .16,
                                        life: 160,
                                        trail: []
                                    });
                                }
                                playSound(210, .16, "triangle", .14, 110);
                            }
                            this.slamTimer = 150 + Math.floor(Math.random() * 60);
                        }
                    }
                    break;
                }
            }
        }
        if (this.y > VIEW_H + 50) this.active = false;
        if (this.shoot && enemyIsNearCamera(this) && this.shootInterval > 0) {
            this.shootTimer--;
            if (this.shootTimer <= 0) {
                this.shootTimer = this.shootInterval;
                if (currentLevel < 3 && this.type === "burst") {
                    this.shootBurst = 3;
                    this.burstDelay = 0;
                } else {
                    this.fireProjectile();
                    this.scaleX = 1.2;
                    this.scaleY = 1.2;
                }
            }
            if (this.shootBurst > 0) {
                this.burstDelay = (this.burstDelay || 0) - 1;
                if (this.burstDelay <= 0) {
                    this.burstDelay = 12;
                    this.shootBurst--;
                    this.fireProjectile();
                    this.scaleX = 1.25;
                    this.scaleY = 1.25;
                }
            }
        }
        const _CONTACT_EXEMPT = [
            "podoboo", "electric_cross", "fire_spawner"
        ];
        if (!_CONTACT_EXEMPT.includes(this.type) && !game.inHunt) {
            const _p = game.player;
            if (_p && _p.invulnerable <= 0 && !_p.dead && !_p.frozen && this.active && (this.stunTimer || 0) <= 0) {
                if (_p.x + _p.w > this.x && _p.x < this.x + this.w &&
                    _p.y + _p.h > this.y && _p.y < this.y + this.h) {
                    const _isBig = this.isBoss || this.isMiniBoss || this.miniBoss || this.isGiant || this.giant ||
                        this.type === "miniboss" || this.type === "daisy_flower" || this.type === "bubble_tree" ||
                        this.type === "magma_titan" || this.type === "mega_snowman" || this.type === "giant_snowman" ||
                        (this.w >= 64 && this.h >= 64);
                    const _area = this.w * this.h;
                    const _dmg = _isBig ? Math.min(35, Math.round(18 + _area / 600)) : Math.min(22, Math.round(8 + _area / 900));
                    const _kbX = _isBig ? Math.min(18, Math.max(13, 12 + _area / 800)) : Math.min(11, Math.max(7, 6 + _area / 1600));
                    const _kbTimer = _isBig ? 24 : 16;
                    const _kbVy = _isBig ? -8 : -6;

                    const _dir = (_p.x + _p.w / 2) < (this.x + this.w / 2) ? -1 : 1;
                    _p.takeDamage(_dmg);
                    _p._knockbackVx = _dir * _kbX;
                    _p._knockbackTimer = _kbTimer;
                    _p.vx = _dir * _kbX;
                    _p.vy = _kbVy;
                    _p.onGround = false;
                    if (_isBig) {
                        applyShake(10);
                        playSound(140, .3, "sawtooth", .35, 45);
                    }
                }
            }
        }
    }
    fireProjectile() {
        if (!game.player) return;
        if (enemyProjectiles.length >= 22) return;
        this.mouthOpenTimer = 22;
        this.scaleX = 1.3;
        this.scaleY = .8;
        const px = this.x + this.w / 2, py = this.y + this.h / 2;
        const targetX = game.player.x + game.player.w / 2;
        const targetY = game.player.y + game.player.h / 2;
        const angle = Math.atan2(targetY - py, targetX - px);
        const playerDir = targetX > px ? 1 : -1;
        this.facing = playerDir;
        const isFacingPlayer = true;
        let bType = this.bulletType;
        if (!bType) {
            if (this.type === "electric" || this.type === "electric_squid" || this.isElectricSquid || (currentLevel === 1 && (this.color === "#00bcd4" || this.color === "#00ffee" || this.color === "#00ffcc"))) {
                bType = "electric";
            } else if (this.type === "demon" || this.texture === "demon") {
                bType = Math.random() < .5 ? "cluster_fireball" : "explosive_fireball";
            } else if (this.type === "flaming" || this.isOnFire || game.fireMode) {
                bType = Math.random() < .5 ? "cluster_fireball" : "fireball";
            } else if (this.type === "burst") {
                bType = "spread";
            } else {
                bType = "normal";
            }
        }
        if (this.bulletType === "horror_blood_ball" || (window.postGameHorror && !this.isBoss && !this.isMiniBoss)) {
            const speed = 4.4;
            enemyProjectiles.push({
                x: px - 8,
                y: py - 8,
                w: 16,
                h: 16,
                radius: 8,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                damage: 15,
                color: "#dc2626",
                isHorrorBall: true,
                trail: []
            });
            try {
                playSound(160, 0.16, "sawtooth", 0.18, 50);
            } catch (e) {}
            return;
        }
        if (this.type === "igneous_turret") {
            const speed = 4.2;
            const bRadius = 10;
            enemyProjectiles.push({
                x: px,
                y: py - 6,
                w: bRadius * 2,
                h: bRadius * 2,
                radius: bRadius,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                damage: 22,
                isFireball: true,
                color: "#ff3300"
            });
            try {
                playSound(240, 0.28, "sawtooth", 0.25, 75);
                createExplosion(px + Math.cos(angle) * 16, py - 6 + Math.sin(angle) * 16, "#ff6600", 14, 8);
            } catch (e) {}
            return;
        }
        if (bType === "fire_bubble" || this.type === "fire_tree") {
            const speed = 2.4;
            const bRadius = this.isGiant ? 20 : 14;
            const bDamage = this.isGiant ? 26 : 18;
            enemyProjectiles.push({
                x: px,
                y: py - (this.isGiant ? 16 : 8),
                w: bRadius * 2,
                h: bRadius * 2,
                radius: bRadius,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                damage: bDamage,
                isFireBubble: true,
                isSlowBubble: true,
                isGiantBubble: this.isGiant,
                color: "#ff3300",
                seed: Math.random() * 10
            });
            if (this.isGiant) {
                enemyProjectiles.push({
                    x: px,
                    y: py - 24,
                    w: 26,
                    h: 26,
                    radius: 13,
                    vx: Math.cos(angle + .28) * (speed * .92),
                    vy: Math.sin(angle + .28) * (speed * .92),
                    damage: 18,
                    isFireBubble: true,
                    isSlowBubble: true,
                    color: "#ff8800",
                    seed: Math.random() * 10
                });
            }
            playSound(190, .25, "sawtooth", .3, 60);
            return;
        }
        if (bType === "slow_bubble" || this.type === "bubble_tree") {
            const speed = this.isGiant ? 2.5 : 2;
            const bRadius = this.isGiant ? 22 : 11;
            const bDamage = this.isGiant ? 24 : 12;
            enemyProjectiles.push({
                x: px,
                y: py - (this.isGiant ? 16 : 6),
                w: bRadius * 2,
                h: bRadius * 2,
                radius: bRadius,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                damage: bDamage,
                isSlowBubble: true,
                isGiantBubble: this.isGiant,
                color: this.isGiant ? "#0284c7" : "#67e8f9",
                seed: Math.random() * 10
            });
            if (this.isGiant) {
                enemyProjectiles.push({
                    x: px,
                    y: py - 20,
                    w: 26,
                    h: 26,
                    radius: 13,
                    vx: Math.cos(angle + .32) * (speed * .9),
                    vy: Math.sin(angle + .32) * (speed * .9),
                    damage: 16,
                    isSlowBubble: true,
                    isGiantBubble: true,
                    color: "#38bdf8",
                    seed: Math.random() * 10
                });
            }
            playSound(this.isGiant ? 340 : 580, .22, "sine", .25, this.isGiant ? 180 : 400);
            return;
        }
        if (bType === "apple_arc" || this.type === "apple") {
            const dir = isFacingPlayer ? playerDir : this.facing || 1;
            const hDist = Math.max(80, Math.min(380, Math.abs(targetX - px)));
            const speedX = Math.max(2.8, Math.min(5.2, hDist * .016));
            enemyProjectiles.push({
                x: px,
                y: py - 8,
                w: 20,
                h: 20,
                radius: 10,
                vx: dir * speedX,
                vy: -7 - Math.random() * 1.5,
                gravity: .28,
                isArc: true,
                isAppleArc: true,
                damage: 15,
                color: "#ef4444",
                rot: 0,
                rotSpeed: dir * .15
            });
            playSound(420, .2, "triangle", .22, 280);
            return;
        }
        if (bType === "bubble_spray" || this.type === "bubble_puffer") {
            const count = 5;
            const baseAng = angle;
            for (let k = 0; k < count; k++) {
                const spread = (k - (count - 1) / 2) * .22;
                const spd = 3.2 + Math.random() * 1.6;
                enemyProjectiles.push({
                    x: px + (this.facing || 1) * 16,
                    y: py,
                    w: 18,
                    h: 18,
                    radius: 9,
                    vx: Math.cos(baseAng + spread) * spd,
                    vy: Math.sin(baseAng + spread) * spd + (Math.random() - .5) * .8,
                    damage: 12,
                    isBubbleSpray: true,
                    color: "#38bdf8",
                    life: 48,
                    maxLife: 48,
                    seed: Math.random() * 10
                });
            }
            playSound(520, .25, "sine", .25, 300);
            return;
        }
        if (bType === "frost_breath" || this.type === "ice_orb") {
            const count = 6;
            for (let k = 0; k < count; k++) {
                const spread = (k - (count - 1) / 2) * .25;
                const spd = 3.4 + Math.random() * 1.8;
                enemyProjectiles.push({
                    x: px + (this.facing || 1) * 16,
                    y: py,
                    w: 22,
                    h: 22,
                    radius: 11,
                    vx: Math.cos(angle + spread) * spd,
                    vy: Math.sin(angle + spread) * spd,
                    damage: 14,
                    isFrostBreath: true,
                    color: "#a5f3fc",
                    life: 52,
                    maxLife: 52
                });
            }
            playSound(300, .3, "sawtooth", .25, 120);
            return;
        }
        if (bType === "giant_snowball_arc" || this.type === "giant_snowman" || this.type === "mega_snowman") {
            const dir = isFacingPlayer ? playerDir : this.facing || 1;
            const hDist = Math.max(90, Math.min(420, Math.abs(targetX - px)));
            const speedX = Math.max(3.2, Math.min(6, hDist * .016));
            enemyProjectiles.push({
                x: px,
                y: py - 24,
                w: 44,
                h: 44,
                radius: 22,
                vx: dir * speedX,
                vy: -8.5 - Math.random() * 1.5,
                gravity: .26,
                isArc: true,
                isSnowball: true,
                isGiantSnowball: true,
                isGiantSnowballArc: true,
                damage: 24,
                color: "#ffffff",
                rot: 0,
                rotSpeed: dir * .12,
                trail: []
            });
            playSound(180, .26, "triangle", .25, 90);
            return;
        }
        if (bType === "flame_spray" || this.type === "magma_titan" && this.shoot !== false) {
            const count = 6;
            const baseAng = angle;
            for (let k = 0; k < count; k++) {
                const spread = (k - (count - 1) / 2) * .24;
                const spd = 4.4 + Math.random() * 2.2;
                enemyProjectiles.push({
                    x: px + (this.facing || 1) * 26,
                    y: py + 6,
                    w: 24,
                    h: 24,
                    radius: 12,
                    vx: Math.cos(baseAng + spread) * spd,
                    vy: Math.sin(baseAng + spread) * spd + (Math.random() - .5) * 1,
                    damage: 15,
                    isFlameSpray: true,
                    color: "#ff4500",
                    life: 48,
                    maxLife: 48,
                    seed: Math.random() * 10
                });
            }
            playSound(220, .32, "sawtooth", .28, 55);
            return;
        }
        if (bType === "paralyze_diamond") {
            const speed = 4.2;
            enemyProjectiles.push({
                x: px,
                y: py,
                w: 22,
                h: 22,
                radius: 11,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                damage: 15,
                isParalyzeDiamond: true,
                color: "#e879f9",
                rot: 0,
                sparkleSeed: Math.random() * 10
            });
            playSound(740, .22, "sine", .22, 380);
            return;
        }
        if (bType === "halloween_fire") {
            const speed = 2.8;
            enemyProjectiles.push({
                x: px - 14,
                y: py - 14,
                w: 28,
                h: 28,
                radius: 14,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                damage: 16,
                isHalloweenFire: true,
                color: "#ea580c"
            });
            playSound(340, .16, "sawtooth", .18, 120);
            return;
        }
        if (bType === "giant_snowball" || this.type === "snowball_head") {
            const speed = 4.4;
            enemyProjectiles.push({
                x: px - 18,
                y: py - 18,
                w: 36,
                h: 36,
                radius: 18,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                damage: 22,
                isSnowball: true,
                isGiantSnowball: true,
                color: "#e8f8ff",
                rot: 0,
                rotSpeed: this.facing * .12,
                life: 220,
                trail: []
            });
            playSound(210, .22, "triangle", .2, 100);
            return;
        }
        if (bType === "electric") {
            const homingActive = isFacingPlayer;
            const speed = 4.6;
            enemyProjectiles.push({
                x: px,
                y: py,
                w: 16,
                h: 16,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                speed: speed,
                color: "#00f0ff",
                damage: 16,
                isElectric: true,
                homing: homingActive,
                homingTimer: homingActive ? 85 : 0,
                turnSpeed: .048,
                trail: []
            });
            playSound(620, .14, "sawtooth", .15, 260);
            return;
        }
        if (bType === "cluster_fireball") {
            const speed = 4.4;
            enemyProjectiles.push({
                x: px,
                y: py,
                w: 18,
                h: 18,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: "#ff6600",
                damage: 14,
                isFireball: true,
                isCluster: true,
                splitTimer: 34 + Math.floor(Math.random() * 12),
                trail: []
            });
            playSound(240, .15, "sawtooth", .16, 110);
            return;
        }
        if (bType === "explosive_fireball") {
            const speed = 3.6;
            enemyProjectiles.push({
                x: px - 10,
                y: py - 10,
                w: 36,
                h: 36,
                radius: 20,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: "#ff2200",
                damage: 22,
                isFireball: true,
                isExplosiveFireball: true,
                life: 140,
                trail: []
            });
            playSound(160, .28, "sawtooth", .22, 50);
            return;
        }
        if (bType === "spread") {
            const speed = 5.2;
            const spreadAngles = [ -.22, 0, .22 ];
            spreadAngles.forEach(off => {
                const a = angle + off;
                enemyProjectiles.push({
                    x: px,
                    y: py,
                    w: 12,
                    h: 12,
                    vx: Math.cos(a) * speed,
                    vy: Math.sin(a) * speed,
                    color: this.color || "#ff00aa",
                    damage: 10,
                    trail: []
                });
            });
            playSound(480, .12, "square", .14, 240);
            return;
        }
        if (bType === "ink" || this.type === "ink_octopus") {
            const speed = 5.2;
            enemyProjectiles.push({
                x: px,
                y: py,
                w: 16,
                h: 16,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: "#0a0614",
                damage: 14,
                isInkBullet: true,
                trail: []
            });
            playSound(280, .14, "sawtooth", .16, 70);
            return;
        }
        if (bType === "fireball" || this.type === "demon" || this.isOnFire || game.fireMode) {
            const speed = 4.8;
            enemyProjectiles.push({
                x: px,
                y: py,
                w: 18,
                h: 18,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: "#ff6600",
                damage: 16,
                isFireball: true,
                trail: []
            });
            playSound(200, .12, "sawtooth", .1, 100);
            return;
        }
        const speed = currentLevel === 0 ? 3.8 : 5.8;
        enemyProjectiles.push({
            x: px,
            y: py,
            w: 12,
            h: 12,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: this.color || "#ff4444",
            damage: currentLevel === 0 ? 8 : 12,
            isFireball: false,
            trail: []
        });
        playSound(380, .1, "triangle", .08, 180);
    }
    takeDamage(amount) {
        if (!this.active || this.isObstacle || (this.summoningTimer > 0)) return;
        if (game.godMode) amount = 999;
        if (this.hasShield && this.shieldActive && this.shieldHp > 0) {
            this.shieldHp -= amount;
            this.shieldHitFlash = 10;
            playSound(680, .12, "sawtooth", .18, 920);
            addFloatingText(this.x + this.w / 2, this.y - 15, `-${amount}`, "#00f0ff", 15);
            for (let i = 0; i < 7; i++) {
                particles.push({
                    x: this.x + this.w / 2 + (Math.random() - .5) * (this.shieldRadius || 28) * 1.4,
                    y: this.y + this.h / 2 + (Math.random() - .5) * (this.shieldRadius || 28) * 1.4,
                    vx: (Math.random() - .5) * 6,
                    vy: (Math.random() - .5) * 6,
                    life: 14,
                    color: "#00ffff",
                    size: 3 + Math.random() * 3,
                    type: "spark"
                });
            }
            if (this.shieldHp <= 0) {
                this.shieldActive = false;
                this.shieldHp = 0;
                this.enraged = true;
                playSound(950, .35, "square", .3, 110);
                playSound(220, .4, "sawtooth", .3, 60);
                applyShake(8);
                addFloatingText(this.x + this.w / 2, this.y - 30, typeof __ === "function" ? __("flt_escudo_roto") : "¡ESCUDO ROTO!", "#ff0055", 22);
                addFloatingText(this.x + this.w / 2, this.y - 52, typeof __ === "function" ? __("flt_furioso") : "¡FURIOSO!", "#ffea00", 18);
                for (let i = 0; i < 28; i++) {
                    const ang = Math.random() * Math.PI * 2;
                    const spd = 3 + Math.random() * 7;
                    particles.push({
                        x: this.x + this.w / 2,
                        y: this.y + this.h / 2,
                        vx: Math.cos(ang) * spd,
                        vy: Math.sin(ang) * spd,
                        life: 30 + Math.random() * 15,
                        color: Math.random() < .5 ? "#00f0ff" : "#ff00aa",
                        size: 4 + Math.random() * 4,
                        type: "spark"
                    });
                }
                this.speed = Math.max(3.2, (this.baseSpeed || 1.2) * 2.3);
                if (this.range === 0) this.range = 140;
                this.shootInterval = Math.max(40, Math.floor((this.shootInterval || 100) * .55));
                this.jump = true;
                this.jumpInterval = 55;
                this.jumpTimer = 15;
            }
            return;
        }
        if (this.isBoatFish) {
            this.health = 0;
        } else {
            this.health -= amount;
            if (this.type === "ghost") {
                this.ghostHits = (this.ghostHits || 0) + 1;
                if (this.ghostHits >= 2) this.health = 0;
            }
            if (this.health <= 0 && window.postGameHorror) {
                for (let i = 0; i < 8; i++) {
                    blood.push({
                        x: this.x + this.w / 2,
                        y: this.y + this.h / 2,
                        vx: (Math.random() - .5) * 8,
                        vy: (Math.random() - .5) * 8,
                        life: 25,
                        color: "#b91c1c"
                    });
                }
            }
        }
        this.hurtTimer = 16;
        this.mouthOpenTimer = 18;
        if (Math.abs((this.scaleX || 1) - 1) < 0.15) {
            this.scaleX = 0.84;
            this.scaleY = 1.16;
        }
        addFloatingText(this.x + this.w / 2, this.y - 10, "-" + amount, "#ff4444", 14);

        const hitX = this.x + this.w / 2;
        const hitY = this.y + this.h / 2;
        const hitCols = [ "#ffffff", "#ffd700", "#ff6600", "#ff0055" ];
        for (let k = 0; k < 10; k++) {
            const spd = 3.2 + Math.random() * 5.2;
            const ang = Math.random() * Math.PI * 2;
            particles.push({
                x: hitX + (Math.random() - 0.5) * (this.w * 0.4),
                y: hitY + (Math.random() - 0.5) * (this.h * 0.4),
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd - 1.2,
                life: 16 + Math.random() * 8,
                color: hitCols[k % hitCols.length],
                size: 3.5 + Math.random() * 3.5,
                type: "spark"
            });
        }
        createExplosion(this.x + this.w / 2, this.y + this.h / 2, "#fff", 6, 4);
        if (this.type === "mega_snowman") {
            const pDir = game.player ? game.player.x + game.player.w / 2 < this.x + this.w / 2 ? -1 : 1 : this.facing || 1;
            if (this.health > 0 && this.health <= this.maxHealth * .66 && this.snowmanBalls === 3) {
                this.snowmanBalls = 2;
                createExplosion(this.x + this.w / 2, this.y + this.h - 35, "#ffffff", 42, 26, [ "#ffffff", "#bae6fd", "#38bdf8" ]);
                applyShake(7);
                playSound(130, .35, "sawtooth", .28, 45);
                addFloatingText(this.x + this.w / 2, this.y - 25, typeof __ === "function" ? __("flt_bola_inferior") : "¡BOLA INFERIOR!", "#38bdf8", 18);
                enemyProjectiles.push({
                    x: this.x + (pDir < 0 ? -10 : this.w - 20),
                    y: this.y + this.h - 45,
                    w: 70,
                    h: 70,
                    radius: 35,
                    vx: pDir * 6.2,
                    vy: 0,
                    damage: 25,
                    isRollingSnowball: true,
                    isSnowball: true,
                    rot: 0,
                    color: "#e0f2fe"
                });
                this.y += 45;
                this.h -= 45;
            } else if (this.health > 0 && this.health <= this.maxHealth * .33 && this.snowmanBalls === 2) {
                this.snowmanBalls = 1;
                createExplosion(this.x + this.w / 2, this.y + this.h - 25, "#ffffff", 36, 22, [ "#ffffff", "#bae6fd", "#38bdf8" ]);
                applyShake(7);
                playSound(150, .35, "sawtooth", .28, 55);
                addFloatingText(this.x + this.w / 2, this.y - 25, typeof __ === "function" ? __("flt_bola_media") : "¡BOLA MEDIA!", "#38bdf8", 18);
                enemyProjectiles.push({
                    x: this.x + (pDir < 0 ? -10 : this.w - 20),
                    y: this.y + this.h - 35,
                    w: 56,
                    h: 56,
                    radius: 28,
                    vx: pDir * 7.5,
                    vy: 0,
                    damage: 26,
                    isRollingSnowball: true,
                    isSnowball: true,
                    rot: 0,
                    color: "#e0f2fe"
                });
                this.y += 35;
                this.h -= 35;
            }
        }
        if (currentLevel < 4 || currentLevel === 6 || currentLevel === "hub") {
            for (let i = 0; i < 8; i++) {
                particles.push({
                    x: this.x + this.w / 2 + (Math.random() - .5) * 10,
                    y: this.y + this.h / 2 + (Math.random() - .5) * 10,
                    vx: (Math.random() - .5) * 8,
                    vy: (Math.random() - .5) * 8,
                    life: 15,
                    color: "#ff0",
                    size: 3 + Math.random() * 4,
                    type: "spark"
                });
            }
        }
        if (this.health <= 0) {
            this.active = false;
            if (window.postGameHorror) {
                triggerHorrorEnemyDeath(this);
            }
            if (this.type === "mega_snowman" && this.snowmanBalls >= 1) {
                this.snowmanBalls = 0;
                const pDir = game.player ? game.player.x + game.player.w / 2 < this.x + this.w / 2 ? -1 : 1 : this.facing || 1;
                enemyProjectiles.push({
                    x: this.x + this.w / 2 - 22,
                    y: this.y + this.h / 2 - 22,
                    w: 44,
                    h: 44,
                    radius: 22,
                    vx: pDir * 8.8,
                    vy: -2,
                    damage: 28,
                    isRollingSnowball: true,
                    isSnowball: true,
                    isHead: true,
                    rot: 0,
                    color: "#ffffff"
                });
                playSound(180, .4, "sawtooth", .3, 70);
                addFloatingText(this.x + this.w / 2, this.y - 30, typeof __ === "function" ? __("flt_cabeza_rodante") : "¡CABEZA RODANTE!", "#38bdf8", 20);
            }
            if (typeof window.onHalloweenEnemyDied === "function") {
                try {
                    window.onHalloweenEnemyDied(this);
                } catch (e) {}
            }
            playSound(150, .3, "square", .2, 50);
            const isMiniboss = this.type === "miniboss";
            const expSize = isMiniboss ? 65 : 36;
            const expCount = isMiniboss ? 40 : 20;
            createExplosion(this.x + this.w / 2, this.y + this.h / 2, this.color || "#ff3300", expSize, expCount, [ "#ffff00", "#ff0000", "#ffffff", "#ff8800" ]);
            applyShake(isMiniboss ? 20 : 4);
            if (isMiniboss) {
                applyShake(20);
                playSound(80, .8, "sawtooth", .5, 30);
            }
            if (currentLevel < 4 || currentLevel === 6 || currentLevel === "hub") {
                const pts = isMiniboss ? 500 : 50;
                score += pts;
                updateScore(score);
            }
        } else {
            playSound(500, .1, "square", .1);
        }
    }

    draw(ctx, offsetX) {
        if (!this.active) return;
        const screenX = this.x - offsetX;
        const vw = typeof VIEW_W !== "undefined" ? VIEW_W : 1024;
        if (screenX + this.w < -120 || screenX > vw + 120) return;
        if (this.summoningTimer > 0) {
            drawDarkSummoningCloud(ctx, screenX + this.w / 2, this.y + this.h / 2, this.w, this.h, this.summoningTimer, time);
            return;
        }
        const hover = this.onGround ? 0 : Math.sin(time * .1 + this.hoverOffset) * 2;
        const hurtVibe = (this.hurtTimer > 0) ? Math.sin(this.hurtTimer * 2.8) * Math.min(7, this.hurtTimer * 0.6) : 0;
        const tremble = (game.sadEnemies ? (Math.random() - .5) * 3 : this.enraged ? (Math.random() - .5) * 4 : 0) + hurtVibe;

        const isStunned = (this.stunTimer || 0) > 0;
        let wobbleAngle = 0;
        let dizzySquashX = 1;
        let dizzySquashY = 1;
        let dizzyHopY = 0;
        if (isStunned) {
            wobbleAngle = Math.sin((this.stunTimer || 0) * 0.28) * 0.22;
            dizzySquashX = 1 + Math.sin((this.stunTimer || 0) * 0.42) * 0.13;
            dizzySquashY = 1 - Math.sin((this.stunTimer || 0) * 0.42) * 0.13;
            dizzyHopY = Math.abs(Math.sin((this.stunTimer || 0) * 0.28)) * -3;
        }

        if (isStunned) {
            ctx.save();
            const pivotX = this.x - offsetX + tremble + this.w / 2;
            const pivotY = this.y + hover + this.h;
            ctx.translate(pivotX, pivotY);
            ctx.rotate(wobbleAngle);
            ctx.scale(dizzySquashX, dizzySquashY);
            ctx.translate(-pivotX, -pivotY + dizzyHopY);
        }

        if (game.inHunt || game.sadEnemies || this === game.huntEnemy || currentLevel === 4 && game.happyMode) {
            if (typeof window.drawNightmareFriend === "function") {
                window.drawNightmareFriend(ctx, this, offsetX, time);
            } else {
                drawEntityBase(ctx, this.x - offsetX + tremble, this.y + hover, this.w, this.h, this.scaleX, this.scaleY, this.color, false, this.facing, false);
            }
            if (isStunned) ctx.restore();
            return;
        }
        if (currentLevel < 4 || currentLevel === 6 || currentLevel === "hub") {
            drawEnemyEnhanced(ctx, this.x - offsetX + tremble, this.y + hover, this.w, this.h, this.color, this.facing, this.scaleX, this.scaleY, this.health, this.maxHealth, this.type, this.mouthOpenTimer || 0, this.blinkTimer || 0, this.isOnFire || game.fireMode, this);
        } else {
            drawEntityBase(ctx, this.x - offsetX + tremble, this.y + hover, this.w, this.h, this.scaleX, this.scaleY, this.color, false, this.facing, false);
        }

        if (this.hurtTimer > 0) {
            ctx.save();
            const bx = this.x - offsetX + tremble;
            const by = this.y + hover;
            if (this.hurtTimer === 15 && typeof particles !== "undefined" && Array.isArray(particles)) {
                for (let s = 0; s < 3; s++) {
                    particles.push({
                        x: bx + this.w / 2 + (Math.random() - 0.5) * this.w * 0.5,
                        y: by + this.h / 2 + (Math.random() - 0.5) * this.h * 0.5,
                        vx: (Math.random() - 0.5) * 3,
                        vy: -Math.random() * 2.5 - 1,
                        life: 12,
                        color: Math.random() < 0.5 ? "#ffffff" : "#fef08a",
                        size: 2.2,
                        type: "spark"
                    });
                }
            }
            ctx.restore();
        }

        if (isStunned) {
            ctx.restore();
        }

        if (this.maxHealth > 1 && this.health > 0) {
            const drawX = this.x - offsetX + tremble;
            const drawY = this.y + hover;
            const barW = Math.max(this.w * .85, 38);
            const bx = drawX + this.w / 2 - barW / 2;
            const by = drawY - 14;
            ctx.save();
            ctx.shadowBlur = 0;
            ctx.fillStyle = "rgba(0, 0, 0, 0.78)";
            ctx.fillRect(bx - 1, by - 1, barW + 2, 6);
            const hpRatio = Math.max(0, Math.min(1, this.health / this.maxHealth));
            ctx.fillStyle = hpRatio > .4 ? "#00ff88" : "#ff3344";
            ctx.fillRect(bx, by, barW * hpRatio, 4);
            ctx.restore();
        }

        if (isStunned) {
            const _sx = this.x - offsetX + tremble;
            const _sy = this.y + hover + dizzyHopY;
            const _cx2 = _sx + this.w / 2;
            const _cy2 = _sy + this.h / 2;
            const _headY = _sy;
            const _sAngle = this._stunAngle || 0;
            const _orbitR = Math.max(this.w * 0.65, 24);

            ctx.save();
            const pX = _cx2;
            const pY = _sy + this.h;
            ctx.translate(pX, pY);
            ctx.rotate(wobbleAngle);
            ctx.translate(-pX, -pY);

            const eyeLevelY = _cy2 - this.h * 0.12;
            const eyeSpacing = Math.max(6, this.w * 0.2);
            const eyeR = Math.max(4.5, this.w * 0.12);

            for (let side = -1; side <= 1; side += 2) {
                const ex = _cx2 + side * eyeSpacing;
                const ey = eyeLevelY;
                ctx.fillStyle = "#ffffff";
                ctx.strokeStyle = "#111827";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(ex, ey, eyeR, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.strokeStyle = "#4338ca";
                ctx.lineWidth = 1.6;
                ctx.lineCap = "round";
                ctx.beginPath();
                const spiralTurns = 2.3;
                const spinDir = side;
                for (let a = 0; a <= Math.PI * 2 * spiralTurns; a += 0.22) {
                    const r = (a / (Math.PI * 2 * spiralTurns)) * (eyeR - 1.2);
                    const ang = a + _sAngle * 2.8 * spinDir;
                    const px = ex + Math.cos(ang) * r;
                    const py = ey + Math.sin(ang) * r;
                    if (a === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.stroke();
            }

            const mouthY = _cy2 + this.h * 0.18;
            ctx.strokeStyle = "#111827";
            ctx.lineWidth = 2;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(_cx2 - eyeSpacing * 0.85, mouthY);
            ctx.quadraticCurveTo(_cx2 - eyeSpacing * 0.35, mouthY - 3, _cx2, mouthY);
            ctx.quadraticCurveTo(_cx2 + eyeSpacing * 0.35, mouthY + 3, _cx2 + eyeSpacing * 0.85, mouthY);
            ctx.stroke();

            ctx.fillStyle = "#f472b6";
            ctx.strokeStyle = "#9d174d";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.ellipse(_cx2 + 2, mouthY + 3.5, 3.5, 5, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(_cx2 + 2, mouthY + 1);
            ctx.lineTo(_cx2 + 2, mouthY + 6);
            ctx.stroke();

            const sweatPhase = (this.stunTimer * 0.22) % (Math.PI * 2);
            for (let side = -1; side <= 1; side += 2) {
                const dropDist = Math.max(14, this.w * 0.58) + Math.sin(sweatPhase) * 5;
                const dropX = _cx2 + side * dropDist;
                const dropY = eyeLevelY - 4 - Math.cos(sweatPhase) * 5;
                ctx.fillStyle = "#60a5fa";
                ctx.strokeStyle = "#1e3a8a";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(dropX, dropY - 4);
                ctx.bezierCurveTo(dropX + side * 3, dropY, dropX + side * 3, dropY + 4, dropX, dropY + 4);
                ctx.bezierCurveTo(dropX - side * 3, dropY + 4, dropX - side * 3, dropY, dropX, dropY - 4);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(dropX + side * 1, dropY + 1, 1, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();

            ctx.save();
            const haloCenterY = _headY - 14;

            ctx.beginPath();
            ctx.ellipse(_cx2, haloCenterY, _orbitR, _orbitR * 0.35, -0.15, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(253, 224, 71, 0.45)";
            ctx.lineWidth = 1.8;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);

            const starCount = 4;
            const starAngles = [];
            for (let i = 0; i < starCount; i++) {
                starAngles.push(_sAngle + (i / starCount) * Math.PI * 2);
            }
            starAngles.sort((a, b) => Math.sin(a) - Math.sin(b));

            for (const a of starAngles) {
                const sinA = Math.sin(a);
                const cosA = Math.cos(a);
                const sx = _cx2 + cosA * _orbitR;
                const sy = haloCenterY + sinA * (_orbitR * 0.35);

                const isFront = sinA >= 0;
                const depthScale = isFront ? 1.25 : 0.72;
                const depthAlpha = isFront ? 1.0 : 0.48;
                const starRadius = Math.max(5.5, this.w * 0.15) * depthScale;

                ctx.save();
                ctx.translate(sx, sy);
                ctx.rotate(a * 1.5 + _sAngle);
                ctx.globalAlpha = depthAlpha;

                if (isFront) {
                    ctx.shadowColor = "#ffd700";
                    ctx.shadowBlur = 10;
                }

                ctx.beginPath();
                const points = 5;
                for (let p = 0; p < points * 2; p++) {
                    const angleP = (p / (points * 2)) * Math.PI * 2 - Math.PI / 2;
                    const r = p % 2 === 0 ? starRadius : starRadius * 0.48;
                    const px = Math.cos(angleP) * r;
                    const py = Math.sin(angleP) * r;
                    if (p === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fillStyle = isFront ? "#ffd700" : "#fef08a";
                ctx.fill();
                ctx.strokeStyle = "#92400e";
                ctx.lineWidth = 1.4;
                ctx.stroke();

                if (isFront) {
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(0, 0, starRadius * 0.28, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            }
            ctx.restore();
        }
    }
}

function drawTrampolinePad(ctx, px, py, pw, time) {
    const t = time || 0;
    const pulse = .5 + Math.sin(t * .18) * .5;
    const padH = 6 + pulse * 4;
    const cx = px + pw * .5;
    ctx.save();
    ctx.fillStyle = "rgba(255, 45, 45, " + (.15 + pulse * .3).toFixed(3) + ")";
    ctx.beginPath();
    ctx.roundRect(px + 2, py - padH - 2, pw - 4, padH + 4, [ 7, 7, 1, 1 ]);
    ctx.fill();
    const grad = ctx.createLinearGradient(px + 4, py - padH, px + 4, py);
    grad.addColorStop(0, "#ff3d3d");
    grad.addColorStop(1, "#b31313");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(px + 4, py - padH, pw - 8, padH, [ 6, 6, 1, 1 ]);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, " + (.25 + pulse * .55).toFixed(3) + ")";
    ctx.fillRect(cx - Math.max(3, pw * .08), py - padH * .6, Math.max(6, pw * .16), 2);
    ctx.restore();
}

class Platform {
    constructor(cfg) {
        this.x = cfg.x;
        this.y = cfg.y;
        this.w = cfg.w;
        this.h = cfg.h;
        this.moving = cfg.moving || false;
        this.moveRange = cfg.moveRange || 0;
        this.moveSpeed = cfg.moveSpeed || 0;
        this.moveAxis = cfg.moveAxis || "x";
        this.originX = cfg.x;
        this.originY = cfg.y;
        this.currentOffset = 0;
        this.direction = 1;
        this.color = cfg.color || null;
        this.glow = false;
        this.trampoline = cfg.trampoline || false;
        this.spikes = cfg.spikes || false;
        this.lava = cfg.lava || false;
        this.hammer = cfg.hammer || false;
        this.isArenaGate = cfg.isArenaGate || false;
        this.isTreeArenaGate = cfg.isTreeArenaGate || false;
        this.isHorrorPlatform = cfg.isHorrorPlatform || false;
        this.boneType = cfg.boneType || null;
        this.isHorrorPit = cfg.isHorrorPit || false;
        this.hammerDrop = cfg.hammerDrop !== undefined ? cfg.hammerDrop : 220;
        const baseHammerSpeed = cfg.hammerSpeed !== undefined ? cfg.hammerSpeed : .04;
        this.hammerSpeed = this.isArenaGate || this.isTreeArenaGate || baseHammerSpeed <= 0 ? 0 : baseHammerSpeed * 2.2;
        this.hammerPhase = cfg.hammerPhase || Math.random() * Math.PI * 2;
        this.button = cfg.button || false;
        this.isGateButton = cfg.isGateButton || null;
        this.buttonColor = cfg.buttonColor || null;
        this.isTechBridgeButton = cfg.isTechBridgeButton || false;
        this.isTechDrone = cfg.isTechDrone || false;
        this.techDroneIndex = cfg.techDroneIndex !== undefined ? cfg.techDroneIndex : 0;
        this.isGateObstacle = cfg.isGateObstacle || null;
        this.isGateBridge = cfg.isGateBridge || null;
        this.isMarioPipe = cfg.isMarioPipe || null;
        this.isCavernRockPile = cfg.isCavernRockPile || false;
        this.isStalactite = cfg.isStalactite || false;
        this.stalacFalling = false;
        this.stalacShake = 0;
        this.stalacVy = 0;
        this.stalacLanded = false;
        this.pressed = false;
        if (this.isGateObstacle === 1 && typeof game !== "undefined" && game.gate1Open) {
            this.y = this.originY - 450;
        }
        if (this.isGateObstacle === 2 && typeof game !== "undefined" && game.gate2Open) {
            this.y = this.originY - 450;
        }
        if ((this.isGateBridge === 2 || this.isRescuePlatform === 2 || this.isMarioPipe === 2) && typeof game !== "undefined" && !game.gate2Open) {
            this.y = 1e3;
        }
        if (this.isTechDrone && typeof game !== "undefined" && !game.techBridgeActive) {
            this.y = -500;
            this.active = false;
        }
        this.jumpHits = cfg.jumpHits || 0;
        this.broken = cfg.broken || false;
        this.unbreakable = cfg.unbreakable || false;
        this.dashBlock = cfg.dashBlock || false;
        this.dashHits = cfg.dashHits || 1;
        this.crystal = cfg.crystal || "purple";
        this.spawnEnemies = cfg.spawnEnemies || null;
        this._dashImpacts = 0;
        this._dashImpactCd = 0;
        this._spawned = false;
        this._hitCooldown = 0;
        this._projCooldown = 0;
        this.respawnTimer = 0;
    }
    shatter(player) {
        if (this.broken) return;
        this.broken = true;
        this.active = false;
        const cx = this.x + this.w / 2;
        const cy = this.y + this.h / 2;
        const pDir = player && player.dashDir ? player.dashDir : 1;
        const isRed = this.crystal === "red";
        const cMain = isRed ? "#f43f5e" : "#a855f7";
        const cGlow = isRed ? "#fb7185" : "#c084fc";
        const colors = isRed ? [ "#f43f5e", "#be123c", "#fecdd3", "#ffffff", "#e11d48", "#ff85a1" ] : [ "#a855f7", "#7c3aed", "#e9d5ff", "#ffffff", "#c084fc", "#f0abfc" ];
        try {
            playSound(1150, .4, "sine", .5, 80);
            playSound(70, .6, "sawtooth", .45, 25);
            playSound(850, .3, "triangle", .35, 1400);
            playSFX("sfx_energy_dash");
        } catch (e) {}
        try {
            applyShake(22);
            game.flash = Math.max(game.flash || 0, 26);
        } catch (e) {}
        try {
            score += 300;
            updateScore(score);
            addFloatingText(cx, this.y - 30, __("flt_cristal_destruido"), cGlow, 24);
        } catch (e) {}
        if (typeof particles !== "undefined" && Array.isArray(particles)) {
            for (let i = 0; i < 70; i++) {
                const ang = Math.random() * Math.PI * 2;
                const spd = 4 + Math.random() * 11;
                const forwardBias = pDir * (6 + Math.random() * 9);
                const pCol = colors[Math.floor(Math.random() * colors.length)];
                particles.push({
                    x: this.x + Math.random() * this.w,
                    y: this.y + Math.random() * this.h,
                    vx: Math.cos(ang) * spd + forwardBias,
                    vy: Math.sin(ang) * spd - (2 + Math.random() * 4),
                    life: 30 + Math.random() * 25,
                    maxLife: 55,
                    color: pCol,
                    size: 4 + Math.random() * 8,
                    type: "spark",
                    glow: 14
                });
            }
        }
        try {
            createExplosion(cx, cy, cMain, 65, 36, colors);
        } catch (e) {}
    }
    crack(player) {
        if (this.broken) return;
        const hits = Math.min(this._dashImpacts || 0, this.dashHits || 1);
        const remain = Math.max(0, (this.dashHits || 1) - hits);
        const isRed = this.crystal === "red";
        const cMain = isRed ? "#f43f5e" : "#a855f7";
        const colors = isRed ? [ "#f43f5e", "#be123c", "#fecdd3", "#ffffff", "#e11d48" ] : [ "#a855f7", "#7c3aed", "#e9d5ff", "#ffffff", "#c084fc" ];
        this.shakeTimer = 14;
        if (!this._fissures) this._fissures = [];
        const cx = this.w / 2;
        const cy = this.h / 2;
        for (let f = 0; f < 5; f++) {
            const startX = cx + (Math.random() - .5) * (this.w * .4);
            const startY = Math.random() < .5 ? 0 : this.h;
            let curX = startX;
            let curY = startY;
            const branch = [ {
                x: curX,
                y: curY
            } ];
            for (let seg = 0; seg < 4; seg++) {
                curX += (Math.random() - .5) * (this.w * .35);
                curY += (startY === 0 ? 1 : -1) * (this.h * .22 + Math.random() * 20);
                branch.push({
                    x: curX,
                    y: curY
                });
            }
            this._fissures.push(branch);
        }
        try {
            playSound(620, .25, "sawtooth", .35, 140);
            playSound(900, .15, "sine", .3, 300);
        } catch (e) {}
        try {
            applyShake(12);
        } catch (e) {}
        try {
            game.flash = Math.max(game.flash || 0, 14);
        } catch (e) {}
        try {
            addFloatingText(this.x + this.w / 2, this.y - 18, __("flt_faltan_golpes", remain), cMain, 22);
        } catch (e) {}
        if (typeof particles !== "undefined" && Array.isArray(particles)) {
            for (let i = 0; i < 35; i++) {
                const ang = Math.random() * Math.PI * 2;
                const spd = 3 + Math.random() * 8;
                particles.push({
                    x: this.x + Math.random() * this.w,
                    y: this.y + Math.random() * this.h,
                    vx: Math.cos(ang) * spd,
                    vy: Math.sin(ang) * spd - 3,
                    life: 22 + Math.random() * 15,
                    maxLife: 35,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    size: 3 + Math.random() * 5,
                    type: "spark",
                    glow: 10
                });
            }
        }
        try {
            createExplosion(this.x + this.w / 2, this.y + this.h / 2, cMain, 34, 18, colors);
        } catch (e) {}
    }
    maybeSpawnEnemies() {
        if (!this.spawnEnemies || this._spawned) return;
        this._spawned = true;
        try {
            if (!game || !Array.isArray(game.enemies)) return;
            const p = game.player;
            for (let i = 0; i < this.spawnEnemies.length; i++) {
                const cfg = this.spawnEnemies[i];
                const scfg = Object.assign({}, cfg);
                const side = i % 2 === 0 ? -1 : 1;
                if (p) {
                    scfg.x = p.x + side * (150 + Math.floor(i / 2) * 70);
                    scfg.y = p.y - 6;
                } else {
                    scfg.x = (this.x || 0) + (cfg.x || 0);
                    scfg.y = (this.y || 0) + (cfg.y || 0);
                }
                game.enemies.push(new Enemy(scfg));
            }
            if (p) {
                addFloatingText(p.x + p.w / 2, p.y - 40, __("flt_enemigos"), "#ff0044", 20);
            } else {
                addFloatingText(this.x + this.w / 2, this.y - 30, __("flt_enemigos"), "#ff0044", 20);
            }
        } catch (e) {}
    }
    update() {
        if (this.dashBlock) {
            if (this._projCooldown > 0) this._projCooldown--;
            if (this._hitCooldown > 0) this._hitCooldown--;
            if (this._dashImpactCd > 0) this._dashImpactCd--;
            if (this.shakeTimer > 0) this.shakeTimer--;
            return;
        }
        if (this.broken && currentLevel === 0 && game.iceMode) {
            this.respawnTimer = (this.respawnTimer || 0) + 1;
            if (this.respawnTimer > 240) {
                this.broken = false;
                this.jumpHits = 0;
                this.respawnTimer = 0;
                try {
                    playSound(500, .2, "sine", .25, 800);
                    addFloatingText(this.x + this.w / 2, this.y - 12, __("flt_regenerada"), "#00ffff", 14);
                    createExplosion(this.x + this.w / 2, this.y + this.h / 2, "#00ffff", 18, 12, [ "#ffffff", "#00ffff" ]);
                } catch (e) {}
            }
        }
        if (this.moving) {
            this.currentOffset += this.moveSpeed * this.direction;
            if (Math.abs(this.currentOffset) > this.moveRange) {
                this.direction *= -1;
                this.currentOffset = Math.sign(this.currentOffset) * this.moveRange;
            }
            if (this.moveAxis === "x") this.x = this.originX + this.currentOffset; else this.y = this.originY + this.currentOffset;
            this.glow = Math.abs(this.currentOffset) / this.moveRange;
        }
        if (this.hammer) {
            if (this.isArenaGate || this.isTreeArenaGate || this.hammerSpeed <= 0 && this.hammerDrop <= 0) {
                if (game.player && this.y > this.originY + 30) {
                    const pp = game.player;
                    const dentroX = pp.x + pp.w > this.x && pp.x < this.x + this.w;
                    const dentroY = (this.isArenaGate || this.isTreeArenaGate)
                        ? (pp.y + pp.h > -9999 && pp.y < this.y + this.h + 50)
                        : (pp.y + pp.h > this.y && pp.y < this.y + this.h);
                    if (dentroX && dentroY) {
                        if (pp.x + pp.w / 2 < this.x + this.w / 2) {
                            pp.x = this.x - pp.w;
                        } else {
                            pp.x = this.x + this.w;
                        }
                        pp.vx = 0;
                        if (pp.dashTimer > 0) pp.dashTimer = 0;
                    }
                }
            } else {
                const pl = game.player;
                const near = pl && Math.abs(pl.x + pl.w / 2 - (this.x + this.w / 2)) < 800;
                if (near && !this._activated) {
                    this._activated = true;
                }
                if (!this._activated) {
                    this.y = this.originY;
                } else {
                    this.hammerPhase = (this.hammerPhase || 0) + this.hammerSpeed;
                    const dropProgress = Math.max(0, Math.sin(this.hammerPhase));
                    const dropAmount = this.hammerDrop * Math.pow(dropProgress, 3);
                    this.y = this.originY + dropAmount;
                    if (dropProgress > .95 && !this._hasImpacted) {
                        this._hasImpacted = true;
                        try {
                            playSound(60, .4, "sawtooth", .2, 40);
                        } catch (e) {}
                        if (game.player && Math.abs(this.x - game.player.x) < 500) {
                            applyShake(10);
                        }
                    } else if (dropProgress < .5) {
                        this._hasImpacted = false;
                    }
                    if (game.player) {
                        const p = game.player;
                        const overlapsX = p.x + p.w > this.x + 2 && p.x < this.x + this.w - 2;
                        const overlapsY = p.y + p.h > this.y && p.y < this.y + this.h;
                        const isUnderneath = overlapsX && p.y + p.h >= this.y && p.y <= this.y + this.h + 16;

                        if ((dropProgress > 0.2 || isUnderneath) && (overlapsX && overlapsY || isUnderneath) && !p.frozen && p.invulnerable <= 0) {
                            p.takeDamage(30);
                            if (p.dashTimer > 0) p.dashTimer = 0;
                            if (p.x + p.w / 2 < this.x + this.w / 2) {
                                p.x = this.x - p.w - 14;
                                p.vx = -9;
                            } else {
                                p.x = this.x + this.w + 14;
                                p.vx = 9;
                            }
                            p.vy = 4;
                            if (typeof createExplosion === "function") createExplosion(p.x + p.w / 2, p.y + p.h / 2, "#ff3300", 25, 15);
                            if (typeof addFloatingText === "function") addFloatingText(p.x + p.w / 2, p.y - 15, (typeof __ === "function" ? __("flt_aplastado") : null) || "¡APLASTADO!", "#ff0033", 18);
                            if (typeof applyShake === "function") applyShake(8);
                        } else if (p.y + p.h > Math.min(0, this.y) && p.y < this.y + this.h) {
                            if (p.x + p.w > this.x && p.x < this.x + this.w) {
                                if (p.x + p.w / 2 < this.x + this.w / 2) {
                                    p.x = this.x - p.w;
                                } else {
                                    p.x = this.x + this.w;
                                }
                                p.vx = 0;
                                if (p.dashTimer > 0) p.dashTimer = 0;
                            }
                        }
                    }
                }
            }
        }
        if (this.isGateButton) {
            const isGate1 = this.isGateButton === 1;
            const isGate2 = this.isGateButton === 2;
            const isAlreadyOpen = isGate1 ? typeof game !== "undefined" && game.gate1Open : typeof game !== "undefined" && game.gate2Open;
            if (!isAlreadyOpen && typeof game !== "undefined" && game.player) {
                const p = game.player;
                const btnW = 46;
                const btnX = this.x + (this.w - btnW) / 2;
                const onTop = p.x + p.w > btnX && p.x < btnX + btnW && p.y + p.h >= this.y - 14 && p.y + p.h <= this.y + 14;
                if (onTop) {
                    if (isGate1) {
                        game.gate1Open = true;
                        this.pressed = true;
                        if (typeof applyShake === "function") applyShake(8);
                        try {
                            playSound(520, .4, "triangle", .4, 1040);
                            playSound(100, .6, "sawtooth", .45, 40);
                        } catch (e) {}
                        if (typeof addFloatingText === "function") {
                            addFloatingText(this.x + this.w / 2, this.y - 25, typeof __ === "function" ? __("flt_gate1_opened") : "¡PORTÓN RÚNICO ABIERTO!", "#10b981", 22);
                        }
                        if (typeof createExplosion === "function") {
                            createExplosion(this.x + this.w / 2, this.y, "#10b981", 25, 12, [ "#ffffff", "#34d399", "#059669" ]);
                        }
                    } else if (isGate2) {
                        game.gate2Open = true;
                        this.pressed = true;
                        if (typeof applyShake === "function") applyShake(8);
                        try {
                            playSound(300, .4, "sawtooth", .4, 600);
                            playSound(880, .3, "sine", .3, 1320);
                        } catch (e) {}
                        if (typeof addFloatingText === "function") {
                            addFloatingText(this.x + this.w / 2, this.y - 25, typeof __ === "function" ? __("flt_gate2_opened") : "¡PUERTA SOLAR ELEVADA!", "#f59e0b", 22);
                        }
                        if (typeof createExplosion === "function") {
                            createExplosion(this.x + this.w / 2, this.y, "#f59e0b", 25, 12, [ "#ffffff", "#fde047", "#d97706" ]);
                        }
                        if (typeof window.triggerSolarGateCutscene === "function") {
                            window.triggerSolarGateCutscene();
                        }
                    }
                }
            }
        }
        if (this.isTechBridgeButton) {
            const isAlreadyActive = typeof game !== "undefined" && game.techBridgeActive;
            if (!isAlreadyActive && typeof game !== "undefined" && game.player) {
                const p = game.player;
                const onTop = p.x + p.w > this.x && p.x < this.x + this.w && p.y + p.h >= this.y - 12 && p.y + p.h <= this.y + 16;
                if (onTop && !this.pressed) {
                    this.pressed = true;
                    game.techBridgeCinematic = true;
                    if (typeof applyShake === "function") applyShake(8);
                    try {
                        playSound(700, .15, "square", .3, 1100);
                        setTimeout(() => playSound(900, .25, "triangle", .3, 1400), 100);
                    } catch (e) {}
                    if (typeof createExplosion === "function") {
                        createExplosion(this.x + this.w / 2, this.y, "#00ffcc", 28, 14, [ "#ffffff", "#00ffcc", "#00e5ff" ]);
                    }
                    if (typeof window.triggerTechBridgeCinematic === "function") {
                        window.triggerTechBridgeCinematic();
                    }
                }
            }
        }
        if (this.isTechDrone) {
            const isActive = typeof game !== "undefined" && game.techBridgeActive;
            if (!isActive && !this._cinematicDescending) {
                this.y = -500;
                this.active = false;
            } else if (isActive && !this._cinematicDescending) {
                this.active = true;
                const timeNow = typeof time !== "undefined" ? time : Date.now() * .06;
                this.y = this.originY + Math.sin(timeNow * .06 + (this.techDroneIndex || 0) * 1.6) * 3.5;
            }
        }
        if (this.isGateObstacle) {
            const isOpen = this.isGateObstacle === 1 && typeof game !== "undefined" && game.gate1Open || this.isGateObstacle === 2 && typeof game !== "undefined" && game.gate2Open;
            const targetY = isOpen ? this.originY - 450 : this.originY;
            if (this.y > targetY) {
                this.y -= 4;
                if (Math.random() < .25 && typeof particles !== "undefined") {
                    const col = this.isGateObstacle === 1 ? "#10b981" : "#f59e0b";
                    particles.push({
                        x: this.x + Math.random() * this.w,
                        y: this.y + this.h,
                        vx: (Math.random() - .5) * 2,
                        vy: Math.random() * 2 + 1,
                        life: 20,
                        color: col,
                        size: 3,
                        type: "spark"
                    });
                }
            }
            if (!isOpen || this.y > this.originY - 350) {
                if (typeof game !== "undefined" && game.player) {
                    const p = game.player;
                    if (p.x + p.w > this.x && p.x < this.x + this.w && p.y + p.h > this.y && p.y < this.y + this.h) {
                        if (p.x + p.w / 2 < this.x + this.w / 2) {
                            p.x = this.x - p.w;
                        } else {
                            p.x = this.x + this.w;
                        }
                        p.vx = 0;
                    }
                }
            }
        }
        if (this.isStalactite) {
            if (this.fallingThroughHole) {
                this.stalacVy = (this.stalacVy || 5) + 0.9;
                this.y += this.stalacVy;
                if (this.y > 700) {
                    this.active = false;
                }
                return;
            }
            if (!this.stalacLanded) {
                if (game.player && !this.stalacFalling) {
                    const distToPlayer = this.x + this.w / 2 - (game.player.x + game.player.w / 2);
                    if (distToPlayer > 30 && distToPlayer < 240) {
                        this.stalacShake = 14;
                        this.stalacFalling = true;
                        try {
                            playSound(240, .2, "sawtooth", .2, 70);
                        } catch (e) {}
                    }
                }
                if (this.stalacFalling) {
                    if (this.stalacShake > 0) {
                        this.stalacShake--;
                        if (Math.random() < .6 && typeof particles !== "undefined") {
                            particles.push({
                                x: this.x + Math.random() * this.w,
                                y: this.y + this.h,
                                vx: (Math.random() - .5) * 3,
                                vy: Math.random() * 2 + 1,
                                life: 14,
                                color: "#a8a29e",
                                size: 3,
                                type: "spark"
                            });
                        }
                    } else {
                        this.stalacVy = (this.stalacVy || 0) + 1.1;
                        this.y += this.stalacVy;
                        if (Math.random() < .5 && typeof particles !== "undefined") {
                            particles.push({
                                x: this.x + this.w / 2 + (Math.random() - .5) * 20,
                                y: this.y,
                                vx: (Math.random() - .5) * 2.5,
                                vy: -Math.random() * 2,
                                life: 16,
                                color: "#78716c",
                                size: 3,
                                type: "spark"
                            });
                        }

                        if (game.enemies && Array.isArray(game.enemies)) {
                            for (let e of game.enemies) {
                                if (!e.active || e.dead || e.health <= 0) continue;
                                if (e.x + e.w > this.x && e.x < this.x + this.w && e.y + e.h > this.y && e.y < this.y + this.h) {
                                    e.takeDamage(999);
                                    try {
                                        if (typeof triggerDashHitImpact === "function") {
                                            triggerDashHitImpact(e.x + e.w / 2, e.y + e.h / 2, true);
                                        }
                                        createExplosion(e.x + e.w / 2, e.y + e.h / 2, "#ef4444", 24, 16, [ "#ff0000", "#ff8800", "#78716c", "#ffffff" ]);
                                        playSound(110, .3, "square", .3, 40);
                                        addFloatingText(e.x + e.w / 2, e.y - 20, typeof __ === "function" ? __("flt_aplastado") : "¡APLASTADO!", "#f59e0b", 18);
                                    } catch (_) {}
                                }
                            }
                        }

                        if (game.player && game.player.x + game.player.w > this.x && game.player.x < this.x + this.w && game.player.y + game.player.h > this.y && game.player.y < this.y + this.h) {
                            if (typeof game.player.takeDamage === "function") {
                                game.player.takeDamage(5);
                            }
                        }

                        const midX = this.x + this.w / 2;
                        let targetPlat = null;
                        if (game.platforms && Array.isArray(game.platforms)) {
                            for (let p of game.platforms) {
                                if (p === this || p.isStalactite || p.broken) continue;
                                if (p.x <= midX + this.w / 2 && p.x + p.w >= midX - this.w / 2) {
                                    if (this.y + this.h >= p.y && this.y + this.h <= p.y + Math.max(38, this.stalacVy + 16)) {
                                        targetPlat = p;
                                        break;
                                    }
                                }
                            }
                        }

                        if (targetPlat) {
                            game.caveStalactiteHitCount = (game.caveStalactiteHitCount || 0) + 1;
                            const hitIndex = game.caveStalactiteHitCount;

                            if (hitIndex === 1) {
                                try {
                                    if (typeof triggerDashHitImpact === "function") {
                                        triggerDashHitImpact(midX, targetPlat.y, false);
                                    }
                                    playSound(75, .22, "sawtooth", .55, 30);
                                    playSound(1100, .08, "triangle", .45, 180);
                                    playSound(320, .14, "square", .35, 90);
                                    if (typeof playSFX === "function") playSFX("sfx_rock_impact");
                                } catch (_) {}
                                if (typeof applyShake === "function") applyShake(9);

                                targetPlat.notches = targetPlat.notches || [];
                                targetPlat.notches.push({
                                    x: midX,
                                    relX: midX - targetPlat.x,
                                    w: 72,
                                    depth: 18
                                });
                                targetPlat.cracks = targetPlat.cracks || [];
                                for (let b = 0; b < 4; b++) {
                                    const branch = [];
                                    let curX = midX;
                                    let curY = targetPlat.y;
                                    const dir = b % 2 === 0 ? -1 : 1;
                                    branch.push({ x: curX - targetPlat.x, y: 0 });
                                    for (let st = 0; st < 4; st++) {
                                        curX += dir * (8 + Math.random() * 14);
                                        curY += (st + 1) * 4 + Math.random() * 4;
                                        branch.push({ x: curX - targetPlat.x, y: Math.min(targetPlat.h, curY - targetPlat.y) });
                                    }
                                    targetPlat.cracks.push(branch);
                                }

                                this.y = targetPlat.y - this.h + 16;
                                this.stalacLanded = true;

                                if (typeof createExplosion === "function") {
                                    createExplosion(midX, targetPlat.y, "#78716c", 24, 16, [ "#a8a29e", "#78716c", "#57534e", "#ffffff" ]);
                                }
                                if (typeof addFloatingText === "function") {
                                    addFloatingText(midX, targetPlat.y - 20, typeof __ === "function" ? __("flt_suelo_agrietado") : "¡SUELO AGRIETADO!", "#f59e0b", 18);
                                }
                            } else {
                                try {
                                    playSound(65, .4, "sawtooth", .65, 25);
                                    playSound(950, .28, "square", .4, 110);
                                    playSound(180, .35, "sawtooth", .5, 45);
                                    if (typeof triggerDashHitImpact === "function") {
                                        triggerDashHitImpact(midX, targetPlat.y, true);
                                    }
                                    if (typeof playSFX === "function") playSFX("sfx_rock_impact");
                                } catch (_) {}
                                if (typeof applyShake === "function") applyShake(14);

                                const holeW = 80;
                                const holeLeft = midX - holeW / 2;
                                const holeRight = midX + holeW / 2;
                                const origX = targetPlat.x;
                                const origW = targetPlat.w;
                                const origY = targetPlat.y;
                                const origH = targetPlat.h;

                                if (origW <= 100) {
                                    targetPlat.broken = true;
                                    targetPlat.active = false;
                                } else if (holeLeft <= origX + 25) {
                                    targetPlat.x = holeRight;
                                    targetPlat.w = Math.max(20, (origX + origW) - holeRight);
                                } else if (holeRight >= origX + origW - 25) {
                                    targetPlat.w = Math.max(20, holeLeft - origX);
                                } else {
                                    targetPlat.w = holeLeft - origX;
                                    const rightPlat = new Platform({
                                        x: holeRight,
                                        y: origY,
                                        w: (origX + origW) - holeRight,
                                        h: origH,
                                        unbreakable: targetPlat.unbreakable,
                                        color: targetPlat.color,
                                        spikes: targetPlat.spikes
                                    });
                                    game.platforms.push(rightPlat);
                                }

                                if (game.player && game.player.currentPlatform === targetPlat) {
                                    if (game.player.x + game.player.w / 2 >= holeLeft && game.player.x + game.player.w / 2 <= holeRight) {
                                        game.player.onGround = false;
                                    }
                                }

                                this.fallingThroughHole = true;
                                this.stalacVy = 5.5;
                                this.y += 18;

                                if (typeof createExplosion === "function") {
                                    createExplosion(midX, origY + 10, "#44403c", 36, 24, [ "#78716c", "#57534e", "#292524", "#d6d3d1" ]);
                                }
                                if (typeof particles !== "undefined") {
                                    for (let i = 0; i < 30; i++) {
                                        particles.push({
                                            x: midX + (Math.random() - .5) * holeW,
                                            y: origY + Math.random() * 20,
                                            vx: (Math.random() - .5) * 6,
                                            vy: Math.random() * 7 + 2,
                                            life: 35 + Math.random() * 20,
                                            color: Math.random() < .4 ? "#292524" : (Math.random() < .7 ? "#57534e" : "#78716c"),
                                            size: 4 + Math.random() * 5,
                                            type: "spark"
                                        });
                                    }
                                }
                                if (typeof addFloatingText === "function") {
                                    addFloatingText(midX, origY - 24, typeof __ === "function" ? __("flt_hueco_vacio") : "¡HUECO AL VACÍO!", "#ef4444", 20);
                                }
                            }
                        } else if (this.y >= 540) {
                            this.fallingThroughHole = true;
                            this.stalacVy = 6;
                        }
                    }
                }
            }
        }
        if (this.isMarioPipe) {
            const isOpen = typeof game !== "undefined" && game.gate2Open;
            const targetY = isOpen ? this.originY : 1e3;
            if (this.y > targetY) {
                this.y = Math.max(targetY, this.y - 12);
                if (Math.random() < .35 && typeof particles !== "undefined") {
                    particles.push({
                        x: this.x + Math.random() * this.w,
                        y: this.y + Math.random() * this.h,
                        vx: (Math.random() - .5) * 3,
                        vy: -Math.random() * 3,
                        life: 20,
                        color: "#22c55e",
                        size: 3.5,
                        type: "spark"
                    });
                }
            }
        } else if (this.isRescuePlatform || this.isGateBridge) {
            const isOpen = typeof game !== "undefined" && game.gate2Open;
            const targetY = isOpen ? this.originY : 800;
            if (this.y > targetY) {
                this.y = Math.max(targetY, this.y - 7);
                if (Math.random() < .35 && typeof particles !== "undefined") {
                    particles.push({
                        x: this.x + Math.random() * this.w,
                        y: this.y + Math.random() * this.h,
                        vx: (Math.random() - .5) * 3,
                        vy: -Math.random() * 3,
                        life: 22,
                        color: "#fbbf24",
                        size: 3,
                        type: "spark"
                    });
                }
            }
        }
    }
    _getCrystalCanvas() {
        if (this._crystalCanvas) return this._crystalCanvas;
        const cv = document.createElement("canvas");
        cv.width = this.w;
        cv.height = this.h;
        const cctx = cv.getContext("2d");
        if (!cctx) return null;
        const bw = this.w;
        const bh = this.h;
        const isRed = this.crystal === "red";
        const cBord = isRed ? "#fb7185" : "#e879f9";
        const rgbA = isRed ? "254,205,211" : "233,213,255";
        const rgbB = isRed ? "244,63,94" : "168,85,247";
        const rgbC = isRed ? "190,18,60" : "88,28,135";
        const rgbD = isRed ? "136,19,55" : "59,7,100";
        const pale = isRed ? "#fecdd3" : "#e9d5ff";
        const mid = isRed ? "#f43f5e" : "#a855f7";
        const deep = isRed ? "#881337" : "#3b0764";
        const grad = cctx.createLinearGradient(0, 0, bw, bh);
        grad.addColorStop(0, "rgba(" + rgbA + ",0.95)");
        grad.addColorStop(.35, "rgba(" + rgbB + ",0.95)");
        grad.addColorStop(.7, "rgba(" + rgbC + ",0.95)");
        grad.addColorStop(1, "rgba(" + rgbD + ",0.98)");
        cctx.fillStyle = grad;
        cctx.beginPath();
        cctx.roundRect(0, 0, bw, bh, 6);
        cctx.fill();
        cctx.save();
        cctx.beginPath();
        cctx.rect(0, 0, bw, bh);
        cctx.clip();
        const rows = Math.max(5, Math.floor(bh / 24));
        const cols = Math.max(3, Math.floor(bw / 20));
        const cw2 = bw / cols, ch2 = bh / rows;
        const cx = bw / 2, cy = bh / 2;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const fx = cw2 * c + cw2 / 2;
                const fy = ch2 * r + ch2 / 2;
                if (Math.abs(fx - cx) < cw2 * .6 && Math.abs(fy - cy) < ch2 * .8) continue;
                const seed = Math.sin(fx * 12.9898 + fy * 78.233) * 43758.5453;
                const rr = seed - Math.floor(seed);
                if (rr < .72) {
                    const s = cw2 * .21 * (.55 + rr * .5);
                    cctx.save();
                    cctx.translate(fx, fy);
                    cctx.rotate(Math.PI / 4 + (rr - .5) * .8);
                    cctx.globalAlpha = .4 + rr * .55;
                    cctx.fillStyle = rr < .34 ? pale : rr < .55 ? mid : deep;
                    cctx.fillRect(-s, -s, s * 2, s * 2);
                    cctx.restore();
                }
            }
        }
        cctx.restore();
        cctx.strokeStyle = cBord;
        cctx.lineWidth = 2.5;
        cctx.beginPath();
        cctx.roundRect(0, 0, bw, bh, 6);
        cctx.stroke();
        cctx.strokeStyle = "rgba(255,255,255,0.45)";
        cctx.lineWidth = 1.2;
        cctx.beginPath();
        cctx.moveTo(0, 0);
        cctx.lineTo(cx, cy);
        cctx.lineTo(bw, 0);
        cctx.moveTo(0, bh);
        cctx.lineTo(cx, cy);
        cctx.lineTo(bw, bh);
        cctx.stroke();
        this._crystalCanvas = cv;
        return this._crystalCanvas;
    }
    draw(ctx, offsetX) {
        if (ctx && ctx.isDummy) return;
        if (this.broken) return;
        if (this.isCavernRockPile) return;
        const px = this.x - offsetX;
        if (px + this.w < -100 || px > VIEW_W + 100) return;
        if (this.dashBlock) {
            ctx.save();
            const sX = this.shakeTimer > 0 ? (Math.random() - .5) * 6 : 0;
            const bx = px + sX;
            const by = this.y;
            const bw = this.w;
            const bh = this.h;
            const cx = bx + bw / 2, cy = by + bh / 2;
            const isRed = this.crystal === "red";
            const hits = this._dashImpacts || 0;
            const need = this.dashHits || 1;
            const frac = Math.min(1, hits / Math.max(1, need));
            const cGlow = isRed ? "#f43f5e" : "#a855f7";
            const cBord = isRed ? "#fb7185" : "#e879f9";
            const ccv = this._getCrystalCanvas();
            if (ccv) {
                ctx.shadowColor = cGlow;
                ctx.shadowBlur = 10;
                ctx.drawImage(ccv, bx, by);
                ctx.shadowBlur = 0;
            }
            if (Math.random() < .25) {
                ctx.strokeStyle = isRed ? "#fb7185" : "#f0abfc";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(bx + Math.random() * bw, by);
                ctx.lineTo(cx, cy);
                ctx.lineTo(bx + Math.random() * bw, by + bh);
                ctx.stroke();
            }
            if (this._fissures && this._fissures.length > 0) {
                ctx.save();
                ctx.strokeStyle = "rgba(0, 0, 0, 0.85)";
                ctx.lineWidth = 3.2;
                ctx.lineCap = "round";
                ctx.beginPath();
                for (let f = 0; f < this._fissures.length; f++) {
                    const branch = this._fissures[f];
                    if (branch.length < 2) continue;
                    ctx.moveTo(bx + branch[0].x, by + branch[0].y);
                    for (let s = 1; s < branch.length; s++) {
                        ctx.lineTo(bx + branch[s].x, by + branch[s].y);
                    }
                }
                ctx.stroke();
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                for (let f = 0; f < this._fissures.length; f++) {
                    const branch = this._fissures[f];
                    if (branch.length < 2) continue;
                    ctx.moveTo(bx + branch[0].x, by + branch[0].y);
                    for (let s = 1; s < branch.length; s++) {
                        ctx.lineTo(bx + branch[s].x, by + branch[s].y);
                    }
                }
                ctx.stroke();
                ctx.restore();
            } else if (hits > 0) {
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.beginPath();
                const cH = bh * frac;
                ctx.moveTo(bx + bw * .3, by);
                ctx.lineTo(bx + bw * .38, by + cH * .42);
                ctx.lineTo(bx + bw * .22, by + cH * .72);
                ctx.lineTo(bx + bw * .34, by + cH);
                ctx.moveTo(bx + bw * .72, by);
                ctx.lineTo(bx + bw * .62, by + cH * .5);
                ctx.lineTo(bx + bw * .78, by + cH * .85);
                ctx.lineTo(bx + bw * .66, by + cH);
                ctx.stroke();
            }
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold " + Math.min(20, bw * .65) + "px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("⚡", cx, cy);
            ctx.fillStyle = "#fde68a";
            ctx.font = "bold 10px monospace";
            if (bh >= 60) {
                ctx.fillText(typeof __ === "function" ? __("ui_energy_caps") : "ENERGY", cx, cy - 16);
                ctx.fillText(typeof __ === "function" ? __("ui_dash_caps") : "DASH", cx, cy + 16);
                if (need > 1) {
                    ctx.fillText(hits + "/" + need, cx, cy + 30);
                }
            } else {
                ctx.fillText(typeof __ === "function" ? __("ui_dash_caps") : "DASH", cx, cy + 12);
            }
            ctx.restore();
            return;
        }
        if (this.hammer) {
            ctx.save();
            const hx = px;
            const hy = this.y;
            const hw = this.w;
            const hh = this.h;
            const midX = hx + hw / 2;

            const shaftW = Math.max(16, Math.min(26, hw * 0.38));
            const shaftLeft = midX - shaftW / 2;
            const shaftH = Math.max(0, hy);

            if (shaftH > 0) {
                ctx.fillStyle = "#1e293b";
                ctx.fillRect(shaftLeft - 8, 0, shaftW + 16, 10);
                ctx.fillStyle = "#94a3b8";
                ctx.fillRect(shaftLeft - 6, 2, 4, 6);
                ctx.fillRect(shaftLeft + shaftW + 2, 2, 4, 6);

                ctx.fillStyle = "#334155";
                ctx.fillRect(shaftLeft - 5, 0, 3, shaftH);
                ctx.fillRect(shaftLeft + shaftW + 2, 0, 3, shaftH);

                const pGrad = ctx.createLinearGradient(shaftLeft, 0, shaftLeft + shaftW, 0);
                pGrad.addColorStop(0, "#0f172a");
                pGrad.addColorStop(0.2, "#475569");
                pGrad.addColorStop(0.5, "#cbd5e1");
                pGrad.addColorStop(0.8, "#64748b");
                pGrad.addColorStop(1, "#1e293b");
                ctx.fillStyle = pGrad;
                ctx.fillRect(shaftLeft, 0, shaftW, shaftH);

                ctx.fillStyle = "#0f172a";
                for (let sy = 18; sy < shaftH - 6; sy += 28) {
                    ctx.fillRect(shaftLeft - 1, sy, shaftW + 2, 5);
                    ctx.fillStyle = "#94a3b8";
                    ctx.fillRect(shaftLeft + shaftW * 0.3, sy + 1, shaftW * 0.4, 2);
                    ctx.fillStyle = "#0f172a";
                }

                ctx.fillStyle = "#334155";
                ctx.fillRect(shaftLeft - 6, shaftH - 8, shaftW + 12, 8);
                ctx.fillStyle = "#64748b";
                ctx.fillRect(shaftLeft - 6, shaftH - 8, shaftW + 12, 2);
            }

            ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
            ctx.fillRect(hx + 3, hy + 3, hw, hh);

            const bGrad = ctx.createLinearGradient(hx, hy, hx + hw, hy + hh);
            bGrad.addColorStop(0, "#1e293b");
            bGrad.addColorStop(0.5, "#0f172a");
            bGrad.addColorStop(1, "#090d16");
            ctx.fillStyle = bGrad;
            ctx.fillRect(hx, hy, hw, hh);

            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 2;
            ctx.strokeRect(hx + 1, hy + 1, hw - 2, hh - 2);

            ctx.strokeStyle = "#64748b";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(hx + 1, hy + hh - 1);
            ctx.lineTo(hx + 1, hy + 1);
            ctx.lineTo(hx + hw - 1, hy + 1);
            ctx.stroke();

            const insetMargin = 6;
            ctx.fillStyle = "#090d16";
            ctx.fillRect(hx + insetMargin, hy + insetMargin, hw - insetMargin * 2, hh - insetMargin * 2);

            ctx.fillStyle = "rgba(234, 88, 12, 0.85)";
            for (let vy = hy + 10; vy <= hy + hh - 22; vy += 7) {
                ctx.fillRect(hx + 8, vy, 4, 3);
                ctx.fillRect(hx + hw - 12, vy, 4, 3);
            }

            ctx.fillStyle = "#94a3b8";
            ctx.beginPath();
            ctx.arc(hx + 5, hy + 5, 2, 0, Math.PI * 2);
            ctx.arc(hx + hw - 5, hy + 5, 2, 0, Math.PI * 2);
            ctx.arc(hx + 5, hy + hh - 5, 2, 0, Math.PI * 2);
            ctx.arc(hx + hw - 5, hy + hh - 5, 2, 0, Math.PI * 2);
            ctx.fill();

            const hazardH = Math.min(10, hh * 0.22);
            const hazardY = hy + hh - hazardH - 2;
            ctx.save();
            ctx.beginPath();
            ctx.rect(hx + 4, hazardY, hw - 8, hazardH);
            ctx.clip();

            ctx.fillStyle = "#0f172a";
            ctx.fillRect(hx + 4, hazardY, hw - 8, hazardH);

            ctx.fillStyle = "#dc2626";
            const stripeW = 9;
            for (let sx = hx - hazardH; sx < hx + hw + hazardH; sx += stripeW * 2) {
                ctx.beginPath();
                ctx.moveTo(sx, hazardY + hazardH);
                ctx.lineTo(sx + stripeW, hazardY + hazardH);
                ctx.lineTo(sx + stripeW + hazardH, hazardY);
                ctx.lineTo(sx + hazardH, hazardY);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();

            ctx.strokeStyle = "rgba(220, 38, 38, 0.7)";
            ctx.lineWidth = 1;
            ctx.strokeRect(hx + 4, hazardY, hw - 8, hazardH);

            const spikeStep = 14;
            const spikeH = 12;
            const spikeCount = Math.floor(hw / spikeStep);
            const spikeStartX = hx + (hw - spikeCount * spikeStep) / 2;

            for (let i = 0; i < spikeCount; i++) {
                const sBaseX = spikeStartX + i * spikeStep;
                const sMidX = sBaseX + spikeStep / 2;
                const sTipX = sMidX;
                const sTipY = hy + hh + spikeH;

                const sLight = ctx.createLinearGradient(sBaseX, hy + hh, sTipX, sTipY);
                sLight.addColorStop(0, "#e2e8f0");
                sLight.addColorStop(0.5, "#94a3b8");
                sLight.addColorStop(1, "#ef4444");
                ctx.fillStyle = sLight;
                ctx.beginPath();
                ctx.moveTo(sBaseX, hy + hh);
                ctx.lineTo(sMidX, hy + hh);
                ctx.lineTo(sTipX, sTipY);
                ctx.closePath();
                ctx.fill();

                const sDark = ctx.createLinearGradient(sMidX, hy + hh, sBaseX + spikeStep, sTipY);
                sDark.addColorStop(0, "#475569");
                sDark.addColorStop(0.5, "#1e293b");
                sDark.addColorStop(1, "#991b1b");
                ctx.fillStyle = sDark;
                ctx.beginPath();
                ctx.moveTo(sMidX, hy + hh);
                ctx.lineTo(sBaseX + spikeStep, hy + hh);
                ctx.lineTo(sTipX, sTipY);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(sMidX, hy + hh);
                ctx.lineTo(sTipX, sTipY);
                ctx.stroke();
            }

            const coreY = hy + (hh - hazardH) / 2;
            const pulse = (Math.sin(time * 0.12 + hx * 0.05) + 1) * 0.5;
            const coreRad = Math.min(10, Math.min(hw, hh) * 0.22);

            ctx.fillStyle = "#1e293b";
            ctx.beginPath();
            ctx.arc(midX, coreY, coreRad + 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = "#0f172a";
            ctx.fillRect(midX - coreRad - 4, coreY - 1, (coreRad + 4) * 2, 2);
            ctx.fillRect(midX - 1, coreY - coreRad - 4, 2, (coreRad + 4) * 2);

            const cGrad = ctx.createRadialGradient(midX, coreY, 1, midX, coreY, coreRad);
            cGrad.addColorStop(0, "#ffffff");
            cGrad.addColorStop(0.35, "#fde047");
            cGrad.addColorStop(0.7, "#ef4444");
            cGrad.addColorStop(1, "#7f1d1d");

            ctx.fillStyle = cGrad;
            ctx.shadowColor = "#ef4444";
            ctx.shadowBlur = 10 + pulse * 8;
            ctx.beginPath();
            ctx.arc(midX, coreY, coreRad, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(midX, coreY, coreRad * 0.55, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();
            return;
        }
        if (this.spikes && (currentLevel < 4 || currentLevel === 6 || currentLevel === "hub")) {
            ctx.shadowBlur = 0;
            
            ctx.fillStyle = "#1a0505";
            ctx.fillRect(px, this.y + this.h - 4, this.w, 4);

            ctx.fillStyle = "#330000";
            ctx.beginPath();
            for (let sx = px; sx < px + this.w; sx += 16) {
                ctx.moveTo(sx - 2, this.y + this.h);
                ctx.lineTo(sx + 6, this.y + 4);
                ctx.lineTo(sx + 14, this.y + this.h);
            }
            ctx.fill();

            const spikeGrad = ctx.createLinearGradient(0, this.y, 0, this.y + this.h);
            spikeGrad.addColorStop(0, "#ff4444");
            spikeGrad.addColorStop(0.5, "#880000");
            spikeGrad.addColorStop(1, "#220000");
            ctx.fillStyle = spikeGrad;
            ctx.beginPath();
            for (let sx = px; sx < px + this.w; sx += 16) {
                ctx.moveTo(sx, this.y + this.h);
                ctx.lineTo(sx + 8, this.y);
                ctx.lineTo(sx + 16, this.y + this.h);
            }
            ctx.fill();

            ctx.fillStyle = "rgba(255, 100, 100, 0.4)";
            ctx.beginPath();
            for (let sx = px; sx < px + this.w; sx += 16) {
                ctx.moveTo(sx + 8, this.y);
                ctx.lineTo(sx + 10, this.y + this.h);
                ctx.lineTo(sx + 8, this.y + this.h);
            }
            ctx.fill();
            return;
        }
        if (this.lava && (currentLevel < 4 || currentLevel === 6 || currentLevel === "hub")) {
            ctx.save();
            const erupting = typeof game !== "undefined" && game && game.eruptingMode;
            const isLow = typeof window !== "undefined" && window.PerfQuality && window.PerfQuality.level === "low";
            
            if (window.postGameHorror) {
                const bloodGrad = ctx.createLinearGradient(px, this.y, px, this.y + this.h);
                bloodGrad.addColorStop(0, "rgba(100, 0, 0, 0.9)");
                bloodGrad.addColorStop(0.5, "rgba(50, 0, 0, 0.95)");
                bloodGrad.addColorStop(1, "rgba(15, 0, 0, 1)");
                ctx.fillStyle = bloodGrad;
                ctx.fillRect(px, this.y, this.w, this.h);
                
                ctx.fillStyle = "#ff0000";
                ctx.beginPath();
                for (let i = 0; i < this.w; i += 22) {
                    let bubbleY = this.y + 4 + Math.sin(time * .06 + i) * 3;
                    const bRadius = 3 + Math.sin(time*0.1 + i);
                    ctx.moveTo(px + i + 10 + bRadius, bubbleY);
                    ctx.arc(px + i + 10, bubbleY, bRadius, 0, Math.PI * 2);
                }
                ctx.fill();
                ctx.restore();
                return;
            }
            
            const lavaGrad = ctx.createLinearGradient(px, this.y, px, this.y + this.h);
            lavaGrad.addColorStop(0, erupting ? "#ff6600" : "#ffaa00");
            lavaGrad.addColorStop(0.2, erupting ? "#ff3300" : "#ff3300");
            lavaGrad.addColorStop(1, erupting ? "#660000" : "#330000");
            ctx.fillStyle = lavaGrad;
            ctx.fillRect(px, this.y, this.w, this.h);

            if (!isLow) {
                ctx.fillStyle = "rgba(15, 5, 5, 0.85)";
                ctx.beginPath();
                for(let cx = px; cx < px + this.w; cx += 45) {
                    const crustWave = Math.sin(time * 0.02 + cx) * 5;
                    ctx.roundRect(cx + Math.sin(time*0.01 + cx)*15, this.y + 10 + crustWave, 25, 8, 4);
                    ctx.roundRect(cx - Math.cos(time*0.01 + cx)*15, this.y + 28 + crustWave*0.5, 18, 6, 3);
                }
                ctx.fill();
                
                ctx.strokeStyle = erupting ? "#ff5500" : "#ff5500";
                ctx.lineWidth = 1;
                ctx.beginPath();
                for(let cx = px; cx < px + this.w; cx += 45) {
                    const crustWave = Math.sin(time * 0.02 + cx) * 5;
                    ctx.moveTo(cx + Math.sin(time*0.01 + cx)*15 + 5, this.y + 14 + crustWave);
                    ctx.lineTo(cx + Math.sin(time*0.01 + cx)*15 + 20, this.y + 12 + crustWave);
                }
                ctx.stroke();
            }

            ctx.fillStyle = erupting ? "#ffffff" : "#ff4500";
            ctx.beginPath();
            ctx.moveTo(px, this.y);
            for (let i = 0; i <= this.w; i += 10) {
                let waveY = this.y + Math.sin(time * (erupting ? 0.15 : 0.08) + i * 0.05) * (erupting ? 8 : 4);
                ctx.lineTo(px + i, waveY);
            }
            ctx.lineTo(px + this.w, this.y + 5);
            ctx.lineTo(px, this.y + 5);
            ctx.fill();

            const popWhite = [];
            const popOrange = [];
            const swellBubbles = [];
            for (let i = 0; i < this.w; i += (isLow ? 50 : 25)) {
                const bPhase = time * (erupting ? 0.1 : 0.05) + i;
                const bHeight = (bPhase % 10) > 8 ? ((bPhase % 10) - 8) * -5 : 0;
                
                if (bHeight < 0) {
                    let bubbleY = this.y + Math.sin(bPhase)*2 + bHeight;
                    popWhite.push({ x: px + i + 12, y: bubbleY });
                    popOrange.push({ x: px + i + 12, y: bubbleY + 3 });
                } else {
                    let bubbleY = this.y + 4 + Math.sin(time * 0.05 + i) * 3;
                    swellBubbles.push({ x: px + i + 12, y: bubbleY, r: 4 + Math.sin(bPhase)*1.5 });
                }
            }

            if (popWhite.length > 0) {
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                for (let k = 0; k < popWhite.length; k++) {
                    ctx.moveTo(popWhite[k].x + 2, popWhite[k].y);
                    ctx.arc(popWhite[k].x, popWhite[k].y, 2, 0, Math.PI * 2);
                }
                ctx.fill();

                ctx.fillStyle = erupting ? "#ff5500" : "#ff5500";
                ctx.beginPath();
                for (let k = 0; k < popOrange.length; k++) {
                    ctx.moveTo(popOrange[k].x + 4, popOrange[k].y);
                    ctx.arc(popOrange[k].x, popOrange[k].y, 4, 0, Math.PI * 2);
                }
                ctx.fill();
            }

            if (swellBubbles.length > 0) {
                ctx.fillStyle = erupting ? "#ff4500" : "#ffa500";
                ctx.beginPath();
                for (let k = 0; k < swellBubbles.length; k++) {
                    ctx.moveTo(swellBubbles[k].x + swellBubbles[k].r, swellBubbles[k].y);
                    ctx.arc(swellBubbles[k].x, swellBubbles[k].y, swellBubbles[k].r, 0, Math.PI * 2);
                }
                ctx.fill();
            }
            ctx.restore();
            return;
        }
        if (this.button) {
            const btnPressed = game.blueSquare && (game.blueSquare.state === "button_pressed" || game.blueSquare.state === "blizzard_transition" || game.iceMode);
            const pressOffsetY = btnPressed ? 6 : 0;
            ctx.save();
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(px, this.y, this.w, this.h);
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 2;
            ctx.strokeRect(px, this.y, this.w, this.h);
            ctx.fillStyle = "#38bdf8";
            ctx.fillRect(px + 2, this.y + 2, this.w - 4, 2);
            const btnW = 34;
            const btnH = 12;
            const btnX = px + (this.w - btnW) / 2;
            const pedY = this.y - 6;
            ctx.fillStyle = "#1e293b";
            ctx.strokeStyle = "#0284c7";
            ctx.lineWidth = 1.5;
            ctx.fillRect(btnX - 4, pedY, btnW + 8, 6);
            ctx.strokeRect(btnX - 4, pedY, btnW + 8, 6);
            const pulse = Math.sin((time || 0) * .08) * 3;
            ctx.shadowColor = btnPressed ? "#00e5ff" : "#38bdf8";
            ctx.shadowBlur = btnPressed ? 16 : 10 + pulse;
            const grad = ctx.createLinearGradient(btnX, pedY - btnH + pressOffsetY, btnX, pedY + pressOffsetY);
            if (btnPressed) {
                grad.addColorStop(0, "#e0f2fe");
                grad.addColorStop(.5, "#38bdf8");
                grad.addColorStop(1, "#0284c7");
            } else {
                grad.addColorStop(0, "#67e8f9");
                grad.addColorStop(.5, "#06b6d4");
                grad.addColorStop(1, "#0e7490");
            }
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(btnX, pedY - btnH + pressOffsetY, btnW, btnH, [ 4, 4, 2, 2 ]);
            ctx.fill();
            ctx.strokeStyle = btnPressed ? "#ffffff" : "#e0f2fe";
            ctx.lineWidth = 1.8;
            ctx.stroke();
            if (!btnPressed) {
                const bounceY = Math.sin((time || 0) * .1) * 3;
                ctx.fillStyle = "#ffffff";
                ctx.font = 'bold 14px "Fredoka One", cursive, sans-serif';
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                ctx.shadowColor = "#38bdf8";
                ctx.shadowBlur = 8;
                const label = typeof __ === "function" ? __("ui_pisar_boton") : "▼ PULSA ▼";
                ctx.fillText(label, px + this.w / 2, pedY - btnH - 18 + bounceY);
            } else {
                ctx.fillStyle = "#86efac";
                ctx.font = 'bold 13px "Fredoka One", cursive, sans-serif';
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                ctx.shadowBlur = 0;
                ctx.fillText("✓", px + this.w / 2, pedY - btnH - 12 + pressOffsetY);
            }
            ctx.restore();
            return;
        }
        if (this.isGateButton) {
            const isGate1 = this.isGateButton === 1;
            const isPressed = isGate1 ? typeof game !== "undefined" && game.gate1Open : typeof game !== "undefined" && game.gate2Open;
            const pressOffsetY = isPressed ? 7 : 0;
            const baseColor = isGate1 ? "#10b981" : "#f59e0b";
            const lightColor = isGate1 ? "#6ee7b7" : "#fde047";
            const darkColor = isGate1 ? "#064e3b" : "#78350f";
            ctx.save();
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(px, this.y, this.w, this.h);
            ctx.strokeStyle = baseColor;
            ctx.lineWidth = 2.5;
            ctx.strokeRect(px, this.y, this.w, this.h);
            ctx.fillStyle = baseColor;
            ctx.fillRect(px + 4, this.y + 3, this.w - 8, 2);
            const btnW = 42;
            const btnH = 14;
            const btnX = px + (this.w - btnW) / 2;
            const pedY = this.y - 6;
            ctx.fillStyle = "#1e293b";
            ctx.strokeStyle = baseColor;
            ctx.lineWidth = 2;
            ctx.fillRect(btnX - 6, pedY, btnW + 12, 6);
            ctx.strokeRect(btnX - 6, pedY, btnW + 12, 6);
            ctx.shadowBlur = 0;
            const grad = ctx.createLinearGradient(btnX, pedY - btnH + pressOffsetY, btnX, pedY + pressOffsetY);
            if (isPressed) {
                grad.addColorStop(0, "#ffffff");
                grad.addColorStop(.5, lightColor);
                grad.addColorStop(1, baseColor);
            } else {
                grad.addColorStop(0, lightColor);
                grad.addColorStop(.5, baseColor);
                grad.addColorStop(1, darkColor);
            }
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(btnX, pedY - btnH + pressOffsetY, btnW, btnH, [ 5, 5, 2, 2 ]);
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.8;
            ctx.stroke();
            if (!isPressed) {
                const bounceY = Math.sin((time || 0) * .1) * 3;
                ctx.fillStyle = "#ffffff";
                ctx.font = 'bold 14px "Fredoka One", cursive, sans-serif';
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                ctx.shadowColor = baseColor;
                ctx.shadowBlur = 8;
                const label = typeof __ === "function" ? __("ui_pisar_boton") : "▼ PULSA ▼";
                ctx.fillText(label, px + this.w / 2, pedY - btnH - 18 + bounceY);
            } else {
                ctx.fillStyle = "#86efac";
                ctx.font = 'bold 13px "Fredoka One", cursive, sans-serif';
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                ctx.shadowBlur = 0;
                ctx.fillText("✓", px + this.w / 2, pedY - btnH - 12 + pressOffsetY);
            }
            ctx.restore();
            return;
        }
        if (this.isTechBridgeButton) {
            const isPressed = this.pressed || (typeof game !== "undefined" && game.techBridgeActive);
            const pressOffsetY = isPressed ? 7 : 0;
            const baseColor = "#00e5ff";
            const activeColor = "#10b981";
            ctx.save();
            ctx.fillStyle = "#090d16";
            ctx.fillRect(px, this.y, this.w, this.h);
            ctx.strokeStyle = isPressed ? activeColor : baseColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(px, this.y, this.w, this.h);
            
            const btnW = 38;
            const btnH = 14;
            const btnX = px + (this.w - btnW) / 2;
            const pedY = this.y - 4;
            
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(btnX - 5, pedY, btnW + 10, 5);
            ctx.strokeStyle = isPressed ? activeColor : baseColor;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(btnX - 5, pedY, btnW + 10, 5);
            
            const grad = ctx.createLinearGradient(btnX, pedY - btnH + pressOffsetY, btnX, pedY + pressOffsetY);
            if (isPressed) {
                grad.addColorStop(0, "#6ee7b7");
                grad.addColorStop(0.5, "#10b981");
                grad.addColorStop(1, "#047857");
            } else {
                grad.addColorStop(0, "#38bdf8");
                grad.addColorStop(0.5, "#0284c7");
                grad.addColorStop(1, "#0369a1");
            }
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(btnX, pedY - btnH + pressOffsetY, btnW, btnH, [ 4, 4, 2, 2 ]);
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.6;
            ctx.stroke();
            
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 10px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(isPressed ? "ON" : "ACT", btnX + btnW / 2, pedY - btnH / 2 + pressOffsetY);
            
            if (!isPressed) {
                const floatY = Math.sin((time || 0) * 0.1) * 3;
                ctx.fillStyle = "rgba(0, 229, 255, 0.95)";
                ctx.font = 'bold 12px "Fredoka One", cursive, sans-serif';
                ctx.shadowColor = "#00e5ff";
                ctx.shadowBlur = 8;
                ctx.fillText(typeof __ === "function" ? __("ui_activar_puente") : "▼ ACTIVAR PUENTE ▼", px + this.w / 2, pedY - btnH - 14 + floatY);
                ctx.shadowBlur = 0;
            } else {
                ctx.fillStyle = "#10b981";
                ctx.font = "bold 11px monospace";
                ctx.fillText(typeof __ === "function" ? __("flt_en_linea") : "⚡ EN LÍNEA ✓", px + this.w / 2, pedY - btnH - 12);
            }
            ctx.restore();
            return;
        }
        if (this.isTechDrone) {
            const isActive = typeof game !== "undefined" && game.techBridgeActive;
            if (!isActive && !this._cinematicDescending) return;
            ctx.save();
            const timeVal = typeof time !== "undefined" ? time : Date.now() * .06;
            
            const bodyGrad = ctx.createLinearGradient(px, this.y, px, this.y + this.h);
            bodyGrad.addColorStop(0, "#1e293b");
            bodyGrad.addColorStop(0.5, "#0f172a");
            bodyGrad.addColorStop(1, "#020617");
            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.roundRect(px, this.y, this.w, this.h, [ 6, 6, 4, 4 ]);
            ctx.fill();
            
            ctx.strokeStyle = "#00e5ff";
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.fillStyle = "#00ffcc";
            ctx.fillRect(px + 10, this.y + 2, this.w - 20, 2);
            
            ctx.fillStyle = "rgba(255, 204, 0, 0.75)";
            for (let ch = px + 35; ch < px + this.w - 35; ch += 14) {
                ctx.beginPath();
                ctx.moveTo(ch, this.y + 6);
                ctx.lineTo(ch + 5, this.y + this.h / 2);
                ctx.lineTo(ch, this.y + this.h - 6);
                ctx.lineTo(ch + 3, this.y + this.h - 6);
                ctx.lineTo(ch + 8, this.y + this.h / 2);
                ctx.lineTo(ch + 3, this.y + 6);
                ctx.closePath();
                ctx.fill();
            }
            
            const turbineOffsets = [ 20, this.w - 20 ];
            for (let t = 0; t < turbineOffsets.length; t++) {
                const tx = px + turbineOffsets[t];
                const ty = this.y + this.h;
                
                ctx.fillStyle = "#334155";
                ctx.beginPath();
                ctx.roundRect(tx - 11, ty - 4, 22, 12, [ 2, 2, 4, 4 ]);
                ctx.fill();
                ctx.strokeStyle = "#00e5ff";
                ctx.lineWidth = 1.5;
                ctx.stroke();
                
                ctx.save();
                ctx.translate(tx, ty + 2);
                const bladeAngle = (timeVal * 0.45 + t * Math.PI) % (Math.PI * 2);
                ctx.rotate(bladeAngle);
                ctx.strokeStyle = "#94a3b8";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-7, 0); ctx.lineTo(7, 0);
                ctx.moveTo(0, -7); ctx.lineTo(0, 7);
                ctx.stroke();
                ctx.restore();
                
                const flameLen = 14 + Math.sin(timeVal * 0.35 + (this.techDroneIndex || 0) + t) * 4 + (Math.random() * 5);
                const flameGrad = ctx.createLinearGradient(tx, ty + 8, tx, ty + 8 + flameLen);
                flameGrad.addColorStop(0, "#ffffff");
                flameGrad.addColorStop(0.3, "#38bdf8");
                flameGrad.addColorStop(0.7, "#0284c7");
                flameGrad.addColorStop(1, "rgba(2, 132, 199, 0)");
                
                ctx.fillStyle = flameGrad;
                ctx.beginPath();
                ctx.moveTo(tx - 7, ty + 8);
                ctx.lineTo(tx, ty + 8 + flameLen);
                ctx.lineTo(tx + 7, ty + 8);
                ctx.closePath();
                ctx.fill();
                
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.moveTo(tx - 3, ty + 8);
                ctx.lineTo(tx, ty + 8 + flameLen * 0.5);
                ctx.lineTo(tx + 3, ty + 8);
                ctx.closePath();
                ctx.fill();
                
                if (Math.random() < 0.25 && typeof particles !== "undefined") {
                    particles.push({
                        x: tx + (Math.random() - 0.5) * 6,
                        y: ty + 8 + flameLen,
                        vx: (Math.random() - 0.5) * 1.5,
                        vy: Math.random() * 2 + 1.5,
                        life: 14,
                        color: Math.random() < 0.5 ? "#38bdf8" : "#ffffff",
                        size: 2.2,
                        type: "spark"
                    });
                }
            }
            
            const ledPulse = Math.floor(timeVal * 0.15) % 2 === 0;
            ctx.fillStyle = ledPulse ? "#00ffcc" : "#0284c7";
            ctx.beginPath();
            ctx.arc(px + 8, this.y + 7, 3, 0, Math.PI * 2);
            ctx.arc(px + this.w - 8, this.y + 7, 3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
            return;
        }
        if (this.isGateObstacle) {
            const isGate1 = this.isGateObstacle === 1;
            const isOpen = isGate1 ? typeof game !== "undefined" && game.gate1Open : typeof game !== "undefined" && game.gate2Open;
            const themeColor = isGate1 ? "#10b981" : "#f59e0b";
            const themeGlow = isGate1 ? "#34d399" : "#fbbf24";
            const glowPulse = 6 + Math.sin((time || 0) * .09) * 4;

            ctx.save();

            ctx.strokeStyle = "#334155";
            ctx.lineWidth = 4;
            const chainL = px + 16, chainR = px + this.w - 16;
            ctx.beginPath();
            ctx.moveTo(chainL, this.y - 120); ctx.lineTo(chainL, this.y);
            ctx.moveTo(chainR, this.y - 120); ctx.lineTo(chainR, this.y);
            ctx.stroke();

            ctx.strokeStyle = themeColor;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            const stoneGrad = ctx.createLinearGradient(px, this.y, px + this.w, this.y);
            stoneGrad.addColorStop(0, "#0b0f19");
            stoneGrad.addColorStop(0.2, "#1e293b");
            stoneGrad.addColorStop(0.5, "#334155");
            stoneGrad.addColorStop(0.8, "#1e293b");
            stoneGrad.addColorStop(1, "#0b0f19");
            ctx.fillStyle = stoneGrad;
            ctx.fillRect(px, this.y, this.w, this.h);

            ctx.fillStyle = "#0f172a";
            ctx.fillRect(px, this.y, 8, this.h);
            ctx.fillRect(px + this.w - 8, this.y, 8, this.h);
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(px, this.y, 8, this.h);
            ctx.strokeRect(px + this.w - 8, this.y, 8, this.h);

            ctx.fillStyle = "#94a3b8";
            for (let ry = this.y + 20; ry < this.y + this.h - 10; ry += 40) {
                ctx.beginPath();
                ctx.arc(px + 4, ry, 2, 0, Math.PI * 2);
                ctx.arc(px + this.w - 4, ry, 2, 0, Math.PI * 2);
                ctx.fill();
            }

            for (let by = this.y + 40; by < this.y + this.h - 30; by += 48) {
                ctx.strokeStyle = "#090d16";
                ctx.lineWidth = 3;
                ctx.beginPath(); ctx.moveTo(px + 8, by); ctx.lineTo(px + this.w - 8, by); ctx.stroke();
                ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(px + 8, by + 1.5); ctx.lineTo(px + this.w - 8, by + 1.5); ctx.stroke();
            }

            const numTeeth = 4;
            const toothW = (this.w - 16) / numTeeth;
            ctx.fillStyle = "#0f172a";
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(px + 8, this.y + this.h);
            for (let ti = 0; ti < numTeeth; ti++) {
                const tx = px + 8 + ti * toothW;
                ctx.lineTo(tx + toothW * 0.5, this.y + this.h + 16);
                ctx.lineTo(tx + toothW, this.y + this.h);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.strokeStyle = themeColor;
            ctx.lineWidth = 2;
            const midX = px + this.w / 2;
            ctx.beginPath();
            ctx.moveTo(midX, this.y + 10);
            ctx.lineTo(midX, this.y + this.h - 20);
            ctx.stroke();

            for (let cy = this.y + 60; cy < this.y + this.h - 40; cy += 65) {
                ctx.beginPath();
                ctx.moveTo(midX, cy);
                ctx.lineTo(midX - 16, cy - 8);
                ctx.lineTo(midX - 16, cy + 8);
                ctx.moveTo(midX, cy);
                ctx.lineTo(midX + 16, cy - 8);
                ctx.lineTo(midX + 16, cy + 8);
                ctx.stroke();
            }

            const midY = this.y + Math.min(this.h - 70, 260);

            ctx.fillStyle = "#1e293b";
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(midX, midY, 26, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.shadowColor = themeGlow;
            ctx.shadowBlur = glowPulse + 4;
            ctx.strokeStyle = themeGlow;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(midX, midY - 24);
            ctx.lineTo(midX + 20, midY);
            ctx.lineTo(midX, midY + 24);
            ctx.lineTo(midX - 20, midY);
            ctx.closePath();
            ctx.stroke();

            const coreGrad = ctx.createRadialGradient(midX, midY, 1, midX, midY, 16);
            coreGrad.addColorStop(0, "#ffffff");
            coreGrad.addColorStop(0.3, themeGlow);
            coreGrad.addColorStop(0.8, themeColor);
            coreGrad.addColorStop(1, "rgba(0, 0, 0, 0.4)");
            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(midX, midY, 14, 0, Math.PI * 2);
            ctx.fill();

            const spin = (time || 0) * 0.04;
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let a = 0; a < 4; a++) {
                const ang = spin + a * (Math.PI / 2);
                ctx.moveTo(midX + Math.cos(ang) * 4, midY + Math.sin(ang) * 4);
                ctx.lineTo(midX + Math.cos(ang) * 11, midY + Math.sin(ang) * 11);
            }
            ctx.stroke();

            ctx.shadowBlur = 0;
            ctx.restore();
            return;
        }
        if (this.isStalactite) {
            ctx.save();
            let rX = px;
            let rY = this.y;
            if (this.stalacShake > 0) {
                rX += (Math.random() - .5) * 7;
            }
            const pw = this.w;
            const ph = this.h;
            const cx = rX + pw / 2;

            if ((this.stalacLanded || this.stalacFalling) && !this.fallingThroughHole) {
                ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
                ctx.beginPath();
                ctx.ellipse(cx, 498, pw * .55, 8, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            if (this.fallingThroughHole) {
                ctx.translate(cx, rY + ph / 2);
                ctx.rotate((this.y - 450) * 0.03);
                ctx.translate(-cx, -(rY + ph / 2));
            }

            ctx.fillStyle = "#1c1917";
            ctx.beginPath();
            ctx.moveTo(rX - 8, rY - 2);
            ctx.lineTo(rX + pw + 8, rY - 2);
            ctx.lineTo(rX + pw + 4, rY + 8);
            ctx.lineTo(rX - 4, rY + 8);
            ctx.closePath();
            ctx.fill();

            const darkGrad = ctx.createLinearGradient(cx, rY, rX + pw + 4, rY + ph);
            darkGrad.addColorStop(0, "#292524");
            darkGrad.addColorStop(0.5, "#1c1917");
            darkGrad.addColorStop(1, "#0c0a09");
            ctx.fillStyle = darkGrad;
            ctx.beginPath();
            ctx.moveTo(cx, rY);
            ctx.lineTo(rX + pw + 4, rY);
            ctx.lineTo(rX + pw + 2, rY + ph * .28);
            ctx.lineTo(rX + pw * .8, rY + ph * .55);
            ctx.lineTo(rX + pw * .6, rY + ph * .8);
            ctx.lineTo(cx, rY + ph);
            ctx.closePath();
            ctx.fill();

            const lightGrad = ctx.createLinearGradient(rX - 4, rY, cx, rY + ph);
            lightGrad.addColorStop(0, "#78716c");
            lightGrad.addColorStop(0.4, "#57534e");
            lightGrad.addColorStop(0.8, "#44403c");
            lightGrad.addColorStop(1, "#1c1917");
            ctx.fillStyle = lightGrad;
            ctx.beginPath();
            ctx.moveTo(rX - 4, rY);
            ctx.lineTo(cx, rY);
            ctx.lineTo(cx, rY + ph);
            ctx.lineTo(rX + pw * .4, rY + ph * .8);
            ctx.lineTo(rX + pw * .18, rY + ph * .55);
            ctx.lineTo(rX - 2, rY + ph * .28);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = "#0c0a09";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(rX - 4, rY);
            ctx.lineTo(rX + pw + 4, rY);
            ctx.lineTo(rX + pw + 2, rY + ph * .28);
            ctx.lineTo(rX + pw * .8, rY + ph * .55);
            ctx.lineTo(rX + pw * .6, rY + ph * .8);
            ctx.lineTo(cx, rY + ph);
            ctx.lineTo(rX + pw * .4, rY + ph * .8);
            ctx.lineTo(rX + pw * .18, rY + ph * .55);
            ctx.lineTo(rX - 2, rY + ph * .28);
            ctx.closePath();
            ctx.stroke();

            ctx.strokeStyle = "#a8a29e";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, rY + 4);
            ctx.lineTo(cx, rY + ph - 4);
            ctx.stroke();

            const veinPulse = 0.7 + Math.sin((time || 0) * 0.1 + (this.x % 10)) * 0.3;
            ctx.shadowColor = "#f59e0b";
            ctx.shadowBlur = 8 * veinPulse;
            ctx.strokeStyle = `rgba(245, 158, 11, ${veinPulse})`;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(cx, rY + ph * 0.2);
            ctx.lineTo(cx + 6, rY + ph * 0.35);
            ctx.lineTo(cx + 2, rY + ph * 0.52);
            ctx.lineTo(cx + 7, rY + ph * 0.68);
            ctx.moveTo(cx, rY + ph * 0.35);
            ctx.lineTo(cx - 7, rY + ph * 0.48);
            ctx.lineTo(cx - 3, rY + ph * 0.62);
            ctx.stroke();

            ctx.fillStyle = "#fef08a";
            ctx.beginPath();
            ctx.arc(cx, rY + ph - 2, 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx - 3, rY + ph - 2); ctx.lineTo(cx + 3, rY + ph - 2);
            ctx.moveTo(cx, rY + ph - 5); ctx.lineTo(cx, rY + ph + 1);
            ctx.stroke();

            if (this.stalacShake > 0 && Math.random() < 0.35) {
                ctx.fillStyle = "#d97706";
                ctx.fillRect(cx + (Math.random() - 0.5) * 12, rY + ph + Math.random() * 8, 2, 2);
            }

            ctx.shadowBlur = 0;
            ctx.restore();
            return;
        }
        if (this.isMarioPipe) {
            if (this.y >= 750) return;
            ctx.save();
            const rY = this.y;
            const pw = this.w;
            const ph = this.h;
            const rimH = 26;
            const rimExtra = 6;
            const bodyGrad = ctx.createLinearGradient(px, rY, px + pw, rY);
            bodyGrad.addColorStop(0, "#0f5132");
            bodyGrad.addColorStop(.18, "#16a34a");
            bodyGrad.addColorStop(.42, "#86efac");
            bodyGrad.addColorStop(.65, "#22c55e");
            bodyGrad.addColorStop(.85, "#15803d");
            bodyGrad.addColorStop(1, "#052e16");
            ctx.fillStyle = bodyGrad;
            ctx.fillRect(px, rY + rimH, pw, ph - rimH);
            ctx.strokeStyle = "#052e16";
            ctx.lineWidth = 3;
            ctx.strokeRect(px, rY + rimH, pw, ph - rimH);
            const rimGrad = ctx.createLinearGradient(px - rimExtra, rY, px + pw + rimExtra, rY);
            rimGrad.addColorStop(0, "#0f5132");
            rimGrad.addColorStop(.18, "#22c55e");
            rimGrad.addColorStop(.42, "#bbf7d0");
            rimGrad.addColorStop(.65, "#16a34a");
            rimGrad.addColorStop(.85, "#14532d");
            rimGrad.addColorStop(1, "#052e16");
            ctx.fillStyle = rimGrad;
            ctx.fillRect(px - rimExtra, rY, pw + rimExtra * 2, rimH);
            ctx.fillStyle = "rgba(5, 46, 22, 0.7)";
            ctx.fillRect(px, rY + rimH, pw, 5);
            ctx.strokeStyle = "#052e16";
            ctx.lineWidth = 3;
            ctx.strokeRect(px - rimExtra, rY, pw + rimExtra * 2, rimH);
            ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
            ctx.fillRect(px - rimExtra + 3, rY + 2, pw + rimExtra * 2 - 6, 2.5);
            ctx.restore();
            return;
        }
        if (this.isRescuePlatform) {
            if (this.y >= 750) return;
            const isOpen = typeof game !== "undefined" && game.gate2Open;
            ctx.save();
            if (isOpen && this.y > this.originY) {
                const beamGrad = ctx.createLinearGradient(px, this.y, px, 600);
                beamGrad.addColorStop(0, "rgba(251, 191, 36, 0.5)");
                beamGrad.addColorStop(1, "rgba(251, 191, 36, 0)");
                ctx.fillStyle = beamGrad;
                ctx.fillRect(px, this.y, this.w, 600 - this.y);
            }
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(px, this.y, this.w, this.h);
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 2.5;
            ctx.strokeRect(px, this.y, this.w, this.h);
            ctx.fillStyle = "#fbbf24";
            ctx.shadowColor = "#f59e0b";
            ctx.shadowBlur = 8;
            ctx.fillRect(px + 2, this.y + 2, this.w - 4, 3);
            ctx.shadowBlur = 0;
            ctx.restore();
            return;
        }
        if (this.isGateBridge) {
            if (this.y >= 750) return;
            const isOpen = typeof game !== "undefined" && game.gate2Open;
            ctx.save();
            if (isOpen && this.y > this.originY) {
                const beamGrad = ctx.createLinearGradient(px, this.y, px, 600);
                beamGrad.addColorStop(0, "rgba(251, 191, 36, 0.4)");
                beamGrad.addColorStop(1, "rgba(251, 191, 36, 0)");
                ctx.fillStyle = beamGrad;
                ctx.fillRect(px, this.y, this.w, 600 - this.y);
            }
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(px, this.y, this.w, this.h);
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 2.5;
            ctx.strokeRect(px, this.y, this.w, this.h);
            ctx.fillStyle = "#fbbf24";
            ctx.shadowColor = "#f59e0b";
            ctx.shadowBlur = 10;
            ctx.fillRect(px + 2, this.y + 2, this.w - 4, 4);
            ctx.strokeStyle = "#d97706";
            ctx.lineWidth = 1.5;
            for (let lx = px + 16; lx < px + this.w - 10; lx += 24) {
                ctx.beginPath();
                ctx.moveTo(lx, this.y + 6);
                ctx.lineTo(lx, this.y + this.h - 4);
                ctx.stroke();
            }
            ctx.shadowBlur = 0;
            ctx.restore();
            return;
        }
        if (this.cage) {
            ctx.save();
            ctx.strokeStyle = "#aaa";
            ctx.lineWidth = 4;
            for (let b = 0; b < 6; b++) {
                const bx = px + 20 + b * ((this.w - 40) / 5);
                ctx.beginPath();
                ctx.moveTo(bx, this.y);
                ctx.lineTo(bx, this.y + this.h);
                ctx.stroke();
            }
            for (let b = 0; b < 3; b++) {
                const by = this.y + 10 + b * ((this.h - 20) / 2);
                ctx.beginPath();
                ctx.moveTo(px + 10, by);
                ctx.lineTo(px + this.w - 10, by);
                ctx.stroke();
            }
            ctx.fillStyle = "#ffd700";
            ctx.shadowColor = "#ffd700";
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.arc(px + this.w / 2, this.y + this.h / 2, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#ffffff";
            ctx.font = 'bold 14px "Courier Prime", monospace';
            ctx.textAlign = "center";
            ctx.fillText(__("ui_jaula_amigos"), px + this.w / 2, this.y - 14);
            ctx.restore();
            return;
        }
        if (game.happyMode) {
            const soilGrad = ctx.createLinearGradient(px, this.y, px, this.y + this.h);
            soilGrad.addColorStop(0, "#1c2d1b");
            soilGrad.addColorStop(.35, "#2e1c12");
            soilGrad.addColorStop(1, "#140c08");
            ctx.fillStyle = soilGrad;
            ctx.fillRect(px, this.y, this.w, this.h);
            const dreadLvl = game.dread || 0;
            const grassGrad = ctx.createLinearGradient(px, this.y, px, this.y + 14);
            if (dreadLvl > .4) {
                grassGrad.addColorStop(0, "#4d7c0f");
                grassGrad.addColorStop(.6, "#365314");
                grassGrad.addColorStop(1, "#1c1917");
            } else {
                grassGrad.addColorStop(0, "#22c55e");
                grassGrad.addColorStop(.5, "#16a34a");
                grassGrad.addColorStop(1, "#15803d");
            }
            ctx.fillStyle = grassGrad;
            ctx.beginPath();
            ctx.roundRect(px, this.y, this.w, 14, [ 4, 4, 0, 0 ]);
            ctx.fill();
            const startX = Math.max(0, px);
            const endX = Math.min(VIEW_W, px + this.w);
            ctx.fillStyle = dreadLvl > .4 ? "#3f6212" : "#4ade80";
            for (let gx = startX; gx < endX; gx += 12) {
                const hWave = Math.sin(time * .08 + gx * .1) * 2;
                ctx.beginPath();
                ctx.moveTo(gx, this.y + 2);
                ctx.lineTo(gx + 2 + hWave, this.y - 5);
                ctx.lineTo(gx + 5, this.y + 2);
                ctx.fill();
            }
            if (dreadLvl > .25) {
                ctx.fillStyle = `rgba(136, 0, 18, ${Math.min(.8, dreadLvl * .9)})`;
                for (let sx = startX + 18; sx < endX; sx += 70) {
                    ctx.beginPath();
                    ctx.ellipse(sx, this.y + 3, 14, 4, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                for (let fx = startX + 22; fx < endX; fx += 55) {
                    ctx.fillStyle = fx % 2 === 0 ? "#ffffff" : "#7dd3fc";
                    ctx.beginPath();
                    ctx.arc(fx, this.y - 3, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#fef08a";
                    ctx.beginPath();
                    ctx.arc(fx, this.y - 3, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            return;
        }
        if (this.isHorrorPlatform) {
            ctx.save();
            const bw = this.w;
            const bh = this.h;
            const bGrad = ctx.createLinearGradient(px, this.y, px, this.y + bh);
            bGrad.addColorStop(0, "#2a1520");
            bGrad.addColorStop(0.5, "#170a12");
            bGrad.addColorStop(1, "#0a0408");
            ctx.fillStyle = bGrad;
            ctx.beginPath();
            ctx.roundRect(px, this.y, bw, bh, [4, 4, 6, 6]);
            ctx.fill();

            const topBone = ctx.createLinearGradient(px, this.y, px, this.y + 6);
            topBone.addColorStop(0, "#f8fafc");
            topBone.addColorStop(0.5, "#cbd5e1");
            topBone.addColorStop(1, "#991b1b");
            ctx.fillStyle = topBone;
            ctx.beginPath();
            ctx.roundRect(px, this.y, bw, 5, [4, 4, 0, 0]);
            ctx.fill();

            const skX = px + bw / 2;
            const skY = this.y + bh / 2 + 1;
            ctx.fillStyle = "#e2e8f0";
            ctx.beginPath();
            ctx.arc(skX, skY - 2, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(skX - 4, skY + 2, 8, 4);
            ctx.fillStyle = this.boneType === "obsidian" ? "#ef4444" : "#a855f7";
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(skX - 2.5, skY - 2, 1.8, 0, Math.PI * 2);
            ctx.arc(skX + 2.5, skY - 2, 1.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            const fPhase = (time || 0) * 0.15;
            ctx.fillStyle = this.boneType === "obsidian" ? "#f97316" : "#c084fc";
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(px + 6, this.y - 2 + Math.sin(fPhase) * 2, 3, 0, Math.PI * 2);
            ctx.arc(px + bw - 6, this.y - 2 + Math.cos(fPhase) * 2, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = "rgba(185, 28, 28, 0.85)";
            for (let bx = px + 12; bx < px + bw - 10; bx += 22) {
                const dropH = 3 + Math.sin(bx + (time || 0) * 0.05) * 3;
                ctx.beginPath();
                ctx.moveTo(bx - 2, this.y + bh);
                ctx.lineTo(bx + 2, this.y + bh);
                ctx.lineTo(bx, this.y + bh + dropH);
                ctx.closePath();
                ctx.fill();
            }

            if (this.trampoline && typeof drawTrampolinePad === "function") {
                drawTrampolinePad(ctx, px, this.y, this.w, time);
            }

            ctx.restore();
            return;
        }
        if (window.postGameHorror) {
            const rockGrad = ctx.createLinearGradient(px, this.y, px, this.y + this.h);
            rockGrad.addColorStop(0, "#22131b");
            rockGrad.addColorStop(0.3, "#140a10");
            rockGrad.addColorStop(1, "#070305");
            ctx.fillStyle = rockGrad;
            ctx.fillRect(px, this.y, this.w, this.h);

            ctx.fillStyle = "#cbd5e1";
            ctx.fillRect(px, this.y, this.w, 3.5);
            ctx.fillStyle = "#7f1d1d";
            ctx.fillRect(px, this.y + 3.5, this.w, 2);

            const startX = Math.max(0, px);
            const endX = Math.min(VIEW_W, px + this.w);

            ctx.fillStyle = "#f1f5f9";
            ctx.beginPath();
            for (let ox = startX + 16; ox < endX - 8; ox += 36) {
                ctx.rect(ox - 3, this.y - 2, 6, 3);
            }
            ctx.fill();

            const pulse = (Math.sin((time || 0) * 0.08 + px * 0.03) + 1) * 0.5;
            ctx.strokeStyle = `rgba(220, 38, 38, ${0.4 + pulse * 0.35})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let vx = startX + 24; vx < endX - 16; vx += 52) {
                ctx.moveTo(vx, this.y + 4);
                ctx.lineTo(vx + 6, this.y + 12);
                ctx.lineTo(vx - 2, this.y + Math.min(this.h - 2, 22));
            }
            ctx.stroke();

            ctx.fillStyle = "rgba(127, 29, 29, 0.85)";
            ctx.beginPath();
            for (let bx = startX + 32; bx < endX - 12; bx += 60) {
                ctx.rect(bx - 4, this.y + 2, 8, 3);
                ctx.rect(bx - 1, this.y + 5, 3, 5);
            }
            ctx.fill();

            if (this.trampoline) {
                drawTrampolinePad(ctx, px, this.y, this.w, time);
            }
            return;
        }
        if (game.isHub || currentLevel === "hub") {
            if (this.h > 200) {
                const isLeftWall = this.x < 500;
                const wallGrad = ctx.createLinearGradient(px, this.y, px + this.w, this.y);
                if (isLeftWall) {
                    wallGrad.addColorStop(0, "#06030c");
                    wallGrad.addColorStop(.7, "#0f0820");
                    wallGrad.addColorStop(1, "#1b0e38");
                } else {
                    wallGrad.addColorStop(0, "#1b0e38");
                    wallGrad.addColorStop(.3, "#0f0820");
                    wallGrad.addColorStop(1, "#06030c");
                }
                ctx.fillStyle = wallGrad;
                ctx.fillRect(px, this.y, this.w, this.h);
                const edgeX = isLeftWall ? px + this.w - 4 : px;
                const neonV = ctx.createLinearGradient(0, this.y, 0, this.y + this.h);
                neonV.addColorStop(0, "#c084fc");
                neonV.addColorStop(.5, "#38bdf8");
                neonV.addColorStop(1, "#a855f7");
                ctx.fillStyle = neonV;
                ctx.shadowColor = "#38bdf8";
                ctx.shadowBlur = 15;
                ctx.fillRect(edgeX, this.y, 4, this.h);
                ctx.shadowBlur = 0;
                ctx.fillStyle = isLeftWall ? "rgba(56, 189, 248, 0.08)" : "rgba(192, 132, 252, 0.08)";
                const energyX = isLeftWall ? px + this.w - 18 : px + 4;
                ctx.fillRect(energyX, this.y, 14, this.h);
                const runeCenterX = isLeftWall ? px + this.w - 36 : px + 36;
                ctx.fillStyle = "rgba(192, 132, 252, 0.55)";
                ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
                ctx.lineWidth = 1.5;
                for (let ry = this.y + 60; ry < this.y + this.h - 40; ry += 65) {
                    ctx.beginPath();
                    ctx.moveTo(runeCenterX, ry - 7);
                    ctx.lineTo(runeCenterX + 7, ry);
                    ctx.lineTo(runeCenterX, ry + 7);
                    ctx.lineTo(runeCenterX - 7, ry);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(runeCenterX, ry, 2, 0, Math.PI * 2);
                    ctx.fillStyle = "#ffffff";
                    ctx.fill();
                    ctx.fillStyle = "rgba(192, 132, 252, 0.55)";
                }
            } else {
                const hubGrad = ctx.createLinearGradient(px, this.y, px, this.y + this.h);
                hubGrad.addColorStop(0, "#150d2a");
                hubGrad.addColorStop(.45, "#0f091f");
                hubGrad.addColorStop(1, "#07040e");
                ctx.fillStyle = hubGrad;
                ctx.beginPath();
                ctx.roundRect(px, this.y, this.w, this.h, [ 4, 4, 0, 0 ]);
                ctx.fill();
                const neonGrad = ctx.createLinearGradient(px, this.y, px + this.w, this.y);
                neonGrad.addColorStop(0, "#c084fc");
                neonGrad.addColorStop(.5, "#38bdf8");
                neonGrad.addColorStop(1, "#c084fc");
                ctx.fillStyle = neonGrad;
                ctx.shadowColor = "#a855f7";
                ctx.shadowBlur = 12;
                ctx.fillRect(px, this.y, this.w, 4);
                ctx.shadowBlur = 0;
                ctx.fillStyle = "rgba(192, 132, 252, 0.45)";
                for (let sx = px + 25; sx < px + this.w - 20; sx += 60) {
                    ctx.beginPath();
                    ctx.arc(sx, this.y + 14, 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = "rgba(56, 189, 248, 0.2)";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(sx, this.y + 14);
                    ctx.lineTo(sx + 30, this.y + 20);
                    ctx.stroke();
                }
            }
            return;
        }
        if (currentLevel === 0 && !game.iceMode) {
            const isSubCave = typeof game !== "undefined" && (game.subCaveMode || this.x >= 27900 && this.x <= 34e3);
            const isNight = typeof game !== "undefined" && (game.meadowNight || game.gate2Open && !isSubCave);
            if (isSubCave) {
                const rockGrad = ctx.createLinearGradient(px, this.y, px, this.y + this.h);
                rockGrad.addColorStop(0, "#3a3430");
                rockGrad.addColorStop(.3, "#262220");
                rockGrad.addColorStop(1, "#141211");
                ctx.fillStyle = rockGrad;
                ctx.beginPath();
                ctx.roundRect(px, this.y, this.w, this.h, [ 4, 4, 3, 3 ]);
                ctx.fill();
                ctx.fillStyle = "rgba(180, 160, 140, 0.25)";
                ctx.fillRect(px, this.y, this.w, 2.5);
                ctx.strokeStyle = "#141211";
                ctx.lineWidth = 1.8;
                for (let cx = px + 20; cx < px + this.w - 15; cx += 45) {
                    ctx.beginPath();
                    ctx.moveTo(cx, this.y + 2);
                    ctx.lineTo(cx + 6, this.y + Math.min(this.h - 4, 16));
                    ctx.lineTo(cx + 3, this.y + Math.min(this.h - 2, 28));
                    ctx.stroke();
                }
                if (this.notches && this.notches.length > 0) {
                    this.notches.forEach(n => {
                        const nX = px + n.relX;
                        const nW = n.w || 72;
                        const nD = n.depth || 18;
                        ctx.save();
                        ctx.fillStyle = "#0c0a09";
                        ctx.beginPath();
                        ctx.moveTo(nX - nW / 2, this.y);
                        ctx.lineTo(nX - nW * 0.35, this.y + nD * 0.7);
                        ctx.lineTo(nX, this.y + nD);
                        ctx.lineTo(nX + nW * 0.35, this.y + nD * 0.65);
                        ctx.lineTo(nX + nW / 2, this.y);
                        ctx.closePath();
                        ctx.fill();

                        ctx.strokeStyle = "#1c1917";
                        ctx.lineWidth = 2.5;
                        ctx.stroke();

                        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
                        ctx.lineWidth = 1.2;
                        ctx.beginPath();
                        ctx.moveTo(nX - nW / 2, this.y);
                        ctx.lineTo(nX - nW * 0.35, this.y + nD * 0.7);
                        ctx.lineTo(nX, this.y + nD);
                        ctx.stroke();
                        ctx.restore();
                    });
                }
                if (this.cracks && this.cracks.length > 0) {
                    ctx.save();
                    ctx.strokeStyle = "rgba(0, 0, 0, 0.85)";
                    ctx.lineWidth = 2.4;
                    ctx.lineCap = "round";
                    ctx.beginPath();
                    this.cracks.forEach(branch => {
                        if (!branch || branch.length < 2) return;
                        ctx.moveTo(px + branch[0].x, this.y + branch[0].y);
                        for (let s = 1; s < branch.length; s++) {
                            ctx.lineTo(px + branch[s].x, this.y + branch[s].y);
                        }
                    });
                    ctx.stroke();

                    ctx.strokeStyle = "rgba(180, 160, 140, 0.45)";
                    ctx.lineWidth = 1.0;
                    ctx.beginPath();
                    this.cracks.forEach(branch => {
                        if (!branch || branch.length < 2) return;
                        ctx.moveTo(px + branch[0].x + 0.5, this.y + branch[0].y + 0.5);
                        for (let s = 1; s < branch.length; s++) {
                            ctx.lineTo(px + branch[s].x + 0.5, this.y + branch[s].y + 0.5);
                        }
                    });
                    ctx.stroke();
                    ctx.restore();
                }
                if (this.trampoline) {
                    drawTrampolinePad(ctx, px, this.y, this.w, time);
                }
                if (this.moving) {
                    ctx.strokeStyle = "#b45309";
                    ctx.lineWidth = 1.5;
                    ctx.strokeRect(px + 1, this.y + 1, this.w - 2, this.h - 2);
                }
                ctx.shadowBlur = 0;
                return;
            }
            const visibleLeft = Math.max(0, -px);
            const visibleRight = Math.min(this.w, VIEW_W - px);

            if (!this._soilGrad || this._soilGradNight !== isNight) {
                this._soilGrad = ctx.createLinearGradient(0, this.y, 0, this.y + this.h);
                this._soilGrad.addColorStop(0, isNight ? "#2e1c0c" : "#4A2B14");
                this._soilGrad.addColorStop(.35, isNight ? "#1f1005" : "#321A0A");
                this._soilGrad.addColorStop(1, isNight ? "#0d0602" : "#1A0D04");
                this._soilGradNight = isNight;
            }
            ctx.fillStyle = this._soilGrad;
            ctx.beginPath();
            ctx.roundRect(px, this.y, this.w, this.h, [ 4, 4, 8, 8 ]);
            ctx.fill();

            ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
            ctx.fillRect(px, this.y + this.h * 0.4, this.w, this.h * 0.2);
            ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
            ctx.fillRect(px, this.y + this.h * 0.6, this.w, this.h * 0.1);

            if (this.h > 14 && visibleRight > visibleLeft) {
                const seed = Math.floor(Math.abs(this.x));
                const pStart = Math.max(16, Math.floor(visibleLeft / 28) * 28);
                const pEnd = Math.min(this.w - 12, visibleRight);

                ctx.fillStyle = isNight ? "rgba(80, 55, 35, 0.6)" : "rgba(115, 82, 54, 0.6)";
                ctx.beginPath();
                for (let p = pStart; p < pEnd; p += 28) {
                    const pebbleY = this.y + 12 + (p * 7 + seed) % Math.max(6, this.h - 20);
                    const pebbleSize = 2 + (p + seed) % 3;
                    ctx.moveTo(px + p + pebbleSize, pebbleY);
                    ctx.arc(px + p, pebbleY, pebbleSize, 0, Math.PI * 2);
                }
                ctx.fill();

                ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
                ctx.beginPath();
                for (let p = pStart; p < pEnd; p += 28) {
                    const pebbleY = this.y + 12 + (p * 7 + seed) % Math.max(6, this.h - 20);
                    const pebbleSize = 2 + (p + seed) % 3;
                    const hRad = pebbleSize * 0.4;
                    ctx.moveTo(px + p - pebbleSize * 0.3 + hRad, pebbleY - pebbleSize * 0.3);
                    ctx.arc(px + p - pebbleSize * 0.3, pebbleY - pebbleSize * 0.3, hRad, 0, Math.PI * 2);
                }
                ctx.fill();
                
                const rStart = Math.max(20, Math.floor(visibleLeft / 48) * 48);
                const rEnd = Math.min(this.w - 20, visibleRight);
                ctx.strokeStyle = isNight ? "rgba(30, 15, 5, 0.75)" : "rgba(45, 22, 8, 0.75)";
                ctx.lineWidth = 1.4;
                ctx.lineCap = "round";
                ctx.beginPath();
                for (let r = rStart; r < rEnd; r += 48) {
                    const rootX = px + r;
                    const rootLen = 7 + (r + seed) % 13;
                    ctx.moveTo(rootX, this.y + 8);
                    ctx.quadraticCurveTo(rootX + (r % 2 === 0 ? 4 : -4), this.y + 8 + rootLen * .5, rootX + (r % 3 === 0 ? 6 : -5), this.y + 8 + rootLen);
                }
                ctx.stroke();

                if (px <= 0 || px + this.w >= VIEW_W - 50) {
                    ctx.fillStyle = isNight ? "rgba(15, 80, 30, 0.8)" : "rgba(40, 130, 30, 0.8)";
                    for (let v = 0; v < 2; v++) {
                        const sideX = v === 0 ? px : px + this.w;
                        if (sideX < -20 || sideX > VIEW_W + 20) continue;
                        ctx.beginPath();
                        ctx.moveTo(sideX, this.y + 5);
                        ctx.quadraticCurveTo(sideX + (v === 0 ? 8 : -8), this.y + 15, sideX + (v === 0 ? 2 : -2), this.y + 25);
                        ctx.lineTo(sideX, this.y + 5);
                        ctx.fill();
                    }
                }
            }

            const grassThickness = Math.min(12, this.h * .6);
            if (!this._grassGrad || this._grassGradNight !== isNight) {
                this._grassGrad = ctx.createLinearGradient(0, this.y - 4, 0, this.y + grassThickness);
                this._grassGrad.addColorStop(0, isNight ? "#22c55e" : "#A1E632");
                this._grassGrad.addColorStop(.4, isNight ? "#16a34a" : "#6AC223");
                this._grassGrad.addColorStop(1, isNight ? "#064e3b" : "#2E6911");
                this._grassGradNight = isNight;
            }
            ctx.fillStyle = this._grassGrad;
            ctx.beginPath();
            ctx.roundRect(px - 2, this.y - 2, this.w + 4, grassThickness, [ 6, 6, 2, 2 ]);
            ctx.fill();
            
            ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
            ctx.fillRect(px, this.y + grassThickness - 2, this.w, 3);

            const windSway = Math.sin(time * .08 + this.x * .02) * 1.8;
            
            const bStart = Math.max(4, Math.floor(visibleLeft / 18) * 18);
            const bEnd = Math.min(this.w - 4, visibleRight);
            if (bEnd > bStart) {
                ctx.fillStyle = isNight ? "#16a34a" : "#6AC223";
                ctx.beginPath();
                for (let i = bStart; i < bEnd; i += 18) {
                    const bx = px + i;
                    const bladeH = 5 + (i * 7 + Math.floor(this.x)) % 5;
                    const localSway = windSway + Math.sin(time * .1 + i) * 1.0;
                    ctx.moveTo(bx, this.y - 1);
                    ctx.lineTo(bx + localSway, this.y - bladeH - 2);
                    ctx.lineTo(bx + 3, this.y - 1);
                }
                ctx.fill();

                ctx.fillStyle = isNight ? "#4ade80" : "#B2F542";
                ctx.beginPath();
                for (let i = bStart; i < bEnd; i += 18) {
                    const bx = px + i;
                    const bladeH = 4 + (i * 7 + Math.floor(this.x)) % 4;
                    const localSway = windSway + Math.sin(time * .1 + i) * 1.0;
                    ctx.moveTo(bx + 1, this.y);
                    ctx.lineTo(bx + 1 + localSway * 1.2, this.y - bladeH - 1);
                    ctx.lineTo(bx + 3.5, this.y);
                }
                ctx.fill();
            }

            if (this.w >= 35 && visibleRight > visibleLeft) {
                const flowerStep = Math.max(50, Math.floor(this.w / 2));
                const fStart = Math.max(20, Math.floor(visibleLeft / flowerStep) * flowerStep);
                const fEnd = Math.min(this.w - 15, visibleRight);
                for (let fx = fStart; fx < fEnd; fx += flowerStep) {
                    const flX = px + fx + Math.sin(time * .05 + fx) * 0.8;
                    const flY = this.y - 4 + Math.cos(time * .05 + fx) * 0.4;
                    const flType = (Math.floor(this.x) + fx) % 3;
                    
                    if (flType === 0) {
                        ctx.fillStyle = "#ffffff";
                        ctx.beginPath();
                        ctx.arc(flX - 2.5, flY, 2, 0, Math.PI * 2);
                        ctx.arc(flX + 2.5, flY, 2, 0, Math.PI * 2);
                        ctx.arc(flX, flY - 2.5, 2, 0, Math.PI * 2);
                        ctx.arc(flX, flY + 2.5, 2, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = "#FFC700";
                        ctx.beginPath();
                        ctx.arc(flX, flY, 1.8, 0, Math.PI * 2);
                        ctx.fill();
                    } else if (flType === 1) {
                        ctx.fillStyle = "#FF2E63";
                        ctx.beginPath();
                        ctx.moveTo(flX, flY + 3);
                        ctx.lineTo(flX - 3, flY - 3);
                        ctx.lineTo(flX, flY - 4);
                        ctx.lineTo(flX + 3, flY - 3);
                        ctx.fill();
                        ctx.fillStyle = "#FFA8C5";
                        ctx.fillRect(flX - 1, flY - 2, 2, 2);
                    } else {
                        ctx.fillStyle = "#00D2FC";
                        ctx.beginPath();
                        ctx.arc(flX, flY - 1, 2.5, Math.PI, 0);
                        ctx.lineTo(flX + 2.5, flY + 2);
                        ctx.lineTo(flX - 2.5, flY + 2);
                        ctx.fill();
                        ctx.fillStyle = "#E0F9FF";
                        ctx.fillRect(flX - 1, flY - 1, 2, 2);
                    }
                }
            }
            if (this.trampoline) {
                drawTrampolinePad(ctx, px, this.y, this.w, time);
            }
            if (this.moving) {
                ctx.shadowColor = "#7ed957";
                ctx.shadowBlur = 10 * (1 + this.glow);
            }
        } else if (currentLevel === 0 && game.iceMode) {
            const iceGrad = ctx.createLinearGradient(px, this.y, px, this.y + this.h);
            iceGrad.addColorStop(0, "#c7f4ff");
            iceGrad.addColorStop(.35, "#56ccf2");
            iceGrad.addColorStop(.75, "#2f80ed");
            iceGrad.addColorStop(1, "#0b3c60");
            ctx.fillStyle = iceGrad;
            ctx.beginPath();
            ctx.roundRect(px, this.y, this.w, this.h, [ 3, 3, 2, 2 ]);
            ctx.fill();
            ctx.save();
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = "#80e5ff";
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.roundRect(px, this.y, this.w, 4, [ 3, 3, 0, 0 ]);
            ctx.fill();
            ctx.restore();
            if (this.w >= 28) {
                const seedIce = Math.floor(Math.abs(this.x));
                const icicleGrad = ctx.createLinearGradient(0, this.y + this.h, 0, this.y + this.h + 16);
                icicleGrad.addColorStop(0, "rgba(180, 240, 255, 0.9)");
                icicleGrad.addColorStop(.6, "rgba(84, 197, 240, 0.8)");
                icicleGrad.addColorStop(1, "rgba(230, 250, 255, 0.95)");
                ctx.fillStyle = icicleGrad;
                ctx.beginPath();
                for (let cX = 10; cX < this.w - 8; cX += 20) {
                    const icicleX = px + cX;
                    const icicleY = this.y + this.h;
                    const icicleLen = 5 + (cX * 5 + seedIce) % 11;
                    ctx.moveTo(icicleX - 3, icicleY);
                    ctx.lineTo(icicleX + 3, icicleY);
                    ctx.lineTo(icicleX, icicleY + icicleLen);
                    ctx.closePath();
                }
                ctx.fill();
            }
            ctx.strokeStyle = "rgba(235, 250, 255, 0.65)";
            ctx.lineWidth = 1;
            const crackSeed = Math.floor(Math.abs(this.x));
            for (let c = 0; c < 3; c++) {
                const crackX = px + (c * 43 + crackSeed) % Math.max(10, this.w - 15) + 6;
                ctx.beginPath();
                ctx.moveTo(crackX, this.y + 4);
                ctx.lineTo(crackX + 7, this.y + this.h * .4);
                ctx.lineTo(crackX - 4, this.y + this.h * .75);
                ctx.stroke();
            }
            if (this.jumpHits === 1) {
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2.2;
                for (let cx = 12; cx < this.w; cx += 22) {
                    ctx.beginPath();
                    ctx.moveTo(px + cx, this.y);
                    ctx.lineTo(px + cx + 7, this.y + 12);
                    ctx.lineTo(px + cx - 5, this.y + this.h);
                    ctx.stroke();
                }
            }
        } else if (currentLevel === 1) {
            const isPulse = Math.floor(time * .05) % 2 === 0;
            const neonColor = isPulse ? "#00ffcc" : "#00e5ff";
            
            ctx.fillStyle = "#020617";
            ctx.fillRect(px, this.y, this.w, this.h);
            
            const grad = ctx.createLinearGradient(px, this.y, px, this.y + this.h);
            grad.addColorStop(0, "rgba(15, 23, 42, 0.9)");
            grad.addColorStop(0.5, "rgba(30, 27, 75, 0.7)");
            grad.addColorStop(1, "rgba(2, 6, 23, 0.95)");
            ctx.fillStyle = grad;
            ctx.fillRect(px, this.y, this.w, this.h);

            ctx.strokeStyle = "rgba(0, 255, 204, 0.1)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let xx = px + 10; xx < px + this.w; xx += 20) {
                ctx.moveTo(xx, this.y); ctx.lineTo(xx, this.y + this.h);
            }
            for (let yy = this.y + 10; yy < this.y + this.h; yy += 20) {
                ctx.moveTo(px, yy); ctx.lineTo(px + this.w, yy);
            }
            ctx.stroke();

            ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let c = px + 15; c < px + this.w - 15; c += 40) {
                ctx.moveTo(c, this.y);
                ctx.lineTo(c, this.y + 15);
                ctx.lineTo(c + 10, this.y + 25);
                ctx.lineTo(c + 10, this.y + this.h - 10);
            }
            ctx.stroke();

            ctx.fillStyle = "#ffffff";
            for (let c = px + 15; c < px + this.w - 15; c += 40) {
                let nodeY = this.y + ((time * 0.5 + c) % this.h);
                if (nodeY > this.y + 15 && nodeY < this.y + 25) {
                    ctx.fillRect(c + (nodeY - (this.y + 15)), nodeY - 2, 4, 4);
                } else if (nodeY >= this.y + 25) {
                    ctx.fillRect(c + 8, nodeY - 2, 4, 4);
                } else {
                    ctx.fillRect(c - 2, nodeY - 2, 4, 4);
                }
            }

            ctx.fillStyle = neonColor;
            ctx.fillRect(px, this.y, this.w, 3);
            ctx.fillRect(px, this.y + this.h - 2, this.w, 2);
            ctx.fillRect(px, this.y, 2, this.h);
            ctx.fillRect(px + this.w - 2, this.y, 2, this.h);

            ctx.fillStyle = "rgba(0, 255, 204, 0.6)";
            ctx.font = "bold 11px monospace";
            for (let b = 15; b < this.w - 15; b += 25) {
                const bitTime = Math.floor(time * .1 + b * .03 + this.x * .01);
                const bit = bitTime % 2 === 0 ? "1" : "0";
                const bx = px + b;
                const by = this.y + 18 + (Math.floor(time * .05 + b) % 3) * 6;
                ctx.fillText(bit, bx, by);
            }

            if (this.trampoline) {
                drawTrampolinePad(ctx, px, this.y, this.w, time);
            }
            
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            for (let i = 12; i < this.w - 10; i += 32) {
                ctx.moveTo(px + i + 2.5, this.y + 6);
                ctx.arc(px + i, this.y + 6, 2.5, 0, Math.PI * 2);
            }
            ctx.fill();
        } else if (currentLevel === 2) {
            const grad = ctx.createLinearGradient(px, this.y, px, this.y + this.h);
            grad.addColorStop(0, "#1a0505");
            grad.addColorStop(0.5, "#0d0202");
            grad.addColorStop(1, "#000000");
            ctx.fillStyle = grad;
            ctx.fillRect(px, this.y, this.w, this.h);

            ctx.fillStyle = "#220808";
            ctx.beginPath();
            ctx.moveTo(px, this.y);
            for(let sx = 0; sx <= this.w; sx += 15) {
                ctx.lineTo(px + sx, this.y - (Math.sin(sx * 99) * 4 + 2));
            }
            ctx.lineTo(px + this.w, this.y);
            ctx.fill();

            ctx.beginPath();
            for (let i = 20; i < this.w - 10; i += 50) {
                let cy = this.y + 5;
                let cx = px + i;
                ctx.moveTo(cx, cy);
                for(let step = 0; step < 5; step++) {
                    cy += this.h / 5;
                    cx += (Math.sin(i*step)*15 - 7.5);
                    ctx.lineTo(cx, cy);
                }
            }
            ctx.strokeStyle = "rgba(255, 60, 0, 0.4)";
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.strokeStyle = "#ffaa00";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            const bottomGlow = ctx.createLinearGradient(px, this.y + this.h - 10, px, this.y + this.h);
            bottomGlow.addColorStop(0, "rgba(255, 60, 0, 0)");
            bottomGlow.addColorStop(1, "rgba(255, 60, 0, 0.4)");
            ctx.fillStyle = bottomGlow;
            ctx.fillRect(px, this.y + this.h - 10, this.w, 10);

            if (this.trampoline) {
                drawTrampolinePad(ctx, px, this.y, this.w, time);
            }
            if (this.moving) {
                ctx.strokeStyle = "rgba(255, 100, 0, 0.8)";
                ctx.lineWidth = 2.5;
                ctx.strokeRect(px, this.y, this.w, this.h);
            }
        } else if (currentLevel === 3) {
            const woodGrad = ctx.createLinearGradient(px, this.y, px, this.y + this.h);
            woodGrad.addColorStop(0, "#4a2c14");
            woodGrad.addColorStop(0.2, "#361d0a");
            woodGrad.addColorStop(1, "#1c0d02");
            ctx.fillStyle = woodGrad;
            ctx.fillRect(px, this.y, this.w, this.h);

            ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(px, this.y + 6); ctx.lineTo(px + this.w, this.y + 6);
            ctx.moveTo(px, this.y + this.h - 6); ctx.lineTo(px + this.w, this.y + this.h - 6);
            ctx.stroke();

            ctx.fillStyle = "#0c0501";
            for (let tk = px; tk <= px + this.w; tk += 45) {
                ctx.fillRect(tk, this.y, 2.5, this.h);
            }

            const pilStep = Math.max(90, Math.floor(this.w / 2.5));
            const pilGrad = ctx.createLinearGradient(0, this.y + this.h, 0, this.y + this.h + 160);
            pilGrad.addColorStop(0, "#361a09");
            pilGrad.addColorStop(1, "#100601");
            ctx.fillStyle = pilGrad;
            
            for (let pl = px + 16; pl < px + this.w - 12; pl += pilStep) {
                ctx.fillRect(pl, this.y + this.h, 14, 160);
            }

            ctx.fillStyle = "rgba(180, 230, 255, 0.35)";
            ctx.fillRect(px, this.y, this.w, 2);
            
            ctx.fillStyle = "#00ffaa";
            ctx.beginPath();
            for(let m=px; m < px + this.w; m += 15) {
                if(Math.sin(m*88) > 0) {
                    ctx.moveTo(m + 10, this.y);
                    ctx.arc(m + 7, this.y, 2.8, 0, Math.PI*2);
                }
            }
            ctx.fill();

            if (this.trampoline) {
                drawTrampolinePad(ctx, px, this.y, this.w, time);
            }
            if (this.moving) {
                ctx.strokeStyle = "rgba(6, 182, 212, 0.8)";
                ctx.lineWidth = 2.5;
                ctx.strokeRect(px, this.y, this.w, this.h);
            }
        } else if (currentLevel === 6) {
            const woodGrad = ctx.createLinearGradient(px, this.y, px, this.y + this.h);
            woodGrad.addColorStop(0, "#381e0f");
            woodGrad.addColorStop(.35, "#241208");
            woodGrad.addColorStop(1, "#140803");
            ctx.fillStyle = woodGrad;
            ctx.fillRect(px, this.y, this.w, this.h);
            
            ctx.strokeStyle = "#0f0502";
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let tk = px; tk <= px + this.w; tk += 34) {
                ctx.moveTo(tk, this.y);
                ctx.lineTo(tk, this.y + this.h);
            }
            ctx.stroke();

            ctx.fillStyle = "#64748b";
            ctx.beginPath();
            for (let tk = px; tk <= px + this.w; tk += 34) {
                ctx.moveTo(tk + 5 + 1.8, this.y + 4);
                ctx.arc(tk + 5, this.y + 4, 1.8, 0, Math.PI * 2);
                ctx.moveTo(tk + 5 + 1.8, this.y + this.h - 4);
                ctx.arc(tk + 5, this.y + this.h - 4, 1.8, 0, Math.PI * 2);
            }
            ctx.fill();

            ctx.strokeStyle = "rgba(15, 5, 2, 0.4)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let vy = this.y + 6; vy < this.y + this.h; vy += 10) {
                ctx.moveTo(px, vy);
                ctx.lineTo(px + this.w, vy + Math.sin(vy + px) * 1.5);
            }
            ctx.stroke();

            ctx.fillStyle = "#a855f7";
            ctx.beginPath();
            for (let mx = px + 6; mx < px + this.w - 6; mx += 16) {
                ctx.moveTo(mx + 2, this.y + 1);
                ctx.arc(mx, this.y + 1, 2, 0, Math.PI * 2);
            }
            ctx.fill();

            if (this.notches && this.notches.length > 0) {
                this.notches.forEach(n => {
                    const nX = px + n.relX;
                    const nW = n.w || 74;
                    const nD = n.depth || 18;
                    ctx.save();
                    ctx.fillStyle = "#0c0502";
                    ctx.beginPath();
                    ctx.moveTo(nX - nW / 2, this.y);
                    ctx.lineTo(nX - nW * 0.35, this.y + nD * 0.7);
                    ctx.lineTo(nX, this.y + nD);
                    ctx.lineTo(nX + nW * 0.35, this.y + nD * 0.65);
                    ctx.lineTo(nX + nW / 2, this.y);
                    ctx.closePath();
                    ctx.fill();

                    ctx.strokeStyle = "#1a0802";
                    ctx.lineWidth = 2.5;
                    ctx.stroke();

                    ctx.strokeStyle = "rgba(251, 146, 60, 0.45)";
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.moveTo(nX - nW / 2, this.y);
                    ctx.lineTo(nX - nW * 0.35, this.y + nD * 0.7);
                    ctx.lineTo(nX, this.y + nD);
                    ctx.stroke();
                    ctx.restore();
                });
            }

            if (this.cracks && this.cracks.length > 0) {
                ctx.save();
                ctx.strokeStyle = "rgba(10, 3, 1, 0.9)";
                ctx.lineWidth = 2.4;
                ctx.lineCap = "round";
                ctx.beginPath();
                this.cracks.forEach(branch => {
                    if (!branch || branch.length < 2) return;
                    ctx.moveTo(px + branch[0].x, this.y + branch[0].y);
                    for (let s = 1; s < branch.length; s++) {
                        ctx.lineTo(px + branch[s].x, this.y + branch[s].y);
                    }
                });
                ctx.stroke();

                ctx.strokeStyle = "rgba(251, 146, 60, 0.35)";
                ctx.lineWidth = 1.0;
                ctx.beginPath();
                this.cracks.forEach(branch => {
                    if (!branch || branch.length < 2) return;
                    ctx.moveTo(px + branch[0].x + 0.5, this.y + branch[0].y + 0.5);
                    for (let s = 1; s < branch.length; s++) {
                        ctx.lineTo(px + branch[s].x + 0.5, this.y + branch[s].y + 0.5);
                    }
                });
                ctx.stroke();
                ctx.restore();
            }

            if (this.trampoline) {
                drawTrampolinePad(ctx, px, this.y, this.w, time);
            }
            if (this.moving) {
                ctx.strokeStyle = "rgba(168, 85, 247, 0.8)";
                ctx.lineWidth = 2.5;
                ctx.strokeRect(px, this.y, this.w, this.h);
            }
        } else if (currentLevel === 4) {
            const stoneGrad = ctx.createLinearGradient(px, this.y, px, this.y + this.h);
            stoneGrad.addColorStop(0, "#1c070c");
            stoneGrad.addColorStop(.4, "#0e0205");
            stoneGrad.addColorStop(1, "#050102");
            ctx.fillStyle = stoneGrad;
            ctx.fillRect(px, this.y, this.w, this.h);
            ctx.fillStyle = "rgba(244, 63, 94, 0.25)";
            ctx.fillRect(px, this.y, this.w, 3);
            
            ctx.strokeStyle = "#050102";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            const startTile = Math.floor(this.x / 60) * 60;
            for (let tx = px + (startTile - this.x); tx < px + this.w; tx += 60) {
                if (tx < px) continue;
                ctx.moveTo(tx, this.y);
                ctx.lineTo(tx, this.y + this.h);
            }
            ctx.stroke();

            ctx.strokeStyle = "rgba(225, 29, 72, 0.35)";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            for (let tx = px + (startTile - this.x); tx < px + this.w; tx += 60) {
                if (tx < px) continue;
                ctx.moveTo(tx + 15, this.y + 4);
                ctx.lineTo(tx + 22, this.y + 16);
                ctx.lineTo(tx + 18, this.y + 30);
            }
            ctx.stroke();

            const pulse = Math.sin((time || 0) * .06 + px * .02) * .15 + .2;
            ctx.fillStyle = `rgba(190, 18, 60, ${pulse})`;
            ctx.beginPath();
            for (let fx = Math.max(0, px); fx < Math.min(VIEW_W, px + this.w); fx += 45) {
                const orbRadius = 8 + pulse * 6;
                ctx.moveTo(fx + 20 + orbRadius, this.y - 2);
                ctx.arc(fx + 20, this.y - 2, orbRadius, 0, Math.PI * 2);
            }
            ctx.fill();
            if (this.trampoline) {
                drawTrampolinePad(ctx, px, this.y, this.w, time);
            }
            if (this.moving) {
                ctx.shadowColor = "#e11d48";
                ctx.shadowBlur = 10 * (1 + this.glow);
            }
        } else {
            ctx.fillStyle = "#111";
            ctx.fillRect(px, this.y, this.w, this.h);
            ctx.fillStyle = "#550000";
            if (Math.random() < .05) ctx.fillRect(px + Math.random() * this.w, this.y, 10, 10);
        }
        ctx.shadowBlur = 0;
    }
}

class BossDemon {
    constructor() {
        this.active = false;
        this.x = 0;
        this.y = 200;
        this.w = 96;
        this.h = 96;
        this.state = "hidden";
        this.animRow = 1;
        this.animFrame = 0;
        this.animTimer = 0;
        this.framesPerRow = [ 4, 4, 5, 7, 10 ];
        this.vx = 0;
        this.facing = -1;
        this.rage = 0;
        this.eatTriggered = false;
        this.visualOnly = false;
        this.opacity = 1;
    }
    startChase(fromX, stalking) {
        this.active = true;
        this.x = fromX;
        this.state = stalking ? "stalk" : "hunt";
        this.animRow = 1;
        this.animFrame = 0;
        this.animTimer = 0;
        this.rage = 0;
        this.eatTriggered = false;
        this.wriggleT = 0;
    }
    startLimbo(fromX) {
        this.active = true;
        this.x = fromX;
        this.state = "limbo";
        this.animRow = 1;
        this.animFrame = 0;
        this.animTimer = 0;
        this.rage = 0;
        this.eatTriggered = false;
        this.wriggleT = 0;
    }
    vanish() {
        this.active = false;
        this.state = "hidden";
    }
    update(player) {
        this.y = game.platforms[0].y - this.h * 1.5;
        if (!this.active) return;
        this.animTimer++;
        const interval = this.state === "eating" ? 9 : this.animRow === 1 ? 5 : 6;
        if (this.animTimer >= interval) {
            this.animTimer = 0;
            this.animFrame++;
            if (this.animFrame >= this.framesPerRow[this.animRow]) {
                if (this.state === "eating") this.animFrame = this.framesPerRow[4] - 1; else this.animFrame = 0;
            }
            if (this.state === "eating" && !this.eatTriggered && this.animFrame === 7) {
                this.eatTriggered = true;
                playSFX("sfx_demon_chomp");
                createExplosion(player.x + player.w / 2, player.y + player.h / 2, "#aa0000", 90, 50);
                applyShake(30);
                if (player) player.eaten = true;
                setTimeout(() => {
                    getBlackoutDiv().style.opacity = 1;
                    gameState = "ending";
                    game.endingTimer = 0;
                    game.endingStep = 0;
                    bfShow = true;
                    bfTargetX = VIEW_W / 2;
                    bfTargetY = VIEW_H / 2;
                }, 1e3);
            }
        }
        if (this.state === "stalk") {
            this.animRow = 1;
            this.facing = -1;
            const parado = Math.abs(player.vx) < .5;
            if (parado) {
                this.rage += .08;
                this.vx = -(2.5 + this.rage);
            } else {
                this.vx = -Math.abs(player.vx) * .95;
            }
            this.x += this.vx;
            if (this.x < player.x + player.w + 130) this.x = player.x + player.w + 130;
        } else if (this.state === "limbo") {
            if (this.wriggleT > 0) {
                this.animRow = 2;
                this.wriggleT--;
                if (this.wriggleT === 0) {
                    this.animRow = 1;
                    this.animFrame = 0;
                    this.x = player.x + (Math.random() < .5 ? -750 : 750);
                    playSound(90, .5, "sawtooth", .2, 50);
                }
            } else {
                this.animRow = 1;
                this.facing = player.x > this.x ? 1 : -1;
                this.x += Math.sign(player.x - this.x) * 1.3;
                if (Math.abs(player.vx) < .5) {
                    this.wriggleT = 60;
                    playSound(120, .8, "sawtooth", .25, 60);
                }
            }
        } else if (this.state === "hunt") {
            this.animRow = 1;
            this.rage += .002;
            this.vx = Math.max(4.2, Math.abs(player.vx) + .5) + this.rage;
            this.facing = 1;
            this.x += this.vx;
            if (this.x + this.w * .6 > player.x && this.x < player.x + player.w && !player.frozen) {
                this.state = "eating";
                this.animRow = 4;
                this.animFrame = 0;
                this.animTimer = 0;
                this.eatTriggered = false;
                player.frozen = true;
                this.facing = -1;
                this.x = player.x - this.w * .35;
                playSound(80, .8, "sawtooth", .4, 40);
                applyShake(20);
            }
        }
    }
    draw(ctx, offsetX) {
        if (!this.active || this.state === "hidden" || !demonSprite.complete || !demonSprite.naturalWidth) return;
        const dw = this.w * 1.5, dh = this.h * 1.5;
        const sx = this.x - offsetX;
        const vw = typeof VIEW_W !== "undefined" ? VIEW_W : 1024;
        if (sx + dw < -150 || sx > vw + 150) return;
        const frameW = demonSprite.width / 10;
        const frameH = demonSprite.height / 5;
        ctx.save();
        ctx.globalAlpha = (this.visualOnly ? .4 : 1) * this.opacity;
        if (this.facing === 1) {
            ctx.translate(this.x - offsetX + dw, this.y);
            ctx.scale(-1, 1);
            ctx.drawImage(demonSprite, this.animFrame * frameW, this.animRow * frameH, frameW, frameH, 0, 0, dw, dh);
        } else {
            ctx.translate(this.x - offsetX, this.y);
            ctx.drawImage(demonSprite, this.animFrame * frameW, this.animRow * frameH, frameW, frameH, 0, 0, dw, dh);
        }
        ctx.restore();
    }
}

window.triggerSubCaveFall = function() {
    if (typeof game === "undefined" || game.subCaveTransitioning) return;
    game.subCaveTransitioning = true;
    if (game.player) {
        game.player.frozen = true;
        game.player.vx = 0;
        if (typeof game.player.dashTimer === "number") game.player.dashTimer = 0;
    }
    const bo = typeof window.getBlackoutDiv === "function" ? window.getBlackoutDiv() : document.getElementById("blackout");
    if (bo) {
        bo.style.transition = "opacity 0.35s ease";
        bo.style.opacity = "1";
    }
    try {
        playSound(140, .45, "sawtooth", .4, 40);
    } catch (e) {}
    setTimeout(() => {
        game.subCaveMode = true;
        game.caveStalactiteHitCount = 0;
        try {
            if (typeof gsap !== "undefined") gsap.killTweensOf(game);
        } catch (e) {}
        delete game.cameraOverrideX;
        delete game.cameraOverrideY;
        game.camY = 0;
        if (typeof playBGM === "function") playBGM("bgm_world1_cave");
        if (typeof currentLevel !== "undefined") {
            currentCheckpoint = {
                level: currentLevel,
                x: 28150,
                y: 440
            };
        }
        if (game.player) {
            game.player.x = 28150;
            game.player.y = 200;
            game.player.vx = 2;
            game.player.vy = 5;
            game.player.frozen = false;
        }
        const targetCamX = 28e3;
        if (typeof cameraX !== "undefined") cameraX = targetCamX;
        if (typeof addFloatingText === "function") {
            addFloatingText(28150, 200, typeof __ === "function" ? __("flt_cave_secret") : "¡CAVERNA SECRETA!", "#f59e0b", 24);
        }
        if (bo) {
            setTimeout(() => {
                bo.style.opacity = "0";
                game.subCaveTransitioning = false;
            }, 60);
        } else {
            game.subCaveTransitioning = false;
        }
    }, 360);
};

window.applyElectricShock = function(player, frames = 30) {
    if (!player) return;
    player.electricShockTimer = Math.max(player.electricShockTimer || 0, frames);
    player.vx = 0;
    try {
        if (typeof playSound === "function") {
            playSound(110, 0.4, "sawtooth", 0.5, 30);
            playSound(880, 0.25, "square", 0.3, 180);
        }
    } catch(e) {}
    try {
        if (typeof applyShake === "function") applyShake(12);
    } catch(e) {}
    if (typeof particles !== "undefined" && Array.isArray(particles)) {
        for (let i = 0; i < 14; i++) {
            particles.push({
                x: player.x + Math.random() * player.w,
                y: player.y + Math.random() * player.h,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 18,
                color: Math.random() < 0.5 ? "#00f0ff" : "#fde047",
                size: 3.5,
                type: "spark"
            });
        }
    }
};
