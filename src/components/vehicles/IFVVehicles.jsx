import React from 'react';

/* IFV Vehicle Designs */
export const IFV_A = (props) => (
  <group {...props}>
    {/* Base hull with realistic proportions - extended length */}
    <mesh position={[0, 0.4, 0.4]}>
      <boxGeometry args={[2.4, 0.6, 5.0]} />
      <meshStandardMaterial color="#485142" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Lower hull/chassis - extended length */}
    <mesh position={[0, 0.2, 0.4]}>
      <boxGeometry args={[2.5, 0.4, 3.0]} />
      <meshStandardMaterial color="#445029" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Sloped front glacis plate */}
    <mesh position={[0, 0.5, -2.0]} rotation={[-Math.PI / 4, 0, 0]}>
      <boxGeometry args={[2.2, 0.7, 0.8]} />
      <meshStandardMaterial color="#4A5144" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Upper hull structure with extended troop compartment */}
    <mesh position={[0, 0.9, 0.8]}>
      <boxGeometry args={[2.2, 0.6, 4.4]} />
      <meshStandardMaterial color="#4D5446" metalness={0.3} roughness={0.6} />
    </mesh>

    {/* Track assemblies - left side - extended length */}
    <group position={[-1.3, 0.3, 0.4]}>
      {/* Track body - extended length */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.6, 0.6, 5.2]} />
        <meshStandardMaterial color="#252525" metalness={0.3} roughness={0.8} />
      </mesh>

      {/* Drive sprocket - moved forward*/}
      <mesh position={[0, 0, -2.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.35, 0.35, 0.65, 16]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.5} roughness={0.7} />
      </mesh>

      {/* Idler wheel - moved backward */}
      <mesh position={[0, 0, 2.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.32, 0.32, 0.65, 16]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.5} roughness={0.7} />
      </mesh>

      {/* Road wheels - repositioned for longer track */}
      {[1.8, 0.9, 0, -0.9, -1.8].map((z, i) => (
        <mesh key={i} position={[0, -0.15, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.65, 16]} />
          <meshStandardMaterial color="#202020" metalness={0.5} roughness={0.6} />
        </mesh>
      ))}


    </group>

    {/* Track assemblies - right side - extended length */}
    <group position={[1.3, 0.3, 0.4]}>
      {/* Track body - extended length */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.6, 0.6, 5.2]} />
        <meshStandardMaterial color="#252525" metalness={0.3} roughness={0.8} />
      </mesh>

      {/* Drive sprocket - moved forward */}
      <mesh position={[0, 0, -2.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.35, 0.35, 0.65, 16]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.5} roughness={0.7} />
      </mesh>

      {/* Idler wheel - moved backward */}
      <mesh position={[0, 0, 2.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.32, 0.32, 0.65, 16]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.5} roughness={0.7} />
      </mesh>

      {/* Road wheels - repositioned for longer track */}
      {[1.8, 0.9, 0, -0.9, -1.8].map((z, i) => (
        <mesh key={i + 14} position={[0, -0.15, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.65, 16]} />
          <meshStandardMaterial color="#202020" metalness={0.5} roughness={0.6} />
        </mesh>
      ))}


    </group>

    {/* Track guards/mudguards - extended length */}
    <mesh position={[1.3, 0.65, 0.4]}>
      <boxGeometry args={[0.7, 0.1, 5.3]} />
      <meshStandardMaterial color="#4A5144" metalness={0.3} roughness={0.7} />
    </mesh>
    <mesh position={[-1.3, 0.65, 0.4]}>
      <boxGeometry args={[0.7, 0.1, 5.3]} />
      <meshStandardMaterial color="#4A5144" metalness={0.3} roughness={0.7} />
    </mesh>

    {/* Turret base with rotation ring - same position */}
    <mesh position={[0, 1.2, -0.4]}>
      <cylinderGeometry args={[0.9, 0.9, 0.15, 24]} />
      <meshStandardMaterial color="#424739" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Main turret body - same position */}
    <mesh position={[0, 1.5, -0.4]}>
      <boxGeometry args={[1.8, 0.5, 1.6]} />
      <meshStandardMaterial color="#4D5446" metalness={0.4} roughness={0.6} />
    </mesh>

    {/* Turret front slope - same position */}
    <mesh position={[0, 1.5, -1.1]} rotation={[-Math.PI / 6, 0, 0]}>
      <boxGeometry args={[1.6, 0.5, 0.6]} />
      <meshStandardMaterial color="#4D5446" metalness={0.4} roughness={0.6} />
    </mesh>

    {/* Loader's hatch - similar to tanks */}
    <mesh position={[-0.5, 1.8, -0.4]}>
      <cylinderGeometry args={[0.28, 0.28, 0.08, 24]} />
      <meshStandardMaterial color="#3A3A3A" metalness={0.5} roughness={0.6} />
    </mesh>

    {/* Main gun assembly - same position */}
    <group position={[0, 1.5, -0.4]}>
      {/* Gun mantlet */}
      <mesh position={[0, 0, -0.8]}>
        <boxGeometry args={[1.0, 0.6, 0.4]} />
        <meshStandardMaterial color="#3A3A3A" metalness={0.6} roughness={0.5} />
      </mesh>

      {/* Main gun */}
      <mesh position={[0, 0, -2.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 2.4, 16]} />
        <meshStandardMaterial color="#2A2A2A" metalness={0.6} roughness={0.5} />
      </mesh>

      {/* Thermal sleeve */}
      <mesh position={[0, 0, -1.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 1.2, 16]} />
        <meshStandardMaterial color="#3A3A3A" metalness={0.4} roughness={0.7} />
      </mesh>
    </group>

    {/* Troop compartment details - extended */}
    {/* Side armor plates - extended */}
    <mesh position={[1.2, 0.7, 0.8]}>
      <boxGeometry args={[0.1, 0.8, 3.8]} />
      <meshStandardMaterial color="#4A5144" metalness={0.3} roughness={0.7} />
    </mesh>
    <mesh position={[-1.2, 0.7, 0.8]}>
      <boxGeometry args={[0.1, 0.8, 3.8]} />
      <meshStandardMaterial color="#4A5144" metalness={0.3} roughness={0.7} />
    </mesh>

    {/* Extended rear compartment */}
    <mesh position={[0, 0.9, 2.2]}>
      <boxGeometry args={[2.2, 0.8, 1.6]} />
      <meshStandardMaterial color="#4D5446" metalness={0.3} roughness={0.6} />
    </mesh>



  </group>
);

/* IFV Design B – A modern Infantry Fighting Vehicle with realistic proportions and details */
export const IFV_B = (props) => (
  <group {...props}>
    {/* Main hull with realistic proportions */}
    <mesh position={[0, 0.35, 0]}>
      <boxGeometry args={[2.4, 0.6, 4.4]} />
      <meshStandardMaterial color="#4A5144" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Sloped front glacis plate */}
    <mesh position={[0, 0.55, 2.0]} rotation={[Math.PI / 5, 0, 0]}>
      <boxGeometry args={[2.4, 0.8, 0.8]} />
      <meshStandardMaterial color="#4D5446" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Upper hull with angled sides for better protection */}
    <mesh position={[0, 0.8, 0.2]}>
      <boxGeometry args={[2.2, 0.5, 3.6]} />
      <meshStandardMaterial color="#515749" metalness={0.3} roughness={0.6} />
    </mesh>

    {/* Track assemblies - left side (same as IFV_A) */}
    <group position={[-1.3, 0.3, 0]}>
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

      {/* Road wheels */}
      {[1.4, 0.7, 0, -0.7, -1.4].map((z, i) => (
        <mesh key={i} position={[0, -0.15, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.65, 16]} />
          <meshStandardMaterial color="#202020" metalness={0.5} roughness={0.6} />
        </mesh>
      ))}
    </group>

    {/* Track assemblies - right side (same as IFV_A) */}
    <group position={[1.3, 0.3, 0]}>
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

      {/* Road wheels */}
      {[1.4, 0.7, 0, -0.7, -1.4].map((z, i) => (
        <mesh key={i + 14} position={[0, -0.15, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.65, 16]} />
          <meshStandardMaterial color="#202020" metalness={0.5} roughness={0.6} />
        </mesh>
      ))}
    </group>

    {/* Track guards/mudguards (same as IFV_A) */}
    <mesh position={[1.3, 0.65, 0]}>
      <boxGeometry args={[0.7, 0.1, 4.5]} />
      <meshStandardMaterial color="#4A5144" metalness={0.3} roughness={0.7} />
    </mesh>
    <mesh position={[-1.3, 0.65, 0]}>
      <boxGeometry args={[0.7, 0.1, 4.5]} />
      <meshStandardMaterial color="#4A5144" metalness={0.3} roughness={0.7} />
    </mesh>

    {/* Enhanced turret base with realistic ring */}
    <mesh position={[0, 1.05, -0.6]}>
      <cylinderGeometry args={[1.1, 1.1, 0.15, 32]} />
      <meshStandardMaterial color="#3F4438" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Main turret body with modern angular armor */}
    <mesh position={[0, 1.4, -0.6]}>
      <boxGeometry args={[1.8, 0.6, 2.0]} />
      <meshStandardMaterial color="#4A5144" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Turret front with composite armor spacing */}
    <mesh position={[0, 1.4, -1.5]} rotation={[Math.PI / 8, 0, 0]}>
      <boxGeometry args={[1.8, 0.6, 0.8]} />
      <meshStandardMaterial color="#4D5446" metalness={0.4} roughness={0.7} />
    </mesh>

    {/* Loader's hatch - similar to tanks */}
    <mesh position={[-0.5, 1.7, -0.4]}>
      <cylinderGeometry args={[0.28, 0.28, 0.08, 24]} />
      <meshStandardMaterial color="#3A3A3A" metalness={0.5} roughness={0.6} />
    </mesh>

    {/* Main gun with thermal sleeve */}
    <mesh position={[0, 1.4, -2.4]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.15, 0.15, 2.2, 24]} />
      <meshStandardMaterial color="#252525" metalness={0.6} roughness={0.5} />
    </mesh>

    {/* Gun thermal sleeve */}
    <mesh position={[0, 1.4, -1.8]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.18, 0.18, 1.0, 24]} />
      <meshStandardMaterial color="#303030" metalness={0.4} roughness={0.8} />
    </mesh>

    {/* Rear troop compartment details */}
    <mesh position={[0, 1.0, 1.0]}>
      <boxGeometry args={[2.0, 0.4, 1.8]} />
      <meshStandardMaterial color="#485142" metalness={0.4} roughness={0.7} />
    </mesh>

  </group>
);

export default { IFV_A, IFV_B }; 