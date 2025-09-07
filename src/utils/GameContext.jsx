import React, { createContext, useContext, useState } from 'react';

// Define drone types
export const DRONE_TYPES = {
    PLAYER: 'PLAYER',
    GRENADIER: 'GRENADIER',
    KAMIKAZE: 'KAMIKAZE',
    BOMBER: 'BOMBER'
};

// Create context
const GameContext = createContext();

// Consolidated context provider component
export function GameProvider({ children }) {
    // State for the currently selected drone
    const [currentDrone, setCurrentDrone] = useState(DRONE_TYPES.GRENADIER);

    // State for the first person view
    const [isFirstPerson, setIsFirstPerson] = useState(false);

    // Function to switch drones
    const switchDrone = (droneType) => {
        setCurrentDrone(droneType);
    };

    // Function to toggle first person view
    const toggleFirstPerson = () => {
        setIsFirstPerson(prev => !prev);
    };

    // Value object to be provided by the context
    const value = {
        // Drone selection functionality
        currentDrone,
        switchDrone,

        // First person view functionality
        isFirstPerson,
        toggleFirstPerson
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
}

// Custom hook to use the drones functionality
export function useDrones() {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useDrones must be used within a GameProvider');
    }
    return {
        currentDrone: context.currentDrone,
        switchDrone: context.switchDrone
    };
}

// Custom hook to use the kamikaze/first-person functionality
export function useKamikaze() {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useKamikaze must be used within a GameProvider');
    }
    return {
        isFirstPerson: context.isFirstPerson,
        toggleFirstPerson: context.toggleFirstPerson
    };
}

// Combined hook to use all game context functionality
export function useGameContext() {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGameContext must be used within a GameProvider');
    }
    return context;
} 