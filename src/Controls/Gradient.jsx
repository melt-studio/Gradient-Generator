/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import { useState, useEffect, useRef, useCallback } from 'react';
import { MathUtils, Color } from 'three';
import Draggable from 'react-draggable';

export default function Gradient({ gradient, viewport, config }) {
  const width = 300;
  const height = 40;
  const limit = { min: 2, max: 10 };
  const deleteDragDist = 20;

  const [position, setPosition] = useState(null);

  // const [colors, setColors] = useState([
  //   { hex: '#bcfc45', stop: 0, id: MathUtils.generateUUID() },
  //   { hex: '#ffffff', stop: 1, id: MathUtils.generateUUID() },
  // ]);

  const [colors, setColors] = useState(
    config.gradient.map((c) => ({
      ...c,
      id: MathUtils.generateUUID(),
    })),
  );

  const [presets, setPresets] = useState([
    { id: MathUtils.generateUUID(), colors: colors.map((c) => ({ ...c })) },
  ]);

  const [pickerColor, setPickerColor] = useState(colors[0]);

  const bar = useRef();
  const picker = useRef();
  const pickerColors = useRef();

  useEffect(() => {
    // console.log('useeffect', config.gradient);
    setColors(
      config.gradient.map((c) => ({
        ...c,
        id: MathUtils.generateUUID(),
      })),
    );
  }, [config]);

  const getBackground = useCallback(
    (cols = colors) =>
      // eslint-disable-next-line implicit-arrow-linebreak
      `linear-gradient(to right, ${cols
        .map((c) => c)
        .sort((a, b) => a.stop - b.stop)
        .map((c) => `${c.hex} ${c.stop * 100}%`)
        .join(', ')})`,
    [colors],
  );

  useEffect(() => {
    if (bar.current) {
      setPosition(bar.current.getBoundingClientRect());
    }
  }, [viewport]);

  // useEffect(() => {
  //   console.log(presets);
  // }, [presets]);

  useEffect(() => {
    // console.log(colors);
    // console.log(getBackground());
    if (bar.current) {
      bar.current.style.background = getBackground();
    }
  }, [colors, getBackground]);

  useEffect(() => {
    if (gradient.current) {
      gradient.current.material.uniforms.uCount.value = colors.length;

      colors
        .map((c) => c)
        .sort((a, b) => a.stop - b.stop)
        .forEach((color, i) => {
          const c = new Color(color.hex);

          gradient.current.material.uniforms[`uColor${i}`].value.set(c.r, c.g, c.b, color.stop);
        });
    }
  }, [colors, gradient]);

  const updateLocalStorage = (values) => {
    // console.log(values);
    const localConfig = window.localStorage.getItem('melt-gradient-config');
    if (localConfig) {
      const lConfig = JSON.parse(localConfig);
      if (lConfig.gradient !== undefined) {
        lConfig.gradient = values.map((c) => ({ ...c }));
      }
      lConfig.id = MathUtils.generateUUID();
      window.localStorage.setItem('melt-gradient-config', JSON.stringify(lConfig));
    }
  };

  const createColor = (e) => {
    if (e.target.classList.contains('gradient-colors')) {
      if (colors.length >= limit.max) return;

      const stop = (e.clientX - position.x) / width;
      const newColor = {
        hex: null,
        stop,
        id: MathUtils.generateUUID(),
      };
      const cols = colors.concat(newColor);
      cols.sort((a, b) => a.stop - b.stop);
      const i = cols.indexOf(newColor);
      const before = i === 0 ? i + 1 : i - 1;
      const after = i === cols.length - 1 ? i - 1 : i + 1;
      if (cols[after] === cols[before]) {
        newColor.hex = cols[before].hex;
      } else {
        const c0 = new Color(cols[before].hex);
        const c1 = new Color(cols[after].hex);
        const a = MathUtils.mapLinear(stop, cols[before].stop, cols[after].stop, 0, 1);
        const hex = new Color().lerpColors(c0, c1, a).getHexString();
        newColor.hex = `#${hex}`;
      }

      // console.log(newColor);
      setColors(colors.concat(newColor));
      updateLocalStorage(colors.concat(newColor));
    }
  };

  return (
    <div className="gradient-picker">
      <div>Gradient</div>
      <div className="gradient-bar-container">
        <div
          className="gradient-bar"
          style={{ background: getBackground(), width, height }}
          ref={bar}
        />
        <div className="gradient-colors" onClick={createColor} ref={pickerColors}>
          {colors.map((c, i) => {
            const order = colors
              .map((col) => col)
              .sort((a, b) => a.stop - b.stop)
              .indexOf(c);

            const posX = c.stop * width;

            return (
              <Draggable
                key={`${c.id}_${posX.toFixed(5)}`}
                axis="x"
                bounds="parent"
                defaultPosition={{ x: posX, y: 0 }}
                onStop={(e) => {
                  // e.target.classList.remove("dragging");
                  const cols = [...colors];
                  // const dragY = Math.abs(
                  //   e.clientY - height - position.top - 18
                  // );
                  const dragY = e.clientY - height - position.top - 18;

                  if (dragY > deleteDragDist && cols.length > limit.min) {
                    cols.splice(i, 1);
                  } else {
                    const stop = MathUtils.clamp(e.x - position.x, 0, width) / width;
                    cols[i].stop = stop;
                  }
                  setColors(cols);
                  updateLocalStorage(cols);
                }}
                // onDrag={(e) => {
                //   if (!e.target.classList.contains("dragging")) {
                //     e.target.classList.add("dragging");
                //   }
                // }}
              >
                <div
                  style={{
                    zIndex: order,
                    // transform: `translate(${posX}px, 0, 0)`,
                  }}
                  className="gradient-color"
                  onDoubleClick={() => {
                    // e.target.classList.add("active");
                    if (picker.current) {
                      picker.current.value = c.hex;
                      setPickerColor(c);
                      // picker.current.parentNode.classList.remove("hide");
                      picker.current.click();
                    }
                  }}
                >
                  <span
                    style={{
                      background: c.hex,
                    }}
                  />
                </div>
              </Draggable>
            );
          })}
        </div>

        <div className="color-picker">
          <input
            ref={picker}
            type="color"
            value={pickerColor.hex}
            // onInput={(e) => {
            //   setPickerColor({ ...pickerColor, hex: e.target.value });
            // }}
            onChange={(e) => {
              const cols = colors.map((c) => {
                if (c.id === pickerColor.id) {
                  return { ...c, hex: e.target.value };
                }

                return c;
              });
              setColors(cols);
              updateLocalStorage(cols);
              setPickerColor({ ...pickerColor, hex: e.target.value });
              // if (pickerColors.current) {
              //   pickerColors.current.childNodes.forEach((c) =>
              //     c.firstChild.classList.remove("active")
              //   );
              // }
              // picker.current.parentNode.classList.add("hide");
            }}
          />
        </div>
      </div>
      <hr />
      <div className="gradient-presets">
        {presets.map((p) => (
          <div key={p.id} className="gradient-preset">
            <div
              className="gradient-preset-color"
              style={{ background: getBackground(p.colors) }}
              onClick={() => {
                // Only update color if not clicking on remove
                // if (!e.target.classList.contains("gradient-preset-remove")) {
                // console.log("preset click");
                const cols = p.colors.map((c) => ({ ...c }));
                setColors(cols);
                updateLocalStorage(cols);
                // }
              }}
            />

            <div
              className="gradient-preset-remove"
              onClick={() => {
                // console.log("remove click");
                setPresets(presets.filter((preset) => preset.id !== p.id));
              }}
            />
          </div>
        ))}
        <div
          className="gradient-preset add"
          onClick={() => {
            // console.log(presets.find((p) => p === colors));
            // if (!presets.find((p) => p.colors === colors)) {
            setPresets(
              presets.concat({
                id: MathUtils.generateUUID(),
                colors: colors.map((c) => ({ ...c })),
              }),
            );
            // }
          }}
        >
          <span />
        </div>
      </div>
    </div>
  );
}
