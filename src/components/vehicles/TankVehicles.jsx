import React from 'react';

export const TankA = (props) => (
  <group {...props}>
    {/* Hull */}
    <mesh position={[0, 0.2, 0]}>
      <boxGeometry args={[2, 0.4, 3]} />
      <meshStandardMaterial color="olive" />
    </mesh>
    {/* Tracks */}
    <mesh position={[1.3, 0.1, 0]}>
      <boxGeometry args={[0.6, 0.2, 3]} />
      <meshStandardMaterial color="darkgreen" />
    </mesh>
    <mesh position={[-1.3, 0.1, 0]}>
      <boxGeometry args={[0.6, 0.2, 3]} />
      <meshStandardMaterial color="darkgreen" />
    </mesh>
    {/* Wheels */}
    {[1.2, 0.4, -0.4, -1.2].map((z, i) => (
      <mesh key={i} position={[1.3, 0.1, z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.6, 16]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    ))}
    {[1.2, 0.4, -0.4, -1.2].map((z, i) => (
      <mesh key={i + 4} position={[-1.3, 0.1, z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.6, 16]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    ))}
    {/* Turret */}
    <mesh position={[0, 0.6, 0]}>
      <cylinderGeometry args={[0.5, 0.5, 0.8, 32]} />
      <meshStandardMaterial color="darkgreen" />
    </mesh>
    {/* Turret detail - hatch */}
    <mesh position={[0, 1.0, 0]}>
      <boxGeometry args={[0.4, 0.1, 0.4]} />
      <meshStandardMaterial color="green" />
    </mesh>
    {/* Cannon */}
    <mesh position={[0, 0.6, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.05, 0.05, 1.2, 16]} />
      <meshStandardMaterial color="gray" />
    </mesh>
    {/* Cannon muzzle */}
    <mesh position={[0, 0.6, -1.0]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.07, 0.07, 0.1, 16]} />
      <meshStandardMaterial color="gray" />
    </mesh>
    {/* Exhaust */}
    <mesh position={[0, 0.3, 1.5]}>
      <cylinderGeometry args={[0.1, 0.1, 0.3, 16]} />
      <meshStandardMaterial color="gray" />
    </mesh>
    {/* Headlights */}
    <mesh position={[1.0, 0.3, -1.5]}>
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshStandardMaterial color="yellow" />
    </mesh>
    <mesh position={[-1.0, 0.3, -1.5]}>
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshStandardMaterial color="yellow" />
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
      {/* Main Cannon */}
      <mesh position={[0, 0, -1.25]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 4.0, 32]} />
        <meshStandardMaterial color="#A9A9A9" />
      </mesh>
    </group>
    {/* Detailed tracks with individual wheel meshes */}
    {[-1.8, 1.8].map((xPos, idx) => (
      <group key={idx} position={[xPos, 0.2, 0]}>
        {[1.9, 0.9, -0.1, -1.1].map((z, i) => (
          <mesh key={i} position={[0, 0, z]}>
            <boxGeometry args={[0.5, 0.25, 1.1]} />
            <meshStandardMaterial color="#3B3B3B" />
          </mesh>
        ))}
        {[1.5, 0.5, -0.5, -1.5].map((z, i) => (
          <mesh
            key={`wheel-${idx}-${i}`}
            position={[0, -0.35, z]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.35, 0.35, 0.25, 32]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        ))}
      </group>
    ))}
  </group>
);

export default { TankA, TankB };