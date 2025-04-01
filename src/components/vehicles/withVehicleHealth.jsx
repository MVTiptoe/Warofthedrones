import React, { useEffect, cloneElement, Children } from 'react';
import { useVehicleHealthStore } from '../../utils/VehicleHealthSystem';
import VehicleDamageEffects from '../effects/VehicleDamageEffects';

/**
 * Higher-order component that adds health system to vehicles
 * @param {React.ComponentType} VehicleComponent - The original vehicle component
 * @param {string} vehicleType - The type of vehicle from VehicleTypes
 * @returns {React.ComponentType} - Enhanced vehicle component with health system
 */
export const withVehicleHealth = (VehicleComponent, vehicleType) => {
    return React.forwardRef((props, ref) => {
        const { id, ...otherProps } = props;

        // Get vehicle health management functions from the store
        const {
            initVehicle,
            getVehicleHealth
        } = useVehicleHealthStore();

        // Generate a stable ID if not provided
        const vehicleId = id || `vehicle-${vehicleType}-${Math.floor(Math.random() * 10000)}`;

        // Initialize vehicle health on mount
        useEffect(() => {
            initVehicle(vehicleId, vehicleType);

            // Cleanup on unmount - could add removeVehicle here if needed
            // return () => removeVehicle(vehicleId);
        }, [vehicleId, vehicleType]);

        // Get current health state for this vehicle
        const vehicleHealth = getVehicleHealth(vehicleId);

        // If no health data yet, render original component
        if (!vehicleHealth) {
            return <VehicleComponent {...otherProps} ref={ref} />;
        }

        // If vehicle is destroyed, don't render anything
        if (vehicleHealth.isDestroyed) {
            return null;
        }

        // If vehicle is dead, adjust its appearance (lower to ground, etc.)
        const adjustedProps = { ...otherProps };

        if (vehicleHealth.isDead) {
            // Adjust position to make it appear destroyed (slightly into the ground)
            if (adjustedProps.position) {
                const [x, y, z] = adjustedProps.position;
                adjustedProps.position = [x, y - 0.15, z];
            }

            // Could also adjust rotation to make it appear tilted when destroyed
            if (adjustedProps.rotation) {
                const [x, y, z] = adjustedProps.rotation;
                adjustedProps.rotation = [
                    x + (Math.random() * 0.2 - 0.1),
                    y,
                    z + (Math.random() * 0.2 - 0.1)
                ];
            }
        }

        // Tag vehicle parts for hit detection
        const processVehicleChildren = (children) => {
            return Children.map(children, child => {
                if (!child) return child;

                // For parts specifically named (like turret, wheels, etc.)
                // Add specific userData to identify them as vehicle parts
                let partType = null;

                // Detect part type based on name (if available)
                if (child.props && child.props.name) {
                    const name = child.props.name.toLowerCase();
                    if (name.includes('turret')) {
                        partType = 'turret';
                    } else if (name.includes('track') || name.includes('tracks')) {
                        partType = 'tracks';
                    } else if (name.includes('wheel') || name.includes('wheels')) {
                        partType = 'wheels';
                    } else if (name.includes('cabin')) {
                        partType = 'cabin';
                    } else if (name.includes('engine')) {
                        partType = 'engine';
                    } else if (name.includes('cargo')) {
                        partType = 'cargo';
                    } else if (name.includes('rear')) {
                        partType = 'rear';
                    } else if (name.includes('front')) {
                        partType = 'front';
                    } else {
                        partType = 'body';
                    }
                }

                // Create new userData for this part
                const newUserData = {
                    ...(child.props.userData || {}),
                    isVehiclePart: true,
                    partType: partType,
                    parentVehicleId: vehicleId,
                    parentVehicleType: vehicleType
                };

                // Process any children of this part recursively
                let newChildren = child.props.children;
                if (newChildren) {
                    newChildren = processVehicleChildren(newChildren);
                }

                // Clone the child with new props
                return cloneElement(child, {
                    ...child.props,
                    userData: newUserData,
                    children: newChildren
                });
            });
        };

        // Return original vehicle with damage effects on top
        return (
            <group ref={ref}>
                <VehicleComponent
                    {...adjustedProps}
                    userData={{
                        vehicleId,
                        vehicleType,
                        health: vehicleHealth.currentHealth,
                        maxHealth: vehicleHealth.maxHealth,
                        isDead: vehicleHealth.isDead,
                        isDestroyed: vehicleHealth.isDestroyed,
                        mobilityFactor: vehicleHealth.mobilityFactor,
                        // Vehicle is immobile at 50% health or below
                        canMove: vehicleHealth.healthPercentage > 0.5
                    }}
                />
            </group>
        );
    });
};

export default withVehicleHealth; 