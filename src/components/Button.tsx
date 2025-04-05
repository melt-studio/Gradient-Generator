type ButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

const Button = ({ label, onClick, disabled = false }: ButtonProps) => {
  return (
    <button
      className="py-2 px-4 bg-slate-700 rounded-lg text-slate-100 hover:bg-slate-600 cursor-pointer"
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default Button;
