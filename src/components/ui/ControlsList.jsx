import React from 'react';
import './ControlsList.css';
import { useDrones, DRONE_TYPES } from '../../utils/GameContext';

export default function ControlsList() {
    const { currentDrone } = useDrones();

    // Base controls always shown
    const baseControls = [
        { key: 'W', action: 'Move Forward' },
        { key: 'S', action: 'Move Backward' },
        { key: 'A', action: 'Strafe Left' },
        { key: 'D', action: 'Strafe Right' },
        { key: 'Q', action: 'Turn Left' },
        { key: 'E', action: 'Turn Right' },
        { key: 'SPACE', action: 'Move Up' },
        { key: 'SHIFT', action: 'Move Down' },
        { key: '1', action: 'Select Grenadier' },
        { key: '2', action: 'Select Kamikaze' },
        { key: '3', action: 'Select Bomber' }
    ];

    // Drone-specific controls
    const droneSpecificControls = {
        [DRONE_TYPES.KAMIKAZE]: [
            { key: 'V', action: 'Toggle First Person View' },
            { key: 'MOUSE', action: 'Control Direction (in FPV)' }
        ],
        [DRONE_TYPES.GRENADIER]: [],
        [DRONE_TYPES.BOMBER]: []
    };

    // Combine base controls with drone-specific ones
    const controls = [...baseControls, ...(droneSpecificControls[currentDrone] || [])];

    return (
        <div className="controls-list">
            <div className="controls-heading">Controls</div>
            <div className="controls-items">
                {controls.map((control, index) => (
                    <div key={index} className="control-item">
                        <span className="key">{control.key}</span>
                        <span className="action">{control.action}</span>
                    </div>
                ))}
            </div>
        </div>
    );
} 