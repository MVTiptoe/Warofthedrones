import React, { createContext, useContext, useState } from 'react';

// Define drone types
export const DRONE_TYPES = {
    GRENADIER: 'GRENADIER',
    KAMIKAZE: 'KAMIKAZE',
    BOMBER: 'BOMBER'
};

// Create context
const DronesContext = createContext();

// Context provider component
export function DronesProvider({ children }) {
    // State for the currently selected drone
    const [currentDrone, setCurrentDrone] = useState(DRONE_TYPES.GRENADIER);

    // Function to switch drones
    const switchDrone = (droneType) => {
        setCurrentDrone(droneType);
    };

    // Value object to be provided by the context
    const value = {
        currentDrone,
        switchDrone
    };

    return (
        <DronesContext.Provider value={value}>
            {children}
        </DronesContext.Provider>
    );
}

// Custom hook to use the drones context
export function useDrones() {
    const context = useContext(DronesContext);
    if (context === undefined) {
        throw new Error('useDrones must be used within a DronesProvider');
    }
    return context;
} 