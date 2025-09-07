import React from 'react';

/* Car Vehicles */
export const CarA = (props) => (
  <group {...props}>
    {/* Car body with subtle curves */}
    <mesh position={[0, 0.41, 0]}>
      <boxGeometry args={[1.8, 0.81, 3.6]} />
      <meshStandardMaterial color="#0000CD" />
    </mesh>
    {/* Detailed front grille */}
    <mesh position={[0, 0.54, -1.71]}>
      <boxGeometry args={[1.62, 0.18, 0.09]} />
      <meshStandardMaterial color="#333" />
    </mesh>
    {/* Headlights - boxGeometry style */}
    {[-0.72, 0.72].map((x, i) => (
      <mesh key={`hl-${i}`} position={[x, 0.61, -1.8]}>
        <boxGeometry args={[0.35, 0.18, 0.08]} />
        <meshStandardMaterial color="#FFFACD" emissive="#FFFF66" />
      </mesh>
    ))}
    {/* Wheels */}
    {[-0.95, 0.95].map((x, i) =>
      [-1.35, 1.35].map((z, j) => (
        <mesh key={`${i}-${j}`} position={[x, 0.22, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.25, 0.25, 0.14, 24]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))
    )}
  </group>
);

export const CarB = (props) => (
  <group {...props}>
    {/* Hatchback body with a sloping roof */}
    <mesh position={[0, 0.45, 0]}>
      <boxGeometry args={[1.98, 0.9, 3.78]} />
      <meshStandardMaterial color="#1E90FF" />
    </mesh>
    {/* Small front grille */}
    <mesh position={[0, 0.39, -1.89]}>
      <boxGeometry args={[1.3, 0.15, 0.08]} />
      <meshStandardMaterial color="#333" />
    </mesh>
    {/* Side accent stripe */}
    <mesh position={[0, 0.81, 0]}>
      <boxGeometry args={[1.8, 0.09, 0.09]} />
      <meshStandardMaterial color="#FF4500" />
    </mesh>
    {/* Detailed wheel setup */}
    {[-1.05, 1.05].map((x, i) =>
      [-1.4, 1.4].map((z, j) => (
        <mesh key={`${i}-${j}`} position={[x, 0.25, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.27, 0.27, 0.15, 24]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))
    )}
    {/* Headlights - boxGeometry style */}
    {[-0.72, 0.72].map((x, i) => (
      <mesh key={`hlb-${i}`} position={[x, 0.66, -1.89]}>
        <boxGeometry args={[0.35, 0.18, 0.08]} />
        <meshStandardMaterial color="#FFFACD" emissive="#FFFF66" />
      </mesh>
    ))}
  </group>
);

export const CarC = (props) => (
  <group {...props}>
    {/* Car body with a tapered design */}
    <mesh position={[0, 0.41, 0]}>
      <boxGeometry args={[1.62, 0.72, 3.42]} />
      <meshStandardMaterial color="#FFD700" />
    </mesh>
    {/* Front splitter */}
    <mesh position={[0, 0.36, -1.76]}>
      <boxGeometry args={[1.44, 0.09, 0.27]} />
      <meshStandardMaterial color="#333" />
    </mesh>
    {/* Rear spoiler */}
    <mesh position={[0, 0.72, 1.71]} rotation={[-0.2, 0, 0]}>
      <boxGeometry args={[0.9, 0.09, 0.36]} />
      <meshStandardMaterial color="#333" />
    </mesh>
    {/* Wheels */}
    {[-0.9, 0.9].map((x, i) =>
      [-1.3, 1.3].map((z, j) => (
        <mesh key={`${i}-${j}`} position={[x, 0.22, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.25, 0.25, 0.14, 24]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))
    )}
    {/* Headlights - boxGeometry style */}
    {[-0.62, 0.62].map((x, i) => (
      <mesh key={`hlc-${i}`} position={[x, 0.61, -1.8]}>
        <boxGeometry args={[0.35, 0.18, 0.08]} />
        <meshStandardMaterial color="#FFFACD" emissive="#FFFF66" />
      </mesh>
    ))}
  </group>
);

export const CarD = (props) => (
  <group {...props}>
    {/* SUV-style body with taller profile, adjusted to match other cars but with 20% more height */}
    <mesh position={[0, 0.45, 0]}>
      <boxGeometry args={[1.8, 0.97, 3.6]} />
      <meshStandardMaterial color="#1A4731" />
    </mesh>
    {/* Roof rails */}
    {[-0.75, 0.75].map((x, i) => (
      <mesh key={`rail-${i}`} position={[x, 0.94, 0]}>
        <boxGeometry args={[0.09, 0.09, 3.0]} />
        <meshStandardMaterial color="#444" />
      </mesh>
    ))}
    {/* Rugged wheel setup */}
    {[-0.98, 0.98].map((x, i) =>
      [-1.35, 1.35].map((z, j) => (
        <mesh key={`${i}-${j}`} position={[x, 0.28, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.28, 0.28, 0.16, 24]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))
    )}
    {/* Headlights - smaller and similar to other cars */}
    {[-0.72, 0.72].map((x, i) => (
      <mesh key={`hld-${i}`} position={[x, 0.61, -1.8]}>
        <boxGeometry args={[0.35, 0.18, 0.08]} />
        <meshStandardMaterial color="#FFFACD" emissive="#FFFF66" />
      </mesh>
    ))}
  </group>
);

export const CarE = (props) => (
  <group {...props}>
    {/* Sports coupe with low profile - even lower */}
    <mesh position={[0, 0.29, 0]}>
      <boxGeometry args={[1.89, 0.51, 3.78]} />
      <meshStandardMaterial color="#8B0000" />
    </mesh>
    {/* Sloped windshield */}
    <mesh position={[0, 0.51, -0.72]} rotation={[0.4, 0, 0]}>
      <boxGeometry args={[1.8, 0.59, 0.09]} />
      <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
    </mesh>
    {/* Hood air intake */}
    <mesh position={[0, 0.36, -1.35]}>
      <boxGeometry args={[0.72, 0.07, 0.72]} />
      <meshStandardMaterial color="#111" />
    </mesh>
    {/* Performance wheels - adjusted to be more visible but smaller */}
    {[-0.98, 0.98].map((x, i) =>
      [-1.4, 1.4].map((z, j) => (
        <mesh key={`${i}-${j}`} position={[x, 0.21, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.22, 0.22, 0.12, 24]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))
    )}
    {/* Headlights - boxGeometry style, adjusted to prevent Z-fighting */}
    {[-0.72, 0.72].map((x, i) => (
      <mesh key={`hle-${i}`} position={[x, 0.41, -1.88]}>
        <boxGeometry args={[0.35, 0.16, 0.05]} />
        <meshStandardMaterial color="#FFFACD" emissive="#FFFF66" />
      </mesh>
    ))}
    {/* Dual exhausts */}
    {[-0.36, 0.36].map((x, i) => (
      <mesh key={`exh-${i}`} position={[x, 0.22, 1.89]}>
        <cylinderGeometry args={[0.09, 0.09, 0.27, 12]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#444" />
      </mesh>
    ))}
  </group>
);

export default { CarA, CarB, CarC, CarD, CarE }; 