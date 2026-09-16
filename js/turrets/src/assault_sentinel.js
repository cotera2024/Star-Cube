class SentinelElectricBullet {
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

class SentinelShockwave {
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

class SentinelLaserSpark {
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

class SentinelChargeParticle {
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

class AssaultSentinel {
    constructor(x, y, services = {}) {
        this.x = x;
        this.y = y;
        this.targetY = y;
        this.scale = .7;
        this.baseRadius = 28;
        this.barrelLength = 35;
        this.width = 45 * this.scale;
        this.height = 45 * this.scale;
        this.vibration = 0;
        this.maxHp = 60;
        this.hp = 60;
        this._alive = true;
        this.searchAngle = 0;
        this.turnSpeed = .05;
        this.shootInterval = 40;
        this.frameCounter = 0;
        this.currentBarrel = 0;
        this.recoils = [ 0, 0, 0, 0 ];
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
    }
    _initCache(ctx) {
        if (this._cacheReady) return;
        const r = this.baseRadius;
        this._gradients.foso = ctx.createLinearGradient(-40, -40, 40, 40);
        this._gradients.foso.addColorStop(0, "#000");
        this._gradients.foso.addColorStop(.5, "#080a0f");
        this._gradients.foso.addColorStop(1, "#1e2430");
        this._gradients.barrel = ctx.createLinearGradient(0, -8, 0, 8);
        this._gradients.barrel.addColorStop(0, "#080a0f");
        this._gradients.barrel.addColorStop(.2, "#6f82a1");
        this._gradients.barrel.addColorStop(.5, "#1e2430");
        this._gradients.barrel.addColorStop(1, "#000");
        this._gradients.barrelDamaged = ctx.createLinearGradient(0, -8, 0, 8);
        this._gradients.barrelDamaged.addColorStop(0, "#120a08");
        this._gradients.barrelDamaged.addColorStop(.2, "#6f82a1");
        this._gradients.barrelDamaged.addColorStop(.5, "#1e2430");
        this._gradients.barrelDamaged.addColorStop(1, "#000");
        this._gradients.core = ctx.createRadialGradient(-5, -5, 0, 0, 0, 20);
        this._gradients.core.addColorStop(0, "#3a465c");
        this._gradients.core.addColorStop(.7, "#080a0f");
        this._gradients.core.addColorStop(1, "#000");
        this._gradients.flash = ctx.createRadialGradient(0, 0, 0, 0, 0, 3 * r);
        this._gradients.flash.addColorStop(0, "rgba(255,255,255,1)");
        this._gradients.flash.addColorStop(.4, "rgba(0,255,255,0.5)");
        this._gradients.flash.addColorStop(1, "transparent");
        this._gradients.flashRed = ctx.createRadialGradient(0, 0, 0, 0, 0, 3 * r);
        this._gradients.flashRed.addColorStop(0, "rgba(255,255,255,1)");
        this._gradients.flashRed.addColorStop(.4, "rgba(255,50,50,0.5)");
        this._gradients.flashRed.addColorStop(1, "transparent");
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
            this.effects.push(new SentinelLaserSpark(this.x, this.y, i * Math.PI / 2));
        }
        if (this.hp <= 0) {
            this._alive = false;
            if (typeof this.playSound === "function") {
                this.playSound("boss_explosion.mp3", .8);
            }
            if (typeof this.createExplosion === "function") {
                this.createExplosion(this.x, this.y, 40, 80);
            }
        }
    }
    update(canvasWidth, canvasHeight) {
        if (!this._alive) return;
        this._frameCount++;
        const damageTaken = this.maxHp - this.hp;
        const dmgFrac = damageTaken / this.maxHp;
        for (let i = this.ownEffects.length - 1; i >= 0; i--) {
            const e = this.ownEffects[i];
            if (typeof e.update === "function") {
                if (e.tx !== undefined) {
                    const px = this.x + Math.cos(this.searchAngle) * (.8 * this.barrelLength * this.scale);
                    const py = this.y + Math.sin(this.searchAngle) * (.8 * this.barrelLength * this.scale);
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
        if (damageTaken > 0 && this._frameCount % 15 === 0) {
            this.effects.push(new SentinelLaserSpark(this.x + (this._frameCount % 7 - 3) * 7, this.y + (this._frameCount % 11 - 5) * 6, this._frameCount * .3));
            this.electricalFail = 4;
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
            const tremor3 = dmgFrac >= .5 ? (this._frameCount % 11 - 5) * .003 : 0;
            this.searchAngle += .3 * this.animOpen + tremor3;
            if (this._frameCount % 10 === 0 && this.ownEffects.length < 2) {
                this.ownEffects.push(new SentinelChargeParticle(this.x, this.y));
            }
            if (this.animOpen >= 1) {
                this.animOpen = 1;
                this.deployState = 4;
                this.activationFlash = 1;
                this.vibration = 6;
            }
            break;

          case 4:
            for (let i = 0; i < 4; i++) {
                if (this.recoils[i] > 0) this.recoils[i] -= 3;
            }
            const tremor4 = dmgFrac >= .5 ? (this._frameCount % 9 - 4) * .001 : 0;
            if (player) {
                const dx = player.x + player.width / 2 - this.x;
                const dy = player.y + player.height / 2 - this.y;
                let targetAngle = Math.atan2(dy, dx);
                let diff = targetAngle - this.searchAngle;
                while (diff < -Math.PI) diff += 2 * Math.PI;
                while (diff > Math.PI) diff -= 2 * Math.PI;
                this.searchAngle += .15 * diff + tremor4;
            } else {
                this.searchAngle += this.turnSpeed + tremor4;
            }
            this.frameCounter++;
            if (this.frameCounter % this.shootInterval === 0) {
                if (dmgFrac < .8 || this._frameCount % 3 !== 0) {
                    const angle = this.searchAngle + this.currentBarrel * (Math.PI / 2);
                    const px = Math.cos(angle) * (this.barrelLength * this.scale);
                    const py = Math.sin(angle) * (this.barrelLength * this.scale);
                    this.bullets.push(new SentinelElectricBullet(this.x + px, this.y + py, angle, 4));
                    this.recoils[this.currentBarrel] = 18;
                    this.effects.push(new SentinelShockwave(this.x + px, this.y + py, angle));
                    for (let s = 0; s < 3; s++) {
                        this.effects.push(new SentinelLaserSpark(this.x + px + (s - 1) * 2, this.y + py + (s - 1) * 2, angle));
                    }
                    if (typeof this.playSound === "function") {
                        this.playSound("shoot.mp3", .4, this.x);
                    }
                } else {
                    const angle = this.searchAngle + this.currentBarrel * (Math.PI / 2);
                    for (let s = 0; s < 2; s++) {
                        this.effects.push(new SentinelLaserSpark(this.x, this.y, angle + s - .5));
                    }
                }
                this.currentBarrel = (this.currentBarrel + 1) % 4;
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
            this._randomValues = new Array(8).fill(0).map((_, i) => i * .21 % 1);
            this._randomFrame = 0;
        }
        this._randomFrame = (this._randomFrame || 0) + 1;
        if (this._randomFrame % 4 === 0) {
            for (let i = 0; i < this._randomValues.length; i++) {
                this._randomValues[i] = (this._randomValues[i] + .21) % 1;
            }
        }
        let ri = 0;
        const damageTaken = this.maxHp - this.hp;
        const dmgFrac = damageTaken / this.maxHp;
        const shortCircuit = this.electricalFail > 0;
        ctx.save();
        let offX = 0, offY = 0;
        if (this.vibration > 0) {
            offX = 4 * (this._randomValues[ri++] - .5);
            offY = 4 * (this._randomValues[ri++] - .5);
            this.vibration--;
        }
        ctx.translate(Math.round(this.x + offX), Math.round(this.y + offY));
        ctx.scale(this.scale, this.scale);
        if (this._buried) {
            ctx.save();
            ctx.rotate(Math.PI / 4);
            ctx.beginPath();
            ctx.rect(-this.baseRadius - 6, -this.baseRadius - 6, 2 * (this.baseRadius + 6), 2 * (this.baseRadius + 6));
            ctx.fillStyle = "#0d1016";
            ctx.fill();
            ctx.strokeStyle = "#1e2430";
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();
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
            ctx.save();
            ctx.rotate(Math.PI / 4);
            ctx.fillStyle = this._gradients.foso;
            ctx.strokeStyle = "#050608";
            ctx.lineWidth = 4;
            const side = 2 * (this.baseRadius + 10);
            ctx.fillRect(-this.baseRadius - 10, -this.baseRadius - 10, side, side);
            ctx.strokeRect(-this.baseRadius - 10, -this.baseRadius - 10, side, side);
            ctx.strokeStyle = "#1e2430";
            ctx.lineWidth = 3;
            ctx.strokeRect(-this.baseRadius + 2, -this.baseRadius + 2, 2 * (this.baseRadius - 2), 2 * (this.baseRadius - 2));
            if (damageTaken > 0) {
                ctx.strokeStyle = "#111";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-20, 20);
                ctx.lineTo(20, -10);
                ctx.stroke();
                if (dmgFrac >= .5) {
                    ctx.strokeStyle = "#411";
                    ctx.beginPath();
                    ctx.moveTo(-15, -25);
                    ctx.lineTo(5, 10);
                    ctx.stroke();
                }
            }
            ctx.restore();
        }
        if (this.animScale > 0) {
            const scaleFactor = Math.sin(this.animScale * Math.PI / 2);
            ctx.save();
            ctx.scale(scaleFactor, scaleFactor);
            ctx.rotate(this.searchAngle);
            if (this.deployState >= 3 && !shortCircuit && this.animOpen > .1) {
                ctx.save();
                ctx.globalCompositeOperation = "lighter";
                ctx.rotate(this._randomFrame * .015);
                ctx.globalAlpha = .3 * this.animOpen;
                const ringColor = dmgFrac >= .66 ? "rgb(255,50,50)" : "rgb(0,255,255)";
                ctx.strokeStyle = ringColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, 38, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
            const baseDist = 8 + 15 * this.animOpen;
            for (let j = 0; j < 4; j++) {
                ctx.save();
                ctx.rotate(j * (Math.PI / 2));
                ctx.translate(baseDist, 0);
                const recoil = this.recoils[j];
                const damaged = dmgFrac >= (j + 2) / 6;
                ctx.fillStyle = damaged ? "#120a08" : "#1a1e26";
                ctx.fillRect(-baseDist, -4, baseDist, 8);
                ctx.fillStyle = damaged ? this._gradients.barrelDamaged : this._gradients.barrel;
                ctx.strokeStyle = "#43526e";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(0 - recoil, -8);
                ctx.lineTo(this.barrelLength - 10 - recoil, -5);
                ctx.lineTo(this.barrelLength - 10 - recoil, 5);
                ctx.lineTo(0 - recoil, 8);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = damaged ? "#0a0505" : "#080a0f";
                ctx.fillRect(this.barrelLength - 15 - recoil, -3, 8, 6);
                if (!shortCircuit && !damaged) {
                    ctx.globalCompositeOperation = "lighter";
                    const firing = this.deployState === 4 && j === this.currentBarrel && this.frameCounter % this.shootInterval > this.shootInterval - 8;
                    ctx.globalAlpha = firing ? 1 : this.animOpen * .5;
                    ctx.fillStyle = firing ? "#ffffff" : dmgFrac >= .66 ? "rgb(255,50,50)" : "rgb(0,255,255)";
                    ctx.fillRect(this.barrelLength - 14 - recoil, -1, 6, 2);
                }
                ctx.restore();
            }
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, 2 * Math.PI);
            ctx.fillStyle = this._gradients.core;
            ctx.fill();
            ctx.strokeStyle = dmgFrac >= .5 ? "#422" : "#43526e";
            ctx.lineWidth = 2;
            ctx.stroke();
            if (!shortCircuit && this.animOpen > .1) {
                ctx.save();
                ctx.globalCompositeOperation = "lighter";
                ctx.globalAlpha = this.animOpen * .5;
                const coreColor = dmgFrac >= .66 ? "rgba(255,50,50,0.6)" : "rgba(0,255,255,0.6)";
                ctx.fillStyle = coreColor;
                ctx.beginPath();
                ctx.arc(0, 0, 8, 0, 2 * Math.PI);
                ctx.fill();
                ctx.restore();
            }
            ctx.fillStyle = "#020408";
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.beginPath();
            ctx.ellipse(-3, -4, 3, 1.5, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        const coverFactor = Math.sin(this.animCover * Math.PI / 2);
        if (coverFactor > .01) {
            ctx.save();
            ctx.rotate(Math.PI / 4 + coverFactor * Math.PI / 8);
            const displacement = 40 * coverFactor;
            const panelSize = this.baseRadius + 5;
            const panelDamaged = [ dmgFrac >= .17, dmgFrac >= .66, dmgFrac >= .83, dmgFrac >= .33 ];
            for (let i = 0; i < 4; i++) {
                const px = i % 2 === 0 ? 0 + displacement : -panelSize - displacement;
                const py = i < 2 ? -panelSize - displacement : 0 + displacement;
                ctx.save();
                ctx.translate(px, py);
                if (panelDamaged[i]) {
                    ctx.fillStyle = "#0a0808";
                    ctx.strokeStyle = "#a22";
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(5, 5);
                    ctx.lineTo(panelSize * .5, 0);
                    ctx.lineTo(0, panelSize * .5);
                    ctx.lineTo(panelSize * .3, panelSize * .5);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                } else {
                    ctx.fillStyle = "#080a0f";
                    ctx.strokeStyle = "#43526e";
                    ctx.lineWidth = 1.5;
                    ctx.fillRect(0, 0, panelSize, panelSize);
                    ctx.strokeRect(0, 0, panelSize, panelSize);
                    ctx.fillStyle = "#080a0f";
                    ctx.fillRect(5, 5, panelSize - 10, panelSize - 10);
                    ctx.fillStyle = "#111";
                    ctx.fillRect(3, 3, 2, 2);
                    ctx.fillRect(panelSize - 5, panelSize - 5, 2, 2);
                }
                ctx.restore();
            }
            ctx.restore();
        }
        if (this.activationFlash > .05 && !shortCircuit) {
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = this.activationFlash * .4;
            ctx.beginPath();
            ctx.arc(0, 0, 3 * this.baseRadius, 0, 2 * Math.PI);
            ctx.fillStyle = dmgFrac >= .66 ? this._gradients.flashRed : this._gradients.flash;
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    }
    forceShoot() {
        if (this.deployState === 4 && this._alive) {
            const angle = this.searchAngle + this.currentBarrel * (Math.PI / 2);
            const px = Math.cos(angle) * (this.barrelLength * this.scale);
            const py = Math.sin(angle) * (this.barrelLength * this.scale);
            this.bullets.push(new SentinelElectricBullet(this.x + px, this.y + py, angle, 4));
            this.recoils[this.currentBarrel] = 18;
            this.effects.push(new SentinelShockwave(this.x + px, this.y + py, angle));
            for (let s = 0; s < 3; s++) {
                this.effects.push(new SentinelLaserSpark(this.x + px + (s - 1) * 2, this.y + py + (s - 1) * 2, angle));
            }
            if (typeof this.playSound === "function") {
                this.playSound("shoot.mp3", .4, this.x);
            }
            this.currentBarrel = (this.currentBarrel + 1) % 4;
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

export { AssaultSentinel, AssaultSentinel as default };

if (typeof window !== "undefined") {
    window.AssaultSentinel = AssaultSentinel;
}
// Isaac Daniel Cotera - 2026 | Correo: isaacdanielcotera@gmail.com | Itch.io: https://cotera.itch.io | GitHub: https://github.com/cotera2024
