import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Constants for billboards
const BILLBOARD_WIDTH = 20;
const BILLBOARD_HEIGHT = 12;
const BILLBOARD_THICKNESS = 0.5;
const SUPPORT_HEIGHT = 7;
const SUPPORT_THICKNESS = 0.8;

const Billboard = ({ position, rotation, size, supportStyle, frameStyle, color, index }) => {
    // Create materials with optimized settings
    const frameMaterial = useMemo(() =>
        new THREE.MeshStandardMaterial({
            color: color || '#888888',
            roughness: 0.7,
            metalness: 0.2,
            flatShading: true
        }),
        [color]);

    const supportMaterial = useMemo(() =>
        new THREE.MeshStandardMaterial({
            color: supportStyle === 'concrete' ? '#aaaaaa' : '#754c24', // Concrete or wood
            roughness: 0.9,
            metalness: 0.1,
            flatShading: true
        }),
        [supportStyle]);

    const billboardMaterial = useMemo(() =>
        new THREE.MeshStandardMaterial({
            color: '#ffffff',
            roughness: 0.5,
            metalness: 0.1,
            flatShading: true
        }),
        []);

    const width = size[0] || BILLBOARD_WIDTH;
    const height = size[1] || BILLBOARD_HEIGHT;
    const depth = BILLBOARD_THICKNESS;
    const supportHeight = size[2] || SUPPORT_HEIGHT;
    const supportThickness = SUPPORT_THICKNESS;

    // Different support structures based on billboard style
    const renderSupports = () => {
        switch (supportStyle) {
            case 'single':
                // Single central support
                return (
                    <mesh position={[0, supportHeight / 2, 0]} material={supportMaterial}>
                        <boxGeometry args={[supportThickness, supportHeight, supportThickness]} />
                    </mesh>
                );
            case 'double':
                // Two supports on the sides
                return (
                    <>
                        <mesh position={[-width / 3, supportHeight / 2, 0]} material={supportMaterial}>
                            <boxGeometry args={[supportThickness, supportHeight, supportThickness]} />
                        </mesh>
                        <mesh position={[width / 3, supportHeight / 2, 0]} material={supportMaterial}>
                            <boxGeometry args={[supportThickness, supportHeight, supportThickness]} />
                        </mesh>
                    </>
                );
            case 'concrete':
                // Concrete block support
                return (
                    <mesh position={[0, supportHeight / 2, 0]} material={supportMaterial}>
                        <boxGeometry args={[width / 2, supportHeight, supportThickness * 2]} />
                    </mesh>
                );
            case 'angled':
            default:
                // Angled supports
                return (
                    <>
                        <mesh position={[-width / 3, supportHeight / 2, 0]} rotation={[0, 0, Math.PI * 0.05]} material={supportMaterial}>
                            <boxGeometry args={[supportThickness, supportHeight * 1.1, supportThickness]} />
                        </mesh>
                        <mesh position={[width / 3, supportHeight / 2, 0]} rotation={[0, 0, -Math.PI * 0.05]} material={supportMaterial}>
                            <boxGeometry args={[supportThickness, supportHeight * 1.1, supportThickness]} />
                        </mesh>
                    </>
                );
        }
    };

    // Different frame styles for the billboards
    const renderFrame = () => {
        switch (frameStyle) {
            case 'modern':
                // Thin modern frame with rounded corners
                return (
                    <mesh position={[0, supportHeight + height / 2, 0]} material={frameMaterial}>
                        <boxGeometry args={[width + 0.4, height + 0.4, depth * 0.5]} />
                    </mesh>
                );
            case 'thick':
                // Thick prominent frame
                return (
                    <mesh position={[0, supportHeight + height / 2, -depth * 0.2]} material={frameMaterial}>
                        <boxGeometry args={[width + 1, height + 1, depth * 0.8]} />
                    </mesh>
                );
            case 'minimal':
                // No frame, just the billboard
                return null;
            case 'bordered':
            default:
                // Standard bordered frame
                return (
                    <mesh position={[0, supportHeight + height / 2, -depth * 0.1]} material={frameMaterial}>
                        <boxGeometry args={[width + 0.6, height + 0.6, depth * 0.6]} />
                    </mesh>
                );
        }
    };

    return (
        <group position={position} rotation={rotation}>
            {/* Billboard supports */}
            {renderSupports()}

            {/* Billboard frame */}
            {renderFrame()}

            {/* Billboard surface (placeholder for images) */}
            <mesh position={[0, supportHeight + height / 2, 0]} material={billboardMaterial}>
                <boxGeometry args={[width, height, depth]} />
            </mesh>
        </group>
    );
};

export default function Billboards() {
    // Define 4 different billboard designs
    const billboards = useMemo(() => [
        {
            position: [0, 0, 30], // Middle of map, slightly offset from road
            rotation: [0, Math.PI / 4, 0], // Angled for visibility
            size: [BILLBOARD_WIDTH, BILLBOARD_HEIGHT, SUPPORT_HEIGHT],
            supportStyle: 'double',
            frameStyle: 'minimal',
            color: '#3a3a3a'
        },
        {
            position: [40, 0, -40], // Another side of the middle
            rotation: [0, -Math.PI / 6, 0],
            size: [BILLBOARD_WIDTH * 1.2, BILLBOARD_HEIGHT * 0.8, SUPPORT_HEIGHT * 1.2],
            supportStyle: 'double',
            frameStyle: 'minimal',
            color: '#555555'
        },
        {
            position: [-50, 0, -20], // Third position
            rotation: [0, Math.PI / 5, 0],
            size: [BILLBOARD_WIDTH * 0.8, BILLBOARD_HEIGHT * 1.1, SUPPORT_HEIGHT],
            supportStyle: 'double',
            frameStyle: 'minimal',
            color: '#444444'
        },
        {
            position: [60, 0, 60], // Fourth position
            rotation: [0, -Math.PI / 3, 0],
            size: [BILLBOARD_WIDTH * 0.9, BILLBOARD_HEIGHT * 0.9, SUPPORT_HEIGHT * 0.9],
            supportStyle: 'double',
            frameStyle: 'minimal',
            color: '#666666'
        }
    ], []);

    // Add frustum culling for performance optimization
    const billboardRefs = useRef([]);
    const frustum = useMemo(() => new THREE.Frustum(), []);
    const projScreenMatrix = useMemo(() => new THREE.Matrix4(), []);

    // Only render billboards that are visible in camera frustum
    useFrame(({ camera }) => {
        // Update frustum
        projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        frustum.setFromProjectionMatrix(projScreenMatrix);

        // Check visibility distance for culling (only if refs are available)
        const FAR_DISTANCE = 800; // Billboards beyond this distance will not be rendered

        // Apply distance-based visibility
        billboardRefs.current.forEach((ref, index) => {
            if (ref && ref.position) {
                const distance = ref.position.distanceTo(camera.position);
                ref.visible = distance < FAR_DISTANCE;
            }
        });
    });

    return (
        <group>
            {billboards.map((billboard, index) => (
                <group
                    key={`billboard-${index}`}
                    ref={el => billboardRefs.current[index] = el}
                >
                    <Billboard
                        position={billboard.position}
                        rotation={billboard.rotation}
                        size={billboard.size}
                        supportStyle={billboard.supportStyle}
                        frameStyle={billboard.frameStyle}
                        color={billboard.color}
                        index={index}
                    />
                </group>
            ))}
        </group>
    );
} 