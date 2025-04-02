import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import '../../styles/drone.css';
import { WEAPON_TYPES, checkProjectileVehicleCollision } from '../../utils/WeaponPhysics';
import { triggerExplosion } from '../effects/ExplosionsManager';
import { showDamageIndicator } from '../effects/DamageIndicator';
import { getKeys } from '../../utils/KeyboardControls';
import { useProjectilePool } from '../../utils/ProjectilePool';

// Constants for object pooling - reduced pool size for better performance
const POOL_SIZE = {
    [WEAPON_TYPES.ANTI_TANK_MINE]: 3,
    [WEAPON_TYPES.MORTAR]: 3,
    [WEAPON_TYPES.RPG]: 3
};

export default function Bomber() {
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
    const [showHUD, setShowHUD] = useState(true);

    // Define propeller positions
    const propellerPositions = [
        [0.7, 0.3, 0.7],   // Front right
        [-0.7, 0.3, 0.7],  // Front left
        [0.7, 0.3, -0.7],  // Rear right
        [-0.7, 0.3, -0.7]  // Rear left
    ];

    // Weapon ammo state
    const [mineAmmo, setMineAmmo] = useState(3);
    const [mortarAmmo, setMortarAmmo] = useState(5);
    const [rpgAmmo, setRpgAmmo] = useState(4);

    // Weapon cooldown state
    const [mineCooldown, setMineCooldown] = useState(false);
    const [mortarCooldown, setMortarCooldown] = useState(false);
    const [rpgCooldown, setRpgCooldown] = useState(false);

    // Object pool for projectiles
    const projectilePool = useRef({
        [WEAPON_TYPES.ANTI_TANK_MINE]: [],
        [WEAPON_TYPES.MORTAR]: [],
        [WEAPON_TYPES.RPG]: []
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

    // Drone physics parameters - slightly different performance
    const THRUST = 0.06; // More powerful
    const MAX_SPEED = 1.0; // Faster max speed
    const ROTATION_SPEED = 0.06; // Quicker rotation, but still more subtle
    const FRICTION = 0.97; // Less friction
    const GRAVITY = 0.003;
    const LIFT_POWER = 0.04; // Stronger lift
    const STRAFE_POWER = 0.05; // Power for strafing left/right - slightly stronger for this drone
    const DIVE_POWER = 0.015; // Power for slight upward movement with S

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

    // Handle weapon firing
    useEffect(() => {
        // Handle mouse clicks for weapons
        const handleMouseDown = (e) => {
            switch (e.button) {
                case 0: // Left mouse button
                    if (mineAmmo > 0 && !mineCooldown) {
                        console.log("Dropping mine");
                        setMineAmmo(prev => prev - 1);
                        setMineCooldown(true);

                        // Get projectile from pool
                        const projectile = getProjectileFromPool(WEAPON_TYPES.ANTI_TANK_MINE);

                        // Set projectile properties
                        projectile.position.set(
                            droneRef.current.position.x,
                            droneRef.current.position.y - 0.5, // Directly below drone
                            droneRef.current.position.z
                        );
                        // Initialize previousPosition same as current position at first
                        if (!projectile.previousPosition) {
                            projectile.previousPosition = new THREE.Vector3();
                        }
                        projectile.previousPosition.copy(projectile.position);
                        projectile.direction.set(0, -1, 0); // Strictly vertical drop
                        projectile.speed = 0.5; // Increased from 0.3 to 0.5 for faster falling
                        projectile.life = 80;
                        projectile.gravity = 0.01; // Doubled from 0.005 to 0.01 for faster acceleration

                        // Add to active projectiles
                        setActiveProjectiles(prev => [...prev, projectile]);

                        setTimeout(() => setMineCooldown(false), 1000);
                    }
                    break;
                case 2: // Right mouse button
                    if (mortarAmmo > 0 && !mortarCooldown) {
                        console.log("Dropping mortar");
                        setMortarAmmo(prev => prev - 1);
                        setMortarCooldown(true);

                        // Get projectile from pool
                        const projectile = getProjectileFromPool(WEAPON_TYPES.MORTAR);

                        // Set projectile properties
                        projectile.position.set(
                            droneRef.current.position.x,
                            droneRef.current.position.y - 0.5, // Directly below drone
                            droneRef.current.position.z
                        );
                        // Initialize previousPosition same as current position at first
                        if (!projectile.previousPosition) {
                            projectile.previousPosition = new THREE.Vector3();
                        }
                        projectile.previousPosition.copy(projectile.position);
                        projectile.direction.set(0, -1, 0);
                        projectile.speed = 0.5;
                        projectile.life = 60;
                        projectile.gravity = 0.006;

                        // Add to active projectiles
                        setActiveProjectiles(prev => [...prev, projectile]);

                        setTimeout(() => setMortarCooldown(false), 1000);
                    }
                    break;
                default:
                    break;
            }
        };

        // Handle keyboard keys
        const handleKeyDown = (e) => {
            if (e.key === 'c' || e.key === 'C') {
                if (rpgAmmo > 0 && !rpgCooldown) {
                    console.log("Dropping RPG");
                    setRpgAmmo(prev => prev - 1);
                    setRpgCooldown(true);

                    // Get projectile from pool
                    const projectile = getProjectileFromPool(WEAPON_TYPES.RPG);

                    // Set projectile properties
                    projectile.position.set(
                        droneRef.current.position.x,
                        droneRef.current.position.y - 0.5, // Directly below drone
                        droneRef.current.position.z
                    );
                    // Initialize previousPosition same as current position at first
                    if (!projectile.previousPosition) {
                        projectile.previousPosition = new THREE.Vector3();
                    }
                    projectile.previousPosition.copy(projectile.position);
                    projectile.direction.set(0, -1, 0);
                    projectile.speed = 0.6;
                    projectile.life = 40;
                    projectile.gravity = 0.008;

                    // Add to active projectiles
                    setActiveProjectiles(prev => [...prev, projectile]);

                    setTimeout(() => setRpgCooldown(false), 1000);
                }
            } else if (e.key === 'v' || e.key === 'V') {
                setDownwardViewActive(prev => !prev);
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
    }, [mineAmmo, mortarAmmo, rpgAmmo, mineCooldown, mortarCooldown, rpgCooldown]);

    // Enhanced weapon impact function that triggers explosion effects
    const handleWeaponImpact = (position, weaponType) => {
        console.log(`Weapon impact: ${weaponType} at position [${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)}]`);

        // Use setTimeout to avoid calling setState during render
        setTimeout(() => {
            // Trigger explosion effect
            // This will now handle finding objects in range and applying damage
            triggerExplosion(position, weaponType);

            // Show one sample damage indicator at the impact point
            showDamageIndicator(position, 20);
        }, 0);
    };

    // Update projectiles with explosion effects
    useFrame(() => {
        // Process projectiles with object pooling
        setActiveProjectiles(prevProjectiles => {
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

                // Check for vehicle collision with the improved collision detection
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
        }
        if (backward) {
            velocityRef.current.add(forwardVector.clone().multiplyScalar(-THRUST));
            velocityRef.current.y += DIVE_POWER * 0.8; // Slight upward movement when pressing S
        }

        // Handle rotation separately from strafing
        if (left) {
            droneRef.current.rotation.y = THREE.MathUtils.lerp(
                droneRef.current.rotation.y,
                droneRef.current.rotation.y + ROTATION_SPEED * 2,
                0.2
            );
        }
        if (right) {
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

        // Update camera follow
        const targetPosition = new THREE.Vector3(
            droneRef.current.position.x,
            droneRef.current.position.y,
            droneRef.current.position.z
        );

        // Fixed camera parameters
        const cameraDistance = 20;
        const cameraHeight = 9;

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
                droneRef.current.position.y + 0.1,
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
            <group ref={droneRef} position={position}>
                {/* Main drone body - smaller hexagon design */}
                <mesh castShadow receiveShadow position={[0, 0, 0]}>
                    <cylinderGeometry args={[0.6, 0.6, 0.2, 6]} />
                    <meshStandardMaterial color="#4a00e0" metalness={0.8} roughness={0.1} />
                </mesh>

                {/* Six thin round black arms extending from the hexagonal body to motors */}
                {[...Array(6)].map((_, i) => {
                    const armLength = 1.5; // Increased from 1.2 to 1.5 (25% longer)
                    const angle = Math.PI * i / 3;
                    // Calculate end position for placing motors
                    const endX = Math.sin(angle) * armLength;
                    const endZ = Math.cos(angle) * armLength;

                    return (
                        <group key={i}>
                            {/* Arm */}
                            <group rotation={[0, angle, 0]}>
                                <mesh castShadow position={[armLength / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                                    <cylinderGeometry args={[0.04, 0.04, armLength, 8]} />
                                    <meshStandardMaterial color="#121212" metalness={0.6} roughness={0.3} />
                                </mesh>

                                {/* Motor unit at the end of the arm, properly aligned with arm direction */}
                                <group position={[armLength, 0, 0]}>
                                    <PropellerUnit
                                        key={`motor-${i}`}
                                        position={[0, 0, 0]}
                                        index={i}
                                        propRef={(el) => (propellersRefs.current[i] = el)}
                                        active={propellersActive}
                                        speed={propellersSpeed}
                                        counterClockwise={i % 2 === 1} // Alternate direction
                                        scale={0.75} // 25% smaller motors and propellers
                                    />
                                </group>
                            </group>
                        </group>
                    );
                })}

                {/* Two landing legs - one on each side */}
                <group position={[0.5, -0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
                    {/* Main vertical strut */}
                    <mesh castShadow position={[0, -0.2, 0]}>
                        <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
                        <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
                    </mesh>

                    {/* Horizontal connector bar */}
                    <mesh castShadow position={[0, -0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
                        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.5} />
                    </mesh>

                    {/* Two leg struts on each side */}
                    <mesh castShadow position={[-0.35, -0.3, 0]} rotation={[0, 0, Math.PI / 6]}>
                        <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
                        <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
                    </mesh>

                    <mesh castShadow position={[0.35, -0.3, 0]} rotation={[0, 0, -Math.PI / 6]}>
                        <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
                        <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
                    </mesh>

                    {/* Foot pads */}
                    <mesh castShadow position={[-0.4, -0.45, 0]}>
                        <sphereGeometry args={[0.06, 8, 8]} />
                        <meshStandardMaterial color="#475569" metalness={0.4} roughness={0.6} />
                    </mesh>

                    <mesh castShadow position={[0.4, -0.45, 0]}>
                        <sphereGeometry args={[0.06, 8, 8]} />
                        <meshStandardMaterial color="#475569" metalness={0.4} roughness={0.6} />
                    </mesh>
                </group>

                {/* Left landing leg */}
                <group position={[-0.5, -0.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
                    {/* Main vertical strut */}
                    <mesh castShadow position={[0, -0.2, 0]}>
                        <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
                        <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
                    </mesh>

                    {/* Horizontal connector bar */}
                    <mesh castShadow position={[0, -0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
                        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.5} />
                    </mesh>

                    {/* Two leg struts on each side */}
                    <mesh castShadow position={[-0.35, -0.3, 0]} rotation={[0, 0, Math.PI / 6]}>
                        <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
                        <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
                    </mesh>

                    <mesh castShadow position={[0.35, -0.3, 0]} rotation={[0, 0, -Math.PI / 6]}>
                        <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
                        <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
                    </mesh>

                    {/* Foot pads */}
                    <mesh castShadow position={[-0.4, -0.45, 0]}>
                        <sphereGeometry args={[0.06, 8, 8]} />
                        <meshStandardMaterial color="#475569" metalness={0.4} roughness={0.6} />
                    </mesh>

                    <mesh castShadow position={[0.4, -0.45, 0]}>
                        <sphereGeometry args={[0.06, 8, 8]} />
                        <meshStandardMaterial color="#475569" metalness={0.4} roughness={0.6} />
                    </mesh>
                </group>

                {/* Anti-tank mine compartment - bottom */}
                <group position={[0, -0.3, 0]}>
                    <mesh castShadow receiveShadow>
                        <cylinderGeometry args={[0.5, 0.5, 0.2, 12]} />
                        <meshStandardMaterial color="#3d3d3d" metalness={0.8} roughness={0.3} />
                    </mesh>
                    {/* Mines in a circular arrangement */}
                    {[...Array(3)].map((_, i) => (
                        <mesh
                            key={i}
                            position={[
                                Math.sin(Math.PI * 2 * i / 3) * 0.25,
                                -0.1,
                                Math.cos(Math.PI * 2 * i / 3) * 0.25
                            ]}
                            castShadow
                            receiveShadow
                        >
                            <cylinderGeometry args={[0.15, 0.15, 0.05, 12]} />
                            <meshStandardMaterial color="#151515" metalness={0.7} roughness={0.3} />
                        </mesh>
                    ))}
                </group>

                {/* Mortar launchers - mounted on left side */}
                <group position={[-0.4, 0.2, 0]}>
                    {/* Mortar tubes */}
                    {[...Array(5)].map((_, i) => (
                        <mesh
                            key={i}
                            position={[0, (i - 2) * 0.15, 0]}
                            rotation={[0, 0, Math.PI / 2]}
                            castShadow
                            receiveShadow
                        >
                            <cylinderGeometry args={[0.08, 0.1, 0.3, 8]} />
                            <meshStandardMaterial color="#3a3a3a" metalness={0.7} roughness={0.4} />
                        </mesh>
                    ))}
                    {/* Mortar shells - visible like RPGs */}
                    {[...Array(5)].map((_, i) => (
                        <mesh
                            key={i}
                            position={[-0.2, (i - 2) * 0.15, 0]}
                            rotation={[0, 0, Math.PI / 2]}
                            castShadow
                            receiveShadow
                        >
                            <cylinderGeometry args={[0.06, 0.08, 0.15, 8]} />
                            <meshStandardMaterial color="#626262" metalness={0.7} roughness={0.3} />
                        </mesh>
                    ))}
                </group>

                {/* RPG launcher - mounted on right side */}
                <group position={[0.4, 0.2, 0]}>
                    {/* RPG tubes */}
                    {[...Array(4)].map((_, i) => (
                        <mesh
                            key={i}
                            position={[0, (i - 1.5) * 0.18, 0]}
                            rotation={[0, 0, -Math.PI / 2]}
                            castShadow
                            receiveShadow
                        >
                            <cylinderGeometry args={[0.1, 0.12, 0.4, 8]} />
                            <meshStandardMaterial color="#3a3a3a" metalness={0.7} roughness={0.4} />
                        </mesh>
                    ))}
                    {/* RPG warheads - shown as conical tips */}
                    {[...Array(4)].map((_, i) => (
                        <mesh
                            key={i}
                            position={[0.25, (i - 1.5) * 0.18, 0]}
                            rotation={[0, 0, -Math.PI / 2]}
                            castShadow
                            receiveShadow
                        >
                            <coneGeometry args={[0.1, 0.3, 8]} />
                            <meshStandardMaterial color="#626262" metalness={0.7} roughness={0.3} />
                        </mesh>
                    ))}
                </group>
            </group>

            {/* Render only active projectiles using the optimized renderer */}
            <ProjectileRenderer projectiles={activeProjectiles} />

            {/* Debug visualization of projectile paths - disabled for performance */}
            {/* <ProjectileDebugLines projectiles={activeProjectiles} /> */}
        </>
    );
}

// Optimized ProjectileRenderer for better performance
function ProjectileRenderer({ projectiles }) {
    // Use a simple shared geometry for all projectiles of the same type with low poly designs
    const geometries = useMemo(() => ({
        // Tank mine - low poly cylindrical mine design with detonator
        [WEAPON_TYPES.ANTI_TANK_MINE]: new THREE.Group().add(
            new THREE.Mesh(
                new THREE.CylinderGeometry(0.2, 0.2, 0.07, 8),
                new THREE.MeshStandardMaterial({ color: '#3a3a3a', metalness: 0.7, roughness: 0.3 })
            ),
            new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 0.05, 6),
                new THREE.MeshStandardMaterial({ color: '#111111', metalness: 0.7, roughness: 0.3 })
            ).translateY(0.06)
        ),

        // Mortar - low poly mortar shell design
        [WEAPON_TYPES.MORTAR]: new THREE.Group().add(
            new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, 0.2, 8),
                new THREE.MeshStandardMaterial({ color: '#4a5568', metalness: 0.6, roughness: 0.3 })
            ),
            new THREE.Mesh(
                new THREE.ConeGeometry(0.08, 0.12, 8),
                new THREE.MeshStandardMaterial({ color: '#2d3748', metalness: 0.7, roughness: 0.4 })
            ).translateY(0.16)
        ),

        // RPG - low poly rocket-propelled grenade design
        [WEAPON_TYPES.RPG]: new THREE.Group().add(
            new THREE.Mesh(
                new THREE.CylinderGeometry(0.06, 0.06, 0.25, 8),
                new THREE.MeshStandardMaterial({ color: '#4b5563', metalness: 0.6, roughness: 0.3 })
            ),
            new THREE.Mesh(
                new THREE.ConeGeometry(0.1, 0.15, 8),
                new THREE.MeshStandardMaterial({ color: '#374151', metalness: 0.7, roughness: 0.4 })
            ).translateY(0.2),
            new THREE.Mesh(
                new THREE.BoxGeometry(0.02, 0.04, 0.1),
                new THREE.MeshStandardMaterial({ color: '#6b7280', metalness: 0.5, roughness: 0.5 })
            ).translateY(-0.07).translateZ(0.08)
        )
    }), []);

    // Remove the old shared materials since we're using custom meshes with their own materials
    const ProjectileMesh = React.memo(({ projectile }) => {
        // Using rotation to simulate the projectile spinning as it falls
        const [rotation, setRotation] = useState([0, 0, 0]);

        useFrame(() => {
            // Simple rotation for projectiles to make them look more dynamic
            if (projectile.type === WEAPON_TYPES.ANTI_TANK_MINE) {
                setRotation([0, rotation[1] + 0.02, 0]); // Mine rotates on Y axis
            } else if (projectile.type === WEAPON_TYPES.MORTAR) {
                setRotation([rotation[0] + 0.03, 0, 0]); // Mortar rotates on X axis (tumbling)
            } else if (projectile.type === WEAPON_TYPES.RPG) {
                // RPG doesn't rotate much - just a slight wobble
                setRotation([Math.sin(Date.now() * 0.01) * 0.05, 0, 0]);
            }
        });

        return (
            <group
                position={[projectile.position.x, projectile.position.y, projectile.position.z]}
                rotation={rotation}
            >
                <primitive object={geometries[projectile.type].clone()} />
            </group>
        );
    });

    return (
        <>
            {projectiles.map(projectile => (
                <ProjectileMesh key={projectile.id} projectile={projectile} />
            ))}
        </>
    );
}

// Directly combined motor and propeller unit
function PropellerUnit({ position, index, propRef, active = true, speed = 1.0, counterClockwise = false, scale = 1.0 }) {
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
        <group position={position} scale={scale}>
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

            {/* Propeller - using a more realistic shape with 25% smaller blades */}
            <group ref={propellerRef} position={[0, 0.15, 0]}>
                {/* First blade - 25% smaller */}
                <mesh castShadow>
                    <meshStandardMaterial color="#2b2d42" metalness={0.5} roughness={0.6} />
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={12}
                            itemSize={3}
                            array={new Float32Array([
                                0, 0, 0, 0.45, 0.015, -0.075, 0.45, -0.015, 0.075,  // triangle 1
                                0, 0, 0, 0.45, -0.015, 0.075, 0.9, 0, 0,        // triangle 2
                                0, 0, 0, 0.9, 0, 0, 0.45, 0.015, -0.075,  // triangle 3
                                0.45, 0.015, -0.075, 0.9, 0, 0, 0.45, -0.015, 0.075,  // triangle 4 (back face)
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

                {/* Second blade - rotated 180 degrees - 25% smaller */}
                <mesh castShadow rotation={[0, Math.PI, 0]}>
                    <meshStandardMaterial color="#2b2d42" metalness={0.5} roughness={0.6} />
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={12}
                            itemSize={3}
                            array={new Float32Array([
                                0, 0, 0, 0.45, 0.015, -0.075, 0.45, -0.015, 0.075,  // triangle 1
                                0, 0, 0, 0.45, -0.015, 0.075, 0.9, 0, 0,        // triangle 2
                                0, 0, 0, 0.9, 0, 0, 0.45, 0.015, -0.075,  // triangle 3
                                0.45, 0.015, -0.075, 0.9, 0, 0, 0.45, -0.015, 0.075,  // triangle 4 (back face)
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