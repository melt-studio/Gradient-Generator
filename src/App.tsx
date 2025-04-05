import { Canvas, GLProps } from "@react-three/fiber";
import { WebGLRenderer } from "three";
import { Perf } from "r3f-perf";
import Controls from "./components/Controls/Controls";
import Scene from "./components/Scene";
import { useStore } from "./store";
import { useEffect, useRef } from "react";
import useResize, { scaleCanvas } from "./helpers/useResize";
import Modal from "./components/Modal";

const debug = process.env.NODE_ENV === "debug";

const App = () => {
  const layout = useStore((state) => state.layout);
  const exporting = useStore((state) => state.exporting);
  const ready = useStore((state) => state.ready);
  const setValue = useStore((state) => state.setValue);

  const container = useRef<HTMLDivElement>(null);

  const created = ({ gl }: { gl: WebGLRenderer }) => {
    setValue("canvas", gl.domElement);
    gl.setClearColor(0x000000);
    setValue("ready", true);
  };

  const glSettings: GLProps = {
    preserveDrawingBuffer: true,
  };

  useEffect(() => {
    if (container.current) {
      setValue("canvasContainer", container.current);
      scaleCanvas(layout);
    }
  }, [container, setValue, layout]);

  useResize();

  return (
    <div className="flex w-full h-dvh bg-slate-100 text-slate-800 font-mono text-xs">
      <div className="flex items-center justify-center p-10 w-full h-full relative">
        <div
          ref={container}
          className={`${exporting ? "absolute origin-center" : ""} ${
            ready ? "" : "opacity-0"
          } transition-opacity duration-500`}
          style={{ aspectRatio: layout.width / layout.height }}
        >
          <Canvas dpr={[1, 2]} gl={glSettings} onCreated={created}>
            {debug && <Perf position="bottom-left" />}
            <Scene />
          </Canvas>
        </div>
      </div>

      <Modal />
      <Controls />
    </div>
  );
};

export default App;
