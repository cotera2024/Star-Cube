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
    floatingTexts.push({
        x: x,
        y: y,
        text: text,
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
    const colors = [ color, ...extraColors ];
    particles.push({
        x: x,
        y: y,
        radius: 1,
        maxRadius: size * 1.5,
        life: 1,
        maxLife: 20,
        type: "ring",
        color: colors[0]
    });
    for (let i = 0; i < amount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        const col = colors[Math.floor(Math.random() * colors.length)];
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 20 + Math.random() * 20,
            color: col,
            size: Math.random() * 6 + 4,
            type: "spark"
        });
    }
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: x + (Math.random() - .5) * 20,
            y: y + (Math.random() - .5) * 20,
            vx: (Math.random() - .5) * .5,
            vy: -Math.random() * .5,
            life: 30 + Math.random() * 20,
            color: "rgba(200,200,200,0.5)",
            size: 10 + Math.random() * 15,
            type: "smoke"
        });
    }
}

function updateAndDrawParticles(ctx, cameraX) {
    const MAX_P = maxParticlesAllowed();
    if (particles.length > MAX_P) particles.splice(0, particles.length - MAX_P);
    let write = 0;
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.life--;
        if (p.life <= 0) continue;
        if (p.type === "spark" || p.type === "smoke") {
            p.x += p.vx || 0;
            p.y += p.vy || 0;
        } else if (p.type === "afterimage") {
            p.x += p.vx || 0;
            p.y += p.vy || 0;
        } else if (p.type === "ring") {
            p.radius += (p.maxRadius - p.radius) * .22;
        } else if (p.type === "emoji") {
            p.x += p.vx || 0;
            p.y += p.vy || 0;
            if (p.sineWave) p.x += Math.sin((p.life || 0) * .15) * .8;
        }
        const sx = p.x - cameraX;
        const inView = sx > -140 && sx < VIEW_W + 140;
        if (inView) {
            const maxL = p.maxLife || 40;
            if (p.type === "spark") {
                const alpha = Math.max(0, p.life / maxL);
                if (p.glow) {
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = alpha * .35;
                    ctx.fillRect(sx - 2, p.y - 2, p.size + 4, p.size + 4);
                }
                ctx.fillStyle = p.color;
                ctx.globalAlpha = alpha;
                ctx.fillRect(sx, p.y, p.size, p.size);
            } else if (p.type === "afterimage") {
                const alpha = Math.max(0, p.life / maxL * (p.alpha || .7));
                ctx.fillStyle = p.color;
                ctx.globalAlpha = alpha * .35;
                ctx.beginPath();
                ctx.arc(sx, p.y, p.size + 3, 0, Math.PI * 2);
                ctx.fill();
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
            }
            ctx.globalAlpha = 1;
        }
        particles[write++] = p;
    }
    particles.length = write;
}

function updateAndDrawFloatingTexts(ctx, cameraX) {
    if (floatingTexts.length > MAX_FLOATING_TEXTS) floatingTexts.splice(0, floatingTexts.length - MAX_FLOATING_TEXTS);
    let write = 0;
    for (let i = 0; i < floatingTexts.length; i++) {
        let ft = floatingTexts[i];
        ft.y += ft.vy;
        ft.life--;
        if (ft.life <= 0) continue;
        ctx.save();
        ctx.globalAlpha = Math.min(1, ft.life / 15);
        ctx.font = `bold ${ft.fontSize}px 'Fredoka One', cursive`;
        ctx.fillStyle = ft.color;
        ctx.shadowColor = "#000000";
        ctx.shadowBlur = 4;
        ctx.textAlign = "center";
        ctx.fillText(ft.text, ft.x - cameraX, ft.y);
        ctx.restore();
        floatingTexts[write++] = ft;
    }
    floatingTexts.length = write;
}
// Isaac Daniel Cotera - 2026 | Correo: isaacdanielcotera@gmail.com | Itch.io: https://cotera.itch.io | GitHub: https://github.com/cotera2024
