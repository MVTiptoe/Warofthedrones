import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import ShotgunMuzzleFlash from './ShotgunMuzzleFlash';
import { WEAPON_TYPES } from '../../utils/WeaponPhysics';

/**
 * Manager component for shotgun-specific effects
 * This is used instead of explosions for shotgun weapons
 */
export default function ShotgunEffectsManager() {
    // Track active muzzle flashes
    const [muzzleFlashes, setMuzzleFlashes] = useState([]);

    // Set up a custom event listener for shotgun firing
    useEffect(() => {
        // Handler for shotgun-specific effects
        const handleShotgunFire = (event) => {
            const { position, direction, weaponType } = event.detail;

            // Only process shotgun events
            if (weaponType !== WEAPON_TYPES.SHOTGUN) return;

            // Create a unique ID for this muzzle flash
            const id = `flash-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;

            // Add to muzzle flashes with unique ID
            setMuzzleFlashes(prev => [...prev, {
                id,
                position,
                direction: direction || new THREE.Vector3(0, 0, -1) // Default if not provided
            }]);
        };

        // Add event listener specific to shotgun firing
        window.addEventListener('shotgun-fire', handleShotgunFire);

        // Listen for regular weapon impacts to handle shotgun impacts without explosions
        const handleWeaponImpact = (event) => {
            const { position, weaponType, direction } = event.detail;

            // Only process shotgun events
            if (weaponType !== WEAPON_TYPES.SHOTGUN) return;

            // For shotgun impacts, we might want to show small pellet hit effects
            // But we don't create full explosions - those are now disabled in ExplosionsManager

            // For demonstration, we'll create a small muzzle flash at the impact point
            const id = `impact-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;

            setMuzzleFlashes(prev => [...prev, {
                id,
                position,
                direction: direction || new THREE.Vector3(0, 0, -1),
                isImpact: true // Flag this as an impact flash (could be styled differently)
            }]);
        };

        // Also listen for regular weapon impacts to handle shotgun specially
        window.addEventListener('weapon-impact', handleWeaponImpact);

        // Clean up
        return () => {
            window.removeEventListener('shotgun-fire', handleShotgunFire);
            window.removeEventListener('weapon-impact', handleWeaponImpact);
        };
    }, []);

    // Remove a muzzle flash when it completes
    const removeMuzzleFlash = (id) => {
        setMuzzleFlashes(prev => prev.filter(flash => flash.id !== id));
    };

    // Render all active muzzle flashes
    return (
        <>
            {muzzleFlashes.map(flash => (
                <ShotgunMuzzleFlash
                    key={flash.id}
                    position={flash.position}
                    direction={flash.direction}
                    onComplete={() => removeMuzzleFlash(flash.id)}
                    isImpact={flash.isImpact}
                />
            ))}
        </>
    );
}

// Helper function to trigger a shotgun fire effect
export function triggerShotgunFire(position, direction) {
    // Create and dispatch custom event specifically for shotgun effects
    const event = new CustomEvent('shotgun-fire', {
        detail: {
            position,
            direction,
            weaponType: WEAPON_TYPES.SHOTGUN
        }
    });

    window.dispatchEvent(event);
} 