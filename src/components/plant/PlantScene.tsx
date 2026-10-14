import { useEffect, useMemo } from "react";
import { CanvasTexture, RepeatWrapping, SRGBColorSpace, Vector3 } from "three";
import { useFrame, type ThreeElements } from "@react-three/fiber";

export const PARTS = ["Horizontal chamber", "Large vessel", "Rear vessel", "Small vessel", "Tall column"];
export type PlantPalette = { silver: string; board: string; seam: string; interior: string; light: string };

function surfaceTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "rgb(210,210,210)";
    ctx.fillRect(0, 0, 256, 256);
    for (let x = 0; x < 256; x++) {
      const shade = 175 + Math.round(35 * Math.sin(x * 1.73));
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(x, 0, 1, 256);
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(3, 1);
  return texture;
}

function Marker({ number, position, visible }: { number: number; position: [number, number, number]; visible: boolean }) {
  const point = useMemo(() => new Vector3(...position).add(new Vector3(0, 0.09, 0)), [position]);
  const projected = useMemo(() => new Vector3(), []);
  useFrame(({ camera, gl, size }) => {
    const label = gl.domElement.parentElement?.parentElement?.querySelector<HTMLElement>(`[data-plant-marker="${number}"]`);
    if (!label) return;
    projected.copy(point).project(camera);
    label.style.display = visible && projected.z < 1 ? "flex" : "none";
    label.style.transform = `translate(${(projected.x + 1) * size.width / 2}px,${(1 - projected.y) * size.height / 2}px) translate(-50%,-50%)`;
  });
  return null;
}

export function PlantScene({ palette, labels }: { palette: PlantPalette; labels: boolean }) {
  const texture = useMemo(surfaceTexture, []);
  useEffect(() => () => texture.dispose(), [texture]);
  const metal: ThreeElements["meshStandardMaterial"] = { color: palette.silver, map: texture, metalness: 0.75, roughness: 0.38 };
  function Vessel({ position, radius, height }: { position: [number, number, number]; radius: number; height: number }) {
    return <group position={position}>
      <mesh position-y={height / 2} castShadow receiveShadow><cylinderGeometry args={[radius, radius, height, 48]} /><meshStandardMaterial {...metal} /></mesh>
      {[0.06, height - 0.06].map(y => <mesh key={y} position-y={y} rotation-x={Math.PI / 2} castShadow><torusGeometry args={[radius + 0.012, 0.025, 6, 48]} /><meshStandardMaterial color={palette.silver} metalness={0.8} roughness={0.25} /></mesh>)}
      <mesh position-y={height + 0.015} castShadow><cylinderGeometry args={[radius + 0.015, radius + 0.015, 0.035, 48]} /><meshStandardMaterial {...metal} roughness={0.5} /></mesh>
    </group>;
  }
  return <group position-y={0.09}>
    <mesh position-y={-0.09} receiveShadow><boxGeometry args={[9, 0.18, 6]} /><meshStandardMaterial color={palette.board} roughness={0.44} bumpMap={texture} bumpScale={0.006} /></mesh>
    <Vessel position={[0.5, 0, -0.45]} radius={0.93} height={2.05} />
    <Vessel position={[-2.05, 0, -1.55]} radius={0.78} height={1.6} />
    <Vessel position={[2.05, 0, 0.6]} radius={0.5} height={1.05} />
    <Vessel position={[3.4, 0, 0.7]} radius={0.39} height={3.65} />
    <group position={[-1.65, 0.85, 0.65]} rotation-z={Math.PI / 2}>
      <mesh castShadow><cylinderGeometry args={[0.73, 0.73, 2.9, 48, 1, true, 2.05, Math.PI * 2 - 0.96]} /><meshStandardMaterial {...metal} side={2} /></mesh>
      {[-1.25, 1.25].map(y => <mesh key={y} position-y={y} castShadow><cylinderGeometry args={[0.73, 0.73, 0.4, 48]} /><meshStandardMaterial {...metal} /></mesh>)}
      {[-1.45, 1.45].map(y => <mesh key={y} position-y={y} rotation-x={Math.PI / 2}><torusGeometry args={[0.73, 0.035, 8, 48]} /><meshStandardMaterial color={palette.silver} metalness={0.8} roughness={0.25} /></mesh>)}
      <mesh rotation-z={-Math.PI / 2} position={[-0.3, 0, 0]}><boxGeometry args={[2.1, 0.06, 0.85]} /><meshStandardMaterial color={palette.interior} roughness={0.95} /></mesh>
      <mesh position-y={1.65} castShadow><cylinderGeometry args={[0.22, 0.22, 0.4, 32]} /><meshStandardMaterial {...metal} /></mesh>
    </group>
    {/* Low rectangular connectors follow the physical prototype, not an inferred process diagram. */}
    <mesh position={[1.42, 0.35, 0.12]} rotation-y={-0.5} castShadow><boxGeometry args={[0.9, 0.45, 0.38]} /><meshStandardMaterial {...metal} /></mesh>
    <mesh position={[2.78, 0.27, 0.7]} castShadow><boxGeometry args={[0.85, 0.5, 0.44]} /><meshStandardMaterial {...metal} /></mesh>
    <mesh position={[-0.13, 0.58, 0.15]} rotation-y={0.5} castShadow><boxGeometry args={[0.75, 0.46, 0.45]} /><meshStandardMaterial {...metal} /></mesh>
    <Marker visible={labels} number={1} position={[-1.65, 1.8, 0.85]} /><Marker visible={labels} number={2} position={[0.5, 2.35, -0.45]} /><Marker visible={labels} number={3} position={[-2.05, 1.9, -1.55]} /><Marker visible={labels} number={4} position={[2.05, 1.35, 0.6]} /><Marker visible={labels} number={5} position={[3.4, 3.95, 0.7]} />
  </group>;
}