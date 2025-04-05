import { BackgroundUpdate, ColorMode, ColorModeValue } from "../../types";
import ControlGroup from "./ControlGroup";
import GradientPicker from "./GradientPicker";
import Slider from "../Slider";
import Toggle from "../Toggle";
import { colorModes, useStore } from "../../store";
import { useEffect, useState } from "react";

type ColorsProps = {
  handleBackgroundChange: BackgroundUpdate;
};

const Colors = ({ handleBackgroundChange }: ColorsProps) => {
  const color = useStore((state) => state.color);
  const colorMode = useStore((state) => state.colorMode);
  const background = useStore((state) => state.background);
  const setValue = useStore((state) => state.setValue);

  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sliderColor = {
    label: "Palette",
    value: color,
    onChange: handleBackgroundChange("color", "uColors"),
  };

  const toggleColor = {
    options: colorModes,
    value: colorMode,
    onChange: (value: ColorMode) => {
      if (background) {
        background.material.uniforms.uColorMode.value = value.value;
      }
      setValue("colorMode", value);
    },
  };

  return (
    <ControlGroup label="Color">
      <Toggle {...toggleColor} />
      {colorMode.value === ColorModeValue.Defined && <Slider {...sliderColor} />}
      {colorMode.value === ColorModeValue.Custom && <GradientPicker viewport={viewport} />}
    </ControlGroup>
  );
};

export default Colors;
