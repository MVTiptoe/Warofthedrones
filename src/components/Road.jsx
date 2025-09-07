import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ORIGINAL_TERRAIN_SIZE, HALF_WIDTH_TERRAIN_SIZE } from './Terrain';
import { useMapStore } from '../utils/MapStore';

// Road constants
export const ROAD_WIDTH = 88;
export const ROAD_EXTENSION = 8;
export const TOTAL_ROAD_WIDTH = ROAD_WIDTH + (ROAD_EXTENSION * 2); // Total width including extensions
export const ROAD_SPACING = 300; // Space between the two parallel roads (increased from 200 to 300, 50% more)
export const LANE_WIDTH = ROAD_WIDTH / 4; // Now 4 lanes per road
export const LANE_MARKER_WIDTH = 0.75; // Increased from 0.5 (1.5x width)
export const LANE_MARKER_LENGTH = 5;
export const LANE_MARKER_GAP = 10;
export const ROAD_HEIGHT = 0.5; // Increased from 0.11 to prevent z-fighting
export const ROADSIDE_STRIPE_WIDTH = 9; // Width of brown stripes alongside the road (increased from 6 to 9, 1.5x wider)

export default function Road({ mapType = 'original' }) {
    // Get current map type from store
    const { currentMapType } = useMapStore();

    // Get the terrain size based on the current map type
    const terrainSize = useMemo(() => {
        if (mapType === 'half-width') {
            return HALF_WIDTH_TERRAIN_SIZE;
        }
        return { width: ORIGINAL_TERRAIN_SIZE, height: ORIGINAL_TERRAIN_SIZE };
    }, [mapType]);

    // Create the road shape with a plane along the X axis (now wider with extensions)
    const roadGeometry = useMemo(() => {
        return new THREE.PlaneGeometry(terrainSize.width, ROAD_WIDTH, 1, 1);
    }, [terrainSize]);

    // Create the road extension geometry
    const roadExtensionGeometry = useMemo(() => {
        return new THREE.PlaneGeometry(terrainSize.width, ROAD_EXTENSION, 1, 1);
    }, [terrainSize]);

    // Create asphalt color based on map type
    const asphaltColor = useMemo(() => {
        return mapType === 'desert' ? '#444444' : '#333333'; // Slightly lighter for desert
    }, [mapType]);

    // Create the asphalt material
    const asphaltMaterial = useMemo(() =>
        new THREE.MeshStandardMaterial({
            color: asphaltColor,
            roughness: 0.7,
            metalness: 0.1,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: 1
        }),
        [asphaltColor]
    );

    // Create the center line material (yellow)
    const centerLineMaterial = useMemo(() =>
        new THREE.MeshStandardMaterial({
            color: '#FFCC00',
            roughness: 0.5,
            metalness: 0.1,
            polygonOffset: true,
            polygonOffsetFactor: -2,
            polygonOffsetUnits: 1
        }),
        []
    );

    // Create the side line material (white)
    const sideLineMaterial = useMemo(() =>
        new THREE.MeshStandardMaterial({
            color: '#FFFFFF',
            roughness: 0.5,
            metalness: 0.1,
            polygonOffset: true,
            polygonOffsetFactor: -2,
            polygonOffsetUnits: 1
        }),
        []
    );

    // Create the roadside stripe material (based on map type)
    const roadstripeColor = useMemo(() => {
        return mapType === 'desert' ? '#A67F4E' : '#8B5A2B'; // More orange-toned for desert
    }, [mapType]);

    // Create the roadside stripe material
    const roadsideStripeMaterial = useMemo(() =>
        new THREE.MeshStandardMaterial({
            color: roadstripeColor,
            roughness: 0.85,
            metalness: 0.02,
            polygonOffset: true,
            polygonOffsetFactor: -1.5,
            polygonOffsetUnits: 1
        }),
        [roadstripeColor]
    );

    // Create the lane markers (dashed lines)
    const laneMarkers = useMemo(() => {
        const markers = [];
        const roadLength = terrainSize.width;
        const totalMarkers = Math.floor(roadLength / (LANE_MARKER_LENGTH + LANE_MARKER_GAP));
        const startOffset = -roadLength / 2;

        for (let i = 0; i < totalMarkers; i++) {
            const markerPosition = startOffset + (i * (LANE_MARKER_LENGTH + LANE_MARKER_GAP)) + LANE_MARKER_LENGTH / 2;
            markers.push({
                position: markerPosition
            });
        }

        return markers;
    }, [terrainSize]);

    // Component to render a single road with all its markings
    const SingleRoad = ({ zPosition }) => (
        <group position={[0, ROAD_HEIGHT, zPosition]}>
            {/* Main road surface */}
            <mesh
                geometry={roadGeometry}
                material={asphaltMaterial}
                rotation={[-Math.PI / 2, 0, 0]}
            />

            {/* Left road extension */}
            <mesh
                position={[0, 0, -ROAD_WIDTH / 2 - ROAD_EXTENSION / 2]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <primitive object={roadExtensionGeometry} />
                <primitive object={asphaltMaterial} />
            </mesh>

            {/* Right road extension */}
            <mesh
                position={[0, 0, ROAD_WIDTH / 2 + ROAD_EXTENSION / 2]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <primitive object={roadExtensionGeometry} />
                <primitive object={asphaltMaterial} />
            </mesh>

            {/* Left brown stripe */}
            <mesh
                position={[0, 0.01, -TOTAL_ROAD_WIDTH / 2 - ROADSIDE_STRIPE_WIDTH / 2]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <planeGeometry args={[terrainSize.width, ROADSIDE_STRIPE_WIDTH]} />
                <primitive object={roadsideStripeMaterial} />
            </mesh>

            {/* Right brown stripe */}
            <mesh
                position={[0, 0.01, TOTAL_ROAD_WIDTH / 2 + ROADSIDE_STRIPE_WIDTH / 2]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <planeGeometry args={[terrainSize.width, ROADSIDE_STRIPE_WIDTH]} />
                <primitive object={roadsideStripeMaterial} />
            </mesh>

            {/* Center line (solid yellow) */}
            <mesh
                position={[0, 0.02, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <planeGeometry args={[terrainSize.width, LANE_MARKER_WIDTH]} />
                <primitive object={centerLineMaterial} />
            </mesh>

            {/* Left edge line (solid white) */}
            <mesh
                position={[0, 0.02, -ROAD_WIDTH / 2 + 0.5]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <planeGeometry args={[terrainSize.width, LANE_MARKER_WIDTH]} />
                <primitive object={sideLineMaterial} />
            </mesh>

            {/* Right edge line (solid white) */}
            <mesh
                position={[0, 0.02, ROAD_WIDTH / 2 - 0.5]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <planeGeometry args={[terrainSize.width, LANE_MARKER_WIDTH]} />
                <primitive object={sideLineMaterial} />
            </mesh>

            {/* Lane markers (dashed white lines) between lanes */}
            {/* Left side - between outer and inner lane */}
            {laneMarkers.map((marker, index) => (
                <mesh
                    key={`left-outer-${index}`}
                    position={[marker.position, 0.02, -ROAD_WIDTH / 4]}
                    rotation={[-Math.PI / 2, 0, 0]}
                >
                    <planeGeometry args={[LANE_MARKER_LENGTH, LANE_MARKER_WIDTH]} />
                    <primitive object={sideLineMaterial} />
                </mesh>
            ))}

            {/* Right side - between outer and inner lane */}
            {laneMarkers.map((marker, index) => (
                <mesh
                    key={`right-outer-${index}`}
                    position={[marker.position, 0.02, ROAD_WIDTH / 4]}
                    rotation={[-Math.PI / 2, 0, 0]}
                >
                    <planeGeometry args={[LANE_MARKER_LENGTH, LANE_MARKER_WIDTH]} />
                    <primitive object={sideLineMaterial} />
                </mesh>
            ))}
        </group>
    );

    return (
        <>
            {/* Upper road */}
            <SingleRoad zPosition={ROAD_SPACING / 2} />

            {/* Lower road */}
            <SingleRoad zPosition={-ROAD_SPACING / 2} />
        </>
    );
} 