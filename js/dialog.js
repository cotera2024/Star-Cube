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

let hardDialogLock = false;

function showAnimatedDialogue(speaker, avatar, text, onComplete = null, autoCloseMs = null, noSkip = false) {
    if (!dialogBox) {
        window.showAnimatedMessage(text);
        if (onComplete) setTimeout(onComplete, 1800);
        return;
    }
    isDialogActive = true;
    currentDialogText = text;
    dialogCharIndex = 0;
    dialogOnComplete = onComplete;
    techDialogLock = autoCloseMs != null;
    hardDialogLock = noSkip === true;
    const dialogPrompt = document.getElementById("dialog-prompt");
    if (dialogPrompt) {
        dialogPrompt.style.display = autoCloseMs != null ? "none" : "";
        if (typeof __ === "function") dialogPrompt.textContent = __("ui_dialog_prompt");
    }
    if (dialogPortrait) dialogPortrait.textContent = avatar || "🦊";
    if (dialogSpeaker) dialogSpeaker.textContent = speaker || "Peggy";
    if (dialogText) dialogText.textContent = "";
    dialogBox.classList.remove("dialog-hidden");
    if (dialogInterval) clearInterval(dialogInterval);
    let autoCloseTimerId = null;
    dialogInterval = setInterval(() => {
        if (dialogCharIndex < currentDialogText.length) {
            dialogText.textContent += currentDialogText[dialogCharIndex];
            if (dialogCharIndex % 3 === 0) playSound(650, .03, "sine", .04);
            dialogCharIndex++;
        } else {
            clearInterval(dialogInterval);
            dialogInterval = null;
            if (autoCloseMs != null) {
                autoCloseTimerId = setTimeout(() => {
                    if (isDialogActive && dialogOnComplete === onComplete) {
                        isDialogActive = false;
                        techDialogLock = false;
                        hardDialogLock = false;
                        if (dialogBox) dialogBox.classList.add("dialog-hidden");
                        if (dialogOnComplete) {
                            const cb = dialogOnComplete;
                            dialogOnComplete = null;
                            cb();
                        }
                    }
                }, autoCloseMs);
            }
        }
    }, 25);
}

function advanceOrSkipDialogue(byClick = false) {
    if (!isDialogActive) return false;
    if (hardDialogLock) return false;
    if (techDialogLock && typeof currentLevel !== "undefined" && currentLevel === 1 && !byClick) return false;
    if (dialogInterval) {
        clearInterval(dialogInterval);
        dialogInterval = null;
        dialogText.textContent = currentDialogText;
        return true;
    } else {
        isDialogActive = false;
        techDialogLock = false;
        hardDialogLock = false;
        if (dialogBox) dialogBox.classList.add("dialog-hidden");
        if (dialogOnComplete) {
            const cb = dialogOnComplete;
            dialogOnComplete = null;
            cb();
        }
        return true;
    }
}

if (dialogBox) {
    dialogBox.addEventListener("click", () => {
        advanceOrSkipDialogue(true);
    });
}