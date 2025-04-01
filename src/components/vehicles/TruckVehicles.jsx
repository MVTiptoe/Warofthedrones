import React from 'react';

/* Civilian Truck Vehicles */
/* Civilian Truck 1 – A classic two-part truck with a distinct cab and elongated trailer */
export const CivilianTruck1 = (props) => (
    <group {...props}>
      {/* Truck cab with detailed windshield */}
      <group position={[-0.8, 0.7, -1]}>
        <mesh>
          <boxGeometry args={[1.6, 1.2, 1.8]} />
          <meshStandardMaterial color="#1E90FF" />
        </mesh>
        <mesh position={[0, 0.2, 0.95]}>
          <boxGeometry args={[1.4, 0.5, 0.1]} />
          <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
        </mesh>
      </group>
      {/* Truck trailer with side panels */}
      <group position={[1, 0.7, 1]}>
        <mesh>
          <boxGeometry args={[3, 1.2, 4]} />
          <meshStandardMaterial color="#ADD8E6" />
        </mesh>
        <mesh position={[0, 0.8, 1.8]}>
          <boxGeometry args={[2.8, 0.4, 0.1]} />
          <meshStandardMaterial color="#ccc" />
        </mesh>
      </group>
      {/* Wheels */}
      {[
        { pos: [-1.4, 0.3, -1.2] },
        { pos: [-1.4, 0.3, 0] },
        { pos: [2.2, 0.3, 1] },
        { pos: [2.2, 0.3, 2] }
      ].map((wheel, i) => (
        <mesh key={i} position={wheel.pos}>
          <cylinderGeometry args={[0.45, 0.45, 0.3, 16]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))}
    </group>
  );
/* Civilian Truck 2 – A modern truck with a streamlined cab and a well-integrated trailer design */
  export const CivilianTruck2 = (props) => (
    <group {...props}>
      {/* Cab with curved edges */}
      <group position={[-0.5, 0.75, -1]}>
        <mesh>
          <boxGeometry args={[1.4, 1.3, 1.6]} />
          <meshStandardMaterial color="#DC143C" />
        </mesh>
        <mesh position={[0, 0.3, 0.9]}>
          <boxGeometry args={[1.2, 0.4, 0.1]} />
          <meshStandardMaterial color="#FFA07A" transparent opacity={0.7} />
        </mesh>
      </group>
      {/* Integrated trailer */}
      <group position={[0.5, 0.75, 1]}>
        <mesh>
          <boxGeometry args={[3.2, 1.3, 4.2]} />
          <meshStandardMaterial color="#FFC0CB" />
        </mesh>
        <mesh position={[0, 0.8, 1.9]}>
          <boxGeometry args={[3, 0.3, 0.1]} />
          <meshStandardMaterial color="#ddd" />
        </mesh>
      </group>
      {/* Wheels */}
      {[
        { pos: [-1.1, 0.3, -1.3] },
        { pos: [-1.1, 0.3, -0.1] },
        { pos: [1.8, 0.3, 1.2] },
        { pos: [1.8, 0.3, 2.2] }
      ].map((wheel, i) => (
        <mesh key={i} position={wheel.pos}>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
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
      </group>
      {/* Wheels */}
      {[
        { pos: [-1.3, 0.3, -1.4] },
        { pos: [-1.3, 0.3, -0.2] },
        { pos: [2, 0.3, 1.3] },
        { pos: [2, 0.3, 2.3] }
      ].map((wheel, i) => (
        <mesh key={i} position={wheel.pos}>
          <cylinderGeometry args={[0.45, 0.45, 0.35, 16]} />
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
      {/* Wheels */}
      {[
        { pos: [-1.5, 0.2, -1.8] },
        { pos: [-1.5, 0.2, 0] },
        { pos: [1.5, 0.2, 1.8] },
        { pos: [1.5, 0.2, 0] }
      ].map((wheel, i) => (
        <mesh key={i} position={wheel.pos}>
          <cylinderGeometry args={[0.5, 0.5, 0.3, 16]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))}
    </group>
  );
/* Military Truck 2 – A rugged design with bulky armor plating and extra cargo compartments */
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
      {/* Cargo compartment detail */}
      <mesh position={[1.2, 1.1, 1.8]}>
        <boxGeometry args={[1.2, 0.8, 2]} />
        <meshStandardMaterial color="#CD853F" />
      </mesh>
      {/* Wheels */}
      {[
        { pos: [-1.7, 0.2, -2] },
        { pos: [-1.7, 0.2, 0] },
        { pos: [1.7, 0.2, 2] },
        { pos: [1.7, 0.2, 0] }
      ].map((wheel, i) => (
        <mesh key={i} position={wheel.pos}>
          <cylinderGeometry args={[0.55, 0.55, 0.35, 16]} />
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
      {/* Wheels */}
      {[
        { pos: [-1.6, 0.2, -1.8] },
        { pos: [-1.6, 0.2, 0] },
        { pos: [1.6, 0.2, 1.8] },
        { pos: [1.6, 0.2, 0] }
      ].map((wheel, i) => (
        <mesh key={i} position={wheel.pos}>
          <cylinderGeometry args={[0.5, 0.5, 0.35, 16]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))}
    </group>
  );

export const civilianTrucks = { CivilianTruck1, CivilianTruck2, CivilianTruck3 };
export const militaryTrucks = { MilitaryTruck1, MilitaryTruck2, MilitaryTruck3 };

export default { ...civilianTrucks, ...militaryTrucks }; 