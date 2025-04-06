import { isEqual } from "lodash";

interface Option {
  label: string;
}

type ToggleOptionProps<T extends Option> = {
  option: T;
  selected: boolean;
  onChange: (value: T) => void;
  disabled?: boolean;
};

const ToggleOption = <T extends Option>({
  option,
  selected,
  onChange,
  disabled = false,
}: ToggleOptionProps<T>) => {
  const handleClick = () => {
    if (disabled || selected) return;
    onChange(option);
  };

  return (
    <div
      className={`w-full p-2 rounded-md cursor-pointer justify-center flex items-center gap-2 group transition-colors duration-250 ${
        selected ? "bg-white" : "hover:bg-slate-50"
      }`}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.code === "Enter") handleClick();
      }}
      tabIndex={disabled ? -1 : 0}
    >
      <div className="cursor-pointer text-center">{option.label}</div>
    </div>
  );
};

type ToggleProps<T> = {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
};

const Toggle = <T extends Option>({
  options,
  value,
  onChange,
  disabled = false,
}: ToggleProps<T>) => {
  return (
    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
      {options.map((option) => {
        const selected = isEqual(option, value);
        return (
          <ToggleOption
            key={option.label}
            option={option}
            selected={selected}
            onChange={onChange}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
};

export default Toggle;
