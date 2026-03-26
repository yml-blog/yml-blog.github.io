import { createFocusRoomV1App } from './flow-controller.js';

function bootFocusRoomV1() {
    var root = document.querySelector('[data-fr1-app]');

    if (!root) {
        return;
    }

    createFocusRoomV1App({
        root: root,
        promptsUrl: '../../data/focus-room-v1/friction-prompts.json'
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootFocusRoomV1, { once: true });
} else {
    bootFocusRoomV1();
}
