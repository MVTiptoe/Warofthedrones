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
    <group position={[-0.8, 0.7, -1]}>
      <mesh>
        <boxGeometry args={[1.6, 1.2, 1.8]} />
        <meshStandardMaterial color="#778899" />
      </mesh>
      {/* Simple windshield */}
      <mesh position={[0, 0.2, 0.9]}>
        <boxGeometry args={[1.4, 0.5, 0.1]} />
        <meshStandardMaterial material={SHARED_MATERIALS.windshield} />
      </mesh>
      {/* Basic front lights */}
      <mesh position={[0, 0, -0.95]}>
        <boxGeometry args={[0.8, 0.2, 0.05]} />
        <meshStandardMaterial material={SHARED_MATERIALS.headlight} />
      </mesh>
    </group>
    {/* Basic trailer */}
    <group position={[1, 0.7, 1]}>
      <mesh>
        <boxGeometry args={[3, 1.2, 4]} />
        <meshStandardMaterial color="#A9A9A9" />
      </mesh>
    </group>
    {/* Simple wheels */}
    {[
      { pos: [-1.4, 0.3, -1.2] },
      { pos: [-1.4, 0.3, 0] },
      { pos: [2.2, 0.3, 1] },
      { pos: [2.2, 0.3, 2] }
    ].map((wheel, i) => (
      <mesh key={i} position={wheel.pos}>
        <cylinderGeometry args={[0.45, 0.45, 0.3, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    ))}
  </group>
);

/* Civilian Truck 2 – A simplified modern truck with integrated design */
export const CivilianTruck2 = (props) => (
  <group {...props}>
    {/* Basic cab */}
    <group position={[-0.5, 0.75, -1]}>
      <mesh>
        <boxGeometry args={[1.4, 1.3, 1.6]} />
        <meshStandardMaterial color="#708090" />
      </mesh>
      {/* Simple windshield */}
      <mesh position={[0, 0.3, 0.9]}>
        <boxGeometry args={[1.2, 0.4, 0.1]} />
        <meshStandardMaterial color="#87CEEB" transparent={true} opacity={0.7} />
      </mesh>
      {/* Basic headlights */}
      <mesh position={[0, 0, -0.85]}>
        <boxGeometry args={[0.7, 0.2, 0.05]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFCC" emissiveIntensity={0.5} />
      </mesh>
    </group>
    {/* Simple cargo area */}
    <group position={[0.5, 0.75, 1]}>
      <mesh>
        <boxGeometry args={[3.2, 1.3, 4.2]} />
        <meshStandardMaterial color="#696969" />
      </mesh>
    </group>
    {/* Basic wheels */}
    {[
      { pos: [-1.1, 0.3, -1.3] },
      { pos: [-1.1, 0.3, -0.1] },
      { pos: [1.8, 0.3, 1.2] },
      { pos: [1.8, 0.3, 2.2] }
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
    <group position={[-0.6, 0.65, -1]}>
      <mesh>
        <boxGeometry args={[1.8, 1.1, 1.7]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
      <mesh position={[0, 0.4, 0.85]}>
        <boxGeometry args={[1.6, 0.2, 0.1]} />
        <meshStandardMaterial color="#ADFF2F" />
      </mesh>
      {/* Vintage-style radiator grille */}
      <mesh position={[0, 0, -0.9]}>
        <boxGeometry args={[1.4, 0.6, 0.1]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Chrome bumper */}
      <mesh position={[0, -0.4, -0.9]}>
        <boxGeometry args={[1.6, 0.2, 0.2]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Round headlights */}
      {[-0.5, 0.5].map((x, i) => (
        <mesh key={`retro-hl-${i}`} position={[x, 0.1, -0.95]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 8]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#FFFACD" emissive="#FFFF66" />
        </mesh>
      ))}
    </group>
    {/* Large trailer with panel lines */}
    <group position={[0.4, 0.65, 1]}>
      <mesh>
        <boxGeometry args={[3.4, 1.1, 4]} />
        <meshStandardMaterial color="#90EE90" />
      </mesh>
      <mesh position={[0, 0.75, 1.8]}>
        <boxGeometry args={[3.2, 0.3, 0.1]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
      {/* Side panel details */}
      {[-1.7, -0.6, 0.5, 1.6].map((z, i) => (
        <mesh key={`panel-${i}`} position={[-1.7, 0, z]}>
          <boxGeometry args={[0.05, 0.8, 0.1]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
      ))}
      {[-1.7, -0.6, 0.5, 1.6].map((z, i) => (
        <mesh key={`panel2-${i}`} position={[1.7, 0, z]}>
          <boxGeometry args={[0.05, 0.8, 0.1]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
      ))}
    </group>
    {/* Wheels */}
    {[
      { pos: [-1.3, 0.3, -1.4] },
      { pos: [-1.3, 0.3, -0.2] },
      { pos: [2, 0.3, 1.3] },
      { pos: [2, 0.3, 2.3] },
      { pos: [-0.8, 0.3, 1.3] },
      { pos: [-0.8, 0.3, 2.3] }
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
    {/* Reinforced hull */}
    <mesh position={[0, 0.65, 0]}>
      <boxGeometry args={[3, 1.4, 5]} />
      <meshStandardMaterial color="#556B2F" />
    </mesh>
    {/* Additional armor layer */}
    <mesh position={[0, 1.15, 0]}>
      <boxGeometry args={[3.2, 0.3, 5.2]} />
      <meshStandardMaterial color="#6B8E23" />
    </mesh>
    {/* Cab details */}
    <mesh position={[-1, 1.3, -1.8]}>
      <boxGeometry args={[1.2, 0.8, 1.5]} />
      <meshStandardMaterial color="#8B4513" />
    </mesh>
    {/* Front armor plating */}
    <mesh position={[0, 0.65, -2.55]}>
      <boxGeometry args={[2.8, 1, 0.1]} />
      <meshStandardMaterial color="#4d5d28" />
    </mesh>
    {/* Side armor panels */}
    {[-1.55, 1.55].map((x, i) => (
      <mesh key={`armor-${i}`} position={[x, 0.65, 0]}>
        <boxGeometry args={[0.15, 1, 4.8]} />
        <meshStandardMaterial color="#4d5d28" />
      </mesh>
    ))}
    {/* Gun mount */}
    <mesh position={[0.5, 1.6, 0.5]}>
      <cylinderGeometry args={[0.6, 0.5, 0.4, 8]} />
      <meshStandardMaterial color="#3A5F0B" />
    </mesh>
    {/* Wheels with 50% more space between */}
    {[
      { pos: [-1.5, 0.2, -1.8] },
      { pos: [-1.5, 0.2, 0] },
      { pos: [1.5, 0.2, 1.8] },
      { pos: [1.5, 0.2, 0] },
      { pos: [-1.5, 0.2, 1.8] },
      { pos: [1.5, 0.2, -1.8] }
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
    {/* Main body */}
    <mesh position={[0, 0.6, 0]}>
      <boxGeometry args={[3.4, 1.3, 5.5]} />
      <meshStandardMaterial color="#8B4513" />
    </mesh>
    {/* Armor plating overlay */}
    <mesh position={[0, 1.05, 0]}>
      <boxGeometry args={[3.6, 0.3, 5.7]} />
      <meshStandardMaterial color="#A0522D" />
    </mesh>
    {/* Reinforced bumper */}
    <mesh position={[0, 0.4, -2.8]}>
      <boxGeometry args={[3, 0.6, 0.2]} />
      <meshStandardMaterial color="#5d4037" />
    </mesh>
    {/* Simplified side-mounted equipment - removed internal details */}
    {[-2.62, 2.62].map((x, i) => (
      <mesh key={`equip-${i}`} position={[x, 0.8, 0]}>
        <boxGeometry args={[0.2, 0.4, 2]} />
        <meshStandardMaterial color="#6d4c41" />
      </mesh>
    ))}
    {/* Wheels */}
    {[
      { pos: [-2.55, 0.2, -2] },
      { pos: [-2.55, 0.2, 0] },
      { pos: [2.55, 0.2, 2] },
      { pos: [2.55, 0.2, 0] },
      { pos: [-2.55, 0.2, 2] },
      { pos: [2.55, 0.2, -2] }
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
    {/* Base body */}
    <mesh position={[0, 0.65, 0]}>
      <boxGeometry args={[3.2, 1.2, 5]} />
      <meshStandardMaterial color="#2F4F4F" />
    </mesh>
    {/* Reinforced roof */}
    <mesh position={[0, 1.1, 0]}>
      <boxGeometry args={[3.4, 0.3, 5.2]} />
      <meshStandardMaterial color="#708090" />
    </mesh>
    {/* Equipment rack */}
    <mesh position={[0, 1.3, -1.5]}>
      <boxGeometry args={[1, 0.3, 1.8]} />
      <meshStandardMaterial color="#696969" />
    </mesh>
    {/* Antenna arrays - with 50% more space between */}
    {[-1.5, 0, 1.5].map((x, i) => (  // 50% more space (original 1 * 1.5 = 1.5)
      <mesh key={`ant-${i}`} position={[x, 1.4, -2]}>
        <cylinderGeometry args={[0.03, 0.01, 1.2, 8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    ))}
    {/* Armored windshield */}
    <mesh position={[0, 1, -2.2]} rotation={[0.2, 0, 0]}>
      <boxGeometry args={[2, 0.6, 0.2]} />
      <meshStandardMaterial color="#36454F" />
    </mesh>
    {/* Side storage boxes - with 50% more space between */}
    {[-2.47, 2.47].map((x, i) => [1.5, 0, -1.5].map((z, j) => (  // 50% more space (original 1.65 * 1.5 = 2.47)
      <mesh key={`box-${i}-${j}`} position={[x, 0.6, z]}>
        <boxGeometry args={[0.2, 0.5, 1]} />
        <meshStandardMaterial color="#4F666A" />
      </mesh>
    )))}
    {/* Wheels - with 50% more space between */}
    {[
      { pos: [-2.4, 0.2, -1.8] },  // 50% more space (original 1.6 * 1.5 = 2.4)
      { pos: [-2.4, 0.2, 0] },
      { pos: [2.4, 0.2, 1.8] },
      { pos: [2.4, 0.2, 0] },
      { pos: [-2.4, 0.2, 1.8] },
      { pos: [2.4, 0.2, -1.8] }
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