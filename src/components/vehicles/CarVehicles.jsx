import React from 'react';

/* Car Vehicles */
export const CarA = (props) => (
  <group {...props}>
    {/* Car body with subtle curves */}
    <mesh position={[0, 0.45, 0]}>
      <boxGeometry args={[2, 0.9, 4]} />
      <meshStandardMaterial color="#C0C0C0" />
    </mesh>
    {/* Detailed front grille */}
    <mesh position={[0, 0.6, -1.9]}>
      <boxGeometry args={[1.8, 0.2, 0.1]} />
      <meshStandardMaterial color="#333" />
    </mesh>
    {/* Headlights */}
    {[-0.8, 0.8].map((x, i) => (
      <mesh key={`hl-${i}`} position={[x, 0.6, -2]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#FFFFE0" emissive="#FFFF66" />
      </mesh>
    ))}
    {/* Wheels */}
    {[-0.9, 0.9].map((x, i) =>
      [-1, 1].map((z, j) => (
        <mesh key={`${i}-${j}`} position={[x, 0.2, z * 1.6]}>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 24]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))
    )}
  </group>
);

export const CarB = (props) => (
  <group {...props}>
    {/* Hatchback body with a sloping roof */}
    <mesh position={[0, 0.5, 0]}>
      <boxGeometry args={[2.2, 1, 4.2]} />
      <meshStandardMaterial color="#FFFFFF" />
    </mesh>
    {/* Side accent stripe */}
    <mesh position={[0, 0.9, 0]}>
      <boxGeometry args={[2, 0.1, 0.1]} />
      <meshStandardMaterial color="#FF4500" />
    </mesh>
    {/* Detailed wheel setup */}
    {[-1.1, 1.1].map((x, i) =>
      [-1, 1].map((z, j) => (
        <mesh key={`${i}-${j}`} position={[x, 0.2, z * 1.8]}>
          <cylinderGeometry args={[0.45, 0.45, 0.35, 24]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))
    )}
    {/* Headlights */}
    {[-0.8, 0.8].map((x, i) => (
      <mesh key={`hlb-${i}`} position={[x, 0.65, -2.1]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#FFFFE0" emissive="#FFFF66" />
      </mesh>
    ))}
  </group>
);

export const CarC = (props) => (
  <group {...props}>
    {/* Car body with a tapered design */}
    <mesh position={[0, 0.45, 0]}>
      <boxGeometry args={[1.8, 0.8, 3.8]} />
      <meshStandardMaterial color="#FFD700" />
    </mesh>
    {/* Front splitter */}
    <mesh position={[0, 0.4, -1.95]}>
      <boxGeometry args={[1.6, 0.1, 0.3]} />
      <meshStandardMaterial color="#333" />
    </mesh>
    {/* Rear spoiler */}
    <mesh position={[0, 0.8, 1.9]} rotation={[-0.2, 0, 0]}>
      <boxGeometry args={[1, 0.1, 0.4]} />
      <meshStandardMaterial color="#333" />
    </mesh>
    {/* Wheels */}
    {[-0.8, 0.8].map((x, i) =>
      [-1, 1].map((z, j) => (
        <mesh key={`${i}-${j}`} position={[x, 0.2, z * 1.5]}>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 24]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))
    )}
    {/* Aggressive headlights */}
    {[-0.6, 0.6].map((x, i) => (
      <mesh key={`hlc-${i}`} position={[x, 0.65, -2]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#FFFFE0" emissive="#FFFF66" />
      </mesh>
    ))}
  </group>
);

export const CarD = (props) => (
  <group {...props}>
    {/* SUV-style body with taller profile */}
    <mesh position={[0, 0.6, 0]}>
      <boxGeometry args={[2.3, 1.3, 4.5]} />
      <meshStandardMaterial color="#2E8B57" />
    </mesh>
    {/* Roof rails */}
    {[-1, 1].map((x, i) => (
      <mesh key={`rail-${i}`} position={[x, 1.25, 0]}>
        <boxGeometry args={[0.1, 0.1, 3.8]} />
        <meshStandardMaterial color="#444" />
      </mesh>
    ))}
    {/* Front bumper */}
    <mesh position={[0, 0.4, -2.2]}>
      <boxGeometry args={[2.2, 0.5, 0.3]} />
      <meshStandardMaterial color="#333" />
    </mesh>
    {/* Rugged wheel setup */}
    {[-1.15, 1.15].map((x, i) =>
      [-1.2, 1.2].map((z, j) => (
        <mesh key={`${i}-${j}`} position={[x, 0.3, z * 1.5]}>
          <cylinderGeometry args={[0.55, 0.55, 0.4, 24]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))
    )}
    {/* Headlights */}
    {[-0.8, 0.8].map((x, i) => (
      <mesh key={`hld-${i}`} position={[x, 0.8, -2.3]}>
        <boxGeometry args={[0.5, 0.3, 0.1]} />
        <meshStandardMaterial color="#FFFACD" emissive="#FFFF66" />
      </mesh>
    ))}
  </group>
);

export const CarE = (props) => (
  <group {...props}>
    {/* Sports coupe with low profile */}
    <mesh position={[0, 0.4, 0]}>
      <boxGeometry args={[2.1, 0.7, 4.2]} />
      <meshStandardMaterial color="#8B0000" />
    </mesh>
    {/* Sloped windshield */}
    <mesh position={[0, 0.7, -0.8]} rotation={[0.4, 0, 0]}>
      <boxGeometry args={[2, 0.8, 0.1]} />
      <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
    </mesh>
    {/* Hood air intake */}
    <mesh position={[0, 0.5, -1.5]}>
      <boxGeometry args={[0.8, 0.1, 0.8]} />
      <meshStandardMaterial color="#111" />
    </mesh>
    {/* Performance wheels */}
    {[-0.9, 0.9].map((x, i) =>
      [-1.2, 1.2].map((z, j) => (
        <mesh key={`${i}-${j}`} position={[x, 0.25, z * 1.4]}>
          <cylinderGeometry args={[0.42, 0.42, 0.25, 24]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))
    )}
    {/* Dual exhausts */}
    {[-0.4, 0.4].map((x, i) => (
      <mesh key={`exh-${i}`} position={[x, 0.3, 2.1]}>
        <cylinderGeometry args={[0.1, 0.1, 0.3, 12]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#444" />
      </mesh>
    ))}
  </group>
);

export default { CarA, CarB, CarC, CarD, CarE }; 