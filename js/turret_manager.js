(function() {
    "use strict";
    var LEVEL_TURRETS = {
        0: [],
        1: [ {
            type: "sentinel",
            x: 2600,
            y: 460,
            hp: 60
        }, {
            type: "sentinel",
            x: 10450,
            y: 340,
            hp: 60
        }, {
            type: "wall",
            x: 16350,
            y: 340,
            hp: 60
        } ],
        2: [ {
            type: "sentinel",
            x: 2900,
            y: 460,
            hp: 60
        }, {
            type: "igneous",
            x: 5300,
            y: 460,
            hp: 60
        }, {
            type: "wall",
            x: 8e3,
            y: 460,
            hp: 60
        }, {
            type: "igneous",
            x: 11900,
            y: 220,
            hp: 60
        }, {
            type: "sentinel",
            x: 15500,
            y: 340,
            hp: 60
        }, {
            type: "igneous",
            x: 21500,
            y: 340,
            hp: 60
        }, {
            type: "sentinel",
            x: 24e3,
            y: 340,
            hp: 60
        }, {
            type: "igneous",
            x: 27500,
            y: 340,
            hp: 60
        }, {
            type: "wall",
            x: 3e4,
            y: 340,
            hp: 60
        }, {
            type: "igneous",
            x: 33500,
            y: 340,
            hp: 60
        }, {
            type: "sentinel",
            x: 36e3,
            y: 340,
            hp: 60
        } ]
    };
    function makePlayerProxy(realPlayer) {
        return {
            get x() {
                return realPlayer.x;
            },
            get y() {
                return realPlayer.y;
            },
            get w() {
                return realPlayer.w;
            },
            get h() {
                return realPlayer.h;
            },
            get width() {
                return realPlayer.w;
            },
            get height() {
                return realPlayer.h;
            },
            get takeDamage() {
                return realPlayer.takeDamage;
            }
        };
    }
    function playTurretSound(name, volume, turretX) {
        if (typeof turretX === "number" && typeof cameraX !== "undefined" && typeof VIEW_W !== "undefined") {
            if (turretX < cameraX - 100 || turretX > cameraX + VIEW_W + 100) return;
        }
        try {
            var audio = new Audio("assets/audio/turrets/" + name);
            audio.volume = Math.min(1, Math.max(0, volume || .6));
            audio.play().catch(function() {});
        } catch (e) {}
    }
    function createTurretInstance(type, x, y, hp, services) {
        var Ctor = null;
        if (type === "wall" && typeof window.WallTurret !== "undefined") Ctor = window.WallTurret; else if (type === "sentinel" && typeof window.AssaultSentinel !== "undefined") Ctor = window.AssaultSentinel; else if (type === "igneous" && typeof window.IgneousTorrent !== "undefined") Ctor = window.IgneousTorrent;
        if (!Ctor) return null;
        var t = new Ctor(x, y, services);
        t.maxHp = hp;
        t.hp = hp;
        t._level = currentLevel;
        return t;
    }
    window.TurretSystem = {
        turrets: [],
        services: null,
        _initRequested: false,
        init: function(gameRef) {
            this.turrets = [];
            var self = this;
            this.services = {
                getPlayer: function() {
                    if (!gameRef.player) return null;
                    return makePlayerProxy(gameRef.player);
                },
                playSound: function(name, volume, turretX) {
                    playTurretSound(name, volume, turretX);
                },
                createExplosion: function(x, y, radius, duration) {
                    try {
                        if (typeof createExplosion === "function") createExplosion(x, y, "#0ff", radius || 20, duration || 12);
                    } catch (e) {}
                },
                applyShake: function(intensity) {
                    try {
                        if (typeof applyShake === "function") applyShake(intensity);
                    } catch (e) {}
                },
                processGlobalDamage: function(entity, amount, type) {
                    if (entity && entity.hp !== undefined) {
                        entity.hp -= amount;
                        if (entity.hp <= 0 && entity._alive !== undefined) entity._alive = false;
                    }
                }
            };
            var spawnAll = function() {
                var configs = LEVEL_TURRETS[currentLevel] || [];
                if (typeof window.WallTurret === "undefined") return;
                configs.forEach(function(cfg) {
                    var t = createTurretInstance(cfg.type, cfg.x, cfg.y, cfg.hp, self.services);
                    if (t) self.turrets.push(t);
                });
            };
            if (typeof window.WallTurret !== "undefined") {
                spawnAll();
            } else {
                this._initRequested = true;
                window.addEventListener("wallTurretReady", function() {
                    spawnAll();
                }, {
                    once: true
                });
            }
        },
        update: function(canvasWidth, canvasHeight) {
            this.turrets.forEach(function(t) {
                if (!t || t._level !== currentLevel) return;
                if (t._dashPendingDmg) {
                    var d = t._dashPendingDmg;
                    t._dashPendingDmg = 0;
                    if (typeof t.takeDamage === "function") t.takeDamage(__godDmg(d), "energy");
                }
                if (typeof t.update === "function") t.update(canvasWidth, canvasHeight);
            });
            this.turrets = this.turrets.filter(function(t) {
                return t._alive !== false;
            });
        },
        draw: function(ctx, cameraX) {
            var self = this;
            this.turrets.forEach(function(t) {
                if (!t || t._level !== currentLevel || !t._alive) return;
                ctx.save();
                ctx.translate(-cameraX, 0);
                t.draw(ctx);
                ctx.restore();
                if (!t._buried) self._drawHealthBar(ctx, t, cameraX);
            });
        },
        _drawHealthBar: function(ctx, turret, cameraX) {
            var sx = turret.x - cameraX;
            var bw = 50, bh = 6;
            var bx = sx - bw / 2;
            var by = turret.y - 52 * turret.scale;
            var hp = turret.hp / turret.maxHp;
            var col = hp > .5 ? "#0ff" : hp > .25 ? "#ffa500" : "#ff3300";
            ctx.save();
            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
            ctx.fillStyle = col;
            ctx.shadowColor = col;
            ctx.shadowBlur = 6;
            ctx.fillRect(bx, by, bw * hp, bh);
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "#0ff";
            ctx.lineWidth = 1;
            ctx.strokeRect(bx - 1, by - 1, bw + 2, bh + 2);
            ctx.restore();
        },
        checkBulletCollisions: function(player) {
            var self = this;
            this.turrets.forEach(function(turret) {
                if (!turret || turret._level !== currentLevel || !turret.bullets) return;
                var bullets = turret.bullets;
                for (var i = bullets.length - 1; i >= 0; i--) {
                    var b = bullets[i];
                    if (!b.alive) continue;
                    var cx = Math.max(player.x, Math.min(b.x, player.x + player.w));
                    var cy = Math.max(player.y, Math.min(b.y, player.y + player.h));
                    var dist = Math.hypot(b.x - cx, b.y - cy);
                    if (dist < b.radius) {
                        if (typeof player.takeDamage === "function") player.takeDamage(b.damage || 23);
                        b.alive = false;
                        try {
                            if (typeof createExplosion === "function") createExplosion(b.x, b.y, "#0ff", 12, 8);
                        } catch (e) {}
                    }
                    if (!b.alive) bullets.splice(i, 1);
                }
            });
        },
        checkPlayerProjectileCollisions: function(projectiles) {
            this.turrets.forEach(function(turret) {
                if (!turret || turret._level !== currentLevel || !turret._alive || turret._buried) return;
                var radius = turret.baseRadius * turret.scale;
                for (var i = projectiles.length - 1; i >= 0; i--) {
                    var p = projectiles[i];
                    var px = p.x + (p.w ? p.w / 2 : 4);
                    var py = p.y + (p.h ? p.h / 2 : 4);
                    var dist = Math.hypot(px - turret.x, py - turret.y);
                    if (dist < radius + (p.w ? p.w / 2 : 4)) {
                        turret.takeDamage(__godDmg(p.damage || 1), "normal");
                        try {
                            if (typeof createExplosion === "function") createExplosion(px, py, "#0ff", 10, 6);
                        } catch (e) {}
                        projectiles.splice(i, 1);
                    }
                }
            });
        },
        clear: function() {
            this.turrets = [];
            this.services = null;
        }
    };
})();