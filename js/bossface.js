function bfDrawDistortedPath(c2, x, y, radius, t, noiseIntensity, nightmareFactor = 0) {
    c2.beginPath();
    const steps = 50 - Math.floor(nightmareFactor * 20);
    for (let i = 0; i <= steps; i++) {
        const angle = i / steps * Math.PI * 2;
        const chaos = nightmareFactor > 0 ? (Math.random() - .5) * nightmareFactor * radius * .5 : 0;
        const wave = Math.sin(angle * 12 + t * 15) * (noiseIntensity * .6) + Math.cos(angle * 7 - t * 20) * (noiseIntensity * .4) + chaos;
        const currentRadius = radius + wave;
        const px = x + Math.cos(angle) * currentRadius;
        const py = y + Math.sin(angle) * currentRadius;
        if (i === 0) c2.moveTo(px, py); else c2.lineTo(px, py);
    }
    c2.closePath();
}

function bfRenderEye(c2, x, y, radius, opacity, lookX, lookY, t, state) {
    const {stalk: stalk, annoyed: annoyed, enraged: enraged, shocked: shocked, nightmare: nightmare, hit: hit} = state;
    c2.save();
    c2.globalAlpha = opacity;
    if (nightmare > .5 && Math.random() > .8) {
        c2.translate((Math.random() - .5) * 10, (Math.random() - .5) * 10);
    }
    const channelVal = Math.floor(255 * (1 - enraged) * (1 - nightmare));
    const mainColor = nightmare > 0 ? `rgb(${255 - Math.random() * 50}, 0, ${Math.random() * 50})` : `rgb(255, ${channelVal}, ${channelVal})`;
    const glowColor = enraged > 0 || nightmare > 0 ? `rgba(255, 0, 0, ${.5 + Math.max(enraged, nightmare) * .5})` : "#ffffff";
    const squish = 1 - annoyed * .4 - enraged * .25 + shocked * .4;
    c2.translate(x, y);
    c2.scale(1, squish);
    c2.translate(-x, -y);
    const maxOffset = radius * .35;
    const dx = lookX - x;
    const dy = lookY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    let pupilX = x;
    let pupilY = y;
    if (dist > 0) {
        const shift = Math.min(dist * .08, maxOffset);
        pupilX = x + dx / dist * shift;
        pupilY = y + dy / dist * shift;
    }
    if (nightmare > 0 || hit > 0) {
        pupilX += (Math.random() - .5) * (15 * nightmare + 10 * hit);
        pupilY += (Math.random() - .5) * (15 * nightmare + 10 * hit);
    }
    c2.shadowBlur = 22 + stalk * 10 + enraged * 15 + nightmare * 25;
    c2.shadowColor = glowColor;
    c2.fillStyle = mainColor;
    bfDrawDistortedPath(c2, pupilX, pupilY, radius, t, radius * .15, nightmare);
    c2.fill();
    c2.shadowBlur = 10;
    c2.lineWidth = 4 + enraged * 2 + nightmare * 3;
    c2.strokeStyle = enraged > 0 || nightmare > 0 ? "rgba(100, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.5)";
    bfDrawDistortedPath(c2, pupilX, pupilY, radius * .7, t + 5, radius * .2, nightmare);
    c2.stroke();
    const basePupil = radius * .25;
    const dilatedPupil = radius * .75;
    let pupilRadius = basePupil + (dilatedPupil - basePupil) * stalk;
    pupilRadius *= 1 - shocked * .8;
    c2.fillStyle = nightmare > 0 ? "#110000" : "#020005";
    bfDrawDistortedPath(c2, pupilX, pupilY, Math.max(2, pupilRadius), t * 1.5, radius * .15, nightmare);
    c2.fill();
    if (nightmare > .1) {
        c2.strokeStyle = `rgba(0, 255, 255, ${nightmare * .5})`;
        c2.lineWidth = 2;
        bfDrawDistortedPath(c2, pupilX + 5, pupilY, Math.max(2, pupilRadius), t, radius * .2, nightmare);
        c2.stroke();
    }
    c2.restore();
}

function bfRenderSimpleSmile(c2, x, y, width, t, stalkWeight, shockedWeight) {
    if (stalkWeight <= .01 || shockedWeight > .5) return;
    c2.save();
    c2.globalAlpha = stalkWeight * (1 - shockedWeight);
    c2.shadowBlur = 10 * stalkWeight;
    c2.shadowColor = "#ffffff";
    c2.strokeStyle = "#ffffff";
    c2.lineWidth = 2 + stalkWeight * 3;
    c2.beginPath();
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
        const tt = i / steps;
        const px = x - width / 2 + tt * width;
        const curveY = Math.sin(tt * Math.PI) * (width * .25);
        const noise = (Math.sin(tt * 20 + t * 12) * 5 + Math.cos(tt * 15 - t * 18) * 5) * stalkWeight;
        const py = y + curveY + noise;
        if (i === 0) c2.moveTo(px, py); else c2.lineTo(px, py);
    }
    c2.stroke();
    c2.restore();
}

function bfRenderFangedMouth(c2, x, y, width, t, state) {
    const {teeth: teeth, laugh: laugh, annoyed: annoyed, enraged: enraged, shocked: shocked, nightmare: nightmare} = state;
    if (teeth <= .01 && shocked <= .01) return;
    c2.save();
    const offsetX = (Math.random() - .5) * 12 * laugh + (Math.random() - .5) * 8 * enraged + (Math.random() - .5) * 20 * nightmare;
    let offsetY = (Math.random() - .5) * 12 * laugh + (Math.random() - .5) * 8 * enraged + (Math.random() - .5) * 20 * nightmare;
    if (nightmare > 0) {
        offsetY += Math.abs(Math.sin(t * 5)) * 50 * nightmare;
    }
    x += offsetX;
    y += offsetY;
    const channelVal = Math.floor(255 * (1 - enraged) * (1 - nightmare));
    const mouthColor = nightmare > 0 ? `rgb(255, ${Math.random() * 50}, 0)` : `rgb(255, ${channelVal}, ${channelVal})`;
    const activeOpacity = Math.max(teeth, shocked);
    c2.globalAlpha = activeOpacity;
    c2.shadowBlur = 8 * activeOpacity + enraged * 10 + nightmare * 20;
    c2.shadowColor = enraged > 0 || nightmare > 0 ? "rgba(255, 0, 0, 0.9)" : "#ffffff";
    c2.fillStyle = "#020005";
    c2.strokeStyle = mouthColor;
    c2.lineWidth = 2 + activeOpacity * 2 + enraged * 2 + nightmare * 3;
    c2.lineJoin = "round";
    const segments = 30;
    let halfWidth = width / 2;
    halfWidth *= 1 - shocked * .4;
    let opening = width * .15 * teeth;
    if (annoyed > 0) opening *= 1 - annoyed * .5;
    if (enraged > 0) opening += width * .1 * enraged;
    if (shocked > 0) opening = width * .4 * shocked;
    if (nightmare > 0) opening += width * .3 * nightmare;
    const laughOpening = width * .2 * laugh * Math.abs(Math.sin(t * 25));
    const totalOpening = opening + laughOpening;
    const extraFang = width * .1 * enraged + width * .2 * nightmare;
    if (nightmare > .5) {
        c2.fillStyle = `rgba(50, 0, 0, ${nightmare})`;
    }
    c2.beginPath();
    for (let i = 0; i <= segments; i++) {
        const tt = i / segments;
        const px = x - halfWidth + tt * halfWidth * 2;
        const upperCurve = Math.sin(tt * Math.PI) * (width * .25);
        const shockCurve = -Math.sin(tt * Math.PI) * (totalOpening * .5);
        const curveY = upperCurve * (1 - shocked) + shockCurve * shocked;
        const noise = Math.sin(tt * 20 + t * 12) * 3 * activeOpacity + Math.random() * 10 * nightmare;
        if (i === 0) c2.moveTo(px, y + curveY + noise); else c2.lineTo(px, y + curveY + noise);
    }
    for (let i = segments; i >= 0; i--) {
        const tt = i / segments;
        const px = x - halfWidth + tt * halfWidth * 2;
        const upperCurve = Math.sin(tt * Math.PI) * (width * .25);
        const shockCurve = -Math.sin(tt * Math.PI) * (totalOpening * .5);
        const curveY = upperCurve * (1 - shocked) + shockCurve * shocked;
        const lowerCurveY = curveY + totalOpening * (shocked > 0 ? 1 : Math.sin(tt * Math.PI));
        const noise = Math.cos(tt * 15 - t * 18) * 3 * activeOpacity + Math.random() * 10 * nightmare;
        c2.lineTo(px, y + lowerCurveY + noise);
    }
    c2.closePath();
    c2.fill();
    c2.stroke();
    c2.beginPath();
    for (let i = 0; i <= segments; i++) {
        const tt = i / segments;
        const px = x - halfWidth + tt * halfWidth * 2;
        const curveY = Math.sin(tt * Math.PI) * (width * .25) * (1 - shocked) + -Math.sin(tt * Math.PI) * (totalOpening * .5) * shocked;
        const noise = Math.sin(tt * 20 + t * 12) * 3 * activeOpacity;
        const toothLength = i % 2 === 1 ? width * .08 * Math.sin(tt * Math.PI) + extraFang : 0;
        const tipY = y + curveY + noise + toothLength;
        if (i === 0) c2.moveTo(px, y + curveY + noise); else c2.lineTo(px, tipY);
        if ((enraged > 0 || nightmare > 0) && i % 2 === 1 && toothLength > 0) {
            c2.save();
            c2.strokeStyle = nightmare > 0 ? `rgba(0, 0, 0, ${nightmare})` : `rgba(180, 0, 0, ${enraged})`;
            c2.lineWidth = 2 + Math.random() * (4 * nightmare + 2);
            c2.beginPath();
            c2.moveTo(px, tipY);
            const dripLength = 15 + Math.sin(tt * 40 + t * 8) * 20 * Math.max(enraged, nightmare) + Math.random() * 100 * nightmare;
            c2.lineTo(px, tipY + dripLength);
            c2.stroke();
            c2.restore();
            c2.moveTo(px, tipY);
        }
    }
    c2.stroke();
    c2.beginPath();
    for (let i = 0; i <= segments; i++) {
        const tt = i / segments;
        const px = x - halfWidth + tt * halfWidth * 2;
        const curveY = Math.sin(tt * Math.PI) * (width * .25) * (1 - shocked) + -Math.sin(tt * Math.PI) * (totalOpening * .5) * shocked;
        const lowerCurveY = curveY + totalOpening * (shocked > 0 ? 1 : Math.sin(tt * Math.PI));
        const noise = Math.cos(tt * 15 - t * 18) * 3 * activeOpacity;
        const toothLength = i % 2 === 1 ? -width * .06 * Math.sin(tt * Math.PI) - extraFang : 0;
        const tipY = y + lowerCurveY + noise + toothLength;
        if (i === 0) c2.moveTo(px, tipY - toothLength); else c2.lineTo(px, tipY);
    }
    c2.stroke();
    c2.restore();
}

function bfPhaseTargets() {
    const k = game.huntKills || 0;
    let stalk = 0, teeth = 0, laugh = 0, annoyed = 0, enraged = 0;
    if (k >= 4) stalk = 1;
    if (k >= 5) teeth = 1;
    if (k >= 6) {
        laugh = 1;
        annoyed = 1;
    }
    if (k >= 7) enraged = 1;
    return {
        stalk: stalk,
        teeth: teeth,
        laugh: laugh,
        annoyed: annoyed,
        enraged: enraged
    };
}

function bfRenderFace(c2) {
    const t = Date.now() * .001;
    const tg = bfPhaseTargets();
    bfStalk += (tg.stalk - bfStalk) * .02;
    bfTeeth += (tg.teeth - bfTeeth) * .04;
    bfLaugh += (tg.laugh - bfLaugh) * .1;
    bfAnnoyed += (tg.annoyed - bfAnnoyed) * .05;
    bfEnraged += (tg.enraged - bfEnraged) * .03;
    bfAlpha += ((bfShow ? 1 : 0) - bfAlpha) * .08;
    if (bfAlpha <= .01) return;
    c2.save();
    c2.globalAlpha = bfAlpha * .35;
    if (gameState === "ending") {
        bfTargetX = VIEW_W / 2;
        bfTargetY = VIEW_H / 2;
    } else if (game.player) {
        bfTargetX = game.player.x - cameraX + game.player.w / 2;
        bfTargetY = game.player.y + game.player.h / 2;
    }
    bfPointerX += (bfTargetX - bfPointerX) * .05;
    bfPointerY += (bfTargetY - bfPointerY) * .05;
    const centerX = VIEW_W / 2, centerY = VIEW_H / 2;
    const faceOffsetX = (bfPointerX - centerX) * .08;
    const faceOffsetY = (bfPointerY - centerY) * .08;
    const faceX = centerX + faceOffsetX;
    const headShake = Math.sin(t * 30) * 5 * bfLaugh + (Math.random() - .5) * 10 * bfEnraged + (Math.random() - .5) * 20 * bfNightmare;
    const faceY = centerY + faceOffsetY + headShake;
    const faceRadius = Math.min(VIEW_W, VIEW_H) * .45;
    const faceMask = c2.createRadialGradient(faceX, faceY, faceRadius * .3, faceX, faceY, faceRadius);
    faceMask.addColorStop(0, "rgba(0, 0, 0, 0.15)");
    faceMask.addColorStop(.7, "rgba(0, 0, 0, 0.10)");
    faceMask.addColorStop(1, "rgba(0, 0, 0, 0)");
    c2.fillStyle = faceMask;
    c2.beginPath();
    c2.arc(faceX, faceY, faceRadius * 1.5, 0, Math.PI * 2);
    c2.fill();
    c2.globalAlpha = bfAlpha * .6;
    const pulseOpacity = .85 + Math.sin(t * (2 + bfNightmare * 5)) * .15;
    const eyeRadius = Math.min(VIEW_W, VIEW_H) * .12;
    const eyeSpacing = 1.8 + bfShock * .2;
    const leftEyeX = faceX - eyeRadius * eyeSpacing;
    const rightEyeX = faceX + eyeRadius * eyeSpacing;
    const eyesY = faceY - eyeRadius * .3 - bfShock * eyeRadius * .5;
    const params = {
        stalk: bfStalk,
        annoyed: bfAnnoyed,
        enraged: bfEnraged,
        shocked: bfShock,
        nightmare: bfNightmare,
        teeth: bfTeeth,
        laugh: bfLaugh,
        hit: bfHitFrames / BF_MAX_HIT
    };
    bfRenderEye(c2, leftEyeX, eyesY, eyeRadius, pulseOpacity, bfPointerX, bfPointerY, t, params);
    bfRenderEye(c2, rightEyeX, eyesY, eyeRadius, pulseOpacity, bfPointerX, bfPointerY, t, params);
    const mouthWidth = eyeRadius * 5;
    const mouthY = eyesY + eyeRadius * 1.8 + bfShock * eyeRadius * .5;
    const idleSmileWeight = Math.max(0, bfStalk - Math.max(bfTeeth, bfShock));
    if (idleSmileWeight > 0) bfRenderSimpleSmile(c2, faceX, mouthY, mouthWidth, t, idleSmileWeight, bfShock);
    if (bfTeeth > 0 || bfShock > 0) bfRenderFangedMouth(c2, faceX, mouthY, mouthWidth, t, params);
    c2.restore();
}
// Isaac Daniel Cotera - 2026 | Correo: isaacdanielcotera@gmail.com | Itch.io: https://cotera.itch.io | GitHub: https://github.com/cotera2024
