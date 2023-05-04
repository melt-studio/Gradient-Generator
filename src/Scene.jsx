import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { Vector4 } from 'three';
import vertexShader from './shaders/vertex';
import fragmentShader from './shaders/fragment';

// let capturer = new CCapture({ format: 'png', framerate: 60 });

// let recording = false;

export default function Scene({ config, gradient }) {
  let frameCount = 0;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
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
      uDistortion: { value: config.distortion },
      uNoise: { value: config.noise },
      uDuration: { value: config.duration },
    }),
    [config],
  );

  useFrame(() => {
    if (gradient.current) {
      gradient.current.material.uniforms.uTime.value = frameCount / 60;
    }

    frameCount += 1;

    // if (mesh.current && recording) {
    //   //   console.log("recording");
    //   if (mesh.current.material.uniforms.uTime.value < 8.5)
    //     capturer.capture(gl.domElement);
    //   else {
    //     capturer.stop();
    //     capturer.save();
    //     return;
    //   }
    // }
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
