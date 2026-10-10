(function() {
    const CavernEntranceSystem = {
        crates: [
            { x: 7275, y: 468, w: 32, h: 32, rot: 0.12 },
            { x: 7450, y: 468, w: 32, h: 32, rot: -0.14 },
            { x: 7365, y: 448, w: 36, h: 36, rot: -0.04 },
            { x: 7315, y: 418, w: 32, h: 32, rot: -0.15 },
            { x: 7415, y: 420, w: 32, h: 32, rot: 0.1 },
            { x: 7365, y: 365, w: 36, h: 36, rot: 0.03 }
        ],
        button: {
            x: 6980,
            y: 485,
            w: 48,
            h: 15,
            pressed: false,
            sinkOffset: 0,
            countdown: 0
        },

        init: function(respawnX, isSubCaveRespawn) {
            if (typeof game === "undefined") return;
            const alreadyPassed = !!(
                (game && game.cavernEntranceBlown) ||
                (game && game.gate2Open) ||
                (respawnX != null && respawnX >= 7400 && !isSubCaveRespawn) ||
                (typeof window !== "undefined" && window._cavernEntranceBlownPermanently)
            );
            game.cavernEntranceBlown = alreadyPassed;
            if (alreadyPassed && typeof window !== "undefined") {
                window._cavernEntranceBlownPermanently = true;
            }
            this.button.pressed = alreadyPassed;
            this.button.sinkOffset = alreadyPassed ? 14 : 0;
            this.button.countdown = 0;

            if (Array.isArray(game.platforms)) {
                for (let i = game.platforms.length - 1; i >= 0; i--) {
                    const p = game.platforms[i];
                    if (p.isCavernRockPile) {
                        game.platforms.splice(i, 1);
                    }
                }
                if (!game.cavernEntranceBlown) {
                    const rockPlat = new Platform({
                        x: 7260,
                        y: 470,
                        w: 220,
                        h: 60,
                        isCavernRockPile: true,
                        unbreakable: true
                    });
                    rockPlat.isCavernRockPile = true;
                    game.platforms.push(rockPlat);
                }
            }
        },

        update: function(player, time) {
            if (typeof currentLevel === "undefined" || currentLevel !== 0 || !game || game.subCaveMode) return;
            if (game.cavernEntranceBlown) return;

            const btn = this.button;
            if (!btn.pressed && player) {
                const pbx = player.x + player.w / 2;
                const pby = player.y + player.h;
                if ((player.onGround || player.vy >= 0) &&
                    pbx >= btn.x - 8 && pbx <= btn.x + btn.w + 8 &&
                    pby >= btn.y - 14 && pby <= btn.y + btn.h + 16) {
                    btn.pressed = true;
                    btn.countdown = 28;
                    try {
                        playSound(140, .22, "sawtooth", .45, 50);
                        playSound(660, .1, "square", .2, 300);
                    } catch(e) {}
                    if (typeof applyShake === "function") applyShake(8);
                    if (typeof createExplosion === "function") {
                        createExplosion(btn.x + btn.w / 2, btn.y + btn.h / 2, "#ff1744", 22, 14, ["#ffffff", "#ff1744", "#ff9500"]);
                    }
                    if (typeof addFloatingText === "function") {
                        addFloatingText(btn.x + btn.w / 2, btn.y - 20, "¡DETONACIÓN ACTIVADA!", "#ef4444", 20);
                    }
                }
            } else if (btn.pressed) {
                btn.sinkOffset = Math.min(14, (btn.sinkOffset || 0) + (14 - (btn.sinkOffset || 0)) * 0.4);
                if (btn.countdown > 0) {
                    btn.countdown--;
                    if (btn.countdown % 4 === 0) {
                        try {
                            playSound(650 + (28 - btn.countdown) * 35, 0.04, "sine", 0.15, 900);
                        } catch(e) {}
                    }
                    if (typeof particles !== "undefined") {
                        this.crates.forEach(c => {
                            if (Math.random() < 0.7) {
                                particles.push({
                                    x: c.x + (Math.random() - 0.5) * 6,
                                    y: c.y - c.h / 2 - 8,
                                    vx: (Math.random() - 0.5) * 3,
                                    vy: -Math.random() * 3 - 1,
                                    life: 14 + Math.random() * 8,
                                    color: Math.random() < 0.5 ? "#fde047" : "#f97316",
                                    size: 2 + Math.random() * 2.5,
                                    type: "spark"
                                });
                            }
                        });
                    }
                    if (btn.countdown === 0) {
                        this.detonate(player);
                    }
                }
            }
        },

        detonate: function(player) {
            try {
                if (typeof playSFX === "function") playSFX("sfx_rock_impact");
                if (typeof window.triggerHaptic === "function") window.triggerHaptic("rock");
                playSound(44, 1.4, "sawtooth", 0.9, 12);
                playSound(90, 0.7, "square", 0.6, 20);
            } catch(e) {}
            if (typeof applyShake === "function") applyShake(32);
            if (game) game.flash = 28;

            if (typeof createExplosion === "function") {
                this.crates.forEach(c => {
                    createExplosion(c.x, c.y, "#ef4444", 52, 30, ["#f97316", "#eab308", "#ffffff", "#57534e"]);
                });
            }

            if (typeof particles !== "undefined") {
                for (let i = 0; i < 65; i++) {
                    const a = -Math.PI * (0.05 + Math.random() * 0.9);
                    const spd = 4 + Math.random() * 14;
                    particles.push({
                        x: 7370 + (Math.random() - 0.5) * 160,
                        y: 450 + (Math.random() - 0.5) * 60,
                        vx: Math.cos(a) * spd,
                        vy: Math.sin(a) * spd,
                        rot: Math.random() * Math.PI * 2,
                        rotSpeed: (Math.random() - 0.5) * 0.35,
                        life: 45 + Math.random() * 30,
                        maxLife: 75,
                        size: 6 + Math.random() * 12,
                        color: ["#78716c", "#57534e", "#44403c", "#292524", "#a8a29e"][Math.floor(Math.random() * 5)],
                        type: "rock_chunk"
                    });
                }
                for (let i = 0; i < 30; i++) {
                    particles.push({
                        x: 7370 + (Math.random() - 0.5) * 160,
                        y: 470,
                        vx: (Math.random() - 0.5) * 3.5,
                        vy: -Math.random() * 4 - 1,
                        life: 30 + Math.random() * 20,
                        maxLife: 50,
                        size: 10 + Math.random() * 10,
                        color: ["#44403c", "#78716c", "#f97316"][Math.floor(Math.random() * 3)],
                        type: "smoke"
                    });
                }
            }

            game.cavernEntranceBlown = true;
            if (typeof window !== "undefined") window._cavernEntranceBlownPermanently = true;

            if (Array.isArray(game.platforms)) {
                for (let i = game.platforms.length - 1; i >= 0; i--) {
                    const p = game.platforms[i];
                    if (p.isCavernRockPile) {
                        game.platforms.splice(i, 1);
                    }
                }
            }

            if (typeof addFloatingText === "function") {
                addFloatingText(7370, 340, "¡¡¡BOOM!!! ENTRADA DESPEJADA", "#f59e0b", 26);
            }

            if (player && Math.abs(player.x - 7370) < 180) {
                player.vx = -6;
            }
        },

        draw: function(ctx, cameraX, time) {
            if (typeof currentLevel === "undefined" || currentLevel !== 0 || !game || game.subCaveMode) return;
            const viewMin = cameraX - 250;
            const viewMax = cameraX + (typeof VIEW_W !== "undefined" ? VIEW_W : 1024) + 250;
            if (7520 < viewMin || 6920 > viewMax) return;

            if (!game.cavernEntranceBlown) {
                this.drawButton(ctx, cameraX, time);
                this.drawRockPile(ctx, cameraX, time);
                this.drawTNTCrates(ctx, cameraX, time);
            } else {
                this.drawButton(ctx, cameraX, time);
                this.drawOpenHole(ctx, cameraX, time);
            }
        },

        drawRockPile: function(ctx, cameraX, time) {
            ctx.save();
            const boulders = [
                { x: 7260, y: 476, rx: 32, ry: 24, rot: 0.15, col: "#4b5563" },
                { x: 7295, y: 472, rx: 36, ry: 26, rot: -0.15, col: "#78716c" },
                { x: 7335, y: 478, rx: 35, ry: 24, rot: 0.1, col: "#57534e" },
                { x: 7370, y: 476, rx: 38, ry: 26, rot: -0.06, col: "#6b7280" },
                { x: 7405, y: 475, rx: 36, ry: 25, rot: 0.08, col: "#57534e" },
                { x: 7445, y: 472, rx: 36, ry: 25, rot: -0.18, col: "#78716c" },
                { x: 7480, y: 478, rx: 30, ry: 22, rot: 0.2, col: "#4b5563" },

                { x: 7280, y: 446, rx: 30, ry: 22, rot: 0.12, col: "#57534e" },
                { x: 7315, y: 442, rx: 34, ry: 24, rot: -0.08, col: "#78716c" },
                { x: 7355, y: 445, rx: 40, ry: 28, rot: 0.05, col: "#6b7280" },
                { x: 7395, y: 442, rx: 38, ry: 26, rot: -0.1, col: "#57534e" },
                { x: 7435, y: 446, rx: 32, ry: 22, rot: 0.15, col: "#78716c" },
                { x: 7470, y: 450, rx: 26, ry: 20, rot: -0.12, col: "#4b5563" },

                { x: 7305, y: 412, rx: 28, ry: 20, rot: -0.14, col: "#6b7280" },
                { x: 7340, y: 408, rx: 36, ry: 25, rot: 0.08, col: "#57534e" },
                { x: 7375, y: 405, rx: 38, ry: 26, rot: -0.05, col: "#78716c" },
                { x: 7410, y: 410, rx: 34, ry: 24, rot: 0.12, col: "#57534e" },
                { x: 7445, y: 415, rx: 28, ry: 19, rot: -0.1, col: "#6b7280" },

                { x: 7335, y: 378, rx: 26, ry: 18, rot: 0.1, col: "#78716c" },
                { x: 7365, y: 368, rx: 30, ry: 20, rot: -0.04, col: "#a8a29e" },
                { x: 7395, y: 375, rx: 26, ry: 18, rot: 0.15, col: "#57534e" },
                { x: 7365, y: 345, rx: 22, ry: 15, rot: 0.02, col: "#6b7280" }
            ];

            boulders.forEach(b => {
                const bx = b.x - cameraX;
                const by = b.y;
                ctx.save();
                ctx.translate(bx, by);
                ctx.rotate(b.rot);

                const grad = ctx.createRadialGradient(-b.rx * 0.25, -b.ry * 0.35, b.rx * 0.1, 0, 0, b.rx);
                grad.addColorStop(0, "#a8a29e");
                grad.addColorStop(0.35, b.col);
                grad.addColorStop(1, "#1c1917");
                ctx.fillStyle = grad;
                ctx.strokeStyle = "#1c1917";
                ctx.lineWidth = 2.4;

                ctx.beginPath();
                ctx.ellipse(0, 0, b.rx, b.ry, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.strokeStyle = "rgba(28, 25, 23, 0.75)";
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(-b.rx * 0.45, -b.ry * 0.2);
                ctx.lineTo(-b.rx * 0.1, 0);
                ctx.lineTo(b.rx * 0.35, b.ry * 0.3);
                ctx.stroke();

                ctx.strokeStyle = "rgba(34, 197, 94, 0.45)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, b.rx * 0.85, -Math.PI * 0.85, -Math.PI * 0.15);
                ctx.stroke();

                ctx.restore();
            });

            const pebbles = [
                { x: 7240, y: 495, r: 5 }, { x: 7250, y: 497, r: 7 }, { x: 7255, y: 493, r: 4 },
                { x: 7485, y: 494, r: 6 }, { x: 7495, y: 496, r: 5 }, { x: 7505, y: 497, r: 4 }
            ];
            pebbles.forEach(p => {
                ctx.fillStyle = "#57534e";
                ctx.strokeStyle = "#1c1917";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(p.x - cameraX, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            });

            ctx.restore();
        },

        drawTNTCrates: function(ctx, cameraX, time) {
            ctx.save();
            this.crates.forEach(c => {
                const cx = c.x - cameraX;
                const cy = c.y;
                const hw = c.w / 2;
                const hh = c.h / 2;

                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(c.rot || 0);

                ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
                ctx.fillRect(-hw + 2, hh - 3, c.w, 5);

                const crateGrad = ctx.createLinearGradient(-hw, -hh, -hw, hh);
                crateGrad.addColorStop(0, "#ef4444");
                crateGrad.addColorStop(0.4, "#dc2626");
                crateGrad.addColorStop(1, "#991b1b");
                ctx.fillStyle = crateGrad;
                ctx.strokeStyle = "#450a0a";
                ctx.lineWidth = 2.4;
                ctx.beginPath();
                ctx.roundRect(-hw, -hh, c.w, c.h, 3);
                ctx.fill();
                ctx.stroke();

                ctx.strokeStyle = "rgba(69, 10, 10, 0.6)";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(-hw, -hh + c.h * 0.33);
                ctx.lineTo(hw, -hh + c.h * 0.33);
                ctx.moveTo(-hw, -hh + c.h * 0.66);
                ctx.lineTo(hw, -hh + c.h * 0.66);
                ctx.stroke();

                ctx.fillStyle = "#1e293b";
                const bSize = 6;
                ctx.fillRect(-hw, -hh, bSize, bSize);
                ctx.fillRect(hw - bSize, -hh, bSize, bSize);
                ctx.fillRect(-hw, hh - bSize, bSize, bSize);
                ctx.fillRect(hw - bSize, hh - bSize, bSize, bSize);

                ctx.fillStyle = "#94a3b8";
                ctx.beginPath();
                ctx.arc(-hw + 3, -hh + 3, 1, 0, Math.PI * 2);
                ctx.arc(hw - 3, -hh + 3, 1, 0, Math.PI * 2);
                ctx.arc(-hw + 3, hh - 3, 1, 0, Math.PI * 2);
                ctx.arc(hw - 3, hh - 3, 1, 0, Math.PI * 2);
                ctx.fill();

                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = '900 13px "Fredoka One", Arial, sans-serif';
                ctx.fillStyle = "#000000";
                ctx.fillText("TNT", 0.5, 1);
                ctx.fillStyle = "#ffffff";
                ctx.shadowColor = "#fef08a";
                ctx.shadowBlur = 4;
                ctx.fillText("TNT", 0, 0);
                ctx.shadowBlur = 0;

                ctx.strokeStyle = "#78350f";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, -hh);
                ctx.quadraticCurveTo(4, -hh - 5, 6, -hh - 9);
                ctx.stroke();

                const fuseSpark = Math.sin(time * 0.4 + c.x) * 2;
                ctx.fillStyle = "#fef08a";
                ctx.shadowColor = "#f59e0b";
                ctx.shadowBlur = 8 + fuseSpark * 2;
                ctx.beginPath();
                ctx.arc(6, -hh - 9, 2.5 + fuseSpark * 0.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.restore();
            });
            ctx.restore();
        },

        drawButton: function(ctx, cameraX, time) {
            const btn = this.button;
            const bsx = btn.x - cameraX;
            const bsy = btn.y;
            const isPressed = btn.pressed;
            const sink = btn.sinkOffset || 0;
            const glow = 0.55 + Math.sin(time * 0.14) * 0.35;

            ctx.save();

            const baseGrad = ctx.createLinearGradient(bsx, bsy + 4, bsx, bsy + 4 + btn.h);
            baseGrad.addColorStop(0, "#475569");
            baseGrad.addColorStop(0.5, "#1e293b");
            baseGrad.addColorStop(1, "#0b0f19");
            ctx.fillStyle = baseGrad;
            ctx.beginPath();
            ctx.roundRect(bsx, bsy + 4, btn.w, btn.h, 5);
            ctx.fill();

            ctx.fillStyle = isPressed ? "#15803d" : "#eab308";
            for (let fx = bsx + 6; fx < bsx + btn.w - 6; fx += 13) {
                ctx.beginPath();
                ctx.moveTo(fx, bsy + btn.h + 3);
                ctx.lineTo(fx + 5, bsy + 5);
                ctx.lineTo(fx + 8, bsy + 5);
                ctx.lineTo(fx + 3, bsy + btn.h + 3);
                ctx.closePath();
                ctx.fill();
            }

            ctx.fillStyle = "#94a3b8";
            [[bsx + 4, bsy + 6], [bsx + btn.w - 4, bsy + 6], [bsx + 4, bsy + btn.h + 2], [bsx + btn.w - 4, bsy + btn.h + 2]].forEach(([sx, sy]) => {
                ctx.beginPath();
                ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
                ctx.fill();
            });

            const ledColor = isPressed ? "#22c55e" : "#ff1744";
            ctx.fillStyle = ledColor;
            ctx.shadowColor = ledColor;
            ctx.shadowBlur = isPressed ? 14 : 10 + glow * 4;
            ctx.beginPath();
            ctx.roundRect(bsx + 8, bsy + 1, btn.w - 16, 3, 1.5);
            ctx.fill();
            ctx.shadowBlur = 0;

            const plungerH = 20;
            const plungerY = bsy - 14 + sink;
            const btnGrad = ctx.createLinearGradient(bsx + 6, plungerY, bsx + 6, plungerY + plungerH);
            if (isPressed) {
                btnGrad.addColorStop(0, "#4ade80");
                btnGrad.addColorStop(0.4, "#22c55e");
                btnGrad.addColorStop(0.8, "#16a34a");
                btnGrad.addColorStop(1, "#14532d");
            } else {
                btnGrad.addColorStop(0, "#ff4d6d");
                btnGrad.addColorStop(0.35, "#ef4444");
                btnGrad.addColorStop(0.75, "#dc2626");
                btnGrad.addColorStop(1, "#7f1d1d");
            }

            ctx.fillStyle = btnGrad;
            ctx.shadowColor = isPressed ? "#22c55e" : "#ef4444";
            ctx.shadowBlur = isPressed ? 8 : 12 + glow * 4;
            ctx.beginPath();
            ctx.roundRect(bsx + 6, plungerY, btn.w - 12, plungerH, [9, 9, 3, 3]);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
            ctx.beginPath();
            ctx.ellipse(bsx + btn.w / 2, plungerY + 3.5, (btn.w - 20) / 2, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            if (!isPressed) {
                ctx.fillStyle = "#ffffff";
                ctx.shadowColor = "#fde047";
                ctx.shadowBlur = 8;
                ctx.font = '900 18px "Fredoka One", Arial, sans-serif';
                ctx.fillText("!", bsx + btn.w / 2, plungerY + plungerH / 2);
                ctx.shadowBlur = 0;

                const bounceY = plungerY - 14 - Math.abs(Math.sin(time * 0.18)) * 7;
                ctx.fillStyle = "#fde047";
                ctx.shadowColor = "#e11d48";
                ctx.shadowBlur = 8;
                ctx.font = '900 13px "Fredoka One", Arial, sans-serif';
                ctx.fillText("▼ ¡PULSA! ▼", bsx + btn.w / 2, bounceY);
            } else {
                ctx.fillStyle = "#ffffff";
                ctx.shadowColor = "#4ade80";
                ctx.shadowBlur = 8;
                ctx.font = 'bold 16px "Fredoka One", Arial, sans-serif';
                ctx.fillText("✓", bsx + btn.w / 2, plungerY + plungerH / 2);
            }

            ctx.restore();
        },

        drawOpenHole: function(ctx, cameraX, time) {
            ctx.save();
            const holeLeft = 7300 - cameraX;
            const holeRight = 7440 - cameraX;

            ctx.fillStyle = "#57534e";
            ctx.strokeStyle = "#1c1917";
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(holeLeft, 500);
            ctx.lineTo(holeLeft + 4, 506);
            ctx.lineTo(holeLeft - 3, 514);
            ctx.lineTo(holeLeft + 2, 524);
            ctx.lineTo(holeLeft - 8, 530);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(holeRight, 500);
            ctx.lineTo(holeRight - 4, 506);
            ctx.lineTo(holeRight + 3, 514);
            ctx.lineTo(holeRight - 2, 524);
            ctx.lineTo(holeRight + 8, 530);
            ctx.stroke();

            if (!game.gate2Open) {
                const arrowX = 7370 - cameraX;
                const bob = Math.sin(Date.now() / 180) * 10;
                const arrowY = 360 + bob;

                ctx.shadowBlur = 14;
                ctx.shadowColor = "#00f0ff";
                const txt = typeof __ === "function" ? __("flt_cavern_arrow") : "ADÉNTRATE EN LA CUEVA";
                ctx.font = "900 19px system-ui, -apple-system, sans-serif";
                ctx.textAlign = "center";
                ctx.fillStyle = "#00f0ff";
                ctx.fillText(txt, arrowX, arrowY - 48);

                ctx.fillStyle = "#38bdf8";
                ctx.strokeStyle = "#0284c7";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(arrowX - 16, arrowY - 24);
                ctx.lineTo(arrowX + 16, arrowY - 24);
                ctx.lineTo(arrowX + 16, arrowY - 6);
                ctx.lineTo(arrowX + 30, arrowY - 6);
                ctx.lineTo(arrowX, arrowY + 24);
                ctx.lineTo(arrowX - 30, arrowY - 6);
                ctx.lineTo(arrowX - 16, arrowY - 6);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.moveTo(arrowX - 8, arrowY - 20);
                ctx.lineTo(arrowX + 8, arrowY - 20);
                ctx.lineTo(arrowX + 8, arrowY - 8);
                ctx.lineTo(arrowX + 14, arrowY - 8);
                ctx.lineTo(arrowX, arrowY + 10);
                ctx.lineTo(arrowX - 14, arrowY - 8);
                ctx.lineTo(arrowX - 8, arrowY - 8);
                ctx.closePath();
                ctx.fill();
            }

            ctx.restore();
        }
    };

    window.CavernEntranceSystem = CavernEntranceSystem;
    window.initCavernEntrance = function(respawnX, isSubCaveRespawn) {
        CavernEntranceSystem.init(respawnX, isSubCaveRespawn);
    };
    window.updateCavernEntrance = function(player, time) {
        CavernEntranceSystem.update(player, time);
    };
    window.drawCavernEntrance = function(ctx, cameraX, time) {
        CavernEntranceSystem.draw(ctx, cameraX, time);
    };
})();
