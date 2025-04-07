import React, { useState, useEffect } from 'react';
import { useDrones, DRONE_TYPES } from '../utils/DronesContext';
import { BomberHUD } from './drones/Bomber';
import { GrenadierHUD } from './drones/Grenadier';
import { KamikazeHUD } from './drones/Kamikaze';

export default function DroneHUDs() {
    const { currentDrone } = useDrones();
    const showHUD = true; // Always show HUD

    // Weapon ammo states - in a real app these would be shared with the drone components
    const [bomberAmmo, setBomberAmmo] = useState({
        mineAmmo: 3,
        mortarAmmo: 5,
        rpgAmmo: 4
    });

    const [grenadierAmmo, setGrenadierAmmo] = useState({
        shotgunAmmo: 12,
        grenadeAmmo: 6,
        dartAmmo: 9
    });

    // Listen for weapon-related events from window
    useEffect(() => {
        // Event listeners to update ammo counts
        const handleAmmoUpdate = (e) => {
            const { droneType, weaponType, ammoCount } = e.detail;

            if (droneType === DRONE_TYPES.BOMBER) {
                setBomberAmmo(prev => ({
                    ...prev,
                    [weaponType]: ammoCount
                }));
            } else if (droneType === DRONE_TYPES.GRENADIER) {
                setGrenadierAmmo(prev => ({
                    ...prev,
                    [weaponType]: ammoCount
                }));
            }
        };

        window.addEventListener('ammoUpdate', handleAmmoUpdate);

        return () => {
            window.removeEventListener('ammoUpdate', handleAmmoUpdate);
        };
    }, []);

    // Render the appropriate HUD based on the current drone
    switch (currentDrone) {
        case DRONE_TYPES.BOMBER:
            return (
                <BomberHUD
                    mineAmmo={bomberAmmo.mineAmmo}
                    mortarAmmo={bomberAmmo.mortarAmmo}
                    rpgAmmo={bomberAmmo.rpgAmmo}
                    showHUD={showHUD}
                />
            );
        case DRONE_TYPES.GRENADIER:
            return (
                <GrenadierHUD
                    shotgunAmmo={grenadierAmmo.shotgunAmmo}
                    grenadeAmmo={grenadierAmmo.grenadeAmmo}
                    dartAmmo={grenadierAmmo.dartAmmo}
                    showHUD={showHUD}
                />
            );
        case DRONE_TYPES.KAMIKAZE:
            return (
                <KamikazeHUD
                    showHUD={showHUD}
                />
            );
        default:
            return null;
    }
} 