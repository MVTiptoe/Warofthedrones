import React, { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VehicleTypes } from './vehicles';
import { EnhancedVehicleTypes } from './vehicles/enhancedVehicles';
import { ROAD_WIDTH, ROAD_SPACING, TOTAL_ROAD_WIDTH, ROAD_EXTENSION } from './Road';
import { TERRAIN_SIZE } from './Terrain';
import { useVehicleHealthStore } from '../utils/VehicleHealthSystem';

// Vehicle movement speed in units per second
const SPEED_MIN = 0.18;
const SPEED_MAX = 0.25;

// Number of vehicles to spawn per road
const VEHICLES_PER_ROAD = 11; // Reduced by ~30% from 16

// Lane widths - now with 4 lanes per road
const LANE_WIDTH = ROAD_WIDTH / 4; // Each road has 4 lanes now

// Define lane types
const LANE_TYPES = {
    FAST: 'fast',    // Left lane (for military columns)
    SLOW: 'slow'     // Right lane (for civilian vehicles)
};

// Vehicle dimensions (approximate average)
const VEHICLE_LENGTH = 16; // Updated for 4x scale (was 12 for 3x scale)
const MINIMUM_DISTANCE = 40; // Minimum required distance between vehicles (40 meters)
const COLUMN_VEHICLE_SPACING = 30; // Increased by 50% from 20 to 30 meters distance between vehicles in a column
const SAFE_DISTANCE = Math.max(VEHICLE_LENGTH * 1.5, MINIMUM_DISTANCE); // Safe following distance, at least 40m

// Collision avoidance
const DETECTION_DISTANCE = SAFE_DISTANCE * 1; // Distance to start slowing down (80m)
const EMERGENCY_DISTANCE = SAFE_DISTANCE * 0.6; // Distance for emergency stop (32m)

// Delay after vehicle destruction before column resumes movement
const DESTROYED_VEHICLE_WAIT_PERIOD = 5000; // 5 seconds (5000ms)

// Military column definitions
const MILITARY_COLUMNS = [
    // Combo 1: 3 tanks, 2 IFVs, 1 military truck
    {
        id: 'combo1',
        vehicles: [
            { type: 'tank', count: 3 },
            { type: 'ifv', count: 2 },
            { type: 'military_truck', count: 1 }
        ]
    },
    // Combo 2: 1 tank, 3 IFVs, 2 military trucks
    {
        id: 'combo2',
        vehicles: [
            { type: 'tank', count: 1 },
            { type: 'ifv', count: 3 },
            { type: 'military_truck', count: 2 }
        ]
    },
    // Combo 3: 2 tanks, 2 IFVs, 2 military trucks
    {
        id: 'combo3',
        vehicles: [
            { type: 'tank', count: 2 },
            { type: 'ifv', count: 2 },
            { type: 'military_truck', count: 2 }
        ]
    },
    // Combo 4: 1 tank, 4 IFVs, 1 military truck
    {
        id: 'combo4',
        vehicles: [
            { type: 'tank', count: 1 },
            { type: 'ifv', count: 4 },
            { type: 'military_truck', count: 1 }
        ]
    }
];

// Define constants to track and manage column spawning
const MAX_COLUMNS_PER_LANE = 1; // Maximum number of active columns per lane
const COLUMN_RESPAWN_DELAY = 5000; // 5 seconds delay before respawning a new column

// Function to get random item from array
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Function to get a random vehicle of the specified type
function getRandomVehicleOfType(type) {
    const vehicleKeys = Object.keys(VehicleTypes);
    let matchingVehicles = [];

    if (type === 'tank') {
        matchingVehicles = vehicleKeys.filter(key => key.includes('tank_'));
    } else if (type === 'ifv') {
        matchingVehicles = vehicleKeys.filter(key => key.includes('ifv_'));
    } else if (type === 'military_truck') {
        matchingVehicles = vehicleKeys.filter(key => key.includes('military_truck_'));
    } else if (type === 'car') {
        matchingVehicles = vehicleKeys.filter(key => key.includes('car_'));
    } else if (type === 'civilian_truck') {
        matchingVehicles = vehicleKeys.filter(key => key.includes('civilian_truck_'));
    }

    return matchingVehicles.length > 0 ? getRandomItem(matchingVehicles) : null;
}

export default function VehiclesOnRoad() {
    const [vehicles, setVehicles] = useState([]);
    const initializedRef = useRef(false);
    const columnSpawnTimersRef = useRef({}); // Track spawn timers for each lane

    // Access vehicle health store for mobility factor and health data
    const vehicleHealthStore = useVehicleHealthStore();
    const getVehicleHealth = vehicleHealthStore.getVehicleHealth;

    // Initialize vehicles
    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        const newVehicles = [];

        // For each road (upper and lower)
        [-ROAD_SPACING / 2, ROAD_SPACING / 2].forEach(roadZ => {
            // Define all 4 lanes for this road
            const lanes = [
                // Left side lanes (vehicles move in negative X direction)
                {
                    z: roadZ - (ROAD_WIDTH * 3 / 8), // First lane center (outer left)
                    direction: -1,
                    type: LANE_TYPES.FAST
                },
                {
                    z: roadZ - (ROAD_WIDTH * 1 / 8), // Second lane center (inner left)
                    direction: -1,
                    type: LANE_TYPES.SLOW
                },
                // Right side lanes (vehicles move in positive X direction)
                {
                    z: roadZ + (ROAD_WIDTH * 1 / 8), // Third lane center (inner right)
                    direction: 1,
                    type: LANE_TYPES.SLOW
                },
                {
                    z: roadZ + (ROAD_WIDTH * 3 / 8), // Fourth lane center (outer right)
                    direction: 1,
                    type: LANE_TYPES.FAST
                }
            ];

            // Group lanes by direction and type
            const fastLanes = lanes.filter(lane => lane.type === LANE_TYPES.FAST);
            const slowLanes = lanes.filter(lane => lane.type === LANE_TYPES.SLOW);

            // Create military columns on fast lanes (one per direction)
            fastLanes.forEach(lane => {
                // Choose a random column configuration
                const columnConfig = getRandomItem(MILITARY_COLUMNS);
                const columnId = `column-${roadZ}-${lane.z}`;

                // Starting position for the column
                const startingX = lane.direction > 0 ?
                    -TERRAIN_SIZE / 2 + 100 : // For positive direction, start near the beginning
                    TERRAIN_SIZE / 2 - 100;  // For negative direction, start near the end

                let currentX = startingX;
                let vehicleIndex = 0;

                // Create all vehicles for this column
                for (const vehicleGroup of columnConfig.vehicles) {
                    for (let i = 0; i < vehicleGroup.count; i++) {
                        const vehicleType = getRandomVehicleOfType(vehicleGroup.type);
                        if (!vehicleType) continue;

                        const vehicleId = `${columnId}-${vehicleGroup.type}-${i}`;

                        newVehicles.push({
                            id: vehicleId,
                            type: vehicleType,
                            columnId: columnId,
                            columnPosition: vehicleIndex,
                            position: new THREE.Vector3(
                                currentX,
                                0.3,
                                lane.z + (Math.random() * 0.2 - 0.1)
                            ),
                            rotation: new THREE.Euler(
                                0,
                                lane.direction > 0 ? -Math.PI / 2 : Math.PI / 2,
                                0
                            ),
                            speed: SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN) * 0.5,
                            direction: lane.direction,
                            lane: lane.z,
                            road: roadZ,
                            laneType: lane.type,
                            isInColumn: true,
                            hitbox: { width: 1.33, height: 1.33, depth: 4.0 }
                        });

                        // Move to next vehicle position (subtract for negative direction)
                        currentX += lane.direction * COLUMN_VEHICLE_SPACING;
                        vehicleIndex++;
                    }
                }
            });

            // Create civilian vehicles on slow lanes
            slowLanes.forEach(lane => {
                const vehiclesPerLane = VEHICLES_PER_ROAD / 2; // Split evenly between slow lanes

                for (let i = 0; i < vehiclesPerLane; i++) {
                    // Randomly choose between car and civilian truck (adjusted ratio)
                    const vehicleType = Math.random() < 0.7 ?
                        getRandomVehicleOfType('car') :
                        getRandomVehicleOfType('civilian_truck');

                    if (!vehicleType) continue;

                    // Calculate position with good spacing along the road
                    const segmentLength = TERRAIN_SIZE / vehiclesPerLane;
                    const minSegmentLength = MINIMUM_DISTANCE * 1.5;
                    const effectiveSegmentLength = Math.max(segmentLength, minSegmentLength);

                    const segmentStart = -TERRAIN_SIZE / 2 + (i * effectiveSegmentLength);
                    const xPos = segmentStart + Math.random() * (effectiveSegmentLength * 0.6);

                    const vehicleId = `vehicle-${roadZ}-${lane.z}-${i}`;

                    newVehicles.push({
                        id: vehicleId,
                        type: vehicleType,
                        position: new THREE.Vector3(
                            lane.direction > 0 ? xPos : -xPos,
                            0.3,
                            lane.z + (Math.random() * 0.2 - 0.1)
                        ),
                        rotation: new THREE.Euler(
                            0,
                            lane.direction > 0 ? -Math.PI / 2 : Math.PI / 2,
                            0
                        ),
                        speed: SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN),
                        direction: lane.direction,
                        lane: lane.z,
                        road: roadZ,
                        laneType: lane.type,
                        isInColumn: false,
                        hitbox: { width: 1.0, height: 1.0, depth: 3.0 }
                    });
                }
            });
        });

        setVehicles(newVehicles);
    }, []);

    // Update vehicle positions on each frame
    useFrame((state, delta) => {
        setVehicles(vehicles => {
            // Track the positions where destroyed vehicles were removed
            const removedDestroyedPositions = new Map(); // Map<lane, {x, road, direction, removalTime}>

            // First, check if any column is fully destroyed (all vehicles destroyed)
            const activeColumns = new Set();
            const columnsToRespawn = new Set();
            const destroyedVehicles = new Map(); // Track destroyed vehicles by ID
            const clearedDestroyedPositions = new Map(); // Track positions where a destroyed vehicle was removed and cleared
            const newlyDestroyedColumns = new Map(); // Track columns with newly destroyed vehicles

            // Gather active column IDs and mark destroyed vehicles
            vehicles.forEach(vehicle => {
                if (vehicle.isInColumn && vehicle.columnId) {
                    activeColumns.add(vehicle.columnId);

                    // Check if this vehicle is destroyed
                    const healthData = getVehicleHealth(vehicle.id);
                    if (healthData && healthData.isDead) {
                        destroyedVehicles.set(vehicle.id, vehicle);

                        // Mark this column as having a destroyed vehicle
                        if (!vehicle.hasNotifiedColumn) {
                            newlyDestroyedColumns.set(vehicle.columnId, Date.now());
                        }

                        // If vehicle is destroyed but not yet marked for clearing, mark it with a clearing time
                        if (!vehicle.clearingStarted) {
                            setTimeout(() => {
                                setVehicles(prevVehicles => {
                                    // Get current time to use consistently for all updates
                                    const currentTime = Date.now();

                                    // Find all vehicles in the same column
                                    const columnId = vehicle.columnId;

                                    return prevVehicles.map(v => {
                                        if (v.id === vehicle.id) {
                                            // This is the destroyed vehicle
                                            return {
                                                ...v,
                                                clearingStarted: true,
                                                clearingTime: currentTime,
                                                hasNotifiedColumn: true
                                            };
                                        }
                                        else if (v.columnId === columnId) {
                                            // This is another vehicle in the same column
                                            return {
                                                ...v,
                                                columnHasDestroyed: true,
                                                lastDestroyedTime: currentTime
                                            };
                                        }
                                        return v;
                                    });
                                });
                            }, 0);
                        }

                        // Mark it for removal after a delay if not already marked and vehicle is fully destroyed
                        if (!vehicle.markedForRemoval && vehicle.clearingStarted && healthData.isDestroyed) {
                            setTimeout(() => {
                                setVehicles(prevVehicles => {
                                    return prevVehicles.map(v => {
                                        if (v.id === vehicle.id) {
                                            return {
                                                ...v,
                                                markedForRemoval: true
                                            };
                                        }
                                        return v;
                                    });
                                });
                            }, DESTROYED_VEHICLE_WAIT_PERIOD); // 5 second delay before removing destroyed vehicles
                        }
                    }
                }
            });

            // First, remove any destroyed column vehicles that have been marked for removal
            const filteredVehicles = vehicles.filter(vehicle => {
                if (vehicle.isInColumn) {
                    const healthData = getVehicleHealth(vehicle.id);
                    // Remove if it's destroyed AND marked for removal
                    if (healthData && healthData.isDead && healthData.isDestroyed && vehicle.markedForRemoval) {
                        // When removing the vehicle, add its position to the cleared positions map with a timestamp
                        // This information will be used by vehicles behind it
                        const laneKey = `${vehicle.columnId}-${vehicle.columnPosition}`;
                        clearedDestroyedPositions.set(laneKey, {
                            x: vehicle.position.x,
                            lane: vehicle.lane,
                            road: vehicle.road,
                            columnId: vehicle.columnId,
                            columnPosition: vehicle.columnPosition,
                            direction: vehicle.direction,
                            clearingTime: Date.now() // Use current time when actually removed, not previous clearing time
                        });

                        // Notify all other vehicles in the column that a vehicle has been completely removed
                        // This will trigger the column to move forward and close the gap
                        setTimeout(() => {
                            setVehicles(prevVehicles => {
                                return prevVehicles.map(v => {
                                    if (v.columnId === vehicle.columnId) {
                                        return {
                                            ...v,
                                            columnHasRemoval: true,
                                            lastRemovalTime: Date.now()
                                        };
                                    }
                                    return v;
                                });
                            });
                        }, 0);

                        return false;
                    }
                }
                // Keep all other vehicles
                return true;
            });

            // Then continue with the regular update process
            // Group vehicles by columns for synchronized movement
            const columnMap = new Map();
            filteredVehicles.forEach(vehicle => {
                if (vehicle.isInColumn && vehicle.columnId) {
                    if (!columnMap.has(vehicle.columnId)) {
                        columnMap.set(vehicle.columnId, []);
                    }
                    columnMap.get(vehicle.columnId).push(vehicle);
                }
            });

            // First update individual vehicles (non-column vehicles)
            const updatedVehicles = filteredVehicles.map(vehicle => {
                // Skip column vehicles as they'll be updated together
                if (vehicle.isInColumn) return vehicle;

                // Get the vehicle's health data to adjust mobility
                const healthData = getVehicleHealth(vehicle.id);

                // If vehicle is dead, don't update its position
                if (healthData && healthData.isDead) {
                    return vehicle;
                }

                // Apply mobility factor from health system (if available)
                const mobilityFactor = healthData ? healthData.mobilityFactor : 1.0;

                // Store original speed for reference
                const originalSpeed = vehicle.speed * mobilityFactor;

                // Check for vehicles ahead with the new distances
                const hasCollisionEmergency = detectCollisionAhead(vehicle, filteredVehicles, EMERGENCY_DISTANCE);
                const hasMinimumDistance = detectCollisionAhead(vehicle, filteredVehicles, MINIMUM_DISTANCE);
                const hasCollisionWarning = detectCollisionAhead(vehicle, filteredVehicles, DETECTION_DISTANCE);

                // Determine appropriate speed
                let speed = originalSpeed;

                if (hasCollisionEmergency) {
                    // Emergency stop - too close
                    speed = 0;
                } else if (hasMinimumDistance) {
                    // Strong slowing down when below minimum distance
                    const distanceFactor = (vehicle.distanceToNext - EMERGENCY_DISTANCE) /
                        (MINIMUM_DISTANCE - EMERGENCY_DISTANCE);
                    speed = originalSpeed * Math.max(0.05, distanceFactor * 0.1);
                } else if (hasCollisionWarning) {
                    // Gradual slow down based on distance
                    const distanceFactor = (vehicle.distanceToNext - MINIMUM_DISTANCE) /
                        (DETECTION_DISTANCE - MINIMUM_DISTANCE);
                    speed = originalSpeed * Math.max(0.3, distanceFactor);
                }

                // Calculate the new position with smoother acceleration/deceleration
                const speedChange = Math.min(Math.abs(speed - vehicle.speed), 0.01); // Limit speed change per frame
                const newSpeed = speed > vehicle.speed
                    ? vehicle.speed + speedChange
                    : vehicle.speed - speedChange;

                const newX = vehicle.position.x + (newSpeed * vehicle.direction * delta * 60);

                // Check if vehicle has reached the end of the road
                if (vehicle.direction > 0 && newX > TERRAIN_SIZE / 2) {
                    // Reset to the beginning of the road (right direction vehicles)
                    return {
                        ...vehicle,
                        position: new THREE.Vector3(
                            -TERRAIN_SIZE / 2,
                            0.3,
                            vehicle.position.z
                        ),
                        speed: vehicle.speed
                    };
                } else if (vehicle.direction < 0 && newX < -TERRAIN_SIZE / 2) {
                    // Reset to the beginning of the road (left direction vehicles)
                    return {
                        ...vehicle,
                        position: new THREE.Vector3(
                            TERRAIN_SIZE / 2,
                            0.3,
                            vehicle.position.z
                        ),
                        speed: vehicle.speed
                    };
                }

                // Update position and speed
                return {
                    ...vehicle,
                    position: new THREE.Vector3(newX, vehicle.position.y, vehicle.position.z),
                    speed: newSpeed
                };
            });

            // Now update column vehicles together
            columnMap.forEach((columnVehicles, columnId) => {
                // Sort by column position
                columnVehicles.sort((a, b) => a.columnPosition - b.columnPosition);

                if (columnVehicles.length === 0) return;

                // Find the first non-destroyed vehicle to act as the lead
                let leadVehicleIndex = 0;
                let leadVehicle = columnVehicles[leadVehicleIndex];
                let leadVehicleHealth = getVehicleHealth(leadVehicle.id);

                // If the first vehicle is destroyed, find the next available vehicle to lead
                while (leadVehicleIndex < columnVehicles.length - 1 &&
                    leadVehicleHealth && leadVehicleHealth.isDead) {
                    leadVehicleIndex++;
                    leadVehicle = columnVehicles[leadVehicleIndex];
                    leadVehicleHealth = getVehicleHealth(leadVehicle.id);
                }

                // If all vehicles are destroyed, the column can't move
                if (leadVehicleHealth && leadVehicleHealth.isDead) {
                    // Find the next non-destroyed vehicle to be the new lead
                    // Instead of stopping the column, look for another vehicle to lead
                    let newLeadFound = false;
                    let newLeadVehicleIndex = -1;

                    // Try to find any non-destroyed vehicle to be the new lead
                    for (let i = 0; i < columnVehicles.length; i++) {
                        const potentialLeadHealth = getVehicleHealth(columnVehicles[i].id);
                        if (!(potentialLeadHealth && potentialLeadHealth.isDead)) {
                            newLeadVehicleIndex = i;
                            newLeadFound = true;
                            break;
                        }
                    }

                    if (newLeadFound) {
                        // Update lead vehicle to the newly found non-destroyed vehicle
                        leadVehicleIndex = newLeadVehicleIndex;
                        leadVehicle = columnVehicles[leadVehicleIndex];
                        leadVehicleHealth = getVehicleHealth(leadVehicle.id);
                    } else {
                        // Only return (stop processing) if no non-destroyed vehicles found
                        return;
                    }
                }

                // Create a new array with column vehicles, omitting destroyed ones at the front
                // We'll use this to calculate positions to avoid gaps created by destroyed lead vehicles
                const activeColumnVehicles = columnVehicles.filter((vehicle, idx) => {
                    if (idx < leadVehicleIndex) {
                        // Skip destroyed vehicles at the front
                        return false;
                    }
                    const health = getVehicleHealth(vehicle.id);
                    return !(health && health.isDead);
                });

                // Reassign positions based on the new active column (no destroyed vehicles)
                activeColumnVehicles.forEach((vehicle, idx) => {
                    vehicle.effectiveColumnPosition = idx;
                });

                // Apply the same logic as for individual vehicles to the lead vehicle
                const healthData = getVehicleHealth(leadVehicle.id);
                const mobilityFactor = healthData ? healthData.mobilityFactor : 1.0;
                const originalSpeed = leadVehicle.speed * mobilityFactor;

                // Check for vehicles ahead
                const hasCollisionEmergency = detectCollisionAhead(leadVehicle, updatedVehicles, EMERGENCY_DISTANCE);
                const hasMinimumDistance = detectCollisionAhead(leadVehicle, updatedVehicles, MINIMUM_DISTANCE);
                const hasCollisionWarning = detectCollisionAhead(leadVehicle, updatedVehicles, DETECTION_DISTANCE);

                // Determine appropriate speed for the lead vehicle
                let speed = originalSpeed;

                if (hasCollisionEmergency) {
                    speed = 0;
                } else if (hasMinimumDistance) {
                    const distanceFactor = (leadVehicle.distanceToNext - EMERGENCY_DISTANCE) /
                        (MINIMUM_DISTANCE - EMERGENCY_DISTANCE);
                    speed = originalSpeed * Math.max(0.05, distanceFactor * 0.1);
                } else if (hasCollisionWarning) {
                    const distanceFactor = (leadVehicle.distanceToNext - MINIMUM_DISTANCE) /
                        (DETECTION_DISTANCE - MINIMUM_DISTANCE);
                    speed = originalSpeed * Math.max(0.3, distanceFactor);
                }

                // Calculate the new position with smoother acceleration/deceleration
                const speedChange = Math.min(Math.abs(speed - leadVehicle.speed), 0.01);
                const newSpeed = speed > leadVehicle.speed
                    ? leadVehicle.speed + speedChange
                    : leadVehicle.speed - speedChange;

                // Move the lead vehicle
                const newLeadX = leadVehicle.position.x + (newSpeed * leadVehicle.direction * delta * 60);

                // Check if column has reached the end of the road
                if (leadVehicle.direction > 0 && newLeadX > TERRAIN_SIZE / 2 ||
                    leadVehicle.direction < 0 && newLeadX < -TERRAIN_SIZE / 2) {

                    // Remove the column from the scene by marking all vehicles for removal
                    columnVehicles.forEach((vehicle) => {
                        const updatedVehicleIndex = updatedVehicles.findIndex(v => v.id === vehicle.id);
                        if (updatedVehicleIndex !== -1) {
                            // Mark the vehicle for removal by setting a flag
                            updatedVehicles[updatedVehicleIndex] = {
                                ...vehicle,
                                isRemoved: true
                            };
                        }
                    });

                    // Schedule a new column to spawn
                    scheduleColumnRespawn(leadVehicle.lane, leadVehicle.direction);
                } else {
                    // Move each vehicle in the column
                    columnVehicles.forEach((vehicle, index) => {
                        const updatedVehicleIndex = updatedVehicles.findIndex(v => v.id === vehicle.id);
                        if (updatedVehicleIndex !== -1) {
                            // Skip moving destroyed vehicles
                            const vehicleHealth = getVehicleHealth(vehicle.id);
                            if (vehicleHealth && vehicleHealth.isDead) {
                                return;
                            }

                            // Lead vehicle (which may not be the first in the column if the first was destroyed)
                            if (index === leadVehicleIndex) {
                                updatedVehicles[updatedVehicleIndex] = {
                                    ...vehicle,
                                    position: new THREE.Vector3(
                                        newLeadX,
                                        vehicle.position.y,
                                        vehicle.position.z
                                    ),
                                    speed: newSpeed
                                };
                            } else if (index < leadVehicleIndex) {
                                // For vehicles ahead of the new lead (should be only destroyed ones), keep in place
                                // No position updates needed as they're destroyed
                            } else {
                                // Find effective position in the active column
                                const activeVehicleIndex = activeColumnVehicles.findIndex(v => v.id === vehicle.id);

                                if (activeVehicleIndex !== -1) {
                                    const effectivePosition = activeColumnVehicles[activeVehicleIndex].effectiveColumnPosition;

                                    // Check only active vehicles between lead and current
                                    let hasDestroyedVehicleAhead = false;
                                    let closestDestroyedVehiclePosition = null;
                                    let canResumeMovement = true;

                                    // Check only active vehicles between lead and current
                                    for (let i = 0; i < index; i++) {
                                        const aheadVehicle = columnVehicles[i];
                                        // Skip vehicles before the lead since they're already handled
                                        if (i < leadVehicleIndex) continue;

                                        const aheadHealth = getVehicleHealth(aheadVehicle.id);

                                        if (aheadHealth && aheadHealth.isDead) {
                                            hasDestroyedVehicleAhead = true;

                                            // Check if the destroyed vehicle ahead has a clearing time and enough time has passed
                                            if (aheadVehicle.clearingTime) {
                                                const timeSinceClearing = Date.now() - aheadVehicle.clearingTime;
                                                // Wait for 5 seconds after vehicle is destroyed
                                                if (timeSinceClearing < DESTROYED_VEHICLE_WAIT_PERIOD) { // 5 second wait period
                                                    canResumeMovement = false;
                                                } else {
                                                    // After 5 seconds, we don't consider this obstacle anymore
                                                    hasDestroyedVehicleAhead = false;
                                                }
                                            } else {
                                                canResumeMovement = false;
                                            }

                                            // Only track position of vehicles we need to wait for
                                            if (!canResumeMovement) {
                                                // Find the closest destroyed vehicle
                                                if (!closestDestroyedVehiclePosition ||
                                                    (vehicle.direction > 0 && aheadVehicle.position.x < closestDestroyedVehiclePosition.x) ||
                                                    (vehicle.direction < 0 && aheadVehicle.position.x > closestDestroyedVehiclePosition.x)) {
                                                    closestDestroyedVehiclePosition = aheadVehicle.position;
                                                }
                                            }
                                        }
                                    }

                                    // Check for recently cleared vehicles
                                    let needsToWait = false;
                                    let waitPositionX = null;

                                    // Check all cleared positions that might affect this vehicle
                                    for (const [key, clearInfo] of clearedDestroyedPositions.entries()) {
                                        // Only care about vehicles in the same column with lower position index
                                        if (clearInfo.columnId === vehicle.columnId &&
                                            clearInfo.columnPosition < vehicle.columnPosition) {

                                            // Check if we're still within the waiting period
                                            const timeSinceClearing = Date.now() - clearInfo.clearingTime;
                                            if (timeSinceClearing < DESTROYED_VEHICLE_WAIT_PERIOD) { // 5-second wait period
                                                needsToWait = true;

                                                // Find the closest waiting position
                                                if (!waitPositionX ||
                                                    (vehicle.direction > 0 && clearInfo.x < waitPositionX) ||
                                                    (vehicle.direction < 0 && clearInfo.x > waitPositionX)) {
                                                    waitPositionX = clearInfo.x;
                                                }
                                            }
                                        }
                                    }

                                    // Make the decision based on the combined conditions
                                    if ((hasDestroyedVehicleAhead && closestDestroyedVehiclePosition && !canResumeMovement) ||
                                        (needsToWait && waitPositionX)) {
                                        // Either waiting for a destroyed vehicle ahead or for a cleared position
                                        // Pause exactly where they are - don't adjust position
                                        updatedVehicles[updatedVehicleIndex] = {
                                            ...vehicle,
                                            position: vehicle.position, // Keep exact current position without any adjustment
                                            speed: 0 // Complete stop
                                        };
                                    } else {
                                        // No destroyed vehicles ahead or waiting period is over

                                        // Check if any vehicles in this column were destroyed
                                        const hasDestroyedVehiclesInColumn = columnVehicles.some(v => {
                                            const health = getVehicleHealth(v.id);
                                            return health && health.isDead;
                                        });

                                        // Get the most recent destroyed vehicle time for this column
                                        let shouldWaitInPlace = false;
                                        if (vehicle.columnHasDestroyed && vehicle.lastDestroyedTime) {
                                            const timeSinceDestroyed = Date.now() - vehicle.lastDestroyedTime;
                                            // Waiting period is exactly 5 seconds (5000ms)
                                            shouldWaitInPlace = timeSinceDestroyed < DESTROYED_VEHICLE_WAIT_PERIOD;
                                        }

                                        if (hasDestroyedVehiclesInColumn && shouldWaitInPlace) {
                                            // During the 5-second wait period, keep vehicles exactly in place
                                            updatedVehicles[updatedVehicleIndex] = {
                                                ...vehicle,
                                                position: vehicle.position, // Keep exact position
                                                speed: 0 // Complete stop
                                            };
                                        } else {
                                            // Either no destroyed vehicles or wait period is over
                                            // Always maintain original column positions and spacing

                                            // Calculate position based on original column position relative to lead
                                            const originalSpacing = COLUMN_VEHICLE_SPACING;

                                            // Calculate position offset from lead vehicle using original column position
                                            const positionOffsetFromLead = (vehicle.columnPosition - leadVehicle.columnPosition) *
                                                originalSpacing;

                                            // Calculate target position - maintains gaps where vehicles were destroyed
                                            const targetX = leadVehicle.position.x - (positionOffsetFromLead * vehicle.direction);

                                            updatedVehicles[updatedVehicleIndex] = {
                                                ...vehicle,
                                                position: new THREE.Vector3(
                                                    targetX,
                                                    vehicle.position.y,
                                                    vehicle.position.z
                                                ),
                                                speed: newSpeed
                                            };
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            });

            // Handle cleanup of removed vehicles and respawning
            const processedVehicles = updatedVehicles.filter(vehicle => !vehicle.isRemoved).map(vehicle => {
                // Skip column vehicles as they're handled differently
                if (vehicle.isInColumn) return vehicle;

                const healthData = getVehicleHealth(vehicle.id);

                if (healthData && healthData.isDead && healthData.isDestroyed) {
                    // Determine respawn position based on direction
                    const respawnPosition = vehicle.direction > 0 ? -TERRAIN_SIZE / 2 : TERRAIN_SIZE / 2;

                    // Check for vehicles at the respawn point
                    const vehiclesAtStartingPoint = updatedVehicles.filter(v =>
                        v.id !== vehicle.id &&
                        v.direction === vehicle.direction &&
                        Math.abs(v.lane - vehicle.lane) < 0.5 &&
                        Math.abs(v.road - vehicle.road) < 0.5 &&
                        ((vehicle.direction > 0 &&
                            v.position.x > respawnPosition &&
                            v.position.x < respawnPosition + MINIMUM_DISTANCE * 2.5) ||
                            (vehicle.direction < 0 &&
                                v.position.x < respawnPosition &&
                                v.position.x > respawnPosition - MINIMUM_DISTANCE * 2.5))
                    );

                    // If there are vehicles in the way, offset the respawn position
                    const respawnOffset = vehiclesAtStartingPoint.length > 0
                        ? (vehicle.direction > 0 ? -MINIMUM_DISTANCE * 2.5 : MINIMUM_DISTANCE * 2.5)
                        : 0;

                    // Reset the vehicle with new position and full health
                    const respawnedVehicle = {
                        ...vehicle,
                        position: new THREE.Vector3(
                            respawnPosition + respawnOffset,
                            0.3,
                            vehicle.position.z
                        ),
                        speed: SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN)
                    };

                    // Reset the vehicle's health in the health system
                    setTimeout(() => {
                        vehicleHealthStore.respawnVehicle(vehicle.id);
                    }, 0);

                    return respawnedVehicle;
                }

                return vehicle;
            });

            // Add in new columns from the spawn queue
            const newColumns = processColumnSpawnQueue();
            if (newColumns.length > 0) {
                processedVehicles.push(...newColumns);
            }

            return processedVehicles;
        });
    });

    // Function to detect if a vehicle is about to collide with another vehicle ahead
    function detectCollisionAhead(vehicle, allVehicles, checkDistance = SAFE_DISTANCE) {
        // Only check vehicles in the same lane and road
        const sameRoadAndLane = allVehicles.filter(v =>
            v.id !== vehicle.id && // Not the same vehicle
            Math.abs(v.lane - vehicle.lane) < 0.5 && // Same lane (with tolerance)
            Math.abs(v.road - vehicle.road) < 0.5    // Same road (with tolerance)
        );

        // Find closest vehicle ahead
        let closestDistance = Infinity;
        let hasCollision = false;

        sameRoadAndLane.forEach(otherVehicle => {
            // For right-moving vehicles
            if (vehicle.direction > 0 && otherVehicle.direction > 0) {
                // Check if other vehicle is ahead
                if (otherVehicle.position.x > vehicle.position.x) {
                    const distance = otherVehicle.position.x - vehicle.position.x;
                    if (distance < checkDistance) {
                        hasCollision = true;
                        closestDistance = Math.min(closestDistance, distance);
                    }
                }
            }
            // For left-moving vehicles
            else if (vehicle.direction < 0 && otherVehicle.direction < 0) {
                // Check if other vehicle is ahead
                if (otherVehicle.position.x < vehicle.position.x) {
                    const distance = vehicle.position.x - otherVehicle.position.x;
                    if (distance < checkDistance) {
                        hasCollision = true;
                        closestDistance = Math.min(closestDistance, distance);
                    }
                }
            }
        });

        // Store the closest distance for speed regulation
        if (hasCollision) {
            vehicle.distanceToNext = closestDistance;
        } else {
            vehicle.distanceToNext = Infinity;
        }

        return hasCollision;
    }

    // Function to schedule a column respawn
    function scheduleColumnRespawn(lane, direction) {
        const laneKey = `${lane}-${direction}`;

        // Only schedule if there isn't already a pending spawn
        if (!columnSpawnTimersRef.current[laneKey]) {
            columnSpawnTimersRef.current[laneKey] = setTimeout(() => {
                // Clear the timer reference
                columnSpawnTimersRef.current[laneKey] = null;

                // Add this lane to the queue for respawning a column
                // The actual spawning will happen in the next frame update
                setVehicles(vehicles => {
                    // Directly add the new column here
                    return [...vehicles, ...createNewColumn(lane, direction)];
                });
            }, COLUMN_RESPAWN_DELAY);
        }
    }

    // Function to process any pending column spawns
    function processColumnSpawnQueue() {
        // This is now handled by the setTimeout callbacks
        return [];
    }

    // Function to create a new column
    function createNewColumn(lane, direction) {
        const newVehicles = [];
        const columnConfig = getRandomItem(MILITARY_COLUMNS);
        const newColumnId = `column-${Math.random().toString(36).substring(2, 9)}`;

        // Starting position for the new column
        const startingX = direction > 0 ?
            -TERRAIN_SIZE / 2 + 100 : // For positive direction, start near the beginning
            TERRAIN_SIZE / 2 - 100;  // For negative direction, start near the end

        // Get road from lane position (extract Z coordinate)
        const roadZ = Math.abs(lane) < ROAD_WIDTH ? -ROAD_SPACING / 2 : ROAD_SPACING / 2;

        let currentX = startingX;
        let vehicleIndex = 0;

        // Create all vehicles for the new column
        for (const vehicleGroup of columnConfig.vehicles) {
            for (let i = 0; i < vehicleGroup.count; i++) {
                const vehicleType = getRandomVehicleOfType(vehicleGroup.type);
                if (!vehicleType) continue;

                const vehicleId = `${newColumnId}-${vehicleGroup.type}-${i}`;

                // Add new vehicle to the list
                newVehicles.push({
                    id: vehicleId,
                    type: vehicleType,
                    columnId: newColumnId,
                    columnPosition: vehicleIndex,
                    position: new THREE.Vector3(
                        currentX,
                        0.3,
                        lane + (Math.random() * 0.2 - 0.1)
                    ),
                    rotation: new THREE.Euler(
                        0,
                        direction > 0 ? -Math.PI / 2 : Math.PI / 2,
                        0
                    ),
                    speed: SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN) * 0.5,
                    direction: direction,
                    lane: lane,
                    road: roadZ,
                    laneType: LANE_TYPES.FAST,
                    isInColumn: true,
                    hitbox: { width: 1.33, height: 1.33, depth: 4.0 }
                });

                // Move to next vehicle position
                currentX += direction * COLUMN_VEHICLE_SPACING;
                vehicleIndex++;
            }
        }

        return newVehicles;
    }

    return (
        <>
            {vehicles.map((vehicle) => {
                // Get health data for visual effects from our pre-fetched function
                const healthData = getVehicleHealth(vehicle.id);

                // Use the enhanced vehicle component with health system
                const VehicleComponent = EnhancedVehicleTypes[vehicle.type];

                return (
                    <group
                        key={vehicle.id}
                        position={[vehicle.position.x, vehicle.position.y, vehicle.position.z]}
                        rotation={[vehicle.rotation.x, vehicle.rotation.y, vehicle.rotation.z]}
                        userData={{
                            vehicleId: vehicle.id,
                            vehicleType: vehicle.type,
                            isVehicle: true,
                            isInColumn: vehicle.isInColumn,
                            columnId: vehicle.columnId,
                            hitbox: {
                                width: 4.0,
                                height: 2.0,
                                depth: 6.6
                            }
                        }}
                        name={`vehicle-${vehicle.id}`}
                    >
                        {/* Enhanced Vehicle Type Component with hitbox information */}
                        <VehicleComponent
                            id={vehicle.id}
                            scale={[4, 4, 4]}
                            userData={{
                                vehicleId: vehicle.id,
                                vehicleType: vehicle.type,
                                isVehicle: true
                            }}
                        />

                        {/* DEBUG: Visual hitbox representation */}
                        {false && (
                            <mesh
                                visible={true}
                                position={[0, 0.5, 0]}
                                userData={{
                                    isVehicleHitbox: true,
                                    parentVehicleId: vehicle.id
                                }}
                            >
                                <boxGeometry args={[
                                    vehicle.hitbox?.depth || 4.0,
                                    vehicle.hitbox?.height || 1.33,
                                    vehicle.hitbox?.width || 1.33
                                ]} />
                                <meshBasicMaterial color="red" wireframe={true} opacity={0.5} transparent={true} />
                            </mesh>
                        )}
                    </group>
                );
            })}
        </>
    );
}
