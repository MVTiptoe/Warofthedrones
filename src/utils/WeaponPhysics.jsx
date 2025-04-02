import * as THREE from 'three';
// Import the vehicle health system
import { checkVehicleHit, useVehicleHealthStore, VEHICLE_CATEGORY_MAP } from './VehicleHealthSystem';

// FPS Tracking for performance optimization
window.currentFps = 60; // Initialize with ideal FPS
let frameCount = 0;
let lastFpsUpdateTime = 0;

// Update FPS calculation every 0.5 seconds
if (typeof window !== 'undefined') {
    const updateFps = () => {
        const now = performance.now();
        const elapsed = now - lastFpsUpdateTime;

        if (elapsed >= 500) { // Update every 0.5 seconds
            window.currentFps = frameCount * (1000 / elapsed);
            lastFpsUpdateTime = now;
            frameCount = 0;
        } else {
            frameCount++;
        }

        requestAnimationFrame(updateFps);
    };

    requestAnimationFrame(updateFps);
}

// Weapon types and their damage profiles
export const WEAPON_TYPES = {
    // Bomber weapons
    ANTI_TANK_MINE: 'ANTI_TANK_MINE',
    RPG: 'RPG',
    MORTAR: 'MORTAR',

    // Grenadier weapons
    DART: 'DART',
    GRENADE: 'GRENADE',
    SHOTGUN: 'SHOTGUN',

    // Kamikaze drone weapon
    KAMIKAZE: 'KAMIKAZE'
};

// Damage profiles for each weapon type
export const DAMAGE_PROFILES = {
    // Bomber weapons
    [WEAPON_TYPES.ANTI_TANK_MINE]: {
        innerRadius: 8, // meters
        outerRadius: 20, // meters
        innerDamage: 30,
        outerDamage: 10,
        falloff: 'EXPONENTIAL', // damage falls off exponentially
        explodesOnImpact: true, // Always explode on impact with vehicles
        visualEffect: {
            radius: 4,
            duration: 10, // frames
            color: 0xff5500, // orange-red
            intensity: 2.5,
            secondaryEffects: {
                debris: { count: 45, size: 1.2 },
                smoke: { volume: 2.0, duration: 1.8 },
                shockwave: true
            }
        }
    },
    [WEAPON_TYPES.RPG]: {
        innerRadius: 6,
        outerRadius: 15,
        innerDamage: 25,
        outerDamage: 8,
        falloff: 'EXPONENTIAL',
        explodesOnImpact: true, // Always explode on impact with vehicles
        visualEffect: {
            radius: 3,
            duration: 10,
            color: 0xff3300, // bright red-orange
            intensity: 0.7,
            secondaryEffects: {
                debris: { count: 35, size: 0.8 },
                smoke: { volume: 1.5, duration: 1.3 },
                shockwave: true,
                tracer: true
            }
        }
    },
    [WEAPON_TYPES.MORTAR]: {
        innerRadius: 10,
        outerRadius: 25,
        innerDamage: 20,
        outerDamage: 12,
        falloff: 'EXPONENTIAL',
        explodesOnImpact: true, // Always explode on impact with vehicles
        visualEffect: {
            radius: 3,
            duration: 10,
            color: 0x222222, // darker with smoke
            intensity: 1.4,
            secondaryEffects: {
                debris: { count: 60, size: 1.5 },
                smoke: { volume: 2.5, duration: 2.0 },
                shockwave: true,
                dustCloud: true
            }
        }
    },

    // Grenadier weapons
    [WEAPON_TYPES.DART]: {
        innerRadius: 5,
        outerRadius: 12,
        innerDamage: 22,
        outerDamage: 8,
        falloff: 'LINEAR',
        explodesOnImpact: true, // Always explode on impact with vehicles
        visualEffect: {
            radius: 2.0,
            duration: 20,
            color: 0x00ffff, // cyan
            intensity: 1.5,
            secondaryEffects: {
                debris: { count: 20, size: 0.5 },
                smoke: { volume: 1.0, duration: 1.0 },
                energyField: true
            }
        }
    },
    [WEAPON_TYPES.GRENADE]: {
        innerRadius: 10,
        outerRadius: 25,
        innerDamage: 30,
        outerDamage: 12,
        falloff: 'EXPONENTIAL',
        explodesOnImpact: true, // Always explode on impact with vehicles
        visualEffect: {
            radius: 2.5,
            duration: 35,
            color: 0xffaa00, // amber
            intensity: 2.5,
            secondaryEffects: {
                debris: { count: 50, size: 0.9 },
                smoke: { volume: 2.0, duration: 1.8 },
                shockwave: true,
                fragments: true
            }
        }
    },
    [WEAPON_TYPES.SHOTGUN]: {
        innerRadius: 4,
        outerRadius: 10,
        innerDamage: 18,
        outerDamage: 6,
        falloff: 'EXPONENTIAL',
        shape: 'CONE',
        coneAngle: Math.PI / 6, // 30 degrees cone
        explodesOnImpact: true, // Always explode on impact with vehicles
        visualEffect: {
            radius: 3,
            duration: 15,
            color: 0xffffaa, // yellowish flash
            intensity: 1.5,
            shape: 'CONE',
            coneAngle: Math.PI / 6,
            secondaryEffects: {
                debris: { count: 20, size: 0.3 },
                smoke: { volume: 0.8, duration: 0.6 },
                muzzleFlash: true
            }
        }
    },

    // Kamikaze drone weapon
    [WEAPON_TYPES.KAMIKAZE]: {
        innerRadius: 15, // 15m inner radius as specified
        outerRadius: 25, // 25m outer radius as specified
        innerDamage: 80, // Updated to 80 damage in inner radius
        outerDamage: 50, // Updated to 50 damage in outer radius
        falloff: 'EXPONENTIAL',
        explodesOnImpact: true, // Always explode on impact with vehicles
        visualEffect: {
            radius: 5, // Larger explosion radius
            duration: 15, // Longer duration
            color: 0xff0000, // Bright red explosion
            intensity: 3.0, // Higher intensity
            secondaryEffects: {
                debris: { count: 60, size: 1.5 },
                smoke: { volume: 2.5, duration: 2.0 },
                shockwave: true,
                fragments: true,
                dustCloud: true
            }
        }
    }
};

/**
 * Calculate damage based on distance from explosion center
 * @param {string} weaponType - The type of weapon 
 * @param {THREE.Vector3} explosionPosition - Position of the explosion
 * @param {THREE.Vector3} targetPosition - Position of the target
 * @returns {number} - The calculated damage amount
 */
export function calculateDamage(weaponType, explosionPosition, targetPosition) {
    const profile = DAMAGE_PROFILES[weaponType];
    if (!profile) return 0;

    // Calculate distance from explosion to target (using squared distance for performance)
    const dx = explosionPosition.x - targetPosition.x;
    const dy = explosionPosition.y - targetPosition.y;
    const dz = explosionPosition.z - targetPosition.z;
    const distanceSquared = dx * dx + dy * dy + dz * dz;

    // Special case for shotgun cone shape
    if (weaponType === WEAPON_TYPES.SHOTGUN && profile.shape === 'CONE') {
        // TODO: Implement cone detection when direction vector is provided
        // For now, continue with radius-based calculation
    }

    // No damage beyond outer radius (using squared distance for performance)
    const outerRadiusSquared = profile.outerRadius * profile.outerRadius;
    if (distanceSquared > outerRadiusSquared) return 0;

    // Full damage within inner radius
    const innerRadiusSquared = profile.innerRadius * profile.innerRadius;
    if (distanceSquared <= innerRadiusSquared) return profile.innerDamage;

    // Calculate actual distance for falloff calculation
    const distance = Math.sqrt(distanceSquared);

    // Calculate falloff based on specified type
    const ratio = (distance - profile.innerRadius) / (profile.outerRadius - profile.innerRadius);

    // Use lookup or precomputed values for common falloff types for better performance
    return profile.falloff === 'EXPONENTIAL'
        ? profile.innerDamage * Math.pow(1 - ratio, 2)  // Exponential falloff
        : profile.innerDamage - (ratio * (profile.innerDamage - profile.outerDamage)); // Linear falloff
}

/**
 * Apply explosion damage to all targets in range
 * @param {string} weaponType - The type of weapon
 * @param {THREE.Vector3} explosionPosition - Position of the explosion
 * @param {Array} targets - Array of target objects with position property
 */
export function applyExplosionDamage(weaponType, explosionPosition, targets) {
    // Get the applyDamage function from the vehicle health store
    const applyDamage = useVehicleHealthStore.getState().applyDamage;

    // Early return if no targets or invalid weaponType
    if (!targets || targets.length === 0 || !DAMAGE_PROFILES[weaponType]) {
        return;
    }

    // Get damage profile for quick reference
    const profile = DAMAGE_PROFILES[weaponType];
    const outerRadiusSquared = profile.outerRadius * profile.outerRadius;

    // Performance optimization: Filter targets by distance first
    // This avoids processing targets that are definitely out of range
    const potentialTargets = targets.filter(target => {
        if (!target || !target.position) return false;

        // Quick distance squared check
        const dx = explosionPosition.x - target.position.x;
        const dy = explosionPosition.y - target.position.y;
        const dz = explosionPosition.z - target.position.z;
        const distanceSquared = dx * dx + dy * dy + dz * dz;

        // Only include targets within outer radius
        return distanceSquared <= outerRadiusSquared * 1.1; // Small buffer for safety
    });

    // If no targets in range, return early
    if (potentialTargets.length === 0) {
        return;
    }

    // Process targets in batches to avoid blocking the main thread
    const processBatch = (startIndex, batchSize) => {
        const endIndex = Math.min(startIndex + batchSize, potentialTargets.length);

        for (let i = startIndex; i < endIndex; i++) {
            const target = potentialTargets[i];

            // For vehicle targets with userData containing vehicleId
            if (target.userData && target.userData.vehicleId) {
                processVehicleTarget(target, weaponType, explosionPosition, applyDamage);
            }
            // For legacy targets with takeDamage method
            else if (typeof target.takeDamage === 'function') {
                const damage = calculateDamage(weaponType, explosionPosition, target.position);
                if (damage > 0) {
                    target.takeDamage(damage);
                }
            }
        }

        // Process next batch if there are more targets
        if (endIndex < potentialTargets.length) {
            setTimeout(() => {
                processBatch(endIndex, batchSize);
            }, 0);
        }
    };

    // Start processing targets in batches of 10 (reduced from 20 for smoother frames)
    processBatch(0, 10);
}

/**
 * Process a vehicle target for damage calculation and application
 * @private
 */
function processVehicleTarget(target, weaponType, explosionPosition, applyDamage) {
    // Check for direct hit and hit location
    const hit = checkVehicleHit(explosionPosition, {
        position: target.position,
        rotation: target.rotation,
        type: target.userData.vehicleType || 'car_a' // Default if not specified
    });

    // Calculate damage
    const damage = calculateDamage(weaponType, explosionPosition, target.position);

    if (damage <= 0) {
        return;
    }

    if (hit) {
        // Direct hit - apply damage with hit location info
        applyDamage(target.userData.vehicleId, damage, hit.location, weaponType);
    } else {
        // Explosion radius damage - apply general damage to the body
        applyDamage(target.userData.vehicleId, damage, 'body', weaponType);
    }
}

/**
 * Create explosion effect
 * @param {string} weaponType - The type of weapon
 * @param {THREE.Vector3} position - Position of explosion
 * @returns {Object} - Data needed to render explosion effect
 */
export function createExplosionEffect(weaponType, position) {
    // Performance optimization for low FPS situations
    // If lots of explosions are happening, downgrade the visual quality
    const fpsAdjustment = window.performance && window.performance.now ?
        Math.min(1.0, 60 / (window.currentFps || 60)) : 1.0;

    const profile = DAMAGE_PROFILES[weaponType];

    // Early return with minimal data for shotgun (handled separately)
    if (weaponType === WEAPON_TYPES.SHOTGUN) {
        // Further reduce shotgun visual effects when FPS is below threshold
        const shotgunFpsThreshold = 45; // Higher threshold specifically for shotgun effects
        const shotgunSpecificAdjustment = window.currentFps < shotgunFpsThreshold ?
            Math.min(0.6, 60 / (window.currentFps || 60)) : 1.0;

        return {
            position: position.clone(),
            radius: profile.outerRadius / 3 * shotgunSpecificAdjustment,
            duration: 1,
            type: weaponType,
            startTime: Date.now()
        };
    }

    const visual = profile.visualEffect;

    // Scale down particle counts and visual effects based on current FPS
    const debrisCount = Math.floor((visual.secondaryEffects.debris?.count || 0) * fpsAdjustment);
    const smokeVolume = (visual.secondaryEffects.smoke?.volume || 0) * fpsAdjustment;

    // Create standardized explosion data structure with adjusted values
    return {
        position: position.clone(),
        radius: visual.radius * fpsAdjustment,  // Smaller radius when FPS is low
        duration: visual.duration,
        color: visual.color,
        intensity: visual.intensity * fpsAdjustment,  // Lower intensity when FPS is low

        // Shape details (cone or sphere)
        shape: visual.shape || 'SPHERE',
        coneAngle: visual.coneAngle,

        // Process secondary effects with the new structure and FPS adjustment
        secondaryEffects: {
            // Debris settings - reduce count when FPS is low
            debris: {
                count: debrisCount,
                size: visual.secondaryEffects.debris?.size || 0
            },

            // Smoke settings - reduce volume when FPS is low
            smoke: {
                volume: smokeVolume,
                duration: visual.secondaryEffects.smoke?.duration || 0
            },

            // Boolean flags for special effects
            shockwave: visual.secondaryEffects.shockwave && fpsAdjustment > 0.7,
            dustCloud: visual.secondaryEffects.dustCloud && fpsAdjustment > 0.7,
            energyField: visual.secondaryEffects.energyField && fpsAdjustment > 0.8,
            fragments: visual.secondaryEffects.fragments && fpsAdjustment > 0.7,
            muzzleFlash: visual.secondaryEffects.muzzleFlash,
            tracer: visual.secondaryEffects.tracer
        },

        // Metadata
        type: weaponType,
        startTime: Date.now(),
        quality: fpsAdjustment  // Store quality level for renderer reference
    };
}

/**
 * Convert weapon type string to readable name
 * @param {string} weaponType - The internal weapon type constant
 * @returns {string} - Human readable weapon name
 */
export function getWeaponName(weaponType) {
    switch (weaponType) {
        case WEAPON_TYPES.ANTI_TANK_MINE: return 'Anti-Tank Mine';
        case WEAPON_TYPES.RPG: return 'RPG';
        case WEAPON_TYPES.MORTAR: return 'Mortar';
        case WEAPON_TYPES.DART: return 'Dart';
        case WEAPON_TYPES.GRENADE: return 'Grenade';
        case WEAPON_TYPES.SHOTGUN: return 'Shotgun';
        case WEAPON_TYPES.KAMIKAZE: return 'Kamikaze';
        default: return 'Unknown Weapon';
    }
}

/**
 * Create vehicle hitbox for collision testing
 * @param {Object} vehicle - The vehicle object with position, rotation, and hitbox properties
 * @returns {THREE.Box3} - Axis-aligned bounding box for the vehicle
 */
function createVehicleHitbox(vehicle) {
    // Default hitbox dimensions if not specified
    const dimensions = vehicle.hitbox || {
        width: 1.33,  // Width (left/right)
        height: 1.33, // Height (up/down)
        depth: 4.0   // Depth (front/back)
    };

    // Create a box with the correct dimensions
    const halfWidth = dimensions.width / 2;
    const halfHeight = dimensions.height / 2;
    const halfDepth = dimensions.depth / 2;

    // Create the box based on vehicle's rotation
    const rotation = vehicle.rotation.y || 0;

    // For vehicles oriented along X axis vs Z axis
    const isAlongX = Math.abs(Math.sin(rotation)) > 0.7;

    // Determine the correct dimensions based on vehicle rotation
    const xExtent = isAlongX ? halfDepth : halfWidth;
    const zExtent = isAlongX ? halfWidth : halfDepth;

    // Create min and max points for the box
    const min = new THREE.Vector3(
        vehicle.position.x - xExtent,
        vehicle.position.y,
        vehicle.position.z - zExtent
    );

    const max = new THREE.Vector3(
        vehicle.position.x + xExtent,
        vehicle.position.y + dimensions.height,
        vehicle.position.z + zExtent
    );

    // Create and return the box
    return new THREE.Box3(min, max);
}

/**
 * Test if a line segment intersects with a box
 * @param {THREE.Line3} line - Line segment to test
 * @param {THREE.Box3} box - Box to test against
 * @returns {boolean} - True if the line intersects the box
 */
function lineBoxIntersection(line, box) {
    // Simple point in box test first (for either endpoint)
    if (box.containsPoint(line.start) || box.containsPoint(line.end)) {
        return true;
    }

    // Use a ray approach with the line direction and length
    const direction = new THREE.Vector3().subVectors(line.end, line.start).normalize();
    const length = line.start.distanceTo(line.end);

    // Create a ray from the line start in the direction of the line
    const ray = new THREE.Ray(line.start, direction);

    // Find intersection with box
    const result = new THREE.Vector3();
    if (ray.intersectBox(box, result)) {
        // Check if intersection point is within the line segment length
        const distToIntersection = line.start.distanceTo(result);
        return distToIntersection <= length;
    }

    return false;
}

/**
 * Check if a projectile has collided with a vehicle using raycasting for more accurate detection
 * @param {Object} projectile - The projectile object with position and previousPosition properties
 * @param {THREE.Scene} scene - The scene to check for vehicle objects
 * @returns {Object|null} - The hit result with vehicle and position, or null if no collision
 */
export function checkProjectileVehicleCollision(projectile, scene) {
    if (!projectile || !projectile.position || !scene) return null;

    // If there's no previous position, just use the current position (first frame)
    if (!projectile.previousPosition) {
        projectile.previousPosition = projectile.position.clone();
        return null;
    }

    // Start with a simple point-based collision check first (faster)
    // This helps catch cases where a projectile might be inside a vehicle
    const simpleCheckResult = checkSimpleVehicleCollision(projectile.position, scene);
    if (simpleCheckResult) {
        return simpleCheckResult;
    }

    // If simple check failed, use the more sophisticated raycasting approach
    const direction = new THREE.Vector3().subVectors(
        projectile.position,
        projectile.previousPosition
    ).normalize();

    const rayLength = projectile.previousPosition.distanceTo(projectile.position);

    // Simple spatial partitioning - only check vehicles within a reasonable distance
    const searchRadius = Math.max(rayLength, 5.0);
    const searchCenter = new THREE.Vector3().copy(projectile.position).add(
        projectile.previousPosition).multiplyScalar(0.5);

    // Create a raycaster with optimized settings for performance
    const raycaster = new THREE.Raycaster(projectile.previousPosition, direction, 0, rayLength * 1.1);
    raycaster.params.Line.threshold = 0.2;
    raycaster.params.Points.threshold = 0.2;

    // Function to collect only nearby vehicles for more efficient collision testing
    const collectNearbyVehicles = (object, objects = []) => {
        // Skip if the object is not visible or doesn't have userData
        if (!object.visible || !object.userData) return objects;

        // Quick distance check for early rejection
        if (object.position) {
            const distSquared = object.position.distanceToSquared(searchCenter);
            if (distSquared > searchRadius * searchRadius * 1.5) {
                return objects; // Skip objects too far away
            }
        }

        // If this has vehicle data, include it
        if (object.userData.vehicleId || object.userData.isVehiclePart ||
            (object.userData.type && object.name && (
                object.name.includes('vehicle') ||
                object.name.includes('car') ||
                object.name.includes('truck') ||
                object.name.includes('tank')
            ))
        ) {
            objects.push(object);
        }

        // Process children recursively (but only for objects that could be close enough)
        if (object.children && object.children.length > 0) {
            for (let child of object.children) {
                collectNearbyVehicles(child, objects);
            }
        }

        return objects;
    };

    // Collect potentially nearby vehicle objects
    const nearbyVehicles = [];
    scene.children.forEach(child => {
        collectNearbyVehicles(child, nearbyVehicles);
    });

    // If no nearby vehicles, return early
    if (nearbyVehicles.length === 0) return null;

    // Try simple box-based check first (much faster)
    for (const object of nearbyVehicles) {
        if (!object.userData.vehicleId && !object.userData.isVehicle) continue;

        const vehicleObject = {
            position: object.position,
            rotation: object.rotation,
            hitbox: object.userData.hitbox
        };

        const hitbox = createVehicleHitbox(vehicleObject);

        // Check line intersection
        const line = new THREE.Line3(projectile.previousPosition, projectile.position);

        if (lineBoxIntersection(line, hitbox) || hitbox.containsPoint(projectile.position)) {
            return {
                vehicle: object,
                position: projectile.position.clone(),
                hitLocation: 'body'
            };
        }
    }

    // If box test failed, try full raycasting against all nearby vehicles
    const intersects = raycaster.intersectObjects(nearbyVehicles, true);

    if (intersects.length === 0) return null;

    // Get the closest intersection
    const closestIntersection = intersects[0];
    const hitObject = closestIntersection.object;
    const hitPoint = closestIntersection.point;

    // Find the vehicle this part belongs to
    let vehicleObject = hitObject;
    let hitLocation = 'body';
    let parent = hitObject;

    while (parent && !parent.userData.vehicleId) {
        if (parent.userData.isVehiclePart && parent.userData.partType) {
            hitLocation = parent.userData.partType;
        }
        parent = parent.parent;
        if (parent && parent.userData.vehicleId) {
            vehicleObject = parent;
        }
    }

    if (hitObject.userData.vehicleId) {
        vehicleObject = hitObject;
    }

    if (hitObject.userData.isVehiclePart && hitObject.userData.partType) {
        hitLocation = hitObject.userData.partType;
    }

    const vehicleId = vehicleObject.userData.vehicleId;
    const vehicleType = vehicleObject.userData.vehicleType || 'car_a';

    if (!vehicleId) return null;

    return {
        vehicle: vehicleObject,
        position: hitPoint,
        hitLocation: hitLocation
    };
}

/**
 * Simple point-based collision check with vehicles
 * This is a faster first-pass check
 */
function checkSimpleVehicleCollision(position, scene) {
    const collectVehiclesAtPoint = (object, results = []) => {
        if (!object.visible || !object.userData) return results;

        // Check if object is a vehicle or part
        if (object.userData.vehicleId || object.userData.isVehiclePart) {
            // Create a simple bounding box for the object
            const box = new THREE.Box3().setFromObject(object);

            // Check if position is inside the box
            if (box.containsPoint(position)) {
                let hitLocation = 'body';
                let vehicleObject = object;

                // Handle parts
                if (object.userData.isVehiclePart && object.userData.partType) {
                    hitLocation = object.userData.partType;
                    // Find parent vehicle
                    let parent = object.parent;
                    while (parent && !parent.userData.vehicleId) {
                        parent = parent.parent;
                    }
                    if (parent) vehicleObject = parent;
                }

                results.push({
                    vehicle: vehicleObject,
                    position: position.clone(),
                    hitLocation: hitLocation
                });
            }
        }

        // Check children recursively
        if (object.children && object.children.length > 0) {
            for (let child of object.children) {
                collectVehiclesAtPoint(child, results);
            }
        }

        return results;
    };

    const hitVehicles = [];
    scene.children.forEach(child => {
        collectVehiclesAtPoint(child, hitVehicles);
    });

    return hitVehicles.length > 0 ? hitVehicles[0] : null;
} 