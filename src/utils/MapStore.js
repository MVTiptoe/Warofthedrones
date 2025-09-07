import { create } from 'zustand';

// Map store for managing different map types
export const useMapStore = create((set) => ({
    currentMapType: 'original', // Default to original map
    mapData: {
        original: {
            name: 'Original Map',
            terrainSize: 2000,
            type: 'grassland',
            loaded: false
        },
        desert: {
            name: 'Desert Map',
            terrainSize: 2000,
            type: 'desert',
            loaded: false
        }
    },
    // Function to switch maps - completely changes the rendered map
    setMapType: (mapType) => set({
        currentMapType: mapType,
        // Reset other state if needed during map change
        mapData: state => ({
            ...state.mapData,
            [mapType]: {
                ...state.mapData[mapType],
                loaded: true
            }
        })
    })
})); 