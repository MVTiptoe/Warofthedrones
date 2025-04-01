// Vehicle components index file
import TankVehicles, { TankA, TankB } from './TankVehicles';
import IFVVehicles, { IFV_A, IFV_B } from './IFVVehicles';
import TruckVehicles, {
    CivilianTruck1, CivilianTruck2, CivilianTruck3,
    MilitaryTruck1, MilitaryTruck2, MilitaryTruck3,
    civilianTrucks, militaryTrucks
} from './TruckVehicles';
import CarVehicles, { CarA, CarB, CarC } from './CarVehicles';

// Grouped exports
export const Tanks = TankVehicles;
export const IFVs = IFVVehicles;
export const Trucks = TruckVehicles;
export const Cars = CarVehicles;

// Individual exports
export {
    // Tanks
    TankA, TankB,

    // IFVs
    IFV_A, IFV_B,

    // Trucks - Civilian
    CivilianTruck1, CivilianTruck2, CivilianTruck3,
    civilianTrucks,

    // Trucks - Military
    MilitaryTruck1, MilitaryTruck2, MilitaryTruck3,
    militaryTrucks,

    // Cars
    CarA, CarB, CarC
};

// Vehicle type mapping for dynamic usage
export const VehicleTypes = {
    // Tanks
    tank_a: TankA,
    tank_b: TankB,

    // IFVs
    ifv_a: IFV_A,
    ifv_b: IFV_B,

    // Civilian Trucks
    civilian_truck_1: CivilianTruck1,
    civilian_truck_2: CivilianTruck2,
    civilian_truck_3: CivilianTruck3,

    // Military Trucks
    military_truck_1: MilitaryTruck1,
    military_truck_2: MilitaryTruck2,
    military_truck_3: MilitaryTruck3,

    // Cars
    car_a: CarA,
    car_b: CarB,
    car_c: CarC
};

export default {
    Tanks,
    IFVs,
    Trucks,
    Cars,
    VehicleTypes
}; 