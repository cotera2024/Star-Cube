(function() {
    "use strict";

    let introState = null;
    let introSkipBound = false;

    const INITIAL_FRIENDS = [
        { id: "azulin", name: typeof __ !== "undefined" ? __("name_azulin") : "Azulín", colorTop: "#7dd3fc", colorBot: "#0284c7", x: 440, baseY: 438, y: 438, w: 30, h: 30, facing: -1, hopOffset: 0.2, pair: 1, shout: "intro_shout_azulin", accessory: null },
        { id: "verdecito", name: typeof __ !== "undefined" ? __("name_verdecito") : "Verdecito", colorTop: "#86efac", colorBot: "#16a34a", x: 490, baseY: 438, y: 438, w: 30, h: 30, facing: -1, hopOffset: 1.4, pair: 2, shout: "intro_shout_verdecito", accessory: "cap" },
        { id: "amarillin", name: typeof __ !== "undefined" ? __("name_amarillin") : "Amarillín", colorTop: "#fde047", colorBot: "#ca8a04", x: 540, baseY: 438, y: 438, w: 30, h: 30, facing: -1, hopOffset: 2.1, pair: 3, shout: "intro_shout_amarillin", accessory: null },
        { id: "moradito", name: typeof __ !== "undefined" ? __("name_moradito") : "Moradito", colorTop: "#d8b4fe", colorBot: "#7c3aed", x: 590, baseY: 438, y: 438, w: 30, h: 30, facing: -1, hopOffset: 0.8, pair: 4, shout: "intro_shout_moradito", accessory: "bow" },
        { id: "naranjita", name: typeof __ !== "undefined" ? __("name_naranjita") : "Naranjita", colorTop: "#fdba74", colorBot: "#ea580c", x: 640, baseY: 438, y: 438, w: 30, h: 30, facing: -1, hopOffset: 1.9, pair: 5, shout: "intro_shout_naranjita", accessory: "headband" }
    ];

    function startIntroCinematic() {
        try { const lb = document.getElementById("btn-lang-toggle"); if (lb) lb.style.display = "none"; } catch(e){}
        try { const de = document.getElementById("btn-desktop-exit"); if (de) de.style.display = "none"; } catch(e){}
        introState = {
            stage: "scene1_exterior",
            timer: 0,
            simSpeed: 1.0,
            cameraX: 0,
            cameraY: 0,
            blackoutAlpha: 0,
            whiteFlash: 0,
            speechBubble: null,
            speechTimer: 0,
            houseZoom: 1.0,
            houseOffX: 0, houseOffY: 0,
            hugeText: null,
            cloud: { active: false, x: 0, y: 0, scale: 1, inhale: 0, mood: "normal" },
            smokeAlpha: 1.0,
            craterFire: 1.0,
            isBlackSmoke: false,
            rainDrops: [],
            peggy: {
                x: 250,
                y: 436,
                baseY: 436,
                w: 32,
                h: 32,
                scaleX: 1,
                scaleY: 1,
                facing: 1,
                vx: 0,
                vy: 0,
                headphones: false,
                headphonesLost: false,
                hpX: 0, hpY: 0, hpRot: 0, hpVx: 0, hpVy: 0,
                mood: "sleeping",
                notes: []
            },
            friends: INITIAL_FRIENDS.map(f => ({
                ...f,
                scaleX: 1, scaleY: 1, vx: 0, vy: 0, rot: 0,
                mood: "idle", suckedTimer: 0, screamText: null
            })),
            comet: { active: false, x: 0, y: 0, vx: 0, vy: 0, trail: [] },
            crystal: { active: false, x: 650, y: 440, yOffset: 0, glow: 0 },
            portal: {
                active: false,
                x: 750,
                y: 240,
                scale: 0,
                targetScale: 1.2,
                rotation: 0,
                pullStrength: 0,
                particles: [],
                sparks: []
            },
            floatingEmotes: [],
            windParticles: []
        };

        try {
            if (typeof playBGM === "function") {
                playBGM("bgm_cinematic_intro");
            }
        } catch (e) {}

        setupIntroSkipButton();
        gameState = "introStory";
    }

    function setupIntroSkipButton() {
        const btn = document.getElementById("intro-skip-btn");
        if (!btn) return;
        btn.style.display = "block";
        if (typeof __ === "function") {
            btn.textContent = (__("ui_intro_skip_btn") || "SALTAR") + " ⏭️";
        } else {
            btn.textContent = "SALTAR ⏭️";
        }
        if (introSkipBound) return;
        introSkipBound = true;
        let lastTouch = 0;
        const doSkip = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            if (Date.now() - lastTouch < 500) return;
            lastTouch = Date.now();
            finishIntro();
        };
        btn.addEventListener("touchstart", doSkip, { passive: false });
        btn.addEventListener("click", doSkip);
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
            const s = introState;
            if (s.speechBubble) {
                s.timer += 50;
            } else if (s.spikyBubble) {
                s.timer = 155;
            } else {
                s.timer += 20;
            }
        }
    }

    function finishIntro() {
        try { hideIntroSkipButton(); } catch (e) {}
        try { const lb = document.getElementById("btn-lang-toggle"); if (lb) lb.style.display = "none"; } catch(e){}
        try { const de = document.getElementById("btn-desktop-exit"); if (de) de.style.display = "none"; } catch(e){}
        try {
            if (typeof window.storageSet === "function") {
                window.storageSet("starcube_intro_seen", "true");
            } else {
                localStorage.setItem("starcube_intro_seen", "true");
            }
        } catch (e) {}
        try {
            if (typeof currentBGM !== "undefined" && currentBGM && typeof audios !== "undefined" && currentBGM === audios.bgm_cinematic_intro) {
                currentBGM.pause();
                currentBGM.currentTime = 0;
            }
        } catch (e) {}
        introState = null;
        gameState = "playing";
        if (typeof window.loadHubLevel === "function") {
            window.loadHubLevel(0);
        } else if (typeof loadHubLevel === "function") {
            loadHubLevel(0);
        }
        if (typeof window.showAnimatedMessage === "function") {
            window.showAnimatedMessage((typeof __ === "function" ? __("ui_hub_title") : null) || "Cuarto de Puertas");
        }
    }

    function updateAndDrawIntro(ctx, t) {
        if (!introState) {
            startIntroCinematic();
        }
        const s = introState;
        s.timer++;

        let targetCamX = 0;
        let targetCamY = 0;

        const p = s.peggy;
        const port = s.portal;

        if (s.stage === "scene1_exterior" || s.stage === "scene1_interior") {
            targetCamX = 0;
        } else if (s.stage === "scene3_crater" || s.stage === "crystal_approach" || s.stage === "crystal_lift" || s.stage === "crystal_explode" || s.stage === "crater_intro" || s.stage === "crater_friends_arrive") {
            targetCamX = Math.max(0, 500 - VIEW_W / 2); 
        } else if (s.stage === "portal_close_sky") {
            targetCamX = 650 - VIEW_W / 2;
            targetCamY = -260;
        } else if (s.stage === "walk_to_friends") {
            targetCamX = Math.max(0, p.x - VIEW_W * 0.38);
        } else {
            targetCamX = Math.max(0, Math.min(p.x - VIEW_W * 0.38, 900 - VIEW_W));
        }

        s.cameraX += (targetCamX - s.cameraX) * 0.08;
        s.cameraY += (targetCamY - s.cameraY) * 0.08;

        if (s.stage === "scene1_exterior") {
            if (s.timer > 170) { 
                s.houseZoom += (4.5 - s.houseZoom) * 0.038; 
            }
            if (s.timer > 245) {
                s.stage = "scene1_interior";
                s.timer = 0;
            }
        }

        else if (s.stage === "scene1_interior") {
            if (s.timer === 1) {
                p.x = 210; p.y = 368; p.vy = 0;
                s.cameraX = 0;
                s.spikyBubble = null;
            }
            if (s.timer % 15 === 0 && s.timer < 120) {
                p.notes.push({
                    x: p.x + 16, y: p.y - 12,
                    symbol: "Z", color: "#94a3b8",
                    vx: 0.3 + Math.random() * 0.3, vy: -0.6, rot: 0, alpha: 1
                });
            }
            if (s.timer >= 120 && s.timer < 155) {
                s.spikyBubble = { text: __("intro_wake_up"), x: 450, y: 220 };
            }
            if (s.timer === 155) {
                p.mood = "shocked";
                s.spikyBubble = null;
                try { playSound(200, .4, "square", .1, 20); } catch(e){}
            }
            if (s.timer === 170) {
                p.mood = "idle";
                p.headphones = true;
                try { playSound(600, .3, "sine", .1, 10); } catch(e){}
            }
            if (s.timer === 180) {
                p.vy = -6.5;
                p.mood = "walking";
            }
            if (s.timer > 180) {
                if (p.y < p.baseY) {
                    p.vy += 0.9;
                    p.y += p.vy;
                    if (p.y >= p.baseY) { p.y = p.baseY; p.vy = 0; }
                } else {
                    p.x += 18.0;
                    const walkBounce = Math.abs(Math.sin(s.timer * 0.56));
                    p.y = p.baseY - walkBounce * 6;
                    p.scaleX = 1 + walkBounce * 0.08;
                    p.scaleY = 1 - walkBounce * 0.08;
                }
                
                if (p.x >= 750) {
                    s.stage = "walk_to_friends";
                    s.timer = 0;
                    s.blackoutAlpha = 1.0;
                    p.x = -40;
                }
            }
        }

        else if (s.stage === "walk_to_friends") {
            s.blackoutAlpha -= 0.05;
            p.mood = "walking";
            p.x += 4.5;
            const walkBounce = Math.abs(Math.sin(s.timer * 0.25));
            p.y = p.baseY - walkBounce * 6;
            p.scaleX = 1 + walkBounce * 0.08;
            p.scaleY = 1 - walkBounce * 0.08;

            if (s.timer % 24 === 0) {
                p.notes.push({
                    x: p.x + 16, y: p.y - 12,
                    symbol: ["♪", "♫", "♬", "♩"][Math.floor(Math.random() * 4)],
                    color: ["#38bdf8", "#f472b6", "#a855f7", "#fbbf24"][Math.floor(Math.random() * 4)],
                    vx: (Math.random() - 0.5) * 1.2 - 0.8, vy: -1.4 - Math.random() * 0.8, rot: 0, alpha: 1
                });
            }

            s.friends.forEach(f => {
                f.mood = "happy";
                f.y = f.baseY - Math.abs(Math.sin(s.timer * 0.08 + f.hopOffset)) * 5;
            });

            if (p.x >= 370) {
                p.x = 370;
                s.stage = "jamming";
                s.timer = 0;
            }
        }

        else if (s.stage === "jamming") {
            p.mood = "dancing";
            const hopP = Math.sin(s.timer * 0.22);
            if (hopP > 0) {
                p.y = p.baseY - hopP * 28;
                p.scaleX = 0.88; p.scaleY = 1.15;
            } else {
                p.y = p.baseY;
                p.scaleX = 1 + Math.abs(hopP) * 0.2; p.scaleY = 1 - Math.abs(hopP) * 0.2;
            }

            s.friends.forEach(f => {
                f.mood = "dancing";
                const fHop = Math.sin(s.timer * 0.22 + f.hopOffset * 1.5);
                if (fHop > 0) {
                    f.y = f.baseY - fHop * (22 + (f.pair % 3) * 6);
                    f.scaleX = 0.9; f.scaleY = 1.12;
                } else {
                    f.y = f.baseY;
                    f.scaleX = 1 + Math.abs(fHop) * 0.15; f.scaleY = 1 - Math.abs(fHop) * 0.15;
                }
            });

            if (s.timer % 12 === 0) {
                const randFriend = s.friends[Math.floor(Math.random() * s.friends.length)];
                s.floatingEmotes.push({
                    x: randFriend.x + 14, y: randFriend.y - 10,
                    symbol: ["♪", "♫", "♬", "⭐", "✨", "💖"][Math.floor(Math.random() * 6)],
                    color: ["#f472b6", "#38bdf8", "#fbbf24", "#4ade80", "#c084fc"][Math.floor(Math.random() * 5)],
                    vx: (Math.random() - 0.5) * 2, vy: -1.8 - Math.random() * 1.5, alpha: 1
                });
            }

            if (s.timer >= 120) {
                s.stage = "comet_fly";
                s.timer = 0;
                s.comet.active = true;
                s.comet.x = -100;
                s.comet.y = 120;
                s.comet.vx = 45;
                s.comet.vy = 5;
                try { playSound(900, .5, "sine", .5, 50); } catch(e){}
            }
        }

        else if (s.stage === "comet_fly") {
            p.mood = "shocked";
            p.y = p.baseY; p.scaleX = 1; p.scaleY = 1;
            s.friends.forEach(f => { f.mood = "shocked"; f.y = f.baseY; f.scaleX = 1; f.scaleY = 1; });
            
            s.comet.x += s.comet.vx;
            s.comet.y += s.comet.vy;
            s.comet.trail.push({x: s.comet.x, y: s.comet.y, alpha: 1});
            
            if (s.comet.x > VIEW_W + 300) {
                s.stage = "comet_crash";
                s.timer = 0;
                s.comet.active = false;
                s.whiteFlash = 0.8;
                try { playSound(80, 1.0, "sawtooth", 1.0, 150); } catch(e){}
            }
        }

        else if (s.stage === "comet_crash") {
            if (s.timer < 45) {
                s.speechBubble = { text: __("intro_hub_friends_1"), x: 500, y: 380, color: "#ea580c" };
            } else {
                s.speechBubble = null;
                p.mood = "walking";
                p.facing = 1;
                p.x += 10.0;
                p.y = p.baseY - Math.abs(Math.sin(s.timer * 0.4)) * 8;
                s.friends.forEach(f => {
                    f.mood = "walking";
                    f.facing = 1;
                    f.x += 10.0;
                    f.y = f.baseY - Math.abs(Math.sin(s.timer * 0.4 + f.hopOffset)) * 8;
                });
                
                if (p.x > 750 || s.timer > 90) {
                    s.stage = "crater_intro";
                    s.timer = 0;
                    s.blackoutAlpha = 0.7;
                    
                    s.crystal.active = false;
                    s.crystal.x = 650;
                    s.crystal.y = 440;
                    s.craterFire = 1.0;
                    s.isBlackSmoke = false;
                    s.smokeAlpha = 1.0;
                    s.rainDrops = [];
                    
                    p.x = -60; p.facing = 1; p.y = p.baseY;
                    s.friends.forEach((f, i) => { f.x = -40 - i * 22; f.facing = 1; f.y = f.baseY; });
                    
                    s.cloud.active = true;
                    s.cloud.x = 880; s.cloud.y = -60;
                    s.cloud.scale = 1;
                    s.cloud.mood = "normal";
                }
            }
        }

        else if (s.stage === "crater_intro") {
            s.blackoutAlpha -= 0.06;
            if (s.blackoutAlpha < 0) s.blackoutAlpha = 0;
            
            if (s.timer < 120) {
                s.craterFire = 1.0;
                s.cloud.y = -80;
                s.cloud.x = 880;
            }
            else if (s.timer < 185) {
                s.cloud.mood = "normal";
                s.cloud.x += (650 - s.cloud.x) * 0.05;
                s.cloud.y += (310 - s.cloud.y) * 0.05;
                s.craterFire = 1.0;
            }
            else if (s.timer < 285) {
                s.cloud.mood = "straining";
                s.cloud.x = 650 + Math.sin(s.timer * 0.5) * 3;
                s.cloud.y = 310;
                
                for (let rn = 0; rn < 3; rn++) {
                    s.rainDrops.push({
                        x: s.cloud.x + (Math.random() - 0.5) * 60,
                        y: s.cloud.y + 22,
                        vx: (Math.random() - 0.5) * 1,
                        vy: 11 + Math.random() * 4,
                        len: 8 + Math.random() * 5
                    });
                }

                s.craterFire -= 0.012;
                if (s.craterFire <= 0) {
                    s.craterFire = 0;
                    s.isBlackSmoke = true;
                }
            }
            else if (s.timer < 330) {
                s.cloud.mood = "normal";
                s.cloud.x += (510 - s.cloud.x) * 0.08;
                s.cloud.y += (390 - s.cloud.y) * 0.08;
            }
            else if (s.timer < 400) {
                s.cloud.mood = "blowing";
                s.smokeAlpha -= 0.022;
                if (s.smokeAlpha < 0) s.smokeAlpha = 0;

                if (s.smokeAlpha < 0.6) s.crystal.active = true;
                s.crystal.glow = Math.min(1.0, (s.crystal.glow || 0) + 0.025);
                s.crystal.yOffset = (s.crystal.yOffset || 0) - 0.35;
                
                if (s.timer % 2 === 0) {
                    s.windParticles.push({
                        x: s.cloud.x + 24,
                        y: s.cloud.y + 12 + (Math.random() - 0.5) * 22,
                        vx: 12 + Math.random() * 6,
                        vy: 1 + (Math.random() - 0.5) * 3,
                        alpha: 0.9
                    });
                }
            }
            else {
                s.cloud.mood = "happy";
                s.cloud.y -= 6.5;
                s.cloud.x += 3.5;

                if (s.cloud.y < -120) {
                    s.cloud.active = false;
                    s.stage = "crater_friends_arrive";
                    s.timer = 0;
                    
                    p.x = 40; p.y = p.baseY; p.facing = 1; p.mood = "walking";
                    s.friends.forEach((f, i) => {
                        f.x = 70 + i * 22;
                        f.y = f.baseY;
                        f.facing = 1;
                        f.mood = "walking";
                    });
                }
            }
        }
        
        else if (s.stage === "crater_friends_arrive") {
            let allArrived = true;

            if (p.x < 250) {
                p.mood = "walking";
                p.x = Math.min(250, p.x + 4.2);
                const pBounce = Math.abs(Math.sin(s.timer * 0.25));
                p.y = p.baseY - pBounce * 6;
                p.scaleX = 1 + pBounce * 0.08;
                p.scaleY = 1 - pBounce * 0.08;
                if (p.x < 250) allArrived = false;
            } else {
                p.mood = "idle";
                p.y = p.baseY;
                p.scaleX = 1; p.scaleY = 1;
            }

            s.friends.forEach((f, i) => {
                const target = 300 + i * 35;
                if (f.x < target) {
                    f.mood = "walking";
                    f.facing = 1;
                    f.x = Math.min(target, f.x + 4.2);
                    const fBounce = Math.abs(Math.sin(s.timer * 0.25 + f.hopOffset));
                    f.y = f.baseY - fBounce * 6;
                    f.scaleX = 1 + fBounce * 0.08;
                    f.scaleY = 1 - fBounce * 0.08;
                    if (f.x < target) allArrived = false;
                } else {
                    f.mood = "idle";
                    f.y = f.baseY;
                    f.scaleX = 1; f.scaleY = 1;
                }
            });

            if (allArrived || s.timer > 120) {
                p.mood = "idle";
                p.y = p.baseY;
                s.friends.forEach((f, i) => { f.mood = "idle"; f.x = 300 + i * 35; f.y = f.baseY; });
                s.stage = "scene3_crater";
                s.timer = 0;
            }
        }

        else if (s.stage === "scene3_crater") {
            s.blackoutAlpha -= 0.05;
            p.mood = "idle";
            p.y = p.baseY;
            s.friends.forEach(f => { f.mood = "idle"; f.y = f.baseY; });

            if (s.timer === 60) {
                s.speechBubble = { text: __("intro_hub_friends_2"), x: s.friends[1].x, y: 380, color: "#16a34a" };
            } else if (s.timer === 150) {
                s.speechBubble = { text: __("intro_hub_friends_3"), x: p.x, y: 380, color: "#f43f5e" };
            } else if (s.timer === 260) {
                s.speechBubble = { text: __("intro_hub_friends_4"), x: s.friends[2].x, y: 380, color: "#ca8a04" };
            } else if (s.timer > 350) {
                s.speechBubble = null;
                s.stage = "crystal_approach";
                s.timer = 0;
            }
        }

        else if (s.stage === "crystal_approach") {
            const f1 = s.friends[0]; const f2 = s.friends[1]; const f3 = s.friends[2];
            let done = 0;
            if (f1.x < 620) { f1.mood = "walking"; f1.x += 1.5; f1.y = f1.baseY - Math.abs(Math.sin(s.timer*0.3))*4; } else { f1.mood = "idle"; f1.y = f1.baseY; done++; }
            if (f2.x < 650) { f2.mood = "walking"; f2.x += 1.5; f2.y = f2.baseY - Math.abs(Math.sin(s.timer*0.3))*4; } else { f2.mood = "idle"; f2.y = f2.baseY; done++; }
            if (f3.x < 680) { f3.mood = "walking"; f3.x += 1.5; f3.y = f3.baseY - Math.abs(Math.sin(s.timer*0.3))*4; } else { f3.mood = "idle"; f3.y = f3.baseY; f3.facing = -1; done++; }
            
            for (let i = 3; i < s.friends.length; i++) {
                const fr = s.friends[i];
                const targetX = 240 + (i-3) * 32; 
                if (fr.x > targetX) {
                    fr.mood = "walking";
                    fr.facing = -1; 
                    fr.x -= 1.0;
                    fr.y = fr.baseY - Math.abs(Math.sin(s.timer*0.3))*3;
                } else {
                    fr.mood = "shocked";
                    fr.facing = 1; 
                    fr.y = fr.baseY;
                }
            }

            if (p.x > 200) {
                p.mood = "walking";
                p.facing = -1;
                p.x -= 1.0;
                p.y = p.baseY - Math.abs(Math.sin(s.timer*0.3))*3;
            } else {
                p.mood = "shocked";
                p.facing = 1;
                p.y = p.baseY;
            }

            if (done === 3 && s.timer > 80) {
                s.stage = "crystal_lift";
                s.timer = 0;
            }
        }

        else if (s.stage === "crystal_lift") {
            s.crystal.yOffset -= 0.6;
            s.crystal.glow += 0.05;
            
            p.mood = "shocked";
            s.friends.forEach(f => f.mood = "shocked");

            if (s.timer === 40) {
                s.speechBubble = { text: __("intro_hub_friends_5"), x: 500, y: 360, color: "#ffffff" };
            }
            if (s.timer > 140) {
                s.speechBubble = null;
                s.stage = "crystal_explode";
                s.timer = 0;
                try { playSound(200, .8, "sawtooth", 1.0, 80); } catch(e){}
            }
        }

        else if (s.stage === "crystal_explode") {
            s.crystal.glow += 0.3;
            if (s.timer > 20) {
                s.whiteFlash = 1.0;
                s.crystal.active = false;
                s.stage = "portal_appear";
                s.timer = 0;
                
                port.active = true;
                port.x = s.crystal.x;
                port.y = s.crystal.y + s.crystal.yOffset;
                port.scale = 0;
                port.targetScale = 1.3;
                
                try { playSound(160, .8, "triangle", .9, 60); } catch(e){}
            }
        }

        else if (s.stage === "portal_appear") {
            port.scale += (port.targetScale - port.scale) * 0.08;
            port.rotation += 0.08;

            p.mood = "shocked";
            p.y = p.baseY; p.scaleX = 0.85; p.scaleY = 1.25;

            s.friends.forEach(f => {
                f.mood = "shocked"; f.y = f.baseY; f.scaleX = 0.85; f.scaleY = 1.22;
            });

            if (s.timer > 60) {
                s.stage = "vortex_pull";
                s.timer = 0;
                try { playSound(160, .8, "triangle", .9, 60); } catch(e){}
            }
        }

        else if (s.stage === "vortex_pull") {
            port.rotation += 0.12;
            port.pullStrength = Math.min(1, s.timer / 60);

            p.mood = "resisting";
            p.scaleX = 1.2; p.scaleY = 0.85;
            p.x = 250 + Math.sin(s.timer * 0.8) * 3;

            s.friends.forEach(f => {
                f.mood = "resisting";
                f.facing = -1;
                f.x += Math.sin(s.timer * 0.8 + f.hopOffset) * 2;
                f.scaleX = 1.15; f.scaleY = 0.85;
            });

            if (s.timer % 3 === 0) {
                s.windParticles.push({
                    x: Math.random() * 450 + 100, y: 340 + Math.random() * 140,
                    vx: 7 + Math.random() * 6, vy: (port.y - 410) * 0.04,
                    len: 20 + Math.random() * 30, alpha: 0.8
                });
            }

            if (s.timer >= 90) {
                s.stage = "suck_friends";
                s.timer = 0;
            }
        }

        else if (s.stage === "suck_friends") {
            port.rotation += 0.16;
            if (s.timer % 2 === 0) {
                s.windParticles.push({
                    x: Math.random() * 400 + 50, y: 320 + Math.random() * 160,
                    vx: 10 + Math.random() * 7, vy: (port.y - 410) * 0.05,
                    len: 30 + Math.random() * 35, alpha: 0.9
                });
            }

            p.mood = "resisting";
            p.x = 250 + Math.sin(s.timer * 0.9) * 4;

            const pairTimer = s.timer;
            let currentPair = 1;
            if (pairTimer > 210) currentPair = 5;
            else if (pairTimer > 150) currentPair = 4;
            else if (pairTimer > 95) currentPair = 3;
            else if (pairTimer > 45) currentPair = 2;
            else currentPair = 1;

            s.friends.forEach(f => {
                if (f.pair === currentPair && f.mood !== "sucked" && f.mood !== "gone") {
                    f.mood = "sucked";
                    f.screamText = typeof __ !== "undefined" ? __(f.shout) : f.shout;
                    try { playSound(420 + Math.random() * 200, .25, "sawtooth", .3, 850); } catch(e){}
                }
                if (f.mood === "sucked") {
                    f.suckedTimer = (f.suckedTimer || 0) + 1;
                    f.x += (port.x - f.x) * 0.14;
                    f.y += (port.y - f.y) * 0.14;
                    f.rot += 0.25;
                    f.scaleX *= 0.94; f.scaleY *= 0.94;
                    if (Math.hypot(port.x - f.x, port.y - f.y) < 18 || f.suckedTimer > 35) {
                        f.mood = "gone";
                        try { createExplosion(port.x, port.y, f.colorTop, 14, 10); } catch(e){}
                    }
                }
            });

            if (pairTimer >= 260) {
                s.stage = "peggy_struggle";
                s.timer = 0;
            }
        }

        else if (s.stage === "peggy_struggle") {
            port.rotation += 0.18;
            p.mood = "resisting";
            p.scaleX = 1.35; p.scaleY = 0.72;
            p.x = 250 + Math.sin(s.timer * 1.2) * 5;

            if (s.timer === 20) {
                s.speechBubble = { text: __("intro_hub_friends_6"), x: 250, y: 380, color: "#db2777" };
            }
            if (s.timer === 60) {
                s.speechBubble = null;
                port.targetScale = 1.85;
                try { playSound(90, .9, "sawtooth", 1.0, 30); } catch(e){}
            }
            port.scale += (port.targetScale - port.scale) * 0.1;

            if (s.timer >= 95) {
                s.stage = "peggy_sucked";
                s.timer = 0;
                s.simSpeed = 0.35;
                p.mood = "sucked";
                p.headphonesLost = true;
                p.hpX = p.x + 16; p.hpY = p.y + 10; p.hpVx = -1.2; p.hpVy = -3.5;
                try { playSound(520, .8, "sine", .9, 220); } catch(e){}
            }
        }

        else if (s.stage === "peggy_sucked") {
            port.rotation += 0.12 * s.simSpeed;

            p.hpX += p.hpVx * s.simSpeed;
            p.hpY += p.hpVy * s.simSpeed;
            p.hpVy += 0.15 * s.simSpeed;
            p.hpRot += 0.06 * s.simSpeed;

            const targetX = port.x - p.w / 2;
            const targetY = port.y - p.h / 2;
            const dx = targetX - p.x;
            const dy = targetY - p.y;
            const dist = Math.hypot(dx, dy);

            p.x += dx * 0.046;
            p.y += dy * 0.046;
            p.rotation = (p.rotation || 0) + 0.06;
            p.scaleX = Math.max(0.08, p.scaleX * 0.985);
            p.scaleY = Math.max(0.08, p.scaleY * 0.985);

            s.speechBubble = { text: __("intro_hub_friends_7"), x: p.x + p.w / 2, y: p.y - 25, color: "#f43f5e" };

            if (dist < 15 || s.timer >= 150) {
                s.simSpeed = 1.0;
                s.speechBubble = null;
                s.stage = "portal_close_sky";
                s.timer = 0;
                port.scale = 0;
                s.whiteFlash = 1.0;
                try {
                    playSound(180, .5, "triangle", .6, 40);
                    createExplosion(port.x, port.y, "#ffffff", 35, 20);
                } catch(e){}
            }
        }

        else if (s.stage === "portal_close_sky") {
            if (s.timer >= 45) {
                try {
                    if (typeof window.loadHubLevel === "function") {
                        window.loadHubLevel(0);
                    }
                } catch(e) {
                    console.warn("loadHubLevel during intro caught:", e);
                }
                gameState = "introStory";

                s.stage = "hub_portal_open";
                s.timer = 0;
                s.cameraX = 0;
                s.cameraY = 0;

                port.x = 240; port.y = 150; port.scale = 0; port.targetScale = 1.35; port.active = true;
                p.x = 240 - p.w / 2; p.y = 150; p.vx = 0.5; p.vy = -2.5;
                p.scaleX = 0.85; p.scaleY = 0.85; p.rotation = 0;
                p.mood = "gone";
                p.headphonesLost = true;
                try { playSound(90, .7, "sawtooth", .8, 45); } catch(e){}
            }
        }

        else if (s.stage === "hub_portal_open") {
            port.scale += (port.targetScale - port.scale) * 0.12;
            port.rotation += 0.12;
            if (s.timer >= 35) {
                s.stage = "hub_peggy_fall";
                s.timer = 0;
                p.mood = "sucked";
                p.x = port.x - p.w / 2;
                p.y = port.y;
                p.vx = 0.5;
                p.vy = -2.5;
                p.rotation = 0.2;
                s.speechBubble = { text: __("intro_peggy_falling"), x: p.x + p.w / 2, y: p.y - 25, color: "#f43f5e" };
                try { playSound(480, .7, "sine", .8, 160); } catch(e){}
            }
        }

        else if (s.stage === "hub_peggy_fall") {
            port.scale *= 0.88;
            if (port.scale < 0.05) port.active = false;
            p.vy += 0.48; p.y += p.vy; p.x += p.vx; p.rotation += 0.28;
            if (s.speechBubble) { s.speechBubble.x = p.x + p.w / 2; s.speechBubble.y = p.y - 25; }

            if (p.y >= 468) {
                p.y = 468; p.vy = 0; p.vx = 0; p.rotation = 0; p.mood = "dizzy";
                p.scaleX = 1.5; p.scaleY = 0.55;
                s.speechBubble = null;
                s.stage = "hub_peggy_dizzy";
                s.timer = 0;
                try {
                    playSound(70, .9, "square", .4, 30);
                    createExplosion(p.x + p.w / 2, p.y + p.h, "#cbd5e1", 20, 14);
                } catch(e){}
            }
        }

        else if (s.stage === "hub_peggy_dizzy") {
            p.scaleX += (1.0 - p.scaleX) * 0.14;
            p.scaleY += (1.0 - p.scaleY) * 0.14;
            if (s.timer === 30) {
                p.mood = "idle";
                s.speechBubble = { text: __("intro_hub_dialog_1"), x: p.x + 30, y: p.y - 25, color: "#94a3b8" };
            }
            if (s.timer === 110) {
                s.speechBubble = { text: __("intro_hub_dialog_2"), x: p.x + 30, y: p.y - 25, color: "#64748b" };
            }
            if (s.timer === 190) {
                s.speechBubble = { text: __("intro_hub_dialog_3"), x: p.x + 30, y: p.y - 25, color: "#3b82f6" };
            }
            if (s.timer === 280) {
                p.mood = "walking";
                p.facing = 1;
                s.speechBubble = { text: __("intro_hub_dialog_4"), x: p.x + 30, y: p.y - 25, color: "#22c55e" };
                try { playSound(580, .5, "sine", .5, 500); } catch(e){}
            }
            if (s.timer >= 350) {
                s.stage = "hub_dash_exit";
                s.timer = 0;
            }
        }

        else if (s.stage === "hub_dash_exit") {
            p.x += 24.0;
            const walkBounce = Math.abs(Math.sin(s.timer * 0.45));
            p.y = 468 - walkBounce * 8;
            if (s.speechBubble) { s.speechBubble.x = p.x + 30; }

            if (s.timer % 3 === 0) {
                s.floatingEmotes.push({
                    x: p.x - 5, y: 490,
                    symbol: "💨", color: "#cbd5e1",
                    vx: -3.0, vy: -0.5, alpha: 0.8
                });
            }

            if (p.x > 880 || s.timer > 32) {
                if (window.game && window.game.player) {
                    window.game.player.x = 240;
                    window.game.player.y = 468;
                    window.game.player.facing = 1;
                }
                finishIntro();
                return;
            }
        }

        let shakeX = 0;
        let shakeY = 0;
        if (s.stage === "comet_crash" && s.timer < 50) {
            shakeX = (Math.random() - 0.5) * 12; shakeY = (Math.random() - 0.5) * 12;
        } else if (s.stage === "crystal_explode" && s.timer > 10) {
            shakeX = (Math.random() - 0.5) * 6; shakeY = (Math.random() - 0.5) * 6;
        } else if (s.stage === "vortex_pull" || s.stage === "suck_friends") {
            shakeX = (Math.random() - 0.5) * 2; shakeY = (Math.random() - 0.5) * 2;
        } else if (s.stage === "peggy_struggle") {
            shakeX = (Math.random() - 0.5) * (4 + s.timer * 0.05); shakeY = (Math.random() - 0.5) * (4 + s.timer * 0.05);
        } else if (s.stage === "peggy_sucked" && s.timer < 30) {
            shakeX = (Math.random() - 0.5) * 8; shakeY = (Math.random() - 0.5) * 8;
        }

        let camScale = 1.0;
        const camPivotX = 300;
        const camPivotY = 320;
        if (s.stage === "scene1_exterior") {
            camScale = s.houseZoom || 1.0;
        }

        ctx.save();
        if (camScale > 1.0) {
            ctx.translate(camPivotX, camPivotY);
            ctx.scale(camScale, camScale);
            ctx.translate(-camPivotX, -camPivotY);
        }
        if (s.stage.startsWith("hub")) {
            if (typeof drawEnhancedBackground === "function") {
                const fakeGame = window.game || { isHub: true };
                drawEnhancedBackground(ctx, "hub", s.cameraX, t, fakeGame);
            }
        } else if (s.stage === "scene1_interior") {
            drawCinematicHouseInterior(ctx);
        } else {
            drawCinematicMeadowBackdrop(ctx, t, s.cameraX);
        }
        ctx.restore();

        ctx.save();
        if (camScale > 1.0) {
            ctx.translate(camPivotX, camPivotY);
            ctx.scale(camScale, camScale);
            ctx.translate(-camPivotX, -camPivotY);
        }
        ctx.translate(-s.cameraX + shakeX, -s.cameraY + shakeY);

        if (s.stage.startsWith("hub")) {
            if (window.game && Array.isArray(window.game.platforms)) {
                for (let pi = 0; pi < window.game.platforms.length; pi++) {
                    window.game.platforms[pi].draw(ctx, 0);
                }
            } else if (typeof Platform === "function") {
                const realFloor = new Platform({ x: 0, y: 500, w: 2300, h: 80, unbreakable: true });
                realFloor.draw(ctx, 0);
            }
            if (typeof window.renderHubDoors === "function") {
                window.renderHubDoors(ctx, 0, t);
            }
        } else {
            if (s.stage === "scene1_interior") {
                drawCinematicBed(ctx);
            } else {
                if (typeof Platform === "function") {
                    const fakeGround = new Platform({ x: -400, y: 466, w: 2800, h: VIEW_H });
                    fakeGround.draw(ctx, 0);
                }
            }
        }

        if (s.stage === "scene1_exterior") {
            drawCinematicHouseExterior(ctx);
        }

        if (s.stage.startsWith("crater_") || s.stage.startsWith("scene3_") || s.stage.startsWith("crystal_") || s.stage === "portal_appear" || s.stage === "vortex_pull" || s.stage === "suck_friends" || s.stage === "peggy_struggle" || s.stage === "peggy_sucked") {
            drawCinematicCrater(ctx, t, s.smokeAlpha, s.craterFire || 0, s.isBlackSmoke || false);
        }

        if (s.crystal.active) {
            drawCinematicCrystal(ctx, s.crystal, t);
        }

        if (s.comet.active) {
            drawCinematicComet(ctx, s.comet, t);
        }

        if (s.cloud && s.cloud.active) {
            drawCinematicCloud(ctx, s.cloud);
        }
        if (port.active && port.scale > 0.01) {
            drawCinematic3DPortal(ctx, port, t);
        }

        if (s.rainDrops && s.rainDrops.length > 0) {
            ctx.save();
            ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
            ctx.lineWidth = 2.2;
            ctx.lineCap = "round";
            for (let r = s.rainDrops.length - 1; r >= 0; r--) {
                const rd = s.rainDrops[r];
                rd.y += rd.vy;
                rd.x += rd.vx;
                ctx.beginPath();
                ctx.moveTo(rd.x, rd.y);
                ctx.lineTo(rd.x + rd.vx, rd.y + rd.len);
                ctx.stroke();

                if (rd.y >= 465) {
                    ctx.fillStyle = "rgba(56, 189, 248, 0.4)";
                    ctx.beginPath();
                    ctx.ellipse(rd.x, 466, 6, 2, 0, 0, Math.PI * 2);
                    ctx.fill();
                    s.rainDrops.splice(r, 1);
                }
            }
            ctx.restore();
        }

        if (s.windParticles.length > 0) {
            ctx.save();
            ctx.strokeStyle = "rgba(224, 242, 254, 0.65)";
            ctx.lineWidth = 2;
            ctx.lineCap = "round";
            for (let w = s.windParticles.length - 1; w >= 0; w--) {
                const wp = s.windParticles[w];
                wp.x += wp.vx; wp.y += wp.vy; wp.alpha -= 0.04;
                if (wp.alpha <= 0) { s.windParticles.splice(w, 1); continue; }
                ctx.globalAlpha = wp.alpha;
                ctx.beginPath(); ctx.moveTo(wp.x, wp.y); ctx.lineTo(wp.x + wp.vx*2.5, wp.y + wp.vy*2.5); ctx.stroke();
            }
            ctx.restore();
        }

        if (p.headphonesLost && s.stage !== "walk_to_friends") {
            drawLostHeadphones(ctx, p.hpX, p.hpY, p.hpRot);
        }

        if (!s.stage.startsWith("hub") && !s.stage.startsWith("scene1_")) {
            s.friends.forEach(f => {
                if (f.mood !== "gone" && f.mood !== "sleeping") {
                    drawCinematicFriend(ctx, f, t);
                }
            });
        }

        if (p.mood !== "gone" && s.stage !== "portal_close_sky" && s.stage !== "scene1_exterior") {
            drawCinematicPeggy(ctx, p, t);
        }

        if (s.stage === "scene1_interior" && p.mood === "sleeping") {
            ctx.save();
            ctx.translate(-s.cameraX + shakeX, -s.cameraY + shakeY);
            ctx.fillStyle = "#ef4444"; 
            ctx.beginPath();
            ctx.roundRect(p.x - 4, p.y + 12, 46, 22, 6);
            ctx.fill();
            ctx.restore();
        }

        drawCinematicNotes(ctx, s.floatingEmotes);
        drawCinematicNotes(ctx, p.notes);

        if (s.spikyBubble) {
            drawCinematicSpikyBubble(ctx, s.spikyBubble.text, s.spikyBubble.x, s.spikyBubble.y);
        }

        if (s.speechBubble) {
            drawCinematicBubble(ctx, s.speechBubble.text, s.speechBubble.x, s.speechBubble.y, s.speechBubble.color);
        }

        ctx.restore();

        if (s.whiteFlash > 0) {
            ctx.fillStyle = "rgba(255, 255, 255, " + s.whiteFlash + ")";
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            s.whiteFlash -= 0.04;
        }
        if (s.blackoutAlpha > 0) {
            ctx.fillStyle = "rgba(0, 0, 0, " + s.blackoutAlpha + ")";
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        }

        if (s.stage === "scene1_exterior") {
            ctx.save();
            ctx.font = 'bold 40px "Fredoka One", sans-serif';
            ctx.textAlign = "center";
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = "#000000";
            ctx.shadowBlur = 10;
            ctx.lineWidth = 6;
            ctx.strokeStyle = "#000000";
            
            let alpha = 0;
            if (s.timer < 30) alpha = s.timer / 30;
            else if (s.timer >= 30 && s.timer <= 150) alpha = 1;
            else if (s.timer > 150 && s.timer < 170) alpha = (170 - s.timer) / 20;
            
            ctx.globalAlpha = alpha;
            const houseDayText = typeof __ === "function" ? __("intro_house_day") : "Un día en la casa de Peggy...";
            ctx.strokeText(houseDayText, VIEW_W/2, VIEW_H - 80);
            ctx.fillText(houseDayText, VIEW_W/2, VIEW_H - 80);
            ctx.restore();
        }

        if (s.hugeText) {
            ctx.save();
            ctx.font = 'bold 80px "Fredoka One", sans-serif';
            ctx.textAlign = "center";
            ctx.fillStyle = "#ef4444";
            ctx.shadowColor = "#ffffff";
            ctx.shadowBlur = 15;
            ctx.lineWidth = 6;
            ctx.strokeStyle = "#ffffff";
            const hx = VIEW_W/2 + (Math.random()-0.5)*10;
            const hy = VIEW_H/2 + (Math.random()-0.5)*10 - 40;
            ctx.strokeText(s.hugeText, hx, hy);
            ctx.fillText(s.hugeText, hx, hy);
            ctx.restore();
        }
    }

    function drawCinematicMeadowBackdrop(ctx, t, camX) {
        if (typeof drawEnhancedBackground === "function") {
            const s = introState;
            let pPull = 0;
            let pScreenX = 450;
            if (s && s.portal && s.portal.active) {
                pPull = Math.min(1.4, s.portal.scale / 1.1);
                pScreenX = s.portal.x - (s.cameraX || 0);
            }
            const fakeGame = window.game || { 
                happyMode: false, subCaveMode: false, iceMode: false, fireMode: false, meadowNight: false,
                portalPull: pPull, portalScreenX: pScreenX
            };
            drawEnhancedBackground(ctx, 0, camX, t, fakeGame);
        } else {
            ctx.fillStyle = "#87CEEB"; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        }
    }

    function drawCinematicHouseInterior(ctx) {
        ctx.fillStyle = "#854d0e"; 
        ctx.fillRect(0, 0, VIEW_W, 400);
        
        for(let i=0; i<VIEW_W; i+=50) {
            ctx.fillStyle = (i % 100 === 0) ? "#78350f" : "#92400e";
            ctx.fillRect(i, 0, 48, 400);
            ctx.fillStyle = "rgba(41, 15, 2, 0.25)";
            ctx.fillRect(i + 46, 0, 4, 400);
        }
        
        ctx.fillStyle = "#451a03";
        ctx.fillRect(0, 380, VIEW_W, 20);
        ctx.strokeStyle = "#290f02";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 380, VIEW_W, 20);

        ctx.fillStyle = "#5c2b09";
        ctx.fillRect(0, 400, VIEW_W, VIEW_H - 400);
        
        ctx.strokeStyle = "#381704";
        ctx.lineWidth = 2.5;
        for(let i=0; i<5; i++) {
            ctx.beginPath(); ctx.moveTo(0, 400 + i*20); ctx.lineTo(VIEW_W, 400 + i*20); ctx.stroke();
        }

        ctx.fillStyle = "#c2410c"; 
        ctx.beginPath(); ctx.ellipse(260, 430, 160, 30, 0, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = "#f97316"; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.ellipse(260, 430, 150, 24, 0, 0, Math.PI*2); ctx.stroke();

        ctx.fillStyle = "#0f172a";
        ctx.beginPath(); ctx.roundRect(100, 120, 160, 160, 10); ctx.fill();
        
        ctx.fillStyle = "#fde047";
        ctx.beginPath(); ctx.arc(140, 160, 20, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#ffffff";
        for (let i=0; i<8; i++) {
            ctx.fillRect(110 + (i*19)%130, 130 + (i*29)%130, 2, 2);
        }

        ctx.strokeStyle = "#fef08a"; 
        ctx.lineWidth = 10;
        ctx.beginPath(); ctx.roundRect(100, 120, 160, 160, 10); ctx.stroke();
        ctx.fillStyle = "#fef08a";
        ctx.fillRect(175, 120, 10, 160);
        ctx.fillRect(100, 195, 160, 10);

        ctx.fillStyle = "#fef3c7";
        ctx.fillRect(500, 140, 100, 140);
        ctx.fillStyle = "#0284c7";
        ctx.fillRect(510, 150, 80, 75);
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath(); ctx.arc(550, 185, 18, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#78350f";
        ctx.fillRect(515, 235, 70, 5);
        ctx.fillRect(525, 245, 50, 5);
        
        ctx.fillStyle = "#ea580c";
        ctx.beginPath(); ctx.roundRect(400, 360, 40, 40, 5); ctx.fill();
        ctx.fillStyle = "#22c55e";
        ctx.beginPath(); ctx.ellipse(405, 330, 20, 40, Math.PI/4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(435, 330, 20, 40, -Math.PI/4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(420, 310, 15, 40, 0, 0, Math.PI*2); ctx.fill();
    }

function drawCinematicBed(ctx) {
        const bx = 180;
        const by = 360;

        ctx.fillStyle = "#451a03";
        ctx.fillRect(bx, by + 60, 160, 20); 
        ctx.fillRect(bx - 10, by + 10, 16, 70);
        ctx.fillRect(bx + 150, by + 30, 16, 50);
        
        ctx.fillStyle = "#e0f2fe";
        ctx.beginPath(); ctx.roundRect(bx, by + 40, 150, 20, 4); ctx.fill();
        
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.roundRect(bx + 10, by + 30, 45, 18, 8); ctx.fill();
    }

    function drawCinematicHouseExterior(ctx) {
        ctx.save();

        ctx.fillStyle = "#a8a29e";
        ctx.beginPath();
        ctx.moveTo(250, 466); ctx.lineTo(210, 500); ctx.lineTo(290, 500);
        ctx.fill();

        ctx.fillStyle = "#15803d";
        ctx.beginPath(); ctx.arc(100, 450, 30, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(380, 440, 40, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(420, 450, 25, 0, Math.PI*2); ctx.fill();

        const woodGrad = ctx.createLinearGradient(130, 280, 130, 466);
        woodGrad.addColorStop(0, "#92400e");
        woodGrad.addColorStop(1, "#78350f");
        ctx.fillStyle = woodGrad;
        ctx.fillRect(130, 280, 240, 186);

        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 1.5;
        for(let i=0; i<8; i++) {
            ctx.beginPath(); ctx.moveTo(130, 280 + i*23.25); ctx.lineTo(370, 280 + i*23.25); ctx.stroke();
            ctx.fillStyle = "#451a03";
            ctx.beginPath(); ctx.arc(140, 291 + i*23.25, 1.5, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(360, 291 + i*23.25, 1.5, 0, Math.PI*2); ctx.fill();
        }

        ctx.fillStyle = "#7f1d1d";
        ctx.beginPath(); ctx.moveTo(100, 280); ctx.lineTo(250, 150); ctx.lineTo(400, 280); ctx.fill();
        ctx.strokeStyle = "#fb923c";
        ctx.lineWidth = 6;
        ctx.lineJoin = "round";
        ctx.beginPath(); ctx.moveTo(100, 280); ctx.lineTo(250, 150); ctx.lineTo(400, 280); ctx.stroke();

        ctx.fillStyle = "#475569";
        ctx.fillRect(310, 160, 30, 70);
        ctx.fillStyle = "#334155";
        ctx.fillRect(310, 180, 30, 2); ctx.fillRect(310, 200, 30, 2); ctx.fillRect(310, 220, 30, 2);
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(305, 150, 40, 10);
        
        ctx.fillStyle = "rgba(226, 232, 240, 0.4)";
        ctx.beginPath(); ctx.arc(325, 130, 15, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(340, 110, 20, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = "#451a03";
        ctx.beginPath(); ctx.roundRect(220, 376, 60, 90, [10, 10, 0, 0]); ctx.fill();
        ctx.strokeStyle = "#78350f"; ctx.lineWidth = 2;
        ctx.strokeRect(228, 384, 44, 30); ctx.strokeRect(228, 424, 44, 34);
        ctx.fillStyle = "#fde047";
        ctx.beginPath(); ctx.arc(270, 430, 4, 0, Math.PI*2); ctx.fill(); 
        
        const drawWin = (x, y) => {
            ctx.fillStyle = "rgba(0,0,0,0.3)";
            ctx.fillRect(x+4, y+4, 60, 60);
            ctx.fillStyle = "#fcd34d";
            ctx.fillRect(x, y, 60, 60);
            ctx.fillStyle = "#1e3a8a";
            ctx.fillRect(x+6, y+6, 48, 48);
            ctx.fillStyle = "rgba(253, 224, 71, 0.2)";
            ctx.fillRect(x+6, y+6, 48, 48);
            ctx.fillStyle = "#fcd34d";
            ctx.fillRect(x+28, y, 4, 60);
            ctx.fillRect(x, y+28, 60, 4);
        };
        drawWin(140, 310);
        drawWin(300, 310); 

        ctx.fillStyle = "#1e293b";
        ctx.fillRect(245, 360, 10, 10);
        ctx.fillStyle = "#fef08a";
        ctx.beginPath(); ctx.arc(250, 370, 8, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "rgba(253, 224, 71, 0.3)";
        ctx.beginPath(); ctx.arc(250, 370, 40, 0, Math.PI*2); ctx.fill();

        ctx.restore();
    }

        function drawCinematicCrystal(ctx, cry, t) {
        if (!cry || !cry.active) return;
        ctx.save();
        
        const cx = cry.x || 650;
        const cy = (cry.y || 440) + (cry.yOffset || 0) + Math.sin(t * 0.06) * 5;

        const intensity = 1 + (cry.glow || 0) * 1.5;
        const glowRad = (36 + Math.sin(t * 0.08) * 8) * intensity;
        const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, glowRad);
        grad.addColorStop(0, "rgba(236, 72, 153, 0.95)");
        grad.addColorStop(0.4, "rgba(168, 85, 247, 0.65)");
        grad.addColorStop(1, "rgba(147, 51, 234, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, glowRad, 0, Math.PI * 2);
        ctx.fill();

        const w = 22;
        const hTop = 18;
        const hBot = 28;

        ctx.lineJoin = "round";
        ctx.lineWidth = 1.5;

        ctx.fillStyle = "#7e22ce";
        ctx.beginPath();
        ctx.moveTo(cx, cy - hTop);
        ctx.lineTo(cx - w, cy);
        ctx.lineTo(cx, cy + hBot);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#a855f7";
        ctx.beginPath();
        ctx.moveTo(cx, cy - hTop);
        ctx.lineTo(cx + w, cy);
        ctx.lineTo(cx, cy + hBot);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#c084fc";
        ctx.beginPath();
        ctx.moveTo(cx, cy - hTop);
        ctx.lineTo(cx - w * 0.4, cy);
        ctx.lineTo(cx, cy + hBot);
        ctx.lineTo(cx + w * 0.4, cy);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.beginPath();
        ctx.moveTo(cx - 2, cy - hTop + 3);
        ctx.lineTo(cx - w * 0.35, cy - 2);
        ctx.lineTo(cx, cy - 2);
        ctx.closePath();
        ctx.fill();

        for (let i = 0; i < 3; i++) {
            const spX = cx + Math.sin(t * 0.05 + i * 2) * 26;
            const spY = cy + Math.cos(t * 0.05 + i * 2) * 22;
            const spSize = 2 + Math.abs(Math.sin(t * 0.1 + i)) * 3;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(spX - spSize / 2, spY - 1, spSize, 2);
            ctx.fillRect(spX - 1, spY - spSize / 2, 2, spSize);
        }

        ctx.restore();
    }

    function drawCinematicCrater(ctx, t, smokeAlpha, fireAmount, isBlackSmoke) {
        ctx.save();
        const cx = 650;
        const cy = 466;

        ctx.fillStyle = "rgba(41, 15, 2, 0.7)";
        ctx.beginPath(); ctx.ellipse(cx, cy + 10, 220, 45, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(20, 5, 0, 0.85)";
        ctx.beginPath(); ctx.ellipse(cx, cy + 15, 160, 30, 0, 0, Math.PI * 2); ctx.fill();
        
        ctx.strokeStyle = "#1a0b02";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        const cracks = [
            [ {x:0, y:0}, {x:-40, y:-10}, {x:-80, y:-5}, {x:-120, y:-20} ],
            [ {x:0, y:0}, {x:-30, y:15}, {x:-70, y:30}, {x:-100, y:20} ],
            [ {x:0, y:0}, {x:50, y:-8}, {x:110, y:-15}, {x:160, y:-5} ],
            [ {x:0, y:0}, {x:40, y:20}, {x:90, y:25}, {x:130, y:40} ],
            [ {x:0, y:0}, {x:0, y:30}, {x:-20, y:50}, {x:10, y:70} ]
        ];
        ctx.translate(cx, cy + 15);
        cracks.forEach(pts => {
            ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
            for(let i=1; i<pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
            ctx.stroke();
            ctx.beginPath(); ctx.moveTo(pts[1].x, pts[1].y); ctx.lineTo(pts[1].x + 15, pts[1].y - 15); ctx.stroke();
        });
        
        for(let i=0; i<15; i++) {
            const ex = (Math.sin(i*7) * 100);
            const ey = (Math.cos(i*3) * 30);
            ctx.fillStyle = (i%2===0) ? "#ef4444" : "#f59e0b";
            ctx.beginPath(); ctx.arc(ex, ey, 2.5, 0, Math.PI*2); ctx.fill();
        }

        if (fireAmount > 0) {
            ctx.save();
            ctx.globalCompositeOperation = "screen";
            for (let f = -5; f <= 5; f++) {
                const fx = f * 18 + Math.sin(t * 0.15 + f) * 6;
                const fy = -10 + Math.cos(t * 0.12 + f * 2) * 4;
                const fHeight = (36 + Math.sin(t * 0.25 + f * 1.5) * 16) * fireAmount;
                const fWidth = (14 + Math.cos(t * 0.2 + f) * 4) * fireAmount;

                const flameGrad = ctx.createLinearGradient(fx, fy, fx, fy - fHeight);
                flameGrad.addColorStop(0, "rgba(239, 68, 68, 0.9)");
                flameGrad.addColorStop(0.5, "rgba(249, 115, 22, 0.85)");
                flameGrad.addColorStop(0.9, "rgba(253, 224, 71, 0.8)");
                flameGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

                ctx.fillStyle = flameGrad;
                ctx.beginPath();
                ctx.moveTo(fx - fWidth, fy);
                ctx.quadraticCurveTo(fx - fWidth * 0.5, fy - fHeight * 0.6, fx, fy - fHeight);
                ctx.quadraticCurveTo(fx + fWidth * 0.5, fy - fHeight * 0.6, fx + fWidth, fy);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = "rgba(254, 240, 138, 0.9)";
                ctx.beginPath();
                ctx.moveTo(fx - fWidth * 0.4, fy);
                ctx.quadraticCurveTo(fx, fy - fHeight * 0.5, fx, fy - fHeight * 0.7);
                ctx.quadraticCurveTo(fx, fy - fHeight * 0.5, fx + fWidth * 0.4, fy);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        }

        if (smokeAlpha > 0) {
            for (let i = 0; i < 10; i++) {
                const phase = (t * 0.02 + i * 2.1) % (Math.PI * 2);
                const sx = Math.sin(i * 3.7) * 90 + Math.sin(phase) * 25;
                const sy = -Math.abs(Math.cos(phase)) * 80 - 15;
                const sAlpha = Math.max(0, 0.55 - Math.abs(sy) * 0.005) * smokeAlpha;
                
                if (isBlackSmoke) {
                    ctx.fillStyle = (i % 2 === 0) ? `rgba(15, 23, 42, ${sAlpha * 0.95})` : `rgba(30, 41, 59, ${sAlpha * 0.9})`;
                } else {
                    ctx.fillStyle = `rgba(148, 163, 184, ${sAlpha * 0.8})`;
                }
                ctx.beginPath(); ctx.arc(sx, sy, 32 + Math.abs(sy)*0.55, 0, Math.PI*2); ctx.fill();
            }
        }
        ctx.restore();
    }

    function drawCinematicCloud(ctx, c) {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.scale(c.scale || 1, c.scale || 1);

        if (c.mood === "straining") {
            ctx.translate((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 2);
        }

        const cloudGrad = ctx.createLinearGradient(0, -30, 0, 35);
        if (c.mood === "straining") {
            cloudGrad.addColorStop(0, "rgba(241, 245, 249, 0.98)");
            cloudGrad.addColorStop(0.6, "rgba(203, 213, 225, 0.95)");
            cloudGrad.addColorStop(1, "rgba(100, 116, 139, 0.9)");
        } else {
            cloudGrad.addColorStop(0, "rgba(255, 255, 255, 0.98)");
            cloudGrad.addColorStop(1, "rgba(224, 242, 254, 0.92)");
        }
        
        ctx.fillStyle = cloudGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI*2);
        ctx.arc(-22, 8, 22, 0, Math.PI*2);
        ctx.arc(22, 8, 22, 0, Math.PI*2);
        ctx.arc(-38, 18, 16, 0, Math.PI*2);
        ctx.arc(38, 18, 16, 0, Math.PI*2);
        ctx.fill();

        ctx.fillStyle = "#0f172a";
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";

        if (c.mood === "straining") {
            ctx.beginPath();
            ctx.moveTo(-16, -2); ctx.lineTo(-8, 3); ctx.lineTo(-16, 8);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(16, -2); ctx.lineTo(8, 3); ctx.lineTo(16, 8);
            ctx.stroke();

            ctx.fillStyle = "#38bdf8";
            ctx.beginPath();
            ctx.moveTo(24, -10);
            ctx.quadraticCurveTo(28, -6, 26, -2);
            ctx.arc(24, -2, 2, 0, Math.PI);
            ctx.fill();

            ctx.strokeStyle = "#0f172a";
            ctx.fillStyle = "#ffffff";
            ctx.strokeRect(-8, 14, 16, 7);
            ctx.fillRect(-7, 15, 14, 5);
            ctx.beginPath(); ctx.moveTo(-3, 15); ctx.lineTo(-3, 20); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(2, 15); ctx.lineTo(2, 20); ctx.stroke();
        } else if (c.mood === "blowing") {
            ctx.beginPath(); ctx.arc(-12, 2, 5, Math.PI, 0); ctx.stroke();
            ctx.beginPath(); ctx.arc(12, 2, 5, Math.PI, 0); ctx.stroke();

            ctx.fillStyle = "#0f172a";
            ctx.beginPath(); ctx.arc(14, 12, 6, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath(); ctx.arc(14, 12, 3, 0, Math.PI*2); ctx.fill();

            ctx.fillStyle = "rgba(244, 114, 182, 0.4)";
            ctx.beginPath(); ctx.arc(-16, 10, 8, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(6, 10, 8, 0, Math.PI*2); ctx.fill();
        } else if (c.mood === "happy") {
            ctx.beginPath(); ctx.arc(-11, 2, 5, Math.PI, 0); ctx.stroke();
            ctx.beginPath(); ctx.arc(11, 2, 5, Math.PI, 0); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, 10, 6, 0, Math.PI); ctx.fill();
            ctx.fillStyle = "rgba(244, 114, 182, 0.5)";
            ctx.beginPath(); ctx.arc(-18, 8, 6, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(18, 8, 6, 0, Math.PI*2); ctx.fill();
        } else {
            ctx.beginPath(); ctx.arc(-10, 2, 3.5, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(10, 2, 3.5, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(0, 10, 4, 0, Math.PI); ctx.stroke();
        }

        ctx.restore();
    }

    function drawCinematicComet(ctx, c, t) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        
        if (c.trail.length > 1) {
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            
            for(let i=0; i<c.trail.length-1; i++) {
                const tr = c.trail[i];
                const trNext = c.trail[i+1];
                tr.alpha -= 0.04;
                if (tr.alpha > 0) {
                    ctx.beginPath();
                    ctx.moveTo(tr.x, tr.y);
                    ctx.lineTo(trNext.x, trNext.y);
                    
                    const thickness = Math.max(1, 25 * tr.alpha);
                    ctx.lineWidth = thickness;
                    ctx.strokeStyle = `rgba(167, 139, 250, ${tr.alpha * 0.8})`;
                    ctx.stroke();
                    
                    ctx.lineWidth = thickness * 1.5;
                    ctx.strokeStyle = `rgba(56, 189, 248, ${tr.alpha * 0.4})`;
                    ctx.stroke();
                }
            }
        }

        const headGlow = ctx.createRadialGradient(c.x, c.y, 2, c.x, c.y, 50);
        headGlow.addColorStop(0, "rgba(255, 255, 255, 1)");
        headGlow.addColorStop(0.3, "rgba(168, 85, 247, 0.9)");
        headGlow.addColorStop(0.6, "rgba(56, 189, 248, 0.6)");
        headGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = headGlow;
        ctx.beginPath(); ctx.arc(c.x, c.y, 50, 0, Math.PI*2); ctx.fill();
        
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(c.x, c.y, 10, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }

    function drawLostHeadphones(ctx, px, py, pRot) {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(pRot);
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, 10, Math.PI, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = "#38bdf8"; ctx.fillRect(-12, -2, 4, 8); ctx.fillRect(8, -2, 4, 8);
        ctx.restore();
    }

function drawCinematicPeggy(ctx, p, t) {
        if (typeof drawPlayerEnhanced === "function") {
            if (!p.headphonesLost && p.mood !== "sucked") {
                ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
                ctx.beginPath();
                ctx.ellipse(p.x + p.w / 2, p.baseY + p.h - 1, (p.w * 0.5) * p.scaleX, 4, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            const isScared = (p.mood === "shocked" || p.mood === "resisting" || p.mood === "sucked" || p.mood === "dizzy");
            const fakePlayer = {
                state: p.mood === "walking" ? "run" : ("idle"),
                health: 100,
                maxHealth: 100,
                dashTimer: 0,
                charging: false,
                isGiant: false,
                color: "#ff6666",
                shield: 0,
                shieldColor: null,
                vy: p.vy || 0,
                facing: p.facing || 1,
                scared: isScared
            };
            
            ctx.save();
            if (p.rotation || p.mood === "sleeping") {
                const cx = p.x + p.w / 2;
                const cy = p.y + p.h / 2;
                ctx.translate(cx, cy);
                ctx.rotate(p.rotation || (p.mood === "sleeping" ? -Math.PI / 2 : 0));
                ctx.translate(-cx, -cy);
            }
            drawPlayerEnhanced(ctx, p.x, p.y, p.w, p.h, p.facing, p.scaleX, p.scaleY, fakePlayer.color, 0, [], isScared, fakePlayer);

            if (p.mood === "sleeping") {
                const cx = p.x + p.w / 2;
                const cy = p.y + p.h / 2;
                ctx.translate(cx, cy);
                
                ctx.fillStyle = fakePlayer.color;
                ctx.fillRect(4, -8, 12, 16);
                
                ctx.strokeStyle = "#1e293b";
                ctx.lineWidth = 2.5;
                ctx.lineCap = "round";
                ctx.beginPath(); ctx.moveTo(8, -6); ctx.lineTo(13, -4); ctx.lineTo(8, -2); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(8, 2); ctx.lineTo(13, 4); ctx.lineTo(8, 6); ctx.stroke();
                
                const snotRad = 4 + Math.abs(Math.sin(t * 0.05)) * 6;
                ctx.fillStyle = "rgba(186, 230, 253, 0.6)";
                ctx.strokeStyle = "#38bdf8";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(16, 8, snotRad, 0, Math.PI * 2);
                ctx.fill(); ctx.stroke();
            }

            ctx.restore();

            if (p.mood === "dizzy") {
                ctx.save();
                for (let st = 0; st < 3; st++) {
                    const ang = t * 0.14 + (st * Math.PI * 2 / 3);
                    const starX = p.x + p.w / 2 + Math.cos(ang) * 18;
                    const starY = p.y - 12 + Math.sin(ang) * 6;
                    ctx.fillStyle = "#fde047";
                    ctx.shadowColor = "#eab308";
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    ctx.arc(starX, starY, 3.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(starX - 1, starY - 1, 1.2, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }

            if (!p.headphonesLost && p.headphones !== false) {
                drawPeggyHeadphonesOn(ctx, p.x, p.y, p.w, p.h, p.scaleX, p.scaleY);
            }
        }
    }

    function drawCinematicFriend(ctx, f, t) {
        if (typeof drawPlayerEnhanced === "function") {
            if (f.mood !== "sucked") {
                ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
                ctx.beginPath();
                ctx.ellipse(f.x + f.w / 2, f.baseY + f.h - 1, (f.w * 0.52) * f.scaleX, 3.5, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            const isScared = (f.mood === "shocked" || f.mood === "resisting" || f.mood === "sucked");
            const fakePlayer = {
                state: "idle",
                health: 100,
                maxHealth: 100,
                dashTimer: 0,
                charging: false,
                isGiant: false,
                colorTop: f.colorTop, colorBot: f.colorBot,
                shield: 0,
                shieldColor: null,
                vy: f.vy || 0,
                facing: f.facing || -1,
                scared: isScared
            };

            ctx.save();
            if (f.rot) {
                const cx = f.x + f.w / 2;
                const cy = f.y + f.h / 2;
                ctx.translate(cx, cy);
                ctx.rotate(f.rot);
                ctx.translate(-cx, -cy);
            }

            drawPlayerEnhanced(ctx, f.x, f.y, f.w, f.h, f.facing, f.scaleX, f.scaleY, fakePlayer.color, 0, [], isScared, fakePlayer);
            
            if (f.accessory) {
                ctx.save();
                const bX = f.x + f.w / 2;
                const bY = f.y + f.h;
                ctx.translate(bX, bY);
                ctx.scale(f.scaleX || 1, f.scaleY || 1);
                ctx.translate(-bX, -bY);

                const cx = f.x + f.w / 2;
                const cy = f.y;
                if (f.accessory === "bow") {
                    ctx.fillStyle = "#fb7185";
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.lineTo(cx - 8, cy - 6);
                    ctx.lineTo(cx - 8, cy + 4);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.lineTo(cx + 8, cy - 6);
                    ctx.lineTo(cx + 8, cy + 4);
                    ctx.fill();
                    ctx.fillStyle = "#e11d48";
                    ctx.beginPath();
                    ctx.arc(cx, cy - 1, 3, 0, Math.PI * 2);
                    ctx.fill();
                } else if (f.accessory === "ponytail") {
                    ctx.fillStyle = f.colorTop;
                    ctx.beginPath();
                    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.quadraticCurveTo(cx + 8, cy - 10, cx + 14, cy + 4);
                    ctx.quadraticCurveTo(cx + 6, cy, cx, cy + 4);
                    ctx.fill();
                } else if (f.accessory === "flower") {
                    ctx.fillStyle = "#ffffff";
                    for(let p=0; p<5; p++) {
                        ctx.beginPath();
                        ctx.ellipse(cx + Math.cos(p*Math.PI*2/5)*4, cy + Math.sin(p*Math.PI*2/5)*4, 3, 3, 0, 0, Math.PI*2);
                        ctx.fill();
                    }
                    ctx.fillStyle = "#fde047";
                    ctx.beginPath();
                    ctx.arc(cx, cy, 2.5, 0, Math.PI*2);
                    ctx.fill();
                } else if (f.accessory === "cap") {
                    ctx.fillStyle = "#ef4444";
                    ctx.beginPath();
                    ctx.arc(cx, cy, 8, Math.PI, 0);
                    ctx.fill();
                    ctx.fillRect(cx - 8, cy, 16, 2);
                    ctx.fillRect(cx - (f.facing === 1 ? -2 : 12), cy, 10, 2);
                } else if (f.accessory === "headband") {
                    ctx.strokeStyle = "#3b82f6";
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(f.x - 1, cy + 4);
                    ctx.lineTo(f.x + f.w + 1, cy + 2);
                    ctx.stroke();
                } else if (f.accessory === "glasses") {
                    ctx.strokeStyle = "#1e293b";
                    ctx.lineWidth = 2;
                    const eyeY = f.y + f.h * 0.4;
                    ctx.strokeRect(f.x + 4, eyeY - 4, 10, 8);
                    ctx.strokeRect(f.x + f.w - 14, eyeY - 4, 10, 8);
                    ctx.beginPath();
                    ctx.moveTo(f.x + 14, eyeY);
                    ctx.lineTo(f.x + f.w - 14, eyeY);
                    ctx.stroke();
                }
                ctx.restore();
            }

            ctx.restore();

            if (f.screamText && f.mood === "sucked") {
                ctx.save();
                ctx.font = 'bold 15px "Fredoka One", sans-serif';
                ctx.textAlign = "center";
                ctx.fillStyle = "#ffffff";
                ctx.shadowColor = f.colorBot;
                ctx.shadowBlur = 10;
                ctx.fillText(f.screamText, f.x + f.w / 2, f.y - 15);
                ctx.restore();
            }
        }
    }

    function drawPeggyHeadphonesOn(ctx, px, py, pw, ph, sX, sY) {
        ctx.save();
        const cx = px + pw/2;
        const cy = py + ph;
        ctx.translate(cx, cy);
        ctx.scale(sX || 1, sY || 1);
        ctx.translate(-cx, -cy);
        
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(px + pw / 2, py + 4, pw * 0.58, Math.PI * 1.08, Math.PI * 1.92);
        ctx.stroke();

        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const drawCup = (cx, cy) => {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.roundRect(cx - 3.5, cy - 6, 7, 12, 3);
            ctx.fill();
            ctx.strokeStyle = "#0284c7";
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = "#38bdf8";
            ctx.beginPath();
            ctx.roundRect(cx - 2, cy - 4, 4, 8, 2);
            ctx.fill();
        };
        drawCup(px - 1, py + 12);
        drawCup(px + pw + 1, py + 12);
        ctx.restore();
    }

    function drawCinematic3DPortal(ctx, port, t) {
        ctx.save();
        ctx.translate(port.x, port.y);
        ctx.scale(port.scale, port.scale);

        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const auraR = 110 + Math.sin(t * 0.15) * 12;
        const auraGrad = ctx.createRadialGradient(0, 0, 15, 0, 0, auraR);
        auraGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
        auraGrad.addColorStop(0.15, "rgba(56, 189, 248, 0.95)");
        auraGrad.addColorStop(0.4, "rgba(168, 85, 247, 0.7)");
        auraGrad.addColorStop(0.7, "rgba(76, 29, 149, 0.4)");
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 40;
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, 0, auraR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = "rgba(126, 34, 206, 0.9)";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(0, 0, 60, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#010005";
        ctx.beginPath();
        ctx.arc(0, 0, 56, 0, Math.PI * 2);
        ctx.fill();
        
        const voidGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 56);
        voidGrad.addColorStop(0, "rgba(0, 0, 0, 1)");
        voidGrad.addColorStop(0.7, "rgba(30, 10, 60, 0.8)");
        voidGrad.addColorStop(1, "rgba(126, 34, 206, 0.9)");
        ctx.fillStyle = voidGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 56, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.rotate(port.rotation);
        ctx.globalCompositeOperation = "screen";
        for (let a = 0; a < 7; a++) {
            const ang = a * (Math.PI * 2 / 7) - port.rotation * 2.5;
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.6 + Math.sin(t * 0.2 + a) * 0.4})`;
            ctx.lineWidth = 5 + Math.sin(t*0.3+a)*2;
            ctx.shadowColor = "#a855f7";
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (let st = 0; st < 20; st++) {
                const r = st * 3.2;
                const tAng = ang - st * 0.18;
                ctx.lineTo(Math.cos(tAng) * r, Math.sin(tAng) * r);
            }
            ctx.stroke();
        }

        const vGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 40);
        vGrad.addColorStop(0, "#ffffff");
        vGrad.addColorStop(0.2, "#bae6fd");
        vGrad.addColorStop(0.5, "#a855f7");
        vGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = vGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        for (let s = 0; s < 16; s++) { 
            const sAng = s * (Math.PI / 8) + port.rotation * 1.8;
            const ox = Math.cos(sAng) * 52;
            const oy = Math.sin(sAng) * 52;
            const oz = Math.sin(sAng + t * 0.1);
            const sRad = Math.max(0.5, 3 + oz * 1.5);
            
            ctx.shadowColor = "#ffffff";
            ctx.shadowBlur = 10;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + (oz + 1) * 0.3})`;
            ctx.beginPath();
            ctx.arc(ox, oy, sRad, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 20;
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, 56, 0, Math.PI * 2);
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 58, 0, Math.PI * 2);
        ctx.stroke();

        if (Math.random() < 0.85) {
            ctx.save();
            ctx.shadowColor = "#67e8f9";
            ctx.shadowBlur = 15;
            ctx.strokeStyle = Math.random() < 0.5 ? "#67e8f9" : "#ffffff";
            ctx.lineWidth = 3;
            const lAng = Math.random() * Math.PI * 2;
            const r1 = 45;
            const r2 = 55 + Math.random() * 25;
            const lx1 = Math.cos(lAng) * r1;
            const ly1 = Math.sin(lAng) * r1;
            const lx2 = Math.cos(lAng + 0.3) * r2;
            const ly2 = Math.sin(lAng + 0.3) * r2;
            ctx.beginPath();
            ctx.moveTo(lx1, ly1);
            ctx.lineTo((lx1 + lx2) / 2 + (Math.random() - 0.5) * 15, (ly1 + ly2) / 2 + (Math.random() - 0.5) * 15);
            ctx.lineTo(lx2, ly2);
            ctx.stroke();
            ctx.restore();
        }

        ctx.restore();
    }

    function drawCinematicNotes(ctx, list) {
        if (!list || list.length === 0) return;
        ctx.save();
        for (let i = list.length - 1; i >= 0; i--) {
            const item = list[i];
            item.x += item.vx || 0;
            item.y += item.vy || -1;
            item.alpha -= 0.018;
            if (item.alpha <= 0) {
                list.splice(i, 1);
                continue;
            }
            ctx.globalAlpha = item.alpha;
            ctx.font = 'bold 15px "Fredoka One", sans-serif';
            ctx.fillStyle = item.color || "#38bdf8";
            ctx.textAlign = "center";
            ctx.fillText(item.symbol, item.x, item.y);
        }
        ctx.restore();
    }

    function drawCinematicBubble(ctx, text, cx, cy, color) {
        ctx.save();
        ctx.font = 'bold 15px "Fredoka One", sans-serif';
        const lines = text.split('\n');
        let maxTw = 0;
        for (let l of lines) {
            maxTw = Math.max(maxTw, ctx.measureText(l).width);
        }
        const bw = maxTw + 22;
        const bh = 15 * lines.length + 15;
        const bx = cx - bw / 2;
        const by = cy - bh;

        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.beginPath();
        ctx.roundRect(bx + 2, by + 3, bw, bh, 10);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 10);
        ctx.fill();

        ctx.strokeStyle = color || "#0284c7";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(cx - 5, by + bh - 1);
        ctx.lineTo(cx, by + bh + 6);
        ctx.lineTo(cx + 5, by + bh - 1);
        ctx.fill();
        ctx.strokeStyle = color || "#0284c7";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 5, by + bh);
        ctx.lineTo(cx, by + bh + 6);
        ctx.lineTo(cx + 5, by + bh);
        ctx.stroke();

        ctx.fillStyle = "#0f172a";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], cx, by + 15 + i * 15);
        }
        ctx.restore();
    }

function drawCinematicSpikyBubble(ctx, text, cx, cy) {
        ctx.save();
        const points = 16;
        const outerR = 96;
        const innerR = 66;
        
        ctx.translate(cx, cy);
        ctx.translate((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);

        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            let r = (i % 2 === 0) ? outerR : innerR;
            if (i === 11) r = outerR + 36;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * (r * 0.65);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();

        ctx.fillStyle = "#fef08a";
        ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
        ctx.shadowBlur = 10;
        ctx.fill();

        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.shadowBlur = 0;

        ctx.font = '900 32px "Fredoka One", Impact, sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#b91c1c";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 5;
        ctx.strokeText(text, 0, 0);
        ctx.fillText(text, 0, 0);

        ctx.restore();
    }

    window.startIntroCinematic = startIntroCinematic;
    window.playIntroCinematic = startIntroCinematic;
    window.updateAndDrawIntro = updateAndDrawIntro;
    window.handleIntroInput = handleIntroInput;
    window.getIntroState = function() { return introState; };
    window.setIntroState = function(s) { introState = s; };
})();
