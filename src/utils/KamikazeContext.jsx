import React, { createContext, useContext, useState } from 'react';

// Create context
const KamikazeContext = createContext();

// Context provider component
export function KamikazeProvider({ children }) {
    // State for the first person view
    const [isFirstPerson, setIsFirstPerson] = useState(false);

    // Function to toggle first person view
    const toggleFirstPerson = () => {
        setIsFirstPerson(prev => {
            const newValue = !prev;
            console.log(`First person view: ${newValue ? 'ENABLED' : 'DISABLED'}`);
            return newValue;
        });
    };

    // Value object to be provided by the context
    const value = {
        isFirstPerson,
        toggleFirstPerson
    };

    return (
        <KamikazeContext.Provider value={value}>
            {children}
        </KamikazeContext.Provider>
    );
}

// Custom hook to use the drones context
export function useKamikaze() {
    const context = useContext(KamikazeContext);
    if (context === undefined) {
        throw new Error('useKamikaze must be used within a KamikazeProvider');
    }
    return context;
} 