import { ChangeEvent } from "react";

interface SelectOption {
  label: string;
}

type SelectProps<T> = {
  options: T[];
  value: T;
  onChange: (value: T) => void;
};

const Select = <T extends SelectOption>({ options, value, onChange }: SelectProps<T>) => {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const option = options.find((o) => o.label === e.target.value);
    if (option) {
      if (onChange) onChange(option);
    }
  };

  return (
    <select
      className="p-2 border-slate-300 rounded-lg flex bg-slate-100 grow"
      value={value.label}
      onChange={handleChange}
    >
      {options.map((option) => {
        return (
          <option key={option.label} value={option.label}>
            {option.label}
          </option>
        );
      })}
    </select>
  );
};

export default Select;
