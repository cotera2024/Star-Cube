let particles = [];

let floatingTexts = [];

const MAX_FLOATING_TEXTS = 40;

const MAX_BLOOD = 250;

function maxParticlesAllowed() {
    if (typeof window !== "undefined" && window.PerfQuality && window.PerfQuality.maxParticles) {
        return window.PerfQuality.maxParticles;
    }
    return 400;
}

function addFloatingText(x, y, text, color = "#ffd700", fontSize = 16) {
    let displayText = text;
    if (typeof __ === "function" && text && typeof text === "string") {
        displayText = __(text);
    }
    if (typeof displayText === "string") {
        displayText = displayText
            .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{FE00}-\u{FE0F}\u{1FA00}-\u{1FAFF}\u{200D}]/gu, "")
            .replace(/\s+/g, " ")
            .trim();
        if (!displayText) return;
    } else if (!displayText) {
        return;
    }
    floatingTexts.push({
        x: x,
        y: y,
        text: displayText,
        color: color,
        fontSize: fontSize,
        life: 50,
        maxLife: 50,
        vy: -1.2
    });
}

function applyShake(amount) {
    screenShake.intensity = amount;
}

function createExplosion(x, y, color, size, amount, extraColors = []) {
    const isLow = typeof window !== "undefined" && window.PerfQuality && window.PerfQuality.level === "low";
    const colors = [ color, ...extraColors ];
    const isSmallHit = size <= 15 || amount <= 8;
    const isLevel4 = typeof currentLevel !== "undefined" && currentLevel === 4;

    if (isSmallHit && !isLevel4) {
        const sparkCount = Math.min(amount || 4, 6);
        for (let i = 0; i < sparkCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 10 + Math.random() * 8,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 2.5 + 1.5,
                type: "spark"
            });
        }
        return;
    }

    particles.push({
        x: x,
        y: y,
        radius: 1,
        maxRadius: size * 2.2,
        life: 1,
        maxLife: 18,
        type: "ring",
        lineWidth: isLevel4 ? 6 : 4,
        color: colors[0]
    });
    
    if (!isLow && (isLevel4 || size >= 35)) {
        particles.push({
            x: x,
            y: y,
            radius: 1,
            maxRadius: size * 1.2,
            life: 1,
            maxLife: 14,
            type: "ring",
            lineWidth: 3,
            color: "#ffffff"
        });
    }

    const finalAmount = isLow ? Math.min(amount, 8) : Math.min(amount * 1.2, 35);
    
    for (let i = 0; i < finalAmount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7 + 2.5;
        const col = colors[Math.floor(Math.random() * colors.length)];
        
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 20 + Math.random() * 20,
            color: col,
            size: Math.random() * 5 + 3,
            glow: isLevel4,
            type: isLevel4 ? "plasma" : "spark"
        });
        
        if (!isLow && isLevel4 && Math.random() > 0.6) {
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * (speed * 0.5),
                vy: Math.sin(angle) * (speed * 0.5) - 1.5,
                life: 25 + Math.random() * 20,
                color: "#ffaa00",
                size: Math.random() * 2.5 + 1,
                type: "spark"
            });
        }
    }
    
    if (isLevel4 || size >= 35) {
        const smokeCount = isLow ? 1 : 4;
        for (let i = 0; i < smokeCount; i++) {
            particles.push({
                x: x + (Math.random() - .5) * size,
                y: y + (Math.random() - .5) * size,
                vx: (Math.random() - .5) * 1.2,
                vy: -Math.random() * 1.2 - 0.4,
                life: 30 + Math.random() * 20,
                color: "rgba(80,80,80,0.5)",
                size: 12 + Math.random() * 14,
                type: "smoke"
            });
        }
    }
}

function triggerDashHitImpact(cx, cy, isMax = false) {
    try {
        if (typeof playSound === "function") {
            playSound(75, 0.22, "sawtooth", 0.55, 30);
            playSound(1100, 0.08, "triangle", 0.45, 180);
            playSound(320, 0.14, "square", 0.35, 90);
        }
        if (typeof playSFX === "function") {
            playSFX("sfx_rock_impact");
        }
    } catch (_) {}

    try {
        if (typeof window.triggerHaptic === "function") window.triggerHaptic("heavy");
        if (typeof window.triggerGamepadRumble === "function") window.triggerGamepadRumble(130, 0.8, 0.7);
    } catch (_) {}

    try {
        if (typeof applyShake === "function") applyShake(isMax ? 11 : 8);
    } catch (_) {}

    if (typeof particles !== "undefined" && Array.isArray(particles)) {
        particles.push({
            x: cx,
            y: cy,
            radius: 4,
            maxRadius: isMax ? 52 : 36,
            life: 1,
            maxLife: 15,
            type: "ring",
            lineWidth: 4,
            color: "#ffffff"
        });
        particles.push({
            x: cx,
            y: cy,
            radius: 8,
            maxRadius: isMax ? 68 : 48,
            life: 1,
            maxLife: 18,
            type: "ring",
            lineWidth: 3,
            color: isMax ? "#ff0055" : "#ffea00"
        });
        particles.push({
            x: cx,
            y: cy - 10,
            vx: 0,
            vy: -0.6,
            life: 15,
            maxLife: 15,
            type: "emoji",
            text: "💥",
            size: isMax ? 42 : 32
        });
        const count = isMax ? 20 : 14;
        const colors = isMax ? ["#ff0055", "#ffea00", "#ffffff", "#ff8800"] : ["#ffea00", "#ffffff", "#ff9900", "#ffff66"];
        for (let i = 0; i < count; i++) {
            const ang = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.3;
            const spd = (isMax ? 6.5 : 4.8) + Math.random() * 5;
            particles.push({
                x: cx,
                y: cy,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                life: 14 + Math.random() * 12,
                maxLife: 26,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 4 + Math.random() * 4,
                glow: 1,
                type: "spark"
            });
        }
    }
}
window.triggerDashHitImpact = triggerDashHitImpact;

function updateAndDrawParticles(ctx, cameraX) {
    const MAX_P = maxParticlesAllowed();
    if (particles.length > MAX_P) {
        particles.splice(0, particles.length - MAX_P);
    }
    const isDummy = ctx && ctx.isDummy;
    let write = 0;
    const vw = typeof VIEW_W !== "undefined" ? VIEW_W : 1024;
    const isLow = typeof window !== "undefined" && window.PerfQuality && window.PerfQuality.level === "low";
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.life--;
        if (p.life <= 0) continue;
        
        if (p.type === "spark" || p.type === "smoke" || p.type === "afterimage" || p.type === "plasma") {
            p.x += p.vx || 0;
            p.y += p.vy || 0;
            if (p.type === "spark") {
                p.vx *= 0.94;
                p.vy *= 0.94;
                p.vy += 0.15;
            } else if (p.type === "plasma") {
                p.vx *= 0.96;
                p.vy *= 0.96;
            } else if (p.type === "smoke") {
                p.vy *= 0.98;
                p.size += 0.2;
            }
        } else if (p.type === "ring") {
            p.radius += (p.maxRadius - p.radius) * .22;
        } else if (p.type === "emoji") {
            p.x += p.vx || 0;
            p.y += p.vy || 0;
            if (p.sineWave) p.x += Math.sin((p.life || 0) * .15) * .8;
        } else if (p.type === "horror_slash") {
        } else if (p.type === "horror_corpse_half" || p.type === "horror_bone" || p.type === "horror_vomit" || p.type === "horror_viscera") {
            p.x += p.vx || 0;
            p.y += p.vy || 0;
            p.vy += 0.28;
            p.rot = (p.rot || 0) + (p.vRot || 0.1);
        } else if (p.type === "horror_glitch_shard") {
            p.x += p.vx || 0;
            p.y += p.vy || 0;
            p.x += (Math.random() - 0.5) * 3;
        } else if (p.type === "rock_chunk") {
            p.x += p.vx || 0;
            p.y += p.vy || 0;
            p.vy += 0.38;
            p.vx *= 0.98;
            p.rot = (p.rot || 0) + (p.rotSpeed || 0.1);
        }
        
        if (isDummy) {
            particles[write++] = p;
            continue;
        }
        
        const sx = p.x - cameraX;
        const inView = sx > -140 && sx < vw + 140;
        
        if (inView) {
            const maxL = p.maxLife || 40;
            ctx.globalCompositeOperation = (p.type === "spark" || p.type === "plasma") && !isLow ? "screen" : "source-over";
            
            if (p.type === "spark" || p.type === "plasma") {
                const alpha = Math.max(0, p.life / maxL);
                if (isLow && p.type === "spark") {
                    ctx.globalAlpha = alpha;
                    ctx.fillStyle = p.color || "#ffffff";
                    const sz = p.size || 3;
                    ctx.fillRect(sx - sz * .5, p.y - sz * .5, sz, sz);
                    continue;
                }
                const stretch = Math.max(1, Math.sqrt((p.vx || 0) * (p.vx || 0) + (p.vy || 0) * (p.vy || 0)));
                const ang = Math.atan2(p.vy || 0, p.vx || 0);
                
                ctx.save();
                ctx.translate(sx, p.y);
                ctx.rotate(ang);
                
                if (p.type === "plasma" && !isLow) {
                    ctx.shadowColor = p.color;
                    ctx.shadowBlur = 15;
                    ctx.fillStyle = "#ffffff";
                } else {
                    ctx.fillStyle = p.color;
                }
                
                if (p.glow && !isLow && p.type !== "plasma") {
                    ctx.globalAlpha = alpha * 0.4;
                    ctx.beginPath(); ctx.ellipse(0, 0, p.size * stretch * 0.8 + 2, p.size + 2, 0, 0, Math.PI*2); ctx.fill();
                }
                
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.ellipse(0, 0, (p.size/2) * stretch * (p.type==="plasma"?1.5:1.0), p.size/2, 0, 0, Math.PI*2);
                ctx.fill();
                ctx.restore();
                
            } else if (p.type === "afterimage") {
                const alpha = Math.max(0, p.life / maxL * (p.alpha || .7));
                if (!isLow) {
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = alpha * .35;
                    ctx.beginPath();
                    ctx.arc(sx, p.y, p.size + 3, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(sx, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === "ring") {
                ctx.globalAlpha = Math.max(0, p.life / (p.maxLife || 20));
                ctx.beginPath();
                ctx.arc(sx, p.y, p.radius, 0, Math.PI * 2);
                ctx.strokeStyle = p.color;
                ctx.lineWidth = p.lineWidth || 3;
                ctx.stroke();
            } else if (p.type === "smoke") {
                ctx.globalAlpha = Math.max(0, p.life / 50);
                ctx.beginPath();
                ctx.arc(sx, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            } else if (p.type === "emoji") {
                ctx.font = `${p.size || 20}px sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = p.color || "#fff";
                ctx.globalAlpha = Math.max(0, p.life / maxL);
                ctx.fillText(p.text || "🎵", sx, p.y);
            } else if (p.type === "horror_slash") {
                ctx.save();
                ctx.globalAlpha = Math.min(1, p.life / 6);
                ctx.strokeStyle = "#ff0033";
                ctx.lineWidth = 4.5;
                ctx.beginPath();
                ctx.moveTo(sx - p.size, p.y - p.size * 0.7);
                ctx.lineTo(sx + p.size, p.y + p.size * 0.7);
                ctx.stroke();
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(sx - p.size * 0.7, p.y - p.size * 0.5);
                ctx.lineTo(sx + p.size * 0.7, p.y + p.size * 0.5);
                ctx.stroke();
                ctx.restore();
            } else if (p.type === "horror_corpse_half") {
                ctx.save();
                ctx.translate(sx, p.y);
                ctx.rotate(p.rot || 0);
                ctx.globalAlpha = Math.min(1, p.life / 12);
                ctx.fillStyle = p.color || "#1e1422";
                ctx.strokeStyle = "#450a0a";
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.roundRect(-p.w / 2, -p.h / 2, p.w, p.h, [ 4 ]);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = "#991b1b";
                if (p.side === "left") {
                    ctx.fillRect(p.w / 2 - 3, -p.h / 2, 4, p.h);
                    ctx.fillStyle = "#ff0033";
                    ctx.fillRect(p.w / 2 - 1, -p.h / 3, 2, p.h / 1.5);
                } else if (p.side === "right") {
                    ctx.fillRect(-p.w / 2, -p.h / 2, 4, p.h);
                    ctx.fillStyle = "#ff0033";
                    ctx.fillRect(-p.w / 2, -p.h / 3, 2, p.h / 1.5);
                } else {
                    ctx.fillStyle = "#ff0033";
                    ctx.fillRect(-2, -p.h / 2, 4, p.h);
                }
                ctx.fillStyle = "#7f1d1d";
                ctx.fillRect(-2, p.h / 2 - 2, 4, 4);
                ctx.restore();
            } else if (p.type === "horror_viscera") {
                ctx.save();
                ctx.translate(sx, p.y);
                ctx.rotate(p.rot || 0);
                ctx.globalAlpha = Math.min(1, p.life / 10);
                if (p.isGuts) {
                    ctx.fillStyle = p.color || "#880808";
                    ctx.beginPath();
                    ctx.ellipse(0, 0, (p.size || 5) * 1.5, (p.size || 5) * 0.7, 0.35, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#dc2626";
                    ctx.beginPath();
                    ctx.ellipse(1, -1, (p.size || 5) * 0.8, (p.size || 5) * 0.35, 0.2, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.fillStyle = p.color || "#580404";
                    ctx.beginPath();
                    const s = p.size || 4;
                    ctx.moveTo(-s, -s * 0.7);
                    ctx.lineTo(s * 0.8, -s * 0.4);
                    ctx.lineTo(s * 0.5, s * 1.2);
                    ctx.lineTo(-s * 0.6, s * 0.8);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = "#ff0033";
                    ctx.fillRect(-1, -1, 2, 3);
                }
                ctx.restore();
            } else if (p.type === "horror_vomit") {
                ctx.save();
                ctx.globalAlpha = Math.min(1, p.life / 10);
                ctx.fillStyle = p.color || "#15803d";
                ctx.beginPath();
                ctx.arc(sx, p.y, p.size || 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else if (p.type === "horror_bone") {
                ctx.save();
                ctx.translate(sx, p.y);
                ctx.rotate(p.rot || 0);
                ctx.globalAlpha = Math.min(1, p.life / 15);
                ctx.fillStyle = "#f1f5f9";
                ctx.strokeStyle = "#94a3b8";
                ctx.lineWidth = 1.2;
                if (p.isSkull) {
                    ctx.beginPath();
                    ctx.arc(0, -2, 7, 0, Math.PI * 2);
                    ctx.fillRect(-4, 2, 8, 5);
                    ctx.fill();
                    ctx.stroke();
                    ctx.fillStyle = "#000000";
                    ctx.fillRect(-2.5, -2, 2, 2.5);
                    ctx.fillRect(1, -2, 2, 2.5);
                } else {
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 8, 3, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                }
                ctx.restore();
            } else if (p.type === "horror_glitch_shard") {
                ctx.save();
                ctx.font = "bold 11px monospace";
                ctx.fillStyle = "#ff0033";
                ctx.globalAlpha = Math.min(1, p.life / 10);
                ctx.fillText(p.text || "0xDEAD", sx, p.y);
                ctx.restore();
            } else if (p.type === "rock_chunk") {
                ctx.save();
                ctx.translate(sx, p.y);
                ctx.rotate(p.rot || 0);
                const alpha = Math.min(1, p.life / 15);
                ctx.globalAlpha = alpha;
                ctx.fillStyle = p.color || "#78716c";
                ctx.strokeStyle = "#1c1917";
                ctx.lineWidth = 1.5;
                const s = p.size || 8;
                ctx.beginPath();
                ctx.moveTo(-s * 0.5, -s * 0.5);
                ctx.lineTo(s * 0.6, -s * 0.3);
                ctx.lineTo(s * 0.5, s * 0.5);
                ctx.lineTo(-s * 0.4, s * 0.45);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = "source-over";
        }
        particles[write++] = p;
    }
    particles.length = write;
}

function updateAndDrawFloatingTexts(ctx, cameraX) {
    if (floatingTexts.length > MAX_FLOATING_TEXTS) {
        floatingTexts.splice(0, floatingTexts.length - MAX_FLOATING_TEXTS);
    }
    const isDummy = ctx && ctx.isDummy;
    let write = 0;
    const vw = typeof VIEW_W !== "undefined" ? VIEW_W : 1024;
    ctx.textAlign = "center";
    let lastFont = "";
    for (let i = 0; i < floatingTexts.length; i++) {
        let ft = floatingTexts[i];
        ft.y += ft.vy;
        ft.life--;
        if (ft.life <= 0) continue;
        if (isDummy) {
            floatingTexts[write++] = ft;
            continue;
        }
        const screenX = ft.x - cameraX;
        if (screenX < -150 || screenX > vw + 150) {
            floatingTexts[write++] = ft;
            continue;
        }
        ctx.globalAlpha = Math.min(1, ft.life / 15);
        const fontStr = `bold ${ft.fontSize}px 'Fredoka One', cursive`;
        if (lastFont !== fontStr) {
            ctx.font = fontStr;
            lastFont = fontStr;
        }
        ctx.fillStyle = "#000000";
        ctx.fillText(ft.text, (screenX + 1) | 0, (ft.y + 1) | 0);
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, screenX | 0, ft.y | 0);
        floatingTexts[write++] = ft;
    }
    ctx.globalAlpha = 1;
    floatingTexts.length = write;
}

function drawCinematicEffects(ctx, vw, vh, intensity) {
    if (typeof window !== "undefined" && window.PerfQuality && window.PerfQuality.level === "low") return;
    
    ctx.save();
    let grad = ctx.createRadialGradient(vw / 2, vh / 2, Math.min(vw, vh) * 0.4, vw / 2, vh / 2, Math.max(vw, vh) * 0.75);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,10,0.5)");
    ctx.fillStyle = grad;
    ctx.globalCompositeOperation = "multiply";
    ctx.fillRect(0, 0, vw, vh);
    
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    for (let i = 0; i < vh; i += 4) {
        ctx.fillRect(0, i, vw, 1);
    }
    ctx.restore();
}

let _activeBossDefeats = [];

function triggerEpicBossDefeat(boss, onExplosionDone) {
    window._gameTimeScale = 1.0;
    if (typeof onExplosionDone === "function") {
        try { onExplosionDone(); } catch (err) { console.error(err); }
    }
}
window.triggerEpicBossDefeat = triggerEpicBossDefeat;

function updateAndDrawBossDefeats(ctx, cameraX) {
    window._gameTimeScale = 1.0;
}
window.updateAndDrawBossDefeats = updateAndDrawBossDefeats;

function clearActiveBossDefeats() {
    _activeBossDefeats = [];
    window._gameTimeScale = 1.0;
}
window.clearActiveBossDefeats = clearActiveBossDefeats;


