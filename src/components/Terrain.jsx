import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Constants for terrain configuration
export const TERRAIN_SIZE = 2000; // 2000m x 2000m (doubled from 1000)
const CHUNK_SIZE = 205; // Increased from 200 to add slight overlap
const OVERLAP_FACTOR = 5; // 5 units of overlap between chunks
const CHUNKS_COUNT = Math.ceil(TERRAIN_SIZE / (CHUNK_SIZE - OVERLAP_FACTOR));
const SEGMENTS = 200; // Segment resolution for the entire terrain
const SEGMENTS_PER_CHUNK = Math.floor(SEGMENTS / CHUNKS_COUNT);

export default function Terrain() {
    // Create the terrain using instanced rendering for performance
    // Use a single geometry and material for the entire terrain
    const planeGeometry = useMemo(() =>
        new THREE.PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE, SEGMENTS_PER_CHUNK, SEGMENTS_PER_CHUNK),
        []
    );

    // Use a simple material with optimized settings
    const planeMaterial = useMemo(() =>
        new THREE.MeshStandardMaterial({
            color: '#4d7f38', // Green color for the ground
            roughness: 0.8,
            metalness: 0.1,
            flatShading: false // Disable for smoother appearance
        }),
        []
    );

    // Use instanced mesh for efficient rendering of multiple chunks
    const instancedMeshRef = useRef();
    const tempObject = useMemo(() => new THREE.Object3D(), []);

    // Create the chunks based on the terrain size
    const chunks = useMemo(() => {
        const result = [];
        const halfSize = TERRAIN_SIZE / 2;
        const chunkOffset = (CHUNK_SIZE - OVERLAP_FACTOR) / 2;

        for (let x = 0; x < CHUNKS_COUNT; x++) {
            for (let z = 0; z < CHUNKS_COUNT; z++) {
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
    }, []);

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
    }, []);

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