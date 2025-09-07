import React, { useState, useEffect, useRef } from 'react';
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

    // Performance optimization refs
    const pendingFlashesRef = useRef([]);
    const processingBatchRef = useRef(false);
    const lastProcessTimeRef = useRef(0);

    // Batch process flashes for better performance
    const processPendingFlashes = () => {
        if (processingBatchRef.current || pendingFlashesRef.current.length === 0) return;

        processingBatchRef.current = true;

        // Limit the number of flashes processed in a single batch based on FPS
        const currentFps = window.currentFps || 60;
        const batchLimit = currentFps < 30 ? 1 : (currentFps < 45 ? 2 : 3);

        // Get a batch of pending flashes
        const flashesToProcess = pendingFlashesRef.current.slice(0, batchLimit);
        pendingFlashesRef.current = pendingFlashesRef.current.slice(batchLimit);

        // Add them to the state
        setMuzzleFlashes(prev => [...prev, ...flashesToProcess]);

        // Schedule the next batch if there are more pending
        if (pendingFlashesRef.current.length > 0) {
            setTimeout(() => {
                processingBatchRef.current = false;
                processPendingFlashes();
            }, 0);
        } else {
            processingBatchRef.current = false;
        }
    };

    // Add a flash to the pending queue
    const queueMuzzleFlash = (flash) => {
        pendingFlashesRef.current.push(flash);

        // Start processing the queue if not already processing
        if (!processingBatchRef.current) {
            processPendingFlashes();
        }
    };

    // Set up a custom event listener for shotgun firing
    useEffect(() => {
        // Handler for shotgun-specific effects with throttling
        const handleShotgunFire = (event) => {
            const { position, direction, weaponType } = event.detail;

            // Only process shotgun events
            if (weaponType !== WEAPON_TYPES.SHOTGUN) return;

            // Apply throttling for shotgun events in low FPS situations
            const now = Date.now();
            const throttleTime = window.lowFpsWarning ? 150 : 50; // Longer throttle time when FPS is low

            if (now - lastProcessTimeRef.current < throttleTime) {
                // Skip this shotgun event due to throttling
                console.log("Throttled shotgun effect");
                return;
            }
            lastProcessTimeRef.current = now;

            // Create a unique ID for this muzzle flash
            const id = `flash-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;

            // Add to the pending queue instead of directly to state
            queueMuzzleFlash({
                id,
                position,
                direction: direction || new THREE.Vector3(0, 0, -1) // Default if not provided
            });
        };

        // Add event listener specific to shotgun firing
        window.addEventListener('shotgun-fire', handleShotgunFire);

        // Listen for regular weapon impacts to handle shotgun impacts without explosions
        const handleWeaponImpact = (event) => {
            const { position, weaponType, direction } = event.detail;

            // Only process shotgun events
            if (weaponType !== WEAPON_TYPES.SHOTGUN) return;

            // Apply even more aggressive throttling for impact effects
            const now = Date.now();
            const throttleTime = window.lowFpsWarning ? 200 : 100; // Longer throttle time when FPS is low

            if (now - lastProcessTimeRef.current < throttleTime) {
                // Skip this impact event due to throttling
                return;
            }

            // At very low FPS, randomly skip some impacts entirely
            if (window.currentFps < 25 && Math.random() < 0.7) {
                return;
            }

            // For shotgun impacts, we might want to show small pellet hit effects
            // But we don't create full explosions - those are now disabled in ExplosionsManager

            // For demonstration, we'll create a small muzzle flash at the impact point
            const id = `impact-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;

            // Add to the pending queue instead of directly to state
            queueMuzzleFlash({
                id,
                position,
                direction: direction || new THREE.Vector3(0, 0, -1),
                isImpact: true // Flag this as an impact flash (could be styled differently)
            });
        };

        // Also listen for regular weapon impacts to handle shotgun specially
        window.addEventListener('weapon-impact', handleWeaponImpact);

        // Set up listener for persistent low FPS events to adjust effect quality
        const handlePersistentLowFps = () => {
            console.log("Persistent low FPS detected - reducing shotgun effect quality");
            // Immediately clear any pending effects
            pendingFlashesRef.current = [];

            // Reduce current effects if there are too many
            setMuzzleFlashes(prev => {
                if (prev.length > 3) {
                    return prev.slice(0, 3);
                }
                return prev;
            });
        };

        window.addEventListener('persistentLowFps', handlePersistentLowFps);

        // Clean up
        return () => {
            window.removeEventListener('shotgun-fire', handleShotgunFire);
            window.removeEventListener('weapon-impact', handleWeaponImpact);
            window.removeEventListener('persistentLowFps', handlePersistentLowFps);
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