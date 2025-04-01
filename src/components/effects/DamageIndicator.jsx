import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export default function DamageIndicator({ position, damage, duration = 60 }) {
    const groupRef = useRef();
    const [lifespan, setLifespan] = useState(duration);
    const [offset, setOffset] = useState(0);

    // Animation effect - float upward and fade out
    useFrame(() => {
        if (!groupRef.current) return;

        // Move upward
        setOffset(prev => prev + 0.02);

        // Update position and opacity
        if (groupRef.current) {
            // Reduce lifespan
            setLifespan(prev => prev - 1);

            // Fade out towards the end
            if (lifespan < duration * 0.3) {
                groupRef.current.children.forEach(child => {
                    if (child.material) {
                        child.material.opacity = lifespan / (duration * 0.3);
                    }
                });
            }

            // Remove when lifespan is over
            if (lifespan <= 0) {
                // The component will be removed by the parent
            }
        }
    });

    return (
        <group
            ref={groupRef}
            position={[position.x, position.y + 1 + offset, position.z]}
            lookAt={[position.x, position.y + 10, position.z - 5]} // Always face camera
        >
            <Text
                color={damage >= 15 ? "red" : damage >= 10 ? "orange" : "yellow"}
                fontSize={0.5}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.05}
                outlineColor="#000000"
                material-transparent={true}
            >
                {damage.toFixed(0)}
            </Text>
        </group>
    );
}

// Damage indicators manager component
export function DamageIndicatorsManager() {
    const [indicators, setIndicators] = useState([]);

    // Set up event listener for damage events
    React.useEffect(() => {
        const handleDamage = (event) => {
            const { position, damage } = event.detail;

            // Add new damage indicator
            setIndicators(prev => [
                ...prev,
                {
                    id: `damage-${Date.now()}-${Math.random()}`,
                    position: position.clone(),
                    damage,
                    createdAt: Date.now()
                }
            ]);

            // Clean up old indicators after their duration
            setTimeout(() => {
                setIndicators(prev =>
                    prev.filter(indicator =>
                        indicator.createdAt > Date.now() - 2000 // 2 seconds
                    )
                );
            }, 2000);
        };

        window.addEventListener('damage-dealt', handleDamage);

        return () => {
            window.removeEventListener('damage-dealt', handleDamage);
        };
    }, []);

    return (
        <>
            {indicators.map(indicator => (
                <DamageIndicator
                    key={indicator.id}
                    position={indicator.position}
                    damage={indicator.damage}
                />
            ))}
        </>
    );
}

// Helper function to trigger a damage indicator
export function showDamageIndicator(position, damage) {
    const event = new CustomEvent('damage-dealt', {
        detail: {
            position: position.clone(),
            damage
        }
    });

    window.dispatchEvent(event);
} 