let bgParticles = [];

function initBgParticles() {
    bgParticles = [];
    const budget = typeof window !== "undefined" && window.PerfQuality && window.PerfQuality.maxBg || 40;
    for (let i = 0; i < budget; i++) {
        bgParticles.push({
            x: Math.random() * VIEW_W,
            y: Math.random() * VIEW_H,
            size: 2 + Math.random() * 4,
            vx: (Math.random() - .5) * .8,
            vy: .3 + Math.random() * .8,
            alpha: .3 + Math.random() * .6,
            rot: Math.random() * Math.PI * 2
        });
    }
}

initBgParticles();

const shootingStars = [];

let shootingStarSpawnTimer = 0;

window.spawnShootingStar = function(customX, customY, colorTheme) {
    const themes = [ {
        head: "#ffffff",
        tail: "rgba(244, 114, 182, "
    }, {
        head: "#ffffff",
        tail: "rgba(56, 189, 248, "
    }, {
        head: "#ffffff",
        tail: "rgba(253, 224, 71, "
    }, {
        head: "#ffffff",
        tail: "rgba(192, 132, 252, "
    } ];
    const theme = colorTheme || themes[Math.floor(Math.random() * themes.length)];
    const startX = customX !== undefined ? customX : Math.random() * VIEW_W * .75 - 40;
    const startY = customY !== undefined ? customY : Math.random() * (VIEW_H * .35) + 10;
    const speed = 14 + Math.random() * 7;
    const angle = .42 + Math.random() * .22;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const len = 75 + Math.random() * 85;
    shootingStars.push({
        x: startX,
        y: startY,
        vx: vx,
        vy: vy,
        len: len,
        head: theme.head,
        tailBase: theme.tail,
        life: 0,
        maxLife: 42 + Math.floor(Math.random() * 24)
    });
};

window.spawnShootingStarsBurst = function(count = 3) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            if (typeof window.spawnShootingStar === "function") {
                window.spawnShootingStar(Math.random() * VIEW_W * .6 - 20, Math.random() * (VIEW_H * .3) + 15);
            }
        }, i * 320);
    }
};

const _skyGradientCache = {};

function getSkyGradient(ctx, key, stops) {
    let g = _skyGradientCache[key];
    if (!g) {
        g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
        for (const stop of stops) g.addColorStop(stop[0], stop[1]);
        _skyGradientCache[key] = g;
    }
    return g;
}

function drawEnhancedBackground(ctx, level, camX, t, game) {
    if (window.postGameHorror) {
        const horrorSky = getSkyGradient(ctx, "postGameHorrorSky", [ [ 0, "#000000" ], [ .28, "#0a0202" ], [ .6, "#1a0303" ], [ 1, "#330505" ] ]);
        ctx.fillStyle = horrorSky;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        const moonX = VIEW_W * .72 - camX * .02 % (VIEW_W + 200);
        const moonY = 115;
        ctx.fillStyle = "rgba(220, 20, 20, 0.18)";
        ctx.beginPath();
        ctx.arc(moonX, moonY, 110, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(240, 40, 40, 0.14)";
        ctx.beginPath();
        ctx.arc(moonX, moonY, 70, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#991b1b";
        ctx.beginPath();
        ctx.arc(moonX, moonY, 44, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.arc(moonX - 5, moonY - 5, 36, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(20, 2, 2, 0.65)";
        ctx.beginPath();
        ctx.arc(moonX - 12, moonY - 8, 9, 0, Math.PI * 2);
        ctx.arc(moonX + 14, moonY + 10, 13, 0, Math.PI * 2);
        ctx.arc(moonX - 6, moonY + 16, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0f0203";
        ctx.beginPath();
        ctx.moveTo(0, VIEW_H);
        for (let px = 0; px <= VIEW_W + 40; px += 35) {
            const nx = px + camX * .04;
            const py = VIEW_H - 160 + Math.sin(nx * .014) * 45 + Math.cos(nx * .028) * 22;
            ctx.lineTo(px, py);
        }
        ctx.lineTo(VIEW_W, VIEW_H);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#060102";
        ctx.beginPath();
        for (let p = 0; p < 8; p++) {
            const spX = ((p * 175 - camX * .08) % (VIEW_W + 220) + VIEW_W + 220) % (VIEW_W + 220) - 80;
            const spH = 150 + p % 4 * 35;
            ctx.moveTo(spX, VIEW_H);
            ctx.lineTo(spX + 16, VIEW_H - spH);
            ctx.lineTo(spX + 32, VIEW_H);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(180, 25, 25, 0.09)";
        const fogY = VIEW_H - 110 + Math.sin(t * .03) * 16;
        ctx.fillRect(0, fogY, VIEW_W, 110);
        ctx.fillStyle = "rgba(255, 60, 60, 0.75)";
        ctx.beginPath();
        for (let c = 0; c < 20; c++) {
            const cx = (c * 47 + t * .5) % VIEW_W;
            const cy = (c * 37 + t * .85) % VIEW_H;
            ctx.rect(cx, cy, 2, 2);
        }
        ctx.fill();
        return;
    }
    if (game.isHub || level === "hub") {
        const cosmicSky = getSkyGradient(ctx, "cosmicHub", [ [ 0, "#03000a" ], [ .35, "#0e0524" ], [ .7, "#1e0842" ], [ 1, "#32065a" ] ]);
        ctx.fillStyle = cosmicSky;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        const neb1X = (VIEW_W * .35 - camX * .05) % (VIEW_W + 200);
        const neb1Grad = ctx.createRadialGradient(neb1X, VIEW_H * .3, 20, neb1X, VIEW_H * .3, 220);
        neb1Grad.addColorStop(0, "rgba(192, 132, 252, 0.2)");
        neb1Grad.addColorStop(.5, "rgba(126, 34, 206, 0.1)");
        neb1Grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = neb1Grad;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        const neb2X = (VIEW_W * .75 - camX * .08) % (VIEW_W + 300);
        const neb2Grad = ctx.createRadialGradient(neb2X, VIEW_H * .45, 30, neb2X, VIEW_H * .45, 260);
        neb2Grad.addColorStop(0, "rgba(56, 189, 248, 0.16)");
        neb2Grad.addColorStop(.6, "rgba(79, 70, 229, 0.08)");
        neb2Grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = neb2Grad;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        ctx.save();
        for (let i = 0; i < 65; i++) {
            const depth = i % 3 + 1;
            const starX = ((i * 37 - camX * (depth * .04)) % VIEW_W + VIEW_W) % VIEW_W;
            const starY = i * 29 % (VIEW_H - 90);
            const twinkle = Math.sin(t * .05 + i * 2.1) * .4 + .6;
            const starAlpha = (.2 + depth * .25) * twinkle;
            if (i % 7 === 0) {
                ctx.strokeStyle = "rgba(255, 255, 255, " + starAlpha + ")";
                ctx.lineWidth = 1;
                const arm = 3.5 + depth;
                ctx.beginPath();
                ctx.moveTo(starX - arm, starY);
                ctx.lineTo(starX + arm, starY);
                ctx.moveTo(starX, starY - arm);
                ctx.lineTo(starX, starY + arm);
                ctx.stroke();
                ctx.fillStyle = "rgba(224, 231, 255, " + starAlpha + ")";
                ctx.beginPath();
                ctx.arc(starX, starY, 1.5, 0, Math.PI * 2);
                ctx.fill();
            } else {
                const sCol = i % 3 === 0 ? "rgba(192, 132, 252, " : i % 3 === 1 ? "rgba(56, 189, 248, " : "rgba(255, 255, 255, ";
                ctx.fillStyle = sCol + starAlpha + ")";
                ctx.beginPath();
                ctx.arc(starX, starY, depth === 3 ? 1.8 : depth === 2 ? 1.2 : .8, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
        ctx.fillStyle = "rgba(20, 10, 42, 0.75)";
        ctx.beginPath();
        ctx.moveTo(0, VIEW_H);
        for (let px = 0; px <= VIEW_W; px += 40) {
            const nx = px + camX * .06;
            const py = VIEW_H - 120 + Math.sin(nx * .012) * 25 + Math.cos(nx * .025) * 15;
            ctx.lineTo(px, py);
        }
        ctx.lineTo(VIEW_W, VIEW_H);
        ctx.closePath();
        ctx.fill();
        bgParticles.forEach(p => {
            p.y -= p.vy * .45;
            p.x += Math.sin(t * .04 + p.y * .03) * .5;
            if (p.y < 0) {
                p.y = VIEW_H;
                p.x = Math.random() * VIEW_W;
            }
            const pCol = p.size > 3 ? "rgba(192, 132, 252, " : "rgba(56, 189, 248, ";
            ctx.fillStyle = pCol + p.alpha * .5 + ")";
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * .4, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
        return;
    }
    if (game.happyMode) {
        ctx.fillStyle = "#87CEEB";
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        return;
    }
    if (level === 0) {
        if (game.subCaveMode || camX >= 25e3 && game.player && game.player.x >= 27900) {
            const caveSky = getSkyGradient(ctx, "subCaveSky", [ [ 0, "#070509" ], [ .35, "#120d16" ], [ .7, "#1f1522" ], [ 1, "#0b080e" ] ]);
            ctx.fillStyle = caveSky;
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            ctx.fillStyle = "#140e18";
            ctx.beginPath();
            ctx.moveTo(0, VIEW_H);
            for (let rx = 0; rx <= VIEW_W + 80; rx += 40) {
                const rHeight = VIEW_H - 180 - Math.sin(rx * .02 + camX * .02) * 60 - Math.cos(rx * .05) * 30;
                ctx.lineTo(rx, rHeight);
            }
            ctx.lineTo(VIEW_W, VIEW_H);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#1b1320";
            for (let c = 0; c < 7; c++) {
                const cx = ((c * 190 - camX * .08) % (VIEW_W + 240) + VIEW_W + 240) % (VIEW_W + 240) - 120;
                const cw = 40 + c % 3 * 15;
                ctx.fillRect(cx, 0, cw, VIEW_H);
                ctx.strokeStyle = "#0e0912";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(cx + cw * .4, 0);
                ctx.lineTo(cx + cw * .4 + 6, VIEW_H * .5);
                ctx.lineTo(cx + cw * .3, VIEW_H);
                ctx.stroke();
            }
            ctx.fillStyle = "#18101c";
            ctx.strokeStyle = "#09060b";
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let st = -40; st < VIEW_W + 80; st += 45) {
                const hSt = 50 + Math.sin(st * .08 + camX * .04) * 35;
                ctx.moveTo(st, 0);
                ctx.lineTo(st + 22, hSt);
                ctx.lineTo(st + 45, 0);
            }
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "rgba(160, 140, 120, 0.25)";
            bgParticles.forEach(p => {
                p.y -= p.vy * .3;
                p.x += Math.sin(t * .02 + p.y * .02) * .5;
                if (p.y < -10) {
                    p.y = VIEW_H + 10;
                    p.x = Math.random() * VIEW_W;
                }
                ctx.fillRect(p.x, p.y, 1.5, 1.5);
            });
            return;
        }
        if (game.iceMode) {
            const iceSky = getSkyGradient(ctx, "ice_glacier_sky", [ [ 0, "#020b16" ], [ .3, "#061d33" ], [ .65, "#0c3556" ], [ 1, "#154e74" ] ]);
            ctx.fillStyle = iceSky;
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            ctx.fillStyle = "#ffffff";
            for (let s = 0; s < 35; s++) {
                const sx = (s * 47 + 13) % VIEW_W;
                const sy = (s * 29 + 7) % (VIEW_H * .45);
                const sAlpha = .35 + Math.sin(t * .04 + s) * .35;
                ctx.globalAlpha = Math.max(.1, sAlpha);
                ctx.fillRect(sx, sy, s % 3 === 0 ? 2 : 1.2, s % 3 === 0 ? 2 : 1.2);
            }
            ctx.globalAlpha = 1;
            ctx.save();
            for (let a = 0; a < 2; a++) {
                const aGrad = ctx.createLinearGradient(0, 40 + a * 30, 0, 180 + a * 40);
                if (a === 0) {
                    aGrad.addColorStop(0, "rgba(0, 255, 180, 0)");
                    aGrad.addColorStop(.5, "rgba(0, 240, 190, 0.16)");
                    aGrad.addColorStop(1, "rgba(0, 210, 255, 0)");
                } else {
                    aGrad.addColorStop(0, "rgba(40, 160, 255, 0)");
                    aGrad.addColorStop(.5, "rgba(120, 100, 255, 0.12)");
                    aGrad.addColorStop(1, "rgba(0, 255, 200, 0)");
                }
                ctx.fillStyle = aGrad;
                ctx.beginPath();
                ctx.moveTo(0, VIEW_H);
                for (let x = 0; x <= VIEW_W + 40; x += 30) {
                    const wave1 = Math.sin(x * .007 + t * .02 + a) * 35;
                    const wave2 = Math.cos(x * .015 - t * .015 + a * 2) * 20;
                    const ay = 60 + a * 35 + wave1 + wave2;
                    ctx.lineTo(x, ay);
                }
                ctx.lineTo(VIEW_W, VIEW_H);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
            const mtnBaseY = VIEW_H - 140;
            ctx.fillStyle = "#0a2238";
            ctx.beginPath();
            ctx.moveTo(0, VIEW_H);
            for (let i = 0; i <= VIEW_W + 120; i += 70) {
                const mx = i;
                const peakH = Math.sin((i + camX * .04) * .007) * 90 + Math.cos(i * .018) * 45;
                const my = mtnBaseY - 50 - peakH;
                ctx.lineTo(mx, my);
            }
            ctx.lineTo(VIEW_W, VIEW_H);
            ctx.fill();
            ctx.fillStyle = "rgba(235, 248, 255, 0.9)";
            ctx.beginPath();
            for (let i = 0; i <= VIEW_W + 120; i += 70) {
                const mx = i;
                const peakH = Math.sin((i + camX * .04) * .007) * 90 + Math.cos(i * .018) * 45;
                const my = mtnBaseY - 50 - peakH;
                ctx.moveTo(mx, my);
                ctx.lineTo(mx - 28, my + 38);
                ctx.lineTo(mx, my + 26);
                ctx.lineTo(mx + 28, my + 42);
                ctx.closePath();
            }
            ctx.fill();
            const glacGrad = ctx.createLinearGradient(0, VIEW_H - 180, 0, VIEW_H);
            glacGrad.addColorStop(0, "rgba(32, 95, 140, 0.85)");
            glacGrad.addColorStop(.5, "rgba(18, 58, 92, 0.95)");
            glacGrad.addColorStop(1, "#0b2640");
            ctx.fillStyle = glacGrad;
            ctx.beginPath();
            ctx.moveTo(0, VIEW_H);
            for (let i = 0; i <= VIEW_W + 80; i += 50) {
                const gx = i;
                const gy = VIEW_H - 95 - Math.sin((i + camX * .12) * .013) * 55 - Math.sin(i * .04) * 18;
                ctx.lineTo(gx, gy);
            }
            ctx.lineTo(VIEW_W, VIEW_H);
            ctx.fill();
            ctx.strokeStyle = "rgba(160, 230, 255, 0.55)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i <= VIEW_W + 80; i += 50) {
                const gx = i;
                const gy = VIEW_H - 95 - Math.sin((i + camX * .12) * .013) * 55 - Math.sin(i * .04) * 18;
                ctx.moveTo(gx - 20, gy + 4);
                ctx.lineTo(gx, gy);
                ctx.lineTo(gx + 16, gy + 26);
            }
            ctx.stroke();
            ctx.fillStyle = "rgba(215, 245, 255, 0.8)";
            ctx.beginPath();
            for (let i = 0; i <= VIEW_W + 80; i += 50) {
                const gx = i;
                const gy = VIEW_H - 95 - Math.sin((i + camX * .12) * .013) * 55 - Math.sin(i * .04) * 18;
                ctx.lineTo(gx, gy);
                ctx.lineTo(gx + 25, gy + 8);
                ctx.lineTo(gx - 25, gy + 8);
            }
            ctx.fill();
            const fogGrad = ctx.createLinearGradient(0, VIEW_H - 70, 0, VIEW_H);
            fogGrad.addColorStop(0, "rgba(170, 225, 255, 0)");
            fogGrad.addColorStop(1, "rgba(170, 225, 255, 0.22)");
            ctx.fillStyle = fogGrad;
            ctx.fillRect(0, VIEW_H - 70, VIEW_W, 70);
            bgParticles.forEach(p => {
                p.y += p.vy * 1.8;
                p.x += Math.sin(t * .06 + p.y * .02) * 2.2 - 1.2;
                if (p.y > VIEW_H + 10) {
                    p.y = -10;
                    p.x = Math.random() * (VIEW_W + 100);
                }
                if (p.x < -10) {
                    p.x = VIEW_W + 10;
                }
                const isBig = p.size > 4;
                ctx.fillStyle = isBig ? "#ffffff" : "rgba(210, 245, 255, 0.85)";
                if (isBig) {
                    ctx.shadowColor = "#00ffff";
                    ctx.shadowBlur = 6;
                }
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * .75, 0, Math.PI * 2);
                ctx.fill();
                if (isBig) ctx.shadowBlur = 0;
            });
            return;
        } else if (game.fireMode) {
            const fireSky = getSkyGradient(ctx, "fire0", [ [ 0, "#2a0005" ], [ .5, "#5e0b0b" ], [ 1, "#1a0000" ] ]);
            ctx.fillStyle = fireSky;
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            bgParticles.forEach(p => {
                p.y -= p.vy * 1.2;
                p.x += Math.sin(t * .08 + p.y * .03) * 1.8;
                if (p.y < -10) {
                    p.y = VIEW_H + 10;
                    p.x = Math.random() * VIEW_W;
                }
                ctx.fillStyle = p.y % 2 === 0 ? "#ff4400" : "#ffcc00";
                ctx.shadowColor = "#ff3300";
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * .85, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            });
            return;
        }
        const isNight = game.meadowNight || game.gate2Open && !game.subCaveMode && !game.iceMode && !game.fireMode;
        const nightTrans = game.nightTransitionProgress != null ? game.nightTransitionProgress : isNight ? 1 : 0;
        if (nightTrans > 0 && !game.fireMode && !game.iceMode && !game.subCaveMode) {
            if (nightTrans < 1) ctx.globalAlpha = nightTrans;
            const nightSky = getSkyGradient(ctx, "meadow_night_sky", [ [ 0, "#030712" ], [ .35, "#0b1329" ], [ .7, "#111e38" ], [ 1, "#1e293b" ] ]);
            ctx.fillStyle = nightSky;
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            ctx.fillStyle = "#ffffff";
            for (let s = 0; s < 50; s++) {
                const sx = (s * 53 + 17) % VIEW_W;
                const sy = (s * 31 + 11) % (VIEW_H * .55);
                const sAlpha = .3 + Math.sin(t * .05 + s) * .4;
                ctx.globalAlpha = Math.max(.1, sAlpha) * (nightTrans < 1 ? nightTrans : 1);
                ctx.fillRect(sx, sy, s % 4 === 0 ? 2 : 1.2, s % 4 === 0 ? 2 : 1.2);
            }
            ctx.globalAlpha = nightTrans < 1 ? nightTrans : 1;
            const moonX = VIEW_W * .82 - camX * .015 % 250;
            const moonY = 75 + (1 - nightTrans) * 300;
            const moonAura = ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, 110);
            moonAura.addColorStop(0, "rgba(224, 231, 255, 0.4)");
            moonAura.addColorStop(.4, "rgba(165, 180, 252, 0.15)");
            moonAura.addColorStop(1, "rgba(99, 102, 241, 0)");
            ctx.fillStyle = moonAura;
            ctx.beginPath();
            ctx.arc(moonX, moonY, 110, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#f8fafc";
            ctx.beginPath();
            ctx.arc(moonX, moonY, 28, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(203, 213, 225, 0.5)";
            ctx.beginPath();
            ctx.arc(moonX - 6, moonY - 5, 6, 0, Math.PI * 2);
            ctx.arc(moonX + 8, moonY + 4, 8, 0, Math.PI * 2);
            ctx.arc(moonX - 4, moonY + 9, 5, 0, Math.PI * 2);
            ctx.fill();
            shootingStarSpawnTimer++;
            const inMeadowToBossRange = camX >= 6500 && camX <= 10400;
            const spawnInterval = inMeadowToBossRange ? 75 : 125;
            if (shootingStarSpawnTimer >= spawnInterval) {
                shootingStarSpawnTimer = 0;
                if (Math.random() < .88) {
                    window.spawnShootingStar();
                }
            }
            for (let i = shootingStars.length - 1; i >= 0; i--) {
                const ss = shootingStars[i];
                ss.x += ss.vx;
                ss.y += ss.vy;
                ss.life++;
                const progress = ss.life / ss.maxLife;
                if (progress >= 1 || ss.x > VIEW_W + 160 || ss.y > VIEW_H + 50) {
                    shootingStars.splice(i, 1);
                    continue;
                }
                const fadeAlpha = progress < .15 ? progress / .15 : 1 - (progress - .15) / .85;
                const speedNorm = Math.hypot(ss.vx, ss.vy) || 1;
                const tailX = ss.x - ss.vx / speedNorm * ss.len;
                const tailY = ss.y - ss.vy / speedNorm * ss.len;
                const starGrad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
                starGrad.addColorStop(0, ss.tailBase + "0)");
                starGrad.addColorStop(.65, ss.tailBase + (fadeAlpha * .55).toFixed(3) + ")");
                starGrad.addColorStop(1, `rgba(255, 255, 255, ${(fadeAlpha * .95).toFixed(3)})`);
                ctx.save();
                ctx.strokeStyle = starGrad;
                ctx.lineWidth = 2.4;
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(tailX, tailY);
                ctx.lineTo(ss.x, ss.y);
                ctx.stroke();
                ctx.fillStyle = `rgba(255, 255, 255, ${fadeAlpha.toFixed(3)})`;
                ctx.beginPath();
                ctx.arc(ss.x, ss.y, 2.2, 0, Math.PI * 2);
                ctx.fill();
                if (Math.random() < .4) {
                    ctx.fillStyle = ss.tailBase + (fadeAlpha * .7).toFixed(3) + ")";
                    const sparkOffset = Math.random() * (ss.len * .6);
                    const spX = ss.x - ss.vx / speedNorm * sparkOffset + (Math.random() - .5) * 3;
                    const spY = ss.y - ss.vy / speedNorm * sparkOffset + (Math.random() - .5) * 3;
                    ctx.fillRect(spX, spY, 1.5, 1.5);
                }
                ctx.restore();
            }
            ctx.fillStyle = "rgba(15, 23, 42, 0.82)";
            ctx.beginPath();
            ctx.moveTo(0, VIEW_H);
            for (let i = 0; i <= VIEW_W + 100; i += 50) {
                const mx = i;
                const my = VIEW_H - 175 - Math.sin((i + camX * .04) * .007) * 75 - Math.cos(i * .02) * 35;
                ctx.lineTo(mx, my);
            }
            ctx.lineTo(VIEW_W, VIEW_H);
            ctx.fill();
            ctx.fillStyle = "rgba(6, 78, 59, 0.75)";
            ctx.beginPath();
            ctx.moveTo(0, VIEW_H);
            for (let i = 0; i <= VIEW_W + 80; i += 35) {
                const hx = i;
                const hy = VIEW_H - 125 - Math.sin((i + camX * .1) * .011) * 50 - Math.sin(i * .03) * 16;
                ctx.lineTo(hx, hy);
            }
            ctx.lineTo(VIEW_W, VIEW_H);
            ctx.fill();
            ctx.fillStyle = "rgba(4, 47, 46, 0.88)";
            for (let i = 15; i <= VIEW_W + 80; i += 70) {
                const px = i;
                const py = VIEW_H - 125 - Math.sin((i + camX * .1) * .011) * 50 - Math.sin(i * .03) * 16;
                ctx.beginPath();
                ctx.moveTo(px, py - 22);
                ctx.lineTo(px - 9, py + 2);
                ctx.lineTo(px + 9, py + 2);
                ctx.closePath();
                ctx.fill();
            }
            const meadowNightGrad = ctx.createLinearGradient(0, VIEW_H - 110, 0, VIEW_H);
            meadowNightGrad.addColorStop(0, "rgba(20, 83, 45, 0.92)");
            meadowNightGrad.addColorStop(1, "rgba(5, 46, 22, 0.98)");
            ctx.fillStyle = meadowNightGrad;
            ctx.beginPath();
            ctx.moveTo(0, VIEW_H);
            for (let i = 0; i <= VIEW_W + 60; i += 30) {
                const mx = i;
                const my = VIEW_H - 75 - Math.sin((i + camX * .2) * .015) * 35 - Math.cos(i * .04) * 12;
                ctx.lineTo(mx, my);
            }
            ctx.lineTo(VIEW_W, VIEW_H);
            ctx.fill();
            for (let i = 40; i <= VIEW_W + 60; i += 130) {
                const tx = i;
                const ty = VIEW_H - 75 - Math.sin((i + camX * .2) * .015) * 35 - Math.cos(i * .04) * 12;
                ctx.fillStyle = "rgba(28, 18, 10, 0.95)";
                ctx.fillRect(tx - 3, ty - 6, 6, 14);
                ctx.fillStyle = "rgba(6, 78, 59, 0.95)";
                ctx.beginPath();
                ctx.arc(tx, ty - 22, 16, 0, Math.PI * 2);
                ctx.arc(tx - 9, ty - 16, 12, 0, Math.PI * 2);
                ctx.arc(tx + 9, ty - 16, 12, 0, Math.PI * 2);
                ctx.fill();
            }
            bgParticles.forEach(p => {
                p.y -= p.vy * .35;
                p.x += Math.sin(t * .04 + p.y * .025) * .9;
                if (p.y < -10) {
                    p.y = VIEW_H + 10;
                    p.x = Math.random() * VIEW_W;
                }
                const glowPulse = .5 + Math.sin(t * .08 + p.x * .05) * .45;
                ctx.fillStyle = `rgba(217, 249, 157, ${(glowPulse * .85).toFixed(3)})`;
                ctx.fillRect(p.x, p.y, p.size * .7, p.size * .7);
            });
            ctx.globalAlpha = 1;
            if (nightTrans >= 1) return;
        }
        if (nightTrans > 0) ctx.globalAlpha = 1 - nightTrans;
        const skyGrad = getSkyGradient(ctx, "meadow_forest_v2", [ [ 0, "#2b86c5" ], [ .4, "#64b5f6" ], [ .72, "#b3e5fc" ], [ 1, "#fff6e0" ] ]);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        const sunX = VIEW_W * .82 - camX * .015 % 250;
        const sunY = 75 + nightTrans * 300;
        const sunAura = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 120);
        sunAura.addColorStop(0, "rgba(255, 250, 210, 0.95)");
        sunAura.addColorStop(.35, "rgba(255, 220, 130, 0.4)");
        sunAura.addColorStop(.7, "rgba(255, 205, 110, 0.15)");
        sunAura.addColorStop(1, "rgba(255, 200, 90, 0)");
        ctx.fillStyle = sunAura;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 120, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.translate(sunX, sunY);
        ctx.rotate(t * .003);
        ctx.fillStyle = "rgba(255, 245, 200, 0.05)";
        for (let r = 0; r < 8; r++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, 180, r * Math.PI / 4 - .12, r * Math.PI / 4 + .12);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
        ctx.fillStyle = "#FFF8D6";
        ctx.beginPath();
        ctx.arc(sunX, sunY, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(125, 152, 186, 0.5)";
        ctx.beginPath();
        ctx.moveTo(0, VIEW_H);
        for (let i = 0; i <= VIEW_W + 100; i += 50) {
            const mx = i;
            const my = VIEW_H - 175 - Math.sin((i + camX * .04) * .007) * 75 - Math.cos(i * .02) * 35;
            ctx.lineTo(mx, my);
        }
        ctx.lineTo(VIEW_W, VIEW_H);
        ctx.fill();
        ctx.fillStyle = "rgba(64, 138, 102, 0.72)";
        ctx.beginPath();
        ctx.moveTo(0, VIEW_H);
        for (let i = 0; i <= VIEW_W + 80; i += 35) {
            const hx = i;
            const hy = VIEW_H - 125 - Math.sin((i + camX * .1) * .011) * 50 - Math.sin(i * .03) * 16;
            ctx.lineTo(hx, hy);
        }
        ctx.lineTo(VIEW_W, VIEW_H);
        ctx.fill();
        ctx.fillStyle = "rgba(48, 115, 82, 0.8)";
        for (let i = 15; i <= VIEW_W + 80; i += 70) {
            const px = i;
            const py = VIEW_H - 125 - Math.sin((i + camX * .1) * .011) * 50 - Math.sin(i * .03) * 16;
            ctx.beginPath();
            ctx.moveTo(px, py - 22);
            ctx.lineTo(px - 9, py + 2);
            ctx.lineTo(px + 9, py + 2);
            ctx.closePath();
            ctx.fill();
        }
        const meadowGrad = ctx.createLinearGradient(0, VIEW_H - 110, 0, VIEW_H);
        meadowGrad.addColorStop(0, "rgba(88, 182, 74, 0.88)");
        meadowGrad.addColorStop(1, "rgba(46, 125, 50, 0.95)");
        ctx.fillStyle = meadowGrad;
        ctx.beginPath();
        ctx.moveTo(0, VIEW_H);
        for (let i = 0; i <= VIEW_W + 60; i += 30) {
            const mx = i;
            const my = VIEW_H - 75 - Math.sin((i + camX * .2) * .015) * 35 - Math.cos(i * .04) * 12;
            ctx.lineTo(mx, my);
        }
        ctx.lineTo(VIEW_W, VIEW_H);
        ctx.fill();
        for (let i = 40; i <= VIEW_W + 60; i += 130) {
            const tx = i;
            const ty = VIEW_H - 75 - Math.sin((i + camX * .2) * .015) * 35 - Math.cos(i * .04) * 12;
            ctx.fillStyle = "rgba(78, 52, 34, 0.9)";
            ctx.fillRect(tx - 3, ty - 6, 6, 14);
            ctx.fillStyle = "rgba(60, 155, 65, 0.9)";
            ctx.beginPath();
            ctx.arc(tx, ty - 22, 16, 0, Math.PI * 2);
            ctx.arc(tx - 9, ty - 16, 12, 0, Math.PI * 2);
            ctx.arc(tx + 9, ty - 16, 12, 0, Math.PI * 2);
            ctx.fill();
        }
        for (let i = 0; i < 6; i++) {
            const cx = (i * 260 + 60 - camX * .28 + t * .18) % (VIEW_W + 350) - 170;
            const cy = 45 + i % 3 * 42;
            const scale = .85 + i % 3 * .25;
            ctx.fillStyle = "rgba(195, 222, 245, 0.65)";
            ctx.beginPath();
            ctx.arc(cx, cy + 4, 30 * scale, 0, Math.PI * 2);
            ctx.arc(cx + 25 * scale, cy - 6 * scale, 24 * scale, 0, Math.PI * 2);
            ctx.arc(cx + 52 * scale, cy + 4, 28 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.beginPath();
            ctx.arc(cx, cy, 30 * scale, 0, Math.PI * 2);
            ctx.arc(cx + 25 * scale, cy - 10 * scale, 24 * scale, 0, Math.PI * 2);
            ctx.arc(cx + 50 * scale, cy, 28 * scale, 0, Math.PI * 2);
            ctx.arc(cx + 25 * scale, cy + 8 * scale, 22 * scale, 0, Math.PI * 2);
            ctx.fill();
        }
        bgParticles.forEach(p => {
            p.x += p.vx + Math.sin(t * .02 + p.y) * .35 + .25;
            p.y += p.vy * .6;
            if (p.y > VIEW_H) {
                p.y = -10;
                p.x = Math.random() * VIEW_W;
            }
            if (p.x > VIEW_W) p.x = 0;
            if (p.x < 0) p.x = VIEW_W;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot + t * .025);
            const pType = Math.floor(p.size) % 3;
            if (pType === 0) {
                ctx.globalAlpha = p.alpha * .85;
                ctx.fillStyle = "#66bb6a";
                ctx.beginPath();
                ctx.ellipse(0, 0, p.size * 1.6, p.size * .7, Math.PI / 4, 0, Math.PI * 2);
                ctx.fill();
            } else if (pType === 1) {
                ctx.globalAlpha = p.alpha * .8;
                ctx.fillStyle = "#ffb6c1";
                ctx.beginPath();
                ctx.ellipse(0, 0, p.size * 1.3, p.size * .8, 0, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.globalAlpha = p.alpha * .75;
                ctx.fillStyle = "#fff176";
                ctx.beginPath();
                ctx.arc(0, 0, p.size * .6, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });
        ctx.globalAlpha = 1;
    } else if (level === 1) {
        if (game.iceMode && currentLevel === 1) {
            const iceSky = getSkyGradient(ctx, "ice1", [ [ 0, "#031926" ], [ .5, "#0b3c5d" ], [ 1, "#001427" ] ]);
            ctx.fillStyle = iceSky;
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            bgParticles.forEach(p => {
                p.y += p.vy * 1.5;
                p.x += Math.sin(t * .05 + p.y * .02) * 1.5;
                if (p.y > VIEW_H) {
                    p.y = -10;
                    p.x = Math.random() * VIEW_W;
                }
                ctx.fillStyle = "#ffffff";
                ctx.shadowColor = "#00ffff";
                ctx.shadowBlur = 4;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * .7, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            });
            return;
        }
        const skyGrad = getSkyGradient(ctx, "tech", [ [ 0, "#061321" ], [ .6, "#0b2038" ], [ 1, "#05101a" ] ]);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        for (let i = 0; i < 8; i++) {
            const crysX = (i * 220 + 60 - camX * .08) % (VIEW_W + 200) - 100;
            const crysY = VIEW_H - 80;
            const pulse = .5 + Math.sin(t * .04 + i) * .3;
            ctx.fillStyle = `rgba(0, 220, 255, ${.15 + pulse * .15})`;
            ctx.shadowColor = "#00e5ff";
            ctx.shadowBlur = 10 * pulse;
            ctx.beginPath();
            ctx.moveTo(crysX, crysY);
            ctx.lineTo(crysX + 20, crysY - 180 - i % 3 * 40);
            ctx.lineTo(crysX + 50, crysY - 140);
            ctx.lineTo(crysX + 70, crysY);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        ctx.strokeStyle = "rgba(0, 180, 216, 0.18)";
        ctx.lineWidth = 1;
        const gridOffset = camX * .2 % 40;
        for (let x = -gridOffset; x < VIEW_W; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, VIEW_H);
            ctx.stroke();
        }
        for (let y = 0; y < VIEW_H; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(VIEW_W, y);
            ctx.stroke();
        }
        ctx.fillStyle = "rgba(15, 35, 55, 0.85)";
        for (let i = 0; i < 6; i++) {
            const px = (i * 320 + 100 - camX * .35) % (VIEW_W + 300) - 150;
            ctx.fillRect(px, 0, 45, VIEW_H);
            const bandY = (t * 2 + i * 80) % VIEW_H;
            ctx.fillStyle = "#00ffcc";
            ctx.shadowColor = "#00ffcc";
            ctx.shadowBlur = 5;
            ctx.fillRect(px, bandY, 45, 6);
            ctx.shadowBlur = 0;
            ctx.fillStyle = "rgba(15, 35, 55, 0.85)";
        }
        bgParticles.forEach(p => {
            p.y -= p.vy * .8;
            p.x += Math.sin(t * .03 + p.y * .05) * .5;
            if (p.y < -10) {
                p.y = VIEW_H + 10;
                p.x = Math.random() * VIEW_W;
            }
            ctx.fillStyle = `rgba(0, 229, 255, ${p.alpha})`;
            ctx.shadowColor = "#00e5ff";
            ctx.shadowBlur = 4;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            ctx.shadowBlur = 0;
        });
    } else if (level === 2) {
        let skyGrad;
        if (game.eruptingMode) {
            skyGrad = getSkyGradient(ctx, "erupting_fire", [ [ 0, "#4a0505" ], [ .4, "#aa2200" ], [ 1, "#ff5500" ] ]);
        } else {
            skyGrad = getSkyGradient(ctx, "fire", [ [ 0, "#1a0205" ], [ .5, "#400912" ], [ 1, "#120104" ] ]);
        }
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        if (game.eruptingMode || Math.random() > .985) {
            ctx.fillStyle = game.eruptingMode ? "rgba(255, 100, 50, 0.25)" : "rgba(255, 50, 50, 0.15)";
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        }
        for (let i = 0; i < 7; i++) {
            const volX = (i * 260 + 40 - camX * .08) % (VIEW_W + 300) - 150;
            const volY = VIEW_H;
            const glow = .5 + Math.sin(t * .05 + i) * .4;
            ctx.fillStyle = game.eruptingMode ? "rgba(50, 10, 15, 0.95)" : "rgba(30, 8, 12, 0.95)";
            ctx.beginPath();
            ctx.moveTo(volX, volY);
            const tipY = volY - 220 - i % 3 * 50;
            ctx.lineTo(volX + 40, tipY);
            ctx.lineTo(volX + 90, volY - 180);
            ctx.lineTo(volX + 130, volY);
            ctx.fill();
            if (game.eruptingMode) {
                ctx.fillStyle = "#ff8800";
                ctx.beginPath();
                ctx.arc(volX + 40, tipY, 15 + glow * 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#ff4400";
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.moveTo(volX + 40, tipY);
                ctx.lineTo(volX + 45, tipY + 60);
                ctx.lineTo(volX + 35, tipY + 120);
                ctx.stroke();
            }
            ctx.strokeStyle = game.eruptingMode ? `rgba(255, 100, 0, ${glow})` : `rgba(255, 60, 0, ${glow * .8})`;
            ctx.lineWidth = 3;
            ctx.shadowColor = "#ff3300";
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.moveTo(volX + 40, tipY);
            ctx.lineTo(volX + 55, volY - 120);
            ctx.lineTo(volX + 70, volY);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        ctx.fillStyle = "rgba(20, 5, 8, 0.85)";
        for (let i = 0; i < 5; i++) {
            const rx = (i * 350 + 120 - camX * .25) % (VIEW_W + 300) - 150;
            const ry = 80 + i % 3 * 60;
            ctx.fillRect(rx, ry, 120, 35);
            ctx.fillStyle = "#ff1a1a";
            ctx.shadowColor = "#ff0000";
            ctx.shadowBlur = 5;
            ctx.fillRect(rx + 20, ry + 12, 10, 10);
            ctx.fillRect(rx + 50, ry + 12, 10, 10);
            ctx.fillRect(rx + 80, ry + 12, 10, 10);
            ctx.shadowBlur = 0;
            ctx.fillStyle = "rgba(20, 5, 8, 0.85)";
        }
        bgParticles.forEach(p => {
            p.y -= p.vy * 1.4;
            p.x += Math.sin(t * .04 + p.y * .03) * 1.2;
            if (p.y < -10) {
                p.y = VIEW_H + 10;
                p.x = Math.random() * VIEW_W;
            }
            const emberCol = p.size > 3.5 ? "#ff3300" : p.size > 2.5 ? "#ff8800" : "#ffcc00";
            ctx.fillStyle = emberCol;
            ctx.shadowColor = "#ff4400";
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * .8, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });
    } else if (level === 3) {
        if (game.stormMode) {
            const stormSky = getSkyGradient(ctx, "storm_cumbres", [ [ 0, "#020617" ], [ .35, "#0b1329" ], [ .7, "#151d3b" ], [ 1, "#0e243d" ] ]);
            ctx.fillStyle = stormSky;
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            ctx.fillStyle = "rgba(8, 15, 30, 0.75)";
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (let cx = 0; cx <= VIEW_W; cx += 40) {
                const cy = 70 + Math.sin(cx * .015 + t * .02) * 22 + Math.cos(cx * .03 - t * .01) * 14;
                ctx.lineTo(cx, cy);
            }
            ctx.lineTo(VIEW_W, 0);
            ctx.closePath();
            ctx.fill();
        } else {
            const skyGrad = getSkyGradient(ctx, "ocean_cumbres", [ [ 0, "#041728" ], [ .4, "#09314d" ], [ .7, "#0d5073" ], [ 1, "#11708a" ] ]);
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        }
        ctx.fillStyle = game.stormMode ? "rgba(2, 10, 20, 0.95)" : "rgba(5, 25, 45, 0.9)";
        for (let i = 0; i < 7; i++) {
            const cliffX = (i * 260 + 30 - camX * .05) % (VIEW_W + 300) - 150;
            const cliffH = 140 + i % 3 * 45;
            ctx.beginPath();
            ctx.moveTo(cliffX, VIEW_H);
            ctx.lineTo(cliffX + 30, VIEW_H - cliffH);
            ctx.lineTo(cliffX + 80, VIEW_H - cliffH + 15);
            ctx.lineTo(cliffX + 130, VIEW_H - cliffH - 10);
            ctx.lineTo(cliffX + 180, VIEW_H);
            ctx.fill();
            if (i % 3 === 0) {
                const fx = cliffX + 30, fy = VIEW_H - cliffH;
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(fx - 3, fy - 16, 6, 16);
                ctx.fillStyle = "#ff4757";
                ctx.fillRect(fx - 3, fy - 12, 6, 4);
                const fAngle = t * .03 + i;
                const fGrad = ctx.createRadialGradient(fx, fy - 16, 1, fx, fy - 16, 45);
                fGrad.addColorStop(0, "rgba(255, 235, 100, 0.8)");
                fGrad.addColorStop(1, "rgba(255, 235, 100, 0)");
                ctx.fillStyle = fGrad;
                ctx.beginPath();
                ctx.arc(fx, fy - 16, 40, fAngle - .35, fAngle + .35);
                ctx.lineTo(fx, fy - 16);
                ctx.fill();
                ctx.fillStyle = "rgba(5, 25, 45, 0.9)";
            }
        }
        for (let i = 0; i < 8; i++) {
            const reefX = (i * 210 + 60 - camX * .16) % (VIEW_W + 250) - 120;
            const reefY = VIEW_H - 90;
            const pulse = .5 + Math.sin(t * .04 + i * 1.5) * .4;
            const coralColor = i % 3 === 0 ? "#ff4081" : i % 3 === 1 ? "#00e5ff" : "#b388ff";
            ctx.fillStyle = "rgba(10, 35, 60, 0.85)";
            ctx.beginPath();
            ctx.moveTo(reefX, reefY + 90);
            ctx.lineTo(reefX + 25, reefY - 30);
            ctx.lineTo(reefX + 60, reefY + 90);
            ctx.fill();
            ctx.strokeStyle = coralColor;
            ctx.lineWidth = 2.5;
            ctx.shadowColor = coralColor;
            ctx.shadowBlur = 8 * pulse;
            ctx.beginPath();
            ctx.moveTo(reefX + 25, reefY - 30);
            ctx.lineTo(reefX + 15, reefY - 60);
            ctx.lineTo(reefX + 5, reefY - 75);
            ctx.moveTo(reefX + 25, reefY - 30);
            ctx.lineTo(reefX + 38, reefY - 65);
            ctx.lineTo(reefX + 50, reefY - 78);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        ctx.fillStyle = "rgba(0, 220, 255, 0.4)";
        for (let f = 0; f < 10; f++) {
            const fishSpeed = 1.2 + f % 3 * .4;
            const fishX = ((f * 150 - camX * .28 - t * fishSpeed) % (VIEW_W + 100) + VIEW_W + 100) % (VIEW_W + 100) - 50;
            const fishY = 160 + f * 27 % 220 + Math.sin(t * .05 + f) * 8;
            ctx.beginPath();
            ctx.ellipse(fishX, fishY, 6, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(fishX + 5, fishY);
            ctx.lineTo(fishX + 9, fishY - 3);
            ctx.lineTo(fishX + 9, fishY + 3);
            ctx.closePath();
            ctx.fill();
        }
        bgParticles.forEach(p => {
            p.y -= p.vy * .9;
            p.x += Math.sin(t * .04 + p.y * .03) * .8;
            if (p.y < -10) {
                p.y = VIEW_H + 10;
                p.x = Math.random() * VIEW_W;
            }
            const bubbleR = Math.max(1.8, p.size * .7);
            ctx.save();
            ctx.strokeStyle = `rgba(120, 230, 255, ${p.alpha * .8})`;
            ctx.lineWidth = 1.2;
            ctx.fillStyle = `rgba(0, 210, 240, ${p.alpha * .25})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, bubbleR, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * .9})`;
            ctx.beginPath();
            ctx.arc(p.x - bubbleR * .35, p.y - bubbleR * .35, bubbleR * .3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    } else if (level === 6) {
        const hallowSky = getSkyGradient(ctx, "halloweenSky", [ [ 0, "#04010e" ], [ .32, "#110323" ], [ .65, "#250744" ], [ .88, "#3d0c5a" ], [ 1, "#58134a" ] ]);
        ctx.fillStyle = hallowSky;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        const moonX = (VIEW_W * .78 - camX * .018) % (VIEW_W + 200);
        const moonY = 110;
        const moonR = 52;
        ctx.fillStyle = "rgba(232, 121, 249, 0.08)";
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonR * 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(216, 180, 254, 0.16)";
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonR * 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fef08a";
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fffdf5";
        ctx.beginPath();
        ctx.arc(moonX - 10, moonY - 10, moonR * .75, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(196, 181, 253, 0.28)";
        ctx.beginPath();
        ctx.arc(moonX - 14, moonY - 8, 9, 0, Math.PI * 2);
        ctx.arc(moonX + 16, moonY + 12, 13, 0, Math.PI * 2);
        ctx.arc(moonX + 8, moonY - 18, 7, 0, Math.PI * 2);
        ctx.arc(moonX - 22, moonY + 14, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(15, 4, 32, 0.55)";
        ctx.beginPath();
        ctx.ellipse(moonX - 20 + Math.sin(t * .02) * 15, moonY + 8, 75, 12, -.1, 0, Math.PI * 2);
        ctx.ellipse(moonX + 28 + Math.cos(t * .02) * 15, moonY - 14, 60, 9, .08, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#090214";
        ctx.beginPath();
        for (let b = 0; b < 5; b++) {
            const batSpd = 1.3 + b % 3 * .4;
            const batX = ((b * 190 - camX * .12 - t * batSpd) % (VIEW_W + 120) + VIEW_W + 120) % (VIEW_W + 120) - 60;
            const batY = 65 + b * 32 % 110 + Math.sin(t * .08 + b) * 9;
            const wing = Math.sin(t * .35 + b * 2) * 6;
            ctx.moveTo(batX, batY);
            ctx.lineTo(batX - 7, batY - 4 - wing);
            ctx.lineTo(batX - 3, batY + 2);
            ctx.lineTo(batX, batY);
            ctx.lineTo(batX + 3, batY + 2);
            ctx.lineTo(batX + 7, batY - 4 - wing);
            ctx.lineTo(batX, batY);
        }
        ctx.fill();
        ctx.fillStyle = "#100324";
        const castleStep = 420;
        ctx.beginPath();
        for (let c = -1; c < 4; c++) {
            const cx = c * castleStep - camX * .06 % castleStep;
            ctx.rect(cx + 80, 220, 50, 240);
            ctx.moveTo(cx + 70, 220);
            ctx.lineTo(cx + 105, 130);
            ctx.lineTo(cx + 140, 220);
            ctx.rect(cx + 40, 260, 40, 200);
            ctx.rect(cx + 130, 260, 40, 200);
            ctx.rect(cx + 190, 240, 36, 220);
            ctx.moveTo(cx + 184, 240);
            ctx.lineTo(cx + 208, 165);
            ctx.lineTo(cx + 232, 240);
        }
        ctx.fill();
        for (let c = -1; c < 4; c++) {
            const cx = c * castleStep - camX * .06 % castleStep;
            const flicker = Math.sin(t * .12 + c * 3) * .25 + .75;
            ctx.fillStyle = `rgba(245, 158, 11, ${.65 * flicker})`;
            ctx.fillRect(cx + 98, 245, 6, 12);
            ctx.fillRect(cx + 106, 245, 6, 12);
            ctx.fillRect(cx + 54, 280, 5, 10);
            ctx.fillRect(cx + 204, 260, 5, 10);
        }
        const pumpkinStep = 460;
        for (let pk = -1; pk < 4; pk++) {
            const pkx = pk * pumpkinStep - camX * .1 % pumpkinStep;
            const pky = 375 + Math.abs(pk) % 2 * 20;
            const pkR = 34;
            const pkFlicker = Math.sin(t * .08 + pk * 2.3) * .15 + .85;
            ctx.fillStyle = `rgba(249, 115, 22, ${.16 * pkFlicker})`;
            ctx.beginPath();
            ctx.arc(pkx, pky, pkR * 1.7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(249, 115, 22, ${.3 * pkFlicker})`;
            ctx.beginPath();
            ctx.arc(pkx, pky, pkR * 1.25, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#180420";
            ctx.beginPath();
            ctx.ellipse(pkx, pky, pkR, pkR * .88, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#0d0212";
            ctx.fillRect(pkx - 3, pky - pkR * .88 - 8, 6, 10);
            ctx.fillStyle = `rgba(254, 240, 138, ${pkFlicker})`;
            ctx.beginPath();
            ctx.moveTo(pkx - 14, pky - 7);
            ctx.lineTo(pkx - 5, pky - 7);
            ctx.lineTo(pkx - 9, pky - 16);
            ctx.closePath();
            ctx.moveTo(pkx + 5, pky - 7);
            ctx.lineTo(pkx + 14, pky - 7);
            ctx.lineTo(pkx + 9, pky - 16);
            ctx.closePath();
            ctx.moveTo(pkx - 3, pky - 2);
            ctx.lineTo(pkx + 3, pky - 2);
            ctx.lineTo(pkx, pky - 6);
            ctx.closePath();
            ctx.moveTo(pkx - 18, pky + 6);
            ctx.quadraticCurveTo(pkx, pky + 23, pkx + 18, pky + 6);
            ctx.quadraticCurveTo(pkx, pky + 15, pkx - 18, pky + 6);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#180420";
            ctx.fillRect(pkx - 8, pky + 8, 4, 6);
            ctx.fillRect(pkx + 4, pky + 8, 4, 6);
            ctx.fillRect(pkx - 2, pky + 13, 4, 6);
        }
        ctx.fillStyle = "#090214";
        const treeStep = 320;
        ctx.beginPath();
        for (let tr = -1; tr < 5; tr++) {
            const tx = tr * treeStep - camX * .16 % treeStep;
            ctx.moveTo(tx + 40, 480);
            ctx.quadraticCurveTo(tx + 48, 380, tx + 38, 300);
            ctx.lineTo(tx + 44, 300);
            ctx.quadraticCurveTo(tx + 54, 380, tx + 56, 480);
            ctx.moveTo(tx + 40, 340);
            ctx.lineTo(tx + 10, 310);
            ctx.lineTo(tx + 4, 290);
            ctx.moveTo(tx + 42, 320);
            ctx.lineTo(tx + 75, 295);
            ctx.lineTo(tx + 95, 280);
            ctx.rect(tx + 90, 455, 16, 25);
            ctx.rect(tx + 86, 462, 24, 5);
            ctx.rect(tx + 130, 450, 18, 30);
        }
        ctx.fill();
        const fogGrad = getSkyGradient(ctx, "halloweenFog", [ [ 0, "rgba(88, 28, 135, 0)" ], [ .45, "rgba(107, 33, 168, 0.28)" ], [ 1, "rgba(46, 16, 101, 0.65)" ] ]);
        ctx.fillStyle = fogGrad;
        ctx.fillRect(0, VIEW_H - 125, VIEW_W, 125);
        const pCount = Math.min(bgParticles.length, 25);
        for (let idx = 0; idx < pCount; idx++) {
            const p = bgParticles[idx];
            p.y -= p.vy * .7;
            p.x += Math.sin(t * .04 + p.y * .04) * .8;
            if (p.y < -10) {
                p.y = VIEW_H + 10;
                p.x = Math.random() * VIEW_W;
            }
            const isOrange = idx % 3 === 0;
            const wispR = Math.max(1.5, p.size * .6);
            ctx.fillStyle = isOrange ? "rgba(249, 115, 22, 0.25)" : "rgba(192, 132, 252, 0.25)";
            ctx.beginPath();
            ctx.arc(p.x, p.y, wispR * 2.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = isOrange ? "#fb923c" : "#e879f9";
            ctx.beginPath();
            ctx.arc(p.x, p.y, wispR, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(p.x, p.y, wispR * .45, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}