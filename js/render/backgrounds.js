let bgParticles = [];

function initBgParticles() {
    bgParticles = [];
    const budget = typeof window !== "undefined" && window.PerfQuality && window.PerfQuality.maxBg !== undefined ? window.PerfQuality.maxBg : 40;
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
if (typeof window !== "undefined") {
    window.addEventListener("perfQualityChanged", () => {
        initBgParticles();
    });
}

const shootingStars = [];

let shootingStarSpawnTimer = 0;

window.spawnShootingStar = function(customX, customY, colorTheme) {
    if (typeof window !== "undefined" && window.PerfQuality && window.PerfQuality.level === "low") return;
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
const _radialGradCache = {};
const _auroraGradients = [];
let _techGridPattern = null;

function getSkyGradient(ctx, key, stops) {
    let g = _skyGradientCache[key];
    if (!g) {
        g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
        for (const stop of stops) g.addColorStop(stop[0], stop[1]);
        _skyGradientCache[key] = g;
    }
    return g;
}

function getAuroraGradient(ctx, a) {
    if (_auroraGradients[a]) return _auroraGradients[a];
    const aurora = ctx.createLinearGradient(0, 0, 0, 220 + a * 50);
    if (a === 0) {
        aurora.addColorStop(0, "rgba(50, 255, 180, 0.5)");
        aurora.addColorStop(0.5, "rgba(0, 180, 255, 0.2)");
        aurora.addColorStop(1, "rgba(0, 50, 255, 0)");
    } else if (a === 1) {
        aurora.addColorStop(0, "rgba(255, 50, 200, 0.3)");
        aurora.addColorStop(0.5, "rgba(150, 0, 255, 0.1)");
        aurora.addColorStop(1, "rgba(50, 0, 255, 0)");
    } else if (a === 2) {
        aurora.addColorStop(0, "rgba(0, 255, 255, 0.4)");
        aurora.addColorStop(0.5, "rgba(0, 150, 255, 0.1)");
        aurora.addColorStop(1, "rgba(0, 50, 150, 0)");
    } else {
        aurora.addColorStop(0, "rgba(255, 255, 100, 0.2)");
        aurora.addColorStop(0.5, "rgba(100, 255, 150, 0.1)");
        aurora.addColorStop(1, "rgba(0, 100, 50, 0)");
    }
    _auroraGradients[a] = aurora;
    return aurora;
}

function getTechGridPattern(ctx) {
    if (_techGridPattern) return _techGridPattern;
    try {
        const can = document.createElement("canvas");
        can.width = 60;
        can.height = 60;
        const c = can.getContext("2d");
        c.strokeStyle = "rgba(0, 255, 204, 0.12)";
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(0, 0); c.lineTo(60, 0);
        c.moveTo(0, 0); c.lineTo(0, 60);
        c.stroke();
        _techGridPattern = ctx.createPattern(can, "repeat");
    } catch (e) {}
    return _techGridPattern;
}

function drawIceGlacierBackground(ctx, camX, t, isBlizzard) {
    const isLow = typeof window !== "undefined" && window.PerfQuality && window.PerfQuality.level === "low";
    const iceSky = getSkyGradient(ctx, "ice_glacier_sky", [ [ 0, "#010310" ], [ .3, "#041026" ], [ .6, "#0a2a4f" ], [ 1, "#12517A" ] ]);
    ctx.fillStyle = iceSky;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    if (!isLow) {
        ctx.globalCompositeOperation = "screen";
        for (let a = 0; a < 4; a++) {
            const aurora = getAuroraGradient(ctx, a);
            ctx.fillStyle = aurora;
            ctx.beginPath();
            const step = 20;
            for (let x = 0; x <= VIEW_W + 60; x += step) {
                const wave1 = Math.sin(x * .008 + t * .015 + a * 1.5) * 60;
                const wave2 = Math.cos(x * .012 - t * .02 + a * 2) * 40;
                const wave3 = Math.sin(x * .02 + t * .04) * 15;
                const y = 60 + a * 25 + wave1 + wave2 + wave3;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(VIEW_W, 0);
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.fill();
        }
    }
    ctx.globalCompositeOperation = "source-over";

    ctx.fillStyle = "#ffffff";
    for (let s = 0; s < 70; s++) {
        const sx = (s * 73 + 17 - camX*0.005) % VIEW_W;
        if (sx < 0) continue;
        const sy = (s * 41 + 7) % (VIEW_H * .5);
        const sAlpha = .4 + Math.sin(t * .05 + s) * .5;
        const size = s % 4 === 0 ? 2.5 : 1.2;
        
        ctx.globalAlpha = Math.max(.1, sAlpha);
        ctx.beginPath();
        if (size > 2) {
            ctx.moveTo(sx, sy-size); ctx.lineTo(sx, sy+size);
            ctx.moveTo(sx-size, sy); ctx.lineTo(sx+size, sy);
            ctx.strokeStyle = "#fff"; ctx.lineWidth = 1; ctx.stroke();
        } else {
            ctx.fillRect(sx, sy, size, size);
        }
    }
    ctx.globalAlpha = 1;

    const mtnBaseY = VIEW_H - 120;
    ctx.fillStyle = "rgba(4, 15, 30, 0.95)";
    ctx.beginPath();
    ctx.moveTo(0, VIEW_H);
    for (let i = 0; i <= VIEW_W + 150; i += 40) {
        const mx = i;
        const peakH = Math.sin((i + camX * .02) * .01) * 140 + Math.cos((i + camX * 0.02) * .02) * 70;
        ctx.lineTo(mx, mtnBaseY - peakH);
    }
    ctx.lineTo(VIEW_W, VIEW_H);
    ctx.fill();

    ctx.fillStyle = "rgba(20, 60, 90, 0.9)";
    ctx.beginPath();
    for (let i = 0; i <= VIEW_W + 150; i += 50) {
        const mx = i - (camX * .05) % 50;
        const peakH = Math.sin((i + camX * .05) * .012) * 120 + Math.cos((i + camX * 0.05) * .025) * 60;
        const my = mtnBaseY + 20 - peakH;
        
        ctx.lineTo(mx, my);
    }
    ctx.lineTo(VIEW_W, VIEW_H);
    ctx.lineTo(0, VIEW_H);
    ctx.fill();
    
    ctx.fillStyle = "rgba(150, 220, 255, 0.6)";
    ctx.beginPath();
    for (let i = 0; i <= VIEW_W + 150; i += 50) {
        const mx = i - (camX * .05) % 50;
        const peakH = Math.sin((i + camX * .05) * .012) * 120 + Math.cos((i + camX * 0.05) * .025) * 60;
        const my = mtnBaseY + 20 - peakH;
        if (peakH > 60) {
            ctx.moveTo(mx, my);
            ctx.lineTo(mx - 25, my + 45);
            ctx.lineTo(mx, my + 25);
            ctx.lineTo(mx + 20, my + 50);
            ctx.closePath();
        }
    }
    ctx.fill();

    const glacGrad = ctx.createLinearGradient(0, VIEW_H - 180, 0, VIEW_H);
    glacGrad.addColorStop(0, "rgba(30, 90, 130, 0.95)");
    glacGrad.addColorStop(1, "#0A1F33");
    ctx.fillStyle = glacGrad;
    ctx.beginPath();
    ctx.moveTo(0, VIEW_H);
    for (let i = 0; i <= VIEW_W + 80; i += 30) {
        const gx = i;
        const gy = VIEW_H - 70 - Math.sin((i + camX * .1) * .015) * 55 - Math.cos((i + camX * 0.1) * .035) * 35;
        ctx.lineTo(gx, gy);
    }
    ctx.lineTo(VIEW_W, VIEW_H);
    ctx.fill();

    for (let i = 40; i <= VIEW_W + 160; i += 180) {
        const cx = i - (camX * .15) % 180;
        if (cx < -80 || cx > VIEW_W + 80) continue;
        const index = Math.floor(camX * .15 / 180) + (i - 40) / 180;
        const cy = VIEW_H - 30 - Math.sin(index * 180 * .02) * 60;
        const crysHeight = 120 + Math.cos(index)*40;

        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 25;
        
        ctx.fillStyle = "rgba(15, 65, 105, 0.85)";
        ctx.beginPath(); ctx.moveTo(cx, cy - crysHeight); ctx.lineTo(cx - 30, cy); ctx.lineTo(cx + 35, cy); ctx.fill();

        ctx.fillStyle = "rgba(100, 220, 255, 0.75)";
        ctx.beginPath(); ctx.moveTo(cx, cy - crysHeight); ctx.lineTo(cx, cy + 15); ctx.lineTo(cx + 35, cy); ctx.fill();
        
        ctx.fillStyle = "rgba(200, 255, 255, 0.9)";
        ctx.beginPath(); ctx.moveTo(cx, cy - crysHeight); ctx.lineTo(cx - 15, cy - 10); ctx.lineTo(cx, cy + 15); ctx.fill();
        
        ctx.shadowBlur = 0;
        
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, cy - crysHeight + 20); ctx.lineTo(cx, cy + 10); ctx.stroke();
    }

    const fogGrad = ctx.createLinearGradient(0, VIEW_H - 140, 0, VIEW_H);
    fogGrad.addColorStop(0, "rgba(150, 230, 255, 0)");
    fogGrad.addColorStop(0.5, "rgba(180, 240, 255, 0.25)");
    fogGrad.addColorStop(1, "rgba(220, 250, 255, 0.5)");
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, VIEW_H - 140, VIEW_W, 140);

    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath(); ctx.moveTo(0, VIEW_H);
    for(let w=0; w<=VIEW_W; w+=50) {
        ctx.lineTo(w, VIEW_H - 100 + Math.sin(w*0.01 + t*0.02)*30);
    }
    ctx.lineTo(VIEW_W, VIEW_H); ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 5;
    ctx.beginPath();
    bgParticles.forEach(p => {
        if (!isBlizzard) {
            p.y += p.vy * 1.5;
            p.x += Math.sin(t * .03 + p.y * .02) * 2;
            if (p.y > VIEW_H + 10) {
                p.y = -10;
                p.x = Math.random() * (VIEW_W + 100);
            }
            if (p.x < -10) p.x = VIEW_W + 10;
        }
        ctx.moveTo(p.x + p.size, p.y);
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    });
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawHorrorLevelBackground(ctx, level, camX, t, isLow) {
    const curW = ctx.canvas ? Math.max(VIEW_W, ctx.canvas.width) : VIEW_W;
    const curH = ctx.canvas ? Math.max(VIEW_H, ctx.canvas.height) : VIEW_H;
    ctx.fillStyle = "#020108";
    ctx.fillRect(-100, -50, curW + 200, curH + 100);
    if (level === 0) {
        const skyGrad = getSkyGradient(ctx, "horrorMeadowSky", [
            [ 0, "#08010f" ],
            [ 0.35, "#1b0324" ],
            [ 0.7, "#3b0213" ],
            [ 1, "#660707" ]
        ]);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);

        const moonX = VIEW_W * 0.78 - (camX * 0.015) % 250;
        const moonY = 135;
        const aura = ctx.createRadialGradient(moonX, moonY, 20, moonX, moonY, 240);
        aura.addColorStop(0, "rgba(220, 38, 38, 0.55)");
        aura.addColorStop(0.5, "rgba(127, 29, 29, 0.22)");
        aura.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 240, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ff1744";
        ctx.beginPath();
        ctx.arc(moonX, moonY, 52, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#050005";
        ctx.beginPath();
        ctx.ellipse(moonX, moonY, 22, 48, Math.sin(t * 0.02) * 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(75, 0, 0, 0.85)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let v = 0; v < 6; v++) {
            const vAng = v * (Math.PI / 3) + t * 0.01;
            ctx.moveTo(moonX + Math.cos(vAng) * 45, moonY + Math.sin(vAng) * 45);
            ctx.lineTo(moonX + Math.cos(vAng) * 110, moonY + Math.sin(vAng) * 110);
        }
        ctx.stroke();

        ctx.fillStyle = "#0c0409";
        ctx.beginPath();
        ctx.moveTo(0, VIEW_H);
        for (let i = 0; i <= VIEW_W + 100; i += 70) {
            const my = VIEW_H - 190 - Math.sin((i + camX * 0.05) * 0.007) * 90 - Math.cos((i + camX * 0.05) * 0.02) * 40;
            ctx.lineTo(i, my);
        }
        ctx.lineTo(VIEW_W, VIEW_H);
        ctx.fill();

        const hillGrad = getSkyGradient(ctx, "horrorMeadowHills", [
            [ 0, "#1f1412" ],
            [ 0.4, "#130909" ],
            [ 1, "#080202" ]
        ]);
        ctx.fillStyle = hillGrad;
        ctx.beginPath();
        ctx.moveTo(0, VIEW_H);
        for (let i = 0; i <= VIEW_W + 60; i += 50) {
            const my = VIEW_H - 105 - Math.sin((i + camX * 0.14) * 0.01) * 55 - Math.cos((i + camX * 0.14) * 0.025) * 20;
            ctx.lineTo(i, my);
        }
        ctx.lineTo(VIEW_W, VIEW_H);
        ctx.fill();

        for (let i = 30; i <= VIEW_W + 100; i += 120) {
            const tx = i - (camX * 0.14) % 120;
            if (tx < -60 || tx > VIEW_W + 60) continue;
            const index = Math.floor(camX * 0.14 / 120) + (i - 30) / 120;
            const ty = VIEW_H - 105 - Math.sin(index * 120 * 0.01) * 55 - Math.cos(index * 120 * 0.025) * 20;
            const sway = Math.sin(t * 0.03 + index) * 3;

            ctx.strokeStyle = "#050102";
            ctx.lineWidth = 9;
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.quadraticCurveTo(tx - 4, ty - 25, tx + sway, ty - 55);
            ctx.stroke();

            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(tx + sway, ty - 55);
            ctx.lineTo(tx + sway - 24, ty - 80);
            ctx.moveTo(tx + sway, ty - 55);
            ctx.lineTo(tx + sway + 22, ty - 82);
            ctx.moveTo(tx + sway, ty - 45);
            ctx.lineTo(tx + sway - 18, ty - 60);
            ctx.moveTo(tx + sway, ty - 45);
            ctx.lineTo(tx + sway + 18, ty - 62);
            ctx.stroke();

            ctx.fillStyle = "#991b1b";
            ctx.beginPath();
            ctx.arc(tx + sway - 8, ty - 38 + ((t * 0.8 + index * 20) % 35), 2.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#e2e8f0";
            ctx.beginPath();
            ctx.arc(tx + sway - 20, ty - 74, 3.5, 0, Math.PI * 2);
            ctx.arc(tx + sway + 18, ty - 76, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#050005";
            ctx.fillRect(tx + sway - 21.5, ty - 75, 1.2, 1.2);
            ctx.fillRect(tx + sway - 19.5, ty - 75, 1.2, 1.2);
            ctx.fillRect(tx + sway + 16.5, ty - 77, 1.2, 1.2);
            ctx.fillRect(tx + sway + 18.5, ty - 77, 1.2, 1.2);
        }

        ctx.fillStyle = "rgba(220, 38, 38, 0.75)";
        ctx.beginPath();
        for (let a = 0; a < (isLow ? 15 : 35); a++) {
            const ax = ((a * 67 + t * 0.8 - camX * 0.1) % (VIEW_W + 100) + VIEW_W + 100) % (VIEW_W + 100) - 50;
            const ay = (a * 43 + t * 1.1) % (VIEW_H + 50);
            ctx.rect(ax, ay, 2.5, 2.5);
        }
        ctx.fill();

    } else if (level === 1) {
        const vGrad = getSkyGradient(ctx, "horrorTechSky", [
            [ 0, "#010003" ],
            [ 0.4, "#0b0008" ],
            [ 0.75, "#25000c" ],
            [ 1, "#45000f" ]
        ]);
        ctx.fillStyle = vGrad;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);

        ctx.strokeStyle = "rgba(255, 0, 55, 0.35)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const gridHorizon = VIEW_H * 0.48;
        for (let x = -200; x <= VIEW_W + 200; x += 60) {
            const gx = x - (camX * 0.15) % 60;
            ctx.moveTo(gx, VIEW_H);
            ctx.lineTo(VIEW_W / 2 + (gx - VIEW_W / 2) * 0.1, gridHorizon);
        }
        for (let y = gridHorizon + 15; y <= VIEW_H; y += (y - gridHorizon) * 0.28 + 4) {
            ctx.moveTo(0, y);
            ctx.lineTo(VIEW_W, y);
        }
        ctx.stroke();

        const errWords = [ "0xDEAD", "KILL_PROC", "VIRUS_OVERFLOW", "CORRUPTED", "FATAL_PANIC", "NULL_PTR", "EXEC_FAIL" ];
        ctx.font = "bold 9px monospace";
        for (let p = 0; p < 7; p++) {
            const px = ((p * 180 - camX * 0.08) % (VIEW_W + 200) + VIEW_W + 200) % (VIEW_W + 200) - 80;
            const pw = 45, ph = 260;
            ctx.fillStyle = "#080104";
            ctx.strokeStyle = "#990011";
            ctx.lineWidth = 2;
            ctx.fillRect(px, gridHorizon - 80, pw, ph);
            ctx.strokeRect(px, gridHorizon - 80, pw, ph);

            ctx.fillStyle = "#ff1744";
            for (let line = 0; line < 12; line++) {
                const wIdx = (p + line + Math.floor(t * 0.05)) % errWords.length;
                ctx.fillText(errWords[wIdx], px + 4, gridHorizon - 60 + line * 16);
            }
        }

        if (Math.sin(t * 0.04) > 0.4) {
            ctx.save();
            ctx.strokeStyle = "rgba(255, 0, 80, 0.45)";
            ctx.lineWidth = 2;
            const skX = VIEW_W * 0.5 - (camX * 0.02) % 150;
            const skY = gridHorizon - 60;
            ctx.strokeRect(skX - 25, skY - 30, 50, 40);
            ctx.strokeRect(skX - 15, skY + 10, 30, 16);
            ctx.fillStyle = "#ff0033";
            ctx.fillRect(skX - 16, skY - 14, 10, 12);
            ctx.fillRect(skX + 6, skY - 14, 10, 12);
            for (let d = -10; d <= 10; d += 6) {
                ctx.strokeRect(skX + d - 2, skY + 14, 4, 8);
            }
            ctx.restore();
        }

        ctx.fillStyle = "rgba(255, 0, 0, 0.04)";
        for (let s = 0; s < VIEW_H; s += 8) {
            ctx.fillRect(0, s, VIEW_W, 2);
        }

    } else if (level === 2) {
        const mGrad = getSkyGradient(ctx, "horrorMagmaSky", [
            [ 0, "#080000" ],
            [ 0.35, "#220000" ],
            [ 0.7, "#4a0000" ],
            [ 1, "#750000" ]
        ]);
        ctx.fillStyle = mGrad;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);

        const volX = VIEW_W * 0.5 - (camX * 0.03) % (VIEW_W + 300);
        ctx.fillStyle = "#0c0202";
        ctx.beginPath();
        ctx.moveTo(volX - 240, VIEW_H);
        ctx.lineTo(volX - 50, VIEW_H - 220);
        ctx.lineTo(volX + 50, VIEW_H - 220);
        ctx.lineTo(volX + 240, VIEW_H);
        ctx.fill();

        const fissure = ctx.createLinearGradient(volX, VIEW_H - 220, volX, VIEW_H);
        fissure.addColorStop(0, "#ff1744");
        fissure.addColorStop(0.5, "#990000");
        fissure.addColorStop(1, "#220000");
        ctx.strokeStyle = fissure;
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(volX, VIEW_H - 215);
        ctx.lineTo(volX - 15, VIEW_H - 120);
        ctx.lineTo(volX + 20, VIEW_H - 40);
        ctx.lineTo(volX, VIEW_H);
        ctx.stroke();

        ctx.fillStyle = "rgba(255, 100, 100, 0.7)";
        ctx.beginPath();
        for (let s = 0; s < 18; s++) {
            const sx = ((s * 58 + Math.sin(t * 0.05 + s) * 20 - camX * 0.06) % VIEW_W + VIEW_W) % VIEW_W;
            const sy = VIEW_H - 40 - ((t * 1.4 + s * 30) % 240);
            ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
        }
        ctx.fill();

    } else if (level === 3) {
        const seaGrad = getSkyGradient(ctx, "horrorSeaSky", [
            [ 0, "#01050a" ],
            [ 0.4, "#07121c" ],
            [ 0.75, "#18202e" ],
            [ 1, "#260e18" ]
        ]);
        ctx.fillStyle = seaGrad;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);

        ctx.save();
        ctx.globalCompositeOperation = "screen";
        for (let a = 0; a < 2; a++) {
            const aY = 90 + a * 45;
            const aGrad = ctx.createLinearGradient(0, aY - 40, 0, aY + 60);
            aGrad.addColorStop(0, "rgba(0, 255, 150, 0)");
            aGrad.addColorStop(0.5, a === 0 ? "rgba(0, 255, 120, 0.25)" : "rgba(220, 38, 38, 0.2)");
            aGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = aGrad;
            ctx.beginPath();
            ctx.moveTo(0, aY);
            for (let x = 0; x <= VIEW_W; x += 40) {
                const waveY = aY + Math.sin((x + camX * 0.04) * 0.008 + t * 0.02 + a) * 35;
                ctx.lineTo(x, waveY);
            }
            ctx.lineTo(VIEW_W, VIEW_H);
            ctx.lineTo(0, VIEW_H);
            ctx.fill();
        }
        ctx.restore();

        const seaH = VIEW_H - 120;
        ctx.fillStyle = "#02070d";
        ctx.fillRect(0, seaH, VIEW_W, 120);
        ctx.strokeStyle = "rgba(220, 38, 38, 0.85)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x <= VIEW_W; x += 30) {
            const wy = seaH + Math.sin((x + camX * 0.1) * 0.015 + t * 0.04) * 14;
            if (x === 0) ctx.moveTo(x, wy); else ctx.lineTo(x, wy);
        }
        ctx.stroke();

        ctx.fillStyle = "#030a12";
        ctx.beginPath();
        for (let tc = 0; tc < 4; tc++) {
            const tX = ((tc * 260 - camX * 0.05) % (VIEW_W + 300) + VIEW_W + 300) % (VIEW_W + 300) - 100;
            const tWave = Math.sin(t * 0.03 + tc * 2) * 25;
            ctx.moveTo(tX - 16, seaH);
            ctx.quadraticCurveTo(tX + tWave, seaH - 75, tX + tWave * 1.4, seaH - 110);
            ctx.quadraticCurveTo(tX + 16 + tWave, seaH - 75, tX + 16, seaH);
        }
        ctx.fill();

    } else {
        const voidGrad = getSkyGradient(ctx, "horrorVoidSky", [
            [ 0, "#020000" ],
            [ 0.35, "#110000" ],
            [ 0.7, "#280000" ],
            [ 1, "#440000" ]
        ]);
        ctx.fillStyle = voidGrad;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);

        const mX = VIEW_W * 0.75 - (camX * 0.02) % (VIEW_W + 200);
        const mY = 130;
        ctx.fillStyle = "#990000";
        ctx.beginPath();
        ctx.arc(mX, mY, 90, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.ellipse(mX, mY, 35, 75, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ff1744";
        ctx.beginPath();
        ctx.arc(mX, mY, 14, 0, Math.PI * 2);
        ctx.fill();

        for (let c = 0; c < 15; c++) {
            const cx = (c * 87 + t * 0.2) % VIEW_W;
            const cy = (c * 67 + t * 0.15 + Math.sin(t * 0.05 + c) * 50) % VIEW_H;
            if (Math.sin(t * 0.08 + c) > 0.4) {
                ctx.fillStyle = "#ff0000";
                ctx.beginPath(); ctx.ellipse(cx, cy, 4, 2, 0, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(cx + 12, cy, 4, 2, 0, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath(); ctx.arc(cx, cy, 1, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx + 12, cy, 1, 0, Math.PI * 2); ctx.fill();
            }
        }
    }
}

function drawEnhancedBackground(ctx, level, camX, t, game) {
    if (ctx && ctx.isDummy) return;
    const curW = ctx.canvas ? Math.max(VIEW_W, ctx.canvas.width) : VIEW_W;
    const curH = ctx.canvas ? Math.max(VIEW_H, ctx.canvas.height) : VIEW_H;
    ctx.fillStyle = "#010008";
    ctx.fillRect(-100, -50, curW + 200, curH + 100);
    const isLow = typeof window !== "undefined" && window.PerfQuality && (window.PerfQuality.level === "low" || window.PerfQuality.level === "medium");
    if (window.postGameHorror) {
        drawHorrorLevelBackground(ctx, level, camX, t, isLow);
        return;
    }
    if (game.isHub || level === "hub") {
        const isLow = typeof window !== "undefined" && window.PerfQuality && window.PerfQuality.level === "low";
        
        const cosmicSky = getSkyGradient(ctx, "cosmicHub", [ [ 0, "#01000a" ], [ .3, "#09012a" ], [ .6, "#1a0442" ], [ 1, "#360866" ] ]);
        ctx.fillStyle = cosmicSky;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);

        if (!isLow) {
            ctx.globalCompositeOperation = "screen";
            
            const n1X = (VIEW_W * 0.3 - camX * 0.02 + Math.sin(t * 0.004) * 80 + VIEW_W * 2) % (VIEW_W + 600) - 300;
            const n1Y = VIEW_H * 0.35 + Math.cos(t * 0.005) * 50;
            const n1Grad = ctx.createRadialGradient(n1X, n1Y, 10, n1X, n1Y, 450);
            n1Grad.addColorStop(0, "rgba(139, 92, 246, 0.28)");
            n1Grad.addColorStop(0.4, "rgba(91, 33, 182, 0.16)");
            n1Grad.addColorStop(0.8, "rgba(30, 10, 60, 0.05)");
            n1Grad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = n1Grad;
            ctx.beginPath();
            ctx.ellipse(n1X, n1Y, 450, 300, 0.2 + Math.sin(t * 0.003) * 0.1, 0, Math.PI * 2);
            ctx.fill();

            const n2X = (VIEW_W * 0.75 - camX * 0.03 + Math.cos(t * 0.003) * 70 + VIEW_W * 2) % (VIEW_W + 600) - 300;
            const n2Y = VIEW_H * 0.55 + Math.sin(t * 0.004) * 60;
            const n2Grad = ctx.createRadialGradient(n2X, n2Y, 15, n2X, n2Y, 400);
            n2Grad.addColorStop(0, "rgba(34, 211, 238, 0.22)");
            n2Grad.addColorStop(0.45, "rgba(6, 95, 140, 0.12)");
            n2Grad.addColorStop(0.85, "rgba(2, 20, 50, 0.04)");
            n2Grad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = n2Grad;
            ctx.beginPath();
            ctx.ellipse(n2X, n2Y, 420, 260, -0.25 + Math.cos(t * 0.004) * 0.1, 0, Math.PI * 2);
            ctx.fill();

            const n3X = (VIEW_W * 0.5 - camX * 0.015 + Math.sin(t * 0.006) * 50 + VIEW_W * 2) % (VIEW_W + 500) - 250;
            const n3Y = VIEW_H * 0.2 + Math.cos(t * 0.005) * 40;
            const n3Pulse = 0.85 + Math.sin(t * 0.01) * 0.15;
            const n3Grad = ctx.createRadialGradient(n3X, n3Y, 5, n3X, n3Y, 320 * n3Pulse);
            n3Grad.addColorStop(0, "rgba(236, 72, 153, 0.24)");
            n3Grad.addColorStop(0.4, "rgba(131, 24, 67, 0.12)");
            n3Grad.addColorStop(0.8, "rgba(30, 0, 25, 0.03)");
            n3Grad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = n3Grad;
            ctx.beginPath();
            ctx.ellipse(n3X, n3Y, 340 * n3Pulse, 220 * n3Pulse, 0.1, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalCompositeOperation = "source-over";
        }

        const runePulse = Math.sin(t * 0.04) * 0.3 + 0.5;

        ctx.save();
        const starLimit = isLow ? 40 : 150;
        for (let i = 0; i < starLimit; i++) {
            const depth = (i % 5) + 1;
            const starX = ((i * 83 - camX * (depth * 0.04)) % VIEW_W + VIEW_W) % VIEW_W;
            const starY = (i * 47) % VIEW_H;
            const twinkle = Math.sin(t * 0.05 + i * 2.1) * 0.5 + 0.5;
            const starAlpha = (0.3 + depth * 0.15) * twinkle;
            
            ctx.fillStyle = `rgba(${200 + i%55}, ${230 - i%30}, 255, ${starAlpha})`;
            ctx.beginPath();
            ctx.arc(starX, starY, depth * 0.6, 0, Math.PI * 2);
            ctx.fill();
            
            if (i % 15 === 0 && !isLow) {
                const nextI = (i + 15) % starLimit;
                const nX = ((nextI * 83 - camX * (depth * 0.04)) % VIEW_W + VIEW_W) % VIEW_W;
                const nY = (nextI * 47) % VIEW_H;
                if (Math.abs(nX - starX) < 150 && Math.abs(nY - starY) < 150) {
                    ctx.strokeStyle = `rgba(100, 200, 255, ${starAlpha * 0.3})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath(); ctx.moveTo(starX, starY); ctx.lineTo(nX, nY); ctx.stroke();
                }
            }
        }
        
        if (!isLow && Math.random() < 0.03) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
            ctx.lineWidth = 2;
            const ssX = Math.random() * VIEW_W;
            const ssY = Math.random() * (VIEW_H * 0.5);
            ctx.beginPath();
            ctx.moveTo(ssX, ssY);
            ctx.lineTo(ssX - 40, ssY + 20);
            ctx.stroke();
        }
        ctx.restore();

        if (!isLow) {
            ctx.save();
            const planetX = (VIEW_W * 0.82 - camX * 0.012 + VIEW_W * 2) % (VIEW_W + 400) - 200;
            const planetY = VIEW_H * 0.28;
            const planetR = 48;

            const pAura = ctx.createRadialGradient(planetX, planetY, planetR * 0.8, planetX, planetY, planetR * 1.8);
            pAura.addColorStop(0, "rgba(56, 189, 248, 0.35)");
            pAura.addColorStop(0.5, "rgba(168, 85, 247, 0.18)");
            pAura.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = pAura;
            ctx.beginPath();
            ctx.arc(planetX, planetY, planetR * 1.8, 0, Math.PI * 2);
            ctx.fill();

            ctx.save();
            ctx.translate(planetX, planetY);
            ctx.rotate(-0.35);
            ctx.strokeStyle = "rgba(192, 132, 252, 0.35)";
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.ellipse(0, 0, planetR * 2.2, planetR * 0.55, 0, Math.PI, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, 0, planetR * 2.4, planetR * 0.6, 0, Math.PI, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            const pGrad = ctx.createRadialGradient(planetX - planetR * 0.35, planetY - planetR * 0.35, 4, planetX, planetY, planetR);
            pGrad.addColorStop(0, "#fdf4ff");
            pGrad.addColorStop(0.25, "#c084fc");
            pGrad.addColorStop(0.6, "#581c87");
            pGrad.addColorStop(0.9, "#1e0538");
            pGrad.addColorStop(1, "#090014");
            ctx.fillStyle = pGrad;
            ctx.beginPath();
            ctx.arc(planetX, planetY, planetR, 0, Math.PI * 2);
            ctx.fill();

            ctx.save();
            ctx.translate(planetX, planetY);
            ctx.rotate(-0.35);
            ctx.strokeStyle = "rgba(192, 132, 252, 0.4)";
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.ellipse(0, 0, planetR * 2.2, planetR * 0.55, 0, 0, Math.PI);
            ctx.stroke();
            ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, 0, planetR * 2.4, planetR * 0.6, 0, 0, Math.PI);
            ctx.stroke();
            ctx.restore();

            ctx.restore();
        }

        ctx.save();
        const floorGrad = ctx.createLinearGradient(0, VIEW_H - 180, 0, VIEW_H);
        floorGrad.addColorStop(0, "rgba(2, 0, 10, 0)");
        floorGrad.addColorStop(0.4, "rgba(20, 5, 45, 0.45)");
        floorGrad.addColorStop(0.8, "rgba(45, 10, 80, 0.75)");
        floorGrad.addColorStop(1, "rgba(12, 2, 28, 0.95)");
        ctx.fillStyle = floorGrad;
        ctx.fillRect(0, VIEW_H - 180, VIEW_W, 180);

        const horizonStars = isLow ? 30 : 90;
        ctx.fillStyle = "#ffffff";
        for (let hs = 0; hs < horizonStars; hs++) {
            const hx = ((hs * 67 - camX * 0.05) % VIEW_W + VIEW_W) % VIEW_W;
            const hy = VIEW_H - 140 + (hs * 31) % 135;
            const hTwinkle = Math.sin(t * 0.08 + hs) * 0.4 + 0.6;
            ctx.globalAlpha = (0.2 + (hs % 4) * 0.2) * hTwinkle;
            ctx.beginPath();
            ctx.arc(hx, hy, (hs % 3 === 0 ? 1.5 : 1), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        ctx.fillStyle = "rgba(192, 132, 252, 0.8)";
        ctx.shadowColor = "#c084fc";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        bgParticles.forEach(p => {
            p.y -= p.vy * 0.5;
            p.x += Math.sin(t * .04 + p.y * .03) * 2.0;
            if (p.y < 0) {
                p.y = VIEW_H;
                p.x = Math.random() * VIEW_W;
            }
            ctx.moveTo(p.x + p.size * .6, p.y);
            ctx.arc(p.x, p.y, p.size * .8, 0, Math.PI * 2);
        });
        ctx.fill();
        ctx.shadowBlur = 0;
        
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
        const isBlizzard = game.blizzardTransition && game.blizzardTransition.active;
        if (game.iceMode && !isBlizzard) {
            drawIceGlacierBackground(ctx, camX, t, false);
            return;
        } else if (game.fireMode) {
            const fireSky = getSkyGradient(ctx, "fire0", [ [ 0, "#2a0005" ], [ .5, "#5e0b0b" ], [ 1, "#1a0000" ] ]);
            ctx.fillStyle = fireSky;
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            ctx.fillStyle = "#ff5500";
            ctx.beginPath();
            bgParticles.forEach(p => {
                p.y -= p.vy * 1.2;
                p.x += Math.sin(t * .08 + p.y * .03) * 1.8;
                if (p.y < -10) {
                    p.y = VIEW_H + 10;
                    p.x = Math.random() * VIEW_W;
                }
                ctx.moveTo(p.x + p.size * .85, p.y);
                ctx.arc(p.x, p.y, p.size * .85, 0, Math.PI * 2);
            });
            ctx.fill();
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
                ctx.save();
                ctx.globalAlpha = Math.max(0, Math.min(1, fadeAlpha));
                ctx.strokeStyle = "#e0e7ff";
                ctx.lineWidth = 2.2;
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(tailX, tailY);
                ctx.lineTo(ss.x, ss.y);
                ctx.stroke();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(ss.x, ss.y, 2.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            ctx.fillStyle = "rgba(10, 15, 30, 0.9)";
            ctx.beginPath();
            ctx.moveTo(0, VIEW_H);
            for (let i = 0; i <= VIEW_W + 150; i += 60) {
                const mx = i;
                const my = VIEW_H - 220 - Math.sin((i + camX * .05) * .004) * 120 - Math.cos((i + camX * .05) * .01) * 50;
                ctx.lineTo(mx, my);
            }
            ctx.lineTo(VIEW_W, VIEW_H);
            ctx.fill();

            ctx.fillStyle = "rgba(5, 20, 25, 0.95)";
            ctx.beginPath();
            ctx.moveTo(0, VIEW_H);
            for (let i = 0; i <= VIEW_W + 100; i += 40) {
                const mx = i;
                const my = VIEW_H - 150 - Math.sin((i + camX * .1) * .008) * 80 - Math.cos((i + camX * .1) * .02) * 30;
                ctx.lineTo(mx, my);
            }
            ctx.lineTo(VIEW_W, VIEW_H);
            ctx.fill();

            const meadowNightGrad = ctx.createLinearGradient(0, VIEW_H - 180, 0, VIEW_H);
            meadowNightGrad.addColorStop(0, "rgba(5, 40, 25, 0.98)");
            meadowNightGrad.addColorStop(1, "rgba(2, 15, 10, 1)");
            ctx.fillStyle = meadowNightGrad;
            ctx.beginPath();
            ctx.moveTo(0, VIEW_H);
            for (let i = 0; i <= VIEW_W + 60; i += 40) {
                const mx = i;
                const my = VIEW_H - 80 - Math.sin((i + camX * .2) * .015) * 45 - Math.cos((i + camX * .2) * .04) * 15;
                ctx.lineTo(mx, my);
            }
            ctx.lineTo(VIEW_W, VIEW_H);
            ctx.fill();

            const nightTrees = [];
            const nightFireflies = [];
            for (let i = 30; i <= VIEW_W + 100; i += 110) {
                const tx = i - (camX * .2) % 110;
                if (tx < -50 || tx > VIEW_W + 50) continue;
                const index = Math.floor(camX * .2 / 110) + (i - 30) / 110;
                const ty = VIEW_H - 80 - Math.sin(index * 110 * .015) * 45 - Math.cos(index * 110 * .04) * 15;
                nightTrees.push({ tx, ty, index });
                if (Math.sin(index * 543) > 0) {
                    nightFireflies.push({
                        x: tx + Math.sin(t * 0.05 + index) * 15,
                        y: ty - 35 + Math.cos(t * 0.04 + index) * 10
                    });
                }
            }

            ctx.fillStyle = "rgba(15, 10, 5, 0.95)";
            for (let k = 0; k < nightTrees.length; k++) {
                ctx.fillRect(nightTrees[k].tx - 6, nightTrees[k].ty - 10, 12, 35);
            }

            ctx.fillStyle = "rgba(2, 20, 10, 0.98)";
            ctx.beginPath();
            for (let k = 0; k < nightTrees.length; k++) {
                const tr = nightTrees[k];
                ctx.moveTo(tr.tx + 28, tr.ty - 35);
                ctx.arc(tr.tx, tr.ty - 35, 28, 0, Math.PI * 2);
            }
            ctx.fill();

            ctx.fillStyle = "rgba(5, 30, 15, 0.95)";
            ctx.beginPath();
            for (let k = 0; k < nightTrees.length; k++) {
                const tr = nightTrees[k];
                ctx.moveTo(tr.tx - 12 + 20, tr.ty - 25);
                ctx.arc(tr.tx - 12, tr.ty - 25, 20, 0, Math.PI * 2);
                ctx.moveTo(tr.tx + 12 + 20, tr.ty - 25);
                ctx.arc(tr.tx + 12, tr.ty - 25, 20, 0, Math.PI * 2);
                ctx.moveTo(tr.tx + 22, tr.ty - 45);
                ctx.arc(tr.tx, tr.ty - 45, 22, 0, Math.PI * 2);
            }
            ctx.fill();

            ctx.fillStyle = "rgba(20, 50, 40, 0.8)";
            ctx.beginPath();
            for (let k = 0; k < nightTrees.length; k++) {
                const tr = nightTrees[k];
                ctx.moveTo(tr.tx - 15 + 12, tr.ty - 30);
                ctx.arc(tr.tx - 15, tr.ty - 30, 12, 0, Math.PI * 2);
                ctx.moveTo(tr.tx + 14, tr.ty - 50);
                ctx.arc(tr.tx, tr.ty - 50, 14, 0, Math.PI * 2);
            }
            ctx.fill();

            if (nightFireflies.length > 0) {
                ctx.fillStyle = "rgba(163, 255, 92, 0.3)";
                ctx.beginPath();
                for (let k = 0; k < nightFireflies.length; k++) {
                    ctx.moveTo(nightFireflies[k].x + 3.5, nightFireflies[k].y);
                    ctx.arc(nightFireflies[k].x, nightFireflies[k].y, 3.5, 0, Math.PI * 2);
                }
                ctx.fill();

                ctx.fillStyle = "#A3FF5C";
                ctx.beginPath();
                for (let k = 0; k < nightFireflies.length; k++) {
                    ctx.moveTo(nightFireflies[k].x + 1.5, nightFireflies[k].y);
                    ctx.arc(nightFireflies[k].x, nightFireflies[k].y, 1.5, 0, Math.PI * 2);
                }
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
        const skyGrad = getSkyGradient(ctx, "meadow_forest_v4", [
            [ 0, "#04081c" ],
            [ 0.28, "#131b42" ],
            [ 0.52, "#3e1c58" ],
            [ 0.72, "#853765" ],
            [ 0.86, "#d95f68" ],
            [ 0.94, "#f28b5b" ],
            [ 1, "#fde047" ]
        ]);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        
        const sunX = VIEW_W * .82 - camX * .015 % 250;
        const sunY = 140 + nightTrans * 300;
        
        ctx.save();
        ctx.globalCompositeOperation = "screen";

        const sunAtmosphere = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 480);
        sunAtmosphere.addColorStop(0, "rgba(255, 235, 180, 0.45)");
        sunAtmosphere.addColorStop(0.2, "rgba(255, 180, 80, 0.22)");
        sunAtmosphere.addColorStop(0.55, "rgba(230, 100, 40, 0.08)");
        sunAtmosphere.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = sunAtmosphere;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 480, 0, Math.PI * 2);
        ctx.fill();

        if (!isLow) {
            ctx.save();
            ctx.translate(sunX, sunY);
            
            ctx.rotate(t * 0.0005);
            ctx.fillStyle = "rgba(255, 245, 195, 0.045)";
            ctx.beginPath();
            for (let r = 0; r < 14; r++) {
                const angle = r * (Math.PI / 7);
                const rayWidth = 0.035 + Math.sin(t * 0.012 + r) * 0.015;
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, 600, angle - rayWidth, angle + rayWidth);
            }
            ctx.fill();
            
            ctx.rotate(-t * 0.0012);
            ctx.fillStyle = "rgba(255, 210, 110, 0.035)";
            ctx.beginPath();
            for (let r = 0; r < 8; r++) {
                const angle = r * (Math.PI / 4);
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, 360, angle - 0.08, angle + 0.08);
            }
            ctx.fill();
            ctx.restore();
        }

        const pulse = Math.sin(t * 0.03) * 6;
        const sunCorona = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 110 + pulse);
        sunCorona.addColorStop(0, "rgba(255, 255, 255, 1)");
        sunCorona.addColorStop(0.25, "rgba(255, 250, 210, 0.95)");
        sunCorona.addColorStop(0.5, "rgba(255, 215, 90, 0.55)");
        sunCorona.addColorStop(0.75, "rgba(255, 160, 40, 0.25)");
        sunCorona.addColorStop(1, "rgba(255, 100, 0, 0)");
        ctx.fillStyle = sunCorona;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 110 + pulse, 0, Math.PI * 2);
        ctx.fill();

        const coreGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 42);
        coreGrad.addColorStop(0, "#FFFFFF");
        coreGrad.addColorStop(0.65, "#FFFDF0");
        coreGrad.addColorStop(0.9, "rgba(255, 240, 170, 0.8)");
        coreGrad.addColorStop(1, "rgba(255, 220, 120, 0)");
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 42, 0, Math.PI * 2);
        ctx.fill();

        if (!isLow && nightTrans < 0.3) {
            const flareAlpha = (0.3 - nightTrans) / 0.3;
            ctx.globalAlpha = flareAlpha * (0.16 + Math.sin(t * 0.05) * 0.04);
            
            const dx = (VIEW_W / 2) - sunX;
            const dy = (VIEW_H / 2) - sunY;
            
            ctx.fillStyle = "rgba(100, 200, 255, 0.6)";
            ctx.beginPath(); ctx.arc(sunX + dx * 1.5, sunY + dy * 1.5, 40, 0, Math.PI * 2); ctx.fill();
            
            ctx.fillStyle = "rgba(150, 255, 150, 0.4)";
            ctx.beginPath(); ctx.arc(sunX + dx * 0.8, sunY + dy * 0.8, 15, 0, Math.PI * 2); ctx.fill();
            
            ctx.strokeStyle = "rgba(255, 200, 255, 0.3)";
            ctx.lineWidth = 4;
            ctx.beginPath(); ctx.arc(sunX + dx * 2.2, sunY + dy * 2.2, 80, 0, Math.PI * 2); ctx.stroke();
            
            ctx.globalAlpha = 1;
        }

        ctx.restore();

        for (let i = 0; i < 5; i++) {
            const cx = (i * 420 + 90 - camX * .035 + t * .03) % (VIEW_W + 550) - 260;
            const cy = 40 + (i % 3) * 26;
            const scale = 1.3 + (i % 2) * .35;
            
            ctx.fillStyle = "rgba(75, 45, 95, 0.22)";
            ctx.beginPath();
            ctx.arc(cx, cy + 14 * scale, 38 * scale, 0, Math.PI * 2);
            ctx.arc(cx + 35 * scale, cy + 2 * scale, 28 * scale, 0, Math.PI * 2);
            ctx.arc(cx + 70 * scale, cy + 14 * scale, 34 * scale, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "rgba(255, 240, 215, 0.32)";
            ctx.beginPath();
            ctx.arc(cx, cy + 10 * scale, 36 * scale, 0, Math.PI * 2);
            ctx.arc(cx + 34 * scale, cy - 4 * scale, 28 * scale, 0, Math.PI * 2);
            ctx.arc(cx + 68 * scale, cy + 10 * scale, 32 * scale, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
            ctx.beginPath();
            ctx.arc(cx + 10 * scale, cy + 4 * scale, 22 * scale, 0, Math.PI * 2);
            ctx.arc(cx + 36 * scale, cy - 8 * scale, 20 * scale, 0, Math.PI * 2);
            ctx.fill();
        }

        const distMtnGrad = getSkyGradient(ctx, "meadow_dist_mtn_v2", [
            [ 0, "rgba(80, 70, 115, 0.65)" ],
            [ 0.6, "rgba(135, 95, 115, 0.75)" ],
            [ 1, "rgba(205, 130, 100, 0.9)" ]
        ]);
        ctx.fillStyle = distMtnGrad;
        ctx.beginPath();
        ctx.moveTo(0, VIEW_H);
        for (let i = 0; i <= VIEW_W + 150; i += 50) {
            const my = VIEW_H - 250 - Math.sin((i + camX * .02) * .0035) * 130 - Math.cos((i + camX * .02) * .012) * 55;
            ctx.lineTo(i, my);
        }
        ctx.lineTo(VIEW_W, VIEW_H);
        ctx.fill();

        const hazeGrad = ctx.createLinearGradient(0, VIEW_H - 240, 0, VIEW_H - 120);
        hazeGrad.addColorStop(0, "rgba(254, 215, 170, 0.35)");
        hazeGrad.addColorStop(1, "rgba(254, 215, 170, 0)");
        ctx.fillStyle = hazeGrad;
        ctx.fillRect(0, VIEW_H - 240, VIEW_W, 120);

        const midMtnGrad = getSkyGradient(ctx, "meadow_mid_mtn_v2", [
            [ 0, "rgba(68, 88, 62, 0.85)" ],
            [ 0.5, "rgba(50, 70, 45, 0.9)" ],
            [ 1, "rgba(35, 50, 30, 0.95)" ]
        ]);
        ctx.fillStyle = midMtnGrad;
        ctx.beginPath();
        ctx.moveTo(0, VIEW_H);
        for (let i = 0; i <= VIEW_W + 100; i += 40) {
            const my = VIEW_H - 180 - Math.sin((i + camX * .055) * .0065) * 95 - Math.cos((i + camX * .055) * .02) * 40;
            ctx.lineTo(i, my);
        }
        ctx.lineTo(VIEW_W, VIEW_H);
        ctx.fill();

        const meadowGrad = getSkyGradient(ctx, "meadow_fore_hills_v2", [
            [ 0, "#99c836" ],
            [ 0.25, "#6ea324" ],
            [ 0.7, "#3c6e14" ],
            [ 1, "#1e380a" ]
        ]);
        ctx.fillStyle = meadowGrad;
        ctx.beginPath();
        ctx.moveTo(0, VIEW_H);
        for (let i = 0; i <= VIEW_W + 60; i += 35) {
            const my = VIEW_H - 100 - Math.sin((i + camX * .15) * .01) * 60 - Math.cos((i + camX * .15) * .03) * 20;
            ctx.lineTo(i, my);
        }
        ctx.lineTo(VIEW_W, VIEW_H);
        ctx.fill();

        if (!isLow) {
            ctx.save();
            ctx.globalAlpha = nightTrans < 1 ? 1 - nightTrans : 0;
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            const flowerColors = ["#fca5a5", "#fde047", "#c084fc", "#93c5fd"];
            for (let i = 0; i <= VIEW_W + 60; i += 18) {
                const hillY = VIEW_H - 100 - Math.sin((i + camX * .15) * .01) * 60 - Math.cos((i + camX * .15) * .03) * 20;
                
                ctx.strokeStyle = "#4ade80";
                ctx.lineWidth = 1;
                ctx.beginPath();
                const swayGrass = Math.sin(t * 0.05 + i) * 3;
                ctx.moveTo(i, hillY + 2);
                ctx.quadraticCurveTo(i + swayGrass/2, hillY - 4, i + swayGrass, hillY - 8);
                ctx.stroke();

                if (i % 54 === 0) {
                    ctx.fillStyle = flowerColors[(i/54) % flowerColors.length];
                    ctx.beginPath();
                    ctx.arc(i + swayGrass, hillY - 9, 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(i + swayGrass, hillY - 9, 0.8, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.restore();
        }

        const meadowTrees = [];
        for (let i = 25; i <= VIEW_W + 120; i += 95) {
            const index = Math.floor(camX * .15 / 95) + Math.round((i - 25) / 95);
            const offset = Math.sin(index * 5.3) * 24;
            const tx = (i + offset) - (camX * .15) % 95;
            if (tx < -80 || tx > VIEW_W + 80) continue;
            
            const ty = VIEW_H - 100 - Math.sin(index * 95 * .01) * 60 - Math.cos(index * 95 * .03) * 20;
            const hVar = 0.85 + Math.abs(Math.sin(index * 3.7)) * 0.32;
            const rVar = 0.82 + Math.abs(Math.cos(index * 2.9)) * 0.35;
            
            let sway = Math.sin(t * 0.04 + index) * 4.5 * (1 - nightTrans);
            if (game && game.portalPull) {
                const portScreenX = game.portalScreenX != null ? game.portalScreenX : (game.portalX || 450);
                const dist = portScreenX - tx;
                const dir = Math.sign(dist);
                const pullPower = Math.min(46, Math.max(4, (42 - Math.abs(dist) * 0.038) * game.portalPull));
                const windTurbulence = Math.sin(t * 0.32 + index * 2.5) * (game.portalPull * 8.5);
                sway = (dir * pullPower) + windTurbulence;
            }
            meadowTrees.push({ tx, ty, sway, index, hVar, rVar });
        }

        ctx.fillStyle = "rgba(12, 35, 10, 0.38)";
        ctx.beginPath();
        for (let k = 0; k < meadowTrees.length; k++) {
            const tr = meadowTrees[k];
            ctx.ellipse(tr.tx, tr.ty + 2, 18 * tr.rVar, 5 * tr.hVar, 0, 0, Math.PI * 2);
        }
        ctx.fill();

        ctx.fillStyle = "#341f11";
        ctx.beginPath();
        for (let k = 0; k < meadowTrees.length; k++) {
            const tr = meadowTrees[k];
            const topY = tr.ty - 48 * tr.hVar;
            ctx.moveTo(tr.tx - 7 * tr.rVar, tr.ty);
            ctx.quadraticCurveTo(tr.tx - 3, tr.ty - 20 * tr.hVar, tr.tx - 4 + tr.sway, topY);
            ctx.lineTo(tr.tx + 4 + tr.sway, topY);
            ctx.quadraticCurveTo(tr.tx + 2, tr.ty - 20 * tr.hVar, tr.tx + 6 * tr.rVar, tr.ty);
        }
        ctx.fill();

        ctx.fillStyle = "#163a0d";
        ctx.beginPath();
        for (let k = 0; k < meadowTrees.length; k++) {
            const tr = meadowTrees[k];
            const rad = 34 * tr.rVar;
            const cy = tr.ty - 42 * tr.hVar;
            ctx.moveTo(tr.tx + tr.sway + rad, cy);
            ctx.arc(tr.tx + tr.sway, cy, rad, 0, Math.PI * 2);
        }
        ctx.fill();

        ctx.fillStyle = "#2d6318";
        ctx.beginPath();
        for (let k = 0; k < meadowTrees.length; k++) {
            const tr = meadowTrees[k];
            const rad = 25 * tr.rVar;
            const cy = tr.ty - 34 * tr.hVar;
            ctx.moveTo(tr.tx - 13 * tr.rVar + tr.sway * 1.2 + rad, cy);
            ctx.arc(tr.tx - 13 * tr.rVar + tr.sway * 1.2, cy, rad, 0, Math.PI * 2);
            ctx.moveTo(tr.tx + 13 * tr.rVar + tr.sway * 1.2 + rad, cy);
            ctx.arc(tr.tx + 13 * tr.rVar + tr.sway * 1.2, cy, rad, 0, Math.PI * 2);
        }
        ctx.fill();

        ctx.fillStyle = "#55912a";
        ctx.beginPath();
        for (let k = 0; k < meadowTrees.length; k++) {
            const tr = meadowTrees[k];
            const rad = 26 * tr.rVar;
            const cy = tr.ty - 58 * tr.hVar;
            ctx.moveTo(tr.tx + tr.sway * 1.5 + rad, cy);
            ctx.arc(tr.tx + tr.sway * 1.5, cy, rad, 0, Math.PI * 2);
        }
        ctx.fill();

        ctx.fillStyle = "rgba(254, 240, 138, 0.45)";
        ctx.beginPath();
        for (let k = 0; k < meadowTrees.length; k++) {
            const tr = meadowTrees[k];
            const rad = 14 * tr.rVar;
            const cy = tr.ty - 68 * tr.hVar;
            const cx = tr.tx + tr.sway * 1.6 + 8 * tr.rVar;
            ctx.moveTo(cx + rad, cy);
            ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        }
        ctx.fill();

        ctx.fillStyle = "rgba(254, 240, 138, 0.85)";
        ctx.beginPath();
        for (let f = 0; f < 6; f++) {
            const fx = ((f * 160 + t * 1.2 - camX * 0.1) % VIEW_W + VIEW_W) % VIEW_W;
            const fy = VIEW_H - 120 + Math.sin(t * 0.06 + f * 1.8) * 35;
            ctx.moveTo(fx + 2.5, fy);
            ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
        }
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        for (let w = 0; w < 6; w++) {
            const windX = (t * 3 + w * 250) % (VIEW_W + 500) - 250;
            const windY = VIEW_H - 50 - w * 20 + Math.sin(t * 0.08 + w) * 15;
            ctx.beginPath();
            ctx.moveTo(windX, windY);
            ctx.quadraticCurveTo(windX + 60, windY - 20, windX + 180, windY);
            ctx.stroke();
            ctx.fillStyle = "#a3e635";
            ctx.beginPath(); ctx.arc(windX + 20, windY - 10, 2, 0, Math.PI*2); ctx.fill();
        }

        for (let i = 0; i < bgParticles.length; i++) {
            const p = bgParticles[i];
            p.x += p.vx + Math.sin(t * .02 + p.y) * .4 + .5;
            p.y += p.vy * .6;
            if (p.y > VIEW_H) {
                p.y = -10;
                p.x = Math.random() * VIEW_W;
            }
            if (p.x > VIEW_W) p.x = 0;
            if (p.x < 0) p.x = VIEW_W;
        }

        ctx.fillStyle = "rgba(102, 187, 106, 0.85)";
        for (let i = 0; i < bgParticles.length; i++) {
            const p = bgParticles[i];
            if ((Math.floor(p.size) % 3) === 0) {
                ctx.beginPath();
                ctx.ellipse(p.x, p.y, p.size * 1.6, p.size * .7, p.rot + t * .025, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.fillStyle = "rgba(255, 182, 193, 0.8)";
        for (let i = 0; i < bgParticles.length; i++) {
            const p = bgParticles[i];
            if ((Math.floor(p.size) % 3) === 1) {
                ctx.beginPath();
                ctx.ellipse(p.x, p.y, p.size * 1.3, p.size * .8, p.rot + t * .025, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.fillStyle = "rgba(255, 241, 118, 0.75)";
        ctx.beginPath();
        for (let i = 0; i < bgParticles.length; i++) {
            const p = bgParticles[i];
            if ((Math.floor(p.size) % 3) === 2) {
                ctx.rect(p.x - p.size * .4, p.y - p.size * .4, p.size * .8, p.size * .8);
            }
        }
        ctx.fill();
        
        for (let i = 0; i < bgParticles.length; i++) {
            const p = bgParticles[i];
            if (i === 7) {
                ctx.fillStyle = "#ff5500";
                ctx.shadowBlur = 10;
                ctx.shadowColor = "#ff0000";
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else if (i === 14) {
                ctx.strokeStyle = "rgba(150, 240, 255, 0.8)";
                ctx.lineWidth = 1.5;
                ctx.fillStyle = "rgba(50, 220, 255, 0.3)";
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 1.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                ctx.beginPath();
                ctx.arc(p.x - p.size*0.4, p.y - p.size*0.4, p.size * 0.25, 0, Math.PI * 2);
                ctx.fill();
            } else if (i === 21) {
                ctx.fillStyle = "rgba(163, 255, 92, 0.6)";
                ctx.shadowBlur = 15;
                ctx.shadowColor = "#A3FF5C";
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        ctx.globalAlpha = 1;
        if (isBlizzard) {
            const bAlpha = Math.min(1, Math.max(0, game.blizzardTransition.timer / (game.blizzardTransition.maxTimer * 0.72)));
            if (bAlpha > 0) {
                ctx.save();
                ctx.globalAlpha = bAlpha;
                drawIceGlacierBackground(ctx, camX, t, true);
                ctx.restore();
            }
        }
    } else if (level === 1) {
        if (game.iceMode && currentLevel === 1) {
            const iceSky = getSkyGradient(ctx, "ice1", [ [ 0, "#031926" ], [ .5, "#0b3c5d" ], [ 1, "#001427" ] ]);
            ctx.fillStyle = iceSky;
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            bgParticles.forEach(p => {
                p.y += p.vy * 1.5;
                p.x += Math.sin(t * .05 + p.y * .02) * 1.5;
                if (p.y > VIEW_H) {
                    p.y = -10;
                    p.x = Math.random() * VIEW_W;
                }
                const r = p.size * 0.7;
                ctx.moveTo(p.x + r, p.y);
                ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
            });
            ctx.fill();
            return;
        }
        const skyGrad = getSkyGradient(ctx, "tech", [ [ 0, "#020914" ], [ .6, "#081b33" ], [ 1, "#030a12" ] ]);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);

        ctx.globalCompositeOperation = "screen";
        for (let i = 0; i < 5; i++) {
            const nebX = (i * 300 - camX * 0.02) % (VIEW_W + 400) - 200;
            const nebY = VIEW_H * 0.4 + Math.sin(t * 0.01 + i) * 100;
            const nebGrad = ctx.createRadialGradient(nebX, nebY, 10, nebX, nebY, 250);
            nebGrad.addColorStop(0, "rgba(0, 255, 204, 0.12)");
            nebGrad.addColorStop(0.5, "rgba(100, 0, 255, 0.05)");
            nebGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = nebGrad;
            ctx.beginPath();
            ctx.arc(nebX, nebY, 250, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";

        ctx.fillStyle = "rgba(0, 150, 255, 0.15)";
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
            const crysX = (i * 140 - camX * .04) % (VIEW_W + 200) - 100;
            const crysY = VIEW_H - 120 + Math.sin(i * 10) * 30;
            ctx.moveTo(crysX, crysY);
            ctx.lineTo(crysX + 10, crysY - 140 - (i % 4) * 30);
            ctx.lineTo(crysX + 25, crysY - 100);
            ctx.lineTo(crysX + 35, crysY);
        }
        ctx.fill();

        ctx.fillStyle = "rgba(0, 220, 255, 0.22)";
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const crysX = (i * 220 + 60 - camX * .08) % (VIEW_W + 200) - 100;
            const crysY = VIEW_H - 60;
            ctx.moveTo(crysX, crysY);
            ctx.lineTo(crysX + 20, crysY - 220 - i % 3 * 50);
            ctx.lineTo(crysX + 50, crysY - 160);
            ctx.lineTo(crysX + 70, crysY);
        }
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const crysX = (i * 220 + 60 - camX * .08) % (VIEW_W + 200) - 100;
            const crysY = VIEW_H - 60;
            ctx.moveTo(crysX + 20, crysY - 220 - i % 3 * 50);
            ctx.lineTo(crysX + 35, crysY);
        }
        ctx.stroke();

        const pat = getTechGridPattern(ctx);
        if (pat) {
            ctx.save();
            const gridOffset = (camX * .15) % 60;
            ctx.translate(-gridOffset, 0);
            ctx.fillStyle = pat;
            ctx.fillRect(0, 0, VIEW_W + 60, VIEW_H);
            ctx.restore();
        }

        for (let i = 0; i < 7; i++) {
            const px = (i * 280 + 100 - camX * .35) % (VIEW_W + 300) - 150;
            
            ctx.fillStyle = "rgba(10, 24, 40, 0.95)";
            ctx.fillRect(px, 0, 55, VIEW_H);

            ctx.fillStyle = "rgba(0, 255, 204, 0.3)";
            ctx.fillRect(px, 0, 2, VIEW_H);
            ctx.fillRect(px + 53, 0, 2, VIEW_H);
            
            const bandY = (t * 2.5 + i * 90) % VIEW_H;
            ctx.fillStyle = "#00ffcc";
            ctx.fillRect(px, bandY, 55, 4);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(px + 10, bandY + 1, 35, 2);
            
            if (!isLow) {
                ctx.fillStyle = "rgba(0, 255, 204, 0.35)";
                ctx.font = "bold 13px monospace";
                for (let by = 20; by < VIEW_H; by += 40) {
                    const bit = Math.floor(t * 0.1 + i + by) % 2 === 0 ? "1" : "0";
                    ctx.fillText(bit, px + 23, by + Math.sin(t * 0.05 + i) * 10);
                }
            } else {
                ctx.fillStyle = "rgba(0, 255, 204, 0.25)";
                for (let by = 20; by < VIEW_H; by += 45) {
                    ctx.fillRect(px + 24, by, 4, 6);
                }
            }
        }
        
        ctx.fillStyle = "#00e5ff";
        bgParticles.forEach((p, idx) => {
            p.y -= p.vy * 0.6;
            p.x += Math.sin(t * .02 + p.y * .05) * .8;
            if (p.y < -20) {
                p.y = VIEW_H + 20;
                p.x = Math.random() * VIEW_W;
            }
            if (!isLow) {
                const bit = Math.floor(t * 0.2 + idx) % 2 === 0 ? "1" : "0";
                ctx.font = "bold " + Math.max(10, Math.floor(p.size * 3.5)) + "px monospace";
                ctx.fillText(bit, p.x, p.y);
            } else {
                ctx.fillRect(p.x, p.y, 3, 5);
            }
        });
    } else if (level === 2) {
        const isErupting = game.eruptingMode;
        
        let skyGrad;
        if (isErupting) {
            skyGrad = getSkyGradient(ctx, "erupting_fire_v2", [ [ 0, "#2a0000" ], [ .3, "#7a0500" ], [ .7, "#d42500" ], [ 1, "#ff6600" ] ]);
        } else {
            skyGrad = getSkyGradient(ctx, "fire_v2", [ [ 0, "#0a0002" ], [ .4, "#2a0208" ], [ .8, "#660c14" ], [ 1, "#a81600" ] ]);
        }
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);

        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = isErupting ? "rgba(255, 100, 0, 0.2)" : "rgba(255, 50, 0, 0.1)";
        ctx.beginPath();
        for (let x = 0; x <= VIEW_W; x += 30) {
            const y = VIEW_H - 120 - Math.sin(x * 0.015 + t * 0.06) * 60;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.lineTo(VIEW_W, VIEW_H); ctx.lineTo(0, VIEW_H); ctx.fill();

        const rGrad = ctx.createLinearGradient(0, VIEW_H, 0, 0);
        rGrad.addColorStop(0, isErupting ? "rgba(255,150,0,0.15)" : "rgba(255,50,0,0.08)");
        rGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = rGrad;
        ctx.beginPath();
        for(let r=0; r<4; r++) {
            const rayX = (r * 250 + t * (isErupting ? 1.5 : 0.5)) % (VIEW_W + 400) - 200;
            ctx.moveTo(rayX, VIEW_H);
            ctx.lineTo(rayX + 100, 0);
            ctx.lineTo(rayX + 300, 0);
            ctx.lineTo(rayX + 200, VIEW_H);
        }
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";

        if (isErupting || Math.random() > 0.98) {
            ctx.fillStyle = isErupting ? "rgba(255, 200, 100, 0.2)" : "rgba(255, 100, 50, 0.1)";
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        }

        const cloudColor = isErupting ? "rgba(40, 5, 0, 0.8)" : "rgba(15, 2, 2, 0.6)";
        ctx.fillStyle = cloudColor;
        ctx.beginPath();
        for (let x = 0; x <= VIEW_W + 100; x += 40) {
            const cy = 40 + Math.sin(x * 0.012 + t * 0.015) * 40 + Math.cos(x * 0.02) * 20;
            if (x === 0) ctx.moveTo(x, cy);
            else ctx.lineTo(x, cy);
        }
        ctx.lineTo(VIEW_W, 0); ctx.lineTo(0, 0); ctx.fill();

        for (let i = 0; i < 7; i++) {
            const volX = (i * 220 + 20 - camX * .04) % (VIEW_W + 300) - 150;
            const volY = VIEW_H;
            const tipY = volY - 220 - Math.sin(i*5)*60;
            const glow = .6 + Math.sin(t * .05 + i) * .4;
            
            ctx.fillStyle = isErupting ? "rgba(60, 10, 5, 0.98)" : "rgba(20, 3, 5, 0.95)";
            ctx.beginPath();
            ctx.moveTo(volX, volY);
            ctx.quadraticCurveTo(volX + 40, tipY + 80, volX + 60, tipY);
            ctx.lineTo(volX + 100, tipY + 15);
            ctx.quadraticCurveTo(volX + 120, tipY + 80, volX + 180, volY);
            ctx.fill();

            ctx.lineWidth = 5;
            ctx.strokeStyle = isErupting ? `rgba(255, 60, 0, ${glow * 0.4})` : `rgba(180, 30, 0, ${glow * 0.3})`;
            ctx.beginPath();
            ctx.moveTo(volX + 70, tipY + 8);
            ctx.quadraticCurveTo(volX + 90, tipY + 60, volX + 60, tipY + 150);
            ctx.moveTo(volX + 80, tipY + 40);
            ctx.quadraticCurveTo(volX + 120, tipY + 100, volX + 100, tipY + 180);
            ctx.stroke();

            ctx.lineWidth = 2;
            ctx.strokeStyle = isErupting ? `rgba(255, 180, 50, ${glow})` : `rgba(255, 80, 20, ${glow * 0.8})`;
            ctx.beginPath();
            ctx.moveTo(volX + 70, tipY + 8);
            ctx.quadraticCurveTo(volX + 90, tipY + 60, volX + 60, tipY + 150);
            ctx.moveTo(volX + 80, tipY + 40);
            ctx.quadraticCurveTo(volX + 120, tipY + 100, volX + 100, tipY + 180);
            ctx.stroke();
            
            if (isErupting) {
                ctx.fillStyle = `rgba(20, 5, 5, ${0.5 + glow*0.3})`;
                ctx.beginPath();
                ctx.arc(volX + 70, tipY - 30, 40 + glow*15, 0, Math.PI*2);
                ctx.arc(volX + 40, tipY - 60, 50 + glow*20, 0, Math.PI*2);
                ctx.arc(volX + 100, tipY - 50, 35, 0, Math.PI*2);
                ctx.fill();

                ctx.fillStyle = "#ff4400";
                ctx.beginPath();
                for (let b = 0; b < 3; b++) {
                    const bx = volX + 60 + Math.sin(t * .1 + b * 2) * 40;
                    const by = tipY - 20 - (t * 2 + b * 40) % 150;
                    if (!isLow) {
                        ctx.moveTo(bx + 3, by);
                        ctx.arc(bx, by, 3, 0, Math.PI * 2);
                    } else {
                        ctx.rect(bx - 2, by - 2, 4, 4);
                    }
                }
                ctx.fill();
            }
        }

        const rockGrad = getSkyGradient(ctx, isErupting ? "magma_rock_erupt" : "magma_rock_norm", [ [ 0, isErupting ? "#4a0505" : "#1a0205" ], [ 1, "#050000" ] ]);
        const fallGrad = getSkyGradient(ctx, "magma_fall", [ [ 0, "#ff8800" ], [ .3, "#ff4400" ], [ 1, "#990000" ] ]);

        for (let i = 0; i < 6; i++) {
            const rockX = (i * 280 + 80 - camX * .12) % (VIEW_W + 350) - 150;
            const rockY = VIEW_H;
            const tipY = rockY - 160 - Math.sin(i*7)*80;

            ctx.fillStyle = rockGrad;
            ctx.beginPath();
            ctx.moveTo(rockX, rockY);
            ctx.lineTo(rockX + 40, tipY + 50);
            ctx.lineTo(rockX + 60, tipY);
            ctx.lineTo(rockX + 110, tipY + 70);
            ctx.lineTo(rockX + 170, tipY + 40);
            ctx.lineTo(rockX + 240, rockY);
            ctx.fill();

            if (i % 2 === 0) {
                const lx = rockX + 110;
                const ly = tipY + 70;
                
                ctx.fillStyle = fallGrad;
                
                ctx.beginPath();
                ctx.moveTo(lx - 10, ly);
                ctx.lineTo(lx + 20, ly);
                for(let fy=ly; fy<=VIEW_H; fy+=20) {
                    ctx.lineTo(lx + 20 + Math.sin(fy*0.05 + t*0.1)*5, fy);
                }
                for(let fy=VIEW_H; fy>=ly; fy-=20) {
                    ctx.lineTo(lx - 10 + Math.sin(fy*0.05 + t*0.1)*5, fy);
                }
                ctx.fill();
                
                ctx.fillStyle = "#ff5500";
                ctx.beginPath();
                for(let s=0; s<8; s++) {
                    const splashX = lx + 5 + Math.sin(s * 1.7 + t * 0.2) * 22;
                    const splashY = VIEW_H - Math.abs(Math.cos(s * 2.3 + t * 0.15)) * 25;
                    const sRadius = 2 + (s % 3);
                    ctx.moveTo(splashX + sRadius, splashY);
                    ctx.arc(splashX, splashY, sRadius, 0, Math.PI*2);
                }
                ctx.fill();
            }
        }

        ctx.fillStyle = "rgba(10, 2, 2, 0.98)";
        for (let i = 0; i < 4; i++) {
            const rx = (i * 450 + 150 - camX * .25) % (VIEW_W + 500) - 250;
            const ry = 80 + i % 3 * 80 + Math.sin(t*0.02 + i)*10;
            
            ctx.fillRect(rx, ry, 220, 50);
            ctx.fillStyle = "#1a0505";
            ctx.fillRect(rx, ry, 220, 10);
            ctx.fillStyle = "rgba(10, 2, 2, 0.98)";
            
            ctx.strokeStyle = "#111";
            ctx.lineWidth = 4;
            const swing = Math.sin(t*0.03 + i)*20;
            ctx.beginPath();
            ctx.moveTo(rx + 30, ry + 50); ctx.quadraticCurveTo(rx + 30 + swing/2, ry + 100, rx + 30 + swing, ry + 150);
            ctx.moveTo(rx + 190, ry + 50); ctx.quadraticCurveTo(rx + 190 + swing/2, ry + 100, rx + 190 + swing, ry + 150);
            ctx.stroke();

            if (!isErupting) {
                ctx.fillStyle = "#ff4411";
                for(let r=0; r<5; r++) {
                    ctx.fillRect(rx + 25 + r*38, ry + 22, 14, 6);
                }
            }
        }

        ctx.beginPath();
        ctx.fillStyle = "#222222";
        const glowingEmbers = [];
        bgParticles.forEach(p => {
            p.y -= p.vy * (isErupting ? 2.5 : 1.5);
            p.x += Math.sin(t * .05 + p.y * .02) * (isErupting ? 3 : 2);
            if (p.y < -20) {
                p.y = VIEW_H + 20;
                p.x = Math.random() * VIEW_W;
            }
            if (p.size <= 1.5) {
                ctx.moveTo(p.x + p.size, p.y);
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            } else {
                glowingEmbers.push(p);
            }
        });
        ctx.fill();

        if (glowingEmbers.length > 0) {
            ctx.fillStyle = isErupting ? "#ff4500" : "#ff5500";
            ctx.beginPath();
            for (let i = 0; i < glowingEmbers.length; i++) {
                const p = glowingEmbers[i];
                ctx.moveTo(p.x + p.size, p.y);
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            }
            ctx.fill();
        }
    } else if (level === 3) {
        const isStorm = game.stormMode;
        
        if (isStorm) {
            const stormSky = getSkyGradient(ctx, "storm_cumbres_v2", [ [ 0, "#010205" ], [ .4, "#030814" ], [ .8, "#0a1122" ], [ 1, "#121d30" ] ]);
            ctx.fillStyle = stormSky;
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);

            if (Math.random() < 0.02) {
                ctx.fillStyle = "rgba(180, 230, 255, 0.08)";
                ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            }
        } else {
            const skyGrad = getSkyGradient(ctx, "ocean_cumbres_v2", [ [ 0, "#011626" ], [ .3, "#042c4a" ], [ .6, "#0a567d" ], [ 1, "#1486a6" ] ]);
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);

            for(let a=0; a<4; a++) {
                const rayAngle = Math.sin(t * 0.006 + a*1.5) * 0.2;
                const rx = VIEW_W * 0.5 + Math.sin(t*0.002 + a*2.5)*400;
                
                ctx.save();
                ctx.translate(rx, -40);
                ctx.rotate(rayAngle);
                
                const rayWidth = 80 + a * 20;
                const rayGrad = ctx.createLinearGradient(-rayWidth/2, 0, rayWidth/2, 0);
                rayGrad.addColorStop(0, "rgba(100, 240, 255, 0)");
                rayGrad.addColorStop(0.5, "rgba(150, 255, 255, 0.06)");
                rayGrad.addColorStop(1, "rgba(100, 240, 255, 0)");
                
                ctx.fillStyle = rayGrad;
                ctx.fillRect(-rayWidth, 0, rayWidth*2, VIEW_H+100);
                ctx.restore();
            }
        }

        const deepColor = isStorm ? "rgba(1, 3, 10, 0.95)" : "rgba(3, 20, 40, 0.95)";
        ctx.fillStyle = deepColor;
        ctx.beginPath();
        ctx.moveTo(0, VIEW_H);
        for (let i = 0; i <= VIEW_W + 150; i += 50) {
            const mx = i - (camX * .05) % 50;
            const my = VIEW_H - 220 - Math.sin((i + camX*.05) * .005) * 140 - Math.cos((i + camX*.05) * .015) * 50;
            ctx.lineTo(mx, my);
        }
        ctx.lineTo(VIEW_W, VIEW_H);
        ctx.fill();

        for (let i = 0; i < 7; i++) {
            const cliffX = (i * 360 + 30 - camX * .12) % (VIEW_W + 450) - 200;
            const cliffH = 200 + i % 3 * 70;
            
            const cliffGrad = ctx.createLinearGradient(cliffX, VIEW_H - cliffH, cliffX, VIEW_H);
            cliffGrad.addColorStop(0, isStorm ? "#030814" : "#0A3B66");
            cliffGrad.addColorStop(1, isStorm ? "#010204" : "#021526");
            
            ctx.fillStyle = cliffGrad;
            ctx.beginPath();
            ctx.moveTo(cliffX, VIEW_H);
            ctx.lineTo(cliffX + 60, VIEW_H - cliffH);
            ctx.lineTo(cliffX + 130, VIEW_H - cliffH + 40);
            ctx.lineTo(cliffX + 200, VIEW_H - cliffH - 20);
            ctx.lineTo(cliffX + 280, VIEW_H);
            ctx.fill();
        }

        for (let i = 0; i < 8; i++) {
            const reefX = (i * 240 + 60 - camX * .25) % (VIEW_W + 300) - 150;
            const reefY = VIEW_H - 130 + Math.sin(i*77)*30;
            
            ctx.fillStyle = isStorm ? "rgba(4, 10, 15, 0.98)" : "rgba(8, 45, 75, 0.98)";
            ctx.beginPath();
            ctx.moveTo(reefX, reefY + 140);
            ctx.lineTo(reefX + 35, reefY - 40);
            ctx.lineTo(reefX + 90, reefY + 140);
            ctx.fill();

            ctx.strokeStyle = isStorm ? "rgba(120, 20, 40, 0.6)" : "rgba(30, 130, 60, 0.65)";
            ctx.lineWidth = 6;
            ctx.lineCap = "round";
            ctx.beginPath();
            let kx = reefX - 15;
            let ky = reefY + 140;
            ctx.moveTo(kx, ky);
            for(let k=0; k<8; k++) {
                ky -= 22;
                kx += Math.sin(t * 0.02 + k*0.6 + i)*12;
                ctx.lineTo(kx, ky);
            }
            ctx.stroke();
        }

        const depthGrad = ctx.createLinearGradient(0, VIEW_H - 150, 0, VIEW_H);
        if (isStorm) {
            depthGrad.addColorStop(0, "rgba(1, 5, 15, 0)");
            depthGrad.addColorStop(1, "rgba(1, 5, 15, 0.8)");
        } else {
            depthGrad.addColorStop(0, "rgba(5, 40, 70, 0)");
            depthGrad.addColorStop(1, "rgba(5, 40, 70, 0.6)");
        }
        ctx.fillStyle = depthGrad;
        ctx.fillRect(0, VIEW_H - 150, VIEW_W, 150);

        bgParticles.forEach(p => {
            p.y -= p.vy * (isStorm ? 1.5 : 0.9);
            p.x += Math.sin(t * .05 + p.y * .03) * (isStorm ? 1.5 : .8);
            if (p.y < -20) {
                p.y = VIEW_H + 20;
                p.x = Math.random() * VIEW_W;
            }
            const bubbleR = Math.max(2, p.size * .8);
            ctx.save();
            ctx.strokeStyle = `rgba(150, 240, 255, ${p.alpha * .9})`;
            ctx.lineWidth = 1.5;
            ctx.fillStyle = `rgba(50, 220, 255, ${p.alpha * .3})`;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, bubbleR, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x - bubbleR * .3, p.y - bubbleR * .3, bubbleR * .3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    } else if (level === 6) {
        const hallowSky = getSkyGradient(ctx, "halloweenSky", [ [ 0, "#020008" ], [ .4, "#140428" ], [ .7, "#350c38" ], [ 1, "#4f112e" ] ]);
        ctx.fillStyle = hallowSky;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);

        const moonX = (VIEW_W * .8 - camX * .015) % (VIEW_W + 300);
        const moonY = 130;
        const moonR = 80;

        ctx.shadowColor = "#ff0044";
        ctx.shadowBlur = 40;
        
        const moonGrad = ctx.createRadialGradient(moonX, moonY, moonR*0.2, moonX, moonY, moonR);
        moonGrad.addColorStop(0, "#ffaaaa");
        moonGrad.addColorStop(0.3, "#ff2244");
        moonGrad.addColorStop(0.8, "#aa0022");
        moonGrad.addColorStop(1, "#440011");

        ctx.fillStyle = moonGrad;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(40, 0, 10, 0.4)";
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(moonX - 25, moonY - 15, 18, 0, Math.PI*2);
        ctx.arc(moonX + 35, moonY + 20, 24, 0, Math.PI*2);
        ctx.arc(moonX + 15, moonY - 40, 12, 0, Math.PI*2);
        ctx.arc(moonX - 40, moonY + 30, 14, 0, Math.PI*2);
        ctx.fill();

        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.beginPath();
        for(let b = 0; b < 25; b++) {
            const bPhase = t*0.05 + b;
            const batX = moonX + Math.sin(bPhase*1.1)*120 + Math.cos(bPhase*0.8)*50;
            const batY = moonY + Math.cos(bPhase*1.3)*80 + Math.sin(bPhase*0.5)*40;
            const batS = 0.5 + Math.sin(bPhase)*0.2;
            const wingY = Math.sin(t*0.5 + b*3)*8*batS;
            
            ctx.moveTo(batX, batY);
            ctx.lineTo(batX - 8*batS, batY - wingY);
            ctx.lineTo(batX - 3*batS, batY + 3*batS);
            ctx.lineTo(batX, batY);
            ctx.lineTo(batX + 3*batS, batY + 3*batS);
            ctx.lineTo(batX + 8*batS, batY - wingY);
        }
        ctx.fill();

        ctx.fillStyle = "#0c0211";
        const bgStep = 350;
        ctx.beginPath();
        for (let c = -1; c < 5; c++) {
            const cx = c * bgStep - camX * .05 % bgStep;
            
            ctx.rect(cx + 50, 180, 80, VIEW_H);
            ctx.moveTo(cx + 40, 180); ctx.lineTo(cx + 90, 80); ctx.lineTo(cx + 140, 180);
            ctx.rect(cx + 10, 250, 40, VIEW_H);
            ctx.rect(cx + 130, 220, 50, VIEW_H);
            
            ctx.moveTo(cx + 5, 250); ctx.lineTo(cx + 30, 160); ctx.lineTo(cx + 55, 250);
            ctx.moveTo(cx + 125, 220); ctx.lineTo(cx + 155, 120); ctx.lineTo(cx + 185, 220);
        }
        ctx.fill();

        const treeStep = 220;
        for (let tr = -1; tr < 6; tr++) {
            const tx = tr * treeStep - camX * .1 % treeStep;
            
            ctx.fillStyle = "#05000a";
            ctx.beginPath();
            ctx.moveTo(tx + 40, VIEW_H);
            ctx.quadraticCurveTo(tx + 50, VIEW_H - 100, tx + 20, VIEW_H - 180);
            ctx.lineTo(tx + 28, VIEW_H - 180);
            ctx.quadraticCurveTo(tx + 60, VIEW_H - 100, tx + 60, VIEW_H);
            ctx.fill();

            ctx.lineWidth = 3;
            ctx.strokeStyle = "#05000a";
            ctx.beginPath();
            ctx.moveTo(tx + 35, VIEW_H - 80); ctx.quadraticCurveTo(tx - 10, VIEW_H - 120, tx - 30, VIEW_H - 160);
            ctx.moveTo(tx + 45, VIEW_H - 120); ctx.quadraticCurveTo(tx + 80, VIEW_H - 140, tx + 100, VIEW_H - 180);
            ctx.stroke();

            const wispPhase = t*0.03 + tr;
            if (Math.sin(wispPhase) > 0) {
                const wx = tx + 40 + Math.sin(wispPhase*2)*50;
                const wy = VIEW_H - 100 + Math.cos(wispPhase*1.5)*30;
                
                const isGreen = tr % 2 === 0;
                ctx.fillStyle = isGreen ? "rgba(0, 255, 100, 0.2)" : "rgba(200, 50, 255, 0.2)";
                ctx.beginPath(); ctx.arc(wx, wy, 8, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = isGreen ? "rgba(0, 255, 100, 0.85)" : "rgba(200, 50, 255, 0.85)";
                ctx.beginPath(); ctx.arc(wx, wy, 3.5, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath(); ctx.arc(wx, wy, 1.5, 0, Math.PI*2); ctx.fill();
            }

            ctx.fillStyle = "#0a0114";
            ctx.fillRect(tx + 120, VIEW_H - 40, 20, 40);
            ctx.beginPath(); ctx.arc(tx + 130, VIEW_H - 40, 10, Math.PI, 0); ctx.fill();
            
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#0a0114";
            ctx.beginPath();
            ctx.moveTo(tx + 170, VIEW_H); ctx.lineTo(tx + 165, VIEW_H - 50);
            ctx.moveTo(tx + 155, VIEW_H - 35); ctx.lineTo(tx + 175, VIEW_H - 30);
            ctx.stroke();
        }

        const fogGrad1 = ctx.createLinearGradient(0, VIEW_H - 180, 0, VIEW_H);
        fogGrad1.addColorStop(0, "rgba(20, 5, 40, 0)");
        fogGrad1.addColorStop(0.5, "rgba(40, 10, 60, 0.6)");
        fogGrad1.addColorStop(1, "rgba(20, 0, 30, 0.95)");
        
        ctx.fillStyle = fogGrad1;
        ctx.beginPath();
        ctx.moveTo(0, VIEW_H);
        for(let x=0; x<=VIEW_W; x+=50) {
            ctx.lineTo(x, VIEW_H - 120 + Math.sin(x*0.01 + t*0.02)*40);
        }
        ctx.lineTo(VIEW_W, VIEW_H);
        ctx.fill();

        const pCount = Math.min(bgParticles.length, 25);
        for (let idx = 0; idx < pCount; idx++) {
            const p = bgParticles[idx];
            p.y -= p.vy * .6;
            p.x += Math.sin(t * .02 + p.y * .02) * 1.0;
            if (p.y < -20) {
                p.y = VIEW_H + 20;
                p.x = Math.random() * VIEW_W;
            }
            
            const isOrange = idx % 2 === 0;
            const pColor = isOrange ? "rgba(251, 146, 60, 0.4)" : "rgba(192, 132, 252, 0.35)";
            
            ctx.save();
            ctx.fillStyle = pColor;
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(1.5, p.size * 0.4), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}
