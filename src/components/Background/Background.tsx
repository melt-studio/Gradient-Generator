import { useEffect, useMemo, useRef } from "react";
import { Vector4 } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { vertexShader } from "./shaders/vertex";
import { fragmentShader } from "./shaders/fragment";
import { initialState, useStore } from "../../store";
import { BackgroundMesh } from "../../types";

const Background = () => {
  const setValue = useStore((state) => state.setValue);
  const exporting = useStore((state) => state.exporting);
  const ref = useRef<BackgroundMesh>(null);

  useEffect(() => {
    if (ref.current) setValue("background", ref.current);
  }, [ref, setValue]);

  const { size } = useThree();

  const [uniforms] = useMemo(() => {
    const localConfig = window.localStorage.getItem("melt-gradient-generator");
    const config = localConfig ? JSON.parse(localConfig).state : initialState;

    const uniforms = {
      uTime: { value: 0 },
      uColors: { value: config.color },
      uDrips: { value: config.drips },
      uSpeed: { value: config.speed },
      uGrain: { value: config.grain },
      uDistortion: { value: config.distortion },
      uResolution: {
        value: new Vector4(0, 0, 1024, 1024),
      },
      PI: { value: Math.PI },
      uColorMode: { value: config.colorMode.value },
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
    };

    return [uniforms];
  }, []);

  useEffect(() => {
    if (ref.current && ref.current.material) {
      ref.current.material.uniforms.uResolution.value.x = size.width;
      ref.current.material.uniforms.uResolution.value.y = size.height;
    }
  }, [size, setValue]);

  useFrame((_state, delta) => {
    if (ref.current && ref.current.material && !exporting) {
      ref.current.material.uniforms.uTime.value += delta;
    }
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

export default Background;
