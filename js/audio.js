function _createAudio(src, loop = false) {
    const a = new Audio();
    a.preload = "none";
    a.src = src;
    if (loop) a.loop = true;
    return a;
}

const audios = {
    bgm_world1_meadow: _createAudio("assets/audio/bgm/bgm_world1_meadow.mp3", true),
    bgm_world1_cave: _createAudio("assets/audio/bgm/bgm_world1_cave.mp3", true),
    bgm_world1_night: _createAudio("assets/audio/bgm/bgm_world1_night.mp3", true),
    bgm_world1_ice: _createAudio("assets/audio/bgm/bgm_world1_ice.mp3", true),
    bgm_world2_tech: _createAudio("assets/audio/bgm/bgm_world2_tech.mp3", true),
    bgm_world2_pixel_mode: _createAudio("assets/audio/bgm/bgm_world2_pixel_mode.mp3", true),
    bgm_world3_volcano_unused: _createAudio("assets/audio/bgm/bgm_world3_volcano_unused.mp3", true),
    bgm_world3_volcano: _createAudio("assets/audio/bgm/bgm_world3_volcano.mp3", true),
    bgm_world5_dread: _createAudio("assets/audio/bgm/bgm_world5_dread.mp3", true),
    bgm_boss_ice: _createAudio("assets/audio/bgm/bgm_boss_ice.mp3", true),
    sfx_boss3_entry: _createAudio("assets/audio/sfx/sfx_boss3_entry.mp3", true),
    bgm_boss_hacker: _createAudio("assets/audio/bgm/bgm_boss_hacker.mp3", true),
    bgm_menu_title: _createAudio("assets/audio/bgm/bgm_menu_title.mp3", true),
    bgm_menu_level_select: _createAudio("assets/audio/bgm/bgm_menu_level_select.mp3", true),
    bgm_world4_sea: _createAudio("assets/audio/bgm/bgm_world4_sea.mp3", true),
    bgm_boss_kraken: _createAudio("assets/audio/bgm/bgm_boss_kraken.mp3", true),
    bgm_world4_storm: _createAudio("assets/audio/bgm/bgm_world4_storm.mp3", true),
    sfx_kraken_roar_loop: _createAudio("assets/audio/sfx/sfx_kraken_roar_loop.mp3", true),
    sfx_rock_impact: _createAudio("assets/audio/sfx/sfx_rock_impact.mp3"),
    sfx_pain_grunt: _createAudio("assets/audio/sfx/sfx_pain_grunt.mp3"),
    sfx_dizzy_loop: _createAudio("assets/audio/sfx/sfx_dizzy_loop.mp3", true),
    sfx_max_charge_shot: _createAudio("assets/audio/sfx/sfx_max_charge_shot.mp3"),
    sfx_heart_pickup_1: _createAudio("assets/audio/sfx/sfx_heart_pickup_1.mp3"),
    sfx_heart_pickup_2: _createAudio("assets/audio/sfx/sfx_heart_pickup_2.mp3"),
    sfx_heart_pickup_3: _createAudio("assets/audio/sfx/sfx_heart_pickup_3.mp3"),
    sfx_energy_dash: _createAudio("assets/audio/sfx/sfx_energy_dash.mp3"),
    sfx_bonus: _createAudio("assets/audio/sfx/sfx_bonus.mp3"),
    sfx_mega_beam: _createAudio("assets/audio/sfx/sfx_mega_beam.mp3"),
    sfx_rampage_active: _createAudio("assets/audio/sfx/sfx_rampage_active.mp3"),
    bgm_world7_halloween: _createAudio("assets/audio/bgm/bgm_world7_halloween.mp3", true),
    bgm_pumpkin_chase: _createAudio("assets/audio/bgm/bgm_pumpkin_chase.mp3", true),
    bgm_boss_pumpkin: _createAudio("assets/audio/bgm/bgm_boss_pumpkin.mp3", true),
    sfx_halloween_stinger: _createAudio("assets/audio/sfx/sfx_halloween_stinger.mp3"),
    sfx_enemy_to_ghost: _createAudio("assets/audio/sfx/sfx_enemy_to_ghost.mp3"),
    sfx_witch_cackle_1: _createAudio("assets/audio/sfx/sfx_witch_cackle_1.mp3"),
    sfx_witch_cackle_2: _createAudio("assets/audio/sfx/sfx_witch_cackle_2.mp3"),
    sfx_pumpkin_roar_1: _createAudio("assets/audio/sfx/sfx_pumpkin_roar_1.mp3"),
    sfx_pumpkin_roar_2: _createAudio("assets/audio/sfx/sfx_pumpkin_roar_2.mp3"),
    sfx_pumpkin_roar_3: _createAudio("assets/audio/sfx/sfx_pumpkin_roar_3.mp3"),
    sfx_halloween_blackout: _createAudio("assets/audio/sfx/sfx_halloween_blackout.mp3"),
    bgm_world1_creepy: _createAudio("assets/audio/bgm/bgm_world1_creepy.mp3", true),
    bgm_world2_creepy: _createAudio("assets/audio/bgm/bgm_world2_creepy.mp3", true),
    bgm_world3_creepy: _createAudio("assets/audio/bgm/bgm_world3_creepy.mp3", true),
    bgm_world4_creepy: _createAudio("assets/audio/bgm/bgm_world4_creepy.mp3", true),
    bgm_world7_creepy: _createAudio("assets/audio/bgm/bgm_world7_creepy.mp3", true),
    bgm_intro_creepy: _createAudio("assets/audio/bgm/bgm_intro_creepy.mp3", true),
    sfx_demon_growl_1: _createAudio("assets/audio/sfx/sfx_demon_growl_1.mp3"),
    sfx_demon_scream: _createAudio("assets/audio/sfx/sfx_demon_scream.mp3"),
    sfx_demon_chomp: _createAudio("assets/audio/sfx/sfx_demon_chomp.mp3"),
    sfx_footsteps: _createAudio("assets/audio/sfx/sfx_footsteps.mp3"),
    sfx_defeat_jingle: _createAudio("assets/audio/sfx/sfx_defeat_jingle.mp3")
};

if (audios.bgm_menu_title) {
    audios.bgm_menu_title.preload = "auto";
}

let currentBGM = null;

function playBGM(trackName) {
    if (window.postGameHorror) {
        if (trackName === "bgm_menu_title") {
            trackName = "bgm_intro_creepy";
        } else if (trackName === "bgm_menu_level_select") {
            trackName = "bgm_world5_dread";
        } else if (typeof currentLevel === "number") {
            if (currentLevel === 0) trackName = "bgm_world1_creepy"; else if (currentLevel === 3) trackName = "bgm_world4_creepy"; else if (currentLevel === 2) trackName = "bgm_world3_creepy"; else if (currentLevel === 1) trackName = "bgm_world2_creepy"; else if (currentLevel === 6) trackName = "bgm_world7_creepy"; else trackName = "bgm_world5_dread";
        } else {
            trackName = "bgm_world5_dread";
        }
    }
    if (trackName && audios[trackName]) {
        audios[trackName].muted = false;
        if (currentBGM && currentBGM === audios[trackName] && !currentBGM.paused) {
            return;
        }
        if (currentBGM) {
            currentBGM.pause();
            currentBGM.currentTime = 0;
        }
        if (audios[trackName].preload !== "auto") {
            audios[trackName].preload = "auto";
        }
        currentBGM = audios[trackName];
        currentBGM.muted = false;
        currentBGM.volume = 1;
        currentBGM.play().catch(e => console.log("Esperando interacción..."));
    }
}

const _sfxPools = {};
function playSFX(trackName) {
    if (window.postGameHorror && (trackName.startsWith("bgm_boss_") || trackName.startsWith("bgm_"))) {
        return;
    }
    if (!audios[trackName]) return;
    if (audios[trackName].loop) {
        audios[trackName].currentTime = 0;
        audios[trackName].play().catch(e => {});
        return;
    }
    if (!_sfxPools[trackName]) _sfxPools[trackName] = [];
    const pool = _sfxPools[trackName];
    let clone = pool.find(c => c.paused || c.ended || c.currentTime === 0);
    if (!clone && pool.length < 3) {
        clone = audios[trackName].cloneNode();
        pool.push(clone);
    }
    if (!clone) {
        clone = pool[0];
        pool.push(pool.shift());
    }
    clone.currentTime = 0;
    clone.play().catch(e => {});
}

function preloadBGM(trackName) {
    try {
        if (!trackName) return;
        const a = audios[trackName];
        if (!a) return;
        if (typeof a.preload === "string" && a.preload !== "auto") {
            a.preload = "auto";
        }
        if (typeof a.load === "function") a.load();
    } catch (e) {}
}

function preloadNextLevelBGM(idx) {
    try {
        if (typeof levels !== "undefined" && levels[idx + 1] && levels[idx + 1].bgm) {
            preloadBGM(levels[idx + 1].bgm);
        }
    } catch (e) {}
}


function stopAllSFX() {
    const isLevel6 = typeof currentLevel !== "undefined" && currentLevel === 6;
    const keep = [ "bgm_world1_meadow", "bgm_world1_cave", "bgm_world1_night", "bgm_world2_tech", "bgm_world3_volcano", "bgm_world3_volcano_unused", "bgm_world5_dread", "bgm_world1_ice", "bgm_world2_pixel_mode", "bgm_world4_sea", "bgm_boss_kraken", "bgm_world4_storm", "bgm_menu_title", "bgm_menu_level_select", "bgm_world1_creepy", "bgm_world2_creepy", "bgm_world3_creepy", "bgm_world4_creepy", "bgm_world7_creepy", "bgm_intro_creepy" ];
    if (isLevel6) keep.push("bgm_world7_halloween", "bgm_pumpkin_chase", "bgm_boss_pumpkin");
    for (let key in audios) {
        if (!keep.includes(key)) {
            audios[key].pause();
            audios[key].currentTime = 0;
        }
    }
}

let audioCtx = null;

function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext);
    if (audioCtx.state === "suspended") audioCtx.resume();
}

function playSound(freq, duration, type = "square", vol = .1, slideFreq = null, extra = null) {
    if (!audioCtx) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        if (slideFreq) osc.frequency.exponentialRampToValueAtTime(slideFreq, audioCtx.currentTime + duration);
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
}
// Isaac Daniel Cotera - 2026 | Correo: isaacdanielcotera@gmail.com | Itch.io: https://cotera.itch.io | GitHub: https://github.com/cotera2024
