import { withVehicleHealth } from './withVehicleHealth';
import {
    TankA, TankB,
    IFV_A, IFV_B,
    CivilianTruck1, CivilianTruck2, CivilianTruck3,
    MilitaryTruck1, MilitaryTruck2, MilitaryTruck3,
    CarA, CarB, CarC
} from './index';

// Enhance individual vehicles with health system
export const EnhancedTankA = withVehicleHealth(TankA, 'tank_a');
export const EnhancedTankB = withVehicleHealth(TankB, 'tank_b');

export const EnhancedIFV_A = withVehicleHealth(IFV_A, 'ifv_a');
export const EnhancedIFV_B = withVehicleHealth(IFV_B, 'ifv_b');

export const EnhancedCivilianTruck1 = withVehicleHealth(CivilianTruck1, 'civilian_truck_1');
export const EnhancedCivilianTruck2 = withVehicleHealth(CivilianTruck2, 'civilian_truck_2');
export const EnhancedCivilianTruck3 = withVehicleHealth(CivilianTruck3, 'civilian_truck_3');

export const EnhancedMilitaryTruck1 = withVehicleHealth(MilitaryTruck1, 'military_truck_1');
export const EnhancedMilitaryTruck2 = withVehicleHealth(MilitaryTruck2, 'military_truck_2');
export const EnhancedMilitaryTruck3 = withVehicleHealth(MilitaryTruck3, 'military_truck_3');

export const EnhancedCarA = withVehicleHealth(CarA, 'car_a');
export const EnhancedCarB = withVehicleHealth(CarB, 'car_b');
export const EnhancedCarC = withVehicleHealth(CarC, 'car_c');

// Group vehicles by category
export const EnhancedTanks = {
    TankA: EnhancedTankA,
    TankB: EnhancedTankB
};

export const EnhancedIFVs = {
    IFV_A: EnhancedIFV_A,
    IFV_B: EnhancedIFV_B
};

export const EnhancedCivilianTrucks = [
    EnhancedCivilianTruck1,
    EnhancedCivilianTruck2,
    EnhancedCivilianTruck3
];

export const EnhancedMilitaryTrucks = [
    EnhancedMilitaryTruck1,
    EnhancedMilitaryTruck2,
    EnhancedMilitaryTruck3
];

export const EnhancedCars = {
    CarA: EnhancedCarA,
    CarB: EnhancedCarB,
    CarC: EnhancedCarC
};

// Vehicle type mapping for dynamic usage with health-enhanced versions
export const EnhancedVehicleTypes = {
    // Tanks
    tank_a: EnhancedTankA,
    tank_b: EnhancedTankB,

    // IFVs
    ifv_a: EnhancedIFV_A,
    ifv_b: EnhancedIFV_B,

    // Civilian Trucks
    civilian_truck_1: EnhancedCivilianTruck1,
    civilian_truck_2: EnhancedCivilianTruck2,
    civilian_truck_3: EnhancedCivilianTruck3,

    // Military Trucks
    military_truck_1: EnhancedMilitaryTruck1,
    military_truck_2: EnhancedMilitaryTruck2,
    military_truck_3: EnhancedMilitaryTruck3,

    // Cars
    car_a: EnhancedCarA,
    car_b: EnhancedCarB,
    car_c: EnhancedCarC
};

export default EnhancedVehicleTypes; 