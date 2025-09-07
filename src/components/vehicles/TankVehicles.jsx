import React from 'react';

export const TankA = (props) => (
  <group {...props}>
    {/* Main Hull - Using same hull as TankB */}
    <mesh position={[0, 0.55, 0]}>
      <boxGeometry args={[3.4, 0.9, 6.0]} />
      <meshStandardMaterial color="#4B5320" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Lower hull/chassis - Same as TankB */}
    <mesh position={[0, 0.2, 0]}>
      <boxGeometry args={[3.5, 0.4, 6.1]} />
      <meshStandardMaterial color="#485320" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Upper hull armor plating with beveled edges - Same as TankB */}
    <mesh position={[0, 1.05, 0]}>
      <boxGeometry args={[3.2, 0.2, 5.8]} />
      <meshStandardMaterial color="#4D5522" metalness={0.5} roughness={0.6} />
    </mesh>

    {/* Track assemblies - left side - using TankB position */}
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
      <mesh position={[0, 0, 2.91]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.395, 0.395, 0.62, 16]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.5} roughness={0.7} />
      </mesh>

      {/* Road wheels - more of them for realism */}
      {[2.15, 1.5, 0.9, 0.3, -0.3, -0.9, -1.5, -2.15].map((z, i) => (
        <mesh key={i} position={[0, -0.15, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.65, 16]} />
          <meshStandardMaterial color="#202020" metalness={0.5} roughness={0.6} />
        </mesh>
      ))}
    </group>

    {/* Track assemblies - right side (mirrored) - using TankB position */}
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
      <mesh position={[0, 0, 2.91]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.395, 0.395, 0.62, 16]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.5} roughness={0.7} />
      </mesh>

      {/* Road wheels - more of them for realism */}
      {[2.15, 1.5, 0.9, 0.3, -0.3, -0.9, -1.5, -2.15].map((z, i) => (
        <mesh key={i + 14} position={[0, -0.15, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.65, 16]} />
          <meshStandardMaterial color="#202020" metalness={0.5} roughness={0.6} />
        </mesh>
      ))}
    </group>

    {/* Track guards/mudguards - using TankB position and dimensions */}
    <mesh position={[1.9, 0.65, 0]}>
      <boxGeometry args={[0.7, 0.1, 6.3]} />
      <meshStandardMaterial color="#4F5D2F" metalness={0.3} roughness={0.7} />
    </mesh>
    <mesh position={[-1.9, 0.65, 0]}>
      <boxGeometry args={[0.7, 0.1, 6.3]} />
      <meshStandardMaterial color="#4F5D2F" metalness={0.3} roughness={0.7} />
    </mesh>

    {/* Keeping TankA's original turret components but positioned for the new hull */}
    {/* Turret base with realistic rotation ring */}
    <mesh position={[0, 1.15, -0.5]}>
      <cylinderGeometry args={[1.4, 1.4, 0.22, 24]} />
      <meshStandardMaterial color="#4B5320" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Main turret body with angled armor */}
    <mesh position={[0, 1.6, -0.5]}>
      <boxGeometry args={[2.4, 0.77, 2.86]} />
      <meshStandardMaterial color="#4F5D2F" metalness={0.4} roughness={0.6} />
    </mesh>

    {/* Turret front slope */}
    <mesh position={[0, 1.6, -1.8]} rotation={[-Math.PI / 6, 0, 0]}>
      <boxGeometry args={[2.2, 0.77, 0.88]} />
      <meshStandardMaterial color="#4F5D2F" metalness={0.4} roughness={0.6} />
    </mesh>

    {/* Loader's hatch - now with smoother circular shape */}
    <mesh position={[-0.6, 2.05, -0.2]}>
      <cylinderGeometry args={[0.385, 0.385, 0.11, 24]} />
      <meshStandardMaterial color="#3A3A3A" metalness={0.5} roughness={0.6} />
    </mesh>

    {/* Main gun assembly - adjusted position for the new hull height */}
    <group position={[0, 1.6, -0.5]}>
      {/* Gun mantlet */}
      <mesh position={[0, 0, -1.32]}>
        <boxGeometry args={[1.55, 0.88, 0.66]} />
        <meshStandardMaterial color="#3A3A3A" metalness={0.6} roughness={0.5} />
      </mesh>

      {/* Main gun barrel */}
      <mesh position={[0, 0, -2.64]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 6.05, 16]} />
        <meshStandardMaterial color="#2A2A2A" metalness={0.6} roughness={0.5} />
      </mesh>

      {/* Thermal sleeve */}
      <mesh position={[0, 0, -1.98]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 1.32, 16]} />
        <meshStandardMaterial color="#3A3A3A" metalness={0.4} roughness={0.7} />
      </mesh>
    </group>

    {/* ERA blocks on hull front */}
    {[-1.35, -0.8, -0.25, 0.25, 0.8, 1.35].map((x, i) => (
      <mesh key={i + 32} position={[x, 0.75, 2.8]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.4, 0.3, 0.2]} />
        <meshStandardMaterial color="#5D6540" metalness={0.3} roughness={0.8} />
      </mesh>
    ))}

    {/* Side skirts - adjusted for new hull */}
    <mesh position={[2.1, 0.4, 0]}>
      <boxGeometry args={[0.1, 0.6, 5.8]} />
      <meshStandardMaterial color="#4F5D2F" metalness={0.3} roughness={0.7} />
    </mesh>
    <mesh position={[-2.1, 0.4, 0]}>
      <boxGeometry args={[0.1, 0.6, 5.8]} />
      <meshStandardMaterial color="#4F5D2F" metalness={0.3} roughness={0.7} />
    </mesh>

    {/* Additional side hull detail - adjusted for new hull */}
    <mesh position={[1.85, 0.5, 0]}>
      <boxGeometry args={[0.3, 0.6, 6.2]} />
      <meshStandardMaterial color="#4A5128" metalness={0.4} roughness={0.7} />
    </mesh>
    <mesh position={[-1.85, 0.5, 0]}>
      <boxGeometry args={[0.3, 0.6, 6.2]} />
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
      <mesh position={[0, 0, 2.91]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.395, 0.395, 0.62, 16]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.5} roughness={0.7} />
      </mesh>

      {/* Road wheels - more of them for realism */}
      {[2.15, 1.5, 0.9, 0.3, -0.3, -0.9, -1.5, -2.15].map((z, i) => (
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
      <mesh position={[0, 0, 2.91]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.395, 0.395, 0.62, 16]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.5} roughness={0.7} />
      </mesh>

      {/* Road wheels - more of them for realism */}
      {[2.15, 1.5, 0.9, 0.3, -0.3, -0.9, -1.5, -2.15].map((z, i) => (
        <mesh key={i + 14} position={[0, -0.15, z]} rotation={[0, 0, Math.PI / 2]}>
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