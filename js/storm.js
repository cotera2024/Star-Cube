(function() {
    "use strict";
    const WIND_DIRECTIONS = [ "RIGHT", "UP", "LEFT" ];
    const WIND_DURATION = 480;
    const storm = {
        active: false,
        windDir: "RIGHT",
        windTimer: WIND_DURATION,
        windIndex: 0,
        rainDrops: [],
        windStreaks: [],
        lightningTimer: 240,
        lightningFlash: 0,
        lightningBolt: null,
        fogOffset1: 0,
        fogOffset2: 0,
        initialized: false
    };
    function initStormSystem() {
        storm.rainDrops = [];
        const numDrops = 180;
        for (let i = 0; i < numDrops; i++) {
            storm.rainDrops.push({
                x: Math.random() * VIEW_W,
                y: Math.random() * VIEW_H,
                len: 14 + Math.random() * 18,
                speed: 16 + Math.random() * 10,
                alpha: .35 + Math.random() * .45
            });
        }
        storm.windStreaks = [];
        const numStreaks = 20;
        for (let i = 0; i < numStreaks; i++) {
            storm.windStreaks.push({
                x: Math.random() * VIEW_W,
                y: Math.random() * VIEW_H,
                len: 60 + Math.random() * 90,
                speed: 12 + Math.random() * 8,
                width: 1.5 + Math.random() * 2,
                alpha: .15 + Math.random() * .25,
                waveOffset: Math.random() * Math.PI * 2
            });
        }
        storm.initialized = true;
    }
    window.initStormMode = function(force) {
        if (!storm.initialized) initStormSystem();
        storm.active = true;
        storm.windTimer = WIND_DURATION;
        storm.windIndex = 0;
        storm.windDir = WIND_DIRECTIONS[storm.windIndex];
        storm.lightningTimer = 180 + Math.floor(Math.random() * 240);
        storm.lightningFlash = 0;
        storm.lightningBolt = null;
        if (typeof game !== "undefined") {
            game.stormMode = true;
        }
        if (force) {
            try {
                applyShake(15);
                if (typeof game !== "undefined") game.flash = 25;
                playSound(90, .7, "sawtooth", .5, 30);
            } catch (e) {}
        }
    };
    window.getStormWind = function() {
        return {
            dir: storm.windDir,
            timer: storm.windTimer,
            maxTimer: WIND_DURATION,
            isChangingSoon: storm.windTimer <= 60
        };
    };
    function changeWindDirection() {
        storm.windIndex = (storm.windIndex + 1) % WIND_DIRECTIONS.length;
        storm.windDir = WIND_DIRECTIONS[storm.windIndex];
        storm.windTimer = WIND_DURATION;
        try {
            playSound(220, .4, "sine", .35, 460);
            applyShake(4);
        } catch (e) {}
        if (typeof game !== "undefined" && game.player) {
            const windNames = {
                RIGHT: __("ui_wind_right") || "➡️ VIENTO ESTE",
                LEFT: __("ui_wind_left") || "⬅️ VIENTO OESTE",
                UP: __("ui_wind_up") || "⬆️ CORRIENTE ASCENDENTE",
                DOWN: __("ui_wind_down") || "⬇️ CORRIENTE DESCENDENTE"
            };
            const col = storm.windDir === "UP" ? "#38bdf8" : storm.windDir === "DOWN" ? "#f59e0b" : "#a855f7";
            try {
                addFloatingText(game.player.x + game.player.w / 2, game.player.y - 28, windNames[storm.windDir], col, 20);
            } catch (e) {}
        }
    }
    function createLightningBolt() {
        const startX = 100 + Math.random() * (VIEW_W - 200);
        const segments = [];
        let currX = startX;
        let currY = 0;
        const targetY = VIEW_H - 70;
        while (currY < targetY) {
            const nextY = currY + 25 + Math.random() * 35;
            const nextX = currX + (Math.random() - .5) * 55;
            segments.push({
                x1: currX,
                y1: currY,
                x2: nextX,
                y2: nextY
            });
            currX = nextX;
            currY = nextY;
        }
        storm.lightningBolt = segments;
        storm.lightningFlash = 5;
    }
    window.applyStormPhysics = function(player, keys) {
        if (!player || typeof game !== "undefined" && (!game.stormMode || currentLevel !== 3)) return;
        const dir = storm.windDir;
        if (dir === "RIGHT") {
            if (keys["ArrowRight"] || keys["d"]) {
                player.vx = MOVE_SPEED * 1.55;
            } else if (keys["ArrowLeft"] || keys["a"]) {
                player.vx = -MOVE_SPEED * .45;
            } else {
                player.vx += .22;
                if (player.vx > 2) player.vx = 2;
            }
        } else if (dir === "LEFT") {
            if (keys["ArrowLeft"] || keys["a"]) {
                player.vx = -MOVE_SPEED * 1.55;
            } else if (keys["ArrowRight"] || keys["d"]) {
                player.vx = MOVE_SPEED * .45;
            } else {
                player.vx -= .22;
                if (player.vx < -2) player.vx = -2;
            }
        }
        if (dir === "UP") {
            if (!player.onGround) {
                player.vy -= GRAVITY * .52;
            }
            if (Math.random() < .35 && typeof particles !== "undefined" && Array.isArray(particles)) {
                particles.push({
                    x: player.x + Math.random() * player.w,
                    y: player.y + player.h,
                    vx: (Math.random() - .5) * 1.5,
                    vy: -(2.5 + Math.random() * 3.5),
                    life: 14,
                    maxLife: 14,
                    color: "#38bdf8",
                    size: 2.5 + Math.random() * 2.5,
                    type: "spark"
                });
            }
        }
        if (dir === "DOWN") {
            if (!player.onGround) {
                player.vy += GRAVITY * .75;
                if (player.vy > 20) player.vy = 20;
            }
            if (Math.random() < .35 && typeof particles !== "undefined" && Array.isArray(particles)) {
                particles.push({
                    x: player.x + Math.random() * player.w,
                    y: player.y - 6,
                    vx: (Math.random() - .5) * 1.5,
                    vy: 3.5 + Math.random() * 4,
                    life: 12,
                    maxLife: 12,
                    color: "#f59e0b",
                    size: 2.2 + Math.random() * 2,
                    type: "spark"
                });
            }
        }
    };
    window.updateAndDrawStorm = function(ctx, cameraX, time, player) {
        if (!storm.initialized) initStormSystem();
        if (typeof game === "undefined" || !game.stormMode || currentLevel !== 3) return;
        storm.windTimer--;
        if (storm.windTimer <= 0) {
            changeWindDirection();
        }
        storm.lightningTimer--;
        if (storm.lightningTimer <= 0) {
            createLightningBolt();
            storm.lightningTimer = 280 + Math.floor(Math.random() * 300);
            try {
                applyShake(5);
                playSound(70, .5, "sawtooth", .45, 25);
            } catch (e) {}
        }
        if (storm.lightningFlash > 0) {
            storm.lightningFlash--;
            if (storm.lightningFlash === 0) storm.lightningBolt = null;
        }
        const dir = storm.windDir;
        if (storm.lightningBolt && storm.lightningBolt.length > 0) {
            ctx.save();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 3.5;
            ctx.shadowColor = "#67e8f9";
            ctx.shadowBlur = 18;
            ctx.beginPath();
            storm.lightningBolt.forEach((seg, idx) => {
                if (idx === 0) ctx.moveTo(seg.x1, seg.y1);
                ctx.lineTo(seg.x2, seg.y2);
            });
            ctx.stroke();
            ctx.fillStyle = "rgba(215, 240, 255, 0.18)";
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            ctx.restore();
        }
        ctx.save();
        storm.windStreaks.forEach(w => {
            if (dir === "RIGHT") {
                w.x += w.speed;
                w.y += Math.sin(time * .05 + w.waveOffset) * .8;
                if (w.x > VIEW_W + 100) {
                    w.x = -100;
                    w.y = Math.random() * VIEW_H;
                }
            } else if (dir === "LEFT") {
                w.x -= w.speed;
                w.y += Math.sin(time * .05 + w.waveOffset) * .8;
                if (w.x < -100) {
                    w.x = VIEW_W + 100;
                    w.y = Math.random() * VIEW_H;
                }
            } else if (dir === "UP") {
                w.y -= w.speed * .9;
                w.x += Math.sin(time * .05 + w.waveOffset) * .8;
                if (w.y < -100) {
                    w.y = VIEW_H + 100;
                    w.x = Math.random() * VIEW_W;
                }
            } else if (dir === "DOWN") {
                w.y += w.speed * 1.3;
                w.x += Math.sin(time * .05 + w.waveOffset) * .8;
                if (w.y > VIEW_H + 100) {
                    w.y = -100;
                    w.x = Math.random() * VIEW_W;
                }
            }
            const col = dir === "UP" ? "rgba(56, 189, 248, " : dir === "DOWN" ? "rgba(245, 158, 11, " : "rgba(192, 132, 252, ";
            ctx.strokeStyle = col + w.alpha + ")";
            ctx.lineWidth = w.width;
            ctx.beginPath();
            if (dir === "RIGHT" || dir === "LEFT") {
                const len = dir === "RIGHT" ? w.len : -w.len;
                ctx.moveTo(w.x, w.y);
                ctx.quadraticCurveTo(w.x + len * .5, w.y + Math.sin(time * .08) * 6, w.x + len, w.y);
            } else {
                const len = dir === "DOWN" ? w.len : -w.len;
                ctx.moveTo(w.x, w.y);
                ctx.quadraticCurveTo(w.x + Math.sin(time * .08) * 6, w.y + len * .5, w.x, w.y + len);
            }
            ctx.stroke();
        });
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = "rgba(186, 230, 253, 0.55)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        storm.rainDrops.forEach(d => {
            let vx = 0;
            let vy = d.speed;
            if (dir === "RIGHT") {
                vx = 14;
                vy = d.speed * 1.1;
            } else if (dir === "LEFT") {
                vx = -14;
                vy = d.speed * 1.1;
            } else if (dir === "UP") {
                vx = Math.sin(d.y * .02 + time * .05) * 3;
                vy = -d.speed * .6;
            } else if (dir === "DOWN") {
                vx = 0;
                vy = d.speed * 1.6;
            }
            d.x += vx;
            d.y += vy;
            if (dir === "UP") {
                if (d.y < -30) {
                    d.y = VIEW_H + 20;
                    d.x = Math.random() * VIEW_W;
                }
            } else {
                if (d.y > VIEW_H + 30) {
                    d.y = -30;
                    d.x = Math.random() * VIEW_W;
                }
            }
            if (d.x < -30) d.x = VIEW_W + 20;
            if (d.x > VIEW_W + 30) d.x = -20;
            const tailX = d.x - vx * (d.len / d.speed);
            const tailY = d.y - vy * (d.len / d.speed);
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(tailX, tailY);
        });
        ctx.stroke();
        ctx.restore();
        storm.fogOffset1 += .45;
        storm.fogOffset2 += .25;
        ctx.save();
        const fogGrad = ctx.createLinearGradient(0, VIEW_H - 240, 0, VIEW_H);
        fogGrad.addColorStop(0, "rgba(15, 23, 42, 0)");
        fogGrad.addColorStop(.5, "rgba(56, 89, 120, 0.20)");
        fogGrad.addColorStop(1, "rgba(15, 30, 50, 0.45)");
        ctx.fillStyle = fogGrad;
        ctx.beginPath();
        ctx.moveTo(0, VIEW_H);
        for (let x = 0; x <= VIEW_W; x += 30) {
            const y = VIEW_H - 120 + Math.sin((x + storm.fogOffset1) * .015) * 20 + Math.cos((x + storm.fogOffset2) * .025) * 12;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(VIEW_W, VIEW_H);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        drawWindHUD(ctx, dir, storm.windTimer);
    };
    function drawWindHUD(ctx, dir, timer) {
        ctx.save();
        const hudW = 210;
        const hudH = 46;
        const hudX = VIEW_W - hudW - 14;
        const hudY = 82;
        const isWarning = timer <= 70;
        const windInfo = {
            RIGHT: {
                icon: "➡️",
                key: "ui_wind_right",
                defaultText: "VIENTO ESTE",
                col: "#c084fc"
            },
            LEFT: {
                icon: "⬅️",
                key: "ui_wind_left",
                defaultText: "VIENTO OESTE",
                col: "#c084fc"
            },
            UP: {
                icon: "⬆️",
                key: "ui_wind_up",
                defaultText: "ASCENDENTE",
                col: "#38bdf8"
            },
            DOWN: {
                icon: "⬇️",
                key: "ui_wind_down",
                defaultText: "DESCENDENTE",
                col: "#f59e0b"
            }
        }[dir] || {
            icon: "💨",
            key: "",
            defaultText: "VIENTO",
            col: "#c084fc"
        };
        ctx.fillStyle = isWarning && Math.floor(timer / 8) % 2 === 0 ? "rgba(239, 68, 68, 0.88)" : "rgba(10, 18, 36, 0.88)";
        ctx.strokeStyle = isWarning ? "#ef4444" : windInfo.col;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(hudX, hudY, hudW, hudH, 6); else ctx.rect(hudX, hudY, hudW, hudH);
        ctx.fill();
        ctx.stroke();
        const badgeX = hudX + 8;
        const badgeY = hudY + 6;
        const badgeS = 24;
        ctx.fillStyle = isWarning ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.12)";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(badgeX, badgeY, badgeS, badgeS, 5); else ctx.fillRect(badgeX, badgeY, badgeS, badgeS);
        ctx.fill();
        ctx.font = "bold 15px sans-serif";
        ctx.fillStyle = isWarning ? "#ffffff" : windInfo.col;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(windInfo.icon, badgeX + badgeS / 2, badgeY + badgeS / 2 + 1);
        const translated = windInfo.key && typeof __ === "function" ? __(windInfo.key) : null;
        const rawLabel = (translated || windInfo.defaultText).replace(/^[⬅️➡️⬆️⬇️\s]+/, "");
        ctx.font = 'bold 11px "Segoe UI", "Courier Prime", sans-serif';
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(rawLabel, badgeX + badgeS + 7, badgeY + badgeS / 2, hudW - badgeS - 58);
        const secondsLeft = Math.ceil(timer / 60);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillStyle = isWarning ? "#ffea00" : "#bae6fd";
        ctx.font = 'bold 12px "Courier Prime", monospace';
        ctx.fillText(secondsLeft + "s", hudX + hudW - 8, badgeY + badgeS / 2);
        const barX = hudX + 8;
        const barY = hudY + hudH - 9;
        const barMaxW = hudW - 16;
        const barProgressW = Math.max(0, timer / WIND_DURATION * barMaxW);
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(barX, barY, barMaxW, 4, 2); else ctx.fillRect(barX, barY, barMaxW, 4);
        ctx.fill();
        ctx.fillStyle = isWarning ? "#f87171" : windInfo.col;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(barX, barY, barProgressW, 4, 2); else ctx.fillRect(barX, barY, barProgressW, 4);
        ctx.fill();
        ctx.restore();
    }
    const inkState = {
        timer: 0,
        maxTimer: 300,
        splats: []
    };
    window.triggerInkSplatter = function(isGiant) {
        inkState.timer = inkState.maxTimer;
        inkState.splats = [];
        const count = isGiant ? 9 : 6;
        for (let i = 0; i < count; i++) {
            const cx = 80 + Math.random() * (VIEW_W - 160);
            const cy = 60 + Math.random() * (VIEW_H - 140);
            const mainR = (isGiant ? 55 : 38) + Math.random() * (isGiant ? 45 : 35);
            const satellites = [];
            const satCount = 5 + Math.floor(Math.random() * 5);
            for (let s = 0; s < satCount; s++) {
                const ang = Math.random() * Math.PI * 2;
                const dist = mainR * (.85 + Math.random() * .7);
                satellites.push({
                    x: cx + Math.cos(ang) * dist,
                    y: cy + Math.sin(ang) * dist,
                    r: 6 + Math.random() * 14
                });
            }
            const drips = [];
            const dripCount = 2 + Math.floor(Math.random() * 3);
            for (let d = 0; d < dripCount; d++) {
                drips.push({
                    x: cx + (Math.random() - .5) * mainR * 1.2,
                    y: cy + mainR * .7,
                    len: 12 + Math.random() * 20,
                    maxLen: 40 + Math.random() * 65,
                    speed: .35 + Math.random() * .45,
                    w: 3 + Math.random() * 4
                });
            }
            inkState.splats.push({
                cx: cx,
                cy: cy,
                mainR: mainR,
                satellites: satellites,
                drips: drips
            });
        }
        try {
            playSound(130, .25, "sawtooth", .28, 40);
            if (typeof applyShake === "function") applyShake(6);
            if (typeof addFloatingText === "function" && typeof game !== "undefined" && game.player) {
                addFloatingText(game.player.x + game.player.w / 2, game.player.y - 15, __("flt_ink_blind") || "🦑 ¡TINTA CIEGA!", "#c084fc", 20);
            }
        } catch (e) {}
    };
    window.drawInkSplatter = function(ctx) {
        if (inkState.timer <= 0) return;
        inkState.timer--;
        let alpha = .94;
        if (inkState.timer < 90) {
            alpha = inkState.timer / 90 * .94;
        }
        ctx.save();
        ctx.fillStyle = `rgba(10, 8, 20, ${alpha})`;
        ctx.strokeStyle = `rgba(10, 8, 20, ${alpha})`;
        inkState.splats.forEach(sp => {
            ctx.beginPath();
            ctx.arc(sp.cx, sp.cy, sp.mainR, 0, Math.PI * 2);
            ctx.fill();
            sp.satellites.forEach(st => {
                ctx.beginPath();
                ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
                ctx.fill();
            });
            sp.drips.forEach(dr => {
                if (dr.len < dr.maxLen) dr.len += dr.speed;
                ctx.lineWidth = dr.w;
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(dr.x, dr.y);
                ctx.lineTo(dr.x, dr.y + dr.len);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(dr.x, dr.y + dr.len, dr.w * .9, 0, Math.PI * 2);
                ctx.fill();
            });
            if (alpha > .4) {
                ctx.fillStyle = `rgba(147, 112, 219, ${alpha * .35})`;
                ctx.beginPath();
                ctx.arc(sp.cx - sp.mainR * .3, sp.cy - sp.mainR * .3, sp.mainR * .22, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = `rgba(10, 8, 20, ${alpha})`;
            }
        });
        const vigGrad = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_W * .2, VIEW_W / 2, VIEW_H / 2, VIEW_W * .6);
        vigGrad.addColorStop(0, "rgba(10, 8, 20, 0)");
        vigGrad.addColorStop(1, `rgba(10, 8, 20, ${alpha * .65})`);
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        ctx.restore();
    };
})();
// Isaac Daniel Cotera - 2026 | Correo: isaacdanielcotera@gmail.com | Itch.io: https://cotera.itch.io | GitHub: https://github.com/cotera2024
