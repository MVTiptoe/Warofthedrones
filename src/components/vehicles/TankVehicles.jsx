import React from 'react';

export const TankA = (props) => (
  <group {...props}>
    {/* Main hull - larger and taller */}
    <mesh position={[0, 0.35, 0]}>
      <boxGeometry args={[2.6, 0.7, 3.8]} />
      <meshStandardMaterial color="#4B5320" />
    </mesh>

    {/* Angled front armor */}
    <mesh position={[0, 0.5, -1.9]} rotation={[0.3, 0, 0]}>
      <boxGeometry args={[2.4, 0.6, 0.6]} />
      <meshStandardMaterial color="#4F5D2F" />
    </mesh>

    {/* Tracks - wider for stability */}
    <mesh position={[1.5, 0.2, 0]}>
      <boxGeometry args={[0.7, 0.3, 3.6]} />
      <meshStandardMaterial color="#3A3A3A" />
    </mesh>
    <mesh position={[-1.5, 0.2, 0]}>
      <boxGeometry args={[0.7, 0.3, 3.6]} />
      <meshStandardMaterial color="#3A3A3A" />
    </mesh>

    {/* Track guards */}
    <mesh position={[1.5, 0.4, 0]}>
      <boxGeometry args={[0.8, 0.1, 3.7]} />
      <meshStandardMaterial color="#4F5D2F" />
    </mesh>
    <mesh position={[-1.5, 0.4, 0]}>
      <boxGeometry args={[0.8, 0.1, 3.7]} />
      <meshStandardMaterial color="#4F5D2F" />
    </mesh>

    {/* Wheels - reduced quantity and polygon count */}
    {[1.5, -0.1, -1.7].map((z, i) => (
      <mesh key={i} position={[1.5, 0.2, z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.7, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    ))}
    {[1.5, -0.1, -1.7].map((z, i) => (
      <mesh key={i + 5} position={[-1.5, 0.2, z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.7, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    ))}

    {/* Elevated turret base */}
    <mesh position={[0, 0.8, 0]}>
      <boxGeometry args={[1.8, 0.3, 2.2]} />
      <meshStandardMaterial color="#4B5320" />
    </mesh>

    {/* Turret - larger and more detailed - reduced segments */}
    <mesh position={[0, 1.2, 0]}>
      <cylinderGeometry args={[0.8, 0.9, 0.8, 16]} />
      <meshStandardMaterial color="#4F5D2F" />
    </mesh>

    {/* Commander's cupola - reduced segments */}
    <mesh position={[0, 1.6, 0.3]}>
      <cylinderGeometry args={[0.4, 0.4, 0.4, 8]} />
      <meshStandardMaterial color="#3A3A3A" />
    </mesh>

    {/* Hatch */}
    <mesh position={[0, 1.8, 0.3]}>
      <boxGeometry args={[0.6, 0.1, 0.6]} />
      <meshStandardMaterial color="#4F5D2F" />
    </mesh>

    {/* Main cannon - reduced segments */}
    <group position={[0, 1.2, 0]}>
      <mesh position={[0, 0, -1.0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 2.5, 8]} />
        <meshStandardMaterial color="#3A3A3A" />
      </mesh>
      {/* Cannon mantlet - reduced segments */}
      <mesh position={[0, 0, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.2, 0.5, 8]} />
        <meshStandardMaterial color="#3A3A3A" />
      </mesh>
      {/* Muzzle brake - reduced segments */}
      <mesh position={[0, 0, -2.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.3, 8]} />
        <meshStandardMaterial color="#2A2A2A" />
      </mesh>
    </group>

    {/* Exhaust pipes - reduced to one pipe */}
    <mesh position={[1.1, 0.7, 1.7]}>
      <cylinderGeometry args={[0.1, 0.1, 0.4, 6]} />
      <meshStandardMaterial color="#444" />
    </mesh>

    {/* Stowage containers */}
    <mesh position={[0, 0.7, 1.6]}>
      <boxGeometry args={[1.2, 0.3, 0.6]} />
      <meshStandardMaterial color="#5D6540" />
    </mesh>

    {/* Single headlight instead of two */}
    <mesh position={[1.1, 0.5, -1.9]}>
      <boxGeometry args={[0.2, 0.2, 0.1]} />
      <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
    </mesh>
  </group>
);

export const TankB = (props) => (
  <group {...props}>
    {/* Angular Hull with layered armor */}
    <mesh position={[0, 0.55, 0]}>
      <boxGeometry args={[3.2, 1.1, 5.2]} />
      <meshStandardMaterial color="#4B5320" />
    </mesh>
    <mesh position={[0, 1.1, 0]}>
      <boxGeometry args={[3.4, 0.2, 5.4]} />
      <meshStandardMaterial color="#556B2F" />
    </mesh>
    {/* Rotating Turret */}
    <group position={[0, 1.2, 0.4]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.0, 0.6, 2.5]} />
        <meshStandardMaterial color="#6B8E23" />
      </mesh>
      {/* Main Cannon - reduced segments */}
      <mesh position={[0, 0, -1.25]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 4.0, 12]} />
        <meshStandardMaterial color="#A9A9A9" />
      </mesh>
    </group>
    {/* Detailed tracks with individual wheel meshes - reduced wheels */}
    {[-1.8, 1.8].map((xPos, idx) => (
      <group key={idx} position={[xPos, 0.2, 0]}>
        {[1.9, -0.1].map((z, i) => (
          <mesh key={i} position={[0, 0, z]}>
            <boxGeometry args={[0.5, 0.25, 1.1]} />
            <meshStandardMaterial color="#3B3B3B" />
          </mesh>
        ))}
        {[1.5, -1.5].map((z, i) => (
          <mesh
            key={`wheel-${idx}-${i}`}
            position={[0, -0.35, z]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.35, 0.35, 0.25, 12]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        ))}
      </group>
    ))}
  </group>
);

export default { TankA, TankB };