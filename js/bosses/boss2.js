var btnSi = typeof btnSi !== "undefined" ? btnSi : typeof document !== "undefined" ? document.getElementById("btnSi") : null;

var btnNo = typeof btnNo !== "undefined" ? btnNo : typeof document !== "undefined" ? document.getElementById("btnNo") : null;

function drawOSMouseCursor(ctx, x, y, clicking) {
    ctx.save();
    ctx.translate(x, y);
    if (clicking) {
        ctx.scale(0.9, 0.9);
    }
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.moveTo(2, 2);
    ctx.lineTo(2, 19);
    ctx.lineTo(6.5, 15);
    ctx.lineTo(10.5, 23);
    ctx.lineTo(13.5, 21.5);
    ctx.lineTo(9.5, 14);
    ctx.lineTo(15, 14);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = clicking ? "#ffea00" : "#ffffff";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 17);
    ctx.lineTo(4.5, 13);
    ctx.lineTo(8.5, 21);
    ctx.lineTo(11.5, 19.5);
    ctx.lineTo(7.5, 12);
    ctx.lineTo(13, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (clicking) {
        ctx.strokeStyle = "rgba(255, 235, 59, 0.9)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
}

function distToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const l2 = dx * dx + dy * dy;
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function drawStraightLaserBeam(ctx, ox, oy, angle, len, thickness, time, isRed) {
    ctx.save();
    ctx.translate(ox, oy);
    ctx.rotate(angle);

    const streamH = thickness * 2.2;
    const gStream = ctx.createLinearGradient(0, -streamH / 2, 0, streamH / 2);
    if (isRed) {
        gStream.addColorStop(0, "rgba(255, 0, 80, 0)");
        gStream.addColorStop(0.3, "rgba(255, 0, 80, 0.35)");
        gStream.addColorStop(0.5, "rgba(255, 80, 120, 0.6)");
        gStream.addColorStop(0.7, "rgba(255, 0, 80, 0.35)");
        gStream.addColorStop(1, "rgba(255, 0, 80, 0)");
    } else {
        gStream.addColorStop(0, "rgba(0, 180, 255, 0)");
        gStream.addColorStop(0.3, "rgba(0, 200, 255, 0.35)");
        gStream.addColorStop(0.5, "rgba(0, 255, 255, 0.6)");
        gStream.addColorStop(0.7, "rgba(0, 200, 255, 0.35)");
        gStream.addColorStop(1, "rgba(0, 180, 255, 0)");
    }
    ctx.fillStyle = gStream;
    ctx.fillRect(0, -streamH / 2, len, streamH);

    const h = thickness;
    const gBeam = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    if (isRed) {
        gBeam.addColorStop(0, "rgba(255, 0, 60, 0.9)");
        gBeam.addColorStop(0.2, "#ff3366");
        gBeam.addColorStop(0.4, "#ffffff");
        gBeam.addColorStop(0.6, "#ffffff");
        gBeam.addColorStop(0.8, "#ff3366");
        gBeam.addColorStop(1, "rgba(255, 0, 60, 0.9)");
    } else {
        gBeam.addColorStop(0, "rgba(0, 120, 255, 0.9)");
        gBeam.addColorStop(0.2, "#00ffff");
        gBeam.addColorStop(0.4, "#ffffff");
        gBeam.addColorStop(0.6, "#ffffff");
        gBeam.addColorStop(0.8, "#00ffff");
        gBeam.addColorStop(1, "rgba(0, 120, 255, 0.9)");
    }
    ctx.fillStyle = gBeam;
    ctx.fillRect(0, -h / 2, len, h);

    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = isRed ? "#ff0055" : "#00ffff";
    ctx.shadowBlur = 18;
    ctx.fillRect(0, -h * 0.22, len, h * 0.44);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let x = 0; x < len; x += 40) {
        const yTop = -h * 0.4 + Math.sin(time * 0.4 + x * 0.08) * 5 + (Math.random() - 0.5) * 4;
        if (x === 0) ctx.moveTo(x, yTop);
        else ctx.lineTo(x, yTop);
    }
    ctx.stroke();

    const gFlare = ctx.createRadialGradient(0, 0, 2, 0, 0, thickness * 1.5);
    gFlare.addColorStop(0, "#ffffff");
    gFlare.addColorStop(0.4, isRed ? "#ff0055" : "#00ffff");
    gFlare.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = gFlare;
    ctx.beginPath();
    ctx.arc(0, 0, thickness * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function updateAndDrawFloatingCannons(ctx, tb, cameraX, time) {
    if (!tb || !tb.floatingCannons || tb.floatingCannons.length === 0) return;
    if (tb.state !== "fighting") return;

    for (let i = 0; i < tb.floatingCannons.length; i++) {
        const cannon = tb.floatingCannons[i];
        const isLeft = cannon.id === "left";
        const targetX = isLeft ? (tb.x - 85 + Math.sin(time * 2.5) * 6) : (tb.x + tb.w + 85 - Math.sin(time * 2.5) * 6);
        const targetY = tb.y + 35 + Math.cos(time * 2.5 + (isLeft ? 0 : Math.PI)) * 9;

        cannon.x += (targetX - cannon.x) * 0.15;
        cannon.y += (targetY - cannon.y) * 0.15;

        const cx = cannon.x - cameraX;
        const cy = cannon.y;
        const px = game.player.x + game.player.w / 2 - cameraX;
        const py = game.player.y + game.player.h / 2;

        if (cannon.state && cannon.state.startsWith("aiming")) {
            const targetAngle = Math.atan2(py - cy, px - cx);
            cannon.angle += (targetAngle - cannon.angle) * 0.2;
        } else if (cannon.state && (cannon.state.startsWith("charging") || cannon.state.startsWith("firing"))) {
            cannon.angle = cannon.lockedAngle;
        } else {
            const idleTarget = Math.atan2(py - cy, px - cx);
            cannon.angle += (idleTarget - cannon.angle) * 0.05;
        }

        const muzzleDist = 44;
        const muzzleX = cx + Math.cos(cannon.angle) * muzzleDist;
        const muzzleY = cy + Math.sin(cannon.angle) * muzzleDist;

        if (cannon.state && cannon.state.startsWith("aiming")) {
            ctx.save();
            ctx.strokeStyle = "rgba(255, 0, 50, 0.45)";
            ctx.lineWidth = 8;
            ctx.shadowColor = "#ff0033";
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.moveTo(muzzleX, muzzleY);
            ctx.lineTo(muzzleX + Math.cos(cannon.angle) * 1600, muzzleY + Math.sin(cannon.angle) * 1600);
            ctx.stroke();

            ctx.strokeStyle = "#ff0033";
            ctx.lineWidth = 3.5;
            ctx.setLineDash([14, 6]);
            ctx.lineDashOffset = -time * 50;
            ctx.beginPath();
            ctx.moveTo(muzzleX, muzzleY);
            ctx.lineTo(muzzleX + Math.cos(cannon.angle) * 1600, muzzleY + Math.sin(cannon.angle) * 1600);
            ctx.stroke();

            ctx.strokeStyle = "#ffe4e6";
            ctx.lineWidth = 1.4;
            ctx.setLineDash([4, 16]);
            ctx.lineDashOffset = -time * 50;
            ctx.stroke();

            ctx.setLineDash([]);
            const retPulse = 1 + Math.sin(time * 16) * 0.25;
            ctx.strokeStyle = "#ff0044";
            ctx.lineWidth = 2.4;
            ctx.shadowColor = "#ff0000";
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(px, py, 14 * retPulse, 0, Math.PI * 2);
            ctx.stroke();

            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(px - 16, py); ctx.lineTo(px - 6, py);
            ctx.moveTo(px + 6, py); ctx.lineTo(px + 16, py);
            ctx.moveTo(px, py - 16); ctx.lineTo(px, py - 6);
            ctx.moveTo(px, py + 6); ctx.lineTo(px, py + 16);
            ctx.stroke();

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(px, py, 4.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.restore();
        }

        if (cannon.state && cannon.state.startsWith("charging")) {
            ctx.save();
            const pulse = 0.85 + Math.sin(time * 30) * 0.15;

            ctx.strokeStyle = `rgba(255, 0, 50, ${pulse * 0.75})`;
            ctx.lineWidth = 12;
            ctx.shadowColor = "#ff0033";
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.moveTo(muzzleX, muzzleY);
            ctx.lineTo(muzzleX + Math.cos(cannon.lockedAngle) * 1600, muzzleY + Math.sin(cannon.lockedAngle) * 1600);
            ctx.stroke();

            ctx.strokeStyle = "#ff0022";
            ctx.lineWidth = 5.5;
            ctx.stroke();

            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2.2;
            ctx.stroke();
            ctx.shadowBlur = 0;

            const chargeProg = Math.min(1, (cannon.chargeTimer || 0) / 48);
            const orbRad = 4 + chargeProg * 16;
            const grad = ctx.createRadialGradient(muzzleX, muzzleY, 1, muzzleX, muzzleY, orbRad);
            grad.addColorStop(0, "#ffffff");
            grad.addColorStop(0.3, "#00ffff");
            grad.addColorStop(0.7, "#ff0055");
            grad.addColorStop(1, "rgba(255, 0, 85, 0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(muzzleX, muzzleY, orbRad, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.4;
            for (let s = 0; s < 4; s++) {
                const sAng = Math.random() * Math.PI * 2;
                const sLen = orbRad * (1 + Math.random() * 0.7);
                ctx.beginPath();
                ctx.moveTo(muzzleX, muzzleY);
                ctx.lineTo(muzzleX + Math.cos(sAng) * sLen, muzzleY + Math.sin(sAng) * sLen);
                ctx.stroke();
            }
            ctx.restore();
        }

        if (cannon.state && cannon.state.startsWith("firing")) {
            drawStraightLaserBeam(ctx, muzzleX, muzzleY, cannon.lockedAngle, 1400, 28, time, true);

            if (game.player && !game.player.frozen) {
                const wmX = cannon.x + Math.cos(cannon.lockedAngle) * muzzleDist;
                const wmY = cannon.y + Math.sin(cannon.lockedAngle) * muzzleDist;
                const weX = wmX + Math.cos(cannon.lockedAngle) * 1400;
                const weY = wmY + Math.sin(cannon.lockedAngle) * 1400;
                const plX = game.player.x + game.player.w / 2;
                const plY = game.player.y + game.player.h / 2;

                if (distToSegment(plX, plY, wmX, wmY, weX, weY) < 24 + (game.player.w / 2)) {
                    const energyDash = (game.player.dashMax && game.player.dashTimer > 0) || game.player.isDashing;
                    if (!energyDash && (!game.player.invulnerable || game.player.invulnerable <= 0)) {
                        if (typeof game.player.takeDamage === "function") {
                            game.player.takeDamage(24);
                        }
                    }
                }
            }
        }

        ctx.save();
        ctx.translate(cx, cy);

        for (let tDir of [-11, 11]) {
            const fLen = 16 + Math.random() * 12;
            const thGrad = ctx.createLinearGradient(tDir, 16, tDir, 16 + fLen);
            thGrad.addColorStop(0, "#ffffff");
            thGrad.addColorStop(0.3, "#00f0ff");
            thGrad.addColorStop(0.7, "#0284c7");
            thGrad.addColorStop(1, "rgba(2, 132, 199, 0)");
            ctx.fillStyle = thGrad;
            ctx.beginPath();
            ctx.moveTo(tDir - 4, 16);
            ctx.lineTo(tDir + 4, 16);
            ctx.lineTo(tDir, 16 + fLen);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "#1e293b";
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 1;
            ctx.fillRect(tDir - 5, 12, 10, 6);
            ctx.strokeRect(tDir - 5, 12, 10, 6);
        }

        ctx.save();
        ctx.shadowColor = "rgba(0, 240, 255, 0.35)";
        ctx.shadowBlur = 12;

        ctx.fillStyle = "#090d16";
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        const rOut = 25;
        for (let a = 0; a < 8; a++) {
            const ang = (a * Math.PI) / 4 + Math.PI / 8;
            const ax = Math.cos(ang) * rOut;
            const ay = Math.sin(ang) * rOut;
            if (a === 0) ctx.moveTo(ax, ay);
            else ctx.lineTo(ax, ay);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = "#1e293b";
        ctx.strokeStyle = "#ff0055";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, 19, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = cannon.state.startsWith("charging") ? "#ff0055" : "#00f0ff";
        ctx.lineWidth = 1.2;
        for (let a = 0; a < 4; a++) {
            const ang = a * (Math.PI / 2);
            ctx.beginPath();
            ctx.moveTo(Math.cos(ang) * 10, Math.sin(ang) * 10);
            ctx.lineTo(Math.cos(ang) * 23, Math.sin(ang) * 23);
            ctx.stroke();
        }

        const corePulse = 0.85 + Math.sin(time * 5 + i) * 0.15;
        const isCharging = cannon.state.startsWith("charging");
        const isFiring = cannon.state.startsWith("firing");
        const coreCol = isFiring ? "#ffffff" : isCharging ? "#ff0044" : "#00f0ff";

        ctx.save();
        ctx.rotate(time * 2.5);
        ctx.strokeStyle = isCharging ? "#ff0055" : "#38bdf8";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.fillStyle = coreCol;
        ctx.shadowColor = coreCol;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(0, 0, (isCharging ? 9 : 7) * corePulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.rotate(cannon.angle);

        ctx.fillStyle = "#0f172a";
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 13, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(10, 10);
        ctx.lineTo(10, -10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const barrelLen = 34;
        const barrelH = 14;
        const bGrad = ctx.createLinearGradient(8, -barrelH / 2, 8, barrelH / 2);
        bGrad.addColorStop(0, "#334155");
        bGrad.addColorStop(0.5, "#0f172a");
        bGrad.addColorStop(1, "#1e293b");
        ctx.fillStyle = bGrad;
        ctx.strokeStyle = isCharging ? "#ff0044" : "#38bdf8";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(8, -barrelH / 2, barrelLen, barrelH, 2) : ctx.rect(8, -barrelH / 2, barrelLen, barrelH);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isCharging ? "#ff0055" : "#0284c7";
        ctx.fillRect(10, -barrelH / 2 - 2, barrelLen - 4, 3);
        ctx.fillRect(10, barrelH / 2 - 1, barrelLen - 4, 3);

        const coilCol = isCharging ? "#ff0044" : "#00f0ff";
        ctx.fillStyle = coilCol;
        ctx.shadowColor = coilCol;
        ctx.shadowBlur = 6;
        for (let c = 0; c < 3; c++) {
            ctx.fillRect(14 + c * 8, -4, 3, 8);
        }
        ctx.shadowBlur = 0;

        const finDeploy = isCharging ? 6 : isFiring ? 8 : 2;
        ctx.fillStyle = "#1e293b";
        ctx.strokeStyle = isCharging ? "#ff0044" : "#ffaa00";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(18, -barrelH / 2);
        ctx.lineTo(26, -barrelH / 2 - finDeploy);
        ctx.lineTo(34, -barrelH / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(18, barrelH / 2);
        ctx.lineTo(26, barrelH / 2 + finDeploy);
        ctx.lineTo(34, barrelH / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#0284c7";
        ctx.strokeStyle = isCharging ? "#ff0044" : "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.fillRect(8 + barrelLen - 2, -barrelH / 2 - 1, 6, barrelH + 2);
        ctx.strokeRect(8 + barrelLen - 2, -barrelH / 2 - 1, 6, barrelH + 2);

        ctx.fillStyle = isCharging ? "#ffffff" : "#00f0ff";
        ctx.fillRect(8 + barrelLen + 4, -barrelH / 2 + 1, 4, 3);
        ctx.fillRect(8 + barrelLen + 4, barrelH / 2 - 4, 4, 3);

        ctx.restore();
        ctx.restore();
    }
}

function drawOSFolderIcon(ctx, x, y, label, isSelected, isOpen) {
    ctx.save();
    if (isSelected) {
        ctx.fillStyle = "rgba(180, 220, 255, 0.32)";
        ctx.strokeStyle = "rgba(120, 185, 255, 0.85)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x - 22, y - 8, 76, 62, 4) : ctx.rect(x - 22, y - 8, 76, 62);
        ctx.fill();
        ctx.stroke();
    }

    ctx.fillStyle = "#d49619";
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y - 5, 16, 8, [3, 3, 0, 0]) : ctx.rect(x, y - 5, 16, 8);
    ctx.fill();

    const backGrad = ctx.createLinearGradient(x, y, x, y + 26);
    backGrad.addColorStop(0, "#f3b92e");
    backGrad.addColorStop(1, "#c9820e");
    ctx.fillStyle = backGrad;
    ctx.strokeStyle = "#995d00";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, 38, 26, 3) : ctx.rect(x, y, 38, 26);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + 5, y - 3, 28, 14);
    ctx.strokeStyle = "#cbd5e1";
    ctx.strokeRect(x + 5, y - 3, 28, 14);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 9, y + 1); ctx.lineTo(x + 29, y + 1);
    ctx.moveTo(x + 9, y + 4); ctx.lineTo(x + 25, y + 4);
    ctx.stroke();

    const frontGrad = ctx.createLinearGradient(x, y + 6, x, y + 27);
    frontGrad.addColorStop(0, "#ffd966");
    frontGrad.addColorStop(0.4, "#f5b722");
    frontGrad.addColorStop(1, "#df8f06");
    ctx.fillStyle = frontGrad;
    ctx.strokeStyle = "#804c00";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    if (isOpen) {
        ctx.moveTo(x - 3, y + 27);
        ctx.lineTo(x + 5, y + 10);
        ctx.lineTo(x + 35, y + 10);
        ctx.lineTo(x + 41, y + 27);
    } else {
        ctx.roundRect ? ctx.roundRect(x, y + 6, 38, 21, [0, 0, 3, 3]) : ctx.rect(x, y + 6, 38, 21);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.fillRect(x + 2, y + 7, 34, 4);

    ctx.font = 'bold 11px "Segoe UI", Tahoma, sans-serif';
    ctx.textAlign = "center";
    if (isSelected) {
        ctx.fillStyle = "rgba(30, 100, 200, 0.85)";
        const tw = ctx.measureText(label).width + 8;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x + 19 - tw / 2, y + 34, tw, 14, 3) : ctx.rect(x + 19 - tw / 2, y + 34, tw, 14);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
    } else {
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 4;
        ctx.fillStyle = "#ffffff";
    }
    ctx.fillText(label, x + 19, y + 45);
    ctx.shadowBlur = 0;
    ctx.restore();
}

function drawOSTrashIcon(ctx, x, y, label, isSelected, isOpen, isShaking) {
    ctx.save();
    let shakeOffset = 0;
    if (isShaking > 0) {
        shakeOffset = (Math.random() - 0.5) * 6;
    }
    ctx.translate(shakeOffset, 0);

    if (isSelected) {
        ctx.fillStyle = "rgba(180, 220, 255, 0.32)";
        ctx.strokeStyle = "rgba(120, 185, 255, 0.85)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x - 20, y - 8, 72, 62, 4) : ctx.rect(x - 20, y - 8, 72, 62);
        ctx.fill();
        ctx.stroke();
    }

    const binGrad = ctx.createLinearGradient(x + 4, y + 8, x + 24, y + 30);
    if (isShaking > 0) {
        binGrad.addColorStop(0, "rgba(220, 38, 38, 0.8)");
        binGrad.addColorStop(1, "rgba(120, 15, 15, 0.9)");
    } else {
        binGrad.addColorStop(0, "rgba(180, 230, 255, 0.65)");
        binGrad.addColorStop(1, "rgba(40, 120, 180, 0.75)");
    }
    ctx.fillStyle = binGrad;
    ctx.strokeStyle = isShaking > 0 ? "#ef4444" : "rgba(220, 245, 255, 0.85)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 8);
    ctx.lineTo(x + 24, y + 8);
    ctx.lineTo(x + 22, y + 30);
    ctx.lineTo(x + 6, y + 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = isShaking > 0 ? "rgba(255, 120, 120, 0.6)" : "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 9, y + 10); ctx.lineTo(x + 9, y + 28);
    ctx.moveTo(x + 14, y + 10); ctx.lineTo(x + 14, y + 28);
    ctx.moveTo(x + 19, y + 10); ctx.lineTo(x + 19, y + 28);
    ctx.stroke();

    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 3, y + 8); ctx.lineTo(x + 25, y + 8);
    ctx.moveTo(x + 6, y + 30); ctx.lineTo(x + 22, y + 30);
    ctx.stroke();

    ctx.fillStyle = isShaking > 0 ? "rgba(239, 68, 68, 0.85)" : "rgba(200, 240, 255, 0.75)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 1.5;
    ctx.save();
    if (isOpen || isShaking > 0) {
        ctx.translate(x + 2, y + 7);
        ctx.rotate(-0.4);
        ctx.fillRect(0, -3, 26, 4);
        ctx.strokeRect(0, -3, 26, 4);
        ctx.fillRect(10, -6, 6, 3);
    } else {
        ctx.fillRect(x + 2, y + 4, 24, 4);
        ctx.strokeRect(x + 2, y + 4, 24, 4);
        ctx.fillRect(x + 11, y + 1, 6, 3);
    }
    ctx.restore();

    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    if (isShaking > 0) {
        ctx.fillText("🔥", x + 14, y + 22);
    } else {
        ctx.fillText("♻️", x + 14, y + 22);
    }

    ctx.font = 'bold 11px "Segoe UI", Tahoma, sans-serif';
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 4;
    ctx.fillStyle = isShaking > 0 ? "#ff4444" : "#ffffff";
    ctx.fillText(label, x + 14, y + 45);
    ctx.shadowBlur = 0;
    ctx.restore();
}

function drawOSExeIcon(ctx, x, y, label, isSelected) {
    ctx.save();
    if (isSelected) {
        ctx.fillStyle = "rgba(180, 220, 255, 0.32)";
        ctx.strokeStyle = "rgba(120, 185, 255, 0.85)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x - 22, y - 8, 80, 58, 4) : ctx.rect(x - 22, y - 8, 80, 58);
        ctx.fill();
        ctx.stroke();
    }

    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#ff0055";
    ctx.lineWidth = 1.5;
    ctx.fillRect(x, y, 36, 26);
    ctx.strokeRect(x, y, 36, 26);

    ctx.fillStyle = "#ff0055";
    ctx.fillRect(x + 1, y + 1, 34, 6);

    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🔥", x + 18, y + 22);

    ctx.font = 'bold 10px "Segoe UI", Tahoma, sans-serif';
    ctx.textAlign = "center";
    if (isSelected) {
        ctx.fillStyle = "#ff0055";
        const tw = ctx.measureText(label).width + 6;
        ctx.fillRect(x + 18 - tw / 2, y + 32, tw, 13);
        ctx.fillStyle = "#ffffff";
    } else {
        ctx.fillStyle = "#ff5588";
    }
    ctx.fillText(label, x + 18, y + 42);
    ctx.restore();
}

function drawOSSpinner(ctx, cx, cy, radius, timer) {
    ctx.save();
    ctx.translate(cx, cy);

    ctx.strokeStyle = "rgba(255, 0, 85, 0.35)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.rotate(timer * 0.08);
    ctx.strokeStyle = "#ff0055";
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.rotate(-timer * 0.12);
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.65, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    const pulse = 0.8 + Math.sin(timer * 0.2) * 0.2;
    ctx.fillStyle = "#ff0033";
    ctx.shadowColor = "#ff0055";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.35 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-radius * 0.22, 0); ctx.lineTo(radius * 0.22, 0);
    ctx.moveTo(0, -radius * 0.22); ctx.lineTo(0, radius * 0.22);
    ctx.stroke();

    ctx.restore();
}

function drawOSWindow(ctx, x, y, w, h, title, icon, isAlert) {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x + 4, y + 6, w, h, 8) : ctx.rect(x + 4, y + 6, w, h);
    ctx.fill();

    const glassGrad = ctx.createLinearGradient(x, y, x, y + h);
    if (isAlert) {
        glassGrad.addColorStop(0, "rgba(220, 38, 38, 0.75)");
        glassGrad.addColorStop(0.12, "rgba(185, 28, 28, 0.65)");
        glassGrad.addColorStop(1, "rgba(69, 10, 10, 0.85)");
    } else {
        glassGrad.addColorStop(0, "rgba(125, 185, 232, 0.75)");
        glassGrad.addColorStop(0.12, "rgba(50, 120, 190, 0.65)");
        glassGrad.addColorStop(1, "rgba(15, 45, 85, 0.85)");
    }
    ctx.fillStyle = glassGrad;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, w, h, 8) : ctx.rect(x, y, w, h);
    ctx.fill();

    ctx.strokeStyle = isAlert ? "rgba(255, 120, 120, 0.8)" : "rgba(255, 255, 255, 0.65)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    const titleH = 30;
    const glareH = 14;
    const glareGrad = ctx.createLinearGradient(x, y, x, y + glareH);
    glareGrad.addColorStop(0, "rgba(255, 255, 255, 0.55)");
    glareGrad.addColorStop(1, "rgba(255, 255, 255, 0.08)");
    ctx.fillStyle = glareGrad;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x + 1, y + 1, w - 2, glareH, [7, 7, 0, 0]) : ctx.rect(x + 1, y + 1, w - 2, glareH);
    ctx.fill();

    const insetX = x + 6;
    const insetY = y + titleH;
    const insetW = w - 12;
    const insetH = h - titleH - 6;
    ctx.fillStyle = isAlert ? "#1a080c" : "#0d1b2a";
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(insetX, insetY, insetW, insetH, 4) : ctx.rect(insetX, insetY, insetW, insetH);
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    ctx.stroke();

    ctx.font = 'bold 12px "Segoe UI", Tahoma, sans-serif';
    ctx.textAlign = "left";
    ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
    ctx.shadowBlur = 6;
    ctx.fillStyle = "#ffffff";
    ctx.fillText((icon ? icon + "  " : "") + title, x + 12, y + 20);
    ctx.shadowBlur = 0;

    const btnW = 28, btnH = 18;
    const btnY = y + 4;

    const closeX = x + w - 34;
    const closeGrad = ctx.createLinearGradient(closeX, btnY, closeX, btnY + btnH);
    closeGrad.addColorStop(0, "#e81123");
    closeGrad.addColorStop(0.5, "#c40d1c");
    closeGrad.addColorStop(1, "#8b0000");
    ctx.fillStyle = closeGrad;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(closeX, btnY, btnW, btnH, [0, 4, 0, 4]) : ctx.rect(closeX, btnY, btnW, btnH);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.fillRect(closeX + 1, btnY + 1, btnW - 2, btnH / 2);
    ctx.fillStyle = "#ffffff";
    ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = "center";
    ctx.fillText("✕", closeX + btnW / 2, btnY + 13);

    const maxGrad = ctx.createLinearGradient(closeX - 30, btnY, closeX - 30, btnY + btnH);
    maxGrad.addColorStop(0, "rgba(255, 255, 255, 0.3)");
    maxGrad.addColorStop(1, "rgba(0, 0, 0, 0.2)");
    ctx.fillStyle = maxGrad;
    ctx.fillRect(closeX - 30, btnY, btnW, btnH);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.strokeRect(closeX - 30, btnY, btnW, btnH);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("□", closeX - 30 + btnW / 2, btnY + 12);

    ctx.fillStyle = maxGrad;
    ctx.fillRect(closeX - 60, btnY, btnW, btnH);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.strokeRect(closeX - 60, btnY, btnW, btnH);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("_", closeX - 60 + btnW / 2, btnY + 11);

    ctx.restore();
}

function startProtectionDesktopCinematic(tb) {
    if (!tb) return;
    tb._desktopCinematicActive = true;
    tb.showChoice = false;
    tb.turnPhase = "choice_dialog";
    tb.vulnerable = false;
    if (game.player) {
        game.player.frozen = true;
        game.player.vx = 0;
    }
    for (let k = enemyProjectiles.length - 1; k >= 0; k--) {
        if (enemyProjectiles[k].tbShot) enemyProjectiles.splice(k, 1);
    }
    const deskW = 580;
    const deskH = 370;
    const deskX = Math.round(VIEW_W / 2 - deskW / 2);
    const deskY = Math.round(VIEW_H / 2 - deskH / 2);

    tb._desktopCinematic = {
        phase: "alert",
        timer: 0,
        deskX: deskX,
        deskY: deskY,
        deskW: deskW,
        deskH: deskH,
        cursorX: deskX + 290,
        cursorY: deskY + 280,
        cursorClicking: false,
        castigoWindowOpen: false,
        activationOpen: false,
        piedadDragged: false,
        piedadDeleted: false,
        piedadX: deskX + 70,
        piedadY: deskY + 160,
        trashOpen: false,
        trashShaking: 0,
        particles: []
    };
    playSound(450, 0.25, "sawtooth", 0.35, 150);
}

function confirmTechBossChoice() {
    if (!game.techBoss) return;
    startProtectionDesktopCinematic(game.techBoss);
}

function drawProtectionDesktopCinematic(ctx, tb) {
    const cin = tb._desktopCinematic;
    if (!cin) return;

    cin.timer++;
    if (game.player) {
        game.player.frozen = true;
        game.player.vx = 0;
    }
    tb.vulnerable = false;

    for (let i = cin.particles.length - 1; i >= 0; i--) {
        const p = cin.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) cin.particles.splice(i, 1);
    }

    const deskX = cin.deskX;
    const deskY = cin.deskY;
    const deskW = cin.deskW;
    const deskH = cin.deskH;

    const iconCastigoX = deskX + 70;
    const iconCastigoY = deskY + 60;
    const iconPiedadBaseX = deskX + 70;
    const iconPiedadBaseY = deskY + 160;
    const iconTrashX = deskX + 470;
    const iconTrashY = deskY + 230;

    const winCastigoX = deskX + 130;
    const winCastigoY = deskY + 45;
    const winCastigoW = 320;
    const winCastigoH = 200;
    const iconFuriaX = winCastigoX + 60;
    const iconFuriaY = winCastigoY + 65;

    const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    if (cin.phase === "alert") {
        if (cin.timer === 10 || cin.timer === 45 || cin.timer === 80) {
            playSound(880, 0.1, "square", 0.3, 440);
        }
        if (cin.timer >= 125) {
            cin.phase = "desktop_open";
            cin.timer = 0;
            playSound(550, 0.2, "sawtooth", 0.35, 1100);
        }
    } else if (cin.phase === "desktop_open") {
        if (cin.timer >= 25) {
            cin.phase = "cursor_to_castigo";
            cin.timer = 0;
        }
    } else if (cin.phase === "cursor_to_castigo") {
        const t = Math.min(1, cin.timer / 35);
        const e = easeInOut(t);
        const startX = deskX + 290;
        const startY = deskY + 280;
        const targetX = iconCastigoX + 18;
        const targetY = iconCastigoY + 18;
        cin.cursorX = startX + (targetX - startX) * e;
        cin.cursorY = startY + (targetY - startY) * e;
        if (cin.timer >= 35) {
            cin.phase = "open_castigo";
            cin.timer = 0;
            cin.cursorClicking = true;
            playSound(1100, 0.05, "sine", 0.25, 1400);
        }
    } else if (cin.phase === "open_castigo") {
        if (cin.timer === 8) {
            cin.cursorClicking = false;
        }
        if (cin.timer === 12) {
            cin.cursorClicking = true;
            playSound(1250, 0.05, "sine", 0.25, 1600);
        }
        if (cin.timer === 18) {
            cin.cursorClicking = false;
        }
        if (cin.timer >= 22) {
            cin.castigoWindowOpen = true;
            cin.phase = "folder_open";
            cin.timer = 0;
            playSound(700, 0.1, "square", 0.3, 1000);
        }
    } else if (cin.phase === "folder_open") {
        if (cin.timer >= 20) {
            cin.phase = "cursor_to_furia";
            cin.timer = 0;
        }
    } else if (cin.phase === "cursor_to_furia") {
        const t = Math.min(1, cin.timer / 30);
        const e = easeInOut(t);
        const startX = iconCastigoX + 18;
        const startY = iconCastigoY + 18;
        const targetX = iconFuriaX + 18;
        const targetY = iconFuriaY + 18;
        cin.cursorX = startX + (targetX - startX) * e;
        cin.cursorY = startY + (targetY - startY) * e;
        if (cin.timer >= 30) {
            cin.phase = "click_furia";
            cin.timer = 0;
            cin.cursorClicking = true;
            playSound(1200, 0.06, "square", 0.3, 1500);
        }
    } else if (cin.phase === "click_furia") {
        if (cin.timer >= 12) {
            cin.cursorClicking = false;
        }
        if (cin.timer >= 20) {
            cin.activationOpen = true;
            cin.phase = "activating_furia";
            cin.timer = 0;
            playSound(400, 0.2, "sawtooth", 0.35, 800);
        }
    } else if (cin.phase === "activating_furia") {
        const progress = Math.min(1, cin.timer / 115);
        if (cin.timer % 24 === 0 && progress < 1) {
            playSound(280 + progress * 500, 0.06, "square", 0.18);
        }
        if (cin.timer === 115) {
            playSound(850, 0.35, "square", 0.45, 250);
            applyShake(6);
        }
        if (cin.timer >= 145) {
            cin.phase = "close_windows";
            cin.timer = 0;
            cin.activationOpen = false;
            playSound(500, 0.08, "sine", 0.25, 200);
        }
    } else if (cin.phase === "close_windows") {
        if (cin.timer === 15) {
            cin.castigoWindowOpen = false;
            playSound(450, 0.08, "square", 0.2, 250);
        }
        if (cin.timer >= 28) {
            cin.phase = "cursor_to_piedad";
            cin.timer = 0;
        }
    } else if (cin.phase === "cursor_to_piedad") {
        const t = Math.min(1, cin.timer / 30);
        const e = easeInOut(t);
        const startX = iconFuriaX + 18;
        const startY = iconFuriaY + 18;
        const targetX = iconPiedadBaseX + 18;
        const targetY = iconPiedadBaseY + 18;
        cin.cursorX = startX + (targetX - startX) * e;
        cin.cursorY = startY + (targetY - startY) * e;
        if (cin.timer >= 30) {
            cin.phase = "drag_piedad";
            cin.timer = 0;
            cin.piedadDragged = true;
            cin.cursorClicking = true;
            playSound(950, 0.05, "sine", 0.25, 1100);
        }
    } else if (cin.phase === "drag_piedad") {
        const t = Math.min(1, cin.timer / 60);
        const e = easeInOut(t);
        const startX = iconPiedadBaseX + 18;
        const startY = iconPiedadBaseY + 18;
        const targetX = iconTrashX + 15;
        const targetY = iconTrashY + 15;
        cin.cursorX = startX + (targetX - startX) * e;
        cin.cursorY = startY + (targetY - startY) * e;
        cin.piedadX = cin.cursorX - 18;
        cin.piedadY = cin.cursorY - 18;
        if (t >= 0.7) {
            cin.trashOpen = true;
        }
        if (cin.timer >= 60) {
            cin.cursorClicking = false;
            cin.piedadDragged = false;
            cin.piedadDeleted = true;
            cin.trashOpen = true;
            cin.trashShaking = 55;
            cin.phase = "empty_trash";
            cin.timer = 0;
            playSound(220, 0.15, "sawtooth", 0.35, 80);
            applyShake(5);
        }
    } else if (cin.phase === "empty_trash") {
        cin.trashShaking = Math.max(0, cin.trashShaking - 1);
        if (cin.timer % 7 === 0 && cin.timer < 45) {
            playSound(130 + Math.random() * 80, 0.08, "sawtooth", 0.28, 40);
            applyShake(2);
            for (let k = 0; k < 4; k++) {
                cin.particles.push({
                    x: iconTrashX + 15 + (Math.random() - 0.5) * 20,
                    y: iconTrashY + 10,
                    vx: (Math.random() - 0.5) * 4,
                    vy: -2 - Math.random() * 3,
                    life: 25,
                    color: ["#ff0055", "#ff4400", "#ffd700", "#ffffff"][Math.floor(Math.random() * 4)],
                    size: 3 + Math.random() * 3
                });
            }
        }
        if (cin.timer >= 60) {
            cin.phase = "finish";
            cin.timer = 0;
        }
    } else if (cin.phase === "finish") {
        if (cin.timer >= 15) {
            tb._desktopCinematicActive = false;
            tb.health += 20;
            tb.maxHealth = Math.max(tb.maxHealth, tb.health);
            tb.bonusHp = true;
            tb.glowTimer = 90;
            tb.phase = 5;
            tb.bulletCount = 9;
            for (let i = 0; i < 50; i++) {
                particles.push({
                    x: tb.x + tb.w / 2,
                    y: tb.y + tb.h / 2,
                    vx: (Math.random() - .5) * 16,
                    vy: (Math.random() - .5) * 16,
                    life: 50,
                    color: ["#ff0055", "#ff0000", "#ffd700", "#ff00ff"][Math.floor(Math.random() * 4)],
                    size: 6 + Math.random() * 4,
                    type: "spark"
                });
            }
            applyShake(15);
            playSound(200, 0.5, "sawtooth", 0.5, 900);
            addFloatingText(VIEW_W / 2, VIEW_H / 2 - 40, typeof __ === "function" ? __("flt_modo_furia") : "¡¡MODO FURIA ACTIVADO!!", "#ff0044", 26);
            if (typeof window.BossHUD !== "undefined" && window.BossHUD.update) {
                window.BossHUD.update(tb.health, tb.maxHealth, "#ffd700");
            }
            showAnimatedDialogue(__("ui_speaker_system"), "⚠️", typeof __ === "function" ? __("dlg_piedad_eliminada") : "¡¡LA PIEDAD HA SIDO ELIMINADA DEL SISTEMA!!", () => {
                showAnimatedDialogue(__("ui_speaker_mawlerknight"), "😈", typeof __ === "function" ? __("dlg_no_hay_piedad") : "¡¡NO HAY PIEDAD PARA NADIE!! ¡¡PREPÁRATE!!", () => {
                    for (let k = enemyProjectiles.length - 1; k >= 0; k--) {
                        if (enemyProjectiles[k].tbShot) enemyProjectiles.splice(k, 1);
                    }
                    tb.turnDamageTaken = 0;
                    tb.turnPhase = "boss_turn";
                    tb.attackTimer = 0;
                    game.player.frozen = false;
                }, 2500);
            }, 2500);
            return;
        }
    }

    ctx.save();

    ctx.fillStyle = "rgba(4, 10, 20, 0.82)";
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    if (cin.phase === "alert") {
        const alW = 620, alH = 226;
        const alX = Math.round(VIEW_W / 2 - alW / 2);
        const alY = Math.round(VIEW_H / 2 - alH / 2);

        ctx.fillStyle = "#ffaa00";
        ctx.fillRect(alX - 6, alY - 6, alW + 12, alH + 12);
        ctx.fillStyle = "#000000";
        for (let s = -alH; s < alW + 20; s += 24) {
            ctx.beginPath();
            ctx.moveTo(alX - 6 + s, alY - 6);
            ctx.lineTo(alX - 6 + s + 12, alY - 6);
            ctx.lineTo(alX - 6 + s + 12 - (alH + 12), alY + alH + 6);
            ctx.lineTo(alX - 6 + s - (alH + 12), alY + alH + 6);
            ctx.fill();
        }

        drawOSWindow(ctx, alX, alY, alW, alH, typeof __ === "function" ? __("sys_alerta_critica") : "ALERTA DE SISTEMA CRÍTICO", "⚠️", true);

        const pulse = Math.floor(cin.timer / 15) % 2 === 0;
        ctx.fillStyle = pulse ? "#ff0055" : "#ffcc00";
        ctx.font = 'bold 16px "Segoe UI", Tahoma, monospace';
        ctx.textAlign = "center";
        ctx.fillText(typeof __ === "function" ? __("sys_prot_activado") : "⚠️ 🚨 SISTEMA DE PROTECCIÓN ACTIVADO 🚨 ⚠️", alX + alW / 2, alY + 65);

        ctx.fillStyle = "#cbd5e1";
        ctx.font = '12px "Segoe UI", monospace';
        ctx.fillText(typeof __ === "function" ? __("sys_integridad_critica") : "> Integridad de Mawlerknight en estado crítico // Protocolo de emergencia", alX + alW / 2, alY + 90);

        const termBoxX = alX + 28;
        const termBoxY = alY + 108;
        const termBoxW = alW - 56;
        const termBoxH = 50;

        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(termBoxX, termBoxY, termBoxW, termBoxH, 4) : ctx.rect(termBoxX, termBoxY, termBoxW, termBoxH);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.textAlign = "left";
        ctx.font = '11px monospace';
        ctx.fillStyle = "#94a3b8";
        ctx.fillText("$ sys_protect.sh --run-defense --override", termBoxX + 14, termBoxY + 19);

        ctx.fillStyle = "#00ffcc";
        ctx.font = 'bold 12px monospace';
        ctx.fillText(typeof __ === "function" ? __("sys_ejecutando_programa") : "> Procediendo a ejecutar el programa: [ no_me_quiero_morir.exe ]", termBoxX + 14, termBoxY + 37);

        const alertPct = Math.min(1, cin.timer / 120);
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(termBoxX, alY + 172, termBoxW, 16);
        ctx.fillStyle = "#ff0055";
        ctx.fillRect(termBoxX, alY + 172, termBoxW * alertPct, 16);
        ctx.strokeStyle = "#ff3366";
        ctx.lineWidth = 1;
        ctx.strokeRect(termBoxX, alY + 172, termBoxW, 16);

        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        const cargandoTxt = typeof __ === "function" ? __("sys_cargando_prog", Math.round(alertPct * 100)) : `CARGANDO PROGRAMA: ${Math.round(alertPct * 100)}%`;
        ctx.fillText(cargandoTxt, alX + alW / 2, alY + 184);

        ctx.restore();
        return;
    }

    let deskScale = 1;
    if (cin.phase === "desktop_open") {
        deskScale = Math.min(1, cin.timer / 20);
    } else if (cin.phase === "finish") {
        deskScale = Math.max(0.01, 1 - cin.timer / 15);
    }

    ctx.save();
    if (deskScale < 1) {
        ctx.translate(deskX + deskW / 2, deskY + deskH / 2);
        ctx.scale(deskScale, deskScale);
        ctx.translate(-(deskX + deskW / 2), -(deskY + deskH / 2));
    }

    drawOSWindow(ctx, deskX, deskY, deskW, deskH, typeof __ === "function" ? __("sys_win_maowler_os") : "MawlerOS v2.0 - [no_me_quiero_morir.exe]", "🖥️", false);

    const wallX = deskX + 2;
    const wallY = deskY + 30;
    const wallW = deskW - 4;
    const wallH = deskH - 58;
    const wallGrad = ctx.createLinearGradient(wallX, wallY, wallX, wallY + wallH);
    wallGrad.addColorStop(0, "#0c447a");
    wallGrad.addColorStop(0.45, "#07294d");
    wallGrad.addColorStop(1, "#041527");
    ctx.fillStyle = wallGrad;
    ctx.fillRect(wallX, wallY, wallW, wallH);

    ctx.save();
    ctx.fillStyle = "rgba(0, 195, 255, 0.14)";
    ctx.beginPath();
    ctx.moveTo(wallX, wallY + wallH * 0.7);
    ctx.bezierCurveTo(wallX + wallW * 0.3, wallY + wallH * 0.25, wallX + wallW * 0.7, wallY + wallH * 0.8, wallX + wallW, wallY + wallH * 0.35);
    ctx.lineTo(wallX + wallW, wallY + wallH);
    ctx.lineTo(wallX, wallY + wallH);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.beginPath();
    ctx.moveTo(wallX, wallY + wallH * 0.5);
    ctx.bezierCurveTo(wallX + wallW * 0.4, wallY + wallH * 0.75, wallX + wallW * 0.6, wallY + wallH * 0.15, wallX + wallW, wallY + wallH * 0.6);
    ctx.lineTo(wallX + wallW, wallY + wallH);
    ctx.lineTo(wallX, wallY + wallH);
    ctx.closePath();
    ctx.fill();

    const bokehs = [
        { x: wallX + 110, y: wallY + 80, r: 30, a: 0.08 },
        { x: wallX + wallW - 130, y: wallY + 95, r: 42, a: 0.06 },
        { x: wallX + wallW * 0.52, y: wallY + wallH * 0.6, r: 35, a: 0.07 }
    ];
    for (let b of bokehs) {
        const bg = ctx.createRadialGradient(b.x, b.y, 1, b.x, b.y, b.r);
        bg.addColorStop(0, `rgba(255, 255, 255, ${b.a * 1.6})`);
        bg.addColorStop(0.5, `rgba(0, 220, 255, ${b.a})`);
        bg.addColorStop(1, "rgba(0, 220, 255, 0)");
        ctx.fillStyle = bg;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    const taskY = deskY + deskH - 28;
    const taskGrad = ctx.createLinearGradient(deskX, taskY, deskX, taskY + 28);
    taskGrad.addColorStop(0, "rgba(20, 45, 80, 0.75)");
    taskGrad.addColorStop(0.4, "rgba(10, 25, 50, 0.85)");
    taskGrad.addColorStop(1, "rgba(5, 15, 30, 0.95)");
    ctx.fillStyle = taskGrad;
    ctx.fillRect(deskX + 1, taskY, deskW - 2, 27);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(deskX + 1, taskY); ctx.lineTo(deskX + deskW - 1, taskY); ctx.stroke();

    const orbX = deskX + 20;
    const orbY = taskY + 12;
    const orbRad = 15;

    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.beginPath(); ctx.arc(orbX, orbY + 1, orbRad, 0, Math.PI * 2); ctx.fill();

    const orbGrad = ctx.createRadialGradient(orbX - 4, orbY - 4, 2, orbX, orbY, orbRad);
    orbGrad.addColorStop(0, "#42a5f5");
    orbGrad.addColorStop(0.5, "#1976d2");
    orbGrad.addColorStop(0.9, "#0d47a1");
    orbGrad.addColorStop(1, "#0a2d64");
    ctx.fillStyle = orbGrad;
    ctx.beginPath(); ctx.arc(orbX, orbY, orbRad, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.beginPath();
    ctx.ellipse(orbX, orbY - 6, orbRad * 0.7, orbRad * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    const flagW = 4, flagH = 4;
    ctx.fillStyle = "#ef4444"; ctx.fillRect(orbX - flagW - 1, orbY - flagH - 1, flagW, flagH);
    ctx.fillStyle = "#22c55e"; ctx.fillRect(orbX + 1, orbY - flagH - 1, flagW, flagH);
    ctx.fillStyle = "#3b82f6"; ctx.fillRect(orbX - flagW - 1, orbY + 1, flagW, flagH);
    ctx.fillStyle = "#eab308"; ctx.fillRect(orbX + 1, orbY + 1, flagW, flagH);

    const taskBtnX = deskX + 46;
    ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
    ctx.fillRect(taskBtnX, taskY + 3, 38, 22);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.strokeRect(taskBtnX, taskY + 3, 38, 22);
    ctx.fillStyle = "#ffd54f";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("📁", taskBtnX + 19, taskY + 19);

    ctx.font = 'bold 9px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = "right";
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText("13:37", deskX + deskW - 18, taskY + 12);
    ctx.font = '8px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("04/10/2026", deskX + deskW - 18, taskY + 22);

    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.fillRect(deskX + deskW - 10, taskY + 3, 8, 22);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.strokeRect(deskX + deskW - 10, taskY + 3, 8, 22);

    const isCastigoSelected = cin.phase === "open_castigo" || cin.phase === "cursor_to_castigo";
    drawOSFolderIcon(ctx, iconCastigoX, iconCastigoY, typeof __ === "function" ? __("sys_folder_castigo") : "Castigo", isCastigoSelected, cin.castigoWindowOpen);

    if (!cin.piedadDeleted) {
        if (cin.piedadDragged) {
            ctx.save();
            ctx.globalAlpha = 0.85;
            drawOSFolderIcon(ctx, cin.piedadX, cin.piedadY, typeof __ === "function" ? __("sys_folder_piedad") : "Piedad", true, false);
            ctx.restore();
        } else {
            const isPiedadSelected = cin.phase === "cursor_to_piedad";
            drawOSFolderIcon(ctx, iconPiedadBaseX, iconPiedadBaseY, typeof __ === "function" ? __("sys_folder_piedad") : "Piedad", isPiedadSelected, false);
        }
    }

    drawOSTrashIcon(ctx, iconTrashX, iconTrashY, typeof __ === "function" ? __("sys_folder_papelera") : "Papelera", false, cin.trashOpen, cin.trashShaking);

    if (cin.castigoWindowOpen) {
        drawOSWindow(ctx, winCastigoX, winCastigoY, winCastigoW, winCastigoH, typeof __ === "function" ? __("sys_win_castigo") : "C:\\Castigo - Explorador", "📁", false);

        ctx.fillStyle = "#0b1524";
        ctx.fillRect(winCastigoX + 2, winCastigoY + 27, winCastigoW - 4, winCastigoH - 29);

        ctx.fillStyle = "#030712";
        ctx.fillRect(winCastigoX + 8, winCastigoY + 32, winCastigoW - 16, 18);
        ctx.strokeStyle = "#1e293b";
        ctx.strokeRect(winCastigoX + 8, winCastigoY + 32, winCastigoW - 16, 18);
        ctx.fillStyle = "#38bdf8";
        ctx.font = "10px monospace";
        ctx.textAlign = "left";
        ctx.fillText(typeof __ === "function" ? __("sys_dir_castigo") : "📁 Directorio: C:\\Castigo\\", winCastigoX + 14, winCastigoY + 45);

        const isFuriaSelected = cin.phase === "click_furia" || cin.phase === "cursor_to_furia" || cin.phase === "activating_furia";
        drawOSExeIcon(ctx, iconFuriaX, iconFuriaY, typeof __ === "function" ? __("sys_exe_furia") : "modo furia.exe", isFuriaSelected);
    }

    if (cin.activationOpen) {
        const actW = 420, actH = 210;
        const actX = Math.round(VIEW_W / 2 - actW / 2);
        const actY = Math.round(VIEW_H / 2 - actH / 2);

        drawOSWindow(ctx, actX, actY, actW, actH, typeof __ === "function" ? __("sys_ejecutando_furia") : "EJECUTANDO: MODO FURIA.EXE", "⚡", true);

        drawOSSpinner(ctx, actX + actW / 2, actY + 75, 26, cin.timer);

        const furiaPct = Math.min(1, cin.timer / 115);
        const pbX = actX + 35, pbY = actY + 122, pbW = actW - 70, pbH = 24;

        ctx.fillStyle = "#0f172a";
        ctx.fillRect(pbX, pbY, pbW, pbH);

        const fillGrad = ctx.createLinearGradient(pbX, pbY, pbX + pbW * furiaPct, pbY);
        fillGrad.addColorStop(0, "#ff0055");
        fillGrad.addColorStop(1, "#ffd700");
        ctx.fillStyle = fillGrad;
        ctx.fillRect(pbX, pbY, pbW * furiaPct, pbH);

        ctx.strokeStyle = "#ff0055";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(pbX, pbY, pbW, pbH);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        const pctDisplay = Math.min(100, Math.floor(furiaPct * 100));
        const actFuriaTxt = typeof __ === "function" ? __("sys_activando_furia", pctDisplay) : `ACTIVANDO MODO FURIA: ${pctDisplay}%`;
        ctx.fillText(actFuriaTxt, actX + actW / 2, pbY + 16);

        ctx.fillStyle = furiaPct >= 1 ? "#00ffcc" : "#ff5588";
        ctx.font = "11px monospace";
        let subMsg = typeof __ === "function" ? __("sys_inyectando_nucleos") : "> Inyectando sobrecarga a núcleos...";
        if (furiaPct >= 1) subMsg = typeof __ === "function" ? __("sys_furia_100") : "✓ ¡MODO FURIA COMPLETADO AL 100%! ✓";
        else if (furiaPct > 0.6) subMsg = typeof __ === "function" ? __("sys_desbloqueando_potencia") : "> Desbloqueando potencia máxima del sistema...";
        else if (furiaPct > 0.3) subMsg = typeof __ === "function" ? __("sys_reconfigurando_patrones") : "> Reconfigurando patrones balísticos...";
        ctx.fillText(subMsg, actX + actW / 2, actY + 175);
    }

    if (cin.phase === "empty_trash" || cin.phase === "finish") {
        ctx.fillStyle = "rgba(127, 29, 29, 0.95)";
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 1.5;
        const toastW = 270, toastH = 46;
        const toastX = deskX + deskW - toastW - 15;
        const toastY = deskY + deskH - toastH - 35;
        ctx.fillRect(toastX, toastY, toastW, toastH);
        ctx.strokeRect(toastX, toastY, toastW, toastH);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "left";
        ctx.fillText(typeof __ === "function" ? __("sys_piedad_eliminada") : "🗑️ C:\\Piedad -> ELIMINADA", toastX + 10, toastY + 18);
        ctx.fillStyle = "#fca5a5";
        ctx.font = "10px monospace";
        ctx.fillText(typeof __ === "function" ? __("sys_cero_piedad") : "⚠️ 0% Piedad restante en el sistema.", toastX + 10, toastY + 34);
    }

    for (const p of cin.particles) {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    }

    drawOSMouseCursor(ctx, cin.cursorX, cin.cursorY, cin.cursorClicking);

    ctx.restore();
    ctx.restore();
}

window.getMawlerknightTargetFloor = function(tb) {
    if (!tb) return 0;
    const mh = tb.maxHealth || 80;
    if (!tb.bonusHp) {
        if (!tb._hudDestroyed) return mh * (70 / 80);
        if (!tb._controlsInverted) return mh * (60 / 80);
        if (tb.phase < 2) return mh * (50 / 80);
        if (!tb.vibeCoding) return mh * (40 / 80);
        if (tb.phase < 3) return mh * (30 / 80);
        if (tb.phase < 4) return mh * (20 / 80);
        if (!tb.askedYesNo) return mh * (10 / 80);
        return 0;
    } else {
        if (tb.phase < 6 && !tb.dodgeMode) {
            if (tb.health > 20) return 20;
            return 10;
        } else if (tb.dodgeMode) {
            if (!tb.cheatFinished) return 5;
            return 0;
        } else {
            return 0;
        }
    }
};

window.applyMawlerknightDamage = function(tb, rawDamage, isTick) {
    if (!tb || tb.state !== "fighting" || !tb.vulnerable || tb.turnPhase !== "player_turn") {
        return 0;
    }

    const curFloor = window.getMawlerknightTargetFloor(tb);
    const floorRemaining = Math.max(0, tb.health - curFloor);
    const turnLimit = tb.dodgeMode ? 5 : 10;
    const turnRemaining = Math.max(0, turnLimit - (tb.turnDamageTaken || 0));

    const maxAllowed = Math.min(floorRemaining, turnRemaining);
    if (maxAllowed <= 0) {
        tb.vulnerable = false;
        return 0;
    }

    const desiredDamage = game.godMode ? maxAllowed : Math.min(rawDamage, maxAllowed);
    let actualDmg = isTick ? desiredDamage : Math.min(desiredDamage, Math.ceil(desiredDamage));

    if (tb.health - actualDmg < curFloor && curFloor > 0) {
        actualDmg = Math.max(0, tb.health - curFloor);
    }
    if (actualDmg <= 0) {
        tb.vulnerable = false;
        return 0;
    }

    tb.health -= actualDmg;
    if (curFloor > 0 && tb.health < curFloor) {
        tb.health = curFloor;
    }
    if (tb.health < 0) tb.health = 0;

    tb.turnDamageTaken = (tb.turnDamageTaken || 0) + actualDmg;
    tb.hitFlash = isTick ? 5 : 8;

    if ((curFloor > 0 && tb.health <= curFloor) || (tb.turnDamageTaken || 0) >= turnLimit) {
        tb.vulnerable = false;
    }

    return actualDmg;
};

window.drawCyberProgressBar = function(ctx, x, y, w, h, progress, opts = {}) {
    progress = Math.max(0, Math.min(1, progress || 0));
    const pct = Math.floor(progress * 100);
    const themeColor = opts.themeColor || "#00ffcc";
    const accentColor = opts.accentColor || "#00f0ff";
    const label = opts.label || "";
    const statusText = opts.statusText || "";
    const showPercent = opts.showPercent !== false;
    const time = typeof Date.now === "function" ? Date.now() / 1000 : 0;

    ctx.save();

    if (opts.withPanel) {
        const pw = opts.panelW || (w + 60);
        const ph = opts.panelH || (h + 84);
        const px = opts.panelX || (x - (pw - w) / 2);
        const py = opts.panelY || (y - 44);

        ctx.fillStyle = "rgba(4, 12, 26, 0.94)";
        ctx.shadowColor = themeColor;
        ctx.shadowBlur = 18;
        ctx.strokeStyle = themeColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
            ctx.roundRect(px, py, pw, ph, 12);
        } else {
            ctx.rect(px, py, pw, ph);
        }
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
        ctx.fillRect(px + 4, py + 4, pw - 8, 28);

        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2.5;
        const brk = 10;
        ctx.beginPath(); ctx.moveTo(px, py + brk); ctx.lineTo(px, py); ctx.lineTo(px + brk, py); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px + pw - brk, py); ctx.lineTo(px + pw, py); ctx.lineTo(px + pw, py + brk); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px, py + ph - brk); ctx.lineTo(px, py + ph); ctx.lineTo(px + brk, py + ph); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px + pw - brk, py + ph); ctx.lineTo(px + pw, py + ph); ctx.lineTo(px + pw, py + ph - brk); ctx.stroke();
    }

    if (label) {
        ctx.font = opts.labelFont || "bold 13px monospace";
        ctx.fillStyle = themeColor;
        ctx.textAlign = "left";
        ctx.shadowColor = themeColor;
        ctx.shadowBlur = 8;
        ctx.fillText(label, x, y - 8);
        ctx.shadowBlur = 0;
    }

    if (showPercent) {
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "right";
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = themeColor;
        ctx.shadowBlur = 6;
        ctx.fillText(`${pct}%`, x + w, y - 8);
        ctx.shadowBlur = 0;
    }

    ctx.fillStyle = "rgba(2, 6, 16, 0.9)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
        ctx.roundRect(x, y, w, h, 6);
    } else {
        ctx.rect(x, y, w, h);
    }
    ctx.fill();
    ctx.stroke();

    const fillW = Math.max(0, w * progress);
    if (fillW > 2) {
        ctx.save();
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
            ctx.roundRect(x, y, w, h, 6);
        } else {
            ctx.rect(x, y, w, h);
        }
        ctx.clip();

        const grad = ctx.createLinearGradient(x, y, x + fillW, y);
        grad.addColorStop(0, themeColor);
        grad.addColorStop(1, accentColor);

        ctx.fillStyle = grad;
        ctx.shadowColor = themeColor;
        ctx.shadowBlur = 12;
        ctx.fillRect(x, y, fillW, h);
        ctx.shadowBlur = 0;

        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.fillRect(x, y, fillW, h * 0.35);

        const sweepPhase = (time * 1.5) % 1;
        const sweepX = x + fillW * sweepPhase;
        const sweepGrad = ctx.createLinearGradient(sweepX - 25, y, sweepX + 25, y);
        sweepGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
        sweepGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.65)");
        sweepGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = sweepGrad;
        ctx.fillRect(sweepX - 25, y, 50, h);

        ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
        ctx.lineWidth = 1.5;
        for (let seg = 1; seg < 10; seg++) {
            const segX = x + (w * seg) / 10;
            if (segX < x + fillW) {
                ctx.beginPath();
                ctx.moveTo(segX, y);
                ctx.lineTo(segX, y + h);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    if (statusText) {
        ctx.font = opts.statusFont || "11px monospace";
        ctx.fillStyle = "rgba(200, 240, 255, 0.85)";
        ctx.textAlign = "left";
        ctx.fillText(statusText, x, y + h + 16);
    }

    ctx.restore();
};

function updateAndDrawTechBoss(ctx, cameraX, time) {
    if (currentLevel !== 1 || !game.techBoss) return;
    const tb = game.techBoss;
    if (tb.state === "defeated") {
        if (tb._deathScreenTimer > 0) {
            tb._deathScreenTimer--;
            const dt = tb._deathScreenTimer;
            ctx.save();
            ctx.fillStyle = "#0a4fd6";
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            if (Math.random() < .3) {
                for (let g = 0; g < 3; g++) {
                    const gy = Math.random() * VIEW_H;
                    ctx.fillStyle = "rgba(255,255,255,0.12)";
                    ctx.fillRect(0, gy, VIEW_W, 3 + Math.random() * 6);
                }
            }
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "left";
            ctx.font = "bold 100px Arial";
            ctx.fillText(__("ui_cara_triste"), 80, 160);
            ctx.font = 'bold 22px "Courier Prime", monospace';
            ctx.fillText(__("bsod_titulo"), 80, 240);
            ctx.font = '16px "Courier Prime", monospace';
            ctx.fillText(__("bsod_error"), 80, 280);
            ctx.fillText(__("bsod_proceso"), 80, 308);
            const pct = Math.min(100, Math.floor((210 - dt) / 210 * 100));
            ctx.fillText(__("bsod_recopilando", pct), 80, 360);
            ctx.fillStyle = "rgba(255,255,255,0.25)";
            ctx.fillRect(80, 375, VIEW_W - 160, 10);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(80, 375, (VIEW_W - 160) * pct / 100, 10);
            const errLines = [ __("bsod_deteniendo1"), __("bsod_deteniendo2"), __("bsod_deteniendo3"), __("bsod_deteniendo4"), __("bsod_deteniendo5"), __("bsod_deteniendo6") ];
            ctx.font = "13px monospace";
            for (let k = 0; k < 3; k++) {
                const idx = (Math.floor(dt / 35) + k) % errLines.length;
                ctx.fillText(errLines[idx], 80, 420 + k * 24);
            }
            ctx.font = "italic 13px monospace";
            ctx.fillText(__("bsod_no_apagues"), 80, VIEW_H - 60);
            ctx.restore();
            if (dt % 35 === 0) {
                createExplosion(tb.x + Math.random() * tb.w, tb.y + Math.random() * tb.h, [ "#00ffaa", "#ff1493", "#ffffff" ][Math.floor(Math.random() * 3)], 25);
                applyShake(8);
                playSound(200 + Math.random() * 300, .25, "sawtooth", .3, 60);
            }
            if (dt <= 0 && !tb._defeatDialogsStarted) {
                tb._defeatDialogsStarted = true;
                applyShake(20);
                showAnimatedDialogue(__("ui_speaker_mawlerknight"), "😎", __("dlg_regalito"), () => {
                    tb.pixelActivate = 0;
                    showAnimatedDialogue(__("ui_speaker_system"), "💻", __("dlg_downgrade"), () => {
                        showAnimatedDialogue(__("ui_speaker_mawlerknight"), "😎", __("dlg_fps_mediocridad"), () => {
                            game.pixelTransitionProgress = 0;
                            playSound(100, .5, "square", .5, 3e3);
                            gsap.to(game, {
                                pixelTransitionProgress: 1,
                                duration: 3,
                                ease: "power2.in",
                                onUpdate: () => {
                                    applyShake(Math.random() * 5);
                                },
                                onComplete: () => {
                                    game.pixelMode = true;
                                    playBGM("bgm_world2_pixel_mode");
                                    addFloatingText(VIEW_W / 2, VIEW_H / 3, __("flt_modo8bit"), "#ff00ff", 30);
                                    setTimeout(() => {
                                        gsap.to(getMessageDiv(), {
                                            scale: 0,
                                            opacity: 0,
                                            duration: .2
                                        });
                                    }, 2e3);
                                    game.player.frozen = true;
                                    if (typeof window.raiseArenaHammers === "function") {
                                        window.raiseArenaHammers(() => {
                                            game.player.frozen = false;
                                        });
                                    } else {
                                        game.player.frozen = false;
                                    }
                                }
                            });
                        }, 3e3);
                    }, 3e3);
                }, 3e3);
            }
            return;
        }
        return;
    }
    const drawX = tb.x - cameraX;
    const drawY = tb.y;
    if (tb.state === "idle" && game.player) {
        const dist = Math.hypot(game.player.x + game.player.w / 2 - (tb.x + tb.w / 2), game.player.y + game.player.h / 2 - (tb.y + tb.h / 2));
        if (dist < 450 || game.player.x >= 14300) {
            game.arenaLocked = true;
            game.arenaMinX = 14200;
            game.arenaMaxX = 15300;
            if (!tb._entranceClosed) {
                tb._entranceClosed = true;
                game.player.frozen = true;
                game.player.vx = 0;
                const bootIt = function() {
                    tb.state = "intro_boot";
                    tb.bootTimer = 0;
                    tb.bootLines = [ __("sys_init_cyber"), __("sys_loading_mawler"), __("sys_system_online"), __("sys_detecting_intruder"), __("sys_target_locked") ];
                    tb.bootLineIdx = 0;
                    tb.bootCharIdx = 0;
                };
                if (typeof window.closeArenaWithHammers === "function") {
                    window.closeArenaWithHammers(function() {
                        delete game.cameraOverrideX;
                        bootIt();
                    });
                } else {
                    bootIt();
                }
            }
        }
    }
    if (tb.state === "idle") {
        return;
    }
    if (tb.state === "intro_boot") {
        tb.bootTimer = (tb.bootTimer || 0) + 1;
        if (tb.bootTimer % 3 === 0) {
            playSound(850 + Math.random() * 300, .03, "square", .08, 100);
        }
        if (tb.bootLineIdx < tb.bootLines.length && tb.bootCharIdx < tb.bootLines[tb.bootLineIdx].length) {
            if (tb.bootTimer % 2 === 0) {
                tb.bootCharIdx++;
            }
        } else if (tb.bootLineIdx < tb.bootLines.length) {
            if (tb.bootTimer > 40) {
                tb.bootLineIdx++;
                tb.bootCharIdx = 0;
                tb.bootTimer = 0;
            }
        } else {
            tb.bootLineIdx = tb.bootLines.length;
            if (!tb._bootDialogShown) {
                tb._bootDialogShown = true;
                tb.state = "presentation";
                tb.targetY = 220;
                tb.y = 220;
                playSound(600, .15, "square", .2, 1200);
                const startFight = () => {
                    tb.state = "fighting";
                    if (typeof window.BossHUD !== "undefined") {
                        window.BossHUD.show(__("boss_name_2") || "MAWLERKNIGHT", tb.health, tb.maxHealth, "#00ffaa");
                    }
                    tb.turnPhase = "player_turn";
                    tb.vulnerable = true;
                    tb.turnDamageTaken = 0;
                    game.player.frozen = false;
                    playBGM("bgm_boss_hacker");
                    showAnimatedDialogue(__("ui_speaker_system") || "SISTEMA", "💻", __("dlg_tu_turno") || "TU TURNO: ¡DISPARA!", null, 3e3);
                };
                const msgGuerrero = __("dlg_guerrero") || "¡Aquí viene un guerrero a enfrentarse a Mawlerknight! ¿Quién ganará?";
                showAnimatedDialogue(__("ui_speaker_mawlerknight") || "Mawlerknight", "😎", msgGuerrero, () => {
                    if (typeof playBGM === "function") {
                        playBGM("bgm_boss_hacker");
                    }
                    if (typeof window.playBossPresentation === "function") {
                        window.playBossPresentation({
                            name: "boss_name_2",
                            title: "boss_title_2",
                            icon: "⚡",
                            themeColor: "#00ffaa",
                            accentColor: "#00f0ff",
                            targetX: tb.x + tb.w / 2,
                            targetY: tb.y + tb.h / 2,
                            zoom: 1.45,
                            duration: 3.2
                        }, startFight);
                    } else {
                        startFight();
                    }
                }, 3e3);
                return;
            }
        }
        ctx.save();
        const termW = 540;
        const termH = 320;
        const termX = VIEW_W / 2 - termW / 2;
        const termY = 70;
        ctx.fillStyle = "rgba(2, 10, 20, 0.95)";
        ctx.fillRect(termX, termY, termW, termH);
        ctx.strokeStyle = "#00ffaa";
        ctx.lineWidth = 3;
        ctx.strokeRect(termX, termY, termW, termH);
        ctx.fillStyle = "#00ffaa";
        ctx.font = "bold 15px monospace";
        ctx.textAlign = "left";

        const maxDisplayLines = Math.min(tb.bootLineIdx, tb.bootLines.length);
        for (let i = 0; i < maxDisplayLines; i++) {
            if (tb.bootLines[i]) {
                ctx.fillText(tb.bootLines[i], termX + 26, termY + 40 + i * 30);
            }
        }
        if (tb.bootLineIdx < tb.bootLines.length && tb.bootLines[tb.bootLineIdx]) {
            const txt = tb.bootLines[tb.bootLineIdx].substring(0, tb.bootCharIdx) + (tb.bootTimer % 20 < 10 ? "█" : "");
            ctx.fillText(txt, termX + 26, termY + 40 + tb.bootLineIdx * 30);
        }

        const totalLines = Math.max(1, tb.bootLines.length);
        let bootProgress = 1.0;
        if (tb.bootLineIdx < totalLines) {
            const curLineChars = Math.max(1, (tb.bootLines[tb.bootLineIdx] || "").length);
            bootProgress = Math.min(1, (tb.bootLineIdx + (tb.bootCharIdx / curLineChars)) / totalLines);
        }

        window.drawCyberProgressBar(ctx, termX + 26, termY + 235, termW - 52, 18, bootProgress, {
            themeColor: "#00ffaa",
            accentColor: "#00f0ff",
            label: typeof __ === "function" ? __("sys_progreso_arranque") : "PROGRESO DE ARRANQUE // SECUENCIA DE INICIO",
            showPercent: true
        });
        ctx.restore();
        return;
    }
    if (tb.state === "presentation") {
        const targetY = tb.targetY || 220;
        tb.y += (targetY - tb.y) * 0.08;
    }
    if (tb.state === "fighting") {
        if (typeof window.BossHUD !== "undefined") {
            const hudColor = tb.bonusHp ? "#ffd700" : tb.dodgeMode ? "#ff0055" : "#00ffaa";
            window.BossHUD.update(tb.health, tb.maxHealth, hudColor);
        }
        const targetY = tb.vulnerable ? 380 : 90;
        tb.y += (targetY - tb.y) * .1;
        if (tb.turnPhase === "vibe_sequence") {
            tb.vulnerable = false;
            game.player.frozen = true;
            tb.vibeTimer++;
            if (tb.vibeStep === 1 && tb.vibeTimer === 1) {
                showAnimatedDialogue(__("ui_speaker_mawlerknight"), "😎", __("dlg_ia_ayudantes"), () => {}, 3e3);
            }
            if (tb.vibeStep === 1 && tb.vibeTimer > 150) {
                playSound(900, .3, "sine", .25);
                addFloatingText(VIEW_W / 2, VIEW_H / 2 + 60, __("flt_enemigos_generados"), "#00ffcc", 20);
                tb.vibeStep = 2;
                tb.vibeTimer = 0;
            }
            if (tb.vibeStep === 2 && tb.vibeTimer > 40) {
                tb.vibeStep = 3;
                tb.vibeTimer = 0;
                tb.vibeTerminal = false;
                const px = game.player.x;
                if (!game.techTanks) game.techTanks = [];
                const spawnX1 = px < 14740 ? Math.min(15180, Math.max(14950, px + 520)) : Math.max(14280, Math.min(14530, px - 520));
                const dir1 = spawnX1 > px ? -1 : 1;
                const t1 = {
                    x: spawnX1,
                    y: 454,
                    w: 70,
                    h: 46,
                    scale: 1,
                    isGiantTank: false,
                    state: "hostile",
                    animTimer: 0,
                    shootTimer: 25,
                    shootCooldown: 85,
                    showChoice: false,
                    health: 90,
                    maxHealth: 90,
                    vx: dir1 * 1.3,
                    dir: dir1,
                    minX: 14220,
                    maxX: 15260,
                    wheelAngle: 0,
                    cannonAngle: dir1 < 0 ? Math.PI : 0,
                    recoil: 0,
                    destroyTimer: 0
                };
                tb.vibeEnemies = [ t1 ];
                game.techTanks.push(t1);
                createExplosion(t1.x + t1.w / 2, t1.y + t1.h / 2, "#00ffcc", 20);
                playSound(500, .4, "sawtooth", .35, 200);
                addFloatingText(VIEW_W / 2, VIEW_H / 2 + 60, __("flt_enemigos_generados"), "#00ffcc", 20);
                game.player.frozen = false;
                tb.turnPhase = "vibe_wait_tank_1";
                tb.vibeTimer = 0;
            }
        }
        if (tb.turnPhase === "vibe_wait_tank_1") {
            game.player.frozen = false;
            tb.vulnerable = false;
            const t1 = tb.vibeEnemies && tb.vibeEnemies[0];
            if (t1 && (t1.health <= 0 || t1.state === "dead" || t1.state === "destroying" || t1.state === "gone")) {
                t1.state = "gone";
                if (game.techTanks) {
                    game.techTanks = game.techTanks.filter(t => t !== t1 && t.state !== "gone");
                }
                tb.turnPhase = "vibe_mid_dialog";
                tb.vibeTimer = 0;
                game.player.frozen = true;
                if (typeof enemyProjectiles !== "undefined") {
                    enemyProjectiles.length = 0;
                }
                showAnimatedDialogue(__("ui_speaker_mawlerknight"), "😮", __("dlg_tank1_destruido"), () => {
                    showAnimatedDialogue(__("ui_speaker_mawlerknight"), "😈", __("dlg_mas_grandes"), () => {
                        const px = game.player.x;
                        const spawnX2 = px < 14740 ? Math.min(15140, Math.max(14900, px + 520)) : Math.max(14260, Math.min(14500, px - 520));
                        const dir2 = spawnX2 > px ? -1 : 1;
                        const t2 = {
                            x: spawnX2,
                            y: 408,
                            w: 140,
                            h: 92,
                            scale: 2,
                            isGiantTank: true,
                            state: "hostile",
                            animTimer: 0,
                            shootTimer: 35,
                            shootCooldown: 130,
                            showChoice: false,
                            health: 160,
                            maxHealth: 160,
                            vx: dir2 * 1.1,
                            dir: dir2,
                            minX: 14220,
                            maxX: 15260,
                            wheelAngle: 0,
                            cannonAngle: dir2 < 0 ? Math.PI : 0,
                            recoil: 0,
                            destroyTimer: 0
                        };
                        createExplosion(t2.x + t2.w / 2, t2.y + t2.h / 2, "#ff007f", 30);
                        playSound(500, .4, "sawtooth", .35, 200);
                        addFloatingText(VIEW_W / 2, VIEW_H / 2 + 60, __("flt_enemigos_amplificados"), "#ff00aa", 20);
                        tb.vibeEnemies = [ t2 ];
                        if (!game.techTanks) game.techTanks = [];
                        game.techTanks.push(t2);
                        game.player.frozen = false;
                        tb.turnPhase = "vibe_wait_minions";
                        tb.vibeTimer = 0;
                    }, 2600);
                }, 2800);
            }
        }
        if (tb.turnPhase === "vibe_wait_minions") {
            game.player.frozen = false;
            tb.vulnerable = false;
            if (!tb._vibeDeliveryShown && (!tb.vibeEnemies || tb.vibeEnemies.every(e => e.health <= 0 || e.state === "dead" || e.state === "destroying" || e.state === "gone"))) {
                tb._vibeDeliveryShown = true;
                tb.turnDamageTaken = 0;
                tb.vulnerable = true;
                tb.turnPhase = "player_turn";
                if (game.techTanks) {
                    for (let t of game.techTanks) {
                        t.state = "gone";
                    }
                    game.techTanks.length = 0;
                }
                addFloatingText(VIEW_W / 2, VIEW_H / 2 + 60, __("flt_entrega_completada"), "#00ffcc", 18);
            }
        }
        if (tb.turnPhase === "player_turn") {
            tb.vulnerable = true;
            if (tb._dashPendingDmg) {
                const d = tb._dashPendingDmg;
                tb._dashPendingDmg = 0;
                const actual = typeof window.applyMawlerknightDamage === "function" ? window.applyMawlerknightDamage(tb, d) : Math.min(d, tb.health);
                if (actual > 0) {
                    addFloatingText(tb.x + tb.w / 2, tb.y - 14, "-" + actual, "#ff00e0", 20);
                    playSound(700, .15, "square", .25, 300);
                    try {
                        applyShake(5);
                    } catch (e) {}
                    try {
                        createExplosion(tb.x + tb.w / 2, tb.y + tb.h / 2, "#00ffaa", 22, 12, [ "#00ffaa", "#ffffff" ]);
                    } catch (e) {}
                }
            }
            const curFloor = typeof window.getMawlerknightTargetFloor === "function" ? window.getMawlerknightTargetFloor(tb) : 0;
            const turnLimit = tb.dodgeMode ? 5 : 10;
            if ((tb.turnDamageTaken || 0) >= turnLimit || (curFloor > 0 && tb.health <= curFloor) || tb.health <= 0) {
                tb.attackTimer = 0;
                game.player.frozen = true;
                tb.vulnerable = false;
                if (tb.health <= tb.maxHealth * (70 / 80) && !tb._hudDestroyed) {
                    tb.turnPhase = "dialog_boss_turn";
                    tb._hudDestroyed = true;
                    const barraMsg = __("dlg_barra_vida") || "Mmm... esa barra de vida tuya no la necesitas, ¿no? Hagamos un cambio en la interfaz.";
                    showAnimatedDialogue(__("ui_speaker_mawlerknight") || "Mawlerknight", "😎", barraMsg, () => {
                        tb._codeRain = 60;
                        tb._codeRainActive = true;
                        tb._transformCallback = () => {
                            game.hideHealthBar = true;
                            const bx0 = VIEW_W - 200, by0 = 15;
                            for (let k = 0; k < 45; k++) {
                                particles.push({
                                    x: bx0 + Math.random() * 180,
                                    y: by0 + Math.random() * 30,
                                    vx: (Math.random() - .5) * 7,
                                    vy: -Math.random() * 6 - 1,
                                    life: 60,
                                    color: [ "#ffd700", "#ffffff", "#ff69b4" ][Math.floor(Math.random() * 3)],
                                    size: 4 + Math.random() * 4,
                                    type: "spark"
                                });
                            }
                            playSound(1100, .35, "sine", .3, 2200);
                            applyShake(6);
                            addFloatingText(14750, 160, __("flt_hud_destruido") || "HUD DESTRUIDO", "#ff1493", 26);
                            for (let k = enemyProjectiles.length - 1; k >= 0; k--) {
                                if (enemyProjectiles[k].tbShot) enemyProjectiles.splice(k, 1);
                            }
                            tb.turnDamageTaken = 0;
                            game.player.frozen = false;
                            tb.turnPhase = "boss_turn";
                            tb.attackTimer = 0;
                        };
                    }, 2500);
                } else if (tb.health <= tb.maxHealth * (60 / 80) && !tb._controlsInverted) {
                    tb.turnPhase = "dialog_boss_turn";
                    tb._controlsInverted = true;
                    const invertMsg = __("dlg_invertir_controles") || "¿Y si invertimos tus controles?";
                    showAnimatedDialogue(__("ui_speaker_mawlerknight") || "Mawlerknight", "😎", invertMsg, () => {
                        tb._codeRain = 60;
                        tb._codeRainActive = true;
                        tb._transformCallback = () => {
                            game.invertControls = true;
                            keys["ArrowLeft"] = keys["ArrowRight"] = keys["x"] = keys[" "] = false;
                            addFloatingText(14750, 160, __("flt_controles_invertidos") || "CONTROLES INVERTIDOS", "#00ffcc", 26);
                            playSound(600, .3, "square", .3, 150);
                            const diverMsg = __("dlg_mas_divertido") || "¿Ahora es más divertido, no? ¡JAJAJA!";
                            showAnimatedDialogue(__("ui_speaker_mawlerknight") || "Mawlerknight", "😈", diverMsg, () => {
                                for (let k = enemyProjectiles.length - 1; k >= 0; k--) {
                                    if (enemyProjectiles[k].tbShot) enemyProjectiles.splice(k, 1);
                                }
                                tb.turnDamageTaken = 0;
                                game.player.frozen = false;
                                tb.turnPhase = "boss_turn";
                                tb.attackTimer = 0;
                            }, 2500);
                        };
                    }, 2500);
                } else if (tb.health <= tb.maxHealth * (50 / 80) && tb.phase < 2) {
                    tb.phase = 2;
                    tb.bulletCount = 10;
                    transformPhase(__("dlg_alteremos_sistema"), () => {
                        game.player.frozen = true;
                        showAnimatedDialogue(__("ui_speaker_mawlerknight"), "😎", __("dlg_editemos_estadisticas"), () => {
                            for (let k = enemyProjectiles.length - 1; k >= 0; k--) {
                                if (enemyProjectiles[k].tbShot) enemyProjectiles.splice(k, 1);
                            }
                            tb.turnDamageTaken = 0;
                            tb.bulletCount = 10;
                            game.player.frozen = false;
                            tb.turnPhase = "boss_turn";
                            tb.attackTimer = 0;
                        }, 2500);
                    });
                } else if (tb.health <= tb.maxHealth * (40 / 80) && !tb.vibeCoding && tb.phase >= 2) {
                    tb.vibeCoding = true;
                    tb.turnPhase = "vibe_sequence";
                    tb.vibeStep = 0;
                    tb.vibeTimer = 0;
                    tb.vibeEnemies = null;
                    tb.vibeTerminal = false;
                    tb._vibeDeliveryShown = false;
                    tb.vulnerable = false;
                    game.player.frozen = true;
                    const msgVibe = __("dlg_vibe_codear") || "¡¡HORA DE VIBE CODEAR!!";
                    showAnimatedDialogue(__("ui_speaker_mawlerknight") || "Mawlerknight", "😎", msgVibe, () => {
                        tb.vibeTerminal = true;
                        tb.vibeStep = 1;
                        tb.vibeTimer = 0;
                    }, 2500);
                } else if (tb.health <= tb.maxHealth * (30 / 80) && tb.phase < 3 && !tb.bonusHp) {
                    tb.phase = 3;
                    tb.bulletCount = 18;
                    tb.growScale = 1.6;
                    tb.turnPhase = "phase_dialog";
                    tb.vulnerable = false;
                    game.player.frozen = true;
                    const msgColoso = __("dlg_si_fuera_mas_grande") || "Mmm... ¿y si fuera más grande?";
                    showAnimatedDialogue(__("ui_speaker_mawlerknight") || "Mawlerknight", "😎", msgColoso, () => {
                        startMawlerGrowthCinematic(tb, () => {
                            for (let k = enemyProjectiles.length - 1; k >= 0; k--) {
                                if (enemyProjectiles[k].tbShot) enemyProjectiles.splice(k, 1);
                            }
                            tb.turnDamageTaken = 0;
                            game.player.frozen = false;
                            tb.turnPhase = "boss_turn";
                            tb.attackTimer = 0;
                        });
                    }, 2500);
                } else if (tb.health <= tb.maxHealth * (20 / 80) && tb.phase < 4 && !tb.bonusHp) {
                    tb.phase = 4;
                    tb.bulletCount = 20;
                    tb.turnPhase = "dialog_boss_turn";
                    const msgTurno = __("dlg_mi_turno") || "Mawlerknight: ¡Mi turno!";
                    showAnimatedDialogue(__("ui_speaker_mawlerknight") || "Mawlerknight", "😎", msgTurno, () => {
                        for (let k = enemyProjectiles.length - 1; k >= 0; k--) {
                            if (enemyProjectiles[k].tbShot) enemyProjectiles.splice(k, 1);
                        }
                        tb.turnDamageTaken = 0;
                        game.player.frozen = false;
                        tb.turnPhase = "boss_turn";
                        tb.attackTimer = 0;
                    }, 2500);
                } else if (tb.health <= tb.maxHealth * (10 / 80) && !tb.askedYesNo && !tb.bonusHp) {
                    tb.askedYesNo = true;
                    tb.showChoice = false;
                    tb.turnPhase = "choice_dialog";
                    tb.vulnerable = false;
                    game.player.frozen = true;
                    if (btnSi) btnSi.blur();
                    if (btnNo) btnNo.blur();
                    startProtectionDesktopCinematic(tb);
                } else if (tb.health <= tb.maxHealth * (10 / 80) && tb.bonusHp && tb.phase < 6 && !tb.dodgeMode) {
                    tb.dodgeMode = true;
                    tb.phase = 6;
                    tb.bulletCount = 22;
                    tb.missCount = 0;
                    transformPhase(typeof __ === "function" ? __("dlg_alteremos_archivos") : "¡AHORA ALTEREMOS LOS ARCHIVOS DEL JUEGO PARA CAMBIAR LA JUGABILIDAD!", () => {
                        tb.floatingCannons = [
                            { id: "left", x: tb.x - 70, y: tb.y + 35, angle: 0, lockedAngle: 0, state: "idle", timer: 0 },
                            { id: "right", x: tb.x + tb.w + 70, y: tb.y + 35, angle: 0, lockedAngle: 0, state: "idle", timer: 0 }
                        ];
                        for (let k = enemyProjectiles.length - 1; k >= 0; k--) {
                            if (enemyProjectiles[k].tbShot) enemyProjectiles.splice(k, 1);
                        }
                        tb.turnDamageTaken = 0;
                        game.player.frozen = false;
                        tb.turnPhase = "boss_turn";
                        tb.attackTimer = 0;
                    });
                } else if (tb.health <= 5 && tb.dodgeMode && !tb.cheatSequenceStarted) {
                    tb.cheatSequenceStarted = true;
                    tb.cheatStep = 1;
                    tb.turnPhase = "dialog_boss_turn";
                    game.player.frozen = true;
                    showAnimatedDialogue(__("ui_speaker_mawlerknight") || "Mawlerknight", "😡", typeof __ === "function" ? __("dlg_mawler_trampa") : "¡¡NOOOOOOOOOOO!! ¡¡SI DEBO HACER TRAMPA PARA GANAR LO HARÉEEEE!!", () => {
                        for (let k = enemyProjectiles.length - 1; k >= 0; k--) {
                            if (enemyProjectiles[k].tbShot) enemyProjectiles.splice(k, 1);
                        }
                        tb.turnDamageTaken = 0;
                        game.player.frozen = false;
                        tb.turnPhase = "boss_turn";
                        tb.attackTimer = 0;
                    }, 2500);
                } else if (tb.health <= 0) {
                } else {
                    tb.turnPhase = "dialog_boss_turn";
                    const msgTurno2 = __("dlg_mi_turno") || "Mawlerknight: ¡Mi turno!";
                    showAnimatedDialogue(__("ui_speaker_mawlerknight") || "Mawlerknight", "😎", msgTurno2, () => {
                        for (let k = enemyProjectiles.length - 1; k >= 0; k--) {
                            if (enemyProjectiles[k].tbShot) enemyProjectiles.splice(k, 1);
                        }
                        tb.turnDamageTaken = 0;
                        game.player.frozen = false;
                        tb.turnPhase = "boss_turn";
                        tb.attackTimer = 0;
                    }, 2500);
                }
            }
        }
        if (tb.turnPhase === "boss_turn") {
            tb.vulnerable = false;
            tb.attackTimer++;

            const hasCannons = tb.floatingCannons && tb.floatingCannons.length > 0;
            const totalShots = tb.cannonShotsPerTurn || 2;
            const aimLen = 30;
            const chargeLen = 48;
            const fireLen = 22;
            const repoLen = 16;
            const cycleLen = aimLen + chargeLen + fireLen + repoLen;

            if (hasCannons) {
                const cannonT = tb.attackTimer - 5;
                if (cannonT >= 0 && cannonT < totalShots * cycleLen) {
                    const cycleT = cannonT % cycleLen;
                    if (cycleT === 0) {
                        for (let c of tb.floatingCannons) {
                            c.state = "aiming";
                            c.chargeTimer = 0;
                            c.fireTimer = 0;
                        }
                    } else if (cycleT === aimLen) {
                        for (let c of tb.floatingCannons) {
                            c.state = "charging";
                            c.lockedAngle = c.angle;
                            c.chargeTimer = 0;
                        }
                        playSound(350, 0.8, "sawtooth", 0.35, 800);
                    } else if (cycleT > aimLen && cycleT < aimLen + chargeLen) {
                        for (let c of tb.floatingCannons) c.chargeTimer = (c.chargeTimer || 0) + 1;
                        if ((cycleT - aimLen) % 9 === 0) {
                            playSound(380 + (cycleT - aimLen) * 9, 0.05, "sawtooth", 0.18);
                        }
                    } else if (cycleT === aimLen + chargeLen) {
                        for (let c of tb.floatingCannons) {
                            c.state = "firing";
                            c.fireTimer = 0;
                        }
                        try {
                            if (typeof playSFX === "function") playSFX("sfx_max_charge_shot");
                        } catch (e) {}
                        playSound(860, 0.25, "sawtooth", 0.35, 1320);
                        playSound(150, 0.35, "sawtooth", 0.45, 50);
                        applyShake(8);
                    } else if (cycleT > aimLen + chargeLen && cycleT < aimLen + chargeLen + fireLen) {
                        for (let c of tb.floatingCannons) c.fireTimer = (c.fireTimer || 0) + 1;
                    } else if (cycleT === aimLen + chargeLen + fireLen) {
                        for (let c of tb.floatingCannons) c.state = "repositioning";
                    }
                } else if (cannonT >= totalShots * cycleLen) {
                    for (let c of tb.floatingCannons) c.state = "idle";
                }
            }

            if (tb.attackTimer % (window.postGameHorror ? 55 : 80) === 25) {
                const count = (tb.bulletCount || 5) + (window.postGameHorror ? 3 : 0);
                const speed = (tb.phase >= 2 ? 5.5 : 4.5) * (window.postGameHorror ? 1.45 : 1);
                const px = game.player.x + game.player.w / 2;
                const py = game.player.y + game.player.h / 2;
                const originX = tb.x + tb.w / 2;
                const originY = tb.y + tb.h / 2;
                const baseAngle = Math.atan2(py - originY, px - originX);
                const spreadAngle = count >= 8 ? .28 : .35;
                for (let i = 0; i < count; i++) {
                    const offset = (i - (count - 1) / 2) * (spreadAngle / Math.max(1, count - 1));
                    const finalAngle = baseAngle + offset;
                    enemyProjectiles.push({
                        x: originX,
                        y: originY,
                        w: 16,
                        h: 16,
                        radius: 8,
                        vx: Math.cos(finalAngle) * speed,
                        vy: Math.sin(finalAngle) * speed,
                        color: tb.phase >= 5 ? "#ffd700" : tb.phase >= 2 ? "#ff00aa" : "#00ffaa",
                        isGiant: false,
                        damage: 12,
                        tbShot: true
                    });
                }
                playSound(320, .2, "square", .3, 180);
            }

            const maxAttackTime = hasCannons ? (5 + totalShots * cycleLen + 20) : 95;
            if (tb.attackTimer > maxAttackTime) {
                tb.turnPhase = "boss_turn_wait";
                tb.waitTimer = 0;
            }
        }
        if (tb.turnPhase === "boss_turn_wait") {
            tb.vulnerable = false;
            game.player.frozen = false;
            tb.waitTimer++;
            const bossBulletsLeft = enemyProjectiles.some(p => p.tbShot);
            if (!bossBulletsLeft || tb.waitTimer > 120) {
                for (let k = enemyProjectiles.length - 1; k >= 0; k--) {
                    if (enemyProjectiles[k].tbShot) enemyProjectiles.splice(k, 1);
                }
                tb.turnDamageTaken = 0;
                tb.hasTakenDodgeDmg = false;
                tb.missCount = 0;

                if (tb.floatingCannons && tb.floatingCannons.length > 0) {
                    tb.cannonShotsPerTurn = (tb.cannonShotsPerTurn || 2) + 1;
                }

                if (tb.cheatSequenceStarted && !tb.cheatFinished) {
                    if (tb.cheatStep === 1) {
                        tb.cheatStep = 2;
                        tb.turnPhase = "dialog_boss_turn";
                        game.player.frozen = true;
                        showAnimatedDialogue(__("ui_speaker_mawlerknight") || "Mawlerknight", "😈", typeof __ === "function" ? __("dlg_mi_turno_otra_vez") : "¡¡MI TURNO OTRA VEZ!!", () => {
                            for (let k = enemyProjectiles.length - 1; k >= 0; k--) {
                                if (enemyProjectiles[k].tbShot) enemyProjectiles.splice(k, 1);
                            }
                            tb.turnDamageTaken = 0;
                            tb.turnPhase = "boss_turn";
                            tb.attackTimer = 0;
                            game.player.frozen = false;
                        }, 1800);
                        return;
                    } else if (tb.cheatStep === 2) {
                        tb.cheatStep = 3;
                        tb.turnPhase = "dialog_boss_turn";
                        game.player.frozen = true;
                        showAnimatedDialogue(__("ui_speaker_mawlerknight") || "Mawlerknight", "😈", typeof __ === "function" ? __("dlg_otra_vez") : "¡¡OTRA VEZ!!", () => {
                            for (let k = enemyProjectiles.length - 1; k >= 0; k--) {
                                if (enemyProjectiles[k].tbShot) enemyProjectiles.splice(k, 1);
                            }
                            tb.turnDamageTaken = 0;
                            tb.turnPhase = "boss_turn";
                            tb.attackTimer = 0;
                            game.player.frozen = false;
                        }, 1800);
                        return;
                    } else if (tb.cheatStep === 3) {
                        tb.cheatStep = 4;
                        tb.cheatFinished = true;
                        tb.turnPhase = "dialog_boss_turn";
                        game.player.frozen = true;
                        showAnimatedDialogue(__("ui_speaker_mawlerknight") || "Mawlerknight", "😈", typeof __ === "function" ? __("dlg_aqui_mando_yo") : "¡¡AQUÍ MANDO YO!!", () => {
                            for (let k = enemyProjectiles.length - 1; k >= 0; k--) {
                                if (enemyProjectiles[k].tbShot) enemyProjectiles.splice(k, 1);
                            }
                            tb.turnDamageTaken = 0;
                            tb.vulnerable = true;
                            tb.turnPhase = "player_turn";
                            game.player.frozen = false;
                            const tuTurnoTxt = typeof __ === "function" ? __("flt_golpe_final") : "⚡ TU TURNO: ¡DALE EL GOLPE FINAL! ⚡";
                            addFloatingText(14750, 180, tuTurnoTxt, "#00ffcc", 26);
                            playSound(800, .2, "sine", .25, 1200);
                        }, 2000);
                        return;
                    }
                }

                if (window.postGameHorror && (!tb.cheatSequenceStarted || tb.cheatFinished)) {
                    tb.horrorExtraTurns = tb.horrorExtraTurns || 0;
                    if (tb.horrorExtraTurns < 2) {
                        tb.horrorExtraTurns++;
                        tb.turnDamageTaken = 0;
                        tb.turnPhase = "boss_turn";
                        tb.attackTimer = 0;
                        const extraTurnTxt = typeof __ === "function" ? __("flt_turno_extra_mawler", tb.horrorExtraTurns) : `😈 ¡TURNO EXTRA DE MAWLERKNIGHT (${tb.horrorExtraTurns}/2)! 😈`;
                        addFloatingText(14750, 180, extraTurnTxt, "#ff0055", 22);
                        playSound(160, .3, "sawtooth", .3, 60);
                        return;
                    }
                    tb.horrorExtraTurns = 0;
                }

                tb.vulnerable = true;
                game.player.frozen = false;
                tb.turnPhase = "player_turn";
                const tuTurnoTxt = (typeof __ === "function" && __("dlg_tu_turno")) || "⚡ TU TURNO: ¡DISPARA! ⚡";
                addFloatingText(14750, 180, tuTurnoTxt, "#00ffcc", 24);
                playSound(800, .15, "sine", .2, 1200);
            }
        }
        function transformPhase(dialogText, callback) {
            tb.turnPhase = "phase_dialog";
            tb.vulnerable = false;
            tb._codeRain = 0;
            tb._codeRainActive = false;
            game.player.frozen = true;
            const safeTxt = dialogText || "¡ALTERANDO EL SISTEMA!";
            showAnimatedDialogue(__("ui_speaker_mawlerknight") || "Mawlerknight", "😎", safeTxt, () => {
                tb._codeRain = 60;
                tb._codeRainActive = true;
                tb._transformCallback = callback;
            }, 2500);
        }
        function startMawlerGrowthCinematic(tb, callback) {
            tb.turnPhase = "growth_cinematic";
            tb.vulnerable = false;
            game.player.frozen = true;
            tb._growthTimer = 180;
            tb._growthDuration = 180;
            tb._growthStartW = tb.w || 100;
            tb._growthTargetW = 160;
            tb._growthStartH = tb.h || 100;
            tb._growthTargetH = 160;
            tb._growthCallback = callback;
            tb._morphFlash = 35;
            playSound(130, 0.4, "sawtooth", 0.5, 40);
        }
        if (tb.health <= 0) {
            const finishTb = function() {
                tb.state = "defeated";
                tb.defeatTimer = 30;
                if (typeof window.triggerHappyMoment === "function") window.triggerHappyMoment();
                if (typeof window.BossHUD !== "undefined") window.BossHUD.hide();
                game.player.frozen = true;
                game.arenaLocked = false;
                game.hideHealthBar = false;
                game.invertControls = false;
                keys["ArrowLeft"] = keys["ArrowRight"] = keys["x"] = keys[" "] = false;
                stopAllSFX();
                tb._deathScreenTimer = 210;
            };
            finishTb();
        tb._defeatDialogsStarted = false;
        return;
        }
        if (tb.turnPhase === "growth_cinematic") {
            tb._growthTimer--;
            const progress = Math.min(1, Math.max(0, 1 - (tb._growthTimer / tb._growthDuration)));
            const easeP = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            tb.w = tb._growthStartW + (tb._growthTargetW - tb._growthStartW) * easeP;
            tb.h = tb._growthStartH + (tb._growthTargetH - tb._growthStartH) * easeP;
            tb.growScale = tb.w / 100;

            const arenaCenterX = 14750;
            tb.x += (arenaCenterX - tb.w / 2 - tb.x) * 0.08;
            tb.y += (180 - tb.y) * 0.08;

            if (tb._growthTimer % 14 === 0) {
                applyShake(Math.round(2 + progress * 7));
            }

            if (tb._growthTimer === 150) {
                playSound(280, 0.35, "sawtooth", 0.45, 600);
                addFloatingText(tb.x + tb.w / 2, tb.y - 24, typeof __ === "function" ? __("sys_sellos_hidraulicos") : "DESBLOQUEANDO SELLOS HIDRÁULICOS...", "#00f0ff", 22);
            } else if (tb._growthTimer === 105) {
                playSound(160, 0.45, "triangle", 0.55, 70);
                addFloatingText(tb.x + tb.w / 2, tb.y - 24, typeof __ === "function" ? __("sys_blindaje_titanio") : "EXPANDIENDO BLINDAJE DE TITANIO // 160%", "#ff00aa", 24);
                createExplosion(tb.x + tb.w * 0.2, tb.y + tb.h * 0.5, "#ff00aa", 35, 20);
                createExplosion(tb.x + tb.w * 0.8, tb.y + tb.h * 0.5, "#ff00aa", 35, 20);
            } else if (tb._growthTimer === 55) {
                playSound(420, 0.55, "sawtooth", 0.65, 1200);
                addFloatingText(tb.x + tb.w / 2, tb.y - 24, typeof __ === "function" ? __("sys_hiper_reactor") : "HIPER-REACTOR EN SOBRECARGA // POTENCIA MÁXIMA", "#ffd700", 26);
                createExplosion(tb.x + tb.w / 2, tb.y + tb.h * 0.6, "#ffd700", 45, 30);
            }

            if (Math.random() < 0.65) {
                particles.push({
                    x: tb.x + Math.random() * tb.w,
                    y: tb.y + Math.random() * tb.h,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8 - 1,
                    life: 15,
                    color: Math.random() < 0.5 ? "#00ffcc" : (Math.random() < 0.5 ? "#ff00aa" : "#ffd700"),
                    size: 3 + Math.random() * 3,
                    type: "spark"
                });
            }

            const growthProgress = Math.max(0, Math.min(1, 1 - (tb._growthTimer / (tb._growthDuration || 180))));
            window.drawCyberProgressBar(ctx, VIEW_W / 2 - 210, 50, 420, 20, growthProgress, {
                withPanel: true,
                panelW: 480,
                panelH: 90,
                themeColor: "#ffd700",
                accentColor: "#ff00aa",
                label: typeof __ === "function" ? __("sys_coloso_label") : "SOBRECARGA DEL HIPER-REACTOR // MODO COLOSO",
                statusText: growthProgress >= 0.9 ? (typeof __ === "function" ? __("sys_coloso_max_power") : "> ¡MÁXIMA POTENCIA DESTRUCTORA ALCANZADA!") : (typeof __ === "function" ? __("sys_coloso_charging") : "> CANALIZANDO ENERGÍA AL NÚCLEO CENTRAL..."),
                showPercent: true
            });

            if (tb._growthTimer <= 0) {
                tb.w = tb._growthTargetW;
                tb.h = tb._growthTargetH;
                tb.growScale = 1.6;
                createExplosion(tb.x + tb.w / 2, tb.y + tb.h / 2, "#00ffcc", 90, 70);
                createExplosion(tb.x + tb.w / 2, tb.y + tb.h / 2, "#ff00aa", 80, 50);
                createExplosion(tb.x + tb.w / 2, tb.y + tb.h / 2, "#ffd700", 70, 40);
                playSound(90, 0.8, "sawtooth", 0.8, 30);
                applyShake(24);
                addFloatingText(tb.x + tb.w / 2, tb.y - 35, typeof __ === "function" ? __("sys_coloso_activado") : "¡¡¡MAWLERKNIGHT COLOSO ACTIVADO!!!", "#ffd700", 30);
                if (tb._growthCallback) {
                    tb._growthCallback();
                } else {
                    game.player.frozen = false;
                    tb.turnPhase = "boss_turn";
                    tb.attackTimer = 0;
                }
            }
        }
        if (tb._codeRainActive) {
            if (tb._codeRain <= 0) {
                tb._codeRainActive = false;
                tb._codeRainMax = 0;
                tb.glowTimer = 60;
                playSound(650, .4, "sawtooth", .5, 300);
                if (tb._transformCallback) {
                    const cb = tb._transformCallback;
                    tb._transformCallback = null;
                    try { cb(); } catch (e) { console.error(e); }
                }
                return;
            }
            tb._codeRain--;
            if (!tb._codeRainMax || tb._codeRain > tb._codeRainMax) {
                tb._codeRainMax = Math.max(60, tb._codeRain);
            }
            ctx.save();
            ctx.fillStyle = "rgba(2, 8, 20, 0.92)";
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);

            ctx.font = "12px monospace";
            ctx.fillStyle = "rgba(0, 255, 170, 0.45)";
            for (let c = 0; c < 35; c++) {
                const cx = 20 + c * 34;
                const cy = (tb._codeRain * 4 + c * 45) % (VIEW_H + 80) - 40;
                ctx.fillText(String.fromCharCode(12448 + c * 7 % 60), cx, cy);
            }

            const maxRain = tb._codeRainMax || 60;
            const progress = Math.max(0, Math.min(1, 1 - (tb._codeRain / maxRain)));
            const themeCol = tb.phase >= 5 ? "#ffd700" : (tb.phase >= 2 ? "#ff00aa" : "#00ffcc");
            const accentCol = tb.phase >= 5 ? "#ff0055" : (tb.phase >= 2 ? "#00ffff" : "#38bdf8");

            let status = (typeof __ === "function" && __("sys_reconfig_1")) || "> [1/4] INICIALIZANDO COMPILACIÓN DE SISTEMA...";
            if (progress >= 0.85) {
                status = (typeof __ === "function" && __("sys_reconfig_4")) || "> [4/4] ¡RECONFIGURACIÓN COMPLETADA AL 100%!";
            } else if (progress >= 0.55) {
                status = (typeof __ === "function" && __("sys_reconfig_3")) || "> [3/4] ELEVANDO FRECUENCIA DEL OVERCLOCK...";
            } else if (progress >= 0.25) {
                status = (typeof __ === "function" && __("sys_reconfig_2")) || "> [2/4] APLICANDO MODIFICACIONES DE COMBATE...";
            }

            window.drawCyberProgressBar(ctx, VIEW_W / 2 - 240, VIEW_H / 2 - 10, 480, 26, progress, {
                withPanel: true,
                panelW: 550,
                panelH: 140,
                themeColor: themeCol,
                accentColor: accentCol,
                label: (typeof __ === "function" && __("sys_rewriting")) || "⚡ REESCRIBIENDO ARQUITECTURA DEL SISTEMA ⚡",
                statusText: status,
                showPercent: true
            });

            ctx.restore();
            if (tb._codeRain <= 0) {
                tb._codeRainActive = false;
                tb._codeRainMax = 0;
                tb.glowTimer = 60;
                playSound(650, .4, "sawtooth", .5, 300);
                if (tb._transformCallback) {
                    const cb = tb._transformCallback;
                    tb._transformCallback = null;
                    try { cb(); } catch (e) { console.error(e); }
                }
            }
            return;
        }
    }
    const arenaCenterX = 14750;
    const arenaScreenCenter = arenaCenterX - cameraX;
    if (arenaScreenCenter > -VIEW_W && arenaScreenCenter < VIEW_W * 2) {
        ctx.save();
        const gridFloorY = 480;
        ctx.strokeStyle = "rgba(0, 255, 204, 0.18)";
        ctx.lineWidth = 1;
        for (let gx = -VIEW_W; gx <= VIEW_W * 2; gx += 60) {
            const screenGX = gx - cameraX * .4 % 60;
            ctx.beginPath();
            ctx.moveTo(screenGX, gridFloorY);
            ctx.lineTo(screenGX * 1.3 - VIEW_W * .15, VIEW_H);
            ctx.stroke();
        }
        for (let gy = gridFloorY; gy <= VIEW_H; gy += 15) {
            ctx.beginPath();
            ctx.moveTo(0, gy);
            ctx.lineTo(VIEW_W, gy);
            ctx.stroke();
        }
        ctx.font = "10px monospace";
        const glyphs = [ "0", "1", "0x8F", "ACK", "SYN", "0xFF", "{ }", "< >", "CPU", "DATA" ];
        const seed = Math.floor(time * 8);
        for (let col = 0; col < 22; col++) {
            const colX = col * 48 + col * 17 % 31 - cameraX * .2 % (VIEW_W + 100);
            if (colX < -50 || colX > VIEW_W + 50) continue;
            const colSpeed = 1.2 + col % 4 * .6;
            const dropY = (time * 60 * colSpeed + col * 73) % (VIEW_H + 120) - 40;
            ctx.fillStyle = col % 2 === 0 ? "#ffffff" : "#00ffff";
            ctx.fillText(glyphs[(col + seed) % glyphs.length], colX, dropY);
            for (let trail = 1; trail <= 4; trail++) {
                const trailY = dropY - trail * 14;
                if (trailY > 0 && trailY < VIEW_H) {
                    ctx.fillStyle = `rgba(0, 255, 170, ${.45 - trail * .09})`;
                    ctx.fillText(glyphs[(col + seed + trail) % glyphs.length], colX, trailY);
                }
            }
        }
        ctx.restore();
    }
    if (tb.state === "fighting") {
        ctx.save();
        const term1W = 340, term1H = 165;
        const term1X = 14420 - cameraX;
        const term1Y = 24;
        if (term1X + term1W > -100 && term1X < VIEW_W + 100) {
            ctx.fillStyle = "#080d1a";
            ctx.strokeStyle = tb.phase >= 5 ? "#ff00ff" : tb.vulnerable ? "#00ffaa" : "#00f0ff";
            ctx.lineWidth = 3;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.roundRect(term1X, term1Y, term1W, term1H, 8);
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#101c33";
            ctx.fillRect(term1X + 2, term1Y + 2, term1W - 4, 24);
            ctx.fillStyle = "#00f0ff";
            ctx.font = "bold 11px monospace";
            ctx.textAlign = "left";
            ctx.fillText("💻 KERNEL v9.4 // MAWLERKNIGHT.SYS", term1X + 8, term1Y + 17);
            ctx.fillStyle = "#22c55e";
            ctx.beginPath();
            ctx.arc(term1X + term1W - 40, term1Y + 14, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#eab308";
            ctx.beginPath();
            ctx.arc(term1X + term1W - 26, term1Y + 14, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ef4444";
            ctx.beginPath();
            ctx.arc(term1X + term1W - 12, term1Y + 14, 4, 0, Math.PI * 2);
            ctx.fill();
            const scr1X = term1X + 8, scr1Y = term1Y + 30, scr1W = term1W - 16, scr1H = term1H - 38;
            ctx.fillStyle = "#020914";
            ctx.fillRect(scr1X, scr1Y, scr1W, scr1H);
            ctx.fillStyle = "rgba(0, 240, 255, 0.04)";
            for (let l = 0; l < scr1H; l += 3) {
                ctx.fillRect(scr1X, scr1Y + l, scr1W, 1.5);
            }
            ctx.font = "10px monospace";
            ctx.fillStyle = tb.phase >= 5 ? "#ff00ff" : "#00ffaa";
            const hpBars = Math.max(0, Math.floor(tb.health / 10));
            const hpBarStr = "[" + "█".repeat(hpBars) + "░".repeat(Math.max(0, 10 - hpBars)) + "]";
            ctx.fillText(`▶ INTEGRITY: ${hpBarStr} ${Math.ceil(tb.health)} HP`, scr1X + 8, scr1Y + 16);
            ctx.fillText(`▶ FIREWALL : ${tb.vulnerable ? "🔴 COMPROMISED [VULNERABLE]" : "🟢 SHIELD_ACTIVE [LOCK]"}`, scr1X + 8, scr1Y + 32);
            ctx.fillText(`▶ SYS_PHASE: PHASE ${tb.phase}/6 | OC: ${tb.phase >= 5 ? "MAX_OVERCLOCK" : "STABLE"}`, scr1X + 8, scr1Y + 48);
            ctx.fillText(`▶ THREAD   : ${tb.turnPhase === "player_turn" ? "EVASION_SUBROUTINE" : tb.turnPhase === "boss_turn" ? "OFFENSIVE_EXPLOIT" : "NEURAL_THINKING"}`, scr1X + 8, scr1Y + 64);
            ctx.strokeStyle = tb.vulnerable ? "#00ffaa" : "#00f0ff";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let ox = 0; ox < scr1W - 16; ox += 4) {
                const waveY = scr1Y + scr1H - 14 + Math.sin(time * .25 + ox * .12) * 7 * (tb.turnPhase === "boss_turn" ? 1.5 : .8);
                if (ox === 0) ctx.moveTo(scr1X + 8 + ox, waveY); else ctx.lineTo(scr1X + 8 + ox, waveY);
            }
            ctx.stroke();
        }
        const term2W = 340, term2H = 165;
        const term2X = 14880 - cameraX;
        const term2Y = 24;
        if (term2X + term2W > -100 && term2X < VIEW_W + 100 && game.player) {
            ctx.fillStyle = "#080d1a";
            ctx.strokeStyle = game.invertControls ? "#ff007f" : "#38bdf8";
            ctx.lineWidth = 3;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.roundRect(term2X, term2Y, term2W, term2H, 8);
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#101c33";
            ctx.fillRect(term2X + 2, term2Y + 2, term2W - 4, 24);
            ctx.fillStyle = "#38bdf8";
            ctx.font = "bold 11px monospace";
            ctx.textAlign = "left";
            ctx.fillText("🎯 TARGET MONITOR // PEGGY.EXE", term2X + 8, term2Y + 17);
            const scr2X = term2X + 8, scr2Y = term2Y + 30, scr2W = term2W - 16, scr2H = term2H - 38;
            ctx.fillStyle = "#020914";
            ctx.fillRect(scr2X, scr2Y, scr2W, scr2H);
            ctx.fillStyle = "rgba(56, 189, 248, 0.04)";
            for (let l = 0; l < scr2H; l += 3) {
                ctx.fillRect(scr2X, scr2Y + l, scr2W, 1.5);
            }
            const p = game.player;
            ctx.font = "10px monospace";
            ctx.fillStyle = game.invertControls ? "#ff007f" : "#38bdf8";
            ctx.fillText(`▶ POSITION : X=${Math.floor(p.x)}  Y=${Math.floor(p.y)}`, scr2X + 8, scr2Y + 16);
            ctx.fillText(`▶ VELOCITY : VX=${(p.vx || 0).toFixed(1)}  VY=${(p.vy || 0).toFixed(1)}`, scr2X + 8, scr2Y + 32);
            ctx.fillText(`▶ HACK_CTRL: ${game.invertControls ? "⚠️ INVERTED [ACTIVE]" : "🟢 NORMAL [BYPASS]"}`, scr2X + 8, scr2Y + 48);
            ctx.fillText(`▶ MATRIX   : ${tb.dodgeMode ? "⚡ DODGE_MATRIX_ENABLED" : "⚪ IDLE_TRACKING"}`, scr2X + 8, scr2Y + 64);
            const retX = scr2X + scr2W - 35, retY = scr2Y + scr2H - 24;
            const retR = 14;
            ctx.strokeStyle = game.invertControls ? "#ff007f" : "#38bdf8";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(retX, retY, retR, time * .1, time * .1 + Math.PI * 1.5);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(retX, retY, retR * .5, -time * .15, -time * .15 + Math.PI);
            ctx.stroke();
            ctx.fillStyle = game.invertControls ? "#ff007f" : "#38bdf8";
            ctx.fillRect(retX - 1.5, retY - 1.5, 3, 3);
        }
        ctx.restore();
    }
    ctx.save();
    const bossDrawX = drawX;
    const bossDrawY = drawY;
    const scaledW = tb.w;
    const scaledH = tb.h;
    const cx = bossDrawX + scaledW / 2;
    const cy = bossDrawY + scaledH / 2;
    const isColossus = tb.phase >= 3 || scaledW > 115 || tb.turnPhase === "growth_cinematic";
    const mainColor = window.postGameHorror ? "#dc2626" : tb.phase >= 5 ? "#ffd700" : tb.phase >= 2 ? "#ff00aa" : "#00f0ff";
    const isHit = tb.hitFlash && tb.hitFlash > 0;
    if (isHit) tb.hitFlash--;

    if (tb.turnPhase === "growth_cinematic") {
        ctx.save();
        const progress = Math.min(1, Math.max(0, 1 - (tb._growthTimer / tb._growthDuration)));
        const retR = scaledW * 0.95 + Math.sin(time * 0.2) * 10;
        
        ctx.strokeStyle = "rgba(0, 255, 204, 0.45)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, retR, time * 0.1, time * 0.1 + Math.PI * 1.6);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 0, 170, 0.55)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, retR * 0.75, -time * 0.15, -time * 0.15 + Math.PI * 1.4);
        ctx.stroke();

        for (let a = 0; a < 6; a++) {
            const radAng = a * (Math.PI / 3) + time * 0.05;
            ctx.strokeStyle = "rgba(0, 240, 255, 0.35)";
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(radAng) * (retR * 0.5), cy + Math.sin(radAng) * (retR * 0.5));
            ctx.lineTo(cx + Math.cos(radAng) * (retR * 1.15), cy + Math.sin(radAng) * (retR * 1.15));
            ctx.stroke();
        }

        for (let l = 0; l < 4; l++) {
            const lAng = Math.random() * Math.PI * 2;
            const lDist = scaledW * 0.4 + Math.random() * (scaledW * 0.5);
            ctx.strokeStyle = Math.random() < 0.5 ? "#ffffff" : (Math.random() < 0.5 ? "#00ffcc" : "#ff00aa");
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(lAng) * (lDist * 0.5) + (Math.random() - 0.5) * 20, cy + Math.sin(lAng) * (lDist * 0.5) + (Math.random() - 0.5) * 20);
            ctx.lineTo(cx + Math.cos(lAng) * lDist, cy + Math.sin(lAng) * lDist);
            ctx.stroke();
        }

        const barW = 200, barH = 12;
        const barX = cx - barW / 2, barY = bossDrawY - 45;
        ctx.fillStyle = "rgba(5, 10, 25, 0.9)";
        ctx.strokeStyle = "#00ffcc";
        ctx.lineWidth = 1.5;
        ctx.fillRect(barX, barY, barW, barH);
        ctx.strokeRect(barX, barY, barW, barH);

        const fillW = (barW - 4) * progress;
        const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        barGrad.addColorStop(0, "#00ffcc");
        barGrad.addColorStop(0.5, "#ff00aa");
        barGrad.addColorStop(1, "#ffd700");
        ctx.fillStyle = barGrad;
        ctx.fillRect(barX + 2, barY + 2, fillW, barH - 4);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`⚡ OVERCLOCK RE-ENGINEERING: ${Math.floor(progress * 100)}% // T-${(tb._growthTimer / 60).toFixed(1)}s`, cx, barY - 8);
        ctx.restore();
    }

    ctx.font = "bold 9px monospace";
    ctx.fillStyle = window.postGameHorror ? "#7f1d1d" : mainColor;
    const glyphsOrb = window.postGameHorror ? [ "DIE", "0x00", "VOID", "DEAD", "NULL", "666" ] : [ "0x7F", "0xFF", "ACK", "0x1A", "SYN", "0x9C" ];
    for (let g = 0; g < 4; g++) {
        const gAng = time * .04 + g * (Math.PI / 2);
        const gx = cx + Math.cos(gAng) * (scaledW * .98);
        const gy = cy + Math.sin(gAng) * (scaledH * .82) - 10;
        ctx.globalAlpha = .55 + .35 * Math.sin(time * .1 + g);
        ctx.fillText(glyphsOrb[(g + Math.floor(time * .1)) % glyphsOrb.length], gx - 12, gy);
    }
    ctx.globalAlpha = 1;

    if (isColossus) {
        ctx.fillStyle = "#090d16";
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 2;
        ctx.fillRect(bossDrawX + 16, bossDrawY - 18, 14, 24);
        ctx.strokeRect(bossDrawX + 16, bossDrawY - 18, 14, 24);
        ctx.fillRect(bossDrawX + scaledW - 30, bossDrawY - 18, 14, 24);
        ctx.strokeRect(bossDrawX + scaledW - 30, bossDrawY - 18, 14, 24);

        for (let st = 0; st < 2; st++) {
            const sx = st === 0 ? bossDrawX + 23 : bossDrawX + scaledW - 23;
            const sRingR = 4 + (time * 15 + st * 10) % 18;
            const sAlpha = Math.max(0, 1 - sRingR / 22);
            ctx.strokeStyle = mainColor;
            ctx.globalAlpha = sAlpha * 0.6;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(sx, bossDrawY - 20 - sRingR * 1.2, sRingR, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }

    const shoulderW = isColossus ? Math.max(40, scaledW * 0.28) : 28;
    const shoulderH = isColossus ? Math.max(62, scaledH * 0.44) : 44;
    const leftShX = bossDrawX - (isColossus ? shoulderW * 0.72 : 18);
    const leftShY = bossDrawY + (isColossus ? 22 : 18);
    const rightShX = bossDrawX + scaledW - (isColossus ? shoulderW * 0.28 : 10);
    const rightShY = leftShY;

    if (tb.phase >= 2 || window.postGameHorror) {
        ctx.save();
        if (window.postGameHorror) {
            ctx.strokeStyle = "#ff0033";
            ctx.lineWidth = 2.5;
            ctx.fillStyle = "rgba(127, 29, 29, 0.45)";
            const wingSpread = (isColossus ? 55 : 40) + Math.sin(time * 0.2) * 8;
            ctx.beginPath();
            ctx.moveTo(leftShX, leftShY + 10);
            ctx.lineTo(leftShX - wingSpread, leftShY - (isColossus ? 48 : 32));
            ctx.lineTo(leftShX - wingSpread * 0.6, leftShY - 5);
            ctx.lineTo(leftShX - wingSpread * 0.85, leftShY + 20);
            ctx.lineTo(leftShX - 10, leftShY + (isColossus ? 35 : 22));
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#ff1744";
            for (let sp = 1; sp <= 4; sp++) {
                const spX = leftShX - (wingSpread * 0.25 * sp);
                const spY = leftShY - 10 - sp * 6;
                ctx.fillRect(spX, spY, 3, 3);
            }

            ctx.beginPath();
            ctx.moveTo(rightShX + shoulderW, rightShY + 10);
            ctx.lineTo(rightShX + shoulderW + wingSpread, rightShY - (isColossus ? 48 : 32));
            ctx.lineTo(rightShX + shoulderW + wingSpread * 0.6, rightShY - 5);
            ctx.lineTo(rightShX + shoulderW + wingSpread * 0.85, rightShY + 20);
            ctx.lineTo(rightShX + shoulderW + 10, rightShY + (isColossus ? 35 : 22));
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            for (let sp = 1; sp <= 4; sp++) {
                const spX = rightShX + shoulderW + (wingSpread * 0.25 * sp);
                const spY = rightShY - 10 - sp * 6;
                ctx.fillRect(spX, spY, 3, 3);
            }
        } else {
            ctx.strokeStyle = mainColor;
            ctx.lineWidth = 2;
            ctx.fillStyle = tb.phase >= 5 ? "rgba(255, 215, 0, 0.2)" : "rgba(255, 0, 170, 0.2)";
            ctx.beginPath();
            ctx.moveTo(leftShX, leftShY + 10);
            ctx.lineTo(leftShX - (isColossus ? 42 : 28), leftShY - (isColossus ? 34 : 22));
            ctx.lineTo(leftShX - (isColossus ? 28 : 18), leftShY + (isColossus ? 28 : 18));
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(rightShX + shoulderW, rightShY + 10);
            ctx.lineTo(rightShX + shoulderW + (isColossus ? 42 : 28), rightShY - (isColossus ? 34 : 22));
            ctx.lineTo(rightShX + shoulderW + (isColossus ? 28 : 18), rightShY + (isColossus ? 28 : 18));
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();
    }

    ctx.fillStyle = isHit ? "#ffffff" : window.postGameHorror ? "#07070a" : "#0f172a";
    ctx.strokeStyle = window.postGameHorror ? "#7f1d1d" : mainColor;
    ctx.lineWidth = isColossus ? 3.5 : 2.5;
    ctx.beginPath();
    ctx.moveTo(leftShX, leftShY);
    ctx.lineTo(leftShX + shoulderW, leftShY - 10);
    ctx.lineTo(leftShX + shoulderW, leftShY + shoulderH);
    ctx.lineTo(leftShX - 8, leftShY + shoulderH - 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rightShX, rightShY - 10);
    ctx.lineTo(rightShX + shoulderW, rightShY);
    ctx.lineTo(rightShX + shoulderW + 8, rightShY + shoulderH - 12);
    ctx.lineTo(rightShX, rightShY + shoulderH);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (isColossus) {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(leftShX + 6, leftShY + 12, shoulderW - 14, 22);
        ctx.fillRect(rightShX + 8, rightShY + 12, shoulderW - 14, 22);

        ctx.fillStyle = "#ff0033";
        for (let m = 0; m < 3; m++) {
            ctx.beginPath();
            ctx.arc(leftShX + 12 + m * 8, leftShY + 23, 2.5, 0, Math.PI * 2);
            ctx.arc(rightShX + 14 + m * 8, rightShY + 23, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(leftShX + shoulderW - 4, leftShY + shoulderH * 0.4, 6, 14);
        ctx.fillRect(rightShX - 2, rightShY + shoulderH * 0.4, 6, 14);
    }

    if (tb.phase >= 2 && Math.random() < .35) {
        particles.push({
            x: Math.random() < .5 ? leftShX : rightShX + shoulderW,
            y: leftShY + Math.random() * shoulderH,
            vx: (Math.random() - .5) * 4,
            vy: -Math.random() * 4 - 1,
            life: 14,
            color: mainColor,
            size: 2.5,
            type: "spark"
        });
    }

    ctx.fillStyle = isHit ? "#ffffff" : window.postGameHorror ? "#050508" : "#0a0f1d";
    ctx.strokeStyle = tb.vulnerable ? "#00ffaa" : window.postGameHorror ? "#990000" : mainColor;
    ctx.lineWidth = isColossus ? 4.5 : 3.5;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = tb.vulnerable ? 25 : window.postGameHorror ? 10 : 16;
    ctx.beginPath();
    ctx.moveTo(bossDrawX + 18, bossDrawY);
    ctx.lineTo(bossDrawX + scaledW - 18, bossDrawY);
    ctx.lineTo(bossDrawX + scaledW, bossDrawY + 22);
    ctx.lineTo(bossDrawX + scaledW, bossDrawY + scaledH - 20);
    ctx.lineTo(bossDrawX + scaledW - 22, bossDrawY + scaledH);
    ctx.lineTo(bossDrawX + 22, bossDrawY + scaledH);
    ctx.lineTo(bossDrawX, bossDrawY + scaledH - 20);
    ctx.lineTo(bossDrawX, bossDrawY + 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    if (isColossus) {
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.fillRect(bossDrawX + 14, cy - 8, scaledW - 28, scaledH * 0.28);
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bossDrawX + 14, cy - 8, scaledW - 28, scaledH * 0.28);

        ctx.fillStyle = tb.phase >= 5 ? "#ffd700" : "#ff00aa";
        for (let ch = bossDrawX + 24; ch < bossDrawX + scaledW - 24; ch += 24) {
            ctx.beginPath();
            ctx.moveTo(ch, cy - 4);
            ctx.lineTo(ch + 8, cy + 8);
            ctx.lineTo(ch, cy + 20);
            ctx.lineTo(ch + 6, cy + 20);
            ctx.lineTo(ch + 14, cy + 8);
            ctx.lineTo(ch + 6, cy - 4);
            ctx.closePath();
            ctx.fill();
        }
    }

    if (tb.phase >= 2) {
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(bossDrawX + 16, bossDrawY + 36);
        ctx.lineTo(bossDrawX + 34, bossDrawY + 36);
        ctx.lineTo(bossDrawX + 44, bossDrawY + 54);
        ctx.lineTo(bossDrawX + 44, bossDrawY + scaledH - 35);
        ctx.moveTo(bossDrawX + scaledW - 16, bossDrawY + 36);
        ctx.lineTo(bossDrawX + scaledW - 34, bossDrawY + 36);
        ctx.lineTo(bossDrawX + scaledW - 44, bossDrawY + 54);
        ctx.lineTo(bossDrawX + scaledW - 44, bossDrawY + scaledH - 35);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(bossDrawX + 44, bossDrawY + 54, 2, 0, Math.PI * 2);
        ctx.arc(bossDrawX + scaledW - 44, bossDrawY + 54, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.strokeStyle = window.postGameHorror ? "rgba(220, 38, 38, 0.4)" : "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bossDrawX + 14, bossDrawY + 14);
    ctx.lineTo(bossDrawX + 32, bossDrawY + 14);
    ctx.moveTo(bossDrawX + scaledW - 32, bossDrawY + 14);
    ctx.lineTo(bossDrawX + scaledW - 14, bossDrawY + 14);
    ctx.stroke();

    const reactorY = cy + (isColossus ? 22 : 16);
    const reactorR = isColossus ? Math.max(30, scaledW * 0.22) : 24;

    ctx.save();
    ctx.translate(cx, reactorY);
    ctx.rotate(time * .05);
    ctx.strokeStyle = window.postGameHorror ? "#7f1d1d" : mainColor;
    ctx.lineWidth = isColossus ? 3 : 2;
    ctx.beginPath();
    ctx.arc(0, 0, reactorR, 0, Math.PI * 1.5);
    ctx.stroke();
    ctx.fillStyle = window.postGameHorror ? "#990000" : "#ffffff";
    ctx.fillRect(reactorR - 4, -2, 8, 4);
    ctx.fillRect(-reactorR - 4, -2, 8, 4);
    ctx.restore();

    ctx.save();
    ctx.translate(cx, reactorY);
    ctx.rotate(-time * .08);
    ctx.strokeStyle = window.postGameHorror ? "#ff0000" : "#ffffff";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, reactorR * .7, 0, Math.PI * 1.3);
    ctx.stroke();
    ctx.restore();

    if (isColossus) {
        ctx.save();
        ctx.translate(cx, reactorY);
        ctx.rotate(time * .14);
        ctx.strokeStyle = tb.phase >= 5 ? "#ffffff" : "#ffd700";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, reactorR * 0.45, 0, Math.PI * 1.7);
        ctx.stroke();
        ctx.restore();
    }

    const coreGlow = ctx.createRadialGradient(cx, reactorY, 2, cx, reactorY, reactorR * .65);
    if (window.postGameHorror) {
        coreGlow.addColorStop(0, "#7f1d1d");
        coreGlow.addColorStop(.4, "#1c0505");
        coreGlow.addColorStop(1, "rgba(0,0,0,0)");
    } else {
        coreGlow.addColorStop(0, "#ffffff");
        coreGlow.addColorStop(.35, mainColor);
        coreGlow.addColorStop(1, "rgba(0,0,0,0)");
    }
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(cx, reactorY, reactorR * .65, 0, Math.PI * 2);
    ctx.fill();

    if (tb.phase >= 2) {
        ctx.fillStyle = "#0f172a";
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx - 24, bossDrawY + 2);
        ctx.lineTo(cx - 36, bossDrawY - (isColossus ? 26 : 18));
        ctx.lineTo(cx - 16, bossDrawY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 24, bossDrawY + 2);
        ctx.lineTo(cx + 36, bossDrawY - (isColossus ? 26 : 18));
        ctx.lineTo(cx + 16, bossDrawY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    if (tb.phase >= 5) {
        ctx.save();
        ctx.translate(cx, bossDrawY - 32);
        ctx.rotate(time * 0.06);
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, scaledW * 0.45, 12, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        for (let hg = 0; hg < 6; hg++) {
            const hAng = hg * (Math.PI / 3);
            ctx.beginPath();
            ctx.arc(Math.cos(hAng) * (scaledW * 0.45), Math.sin(hAng) * 12, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    const visorW = scaledW * .78, visorH = isColossus ? 34 : 28;
    const visorX = cx - visorW / 2, visorY = bossDrawY + (isColossus ? 26 : 22);

    if (window.postGameHorror) {
        ctx.fillStyle = "#020104";
        ctx.strokeStyle = "#ff0033";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(visorX - 3, visorY - 3, visorW + 6, visorH + 8, [ 8, 8, 4, 4 ]);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "rgba(255, 0, 50, 0.08)";
        for (let sl = visorY; sl < visorY + visorH + 4; sl += 4) {
            ctx.fillRect(visorX - 2, sl, visorW + 4, 1.5);
        }

        const skullAlpha = 0.6 + Math.sin(time * 0.15) * 0.35;
        ctx.save();
        ctx.strokeStyle = `rgba(255, 0, 55, ${skullAlpha})`;
        ctx.lineWidth = 1.6;
        ctx.strokeRect(cx - 14, visorY + 3, 28, 16);
        ctx.strokeRect(cx - 9, visorY + 19, 18, 9);
        let targetAngle = 0;
        if (game.player) {
            targetAngle = Math.atan2(game.player.y - (tb.y + 35), game.player.x - tb.x);
        }
        const eyeOffX = Math.cos(targetAngle) * 2.5;
        const eyeOffY = Math.sin(targetAngle) * 1.5;
        ctx.fillStyle = "#ff1744";
        ctx.fillRect(cx - 10 + eyeOffX, visorY + 7 + eyeOffY, 6, 6);
        ctx.fillRect(cx + 4 + eyeOffX, visorY + 7 + eyeOffY, 6, 6);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(cx - 8 + eyeOffX, visorY + 9 + eyeOffY, 2, 2);
        ctx.fillRect(cx + 6 + eyeOffX, visorY + 9 + eyeOffY, 2, 2);

        ctx.fillStyle = "#ff0033";
        for (let dt = -6; dt <= 6; dt += 4) {
            ctx.fillRect(cx + dt - 1, visorY + 20, 2, 4);
        }
        ctx.restore();

        if (tb.state === "fighting" && game.player) {
            ctx.strokeStyle = "rgba(255, 0, 0, 0.6)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, visorY + 12);
            ctx.lineTo(game.player.x + game.player.w / 2 - cameraX, game.player.y + game.player.h / 2);
            ctx.stroke();
        }
    } else {
        ctx.fillStyle = "#030712";
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = isColossus ? 3 : 2;
        ctx.beginPath();
        ctx.roundRect(visorX, visorY, visorW, visorH, 6);
        ctx.fill();
        ctx.stroke();

        const vGrad = ctx.createLinearGradient(visorX, visorY, visorX + visorW, visorY + visorH);
        vGrad.addColorStop(0, "rgba(0, 240, 255, 0.85)");
        vGrad.addColorStop(.5, "rgba(255, 0, 170, 0.85)");
        vGrad.addColorStop(1, "rgba(0, 255, 170, 0.85)");
        ctx.fillStyle = vGrad;
        ctx.fillRect(visorX + 4, visorY + 3, visorW - 8, visorH - 6);

        let targetAngle = 0;
        if (game.player) {
            targetAngle = Math.atan2(game.player.y - (tb.y + 35), game.player.x - tb.x);
        }
        const eyeOffsetX = Math.cos(targetAngle) * (isColossus ? 12 : 8);
        const eyeOffsetY = Math.sin(targetAngle) * (isColossus ? 4.5 : 3);

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx + eyeOffsetX, visorY + visorH / 2 + eyeOffsetY, isColossus ? 7.5 : 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ff0033";
        ctx.beginPath();
        ctx.arc(cx + eyeOffsetX, visorY + visorH / 2 + eyeOffsetY, isColossus ? 3.8 : 2.8, 0, Math.PI * 2);
        ctx.fill();

        if (isColossus) {
            ctx.fillStyle = "#00ffcc";
            ctx.beginPath();
            ctx.arc(cx - eyeOffsetX * 0.7, visorY + visorH / 2 - eyeOffsetY * 0.5, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        if (tb.state === "fighting" && game.player) {
            ctx.strokeStyle = "rgba(255, 0, 50, 0.28)";
            ctx.lineWidth = isColossus ? 1.8 : 1;
            ctx.beginPath();
            ctx.moveTo(cx + eyeOffsetX, visorY + visorH / 2 + eyeOffsetY);
            ctx.lineTo(game.player.x + game.player.w / 2 - cameraX, game.player.y + game.player.h / 2);
            ctx.stroke();
        }
    }

    const mouthY = bossDrawY + scaledH - (isColossus ? 26 : 22);
    const mouthW = scaledW * .5;
    const mouthX = cx - mouthW / 2;
    ctx.fillStyle = "#020617";
    ctx.fillRect(mouthX, mouthY, mouthW, isColossus ? 14 : 10);
    ctx.fillStyle = tb.vulnerable ? "#00ffaa" : window.postGameHorror ? "#dc2626" : mainColor;
    const barCount = isColossus ? 12 : 8;
    for (let b = 0; b < barCount; b++) {
        const barH = 2 + Math.sin(time * .28 + b * .9) * (isColossus ? 6 : 4);
        ctx.fillRect(mouthX + 3 + b * (mouthW / barCount), mouthY + (isColossus ? 7 : 5) - barH / 2, isColossus ? 4.5 : 4, barH);
    }

    const orbCount = isColossus ? 6 : 4;
    for (let k = 0; k < orbCount; k++) {
        const angle = time * .05 + k * (Math.PI * 2 / orbCount);
        const orbX = cx + Math.cos(angle) * (scaledW * .82);
        const orbY = cy + Math.sin(angle) * (scaledH * .68);
        ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(orbX, orbY);
        ctx.stroke();

        ctx.fillStyle = "#0f172a";
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(orbX, orbY, isColossus ? 8 : 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.arc(orbX, orbY, isColossus ? 3.5 : 2.5, 0, Math.PI * 2);
        ctx.fill();

        if (tb.phase >= 2 && game.player) {
            const pX = game.player.x + game.player.w / 2 - cameraX;
            const pY = game.player.y + game.player.h / 2;
            const bAng = Math.atan2(pY - orbY, pX - orbX);
            ctx.strokeStyle = "rgba(255, 0, 170, 0.35)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(orbX, orbY);
            ctx.lineTo(orbX + Math.cos(bAng) * 45, orbY + Math.sin(bAng) * 45);
            ctx.stroke();
        }
    }

    if (isColossus) {
        ctx.save();
        const swordAng = time * 0.04;
        const swordX = cx + Math.cos(swordAng) * (scaledW * 1.05);
        const swordY = cy + Math.sin(swordAng) * (scaledH * 0.75);
        ctx.translate(swordX, swordY);
        ctx.rotate(swordAng + Math.PI / 4);

        ctx.fillStyle = "rgba(0, 240, 255, 0.65)";
        ctx.shadowColor = mainColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, -28);
        ctx.lineTo(8, 12);
        ctx.lineTo(0, 20);
        ctx.lineTo(-8, 12);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
    }

    if (!tb.vulnerable && tb.state === "fighting") {
        ctx.strokeStyle = "rgba(0, 240, 255, 0.75)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy, scaledW * .88, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();

    updateAndDrawFloatingCannons(ctx, tb, cameraX, time);

    if (tb.vibeTerminal) {
        ctx.save();
        const vtW = 540, vtH = 340;
        const vtX = VIEW_W / 2 - vtW / 2;
        const vtY = VIEW_H / 2 - vtH / 2;
        ctx.fillStyle = "rgba(5, 10, 20, 0.97)";
        ctx.strokeStyle = "#00ffcc";
        ctx.lineWidth = 4;
        ctx.shadowColor = "#00ffcc";
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.roundRect(vtX, vtY, vtW, vtH, 12);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#0a2030";
        ctx.fillRect(vtX + 2, vtY + 2, vtW - 4, 30);
        ctx.fillStyle = "#00ffcc";
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "left";
        ctx.fillText(__("neuronika_terminal"), vtX + 14, vtY + 22);
        ctx.fillStyle = "#ff5f56";
        ctx.beginPath();
        ctx.arc(vtX + vtW - 20, vtY + 17, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.textAlign = "center";
        ctx.font = "bold 26px monospace";
        ctx.fillStyle = "#00ffcc";
        ctx.shadowColor = "#00ffcc";
        ctx.shadowBlur = 15;
        ctx.fillText(__("neuronika_titulo"), VIEW_W / 2, vtY + 68);
        ctx.shadowBlur = 0;
        ctx.font = "italic 12px monospace";
        ctx.fillStyle = "#5eead4";
        ctx.fillText(__("neuronika_sub"), VIEW_W / 2, vtY + 96);
        
        ctx.strokeStyle = "rgba(0, 255, 204, 0.25)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(vtX + 24, vtY + 110);
        ctx.lineTo(vtX + vtW - 24, vtY + 110);
        ctx.stroke();

        let vibeProgress = 0;
        let vibeLabel = "";
        let vibeStatus = "";
        if (tb.vibeStep === 1) {
            vibeProgress = Math.min(1, (tb.vibeTimer || 0) / 150);
            vibeLabel = (typeof __ === "function" && __("sys_neural_gen_title")) || "GENERACIÓN NEURAL DE ENTIDADES // MODELO v2.4";
            vibeStatus = vibeProgress >= 0.95 
                ? ((typeof __ === "function" && __("sys_compilacion_finalizada")) || "> COMPILACIÓN FINALIZADA. INSTANCIANDO...") 
                : ((typeof __ === "function" && __("sys_entrenando_red")) || "> ENTRENANDO RED NEURONAL EN TIEMPO REAL...");
        } else if (tb.vibeStep === 2 || tb.vibeStep === 3) {
            vibeProgress = Math.min(1, (tb.vibeTimer || 0) / 40);
            vibeLabel = (typeof __ === "function" && __("sys_amplificacion_potencia")) || "AMPLIFICACIÓN DE POTENCIA // INYECCIÓN GIGANTE";
            vibeStatus = (typeof __ === "function" && __("sys_inyectando_mult")) || "> INYECTANDO MULTIPLICADOR DE ESCALA Y AGRESIVIDAD...";
        } else if (tb.vibeStep === 4) {
            vibeProgress = Math.min(1, ((tb.vibeTimer || 0) / 1.3) / 100);
            vibeLabel = (typeof __ === "function" && __("sys_parcheo_critico")) || "PARCHEO CRÍTICO DE SISTEMA // RECONEXIÓN";
            vibeStatus = (typeof __ === "function" && __("sys_desactivando_escudo")) || "> DESACTIVANDO ESCUDO DE EVASIÓN Y RESTAURANDO VULNERABILIDAD...";
        }

        window.drawCyberProgressBar(ctx, vtX + 24, vtY + 128, vtW - 48, 16, vibeProgress, {
            themeColor: "#00ffcc",
            accentColor: "#38bdf8",
            label: `⚡ ${vibeLabel}`,
            statusText: vibeStatus,
            showPercent: true
        });

        ctx.textAlign = "left";
        ctx.font = "12px monospace";
        ctx.fillStyle = "#00ffcc";
        const promptLines = [];
        if (tb.vibeStep === 1) {
            promptLines.push(__("sys_neuronika_cmd1"));
            promptLines.push(__("term_thinking"));
            promptLines.push(__("term_log_import"));
            promptLines.push(__("term_log_compile"));
            promptLines.push(__("term_log_calibrate"));
        } else if (tb.vibeStep === 2 || tb.vibeStep === 3) {
            promptLines.push(__("sys_neuronika_cmd2"));
            promptLines.push(__("term_amplifying"));
            promptLines.push(__("term_log_scale"));
            promptLines.push(__("term_log_aggro"));
            promptLines.push(__("term_log_inject"));
        } else if (tb.vibeStep === 4) {
            promptLines.push(__("sys_neuronika_cmd2"));
            promptLines.push(__("term_amplifying_pct", Math.min(100, Math.floor(tb.vibeTimer / 1.3))));
        }
        promptLines.forEach((line, idx) => {
            if (line) ctx.fillText(line, vtX + 24, vtY + 182 + idx * 20);
        });
        if (Math.floor(tb.vibeTimer / 15) % 2 === 0) {
            ctx.fillStyle = "#00ffcc";
            ctx.fillRect(vtX + 24 + ctx.measureText("$").width + 12, vtY + 182 + promptLines.length * 20 - 12, 10, 16);
        }
        ctx.restore();
    }
    if (tb._desktopCinematicActive) {
        drawProtectionDesktopCinematic(ctx, tb);
    }
    if (tb.state === "defeated" && tb.defeatTimer > 0) {
        tb.defeatTimer--;
        if (Math.random() < .5) {
            particles.push({
                x: tb.x + tb.w / 2 + (Math.random() - .5) * tb.w,
                y: tb.y + tb.h / 2 + (Math.random() - .5) * tb.h,
                vx: (Math.random() - .5) * 12,
                vy: (Math.random() - .5) * 12,
                life: 30,
                color: [ "#00ffaa", "#ff00ff", "#ffd700" ][Math.floor(Math.random() * 3)],
                size: 6 + Math.random() * 6,
                type: "spark"
            });
        }
    }
    if (game.invertControls && currentLevel === 1) {
        drawInvertControlsHUD(ctx, time);
    }
}

function drawInvertControlsHUD(ctx, time) {
    ctx.save();
    const hudW = 230;
    const hudH = 58;
    const hudX = VIEW_W - hudW - 14;
    const hudY = 82;
    const isBlink = Math.floor(time * 12) % 2 === 0;
    ctx.fillStyle = "rgba(20, 5, 25, 0.92)";
    ctx.strokeStyle = isBlink ? "#ff007f" : "#00ffff";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(hudX, hudY, hudW, hudH, 6); else ctx.rect(hudX, hudY, hudW, hudH);
    ctx.fill();
    ctx.stroke();
    const badgeX = hudX + 8;
    const badgeY = hudY + 8;
    const badgeS = 26;
    ctx.fillStyle = "rgba(255, 0, 128, 0.22)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(badgeX, badgeY, badgeS, badgeS, 5); else ctx.fillRect(badgeX, badgeY, badgeS, badgeS);
    ctx.fill();
    ctx.font = "bold 15px sans-serif";
    ctx.fillStyle = "#ff007f";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🕹️", badgeX + badgeS / 2, badgeY + badgeS / 2 + 1);
    const titleText = (typeof __ === "function" ? __("flt_controles_invertidos") : "🔄 CONTROLES INVERTIDOS").replace(/^[🔄🎮🕹️\s]+/, "");
    ctx.font = 'bold 11px "Segoe UI", monospace, sans-serif';
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(titleText, badgeX + badgeS + 7, badgeY + 6, hudW - badgeS - 18);
    ctx.font = "bold 9.5px monospace";
    ctx.fillStyle = isBlink ? "#ffd700" : "#00ffff";
    ctx.fillText("⬅️ = ➡️  |  ➡️ = ⬅️", badgeX + badgeS + 7, badgeY + 18);
    ctx.fillStyle = isBlink ? "#00ffff" : "#ffd700";
    ctx.fillText(typeof __ === "function" ? __("ui_invert_controls_keys") : "ESPACIO = DISPARO | X = SALTO", badgeX + badgeS + 7, badgeY + 30);
    const barX = hudX + 8;
    const barY = hudY + hudH - 6;
    const barW = hudW - 16;
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.fillRect(barX, barY, barW, 3);
    ctx.fillStyle = isBlink ? "#ff007f" : "#00ffff";
    const pulseOffset = time * 60 % barW;
    ctx.fillRect(barX + pulseOffset % (barW - 30), barY, 30, 3);
    ctx.restore();
}

window.drawInvertControlsHUD = drawInvertControlsHUD;
