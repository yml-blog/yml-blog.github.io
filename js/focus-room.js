(function () {
    'use strict';

    var thresholdStage = document.querySelector('[data-threshold-stage]');
    var thresholdTrigger = document.querySelector('[data-threshold-trigger]');
    var thresholdLabel = document.querySelector('[data-threshold-label]');
    var thresholdPrompt = document.querySelector('[data-threshold-prompt]');
    var prototypeAnchor = document.querySelector('#prototype');
    var roomShell = document.querySelector('[data-room-shell]');
    var ghostPanels = Array.prototype.slice.call(document.querySelectorAll('[data-ghost-panel]'));
    var codeButtons = Array.prototype.slice.call(document.querySelectorAll('[data-code-file]'));
    var codePath = document.querySelector('[data-code-path]');
    var codeContent = document.querySelector('[data-code-content]');
    var codeStatus = document.querySelector('[data-code-status]');
    var timerDisplay = document.querySelector('[data-session-clock]');
    var timerStatus = document.querySelector('[data-session-status]');
    var timerRing = document.querySelector('[data-ring-progress]');
    var durationButtons = Array.prototype.slice.call(document.querySelectorAll('[data-duration]'));
    var startButton = document.querySelector('[data-session-start]');
    var resetButton = document.querySelector('[data-session-reset]');
    var completionNote = document.querySelector('[data-completion-note]');
    var layerToggles = Array.prototype.slice.call(document.querySelectorAll('[data-layer-toggle]'));
    var layerSliders = Array.prototype.slice.call(document.querySelectorAll('[data-layer-volume]'));

    var thresholdState = {
        active: false,
        startedAt: 0,
        frame: null,
        holdDuration: 1450
    };

    var timerState = {
        selectedMinutes: 25,
        demoDurationMs: 90000,
        running: false,
        startedAt: null,
        pausedElapsedMs: 0,
        frame: null
    };

    function setHoldProgress(progress) {
        if (!thresholdStage) {
            return;
        }

        var value = Math.max(0, Math.min(1, progress));
        thresholdStage.style.setProperty('--fr-hold-progress', value.toFixed(3));
    }

    function finishThresholdEntry() {
        if (!thresholdStage) {
            return;
        }

        thresholdStage.classList.remove('is-holding');
        thresholdStage.classList.add('is-entered');
        document.body.classList.add('is-focus-room-entered');
        setHoldProgress(1);

        if (thresholdLabel) {
            thresholdLabel.textContent = 'Entered';
        }

        if (thresholdPrompt) {
            thresholdPrompt.textContent = 'The room opens gently and the main study wakes up below.';
        }

        if (roomShell) {
            roomShell.classList.add('is-awake');
            roomShell.style.setProperty('--fr-session-progress', '0.18');
            roomShell.style.setProperty('--fr-lamp-warmth', '0.36');
            wakeGhostUI();
        }

        window.setTimeout(function () {
            if (prototypeAnchor) {
                prototypeAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 360);
    }

    function releaseThreshold() {
        thresholdState.active = false;
        thresholdState.startedAt = 0;
        thresholdStage && thresholdStage.classList.remove('is-holding');
        thresholdTrigger && thresholdTrigger.classList.remove('is-holding');

        if (thresholdState.frame) {
            window.cancelAnimationFrame(thresholdState.frame);
            thresholdState.frame = null;
        }

        if (thresholdStage && !thresholdStage.classList.contains('is-entered')) {
            setHoldProgress(0);
        }
    }

    function tickThreshold(now) {
        if (!thresholdState.active) {
            return;
        }

        if (!thresholdState.startedAt) {
            thresholdState.startedAt = now;
        }

        var elapsed = now - thresholdState.startedAt;
        var progress = elapsed / thresholdState.holdDuration;
        setHoldProgress(progress);

        if (progress >= 1) {
            thresholdState.active = false;
            finishThresholdEntry();
            return;
        }

        thresholdState.frame = window.requestAnimationFrame(tickThreshold);
    }

    if (thresholdStage && thresholdTrigger) {
        var beginThreshold = function (event) {
            if (thresholdStage.classList.contains('is-entered')) {
                return;
            }

            if (event) {
                event.preventDefault();
            }

            thresholdState.active = true;
            thresholdState.startedAt = 0;
            thresholdStage.classList.add('is-holding');
            thresholdTrigger.classList.add('is-holding');

            if (thresholdLabel) {
                thresholdLabel.textContent = 'Holding';
            }

            if (thresholdPrompt) {
                thresholdPrompt.textContent = 'Blur lifts, glow opens, and the room begins to come forward.';
            }

            if (thresholdState.frame) {
                window.cancelAnimationFrame(thresholdState.frame);
            }

            thresholdState.frame = window.requestAnimationFrame(tickThreshold);
        };

        var cancelThreshold = function () {
            if (thresholdStage.classList.contains('is-entered')) {
                return;
            }

            if (thresholdLabel) {
                thresholdLabel.textContent = 'Hold to Enter';
            }

            if (thresholdPrompt) {
                thresholdPrompt.textContent = 'Press and hold to dissolve the threshold and let the room surface.';
            }

            releaseThreshold();
        };

        thresholdTrigger.addEventListener('pointerdown', beginThreshold);
        thresholdTrigger.addEventListener('pointerup', cancelThreshold);
        thresholdTrigger.addEventListener('pointerleave', cancelThreshold);
        thresholdTrigger.addEventListener('pointercancel', cancelThreshold);
    }

    var ghostTimer = null;

    function wakeGhostUI() {
        if (!ghostPanels.length) {
            return;
        }

        ghostPanels.forEach(function (panel) {
            panel.classList.add('is-awake');
        });

        if (roomShell) {
            roomShell.style.setProperty('--fr-ghost-opacity', '0.94');
        }

        window.clearTimeout(ghostTimer);
        ghostTimer = window.setTimeout(function () {
            ghostPanels.forEach(function (panel) {
                panel.classList.remove('is-awake');
            });

            if (roomShell) {
                roomShell.style.setProperty('--fr-ghost-opacity', timerState.running ? '0.34' : '0.54');
            }
        }, 2600);
    }

    if (roomShell) {
        ['pointermove', 'pointerdown', 'touchstart', 'focusin'].forEach(function (eventName) {
            roomShell.addEventListener(eventName, wakeGhostUI, { passive: true });
        });
    }

    function formatTimeFromProgress(progress) {
        var totalSeconds = timerState.selectedMinutes * 60;
        var remainingSeconds = Math.max(0, Math.ceil(totalSeconds * (1 - progress)));
        var minutes = Math.floor(remainingSeconds / 60);
        var seconds = remainingSeconds % 60;
        return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    }

    function applySessionVisuals(progress) {
        if (!roomShell) {
            return;
        }

        var clamped = Math.max(0, Math.min(1, progress));
        roomShell.style.setProperty('--fr-session-progress', clamped.toFixed(3));
        roomShell.style.setProperty('--fr-lamp-warmth', (0.28 + clamped * 0.48).toFixed(3));

        var rainToggle = document.querySelector('[data-layer-toggle="rain"]');
        var rainSlider = document.querySelector('[data-layer-volume="rain"]');
        var rainStrength = 0.08;

        if (rainToggle && rainToggle.checked && rainSlider) {
            rainStrength = Math.max(0.2, Number(rainSlider.value || '0.55') + clamped * 0.16);
        }

        roomShell.style.setProperty('--fr-rain-strength', Math.min(1, rainStrength).toFixed(3));
        roomShell.style.setProperty('--fr-note-opacity', clamped >= 1 ? '1' : '0');
        roomShell.style.setProperty('--fr-bonus-star-opacity', clamped >= 1 ? '1' : '0');
    }

    function syncLayerVisual(layerName) {
        if (!roomShell) {
            return;
        }

        var toggle = document.querySelector('[data-layer-toggle="' + layerName + '"]');
        var slider = document.querySelector('[data-layer-volume="' + layerName + '"]');
        var valueNodes = Array.prototype.slice.call(document.querySelectorAll('[data-layer-value="' + layerName + '"]'));
        var isOn = !!(toggle && toggle.checked);
        var volume = slider ? Number(slider.value || '0') : 0;

        valueNodes.forEach(function (node) {
            node.textContent = Math.round(volume * 100) + '%';
        });

        if (layerName === 'piano') {
            roomShell.classList.toggle('is-piano-active', isOn && volume > 0.05);
        }

        if (layerName === 'rain') {
            roomShell.style.setProperty('--fr-rain-strength', isOn ? Math.max(0.2, volume).toFixed(3) : '0.08');
        }
    }

    function finishSession() {
        timerState.running = false;
        timerState.startedAt = null;
        timerState.pausedElapsedMs = timerState.demoDurationMs;

        if (startButton) {
            startButton.textContent = 'Start Another Session';
        }

        if (timerStatus) {
            timerStatus.textContent = 'Complete';
        }

        applySessionVisuals(1);

        if (timerDisplay) {
            timerDisplay.textContent = '00:00';
        }

        if (timerRing) {
            timerRing.style.setProperty('--fr-ring-progress', '1');
        }

        if (completionNote) {
            completionNote.classList.add('is-visible');
        }

        wakeGhostUI();
    }

    function tickSession(now) {
        if (!timerState.running) {
            return;
        }

        if (!timerState.startedAt) {
            timerState.startedAt = now;
        }

        var elapsed = timerState.pausedElapsedMs + (now - timerState.startedAt);
        var progress = Math.max(0, Math.min(1, elapsed / timerState.demoDurationMs));

        if (timerRing) {
            timerRing.style.setProperty('--fr-ring-progress', progress.toFixed(3));
        }

        if (timerDisplay) {
            timerDisplay.textContent = formatTimeFromProgress(progress);
        }

        if (timerStatus) {
            timerStatus.textContent = progress === 0 ? 'Ready' : 'Focusing';
        }

        applySessionVisuals(progress);

        if (progress >= 1) {
            finishSession();
            return;
        }

        timerState.frame = window.requestAnimationFrame(tickSession);
    }

    function pauseSession() {
        if (!timerState.running) {
            return;
        }

        timerState.running = false;
        timerState.pausedElapsedMs += performance.now() - timerState.startedAt;
        timerState.startedAt = null;

        if (timerState.frame) {
            window.cancelAnimationFrame(timerState.frame);
            timerState.frame = null;
        }

        if (startButton) {
            startButton.textContent = 'Resume Session';
        }

        if (timerStatus) {
            timerStatus.textContent = 'Paused';
        }
    }

    function startSession() {
        if (timerState.running) {
            pauseSession();
            return;
        }

        if (completionNote) {
            completionNote.classList.remove('is-visible');
        }

        timerState.running = true;
        timerState.startedAt = null;

        if (startButton) {
            startButton.textContent = 'Pause Session';
        }

        timerState.frame = window.requestAnimationFrame(tickSession);
        wakeGhostUI();
    }

    function resetSession() {
        timerState.running = false;
        timerState.startedAt = null;
        timerState.pausedElapsedMs = 0;

        if (timerState.frame) {
            window.cancelAnimationFrame(timerState.frame);
            timerState.frame = null;
        }

        if (timerRing) {
            timerRing.style.setProperty('--fr-ring-progress', '0.04');
        }

        if (timerDisplay) {
            timerDisplay.textContent = String(timerState.selectedMinutes).padStart(2, '0') + ':00';
        }

        if (timerStatus) {
            timerStatus.textContent = 'Ready';
        }

        if (startButton) {
            startButton.textContent = 'Start Session';
        }

        if (completionNote) {
            completionNote.classList.remove('is-visible');
        }

        applySessionVisuals(0);
    }

    durationButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            timerState.selectedMinutes = Number(button.getAttribute('data-duration') || '25');
            timerState.demoDurationMs = Number(button.getAttribute('data-demo-seconds') || '90') * 1000;

            durationButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });

            resetSession();
            wakeGhostUI();
        });
    });

    if (startButton) {
        startButton.addEventListener('click', startSession);
    }

    if (resetButton) {
        resetButton.addEventListener('click', resetSession);
    }

    layerToggles.forEach(function (toggle) {
        toggle.addEventListener('change', function () {
            syncLayerVisual(toggle.getAttribute('data-layer-toggle'));
            wakeGhostUI();
        });
    });

    layerSliders.forEach(function (slider) {
        slider.addEventListener('input', function () {
            syncLayerVisual(slider.getAttribute('data-layer-volume'));
            wakeGhostUI();
        });
    });

    function loadCodeFile(button) {
        var filePath = button.getAttribute('data-code-file');
        if (!filePath || !codeContent || !codePath) {
            return;
        }

        codeButtons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
        });

        codePath.textContent = filePath.replace('./swiftui-prototype/', 'swiftui-prototype/');
        codeStatus && (codeStatus.textContent = 'Loading');

        fetch(filePath)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Unable to load file');
                }

                return response.text();
            })
            .then(function (content) {
                codeContent.textContent = content;
                if (codeStatus) {
                    codeStatus.textContent = 'Loaded from the prototype folder';
                }
            })
            .catch(function () {
                codeContent.textContent = 'The live site can fetch this file directly once deployed. The prototype source still exists at the listed path inside the repository.';
                if (codeStatus) {
                    codeStatus.textContent = 'Preview fallback';
                }
            });
    }

    codeButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            loadCodeFile(button);
        });
    });

    ['piano', 'rain', 'brownNoise', 'cafe', 'whiteNoise'].forEach(syncLayerVisual);
    resetSession();

    if (codeButtons.length) {
        loadCodeFile(codeButtons[0]);
    }
}());
