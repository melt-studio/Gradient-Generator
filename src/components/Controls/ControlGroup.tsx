import { ReactNode } from "react";

type ControlGroupProps = {
  label?: string;
  children: ReactNode;
};

const ControlGroup = ({ label, children }: ControlGroupProps) => {
  return (
    <div className="flex flex-col gap-4 w-full border-t border-slate-200 pt-4">
      {label && <label>{label}</label>}
      {children}
    </div>
  );
};

export default ControlGroup;
