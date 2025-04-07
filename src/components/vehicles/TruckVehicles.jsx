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
    {/* Simplified truck cab */}
    <group position={[0, 0.7, -2.5]}>
      <mesh>
        <boxGeometry args={[2.2, 1.2, 1.8]} />
        <meshStandardMaterial color="#778899" />
      </mesh>
      {/* Simple windshield - fixed material reference */}
      <mesh position={[0, 0.2, -0.9]}>
        <boxGeometry args={[1.8, 0.5, 0.1]} />
        <meshStandardMaterial {...SHARED_MATERIALS.windshield} />
      </mesh>
      {/* Basic front lights */}
      <mesh position={[0, -0.2, -0.95]}>
        <boxGeometry args={[1.4, 0.2, 0.05]} />
        <meshStandardMaterial {...SHARED_MATERIALS.headlight} />
      </mesh>
    </group>
    {/* Basic trailer */}
    <group position={[0, 0.7, 1]}>
      <mesh>
        <boxGeometry args={[2.4, 1.5, 3.6]} />
        <meshStandardMaterial color="#A9A9A9" />
      </mesh>
    </group>
    {/* Simple wheels - properly aligned with vehicle dimensions */}
    {[
      { pos: [-0.9, 0.3, -2.5] },
      { pos: [0.9, 0.3, -2.5] },
      { pos: [-0.9, 0.3, 0.3] },
      { pos: [0.9, 0.3, 0.3] },
      { pos: [-0.9, 0.3, 2.2] },
      { pos: [0.9, 0.3, 2.2] }
    ].map((wheel, i) => (
      <mesh key={i} position={wheel.pos} name="wheels">
        <cylinderGeometry args={[0.45, 0.45, 0.3, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    ))}

    {/* Named mesh for hit detection - helps with proper hitbox calculation */}
    <mesh position={[0, 0, 0]} visible={false} name="body">
      <boxGeometry args={[2.3, 1.4, 6.2]} />
      <meshStandardMaterial color="red" wireframe opacity={0.1} transparent />
    </mesh>
  </group>
);

/* Civilian Truck 2 – A simplified modern truck with integrated design */
export const CivilianTruck2 = (props) => (
  <group {...props}>
    {/* Basic cab */}
    <group position={[0, 0.75, -2.2]}>
      <mesh>
        <boxGeometry args={[2, 1.3, 1.8]} />
        <meshStandardMaterial color="#708090" />
      </mesh>
      {/* Simple windshield */}
      <mesh position={[0, 0.3, -0.9]}>
        <boxGeometry args={[1.6, 0.4, 0.1]} />
        <meshStandardMaterial color="#87CEEB" transparent={true} opacity={0.7} />
      </mesh>
      {/* Basic headlights */}
      <mesh position={[0, -0.3, -0.95]}>
        <boxGeometry args={[1.2, 0.2, 0.05]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFCC" emissiveIntensity={0.5} />
      </mesh>
    </group>
    {/* Simple cargo area */}
    <group position={[0, 0.85, 0.8]}>
      <mesh>
        <boxGeometry args={[2.2, 1.5, 3.8]} />
        <meshStandardMaterial color="#696969" />
      </mesh>
    </group>
    {/* Basic wheels */}
    {[
      { pos: [-0.8, 0.3, -2.2] },
      { pos: [0.8, 0.3, -2.2] },
      { pos: [-0.8, 0.3, 0.6] },
      { pos: [0.8, 0.3, 0.6] },
      { pos: [-0.8, 0.3, 2] },
      { pos: [0.8, 0.3, 2] }
    ].map((wheel, i) => (
      <mesh key={i} position={wheel.pos}>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    ))}
  </group>
);

/* Civilian Truck 3 – A retro design featuring a boxy cab and a spacious trailer with accent details */
export const CivilianTruck3 = (props) => (
  <group {...props}>
    {/* Boxy cab with decorative side stripe */}
    <group position={[0, 0.65, -2.3]}>
      <mesh>
        <boxGeometry args={[2.2, 1.1, 1.7]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
      <mesh position={[0, 0.4, -0.85]}>
        <boxGeometry args={[1.8, 0.2, 0.1]} />
        <meshStandardMaterial color="#ADFF2F" />
      </mesh>
      {/* Vintage-style radiator grille */}
      <mesh position={[0, 0, -0.9]}>
        <boxGeometry args={[1.6, 0.6, 0.1]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Chrome bumper */}
      <mesh position={[0, -0.4, -0.9]}>
        <boxGeometry args={[1.8, 0.2, 0.2]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Round headlights */}
      {[-0.6, 0.6].map((x, i) => (
        <mesh key={`retro-hl-${i}`} position={[x, 0.1, -0.95]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 8]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#FFFACD" emissive="#FFFF66" />
        </mesh>
      ))}
    </group>
    {/* Large trailer with panel lines */}
    <group position={[0, 0.65, 0.8]}>
      <mesh>
        <boxGeometry args={[2.4, 1.1, 3.8]} />
        <meshStandardMaterial color="#90EE90" />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[2.2, 0.3, 3.6]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
      {/* Side panel details */}
      {[-1.2, -0.4, 0.4, 1.2, 2].map((z, i) => (
        <mesh key={`panel-${i}`} position={[-1.2, 0, z]}>
          <boxGeometry args={[0.05, 0.8, 0.1]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
      ))}
      {[-1.2, -0.4, 0.4, 1.2, 2].map((z, i) => (
        <mesh key={`panel2-${i}`} position={[1.2, 0, z]}>
          <boxGeometry args={[0.05, 0.8, 0.1]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
      ))}
    </group>
    {/* Wheels */}
    {[
      { pos: [-0.9, 0.3, -2.3] },
      { pos: [0.9, 0.3, -2.3] },
      { pos: [-0.9, 0.3, 0] },
      { pos: [0.9, 0.3, 0] },
      { pos: [-0.9, 0.3, 1.8] },
      { pos: [0.9, 0.3, 1.8] }
    ].map((wheel, i) => (
      <mesh key={i} position={wheel.pos}>
        <cylinderGeometry args={[0.45, 0.45, 0.35, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    ))}
  </group>
);

/* Military Truck Vehicles */

/* Military Truck 1 – A heavily armored truck with reinforced plating and visible mechanical details */
export const MilitaryTruck1 = (props) => (
  <group {...props}>
    {/* Cab section */}
    <mesh position={[0, 0.7, -2]}>
      <boxGeometry args={[2.4, 1.5, 1.8]} />
      <meshStandardMaterial color="#556B2F" />
    </mesh>
    {/* Main cargo/troop section */}
    <mesh position={[0, 0.7, 0.8]}>
      <boxGeometry args={[2.4, 1.5, 3.6]} />
      <meshStandardMaterial color="#556B2F" />
    </mesh>
    {/* Additional armor layer */}
    <mesh position={[0, 1.25, -2]}>
      <boxGeometry args={[2.5, 0.3, 1.9]} />
      <meshStandardMaterial color="#6B8E23" />
    </mesh>
    <mesh position={[0, 1.25, 0.8]}>
      <boxGeometry args={[2.5, 0.3, 3.7]} />
      <meshStandardMaterial color="#6B8E23" />
    </mesh>
    {/* Cab details */}
    <mesh position={[0, 1.3, -1.8]}>
      <boxGeometry args={[1.8, 0.8, 1.2]} />
      <meshStandardMaterial color="#8B4513" />
    </mesh>
    {/* Front armor plating */}
    <mesh position={[0, 0.7, -2.95]}>
      <boxGeometry args={[2.3, 1.2, 0.1]} />
      <meshStandardMaterial color="#4d5d28" />
    </mesh>
    {/* Side armor panels */}
    <mesh position={[-1.25, 0.7, -2]}>
      <boxGeometry args={[0.15, 1.2, 1.8]} />
      <meshStandardMaterial color="#4d5d28" />
    </mesh>
    <mesh position={[1.25, 0.7, -2]}>
      <boxGeometry args={[0.15, 1.2, 1.8]} />
      <meshStandardMaterial color="#4d5d28" />
    </mesh>
    <mesh position={[-1.25, 0.7, 0.8]}>
      <boxGeometry args={[0.15, 1.2, 3.6]} />
      <meshStandardMaterial color="#4d5d28" />
    </mesh>
    <mesh position={[1.25, 0.7, 0.8]}>
      <boxGeometry args={[0.15, 1.2, 3.6]} />
      <meshStandardMaterial color="#4d5d28" />
    </mesh>
    {/* Gun mount */}
    <mesh position={[0, 1.6, 1.5]}>
      <cylinderGeometry args={[0.6, 0.5, 0.4, 8]} />
      <meshStandardMaterial color="#3A5F0B" />
    </mesh>
    {/* Wheels */}
    {[
      { pos: [-1, 0.2, -2] },
      { pos: [1, 0.2, -2] },
      { pos: [-1, 0.2, 0] },
      { pos: [1, 0.2, 0] },
      { pos: [-1, 0.2, 1.6] },
      { pos: [1, 0.2, 1.6] },
    ].map((wheel, i) => (
      <mesh key={i} position={wheel.pos}>
        <cylinderGeometry args={[0.5, 0.5, 0.3, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    ))}
  </group>
);

/* Military Truck 2 – A simplified rugged design with less detail */
export const MilitaryTruck2 = (props) => (
  <group {...props}>
    {/* Cab section */}
    <mesh position={[0, 0.6, -2.2]}>
      <boxGeometry args={[2.6, 1.3, 1.9]} />
      <meshStandardMaterial color="#8B4513" />
    </mesh>
    {/* Main cargo/troop section */}
    <mesh position={[0, 0.6, 0.9]}>
      <boxGeometry args={[2.6, 1.3, 3.8]} />
      <meshStandardMaterial color="#8B4513" />
    </mesh>
    {/* Armor plating overlay */}
    <mesh position={[0, 1.1, -2.2]}>
      <boxGeometry args={[2.7, 0.3, 2]} />
      <meshStandardMaterial color="#A0522D" />
    </mesh>
    <mesh position={[0, 1.1, 0.9]}>
      <boxGeometry args={[2.7, 0.3, 3.9]} />
      <meshStandardMaterial color="#A0522D" />
    </mesh>
    {/* Reinforced bumper */}
    <mesh position={[0, 0.4, -3.2]}>
      <boxGeometry args={[2.5, 0.6, 0.2]} />
      <meshStandardMaterial color="#5d4037" />
    </mesh>
    {/* Simplified side-mounted equipment */}
    <mesh position={[-1.4, 0.7, -2.2]}>
      <boxGeometry args={[0.2, 0.4, 1.8]} />
      <meshStandardMaterial color="#6d4c41" />
    </mesh>
    <mesh position={[1.4, 0.7, -2.2]}>
      <boxGeometry args={[0.2, 0.4, 1.8]} />
      <meshStandardMaterial color="#6d4c41" />
    </mesh>
    <mesh position={[-1.4, 0.7, 0.9]}>
      <boxGeometry args={[0.2, 0.4, 3.6]} />
      <meshStandardMaterial color="#6d4c41" />
    </mesh>
    <mesh position={[1.4, 0.7, 0.9]}>
      <boxGeometry args={[0.2, 0.4, 3.6]} />
      <meshStandardMaterial color="#6d4c41" />
    </mesh>
    {/* Wheels */}
    {[
      { pos: [-1.1, 0.2, -2.2] },
      { pos: [1.1, 0.2, -2.2] },
      { pos: [-1.1, 0.2, 0] },
      { pos: [1.1, 0.2, 0] },
      { pos: [-1.1, 0.2, 1.8] },
      { pos: [1.1, 0.2, 1.8] }
    ].map((wheel, i) => (
      <mesh key={i} position={wheel.pos}>
        <cylinderGeometry args={[0.55, 0.55, 0.35, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    ))}
  </group>
);

/* Military Truck 3 – A tactical truck with a reinforced top and additional equipment mounts */
export const MilitaryTruck3 = (props) => (
  <group {...props}>
    {/* Cab section */}
    <mesh position={[0, 0.65, -2]}>
      <boxGeometry args={[2.4, 1.2, 1.8]} />
      <meshStandardMaterial color="#2F4F4F" />
    </mesh>
    {/* Cargo/troop section */}
    <mesh position={[0, 0.65, 0.8]}>
      <boxGeometry args={[2.4, 1.2, 3.6]} />
      <meshStandardMaterial color="#2F4F4F" />
    </mesh>
    {/* Reinforced roof */}
    <mesh position={[0, 1.1, -2]}>
      <boxGeometry args={[2.5, 0.3, 1.9]} />
      <meshStandardMaterial color="#708090" />
    </mesh>
    <mesh position={[0, 1.1, 0.8]}>
      <boxGeometry args={[2.5, 0.3, 3.7]} />
      <meshStandardMaterial color="#708090" />
    </mesh>
    {/* Equipment rack */}
    <mesh position={[0, 1.3, -1.5]}>
      <boxGeometry args={[1.2, 0.3, 1.4]} />
      <meshStandardMaterial color="#696969" />
    </mesh>
    {/* Antenna arrays */}
    {[-0.8, 0, 0.8].map((x, i) => (
      <mesh key={`ant-${i}`} position={[x, 1.4, -2]}>
        <cylinderGeometry args={[0.03, 0.01, 1.2, 8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    ))}
    {/* Armored windshield */}
    <mesh position={[0, 1, -2.7]} rotation={[0.2, 0, 0]}>
      <boxGeometry args={[2, 0.6, 0.2]} />
      <meshStandardMaterial color="#36454F" />
    </mesh>
    {/* Side storage boxes */}
    <mesh position={[-1.3, 0.6, -2]}>
      <boxGeometry args={[0.2, 0.5, 1.6]} />
      <meshStandardMaterial color="#4F666A" />
    </mesh>
    <mesh position={[1.3, 0.6, -2]}>
      <boxGeometry args={[0.2, 0.5, 1.6]} />
      <meshStandardMaterial color="#4F666A" />
    </mesh>
    <mesh position={[-1.3, 0.6, 0]}>
      <boxGeometry args={[0.2, 0.5, 1.8]} />
      <meshStandardMaterial color="#4F666A" />
    </mesh>
    <mesh position={[1.3, 0.6, 0]}>
      <boxGeometry args={[0.2, 0.5, 1.8]} />
      <meshStandardMaterial color="#4F666A" />
    </mesh>
    <mesh position={[-1.3, 0.6, 1.8]}>
      <boxGeometry args={[0.2, 0.5, 1.8]} />
      <meshStandardMaterial color="#4F666A" />
    </mesh>
    <mesh position={[1.3, 0.6, 1.8]}>
      <boxGeometry args={[0.2, 0.5, 1.8]} />
      <meshStandardMaterial color="#4F666A" />
    </mesh>
    {/* Wheels */}
    {[
      { pos: [-1, 0.2, -2] },
      { pos: [1, 0.2, -2] },
      { pos: [-1, 0.2, 0] },
      { pos: [1, 0.2, 0] },
      { pos: [-1, 0.2, 1.8] },
      { pos: [1, 0.2, 1.8] }
    ].map((wheel, i) => (
      <mesh key={i} position={wheel.pos}>
        <cylinderGeometry args={[0.5, 0.5, 0.35, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    ))}
  </group>
);

export const civilianTrucks = { CivilianTruck1, CivilianTruck2, CivilianTruck3 };
export const militaryTrucks = { MilitaryTruck1, MilitaryTruck2, MilitaryTruck3 };

export default { ...civilianTrucks, ...militaryTrucks }; 