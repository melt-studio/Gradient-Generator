import { useState, useEffect } from 'react';
import { MathUtils } from 'three';

export default function Size({ container, setViewport, config }) {
  const [sizes, setSizes] = useState({
    Square: { width: 1080, height: 1080, name: 'Square' },
    Portrait: { width: 1080, height: 1920, name: 'Portrait' },
    Landscape: { width: 1920, height: 1080, name: 'Landscape' },
    '4K': { width: 3840, height: 2160, name: '4K' },
    '2K': { width: 2000, height: 2000, name: '2K' },
    Custom: { width: config.sizeCustom.width, height: config.sizeCustom.height, name: 'Custom' },
  });

  const [activeSize, setActiveSize] = useState(config.size);
  const [sizeWidth, setSizeWidth] = useState(activeSize.width);
  const [sizeHeight, setSizeHeight] = useState(activeSize.height);

  const min = 100;
  const max = 4000;

  useEffect(() => {
    // console.log('config', config);

    setActiveSize(config.size);

    const { width, height } = config.sizeCustom;
    setSizes((sizes_) => ({ ...sizes_, Custom: { ...sizes_.Custom, width, height } }));

    if (config.size.name === 'Custom') {
      setSizeWidth(width);
      setSizeHeight(height);
    } else {
      setSizeWidth(config.size.width);
      setSizeHeight(config.size.height);
    }
  }, [config]);

  useEffect(() => {
    if (container.current) {
      container.current.style.width = `${MathUtils.clamp(activeSize.width, 100, 4000)}px`;
      container.current.style.height = `${MathUtils.clamp(activeSize.height, 100, 4000)}px`;
    }

    setViewport({ width: window.innerWidth, height: window.innerHeight });
  }, [activeSize.width, activeSize.height, setViewport, container]);

  const updateLocalStorage = (active) => {
    const localConfig = window.localStorage.getItem('melt-gradient-config');
    if (localConfig) {
      const lConfig = JSON.parse(localConfig);
      if (lConfig.size !== undefined) {
        lConfig.size = active;
      }
      if (lConfig.sizeCustom !== undefined && active.name === 'Custom') {
        lConfig.sizeCustom.width = active.width;
        lConfig.sizeCustom.height = active.height;
      }
      lConfig.id = MathUtils.generateUUID();
      window.localStorage.setItem('melt-gradient-config', JSON.stringify(lConfig));
    }
  };

  return (
    <div className="controls-size">
      <div>Size</div>
      <div className="size-inputs">
        <div className="size-select">
          <select
            value={activeSize.name}
            onChange={(e) => {
              const { value } = e.target;
              const size = sizes[value];
              setActiveSize(size);
              setSizeWidth(size.width);
              setSizeHeight(size.height);
              updateLocalStorage(size);
            }}
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
            value={sizeWidth}
            onChange={(e) => {
              setSizeWidth(e.target.value);
            }}
            onBlur={(e) => {
              let value = Number(e.target.value);
              if (value === activeSize.width) {
                // console.log('same width');
                return;
              }
              if (Number.isNaN(value)) {
                value = sizes.Custom.width;
              } else if (value < min || value > max) {
                value = MathUtils.clamp(value, min, max);
              }
              value = Math.trunc(value);
              setSizeWidth(value);

              const newSizes = { ...sizes };
              newSizes.Custom.width = value;
              newSizes.Custom.height = activeSize.height;
              setSizes(newSizes);
              setActiveSize(newSizes.Custom);
              updateLocalStorage(newSizes.Custom);
            }}
          />
        </div>
        <div className="size-input">
          <span>H</span>
          <input
            type="text"
            value={sizeHeight}
            onChange={(e) => {
              setSizeHeight(e.target.value);
            }}
            onBlur={(e) => {
              let value = Number(e.target.value);
              if (value === activeSize.height) {
                // console.log('same height');
                return;
              }
              if (Number.isNaN(value)) {
                value = sizes.Custom.height;
              } else if (value < min || value > max) {
                value = MathUtils.clamp(value, min, max);
              }
              value = Math.trunc(value);
              setSizeHeight(value);

              const newSizes = { ...sizes };
              newSizes.Custom.height = value;
              newSizes.Custom.width = activeSize.width;
              setSizes(newSizes);
              setActiveSize(newSizes.Custom);
              updateLocalStorage(newSizes.Custom);
            }}
          />
        </div>
      </div>
    </div>
  );
}
