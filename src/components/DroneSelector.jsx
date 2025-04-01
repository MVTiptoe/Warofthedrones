import React, { useEffect } from 'react';
import { useKeyboardControls } from '@react-three/drei';
import { useDrones, DRONE_TYPES } from '../utils/DronesContext';
import { Controls } from './KeyboardControls';
import '../styles/droneSelector.css';

export default function DroneSelector() {
    const { currentDrone, switchDrone } = useDrones();
    const [subscribeKeys] = useKeyboardControls();

    // Handle keyboard selection
    useEffect(() => {
        return subscribeKeys((state) => {
            if (state[Controls.selectDrone1]) switchDrone(DRONE_TYPES.GRENADIER);
            if (state[Controls.selectDrone2]) switchDrone(DRONE_TYPES.KAMIKAZE);
            if (state[Controls.selectDrone3]) switchDrone(DRONE_TYPES.BOMBER);
        });
    }, [subscribeKeys, switchDrone]);

    return (
        <div className="drone-selector">
            <div className="selector-heading">Select Drone</div>
            <div className="selector-options">
                <button
                    className={`selector-button ${currentDrone === DRONE_TYPES.GRENADIER ? 'active' : ''}`}
                    onClick={() => switchDrone(DRONE_TYPES.GRENADIER)}
                >
                    <div className="icon grenadier">💣</div>
                    <div>Grenadier</div>
                    <div className="key-hint">1</div>
                </button>

                <button
                    className={`selector-button ${currentDrone === DRONE_TYPES.KAMIKAZE ? 'active' : ''}`}
                    onClick={() => switchDrone(DRONE_TYPES.KAMIKAZE)}
                >
                    <div className="icon kamikaze">💥</div>
                    <div>Kamikaze</div>
                    <div className="key-hint">2</div>
                </button>

                <button
                    className={`selector-button ${currentDrone === DRONE_TYPES.BOMBER ? 'active' : ''}`}
                    onClick={() => switchDrone(DRONE_TYPES.BOMBER)}
                >
                    <div className="icon bomber">✈️</div>
                    <div>Bomber</div>
                    <div className="key-hint">3</div>
                </button>
            </div>
        </div>
    );
} 