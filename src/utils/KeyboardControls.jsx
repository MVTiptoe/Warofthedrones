import { useKeyboardControls } from "@react-three/drei";

// Keyboard state tracking
const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    strafeLeft: false,
    strafeRight: false,
    shift: false
};

// Update keyboard state
document.addEventListener('keydown', (e) => {
    switch (e.code) {
        case 'KeyW': keys.forward = true; break;
        case 'KeyS': keys.backward = true; break;
        case 'KeyQ': keys.left = true; break;
        case 'KeyE': keys.right = true; break;
        case 'Space': keys.up = true; break;
        case 'KeyC': keys.down = true; break;
        case 'KeyA': keys.strafeLeft = true; break;
        case 'KeyD': keys.strafeRight = true; break;
        case 'ShiftLeft':
        case 'ShiftRight':
            keys.shift = true;
            keys.down = true;
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.code) {
        case 'KeyW': keys.forward = false; break;
        case 'KeyS': keys.backward = false; break;
        case 'KeyQ': keys.left = false; break;
        case 'KeyE': keys.right = false; break;
        case 'Space': keys.up = false; break;
        case 'KeyC': keys.down = false; break;
        case 'KeyA': keys.strafeLeft = false; break;
        case 'KeyD': keys.strafeRight = false; break;
        case 'ShiftLeft':
        case 'ShiftRight':
            keys.shift = false;
            keys.down = false;
            break;
    }
});

// Function to get current key states
export function getKeys() {
    return { ...keys };
} 