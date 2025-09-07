import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { ORIGINAL_TERRAIN_SIZE } from '../terrain/OriginalTerrain';

// Constants for original environment objects
const ROAD_WIDTH = 140;
const ROAD_SPACING = 300;
const MIN_SCALE = 1.2;
const MAX_SCALE = 1.8;

// Tree type definitions
const TREE_TYPES = {
    PINE: 'pine',
    OAK: 'oak',
    PALM: 'palm',
    BIRCH: 'birch'
};

// Spatial hash grid for efficient object placement
class SpatialHashGrid {
    constructor(bounds, dimensions) {
        this.bounds = bounds;
        this.dimensions = dimensions;
        this.cells = {};
    }

    // Calculate the cell coordinates for a position
    getCell(position) {
        const { min, max } = this.bounds;
        const cellX = Math.floor((position.x - min.x) / (max.x - min.x) * this.dimensions.x);
        const cellZ = Math.floor((position.z - min.z) / (max.z - min.z) * this.dimensions.z);
        return { x: cellX, z: cellZ };
    }

    // Get cell key for hashing
    getCellKey(cell) {
        return `${cell.x},${cell.z}`;
    }

    // Add object to grid
    insert(position, object) {
        const cell = this.getCell(position);
        const key = this.getCellKey(cell);

        if (!this.cells[key]) {
            this.cells[key] = [];
        }
        this.cells[key].push({ position, object });
    }

    // Find objects near a position
    query(position, radius) {
        const result = [];
        const center = this.getCell(position);

        // Calculate how many cells we need to check based on radius
        const cellRadius = Math.ceil(radius / Math.min(
            (this.bounds.max.x - this.bounds.min.x) / this.dimensions.x,
            (this.bounds.max.z - this.bounds.min.z) / this.dimensions.z
        ));

        // Check all cells within cell radius
        for (let x = -cellRadius; x <= cellRadius; x++) {
            for (let z = -cellRadius; z <= cellRadius; z++) {
                const cell = { x: center.x + x, z: center.z + z };
                const key = this.getCellKey(cell);

                if (this.cells[key]) {
                    for (const item of this.cells[key]) {
                        const dx = item.position.x - position.x;
                        const dz = item.position.z - position.z;
                        const distance = Math.sqrt(dx * dx + dz * dz);

                        if (distance <= radius) {
                            result.push(item.object);
                        }
                    }
                }
            }
        }

        return result;
    }
}

// Generate a deterministic random number based on seed
function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// Generate original environment objects with a focus on lush forests
export default function OriginalEnvironmentObjects() {
    const terrainSize = ORIGINAL_TERRAIN_SIZE;
    const seed = 12345; // Seed for deterministic generation

    // Setup spatial grid
    const halfWidth = terrainSize / 2;
    const halfHeight = terrainSize / 2;

    // Use a fixed seed for deterministic generation
    const { trees, rocks, bushes, largeBush } = useMemo(() => {
        // Initialize spatial hash grid for position checking
        const bounds = {
            min: { x: -halfWidth, z: -halfHeight },
            max: { x: halfWidth, z: halfHeight }
        };
        const grid = new SpatialHashGrid(bounds, { x: 20, z: 20 });

        // Check if a position is on the road
        const isOnRoad = (x, z) => {
            return (
                Math.abs(z - ROAD_SPACING / 2) < ROAD_WIDTH / 2 ||
                Math.abs(z + ROAD_SPACING / 2) < ROAD_WIDTH / 2
            );
        };

        // Generate fixed positions for each object type with spatial constraints
        const trees = { pine: [], oak: [], palm: [], birch: [] };
        const rocks = [];
        const bushes = [];

        // Minimum required distance between objects to avoid overlapping
        const MIN_DISTANCE = 12;

        // Function to check if position is valid (not on road, not too close to other objects)
        const isPositionValid = (x, z, radius) => {
            if (isOnRoad(x, z)) return false;

            // Add a safety margin around roads
            const roadMargin = 10;
            if (
                Math.abs(z - ROAD_SPACING / 2) < (ROAD_WIDTH / 2) + roadMargin ||
                Math.abs(z + ROAD_SPACING / 2) < (ROAD_WIDTH / 2) + roadMargin
            ) {
                return false;
            }

            // Check spatial grid for nearby objects
            const pos = { x, z };
            const nearby = grid.query(pos, radius);
            return nearby.length === 0;
        };

        // Function to add an object at a valid position with deterministic randomness
        const addObject = (collection, objectType, baseIndex, count, minDistance) => {
            for (let i = 0; i < count; i++) {
                const seedValue = seed + baseIndex + i;

                // Use deterministic random values
                const randX = seededRandom(seedValue * 1.1);
                const randZ = seededRandom(seedValue * 2.3);
                const randScale = seededRandom(seedValue * 3.7);
                const randRotation = seededRandom(seedValue * 4.5);
                const randType = Math.floor(seededRandom(seedValue * 5.9) * 4);

                // Calculate position using deterministic randomness
                const x = randX * terrainSize - halfWidth;
                const z = randZ * terrainSize - halfHeight;

                // Skip if position is invalid (deterministic skipping)
                if (!isPositionValid(x, z, minDistance)) continue;

                // Create object with properties
                const scale = MIN_SCALE + randScale * (MAX_SCALE - MIN_SCALE);
                const rotation = randRotation * Math.PI * 2;
                const position = new THREE.Vector3(x, 0, z);

                const object = {
                    position: [x, 0, z],
                    scale,
                    rotation,
                    type: randType
                };

                // Add to collection based on object type
                if (objectType === 'tree') {
                    const treeTypeName = Object.values(TREE_TYPES)[randType];
                    trees[treeTypeName].push(object);
                } else if (objectType === 'rock') {
                    rocks.push(object);
                } else if (objectType === 'bush') {
                    bushes.push(object);
                }

                // Insert into spatial grid
                grid.insert({ x, z }, object);
            }
        };

        // Setup original environment with plenty of trees and vegetation
        const treeCount = 600;
        const rockCount = 150;
        const bushCount = 300;

        // Generate fixed number of objects with deterministic positioning
        addObject(trees, 'tree', 0, treeCount, MIN_DISTANCE);
        addObject(rocks, 'rock', 10000, rockCount, MIN_DISTANCE / 3);
        addObject(bushes, 'bush', 20000, bushCount, MIN_DISTANCE / 3);

        // Special large bush positioning (deterministic based on seed)
        const specialSeed = seed * 9876;
        const specialX = seededRandom(specialSeed) * terrainSize - halfWidth;
        const specialZ = seededRandom(specialSeed + 100) * terrainSize - halfHeight;

        let largeBush = null;
        if (!isOnRoad(specialX, specialZ)) {
            largeBush = {
                position: [specialX, 0, specialZ],
                scale: 4.0,
                rotation: seededRandom(specialSeed + 200) * Math.PI * 2
            };
        }

        return { trees, rocks, bushes, largeBush };
    }, [halfWidth, halfHeight, terrainSize]);

    const { camera } = useThree();

    // References to our instanced meshes
    const treeRefs = {
        pine: { trunk: useRef(), foliage: useRef() },
        oak: { trunk: useRef(), foliage: useRef() },
        palm: { trunk: useRef(), foliage: useRef() },
        birch: { trunk: useRef(), foliage: useRef() }
    };

    const rocksRef = useRef();
    const bushesRef = useRef();
    const largeBushRef = useRef();

    // Create a frustum for culling
    const frustum = useMemo(() => new THREE.Frustum(), []);
    const projScreenMatrix = useMemo(() => new THREE.Matrix4(), []);
    const tempObject = useMemo(() => new THREE.Object3D(), []);

    // Materials for original environment - lush green colors
    const treeMaterials = useMemo(() => ({
        pine: {
            trunk: new THREE.MeshStandardMaterial({
                color: '#8B4513',
                roughness: 0.8,
                flatShading: true
            }),
            foliage: new THREE.MeshStandardMaterial({
                color: '#2E8B57',
                roughness: 0.7,
                flatShading: true
            })
        },
        oak: {
            trunk: new THREE.MeshStandardMaterial({
                color: '#654321',
                roughness: 0.9,
                flatShading: true
            }),
            foliage: new THREE.MeshStandardMaterial({
                color: '#228B22',
                roughness: 0.6,
                flatShading: true
            })
        },
        palm: {
            trunk: new THREE.MeshStandardMaterial({
                color: '#A0522D',
                roughness: 0.7,
                flatShading: true
            }),
            foliage: new THREE.MeshStandardMaterial({
                color: '#32CD32',
                roughness: 0.8,
                flatShading: true
            })
        },
        birch: {
            trunk: new THREE.MeshStandardMaterial({
                color: '#F5F5DC',
                roughness: 0.6,
                flatShading: true
            }),
            foliage: new THREE.MeshStandardMaterial({
                color: '#ADFF2F',
                roughness: 0.7,
                flatShading: true
            })
        }
    }), []);

    const rockMaterial = useMemo(() =>
        new THREE.MeshStandardMaterial({
            color: '#7D7D7D',
            roughness: 1.0,
            flatShading: true
        }),
        []);

    const bushMaterial = useMemo(() =>
        new THREE.MeshStandardMaterial({
            color: '#3A5F0B',
            roughness: 0.7,
            flatShading: true
        }),
        []);

    // Create optimized geometries
    const rockGeometry = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
    const bushGeometry = useMemo(() => new THREE.SphereGeometry(2, 6, 4), []);

    // Tree dimension presets
    const treeDimensions = useMemo(() => ({
        pine: {
            trunkHeight: 4.8,
            trunkRadius: 0.75,
            foliageOffset: 4.8
        },
        oak: {
            trunkHeight: 4.5,
            trunkRadius: 0.975,
            foliageOffset: 3
        },
        palm: {
            trunkHeight: 7.5,
            trunkRadius: 0.525,
            foliageOffset: 7.5
        },
        birch: {
            trunkHeight: 6.75,
            trunkRadius: 0.4875,
            foliageOffset: 4.5
        }
    }), []);

    // Create simplified LOD geometries
    const treeGeometries = useMemo(() => {
        // Create high detail geometries
        const highDetail = {
            pine: {
                trunk: new THREE.CylinderGeometry(0.6, 0.75, 4.8, 8, 3),
                foliage: new THREE.ConeGeometry(3, 9.6, 8, 4)
            },
            oak: {
                trunk: new THREE.CylinderGeometry(0.9, 1.05, 4.5, 10, 4),
                foliage: new THREE.SphereGeometry(3.75, 12, 10)
            },
            palm: {
                trunk: new THREE.CylinderGeometry(0.45, 0.6, 7.5, 8, 5),
                foliage: new THREE.DodecahedronGeometry(3.75, 1)
            },
            birch: {
                trunk: new THREE.CylinderGeometry(0.45, 0.53, 6.75, 9, 4),
                foliage: new THREE.OctahedronGeometry(3, 2)
            }
        };

        // Create low detail geometries
        const lowDetail = {
            pine: {
                trunk: new THREE.CylinderGeometry(0.6, 0.75, 4.8, 4, 1),
                foliage: new THREE.ConeGeometry(3, 9.6, 5, 1)
            },
            oak: {
                trunk: new THREE.CylinderGeometry(0.9, 1.05, 4.5, 6, 1),
                foliage: new THREE.SphereGeometry(3.75, 6, 4)
            },
            palm: {
                trunk: new THREE.CylinderGeometry(0.45, 0.6, 7.5, 4, 1),
                foliage: new THREE.DodecahedronGeometry(3.75, 0)
            },
            birch: {
                trunk: new THREE.CylinderGeometry(0.45, 0.53, 6.75, 5, 1),
                foliage: new THREE.OctahedronGeometry(3, 0)
            }
        };

        return { highDetail, lowDetail };
    }, []);

    // Setup instanced mesh matrices
    useEffect(() => {
        // Setup trees for each type with proper positioning
        Object.entries(trees).forEach(([treeType, positions]) => {
            if (!positions.length) return;

            const {
                trunkHeight,
                trunkRadius,
                foliageOffset
            } = treeDimensions[treeType];

            // Setup trunk matrices
            const trunkRef = treeRefs[treeType].trunk;
            if (trunkRef.current && positions.length > 0) {
                positions.forEach((tree, i) => {
                    const [x, y, z] = tree.position;
                    const scale = tree.scale;

                    const scaledTrunkHeight = trunkHeight * scale;
                    const trunkY = scaledTrunkHeight / 2;

                    tempObject.position.set(x, trunkY, z);
                    tempObject.rotation.set(0, tree.rotation, 0);
                    tempObject.scale.set(scale, scale, scale);
                    tempObject.updateMatrix();

                    trunkRef.current.setMatrixAt(i, tempObject.matrix);
                });
                trunkRef.current.instanceMatrix.needsUpdate = true;
                trunkRef.current.computeBoundingSphere();
                if (trunkRef.current.boundingSphere) {
                    trunkRef.current.boundingSphere.radius *= 1.5;
                }
            }

            // Setup foliage matrices
            const foliageRef = treeRefs[treeType].foliage;
            if (foliageRef.current && positions.length > 0) {
                positions.forEach((tree, i) => {
                    const [x, y, z] = tree.position;
                    const scale = tree.scale;

                    // Scale foliage position
                    const scaledFoliageOffset = foliageOffset * scale;

                    // Determine foliage position based on tree type
                    let foliageY;
                    switch (treeType) {
                        case 'pine':
                            foliageY = scaledFoliageOffset + (4.8 * scale);
                            break;
                        case 'birch':
                            foliageY = scaledFoliageOffset + (2.25 * scale);
                            break;
                        case 'oak':
                        case 'palm':
                        default:
                            foliageY = scaledFoliageOffset + (1.5 * scale);
                    }

                    tempObject.position.set(x, foliageY, z);
                    tempObject.rotation.set(0, tree.rotation, 0);
                    tempObject.scale.setScalar(scale);
                    tempObject.updateMatrix();

                    foliageRef.current.setMatrixAt(i, tempObject.matrix);
                });
                foliageRef.current.instanceMatrix.needsUpdate = true;
                foliageRef.current.computeBoundingSphere();
                if (foliageRef.current.boundingSphere) {
                    foliageRef.current.boundingSphere.radius *= 1.5;
                }
            }
        });

        // Setup rocks
        if (rocksRef.current && rocks.length > 0) {
            rocks.forEach((rock, i) => {
                const [x, y, z] = rock.position;
                const scale = rock.scale;
                const objectY = 0.5 * scale;

                tempObject.position.set(x, objectY, z);
                tempObject.rotation.set(0, rock.rotation, 0);
                tempObject.scale.setScalar(scale);
                tempObject.updateMatrix();

                rocksRef.current.setMatrixAt(i, tempObject.matrix);
            });
            rocksRef.current.instanceMatrix.needsUpdate = true;
            rocksRef.current.computeBoundingSphere();
            if (rocksRef.current.boundingSphere) {
                rocksRef.current.boundingSphere.radius *= 1.5;
            }
        }

        // Setup bushes
        if (bushesRef.current && bushes.length > 0) {
            bushes.forEach((bush, i) => {
                const [x, y, z] = bush.position;
                const scale = bush.scale;
                const objectY = 2 * scale * 0.5;

                tempObject.position.set(x, objectY, z);
                tempObject.rotation.set(0, bush.rotation, 0);
                tempObject.scale.setScalar(scale);
                tempObject.updateMatrix();

                bushesRef.current.setMatrixAt(i, tempObject.matrix);
            });
            bushesRef.current.instanceMatrix.needsUpdate = true;
            bushesRef.current.computeBoundingSphere();
            if (bushesRef.current.boundingSphere) {
                bushesRef.current.boundingSphere.radius *= 1.5;
            }
        }

        // Setup large bush
        if (largeBushRef.current && largeBush) {
            const [x, y, z] = largeBush.position;
            const scale = largeBush.scale;
            const objectY = 2 * scale * 0.5;

            tempObject.position.set(x, objectY, z);
            tempObject.rotation.set(0, largeBush.rotation, 0);
            tempObject.scale.setScalar(scale);
            tempObject.updateMatrix();

            largeBushRef.current.matrix.copy(tempObject.matrix);
            largeBushRef.current.matrixAutoUpdate = false;
            // Regular meshes don't have computeBoundingSphere method
            // Create a manual bounding sphere for distance checks
            if (!largeBushRef.current.boundingSphere) {
                largeBushRef.current.boundingSphere = new THREE.Sphere(
                    new THREE.Vector3(x, objectY, z),
                    2 * scale // Approximate radius based on scale
                );
            }
        }
    }, [trees, rocks, bushes, largeBush, treeDimensions, tempObject]);

    // Distance-based culling for performance
    useFrame(({ camera }) => {
        const cameraPosition = camera.position;
        const FAR_DISTANCE = 1000;
        const MID_DISTANCE = 500;

        // Apply culling for trees
        Object.entries(treeRefs).forEach(([treeType, refs]) => {
            if (!refs.trunk.current || !refs.trunk.current.boundingSphere ||
                !refs.foliage.current || !refs.foliage.current.boundingSphere) {
                return;
            }

            const trunkDistance = refs.trunk.current.boundingSphere.center.distanceTo(cameraPosition);
            const foliageDistance = refs.foliage.current.boundingSphere.center.distanceTo(cameraPosition);

            refs.trunk.current.visible = (trunkDistance < FAR_DISTANCE);
            refs.foliage.current.visible = (foliageDistance < FAR_DISTANCE);
        });

        // Apply culling for rocks and bushes
        if (rocksRef.current && rocksRef.current.boundingSphere) {
            const rocksDistance = rocksRef.current.boundingSphere.center.distanceTo(cameraPosition);
            rocksRef.current.visible = (rocksDistance < FAR_DISTANCE);
        }

        if (bushesRef.current && bushesRef.current.boundingSphere) {
            const bushesDistance = bushesRef.current.boundingSphere.center.distanceTo(cameraPosition);
            bushesRef.current.visible = (bushesDistance < FAR_DISTANCE);
        }

        // Large bush - individual mesh
        if (largeBushRef.current && largeBushRef.current.boundingSphere) {
            const largeDistance = largeBushRef.current.boundingSphere.center.distanceTo(cameraPosition);
            largeBushRef.current.visible = (largeDistance < FAR_DISTANCE);
        }
    });

    return (
        <group>
            {/* All tree types with proper culling */}
            {Object.entries(trees).map(([treeType, positions]) => {
                if (!positions.length) return null;

                // Get tree geometries
                const highGeo = treeGeometries.highDetail[treeType];
                const treeMat = treeMaterials[treeType];

                return (
                    <group key={treeType}>
                        <instancedMesh
                            ref={treeRefs[treeType].trunk}
                            args={[null, null, positions.length]}
                            frustumCulled={true}
                        >
                            <primitive object={highGeo.trunk} />
                            <primitive object={treeMat.trunk} />
                        </instancedMesh>

                        <instancedMesh
                            ref={treeRefs[treeType].foliage}
                            args={[null, null, positions.length]}
                            frustumCulled={true}
                        >
                            <primitive object={highGeo.foliage} />
                            <primitive object={treeMat.foliage} />
                        </instancedMesh>
                    </group>
                );
            })}

            {/* Rocks with instanced mesh */}
            <instancedMesh
                ref={rocksRef}
                args={[rockGeometry, rockMaterial, rocks.length]}
                frustumCulled={true}
            />

            {/* Bushes with instanced mesh */}
            <instancedMesh
                ref={bushesRef}
                args={[bushGeometry, bushMaterial, bushes.length]}
                frustumCulled={true}
            />

            {/* Special Large Bush */}
            {largeBush && (
                <mesh
                    ref={largeBushRef}
                    frustumCulled={true}
                >
                    <sphereGeometry args={[2, 10, 8]} />
                    <meshStandardMaterial
                        color="#2D5B0A"
                        roughness={0.6}
                        metalness={0.1}
                        flatShading={true}
                    />
                </mesh>
            )}
        </group>
    );
} 