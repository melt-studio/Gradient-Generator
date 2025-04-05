import { OrthographicCamera } from "@react-three/drei";
import Background from "./Background/Background";

const Scene = () => {
  return (
    <>
      <OrthographicCamera
        makeDefault
        left={-0.5}
        right={0.5}
        top={0.5}
        bottom={-0.5}
        near={-1}
        far={1}
        manual
      />
      <Background />
    </>
  );
};

export default Scene;
