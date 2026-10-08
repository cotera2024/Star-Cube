(function() {
    "use strict";
    var BOSS_Y = 150;
    var ARENA_X = 18700;
    var HIT_HALF_W = 115;
    var HIT_HALF_H = 65;
    var DAMAGE_SCALE = .25;
    window.ValkyrieBoss = {
        ARENA_X: ARENA_X,
        BOSS_Y: BOSS_Y,
        boss: null,
        state: "idle",
        pillars: [],
        _game: null,
        _cameraX: 0,
        _camY: 0,
        _viewW: 960,
        _viewH: 540,
        _lastLevel: -1,
        reset: function() {
            this.state = "idle";
            this.boss = null;
            this.pillars = [];
            this._lastLevel = -1;
            if (typeof window.BossHUD !== "undefined" && typeof window.BossHUD.hide === "function") {
                window.BossHUD.hide();
            }
        },
        _playSound: function(name, volume) {
            try {
                if (window.isSoundMuted && window.isSoundMuted()) return;
                var master = typeof window.getSoundVolume === "function" ? window.getSoundVolume() : 1;
                var audio = new Audio("assets/audio/turrets/" + name);
                audio.volume = Math.min(1, Math.max(0, (volume || .6) * master));
                audio.play().catch(function() {});
            } catch (e) {}
        },
        _makeProxy: function() {
            var self = this;
            var p = this._game && this._game.player;
            if (!p) return null;
            return {
                get x() {
                    return p.x - self._cameraX;
                },
                get y() {
                    return p.y - self._camY;
                },
                get w() {
                    return p.w;
                },
                get h() {
                    return p.h;
                },
                get width() {
                    return p.w;
                },
                get height() {
                    return p.h;
                },
                get dashTimer() {
                    return p.dashTimer;
                },
                set dashTimer(v) {
                    p.dashTimer = v;
                },
                get dashMax() {
                    return p.dashMax;
                },
                set dashMax(v) {
                    p.dashMax = v;
                },
                get invulnerable() {
                    return p.invulnerable;
                },
                set invulnerable(v) {
                    p.invulnerable = v;
                },
                takeDamage: function(amount, type) {
                    if (typeof p.takeDamage === "function") p.takeDamage(amount, type);
                }
            };
        },
        trigger: function() {
            if (this.state !== "idle" || this._game && this._game.valkBossDefeated) return;
            if (this._game && this._game.valkBossDefeated) return;
            if (this.state === "fight" && this.boss && this.boss._alive) return;
            this.state = "idle";
            if (typeof window.Valkyrie === "undefined") {
                var self = this;
                window.addEventListener("wallTurretReady", function() {
                    self.trigger();
                }, {
                    once: true
                });
                return;
            }
            var self = this;
            var services = {
                getPlayer: function() {
                    return self._makeProxy();
                },
                playSound: function(name, volume) {
                    self._playSound(name, volume);
                },
                createExplosion: function(x, y, radius, duration) {
                    try {
                        if (typeof createExplosion === "function") {
                            createExplosion(x + self._cameraX, y + self._camY, "#ff6633", radius || 30, duration || 15);
                        }
                    } catch (e) {}
                },
                applyShake: function(intensity) {
                    try {
                        if (typeof applyShake === "function") applyShake(intensity);
                    } catch (e) {}
                },
                processGlobalDamage: function(entity, amount, type) {
                    if (entity && entity.hp !== undefined) {
                        entity.hp -= amount * DAMAGE_SCALE;
                    }
                }
            };
            this.boss = new window.Valkyrie(ARENA_X - this._cameraX, BOSS_Y, services);
            if (window.postGameHorror) {
                this.boss.maxHp = (this.boss.maxHp || 400) * 2;
                this.boss.hp = this.boss.maxHp;
            }
            this.boss.x = ARENA_X - this._cameraX;
            this.boss.y = BOSS_Y;
            this.boss.targetY = BOSS_Y;
            this.boss.onSolarHit = function(targetPlayer) {
                var p = (self._game && self._game.player) || targetPlayer;
                if (!p) return;
                p.invulnerable = 0;
                p.dashTimer = 0;
                p.dashMax = false;
                if (typeof p.takeDamage === "function") {
                    p.takeDamage(80, "fire");
                }
                try {
                    if (typeof applyShake === "function") applyShake(35);
                } catch (e) {}
            };
            this.boss.onSolarExplode = function(screenX, screenY, rad) {
                var wx = screenX + self._cameraX;
                var wy = screenY + self._camY;
                var r = rad || 66;
                try {
                    if (typeof createExplosion === "function") {
                        createExplosion(wx, wy, "#ff5500", 85, 35, ["#ffffff", "#ffcc00", "#ff4400", "#ff0000"]);
                        createExplosion(wx - 25, wy - 10, "#ffaa00", 65, 25);
                        createExplosion(wx + 25, wy - 10, "#ff2200", 65, 25);
                    }
                } catch (e) {}
                try {
                    if (typeof applyShake === "function") applyShake(35);
                } catch (e) {}
                self._playSound("boss_explosion.mp3", 1.0);
                try {
                    if (typeof playSound === "function") playSound(80, .5, "sawtooth", .5, 30);
                } catch (e) {}

                var p = self._game && self._game.player;
                if (p && !p.dead) {
                    var pcx = p.x + (p.w || 30) / 2;
                    var pcy = p.y + (p.h || 30) / 2;
                    var dist = Math.hypot(pcx - wx, pcy - wy);
                    if (dist < r * 1.8 + 35) {
                        p.invulnerable = 0;
                        p.dashTimer = 0;
                        p.dashMax = false;
                        if (typeof p.takeDamage === "function") {
                            p.takeDamage(80, "fire");
                        }
                    }
                }
            };
            this.boss.phase = 1;
            this.boss.state = 0;
            this._lastPhase = 1;
            try {
                if (typeof window.BossHUD !== "undefined") {
                    var bName = typeof __ === "function" ? __("boss_name_3") || "VALKYRIE CENTINELA" : "VALKYRIE CENTINELA";
                    window.BossHUD.show(bName, this.boss.hp, this.boss.maxHp, "#ff3300");
                }
            } catch (e) {}
            this.state = "fight";
        },
        update: function(gameRef, cameraX, viewW, viewH, projectiles) {
            if (typeof currentLevel === "undefined" || currentLevel !== 2) return;
            this._game = gameRef;
            this._cameraX = cameraX;
            this._camY = gameRef.camY || 0;
            this._viewW = viewW;
            this._viewH = viewH;
            if (this._lastLevel !== currentLevel) {
                this._lastLevel = currentLevel;
                this.boss = null;
                if (!gameRef.valkBossDefeated) {
                    this.state = "idle";
                }
                this.pillars = [];
            }
            if (this.state !== "fight" || !this.boss) return;
            var boss = this.boss;
            if (typeof window.BossHUD !== "undefined") {
                var hudColor = boss.phase === 1 ? "#00e5ff" : boss.phase === 2 ? "#ffaa00" : "#ff3300";
                window.BossHUD.update(boss.hp, boss.maxHp, hudColor);
            }
            boss.x = ARENA_X - cameraX;
            boss._phase2BaseY = BOSS_Y;
            boss.targetY = BOSS_Y;
            boss.y = BOSS_Y;
            var bs = boss.bullets;
            var bi;
            for (bi = 0; bi < bs.length; bi++) {
                if (bs[bi]._wx !== undefined) {
                    bs[bi].x = bs[bi]._wx - cameraX;
                    bs[bi].y = bs[bi]._wy - this._camY;
                }
            }
            boss.update(viewW, viewH);
            for (bi = 0; bi < bs.length; bi++) {
                bs[bi]._wx = bs[bi].x + cameraX;
                bs[bi]._wy = bs[bi].y + this._camY;
            }
            for (bi = bs.length - 1; bi >= 0; bi--) {
                var b = bs[bi];
                if (b.alive && b.radius > 40 && b._wy !== undefined) {
                    var hitFloor = b._wy >= 470;
                    if (!hitFloor && gameRef && Array.isArray(gameRef.platforms)) {
                        for (var pidx = 0; pidx < gameRef.platforms.length; pidx++) {
                            var plat = gameRef.platforms[pidx];
                            if (plat && !plat.isArenaGate && !plat.hammer) {
                                if (b._wx >= plat.x - 30 && b._wx <= plat.x + plat.w + 30 &&
                                    b._wy + b.radius * 0.4 >= plat.y && b._wy <= plat.y + plat.h + 15) {
                                    hitFloor = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (hitFloor) {
                        boss.onSolarExplode(b.x, b.y, b.radius);
                        bs.splice(bi, 1);
                    }
                }
            }
            var pi;
            for (pi = this.pillars.length - 1; pi >= 0; pi--) {
                var pl = this.pillars[pi];
                pl.t--;
                if (pl.t <= 0) {
                    this.pillars.splice(pi, 1);
                    continue;
                }
                if (player) {
                    pl.tick++;
                    var inX = player.x + player.w > pl.x - pl.w / 2 && player.x < pl.x + pl.w / 2;
                    if (inX && player.y < 540) {
                        var pushDir = player.x + player.w / 2 < pl.x ? -7 : 7;
                        player.vx = pushDir;
                        player.vy = Math.max(player.vy, -3);
                        if (pl.tick % 20 === 0 && typeof player.takeDamage === "function") {
                            player.takeDamage(8, "fire");
                        }
                    }
                }
            }
            if (boss.phase !== this._lastPhase) {
                this._lastPhase = boss.phase;
                try {
                    if (boss.phase === 2 && typeof showAnimatedDialogue === "function") {
                        showAnimatedDialogue( __("ui_speaker_valkyrie") || "VALKYRIE CENTINELA", "🌀", __("dlg_valkyrie_metralla"), function() {}, 3500);
                    } else if (boss.phase === 3 && typeof showAnimatedDialogue === "function") {
                        showAnimatedDialogue( __("ui_speaker_valkyrie") || "VALKYRIE CENTINELA", "☢️", __("dlg_valkyrie_aniquilacion"), function() {}, 4e3);
                    }
                } catch (e) {}
            }
            var player = gameRef.player;
            if (player) {
                var psx = player.x - cameraX;
                var psy = player.y - this._camY;
                var bullets = boss.bullets;
                for (var i = bullets.length - 1; i >= 0; i--) {
                    var b = bullets[i];
                    if (!b.alive) continue;
                    if (b.radius && b.radius > 40) continue;
                    var r = b.radius || b.r || 8;
                    var cx = Math.max(psx, Math.min(b.x, psx + player.w));
                    var cy = Math.max(psy, Math.min(b.y, psy + player.h));
                    if (Math.hypot(b.x - cx, b.y - cy) < r) {
                        if (typeof player.takeDamage === "function" && !player.frozen) player.takeDamage(b.damage || 10, "boss");
                    }
                }
            }
            if (projectiles && projectiles.length > 0) {
                var bossWorldY = BOSS_Y + this._camY;
                for (var j = projectiles.length - 1; j >= 0; j--) {
                    var pr = projectiles[j];
                    var pcx = pr.x + (pr.w ? pr.w / 2 : 4);
                    var pcy = pr.y + (pr.h ? pr.h / 2 : 4);
                    if (Math.abs(pcx - ARENA_X) < HIT_HALF_W && Math.abs(pcy - bossWorldY) < HIT_HALF_H) {
                        var bossDmg = pr.isCompanion ? 8 : (pr.chargeLevel === 4 ? 100 : (pr.damage || 1));
                        if (game.godMode) bossDmg = 999;
                        boss.takeDamage(bossDmg, "normal");
                        if (pr.chargeLevel === 4 && typeof addFloatingText === "function") {
                            addFloatingText(ARENA_X, bossWorldY - 40, "-25", "#00e5ff", 20);
                        }
                        try {
                            if (typeof createExplosion === "function") createExplosion(pr.x, pr.y, "#ff8844", 10, 6);
                        } catch (e) {}
                        projectiles.splice(j, 1);
                    }
                }
            }
            if (!boss._alive) {
                this.state = "defeated";
                this._onVictory(gameRef);
            }
        },
        _onVictory: function(gameRef) {
            try {
                if (typeof window.triggerHappyMoment === "function") window.triggerHappyMoment();
            } catch (e) {}
            try {
                game.arenaLocked = false;
            } catch (e) {}
            try {
                if (typeof window.raiseArenaHammers === "function") {
                    window.raiseArenaHammers(function() {
                        if (typeof window.hideDialogue === "function") window.hideDialogue();
                    });
                }
            } catch (e) {}
            try {
                game.valkBossDefeated = true;
            } catch (e) {}
            try {
                if (typeof window.BossHUD !== "undefined") window.BossHUD.hide();
            } catch (e) {}
            try {
                score += 500;
                if (typeof updateScore === "function") updateScore(score);
            } catch (e) {}
            try {
                if (gameRef.player && gameRef.player.health < PLAYER_MAX_HEALTH) {
                    gameRef.player.health = Math.min(PLAYER_MAX_HEALTH, gameRef.player.health + 30);
                    if (typeof window.updateHealthUI === "function") {
                        window.updateHealthUI(gameRef.player.health, PLAYER_MAX_HEALTH);
                    } else if (typeof healthFill !== "undefined" && typeof gsap !== "undefined") {
                        gsap.to(healthFill, {
                            width: gameRef.player.health / PLAYER_MAX_HEALTH * 100 + "%",
                            duration: .3
                        });
                    }
                }
            } catch (e) {}
            try {
                if (typeof stopAllSFX === "function") stopAllSFX();
            } catch (e) {}
            if (!window.postGameHorror) {
                try {
                    playBGM("bgm_world3_volcano");
                } catch (e) {}
            }
            try {
                if (typeof applyShake === "function") applyShake(30);
            } catch (e) {}
            try {
                if (typeof showAnimatedDialogue === "function") {
                    showAnimatedDialogue( __("ui_speaker_valkyrie") || "VALKYRIE CENTINELA", "💥", __("dlg_valkyrie_boom"), function() {
                        try {
                            if (typeof createExplosion === "function" && window.ValkyrieBoss && window.ValkyrieBoss.boss) {
                                var bx = window.ValkyrieBoss.boss.x + window.ValkyrieBoss._cameraX;
                                var by = window.ValkyrieBoss.boss.y + (gameRef.camY || 0);
                                createExplosion(bx, by, "#ff3300", 100, 60, [ "#ffffff", "#ff0000", "#ffaa00" ]);
                            }
                        } catch (e) {}
                        try {
                            if (typeof applyShake === "function") applyShake(50);
                        } catch (e) {}
                        try {
                            if (typeof playSound === "function") playSound(100, .8, "sawtooth", .5, 400);
                        } catch (e) {}
                        gameRef.eruptingMode = true;
                        if (typeof window.hideDialogue === "function") window.hideDialogue();
                    }, 2200);
                }
            } catch (e) {}
        },
        draw: function(ctx) {
            if (typeof currentLevel === "undefined" || currentLevel !== 2) return;
            if (this.state !== "fight" || !this.boss) return;
            var pi2;
            for (pi2 = 0; pi2 < this.pillars.length; pi2++) {
                var fp = this.pillars[pi2];
                var fx = fp.x - this._cameraX;
                if (fx < -120 || fx > this._viewW + 120) continue;
                var fade = Math.min(1, fp.t / 40);
                var grow = Math.min(1, (fp.maxT - fp.t) / 8);
                var fw = fp.w * grow * (.85 + .15 * Math.sin(Date.now() * .02 + fp.x));
                var grad = ctx.createLinearGradient(fx, 0, fx, this._viewH);
                if (window.postGameHorror) {
                    grad.addColorStop(0, "rgba(239, 68, 68, 0.98)");
                    grad.addColorStop(.3, "rgba(153, 27, 27, 0.95)");
                    grad.addColorStop(.7, "rgba(40, 5, 5, 0.98)");
                    grad.addColorStop(1, "rgba(10, 0, 0, 1)");
                } else {
                    grad.addColorStop(0, "rgba(255,255,190,0.98)");
                    grad.addColorStop(.25, "rgba(255,255,120,0.94)");
                    grad.addColorStop(.55, "rgba(255,190,50,0.9)");
                    grad.addColorStop(1, "rgba(255,80,10,0.85)");
                }
                ctx.save();
                ctx.globalAlpha = fade;
                ctx.fillStyle = grad;
                ctx.fillRect(fx - fw / 2, -20, fw, this._viewH + 20);
                ctx.globalAlpha = .92 * fade;
                ctx.fillStyle = window.postGameHorror ? "#7f1d1d" : "#fffbe0";
                ctx.fillRect(fx - fw * .13, -20, fw * .26, this._viewH + 20);
                ctx.globalAlpha = .55 * fade;
                ctx.fillStyle = window.postGameHorror ? "#2a0505" : "#ffea70";
                ctx.fillRect(fx - fw * .24, -20, fw * .48, this._viewH + 20);
                ctx.restore();
            }
            this.boss.draw(ctx);
            if (window.postGameHorror && this.boss) {
                var vx = this.boss.x;
                var vy = this.boss.y;
                var nowT = Date.now() * .005;
                ctx.save();
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(vx - 22, vy - 15);
                ctx.lineTo(vx - 5, vy + 4);
                ctx.lineTo(vx + 18, vy + 22);
                ctx.moveTo(vx + 8, vy - 25);
                ctx.lineTo(vx + 26, vy - 5);
                ctx.stroke();
                ctx.strokeStyle = "#ef4444";
                ctx.lineWidth = 1.4;
                ctx.stroke();
                ctx.strokeStyle = "#71717a";
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                var waveC = Math.sin(nowT * 4) * 4;
                ctx.moveTo(vx - 28, vy + 5);
                ctx.quadraticCurveTo(vx - 36 + waveC, vy + 20, vx - 30 + waveC, vy + 32);
                ctx.moveTo(vx + 28, vy + 8);
                ctx.quadraticCurveTo(vx + 38 - waveC, vy + 22, vx + 32 - waveC, vy + 35);
                ctx.stroke();
                if (Math.random() < .4) {
                    ctx.fillStyle = "#ff0033";
                    ctx.fillRect(vx - 31 + waveC, vy + 30, 3, 3);
                    ctx.fillRect(vx + 31 - waveC, vy + 33, 3, 3);
                }
                ctx.fillStyle = "#050505";
                ctx.beginPath();
                ctx.ellipse(vx + 9, vy - 28, 8, 7, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#991b1b";
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.fillStyle = "#f8fafc";
                ctx.beginPath();
                ctx.arc(vx + 9, vy - 28, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#990000";
                ctx.beginPath();
                ctx.arc(vx + 9, vy - 28, 1.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "rgba(15, 5, 5, 0.9)";
                ctx.beginPath();
                ctx.rect(vx + 8, vy - 22, 3, 16);
                ctx.rect(vx - 14, vy - 5, 4, 22);
                ctx.rect(vx + 16, vy + 2, 4, 18);
                ctx.fill();
                ctx.restore();
            }
        }
    };
})();
