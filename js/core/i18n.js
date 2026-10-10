const SUPPORTED_LANGS = [ "es", "en", "zh", "ja", "ru" ];

const LANG_FLAGS = {
    es: "🇪🇸",
    en: "🇬🇧",
    zh: "🇨🇳",
    ja: "🇯🇵",
    ru: "🇷🇺"
};

const LANG_NAMES = {
    es: {
        es: "Español",
        en: "Spanish",
        zh: "西班牙语",
        ja: "スペイン語",
        ru: "Испанский"
    },
    en: {
        es: "Inglés",
        en: "English",
        zh: "英语",
        ja: "英語",
        ru: "Английский"
    },
    zh: {
        es: "Chino",
        en: "Chinese",
        zh: "中文",
        ja: "中国語",
        ru: "Китайский"
    },
    ja: {
        es: "Japonés",
        en: "Japanese",
        zh: "日语",
        ja: "日本語",
        ru: "Японский"
    },
    ru: {
        es: "Ruso",
        en: "Russian",
        zh: "俄语",
        ja: "ロシア語",
        ru: "Русский"
    }
};

function detectInitialLang() {
    try {
        let saved = localStorage.getItem("starcube_lang");
        if (saved && SUPPORTED_LANGS.includes(saved)) {
            return saved;
        }

        const candidates = [];
        if (typeof navigator !== "undefined") {
            if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
                candidates.push(...navigator.languages);
            }
            if (navigator.language) {
                candidates.push(navigator.language);
            }
            if (navigator.userLanguage) {
                candidates.push(navigator.userLanguage);
            }
            if (navigator.browserLanguage) {
                candidates.push(navigator.browserLanguage);
            }
        }

        for (let candidate of candidates) {
            if (!candidate || typeof candidate !== "string") continue;
            let clean = candidate.trim().toLowerCase();
            
            if (SUPPORTED_LANGS.includes(clean)) {
                return clean;
            }

            let code = clean.split(/[-_]/)[0];
            if (SUPPORTED_LANGS.includes(code)) {
                return code;
            }
        }
    } catch (e) {
        console.warn("Language detection error, defaulting to 'en':", e);
    }

    return "en";
}

let currentLang = detectInitialLang();

if (typeof document !== "undefined") {
    const syncBadge = () => {
        const el = document.getElementById("lang-toggle-code");
        if (el) el.textContent = currentLang.toUpperCase();
    };
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", syncBadge);
    } else {
        syncBadge();
    }
}

let translations = {};

let loadedLangs = {};

function getLangName(langCode, displayLang) {
    return LANG_NAMES[langCode]?.[displayLang] || langCode.toUpperCase();
}

function getFlag(langCode) {
    return LANG_FLAGS[langCode] || "🏳️";
}

let esReverseMap = new Map();

function registerReverseKeys(data) {
    if (!data || typeof data !== "object") return;
    for (const [k, v] of Object.entries(data)) {
        if (typeof v === "string" && v.trim().length > 0) {
            const norm = v.trim().toLowerCase();
            if (!esReverseMap.has(norm)) {
                esReverseMap.set(norm, k);
            }
            try {
                const clean = norm.replace(/^[\p{Extended_Pictographic}\s]+|[\p{Extended_Pictographic}\s]+$/gu, "").trim();
                if (clean && !esReverseMap.has(clean)) {
                    esReverseMap.set(clean, k);
                }
            } catch (e) {}
        }
    }
}

async function loadLang(langCode) {
    if (loadedLangs[langCode]) return translations[langCode];
    try {
        const response = await fetch(`assets/lang/${langCode}.json`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        translations[langCode] = data;
        loadedLangs[langCode] = true;
        if (langCode === "es") {
            registerReverseKeys(data);
        }
        return data;
    } catch (e) {
        console.error(`Error cargando idioma ${langCode}:`, e);
        if (langCode !== "en") {
            return loadLang("en");
        }
        return {};
    }
}

async function preloadAllLangs() {
    try {
        await loadLang(currentLang);
        if (currentLang !== "es") {
            loadLang("es").catch(() => {});
        }
        if (typeof window !== "undefined" && typeof window.updateUITranslations === "function") {
            try { window.updateUITranslations(); } catch (e) {}
        }
    } catch (e) {}

    const others = SUPPORTED_LANGS.filter(code => code !== currentLang && code !== "es");
    Promise.all(others.map(code => loadLang(code))).catch(() => {});
}

function __(key, ...args) {
    if (key === null || key === undefined) return "";
    let lookupKey = key;
    const isHorror = typeof window !== "undefined" && (!!window.postGameHorror || (typeof document !== "undefined" && document.body && document.body.classList.contains("horror-mode")));
    if (isHorror && typeof lookupKey === "string") {
        const horrorCandidate = lookupKey + "_horror";
        const langData = translations[currentLang];
        if (langData && langData[horrorCandidate] !== undefined) {
            lookupKey = horrorCandidate;
        } else if (translations["es"] && translations["es"][horrorCandidate] !== undefined) {
            lookupKey = horrorCandidate;
        } else if (translations["en"] && translations["en"][horrorCandidate] !== undefined) {
            lookupKey = horrorCandidate;
        }
    }
    if (typeof window !== "undefined" && (window.isMobileDevice || window.isMobileOrTouch?.())) {
        const touchKey = lookupKey + "_touch";
        const langData = translations[currentLang];
        if (langData && langData[touchKey] !== undefined) {
            lookupKey = touchKey;
        } else if (translations["en"] && translations["en"][touchKey] !== undefined) {
            lookupKey = touchKey;
        }
    }
    const langData = translations[currentLang];
    let text = langData ? langData[lookupKey] : undefined;
    if (text === undefined) {
        const enData = translations["en"] || translations["es"];
        text = enData?.[lookupKey];
    }
    if (text === undefined && typeof lookupKey === "string" && esReverseMap.size > 0) {
        const norm = lookupKey.trim().toLowerCase();
        let mappedKey = esReverseMap.get(norm);
        if (!mappedKey) {
            try {
                const clean = norm.replace(/^[\p{Extended_Pictographic}\s]+|[\p{Extended_Pictographic}\s]+$/gu, "").trim();
                if (clean) mappedKey = esReverseMap.get(clean);
            } catch (e) {}
        }
        if (mappedKey) {
            if (isHorror) {
                const mappedHorror = mappedKey + "_horror";
                if (langData && langData[mappedHorror] !== undefined) {
                    mappedKey = mappedHorror;
                } else if (translations["es"] && translations["es"][mappedHorror] !== undefined) {
                    mappedKey = mappedHorror;
                }
            }
            if (langData && langData[mappedKey] !== undefined) {
                text = langData[mappedKey];
            } else {
                const enData = translations["en"] || translations["es"];
                text = enData?.[mappedKey];
            }
        }
    }
    if (text === undefined) {
        if (typeof lookupKey === "string" && (lookupKey.startsWith("ui_") || lookupKey.startsWith("flt_") || lookupKey.startsWith("dlg_") || lookupKey.startsWith("msg_") || lookupKey.startsWith("boss_") || lookupKey.startsWith("map_") || lookupKey.startsWith("sys_"))) {
            return "";
        }
        return lookupKey;
    }
    if (args.length > 0 && typeof text === "string") {
        text = text.replace(/%(\d+)/g, (match, num) => {
            const idx = parseInt(num) - 1;
            return idx < args.length ? args[idx] : match;
        });
    }
    return text || lookupKey;
}

async function setLanguage(langCode) {
    if (!SUPPORTED_LANGS.includes(langCode)) return false;
    if (!loadedLangs[langCode]) {
        await loadLang(langCode);
    }
    currentLang = langCode;
    window.currentLang = langCode;
    if (typeof window !== "undefined") {
        window._tutorialSignCache = {};
    }
    storageSet("starcube_lang", langCode);
    if (typeof window !== "undefined" && typeof window.updateUITranslations === "function") {
        try { window.updateUITranslations(); } catch (e) {}
    }
    document.dispatchEvent(new CustomEvent("languageChanged", {
        detail: {
            lang: langCode
        }
    }));
    return true;
}

function getCurrentLang() {
    return currentLang;
}

function storageGet(key) {
    try {
        return localStorage.getItem(String(key));
    } catch (e) {}
    return null;
}

function storageSet(key, value) {
    try {
        localStorage.setItem(String(key), String(value));
    } catch (e) {}
}

function storageRemove(key) {
    try {
        localStorage.removeItem(String(key));
    } catch (e) {}
}

window.__ = __;
window.currentLang = currentLang;
window.getCurrentLang = getCurrentLang;
window.setLanguage = setLanguage;
window.storageGet = storageGet;
window.storageSet = storageSet;
window.storageRemove = storageRemove;

preloadAllLangs();

