import React from 'react';
import { useMapStore } from '../utils/MapStore';
import OriginalMap from './maps/OriginalMap';
import DesertMap from './maps/DesertMap';

// This component handles loading the appropriate map based on the current selection
const MapContainer = () => {
    const { currentMapType } = useMapStore();

    // Render a different map component based on the selected map type
    const renderMap = () => {
        switch (currentMapType) {
            case 'desert':
                return <DesertMap />;
            case 'original':
            default:
                return <OriginalMap />;
        }
    };

    return (
        <>
            {renderMap()}
        </>
    );
};

export default MapContainer; 