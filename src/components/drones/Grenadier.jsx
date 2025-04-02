import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import '../../styles/drone.css';
import { WEAPON_TYPES, checkProjectileVehicleCollision } from '../../utils/WeaponPhysics';
import { triggerExplosion } from '../effects/ExplosionsManager';
import { showDamageIndicator } from '../effects/DamageIndicator';
import { getKeys } from '../../utils/KeyboardControls';
import { triggerShotgunFire } from '../effects/ShotgunEffectsManager';

// Constants for object pooling
const POOL_SIZE = {
    [WEAPON_TYPES.SHOTGUN]: 16,  // Increased from 8
    [WEAPON_TYPES.GRENADE]: 3,
    [WEAPON_TYPES.DART]: 3
};

export default function Grenadier() {
    // References
    const droneRef = useRef();
    const cameraFollowRef = useRef(new THREE.Vector3(0, 0, 0));
    const velocityRef = useRef(new THREE.Vector3(0, 0, 0));
    const propellersRefs = useRef([]);

    // Initial rotation reference - with explicit YXZ rotation order
    const initialRotationRef = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));

    // State
    const [position, setPosition] = useState([0, 10, 0]); // Start 10 units above ground
    const [propellersActive, setPropellersActive] = useState(false);
    const [propellersSpeed, setPropellersSpeed] = useState(0);

    // Weapon ammo state
    const [shotgunAmmo, setShotgunAmmo] = useState(12);
    const [grenadeAmmo, setGrenadeAmmo] = useState(6);
    const [dartAmmo, setDartAmmo] = useState(9);

    // Weapon cooldown state
    const [shotgunCooldown, setShotgunCooldown] = useState(false);
    const [grenadeCooldown, setGrenadeCooldown] = useState(false);
    const [dartCooldown, setDartCooldown] = useState(false);

    // Object pool for projectiles
    const projectilePool = useRef({
        [WEAPON_TYPES.SHOTGUN]: [],
        [WEAPON_TYPES.GRENADE]: [],
        [WEAPON_TYPES.DART]: []
    });

    // Active projectiles
    const [activeProjectiles, setActiveProjectiles] = useState([]);

    // Access scene elements
    const { camera, scene } = useThree();

    // Setup keyboard controls
    const [subscribeKeys, getKeys] = useKeyboardControls();

    // Add downward view state
    const [downwardViewActive, setDownwardViewActive] = useState(false);

    // Initialize object pools
    useEffect(() => {
        // Create initial pools for each weapon type
        Object.entries(POOL_SIZE).forEach(([type, size]) => {
            for (let i = 0; i < size; i++) {
                projectilePool.current[type].push({
                    id: `${type}-${i}`,
                    position: new THREE.Vector3(),
                    previousPosition: new THREE.Vector3(),
                    direction: new THREE.Vector3(),
                    type: type,
                    speed: 0,
                    life: 0,
                    active: false,
                    gravity: 0
                });
            }
        });
    }, []);

    // Drone physics parameters
    const THRUST = 0.05;
    const MAX_SPEED = 1.5;
    const ROTATION_SPEED = 0.06; // Reduced for more subtle rotation
    const FRICTION = 0.98;
    const GRAVITY = 0.004;
    const LIFT_POWER = 0.05;
    const STRAFE_POWER = 0.04; // Power for strafing left/right
    const DIVE_POWER = 0.005; // Power for slight downward movement with W

    // Get projectile from pool
    const getProjectileFromPool = (type) => {
        // Find first inactive projectile of the requested type
        const pool = projectilePool.current[type];
        const projectile = pool.find(p => !p.active);

        if (projectile) {
            projectile.active = true;
            return projectile;
        }

        console.warn(`Pool exhausted for ${type} projectiles`);

        // If pool is exhausted, create a new one (fallback)
        if (pool.length < 25) { // Cap at 25 to prevent unlimited growth
            const newProjectile = {
                id: `${type}-${pool.length}`,
                position: new THREE.Vector3(),
                previousPosition: new THREE.Vector3(),
                direction: new THREE.Vector3(),
                type: type,
                speed: 0,
                life: 0,
                active: true,
                gravity: 0
            };

            pool.push(newProjectile);
            return newProjectile;
        }

        // Return null if we hit the cap - the calling code should handle this
        return null;
    };

    // Return projectile to pool
    const returnProjectileToPool = (projectile) => {
        const pool = projectilePool.current[projectile.type];
        const pooledProjectile = pool.find(p => p.id === projectile.id);

        if (pooledProjectile) {
            pooledProjectile.active = false;
            // Reset other properties as needed
            pooledProjectile.life = 0;
        }
    };

    // Weapon firing functions
    const fireShotgun = useCallback(() => {
        if (shotgunAmmo <= 0 || shotgunCooldown) return;

        console.log("Firing shotgun!");
        setShotgunAmmo(prev => prev - 1);
        setShotgunCooldown(true);

        // Add shotgun projectile logic here
        const rotation = droneRef.current.rotation.y;
        const forward = new THREE.Vector3(
            -Math.sin(rotation),
            0,
            -Math.cos(rotation)
        );

        // Trigger the shotgun muzzle flash at the drone's position
        const muzzlePosition = droneRef.current.position.clone().add(
            forward.clone().multiplyScalar(1.0)
        );
        triggerShotgunFire(muzzlePosition, forward);

        // Creating buckshot - REDUCED from 5 to 3 projectiles for better performance
        for (let i = 0; i < 3; i++) {
            // Add slight random deviation for buckshot spread
            const spread = new THREE.Vector3(
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.2
            );

            const direction = forward.clone().add(spread).normalize();

            // Get projectile from pool
            const projectile = getProjectileFromPool(WEAPON_TYPES.SHOTGUN);
            if (!projectile) continue; // Skip if no projectile available

            // Set projectile properties
            projectile.position.copy(droneRef.current.position)
                .add(direction.clone().multiplyScalar(1.5)); // Start position in front of drone

            // Initialize previousPosition if needed
            if (!projectile.previousPosition) {
                projectile.previousPosition = new THREE.Vector3();
            }
            projectile.previousPosition.copy(projectile.position);
            projectile.direction.copy(direction);
            projectile.speed = 0.8 + Math.random() * 0.4; // Varied speed
            projectile.life = 40; // Reduced from 50 frames to 40 for shorter lifetime

            // Add to active projectiles
            setActiveProjectiles(prev => [...prev, projectile]);
        }

        // Set cooldown
        setTimeout(() => {
            setShotgunCooldown(false);
        }, 800);
    }, [shotgunAmmo, shotgunCooldown]);

    const dropGrenade = () => {
        if (grenadeAmmo <= 0 || grenadeCooldown) return;

        console.log("Dropping grenade!");
        setGrenadeAmmo(grenadeAmmo - 1);
        setGrenadeCooldown(true);

        // Get current position from the drone ref
        const currentPosition = droneRef.current.position;
        console.log("Drone position:", currentPosition.x, currentPosition.y, currentPosition.z);

        // Get projectile from pool
        const projectile = getProjectileFromPool(WEAPON_TYPES.GRENADE);

        // Set projectile properties
        projectile.position.set(
            currentPosition.x, // Center position
            currentPosition.y - 0.5, // Drop from bottom of drone
            currentPosition.z
        );
        // Initialize previousPosition same as current position at first
        if (!projectile.previousPosition) {
            projectile.previousPosition = new THREE.Vector3();
        }
        projectile.previousPosition.copy(projectile.position);
        projectile.direction.set(0, -1, 0); // Fall straight down
        projectile.speed = 0.4; // Increased from 0.2
        projectile.life = 70; // Reduced from 100
        projectile.gravity = 0.005; // Reduced from 0.01 for straighter trajectory

        // Add to active projectiles
        setActiveProjectiles(prev => [...prev, projectile]);

        // Set cooldown
        setTimeout(() => {
            setGrenadeCooldown(false);
        }, 1200);
    };

    const dropDart = () => {
        if (dartAmmo <= 0 || dartCooldown) return;

        console.log("Dropping dart!");
        setDartAmmo(dartAmmo - 1);
        setDartCooldown(true);

        // Get current position from the drone ref
        const currentPosition = droneRef.current.position;

        // Get projectile from pool
        const projectile = getProjectileFromPool(WEAPON_TYPES.DART);

        // Set projectile properties
        projectile.position.set(
            currentPosition.x, // Center position
            currentPosition.y - 0.5, // Drop from bottom of drone
            currentPosition.z
        );
        // Initialize previousPosition same as current position at first
        if (!projectile.previousPosition) {
            projectile.previousPosition = new THREE.Vector3();
        }
        projectile.previousPosition.copy(projectile.position);
        projectile.direction.set(0, -1, 0); // Fall straight down
        projectile.speed = 0.6; // Increased from 0.3
        projectile.life = 60; // Reduced from 80
        projectile.gravity = 0.008; // Reduced from 0.015 for straighter trajectory

        // Add to active projectiles
        setActiveProjectiles(prev => [...prev, projectile]);
        console.log("Projectiles after adding dart:", activeProjectiles.length + 1);

        // Set cooldown
        setTimeout(() => {
            setDartCooldown(false);
        }, 1000);
    };

    useEffect(() => {
        // Setup camera initial position
        camera.position.set(0, 15, 20);
        camera.lookAt(0, 10, 0);

        // Ensure drone has proper initial rotation with correct order
        if (droneRef.current) {
            // Set rotation order explicitly first
            droneRef.current.rotation.order = 'YXZ';

            // Set individual rotation components (can't assign the entire rotation object)
            droneRef.current.rotation.x = initialRotationRef.current.x;
            droneRef.current.rotation.y = initialRotationRef.current.y;
            droneRef.current.rotation.z = initialRotationRef.current.z;
        }

        // Subscribe to keyboard controls
        return subscribeKeys(
            state => state,
            state => {
                // Activate propellers when any control is pressed
                const { forward, backward, left, right, up, down, strafeLeft, strafeRight } = state;
                if (forward || backward || left || right || up || down || strafeLeft || strafeRight) {
                    setPropellersActive(true);
                    setPropellersSpeed(1.0);
                } else {
                    setPropellersSpeed(0.5); // Idle speed when not moving
                }
            }
        );
    }, [camera, subscribeKeys]);

    // Handle weapon firing with mouse and keyboard
    useEffect(() => {
        // Handle mouse clicks for weapons
        const handleMouseDown = (e) => {
            switch (e.button) {
                case 0: // Left mouse button
                    fireShotgun();
                    break;
                case 2: // Right mouse button
                    dropGrenade();
                    break;
                default:
                    break;
            }
        };

        // Handle keyboard keys
        const handleKeyDown = (e) => {
            switch (e.key) {
                case 'c':
                case 'C':
                    dropDart(); // C key exclusively for dart weapon
                    break;
                case 'v':
                case 'V':
                    setDownwardViewActive(prev => !prev); // V key for toggling downward view
                    break;
                default:
                    break;
            }
        };

        // Prevent default right-click context menu
        const handleContextMenu = (e) => {
            e.preventDefault();
        };

        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('contextmenu', handleContextMenu);

        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [shotgunAmmo, grenadeAmmo, dartAmmo, shotgunCooldown, grenadeCooldown, dartCooldown]);

    // Enhanced weapon impact function that triggers explosion effects
    const handleWeaponImpact = (position, weaponType) => {
        console.log(`Weapon impact: ${weaponType} at position [${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)}]`);

        // Use setTimeout to avoid calling setState during render
        setTimeout(() => {
            // For shotgun impacts, we rely on the ExplosionsManager to apply damage
            // without creating visual explosion effects

            // Trigger explosion effect - ExplosionsManager will handle shotgun specially
            triggerExplosion(position, weaponType);

            // Show damage indicator at the impact point
            showDamageIndicator(position, 20);
        }, 0);
    };

    // Update projectiles with explosion effects
    useFrame(() => {
        // Process projectiles with object pooling
        setActiveProjectiles(prevProjectiles => {
            // Early return if no projectiles to process
            if (prevProjectiles.length === 0) return prevProjectiles;

            const stillActiveProjectiles = [];

            for (const projectile of prevProjectiles) {
                // Decrement life and remove if expired
                if (projectile.life <= 0) {
                    // Trigger weapon impact with explosion
                    handleWeaponImpact(projectile.position, projectile.type);
                    // Return to pool
                    returnProjectileToPool(projectile);
                    continue; // Skip this projectile in the updated array
                }

                // Check for ground collision
                if (projectile.position.y <= 0.1) {
                    // Trigger weapon impact with explosion
                    handleWeaponImpact(projectile.position, projectile.type);
                    // Return to pool
                    returnProjectileToPool(projectile);
                    continue; // Skip this projectile
                }

                // Check for vehicle collision - only if projectile is close to ground level
                // This optimization avoids collision checks when projectiles are high in the air
                const vehicleHit = checkProjectileVehicleCollision(projectile, scene);
                if (vehicleHit) {
                    // Trigger weapon impact with explosion at the collision point
                    handleWeaponImpact(vehicleHit.position, projectile.type);
                    // Return to pool
                    returnProjectileToPool(projectile);
                    continue; // Skip this projectile
                }

                // Store the previous position before updating
                if (!projectile.previousPosition) {
                    projectile.previousPosition = new THREE.Vector3();
                }
                projectile.previousPosition.copy(projectile.position);

                // Update position based on direction and speed
                projectile.position.add(
                    projectile.direction.clone().multiplyScalar(projectile.speed)
                );

                // Apply gravity if applicable
                if (projectile.gravity) {
                    projectile.direction.y -= projectile.gravity;
                }

                // Reduce life
                projectile.life--;

                // Add to still active projectiles
                stillActiveProjectiles.push(projectile);
            }

            return stillActiveProjectiles;
        });
    });

    useFrame((state, delta) => {
        if (!droneRef.current) return;

        // Get current keyboard state
        const { forward, backward, left, right, up, down, strafeLeft, strafeRight, shift } = getKeys();

        // Get drone's current rotation
        const rotation = droneRef.current.rotation.y;

        // Get directional vectors
        const forwardVector = new THREE.Vector3(
            -Math.sin(rotation),
            0,
            -Math.cos(rotation)
        );

        const rightVector = new THREE.Vector3(
            Math.cos(rotation),
            0,
            -Math.sin(rotation)
        );

        // Calculate thrust based on controls
        if (forward) {
            velocityRef.current.add(forwardVector.clone().multiplyScalar(THRUST * 2)); // 2x speed for forward
            velocityRef.current.y -= DIVE_POWER; // Slight downward movement when pressing W
        }
        if (backward) {
            velocityRef.current.add(forwardVector.clone().multiplyScalar(-THRUST));
            velocityRef.current.y += DIVE_POWER * 0.8; // Slight upward movement when pressing S
        }

        // Handle rotation separately from strafing - now with smoother turning
        if (left) {
            // Smooth rotation with lerping
            droneRef.current.rotation.y = THREE.MathUtils.lerp(
                droneRef.current.rotation.y,
                droneRef.current.rotation.y + ROTATION_SPEED * 2,
                0.2
            );
        }
        if (right) {
            // Smooth rotation with lerping
            droneRef.current.rotation.y = THREE.MathUtils.lerp(
                droneRef.current.rotation.y,
                droneRef.current.rotation.y - ROTATION_SPEED * 2,
                0.2
            );
        }

        // Add strafing with A and D keys
        if (strafeLeft) velocityRef.current.add(rightVector.clone().multiplyScalar(-STRAFE_POWER));
        if (strafeRight) velocityRef.current.add(rightVector.clone().multiplyScalar(STRAFE_POWER));

        // Handle vertical movement
        if (up) {
            velocityRef.current.y += LIFT_POWER;
        } else if (down) {
            // If shift is pressed, go down 50% faster
            const downSpeed = shift ? LIFT_POWER * 1.5 : LIFT_POWER;
            velocityRef.current.y -= downSpeed;
        } else {
            // Apply gravity when not actively going up or down
            velocityRef.current.y -= GRAVITY;
        }

        // Apply friction to slow down over time
        velocityRef.current.multiplyScalar(FRICTION);

        // Limit max speed
        const speed = velocityRef.current.length();
        if (speed > MAX_SPEED) {
            velocityRef.current.normalize().multiplyScalar(MAX_SPEED);
        }

        // Apply velocity to drone position
        droneRef.current.position.add(velocityRef.current);

        // Prevent going below the ground
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

        // Update target position for smooth following
        const targetPosition = new THREE.Vector3(
            droneRef.current.position.x,
            droneRef.current.position.y,
            droneRef.current.position.z
        );

        // Fixed camera parameters - using more strict values
        const cameraDistance = 25; // Increased from 18 to zoom out more
        const cameraHeight = 8; // Keeping the same height for now

        // Handle camera positioning based on view mode
        if (downwardViewActive) {
            // Position camera directly below the drone, looking down
            camera.position.set(
                droneRef.current.position.x,
                droneRef.current.position.y - 3, // 3 units below the drone
                droneRef.current.position.z
            );
            // Look directly at ground below the drone
            camera.lookAt(
                droneRef.current.position.x,
                0, // Looking at ground level
                droneRef.current.position.z
            );
        } else {
            // Calculate camera position strictly behind the drone
            // Use exact rotation values for precise positioning
            const cameraOffset = new THREE.Vector3(
                Math.sin(rotation) * cameraDistance,
                cameraHeight,
                Math.cos(rotation) * cameraDistance
            );

            // Set camera position directly without lerping for strict following
            camera.position.copy(targetPosition).add(cameraOffset);

            // Make camera look exactly at the drone
            camera.lookAt(
                droneRef.current.position.x,
                droneRef.current.position.y + 0.5, // Aim slightly above center
                droneRef.current.position.z
            );
        }

        // Update position state for external components
        setPosition([
            droneRef.current.position.x,
            droneRef.current.position.y,
            droneRef.current.position.z
        ]);
    });

    return (
        <>
            <group ref={droneRef}>
                {/* Main drone body - redesigned with more polygons */}
                <mesh castShadow receiveShadow position={[0, 0, 0]}>
                    <boxGeometry args={[0.8, 0.35, 2.0]} />
                    <meshStandardMaterial color="#1d3557" metalness={0.7} roughness={0.2} />
                </mesh>

                {/* Side bevels for more polished look */}
                <mesh castShadow receiveShadow position={[0.4, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
                    <boxGeometry args={[0.25, 0.35, 2.0]} />
                    <meshStandardMaterial color="#2a4568" metalness={0.7} roughness={0.2} />
                </mesh>
                <mesh castShadow receiveShadow position={[-0.4, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
                    <boxGeometry args={[0.25, 0.35, 2.0]} />
                    <meshStandardMaterial color="#2a4568" metalness={0.7} roughness={0.2} />
                </mesh>

                {/* Front and back bevels */}
                <mesh castShadow receiveShadow position={[0, 0, 1.0]} rotation={[Math.PI / 4, 0, 0]}>
                    <boxGeometry args={[0.8, 0.25, 0.25]} />
                    <meshStandardMaterial color="#2a4568" metalness={0.7} roughness={0.2} />
                </mesh>
                <mesh castShadow receiveShadow position={[0, 0, -1.0]} rotation={[-Math.PI / 4, 0, 0]}>
                    <boxGeometry args={[0.8, 0.25, 0.25]} />
                    <meshStandardMaterial color="#2a4568" metalness={0.7} roughness={0.2} />
                </mesh>

                {/* Central cross for arms */}
                <mesh castShadow position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
                    <boxGeometry args={[3.0, 0.08, 0.1]} />
                    <meshStandardMaterial color="#e63946" metalness={0.4} roughness={0.6} />
                </mesh>
                <mesh castShadow position={[0, 0, 0]} rotation={[0, -Math.PI / 4, 0]}>
                    <boxGeometry args={[3.0, 0.08, 0.1]} />
                    <meshStandardMaterial color="#e63946" metalness={0.4} roughness={0.6} />
                </mesh>

                {/* Landing gear - adjusted to y=-0.3 */}
                <LandingLeg position={[0.6, -0.3, 0.6]} />
                <LandingLeg position={[-0.6, -0.3, 0.6]} />
                <LandingLeg position={[0.6, -0.3, -0.6]} />
                <LandingLeg position={[-0.6, -0.3, -0.6]} />

                {/* Motors and propellers */}
                <PropellerUnit
                    position={[1.1, 0, 1.1]}
                    index={0}
                    propRef={(el) => (propellersRefs.current[0] = el)}
                    active={propellersActive}
                    speed={propellersSpeed}
                />
                <PropellerUnit
                    position={[-1.1, 0, 1.1]}
                    index={1}
                    propRef={(el) => (propellersRefs.current[1] = el)}
                    active={propellersActive}
                    speed={propellersSpeed}
                    counterClockwise
                />
                <PropellerUnit
                    position={[1.1, 0, -1.1]}
                    index={2}
                    propRef={(el) => (propellersRefs.current[2] = el)}
                    active={propellersActive}
                    speed={propellersSpeed}
                    counterClockwise
                />
                <PropellerUnit
                    position={[-1.1, 0, -1.1]}
                    index={3}
                    propRef={(el) => (propellersRefs.current[3] = el)}
                    active={propellersActive}
                    speed={propellersSpeed}
                />

                {/* Shotgun - two barrels side by side with space in between */}
                <group position={[0, -0.3, -1.0]} rotation={[Math.PI / 2, 0, Math.PI]}>
                    <mesh castShadow receiveShadow position={[-0.25, 0, -0.2]}>
                        <cylinderGeometry args={[0.15, 0.15, 2.4, 12]} />
                        <meshStandardMaterial color="#2b2d42" metalness={0.8} roughness={0.2} />
                    </mesh>
                    <mesh castShadow receiveShadow position={[0.25, 0, -0.2]}>
                        <cylinderGeometry args={[0.15, 0.15, 2.4, 12]} />
                        <meshStandardMaterial color="#2b2d42" metalness={0.8} roughness={0.2} />
                    </mesh>

                </group>

                {/* Robust Grenade module - centered and more prominent */}
                <group position={[0, -0.35, 1.0]} rotation={[-Math.PI / 2, 0, 0]}>
                    {/* Main grenade housing */}
                    <mesh castShadow receiveShadow position={[0, 0, 0.15]}>
                        <boxGeometry args={[1.0, 0.5, 0.3]} />
                        <meshStandardMaterial color="#4a5568" metalness={0.6} roughness={0.3} />
                    </mesh>
                    {/* Grenade tubes in a robust configuration */}
                    {[...Array(4)].map((_, i) => (
                        <mesh key={i} position={[(i - 1.5) * 0.22, 0, 0]} castShadow receiveShadow>
                            <cylinderGeometry args={[0.08, 0.08, 0.3, 10]} />
                            <meshStandardMaterial color="#2b2d42" metalness={0.7} roughness={0.4} />
                        </mesh>
                    ))}
                    {/* Reinforcement bars */}
                    <mesh castShadow receiveShadow position={[0, 0.15, 0.15]}>
                        <boxGeometry args={[1.0, 0.08, 0.08]} />
                        <meshStandardMaterial color="#e63946" metalness={0.6} roughness={0.4} />
                    </mesh>
                    <mesh castShadow receiveShadow position={[0, -0.15, 0.15]}>
                        <boxGeometry args={[1.0, 0.08, 0.08]} />
                        <meshStandardMaterial color="#e63946" metalness={0.6} roughness={0.4} />
                    </mesh>
                </group>

                {/* Dart tubes - moved to bottom position */}
                <group position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    {/* Main dart housing */}
                    <mesh castShadow receiveShadow position={[0, 0, 0.1]}>
                        <boxGeometry args={[0.8, 0.25, 0.2]} />
                        <meshStandardMaterial color="#4a5568" metalness={0.6} roughness={0.3} />
                    </mesh>
                    {/* Dart tubes in a row on bottom */}
                    {[...Array(5)].map((_, i) => (
                        <mesh key={i} position={[(i - 2) * 0.15, 0, 0]} castShadow receiveShadow>
                            <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
                            <meshStandardMaterial color="#2b2d42" metalness={0.7} roughness={0.4} />
                        </mesh>
                    ))}
                    {/* Dart ammo indicator */}
                    <mesh position={[0, 0.15, 0.1]}>
                        <boxGeometry args={[0.2, 0.1, 0.1]} />
                        <meshStandardMaterial color="#ff5733" emissive="#ff5733" emissiveIntensity={0.5} />
                    </mesh>
                </group>
            </group>

            {/* Render only active projectiles */}
            <ProjectileRenderer projectiles={activeProjectiles} />

            {/* Debug visualization of projectile paths - disabled for performance */}
            {/* <ProjectileDebugLines projectiles={activeProjectiles} /> */}
        </>
    );
}

// Directly combined motor and propeller unit
function PropellerUnit({ position, index, propRef, active = true, speed = 1.0, counterClockwise = false }) {
    const motorRef = useRef();
    const propellerRef = useRef();
    const direction = counterClockwise ? -1 : 1;

    useFrame(() => {
        if (propellerRef.current && active) {
            // Spin propellers continuously, with variable speed
            propellerRef.current.rotation.y += 0.5 * speed * direction;
        }

        if (propRef) {
            propRef(propellerRef.current);
        }
    });

    return (
        <group position={position}>
            {/* Motor housing - directly on arms */}
            <mesh castShadow receiveShadow>
                <cylinderGeometry args={[0.15, 0.18, 0.2, 12]} />
                <meshStandardMaterial color="#2b2d42" metalness={0.7} roughness={0.3} />
            </mesh>

            {/* Motor top */}
            <mesh castShadow position={[0, 0.12, 0]}>
                <cylinderGeometry args={[0.12, 0.12, 0.05, 12]} />
                <meshStandardMaterial color="#8d99ae" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Propeller - using a more realistic shape */}
            <group ref={propellerRef} position={[0, 0.15, 0]}>
                {/* First blade */}
                <mesh castShadow>
                    <meshStandardMaterial color="#2b2d42" metalness={0.5} roughness={0.6} />
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={12}
                            itemSize={3}
                            array={new Float32Array([
                                0, 0, 0, 0.6, 0.02, -0.1, 0.6, -0.02, 0.1,  // triangle 1
                                0, 0, 0, 0.6, -0.02, 0.1, 1.2, 0, 0,        // triangle 2
                                0, 0, 0, 1.2, 0, 0, 0.6, 0.02, -0.1,  // triangle 3
                                0.6, 0.02, -0.1, 1.2, 0, 0, 0.6, -0.02, 0.1,  // triangle 4 (back face)
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

                {/* Second blade - rotated 180 degrees */}
                <mesh castShadow rotation={[0, Math.PI, 0]}>
                    <meshStandardMaterial color="#2b2d42" metalness={0.5} roughness={0.6} />
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={12}
                            itemSize={3}
                            array={new Float32Array([
                                0, 0, 0, 0.6, 0.02, -0.1, 0.6, -0.02, 0.1,  // triangle 1
                                0, 0, 0, 0.6, -0.02, 0.1, 1.2, 0, 0,        // triangle 2
                                0, 0, 0, 1.2, 0, 0, 0.6, 0.02, -0.1,  // triangle 3
                                0.6, 0.02, -0.1, 1.2, 0, 0, 0.6, -0.02, 0.1,  // triangle 4 (back face)
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

                {/* Propeller center cap */}
                <mesh>
                    <sphereGeometry args={[0.06, 8, 8]} />
                    <meshStandardMaterial color="#2b2d42" metalness={0.7} roughness={0.2} />
                </mesh>
            </group>
        </group>
    );
}

// Simplified landing leg component
function LandingLeg({ position }) {
    return (
        <group position={position}>
            {/* Vertical strut */}
            <mesh castShadow>
                <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
                <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
            </mesh>

            {/* Foot pad */}
            <mesh castShadow position={[0, -0.35, 0]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial color="#475569" metalness={0.4} roughness={0.6} />
            </mesh>
        </group>
    );
}

// Optimized ProjectileRenderer for better performance
function ProjectileRenderer({ projectiles }) {
    // Use a simple shared geometry for all projectiles of the same type
    const geometries = useMemo(() => ({
        [WEAPON_TYPES.SHOTGUN]: new THREE.SphereGeometry(0.05, 3, 3),  // Further reduced segments
        [WEAPON_TYPES.GRENADE]: new THREE.SphereGeometry(0.15, 6, 6),
        [WEAPON_TYPES.DART]: new THREE.SphereGeometry(0.1, 6, 6)
    }), []);

    // Create shared materials
    const materials = useMemo(() => ({
        [WEAPON_TYPES.SHOTGUN]: new THREE.MeshBasicMaterial({ color: 'gray' }),
        [WEAPON_TYPES.GRENADE]: new THREE.MeshBasicMaterial({ color: 'gold' }),
        [WEAPON_TYPES.DART]: new THREE.MeshBasicMaterial({ color: 'limegreen' })
    }), []);

    // Group projectiles by type for batched rendering
    const projectilesByType = useMemo(() => {
        const grouped = {
            [WEAPON_TYPES.SHOTGUN]: [],
            [WEAPON_TYPES.GRENADE]: [],
            [WEAPON_TYPES.DART]: []
        };

        projectiles.forEach(projectile => {
            if (grouped[projectile.type]) {
                grouped[projectile.type].push(projectile);
            }
        });

        return grouped;
    }, [projectiles]);

    return (
        <>
            {Object.entries(projectilesByType).map(([type, typeProjectiles]) => (
                typeProjectiles.map(projectile => (
                    <mesh
                        key={projectile.id}
                        position={[projectile.position.x, projectile.position.y, projectile.position.z]}
                        geometry={geometries[type]}
                        material={materials[type]}
                    />
                ))
            ))}
        </>
    );
} 