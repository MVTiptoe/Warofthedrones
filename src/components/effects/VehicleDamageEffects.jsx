import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createDamageEffects } from '../../utils/VehicleHealthSystem';

/**
 * Component that renders visual damage effects for a vehicle
 */
export const VehicleDamageEffects = ({ vehicleHealth, position, rotation }) => {
    // No effects if no health data or no damage
    if (!vehicleHealth || vehicleHealth.currentHealth === vehicleHealth.maxHealth) {
        return null;
    }

    // Generate effects based on vehicle health
    const effects = createDamageEffects(vehicleHealth);
    if (effects.length === 0) return null;

    return (
        <group position={position} rotation={rotation}>
            {effects.map((effect, index) => {
                // Render different effect types
                switch (effect.type) {
                    case 'smoke':
                        return <SmokeEffect key={`smoke-${index}`} {...effect} />;
                    case 'fire':
                        return <FireEffect key={`fire-${index}`} {...effect} />;
                    case 'spark':
                        return <SparkEffect key={`spark-${index}`} {...effect} />;
                    case 'wreckage':
                        return <WreckageEffect key={`wreck-${index}`} {...effect} vehicleDead={vehicleHealth.isDead} />;
                    default:
                        return null;
                }
            })}
        </group>
    );
};

// Particle-based smoke effect
const SmokeEffect = ({ size = 1.0, color = '#888888', opacity = 0.5, rate = 0.3 }) => {
    const smokeRef = useRef();
    const particles = useRef([]);
    const nextParticle = useRef(0);

    // Initialize particles
    useEffect(() => {
        particles.current = Array(30).fill().map(() => ({
            position: new THREE.Vector3(0, 0, 0),
            velocity: new THREE.Vector3(0, 0, 0),
            size: 0,
            alpha: 0,
            active: false,
            life: 0
        }));
    }, []);

    // Update and render particles
    useFrame((_, delta) => {
        if (!smokeRef.current) return;

        // Add new particles at a controlled rate
        nextParticle.current -= delta * rate;
        if (nextParticle.current <= 0) {
            // Find an inactive particle
            const idx = particles.current.findIndex(p => !p.active);
            if (idx >= 0) {
                const p = particles.current[idx];
                // Random position with offset around the effect center
                p.position.set(
                    (Math.random() - 0.5) * size * 0.5,
                    0,
                    (Math.random() - 0.5) * size * 0.5
                );

                // Upward velocity with some randomness
                p.velocity.set(
                    (Math.random() - 0.5) * 0.3 * size,
                    Math.random() * 0.5 * size + 0.5,
                    (Math.random() - 0.5) * 0.3 * size
                );

                p.size = Math.random() * size * 0.3 + size * 0.2;
                p.alpha = Math.random() * 0.3 + 0.2;
                p.active = true;
                p.life = Math.random() * 2 + 1; // 1-3 seconds
            }

            // Reset timer for next particle
            nextParticle.current = 0.05; // Particle spawn interval
        }

        // Update existing particles
        const positions = smokeRef.current.geometry.attributes.position;
        const sizes = smokeRef.current.geometry.attributes.size;
        const colors = smokeRef.current.geometry.attributes.color;

        particles.current.forEach((p, i) => {
            if (!p.active) return;

            // Update position
            p.position.add(p.velocity.clone().multiplyScalar(delta));
            positions.setXYZ(i, p.position.x, p.position.y, p.position.z);

            // Update size
            p.size += delta * 0.5 * size; // Grow as it rises
            sizes.setX(i, p.size);

            // Update alpha
            p.life -= delta;
            p.alpha = Math.max(0, p.alpha * (p.life / 3));
            colors.setXYZW(i,
                parseInt(color.substring(1, 3), 16) / 255,
                parseInt(color.substring(3, 5), 16) / 255,
                parseInt(color.substring(5, 7), 16) / 255,
                p.alpha
            );

            // Deactivate if life is over
            if (p.life <= 0) {
                p.active = false;
                p.alpha = 0;
                colors.setW(i, 0);
            }
        });

        positions.needsUpdate = true;
        sizes.needsUpdate = true;
        colors.needsUpdate = true;
    });

    // Create particle material and geometry
    const smokeParticles = useMemo(() => {
        const geometry = new THREE.BufferGeometry();

        // Initialize attributes for 30 particles
        const positions = new Float32Array(30 * 3); // xyz for each particle
        const sizes = new Float32Array(30); // size for each particle
        const colors = new Float32Array(30 * 4); // rgba for each particle

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4));

        const material = new THREE.PointsMaterial({
            size: 1,
            transparent: true,
            opacity: opacity,
            vertexColors: true,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        return { geometry, material };
    }, [opacity]);

    return (
        <points ref={smokeRef} geometry={smokeParticles.geometry} material={smokeParticles.material} />
    );
};

// Fire effect using sprite animation
const FireEffect = ({ size = 1.0, intensity = 1.0, flickerSpeed = 0.1 }) => {
    const fireRef = useRef();
    const time = useRef(0);

    useFrame((_, delta) => {
        if (!fireRef.current) return;

        // Update time for animation
        time.current += delta;

        // Flicker effect
        const flicker = Math.sin(time.current * flickerSpeed * 20) * 0.2 + 0.8;
        fireRef.current.scale.set(
            size * (1 + Math.sin(time.current * 8) * 0.05),
            size * (1 + Math.sin(time.current * 10) * 0.05) * flicker,
            size * (1 + Math.sin(time.current * 9) * 0.05)
        );

        fireRef.current.material.opacity = 0.7 + Math.sin(time.current * 12) * 0.3;
    });

    // Fire material
    const fireMaterial = useMemo(() => {
        return new THREE.SpriteMaterial({
            color: new THREE.Color(0xff7700).multiplyScalar(intensity),
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
    }, [intensity]);

    return (
        <sprite ref={fireRef} material={fireMaterial} scale={[size, size * 1.5, size]} position={[0, size * 0.5, 0]} />
    );
};

// Spark effect using points
const SparkEffect = ({ size = 0.3, rate = 0.4, color = '#ffaa00' }) => {
    const sparksRef = useRef();
    const particles = useRef([]);
    const nextSpark = useRef(0);

    // Initialize particles
    useEffect(() => {
        particles.current = Array(20).fill().map(() => ({
            position: new THREE.Vector3(0, 0, 0),
            velocity: new THREE.Vector3(0, 0, 0),
            size: 0,
            alpha: 0,
            active: false,
            life: 0
        }));
    }, []);

    // Update and render particles
    useFrame((_, delta) => {
        if (!sparksRef.current) return;

        // Add new sparks at a controlled rate
        nextSpark.current -= delta * rate;
        if (nextSpark.current <= 0) {
            // Find an inactive particle
            const idx = particles.current.findIndex(p => !p.active);
            if (idx >= 0) {
                const p = particles.current[idx];
                // Random position around the effect center
                p.position.set(
                    (Math.random() - 0.5) * size,
                    Math.random() * size * 0.5,
                    (Math.random() - 0.5) * size
                );

                // Random velocity in all directions
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 3 + 2;
                p.velocity.set(
                    Math.cos(angle) * speed * size,
                    Math.random() * 2 * size + 1,
                    Math.sin(angle) * speed * size
                );

                p.size = Math.random() * size * 0.2 + size * 0.1;
                p.alpha = Math.random() * 0.5 + 0.5;
                p.active = true;
                p.life = Math.random() * 0.5 + 0.2; // Short life
            }

            // Reset timer for next spark
            nextSpark.current = 0.1; // Spark spawn interval
        }

        // Update existing particles
        const positions = sparksRef.current.geometry.attributes.position;
        const sizes = sparksRef.current.geometry.attributes.size;
        const colors = sparksRef.current.geometry.attributes.color;

        particles.current.forEach((p, i) => {
            if (!p.active) return;

            // Update position
            p.position.add(p.velocity.clone().multiplyScalar(delta));

            // Add gravity
            p.velocity.y -= delta * 9.8 * size;

            positions.setXYZ(i, p.position.x, p.position.y, p.position.z);

            // Update size
            p.size *= 0.95; // Shrink over time
            sizes.setX(i, p.size);

            // Update alpha/life
            p.life -= delta;
            p.alpha = Math.max(0, p.alpha * (p.life / 0.3));
            colors.setXYZW(i,
                parseInt(color.substring(1, 3), 16) / 255,
                parseInt(color.substring(3, 5), 16) / 255,
                parseInt(color.substring(5, 7), 16) / 255,
                p.alpha
            );

            // Deactivate if life is over
            if (p.life <= 0) {
                p.active = false;
                p.alpha = 0;
                colors.setW(i, 0);
            }
        });

        positions.needsUpdate = true;
        sizes.needsUpdate = true;
        colors.needsUpdate = true;
    });

    // Create spark material and geometry
    const sparkParticles = useMemo(() => {
        const geometry = new THREE.BufferGeometry();

        // Initialize attributes for 20 particles
        const positions = new Float32Array(20 * 3);
        const sizes = new Float32Array(20);
        const colors = new Float32Array(20 * 4);

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4));

        const material = new THREE.PointsMaterial({
            size: 0.1,
            transparent: true,
            vertexColors: true,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        return { geometry, material };
    }, []);

    return (
        <points ref={sparksRef} geometry={sparkParticles.geometry} material={sparkParticles.material} />
    );
};

// Wreckage effect for destroyed vehicles
const WreckageEffect = ({ blackenFactor = 0.8, vehicleDead = false }) => {
    // No wreckage effect unless vehicle is dead
    if (!vehicleDead) return null;

    // This would be replaced with actual vehicle wreckage model
    return (
        <group>
            {/* Blackened hull */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.5, 0.1, 0.8]} />
                <meshStandardMaterial color="#222222" roughness={0.9} />
            </mesh>

            {/* Debris pieces scattered around */}
            {Array(5).fill().map((_, i) => (
                <mesh
                    key={i}
                    position={[
                        (Math.random() - 0.5) * 2,
                        Math.random() * 0.05,
                        (Math.random() - 0.5) * 2
                    ]}
                    rotation={[
                        Math.random() * Math.PI,
                        Math.random() * Math.PI,
                        Math.random() * Math.PI
                    ]}
                >
                    <boxGeometry args={[
                        Math.random() * 0.2 + 0.1,
                        Math.random() * 0.1 + 0.05,
                        Math.random() * 0.2 + 0.1
                    ]} />
                    <meshStandardMaterial color="#333333" roughness={0.95} />
                </mesh>
            ))}
        </group>
    );
};

export default VehicleDamageEffects; 