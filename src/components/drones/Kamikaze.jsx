import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import '../../styles/drone.css';
import { WEAPON_TYPES, checkProjectileVehicleCollision } from '../../utils/WeaponPhysics';
import { triggerExplosion } from '../effects/ExplosionsManager';
import { showDamageIndicator } from '../effects/DamageIndicator';
import { useVehicleHealthStore } from '../../utils/VehicleHealthSystem';

// Define the Kamikaze drone weapon type
const KAMIKAZE_WEAPON_TYPE = 'KAMIKAZE_DRONE';

export default function Kamikaze() {
    const droneRef = useRef();
    const cameraFollowRef = useRef(new THREE.Vector3(0, 0, 0));
    const velocityRef = useRef(new THREE.Vector3(0, 0, 0));
    const propellersRefs = useRef([]);

    // Initial rotation reference - with explicit YXZ rotation order
    const initialRotationRef = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));

    const [position, setPosition] = useState([0, 10, 0]);
    const [propellersActive, setPropellersActive] = useState(false);
    const [propellersSpeed, setPropellersSpeed] = useState(0);
    const { camera, scene } = useThree();
    const [subscribeKeys, getKeys] = useKeyboardControls();

    // Kamikaze mode state
    const [kamikazeMode, setKamikazeMode] = useState(false);
    const [kamikazeSpeed, setKamikazeSpeed] = useState(0);
    const [kamikazeDirection, setKamikazeDirection] = useState(new THREE.Vector3());
    const [isDestroyed, setIsDestroyed] = useState(false);

    // Kamikaze damage parameters
    const KAMIKAZE_INNER_RADIUS = 15;
    const KAMIKAZE_OUTER_RADIUS = 30;
    const KAMIKAZE_INNER_DAMAGE = 100;
    const KAMIKAZE_OUTER_DAMAGE = 40;

    // Access vehicle health store for damage application
    const applyDamage = useVehicleHealthStore(state => state.applyDamage);

    const THRUST = 0.05;
    const MAX_SPEED = 9.0;
    const ROTATION_SPEED = 0.05;
    const FRICTION = 0.98;
    const GRAVITY = 0.003;
    const LIFT_POWER = 0.08;
    const STRAFE_POWER = 0.04; // Power for strafing left/right
    const DIVE_POWER = 0.015; // Power for slight downward movement with W
    const KAMIKAZE_MAX_SPEED = 20.0; // Maximum speed for kamikaze mode

    useEffect(() => {
        // Setup camera initial position
        camera.position.set(0, 15, 20);
        camera.lookAt(0, 10, 0);

        // Ensure drone has proper initial rotation with correct order
        if (droneRef.current) {
            // Set rotation order explicitly first
            droneRef.current.rotation.order = 'YXZ';

            // Set individual rotation components
            droneRef.current.rotation.x = initialRotationRef.current.x;
            droneRef.current.rotation.y = initialRotationRef.current.y;
            droneRef.current.rotation.z = initialRotationRef.current.z;
        }

        return subscribeKeys(
            state => state,
            state => {
                const { forward, backward, left, right, up, down, strafeLeft, strafeRight } = state;
                if (forward || backward || left || right || up || down || strafeLeft || strafeRight) {
                    setPropellersActive(true);
                    setPropellersSpeed(1.0);
                } else {
                    setPropellersSpeed(0.5);
                }
            }
        );
    }, [camera, subscribeKeys]);

    // Handler for activating kamikaze mode
    const activateKamikazeMode = () => {
        if (kamikazeMode || isDestroyed) return;

        // Get current forward direction
        const rotation = droneRef.current.rotation.y;
        const forwardDirection = new THREE.Vector3(
            -Math.sin(rotation),
            0,
            -Math.cos(rotation)
        );

        // Activate kamikaze mode
        setKamikazeMode(true);
        setKamikazeDirection(forwardDirection);
        setPropellersActive(false); // Disable propellers for visual effect

        // Play activation sound or effect here if desired
        console.log("Kamikaze mode activated!");
    };

    // Handle collisions with vehicles
    const checkVehicleCollisions = () => {
        if (!droneRef.current || isDestroyed) return false;

        // Create a dummy projectile object to use with the collision detection system
        const dummyProjectile = {
            position: new THREE.Vector3().copy(droneRef.current.position),
            previousPosition: new THREE.Vector3().copy(droneRef.current.position).sub(
                velocityRef.current.clone().multiplyScalar(1.0)
            ),
            type: KAMIKAZE_WEAPON_TYPE
        };

        // Check for collision with vehicles
        const collision = checkProjectileVehicleCollision(dummyProjectile, scene);

        if (collision) {
            // Create explosion at impact point
            triggerExplosion(
                new THREE.Vector3().copy(droneRef.current.position),
                KAMIKAZE_WEAPON_TYPE
            );

            // Apply damage to the hit vehicle
            if (collision.vehicle && collision.vehicle.userData.vehicleId) {
                // Apply damage to the vehicle
                applyDamage(
                    collision.vehicle.userData.vehicleId,
                    KAMIKAZE_INNER_DAMAGE,
                    collision.hitLocation || 'body',
                    KAMIKAZE_WEAPON_TYPE
                );

                // Show damage indicator
                showDamageIndicator(collision.position, KAMIKAZE_INNER_DAMAGE);

                // Apply area of effect damage to nearby vehicles
                applyAreaDamage(droneRef.current.position);
            }

            // Destroy the drone
            setIsDestroyed(true);
            return true;
        }

        return false;
    };

    // Apply area damage to all vehicles in range
    const applyAreaDamage = (center) => {
        // This would normally scan the scene for vehicles within the radius,
        // calculate distance-based damage and apply it
        // For simplicity, we'll assume the collision system handles this
        console.log("Area damage applied around:", center);
    };

    useFrame((state, delta) => {
        if (!droneRef.current || isDestroyed) return;

        // Handle kamikaze mode if active
        if (kamikazeMode) {
            // Increase speed gradually until max speed
            setKamikazeSpeed(prev => Math.min(prev + 0.2, KAMIKAZE_MAX_SPEED));

            // Apply kamikaze velocity
            velocityRef.current.copy(kamikazeDirection.clone().multiplyScalar(kamikazeSpeed));

            // Move drone forward
            droneRef.current.position.add(velocityRef.current.clone().multiplyScalar(delta * 60));

            // Check for collisions
            const hasCollided = checkVehicleCollisions();
            if (hasCollided) {
                // Stop if collision occurred
                return;
            }

            // Update position state
            setPosition([
                droneRef.current.position.x,
                droneRef.current.position.y,
                droneRef.current.position.z
            ]);

            // Update camera to follow
            updateCamera();
            return;
        }

        const { forward, backward, left, right, up, down, strafeLeft, strafeRight, shift } = getKeys();
        const rotation = droneRef.current.rotation.y;
        const forwardVector = new THREE.Vector3(-Math.sin(rotation), 0, -Math.cos(rotation));
        const rightVector = new THREE.Vector3(Math.cos(rotation), 0, -Math.sin(rotation));

        // Apply forward movement and slight downward movement when pressing W
        if (forward) {
            velocityRef.current.add(forwardVector.clone().multiplyScalar(THRUST * 2)); // 2x speed for forward
            velocityRef.current.y -= DIVE_POWER; // Slight downward movement
        }
        if (backward) {
            velocityRef.current.add(forwardVector.clone().multiplyScalar(-THRUST));
            velocityRef.current.y += DIVE_POWER * 0.8; // Slight upward movement when pressing S
        }

        if (left) {
            droneRef.current.rotation.y = THREE.MathUtils.lerp(
                droneRef.current.rotation.y,
                droneRef.current.rotation.y + ROTATION_SPEED * 3,
                0.2
            );
        }
        if (right) {
            droneRef.current.rotation.y = THREE.MathUtils.lerp(
                droneRef.current.rotation.y,
                droneRef.current.rotation.y - ROTATION_SPEED * 3,
                0.2
            );
        }

        if (strafeLeft) velocityRef.current.add(rightVector.clone().multiplyScalar(-STRAFE_POWER));
        if (strafeRight) velocityRef.current.add(rightVector.clone().multiplyScalar(STRAFE_POWER));

        if (up) velocityRef.current.y += LIFT_POWER;
        else if (down) {
            // If shift is pressed, go down 50% faster
            const downSpeed = shift ? LIFT_POWER * 1.5 : LIFT_POWER;
            velocityRef.current.y -= downSpeed;
        }
        else velocityRef.current.y -= GRAVITY;

        velocityRef.current.multiplyScalar(FRICTION);
        const speed = velocityRef.current.length();
        if (speed > MAX_SPEED) velocityRef.current.normalize().multiplyScalar(MAX_SPEED);
        droneRef.current.position.add(velocityRef.current);
        if (droneRef.current.position.y < 1) {
            droneRef.current.position.y = 1;
            velocityRef.current.y = 0;
        }

        // SIMPLIFIED QUATERNION-BASED TILTING APPROACH
        // Using YXZ rotation order consistently (Yaw, Pitch, Roll)

        // Calculate target tilt values based on input keys
        let targetForwardTilt = 0;
        let targetSideTilt = 0;

        // Direct forward/backward tilt based on keys - REVERSED VALUES
        if (forward) targetForwardTilt = -0.3;  // Reversed: Tilt backward when W pressed
        if (backward) targetForwardTilt = 0.3; // Reversed: Tilt forward when S pressed

        // Direct side tilt based on strafe keys
        if (strafeLeft) targetSideTilt = 0.2;  // Tilt left when A pressed
        if (strafeRight) targetSideTilt = -0.2; // Tilt right when D pressed

        // Keep existing yaw (y-axis rotation)
        const currentYaw = droneRef.current.rotation.y;

        // Get current quaternion (preserves rotation order)
        const currentQuat = new THREE.Quaternion();
        currentQuat.setFromEuler(droneRef.current.rotation);

        // Create a target quaternion with desired tilts
        const targetEuler = new THREE.Euler(targetForwardTilt, currentYaw, targetSideTilt, 'YXZ');
        const targetQuat = new THREE.Quaternion();
        targetQuat.setFromEuler(targetEuler);

        // Smoothly interpolate between current and target quaternions
        const slerpQuat = new THREE.Quaternion().copy(currentQuat);
        slerpQuat.slerp(targetQuat, 0.1);

        // Apply the interpolated quaternion back to the drone
        droneRef.current.setRotationFromQuaternion(slerpQuat);

        updateCamera();
        setPosition([droneRef.current.position.x, droneRef.current.position.y, droneRef.current.position.z]);
    });

    // Extract camera update logic
    const updateCamera = () => {
        const targetPosition = new THREE.Vector3(
            droneRef.current.position.x,
            droneRef.current.position.y,
            droneRef.current.position.z
        );
        const rotation = droneRef.current.rotation.y;

        // Fixed camera parameters
        const cameraDistance = 15;
        const cameraHeight = 6;

        // Calculate camera position behind the drone
        const cameraOffset = new THREE.Vector3(
            Math.sin(rotation) * cameraDistance,
            cameraHeight,
            Math.cos(rotation) * cameraDistance
        );

        // Set camera position
        camera.position.copy(targetPosition).add(cameraOffset);

        // Make camera look at the drone
        camera.lookAt(
            droneRef.current.position.x,
            droneRef.current.position.y + 0.5,
            droneRef.current.position.z
        );
    };

    // Setup keyboard event listener for kamikaze activation
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Activate kamikaze mode with spacebar
            if (e.code === 'Space' && !kamikazeMode && !isDestroyed) {
                activateKamikazeMode();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [kamikazeMode, isDestroyed]);

    // Don't render if destroyed
    if (isDestroyed) return null;

    return (
        <group ref={droneRef} position={position}>
            {/* Elongated Body */}
            <mesh castShadow receiveShadow position={[0, 0, 0]}>
                <boxGeometry args={[0.3, 0.1, 0.7]} />
                <meshStandardMaterial color={kamikazeMode ? "#ff0000" : "#ff3300"} metalness={0.7} roughness={0.2} />
            </mesh>

            {/* Arms */}
            <mesh castShadow position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
                <boxGeometry args={[1.414, 0.03, 0.05]} />
                <meshStandardMaterial color="#4a4a4a" metalness={0.4} roughness={0.6} />
            </mesh>
            <mesh castShadow position={[0, 0, 0]} rotation={[0, -Math.PI / 4, 0]}>
                <boxGeometry args={[1.414, 0.03, 0.05]} />
                <meshStandardMaterial color="#4a4a4a" metalness={0.4} roughness={0.6} />
            </mesh>

            {/* Landing Gear */}
            <LandingLeg position={[0.1, -0.1, 0.4]} />
            <LandingLeg position={[-0.1, -0.1, 0.4]} />
            <LandingLeg position={[0.1, -0.1, -0.4]} />
            <LandingLeg position={[-0.1, -0.1, -0.4]} />

            {/* Propellers and Motors */}
            <PropellerUnit position={[0.5, 0, 0.5]} index={0} propRef={(el) => (propellersRefs.current[0] = el)} active={propellersActive && !kamikazeMode} speed={propellersSpeed} />
            <PropellerUnit position={[-0.5, 0, 0.5]} index={1} propRef={(el) => (propellersRefs.current[1] = el)} active={propellersActive && !kamikazeMode} speed={propellersSpeed} counterClockwise />
            <PropellerUnit position={[0.5, 0, -0.5]} index={2} propRef={(el) => (propellersRefs.current[2] = el)} active={propellersActive && !kamikazeMode} speed={propellersSpeed} counterClockwise />
            <PropellerUnit position={[-0.5, 0, -0.5]} index={3} propRef={(el) => (propellersRefs.current[3] = el)} active={propellersActive && !kamikazeMode} speed={propellersSpeed} />

            {/* Bigger and Brighter Battery */}
            <mesh position={[0, 0.16, 0]}>
                <boxGeometry args={[0.25, 0.2, 0.35]} />
                <meshStandardMaterial color={kamikazeMode ? "#ff0000" : "#0000ff"} emissive={kamikazeMode ? "#ff0000" : "#000000"} emissiveIntensity={kamikazeMode ? 0.8 : 0} />
            </mesh>

            <group>
                {/* Main Warhead Body */}
                <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.15, 0.25, 1.2, 8]} />
                    <meshStandardMaterial color={kamikazeMode ? "#990000" : "#004d00"} metalness={0.7} roughness={0.5} />
                </mesh>

                {/* Pointed Nose Cone */}
                <mesh position={[0, -0.2, -0.8]} rotation={[-Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[0.25, 0.5, 8]} />
                    <meshStandardMaterial color={kamikazeMode ? "#cc0000" : "#2e7d32"} metalness={0.7} roughness={0.5} />
                </mesh>

                {/* Add blinking lights when in kamikaze mode */}
                {kamikazeMode && (
                    <>
                        <pointLight
                            position={[0, 0.3, 0]}
                            color="#ff0000"
                            intensity={10}
                            distance={3}
                            decay={2}
                        />
                        <mesh position={[0, 0.3, 0]}>
                            <sphereGeometry args={[0.1, 8, 8]} />
                            <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} />
                        </mesh>
                    </>
                )}
            </group>
        </group>
    );
}

function PropellerUnit({ position, index, propRef, active = true, speed = 1.0, counterClockwise = false }) {
    const propellerRef = useRef();
    const direction = counterClockwise ? -1 : 1;

    useFrame(() => {
        if (propellerRef.current && active) propellerRef.current.rotation.y += 0.5 * speed * direction;
        if (propRef) propRef(propellerRef.current);
    });

    return (
        <group position={position}>
            {/* Motor Housing - Adjusted size for compactness */}
            <mesh castShadow receiveShadow>
                <cylinderGeometry args={[0.05, 0.07, 0.1, 12]} />
                <meshStandardMaterial color="#2b2d42" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Motor Top - Adjusted size for compactness */}
            <mesh castShadow position={[0, 0.05, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.02, 12]} />
                <meshStandardMaterial color="#8d99ae" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Propeller */}
            <group ref={propellerRef} position={[0, 0.07, 0]}>
                <mesh castShadow rotation={[0, 0, 0]}>
                    <boxGeometry args={[0.4, 0.02, 0.05]} />
                    <meshStandardMaterial color="#2b2d42" metalness={0.5} roughness={0.6} />
                </mesh>
                <mesh castShadow rotation={[0, Math.PI / 2, 0]}>
                    <boxGeometry args={[0.4, 0.02, 0.05]} />
                    <meshStandardMaterial color="#2b2d42" metalness={0.5} roughness={0.6} />
                </mesh>
            </group>
        </group>
    );
}

function LandingLeg({ position }) {
    return (
        <group position={position}>
            {/* Vertical part */}
            <mesh castShadow>
                <boxGeometry args={[0.04, 0.2, 0.04]} />
                <meshStandardMaterial color="#2b2d42" metalness={0.5} roughness={0.6} />
            </mesh>
            {/* Horizontal part */}
            <mesh castShadow position={[0, -0.1, 0.05]}>
                <boxGeometry args={[0.04, 0.04, 0.14]} />
                <meshStandardMaterial color="#2b2d42" metalness={0.5} roughness={0.6} />
            </mesh>
        </group>
    );
}