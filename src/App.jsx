import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import Scene from './components/Scene';
import KeyboardControls from './components/KeyboardControls';
import { DronesProvider } from './utils/DronesContext';
import DroneSelector from './components/DroneSelector';
import VehicleHealthHUD from './components/ui/VehicleHealthHUD';
import ControlsList from './components/ui/ControlsList';

export default function App() {
    // State for the selected vehicle
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);

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
                <KeyboardControls>
                    <Canvas {...canvasConfig}>
                        <color attach="background" args={['#87CEEB']} />
                        <fog attach="fog" args={['#87CEEB', 100, 1000]} />

                        <Suspense fallback={null}>
                            <Scene onSelectVehicle={setSelectedVehicleId} />
                        </Suspense>

                        {process.env.NODE_ENV === 'development' && <Stats />}
                    </Canvas>

                    {/* UI Layer outside the Canvas */}
                    <div className="ui-layer">
                        <ControlsList />
                        <DroneSelector />
                        <VehicleHealthHUD selectedVehicleId={selectedVehicleId} />
                    </div>
                </KeyboardControls>
            </DronesProvider>
        </div>
    );
} 