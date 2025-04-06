import { ChangeEvent, DetailedHTMLProps, InputHTMLAttributes } from "react";
type FieldProps = {
  value: string | number;
  hint?: string;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
};

const Field = ({
  value,
  hint,
  onChange,
  onBlur,
  placeholder = "",
  readOnly = false,
  disabled = false,
}: FieldProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e.target.value);
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    if (onBlur) onBlur(e.target.value);
  };

  const inputProps: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> = {
    className: `p-2 border-slate-300 rounded-lg text-right flex bg-slate-100 max-w-20 relative ${
      readOnly ? "pointer-events-none" : ""
    }`,
    type: "text",
    value,
    onChange: handleChange,
    onBlur: handleBlur,
    placeholder,
    readOnly,
    disabled,
  };

  return (
    <div className="flex items-center w-fit relative">
      {hint && (
        <span className="absolute left-0 top-0 text-slate-400 w-fit px-2 h-full z-2 flex items-center justify-center pointer-events-none">
          {hint}
        </span>
      )}
      <input {...inputProps} />
    </div>
  );
};

export default Field;
