import * as THREE from 'three';
import { create } from 'zustand';

// Vehicle health defaults by type category
export const VEHICLE_HEALTH_DEFAULTS = {
    TANK: {
        maxHealth: 100,
        criticalThreshold: 0.5, // Changed to 50% health
        visualDamageStages: [],
        hitboxSize: new THREE.Vector3(2.4, 1.0, 3.2), // Increased for better hit detection
        // Different damage multipliers by hit location
        hitLocations: {
            turret: { damageMultiplier: 1.2 }, // Critical component
            tracks: { damageMultiplier: 0.8, mobilityEffect: 0.5 }, // Reduced damage but affects mobility
            rear: { damageMultiplier: 1.5 }, // Weak spot
            front: { damageMultiplier: 0.6 }, // Strong armor
            body: { damageMultiplier: 1.0 } // Standard damage to body
        }
    },
    IFV: {
        maxHealth: 70,
        criticalThreshold: 0.5, // Changed to 50% health
        visualDamageStages: [],
        hitboxSize: new THREE.Vector3(2.0, 0.9, 3.0), // Increased for better hit detection
        hitLocations: {
            turret: { damageMultiplier: 1.2 },
            wheels: { damageMultiplier: 0.8, mobilityEffect: 0.4 },
            rear: { damageMultiplier: 1.3 },
            front: { damageMultiplier: 0.7 },
            body: { damageMultiplier: 1.0 } // Standard damage to body
        }
    },
    MILITARY_TRUCK: {
        maxHealth: 50,
        criticalThreshold: 0.5, // Changed to 50% health
        visualDamageStages: [],
        hitboxSize: new THREE.Vector3(1.7, 1.4, 3.2), // Increased for better hit detection
        hitLocations: {
            cabin: { damageMultiplier: 1.1 },
            wheels: { damageMultiplier: 0.9, mobilityEffect: 0.5 },
            cargo: { damageMultiplier: 0.8 },
            engine: { damageMultiplier: 1.4 },
            body: { damageMultiplier: 1.0 } // Standard damage to body
        }
    },
    CIVILIAN_TRUCK: {
        maxHealth: 30,
        criticalThreshold: 0.5, // Changed to 50% health
        visualDamageStages: [],
        hitboxSize: new THREE.Vector3(1.7, 1.4, 3.2), // Increased for better hit detection
        hitLocations: {
            cabin: { damageMultiplier: 1.2 },
            wheels: { damageMultiplier: 1.0, mobilityEffect: 0.7 },
            cargo: { damageMultiplier: 0.9 },
            engine: { damageMultiplier: 1.5 },
            body: { damageMultiplier: 1.0 } // Standard damage to body
        }
    },
    CAR: {
        maxHealth: 20,
        criticalThreshold: 0.5, // Changed to 50% health
        visualDamageStages: [],
        hitboxSize: new THREE.Vector3(1.4, 0.8, 2.2), // Increased for better hit detection
        hitLocations: {
            cabin: { damageMultiplier: 1.2 },
            wheels: { damageMultiplier: 1.0, mobilityEffect: 0.8 },
            engine: { damageMultiplier: 1.5 },
            body: { damageMultiplier: 1.0 } // Standard damage to body
        }
    }
};

// Vehicle category mapping - which vehicle belongs to which category
export const VEHICLE_CATEGORY_MAP = {
    // Tanks
    tank_a: 'TANK',
    tank_b: 'TANK',

    // IFVs
    ifv_a: 'IFV',
    ifv_b: 'IFV',

    // Civilian Trucks
    civilian_truck_1: 'CIVILIAN_TRUCK',
    civilian_truck_2: 'CIVILIAN_TRUCK',
    civilian_truck_3: 'CIVILIAN_TRUCK',

    // Military Trucks
    military_truck_1: 'MILITARY_TRUCK',
    military_truck_2: 'MILITARY_TRUCK',
    military_truck_3: 'MILITARY_TRUCK',

    // Cars
    car_a: 'CAR',
    car_b: 'CAR',
    car_c: 'CAR',
    car_d: 'CAR',
    car_e: 'CAR'
};

// Zustand store for global health state management
export const useVehicleHealthStore = create((set, get) => ({
    // Map of vehicle IDs to their health state
    vehicleHealth: {},

    // Map for respawn timers
    respawnTimers: {},

    // Initialize a vehicle in the health system
    initVehicle: (vehicleId, vehicleType) => {
        set((state) => {
            // Skip if already initialized
            if (state.vehicleHealth[vehicleId]) return state;

            const category = VEHICLE_CATEGORY_MAP[vehicleType];
            const healthDefaults = VEHICLE_HEALTH_DEFAULTS[category];

            return {
                vehicleHealth: {
                    ...state.vehicleHealth,
                    [vehicleId]: {
                        id: vehicleId,
                        type: vehicleType,
                        category,
                        currentHealth: healthDefaults.maxHealth,
                        maxHealth: healthDefaults.maxHealth,
                        isDead: false,
                        isDestroyed: false, // New flag for when vehicle is removed from scene
                        isCritical: false,
                        mobilityFactor: 1.0, // Full mobility
                        visualEffects: [],
                        hitboxSize: healthDefaults.hitboxSize,
                        damageLog: []
                    }
                }
            };
        });
    },

    // Apply damage to a vehicle
    applyDamage: (vehicleId, rawDamage, hitLocation = null, weaponType = null) => {
        set((state) => {
            const vehicle = state.vehicleHealth[vehicleId];
            if (!vehicle || vehicle.isDead || vehicle.isDestroyed) return state;

            const category = vehicle.category;
            const healthDefaults = VEHICLE_HEALTH_DEFAULTS[category];

            // Calculate final damage after hit location modifiers
            let damageMultiplier = 1.0;
            let mobilityEffect = 0;

            // Apply hit location modifiers if provided
            if (hitLocation && healthDefaults.hitLocations[hitLocation]) {
                const locationData = healthDefaults.hitLocations[hitLocation];
                damageMultiplier = locationData.damageMultiplier;
                mobilityEffect = locationData.mobilityEffect || 0;
            }

            // Calculate final damage (removed armor reduction, only apply hit location multiplier)
            const finalDamage = rawDamage * damageMultiplier;

            // Calculate new health
            const newHealth = Math.max(0, vehicle.currentHealth - finalDamage);
            const healthPercentage = newHealth / vehicle.maxHealth;

            // Determine visual effects based on damage stages
            const visualEffects = [];
            healthDefaults.visualDamageStages.forEach(stage => {
                if (healthPercentage <= stage.threshold) {
                    visualEffects.push(...stage.effects);
                }
            });

            // Add greyed out effect if dead
            if (newHealth <= 0) {
                visualEffects.push('GREYED_OUT');
            }

            // Determine critical state (50% health = critical)
            const isCritical = healthPercentage <= healthDefaults.criticalThreshold;

            // Determine if dead (0% health = dead)
            const isDead = newHealth <= 0;

            // Calculate new mobility factor (lower = slower)
            let newMobilityFactor = vehicle.mobilityFactor;

            // Immobilize at 50% health or below
            if (healthPercentage <= 0.5) {
                newMobilityFactor = 0;
            } else if (mobilityEffect > 0) {
                // Only apply mobility effects if above 50% health
                newMobilityFactor = Math.max(0.1, newMobilityFactor - mobilityEffect);
            }

            // Log the damage event
            const damageEvent = {
                timestamp: Date.now(),
                rawDamage,
                finalDamage,
                hitLocation,
                weaponType,
                healthBefore: vehicle.currentHealth,
                healthAfter: newHealth
            };

            const updatedVehicle = {
                ...vehicle,
                currentHealth: newHealth,
                healthPercentage,
                isDead,
                isCritical,
                mobilityFactor: isDead ? 0 : newMobilityFactor,
                visualEffects: visualEffects,
                damageLog: [...vehicle.damageLog, damageEvent]
            };

            // Set up destruction timer if vehicle just died
            if (isDead && !vehicle.isDead) {
                // Vehicle stays visible and greyed out for 5 seconds after death, then gets destroyed
                setTimeout(() => {
                    get().destroyVehicle(vehicleId);
                }, 5000);
            }

            return {
                vehicleHealth: {
                    ...state.vehicleHealth,
                    [vehicleId]: updatedVehicle
                }
            };
        });
    },

    // Mark vehicle as destroyed (remove from scene)
    destroyVehicle: (vehicleId) => {
        set((state) => {
            const vehicle = state.vehicleHealth[vehicleId];
            if (!vehicle || vehicle.isDestroyed) return state;

            // Set respawn timer - vehicle will respawn after 30 seconds
            const respawnTimer = setTimeout(() => {
                get().respawnVehicle(vehicleId);
            }, 30000);

            // Store the timer so we can cancel if needed
            const updatedTimers = {
                ...state.respawnTimers,
                [vehicleId]: respawnTimer
            };

            return {
                vehicleHealth: {
                    ...state.vehicleHealth,
                    [vehicleId]: {
                        ...vehicle,
                        isDestroyed: true
                    }
                },
                respawnTimers: updatedTimers
            };
        });
    },

    // Respawn a vehicle with full health
    respawnVehicle: (vehicleId) => {
        set((state) => {
            const vehicle = state.vehicleHealth[vehicleId];
            if (!vehicle) return state;

            const category = vehicle.category;
            const healthDefaults = VEHICLE_HEALTH_DEFAULTS[category];

            return {
                vehicleHealth: {
                    ...state.vehicleHealth,
                    [vehicleId]: {
                        ...vehicle,
                        currentHealth: healthDefaults.maxHealth,
                        maxHealth: healthDefaults.maxHealth,
                        isDead: false,
                        isDestroyed: false,
                        isCritical: false,
                        mobilityFactor: 1.0,
                        visualEffects: [],
                        damageLog: [] // Clear damage log on respawn
                    }
                }
            };
        });
    },

    // Repair a vehicle (partial or full repair)
    repairVehicle: (vehicleId, amount = null) => {
        set((state) => {
            const vehicle = state.vehicleHealth[vehicleId];
            if (!vehicle || vehicle.isDestroyed) return state;

            // Full repair if no amount specified
            const newHealth = amount ?
                Math.min(vehicle.maxHealth, vehicle.currentHealth + amount) :
                vehicle.maxHealth;

            const healthPercentage = newHealth / vehicle.maxHealth;

            // Determine visual effects based on damage stages
            const visualEffects = [];
            const healthDefaults = VEHICLE_HEALTH_DEFAULTS[vehicle.category];

            return {
                vehicleHealth: {
                    ...state.vehicleHealth,
                    [vehicleId]: {
                        ...vehicle,
                        currentHealth: newHealth,
                        healthPercentage,
                        isDead: false, // Resurrect if was dead
                        isCritical: healthPercentage <= healthDefaults.criticalThreshold,
                        mobilityFactor: 1.0, // Restore full mobility on repair
                        visualEffects
                    }
                }
            };
        });
    },

    // Remove a vehicle from the health system
    removeVehicle: (vehicleId) => {
        set((state) => {
            // Clear any respawn timer
            if (state.respawnTimers[vehicleId]) {
                clearTimeout(state.respawnTimers[vehicleId]);
            }

            const { [vehicleId]: _, ...remainingVehicles } = state.vehicleHealth;
            const { [vehicleId]: __, ...remainingTimers } = state.respawnTimers;

            return {
                vehicleHealth: remainingVehicles,
                respawnTimers: remainingTimers
            };
        });
    },

    // Get vehicle health data
    getVehicleHealth: (vehicleId) => {
        return useVehicleHealthStore.getState().vehicleHealth[vehicleId];
    }
}));

/**
 * Calculate whether a projectile hit a vehicle and where
 * @param {THREE.Vector3} projectilePosition - Position of the projectile
 * @param {Object} vehicle - Vehicle object with position, rotation and type properties
 * @returns {Object|null} Hit result with location or null if no hit
 */
export function checkVehicleHit(projectilePosition, vehicle) {
    const vehicleCategory = VEHICLE_CATEGORY_MAP[vehicle.type];
    const healthDefaults = VEHICLE_HEALTH_DEFAULTS[vehicleCategory];

    // Skip if no matching vehicle type/category
    if (!healthDefaults) {
        return null;
    }

    // Create a bounding box for the vehicle based on its position, rotation and hitbox size
    const hitboxSize = healthDefaults.hitboxSize;

    // Get vehicle position as a Vector3
    const boundingBoxCenter = new THREE.Vector3(
        vehicle.position.x || 0,
        vehicle.position.y || 0,
        vehicle.position.z || 0
    );

    // Create a rotation matrix from vehicle rotation
    const vehicleMatrix = new THREE.Matrix4().makeRotationFromEuler(
        new THREE.Euler(
            vehicle.rotation.x || 0,
            vehicle.rotation.y || 0,
            vehicle.rotation.z || 0
        )
    );

    // Create an oriented bounding box (OBB) by setting up corner vertices
    const halfExtents = new THREE.Vector3(
        hitboxSize.x * 0.75, // Increased hitbox size for better hit detection
        hitboxSize.y * 0.75,
        hitboxSize.z * 0.75
    );

    // Create a standard axis-aligned bounding box
    const boundingBox = new THREE.Box3(
        new THREE.Vector3().copy(boundingBoxCenter).sub(halfExtents),
        new THREE.Vector3().copy(boundingBoxCenter).add(halfExtents)
    );

    // Check if projectile position is inside bounding box
    // Note: This is simplified collision and doesn't account for rotation,
    // but should be enough for gameplay mechanics
    if (boundingBox.containsPoint(projectilePosition)) {
        // Determine hit location based on relative position within the vehicle
        // First transform projectile position to vehicle's local space
        const localPos = projectilePosition.clone().sub(boundingBoxCenter);

        // Use invert instead of getInverse (deprecated)
        const inverseMatrix = new THREE.Matrix4().copy(vehicleMatrix).invert();
        localPos.applyMatrix4(inverseMatrix);

        // Determine hit location based on local coordinates
        let hitLocation;

        // More precise hit location determination for different vehicle types
        if (vehicleCategory === 'TANK') {
            // Tank-specific hit locations
            if (localPos.y > hitboxSize.y * 0.3) {
                hitLocation = 'turret';
            } else if (localPos.y < -hitboxSize.y * 0.3) {
                hitLocation = 'tracks';
            } else if (localPos.z > hitboxSize.z * 0.3) {
                hitLocation = 'front';
            } else if (localPos.z < -hitboxSize.z * 0.3) {
                hitLocation = 'rear';
            } else {
                hitLocation = 'body';
            }
        } else if (vehicleCategory === 'IFV') {
            // IFV-specific hit locations
            if (localPos.y > hitboxSize.y * 0.3) {
                hitLocation = 'turret';
            } else if (localPos.y < -hitboxSize.y * 0.3) {
                hitLocation = 'wheels';
            } else if (localPos.z > hitboxSize.z * 0.3) {
                hitLocation = 'front';
            } else if (localPos.z < -hitboxSize.z * 0.3) {
                hitLocation = 'rear';
            } else {
                hitLocation = 'body';
            }
        } else if (vehicleCategory === 'CIVILIAN_TRUCK' || vehicleCategory === 'MILITARY_TRUCK') {
            // Truck-specific hit locations
            if (localPos.z > hitboxSize.z * 0.2) {
                hitLocation = 'cabin';
            } else if (localPos.z < -hitboxSize.z * 0.2) {
                hitLocation = 'cargo';
            } else if (localPos.y < -hitboxSize.y * 0.3) {
                hitLocation = 'wheels';
            } else if (localPos.z > 0 && localPos.y > 0) {
                hitLocation = 'engine';
            } else {
                hitLocation = 'body';
            }
        } else if (vehicleCategory === 'CAR') {
            // Car-specific hit locations
            if (localPos.z > hitboxSize.z * 0.3) {
                hitLocation = 'engine';
            } else if (localPos.z < -hitboxSize.z * 0.3) {
                hitLocation = 'rear';
            } else if (localPos.y < -hitboxSize.y * 0.3) {
                hitLocation = 'wheels';
            } else if (localPos.z > 0) {
                hitLocation = 'cabin';
            } else {
                hitLocation = 'body';
            }
        } else {
            // Default hit location for unknown vehicle types
            hitLocation = 'body';
        }

        return {
            hit: true,
            location: hitLocation,
            position: projectilePosition.clone(),
            distanceFromCenter: localPos.length()
        };
    }

    return null; // No hit
}

/**
 * Utility function to create visual effects for damaged vehicles
 * @param {Object} vehicleHealth - Health data for the vehicle
 * @returns {Array} Array of effect components to render
 */
export function createDamageEffects(vehicleHealth) {
    if (!vehicleHealth || vehicleHealth.isDead || vehicleHealth.visualEffects.length === 0) {
        return [];
    }

    // Map of effect types to their rendering components
    // These would be implemented separately in a visual effects system
    const effects = [];

    vehicleHealth.visualEffects.forEach(effectType => {
        switch (effectType) {
            case 'LIGHT_SMOKE':
                effects.push({
                    type: 'smoke',
                    size: 0.5,
                    color: '#888888',
                    opacity: 0.4,
                    rate: 0.2
                });
                break;
            case 'MEDIUM_SMOKE':
                effects.push({
                    type: 'smoke',
                    size: 1.0,
                    color: '#555555',
                    opacity: 0.6,
                    rate: 0.5
                });
                break;
            case 'HEAVY_SMOKE':
                effects.push({
                    type: 'smoke',
                    size: 1.5,
                    color: '#333333',
                    opacity: 0.8,
                    rate: 0.8
                });
                break;
            case 'FIRE':
                effects.push({
                    type: 'fire',
                    size: 0.8,
                    intensity: 1.2,
                    flickerSpeed: 0.1
                });
                break;
            case 'SPARK':
                effects.push({
                    type: 'spark',
                    size: 0.3,
                    rate: 0.4,
                    color: '#ffaa00'
                });
                break;
            case 'DESTROYED':
                effects.push({
                    type: 'wreckage',
                    blackenFactor: 0.8
                });
                break;
            default:
                break;
        }
    });

    return effects;
} 