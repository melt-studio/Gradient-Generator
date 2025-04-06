import { State, useStore } from "../../store";
import Logo from "../Logo";

import Export from "./Export";
import Pattern from "./Pattern";
import Colors from "./Color";
import CanvasLayout from "./CanvasLayout";

const Controls = () => {
  const background = useStore((state) => state.background);
  const exporting = useStore((state) => state.exporting);
  const setValue = useStore((state) => state.setValue);

  const handleBackgroundChange =
    (key: keyof State, uniform: string, callback?: (value: number) => void) => (value: number) => {
      setValue(key, value);
      if (callback) callback(value);
      if (background) {
        background.material.uniforms[uniform].value = value;
      }
    };

  return (
    <div className="w-[400px] min-w-[400px] h-full bg-white p-5 flex flex-col gap-4 overflow-y-scroll">
      <Logo fill="#000000" />
      <div
        className={`flex flex-col gap-4 transition-opacity ${
          exporting ? "pointer-events-none opacity-50 select-none" : ""
        }`}
      >
        <CanvasLayout />
        <Colors handleBackgroundChange={handleBackgroundChange} />
        <Pattern handleBackgroundChange={handleBackgroundChange} />
        <Export />
      </div>
    </div>
  );
};

export default Controls;
