import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * Component for handling vehicle selection via raycasting in the 3D scene
 * Does not render any UI elements directly
 */
const VehicleHealthSystem = ({ onSelectVehicle }) => {
    const { scene, camera, gl, raycaster } = useThree();

    // Set up click handler for selecting vehicles
    useEffect(() => {
        const handleClick = (event) => {
            // Calculate mouse position in normalized device coordinates
            const canvas = gl.domElement;
            const rect = canvas.getBoundingClientRect();

            const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            // Update raycaster with mouse position and camera
            raycaster.setFromCamera({ x, y }, camera);

            // Find intersected objects
            const intersects = raycaster.intersectObjects(scene.children, true);

            // Look for vehicle objects
            let found = false;

            for (let i = 0; i < intersects.length; i++) {
                const object = intersects[i].object;

                // Go up the parent chain to find object with userData containing vehicleId
                let currentObject = object;
                while (currentObject) {
                    if (currentObject.userData && currentObject.userData.vehicleId) {
                        onSelectVehicle(currentObject.userData.vehicleId);
                        found = true;
                        break;
                    }
                    currentObject = currentObject.parent;
                }

                if (found) break;
            }

            // If no vehicle was clicked, deselect is handled by onPointerMissed in Canvas
        };

        // Add click event listener to canvas
        const canvasElement = gl.domElement;
        canvasElement.addEventListener('click', handleClick);

        return () => {
            canvasElement.removeEventListener('click', handleClick);
        };
    }, [scene, camera, gl, raycaster, onSelectVehicle]);

    // This component doesn't render anything directly
    return null;
};

export default VehicleHealthSystem; 