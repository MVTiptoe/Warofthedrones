import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import Scene from './components/Scene';
import KeyboardControls from './components/KeyboardControls';
import DroneSelector from './components/DroneSelector';
import VehicleHealthHUD from './components/ui/VehicleHealthHUD';
import ControlsList from './components/ui/ControlsList';
import DroneHUDs from './components/DroneHUDs';
import MapSelector from './components/MapSelector';
import './styles/MapSelector.css';

export default function App() {
    // State for the selected vehicle
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);

    // Shared configuration
    const canvasConfig = {
        shadows: true,
        camera: { position: [0, 20, 100], fov: 50 },
        dpr: [0.75, 1], // Lower resolution for better performance
        onPointerMissed: () => setSelectedVehicleId(null) // Deselect when clicking empty space
    };

    return (
        <div style={{ width: '100%', height: '100vh' }}>
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
                    <MapSelector />
                    <VehicleHealthHUD selectedVehicleId={selectedVehicleId} />
                    <DroneHUDs />
                </div>
            </KeyboardControls>
        </div>
    );
} 