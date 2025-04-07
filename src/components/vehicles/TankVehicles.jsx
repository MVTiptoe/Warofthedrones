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

    {/* Stowage containers */}
    <mesh position={[0, 0.7, 1.6]}>
      <boxGeometry args={[1.8, 0.3, 0.6]} />
      <meshStandardMaterial color="#5D6540" />
    </mesh>
  </group>
);

export const TankB = (props) => (
  <group {...props}>
    {/* Main Hull - Using military green with realistic dimensions */}
    <mesh position={[0, 0.55, 0]}>
      <boxGeometry args={[3.4, 0.9, 6.0]} />
      <meshStandardMaterial color="#3B4A32" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Lower hull/chassis */}
    <mesh position={[0, 0.2, 0]}>
      <boxGeometry args={[3.5, 0.4, 6.1]} />
      <meshStandardMaterial color="#323D2A" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Upper hull armor plating with beveled edges */}
    <mesh position={[0, 1.05, 0]}>
      <boxGeometry args={[3.2, 0.2, 5.8]} />
      <meshStandardMaterial color="#41503A" metalness={0.5} roughness={0.6} />
    </mesh>


    {/* Track assemblies - left side */}
    <group position={[-1.9, 0.3, 0]}>
      {/* Track body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.6, 0.6, 6.2]} />
        <meshStandardMaterial color="#252525" metalness={0.3} roughness={0.8} />
      </mesh>

      {/* Drive sprocket */}
      <mesh position={[0, 0, 2.9]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.45, 0.45, 0.65, 16]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.5} roughness={0.7} />
      </mesh>

      {/* Idler wheel */}
      <mesh position={[0, 0, -2.9]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.6, 16]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.5} roughness={0.7} />
      </mesh>

      {/* Road wheels - more of them for realism */}
      {[-2.4, -1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8, 2.4].map((z, i) => (
        <mesh key={i} position={[0, -0.15, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.65, 16]} />
          <meshStandardMaterial color="#202020" metalness={0.5} roughness={0.6} />
        </mesh>
      ))}

      {/* Return rollers */}
      {[-1.5, 0, 1.5].map((z, i) => (
        <mesh key={i + 9} position={[0, 0.35, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.7, 12]} />
          <meshStandardMaterial color="#252525" metalness={0.4} roughness={0.6} />
        </mesh>
      ))}
    </group>

    {/* Track assemblies - right side (mirrored) */}
    <group position={[1.9, 0.3, 0]}>
      {/* Track body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.6, 0.6, 6.2]} />
        <meshStandardMaterial color="#252525" metalness={0.3} roughness={0.8} />
      </mesh>

      {/* Drive sprocket */}
      <mesh position={[0, 0, 2.9]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.45, 0.45, 0.65, 16]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.5} roughness={0.7} />
      </mesh>

      {/* Idler wheel */}
      <mesh position={[0, 0, -2.9]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.6, 16]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.5} roughness={0.7} />
      </mesh>

      {/* Road wheels - more of them for realism */}
      {[-2.4, -1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8, 2.4].map((z, i) => (
        <mesh key={i + 20} position={[0, -0.15, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.65, 16]} />
          <meshStandardMaterial color="#202020" metalness={0.5} roughness={0.6} />
        </mesh>
      ))}

      {/* Return rollers */}
      {[-1.5, 0, 1.5].map((z, i) => (
        <mesh key={i + 29} position={[0, 0.35, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.7, 12]} />
          <meshStandardMaterial color="#252525" metalness={0.4} roughness={0.6} />
        </mesh>
      ))}
    </group>

    {/* Track guards/mudguards */}
    <mesh position={[1.9, 0.65, 0]}>
      <boxGeometry args={[0.7, 0.1, 6.3]} />
      <meshStandardMaterial color="#41503A" metalness={0.3} roughness={0.7} />
    </mesh>
    <mesh position={[-1.9, 0.65, 0]}>
      <boxGeometry args={[0.7, 0.1, 6.3]} />
      <meshStandardMaterial color="#41503A" metalness={0.3} roughness={0.7} />
    </mesh>



    {/* Main turret body with improved shape */}
    <mesh position={[0, 1.5, 0.2]} rotation={[0, 0, 0]}>
      <boxGeometry args={[2.6, 0.6, 3.0]} />
      <meshStandardMaterial color="#445139" metalness={0.5} roughness={0.6} />
    </mesh>

    {/* Turret front slope */}
    <mesh position={[0, 1.5, 1.6]} rotation={[Math.PI / 6, 0, 0]}>
      <boxGeometry args={[2.4, 0.6, 0.8]} />
      <meshStandardMaterial color="#465339" metalness={0.5} roughness={0.6} />
    </mesh>

    {/* Turret rear with stowage rack */}
    <mesh position={[0, 1.5, -1.4]}>
      <boxGeometry args={[2.4, 0.6, 0.5]} />
      <meshStandardMaterial color="#404D39" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Commander's cupola */}
    <mesh position={[0.6, 1.9, 0.5]}>
      <cylinderGeometry args={[0.45, 0.45, 0.4, 16]} />
      <meshStandardMaterial color="#394431" metalness={0.4} roughness={0.7} />
    </mesh>



    {/* Loader's hatch */}
    <mesh position={[-0.6, 1.85, 0.5]}>
      <cylinderGeometry args={[0.4, 0.4, 0.15, 16]} />
      <meshStandardMaterial color="#394431" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Main gun mantlet (thick armor around gun) */}
    <mesh position={[0, 1.5, 1.9]}>
      <boxGeometry args={[1.3, 0.7, 0.6]} />
      <meshStandardMaterial color="#3D4935" metalness={0.5} roughness={0.6} />
    </mesh>

    {/* Main gun barrel */}
    <mesh position={[0, 1.5, 3.8]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.18, 0.18, 4.0, 16]} />
      <meshStandardMaterial color="#2A2A2A" metalness={0.6} roughness={0.5} />
    </mesh>

    {/* Thermal sleeve on barrel */}
    <mesh position={[0, 1.5, 2.8]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.22, 0.22, 1.8, 16]} />
      <meshStandardMaterial color="#252525" metalness={0.4} roughness={0.7} />
    </mesh>




    {/* Antennas */}
    <mesh position={[-0.9, 2.1, -1.0]} rotation={[0.2, 0.1, 0]}>
      <cylinderGeometry args={[0.03, 0.01, 1.2, 8]} />
      <meshStandardMaterial color="#0A0A0A" metalness={0.3} roughness={0.7} />
    </mesh>
    <mesh position={[0.9, 2.1, -1.0]} rotation={[0.2, -0.1, 0]}>
      <cylinderGeometry args={[0.03, 0.01, 1.0, 8]} />
      <meshStandardMaterial color="#0A0A0A" metalness={0.3} roughness={0.7} />
    </mesh>

    

  </group>
);

export default { TankA, TankB };