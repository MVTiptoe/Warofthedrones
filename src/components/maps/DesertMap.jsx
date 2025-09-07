import React, { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { Environment, Sky } from '@react-three/drei';
import { FogExp2 } from 'three';
import DesertTerrain from './terrain/DesertTerrain';
import Road from '../Road';
import DesertEnvironmentObjects from './objects/DesertEnvironmentObjects';
import DroneSwitcher from '../DroneSwitcher';
import VehiclesOnRoad from '../VehiclesOnRoad';
import ExplosionsManager from '../effects/ExplosionsManager';
import ShotgunEffectsManager from '../effects/ShotgunEffectsManager';
import { DamageIndicatorsManager } from '../effects/DamageIndicator';
import VehicleSelector from '../VehicleSelector';

// DesertMap - A sandy, arid desert with sparse vegetation, cacti, and more rocks
export default function DesertMap() {
    const { scene, camera } = useThree();

    useEffect(() => {
        // Create dusty exponential fog for the desert map
        scene.fog = new FogExp2('#e6d9c9', 0.0009);

        // Set camera position for desert map
        camera.position.set(0, 25, 90);
        camera.updateProjectionMatrix();

        return () => {
            // Cleanup if needed when map is unmounted
        };
    }, [scene, camera]);

    // Sky attributes for desert map - more orange/yellow tones
    const skyProps = useMemo(() => ({
        distance: 450000,
        sunPosition: [0.5, 0.8, 0],
        inclination: 0.6,
        azimuth: 0.35
    }), []);

    return (
        <>
            {/* Environmental lighting */}
            <Environment preset="sunset" />

            {/* Sky with desert atmosphere */}
            <Sky
                distance={skyProps.distance}
                sunPosition={skyProps.sunPosition}
                inclination={skyProps.inclination}
                azimuth={skyProps.azimuth}
            />

            {/* Directional light - stronger in desert */}
            <directionalLight
                position={[50, 50, 25]}
                intensity={1.8}
                shadow-mapSize={[2048, 2048]}
                shadow-camera-left={-1000}
                shadow-camera-right={1000}
                shadow-camera-top={1000}
                shadow-camera-bottom={-1000}
                shadow-camera-near={0.1}
                shadow-camera-far={2000}
            />

            {/* Ambient light */}
            <ambientLight intensity={0.15} />

            {/* Desert terrain */}
            <DesertTerrain />

            {/* Road network */}
            <Road mapType="desert" />

            {/* Environment objects specific to desert map */}
            <DesertEnvironmentObjects />

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