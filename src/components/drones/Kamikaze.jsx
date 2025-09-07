import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import '../../styles/drone.css';
import { checkProjectileVehicleCollision, WEAPON_TYPES } from '../../utils/WeaponPhysics';
import { triggerExplosion } from '../effects/ExplosionsManager';
import { showDamageIndicator } from '../effects/DamageIndicator';
import { DRONE_TYPES } from '../../utils/GameContext';
import { Controls } from '../KeyboardControls';
import { useKamikaze } from '../../utils/GameContext';

export default function Kamikaze() {
    const droneRef = useRef();
    const cameraFollowRef = useRef(new THREE.Vector3(0, 0, 0));
    const velocityRef = useRef(new THREE.Vector3(0, 0, 0));
    const propellersRefs = useRef([]);
    const previousPositionRef = useRef(new THREE.Vector3(0, 10, 0)); // Store previous position for collision detection
    const collisionOccurred = useRef(false); // Track if a collision has occurred
    const mousePos = useRef({ x: 0, y: 0 });

    // First person view state from context
    const { isFirstPerson, toggleFirstPerson } = useKamikaze();

    // Initial rotation reference - with explicit YXZ rotation order
    const initialRotationRef = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));

    const [position, setPosition] = useState([0, 10, 0]);
    const [propellersActive, setPropellersActive] = useState(false);
    const [propellersSpeed, setPropellersSpeed] = useState(0);
    const { camera, scene, gl } = useThree();
    const [subscribeKeys, getKeys] = useKeyboardControls();

    const THRUST = 0.05;
    const MAX_SPEED = 3.0;
    const ROTATION_SPEED = 0.08;
    const FRICTION = 0.98;
    const GRAVITY = 0.003;
    const LIFT_POWER = 0.06;
    const STRAFE_POWER = 0.04; // Power for strafing left/right
    const DIVE_POWER = 0.020; // Power for slight downward movement with W

    // Function to handle collision with a vehicle
    const handleVehicleCollision = (hitPosition) => {
        if (collisionOccurred.current) return; // Prevent multiple collisions

        collisionOccurred.current = true;
        console.log("Kamikaze drone collided with vehicle!");

        // Trigger explosion at the collision point
        triggerExplosion(hitPosition, WEAPON_TYPES.KAMIKAZE);

        // Show damage indicator with the inner damage value from the KAMIKAZE weapon type
        showDamageIndicator(hitPosition, 80); // Updated to show 80 damage

        // Make drone inactive/invisible after collision
        if (droneRef.current) {
            droneRef.current.visible = false;
        }

        // Reset drone position after a delay (respawn)
        setTimeout(() => {
            if (droneRef.current) {
                droneRef.current.position.set(0, 10, 0);
                droneRef.current.visible = true;
                collisionOccurred.current = false;
                velocityRef.current.set(0, 0, 0);
                setPosition([0, 10, 0]);
                previousPositionRef.current.set(0, 10, 0);
            }
        }, 3000); // Respawn after 3 seconds
    };

    // Mouse move handler
    const handleMouseMove = (event) => {
        if (isFirstPerson) {
            // Get normalized device coordinates (NDC) between -1 and 1
            mousePos.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            mousePos.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }
    };

    useEffect(() => {
        // Handle first person view toggle with keypress
        const handleKeyDown = (e) => {
            if (e.code === 'KeyV') {
                toggleFirstPerson();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [toggleFirstPerson]);

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

    useFrame((state, delta) => {
        if (!droneRef.current || collisionOccurred.current) return;

        // Store previous position for collision detection
        previousPositionRef.current.copy(droneRef.current.position);

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

        // If in first person mode, use mouse for direction with smoother interpolation
        if (isFirstPerson) {
            // Use mouse position to influence the drone rotation with smoother interpolation
            const targetRotationY = rotation - mousePos.current.x * 0.15; // Increased sensitivity
            droneRef.current.rotation.y = THREE.MathUtils.lerp(
                droneRef.current.rotation.y,
                targetRotationY,
                0.15 // Smoother interpolation
            );

            // Pitch control with mouse Y and smoother interpolation
            const pitchAmount = Math.max(-0.4, Math.min(0.4, mousePos.current.y * 0.4)); // Increased range
            droneRef.current.rotation.x = THREE.MathUtils.lerp(
                droneRef.current.rotation.x,
                pitchAmount,
                0.15 // Smoother interpolation
            );
        } else {
            // Standard keyboard rotation for third person
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

        // Check for collision with vehicles
        if (scene && droneRef.current) {
            // Create a projectile-like object for collision detection
            const droneProjectile = {
                position: droneRef.current.position.clone(),
                previousPosition: previousPositionRef.current.clone(),
                type: WEAPON_TYPES.KAMIKAZE
            };

            // Check for vehicle collision
            const vehicleHit = checkProjectileVehicleCollision(droneProjectile, scene);
            if (vehicleHit) {
                handleVehicleCollision(vehicleHit.position);
                return; // Skip the rest of the frame processing
            }
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

        const targetPosition = new THREE.Vector3(
            droneRef.current.position.x,
            droneRef.current.position.y,
            droneRef.current.position.z
        );

        // Camera positioning based on view mode
        if (isFirstPerson) {
            // First person - position camera at drone's location with slight offset
            const fpOffset = new THREE.Vector3(0, 0.2, 0);
            const fpDirection = new THREE.Vector3(
                -Math.sin(rotation),
                droneRef.current.rotation.x * 0.5, // Look slightly up/down based on pitch
                -Math.cos(rotation)
            ).normalize();

            // Position the camera at the drone's position with a slight vertical offset
            camera.position.copy(targetPosition).add(fpOffset);

            // Look in the direction the drone is pointing
            camera.lookAt(
                camera.position.x + fpDirection.x,
                camera.position.y + fpDirection.y,
                camera.position.z + fpDirection.z
            );
        } else {
            // Third person - regular follow camera
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
        }

        setPosition([droneRef.current.position.x, droneRef.current.position.y, droneRef.current.position.z]);
    });

    return (
        <group ref={droneRef} position={position}>
            {/* Elongated Body */}
            <mesh castShadow receiveShadow position={[0, 0, 0]}>
                <boxGeometry args={[0.3, 0.1, 0.7]} />
                <meshStandardMaterial color="#ff3300" metalness={0.7} roughness={0.2} />
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
            <PropellerUnit position={[0.5, 0, 0.5]} index={0} propRef={(el) => propellersRefs.current[0] = el} active={propellersActive} speed={propellersSpeed} />
            <PropellerUnit position={[-0.5, 0, 0.5]} index={1} propRef={(el) => propellersRefs.current[1] = el} active={propellersActive} speed={propellersSpeed} counterClockwise={true} />
            <PropellerUnit position={[0.5, 0, -0.5]} index={2} propRef={(el) => propellersRefs.current[2] = el} active={propellersActive} speed={propellersSpeed} counterClockwise={true} />
            <PropellerUnit position={[-0.5, 0, -0.5]} index={3} propRef={(el) => propellersRefs.current[3] = el} active={propellersActive} speed={propellersSpeed} />

            {/* Bigger and Brighter Battery */}
            <mesh position={[0, 0.16, 0]}>
                <boxGeometry args={[0.25, 0.2, 0.35]} />
                <meshStandardMaterial color="#0000ff" />
            </mesh>

            <group>
                {/* Main Warhead Body */}
                <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.15, 0.25, 1.2, 8]} />
                    <meshStandardMaterial color="#004d00" metalness={0.7} roughness={0.5} />
                </mesh>

                {/* Pointed Nose Cone */}
                <mesh position={[0, -0.2, -0.8]} rotation={[-Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[0.25, 0.5, 8]} />
                    <meshStandardMaterial color="#2e7d32" metalness={0.7} roughness={0.5} />
                </mesh>
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
            <group ref={propellerRef} position={[0, 0.1, 0]}>
                <mesh castShadow>
                    <meshStandardMaterial color="#2b2d42" metalness={0.5} roughness={0.6} />
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={12}
                            itemSize={3}
                            array={new Float32Array([
                                0, 0, 0, 0.15, 0.02, -0.025, 0.15, -0.02, 0.025,
                                0, 0, 0, 0.15, -0.02, 0.025, 0.3, 0, 0,
                                0, 0, 0, 0.3, 0, 0, 0.15, 0.02, -0.025,
                                0.15, 0.02, -0.025, 0.3, 0, 0, 0.15, -0.02, 0.025,
                            ])}
                        />
                        <bufferAttribute
                            attach="attributes-normal"
                            count={12}
                            itemSize={3}
                            array={new Float32Array([
                                0, 1, 0, 0, 1, 0, 0, 1, 0,
                                0, 1, 0, 0, 1, 0, 0, 1, 0,
                                0, 1, 0, 0, 1, 0, 0, 1, 0,
                                0, -1, 0, 0, -1, 0, 0, -1, 0,
                            ])}
                        />
                    </bufferGeometry>
                </mesh>
                <mesh castShadow rotation={[0, Math.PI, 0]}>
                    <meshStandardMaterial color="#2b2d42" metalness={0.5} roughness={0.6} />
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={12}
                            itemSize={3}
                            array={new Float32Array([
                                0, 0, 0, 0.15, 0.02, -0.025, 0.15, -0.02, 0.025,
                                0, 0, 0, 0.15, -0.02, 0.025, 0.3, 0, 0,
                                0, 0, 0, 0.3, 0, 0, 0.15, 0.02, -0.025,
                                0.15, 0.02, -0.025, 0.3, 0, 0, 0.15, -0.02, 0.025,
                            ])}
                        />
                        <bufferAttribute
                            attach="attributes-normal"
                            count={12}
                            itemSize={3}
                            array={new Float32Array([
                                0, 1, 0, 0, 1, 0, 0, 1, 0,
                                0, 1, 0, 0, 1, 0, 0, 1, 0,
                                0, 1, 0, 0, 1, 0, 0, 1, 0,
                                0, -1, 0, 0, -1, 0, 0, -1, 0,
                            ])}
                        />
                    </bufferGeometry>
                </mesh>
                <mesh>
                    <sphereGeometry args={[0.04, 8, 8]} />
                    <meshStandardMaterial color="#2b2d42" metalness={0.7} roughness={0.2} />
                </mesh>
            </group>
        </group>
    );
}

function LandingLeg({ position }) {
    return (
        <mesh castShadow position={position}>
            <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
        </mesh>
    );
}

// KamikazeHUD component for first-person view
export function KamikazeHUD({ showHUD }) {
    const { isFirstPerson, toggleFirstPerson } = useKamikaze();

    if (!showHUD) return null;

    return (
        <div className="drone-hud kamikaze-hud">
            {/* Toggle button */}
            <button
                className={`first-person-toggle ${isFirstPerson ? 'active' : ''}`}
                onClick={toggleFirstPerson}
            >
                {isFirstPerson ? 'Exit First Person' : 'First Person View'}
            </button>

            {/* Crosshair for first-person view */}
            {isFirstPerson && (
                <div className="crosshair">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="2" fill="white" />
                        <line x1="12" y1="4" x2="12" y2="10" stroke="white" strokeWidth="1.25" />
                        <line x1="12" y1="14" x2="12" y2="20" stroke="white" strokeWidth="1.25" />
                        <line x1="4" y1="12" x2="10" y2="12" stroke="white" strokeWidth="1.25" />
                        <line x1="14" y1="12" x2="20" y2="12" stroke="white" strokeWidth="1.25" />
                    </svg>
                </div>
            )}

            {/* First person mode indicator */}
            {isFirstPerson && (
                <div className="fpv-indicator">
                    KAMIKAZE - FIRST PERSON VIEW
                </div>
            )}
        </div>
    );
}