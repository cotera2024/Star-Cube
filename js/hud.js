const healthFill = document.getElementById("player-health-fill");

const hpContainer = document.getElementById("hp-container");

const levelDisplay = document.getElementById("level-display");

const scoreDisplay = document.getElementById("score-display");

const healthLabel = document.getElementById("health-label");

function updateScore(score) {
    if (scoreDisplay) scoreDisplay.textContent = __("ui_score", score);
}

let _currentCardModeKey = null;

function animateLevelCardChange(targetKeyOrText, targetColor) {
    const el = document.getElementById("level-display");
    if (!el) return;
    let text = targetKeyOrText;
    if (targetKeyOrText !== "????" && typeof __ === "function" && targetKeyOrText) {
        const tr = __(targetKeyOrText);
        if (tr && tr !== targetKeyOrText) text = tr;
    }
    if (el.textContent === text && (!targetColor || el.style.color === targetColor)) return;
    try {
        if (typeof playSound === "function") playSound(580, .08, "sine", .2, 1160);
    } catch (e) {}
    gsap.to(el, {
        y: -22,
        scaleY: .1,
        opacity: 0,
        duration: .32,
        ease: "power2.in",
        onComplete: () => {
            el.textContent = text;
            if (targetColor) el.style.color = targetColor;
            gsap.fromTo(el, {
                y: 24,
                scaleY: .1,
                scaleX: 1.3,
                opacity: 0
            }, {
                y: 0,
                scaleY: 1,
                scaleX: 1,
                opacity: 1,
                duration: .48,
                ease: "back.out(2.2)"
            });
        }
    });
}

function checkAndUpdateLevelCard() {
    if (typeof levelDisplay === "undefined" || !levelDisplay) return;
    if (typeof gameState !== "undefined" && gameState === "start") {
        if (levelDisplay.textContent !== "") {
            levelDisplay.textContent = "";
        }
        _currentCardModeKey = "start";
        return;
    }
    if (typeof game === "undefined") return;
    let targetKey = null;
    let targetColor = "#ff9900";
    if (window.postGameHorror) {
        targetKey = "????";
        targetColor = "#ff0000";
    } else if (game.isHub || currentLevel === "hub") {
        targetKey = "ui_hub_title";
        targetColor = "#38bdf8";
    } else if (typeof currentLevel === "number" && currentLevel >= 0) {
        targetKey = "level_name_" + (currentLevel + 1);
        targetColor = currentLevel >= 2 ? "#ff0000" : "#ff9900";
        if (currentLevel === 0) {
            if (game.iceMode) {
                targetKey = "level_name_1_ice";
                targetColor = "#38bdf8";
            } else if (game.meadowNight || game.gate2Open && !game.subCaveMode) {
                targetKey = "level_name_1_night";
                targetColor = "#a855f7";
            } else {
                targetKey = "level_name_1";
                targetColor = "#f59e0b";
            }
        } else if (currentLevel === 1) {
            if (game.pixelMode) {
                targetKey = "level_name_2_pixel";
                targetColor = "#00ffcc";
            } else {
                targetKey = "level_name_2";
                targetColor = "#38bdf8";
            }
        } else if (currentLevel === 3) {
            if (game.stormMode) {
                targetKey = "level_name_4_storm";
                targetColor = "#0284c7";
            } else {
                targetKey = "level_name_4";
                targetColor = "#06b6d4";
            }
        } else if (currentLevel === 4) {
            if (game.chaseDarkness || typeof window.Boss5State !== "undefined" && window.Boss5State === "chase") {
                targetKey = "level_name_5_chase";
                targetColor = "#ef4444";
            } else {
                targetKey = "level_name_5";
                targetColor = "#f43f5e";
            }
        }
    }
    if (targetKey && _currentCardModeKey !== targetKey) {
        _currentCardModeKey = targetKey;
        animateLevelCardChange(targetKey, targetColor);
    }
}

window.checkAndUpdateLevelCard = checkAndUpdateLevelCard;

window.animateLevelCardChange = animateLevelCardChange;

let _healthGradient = null;

function getHealthGradient(ctx) {
    if (_healthGradient) return _healthGradient;
    const barW = 180, barH = 20, pad = 8;
    const bx = VIEW_W - barW - pad - 10;
    const by = pad + 5;
    const grad = ctx.createLinearGradient(bx, by, bx + barW, by);
    grad.addColorStop(0, "#ff6b6b");
    grad.addColorStop(.5, "#ffd93d");
    grad.addColorStop(1, "#6bcb77");
    _healthGradient = grad;
    return grad;
}

function drawHealthBar(ctx, hp, maxHp, time) {
    const barW = 180, barH = 20, pad = 8;
    const bx = VIEW_W - barW - pad - 10;
    const by = pad + 5;
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.beginPath();
    ctx.roundRect(bx - 4, by - 4, barW + 8, barH + 46, 6);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(bx - 4, by - 4, barW + 8, barH + 46, 6);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = 'bold 11px "Courier Prime", monospace';
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(__("ui_peggy"), bx, by + barH + 6);
    const hpPercent = Math.max(0, hp / maxHp);
    const grad = getHealthGradient(ctx);
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.roundRect(bx, by, barW, barH, 4);
    ctx.fill();
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(bx, by, barW * hpPercent, barH, 4);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = 'bold 12px "Courier Prime", monospace';
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("❤️ " + Math.ceil(hp) + "/" + maxHp, VIEW_W - pad - 10, by + barH + 6);
    if (hp > maxHp * .8) {
        ctx.fillStyle = "rgba(255,255,200," + (.2 + Math.sin(time * .1) * .15) + ")";
        ctx.beginPath();
        ctx.roundRect(bx, by, barW * hpPercent, barH, 4);
        ctx.fill();
    }
    const livesY = by + barH + 24;
    for (let i = 0; i < 3; i++) {
        const lx = bx + i * 18;
        const alive = i < playerLives;
        ctx.globalAlpha = alive ? 1 : .25;
        ctx.fillStyle = alive ? "#ff66aa" : "#555555";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(lx, livesY, 13, 13, 3); else ctx.rect(lx, livesY, 13, 13);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = alive ? "#5b1a36" : "#222222";
        ctx.fillRect(lx + 2, livesY - 3, 3, 4);
        ctx.fillRect(lx + 8, livesY - 3, 3, 4);
        ctx.fillStyle = alive ? "#40122a" : "#181818";
        ctx.fillRect(lx + 3, livesY + 4, 2, 3);
        ctx.fillRect(lx + 8, livesY + 4, 2, 3);
        ctx.globalAlpha = 1;
    }
    if (typeof game !== "undefined" && game.godMode) {
        ctx.globalAlpha = .7 + Math.sin(time * .15) * .3;
        ctx.fillStyle = "#ffd700";
        ctx.font = 'bold 11px "Courier Prime", monospace';
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("🛡️ " + __("ui_god_mode"), bx, livesY + 17);
        ctx.globalAlpha = 1;
    }
}

const livesContainer = document.getElementById("lives-container");

function updateLivesDisplay() {
    if (!livesContainer) return;
    const icons = livesContainer.querySelectorAll(".life-icon");
    icons.forEach(function(ic, i) {
        if (i < playerLives) ic.classList.remove("lost"); else ic.classList.add("lost");
    });
}

window.updateLivesDisplay = updateLivesDisplay;
// Isaac Daniel Cotera - 2026 | Correo: isaacdanielcotera@gmail.com | Itch.io: https://cotera.itch.io | GitHub: https://github.com/cotera2024
