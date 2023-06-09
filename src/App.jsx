import { useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { MathUtils } from 'three';
import { Perf } from 'r3f-perf';
import Controls from './Controls/Controls';
import Scene from './Scene/Scene';
import defaultConfig from './config.json';
import presetService from './services/presets';

export default function App() {
  const gradient = useRef();
  const container = useRef();
  const exportSeqBtn = useRef();

  const [config, setConfig] = useState(defaultConfig);
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [presets, setPresets] = useState([]);

  const created = ({ gl }) => {
    gl.domElement.setAttribute('id', 'canvas');
    gl.setClearColor(0x000000);
  };

  useEffect(() => {
    const localConfig = window.localStorage.getItem('melt-gradient-config');
    if (localConfig) {
      const lConfig = JSON.parse(localConfig);
      const dConfig = { ...defaultConfig };
      Object.keys(dConfig).forEach((key) => {
        if (lConfig[key] !== undefined) {
          dConfig[key] = lConfig[key];
        }
      });

      // console.log(dConfig);

      setConfig(dConfig);
    } else {
      window.localStorage.setItem(
        'melt-gradient-config',
        JSON.stringify({ ...defaultConfig, id: MathUtils.generateUUID() }),
      );
    }
  }, []);

  useEffect(() => {
    const getPresets = async () => {
      try {
        const serverPresets = await presetService.getPresets();
        setPresets(serverPresets);
      } catch (error) {
        console.log(error);
      }
    };

    getPresets();
  }, []);

  return (
    <div
      id="canvas-container"
      ref={container}
      // style={{ width: defaults.size.x, height: defaults.size.y }}
    >
      <Controls
        config={config}
        gradient={gradient}
        container={container}
        recording={recording}
        setRecording={setRecording}
        paused={paused}
        setPaused={setPaused}
        exportSeqBtn={exportSeqBtn}
        presets={presets}
        setPresets={setPresets}
      />

      <Canvas
        onCreated={created}
        gl={{
          preserveDrawingBuffer: true,
        }}
        dpr={[1, 2]}
      >
        <Perf position="bottom-left" />
        <Scene
          config={config}
          gradient={gradient}
          recording={recording}
          setRecording={setRecording}
          paused={paused}
          setPaused={setPaused}
          exportSeqBtn={exportSeqBtn}
        />
      </Canvas>
    </div>
  );
}
