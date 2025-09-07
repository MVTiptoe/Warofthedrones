import React from 'react';
import { useDrones, DRONE_TYPES } from '../utils/GameContext';
import PlayerController from './player/PlayerController';
import Grenadier from './drones/Grenadier';
import Kamikaze from './drones/Kamikaze';
import Bomber from './drones/Bomber';

export default function DroneSwitcher({ world }) {
  const { currentDrone } = useDrones();

  // Render the appropriate drone based on the selection
  switch (currentDrone) {
    case DRONE_TYPES.PLAYER:
      return <PlayerController world={world} />;
    case DRONE_TYPES.KAMIKAZE:
      return <Kamikaze />;
    case DRONE_TYPES.BOMBER:
      return <Bomber />;
    case DRONE_TYPES.GRENADIER:
    default:
      return <Grenadier />;
  }
} 