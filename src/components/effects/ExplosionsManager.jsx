import React, { useState, useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Explosion from './Explosion';
import { createExplosionEffect, WEAPON_TYPES, applyExplosionDamage, DAMAGE_PROFILES } from '../../utils/WeaponPhysics';

export default function ExplosionsManager() {
    const [explosions, setExplosions] = useState([]);
    const { scene } = useThree();
    const objectsCacheRef = useRef(new Map()); // Cache for scene objects to avoid re-traversing scene
    const explosionTimestampsRef = useRef(new Map()); // Store creation timestamps for safety cleanup

    // Update object cache when scene changes
    useEffect(() => {
        // Function to update the object cache
        const updateObjectCache = () => {
            const newCache = new Map();
            const processObject = (object) => {
                // More thorough check for vehicles and their parts
                if (object.userData && (object.userData.vehicleId ||
                    object.userData.isVehiclePart ||
                    object.userData.parentVehicleId ||
                    object.userData.vehicleType)) {
                    newCache.set(object.id, object);
                } else if (object.isMesh) {
                    // Still keep meshes for other types of collision
                    newCache.set(object.id, object);
                }

                // Process children
                if (object.children && object.children.length > 0) {
                    object.children.forEach(processObject);
                }
            };
            scene.children.forEach(processObject);
            objectsCacheRef.current = newCache;
        };

        updateObjectCache();

        // Use an interval instead of MutationObserver since THREE.js scenes don't trigger DOM mutations
        const intervalId = setInterval(updateObjectCache, 2000);

        return () => {
            clearInterval(intervalId);
        };
    }, [scene]);

    // Set up a custom event listener for creating explosions
    useEffect(() => {
        const handleExplosion = (event) => {
            const { position, weaponType } = event.detail;

            // Skip adding explosion animation for shotgun
            if (weaponType === WEAPON_TYPES.SHOTGUN) {
                // Only apply damage for shotgun without visual explosion effect
                const damageRadius = DAMAGE_PROFILES[weaponType].outerRadius * 2; // Doubled for better hit detection
                const objectsInRange = findObjectsInRadius(position, damageRadius);

                if (objectsInRange.length > 0) {
                    requestAnimationFrame(() => {
                        applyExplosionDamage(weaponType, position, objectsInRange);
                    });
                }
                return;
            }

            // Create explosion effect data
            const explosionEffect = createExplosionEffect(weaponType, position);

            // Find all objects in range of the explosion
            const damageRadius = explosionEffect.radius * 6; // Increased radius multiplier for better damage detection
            const objectsInRange = findObjectsInRadius(position, damageRadius);

            // Apply damage to objects
            if (objectsInRange.length > 0) {
                requestAnimationFrame(() => {
                    applyExplosionDamage(weaponType, position, objectsInRange);
                });
            }

            // Generate unique ID for explosion
            const explosionId = `explosion-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;

            // Add timestamp to track this explosion
            explosionTimestampsRef.current.set(explosionId, Date.now());

            // Add to explosions state with a unique ID
            setExplosions(prev => [...prev, {
                ...explosionEffect,
                id: explosionId
            }]);
        };

        // Add event listener
        window.addEventListener('weapon-impact', handleExplosion);

        // Clean up
        return () => {
            window.removeEventListener('weapon-impact', handleExplosion);
        };
    }, [scene]);

    // Add a safety cleanup mechanism for explosions that might be stuck
    useEffect(() => {
        const cleanupInterval = setInterval(() => {
            const MAX_EXPLOSION_LIFETIME = 5000; // 5 seconds, adjust based on your max expected animation duration
            const now = Date.now();
            let stuckExplosionsFound = false;

            // Check for explosions that have been around too long
            explosionTimestampsRef.current.forEach((timestamp, id) => {
                if (now - timestamp > MAX_EXPLOSION_LIFETIME) {
                    // Remove from timestamps
                    explosionTimestampsRef.current.delete(id);
                    stuckExplosionsFound = true;
                }
            });

            // If any stuck explosions found, update the state to remove them
            if (stuckExplosionsFound) {
                setExplosions(prev => {
                    const validIds = Array.from(explosionTimestampsRef.current.keys());
                    return prev.filter(explosion => validIds.includes(explosion.id));
                });
            }
        }, 1000); // Check every second

        return () => clearInterval(cleanupInterval);
    }, []);

    // Find all objects in radius around a position (optimized version)
    const findObjectsInRadius = (position, radius) => {
        const objectsInRange = [];
        const searchPosition = position.clone();
        const radiusSquared = radius * radius; // Squared distance for faster comparisons

        // Recursive function to check all scene objects and their children
        const checkObject = (object) => {
            if (!object.position) return;

            // Get world position of the object
            const worldPosition = new THREE.Vector3();
            object.getWorldPosition(worldPosition);

            // Compare squared distances (faster than using distanceTo)
            const dx = worldPosition.x - searchPosition.x;
            const dy = worldPosition.y - searchPosition.y;
            const dz = worldPosition.z - searchPosition.z;
            const distanceSquared = dx * dx + dy * dy + dz * dz;

            // If within radius, add to our list
            if (distanceSquared <= radiusSquared) {
                objectsInRange.push(object);
            }

            // Check children recursively
            if (object.children && object.children.length > 0) {
                for (const child of object.children) {
                    checkObject(child);
                }
            }
        };

        // Check all top-level scene objects
        scene.children.forEach(checkObject);

        return objectsInRange;
    };

    // Handle explosion completion (removal)
    const removeExplosion = (id) => {
        // Remove from timestamps tracking
        explosionTimestampsRef.current.delete(id);

        // Remove from state
        setExplosions(prev => prev.filter(explosion => explosion.id !== id));
    };

    // Render all active explosions
    return (
        <>
            {explosions.map(explosion => (
                <Explosion
                    key={explosion.id}
                    position={explosion.position}
                    radius={explosion.radius}
                    type={explosion.type}
                    duration={explosion.duration}
                    secondaryEffects={explosion.secondaryEffects}
                    onComplete={() => removeExplosion(explosion.id)}
                />
            ))}
        </>
    );
}

// Helper function to trigger an explosion event
export function triggerExplosion(position, weaponType) {
    // Create and dispatch custom event
    const event = new CustomEvent('weapon-impact', {
        detail: {
            position,
            weaponType
        }
    });

    window.dispatchEvent(event);
} 