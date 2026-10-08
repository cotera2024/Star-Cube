const healthFill = document.getElementById("player-health-fill");

const hpContainer = document.getElementById("hp-container");

const levelDisplay = document.getElementById("level-display");

const scoreDisplay = document.getElementById("score-display");

const healthLabel = document.getElementById("health-label");

function updateScore(score) {
    if (scoreDisplay) scoreDisplay.textContent = __("ui_score", score);
    if (typeof window !== "undefined" && window.GamePix && typeof window.GamePix.updateScore === "function" && typeof score === "number") {
        try { window.GamePix.updateScore(Math.max(0, Math.floor(score))); } catch (e) {}
    }
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
    if (window.BossHUD && window.BossHUD._active) return;
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

window.resetLevelCardMode = function() {
    _currentCardModeKey = null;
};

window.checkAndUpdateLevelCard = checkAndUpdateLevelCard;

window.animateLevelCardChange = animateLevelCardChange;

function updateHealthUI(hp, maxHp = 100) {
    const curHp = Math.max(0, Math.ceil(typeof hp === "number" ? hp : 100));
    const safeMax = maxHp || 100;
    const hpPct = Math.max(0, Math.min(1, curHp / safeMax));

    const hFill = document.getElementById("player-health-fill");
    if (hFill) {
        if (typeof gsap !== "undefined") {
            gsap.to(hFill, {
                width: (hpPct * 100) + "%",
                duration: 0.3,
                ease: "power2.out"
            });
        } else {
            hFill.style.width = (hpPct * 100) + "%";
        }

        const isHorror = typeof window !== "undefined" && !!window.postGameHorror;
        if (isHorror) {
            hFill.style.background = "linear-gradient(90deg, #dc2626, #ef4444, #ff0055)";
            hFill.style.boxShadow = "0 0 14px rgba(239, 68, 68, 0.8)";
        } else if (hpPct > 0.55) {
            hFill.style.background = "linear-gradient(90deg, #ff2a85, #ff55a3, #ff007f)";
            hFill.style.boxShadow = "0 0 12px rgba(255, 42, 133, 0.75)";
        } else if (hpPct > 0.25) {
            hFill.style.background = "linear-gradient(90deg, #f59e0b, #fbbf24, #fde047)";
            hFill.style.boxShadow = "0 0 12px rgba(245, 158, 11, 0.75)";
        } else {
            hFill.style.background = "linear-gradient(90deg, #dc2626, #ef4444, #ff4d6d)";
            hFill.style.boxShadow = "0 0 14px rgba(220, 38, 38, 0.85)";
        }
    }

    const hpTextEl = document.getElementById("hp-text");
    if (hpTextEl) {
        hpTextEl.textContent = curHp + " / " + safeMax;
    }
}
window.updateHealthUI = updateHealthUI;

function drawHealthBar(ctx, hp, maxHp, time) {
    if (!ctx) return;
    const barW = 180, barH = 18, pad = 8;
    const bx = VIEW_W - barW - pad - 10;
    const by = pad + 5;
    const isHorror = typeof window !== "undefined" && !!window.postGameHorror;

    ctx.fillStyle = isHorror ? "rgba(18, 4, 8, 0.88)" : "rgba(22, 14, 30, 0.84)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx - 6, by - 5, barW + 12, barH + 46, 8);
    else ctx.rect(bx - 6, by - 5, barW + 12, barH + 46);
    ctx.fill();

    ctx.strokeStyle = isHorror ? "rgba(239, 68, 68, 0.7)" : "rgba(255, 105, 180, 0.65)";
    ctx.lineWidth = 1.6;
    ctx.stroke();

    ctx.fillStyle = isHorror ? "#fca5a5" : "#ffffff";
    ctx.font = 'bold 11px "Courier Prime", monospace';
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(typeof __ === "function" ? __("ui_peggy") : "Peggy", bx, by + barH + 5);

    const hpPercent = Math.max(0, Math.min(1, hp / maxHp));
    ctx.fillStyle = isHorror ? "rgba(35, 10, 15, 0.95)" : "rgba(38, 20, 34, 0.95)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, barW, barH, 5);
    else ctx.rect(bx, by, barW, barH);
    ctx.fill();

    ctx.strokeStyle = isHorror ? "rgba(180, 20, 40, 0.5)" : "rgba(255, 160, 210, 0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();

    if (hpPercent > 0) {
        const fillW = Math.max(4, barW * hpPercent);
        const grad = ctx.createLinearGradient(bx, by, bx + barW, by);
        if (isHorror) {
            grad.addColorStop(0, "#dc2626");
            grad.addColorStop(0.5, "#ef4444");
            grad.addColorStop(1, "#ff0055");
        } else if (hpPercent > 0.55) {
            grad.addColorStop(0, "#ff2a85");
            grad.addColorStop(0.5, "#ff60a8");
            grad.addColorStop(1, "#ff85c0");
        } else if (hpPercent > 0.25) {
            grad.addColorStop(0, "#f59e0b");
            grad.addColorStop(0.5, "#fbbf24");
            grad.addColorStop(1, "#fde047");
        } else {
            const pulse = (Math.sin((time || Date.now() / 60) * 0.25) + 1) * 0.5;
            grad.addColorStop(0, pulse > 0.5 ? "#b91c1c" : "#ef4444");
            grad.addColorStop(1, pulse > 0.5 ? "#ef4444" : "#ff4d6d");
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(bx, by, fillW, barH, 4);
        else ctx.rect(bx, by, fillW, barH);
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(bx + 1, by + 1, Math.max(1, fillW - 2), Math.max(2, barH * 0.42), 3);
        else ctx.rect(bx + 1, by + 1, Math.max(1, fillW - 2), Math.max(2, barH * 0.42));
        ctx.fill();
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = 'bold 12px "Courier Prime", monospace';
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("❤️ " + Math.ceil(hp) + "/" + maxHp, VIEW_W - pad - 10, by + barH + 5);

    const livesY = by + barH + 23;
    for (let i = 0; i < 3; i++) {
        const lx = bx + i * 18;
        const alive = i < playerLives;
        ctx.globalAlpha = alive ? 1 : .25;
        ctx.fillStyle = alive ? (isHorror ? "#ef4444" : "#ff66aa") : "#555555";
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
        ctx.fillText("🛡️ " + (typeof __ === "function" ? __("ui_god_mode") : "GOD MODE"), bx, livesY + 16);
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
