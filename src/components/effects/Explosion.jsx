import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WEAPON_TYPES } from '../../utils/WeaponPhysics';

// Shared geometries and materials to reduce memory usage
const sharedGeometries = {
    sphere: new THREE.SphereGeometry(1, 16, 16),
    smallSphere: new THREE.SphereGeometry(1, 8, 8),
    debris: new THREE.BoxGeometry(1, 1, 1)
};

// Create shared, reusable materials for better performance
const sharedMaterials = {
    // Create a base material that will be cloned for each explosion
    fireballBase: new THREE.MeshStandardMaterial({
        transparent: true,
        emissive: new THREE.Color(0xFFFFFF)
    }),
    debrisBase: new THREE.MeshStandardMaterial({
        transparent: true
    }),
    smokeBase: new THREE.MeshStandardMaterial({
        transparent: true
    }),
    flashBase: new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true
    })
};

// Precomputed explosion colors for each weapon type
const explosionProperties = {
    [WEAPON_TYPES.ANTI_TANK_MINE]: {
        fireballColor: new THREE.Color(0xFF4500),
        smokeColor: new THREE.Color(0x222222),
        debrisColor: new THREE.Color(0x777777),
        dustColor: new THREE.Color(0x998866),
        lightIntensity: 2.5,
        lightColor: 0xFF5500
    },
    [WEAPON_TYPES.RPG]: {
        fireballColor: new THREE.Color(0xFF6347),
        smokeColor: new THREE.Color(0x333333),
        debrisColor: new THREE.Color(0x777777),
        dustColor: new THREE.Color(0x887766),
        lightIntensity: 3,
        lightColor: 0xFF3300
    },
    [WEAPON_TYPES.MORTAR]: {
        fireballColor: new THREE.Color(0xB22222),
        smokeColor: new THREE.Color(0x111111),
        debrisColor: new THREE.Color(0x555555),
        dustColor: new THREE.Color(0x776655),
        lightIntensity: 2.5,
        lightColor: 0xDD2222
    },
    [WEAPON_TYPES.DART]: {
        fireballColor: new THREE.Color(0x7CFC00),
        smokeColor: new THREE.Color(0x99AA99),
        debrisColor: new THREE.Color(0xAAFFAA),
        dustColor: new THREE.Color(0xAABBAA),
        lightIntensity: 1.5,
        lightColor: 0x88FF00
    },
    [WEAPON_TYPES.GRENADE]: {
        fireballColor: new THREE.Color(0xFFD700),
        smokeColor: new THREE.Color(0x555555),
        debrisColor: new THREE.Color(0x999999),
        dustColor: new THREE.Color(0x998877),
        lightIntensity: 2,
        lightColor: 0xFFAA00
    },
    [WEAPON_TYPES.SHOTGUN]: {
        fireballColor: new THREE.Color(0xFFFFAA),
        smokeColor: new THREE.Color(0xDDDDDD),
        debrisColor: new THREE.Color(0xDDDDDD),
        dustColor: new THREE.Color(0xCCCCBB),
        lightIntensity: 1,
        lightColor: 0xFFFFAA
    },
    default: {
        fireballColor: new THREE.Color(0xFF4500),
        smokeColor: new THREE.Color(0x333333),
        debrisColor: new THREE.Color(0x888888),
        dustColor: new THREE.Color(0xAA9988),
        lightIntensity: 2,
        lightColor: 0xFF7700
    }
};

// Particle type constants to avoid string literals
const PARTICLE_TYPES = {
    DEBRIS: 'debris',
    SMOKE: 'smoke',
    DUST: 'dust',
    SHOCKWAVE: 'shockwave'
};

// Animation performance constants
const ANIM_CONSTANTS = {
    UPDATE_THRESHOLD: 0.02,      // Threshold for state updates
    OPACITY_THRESHOLD: 0.01,     // Minimum particle opacity to render
    FRAME_SKIP_THRESHOLD: 2,     // Frame skip for small explosions
    BATCH_SIZE: 20,              // Particles to process per batch
    MAX_DEBRIS: 60,              // Maximum debris particles
    MAX_SMOKE: 50,               // Maximum smoke particles
    MAX_DUST: 15,                // Maximum dust particles
    MAX_SHOCKWAVE: 10            // Maximum shockwave particles
};

// Create a Vector3 pool for performance (reuse instead of creating new ones)
const vectorPool = {
    _pool: [],
    get: function () {
        if (this._pool.length > 0) {
            return this._pool.pop().set(0, 0, 0);
        }
        return new THREE.Vector3(0, 0, 0);
    },
    release: function (vector) {
        this._pool.push(vector);
    }
};

export default function Explosion({ position, radius, type, duration = 30, onComplete, secondaryEffects = {} }) {
    const groupRef = useRef();
    const [progress, setProgress] = useState(0);
    const [size, setSize] = useState(0.1);
    const [opacity, setOpacity] = useState(1);
    const [lifespan, setLifespan] = useState(duration);
    const frameCount = useRef(0);
    const lastProgressUpdate = useRef(0);
    const lastSizeUpdate = useRef(0.1);

    // Create optimized, cached materials based on explosion type
    const materials = useMemo(() => {
        const props = explosionProperties[type] || explosionProperties.default;

        // Clone base materials to avoid modifying shared ones
        const fireballMaterial = sharedMaterials.fireballBase.clone();
        fireballMaterial.color = props.fireballColor.clone();
        fireballMaterial.emissive = props.fireballColor.clone();

        const debrisMaterial = sharedMaterials.debrisBase.clone();
        debrisMaterial.color = props.debrisColor.clone();
        debrisMaterial.emissive = props.debrisColor.clone();

        const smokeMaterial = sharedMaterials.smokeBase.clone();
        smokeMaterial.color = props.smokeColor.clone();

        const dustMaterial = sharedMaterials.smokeBase.clone();
        dustMaterial.color = props.dustColor.clone();

        // Return all materials as a single object
        return {
            fireball: fireballMaterial,
            debris: debrisMaterial,
            smoke: smokeMaterial,
            dust: dustMaterial,
            flash: sharedMaterials.flashBase.clone()
        };
    }, [type]);

    // Get explosion properties based on weapon type with fallback to default
    const explosionProps = useMemo(() =>
        explosionProperties[type] || explosionProperties.default,
        [type]);

    // Create optimized particle system with appropriate counts
    const particles = useMemo(() => {
        // Extract values from the new structured secondaryEffects
        const debris = secondaryEffects.debris || { count: Math.floor(radius * 5), size: 0.7 };
        const smoke = secondaryEffects.smoke || { volume: 1.0, duration: 1.0 };

        // Cap particle counts for performance
        const totalDebris = Math.min(ANIM_CONSTANTS.MAX_DEBRIS, Math.floor(debris.count));
        const totalSmoke = Math.min(ANIM_CONSTANTS.MAX_SMOKE, Math.floor(radius * 8 * smoke.volume));

        return generateParticles(
            totalDebris,
            totalSmoke,
            debris.size,
            radius,
            duration,
            secondaryEffects,
            smoke.duration
        );
    }, [radius, duration, secondaryEffects]);

    // Clean up materials when component unmounts
    useEffect(() => {
        return () => {
            // Dispose cloned materials to prevent memory leaks
            Object.values(materials).forEach(material => material.dispose());
        };
    }, [materials]);

    // Optimized animation frame handler with batch processing and frame skipping
    useFrame(() => {
        if (!groupRef.current || lifespan <= 0) {
            // Ensure cleanup happens if lifespan is already zero
            if (lifespan <= 0 && onComplete) {
                onComplete();
            }
            return;
        }

        frameCount.current++;

        // Skip frames for smaller explosions (performance optimization)
        if (radius < ANIM_CONSTANTS.FRAME_SKIP_THRESHOLD && frameCount.current % 2 !== 0) return;

        // Calculate new progress - update state only when significant change
        const newProgress = 1 - (lifespan / duration);
        if (Math.abs(newProgress - lastProgressUpdate.current) > ANIM_CONSTANTS.UPDATE_THRESHOLD) {
            lastProgressUpdate.current = newProgress;
            setProgress(newProgress);

            // Update material properties based on progress
            updateMaterials(materials, newProgress);
        }

        // Optimize size updates with batched state updates
        if (size < radius) {
            const growthProgress = Math.min(1, newProgress * 2);
            const targetSize = radius * Math.min(1, growthProgress * 1.2);
            const growthRate = (targetSize - lastSizeUpdate.current) * 0.2;
            const newSize = lastSizeUpdate.current + Math.max(0.05, growthRate);

            if (Math.abs(newSize - lastSizeUpdate.current) > ANIM_CONSTANTS.UPDATE_THRESHOLD) {
                lastSizeUpdate.current = newSize;
                setSize(newSize);
            }
        }

        // Optimize opacity updates
        const shouldUpdateOpacity = newProgress < 0.4 ?
            opacity !== 1 :
            opacity > ANIM_CONSTANTS.OPACITY_THRESHOLD;

        if (shouldUpdateOpacity) {
            setOpacity(newProgress < 0.4 ? 1 : Math.max(0, opacity - (1 / (duration * 0.6))));
        }

        // Update particles with batched processing
        updateParticlesBatch(particles, newProgress);

        // Reduce lifespan
        setLifespan(prev => prev - 1);

        // Trigger completion
        if (lifespan <= 1 && onComplete) {
            try {
                onComplete();
            } catch (error) {
                console.error("Error in explosion onComplete callback:", error);
            }
        }
    });

    // Reset explosion when position changes
    useEffect(() => {
        setSize(0.1);
        lastSizeUpdate.current = 0.1;
        setOpacity(1);
        setLifespan(duration);
        setProgress(0);
        lastProgressUpdate.current = 0;
        frameCount.current = 0;

        // Reset all particles
        resetParticles(particles);

        // Reset materials
        updateMaterials(materials, 0);
    }, [position, duration, particles, materials]);

    // Filter active particles for rendering optimization - using memoization with better dependency tracking
    const activeParticles = useMemo(() => {
        // Group particles by type for more efficient rendering
        const result = {
            [PARTICLE_TYPES.DEBRIS]: [],
            [PARTICLE_TYPES.SMOKE]: [],
            [PARTICLE_TYPES.DUST]: [],
            [PARTICLE_TYPES.SHOCKWAVE]: []
        };

        // Only process if progress has changed significantly
        if (Math.abs(progress - lastProgressUpdate.current) < 0.05) {
            return result;
        }

        // Filter and group active particles
        for (const particle of particles) {
            if (particle.active && particle.life > 0 && particle.opacity > ANIM_CONSTANTS.OPACITY_THRESHOLD) {
                result[particle.type].push(particle);
            }
        }

        return result;
    }, [particles, progress, lastProgressUpdate]);

    // Update materials based on animation progress
    function updateMaterials(materials, progress) {
        materials.fireball.opacity = opacity;
        materials.fireball.emissiveIntensity = 2 * (1 - progress * 0.7);

        materials.flash.opacity = Math.max(0, 1 - (progress / 0.2));

        // No need to update debris/smoke/dust materials here as they're handled per-particle
    }

    return (
        <group ref={groupRef} position={[position.x, position.y, position.z]}>
            {/* Initial flash - only render during early phase */}
            {progress < 0.2 && (
                <mesh>
                    <sphereGeometry args={[size * 1.2, 16, 16]} />
                    <primitive object={materials.flash} attach="material" />
                </mesh>
            )}

            {/* Main fireball */}
            <mesh scale={[size, size, size]}>
                <primitive attach="geometry" object={sharedGeometries.sphere} />
                <primitive object={materials.fireball} attach="material" />
            </mesh>

            {/* Render particles by type for better batching */}
            {Object.entries(activeParticles).map(([type, particles]) => (
                <ParticleGroup
                    key={type}
                    type={type}
                    particles={particles}
                    materials={materials}
                    progress={progress}
                />
            ))}

            {/* Dynamic light - only render during relevant phase */}
            {progress < 0.7 && (
                <pointLight
                    color={explosionProps.lightColor}
                    intensity={explosionProps.lightIntensity * (1 - Math.pow(progress, 1.5)) * 20}
                    distance={radius * 15}
                    decay={2}
                />
            )}
        </group>
    );
}

// Particle group component for better batching
function ParticleGroup({ type, particles, materials, progress }) {
    if (particles.length === 0) return null;

    // Get the appropriate material for this particle type
    let material;
    let emissiveIntensity = 0;

    switch (type) {
        case PARTICLE_TYPES.DEBRIS:
            material = materials.debris;
            emissiveIntensity = 1 * (1 - progress);
            break;
        case PARTICLE_TYPES.SMOKE:
            material = materials.smoke;
            break;
        case PARTICLE_TYPES.DUST:
            material = materials.dust;
            break;
        case PARTICLE_TYPES.SHOCKWAVE:
            material = materials.dust;
            emissiveIntensity = 0.5 * (1 - progress);
            break;
        default:
            material = materials.debris;
    }

    // Set material properties
    material.emissiveIntensity = emissiveIntensity;

    return (
        <>
            {particles.map((particle, index) => (
                <mesh
                    key={`${type}-${index}`}
                    position={particle.position.toArray()}
                    rotation={particle.rotation.toArray()}
                    scale={[particle.size, particle.size, particle.size]}
                >
                    <primitive attach="geometry" object={getGeometryForParticle(type)} />
                    <meshStandardMaterial
                        color={material.color}
                        transparent
                        opacity={particle.opacity}
                        emissive={material.color}
                        emissiveIntensity={emissiveIntensity}
                    />
                </mesh>
            ))}
        </>
    );
}

// Get the appropriate geometry based on particle type - optimized to use type directly
function getGeometryForParticle(type) {
    if (type === PARTICLE_TYPES.DEBRIS) {
        return sharedGeometries.debris;
    }
    return sharedGeometries.smallSphere;
}

// Optimized particle generation with better initial value distribution
function generateParticles(totalDebris, totalSmoke, debrisSize, radius, duration, secondaryEffects, smokeDuration) {
    const particles = [];

    // Pre-calculate common values
    const twoPI = Math.PI * 2;

    // Generate debris particles
    for (let i = 0; i < totalDebris; i++) {
        const angle = Math.random() * twoPI;
        const speed = 0.01 + Math.random() * 0.03;
        const size = (0.05 + Math.random() * 0.15) * debrisSize;
        const life = Math.floor(duration * (0.7 + Math.random() * 0.3));

        // Create velocity vector from pool
        const velocity = vectorPool.get().set(
            Math.cos(angle) * speed * (0.5 + Math.random()),
            0.01 + Math.random() * 0.03,
            Math.sin(angle) * speed * (0.5 + Math.random())
        );

        particles.push({
            active: false,
            spawnDelay: Math.floor(Math.random() * 3),
            position: vectorPool.get(),
            velocity,
            rotation: vectorPool.get().set(0, 0, 0),
            rotationSpeed: vectorPool.get().set(
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.1
            ),
            size,
            originalSize: size,
            type: PARTICLE_TYPES.DEBRIS,
            opacity: 0,
            targetOpacity: 0.7 + Math.random() * 0.3,
            life,
            initialLife: life
        });
    }

    // Generate smoke particles
    for (let i = 0; i < totalSmoke; i++) {
        const angle = Math.random() * twoPI;
        const distance = Math.random() * radius * 0.8;
        const speed = 0.003 + Math.random() * 0.007;
        const size = 0.2 + Math.random() * 0.4;
        const life = Math.floor(duration * (0.8 + Math.random() * 0.4) * smokeDuration);

        particles.push({
            active: false,
            spawnDelay: 3 + Math.floor(Math.random() * 5),
            position: vectorPool.get().set(
                Math.cos(angle) * distance * 0.2,
                0.2 + Math.random() * 0.3,
                Math.sin(angle) * distance * 0.2
            ),
            velocity: vectorPool.get().set(
                Math.cos(angle) * speed * 0.5,
                0.005 + Math.random() * 0.01,
                Math.sin(angle) * speed * 0.5
            ),
            rotation: vectorPool.get().set(0, 0, 0),
            rotationSpeed: vectorPool.get().set(
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02
            ),
            size,
            originalSize: size,
            type: PARTICLE_TYPES.SMOKE,
            opacity: 0,
            targetOpacity: 0.4 + Math.random() * 0.2,
            life,
            initialLife: life
        });
    }

    // Add shockwave if specified
    if (secondaryEffects.shockwave) {
        const shockwaveCount = Math.min(ANIM_CONSTANTS.MAX_SHOCKWAVE, Math.max(8, radius * 3));

        for (let i = 0; i < shockwaveCount; i++) {
            const angle = (i / shockwaveCount) * twoPI;
            const life = Math.floor(duration * 0.4);

            particles.push({
                active: false,
                spawnDelay: 0,
                position: vectorPool.get().set(0, 0.05, 0),
                velocity: vectorPool.get().set(0, 0, 0),
                rotation: vectorPool.get().set(Math.PI / 2, 0, angle),
                rotationSpeed: vectorPool.get().set(0, 0, 0),
                angle,
                size: 0.2,
                originalSize: 0.2,
                type: PARTICLE_TYPES.SHOCKWAVE,
                opacity: 0,
                targetOpacity: 0.6,
                life,
                initialLife: life
            });
        }
    }

    // Add dust cloud if specified
    if (secondaryEffects.dustCloud) {
        const dustCount = Math.min(ANIM_CONSTANTS.MAX_DUST, Math.floor(radius * 4));

        for (let i = 0; i < dustCount; i++) {
            const angle = Math.random() * twoPI;
            const distance = radius * 0.3 + Math.random() * radius * 0.5;
            const speed = 0.002 + Math.random() * 0.005;
            const size = 0.3 + Math.random() * 0.5;
            const life = Math.floor(duration * 0.6 + Math.random() * duration * 0.4);

            particles.push({
                active: false,
                spawnDelay: 5 + Math.floor(Math.random() * 7),
                position: vectorPool.get().set(0, 0, 0),
                velocity: vectorPool.get().set(
                    Math.cos(angle) * speed * distance,
                    0.001 + Math.random() * 0.004,
                    Math.sin(angle) * speed * distance
                ),
                rotation: vectorPool.get().set(0, 0, 0),
                rotationSpeed: vectorPool.get().set(0, (Math.random() - 0.5) * 0.02, 0),
                size,
                originalSize: size,
                type: PARTICLE_TYPES.DUST,
                opacity: 0,
                targetOpacity: 0.3 + Math.random() * 0.2,
                life,
                initialLife: life
            });
        }
    }

    return particles;
}

// Optimized batch particle update with reduced calculations
function updateParticlesBatch(particles, progress) {
    const chunkSize = ANIM_CONSTANTS.BATCH_SIZE;
    const particleCount = particles.length;

    for (let i = 0; i < particleCount; i += chunkSize) {
        const end = Math.min(i + chunkSize, particleCount);

        for (let j = i; j < end; j++) {
            const particle = particles[j];

            // Skip inactive or dead particles
            if (!particle.active) {
                particle.spawnDelay--;
                if (particle.spawnDelay <= 0) {
                    particle.active = true;
                }
                continue;
            }

            if (particle.life <= 0) continue;

            // Calculate this once per update
            const particleProgress = 1 - (particle.life / particle.initialLife);

            // Fade in particles - only update if needed
            if (particle.opacity < particle.targetOpacity) {
                particle.opacity = Math.min(
                    particle.targetOpacity,
                    particle.opacity + (particle.targetOpacity / 10)
                );
            }

            // Use switch instead of if/else for better performance on type-specific updates
            switch (particle.type) {
                case PARTICLE_TYPES.SHOCKWAVE:
                    updateShockwaveParticle(particle, particleProgress);
                    break;
                case PARTICLE_TYPES.DUST:
                    updateDustParticle(particle, particleProgress);
                    break;
                case PARTICLE_TYPES.SMOKE:
                    updateSmokeParticle(particle, particleProgress);
                    break;
                case PARTICLE_TYPES.DEBRIS:
                default:
                    updateDebrisParticle(particle, particleProgress);
                    break;
            }

            // Decrement life
            particle.life--;
        }
    }
}

// Particle update functions with optimized calculations
function updateShockwaveParticle(particle, progress) {
    // Faster calculation with less branching
    const currentRadius = progress * 3;

    particle.position.x = Math.cos(particle.angle) * currentRadius;
    particle.position.z = Math.sin(particle.angle) * currentRadius;

    // Combine conditions to reduce branches
    if (progress > 0.7) {
        particle.opacity = Math.max(0, particle.targetOpacity * (1 - ((progress - 0.7) / 0.3)));
    }

    particle.size = 0.1 + progress * 0.4;
}

function updateDustParticle(particle, progress) {
    particle.position.add(particle.velocity);
    particle.size = particle.originalSize * (1 + progress * 0.8);
    particle.rotation.y += particle.rotationSpeed.y;

    // Simplified opacity calculation
    if (progress > 0.6) {
        particle.opacity = particle.targetOpacity * Math.max(0, 1 - ((progress - 0.6) / 0.4));
    }
}

function updateSmokeParticle(particle, progress) {
    particle.position.add(particle.velocity);

    // Combined calculation - apply gravity and buoyancy in one step
    const buoyancyFactor = progress < 0.3 ? 0.0004 * (1 - progress / 0.3) : 0;
    particle.velocity.y += buoyancyFactor - 0.0002;

    // Calculate size directly
    particle.size = particle.originalSize * (1 + progress * 2.0);

    // Fade out in later stages
    if (progress > 0.6) {
        particle.opacity = particle.targetOpacity * Math.max(0, 1 - ((progress - 0.6) / 0.4));
    }

    // Apply rotation - consolidated
    particle.rotation.x += particle.rotationSpeed.x;
    particle.rotation.y += particle.rotationSpeed.y;
    particle.rotation.z += particle.rotationSpeed.z;
}

function updateDebrisParticle(particle, progress) {
    // Update position
    particle.position.add(particle.velocity);

    // Apply gravity
    particle.velocity.y -= 0.002;

    // Ground collision with simplified logic
    if (particle.position.y < 0.05 && particle.velocity.y < 0) {
        // Combined update for bounce and friction
        particle.velocity.y *= -0.3;
        particle.velocity.x *= 0.8;
        particle.velocity.z *= 0.8;
    }

    // Fade out
    if (progress > 0.7) {
        particle.opacity = particle.targetOpacity * Math.max(0, 1 - ((progress - 0.7) / 0.3));
    }

    // Apply rotation - simplified for better performance
    const { rotationSpeed, rotation } = particle;
    rotation.x += rotationSpeed.x;
    rotation.y += rotationSpeed.y;
    rotation.z += rotationSpeed.z;
}

// Reset all particles efficiently with vector pooling
function resetParticles(particles) {
    for (let particle of particles) {
        particle.opacity = 0;
        particle.active = particle.spawnDelay === 0;
        particle.life = particle.initialLife;

        // Reset position
        particle.position.set(0, 0, 0);

        // Type-specific resets
        if (particle.type === PARTICLE_TYPES.SHOCKWAVE) {
            particle.position.set(0, 0.05, 0);
        }
        else if (particle.type === PARTICLE_TYPES.SMOKE) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 0.2;
            particle.position.set(
                Math.cos(angle) * distance,
                0.2 + Math.random() * 0.3,
                Math.sin(angle) * distance
            );
        }
    }
} 