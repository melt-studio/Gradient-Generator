import { useStore } from "../../store";
import { BackgroundUpdate } from "../../types";
import ControlGroup from "./ControlGroup";
import Slider from "../Slider";

type PatternProps = {
  handleBackgroundChange: BackgroundUpdate;
};

const Pattern = ({ handleBackgroundChange }: PatternProps) => {
  const background = useStore((state) => state.background);
  const distortion = useStore((state) => state.distortion);
  const speed = useStore((state) => state.speed);
  const drips = useStore((state) => state.drips);
  const grain = useStore((state) => state.grain);

  const sliderDistortion = {
    label: "Distortion",
    value: distortion,
    onChange: handleBackgroundChange("distortion", "uDistortion"),
  };

  const sliderSpeed = {
    label: "Speed",
    value: speed,
    onChange: handleBackgroundChange("speed", "uSpeed", (value) => {
      if (background) {
        const time = background.material.uniforms.uTime.value;
        const speedPrev = background.material.uniforms.uSpeed.value;
        background.material.uniforms.uTime.value = (time * speedPrev) / value;
      }
    }),
    min: 0.5,
    max: 1.5,
  };

  const sliderGrain = {
    label: "Grain",
    value: grain,
    onChange: handleBackgroundChange("grain", "uGrain"),
  };

  const sliderDrips = {
    label: "Drips",
    value: drips,
    onChange: handleBackgroundChange("drips", "uDrips"),
  };

  return (
    <ControlGroup label="Pattern">
      <Slider {...sliderDrips} />
      <Slider {...sliderDistortion} />
      <Slider {...sliderGrain} />
      <Slider {...sliderSpeed} />
    </ControlGroup>
  );
};

export default Pattern;
