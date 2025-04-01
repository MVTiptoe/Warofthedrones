import { create } from 'zustand';
import * as THREE from 'three';
import { createContext, useContext } from 'react';

// Define explosion types and their properties
const EXPLOSION_TYPES = {
    small: {
        radius: 3,
        duration: 0.8,
        color: '#ff9500',
        intensity: 2,
        particleCount: 20,
        sound: 'explosion_small'
    },
    medium: {
        radius: 6,
        duration: 1.2,
        color: '#ff5100',
        intensity: 3,
        particleCount: 35,
        sound: 'explosion_medium'
    },
    large: {
        radius: 10,
        duration: 1.8,
        color: '#ff0000',
        intensity: 4,
        particleCount: 50,
        sound: 'explosion_large'
    },
    shotgun: {
        radius: 2,
        duration: 0.5,
        color: '#ffbb00',
        intensity: 1.5,
        particleCount: 15,
        sound: 'shotgun_blast'
    }
};

// Create the explosion store
export const useExplosions = create((set, get) => ({
    // Active explosions array
    explosions: [],

    // Add a new explosion - optimized for performance
    createExplosion: ({ position, radius, type = 'medium', damage = 0, damageRadius = 0, onComplete }) => {
        // Skip creating explosion for shotgun type
        if (type === 'shotgun') {
            // Just call the onComplete handler immediately if provided
            if (onComplete && typeof onComplete === 'function') {
                setTimeout(onComplete, 0);
            }
            // Return a dummy ID since we're not creating an actual explosion
            return `no-explosion-shotgun-${Date.now().toString(36)}`;
        }

        // Get explosion type data
        const explosionData = EXPLOSION_TYPES[type] || EXPLOSION_TYPES.medium;

        // Creating a more efficient unique ID
        const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

        // Optimize position handling with direct assignment for better performance
        const newPosition = position.clone ? position.clone() : new THREE.Vector3(
            position.x || 0,
            position.y || 0,
            position.z || 0
        );

        // Create a new explosion with optimized data structure
        const newExplosion = {
            id,
            position: newPosition,
            radius: radius || explosionData.radius,
            color: explosionData.color,
            startTime: Date.now(),
            duration: explosionData.duration * 1000, // convert to ms
            particleCount: Math.min(explosionData.particleCount, 100), // Cap particle count for performance
            intensity: explosionData.intensity,
            type,
            damage,
            damageRadius: damageRadius || (radius || explosionData.radius),
            pendingRemoval: false // Flag for managed cleanup
        };

        // Use batch update for state
        set(state => {
            // Limit maximum number of simultaneous explosions for performance
            const maxExplosions = 20;
            let updatedExplosions = [...state.explosions, newExplosion];

            // If too many explosions, remove oldest ones
            if (updatedExplosions.length > maxExplosions) {
                const excessCount = updatedExplosions.length - maxExplosions;
                // Mark oldest explosions for removal
                for (let i = 0; i < excessCount; i++) {
                    updatedExplosions[i].pendingRemoval = true;
                }
                // Filter out explosions marked for removal
                updatedExplosions = updatedExplosions.filter(exp => !exp.pendingRemoval);
            }

            return { explosions: updatedExplosions };
        });

        // Setup automatic cleanup with requestIdleCallback if available for better performance
        const cleanupFunc = typeof window !== 'undefined' && window.requestIdleCallback
            ? window.requestIdleCallback
            : setTimeout;

        cleanupFunc(() => {
            // Check if this explosion is still in the state before removing
            if (get().explosions.some(e => e.id === id)) {
                set(state => ({
                    explosions: state.explosions.filter(e => e.id !== id)
                }));

                if (onComplete && typeof onComplete === 'function') {
                    onComplete();
                }
            }
        }, typeof window !== 'undefined' && window.requestIdleCallback
            ? { timeout: explosionData.duration * 1000 }
            : explosionData.duration * 1000);

        return id;
    },

    // Remove an explosion by ID - optimized
    removeExplosion: (id) => {
        set(state => {
            // Find the explosion first to avoid unnecessary updates
            const explosionExists = state.explosions.some(e => e.id === id);
            if (!explosionExists) return state; // No change if explosion doesn't exist

            return {
                explosions: state.explosions.filter(e => e.id !== id)
            };
        });
    },

    // Efficiently remove all explosions
    clearAllExplosions: () => {
        set({ explosions: [] });
    },

    // Get explosion progress (0 to 1) with optimized calculation
    getExplosionProgress: (id) => {
        const explosion = get().explosions.find(e => e.id === id);
        if (!explosion) return 1; // Complete if not found

        const elapsed = Date.now() - explosion.startTime;
        return Math.min(1, Math.max(0, elapsed / explosion.duration));
    },

    // Get all active explosions within a radius of a position - spatial optimization
    getExplosionsInRadius: (position, radius) => {
        const explosions = get().explosions;
        const radiusSquared = radius * radius;

        return explosions.filter(explosion => {
            const dx = explosion.position.x - position.x;
            const dy = explosion.position.y - position.y;
            const dz = explosion.position.z - position.z;

            // Use squared distance for more efficient comparison
            const distanceSquared = dx * dx + dy * dy + dz * dz;
            return distanceSquared <= radiusSquared;
        });
    }
}));

// React context for sharing explosion system across components
export const ExplosionContext = createContext(null);

export const ExplosionProvider = ({ children }) => {
    const explosionSystem = useExplosions();

    return (
        <ExplosionContext.Provider value={explosionSystem}>
            {children}
        </ExplosionContext.Provider>
    );
};

// Renamed to avoid conflict with the Zustand store export
export const useExplosionContext = () => useContext(ExplosionContext); 