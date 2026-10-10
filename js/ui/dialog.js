const dialogBox = document.getElementById("dialog-box");

const dialogPortrait = document.getElementById("dialog-portrait");

const dialogSpeaker = document.getElementById("dialog-speaker");

const dialogText = document.getElementById("dialog-text");

let currentDialogText = "";

let dialogCharIndex = 0;

let dialogInterval = null;

let dialogOnComplete = null;

let isDialogActive = false;

let techDialogLock = false;

let currentAutoCloseMs = null;
let activeAutoCloseTimerId = null;

function showAnimatedDialogue(speaker, avatar, text, onComplete = null, autoCloseMs = null, noSkip = false) {
    if (activeAutoCloseTimerId) {
        clearTimeout(activeAutoCloseTimerId);
        activeAutoCloseTimerId = null;
    }
    if (dialogInterval) {
        clearInterval(dialogInterval);
        dialogInterval = null;
    }

    let translatedSpeaker = speaker;
    if (typeof __ === "function" && speaker && typeof speaker === "string") {
        translatedSpeaker = __(speaker);
    }
    let safeText = (text && typeof text === "string") ? text.trim() : (text ? String(text) : "");
    if (typeof __ === "function" && safeText) {
        safeText = __(safeText);
    }
    if (!safeText) {
        if (dialogBox) dialogBox.classList.add("dialog-hidden");
        isDialogActive = false;
        techDialogLock = false;
        hardDialogLock = false;
        if (onComplete) {
            try { onComplete(); } catch (e) { console.error(e); }
        }
        return;
    }

    if (!dialogBox) {
        window.showAnimatedMessage(safeText);
        if (onComplete) setTimeout(onComplete, 1800);
        return;
    }

    isDialogActive = true;
    currentDialogText = safeText;
    dialogCharIndex = 0;
    dialogOnComplete = onComplete;
    currentAutoCloseMs = autoCloseMs;
    techDialogLock = autoCloseMs != null;
    hardDialogLock = noSkip === true;

    const dialogPrompt = document.getElementById("dialog-prompt");
    if (dialogPrompt) {
        dialogPrompt.style.display = autoCloseMs != null ? "none" : "";
        if (typeof __ === "function") dialogPrompt.textContent = __("ui_dialog_prompt");
    }
    const isHorror = typeof window !== "undefined" && (!!window.postGameHorror || (typeof document !== "undefined" && document.body && document.body.classList.contains("horror-mode")));
    let displayAvatar = avatar || "🦊";
    if (isHorror) {
        if (displayAvatar === "😎") displayAvatar = "😈";
        else if (displayAvatar === "🔷") displayAvatar = "👁️";
        else if (displayAvatar === "🐙") displayAvatar = "🩸";
        else if (displayAvatar === "🎃") displayAvatar = "🔥";
        else if (displayAvatar === "🌀") displayAvatar = "☠️";
        else if (displayAvatar === "💻") displayAvatar = "⚠️";
    }
    if (dialogBox) {
        if (isHorror) {
            dialogBox.style.background = "linear-gradient(180deg, rgba(20, 2, 5, 0.96) 0%, rgba(5, 0, 2, 0.98) 100%)";
            dialogBox.style.borderColor = "#dc2626";
            dialogBox.style.boxShadow = "0 12px 35px rgba(220, 38, 38, 0.45), inset 0 0 20px rgba(0, 0, 0, 0.9)";
            if (dialogSpeaker) {
                dialogSpeaker.style.color = "#ff4444";
                dialogSpeaker.style.fontFamily = "'Courier Prime', monospace";
            }
            if (dialogText) {
                dialogText.style.color = "#ffcccc";
                dialogText.style.fontFamily = "'Courier Prime', monospace";
            }
            if (dialogPortrait) {
                dialogPortrait.style.background = "#2a0505";
                dialogPortrait.style.borderColor = "#991b1b";
            }
        } else {
            dialogBox.style.background = "";
            dialogBox.style.borderColor = "";
            dialogBox.style.boxShadow = "";
            if (dialogSpeaker) {
                dialogSpeaker.style.color = "";
                dialogSpeaker.style.fontFamily = "";
            }
            if (dialogText) {
                dialogText.style.color = "";
                dialogText.style.fontFamily = "";
            }
            if (dialogPortrait) {
                dialogPortrait.style.background = "";
                dialogPortrait.style.borderColor = "";
            }
        }
    }
    if (dialogPortrait) dialogPortrait.textContent = displayAvatar;
    if (dialogSpeaker) dialogSpeaker.textContent = translatedSpeaker || "Peggy";
    if (dialogText) dialogText.textContent = "";
    dialogBox.classList.remove("dialog-hidden");

    dialogInterval = setInterval(() => {
        if (dialogCharIndex < currentDialogText.length) {
            dialogText.textContent += currentDialogText[dialogCharIndex];
            if (dialogCharIndex % 3 === 0) playSound(isHorror ? 160 : 650, .03, isHorror ? "sawtooth" : "sine", isHorror ? .06 : .04);
            dialogCharIndex++;
        } else {
            clearInterval(dialogInterval);
            dialogInterval = null;
            if (currentAutoCloseMs != null) {
                if (activeAutoCloseTimerId) clearTimeout(activeAutoCloseTimerId);
                activeAutoCloseTimerId = setTimeout(() => {
                    if (isDialogActive) {
                        hideDialogue();
                    }
                }, currentAutoCloseMs);
            }
        }
    }, 25);
}

function advanceOrSkipDialogue(byClick = false) {
    if (!isDialogActive) return false;
    if (hardDialogLock) return false;
    if (techDialogLock) return false;
    if (dialogInterval) {
        clearInterval(dialogInterval);
        dialogInterval = null;
        if (dialogText) dialogText.textContent = currentDialogText;
        if (currentAutoCloseMs != null) {
            if (activeAutoCloseTimerId) clearTimeout(activeAutoCloseTimerId);
            activeAutoCloseTimerId = setTimeout(() => {
                if (isDialogActive) {
                    hideDialogue();
                }
            }, Math.min(1000, currentAutoCloseMs));
        }
        return true;
    } else {
        hideDialogue();
        return true;
    }
}

function hideDialogue() {
    isDialogActive = false;
    techDialogLock = false;
    hardDialogLock = false;
    currentAutoCloseMs = null;
    if (activeAutoCloseTimerId) {
        clearTimeout(activeAutoCloseTimerId);
        activeAutoCloseTimerId = null;
    }
    if (dialogInterval) {
        clearInterval(dialogInterval);
        dialogInterval = null;
    }
    if (dialogBox) dialogBox.classList.add("dialog-hidden");
    if (dialogText) dialogText.textContent = "";
    if (dialogOnComplete) {
        const cb = dialogOnComplete;
        dialogOnComplete = null;
        try { cb(); } catch (e) { console.error(e); }
    }
}
function cancelDialogue() {
    isDialogActive = false;
    techDialogLock = false;
    hardDialogLock = false;
    currentAutoCloseMs = null;
    dialogOnComplete = null;
    if (activeAutoCloseTimerId) {
        clearTimeout(activeAutoCloseTimerId);
        activeAutoCloseTimerId = null;
    }
    if (dialogInterval) {
        clearInterval(dialogInterval);
        dialogInterval = null;
    }
    if (dialogBox) dialogBox.classList.add("dialog-hidden");
    if (dialogText) dialogText.textContent = "";
}
window.cancelDialogue = cancelDialogue;
window.hideDialogue = hideDialogue;
window.closeDialogue = hideDialogue;

if (dialogBox) {
    dialogBox.addEventListener("click", () => {
        advanceOrSkipDialogue(true);
    });
}
