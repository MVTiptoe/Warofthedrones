import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Constants for desert terrain configuration
export const DESERT_TERRAIN_SIZE = 2000; // 2000m x 2000m
const CHUNK_SIZE = 205; // Increased from 200 to add slight overlap
const OVERLAP_FACTOR = 5; // 5 units of overlap between chunks

export default function DesertTerrain() {
    // Calculate chunks count
    const terrainSize = DESERT_TERRAIN_SIZE;
    const chunksCount = useMemo(() => {
        const count = Math.ceil(terrainSize / (CHUNK_SIZE - OVERLAP_FACTOR));
        return { x: count, z: count };
    }, [terrainSize]);

    const SEGMENTS = 200; // Segment resolution for the entire terrain
    const segmentsPerChunk = useMemo(() => ({
        x: Math.floor(SEGMENTS / chunksCount.x),
        z: Math.floor(SEGMENTS / chunksCount.z)
    }), [chunksCount]);

    // Add some noise to the terrain to create sand dune effect
    const planeGeometry = useMemo(() => {
        const geometry = new THREE.PlaneGeometry(
            CHUNK_SIZE,
            CHUNK_SIZE,
            segmentsPerChunk.x,
            segmentsPerChunk.z
        );

        // Create sand dune effect by adding subtle height variation
        // This creates the appearance of rolling sand dunes
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];

            // Create sand dune effect
            const noise1 = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2;
            const noise2 = Math.sin(x * 0.1 + 0.3) * Math.sin(z * 0.1 + 0.1) * 1.5;
            const noise3 = Math.cos(x * 0.2 + 1.1) * Math.sin(z * 0.15 + 0.5) * 1;

            // Apply smoother, more rounded dunes for a desert
            vertices[i + 1] = noise1 + noise2 + noise3;
        }

        // Update normals for proper lighting
        geometry.computeVertexNormals();

        return geometry;
    }, [segmentsPerChunk]);

    // Sandy material for desert terrain
    const planeMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: '#DEB887', // Sandy color
            roughness: 0.9,
            metalness: 0.05,
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