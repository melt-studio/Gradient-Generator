import { useState } from "react";
import { useStore } from "../../store";
import ControlGroup from "./ControlGroup";
import Field from "../Field";
import Select from "../Select";
import { layouts } from "../../store";
import { Layout } from "../../types";
import { sizeLimit } from "../../helpers/useResize";

const CanvasLayout = () => {
  const layout = useStore((state) => state.layout);
  const customLayout = useStore((state) => state.customLayout);
  const setValue = useStore((state) => state.setValue);

  const [inputWidth, setInputWidth] = useState(`${layout.width}`);
  const [inputHeight, setInputHeight] = useState(`${layout.height}`);

  const handleWidthChange = (value: string) => {
    setInputWidth(value);
  };

  const handleHeightChange = (value: string) => {
    setInputHeight(value);
  };

  const handleWidthBlur = () => {
    let width = Number(inputWidth);
    if (isNaN(width)) {
      setInputWidth(`${layout.width}`);
      return;
    }

    width = Math.trunc(width);

    if (width < sizeLimit.min) {
      width = sizeLimit.min;
    }

    if (width !== layout.width) {
      const custom = { ...customLayout, width };
      setValue("customLayout", custom);
      setValue("layout", custom);
    }

    setInputWidth(`${width}`);
  };

  const handleHeightBlur = () => {
    let height = Number(inputHeight);
    if (isNaN(height)) {
      setInputHeight(`${layout.height}`);
      return;
    }

    height = Math.trunc(height);

    if (height < sizeLimit.min) {
      height = sizeLimit.min;
    }

    if (height !== layout.height) {
      const custom = { ...customLayout, height };
      setValue("customLayout", custom);
      setValue("layout", custom);
    }

    setInputHeight(`${height}`);
  };

  const selectSize = {
    options: [...layouts, customLayout],
    value: layout,
    onChange: (value: Layout) => {
      setValue("layout", value);
      setInputWidth(`${value.width}`);
      setInputHeight(`${value.height}`);
    },
  };

  return (
    <ControlGroup label="Layout">
      <div className="flex items-center gap-2 w-full">
        <Select {...selectSize} />
        <Field value={inputWidth} onChange={handleWidthChange} onBlur={handleWidthBlur} hint="W" />
        <Field
          value={inputHeight}
          onChange={handleHeightChange}
          onBlur={handleHeightBlur}
          hint="H"
        />
      </div>
    </ControlGroup>
  );
};

export default CanvasLayout;
