class Fireball {
    constructor(x, y, angle, speed = 5) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alive = true;
        this.damage = 30;
        this.age = 0;
        this.radius = 16;
        this.spawnX = x;
        this.spawnY = y;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.age++;
        const dx = this.x - this.spawnX;
        const dy = this.y - this.spawnY;
        if (this.age > 300 || dx * dx + dy * dy > 64e4) {
            this.alive = false;
        }
    }
    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.globalCompositeOperation = "lighter";
        const pulse = 1 + .25 * Math.sin(this.age * .4);
        const r = this.radius * pulse;
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        grad.addColorStop(0, "#fff");
        grad.addColorStop(.3, "#ffaa44");
        grad.addColorStop(.7, "#ff4400");
        grad.addColorStop(1, "rgba(255, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ff8844";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, r * .8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

class FireParticle {
    constructor(x, y, life = 10) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - .5) * 2;
        this.vy = -Math.random() * 2 - 1;
        this.life = life;
        this.maxLife = life;
        this.radius = 3 + Math.random() * 4;
        this.color = Math.random() > .5 ? "#f80" : "#f40";
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.radius *= .98;
        this.vy += .05;
    }
    draw(ctx) {
        if (this.life <= 0 || this.radius < .3) return;
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.x, this.y);
        ctx.fillStyle = this.color;
        ctx.shadowColor = "#f80";
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Shockwave {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.life = 12;
        this.maxLife = 12;
        this.radius = 4;
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
        ctx.strokeStyle = "#0ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

class LaserSpark {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        const speed = 2 + Math.random() * 2;
        this.vx = Math.cos(angle + (Math.random() - .5) * .8) * speed;
        this.vy = Math.sin(angle + (Math.random() - .5) * .8) * speed;
        this.color = Math.random() > .5 ? "#0ff" : "#fff";
        this.life = 8 + Math.floor(Math.random() * 6);
        this.maxLife = this.life;
        this.radius = 2;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.vx *= .96;
        this.vy *= .96;
    }
    draw(ctx) {
        if (this.life <= 0) return;
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        const r = 2 + Math.random() * 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ChargeParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.life = 15;
        this.maxLife = 15;
        this.radius = 2;
        this.color = "#0ff";
    }
    update() {
        this.life--;
        this.radius += .3;
    }
    draw(ctx) {
        if (this.life <= 0) return;
        const alpha = this.life / this.maxLife * .6;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.x, this.y);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class IgneousTorrent {
    constructor(x, y, services = {}) {
        this.x = x;
        this.y = y;
        this.targetY = y;
        this.scale = .55;
        this.baseRadius = 45;
        this.barrelLength = 55;
        this.width = 60 * this.scale;
        this.height = 60 * this.scale;
        this.vibration = 0;
        this.maxHp = 60;
        this.hp = 60;
        this._alive = true;
        this.angle = Math.PI / 2;
        this.cooldown = 0;
        this.shootSpeed = 80;
        this.recoil = 0;
        this.bullets = [];
        this.effects = [];
        this.ownEffects = [];
        this.deployState = 0;
        this.animCover = 0;
        this.animScale = 0;
        this.animOpen = 0;
        this.waitTimer = 0;
        this.activationFlash = 0;
        this.electricalFail = 0;
        this.detectionRange = 500;
        this._hasPlayedSpawnSound = false;
        this._buried = true;
        this.burstCount = 0;
        this.burstInterval = 0;
        this.burstActive = false;
        this._frameCount = 0;
        this._cacheReady = false;
        this._gradients = {};
        this.services = services;
        this.getPlayer = services.getPlayer || (() => null);
        this.playSound = services.playSound || (() => {});
        this.createExplosion = services.createExplosion || (() => {});
        this.processGlobalDamage = services.processGlobalDamage || ((entity, amount, type) => {
            if (entity.hp !== undefined) {
                entity.hp -= amount;
                if (entity.hp <= 0 && entity._alive !== undefined) {
                    entity._alive = false;
                }
            }
        });
        this.cacheChasis = services.cacheChasis;
    }
    _initCache(ctx) {
        if (this._cacheReady) return;
        const r = this.baseRadius;
        this._gradients.foso = ctx.createRadialGradient(0, 0, r * .2, 0, 0, r * 1.2);
        this._gradients.foso.addColorStop(0, "#3a0500");
        this._gradients.foso.addColorStop(.8, "#5a1000");
        this._gradients.foso.addColorStop(1, "rgba(0,0,0,0)");
        this._gradients.body = ctx.createLinearGradient(0, -28, 0, 28);
        this._gradients.body.addColorStop(0, "#3a0a0a");
        this._gradients.body.addColorStop(.15, "#ff8a5a");
        this._gradients.body.addColorStop(.4, "#8b2a1a");
        this._gradients.body.addColorStop(.8, "#3a0a0a");
        this._gradients.body.addColorStop(.9, "#d65a3a");
        this._gradients.body.addColorStop(1, "#000");
        this._gradients.flash = ctx.createRadialGradient(0, 0, 0, 0, 0, 5 * r);
        this._gradients.flash.addColorStop(0, "rgba(255,200,100,1)");
        this._gradients.flash.addColorStop(.15, "rgba(255,80,0,0.9)");
        this._gradients.flash.addColorStop(.6, "rgba(255,80,0,0.2)");
        this._gradients.flash.addColorStop(1, "transparent");
        this._panelData = [];
        for (let j = 0; j < 4; j++) {
            const a = Math.PI / 2 * j;
            this._panelData.push({
                cos: Math.cos(a + Math.PI / 4),
                sin: Math.sin(a + Math.PI / 4),
                panel: a
            });
        }
        this._cacheReady = true;
    }
    get alive() {
        return this._alive;
    }
    set alive(value) {
        if (value === false && this._alive === true) {
            this.takeDamage(1, "normal");
        } else {
            this._alive = value;
        }
    }
    takeDamage(amount, type) {
        if (!this._alive) return;
        if (typeof this.processGlobalDamage === "function") {
            this.processGlobalDamage(this, amount, type);
        } else {
            this.hp -= amount;
        }
        this.vibration = 8;
        for (let i = 0; i < 4; i++) {
            this.effects.push(new LaserSpark(this.x, this.y, i * Math.PI / 2));
        }
        if (this.hp <= 0) {
            this._alive = false;
            if (typeof this.playSound === "function") {
                this.playSound("boss_explosion.mp3", .8);
            }
            if (typeof this.createExplosion === "function") {
                this.createExplosion(this.x, this.y, 30, 70);
            }
        }
    }
    addEffect(effect) {
        this.effects.push(effect);
    }
    update(canvasWidth, canvasHeight) {
        if (!this._alive) return;
        this._frameCount++;
        for (let i = this.ownEffects.length - 1; i >= 0; i--) {
            const e = this.ownEffects[i];
            if (typeof e.update === "function") {
                if (e.tx !== undefined) {
                    const px = this.x + Math.cos(this.angle) * (.8 * this.barrelLength * this.scale);
                    const py = this.y + Math.sin(this.angle) * (.8 * this.barrelLength * this.scale);
                    e.update(px, py);
                } else {
                    e.update();
                }
            }
            if (e.life <= 0) {
                this.ownEffects.splice(i, 1);
            }
        }
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
        const damageTaken = this.maxHp - this.hp;
        const dmgFrac = damageTaken / this.maxHp;
        if (damageTaken > 0 && this._frameCount % 15 === 0) {
            this.effects.push(new LaserSpark(this.x + (this._frameCount % 7 - 3) * 8, this.y + (this._frameCount % 11 - 5) * 6, this._frameCount * .3));
            this.electricalFail = 3;
        }
        if (this.electricalFail > 0) this.electricalFail--;
        if (this.activationFlash > 0) this.activationFlash -= .05;
        const player = typeof this.getPlayer === "function" ? this.getPlayer() : null;
        switch (this.deployState) {
          case 0:
            if (player) {
                const pcx = player.x + (player.width || player.w) / 2;
                const pcy = player.y + (player.height || player.h) / 2;
                const dist = Math.hypot(pcx - this.x, pcy - this.y);
                if (dist <= this.detectionRange) {
                    this.deployState = 1;
                    this._buried = false;
                    if (!this._hasPlayedSpawnSound && typeof this.playSound === "function") {
                        this.playSound("turret_spawn.mp3", .7);
                        this._hasPlayedSpawnSound = true;
                    }
                }
            }
            break;

          case 1:
            this.animCover += .045;
            if (this.animCover >= 1) {
                this.animCover = 1;
                this.deployState = 2;
            }
            break;

          case 2:
            this.animScale += .06;
            if (this.animScale >= 1) {
                this.animScale = 1;
                this.deployState = 3;
            }
            break;

          case 3:
            this.animOpen += .03;
            if (this._frameCount % 10 === 0 && this.ownEffects.length < 2) {
                const px = this.x + Math.cos(this.angle) * (.8 * this.barrelLength * this.scale);
                const py = this.y + Math.sin(this.angle) * (.8 * this.barrelLength * this.scale);
                this.ownEffects.push(new ChargeParticle(px, py));
            }
            if (player) {
                const dx = player.x + player.width / 2 - this.x;
                const dy = player.y + player.height / 2 - this.y;
                let targetAngle = Math.atan2(dy, dx);
                let diff = targetAngle - this.angle;
                while (diff < -Math.PI) diff += 2 * Math.PI;
                while (diff > Math.PI) diff -= 2 * Math.PI;
                this.angle += .05 * diff + (dmgFrac >= .5 ? (this._frameCount % 13 - 6) * .001 : 0);
            }
            if (this.animOpen >= 1) {
                this.animOpen = 1;
                this.deployState = 4;
                this.activationFlash = 1;
                this.burstCount = 3;
                this.burstActive = true;
                this.burstInterval = 0;
                this.cooldown = 0;
            }
            break;

          case 4:
            if (player) {
                const dx = player.x + player.width / 2 - this.x;
                const dy = player.y + player.height / 2 - this.y;
                let targetAngle = Math.atan2(dy, dx);
                let diff = targetAngle - this.angle;
                while (diff < -Math.PI) diff += 2 * Math.PI;
                while (diff > Math.PI) diff -= 2 * Math.PI;
                this.angle += .1 * diff + (dmgFrac >= .5 ? (this._frameCount % 11 - 5) * 8e-4 : 0);
            }
            if (this.burstActive) {
                if (this.burstInterval <= 0) {
                    if (this.burstCount > 0) {
                        const px = this.x + Math.cos(this.angle) * (this.barrelLength * this.scale);
                        const py = this.y + Math.sin(this.angle) * (this.barrelLength * this.scale);
                        const bullet = new Fireball(px, py, this.angle, 5);
                        this.bullets.push(bullet);
                        this.recoil = 15;
                        this.vibration = 3;
                        this.effects.push(new Shockwave(px, py, this.angle));
                        for (let i = 0; i < 5; i++) {
                            this.effects.push(new LaserSpark(px + (i - 2) * 2, py + (i % 3 - 1) * 2, this.angle));
                        }
                        for (let p = 0; p < 3; p++) {
                            this.effects.push(new FireParticle(px + (Math.random() - .5) * 10, py + (Math.random() - .5) * 10, 8));
                        }
                        if (typeof this.playSound === "function") {
                            this.playSound("fireball.mp3", .6, this.x);
                        }
                        this.burstCount--;
                        this.burstInterval = 20;
                    } else {
                        this.burstActive = false;
                        this.cooldown = this.shootSpeed;
                        this.burstCount = 0;
                    }
                } else {
                    this.burstInterval--;
                }
            } else {
                if (this.cooldown > 0) this.cooldown--;
                if (this.cooldown <= 0 && !this.burstActive) {
                    this.burstActive = true;
                    this.burstCount = 3;
                    this.burstInterval = 0;
                }
            }
            break;
        }
    }
    draw(ctx) {
        if (!this._alive) return;
        this._initCache(ctx);
        for (const e of this.effects) {
            if (typeof e.draw === "function") e.draw(ctx);
        }
        for (const b of this.bullets) {
            if (typeof b.draw === "function") b.draw(ctx);
        }
        for (const e of this.ownEffects) {
            if (typeof e.draw === "function") e.draw(ctx);
        }
        const damageTaken = this.maxHp - this.hp;
        const dmgFrac = damageTaken / this.maxHp;
        if (!this._randomValues) {
            this._randomValues = new Array(8).fill(0).map((_, i) => i * .19 % 1);
            this._randomFrame = 0;
        }
        this._randomFrame = (this._randomFrame || 0) + 1;
        if (this._randomFrame % 4 === 0) {
            for (let i = 0; i < this._randomValues.length; i++) {
                this._randomValues[i] = (this._randomValues[i] + .19) % 1;
            }
        }
        let ri = 0;
        ctx.save();
        let offX = 0, offY = 0;
        if (this.vibration > 0) {
            offX = 4 * (this._randomValues[ri++] - .5);
            offY = 4 * (this._randomValues[ri++] - .5);
            this.vibration--;
        }
        ctx.translate(this.x + offX, this.y + offY);
        ctx.scale(this.scale, this.scale);
        if (this.cacheChasis && !this._buried) {
            ctx.drawImage(this.cacheChasis, -80, -80);
        }
        if (this._buried) {
            ctx.beginPath();
            ctx.arc(0, 0, this.baseRadius + 8, 0, Math.PI * 2);
            ctx.fillStyle = this._gradients.foso;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, 0, this.baseRadius - 6, 0, Math.PI * 2);
            ctx.fillStyle = "#1c0800";
            ctx.fill();
            ctx.strokeStyle = "#5a1a00";
            ctx.lineWidth = 2;
            ctx.stroke();
            const blink = .3 + .7 * (Math.sin(this._frameCount * .09) + 1) / 2;
            ctx.save();
            ctx.globalAlpha = blink;
            ctx.fillStyle = "#ff8844";
            ctx.shadowColor = "#ff8844";
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        if (this.animCover > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, this.baseRadius + 8, 0, Math.PI * 2);
            ctx.fillStyle = this._gradients.foso;
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#5a1a00";
            ctx.beginPath();
            ctx.arc(0, 0, this.baseRadius - 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        if (this.animScale > 0) {
            ctx.save();
            const scaleFactor = Math.sin(this.animScale * Math.PI / 2);
            ctx.scale(scaleFactor, scaleFactor);
            ctx.rotate(this.angle);
            if (this.deployState >= 3 && this.electricalFail <= 0 && this.animOpen > .1) {
                ctx.save();
                ctx.globalCompositeOperation = "lighter";
                ctx.beginPath();
                ctx.arc(0, 0, 42, 0, Math.PI * 2);
                ctx.strokeStyle = "rgba(255,80,0,0.3)";
                ctx.lineWidth = 3;
                ctx.stroke();
                ctx.restore();
            }
            const recoil = this.recoil;
            const extension = 25 + 30 * Math.sin(this.animOpen * Math.PI / 2);
            ctx.fillStyle = dmgFrac >= .75 ? "#7a1a0a" : this._gradients.body;
            ctx.strokeStyle = "#5a1a0a";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-25 - recoil, -22);
            ctx.lineTo(extension - 10 - recoil, -16);
            ctx.lineTo(extension - 10 - recoil, 16);
            ctx.lineTo(-25 - recoil, 22);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            if (dmgFrac >= .5) {
                ctx.strokeStyle = "#000";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(0 - recoil, -12);
                ctx.lineTo(12 - recoil, 6);
                ctx.stroke();
            }
            ctx.fillStyle = "#4a1a00";
            ctx.fillRect(-14 - recoil, -20, extension - 5, 6);
            ctx.fillRect(-14 - recoil, 14, extension - 5, 6);
            for (let d = -14; d < extension; d += 12) {
                ctx.beginPath();
                ctx.moveTo(d - recoil, -20);
                ctx.lineTo(d + 4 - recoil, -14);
                ctx.lineTo(d - 4 - recoil, -14);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(d - recoil, 20);
                ctx.lineTo(d + 4 - recoil, 14);
                ctx.lineTo(d - 4 - recoil, 14);
                ctx.fill();
            }
            ctx.fillStyle = dmgFrac >= .75 ? "#2a0a00" : "#4a1a0a";
            ctx.strokeStyle = "#ff8a5a";
            ctx.lineWidth = 1;
            if (typeof ctx.roundRect === "function") {
                ctx.beginPath();
                ctx.roundRect(extension - 14 - recoil, -18, 22, 36, 5);
                ctx.fill();
                ctx.stroke();
            } else {
                ctx.fillRect(extension - 14 - recoil, -18, 22, 36);
                ctx.strokeRect(extension - 14 - recoil, -18, 22, 36);
            }
            ctx.fillStyle = "#d65a3a";
            ctx.beginPath();
            ctx.arc(0, 0, 28, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = "#2a0000";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, 2 * Math.PI);
            ctx.stroke();
            const glowing = this.burstActive || this.cooldown <= 30;
            ctx.fillStyle = "#2a0500";
            ctx.beginPath();
            ctx.arc(-2, 0, 15, 0, 2 * Math.PI);
            ctx.fill();
            if ((this.animOpen > .1 || glowing) && this.electricalFail <= 0) {
                ctx.save();
                ctx.globalCompositeOperation = "lighter";
                ctx.fillStyle = glowing ? "#ff8844" : "rgba(255,80,0,0.8)";
                ctx.beginPath();
                ctx.arc(-2, 0, 7, 0, 2 * Math.PI);
                ctx.fill();
                ctx.restore();
            }
            ctx.fillStyle = "rgba(255, 80, 0, 0.8)";
            ctx.beginPath();
            ctx.ellipse(-7, -6, 7, 3.5, Math.PI / 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(-9, -8, 2.5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = "#4a2a0a";
            ctx.save();
            ctx.translate(-14, -32);
            ctx.rotate(-.3);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(22, -12);
            ctx.lineTo(4, -4);
            ctx.fill();
            ctx.restore();
            ctx.save();
            ctx.translate(14, -32);
            ctx.rotate(.3);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-22, -12);
            ctx.lineTo(-4, -4);
            ctx.fill();
            ctx.restore();
            ctx.restore();
        }
        const coverFactor = Math.sin(this.animCover * Math.PI / 2);
        const openDistance = 70 * coverFactor;
        if (coverFactor > .01) {
            ctx.save();
            ctx.rotate(coverFactor * (Math.PI / 8));
            const compRadius = this.baseRadius + 16;
            const destIndex = dmgFrac >= .75 ? 3 : dmgFrac >= .5 ? 2 : dmgFrac >= .25 ? 1 : -1;
            for (let j = 0; j < 4; j++) {
                const d = this._panelData[j];
                ctx.save();
                ctx.translate(d.cos * openDistance, d.sin * openDistance);
                if (j === destIndex || dmgFrac >= .5 && j === 2 || dmgFrac >= .75 && j === 0) {
                    ctx.fillStyle = "#1a0500";
                    ctx.strokeStyle = "#600";
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(d.cos * 14, d.sin * 14);
                    ctx.lineTo(d.cos * 24, d.sin * 24);
                    ctx.lineTo(d.cos * 7, d.sin * 20);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                } else {
                    ctx.fillStyle = "#5a1a00";
                    ctx.strokeStyle = "#883322";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(d.cos * 14, d.sin * 14);
                    ctx.lineTo(compRadius * d.cos, compRadius * d.sin);
                    ctx.arc(0, 0, compRadius, d.panel, d.panel + Math.PI / 2);
                    ctx.lineTo(d.cos * 7, d.sin * 18);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    ctx.fillStyle = "#4a1a00";
                    ctx.beginPath();
                    ctx.arc(d.cos * 30, d.sin * 30, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
            ctx.restore();
        }
        if (this.animCover > .3) {
            ctx.save();
            for (let p = 0; p < 6; p++) {
                const ang = p / 6 * Math.PI * 2;
                const dist = this.baseRadius + 20;
                const xS = Math.cos(ang) * dist;
                const yS = Math.sin(ang) * dist;
                ctx.fillStyle = "#ffcc66";
                ctx.beginPath();
                ctx.moveTo(xS, yS);
                ctx.lineTo(xS + Math.cos(ang + .4) * 10, yS + Math.sin(ang + .4) * 10);
                ctx.lineTo(xS + Math.cos(ang - .4) * 10, yS + Math.sin(ang - .4) * 10);
                ctx.fill();
            }
            ctx.restore();
        }
        if (this.activationFlash > .05 && this.electricalFail <= 0) {
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = this.activationFlash * .4;
            ctx.beginPath();
            ctx.arc(0, 0, 3 * this.baseRadius, 0, 2 * Math.PI);
            ctx.fillStyle = this._gradients.flash;
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    }
    forceShoot() {
        if (this.deployState === 4 && this._alive) {
            const px = this.x + Math.cos(this.angle) * (this.barrelLength * this.scale);
            const py = this.y + Math.sin(this.angle) * (this.barrelLength * this.scale);
            this.bullets.push(new Fireball(px, py, this.angle, 5));
            this.recoil = 15;
            this.vibration = 3;
            this.effects.push(new Shockwave(px, py, this.angle));
            for (let i = 0; i < 5; i++) {
                this.effects.push(new LaserSpark(px + (i - 2) * 2, py + (i % 3 - 1) * 2, this.angle));
            }
            if (typeof this.playSound === "function") {
                this.playSound("fireball.mp3", .6, this.x);
            }
            return true;
        }
        return false;
    }
    getBullets() {
        return this.bullets;
    }
    getEffects() {
        return this.effects;
    }
}

export { IgneousTorrent, IgneousTorrent as default };

if (typeof window !== "undefined") {
    window.IgneousTorrent = IgneousTorrent;
}