class WallElectricBullet {
    constructor(x, y, angle, speed) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alive = true;
        this.damage = 15;
        this.radius = 8;
        this.color = "#0ff";
        this.age = 0;
        this.spawnX = x;
        this.spawnY = y;
        this.maxRange = 800;
        this.maxAge = 300;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.age++;
        const dx = this.x - this.spawnX;
        const dy = this.y - this.spawnY;
        if (this.age > this.maxAge || dx * dx + dy * dy > this.maxRange * this.maxRange) {
            this.alive = false;
        }
    }
    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.atan2(this.vy, this.vx));
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 30;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.ellipse(8, 0, 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class WallShockwave {
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

class WallLaserSpark {
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

class WallChargeParticle {
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

class WallTurret {
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
        this.fireRate = 80;
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
        this._gradients.pit = ctx.createRadialGradient(0, 0, r * .2, 0, 0, r * 1.2);
        this._gradients.pit.addColorStop(0, "#000");
        this._gradients.pit.addColorStop(.8, "#050608");
        this._gradients.pit.addColorStop(1, "rgba(0,0,0,0)");
        this._gradients.body = ctx.createLinearGradient(0, -18, 0, 18);
        this._gradients.body.addColorStop(0, "#0a0c10");
        this._gradients.body.addColorStop(.15, "#8b9bb4");
        this._gradients.body.addColorStop(.4, "#2a303c");
        this._gradients.body.addColorStop(.8, "#0a0c10");
        this._gradients.body.addColorStop(.9, "#4b5566");
        this._gradients.body.addColorStop(1, "#000");
        this._gradients.flash = ctx.createRadialGradient(0, 0, 0, 0, 0, 5 * r);
        this._gradients.flash.addColorStop(0, "rgba(255,255,255,1)");
        this._gradients.flash.addColorStop(.15, "rgba(0,255,200,0.8)");
        this._gradients.flash.addColorStop(.6, "rgba(0,255,200,0.1)");
        this._gradients.flash.addColorStop(1, "transparent");
        this._gradients.ambient = ctx.createRadialGradient(0, 0, r * .5, 0, 0, r * 2);
        this._gradients.ambient.addColorStop(0, "rgba(0,255,200,1)");
        this._gradients.ambient.addColorStop(1, "transparent");
        this._gradients.laser = ctx.createLinearGradient(this.barrelLength, 0, 1200, 0);
        this._gradients.laser.addColorStop(0, "rgba(255,255,255,1)");
        this._gradients.laser.addColorStop(.05, "rgba(0,255,200,0.6)");
        this._gradients.laser.addColorStop(1, "transparent");
        this._panelData = [];
        for (let j = 0; j < 6; j++) {
            const a = Math.PI / 3 * j;
            this._panelData.push({
                cos: Math.cos(a + Math.PI / 6),
                sin: Math.sin(a + Math.PI / 6),
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
            this.effects.push(new WallLaserSpark(this.x, this.y, i * Math.PI / 2));
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
            this.effects.push(new WallLaserSpark(this.x + (this._frameCount % 7 - 3) * 8, this.y + (this._frameCount % 11 - 5) * 6, this._frameCount * .3));
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
                const dx = pcx - this.x;
                const dy = pcy - this.y;
                const dist = Math.hypot(dx, dy);
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
            if (this._frameCount % 12 === 0 && this.ownEffects.length < 2) {
                const px = this.x + Math.cos(this.angle) * (.8 * this.barrelLength * this.scale);
                const py = this.y + Math.sin(this.angle) * (.8 * this.barrelLength * this.scale);
                this.ownEffects.push(new WallChargeParticle(px, py));
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
                this.vibration = 6;
                this.cooldown = 60;
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
                if (this.recoil > 0) this.recoil -= 2;
                if (this.cooldown > 0) this.cooldown--;
                if (this.cooldown <= 0 && Math.abs(diff) < .15) {
                    const px = this.x + Math.cos(this.angle) * (this.barrelLength * this.scale);
                    const py = this.y + Math.sin(this.angle) * (this.barrelLength * this.scale);
                    this.bullets.push(new WallElectricBullet(px, py, this.angle, 4));
                    this.recoil = 20;
                    this.vibration = 3;
                    this.effects.push(new WallShockwave(px, py, this.angle));
                    for (let a = 0; a < 6; a++) {
                        this.effects.push(new WallLaserSpark(px + (a - 2.5) * 2, py + (a % 3 - 1) * 2, this.angle));
                    }
                    if (typeof this.playSound === "function") {
                        this.playSound("shoot.mp3", .4, this.x);
                    }
                    this.cooldown = this.fireRate;
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
        if (!this._randomValues) {
            this._randomValues = new Array(12).fill(0).map((_, i) => i * .17 % 1);
            this._randomFrame = 0;
        }
        this._randomFrame = (this._randomFrame || 0) + 1;
        if (this._randomFrame % 4 === 0) {
            for (let i = 0; i < this._randomValues.length; i++) {
                this._randomValues[i] = (this._randomValues[i] + .17) % 1;
            }
        }
        let ri = 0;
        const damageTaken = this.maxHp - this.hp;
        const dmgFrac = damageTaken / this.maxHp;
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
            ctx.fillStyle = this._gradients.pit;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, 0, this.baseRadius - 6, 0, Math.PI * 2);
            ctx.fillStyle = "#141821";
            ctx.fill();
            ctx.strokeStyle = "#2a303c";
            ctx.lineWidth = 2;
            ctx.stroke();
            const blink = .3 + .7 * (Math.sin(this._frameCount * .09) + 1) / 2;
            ctx.save();
            ctx.globalAlpha = blink;
            ctx.fillStyle = "#0ff";
            ctx.shadowColor = "#0ff";
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        if (this.animCover > 0) {
            ctx.beginPath();
            ctx.arc(0, 0, this.baseRadius + 8, 0, Math.PI * 2);
            ctx.fillStyle = this._gradients.pit;
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#11141a";
            ctx.beginPath();
            ctx.arc(0, 0, this.baseRadius - 5, 0, Math.PI * 2);
            ctx.stroke();
        }
        if (this.animScale > 0) {
            const scaleFactor = Math.sin(this.animScale * Math.PI / 2);
            ctx.save();
            ctx.scale(scaleFactor, scaleFactor);
            ctx.rotate(this.angle);
            if (this.deployState >= 3 && this.electricalFail <= 0 && this.animOpen > .1) {
                ctx.save();
                ctx.globalCompositeOperation = "lighter";
                ctx.globalAlpha = this.animOpen * .3;
                ctx.beginPath();
                ctx.moveTo(this.barrelLength, 0);
                ctx.lineTo(800, 0);
                ctx.strokeStyle = this._gradients.laser;
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(0, 0, 38, 0, Math.PI * 2);
                ctx.strokeStyle = "rgba(0,255,200,0.2)";
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
            }
            const recoil = this.recoil;
            const extension = 25 + 30 * Math.sin(this.animOpen * Math.PI / 2);
            ctx.fillStyle = dmgFrac >= .75 ? "#140d0a" : this._gradients.body;
            ctx.strokeStyle = "#1a1d24";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-18 - recoil, -16);
            ctx.lineTo(extension - 8 - recoil, -12);
            ctx.lineTo(extension - 8 - recoil, 12);
            ctx.lineTo(-18 - recoil, 16);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            if (dmgFrac >= .5) {
                ctx.strokeStyle = dmgFrac >= .75 ? "#411" : "#222";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(5 - recoil, -8);
                ctx.lineTo(15 - recoil, 6);
                ctx.stroke();
            }
            ctx.fillStyle = "#1a1a1a";
            ctx.fillRect(-10 - recoil, -16, extension - 5, 5);
            ctx.fillRect(-10 - recoil, 11, extension - 5, 5);
            ctx.fillStyle = dmgFrac >= .75 ? "#110a0a" : "#1a1e26";
            ctx.strokeStyle = "#8b9bb4";
            ctx.lineWidth = 1;
            if (typeof ctx.roundRect === "function") {
                ctx.beginPath();
                ctx.roundRect(extension - 12 - recoil, -14, 18, 28, 4);
                ctx.fill();
                ctx.stroke();
            } else {
                ctx.fillRect(extension - 12 - recoil, -14, 18, 28);
                ctx.strokeRect(extension - 12 - recoil, -14, 18, 28);
            }
            ctx.fillStyle = "#4b5566";
            ctx.beginPath();
            ctx.arc(0, 0, 24, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = "#111";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 17, 0, 2 * Math.PI);
            ctx.stroke();
            const powered = this.cooldown <= 30 && this.deployState === 4;
            ctx.fillStyle = "#05080f";
            ctx.beginPath();
            ctx.arc(-2 - .1 * recoil, 0, 12, 0, 2 * Math.PI);
            ctx.fill();
            if ((this.animOpen > .1 || powered) && this.electricalFail <= 0) {
                ctx.save();
                ctx.globalCompositeOperation = "lighter";
                ctx.fillStyle = powered ? "#fff" : "rgba(0,255,200,0.7)";
                ctx.beginPath();
                ctx.arc(-2 - .1 * recoil, 0, 6, 0, 2 * Math.PI);
                ctx.fill();
                ctx.restore();
            }
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.beginPath();
            ctx.ellipse(-5, -4, 5, 2.5, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        const coverFactor = Math.sin(this.animCover * Math.PI / 2);
        if (coverFactor > .01) {
            ctx.save();
            ctx.rotate(coverFactor * (Math.PI / 6));
            const panelRadius = this.baseRadius + 16;
            const displacement = 70 * coverFactor;
            const damagedPanelIndex = dmgFrac >= .75 ? 4 : dmgFrac >= .5 ? 2 : dmgFrac >= .25 ? 0 : -1;
            for (let j = 0; j < 6; j++) {
                const d = this._panelData[j];
                ctx.save();
                ctx.translate(d.cos * displacement, d.sin * displacement);
                const isDamaged = j === damagedPanelIndex || dmgFrac >= .5 && j === 5 || dmgFrac >= .75 && j === 1;
                if (isDamaged) {
                    ctx.fillStyle = "#0a0a0a";
                    ctx.strokeStyle = "#400";
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(d.cos * 15, d.sin * 15);
                    ctx.lineTo(d.cos * 25, d.sin * 25);
                    ctx.lineTo(d.cos * 8, d.sin * 22);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                } else {
                    ctx.fillStyle = "#1a1e26";
                    ctx.strokeStyle = "#333";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(d.cos * 14, d.sin * 14);
                    ctx.lineTo(panelRadius * d.cos, panelRadius * d.sin);
                    ctx.arc(0, 0, panelRadius, d.panel, d.panel + Math.PI / 3);
                    ctx.lineTo(d.cos * 8, d.sin * 18);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    ctx.fillStyle = "#111";
                    ctx.beginPath();
                    ctx.arc(d.cos * 30, d.sin * 30, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
            ctx.restore();
        }
        if (this.activationFlash > .05 && this.electricalFail <= 0) {
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = this.activationFlash * .5;
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
            this.bullets.push(new WallElectricBullet(px, py, this.angle, 4));
            this.recoil = 20;
            this.vibration = 3;
            this.effects.push(new WallShockwave(px, py, this.angle));
            for (let a = 0; a < 6; a++) {
                this.effects.push(new WallLaserSpark(px + (a - 2.5) * 2, py + (a % 3 - 1) * 2, this.angle));
            }
            if (typeof this.playSound === "function") {
                this.playSound("shoot.mp3", .4, this.x);
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

export { WallTurret, WallTurret as default };

if (typeof window !== "undefined") {
    window.WallTurret = WallTurret;
}