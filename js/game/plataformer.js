(function() {
    const canvas = document.getElementById("gameCanvas");
    const realCtx = canvas.getContext("2d", { alpha: false }) || canvas.getContext("2d");
    let ctx = realCtx;
    const _dummyGradient = { addColorStop: function() {} };
    const _noop = function() {};
    const _dummyCtxTarget = {
        isDummy: true,
        save: _noop, restore: _noop, beginPath: _noop, closePath: _noop,
        moveTo: _noop, lineTo: _noop, arc: _noop, ellipse: _noop, bezierCurveTo: _noop, quadraticCurveTo: _noop, arcTo: _noop, rect: _noop, roundRect: _noop,
        fill: _noop, stroke: _noop, fillRect: _noop, strokeRect: _noop, clearRect: _noop,
        translate: _noop, scale: _noop, rotate: _noop, setTransform: _noop, transform: _noop,
        drawImage: _noop, fillText: _noop, strokeText: _noop,
        measureText: function() { return { width: 10 }; },
        createLinearGradient: function() { return _dummyGradient; },
        createRadialGradient: function() { return _dummyGradient; },
        createPattern: function() { return null; },
        getLineDash: function() { return []; },
        setLineDash: _noop, clip: _noop, isPointInPath: _noop,
        canvas: canvas, globalAlpha: 1, globalCompositeOperation: "source-over",
        fillStyle: "", strokeStyle: "", lineWidth: 1, shadowBlur: 0, shadowColor: "",
        font: "", textAlign: "left", textBaseline: "top"
    };
    const _dummyCtx = typeof Proxy !== "undefined" ? new Proxy(_dummyCtxTarget, {
        get: function(target, prop) {
            if (prop in target) return target[prop];
            return _noop;
        }
    }) : _dummyCtxTarget;
    const messageDiv = document.getElementById("message");
    const uiOverlay = document.getElementById("ui-overlay");
    const controlsInfo = document.getElementById("controls-info");
    const blackoutDiv = document.getElementById("blackout");
    const choiceDiv = document.getElementById("choice");
    const btnSi = document.getElementById("btnSi");
    const btnNo = document.getElementById("btnNo");
    const handDiv = document.getElementById("handOverlay");
    const cursorDiv = document.getElementById("cursorOverlay");
    const choiceText = document.getElementById("choice-text");
    const choiceSub = document.getElementById("choice-sub");
    const splashScreen = document.getElementById("splash-screen");
    const langSelect = document.getElementById("lang-select");
    const gameTitle = document.getElementById("game-title");
    const cornerCredit = document.getElementById("corner-credit");
    const langTitle = document.getElementById("lang-title");
    const splashAuthor = document.getElementById("splash-author");
    canvas.width = VIEW_W;
    canvas.height = VIEW_H;
    function spawnHuntEnemy() {
        const vw = (typeof window.VIEW_W === "number" && window.VIEW_W) ? window.VIEW_W : 1024;
        const ex = cameraX + Math.min(vw * 0.72, vw - 140) + Math.random() * 30;
        const friendCols = [ "#0284c7", "#16a34a", "#ca8a04", "#7c3aed", "#ea580c" ];
        const fCol = friendCols[(game.huntKills || 0) % friendCols.length];
        game.huntEnemy = new Enemy({
            x: ex,
            y: 442,
            w: 40,
            h: 40,
            health: 1,
            speed: 0,
            range: 0,
            shoot: false,
            color: fCol
        });
        game.huntEnemy.color = fCol;
        game.huntEnemy.fleeSpeed = 4.0 + Math.random() * .4;
        game.huntEnemy.spotted = false;
        game.huntEnemy.wanderT = 0;
        game.huntEnemy.killProcessed = false;
        game.enemies = [ game.huntEnemy ];
        game.huntEnemy.spotted = false;
    }
    function startCaceria() {
        gsap.to(messageDiv, {
            scale: 0,
            opacity: 0,
            duration: .3
        });
        game.lvl4State = "hunt";
        game.lvl4Timer = 0;
        game.inHunt = true;
        game.demon.vanish();
        worldWidth = 2e5;
        game.platforms = [ new Platform({
            x: -1e5,
            y: 500,
            w: 3e5,
            h: 80
        }) ];
        game.happyMode = true;
        game.sadEnemies = true;
        game.huntKills = 0;
        game.dread = 0;
        game.freeRoam = true;
        game.vignette = false;
        game.vignetteRadius = 300;
        game.player.frozen = false;
        game.player.invulnerable = 60;
        game.player.slashCooldown = 0;
        game.player.x = 320;
        game.player.y = 440;
        game.player.vy = 0;
        game.camY = 0;
        document.body.style.background = "#87CEEB";
        blackoutDiv.style.opacity = 0;
        game.flash = 22;
        spawnHuntEnemy();
        playBGM("bgm_world1_meadow");
        window.showAnimatedMessage(__("msg_superate"), false);
    }
    function drawCheckpoint(ctx, cp, cameraX, t) {
        if (cp.groundY == null) {
            let groundY = cp.y + 60;
            if (game && Array.isArray(game.platforms)) {
                for (let p of game.platforms) {
                    if (!p.broken && !p.spikes && cp.x + 12 >= p.x && cp.x + 12 <= p.x + p.w && p.y >= cp.y - 20 && p.y <= cp.y + 110) {
                        groundY = p.y;
                        break;
                    }
                }
            }
            cp.groundY = groundY;
        }
        const groundY = cp.groundY;
        const screenX = cp.x - cameraX;
        const screenY = groundY - 60;
        if (screenX < -120 || screenX > VIEW_W + 120) return;
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath();
        ctx.ellipse(screenX + 12, groundY, 20, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = cp.activated ? "#38bdf8" : "#475569";
        ctx.fillRect(screenX - 4, groundY - 12, 32, 8);
        ctx.fillStyle = cp.activated ? "#0284c7" : "#334155";
        ctx.fillRect(screenX - 8, groundY - 4, 40, 4);
        ctx.fillStyle = cp.activated ? "#ffffff" : "#94a3b8";
        ctx.fillRect(screenX + 10, screenY - 24, 5, 72);
        ctx.fillStyle = cp.activated ? "#00ffff" : "#64748b";
        if (cp.activated) {
            ctx.shadowColor = "#00ffff";
            ctx.shadowBlur = 15 + Math.sin(t * .1) * 8;
        }
        ctx.beginPath();
        ctx.arc(screenX + 12.5, screenY - 26, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        const wave = Math.sin(t * .08 + cp.x * .02) * 6;
        ctx.beginPath();
        ctx.moveTo(screenX + 15, screenY - 22);
        ctx.quadraticCurveTo(screenX + 32, screenY - 22 + wave, screenX + 50, screenY - 14 + wave);
        ctx.quadraticCurveTo(screenX + 32, screenY + 4 + wave, screenX + 15, screenY + 8);
        ctx.closePath();
        if (cp.activated) {
            const flagGrad = ctx.createLinearGradient(screenX + 15, screenY - 22, screenX + 50, screenY + 8);
            flagGrad.addColorStop(0, "#00ffff");
            flagGrad.addColorStop(.5, "#ff3388");
            flagGrad.addColorStop(1, "#ffd700");
            ctx.fillStyle = flagGrad;
            ctx.shadowColor = "#00ffff";
            ctx.shadowBlur = 8;
        } else {
            ctx.fillStyle = "#64748b";
        }
        ctx.fill();
        ctx.shadowBlur = 0;
        if (cp.activated) {
            ctx.fillStyle = "#ffffff";
            ctx.font = "14px sans-serif";
            ctx.fillText("★", screenX + 24, screenY - 4 + wave * .5);
            if (Math.random() < .35) {
                particles.push({
                    x: cp.x + 12 + (Math.random() - .5) * 30,
                    y: cp.y + 40 - Math.random() * 60,
                    vx: (Math.random() - .5) * 1.2,
                    vy: -Math.random() * 1.8 - .5,
                    life: 30,
                    color: Math.random() > .5 ? "#00ffff" : "#ffd700",
                    size: Math.random() * 4 + 2,
                    type: "spark"
                });
            }
        } else {
            ctx.fillStyle = "#cbd5e1";
            ctx.font = "12px sans-serif";
            ctx.fillText("🚩", screenX + 24, screenY - 4 + wave * .5);
        }
        ctx.restore();
    }
    function updateAndDrawSpawnPortal(ctx, cameraX) {
        if (!game.spawnPortal) return;
        const p = game.spawnPortal;
        p.timer = (p.timer || 0) + 1;
        p.rotation = (p.rotation || 0) + .07;

        if (p.state !== "closing" && typeof game.cameraOverrideX === "number") {
            const portalCamX = Math.max(0, Math.min(p.x - VIEW_W / 2, worldWidth - VIEW_W));
            game.cameraOverrideX = portalCamX;
        }

        if (p.state === "opening" || p.state === "hero_emerge") {
            const padZone = document.getElementById("pad-zone");
            if (padZone && padZone.style.opacity !== "0") {
                padZone.style.opacity = "0";
                padZone.style.pointerEvents = "none";
            }
        }

        if (p.state === "opening") {
            p.scale = (p.scale || 0) + (1.12 - (p.scale || 0)) * 0.12;

            if (Math.random() < 0.75) {
                const ang = Math.random() * Math.PI * 2;
                const dist = 38 + Math.random() * 28;
                particles.push({
                    x: p.x + Math.cos(ang) * dist,
                    y: p.y + Math.sin(ang) * (dist * 0.65),
                    vx: -Math.cos(ang) * 3.2,
                    vy: -Math.sin(ang) * 2.2,
                    color: Math.random() > 0.5 ? "#38bdf8" : (Math.random() > 0.5 ? "#c084fc" : "#ffffff"),
                    size: 2.5 + Math.random() * 2,
                    life: 16,
                    type: "spark"
                });
            }

            if (p.scale >= 0.98 && p.timer > 24) {
                p.state = "hero_emerge";
                p.timer = 0;
                if (game.isHub && (typeof window.isLithiumRescued === "function" && window.isLithiumRescued())) {
                    p.hasLithium = true;
                    p.litX = p.x - 14;
                    p.litY = p.y - 12;
                    p.litVx = 3.2;
                    p.litVy = -7.2;
                }
                if (game.player) {
                    game.player.hidden = false;
                    game.player.x = p.x - game.player.w / 2;
                    game.player.y = p.y - 10;
                    game.player.scaleX = 0.65;
                    game.player.scaleY = 1.45;
                    game.player.vy = -6.5;
                    game.player.vx = 2.2;
                    game.player.facing = 1;
                    try {
                        playSound(620, .3, "sine", .4, 980);
                    } catch (e) {}
                }
            }
        } else if (p.state === "hero_emerge") {
            if (p.hasLithium && p.litX !== undefined) {
                p.litX += p.litVx;
                p.litY += p.litVy;
                p.litVy += 0.28;
            }
            if (game.player) {
                game.player.scaleX += (1 - game.player.scaleX) * 0.12;
                game.player.scaleY += (1 - game.player.scaleY) * 0.12;
                game.player.y += game.player.vy;
                game.player.vy += 0.44;
                game.player.x += game.player.vx;

                if (Math.random() < 0.8) {
                    particles.push({
                        x: game.player.x + game.player.w / 2 + (Math.random() - 0.5) * 8,
                        y: game.player.y + game.player.h / 2 + (Math.random() - 0.5) * 8,
                        vx: -game.player.vx * 0.4 + (Math.random() - 0.5) * 1.5,
                        vy: -game.player.vy * 0.2 + (Math.random() - 0.5) * 1.5,
                        color: Math.random() > 0.5 ? "#38bdf8" : "#f472b6",
                        size: 2.5,
                        life: 18,
                        type: "spark"
                    });
                }

                if (game.player.y >= p.groundY - 2) {
                    game.player.y = p.groundY;
                    game.player.vy = 0;
                    game.player.vx = 0;
                    game.player.onGround = true;
                    p.state = "hero_landing";
                    p.landingTimer = 0;
                    const padZone = document.getElementById("pad-zone");
                    if (padZone) {
                        padZone.style.opacity = "1";
                        padZone.style.pointerEvents = "auto";
                    }

                    game.player.scaleX = 1.42;
                    game.player.scaleY = 0.58;

                    try {
                        playSound(110, .28, "triangle", .35, 45);
                    } catch (e) {}
                    if (typeof applyShake === "function") applyShake(5);

                    for (let d = 0; d < 14; d++) {
                        const dir = d < 7 ? -1 : 1;
                        particles.push({
                            x: game.player.x + game.player.w / 2,
                            y: p.groundY + game.player.h - 2,
                            vx: dir * (Math.random() * 3.5 + 1.8),
                            vy: -Math.random() * 1.6 - 0.4,
                            color: Math.random() < 0.4 ? "#ffffff" : (Math.random() < 0.7 ? "#38bdf8" : "#94a3b8"),
                            size: 3 + Math.random() * 2.5,
                            life: 18,
                            type: "smoke"
                        });
                    }
                }
            } else {
                p.state = "closing";
            }
        } else if (p.state === "hero_landing") {
            p.landingTimer = (p.landingTimer || 0) + 1;
            if (game.player) {
                game.player.scaleX += (1 - game.player.scaleX) * 0.16;
                game.player.scaleY += (1 - game.player.scaleY) * 0.16;
            }

            if (p.landingTimer >= 14) {
                if (game.player) {
                    game.player.scaleX = 1;
                    game.player.scaleY = 1;
                    game.player.frozen = false;
                    game.player.hidden = false;
                }
                delete game.cameraOverrideX;
                p.state = "closing";
                p.timer = 0;
            }
        } else if (p.state === "closing") {
            p.scale -= 0.075;
            if (p.scale <= 0.04) {
                try {
                    createExplosion(p.x, p.y, "#9333ea", 20, 16, [ "#9333ea", "#38bdf8", "#c084fc", "#ffffff" ]);
                } catch (e) {}
                if (game.player) {
                    game.player.frozen = false;
                    game.player.hidden = false;
                    game.player.scaleX = 1;
                    game.player.scaleY = 1;
                }
                if (p.hasLithium && game.hubLithium && p.litX !== undefined) {
                    game.hubLithium.x = p.litX;
                    game.hubLithium.y = p.litY;
                }
                delete game.cameraOverrideX;
                game.spawnPortal = null;
                const padZone = document.getElementById("pad-zone");
                if (padZone) {
                    padZone.style.opacity = "1";
                    padZone.style.pointerEvents = "auto";
                }
                return;
            }
        }

        const sx = p.x - cameraX;
        const sy = p.y - 14;
        const curScale = Math.max(0.01, p.scale || 0);
        ctx.save();
        ctx.translate(sx, sy);
        ctx.scale(curScale, curScale);

        const tiltX = -0.22;
        ctx.rotate(tiltX);

        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const auraPulse = 1 + Math.sin(p.timer * 0.15) * 0.12;
        const outerAura = ctx.createRadialGradient(0, 0, 8, 0, 0, 95 * auraPulse);
        outerAura.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        outerAura.addColorStop(0.2, "rgba(56, 189, 248, 0.75)");
        outerAura.addColorStop(0.5, "rgba(168, 85, 247, 0.4)");
        outerAura.addColorStop(0.85, "rgba(244, 63, 94, 0.15)");
        outerAura.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = outerAura;
        ctx.beginPath();
        ctx.ellipse(0, 0, 85 * auraPulse, 105 * auraPulse, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = "rgba(126, 34, 206, 0.6)";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.ellipse(0, 0, 48, 72, 0, Math.PI, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#030008";
        ctx.beginPath();
        ctx.ellipse(0, 0, 42, 64, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.rotate(p.rotation);
        ctx.globalCompositeOperation = "screen";

        for (let arm = 0; arm < 4; arm++) {
            const armAng = arm * (Math.PI / 2) - p.rotation * 2.2;
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.45 + Math.sin(p.timer * 0.2 + arm) * 0.25})`;
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (let st = 0; st < 16; st++) {
                const r = st * 2.5;
                const tAng = armAng - st * 0.18;
                ctx.lineTo(Math.cos(tAng) * r, Math.sin(tAng) * r * 1.5);
            }
            ctx.stroke();
        }

        const vGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 34);
        vGrad.addColorStop(0, "#ffffff");
        vGrad.addColorStop(0.25, "#bae6fd");
        vGrad.addColorStop(0.65, "#a855f7");
        vGrad.addColorStop(0.9, "#3b0764");
        vGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = vGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 34, 52, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        for (let s = 0; s < 10; s++) {
            const sAng = s * (Math.PI / 5) + p.timer * 0.08;
            const ox = Math.cos(sAng) * 44;
            const oy = Math.sin(sAng) * 24;
            const oz = Math.sin(sAng);
            const sRad = Math.max(1, 2.2 + oz * 1.2);
            const sAlpha = Math.max(0.2, 0.5 + (oz + 1) * 0.25);
            ctx.fillStyle = `rgba(255, 255, 255, ${sAlpha})`;
            ctx.beginPath();
            ctx.arc(ox, oy, sRad, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, 42, 64, 0, 0, Math.PI);
        ctx.stroke();

        ctx.strokeStyle = "#f0abfc";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, 45, 68, 0, 0, Math.PI);
        ctx.stroke();

        if (Math.random() < 0.85) {
            ctx.save();
            ctx.strokeStyle = Math.random() < 0.5 ? "#67e8f9" : "#ffffff";
            ctx.lineWidth = 2;
            const lAng = Math.random() * Math.PI * 2;
            const lx1 = Math.cos(lAng) * 38;
            const ly1 = Math.sin(lAng) * 58;
            const lx2 = Math.cos(lAng + 0.4) * (44 + Math.random() * 12);
            const ly2 = Math.sin(lAng + 0.4) * (64 + Math.random() * 14);
            ctx.beginPath();
            ctx.moveTo(lx1, ly1);
            ctx.lineTo((lx1 + lx2) / 2 + (Math.random() - 0.5) * 10, (ly1 + ly2) / 2 + (Math.random() - 0.5) * 10);
            ctx.lineTo(lx2, ly2);
            ctx.stroke();
            ctx.restore();
        }

        const singPulse = 0.8 + Math.sin(p.timer * 0.35) * 0.25;
        ctx.fillStyle = `rgba(255, 255, 255, ${singPulse})`;
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        if (p.hasLithium && p.litX !== undefined) {
            const targetX = (game.hubLithium && game.hubLithium.baseX) ? game.hubLithium.baseX : 820;
            const targetY = (game.hubLithium && game.hubLithium.baseY) ? game.hubLithium.baseY : 410;
            if (p.state === "hero_landing" || p.state === "closing") {
                p.litX += (targetX - p.litX) * 0.08;
                p.litY += (targetY - p.litY) * 0.08;
            }
            if (Math.random() < 0.85 && typeof particles !== "undefined") {
                particles.push({
                    x: p.litX + 13 + (Math.random() - 0.5) * 6,
                    y: p.litY + 13 + (Math.random() - 0.5) * 6,
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: (Math.random() - 0.5) * 1.5,
                    color: Math.random() < 0.6 ? "#ffd700" : "#ffffff",
                    size: 2.5 + Math.random() * 2,
                    life: 20,
                    type: "spark"
                });
            }
            if (typeof window.drawLithiumSprite === "function") {
                const screenLX = p.litX - cameraX;
                window.drawLithiumSprite(ctx, screenLX, p.litY, 26, 26, 1, 1, 1, "happy", 0, time);
            }
        }
    }
    function triggerHandTrap(e) {
        const siRect = btnSi.getBoundingClientRect();
        const siX = siRect.left + siRect.width / 2;
        const siY = siRect.top + siRect.height / 2;
        const cursorX = e.clientX;
        const cursorY = e.clientY;
        document.body.classList.add("no-cursor");
        cursorDiv.style.display = "block";
        cursorDiv.style.left = cursorX + "px";
        cursorDiv.style.top = cursorY + "px";
        cursorDiv.innerText = "👆";
        handDiv.style.display = "block";
        handDiv.innerText = "✋";
        let handX = cursorX + 130;
        let handY = cursorY;
        handDiv.style.left = handX + "px";
        handDiv.style.top = handY + "px";
        playSound(200, .5, "sawtooth", .3, 80);
        const fase1 = () => {
            const dx = cursorX - handX;
            const dy = cursorY - handY;
            const d = Math.hypot(dx, dy);
            const step = Math.min(d, Math.max(22, d * .4));
            if (d > 10) {
                handX += dx / d * step;
                handY += dy / d * step;
                handDiv.style.left = handX + "px";
                handDiv.style.top = handY + "px";
                requestAnimationFrame(fase1);
            } else {
                handX = cursorX;
                handY = cursorY;
                handDiv.style.left = handX + "px";
                handDiv.style.top = handY + "px";
                handDiv.innerText = "✊";
                cursorDiv.style.display = "none";
                playSound(70, .5, "sawtooth", .4, 30);
                setTimeout(fase2, 400);
            }
        };
        const fase2 = () => {
            const dx = siX - handX;
            const dy = siY - handY;
            const d = Math.hypot(dx, dy);
            const step = Math.min(d, Math.max(18, d * .3));
            if (d > 8) {
                handX += dx / d * step;
                handY += dy / d * step;
                handDiv.style.left = handX + "px";
                handDiv.style.top = handY + "px";
                requestAnimationFrame(fase2);
            } else {
                handX = siX;
                handY = siY;
                handDiv.style.left = handX + "px";
                handDiv.style.top = handY + "px";
                handDiv.innerText = "✋";
                cursorDiv.style.display = "block";
                cursorDiv.style.left = siX + "px";
                cursorDiv.style.top = siY + "px";
                cursorDiv.innerText = "👉";
                playSound(900, .15, "square", .25, 1500);
                setTimeout(() => {
                    handDiv.style.display = "none";
                    cursorDiv.style.display = "none";
                    document.body.classList.remove("no-cursor");
                    btnSi.click();
                }, 200);
            }
        };
        requestAnimationFrame(fase1);
    }
    function confirmDeal() {
        window.hideChoice();
        handDiv.style.display = "none";
        cursorDiv.style.display = "none";
        document.body.classList.remove("no-cursor");
        bfShow = true;
        startCaceria();
    }
    function bindChoiceAction(btn, action) {
        let lastTouch = 0;
        btn.addEventListener("touchstart", e => {
            e.preventDefault();
            e.stopPropagation();
            if (Date.now() - lastTouch < 500) return;
            lastTouch = Date.now();
            const t = e.touches && e.touches[0];
            const fake = t ? { clientX: t.clientX, clientY: t.clientY } : e;
            action(fake);
        }, { passive: false });
        btn.addEventListener("click", e => {
            if (Date.now() - lastTouch < 800) return;
            action(e);
        });
    }
    bindChoiceAction(btnNo, triggerHandTrap);
    bindChoiceAction(btnSi, confirmDeal);
    function startGameFromButton() {
        initAudio();
        try {
            const el = document.documentElement;
            if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
                else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
            }
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock("landscape").catch(() => {});
            } else if (screen.lockOrientation) {
                screen.lockOrientation("landscape");
            }
        } catch (_) {}
        if (gameState !== "start") return;
        gameReady = true;
        window.gameReady = true;
        gameTitle.style.opacity = "0";
        if (cornerCredit) cornerCredit.style.opacity = "0";
        const titleBtns = document.getElementById("title-buttons");
        if (titleBtns) titleBtns.classList.add("hidden");
        const langToggleBtn = document.getElementById("btn-lang-toggle");
        if (langToggleBtn) langToggleBtn.style.display = "none";
        let hasSeenIntro = false;
        try {
            const val = typeof window.storageGet === "function" ? window.storageGet("starcube_intro_seen") : localStorage.getItem("starcube_intro_seen");
            hasSeenIntro = (val === "true" || val === true);
        } catch (e) {}
        if (!hasSeenIntro && typeof window.startIntroCinematic === "function") {
            window.startIntroCinematic();
        } else {
            loadHubLevel(0);
        }
        if (typeof window.gameLoadingStop === "function") {
            window.gameLoadingStop();
        }
        if (typeof window.gameplayStart === "function") {
            window.gameplayStart();
        }
        if (typeof window.focusGameCanvas === "function") {
            window.focusGameCanvas();
        }
    }
    window.startGameFromButton = startGameFromButton;
    window.addEventListener("keydown", e => {
        const inv = game.invertControls && gameState === "playing" && currentLevel === 1;
        const isSpaceKey = e.key === " " || e.key === "Spacebar" || e.code === "Space";
        const isXKey = e.key === "x" || e.key === "X" || e.code === "KeyX";
        const isJKey = e.key === "j" || e.key === "J" || e.code === "KeyJ";
        const isKKey = e.key === "k" || e.key === "K" || e.code === "KeyK";
        const isLKey = e.key === "l" || e.key === "L" || e.code === "KeyL";
        const isShootKey = isXKey || isJKey;
        const isJumpKeyCandidate = isSpaceKey || isKKey || e.key === "w" || e.key === "W";
        const isDashKeyCandidate = e.key === "c" || e.key === "C" || isLKey;
        const isLeftKey = e.key === "ArrowLeft" || e.key === "a" || e.key === "A";
        const isRightKey = e.key === "ArrowRight" || e.key === "d" || e.key === "D";
        const isUpKey = e.key === "ArrowUp" || e.key === "w" || e.key === "W";
        const isDownKey = e.key === "ArrowDown" || e.key === "s" || e.key === "S";

        if (inv) {
            if (isLeftKey) {
                keys["ArrowRight"] = true;
                keys["d"] = true;
            } else if (isRightKey) {
                keys["ArrowLeft"] = true;
                keys["a"] = true;
            } else if (isJumpKeyCandidate) {
                keys["x"] = true;
                keys["j"] = true;
            } else if (isShootKey) {
                keys[" "] = true;
                keys["k"] = true;
            } else if (e.key === "z" || e.key === "Z" || e.code === "KeyZ") {
            } else {
                keys[e.key] = true;
            }
        } else {
            keys[e.key] = true;
            if (isLeftKey) { keys["ArrowLeft"] = true; keys["a"] = true; }
            if (isRightKey) { keys["ArrowRight"] = true; keys["d"] = true; }
            if (isUpKey) { keys["ArrowUp"] = true; keys["w"] = true; }
            if (isDownKey) { keys["ArrowDown"] = true; keys["s"] = true; }
            if (isShootKey) { keys["x"] = true; keys["j"] = true; }
            if (isJumpKeyCandidate) { keys[" "] = true; keys["k"] = true; }
            if (isDashKeyCandidate) { keys["c"] = true; keys["l"] = true; }
        }

        if (gameState === "playing" && game.player && !game.player.frozen) {
            const isJumpKey = inv ? isShootKey : isJumpKeyCandidate;
            if (isJumpKey) game.player.jumpBufferTimer = Math.max(game.player.jumpBufferTimer, 12);
        }
        if (isDashKeyCandidate && gameState === "playing" && currentLevel !== 4 && game.player && !game.player.frozen) {
            game.player.dashBufferTimer = 30;
        }
        initAudio();
        if (e.key === "0" && !e.repeat && gameState === "playing" && !isDialogActive) {
            e.preventDefault();
            if (unlockedLevel < 5) {
                unlockedLevel = 5;
                try {
                    (typeof window !== "undefined" && typeof window.storageSet === "function" ? window.storageSet : (k, v) => localStorage.setItem(k, v))("starcube_unlocked_v2", String(unlockedLevel));
                } catch (err) {}
                window.pendingUnlockDoorNum = null;
                if (game.isHub && Array.isArray(game.hubDoors)) {
                    game.hubDoors.forEach(d => {
                        if (d.levelNum <= 5 && d.unlockAnim) d.unlockAnim.unlocked = true;
                    });
                    if (typeof initHubFriends === "function") initHubFriends();
                }
                const pU = game.player;
                if (pU && typeof addFloatingText === "function") {
                    addFloatingText(pU.x + pU.w / 2, pU.y - 34, __("flt_puertas_desbloq"), "#7dd3fc", 20);
                }
                try {
                    playSound(1040, .3, "triangle", .22, 780);
                } catch (err) {}
            }
            return;
        }
        if (e.key === "9" && !e.repeat && gameState === "playing" && !isDialogActive) {
            e.preventDefault();
            if (!window.postGameHorror) {
                unlockedLevel = 6;
                try {
                    (typeof window !== "undefined" && typeof window.storageSet === "function" ? window.storageSet : (k, v) => localStorage.setItem(k, v))("starcube_unlocked_v2", String(unlockedLevel));
                } catch (err) {}
                try {
                    (typeof window !== "undefined" && typeof window.storageSet === "function" ? window.storageSet : (k, v) => localStorage.setItem(k, v))("starcube_horror_mode", "true");
                } catch (err) {}
                window.postGameHorror = true;
                window.pendingUnlockDoorNum = null;
                try {
                    playSound(90, .5, "sawtooth", .3, 45);
                } catch (err) {}
                window.loadHubLevel();
                if (typeof window.showAnimatedMessage === "function") {
                    window.showAnimatedMessage(__("flt_modo_terror_on"));
                }
            }
            return;
        }
        if (game.techBoss && (game.techBoss.showChoice || game.techBoss._desktopCinematicActive)) {
            if (e.key === " " || e.key === "Spacebar" || e.key === "Enter" || isKKey) e.preventDefault();
            return;
        }
        if (isDialogActive && (e.key === " " || e.key === "Spacebar" || e.key === "Enter" || e.key === "z" || e.key === "Z" || isShootKey || isJumpKeyCandidate)) {
            advanceOrSkipDialogue();
            return;
        }
        if (gameState === "introStory") {
            if (e.key === " " || e.key === "Spacebar" || e.key === "Enter" || e.key === "Escape" || isKKey) {
                if (typeof window.handleIntroInput === "function") {
                    window.handleIntroInput(e.key);
                }
                return;
            }
        }
        if ((e.key === " " || e.key === "Spacebar" || e.key === "Enter" || isKKey) && gameState === "start") {
            gameReady = true;
            window.gameReady = true;
            startGameFromButton();
        } else if ((e.key === " " || e.key === "Spacebar" || isKKey) && gameState === "preNivel4") {
            let lines = [ __("story_prenivel4_1"), __("story_prenivel4_2"), __("story_prenivel4_3"), __("story_prenivel4_4"), __("story_prenivel4_5"), __("story_prenivel4_6"), __("story_prenivel4_7"), __("story_prenivel4_8"), __("story_prenivel4_9"), __("story_prenivel4_10"), __("story_prenivel4_11"), __("story_prenivel4_12") ];
            const fullLine = lines[game.storyLine] || "";
            if (game.storyChar >= fullLine.length) {
                if (game.storyLine < lines.length - 1) {
                    game.storyLine++;
                    game.storyChar = 0;
                    game.storyTimer = 0;
                    game.storyHold = 0;
                } else {
                    game.storyHold = 9999;
                }
            } else {
                game.storyChar = fullLine.length;
                game.storyHold = 0;
            }
        }
    });
    window.addEventListener("keyup", e => {
        const invUp = game.invertControls && gameState === "playing" && currentLevel === 1;
        const isSpaceKey = e.key === " " || e.key === "Spacebar" || e.code === "Space";
        const isXKey = e.key === "x" || e.key === "X" || e.code === "KeyX";
        const isJKey = e.key === "j" || e.key === "J" || e.code === "KeyJ";
        const isKKey = e.key === "k" || e.key === "K" || e.code === "KeyK";
        const isLKey = e.key === "l" || e.key === "L" || e.code === "KeyL";
        const isShootKey = isXKey || isJKey;
        const isJumpKeyCandidate = isSpaceKey || isKKey || e.key === "w" || e.key === "W";
        const isDashKeyCandidate = e.key === "c" || e.key === "C" || isLKey;
        const isLeftKey = e.key === "ArrowLeft" || e.key === "a" || e.key === "A";
        const isRightKey = e.key === "ArrowRight" || e.key === "d" || e.key === "D";
        const isUpKey = e.key === "ArrowUp" || e.key === "w" || e.key === "W";
        const isDownKey = e.key === "ArrowDown" || e.key === "s" || e.key === "S";

        keys[e.key] = false;
        if (invUp) {
            if (isLeftKey) {
                keys["ArrowRight"] = false;
                keys["d"] = false;
            } else if (isRightKey) {
                keys["ArrowLeft"] = false;
                keys["a"] = false;
            } else if (isJumpKeyCandidate) {
                keys["x"] = false;
                keys["j"] = false;
            } else if (isShootKey) {
                keys[" "] = false;
                keys["k"] = false;
            } else {
                keys[e.key] = false;
            }
        } else {
            if (isLeftKey) { keys["ArrowLeft"] = false; keys["a"] = false; }
            if (isRightKey) { keys["ArrowRight"] = false; keys["d"] = false; }
            if (isUpKey) { keys["ArrowUp"] = false; keys["w"] = false; }
            if (isDownKey) { keys["ArrowDown"] = false; keys["s"] = false; }
            if (isShootKey) { keys["x"] = false; keys["j"] = false; }
            if (isJumpKeyCandidate) { keys[" "] = false; keys["k"] = false; }
            if (isDashKeyCandidate) { keys["c"] = false; keys["l"] = false; }
        }
    });
    function loadLevel(idx, keepCheckpoint = false) {
        window._gameTimeScale = 1.0;
        if (typeof window.clearActiveBossDefeats === "function") window.clearActiveBossDefeats();
        game.isHub = false;
        window.canEnterDoor = false;
        if (idx >= levels.length) {
            window.showVictoryModal();
            return;
        }
        if (!keepCheckpoint && idx === 0) {
            game.boss1Defeated = false;
        }
        currentLevel = idx;
        window.lastPlayedLevelIndex = idx;
        const matchingHubDoor = [
            { levelNum: 1, levelIndex: 0 },
            { levelNum: 2, levelIndex: 3 },
            { levelNum: 3, levelIndex: 2 },
            { levelNum: 4, levelIndex: 1 },
            { levelNum: 5, levelIndex: 6 },
            { levelNum: 6, levelIndex: 4 }
        ].find(d => d.levelIndex === idx);
        if (matchingHubDoor) {
            window.lastEnteredHubDoorLevelNum = matchingHubDoor.levelNum;
            window.lastEnteredHubLevelIndex = matchingHubDoor.levelIndex;
        }
        const lvl = levels[idx];
        worldWidth = lvl.worldWidth;
        if (typeof window !== "undefined" && window.GamePix && typeof window.GamePix.updateLevel === "function" && typeof idx === "number") {
            try { window.GamePix.updateLevel(idx + 1); } catch (e) {}
        }
        if (!keepCheckpoint || currentCheckpoint && currentCheckpoint.level !== idx) {
            currentCheckpoint = null;
        }
        if (!keepCheckpoint) {
            playerLives = typeof MAX_LIVES !== "undefined" ? MAX_LIVES : 3;
            adReviveUsed = false;
        }
        if (typeof window.updateLivesDisplay === "function") window.updateLivesDisplay();
        let startX = lvl.playerStart.x;
        let startY = lvl.playerStart.y;
        if (keepCheckpoint && currentCheckpoint && currentCheckpoint.level === idx) {
            startX = currentCheckpoint.x;
            startY = currentCheckpoint.y;
        } else {
            const isMobile = typeof window !== "undefined" && (window.isMobileDevice || (typeof window.isMobileOrTouch === "function" && window.isMobileOrTouch()) || (window.innerWidth <= 900 && ("ontouchstart" in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0))));
            if (isMobile) {
                startX = Math.min(startX + 130, 210);
                if (game.enemies && Array.isArray(game.enemies)) {
                    game.enemies.forEach(e => {
                        if (typeof e.x === "number") {
                            if (idx === 2) {
                                if (e.x < 500) e.x += 260;
                                else if (e.x < 800) e.x += 180;
                                if (e.originX) e.originX = e.x;
                            } else if (idx === 1) {
                                if (e.x < 550) e.x += 240;
                                if (e.originX) e.originX = e.x;
                            } else if (idx === 3) {
                                if (e.x < 650) e.x += 200;
                                if (e.originX) e.originX = e.x;
                            } else if (idx === 0) {
                                if (e.x < 800) e.x += 120;
                                if (e.originX) e.originX = e.x;
                            }
                        }
                    });
                }
            }
        }
        let boatRideState = null;
        if (idx === 3 && keepCheckpoint && currentCheckpoint && currentCheckpoint.level === 3 && currentCheckpoint.x >= 12350 && currentCheckpoint.x < 21750 && typeof window.isBoatTraveling === "function" && window.isBoatTraveling()) {
            boatRideState = typeof window.getBoatTravelState === "function" ? window.getBoatTravelState() : null;
            if (boatRideState && typeof window.getBoatSafeRespawn === "function") {
                const bSafe = window.getBoatSafeRespawn();
                startX = bSafe.x;
                startY = bSafe.y;
            } else {
                boatRideState = null;
            }
        }
        if (idx === 3 && keepCheckpoint && currentCheckpoint && currentCheckpoint.level === 3 && currentCheckpoint.x >= 22e3 && currentCheckpoint.x < 23650) {
            startX = 22080;
            startY = 420;
        }
        if (typeof gsap !== "undefined") {
            try {
                gsap.killTweensOf(game);
            } catch (e) {}
            try {
                if (game.player) gsap.killTweensOf(game.player);
            } catch (e) {}
            try {
                if (Array.isArray(game.platforms)) game.platforms.forEach(function(pf) {
                    gsap.killTweensOf(pf);
                });
            } catch (e) {}
            try {
                gsap.killTweensOf(getMessageDiv());
            } catch (e) {}
            try {
                gsap.set(getMessageDiv(), {
                    scale: 0,
                    opacity: 0
                });
            } catch (e) {}
        }
        try {
            CINEMA_TOKEN++;
        } catch (e) {}
        try {
            if (typeof window.cancelDialogue === "function") window.cancelDialogue();
            else if (typeof window.hideDialogue === "function") window.hideDialogue();
            if (typeof window.BossHUD !== "undefined" && typeof window.BossHUD.hide === "function") {
                window.BossHUD.hide();
            }
            if (typeof window.resetLevelCardMode === "function") {
                window.resetLevelCardMode();
            }
            if (typeof window.closeArenaWithHammers === "function") {
                window.closeArenaWithHammers._busyUntil = 0;
            }
        } catch (e) {}
        try {
            if (typeof stopAllSFX === "function") stopAllSFX();
            if (typeof audios !== "undefined" && audios["sfx_dizzy_loop"]) {
                audios["sfx_dizzy_loop"].pause();
                audios["sfx_dizzy_loop"].currentTime = 0;
            }
        } catch (e) {}
        delete game.cameraOverrideX;
        delete game.cameraOverrideY;
        game.arenaLocked = false;
        game.arenaMinX = 0;
        game.arenaMaxX = worldWidth;
        game.subCaveMode = false;
        game.subCaveTransitioning = false;
        game.caveStalactiteHitCount = 0;
        game.meadowNight = false;
        game.eruptingMode = false;
        game.nightTransitionProgress = null;
        game.invertControls = false;
        game.hideHealthBar = false;
        game.pixelMode = false;
        game.pixelTransitionProgress = 0;
        keys = {};
        try {
            [ game.techBoss, game.yellowSquare, game.krakatoa, game.pumpkinBoss, game.blueSquare ].forEach(function(b) {
                if (b && typeof gsap !== "undefined") gsap.killTweensOf(b);
            });
        } catch (e) {}
        if (typeof screenShake !== "undefined") {
            screenShake.intensity = 0;
            screenShake.x = 0;
        }
        delete game.cameraZoom;
        delete game.zoomTargetWorldX;
        delete game.zoomTargetWorldY;
        game.isEnteringDoor = false;
        game.player = new Player(startX, startY);
        if (typeof window.initLithiumLevel === "function") {
            window.initLithiumLevel(idx);
        }
        if (typeof window.initHalloweenLevel === "function") {
            window.initHalloweenLevel(idx);
        }
        if (idx === 3 && typeof window.initBoatLevel4 === "function") {
            window.initBoatLevel4();
            if (boatRideState && typeof window.restoreBoatTravelState === "function") {
                window.restoreBoatTravelState(boatRideState);
            }
        }
        const portalSpawnX = startX + game.player.w / 2;
        const portalSpawnY = Math.max(50, startY - 26);
        game.spawnPortal = {
            x: portalSpawnX,
            y: portalSpawnY,
            groundY: startY,
            state: "opening",
            scale: 0,
            rotation: 0,
            timer: 0
        };
        const padZone = document.getElementById("pad-zone");
        if (padZone) {
            padZone.style.opacity = "0";
            padZone.style.pointerEvents = "none";
        }
        game.player.y = portalSpawnY;
        game.player.frozen = true;
        game.player.hidden = true;
        game.player.vx = 0;
        game.player.vy = 0;
        try {
            playSound(240, .45, "triangle", .35, 700);
        } catch (e) {}
        let respawnX = 0;
        let isSubCaveRespawn = false;
        if (idx === 0) {
            respawnX = keepCheckpoint && currentCheckpoint && currentCheckpoint.level === idx ? currentCheckpoint.x : 0;
            isSubCaveRespawn = respawnX >= 28e3 && respawnX <= 34e3;
            game.subCaveMode = isSubCaveRespawn;
            if (keepCheckpoint && currentCheckpoint && currentCheckpoint.level === idx) {
                game.gate1Open = currentCheckpoint.gate1Open || respawnX >= 3800;
                game.gate2Open = currentCheckpoint.gate2Open || respawnX >= 7400 && !isSubCaveRespawn;
                game.meadowNight = currentCheckpoint.meadowNight !== false;
                game.boss1Defeated = currentCheckpoint.boss1Defeated || false;
                if (game.meadowNight) game.nightTransitionProgress = 1;
                else delete game.nightTransitionProgress;
            } else {
                game.gate1Open = respawnX >= 3800;
                game.gate2Open = respawnX >= 7400 && !isSubCaveRespawn;
                game.meadowNight = respawnX >= 7400 && !isSubCaveRespawn && !game.boss1Defeated;
                delete game.nightTransitionProgress;
            }
        } else {
            game.gate1Open = false;
            game.gate2Open = false;
            game.meadowNight = false;
            game.subCaveMode = false;
            if (typeof window !== "undefined") window._cavernEntranceBlownPermanently = false;
        }
        game.platforms = lvl.platforms.map(p => new Platform(p));
        if (idx === 0 && typeof window.initCavernEntrance === "function") {
            window.initCavernEntrance(respawnX, isSubCaveRespawn);
        }
        game.enemies = (lvl.enemies || []).filter(e => !(currentLevel === 2 && e.type === "fire_spawner")).map(e => new Enemy(e));
        if (window.postGameHorror && currentLevel !== 4) {
            applyHorrorLevelModifications(currentLevel, game.platforms);
            game.enemies.forEach(en => {
                if (en.speed) en.speed *= 1.35;
                if (!en.isObstacle && !en.isBoss && en.type !== "boss" && en.type !== "similar_harmless") {
                    en.shoot = true;
                    en.shootInterval = Math.max(65, Math.floor((en.shootInterval || 120) * 0.7));
                    en.shootTimer = Math.floor(Math.random() * en.shootInterval);
                    en.bulletType = "horror_blood_ball";
                }
            });
            const extraEnemies = [];
            game.enemies.forEach((en, i) => {
                if (i % 2 === 0 && en.x && en.y && !en.isBoss && en.type !== "boss" && !en.isObstacle) {
                    const cloneDef = Object.assign({}, en, {
                        x: en.x + (en.w || 32) * 2.5,
                        y: en.y,
                        health: en.health || 20,
                        maxHealth: en.maxHealth || 20,
                        speed: (en.speed || 1.5) * 1.1,
                        shoot: true,
                        bulletType: "horror_blood_ball"
                    });
                    extraEnemies.push(new Enemy(cloneDef));
                }
            });
            game.enemies.push(...extraEnemies);
        }
        game.demon = new BossDemon;
        window.hideChoice();
        if (game.subCaveMode) {
            cameraX = 28e3;
        } else {
            cameraX = Math.max(0, Math.min(startX - VIEW_W / 2 + game.player.w / 2, worldWidth - VIEW_W));
        }
        game.cameraOverrideX = cameraX;
        projectiles = [];
        enemyProjectiles = [];
        particles = [];
        blood = [];
        restos = [];
        stars = [];
        floatingTexts = [];
        if (lvl.stars) {
            stars = lvl.stars.map(s => ({
                x: s.x,
                y: s.y,
                collected: false
            }));
        }
        if (window.postGameHorror && Array.isArray(game.platforms)) {
            const safePlats = game.platforms.filter(p => p.y >= 380 && p.w >= 80 && !p.spikes && !p.lava && !p.broken && !p.isHorrorPit);
            safePlats.forEach((p, pIdx) => {
                if (pIdx % 3 === 0) {
                    stars.push({
                        x: p.x + p.w * 0.5 - 12,
                        y: p.y - 36,
                        collected: false
                    });
                }
            });
        }
        checkpoints = [];
        if (lvl.checkpoints) {
            checkpoints = lvl.checkpoints.map(cp => ({
                x: cp.x,
                y: cp.y,
                activated: !!(currentCheckpoint && currentCheckpoint.level === idx && Math.abs(currentCheckpoint.x - cp.x) < 50)
            }));
        }
        game.iceMode = idx === 0 && game.boss1Defeated && !game.subCaveMode && startX >= 12400;
        game.fireMode = false;
        game.iceGlitchTriggered = false;
        game.arenaLocked = false;
        game.arenaMinX = 0;
        game.arenaMaxX = worldWidth;
        game.flash = 0;
        game.glitchT = 0;
        game.camY = 0;
        try {
            if (typeof window.BossHUD !== "undefined" && typeof window.BossHUD.hide === "function") {
                window.BossHUD.hide();
            }
        } catch (e) {}
        if (window.SnowballEventSystem) {
            window.SnowballEventSystem.reset(startX);
        }
        game._entryLock = 90;
        if (idx === 0) {
            if (!game.boss1Defeated) {
                const arenaPlat = game.platforms && game.platforms.find(p => p.w >= 2e3 && p.y >= 500 && p.x >= 7e3) || {
                    x: 9600
                };
                game.blueSquare = {
                    x: arenaPlat.x + 550,
                    y: 472,
                    w: 28,
                    h: 28,
                    state: "sweating",
                    dialogTimer: 0,
                    health: 42,
                    maxHealth: 42,
                    shootTimer: 0,
                    hitFlash: 0,
                    isBoss: false,
                    transformTimer: 0
                };
            } else {
                game.blueSquare = null;
            }
        } else {
            game.blueSquare = null;
            try {
                if (window.TurretSystem) {
                    window.TurretSystem.init(game);
                }
            } catch (e) {}
        }
        if (idx === 1) {
            const passedTechBoss = !!(keepCheckpoint && currentCheckpoint && currentCheckpoint.level === 1 && currentCheckpoint.x > 15300);
            game.pixelMode = passedTechBoss;
            game.pixelTransitionProgress = passedTechBoss ? 1 : 0;
            const tbHp = window.postGameHorror ? 160 : 80;
            game.techBoss = {
                x: 14800,
                y: 100,
                w: 100,
                h: 100,
                state: passedTechBoss ? "defeated" : "idle",
                health: tbHp,
                maxHealth: tbHp,
                phase: 1,
                turnTimer: 0,
                turnPhase: "intro",
                bulletCount: 7,
                speed: 1,
                growScale: 1,
                hitFlash: 0,
                vulnerable: false,
                isAttacking: false,
                attackTimer: 0,
                dialogStep: 0,
                dialogTimer: 0,
                yesNoChoice: false,
                dodgeMode: false,
                bonusHp: false,
                defeated: false,
                defeatTimer: 0,
                pixelActivate: 0,
                _entranceClosed: false,
                _bootDialogShown: false,
                _hudDestroyed: false,
                _controlsInverted: false,
                _desktopCinematicActive: false,
                _desktopCinematic: null,
                _codeRainActive: false,
                _codeRain: 0,
                _growthTimer: 0,
                showChoice: false,
                vibeTerminal: false,
                vibeStep: 0,
                vibeEnemies: null,
                _vibeDeliveryShown: false,
                turnDamageTaken: 0,
                turnDamageFloor: 0
            };
            if (passedTechBoss) {
                game.arenaLocked = false;
                game.techBridgeActive = true;
                game.techTanks = [
                    {
                        x: 17800, y: 454, w: 70, h: 46, state: "hostile", animTimer: 0, shootTimer: 50, showChoice: false,
                        health: 90, maxHealth: 90, vx: 1.35, dir: 1, minX: 17550, maxX: 18600, wheelAngle: 0, cannonAngle: Math.PI, recoil: 0, destroyTimer: 0
                    }
                ];
                game.pinkSquare = game.techTanks[0];
            } else {
                game.techBridgeActive = keepCheckpoint && currentCheckpoint && currentCheckpoint.level === 1 && currentCheckpoint.x > 12750;
                const baseTanks = [
                    {
                        x: 9800, y: 454, w: 70, h: 46, state: "hostile", animTimer: 0, shootTimer: 20, showChoice: false,
                        health: 90, maxHealth: 90, vx: 1.35, dir: 1, minX: 9500, maxX: 10400, wheelAngle: 0, cannonAngle: Math.PI, recoil: 0, destroyTimer: 0
                    },
                    {
                        x: 12200, y: 454, w: 70, h: 46, state: "hostile", animTimer: 0, shootTimer: 45, showChoice: false,
                        health: 90, maxHealth: 90, vx: 1.35, dir: 1, minX: 12050, maxX: 12650, wheelAngle: 0, cannonAngle: Math.PI, recoil: 0, destroyTimer: 0
                    },
                    {
                        x: 13750, y: 452, w: 70, h: 46, state: "hostile", animTimer: 0, shootTimer: 0, showChoice: false,
                        health: 90, maxHealth: 90, vx: 1.35, dir: 1, minX: 13580, maxX: 14120, wheelAngle: 0, cannonAngle: Math.PI, recoil: 0, destroyTimer: 0
                    },
                    {
                        x: 17800, y: 454, w: 70, h: 46, state: "hostile", animTimer: 0, shootTimer: 60, showChoice: false,
                        health: 90, maxHealth: 90, vx: 1.35, dir: 1, minX: 17550, maxX: 18600, wheelAngle: 0, cannonAngle: Math.PI, recoil: 0, destroyTimer: 0
                    }
                ];
                if (keepCheckpoint && currentCheckpoint && currentCheckpoint.level === 1 && currentCheckpoint.x >= 12200) {
                    game.techTanks = baseTanks.filter(t => t.x > currentCheckpoint.x + 80);
                } else {
                    game.techTanks = baseTanks;
                }
                game.pinkSquare = game.techTanks.find(t => t.x > 13000) || null;
            }
        } else {
            game.pixelMode = false;
            game.techBoss = null;
            game.pinkSquare = null;
            game.techTanks = null;
        }
        if (idx === 2) {
            const hasCheckpointPassedRescue = keepCheckpoint && currentCheckpoint && currentCheckpoint.level === 2 && currentCheckpoint.x > 3e3;
            game.yellowSquare = {
                x: hasCheckpointPassedRescue ? startX - 40 : startX + 60,
                y: hasCheckpointPassedRescue ? startY : 440,
                w: 24,
                h: 24,
                vx: 0,
                vy: 0,
                state: "invisible",
                guardsCount: 0,
                shootTimer: 0,
                facing: 1,
                health: 20,
                maxHealth: 20,
                scale: 1,
                dialogTimer: 0,
                bossShootTimer: 0,
                hitFlash: 0,
                isBoss: false,
                _betrayalShown: false,
                _dialogPhase1: false,
                _dialogPhase2: false,
                _dialogPhase3: false,
                _dialogPhase4: false,
                _dialogPhase5: false
            };
            const passedValkyrie = !!(keepCheckpoint && currentCheckpoint && currentCheckpoint.level === 2 && currentCheckpoint.x >= 19400);
            game.valkBossDefeated = passedValkyrie;
            game.eruptingMode = passedValkyrie;
            game.arenaLocked = false;
            const passedL2Arena = !!(keepCheckpoint && currentCheckpoint && currentCheckpoint.level === 2 && currentCheckpoint.x > 9400);
            game.l2ArenaTriggered = passedL2Arena;
            game.l2ArenaDone = passedL2Arena;
            game.l2ArenaActive = false;
            game.l2ArenaWave = 0;
            game.l2ArenaEnemies = [];
            game.l2ArenaWaveTransition = 0;
            try {
                if (window.ValkyrieBoss) {
                    window.ValkyrieBoss.state = passedValkyrie ? "defeated" : "idle";
                    window.ValkyrieBoss.boss = null;
                    window.ValkyrieBoss.pillars = [];
                    window.ValkyrieBoss._lastLevel = passedValkyrie ? 2 : -1;
                    if (passedValkyrie) {
                        window.ValkyrieBoss.state = "defeated";
                        window.ValkyrieBoss.boss = null;
                        window.ValkyrieBoss.pillars = [];
                        window.ValkyrieBoss._lastLevel = 2;
                    } else if (typeof window.ValkyrieBoss.reset === "function") {
                        window.ValkyrieBoss.reset();
                    } else {
                        window.ValkyrieBoss.state = "idle";
                        window.ValkyrieBoss.boss = null;
                        window.ValkyrieBoss.pillars = [];
                        window.ValkyrieBoss._lastLevel = -1;
                    }
                    if (window.BossHUD) window.BossHUD.hide();
                }
            } catch (e) {}
        } else {
            game.yellowSquare = null;
            game.l2ArenaTriggered = false;
            game.l2ArenaDone = false;
            game.l2ArenaActive = false;
            game.l2ArenaWave = 0;
            game.l2ArenaEnemies = [];
            game.l2ArenaWaveTransition = 0;
        }
        if (idx === 3) {
            const passedKraken = keepCheckpoint && currentCheckpoint && currentCheckpoint.level === 3 && currentCheckpoint.x > 23500;
            game.krakatoa = typeof window.createKrakatoaBoss === "function" ? window.createKrakatoaBoss() : null;
            if (game.krakatoa && passedKraken) {
                game.krakatoa.state = "defeated";
                game.krakatoa.health = 0;
                game.arenaLocked = false;
            } else if (game.krakatoa) {
                game.krakatoa.health = game.krakatoa.maxHealth;
                game.krakatoa.rageMode = false;
                game.krakatoa._rageCineActive = false;
                game.krakatoa._rageCineDone = false;
                game.krakatoa.rageMorphProgress = 0;
                game.krakatoa.sealActive = false;
                game.krakatoa.state = "idle";
                game.arenaLocked = false;
                if (window.BossHUD) window.BossHUD.hide();
            }
            if (passedKraken) {
                game.stormMode = true;
                if (typeof window.initStormMode === "function") window.initStormMode(false);
            } else {
                game.stormMode = false;
            }
        } else {
            game.krakatoa = null;
            game.stormMode = false;
        }
        if (idx === 6) {
            const passedPumpkin = keepCheckpoint && currentCheckpoint && currentCheckpoint.level === 6 && currentCheckpoint.x > 26700;
            game.pumpkinBoss = typeof window.createPumpkinBoss === "function" ? window.createPumpkinBoss() : null;
            if (game.pumpkinBoss && passedPumpkin) {
                if (currentCheckpoint.x >= 26800 && currentCheckpoint.x < 42800) {
                    game.pumpkinBoss.state = "chase";
                    game.pumpkinBoss.x = currentCheckpoint.x - 560;
                    game.pumpkinBoss.y = 330;
                    game.pumpkinBoss.metamorphosisTriggered = true;
                    game.pumpkinBoss.chaseGraceTimer = 180;
                    game.arenaLocked = false;
                    if (!window.postGameHorror) {
                        try {
                            playBGM("bgm_pumpkin_chase");
                        } catch (e) {}
                    }
                } else {
                    game.pumpkinBoss.state = "defeated";
                    game.pumpkinBoss.health = 0;
                    game.arenaLocked = false;
                }
            }
        } else {
            game.pumpkinBoss = null;
        }
        game.lvl4State = null;
        game.lvl4Timer = 0;
        game.pasosPlayed = false;
        game.freeRoam = false;
        game.vignette = false;
        game.vignetteShrink = false;
        game.vignetteRadius = 260;
        game.happyMode = false;
        game.sadEnemies = false;
        game.forceRunDir = 0;
        game.corruption = 0;
        game.flash = 0;
        game.flashMode = false;
        game.happyCycle = 0;
        game.camY = 0;
        game.glitchT = 0;
        game.inHunt = false;
        game.huntKills = 0;
        game.dread = 0;
        game.huntEnemy = null;
        game.companionMsg = false;
        game.oopsShown = false;
        game.endingTimer = 0;
        game.endingStep = 0;
        game.msgShown1 = false;
        game.msgShown2 = false;
        game.msgShown3 = false;
        game.msgShown4 = false;
        game.msgShown5 = false;
        game.endingDone = false;
        bfShow = false;
        bfAlpha = 0;
        bfStalk = 0;
        bfTeeth = 0;
        bfLaugh = 0;
        bfAnnoyed = 0;
        bfEnraged = 0;
        bfShock = 0;
        bfNightmare = 0;
        game.textIdx = -1;
        game.doorMsg = false;
        game.doorStep = 0;
        game.doorTimer = 0;
        game.cageState = 0;
        game.cageTimer = 0;
        game.cageBtnPressed = false;
        game.cageOpenProgress = 0;
        game.cageGearsAngle = 0;
        game.cageCelebrateTimer = 0;
        game.cageFriends = null;
        game.cageAlreadySaved = false;
        if (lvl.jaula) {
            const alreadyRescued = typeof window.isLevelFriendRescued === "function" && window.isLevelFriendRescued(idx);
            if (alreadyRescued) {
                game.cageAlreadySaved = true;
                game.cageOpenProgress = 1;
                game.cageBtnPressed = false;
                game.cageFriends = [];
            } else {
                game.cageFriends = [];
                const cols = [ "#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#ff8f6b", "#c77dff", "#ff5d8f", "#5fd0e8" ];
                for (let cf = 0; cf < lvl.jaula.friends; cf++) game.cageFriends.push(cols[cf % cols.length]);
            }
        }
        slashes.length = 0;
        blood.length = 0;
        restos.length = 0;
        window.hideChoice();
        handDiv.style.display = "none";
        cursorDiv.style.display = "none";
        document.body.classList.remove("no-cursor");
        if (uiOverlay) {
            uiOverlay.style.display = "flex";
            uiOverlay.style.borderColor = window.postGameHorror || currentLevel >= 2 ? "#aa0000" : "#fff";
            uiOverlay.style.background = window.postGameHorror || currentLevel >= 2 ? "rgba(0,0,0,0.8)" : "rgba(255, 255, 255, 0.8)";
            uiOverlay.style.color = window.postGameHorror || currentLevel >= 2 ? "#fff" : "#333";
        }
        if (typeof window.updateTouchControlsVisibility === "function") window.updateTouchControlsVisibility();
        levelDisplay.innerText = window.postGameHorror ? "????" : __("level_name_" + (idx + 1));
        const isDarkLevel = window.postGameHorror || idx >= 2;
        levelDisplay.style.color = isDarkLevel ? "#ff0000" : "#ff9900";
        hpContainer.style.borderColor = isDarkLevel ? "#aa0000" : "#ff66aa";
        if (typeof window.updateHealthUI === "function") {
            window.updateHealthUI(PLAYER_MAX_HEALTH, PLAYER_MAX_HEALTH);
        } else {
            healthFill.style.background = isDarkLevel ? "linear-gradient(90deg, #dc2626, #ef4444, #ff0055)" : "linear-gradient(90deg, #ff2a85, #ff55a3, #ff007f)";
            gsap.to(healthFill, {
                width: "100%",
                duration: .5
            });
        }
        if (idx === 0) {
            score = 0;
            updateScore(score);
        }
        if (idx === 0 && game.subCaveMode) {
            playBGM("bgm_world1_cave");
        } else if (idx === 0 && game.iceMode) {
            if (!window.postGameHorror) playBGM("bgm_world1_ice");
            else playBGM(lvl.bgm);
        } else if (idx === 0 && (game.meadowNight || game.gate2Open)) {
            playBGM("bgm_world1_night");
        } else if (idx === 1 && game.pixelMode) {
            playBGM("bgm_world2_pixel_mode");
        } else if (idx === 2 && game.eruptingMode) {
            playBGM("bgm_world3_volcano");
        } else if (idx === 3 && game.stormMode) {
            playBGM("bgm_world4_storm");
        } else if (idx === 6 && game.pumpkinBoss && game.pumpkinBoss.state === "chase") {
            if (!window.postGameHorror) playBGM("bgm_pumpkin_chase");
            else playBGM(lvl.bgm);
        } else {
            playBGM(lvl.bgm);
        }
        try {
            preloadNextLevelBGM(idx);
        } catch (e) {}
        gameState = "playing";
        if (typeof window.focusGameCanvas === "function") {
            window.focusGameCanvas();
        }
    }
    function loadHubLevel(focusDoorIndex = 0) {
        playerLives = typeof MAX_LIVES !== "undefined" ? MAX_LIVES : 3;
        if (typeof window.updateLivesDisplay === "function") window.updateLivesDisplay();
        if (typeof gsap !== "undefined") {
            try {
                gsap.killTweensOf(game);
            } catch (e) {}
            try {
                if (game.player) gsap.killTweensOf(game.player);
            } catch (e) {}
            try {
                if (Array.isArray(game.platforms)) game.platforms.forEach(function(pf) {
                    gsap.killTweensOf(pf);
                });
            } catch (e) {}
            try {
                gsap.killTweensOf(getMessageDiv());
            } catch (e) {}
            try {
                gsap.set(getMessageDiv(), {
                    scale: 0,
                    opacity: 0
                });
            } catch (e) {}
        }
        try {
            CINEMA_TOKEN++;
        } catch (e) {}
        delete game.cameraOverrideX;
        if (typeof screenShake !== "undefined") {
            screenShake.intensity = 0;
            screenShake.x = 0;
            screenShake.y = 0;
        }
        const isIntro = (typeof gameState !== "undefined" && gameState === "introStory");
        if (!isIntro) {
            gameState = "playing";
        }
        keys = {};
        delete game.vignette;
        delete game.vignetteRadius;
        delete game.corruption;
        delete game.glitchT;
        delete game.doorDialog;
        delete game.doorDialogTimer;
        delete game.lvl4State;
        delete game.dread;
        delete game.inHunt;
        delete game.huntEnemy;
        delete game.huntKills;
        delete game.endingTimer;
        delete game.endingStep;
        delete game.endingDone;
        delete game.endingMsg1;
        delete game.endingMsg2;
        delete game.endingMsg3;
        delete game.endingSwallowInit;
        delete game.endingChompDone;
        delete game.msgShown1;
        delete game.msgShown2;
        delete game.msgShown3;
        delete game.msgShown4;
        delete game.msgShown5;
        bfShow = false;
        bfAlpha = 0;
        bfStalk = 0;
        bfTeeth = 0;
        bfLaugh = 0;
        bfAnnoyed = 0;
        bfEnraged = 0;
        if (typeof gsap !== "undefined") {
            gsap.to(getBlackoutDiv(), {
                opacity: 0,
                duration: 1.5,
                ease: "power2.out"
            });
        } else {
            getBlackoutDiv().style.opacity = 0;
        }
        game.isHub = true;
        currentLevel = "hub";
        worldWidth = (typeof window !== "undefined" && (window.isMobileDevice || (typeof window.isMobileOrTouch === "function" && window.isMobileOrTouch()) || (window.innerWidth <= 900 && "ontouchstart" in window))) ? 2850 : 2300;
        currentCheckpoint = null;
        game.iceMode = false;
        game.fireMode = false;
        game.arenaLocked = false;
        game.arenaMinX = 0;
        game.arenaMaxX = worldWidth;
        game.flash = 0;
        game.camY = 0;
        game.blueSquare = null;
        game.demon = null;
        try {
            [ game.techBoss, game.yellowSquare, game.krakatoa, game.pumpkinBoss, game.blueSquare ].forEach(function(b) {
                if (b && typeof gsap !== "undefined") gsap.killTweensOf(b);
            });
        } catch (e) {}
        game.krakatoa = null;
        game.pumpkinBoss = null;
        game.techBoss = null;
        game.yellowSquare = null;
        game.stormMode = false;
        game.meadowNight = false;
        game.subCaveMode = false;
        game.pixelMode = false;
        game.eruptingMode = false;
        game.nightTransitionProgress = null;
        game.invertControls = false;
        game.hideHealthBar = false;
        game.forceRunDir = 0;
        game.happyMode = false;
        game.sadEnemies = false;
        if (typeof window.stopHalloweenAudio === "function") {
            window.stopHalloweenAudio();
        }
        if (typeof window.initHalloweenLevel === "function") {
            window.initHalloweenLevel("hub");
        }
        try {
            if (typeof window.BossHUD !== "undefined" && typeof window.BossHUD.hide === "function") {
                window.BossHUD.hide();
            }
        } catch (e) {}
        projectiles = [];
        enemyProjectiles = [];
        particles = [];
        blood = [];
        restos = [];
        stars = [];
        floatingTexts = [];
        slashes.length = 0;
        blood.length = 0;
        restos.length = 0;
        window.hideChoice();
        if (handDiv) handDiv.style.display = "none";
        if (cursorDiv) cursorDiv.style.display = "none";
        document.body.classList.remove("no-cursor");
        game.platforms = [ new Platform({
            x: 0,
            y: 500,
            w: worldWidth,
            h: 80,
            unbreakable: true
        }), new Platform({
            x: 0,
            y: 0,
            w: 80,
            h: 580,
            unbreakable: true
        }), new Platform({
            x: (worldWidth - 80),
            y: 0,
            w: 80,
            h: 580,
            unbreakable: true
        }), new Platform({
            x: 0,
            y: -40,
            w: worldWidth,
            h: 60,
            unbreakable: true
        }) ];
        game.enemies = [];
        const isMobileHub = typeof window !== "undefined" && (window.isMobileDevice || (typeof window.isMobileOrTouch === "function" && window.isMobileOrTouch()));
        const hubDoorOffset = isMobileHub ? 450 : 0;
        game.hubDoors = [ {
            levelIndex: 0,
            levelNum: 1,
            x: 240 + hubDoorOffset,
            y: 414,
            w: 64,
            h: 86,
            titleKey: "level_name_1"
        }, {
            levelIndex: 3,
            levelNum: 2,
            x: 560 + hubDoorOffset,
            y: 414,
            w: 64,
            h: 86,
            titleKey: "level_name_4"
        }, {
            levelIndex: 2,
            levelNum: 3,
            x: 880 + hubDoorOffset,
            y: 414,
            w: 64,
            h: 86,
            titleKey: "level_name_3"
        }, {
            levelIndex: 1,
            levelNum: 4,
            x: 1200 + hubDoorOffset,
            y: 414,
            w: 64,
            h: 86,
            titleKey: "level_name_2"
        }, {
            levelIndex: 6,
            levelNum: 5,
            x: 1520 + hubDoorOffset,
            y: 414,
            w: 64,
            h: 86,
            titleKey: "level_name_7"
        }, {
            levelIndex: 4,
            levelNum: 6,
            x: 1840 + hubDoorOffset,
            y: 414,
            w: 64,
            h: 86,
            titleKey: "level_name_5"
        } ];
        if (window.postGameHorror) {
            const hW = 82;
            const hH = 106;
            const hY = 500 - hH;
            game.hubDoors = [ {
                levelIndex: 0,
                levelNum: 1,
                x: 200 + hubDoorOffset,
                y: hY,
                w: hW,
                h: hH,
                titleKey: "level_name_1"
            }, {
                levelIndex: 3,
                levelNum: 2,
                x: 540 + hubDoorOffset,
                y: hY,
                w: hW,
                h: hH,
                titleKey: "level_name_4"
            }, {
                levelIndex: 2,
                levelNum: 3,
                x: 1440 + hubDoorOffset,
                y: hY,
                w: hW,
                h: hH,
                titleKey: "level_name_3"
            }, {
                levelIndex: 1,
                levelNum: 4,
                x: 1760 + hubDoorOffset,
                y: hY,
                w: hW,
                h: hH,
                titleKey: "level_name_2"
            }, {
                levelIndex: 6,
                levelNum: 5,
                x: 2080 + hubDoorOffset,
                y: hY,
                w: hW,
                h: hH,
                titleKey: "level_name_7"
            } ];
        }

        let targetDoor = null;
        if (typeof focusDoorIndex === "object" && focusDoorIndex !== null) {
            targetDoor = game.hubDoors.find(d => d.levelNum === focusDoorIndex.levelNum) || focusDoorIndex;
        } else if (typeof focusDoorIndex === "number" && !isNaN(focusDoorIndex)) {
            const byLevelNum = game.hubDoors.find(d => d.levelNum === focusDoorIndex);
            if (byLevelNum && (focusDoorIndex > 0 && !game.hubDoors[focusDoorIndex])) {
                targetDoor = byLevelNum;
            } else if (focusDoorIndex >= 0 && focusDoorIndex < game.hubDoors.length) {
                targetDoor = game.hubDoors[focusDoorIndex];
            } else if (byLevelNum) {
                targetDoor = byLevelNum;
            }
        }
        if (!targetDoor) {
            if (typeof window.lastEnteredHubDoorLevelNum === "number") {
                targetDoor = game.hubDoors.find(d => d.levelNum === window.lastEnteredHubDoorLevelNum);
            } else if (typeof window.lastEnteredHubLevelIndex === "number") {
                targetDoor = game.hubDoors.find(d => d.levelIndex === window.lastEnteredHubLevelIndex);
            } else if (typeof currentLevel === "number" && currentLevel >= 0) {
                targetDoor = game.hubDoors.find(d => d.levelIndex === currentLevel);
            } else if (typeof window.lastPlayedLevelIndex === "number") {
                targetDoor = game.hubDoors.find(d => d.levelIndex === window.lastPlayedLevelIndex);
            }
        }
        if (!targetDoor) {
            targetDoor = game.hubDoors[0];
        }
        const startX = targetDoor ? targetDoor.x + targetDoor.w / 2 - 16 : (80 + hubDoorOffset);
        game.player = new Player(startX, 440);
        cameraX = Math.max(0, Math.min(game.player.x - VIEW_W / 2 + game.player.w / 2, worldWidth - VIEW_W));
        delete game.cameraZoom;
        delete game.zoomTargetWorldX;
        delete game.zoomTargetWorldY;
        if (window.hubSpawnPortalPending) {
            window.hubSpawnPortalPending = false;
            const portalSpawnX = startX + game.player.w / 2;
            const portalSpawnY = 414;
            game.spawnPortal = {
                x: portalSpawnX,
                y: portalSpawnY,
                groundY: 440,
                state: "opening",
                scale: 0,
                rotation: 0,
                timer: 0
            };
            const padZone = document.getElementById("pad-zone");
            if (padZone) {
                padZone.style.opacity = "0";
                padZone.style.pointerEvents = "none";
            }
            game.player.y = portalSpawnY;
            game.player.frozen = true;
            game.player.hidden = true;
            game.player.vx = 0;
            game.player.vy = 0;
        } else {
            game.spawnPortal = null;
            const padZone = document.getElementById("pad-zone");
            if (padZone) {
                padZone.style.opacity = "1";
                padZone.style.pointerEvents = "auto";
            }
        }
        game.isEnteringDoor = false;
        window.canEnterDoor = false;
        function initHubFriends() {
            game.hubFriends = [];
            if (window.postGameHorror) {
                game.hubDeathAltar = {
                    x: 1030,
                    y: 500,
                    particles: [],
                    bubbleAlpha: 0,
                    bubbleScale: 0.65,
                    hasTriggered: false
                };
                game.hubDoors.forEach(d => {
                    if (d.levelNum === 6) d.boarded = true;
                });
                restos.length = 0;
                const deadConfigs = [ {
                    name: "Azulín",
                    color: "#0284c7",
                    x: 370
                }, {
                    name: "Verdecito",
                    color: "#16a34a",
                    x: 740
                }, {
                    name: "Amarillín",
                    color: "#ca8a04",
                    x: 1260
                }, {
                    name: "Moradito",
                    color: "#7c3aed",
                    x: 1600
                }, {
                    name: "Naranjita",
                    color: "#ea580c",
                    x: 1920
                } ];
                deadConfigs.forEach(f => {
                    restos.push({
                        x: f.x - 18,
                        y: 500 - 9,
                        w: 32,
                        h: 18,
                        color: f.color,
                        part: "top",
                        rot: -.25,
                        groundY: 500,
                        settled: true,
                        poolRadius: 26,
                        vx: 0,
                        vy: 0,
                        vRot: 0
                    });
                    restos.push({
                        x: f.x + 20,
                        y: 500 - 8,
                        w: 32,
                        h: 16,
                        color: f.color,
                        part: "bottom",
                        rot: .2,
                        groundY: 500,
                        settled: true,
                        poolRadius: 22,
                        vx: 0,
                        vy: 0,
                        vRot: 0
                    });
                });
                for (let i = 0; i < 30; i++) {
                    restos.push({
                        x: 220 + Math.random() * (worldWidth - 440),
                        y: 500 - 2,
                        vx: 0,
                        vy: 0,
                        size: 4 + Math.random() * 8,
                        color: "#7f1d1d",
                        life: 99999,
                        type: "gibs",
                        groundY: 500,
                        settled: true,
                        poolRadius: 8 + Math.random() * 12
                    });
                }
                return;
            }
            const effectiveRescued = Math.max(unlockedLevel ? unlockedLevel - 1 : 0, window.pendingUnlockDoorNum ? window.pendingUnlockDoorNum - 1 : 0);
            const configs = [ {
                id: "azulin",
                name: "Azulín",
                topColor: "#7dd3fc",
                botColor: "#0284c7",
                cheekColor: "rgba(255, 102, 170, 0.65)",
                x: 400
            }, {
                id: "verdecito",
                name: "Verdecito",
                topColor: "#86efac",
                botColor: "#16a34a",
                cheekColor: "rgba(255, 120, 160, 0.65)",
                x: 720
            }, {
                id: "amarillin",
                name: "Amarillín",
                topColor: "#fde047",
                botColor: "#ca8a04",
                cheekColor: "rgba(255, 90, 140, 0.65)",
                x: 1040
            }, {
                id: "moradito",
                name: "Moradito",
                topColor: "#d8b4fe",
                botColor: "#7c3aed",
                cheekColor: "rgba(255, 105, 180, 0.65)",
                x: 1360
            }, {
                id: "naranjita",
                name: "Naranjita",
                topColor: "#fdba74",
                botColor: "#ea580c",
                cheekColor: "rgba(255, 100, 150, 0.65)",
                x: 1680
            } ];
            for (let i = 0; i < effectiveRescued && i < configs.length; i++) {
                const cfg = configs[i];
                game.hubFriends.push({
                    id: cfg.id,
                    friendIdx: i,
                    name: cfg.name,
                    topColor: cfg.topColor,
                    botColor: cfg.botColor,
                    cheekColor: cfg.cheekColor,
                    x: cfg.x,
                    baseX: cfg.x,
                    y: 468,
                    w: 32,
                    h: 32,
                    facing: 1,
                    hopTimer: Math.floor(Math.random() * 100),
                    wanderTimer: Math.floor(Math.random() * 80),
                    msgIndex: 0,
                    speechBubble: null,
                    talkCooldown: 0
                });
            }
            if (typeof window.isLithiumRescued === "function" && window.isLithiumRescued()) {
                game.hubLithium = {
                    x: 820,
                    y: 410,
                    baseX: 820,
                    baseY: 410,
                    w: 28,
                    h: 28,
                    facing: 1,
                    scaleX: 1,
                    scaleY: 1,
                    state: "levitating",
                    stateTimer: 0,
                    cycleTimer: 0,
                    flightProgress: 0,
                    glowTimer: 0,
                    glowIntensity: 0,
                    glowing: 0,
                    trail: [],
                    speechBubble: null,
                    talkCooldown: 0,
                    msgIndex: 0
                };
            } else {
                game.hubLithium = null;
            }
        }
        window.initHubFriends = initHubFriends;
        initHubFriends();
        try {
            if (!isIntro && uiOverlay) uiOverlay.style.display = "flex";
            levelDisplay.innerText = window.postGameHorror ? "????" : __("ui_hub_title") || "Cuarto de Puertas";
            levelDisplay.style.color = window.postGameHorror ? "#ff0000" : "#38bdf8";
            document.body.style.background = window.postGameHorror ? "#000000" : "#03000a";
            uiOverlay.style.borderColor = window.postGameHorror ? "#4a0000" : "#a855f7";
            uiOverlay.style.background = window.postGameHorror ? "rgba(10, 0, 0, 0.95)" : "rgba(15, 8, 28, 0.88)";
            uiOverlay.style.color = window.postGameHorror ? "#ff5555" : "#ffffff";
            hpContainer.style.borderColor = window.postGameHorror ? "#aa0000" : "#c084fc";
            if (typeof window.updateHealthUI === "function") {
                window.updateHealthUI(PLAYER_MAX_HEALTH, PLAYER_MAX_HEALTH);
            } else {
                healthFill.style.background = window.postGameHorror ? "linear-gradient(90deg, #dc2626, #ef4444, #ff0055)" : "linear-gradient(90deg, #ff2a85, #ff55a3, #ff007f)";
                gsap.to(healthFill, {
                    width: "100%",
                    duration: .3
                });
            }
        } catch (e) {}
        if (!isIntro) {
            if (window.postGameHorror) {
                playBGM("bgm_world5_dread");
            } else {
                playBGM("bgm_menu_level_select");
            }
        }
        [ "pause-modal", "gameover-modal", "defeat-modal", "victory-modal", "level-map-modal" ].forEach(id => {
            const m = document.getElementById(id);
            if (m) m.classList.remove("active");
        });
        if (!isIntro) {
            gameState = "playing";
            if (typeof window.updateTouchControlsVisibility === "function") window.updateTouchControlsVisibility();
            if (typeof window.focusGameCanvas === "function") window.focusGameCanvas();
            if (window.pendingUnlockDoorNum && window.pendingUnlockDoorNum > unlockedLevel) {
                playDoorUnlockCinematic(window.pendingUnlockDoorNum);
            }
        }
    }
    window.loadHubLevel = loadHubLevel;
    function playDoorUnlockCinematic(targetDoorNum) {
        if (!game.isHub || !Array.isArray(game.hubDoors)) return;
        const targetDoor = game.hubDoors.find(d => d.levelNum === targetDoorNum);
        if (!targetDoor) return;
        if (typeof gsap === "undefined") {
            unlockedLevel = Math.max(unlockedLevel, targetDoorNum);
            try {
                (typeof window !== "undefined" && typeof window.storageSet === "function" ? window.storageSet : (k, v) => localStorage.setItem(k, v))("starcube_unlocked_v2", String(unlockedLevel));
            } catch (e) {}
            window.pendingUnlockDoorNum = null;
            if (game.player) game.player.frozen = false;
            return;
        }
        const thisToken = CINEMA_TOKEN;
        if (game.player) {
            game.player.frozen = true;
            game.player.vx = 0;
            game.player.vy = 0;
        }
        targetDoor.unlockAnim = {
            glow: 0,
            unlocked: false
        };
        const doorCamX = Math.max(0, Math.min(targetDoor.x + targetDoor.w / 2 - VIEW_W / 2, worldWidth - VIEW_W));
        const peggyCamX = game.player ? Math.max(0, Math.min(game.player.x + game.player.w / 2 - VIEW_W / 2, worldWidth - VIEW_W)) : 0;
        game.cameraOverrideX = cameraX;
        gsap.to(game, {
            cameraOverrideX: doorCamX,
            duration: 1.5,
            ease: "power2.inOut",
            onComplete: () => {
                if (CINEMA_TOKEN !== thisToken) return;
                setTimeout(() => {
                    if (CINEMA_TOKEN !== thisToken) return;
                    try {
                        playSound(220, .45, "sine", .6, 520);
                    } catch (e) {}
                    gsap.to(targetDoor.unlockAnim, {
                        glow: 1,
                        duration: 1.8,
                        ease: "power1.in",
                        onUpdate: () => {
                            if (CINEMA_TOKEN !== thisToken) return;
                            if (Math.random() < .6) {
                                particles.push({
                                    x: targetDoor.x + Math.random() * targetDoor.w,
                                    y: targetDoor.y + targetDoor.h - 8,
                                    vx: (Math.random() - .5) * 3,
                                    vy: -Math.random() * 3.5 - 1.2,
                                    color: Math.random() < .5 ? "#38bdf8" : "#ffffff",
                                    life: 24,
                                    maxLife: 24,
                                    size: 3 + Math.random() * 3,
                                    type: "spark"
                                });
                            }
                        },
                        onComplete: () => {
                            if (CINEMA_TOKEN !== thisToken) return;
                            game.flash = .8;
                            if (typeof screenShake !== "undefined") {
                                screenShake.intensity = 8;
                            }
                            try {
                                playSound(523.25, .3, "triangle", .4);
                                setTimeout(() => {
                                    try {
                                        playSound(659.25, .3, "triangle", .4);
                                    } catch (e) {}
                                }, 120);
                                setTimeout(() => {
                                    try {
                                        playSound(783.99, .35, "triangle", .4);
                                    } catch (e) {}
                                }, 240);
                                setTimeout(() => {
                                    try {
                                        playSound(1046.5, .65, "sine", .6);
                                    } catch (e) {}
                                }, 360);
                            } catch (e) {}
                            try {
                                createExplosion(targetDoor.x + targetDoor.w / 2, targetDoor.y + targetDoor.h / 2, "#38bdf8", 35, 25);
                                createExplosion(targetDoor.x + targetDoor.w / 2, targetDoor.y + targetDoor.h / 2, "#ffffff", 25, 18);
                            } catch (e) {}
                            targetDoor.unlockAnim.unlocked = true;
                            unlockedLevel = Math.max(unlockedLevel, targetDoorNum);
                            try {
                                (typeof window !== "undefined" && typeof window.storageSet === "function" ? window.storageSet : (k, v) => localStorage.setItem(k, v))("starcube_unlocked_v2", String(unlockedLevel));
                            } catch (e) {}
                            window.pendingUnlockDoorNum = null;
                            if (typeof initHubFriends === "function") initHubFriends();
                            addFloatingText(targetDoor.x + targetDoor.w / 2, targetDoor.y - 48, __("ui_nivel_desbloqueado"), "#fbbf24", 20);
                            setTimeout(() => {
                                if (CINEMA_TOKEN !== thisToken) return;
                                gsap.to(game, {
                                    cameraOverrideX: peggyCamX,
                                    duration: 1.3,
                                    ease: "power2.inOut",
                                    onComplete: () => {
                                        if (CINEMA_TOKEN !== thisToken) return;
                                        delete game.cameraOverrideX;
                                        targetDoor.unlockAnim = null;
                                        if (game.player) game.player.frozen = false;
                                        window.showAnimatedMessage(__("msg_puerta_desbloqueada"));
                                        if (typeof window.focusGameCanvas === "function") window.focusGameCanvas();
                                    }
                                });
                            }, 1100);
                        }
                    });
                }, 500);
            }
        });
    }
    window.playDoorUnlockCinematic = playDoorUnlockCinematic;
    function updateUITranslations() {
        if (healthLabel) healthLabel.textContent = __("ui_health");
        if (controlsInfo) controlsInfo.textContent = __("ui_controls");
        if (choiceText) choiceText.textContent = __("ui_choice_question");
        if (choiceSub) choiceSub.textContent = __("ui_choice_sub");
        if (btnSi) btnSi.textContent = __("ui_choice_yes");
        if (btnNo) btnNo.textContent = __("ui_choice_no");
        if (langTitle) langTitle.textContent = __("ui_select_language");
        if (splashAuthor) splashAuthor.textContent = __("ui_splash_author");
        document.title = __("ui_page_title");
        const subEl = gameTitle?.querySelector(".starcube-subtitle");
        if (subEl) subEl.textContent = __("ui_subtitle");
        const titleEl = gameTitle?.querySelector(".starcube-title");
        if (titleEl) {
            if (window.postGameHorror) {
                titleEl.classList.add("horror");
            } else {
                titleEl.classList.remove("horror");
            }
        }
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.dataset.i18n;
            if (key) {
                const text = __(key);
                if (text && text.includes("<br>")) {
                    el.innerHTML = text;
                } else {
                    el.textContent = text;
                }
            }
        });
        const creditEl = document.getElementById("corner-credit");
        if (creditEl) {
            const rawCredit = typeof __ === "function" ? __("ui_corner_credit") : "Desarrollado por: Isaac Daniel Cotera (Cotera)";
            if (rawCredit && rawCredit.includes(":")) {
                const parts = rawCredit.split(":");
                creditEl.innerHTML = `<span class="credit-label">${parts[0]}:</span> <span class="author-highlight">${parts.slice(1).join(":")}</span>`;
            } else if (rawCredit && rawCredit.includes("：")) {
                const parts = rawCredit.split("：");
                creditEl.innerHTML = `<span class="credit-label">${parts[0]}：</span> <span class="author-highlight">${parts.slice(1).join("：")}</span>`;
            } else if (rawCredit) {
                creditEl.innerHTML = `<span class="credit-label">${rawCredit}</span>`;
            }
        }
        if (typeof updateScore === "function" && typeof score !== "undefined") {
            updateScore(score);
        }
        if (typeof selectLevelNode === "function" && typeof selectedMapLevel !== "undefined") {
            selectLevelNode(selectedMapLevel);
        }
        if (window.postGameHorror) {
            document.body.classList.add("horror-mode");
        } else {
            document.body.classList.remove("horror-mode");
        }
        const curLang = typeof getCurrentLang === "function" ? getCurrentLang() : "en";
        const langCodeEl = document.getElementById("lang-toggle-code");
        if (langCodeEl) langCodeEl.textContent = curLang.toUpperCase();
        if ((!window.BossHUD || !window.BossHUD._active) && typeof levelDisplay !== "undefined" && levelDisplay && typeof currentLevel === "number" && currentLevel >= 0 && typeof levels !== "undefined" && currentLevel < levels.length) {
            levelDisplay.innerText = __("level_name_" + (currentLevel + 1));
        }
        document.querySelectorAll(".lang-btn").forEach(btn => {
            const code = btn.dataset.lang;
            const nameEl = btn.querySelector(".name");
            if (nameEl) nameEl.textContent = getLangName(code, code);
            if (code === curLang) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });
        if (typeof window.syncOptionsUI === "function") {
            window.syncOptionsUI();
        }
    }
    window.updateUITranslations = updateUITranslations;
    function initGameFlow() {
        const langToggleBtn = document.getElementById("btn-lang-toggle");
        const closeLangBtn = document.getElementById("close-lang-btn");
        if (splashScreen) {
            splashScreen.style.display = "none";
        }
        if (langSelect) {
            langSelect.style.display = "flex";
            langSelect.classList.add("visible");
            langSelect.style.opacity = "1";
        }

        async function onSelectLanguage(lang) {
            try {
                const el = document.documentElement;
                if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
                    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
                }
                if (screen.orientation && screen.orientation.lock) {
                    screen.orientation.lock("landscape").catch(() => {});
                } else if (screen.lockOrientation) {
                    screen.lockOrientation("landscape");
                }
            } catch (_) {}

            try {
                initAudio();
                if (typeof audioCtx !== "undefined" && audioCtx && audioCtx.state === "suspended") {
                    audioCtx.resume().catch(() => {});
                }
            } catch (_) {}

            await setLanguage(lang);
            updateUITranslations();

            if (langSelect) {
                langSelect.classList.remove("visible");
                langSelect.style.opacity = "0";
                setTimeout(() => {
                    langSelect.style.display = "none";
                    if (!gameReady) {
                        gameState = "title_intro";
                        window.titleIntroTimer = 0;
                        if (typeof game !== "undefined") game.nightTransitionProgress = 1;
                        gameReady = true;
                        window.gameReady = true;
                        window.GAME_PAUSED = false;
                        if (typeof window.notifyGamePixLoaded === "function") {
                            window.notifyGamePixLoaded();
                        }
                        if (typeof window.gameLoadingStop === "function") {
                            window.gameLoadingStop();
                        }
                        try {
                            if (typeof drawEnhancedBackground === "function") {
                                drawEnhancedBackground(ctx, currentLevel, cameraX, 0, game);
                            }
                        } catch (err) {}
                        try {
                            if (typeof currentBGM === "undefined" || !currentBGM || currentBGM.paused) {
                                playBGM("bgm_menu_title");
                            }
                        } catch (e) {}
                    } else {
                        const titleBtns = document.getElementById("title-buttons");
                        if (titleBtns && (gameState === "start" || gameState === "title" || gameState === "title_intro")) {
                            titleBtns.classList.remove("hidden");
                        }
                        if (langToggleBtn) langToggleBtn.style.display = "flex";
                    }
                }, 300);
            }
        }

        document.querySelectorAll(".lang-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                onSelectLanguage(btn.dataset.lang);
            });
        });

        function openLanguageSelector(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            if (langSelect) {
                if (closeLangBtn) closeLangBtn.style.display = "inline-block";
                langSelect.style.display = "flex";
                langSelect.style.opacity = "1";
                langSelect.style.pointerEvents = "auto";
                langSelect.classList.add("visible");
                updateUITranslations();
                
                const titleBtns = document.getElementById("title-buttons");
                if (titleBtns) titleBtns.classList.add("hidden");
                if (langToggleBtn) langToggleBtn.style.display = "none";
            }
        }
        window.openLanguageSelector = openLanguageSelector;

        function closeLanguageSelector(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            if (langSelect) {
                langSelect.classList.remove("visible");
                langSelect.style.opacity = "0";
                setTimeout(() => {
                    langSelect.style.display = "none";
                }, 300);
            }
            const titleBtns = document.getElementById("title-buttons");
            if (titleBtns && (gameState === "start" || gameState === "title" || gameState === "title_intro")) {
                titleBtns.classList.remove("hidden");
            }
            if (langToggleBtn) langToggleBtn.style.display = "flex";
        }

        if (closeLangBtn) {
            closeLangBtn.addEventListener("click", closeLanguageSelector);
            closeLangBtn.addEventListener("touchend", closeLanguageSelector);
        }

        if (langToggleBtn) {
            langToggleBtn.addEventListener("click", openLanguageSelector);
            langToggleBtn.addEventListener("touchend", openLanguageSelector);
        }


        const startBtn = document.getElementById("start-btn");
        if (startBtn) {
            startBtn.addEventListener("click", () => {
                startGameFromButton();
            });
        }

        const hubBtn = document.getElementById("hub-btn");
        if (hubBtn) {
            hubBtn.addEventListener("click", () => {
                initAudio();
                gameTitle.style.opacity = "0";
        if (cornerCredit) cornerCredit.style.opacity = "0";
                const titleBtns = document.getElementById("title-buttons");
                if (titleBtns) titleBtns.classList.add("hidden");
                if (langToggleBtn) langToggleBtn.style.display = "none";
                loadHubLevel(Math.min(unlockedLevel - 1, 5));
                if (typeof window.gameLoadingStop === "function") window.gameLoadingStop();
                if (typeof window.gameplayStart === "function") window.gameplayStart();
                if (typeof window.focusGameCanvas === "function") window.focusGameCanvas();
            });
        }
    }
    initGameFlow();
    document.addEventListener("languageChanged", () => {
        updateUITranslations();
        if (currentLevel >= 0 && currentLevel < levels.length) {
            levelDisplay.innerText = __("level_name_" + (currentLevel + 1));
        }
        updateScore(score);
    });
    let _lastFrameTime = 0;
    let _hasFrameTime = false;
    let _acc = 0;
    let _pixelTempCanvas = null, _pixelTempCtx = null;
    function spawnTreeArenaWave(wave) {
        if (!game || !game.enemies) return;
        const newEnemies = [];

        if (wave === 1) {
            const tree1 = new Enemy({
                type: "fire_tree",
                x: 8500,
                y: 380,
                w: 80,
                h: 120,
                health: 160,
                shootInterval: 80
            });
            newEnemies.push(tree1);
        } else if (wave === 2) {
            const tree2 = new Enemy({
                type: "fire_tree",
                x: 8150,
                y: 380,
                w: 85,
                h: 125,
                health: 200,
                shootInterval: 75
            });
            newEnemies.push(tree2);
        } else if (wave === 3) {
            const tree3 = new Enemy({
                type: "fire_tree",
                x: 8850,
                y: 380,
                w: 90,
                h: 130,
                health: 240,
                shootInterval: 70
            });
            newEnemies.push(tree3);
        } else if (wave === 4) {
            const turret1 = new Enemy({
                type: "igneous_turret",
                x: 7950,
                y: 454,
                w: 54,
                h: 46,
                health: 100,
                shootInterval: 75
            });
            const turret2 = new Enemy({
                type: "igneous_turret",
                x: 9050,
                y: 454,
                w: 54,
                h: 46,
                health: 100,
                shootInterval: 75
            });
            newEnemies.push(turret1, turret2);
        } else if (wave === 5) {
            const giantTree = new Enemy({
                type: "fire_tree",
                giant: true,
                x: 8500,
                y: 350,
                w: 110,
                h: 150,
                health: 350,
                shootInterval: 60
            });
            const turret = new Enemy({
                type: "igneous_turret",
                x: 8050,
                y: 454,
                w: 54,
                h: 46,
                health: 110,
                shootInterval: 70
            });
            newEnemies.push(giantTree, turret);
        }

        newEnemies.forEach(en => {
            en.summoningTimer = 180;
            game.enemies.push(en);
            if (!game.l2ArenaEnemies) game.l2ArenaEnemies = [];
            game.l2ArenaEnemies.push(en);
            try {
                if (typeof playSound === "function") {
                    playSound(90, 0.4, "sawtooth", 0.35, 120);
                }
            } catch (e) {}
        });
    }

    function updateLevel2BurningTreeArena(game, cameraX, VIEW_W, VIEW_H) {
        if (!game || !game.player || currentLevel !== 2) return;

        if (!game.l2ArenaTriggered && !game.l2ArenaDone) {
            if (game.player.x >= 7750 && game.player.x <= 9300 && game.player.y >= 260 && !game.player.frozen) {
                game.l2ArenaTriggered = true;
                game.l2ArenaActive = true;
                game.arenaLocked = true;
                game.arenaMinX = 7690;
                game.arenaMaxX = 9400;
                game.l2ArenaWave = 1;
                game.l2ArenaEnemies = [];
                game.l2ArenaWaveTransition = 0;

                const gates = (game.platforms || []).filter(p => p.isTreeArenaGate);
                const entranceGate = gates.find(g => g.isTreeArenaGate === "entrance");
                const exitGate = gates.find(g => g.isTreeArenaGate === "exit");

                if (typeof gsap !== "undefined" && entranceGate && exitGate) {
                    game.player.frozen = true;
                    game.player.vx = 0;
                    game.cameraOverrideX = cameraX;

                    const curPlayerX = game.player.x;
                    const exitCam = Math.max(0, Math.min(exitGate.x + exitGate.w / 2 - VIEW_W * 0.72, worldWidth - VIEW_W));
                    const entCam = Math.max(0, Math.min(entranceGate.x + entranceGate.w / 2 - VIEW_W * 0.28, worldWidth - VIEW_W));
                    const playerCam = Math.max(0, Math.min(curPlayerX + game.player.w / 2 - VIEW_W / 2, worldWidth - VIEW_W));

                    gsap.to(game, {
                        cameraOverrideX: exitCam,
                        duration: 0.65,
                        ease: "power2.inOut",
                        onComplete: () => {
                            gsap.to(exitGate, {
                                y: 180,
                                duration: 0.38,
                                ease: "bounce.out",
                                onComplete: () => {
                                    applyShake(18);
                                    try { playSound(80, 0.5, "sawtooth", 0.45, 35); } catch (e) {}
                                    try { playSound(140, 0.4, "square", 0.35, 60); } catch (e) {}
                                    for (let i = 0; i < 20; i++) {
                                        particles.push({
                                            x: exitGate.x + Math.random() * exitGate.w,
                                            y: 500,
                                            vx: (Math.random() - 0.5) * 6,
                                            vy: -Math.random() * 4 - 2,
                                            color: Math.random() < 0.5 ? "#555555" : "#ff4400",
                                            life: 25,
                                            size: 3,
                                            type: "spark"
                                        });
                                    }

                                    setTimeout(() => {
                                        gsap.to(game, {
                                            cameraOverrideX: entCam,
                                            duration: 0.75,
                                            ease: "power2.inOut",
                                            onComplete: () => {
                                                gsap.to(entranceGate, {
                                                    y: 180,
                                                    duration: 0.38,
                                                    ease: "bounce.out",
                                                    onComplete: () => {
                                                        applyShake(20);
                                                        try { playSound(75, 0.55, "sawtooth", 0.5, 30); } catch (e) {}
                                                        try { playSound(130, 0.4, "square", 0.35, 55); } catch (e) {}
                                                        for (let i = 0; i < 20; i++) {
                                                            particles.push({
                                                                x: entranceGate.x + Math.random() * entranceGate.w,
                                                                y: 500,
                                                                vx: (Math.random() - 0.5) * 6,
                                                                vy: -Math.random() * 4 - 2,
                                                                color: Math.random() < 0.5 ? "#555555" : "#ff4400",
                                                                life: 25,
                                                                size: 3,
                                                                type: "spark"
                                                            });
                                                        }

                                                        setTimeout(() => {
                                                            gsap.to(game, {
                                                                cameraOverrideX: playerCam,
                                                                duration: 0.65,
                                                                ease: "power2.inOut",
                                                                 onComplete: () => {
                                                                    delete game.cameraOverrideX;
                                                                    if (game.player) game.player.frozen = false;
                                                                    addFloatingText(game.player ? game.player.x : 8500, 190, typeof __ === "function" ? __("flt_arena_bosque") : "¡ARENA DEL BOSQUE ARDIENTE!", "#ff3300", 24);
                                                                    spawnTreeArenaWave(1);
                                                                }
                                                            });
                                                        }, 250);
                                                    }
                                                });
                                            }
                                        });
                                    }, 250);
                                }
                            });
                        }
                    });
                } else {
                    gates.forEach(g => { g.y = 180; });
                    applyShake(16);
                    try { playSound(95, 0.45, "sawtooth", 0.4, 40); } catch (e) {}
                    try { playSound(130, 0.35, "square", 0.3, 60); } catch (e) {}
                    addFloatingText(game.player.x, 190, typeof __ === "function" ? __("flt_arena_bosque") : "¡ARENA DEL BOSQUE ARDIENTE!", "#ff3300", 22);
                    spawnTreeArenaWave(1);
                }
            }
            return;
        }

        if (game.l2ArenaActive) {
            const gates = (game.platforms || []).filter(p => p.isTreeArenaGate);
            gates.forEach(g => {
                if (typeof gsap === "undefined" || !gsap.isTweening(g)) {
                    g.y = 180;
                }
            });

            game.l2ArenaEnemies = (game.l2ArenaEnemies || []).filter(e => e && e.active && e.health > 0);

            if (game.l2ArenaEnemies.length === 0) {
                if (!game.l2ArenaWaveTransition) {
                    game.l2ArenaWaveTransition = 50;
                } else {
                    game.l2ArenaWaveTransition--;
                    if (game.l2ArenaWaveTransition === 1) {
                        if (game.l2ArenaWave === 1) {
                            game.l2ArenaWave = 2;
                            addFloatingText(game.player ? game.player.x : 8500, 190, typeof __ === "function" ? __("flt_arena_arbol_2") : "¡SEGUNDO ÁRBOL ÍGNEO!", "#ff6600", 22);
                            try { playSound(420, 0.3, "triangle", 0.3, 200); } catch (e) {}
                            applyShake(10);
                            spawnTreeArenaWave(2);
                        } else if (game.l2ArenaWave === 2) {
                            game.l2ArenaWave = 3;
                            addFloatingText(game.player ? game.player.x : 8500, 190, typeof __ === "function" ? __("flt_arena_arbol_3") : "¡TERCER ÁRBOL ÍGNEO!", "#ff4400", 22);
                            try { playSound(380, 0.35, "triangle", 0.3, 220); } catch (e) {}
                            applyShake(12);
                            spawnTreeArenaWave(3);
                        } else if (game.l2ArenaWave === 3) {
                            game.l2ArenaWave = 4;
                            addFloatingText(game.player ? game.player.x : 8500, 190, typeof __ === "function" ? __("flt_arena_torretas") : "¡DOS TORRETAS ÍGNEAS!", "#ff2200", 24);
                            try { playSound(320, 0.4, "sawtooth", 0.35, 140); } catch (e) {}
                            applyShake(14);
                            spawnTreeArenaWave(4);
                        } else if (game.l2ArenaWave === 4) {
                            game.l2ArenaWave = 5;
                            addFloatingText(game.player ? game.player.x : 8500, 190, typeof __ === "function" ? __("flt_arena_manzano") : "¡GRAN MANZANO ÍGNEO & TORRETA!", "#ff0000", 24);
                            try { playSound(220, 0.45, "sawtooth", 0.4, 90); } catch (e) {}
                            applyShake(18);
                            spawnTreeArenaWave(5);
                        } else if (game.l2ArenaWave === 5) {
                            game.l2ArenaActive = false;
                            game.l2ArenaDone = true;
                            game.arenaLocked = false;

                            gates.forEach(g => {
                                if (typeof gsap !== "undefined") {
                                    gsap.to(g, {
                                        y: -250,
                                        duration: 0.85,
                                        ease: "power2.inOut"
                                    });
                                } else {
                                    g.y = -250;
                                }
                            });

                            applyShake(10);
                            try { playSound(520, 0.4, "sine", 0.4, 1040); } catch (e) {}
                            addFloatingText(game.player ? game.player.x : 8500, 190, typeof __ === "function" ? __("flt_arena_superada") : "¡ARENA SUPERADA!", "#ffd700", 26);

                            stars.push({
                                x: 8500,
                                y: 440,
                                w: 24,
                                h: 24,
                                collected: false
                            });
                            score += 300;
                            updateScore(score);
                        }
                    }
                }
            }
        }
    }

    function createChasmInPlatform(platforms, targetX, targetY, chasmStartRel, chasmWidth, options = {}) {
        const absX = chasmStartRel != null ? targetX + chasmStartRel : targetX;
        const idx = platforms.findIndex(p => Math.abs(p.y - targetY) < 30 && p.x <= absX && (p.x + p.w) >= absX + chasmWidth && !p.isHorrorPit);
        if (idx === -1) return;
        const orig = platforms[idx];
        const leftW = absX - orig.x;
        const rightW = (orig.x + orig.w) - (absX + chasmWidth);
        if (leftW < 40 || rightW < 40) return;

        const leftPiece = new Platform({
            x: orig.x,
            y: orig.y,
            w: leftW,
            h: orig.h,
            color: orig.color
        });

        const rightPiece = new Platform({
            x: absX + chasmWidth,
            y: orig.y,
            w: rightW,
            h: orig.h,
            color: orig.color
        });

        const isLava = !!options.lava;
        const pitHazard = new Platform({
            x: absX,
            y: isLava ? 540 : 560,
            w: chasmWidth,
            h: 40,
            spikes: !isLava,
            lava: isLava,
            isHorrorPit: true
        });

        platforms.splice(idx, 1, leftPiece, rightPiece, pitHazard);

        if (options.bridgePlatform) {
            const bpW = options.bridgePlatform.w || 85;
            const bpH = options.bridgePlatform.h || 20;
            const bpY = options.bridgePlatform.y || 430;
            const bpX = options.bridgePlatform.x != null ? options.bridgePlatform.x : absX + (chasmWidth - bpW) / 2;
            const bp = new Platform(Object.assign({
                x: bpX,
                y: bpY,
                w: bpW,
                h: bpH,
                isHorrorPlatform: true
            }, options.bridgePlatform));
            platforms.push(bp);
        }

        if (Array.isArray(options.extraPlatforms)) {
            options.extraPlatforms.forEach(ep => {
                platforms.push(new Platform(Object.assign({
                    isHorrorPlatform: true
                }, ep)));
            });
        }
    }

    function applyHorrorLevelModifications(lvlIdx, platforms) {
        if (!platforms || !Array.isArray(platforms)) return;

        const shiftExistingPlatforms = (minX, maxX) => {
            platforms.forEach(p => {
                if (p.x >= minX && p.x <= maxX && p.y < 480 && !p.isHorrorPit && !p.isHorrorPlatform) {
                    const seed = Math.sin(p.x * 0.08 + lvlIdx * 5);
                    if (seed > 0.35) {
                        p.y = Math.max(160, p.y - 30);
                    } else if (seed < -0.35) {
                        p.y = Math.min(450, p.y + 25);
                    }
                }
            });
        };

        if (lvlIdx === 0) {
            shiftExistingPlatforms(100, 3500);

            createChasmInPlatform(platforms, 420, 500, 0, 200, {
                bridgePlatform: { w: 80, h: 20, y: 430, boneType: "skull" }
            });
            createChasmInPlatform(platforms, 1100, 500, 0, 220, {
                bridgePlatform: { w: 80, h: 20, y: 410, moving: true, moveRange: 45, moveSpeed: 1.8, moveAxis: "y", boneType: "skull" }
            });
            createChasmInPlatform(platforms, 1750, 500, 0, 210, {
                bridgePlatform: { w: 85, h: 20, y: 425, boneType: "skull" }
            });
            createChasmInPlatform(platforms, 2400, 500, 0, 230, {
                bridgePlatform: { w: 85, h: 20, y: 415, moving: true, moveRange: 50, moveSpeed: 1.6, moveAxis: "x", boneType: "skull" }
            });
            createChasmInPlatform(platforms, 3050, 500, 0, 220, {
                bridgePlatform: { w: 80, h: 22, y: 435, trampoline: true, boneType: "skull" }
            });

            const p0_extras = [
                { x: 260, y: 360, w: 105, h: 20, boneType: "skull" },
                { x: 680, y: 310, w: 110, h: 20, moving: true, moveRange: 40, moveSpeed: 1.5, moveAxis: "y", boneType: "skull" },
                { x: 1450, y: 260, w: 120, h: 20, boneType: "skull" },
                { x: 1950, y: 220, w: 115, h: 20, moving: true, moveRange: 45, moveSpeed: 1.7, moveAxis: "x", boneType: "skull" },
                { x: 2700, y: 280, w: 125, h: 20, boneType: "skull" },
                { x: 800, y: 550, w: 180, h: 40, spikes: true, isHorrorPit: true },
                { x: 2150, y: 550, w: 200, h: 40, spikes: true, isHorrorPit: true }
            ];
            p0_extras.forEach(ep => platforms.push(new Platform(Object.assign({ isHorrorPlatform: true }, ep))));

        } else if (lvlIdx === 1) {
            shiftExistingPlatforms(100, 6400);

            createChasmInPlatform(platforms, 620, 500, 0, 210, {
                bridgePlatform: { w: 85, h: 20, y: 420, boneType: "cyber" }
            });
            createChasmInPlatform(platforms, 1450, 500, 0, 220, {
                bridgePlatform: { w: 80, h: 20, y: 410, moving: true, moveRange: 55, moveSpeed: 2.1, moveAxis: "x", boneType: "cyber" }
            });
            createChasmInPlatform(platforms, 2350, 500, 0, 230, {
                bridgePlatform: { w: 80, h: 20, y: 415, moving: true, moveRange: 50, moveSpeed: 1.9, moveAxis: "y", boneType: "cyber" }
            });
            createChasmInPlatform(platforms, 3500, 500, 0, 240, {
                bridgePlatform: { w: 85, h: 22, y: 430, trampoline: true, boneType: "cyber" }
            });
            createChasmInPlatform(platforms, 4700, 500, 0, 230, {
                bridgePlatform: { w: 80, h: 20, y: 405, moving: true, moveRange: 60, moveSpeed: 2.2, moveAxis: "x", boneType: "cyber" }
            });
            createChasmInPlatform(platforms, 5600, 500, 0, 220, {
                bridgePlatform: { w: 85, h: 20, y: 420, boneType: "cyber" }
            });

            const p1_extras = [
                { x: 380, y: 340, w: 110, h: 20, boneType: "cyber" },
                { x: 980, y: 280, w: 120, h: 20, moving: true, moveRange: 45, moveSpeed: 1.8, moveAxis: "y", boneType: "cyber" },
                { x: 1850, y: 230, w: 130, h: 20, boneType: "cyber" },
                { x: 2850, y: 210, w: 125, h: 20, moving: true, moveRange: 55, moveSpeed: 2.0, moveAxis: "x", boneType: "cyber" },
                { x: 3950, y: 260, w: 130, h: 20, boneType: "cyber" },
                { x: 5150, y: 220, w: 120, h: 20, moving: true, moveRange: 50, moveSpeed: 1.9, moveAxis: "y", boneType: "cyber" },
                { x: 1150, y: 550, w: 220, h: 40, spikes: true, isHorrorPit: true },
                { x: 3000, y: 550, w: 240, h: 40, spikes: true, isHorrorPit: true },
                { x: 5250, y: 550, w: 200, h: 40, spikes: true, isHorrorPit: true }
            ];
            p1_extras.forEach(ep => platforms.push(new Platform(Object.assign({ isHorrorPlatform: true }, ep))));

        } else if (lvlIdx === 2) {
            shiftExistingPlatforms(100, 5900);

            createChasmInPlatform(platforms, 550, 500, 0, 210, {
                lava: true,
                bridgePlatform: { w: 85, h: 20, y: 420, boneType: "obsidian" }
            });
            createChasmInPlatform(platforms, 1400, 500, 0, 230, {
                lava: true,
                bridgePlatform: { w: 80, h: 20, y: 410, moving: true, moveRange: 50, moveSpeed: 1.8, moveAxis: "y", boneType: "obsidian" }
            });
            createChasmInPlatform(platforms, 2300, 500, 0, 240, {
                lava: true,
                bridgePlatform: { w: 85, h: 20, y: 415, moving: true, moveRange: 55, moveSpeed: 1.9, moveAxis: "x", boneType: "obsidian" }
            });
            createChasmInPlatform(platforms, 3400, 500, 0, 240, {
                lava: true,
                bridgePlatform: { w: 80, h: 22, y: 435, trampoline: true, boneType: "obsidian" }
            });
            createChasmInPlatform(platforms, 4500, 500, 0, 230, {
                lava: true,
                bridgePlatform: { w: 85, h: 20, y: 410, moving: true, moveRange: 45, moveSpeed: 1.7, moveAxis: "y", boneType: "obsidian" }
            });
            createChasmInPlatform(platforms, 5400, 500, 0, 220, {
                lava: true,
                bridgePlatform: { w: 85, h: 20, y: 420, boneType: "obsidian" }
            });

            const p2_extras = [
                { x: 350, y: 350, w: 105, h: 20, boneType: "obsidian" },
                { x: 920, y: 290, w: 110, h: 20, moving: true, moveRange: 45, moveSpeed: 1.6, moveAxis: "y", boneType: "obsidian" },
                { x: 1800, y: 240, w: 125, h: 20, boneType: "obsidian" },
                { x: 2850, y: 220, w: 120, h: 20, moving: true, moveRange: 50, moveSpeed: 1.8, moveAxis: "x", boneType: "obsidian" },
                { x: 3950, y: 270, w: 130, h: 20, boneType: "obsidian" },
                { x: 4950, y: 230, w: 115, h: 20, moving: true, moveRange: 45, moveSpeed: 1.7, moveAxis: "y", boneType: "obsidian" },
                { x: 980, y: 540, w: 220, h: 40, lava: true, isHorrorPit: true },
                { x: 2800, y: 540, w: 250, h: 40, lava: true, isHorrorPit: true },
                { x: 4900, y: 540, w: 240, h: 40, lava: true, isHorrorPit: true }
            ];
            p2_extras.forEach(ep => platforms.push(new Platform(Object.assign({ isHorrorPlatform: true }, ep))));

        } else if (lvlIdx === 3) {
            shiftExistingPlatforms(100, 4500);

            createChasmInPlatform(platforms, 400, 480, 0, 200, {
                bridgePlatform: { w: 85, h: 20, y: 410, moving: true, moveRange: 35, moveSpeed: 1.5, moveAxis: "y", boneType: "skull" }
            });
            createChasmInPlatform(platforms, 1250, 480, 0, 220, {
                bridgePlatform: { w: 80, h: 20, y: 405, moving: true, moveRange: 50, moveSpeed: 1.7, moveAxis: "x", boneType: "skull" }
            });
            createChasmInPlatform(platforms, 2100, 480, 0, 230, {
                bridgePlatform: { w: 80, h: 22, y: 425, trampoline: true, boneType: "skull" }
            });
            createChasmInPlatform(platforms, 2950, 480, 0, 220, {
                bridgePlatform: { w: 85, h: 20, y: 410, moving: true, moveRange: 45, moveSpeed: 1.6, moveAxis: "y", boneType: "skull" }
            });
            createChasmInPlatform(platforms, 3800, 480, 0, 220, {
                bridgePlatform: { w: 85, h: 20, y: 415, boneType: "skull" }
            });

            const p3_extras = [
                { x: 750, y: 330, w: 105, h: 20, boneType: "skull" },
                { x: 1650, y: 260, w: 115, h: 20, moving: true, moveRange: 45, moveSpeed: 1.7, moveAxis: "y", boneType: "skull" },
                { x: 2500, y: 210, w: 120, h: 20, boneType: "skull" },
                { x: 3350, y: 270, w: 110, h: 20, moving: true, moveRange: 50, moveSpeed: 1.8, moveAxis: "x", boneType: "skull" },
                { x: 4200, y: 230, w: 120, h: 20, boneType: "skull" },
                { x: 800, y: 550, w: 220, h: 40, spikes: true, isHorrorPit: true },
                { x: 2500, y: 550, w: 240, h: 40, spikes: true, isHorrorPit: true },
                { x: 3500, y: 550, w: 210, h: 40, spikes: true, isHorrorPit: true }
            ];
            p3_extras.forEach(ep => platforms.push(new Platform(Object.assign({ isHorrorPlatform: true }, ep))));

        } else if (lvlIdx === 6) {
            shiftExistingPlatforms(100, 8400);

            createChasmInPlatform(platforms, 580, 500, 0, 210, {
                bridgePlatform: { w: 85, h: 20, y: 420, boneType: "tombstone" }
            });
            createChasmInPlatform(platforms, 1600, 500, 0, 220, {
                bridgePlatform: { w: 85, h: 20, y: 410, moving: true, moveRange: 50, moveSpeed: 1.7, moveAxis: "y", boneType: "tombstone" }
            });
            createChasmInPlatform(platforms, 2650, 500, 0, 230, {
                bridgePlatform: { w: 80, h: 22, y: 435, trampoline: true, boneType: "tombstone" }
            });
            createChasmInPlatform(platforms, 3800, 500, 0, 240, {
                bridgePlatform: { w: 85, h: 20, y: 415, moving: true, moveRange: 55, moveSpeed: 1.9, moveAxis: "x", boneType: "tombstone" }
            });
            createChasmInPlatform(platforms, 4900, 500, 0, 230, {
                bridgePlatform: { w: 80, h: 20, y: 410, moving: true, moveRange: 45, moveSpeed: 1.6, moveAxis: "y", boneType: "tombstone" }
            });
            createChasmInPlatform(platforms, 6100, 500, 0, 230, {
                bridgePlatform: { w: 85, h: 20, y: 420, boneType: "tombstone" }
            });
            createChasmInPlatform(platforms, 7200, 500, 0, 230, {
                bridgePlatform: { w: 80, h: 22, y: 430, trampoline: true, boneType: "tombstone" }
            });

            const p6_extras = [
                { x: 380, y: 350, w: 105, h: 20, boneType: "tombstone" },
                { x: 1050, y: 280, w: 115, h: 20, moving: true, moveRange: 45, moveSpeed: 1.7, moveAxis: "y", boneType: "tombstone" },
                { x: 2100, y: 230, w: 125, h: 20, boneType: "tombstone" },
                { x: 3200, y: 210, w: 120, h: 20, moving: true, moveRange: 50, moveSpeed: 1.9, moveAxis: "x", boneType: "tombstone" },
                { x: 4350, y: 260, w: 130, h: 20, boneType: "tombstone" },
                { x: 5550, y: 220, w: 120, h: 20, moving: true, moveRange: 45, moveSpeed: 1.8, moveAxis: "y", boneType: "tombstone" },
                { x: 6700, y: 240, w: 125, h: 20, boneType: "tombstone" },
                { x: 7800, y: 270, w: 115, h: 20, moving: true, moveRange: 50, moveSpeed: 1.7, moveAxis: "x", boneType: "tombstone" },
                { x: 1100, y: 550, w: 220, h: 40, spikes: true, isHorrorPit: true },
                { x: 3100, y: 550, w: 250, h: 40, spikes: true, isHorrorPit: true },
                { x: 5350, y: 550, w: 230, h: 40, spikes: true, isHorrorPit: true },
                { x: 6600, y: 550, w: 220, h: 40, spikes: true, isHorrorPit: true }
            ];
            p6_extras.forEach(ep => platforms.push(new Platform(Object.assign({ isHorrorPlatform: true }, ep))));
        }
    }

    const FRAME_INTERVAL = 1e3 / 60;
    const MAX_FRAME_DT = 250;
    const MAX_STEPS = 5;
    function step() {
        time++;
        if (window.GAME_PAUSED) return;
        if (gameState === "levelmap") return;
        if (typeof checkAndUpdateLevelCard === "function") {
            checkAndUpdateLevelCard();
        }
        if (typeof window.pollGamepad === "function") {
            window.pollGamepad();
        }
        if (typeof window.updateTouchControlsState === "function") {
            window.updateTouchControlsState();
        }
        if (typeof currentBGM !== "undefined" && currentBGM && !window.GAME_PAUSED && (typeof window.isGamePaused !== "function" || !window.isGamePaused())) {
            if (currentBGM.ended) {
                try {
                    currentBGM.currentTime = 0;
                    const p = currentBGM.play();
                    if (p && typeof p.catch === "function") p.catch(() => {});
                } catch (e) {}
            }
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width || VIEW_W, canvas.height || VIEW_H);
        
        if (gameState === "title_intro") {
            const splsh = document.getElementById("splash-screen");
            const langSel = document.getElementById("lang-select");
            const isSplashVisible = splsh && splsh.style.display !== "none";
            const isLangVisible = langSel && langSel.style.display !== "none" && !window.gameReady;
            
            if (!isSplashVisible && !isLangVisible) {
                window.titleIntroTimer = (window.titleIntroTimer || 0) + 1;
            } else {
                window.titleIntroTimer = 0;
            }

            if (window.titleIntroTimer < 60) {
                game.nightTransitionProgress = 1;
            } else if (window.titleIntroTimer <= 240) {
                game.nightTransitionProgress = 1 - ((window.titleIntroTimer - 60) / 180); 
            } else {
                game.nightTransitionProgress = 0;
            }

            drawEnhancedBackground(ctx, 0, 0, time, game);

            if (window.titleIntroTimer > 280) {
                gameState = "start";
                const gameTitle = document.getElementById("game-title");
                const titleBtns = document.getElementById("title-buttons");
                const langToggleBtn = document.getElementById("btn-lang-toggle");
                const cornerCredit = document.getElementById("corner-credit");
                
                if (gameTitle) gameTitle.style.opacity = "1";
                if (cornerCredit) cornerCredit.style.opacity = "1";
                if (titleBtns) titleBtns.classList.remove("hidden");
                if (langToggleBtn) langToggleBtn.style.display = "flex";
            }
            return;
        }
        if (gameState === "start") {
            game.nightTransitionProgress = 0;
            drawEnhancedBackground(ctx, 0, 0, time, game);
            return;
        }

        if (gameState === "introStory") {
            if (typeof window.updateAndDrawIntro === "function") {
                window.updateAndDrawIntro(ctx, time);
            }
            return;
        }

        if (game.isHub || currentLevel === "hub" || currentLevel < 4 || currentLevel === 6) {
            drawEnhancedBackground(ctx, currentLevel, cameraX, time, game);
        } else {
            ctx.fillStyle = game.happyMode ? "#87CEEB" : currentLevel >= 2 ? Math.random() > .95 ? "#1a0000" : "#000" : "#000";
            ctx.fillRect(0, 0, Math.max(VIEW_W, canvas.width || VIEW_W), Math.max(VIEW_H, canvas.height || VIEW_H));
        }
        if (!game.isHub && currentLevel !== "hub") {
            bfRenderFace(ctx);
        }
        ctx.save();
        applyCameraShake(ctx);
        ctx.translate(0, -(game.camY || 0));
        if (game.cameraZoom && game.cameraZoom !== 1) {
            const zx = game.zoomTargetWorldX != null ? game.zoomTargetWorldX - cameraX : VIEW_W / 2;
            const zy = game.zoomTargetWorldY != null ? game.zoomTargetWorldY : VIEW_H / 2;
            ctx.translate(zx, zy);
            ctx.scale(game.cameraZoom, game.cameraZoom);
            ctx.translate(-zx, -zy);
        }
        if (gameState === "friendCinematicL1") {
            if (!game._friendsJumped) {
                game._friendsJumpTimer = (game._friendsJumpTimer || 0) + 1;
                ctx.restore();
                ctx.save();
                ctx.fillStyle = "rgba(0,0,0,0.7)";
                ctx.fillRect(0, 0, VIEW_W, VIEW_H);
                const jumpProgress = Math.min(1, game._friendsJumpTimer / 50);
                const isLitSaved = typeof window.isLithiumRescued === "function" && window.isLithiumRescued();
                const totalFriends = isLitSaved ? 6 : 5;
                for (let f = 0; f < totalFriends; f++) {
                    const fx = (isLitSaved ? 250 : 300) + f * (isLitSaved ? 90 : 100) + Math.sin(game._friendsJumpTimer * .1 + f) * 30;
                    const fy = VIEW_H / 2 + 50 - jumpProgress * 180 + Math.sin(game._friendsJumpTimer * .15 + f * 2) * 10;
                    ctx.fillStyle = [ "#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#ff6bff", "#ffd700" ][f];
                    ctx.shadowColor = "#ffffff";
                    ctx.shadowBlur = 10 * (1 - jumpProgress);
                    ctx.font = "48px sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText([ "😊", "😃", "😄", "😁", "🤩", "💛" ][f], fx, fy);
                }
                ctx.shadowBlur = 0;
                ctx.restore();
                if (game._friendsJumpTimer >= 60) {
                    game._friendsJumped = true;
                    gsap.to(messageDiv, {
                        scale: 0,
                        opacity: 0,
                        duration: .1
                    });
                }
                return;
            }
            const l1Lines = [ __("dlg_friends_cage_si") ];
            game.friendCineTimer = (game.friendCineTimer || 0) + 1;
            const step = Math.floor(game.friendCineTimer / 90);
            if (step < l1Lines.length) {
                if (step !== game._lastCineStep) {
                    game._lastCineStep = step;
                }
                const progressInStep = game.friendCineTimer % 90;
                const alpha = Math.min(1, Math.min(progressInStep / 12, (90 - progressInStep) / 12));
                const scale = 0.85 + 0.15 * Math.min(1, progressInStep / 12);
                if (typeof drawFriendSpeechBubble === "function") {
                    drawFriendSpeechBubble(ctx, l1Lines[step], VIEW_W / 2, VIEW_H / 2 - 40, "#ffd700", alpha, scale);
                }
            } else if (step >= l1Lines.length && !game._cineDone) {
                game._cineDone = true;
                game.player.frozen = false;
                setTimeout(() => {
                    window.unlockAndShowMap(2);
                    gameState = "playing";
                    game.cageTriggered = false;
                    game._cineDone = false;
                    game._friendsJumped = false;
                    game._friendsJumpTimer = 0;
                }, 600);
            }
        }
        if (gameState === "friendCinematic") {
            ctx.restore();
            ctx.save();
            ctx.fillStyle = "rgba(0,0,0,0.85)";
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            const lines = [ __("story_friends_1"), __("story_friends_2"), __("story_friends_3"), __("story_friends_4"), __("story_friends_5"), __("story_friends_6"), __("story_friends_7"), __("story_friends_8"), __("story_friends_9"), __("story_friends_10") ];
            const fullLine = lines[game.friendLine] || "";
            const visible = fullLine.substring(0, game.friendChar);
            ctx.font = "40px sans-serif";
            ctx.textAlign = "center";
            const friendIcons = (typeof window.isLithiumRescued === "function" && window.isLithiumRescued()) ? "😊 😃 😄 💛" : "😊 😃 😄";
            ctx.fillText(friendIcons, VIEW_W / 2, VIEW_H / 2 - 100);
            ctx.fillStyle = "#fff";
            ctx.font = '22px "Courier Prime"';
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            if (visible) {
                const a = visible.split("\n");
                a.forEach((l, i) => ctx.fillText(l, VIEW_W / 2, VIEW_H / 2 + i * 35));
            }
            if (game.friendLine >= 7) {
                ctx.fillStyle = "#f44";
                ctx.font = '28px "Fredoka One"';
                ctx.textAlign = "center";
            }
            ctx.font = '14px "Courier Prime"';
            ctx.fillStyle = "rgba(255,255,255,0.45)";
            ctx.fillText(__("ui_press_space"), VIEW_W / 2, VIEW_H - 55);
            game.friendTimer = (game.friendTimer || 0) + 1;
            if (game.friendChar < fullLine.length) {
                if (game.friendTimer % 2 === 0) game.friendChar++;
            } else {
                game.friendHold = (game.friendHold || 0) + 1;
                const holdNeeded = fullLine.length === 0 ? 30 : 100;
                if (game.friendHold >= holdNeeded) {
                    game.friendHold = 0;
                    if (game.friendLine < lines.length - 1) {
                        game.friendLine++;
                        game.friendChar = 0;
                        game.friendTimer = 0;
                    } else {
                        gameState = "playing";
                        window.unlockAndShowMap(4);
                    }
                }
            }
            ctx.restore();
            return;
        }
        if (typeof game.cameraOverrideY === "number") {
            game.camY = (game.camY || 0) + (game.cameraOverrideY - (game.camY || 0)) * .08;
        } else if (game.lvl4State === "falling" && game.player) {
            const targetY = Math.max(0, game.player.y - 300);
            game.camY = (game.camY || 0) + (targetY - (game.camY || 0)) * .08;
        } else {
            game.camY = (game.camY || 0) * .88;
            if (game.camY < 1) game.camY = 0;
        }
        if (game._entryLock > 0) game._entryLock--;
        if (typeof game.cameraOverrideX === "number" && game._entryLock <= 0) {
            cameraX += (game.cameraOverrideX - cameraX) * .1;
        } else if (game.player) {
            if (currentLevel === 0 && (game.subCaveMode || game.player.x >= 27950 && game.player.x <= 34e3)) {
                let targetCamX = game.player.x - VIEW_W / 2 + game.player.w / 2;
                const minCam = 28e3;
                const maxCam = Math.max(minCam, 33650 - VIEW_W);
                targetCamX = Math.max(minCam, Math.min(targetCamX, maxCam));
                cameraX += (targetCamX - cameraX) * .1;
            } else if (game.arenaLocked && typeof game.arenaMinX === "number" && typeof game.arenaMaxX === "number" && game.arenaMaxX > game.arenaMinX) {
                const arenaSpan = game.arenaMaxX - game.arenaMinX;
                let targetCamX;
                if (arenaSpan <= VIEW_W + 60) {
                    targetCamX = (game.arenaMinX + game.arenaMaxX) / 2 - VIEW_W / 2;
                } else {
                    targetCamX = game.player.x - VIEW_W / 2 + game.player.w / 2;
                    const minCam = game.arenaMinX;
                    const maxCam = Math.max(minCam, game.arenaMaxX - VIEW_W);
                    targetCamX = Math.max(minCam, Math.min(targetCamX, maxCam));
                }
                cameraX += (targetCamX - cameraX) * .1;
            } else if (game.freeRoam) {
                cameraX += (game.player.x - VIEW_W / 2 + game.player.w / 2 - cameraX) * .1;
            } else {
                let targetCamX = game.player.x - VIEW_W / 2 + game.player.w / 2;
                if (targetCamX < 0) targetCamX = 0;
                if (targetCamX > worldWidth - VIEW_W) targetCamX = worldWidth - VIEW_W;
                cameraX += (targetCamX - cameraX) * .1;
            }
            cameraX = Math.round(cameraX);
        }
        if (currentLevel === 4 && game.lvl4State === "run_to_door") {
            const dX = 3500;
            const doorY = 414;
            const doorW = 64;
            const doorH = 86;
            const dx = dX - cameraX;
            ctx.save();
            ctx.fillStyle = "#050208";
            ctx.fillRect(dx - 10, doorY + doorH - 3, doorW + 20, 9);
            ctx.fillStyle = "#120514";
            ctx.fillRect(dx - 7, doorY + doorH - 6, doorW + 14, 4);
            ctx.strokeStyle = "#880022";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(dx - 5, doorY + doorH - 4);
            ctx.lineTo(dx + doorW + 5, doorY + doorH - 4);
            ctx.stroke();

            ctx.fillStyle = "#0c030d";
            ctx.beginPath();
            ctx.roundRect(dx - 7, doorY - 7, doorW + 14, doorH + 5, [ 32, 32, 0, 0 ]);
            ctx.fill();

            const colW = 7;
            const leftColGrad = ctx.createLinearGradient(dx - 7, 0, dx - 7 + colW, 0);
            leftColGrad.addColorStop(0, "#18061e");
            leftColGrad.addColorStop(0.5, "#3d0d2b");
            leftColGrad.addColorStop(1, "#0f0212");
            ctx.fillStyle = leftColGrad;
            ctx.fillRect(dx - 7, doorY + 12, colW, doorH - 18);

            const rightColGrad = ctx.createLinearGradient(dx + doorW, 0, dx + doorW + colW, 0);
            rightColGrad.addColorStop(0, "#0f0212");
            rightColGrad.addColorStop(0.5, "#3d0d2b");
            rightColGrad.addColorStop(1, "#18061e");
            ctx.fillStyle = rightColGrad;
            ctx.fillRect(dx + doorW, doorY + 12, colW, doorH - 18);

            ctx.fillStyle = "#4a0e28";
            ctx.fillRect(dx - 9, doorY + 8, colW + 4, 4);
            ctx.fillRect(dx + doorW - 2, doorY + 8, colW + 4, 4);

            ctx.shadowColor = "#ff0033";
            ctx.shadowBlur = 12 + Math.sin(time * 0.1) * 6;
            ctx.strokeStyle = "#e11d48";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(dx - 7, doorY - 7, doorW + 14, doorH + 5, [ 32, 32, 0, 0 ]);
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.save();
            ctx.beginPath();
            ctx.roundRect(dx + 3, doorY + 3, doorW - 6, doorH - 6, [ 26, 26, 0, 0 ]);
            ctx.clip();

            const doorCoreX = dx + doorW / 2;
            const doorCoreY = doorY + doorH / 2;
            const coreGrad = ctx.createRadialGradient(doorCoreX, doorCoreY, 2, doorCoreX, doorCoreY, doorH * 0.58);
            coreGrad.addColorStop(0, "#ff2244");
            coreGrad.addColorStop(0.2, "#a80524");
            coreGrad.addColorStop(0.5, "#3d0012");
            coreGrad.addColorStop(0.8, "#140106");
            coreGrad.addColorStop(1, "#000000");
            ctx.fillStyle = coreGrad;
            ctx.fillRect(dx + 3, doorY + 3, doorW - 6, doorH - 6);

            const rotate = time * 0.05;
            const pulse = Math.sin(time * 0.1) * 0.2 + 1;
            ctx.save();
            ctx.translate(doorCoreX, doorCoreY);
            ctx.globalCompositeOperation = "screen";
            ctx.lineWidth = 2.2;
            ctx.lineCap = "round";
            for (let arm = 0; arm < 4; arm++) {
                const armAng = arm * (Math.PI / 2) + rotate;
                ctx.strokeStyle = `rgba(255, 30, 60, ${0.45 + pulse * 0.25})`;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                for (let st = 0; st < 18; st++) {
                    const r = st * (doorW * 0.027);
                    const tAng = armAng - st * 0.16;
                    ctx.lineTo(Math.cos(tAng) * r, Math.sin(tAng) * r * 1.3);
                }
                ctx.stroke();
            }
            ctx.restore();

            for (let i = 0; i < 7; i++) {
                const sparkAng = (time * 0.04 + i * 0.9) % (Math.PI * 2);
                const sparkDist = (doorW * 0.35) * ((Math.sin(time * 0.08 + i * 1.7) + 1) * 0.5);
                const sx = doorCoreX + Math.cos(sparkAng) * sparkDist;
                const sy = doorCoreY + Math.sin(sparkAng) * sparkDist * 1.2;
                ctx.fillStyle = i % 2 === 0 ? "#ff2a55" : "#ffffff";
                ctx.beginPath();
                ctx.arc(sx, sy, 1.2 + (i % 2) * 0.8, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
            ctx.restore();
        }
        if (gameState === "introStory" || gameState === "preNivel4") {
            if (game.storyChar === undefined) {
                game.storyLine = 0;
                game.storyChar = 0;
                game.storyTimer = 0;
                game.storyHold = 0;
            }
            let lines;
            let totalLines;
            if (gameState === "introStory") {
                lines = [ __("story_intro_1"), __("story_intro_2"), __("story_intro_3"), __("story_intro_4"), __("story_intro_5"), __("story_intro_6"), __("story_intro_7"), __("story_intro_8") ];
                totalLines = 8;
            } else {
                lines = [ __("story_prenivel4_1"), __("story_prenivel4_2"), __("story_prenivel4_3"), __("story_prenivel4_4"), __("story_prenivel4_5"), __("story_prenivel4_6"), __("story_prenivel4_7"), __("story_prenivel4_8"), __("story_prenivel4_9"), __("story_prenivel4_10"), __("story_prenivel4_11"), __("story_prenivel4_12") ];
                totalLines = 12;
            }
            const fullLine = lines[game.storyLine] || "";
            if (game.storyChar < fullLine.length) {
                game.storyTimer = (game.storyTimer || 0) + 1;
                if (game.storyTimer % 2 === 0) {
                    game.storyChar++;
                }
            } else {
                game.storyHold = (game.storyHold || 0) + 1;
                const holdNeeded = fullLine.length === 0 ? 30 : 100;
                if (game.storyHold >= holdNeeded) {
                    game.storyHold = 0;
                    if (game.storyLine < totalLines - 1) {
                        game.storyLine++;
                        game.storyChar = 0;
                        game.storyTimer = 0;
                    } else {
                        if (gameState === "introStory") {
                            gameState = "playing";
                            game.storyChar = undefined;
                            loadLevel(0);
                            window.showAnimatedMessage(__("msg_mundo1"));
                        } else {
                            gameState = "playing";
                            game.storyChar = undefined;
                            loadLevel(3);
                            startCaceria();
                            window.showAnimatedMessage(__("msg_haz_lo_que_debas"));
                        }
                        return;
                    }
                }
            }
        }
        if (gameState === "playing") {
            game.player.update(keys, game.platforms);
            if (currentLevel === 0 && typeof window.updateCavernEntrance === "function") {
                window.updateCavernEntrance(game.player, time);
            }
            if (game.kamehameha && game.kamehameha.active) {
                game.kamehameha.update();
            }
            if (window.SnowballEventSystem) {
                window.SnowballEventSystem.update();
            }
            const platCamMin = cameraX - 120, platCamMax = cameraX + VIEW_W + 120;
            for (let pi = 0; pi < game.platforms.length; pi++) {
                const p = game.platforms[pi];
                p._px = p.x;
                p._py = p.y;
                const isNear = (p.x + p.w > platCamMin && p.x < platCamMax);
                if (isNear || p.moving || p.hammer || p.dashBlock || p.broken || p.isGateButton || p.isTechBridgeButton || p.isGateObstacle || p.isStalactite || p.isTechDrone) {
                    p.update();
                }
            }
            if (currentLevel === 0 && game.iceMode) {
                game.platforms.forEach(p => {
                    if (p.y < 480 && !p.button && !p.broken && !p.moving && !p.cage && p.x < 9600) {
                        const baseX = p._baseX || p.x;
                        if (!p._baseX) p._baseX = p.x;
                        p.x = baseX + Math.sin(time * .02 + p._baseX * .001) * 30;
                    }
                });
            }
            if (currentLevel === 0 && game.fireMode && !game.arenaLocked && game.player.x > 5e3 && game.player.x < 9600) {
                if (Math.random() < .035 && enemyProjectiles.length < 15) {
                    const spawnX = game.player.x + VIEW_W / 2 + 80;
                    const spawnY = 120 + Math.random() * 260;
                    enemyProjectiles.push({
                        x: spawnX,
                        y: spawnY,
                        w: 20,
                        h: 20,
                        radius: 10,
                        vx: -3.4 - Math.random() * .6,
                        vy: Math.sin(time * .04) * 1.2,
                        color: "#ff4400",
                        isGiant: false,
                        isFireball: true,
                        damage: 12
                    });
                }
            }
            game.enemies.forEach(e => e.update(game.platforms));
            if (!game.player.frozen && game.player.onGround && game.player.currentPlatform) {
                const cp = game.player.currentPlatform;
                if (typeof cp._px === "number" && typeof cp._py === "number") {
                    game.player.x += cp.x - cp._px;
                    game.player.y += cp.y - cp._py;
                }
            }
            if (currentLevel === 4) {
                if (!game.lvl4State) {
                    game.lvl4State = "walk_right";
                    game.lvl4Timer = 0;
                }
                game.lvl4Timer++;
                if (game.lvl4State === "walk_right") {
                    if (game.lvl4Timer >= 15 * 60 && !game.pasosPlayed) {
                        playSFX("sfx_footsteps");
                        game.pasosPlayed = true;
                    }
                    if (game.lvl4Timer >= 20 * 60) {
                        game.lvl4State = "blackout";
                        game.lvl4Timer = 0;
                        blackoutDiv.style.opacity = 1;
                        document.body.style.background = "#000";
                        playSound(100, 1.5, "sawtooth", .7);
                        applyShake(35);
                    }
                } else if (game.lvl4State === "blackout") {
                    game.player.vx = 0;
                    game.player.frozen = true;
                    if (game.lvl4Timer >= 3 * 60) {
                        blackoutDiv.style.opacity = .95;
                        game.player.scared = true;
                        document.body.style.background = "#000";
                        if (game.demon) game.demon.vanish();
                        playSFX("sfx_demon_growl_1");
                        setTimeout(() => playSFX("sfx_demon_scream"), 450);
                        applyShake(35);
                        game.lvl4State = "stalk_left";
                        game.lvl4Timer = 0;
                        game.forceRunDir = -1;
                        game.player.facing = -1;
                        game.player.frozen = false;
                        game.player.vx = -MOVE_SPEED * 1.3;
                    }
                } else if (game.lvl4State === "dread") {
                    game.lvl4State = "stalk_left";
                } else if (game.lvl4State === "stalk_left") {
                    if (Math.abs(game.player.vx) < .5) game.player.vx = -MOVE_SPEED * 1.3;
                    game.player.facing = -1;
                    game.player.frozen = false;
                    blackoutDiv.style.opacity = .75 + Math.sin(game.lvl4Timer * .1) * .15;
                    if (game.player.x + game.player.w > 858 && game.player.x < 1122) {
                        game.lvl4State = "falling";
                        game.lvl4Timer = 0;
                        game.forceRunDir = 0;
                        if (game.demon) game.demon.vanish();
                        playSound(300, .6, "sawtooth", .3, 80);
                    }
                } else if (game.lvl4State === "falling") {
                    game.player.y += 8 + game.lvl4Timer * .15;
                    game.player.vy = 0;
                    if (game.lvl4Timer >= 5 * 60) {
                        playSound(45, .9, "sawtooth", .75, 22);
                        applyShake(46);
                        blackoutDiv.style.opacity = 1;
                        game.flash = 10;
                        game.lvl4State = "companion";
                        game.lvl4Timer = 0;
                        game.companionMsg = false;
                        game.player.frozen = true;
                        game.camY = 0;
                    }
                } else if (game.lvl4State === "companion") {
                    const lines = [ __("story_companion_1"), __("story_companion_2"), __("story_companion_3"), __("story_companion_4"), __("story_companion_5"), __("story_companion_6") ];
                    const idx = Math.floor(game.lvl4Timer / (3 * 60));
                    if (idx < lines.length) {
                        if (game.textIdx !== idx) {
                            game.textIdx = idx;
                            window.showAnimatedMessage(lines[idx], true);
                            playSound(60 + idx * 60, .6, "sine", .2, 90);
                        }
                    } else {
                        const isMobile = window.isMobileDevice || (typeof window.isMobileOrTouch === "function" && window.isMobileOrTouch()) || (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) || (window.innerWidth <= 768);
                        if (isMobile) {
                            game.lvl4State = "meta";
                            game.lvl4Timer = 0;
                            game.player.frozen = false;
                            bfShow = true;
                            if (typeof window.hideChoice === "function") window.hideChoice();
                            if (choiceDiv) choiceDiv.style.display = "none";
                            if (handDiv) handDiv.style.display = "none";
                            if (cursorDiv) cursorDiv.style.display = "none";
                            document.body.classList.remove("no-cursor");
                            gsap.to(messageDiv, {
                                scale: 0,
                                opacity: 0,
                                duration: .15
                            });
                            if (typeof startCaceria === "function") {
                                startCaceria();
                            }
                        } else {
                            game.lvl4State = "meta";
                            game.lvl4Timer = 0;
                            game.player.frozen = true;
                            if (choiceText) choiceText.textContent = __("ui_choice_question");
                            if (choiceSub) choiceSub.textContent = __("ui_choice_sub");
                            gsap.to(messageDiv, {
                                scale: 0,
                                opacity: 0,
                                duration: .3
                            });
                            setTimeout(() => {
                                window.showChoice();
                            }, 500);
                        }
                    }
                } else if (game.lvl4State === "hunt") {
                    if (currentBGM && game.dread > 0) currentBGM.volume = (window.isMusicMuted && window.isMusicMuted()) ? 0 : Math.max(.05, (1 - game.dread * .7) * (typeof window.getMusicVolume === "function" ? window.getMusicVolume() : 1));
                    if (game.huntEnemy && !game.huntEnemy.active && !game.huntEnemy.killProcessed) {
                        game.huntEnemy.killProcessed = true;
                        game.huntKills++;
                        game.dread = Math.min(1, game.huntKills / 5);
                        const isFirstKill = game.huntKills === 1;
                        const blackoutMs = isFirstKill ? 750 : 180;
                        blackoutDiv.style.opacity = 1;
                        applyShake(12 + game.huntKills * 6);
                        gsap.to(messageDiv, {
                            scale: 0,
                            opacity: 0,
                            duration: .2
                        });
                        setTimeout(() => {
                            blackoutDiv.style.opacity = 0;
                            if (game.huntKills >= 5) {
                                game.lvl4State = "run_to_door";
                                game.lvl4Timer = 0;
                                game.inHunt = false;
                                bfShow = false;
                                game.happyMode = true;
                                game.sadEnemies = false;
                                game.freeRoam = false;
                                game.forceRunDir = 0;
                                game.vignette = false;
                                game.doorMsg = false;
                                game.doorStep = 0;
                                game.doorTimer = 0;
                                game.oopsShown = false;
                                worldWidth = 4e3;
                                game.platforms = [ new Platform({
                                    x: 0,
                                    y: 500,
                                    w: 4e3,
                                    h: 80
                                }) ];
                                game.player.frozen = false;
                                game.player.invulnerable = 120;
                                game.player.x = 280;
                                game.player.y = 440;
                                game.player.vy = 0;
                                game.camY = 0;
                                if (game.demon) game.demon.vanish();
                                if (currentBGM) {
                                    currentBGM.pause();
                                    currentBGM.volume = (window.isMusicMuted && window.isMusicMuted()) ? 0 : (typeof window.getMusicVolume === "function" ? window.getMusicVolume() : 1);
                                }
                                document.body.style.background = "#87CEEB";
                                blackoutDiv.style.opacity = 0;
                                setTimeout(() => window.showAnimatedMessage(__("msg_avanza_derecha"), false), 400);
                            } else {
                                spawnHuntEnemy();
                            }
                        }, blackoutMs);
                    }
                } else if (game.lvl4State === "run_to_door") {
                    game.lvl4Timer++;
                    const dX = 3500;
                    if (!game.doorMsg && game.player.x + game.player.w > dX - 620) {
                        game.doorMsg = true;
                        game.doorStep = 1;
                        game.doorTimer = 0;
                        game.player.frozen = true;
                        window.showAnimatedMessage(__("msg_salida_prometida"), true);
                        playBGM("bgm_world1_meadow");
                    } else if (game.doorMsg && game.player.frozen) {
                        game.doorTimer++;
                        if (game.doorStep === 1 && game.doorTimer >= 2 * 60) {
                            game.doorStep = 2;
                            game.doorTimer = 0;
                            window.showAnimatedMessage(__("msg_buen_trabajo"), true);
                        }
                        if (game.doorStep === 2 && game.doorTimer >= 2 * 60) {
                            game.player.frozen = false;
                        }
                    }
                    if (game.player.x + game.player.w > dX) {
                        gsap.to(messageDiv, {
                            scale: 0,
                            opacity: 0,
                            duration: .1
                        });
                        blackoutDiv.style.opacity = 1;
                        applyShake(25);
                        playSound(50, 1.5, "sawtooth", .6, 20);
                        playSFX("sfx_demon_growl_1");
                        if (currentBGM) {
                            currentBGM.pause();
                        }
                        game.player.frozen = true;
                        game.player.vx = 0;
                        game.player.vy = 0;
                        game.lvl4State = "ending_prep";
                        setTimeout(() => {
                            gameState = "ending";
                            game.endingTimer = 0;
                            game.endingStep = 0;
                            game.endingDone = false;
                            game.player.frozen = true;
                            game.player.x = VIEW_W / 2 - game.player.w / 2;
                            game.player.y = 440;
                            game.player.vy = 0;
                            game.player.vx = 0;
                            game.player.facing = 1;
                            game.player.scaleX = 1;
                            game.player.scaleY = 1;
                            game.player.rotation = 0;
                            game.player.swallowed = false;
                            game.player.hidden = false;
                            game.player.eaten = false;
                            game.player.scared = true;
                            cameraX = 0;
                            worldWidth = VIEW_W;
                            game.platforms = [];
                            game.enemies = [];
                            if (game.demon) game.demon.vanish();
                            document.body.style.background = "#000";
                            bfShow = true;
                            bfAlpha = 1;
                            bfStalk = 0;
                            bfTeeth = 1;
                            bfLaugh = 1;
                            bfAnnoyed = 0;
                            bfEnraged = 1;
                            bfShock = 0;
                            bfNightmare = 0;
                            bfTargetX = VIEW_W / 2;
                            bfTargetY = VIEW_H * 0.38;
                            bfPointerX = VIEW_W / 2;
                            bfPointerY = VIEW_H * 0.38;
                        }, 400);
                    }
                }
            }
            const curLvlObj = levels[currentLevel];
            if (curLvlObj) {
                const door = curLvlObj.door;
                if (curLvlObj.jaula && (currentLevel < 4 || currentLevel === 6) && !game.cageAlreadySaved && game.cageFriends && game.cageFriends.length > 0 && game.cageState === 0) {
                    const cj = curLvlObj.jaula;
                    if (game.player.x + game.player.w > cj.x && game.player.x < cj.x + cj.w && game.player.y + game.player.h > cj.y && game.player.y < cj.y + cj.h) {
                        if (game.player.x + game.player.w / 2 < cj.x + cj.w / 2) {
                            game.player.x = cj.x - game.player.w;
                        } else {
                            game.player.x = cj.x + cj.w;
                        }
                        game.player.vx = 0;
                        if (game.player.dashTimer > 0) game.player.dashTimer = 0;
                    }
                }
                if (door && door.active && game.player.x + game.player.w > door.x && game.player.x < door.x + door.w && game.player.y + game.player.h > door.y && !game.player.frozen) {
                    if (currentLevel === 4) {
                        loadLevel(3);
                        window.showAnimatedMessage(__("msg_puntos"));
                    } else {
                        window.unlockAndShowMap(currentLevel + 2);
                    }
                }
            }
        }
        if (game.happyMode || currentLevel === 0) {
            const isHorror = !!window.postGameHorror;
            const cloudCenters = [];

            for (let i = 0; i < 6; i++) {
                const cx = (i * 420 + 130 - cameraX * .5) % (VIEW_W + 300) - 150;
                const cy = 70 + i % 3 * 55;
                cloudCenters.push({ cx, cy, ex: cx + 25, ey: cy + 2, idx: i });

                ctx.save();
                if (isHorror) {
                    ctx.fillStyle = "rgba(22, 12, 30, 0.96)";
                    ctx.beginPath();
                    ctx.moveTo(cx + 26, cy); ctx.arc(cx, cy, 26, 0, Math.PI * 2);
                    ctx.moveTo(cx + 46, cy - 8); ctx.arc(cx + 26, cy - 8, 20, 0, Math.PI * 2);
                    ctx.moveTo(cx + 74, cy); ctx.arc(cx + 50, cy, 24, 0, Math.PI * 2);
                    ctx.moveTo(cx + 47, cy + 10); ctx.arc(cx + 25, cy + 10, 22, 0, Math.PI * 2);
                    ctx.moveTo(cx + 10, cy + 24);
                    ctx.quadraticCurveTo(cx + 12 + Math.sin(time * 0.05 + i) * 6, cy + 38, cx + 8, cy + 44);
                    ctx.moveTo(cx + 36, cy + 22);
                    ctx.quadraticCurveTo(cx + 40 + Math.cos(time * 0.05 + i) * 6, cy + 36, cx + 38, cy + 48);
                    ctx.fill();
                    ctx.strokeStyle = "rgba(40, 10, 50, 0.7)";
                    ctx.lineWidth = 2.5;
                    ctx.stroke();
                } else {
                    const cloudGrad = ctx.createLinearGradient(cx, cy - 22, cx, cy + 26);
                    cloudGrad.addColorStop(0, "#ffffff");
                    cloudGrad.addColorStop(0.35, "#f8fafc");
                    cloudGrad.addColorStop(0.75, "#e2e8f0");
                    cloudGrad.addColorStop(1, "rgba(203, 213, 225, 0.92)");

                    ctx.fillStyle = "rgba(100, 116, 139, 0.18)";
                    ctx.beginPath();
                    ctx.arc(cx, cy + 4, 25, 0, Math.PI * 2);
                    ctx.arc(cx + 24, cy - 6, 23, 0, Math.PI * 2);
                    ctx.arc(cx + 48, cy + 2, 22, 0, Math.PI * 2);
                    ctx.arc(cx + 25, cy + 12, 20, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = cloudGrad;
                    ctx.beginPath();
                    ctx.arc(cx - 10, cy + 4, 18, 0, Math.PI * 2);
                    ctx.arc(cx + 6, cy - 10, 22, 0, Math.PI * 2);
                    ctx.arc(cx + 28, cy - 14, 26, 0, Math.PI * 2);
                    ctx.arc(cx + 52, cy - 8, 22, 0, Math.PI * 2);
                    ctx.arc(cx + 66, cy + 4, 17, 0, Math.PI * 2);
                    ctx.arc(cx + 28, cy + 10, 22, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.fill();

                    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
                    ctx.beginPath();
                    ctx.arc(cx + 6, cy - 12, 16, Math.PI * 1.05, Math.PI * 1.95);
                    ctx.arc(cx + 28, cy - 16, 20, Math.PI * 1.05, Math.PI * 1.95);
                    ctx.arc(cx + 52, cy - 10, 16, Math.PI * 1.05, Math.PI * 1.95);
                    ctx.fill();
                }
                ctx.restore();
            }

            if (isHorror) {
                for (let i = 0; i < 6; i++) {
                    const { ex, ey, idx } = cloudCenters[i];
                    const plX = game.player ? game.player.x + game.player.w / 2 - cameraX : ex;
                    const plY = game.player ? game.player.y + game.player.h / 2 : ey + 100;
                    const pAng = Math.atan2(plY - ey, plX - ex);
                    const lookDist = 2.2;
                    const lkX = Math.cos(pAng) * lookDist;
                    const lkY = Math.sin(pAng) * lookDist;
                    const jitter = (Math.sin(time * 0.2 + idx * 3) > 0.8) ? (Math.random() - 0.5) * 2 : 0;

                    ctx.strokeStyle = "rgba(127, 29, 29, 0.4)";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(ex - 18, ey - 6); ctx.lineTo(ex - 12, ey - 2); ctx.lineTo(ex - 15, ey + 4);
                    ctx.moveTo(ex + 18, ey - 6); ctx.lineTo(ex + 12, ey - 2); ctx.lineTo(ex + 15, ey + 4);
                    ctx.stroke();

                    ctx.fillStyle = "rgba(153, 27, 27, 0.85)";
                    ctx.fillRect(ex - 10, ey - 2, 2.5, 18 + Math.sin(time * 0.05 + idx) * 4);
                    ctx.fillRect(ex + 8, ey - 2, 2.5, 18 + Math.cos(time * 0.05 + idx) * 4);
                    ctx.fillStyle = "rgba(75, 0, 0, 0.9)";
                    ctx.fillRect(ex - 9.5, ey + 4, 1.5, 12);
                    ctx.fillRect(ex + 8.5, ey + 4, 1.5, 12);

                    ctx.fillStyle = "#050005";
                    ctx.beginPath();
                    ctx.ellipse(ex - 9, ey - 3, 5.5, 6.5, -0.15, 0, Math.PI * 2);
                    ctx.ellipse(ex + 9, ey - 3, 5.5, 6.5, 0.15, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = "#ff1744";
                    ctx.beginPath();
                    ctx.arc(ex - 9 + lkX + jitter, ey - 3 + lkY, 2.2, 0, Math.PI * 2);
                    ctx.arc(ex + 9 + lkX + jitter, ey - 3 + lkY, 2.2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(ex - 9 + lkX + jitter, ey - 3 + lkY, 0.8, 0, Math.PI * 2);
                    ctx.arc(ex + 9 + lkX + jitter, ey - 3 + lkY, 0.8, 0, Math.PI * 2);
                    ctx.fill();

                    if (idx % 2 === 0) {
                        const mawH = 11 + Math.sin(time * 0.08 + idx) * 2;
                        ctx.fillStyle = "#050005";
                        ctx.beginPath();
                        ctx.ellipse(ex, ey + 11, 7, mawH, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.strokeStyle = "rgba(185, 28, 28, 0.6)";
                        ctx.lineWidth = 1.2;
                        ctx.stroke();

                        ctx.fillStyle = "#fef08a";
                        ctx.beginPath();
                        ctx.moveTo(ex - 5, ey + 11 - mawH + 3); ctx.lineTo(ex - 3, ey + 11 - mawH + 7); ctx.lineTo(ex - 1, ey + 11 - mawH + 3);
                        ctx.moveTo(ex - 1, ey + 11 - mawH + 3); ctx.lineTo(ex + 1, ey + 11 - mawH + 8); ctx.lineTo(ex + 3, ey + 11 - mawH + 3);
                        ctx.moveTo(ex + 2, ey + 11 - mawH + 3); ctx.lineTo(ex + 4, ey + 11 - mawH + 6); ctx.lineTo(ex + 6, ey + 11 - mawH + 3);
                        ctx.moveTo(ex - 4, ey + 11 + mawH - 3); ctx.lineTo(ex - 2, ey + 11 + mawH - 7); ctx.lineTo(ex, ey + 11 + mawH - 3);
                        ctx.moveTo(ex, ey + 11 + mawH - 3); ctx.lineTo(ex + 2, ey + 11 + mawH - 8); ctx.lineTo(ex + 4, ey + 11 + mawH - 3);
                        ctx.fill();
                    } else {
                        ctx.fillStyle = "#050005";
                        ctx.beginPath();
                        ctx.moveTo(ex - 16, ey + 7);
                        ctx.quadraticCurveTo(ex, ey + 18, ex + 16, ey + 7);
                        ctx.quadraticCurveTo(ex, ey + 11, ex - 16, ey + 7);
                        ctx.fill();
                        ctx.strokeStyle = "#7f1d1d";
                        ctx.lineWidth = 1.2;
                        ctx.stroke();

                        ctx.fillStyle = "#fef08a";
                        ctx.beginPath();
                        for (let t = -12; t <= 12; t += 4) {
                            const ty = ey + 10 + (1 - Math.abs(t) / 16) * 4;
                            ctx.moveTo(t, ty);
                            ctx.lineTo(t + 1.5, ty + (t % 8 === 0 ? 4 : -3));
                            ctx.lineTo(t + 3, ty);
                        }
                        ctx.fill();
                    }
                }
            }
        }
        const isMobileTutorial = window.isMobileDevice || typeof window.isMobileOrTouch === "function" && window.isMobileOrTouch();
        if (currentLevel === 0 && !isMobileTutorial) {
            if (!window._tutorialSignCache) window._tutorialSignCache = {};
            const drawBigSign = (sx, sw, sh, renderContents) => {
                const drawX = sx - cameraX;
                if (drawX + sw < -80 || drawX - sw > VIEW_W + 80) return;

                const animPhase = time % 60 < 30 ? 0 : 1;
                const lang = typeof window.currentLang === "string" ? window.currentLang : "es";
                const cacheKey = sx + "_" + (game.iceMode ? "1" : "0") + "_" + animPhase + "_" + lang;

                let cached = window._tutorialSignCache[cacheKey];
                if (!cached) {
                    const padX = 36;
                    const groundY = sh + 54;
                    cached = document.createElement("canvas");
                    cached.width = sw + padX * 2;
                    cached.height = groundY + 16;
                    const sCtx = cached.getContext("2d");
                    const origCtx = ctx;
                    ctx = sCtx;

                    sCtx.save();
                    sCtx.translate(sw / 2 + padX, groundY);

                    const postWidth = 18;
                    const leftPostX = -sw / 2 + 24;
                    const rightPostX = sw / 2 - 42;
                    const postTopY = -sh - 24;
                    const postH = sh + 28;

                    const drawPost = (px) => {
                        sCtx.fillStyle = "rgba(0, 0, 0, 0.28)";
                        sCtx.fillRect(px + 4, postTopY + 4, postWidth, postH);

                        const postGrad = sCtx.createLinearGradient(px, 0, px + postWidth, 0);
                        postGrad.addColorStop(0, "#2a1508");
                        postGrad.addColorStop(0.2, "#4a2810");
                        postGrad.addColorStop(0.6, "#6b3b19");
                        postGrad.addColorStop(1, "#2e1609");
                        sCtx.fillStyle = postGrad;
                        sCtx.fillRect(px, postTopY, postWidth, postH);

                        sCtx.fillStyle = "rgba(20, 10, 4, 0.4)";
                        sCtx.fillRect(px + 3, postTopY, 2, postH);
                        sCtx.fillRect(px + 10, postTopY, 1.5, postH);
                        sCtx.fillStyle = "rgba(220, 140, 80, 0.2)";
                        sCtx.fillRect(px + 6, postTopY, 1.5, postH);

                        sCtx.fillStyle = "#1e2124";
                        sCtx.fillRect(px - 2, -6, postWidth + 4, 8);
                        sCtx.fillStyle = "#3f444a";
                        sCtx.fillRect(px - 1, -5, postWidth + 2, 2);
                        sCtx.fillStyle = "#9ca3af";
                        sCtx.beginPath();
                        sCtx.arc(px + postWidth / 2, -2, 2, 0, Math.PI * 2);
                        sCtx.fill();
                    };

                    drawPost(leftPostX);
                    drawPost(rightPostX);

                    const drawStrut = (fromX, fromY, toX, toY) => {
                        sCtx.save();
                        sCtx.strokeStyle = "#381c0b";
                        sCtx.lineWidth = 10;
                        sCtx.beginPath();
                        sCtx.moveTo(fromX, fromY);
                        sCtx.lineTo(toX, toY);
                        sCtx.stroke();

                        sCtx.strokeStyle = "#5c3014";
                        sCtx.lineWidth = 6;
                        sCtx.beginPath();
                        sCtx.moveTo(fromX, fromY);
                        sCtx.lineTo(toX, toY);
                        sCtx.stroke();
                        sCtx.restore();
                    };
                    drawStrut(leftPostX + 9, -20, leftPostX + 36, -sh + 55);
                    drawStrut(rightPostX + 9, -20, rightPostX - 18, -sh + 55);

                    const bx = -sw / 2;
                    const by = -sh - 30;
                    const bw = sw;
                    const bh = sh;

                    sCtx.fillStyle = "rgba(0, 0, 0, 0.35)";
                    sCtx.fillRect(bx + 5, by + 6, bw, bh);

                    sCtx.fillStyle = "#2d1406";
                    sCtx.fillRect(bx, by, bw, bh);

                    const frameMargin = 7;
                    const ix = bx + frameMargin;
                    const iy = by + frameMargin;
                    const iw = bw - frameMargin * 2;
                    const ih = bh - frameMargin * 2;

                    const numPlanks = 4;
                    const plankH = ih / numPlanks;
                    for (let p = 0; p < numPlanks; p++) {
                        const py = iy + p * plankH;
                        const plankGrad = sCtx.createLinearGradient(0, py, 0, py + plankH);
                        if (p % 2 === 0) {
                            plankGrad.addColorStop(0, "#85542b");
                            plankGrad.addColorStop(0.5, "#a86f3d");
                            plankGrad.addColorStop(1, "#754620");
                        } else {
                            plankGrad.addColorStop(0, "#7d4d25");
                            plankGrad.addColorStop(0.5, "#9e6535");
                            plankGrad.addColorStop(1, "#6d3e1b");
                        }
                        sCtx.fillStyle = plankGrad;
                        sCtx.fillRect(ix, py, iw, plankH);

                        sCtx.fillStyle = "rgba(40, 18, 5, 0.25)";
                        sCtx.fillRect(ix, py + plankH * 0.35, iw, 1);
                        sCtx.fillRect(ix, py + plankH * 0.7, iw, 1);
                        sCtx.fillStyle = "rgba(240, 180, 120, 0.15)";
                        sCtx.fillRect(ix, py + 1, iw, 1);

                        if (p > 0) {
                            sCtx.fillStyle = "#1e0d04";
                            sCtx.fillRect(ix, py - 1, iw, 2);
                            sCtx.fillStyle = "rgba(255, 220, 170, 0.25)";
                            sCtx.fillRect(ix, py + 1, iw, 1);
                        }
                    }

                    const boardVig = sCtx.createRadialGradient(0, by + bh / 2, bw * 0.2, 0, by + bh / 2, bw * 0.65);
                    boardVig.addColorStop(0, "rgba(0, 0, 0, 0)");
                    boardVig.addColorStop(1, "rgba(0, 0, 0, 0.32)");
                    sCtx.fillStyle = boardVig;
                    sCtx.fillRect(ix, iy, iw, ih);

                    sCtx.strokeStyle = "#47210b";
                    sCtx.lineWidth = 1.5;
                    sCtx.strokeRect(ix + 0.5, iy + 0.5, iw - 1, ih - 1);

                    const roofOverhang = 12;
                    const rX = bx - roofOverhang;
                    const rW = bw + roofOverhang * 2;
                    const rTopY = by - 12;

                    sCtx.fillStyle = "rgba(0, 0, 0, 0.4)";
                    sCtx.fillRect(bx, by, bw, 6);

                    sCtx.fillStyle = "#271205";
                    sCtx.fillRect(rX + 2, rTopY + 5, rW - 4, 9);
                    sCtx.fillStyle = "#4a240d";
                    sCtx.fillRect(rX + 4, rTopY + 6, rW - 8, 4);

                    const roofGrad = sCtx.createLinearGradient(0, rTopY, 0, rTopY + 8);
                    roofGrad.addColorStop(0, "#7c441f");
                    roofGrad.addColorStop(0.5, "#5a2e12");
                    roofGrad.addColorStop(1, "#361907");
                    sCtx.fillStyle = roofGrad;
                    sCtx.beginPath();
                    sCtx.moveTo(rX, rTopY + 7);
                    sCtx.lineTo(rX + 6, rTopY);
                    sCtx.lineTo(rX + rW - 6, rTopY);
                    sCtx.lineTo(rX + rW, rTopY + 7);
                    sCtx.closePath();
                    sCtx.fill();

                    sCtx.fillStyle = "#a15f30";
                    sCtx.fillRect(rX + 7, rTopY, rW - 14, 2);

                    const drawCornerBracket = (cx, cy, dirX, dirY) => {
                        const bSize = 22;
                        const bThick = 7;
                        sCtx.fillStyle = "#22252a";
                        sCtx.fillRect(cx, cy, dirX * bSize, dirY * bThick);
                        sCtx.fillRect(cx, cy, dirX * bThick, dirY * bSize);

                        sCtx.fillStyle = "#4b5563";
                        sCtx.fillRect(cx + dirX, cy + dirY, dirX * (bSize - 2), dirY);
                        sCtx.fillRect(cx + dirX, cy + dirY, dirX, dirY * (bSize - 2));

                        const drawRivet = (rx, ry) => {
                            sCtx.fillStyle = "#111827";
                            sCtx.beginPath();
                            sCtx.arc(rx, ry + 0.8, 3, 0, Math.PI * 2);
                            sCtx.fill();
                            sCtx.fillStyle = "#9ca3af";
                            sCtx.beginPath();
                            sCtx.arc(rx, ry, 2.5, 0, Math.PI * 2);
                            sCtx.fill();
                            sCtx.fillStyle = "#ffffff";
                            sCtx.beginPath();
                            sCtx.arc(rx - 0.7, ry - 0.7, 1, 0, Math.PI * 2);
                            sCtx.fill();
                        };
                        drawRivet(cx + dirX * 14, cy + dirY * (bThick / 2));
                        drawRivet(cx + dirX * (bThick / 2), cy + dirY * 14);
                    };

                    drawCornerBracket(bx + 1, by + 1, 1, 1);
                    drawCornerBracket(bx + bw - 1, by + 1, -1, 1);
                    drawCornerBracket(bx + 1, by + bh - 1, 1, -1);
                    drawCornerBracket(bx + bw - 1, by + bh - 1, -1, -1);

                    const drawPostBolts = (postX) => {
                        const midX = postX + 9;
                        const drawBolt = (byPos) => {
                            sCtx.fillStyle = "#1e293b";
                            sCtx.beginPath();
                            sCtx.arc(midX, byPos + 0.8, 3.5, 0, Math.PI * 2);
                            sCtx.fill();
                            sCtx.fillStyle = "#64748b";
                            sCtx.beginPath();
                            sCtx.arc(midX, byPos, 3, 0, Math.PI * 2);
                            sCtx.fill();
                            sCtx.fillStyle = "#cbd5e1";
                            sCtx.beginPath();
                            sCtx.arc(midX - 0.8, byPos - 0.8, 1.2, 0, Math.PI * 2);
                            sCtx.fill();
                        };
                        drawBolt(by + 16);
                        drawBolt(by + bh - 16);
                    };
                    drawPostBolts(leftPostX);
                    drawPostBolts(rightPostX);

                    sCtx.translate(0, -sh / 2 - 30);
                    renderContents();
                    sCtx.restore();

                    ctx = origCtx;
                    window._tutorialSignCache[cacheKey] = cached;
                }
                ctx.drawImage(cached, drawX - sw / 2 - 36, 500 - sh - 54);
            };
            const drawSignLabel = (label, lx, ly, font = "bold 13px sans-serif") => {
                ctx.save();
                ctx.shadowBlur = 0;
                ctx.font = font;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "#1a0b03";
                ctx.fillText(label, lx, ly + 1.5);
                ctx.fillStyle = "#fff8ed";
                ctx.fillText(label, lx, ly);
                ctx.restore();
            };
            const drawKey = (kx, ky, label, kw = 28) => {
                ctx.save();
                ctx.shadowBlur = 0;
                const kh = 26;
                const rx = kx - kw / 2;
                const ry = ky - kh / 2;

                ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(rx, ry + 3, kw, kh, 4);
                else ctx.rect(rx, ry + 3, kw, kh);
                ctx.fill();

                ctx.fillStyle = "#334155";
                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(rx, ry + 2, kw, kh, 4);
                else ctx.rect(rx, ry + 2, kw, kh);
                ctx.fill();

                const keyGrad = ctx.createLinearGradient(0, ry, 0, ry + kh - 2);
                keyGrad.addColorStop(0, "#ffffff");
                keyGrad.addColorStop(0.7, "#f1f5f9");
                keyGrad.addColorStop(1, "#cbd5e1");
                ctx.fillStyle = keyGrad;
                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(rx, ry, kw, kh - 2, 4);
                else ctx.rect(rx, ry, kw, kh - 2);
                ctx.fill();

                ctx.strokeStyle = "#94a3b8";
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.fillStyle = "#0f172a";
                ctx.font = "bold 12px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(label, kx, ky - 1);
                ctx.restore();
            };
            const drawDPad = (dx, dy) => {
                ctx.save();
                ctx.shadowBlur = 0;
                ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
                ctx.fillRect(dx - 22, dy - 6, 44, 16);
                ctx.fillRect(dx - 6, dy - 22, 16, 44);

                ctx.fillStyle = "#1e293b";
                ctx.fillRect(dx - 22, dy - 8, 44, 16);
                ctx.fillRect(dx - 8, dy - 22, 16, 44);

                ctx.fillStyle = "#334155";
                ctx.fillRect(dx - 21, dy - 7, 42, 14);
                ctx.fillRect(dx - 7, dy - 21, 14, 42);

                ctx.fillStyle = "#0f172a";
                ctx.beginPath();
                ctx.arc(dx, dy, 5, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = time % 60 < 30 ? "#38bdf8" : "#94a3b8";
                ctx.beginPath();
                ctx.moveTo(dx - 18, dy);
                ctx.lineTo(dx - 11, dy - 4);
                ctx.lineTo(dx - 11, dy + 4);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = time % 60 >= 30 ? "#38bdf8" : "#94a3b8";
                ctx.beginPath();
                ctx.moveTo(dx + 18, dy);
                ctx.lineTo(dx + 11, dy - 4);
                ctx.lineTo(dx + 11, dy + 4);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            };
            const drawRealPeggy = (px, py, fakeRef) => {
                const pColor = game.iceMode ? "#66ccff" : "#ff66aa";
                if (typeof drawPlayerEnhanced === "function") {
                    const savedTime = time;
                    time = 100;
                    ctx.save();
                    ctx.shadowBlur = 0;
                    drawPlayerEnhanced(ctx, px - 16, py - 16, 32, 32, fakeRef.facing || 1, 1, 1, pColor, 0, [], false, fakeRef);
                    ctx.restore();
                    time = savedTime;
                }
            };
            drawBigSign(450, 520, 175, () => {
                drawDPad(-180, -18);
                drawRealPeggy(-180, 38, {
                    state: "run",
                    facing: time % 60 < 30 ? -1 : 1
                });
                drawSignLabel(typeof __ === "function" ? __("ui_ctrl_move_short") : "MOVER", -180, -62);
                drawKey(-60, -18, typeof __ === "function" ? __("ui_key_space") : "ESPACIO", 70);
                drawRealPeggy(-60, 38, {
                    state: "jump",
                    vy: time % 60 < 30 ? -2 : 2
                });
                drawSignLabel(typeof __ === "function" ? __("ui_ctrl_jump_short") : "SALTAR", -60, -62);
                drawKey(60, -18, "X");
                drawRealPeggy(60, 38, {
                    state: "idle",
                    facing: 1
                });
                ctx.fillStyle = "#fbbf24";
                ctx.fillRect(80, 34, 6, 6);
                drawSignLabel(typeof __ === "function" ? __("ui_ctrl_shoot_short") : "DISPARAR", 60, -62);
                drawKey(180, -18, "C");
                drawRealPeggy(180, 38, {
                    state: "run",
                    facing: 1,
                    dashTimer: 10
                });
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(150, 36);
                ctx.lineTo(165, 36);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(145, 44);
                ctx.lineTo(160, 44);
                ctx.stroke();
                drawSignLabel(typeof __ === "function" ? __("ui_ctrl_dash_short") : "DASH", 180, -62);
            });
            drawBigSign(1320, 480, 175, () => {
                drawKey(-175, -18, "X");
                drawSignLabel(typeof __ === "function" ? __("ui_ctrl_hold") : "MANTENER", -175, -62);
                drawRealPeggy(-105, 38, {
                    state: "idle",
                    facing: 1,
                    charging: true,
                    chargeLevel: 1
                });
                drawSignLabel("1", -105, -18, "bold 11px sans-serif");
                drawRealPeggy(-50, 38, {
                    state: "idle",
                    facing: 1,
                    charging: true,
                    chargeLevel: 2
                });
                drawSignLabel("2", -50, -18, "bold 11px sans-serif");
                drawRealPeggy(5, 38, {
                    state: "idle",
                    facing: 1,
                    charging: true,
                    chargeLevel: 3
                });
                drawSignLabel("3", 5, -18, "bold 11px sans-serif");
                drawRealPeggy(60, 38, {
                    state: "idle",
                    facing: 1,
                    charging: true,
                    chargeLevel: 4
                });
                drawSignLabel("4", 60, -18, "bold 11px sans-serif");
                drawRealPeggy(120, 38, {
                    state: "idle",
                    facing: 1,
                    charging: true,
                    chargeLevel: 5
                });
                drawSignLabel(typeof __ === "function" ? __("ui_ctrl_lvl5_beam") : "5 ⚡ RAYO", 155, -18, "bold 11px sans-serif");
                ctx.save();
                const bGrad = ctx.createLinearGradient(136, 32, 136, 44);
                bGrad.addColorStop(0, "rgba(0, 220, 255, 0.35)");
                bGrad.addColorStop(0.5, "#ffffff");
                bGrad.addColorStop(1, "rgba(0, 220, 255, 0.35)");
                ctx.fillStyle = bGrad;
                ctx.fillRect(136, 33, 75, 10);
                ctx.fillStyle = "rgba(0, 240, 255, 0.9)";
                ctx.fillRect(136, 36, 75, 4);
                ctx.restore();
            });
            drawBigSign(1750, 300, 175, () => {
                drawKey(-70, -34, typeof __ === "function" ? __("ui_key_space") : "ESPACIO", 66);
                drawSignLabel("+", -70, -16);
                drawKey(-70, 2, "C");
                drawRealPeggy(-70, 48, {
                    state: "jump",
                    facing: 1,
                    vy: 2,
                    dashTimer: 10
                });
                ctx.fillStyle = "rgba(255,255,255,0.4)";
                ctx.beginPath();
                ctx.ellipse(-70, 68, 15, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                drawSignLabel(typeof __ === "function" ? __("ui_ctrl_air_dash") : "AIR DASH", -70, -62);
                drawKey(70, -34, "↑");
                drawSignLabel("+", 70, -16);
                drawKey(70, 2, "X");
                drawRealPeggy(70, 48, {
                    state: "jump",
                    facing: 1,
                    vy: -1
                });
                ctx.fillStyle = "#fbbf24";
                ctx.fillRect(66, 16, 6, 6);
                drawSignLabel(typeof __ === "function" ? __("ui_ctrl_shoot_up") : "DISPARO ARRIBA", 70, -62);
            });
            drawBigSign(13050, 280, 175, () => {
                drawKey(-60, -34, "X");
                drawSignLabel(typeof __ === "function" ? __("ui_ctrl_lvl4") : "NIVEL 4", -20, -34, "bold 10px sans-serif");
                drawSignLabel("+", -60, -16);
                drawKey(-60, 2, "C");
                drawRealPeggy(50, 38, {
                    state: "run",
                    facing: 1,
                    dashTimer: 10,
                    dashMax: true,
                    dashDir: 1,
                    charging: true,
                    chargeLevel: 4
                });
                drawSignLabel(typeof __ === "function" ? __("ui_ctrl_edash_short") : "ENERGY DASH", 0, -62);
            });
        }
        if (Array.isArray(game.platforms) && game.platforms.length > 0) {
            const pCamMin = cameraX - 100, pCamMax = cameraX + VIEW_W + 100;
            for (let pi = 0; pi < game.platforms.length; pi++) {
                const p = game.platforms[pi];
                if (p.x + p.w < pCamMin || p.x > pCamMax) continue;
                p.draw(ctx, cameraX);
            }
        }
        if (currentLevel === 0 && typeof window.drawCavernEntrance === "function") {
            window.drawCavernEntrance(ctx, cameraX, time);
        }
        if (currentLevel === 3) {
            ctx.save();
            const waterY = 495;
            const waveAmp = game.stormMode || window.postGameHorror ? 15 : 6;
            const speed = game.stormMode || window.postGameHorror ? 0.18 : 0.08;
            const waterStep = typeof window !== "undefined" && window.PerfQuality && window.PerfQuality.level === "low" ? 40 : 20;
            
            ctx.fillStyle = window.postGameHorror ? "rgba(25, 0, 0, 0.8)" : game.stormMode ? "rgba(2, 10, 25, 0.9)" : "rgba(3, 40, 70, 0.7)";
            ctx.beginPath();
            ctx.moveTo(-60, VIEW_H + 120);
            ctx.lineTo(-60, waterY);
            for (let xScreen = -60; xScreen <= VIEW_W + 60; xScreen += waterStep) {
                const worldX = xScreen + cameraX;
                const wave = Math.sin(time * speed * 0.7 + worldX * 0.015) * waveAmp * 1.5;
                ctx.lineTo(xScreen, waterY - 10 + wave);
            }
            ctx.lineTo(VIEW_W + 60, VIEW_H + 120);
            ctx.closePath();
            ctx.fill();

            const seaGrad = ctx.createLinearGradient(0, waterY, 0, VIEW_H + 50);
            if (window.postGameHorror) {
                seaGrad.addColorStop(0, "rgba(80, 5, 5, 0.96)");
                seaGrad.addColorStop(0.35, "rgba(30, 2, 2, 0.98)");
                seaGrad.addColorStop(1, "rgba(5, 0, 0, 1)");
            } else if (game.stormMode) {
                seaGrad.addColorStop(0, "rgba(10, 50, 90, 0.92)");
                seaGrad.addColorStop(0.3, "rgba(5, 20, 40, 0.96)");
                seaGrad.addColorStop(1, "rgba(0, 5, 10, 0.99)");
            } else {
                seaGrad.addColorStop(0, "rgba(0, 200, 255, 0.65)");
                seaGrad.addColorStop(0.3, "rgba(5, 100, 160, 0.85)");
                seaGrad.addColorStop(1, "rgba(0, 30, 60, 0.98)");
            }

            const waterFrontStep = waterStep === 40 ? 24 : 12;
            ctx.fillStyle = seaGrad;
            ctx.beginPath();
            ctx.moveTo(-60, VIEW_H + 120);
            ctx.lineTo(-60, waterY);
            for (let xScreen = -60; xScreen <= VIEW_W + 60; xScreen += waterFrontStep) {
                const worldX = xScreen + cameraX;
                const wave = Math.sin(time * speed + worldX * .022) * waveAmp + Math.cos(time * speed * .8 + worldX * .01) * (waveAmp * .5);
                ctx.lineTo(xScreen, waterY + wave);
            }
            ctx.lineTo(VIEW_W + 60, VIEW_H + 120);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = window.postGameHorror ? "rgba(255, 100, 100, 0.8)" : game.stormMode ? "rgba(150, 220, 255, 0.9)" : "rgba(255, 255, 255, 0.8)";
            ctx.lineWidth = game.stormMode || window.postGameHorror ? 4 : 2;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            
            ctx.beginPath();
            for (let xScreen = -60; xScreen <= VIEW_W + 60; xScreen += waterFrontStep) {
                const worldX = xScreen + cameraX;
                const wave = Math.sin(time * speed + worldX * .022) * waveAmp + Math.cos(time * speed * .8 + worldX * .01) * (waveAmp * .5);
                if (xScreen === -60) ctx.moveTo(xScreen, waterY + wave); else ctx.lineTo(xScreen, waterY + wave);
            }
            ctx.stroke();

            ctx.fillStyle = window.postGameHorror ? "rgba(255, 50, 50, 0.7)" : "rgba(255, 255, 255, 0.7)";
            ctx.beginPath();
            for (let xScreen = -20; xScreen <= VIEW_W + 20; xScreen += 35) {
                const worldX = xScreen + cameraX;
                const wave = Math.sin(time * speed + worldX * 0.022) * waveAmp + Math.cos(time * speed * 0.8 + worldX * 0.01) * (waveAmp * 0.5);
                
                if (wave < -waveAmp * 0.3) {
                    for(let f=0; f<3; f++) {
                        const fx = xScreen + Math.sin(worldX * 0.08 + f * 2.1) * 10;
                        const fy = waterY + wave - Math.abs(Math.cos(worldX * 0.05 + f * 1.7)) * 8 - 2;
                        const fr = 1 + (f % 2);
                        ctx.moveTo(fx + fr, fy);
                        ctx.arc(fx, fy, fr, 0, Math.PI * 2);
                    }
                }
            }
            ctx.fill();

            ctx.restore();
        }

    function drawFriendSpeechBubble(ctx, text, targetX, targetY, accentColor, alpha, scale) {
        if (!text || alpha <= 0.01) return;
        if (typeof __ === "function") text = __(text);
        if (!text) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

        ctx.font = "bold 12px sans-serif";
        const maxLineW = 190;
        const lines = [];
        const words = text.split(" ");
        let curLine = "";
        for (let i = 0; i < words.length; i++) {
            const w = words[i];
            const testLine = curLine ? curLine + " " + w : w;
            if (ctx.measureText(testLine).width <= maxLineW) {
                curLine = testLine;
            } else {
                if (curLine) {
                    lines.push(curLine);
                    curLine = "";
                }
                if (ctx.measureText(w).width > maxLineW) {
                    for (let c of w) {
                        if (ctx.measureText(curLine + c).width > maxLineW) {
                            lines.push(curLine);
                            curLine = c;
                        } else {
                            curLine += c;
                        }
                    }
                } else {
                    curLine = w;
                }
            }
        }
        if (curLine) lines.push(curLine);

        const lineHeight = 16;
        let maxMeasuredW = 0;
        lines.forEach(l => {
            const w = ctx.measureText(l).width;
            if (w > maxMeasuredW) maxMeasuredW = w;
        });

        const padX = 14;
        const padY = 8;
        const boxW = Math.max(70, Math.ceil(maxMeasuredW + padX * 2));
        const boxH = Math.ceil(lines.length * lineHeight + padY * 2);

        let boxX = Math.round(targetX - boxW / 2);
        if (boxX < 14) boxX = 14;
        if (boxX + boxW > (typeof VIEW_W !== "undefined" ? VIEW_W : 800) - 14) {
            boxX = (typeof VIEW_W !== "undefined" ? VIEW_W : 800) - 14 - boxW;
        }

        const tailH = 8;
        const boxY = Math.round(targetY - boxH - tailH - 6);

        ctx.translate(targetX, targetY - 4);
        ctx.scale(scale, scale);
        ctx.translate(-targetX, -(targetY - 4));

        ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 10);
        ctx.fill();

        const tailX = Math.max(boxX + 16, Math.min(boxX + boxW - 16, targetX));
        ctx.beginPath();
        ctx.moveTo(tailX - 6, boxY + boxH);
        ctx.lineTo(tailX, boxY + boxH + tailH);
        ctx.lineTo(tailX + 6, boxY + boxH);
        ctx.closePath();
        ctx.fill();

        ctx.shadowColor = "transparent";
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = accentColor || "#0284c7";
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 10);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(tailX - 6, boxY + boxH - 1.5);
        ctx.lineTo(tailX, boxY + boxH + tailH);
        ctx.lineTo(tailX + 6, boxY + boxH - 1.5);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(tailX - 6.5, boxY + boxH - 1.5);
        ctx.lineTo(tailX, boxY + boxH + tailH);
        ctx.lineTo(tailX + 6.5, boxY + boxH - 1.5);
        ctx.stroke();

        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#0f172a";
        lines.forEach((line, idx) => {
            const textY = boxY + padY + (idx + 0.5) * lineHeight;
            ctx.fillText(line, boxX + boxW / 2, textY);
        });

        ctx.restore();
    }
    window.drawFriendSpeechBubble = drawFriendSpeechBubble;

    function updateAndDrawHubLithium(ctx, cameraX, time) {
        if (!game.isHub || !game.hubLithium || window.postGameHorror) return;
        const lit = game.hubLithium;
        lit.stateTimer = (lit.stateTimer || 0) + 1;
        lit.cycleTimer = (lit.cycleTimer || 0) + 1;
        lit.glowTimer = (lit.glowTimer || 0) + 1;

        const pDist = game.player ? game.player.x - lit.x : 999;
        const isNearPeggy = Math.abs(pDist) < 120;

        if (lit.talkCooldown > 0) lit.talkCooldown--;
        if (isNearPeggy && !lit.speechBubble && (lit.talkCooldown || 0) <= 0) {
            lit.msgIndex = ((lit.msgIndex || 0) % 4) + 1;
            const msgs = [
                typeof __ === "function" ? __("dlg_litio_msg_1") : "💛 ¡Hola Peggy! ¡Me alegra tanto estar a salvo contigo!",
                typeof __ === "function" ? __("dlg_litio_msg_2") : "✨ ¡Gracias por salvarme en el Desfiladero Carmesí!",
                typeof __ === "function" ? __("dlg_litio_msg_3") : "🌟 ¡Eres el mejor, Peggy! ¡Por fin puedo volar libre!",
                typeof __ === "function" ? __("dlg_litio_msg_4") : "💫 ¡Este lugar es maravilloso y pacífico!"
            ];
            lit.speechBubble = {
                text: msgs[lit.msgIndex - 1],
                timer: 0,
                maxTimer: 240,
                alpha: 0,
                scale: 0.65
            };
            lit.talkCooldown = 320;
            try {
                if (typeof playSound === "function") {
                    playSound(680, 0.1, "sine", 0.12, 940);
                }
            } catch(e) {}
        }

        if (lit.speechBubble) {
            const b = lit.speechBubble;
            b.timer++;
            if (b.timer < 14) {
                b.alpha = Math.min(1.0, b.alpha + 0.16);
                b.scale += (1.0 - b.scale) * 0.3;
            } else if (b.timer > b.maxTimer - 18) {
                b.alpha = Math.max(0, (b.maxTimer - b.timer) / 18);
                b.scale = 0.9 + 0.1 * b.alpha;
            } else {
                b.alpha = 1.0;
                b.scale = 1.0;
            }
            if (Math.abs(pDist) > 190 && b.timer < b.maxTimer - 18) {
                b.timer = Math.max(b.timer, b.maxTimer - 18);
            }
            if (b.timer >= b.maxTimer) {
                lit.speechBubble = null;
            }
        }

        if (lit.glowTimer % 180 === 0 && (lit.glowing || 0) <= 0) {
            lit.glowing = 45;
            try {
                if (typeof playSound === "function") {
                    playSound(880, 0.15, "sine", 0.12, 1150);
                }
            } catch(e) {}
        }
        if ((lit.glowing || 0) > 0) {
            lit.glowing--;
            const gProg = lit.glowing / 45;
            lit.glowIntensity = Math.sin(gProg * Math.PI);
            if (lit.glowing % 5 === 0 && typeof particles !== "undefined") {
                const sAng = Math.random() * Math.PI * 2;
                particles.push({
                    x: lit.x + lit.w / 2,
                    y: lit.y + lit.h / 2,
                    vx: Math.cos(sAng) * (2.2 + Math.random() * 2),
                    vy: Math.sin(sAng) * (2.2 + Math.random() * 2),
                    color: Math.random() < 0.5 ? "#ffd700" : "#ffffff",
                    size: 3.5,
                    life: 25,
                    type: "spark"
                });
            }
        } else {
            lit.glowIntensity = Math.max(0, (lit.glowIntensity || 0) - 0.05);
        }

        if (isNearPeggy && lit.speechBubble) {
            lit.facing = pDist >= 0 ? 1 : -1;
            const hoverY = Math.sin(lit.cycleTimer * 0.08) * 6;
            lit.x += (lit.baseX - lit.x) * 0.08;
            lit.y += ((lit.baseY + hoverY) - lit.y) * 0.08;
            lit.scaleX = 1 + Math.sin(lit.cycleTimer * 0.1) * 0.05;
            lit.scaleY = 1 - Math.sin(lit.cycleTimer * 0.1) * 0.05;
        } else {
            if (lit.state === "levitating") {
                const hoverY = Math.sin(lit.cycleTimer * 0.06) * 7;
                lit.x += (lit.baseX - lit.x) * 0.06;
                lit.y += ((lit.baseY + hoverY) - lit.y) * 0.06;
                lit.scaleX = 1 + Math.sin(lit.cycleTimer * 0.08) * 0.04;
                lit.scaleY = 1 - Math.sin(lit.cycleTimer * 0.08) * 0.04;
                if (!isNearPeggy) {
                    lit.facing = Math.sin(lit.cycleTimer * 0.03) >= 0 ? 1 : -1;
                } else {
                    lit.facing = pDist >= 0 ? 1 : -1;
                }
                if (Math.random() < 0.2 && typeof particles !== "undefined") {
                    particles.push({
                        x: lit.x + lit.w / 2 + (Math.random() - 0.5) * 12,
                        y: lit.y + lit.h / 2 + (Math.random() - 0.5) * 12,
                        vx: (Math.random() - 0.5) * 0.8,
                        vy: -Math.random() * 1.2,
                        color: Math.random() < 0.6 ? "#ffd700" : "#ffffff",
                        size: 2.2,
                        life: 18,
                        type: "spark"
                    });
                }
                if (lit.stateTimer > 240 && !isNearPeggy) {
                    lit.state = "flying";
                    lit.stateTimer = 0;
                    lit.flightProgress = 0;
                    try {
                        if (typeof playSound === "function") {
                            playSound(520, 0.15, "triangle", 0.15, 780);
                        }
                    } catch(e) {}
                }
            } else if (lit.state === "flying") {
                lit.flightProgress = (lit.flightProgress || 0) + 0.034;
                const fxOffset = Math.sin(lit.flightProgress) * 105;
                const fyOffset = Math.sin(lit.flightProgress * 2) * 42 - 28;
                const targetX = lit.baseX + fxOffset;
                const targetY = lit.baseY + fyOffset;
                const prevX = lit.x;
                lit.x += (targetX - lit.x) * 0.16;
                lit.y += (targetY - lit.y) * 0.16;
                const vx = lit.x - prevX;
                if (Math.abs(vx) > 0.4) lit.facing = vx > 0 ? 1 : -1;
                lit.scaleX = 1.1;
                lit.scaleY = 0.9;

                if (!Array.isArray(lit.trail)) lit.trail = [];
                lit.trail.unshift({
                    x: lit.x + lit.w / 2,
                    y: lit.y + lit.h / 2,
                    alpha: 1.0,
                    size: 6.5
                });
                if (lit.trail.length > 24) lit.trail.pop();

                if (typeof particles !== "undefined") {
                    for (let s = 0; s < 2; s++) {
                        particles.push({
                            x: lit.x + lit.w / 2 + (Math.random() - 0.5) * 8,
                            y: lit.y + lit.h / 2 + (Math.random() - 0.5) * 8,
                            vx: -vx * 0.35 + (Math.random() - 0.5) * 1.5,
                            vy: (Math.random() - 0.5) * 1.6,
                            color: Math.random() < 0.55 ? "#ffd700" : (Math.random() < 0.85 ? "#ffffff" : "#fef08a"),
                            size: 2.8 + Math.random() * 2.2,
                            life: 22,
                            type: "spark"
                        });
                    }
                }

                if (lit.flightProgress >= Math.PI * 4) {
                    lit.state = "return";
                    lit.stateTimer = 0;
                }
            } else if (lit.state === "return") {
                lit.x += (lit.baseX - lit.x) * 0.065;
                lit.y += (lit.baseY - lit.y) * 0.065;
                lit.facing = lit.baseX >= lit.x ? 1 : -1;
                lit.scaleX += (1 - lit.scaleX) * 0.1;
                lit.scaleY += (1 - lit.scaleY) * 0.1;
                if (Math.hypot(lit.x - lit.baseX, lit.y - lit.baseY) < 4.0 || lit.stateTimer > 90) {
                    lit.x = lit.baseX;
                    lit.y = lit.baseY;
                    lit.state = "levitating";
                    lit.stateTimer = 0;
                }
            }
        }

        if (Array.isArray(lit.trail) && lit.trail.length > 0) {
            ctx.save();
            for (let i = 0; i < lit.trail.length; i++) {
                const pt = lit.trail[i];
                pt.alpha -= 0.045;
                pt.size *= 0.93;
                if (pt.alpha > 0.02) {
                    ctx.fillStyle = `rgba(255, 215, 0, ${pt.alpha * 0.75})`;
                    ctx.beginPath();
                    ctx.arc(pt.x - cameraX, pt.y, Math.max(1, pt.size), 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            lit.trail = lit.trail.filter(pt => pt.alpha > 0.02);
            ctx.restore();
        }

        const lx = lit.x - cameraX;
        const ly = lit.y;
        const cx = lx + lit.w / 2;
        const cy = ly + lit.h / 2;

        const alt = Math.max(10, 500 - (lit.y + lit.h));
        const shadowScale = Math.max(0.2, 1 - alt / 140);
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.beginPath();
        ctx.ellipse(cx, 502, lit.w * 0.5 * shadowScale, 4.5 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();

        if ((lit.glowIntensity || 0) > 0.02) {
            ctx.save();
            ctx.globalCompositeOperation = "screen";
            const gRad = 32 + lit.glowIntensity * 28;
            const haloGrad = ctx.createRadialGradient(cx, cy, 3, cx, cy, gRad);
            haloGrad.addColorStop(0, `rgba(255, 255, 255, ${0.92 * lit.glowIntensity})`);
            haloGrad.addColorStop(0.35, `rgba(255, 215, 0, ${0.68 * lit.glowIntensity})`);
            haloGrad.addColorStop(0.7, `rgba(251, 191, 36, ${0.32 * lit.glowIntensity})`);
            haloGrad.addColorStop(1, "rgba(255, 215, 0, 0)");
            ctx.fillStyle = haloGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, gRad, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = `rgba(255, 255, 255, ${0.75 * lit.glowIntensity})`;
            ctx.lineWidth = 2 * lit.glowIntensity;
            const rLen = 26 * lit.glowIntensity;
            ctx.beginPath();
            ctx.moveTo(cx - rLen, cy); ctx.lineTo(cx + rLen, cy);
            ctx.moveTo(cx, cy - rLen); ctx.lineTo(cx, cy + rLen);
            ctx.stroke();
            ctx.restore();
        }

        if (typeof window.drawLithiumSprite === "function") {
            window.drawLithiumSprite(ctx, lx, ly, lit.w, lit.h, lit.facing, lit.scaleX, lit.scaleY, "happy", 0, time);
        }

        if (isNearPeggy && (!lit.speechBubble || lit.speechBubble.alpha < 0.3)) {
            const iconY = ly - 16 + Math.sin(time * 0.15) * 4;
            ctx.fillStyle = "#ffd700";
            ctx.font = "14px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("💛", cx, iconY);
        }

        if (lit.speechBubble && lit.speechBubble.alpha > 0.02 && typeof drawFriendSpeechBubble === "function") {
            drawFriendSpeechBubble(ctx, lit.speechBubble.text, cx, ly, "#ffd700", lit.speechBubble.alpha, lit.speechBubble.scale);
        }
    }
    window.updateAndDrawHubLithium = updateAndDrawHubLithium;

    function drawDeathSpeechBubble(ctx, text, targetX, targetY, alpha, scale) {
        if (!text || alpha <= 0.01) return;
        if (typeof __ === "function") text = __(text);
        if (!text) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

        ctx.font = "bold 11px sans-serif";
        const maxLineW = 320;
        const lines = [];
        const words = text.split(" ");
        let curLine = "";
        for (let i = 0; i < words.length; i++) {
            const w = words[i];
            const testLine = curLine ? curLine + " " + w : w;
            if (ctx.measureText(testLine).width <= maxLineW) {
                curLine = testLine;
            } else {
                if (curLine) lines.push(curLine);
                curLine = w;
            }
        }
        if (curLine) lines.push(curLine);

        const lineHeight = 16;
        let maxMeasuredW = 0;
        lines.forEach(l => {
            const w = ctx.measureText(l).width;
            if (w > maxMeasuredW) maxMeasuredW = w;
        });

        const padX = 16;
        const padY = 12;
        const headerH = 20;
        const boxW = Math.max(260, Math.ceil(maxMeasuredW + padX * 2));
        const boxH = Math.ceil(lines.length * lineHeight + padY * 2 + headerH);

        let boxX = Math.round(targetX - boxW / 2);
        if (boxX < 14) boxX = 14;
        if (boxX + boxW > VIEW_W - 14) boxX = VIEW_W - 14 - boxW;
        let boxY = Math.round(targetY - boxH - 14);
        if (boxY < 14) boxY = 14;

        ctx.translate(targetX, targetY);
        ctx.scale(scale, scale);
        ctx.translate(-targetX, -targetY);

        ctx.shadowColor = "rgba(220, 38, 38, 0.7)";
        ctx.shadowBlur = 14;

        ctx.fillStyle = "rgba(12, 3, 6, 0.96)";
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, [ 8, 8, 8, 8 ]);
        ctx.fill();

        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(127, 29, 29, 0.7)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(boxX + 2.5, boxY + 2.5, boxW - 5, boxH - 5, [ 6, 6, 6, 6 ]);
        ctx.stroke();

        const tailX = Math.max(boxX + 20, Math.min(boxX + boxW - 20, targetX));
        ctx.fillStyle = "rgba(12, 3, 6, 0.96)";
        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tailX - 8, boxY + boxH);
        ctx.lineTo(tailX, boxY + boxH + 10);
        ctx.lineTo(tailX + 8, boxY + boxH);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const headerTitle = "☠ " + (typeof __ === "function" ? __("death_name") : "LA MUERTE") + " ☠";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#ef4444";
        ctx.fillText(headerTitle, boxX + boxW / 2, boxY + padY + 6);

        ctx.strokeStyle = "rgba(220, 38, 38, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(boxX + 16, boxY + padY + 16);
        ctx.lineTo(boxX + boxW - 16, boxY + padY + 16);
        ctx.stroke();

        ctx.font = "11px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillStyle = "#fef2f2";
        let textY = boxY + padY + headerH + 4;
        lines.forEach(l => {
            ctx.fillText(l, boxX + padX, textY);
            textY += lineHeight;
        });

        ctx.restore();
    }
    window.drawDeathSpeechBubble = drawDeathSpeechBubble;

    function updateAndDrawDeathAltar(ctx, cameraX, time) {
        if (!game.isHub || !window.postGameHorror) return;
        if (!game.hubDeathAltar) {
            game.hubDeathAltar = {
                x: 1030,
                y: 500,
                particles: [],
                bubbleAlpha: 0,
                bubbleScale: 0.65,
                hasTriggered: false
            };
        }
        const altar = game.hubDeathAltar;
        const ax = altar.x - cameraX;
        const groundY = altar.y;

        const pDist = game.player ? Math.abs((game.player.x + game.player.w / 2) - altar.x) : 999;
        const isNearPeggy = pDist < 140;

        if (isNearPeggy) {
            altar.bubbleAlpha = Math.min(1, altar.bubbleAlpha + 0.1);
            altar.bubbleScale += (1 - altar.bubbleScale) * 0.2;
            if (!altar.hasTriggered) {
                altar.hasTriggered = true;
                try {
                    playSound(120, 0.6, "sawtooth", 0.14, 60);
                } catch (e) {}
            }
        } else {
            altar.bubbleAlpha = Math.max(0, altar.bubbleAlpha - 0.08);
            altar.bubbleScale = Math.max(0.65, altar.bubbleScale - 0.04);
            if (pDist > 220) altar.hasTriggered = false;
        }

        if (ax < -200 || ax > VIEW_W + 200) return;

        if (!Array.isArray(altar.particles)) altar.particles = [];
        if (altar.particles.length < 16 && Math.random() < 0.3) {
            altar.particles.push({
                x: (Math.random() - 0.5) * 80,
                y: -10 - Math.random() * 25,
                vx: (Math.random() - 0.5) * 0.4,
                vy: -0.4 - Math.random() * 0.6,
                life: 60 + Math.random() * 60,
                maxLife: 100,
                size: 1 + Math.random() * 1.5,
                color: Math.random() < 0.6 ? "#ef4444" : "#fca5a5"
            });
        }
        altar.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
        });
        altar.particles = altar.particles.filter(p => p.life > 0);

        ctx.save();

        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.beginPath();
        ctx.ellipse(ax, groundY + 2, 70, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#0c0409";
        ctx.beginPath();
        ctx.roundRect(ax - 55, groundY - 12, 110, 14, [ 2, 2, 0, 0 ]);
        ctx.fill();
        ctx.strokeStyle = "#7f1d1d";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = "#180712";
        ctx.beginPath();
        ctx.roundRect(ax - 45, groundY - 24, 90, 12, [ 2, 2, 0, 0 ]);
        ctx.fill();
        ctx.strokeStyle = "#991b1b";
        ctx.stroke();

        const runeGlow = 0.5 + 0.3 * Math.sin(time * 0.1);
        ctx.strokeStyle = `rgba(239, 68, 68, ${runeGlow})`;
        ctx.lineWidth = 1;
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.moveTo(ax - 38, groundY - 18);
        ctx.lineTo(ax - 10, groundY - 18);
        ctx.moveTo(ax + 10, groundY - 18);
        ctx.lineTo(ax + 38, groundY - 18);
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#250a1c";
        ctx.beginPath();
        ctx.roundRect(ax - 36, groundY - 34, 72, 11, [ 3, 3, 0, 0 ]);
        ctx.fill();
        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#991b1b";
        ctx.beginPath();
        ctx.moveTo(ax - 16, groundY - 34);
        ctx.lineTo(ax + 16, groundY - 34);
        ctx.lineTo(ax + 14, groundY - 12);
        ctx.lineTo(ax, groundY - 8);
        ctx.lineTo(ax - 14, groundY - 12);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#f87171";
        ctx.lineWidth = 1;
        ctx.stroke();

        [ -48, 48 ].forEach(sx => {
            ctx.fillStyle = "#331224";
            ctx.strokeStyle = "#7f1d1d";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(ax + sx, groundY - 18, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#0a0205";
            ctx.beginPath();
            ctx.arc(ax + sx - 1.8, groundY - 18.5, 1.2, 0, Math.PI * 2);
            ctx.arc(ax + sx + 1.8, groundY - 18.5, 1.2, 0, Math.PI * 2);
            ctx.fill();
        });

        [ -46, 46 ].forEach((cx, idx) => {
            ctx.strokeStyle = "#1a0815";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(ax + cx, groundY - 24);
            ctx.lineTo(ax + cx, groundY - 48);
            ctx.stroke();
            ctx.fillStyle = "#3b0f27";
            ctx.fillRect(ax + cx - 4, groundY - 49, 8, 3);
            ctx.fillStyle = "#fee2e2";
            ctx.fillRect(ax + cx - 2.5, groundY - 60, 5, 12);
            ctx.strokeStyle = "#111111";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ax + cx, groundY - 60);
            ctx.lineTo(ax + cx, groundY - 63);
            ctx.stroke();
            const fOffset = Math.sin(time * 0.2 + idx * 2) * 1.5;
            const flameGrad = ctx.createRadialGradient(ax + cx + fOffset, groundY - 67, 1, ax + cx, groundY - 67, 8);
            flameGrad.addColorStop(0, "#ffffff");
            flameGrad.addColorStop(0.3, "#f87171");
            flameGrad.addColorStop(0.7, "#dc2626");
            flameGrad.addColorStop(1, "rgba(220, 38, 38, 0)");
            ctx.fillStyle = flameGrad;
            ctx.beginPath();
            ctx.ellipse(ax + cx + fOffset * 0.5, groundY - 67, 4, 7, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        altar.particles.forEach(p => {
            const pAlpha = p.life / p.maxLife;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = pAlpha;
            ctx.beginPath();
            ctx.arc(ax + p.x, groundY - 34 + p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        const hoverY = Math.sin(time * 0.06) * 3;
        const deathY = groundY - 34 - 10 + hoverY;

        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath();
        ctx.ellipse(ax, groundY - 33, 24, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#0b0610";
        ctx.beginPath();
        ctx.moveTo(ax - 18, deathY);
        ctx.quadraticCurveTo(ax - 22, deathY - 24, ax - 14, deathY - 40);
        ctx.lineTo(ax + 14, deathY - 40);
        ctx.quadraticCurveTo(ax + 22, deathY - 24, ax + 18, deathY);
        ctx.lineTo(ax + 12, deathY - 4);
        ctx.lineTo(ax + 6, deathY);
        ctx.lineTo(ax, deathY - 5);
        ctx.lineTo(ax - 8, deathY);
        ctx.lineTo(ax - 14, deathY - 4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#2e102b";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.strokeStyle = "#1a0d24";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ax - 6, deathY - 36);
        ctx.lineTo(ax - 8, deathY - 8);
        ctx.moveTo(ax + 6, deathY - 36);
        ctx.lineTo(ax + 8, deathY - 8);
        ctx.stroke();

        ctx.fillStyle = "#07030b";
        ctx.beginPath();
        ctx.moveTo(ax - 13, deathY - 38);
        ctx.quadraticCurveTo(ax - 16, deathY - 56, ax, deathY - 62);
        ctx.quadraticCurveTo(ax + 16, deathY - 56, ax + 13, deathY - 38);
        ctx.quadraticCurveTo(ax, deathY - 36, ax - 13, deathY - 38);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#451230";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.ellipse(ax, deathY - 47, 8, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        const eyePulse = 0.8 + 0.2 * Math.sin(time * 0.12);
        const lookX = game.player ? Math.max(-2, Math.min(2, (game.player.x + game.player.w / 2 - altar.x) * 0.02)) : 0;
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 8 * eyePulse;
        ctx.beginPath();
        ctx.arc(ax - 3.5 + lookX, deathY - 47, 1.6, 0, Math.PI * 2);
        ctx.arc(ax + 3.5 + lookX, deathY - 47, 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#e2e8f0";
        ctx.beginPath();
        ctx.arc(ax + 13, deathY - 26, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ax + 11, deathY - 27); ctx.lineTo(ax + 15, deathY - 27);
        ctx.moveTo(ax + 11, deathY - 25); ctx.lineTo(ax + 15, deathY - 25);
        ctx.stroke();

        ctx.strokeStyle = "#1e1b2e";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ax + 18, deathY + 6);
        ctx.lineTo(ax + 10, deathY - 66);
        ctx.stroke();

        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(ax + 11, deathY - 48); ctx.lineTo(ax + 15, deathY - 48);
        ctx.moveTo(ax + 9, deathY - 64); ctx.lineTo(ax + 13, deathY - 64);
        ctx.stroke();

        const bladeOriginX = ax + 10;
        const bladeOriginY = deathY - 66;
        ctx.save();
        ctx.translate(bladeOriginX, bladeOriginY);
        const bladeGrad = ctx.createLinearGradient(0, 0, -38, 20);
        bladeGrad.addColorStop(0, "#cbd5e1");
        bladeGrad.addColorStop(0.5, "#475569");
        bladeGrad.addColorStop(1, "#0f172a");
        ctx.fillStyle = bladeGrad;
        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 1.4;
        ctx.shadowColor = "#dc2626";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-22, -18, -44, -6);
        ctx.quadraticCurveTo(-28, -2, -12, 12);
        ctx.quadraticCurveTo(0, 6, 0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-22, -18, -44, -6);
        ctx.stroke();
        ctx.restore();

        ctx.restore();

        if (altar.bubbleAlpha > 0.02 && typeof drawDeathSpeechBubble === "function") {
            const speechKey = "hub_death_altar_speech";
            drawDeathSpeechBubble(ctx, speechKey, ax, groundY - 95, altar.bubbleAlpha, altar.bubbleScale);
        }
    }
    window.updateAndDrawDeathAltar = updateAndDrawDeathAltar;

    function renderHubDoors(ctx, cameraX, time) {
        if (!game.isHub || !Array.isArray(game.hubDoors)) return null;
        let standingDoor = null;
        window.canEnterDoor = false;
        game.hubDoors.forEach(door => {
                const dx = door.x - cameraX;
                if (dx < -150 || dx > VIEW_W + 150) return;

                const isAnimLocked = door.unlockAnim && !door.unlockAnim.unlocked;
                const isUnlocked = door.levelNum <= unlockedLevel && !isAnimLocked && !door.boarded;
                if (isUnlocked) {
                    if (window.postGameHorror) {
                        const pulse = Math.sin(time * 0.1) * 0.2 + 1;
                        const rotate = time * 0.055;
                        ctx.save();

                        ctx.fillStyle = "#0a0407";
                        ctx.fillRect(dx - 14, door.y + door.h - 4, door.w + 28, 12);
                        ctx.fillStyle = "#1e0b14";
                        ctx.fillRect(dx - 10, door.y + door.h - 7, door.w + 20, 5);
                        ctx.strokeStyle = "#dc2626";
                        ctx.lineWidth = 1.5;
                        ctx.beginPath();
                        ctx.moveTo(dx - 8, door.y + door.h - 5);
                        ctx.lineTo(dx + door.w + 8, door.y + door.h - 5);
                        ctx.stroke();

                        ctx.fillStyle = "#10060d";
                        ctx.beginPath();
                        ctx.roundRect(dx - 10, door.y - 10, door.w + 20, door.h + 8, [ 36, 36, 0, 0 ]);
                        ctx.fill();

                        ctx.fillStyle = "#260c18";
                        ctx.strokeStyle = "#7f1d1d";
                        ctx.lineWidth = 1.5;
                        ctx.beginPath();
                        ctx.moveTo(dx - 8, door.y + 12);
                        ctx.quadraticCurveTo(dx - 22, door.y - 8, dx - 14, door.y - 20);
                        ctx.quadraticCurveTo(dx - 6, door.y - 10, dx - 2, door.y - 4);
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(dx + door.w + 8, door.y + 12);
                        ctx.quadraticCurveTo(dx + door.w + 22, door.y - 8, dx + door.w + 14, door.y - 20);
                        ctx.quadraticCurveTo(dx + door.w + 6, door.y - 10, dx + door.w + 2, door.y - 4);
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();

                        const colW = 10;
                        const leftColGrad = ctx.createLinearGradient(dx - 10, 0, dx - 10 + colW, 0);
                        leftColGrad.addColorStop(0, "#1c0914"); leftColGrad.addColorStop(0.5, "#3d1428"); leftColGrad.addColorStop(1, "#12050d");
                        ctx.fillStyle = leftColGrad;
                        ctx.fillRect(dx - 10, door.y + 12, colW, door.h - 18);

                        const rightColGrad = ctx.createLinearGradient(dx + door.w, 0, dx + door.w + colW, 0);
                        rightColGrad.addColorStop(0, "#12050d"); rightColGrad.addColorStop(0.5, "#3d1428"); rightColGrad.addColorStop(1, "#1c0914");
                        ctx.fillStyle = rightColGrad;
                        ctx.fillRect(dx + door.w, door.y + 12, colW, door.h - 18);

                        const glowAlpha = 0.5 + 0.3 * Math.sin(time * 0.12 + (door.levelNum || 1));
                        ctx.strokeStyle = `rgba(239, 68, 68, ${glowAlpha})`;
                        ctx.lineWidth = 1.5;
                        ctx.shadowColor = "#ef4444";
                        ctx.shadowBlur = 6;
                        ctx.beginPath();
                        ctx.moveTo(dx - 5, door.y + 18); ctx.lineTo(dx - 7, door.y + 44); ctx.lineTo(dx - 4, door.y + door.h - 12);
                        ctx.moveTo(dx + door.w + 5, door.y + 18); ctx.lineTo(dx + door.w + 7, door.y + 44); ctx.lineTo(dx + door.w + 4, door.y + door.h - 12);
                        ctx.stroke();
                        ctx.shadowBlur = 0;

                        ctx.strokeStyle = "#dc2626";
                        ctx.lineWidth = 2.5;
                        ctx.beginPath();
                        ctx.roundRect(dx - 10, door.y - 10, door.w + 20, door.h + 8, [ 36, 36, 0, 0 ]);
                        ctx.stroke();

                        ctx.save();
                        ctx.beginPath();
                        ctx.roundRect(dx + 3, door.y + 3, door.w - 6, door.h - 6, [ 28, 28, 0, 0 ]);
                        ctx.clip();

                        const doorCoreX = dx + door.w / 2;
                        const doorCoreY = door.y + door.h / 2;
                        const coreGrad = ctx.createRadialGradient(doorCoreX, doorCoreY, 3, doorCoreX, doorCoreY, door.h * 0.62);
                        coreGrad.addColorStop(0, "#ffffff");
                        coreGrad.addColorStop(0.12, "#fca5a5");
                        coreGrad.addColorStop(0.35, "#dc2626");
                        coreGrad.addColorStop(0.65, "#580b18");
                        coreGrad.addColorStop(0.9, "#180205");
                        coreGrad.addColorStop(1, "#050002");
                        ctx.fillStyle = coreGrad;
                        ctx.fillRect(dx + 3, door.y + 3, door.w - 6, door.h - 6);

                        ctx.save();
                        ctx.translate(doorCoreX, doorCoreY);
                        ctx.globalCompositeOperation = "screen";
                        ctx.lineWidth = 2.5;
                        ctx.lineCap = "round";
                        for (let arm = 0; arm < 5; arm++) {
                            const armAng = arm * (Math.PI * 2 / 5) - rotate;
                            ctx.strokeStyle = `rgba(239, 68, 68, ${0.55 + pulse * 0.25})`;
                            ctx.beginPath();
                            ctx.moveTo(0, 0);
                            for (let st = 0; st < 20; st++) {
                                const r = st * (door.w * 0.028);
                                const tAng = armAng + st * 0.18;
                                ctx.lineTo(Math.cos(tAng) * r, Math.sin(tAng) * r * 1.35);
                            }
                            ctx.stroke();
                        }

                        ctx.fillStyle = "#fee2e2";
                        ctx.shadowColor = "#ef4444";
                        ctx.shadowBlur = 4;
                        ctx.beginPath();
                        for (let p = 0; p < 9; p++) {
                            const pAng = -time * 0.08 + p * (Math.PI * 2 / 9);
                            const pRadX = (door.w * 0.34) * ((p % 3 + 1) / 3);
                            const pRadY = (door.h * 0.4) * ((p % 3 + 1) / 3);
                            const px2 = Math.cos(pAng) * pRadX;
                            const py2 = Math.sin(pAng) * pRadY;
                            ctx.moveTo(px2 + 1.5, py2);
                            ctx.arc(px2, py2, 1.8, 0, Math.PI * 2);
                        }
                        ctx.fill();
                        ctx.shadowBlur = 0;
                        ctx.restore();

                        ctx.strokeStyle = "rgba(239, 68, 68, 0.6)";
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.roundRect(dx + 3, door.y + 3, door.w - 6, door.h - 6, [ 28, 28, 0, 0 ]);
                        ctx.stroke();
                        ctx.restore();

                        const kx = dx + door.w / 2;
                        const ky = door.y - 10;
                        ctx.fillStyle = "#7f1d1d";
                        ctx.strokeStyle = "#dc2626";
                        ctx.lineWidth = 1.5;
                        ctx.beginPath();
                        ctx.arc(kx, ky, 8, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();

                        ctx.fillStyle = "#ffffff";
                        ctx.shadowColor = "#ef4444";
                        ctx.shadowBlur = 5;
                        ctx.beginPath();
                        ctx.arc(kx - 3, ky - 1, 1.5, 0, Math.PI * 2);
                        ctx.arc(kx + 3, ky - 1, 1.5, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.shadowBlur = 0;

                        ctx.restore();
                    } else {
                        const pulse = Math.sin(time * 0.1) * 0.15 + 1;
                        const rotate = time * 0.05;
                        ctx.save();

                    ctx.fillStyle = "#090d16";
                    ctx.fillRect(dx - 10, door.y + door.h - 3, door.w + 20, 9);
                    ctx.fillStyle = "#1e293b";
                    ctx.fillRect(dx - 7, door.y + door.h - 6, door.w + 14, 4);
                    ctx.strokeStyle = "#38bdf8";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(dx - 5, door.y + door.h - 4);
                    ctx.lineTo(dx + door.w + 5, door.y + door.h - 4);
                    ctx.stroke();

                    ctx.fillStyle = "#0f172a";
                    ctx.beginPath();
                    ctx.roundRect(dx - 7, door.y - 7, door.w + 14, door.h + 5, [ 32, 32, 0, 0 ]);
                    ctx.fill();

                    const colW = 7;
                    const leftColGrad = ctx.createLinearGradient(dx - 7, 0, dx - 7 + colW, 0);
                    leftColGrad.addColorStop(0, "#1e293b"); leftColGrad.addColorStop(0.5, "#475569"); leftColGrad.addColorStop(1, "#0f172a");
                    ctx.fillStyle = leftColGrad;
                    ctx.fillRect(dx - 7, door.y + 12, colW, door.h - 18);
                    const rightColGrad = ctx.createLinearGradient(dx + door.w, 0, dx + door.w + colW, 0);
                    rightColGrad.addColorStop(0, "#0f172a"); rightColGrad.addColorStop(0.5, "#475569"); rightColGrad.addColorStop(1, "#1e293b");
                    ctx.fillStyle = rightColGrad;
                    ctx.fillRect(dx + door.w, door.y + 12, colW, door.h - 18);

                    ctx.strokeStyle = "rgba(15, 23, 42, 0.8)";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(dx - 4, door.y + 16); ctx.lineTo(dx - 4, door.y + door.h - 8);
                    ctx.moveTo(dx + door.w + 3, door.y + 16); ctx.lineTo(dx + door.w + 3, door.y + door.h - 8);
                    ctx.stroke();

                    ctx.fillStyle = "#64748b";
                    ctx.fillRect(dx - 9, door.y + 8, colW + 4, 4);
                    ctx.fillRect(dx + door.w - 2, door.y + 8, colW + 4, 4);

                    ctx.strokeStyle = "#38bdf8";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.roundRect(dx - 7, door.y - 7, door.w + 14, door.h + 5, [ 32, 32, 0, 0 ]);
                    ctx.stroke();

                    ctx.save();
                    ctx.beginPath();
                    ctx.roundRect(dx + 3, door.y + 3, door.w - 6, door.h - 6, [ 26, 26, 0, 0 ]);
                    ctx.clip();

                    const doorCoreX = dx + door.w / 2;
                    const doorCoreY = door.y + door.h / 2;
                    const coreGrad = ctx.createRadialGradient(doorCoreX, doorCoreY, 2, doorCoreX, doorCoreY, door.h * 0.58);
                    coreGrad.addColorStop(0, "#ffffff");
                    coreGrad.addColorStop(0.18, "#e0e7ff");
                    coreGrad.addColorStop(0.45, "#4c1d95");
                    coreGrad.addColorStop(0.8, "#1e0836");
                    coreGrad.addColorStop(1, "#030008");
                    ctx.fillStyle = coreGrad;
                    ctx.fillRect(dx + 3, door.y + 3, door.w - 6, door.h - 6);

                    ctx.save();
                    ctx.translate(doorCoreX, doorCoreY);
                    ctx.globalCompositeOperation = "screen";
                    ctx.lineWidth = 2.2;
                    ctx.lineCap = "round";
                    for(let arm = 0; arm < 4; arm++) {
                        const armAng = arm * (Math.PI / 2) + rotate;
                        ctx.strokeStyle = `rgba(56, 189, 248, ${0.5 + pulse * 0.25})`;
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        for(let st = 0; st < 18; st++) {
                            const r = st * (door.w * 0.027);
                            const tAng = armAng - st * 0.16;
                            ctx.lineTo(Math.cos(tAng) * r, Math.sin(tAng) * r * 1.3);
                        }
                        ctx.stroke();
                    }

                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    for(let p = 0; p < 8; p++) {
                        const pAng = time * 0.07 + p * (Math.PI / 4);
                        const pRadX = (door.w * 0.32) * ((p % 3 + 1) / 3);
                        const pRadY = (door.h * 0.38) * ((p % 3 + 1) / 3);
                        const px2 = Math.cos(pAng) * pRadX;
                        const py2 = Math.sin(pAng) * pRadY;
                        ctx.moveTo(px2 + 1.5, py2);
                        ctx.arc(px2, py2, 1.5, 0, Math.PI * 2);
                    }
                    ctx.fill();
                    ctx.restore();

                    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.roundRect(dx + 3, door.y + 3, door.w - 6, door.h - 6, [ 26, 26, 0, 0 ]);
                    ctx.stroke();
                    ctx.restore();

                    const kx = dx + door.w / 2;
                    const ky = door.y - 7;
                    ctx.fillStyle = "#f59e0b";
                    ctx.strokeStyle = "#fbbf24";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    for (let s = 0; s < 5; s++) {
                        const outAng = -Math.PI / 2 + s * (Math.PI * 2 / 5);
                        const inAng = outAng + Math.PI / 5;
                        if (s === 0) ctx.moveTo(kx + Math.cos(outAng) * 7, ky + Math.sin(outAng) * 7);
                        else ctx.lineTo(kx + Math.cos(outAng) * 7, ky + Math.sin(outAng) * 7);
                        ctx.lineTo(kx + Math.cos(inAng) * 3.5, ky + Math.sin(inAng) * 3.5);
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();

                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(kx, ky, 1.5, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.restore();
                }
            } else {
                    const animGlow = door.unlockAnim && door.unlockAnim.glow ? door.unlockAnim.glow : 0;
                    if (animGlow > 0) {
                        ctx.save();
                        ctx.shadowColor = "#38bdf8";
                        ctx.shadowBlur = 24 * animGlow;
                        ctx.fillStyle = "rgba(56, 189, 248, " + .35 * animGlow + ")";
                        ctx.beginPath();
                        ctx.roundRect(dx - 5, door.y - 5, door.w + 10, door.h + 5, [ 32, 32, 0, 0 ]);
                        ctx.fill();
                        ctx.restore();
                    }

                    ctx.fillStyle = animGlow > 0 ? "#1e293b" : "#111827";
                    ctx.beginPath();
                    ctx.roundRect(dx - 4, door.y - 4, door.w + 8, door.h + 4, [ 30, 30, 0, 0 ]);
                    ctx.fill();
                    ctx.strokeStyle = animGlow > 0 ? "#38bdf8" : "#334155";
                    ctx.lineWidth = 2.5;
                    ctx.stroke();

                    ctx.fillStyle = animGlow > 0 ? "#0f172a" : "#090d16";
                    ctx.beginPath();
                    ctx.roundRect(dx + 2, door.y + 2, door.w - 4, door.h - 2, [ 26, 26, 0, 0 ]);
                    ctx.fill();

                    ctx.strokeStyle = "#475569";
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.moveTo(dx, door.y + 16); ctx.lineTo(dx + door.w, door.y + door.h - 10);
                    ctx.moveTo(dx + door.w, door.y + 16); ctx.lineTo(dx, door.y + door.h - 10);
                    ctx.stroke();

                    ctx.strokeStyle = "#94a3b8";
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(dx, door.y + 16); ctx.lineTo(dx + door.w, door.y + door.h - 10);
                    ctx.moveTo(dx + door.w, door.y + 16); ctx.lineTo(dx, door.y + door.h - 10);
                    ctx.stroke();

                    const lockX = dx + door.w / 2;
                    const lockY = door.y + door.h / 2 + 6;
                    const shakeOffset = animGlow > 0 ? Math.sin(time * .8) * (4 * animGlow) : 0;

                    ctx.fillStyle = "#1e293b";
                    ctx.strokeStyle = "#f59e0b";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(lockX + shakeOffset, lockY - 4, 11, Math.PI, 0);
                    ctx.stroke();

                    ctx.fillStyle = "#f59e0b";
                    ctx.beginPath();
                    ctx.roundRect(lockX - 10 + shakeOffset, lockY - 4, 20, 16, 4);
                    ctx.fill();
                    ctx.strokeStyle = "#d97706";
                    ctx.lineWidth = 1.5;
                    ctx.stroke();

                    ctx.fillStyle = "#0f172a";
                    ctx.beginPath();
                    ctx.arc(lockX + shakeOffset, lockY + 2, 2.5, 0, Math.PI * 2);
                    ctx.fillRect(lockX - 1.5 + shakeOffset, lockY + 2, 3, 5);
                    ctx.fill();
                }
                if (door.boarded) {
                    ctx.fillStyle = "#3a200e";
                    ctx.strokeStyle = "#231206";
                    ctx.lineWidth = 2;
                    ctx.fillRect(dx - 5, door.y + 20, door.w + 10, 16);
                    ctx.strokeRect(dx - 5, door.y + 20, door.w + 10, 16);
                    ctx.translate(dx + door.w / 2, door.y + 50);
                    ctx.rotate(.2);
                    ctx.fillRect(-door.w / 2 - 5, -8, door.w + 10, 16);
                    ctx.strokeRect(-door.w / 2 - 5, -8, door.w + 10, 16);
                    ctx.rotate(-.4);
                    ctx.fillRect(-door.w / 2 - 5, -8, door.w + 10, 16);
                    ctx.strokeRect(-door.w / 2 - 5, -8, door.w + 10, 16);
                    ctx.rotate(.2);
                    ctx.translate(-(dx + door.w / 2), -(door.y + 50));
                }
                ctx.save();
                const plateY = door.y - 34;
                const plateW = door.w + 24;
                const plateH = 22;
                const isPlateActive = isUnlocked || door.unlockAnim && door.unlockAnim.unlocked;
                if (window.postGameHorror) {
                    ctx.fillStyle = "rgba(18, 4, 8, 0.96)";
                    ctx.strokeStyle = "#dc2626";
                    ctx.lineWidth = 1.8;
                    ctx.shadowColor = "#dc2626";
                    ctx.shadowBlur = 10;
                    ctx.beginPath();
                    ctx.roundRect(dx - 12, plateY, plateW, plateH, [ 4, 4, 4, 4 ]);
                    ctx.fill();
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                    ctx.strokeStyle = "#78716c";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(dx - 6, plateY); ctx.lineTo(dx - 6, plateY - 6);
                    ctx.moveTo(dx + plateW - 18, plateY); ctx.lineTo(dx + plateW - 18, plateY - 6);
                    ctx.stroke();
                    ctx.font = "bold 12px sans-serif";
                    ctx.textBaseline = "middle";
                    ctx.textAlign = "center";
                    ctx.fillStyle = "#f87171";
                    ctx.fillText(typeof __ === "function" ? __("ui_level_n", door.levelNum) : "NIVEL " + door.levelNum, dx + door.w / 2, plateY + plateH / 2);
                } else {
                    ctx.fillStyle = isPlateActive ? "rgba(10, 15, 30, 0.95)" : "rgba(15, 12, 22, 0.95)";
                    ctx.strokeStyle = isPlateActive ? "#38bdf8" : "#475569";
                    ctx.lineWidth = 1.5;
                    if (isPlateActive) {
                        ctx.shadowColor = "#38bdf8";
                        ctx.shadowBlur = 8;
                    }
                    ctx.beginPath();
                    ctx.roundRect(dx - 12, plateY, plateW, plateH, [ 6, 6, 6, 6 ]);
                    ctx.fill();
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                    ctx.font = "bold 12px sans-serif";
                    ctx.textBaseline = "middle";
                    ctx.textAlign = "center";
                    ctx.fillStyle = isPlateActive ? "#ffffff" : "#94a3b8";
                    ctx.fillText(typeof __ === "function" ? __("ui_level_n", door.levelNum) : "NIVEL " + door.levelNum, dx + door.w / 2, plateY + plateH / 2);
                }
                ctx.restore();
                if (game.player && game.player.x + game.player.w > door.x + 8 && game.player.x < door.x + door.w - 8 && game.player.y + game.player.h >= door.y && game.player.y <= door.y + door.h + 20) {
                    standingDoor = door;
                }
            });
            
        return standingDoor;
    }
    window.renderHubDoors = renderHubDoors;

        let standingDoor = null;
        if (game.isHub && Array.isArray(game.hubDoors)) {
            standingDoor = renderHubDoors(ctx, cameraX, time);
            if (window.postGameHorror && typeof updateAndDrawDeathAltar === "function") {
                updateAndDrawDeathAltar(ctx, cameraX, time);
            }
            if (Array.isArray(game.hubFriends) && game.hubFriends.length > 0 && !window.postGameHorror) {
                game.hubFriends.forEach(f => {
                    f.hopTimer = (f.hopTimer || 0) + 1;
                    const pDist = game.player ? game.player.x - f.x : 0;
                    const isNearPeggy = Math.abs(pDist) < 130;
                    if (isNearPeggy) {
                        f.facing = pDist >= 0 ? 1 : -1;
                    }

                    if (f.talkCooldown > 0) f.talkCooldown--;
                    if (isNearPeggy && !f.speechBubble && (f.talkCooldown || 0) <= 0) {
                        f.msgIndex = ((f.msgIndex || 0) % 4) + 1;
                        const key = "hub_friend_" + (f.id || "azulin") + "_" + f.msgIndex;
                        const txt = (typeof __ !== "undefined" && __(key)) ? __(key) : "¡Gracias Peggy!";
                        f.speechBubble = {
                            text: txt,
                            timer: 0,
                            maxTimer: 240,
                            alpha: 0,
                            scale: 0.65
                        };
                        f.talkCooldown = 320;
                        try {
                            if (typeof playSound === "function") {
                                playSound(560 + (f.friendIdx || 0) * 60, 0.08, "sine", 0.09);
                            }
                        } catch(e){}
                    }

                    if (f.speechBubble) {
                        const b = f.speechBubble;
                        b.timer++;
                        if (b.timer < 14) {
                            b.alpha = Math.min(1.0, b.alpha + 0.16);
                            b.scale += (1.0 - b.scale) * 0.3;
                        } else if (b.timer > b.maxTimer - 18) {
                            b.alpha = Math.max(0, (b.maxTimer - b.timer) / 18);
                            b.scale = 0.9 + 0.1 * b.alpha;
                        } else {
                            b.alpha = 1.0;
                            b.scale = 1.0;
                        }
                        if (Math.abs(pDist) > 200 && b.timer < b.maxTimer - 18) {
                            b.timer = Math.max(b.timer, b.maxTimer - 18);
                        }
                        if (b.timer >= b.maxTimer) {
                            f.speechBubble = null;
                        }
                    }

                    const jumpCycle = isNearPeggy ? 65 : 120;
                    const isHop = f.hopTimer % jumpCycle < 22;
                    let hopOffset = 0;
                    let scaleX = 1;
                    let scaleY = 1;
                    if (isHop) {
                        const progress = f.hopTimer % jumpCycle / 22;
                        hopOffset = Math.sin(progress * Math.PI) * (isNearPeggy ? 24 : 16);
                        scaleX = .9;
                        scaleY = 1.15;
                    } else if (f.hopTimer % jumpCycle >= 22 && f.hopTimer % jumpCycle < 26) {
                        scaleX = 1.15;
                        scaleY = .85;
                    } else {
                        const breath = Math.sin(time * .12 + (f.baseX || 0)) * .035;
                        scaleX = 1 + breath;
                        scaleY = 1 - breath;
                    }
                    f.currentHopOffset = hopOffset;
                    if (!isNearPeggy) {
                        f.wanderTimer = (f.wanderTimer || 0) + 1;
                        const wOffset = Math.sin(f.wanderTimer * .025) * 24;
                        f.x = (f.baseX || f.x) + wOffset;
                        f.facing = Math.cos(f.wanderTimer * .025) >= 0 ? 1 : -1;
                    }
                    const fx = f.x - cameraX;
                    const fy = f.y - hopOffset;
                    const cx = fx + f.w / 2;
                    ctx.save();
                    ctx.translate(cx, fy + f.h / 2);
                    ctx.scale(scaleX, scaleY);
                    ctx.translate(-cx, -(fy + f.h / 2));
                    const shadowScale = Math.max(.35, 1 - hopOffset / 32);
                    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
                    ctx.beginPath();
                    ctx.ellipse(cx, f.y + f.h + 2, f.w * .44 * shadowScale, 4 * shadowScale, 0, 0, Math.PI * 2);
                    ctx.fill();
                    const fGrad = ctx.createLinearGradient(fx, fy, fx, fy + f.h);
                    fGrad.addColorStop(0, f.topColor || "#7dd3fc");
                    fGrad.addColorStop(1, f.botColor || "#0284c7");
                    ctx.fillStyle = fGrad;
                    ctx.beginPath();
                    ctx.roundRect(fx, fy, f.w, f.h, 10);
                    ctx.fill();
                    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                    ctx.beginPath();
                    ctx.ellipse(fx + f.w * .35, fy + 6, f.w * .28, 3.5, 0, 0, Math.PI * 2);
                    ctx.fill();
                    const cheekY = fy + f.h * .52;
                    ctx.fillStyle = f.cheekColor || "rgba(255, 102, 170, 0.65)";
                    ctx.beginPath();
                    ctx.ellipse(fx + f.w * .2, cheekY, 3.5, 2.2, 0, 0, Math.PI * 2);
                    ctx.ellipse(fx + f.w * .8, cheekY, 3.5, 2.2, 0, 0, Math.PI * 2);
                    ctx.fill();
                    const eyeY = fy + f.h * .36;
                    const lookX = f.facing * 2.2;
                    const lookY = isHop ? -1.2 : 0;
                    if (isHop || isNearPeggy) {
                        ctx.fillStyle = "#ffffff";
                        ctx.beginPath();
                        ctx.arc(fx + f.w * .3, eyeY, 5.8, 0, Math.PI * 2);
                        ctx.arc(fx + f.w * .7, eyeY, 5.8, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = "#111111";
                        ctx.beginPath();
                        ctx.arc(fx + f.w * .3 + lookX, eyeY + lookY, 3.2, 0, Math.PI * 2);
                        ctx.arc(fx + f.w * .7 + lookX, eyeY + lookY, 3.2, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = "#ffffff";
                        ctx.beginPath();
                        ctx.arc(fx + f.w * .25 + lookX, eyeY - 1.5, 1.4, 0, Math.PI * 2);
                        ctx.arc(fx + f.w * .65 + lookX, eyeY - 1.5, 1.4, 0, Math.PI * 2);
                        ctx.arc(fx + f.w * .33 + lookX, eyeY + 1.2, .8, 0, Math.PI * 2);
                        ctx.arc(fx + f.w * .73 + lookX, eyeY + 1.2, .8, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        ctx.fillStyle = "#ffffff";
                        ctx.beginPath();
                        ctx.arc(fx + f.w * .3, eyeY, 5.2, 0, Math.PI * 2);
                        ctx.arc(fx + f.w * .7, eyeY, 5.2, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = "#111111";
                        ctx.beginPath();
                        ctx.arc(fx + f.w * .3 + lookX, eyeY, 2.8, 0, Math.PI * 2);
                        ctx.arc(fx + f.w * .7 + lookX, eyeY, 2.8, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = "#ffffff";
                        ctx.beginPath();
                        ctx.arc(fx + f.w * .25 + lookX, eyeY - 1.5, 1.3, 0, Math.PI * 2);
                        ctx.arc(fx + f.w * .65 + lookX, eyeY - 1.5, 1.3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.strokeStyle = "#111111";
                    ctx.lineWidth = 1.8;
                    ctx.beginPath();
                    ctx.arc(fx + f.w * .3, eyeY - 7, 3, 1.1 * Math.PI, 1.9 * Math.PI);
                    ctx.arc(fx + f.w * .7, eyeY - 7, 3, 1.1 * Math.PI, 1.9 * Math.PI);
                    ctx.stroke();
                    const mouthY = fy + f.h * .66;
                    ctx.fillStyle = "#111111";
                    ctx.beginPath();
                    ctx.arc(cx, mouthY - 1, 5.2, 0, Math.PI);
                    ctx.fill();
                    ctx.fillStyle = "#ff6688";
                    ctx.beginPath();
                    ctx.arc(cx, mouthY + 1.4, 2.6, 0, Math.PI);
                    ctx.fill();
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(cx - 2, mouthY - 1, 4, 1.5);
                    if (isNearPeggy && (!f.speechBubble || f.speechBubble.alpha < 0.3)) {
                        const iconY = fy - 14 + Math.sin(time * .15 + (f.baseX || 0)) * 4;
                        ctx.fillStyle = "#ff3388";
                        ctx.font = "14px sans-serif";
                        ctx.textAlign = "center";
                        ctx.fillText("♥", cx, iconY);
                    }
                    ctx.restore();
                });

                game.hubFriends.forEach(f => {
                    if (f.speechBubble && f.speechBubble.alpha > 0.02) {
                        const fx = f.x - cameraX;
                        const fy = f.y - (f.currentHopOffset || 0);
                        const cx = fx + f.w / 2;
                        drawFriendSpeechBubble(ctx, f.speechBubble.text, cx, fy, f.botColor || "#0284c7", f.speechBubble.alpha, f.speechBubble.scale);
                    }
                });
            }
            if (!window.postGameHorror && typeof updateAndDrawHubLithium === "function") {
                updateAndDrawHubLithium(ctx, cameraX, time);
            }
            if (standingDoor && !game.player.frozen && !game.isEnteringDoor) {
                const isUnlocked = standingDoor.levelNum <= unlockedLevel && (!standingDoor.unlockAnim || standingDoor.unlockAnim.unlocked) && !standingDoor.boarded;
                const sdx = standingDoor.x - cameraX + standingDoor.w / 2;
                const floatY = standingDoor.y - 74 + Math.sin(time * .1) * 3;
                window.canEnterDoor = !!isUnlocked;
                ctx.save();
                ctx.font = "bold 13px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                if (isUnlocked) {
                    if (window.postGameHorror) {
                        const enterLabel = "▲ " + (typeof __ === "function" ? __("ui_entrar_abismo") : "ENTRAR AL ABISMO");
                        const enterW = Math.max(140, ctx.measureText(enterLabel).width + 30);
                        ctx.fillStyle = "rgba(18, 4, 8, 0.95)";
                        ctx.strokeStyle = "#dc2626";
                        ctx.lineWidth = 2;
                        ctx.shadowColor = "#dc2626";
                        ctx.shadowBlur = 12;
                        ctx.beginPath();
                        ctx.roundRect(sdx - enterW / 2, floatY - 14, enterW, 28, [ 8, 8, 8, 8 ]);
                        ctx.fill();
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                        ctx.fillStyle = "#ffffff";
                        ctx.fillText(enterLabel, sdx, floatY);
                        ctx.fillStyle = "#dc2626";
                        ctx.beginPath();
                        ctx.moveTo(sdx - 5, floatY + 14);
                        ctx.lineTo(sdx + 5, floatY + 14);
                        ctx.lineTo(sdx, floatY + 20);
                        ctx.fill();
                    } else {
                        const enterLabel = "▲ " + __("ui_presiona_arriba_entrar");
                        const enterW = Math.max(130, ctx.measureText(enterLabel).width + 30);
                        ctx.fillStyle = "rgba(10, 15, 30, 0.94)";
                        ctx.strokeStyle = "#00ffff";
                        ctx.lineWidth = 2;
                        ctx.shadowColor = "#00ffff";
                        ctx.shadowBlur = 10;
                        ctx.beginPath();
                        ctx.roundRect(sdx - enterW / 2, floatY - 14, enterW, 28, [ 8, 8, 8, 8 ]);
                        ctx.fill();
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                        ctx.fillStyle = "#ffffff";
                        ctx.fillText(enterLabel, sdx, floatY);
                        ctx.fillStyle = "#00ffff";
                        ctx.beginPath();
                        ctx.moveTo(sdx - 5, floatY + 14);
                        ctx.lineTo(sdx + 5, floatY + 14);
                        ctx.lineTo(sdx, floatY + 20);
                        ctx.fill();
                    }
                    if (keys["ArrowUp"] || keys["w"] || keys["W"]) {
                        keys["ArrowUp"] = false;
                        keys["w"] = false;
                        keys["W"] = false;
                        game.isEnteringDoor = true;
                        game.player.frozen = true;
                        window.canEnterDoor = false;
                        window.lastEnteredHubDoor = standingDoor;
                        window.lastEnteredHubDoorLevelNum = standingDoor.levelNum;
                        window.lastEnteredHubLevelIndex = standingDoor.levelIndex;
                        const targetDoorX = standingDoor.x + standingDoor.w / 2;
                        const targetDoorY = standingDoor.y + standingDoor.h / 2;
                        try {
                            playSound(380, .7, "sine", .4, 980);
                        } catch (e) {}
                        try {
                            createExplosion(targetDoorX, targetDoorY, window.postGameHorror ? "#dc2626" : "#ffffff", 40, 30);
                        } catch (e) {}
                        if (typeof gsap !== "undefined") {
                            gsap.to(game.player, {
                                x: targetDoorX - game.player.w / 2,
                                scaleX: .05,
                                scaleY: .05,
                                duration: .65,
                                ease: "power2.in"
                            });
                            game.cameraZoom = 1;
                            game.zoomTargetWorldX = targetDoorX;
                            game.zoomTargetWorldY = targetDoorY;
                            gsap.to(game, {
                                cameraZoom: 2.9,
                                duration: .75,
                                ease: "power2.inOut",
                                onComplete: () => {
                                    game.flash = 1;
                                    game.cameraZoom = 1;
                                    delete game.zoomTargetWorldX;
                                    delete game.zoomTargetWorldY;
                                    game.isEnteringDoor = false;
                                    loadLevel(standingDoor.levelIndex);
                                }
                            });
                        } else {
                            setTimeout(() => {
                                loadLevel(standingDoor.levelIndex);
                            }, 350);
                        }
                    }
                } else {
                    ctx.fillStyle = "rgba(25, 10, 18, 0.94)";
                    ctx.strokeStyle = "#ef4444";
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.roundRect(sdx - 58, floatY - 13, 116, 26, [ 6, 6, 6, 6 ]);
                    ctx.fill();
                    ctx.stroke();
                    ctx.fillStyle = "#fca5a5";
                    ctx.fillText(typeof __ === "function" ? __("ui_locked") : "🔒 BLOQUEADO", sdx, floatY);
                    ctx.fillStyle = "#ef4444";
                    ctx.beginPath();
                    ctx.moveTo(sdx - 4, floatY + 13);
                    ctx.lineTo(sdx + 4, floatY + 13);
                    ctx.lineTo(sdx, floatY + 18);
                    ctx.fill();
                    if (keys["ArrowUp"] || keys["w"] || keys["W"]) {
                        keys["ArrowUp"] = false;
                        keys["w"] = false;
                        keys["W"] = false;
                        try {
                            playSound(120, .15, "sawtooth", .2, 70);
                        } catch (e) {}
                        try {
                            addFloatingText(standingDoor.x + standingDoor.w / 2, standingDoor.y - 10, typeof __ === "function" ? __("flt_superar_nivel_anterior") : "¡SUPERAR NIVEL ANTERIOR!", "#ff3355", 18);
                        } catch (e) {}
                    }
                }
                ctx.restore();
            }
        } else {
            window.canEnterDoor = false;
        }
        if (game.iceWaveActive) {
            game.iceWaveRadius = (game.iceWaveRadius || 10) + 35;
            ctx.save();
            const wx = game.iceWaveX - cameraX;
            const wy = game.iceWaveY;
            ctx.beginPath();
            ctx.arc(wx, wy, game.iceWaveRadius, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(0, 229, 255, 0.85)";
            ctx.lineWidth = 14;
            ctx.shadowColor = "#00ffff";
            ctx.shadowBlur = 15;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(wx, wy, game.iceWaveRadius, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.restore();
            for (let k = 0; k < 6; k++) {
                const angle = Math.random() * Math.PI * 2;
                particles.push({
                    x: game.iceWaveX + Math.cos(angle) * game.iceWaveRadius,
                    y: game.iceWaveY + Math.sin(angle) * game.iceWaveRadius,
                    vx: Math.cos(angle) * 4,
                    vy: Math.sin(angle) * 4,
                    life: 25,
                    color: "#00ffff",
                    size: 6 + Math.random() * 5,
                    type: "spark"
                });
            }
            if (game.iceWaveRadius > VIEW_W * 2.5) {
                game.iceWaveActive = false;
            }
        }
        if (currentLevel === 1 && game.arenaLocked) {
            const muroX1 = game.arenaMinX - cameraX;
            const muroX2 = game.arenaMaxX - cameraX;
            const grad1 = ctx.createLinearGradient(muroX1 - 30, 0, muroX1, 0);
            grad1.addColorStop(0, "rgba(0,255,170,0.9)");
            grad1.addColorStop(.5, "rgba(0,200,255,0.6)");
            grad1.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = grad1;
            ctx.fillRect(muroX1 - 30, 0, 30, VIEW_H);
            const grad2 = ctx.createLinearGradient(muroX2, 0, muroX2 + 30, 0);
            grad2.addColorStop(0, "rgba(0,0,0,0)");
            grad2.addColorStop(.5, "rgba(0,200,255,0.6)");
            grad2.addColorStop(1, "rgba(0,255,170,0.9)");
            ctx.fillStyle = grad2;
            ctx.fillRect(muroX2, 0, 30, VIEW_H);
            ctx.fillStyle = "#00ffaa";
            ctx.font = "11px monospace";
            ctx.textAlign = "center";
            for (let c = 0; c < 16; c++) {
                const cy = (time * 4 + c * 40) % VIEW_H;
                const char1 = String.fromCharCode(12448 + c * 7 % 60);
                const char2 = c % 2 === 0 ? "1" : "0";
                ctx.fillText(char1, muroX1 - 12, cy);
                ctx.fillText(char2, muroX2 + 12, cy);
            }
        }
        if (currentLevel === 2 && game.arenaLocked) {
            const muroX1 = game.arenaMinX - cameraX;
            const muroX2 = game.arenaMaxX - cameraX;
            const gradF1 = ctx.createLinearGradient(muroX1 - 30, 0, muroX1, 0);
            gradF1.addColorStop(0, "rgba(120,20,0,0.95)");
            gradF1.addColorStop(.5, "rgba(255,80,0,0.75)");
            gradF1.addColorStop(1, "rgba(255,120,0,0)");
            ctx.fillStyle = gradF1;
            ctx.fillRect(muroX1 - 30, 0, 30, VIEW_H);
            for (let c = 0; c < 10; c++) {
                const fy = 30 + c * 58 + Math.sin(time * .1 + c) * 10;
                const fh = 14 + Math.sin(time * .15 + c * 2) * 6;
                ctx.fillStyle = c % 2 === 0 ? "#ff6600" : "#ffaa00";
                ctx.shadowColor = "#ff4400";
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.moveTo(muroX1 - 2, fy + fh);
                ctx.quadraticCurveTo(muroX1 - 14 - fh * .5, fy + fh * .4, muroX1 - 2, fy);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            const gradF2 = ctx.createLinearGradient(muroX2, 0, muroX2 + 30, 0);
            gradF2.addColorStop(0, "rgba(255,120,0,0)");
            gradF2.addColorStop(.5, "rgba(255,80,0,0.75)");
            gradF2.addColorStop(1, "rgba(120,20,0,0.95)");
            ctx.fillStyle = gradF2;
            ctx.fillRect(muroX2, 0, 30, VIEW_H);
            for (let c = 0; c < 10; c++) {
                const fy = 50 + c * 58 + Math.sin(time * .1 + c + 4) * 10;
                const fh = 14 + Math.sin(time * .15 + c * 2 + 1) * 6;
                ctx.fillStyle = c % 2 === 0 ? "#ffaa00" : "#ff6600";
                ctx.shadowColor = "#ff4400";
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.moveTo(muroX2 + 2, fy + fh);
                ctx.quadraticCurveTo(muroX2 + 14 + fh * .5, fy + fh * .4, muroX2 + 2, fy);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            const obsGradR = ctx.createLinearGradient(muroX2, 0, muroX2 + 36, 0);
            obsGradR.addColorStop(0, "rgba(40,10,10,0.95)");
            obsGradR.addColorStop(.7, "rgba(20,5,5,0.98)");
            obsGradR.addColorStop(1, "rgba(10,2,2,0.9)");
            ctx.fillStyle = obsGradR;
            ctx.fillRect(muroX2 + 2, 0, 36, VIEW_H);
            ctx.fillStyle = "#ff5500";
            ctx.shadowColor = "#ff2200";
            ctx.shadowBlur = 5;
            for (let v = 0; v < 8; v++) {
                const vy = (time * 2 + v * 70) % VIEW_H;
                ctx.fillRect(muroX2 + 6 + v % 3 * 10, vy, 5, 18 + v % 4 * 5);
            }
            ctx.shadowBlur = 0;
            const obsGradL = ctx.createLinearGradient(muroX1 - 36, 0, muroX1, 0);
            obsGradL.addColorStop(0, "rgba(10,2,2,0.9)");
            obsGradL.addColorStop(.3, "rgba(20,5,5,0.98)");
            obsGradL.addColorStop(1, "rgba(40,10,10,0.95)");
            ctx.fillStyle = obsGradL;
            ctx.fillRect(muroX1 - 36, 0, 36, VIEW_H);
        }
        if (currentLevel === 4 && (game.lvl4State === "walk_right" || game.lvl4State === "blackout" || game.lvl4State === "dread" || game.lvl4State === "final_escape")) {
            const wallGrad = ctx.createLinearGradient(0, 0, 60, 0);
            wallGrad.addColorStop(0, "rgba(20,0,0,0.95)");
            wallGrad.addColorStop(1, "rgba(20,0,0,0)");
            ctx.fillStyle = wallGrad;
            ctx.fillRect(0, 0, 60, VIEW_H);
        }
        if (currentLevel === 4 && !game.happyMode && (game.lvl4State === "stalk_left" || game.lvl4State === "falling")) {
            ctx.fillStyle = "#000";
            ctx.fillRect(860 - cameraX, 500, 260, 80);
            ctx.fillStyle = "#1a0000";
            ctx.fillRect(860 - cameraX, 500, 14, 10);
            ctx.fillRect(1106 - cameraX, 500, 14, 10);
        }
        if (currentLevel === 4 && game.demon) game.demon.draw(ctx, cameraX);
        updateAndDrawSpawnPortal(ctx, cameraX);
        if (currentLevel === 3 && typeof window.updateAndDrawBoat === "function") {
            window.updateAndDrawBoat(ctx, cameraX);
        }
        if (game.player) game.player.draw(ctx, cameraX);
        if (game.kamehameha && game.kamehameha.active) {
            game.kamehameha.draw(ctx, cameraX);
        }
        if (window.SnowballEventSystem) {
            window.SnowballEventSystem.draw(ctx, cameraX);
        }
        if (currentLevel !== 6 && typeof window.drawPlayerParalyzePrism === "function" && game.player && game.player.paralyzed && game.player.paralyzeTimer > 0) {
            window.drawPlayerParalyzePrism(ctx, game.player, cameraX, time, currentLevel === 0 ? "ice" : "diamond");
        }
        if (Array.isArray(game.enemies) && game.enemies.length > 0) {
            game.enemies.forEach(e => e.draw(ctx, cameraX));
        }
        if (window.TurretSystem) {
            try {
                window.TurretSystem.draw(ctx, cameraX);
            } catch (e) {}
        }
        if (currentLevel === 2 && window.ValkyrieBoss) {
            try {
                window.ValkyrieBoss.draw(ctx);
            } catch (e) {}
        }
        updateAndDrawBlueSquare(ctx, cameraX, time);
        updateAndDrawTechBoss(ctx, cameraX, time);
        updateAndDrawYellowSquare(ctx, cameraX, time);
        updateAndDrawPinkSquare(ctx, cameraX, time);
        if (window.updateAndDrawKrakatoa) updateAndDrawKrakatoa(ctx, cameraX, time);
        drawFriendsCage(ctx, cameraX, time);
        if (typeof window.updateAndDrawLithiumCage === "function") {
            window.updateAndDrawLithiumCage(ctx, cameraX, time);
        }
        if (typeof window.updateAndDrawLithiumCompanion === "function") {
            window.updateAndDrawLithiumCompanion(ctx, cameraX, time);
        }
        if (typeof window.updateAndDrawHalloween === "function") {
            window.updateAndDrawHalloween(ctx, cameraX, time);
        }
        if (typeof window.updateAndDrawPumpkinBoss === "function") {
            window.updateAndDrawPumpkinBoss(ctx, cameraX, time);
        }
        if (typeof window.updateAndDrawRestos === "function") {
            window.updateAndDrawRestos(ctx, cameraX);
        } else if (typeof updateAndDrawRestos === "function") {
            updateAndDrawRestos(ctx, cameraX);
        }
        for (let i = projectiles.length - 1; i >= 0; i--) {
            let p = projectiles[i];
            p.x += p.vx;
            p.y += p.vy;
            const maxTrailLen = p.chargeLevel === 4 ? 10 : p.chargeLevel === 3 ? 8 : p.chargeLevel === 2 ? 6 : p.chargeLevel === 1 ? 5 : 4;
            if (!p.trail) p.trail = [];
            if (p.trail.length >= maxTrailLen) {
                let first = p.trail.shift();
                first.x = p.x;
                first.y = p.y;
                p.trail.push(first);
            } else {
                p.trail.push({
                    x: p.x,
                    y: p.y
                });
            }
            const sparkFreq = p.chargeLevel === 4 ? .45 : p.chargeLevel === 3 ? .35 : p.chargeLevel >= 1 ? .25 : .15;
            if (Math.random() < sparkFreq) {
                let sparkCol;
                if (window.postGameHorror) {
                    sparkCol = [ "#ff0033", "#dc2626", "#991b1b", "#1a0205", "#ffffff" ][Math.floor(Math.random() * 5)];
                } else if (p.chargeLevel === 4) sparkCol = [ "#ff0055", "#00ffff", "#ffffff", "#ffd700" ][Math.floor(Math.random() * 4)]; else if (p.chargeLevel === 3) sparkCol = [ "#ff3300", "#ff9900", "#ffd700", "#ffffff" ][Math.floor(Math.random() * 4)]; else if (p.chargeLevel === 2) sparkCol = [ "#00f0ff", "#3b82f6", "#a855f7", "#ffffff" ][Math.floor(Math.random() * 4)]; else if (p.chargeLevel === 1) sparkCol = [ "#00e5ff", "#38bdf8", "#7dd3fc", "#ffffff" ][Math.floor(Math.random() * 4)]; else sparkCol = p.color || "#00ffff";
                particles.push({
                    x: p.x + p.w / 2 + (Math.random() - .5) * p.w * .6,
                    y: p.y + p.h / 2 + (Math.random() - .5) * p.h * .6,
                    vx: -p.vx * .12 + (Math.random() - .5) * 1.5,
                    vy: -p.vy * .12 + (Math.random() - .5) * 1.5,
                    life: 8 + (p.chargeLevel || 0) * 2,
                    color: sparkCol,
                    glow: p.chargeLevel >= 3 || window.postGameHorror ? 1 : 0,
                    size: (p.chargeLevel === 4 ? 3 : 2) + Math.random() * 1.5,
                    type: "spark"
                });
            }
            ctx.save();
            let trailColors;
            if (window.postGameHorror) {
                trailColors = [ "#ff0033", "#991b1b", "#3b0707", "#0a0205" ];
            } else if (p.chargeLevel === 4) trailColors = [ "#ff0055", "#00ffff", "#ffffff", "#ffd700" ]; else if (p.chargeLevel === 3) trailColors = [ "#ff3300", "#ff9900", "#ffd700", "#ffffff" ]; else if (p.chargeLevel === 2) trailColors = [ "#00f0ff", "#3b82f6", "#a855f7", "#ffffff" ]; else if (p.chargeLevel === 1) trailColors = [ "#00e5ff", "#38bdf8", "#7dd3fc", "#ffffff" ]; else trailColors = [ p.color || "#00ffff", "#ffffff" ];
            for (let tIdx = 0; tIdx < p.trail.length; tIdx++) {
                const pt = p.trail[tIdx];
                const alpha = (tIdx + 1) / p.trail.length;
                const col = trailColors[tIdx % trailColors.length];
                const trailX = pt.x - cameraX + p.w / 2;
                if (trailX < -60 || trailX > VIEW_W + 60) continue;
                ctx.fillStyle = col;
                ctx.globalAlpha = alpha * .65;
                const trailSize = p.w / 2 * (.3 + .7 * (tIdx / p.trail.length));
                ctx.beginPath();
                ctx.arc(trailX, pt.y + p.h / 2, Math.max(2, trailSize), 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            const px = p.x - cameraX;
            const pcx = px + p.w / 2;
            const pcy = p.y + p.h / 2;
            const pAngle = Math.atan2(p.vy || 0, p.vx || (p.facing || 1));
            if (window.postGameHorror) {
                if (p.chargeLevel === 4) {
                    ctx.save();
                    ctx.translate(pcx, pcy);
                    ctx.fillStyle = "rgba(220, 20, 60, 0.35)";
                    ctx.beginPath();
                    ctx.arc(0, 0, p.w * 1.3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "rgba(10, 2, 5, 0.75)";
                    ctx.beginPath();
                    ctx.arc(0, 0, p.w * .95, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.save();
                    ctx.rotate(time * .25);
                    ctx.strokeStyle = "#ff0033";
                    ctx.lineWidth = 2.4;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, p.w * .88, p.h * .48, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                    ctx.save();
                    ctx.rotate(-time * .32);
                    ctx.strokeStyle = "#7f1d1d";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, p.w * .78, p.h * .42, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                    ctx.fillStyle = "#ff0033";
                    ctx.beginPath();
                    ctx.arc(0, 0, p.w * .68, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#0a0204";
                    ctx.beginPath();
                    ctx.arc(0, 0, p.w * .42, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = "#ff1744";
                    ctx.lineWidth = 2.2;
                    const flareSize = p.w * .8;
                    ctx.beginPath();
                    ctx.moveTo(-flareSize, 0);
                    ctx.lineTo(flareSize, 0);
                    ctx.moveTo(0, -flareSize * .6);
                    ctx.lineTo(0, flareSize * .6);
                    ctx.stroke();
                    ctx.restore();
                } else if (p.chargeLevel === 3) {
                    ctx.save();
                    ctx.translate(pcx, pcy);
                    ctx.rotate(pAngle);
                    ctx.fillStyle = "rgba(180, 0, 30, 0.35)";
                    ctx.beginPath();
                    ctx.ellipse(0, 0, p.w * .98, p.h * .72, 0, 0, Math.PI * 2);
                    ctx.fill();
                    for (let sw = 1; sw <= 2; sw++) {
                        const ringBack = sw * 12 + time * 20 % 16;
                        const ringH = p.h * .55 + sw * 3;
                        ctx.strokeStyle = sw === 1 ? "#ff0033" : "#3b0707";
                        ctx.lineWidth = 2;
                        ctx.globalAlpha = Math.max(.25, .85 - sw * .35);
                        ctx.beginPath();
                        ctx.ellipse(-ringBack, 0, 4, ringH, 0, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = "#b91c1c";
                    ctx.beginPath();
                    ctx.ellipse(0, 0, p.w * .68, p.h * .5, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#0d0103";
                    ctx.beginPath();
                    ctx.ellipse(p.w * .1, 0, p.w * .46, p.h * .34, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#ff1744";
                    ctx.beginPath();
                    ctx.ellipse(p.w * .15, 0, p.w * .26, p.h * .18, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                } else if (p.chargeLevel === 2) {
                    ctx.save();
                    ctx.translate(pcx, pcy);
                    ctx.rotate(pAngle);
                    const waveLen = p.w * 1.3;
                    for (let strand = 0; strand < 2; strand++) {
                        const phase = strand * Math.PI + time * .35;
                        ctx.strokeStyle = strand === 0 ? "#ff0033" : "#1a0206";
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        for (let wx = -waveLen / 2; wx <= waveLen / 2; wx += 5) {
                            const wy = Math.sin(wx / waveLen * Math.PI * 2 + phase) * (p.h * .45);
                            if (wx === -waveLen / 2) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
                        }
                        ctx.stroke();
                    }
                    ctx.fillStyle = "rgba(180, 0, 30, 0.3)";
                    ctx.beginPath();
                    ctx.arc(0, 0, p.w * .65, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#dc2626";
                    ctx.beginPath();
                    ctx.arc(0, 0, p.w * .44, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#0d0103";
                    ctx.beginPath();
                    ctx.arc(0, 0, p.w * .24, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                } else if (p.chargeLevel === 1) {
                    ctx.save();
                    ctx.translate(pcx, pcy);
                    ctx.rotate(pAngle);
                    ctx.fillStyle = "rgba(180, 0, 30, 0.3)";
                    ctx.beginPath();
                    ctx.moveTo(p.w * .72, 0);
                    ctx.lineTo(-p.w * .52, -p.h * .5);
                    ctx.lineTo(-p.w * .25, 0);
                    ctx.lineTo(-p.w * .52, p.h * .5);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = "#dc2626";
                    ctx.beginPath();
                    ctx.moveTo(p.w * .62, 0);
                    ctx.lineTo(-p.w * .42, -p.h * .38);
                    ctx.lineTo(-p.w * .18, 0);
                    ctx.lineTo(-p.w * .42, p.h * .38);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = "#0d0103";
                    ctx.beginPath();
                    ctx.moveTo(p.w * .42, 0);
                    ctx.lineTo(-p.w * .12, -p.h * .18);
                    ctx.lineTo(-p.w * .04, 0);
                    ctx.lineTo(-p.w * .12, p.h * .18);
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                } else {
                    ctx.save();
                    ctx.translate(pcx, pcy);
                    ctx.rotate(pAngle);
                    ctx.fillStyle = "rgba(220, 20, 60, 0.28)";
                    ctx.beginPath();
                    ctx.ellipse(0, 0, p.w / 2 + 3, p.h / 2 + 2, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#dc2626";
                    ctx.beginPath();
                    ctx.ellipse(0, 0, p.w / 2 + 1, p.h / 2, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#0d0103";
                    ctx.beginPath();
                    ctx.ellipse(p.w * .08, 0, p.w / 3.5, p.h / 3.5, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            } else if (p.chargeLevel === 4) {
                ctx.save();
                ctx.translate(pcx, pcy);
                ctx.fillStyle = "rgba(255, 0, 85, 0.25)";
                ctx.beginPath();
                ctx.arc(0, 0, p.w * 1.25, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "rgba(0, 255, 255, 0.35)";
                ctx.beginPath();
                ctx.arc(0, 0, p.w * .9, 0, Math.PI * 2);
                ctx.fill();
                ctx.save();
                ctx.rotate(time * .22);
                ctx.strokeStyle = "#00ffff";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(0, 0, p.w * .85, p.h * .45, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
                ctx.save();
                ctx.rotate(-time * .28);
                ctx.strokeStyle = "#ffd700";
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.ellipse(0, 0, p.w * .75, p.h * .4, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
                ctx.fillStyle = "#ff0055";
                ctx.beginPath();
                ctx.arc(0, 0, p.w * .65, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(0, 0, p.w * .4, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                const flareSize = p.w * .75;
                ctx.beginPath();
                ctx.moveTo(-flareSize, 0);
                ctx.lineTo(flareSize, 0);
                ctx.moveTo(0, -flareSize * .55);
                ctx.lineTo(0, flareSize * .55);
                ctx.stroke();
                ctx.restore();
            } else if (p.chargeLevel === 3) {
                ctx.save();
                ctx.translate(pcx, pcy);
                ctx.rotate(pAngle);
                ctx.fillStyle = "rgba(255, 102, 0, 0.25)";
                ctx.beginPath();
                ctx.ellipse(0, 0, p.w * .95, p.h * .7, 0, 0, Math.PI * 2);
                ctx.fill();
                for (let sw = 1; sw <= 2; sw++) {
                    const ringBack = sw * 12 + time * 20 % 16;
                    const ringH = p.h * .55 + sw * 3;
                    ctx.strokeStyle = sw === 1 ? "#ffffff" : "#ffd700";
                    ctx.lineWidth = 1.8;
                    ctx.globalAlpha = Math.max(.2, .85 - sw * .35);
                    ctx.beginPath();
                    ctx.ellipse(-ringBack, 0, 4, ringH, 0, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.globalAlpha = 1;
                ctx.fillStyle = "#ff6600";
                ctx.beginPath();
                ctx.ellipse(0, 0, p.w * .65, p.h * .48, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffe600";
                ctx.beginPath();
                ctx.ellipse(p.w * .1, 0, p.w * .45, p.h * .32, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.ellipse(p.w * .15, 0, p.w * .25, p.h * .18, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else if (p.chargeLevel === 2) {
                ctx.save();
                ctx.translate(pcx, pcy);
                ctx.rotate(pAngle);
                const waveLen = p.w * 1.3;
                for (let strand = 0; strand < 2; strand++) {
                    const phase = strand * Math.PI + time * .35;
                    ctx.strokeStyle = strand === 0 ? "#00ffff" : "#c084fc";
                    ctx.lineWidth = 1.8;
                    ctx.beginPath();
                    for (let wx = -waveLen / 2; wx <= waveLen / 2; wx += 5) {
                        const wy = Math.sin(wx / waveLen * Math.PI * 2 + phase) * (p.h * .45);
                        if (wx === -waveLen / 2) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
                    }
                    ctx.stroke();
                }
                ctx.fillStyle = "rgba(0, 240, 255, 0.25)";
                ctx.beginPath();
                ctx.arc(0, 0, p.w * .65, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#00f0ff";
                ctx.beginPath();
                ctx.arc(0, 0, p.w * .42, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(0, 0, p.w * .22, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else if (p.chargeLevel === 1) {
                ctx.save();
                ctx.translate(pcx, pcy);
                ctx.rotate(pAngle);
                ctx.fillStyle = "rgba(0, 229, 255, 0.25)";
                ctx.beginPath();
                ctx.moveTo(p.w * .72, 0);
                ctx.lineTo(-p.w * .52, -p.h * .5);
                ctx.lineTo(-p.w * .25, 0);
                ctx.lineTo(-p.w * .52, p.h * .5);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = "#00e5ff";
                ctx.beginPath();
                ctx.moveTo(p.w * .62, 0);
                ctx.lineTo(-p.w * .42, -p.h * .38);
                ctx.lineTo(-p.w * .18, 0);
                ctx.lineTo(-p.w * .42, p.h * .38);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.moveTo(p.w * .42, 0);
                ctx.lineTo(-p.w * .12, -p.h * .18);
                ctx.lineTo(-p.w * .04, 0);
                ctx.lineTo(-p.w * .12, p.h * .18);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            } else {
                ctx.save();
                ctx.translate(pcx, pcy);
                ctx.rotate(pAngle);
                ctx.fillStyle = "rgba(0, 255, 255, 0.22)";
                ctx.beginPath();
                ctx.ellipse(0, 0, p.w / 2 + 3, p.h / 2 + 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = p.color || "#00ffff";
                ctx.beginPath();
                ctx.ellipse(0, 0, p.w / 2 + 1, p.h / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.ellipse(p.w * .08, 0, p.w / 3.5, p.h / 3.5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            ctx.restore();
            let hit = false;
            for (let e of game.enemies) {
                if (e.active && (!e.summoningTimer || e.summoningTimer <= 0) && p.x < e.x + e.w && p.x + p.w > e.x && p.y < e.y + e.h && p.y + p.h > e.y) {
                    e.takeDamage(p.damage);
                    hit = true;
                    if (p.chargeLevel === 4) {
                        try {
                            createExplosion(p.x + p.w / 2, p.y + p.h / 2, "#ff0055", 40, 25, [ "#ff0055", "#00ffff", "#ffffff", "#ffd700" ]);
                            applyShake(9);
                        } catch (err) {}
                    }
                    break;
                }
            }
            if (!hit && window.TurretSystem && Array.isArray(window.TurretSystem.turrets)) {
                for (let turret of window.TurretSystem.turrets) {
                    if (!turret || turret._level !== currentLevel || !turret._alive || turret._buried) continue;
                    const trad = (turret.baseRadius || 36) * (turret.scale || 1);
                    const tx1 = turret.x - trad, tx2 = turret.x + trad;
                    const ty1 = turret.y - trad, ty2 = turret.y + trad;
                    if (p.x + p.w > tx1 && p.x < tx2 && p.y + p.h > ty1 && p.y < ty2) {
                        hit = true;
                        const dmg = typeof __godDmg === "function" ? __godDmg(p.damage || 10) : (p.damage || 10);
                        if (typeof turret.takeDamage === "function") {
                            turret.takeDamage(dmg, "normal");
                        }
                        if (p.chargeLevel === 4) {
                            try {
                                createExplosion(p.x + p.w / 2, p.y + p.h / 2, "#ff0055", 40, 25, [ "#ff0055", "#00ffff", "#ffffff", "#ffd700" ]);
                                applyShake(9);
                            } catch (err) {}
                        } else {
                            try {
                                createExplosion(p.x + p.w / 2, p.y + p.h / 2, "#00ffff", 14, 8);
                            } catch (_) {}
                        }
                        break;
                    }
                }
            }
            if (!hit && window.HalloweenSystem && typeof window.HalloweenSystem.getRebornGhosts === "function") {
                const rGhosts = window.HalloweenSystem.getRebornGhosts();
                if (Array.isArray(rGhosts)) {
                    for (let g of rGhosts) {
                        if (!g || !g.active) continue;
                        if (p.x + p.w > g.x && p.x < g.x + g.w && p.y + p.h > g.y && p.y < g.y + g.h) {
                            hit = true;
                            if (typeof window.HalloweenSystem.takeGhostDamage === "function") {
                                window.HalloweenSystem.takeGhostDamage(g, p.damage || 10);
                            } else {
                                g.health = 0;
                                g.active = false;
                            }
                            if (p.chargeLevel === 4) {
                                try {
                                    createExplosion(p.x + p.w / 2, p.y + p.h / 2, "#ff0055", 40, 25, [ "#ff0055", "#00ffff", "#ffffff", "#ffd700" ]);
                                    applyShake(9);
                                } catch (err) {}
                            }
                            break;
                        }
                    }
                }
            }
            if (!hit && game.platforms) {
                for (let plat of game.platforms) {
                    if (!plat.dashBlock || plat.broken) continue;
                    if (p.x + p.w > plat.x && p.x < plat.x + plat.w && p.y + p.h > plat.y && p.y < plat.y + plat.h) {
                        hit = true;
                        playSound(520, .1, "sawtooth", .15, 250);
                        if ((plat._projCooldown || 0) <= 0) {
                            plat._projCooldown = 30;
                            addFloatingText(plat.x + plat.w / 2, plat.y - 14, typeof __ === "function" ? __("flt_inmune_edash") : "¡INMUNE! ¡USA ENERGY DASH!", "#ff00a0", 14);
                        }
                        for (let k = 0; k < 6; k++) {
                            particles.push({
                                x: p.x,
                                y: p.y,
                                vx: (Math.random() - .5) * 5,
                                vy: (Math.random() - .5) * 5,
                                life: 12,
                                color: "#ff007f",
                                size: 3,
                                type: "spark"
                            });
                        }
                        break;
                    }
                }
            }
            if (!hit && game.yellowSquare && game.yellowSquare.state === "boss_fight" && !p.isCompanion) {
                const ys = game.yellowSquare;
                if (p.x < ys.x + ys.w && p.x + p.w > ys.x && p.y < ys.y + ys.h && p.y + p.h > ys.y) {
                    const bossDmg = [ 1, 2, 3, 4, 5.5 ][p.chargeLevel || 0];
                    ys.health -= __godDmg(bossDmg);
                    ys.hitFlash = 6;
                    hit = true;
                    applyShake(6);
                    playSound(450, .15, "square", .2, 200);
                    const tag = "";
                    addFloatingText(ys.x + ys.w / 2, ys.y - 10, `${tag}${Math.max(0, Math.ceil(ys.health))} / ${ys.maxHealth}`, "#ffea00", 20);
                    for (let k = 0; k < 10; k++) {
                        particles.push({
                            x: p.x,
                            y: p.y,
                            vx: (Math.random() - .5) * 8,
                            vy: (Math.random() - .5) * 8,
                            life: 18,
                            color: "#ffff00",
                            size: 4,
                            type: "spark"
                        });
                    }
                    if (ys.health <= 0) {
                        ys.state = "defeated";
                        ys._defeatTimer = 60;
                        game.arenaLocked = false;
                        stopAllSFX();
                        playBGM("bgm_world3_volcano");
                    }
                }
            }
            if (!hit && game.techBoss && game.techBoss.state === "fighting" && game.techBoss.vulnerable && game.techBoss.turnPhase === "player_turn" && !p.isCompanion) {
                const tb = game.techBoss;
                if (p.x < tb.x + tb.w && p.x + p.w > tb.x && p.y < tb.y + tb.h && p.y + p.h > tb.y) {
                    hit = true;
                    if (tb.dodgeMode) {
                        if (!tb.hasTakenDodgeDmg) {
                            const actualDmg = typeof window.applyMawlerknightDamage === "function"
                                ? window.applyMawlerknightDamage(tb, 5)
                                : Math.min(__godDmg(5), tb.health);
                            if (actualDmg > 0) {
                                tb.hasTakenDodgeDmg = true;
                                tb.hitFlash = 8;
                                addFloatingText(tb.x + tb.w / 2, tb.y - 10, actualDmg + " " + __("ui_dmg"), "#00ff00", 18);
                                playSound(500, .1, "sawtooth", .2, 100);
                            }
                        } else {
                            addFloatingText(tb.x + tb.w / 2 + (Math.random() - .5) * 30, tb.y - 20, __("flt_miss"), "#ff0055", 22);
                            playSound(200, .08, "sine", .1, 50);
                            tb.missCount = (tb.missCount || 0) + 1;
                            if (tb.missCount >= 15) {
                                tb.missCount = 0;
                                tb.dodgeMode = false;
                                tb.hasTakenDodgeDmg = false;
                                tb.vulnerable = false;
                                game.player.frozen = true;
                                showAnimatedDialogue(__("ui_speaker_system"), "💻", __("dlg_se_paso_mano"), () => {
                                    showAnimatedDialogue(__("ui_speaker_system"), "💻", __("dlg_así_imposible"), () => {
                                        tb.vibeTerminal = true;
                                        tb.vibeStep = 4;
                                        tb.vibeTimer = 0;
                                        playSound(800, .2, "sine", .25);
                                        setTimeout(() => {
                                            tb.vibeTerminal = false;
                                            tb.vulnerable = true;
                                            tb.hasTakenDodgeDmg = true;
                                            game.player.frozen = false;
                                            playSound(400, .4, "sawtooth", .3, 100);
                                            applyShake(10);
                                            addFloatingText(tb.x + tb.w / 2, tb.y - 30, __("flt_rematalo"), "#ffff00", 26);
                                        }, 2500);
                                    }, 3e3);
                                }, 3e3);
                            }
                        }
                    } else {
                        const bossDmg = [ 1, 2, 3, 5, 7.5 ][p.chargeLevel || 0];
                        const actualDmg = typeof window.applyMawlerknightDamage === "function"
                            ? window.applyMawlerknightDamage(tb, bossDmg)
                            : Math.min(__godDmg(bossDmg), tb.health);
                        if (actualDmg > 0) {
                            tb.hitFlash = 8;
                            const tag = "";
                            addFloatingText(tb.x + tb.w / 2, tb.y - 10, tag + actualDmg + " " + __("ui_dmg"), "#00ff00", 18);
                            playSound(500, .1, "sawtooth", .2, 100);
                        }
                    }
                    applyShake(5);
                    for (let k = 0; k < 10; k++) {
                        particles.push({
                            x: p.x,
                            y: p.y,
                            vx: (Math.random() - .5) * 10,
                            vy: (Math.random() - .5) * 10,
                            life: 20,
                            color: tb.dodgeMode ? "#ff0055" : "#00ffaa",
                            size: 5,
                            type: "spark"
                        });
                    }
                }
            }
            if (!hit && game.blueSquare && game.blueSquare.state === "boss_fight" && !p.isCompanion) {
                const bs = game.blueSquare;
                if (p.x < bs.x + bs.w && p.x + p.w > bs.x && p.y < bs.y + bs.h && p.y + p.h > bs.y) {
                    const bossDmg2 = [ 1, 2, 2.5, 3.5, 5.0 ][p.chargeLevel || 0];
                    bs.health -= __godDmg(bossDmg2);
                    bs.hitFlash = 6;
                    hit = true;
                    applyShake(5);
                    playSound(500, .15, "square", .2, 300);
                    const tag = "";
                    addFloatingText(bs.x + bs.w / 2, bs.y - 10, `${tag}${Math.max(0, Math.ceil(bs.health))} / ${bs.maxHealth}`, "#00aaff", 20);
                    for (let k = 0; k < 10; k++) {
                        particles.push({
                            x: p.x,
                            y: p.y,
                            vx: (Math.random() - .5) * 8,
                            vy: (Math.random() - .5) * 8,
                            life: 18,
                            color: "#00aaff",
                            size: 4,
                            type: "spark"
                        });
                    }
                    if (bs.health <= 0) {
                        bs.state = "defeated";
                    }
                }
            }
            if (!hit && !p.isCompanion) {
                const activeTanks = (game.techTanks && game.techTanks.length > 0) ? game.techTanks : (game.pinkSquare ? [game.pinkSquare] : []);
                for (let psE of activeTanks) {
                    if (psE && psE.state === "hostile") {
                        if (p.x < psE.x + psE.w && p.x + p.w > psE.x && p.y < psE.y + psE.h && p.y + p.h > psE.y) {
                            const pinkDmg = p.damage || 10;
                            psE.health -= __godDmg(pinkDmg);
                            hit = true;
                            applyShake(4);
                            playSound(600, .12, "square", .2, 250);
                            addFloatingText(psE.x + psE.w / 2, psE.y - 12, `${Math.max(0, Math.ceil(psE.health))} / ${psE.maxHealth}`, "#ff69b4", 18);
                            for (let k = 0; k < 8; k++) {
                                particles.push({
                                    x: p.x,
                                    y: p.y,
                                    vx: (Math.random() - .5) * 8,
                                    vy: (Math.random() - .5) * 8,
                                    life: 18,
                                    color: "#ff69b4",
                                    size: 4,
                                    type: "spark"
                                });
                            }
                            if (psE.health <= 0) {
                                psE.state = "destroying";
                                psE.destroyTimer = 110;
                                applyShake(8);
                                game.flash = 6;
                                playSound(120, .4, "sawtooth", .4, 40);
                            }
                            break;
                        }
                    }
                }
            }
            if (!hit && game.krakatoa && game.krakatoa.isHittable(p)) {
                hit = true;
                const bossDmg = [ 4, 8, 14, 20, 28 ][p.chargeLevel || 0];
                game.krakatoa.takeDamage(bossDmg, p.chargeLevel || 0);
            }
            if (!hit && game.pumpkinBoss && game.pumpkinBoss.isHittable(p)) {
                hit = true;
                if (game.pumpkinBoss.isVulnerable) {
                    const bossDmg = [ 6, 12, 20, 28, 38 ][p.chargeLevel || 0];
                    game.pumpkinBoss.takeDamage(bossDmg, p.chargeLevel || 0);
                } else {
                    game.pumpkinBoss.onImmuneHit(p);
                }
            }
            if (hit || p.x < cameraX || p.x > cameraX + VIEW_W) projectiles.splice(i, 1);
        }
        for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
            let p = enemyProjectiles[i];
            const camNear = p.x > cameraX - 200 && p.x < cameraX + VIEW_W + 200 && p.y > -200 && p.y < VIEW_H + 200;
            if (p.isArc || p.gravity) {
                p.vy = (p.vy || 0) + (p.gravity || .28);
            }
            if (p.life !== undefined) {
                p.life--;
                if (p.life <= 0) {
                    enemyProjectiles.splice(i, 1);
                    continue;
                }
            }
            if (p.isHorrorBall && camNear) {
                if (Math.random() < 0.38) {
                    particles.push({
                        x: p.x + 8 + (Math.random() - .5) * 6,
                        y: p.y + 8 + (Math.random() - .5) * 6,
                        vx: -p.vx * 0.18 + (Math.random() - .5) * 1.4,
                        vy: -p.vy * 0.18 + (Math.random() - .5) * 1.4,
                        life: 14,
                        maxLife: 14,
                        color: Math.random() < 0.65 ? "#ff0033" : "#0d0103",
                        size: 2.8,
                        type: "spark"
                    });
                }
            }
            if (p.isElectric) {
                if (p.homing && p.homingTimer > 0 && game.player && !game.player.frozen) {
                    p.homingTimer--;
                    const targetX = game.player.x + game.player.w / 2;
                    const targetY = game.player.y + game.player.h / 2;
                    const curX = p.x + (p.w ? p.w / 2 : 8);
                    const curY = p.y + (p.h ? p.h / 2 : 8);
                    const targetAngle = Math.atan2(targetY - curY, targetX - curX);
                    const currentAngle = Math.atan2(p.vy, p.vx);
                    let diff = targetAngle - currentAngle;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    const turn = Math.sign(diff) * Math.min(Math.abs(diff), p.turnSpeed || .048);
                    const newAngle = currentAngle + turn;
                    const spd = p.speed || Math.hypot(p.vx, p.vy) || 4.6;
                    p.vx = Math.cos(newAngle) * spd;
                    p.vy = Math.sin(newAngle) * spd;
                    if (p.homingTimer <= 0) {
                        p.homing = false;
                        for (let k = 0; k < 6; k++) {
                            particles.push({
                                x: curX,
                                y: curY,
                                vx: (Math.random() - .5) * 5,
                                vy: (Math.random() - .5) * 5,
                                life: 12,
                                color: "#00ffff",
                                size: 3,
                                type: "spark"
                            });
                        }
                    }
                }
            }
            if (!p.isRollingSnowball) {
                p.x += p.vx;
                p.y += p.vy;
            } else {
                p.vy = (p.vy || 0) + .55;
                p.y += p.vy;
                p.x += p.vx;
                const pr = p.radius || 28;
                p.rot = (p.rot || 0) + p.vx / pr;
                if (game.platforms) {
                    for (let plat of game.platforms) {
                        if (plat.broken) continue;
                        if (p.x + pr * 2 > plat.x && p.x < plat.x + plat.w && p.y + pr * 2 >= plat.y && p.y + pr * 2 <= plat.y + plat.h + Math.abs(p.vy) + 6) {
                            p.y = plat.y - pr * 2;
                            p.vy = 0;
                            break;
                        }
                    }
                }
                if (camNear && Math.random() < .45) {
                    particles.push({
                        x: p.x + pr + (Math.random() - .5) * 12,
                        y: p.y + pr * 2,
                        vx: -p.vx * .15 + (Math.random() - .5) * 2,
                        vy: -Math.random() * 2.5 - .5,
                        life: 12,
                        color: Math.random() < .5 ? "#ffffff" : "#bae6fd",
                        size: 3 + Math.random() * 3,
                        type: "spark"
                    });
                }
            }
            if (p.isCluster) {
                p.splitTimer = (p.splitTimer || 38) - 1;
                if (p.splitTimer <= 0 && !p.hasSplit) {
                    p.hasSplit = true;
                    const baseAngle = Math.atan2(p.vy, p.vx);
                    const spreadAngles = [ -.32, 0, .32 ];
                    const childSpeed = 4.5;
                    spreadAngles.forEach(off => {
                        const ang = baseAngle + off;
                        enemyProjectiles.push({
                            x: p.x,
                            y: p.y,
                            w: 12,
                            h: 12,
                            vx: Math.cos(ang) * childSpeed,
                            vy: Math.sin(ang) * childSpeed,
                            color: "#ff5500",
                            damage: 10,
                            isFireball: true,
                            isClusterChild: true,
                            trail: []
                        });
                    });
                    if (camNear) playSound(300, .16, "sawtooth", .18, 140);
                    for (let k = 0; k < 12; k++) {
                        particles.push({
                            x: p.x + 9,
                            y: p.y + 9,
                            vx: (Math.random() - .5) * 6,
                            vy: (Math.random() - .5) * 6,
                            life: 18,
                            color: Math.random() < .5 ? "#ff9900" : "#ff3300",
                            size: 4,
                            type: "spark"
                        });
                    }
                    enemyProjectiles.splice(i, 1);
                    continue;
                }
            }
            if (p.isExplosiveFireball) {
                p.life = (p.life || 140) - 1;
                let detonated = false;
                const pr = p.radius || 18;
                if (game.platforms) {
                    for (let plat of game.platforms) {
                        if (plat.broken) continue;
                        if (p.x + (p.w || 36) > plat.x && p.x < plat.x + plat.w && p.y + (p.h || 36) > plat.y && p.y < plat.y + plat.h) {
                            detonated = true;
                            break;
                        }
                    }
                }
                const pDist = Math.hypot(game.player.x + game.player.w / 2 - (p.x + pr), game.player.y + game.player.h / 2 - (p.y + pr));
                if (pDist < pr + game.player.w / 2) detonated = true;
                if (p.life <= 0) detonated = true;
                if (detonated) {
                    if (camNear) {
                        createExplosion(p.x + pr, p.y + pr, "#ff4400", 50, 26, [ "#ffffff", "#ffff00", "#ff5500", "#660000" ]);
                        applyShake(8);
                        playSound(110, .35, "sawtooth", .28, 40);
                    }
                    if (gameState === "playing" && !game.player.frozen && pDist < 75) {
                        const energyDash = game.player.dashMax && game.player.dashTimer > 0;
                        if (!energyDash) {
                            game.player.takeDamage(p.damage || 28);
                        }
                    }
                    enemyProjectiles.splice(i, 1);
                    continue;
                }
            }
            if (p.isSpike) {
                p.spikeTimer = (p.spikeTimer || 120) - 1;
                const maxT = p.maxSpikeTimer || 120;
                const elapsed = maxT - p.spikeTimer;
                const delay = p.emergeDelay || 0;
                const sx = p.x - cameraX;
                const bottomY = 500;
                const isEnraged = p.isEnraged || p.color === "#ff0055";

                if (elapsed < delay) {
                    ctx.save();
                    const crackProgress = elapsed / Math.max(1, delay);
                    const crackW = p.w * crackProgress;
                    ctx.strokeStyle = isEnraged ? "#f43f5e" : "#38bdf8";
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(sx - crackW / 2, bottomY);
                    ctx.lineTo(sx + crackW / 2, bottomY);
                    ctx.stroke();
                    if (Math.random() < 0.4) {
                        ctx.fillStyle = "#ffffff";
                        ctx.beginPath();
                        ctx.arc(sx + (Math.random() - 0.5) * crackW, bottomY - 2, 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.restore();
                    continue;
                }

                const activeT = elapsed - delay;
                const emergeRatio = Math.min(1, activeT / 12);
                const easeEmerge = Math.sin(emergeRatio * Math.PI * 0.5);
                const targetH = p.maxH || p.h || 180;
                const currentH = targetH * easeEmerge;
                const topY = bottomY - currentH;
                const currentW = p.w * (0.8 + easeEmerge * 0.2);
                const halfW = currentW / 2;

                p.y = topY;
                p.h = currentH;

                if (activeT === 1) {
                    try { playSound(650 + Math.random() * 200, 0.16, "triangle", 0.22, 120); } catch(e){}
                    for (let k = 0; k < 6; k++) {
                        particles.push({
                            x: p.x + (Math.random() - 0.5) * p.w,
                            y: bottomY,
                            vx: (Math.random() - 0.5) * 4,
                            vy: -Math.random() * 5 - 2,
                            life: 16,
                            color: isEnraged ? "#fecdd3" : "#bae6fd",
                            size: 3,
                            type: "spark"
                        });
                    }
                }

                ctx.save();

                ctx.strokeStyle = isEnraged ? "#450a0a" : "#082f49";
                ctx.lineWidth = 4;
                ctx.lineJoin = "miter";
                ctx.beginPath();
                ctx.moveTo(sx - halfW, bottomY);
                ctx.lineTo(sx, topY);
                ctx.lineTo(sx + halfW, bottomY);
                ctx.closePath();
                ctx.stroke();

                const gSpike = ctx.createLinearGradient(0, bottomY, 0, topY);
                if (isEnraged) {
                    gSpike.addColorStop(0, "#881337");
                    gSpike.addColorStop(0.35, "#be123c");
                    gSpike.addColorStop(0.7, "#f43f5e");
                    gSpike.addColorStop(0.92, "#fecdd3");
                    gSpike.addColorStop(1, "#ffffff");
                } else {
                    gSpike.addColorStop(0, "#0c4a6e");
                    gSpike.addColorStop(0.35, "#0284c7");
                    gSpike.addColorStop(0.7, "#38bdf8");
                    gSpike.addColorStop(0.92, "#bae6fd");
                    gSpike.addColorStop(1, "#ffffff");
                }
                ctx.fillStyle = gSpike;
                ctx.beginPath();
                ctx.moveTo(sx - halfW, bottomY);
                ctx.lineTo(sx, topY);
                ctx.lineTo(sx + halfW, bottomY);
                ctx.closePath();
                ctx.fill();

                const gLeft = ctx.createLinearGradient(sx - halfW, bottomY, sx, topY);
                gLeft.addColorStop(0, isEnraged ? "rgba(76, 5, 25, 0.5)" : "rgba(8, 47, 73, 0.45)");
                gLeft.addColorStop(1, isEnraged ? "rgba(190, 18, 60, 0.25)" : "rgba(2, 132, 199, 0.2)");
                ctx.fillStyle = gLeft;
                ctx.beginPath();
                ctx.moveTo(sx - halfW, bottomY);
                ctx.lineTo(sx, topY);
                ctx.lineTo(sx, bottomY);
                ctx.closePath();
                ctx.fill();

                const gRight = ctx.createLinearGradient(sx, topY, sx + halfW, bottomY);
                gRight.addColorStop(0, "rgba(255, 255, 255, 0.8)");
                gRight.addColorStop(0.5, isEnraged ? "rgba(254, 205, 211, 0.4)" : "rgba(186, 230, 253, 0.35)");
                gRight.addColorStop(1, isEnraged ? "rgba(244, 63, 94, 0.15)" : "rgba(56, 189, 248, 0.1)");
                ctx.fillStyle = gRight;
                ctx.beginPath();
                ctx.moveTo(sx, topY);
                ctx.lineTo(sx + halfW, bottomY);
                ctx.lineTo(sx, bottomY);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(sx, topY);
                ctx.lineTo(sx, bottomY);
                ctx.stroke();

                ctx.fillStyle = isEnraged ? "#ffe4e6" : "#ffffff";
                ctx.beginPath();
                ctx.moveTo(sx - halfW - 6, bottomY);
                ctx.lineTo(sx - halfW + 10, bottomY - 14 * emergeRatio);
                ctx.lineTo(sx - halfW + 20, bottomY);
                ctx.lineTo(sx + halfW - 20, bottomY);
                ctx.lineTo(sx + halfW - 10, bottomY - 18 * emergeRatio);
                ctx.lineTo(sx + halfW + 6, bottomY);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = isEnraged ? "#881337" : "#0c4a6e";
                ctx.lineWidth = 2;
                ctx.stroke();

                if (emergeRatio >= 0.8) {
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(sx, topY + 4, 3.5, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();

                if (gameState === "playing" && !game.player.frozen && currentH > 25) {
                    const spx = sx - halfW + cameraX;
                    if (spx < game.player.x + game.player.w && spx + currentW > game.player.x && topY < game.player.y + game.player.h && bottomY > game.player.y) {
                        const energyDash = game.player.dashMax && game.player.dashTimer > 0;
                        if (energyDash) {
                            try {
                                createExplosion(p.x, topY + currentH / 2, "#ff00e0", 16, 10, [ "#ff00e0", "#00ffff", "#ffffff" ]);
                                playSound(400, .1, "square", .15, 800);
                            } catch (e) {}
                            enemyProjectiles.splice(i, 1);
                            continue;
                        }
                        game.player.takeDamage(p.damage || 32);
                    }
                }
                if (p.spikeTimer <= 0) {
                    for (let k = 0; k < 12; k++) particles.push({
                        x: p.x + (Math.random() - .5) * p.w,
                        y: p.y + p.h / 2,
                        vx: (Math.random() - .5) * 4,
                        vy: -Math.random() * 4,
                        life: 25,
                        color: "#00ccff",
                        size: 5 + Math.random() * 4,
                        type: "spark"
                    });
                    enemyProjectiles.splice(i, 1);
                }
                if (p.x < cameraX - 200 || p.x > cameraX + VIEW_W + 200) enemyProjectiles.splice(i, 1);
                continue;
            }
            if (p.isSnowball) {
                p.rot = (p.rot || 0) + (p.rotSpeed || .1);
                if (game.platforms) {
                    let hitPlat = false;
                    const pr = p.radius || (p.w ? p.w / 2 : 11);
                    for (let plat of game.platforms) {
                        if (plat.broken) continue;
                        if (plat.y + plat.h < 480) continue;
                        if (p.x + pr > plat.x && p.x - pr < plat.x + plat.w && p.y + pr > plat.y && p.y - pr < plat.y + plat.h) {
                            hitPlat = true;
                            break;
                        }
                    }
                    if (hitPlat) {
                        if (camNear) {
                            createExplosion(p.x + pr, p.y + pr, "#ffffff", p.isGiantSnowball ? 28 : 16, 12, [ "#ffffff", "#e0f7ff", "#80d8ff" ]);
                            playSound(210, .14, "triangle", .16, 85);
                        }
                        enemyProjectiles.splice(i, 1);
                        continue;
                    }
                }
            }
            if (p.isAppleArc) {
                p.rot = (p.rot || 0) + (p.rotSpeed || .15);
                if (game.platforms) {
                    let hitPlat = false;
                    const pr = p.radius || 10;
                    for (let plat of game.platforms) {
                        if (plat.broken) continue;
                        if (p.x + pr > plat.x && p.x - pr < plat.x + plat.w && p.y + pr > plat.y && p.y - pr < plat.y + plat.h) {
                            hitPlat = true;
                            break;
                        }
                    }
                    if (hitPlat) {
                        if (camNear) {
                            createExplosion(p.x + pr, p.y + pr, "#ef4444", 16, 12, [ "#ef4444", "#f87171", "#fbbf24", "#22c55e" ]);
                            playSound(380, .12, "triangle", .15, 200);
                        }
                        enemyProjectiles.splice(i, 1);
                        continue;
                    }
                }
            }
            ctx.save();
            const sx = p.x - cameraX;
            if (camNear && Math.random() < .25) {
                if (p.isSnowball) {
                    particles.push({
                        x: p.x + (p.radius || 10) + (Math.random() - .5) * 6,
                        y: p.y + (p.radius || 10) + (Math.random() - .5) * 6,
                        vx: -p.vx * .15 + (Math.random() - .5) * 1.5,
                        vy: -p.vy * .15 + (Math.random() - .5) * 1.5,
                        life: 14,
                        color: Math.random() < .6 ? "#ffffff" : "#b8e8ff",
                        size: p.isGiantSnowball ? 3 + Math.random() * 3 : 2 + Math.random() * 2,
                        type: "spark"
                    });
                } else if (p.isSlowBubble || p.isBubbleSpray) {
                    particles.push({
                        x: p.x + (p.radius || 9) + (Math.random() - .5) * 4,
                        y: p.y + (p.radius || 9) + (Math.random() - .5) * 4,
                        vx: (Math.random() - .5) * .8,
                        vy: -Math.random() * .8,
                        life: 10,
                        color: "#38bdf8",
                        size: 2,
                        type: "spark"
                    });
                } else if (p.isFrostBreath) {
                    particles.push({
                        x: p.x + 10 + (Math.random() - .5) * 8,
                        y: p.y + 10 + (Math.random() - .5) * 8,
                        vx: -p.vx * .1 + (Math.random() - .5) * 1.2,
                        vy: (Math.random() - .5) * 1.2,
                        life: 12,
                        color: "#a5f3fc",
                        size: 2.5,
                        type: "spark"
                    });
                } else if (p.isTankShell) {
                    particles.push({
                        x: p.x + (Math.random() - .5) * 8,
                        y: p.y + (Math.random() - .5) * 8,
                        vx: -p.vx * .2 + (Math.random() - .5) * 2,
                        vy: -p.vy * .2 + (Math.random() - .5) * 2,
                        life: 14,
                        color: Math.random() < .5 ? "#ff007f" : "#00ffff",
                        size: 3.5,
                        type: "spark"
                    });
                } else if (p.isElectric) {
                    particles.push({
                        x: p.x + (p.w ? p.w / 2 : 8) + (Math.random() - .5) * 4,
                        y: p.y + (p.h ? p.h / 2 : 8) + (Math.random() - .5) * 4,
                        vx: -p.vx * .15 + (Math.random() - .5) * 1.5,
                        vy: -p.vy * .15 + (Math.random() - .5) * 1.5,
                        life: 10,
                        color: Math.random() < .5 ? "#00ffff" : "#ffffff",
                        size: 2.5,
                        type: "spark"
                    });
                } else if (p.isFlameSpray || p.isExplosiveFireball || p.isFireball) {
                    particles.push({
                        x: p.x + (p.w ? p.w / 2 : 8),
                        y: p.y + (p.h ? p.h / 2 : 8),
                        vx: -p.vx * .2 + (Math.random() - .5) * 2,
                        vy: -p.vy * .2 + (Math.random() - .5) * 2,
                        life: 12,
                        color: Math.random() < .5 ? "#ff4400" : "#ffaa00",
                        size: 3.5,
                        type: "spark"
                    });
                } else {
                    particles.push({
                        x: p.x + (p.w ? p.w / 2 : 6),
                        y: p.y + (p.h ? p.h / 2 : 6),
                        vx: -p.vx * .2,
                        vy: -p.vy * .2,
                        life: 10,
                        color: p.color || "#ff4400",
                        size: 3,
                        type: "spark"
                    });
                }
            }
            if (p.isFlameSpray) {
                const pr = p.radius || 12;
                const pcx = sx + pr, pcy = p.y + pr;
                const alpha = p.life !== undefined && p.maxLife ? Math.max(.1, p.life / p.maxLife) : .85;
                ctx.globalAlpha = alpha;
                ctx.shadowBlur = 14;
                ctx.shadowColor = "#ff3b00";
                const flGrad = ctx.createRadialGradient(pcx, pcy, 1, pcx, pcy, pr);
                flGrad.addColorStop(0, "#ffffff");
                flGrad.addColorStop(.35, "#facc15");
                flGrad.addColorStop(.7, "#ea580c");
                flGrad.addColorStop(.95, "#b91c1c");
                flGrad.addColorStop(1, "rgba(185, 28, 28, 0)");
                ctx.fillStyle = flGrad;
                ctx.beginPath();
                ctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(pcx - 1, pcy - 1, pr * .35, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
            } else if (p.isRollingSnowball) {
                const pr = p.radius || 28;
                const pcx = sx + pr, pcy = p.y + pr;
                ctx.save();
                ctx.translate(pcx, pcy);
                ctx.rotate(p.rot || 0);
                ctx.fillStyle = "rgba(0, 30, 70, 0.25)";
                ctx.beginPath();
                ctx.ellipse(0, pr - 2, pr * .85, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 10;
                ctx.shadowColor = "#38bdf8";
                const sGrad = ctx.createRadialGradient(-pr * .3, -pr * .3, 2, 0, 0, pr);
                sGrad.addColorStop(0, "#ffffff");
                sGrad.addColorStop(.6, "#e0f2fe");
                sGrad.addColorStop(.9, "#93c5fd");
                sGrad.addColorStop(1, "#60a5fa");
                ctx.fillStyle = sGrad;
                ctx.beginPath();
                ctx.arc(0, 0, pr, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#0284c7";
                ctx.lineWidth = 2.4;
                ctx.stroke();
                ctx.shadowBlur = 0;
                if (p.isHead) {
                    ctx.fillStyle = "#0f172a";
                    ctx.beginPath();
                    ctx.arc(-pr * .25, -pr * .15, 3, 0, Math.PI * 2);
                    ctx.arc(pr * .25, -pr * .15, 3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = "#0f172a";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(-pr * .38, -pr * .35);
                    ctx.lineTo(-pr * .12, -pr * .22);
                    ctx.moveTo(pr * .38, -pr * .35);
                    ctx.lineTo(pr * .12, -pr * .22);
                    ctx.stroke();
                    ctx.fillStyle = "#f97316";
                    ctx.beginPath();
                    ctx.moveTo(0, -pr * .05);
                    ctx.lineTo(pr * .7, 0);
                    ctx.lineTo(0, pr * .1);
                    ctx.closePath();
                    ctx.fill();
                } else {
                    ctx.fillStyle = "#1e293b";
                    ctx.beginPath();
                    ctx.arc(pr * .3, 0, 3.5, 0, Math.PI * 2);
                    ctx.arc(-pr * .3, 0, 3.5, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            } else if (p.isLongThorn) {
                const pl = p.w || 36, ph = p.h || 10;
                const pcx = sx + pl / 2, pcy = p.y + ph / 2;
                const angle = p.angle !== undefined ? p.angle : Math.atan2(p.vy || 0, p.vx || 1);
                ctx.save();
                ctx.translate(pcx, pcy);
                ctx.rotate(angle);
                ctx.shadowBlur = 8;
                ctx.shadowColor = "#84cc16";
                ctx.fillStyle = "#4d7c0f";
                ctx.beginPath();
                ctx.moveTo(pl * .5, 0);
                ctx.lineTo(-pl * .5, -ph * .45);
                ctx.lineTo(-pl * .3, 0);
                ctx.lineTo(-pl * .5, ph * .45);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = "#14532d";
                ctx.lineWidth = 1.6;
                ctx.stroke();
                ctx.fillStyle = "#facc15";
                ctx.beginPath();
                ctx.moveTo(pl * .45, 0);
                ctx.lineTo(-pl * .25, -ph * .2);
                ctx.lineTo(-pl * .25, ph * .2);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.restore();
            } else if (p.isTankShell) {
                const pr = p.radius || 18;
                ctx.save();
                ctx.translate(sx, p.y);
                
                ctx.shadowBlur = 14;
                ctx.shadowColor = "#ff007f";
                
                ctx.fillStyle = "#2d001a";
                ctx.beginPath();
                ctx.arc(0, 0, pr + 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 2.5;
                ctx.stroke();
                
                const pGrad = ctx.createRadialGradient(-pr * 0.25, -pr * 0.25, 2, 0, 0, pr);
                pGrad.addColorStop(0, "#ffffff");
                pGrad.addColorStop(0.35, "#ff66cc");
                pGrad.addColorStop(0.7, "#ff007f");
                pGrad.addColorStop(1, "#831843");
                ctx.fillStyle = pGrad;
                ctx.beginPath();
                ctx.arc(0, 0, pr, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.shadowBlur = 0;
                ctx.strokeStyle = "#00ffff";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, pr * (1 + 0.18 * Math.sin(time * 0.25)), 0, Math.PI * 2);
                ctx.stroke();
                
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(-pr * 0.5, -1.5, pr, 3);
                ctx.fillRect(-1.5, -pr * 0.5, 3, pr);
                
                ctx.restore();
            } else if (p.isIceSpectreBall || p.isBigIceBall) {
                const pr = p.radius || 20;
                const pcx = sx + pr, pcy = p.y + pr;
                const isCrimson = p.color === "#ef4444" || p.color === "#f87171" || (p.color && p.color.includes("red"));
                const spinRot = (p.angle || 0) + time * (isCrimson ? 0.12 : 0.08);

                ctx.save();
                ctx.translate(pcx, pcy);

                ctx.shadowBlur = p.isBigIceBall ? 14 : 9;
                ctx.shadowColor = isCrimson ? "#dc2626" : "#0284c7";

                const spikes = 8;
                const outerR = pr * 1.1;
                const innerR = pr * 0.72;
                ctx.save();
                ctx.rotate(spinRot);

                ctx.strokeStyle = isCrimson ? "#450a0a" : "#082f49";
                ctx.lineWidth = 3;

                ctx.beginPath();
                for (let i = 0; i < spikes * 2; i++) {
                    const r = (i % 2 === 0) ? outerR : innerR;
                    const a = (i * Math.PI) / spikes;
                    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
                    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                }
                ctx.closePath();

                const cGrad = ctx.createRadialGradient(-pr * 0.25, -pr * 0.25, 2, 0, 0, pr);
                if (isCrimson) {
                    cGrad.addColorStop(0, "#fff1f2");
                    cGrad.addColorStop(0.2, "#fecdd3");
                    cGrad.addColorStop(0.5, "#f43f5e");
                    cGrad.addColorStop(0.8, "#be123c");
                    cGrad.addColorStop(1, "#881337");
                } else {
                    cGrad.addColorStop(0, "#ffffff");
                    cGrad.addColorStop(0.2, "#bae6fd");
                    cGrad.addColorStop(0.5, "#38bdf8");
                    cGrad.addColorStop(0.8, "#0284c7");
                    cGrad.addColorStop(1, "#0c4a6e");
                }
                ctx.fillStyle = cGrad;
                ctx.fill();
                ctx.stroke();

                ctx.strokeStyle = isCrimson ? "rgba(255, 220, 230, 0.85)" : "rgba(255, 255, 255, 0.85)";
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                for (let i = 0; i < spikes; i++) {
                    const a = (i * 2 * Math.PI) / spikes;
                    ctx.moveTo(0, 0);
                    ctx.lineTo(Math.cos(a) * outerR, Math.sin(a) * outerR);
                }
                ctx.stroke();

                ctx.fillStyle = isCrimson ? "#ffe4e6" : "#ffffff";
                ctx.beginPath();
                ctx.moveTo(0, -pr * 0.42);
                ctx.lineTo(pr * 0.42, 0);
                ctx.lineTo(0, pr * 0.42);
                ctx.lineTo(-pr * 0.42, 0);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = isCrimson ? "#f43f5e" : "#38bdf8";
                ctx.lineWidth = 1.2;
                ctx.stroke();

                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(-pr * 0.22, -pr * 0.22, pr * 0.16, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
                ctx.shadowBlur = 0;
                ctx.restore();
            } else if (p.isGiant) {
                const pr = p.radius || 24;
                const pcx = sx + pr, pcy = p.y + pr;
                const isIce = p.isBigIceBall || p.color === "#ffffff" || p.color === "#00ddff" || p.color === "#00ffff";
                const gradKey = (p.color || "#ff6600") + "|" + pr + (isIce ? "|ice" : "");
                if (!p._gradCache || p._gradKey !== gradKey) {
                    const gx = ctx.createRadialGradient(-pr * 0.2, -pr * 0.2, 2, 0, 0, pr);
                    gx.addColorStop(0, "#ffffff");
                    gx.addColorStop(.4, p.color || "#ffaa00");
                    gx.addColorStop(1, isIce ? "#0c4a6e" : "#660000");
                    p._gradCache = gx;
                    p._gradKey = gradKey;
                }
                ctx.save();
                ctx.translate(pcx, pcy);
                ctx.shadowBlur = 12;
                ctx.shadowColor = p.color || "#ff6600";
                ctx.fillStyle = p._gradCache;
                ctx.beginPath();
                ctx.arc(0, 0, pr, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = isIce ? "#38bdf8" : "#ffff00";
                ctx.lineWidth = 2.5;
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.restore();
            } else if (p.isFireBubble) {
                const pr = p.radius || 14;
                const pcx = sx + pr, pcy = p.y + pr;
                ctx.save();
                ctx.shadowBlur = 14;
                ctx.shadowColor = "#ff2200";
                const bGrad = ctx.createRadialGradient(pcx - pr * .35, pcy - pr * .35, 2, pcx, pcy, pr);
                bGrad.addColorStop(0, "#fffbeb");
                bGrad.addColorStop(0.3, "#f59e0b");
                bGrad.addColorStop(0.7, "#ea580c");
                bGrad.addColorStop(1, "#991b1b");
                ctx.fillStyle = bGrad;
                ctx.beginPath();
                ctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#fef08a";
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
                ctx.beginPath();
                ctx.ellipse(pcx - pr * .35, pcy - pr * .35, pr * .35, pr * .2, -0.4, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.restore();
            } else if (p.isSlowBubble || p.isBubbleSpray) {
                const pr = p.radius || 10;
                const pcx = sx + pr, pcy = p.y + pr;
                const alpha = p.life !== undefined && p.maxLife ? Math.max(.1, p.life / p.maxLife) : .85;
                ctx.globalAlpha = alpha;
                ctx.shadowBlur = 8;
                ctx.shadowColor = "#38bdf8";
                const bGrad = ctx.createRadialGradient(pcx - pr * .35, pcy - pr * .35, 1, pcx, pcy, pr);
                bGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
                bGrad.addColorStop(.4, "rgba(125, 211, 252, 0.6)");
                bGrad.addColorStop(.8, "rgba(56, 189, 248, 0.45)");
                bGrad.addColorStop(1, "rgba(14, 165, 233, 0.8)");
                ctx.fillStyle = bGrad;
                ctx.beginPath();
                ctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#0284c7";
                ctx.lineWidth = 1.6;
                ctx.stroke();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(pcx - pr * .38, pcy - pr * .38, pr * .3, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
            } else if (p.isAppleArc) {
                const pr = p.radius || 10;
                const pcx = sx + pr, pcy = p.y + pr;
                ctx.save();
                ctx.translate(pcx, pcy);
                ctx.rotate(p.rot || 0);
                ctx.fillStyle = "rgba(0,0,0,0.2)";
                ctx.beginPath();
                ctx.ellipse(0, pr - 1, pr * .8, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                const aGrad = ctx.createRadialGradient(-pr * .3, -pr * .3, 1, 0, 0, pr);
                aGrad.addColorStop(0, "#f87171");
                aGrad.addColorStop(.6, "#ef4444");
                aGrad.addColorStop(1, "#991b1b");
                ctx.fillStyle = aGrad;
                ctx.beginPath();
                ctx.arc(-pr * .28, 0, pr * .72, 0, Math.PI * 2);
                ctx.arc(pr * .28, 0, pr * .72, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#450a0a";
                ctx.lineWidth = 1.6;
                ctx.stroke();
                ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                ctx.beginPath();
                ctx.arc(-pr * .35, -pr * .35, pr * .25, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#5a3d28";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, -pr * .6);
                ctx.quadraticCurveTo(2, -pr * 1.1, 4, -pr * 1.2);
                ctx.stroke();
                ctx.fillStyle = "#22c55e";
                ctx.beginPath();
                ctx.ellipse(3, -pr * .9, 4, 2, .4, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else if (p.isFrostBreath) {
                const pr = p.radius || 11;
                const pcx = sx + pr, pcy = p.y + pr;
                const alpha = p.life !== undefined && p.maxLife ? Math.max(.1, p.life / p.maxLife) : .8;
                ctx.globalAlpha = alpha;
                ctx.shadowBlur = 10;
                ctx.shadowColor = "#38bdf8";
                const fGrad = ctx.createRadialGradient(pcx, pcy, 1, pcx, pcy, pr);
                fGrad.addColorStop(0, "#ffffff");
                fGrad.addColorStop(.5, "#bae6fd");
                fGrad.addColorStop(.85, "#38bdf8");
                fGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
                ctx.fillStyle = fGrad;
                ctx.beginPath();
                ctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(pcx - 4, pcy);
                ctx.lineTo(pcx + 4, pcy);
                ctx.moveTo(pcx, pcy - 4);
                ctx.lineTo(pcx, pcy + 4);
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
            } else if (p.isElectric) {
                const pr = p.w ? p.w / 2 : 8;
                const pcx = sx + pr, pcy = p.y + pr;
                ctx.shadowBlur = 14;
                ctx.shadowColor = "#00f0ff";
                const pulse = Math.sin(time * .3) * 2;
                const grad = ctx.createRadialGradient(pcx, pcy, 2, pcx, pcy, pr + 4 + pulse);
                grad.addColorStop(0, "#ffffff");
                grad.addColorStop(.4, "#00ffff");
                grad.addColorStop(.75, "#7928ca");
                grad.addColorStop(1, "rgba(0, 255, 255, 0)");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(pcx, pcy, pr + 4 + pulse, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(pcx, pcy, pr * .45, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1.6;
                for (let a = 0; a < 3; a++) {
                    const aAngle = time * .35 + a * (Math.PI * 2 / 3);
                    const ex = pcx + Math.cos(aAngle) * (pr + 3);
                    const ey = pcy + Math.sin(aAngle) * (pr + 3);
                    const mx = pcx + Math.cos(aAngle + .3) * (pr * .7);
                    const my = pcy + Math.sin(aAngle + .3) * (pr * .7);
                    ctx.beginPath();
                    ctx.moveTo(pcx, pcy);
                    ctx.lineTo(mx, my);
                    ctx.lineTo(ex, ey);
                    ctx.stroke();
                }
                ctx.shadowBlur = 0;
            } else if (p.isExplosiveFireball) {
                const pr = p.radius || 18;
                const pcx = sx + pr, pcy = p.y + pr;
                ctx.shadowBlur = 16;
                ctx.shadowColor = "#ff3300";
                const grad = ctx.createRadialGradient(pcx, pcy, 2, pcx, pcy, pr);
                grad.addColorStop(0, "#ffffff");
                grad.addColorStop(.3, "#ffff00");
                grad.addColorStop(.6, "#ff4400");
                grad.addColorStop(1, "#4a0000");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#0369a1";
                ctx.lineWidth = 2.0;
                ctx.stroke();
                ctx.strokeStyle = "#ffff66";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(pcx, pcy, pr * (1 + .12 * Math.sin(time * .25)), 0, Math.PI * 2);
                ctx.stroke();
                ctx.shadowBlur = 0;
            } else if (p.isCluster) {
                const pr = p.w ? p.w / 2 : 9;
                const pcx = sx + pr, pcy = p.y + pr;
                ctx.shadowBlur = 12;
                ctx.shadowColor = "#ff6600";
                const grad = ctx.createRadialGradient(pcx, pcy, 2, pcx, pcy, pr);
                grad.addColorStop(0, "#ffffff");
                grad.addColorStop(.35, "#ffaa00");
                grad.addColorStop(.7, "#ff3300");
                grad.addColorStop(1, "#550000");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
                ctx.fill();
                if (p.splitTimer < 14 && Math.floor(time * .4) % 2 === 0) {
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(pcx, pcy, pr * .7, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.shadowBlur = 0;
            } else if (p.isFireball) {
                const pr = p.w ? p.w / 2 : 9;
                ctx.shadowBlur = 9;
                ctx.shadowColor = "#ff6600";
                const grad = ctx.createRadialGradient(sx + pr, p.y + pr, 2, sx + pr, p.y + pr, pr);
                grad.addColorStop(0, "#ffff00");
                grad.addColorStop(.5, "#ff4400");
                grad.addColorStop(1, "#4a0000");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(sx + pr, p.y + pr, pr, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#450a0a";
                ctx.lineWidth = 1.8;
                ctx.stroke();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(sx + pr - 2, p.y + pr - 2, pr * .35, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else if (p.isSnowball) {
                const pr = p.radius || (p.w ? p.w / 2 : 11);
                const pcx = sx + pr, pcy = p.y + pr;
                ctx.shadowBlur = p.isGiantSnowball ? 12 : 6;
                ctx.shadowColor = "#80d8ff";
                const grad = ctx.createRadialGradient(pcx - pr * .35, pcy - pr * .35, 1, pcx, pcy, pr);
                grad.addColorStop(0, "#ffffff");
                grad.addColorStop(.55, "#e8f7ff");
                grad.addColorStop(.85, "#b0daf5");
                grad.addColorStop(1, "#78aed4");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
                ctx.fill();
                ctx.save();
                ctx.translate(pcx, pcy);
                ctx.rotate(p.rot || 0);
                ctx.fillStyle = "#ffffff";
                const dotCount = p.isGiantSnowball ? 6 : 3;
                for (let d = 0; d < dotCount; d++) {
                    const dAng = d * (Math.PI * 2 / dotCount);
                    const dDist = pr * .5;
                    ctx.beginPath();
                    ctx.arc(Math.cos(dAng) * dDist, Math.sin(dAng) * dDist, p.isGiantSnowball ? 2.5 : 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }
                if (p.isGiantSnowball) {
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.arc(0, 0, pr * .9, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.restore();
                ctx.shadowBlur = 0;
            } else if (p.isWaterBullet) {
                const pr = p.w ? p.w / 2 : 7;
                const pcx = sx + pr, pcy = p.y + pr;
                ctx.shadowBlur = 10;
                ctx.shadowColor = "#06b6d4";
                const wGrad = ctx.createRadialGradient(pcx - 1, pcy - 1, 1, pcx, pcy, pr);
                wGrad.addColorStop(0, "#ffffff");
                wGrad.addColorStop(.4, "#38bdf8");
                wGrad.addColorStop(.85, "#0284c7");
                wGrad.addColorStop(1, "rgba(6, 182, 212, 0.4)");
                ctx.fillStyle = wGrad;
                ctx.beginPath();
                ctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#0369a1";
                ctx.lineWidth = 1.8;
                ctx.stroke();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(pcx - 2, pcy - 2, 2, 0, Math.PI * 2);
                ctx.fill();
                if (Math.random() < .35) {
                    particles.push({
                        x: p.x + pr,
                        y: p.y + pr,
                        vx: -p.vx * .2 + (Math.random() - .5) * 1,
                        vy: -p.vy * .2 + (Math.random() - .5) * 1,
                        life: 10,
                        color: "#38bdf8",
                        size: 2,
                        type: "spark"
                    });
                }
                ctx.shadowBlur = 0;
            } else if (p.isInkBullet) {
                const pr = p.w ? p.w / 2 : 8;
                const pcx = sx + pr, pcy = p.y + pr;
                ctx.shadowBlur = p.isGiantInk ? 16 : 10;
                ctx.shadowColor = "#7c3aed";
                const iGrad = ctx.createRadialGradient(pcx - 1, pcy - 1, 1, pcx, pcy, pr);
                iGrad.addColorStop(0, "#2e1065");
                iGrad.addColorStop(.5, "#0f051d");
                iGrad.addColorStop(1, "#000000");
                ctx.fillStyle = iGrad;
                ctx.beginPath();
                ctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#a855f7";
                ctx.beginPath();
                ctx.arc(pcx - 2, pcy - 2, pr * .28, 0, Math.PI * 2);
                ctx.fill();
                if (Math.random() < .45) {
                    particles.push({
                        x: p.x + pr,
                        y: p.y + pr,
                        vx: -p.vx * .15 + (Math.random() - .5) * 1.5,
                        vy: -p.vy * .15 + (Math.random() - .5) * 1.5,
                        life: 14,
                        color: "#090514",
                        size: p.isGiantInk ? 4 : 2.5,
                        type: "spark"
                    });
                }
                ctx.shadowBlur = 0;
            } else if (p.isKrakenBigBall) {
                const pr = p.w ? p.w / 2 : 30;
                const pcx = sx + pr, pcy = p.y + pr;
                ctx.shadowBlur = 20;
                ctx.shadowColor = "#38bdf8";
                const bGrad = ctx.createRadialGradient(pcx - 2, pcy - 3, 2, pcx, pcy, pr);
                bGrad.addColorStop(0, "#ffffff");
                bGrad.addColorStop(.35, "#7dd3fc");
                bGrad.addColorStop(.7, p.color || "#0284c7");
                bGrad.addColorStop(1, "rgba(2, 18, 40, 0.85)");
                ctx.fillStyle = bGrad;
                ctx.beginPath();
                ctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.save();
                ctx.translate(pcx, pcy);
                ctx.rotate(time * .04);
                ctx.strokeStyle = "rgba(56, 189, 248, 0.8)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, pr * .72, 0, Math.PI * 2);
                ctx.stroke();
                ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
                ctx.beginPath();
                ctx.arc(0, 0, pr * .45, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
                if (Math.random() < .3) {
                    particles.push({
                        x: pcx + (Math.random() - .5) * pr * 2,
                        y: pcy + (Math.random() - .5) * pr * 2,
                        vx: (Math.random() - .5) * 1.5,
                        vy: (Math.random() - .5) * 1.5,
                        life: 16,
                        color: "#0b2a4a",
                        size: 3,
                        type: "spark"
                    });
                }
            } else if (p.isParalyzeDiamond && window.HalloweenSystem) {
                window.HalloweenSystem.drawParalyzeDiamond(ctx, p, cameraX, time);
            } else if (p.isHalloweenFire && window.HalloweenSystem) {
                window.HalloweenSystem.drawHalloweenFire(ctx, p, cameraX, time);
            } else if (p.isHorrorBall) {
                const pcx = sx + (p.w ? p.w / 2 : 8), pcy = p.y + (p.h ? p.h / 2 : 8);
                ctx.save();
                ctx.shadowBlur = 16;
                ctx.shadowColor = "#ff0033";
                const grad = ctx.createRadialGradient(pcx, pcy, 1, pcx, pcy, 11);
                grad.addColorStop(0, "#ff4d4d");
                grad.addColorStop(0.35, "#dc2626");
                grad.addColorStop(0.75, "#7f1d1d");
                grad.addColorStop(1, "rgba(20, 0, 4, 0.95)");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(pcx, pcy, 8.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                const coreR = 3.6 + Math.sin(time * 0.28) * 1.2;
                ctx.fillStyle = "#0d0103";
                ctx.beginPath();
                ctx.arc(pcx, pcy, coreR, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#ff0033";
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.arc(pcx, pcy, coreR + 1.2, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            } else {
                const pr = p.w ? p.w / 2 : 6;
                ctx.shadowBlur = 6;
                ctx.shadowColor = p.color || "#ff0000";
                ctx.fillStyle = p.color || "#ff0000";
                ctx.beginPath();
                ctx.arc(sx + pr, p.y + pr, pr, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 1.8;
                ctx.stroke();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(sx + pr, p.y + pr, pr * .42, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
            let hitPlayer = false;
            if (p.isGiant || p.isGiantSnowball || p.isSnowball || p.isRollingSnowball || p.isColossalFireball || p.isKrakenBigBall || p.isParalyzeDiamond || p.isHalloweenFire) {
                const pr = p.radius || 20;
                const pcx = p.x + (p.w ? p.w / 2 : pr);
                const pcy = p.y + (p.h ? p.h / 2 : pr);
                const dist = Math.hypot(pcx - (game.player.x + game.player.w / 2), pcy - (game.player.y + game.player.h / 2));
                if (dist < pr + game.player.w / 2) hitPlayer = true;
            } else {
                const pw = p.w || 8, ph = p.h || 8;
                if (p.x < game.player.x + game.player.w && p.x + pw > game.player.x && p.y < game.player.y + game.player.h && p.y + ph > game.player.y) {
                    hitPlayer = true;
                }
            }
            if (gameState === "playing" && hitPlayer && !game.player.frozen) {
                const energyDash = game.player.dashMax && game.player.dashTimer > 0;
                if (energyDash) {
                    try {
                        createExplosion(p.x, p.y, "#ff00e0", 18, 12, [ "#ff00e0", "#00ffff", "#ffffff" ]);
                        playSound(450, .12, "square", .18, 900);
                    } catch (e) {}
                    enemyProjectiles.splice(i, 1);
                    continue;
                }
                if (p.isRollingSnowball) {
                    playSound(110, .45, "sawtooth", .35, 40);
                    createExplosion(p.x + (p.radius || 25), p.y + (p.radius || 25), "#ffffff", 40, 24, [ "#ffffff", "#bae6fd", "#38bdf8" ]);
                    applyShake(9);
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 15, typeof __ === "function" ? __("flt_avalancha") : "¡AVALANCHA!", "#38bdf8", 18);
                } else if (p.isLongThorn) {
                    playSound(520, .18, "square", .22, 920);
                    createExplosion(p.x, p.y, "#84cc16", 20, 14, [ "#84cc16", "#a3e635", "#fef08a" ]);
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 15, typeof __ === "function" ? __("flt_pinchazo") : "¡PINCHAZO!", "#84cc16", 16);
                } else if (p.isFlameSpray) {
                    playSound(280, .2, "sawtooth", .22, 110);
                    createExplosion(p.x, p.y, "#ff4500", 24, 16, [ "#ffffff", "#facc15", "#ff4500" ]);
                } else if (p.isElectric) {
                    try {
                        playSound(700, .14, "sawtooth", .2, 120);
                        playSound(110, .35, "sawtooth", .45, 30);
                    } catch (e) {}
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 15, typeof __ === "function" ? __("flt_descarga") : "¡ELECTROCUTADO!", "#00f0ff", 18);
                    if (typeof window.applyElectricShock === "function") {
                        window.applyElectricShock(game.player, 30);
                    }
                } else if (p.isParalyzeDiamond) {
                    if (typeof window.applyParalyzeEffect === "function") {
                        window.applyParalyzeEffect(game.player, 180);
                    }
                } else if (p.isHalloweenFire) {
                    playSound(320, .2, "sawtooth", .22, 110);
                    createExplosion(p.x, p.y, "#ea580c", 20, 14, [ "#ea580c", "#f97316", "#fef08a" ]);
                } else if (p.isWhiteGhostBullet) {
                    playSound(440, .15, "triangle", .16, 220);
                    createExplosion(p.x, p.y, "#ffffff", 18, 12, [ "#ffffff", "#cbd5e1", "#e2e8f0" ]);
                } else if (p.isSnowball) {
                    playSound(190, .16, "triangle", .18, 90);
                    createExplosion(p.x, p.y, "#ffffff", p.isGiantSnowball ? 24 : 14, 10, [ "#ffffff", "#e0f7ff", "#80d8ff" ]);
                } else if (p.isWaterBullet) {
                    playSound(240, .14, "sine", .18, 80);
                    createExplosion(p.x, p.y, "#06b6d4", 16, 12, [ "#00ffff", "#ffffff", "#0284c7" ]);
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 15, typeof __ === "function" ? __("flt_splash") : "¡SPLASH!", "#38bdf8", 15);
                } else if (p.isKrakenBigBall) {
                    playSound(70, .9, "sawtooth", .55, 26);
                    createExplosion(p.x, p.y, "#0284c7", p.radius ? p.radius * 2 : 56, 40, [ "#00ffff", "#0e7490", "#38bdf8", "#ffffff" ]);
                    applyShake(14);
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 18, __("flt_krakatoa_nearly"), "#38bdf8", 18);
                } else if (p.isSlowBubble || p.isBubbleSpray) {
                    playSound(560, .18, "sine", .2, 350);
                    createExplosion(p.x, p.y, "#38bdf8", 16, 10, [ "#38bdf8", "#7dd3fc", "#ffffff" ]);
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 15, typeof __ === "function" ? __("flt_pop") : "¡POP!", "#38bdf8", 15);
                } else if (p.isAppleArc) {
                    playSound(400, .18, "triangle", .2, 220);
                    createExplosion(p.x, p.y, "#ef4444", 18, 12, [ "#ef4444", "#f87171", "#22c55e", "#ffffff" ]);
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 15, typeof __ === "function" ? __("flt_manzanazo") : "¡MANZANAZO!", "#ef4444", 16);
                } else if (p.isFrostBreath) {
                    playSound(280, .25, "sawtooth", .28, 100);
                    createExplosion(p.x, p.y, "#a5f3fc", 22, 14, [ "#a5f3fc", "#38bdf8", "#ffffff" ]);
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 15, typeof __ === "function" ? __("flt_congelada") : "¡CONGELADA!", "#38bdf8", 18);
                    if (typeof window.applyParalyzeEffect === "function") {
                        window.applyParalyzeEffect(game.player, 240);
                    } else if (game.player) {
                        game.player.paralyzeTimer = 240;
                    }
                } else if (p.isInkBullet) {
                    playSound(140, .25, "sawtooth", .28, 40);
                    createExplosion(p.x, p.y, "#0a0614", p.isGiantInk ? 30 : 18, 14, [ "#000000", "#2e1065", "#a855f7" ]);
                    if (typeof window.triggerInkSplatter === "function") {
                        window.triggerInkSplatter(p.isGiantInk);
                    }
                } else if (p.isHorrorBall) {
                    playSound(95, .35, "sawtooth", .3, 30);
                    createExplosion(p.x + 8, p.y + 8, "#ff0033", 22, 16, [ "#ff0033", "#7f1d1d", "#0a0004", "#ffffff" ]);
                    applyShake(7);
                    addFloatingText(game.player.x + game.player.w / 2, game.player.y - 15, "¡SANGRE!", "#ff1744", 17);
                }
                game.player.takeDamage(p.damage || 15);
                enemyProjectiles.splice(i, 1);
                continue;
            }
            p.age = (p.age || 0) + 1;
            if (p.age > 240 || p.x < cameraX - 100 || p.x > cameraX + VIEW_W + 100 || p.y > VIEW_H + 100 || p.y < -150) {
                enemyProjectiles.splice(i, 1);
            }
        }
        if (game.player && window.TurretSystem) {
            try {
                window.TurretSystem.update(VIEW_W, VIEW_H);
                window.TurretSystem.checkBulletCollisions(game.player);
                if (projectiles && projectiles.length > 0) {
                    window.TurretSystem.checkPlayerProjectileCollisions(projectiles);
                }
            } catch (e) {}
        }
        if (currentLevel === 2 && window.ValkyrieBoss) {
            try {
                window.ValkyrieBoss.update(game, cameraX, VIEW_W, VIEW_H, projectiles);
            } catch (e) {}
        }
        if (currentLevel === 2) {
            updateLevel2BurningTreeArena(game, cameraX, VIEW_W, VIEW_H);
        }
        updateAndDrawParticles(ctx, cameraX);
        for (let s of stars) {
            if (!s.collected) {
                const drawX = s.x - cameraX;
                if (drawX > -40 && drawX < VIEW_W + 40) {
                    ctx.save();
                    const beat = 1 + Math.sin(time * .12 + s.x) * .12;
                    const hoverY = s.y + Math.sin(time * .08 + s.x) * 4;
                    ctx.translate(drawX + 12, hoverY + 12);
                    ctx.rotate(Math.sin(time * .05 + s.x) * .12);
                    ctx.scale(beat, beat);
                    ctx.fillStyle = "#ff4d6d";
                    const glowMult = (typeof window !== "undefined" && window.PerfQuality && typeof window.PerfQuality.glowMult === "number") ? window.PerfQuality.glowMult : 1;
                    if (glowMult > 0.4) {
                        ctx.shadowColor = "#ff2e63";
                        ctx.shadowBlur = 8;
                    } else {
                        ctx.shadowBlur = 0;
                    }
                    ctx.beginPath();
                    ctx.moveTo(0, 6);
                    ctx.bezierCurveTo(-13, -3, -9, -14, 0, -7);
                    ctx.bezierCurveTo(9, -14, 13, -3, 0, 6);
                    ctx.closePath();
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = "rgba(255,255,255,0.65)";
                    ctx.beginPath();
                    ctx.ellipse(-4.5, -5.5, 3, 2, -.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                    if (game.player && !game.player.frozen && game.player.x < s.x + 24 && game.player.x + game.player.w > s.x && game.player.y < s.y + 24 && game.player.y + game.player.h > s.y) {
                        s.collected = true;
                        score += 50;
                        updateScore(score);
                        if (game.player) {
                            game.player.health = Math.min(game.player.health + 25, PLAYER_MAX_HEALTH);
                            game.player.healShowTimer = 55;
                            if (typeof window.updateHealthUI === "function") {
                                window.updateHealthUI(game.player.health, PLAYER_MAX_HEALTH);
                            } else {
                                gsap.to(healthFill, {
                                    width: game.player.health / PLAYER_MAX_HEALTH * 100 + "%",
                                    duration: .3
                                });
                            }
                            addFloatingText(s.x + 12, s.y - 30, "+50 PTS", "#ffd700", 16);
                            addFloatingText(s.x + 12, s.y - 10, "+25 HP", "#ff4d6d", 18);
                            for (let k = 0; k < 6; k++) {
                                particles.push({
                                    x: game.player.x + game.player.w / 2 + (Math.random() - .5) * 16,
                                    y: game.player.y,
                                    vx: (Math.random() - .5) * .8,
                                    vy: -1.4 - Math.random() * .8,
                                    life: 48,
                                    maxLife: 48,
                                    type: "emoji",
                                    text: [ "❤️", "💖", "💕", "🥰" ][Math.floor(Math.random() * 4)],
                                    size: 20,
                                    sineWave: true
                                    });
                            }
                        } else {
                            addFloatingText(s.x + 12, s.y - 10, "+50 PTS", "#ff4d6d", 18);
                        }
                        playSound(880, .15, "sine", .25, 1320);
                        try {
                            playSFX("sfx_heart_pickup_1");
                        } catch (e) {}
                        createExplosion(s.x + 12, s.y + 12, "#ff4d6d", 15, 12, [ "#ffffff", "#ff2e63" ]);
                    }
                }
            }
        }
        for (let cp of checkpoints) {
            drawCheckpoint(ctx, cp, cameraX, time);
            if (!cp.activated && game.player && !game.player.frozen) {
                const px = game.player.x + game.player.w / 2;
                const py = game.player.y + game.player.h / 2;
                const checkY = cp.groundY != null ? cp.groundY - 35 : cp.y + 20;
                if (Math.abs(px - (cp.x + 12)) < 40 && Math.abs(py - checkY) < 65) {
                    cp.activated = true;
                    currentCheckpoint = {
                        level: currentLevel,
                        x: cp.x,
                        y: cp.groundY != null ? cp.groundY - 60 : cp.y,
                        meadowNight: game.meadowNight,
                        gate2Open: game.gate2Open,
                        gate1Open: game.gate1Open,
                        boss1Defeated: game.boss1Defeated
                    };
                    game.player.checkpointShowTimer = 65;
                    game.player.vy = -6;
                    game.player.scaleY = 1.35;
                    game.player.scaleX = .75;
                    for (let k = 0; k < 12; k++) {
                        const ang = Math.random() * Math.PI * 2;
                        const spd = 2.5 + Math.random() * 5.5;
                        particles.push({
                            x: game.player.x + game.player.w / 2,
                            y: game.player.y + game.player.h / 2,
                            vx: Math.cos(ang) * spd,
                            vy: Math.sin(ang) * spd,
                            life: 40,
                            maxLife: 40,
                            type: "emoji",
                            text: [ "⭐", "✨", "🌟" ][Math.floor(Math.random() * 3)],
                            size: 18
                        });
                    }
                    playSound(523.25, .15, "sine", .25, 1046.5);
                    setTimeout(() => playSound(659.25, .2, "sine", .25, 1318.5), 100);
                    setTimeout(() => playSound(783.99, .25, "sine", .3, 1567.98), 200);
                    setTimeout(() => playSound(1046.5, .35, "triangle", .35, 2093), 300);
                    game.flash = 22;
                    applyShake(7);
                    createExplosion(cp.x + 12, cp.y + 10, "#00ffff", 45, 30, [ "#ffd700", "#ff3388", "#ffffff", "#00ffaa" ]);
                    addFloatingText(cp.x + 12, cp.y - 20, __("flt_checkpoint"), "#00ffff", 24);
                }
            }
        }
        updateAndDrawFloatingTexts(ctx, cameraX);
        if (game.vignette) {
            const px = game.player.x - cameraX + game.player.w / 2;
            const py = game.player.y + game.player.h / 2 - (game.camY || 0);
            const r = game.vignetteRadius || 260;
            const grad = ctx.createRadialGradient(px, py, r * .35, px, py, r);
            grad.addColorStop(0, "rgba(0,0,0,0)");
            grad.addColorStop(1, "rgba(0,0,0,0.97)");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        }
        if (game.corruption > 0) {
            ctx.fillStyle = "rgba(0,0,0," + game.corruption * .85 + ")";
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            if (game.corruption > .4 && Math.random() > .7) {
                ctx.fillStyle = "rgba(120,0,0,0.25)";
                ctx.fillRect(0, Math.random() * VIEW_H, VIEW_W, 5 + Math.random() * 30);
            }
        }
        if (game.glitchT > 0) {
            game.glitchT--;
            if (game.glitchT > 48) {
                ctx.fillStyle = "rgba(255,255,255,0.9)";
                ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            }
            for (let i = 0; i < 14; i++) {
                const gy = Math.random() * VIEW_H;
                const gh = 4 + Math.random() * 26;
                const gx = (Math.random() - .5) * 80;
                ctx.globalCompositeOperation = "lighter";
                ctx.fillStyle = "rgba(255,0,0,0.35)";
                ctx.fillRect(gx - 20, gy, VIEW_W, gh);
                ctx.fillStyle = "rgba(0,255,255,0.35)";
                ctx.fillRect(-gx + 20, gy, VIEW_W, gh);
                ctx.globalCompositeOperation = "source-over";
                ctx.fillStyle = "rgba(0,0,0," + (.3 + Math.random() * .5) + ")";
                ctx.fillRect(gx, gy, VIEW_W, gh);
            }
            for (let i = 0; i < 300; i++) {
                ctx.fillStyle = Math.random() > .5 ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.4)";
                ctx.fillRect(Math.random() * VIEW_W, Math.random() * VIEW_H, 3, 2);
            }
            if (game.glitchT % 12 < 6) {
                ctx.fillStyle = "#000";
                ctx.fillRect(VIEW_W / 2 - 110, VIEW_H / 2 - 22, 220, 44);
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 2;
                ctx.strokeRect(VIEW_W / 2 - 110, VIEW_H / 2 - 22, 220, 44);
                ctx.fillStyle = "#fff";
                ctx.font = '22px "Courier Prime"';
                ctx.textAlign = "center";
                ctx.fillText(__("ui_no_signal"), VIEW_W / 2, VIEW_H / 2 + 8);
            }
        }
        if (game.flash > 0) {
            const flashAlpha = Math.min(0.42, (game.flash / 25) * 0.5);
            ctx.fillStyle = "rgba(255,255,255," + flashAlpha + ")";
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            game.flash--;
        }
        if (currentLevel === 5) {
            ctx.restore();
            ctx.save();
            game.camY = 0;
            if (game.holeTimer === undefined) game.holeTimer = 0;
            game.holeTimer++;
            if (game.doorDialog === undefined) game.doorDialog = null;
            if (game.doorDialogTimer === undefined) game.doorDialogTimer = 0;
            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.fillRect(0, 0, VIEW_W, 140);
            ctx.fillStyle = "#f44";
            ctx.font = '36px "Fredoka One"';
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(__("ui_choose_door_title"), VIEW_W / 2, 60);
            ctx.font = '18px "Courier Prime"';
            ctx.fillStyle = "#aaa";
            ctx.fillText(__("ui_walk_to_choose"), VIEW_W / 2, 105);
            const doorW = 80, doorH = 140, whiteX = 250, blackX = 650;
            ctx.save();
            ctx.shadowColor = "#fff";
            ctx.shadowBlur = 13;
            ctx.fillStyle = "#ddd";
            ctx.fillRect(whiteX - cameraX, 360, doorW, doorH);
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 3;
            ctx.strokeRect(whiteX - cameraX, 360, doorW, doorH);
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.fillRect(whiteX + 10 - cameraX, 370, doorW - 20, doorH - 20);
            ctx.font = "50px sans-serif";
            ctx.fillText("😇", whiteX + doorW / 2 - cameraX, 450);
            ctx.font = '14px "Courier Prime"';
            ctx.fillStyle = "#fff";
            ctx.fillText(__("door_white"), whiteX + doorW / 2 - cameraX, 520);
            ctx.restore();
            ctx.save();
            ctx.shadowColor = "#800";
            ctx.shadowBlur = 13;
            ctx.fillStyle = "#1a1a1a";
            ctx.fillRect(blackX - cameraX, 360, doorW, doorH);
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "#600";
            ctx.lineWidth = 3;
            ctx.strokeRect(blackX - cameraX, 360, doorW, doorH);
            ctx.fillStyle = "rgba(100,0,0,0.4)";
            ctx.fillRect(blackX + 10 - cameraX, 370, doorW - 20, doorH - 20);
            ctx.font = "50px sans-serif";
            ctx.fillText("👿", blackX + doorW / 2 - cameraX, 450);
            ctx.font = '14px "Courier Prime"';
            ctx.fillStyle = "#f44";
            ctx.fillText(__("door_black"), blackX + doorW / 2 - cameraX, 520);
            ctx.restore();
            const t = game.holeTimer * .03;
            ctx.globalAlpha = .3 + Math.sin(t) * .1;
            ctx.fillStyle = "#fff";
            for (let i = 0; i < 5; i++) {
                const px = VIEW_W / 2 + Math.sin(t * 1.7 + i) * 200, py = 250 + Math.cos(t * 2.1 + i * 1.3) * 80;
                ctx.beginPath();
                ctx.arc(px, py, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            if (game.doorDialog) {
                game.doorDialogTimer++;
                ctx.fillStyle = "rgba(0,0,0,0.85)";
                ctx.fillRect(0, 0, VIEW_W, VIEW_H);
                const dl = game.doorDialog === "white" ? [ __("door_dialog_white_1"), __("door_dialog_white_2"), __("door_dialog_white_3"), __("door_dialog_white_4"), __("door_dialog_white_5"), __("door_dialog_white_6") ] : [ __("door_dialog_black_1"), __("door_dialog_black_2"), __("door_dialog_black_3"), __("door_dialog_black_4"), __("door_dialog_black_5"), __("door_dialog_black_6"), __("door_dialog_black_7"), __("door_dialog_black_8"), __("door_dialog_black_9"), __("door_dialog_black_10") ];
                const idx = Math.min(Math.floor(game.doorDialogTimer / 90), dl.length - 1);
                ctx.fillStyle = game.doorDialog === "white" ? "#fff" : "#f44";
                ctx.font = '24px "Fredoka One"';
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                for (let i = 0; i <= idx && i < dl.length; i++) {
                    ctx.fillText(dl[i], VIEW_W / 2, VIEW_H / 2 - 60 + i * 38);
                }
                if (idx >= dl.length - 1 && game.doorDialogTimer > dl.length * 90 + 40) {
                    ctx.font = '16px "Courier Prime"';
                    ctx.fillStyle = "#888";
                    ctx.fillText(__("msg_puntos"), VIEW_W / 2, VIEW_H / 2 + dl.length * 20);
                    if (game.doorDialogTimer > dl.length * 90 + 120) {
                        game.doorDialog = null;
                        game.doorDialogTimer = 0;
                        if (currentBGM) {
                            currentBGM.pause();
                            currentBGM.volume = (window.isMusicMuted && window.isMusicMuted()) ? 0 : (typeof window.getMusicVolume === "function" ? window.getMusicVolume() : 1);
                        }
                        gameState = "ending";
                        game.endingTimer = 0;
                        game.endingStep = 0;
                        game.player.x = VIEW_W / 2 - game.player.w / 2;
                        game.player.y = 440;
                        game.player.frozen = true;
                        bfShow = true;
                        bfTargetX = VIEW_W / 2;
                        bfTargetY = VIEW_H / 2;
                        getBlackoutDiv().style.opacity = 1;
                        window.showAnimatedMessage(__("msg_puntos"));
                    }
                }
                ctx.restore();
                return;
            }
            if (!game.doorDialog && !game.player.frozen) {
                let nearDoor = null;
                if (game.player.x + game.player.w > whiteX - 30 && game.player.x < whiteX + doorW + 30 && game.player.y + game.player.h > 360 && game.player.y < 500) {
                    nearDoor = "white";
                    ctx.fillStyle = `rgba(255,255,255,${.6 + Math.sin(game.holeTimer * .08) * .3})`;
                    ctx.font = '18px "Fredoka One"';
                    ctx.textAlign = "center";
                    ctx.fillText(__("ui_press_interact"), whiteX + doorW / 2 - cameraX, 340);
                    if (keys[" "] || keys["Spacebar"]) {
                        game.doorDialog = "white";
                        game.doorDialogTimer = 0;
                        game.player.frozen = true;
                        delete keys[" "];
                        delete keys["Spacebar"];
                    }
                }
                if (game.player.x + game.player.w > blackX - 30 && game.player.x < blackX + doorW + 30 && game.player.y + game.player.h > 360 && game.player.y < 500) {
                    nearDoor = "black";
                    ctx.fillStyle = `rgba(255,100,100,${.6 + Math.sin(game.holeTimer * .08) * .3})`;
                    ctx.font = '18px "Fredoka One"';
                    ctx.textAlign = "center";
                    ctx.fillText(__("ui_press_interact"), blackX + doorW / 2 - cameraX, 340);
                    if (keys[" "] || keys["Spacebar"]) {
                        game.doorDialog = "black";
                        game.doorDialogTimer = 0;
                        game.player.frozen = true;
                        delete keys[" "];
                        delete keys["Spacebar"];
                    }
                }
            }
            ctx.restore();
            return;
        }
        if (game.flashMode && Math.random() > .92) {
            ctx.fillStyle = "rgba(255,255,255,0.25)";
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        }
        if (game.lvl4State === "falling") {
            ctx.strokeStyle = "rgba(255,255,255,0.5)";
            ctx.lineWidth = 2;
            for (let i = 0; i < 12; i++) {
                const lx = (i * 97 + time * 13 % 97) % VIEW_W;
                const ly = (time * 31 + i * 137) % VIEW_H;
                ctx.beginPath();
                ctx.moveTo(lx, ly);
                ctx.lineTo(lx, ly + 60 + Math.random() * 60);
                ctx.stroke();
            }
        }
        if (blood.length > MAX_BLOOD) blood.splice(0, blood.length - MAX_BLOOD);
        let bWrite = 0;
        for (let i = 0; i < blood.length; i++) {
            let b = blood[i];
            b.x += b.vx;
            b.y += b.vy;
            b.vy += .4;
            b.life--;
            if (b.life > 0) {
                const bsx = b.x - cameraX;
                if (bsx >= -30 && bsx <= VIEW_W + 30) {
                    ctx.fillStyle = b.color;
                    ctx.fillRect(bsx, b.y, 5, 5);
                }
                blood[bWrite++] = b;
            }
        }
        blood.length = bWrite;
        if (game.inHunt || game.lvl4State === "hunt") {
            slashes.forEach(s => {
                s.t++;
            });
            slashes.forEach(s => {
                const prog = s.t / 7;
                const alpha = Math.max(0, 1 - prog);
                const bright = alpha > .5;
                const killScale = 1 + (game.huntKills || 0) / 8 * .8;
                const dir = s.facing;
                const baseX = game.player.x - cameraX + (dir > 0 ? game.player.w * .35 : game.player.w * .65);
                const baseY = game.player.y + game.player.h * .4;
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.translate(baseX, baseY);
                if (dir < 0) ctx.scale(-1, 1);
                ctx.scale(killScale, killScale);
                ctx.shadowColor = "#fff";
                ctx.shadowBlur = bright ? 22 + (game.huntKills || 0) * 2 : 12;
                const bloodAlpha = Math.min(1, .4 + (game.huntKills || 0) / 8 * .5);
                ctx.strokeStyle = `rgba(225, 29, 72, ${alpha * bloodAlpha})`;
                ctx.lineWidth = 32;
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(-18, -38);
                ctx.quadraticCurveTo(35, -20, 58, 28);
                ctx.stroke();
                ctx.strokeStyle = bright ? "rgba(255, 255, 255, 0.95)" : "rgba(254, 205, 211, 0.8)";
                ctx.lineWidth = 18;
                ctx.beginPath();
                ctx.moveTo(-12, -32);
                ctx.quadraticCurveTo(38, -16, 52, 24);
                ctx.stroke();
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.moveTo(-8, -30);
                ctx.quadraticCurveTo(40, -14, 50, 22);
                ctx.stroke();
                ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
                ctx.lineWidth = 8;
                ctx.beginPath();
                ctx.moveTo(8, 22);
                ctx.quadraticCurveTo(46, 0, 68, -14);
                ctx.stroke();
                if (s.t <= 3) {
                    ctx.save();
                    ctx.translate(45, -5);
                    ctx.fillStyle = "#ffffff";
                    ctx.shadowColor = "#ff1744";
                    ctx.shadowBlur = 14;
                    ctx.fillRect(-12, -2, 24, 4);
                    ctx.fillRect(-2, -12, 4, 24);
                    ctx.shadowBlur = 0;
                    ctx.restore();
                }
                if ((game.huntKills || 0) >= 1) {
                    ctx.fillStyle = "#b91c1c";
                    for (let sp = 0; sp < 4; sp++) {
                        const spAng = -.4 + sp * .35;
                        const spDist = 35 + sp * 10;
                        ctx.beginPath();
                        ctx.arc(Math.cos(spAng) * spDist, Math.sin(spAng) * spDist, 2.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                ctx.restore();
            });
            slashes = slashes.filter(s => s.t < 7);
        }
        if (game.lvl4State === "hunt") {
            const d = game.dread || 0;
            if (d > 0) {
                ctx.fillStyle = "rgba(150,0,0," + d * .55 + ")";
                ctx.fillRect(0, 0, VIEW_W, VIEW_H);
                ctx.fillStyle = "rgba(0,0,0," + d * .5 + ")";
                ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            }
            if (d > 0 && Math.random() < d * .9) applyShake(2 + d * 16);
            if (d > .05 && Math.random() < d * .5) {
                ctx.fillStyle = "rgba(255,20,20," + d * .22 + ")";
                ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            }
        }
        if (currentLevel >= 2 && Math.random() > .98) {
            ctx.fillStyle = "rgba(255,255,255,0.1)";
            ctx.fillRect(0, Math.random() * VIEW_H, VIEW_W, 10 + Math.random() * 40);
            ctx.translate((Math.random() - .5) * 10, 0);
        }
        if (window.postGameHorror) {
            const grd = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H * .3, VIEW_W / 2, VIEW_H / 2, VIEW_W);
            grd.addColorStop(0, "rgba(0,0,0,0.2)");
            grd.addColorStop(1, "rgba(15,0,0,0.85)");
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            if (Math.random() > .95) {
                ctx.fillStyle = "rgba(255, 0, 0, 0.05)";
                ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            }
        }
        if (gameState === "ending") {
            game.endingTimer++;
            const et = game.endingTimer / 60;
            bfShow = true;
            bfAlpha = 1;
            bfTeeth = 1;
            bfLaugh = 1;
            bfEnraged = 1;
            bfTargetX = VIEW_W / 2;
            bfTargetY = VIEW_H * 0.38;
            bfPointerX += (bfTargetX - bfPointerX) * 0.08;
            bfPointerY += (bfTargetY - bfPointerY) * 0.08;

            if (et < 1) {
                blackoutDiv.style.opacity = Math.max(0, 1 - et * 2);
            } else if (et < 12.7) {
                blackoutDiv.style.opacity = 0;
            }

            if (et >= 1.0 && !game.endingMsg1) {
                game.endingMsg1 = true;
                window.showAnimatedMessage(__("ending_dialog_1"), true);
                playSound(160, 0.4, "sine", 0.3);
            }

            if (et >= 5.2 && !game.endingMsg2) {
                game.endingMsg2 = true;
                window.showAnimatedMessage(__("ending_dialog_2"), true);
                playSound(120, 0.5, "sine", 0.3);
            }

            if (et >= 9.2 && !game.endingMsg3) {
                game.endingMsg3 = true;
                window.showAnimatedMessage(__("ending_dialog_3"), true);
                playSound(70, 0.6, "sawtooth", 0.4);
            }

            if (et >= 11.2 && !game.endingSwallowInit) {
                game.endingSwallowInit = true;
                try {
                    gsap.to(getMessageDiv(), {
                        scale: 0,
                        opacity: 0,
                        duration: 0.25
                    });
                } catch (e) {}
            }

            if (et >= 11.2 && et < 12.6) {
                const suckProgress = (et - 11.2) / 1.4;
                bfShock = Math.min(2.5, suckProgress * 2.5);
                bfLaugh = 1 + suckProgress;
                const mouthTargetX = VIEW_W / 2;
                const mouthTargetY = VIEW_H * 0.42;
                if (game.player) {
                    game.player.x += (mouthTargetX - (game.player.x + game.player.w / 2)) * 0.12;
                    game.player.y += (mouthTargetY - (game.player.y + game.player.h / 2)) * 0.12;
                    game.player.scaleX = Math.max(0.1, 1 - suckProgress * 0.85);
                    game.player.scaleY = Math.max(0.1, 1 - suckProgress * 0.85);
                }
                applyShake(8 + suckProgress * 25);
            } else if (et >= 12.6 && !game.endingChompDone) {
                game.endingChompDone = true;
                bfShock = 0;
                bfTeeth = 1;
                bfLaugh = 2.5;
                if (game.player) {
                    game.player.eaten = true;
                    game.player.hidden = true;
                    game.player.y = -9999;
                }
                applyShake(40);
                playSFX("sfx_demon_scream");
                playSound(40, 1.2, "sawtooth", 0.85, 15);
            }

            if (et >= 12.7) {
                blackoutDiv.style.opacity = Math.min(1, (et - 12.7) * 1.5);
            }

            if (et >= 14.5 && !game.endingDone) {
                game.endingDone = true;
                try {
                    (typeof window !== "undefined" && typeof window.storageSet === "function" ? window.storageSet : (k, v) => localStorage.setItem(k, v))("starcube_horror_mode", "true");
                    window.postGameHorror = true;
                } catch (e) {}
                window.loadHubLevel();
            }
        }
        ctx.restore();
        if (game.pixelTransitionProgress != null && game.pixelTransitionProgress > 0 && game.pixelTransitionProgress < 1 && currentLevel === 1) {
            ctx.save();
            ctx.translate(VIEW_W / 2, VIEW_H / 2);
            const rTime = Date.now() * .005;
            ctx.rotate(rTime);
            const radius = 60 + game.pixelTransitionProgress * 200;
            const alpha = 1 - game.pixelTransitionProgress;
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = "#00ffff";
            ctx.lineWidth = 8;
            ctx.shadowColor = "#00ffff";
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2 * game.pixelTransitionProgress);
            ctx.stroke();
            ctx.rotate(-rTime * 2);
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            for (let i = 0; i < 3; i++) {
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, radius * .8, i * Math.PI * 2 / 3, i * Math.PI * 2 / 3 + .5);
            }
            ctx.fill();
            ctx.restore();
        }
        if ((game.pixelMode || game.pixelTransitionProgress > 0) && currentLevel === 1) {
            let pixelSize = 5;
            if (game.pixelTransitionProgress != null && game.pixelTransitionProgress < 1) {
                pixelSize = 1 + game.pixelTransitionProgress * 4;
                if (pixelSize < 1.2) pixelSize = 1;
            }
            if (pixelSize > 1) {
                const pw = Math.ceil(VIEW_W / pixelSize);
                const ph = Math.ceil(VIEW_H / pixelSize);
                const perfScale = typeof window.PerfQuality !== "undefined" ? window.PerfQuality.pixelScale : 1;
                const sw = Math.max(48, Math.ceil(pw * perfScale));
                const sh = Math.max(32, Math.ceil(ph * perfScale));
                if (!_pixelTempCanvas) {
                    _pixelTempCanvas = document.createElement("canvas");
                    _pixelTempCtx = _pixelTempCanvas.getContext("2d");
                }
                _pixelTempCanvas.width = sw;
                _pixelTempCanvas.height = sh;
                const tctx = _pixelTempCtx;
                tctx.imageSmoothingEnabled = false;
                tctx.drawImage(canvas, 0, 0, sw, sh);
                ctx.save();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.imageSmoothingEnabled = false;
                ctx.clearRect(0, 0, canvas.width || VIEW_W, canvas.height || VIEW_H);
                ctx.drawImage(_pixelTempCanvas, 0, 0, sw, sh, 0, 0, canvas.width || VIEW_W, canvas.height || VIEW_H);
                ctx.imageSmoothingEnabled = true;
                ctx.restore();
                ctx.fillStyle = "rgba(0,0,0,0.15)";
                for (let s = 0; s < VIEW_H; s += 4) {
                    ctx.fillRect(0, s, VIEW_W, 2);
                }
            }
        }
        if (gameState === "playing" && game.player && !game.hideHealthBar) {
            drawHealthBar(ctx, game.player.health, PLAYER_MAX_HEALTH, time);
        }
        if (gameState === "playing" && currentLevel === 1 && game.invertControls && typeof window.drawInvertControlsHUD === "function") {
            window.drawInvertControlsHUD(ctx, time);
        }
        if (gameState === "playing" && currentLevel === 3 && game.stormMode && typeof window.updateAndDrawStorm === "function") {
            window.updateAndDrawStorm(ctx, cameraX, time, game.player);
        }
        if (gameState === "playing" && typeof window.drawInkSplatter === "function") {
            window.drawInkSplatter(ctx);
        }
        if (typeof window.drawBossPresentation === "function") {
            window.drawBossPresentation(ctx);
        }
        if (typeof window.updateAndDrawBossDefeats === "function") {
            window.updateAndDrawBossDefeats(ctx, cameraX);
        }
        
        if (typeof drawCinematicEffects === "function") {
            drawCinematicEffects(ctx, VIEW_W, VIEW_H, screenShake ? screenShake.intensity : 0);
        }
    }
    function gameLoop(now) {
        requestAnimationFrame(gameLoop);
        if (now == null) now = performance.now();
        if (typeof window.pollGamepad === "function") {
            window.pollGamepad();
        }
        if (!_hasFrameTime) {
            _lastFrameTime = now;
            _hasFrameTime = true;
            return;
        }
        let dt = now - _lastFrameTime;
        _lastFrameTime = now;
        if (dt > MAX_FRAME_DT) dt = MAX_FRAME_DT;
        if (window.GAME_PAUSED) {
            _acc = 0;
            return;
        }
        const timeScale = (typeof window._gameTimeScale === "number") ? window._gameTimeScale : 1;
        _acc += dt * timeScale;
        const stepsNeeded = Math.min(Math.floor(_acc / FRAME_INTERVAL), MAX_STEPS);
        for (let i = 0; i < stepsNeeded; i++) {
            _acc -= FRAME_INTERVAL;
            const isCatchUp = (i < stepsNeeded - 1);
            ctx = isCatchUp ? _dummyCtx : realCtx;
            try {
                step();
            } catch (stepErr) {
                console.error("[gameLoop step error]:", stepErr);
            }
        }
        ctx = realCtx;
        if (_acc >= FRAME_INTERVAL) _acc = _acc % FRAME_INTERVAL;
    }
    canvas.addEventListener("click", e => {
        if (game.techBoss && game.techBoss.showChoice) {
            const rect = canvas.getBoundingClientRect();
            const clickX = (e.clientX - rect.left) * (VIEW_W / rect.width);
            const clickY = (e.clientY - rect.top) * (VIEW_H / rect.height);
            const modalY = VIEW_H / 2 - 90;
            const btnY = modalY + 95;
            if (clickY >= btnY && clickY <= btnY + 45) {
                if (clickX >= VIEW_W / 2 - 140 && clickX <= VIEW_W / 2 - 20) {
                    game.techBoss.selectedOption = 0;
                    confirmTechBossChoice();
                    return;
                } else if (clickX >= VIEW_W / 2 + 20 && clickX <= VIEW_W / 2 + 140) {
                    game.techBoss.selectedOption = 1;
                    confirmTechBossChoice();
                    return;
                }
            }
        }
        if (gameState === "introStory") {
            if (typeof window.handleIntroInput === "function") {
                window.handleIntroInput("click");
            }
            return;
        }
        if (gameState === "preNivel4") {
            let lines = [ __("story_prenivel4_1"), __("story_prenivel4_2"), __("story_prenivel4_3"), "", __("story_prenivel4_5"), "", __("story_prenivel4_7"), __("story_prenivel4_9"), __("story_prenivel4_10"), "", __("story_prenivel4_11"), __("story_prenivel4_12") ];
            const fullLine = lines[game.storyLine] || "";
            if (game.storyChar >= fullLine.length) {
                if (game.storyLine < lines.length - 1) {
                    game.storyLine++;
                    game.storyChar = 0;
                    game.storyTimer = 0;
                    game.storyHold = 0;
                } else {
                    game.storyHold = 9999;
                }
            } else {
                game.storyChar = fullLine.length;
                game.storyHold = 0;
            }
        }
    });
    window.triggerTechBridgeCinematic = function() {
        if (!game.player || typeof gsap === "undefined") return;
        game.player.frozen = true;
        game.player.vx = 0;
        if (typeof game.player.dashTimer === "number") game.player.dashTimer = 0;
        
        const drones = (game.platforms || []).filter(p => p.isTechDrone).sort((a, b) => (a.techDroneIndex || 0) - (b.techDroneIndex || 0));
        drones.forEach(d => {
            d.active = false;
            d.y = -500;
            d._cinematicDescending = false;
        });
        const chasmCenter = 13150;
        const targetCamX = chasmCenter - VIEW_W / 2;
        
        try {
            gsap.killTweensOf(game);
        } catch (e) {}
        
        try {
            playSound(400, 0.2, "triangle", 0.3, 800);
        } catch (e) {}
        
        gsap.to(game, {
            cameraOverrideX: targetCamX,
            duration: 1.1,
            ease: "power2.inOut",
            onComplete: () => {
                drones.forEach((drone, idx) => {
                    setTimeout(() => {
                        drone._cinematicDescending = true;
                        drone.active = true;
                        drone.y = -120;
                        try {
                            playSound(180 + idx * 40, 0.35, "sawtooth", 0.35, 450);
                        } catch (e) {}
                        gsap.to(drone, {
                            y: drone.originY,
                            duration: 0.65,
                            ease: "bounce.out",
                            onComplete: () => {
                                drone._cinematicDescending = false;
                                drone.active = true;
                                if (typeof applyShake === "function") applyShake(5);
                                try {
                                    playSound(350, 0.15, "triangle", 0.2, 700);
                                } catch (e) {}
                                if (typeof createExplosion === "function") {
                                    createExplosion(drone.x + drone.w / 2, drone.originY + drone.h, "#00ffcc", 20, 10, ["#ffffff", "#00e5ff", "#38bdf8"]);
                                }
                            }
                        });
                    }, idx * 280);
                });
                
                const totalDeployTime = drones.length * 280 + 750;
                setTimeout(() => {
                    game.techBridgeActive = true;
                    game.techBridgeCinematic = false;
                    if (typeof applyShake === "function") applyShake(8);
                    try {
                        playSound(523, 0.15, "triangle");
                        setTimeout(() => playSound(659, 0.15, "triangle"), 90);
                        setTimeout(() => playSound(784, 0.25, "triangle"), 180);
                    } catch (e) {}
                    if (typeof addFloatingText === "function") {
                        addFloatingText(chasmCenter, 340, typeof __ === "function" ? __("flt_dron_activadas") : "¡PLATAFORMAS DRON ACTIVADAS!", "#00ffcc", 24);
                    }
                    
                    setTimeout(() => {
                        const returnCamX = game.player.x - VIEW_W / 2 + 100;
                        gsap.to(game, {
                            cameraOverrideX: returnCamX,
                            duration: 1.1,
                            ease: "power2.inOut",
                            onComplete: () => {
                                delete game.cameraOverrideX;
                                delete game.cameraOverrideY;
                                game.player.frozen = false;
                            }
                        });
                    }, 1000);
                }, totalDeployTime);
            }
        });
    };
    window.loadLevel = loadLevel;
    window.messageDiv = messageDiv;
    window.choiceDiv = choiceDiv;
    window.blackoutDiv = blackoutDiv;
    requestAnimationFrame(gameLoop);
})();
