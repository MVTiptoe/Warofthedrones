import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { VehicleTypes } from './vehicles';
import { EnhancedVehicleTypes } from './vehicles/enhancedVehicles';
import { ROAD_WIDTH, ROAD_SPACING, TOTAL_ROAD_WIDTH, ROAD_EXTENSION } from './Road';
import { ORIGINAL_TERRAIN_SIZE, HALF_WIDTH_TERRAIN_SIZE } from './Terrain';
import { useVehicleHealthStore } from '../utils/VehicleHealthSystem';
import { useMapStore } from '../utils/MapStore';

// Vehicle movement speed in units per second
const SPEED_MIN = 0.216;  // Increased by 20% from 0.18
const SPEED_MAX = 0.3;    // Increased by 20% from 0.25

// Special speeds for cars and civilian trucks (44% faster - increased by 15% from previous 25%)
const CAR_CIVILIAN_SPEED_MIN = SPEED_MIN * 1.44;  // 44% faster than standard (25% + 15% more)
const CAR_CIVILIAN_SPEED_MAX = SPEED_MAX * 1.44;  // 44% faster than standard (25% + 15% more)

// Number of vehicles to spawn per road
const VEHICLES_PER_ROAD = 8; // Reduced from 11 to further reduce congestion

// Congestion detection settings
const CONGESTION_THRESHOLD = 3; // Number of stopped vehicles in proximity required to detect congestion
const CONGESTION_PROXIMITY = 30; // How close vehicles need to be to count as congested
const CONGESTION_SPEED_THRESHOLD = 0.05; // Vehicles moving below this speed are considered stopped
const REDUCED_SPAWN_FACTOR = 0.5; // Spawn only 50% of vehicles in congested areas

// Lane widths - now with 4 lanes per road
const LANE_WIDTH = ROAD_WIDTH / 4; // Each road has 4 lanes now

// Define lane types
const LANE_TYPES = {
    FAST: 'fast',    // Left lane (for military columns)
    SLOW: 'slow'     // Right lane (for civilian vehicles)
};

// Vehicle dimensions (approximate average)
const VEHICLE_LENGTH = 16; // Updated for 4x scale (was 12 for 3x scale)
const MINIMUM_DISTANCE = 60; // Updated to match civilian distance
const CIVILIAN_MINIMUM_DISTANCE = 60; // Increased spacing for civilian vehicles (60 meters)
const COLUMN_VEHICLE_SPACING = 40; // Increased by 10% from 30 meters distance between vehicles in a column
const TANK_SPACING = 55; // 20% more distance for tanks (new constant)
const IFV_SPACING = 45; // 20% more distance for IFVs (new constant)
const SAFE_DISTANCE = Math.max(VEHICLE_LENGTH * 1.8, MINIMUM_DISTANCE); // Updated to match civilian safe distance
const CIVILIAN_SAFE_DISTANCE = Math.max(VEHICLE_LENGTH * 1.8, CIVILIAN_MINIMUM_DISTANCE); // Increased safe distance for civilian vehicles

// Collision avoidance - now same for both military and civilian
const DETECTION_DISTANCE = SAFE_DISTANCE * 1; // Distance to start slowing down
const EMERGENCY_DISTANCE = 45; // Fixed 45 meter emergency distance as requested
const CIVILIAN_DETECTION_DISTANCE = CIVILIAN_SAFE_DISTANCE * 1; // Increased detection distance for civilian vehicles
const CIVILIAN_EMERGENCY_DISTANCE = 45; // Fixed 45 meter emergency distance for civilian vehicles

// Traffic jam recovery settings
const TRAFFIC_JAM_SPEED_THRESHOLD = 0.05; // Speed below this is considered "stopped"
const TRAFFIC_JAM_RECOVERY_BOOST = 1.1; // Reduced from 1.2 to prevent excessive acceleration
const TRAFFIC_JAM_CHECK_INTERVAL = 500; // Check every 0.5 seconds

// Delay after vehicle destruction before column resumes movement
const DESTROYED_VEHICLE_WAIT_PERIOD = 2000; // 2 seconds

// Military column definitions
const MILITARY_COLUMNS = [
    // Combo 1: 3 tanks, 2 IFVs, 1 military truck
    {
        id: 'combo1',
        vehicles: [
            { type: 'military_truck', count: 1 },
            { type: 'ifv', count: 2 },
            { type: 'tank', count: 3 },
        ]
    },
    // Combo 2: 1 tank, 3 IFVs, 2 military trucks
    {
        id: 'combo2',
        vehicles: [
            { type: 'military_truck', count: 2 },
            { type: 'ifv', count: 3 },
            { type: 'tank', count: 1 }
        ]
    },
    // Combo 3: 2 tanks, 2 IFVs, 2 military trucks
    {
        id: 'combo3',
        vehicles: [
            { type: 'military_truck', count: 2 },
            { type: 'ifv', count: 2 },
            { type: 'tank', count: 2 }
        ]
    },
    // Combo 4: 1 tank, 4 IFVs, 1 military truck
    {
        id: 'combo4',
        vehicles: [
            { type: 'military_truck', count: 1 },
            { type: 'ifv', count: 4 },
            { type: 'tank', count: 1 }
        ]
    }
];

// Define constants to track and manage column spawning
const MAX_COLUMNS_PER_LANE = 1; // Maximum number of active columns per lane
const COLUMN_RESPAWN_DELAY = 7000; // 7 seconds delay before respawning a new column (increased from 5000)

// Create reusable Vector3 and Euler objects to prevent memory leaks
const tempVector3 = new THREE.Vector3();
const tempEuler = new THREE.Euler();

// Object pooling to reuse vehicle objects
class VehiclePool {
    constructor() {
        this.pool = [];
        this.inUse = new Set();
    }

    get() {
        // Try to get a vehicle from the pool, or create a new one if pool is empty
        let vehicle = this.pool.pop();
        if (!vehicle) {
            vehicle = {
                position: new THREE.Vector3(),
                hitbox: { width: 1.0, height: 1.0, depth: 3.0 }
            };
        }
        this.inUse.add(vehicle);
        return vehicle;
    }

    release(vehicle) {
        if (this.inUse.has(vehicle)) {
            this.inUse.delete(vehicle);
            this.pool.push(vehicle);
        }
    }

    releaseAll() {
        this.inUse.forEach(vehicle => {
            this.pool.push(vehicle);
        });
        this.inUse.clear();
    }
}

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

// Function to check if vehicle is a car or civilian truck
function isCarOrCivilianTruck(vehicleType) {
    return vehicleType.includes('car_') || vehicleType.includes('civilian_truck_');
}

export default function VehiclesOnRoad() {
    const [vehicles, setVehicles] = useState([]);
    const initializedRef = useRef(false);
    const columnSpawnTimersRef = useRef({});
    const timeoutRefsRef = useRef([]); // New ref to track all timeout IDs for cleanup
    const vehiclePoolRef = useRef(new VehiclePool()); // Object pool for reusing vehicle objects
    const congestionMapRef = useRef(new Map()); // Track congested road sections

    // Add a ref to store references to vehicle meshes for culling
    const vehicleRefsMap = useRef(new Map());

    // Access vehicle health store for mobility factor and health data
    const vehicleHealthStore = useVehicleHealthStore();
    const getVehicleHealth = vehicleHealthStore.getVehicleHealth;

    // Cache for vehicle objects by ID to avoid expensive array searches
    const vehiclesById = useRef(new Map());

    // Pre-compute rotations to avoid creating new Euler objects
    const rotationMap = useMemo(() => {
        return {
            right: new THREE.Euler(0, -Math.PI / 2, 0),
            left: new THREE.Euler(0, Math.PI / 2, 0)
        };
    }, []);

    // Get current map type from store
    const { currentMapType } = useMapStore();

    // Get the terrain size based on the current map type
    const terrainSize = useMemo(() => {
        if (currentMapType === 'half-width') {
            return HALF_WIDTH_TERRAIN_SIZE;
        }
        return { width: ORIGINAL_TERRAIN_SIZE, height: ORIGINAL_TERRAIN_SIZE };
    }, [currentMapType]);

    // Function to detect congestion in a road section
    const detectCongestion = (allVehicles) => {
        const newCongestionMap = new Map();

        // Group vehicles by road sections (divide the road into 100-unit sections)
        const roadSections = new Map();

        // Track columns that have been completely destroyed
        const destroyedColumns = new Set();
        const activeColumns = new Set();

        // Identify active and destroyed columns
        allVehicles.forEach(vehicle => {
            if (vehicle.isInColumn && vehicle.columnId) {
                const healthData = getVehicleHealth(vehicle.id);
                if (healthData && healthData.isDead) {
                    destroyedColumns.add(vehicle.columnId);
                } else {
                    activeColumns.add(vehicle.columnId);
                }
            }
        });

        // Remove columns from destroyedColumns that still have active vehicles
        activeColumns.forEach(activeId => {
            destroyedColumns.delete(activeId);
        });

        allVehicles.forEach(vehicle => {
            // Skip destroyed vehicles 
            const healthData = getVehicleHealth(vehicle.id);
            if (healthData && healthData.isDead) return;

            // Determine road section (divide the road into segments)
            const sectionKey = `${Math.floor(vehicle.position.x / 100)}-${vehicle.road}-${vehicle.direction}`;

            if (!roadSections.has(sectionKey)) {
                roadSections.set(sectionKey, []);
            }
            roadSections.get(sectionKey).push(vehicle);
        });

        // Check each road section for congestion
        roadSections.forEach((sectionVehicles, sectionKey) => {
            // Count stopped or very slow vehicles
            let stoppedCount = 0;

            // Check if this section contains a lane where a column was fully destroyed
            const [_, road, direction] = sectionKey.split('-');
            let sectionHasDestroyedColumn = false;

            sectionVehicles.forEach(vehicle => {
                if (vehicle.speed < CONGESTION_SPEED_THRESHOLD) {
                    stoppedCount++;
                }

                // Check if any vehicle in this section was part of a now-destroyed column
                if (vehicle.isInColumn && destroyedColumns.has(vehicle.columnId)) {
                    sectionHasDestroyedColumn = true;
                }
            });

            // If a column in this section was completely destroyed, 
            // don't mark as congested to allow traffic to recover
            if (sectionHasDestroyedColumn) {
                return;
            }

            // Check if enough vehicles are stopped/slow to qualify as congestion
            if (stoppedCount >= CONGESTION_THRESHOLD) {
                newCongestionMap.set(sectionKey, {
                    stoppedCount,
                    totalVehicles: sectionVehicles.length,
                    lastDetectedTime: Date.now()
                });
            }
        });

        return newCongestionMap;
    };

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

                // Generate a random position along the road for the column to spawn
                // Use a range within the terrain size with some padding
                const randomOffset = Math.random() * (terrainSize.width * 0.7) - (terrainSize.width * 0.35);

                // Starting position for the column - random point on the road
                const startingX = lane.direction > 0 ?
                    -terrainSize.width / 2 + 100 + randomOffset : // For positive direction
                    terrainSize.width / 2 - 100 + randomOffset;  // For negative direction

                let currentX = startingX;
                let vehicleIndex = 0;

                // Create all vehicles for this column
                for (const vehicleGroup of columnConfig.vehicles) {
                    for (let i = 0; i < vehicleGroup.count; i++) {
                        const vehicleType = getRandomVehicleOfType(vehicleGroup.type);
                        if (!vehicleType) continue;

                        const vehicleId = `${columnId}-${vehicleGroup.type}-${i}`;

                        // Adjust speed based on vehicle type (cars and civilian trucks are 25% faster)
                        const baseSpeedMin = isCarOrCivilianTruck(vehicleType) ? CAR_CIVILIAN_SPEED_MIN : SPEED_MIN;
                        const baseSpeedMax = isCarOrCivilianTruck(vehicleType) ? CAR_CIVILIAN_SPEED_MAX : SPEED_MAX;

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
                            rotation: lane.direction > 0 ? rotationMap.right : rotationMap.left,
                            speed: baseSpeedMin + Math.random() * (baseSpeedMax - baseSpeedMin),
                            direction: lane.direction,
                            lane: lane.z,
                            road: roadZ,
                            laneType: lane.type,
                            isInColumn: true,
                            hitbox: { width: 1.33, height: 1.33, depth: 4.0 }
                        });

                        // Move to next vehicle position - use specific spacing based on vehicle type
                        if (vehicleGroup.type === 'tank') {
                            currentX += lane.direction * TANK_SPACING;
                        } else if (vehicleGroup.type === 'ifv') {
                            currentX += lane.direction * IFV_SPACING;
                        } else {
                            currentX += lane.direction * COLUMN_VEHICLE_SPACING;
                        }
                        vehicleIndex++;
                    }
                }
            });

            // Populate slow lanes with civilian vehicles
            slowLanes.forEach(lane => {
                // Check for congestion in this lane's direction and road
                const roadSection = `${Math.floor(-terrainSize.width / 2 / 100)}-${roadZ}-${lane.direction}`;
                const isCongested = congestionMapRef.current.has(roadSection);

                // Adjust vehicle count based on congestion
                let vehiclesPerLane = VEHICLES_PER_ROAD / 2; // Default - split evenly between slow lanes

                if (isCongested) {
                    // Reduce vehicle count in congested areas
                    vehiclesPerLane = Math.floor(vehiclesPerLane * REDUCED_SPAWN_FACTOR);
                    console.log(`Congestion detected in section ${roadSection}, reducing spawns to ${vehiclesPerLane}`);
                }

                // Track vehicle positions to ensure proper spacing
                const vehiclePositions = [];

                for (let i = 0; i < vehiclesPerLane; i++) {
                    // Randomly choose between car and civilian truck (adjusted ratio)
                    const vehicleType = Math.random() < 0.7 ?
                        getRandomVehicleOfType('car') :
                        getRandomVehicleOfType('civilian_truck');

                    if (!vehicleType) continue;

                    // Calculate position with good spacing along the road
                    const segmentLength = terrainSize.width / vehiclesPerLane;
                    const minSegmentLength = CIVILIAN_MINIMUM_DISTANCE * 1.5;
                    const effectiveSegmentLength = Math.max(segmentLength, minSegmentLength);

                    // Create a base position for this vehicle with some randomness
                    let segmentStart = -terrainSize.width / 2 + (i * effectiveSegmentLength);
                    let xPos = segmentStart + Math.random() * (effectiveSegmentLength * 0.6);

                    // Calculate Z position with slight random variation
                    const zJitter = Math.random() * 0.5 - 0.25; // Small random Z variation for visual interest
                    let zPos = lane.z + zJitter;

                    // Check for conflicts with existing vehicles in the same lane
                    let hasConflict = false;
                    let conflictResolutionAttempts = 0;
                    const MAX_CONFLICT_RESOLUTION_ATTEMPTS = 5;

                    // Make sure this position is not too close to other spawned vehicles
                    while (conflictResolutionAttempts < MAX_CONFLICT_RESOLUTION_ATTEMPTS) {
                        hasConflict = false;

                        // Check against all previously placed vehicles in this lane
                        for (const pos of vehiclePositions) {
                            const xDistance = Math.abs(pos.x - xPos);
                            const zDistance = Math.abs(pos.z - zPos);

                            // If too close to another vehicle, adjust position
                            if (xDistance < CIVILIAN_MINIMUM_DISTANCE && zDistance < 2.0) {
                                hasConflict = true;

                                // Move this vehicle further along the road
                                xPos += lane.direction > 0 ? CIVILIAN_MINIMUM_DISTANCE : -CIVILIAN_MINIMUM_DISTANCE;

                                // Apply small Z variation to avoid being in the exact same line
                                const newZJitter = Math.random() * 0.8 - 0.4;
                                zPos = lane.z + newZJitter;
                                break;
                            }
                        }

                        if (!hasConflict) break;
                        conflictResolutionAttempts++;
                    }

                    // If we still have conflicts after max attempts, skip this vehicle
                    if (hasConflict) continue;

                    // Track this position
                    vehiclePositions.push({ x: xPos, z: zPos });

                    const vehicleId = `vehicle-${roadZ}-${lane.z}-${i}`;

                    // Adjust hitbox dimensions based on vehicle type
                    let hitbox;
                    if (vehicleType.includes('car_')) {
                        hitbox = { width: 2.0, height: 1.0, depth: 4.0 }; // Car hitbox - increased width
                    } else if (vehicleType === 'civilian_truck_1') {
                        hitbox = { width: 2.4, height: 1.5, depth: 6.5 }; // Specific hitbox for CivilianTruck1 with trailer
                    } else if (vehicleType.includes('civilian_truck_')) {
                        hitbox = { width: 2.2, height: 1.5, depth: 5.0 }; // Updated hitbox for civilian trucks
                    } else {
                        hitbox = { width: 2.0, height: 1.2, depth: 4.5 }; // Default hitbox as fallback
                    }

                    newVehicles.push({
                        id: vehicleId,
                        type: vehicleType,
                        position: new THREE.Vector3(xPos, 0.3, zPos),
                        rotation: lane.direction > 0 ? rotationMap.right : rotationMap.left,
                        speed: CAR_CIVILIAN_SPEED_MIN + Math.random() * (CAR_CIVILIAN_SPEED_MAX - CAR_CIVILIAN_SPEED_MIN),
                        direction: lane.direction,
                        lane: lane.z,
                        road: roadZ,
                        laneType: lane.type,
                        isInColumn: false,
                        hitbox: hitbox,
                        jamCounter: 0  // Initialize jam counter
                    });
                }
            });
        });

        // Update the cache for quick lookups
        newVehicles.forEach(vehicle => {
            vehiclesById.current.set(vehicle.id, vehicle);
        });

        setVehicles(newVehicles);

        // Cleanup function for the component unmount
        return () => {
            // Release all vehicles back to the pool
            vehiclePoolRef.current.releaseAll();

            // Clear all tracked timeouts
            timeoutRefsRef.current.forEach(timeoutId => {
                clearTimeout(timeoutId);
            });

            // Clear all column spawn timers
            Object.values(columnSpawnTimersRef.current).forEach(timerId => {
                if (timerId) clearTimeout(timerId);
            });
        };
    }, [rotationMap, congestionMapRef.current, terrainSize]); // Add terrainSize to dependencies

    // Memory optimization: Limit the number of timeouts tracked
    useEffect(() => {
        // Periodically clean up completed timeouts from our tracking array
        const intervalId = setInterval(() => {
            // Remove nullish or completed timeouts from the array
            if (timeoutRefsRef.current.length > 100) {
                timeoutRefsRef.current = timeoutRefsRef.current.slice(-100);
            }
        }, 30000); // Every 30 seconds

        // Periodically remove vehicles that have drifted too far from the road
        const cleanupIntervalId = setInterval(() => {
            setVehicles(prevVehicles => {
                // Define the valid area boundary for cleanup (larger than rendering boundary)
                const cleanup_buffer = 150; // larger buffer for cleanup
                const minX = -terrainSize.width / 2 - cleanup_buffer;
                const maxX = terrainSize.width / 2 + cleanup_buffer;

                // Define valid Z-coordinate range (road width with buffer)
                const roadHalfWidth = ROAD_WIDTH / 2;
                const validZRanges = [
                    // Upper road Z range
                    { min: ROAD_SPACING / 2 - roadHalfWidth - 20, max: ROAD_SPACING / 2 + roadHalfWidth + 20 },
                    // Lower road Z range
                    { min: -ROAD_SPACING / 2 - roadHalfWidth - 20, max: -ROAD_SPACING / 2 + roadHalfWidth + 20 }
                ];

                // Filter out vehicles that are too far from the road
                return prevVehicles.filter(vehicle => {
                    // Skip removed vehicles or those in columns (handled separately)
                    if (vehicle.isRemoved || vehicle.isInColumn) return true;

                    // Check if vehicle is within X bounds
                    const validX = vehicle.position.x >= minX && vehicle.position.x <= maxX;

                    // Check if vehicle is within any valid Z range
                    const validZ = validZRanges.some(range =>
                        vehicle.position.z >= range.min && vehicle.position.z <= range.max
                    );

                    // Only keep vehicles within valid X and Z coordinates
                    if (!(validX && validZ)) {
                        console.log(`Removing vehicle ${vehicle.id} that drifted too far from the road`);
                        // Remove the vehicle completely if it's civilian
                        if (!vehicle.isInColumn) {
                            return false;
                        }
                        // Only respawn military vehicles
                        const timeoutId = setTimeout(() => {
                            vehicleHealthStore.respawnVehicle(vehicle.id);
                        }, 0);
                        timeoutRefsRef.current.push(timeoutId);
                        return false;
                    }
                    return true;
                });
            });
        }, 10000); // Check every 10 seconds

        return () => {
            clearInterval(intervalId);
            clearInterval(cleanupIntervalId);
        };
    }, [terrainSize]);

    // Pre-compute reusable geometries and materials
    const vehicleGeometries = useMemo(() => {
        const geometries = {};
        // Return pre-computed geometries to be reused
        return geometries;
    }, []);

    // Memoize the vehicle detection lookup map for collision detection
    const vehicleLookupMapRef = useRef(new Map());

    // Update vehicle positions on each frame with memory optimization
    useFrame((state, delta) => {
        // Cache current time outside the loop to avoid multiple calls
        const currentTime = Date.now();

        setVehicles(vehicles => {
            // Update congestion map every 3 seconds (not every frame to save performance)
            if (currentTime % 3000 < 16) { // Run if we're within 16ms of a 3-second mark
                congestionMapRef.current = detectCongestion(vehicles);
            }

            // Update the vehicle ID cache
            vehiclesById.current.clear();
            vehicles.forEach(vehicle => {
                vehiclesById.current.set(vehicle.id, vehicle);
            });

            // Track the positions where destroyed vehicles were removed
            const removedDestroyedPositions = new Map(); // Map<lane, {x, road, direction, removalTime}>

            // First, check if any column is fully destroyed (all vehicles destroyed)
            const activeColumns = new Set();
            const columnsToRespawn = new Set();
            const destroyedVehicles = new Map(); // Track destroyed vehicles by ID
            const clearedDestroyedPositions = new Map(); // Track positions where a destroyed vehicle was removed and cleared
            const newlyDestroyedColumns = new Map(); // Track columns with newly destroyed vehicles

            // Optimize vehicle lookup for collision detection
            const updateVehicleLookupMap = (vehiclesList) => {
                vehicleLookupMapRef.current.clear();

                vehiclesList.forEach(vehicle => {
                    const key = `${Math.floor(vehicle.position.x / 10)}-${vehicle.lane}-${vehicle.direction}`;
                    if (!vehicleLookupMapRef.current.has(key)) {
                        vehicleLookupMapRef.current.set(key, []);
                    }
                    vehicleLookupMapRef.current.get(key).push(vehicle);
                });
            };

            // More efficient collision detection that uses the map
            const optimizedDetectCollisionAhead = (vehicle, allVehicles, checkDistance = SAFE_DISTANCE) => {
                const sectorKey = `${Math.floor(vehicle.position.x / 10)}-${vehicle.lane}-${vehicle.direction}`;
                const nextSectorKey = `${Math.floor((vehicle.position.x + (vehicle.direction * 10)) / 10)}-${vehicle.lane}-${vehicle.direction}`;

                // Check more sectors ahead for better detection at high speeds
                const farSectorKey = `${Math.floor((vehicle.position.x + (vehicle.direction * 20)) / 10)}-${vehicle.lane}-${vehicle.direction}`;
                const veryFarSectorKey = `${Math.floor((vehicle.position.x + (vehicle.direction * 30)) / 10)}-${vehicle.lane}-${vehicle.direction}`;

                // Get vehicles in current and next sectors
                const sectorsToCheck = [
                    vehicleLookupMapRef.current.get(sectorKey) || [],
                    vehicleLookupMapRef.current.get(nextSectorKey) || [],
                    vehicleLookupMapRef.current.get(farSectorKey) || [],
                    vehicleLookupMapRef.current.get(veryFarSectorKey) || []
                ];

                // Check adjacent lanes too for civilian vehicles, but only if they're not cars
                // Cars should be less affected by adjacent lanes than trucks
                if (!vehicle.isInColumn) {
                    // Calculate adjacent lane keys
                    const laneWidth = LANE_WIDTH; // Use the defined lane width
                    const adjacentLaneUp = vehicle.lane + laneWidth;
                    const adjacentLaneDown = vehicle.lane - laneWidth;

                    // Determine if this is a car (which should have less adjacent lane checking)
                    const isCar = vehicle.type && vehicle.type.includes('car_');

                    // Adjust the adjacent lane check distance based on vehicle type
                    // Cars should ignore vehicles in adjacent lanes unless they're very close
                    const adjacentLaneZThreshold = isCar ? 1.8 : 3.5;

                    // Add vehicles from adjacent lanes to check
                    const adjacentSectorKeyUp = `${Math.floor(vehicle.position.x / 10)}-${adjacentLaneUp}-${vehicle.direction}`;
                    const adjacentSectorKeyDown = `${Math.floor(vehicle.position.x / 10)}-${adjacentLaneDown}-${vehicle.direction}`;
                    const nextAdjacentSectorKeyUp = `${Math.floor((vehicle.position.x + (vehicle.direction * 10)) / 10)}-${adjacentLaneUp}-${vehicle.direction}`;
                    const nextAdjacentSectorKeyDown = `${Math.floor((vehicle.position.x + (vehicle.direction * 10)) / 10)}-${adjacentLaneDown}-${vehicle.direction}`;

                    // Store the adjacent lane vehicles in a separate array for special handling
                    const adjacentLaneVehicles = [
                        ...(vehicleLookupMapRef.current.get(adjacentSectorKeyUp) || []),
                        ...(vehicleLookupMapRef.current.get(adjacentSectorKeyDown) || []),
                        ...(vehicleLookupMapRef.current.get(nextAdjacentSectorKeyUp) || []),
                        ...(vehicleLookupMapRef.current.get(nextAdjacentSectorKeyDown) || [])
                    ];

                    // For cars, we'll check adjacent lane vehicles separately with a narrower Z threshold
                    if (isCar) {
                        // We'll handle these separately below
                    } else {
                        // Add all adjacent vehicles to sectors to check for trucks
                        sectorsToCheck.push(...adjacentLaneVehicles);
                    }

                    // Store the adjacent lane vehicles on the vehicle object for special handling
                    vehicle.adjacentLaneVehicles = adjacentLaneVehicles;
                    vehicle.adjacentLaneZThreshold = adjacentLaneZThreshold;
                }

                let closestDistance = Infinity;
                let hasCollision = false;

                // Flatten and filter vehicles
                const potentialCollisions = sectorsToCheck.flat().filter(v =>
                    v.id !== vehicle.id &&
                    Math.abs(v.road - vehicle.road) < 0.5 &&
                    v.direction === vehicle.direction // Only check vehicles going in same direction
                );

                // Check these filtered vehicles for collision
                potentialCollisions.forEach(otherVehicle => {
                    // Skip checking destroyed vehicles
                    const healthData = getVehicleHealth(otherVehicle.id);
                    if (healthData && healthData.isDead && healthData.isDestroyed) return;

                    // Calculate Z-distance between vehicles
                    const zDistance = Math.abs(otherVehicle.position.z - vehicle.position.z);

                    // Only consider vehicles within a certain Z-distance (based on vehicle width)
                    // Use a wider threshold for civilian vehicles to prevent side collisions
                    const zThreshold = vehicle.isInColumn ? 2.0 : 3.5;

                    if (zDistance < zThreshold) {
                        // For right-moving vehicles
                        if (vehicle.direction > 0 && otherVehicle.direction > 0) {
                            // Check if other vehicle is ahead
                            if (otherVehicle.position.x > vehicle.position.x) {
                                const distance = otherVehicle.position.x - vehicle.position.x;

                                // Use a fixed check distance that doesn't decrease with Z-distance
                                // This prevents vehicles from thinking they can slip through when they can't
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

                                // Use a fixed check distance that doesn't decrease with Z-distance
                                if (distance < checkDistance) {
                                    hasCollision = true;
                                    closestDistance = Math.min(closestDistance, distance);
                                }
                            }
                        }
                    }
                });

                // Special handling for cars - check adjacent lane vehicles with a narrower Z threshold
                if (!vehicle.isInColumn && vehicle.type && vehicle.type.includes('car_') && vehicle.adjacentLaneVehicles) {
                    const adjacentLaneZThreshold = vehicle.adjacentLaneZThreshold || 1.8;

                    vehicle.adjacentLaneVehicles.forEach(otherVehicle => {
                        // Skip checking destroyed vehicles
                        const healthData = getVehicleHealth(otherVehicle.id);
                        if (healthData && healthData.isDead && healthData.isDestroyed) return;

                        // Skip checking military columns unless they're extremely close
                        if (otherVehicle.isInColumn) {
                            // Calculate Z-distance between vehicles
                            const zDistance = Math.abs(otherVehicle.position.z - vehicle.position.z);

                            // Cars should only be affected by military columns if they're extremely close
                            if (zDistance >= adjacentLaneZThreshold) {
                                return; // Skip this military column vehicle
                            }
                        }

                        // Calculate Z-distance between vehicles
                        const zDistance = Math.abs(otherVehicle.position.z - vehicle.position.z);

                        // Only consider vehicles within a tighter Z-distance for cars
                        if (zDistance < adjacentLaneZThreshold) {
                            // For right-moving vehicles
                            if (vehicle.direction > 0 && otherVehicle.direction > 0) {
                                // Check if other vehicle is ahead
                                if (otherVehicle.position.x > vehicle.position.x) {
                                    const distance = otherVehicle.position.x - vehicle.position.x;

                                    // For cars, we only care about adjacent lane vehicles that are VERY close
                                    if (distance < checkDistance * 0.7) {
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

                                    // For cars, we only care about adjacent lane vehicles that are VERY close
                                    if (distance < checkDistance * 0.7) {
                                        hasCollision = true;
                                        closestDistance = Math.min(closestDistance, distance);
                                    }
                                }
                            }
                        }
                    });

                    // Clean up our temporary properties
                    delete vehicle.adjacentLaneVehicles;
                    delete vehicle.adjacentLaneZThreshold;
                }

                // Store the closest distance for speed regulation
                if (hasCollision) {
                    vehicle.distanceToNext = closestDistance;
                } else {
                    vehicle.distanceToNext = Infinity;
                }

                return hasCollision;
            };

            // Update the lookup map for efficient collision detection
            updateVehicleLookupMap(vehicles);

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
                            newlyDestroyedColumns.set(vehicle.columnId, currentTime);
                        }

                        // If vehicle is destroyed but not yet marked for clearing, mark it with a clearing time
                        if (!vehicle.clearingStarted) {
                            const timeoutId = setTimeout(() => {
                                setVehicles(prevVehicles => {
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
                            timeoutRefsRef.current.push(timeoutId);
                        }

                        // Mark it for removal after a delay if not already marked and vehicle is fully destroyed
                        if (!vehicle.markedForRemoval && vehicle.clearingStarted && healthData.isDestroyed) {
                            const timeoutId = setTimeout(() => {
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
                            }, DESTROYED_VEHICLE_WAIT_PERIOD); // 2 seconds delay before removing destroyed vehicles
                            timeoutRefsRef.current.push(timeoutId);
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
                            clearingTime: currentTime // Use current time when actually removed, not previous clearing time
                        });

                        // Notify all other vehicles in the column that a vehicle has been completely removed
                        const timeoutId = setTimeout(() => {
                            setVehicles(prevVehicles => {
                                return prevVehicles.map(v => {
                                    if (v.columnId === vehicle.columnId) {
                                        return {
                                            ...v,
                                            columnHasRemoval: true,
                                            lastRemovalTime: currentTime
                                        };
                                    }
                                    return v;
                                });
                            });
                        }, 0);
                        timeoutRefsRef.current.push(timeoutId);

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
                // Use different distance thresholds for civilian vehicles
                let speed = originalSpeed;

                if (!vehicle.isInColumn) {
                    // Check if vehicle is in a potential traffic jam (very slow for several frames)
                    if (!vehicle.jamCounter) vehicle.jamCounter = 0;
                    if (!vehicle.lastJamCheck) vehicle.lastJamCheck = currentTime;

                    // Only update jam status periodically to avoid rapid changes
                    if (currentTime - vehicle.lastJamCheck > TRAFFIC_JAM_CHECK_INTERVAL) {
                        if (vehicle.speed < TRAFFIC_JAM_SPEED_THRESHOLD) {
                            vehicle.jamCounter++;
                        } else {
                            // Reset jam counter if moving at decent speed
                            vehicle.jamCounter = Math.max(0, vehicle.jamCounter - 2); // Faster recovery
                        }
                        vehicle.lastJamCheck = currentTime;
                    }

                    // Determine if in traffic jam
                    const isInTrafficJam = vehicle.jamCounter > 5;

                    // Get the actual distance to the next vehicle
                    const hasCollisionEmergency = optimizedDetectCollisionAhead(vehicle, filteredVehicles, CIVILIAN_EMERGENCY_DISTANCE);
                    const hasMinimumDistance = optimizedDetectCollisionAhead(vehicle, filteredVehicles, CIVILIAN_MINIMUM_DISTANCE);
                    const hasCollisionWarning = optimizedDetectCollisionAhead(vehicle, filteredVehicles, CIVILIAN_DETECTION_DISTANCE);

                    // Store the previous speed for acceleration control
                    if (!vehicle.previousSpeed) vehicle.previousSpeed = vehicle.speed;

                    // Determine appropriate speed for civilian vehicles with traffic jam recovery
                    let targetSpeed;
                    if (hasCollisionEmergency) {
                        // Emergency stop - too close
                        targetSpeed = 0;
                    } else if (hasMinimumDistance) {
                        // Strong slowing down when below minimum distance
                        const distanceFactor = Math.max(0, (vehicle.distanceToNext - CIVILIAN_EMERGENCY_DISTANCE)) /
                            (CIVILIAN_MINIMUM_DISTANCE - CIVILIAN_EMERGENCY_DISTANCE);
                        // More aggressive braking for close vehicles
                        targetSpeed = originalSpeed * Math.max(0.02, Math.min(0.1, distanceFactor * 0.1));
                    } else if (hasCollisionWarning) {
                        // Gradual slow down based on distance
                        const distanceFactor = Math.max(0, (vehicle.distanceToNext - CIVILIAN_MINIMUM_DISTANCE)) /
                            (CIVILIAN_DETECTION_DISTANCE - CIVILIAN_MINIMUM_DISTANCE);
                        // More aggressive deceleration curve
                        targetSpeed = originalSpeed * Math.max(0.2, Math.min(0.8, distanceFactor));
                    } else {
                        // No obstacles ahead - recover speed
                        targetSpeed = originalSpeed;

                        // Apply boost if recovering from traffic jam
                        // Only boost if we have significant space ahead (more than detection distance)
                        if (isInTrafficJam && vehicle.distanceToNext > CIVILIAN_DETECTION_DISTANCE * 1.5) {
                            targetSpeed *= TRAFFIC_JAM_RECOVERY_BOOST;
                        }
                    }

                    // Smoother, more responsive deceleration
                    const accelerationRate = targetSpeed > vehicle.speed ? 0.08 : 0.25; // Even faster deceleration than before
                    speed = vehicle.speed + (targetSpeed - vehicle.speed) * accelerationRate;

                    // Store current speed for next frame
                    vehicle.previousSpeed = speed;
                } else {
                    // Military column vehicles - now using same distances as civilians
                    const hasCollisionEmergency = optimizedDetectCollisionAhead(vehicle, filteredVehicles, CIVILIAN_EMERGENCY_DISTANCE);
                    const hasMinimumDistance = optimizedDetectCollisionAhead(vehicle, filteredVehicles, CIVILIAN_MINIMUM_DISTANCE);
                    const hasCollisionWarning = optimizedDetectCollisionAhead(vehicle, filteredVehicles, CIVILIAN_DETECTION_DISTANCE);

                    // Determine appropriate speed for military vehicles - using civilian distance factors
                    if (hasCollisionEmergency) {
                        // Emergency stop - too close
                        speed = 0;
                    } else if (hasMinimumDistance) {
                        // Strong slowing down when below minimum distance
                        const distanceFactor = Math.max(0, (vehicle.distanceToNext - CIVILIAN_EMERGENCY_DISTANCE)) /
                            (CIVILIAN_MINIMUM_DISTANCE - CIVILIAN_EMERGENCY_DISTANCE);
                        // More aggressive braking for close vehicles
                        speed = originalSpeed * Math.max(0.02, Math.min(0.1, distanceFactor * 0.1));
                    } else if (hasCollisionWarning) {
                        // Gradual slow down based on distance
                        const distanceFactor = Math.max(0, (vehicle.distanceToNext - CIVILIAN_MINIMUM_DISTANCE)) /
                            (CIVILIAN_DETECTION_DISTANCE - CIVILIAN_MINIMUM_DISTANCE);
                        // More aggressive deceleration curve
                        speed = originalSpeed * Math.max(0.2, Math.min(0.8, distanceFactor));
                    }
                }

                // Calculate the new position with smoother acceleration/deceleration
                const speedChange = Math.min(Math.abs(speed - vehicle.speed), 0.01); // Limit speed change per frame
                const newSpeed = speed > vehicle.speed
                    ? vehicle.speed + speedChange
                    : vehicle.speed - speedChange;

                const newX = vehicle.position.x + (newSpeed * vehicle.direction * delta * 60);

                // Calculate the new position by modifying existing Vector3 instead of creating a new one
                if (vehicle.direction > 0 && newX > terrainSize.width / 2) {
                    // Reset to the beginning of the road (right direction vehicles)
                    tempVector3.set(-terrainSize.width / 2, 0.3, vehicle.position.z);
                    vehicle.position.copy(tempVector3);
                    return {
                        ...vehicle,
                        speed: vehicle.speed
                    };
                } else if (vehicle.direction < 0 && newX < -terrainSize.width / 2) {
                    // Reset to the beginning of the road (left direction vehicles)
                    tempVector3.set(terrainSize.width / 2, 0.3, vehicle.position.z);
                    vehicle.position.copy(tempVector3);
                    return {
                        ...vehicle,
                        speed: vehicle.speed
                    };
                }

                // Update position by modifying the existing object
                tempVector3.set(newX, vehicle.position.y, vehicle.position.z);

                // Only run one collision detection - remove this redundant section
                return {
                    ...vehicle,
                    position: tempVector3.clone(), // Need to clone here since we're returning a new object
                    speed: newSpeed
                };
            });

            // Update lookup cache for new vehicle states
            updatedVehicles.forEach(vehicle => {
                vehiclesById.current.set(vehicle.id, vehicle);
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
                        // All vehicles are destroyed, but we'll continue moving the column
                        // Use the original lead vehicle's properties for movement calculation
                        leadVehicle = columnVehicles[0];
                    }
                }

                // Replace the lead vehicle concept with a column-wide movement strategy
                // Instead of following a leader, vehicles maintain their original positions

                // Find any non-destroyed vehicle to serve as a reference point
                let referenceVehicle = null;
                let referenceVehicleHealth = null;
                let hasActiveVehicle = false;

                for (const vehicle of columnVehicles) {
                    const health = getVehicleHealth(vehicle.id);
                    if (!(health && health.isDead)) {
                        referenceVehicle = vehicle;
                        referenceVehicleHealth = health;
                        hasActiveVehicle = true;
                        break;
                    }
                }

                // Initialize column speed here with a default value
                const initialSpeed = SPEED_MIN;
                let columnSpeed = initialSpeed;

                // If we have an active vehicle, use its speed as reference
                if (hasActiveVehicle) {
                    // Use the health of reference vehicle for mobility factor
                    const mobilityFactor = referenceVehicleHealth ? referenceVehicleHealth.mobilityFactor : 1.0;
                    const baseSpeed = referenceVehicle.speed * mobilityFactor;
                    columnSpeed = baseSpeed;
                }

                // Filter to active vehicles for processing
                const activeColumnVehicles = columnVehicles.filter(vehicle => {
                    const health = getVehicleHealth(vehicle.id);
                    return !(health && health.isDead);
                });

                // Check if any vehicles in the column were destroyed and track timing
                let columnHasDestroyed = false;
                let lastDestroyedTime = null;

                // Create a map of destroyed vehicles by position to make lookups faster
                const destroyedVehicleMap = new Map();

                for (const veh of columnVehicles) {
                    const health = getVehicleHealth(veh.id);
                    if (health && health.isDead) {
                        columnHasDestroyed = true;
                        destroyedVehicleMap.set(veh.columnPosition, veh);

                        // If this vehicle was just destroyed, update the destroyed time
                        if (!veh.wasMarkedDestroyed) {
                            lastDestroyedTime = currentTime;
                            // Mark the vehicle so we don't update the time again
                            const updateIdx = updatedVehicles.findIndex(v => v.id === veh.id);
                            if (updateIdx !== -1) {
                                updatedVehicles[updateIdx] = {
                                    ...updatedVehicles[updateIdx],
                                    wasMarkedDestroyed: true,
                                    clearingTime: currentTime
                                };
                            }
                        } else if (veh.clearingTime && (!lastDestroyedTime || veh.clearingTime > lastDestroyedTime)) {
                            lastDestroyedTime = veh.clearingTime;
                        }
                    }
                }

                // Update all vehicles in this column with the destroyed status
                if (columnHasDestroyed && lastDestroyedTime) {
                    columnVehicles.forEach(veh => {
                        const updateIdx = updatedVehicles.findIndex(v => v.id === veh.id);
                        if (updateIdx !== -1) {
                            updatedVehicles[updateIdx] = {
                                ...updatedVehicles[updateIdx],
                                columnHasDestroyed: true,
                                lastDestroyedTime: lastDestroyedTime
                            };
                        }
                    });
                }

                // Apply collision avoidance based on the frontmost active vehicle
                const frontmostActiveVehicle = activeColumnVehicles.reduce((front, current) => {
                    // For positive direction, higher X is more forward
                    // For negative direction, lower X is more forward
                    if (referenceVehicle.direction > 0) {
                        return current.position.x > front.position.x ? current : front;
                    } else {
                        return current.position.x < front.position.x ? current : front;
                    }
                }, activeColumnVehicles[0] || columnVehicles[0]); // Fallback to first column vehicle if no active vehicles

                // Check for obstacles ahead using civilian distances for better safety
                const hasCollisionEmergency = optimizedDetectCollisionAhead(frontmostActiveVehicle, updatedVehicles, CIVILIAN_EMERGENCY_DISTANCE);
                const hasMinimumDistance = optimizedDetectCollisionAhead(frontmostActiveVehicle, updatedVehicles, CIVILIAN_MINIMUM_DISTANCE);
                const hasCollisionWarning = optimizedDetectCollisionAhead(frontmostActiveVehicle, updatedVehicles, CIVILIAN_DETECTION_DISTANCE);

                // Adjust speed based on conditions
                if (hasCollisionEmergency) {
                    columnSpeed = 0;
                } else if (hasMinimumDistance) {
                    const distanceFactor = (frontmostActiveVehicle.distanceToNext - CIVILIAN_EMERGENCY_DISTANCE) /
                        (CIVILIAN_MINIMUM_DISTANCE - CIVILIAN_EMERGENCY_DISTANCE);
                    columnSpeed = columnSpeed * Math.max(0.05, distanceFactor * 0.1);
                } else if (hasCollisionWarning) {
                    const distanceFactor = (frontmostActiveVehicle.distanceToNext - CIVILIAN_MINIMUM_DISTANCE) /
                        (CIVILIAN_DETECTION_DISTANCE - CIVILIAN_MINIMUM_DISTANCE);
                    columnSpeed = columnSpeed * Math.max(0.3, distanceFactor);
                }

                // Ensure column keeps moving even with destroyed vehicles
                if (columnHasDestroyed && !hasCollisionEmergency) {
                    columnSpeed = Math.max(columnSpeed, SPEED_MIN);
                }

                // Smooth acceleration/deceleration
                const speedChange = Math.min(Math.abs(columnSpeed - (hasActiveVehicle ? referenceVehicle.speed : SPEED_MIN)), 0.01);
                const newColumnSpeed = columnSpeed > (hasActiveVehicle ? referenceVehicle.speed : SPEED_MIN)
                    ? (hasActiveVehicle ? referenceVehicle.speed : SPEED_MIN) + speedChange
                    : (hasActiveVehicle ? referenceVehicle.speed : SPEED_MIN) - speedChange;

                // Calculate movement for all vehicles
                columnVehicles.forEach(vehicle => {
                    const updatedVehicleIndex = updatedVehicles.findIndex(v => v.id === vehicle.id);
                    if (updatedVehicleIndex === -1) return;

                    // Skip processing destroyed vehicles
                    const vehicleHealth = getVehicleHealth(vehicle.id);
                    if (vehicleHealth && vehicleHealth.isDead) return;

                    // Check if the column needs to wait for destroyed vehicles
                    const shouldWaitInPlace = columnHasDestroyed && lastDestroyedTime &&
                        currentTime - lastDestroyedTime < DESTROYED_VEHICLE_WAIT_PERIOD;

                    // Find if there are any destroyed vehicles ahead of this one by comparing positions
                    let hasDestroyedVehicleAhead = false;

                    // More efficient check: directly compare positions to find destroyed vehicles ahead
                    for (const [position, destroyedVehicle] of destroyedVehicleMap.entries()) {
                        // For positive direction: destroyed vehicle is ahead if its x position is greater
                        // For negative direction: destroyed vehicle is ahead if its x position is smaller
                        if ((vehicle.direction > 0 && destroyedVehicle.position.x > vehicle.position.x) ||
                            (vehicle.direction < 0 && destroyedVehicle.position.x < vehicle.position.x)) {

                            // Check if there's a destroyed vehicle ahead that's still in the wait period
                            const timeSinceDestroyed = destroyedVehicle.clearingTime ?
                                (currentTime - destroyedVehicle.clearingTime) : 0;

                            if (timeSinceDestroyed < DESTROYED_VEHICLE_WAIT_PERIOD) {
                                hasDestroyedVehicleAhead = true;
                                break;
                            }
                        }
                    }

                    // Only wait if there's a destroyed vehicle directly ahead AND we're in the wait period
                    // Otherwise, continue moving
                    if (shouldWaitInPlace && hasDestroyedVehicleAhead) {
                        // Keep the vehicle in place during the wait period
                        tempVector3.set(vehicle.position.x, vehicle.position.y, vehicle.position.z);
                        updatedVehicles[updatedVehicleIndex] = {
                            ...vehicle,
                            position: tempVector3.clone(),
                            speed: 0,
                            columnHasDestroyed,
                            lastDestroyedTime,
                            waitingForVehicleAhead: true
                        };
                    } else {
                        // Move the vehicle forward - either it's ahead of any destroyed vehicles,
                        // or there is no need to wait anymore

                        // For vehicles that were waiting, add a small boost to catch up with the formation
                        const catchUpBoost = vehicle.waitingForVehicleAhead ? 1.2 : 1.0;

                        // Calculate the position offset from a baseline column position
                        const xMovement = newColumnSpeed * vehicle.direction * delta * 60 * catchUpBoost;

                        // Calculate new position, preserving the exact formation
                        tempVector3.set(
                            vehicle.position.x + xMovement,
                            vehicle.position.y,
                            vehicle.position.z
                        );

                        updatedVehicles[updatedVehicleIndex] = {
                            ...vehicle,
                            position: tempVector3.clone(),
                            speed: newColumnSpeed * catchUpBoost,
                            columnHasDestroyed,
                            lastDestroyedTime,
                            waitingForVehicleAhead: false
                        };
                    }
                });

                // Check if column has reached the end of the road
                const frontmostX = frontmostActiveVehicle.position.x + (newColumnSpeed * frontmostActiveVehicle.direction * delta * 60);

                if (frontmostActiveVehicle.direction > 0 && frontmostX > terrainSize.width / 2 ||
                    frontmostActiveVehicle.direction < 0 && frontmostX < -terrainSize.width / 2) {

                    // Remove the column from the scene
                    columnVehicles.forEach((vehicle) => {
                        const updatedVehicleIndex = updatedVehicles.findIndex(v => v.id === vehicle.id);
                        if (updatedVehicleIndex !== -1) {
                            updatedVehicles[updatedVehicleIndex] = {
                                ...vehicle,
                                isRemoved: true
                            };
                        }
                    });

                    // Schedule a new column to spawn
                    scheduleColumnRespawn(frontmostActiveVehicle.lane, frontmostActiveVehicle.direction);
                }
            });

            // Handle cleanup of removed vehicles and respawning
            const processedVehicles = updatedVehicles.filter(vehicle => {
                if (!vehicle) return false; // Skip null vehicles
                if (vehicle.isRemoved) return false;

                // Skip column vehicles as they're handled differently
                if (vehicle.isInColumn) return true;

                const healthData = getVehicleHealth(vehicle.id);

                if (healthData && healthData.isDead && healthData.isDestroyed) {
                    // Skip respawning for civilian vehicles
                    if (!vehicle.isInColumn) {
                        return false; // Remove the civilian vehicle completely
                    }

                    // For military columns, keep the existing respawn logic
                    const randomOffset = Math.random() * (terrainSize.width * 0.4);
                    const respawnPosition = vehicle.direction > 0 ?
                        -terrainSize.width / 2 + randomOffset :
                        terrainSize.width / 2 + randomOffset;

                    const vehiclesAtStartingPoint = updatedVehicles.filter(v =>
                        v && v.id !== vehicle.id && // Add null check
                        v.direction === vehicle.direction &&
                        v.lane === vehicle.lane &&
                        v.road === vehicle.road &&
                        ((vehicle.direction > 0 &&
                            v.position.x > respawnPosition &&
                            v.position.x < respawnPosition + MINIMUM_DISTANCE * 2.5) ||
                            (vehicle.direction < 0 &&
                                v.position.x < respawnPosition &&
                                v.position.x > respawnPosition - MINIMUM_DISTANCE * 2.5))
                    );

                    const respawnOffset = vehiclesAtStartingPoint.length > 0
                        ? (vehicle.direction > 0 ? -MINIMUM_DISTANCE * 2.5 : MINIMUM_DISTANCE * 2.5)
                        : 0;

                    const respawnedVehicle = {
                        ...vehicle,
                        position: new THREE.Vector3(
                            respawnPosition + respawnOffset,
                            0.3,
                            vehicle.position.z
                        ),
                        speed: SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN)
                    };

                    // Reset the vehicle's health in the health system only for military vehicles
                    const timeoutId = setTimeout(() => {
                        vehicleHealthStore.respawnVehicle(vehicle.id);
                    }, 0);
                    timeoutRefsRef.current.push(timeoutId);

                    return respawnedVehicle;
                }

                return true;
            }).filter(Boolean); // Remove any remaining null values

            // Add in new columns from the spawn queue
            const newColumns = processColumnSpawnQueue();
            if (newColumns.length > 0) {
                processedVehicles.push(...newColumns);
            }

            return processedVehicles;
        });
    });

    // Function to schedule a column respawn with proper timeout tracking
    function scheduleColumnRespawn(lane, direction) {
        const laneKey = `${lane}-${direction}`;

        // Only schedule if there isn't already a pending spawn
        if (!columnSpawnTimersRef.current[laneKey]) {
            const timeoutId = setTimeout(() => {
                // Clear the timer reference
                columnSpawnTimersRef.current[laneKey] = null;

                // Add this lane to the queue for respawning a column
                // The actual spawning will happen in the next frame update
                setVehicles(vehicles => {
                    // Directly add the new column here
                    return [...vehicles, ...createNewColumn(lane, direction)];
                });
            }, COLUMN_RESPAWN_DELAY);

            // Store the timeout ID for cleanup
            columnSpawnTimersRef.current[laneKey] = timeoutId;
            timeoutRefsRef.current.push(timeoutId);
        }
    }

    // Function to process any pending column spawns
    function processColumnSpawnQueue() {
        // This is now handled by the setTimeout callbacks
        return [];
    }

    // Function to create a new column with optimized object creation
    function createNewColumn(lane, direction) {
        const newVehicles = [];
        const columnConfig = getRandomItem(MILITARY_COLUMNS);
        const newColumnId = `column-${Math.random().toString(36).substring(2, 9)}`;

        // Generate a random position along the road for the column to spawn
        // Use a range within the terrain size with some padding
        const randomOffset = Math.random() * (terrainSize.width * 0.7) - (terrainSize.width * 0.35);

        // Starting position for the new column - random point on the road
        const startingX = direction > 0 ?
            -terrainSize.width / 2 + 100 + randomOffset : // For positive direction
            terrainSize.width / 2 - 100 + randomOffset;  // For negative direction

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

                // Get a vehicle from the pool
                const vehicle = vehiclePoolRef.current.get();

                // Configure the vehicle
                vehicle.id = vehicleId;
                vehicle.type = vehicleType;
                vehicle.columnId = newColumnId;
                vehicle.columnPosition = vehicleIndex;
                vehicle.position.set(
                    currentX,
                    0.3,
                    lane + (Math.random() * 0.2 - 0.1)
                );
                vehicle.rotation = direction > 0 ? rotationMap.right : rotationMap.left;
                vehicle.speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN) * 0.5;
                vehicle.direction = direction;
                vehicle.lane = lane;
                vehicle.road = roadZ;
                vehicle.laneType = LANE_TYPES.FAST;
                vehicle.isInColumn = true;
                vehicle.hitbox = { width: 1.33, height: 1.33, depth: 4.0 };

                // Add to new vehicles
                newVehicles.push(vehicle);

                // Move to next vehicle position - use specific spacing based on vehicle type
                if (vehicleGroup.type === 'tank') {
                    currentX += direction * TANK_SPACING;
                } else if (vehicleGroup.type === 'ifv') {
                    currentX += direction * IFV_SPACING;
                } else {
                    currentX += direction * COLUMN_VEHICLE_SPACING;
                }
                vehicleIndex++;
            }
        }

        return newVehicles;
    }

    // Add useFrame for distance-based culling similar to EnvironmentObjects
    const { camera } = useThree();
    useFrame(() => {
        const cameraPosition = camera.position;
        const FAR_DISTANCE = 1200; // Set slightly higher than environment objects to avoid pop-in

        // Apply distance-based culling to vehicles
        vehicleRefsMap.current.forEach((vehicleRef, vehicleId) => {
            if (vehicleRef && vehicleRef.current) {
                // Get the vehicle position
                const position = vehicleRef.current.position;

                // Calculate distance from camera
                const distanceToCamera = new THREE.Vector3(
                    position.x,
                    position.y,
                    position.z
                ).distanceTo(cameraPosition);

                // Set visibility based on distance
                vehicleRef.current.visible = (distanceToCamera < FAR_DISTANCE);
            }
        });
    });

    // Memoize the rendering of vehicles to reduce unnecessary re-renders
    const renderVehicles = useMemo(() => {
        // Clear old references for vehicles that no longer exist
        const currentVehicleIds = new Set(vehicles.map(v => v.id));
        vehicleRefsMap.current.forEach((_, id) => {
            if (!currentVehicleIds.has(id)) {
                vehicleRefsMap.current.delete(id);
            }
        });

        return vehicles
            // Filter out vehicles outside the visible area - only render vehicles within the terrain bounds
            .filter((vehicle) => {
                // Define the visible area boundary with a small buffer
                const buffer = 50; // buffer in units beyond the terrain edge
                const minX = -terrainSize.width / 2 - buffer;
                const maxX = terrainSize.width / 2 + buffer;

                // Define valid Z-coordinate range (road width)
                const roadHalfWidth = ROAD_WIDTH / 2;
                const validZRanges = [
                    // Upper road Z range
                    { min: ROAD_SPACING / 2 - roadHalfWidth - 5, max: ROAD_SPACING / 2 + roadHalfWidth + 5 },
                    // Lower road Z range
                    { min: -ROAD_SPACING / 2 - roadHalfWidth - 5, max: -ROAD_SPACING / 2 + roadHalfWidth + 5 }
                ];

                // Check if vehicle is within X bounds
                const validX = vehicle.position.x >= minX && vehicle.position.x <= maxX;

                // Check if vehicle is within any valid Z range
                const validZ = validZRanges.some(range =>
                    vehicle.position.z >= range.min && vehicle.position.z <= range.max
                );

                // Only render vehicles within valid X and Z coordinates
                return validX && validZ;
            })
            .map((vehicle) => {
                // Get health data for visual effects from our pre-fetched function
                const healthData = getVehicleHealth(vehicle.id);

                // Use the enhanced vehicle component with health system
                const VehicleComponent = EnhancedVehicleTypes[vehicle.type];

                // Create a ref for this vehicle if it doesn't exist yet
                if (!vehicleRefsMap.current.has(vehicle.id)) {
                    vehicleRefsMap.current.set(vehicle.id, React.createRef());
                }

                // Get the ref for this vehicle
                const vehicleRef = vehicleRefsMap.current.get(vehicle.id);

                return (
                    <group
                        key={vehicle.id}
                        ref={vehicleRef}
                        position={[vehicle.position.x, vehicle.position.y, vehicle.position.z]}
                        rotation={[vehicle.rotation.x, vehicle.rotation.y, vehicle.rotation.z]}
                        userData={{
                            vehicleId: vehicle.id,
                            vehicleType: vehicle.type,
                            isVehicle: true,
                            isInColumn: vehicle.isInColumn,
                            columnId: vehicle.columnId,
                            hitbox: {
                                width: vehicle.hitbox?.width || 1.0,
                                height: vehicle.hitbox?.height || 1.0,
                                depth: vehicle.hitbox?.depth || 3.0
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

                        {/* DEBUG: Visual hitbox representation - disabled in production */}
                        {false && (
                            <mesh
                                visible={true}
                                position={[0, vehicle.hitbox?.height / 2 || 0.5, 0]}
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
            });
    }, [vehicles, getVehicleHealth, terrainSize]);

    return <>{renderVehicles}</>;
}
