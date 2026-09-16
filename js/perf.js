(function() {
    "use strict";
    if (typeof window === "undefined" || typeof document === "undefined") return;
    const PROFILE_MS = 2e3;
    const PRESETS = {
        high: {
            glow: 1,
            maxParticles: 400,
            maxBg: 40
        },
        medium: {
            glow: .45,
            maxParticles: 230,
            maxBg: 28
        },
        low: {
            glow: 0,
            maxParticles: 140,
            maxBg: 18
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
        if (!isNaN(hw) && hw <= 2) return "low";
        if (!isNaN(hw) && hw <= 4) return "medium";
        if (!isNaN(mem) && mem <= 2) return "low";
        if (!isNaN(mem) && mem <= 4) return "medium";
        return null;
    }
    function applyPreset(name) {
        const p = PRESETS[name];
        sys.glowMult = p.glow;
        sys.maxParticles = p.maxParticles;
        sys.maxBg = p.maxBg;
        // pixelScale removed: canvas always renders at full logical resolution
        // for a crisp image. sys.pixelScale stays 1 for legacy readers.
        sys.pixelScale = 1;
        try {
            localStorage.setItem("starcube_perf", name);
        } catch (e) {}
    }
    const sys = {
        glowMult: 1,
        maxParticles: 400,
        maxBg: 40,
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
    let initial = "high";
    try {
        const saved = localStorage.getItem("starcube_perf");
        if (saved === "medium" || saved === "low") initial = saved;
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
                    const mult = window.PerfQuality && window.PerfQuality.glowMult;
                    if (mult === 0) {
                        // Skip the GPU shadow path entirely — don't even set v*0
                        desc.set.call(this, 0);
                        return;
                    }
                    desc.set.call(this, mult >= 1 ? v : v * mult);
                }
            });
        } catch (e) {}
    }
    window.PerfQuality = sys;
    patchShadowBlur();
    sys.measure();
})();