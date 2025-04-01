import React from 'react';
import { useDrones, DRONE_TYPES } from '../utils/DronesContext';
import Grenadier from './drones/Grenadier';
import Kamikaze from './drones/Kamikaze';
import Bomber from './drones/Bomber';

export default function DroneSwitcher() {
  const { currentDrone } = useDrones();

  // Render the appropriate drone based on the selection
  switch (currentDrone) {
    case DRONE_TYPES.KAMIKAZE:
      return <Kamikaze />;
    case DRONE_TYPES.BOMBER:
      return <Bomber />;
    case DRONE_TYPES.GRENADIER:
    default:
      return <Grenadier />;
  }
} 