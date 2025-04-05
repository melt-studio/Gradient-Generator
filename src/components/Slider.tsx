import { ChangeEvent, useState } from "react";
import Field from "./Field";
import { MathUtils } from "three";

type SliderProps = {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

const Slider = ({ label, value, onChange, step = 0.01, min = 0, max = 1 }: SliderProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const valNumber = Number(e.target.value);
    onChange(valNumber);
    setInputValue(e.target.value);
  };

  const [inputValue, setInputValue] = useState(`${value}`);

  const handleInputChange = (val: string) => {
    setInputValue(val);
  };

  const handleInputBlur = () => {
    let valueNumber = Number(inputValue);

    if (isNaN(valueNumber)) {
      setInputValue(`${value}`);
      return;
    }

    valueNumber = Math.max(min, Math.min(max, valueNumber));
    setInputValue(`${valueNumber}`);
    onChange(valueNumber);
  };

  return (
    <div className="flex items-center">
      {label && <label className="w-20">{label}</label>}
      <div className="flex items-center gap-2 grow">
        <div className="flex items-center gap-2 w-full relative group">
          <div className="h-0.5 absolute left-2 right-2 bg-slate-300 pointer-events-none group-hover:bg-slate-400/75 transition-colors"></div>
          <div className="h-4 absolute left-2 right-2 pointer-events-none">
            <div
              className="w-4 h-4 flex items-center justify-center absolute"
              style={{
                left: `${MathUtils.mapLinear(value, min, max, 0, 1) * 100}%`,
                transform: "translateX(-50%)",
              }}
            >
              <div className="w-4 h-4 p-0.5 bg-white border border-slate-200 rounded-full group-hover:border-slate-400/75 transition-colors">
                <div className="w-full h-full bg-slate-600 rounded-full"></div>
              </div>
            </div>
          </div>
          <input
            type="range"
            value={value}
            onChange={handleChange}
            min={min}
            max={max}
            step={step}
            className={`
              relative
              appearance-none
              w-full
              cursor-pointer
              [&::-webkit-slider-runnable-track]:appearance-none
              [&::-webkit-slider-runnable-track]:h-4
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:invisible
              [&::-moz-range-track]:appearance-none
              [&::-moz-range-track]:h-4
              [&::-moz-range-thumb]:w-4
              [&::-moz-range-thumb]:h-4
              [&::-moz-range-thumb]:appearance-none
              [&::-moz-range-thumb]:invisible
            `}
          />
        </div>
        <Field value={inputValue} onChange={handleInputChange} onBlur={handleInputBlur} />
      </div>
    </div>
  );
};

export default Slider;
