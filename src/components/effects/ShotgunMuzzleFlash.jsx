import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * A dedicated component for shotgun muzzle flash effects
 * This replaces the explosion effect for shotguns with a more appropriate
 * muzzle flash visualization - optimized for performance
 */
export default function ShotgunMuzzleFlash({ position, direction, onComplete, isImpact }) {
    const [life, setLife] = useState(isImpact ? 5 : 8); // Shorter lifetime, even shorter for impacts
    const flashRef = useRef();
    const particlesRef = useRef([]);

    // Initialize particles on mount
    useEffect(() => {
        // Create particles for the shotgun muzzle flash
        const particles = [];

        // Get current FPS for adaptive particle count
        const currentFps = window.currentFps || 60;
        // Much more aggressive FPS-based particle reduction
        const particleCountMultiplier = currentFps < 30 ? 0.2 :
            (currentFps < 40 ? 0.4 :
                (currentFps < 50 ? 0.6 : 0.8));

        // For impact effects, use fewer particles
        const impactMultiplier = isImpact ? 0.5 : 1.0;

        // Create cone flash - reduce particle count based on FPS
        const particleCount = Math.max(1, Math.floor(6 * particleCountMultiplier * impactMultiplier)); // Significantly reduced base particles
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

        // Only add pellet particles if FPS is high enough and not an impact effect
        if (currentFps > 40 && !isImpact) {
            // Add some small pellet particles - significantly reduce count
            const pelletCount = Math.max(1, Math.floor(3 * particleCountMultiplier)); // Drastically reduced from 6 to 3 base particles
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
        }

        particlesRef.current = particles;

        // Auto-cleanup - shorter duration for better performance
        const duration = isImpact ? 100 : 150; // Very short duration, even shorter for impacts
        const timer = setTimeout(() => {
            if (onComplete) onComplete();
        }, duration);

        return () => clearTimeout(timer);
    }, [onComplete, isImpact]);

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
    const opacity = life / (isImpact ? 5 : 8);

    // For very low FPS, use a simplified representation
    const currentFps = window.currentFps || 60;
    const useSimplifiedVersion = currentFps < 30;

    if (useSimplifiedVersion) {
        // Extremely simplified version for low FPS
        return (
            <group
                ref={flashRef}
                position={[position.x, position.y, position.z]}
                rotation={rotation}
            >
                {/* Single center flash */}
                <mesh>
                    <sphereGeometry args={[0.2, 6, 6]} />
                    <meshBasicMaterial
                        color={0xffdd88}
                        transparent={true}
                        opacity={opacity * 0.8}
                    />
                </mesh>

                {/* Light source with reduced intensity */}
                <pointLight
                    color={0xffdd88}
                    intensity={4 * opacity}
                    distance={2}
                    decay={2}
                />
            </group>
        );
    }

    return (
        <group
            ref={flashRef}
            position={[position.x, position.y, position.z]}
            rotation={rotation}
        >
            {/* Center flash */}
            <mesh>
                <sphereGeometry args={[0.2, 6, 6]} /> {/* Reduced geometry detail */}
                <meshBasicMaterial
                    color={0xffdd88}
                    transparent={true}
                    opacity={opacity * 0.8}
                />
            </mesh>

            {/* Cone flash - only if not impact */}
            {!isImpact && (
                <mesh position={[0, 0, -0.1]}>
                    <coneGeometry args={[0.3, 0.6, 6]} /> {/* Reduced geometry detail */}
                    <meshBasicMaterial
                        color={0xffffaa}
                        transparent={true}
                        opacity={opacity * 0.6}
                    />
                </mesh>
            )}

            {/* Particles - limit the number rendered based on FPS */}
            {particlesRef.current.map((particle, i) => (
                <mesh key={i} position={particle.position.toArray()}>
                    <sphereGeometry args={[particle.size, 4, 4]} /> {/* Reduced geometry detail */}
                    <meshBasicMaterial
                        color={particle.color}
                        transparent={true}
                        opacity={particle.opacity * opacity}
                    />
                </mesh>
            ))}

            {/* Light source with conditional intensity */}
            <pointLight
                color={0xffdd88}
                intensity={isImpact ? 3 * opacity : 5 * opacity}
                distance={isImpact ? 2 : 3}
                decay={2}
            />
        </group>
    );
} 