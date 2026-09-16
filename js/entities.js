const demonSprite = new Image;

demonSprite.src = "assets/sprites/demonio_2.webp";

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
    }
    update(keys, platforms) {
        if (this.paralyzeTimer > 0) {
            this.paralyzeTimer--;
            this.vx *= .82;
            this.vy += GRAVITY;
            this.y += this.vy;
            if (platforms && Array.isArray(platforms)) {
                for (let plat of platforms) {
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
                if (this.vx > 0) this.vx -= .28; else this.vx -= .35;
                if (this.vx < -MOVE_SPEED * 1.15) this.vx = -MOVE_SPEED * 1.15;
                this.facing = -1;
                moving = true;
            } else if (keys["ArrowRight"] || keys["d"]) {
                if (this.vx < 0) this.vx += .28; else this.vx += .35;
                if (this.vx > MOVE_SPEED * 1.15) this.vx = MOVE_SPEED * 1.15;
                this.facing = 1;
                moving = true;
            } else {
                this.vx *= .988;
                if (Math.abs(this.vx) < .08) this.vx = 0;
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
        const wantDash = currentLevel !== 4 && (!game || !game.inHunt) && (keys["c"] || keys["C"] || this.dashBufferTimer > 0);
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
                this.dashColor = "#ff0055";
                this._dashHitBump++;
                this.charging = false;
                this.chargeLevel = 0;
                this.chargeTimer = 0;
                try {
                    applyShake(6);
                } catch (e) {}
                try {
                    game.flash = Math.max(game.flash, 14);
                } catch (e) {}
                try {
                    if (typeof window.triggerHaptic === "function") window.triggerHaptic("heavy");
                    if (typeof window.triggerGamepadRumble === "function") window.triggerGamepadRumble(160, 0.8, 0.7);
                } catch (e) {}
                try {
                    playSound(180, .35, "sawtooth", .4, 1200);
                } catch (e) {}
                try {
                    playSFX("sfx_energy_dash");
                } catch (e) {}
                try {
                    addFloatingText(this.x + this.w / 2, this.y - 10, "⚡ ENERGY DASH ⚡", "#ff00e0", 28);
                } catch (e) {}
                try {
                    createExplosion(this.x + this.w / 2, this.y + this.h / 2, "#ff0055", 26, 18, [ "#ff0055", "#00ffff", "#ffffff" ]);
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
                try {
                    if (typeof window.triggerHaptic === "function") window.triggerHaptic("dash");
                    if (typeof window.triggerGamepadRumble === "function") window.triggerGamepadRumble(80, 0.3, 0.4);
                } catch (e) {}
                try {
                    playSound(500, .15, "sine", .22, 900);
                } catch (e) {}
                try {
                    addFloatingText(this.x + this.w / 2, this.y, "💨", "#9be7ff", 16);
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
                        createExplosion(cx, cy, "#ff00e0", 50, 38, [ "#ff00e0", "#00ffff", "#ffffff", "#ffd700" ]);
                        if (typeof particles !== "undefined" && Array.isArray(particles)) {
                            for (let i = 0; i < 28; i++) {
                                const ang = Math.random() * Math.PI * 2;
                                const spd = 4.5 + Math.random() * 8.5;
                                particles.push({
                                    x: cx,
                                    y: cy,
                                    vx: Math.cos(ang) * spd,
                                    vy: Math.sin(ang) * spd,
                                    life: 14 + Math.random() * 10,
                                    maxLife: 24,
                                    color: [ "#ff00e0", "#00ffff", "#ffffff", "#ffd700" ][Math.floor(Math.random() * 4)],
                                    size: 2.5 + Math.random() * 3.5,
                                    type: "spark"
                                });
                            }
                        }
                        try {
                            applyShake(8);
                        } catch (e) {}
                        try {
                            playSound(680, .22, "sawtooth", .4, 180);
                        } catch (e) {}
                        try {
                            addFloatingText(cx, cy - 20, "⚡ BOOM! ⚡", "#00ffff", 24);
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
                    particles.push({
                        x: cx - this.dashDir * 10,
                        y: cy,
                        vx: -this.dashDir * 1.5,
                        vy: (Math.random() - .5) * 1.5,
                        life: 16,
                        maxLife: 16,
                        color: [ "#ff00e0", "#00ffff", "#ffd700" ][Math.floor(Math.random() * 3)],
                        size: Math.max(this.w, this.h) * .55,
                        glow: 20,
                        type: "afterimage"
                    });
                    if (this.dashTimer % 3 === 0) {
                        particles.push({
                            x: cx,
                            y: cy,
                            radius: 8,
                            maxRadius: 36,
                            life: 14,
                            maxLife: 14,
                            color: "#00ffff",
                            glow: 15,
                            lineWidth: 2.5,
                            type: "ring"
                        });
                    }
                    for (let i = 0; i < 4; i++) {
                        const ang = Math.random() * Math.PI * 2;
                        const spd = 2 + Math.random() * 5;
                        particles.push({
                            x: this.x + this.w / 2 + (Math.random() - .5) * this.w,
                            y: this.y + Math.random() * this.h,
                            vx: -this.dashDir * (3 + Math.random() * 3) + Math.cos(ang) * spd,
                            vy: (Math.random() - .5) * 4 + Math.sin(ang) * spd,
                            life: 10 + Math.random() * 8,
                            color: [ "#ff00e0", "#00ffff", "#ffffff", "#ffd700" ][Math.floor(Math.random() * 4)],
                            size: 2.5 + Math.random() * 3,
                            glow: 12,
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
        const hasInput = moving || wantDash || this.charging || (keys["x"] || keys["X"] || keys["k"]) || (keys["z"] || keys["Z"] || keys[" "] || keys["w"] || keys["W"]) || !this.onGround;
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
        if ((!game || !game.inHunt) && (keys[" "] || keys["w"] || keys["W"])) {
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
            this._jumpHeldAtStart = !!(keys[" "] || keys["z"] || keys["Z"] || keys["w"] || keys["W"]);
            let stormJumpMult = 1;
            if (currentLevel === 3 && game.stormMode && typeof window.getStormWind === "function") {
                const wind = window.getStormWind();
                if (wind.dir === "UP") stormJumpMult = 1.42; else if (wind.dir === "DOWN") stormJumpMult = .58;
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
        const charging = (!game || !game.inHunt) && (keys["x"] || keys["X"] || keys["k"]) && (currentLevel < 4 || currentLevel === 6 || currentLevel === "hub") && !this.frozen;
        const jumpHeld = keys[" "] || keys["w"] || keys["W"];
        if (!charging && this._jumpHeldAtStart && this._bounceGuard <= 0 && !jumpHeld && this.vy < -4) {
            this.vy *= .6;
        }
        this.scaleX += (1 - this.scaleX) * .15;
        this.scaleY += (1 - this.scaleY) * .15;
        if ((!game || !game.inHunt) && (keys["x"] || keys["X"] || keys["k"]) && (currentLevel < 4 || currentLevel === 6 || currentLevel === "hub") && !this.frozen) {
            if (!this.charging) {
                this.charging = true;
                this.chargeTimer = 0;
                this.chargeLevel = 0;
            } else {
                this.chargeTimer++;
                let prevLevel = this.chargeLevel;
                if (this.chargeTimer >= 110) this.chargeLevel = 4; else if (this.chargeTimer >= 75) this.chargeLevel = 3; else if (this.chargeTimer >= 45) this.chargeLevel = 2; else if (this.chargeTimer >= 20) this.chargeLevel = 1;
                if (this.chargeLevel > prevLevel) {
                    applyShake(3 + this.chargeLevel * 2);
                    game.flash = Math.max(game.flash, 6 + this.chargeLevel * 4);
                    const pitch = 450 + this.chargeLevel * 220;
                    playSound(pitch, .18, "sine", .25, pitch + 250);
                    const label = this.chargeLevel === 4 ? __("flt_carga_max") : __("flt_carga_level", this.chargeLevel);
                    const color = [ "#ffffff", "#66ccff", "#00ffff", "#ffea00", "#ff0055" ][this.chargeLevel];
                    addFloatingText(this.x + this.w / 2, this.y - 20, label, color, 16 + this.chargeLevel * 2);
                }
                if (this.chargeLevel > 0 && this.chargeTimer % 2 === 0) {
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
        if (game.inHunt && (keys["x"] || keys["X"] || keys["k"]) && this.slashCooldown <= 0 && !this.frozen) {
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
            }
        }
        if (this.dashMax && this.dashTimer > 0 && game.enemies) {
            for (let i = 0; i < game.enemies.length; i++) {
                const e = game.enemies[i];
                if (!e.active) continue;
                if (e._dashMark === this._dashHitBump) continue;
                if (this.x + this.w > e.x && this.x < e.x + e.w && this.y + this.h > e.y && this.y < e.y + e.h) {
                    e._dashMark = this._dashHitBump;
                    try {
                        e.takeDamage(__godDmg(95));
                    } catch (err) {}
                    try {
                        if (typeof e.x === "number") e.x += this.dashDir * 12;
                    } catch (err) {}
                    try {
                        createExplosion(e.x + e.w / 2, e.y + e.h / 2, "#ff0055", 14, 9, [ "#ff0055", "#00ffff", "#ffffff" ]);
                        playSound(300, .2, "sawtooth", .25, 150);
                    } catch (err) {}
                }
            }
        }
        if (this.dashMax && this.dashTimer > 0) {
            const dmgBump = this._dashHitBump;
            const markHit = o => {
                if (!o || o._dashMark === dmgBump) return false;
                o._dashMark = dmgBump;
                return true;
            };
            const touch = (ox, oy, ow, oh) => this.x + this.w > ox && this.x < ox + ow && this.y + this.h > oy && this.y < oy + oh;
            try {
                const bs = game.blueSquare;
                if (bs && bs.state === "boss_fight" && touch(bs.x, bs.y, bs.w, bs.h) && markHit(bs)) {
                    bs._dashPendingDmg = (bs._dashPendingDmg || 0) + __godDmg(12);
                }
            } catch (e) {}
            try {
                const ys = game.yellowSquare;
                if (ys && ys.state === "boss_fight" && touch(ys.x, ys.y, ys.w, ys.h) && markHit(ys)) {
                    ys._dashPendingDmg = (ys._dashPendingDmg || 0) + __godDmg(12);
                }
            } catch (e) {}
            try {
                const tb = game.techBoss;
                if (tb && tb.state === "fighting" && tb.vulnerable && tb.turnPhase === "player_turn" && touch(tb.x, tb.y, tb.w, tb.h) && markHit(tb)) {
                    tb._dashPendingDmg = (tb._dashPendingDmg || 0) + __godDmg(16);
                }
            } catch (e) {}
            try {
                if (window.ValkyrieBoss && window.ValkyrieBoss.boss && window.ValkyrieBoss.boss.alive) {
                    const vb = window.ValkyrieBoss.boss;
                    if (touch(vb.x, vb.y, vb.width, vb.height) && markHit(vb)) {
                        vb.takeDamage(__godDmg(24), "normal");
                    }
                }
            } catch (e) {}
            try {
                const kk = game.krakatoa;
                if (kk && kk.state === "stunned" && kk.y < 460 && touch(kk.hitX, kk.hitY, kk.hitW, kk.hitH) && markHit(kk)) {
                    kk.takeDamage(__godDmg(45), 4);
                }
            } catch (e) {}
            try {
                if (window.TurretSystem && Array.isArray(window.TurretSystem.turrets)) {
                    for (const t of window.TurretSystem.turrets) {
                        if (t && t._alive !== false && touch(t.x, t.y, t.width, t.height) && markHit(t)) {
                            t._dashPendingDmg = (t._dashPendingDmg || 0) + __godDmg(95);
                        }
                    }
                }
            } catch (e) {}
        }
        if (platforms) {
            for (let plat of platforms) {
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
                            addFloatingText(plat.x + plat.w / 2, plat.y - 16, "⚡ REQUIERE ENERGY DASH (C + Carga) ⚡", "#ff00a0", 15);
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
            const wallRight = 2220;
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
        if (game.lvl4State !== "falling") {
            for (let plat of platforms) {
                if (plat.broken || plat.dashBlock || plat.isGateObstacle) continue;
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
                        addFloatingText(this.x + this.w / 2, this.y - 18, "💥 " + __("flt_hay_pinchos") + " 💥", "#ff3333", 20);
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
                        addFloatingText(this.x + this.w / 2, this.y - 18, "🔥 ¡QUEMA! ¡QUEMA! 🔥", "#ff3300", 20);
                    }
                    continue;
                }
                if (this.vy >= 0 && this.x + this.w > plat.x && this.x < plat.x + plat.w && this.y + this.h >= plat.y && this.y + this.h <= plat.y + plat.h + this.vy + 8) {
                    this.y = plat.y - this.h;
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
                            this.scaleX = 1.3;
                            this.scaleY = .7;
                            playSound(200, .1, "triangle", .1);
                            if (currentLevel < 4 || currentLevel === 6 || currentLevel === "hub") {
                                for (let i = 0; i < 8; i++) {
                                    particles.push({
                                        x: this.x + this.w / 2 + (Math.random() - .5) * 16,
                                        y: this.y + this.h - 2,
                                        vx: (Math.random() - .5) * 3,
                                        vy: -Math.random() * 1.5,
                                        life: 14,
                                        color: "rgba(255,255,255,0.6)",
                                        size: 3 + Math.random() * 3,
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
                addFloatingText(this.x + this.w / 2, this.y - 15, "🌊 " + __("ui_agua_profunda"), "#38bdf8", 15);
            }
        }
        if (currentLevel === 0 && !game.gate2Open && !game.subCaveMode && !game.subCaveTransitioning) {
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
        if (keys["ArrowUp"] || keys["w"]) {
            dirY = -1;
            dirX = 0;
        } else if (keys["ArrowDown"] || keys["s"]) {
            dirY = 1;
            dirX = 0;
        } else {
            dirX = this.facing;
            dirY = 0;
        }
        const lvl = this.chargeLevel || 0;
        const baseDamage = [ 10, 20, 35, 55, 80 ][lvl];
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
            game.flash = Math.max(game.flash, 8 + lvl * 5);
            playSound(220 + lvl * 160, .25, "sawtooth", .35, 600 + lvl * 180);
            if (lvl >= 4) {
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
        if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
            try {
                navigator.vibrate(130);
            } catch (e) {}
        }
        if (typeof window.triggerGamepadRumble === "function") {
            window.triggerGamepadRumble(180, 0.7, 0.6);
        }
        if (typeof window.onPlayerHurtLithium === "function") {
            window.onPlayerHurtLithium();
        }
        gsap.to(healthFill, {
            width: Math.max(0, this.health / PLAYER_MAX_HEALTH * 100) + "%",
            duration: .3
        });
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
        if (this.hidden || this.eaten) return;
        ctx.globalAlpha = this.alpha != null ? this.alpha : 1;
        if (this.lavaBounceTimer <= 0 && this.invulnerable > 0 && Math.floor(this.invulnerable / 4) % 2 === 0) return;
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
            this.w = 40;
            this.h = 40;
            this.health = cfg.health || 80;
            this.maxHealth = this.health;
            this.bulletType = "electric";
            this.shoot = true;
            this.shootInterval = cfg.shootInterval || 120;
            this.shootTimer = Math.floor(Math.random() * 50);
            this._originY = cfg.y;
        } else if (this.type === "ink_octopus") {
            this.w = 42;
            this.h = 42;
            this.health = cfg.health || 85;
            this.maxHealth = this.health;
            this.bulletType = "ink";
            this.shoot = true;
            this.shootInterval = cfg.shootInterval || 135;
            this.shootTimer = Math.floor(Math.random() * 60);
            this._originY = cfg.y;
        } else if (this.type === "electric_squid") {
            this.w = 42;
            this.h = 46;
            this.health = cfg.health || 40;
            this.maxHealth = this.health;
            this.bulletType = "electric";
            this.shoot = true;
            this.shootInterval = cfg.shootInterval || 110;
            this.shootTimer = Math.floor(Math.random() * 50);
            this._originY = cfg.y;
            this.isElectricSquid = true;
        } else if (this.type === "pumpkin") {
            this.w = 38;
            this.h = 36;
            this.health = cfg.health || 65;
            this.maxHealth = this.health;
            this.color = "#ea580c";
            this.bulletType = "halloween_fire";
            this.shoot = true;
            this.shootInterval = cfg.shootInterval || 120;
            this.shootTimer = Math.floor(Math.random() * 60);
            this.speed = cfg.speed || 1.1;
            this.range = cfg.range || 120;
        } else if (this.type === "crow") {
            this.w = 34;
            this.h = 28;
            this.health = cfg.health || 35;
            this.maxHealth = this.health;
            this.color = "#0f0a1c";
            this.speed = cfg.speed || 2.4;
            this.originY = cfg.y;
            this.diveState = "perched";
            this.diveTimer = 0;
            this.shoot = false;
        } else if (this.type === "witch") {
            this.w = 44;
            this.h = 44;
            this.health = cfg.health || 80;
            this.maxHealth = this.health;
            this.color = "#581c87";
            this.bulletType = "paralyze_diamond";
            this.shoot = true;
            this.shootInterval = cfg.shootInterval || 140;
            this.shootTimer = 40 + Math.floor(Math.random() * 50);
            this.originY = cfg.y;
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
            this.w = 38;
            this.h = 42;
            this.health = cfg.health || 60;
            this.maxHealth = this.health;
            this.color = "#c084fc";
            this.originY = cfg.y;
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
            this.shootTimer = Math.floor(Math.random() * 50);
            this.speed = 0;
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
            this.health = cfg.health || 95;
            this.maxHealth = this.health;
            this.bulletType = "frost_breath";
            this.shoot = true;
            this.shootInterval = cfg.shootInterval || 140;
            this.shootTimer = 35 + Math.floor(Math.random() * 45);
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
        if (currentLevel === 0 && !game.iceMode && (this.type === "snowman_blower" || this.type === "snowman_slammer" || this.type === "snowball_head" || this.type === "ice_orb" || this.type === "giant_snowman" || this.type === "mega_snowman")) {
            return;
        }
        this.blinkTimer = (this.blinkTimer || 0) + 1;
        if (this.blinkTimer > 170 + Math.sin(time) * 40) {
            this.blinkTimer = -12;
        }
        if ((this.mouthOpenTimer || 0) > 0) {
            this.mouthOpenTimer--;
        }
        this.scaleX += (1 - this.scaleX) * .12;
        this.scaleY += (1 - this.scaleY) * .12;
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
                if (p && p.invulnerable <= 0) {
                    const numBalls = this.numBalls || 4;
                    const arms = 4;
                    const spacing = 32;
                    const cx = this.x + this.w / 2;
                    const cy = this.y + this.h / 2;
                    for (let a = 0; a < arms; a++) {
                        const angle = this.patrolAngle + Math.PI / 2 * a;
                        for (let b = 1; b <= numBalls; b++) {
                            const bx = cx + Math.cos(angle) * b * spacing;
                            const by = cy + Math.sin(angle) * b * spacing;
                            if (bx > p.x && bx < p.x + p.w && by > p.y && by < p.y + p.h) {
                                p.takeDamage(26);
                                break;
                            }
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
            if (this._originY === undefined) this._originY = this.y;
            this.x = this.originX + Math.sin(this.patrolAngle) * ampX;
            this.y = this._originY + Math.sin(this.patrolAngle * 2) * ampY;
            this.facing = Math.cos(this.patrolAngle) > 0 ? 1 : -1;
            if (this.shoot && enemyIsNearCamera(this)) {
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
            if (this._originY === undefined) this._originY = this.y;
            this.patrolAngle = (this.patrolAngle || 0) + .04;
            this.y = this._originY + Math.sin(this.patrolAngle) * 14;
            this.x = this.originX + Math.sin(this.patrolAngle * .5) * (this.range > 0 ? this.range : 50);
            const p = game.player;
            if (p) this.facing = p.x + p.w / 2 < this.x + this.w / 2 ? -1 : 1;
            if (this.shoot && enemyIsNearCamera(this)) {
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
            if (this._originY === undefined) this._originY = this.y;
            if (this.originX === undefined) this.originX = this.x;
            this.patrolAngle = (this.patrolAngle || 0) + .05;
            this.y = this._originY + Math.sin(this.patrolAngle) * 22;
            if (this.vx) {
                this.x += this.vx;
            } else {
                this.x = this.originX + Math.sin(this.patrolAngle * .4) * (this.range > 0 ? this.range : 45);
            }
            const p = game.player;
            if (p) this.facing = p.x + p.w / 2 < this.x + this.w / 2 ? -1 : 1;
            if (this.shoot && enemyIsNearCamera(this)) {
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
            if (this._originY === undefined) this._originY = this.y;
            this.patrolAngle += .038;
            this.y = this._originY + Math.sin(this.patrolAngle) * 18;
            this.x = this.originX + Math.sin(this.patrolAngle * .4) * (this.range > 0 ? this.range : 45);
            const p = game.player;
            if (p) this.facing = p.x + p.w / 2 < this.x + this.w / 2 ? -1 : 1;
            if (this.shoot && enemyIsNearCamera(this)) {
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
                this.y = this.originY + Math.sin(time * .05 + this.hoverOffset) * 4;
                if (p && nearCam) {
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
                this.x += this.vx;
                this.y += this.vy;
                this.diveTimer++;
                const p = game.player;
                if (this.diveTimer > 35 || p && this.y >= p.y + 15 || this.y > VIEW_H - 100) {
                    this.diveState = "climbing";
                }
            } else if (this.diveState === "climbing") {
                this.x += this.vx * .6;
                this.vy = -3.5;
                this.y += this.vy;
                if (this.y <= (this.originY || 200)) {
                    this.y = this.originY || 200;
                    this.diveState = "perched";
                }
            }
            return;
        }
        if (this.type === "witch") {
            if (this.originY === undefined) this.originY = this.y;
            this.patrolAngle = (this.patrolAngle || 0) + .035;
            this.y = this.originY + Math.sin(this.patrolAngle) * 20;
            this.x += (this.direction || 1) * (this.speed || 1.6);
            if (Math.abs(this.x - this.originX) > (this.range || 160)) {
                this.direction *= -1;
            }
            const p = game.player;
            if (p) this.facing = p.x + p.w / 2 < this.x + this.w / 2 ? -1 : 1;
            if (enemyIsNearCamera(this)) {
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
                this.y = this.originY + Math.sin(this.patrolAngle) * 16;
                this.x = this.originX + Math.sin(this.patrolAngle * .6) * (this.range || 60);
                if (p) this.facing = p.x + p.w / 2 < this.x + this.w / 2 ? -1 : 1;
                this.ghostTimer--;
                if (this.ghostTimer === 30 && nearCam) {
                    try {
                        playSound(480, .25, "sawtooth", .2, 180);
                        addFloatingText(this.x + this.w / 2, this.y - 18, __("flt_ghost_dash") || "⚡ ¡EMBESTIDA!", "#f87171", 17);
                    } catch (e) {}
                }
                if (this.ghostTimer <= 0 && nearCam && p && !p.dead) {
                    this.ghostState = "dashing";
                    this.dashDir = p.x + p.w / 2 < this.x + this.w / 2 ? -1 : 1;
                    this.facing = this.dashDir;
                    this.dashSpeed = 9.5;
                    this.dashDuration = 32;
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
                        this.x += this.speed * this.direction;
                        if (this.x > this.originX + this.range) this.direction = -1; else if (this.x < this.originX - this.range) this.direction = 1;
                        this.facing = this.direction;
                    }
                }
            } else {
                if (this.range > 0 && this.speed > 0) {
                    this.x += this.speed * this.direction;
                    if (this.x > this.originX + this.range) this.direction = -1; else if (this.x < this.originX - this.range) this.direction = 1;
                    this.facing = this.direction;
                }
            }
        } else {
            if (this.range > 0 && this.speed > 0) {
                this.x += this.speed * this.direction;
                if (this.x > this.originX + this.range) this.direction = -1; else if (this.x < this.originX - this.range) this.direction = 1;
                this.facing = this.direction;
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
            if (this.jumpTimer <= 0 && this.onGround) {
                this.jumpTimer = this.jumpInterval;
                this.vy = -11;
                this.onGround = false;
                this.scaleX = .8;
                this.scaleY = 1.2;
                if (currentLevel < 3) {
                    for (let i = 0; i < 4; i++) {
                        particles.push({
                            x: this.x + this.w / 2 + (Math.random() - .5) * 10,
                            y: this.y + this.h,
                            vx: (Math.random() - .5) * 2,
                            vy: -Math.random() * 3,
                            life: 12,
                            color: "#aaa",
                            size: 2 + Math.random() * 3,
                            type: "spark"
                        });
                    }
                }
            }
        }
        this.scaleX += (1 - this.scaleX) * .15;
        this.scaleY += (1 - this.scaleY) * .15;
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
                        this.scaleX = 1.2;
                        this.scaleY = .8;
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
        const isFacingPlayer = this.facing === playerDir;
        let bType = this.bulletType;
        if (!bType) {
            if (this.type === "electric" || currentLevel === 1 && (this.color === "#00bcd4" || this.color === "#00ffee" || this.color === "#00ffcc")) {
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
            const speed = 4.5;
            enemyProjectiles.push({
                x: px,
                y: py,
                w: 16,
                h: 16,
                radius: 8,
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
        const speed = 5.8;
        enemyProjectiles.push({
            x: px,
            y: py,
            w: 12,
            h: 12,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: this.color || "#ff4444",
            damage: 12,
            isFireball: false,
            trail: []
        });
        playSound(380, .1, "triangle", .08, 180);
    }
    takeDamage(amount) {
        if (!this.active || this.isObstacle) return;
        if (game.godMode) amount = 999;
        if (this.hasShield && this.shieldActive && this.shieldHp > 0) {
            this.shieldHp -= amount;
            this.shieldHitFlash = 10;
            playSound(680, .12, "sawtooth", .18, 920);
            addFloatingText(this.x + this.w / 2, this.y - 15, `🛡️ -${amount}`, "#00f0ff", 15);
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
                addFloatingText(this.x + this.w / 2, this.y - 30, "💥 ¡ESCUDO ROTO!", "#ff0055", 22);
                addFloatingText(this.x + this.w / 2, this.y - 52, "⚡ ¡FURIOSO!", "#ffea00", 18);
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
        this.mouthOpenTimer = 18;
        this.scaleX = .8;
        this.scaleY = 1.3;
        addFloatingText(this.x + this.w / 2, this.y - 10, "-" + amount, "#ff4444", 14);
        createExplosion(this.x + this.w / 2, this.y + this.h / 2, "#fff", 5, 3);
        if (this.type === "mega_snowman") {
            const pDir = game.player ? game.player.x + game.player.w / 2 < this.x + this.w / 2 ? -1 : 1 : this.facing || 1;
            if (this.health > 0 && this.health <= this.maxHealth * .66 && this.snowmanBalls === 3) {
                this.snowmanBalls = 2;
                createExplosion(this.x + this.w / 2, this.y + this.h - 35, "#ffffff", 42, 26, [ "#ffffff", "#bae6fd", "#38bdf8" ]);
                applyShake(7);
                playSound(130, .35, "sawtooth", .28, 45);
                addFloatingText(this.x + this.w / 2, this.y - 25, "❄️ ¡BOLA INFERIOR!", "#38bdf8", 18);
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
                addFloatingText(this.x + this.w / 2, this.y - 25, "❄️ ¡BOLA MEDIA!", "#38bdf8", 18);
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
                addFloatingText(this.x + this.w / 2, this.y - 30, "⛄ ¡CABEZA RODANTE!", "#38bdf8", 20);
            }
            if (typeof window.onHalloweenEnemyDied === "function") {
                try {
                    window.onHalloweenEnemyDied(this);
                } catch (e) {}
            }
            playSound(150, .3, "square", .2, 50);
            const isMiniboss = this.type === "miniboss";
            const expSize = isMiniboss ? 60 : 30;
            const expCount = isMiniboss ? 40 : 15;
            createExplosion(this.x + this.w / 2, this.y + this.h / 2, this.color, expSize, expCount, [ "#ffff00", "#ff0000", "#ffffff" ]);
            if (isMiniboss) {
                applyShake(20);
                playSound(80, .8, "sawtooth", .5, 30);
            }
            if (currentLevel < 4 || currentLevel === 6 || currentLevel === "hub") {
                const pts = isMiniboss ? 500 : 50;
                score += pts;
                updateScore(score);
                addFloatingText(this.x + this.w / 2, this.y - 20, "+" + pts + " " + __("ui_pts"), "#ffd700", isMiniboss ? 22 : 16);

            }
        } else {
            playSound(500, .1, "square", .1);
        }
    }
    draw(ctx, offsetX) {
        if (!this.active) return;
        const hover = this.onGround ? 0 : Math.sin(time * .1 + this.hoverOffset) * 2;
        const tremble = game.sadEnemies ? (Math.random() - .5) * 3 : this.enraged ? (Math.random() - .5) * 4 : 0;
        if (game.inHunt || game.sadEnemies || this === game.huntEnemy || currentLevel === 4 && game.happyMode) {
            if (typeof window.drawNightmareFriend === "function") {
                window.drawNightmareFriend(ctx, this, offsetX, time);
            } else {
                drawEntityBase(ctx, this.x - offsetX + tremble, this.y + hover, this.w, this.h, this.scaleX, this.scaleY, this.color, false, this.facing, false);
            }
            return;
        }
        if (currentLevel < 4 || currentLevel === 6 || currentLevel === "hub") {
            drawEnemyEnhanced(ctx, this.x - offsetX + tremble, this.y + hover, this.w, this.h, this.color, this.facing, this.scaleX, this.scaleY, this.health, this.maxHealth, this.type, this.mouthOpenTimer || 0, this.blinkTimer || 0, this.isOnFire || game.fireMode, this);
        } else {
            drawEntityBase(ctx, this.x - offsetX + tremble, this.y + hover, this.w, this.h, this.scaleX, this.scaleY, this.color, false, this.facing, false);
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
        this.hammerDrop = cfg.hammerDrop !== undefined ? cfg.hammerDrop : 220;
        const baseHammerSpeed = cfg.hammerSpeed !== undefined ? cfg.hammerSpeed : .04;
        this.hammerSpeed = this.isArenaGate || baseHammerSpeed <= 0 ? 0 : baseHammerSpeed * 2.2;
        this.hammerPhase = cfg.hammerPhase || Math.random() * Math.PI * 2;
        this.button = cfg.button || false;
        this.isGateButton = cfg.isGateButton || null;
        this.buttonColor = cfg.buttonColor || null;
        this.isGateObstacle = cfg.isGateObstacle || null;
        this.isGateBridge = cfg.isGateBridge || null;
        this.isMarioPipe = cfg.isMarioPipe || null;
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
            addFloatingText(cx, this.y - 56, "+300 " + __("ui_pts"), "#ffd700", 18);
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
            if (this.isArenaGate || this.hammerSpeed <= 0 && this.hammerDrop <= 0) {
                if (game.player && this.y > this.originY + 30) {
                    const pp = game.player;
                    const dentroX = pp.x + pp.w > this.x && pp.x < this.x + this.w;
                    const dentroY = pp.y + pp.h > this.y && pp.y < this.y + this.h;
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
                        if (p.y + p.h > Math.min(0, this.y) && p.y < this.y + this.h) {
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
                        if (dropProgress > .6 && !p.frozen && p.invulnerable <= 0) {
                            if (p.x + p.w > this.x && p.x < this.x + this.w && p.y + p.h >= this.y && p.y <= this.y + this.h + 12) {
                                p.takeDamage(30);
                                if (p.dashTimer > 0) p.dashTimer = 0;
                                if (p.x + p.w / 2 < this.x + this.w / 2) {
                                    p.x = this.x - p.w - 12;
                                    p.vx = -8;
                                } else {
                                    p.x = this.x + this.w + 12;
                                    p.vx = 8;
                                }
                                p.vy = 4;
                                createExplosion(p.x + p.w / 2, p.y + p.h / 2, "#ff3300", 25, 15);
                                addFloatingText(p.x + p.w / 2, p.y - 15, __("flt_aplastado") || "¡APLASTADO!", "#ff0033", 18);
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
                            addFloatingText(this.x + this.w / 2, this.y - 25, typeof __ === "function" ? __("flt_gate1_opened") : "✨ ¡PORTÓN RÚNICO ABIERTO!", "#10b981", 22);
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
                            addFloatingText(this.x + this.w / 2, this.y - 25, typeof __ === "function" ? __("flt_gate2_opened") : "☀️ ¡PUERTA SOLAR ELEVADA!", "#f59e0b", 22);
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
        if (this.isStalactite && !this.stalacLanded) {
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
                    if (game.player && game.player.x + game.player.w > this.x && game.player.x < this.x + this.w && game.player.y + game.player.h > this.y && game.player.y < this.y + this.h) {
                        if (typeof game.player.takeDamage === "function") {
                            game.player.takeDamage(5);
                        }
                    }
                    if (this.y >= 430) {
                        this.y = 430;
                        this.stalacLanded = true;
                        if (typeof applyShake === "function") applyShake(7);
                        try {
                            playSound(110, .35, "square", .25, 45);
                        } catch (e) {}
                        if (typeof particles !== "undefined") {
                            for (let i = 0; i < 20; i++) {
                                particles.push({
                                    x: this.x + this.w / 2 + (Math.random() - .5) * 40,
                                    y: this.y + this.h,
                                    vx: (Math.random() - .5) * 7,
                                    vy: -Math.random() * 6 - 1,
                                    life: 25,
                                    color: "#78716c",
                                    size: 4,
                                    type: "spark"
                                });
                            }
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
        if (this.broken) return;
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
                ctx.fillText("ENERGY", cx, cy - 16);
                ctx.fillText("DASH", cx, cy + 16);
                if (need > 1) {
                    ctx.fillText(hits + "/" + need, cx, cy + 30);
                }
            } else {
                ctx.fillText("DASH", cx, cy + 12);
            }
            ctx.restore();
            return;
        }
        if (this.hammer) {
            ctx.save();
            ctx.fillStyle = "#334155";
            ctx.fillRect(px + this.w / 2 - 8, -offsetX * 0, 16, this.y);
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 2;
            ctx.strokeRect(px + this.w / 2 - 8, 0, 16, this.y);
            ctx.fillStyle = "#0f172a";
            ctx.shadowColor = "#ef4444";
            ctx.shadowBlur = 10;
            ctx.fillRect(px, this.y, this.w, this.h);
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 3;
            ctx.strokeRect(px, this.y, this.w, this.h);
            ctx.fillStyle = "#f87171";
            for (let t = px; t < px + this.w; t += 12) {
                ctx.beginPath();
                ctx.moveTo(t, this.y + this.h);
                ctx.lineTo(t + 6, this.y + this.h + 8);
                ctx.lineTo(t + 12, this.y + this.h);
                ctx.fill();
            }
            ctx.fillStyle = "#ff0000";
            ctx.shadowColor = "#ff0000";
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(px + this.w / 2, this.y + this.h / 2, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();
            return;
        }
        if (this.spikes && (currentLevel < 4 || currentLevel === 6 || currentLevel === "hub")) {
            ctx.fillStyle = "#cc0000";
            ctx.shadowColor = "#ff0000";
            ctx.shadowBlur = 4;
            for (let sx = px; sx < px + this.w; sx += 16) {
                ctx.beginPath();
                ctx.moveTo(sx, this.y + this.h);
                ctx.lineTo(sx + 8, this.y);
                ctx.lineTo(sx + 16, this.y + this.h);
                ctx.fill();
            }
            ctx.shadowBlur = 0;
            return;
        }
        if (this.lava && (currentLevel < 4 || currentLevel === 6 || currentLevel === "hub")) {
            if (window.postGameHorror) {
                ctx.fillStyle = "#1c0505";
                ctx.fillRect(px, this.y, this.w, this.h);
                ctx.fillStyle = "#450a0a";
                ctx.fillRect(px, this.y, this.w, 4);
                ctx.fillStyle = "#991b1b";
                for (let i = 0; i < this.w; i += 22) {
                    let bubbleY = this.y + 4 + Math.sin(time * .06 + i) * 3;
                    ctx.beginPath();
                    ctx.arc(px + i + 10, bubbleY, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
                return;
            }
            ctx.fillStyle = "#ff4500";
            ctx.fillRect(px, this.y, this.w, this.h);
            ctx.fillStyle = "#ffa500";
            for (let i = 0; i < this.w; i += 20) {
                let bubbleY = this.y + 4 + Math.sin(time * .05 + i) * 4;
                ctx.beginPath();
                ctx.arc(px + i + 10, bubbleY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            return;
        }
        if (this.button) {
            const btnPressed = game.blueSquare && (game.blueSquare.state === "button_pressed" || game.iceMode);
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
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#ffffff";
            ctx.font = 'bold 10px "Courier Prime", monospace';
            ctx.textAlign = "center";
            const label = btnPressed ? "❄ OK ❄" : "❄ BOTÓN ❄";
            ctx.fillText(label, px + this.w / 2, pedY - btnH - 8 + pressOffsetY);
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
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#ffffff";
            ctx.font = 'bold 11px "Courier Prime", monospace';
            ctx.textAlign = "center";
            let label = isPressed ? typeof __ === "function" ? __("ui_btn_activado") : "✨ ACTIVADO ✨" : isGate1 ? typeof __ === "function" ? __("ui_btn_runico") : "🌿 BOTÓN RÚNICO" : typeof __ === "function" ? __("ui_btn_solar") : "☀️ BOTÓN SOLAR";
            ctx.fillText(label, px + this.w / 2, pedY - btnH - 8 + pressOffsetY);
            ctx.restore();
            return;
        }
        if (this.isGateObstacle) {
            const isGate1 = this.isGateObstacle === 1;
            const isOpen = isGate1 ? typeof game !== "undefined" && game.gate1Open : typeof game !== "undefined" && game.gate2Open;
            const themeColor = isGate1 ? "#10b981" : "#f59e0b";
            const darkStone = "#0f172a";
            const midStone = "#1e293b";
            ctx.save();
            ctx.fillStyle = darkStone;
            ctx.fillRect(px, this.y, this.w, this.h);
            ctx.strokeStyle = themeColor;
            ctx.lineWidth = 3;
            ctx.strokeRect(px, this.y, this.w, this.h);
            ctx.strokeStyle = midStone;
            ctx.lineWidth = 2;
            for (let blockY = this.y + 40; blockY < this.y + this.h - 20; blockY += 50) {
                ctx.beginPath();
                ctx.moveTo(px, blockY);
                ctx.lineTo(px + this.w, blockY);
                ctx.stroke();
            }
            const glowPulse = 8 + Math.sin((time || 0) * .08) * 5;
            ctx.shadowColor = themeColor;
            ctx.shadowBlur = glowPulse;
            ctx.strokeStyle = themeColor;
            ctx.lineWidth = 2.5;
            const midY = this.y + Math.min(this.h - 60, 260);
            const midX = px + this.w / 2;
            ctx.beginPath();
            ctx.moveTo(midX, midY - 24);
            ctx.lineTo(midX + 18, midY);
            ctx.lineTo(midX, midY + 24);
            ctx.lineTo(midX - 18, midY);
            ctx.closePath();
            ctx.stroke();
            ctx.fillStyle = isOpen ? "#ffffff" : themeColor;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();
            return;
        }
        if (this.isStalactite) {
            ctx.save();
            let rX = px;
            let rY = this.y;
            if (this.stalacShake > 0) {
                rX += (Math.random() - .5) * 6;
            }
            const pw = this.w;
            const ph = this.h;
            const cx = rX + pw / 2;
            if (this.stalacLanded || this.stalacFalling) {
                ctx.fillStyle = "rgba(0,0,0,0.35)";
                ctx.beginPath();
                ctx.ellipse(cx, 498, pw * .5, 8, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            const rockGrad = ctx.createLinearGradient(rX, rY, rX + pw, rY + ph);
            rockGrad.addColorStop(0, "#57534e");
            rockGrad.addColorStop(.35, "#44403c");
            rockGrad.addColorStop(.7, "#292524");
            rockGrad.addColorStop(1, "#0c0a09");
            ctx.fillStyle = rockGrad;
            ctx.strokeStyle = "#0c0a09";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(rX - 4, rY);
            ctx.lineTo(rX + pw + 4, rY);
            ctx.lineTo(rX + pw + 2, rY + ph * .25);
            ctx.lineTo(rX + pw * .85, rY + ph * .5);
            ctx.lineTo(rX + pw * .65, rY + ph * .75);
            ctx.lineTo(cx, rY + ph);
            ctx.lineTo(rX + pw * .35, rY + ph * .75);
            ctx.lineTo(rX + pw * .15, rY + ph * .5);
            ctx.lineTo(rX - 2, rY + ph * .25);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "rgba(12, 10, 9, 0.45)";
            ctx.beginPath();
            ctx.moveTo(rX - 4, rY);
            ctx.lineTo(cx, rY);
            ctx.lineTo(cx, rY + ph);
            ctx.lineTo(rX + pw * .35, rY + ph * .75);
            ctx.lineTo(rX + pw * .15, rY + ph * .5);
            ctx.lineTo(rX - 2, rY + ph * .25);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#a8a29e";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, rY);
            ctx.lineTo(cx, rY + ph);
            ctx.stroke();
            ctx.strokeStyle = "#78716c";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx, rY + ph * .3);
            ctx.lineTo(rX + pw * .75, rY + ph * .45);
            ctx.moveTo(cx, rY + ph * .6);
            ctx.lineTo(rX + pw * .3, rY + ph * .7);
            ctx.stroke();
            ctx.fillStyle = "#d6d3d1";
            ctx.beginPath();
            ctx.arc(cx, rY + ph - 2, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
        }
        if (this.isMarioPipe) {
            if (this.isMarioPipe === 2 && typeof game !== "undefined" && !game.gate2Open && !game.subCaveMode) {
                ctx.save();
                const arrowX = 7370 - offsetX;
                const bob = Math.sin(Date.now() / 180) * 10;
                const arrowY = 360 + bob;
                ctx.shadowBlur = 18;
                ctx.shadowColor = "#00f0ff";
                const txt = typeof __ === "function" ? __("flt_cavern_arrow") : "⬇ CAVERNA SECRETA ⬇";
                ctx.font = "900 20px system-ui, -apple-system, sans-serif";
                ctx.textAlign = "center";
                ctx.fillStyle = "#00f0ff";
                ctx.fillText(txt, arrowX, arrowY - 36);
                ctx.fillStyle = "#38bdf8";
                ctx.strokeStyle = "#0284c7";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(arrowX - 16, arrowY - 24);
                ctx.lineTo(arrowX + 16, arrowY - 24);
                ctx.lineTo(arrowX + 16, arrowY - 6);
                ctx.lineTo(arrowX + 30, arrowY - 6);
                ctx.lineTo(arrowX, arrowY + 24);
                ctx.lineTo(arrowX - 30, arrowY - 6);
                ctx.lineTo(arrowX - 16, arrowY - 6);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.moveTo(arrowX - 8, arrowY - 20);
                ctx.lineTo(arrowX + 8, arrowY - 20);
                ctx.lineTo(arrowX + 8, arrowY - 8);
                ctx.lineTo(arrowX + 14, arrowY - 8);
                ctx.lineTo(arrowX, arrowY + 10);
                ctx.lineTo(arrowX - 14, arrowY - 8);
                ctx.lineTo(arrowX - 8, arrowY - 8);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
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
        if (window.postGameHorror) {
            ctx.fillStyle = "#262626";
            ctx.fillRect(px, this.y, this.w, this.h);
            ctx.fillStyle = "#e4e4e7";
            ctx.fillRect(px, this.y, this.w, 4.5);
            ctx.fillStyle = "#a1a1aa";
            ctx.fillRect(px, this.y + 4.5, this.w, 2);
            const startX = Math.max(0, px);
            const endX = Math.min(VIEW_W, px + this.w);
            ctx.fillStyle = "#f4f4f5";
            ctx.beginPath();
            for (let ox = startX + 16; ox < endX - 8; ox += 42) {
                ctx.rect(ox - 3, this.y - 2, 6, 3);
            }
            ctx.fill();
            if (this.w >= 24) {
                ctx.strokeStyle = "#09090b";
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                for (let fx = startX + 20; fx < endX - 10; fx += 48) {
                    ctx.moveTo(fx, this.y + 2);
                    ctx.lineTo(fx + 3, this.y + 7);
                    ctx.lineTo(fx + 1, this.y + Math.min(this.h - 1, 15));
                }
                ctx.stroke();
                ctx.fillStyle = "rgba(127, 29, 29, 0.75)";
                ctx.beginPath();
                for (let bx = startX + 36; bx < endX - 12; bx += 64) {
                    ctx.rect(bx - 4, this.y + 2, 7, 3);
                    ctx.rect(bx - 1, this.y + 5, 2, 4);
                }
                ctx.fill();
            }
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
            const soilGrad = ctx.createLinearGradient(px, this.y, px, this.y + this.h);
            soilGrad.addColorStop(0, isNight ? "#2e1c0c" : "#5a381e");
            soilGrad.addColorStop(.35, isNight ? "#1f1005" : "#432612");
            soilGrad.addColorStop(1, isNight ? "#0d0602" : "#271408");
            ctx.fillStyle = soilGrad;
            ctx.beginPath();
            ctx.roundRect(px, this.y, this.w, this.h, [ 4, 4, 3, 3 ]);
            ctx.fill();
            if (this.h > 14) {
                ctx.fillStyle = isNight ? "rgba(80, 55, 35, 0.6)" : "rgba(115, 82, 54, 0.6)";
                const seed = Math.floor(Math.abs(this.x));
                for (let p = 16; p < this.w - 12; p += 32) {
                    const pebbleY = this.y + 10 + (p * 7 + seed) % Math.max(6, this.h - 16);
                    const pebbleSize = 2 + (p + seed) % 3;
                    ctx.beginPath();
                    ctx.arc(px + p, pebbleY, pebbleSize, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.strokeStyle = isNight ? "rgba(40, 22, 10, 0.7)" : "rgba(62, 36, 17, 0.7)";
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                for (let r = 24; r < this.w - 20; r += 44) {
                    const rootX = px + r;
                    const rootLen = 6 + (r + seed) % 8;
                    ctx.moveTo(rootX, this.y + 8);
                    ctx.quadraticCurveTo(rootX + (r % 2 === 0 ? 3 : -3), this.y + 8 + rootLen * .6, rootX + (r % 2 === 0 ? 5 : -4), this.y + 8 + rootLen);
                }
                ctx.stroke();
            }
            const grassThickness = Math.min(9, this.h * .5);
            const grassGrad = ctx.createLinearGradient(px, this.y - 3, px, this.y + grassThickness);
            grassGrad.addColorStop(0, isNight ? "#22c55e" : "#8fe134");
            grassGrad.addColorStop(.6, isNight ? "#15803d" : "#56ad1e");
            grassGrad.addColorStop(1, isNight ? "#052e16" : "#347510");
            ctx.fillStyle = grassGrad;
            ctx.beginPath();
            ctx.roundRect(px, this.y, this.w, grassThickness, [ 4, 4, 0, 0 ]);
            ctx.fill();
            ctx.fillStyle = isNight ? "#4ade80" : "#99e83e";
            const windSway = Math.sin(time * .06 + this.x * .03) * 1.5;
            for (let i = 4; i < this.w - 4; i += 9) {
                const bx = px + i;
                const bladeH = 3.5 + (i * 3 + Math.floor(this.x)) % 4;
                ctx.beginPath();
                ctx.moveTo(bx, this.y);
                ctx.lineTo(bx + 1.5 + windSway, this.y - bladeH);
                ctx.lineTo(bx + 3.5, this.y);
                ctx.fill();
            }
            if (this.w >= 36) {
                const flowerStep = Math.max(48, Math.floor(this.w / 2));
                for (let fx = 18; fx < this.w - 14; fx += flowerStep) {
                    const flX = px + fx;
                    const flY = this.y - 2;
                    const flType = (Math.floor(this.x) + fx) % 3;
                    if (flType === 0) {
                        ctx.fillStyle = "#ffffff";
                        ctx.beginPath();
                        ctx.arc(flX - 2.5, flY, 1.8, 0, Math.PI * 2);
                        ctx.arc(flX + 2.5, flY, 1.8, 0, Math.PI * 2);
                        ctx.arc(flX, flY - 2.5, 1.8, 0, Math.PI * 2);
                        ctx.arc(flX, flY + 2.5, 1.8, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = "#ffeb3b";
                        ctx.beginPath();
                        ctx.arc(flX, flY, 1.6, 0, Math.PI * 2);
                        ctx.fill();
                    } else if (flType === 1) {
                        ctx.fillStyle = "#ff4d6d";
                        ctx.beginPath();
                        ctx.arc(flX - 2, flY - 1, 1.7, 0, Math.PI * 2);
                        ctx.arc(flX + 2, flY - 1, 1.7, 0, Math.PI * 2);
                        ctx.arc(flX, flY + 2, 1.7, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = "#fff";
                        ctx.beginPath();
                        ctx.arc(flX, flY, 1.2, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        ctx.fillStyle = "#48cae4";
                        ctx.beginPath();
                        ctx.arc(flX, flY - 1, 2.2, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = "#caf0f8";
                        ctx.beginPath();
                        ctx.arc(flX, flY - 1, 1, 0, Math.PI * 2);
                        ctx.fill();
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
                for (let cX = 10; cX < this.w - 8; cX += 18) {
                    const icicleX = px + cX;
                    const icicleY = this.y + this.h;
                    const icicleLen = 5 + (cX * 5 + seedIce) % 11;
                    const icicleGrad = ctx.createLinearGradient(icicleX, icicleY, icicleX, icicleY + icicleLen);
                    icicleGrad.addColorStop(0, "rgba(180, 240, 255, 0.9)");
                    icicleGrad.addColorStop(.6, "rgba(84, 197, 240, 0.8)");
                    icicleGrad.addColorStop(1, "rgba(230, 250, 255, 0.95)");
                    ctx.fillStyle = icicleGrad;
                    ctx.beginPath();
                    ctx.moveTo(icicleX - 3, icicleY);
                    ctx.lineTo(icicleX + 3, icicleY);
                    ctx.lineTo(icicleX, icicleY + icicleLen);
                    ctx.closePath();
                    ctx.fill();
                }
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
            const neonColor = Math.floor(time * .02) % 3 === 0 ? "#00ffcc" : Math.floor(time * .02) % 3 === 1 ? "#ff00ff" : "#00e5ff";
            const grad = ctx.createLinearGradient(px, this.y, px, this.y + this.h);
            grad.addColorStop(0, "#0f172a");
            grad.addColorStop(.5, "#1e1b4b");
            grad.addColorStop(1, "#020617");
            ctx.fillStyle = grad;
            ctx.fillRect(px, this.y, this.w, this.h);
            ctx.fillStyle = neonColor;
            ctx.shadowColor = neonColor;
            ctx.shadowBlur = game.pixelMode ? 4 : 8;
            ctx.fillRect(px, this.y, this.w, 4);
            ctx.fillRect(px, this.y + this.h - 3, this.w, 3);
            ctx.shadowBlur = 0;
            ctx.fillStyle = "rgba(0, 255, 204, 0.85)";
            ctx.font = "bold 10px monospace";
            for (let b = 8; b < this.w - 12; b += 18) {
                const bitTime = Math.floor(time * .08 + b * .03 + this.x * .01);
                const bit = bitTime % 2 === 0 ? "1" : "0";
                const bx = px + b;
                const by = this.y + 14 + Math.floor(time * .04 + b) % 2 * 4;
                ctx.fillText(bit, bx, by);
            }
            if (this.trampoline) {
                drawTrampolinePad(ctx, px, this.y, this.w, time);
            }
            if (this.moving) {
                ctx.shadowColor = "#00e5ff";
                ctx.shadowBlur = 10 * (1 + this.glow);
            }
            ctx.fillStyle = neonColor;
            for (let i = 12; i < this.w - 10; i += 32) {
                ctx.beginPath();
                ctx.arc(px + i, this.y + 6, 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (currentLevel === 2) {
            const grad = ctx.createLinearGradient(px, this.y, px, this.y + this.h);
            grad.addColorStop(0, "#880000");
            grad.addColorStop(1, "#220000");
            ctx.fillStyle = grad;
            ctx.fillRect(px, this.y, this.w, this.h);
            ctx.fillStyle = "#aa0000";
            ctx.fillRect(px, this.y + 2, this.w, 2);
            if (this.trampoline) {
                drawTrampolinePad(ctx, px, this.y, this.w, time);
            }
            if (this.moving) {
                ctx.shadowColor = "#ff0000";
                ctx.shadowBlur = 8 * (1 + this.glow);
            }
            ctx.strokeStyle = "#ff3300";
            ctx.lineWidth = 1.5;
            for (let i = 0; i < this.w; i += 40) {
                ctx.beginPath();
                ctx.moveTo(px + i, this.y + 8);
                ctx.lineTo(px + i + 10, this.y + 20);
                ctx.stroke();
            }
        } else if (currentLevel === 3) {
            const woodGrad = ctx.createLinearGradient(px, this.y, px, this.y + this.h);
            woodGrad.addColorStop(0, "#9a5b28");
            woodGrad.addColorStop(.35, "#783e18");
            woodGrad.addColorStop(1, "#4d260c");
            ctx.fillStyle = woodGrad;
            ctx.fillRect(px, this.y, this.w, this.h);
            const pilStep = Math.max(75, Math.floor(this.w / 3));
            for (let pl = px + 16; pl < px + this.w - 12; pl += pilStep) {
                ctx.fillStyle = "#3f1f0a";
                ctx.fillRect(pl, this.y + this.h, 14, 140);
                ctx.fillStyle = "#261205";
                ctx.fillRect(pl + 2, this.y + this.h, 3, 140);
                ctx.fillStyle = "#059669";
                ctx.beginPath();
                ctx.arc(pl + 6, this.y + this.h + 20 + pl % 15, 5, 0, Math.PI * 2);
                ctx.arc(pl + 4, this.y + this.h + 45 + pl % 20, 4.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = pl % 2 === 0 ? "#06b6d4" : "#ec4899";
                ctx.beginPath();
                ctx.arc(pl + 11, this.y + this.h + 16, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.strokeStyle = "#3e1d08";
            ctx.lineWidth = 2;
            for (let tk = px; tk <= px + this.w; tk += 32) {
                ctx.beginPath();
                ctx.moveTo(tk, this.y);
                ctx.lineTo(tk, this.y + this.h);
                ctx.stroke();
                ctx.fillStyle = "#94a3b8";
                ctx.beginPath();
                ctx.arc(tk + 5, this.y + 4, 1.5, 0, Math.PI * 2);
                ctx.arc(tk + 5, this.y + this.h - 4, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
            ctx.fillRect(px, this.y, this.w, 2.5);
            ctx.fillStyle = "#06b6d4";
            ctx.shadowColor = "#06b6d4";
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(px + 4, this.y + 2, 2.5, 0, Math.PI * 2);
            ctx.arc(px + this.w - 4, this.y + 2, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            if (this.trampoline) {
                drawTrampolinePad(ctx, px, this.y, this.w, time);
            }
            if (this.moving) {
                ctx.shadowColor = "#06b6d4";
                ctx.shadowBlur = 10 * (1 + this.glow);
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
            for (let tk = px; tk <= px + this.w; tk += 34) {
                ctx.beginPath();
                ctx.moveTo(tk, this.y);
                ctx.lineTo(tk, this.y + this.h);
                ctx.stroke();
                ctx.fillStyle = "#64748b";
                ctx.beginPath();
                ctx.arc(tk + 5, this.y + 4, 1.8, 0, Math.PI * 2);
                ctx.arc(tk + 5, this.y + this.h - 4, 1.8, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.strokeStyle = "rgba(15, 5, 2, 0.4)";
            ctx.lineWidth = 1;
            for (let vy = this.y + 6; vy < this.y + this.h; vy += 10) {
                ctx.beginPath();
                ctx.moveTo(px, vy);
                ctx.lineTo(px + this.w, vy + Math.sin(vy + px) * 1.5);
                ctx.stroke();
            }
            ctx.fillStyle = "#7e22ce";
            ctx.shadowColor = "#a855f7";
            ctx.shadowBlur = 6;
            for (let mx = px + 6; mx < px + this.w - 6; mx += 16) {
                ctx.beginPath();
                ctx.arc(mx, this.y + 1, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;
            if (this.trampoline) {
                drawTrampolinePad(ctx, px, this.y, this.w, time);
            }
            if (this.moving) {
                ctx.shadowColor = "#a855f7";
                ctx.shadowBlur = 12 * (1 + this.glow);
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
            const startTile = Math.floor(this.x / 60) * 60;
            for (let tx = px + (startTile - this.x); tx < px + this.w; tx += 60) {
                if (tx < px) continue;
                ctx.beginPath();
                ctx.moveTo(tx, this.y);
                ctx.lineTo(tx, this.y + this.h);
                ctx.stroke();
                ctx.strokeStyle = "rgba(225, 29, 72, 0.35)";
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(tx + 15, this.y + 4);
                ctx.lineTo(tx + 22, this.y + 16);
                ctx.lineTo(tx + 18, this.y + 30);
                ctx.stroke();
                ctx.strokeStyle = "#050102";
                ctx.lineWidth = 2.5;
            }
            const pulse = Math.sin((time || 0) * .06 + px * .02) * .15 + .2;
            ctx.fillStyle = `rgba(190, 18, 60, ${pulse})`;
            for (let fx = Math.max(0, px); fx < Math.min(VIEW_W, px + this.w); fx += 45) {
                ctx.beginPath();
                ctx.arc(fx + 20, this.y - 2, 8 + pulse * 6, 0, Math.PI * 2);
                ctx.fill();
            }
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
        const frameW = demonSprite.width / 10;
        const frameH = demonSprite.height / 5;
        const dw = this.w * 1.5, dh = this.h * 1.5;
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
            addFloatingText(28150, 200, typeof __ === "function" ? __("flt_cave_secret") : "🪨 ¡CAVERNA SECRETA!", "#f59e0b", 24);
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
// Isaac Daniel Cotera - 2026 | Correo: isaacdanielcotera@gmail.com | Itch.io: https://cotera.itch.io | GitHub: https://github.com/cotera2024
