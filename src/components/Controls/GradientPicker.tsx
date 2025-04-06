import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useStore } from "../../store";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Gradient, GradientColor } from "../../types";
import { Color, MathUtils } from "three";
import { ChromePicker } from "react-color";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";

type DragColorProps = {
  color: GradientColor;
  gradient: Gradient;
  setDisplayPicker: (display: boolean) => void;
  setPickerColor: (color: GradientColor) => void;
  position: DOMRect | null;
  limit: { min: number; max: number };
  x: number;
  disabled?: boolean;
};

const DragColor = ({
  color,
  setDisplayPicker,
  setPickerColor,
  position,
  limit,
  x,
  disabled = false,
}: DragColorProps) => {
  const deleteDragDist = 20;

  const gradient = useStore((state) => state.gradient);
  const setValue = useStore((state) => state.setValue);
  const nodeRef = useRef<HTMLDivElement>(document.createElement("div"));
  const deleteIcon = useRef<HTMLDivElement>(null);

  const handleDoubleClick = () => {
    if (disabled) return;
    setPickerColor(color);
    setDisplayPicker(true);
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      axis="x"
      bounds="parent"
      defaultPosition={{ x, y: 0 }}
      onDrag={(e: DraggableEvent) => {
        if (!position || disabled) return false;
        const m = e as MouseEvent;
        const dragY = m.clientY - position.height - position.top + 15;
        const colors: GradientColor[] = JSON.parse(JSON.stringify(gradient.colors));
        if (dragY > deleteDragDist && colors.length > limit.min) {
          if (deleteIcon.current) deleteIcon.current.style.opacity = "1";
        } else {
          if (deleteIcon.current) deleteIcon.current.style.opacity = "0";
        }
      }}
      onStop={(e: DraggableEvent, data: DraggableData) => {
        if (!position || disabled) return false;
        let colors: GradientColor[] = JSON.parse(JSON.stringify(gradient.colors));
        const dragY = (e as MouseEvent).clientY - position.height - position.top + 15;

        const delta = Math.abs(data.x - Number(nodeRef.current.dataset.x));

        if (delta === 0) return;

        nodeRef.current.dataset.x = `${data.x}`;

        if (dragY > deleteDragDist && colors.length > limit.min) {
          colors = colors.filter((c) => c.id !== color.id);
        } else {
          const stop =
            MathUtils.clamp((e as MouseEvent).x - position.x, 0, position.width) / position.width;
          const col = colors.find((c) => c.id === color.id);
          if (col) col.stop = stop;
        }

        colors.sort((a, b) => a.stop - b.stop);

        setValue("gradient", { ...gradient, colors });
      }}
    >
      <div
        data-x={x}
        ref={nodeRef}
        className="relative w-0 h-6 group"
        onDoubleClick={handleDoubleClick}
      >
        <span
          className="absolute w-6 h-6 top-0 left-0 p-0.5 cursor-pointer rounded-lg bg-white border border-slate-300 hover:border-slate-400 transition-colors group-[.react-draggable-dragging]:cursor-grabbing -translate-x-1/2"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.code === "Enter") {
              handleDoubleClick();
            }
          }}
        >
          <span className="w-full h-full rounded-md block" style={{ background: color.hex }}></span>
        </span>
        <div
          ref={deleteIcon}
          className="absolute w-5 h-5 top-0.5 left-0 p-0.5 pointer-events-none opacity-0 -translate-x-1/2 bg-slate-100/90 rounded-md"
        >
          <TrashIcon className="w-full h-full" />
        </div>
      </div>
    </Draggable>
  );
};

type GradientPickerProps = {
  viewport: {
    width: number;
    height: number;
  };
};

const GradientPicker = ({ viewport }: GradientPickerProps) => {
  const gradient = useStore((state) => state.gradient);
  const gradients = useStore((state) => state.gradients);
  const background = useStore((state) => state.background);
  const exporting = useStore((state) => state.exporting);
  const setValue = useStore((state) => state.setValue);

  const bar = useRef<HTMLDivElement>(null);
  const gradientColors = useRef<HTMLDivElement>(null);

  const limit = { min: 2, max: 10 };

  const [position, setPosition] = useState<DOMRect | null>(null);
  const [displayPicker, setDisplayPicker] = useState(false);
  const [pickerColor, setPickerColor] = useState(gradient.colors[0]);

  const getBackground = useCallback(
    (cols = gradient.colors) =>
      `linear-gradient(to right, ${cols
        .map((c) => c)
        .sort((a, b) => a.stop - b.stop)
        .map((c) => `${c.hex} ${c.stop * 100}%`)
        .join(", ")})`,
    [gradient.colors]
  );

  useLayoutEffect(() => {
    if (gradientColors.current) {
      setPosition(gradientColors.current.getBoundingClientRect());
    }
  }, [gradientColors, viewport]);

  const setGradient = (gradient: Gradient) => {
    if (exporting) return;
    setValue("gradient", gradient);
  };

  const addGradient = (gradient: Gradient) => {
    if (exporting) return;
    setValue(
      "gradients",
      gradients.concat({ ...gradient, fixed: false, id: MathUtils.generateUUID() })
    );
  };

  const removeGradient = (gradient: Gradient) => {
    if (exporting) return;
    setValue(
      "gradients",
      gradients.filter((g) => g.id !== gradient.id)
    );
  };

  const createColor = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!(e.target && position) || exporting) return;

    if ((e.target as HTMLDivElement).dataset.target !== "create-color") return;

    if (gradient.colors.length >= limit.max) return;

    const stop = (e.clientX - position.x) / position.width;
    const newColor: GradientColor = {
      hex: "#ffffff",
      stop,
      id: MathUtils.generateUUID(),
    };
    const cols = gradient.colors.concat(newColor);
    cols.sort((a, b) => a.stop - b.stop);
    const i = cols.indexOf(newColor);
    const before = i === 0 ? i + 1 : i - 1;
    const after = i === cols.length - 1 ? i - 1 : i + 1;
    if (cols[after] === cols[before]) {
      newColor.hex = cols[before].hex;
    } else {
      if (!cols[before].hex || !cols[after].hex) return;
      const c0 = new Color(cols[before].hex);
      const c1 = new Color(cols[after].hex);
      const a = MathUtils.mapLinear(stop, cols[before].stop, cols[after].stop, 0, 1);
      const hex = new Color().lerpColors(c0, c1, a).getHexString();
      newColor.hex = `#${hex}`;
    }

    setValue("gradient", { ...gradient, colors: cols });
  };

  useEffect(() => {
    if (bar.current) {
      bar.current.style.background = getBackground();
    }
  }, [gradient.colors, getBackground]);

  useEffect(() => {
    if (background) {
      background.material.uniforms.uCount.value = gradient.colors.length;

      gradient.colors
        .map((c) => c)
        .sort((a, b) => a.stop - b.stop)
        .forEach((color, i) => {
          if (!color.hex) return;
          const c = new Color(color.hex).convertLinearToSRGB();

          background.material.uniforms[`uColor${i}`].value.set(c.r, c.g, c.b, color.stop);
        });
    }
  }, [gradient.colors, background]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col relative">
        <div className="w-full h-8 rounded-lg px-3 bg-slate-100 relative overflow-hidden">
          <div
            className="absolute w-1/2 left-0 top-0 h-full"
            style={{ background: gradient.colors[0].hex }}
          ></div>
          <div
            className="absolute w-1/2 right-0 top-0 h-full"
            style={{ background: gradient.colors[gradient.colors.length - 1].hex }}
          ></div>
          <div ref={bar} className="w-full h-8 relative z-2"></div>
        </div>
        <div className="flex h-6 w-full relative px-3">
          <div
            className={`flex h-6 w-full relative ${
              gradient.colors.length >= limit.max ? "" : "cursor-crosshair"
            }`}
            data-target="create-color"
            onClick={createColor}
            ref={gradientColors}
          >
            {position &&
              gradient.colors.map((color) => {
                const x = position ? color.stop * position.width : 0;

                return (
                  <DragColor
                    key={`${color.id}_${color.stop}`}
                    color={color}
                    setDisplayPicker={setDisplayPicker}
                    setPickerColor={setPickerColor}
                    position={position}
                    limit={limit}
                    gradient={gradient}
                    x={x}
                    disabled={exporting}
                  />
                );
              })}
          </div>
        </div>
        <div>
          {position && displayPicker && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDisplayPicker(false)} />
              <div className="absolute z-20">
                <ChromePicker
                  disableAlpha
                  color={pickerColor.hex}
                  onChange={(color) => {
                    const { hex } = color;
                    const colors = gradient.colors.map((c) => {
                      if (c.id === pickerColor.id) {
                        return { ...c, hex };
                      }

                      return c;
                    });
                    setValue("gradient", { ...gradient, colors });
                    setPickerColor({ ...pickerColor, hex });
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <label>Presets</label>
        <div className="flex gap-1 flex-wrap">
          {gradients.map((gradient) => (
            <div
              key={gradient.id}
              className="w-7 h-7 rounded-lg border border-slate-300 hover:border-slate-400 transition-colors p-0.5 cursor-pointer relative group flex items-center justify-center"
              onClick={() => setGradient(gradient)}
              onKeyDown={(e) => {
                if (e.code === "Enter") setGradient(gradient);
              }}
              tabIndex={exporting ? -1 : 0}
            >
              <div
                className="w-full h-full rounded-md"
                style={{ background: getBackground(gradient.colors) }}
              ></div>
              {!gradient.fixed && (
                <div
                  className="absolute -right-2 -top-2 w-5 h-5 p-0.5 bg-slate-100 hover:bg-slate-200 rounded-full hidden group-hover:block"
                  onClick={() => removeGradient(gradient)}
                >
                  <TrashIcon className="w-full h-full" />
                </div>
              )}
            </div>
          ))}
          <div
            className="w-7 h-7 bg-slate-100/0 border border-slate-300 hover:border-slate-400 p-1.5 transition-colors rounded-lg cursor-pointer flex items-center justify-center text-slate-500 hover:text-slate-700"
            onClick={() => addGradient(gradient)}
            onKeyDown={(e) => {
              if (e.code === "Enter") addGradient(gradient);
            }}
            tabIndex={exporting ? -1 : 0}
          >
            <PlusIcon className="w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradientPicker;
