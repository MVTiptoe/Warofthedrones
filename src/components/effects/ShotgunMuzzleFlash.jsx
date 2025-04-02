import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * A dedicated component for shotgun muzzle flash effects
 * This replaces the explosion effect for shotguns with a more appropriate
 * muzzle flash visualization
 */
export default function ShotgunMuzzleFlash({ position, direction, onComplete }) {
    const [life, setLife] = useState(10); // Short lifetime
    const flashRef = useRef();
    const particlesRef = useRef([]);

    // Initialize particles on mount
    useEffect(() => {
        // Create particles for the shotgun muzzle flash
        const particles = [];

        // Get current FPS for adaptive particle count
        const currentFps = window.currentFps || 60;
        const particleCountMultiplier = currentFps < 40 ? 0.5 : (currentFps < 50 ? 0.7 : 1.0);

        // Create cone flash - reduce particle count based on FPS
        const particleCount = Math.floor(10 * particleCountMultiplier); // Reduced from 15 to 10 base particles
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 0.3;

            particles.push({
                position: new THREE.Vector3(
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius,
                    -0.5 - Math.random() * 0.5
                ),
                size: 0.05 + Math.random() * 0.1,
                opacity: 0.7 + Math.random() * 0.3,
                color: new THREE.Color(
                    0.9 + Math.random() * 0.1,
                    0.7 + Math.random() * 0.2,
                    0.2 + Math.random() * 0.2
                )
            });
        }

        // Add some small pellet particles - reduce count based on FPS
        const pelletCount = Math.floor(6 * particleCountMultiplier); // Reduced from 8 to 6 base particles
        for (let i = 0; i < pelletCount; i++) {
            const spread = Math.random() * 0.2;
            const distance = 0.5 + Math.random() * 1.0;
            const angle = Math.random() * Math.PI * 2;

            particles.push({
                position: new THREE.Vector3(
                    Math.cos(angle) * spread,
                    Math.sin(angle) * spread,
                    -distance
                ),
                size: 0.03 + Math.random() * 0.05,
                opacity: 0.5 + Math.random() * 0.3,
                color: new THREE.Color(0.8, 0.8, 0.8) // Pellet color
            });
        }

        particlesRef.current = particles;

        // Auto-cleanup
        const timer = setTimeout(() => {
            if (onComplete) onComplete();
        }, 200); // Short duration

        return () => clearTimeout(timer);
    }, [onComplete]);

    // Animation frame handling
    useFrame(() => {
        if (life <= 0) return;

        setLife(prev => prev - 1);
    });

    // Calculate the rotation to align with direction
    const rotation = useMemo(() => {
        if (!direction) return [0, 0, 0];

        // Default direction is -Z
        const defaultDir = new THREE.Vector3(0, 0, -1);
        const targetDir = new THREE.Vector3().copy(direction).normalize();

        // Create quaternion for rotation from default to target direction
        const quaternion = new THREE.Quaternion().setFromUnitVectors(defaultDir, targetDir);
        const euler = new THREE.Euler().setFromQuaternion(quaternion);

        return [euler.x, euler.y, euler.z];
    }, [direction]);

    // Early completion if life is over
    if (life <= 0) return null;

    // Scale opacity with life
    const opacity = life / 10;

    return (
        <group
            ref={flashRef}
            position={[position.x, position.y, position.z]}
            rotation={rotation}
        >
            {/* Center flash */}
            <mesh>
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshBasicMaterial
                    color={0xffdd88}
                    transparent={true}
                    opacity={opacity * 0.8}
                />
            </mesh>

            {/* Cone flash */}
            <mesh position={[0, 0, -0.1]}>
                <coneGeometry args={[0.3, 0.6, 8]} />
                <meshBasicMaterial
                    color={0xffffaa}
                    transparent={true}
                    opacity={opacity * 0.6}
                />
            </mesh>

            {/* Particles */}
            {particlesRef.current.map((particle, i) => (
                <mesh key={i} position={particle.position.toArray()}>
                    <sphereGeometry args={[particle.size, 6, 6]} />
                    <meshBasicMaterial
                        color={particle.color}
                        transparent={true}
                        opacity={particle.opacity * opacity}
                    />
                </mesh>
            ))}

            {/* Light source */}
            <pointLight
                color={0xffdd88}
                intensity={6 * opacity}
                distance={3}
                decay={2}
            />
        </group>
    );
} 