function cinema(cb) {
    var tok = typeof CINEMA_TOKEN !== "undefined" ? CINEMA_TOKEN : 0;
    return function() {
        if (typeof CINEMA_TOKEN === "undefined" || CINEMA_TOKEN !== tok) return;
        if (cb) return cb.apply(this, arguments);
    };
}

function drawBossTransform(ctx, bs, cameraX, time) {
    const drawX = bs.x - cameraX;
    const drawY = bs.y;
    const centerX = drawX + bs.w / 2;
    const centerY = drawY + bs.h / 2;
    const total = bs.transformTotal || 220;
    const progress = Math.min(1, Math.max(0, 1 - (bs.transformTimer / total)));

    ctx.save();

    const floorY = 500;
    const glyphR = Math.min(180, 20 + progress * 160);
    const glyphAlpha = Math.min(0.85, progress * 1.2);
    ctx.save();
    ctx.translate(centerX, floorY);
    ctx.scale(1, 0.32);
    ctx.rotate(time * 0.04);
    ctx.strokeStyle = `rgba(0, 229, 255, ${glyphAlpha})`;
    ctx.lineWidth = 3;
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(0, 0, glyphR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
        const ga = (k * Math.PI) / 3;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ga) * glyphR, Math.sin(ga) * glyphR);
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, glyphR * 0.55, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    const vortexCount = 18;
    for (let v = 0; v < vortexCount; v++) {
        const vAngle = time * 0.1 + (v * Math.PI * 2) / vortexCount;
        const vDist = (1 - ((progress * 3 + v * 0.1) % 1)) * 220 + 30;
        const vx = centerX + Math.cos(vAngle) * vDist;
        const vy = centerY + Math.sin(vAngle) * (vDist * 0.65);
        ctx.fillStyle = v % 2 === 0 ? "#ffffff" : "#38bdf8";
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(vx, vy, 2.5 + Math.sin(time * 0.2 + v) * 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    if (progress > 0.45) {
        const beamProg = (progress - 0.45) / 0.55;
        const beamCount = 8;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(time * 0.05);
        for (let b = 0; b < beamCount; b++) {
            const bAngle = (b * Math.PI * 2) / beamCount;
            const bLen = 80 + beamProg * 140 + Math.sin(time * 0.3 + b) * 20;
            const gBeam = ctx.createLinearGradient(0, 0, Math.cos(bAngle) * bLen, Math.sin(bAngle) * bLen);
            gBeam.addColorStop(0, "rgba(255, 255, 255, 0.95)");
            gBeam.addColorStop(0.3, "rgba(0, 229, 255, 0.7)");
            gBeam.addColorStop(1, "rgba(0, 229, 255, 0)");
            ctx.fillStyle = gBeam;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(bAngle - 0.08) * bLen, Math.sin(bAngle - 0.08) * bLen);
            ctx.lineTo(Math.cos(bAngle + 0.08) * bLen, Math.sin(bAngle + 0.08) * bLen);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }

    ctx.save();
    ctx.translate(centerX, centerY);
    const squish = 1 + Math.sin(progress * Math.PI * 8) * (0.05 + progress * 0.15);
    ctx.scale(squish, 2 - squish);

    if (progress < 0.35) {
        const bw = bs.w;
        const bh = bs.h;
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 16;
        const gCube = ctx.createLinearGradient(-bw / 2, -bh / 2, bw / 2, bh / 2);
        gCube.addColorStop(0, "#38bdf8");
        gCube.addColorStop(1, "#0284c7");
        ctx.fillStyle = gCube;
        ctx.beginPath();
        ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 6);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#ff0044";
        ctx.shadowColor = "#ff0044";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(-bw * 0.22, -bh * 0.15, 3.2, 0, Math.PI * 2);
        ctx.arc(bw * 0.22, -bh * 0.15, 3.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ff0044";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, bh * 0.15, bw * 0.25, 0.2, Math.PI - 0.2);
        ctx.stroke();
    } else {
        const curR = bs.w * 0.65;
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 25;
        const gCocoon = ctx.createRadialGradient(0, 0, 4, 0, 0, curR);
        gCocoon.addColorStop(0, "#ffffff");
        gCocoon.addColorStop(0.35, "#a5f3fc");
        gCocoon.addColorStop(0.7, "#0284c7");
        gCocoon.addColorStop(1, "#0369a1");
        ctx.fillStyle = gCocoon;
        ctx.beginPath();
        ctx.moveTo(0, -curR);
        ctx.lineTo(curR * 0.9, -curR * 0.3);
        ctx.lineTo(curR * 0.8, curR * 0.6);
        ctx.lineTo(0, curR);
        ctx.lineTo(-curR * 0.8, curR * 0.6);
        ctx.lineTo(-curR * 0.9, -curR * 0.3);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "rgba(2, 44, 90, 0.85)";
        ctx.beginPath();
        ctx.arc(0, 0, curR * 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ff0033";
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(-curR * 0.25, -curR * 0.1, 4.5, 0, Math.PI * 2);
        ctx.arc(curR * 0.25, -curR * 0.1, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, -curR);
        ctx.lineTo(curR * 0.2, -curR * 0.3);
        ctx.lineTo(-curR * 0.15, curR * 0.1);
        ctx.lineTo(curR * 0.3, curR * 0.4);
        ctx.lineTo(0, curR);
        ctx.moveTo(-curR * 0.7, -curR * 0.2);
        ctx.lineTo(-curR * 0.2, 0);
        ctx.lineTo(curR * 0.6, curR * 0.2);
        ctx.stroke();
    }
    ctx.restore();
    ctx.restore();
}

function drawIceBlizzardTransition(ctx, cameraX, time) {
    if (!game.blizzardTransition || !game.blizzardTransition.active) return;
    const bt = game.blizzardTransition;
    const progress = bt.progress || 0;
    const vw = typeof VIEW_W !== "undefined" ? VIEW_W : 800;
    const vh = typeof VIEW_H !== "undefined" ? VIEW_H : 600;

    ctx.save();

    const btnScreenX = bt.buttonX - cameraX;
    const btnScreenY = bt.buttonY;

    if (bt.frostRadius > 0) {
        ctx.save();
        for (let ring = 0; ring < 3; ring++) {
            const rOffset = ring * 140;
            const curR = bt.frostRadius - rOffset;
            if (curR > 0 && curR < 2800) {
                const ringAlpha = Math.max(0, 1 - (curR / 2800)) * (progress < 0.75 ? 0.85 : Math.max(0, (1 - progress) * 3.5));
                ctx.strokeStyle = ring === 0 ? `rgba(255, 255, 255, ${ringAlpha})` : `rgba(56, 189, 248, ${ringAlpha * 0.75})`;
                ctx.lineWidth = Math.max(1, 4 - ring);
                ctx.shadowColor = "#38bdf8";
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.ellipse(btnScreenX, btnScreenY, curR, curR * 0.35, 0, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        ctx.restore();

        if (!game.iceMode && game.platforms) {
            ctx.save();
            game.platforms.forEach(p => {
                if (p.x + p.w >= cameraX - 50 && p.x <= cameraX + vw + 50) {
                    const distToBtn = Math.abs((p.x + p.w / 2) - bt.buttonX);
                    if (distToBtn <= bt.frostRadius) {
                        const localP = Math.min(1, (bt.frostRadius - distToBtn) / 200);
                        const px = p.x - cameraX;
                        const frostAlpha = localP * 0.75;
                        const grad = ctx.createLinearGradient(px, p.y, px, p.y + p.h);
                        grad.addColorStop(0, `rgba(224, 242, 254, ${frostAlpha})`);
                        grad.addColorStop(0.5, `rgba(56, 189, 248, ${frostAlpha * 0.6})`);
                        grad.addColorStop(1, `rgba(14, 116, 144, ${frostAlpha * 0.3})`);
                        ctx.fillStyle = grad;
                        ctx.beginPath();
                        ctx.roundRect(px, p.y, p.w, p.h, [3, 3, 2, 2]);
                        ctx.fill();

                        ctx.fillStyle = `rgba(255, 255, 255, ${frostAlpha * 0.9})`;
                        ctx.fillRect(px, p.y, p.w, 3);

                        const icicleCount = Math.floor(p.w / 18);
                        for (let ic = 0; ic < icicleCount; ic++) {
                            const icX = px + 8 + ic * 18;
                            const icLen = (5 + ((ic * 7 + p.x) % 10)) * localP;
                            ctx.fillStyle = `rgba(224, 242, 254, ${frostAlpha * 0.85})`;
                            ctx.beginPath();
                            ctx.moveTo(icX - 2.5, p.y + p.h);
                            ctx.lineTo(icX + 2.5, p.y + p.h);
                            ctx.lineTo(icX, p.y + p.h + icLen);
                            ctx.closePath();
                            ctx.fill();
                        }
                    }
                }
            });
            ctx.restore();
        }
    }

    const vigProgress = progress < 0.72 ? (progress / 0.72) : Math.max(0, 1 - (progress - 0.72) / 0.28 * 0.5);
    const radGrad = ctx.createRadialGradient(vw / 2, vh / 2, vw * 0.25, vw / 2, vh / 2, vw * 0.72);
    radGrad.addColorStop(0, "rgba(56, 189, 248, 0)");
    radGrad.addColorStop(0.65, `rgba(14, 165, 233, ${(vigProgress * 0.18).toFixed(3)})`);
    radGrad.addColorStop(1, `rgba(2, 132, 199, ${(vigProgress * 0.45).toFixed(3)})`);
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, vw, vh);

    const frostDepth = vigProgress * 48;
    if (frostDepth > 2) {
        ctx.save();
        ctx.fillStyle = "rgba(240, 249, 255, 0.82)";
        ctx.strokeStyle = "rgba(56, 189, 248, 0.9)";
        ctx.lineWidth = 1.5;
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.moveTo(0, vh);
        for (let x = 0; x <= vw; x += 25) {
            const h = (Math.cos(x * 0.07 - time * 0.04) * 0.35 + 0.65) * frostDepth;
            ctx.lineTo(x + 12, vh - h);
            ctx.lineTo(x + 25, vh);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let y = 0; y <= vh; y += 24) {
            const w = (Math.sin(y * 0.09) * 0.35 + 0.65) * (frostDepth * 0.7);
            ctx.lineTo(w, y + 12);
            ctx.lineTo(0, y + 24);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(vw, 0);
        for (let y = 0; y <= vh; y += 24) {
            const w = (Math.cos(y * 0.09) * 0.35 + 0.65) * (frostDepth * 0.7);
            ctx.lineTo(vw - w, y + 12);
            ctx.lineTo(vw, y + 24);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    const stormMult = progress < 0.72 ? (0.3 + (progress / 0.72) * 1.0) : Math.max(0.4, 1.3 - (progress - 0.72) * 2.5);
    ctx.save();
    for (let w = 0; w < 4; w++) {
        const fogY = vh * (0.2 + w * 0.22) + Math.sin(time * 0.06 + w) * 25;
        const fogSpeed = 16 + w * 6;
        const fogX = (-(time * fogSpeed * stormMult) + w * 260) % (vw + 400) - 200;
        const fogGrad = ctx.createLinearGradient(fogX, fogY, fogX + 350, fogY);
        fogGrad.addColorStop(0, "rgba(224, 242, 254, 0)");
        fogGrad.addColorStop(0.35, `rgba(186, 230, 253, ${(0.18 * stormMult).toFixed(3)})`);
        fogGrad.addColorStop(0.7, `rgba(255, 255, 255, ${(0.22 * stormMult).toFixed(3)})`);
        fogGrad.addColorStop(1, "rgba(224, 242, 254, 0)");
        ctx.fillStyle = fogGrad;
        ctx.fillRect(fogX, fogY - 35, 350, 70);
    }
    ctx.restore();

    ctx.save();
    const streakCount = Math.floor(32 * stormMult);
    for (let s = 0; s < streakCount; s++) {
        const sSeed = s * 73.19;
        const sSpeed = 24 + ((sSeed * 17) % 20);
        const sX = (vw + 200) - ((time * sSpeed * stormMult + sSeed * 30) % (vw + 400));
        const sY = (sSeed * 37) % vh + Math.sin(time * 0.15 + s) * 8;
        const sLen = 80 + ((sSeed * 11) % 140);
        const sH = 1.5 + ((sSeed * 3) % 2.5);

        const sGrad = ctx.createLinearGradient(sX, sY, sX + sLen, sY);
        sGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
        sGrad.addColorStop(0.4, `rgba(255, 255, 255, ${(0.6 * stormMult).toFixed(3)})`);
        sGrad.addColorStop(0.8, `rgba(186, 230, 253, ${(0.4 * stormMult).toFixed(3)})`);
        sGrad.addColorStop(1, "rgba(56, 189, 248, 0)");

        ctx.fillStyle = sGrad;
        ctx.fillRect(sX, sY, sLen, sH);
    }
    ctx.restore();

    if (bt.particles && bt.particles.length > 0) {
        ctx.save();
        for (let p of bt.particles) {
            p.x += p.vx * stormMult;
            p.y += p.vy + Math.sin(time * 0.12 + p.seed) * 1.8;
            p.rot += p.rotSpeed * stormMult;

            if (p.x < -40) {
                p.x = vw + 30 + Math.random() * 40;
                p.y = Math.random() * vh;
            }
            if (p.y > vh + 20) {
                p.y = -20;
                p.x = Math.random() * vw;
            }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            const pAlpha = p.alpha * Math.min(1, stormMult * 1.2);

            if (p.type === "flake") {
                ctx.strokeStyle = `rgba(255, 255, 255, ${pAlpha.toFixed(3)})`;
                ctx.lineWidth = 1.4;
                for (let k = 0; k < 3; k++) {
                    ctx.beginPath();
                    ctx.moveTo(-p.size, 0);
                    ctx.lineTo(p.size, 0);
                    ctx.stroke();
                    ctx.rotate(Math.PI / 3);
                }
            } else if (p.type === "crystal") {
                ctx.fillStyle = `rgba(186, 230, 253, ${pAlpha.toFixed(3)})`;
                ctx.strokeStyle = `rgba(255, 255, 255, ${(pAlpha * 0.8).toFixed(3)})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(0, -p.size * 1.3);
                ctx.lineTo(p.size * 0.8, 0);
                ctx.lineTo(0, p.size * 1.3);
                ctx.lineTo(-p.size * 0.8, 0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else {
                ctx.fillStyle = `rgba(255, 255, 255, ${pAlpha.toFixed(3)})`;
                ctx.beginPath();
                ctx.arc(0, 0, p.size * 0.7, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
        ctx.restore();
    }

    if (progress >= 0.22 && progress <= 0.68) {
        ctx.save();
        const textAlpha = progress < 0.32 ? (progress - 0.22) / 0.1 : progress > 0.58 ? (0.68 - progress) / 0.1 : 1;
        ctx.globalAlpha = textAlpha;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = 'bold 26px "Fredoka One", cursive, sans-serif';
        const txt = typeof __ === "function" ? (__("ui_blizzard_warning") || "¡VENTISCA GLACIAL!") : "¡VENTISCA GLACIAL!";
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 18;
        ctx.strokeStyle = "#0369a1";
        ctx.lineWidth = 4;
        ctx.strokeText(txt, vw / 2, 75);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(txt, vw / 2, 75);
        ctx.restore();
    }

    ctx.restore();
}
window.drawIceBlizzardTransition = drawIceBlizzardTransition;

function updateAndDrawBlueSquare(ctx, cameraX, time) {
    if (currentLevel !== 0 || !game.blueSquare || game.subCaveMode) return;
    const bs = game.blueSquare;
    if (bs.state === "defeated" && bs._defeatDialogShown) return;
    if (!game.player) return;
    const dist = Math.hypot(game.player.x + game.player.w / 2 - (bs.x + bs.w / 2), game.player.y + game.player.h / 2 - (bs.y + bs.h / 2));
    const entranceGate = game.platforms.find(p => p.isArenaGate === "entrance");
    const exitGate = game.platforms.find(p => p.isArenaGate === "exit");
    if (bs.state === "sweating" && dist < 160 && !game.player.frozen) {
        bs.state = "dialog_help";
        game.player.frozen = true;
        showAnimatedDialogue(__("ui_speaker_blue_square"), "🔷", __("dlg_cuadro_azul_pide_ayuda"), cinema(() => {
            const buttonPlat = game.platforms.find(p => p.button);
            if (buttonPlat && typeof gsap !== "undefined") {
                gsap.to(game, {
                    cameraOverrideX: buttonPlat.x - VIEW_W / 2 + buttonPlat.w / 2,
                    duration: 1,
                    ease: "power2.inOut",
                    onComplete: cinema(() => {
                        setTimeout(cinema(() => {
                            gsap.to(game, {
                                cameraOverrideX: game.player.x - VIEW_W / 2,
                                duration: .9,
                                ease: "power2.inOut",
                                onComplete: cinema(() => {
                                    delete game.cameraOverrideX;
                                    bs.state = "waiting_button";
                                    game.player.frozen = false;
                                })
                            });
                        }), 1e3);
                    })
                });
            } else {
                bs.state = "waiting_button";
                game.player.frozen = false;
            }
        }));
    }
    if (!game.subCaveMode && (bs.state === "sweating" || bs.state === "waiting_button") && exitGate && entranceGate && !game.player.frozen && !game.arenaLocked && !bs._exitGuardBusy && game.player.x >= entranceGate.x && game.player.x + game.player.w > exitGate.x - 30 && game.player.x < exitGate.x + 200) {
        bs._exitGuardBusy = true;
        game.player.frozen = true;
        game.player.vx = 0;
        playSound(660, .25, "triangle", .3, 880);
        if (typeof gsap !== "undefined") {
            gsap.to(game, {
                cameraOverrideX: bs.x - VIEW_W / 2 + bs.w / 2,
                duration: .9,
                ease: "power2.inOut",
                onComplete: () => {
                    showAnimatedDialogue(__("ui_speaker_blue_square"), "🔷", __("dlg_cuadro_azul_pide_ayuda"), cinema(() => {
                        game.player.x = exitGate.x - 1e3;
                        game.player.y = 500 - game.player.h;
                        game.player.vx = 0;
                        game.player.vy = 0;
                        gsap.to(game, {
                            cameraOverrideX: game.player.x - VIEW_W / 2,
                            duration: .9,
                            ease: "power2.inOut",
                            onComplete: cinema(() => {
                                delete game.cameraOverrideX;
                                bs._exitGuardBusy = false;
                                game.player.frozen = false;
                            })
                        });
                    }));
                }
            });
        } else {
            game.player.x = exitGate.x - 1e3;
            game.player.y = 500 - game.player.h;
            bs._exitGuardBusy = false;
            game.player.frozen = false;
        }
    }
    if (bs.state === "waiting_button") {
        const buttonPlat = game.platforms.find(p => p.button);
        if (buttonPlat) {
            const px = game.player.x + game.player.w / 2;
            const py = game.player.y + game.player.h;
            if (px > buttonPlat.x && px < buttonPlat.x + buttonPlat.w && py >= buttonPlat.y && py <= buttonPlat.y + buttonPlat.h + 6 && game.player.onGround) {
                bs.state = "blizzard_transition";
                game.player.frozen = true;
                game.player.vx = 0;
                game.player.vy = 0;
                game.blizzardTransition = {
                    active: true,
                    timer: 0,
                    maxTimer: 220,
                    buttonX: buttonPlat.x + buttonPlat.w / 2,
                    buttonY: buttonPlat.y,
                    particles: [],
                    frostRadius: 0
                };
                const vw = typeof VIEW_W !== "undefined" ? VIEW_W : 800;
                const vh = typeof VIEW_H !== "undefined" ? VIEW_H : 600;
                for (let i = 0; i < 160; i++) {
                    game.blizzardTransition.particles.push({
                        x: Math.random() * (vw + 200) - 100,
                        y: Math.random() * vh,
                        vx: -(18 + Math.random() * 20),
                        vy: 1.5 + Math.random() * 3.5,
                        size: 1.5 + Math.random() * 3.5,
                        type: Math.random() < 0.35 ? "flake" : Math.random() < 0.65 ? "crystal" : "dot",
                        rot: Math.random() * Math.PI * 2,
                        rotSpeed: (Math.random() - 0.5) * 0.25,
                        seed: Math.random() * 100,
                        alpha: 0.6 + Math.random() * 0.4
                    });
                }
                playSound(180, 0.45, "sawtooth", 0.5, 80);
                playSound(60, 0.8, "sine", 0.7, 35);
                applyShake(8);
            }
        }
    }
    if (bs.state === "blizzard_transition") {
        const bt = game.blizzardTransition;
        if (!bt) {
            bs.state = "button_pressed";
        } else {
            bt.timer++;
            const progress = Math.min(1, bt.timer / bt.maxTimer);
            bt.progress = progress;
            bt.frostRadius = Math.min(2600, progress * 2800);

            if (progress < 0.68) {
                applyShake(2 + progress * 8);
            } else if (progress >= 0.68 && progress <= 0.76) {
                applyShake(14 + Math.random() * 6);
            } else {
                applyShake(Math.max(0, (1 - progress) * 8));
            }

            if (bt.timer % 28 === 0 && progress < 0.72) {
                const baseFreq = 160 + Math.sin(bt.timer * 0.12) * 90;
                playSound(baseFreq, 0.45, "sawtooth", 0.28, baseFreq + 240);
                playSound(baseFreq * 1.5, 0.35, "sine", 0.2, baseFreq * 2);
            }
            if (bt.timer % 18 === 0 && progress < 0.75) {
                playSound(1400 + Math.random() * 600, 0.08, "triangle", 0.25, 400);
            }

            if (bt.timer === 158) {
                game.flash = 38;
                applyShake(28);
                playSound(1800, 0.75, "sine", 0.65, 80);
                playSound(80, 0.9, "sawtooth", 0.65, 30);
                playSound(450, 0.5, "triangle", 0.5, 1200);

                game.iceMode = true;
                game.platforms.forEach(p => {
                    p.broken = false;
                    p.jumpHits = 0;
                });
            }

            if (bt.timer >= bt.maxTimer) {
                bt.active = false;
                bs.state = "button_pressed";

                const startMock = cinema(() => {
                    if (typeof gsap !== "undefined") {
                        gsap.to(game, {
                            cameraOverrideX: bs.x - VIEW_W / 2 + bs.w / 2,
                            duration: 1,
                            ease: "power2.inOut",
                            onComplete: cinema(() => {
                                showAnimatedDialogue(__("ui_speaker_blue_square"), "😈", __("dlg_boss1_betrayal"), cinema(() => {
                                    bs.state = "boss_transform";
                                    bs.transformTimer = 220;
                                    bs.transformTotal = 220;
                                    bs.transStartY = bs.y;
                                    bs.transStartX = bs.x;
                                    playSound(150, .5, "sawtooth", .4, 40);
                                }), 2800);
                            })
                        });
                    } else {
                        bs.state = "boss_transform";
                        bs.transformTimer = 220;
                        bs.transformTotal = 220;
                        bs.transStartY = bs.y;
                        bs.transStartX = bs.x;
                        playSound(150, .5, "sawtooth", .4, 40);
                    }
                });

                if (typeof window.closeArenaWithHammers === "function") {
                    window.closeArenaWithHammers(cinema(() => startMock()));
                } else {
                    startMock();
                }
            }
        }
    }
    if (bs.state === "boss_transform") {
        bs.transformTimer--;
        const total = bs.transformTotal || 220;
        const progress = Math.min(1, Math.max(0, 1 - (bs.transformTimer / total)));

        applyShake(3 + progress * 15);
        game.flash = Math.max(game.flash, progress > 0.85 ? 16 : 4);

        if (bs.transformTimer === 170) {
            playSound(300, 0.35, "sine", 0.4, 600);
            if (typeof addFloatingText === "function") {
                addFloatingText(bs.x + bs.w / 2, bs.y - 35, typeof __ === "function" ? __("flt_boss1_trap") : "¡ILUSO! ¡CAÍSTE EN LA TRAMPA!", "#00ffff", 22);
            }
        } else if (bs.transformTimer === 100) {
            playSound(550, 0.45, "sawtooth", 0.45, 900);
            if (typeof addFloatingText === "function") {
                addFloatingText(bs.x + bs.w / 2, bs.y - 50, typeof __ === "function" ? __("flt_boss1_freeze") : "¡EL FRÍO ABSOLUTO ME CONSUME!", "#7dd3fc", 24);
            }
        } else if (bs.transformTimer === 30) {
            playSound(120, 0.6, "sawtooth", 0.6, 30);
            applyShake(24);
            if (typeof addFloatingText === "function") {
                addFloatingText(bs.x + bs.w / 2, bs.y - 55, typeof __ === "function" ? __("flt_boss1_emerge") : "¡¡¡SURGE, TITÁN GLACIAL!!!", "#ff0055", 26);
            }
        }

        if (bs.transStartY === undefined) bs.transStartY = bs.y;
        const targetFloatY = 280;
        bs.y = bs.transStartY + (targetFloatY - bs.transStartY) * Math.min(1, progress * 1.5);

        bs.w = 28 + (90 - 28) * Math.min(1, progress * 1.25);
        bs.h = bs.w;

        if (bs.transformTimer <= 0) {
            if (typeof createExplosion === "function") {
                createExplosion(bs.x + bs.w / 2, bs.y + bs.h / 2, "#ffffff", 80, 50, ["#00ffff", "#80e5ff", "#ffffff", "#0088ff", "#ff0055"]);
            }
            if (typeof applyShake === "function") applyShake(30);
            if (game) game.flash = 60;
            try {
                playSound(60, 0.8, "sawtooth", 0.6, 20);
                playSound(1200, 0.4, "sine", 0.5, 300);
            } catch (_) {}

            bs.state = "presentation";
            bs.isBoss = true;
            bs.w = 90;
            bs.h = 90;
            const baseHp = window.postGameHorror ? 68 : 42;
            bs.health = baseHp;
            bs.maxHealth = baseHp;
            const entranceGateObj = game.platforms.find(p => p.isArenaGate === "entrance");
            const exitGateObj = game.platforms.find(p => p.isArenaGate === "exit");
            game.arenaLocked = true;
            game.arenaMinX = entranceGateObj ? entranceGateObj.x + entranceGateObj.w : 16550 + 90;
            game.arenaMaxX = exitGateObj ? exitGateObj.x : 19200;
            game.platforms.forEach(p => {
                if (p.moving) {
                    p.unbreakable = true;
                    p.broken = false;
                }
            });
            if (game.player) {
                game.player.frozen = true;
                game.player.vx = 0;
            }
            if (typeof window.playBossPresentation === "function") {
                window.playBossPresentation({
                    name: "boss_name_1",
                    title: "boss_title_1",
                    icon: "❄️",
                    themeColor: "#00e5ff",
                    accentColor: "#ffffff",
                    targetX: bs.x + bs.w / 2,
                    targetY: bs.y + bs.h / 2,
                    zoom: 1.45,
                    duration: 3.2
                }, cinema(() => {
                    bs.state = "boss_fight";
                    bs._camRecovered = true;
                    if (game.player) game.player.frozen = false;
                    if (typeof window.BossHUD !== "undefined") {
                        window.BossHUD.show("boss_name_1", bs.health, bs.maxHealth, "#00e5ff");
                    }
                    if (!window.postGameHorror) {
                        playBGM("bgm_boss_ice");
                    }
                }));
            } else {
                bs.state = "boss_fight";
                bs._camRecovered = true;
                if (typeof window.BossHUD !== "undefined") {
                    window.BossHUD.show("boss_name_1", bs.health, bs.maxHealth, "#00e5ff");
                }
                if (!window.postGameHorror) {
                    playBGM("bgm_boss_ice");
                }
                delete game.cameraOverrideX;
                if (game.player) game.player.frozen = false;
            }
        }
    }
    if (bs.state === "boss_fight") {
        if (!bs._camRecovered && !game.player.frozen && !bs._enrageCineActive) {
            bs._camRecovered = true;
        }
        if (typeof window.BossHUD !== "undefined") {
            window.BossHUD.update(bs.health, bs.maxHealth, bs.health <= bs.maxHealth * .5 ? "#ff0044" : "#00e5ff");
        }
        if (bs._dashPendingDmg) {
            const d = bs._dashPendingDmg;
            bs._dashPendingDmg = 0;
            bs.health -= d;
            bs.hitFlash = 10;
            bs.impactTimer = 12;
            addFloatingText(bs.x + bs.w / 2, bs.y - 12, "-" + d, "#ff00e0", 22);
            playSound(700, .18, "square", .25, 400);
            try {
                applyShake(6);
            } catch (e) {}
            try {
                createExplosion(bs.x + bs.w / 2, bs.y + bs.h / 2, "#ff0055", 26, 16, [ "#ff0055", "#00ffff", "#ffffff" ]);
            } catch (e) {}
            if (bs.health <= 0) {
                bs.state = "defeated";
            }
        }
        if (!bs._enrageCineActive && bs.state === "boss_fight") game.player.frozen = false;
        if (!bs._enrageCineDone && bs.health > 0 && bs.health <= bs.maxHealth * .5 && (!bs.slamState || bs.slamState === "idle")) {
            bs._enrageCineDone = true;
            bs._enrageCineActive = true;
            game.player.frozen = true;
            game._furiaTint = 0;
            playSound(90, .9, "sawtooth", .45, 35);
            addFloatingText(bs.x + bs.w / 2, bs.y - 50, typeof __ === "function" ? __("flt_boss1_rage") : "¡¡¡FURIA GLACIAL DESATADA!!!", "#ff0044", 28);
            if (typeof gsap !== "undefined") {
                gsap.to(game, {
                    cameraOverrideX: bs.x - VIEW_W / 2 + bs.w / 2,
                    duration: .8,
                    ease: "power2.inOut",
                    onComplete: cinema(() => {
                        gsap.to(game, {
                            _furiaTint: .45,
                            duration: .8,
                            ease: "power2.in",
                            onUpdate: () => {
                                applyShake(10);
                                bs.hitFlash = 6;
                                if (Math.random() < 0.8) {
                                    const bCenterX = bs.x + bs.w / 2;
                                    const bCenterY = bs.y + bs.h / 2;
                                    const angle = Math.random() * Math.PI * 2;
                                    const dist = 320 + Math.random() * 160;
                                    bs.enrageSnowflakes = bs.enrageSnowflakes || [];
                                    bs.enrageSnowflakes.push({
                                        x: bCenterX + Math.cos(angle) * dist,
                                        y: bCenterY + Math.sin(angle) * dist,
                                        angle: angle,
                                        dist: dist,
                                        size: 10 + Math.random() * 8,
                                        rot: 0,
                                        rotSpeed: 0.1,
                                        color: "#ffffff"
                                    });
                                }
                            },
                            onComplete: cinema(() => {
                                bs.hitFlash = 35;
                                applyShake(26);
                                game.flash = 40;
                                playSound(60, .9, "sawtooth", .6, 22);
                                playSound(950, .4, "sine", .5, 120);
                                if (typeof createExplosion === "function") {
                                    createExplosion(bs.x + bs.w / 2, bs.y + bs.h / 2, "#ff0044", 60, 40, ["#ff0044", "#00ffff", "#ffffff"]);
                                }
                                gsap.to(game, {
                                    _furiaTint: .15,
                                    duration: 1.4,
                                    delay: .5
                                });
                                gsap.to(game, {
                                    cameraOverrideX: game.player.x - VIEW_W / 2,
                                    duration: .8,
                                    ease: "power2.inOut",
                                    onComplete: cinema(() => {
                                        delete game.cameraOverrideX;
                                        bs._enrageCineActive = false;
                                        game.player.frozen = false;
                                    })
                                });
                            })
                        });
                    })
                });
            } else {
                game._furiaTint = .15;
                bs._enrageCineActive = false;
                game.player.frozen = false;
            }
        }
        if (bs._enrageCineActive) return;

        if (bs.slamState === undefined) {
            bs.slamState = "idle";
            bs.slamTimer = 0;
            bs.blinkCount = 0;
            bs.shootTimer = 0;
            bs.rainTimer = 0;
            bs.squishX = 1;
            bs.squishY = 1;
            bs.mouthOpenTimer = 0;
            bs.mouthCycle = 0;
            bs.eyeBlinkTimer = 0;
            bs.impactTimer = 0;
        }
        if (bs.slamState === "idle" || bs.slamState === "blink") {
            bs.squishX += (1 - bs.squishX) * .12;
            bs.squishY += (1 - bs.squishY) * .12;
        }
        if (bs.impactTimer > 0) bs.impactTimer--;
        bs.eyeBlinkTimer = (bs.eyeBlinkTimer || 0) + 1;
        if (bs.eyeBlinkTimer > 160 + Math.sin(time) * 40) {
            bs.eyeBlinkTimer = -14;
        }
        if (bs.mouthOpenTimer > 0) {
            bs.mouthOpenTimer--;
            bs.mouthCycle = Math.sin((35 - bs.mouthOpenTimer) * .35);
        } else {
            bs.mouthCycle *= .8;
        }
        const isLowHp = bs.health <= bs.maxHealth * .4;
        const isEnraged = bs.health <= bs.maxHealth * .5;
        const isAttacking = (bs.mouthOpenTimer || 0) > 0 || bs.slamState === "blink" || bs.slamState === "slamming";

        bs.enrageScale = bs.enrageScale || 1.0;
        const targetScale = isEnraged ? 2.0 : 1.0;
        bs.enrageScale += (targetScale - bs.enrageScale) * 0.05;

        const baseW = 90;
        const baseH = 90;
        const targetW = baseW * bs.enrageScale;
        const targetH = baseH * bs.enrageScale;
        const prevCenterX = bs.x + bs.w / 2;
        const prevCenterY = bs.y + bs.h / 2;
        bs.w = targetW;
        bs.h = targetH;
        bs.x = prevCenterX - bs.w / 2;
        bs.y = prevCenterY - bs.h / 2;

        const arenaCenterX = (game.arenaMinX + game.arenaMaxX) / 2;
        const floatAmplitude = isEnraged ? 220 : 160;
        const targetX = arenaCenterX + Math.sin(time * .05) * floatAmplitude - bs.w / 2;
        const targetY = (isEnraged ? 105 : 130) + Math.sin(time * .07) * (isAttacking ? 35 : 25);
        bs.targetY = targetY;

        if (bs.slamState !== "embedded") {
            bs.x += (targetX - bs.x) * .08;
        }
        if (bs.slamState === "idle" || bs.slamState === "blink") {
            bs.y += (targetY - bs.y) * .08;
        }

        if (isEnraged) {
            bs.enrageSnowflakes = bs.enrageSnowflakes || [];
            const bCenterX = bs.x + bs.w / 2;
            const bCenterY = bs.y + bs.h / 2;
            if (bs.enrageSnowflakes.length < 16 && Math.random() < 0.5) {
                const angle = Math.random() * Math.PI * 2;
                const dist = (bs.w * 1.3) + Math.random() * 200;
                bs.enrageSnowflakes.push({
                    x: bCenterX + Math.cos(angle) * dist,
                    y: bCenterY + Math.sin(angle) * dist,
                    angle: angle,
                    dist: dist,
                    size: 7 + Math.random() * 6,
                    rot: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 0.12,
                    color: ["#ffffff", "#cffafe", "#7dd3fc", "#38bdf8", "#00ffff"][Math.floor(Math.random() * 5)]
                });
            }
            for (let i = bs.enrageSnowflakes.length - 1; i >= 0; i--) {
                const sn = bs.enrageSnowflakes[i];
                sn.dist -= 5;
                sn.angle += 0.05;
                sn.x = bCenterX + Math.cos(sn.angle) * sn.dist;
                sn.y = bCenterY + Math.sin(sn.angle) * sn.dist;
                sn.rot += sn.rotSpeed;
                if (sn.dist <= bs.w * 0.38) {
                    if (Math.random() < 0.15 && typeof particles !== "undefined") {
                        particles.push({
                            x: sn.x,
                            y: sn.y,
                            vx: (Math.random() - 0.5) * 3,
                            vy: (Math.random() - 0.5) * 3,
                            life: 10,
                            color: sn.color,
                            size: 2.5,
                            type: "spark"
                        });
                    }
                    bs.enrageSnowflakes.splice(i, 1);
                }
            }
        }

        if (Math.random() < .25) {
            particles.push({
                x: bs.x + bs.w / 2 + (Math.random() - .5) * bs.w,
                y: bs.y + bs.h / 2 + (Math.random() - .5) * bs.h,
                vx: (Math.random() - .5) * 1.5,
                vy: -Math.random() * 1.5 - .5,
                life: 18 + Math.random() * 10,
                color: Math.random() > .5 ? "#00ffff" : "#80e5ff",
                size: 6 + Math.random() * 6,
                type: "spark"
            });
        }
        bs.slamTimer = (bs.slamTimer || 0) + 1;
        const slamThreshold = window.postGameHorror ? isEnraged ? 160 : 240 : isEnraged ? 380 : 540;
        if (bs.slamTimer >= slamThreshold && bs.slamState === "idle" && !bs._enrageCineActive) {
            bs.slamState = "blink";
            bs.slamTimer = 0;
            bs.blinkCount = 0;
        }
        if (bs.slamState === "blink") {
            bs.squishY = .9;
            bs.squishX = 1.1;
            if (bs.slamTimer % 25 === 0) {
                bs.blinkCount++;
                bs.hitFlash = 12;
                playSound(350 + bs.blinkCount * 80, .2, "sine", .2, 400);
                if (bs.blinkCount >= 3) {
                    bs.slamState = "slamming";
                    bs.slamTimer = 0;
                    bs._slamY = bs.y;
                }
            }
        }
        if (bs.slamState === "slamming") {
            bs.squishY = 1.35;
            bs.squishX = 0.75;
            const progress = Math.min(1, bs.slamTimer / 14);
            const easeProgress = progress * progress;
            const sinkGroundY = isEnraged ? 444 : 438;
            bs.y = bs._slamY + (sinkGroundY - bs._slamY) * easeProgress;

            if (progress >= 1) {
                bs.slamState = "embedded";
                bs.slamTimer = 0;
                bs._sinkY = sinkGroundY;
                bs._sinkX = bs.x;
                bs.squishY = 0.52;
                bs.squishX = 1.52;
                bs.impactTimer = 35;
                applyShake(isEnraged ? 30 : 24);
                game.flash = isEnraged ? 26 : 18;

                try {
                    if (typeof playSFX === "function") playSFX("sfx_rock_impact");
                    playSound(45, 0.7, "sawtooth", 0.65, 20);
                    playSound(880, 0.35, "sine", 0.3, 1320);
                } catch(e) {}

                const pCenterX = bs.x + bs.w / 2;
                for (let i = stars.length - 1; i >= 0; i--) {
                    if (stars[i]._bossDrop && Date.now() - stars[i]._born > 15e3) stars.splice(i, 1);
                }
                for (let i = 0; i < 4; i++) {
                    stars.push({
                        x: game.player.x + game.player.w / 2 - 12 + (i - 1.5) * 55 + (Math.random() * 16 - 8),
                        y: 415 + Math.random() * 40,
                        collected: false,
                        _bossDrop: true,
                        _born: Date.now()
                    });
                }

                particles.push({
                    x: pCenterX,
                    y: 500,
                    radius: 8,
                    maxRadius: isEnraged ? 180 : 130,
                    life: 1,
                    maxLife: 22,
                    type: "ring",
                    lineWidth: 6,
                    color: isEnraged ? "#ff0055" : "#00f0ff"
                });
                particles.push({
                    x: pCenterX,
                    y: 500,
                    radius: 4,
                    maxRadius: isEnraged ? 240 : 180,
                    life: 1,
                    maxLife: 28,
                    type: "ring",
                    lineWidth: 3,
                    color: "#ffffff"
                });

                const debrisCount = isEnraged ? 36 : 24;
                for (let i = 0; i < debrisCount; i++) {
                    const pDir = (i % 2 === 0 ? 1 : -1);
                    const spd = 4 + Math.random() * 9;
                    particles.push({
                        x: pCenterX + pDir * (10 + Math.random() * 25),
                        y: 500,
                        vx: pDir * spd,
                        vy: -Math.random() * 5.5 - 1.5,
                        life: 20 + Math.random() * 15,
                        maxLife: 35,
                        color: isEnraged ? (Math.random() < 0.5 ? "#f43f5e" : "#ffe4e6") : (Math.random() < 0.5 ? "#38bdf8" : "#ffffff"),
                        size: 3.5 + Math.random() * 4,
                        type: "spark"
                    });
                }

                const spikeCount = isEnraged ? (window.postGameHorror ? 8 : 6) : (window.postGameHorror ? 7 : 5);
                const spikeH = isEnraged ? 230 : 180;
                const spikeW = isEnraged ? 78 : 64;
                for (let i = 0; i < spikeCount; i++) {
                    const spikeX = game.arenaMinX + 80 + i * ((game.arenaMaxX - game.arenaMinX - 160) / (spikeCount - 1));
                    const distFromBoss = Math.abs(spikeX - pCenterX);
                    const waveDelay = Math.round(distFromBoss * 0.022);
                    enemyProjectiles.push({
                        x: spikeX,
                        y: 500 - spikeH,
                        w: spikeW,
                        h: spikeH,
                        maxH: spikeH,
                        radius: spikeW / 2,
                        vx: 0,
                        vy: 0,
                        color: isEnraged ? "#ff0055" : "#00d4ff",
                        isGiant: false,
                        damage: isEnraged ? 20 : 15,
                        isSpike: true,
                        spikeTimer: 120,
                        maxSpikeTimer: 120,
                        emergeDelay: waveDelay,
                        isEnraged: isEnraged
                    });
                }
            }
        }
        if (bs.slamState === "embedded") {
            bs.y = bs._sinkY || (isEnraged ? 444 : 438);
            if (bs._sinkX !== undefined) bs.x = bs._sinkX;
            const embedTime = isEnraged ? 26 : 34;
            const tRatio = bs.slamTimer / embedTime;
            bs.squishX = 1.52 - tRatio * 0.35 + Math.sin(bs.slamTimer * 0.45) * 0.06;
            bs.squishY = 0.52 + tRatio * 0.35 - Math.sin(bs.slamTimer * 0.45) * 0.06;

            if (bs.slamTimer % 4 === 0) {
                particles.push({
                    x: bs.x + bs.w / 2 + (Math.random() - 0.5) * bs.w * 0.8,
                    y: 500,
                    vx: (Math.random() - 0.5) * 2,
                    vy: -Math.random() * 2 - 0.5,
                    life: 18,
                    maxLife: 18,
                    color: isEnraged ? "#fecdd3" : "#e0f2fe",
                    size: 4 + Math.random() * 3,
                    type: "smoke"
                });
            }

            if (bs.slamTimer >= embedTime) {
                bs.slamState = "recovering";
                bs.slamTimer = 0;
                bs._recoverStartY = bs.y;
            }
        }
        if (bs.slamState === "recovering") {
            const recProgress = Math.min(1, bs.slamTimer / 20);
            const easeOut = Math.sin(recProgress * Math.PI * 0.5);
            const recoverTargetY = bs.targetY || (isEnraged ? 105 : 130);
            bs.y = bs._recoverStartY + (recoverTargetY - bs._recoverStartY) * easeOut;
            bs.squishX = 1 + (1 - recProgress) * 0.15;
            bs.squishY = 1 - (1 - recProgress) * 0.15;
            if (recProgress >= 1) {
                bs.slamState = "idle";
                bs.slamTimer = 0;
                bs.squishX = 1;
                bs.squishY = 1;
            }
        }
        bs.shootTimer = (bs.shootTimer || 0) + 1;
        const shootInterval = window.postGameHorror ? isEnraged ? 22 : 32 : isEnraged ? 52 : 75;
        if (bs.shootTimer >= shootInterval && bs.slamState === "idle" && !bs._enrageCineActive) {
            bs.shootTimer = 0;
            bs.mouthOpenTimer = 30;
            const mouthX = bs.x + bs.w / 2;
            const mouthY = bs.y + bs.h * .65;
            const angle = Math.atan2(game.player.y + game.player.h / 2 - mouthY, game.player.x + game.player.w / 2 - mouthX);
            const spreads = window.postGameHorror ? (isEnraged ? [ -.48, -.32, -.16, 0, .16, .32, .48 ] : [ -.36, -.18, 0, .18, .36 ]) : (isEnraged ? [ -.35, -.15, 0, .15, .35 ] : [ -.25, 0, .25 ]);
            bs.bigShotCounter = (bs.bigShotCounter || 0) + 1;
            const speedMult = window.postGameHorror ? 1.35 : 1;

            if (window.postGameHorror) {
                for (let r = 0; r < 2; r++) {
                    enemyProjectiles.push({
                        x: game.player.x + (Math.random() - 0.5) * 140,
                        y: 80 + Math.random() * 40,
                        w: 20,
                        h: 36,
                        radius: 10,
                        vx: (Math.random() - 0.5) * 1.5,
                        vy: 7.5,
                        color: "#e0f2fe",
                        isGiant: false,
                        damage: 16
                    });
                }
            }

            if (bs.bigShotCounter % 4 === 0) {
                const ballSize = isEnraged ? 76 : 52;
                const ballRadius = ballSize / 2;
                enemyProjectiles.push({
                    x: mouthX - ballRadius,
                    y: mouthY - ballRadius,
                    w: ballSize,
                    h: ballSize,
                    radius: ballRadius,
                    vx: Math.cos(angle) * (isEnraged ? 5.2 : 4.3) * speedMult,
                    vy: Math.sin(angle) * (isEnraged ? 5.2 : 4.3) * speedMult,
                    color: isEnraged ? "#ef4444" : "#38bdf8",
                    isGiant: true,
                    damage: isEnraged ? 25 : 20,
                    isBigIceBall: true,
                    isIceSpectreBall: true,
                    angle: angle
                });
                for (let p = 0; p < (isEnraged ? 16 : 10); p++) {
                    const pa = Math.random() * Math.PI * 2;
                    particles.push({
                        x: mouthX,
                        y: mouthY,
                        vx: Math.cos(pa) * (3 + Math.random() * 4),
                        vy: Math.sin(pa) * (3 + Math.random() * 4),
                        life: 24,
                        color: isEnraged ? "#fca5a5" : "#bae6fd",
                        size: isEnraged ? 6 : 5,
                        type: "spark"
                    });
                }
                playSound(130, .45, "sine", .3, 55);
            } else {
                const spreadSize = isEnraged ? 36 : 24;
                const spreadRadius = spreadSize / 2;
                for (let sp of spreads) {
                    enemyProjectiles.push({
                        x: mouthX - spreadRadius,
                        y: mouthY - spreadRadius,
                        w: spreadSize,
                        h: spreadSize,
                        radius: spreadRadius,
                        vx: Math.cos(angle + sp) * 6.3 * speedMult,
                        vy: Math.sin(angle + sp) * 6.3 * speedMult,
                        color: isEnraged ? "#f87171" : "#00f0ff",
                        isGiant: true,
                        damage: isEnraged ? 15 : 12,
                        isIceSpectreBall: true,
                        angle: angle + sp
                    });
                    for (let p = 0; p < 4; p++) {
                        particles.push({
                            x: mouthX,
                            y: mouthY,
                            vx: Math.cos(angle + sp) * (4 + Math.random() * 4),
                            vy: Math.sin(angle + sp) * (4 + Math.random() * 4),
                            life: 18,
                            color: isEnraged ? "#fca5a5" : "#bae6fd",
                            size: isEnraged ? 5 : 4,
                            type: "spark"
                        });
                    }
                }
                playSound(220, .25, "sine", .25, 120);
            }
        }

        if (dist < (isEnraged ? 90 : 60)) game.player.takeDamage(4);
    }
    if (game.blizzardTransition && game.blizzardTransition.active) {
        drawIceBlizzardTransition(ctx, cameraX, time);
    }
    const drawX = bs.x - cameraX;
    const drawY = bs.y;
    if (drawX < -250 || drawX > VIEW_W + 250) return;
    if (!bs.isBoss) {
        if (bs.state === "boss_transform") {
            drawBossTransform(ctx, bs, cameraX, time);
            return;
        }
        ctx.save();
        const heatWaveAlpha = .3 + Math.sin(time * .15) * .2;
        ctx.strokeStyle = `rgba(255, 140, 0, ${heatWaveAlpha})`;
        ctx.lineWidth = 2;
        for (let hw = 0; hw < 3; hw++) {
            const hwR = bs.w * .6 + hw * 8 + Math.sin(time * .2 + hw) * 4;
            ctx.beginPath();
            ctx.arc(drawX + bs.w / 2, drawY + bs.h / 2, hwR, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.shadowColor = "#ff6600";
        ctx.shadowBlur = 8;
        const grad = ctx.createLinearGradient(drawX, drawY, drawX, drawY + bs.h);
        grad.addColorStop(0, "#55aaff");
        grad.addColorStop(1, "#0277bd");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(drawX, drawY, bs.w, bs.h, 7);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255, 60, 60, 0.45)";
        ctx.beginPath();
        ctx.ellipse(drawX + 6, drawY + 20, 4, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(drawX + bs.w - 6, drawY + 20, 4, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.fillRect(drawX + 7, drawY + 9, 6, 3);
        ctx.fillRect(drawX + bs.w - 13, drawY + 9, 6, 3);
        const pantH = 3 + Math.sin(time * .25) * 2;
        ctx.fillStyle = "#111111";
        ctx.beginPath();
        ctx.ellipse(drawX + bs.w / 2, drawY + 22, 5, pantH, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ff4444";
        ctx.beginPath();
        ctx.arc(drawX + bs.w / 2, drawY + 22 + pantH * .4, 2.5, 0, Math.PI);
        ctx.fill();
        for (let s = 0; s < 4; s++) {
            const sOffset = (time * .12 + s * 1.8) % 24;
            const dropX = drawX + 4 + s * 8;
            const dropY = drawY + 2 + sOffset;
            ctx.fillStyle = "#00ffff";
            ctx.shadowColor = "#00ffff";
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(dropX, dropY, Math.max(.5, 2.2 - sOffset / 24 * 1.2), 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        const mainSweatY = drawY + 4 + time * .1 % 28;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(drawX + bs.w - 5, mainSweatY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        if (bs.state === "sweating") {
            ctx.save();
            const bubble = typeof __ === "function" ? __("dlg_me_derrito") : "🥵 Mrmrm... ¡me derrito de calor!...";
            ctx.font = 'bold 12px "Fredoka One", "Courier Prime", monospace';
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            const tw = Math.ceil(ctx.measureText(bubble).width) + 24;
            const bh = 24;
            const vw = typeof VIEW_W !== "undefined" ? VIEW_W : 1024;
            const bx2 = Math.max(10, Math.min(vw - tw - 10, drawX + bs.w / 2 - tw / 2));
            const by2 = drawY - bh - 10;
            ctx.fillStyle = "#ffffff";
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 2;
            ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.roundRect(bx2, by2, tw, bh, 8);
            ctx.fill();
            ctx.stroke();
            const tailX = Math.max(bx2 + 14, Math.min(bx2 + tw - 14, drawX + bs.w / 2));
            ctx.beginPath();
            ctx.moveTo(tailX - 6, by2 + bh);
            ctx.lineTo(tailX, by2 + bh + 6);
            ctx.lineTo(tailX + 6, by2 + bh);
            ctx.fillStyle = "#ffffff";
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#1e293b";
            ctx.fillText(bubble, bx2 + tw / 2, by2 + bh / 2);
            ctx.restore();
        }
    } else {
        ctx.save();
        const isEnraged = bs.health <= bs.maxHealth * .5;
        const isLowHp = bs.health <= bs.maxHealth * .4;
        const isImpact = (bs.impactTimer || 0) > 0 || bs.slamState === "slamming" || bs.slamState === "embedded";
        const isAttacking = (bs.mouthOpenTimer || 0) > 0 || bs.slamState === "blink" || bs.slamState === "slamming" || bs.slamState === "embedded";
        let currentEmotion = "serio";
        if (isImpact || bs.slamState === "blink") {
            currentEmotion = "furia";
        } else if (isLowHp) {
            currentEmotion = "asustado";
        }
        const centerX = drawX + bs.w / 2;
        const centerY = drawY + bs.h / 2;
        const hw = bs.w / 2;
        const hh = bs.h / 2;

        ctx.save();

        const auraColor1 = window.postGameHorror ? "rgba(180, 0, 20, 0.42)" : isEnraged ? "rgba(255, 0, 80, 0.28)" : currentEmotion === "asustado" ? "rgba(128, 229, 255, 0.3)" : "rgba(0, 229, 255, 0.22)";
        const auraColor2 = window.postGameHorror ? "rgba(80, 0, 10, 0.1)" : isEnraged ? "rgba(180, 0, 50, 0.08)" : "rgba(2, 132, 199, 0.08)";
        const auraR = bs.w * (isEnraged ? 0.88 : 0.74) + Math.sin(time * 0.08) * 8;
        
        const gAura = ctx.createRadialGradient(centerX, centerY, bs.w * 0.2, centerX, centerY, auraR);
        gAura.addColorStop(0, auraColor1);
        gAura.addColorStop(0.7, auraColor2);
        gAura.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gAura;
        ctx.beginPath();
        ctx.arc(centerX, centerY, auraR, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        for (let t = -1; t <= 1; t++) {
            const waveX = centerX + t * (hw * 0.45) + Math.sin(time * 0.09 + t * 1.5) * 10;
            const waveY = centerY + hh * 0.5;
            const endY = waveY + hh * (0.65 + Math.sin(time * 0.12 + t) * 0.2);
            const wGrad = ctx.createLinearGradient(waveX, waveY, waveX, endY);
            wGrad.addColorStop(0, isEnraged ? "rgba(244, 63, 94, 0.35)" : "rgba(56, 189, 248, 0.35)");
            wGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
            ctx.fillStyle = wGrad;
            ctx.beginPath();
            ctx.moveTo(waveX - 14, waveY);
            ctx.quadraticCurveTo(waveX + Math.sin(time * 0.15 + t) * 12, (waveY + endY) / 2, waveX, endY);
            ctx.quadraticCurveTo(waveX - Math.sin(time * 0.15 + t) * 12, (waveY + endY) / 2, waveX + 14, waveY);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        if (isEnraged) {
            ctx.save();
            ctx.strokeStyle = Math.random() < 0.5 ? "#ffe4e6" : "#f43f5e";
            ctx.lineWidth = 1.8;
            for (let l = 0; l < 2; l++) {
                const la = Math.random() * Math.PI * 2;
                const lr1 = auraR * (0.65 + Math.random() * 0.2);
                const lr2 = auraR * (0.9 + Math.random() * 0.15);
                ctx.beginPath();
                ctx.moveTo(centerX + Math.cos(la) * lr1, centerY + Math.sin(la) * lr1);
                const midA = la + (Math.random() - 0.5) * 0.4;
                const midR = (lr1 + lr2) / 2 + (Math.random() - 0.5) * 15;
                ctx.lineTo(centerX + Math.cos(midA) * midR, centerY + Math.sin(midA) * midR);
                ctx.lineTo(centerX + Math.cos(la + 0.1) * lr2, centerY + Math.sin(la + 0.1) * lr2);
                ctx.stroke();
            }
            ctx.restore();
        }

        if (isEnraged && bs.enrageSnowflakes && bs.enrageSnowflakes.length > 0) {
            ctx.save();
            ctx.lineWidth = 1.6;
            for (let sn of bs.enrageSnowflakes) {
                const sx = sn.x - cameraX;
                if (sx < -30 || sx > VIEW_W + 30) continue;
                const sy = sn.y;
                ctx.save();
                ctx.translate(sx, sy);
                ctx.rotate(sn.rot);
                ctx.strokeStyle = sn.color;
                ctx.beginPath();
                ctx.moveTo(-sn.size, 0);
                ctx.lineTo(sn.size, 0);
                ctx.moveTo(-sn.size * 0.5, -sn.size * 0.866);
                ctx.lineTo(sn.size * 0.5, sn.size * 0.866);
                ctx.moveTo(-sn.size * 0.5, sn.size * 0.866);
                ctx.lineTo(sn.size * 0.5, -sn.size * 0.866);
                ctx.stroke();
                ctx.restore();
            }
            ctx.restore();
        }

        const bladeCount = isEnraged ? 6 : 4;
        const spinRot = time * (isEnraged ? 0.11 : 0.045);
        const orbitR = bs.w * (isEnraged ? 0.85 : 0.74);
        const bladeLen = isEnraged ? 28 : 20;
        const bladeW = isEnraged ? 12 : 8.5;

        for (let b = 0; b < bladeCount; b++) {
            const bAngle = spinRot + b * Math.PI * 2 / bladeCount;
            const bx = centerX + Math.cos(bAngle) * orbitR;
            const by = centerY + Math.sin(bAngle) * orbitR;
            const tangent = bAngle + Math.PI / 2;

            ctx.save();
            ctx.translate(bx, by);
            ctx.rotate(tangent);

            ctx.strokeStyle = isEnraged ? "rgba(244, 63, 94, 0.4)" : "rgba(56, 189, 248, 0.4)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, bladeLen * 0.6);
            ctx.lineTo(0, bladeLen * 1.4);
            ctx.stroke();

            ctx.strokeStyle = isEnraged ? "#450a0a" : "#082f49";
            ctx.lineWidth = 2.2;

            ctx.fillStyle = isEnraged ? "#fecdd3" : "#e0f2fe";
            ctx.beginPath();
            ctx.moveTo(0, -bladeLen * 0.8);
            ctx.lineTo(-bladeW, 0);
            ctx.lineTo(0, bladeLen * 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = isEnraged ? "#be123c" : "#0284c7";
            ctx.beginPath();
            ctx.moveTo(0, -bladeLen * 0.8);
            ctx.lineTo(bladeW, 0);
            ctx.lineTo(0, bladeLen * 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(0, -bladeLen * 0.75);
            ctx.lineTo(0, bladeLen * 0.45);
            ctx.stroke();

            ctx.fillStyle = isEnraged ? "#ffffff" : "#bae6fd";
            ctx.beginPath();
            ctx.arc(0, 0, bladeW * 0.35, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        ctx.translate(centerX, centerY);
        const tiltAngle = currentEmotion === "asustado" ? Math.sin(time * 15) * 0.08 : Math.sin(time * 0.06) * 0.04;
        ctx.rotate(tiltAngle);
        const sqX = bs.squishX || 1;
        const sqY = bs.squishY || 1;
        ctx.scale(sqX, sqY);
        if (currentEmotion === "asustado" || isImpact) {
            const tremorMag = isImpact ? 5 : 2;
            ctx.translate((Math.random() - 0.5) * tremorMag, (Math.random() - 0.5) * tremorMag);
        }

        ctx.save();
        const crownExtra = window.postGameHorror ? 30 : isEnraged ? 32 : 22;
        const crownColorLeft = isEnraged ? "#fda4af" : "#bae6fd";
        const crownColorRight = isEnraged ? "#9f1239" : "#0369a1";
        const crownBorder = isEnraged ? "#450a0a" : "#082f49";

        const spires = [
            { tipX: 0, tipY: -hh - crownExtra * 1.15, bLX: -hw * 0.18, bLY: -hh + 2, bRX: hw * 0.18, bRY: -hh + 2 },
            { tipX: -hw * 0.72, tipY: -hh - crownExtra * 0.95, bLX: -hw * 0.85, bLY: -hh * 0.35, bRX: -hw * 0.22, bRY: -hh * 0.75 },
            { tipX: hw * 0.72, tipY: -hh - crownExtra * 0.95, bLX: hw * 0.22, bLY: -hh * 0.75, bRX: hw * 0.85, bRY: -hh * 0.35 },
            { tipX: -hw * 1.05, tipY: -hh * 0.65, bLX: -hw, bLY: -hh * 0.2, bRX: -hw * 0.75, bRY: -hh * 0.6 },
            { tipX: hw * 1.05, tipY: -hh * 0.65, bLX: hw * 0.75, bLY: -hh * 0.6, bRX: hw, bRY: -hh * 0.2 }
        ];

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = crownBorder;
        for (let sp of spires) {
            ctx.fillStyle = crownColorLeft;
            ctx.beginPath();
            ctx.moveTo(sp.bLX, sp.bLY);
            ctx.lineTo(sp.tipX, sp.tipY);
            ctx.lineTo((sp.bLX + sp.bRX) / 2, (sp.bLY + sp.bRY) / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = crownColorRight;
            ctx.beginPath();
            ctx.moveTo(sp.tipX, sp.tipY);
            ctx.lineTo(sp.bRX, sp.bRY);
            ctx.lineTo((sp.bLX + sp.bRX) / 2, (sp.bLY + sp.bRY) / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(sp.tipX, sp.tipY, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        const pTop = { x: 0, y: -hh };
        const pTopR = { x: hw * 0.95, y: -hh * 0.48 };
        const pBotR = { x: hw * 0.82, y: hh * 0.42 };
        const pBot = { x: 0, y: hh * 1.02 };
        const pBotL = { x: -hw * 0.82, y: hh * 0.42 };
        const pTopL = { x: -hw * 0.95, y: -hh * 0.48 };
        const pCenter = { x: 0, y: -hh * 0.05 };

        if (bs.hitFlash && bs.hitFlash > 0) {
            bs.hitFlash--;
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.moveTo(pTop.x, pTop.y);
            ctx.lineTo(pTopR.x, pTopR.y);
            ctx.lineTo(pBotR.x, pBotR.y);
            ctx.lineTo(pBot.x, pBot.y);
            ctx.lineTo(pBotL.x, pBotL.y);
            ctx.lineTo(pTopL.x, pTopL.y);
            ctx.closePath();
            ctx.fill();
        } else {
            const facets = [
                { p1: pTop, p2: pTopL, p3: pCenter, color: isEnraged ? "#f43f5e" : "#38bdf8" },
                { p1: pTop, p2: pCenter, p3: pTopR, color: isEnraged ? "#fb7185" : "#7dd3fc" },
                { p1: pTopR, p2: pCenter, p3: pBotR, color: isEnraged ? "#e11d48" : "#0284c7" },
                { p1: pCenter, p2: pBot, p3: pBotR, color: isEnraged ? "#9f1239" : "#0369a1" },
                { p1: pBotL, p2: pBot, p3: pCenter, color: isEnraged ? "#881337" : "#075985" },
                { p1: pTopL, p2: pBotL, p3: pCenter, color: isEnraged ? "#be123c" : "#0c4a6e" }
            ];

            for (let f of facets) {
                ctx.fillStyle = window.postGameHorror ? "#0f0f0f" : f.color;
                ctx.beginPath();
                ctx.moveTo(f.p1.x, f.p1.y);
                ctx.lineTo(f.p2.x, f.p2.y);
                ctx.lineTo(f.p3.x, f.p3.y);
                ctx.closePath();
                ctx.fill();
            }

            ctx.strokeStyle = window.postGameHorror ? "#990000" : isEnraged ? "#450a0a" : "#082f49";
            ctx.lineWidth = isEnraged ? 4.5 : 3.5;
            ctx.beginPath();
            ctx.moveTo(pTop.x, pTop.y);
            ctx.lineTo(pTopR.x, pTopR.y);
            ctx.lineTo(pBotR.x, pBotR.y);
            ctx.lineTo(pBot.x, pBot.y);
            ctx.lineTo(pBotL.x, pBotL.y);
            ctx.lineTo(pTopL.x, pTopL.y);
            ctx.closePath();
            ctx.stroke();

            ctx.strokeStyle = isEnraged ? "rgba(255, 228, 230, 0.4)" : "rgba(255, 255, 255, 0.35)";
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(pTop.x, pTop.y);
            ctx.lineTo(pBot.x, pBot.y);
            ctx.moveTo(pTopL.x, pTopL.y);
            ctx.lineTo(pBotR.x, pBotR.y);
            ctx.moveTo(pTopR.x, pTopR.y);
            ctx.lineTo(pBotL.x, pBotL.y);
            ctx.stroke();

            const coreW = hw * 0.38;
            const coreH = hh * 0.32;
            const cPulse = Math.sin(time * 0.12) * 2;
            ctx.save();
            ctx.translate(pCenter.x, pCenter.y + 4);
            ctx.fillStyle = isEnraged ? "#ffe4e6" : "#ffffff";
            ctx.beginPath();
            ctx.moveTo(0, -coreH - cPulse);
            ctx.lineTo(coreW + cPulse, 0);
            ctx.lineTo(0, coreH + cPulse);
            ctx.lineTo(-coreW - cPulse, 0);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = isEnraged ? "#ff0055" : "#00ffff";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();

            if (isEnraged) {
                ctx.save();
                ctx.strokeStyle = "#ffe4e6";
                ctx.lineWidth = 2;
                ctx.shadowColor = "#ff0055";
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.moveTo(pCenter.x - 8, pCenter.y + 5);
                ctx.lineTo(-hw * 0.45, pCenter.y - 12);
                ctx.lineTo(-hw * 0.65, pCenter.y + 15);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(pCenter.x + 8, pCenter.y + 5);
                ctx.lineTo(hw * 0.42, pCenter.y - 8);
                ctx.lineTo(hw * 0.7, pCenter.y + 8);
                ctx.stroke();
                ctx.restore();
            }
        }

        const playerX = game.player ? game.player.x + game.player.w / 2 : bs.x + bs.w / 2;
        const playerY = game.player ? game.player.y + game.player.h / 2 : bs.y + bs.h / 2;
        const lookAngle = Math.atan2(playerY - (bs.y + bs.h / 2), playerX - (bs.x + bs.w / 2));
        const pupilShiftX = Math.cos(lookAngle) * 3.5;
        const pupilShiftY = Math.sin(lookAngle) * 3.5;
        const isBlinking = (bs.eyeBlinkTimer || 0) < 0;
        const eyeY = -hh * 0.22;
        const eyeSpacing = hw * 0.48;

        for (let side of [-1, 1]) {
            const eyeX = side * eyeSpacing;
            ctx.save();
            ctx.translate(eyeX, eyeY);

            if (!isBlinking) {
                ctx.save();
                const flameColor = isEnraged ? "rgba(255, 0, 85, 0.75)" : "rgba(0, 240, 255, 0.75)";
                const flameLen = isEnraged ? 28 : 18;
                for (let f = 0; f < 2; f++) {
                    const wave = Math.sin(time * 0.2 + f + side) * 6;
                    ctx.strokeStyle = flameColor;
                    ctx.lineWidth = 2.5 - f * 0.8;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.quadraticCurveTo(side * (6 + f * 4), -8 - f * 4 + wave * 0.5, side * (12 + f * 8), -flameLen - f * 6 + wave);
                    ctx.stroke();
                }
                ctx.restore();
            }

            ctx.fillStyle = "#020617";
            ctx.beginPath();
            if (window.postGameHorror) {
                ctx.ellipse(0, 0, 15, 13, 0, 0, Math.PI * 2);
            } else if (isBlinking) {
                ctx.ellipse(0, 0, 13, 2, 0, 0, Math.PI * 2);
            } else if (currentEmotion === "asustado") {
                ctx.ellipse(0, 0, 13, 11, 0, 0, Math.PI * 2);
            } else if (currentEmotion === "furia" || isEnraged) {
                ctx.ellipse(0, 0, 16, 8, side * -0.28, 0, Math.PI * 2);
            } else {
                ctx.ellipse(0, 0, 13, 8, side * -0.12, 0, Math.PI * 2);
            }
            ctx.fill();

            ctx.strokeStyle = window.postGameHorror ? "#dc2626" : isEnraged ? "#ff0055" : currentEmotion === "asustado" ? "#80e5ff" : "#00f0ff";
            ctx.lineWidth = 2.2;
            ctx.stroke();

            if (!isBlinking || window.postGameHorror) {
                if (window.postGameHorror) {
                    ctx.fillStyle = "#f8fafc";
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 13, 11, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#990000";
                    ctx.beginPath();
                    ctx.arc(pupilShiftX * 0.8, pupilShiftY * 0.8, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#000000";
                    ctx.beginPath();
                    ctx.arc(pupilShiftX * 0.8, pupilShiftY * 0.8, 1.2, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    const irisColor = isEnraged ? "#ff0033" : currentEmotion === "asustado" ? "#38bdf8" : "#00f0ff";
                    ctx.fillStyle = irisColor;
                    ctx.shadowColor = irisColor;
                    ctx.shadowBlur = 10;
                    let pSize = currentEmotion === "asustado" ? 4.2 : isEnraged ? 2.8 : 3.6;
                    if (currentEmotion === "asustado") {
                        pSize += Math.sin(time * 30 + side) * 0.8;
                    }
                    ctx.beginPath();
                    ctx.arc(pupilShiftX, pupilShiftY, pSize, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(pupilShiftX - 1.2, pupilShiftY - 1.2, pSize * 0.4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            }

            ctx.strokeStyle = window.postGameHorror ? "#7f1d1d" : isEnraged ? "#ffe4e6" : currentEmotion === "asustado" ? "#80e5ff" : "#ffffff";
            ctx.lineWidth = isEnraged ? 4.5 : 3.5;
            ctx.beginPath();
            if (window.postGameHorror || isEnraged || currentEmotion === "furia") {
                ctx.moveTo(-15 * side, -14);
                ctx.lineTo(12 * side, -4);
            } else if (currentEmotion === "asustado") {
                ctx.moveTo(-12 * side, -5);
                ctx.lineTo(10 * side, -13);
            } else {
                ctx.moveTo(-13 * side, -10);
                ctx.lineTo(10 * side, -6);
            }
            ctx.stroke();

            ctx.restore();
        }

        if (currentEmotion === "asustado" && !window.postGameHorror) {
            for (let s = 0; s < 3; s++) {
                const sProgress = (time * 0.15 + s * 0.7) % 1;
                const dropX = s === 0 ? -hw * 0.6 : s === 1 ? hw * 0.6 : 0;
                const dropY = -hh * 0.1 + sProgress * (hh * 0.8);
                ctx.fillStyle = "#00ffff";
                ctx.beginPath();
                ctx.arc(dropX, dropY, 2.5 * (1 - sProgress * 0.5), 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const isMouthFiring = (bs.mouthOpenTimer || 0) > 0;
        const mouthCycleVal = Math.max(0, bs.mouthCycle || 0);

        let mouthOpening = window.postGameHorror ? 18 : 6;
        if (isEnraged) {
            mouthOpening = isMouthFiring ? 46 + mouthCycleVal * 26 : 34 + Math.sin(time * 14) * 6;
        } else if (isMouthFiring) {
            mouthOpening = 22 + mouthCycleVal * 14;
        } else if (currentEmotion === "furia") {
            mouthOpening = 20 + Math.sin(time * 12) * 5;
        } else if (currentEmotion === "asustado") {
            mouthOpening = 14 + Math.sin(time * 20) * 4;
        }
        const mouthWidth = hw * (isEnraged ? 1.58 : 1.2);
        const mouthY = hh * 0.38;

        ctx.save();
        ctx.translate(0, mouthY);

        ctx.fillStyle = "#020617";
        ctx.beginPath();
        ctx.ellipse(0, 0, mouthWidth / 2, mouthOpening / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        if (isEnraged) {
            const gMouth = ctx.createRadialGradient(0, 0, 2, 0, 0, mouthWidth * 0.48);
            gMouth.addColorStop(0, "#ffffff");
            gMouth.addColorStop(0.3, "#f43f5e");
            gMouth.addColorStop(0.7, "#881337");
            gMouth.addColorStop(1, "#020617");
            ctx.fillStyle = gMouth;
            ctx.beginPath();
            ctx.ellipse(0, 0, mouthWidth * 0.46, mouthOpening * 0.46, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (isAttacking || currentEmotion === "furia") {
            const gMouth = ctx.createRadialGradient(0, 0, 2, 0, 0, mouthWidth * 0.4);
            gMouth.addColorStop(0, "#ffffff");
            gMouth.addColorStop(0.4, "#00f0ff");
            gMouth.addColorStop(1, "#0369a1");
            ctx.fillStyle = gMouth;
            ctx.beginPath();
            ctx.ellipse(0, 0, mouthWidth * 0.38, mouthOpening * 0.42, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        const toothCount = window.postGameHorror ? 7 : isEnraged ? 9 : 5;
        const tSpacing = mouthWidth / (toothCount + 1);
        const toothBaseW = isEnraged ? 4.8 : 3.5;

        const gToothUpper = ctx.createLinearGradient(0, -mouthOpening / 2, 0, mouthOpening / 2);
        gToothUpper.addColorStop(0, "#e0f2fe");
        gToothUpper.addColorStop(0.5, "#ffffff");
        gToothUpper.addColorStop(1, isEnraged ? "#ffe4e6" : "#38bdf8");
        ctx.fillStyle = gToothUpper;
        ctx.strokeStyle = isEnraged ? "#450a0a" : "#082f49";
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        for (let i = 1; i <= toothCount; i++) {
            const tx = -mouthWidth / 2 + i * tSpacing;
            let tHeight = 6;
            if (isEnraged) {
                tHeight = (i === 1 || i === toothCount) ? 24 : (i % 2 === 0 ? 19 : 14);
            } else if (window.postGameHorror) {
                tHeight = (i === 2 || i === 4 || i === 6) ? 12 : 8;
            } else {
                tHeight = (i === 2 || i === 4) ? 8 : 6;
            }
            const actualHeight = Math.min(tHeight, mouthOpening * 0.88);
            ctx.moveTo(tx - toothBaseW, -mouthOpening / 2);
            ctx.lineTo(tx, -mouthOpening / 2 + actualHeight);
            ctx.lineTo(tx + toothBaseW, -mouthOpening / 2);
            ctx.closePath();
        }
        ctx.fill();
        ctx.stroke();

        const gToothLower = ctx.createLinearGradient(0, mouthOpening / 2, 0, -mouthOpening / 2);
        gToothLower.addColorStop(0, "#e0f2fe");
        gToothLower.addColorStop(0.5, "#ffffff");
        gToothLower.addColorStop(1, isEnraged ? "#ffe4e6" : "#38bdf8");
        ctx.fillStyle = gToothLower;

        ctx.beginPath();
        for (let i = 1; i <= toothCount; i++) {
            const tx = -mouthWidth / 2 + i * tSpacing;
            let tHeight = 5;
            if (isEnraged) {
                tHeight = (i === 2 || i === toothCount - 1) ? 22 : (i % 2 !== 0 ? 17 : 11);
            } else if (window.postGameHorror) {
                tHeight = (i === 3 || i === 5) ? 10 : 7;
            } else {
                tHeight = (i === 3) ? 7 : 5;
            }
            const actualHeight = Math.min(tHeight, mouthOpening * 0.88);
            ctx.moveTo(tx - toothBaseW, mouthOpening / 2);
            ctx.lineTo(tx, mouthOpening / 2 - actualHeight);
            ctx.lineTo(tx + toothBaseW, mouthOpening / 2);
            ctx.closePath();
        }
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = window.postGameHorror ? "#7f1d1d" : isEnraged ? "#ff0055" : currentEmotion === "asustado" ? "#80e5ff" : "#00d5ff";
        ctx.lineWidth = isEnraged ? 3.5 : 2.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, mouthWidth / 2, mouthOpening / 2, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
        ctx.restore();
        ctx.restore();
        if (game._furiaTint > 0) {
            ctx.fillStyle = `rgba(255, 30, 50, ${Math.min(.5, game._furiaTint)})`;
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        }
    }
    if (bs.state === "defeated" && !bs._defeatDialogShown) {
        bs._defeatDialogShown = true;
        if (typeof window.triggerHappyMoment === "function") window.triggerHappyMoment();
        game.boss1Defeated = true;
        game._furiaTint = 0;
        if (typeof window.BossHUD !== "undefined") {
            window.BossHUD.hide();
        }
        game.player.frozen = true;
        game.arenaLocked = false;
        stopAllSFX();
        gsap.to(getMessageDiv(), {
            scale: 0,
            opacity: 0,
            duration: .2
        });
        if (!window.postGameHorror) playBGM("bgm_world1_ice");
        applyShake(38);
        game.flash = 45;
        game.platforms.forEach(p => {
            if (p.button) {
                p.button = false;
                p.active = false;
            }
        });
        createExplosion(bs.x + bs.w / 2, bs.y + bs.h / 2, "#00e5ff", 80, 70, [ "#00e5ff", "#80e5ff", "#ffffff" ]);
        const entranceGateDef = game.platforms.find(p => p.isArenaGate === "entrance");
        const exitGateDef = game.platforms.find(p => p.isArenaGate === "exit");
        try {
            gsap.killTweensOf(entranceGateDef);
        } catch (e) {}
        try {
            gsap.killTweensOf(exitGateDef);
        } catch (e) {}
        if (entranceGateDef && exitGateDef) {
            gsap.to(game, {
                cameraOverrideX: entranceGateDef.x - VIEW_W / 2 + entranceGateDef.w / 2,
                duration: 1,
                ease: "power2.inOut",
                onComplete: cinema(() => {
                    gsap.to(entranceGateDef, {
                        y: -250,
                        duration: .6,
                        ease: "power2.out",
                        onComplete: cinema(() => {
                            playSound(120, .4, "sine", .3, 80);
                            gsap.to(game, {
                                cameraOverrideX: exitGateDef.x - VIEW_W / 2 + exitGateDef.w / 2,
                                duration: 1,
                                ease: "power2.inOut",
                                onComplete: cinema(() => {
                                    gsap.to(exitGateDef, {
                                        y: -250,
                                        duration: .6,
                                        ease: "power2.out",
                                        onComplete: cinema(() => {
                                            playSound(120, .4, "sine", .3, 80);
                                            gsap.to(game, {
                                                cameraOverrideX: game.player.x - VIEW_W / 2,
                                                duration: 1,
                                                ease: "power2.inOut",
                                                onComplete: cinema(() => {
                                                    delete game.cameraOverrideX;
                                                    game.player.frozen = false;
                                                })
                                            });
                                        })
                                    });
                                })
                            });
                        })
                    });
                })
            });
        } else {
            game.player.frozen = false;
        }
        showAnimatedDialogue(__("ui_speaker_blue_square"), "😖", __("dlg_boss1_hurt"), null, 1600);
    }
}

function closeArenaWithHammers(onDone) {
    const entranceGateDef = game.platforms && game.platforms.find(p => p.isArenaGate === "entrance");
    const exitGateDef = game.platforms && game.platforms.find(p => p.isArenaGate === "exit");
    if (!entranceGateDef || !exitGateDef || typeof gsap === "undefined") {
        closeArenaWithHammers._busyUntil = 0;
        if (onDone) onDone();
        return;
    }
    if (entranceGateDef.y >= 150 && exitGateDef.y >= 150) {
        closeArenaWithHammers._busyUntil = 0;
        if (onDone) onDone();
        return;
    }
    if (closeArenaWithHammers._busyUntil && Date.now() < closeArenaWithHammers._busyUntil) {
        const waitIv = setInterval(cinema(() => {
            if (!closeArenaWithHammers._busyUntil || Date.now() >= closeArenaWithHammers._busyUntil) {
                clearInterval(waitIv);
                closeArenaWithHammers._busyUntil = 0;
                closeArenaWithHammers(onDone);
            }
        }), 300);
        setTimeout(() => clearInterval(waitIv), 11e3);
        try {
            gsap.killTweensOf(entranceGateDef);
            gsap.killTweensOf(exitGateDef);
            gsap.killTweensOf(game);
        } catch (e) {}
        entranceGateDef.y = 160;
        exitGateDef.y = 160;
        delete game.cameraOverrideX;
        closeArenaWithHammers._busyUntil = 0;
        if (onDone) onDone();
        return;
    }
    closeArenaWithHammers._busyUntil = Date.now() + 4500;
    try {
        gsap.killTweensOf(entranceGateDef);
    } catch (e) {}
    try {
        gsap.killTweensOf(exitGateDef);
    } catch (e) {}
    try {
        gsap.killTweensOf(game);
    } catch (e) {}
    const finish = cinema(() => {
        closeArenaWithHammers._busyUntil = 0;
        entranceGateDef.y = 160;
        exitGateDef.y = 160;
        delete game.cameraOverrideX;
        if (onDone) onDone();
    });
    gsap.to(game, {
        cameraOverrideX: exitGateDef.x - VIEW_W / 2 + exitGateDef.w / 2,
        duration: .8,
        ease: "power2.inOut",
        onComplete: cinema(() => {
            gsap.to(exitGateDef, {
                y: 160,
                duration: .4,
                ease: "bounce.out",
                onComplete: cinema(() => {
                    playSound(120, .4, "sine", .3, 80);
                    applyShake(14);
                    gsap.to(game, {
                        cameraOverrideX: entranceGateDef.x - VIEW_W / 2 + entranceGateDef.w / 2,
                        duration: .8,
                        ease: "power2.inOut",
                        onComplete: cinema(() => {
                            gsap.to(entranceGateDef, {
                                y: 160,
                                duration: .4,
                                ease: "bounce.out",
                                onComplete: finish
                            });
                        })
                    });
                })
            });
        })
    });
}

window.closeArenaWithHammers = closeArenaWithHammers;

window.raiseArenaHammers = function(onDone) {
    const entranceGateDef = game.platforms.find(p => p.isArenaGate === "entrance");
    const exitGateDef = game.platforms.find(p => p.isArenaGate === "exit");
    if (!entranceGateDef || !exitGateDef || typeof gsap === "undefined") {
        if (onDone) onDone();
        return;
    }
    try {
        gsap.killTweensOf(entranceGateDef);
    } catch (e) {}
    try {
        gsap.killTweensOf(exitGateDef);
    } catch (e) {}
    try {
        gsap.killTweensOf(game);
    } catch (e) {}
    gsap.to(game, {
        cameraOverrideX: entranceGateDef.x - VIEW_W / 2 + entranceGateDef.w / 2,
        duration: 1,
        ease: "power2.inOut",
        onComplete: cinema(() => {
            gsap.to(entranceGateDef, {
                y: -250,
                duration: .6,
                ease: "power2.out",
                onComplete: cinema(() => {
                    playSound(120, .4, "sine", .3, 80);
                    gsap.to(game, {
                        cameraOverrideX: exitGateDef.x - VIEW_W / 2 + exitGateDef.w / 2,
                        duration: 1,
                        ease: "power2.inOut",
                        onComplete: cinema(() => {
                            gsap.to(exitGateDef, {
                                y: -250,
                                duration: .6,
                                ease: "power2.out",
                                onComplete: cinema(() => {
                                    playSound(120, .4, "sine", .3, 80);
                                    if (typeof window.hideDialogue === "function") window.hideDialogue();
                                    gsap.to(game, {
                                        cameraOverrideX: game.player.x - VIEW_W / 2,
                                        duration: 1,
                                        ease: "power2.inOut",
                                        onComplete: cinema(() => {
                                            delete game.cameraOverrideX;
                                            if (typeof window.hideDialogue === "function") window.hideDialogue();
                                            if (onDone) onDone();
                                        })
                                    });
                                })
                            });
                        })
                    });
                })
            });
        })
    });
};

window.triggerSolarGateCutscene = function() {
    if (!game.player || typeof gsap === "undefined") return;
    game.player.frozen = true;
    game.player.vx = 0;
    if (typeof game.player.dashTimer === "number") game.player.dashTimer = 0;
    const gate = (game.platforms || []).find(p => p.isGateObstacle === 2);
    let pipe = (game.platforms || []).find(p => p.isMarioPipe === 2 || p.isSolarBridge);
    if (!pipe && Array.isArray(game.platforms)) {
        pipe = new Platform({ x: 7300, y: 700, w: 140, h: 70, isMarioPipe: 2, unbreakable: true });
        pipe.originY = 495;
        game.platforms.push(pipe);
    } else if (pipe) {
        pipe.isMarioPipe = 2;
        pipe.originY = 495;
    }
    const pitX = 7370;
    const bo = typeof window.getBlackoutDiv === "function" ? window.getBlackoutDiv() : document.getElementById("blackout");
    try {
        gsap.killTweensOf(game);
    } catch (e) {}
    try {
        playSound(520, .25, "triangle", .3, 1040);
    } catch (e) {}
    if (bo) {
        bo.style.transition = "opacity 0.45s ease";
        bo.style.opacity = "1";
    }
    setTimeout(cinema(() => {
        game.subCaveMode = false;
        game.gate2Open = true;
        game.cavernEntranceBlown = true;
        if (typeof window !== "undefined") window._cavernEntranceBlownPermanently = true;
        game.meadowNight = false;
        game.nightTransitionProgress = 0;
        const gateCamTarget = gate ? gate.x - VIEW_W / 2 + gate.w / 2 : 7520 - VIEW_W / 2;
        if (typeof cameraX !== "undefined") cameraX = gateCamTarget;
        game.cameraOverrideX = gateCamTarget;
        delete game.cameraOverrideY;
        game.camY = 0;
        if (pipe) pipe.y = 700;
        if (bo) bo.style.opacity = "0";
        setTimeout(cinema(() => {
            if (typeof applyShake === "function") applyShake(8);
            try {
                playSound(300, .4, "sawtooth", .4, 600);
            } catch (e) {}
            if (gate && typeof addFloatingText === "function") {
                addFloatingText(gate.x + gate.w / 2, 260, typeof __ === "function" ? __("flt_gate2_opened") : "¡PUERTA SOLAR ELEVADA!", "#f59e0b", 24);
            }
            setTimeout(cinema(() => {
                gsap.to(game, {
                    cameraOverrideX: pitX - VIEW_W / 2,
                    cameraOverrideY: 0,
                    duration: .9,
                    ease: "power2.inOut",
                    onComplete: cinema(() => {
                        if (pipe) {
                            gsap.to(pipe, {
                                y: pipe.originY || 495,
                                duration: .8,
                                ease: "power2.out",
                                onComplete: cinema(() => {
                                    if (typeof applyShake === "function") applyShake(5);
                                    try {
                                        playSound(160, .12, "sawtooth");
                                        setTimeout(() => playSound(220, .12, "sawtooth"), 70);
                                        setTimeout(() => playSound(330, .16, "sawtooth"), 140);
                                    } catch (e) {}
                                    if (typeof addFloatingText === "function") {
                                        addFloatingText(pitX, 360, typeof __ === "function" ? __("flt_mario_pipe") : "¡TUBERÍA WARP!", "#22c55e", 24);
                                    }
                                    setTimeout(cinema(() => {
                                        if (typeof window.spawnShootingStarsBurst === "function") window.spawnShootingStarsBurst(4);
                                        game.player.x = pitX - (game.player.w || 32) / 2;
                                        game.player.y = 430;
                                        game.player.vx = 0;
                                        game.player.vy = 0;
                                        try {
                                            playSound(400, .15, "sine", .3, 800);
                                            setTimeout(() => playSound(600, .2, "triangle", .3, 1200), 80);
                                        } catch (e) {}
                                        if (typeof particles !== "undefined") {
                                            for (let i = 0; i < 28; i++) {
                                                particles.push({
                                                    x: pitX + (Math.random() - .5) * 50,
                                                    y: 450,
                                                    vx: (Math.random() - .5) * 7,
                                                    vy: -Math.random() * 9 - 4,
                                                    life: 35,
                                                    color: "#86efac",
                                                    size: 4.5,
                                                    type: "spark"
                                                });
                                            }
                                        }
                                        gsap.to(game.player, {
                                            y: 300,
                                            x: pitX + 60,
                                            duration: .5,
                                            ease: "power1.out",
                                            onComplete: cinema(() => {
                                                gsap.to(game.player, {
                                                    y: 456,
                                                    x: pitX + 110,
                                                    duration: .38,
                                                    ease: "power2.in",
                                                    onComplete: cinema(() => {
                                                        if (typeof applyShake === "function") applyShake(4);
                                                        try {
                                                            playSound(440, .15, "sine", .2);
                                                        } catch (e) {}
                                                        gsap.to(game, {
                                                            nightTransitionProgress: 1,
                                                            duration: 4,
                                                            ease: "power1.inOut",
                                                            onComplete: () => {
                                                                game.meadowNight = true;
                                                            }
                                                        });
                                                        if (typeof currentBGM !== "undefined" && currentBGM) {
                                                            gsap.to(currentBGM, {
                                                                volume: 0,
                                                                duration: 2,
                                                                onComplete: () => {
                                                                    if (typeof playBGM === "function") playBGM("bgm_world1_night");
                                                                }
                                                            });
                                                        } else {
                                                            if (typeof playBGM === "function") playBGM("bgm_world1_night");
                                                        }
                                                        if (typeof currentLevel !== "undefined") {
                                                            currentCheckpoint = {
                                                                level: currentLevel,
                                                                x: 7460,
                                                                y: 440
                                                            };
                                                        }
                                                        if (typeof window.spawnShootingStarsBurst === "function") window.spawnShootingStarsBurst(3);
                                                        if (typeof addFloatingText === "function") {
                                                            addFloatingText(pitX + 110, 390, typeof __ === "function" ? __("flt_meadow_night") : "¡NOCHE EN LA PRADERA!", "#a78bfa", 22);
                                                        }
                                                        delete game.cameraOverrideX;
                                                        delete game.cameraOverrideY;
                                                        game.camY = 0;
                                                        game.player.frozen = false;
                                                    })
                                                });
                                            })
                                        });
                                    }), 500);
                                })
                            });
                        } else {
                            game.player.x = pitX + 75;
                            game.player.y = 456;
                            game.nightTransitionProgress = 1;
                            game.meadowNight = true;
                            if (typeof playBGM === "function") playBGM("bgm_world1_night");
                            if (typeof currentLevel !== "undefined") {
                                currentCheckpoint = {
                                    level: currentLevel,
                                    x: 7460,
                                    y: 440
                                };
                            }
                            delete game.cameraOverrideX;
                            delete game.cameraOverrideY;
                            game.camY = 0;
                            game.player.frozen = false;
                        }
                    })
                });
            }), 900);
        }), 150);
    }), 480);
};
