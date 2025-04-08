import React from 'react';

export const TankA = (props) => (
  <group {...props}>
    {/* Main hull with improved proportions - made wider and more substantial */}
    <mesh position={[0, 0.4, 0]}>
      <boxGeometry args={[4.2, 1.2, 5.0]} />
      <meshStandardMaterial color="#4B5320" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Lower hull/chassis - made wider */}
    <mesh position={[0, 0.2, 0]}>
      <boxGeometry args={[4.3, 0.5, 5.1]} />
      <meshStandardMaterial color="#445029" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Angled front glacis plate - made wider */}
    <mesh position={[0, 0.6, 2.4]} rotation={[-0.4, 0, 0]}>
      <boxGeometry args={[3.8, 0.9, 0.9]} />
      <meshStandardMaterial color="#4F5D2F" metalness={0.5} roughness={0.6} />
    </mesh>

    {/* Track assemblies - left side - moved outward */}
    <group position={[-2.2, 0.3, 0]}>
      {/* Track body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.6, 0.6, 4.4]} />
        <meshStandardMaterial color="#252525" metalness={0.3} roughness={0.8} />
      </mesh>

      {/* Drive sprocket */}
      <mesh position={[0, 0, -2.1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.35, 0.35, 0.65, 16]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.5} roughness={0.7} />
      </mesh>

      {/* Idler wheel */}
      <mesh position={[0, 0, 2.1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.32, 0.32, 0.65, 16]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.5} roughness={0.7} />
      </mesh>

      {/* Road wheels - more of them for realism */}
      {[1.8, 1.2, 0.6, 0, -0.6, -1.2, -1.8].map((z, i) => (
        <mesh key={i} position={[0, -0.15, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.65, 16]} />
          <meshStandardMaterial color="#202020" metalness={0.5} roughness={0.6} />
        </mesh>
      ))}

      
    </group>

    {/* Track assemblies - right side (mirrored) - moved outward */}
    <group position={[2.2, 0.3, 0]}>
      {/* Track body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.6, 0.6, 4.4]} />
        <meshStandardMaterial color="#252525" metalness={0.3} roughness={0.8} />
      </mesh>

      {/* Drive sprocket */}
      <mesh position={[0, 0, -2.1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.35, 0.35, 0.65, 16]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.5} roughness={0.7} />
      </mesh>

      {/* Idler wheel */}
      <mesh position={[0, 0, 2.1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.32, 0.32, 0.65, 16]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.5} roughness={0.7} />
      </mesh>

      {/* Road wheels - more of them for realism */}
      {[1.8, 1.2, 0.6, 0, -0.6, -1.2, -1.8].map((z, i) => (
        <mesh key={i + 14} position={[0, -0.15, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.65, 16]} />
          <meshStandardMaterial color="#202020" metalness={0.5} roughness={0.6} />
        </mesh>
      ))}


    </group>

    {/* Track guards/mudguards - adjusted position and width */}
    <mesh position={[2.2, 0.65, 0]}>
      <boxGeometry args={[0.7, 0.1, 4.5]} />
      <meshStandardMaterial color="#4F5D2F" metalness={0.3} roughness={0.7} />
    </mesh>
    <mesh position={[-2.2, 0.65, 0]}>
      <boxGeometry args={[0.7, 0.1, 4.5]} />
      <meshStandardMaterial color="#4F5D2F" metalness={0.3} roughness={0.7} />
    </mesh>

    {/* Added hull armor plates for more body mass */}
    <mesh position={[0, 0.6, 0]}>
      <boxGeometry args={[4.0, 0.3, 4.9]} />
      <meshStandardMaterial color="#4D5522" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Turret base with realistic rotation ring - keeping same size */}
    <mesh position={[0, 0.9, 0]}>
      <cylinderGeometry args={[1.2, 1.2, 0.2, 24]} />
      <meshStandardMaterial color="#4B5320" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Main turret body with angled armor - keeping same size */}
    <mesh position={[0, 1.3, 0]}>
      <boxGeometry args={[2.2, 0.7, 2.6]} />
      <meshStandardMaterial color="#4F5D2F" metalness={0.4} roughness={0.6} />
    </mesh>

    {/* Turret front slope - keeping same size */}
    <mesh position={[0, 1.3, -1.2]} rotation={[-Math.PI / 6, 0, 0]}>
      <boxGeometry args={[2.0, 0.7, 0.8]} />
      <meshStandardMaterial color="#4F5D2F" metalness={0.4} roughness={0.6} />
    </mesh>


    {/* Loader's hatch - keeping same size */}
    <mesh position={[-0.6, 1.7, 0.3]}>
      <cylinderGeometry args={[0.35, 0.35, 0.1, 8]} />
      <meshStandardMaterial color="#3A3A3A" metalness={0.5} roughness={0.6} />
    </mesh>

    {/* Main gun assembly - keeping same size but adjusted position */}
    <group position={[0, 1.3, 0]}>
      {/* Gun mantlet */}
      <mesh position={[0, 0, -1.2]}>
        <boxGeometry args={[1.4, 0.8, 0.6]} />
        <meshStandardMaterial color="#3A3A3A" metalness={0.6} roughness={0.5} />
      </mesh>

      {/* Main gun barrel */}
      <mesh position={[0, 0, -2.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 5.5, 16]} />
        <meshStandardMaterial color="#2A2A2A" metalness={0.6} roughness={0.5} />
      </mesh>

      {/* Thermal sleeve */}
      <mesh position={[0, 0, -1.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.216, 0.216, 1.2, 16]} />
        <meshStandardMaterial color="#3A3A3A" metalness={0.4} roughness={0.7} />
      </mesh>


    </group>

    {/* ERA blocks on hull front - adjusted for wider hull */}
    {[-1.3, -0.8, -0.3, 0.3, 0.8, 1.3].map((x, i) => (
      <mesh key={i + 32} position={[x, 0.6, 2.15]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[0.4, 0.3, 0.2]} />
        <meshStandardMaterial color="#5D6540" metalness={0.3} roughness={0.8} />
      </mesh>
    ))}

    {/* Side skirts - adjusted position */}
    <mesh position={[2.3, 0.4, 0]}>
      <boxGeometry args={[0.1, 0.6, 4.0]} />
      <meshStandardMaterial color="#4F5D2F" metalness={0.3} roughness={0.7} />
    </mesh>
    <mesh position={[-2.3, 0.4, 0]}>
      <boxGeometry args={[0.1, 0.6, 4.0]} />
      <meshStandardMaterial color="#4F5D2F" metalness={0.3} roughness={0.7} />
    </mesh>

    {/* Additional side hull detail for more body mass */}
    <mesh position={[1.8, 0.5, 0]}>
      <boxGeometry args={[0.3, 0.6, 4.6]} />
      <meshStandardMaterial color="#4A5128" metalness={0.4} roughness={0.7} />
    </mesh>
    <mesh position={[-1.8, 0.5, 0]}>
      <boxGeometry args={[0.3, 0.6, 4.6]} />
      <meshStandardMaterial color="#4A5128" metalness={0.4} roughness={0.7} />
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
      <mesh position={[0, 0, -2.9]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.45, 0.45, 0.65, 16]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.5} roughness={0.7} />
      </mesh>

      {/* Idler wheel */}
      <mesh position={[0, 0, 2.9]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.6, 16]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.5} roughness={0.7} />
      </mesh>

      {/* Road wheels - more of them for realism */}
      {[2.4, 1.8, 1.2, 0.6, 0, -0.6, -1.2, -1.8, -2.4].map((z, i) => (
        <mesh key={i} position={[0, -0.15, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.65, 16]} />
          <meshStandardMaterial color="#202020" metalness={0.5} roughness={0.6} />
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
      <mesh position={[0, 0, -2.9]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.45, 0.45, 0.65, 16]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.5} roughness={0.7} />
      </mesh>

      {/* Idler wheel */}
      <mesh position={[0, 0, 2.9]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.6, 16]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.5} roughness={0.7} />
      </mesh>

      {/* Road wheels - more of them for realism */}
      {[2.4, 1.8, 1.2, 0.6, 0, -0.6, -1.2, -1.8, -2.4].map((z, i) => (
        <mesh key={i + 20} position={[0, -0.15, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.65, 16]} />
          <meshStandardMaterial color="#202020" metalness={0.5} roughness={0.6} />
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
    <mesh position={[0, 1.5, -0.2]} rotation={[0, 0, 0]}>
      <boxGeometry args={[2.6, 0.6, 3.0]} />
      <meshStandardMaterial color="#445139" metalness={0.5} roughness={0.6} />
    </mesh>

    {/* Turret front slope */}
    <mesh position={[0, 1.5, -1.6]} rotation={[-Math.PI / 6, 0, 0]}>
      <boxGeometry args={[2.4, 0.6, 0.8]} />
      <meshStandardMaterial color="#465339" metalness={0.5} roughness={0.6} />
    </mesh>

    {/* Turret rear with stowage rack */}
    <mesh position={[0, 1.5, 1.4]}>
      <boxGeometry args={[2.4, 0.5, 0.3]} />
      <meshStandardMaterial color="#404D39" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Loader's hatch */}
    <mesh position={[-0.6, 1.85, -0.5]}>
      <cylinderGeometry args={[0.4, 0.4, 0.15, 16]} />
      <meshStandardMaterial color="#394431" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Main gun mantlet (thick armor around gun) */}
    <mesh position={[0, 1.5, -1.9]}>
      <boxGeometry args={[1.3, 0.7, 0.6]} />
      <meshStandardMaterial color="#3D4935" metalness={0.5} roughness={0.6} />
    </mesh>

    {/* Main gun barrel */}
    <mesh position={[0, 1.5, -3.8]} rotation={[-Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.18, 0.18, 3.0, 16]} />
      <meshStandardMaterial color="#2A2A2A" metalness={0.6} roughness={0.5} />
    </mesh>

    {/* Thermal sleeve on barrel */}
    <mesh position={[0, 1.5, -2.8]} rotation={[-Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.22, 0.22, 1.2, 16]} />
      <meshStandardMaterial color="#252525" metalness={0.4} roughness={0.7} />
    </mesh>






  </group>
);

export default { TankA, TankB };