import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { Vector4, Vector2, Color } from 'three';
import vertexShader from './shaders/vertex';
import fragmentShader from './shaders/fragment';

// eslint-disable-next-line no-undef
const capturer = new CCapture({ format: 'png', framerate: 60 });

export default function Scene({ config, gradient, recording, setRecording, exportSeqBtn }) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFrameCount: { value: new Vector2(0, 0) },
      PI: { value: Math.PI },
      uCount: { value: 2 },
      uColor0: { value: new Vector4(1, 0, 0, 0) },
      uColor1: { value: new Vector4(0, 0, 1, 1) },
      uColor2: { value: new Vector4(0, 0, 0, 1) },
      uColor3: { value: new Vector4(0, 0, 0, 1) },
      uColor4: { value: new Vector4(0, 0, 0, 1) },
      uColor5: { value: new Vector4(0, 0, 0, 1) },
      uColor6: { value: new Vector4(0, 0, 0, 1) },
      uColor7: { value: new Vector4(0, 0, 0, 1) },
      uColor8: { value: new Vector4(0, 0, 0, 1) },
      uColor9: { value: new Vector4(0, 0, 0, 1) },
      uDistortion: { value: 0.5 },
      uNoise: { value: 0.25 },
      uSpeed: { value: 0.25 },
      uDuration: { value: 8 },
    }),
    [],
  );

  useEffect(() => {
    if (gradient.current) {
      gradient.current.material.uniforms.uDistortion.value = config.distortion;
      gradient.current.material.uniforms.uNoise.value = config.noise;
      gradient.current.material.uniforms.uSpeed.value = config.speed;
      gradient.current.material.uniforms.uDuration.value = config.duration;
      gradient.current.material.uniforms.uCount.value = config.gradient.length;
      config.gradient
        .map((g) => g)
        .sort((a, b) => a.stop - b.stop)
        .forEach((g, i) => {
          if (i > 10) return;
          const c = new Color(g.hex);
          gradient.current.material.uniforms[`uColor${i}`].value.set(c.r, c.g, c.b, g.stop);
        });
    }
  }, [config, gradient]);

  useEffect(() => {
    if (recording && gradient.current) {
      // eslint-disable-next-line operator-linebreak
      gradient.current.material.uniforms.uFrameCount.value.y =
        gradient.current.material.uniforms.uFrameCount.value.x;
      capturer.start();
    } else {
      capturer.stop();
    }
  }, [recording, gradient]);

  useFrame((state) => {
    if (gradient.current) {
      gradient.current.material.uniforms.uFrameCount.value.x += 1;
      // eslint-disable-next-line operator-linebreak
      gradient.current.material.uniforms.uTime.value =
        gradient.current.material.uniforms.uFrameCount.value.x / 60;
    }

    if (gradient.current && recording) {
      const start = gradient.current.material.uniforms.uFrameCount.value.y;
      const current = gradient.current.material.uniforms.uFrameCount.value.x;
      const duration = gradient.current.material.uniforms.uDuration.value * 60;
      if (current - start <= duration) {
        if (exportSeqBtn.current) {
          const t = (current - start) / duration;
          const colorBg = '#373c4b';
          const colorProgress = '#007bff';
          exportSeqBtn.current.style.background = `linear-gradient(to right, ${colorProgress} ${
            t * 100
          }%, ${colorBg} ${t * 100}%)`;
        }
        capturer.capture(state.gl.domElement);
      } else {
        capturer.stop();
        capturer.save();
        setRecording(false);
      }
    }
  });
  return (
    <>
      <OrthographicCamera
        left={-1}
        right={1}
        top={1}
        bottom={-1}
        near={-1}
        far={1}
        makeDefault
        manual
      />

      <mesh ref={gradient}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </mesh>
    </>
  );
}
