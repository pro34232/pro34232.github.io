import { Component, Suspense, useEffect, useRef, useState, type ComponentRef, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Minus, Plus, RotateCcw, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PARTS, PlantScene, type PlantPalette } from "./PlantScene";

class ViewerBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  override render() { return this.state.failed ? <div className="p-8 text-muted-foreground" role="status">The 3D view is unavailable on this device.</div> : this.props.children; }
}

export default function PlantViewer() {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const container = useRef<HTMLDivElement>(null);
  const [labels, setLabels] = useState(true);
  const [palette, setPalette] = useState<PlantPalette | null>(null);
  useEffect(() => {
    if (!container.current) return;
    const styles = getComputedStyle(container.current);
    const read = (name: string) => styles.getPropertyValue(name).trim();
    setPalette({ silver: read("--plant-silver"), board: read("--plant-board"), seam: read("--plant-seam"), interior: read("--plant-interior"), light: read("--plant-light") });
  }, []);
  const zoom = (factor: number) => {
    const orbit = controls.current;
    if (!orbit) return;
    const offset = orbit.object.position.clone().sub(orbit.target);
    offset.setLength(Math.max(7, Math.min(24, offset.length() * factor)));
    orbit.object.position.copy(orbit.target).add(offset);
    orbit.update();
  };
  return <div ref={container} className="mt-7" aria-label="3D plant model">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
      <p className="text-sm text-muted-foreground">Photo-based prototype · approximate proportions</p>
      <div className="flex gap-1" role="toolbar" aria-label="Plant view controls">
        <Button variant="ghost" size="icon" aria-label="Zoom in" title="Zoom in" onClick={() => zoom(0.85)}><Plus /></Button>
        <Button variant="ghost" size="icon" aria-label="Zoom out" title="Zoom out" onClick={() => zoom(1.18)}><Minus /></Button>
        <Button variant="ghost" size="icon" aria-label="Reset plant view" title="Reset view" onClick={() => controls.current?.reset()}><RotateCcw /></Button>
        <Button variant={labels ? "default" : "ghost"} size="icon" aria-label="Show part labels" title="Part labels" aria-pressed={labels} onClick={() => setLabels(v => !v)}><Tags /></Button>
      </div>
    </div>
    <div className="plant-canvas relative h-[360px] sm:h-[480px]" role="img" aria-label="Silver horizontal chamber, three vessels and tall column on a green base">
      <ViewerBoundary>
        {palette && <Canvas shadows dpr={[1, 1.5]} camera={{ position: [9, 8, 11], fov: 42 }} fallback={<p className="p-6 text-muted-foreground">This device cannot display the 3D model.</p>}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 8, 6]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} />
          <Suspense fallback={null}>
            <Environment resolution={64}>
              <Lightformer intensity={3} color={palette.light} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
              <Lightformer intensity={2} color={palette.light} position={[-6, 3, 2]} rotation-y={Math.PI / 2} scale={[8, 4, 1]} />
              <Lightformer intensity={1.5} color={palette.light} position={[6, 2, -4]} rotation-y={-Math.PI / 2} scale={[8, 4, 1]} />
            </Environment>
            <PlantScene palette={palette} labels={labels} />
          </Suspense>
          <OrbitControls ref={controls} makeDefault target={[0, 1.1, 0]} minDistance={7} maxDistance={24} minPolarAngle={0.2} maxPolarAngle={Math.PI / 2.05} enablePan={false} enableDamping />
        </Canvas>}
      </ViewerBoundary>
    </div>
    <ol className="grid grid-cols-2 gap-x-5 gap-y-3 border-t pt-4 sm:grid-cols-3 lg:grid-cols-5" aria-label="Plant parts">
      {PARTS.map((part, i) => <li key={part} className="flex gap-2 text-sm"><span className="text-primary font-medium">{i + 1 < 10 ? `0${i + 1}` : i + 1}</span><span>{part}</span></li>)}
    </ol>
    <p className="mt-3 text-xs text-muted-foreground">Descriptive labels only; process functions and dimensions are not confirmed.</p>
  </div>;
}