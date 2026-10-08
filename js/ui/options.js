(function() {
    'use strict';

    function initOptionsManager() {
        const optionsModal = document.getElementById('options-modal');
        const optionsBtn = document.getElementById('options-btn');
        const pauseOptionsBtn = document.getElementById('pause-options-btn');
        const langToggleBtn = document.getElementById('btn-lang-toggle');
        const closeOptions = document.getElementById('close-options');
        const closeOptionsBtn = document.getElementById('close-options-btn');

        const bgmSlider = document.getElementById('bgm-slider');
        const sfxSlider = document.getElementById('sfx-slider');
        const bgmVolText = document.getElementById('bgm-vol-text');
        const sfxVolText = document.getElementById('sfx-vol-text');
        const btnToggleBgm = document.getElementById('btn-toggle-bgm');
        const btnToggleSfx = document.getElementById('btn-toggle-sfx');
        const btnTestSfx = document.getElementById('btn-test-sfx');

        const btnQuickBoth = document.getElementById('btn-quick-both');
        const btnQuickMusic = document.getElementById('btn-quick-music');
        const btnQuickSfx = document.getElementById('btn-quick-sfx');
        const btnQuickMute = document.getElementById('btn-quick-mute');

        function updateSliderVisual(slider, val, isMuted) {
            if (!slider) return;
            const pct = isMuted ? 0 : val;
            slider.style.background = isMuted
                ? `linear-gradient(90deg, #475569 0%, #334155 100%)`
                : `linear-gradient(90deg, #ff007f 0%, #f43f5e ${Math.min(pct, 70)}%, #ffd700 ${pct}%, rgba(255,255,255,0.15) ${pct}%)`;
        }

        function syncOptionsUI() {
            const musicVol = typeof window.getMusicVolume === 'function' ? window.getMusicVolume() : 0.8;
            const soundVol = typeof window.getSoundVolume === 'function' ? window.getSoundVolume() : 0.8;
            const musicMuted = typeof window.isMusicMuted === 'function' ? window.isMusicMuted() : false;
            const soundMuted = typeof window.isSoundMuted === 'function' ? window.isSoundMuted() : false;

            const musicPct = Math.round(musicVol * 100);
            const soundPct = Math.round(soundVol * 100);

            if (bgmSlider) {
                bgmSlider.value = musicPct;
                updateSliderVisual(bgmSlider, musicPct, musicMuted);
            }
            if (sfxSlider) {
                sfxSlider.value = soundPct;
                updateSliderVisual(sfxSlider, soundPct, soundMuted);
            }

            if (bgmVolText) {
                bgmVolText.textContent = musicMuted ? '0%' : `${musicPct}%`;
                bgmVolText.style.color = musicMuted ? '#94a3b8' : '#00ffff';
            }
            if (sfxVolText) {
                sfxVolText.textContent = soundMuted ? '0%' : `${soundPct}%`;
                sfxVolText.style.color = soundMuted ? '#94a3b8' : '#00ffff';
            }

            if (btnToggleBgm) {
                btnToggleBgm.textContent = musicMuted || musicPct === 0 ? '🔇' : '🔊';
                btnToggleBgm.classList.toggle('muted', musicMuted || musicPct === 0);
            }
            if (btnToggleSfx) {
                btnToggleSfx.textContent = soundMuted || soundPct === 0 ? '🔇' : '🔊';
                btnToggleSfx.classList.toggle('muted', soundMuted || soundPct === 0);
            }

            const bothActive = !musicMuted && !soundMuted && musicPct > 0 && soundPct > 0;
            const musicOnlyActive = !musicMuted && soundMuted && musicPct > 0;
            const sfxOnlyActive = musicMuted && !soundMuted && soundPct > 0;
            const allMutedActive = (musicMuted || musicPct === 0) && (soundMuted || soundPct === 0);

            if (btnQuickBoth) btnQuickBoth.classList.toggle('active', bothActive);
            if (btnQuickMusic) btnQuickMusic.classList.toggle('active', musicOnlyActive);
            if (btnQuickSfx) btnQuickSfx.classList.toggle('active', sfxOnlyActive);
            if (btnQuickMute) btnQuickMute.classList.toggle('active', allMutedActive);

            const curLang = typeof window.getCurrentLang === 'function' ? window.getCurrentLang() : 'es';
            document.querySelectorAll('.opt-lang-card').forEach(card => {
                const lang = card.getAttribute('data-lang');
                card.classList.toggle('active', lang === curLang);
            });
        }

        window.syncOptionsUI = syncOptionsUI;

        function openOptionsModal() {
            if (!optionsModal) return;
            syncOptionsUI();
            optionsModal.style.zIndex = '10005';
            optionsModal.classList.add('active');
            if (typeof window.updateUITranslations === 'function') {
                window.updateUITranslations();
            }
        }

        function closeOptionsModal() {
            if (!optionsModal) return;
            optionsModal.classList.remove('active');
        }

        window.openOptionsModal = openOptionsModal;
        window.closeOptionsModal = closeOptionsModal;

        if (bgmSlider) {
            bgmSlider.addEventListener('input', e => {
                const val = parseFloat(e.target.value) / 100;
                if (typeof window.setMusicMuted === 'function' && window.isMusicMuted() && val > 0) {
                    window.setMusicMuted(false);
                }
                if (typeof window.setMusicVolume === 'function') {
                    window.setMusicVolume(val);
                }
                syncOptionsUI();
            });
        }

        if (sfxSlider) {
            sfxSlider.addEventListener('input', e => {
                const val = parseFloat(e.target.value) / 100;
                if (typeof window.setSoundMuted === 'function' && window.isSoundMuted() && val > 0) {
                    window.setSoundMuted(false);
                }
                if (typeof window.setSoundVolume === 'function') {
                    window.setSoundVolume(val);
                }
                syncOptionsUI();
            });
            sfxSlider.addEventListener('change', () => {
                if (typeof window.playTestSFX === 'function' && !window.isSoundMuted()) {
                    window.playTestSFX();
                }
            });
        }

        if (btnToggleBgm) {
            btnToggleBgm.addEventListener('click', () => {
                if (typeof window.isMusicMuted === 'function' && typeof window.setMusicMuted === 'function') {
                    const nextMuted = !window.isMusicMuted();
                    window.setMusicMuted(nextMuted);
                    if (!nextMuted && window.getMusicVolume() <= 0.05) {
                        window.setMusicVolume(0.8);
                    }
                }
                syncOptionsUI();
            });
        }

        if (btnToggleSfx) {
            btnToggleSfx.addEventListener('click', () => {
                if (typeof window.isSoundMuted === 'function' && typeof window.setSoundMuted === 'function') {
                    const nextMuted = !window.isSoundMuted();
                    window.setSoundMuted(nextMuted);
                    if (!nextMuted && window.getSoundVolume() <= 0.05) {
                        window.setSoundVolume(0.8);
                    }
                    if (!nextMuted && typeof window.playTestSFX === 'function') {
                        window.playTestSFX();
                    }
                }
                syncOptionsUI();
            });
        }

        if (btnQuickBoth) {
            btnQuickBoth.addEventListener('click', () => {
                if (typeof window.setMusicMuted === 'function') window.setMusicMuted(false);
                if (typeof window.setSoundMuted === 'function') window.setSoundMuted(false);
                if (typeof window.getMusicVolume === 'function' && window.getMusicVolume() <= 0.05) {
                    window.setMusicVolume(0.8);
                }
                if (typeof window.getSoundVolume === 'function' && window.getSoundVolume() <= 0.05) {
                    window.setSoundVolume(0.8);
                }
                if (typeof window.playTestSFX === 'function') window.playTestSFX();
                syncOptionsUI();
            });
        }

        if (btnQuickMusic) {
            btnQuickMusic.addEventListener('click', () => {
                if (typeof window.setMusicMuted === 'function') window.setMusicMuted(false);
                if (typeof window.setSoundMuted === 'function') window.setSoundMuted(true);
                if (typeof window.getMusicVolume === 'function' && window.getMusicVolume() <= 0.05) {
                    window.setMusicVolume(0.8);
                }
                syncOptionsUI();
            });
        }

        if (btnQuickSfx) {
            btnQuickSfx.addEventListener('click', () => {
                if (typeof window.setMusicMuted === 'function') window.setMusicMuted(true);
                if (typeof window.setSoundMuted === 'function') window.setSoundMuted(false);
                if (typeof window.getSoundVolume === 'function' && window.getSoundVolume() <= 0.05) {
                    window.setSoundVolume(0.8);
                }
                if (typeof window.playTestSFX === 'function') window.playTestSFX();
                syncOptionsUI();
            });
        }

        if (btnQuickMute) {
            btnQuickMute.addEventListener('click', () => {
                if (typeof window.setMusicMuted === 'function') window.setMusicMuted(true);
                if (typeof window.setSoundMuted === 'function') window.setSoundMuted(true);
                syncOptionsUI();
            });
        }

        if (btnTestSfx) {
            btnTestSfx.addEventListener('click', () => {
                if (typeof window.playTestSFX === 'function') {
                    window.playTestSFX();
                }
            });
        }

        document.querySelectorAll('.opt-lang-card').forEach(btn => {
            btn.addEventListener('click', async () => {
                const lang = btn.getAttribute('data-lang');
                if (typeof window.setLanguage === 'function') {
                    await window.setLanguage(lang);
                }
                if (typeof window.updateUITranslations === 'function') {
                    window.updateUITranslations();
                }
                syncOptionsUI();
            });
        });

        if (optionsBtn) {
            optionsBtn.addEventListener('click', openOptionsModal);
        }
        if (pauseOptionsBtn) {
            pauseOptionsBtn.addEventListener('click', openOptionsModal);
        }
        if (langToggleBtn) {
            langToggleBtn.addEventListener('click', () => {
                openOptionsModal();
            });
        }

        if (closeOptions) {
            closeOptions.addEventListener('click', closeOptionsModal);
        }
        if (closeOptionsBtn) {
            closeOptionsBtn.addEventListener('click', closeOptionsModal);
        }
        if (optionsModal) {
            optionsModal.addEventListener('click', e => {
                if (e.target === optionsModal) closeOptionsModal();
            });
        }

        document.addEventListener('audioSettingsChanged', syncOptionsUI);
        document.addEventListener('languageChanged', syncOptionsUI);

        syncOptionsUI();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOptionsManager);
    } else {
        initOptionsManager();
    }
})();
