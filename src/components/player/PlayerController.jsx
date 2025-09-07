import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls, PerspectiveCamera, Html, useHelper } from '@react-three/drei';
import * as THREE from 'three';
import { Controls } from '../KeyboardControls';
import { useKamikaze } from '../../utils/GameContext';

const PlayerController = ({ world }) => {
    const playerRef = useRef();
    const cameraRef = useRef();
    const bulletRef = useRef([]);
    const [subscribeKeys, getKeys] = useKeyboardControls();
    const velocity = useRef(new THREE.Vector3());
    const [health, setHealth] = useState(100);
    const [canShoot, setCanShoot] = useState(true);
    const { isFirstPerson } = useKamikaze();

    // Constants
    const SPEED = 8;
    const ROTATION_SPEED = 0.03;
    const BULLET_SPEED = 30;
    const SHOOT_COOLDOWN = 250; // milliseconds
    const COLLISION_THRESHOLD = 1;

    // Debug collision box
    useHelper(playerRef, THREE.BoxHelper, 'cyan');

    // Shooting mechanics
    const shoot = () => {
        if (!canShoot) return;

        const player = playerRef.current;
        const bulletDirection = new THREE.Vector3(0, 0, -1)
            .applyQuaternion(player.quaternion);

        const bullet = {
            position: player.position.clone().add(bulletDirection.multiplyScalar(1)),
            direction: bulletDirection,
            createdAt: Date.now()
        };

        bulletRef.current.push(bullet);
        setCanShoot(false);
        setTimeout(() => setCanShoot(true), SHOOT_COOLDOWN);
    };

    // Handle damage
    const takeDamage = (amount) => {
        setHealth(prev => Math.max(0, prev - amount));
        if (health <= 0) {
            // Handle player death
            console.log('Player died!');
        }
    };

    // Collision detection
    const checkCollisions = (position) => {
        // Example collision with world boundaries
        const worldBounds = 50;
        if (Math.abs(position.x) > worldBounds || Math.abs(position.z) > worldBounds) {
            return true;
        }

        // Add more collision checks here (e.g., with other objects)
        return false;
    };

    useFrame((state, delta) => {
        const keys = getKeys();
        const player = playerRef.current;
        if (!player) return;

        // Store original position for collision check
        const originalPosition = player.position.clone();

        // Update velocity based on keys
        velocity.current.set(0, 0, 0);

        if (keys[Controls.forward]) velocity.current.z -= SPEED * delta;
        if (keys[Controls.backward]) velocity.current.z += SPEED * delta;
        if (keys[Controls.strafeLeft]) velocity.current.x -= SPEED * delta;
        if (keys[Controls.strafeRight]) velocity.current.x += SPEED * delta;

        // Rotate based on Q and E keys
        if (keys[Controls.left]) player.rotation.y += ROTATION_SPEED;
        if (keys[Controls.right]) player.rotation.y -= ROTATION_SPEED;

        // Shoot on space
        if (keys[Controls.up]) shoot();

        // Apply movement in the direction the player is facing
        const moveVector = velocity.current.applyMatrix4(
            new THREE.Matrix4().makeRotationY(player.rotation.y)
        );

        // Test new position for collisions
        const newPosition = originalPosition.clone().add(moveVector);
        if (!checkCollisions(newPosition)) {
            player.position.copy(newPosition);
        }

        // Update camera position for first-person view
        if (cameraRef.current) {
            if (isFirstPerson) {
                cameraRef.current.position.set(0, 0.5, 0);
            } else {
                cameraRef.current.position.set(0, 5, 10);
                cameraRef.current.lookAt(player.position);
            }
        }

        // Update bullets
        const now = Date.now();
        bulletRef.current = bulletRef.current.filter(bullet => {
            bullet.position.add(bullet.direction.clone().multiplyScalar(BULLET_SPEED * delta));
            return now - bullet.createdAt < 2000; // Remove bullets after 2 seconds
        });

        // Update world if needed
        if (world?.updatePlayerPosition) {
            world.updatePlayerPosition(
                player.position.x,
                player.position.z,
                player.rotation.y
            );
        }
    });

    return (
        <group ref={playerRef}>
            <PerspectiveCamera ref={cameraRef} makeDefault={isFirstPerson} fov={75} />

            {/* Player body - only visible in third person */}
            {!isFirstPerson && (
                <>
                    {/* Player body */}
                    <mesh position={[0, 0, 0]}>
                        <cylinderGeometry args={[0.5, 0.5, 1.8, 32]} />
                        <meshStandardMaterial color="#4CAF50" />
                    </mesh>
                    {/* Head */}
                    <mesh position={[0, 1.2, 0]}>
                        <sphereGeometry args={[0.3, 32, 32]} />
                        <meshStandardMaterial color="#4CAF50" />
                    </mesh>
                    {/* Gun */}
                    <mesh position={[0.3, 0.5, -0.5]} rotation={[0, 0, 0]}>
                        <boxGeometry args={[0.1, 0.1, 1]} />
                        <meshStandardMaterial color="#333333" />
                    </mesh>
                </>
            )}

            {/* Bullets */}
            {bulletRef.current.map((bullet, index) => (
                <mesh key={index} position={bullet.position}>
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshStandardMaterial color="yellow" emissive="orange" />
                </mesh>
            ))}

            {/* Health bar */}
            <Html position={[0, 2, 0]}>
                <div style={{
                    width: '100px',
                    height: '10px',
                    backgroundColor: '#333',
                    border: '1px solid #666',
                    borderRadius: '5px',
                    overflow: 'hidden',
                    transform: 'translateX(-50%)'
                }}>
                    <div style={{
                        width: `${health}%`,
                        height: '100%',
                        backgroundColor: health > 30 ? '#4CAF50' : '#ff0000',
                        transition: 'width 0.3s ease-in-out'
                    }} />
                </div>
            </Html>
        </group>
    );
};

export default PlayerController; 