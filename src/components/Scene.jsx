import React from 'react';
import MapContainer from './MapContainer';
import VehicleSelector from './VehicleSelector';

export default function Scene({ onSelectVehicle }) {
    return (
        <>
            {/* MapContainer loads the appropriate map based on the current selection */}
            <MapContainer />

            {/* Vehicle selection system (no UI rendering) */}
            <VehicleSelector onSelectVehicle={onSelectVehicle} />
        </>
    );
} 