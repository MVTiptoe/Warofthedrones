import React, { useState, useEffect } from 'react';
import { useVehicleHealthStore } from '../../utils/VehicleHealthSystem';
import { getWeaponName } from '../../utils/WeaponPhysics';

/**
 * HUD component to display selected vehicle's health information
 */
const VehicleHealthHUD = ({ selectedVehicleId }) => {
    const [healthInfo, setHealthInfo] = useState(null);
    const getVehicleHealth = useVehicleHealthStore(state => state.getVehicleHealth);

    // Update health info when selectedVehicleId changes
    useEffect(() => {
        if (!selectedVehicleId) {
            setHealthInfo(null);
            return;
        }

        // Get initial health data
        updateHealthInfo();

        // Set up interval to periodically update health info
        const interval = setInterval(updateHealthInfo, 500);

        return () => clearInterval(interval);

        function updateHealthInfo() {
            const health = getVehicleHealth(selectedVehicleId);
            setHealthInfo(health);
        }
    }, [selectedVehicleId, getVehicleHealth]);

    if (!healthInfo) {
        return null;
    }

    // Calculate health percentage for display
    const healthPercent = Math.floor((healthInfo.currentHealth / healthInfo.maxHealth) * 100);

    // Determine color based on health level
    const getHealthColor = () => {
        if (healthPercent > 70) return '#44ff44'; // Green
        if (healthPercent > 40) return '#ffff44'; // Yellow
        if (healthPercent > 20) return '#ff8844'; // Orange
        return '#ff4444'; // Red
    };

    // Get a description of the vehicle's status
    const getStatusDescription = () => {
        if (healthInfo.isDead) return 'DESTROYED';
        if (healthInfo.isCritical) return 'CRITICAL';
        if (healthPercent < 60) return 'DAMAGED';
        return 'OPERATIONAL';
    };

    return (
        <div className="vehicle-health-hud">
            <h3>Vehicle Status: {healthInfo.type.replace(/_/g, ' ').toUpperCase()}</h3>

            <div className="health-bar-container">
                <div className="health-bar-label">
                    Health: {healthPercent}%
                </div>
                <div className="health-bar-outer">
                    <div
                        className="health-bar-inner"
                        style={{
                            width: `${healthPercent}%`,
                            backgroundColor: getHealthColor()
                        }}
                    />
                </div>
                <div className="health-status">
                    Status: {getStatusDescription()}
                </div>
            </div>

            {healthInfo.mobilityFactor < 1 && (
                <div className="mobility-info">
                    Mobility: {Math.floor(healthInfo.mobilityFactor * 100)}%
                </div>
            )}

            {healthInfo.visualEffects.length > 0 && (
                <div className="damage-effects">
                    Active Effects: {healthInfo.visualEffects.join(', ')}
                </div>
            )}

            {healthInfo.damageLog.length > 0 && (
                <div className="damage-log">
                    <h4>Recent Damage:</h4>
                    <ul>
                        {healthInfo.damageLog.slice(-3).map((event, index) => (
                            <li key={index}>
                                {event.weaponType ? getWeaponName(event.weaponType) : 'Unknown'} -
                                {Math.floor(event.finalDamage)} damage
                                {event.hitLocation && ` (${event.hitLocation})`}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default VehicleHealthHUD;

// CSS for the component
export const VehicleHealthHUDStyles = `
  .vehicle-health-hud {
    position: absolute;
    bottom: 20px;
    left: 20px;
    background-color: rgba(0, 0, 0, 0.7);
    border: 1px solid #444;
    border-radius: 5px;
    padding: 15px;
    color: white;
    font-family: 'Arial', sans-serif;
    width: 300px;
    z-index: 1000;
  }
  
  .vehicle-health-hud h3 {
    margin: 0 0 10px 0;
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .health-bar-container {
    margin-bottom: 10px;
  }
  
  .health-bar-label {
    margin-bottom: 5px;
    font-size: 14px;
  }
  
  .health-bar-outer {
    height: 20px;
    background-color: #333;
    border-radius: 10px;
    overflow: hidden;
  }
  
  .health-bar-inner {
    height: 100%;
    transition: width 0.3s ease, background-color 0.3s ease;
  }
  
  .health-status {
    margin-top: 5px;
    font-weight: bold;
    font-size: 14px;
  }
  
  .mobility-info {
    margin-top: 8px;
    font-size: 14px;
    color: #ffaa00;
  }
  
  .damage-effects {
    margin-top: 8px;
    font-size: 14px;
    color: #ff6666;
  }
  
  .damage-log {
    margin-top: 10px;
  }
  
  .damage-log h4 {
    margin: 0 0 5px 0;
    font-size: 14px;
  }
  
  .damage-log ul {
    margin: 0;
    padding: 0 0 0 20px;
    font-size: 12px;
  }
  
  .damage-log li {
    margin-bottom: 2px;
  }
`; 