import React, { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { Environment, Sky } from '@react-three/drei';
import { FogExp2 } from 'three';
import OriginalTerrain from './terrain/OriginalTerrain';
import Road from '../Road';
import OriginalEnvironmentObjects from './objects/OriginalEnvironmentObjects';
import DroneSwitcher from '../DroneSwitcher';
import VehiclesOnRoad from '../VehiclesOnRoad';
import ExplosionsManager from '../effects/ExplosionsManager';
import ShotgunEffectsManager from '../effects/ShotgunEffectsManager';
import { DamageIndicatorsManager } from '../effects/DamageIndicator';
import VehicleSelector from '../VehicleSelector';

// OriginalMap - The green, grassy map with plenty of trees and vegetation
export default function OriginalMap() {
    const { scene, camera } = useThree();

    useEffect(() => {
        // Create exponential fog for the original map
        scene.fog = new FogExp2('#b5d3e7', 0.00085);

        // Set camera position for original map
        camera.position.set(0, 20, 100);
        camera.updateProjectionMatrix();

        return () => {
            // Cleanup if needed when map is unmounted
        };
    }, [scene, camera]);

    // Sky attributes for original map
    const skyProps = useMemo(() => ({
        distance: 450000,
        sunPosition: [0, 1, 0],
        inclination: 0.5,
        azimuth: 0.25
    }), []);

    return (
        <>
            {/* Environmental lighting */}
            <Environment preset="sunset" />

            {/* Sky */}
            <Sky
                distance={skyProps.distance}
                sunPosition={skyProps.sunPosition}
                inclination={skyProps.inclination}
                azimuth={skyProps.azimuth}
            />

            {/* Directional light */}
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

            {/* Ambient light */}
            <ambientLight intensity={0.2} />

            {/* Original terrain */}
            <OriginalTerrain />

            {/* Road network */}
            <Road mapType="original" />

            {/* Environment objects specific to original map */}
            <OriginalEnvironmentObjects />

            {/* Vehicles and game elements that are common across maps */}
            <VehiclesOnRoad />
            <DroneSwitcher />
            <ExplosionsManager />
            <ShotgunEffectsManager />
            <DamageIndicatorsManager />
            <VehicleSelector />
        </>
    );
} 