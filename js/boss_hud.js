(function() {
    "use strict";
    window.BossHUD = {
        _barFill: null,
        _nameEl: null,
        _prevName: "",
        _active: false,
        show: function(name, hp, maxHp, color) {
            var el = document.getElementById("level-display");
            if (!el) return;
            this._prevName = el.textContent || "";
            el.innerHTML = '<span class="boss-hud" style="display:inline-flex;flex-direction:column;align-items:center;gap:2px;line-height:1;">' + '<span class="boss-hud-bar" style="display:block;width:150px;height:10px;border:1px solid #fff;border-radius:4px;background:rgba(0,0,0,0.78);overflow:hidden;box-shadow:0 0 6px rgba(0,0,0,0.6);">' + '<span class="boss-hud-fill" style="display:block;height:100%;width:100%;background:#ff3300;border-radius:3px;"></span>' + "</span>" + '<span class="boss-hud-name" style="display:block;font-size:9px;color:#fff;font-weight:bold;letter-spacing:0.6px;text-shadow:0 0 3px #000, 0 1px 2px #000;"></span>' + "</span>";
            this._barFill = el.querySelector(".boss-hud-fill");
            this._nameEl = el.querySelector(".boss-hud-name");
            if (this._nameEl) this._nameEl.textContent = name;
            this._active = true;
            this.update(hp, maxHp, color);
        },
        update: function(hp, maxHp, color) {
            if (!this._active || !this._barFill) return;
            var pct = maxHp > 0 ? Math.max(0, Math.min(1, hp / maxHp)) : 0;
            this._barFill.style.width = pct * 100 + "%";
            if (color) this._barFill.style.background = color;
        },
        hide: function() {
            var el = document.getElementById("level-display");
            if (!el) return;
            this._active = false;
            this._barFill = null;
            this._nameEl = null;
            var fallback = "";
            try {
                fallback = __("level_name_" + (typeof currentLevel !== "undefined" ? currentLevel + 1 : 1));
            } catch (e) {}
            el.textContent = this._prevName || fallback;
        }
    };
    var activePres = null;
    window.playBossPresentation = function(cfg, onComplete) {
        if (!cfg) cfg = {};
        var safeCinema = function(fn) {
            return typeof cinema === "function" ? cinema(fn) : fn;
        };
        if (window.game && window.game.player) {
            window.game.player.frozen = true;
            window.game.player.vx = 0;
        }
        var targetX = cfg.targetX != null ? cfg.targetX : window.game && window.game.player ? window.game.player.x : 0;
        var targetY = cfg.targetY != null ? cfg.targetY : typeof VIEW_H !== "undefined" ? VIEW_H / 2 : 270;
        var zoom = cfg.zoom || 1.45;
        var duration = cfg.duration || 3;
        if (window.game) {
            window.game.zoomTargetWorldX = targetX;
            window.game.zoomTargetWorldY = targetY;
        }
        activePres = {
            active: true,
            name: cfg.name || "JEFE",
            title: cfg.title || "",
            icon: cfg.icon || "⚔️",
            themeColor: cfg.themeColor || "#00e5ff",
            accentColor: cfg.accentColor || "#ffffff",
            letterbox: 0,
            bannerScale: .1,
            bannerAlpha: 0,
            lightAngle: 0,
            slashProgress: 0,
            particles: [],
            exiting: false
        };
        for (var i = 0; i < 28; i++) {
            activePres.particles.push({
                x: (Math.random() - .5) * 600,
                y: (Math.random() - .5) * 80,
                vx: (Math.random() - .5) * 2.8,
                vy: (Math.random() - .5) * 1.6,
                size: 2 + Math.random() * 3.5,
                color: Math.random() < .6 ? activePres.themeColor : "#ffffff",
                alpha: .4 + Math.random() * .6,
                life: Math.random() * 100
            });
        }
        if (typeof playSound === "function") {
            playSound(180, .45, "sine", .35, 75);
        }
        if (typeof gsap !== "undefined" && window.game) {
            try {
                gsap.killTweensOf(window.game);
            } catch (e) {}
            try {
                gsap.killTweensOf(activePres);
            } catch (e) {}
            gsap.to(window.game, {
                cameraOverrideX: targetX - (typeof VIEW_W !== "undefined" ? VIEW_W / 2 : 480),
                cameraZoom: zoom,
                duration: .85,
                ease: "power2.out"
            });
            gsap.to(activePres, {
                letterbox: 52,
                duration: .5,
                ease: "power2.out"
            });
            gsap.delayedCall(.5, safeCinema(function() {
                if (!activePres || !activePres.active) return;
                if (typeof applyShake === "function") applyShake(18);
                if (window.game) window.game.flash = Math.max(window.game.flash || 0, 18);
                if (typeof playSound === "function") {
                    playSound(70, .75, "sawtooth", .6, 25);
                    playSound(160, .5, "square", .4, 110);
                }
                gsap.to(activePres, {
                    bannerScale: 1,
                    bannerAlpha: 1,
                    duration: .4,
                    ease: "back.out(1.8)"
                });
            }));
            gsap.delayedCall(duration, safeCinema(function() {
                if (!activePres || !activePres.active) return;
                activePres.exiting = true;
                if (typeof playSound === "function") {
                    playSound(220, .3, "sine", .22, 420);
                }
                gsap.to(activePres, {
                    bannerAlpha: 0,
                    bannerScale: 1.25,
                    letterbox: 0,
                    duration: .4,
                    ease: "power2.in"
                });
                var px = window.game && window.game.player ? window.game.player.x : targetX;
                var py = window.game && window.game.player ? window.game.player.y : targetY;
                gsap.to(window.game, {
                    cameraZoom: 1,
                    zoomTargetWorldX: px,
                    zoomTargetWorldY: py,
                    duration: .6,
                    ease: "power2.inOut"
                });
                gsap.to(window.game, {
                    cameraOverrideX: px - (typeof VIEW_W !== "undefined" ? VIEW_W / 2 : 480),
                    duration: .6,
                    ease: "power2.inOut",
                    onComplete: safeCinema(function() {
                        if (window.game) {
                            delete window.game.cameraOverrideX;
                            delete window.game.cameraZoom;
                            delete window.game.zoomTargetWorldX;
                            delete window.game.zoomTargetWorldY;
                            if (window.game.player) window.game.player.frozen = false;
                        }
                        if (activePres) activePres.active = false;
                        activePres = null;
                        if (typeof onComplete === "function") onComplete();
                    })
                });
            }));
        } else {
            setTimeout(function() {
                if (activePres) activePres.active = false;
                activePres = null;
                if (window.game && window.game.player) window.game.player.frozen = false;
                if (typeof onComplete === "function") onComplete();
            }, 1800);
        }
    };
    window.drawBossPresentation = function(ctx) {
        if (!activePres || !activePres.active) return;
        var vw = typeof VIEW_W !== "undefined" ? VIEW_W : 960;
        var vh = typeof VIEW_H !== "undefined" ? VIEW_H : 540;
        ctx.save();
        if (activePres.letterbox > 0) {
            ctx.fillStyle = "#020308";
            ctx.fillRect(0, 0, vw, activePres.letterbox);
            ctx.fillRect(0, vh - activePres.letterbox, vw, activePres.letterbox);
            ctx.fillStyle = activePres.themeColor;
            ctx.fillRect(0, activePres.letterbox - 2, vw, 2);
            ctx.fillRect(0, vh - activePres.letterbox, vw, 2);
        }
        var cx = vw / 2;
        var cy = 405;
        activePres.lightAngle += .012;
        if (activePres.bannerAlpha > .05) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.globalAlpha = activePres.bannerAlpha * .22;
            for (var r = 0; r < 8; r++) {
                var ang = activePres.lightAngle + r * Math.PI / 4;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, 520, ang - .1, ang + .1);
                ctx.closePath();
                ctx.fillStyle = activePres.themeColor;
                ctx.fill();
            }
            ctx.restore();
        }
        if (activePres.bannerAlpha > .01) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(activePres.bannerScale, activePres.bannerScale);
            ctx.globalAlpha = Math.max(0, Math.min(1, activePres.bannerAlpha));
            var cardW = 740;
            var cardH = 110;
            ctx.shadowColor = activePres.themeColor;
            ctx.shadowBlur = 28;
            var bgGrad = ctx.createLinearGradient(0, -cardH / 2, 0, cardH / 2);
            bgGrad.addColorStop(0, "rgba(10, 12, 26, 0.95)");
            bgGrad.addColorStop(1, "rgba(4, 5, 12, 0.97)");
            ctx.fillStyle = bgGrad;
            if (typeof ctx.roundRect === "function") {
                ctx.beginPath();
                ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 10);
                ctx.fill();
            } else {
                ctx.fillRect(-cardW / 2, -cardH / 2, cardW, cardH);
            }
            ctx.shadowBlur = 0;
            ctx.strokeStyle = activePres.themeColor;
            ctx.lineWidth = 2.4;
            if (typeof ctx.roundRect === "function") {
                ctx.stroke();
            } else {
                ctx.strokeRect(-cardW / 2, -cardH / 2, cardW, cardH);
            }
            ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
            ctx.lineWidth = 1;
            if (typeof ctx.roundRect === "function") {
                ctx.beginPath();
                ctx.roundRect(-cardW / 2 + 3, -cardH / 2 + 3, cardW - 6, cardH - 6, 8);
                ctx.stroke();
            }
            ctx.fillStyle = activePres.accentColor;
            var bSize = 10;
            ctx.fillRect(-cardW / 2, -cardH / 2, bSize, 3);
            ctx.fillRect(-cardW / 2, -cardH / 2, 3, bSize);
            ctx.fillRect(cardW / 2 - bSize, -cardH / 2, bSize, 3);
            ctx.fillRect(cardW / 2 - 3, -cardH / 2, 3, bSize);
            ctx.fillRect(-cardW / 2, cardH / 2 - 3, bSize, 3);
            ctx.fillRect(-cardW / 2, cardH / 2 - bSize, 3, bSize);
            ctx.fillRect(cardW / 2 - bSize, cardH / 2 - 3, bSize, 3);
            ctx.fillRect(cardW / 2 - 3, cardH / 2 - bSize, 3, bSize);
            for (var pIdx = 0; pIdx < activePres.particles.length; pIdx++) {
                var pt = activePres.particles[pIdx];
                pt.x += pt.vx;
                pt.y += pt.vy;
                if (pt.x < -cardW / 2 + 10) pt.x = cardW / 2 - 10;
                if (pt.x > cardW / 2 - 10) pt.x = -cardW / 2 + 10;
                if (pt.y < -cardH / 2 + 5) pt.y = cardH / 2 - 5;
                if (pt.y > cardH / 2 - 5) pt.y = -cardH / 2 + 5;
                ctx.fillStyle = pt.color;
                ctx.globalAlpha = activePres.bannerAlpha * pt.alpha;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = Math.max(0, Math.min(1, activePres.bannerAlpha));
            var badgeX = -cardW / 2 + 65;
            var badgeY = 0;
            ctx.save();
            ctx.shadowColor = activePres.themeColor;
            ctx.shadowBlur = 16;
            ctx.beginPath();
            ctx.arc(badgeX, badgeY, 34, 0, Math.PI * 2);
            var badgeGrad = ctx.createRadialGradient(badgeX, badgeY, 4, badgeX, badgeY, 34);
            badgeGrad.addColorStop(0, activePres.themeColor);
            badgeGrad.addColorStop(1, "#050714");
            ctx.fillStyle = badgeGrad;
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2.2;
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.font = '36px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(activePres.icon, badgeX, badgeY + 2);
            ctx.restore();
            var textX = -cardW / 2 + 125;
            ctx.textAlign = "left";
            ctx.font = 'bold 36px "Fredoka One", "Arial Black", sans-serif';
            ctx.textBaseline = "alphabetic";
            ctx.lineJoin = "round";
            ctx.strokeStyle = "#02040a";
            ctx.lineWidth = 7;
            ctx.strokeText(activePres.name, textX, -4);
            var nameGrad = ctx.createLinearGradient(0, -35, 0, 5);
            nameGrad.addColorStop(0, "#ffffff");
            nameGrad.addColorStop(.5, "#f0faff");
            nameGrad.addColorStop(1, activePres.themeColor);
            ctx.fillStyle = nameGrad;
            ctx.shadowColor = activePres.themeColor;
            ctx.shadowBlur = 18;
            ctx.fillText(activePres.name, textX, -4);
            ctx.shadowBlur = 0;
            ctx.font = 'bold 15px "Fredoka One", sans-serif';
            ctx.fillStyle = activePres.accentColor || "#ffd700";
            ctx.shadowColor = "#000000";
            ctx.shadowBlur = 4;
            var titleStr = activePres.title;
            ctx.fillText(titleStr, textX, 26);
            ctx.shadowBlur = 0;
            ctx.restore();
        }
        ctx.restore();
    };
})();
// Isaac Daniel Cotera - 2026 | Correo: isaacdanielcotera@gmail.com | Itch.io: https://cotera.itch.io | GitHub: https://github.com/cotera2024
