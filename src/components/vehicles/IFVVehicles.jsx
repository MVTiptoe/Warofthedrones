import React from 'react';

/* IFV Vehicle Designs */
export const IFV_A = (props) => (
  <group {...props}>
    {/* Hull */}
    <mesh position={[0, 0.2, 0]}>
      <boxGeometry args={[2, 0.4, 4]} />
      <meshStandardMaterial color="slategray" />
    </mesh>
    {/* Tracks */}
    <mesh position={[1.3, 0.1, 0]}>
      <boxGeometry args={[0.6, 0.2, 4]} />
      <meshStandardMaterial color="dimgray" />
    </mesh>
    <mesh position={[-1.3, 0.1, 0]}>
      <boxGeometry args={[0.6, 0.2, 4]} />
      <meshStandardMaterial color="dimgray" />
    </mesh>
    {/* Wheels */}
    {[-1.6, -0.8, 0, 0.8, 1.6].map((z, i) => (
      <mesh key={i} position={[1.3, 0.1, z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 0.6, 16]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    ))}
    {[-1.6, -0.8, 0, 0.8, 1.6].map((z, i) => (
      <mesh key={i + 5} position={[-1.3, 0.1, z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 0.6, 16]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    ))}
    {/* Turret */}
    <mesh position={[0, 0.6, -0.5]}>
      <boxGeometry args={[0.8, 0.3, 1]} />
      <meshStandardMaterial color="dimgray" />
    </mesh>
    {/* Cannon */}
    <mesh position={[0, 0.6, -1]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.08, 0.08, 1.5, 16]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  </group>
);

/* IFV Design B – A robust IFV with an elevated turret and realistic wheel configuration */
export const IFV_B = (props) => (
  <group {...props}>
    {/* Main hull with lower profile */}
    <mesh position={[0, 0.3, 0]}>
      <boxGeometry args={[2.2, 0.5, 4.2]} />
      <meshStandardMaterial color="#505050" />
    </mesh>

    {/* Upper hull/cabin */}
    <mesh position={[0, 0.7, 0.4]}>
      <boxGeometry args={[2.0, 0.3, 3.0]} />
      <meshStandardMaterial color="#606060" />
    </mesh>

    {/* Tracks */}
    <mesh position={[1.3, 0.15, 0]}>
      <boxGeometry args={[0.6, 0.3, 4.2]} />
      <meshStandardMaterial color="#333333" />
    </mesh>
    <mesh position={[-1.3, 0.15, 0]}>
      <boxGeometry args={[0.6, 0.3, 4.2]} />
      <meshStandardMaterial color="#333333" />
    </mesh>

    {/* Wheels - more of them for a proper IFV look */}
    {[-1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8].map((z, i) => (
      <mesh key={i} position={[1.3, 0.15, z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.6, 16]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
    ))}
    {[-1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8].map((z, i) => (
      <mesh key={i + 7} position={[-1.3, 0.15, z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.6, 16]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
    ))}

    {/* Turret base */}
    <mesh position={[0, 0.9, -0.8]}>
      <boxGeometry args={[1.6, 0.2, 1.6]} />
      <meshStandardMaterial color="#707070" />
    </mesh>

    {/* Turret - more detailed and proportional */}
    <mesh position={[0, 1.1, -0.8]}>
      <boxGeometry args={[1.2, 0.3, 1.2]} />
      <meshStandardMaterial color="#808080" />
    </mesh>

    {/* Main cannon - better proportioned */}
    <mesh position={[0, 1.1, -1.4]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.1, 0.1, 2.0, 16]} />
      <meshStandardMaterial color="#909090" />
    </mesh>

    {/* Secondary gun */}
    <mesh position={[0.5, 1.3, -0.8]} rotation={[0, 0, 0]}>
      <cylinderGeometry args={[0.05, 0.05, 0.6, 16]} />
      <meshStandardMaterial color="#A0A0A0" />
    </mesh>

    {/* Antennas */}
    <mesh position={[-0.8, 1.3, -0.8]} rotation={[0.1, 0, 0]}>
      <cylinderGeometry args={[0.02, 0.01, 0.8, 8]} />
      <meshStandardMaterial color="#202020" />
    </mesh>

    {/* Front slope armor */}
    <mesh position={[0, 0.5, 2.0]} rotation={[Math.PI / 6, 0, 0]}>
      <boxGeometry args={[2.2, 0.4, 0.6]} />
      <meshStandardMaterial color="#606060" />
    </mesh>

    {/* Rear compartment */}
    <mesh position={[0, 0.5, -1.8]}>
      <boxGeometry args={[2.0, 0.5, 0.6]} />
      <meshStandardMaterial color="#404040" />
    </mesh>

    {/* Detail elements - headlights */}
    <mesh position={[0.8, 0.4, 2.2]}>
      <boxGeometry args={[0.2, 0.2, 0.1]} />
      <meshStandardMaterial color="#FFFF00" />
    </mesh>
    <mesh position={[-0.8, 0.4, 2.2]}>
      <boxGeometry args={[0.2, 0.2, 0.1]} />
      <meshStandardMaterial color="#FFFF00" />
    </mesh>
  </group>
);

export default { IFV_A, IFV_B }; 