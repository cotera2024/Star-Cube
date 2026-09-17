(function() {
    "use strict";
    if (typeof window === "undefined" || typeof document === "undefined") return;
    const PROFILE_MS = 2e3;
    const PRESETS = {
        high: {
            glow: 0.25,
            maxBlur: 6,
            maxParticles: 180,
            maxBg: 25,
            pixelScale: 1
        },
        medium: {
            glow: 0.05,
            maxBlur: 2,
            maxParticles: 90,
            maxBg: 12,
            pixelScale: 1
        },
        low: {
            glow: 0,
            maxBlur: 0,
            maxParticles: 35,
            maxBg: 0,
            pixelScale: 1
        }
    };
    function clampPresetName(n) {
        return n === "medium" || n === "low" ? n : "high";
    }
    function hintFromHw() {
        let hw = NaN, mem = NaN;
        try {
            hw = navigator.hardwareConcurrency || NaN;
        } catch (e) {}
        try {
            mem = navigator.deviceMemory || NaN;
        } catch (e) {}
        const isMobile = (typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) ||
                         (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
        if (isMobile) {
            if ((!isNaN(mem) && mem <= 3) || (!isNaN(hw) && hw <= 4)) return "low";
            if (!isNaN(mem) && mem <= 4) return "low";
            return "medium";
        }
        if (!isNaN(hw) && hw <= 2) return "low";
        if (!isNaN(hw) && hw <= 4) return "medium";
        if (!isNaN(mem) && mem <= 2) return "low";
        if (!isNaN(mem) && mem <= 4) return "medium";
        return null;
    }
    function applyPreset(name) {
        const p = PRESETS[name];
        sys.glowMult = p.glow;
        sys.maxBlur = p.maxBlur;
        sys.maxParticles = p.maxParticles;
        sys.maxBg = p.maxBg;
        sys.pixelScale = p.pixelScale || 1;
        try {
            if (document.body) {
                document.body.classList.toggle("low-perf", name === "low");
            }
        } catch (e) {}
        try {
            localStorage.setItem("starcube_perf", name);
        } catch (e) {}
        try {
            window.dispatchEvent(new CustomEvent("perfQualityChanged", { detail: { level: name } }));
        } catch (e) {}
        if (typeof window.resizeGame === "function") {
            try { window.resizeGame(); } catch (e) {}
        }
    }
    const sys = {
        glowMult: 0.25,
        maxBlur: 6,
        maxParticles: 180,
        maxBg: 25,
        pixelScale: 1,
        get level() {
            return this.__level || "high";
        },
        set level(v) {
            this.__level = clampPresetName(v);
            applyPreset(this.__level);
        },
        ignLow() {
            return this.level === "low";
        },
        apply(name) {
            this.level = name;
        },
        measure() {
            if (sys.__probeDone) return;
            const hw = hintFromHw();
            if (hw) {
                sys.level = hw;
                sys.__probeDone = true;
                return;
            }
            sys.__probeDone = true;
            let frames = 0, t0 = null;
            function tick(ts) {
                if (t0 === null) t0 = ts;
                frames++;
                const dt = ts - t0;
                if (dt >= PROFILE_MS) {
                    const fps = frames / (dt / 1e3);
                    sys.level = fps < 32 ? "low" : fps < 52 ? "medium" : "high";
                    return;
                }
                requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        },
        _probeDone: false
    };
    let initial = "medium";
    try {
        const saved = localStorage.getItem("starcube_perf");
        if (saved === "high" || saved === "medium" || saved === "low") {
            initial = saved;
        } else {
            const hw = hintFromHw();
            if (hw) initial = hw;
        }
    } catch (e) {}
    sys.__level = initial;
    applyPreset(initial);
    function patchShadowBlur() {
        try {
            const proto = CanvasRenderingContext2D.prototype;
            const desc = Object.getOwnPropertyDescriptor(proto, "shadowBlur");
            if (!desc || typeof desc.set !== "function") return;
            Object.defineProperty(proto, "shadowBlur", {
                configurable: true,
                get() {
                    return this.__sbValue || 0;
                },
                set(v) {
                    this.__sbValue = v;
                    if (!v || (window.PerfQuality && window.PerfQuality.level === "low")) {
                        desc.set.call(this, 0);
                        return;
                    }
                    const mult = window.PerfQuality ? window.PerfQuality.glowMult : 1;
                    if (mult === 0) {
                        desc.set.call(this, 0);
                        return;
                    }
                    const maxB = (window.PerfQuality && typeof window.PerfQuality.maxBlur === "number") ? window.PerfQuality.maxBlur : 6;
                    const effective = Math.min(v, maxB) * mult;
                    if (effective < 1.5) {
                        desc.set.call(this, 0);
                        return;
                    }
                    desc.set.call(this, effective);
                }
            });
        } catch (e) {}
    }
    let lowFpsCount = 0;
    function startFpsMonitor() {
        let lastTime = performance.now();
        let frameCount = 0;
        function checkFps(now) {
            frameCount++;
            const elapsed = now - lastTime;
            if (elapsed >= 2000) {
                const currentFps = (frameCount / elapsed) * 1000;
                frameCount = 0;
                lastTime = now;
                if (!window.GAME_PAUSED && typeof window.gameState !== "undefined" && window.gameState === "playing") {
                    if (currentFps < 38) {
                        lowFpsCount++;
                        if (lowFpsCount >= 2) {
                            if (sys.level === "high") {
                                sys.level = "medium";
                            } else if (sys.level === "medium") {
                                sys.level = "low";
                            }
                            lowFpsCount = 0;
                        }
                    } else if (currentFps > 55 && lowFpsCount > 0) {
                        lowFpsCount--;
                    }
                }
            }
            requestAnimationFrame(checkFps);
        }
        requestAnimationFrame(checkFps);
    }
    window.PerfQuality = sys;
    window.setPerfQuality = function(name) {
        sys.level = name;
    };
    patchShadowBlur();
    sys.measure();
    startFpsMonitor();
})();
// Isaac Daniel Cotera - 2026 | Correo: isaacdanielcotera@gmail.com | Itch.io: https://cotera.itch.io | GitHub: https://github.com/cotera2024
