import React from 'react';
import * as THREE from 'three';

// Shared materials to improve performance
const SHARED_MATERIALS = {
  black: new THREE.MeshStandardMaterial({ color: "#222" }),
  darkGray: new THREE.MeshStandardMaterial({ color: "#444" }),
  oliveGreen: new THREE.MeshStandardMaterial({ color: "#4d5d28" }),
  midBlue: new THREE.MeshStandardMaterial({ color: "#3498DB" }),
  purple: new THREE.MeshStandardMaterial({ color: "#9B59B6" }),
  headlight: new THREE.MeshStandardMaterial({
    color: "#FFFFFF",
    emissive: "#FFFFCC",
    emissiveIntensity: 0.5
  }),
  windshield: new THREE.MeshStandardMaterial({
    color: "#87CEEB",
    transparent: true,
    opacity: 0.7
  })
};

/* Civilian Truck Vehicles */
/* Civilian Truck 1 – A simplified two-part truck with a cab and trailer */
export const CivilianTruck1 = (props) => (
  <group {...props}>
    {/* Cab */}
    <group position={[0, 0.75, -2.2]}>
      <mesh>
        <boxGeometry args={[2, 1.3, 1.8]} />
        <meshStandardMaterial color="#778899" />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 0.3, -0.9]}>
        <boxGeometry args={[1.6, 0.4, 0.1]} />
        <meshStandardMaterial {...SHARED_MATERIALS.windshield} />
      </mesh>
      {/* Headlights */}
      <mesh position={[0, -0.3, -0.95]}>
        <boxGeometry args={[1.2, 0.2, 0.05]} />
        <meshStandardMaterial {...SHARED_MATERIALS.headlight} />
      </mesh>
    </group>
    {/* Cargo area */}
    <group position={[0, 0.85, 0.8]}>
      <mesh>
        <boxGeometry args={[2.2, 1.5, 3.8]} />
        <meshStandardMaterial color="#A9A9A9" />
      </mesh>
      {/* Decorative stripe */}
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[2.25, 0.1, 3.85]} />
        <meshStandardMaterial color="#CBD5E0" /> {/* Light gray */}
      </mesh>
    </group>
    {/* Wheels - thinner width */}
    {[
      { pos: [-1.0, 0.4, -2.2] },
      { pos: [1.0, 0.4, -2.2] },
      { pos: [-1.1, 0.4, 0.6] },
      { pos: [1.1, 0.4, 0.6] },
      { pos: [-1.1, 0.4, 2] },
      { pos: [1.1, 0.4, 2] }
    ].map((wheel, i) => (
      <mesh key={i} position={wheel.pos} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.22, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    ))}

    {/* Named mesh for hit detection */}
    <mesh position={[0, 0, 0]} visible={false} name="body">
      <boxGeometry args={[2.2, 1.5, 5.0]} />
      <meshStandardMaterial color="red" wireframe opacity={0.1} transparent />
    </mesh>
  </group>
);

/* Civilian Truck 2 – A simplified modern truck with integrated design */
export const CivilianTruck2 = (props) => (
  <group {...props}>
    {/* Cab */}
    <group position={[0, 0.75, -2.2]}>
      <mesh>
        <boxGeometry args={[2, 1.3, 1.8]} />
        <meshStandardMaterial color="#708090" />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 0.3, -0.9]}>
        <boxGeometry args={[1.6, 0.4, 0.1]} />
        <meshStandardMaterial {...SHARED_MATERIALS.windshield} />
      </mesh>
      {/* Headlights */}
      <mesh position={[0, -0.3, -0.95]}>
        <boxGeometry args={[1.2, 0.2, 0.05]} />
        <meshStandardMaterial {...SHARED_MATERIALS.headlight} />
      </mesh>
    </group>
    {/* Cargo area */}
    <group position={[0, 0.85, 0.8]}>
      <mesh>
        <boxGeometry args={[2.2, 1.5, 3.8]} />
        <meshStandardMaterial color="#696969" />
      </mesh>
      {/* Decorative stripe */}
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[2.25, 0.1, 3.85]} />
        <meshStandardMaterial color="#CBD5E0" /> {/* Light gray */}
      </mesh>
    </group>
    {/* Wheels - thinner width */}
    {[
      { pos: [-1.0, 0.4, -2.2] },
      { pos: [1.0, 0.4, -2.2] },
      { pos: [-1.1, 0.4, 0.6] },
      { pos: [1.1, 0.4, 0.6] },
      { pos: [-1.1, 0.4, 2] },
      { pos: [1.1, 0.4, 2] }
    ].map((wheel, i) => (
      <mesh key={i} position={wheel.pos} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.22, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    ))}

    {/* Named mesh for hit detection */}
    <mesh position={[0, 0, 0]} visible={false} name="body">
      <boxGeometry args={[2.2, 1.5, 5.0]} />
      <meshStandardMaterial color="red" wireframe opacity={0.1} transparent />
    </mesh>
  </group>
);

/* Civilian Truck 3 – A design similar to Truck 2 but with different colors */
export const CivilianTruck3 = (props) => (
  <group {...props}>
    {/* Cab */}
    <group position={[0, 0.75, -2.2]}>
      <mesh>
        <boxGeometry args={[2, 1.3, 1.8]} />
        <meshStandardMaterial color="#7D7D7D" /> {/* Lighter grey */}
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 0.3, -0.9]}>
        <boxGeometry args={[1.6, 0.4, 0.1]} />
        <meshStandardMaterial {...SHARED_MATERIALS.windshield} />
      </mesh>
      {/* Headlights */}
      <mesh position={[0, -0.3, -0.95]}>
        <boxGeometry args={[1.2, 0.2, 0.05]} />
        <meshStandardMaterial {...SHARED_MATERIALS.headlight} />
      </mesh>
    </group>
    {/* Cargo area */}
    <group position={[0, 0.85, 0.8]}>
      <mesh>
        <boxGeometry args={[2.2, 1.5, 3.8]} />
        <meshStandardMaterial color="#2C5282" /> {/* Darker blue */}
      </mesh>
      {/* Decorative stripe */}
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[2.25, 0.1, 3.85]} />
        <meshStandardMaterial color="#CBD5E0" /> {/* Light gray */}
      </mesh>
    </group>
    {/* Wheels - thinner width */}
    {[
      { pos: [-1.0, 0.4, -2.2] },
      { pos: [1.0, 0.4, -2.2] },
      { pos: [-1.1, 0.4, 0.6] },
      { pos: [1.1, 0.4, 0.6] },
      { pos: [-1.1, 0.4, 2] },
      { pos: [1.1, 0.4, 2] }
    ].map((wheel, i) => (
      <mesh key={i} position={wheel.pos} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.22, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    ))}

    {/* Named mesh for hit detection */}
    <mesh position={[0, 0, 0]} visible={false} name="body">
      <boxGeometry args={[2.2, 1.5, 5.0]} />
      <meshStandardMaterial color="red" wireframe opacity={0.1} transparent />
    </mesh>
  </group>
);

/* Military Truck Vehicles */

/* Military Truck 1 – A heavily armored truck with reinforced plating and visible mechanical details */
export const MilitaryTruck1 = (props) => (
  <group {...props}>
    {/* Cab section - raised slightly */}
    <mesh position={[0, 0.8, -2]}>
      <boxGeometry args={[1.8, 1.4, 1.8]} />
      <meshStandardMaterial color="#556B2F" />
    </mesh>
    {/* Main cargo/troop section - raised slightly */}
    <mesh position={[0, 0.8, 0.8]}>
      <boxGeometry args={[1.8, 1.4, 3.6]} />
      <meshStandardMaterial color="#556B2F" />
    </mesh>
    {/* Additional armor layer - fixed position to prevent z-fighting */}
    <mesh position={[0, 1.51, -2]}>
      <boxGeometry args={[1.7, 0.25, 1.7]} />
      <meshStandardMaterial color="#6B8E23" />
    </mesh>
    <mesh position={[0, 1.51, 0.8]}>
      <boxGeometry args={[1.7, 0.25, 3.5]} />
      <meshStandardMaterial color="#6B8E23" />
    </mesh>

    {/* Side armor panels - raised slightly */}
    <mesh position={[-1.0, 0.8, -2]}>
      <boxGeometry args={[0.15, 1.2, 1.8]} />
      <meshStandardMaterial color="#4d5d28" />
    </mesh>
    <mesh position={[1.0, 0.8, -2]}>
      <boxGeometry args={[0.15, 1.2, 1.8]} />
      <meshStandardMaterial color="#4d5d28" />
    </mesh>
    <mesh position={[-1.0, 0.8, 0.8]}>
      <boxGeometry args={[0.15, 1.2, 3.6]} />
      <meshStandardMaterial color="#4d5d28" />
    </mesh>
    <mesh position={[1.0, 0.8, 0.8]}>
      <boxGeometry args={[0.15, 1.2, 3.6]} />
      <meshStandardMaterial color="#4d5d28" />
    </mesh>

    {/* Smaller wheels - keeping the same height */}
    {[
      { pos: [-0.9, 0.4, -2] },
      { pos: [0.9, 0.4, -2] },
      { pos: [-0.9, 0.4, 0] },
      { pos: [0.9, 0.4, 0] },
      { pos: [-0.9, 0.4, 1.6] },
      { pos: [0.9, 0.4, 1.6] },
    ].map((wheel, i) => (
      <mesh key={i} position={wheel.pos} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.35, 0.35, 0.25, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    ))}
  </group>
);

/* Military Truck 2 – A simplified rugged design with less detail */
export const MilitaryTruck2 = (props) => (
  <group {...props}>
    {/* Cab section - raised slightly */}
    <mesh position={[0, 0.7, -2.2]}>
      <boxGeometry args={[1.8, 1.2, 1.9]} />
      <meshStandardMaterial color="#4B5320" /> {/* Olive drab */}
    </mesh>
    {/* Main cargo/troop section - raised slightly */}
    <mesh position={[0, 0.7, 0.9]}>
      <boxGeometry args={[1.8, 1.2, 3.8]} />
      <meshStandardMaterial color="#4B5320" /> {/* Olive drab */}
    </mesh>

    {/* Armor plating overlay - raised slightly */}
    <mesh position={[0, 1.4, -2.2]}>
      <boxGeometry args={[1.9, 0.3, 2]} />
      <meshStandardMaterial color="#5E6142" /> {/* Darker olive */}
    </mesh>
    <mesh position={[0, 1.4, 0.9]}>
      <boxGeometry args={[1.9, 0.3, 3.9]} />
      <meshStandardMaterial color="#5E6142" /> {/* Darker olive */}
    </mesh>
    {/* Reinforced bumper - raised slightly */}
    <mesh position={[0, 0.5, -3.2]}>
      <boxGeometry args={[1.9, 0.6, 0.2]} />
      <meshStandardMaterial color="#3A3A3A" /> {/* Dark gunmetal */}
    </mesh>
    {/* Simplified side-mounted equipment - raised slightly */}
    <mesh position={[-1.0, 0.8, -2.2]}>
      <boxGeometry args={[0.2, 0.4, 1.8]} />
      <meshStandardMaterial color="#3D3D29" /> {/* Dark khaki */}
    </mesh>
    <mesh position={[1.0, 0.8, -2.2]}>
      <boxGeometry args={[0.2, 0.4, 1.8]} />
      <meshStandardMaterial color="#3D3D29" /> {/* Dark khaki */}
    </mesh>
    <mesh position={[-1.0, 0.8, 0.9]}>
      <boxGeometry args={[0.2, 0.4, 3.6]} />
      <meshStandardMaterial color="#3D3D29" /> {/* Dark khaki */}
    </mesh>
    <mesh position={[1.0, 0.8, 0.9]}>
      <boxGeometry args={[0.2, 0.4, 3.6]} />
      <meshStandardMaterial color="#3D3D29" /> {/* Dark khaki */}
    </mesh>

    {/* Front wheels - smaller - keeping the same height */}
    {[
      { pos: [-0.9, 0.4, -2.2] },
      { pos: [0.9, 0.4, -2.2] }
    ].map((wheel, i) => (
      <mesh key={i} position={wheel.pos} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.36, 0.36, 0.25, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    ))}
    {/* Rear wheels - dual wheel setup - smaller - keeping the same height */}
    {[
      { pos: [-0.9, 0.4, 0.6] },
      { pos: [0.9, 0.4, 0.6] },
      { pos: [-0.9, 0.4, 2] },
      { pos: [0.9, 0.4, 2] }
    ].map((wheel, i) => (
      <mesh key={i + 2} position={wheel.pos} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.36, 0.36, 0.25, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    ))}
  </group>
);

/* Military Truck 3 – A tactical truck with a reinforced top and additional equipment mounts */
export const MilitaryTruck3 = (props) => (
  <group {...props}>
    {/* Cab section - raised slightly */}
    <mesh position={[0, 0.75, -2]}>
      <boxGeometry args={[1.8, 1.1, 1.8]} />
      <meshStandardMaterial color="#5D5D3C" /> {/* Military tan/olive */}
    </mesh>
    {/* Cargo/troop section - raised slightly */}
    <mesh position={[0, 0.75, 0.8]}>
      <boxGeometry args={[1.8, 1.1, 3.6]} />
      <meshStandardMaterial color="#5D5D3C" /> {/* Military tan/olive */}
    </mesh>
    {/* Reinforced roof - raised slightly */}
    <mesh position={[0, 1.45, -2]}>
      <boxGeometry args={[1.9, 0.3, 1.9]} />
      <meshStandardMaterial color="#6E7B58" /> {/* Lighter olive */}
    </mesh>
    <mesh position={[0, 1.45, 0.8]}>
      <boxGeometry args={[1.9, 0.3, 3.7]} />
      <meshStandardMaterial color="#6E7B58" /> {/* Lighter olive */}
    </mesh>


    {/* Side storage boxes - raised slightly */}
    <mesh position={[-1.0, 0.7, -2]}>
      <boxGeometry args={[0.2, 0.5, 1.6]} />
      <meshStandardMaterial color="#515141" /> {/* Dark olive drab */}
    </mesh>
    <mesh position={[1.0, 0.7, -2]}>
      <boxGeometry args={[0.2, 0.5, 1.6]} />
      <meshStandardMaterial color="#515141" /> {/* Dark olive drab */}
    </mesh>
    <mesh position={[-1.0, 0.7, 0]}>
      <boxGeometry args={[0.2, 0.5, 1.8]} />
      <meshStandardMaterial color="#515141" /> {/* Dark olive drab */}
    </mesh>
    <mesh position={[1.0, 0.7, 0]}>
      <boxGeometry args={[0.2, 0.5, 1.8]} />
      <meshStandardMaterial color="#515141" /> {/* Dark olive drab */}
    </mesh>
    <mesh position={[-1.0, 0.7, 1.8]}>
      <boxGeometry args={[0.2, 0.5, 1.8]} />
      <meshStandardMaterial color="#515141" /> {/* Dark olive drab */}
    </mesh>
    <mesh position={[1.0, 0.7, 1.8]}>
      <boxGeometry args={[0.2, 0.5, 1.8]} />
      <meshStandardMaterial color="#515141" /> {/* Dark olive drab */}
    </mesh>
    {/* Front wheels - smaller - keeping the same height */}
    {[
      { pos: [-0.9, 0.4, -2] },
      { pos: [0.9, 0.4, -2] }
    ].map((wheel, i) => (
      <mesh key={i} position={wheel.pos} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.33, 0.33, 0.25, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    ))}
    {/* Middle and rear wheels - smaller - keeping the same height */}
    {[
      { pos: [-0.9, 0.4, 0] },
      { pos: [0.9, 0.4, 0] },
      { pos: [-0.9, 0.4, 1.8] },
      { pos: [0.9, 0.4, 1.8] }
    ].map((wheel, i) => (
      <mesh key={i + 2} position={wheel.pos} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.33, 0.33, 0.25, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    ))}
  </group>
);

export const civilianTrucks = { CivilianTruck1, CivilianTruck2, CivilianTruck3 };
export const militaryTrucks = { MilitaryTruck1, MilitaryTruck2, MilitaryTruck3 };

export default { ...civilianTrucks, ...militaryTrucks }; 