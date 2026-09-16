class ValkyriePiercingBullet {
    constructor(x, y, angle, speed = 5) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alive = true;
        this.damage = 12;
        this.radius = 7;
        this.color = "#0af";
        this.age = 0;
    }
    update(canvasWidth, canvasHeight) {
        this.x += this.vx;
        this.y += this.vy;
        this.age++;
        if (this.x < -50 || this.x > canvasWidth + 50 || this.y < -50 || this.y > canvasHeight + 50) {
            this.alive = false;
        }
    }
    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 25;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(-2, -2, this.radius * .4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ValkyrieBlasterBullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        const speed = 4;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alive = true;
        this.damage = 10;
        this.radius = 5;
        this.color = "#0ff";
        this.age = 0;
    }
    update(canvasWidth, canvasHeight) {
        this.x += this.vx;
        this.y += this.vy;
        this.age++;
        if (this.x < -50 || this.x > canvasWidth + 50 || this.y < -50 || this.y > canvasHeight + 50) {
            this.alive = false;
        }
    }
    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ValkyrieSolarBall {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        const speed = 2.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alive = true;
        this.damage = 50;
        this.radius = 66;
        this.age = 0;
        this.hitCooldown = 0;
        this.parent = null;
    }
    update(canvasWidth, canvasHeight) {
        this.x += this.vx;
        this.y += this.vy;
        this.age++;
        if (this.x < -50 || this.x > canvasWidth + 50 || this.y < -50 || this.y > canvasHeight + 50) {
            this.alive = false;
        }
        if (this.alive) {
            const effectiveRadius = this.radius || 66;
            const player = this.parent ? this.parent.getPlayer() : null;
            if (player && !this.hitCooldown) {
                const dx = player.x + player.width / 2 - this.x;
                const dy = player.y + player.height / 2 - this.y;
                if (Math.hypot(dx, dy) < effectiveRadius + 20) {
                    if (this.parent && typeof this.parent.onSolarHit === "function") {
                        this.parent.onSolarHit(player);
                    } else if (typeof player.takeDamage === "function") {
                        player.takeDamage(45, "fire");
                    }
                    if (this.parent && typeof this.parent.onSolarExplode === "function") {
                        this.parent.onSolarExplode(this.x, this.y);
                    }
                    this.hitCooldown = 15;
                    this.alive = false;
                }
            }
            if (this.hitCooldown > 0) this.hitCooldown--;
            if (this.age % 2 === 0 && this.parent && typeof this.parent.addEffect === "function") {
                for (let i = 0; i < 4; i++) {
                    const offsetAngle = Math.random() * Math.PI * 2;
                    const offsetDist = Math.random() * effectiveRadius * .95;
                    const px = this.x + Math.cos(offsetAngle) * offsetDist;
                    const py = this.y + Math.sin(offsetAngle) * offsetDist;
                    const color = Math.random() > .3 ? "#ffaa00" : "#ff3300";
                    this.parent.addEffect(new ValkyrieFireParticle(px, py, color, 20));
                }
            }
        }
    }
    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        const baseR = this.radius || 66;
        const pulse = Math.sin(this.age * .15) * 8;
        const r = baseR + pulse;
        ctx.save();
        ctx.shadowColor = "#ff6600";
        ctx.shadowBlur = 110;
        const auraGrad = ctx.createRadialGradient(0, 0, r * .3, 0, 0, r * 1.7);
        auraGrad.addColorStop(0, "rgba(255, 255, 180, 0.95)");
        auraGrad.addColorStop(.25, "rgba(255, 170, 0, 0.8)");
        auraGrad.addColorStop(.6, "rgba(255, 50, 0, 0.45)");
        auraGrad.addColorStop(.85, "rgba(180, 0, 0, 0.2)");
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.rotate(this.age * .025);
        const numRays = 14;
        for (let i = 0; i < numRays; i++) {
            const ang = Math.PI * 2 / numRays * i;
            const rayLen = r * (1.15 + .4 * Math.sin(this.age * .2 + i * 1.3));
            ctx.save();
            ctx.rotate(ang);
            ctx.beginPath();
            ctx.moveTo(r * .5, -r * .18);
            ctx.quadraticCurveTo(rayLen, 0, r * .5, r * .18);
            ctx.fillStyle = i % 2 === 0 ? "rgba(255, 220, 50, 0.7)" : "rgba(255, 90, 0, 0.7)";
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();
        const sunGrad = ctx.createRadialGradient(-r * .2, -r * .2, 0, 0, 0, r);
        sunGrad.addColorStop(0, "#ffffff");
        sunGrad.addColorStop(.12, "#ffffcc");
        sunGrad.addColorStop(.38, "#ffcc00");
        sunGrad.addColorStop(.7, "#ff3300");
        sunGrad.addColorStop(.92, "#990000");
        sunGrad.addColorStop(1, "rgba(150,0,0,0)");
        ctx.save();
        ctx.shadowColor = "#ffbb00";
        ctx.shadowBlur = 60;
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.rotate(-this.age * .035);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, r * .65, 0, Math.PI * 1.3);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 230, 110, 0.7)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, r * .45, Math.PI * .4, Math.PI * 1.7);
        ctx.stroke();
        ctx.restore();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(-r * .15, -r * .15, r * .28, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ValkyrieMechanicalSpark {
    constructor(x, y, color = "#0ff") {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - .5) * 5;
        this.vy = (Math.random() - .5) * 5;
        this.color = color;
        this.life = 12;
        this.maxLife = 12;
        this.radius = 2 + Math.random() * 3;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.vx *= .94;
        this.vy *= .94;
    }
    draw(ctx) {
        if (this.life <= 0) return;
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.x, this.y);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ValkyrieImpactWave {
    constructor(x, y, type = "energy") {
        this.x = x;
        this.y = y;
        this.life = 20;
        this.maxLife = 20;
        this.radius = 5;
        this.type = type;
        this.color = type === "fire" ? "#f60" : "#0ff";
    }
    update() {
        this.life--;
        this.radius += 4;
    }
    draw(ctx) {
        if (this.life <= 0) return;
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

class ValkyrieFireParticle {
    constructor(x, y, color = "#f50", life = 20) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - .5) * 4;
        this.vy = (Math.random() - .5) * 4 - 1;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.radius = 3 + Math.random() * 5;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.radius *= .98;
        this.vy += .03;
    }
    draw(ctx) {
        if (this.life <= 0 || this.radius < .3) return;
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.x, this.y);
        ctx.fillStyle = this.color;
        ctx.shadowColor = "#f80";
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ValkyrieMiniWave {
    constructor(x, y, color = "#0ff") {
        this.x = x;
        this.y = y;
        this.life = 15;
        this.maxLife = 15;
        this.radius = 3;
        this.color = color;
    }
    update() {
        this.life--;
        this.radius += 2;
    }
    draw(ctx) {
        if (this.life <= 0) return;
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

class ValkyrieVaporParticle {
    constructor(x, y, vx, vy, color = "#fff") {
        this.x = x;
        this.y = y;
        this.vx = vx || (Math.random() - .5) * .5;
        this.vy = vy || (Math.random() - .5) * .5 - .5;
        this.color = color;
        this.life = 25;
        this.maxLife = 25;
        this.radius = 3 + Math.random() * 5;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.radius *= .99;
    }
    draw(ctx) {
        if (this.life <= 0) return;
        const alpha = this.life / this.maxLife * .4;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.x, this.y);
        ctx.fillStyle = this.color;
        ctx.shadowColor = "#fff";
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function clamp(value, min = 0, max = 1) {
    return Math.max(min, Math.min(max, value));
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function drawPolygon(ctx, cx, cy, radius, sides, rotation) {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = rotation + i / sides * Math.PI * 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
}

const RenderUtils = {
    getTubeGradient(ctx, x1, y1, x2, y2) {
        const g = ctx.createLinearGradient(x1, y1, x2, y2);
        g.addColorStop(0, "#666");
        g.addColorStop(.5, "#aaa");
        g.addColorStop(1, "#333");
        return g;
    },
    getMetalGradient(ctx, x, y, r) {
        const g = ctx.createRadialGradient(x - r * .2, y - r * .2, 0, x, y, r);
        g.addColorStop(0, "#8899bb");
        g.addColorStop(.5, "#334466");
        g.addColorStop(1, "#111822");
        return g;
    },
    drawRivets(ctx, points) {
        ctx.fillStyle = "#555";
        for (const p of points) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#888";
            ctx.beginPath();
            ctx.arc(p.x - 1, p.y - 1, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#555";
        }
    }
};

class Valkyrie {
    constructor(x, y, services = {}) {
        this.x = x;
        this.y = y;
        this.targetY = y;
        this.scale = .45;
        this.baseRadius = 65;
        this.width = 90;
        this.height = 90;
        this.phase = 1;
        this.maxHp = 360;
        this.hp = 360;
        this._alive = true;
        this.isBoss = true;
        this.bullets = [];
        this.effects = [];
        this.rightDestroyed = false;
        this.leftDestroyed = false;
        this.lastDestroyed = "";
        this.nextPhase = null;
        this.leftAngle = Math.PI / 2;
        this.rightAngle = Math.PI / 2;
        this.centerAngle = Math.PI / 2;
        this.state = 0;
        this.animCapsule = 0;
        this.animAssemble = 0;
        this.animSolar = 0;
        this.leftCooldown = 140;
        this.rightCooldown = 140;
        this.leftRecoil = 0;
        this.rightRecoil = 0;
        this.spinAngle = Math.PI / 2;
        this.spinState = 0;
        this.weapon = -1;
        this.weaponAngles = [ 0, Math.PI * 2 / 3, Math.PI * 4 / 3 ];
        this.weaponColors = [ "#f30", "#0af", "#f0f" ];
        this.spinTimer = 0;
        this.spinTotal = 20;
        this.spinStart = 0;
        this.spinTarget = 0;
        this.centerCooldown = 40;
        this.burstCount = 0;
        this.burstCooldown = 0;
        this.flashDespawn = 0;
        this.p2Timer = 0;
        this.p2Angle = 0;
        this.phase3Timer = 300;
        this.solarRecoil = 0;
        this.siloTimer = 0;
        this.damageFlash = 0;
        this.vibration = 0;
        this.explosionTimer = 0;
        this.turbineSpeed = 0;
        this.chargeBrightness = 0;
        this.lock1 = false;
        this.lock2 = false;
        this.lock3 = false;
        this.services = services;
        this.getPlayer = services.getPlayer || (() => null);
        this.playSound = services.playSound || (() => {});
        this.createExplosion = services.createExplosion || (() => {});
        this.applyShake = services.applyShake || (() => {});
        this.processGlobalDamage = services.processGlobalDamage || ((entity, amount, type) => {
            if (entity.hp !== undefined) {
                entity.hp -= amount;
                if (entity.hp <= 0 && entity._alive !== undefined) {
                    entity._alive = false;
                }
            }
        });
        this.cacheChasis = services.cacheChasis;
        this.cacheSilo = services.cacheSilo;
        this.cacheDodec = services.cacheDodec;
        if (typeof this.playSound === "function") {
            this.playSound("valkyrie_emerge.mp3", .6);
        }
    }
    get alive() {
        return this._alive;
    }
    set alive(val) {
        if (val === false && this._alive === true) {
            this.takeDamage(1, "normal");
        } else {
            this._alive = val;
        }
    }
    addEffect(effect) {
        this.effects.push(effect);
    }
    takeDamage(amount, type) {
        if (!this._alive || this.state !== 3) return;
        const oldHp = this.hp;
        if (typeof this.processGlobalDamage === "function") {
            this.processGlobalDamage(this, amount, type);
        } else {
            this.hp -= amount;
        }
        this.damageFlash = 1;
        this.vibration = 15;
        for (let i = 0; i < 3; i++) {
            this.effects.push(new ValkyrieMechanicalSpark(this.x + (Math.random() - .5) * 80, this.y + (Math.random() - .5) * 80, "#0ff"));
        }
        if (this.phase === 1) {
            if (this.hp <= 121 && oldHp > 121) {
                this.nextPhase = 2;
                this.state = 9;
                this.explosionTimer = 80;
                this.spinState = 0;
                if (typeof this.applyShake === "function") this.applyShake(15);
                if (typeof this.playSound === "function") this.playSound("boss_explosion.mp3", 1);
            }
        } else if (this.phase === 2) {
            if (this.hp <= 61 && oldHp > 61) {
                this.nextPhase = 3;
                this.state = 9;
                this.explosionTimer = 80;
                if (typeof this.applyShake === "function") this.applyShake(15);
                if (typeof this.playSound === "function") this.playSound("boss_explosion.mp3", 1);
            }
        } else if (this.phase === 3) {
            if (this.hp <= 0 && oldHp > 0) {
                this._alive = false;
                if (typeof this.applyShake === "function") this.applyShake(40);
                if (typeof this.playSound === "function") this.playSound("boss_explosion.mp3", 1);
                if (typeof this.createExplosion === "function") {
                    for (let i = 0; i < 25; i++) {
                        setTimeout(() => {
                            this.createExplosion(this.x + (Math.random() - .5) * 200, this.y + (Math.random() - .5) * 200, 40, 60);
                        }, Math.random() * 1500);
                    }
                }
            }
        }
    }
    _spawnLockSparks(x, y, color) {
        this.effects.push(new ValkyrieMiniWave(x, y, color));
        for (let i = 0; i < 8; i++) {
            this.effects.push(new ValkyrieMechanicalSpark(x, y, color));
        }
    }
    _fireMegaBullet(BulletClass, px, py, angle, scaleMul) {
        const b = new BulletClass(px, py, angle);
        b.parent = this;
        b.scale = (b.scale || 1) * scaleMul;
        if (b.radius) b.radius *= scaleMul;
        if (b.r) b.r = (b.radius || b.r || 10) * scaleMul;
        b.width = (b.width || 20) * scaleMul;
        b.height = (b.height || 20) * scaleMul;
        this.bullets.push(b);
    }
    update(canvasWidth, canvasHeight) {
        if (!this._alive) return;
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            if (typeof b.update === "function") {
                b.update(canvasWidth, canvasHeight);
            }
            if (!b.alive) {
                this.bullets.splice(i, 1);
            }
        }
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const e = this.effects[i];
            if (typeof e.update === "function") {
                e.update();
            }
            if (e.life <= 0) {
                this.effects.splice(i, 1);
            }
        }
        if (this.damageFlash > 0) this.damageFlash -= .05;
        if (this.flashDespawn > 0) this.flashDespawn -= .08;
        const player = typeof this.getPlayer === "function" ? this.getPlayer() : null;
        let targetAngle = player ? Math.atan2(player.y + player.height / 2 - this.y, player.x + player.width / 2 - this.x) : Math.PI / 2;
        switch (this.state) {
          case 0:
            this.state = 1;
            if (typeof this.applyShake === "function") this.applyShake(20);
            this.effects.push(new ValkyrieMiniWave(this.x, this.targetY, "#fa0"));
            if (typeof this.playSound === "function") this.playSound("valkyrie_emerge.mp3", .8);
            break;

          case 1:
            this.animCapsule += .03;
            if (this.animCapsule >= 1) {
                this.animCapsule = 1;
                this.state = 2;
                this.lock1 = false;
                this.lock2 = false;
                this.lock3 = false;
                if (typeof this.playSound === "function") this.playSound("valkyrie_emerge.mp3", 1);
            }
            break;

          case 2:
            this.animAssemble += .008;
            const p1 = clamp(this.animAssemble / .33);
            const p2 = clamp((this.animAssemble - .33) / .33);
            const p3 = clamp((this.animAssemble - .66) / .34);
            if (this.phase === 1) {
                if (p1 === 1 && !this.lock1) {
                    this.lock1 = true;
                    this._spawnLockSparks(this.x, this.y, "#fff");
                }
                if (p2 === 1 && !this.lock2) {
                    this.lock2 = true;
                    if (!this.leftDestroyed) {
                        this._spawnLockSparks(this.x - 250 * this.scale, this.y, "#0ff");
                    }
                    if (!this.rightDestroyed) {
                        this._spawnLockSparks(this.x + 250 * this.scale, this.y, "#0ff");
                    }
                }
                if (p3 === 1 && !this.lock3) {
                    this.lock3 = true;
                    this._spawnLockSparks(this.x, this.y, "#f0f");
                }
            }
            if (this.animAssemble >= 1) {
                this.animAssemble = 1;
                this.state = 3;
                this.leftCooldown = 140;
                this.rightCooldown = 140;
                this.centerCooldown = 40;
                if (this.phase === 3) {
                    this.phase3Timer = 300;
                    if (typeof this.playSound === "function") this.playSound("valkyrie_charge.mp3", 1);
                }
            }
            this.leftAngle += (targetAngle - this.leftAngle) * .05;
            this.rightAngle += (targetAngle - this.rightAngle) * .05;
            break;

          case 3:
            this.y = this.targetY;
            if (this.phase === 1) {
                let diffL = targetAngle - this.leftAngle;
                while (diffL < -Math.PI) diffL += Math.PI * 2;
                while (diffL > Math.PI) diffL -= Math.PI * 2;
                this.leftAngle += diffL * .05;
                let diffR = targetAngle - this.rightAngle;
                while (diffR < -Math.PI) diffR += Math.PI * 2;
                while (diffR > Math.PI) diffR -= Math.PI * 2;
                this.rightAngle += diffR * .05;
                if (this.leftRecoil > 0) this.leftRecoil -= 3;
                if (this.rightRecoil > 0) this.rightRecoil -= 3;
                if (this.spinState !== 1) {
                    if (!this.leftDestroyed) {
                        if (this.leftCooldown > 0) {
                            this.leftCooldown--;
                        } else if (Math.abs(diffL) < .1) {
                            const px = this.x - 250 * this.scale + Math.cos(this.leftAngle) * (85 * this.scale);
                            const py = this.y + Math.sin(this.leftAngle) * (85 * this.scale);
                            this._fireMegaBullet(ValkyriePiercingBullet, px, py, this.leftAngle, 2.5);
                            this.leftRecoil = 20;
                            this.leftCooldown = 140;
                            if (typeof this.playSound === "function") this.playSound("shoot.mp3", .4);
                        }
                    }
                    if (!this.rightDestroyed) {
                        if (this.rightCooldown > 0) {
                            this.rightCooldown--;
                        } else if (Math.abs(diffR) < .1) {
                            const px = this.x + 250 * this.scale + Math.cos(this.rightAngle) * (85 * this.scale);
                            const py = this.y + Math.sin(this.rightAngle) * (85 * this.scale);
                            this._fireMegaBullet(ValkyriePiercingBullet, px, py, this.rightAngle, 2.5);
                            this.rightRecoil = 20;
                            this.rightCooldown = 140;
                            if (typeof this.playSound === "function") this.playSound("shoot.mp3", .4);
                        }
                    }
                }
                let diffC = targetAngle - this.centerAngle;
                while (diffC < -Math.PI) diffC += Math.PI * 2;
                while (diffC > Math.PI) diffC -= Math.PI * 2;
                if (this.centerCooldown > 0) {
                    this.centerCooldown--;
                } else if (this.spinState === 0) {
                    this.weapon = Math.floor(Math.random() * 3);
                    this.spinState = 1;
                    this.spinTimer = this.spinTotal;
                    this.spinStart = this.spinAngle;
                    this.spinTarget = targetAngle - this.weaponAngles[this.weapon] + Math.PI * 8;
                    const gearSfx = this.weapon === 0 ? "gear_3.mp3" : this.weapon === 1 ? "gear_1.mp3" : "gear_2.mp3";
                    if (typeof this.playSound === "function") this.playSound(gearSfx, .7);
                }
                if (this.spinState === 1) {
                    this.spinTimer--;
                    const t = 1 - this.spinTimer / this.spinTotal;
                    const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
                    this.spinAngle = this.spinStart + (this.spinTarget - this.spinStart) * eased;
                    if (this.spinTimer <= 0) {
                        this.spinState = 2;
                        this.flashDespawn = 1;
                        this.burstCount = this.weapon === 2 ? 6 : 1;
                        this.burstCooldown = 0;
                    }
                } else if (this.spinState === 2) {
                    const aimAngle = this.spinAngle + this.weaponAngles[this.weapon];
                    let diffAim = targetAngle - aimAngle;
                    while (diffAim < -Math.PI) diffAim += Math.PI * 2;
                    while (diffAim > Math.PI) diffAim -= Math.PI * 2;
                    this.spinAngle += diffAim * .25;
                    if (this.burstCooldown <= 0) {
                        const fireAngle = this.spinAngle + this.weaponAngles[this.weapon];
                        const px = this.x + Math.cos(fireAngle) * (145 * this.scale);
                        const py = this.y + Math.sin(fireAngle) * (145 * this.scale);
                        if (this.weapon === 0) {
                            this._fireMegaBullet(ValkyriePiercingBullet, px, py, fireAngle - .25, 2);
                            this._fireMegaBullet(ValkyriePiercingBullet, px, py, fireAngle, 2);
                            this._fireMegaBullet(ValkyriePiercingBullet, px, py, fireAngle + .25, 2);
                            if (typeof this.playSound === "function") this.playSound("energy_ball.mp3", .6);
                        } else if (this.weapon === 1) {
                            this._fireMegaBullet(ValkyriePiercingBullet, px, py, fireAngle, 3);
                            if (typeof this.playSound === "function") this.playSound("shoot.mp3", .5);
                        } else if (this.weapon === 2) {
                            this._fireMegaBullet(ValkyriePiercingBullet, px, py, fireAngle, 1.8);
                            this.burstCooldown = 15;
                            if (typeof this.playSound === "function") this.playSound("shoot.mp3", .4);
                        }
                        this.effects.push(new ValkyrieMiniWave(px, py, this.weaponColors[this.weapon]));
                        this.burstCount--;
                        if (this.burstCount <= 0) {
                            this.spinState = 0;
                            this.centerCooldown = 40;
                        }
                    } else {
                        this.burstCooldown--;
                    }
                }
            } else if (this.phase === 2) {
                this.p2Timer++;
                const playerRef = player;
                const BURST_LEN = 480;
                const PAUSE_LEN = 300;
                const CYCLE = BURST_LEN + PAUSE_LEN;
                const t = this.p2Timer % CYCLE;
                const inBurst = t < BURST_LEN;
                const baseY = this._phase2BaseY !== undefined ? this._phase2BaseY : 150;
                if (this.p2SpinDir === undefined) this.p2SpinDir = 1;
                this.targetY = baseY;
                if (inBurst) {
                    this.p2Angle += .05 * this.p2SpinDir;
                    if (this.p2Timer % 9 === 0) {
                        const fireAngle = this.p2Angle;
                        const px = this.x + Math.cos(fireAngle) * (145 * this.scale);
                        const py = this.y + Math.sin(fireAngle) * (145 * this.scale);
                        this._fireMegaBullet(ValkyriePiercingBullet, px, py, fireAngle + Math.PI / 2, 2.2);
                        if (typeof this.playSound === "function") this.playSound("shoot.mp3", .5);
                    }
                }
                if (this.p2Timer >= CYCLE) {
                    this.p2Timer = 0;
                    this.p2SpinDir *= -1;
                }
            } else if (this.phase === 3) {
                let diffC = targetAngle - this.centerAngle;
                while (diffC < -Math.PI) diffC += Math.PI * 2;
                while (diffC > Math.PI) diffC -= Math.PI * 2;
                this.centerAngle += diffC * .015;
                this.phase3Timer--;
                if (this.solarRecoil > 0) this.solarRecoil -= 2;
                const charge = clamp(1 - this.phase3Timer / 300);
                this.turbineSpeed = charge * .5;
                this.chargeBrightness = charge;
                if (this.phase3Timer > 10 && charge > .5 && Math.random() > .2) {
                    const a = Math.random() * Math.PI * 2;
                    const dist = 180 * (1 - charge);
                    const px = this.x + Math.cos(this.centerAngle) * 100 + Math.cos(a) * dist;
                    const py = this.y + Math.sin(this.centerAngle) * 100 + Math.sin(a) * dist;
                    const color = charge > .8 ? "#fff" : Math.random() > .5 ? "#ffaa00" : "#ff3300";
                    this.effects.push(new ValkyrieVaporParticle(px, py, (this.x - px) * .1, (this.y - py) * .1, color));
                }
                if (this.phase3Timer <= 0) {
                    const scaleMul = 2.8 * this.scale;
                    const px = this.x + Math.cos(this.centerAngle) * (110 * scaleMul);
                    const py = this.y + Math.sin(this.centerAngle) * (110 * scaleMul);
                    this._fireMegaBullet(ValkyrieSolarBall, px, py, this.centerAngle, 1.35);
                    this.effects.push(new ValkyrieMiniWave(px, py, "#ffaa00"));
                    for (let i = 0; i < 25; i++) {
                        const col = Math.random() > .5 ? "#ffcc00" : "#ff3300";
                        this.effects.push(new ValkyrieMechanicalSpark(px, py, col));
                    }
                    if (typeof this.playSound === "function") this.playSound("valkyrie_shoot.mp3", 1);
                    if (typeof this.applyShake === "function") this.applyShake(45);
                    this.solarRecoil = 50;
                    this.phase3Timer = 300;
                    if (typeof this.playSound === "function") this.playSound("valkyrie_charge.mp3", 1);
                }
            }
            break;

          case 4:
            this.animAssemble -= .02;
            this.leftAngle += (Math.PI / 2 - this.leftAngle) * .2;
            this.rightAngle += (Math.PI / 2 - this.rightAngle) * .2;
            if (this.animAssemble <= 0) {
                this.animAssemble = 0;
                this.state = 5;
            }
            break;

          case 5:
            this.animCapsule -= .03;
            if (this.animCapsule <= 0) {
                this.animCapsule = 0;
                this.state = 6;
                this.siloTimer = 40;
            }
            break;

          case 6:
            this.siloTimer--;
            if (this.siloTimer <= 0) {
                this.state = 1;
            }
            break;

          case 9:
            this.y = this.targetY;
            let diffL9 = targetAngle - this.leftAngle;
            while (diffL9 < -Math.PI) diffL9 += Math.PI * 2;
            while (diffL9 > Math.PI) diffL9 -= Math.PI * 2;
            this.leftAngle += diffL9 * .05;
            let diffR9 = targetAngle - this.rightAngle;
            while (diffR9 < -Math.PI) diffR9 += Math.PI * 2;
            while (diffR9 > Math.PI) diffR9 -= Math.PI * 2;
            this.rightAngle += diffR9 * .05;
            this.explosionTimer--;
            this.vibration = 8;
            if (this.explosionTimer % 10 === 0) {
                let px = this.x;
                let py = this.y;
                if (this.phase === 1) {
                    if (this.nextPhase === 2) {
                        px += (Math.random() - .5) * 80;
                        py += (Math.random() - .5) * 80;
                    } else if (this.lastDestroyed === "right") {
                        px += 250 * this.scale + (Math.random() - .5) * 50;
                    } else if (this.lastDestroyed === "left") {
                        px -= 250 * this.scale - (Math.random() - .5) * 50;
                    }
                } else {
                    px += (Math.random() - .5) * 100;
                    py += (Math.random() - .5) * 100;
                }
                this.effects.push(new ValkyrieImpactWave(px, py, "fire"));
                this.effects.push(new ValkyrieMiniWave(px, py, "#fa0"));
                for (let i = 0; i < 8; i++) {
                    this.effects.push(new ValkyrieMechanicalSpark(px, py, "#fff"));
                }
                for (let i = 0; i < 3; i++) {
                    this.effects.push(new ValkyrieFireParticle(px, py, "#f30", 1.5));
                }
                if (typeof this.playSound === "function") this.playSound("boss_explosion.mp3", .6);
                if (typeof this.applyShake === "function") this.applyShake(15);
            }
            if (this.explosionTimer <= 0) {
                this.state = 4;
                if (typeof this.playSound === "function") this.playSound("valkyrie_encapsulate.mp3", .8);
                if (this.nextPhase !== null) {
                    this.phase = this.nextPhase;
                    this.nextPhase = null;
                    if (this.phase === 2) {
                        this.maxHp = 200;
                        this.hp = 200;
                    } else if (this.phase === 3) {
                        this.maxHp = 250;
                        this.hp = 250;
                    }
                }
            }
            break;
        }
    }
    _drawRailsAndPipes(ctx) {
        ctx.save();
        ctx.strokeStyle = "#223";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(-30, 0);
        ctx.lineTo(-30, 150);
        ctx.moveTo(30, 0);
        ctx.lineTo(30, 150);
        ctx.stroke();
        ctx.strokeStyle = "#0ff";
        ctx.lineWidth = 2;
        ctx.stroke();
        const flow = Date.now() % 1e3 / 1e3;
        ctx.strokeStyle = RenderUtils.getTubeGradient ? RenderUtils.getTubeGradient(ctx, -70, 20, -50, 20) : "#555";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(-60, 20);
        ctx.bezierCurveTo(-100, 50, -100, 100, -60, 130);
        ctx.stroke();
        ctx.strokeStyle = RenderUtils.getTubeGradient ? RenderUtils.getTubeGradient(ctx, 70, 20, 50, 20) : "#555";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(60, 20);
        ctx.bezierCurveTo(100, 50, 100, 100, 60, 130);
        ctx.stroke();
        ctx.lineWidth = 3;
        ctx.setLineDash([ 10, 10 ]);
        ctx.lineDashOffset = -flow * 20;
        ctx.strokeStyle = "#f55";
        ctx.beginPath();
        ctx.moveTo(-50, 30);
        ctx.bezierCurveTo(-80, 60, -70, 110, -50, 120);
        ctx.stroke();
        ctx.strokeStyle = "#5af";
        ctx.beginPath();
        ctx.moveTo(-45, 30);
        ctx.bezierCurveTo(-75, 60, -65, 110, -45, 120);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    }
    _drawAtomicRings(ctx, radius, power, colorType) {
        const numRings = 4;
        ctx.lineWidth = 3;
        for (let i = 0; i < numRings; i++) {
            ctx.save();
            const rotSpeed = Date.now() / (80 + i * 40) + Math.PI / numRings * i;
            ctx.rotate(rotSpeed);
            ctx.scale(1, .3 + Math.sin(Date.now() / 500 + i) * .2);
            let colorHex = colorType === "fire" ? `255, ${100 + i * 50}, 0` : `0, ${150 + i * 50}, 255`;
            if (colorType === "void") colorHex = `150, 0, 255`;
            if (power > .6) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = `rgba(${colorHex}, 1)`;
            }
            ctx.strokeStyle = `rgba(${colorHex}, ${power})`;
            const r = radius * 1.5 + 5 + Math.sin(Date.now() / 200) * 5;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
            const elecAngle = Date.now() / (40 + i * 15);
            const ex = Math.cos(elecAngle) * (radius * 1.5 + 5);
            const ey = Math.sin(elecAngle) * (radius * 1.5 + 5);
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(ex, ey, 3 + power * 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        if (power > .5) {
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 1 + Math.random() * 3;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo((Math.random() - .5) * radius * 3, (Math.random() - .5) * radius * 3);
            ctx.stroke();
        }
    }
    _drawSideCannon(ctx, isLeft, progress) {
        const finalX = isLeft ? -250 : 250;
        const angle = isLeft ? this.leftAngle : this.rightAngle;
        const recoil = isLeft ? this.leftRecoil : this.rightRecoil;
        const ease = easeOutCubic(progress);
        const currentX = finalX * ease;
        ctx.save();
        ctx.translate(currentX, 0);
        const armWidth = 180 * ease;
        const metalGrad = ctx.createLinearGradient(0, -40, 0, 40);
        metalGrad.addColorStop(0, "#7a8ba3");
        metalGrad.addColorStop(.2, "#3e4d6b");
        metalGrad.addColorStop(.8, "#161e30");
        metalGrad.addColorStop(1, "#0c121e");
        ctx.fillStyle = metalGrad;
        ctx.strokeStyle = "#05070a";
        ctx.lineWidth = 5;
        ctx.beginPath();
        if (isLeft) {
            ctx.moveTo(10, -20);
            ctx.lineTo(armWidth, -38);
            ctx.lineTo(armWidth, 38);
            ctx.lineTo(10, 20);
        } else {
            ctx.moveTo(-10, -20);
            ctx.lineTo(-armWidth, -38);
            ctx.lineTo(-armWidth, 38);
            ctx.lineTo(-10, 20);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "rgba(0, 255, 255, 0.9)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (isLeft) {
            ctx.moveTo(25, -10);
            ctx.lineTo(armWidth - 20, -10);
            ctx.moveTo(25, 10);
            ctx.lineTo(armWidth - 20, 10);
        } else {
            ctx.moveTo(-25, -10);
            ctx.lineTo(-armWidth + 20, -10);
            ctx.moveTo(-25, 10);
            ctx.lineTo(-armWidth + 20, 10);
        }
        ctx.stroke();
        ctx.scale(1.7, 1.7);
        const baseGrad = ctx.createLinearGradient(-25, -25, 25, 25);
        baseGrad.addColorStop(0, "#8c9fb8");
        baseGrad.addColorStop(.4, "#29344d");
        baseGrad.addColorStop(1, "#0a0d14");
        ctx.fillStyle = baseGrad;
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (isLeft) {
            ctx.moveTo(22, -14);
            ctx.lineTo(0, -22);
            ctx.lineTo(-22, -10);
            ctx.lineTo(-22, 22);
            ctx.lineTo(22, 10);
        } else {
            ctx.moveTo(-22, -14);
            ctx.lineTo(0, -22);
            ctx.lineTo(22, -10);
            ctx.lineTo(22, 22);
            ctx.lineTo(-22, 10);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        const finalAngle = progress < 1 ? Math.PI / 2 + (angle - Math.PI / 2) * ease : angle;
        ctx.rotate(finalAngle);
        ctx.fillStyle = "#1c2333";
        ctx.strokeStyle = "#0ff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        const barrelGrad = ctx.createLinearGradient(0, -12, 0, 12);
        barrelGrad.addColorStop(0, "#7a8ba3");
        barrelGrad.addColorStop(.5, "#161e30");
        barrelGrad.addColorStop(1, "#020305");
        ctx.fillStyle = barrelGrad;
        ctx.strokeStyle = "#0a0d14";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-15 - recoil, -10);
        ctx.lineTo(48 - recoil, -12);
        ctx.lineTo(55 - recoil, -4);
        ctx.lineTo(-15 - recoil, -4);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-15 - recoil, 10);
        ctx.lineTo(48 - recoil, 12);
        ctx.lineTo(55 - recoil, 4);
        ctx.lineTo(-15 - recoil, 4);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "#3e4d6b";
        ctx.beginPath();
        ctx.moveTo(-15 - recoil, -10);
        ctx.lineTo(45 - recoil, -12);
        ctx.stroke();
        const brightness = (isLeft ? this.leftCooldown : this.rightCooldown) < 30 ? 1 : .3;
        ctx.fillStyle = `rgba(0,255,255,${brightness})`;
        ctx.fillRect(-5 - recoil, -2, 50, 4);
        ctx.fillStyle = "#0c121e";
        ctx.beginPath();
        ctx.rect(-12 - recoil, -5, 28, 10);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
    _drawDestroyedCannon(ctx, isLeft, progress) {
        const finalX = isLeft ? -250 : 250;
        const ease = easeOutCubic(progress);
        const currentX = finalX * ease;
        ctx.save();
        ctx.translate(currentX, 0);
        const armWidth = 180 * ease;
        ctx.fillStyle = "#111";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 5;
        ctx.beginPath();
        if (isLeft) {
            ctx.moveTo(10, -18);
            ctx.lineTo(armWidth, -35);
            ctx.lineTo(armWidth, 35);
            ctx.lineTo(10, 18);
        } else {
            ctx.moveTo(-10, -18);
            ctx.lineTo(-armWidth, -35);
            ctx.lineTo(-armWidth, 35);
            ctx.lineTo(-10, 18);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.scale(1.7, 1.7);
        ctx.fillStyle = "#0a0a0a";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (isLeft) {
            ctx.moveTo(20, -12);
            ctx.lineTo(0, -20);
            ctx.lineTo(-10, -8);
            ctx.lineTo(-10, 10);
            ctx.lineTo(20, 8);
        } else {
            ctx.moveTo(-20, -12);
            ctx.lineTo(0, -20);
            ctx.lineTo(10, -8);
            ctx.lineTo(10, 10);
            ctx.lineTo(-20, 8);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#050505";
        ctx.beginPath();
        if (isLeft) {
            ctx.moveTo(0, -20);
            ctx.lineTo(-15, -18);
            ctx.lineTo(-12, -5);
            ctx.lineTo(-20, 5);
            ctx.lineTo(-5, 12);
            ctx.lineTo(0, 8);
        } else {
            ctx.moveTo(0, -20);
            ctx.lineTo(15, -18);
            ctx.lineTo(12, -5);
            ctx.lineTo(20, 5);
            ctx.lineTo(5, 12);
            ctx.lineTo(0, 8);
        }
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "#f30";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(isLeft ? -10 : 10, -5);
        ctx.lineTo(isLeft ? -20 : 20, -10);
        ctx.stroke();
        ctx.strokeStyle = "#fa0";
        ctx.beginPath();
        ctx.moveTo(isLeft ? -10 : 10, 5);
        ctx.lineTo(isLeft ? -15 : 15, 12);
        ctx.stroke();
        const sparkAlpha = .6 + Math.random() * .4;
        ctx.fillStyle = `rgba(255, 50, 0, ${sparkAlpha})`;
        ctx.beginPath();
        ctx.arc(isLeft ? -10 : 10, 0, 8 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
        const debrisAlpha = .3 * Math.random();
        ctx.fillStyle = `rgba(20, 20, 20, ${debrisAlpha})`;
        ctx.beginPath();
        ctx.arc(isLeft ? -15 : 15, -10 - Math.random() * 20, 15 + Math.random() * 10, 0, Math.PI * 2);
        ctx.fill();
        if (Math.random() > .8 && (this.state === 3 || this.state === 9)) {
            this.effects.push(new ValkyrieMechanicalSpark(this.x + currentX * this.scale, this.y, "#f30"));
        }
        ctx.restore();
    }
    _drawFireArm(ctx, isCharging) {
        const gB = ctx.createLinearGradient(0, -18, 0, 18);
        gB.addColorStop(0, "#4a5c7d");
        gB.addColorStop(1, "#0c121e");
        ctx.fillStyle = gB;
        ctx.strokeStyle = "#05060a";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(20, -15);
        ctx.lineTo(42, -15);
        ctx.lineTo(42, 15);
        ctx.lineTo(20, 15);
        ctx.fill();
        ctx.stroke();
        const gCanon = ctx.createLinearGradient(40, -18, 70, 18);
        gCanon.addColorStop(0, "#7a8ba3");
        gCanon.addColorStop(1, "#161e30");
        ctx.fillStyle = gCanon;
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(42, -18);
        ctx.lineTo(70, -20);
        ctx.lineTo(70, -8);
        ctx.lineTo(42, -8);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(42, 18);
        ctx.lineTo(70, 20);
        ctx.lineTo(70, 8);
        ctx.lineTo(42, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#f30";
        ctx.fillRect(44, -5, 20, 10);
        if (isCharging) {
            ctx.fillStyle = "#ff0";
            ctx.beginPath();
            ctx.arc(60, 0, 14 + Math.random() * 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(60, 0, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    _drawElectricArm(ctx, isCharging) {
        const gB = ctx.createLinearGradient(0, -22, 0, 22);
        gB.addColorStop(0, "#4a5c7d");
        gB.addColorStop(1, "#0c121e");
        ctx.fillStyle = gB;
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(20, -22);
        ctx.lineTo(75, -24);
        ctx.lineTo(80, -14);
        ctx.lineTo(80, 14);
        ctx.lineTo(75, 24);
        ctx.lineTo(20, 22);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#1c2333";
        ctx.fillRect(32, -16, 35, 32);
        ctx.strokeStyle = "#0af";
        ctx.strokeRect(32, -16, 35, 32);
        ctx.fillStyle = "#0af";
        ctx.fillRect(32, -4, 50, 8);
        if (isCharging) {
            ctx.fillStyle = "#fff";
            ctx.fillRect(25, -6, 60, 12);
            ctx.strokeStyle = "#0ff";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(25, 0);
            ctx.lineTo(50, (Math.random() - .5) * 20);
            ctx.lineTo(80, 0);
            ctx.stroke();
        }
    }
    _drawBurstArm(ctx, isCharging) {
        const gB = ctx.createLinearGradient(0, -20, 0, 20);
        gB.addColorStop(0, "#4a5c7d");
        gB.addColorStop(1, "#0c121e");
        ctx.fillStyle = gB;
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(20, -20);
        ctx.lineTo(38, -20);
        ctx.lineTo(38, 20);
        ctx.lineTo(20, 20);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#1c2333";
        ctx.strokeStyle = "#f0f";
        ctx.lineWidth = 2;
        ctx.fillRect(38, -16, 40, 8);
        ctx.strokeRect(38, -16, 40, 8);
        ctx.fillRect(38, -4, 45, 8);
        ctx.strokeRect(38, -4, 45, 8);
        ctx.fillRect(38, 8, 40, 8);
        ctx.strokeRect(38, 8, 40, 8);
        ctx.fillStyle = "#f0f";
        ctx.fillRect(32, -18, 10, 36);
        if (isCharging) {
            ctx.fillStyle = "#fff";
            ctx.fillRect(38, -18, 12, 36);
        }
    }
    _drawSolarTurbine(ctx, progress) {
        const ease = easeOutCubic(progress);
        ctx.save();
        ctx.scale(ease * 3.2, ease * 3.2);
        ctx.rotate(this.centerAngle);
        ctx.translate(-this.solarRecoil, 0);
        ctx.fillStyle = RenderUtils.getMetalGradient ? RenderUtils.getMetalGradient(ctx, 30, 0, 60) : "#555";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(20, -18);
        ctx.lineTo(95, -40);
        ctx.lineTo(105, -18);
        ctx.lineTo(30, -6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(20, 18);
        ctx.lineTo(95, 40);
        ctx.lineTo(105, 18);
        ctx.lineTo(30, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = RenderUtils.getTubeGradient ? RenderUtils.getTubeGradient(ctx, 30, -25, 90, -25) : "#333";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(30, -28);
        ctx.lineTo(85, -31);
        ctx.stroke();
        ctx.save();
        ctx.translate(95, 0);
        const carcGrad = ctx.createRadialGradient(-20, -20, 0, 0, 0, 65);
        carcGrad.addColorStop(0, "#777");
        carcGrad.addColorStop(.5, "#222");
        carcGrad.addColorStop(1, "#020202");
        ctx.fillStyle = carcGrad;
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        const rivets = [];
        for (let i = 0; i < 12; i++) {
            const a = Math.PI / 6 * i;
            rivets.push({
                x: Math.cos(a) * 52,
                y: Math.sin(a) * 52
            });
        }
        if (RenderUtils.drawRivets) RenderUtils.drawRivets(ctx, rivets);
        ctx.restore();
        ctx.save();
        ctx.translate(105, 0);
        const turbineRot = Date.now() * (.01 + this.turbineSpeed);
        ctx.rotate(turbineRot);
        const numBlades = 16;
        for (let i = 0; i < numBlades; i++) {
            ctx.save();
            ctx.rotate(Math.PI * 2 / numBlades * i);
            const gBlade = ctx.createLinearGradient(15, 0, 55, 0);
            let colA = "#111", colB = "#555";
            if (this.chargeBrightness > .5) {
                colA = "#80f";
                colB = "#f0f";
            }
            gBlade.addColorStop(0, colA);
            gBlade.addColorStop(.5, colB);
            gBlade.addColorStop(1, "#000");
            ctx.fillStyle = gBlade;
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(15, -3);
            ctx.lineTo(55, -10);
            ctx.lineTo(60, 0);
            ctx.lineTo(55, 10);
            ctx.lineTo(15, 3);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            if (this.chargeBrightness > .2) {
                ctx.fillStyle = `rgba(180,0,255,${this.chargeBrightness * .4})`;
                ctx.fillRect(20, -2, 35, 4);
            }
            ctx.restore();
        }
        ctx.restore();
        ctx.save();
        ctx.translate(105, 0);
        if (this.chargeBrightness > .05) {
            const chargeRadius = 110 * this.chargeBrightness;
            const glowGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, chargeRadius + 35 * Math.random());
            glowGrad.addColorStop(0, "#ffffff");
            glowGrad.addColorStop(.15, "#ffffaa");
            glowGrad.addColorStop(.45, "#ffaa00");
            glowGrad.addColorStop(.75, "#ff3300");
            glowGrad.addColorStop(1, "rgba(255, 0, 0, 0)");
            ctx.save();
            ctx.shadowColor = "#ffaa00";
            ctx.shadowBlur = 90 * this.chargeBrightness;
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(0, 0, chargeRadius + 45, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            if (this.chargeBrightness > .3) {
                ctx.save();
                ctx.rotate(Date.now() * .006);
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 3 + Math.random() * 4;
                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const a = Math.PI / 4 * i;
                    ctx.moveTo(Math.cos(a) * chargeRadius * .3, Math.sin(a) * chargeRadius * .3);
                    ctx.lineTo(Math.cos(a) * chargeRadius * 1.6, Math.sin(a) * chargeRadius * 1.6);
                }
                ctx.stroke();
                ctx.restore();
                ctx.fillStyle = `rgba(255, 255, 255, ${this.chargeBrightness})`;
                ctx.beginPath();
                ctx.arc(0, 0, chargeRadius * .4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        const centerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
        centerGrad.addColorStop(0, "#555");
        centerGrad.addColorStop(1, "#111");
        ctx.fillStyle = centerGrad;
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#0ff";
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.restore();
    }
    draw(ctx) {
        if (!this._alive) return;
        for (const b of this.bullets) {
            if (typeof b.draw === "function") b.draw(ctx);
        }
        for (const e of this.effects) {
            if (typeof e.draw === "function") e.draw(ctx);
        }
        ctx.save();
        let shakeX = (this.services && this.services.screenShake ? this.services.screenShake : 0) + (Math.random() - .5) * this.vibration;
        let shakeY = (this.services && this.services.screenShake ? this.services.screenShake : 0) + (Math.random() - .5) * this.vibration;
        const floatY = Math.sin(Date.now() / 600) * 8;
        if (this.vibration > 0) this.vibration *= .9;
        ctx.translate(this.x + shakeX, this.y + shakeY + floatY);
        ctx.save();
        ctx.scale(this.scale, this.scale);
        if (this.cacheSilo) {
            ctx.drawImage(this.cacheSilo, -180, -180);
        }
        const capsuleEase = Math.sin(this.animCapsule * Math.PI / 2);
        const plateGrad = ctx.createLinearGradient(15, -15, 165, 50);
        plateGrad.addColorStop(0, "#8c9fb8");
        plateGrad.addColorStop(.5, "#3e4d6b");
        plateGrad.addColorStop(1, "#161e30");
        for (let i = 0; i < 8; i++) {
            ctx.save();
            const angleRot = Math.PI / 4 * i + capsuleEase * Math.PI / 8;
            const dist = capsuleEase * 120;
            ctx.rotate(angleRot);
            ctx.translate(dist, 0);
            ctx.fillStyle = plateGrad;
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(15, -15);
            ctx.lineTo(150, -50);
            ctx.lineTo(170, 0);
            ctx.lineTo(150, 50);
            ctx.lineTo(30, 30);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#05070a";
            ctx.fillRect(20, -5, 40, 10);
            ctx.fillStyle = "#a3b5cc";
            ctx.fillRect(30 + capsuleEase * 20, -3, 30, 6);
            if (RenderUtils.drawRivets) {
                RenderUtils.drawRivets(ctx, [ {
                    x: 40,
                    y: 25
                }, {
                    x: 80,
                    y: 40
                }, {
                    x: 120,
                    y: 48
                }, {
                    x: 40,
                    y: -22
                }, {
                    x: 80,
                    y: -38
                }, {
                    x: 120,
                    y: -48
                } ]);
            }
            ctx.strokeStyle = capsuleEase < .9 ? "#f00" : "#0ff";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(35, 20);
            ctx.lineTo(145, 46);
            ctx.stroke();
            ctx.restore();
        }
        ctx.strokeStyle = "#101520";
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(0, 0, 175, 0, Math.PI * 2);
        ctx.stroke();
        const p1 = clamp(this.animAssemble / .33);
        const p2 = clamp((this.animAssemble - .33) / .33);
        const p3 = clamp((this.animAssemble - .66) / .34);
        const pSub = clamp((this.animAssemble - .33) / .67);
        const coreEase = easeOutCubic(p1);
        const coreLift = 200 * (1 - coreEase);
        ctx.save();
        ctx.translate(0, coreLift);
        if (this.damageFlash > 0) {
            ctx.fillStyle = `rgba(255,0,0,${this.damageFlash * .7})`;
            ctx.beginPath();
            ctx.arc(0, 0, 120, 0, Math.PI * 2);
            ctx.fill();
        }
        if (p1 > 0) {
            this._drawRailsAndPipes(ctx);
            if (this.cacheChasis) {
                ctx.drawImage(this.cacheChasis, -80, -80);
            }
            ctx.save();
            const pulse = Math.sin(Date.now() / 150) * 10;
            const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.baseRadius * .6 + pulse);
            glowGrad.addColorStop(0, "#fff");
            glowGrad.addColorStop(.2, "#0ff");
            glowGrad.addColorStop(1, "transparent");
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(0, 0, this.baseRadius * .6 + pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#05070a";
            ctx.lineWidth = 3;
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
                const yPos = -this.baseRadius * .2 + i * this.baseRadius * .13;
                ctx.moveTo(-this.baseRadius * .4, yPos);
                ctx.lineTo(this.baseRadius * .4, yPos);
            }
            for (let i = 0; i < 4; i++) {
                const xPos = -this.baseRadius * .2 + i * this.baseRadius * .13;
                ctx.moveTo(xPos, -this.baseRadius * .4);
                ctx.lineTo(xPos, this.baseRadius * .4);
            }
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
        if (p1 === 1) {
            if (this.phase === 1) {
                this._drawSideCannon(ctx, true, p2);
                this._drawSideCannon(ctx, false, p2);
                ctx.save();
                const spinnerEase = easeOutCubic(p3);
                const spinnerRot = this.spinAngle + (1 - spinnerEase) * Math.PI * 2;
                const spinnerY = 80 * (1 - spinnerEase);
                ctx.translate(0, spinnerY);
                ctx.rotate(spinnerRot);
                ctx.scale(2.2, 2.2);
                ctx.fillStyle = "#1c2333";
                ctx.beginPath();
                ctx.arc(0, 0, 48, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#0ff";
                ctx.lineWidth = 2;
                ctx.stroke();
                const spinBaseGrad = ctx.createLinearGradient(-40, -40, 40, 40);
                spinBaseGrad.addColorStop(0, "#7a8ba3");
                spinBaseGrad.addColorStop(1, "#0c121e");
                ctx.fillStyle = spinBaseGrad;
                ctx.strokeStyle = "#05070a";
                ctx.lineWidth = 3;
                if (typeof drawPolygon === "function") {
                    drawPolygon(ctx, 0, 0, 42, 12, 0);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, 42, 0, Math.PI * 2);
                }
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = "#05070a";
                if (typeof drawPolygon === "function") {
                    drawPolygon(ctx, 0, 0, 26, 6, 0);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, 26, 0, Math.PI * 2);
                }
                ctx.fill();
                const isCharging = weaponIdx => this.weapon === weaponIdx && this.spinState === 2 && (this.burstCooldown > 2 || this.centerCooldown > 20);
                ctx.save();
                ctx.rotate(this.weaponAngles[0]);
                this._drawFireArm(ctx, isCharging(0));
                ctx.restore();
                ctx.save();
                ctx.rotate(this.weaponAngles[1]);
                this._drawElectricArm(ctx, isCharging(1));
                ctx.restore();
                ctx.save();
                ctx.rotate(this.weaponAngles[2]);
                this._drawBurstArm(ctx, isCharging(2));
                ctx.restore();
                ctx.fillStyle = "#1c2333";
                ctx.beginPath();
                ctx.arc(0, 0, 20, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#3e4d6b";
                ctx.lineWidth = 4;
                ctx.stroke();
                const corePulse = .6 + Math.sin(Date.now() / 100) * .4;
                ctx.fillStyle = `rgba(0,255,255,${corePulse})`;
                ctx.beginPath();
                ctx.arc(0, 0, 13, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#fff";
                ctx.beginPath();
                ctx.arc(0, 0, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                if (this.flashDespawn > 0 && this.weapon !== -1 && this.animAssemble >= 1) {
                    const color = this.weaponColors[this.weapon];
                    let rgb;
                    if (color === "#f30") rgb = "255,51,0"; else if (color === "#0af") rgb = "0,170,255"; else rgb = "255,0,255";
                    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.baseRadius * 3);
                    grad.addColorStop(0, `rgba(${rgb},${this.flashDespawn * .9})`);
                    grad.addColorStop(1, "transparent");
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(0, 0, this.baseRadius * 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (this.phase === 2) {
                const easeP2 = easeOutCubic(pSub);
                ctx.save();
                ctx.scale(easeP2, easeP2);
                ctx.translate(0, -20);
                ctx.rotate(this.p2Angle);
                if (this.cacheDodec) {
                    ctx.drawImage(this.cacheDodec, -90, -90);
                }
                for (let i = 0; i < 10; i++) {
                    ctx.save();
                    ctx.rotate(Math.PI * 2 / 10 * i);
                    const gCan = ctx.createLinearGradient(45, -8, 45, 8);
                    gCan.addColorStop(0, "#2e3a50");
                    gCan.addColorStop(1, "#0a0d14");
                    ctx.fillStyle = gCan;
                    ctx.strokeStyle = "#000";
                    ctx.lineWidth = 2;
                    ctx.fillRect(45, -8, 25, 16);
                    ctx.strokeRect(45, -8, 25, 16);
                    ctx.fillStyle = "#05070a";
                    ctx.fillRect(70, -10, 15, 20);
                    ctx.strokeRect(70, -10, 15, 20);
                    if (this.p2Timer < 180 && this.p2Timer % 15 < 5) {
                        ctx.fillStyle = "#0ff";
                        ctx.fillRect(82, -6, 4, 12);
                    }
                    ctx.restore();
                }
                let chargeP2 = 0;
                const isBigCharge = this.p2Timer >= 300 && this.p2Timer < 360;
                const isMiniCharge = this.p2Timer >= 180 && this.p2Timer < 240 || this.p2Timer >= 450 && this.p2Timer < 510;
                if (isBigCharge) chargeP2 = (this.p2Timer - 300) / 60; else if (isMiniCharge) chargeP2 = (this.p2Timer % 270 - 180) / 60;
                const pulse = Math.sin(Date.now() / 50) * 8;
                ctx.fillStyle = isBigCharge || isMiniCharge ? isBigCharge ? "rgba(255,0,0,0.6)" : "rgba(0,255,255,0.6)" : "rgba(0,255,255,0.2)";
                ctx.beginPath();
                ctx.arc(0, 0, 22 + pulse, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#fff";
                ctx.beginPath();
                ctx.arc(0, 0, 12 + pulse * .5, 0, Math.PI * 2);
                ctx.fill();
                if (chargeP2 > 0) {
                    this._drawAtomicRings(ctx, 50 * chargeP2, chargeP2, isBigCharge ? "fire" : "energy");
                }
                if (this.p2Timer < 180 && this.state !== 9) {
                    ctx.strokeStyle = "rgba(0, 255, 255, 0.6)";
                    ctx.lineWidth = 5;
                    for (let i = 0; i < 4; i++) {
                        ctx.beginPath();
                        ctx.arc(0, 0, 42 + i * 6, this.p2Angle * i, this.p2Angle * i + Math.PI);
                        ctx.stroke();
                    }
                }
                ctx.restore();
            } else if (this.phase === 3) {
                this._drawSolarTurbine(ctx, pSub);
            }
        }
        ctx.restore();
        if (this.phase === 2) {
            ctx.save();
            ctx.translate(-(this.x + shakeX), -(this.y + shakeY));
            ctx.restore();
        }
        ctx.restore();
    }
    getBullets() {
        return this.bullets;
    }
    getEffects() {
        return this.effects;
    }
}

export { Valkyrie, Valkyrie as default };

if (typeof window !== "undefined") {
    window.Valkyrie = Valkyrie;
}