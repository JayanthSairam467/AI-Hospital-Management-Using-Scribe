import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import { Bed } from '../types';

function getColor(status: Bed['status']): string {
  switch (status) {
    case 'available': return '#22c55e';
    case 'occupied': return '#3b82f6';
    case 'critical': return '#ef4444';
    case 'cleaning': case 'reserved': return '#f59e0b';
    default: return '#94a3b8';
  }
}

// ═══ Simple 3D Bed — entirely one color ══════════════════════════════════
const SimpleBed: React.FC<{
  bed: Bed; position: [number, number, number]; isSelected: boolean; onClick: () => void;
}> = ({ bed, position, isSelected, onClick }) => {
  const c = getColor(bed.status);

  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>

      {isSelected && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.4, 1.3]} />
          <meshStandardMaterial color={c} transparent opacity={0.2} />
        </mesh>
      )}

      {/* Legs */}
      {[[-0.85, -0.4], [-0.85, 0.4], [0.85, -0.4], [0.85, 0.4]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.08, z]}>
          <cylinderGeometry args={[0.03, 0.03, 0.16, 8]} />
          <meshStandardMaterial color={c} />
        </mesh>
      ))}

      {/* Frame */}
      <RoundedBox args={[2, 0.06, 1]} position={[0, 0.19, 0]} radius={0.015}>
        <meshStandardMaterial color={c} />
      </RoundedBox>

      {/* Mattress */}
      <RoundedBox args={[1.8, 0.13, 0.88]} position={[0, 0.29, 0]} radius={0.05}>
        <meshStandardMaterial color={c} roughness={0.7} />
      </RoundedBox>

      {/* Pillow */}
      <RoundedBox args={[0.3, 0.08, 0.5]} position={[-0.68, 0.39, 0]} radius={0.05}>
        <meshStandardMaterial color="white" />
      </RoundedBox>

      {/* Headboard */}
      <RoundedBox args={[0.06, 0.4, 1]} position={[-0.97, 0.33, 0]} radius={0.02}>
        <meshStandardMaterial color={c} />
      </RoundedBox>

      {/* Footboard */}
      <RoundedBox args={[0.05, 0.25, 0.95]} position={[0.97, 0.27, 0]} radius={0.02}>
        <meshStandardMaterial color={c} />
      </RoundedBox>

      {/* Side rails */}
      {[-0.48, 0.48].map((z) => (
        <mesh key={z} position={[0, 0.42, z]}>
          <boxGeometry args={[1.3, 0.02, 0.02]} />
          <meshStandardMaterial color={c} />
        </mesh>
      ))}

      {/* Label */}
      <Text
        position={[0, 0.58, 0]}
        fontSize={0.17}
        color="#0f172a"
        anchorX="center"
        fontWeight={700}
        outlineWidth={0.015}
        outlineColor="white"
      >
        {bed.code}
      </Text>

      {bed.patientName && (
        <Text position={[0, 0.47, 0]} fontSize={0.085} color="#475569" anchorX="center">
          {bed.patientName}
        </Text>
      )}
    </group>
  );
};

// ═══ Main ════════════════════════════════════════════════════════════════
interface BedFloorPlan3DProps { beds: Bed[]; onSelectBed: (bed: Bed) => void; }

export const BedFloorPlan3D: React.FC<BedFloorPlan3DProps> = ({ beds, onSelectBed }) => {
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const handleClick = (bed: Bed) => {
    setSelectedBedId(bed.id === selectedBedId ? null : bed.id);
    onSelectBed(bed);
  };

  const topRow = beds.filter((_, i) => i % 2 === 0);
  const bottomRow = beds.filter((_, i) => i % 2 === 1);
  const maxCols = Math.max(topRow.length, bottomRow.length);
  const sp = 2.6;

  return (
    <div className="w-full rounded-xl overflow-hidden border border-slate-200 shadow-lg" style={{ height: '420px' }}>
      <Canvas
        orthographic
        camera={{
          position: [0, 10, 5],
          zoom: 34,
          near: 0.1,
          far: 100,
        }}
        style={{ background: '#f1f5f9' }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 12, 5]} intensity={0.6} />

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[maxCols * sp + 4, 12]} />
          <meshStandardMaterial color="#e8ecf0" />
        </mesh>

        {/* Corridor line */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
          <planeGeometry args={[maxCols * sp + 4, 0.04]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>

        {/* Top row */}
        {topRow.map((bed, i) => (
          <SimpleBed key={bed.id} bed={bed}
            position={[(i - (topRow.length - 1) / 2) * sp, 0, -2.5]}
            isSelected={selectedBedId === bed.id}
            onClick={() => handleClick(bed)}
          />
        ))}

        {/* Bottom row */}
        {bottomRow.map((bed, i) => (
          <group key={bed.id} rotation={[0, Math.PI, 0]}>
            <SimpleBed bed={bed}
              position={[-(i - (bottomRow.length - 1) / 2) * sp, 0, -2.5]}
              isSelected={selectedBedId === bed.id}
              onClick={() => handleClick(bed)}
            />
          </group>
        ))}
      </Canvas>
    </div>
  );
};
