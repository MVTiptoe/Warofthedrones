import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Constants for original terrain configuration
export const ORIGINAL_TERRAIN_SIZE = 2000; // 2000m x 2000m
const CHUNK_SIZE = 205; // Increased from 200 to add slight overlap
const OVERLAP_FACTOR = 5; // 5 units of overlap between chunks

export default function OriginalTerrain() {
    // Calculate chunks count
    const terrainSize = ORIGINAL_TERRAIN_SIZE;
    const chunksCount = useMemo(() => {
        const count = Math.ceil(terrainSize / (CHUNK_SIZE - OVERLAP_FACTOR));
        return { x: count, z: count };
    }, [terrainSize]);

    const SEGMENTS = 200; // Segment resolution for the entire terrain
    const segmentsPerChunk = useMemo(() => ({
        x: Math.floor(SEGMENTS / chunksCount.x),
        z: Math.floor(SEGMENTS / chunksCount.z)
    }), [chunksCount]);

    // Create the terrain geometry
    const planeGeometry = useMemo(() => {
        return new THREE.PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE, segmentsPerChunk.x, segmentsPerChunk.z);
    }, [segmentsPerChunk]);

    // Green, grassy material for original terrain
    const planeMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: '#4d7f38', // Green color for the ground
            roughness: 0.8,
            metalness: 0.1,
            flatShading: false // Disable for smoother appearance
        });
    }, []);

    // Use instanced mesh for efficient rendering of multiple chunks
    const instancedMeshRef = useRef();
    const tempObject = useMemo(() => new THREE.Object3D(), []);

    // Create the chunks based on the terrain size
    const chunks = useMemo(() => {
        const result = [];
        const halfSize = terrainSize / 2;
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

        return result;
    }, [terrainSize, chunksCount]);

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
        <instancedMesh
            ref={instancedMeshRef}
            args={[planeGeometry, planeMaterial, chunks.length]}
            receiveShadow
        />
    );
} 