import React from 'react';

/* IFV Vehicle Designs */
export const IFV_A = (props) => (
  <group {...props}>
    {/* Base hull - more realistic proportions */}
    <mesh position={[0, 0.35, 0]}>
      <boxGeometry args={[2.2, 0.5, 4.2]} />
      <meshStandardMaterial color="#485142" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Sloped front glacis plate */}
    <mesh position={[0, 0.5, 1.9]} rotation={[Math.PI / 4, 0, 0]}>
      <boxGeometry args={[2.2, 0.7, 0.7]} />
      <meshStandardMaterial color="#4A5144" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Upper hull structure */}
    <mesh position={[0, 0.7, 0.2]}>
      <boxGeometry args={[2.0, 0.3, 3.4]} />
      <meshStandardMaterial color="#4D5446" metalness={0.3} roughness={0.6} />
    </mesh>

    {/* Track assemblies with suspension details */}
    <mesh position={[1.3, 0.28, 0]}>
      <boxGeometry args={[0.6, 0.4, 4.2]} />
      <meshStandardMaterial color="#333333" metalness={0.2} roughness={0.9} />
    </mesh>
    <mesh position={[-1.3, 0.28, 0]}>
      <boxGeometry args={[0.6, 0.4, 4.2]} />
      <meshStandardMaterial color="#333333" metalness={0.2} roughness={0.9} />
    </mesh>

    {/* Road wheels with proper alignment */}
    {[-1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8].map((z, i) => (
      <mesh key={i} position={[1.3, 0.2, z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 0.62, 16]} />
        <meshStandardMaterial color="#252525" metalness={0.4} roughness={0.7} />
      </mesh>
    ))}
    {[-1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8].map((z, i) => (
      <mesh key={i + 7} position={[-1.3, 0.2, z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 0.62, 16]} />
        <meshStandardMaterial color="#252525" metalness={0.4} roughness={0.7} />
      </mesh>
    ))}

    {/* Return rollers for tracks */}
    {[-1.4, 0, 1.4].map((z, i) => (
      <mesh key={i + 14} position={[1.3, 0.65, z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.64, 12]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.5} roughness={0.6} />
      </mesh>
    ))}
    {[-1.4, 0, 1.4].map((z, i) => (
      <mesh key={i + 17} position={[-1.3, 0.65, z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.64, 12]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.5} roughness={0.6} />
      </mesh>
    ))}

    {/* Drive sprockets */}
    <mesh position={[1.3, 0.2, 2.0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.32, 0.32, 0.65, 16]} />
      <meshStandardMaterial color="#2A2A2A" metalness={0.5} roughness={0.5} />
    </mesh>
    <mesh position={[-1.3, 0.2, 2.0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.32, 0.32, 0.65, 16]} />
      <meshStandardMaterial color="#2A2A2A" metalness={0.5} roughness={0.5} />
    </mesh>

    {/* Idlers */}
    <mesh position={[1.3, 0.2, -2.0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.28, 0.28, 0.65, 16]} />
      <meshStandardMaterial color="#2A2A2A" metalness={0.5} roughness={0.5} />
    </mesh>
    <mesh position={[-1.3, 0.2, -2.0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.28, 0.28, 0.65, 16]} />
      <meshStandardMaterial color="#2A2A2A" metalness={0.5} roughness={0.5} />
    </mesh>

    {/* Turret base ring */}
    <mesh position={[0, 0.85, -0.4]}>
      <cylinderGeometry args={[1.0, 1.0, 0.1, 24]} />
      <meshStandardMaterial color="#3A3E35" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Main turret with angled armor */}
    <mesh position={[0, 1.15, -0.4]}>
      <boxGeometry args={[1.6, 0.5, 1.8]} />
      <meshStandardMaterial color="#424739" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Turret front sloped armor */}
    <mesh position={[0, 1.15, -1.2]} rotation={[Math.PI / 8, 0, 0]}>
      <boxGeometry args={[1.6, 0.5, 0.6]} />
      <meshStandardMaterial color="#424739" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Commander's cupola */}
    <mesh position={[-0.5, 1.5, -0.2]}>
      <cylinderGeometry args={[0.35, 0.35, 0.3, 16]} />
      <meshStandardMaterial color="#3A3E35" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Commander's hatch */}
    <mesh position={[-0.5, 1.65, -0.2]}>
      <boxGeometry args={[0.5, 0.05, 0.5]} />
      <meshStandardMaterial color="#333631" metalness={0.3} roughness={0.8} />
    </mesh>

    {/* Gunner's optics */}
    <mesh position={[0.5, 1.4, -0.5]}>
      <boxGeometry args={[0.3, 0.15, 0.3]} />
      <meshStandardMaterial color="#222222" metalness={0.6} roughness={0.4} />
    </mesh>

    {/* Main cannon mount/mantlet */}
    <mesh position={[0, 1.15, -1.5]}>
      <boxGeometry args={[0.7, 0.4, 0.3]} />
      <meshStandardMaterial color="#303327" metalness={0.5} roughness={0.6} />
    </mesh>

    {/* Main cannon */}
    <mesh position={[0, 1.15, -2.2]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.12, 0.12, 1.7, 16]} />
      <meshStandardMaterial color="#2A2A2A" metalness={0.6} roughness={0.5} />
    </mesh>

    {/* Cannon muzzle brake */}
    <mesh position={[0, 1.15, -3.0]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.15, 0.15, 0.25, 16]} />
      <meshStandardMaterial color="#252525" metalness={0.6} roughness={0.4} />
    </mesh>

    {/* Coaxial machine gun */}
    <mesh position={[0.3, 1.1, -1.5]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.05, 0.05, 0.8, 12]} />
      <meshStandardMaterial color="#202020" metalness={0.6} roughness={0.5} />
    </mesh>

    {/* Antenna */}
    <mesh position={[-0.8, 1.6, 0.4]} rotation={[0.1, 0, 0.1]}>
      <cylinderGeometry args={[0.02, 0.01, 1.2, 8]} />
      <meshStandardMaterial color="#0A0A0A" metalness={0.3} roughness={0.7} />
    </mesh>

    {/* Storage boxes */}
    <mesh position={[0.9, 0.8, 1.4]}>
      <boxGeometry args={[0.3, 0.3, 0.8]} />
      <meshStandardMaterial color="#3A3E35" metalness={0.3} roughness={0.8} />
    </mesh>
    <mesh position={[-0.9, 0.8, 1.4]}>
      <boxGeometry args={[0.3, 0.3, 0.8]} />
      <meshStandardMaterial color="#3A3E35" metalness={0.3} roughness={0.8} />
    </mesh>

    {/* Exhaust */}
    <mesh position={[-1.1, 0.7, -1.9]} rotation={[0, Math.PI / 4, 0]}>
      <cylinderGeometry args={[0.1, 0.1, 0.5, 12]} />
      <meshStandardMaterial color="#2A2A2A" metalness={0.5} roughness={0.8} />
    </mesh>

    {/* Headlights */}
    <mesh position={[0.8, 0.5, 2.15]}>
      <cylinderGeometry args={[0.1, 0.1, 0.1, 12]} rotation={[Math.PI / 2, 0, 0]} />
      <meshStandardMaterial color="#FFFF99" emissive="#FFFF99" emissiveIntensity={0.3} />
    </mesh>
    <mesh position={[-0.8, 0.5, 2.15]}>
      <cylinderGeometry args={[0.1, 0.1, 0.1, 12]} rotation={[Math.PI / 2, 0, 0]} />
      <meshStandardMaterial color="#FFFF99" emissive="#FFFF99" emissiveIntensity={0.3} />
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