import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useVehicleHealthStore } from '../../utils/VehicleHealthSystem';
import { WEAPON_TYPES } from '../../utils/WeaponPhysics';
import './VehicleDamageControls.css';

// Hit location options extracted as a constant
const HIT_LOCATIONS = [
    { value: 'body', label: 'Body' },
    { value: 'turret', label: 'Turret' },
    { value: 'tracks', label: 'Tracks/Wheels' },
    { value: 'rear', label: 'Rear' },
    { value: 'front', label: 'Front' },
    { value: 'cabin', label: 'Cabin' },
    { value: 'engine', label: 'Engine' },
    { value: 'cargo', label: 'Cargo' }
];

// Separate vehicle status component for better organization
const VehicleStatusDisplay = ({ vehicle, respawnInfo }) => {
    if (!vehicle) return null;

    const healthPercent = (vehicle.currentHealth / vehicle.maxHealth) * 100;
    const healthColor = vehicle.isDead ? 'red' : vehicle.isCritical ? 'orange' : 'green';
    const status = vehicle.isDestroyed ? 'DESTROYED' :
        vehicle.isDead ? 'DEAD' :
            vehicle.isCritical ? 'CRITICAL' : 'OPERATIONAL';

    return (
        <div className="vehicle-status">
            <h4>Vehicle Status</h4>
            <div className="health-bar">
                <div
                    className="health-bar-fill"
                    style={{
                        width: `${healthPercent}%`,
                        backgroundColor: healthColor
                    }}
                />
            </div>
            <p>Health: {Math.round(vehicle.currentHealth)} / {vehicle.maxHealth}</p>
            <p>Status: {status}</p>
            <p>Mobility: {Math.round(vehicle.mobilityFactor * 100)}%</p>

            {respawnInfo && (
                <div className="respawn-timer">
                    {respawnInfo.disappeared ? (
                        <p>Respawning in: {Math.ceil(respawnInfo.timeLeft / 1000)}s</p>
                    ) : (
                        <p>Disappearing in: {Math.ceil(respawnInfo.timeLeft / 1000)}s</p>
                    )}
                </div>
            )}

            <div className="effect-tags">
                {vehicle.visualEffects.map((effect, index) => (
                    <span key={index} className="effect-tag">{effect}</span>
                ))}
            </div>
        </div>
    );
};

// Separate respawn list component
const RespawnList = ({ respawnStatus, vehicleHealth }) => {
    if (Object.keys(respawnStatus).length === 0) {
        return <p>No vehicles in respawn queue</p>;
    }

    return (
        <ul>
            {Object.entries(respawnStatus).map(([id, status]) => {
                const vehicle = vehicleHealth[id];
                if (!vehicle) return null;

                return (
                    <li key={id}>
                        {vehicle.type} - {id.substring(0, 8)}:
                        {status.disappeared ? (
                            <span> Respawning in {Math.ceil(status.timeLeft / 1000)}s</span>
                        ) : (
                            <span> Disappearing in {Math.ceil(status.timeLeft / 1000)}s</span>
                        )}
                    </li>
                );
            })}
        </ul>
    );
};

/**
 * Control panel component for testing vehicle damage
 */
export const VehicleDamageControls = () => {
    // State management
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [selectedWeapon, setSelectedWeapon] = useState(WEAPON_TYPES.RPG);
    const [damageAmount, setDamageAmount] = useState(10);
    const [hitLocation, setHitLocation] = useState('body');
    const [respawnStatus, setRespawnStatus] = useState({});

    // Use ref to track timer interval
    const timerRef = useRef(null);

    // Get vehicle data from store
    const { vehicleHealth, applyDamage, repairVehicle } = useVehicleHealthStore();

    // Memoize the vehicle list to avoid recalculation
    const vehicleList = useMemo(() => Object.values(vehicleHealth), [vehicleHealth]);

    // Memoize the selected vehicle
    const selectedVehicle = useMemo(() =>
        vehicleHealth[selectedVehicleId],
        [vehicleHealth, selectedVehicleId]
    );

    // Select first vehicle by default if none selected
    useEffect(() => {
        if (vehicleList.length > 0 && !selectedVehicleId) {
            setSelectedVehicleId(vehicleList[0].id);
        }
    }, [vehicleList, selectedVehicleId]);

    // Memoized callback handlers
    const handleApplyDamage = useCallback(() => {
        if (selectedVehicleId) {
            applyDamage(selectedVehicleId, damageAmount, hitLocation, selectedWeapon);
        }
    }, [selectedVehicleId, damageAmount, hitLocation, selectedWeapon, applyDamage]);

    const handleRepair = useCallback(() => {
        if (selectedVehicleId) {
            repairVehicle(selectedVehicleId);
        }
    }, [selectedVehicleId, repairVehicle]);

    // Process respawn status updates
    const updateRespawnStatus = useCallback(() => {
        setRespawnStatus(prevStatus => {
            const updatedStatus = { ...prevStatus };
            let hasChanges = false;

            Object.keys(updatedStatus).forEach(id => {
                const status = updatedStatus[id];
                const now = Date.now();
                const currentSecond = Math.floor(status.timeLeft / 1000);

                if (status.disappeared) {
                    // Count down to respawn
                    const timeLeft = status.respawnAt - now;
                    const newSecond = Math.floor(timeLeft / 1000);

                    if (timeLeft <= 0) {
                        delete updatedStatus[id];
                        hasChanges = true;
                    } else if (newSecond !== currentSecond) {
                        updatedStatus[id] = { ...status, timeLeft };
                        hasChanges = true;
                    }
                } else {
                    // Count down to disappear
                    const timeLeft = status.disappearAt - now;
                    const newSecond = Math.floor(timeLeft / 1000);

                    if (timeLeft <= 0) {
                        updatedStatus[id] = {
                            disappeared: true,
                            respawnAt: status.respawnAt,
                            timeLeft: status.respawnAt - now
                        };
                        hasChanges = true;
                    } else if (newSecond !== currentSecond) {
                        updatedStatus[id] = { ...status, timeLeft };
                        hasChanges = true;
                    }
                }
            });

            return hasChanges ? updatedStatus : prevStatus;
        });
    }, []);

    // Track respawn timers
    useEffect(() => {
        // Process all vehicle data
        const processVehicleData = () => {
            const newRespawnStatus = {};
            let hasStatusChanges = false;

            // Check for destroyed vehicles
            vehicleList.forEach(vehicle => {
                if (vehicle.isDead || vehicle.isDestroyed) {
                    const existingStatus = respawnStatus[vehicle.id];
                    const now = Date.now();

                    if (!existingStatus) {
                        // New death, start tracking
                        hasStatusChanges = true;

                        if (vehicle.isDead && !vehicle.isDestroyed) {
                            // Vehicle just died, will disappear in 5 seconds
                            newRespawnStatus[vehicle.id] = {
                                disappearAt: now + 5000,
                                respawnAt: now + 35000, // 5s + 30s
                                timeLeft: 5000
                            };
                        } else if (vehicle.isDestroyed) {
                            // Vehicle is already destroyed
                            const respawnAt = now + 30000;
                            newRespawnStatus[vehicle.id] = {
                                disappeared: true,
                                respawnAt,
                                timeLeft: respawnAt - now
                            };
                        }
                    } else {
                        // Continue tracking existing timers
                        newRespawnStatus[vehicle.id] = existingStatus;
                    }
                }
            });

            // Update state if we have new entries or entries to remove
            if (hasStatusChanges || Object.keys(respawnStatus).some(id => !newRespawnStatus[id])) {
                setRespawnStatus(prev => {
                    // Only keep the existing status for vehicles that still need it
                    const mergedStatus = {};

                    // Add all new status entries
                    Object.keys(newRespawnStatus).forEach(id => {
                        mergedStatus[id] = newRespawnStatus[id] || prev[id];
                    });

                    return mergedStatus;
                });
            }
        };

        // Initial process of vehicle data
        processVehicleData();

        // Setup timer for countdown
        timerRef.current = setInterval(updateRespawnStatus, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [vehicleList, updateRespawnStatus]);

    // Render helper functions
    const renderVehicleSelector = () => (
        <div className="control-group">
            <label>
                Vehicle:
                <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                >
                    {vehicleList.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.type} - {vehicle.id.substring(0, 8)}
                            {vehicle.isDead ? " (DEAD)" : ""}
                            {vehicle.isDestroyed ? " (DESTROYED)" : ""}
                        </option>
                    ))}
                </select>
            </label>
        </div>
    );

    const renderDamageControls = () => (
        <>
            <div className="control-group">
                <label>
                    Damage Amount:
                    <input
                        type="range"
                        min="1"
                        max="50"
                        value={damageAmount}
                        onChange={(e) => setDamageAmount(parseInt(e.target.value))}
                    />
                    <span>{damageAmount}</span>
                </label>
            </div>

            <div className="control-group">
                <label>
                    Weapon Type:
                    <select
                        value={selectedWeapon}
                        onChange={(e) => setSelectedWeapon(e.target.value)}
                    >
                        {Object.values(WEAPON_TYPES).map((weaponType) => (
                            <option key={weaponType} value={weaponType}>
                                {weaponType.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="control-group">
                <label>
                    Hit Location:
                    <select
                        value={hitLocation}
                        onChange={(e) => setHitLocation(e.target.value)}
                    >
                        {HIT_LOCATIONS.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </label>
            </div>
        </>
    );

    const renderActionButtons = () => (
        <div className="button-group">
            <button
                onClick={handleApplyDamage}
                disabled={!selectedVehicleId || selectedVehicle?.isDestroyed}
                className="damage-button"
            >
                Apply Damage
            </button>
            <button
                onClick={handleRepair}
                disabled={
                    !selectedVehicleId ||
                    selectedVehicle?.isDestroyed ||
                    (selectedVehicle?.currentHealth === selectedVehicle?.maxHealth)
                }
                className="repair-button"
            >
                Repair
            </button>
        </div>
    );

    return (
        <div className="vehicle-damage-controls">
            <h3>Vehicle Damage Controls</h3>

            {renderVehicleSelector()}
            {renderDamageControls()}

            {selectedVehicle && (
                <VehicleStatusDisplay
                    vehicle={selectedVehicle}
                    respawnInfo={respawnStatus[selectedVehicleId]}
                />
            )}

            {renderActionButtons()}

            <div className="respawn-list">
                <h4>Respawn Timers</h4>
                <RespawnList
                    respawnStatus={respawnStatus}
                    vehicleHealth={vehicleHealth}
                />
            </div>
        </div>
    );
};

export default React.memo(VehicleDamageControls); 