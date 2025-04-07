import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import Scene from './components/Scene';
import KeyboardControls from './components/KeyboardControls';
import { DronesProvider } from './utils/DronesContext';
import { KamikazeProvider } from './utils/KamikazeContext';
import DroneSelector from './components/DroneSelector';
import VehicleHealthHUD from './components/ui/VehicleHealthHUD';
import ControlsList from './components/ui/ControlsList';
import DroneHUDs from './components/DroneHUDs';

export default function App() {
    // State for the selected vehicle
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);

    // State for showing test vehicles for editing
    const [showTestVehicles, setShowTestVehicles] = useState(true);

    // Shared configuration
    const canvasConfig = {
        shadows: true,
        camera: { position: [0, 20, 100], fov: 50 },
        dpr: [1, 2], // Dynamic pixel ratio for performance
        onPointerMissed: () => setSelectedVehicleId(null) // Deselect when clicking empty space
    };

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <DronesProvider>
                <KamikazeProvider>
                    <KeyboardControls>
                        <Canvas {...canvasConfig}>
                            <color attach="background" args={['#87CEEB']} />
                            <fog attach="fog" args={['#87CEEB', 100, 1000]} />

                            <Suspense fallback={null}>
                                <Scene
                                    onSelectVehicle={setSelectedVehicleId}
                                    showTestVehicles={showTestVehicles}
                                />
                            </Suspense>

                            {process.env.NODE_ENV === 'development' && <Stats />}
                        </Canvas>

                        {/* UI Layer outside the Canvas */}
                        <div className="ui-layer">
                            <ControlsList />
                            <DroneSelector />
                            <VehicleHealthHUD selectedVehicleId={selectedVehicleId} />
                            <DroneHUDs />

                            {/* Toggle for showing test vehicles */}
                            <div
                                className="test-vehicles-toggle"
                                style={{
                                    position: 'absolute',
                                    bottom: '10px',
                                    right: '10px',
                                    background: 'rgba(0,0,0,0.5)',
                                    padding: '5px 10px',
                                    borderRadius: '5px',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                                onClick={() => setShowTestVehicles(!showTestVehicles)}
                            >
                                {showTestVehicles ? 'Hide' : 'Show'} Test Vehicles
                            </div>
                        </div>
                    </KeyboardControls>
                </KamikazeProvider>
            </DronesProvider>
        </div>
    );
} 