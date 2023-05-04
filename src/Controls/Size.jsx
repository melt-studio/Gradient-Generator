import { useState, useEffect } from 'react';
import { MathUtils } from 'three';

export default function Size({ container, setViewport }) {
  const [sizes, setSizes] = useState({
    Square: { width: 1080, height: 1080, name: 'Square' },
    Portrait: { width: 1080, height: 1920, name: 'Portrait' },
    Landscape: { width: 1920, height: 1080, name: 'Landscape' },
    '4K': { width: 3840, height: 2160, name: '4K' },
    '2K': { width: 2000, height: 2000, name: '2K' },
    Custom: { width: 1080, height: 1080, name: 'Custom' },
  });

  const [activeSize, setActiveSize] = useState(sizes.Custom);

  // const [sizeWidth, setSizeWidth] = useState(activeSize.width);
  // const [sizeHeight, setSizeHeight] = useState(activeSize.height);

  // useEffect(() => {
  //   const newSizes = { ...sizes };
  //   newSizes.Custom.width = sizeWidth;
  //   if (activeSize.name !== "Custom") {
  //     newSizes.Custom.height = activeSize.height;
  //     setSizes(newSizes);
  //     setActiveSize(sizes.Custom);
  //   } else {
  //     setSizes(newSizes);
  //   }
  // }, [sizeWidth]);

  useEffect(() => {
    if (container.current) {
      container.current.style.width = `${MathUtils.clamp(activeSize.width, 100, 4000)}px`;
      container.current.style.height = `${MathUtils.clamp(activeSize.height, 100, 4000)}px`;
    }

    setViewport({ width: window.innerWidth, height: window.innerHeight });
  }, [activeSize, sizes, setViewport, container]);

  return (
    <div className="size">
      <div>Size</div>
      <div className="size-inputs">
        <div className="size-select">
          <select
            onChange={(e) => {
              setActiveSize(sizes[e.target.value]);
            }}
            value={activeSize.name}
          >
            {Object.keys(sizes).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="size-input">
          <span>W</span>
          <input
            type="text"
            value={activeSize.width}
            onChange={(e) => {
              const newSizes = { ...sizes };
              newSizes.Custom.width = Number(e.target.value);
              if (activeSize.name !== 'Custom') {
                newSizes.Custom.height = activeSize.height;
                setSizes(newSizes);
                setActiveSize(sizes.Custom);
              } else {
                setSizes(newSizes);
              }
            }}
            // value={sizeWidth}
            // onChange={(e) => {
            //   const v = Number(e.target.value);
            //   setSizeWidth(v);
            // }}
          />
        </div>
        <div className="size-input">
          <span>H</span>
          <input
            type="text"
            value={activeSize.height}
            onChange={(e) => {
              const newSizes = { ...sizes };
              newSizes.Custom.height = Number(e.target.value);
              if (activeSize.name !== 'Custom') {
                newSizes.Custom.width = activeSize.width;
                setSizes(newSizes);
                setActiveSize(sizes.Custom);
              } else {
                setSizes(newSizes);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
