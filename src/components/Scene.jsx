import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Environment, Sky } from '@react-three/drei';
import { FogExp2 } from 'three';
import Terrain from './Terrain';
import Road from './Road';
import EnvironmentObjects from './EnvironmentObjects';
import DroneSwitcher from './DroneSwitcher';
import VehiclesOnRoad from './VehiclesOnRoad';
import ExplosionsManager from './effects/ExplosionsManager';
import ShotgunEffectsManager from './effects/ShotgunEffectsManager';
import { DamageIndicatorsManager } from './effects/DamageIndicator';
import VehicleHealthSystem from './VehicleHealthSystem';

export default function Scene({ onSelectVehicle }) {
    const { scene } = useThree();

    useEffect(() => {
        // Create exponential fog (more realistic for outdoor scenes)
        // Reduced fog density to account for larger map size
        scene.fog = new FogExp2('#b5d3e7', 0.00085); // Halved from 0.0017 for doubled map size
    }, [scene]);

    // Configure scene and hemisphere light color
    scene.background = scene.background;

    return (
        <>
            {/* Environmental lighting for realistic rendering */}
            <Environment preset="sunset" />

            {/* Sky with realistic atmospheric scattering */}
            <Sky
                distance={450000}
                sunPosition={[0, 1, 0]}
                inclination={0.5}
                azimuth={0.25}
            />

            {/* Directional light for shadows */}
            <directionalLight
                position={[50, 50, 25]}
                intensity={1.5}
                shadow-mapSize={[2048, 2048]}
                shadow-camera-left={-1000}
                shadow-camera-right={1000}
                shadow-camera-top={1000}
                shadow-camera-bottom={-1000}
                shadow-camera-near={0.1}
                shadow-camera-far={2000}
            />

            {/* Ambient light for overall scene brightness */}
            <ambientLight intensity={0.2} />

            {/* Our terrain component */}
            <Terrain />

            {/* Two parallel roads across the map */}
            <Road />

            {/* Environment objects - trees, rocks, bushes */}
            <EnvironmentObjects />

            {/* Vehicles driving on roads */}
            <VehiclesOnRoad />

            {/* Player Drone */}
            <DroneSwitcher />

            {/* Weapon effects managers */}
            <ExplosionsManager />
            <ShotgunEffectsManager />
            <DamageIndicatorsManager />

            {/* Vehicle selection system (no UI rendering) */}
            <VehicleHealthSystem onSelectVehicle={onSelectVehicle} />
        </>
    );
} 