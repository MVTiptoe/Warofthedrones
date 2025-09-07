import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useMapStore } from '../utils/MapStore';

// Constants for terrain configuration
export const ORIGINAL_TERRAIN_SIZE = 2000; // 2000m x 2000m
// Half width map will use the same height but half the width
export const HALF_WIDTH_TERRAIN_SIZE = { width: ORIGINAL_TERRAIN_SIZE / 2, height: ORIGINAL_TERRAIN_SIZE };
// Desert map will use the same dimensions as the original map
export const DESERT_TERRAIN_SIZE = { width: ORIGINAL_TERRAIN_SIZE, height: ORIGINAL_TERRAIN_SIZE };

const CHUNK_SIZE = 205; // Increased from 200 to add slight overlap
const OVERLAP_FACTOR = 5; // 5 units of overlap between chunks

export default function Terrain() {
    // Get current map type from the store
    const { currentMapType } = useMapStore();

    // Determine terrain size based on current map type
    const terrainSize = useMemo(() => {
        if (currentMapType === 'half-width') {
            return HALF_WIDTH_TERRAIN_SIZE;
        } else if (currentMapType === 'desert') {
            return DESERT_TERRAIN_SIZE;
        }
        return { width: ORIGINAL_TERRAIN_SIZE, height: ORIGINAL_TERRAIN_SIZE };
    }, [currentMapType]);

    // Calculate chunks count
    const chunksCount = useMemo(() => {
        if (currentMapType === 'half-width') {
            return {
                x: Math.ceil(terrainSize.width / (CHUNK_SIZE - OVERLAP_FACTOR)),
                z: Math.ceil(terrainSize.height / (CHUNK_SIZE - OVERLAP_FACTOR))
            };
        }
        const count = Math.ceil(ORIGINAL_TERRAIN_SIZE / (CHUNK_SIZE - OVERLAP_FACTOR));
        return { x: count, z: count };
    }, [currentMapType, terrainSize]);

    const SEGMENTS = 200; // Segment resolution for the entire terrain
    const segmentsPerChunk = useMemo(() => ({
        x: Math.floor(SEGMENTS / chunksCount.x),
        z: Math.floor(SEGMENTS / chunksCount.z)
    }), [chunksCount]);

    // Create the terrain using instanced rendering for performance
    // Use a single geometry and material for the entire terrain
    const planeGeometry = useMemo(() => {
        return new THREE.PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE, segmentsPerChunk.x, segmentsPerChunk.z);
    }, [segmentsPerChunk]);

    // Use a simple material with optimized settings
    const planeMaterial = useMemo(() => {
        let color, roughness, metalness;

        // Set material properties based on map type
        if (currentMapType === 'desert') {
            color = '#DEB887'; // Sandy color for desert
            roughness = 0.9;
            metalness = 0.05;
        } else {
            color = '#4d7f38'; // Green color for the ground
            roughness = 0.8;
            metalness = 0.1;
        }

        return new THREE.MeshStandardMaterial({
            color: color,
            roughness: roughness,
            metalness: metalness,
            flatShading: false // Disable for smoother appearance
        });
    }, [currentMapType]);

    // Use instanced mesh for efficient rendering of multiple chunks
    const instancedMeshRef = useRef();
    const tempObject = useMemo(() => new THREE.Object3D(), []);

    // Create the chunks based on the terrain size
    const chunks = useMemo(() => {
        const result = [];

        if (currentMapType === 'half-width') {
            const halfWidth = terrainSize.width / 2;
            const halfHeight = terrainSize.height / 2;
            const chunkOffset = (CHUNK_SIZE - OVERLAP_FACTOR) / 2;

            for (let x = 0; x < chunksCount.x; x++) {
                for (let z = 0; z < chunksCount.z; z++) {
                    result.push({
                        position: [
                            -halfWidth + x * (CHUNK_SIZE - OVERLAP_FACTOR) + chunkOffset,
                            0,
                            -halfHeight + z * (CHUNK_SIZE - OVERLAP_FACTOR) + chunkOffset
                        ],
                        rotation: [-Math.PI / 2, 0, 0] // Rotate to make it horizontal
                    });
                }
            }
        } else {
            const halfSize = terrainSize.width / 2;
            const chunkOffset = (CHUNK_SIZE - OVERLAP_FACTOR) / 2;

            for (let x = 0; x < chunksCount.x; x++) {
                for (let z = 0; z < chunksCount.z; z++) {
                    result.push({
                        position: [
                            -halfSize + x * (CHUNK_SIZE - OVERLAP_FACTOR) + chunkOffset,
                            0,
                            -halfSize + z * (CHUNK_SIZE - OVERLAP_FACTOR) + chunkOffset
                        ],
                        rotation: [-Math.PI / 2, 0, 0] // Rotate to make it horizontal
                    });
                }
            }
        }

        return result;
    }, [currentMapType, terrainSize, chunksCount]);

    // Setup the instanced mesh on the first render
    useFrame(() => {
        if (instancedMeshRef.current) {
            chunks.forEach((chunk, i) => {
                const [x, y, z] = chunk.position;
                const [rx, ry, rz] = chunk.rotation;

                tempObject.position.set(x, y, z);
                tempObject.rotation.set(rx, ry, rz);
                tempObject.updateMatrix();

                instancedMeshRef.current.setMatrixAt(i, tempObject.matrix);
            });

            instancedMeshRef.current.instanceMatrix.needsUpdate = true;

            // Only need to run this once to set up the instances
            return null;
        }
    }, [chunks]);

    return (
        <>
            {/* Use an instanced mesh for all chunks */}
            <instancedMesh
                ref={instancedMeshRef}
                args={[planeGeometry, planeMaterial, chunks.length]}
            />
        </>
    );
} 