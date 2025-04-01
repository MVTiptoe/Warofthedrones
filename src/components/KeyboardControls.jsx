import React from 'react';
import { KeyboardControls as DreiKeyboardControls } from '@react-three/drei';

// Define controls map for the drone
export const Controls = {
    forward: 'forward',
    backward: 'backward',
    left: 'left',
    right: 'right',
    up: 'up',
    down: 'down',
    strafeLeft: 'strafeLeft',
    strafeRight: 'strafeRight',
    selectDrone1: 'selectDrone1',
    selectDrone2: 'selectDrone2',
    selectDrone3: 'selectDrone3'
};

export default function KeyboardControls({ children }) {
    // Define key mappings
    const map = [
        { name: Controls.forward, keys: ['KeyW'] },
        { name: Controls.backward, keys: ['KeyS'] },
        { name: Controls.left, keys: ['KeyQ'] },
        { name: Controls.right, keys: ['KeyE'] },
        { name: Controls.up, keys: ['Space'] },
        { name: Controls.down, keys: ['ShiftLeft'] },
        { name: Controls.strafeLeft, keys: ['KeyA'] },
        { name: Controls.strafeRight, keys: ['KeyD'] },
        { name: Controls.selectDrone1, keys: ['Digit1'] },
        { name: Controls.selectDrone2, keys: ['Digit2'] },
        { name: Controls.selectDrone3, keys: ['Digit3'] }
    ];

    return (
        <DreiKeyboardControls map={map}>
            {children}
        </DreiKeyboardControls>
    );
} 