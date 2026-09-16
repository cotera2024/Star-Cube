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
        if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
        let navLang = (navigator.language || navigator.userLanguage || "en").slice(0, 2).toLowerCase();
        if (SUPPORTED_LANGS.includes(navLang)) return navLang;
    } catch (e) {}
    return "es";
}

let currentLang = detectInitialLang();

let translations = {};

let loadedLangs = {};

function getLangName(langCode, displayLang) {
    return LANG_NAMES[langCode]?.[displayLang] || langCode.toUpperCase();
}

function getFlag(langCode) {
    return LANG_FLAGS[langCode] || "🏳️";
}

async function loadLang(langCode) {
    if (loadedLangs[langCode]) return translations[langCode];
    try {
        const response = await fetch(`assets/lang/${langCode}.json`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        translations[langCode] = data;
        loadedLangs[langCode] = true;
        return data;
    } catch (e) {
        console.error(`Error cargando idioma ${langCode}:`, e);
        if (langCode !== "es") {
            return loadLang("es");
        }
        return {};
    }
}

async function preloadAllLangs() {
    const promises = SUPPORTED_LANGS.map(code => loadLang(code));
    await Promise.all(promises);
}

function __(key, ...args) {
    if (typeof window !== "undefined" && (window.isMobileDevice || window.isMobileOrTouch?.())) {
        const touchKey = key + "_touch";
        const langData = translations[currentLang];
        if (langData && langData[touchKey] !== undefined) {
            key = touchKey;
        } else if (translations["es"] && translations["es"][touchKey] !== undefined) {
            key = touchKey;
        }
    }
    const langData = translations[currentLang];
    if (!langData) return key;
    let text = langData[key];
    if (text === undefined) {
        const esData = translations["es"];
        text = esData?.[key] || key;
    }
    if (args.length > 0) {
        text = text.replace(/%(\d+)/g, (match, num) => {
            const idx = parseInt(num) - 1;
            return idx < args.length ? args[idx] : match;
        });
    }
    return text;
}

async function setLanguage(langCode) {
    if (!SUPPORTED_LANGS.includes(langCode)) return false;
    if (!loadedLangs[langCode]) {
        await loadLang(langCode);
    }
    currentLang = langCode;
    localStorage.setItem("starcube_lang", langCode);
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