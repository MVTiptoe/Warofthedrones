import { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';

/**
 * Custom hook for projectile object pooling
 * @param {Object} poolSizes - Object mapping weapon types to pool sizes
 * @returns {Object} - Pool management functions
 */
export function useProjectilePool(poolSizes = {}) {
    // Create a pool for each weapon type
    const [pools, setPools] = useState({});
    const [activeProjectiles, setActiveProjectiles] = useState([]);
    const initialized = useRef(false);

    // Initialize pools
    useEffect(() => {
        if (initialized.current) return;

        const initialPools = {};

        Object.entries(poolSizes).forEach(([type, size]) => {
            initialPools[type] = Array(size).fill().map((_, i) => ({
                id: `${type}-${i}`,
                position: new THREE.Vector3(),
                previousPosition: new THREE.Vector3(),
                direction: new THREE.Vector3(),
                type: type,
                speed: 0,
                life: 0,
                active: false,
                gravity: 0
            }));
        });

        setPools(initialPools);
        initialized.current = true;
    }, [poolSizes]);

    // Get a projectile from the pool
    const getProjectile = (type) => {
        if (!pools[type]) return null;

        // Find an inactive projectile
        const pool = [...pools[type]];
        const index = pool.findIndex(p => !p.active);

        if (index !== -1) {
            // Mark as active and return
            pool[index] = { ...pool[index], active: true };
            setPools(prev => ({ ...prev, [type]: pool }));
            return pool[index];
        }

        // If pool is exhausted, create a new one
        console.warn(`Pool for ${type} is exhausted, creating new projectile`);
        const newProjectile = {
            id: `${type}-${pools[type].length}`,
            position: new THREE.Vector3(),
            previousPosition: new THREE.Vector3(),
            direction: new THREE.Vector3(),
            type: type,
            speed: 0,
            life: 0,
            active: true,
            gravity: 0
        };

        setPools(prev => ({
            ...prev,
            [type]: [...prev[type], newProjectile]
        }));

        return newProjectile;
    };

    // Return a projectile to the pool
    const returnProjectile = (projectile) => {
        if (!projectile || !projectile.type || !pools[projectile.type]) return;

        setPools(prev => {
            const pool = [...prev[projectile.type]];
            const index = pool.findIndex(p => p.id === projectile.id);

            if (index !== -1) {
                pool[index] = { ...pool[index], active: false, life: 0 };
            }

            return { ...prev, [projectile.type]: pool };
        });

        setActiveProjectiles(prev => prev.filter(p => p.id !== projectile.id));
    };

    // Add a projectile to active list
    const addActiveProjectile = (projectile) => {
        setActiveProjectiles(prev => [...prev, projectile]);
    };

    return {
        getProjectile,
        returnProjectile,
        addActiveProjectile,
        activeProjectiles,
        setActiveProjectiles
    };
} 