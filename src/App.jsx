import { useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Perf } from 'r3f-perf';
import Controls from './Controls/Controls';
import Scene from './Scene';
import defaultConfig from './config.json';

export default function App() {
  const gradient = useRef();
  const container = useRef();

  const [config, setConfig] = useState(defaultConfig);

  const created = ({ gl }) => {
    gl.domElement.setAttribute('id', 'canvas');
    gl.setClearColor(0x000000);
  };

  useEffect(() => {
    const localConfig = window.localStorage.getItem('melt-gradient-config');
    if (localConfig) {
      setConfig(JSON.parse(localConfig));
    } else {
      window.localStorage.setItem('melt-gradient-config', JSON.stringify(defaultConfig));
    }
  }, []);

  return (
    <div
      id="canvas-container"
      ref={container}
      // style={{ width: defaults.size.x, height: defaults.size.y }}
    >
      <Controls config={config} gradient={gradient} container={container} />

      <Canvas
        onCreated={created}
        gl={{
          preserveDrawingBuffer: true,
        }}
        dpr={[1, 2]}
      >
        <Perf position="bottom-left" />
        <Scene config={config} gradient={gradient} />
      </Canvas>
    </div>
  );
}
