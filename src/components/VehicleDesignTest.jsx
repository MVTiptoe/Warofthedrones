import React from 'react';
import { Html, Billboard } from '@react-three/drei';
import { TankA, TankB } from './vehicles/TankVehicles';
import { IFV_A, IFV_B } from './vehicles/IFVVehicles';

/**
 * Component that places one of each tank and IFV design in the middle of the map for easier editing
 */
export default function VehicleDesignTest() {
    const spacing = 20; // Increased space between vehicles
    const height = 1; // Height off the ground

    return (
        <group>
            {/* Platform for better visibility */}
            <mesh position={[0, height / 2 - 0.1, 0]} receiveShadow>
                <boxGeometry args={[spacing * 3, 0.2, spacing * 3]} />
                <meshStandardMaterial color="#cccccc" roughness={0.8} />
            </mesh>

            {/* Place tanks and IFVs at different corners with rotation for better visibility */}
            <group position={[-spacing, height, -spacing]} rotation={[0, Math.PI / 4, 0]}>
                <TankA />
                <Label position={[0, 3, 0]} text="TankA" />
            </group>

            <group position={[spacing, height, -spacing]} rotation={[0, -Math.PI / 4, 0]}>
                <TankB />
                <Label position={[0, 3, 0]} text="TankB" />
            </group>

            <group position={[-spacing, height, spacing]} rotation={[0, -Math.PI / 4, 0]}>
                <IFV_A />
                <Label position={[0, 3, 0]} text="IFV_A" />
            </group>

            <group position={[spacing, height, spacing]} rotation={[0, Math.PI / 4, 0]}>
                <IFV_B />
                <Label position={[0, 3, 0]} text="IFV_B" />
            </group>
        </group>
    );
}

// Simple label component that always faces the camera
function Label({ position, text }) {
    return (
        <Billboard position={position} follow={true}>
            <Html center>
                <div style={{
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '5px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                }}>
                    {text}
                </div>
            </Html>
        </Billboard>
    );
} 