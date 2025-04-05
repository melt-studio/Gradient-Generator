import { useStore } from "../store";
import Button from "./Button";

const Modal = () => {
  const modal = useStore((state) => state.modal);
  const setValue = useStore((state) => state.setValue);

  if (!modal) return null;

  const handleClose = () => {
    if (modal.closeOnClick) modal.closeOnClick();
    setValue("modal", null);
  };

  return (
    <div className="absolute inset-0 flex justify-center items-center z-20 bg-slate-100/75">
      <div className="w-[400px] h-fit p-4 rounded-lg bg-white text-xs">
        <div className="flex flex-col gap-4 h-full">
          <h3 className="text-xs">{modal.title}</h3>
          <div className="flex flex-col gap-y-4">
            <div>{modal.description}</div>
            <div className="flex flex-col gap-y-2">
              {modal.progress !== undefined && (
                <div className="h-1 w-full rounded-lg relative overflow-hidden bg-slate-100">
                  <div
                    className={`absolute left-0 top-0 bottom-0 bg-slate-700`}
                    style={{
                      width: `${modal.progress * 100}%`,
                    }}
                  ></div>
                </div>
              )}
              {modal.status !== undefined && <div>{modal.status}</div>}
            </div>
          </div>
          <div className="flex mt-auto border-t border-slate-200 pt-4 mt-2">
            <Button label={modal.closeLabel || "Close"} onClick={handleClose} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
