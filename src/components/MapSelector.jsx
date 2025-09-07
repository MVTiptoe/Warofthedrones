import React from 'react';
import { useMapStore } from '../utils/MapStore';

const MapSelector = () => {
    const { currentMapType, setMapType } = useMapStore();

    return (
        <div className="map-selector">
            <button
                className={`map-button ${currentMapType === 'original' ? 'active' : ''}`}
                onClick={() => setMapType('original')}
            >
                Original Map
            </button>
            <button
                className={`map-button ${currentMapType === 'desert' ? 'active' : ''}`}
                onClick={() => setMapType('desert')}
            >
                Desert Map
            </button>
        </div>
    );
};

export default MapSelector; 