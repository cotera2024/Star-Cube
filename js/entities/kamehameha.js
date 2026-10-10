class KamehamehaBeam {
    constructor(player, dirX, dirY) {
        this.player = player;
        this.dirX = (dirX === 0 && dirY === 0) ? (player ? player.facing : 1) : dirX;
        this.dirY = dirY;
        this.active = true;
        this.duration = 100; 
        this.maxDuration = 100;
        this.tickCounter = 0;
        this.damage = 8.8; 
        this.beamLength = 1500; 
        this.beamHeight = 32; 
        this.bubbles = [];
        const bubbleCount = 50;
        for (let i = 0; i < bubbleCount; i++) {
            this.bubbles.push({
                dist: Math.random() * this.beamLength,
                speed: 28 + Math.random() * 20, 
                yOffset: (Math.random() - 0.5) * 18,
                waveAmp: 4 + Math.random() * 8,
                waveFreq: 0.025 + Math.random() * 0.035,
                phase: Math.random() * Math.PI * 2,
                radius: 4 + Math.random() * 8,
                pulseSpeed: 0.18 + Math.random() * 0.15
            });
        }
        if (typeof applyShake === "function") applyShake(6);
        try {
            if (typeof playSound === "function") {
                playSound(120, 0.8, "sawtooth", 0.5, 40);
                playSound(900, 0.45, "sine", 0.4, 250);
            }
            if (typeof playSFX === "function") {
                playSFX("sfx_max_charge_shot");
            }
        } catch (e) {}
        const origin = this.getOrigin();
        if (typeof particles !== "undefined" && Array.isArray(particles)) {
            for (let i = 0; i < 30; i++) {
                const ang = Math.random() * Math.PI * 2;
                const spd = 4 + Math.random() * 9;
                particles.push({
                    x: origin.x,
                    y: origin.y,
                    vx: Math.cos(ang) * spd,
                    vy: Math.sin(ang) * spd,
                    life: 18,
                    maxLife: 18,
                    color: ["#00ffff", "#ffffff", "#0088ff", "#38bdf8", "#ffd700"][Math.floor(Math.random() * 5)],
                    glow: 1,
                    size: 3 + Math.random() * 3.5,
                    type: "spark"
                });
            }
        }
    }
    getOrigin() {
        const p = this.player;
        if (!p) return { x: 0, y: 0 };
        if (this.dirX !== 0) {
            return {
                x: this.dirX === 1 ? p.x + p.w : p.x,
                y: p.y + p.h / 2
            };
        } else {
            return {
                x: p.x + p.w / 2,
                y: this.dirY === -1 ? p.y : p.y + p.h
            };
        }
    }
    getBounds() {
        const origin = this.getOrigin();
        const halfH = this.beamHeight / 2;
        if (this.dirX === 1) {
            return { minX: origin.x, maxX: origin.x + this.beamLength, minY: origin.y - halfH, maxY: origin.y + halfH };
        } else if (this.dirX === -1) {
            return { minX: origin.x - this.beamLength, maxX: origin.x, minY: origin.y - halfH, maxY: origin.y + halfH };
        } else if (this.dirY === -1) {
            return { minX: origin.x - halfH, maxX: origin.x + halfH, minY: origin.y - this.beamLength, maxY: origin.y };
        } else {
            return { minX: origin.x - halfH, maxX: origin.x + halfH, minY: origin.y, maxY: origin.y + this.beamLength };
        }
    }
    intersects(target) {
        if (!target) return false;
        const b = this.getBounds();
        const tx = target.x || 0;
        const ty = target.y || 0;
        const tw = target.w || target.width || 32;
        const th = target.h || target.height || 32;
        return (tx < b.maxX && tx + tw > b.minX && ty < b.maxY && ty + th > b.minY);
    }
    update() {
        if (!this.active) return;
        this.duration--;
        this.tickCounter++;
        const p = this.player;
        if (p && !p.dead) {
            if (this.dirX !== 0) {
                p.vx = -this.dirX * 1.8;
            }
            if (p.vy > 0) p.vy = 0;
            p.facing = this.dirX !== 0 ? this.dirX : p.facing;
        }
        if (this.tickCounter % 4 === 0 && typeof applyShake === "function") {
            applyShake(1.5);
        }
        if (this.tickCounter % 16 === 0) {
            try {
                if (typeof playSound === "function") {
                    playSound(150 + Math.random() * 80, 0.22, "sawtooth", 0.22, 60);
                }
            } catch (e) {}
        }
        for (let b of this.bubbles) {
            b.dist += b.speed;
            if (b.dist > this.beamLength) {
                b.dist = 0;
                b.yOffset = (Math.random() - 0.5) * 18;
                b.waveAmp = 4 + Math.random() * 8;
            }
        }
        if (this.tickCounter % 4 === 0) {
            this.dealDamage();
        }
        if (this.duration <= 0) {
            this.active = false;
        }
    }
    dealDamage() {
        if (typeof game === "undefined" || !game) return;
        if (Array.isArray(game.enemies)) {
            for (let e of game.enemies) {
                if (!e.active || (e.dead && !e.respawning)) continue;
                if (this.intersects(e)) {
                    e.takeDamage(this.damage);
                    e.hitFlash = 5;
                    if (!e.immuneToStun && e.type !== "ghost" && e.type !== "igneous_turret" && !e.isTurret && !e.isGhost) {
                        e.stunTimer = Math.max(e.stunTimer || 0, 16);
                    }
                    if (typeof particles !== "undefined" && Array.isArray(particles) && Math.random() < 0.75) {
                        particles.push({
                            x: e.x + e.w / 2 + (Math.random() - 0.5) * e.w,
                            y: e.y + e.h / 2 + (Math.random() - 0.5) * e.h,
                            vx: (Math.random() - 0.5) * 6,
                            vy: (Math.random() - 0.5) * 6,
                            life: 10,
                            maxLife: 10,
                            color: ["#00ffff", "#ffffff", "#ffd700", "#38bdf8"][Math.floor(Math.random() * 4)],
                            glow: 1,
                            size: 3,
                            type: "spark"
                        });
                    }
                }
            }
        }
        if (typeof window.TurretSystem !== "undefined" && Array.isArray(window.TurretSystem.turrets)) {
            for (let t of window.TurretSystem.turrets) {
                if (!t || t._alive === false || t._buried) continue;
                const trad = (t.baseRadius || 36) * (t.scale || 1);
                const tBox = { x: t.x - trad, y: t.y - trad, w: trad * 2, h: trad * 2 };
                if (this.intersects(tBox)) {
                    const dmg = typeof __godDmg === "function" ? __godDmg(this.damage || 8.8) : (this.damage || 8.8);
                    if (typeof t.takeDamage === "function") {
                        t.takeDamage(dmg, "energy");
                    }
                    if (typeof particles !== "undefined" && Array.isArray(particles) && Math.random() < 0.75) {
                        particles.push({
                            x: t.x + (Math.random() - 0.5) * trad * 1.5,
                            y: t.y + (Math.random() - 0.5) * trad * 1.5,
                            vx: (Math.random() - 0.5) * 6,
                            vy: (Math.random() - 0.5) * 6,
                            life: 10,
                            maxLife: 10,
                            color: ["#00ffff", "#ffffff", "#ffd700", "#38bdf8"][Math.floor(Math.random() * 4)],
                            glow: 1,
                            size: 3,
                            type: "spark"
                        });
                    }
                }
            }
        }
        if (typeof window.HalloweenSystem !== "undefined" && typeof window.HalloweenSystem.getRebornGhosts === "function") {
            const rGhosts = window.HalloweenSystem.getRebornGhosts();
            if (Array.isArray(rGhosts)) {
                for (let g of rGhosts) {
                    if (!g || !g.active) continue;
                    if (this.intersects(g)) {
                        if (typeof window.HalloweenSystem.takeGhostDamage === "function") {
                            window.HalloweenSystem.takeGhostDamage(g, this.damage || 8.8);
                        } else {
                            g.health = 0;
                            g.active = false;
                        }
                        if (typeof particles !== "undefined" && Array.isArray(particles) && Math.random() < 0.75) {
                            particles.push({
                                x: g.x + g.w / 2 + (Math.random() - 0.5) * g.w,
                                y: g.y + g.h / 2 + (Math.random() - 0.5) * g.h,
                                vx: (Math.random() - 0.5) * 6,
                                vy: (Math.random() - 0.5) * 6,
                                life: 10,
                                maxLife: 10,
                                color: ["#00ffff", "#ffffff", "#ffd700", "#38bdf8"][Math.floor(Math.random() * 4)],
                                glow: 1,
                                size: 3,
                                type: "spark"
                            });
                        }
                    }
                }
            }
        }
        if (Array.isArray(game.platforms)) {
            for (let plat of game.platforms) {
                if (plat.dashBlock && !plat.broken && this.intersects(plat)) {
                    plat.broken = true;
                    if (typeof applyShake === "function") applyShake(8);
                    try { if (typeof playSound === "function") playSound(600, 0.2, "sawtooth", 0.3, 100); } catch (e) {}
                    if (typeof particles !== "undefined" && Array.isArray(particles)) {
                        for (let k = 0; k < 12; k++) {
                            particles.push({
                                x: plat.x + plat.w / 2,
                                y: plat.y + plat.h / 2,
                                vx: (Math.random() - 0.5) * 10,
                                vy: (Math.random() - 0.5) * 10 - 2,
                                life: 20,
                                color: plat.color || "#00ffff",
                                size: 4
                            });
                        }
                    }
                }
            }
        }
        if (game.yellowSquare && game.yellowSquare.state === "boss_fight" && this.intersects(game.yellowSquare)) {
            const ys = game.yellowSquare;
            const tickDmg = game.godMode ? 999 : 0.28; 
            ys.health -= tickDmg;
            ys.hitFlash = 5;
            if (this.tickCounter % 16 === 0 && typeof addFloatingText === "function") {
                addFloatingText(ys.x + ys.w / 2, ys.y - 10, `${Math.max(0, Math.ceil(ys.health))} / ${ys.maxHealth}`, "#ffea00", 18);
            }
            if (ys.health <= 0) {
                ys.state = "defeated";
                ys._defeatTimer = 60;
                game.arenaLocked = false;
                try {
                    stopAllSFX();
                    playBGM("bgm_world3_volcano");
                } catch (e) {}
            }
        }
        if (game.techBoss && game.techBoss.state === "fighting" && game.techBoss.vulnerable && this.intersects(game.techBoss)) {
            const tb = game.techBoss;
            const tickDmg = game.godMode ? 999 : 0.35; 
            const actual = typeof window.applyMawlerknightDamage === "function"
                ? window.applyMawlerknightDamage(tb, tickDmg, true)
                : 0;
            if (actual > 0) {
                if (this.tickCounter % 16 === 0 && typeof addFloatingText === "function") {
                    addFloatingText(tb.x + tb.w / 2, tb.y - 10, Math.ceil(tb.health) + " HP", "#00ff00", 18);
                }
            }
        }
        if (game.blueSquare && game.blueSquare.state === "boss_fight" && this.intersects(game.blueSquare)) {
            const bs = game.blueSquare;
            const tickDmg = game.godMode ? 999 : 0.25; 
            bs.health = Math.max(0, bs.health - tickDmg);
            bs.hitFlash = 5;
            if (this.tickCounter % 16 === 0 && typeof addFloatingText === "function") {
                addFloatingText(bs.x + bs.w / 2, bs.y - 10, `${Math.max(0, Math.ceil(bs.health))} / ${bs.maxHealth}`, "#00aaff", 18);
            }
            if (bs.health <= 0) {
                bs.state = "defeated";
            }
        }
        if (game.krakatoa && typeof game.krakatoa.takeDamage === "function" && this.intersects(game.krakatoa)) {
            const tickDmg = game.godMode ? 999 : 1.35; 
            game.krakatoa.takeDamage(tickDmg, 5);
            if (this.tickCounter % 16 === 0 && typeof addFloatingText === "function") {
                addFloatingText(game.krakatoa.x + (game.krakatoa.hitW || 60) / 2, (game.krakatoa.hitY || game.krakatoa.y) - 10, `${Math.max(0, Math.ceil(game.krakatoa.health))} / ${game.krakatoa.maxHealth}`, "#38bdf8", 18);
            }
        }
        if (game.pumpkinBoss && this.intersects(game.pumpkinBoss)) {
            if (game.pumpkinBoss.isVulnerable && typeof game.pumpkinBoss.takeDamage === "function") {
                const tickDmg = game.godMode ? 999 : 2.2; 
                game.pumpkinBoss.takeDamage(tickDmg, 5);
                if (this.tickCounter % 16 === 0 && typeof addFloatingText === "function") {
                    addFloatingText(game.pumpkinBoss.x + (game.pumpkinBoss.w || 60) / 2, game.pumpkinBoss.y - 10, `${Math.max(0, Math.ceil(game.pumpkinBoss.health))} / ${game.pumpkinBoss.maxHealth}`, "#f97316", 18);
                }
            } else if (typeof game.pumpkinBoss.onImmuneHit === "function" && this.tickCounter % 16 === 0) {
                game.pumpkinBoss.onImmuneHit(this);
            }
        }
        if (window.ValkyrieBoss && window.ValkyrieBoss.boss && window.ValkyrieBoss.boss._alive) {
            const vb = window.ValkyrieBoss;
            const vBoss = vb.boss;
            const camY = (game && game.camY) || 0;
            const bossWorldY = (vb.BOSS_Y || 150) + camY;
            const bounds = {
                minX: (vb.ARENA_X || 18700) - 115,
                maxX: (vb.ARENA_X || 18700) + 115,
                minY: bossWorldY - 65,
                maxY: bossWorldY + 65
            };
            const b = this.getBounds();
            if (bounds.minX < b.maxX && bounds.maxX > b.minX && bounds.minY < b.maxY && bounds.maxY > b.minY) {
                const tickDmg = game.godMode ? 999 : 4.65; 
                if (typeof vBoss.takeDamage === "function") {
                    vBoss.takeDamage(tickDmg, "normal");
                }
                if (this.tickCounter % 16 === 0 && typeof addFloatingText === "function") {
                    addFloatingText(vb.ARENA_X, bossWorldY - 40, `${Math.max(0, Math.ceil(vBoss.hp))} / ${vBoss.maxHp}`, "#00e5ff", 18);
                }
            }
        }
        const tanks = (game.techTanks && game.techTanks.length > 0) ? game.techTanks : (game.pinkSquare ? [game.pinkSquare] : []);
        for (let ps of tanks) {
            if (ps && ps.state === "hostile" && this.intersects(ps)) {
                const tickDmg = game.godMode ? 999 : 8.8;
                ps.health -= tickDmg;
                ps.hitFlash = 5;
                if (ps.health <= 0) {
                    ps.state = "destroying";
                    ps.destroyTimer = 110;
                    try {
                        applyShake(8);
                        game.flash = 6;
                        playSound(120, .4, "sawtooth", .4, 40);
                    } catch (e) {}
                }
            }
        }
        if (typeof enemyProjectiles !== "undefined" && Array.isArray(enemyProjectiles)) {
            for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
                const ep = enemyProjectiles[i];
                if (this.intersects(ep)) {
                    enemyProjectiles.splice(i, 1);
                    if (typeof particles !== "undefined" && Array.isArray(particles)) {
                        particles.push({
                            x: ep.x,
                            y: ep.y,
                            vx: (Math.random() - 0.5) * 5,
                            vy: (Math.random() - 0.5) * 5,
                            life: 8,
                            color: "#00ffff",
                            size: 3
                        });
                    }
                }
            }
        }
    }
    draw(ctx, cameraX) {
        if (!this.active) return;
        const origin = this.getOrigin();
        const ox = origin.x - cameraX;
        const oy = origin.y;
        const angle = Math.atan2(this.dirY, this.dirX);
        const len = this.beamLength;
        const h = this.beamHeight; 
        const streamH = 64; 
        ctx.save();
        ctx.translate(ox, oy);
        ctx.rotate(angle);
        const gStream = ctx.createLinearGradient(0, -streamH / 2, 0, streamH / 2);
        gStream.addColorStop(0, "rgba(0, 50, 255, 0)");
        gStream.addColorStop(0.25, "rgba(0, 120, 255, 0.22)");
        gStream.addColorStop(0.5, "rgba(0, 230, 255, 0.38)");
        gStream.addColorStop(0.75, "rgba(0, 120, 255, 0.22)");
        gStream.addColorStop(1, "rgba(0, 50, 255, 0)");
        ctx.fillStyle = gStream;
        ctx.fillRect(0, -streamH / 2, len, streamH);
        const gBeam = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
        gBeam.addColorStop(0, "rgba(0, 70, 255, 0.85)");
        gBeam.addColorStop(0.18, "#00ffff");
        gBeam.addColorStop(0.35, "#ffffff");
        gBeam.addColorStop(0.65, "#ffffff");
        gBeam.addColorStop(0.82, "#00ffff");
        gBeam.addColorStop(1, "rgba(0, 70, 255, 0.85)");
        ctx.fillStyle = gBeam;
        ctx.fillRect(0, -h / 2, len, h);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 18;
        ctx.fillRect(0, -h * 0.22, len, h * 0.44);
        ctx.shadowBlur = 0;
        const t = typeof time !== "undefined" ? time : performance.now() * 0.06;
        for (let b of this.bubbles) {
            if (b.dist < 0 || b.dist > len) continue;
            const waveY = Math.sin(t * b.pulseSpeed + b.dist * b.waveFreq + b.phase) * b.waveAmp;
            const rad = b.radius * (0.8 + 0.3 * Math.sin(t * 0.2 + b.phase));
            const gBub = ctx.createRadialGradient(b.dist, waveY, rad * 0.2, b.dist, waveY, rad);
            gBub.addColorStop(0, "#ffffff");
            gBub.addColorStop(0.45, "#00ffff");
            gBub.addColorStop(0.82, "rgba(0, 50, 255, 0.85)");
            gBub.addColorStop(1, "rgba(0, 0, 255, 0)");
            ctx.fillStyle = gBub;
            ctx.beginPath();
            ctx.arc(b.dist, waveY, rad, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let x = 0; x < len; x += 35) {
            const yTop = -h / 2 + Math.sin(t * 0.35 + x * 0.05) * 6 + (Math.random() - 0.5) * 4;
            if (x === 0) ctx.moveTo(x, yTop);
            else ctx.lineTo(x, yTop);
        }
        ctx.stroke();
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let x = 0; x < len; x += 35) {
            const yBot = h / 2 + Math.cos(t * 0.35 + x * 0.05) * 6 + (Math.random() - 0.5) * 4;
            if (x === 0) ctx.moveTo(x, yBot);
            else ctx.lineTo(x, yBot);
        }
        ctx.stroke();
        const muzzleRad = 26 + Math.sin(t * 0.4) * 3;
        const gMuzzle = ctx.createRadialGradient(0, 0, 4, 0, 0, muzzleRad * 1.5);
        gMuzzle.addColorStop(0, "#ffffff");
        gMuzzle.addColorStop(0.35, "#00ffff");
        gMuzzle.addColorStop(0.7, "rgba(0, 100, 255, 0.7)");
        gMuzzle.addColorStop(1, "rgba(0, 0, 255, 0)");
        ctx.fillStyle = gMuzzle;
        ctx.beginPath();
        ctx.arc(0, 0, muzzleRad * 1.5, 0, Math.PI * 2);
        ctx.fill();
        const ringTime = (t * 0.8) % 20;
        ctx.strokeStyle = `rgba(0, 255, 255, ${1 - ringTime / 20})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, muzzleRad + ringTime * 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}
window.KamehamehaBeam = KamehamehaBeam;
window.fireKamehamehaBeam = function(player, dirX, dirY) {
    if (typeof game === "undefined" || !game) return;
    game.kamehameha = new KamehamehaBeam(player, dirX, dirY);
};
