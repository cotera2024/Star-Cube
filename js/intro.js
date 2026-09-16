(function() {
    "use strict";
    let introState = null;
    function startIntroCinematic() {
        introState = {
            stage: "sky_pan",
            timer: 0,
            dialogueStep: 0,
            charIdx: 0,
            textTimer: 0,
            holdTimer: 0,
            skyPanY: -220,
            blackoutAlpha: 0,
            whiteFlash: 0,
            peggy: {
                x: 430,
                y: 436,
                baseY: 436,
                w: 32,
                h: 32,
                scaleX: 1,
                scaleY: 1,
                facing: 1,
                jumpPhase: 0,
                isDizzy: false,
                isShocked: false,
                isDashing: false,
                dashTrail: []
            },
            friends: [ {
                id: "pink",
                nameKey: "Pinky",
                colorTop: "#ff99cc",
                colorBot: "#ff3388",
                x: 340,
                baseY: 438,
                y: 438,
                w: 28,
                h: 28,
                scaleX: 1,
                scaleY: 1,
                facing: 1,
                jumpOffset: 0,
                mood: "happy"
            }, {
                id: "mint",
                nameKey: "Minti",
                colorTop: "#a8f5cc",
                colorBot: "#2ecc71",
                x: 500,
                baseY: 438,
                y: 438,
                w: 28,
                h: 28,
                scaleX: 1,
                scaleY: 1,
                facing: -1,
                jumpOffset: 1.8,
                mood: "happy"
            }, {
                id: "gold",
                nameKey: "Sunny",
                colorTop: "#ffeaa7",
                colorBot: "#fdcb6e",
                x: 150,
                baseY: 438,
                y: 438,
                w: 28,
                h: 28,
                scaleX: 1,
                scaleY: 1,
                facing: 1,
                jumpOffset: 3.2,
                mood: "happy"
            }, {
                id: "sky",
                nameKey: "Cielo",
                colorTop: "#a8dcff",
                colorBot: "#4d96ff",
                x: 220,
                baseY: 436,
                y: 436,
                w: 28,
                h: 28,
                scaleX: 1,
                scaleY: 1,
                facing: -1,
                jumpOffset: .9,
                mood: "happy"
            }, {
                id: "coral",
                nameKey: "Coral",
                colorTop: "#ffc9a8",
                colorBot: "#ff8f6b",
                x: 570,
                baseY: 438,
                y: 438,
                w: 28,
                h: 28,
                scaleX: 1,
                scaleY: 1,
                facing: 1,
                jumpOffset: 2.4,
                mood: "happy"
            }, {
                id: "lava",
                nameKey: "Uva",
                colorTop: "#e9d5ff",
                colorBot: "#c77dff",
                x: 640,
                baseY: 436,
                y: 436,
                w: 28,
                h: 28,
                scaleX: 1,
                scaleY: 1,
                facing: -1,
                jumpOffset: 1.1,
                mood: "happy"
            }, {
                id: "grape",
                nameKey: "Rosa",
                colorTop: "#ffb3c6",
                colorBot: "#ff5d8f",
                x: 710,
                baseY: 438,
                y: 438,
                w: 28,
                h: 28,
                scaleX: 1,
                scaleY: 1,
                facing: 1,
                jumpOffset: 4,
                mood: "happy"
            }, {
                id: "aqua",
                nameKey: "Aqua",
                colorTop: "#a8f0f5",
                colorBot: "#5fd0e8",
                x: 270,
                baseY: 438,
                y: 438,
                w: 28,
                h: 28,
                scaleX: 1,
                scaleY: 1,
                facing: -1,
                jumpOffset: 2,
                mood: "happy"
            }, {
                id: "lime",
                nameKey: "Lima",
                colorTop: "#e6ffb3",
                colorBot: "#a3c94a",
                x: 780,
                baseY: 438,
                y: 438,
                w: 28,
                h: 28,
                scaleX: 1,
                scaleY: 1,
                facing: 1,
                jumpOffset: .6,
                mood: "happy"
            } ],
            dizzyAngle: 0,
            portal: {
                x: 740,
                y: 420,
                scale: 0,
                targetScale: 1,
                angle: 0,
                particles: []
            },
            ambientParticles: []
        };
        for (let i = 0; i < 20; i++) {
            introState.ambientParticles.push({
                x: Math.random() * VIEW_W,
                y: 470 + Math.random() * 50,
                size: 2 + Math.random() * 3,
                color: [ "#ff99c8", "#fcf6bd", "#d0f4de", "#a9def9", "#e4c1f9" ][Math.floor(Math.random() * 5)],
                sway: Math.random() * Math.PI * 2
            });
        }
        try {
            if (typeof playBGM === "function") {
                playBGM("bgm_menu_title");
            }
        } catch (e) {}
        try { setupIntroSkipButton(); } catch (e2) {}
        gameState = "introStory";
    }
    let introSkipBound = false;
    function setupIntroSkipButton() {
        const btn = document.getElementById("intro-skip-btn");
        if (!btn) return;
        const isTouch = typeof window !== "undefined" && (window.isMobileDevice || window.isMobileOrTouch?.());
        btn.style.display = isTouch ? "block" : "none";
        if (typeof __ === "function") btn.textContent = __("ui_intro_skip_btn");
        if (introSkipBound) return;
        introSkipBound = true;
        let lastTouch = 0;
        btn.addEventListener("touchstart", e => {
            e.preventDefault();
            e.stopPropagation();
            if (Date.now() - lastTouch < 600) return;
            lastTouch = Date.now();
            handleIntroInput("Escape");
        }, { passive: false });
        btn.addEventListener("click", () => {
            if (Date.now() - lastTouch < 800) return;
            handleIntroInput("Escape");
        });
    }
    function hideIntroSkipButton() {
        const btn = document.getElementById("intro-skip-btn");
        if (btn) btn.style.display = "none";
    }
    function handleIntroInput(key) {
        if (!introState || gameState !== "introStory") return;
        if (key === "Escape") {
            finishIntro();
            return;
        }
        if (key === " " || key === "Spacebar" || key === "Enter" || key === "click") {
            const currentFullText = getCurrentText();
            if (currentFullText && introState.charIdx < currentFullText.length) {
                introState.charIdx = currentFullText.length;
                introState.holdTimer = 0;
            } else {
                advanceDialogueStep();
            }
        }
    }
    function finishIntro() {
        try { hideIntroSkipButton(); } catch (e) {}
        if (introState) introState.stage = "done";
        gameState = "playing";
        if (typeof loadHubLevel === "function") {
            loadHubLevel(0);
        }
        if (typeof window.showAnimatedMessage === "function") {
            window.showAnimatedMessage(__("ui_hub_title") || "Cuarto de Puertas");
        }
    }
    function getCurrentText() {
        if (!introState) return "";
        switch (introState.stage) {
          case "peace_playing":
            return introState.dialogueStep === 0 ? __("story_intro_1") : __("story_intro_2");

          case "earthquake_shock":
            return introState.dialogueStep === 0 ? __("story_intro_3") : __("story_intro_4");

          case "blackout_panic":
            return introState.dialogueStep === 0 ? __("story_intro_5") : __("story_intro_6");

          case "dark_silence":
            return __("story_intro_7");

          case "dizzy_wake":
            return __("story_intro_8");

          case "realization_panic":
            return __("story_intro_9");

          case "portal_open":
            return __("story_intro_10");

          default:
            return "";
        }
    }
    function advanceDialogueStep() {
        if (!introState) return;
        introState.charIdx = 0;
        introState.textTimer = 0;
        introState.holdTimer = 0;
        switch (introState.stage) {
          case "peace_playing":
            if (introState.dialogueStep === 0) {
                introState.dialogueStep = 1;
            } else {
                triggerEarthquake();
            }
            break;

          case "earthquake_shock":
            if (introState.dialogueStep === 0) {
                introState.dialogueStep = 1;
            } else {
                triggerBlackout();
            }
            break;

          case "blackout_panic":
            if (introState.dialogueStep === 0) {
                introState.dialogueStep = 1;
                try {
                    playSound(220, .45, "triangle", .8, 60);
                } catch (e) {}
            } else {
                introState.stage = "dark_silence";
                introState.dialogueStep = 0;
            }
            break;

          case "dark_silence":
            triggerKnockout();
            break;

          case "dizzy_wake":
            introState.stage = "realization_panic";
            introState.dialogueStep = 0;
            introState.peggy.isDizzy = false;
            introState.peggy.isShocked = true;
            introState.peggy.scaleX = .7;
            introState.peggy.scaleY = 1.35;
            try {
                playSound(440, .15, "sine", .4, 600);
            } catch (e) {}
            break;

          case "realization_panic":
            triggerPortal();
            break;

          case "portal_open":
            triggerEnterPortal();
            break;

          default:
            break;
        }
    }
    function triggerEarthquake() {
        introState.stage = "earthquake_shock";
        introState.dialogueStep = 0;
        introState.charIdx = 0;
        introState.timer = 0;
        if (typeof screenShake !== "undefined") {
            screenShake.intensity = 24;
        }
        try {
            playSound(75, .65, "sawtooth", .9, 40);
        } catch (e) {}
        introState.peggy.isShocked = true;
        introState.peggy.scaleX = 1.3;
        introState.peggy.scaleY = .7;
        introState.friends.forEach(f => {
            f.mood = "shock";
            f.scaleX = 1.25;
            f.scaleY = .75;
        });
    }
    function triggerBlackout() {
        introState.stage = "blackout_panic";
        introState.dialogueStep = 0;
        introState.charIdx = 0;
        introState.timer = 0;
        introState.blackoutAlpha = 1;
        try {
            playSound(140, .4, "sine", .5, 30);
        } catch (e) {}
    }
    function triggerKnockout() {
        introState.stage = "knockout_hit";
        introState.timer = 0;
        introState.whiteFlash = 1;
        if (typeof screenShake !== "undefined") {
            screenShake.intensity = 30;
        }
        try {
            playSound(110, .5, "square", .95, 40);
        } catch (e) {}
    }
    function triggerPortal() {
        introState.stage = "portal_open";
        introState.dialogueStep = 0;
        introState.charIdx = 0;
        introState.timer = 0;
        introState.portal.scale = .1;
        introState.peggy.facing = 1;
        introState.peggy.isShocked = false;
        try {
            playSound(320, .7, "sine", .6, 900);
        } catch (e) {}
    }
    function triggerEnterPortal() {
        introState.stage = "enter_portal";
        introState.timer = 0;
        introState.peggy.isDashing = true;
        try {
            playSound(550, .35, "sawtooth", .7, 1100);
        } catch (e) {}
    }
    function updateAndDrawIntro(ctx, t) {
        if (!introState) {
            startIntroCinematic();
        }
        introState.timer++;
        const s = introState;
        if (s.stage === "sky_pan") {
            s.skyPanY += (0 - s.skyPanY) * .035;
            if (Math.abs(s.skyPanY) < 1.5) {
                s.skyPanY = 0;
                s.stage = "peace_playing";
                s.dialogueStep = 0;
            }
        }
        if (s.stage === "knockout_hit") {
            if (s.timer > 35) {
                s.stage = "dizzy_wake";
                s.timer = 0;
                s.dialogueStep = 0;
                s.peggy.isDizzy = true;
                s.peggy.scaleX = 1.45;
                s.peggy.scaleY = .55;
            }
        }
        if (s.stage === "dizzy_wake") {
            if (s.blackoutAlpha > 0) {
                s.blackoutAlpha = Math.max(0, s.blackoutAlpha - .03);
            }
        }
        if (s.stage === "enter_portal") {
            s.peggy.dashTrail.push({
                x: s.peggy.x,
                y: s.peggy.y,
                alpha: .8
            });
            s.peggy.x += (s.portal.x - s.peggy.x) * .18 + 5;
            s.peggy.y += (s.portal.y - s.peggy.y) * .15;
            s.peggy.scaleX = 1.4;
            s.peggy.scaleY = .6;
            if (s.peggy.x >= s.portal.x - 10) {
                s.whiteFlash = 1;
                s.portal.scale = 0;
                finishIntro();
                return;
            }
        }
        ctx.save();
        ctx.translate(0, -s.skyPanY);
        if (s.blackoutAlpha < 1) {
            if (typeof drawEnhancedBackground === "function") {
                drawEnhancedBackground(ctx, 0, 0, t, game);
            } else {
                ctx.fillStyle = "#87CEEB";
                ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            }
            drawMeadowGround(ctx, t);
            if (s.stage === "portal_open" || s.stage === "enter_portal") {
                drawCosmicPortal(ctx, s.portal, t);
            }
            if (s.stage === "sky_pan" || s.stage === "peace_playing" || s.stage === "earthquake_shock") {
                drawFriends(ctx, s.friends, s.stage, t);
            }
            drawPeggyIntro(ctx, s.peggy, s.stage, s.dizzyAngle, t);
        }
        ctx.restore();
        s.dizzyAngle += .08;
        if (s.blackoutAlpha > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${s.blackoutAlpha})`;
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        }
        if (s.whiteFlash > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${s.whiteFlash})`;
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            s.whiteFlash -= .07;
        }
        const fullText = getCurrentText();
        if (fullText) {
            if (s.charIdx < fullText.length) {
                s.textTimer++;
                if (s.textTimer % 2 === 0) {
                    s.charIdx++;
                    if (s.charIdx % 3 === 0) {
                        try {
                            playSound(800 + Math.random() * 200, .02, "sine", .04);
                        } catch (e) {}
                    }
                }
            } else {
                s.holdTimer++;
                const neededWait = s.stage === "dark_silence" ? 140 : 190;
                if (s.holdTimer >= neededWait) {
                    advanceDialogueStep();
                }
            }
            const visibleText = fullText.substring(0, s.charIdx);
            renderCurrentBubble(ctx, visibleText, s);
        }
        const isTouchIntro = typeof window !== "undefined" && (window.isMobileDevice || window.isMobileOrTouch?.());
        if (!isTouchIntro) {
            ctx.save();
            ctx.font = 'bold 13px "Courier Prime", monospace';
            ctx.textAlign = "right";
            ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
            ctx.fillText(__("ui_intro_skip") || "[ESC] Saltar Intro", VIEW_W - 20, 28);
            ctx.restore();
        }
    }
    function drawMeadowGround(ctx, t) {
        const groundY = 468;
        const groundH = VIEW_H - groundY;
        const groundGrad = ctx.createLinearGradient(0, groundY, 0, VIEW_H);
        groundGrad.addColorStop(0, "#48bb78");
        groundGrad.addColorStop(.18, "#38a169");
        groundGrad.addColorStop(1, "#2f855a");
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, groundY, VIEW_W, groundH);
        ctx.fillStyle = "#68d391";
        ctx.fillRect(0, groundY, VIEW_W, 6);
        ctx.fillStyle = "#9ae6b4";
        for (let x = 10; x < VIEW_W; x += 22) {
            const sway = Math.sin(t * .06 + x * .1) * 3;
            ctx.beginPath();
            ctx.moveTo(x, groundY);
            ctx.lineTo(x + 4 + sway, groundY - 6);
            ctx.lineTo(x + 8, groundY);
            ctx.fill();
        }
        if (introState && introState.ambientParticles) {
            introState.ambientParticles.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }
    function drawFriends(ctx, friends, stage, t) {
        friends.forEach(f => {
            ctx.save();
            if (stage === "peace_playing") {
                const jumpCycle = Math.sin(t * .14 + f.jumpOffset);
                if (jumpCycle > 0) {
                    f.y = f.baseY - jumpCycle * 32;
                    f.scaleX = .85;
                    f.scaleY = 1.15;
                } else {
                    f.y = f.baseY;
                    f.scaleX = 1 + Math.abs(jumpCycle) * .2;
                    f.scaleY = 1 - Math.abs(jumpCycle) * .2;
                }
            } else if (stage === "earthquake_shock") {
                f.y = f.baseY;
                f.scaleX = 1.25 + Math.sin(t * .5) * .05;
                f.scaleY = .75;
            }
            const cx = f.x + f.w / 2;
            const cy = f.y + f.h;
            ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
            ctx.beginPath();
            ctx.ellipse(cx, f.baseY + f.h - 1, f.w * .55 * f.scaleX, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.translate(cx, cy);
            ctx.scale(f.scaleX, f.scaleY);
            ctx.translate(-cx, -cy);
            const bodyGrad = ctx.createLinearGradient(f.x, f.y, f.x, f.y + f.h);
            bodyGrad.addColorStop(0, f.colorTop);
            bodyGrad.addColorStop(1, f.colorBot);
            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.roundRect(f.x, f.y, f.w, f.h, 7);
            ctx.fill();
            ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
            ctx.beginPath();
            ctx.ellipse(f.x + f.w * .35, f.y + 5, f.w * .28, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(255, 100, 150, 0.5)";
            ctx.beginPath();
            ctx.ellipse(f.x + 5, f.y + f.h * .55, 3, 1.8, 0, 0, Math.PI * 2);
            ctx.ellipse(f.x + f.w - 5, f.y + f.h * .55, 3, 1.8, 0, 0, Math.PI * 2);
            ctx.fill();
            const eyeY = f.y + f.h * .38;
            if (f.mood === "shock") {
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(f.x + 8, eyeY, 4.5, 0, Math.PI * 2);
                ctx.arc(f.x + f.w - 8, eyeY, 4.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#111111";
                ctx.beginPath();
                ctx.arc(f.x + 8, eyeY, 1.8, 0, Math.PI * 2);
                ctx.arc(f.x + f.w - 8, eyeY, 1.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#551111";
                ctx.beginPath();
                ctx.ellipse(f.x + f.w / 2, f.y + f.h * .72, 3.5, 4.5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#38bdf8";
                ctx.beginPath();
                ctx.arc(f.x + f.w - 2, f.y + 3, 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.strokeStyle = "#111111";
                ctx.lineWidth = 2.2;
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.arc(f.x + 8, eyeY, 3.5, .1 * Math.PI, .9 * Math.PI);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(f.x + f.w - 8, eyeY, 3.5, .1 * Math.PI, .9 * Math.PI);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(f.x + f.w / 2, f.y + f.h * .65, 4, 0, Math.PI);
                ctx.stroke();
                if (Math.sin(t * .08 + f.jumpOffset) > .8) {
                    ctx.fillStyle = "#ff69b4";
                    ctx.font = "12px sans-serif";
                    ctx.fillText("♪", f.x + f.w + 2, f.y - 6);
                }
            }
            ctx.restore();
        });
    }
    function drawPeggyIntro(ctx, p, stage, dizzyAngle, t) {
        ctx.save();
        if (p.isDashing && p.dashTrail) {
            p.dashTrail.forEach((tr, i) => {
                ctx.save();
                ctx.globalAlpha = tr.alpha * .4;
                ctx.fillStyle = "#38bdf8";
                ctx.beginPath();
                ctx.roundRect(tr.x, tr.y, p.w, p.h, 8);
                ctx.fill();
                ctx.restore();
                tr.alpha -= .08;
            });
            p.dashTrail = p.dashTrail.filter(tr => tr.alpha > 0);
        }
        if (stage === "peace_playing") {
            const jumpCycle = Math.sin(t * .14);
            if (jumpCycle > 0) {
                p.y = p.baseY - jumpCycle * 34;
                p.scaleX = .82;
                p.scaleY = 1.18;
            } else {
                p.y = p.baseY;
                p.scaleX = 1 + Math.abs(jumpCycle) * .18;
                p.scaleY = 1 - Math.abs(jumpCycle) * .18;
            }
        } else if (stage === "earthquake_shock") {
            p.y = p.baseY;
            p.scaleX = 1.35;
            p.scaleY = .68;
        } else if (stage === "dizzy_wake") {
            p.y = p.baseY + 12;
            p.scaleX = 1.45;
            p.scaleY = .55;
        } else if (stage === "realization_panic") {
            p.y = p.baseY - Math.max(0, Math.sin(t * .1) * 12);
            p.scaleX = 1;
            p.scaleY = 1;
        }
        const cx = p.x + p.w / 2;
        const cy = p.y + p.h;
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.beginPath();
        ctx.ellipse(cx, p.baseY + p.h - 1, p.w * .6 * p.scaleX, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.translate(cx, cy);
        ctx.scale(p.scaleX, p.scaleY);
        ctx.translate(-cx, -cy);
        const pGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
        pGrad.addColorStop(0, "#ff99cc");
        pGrad.addColorStop(1, "#ff3388");
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.w, p.h, 9);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.ellipse(p.x + p.w * .35, p.y + 6, p.w * .28, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 102, 170, 0.6)";
        ctx.beginPath();
        ctx.ellipse(p.x + 6, p.y + p.h * .55, 3.5, 2, 0, 0, Math.PI * 2);
        ctx.ellipse(p.x + p.w - 6, p.y + p.h * .55, 3.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        const eyeY = p.y + p.h * .38;
        if (p.isDizzy) {
            ctx.strokeStyle = "#111111";
            ctx.lineWidth = 2.2;
            for (let side of [ p.x + 9, p.x + p.w - 9 ]) {
                ctx.beginPath();
                for (let a = 0; a < Math.PI * 3.5; a += .25) {
                    const r = a * 1.1;
                    const sx = side + Math.cos(a + dizzyAngle * 2) * r;
                    const sy = eyeY + Math.sin(a + dizzyAngle * 2) * r * .7;
                    if (a === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
                }
                ctx.stroke();
            }
            ctx.beginPath();
            ctx.moveTo(p.x + 11, p.y + p.h * .75);
            ctx.quadraticCurveTo(p.x + 16, p.y + p.h * .7, p.x + p.w / 2, p.y + p.h * .75);
            ctx.quadraticCurveTo(p.x + 21, p.y + p.h * .8, p.x + p.w - 11, p.y + p.h * .75);
            ctx.stroke();
        } else if (p.isShocked) {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(p.x + 9, eyeY, 5.5, 0, Math.PI * 2);
            ctx.arc(p.x + p.w - 9, eyeY, 5.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#111111";
            ctx.beginPath();
            ctx.arc(p.x + 9, eyeY, 2, 0, Math.PI * 2);
            ctx.arc(p.x + p.w - 9, eyeY, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#661111";
            ctx.beginPath();
            ctx.ellipse(p.x + p.w / 2, p.y + p.h * .74, 4, 5.5, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (stage === "portal_open" || stage === "enter_portal") {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(p.x + 9, eyeY, 5, 0, Math.PI * 2);
            ctx.arc(p.x + p.w - 9, eyeY, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#0284c7";
            ctx.beginPath();
            ctx.arc(p.x + 11, eyeY, 2.8, 0, Math.PI * 2);
            ctx.arc(p.x + p.w - 7, eyeY, 2.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#111111";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(p.x + 5, eyeY - 6);
            ctx.lineTo(p.x + 12, eyeY - 4);
            ctx.moveTo(p.x + p.w - 5, eyeY - 4);
            ctx.lineTo(p.x + p.w - 12, eyeY - 6);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(p.x + p.w * .55, p.y + p.h * .7, 4, 0, Math.PI * .8);
            ctx.stroke();
        } else {
            ctx.strokeStyle = "#111111";
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.arc(p.x + 9, eyeY, 4, .1 * Math.PI, .9 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(p.x + p.w - 9, eyeY, 4, .1 * Math.PI, .9 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(p.x + p.w / 2, p.y + p.h * .66, 4.5, 0, Math.PI);
            ctx.stroke();
        }
        ctx.restore();
        if (p.isDizzy) {
            drawDizzyOrbitStars(ctx, cx, p.baseY - 5, dizzyAngle);
        }
    }
    function drawDizzyOrbitStars(ctx, hx, hy, angle) {
        ctx.save();
        const numStars = 4;
        const radiusX = 32;
        const radiusY = 9;
        for (let i = 0; i < numStars; i++) {
            const a = angle + i * (Math.PI * 2 / numStars);
            const sx = hx + Math.cos(a) * radiusX;
            const sy = hy + Math.sin(a) * radiusY;
            const isBehind = Math.sin(a) < 0;
            const starScale = isBehind ? .75 : 1.1;
            ctx.save();
            ctx.translate(sx, sy);
            ctx.scale(starScale, starScale);
            ctx.rotate(angle * 3 + i);
            ctx.fillStyle = "#ffea00";
            ctx.shadowColor = "#fff566";
            ctx.shadowBlur = 8;
            ctx.beginPath();
            for (let p = 0; p < 5; p++) {
                const rot = p * Math.PI / 2.5 - Math.PI / 2;
                const rOut = 5;
                const rIn = 2.2;
                ctx.lineTo(Math.cos(rot) * rOut, Math.sin(rot) * rOut);
                const rotIn = rot + Math.PI / 5;
                ctx.lineTo(Math.cos(rotIn) * rIn, Math.sin(rotIn) * rIn);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    }
    function drawCosmicPortal(ctx, portal, t) {
        ctx.save();
        portal.scale += (portal.targetScale - portal.scale) * .08;
        portal.angle += .04;
        const px = portal.x;
        const py = portal.y;
        const baseR = 56 * portal.scale;
        if (baseR < 2) {
            ctx.restore();
            return;
        }
        const auraGrad = ctx.createRadialGradient(px, py, baseR * .4, px, py, baseR * 1.6);
        auraGrad.addColorStop(0, "rgba(168, 85, 247, 0.45)");
        auraGrad.addColorStop(.5, "rgba(56, 189, 248, 0.25)");
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(px, py, baseR * 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(portal.angle);
        for (let i = 0; i < 3; i++) {
            ctx.strokeStyle = i % 2 === 0 ? "#a855f7" : "#38bdf8";
            ctx.lineWidth = 3.5 - i;
            ctx.shadowColor = "#c084fc";
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.ellipse(0, 0, baseR * (.9 - i * .2), baseR * (1.1 - i * .2), i * Math.PI / 3, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.fillStyle = "#060212";
        ctx.beginPath();
        ctx.arc(0, 0, baseR * .65, 0, Math.PI * 2);
        ctx.fill();
        const coreGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, baseR * .6);
        coreGrad.addColorStop(0, "#ffffff");
        coreGrad.addColorStop(.3, "#c084fc");
        coreGrad.addColorStop(.8, "#7e22ce");
        coreGrad.addColorStop(1, "rgba(6, 2, 18, 0.9)");
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(0, 0, baseR * .6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        if (Math.random() < .4) {
            const pAngle = Math.random() * Math.PI * 2;
            const pDist = baseR * (1.2 + Math.random() * .8);
            portal.particles.push({
                x: px + Math.cos(pAngle) * pDist,
                y: py + Math.sin(pAngle) * pDist,
                life: 30,
                color: Math.random() > .5 ? "#e9d5ff" : "#7dd3fc"
            });
        }
        portal.particles.forEach(pt => {
            ctx.fillStyle = pt.color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
            ctx.fill();
            pt.x += (px - pt.x) * .12;
            pt.y += (py - pt.y) * .12;
            pt.life--;
        });
        portal.particles = portal.particles.filter(pt => pt.life > 0);
        ctx.restore();
    }
    function renderCurrentBubble(ctx, text, s) {
        if (!text) return;
        let bx = VIEW_W / 2;
        let by = 130;
        let bubbleW = 540;
        let tailX = null;
        let tailY = null;
        let speakerName = null;
        let speakerColor = "#ff3388";
        let isDark = s.blackoutAlpha > .5;
        switch (s.stage) {
          case "peace_playing":
            bx = VIEW_W / 2;
            by = 110;
            bubbleW = 560;
            speakerName = "★ StarCube";
            speakerColor = "#3b82f6";
            break;

          case "earthquake_shock":
            if (s.dialogueStep === 0) {
                bx = 540;
                by = 310;
                bubbleW = 340;
                tailX = s.friends[1].x + 14;
                tailY = s.friends[1].y - 2;
                speakerName = "Minti";
                speakerColor = "#10b981";
            } else {
                bx = 340;
                by = 310;
                bubbleW = 320;
                tailX = s.friends[0].x + 14;
                tailY = s.friends[0].y - 2;
                speakerName = "Pinky";
                speakerColor = "#ec4899";
            }
            break;

          case "blackout_panic":
            if (s.dialogueStep === 0) {
                bx = 320;
                by = 220;
                bubbleW = 380;
                speakerName = "Sunny";
                speakerColor = "#f59e0b";
            } else {
                bx = VIEW_W / 2;
                by = 280;
                bubbleW = 440;
                speakerName = "¡AMIGOS!";
                speakerColor = "#ef4444";
            }
            break;

          case "dark_silence":
            bx = VIEW_W / 2;
            by = 270;
            bubbleW = 380;
            speakerName = "Peggy";
            speakerColor = "#ec4899";
            break;

          case "dizzy_wake":
            bx = s.peggy.x + 16;
            by = 280;
            bubbleW = 420;
            tailX = s.peggy.x + 16;
            tailY = s.peggy.y - 10;
            speakerName = "Peggy";
            speakerColor = "#ec4899";
            break;

          case "realization_panic":
            bx = s.peggy.x + 16;
            by = 270;
            bubbleW = 380;
            tailX = s.peggy.x + 16;
            tailY = s.peggy.y - 6;
            speakerName = "Peggy";
            speakerColor = "#ec4899";
            break;

          case "portal_open":
            bx = 420;
            by = 260;
            bubbleW = 440;
            tailX = s.peggy.x + 20;
            tailY = s.peggy.y - 6;
            speakerName = "Peggy";
            speakerColor = "#ec4899";
            break;

          default:
            break;
        }
        drawComicBubble(ctx, text, bx, by, bubbleW, {
            tailX: tailX,
            tailY: tailY,
            speakerName: speakerName,
            speakerColor: speakerColor,
            isDark: isDark,
            isFinished: s.charIdx >= (getCurrentText() || "").length
        });
    }
    function drawComicBubble(ctx, text, cx, cy, maxW, opts) {
        ctx.save();
        const fontSize = 18;
        const lineHeight = 26;
        const padX = 22;
        const padY = 16;
        ctx.font = 'bold 18px "Fredoka One", "Courier Prime", cursive, sans-serif';
        const words = text.split(" ");
        const lines = [];
        let curLine = "";
        const contentMaxW = maxW - padX * 2;
        for (let i = 0; i < words.length; i++) {
            const testLine = curLine ? curLine + " " + words[i] : words[i];
            const metrics = ctx.measureText(testLine);
            if (metrics.width > contentMaxW && curLine) {
                lines.push(curLine);
                curLine = words[i];
            } else {
                curLine = testLine;
            }
        }
        if (curLine) lines.push(curLine);
        const textH = lines.length * lineHeight;
        const bubbleH = textH + padY * 2 + (opts.speakerName ? 16 : 0);
        const bubbleW = maxW;
        const bx = Math.max(20, Math.min(cx - bubbleW / 2, VIEW_W - bubbleW - 20));
        const by = cy - bubbleH / 2;
        ctx.shadowColor = opts.isDark ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.25)";
        ctx.shadowBlur = opts.isDark ? 16 : 10;
        ctx.shadowOffsetY = opts.isDark ? 0 : 4;
        ctx.fillStyle = opts.isDark ? "#f8fafc" : "#ffffff";
        ctx.beginPath();
        ctx.roundRect(bx, by, bubbleW, bubbleH, 16);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.strokeStyle = opts.speakerColor || "#a855f7";
        ctx.lineWidth = 3;
        ctx.stroke();
        if (opts.tailX != null && opts.tailY != null) {
            const tailRootX = Math.max(bx + 25, Math.min(opts.tailX, bx + bubbleW - 25));
            const tailRootY = opts.tailY > by + bubbleH ? by + bubbleH : by;
            ctx.fillStyle = ctx.fillStyle;
            ctx.strokeStyle = opts.speakerColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(tailRootX - 10, tailRootY - 1);
            ctx.lineTo(opts.tailX, opts.tailY);
            ctx.lineTo(tailRootX + 10, tailRootY - 1);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(tailRootX - 9, tailRootY - 3, 18, 5);
        }
        let startTextY = by + padY + 18;
        if (opts.speakerName) {
            ctx.font = 'bold 13px "Fredoka One", sans-serif';
            ctx.fillStyle = opts.speakerColor;
            ctx.textAlign = "left";
            ctx.fillText(opts.speakerName.toUpperCase(), bx + padX, by + padY + 8);
            startTextY += 14;
        }
        ctx.font = '18px "Fredoka One", "Courier Prime", cursive, sans-serif';
        ctx.fillStyle = "#1e1b4b";
        ctx.textAlign = "left";
        lines.forEach((line, i) => {
            ctx.fillText(line, bx + padX, startTextY + i * lineHeight);
        });
        if (opts.isFinished) {
            ctx.font = 'bold 12px "Courier Prime", monospace';
            ctx.fillStyle = "rgba(79, 70, 229, 0.65)";
            ctx.textAlign = "right";
            const promptText = (typeof window !== "undefined" && (window.isMobileDevice || window.isMobileOrTouch?.())) ? "▼ [TOCA LA PANTALLA]" : "▼ [ESPACIO]";
            ctx.fillText(promptText, bx + bubbleW - padX, by + bubbleH - 8);
        }
        ctx.restore();
    }
    window.startIntroCinematic = startIntroCinematic;
    window.updateAndDrawIntro = updateAndDrawIntro;
    window.handleIntroInput = handleIntroInput;
})();
// Isaac Daniel Cotera - 2026 | Correo: isaacdanielcotera@gmail.com | Itch.io: https://cotera.itch.io | GitHub: https://github.com/cotera2024
