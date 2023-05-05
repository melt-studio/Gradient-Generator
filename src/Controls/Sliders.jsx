import { useEffect, useState } from 'react';
import { MathUtils } from 'three';

function Slider({ s, sliders, setSliders, gradient }) {
  const i = `${s.step}`.indexOf('.');
  const n = i === -1 ? 0 : `${s.step}`.substring(i + 1, `${s.step}`.length).length;

  const [sliderInputValue, setSliderInputValue] = useState(Number(s.value).toFixed(n));

  const updateUniform = (value, name) => {
    if (gradient && gradient.current) {
      gradient.current.material.uniforms[`u${name}`].value = value;
    }
  };

  useEffect(() => {
    setSliderInputValue(Number(s.value).toFixed(n));
  }, [s, n]);

  const updateLocalStorage = (value) => {
    const localConfig = window.localStorage.getItem('melt-gradient-config');
    if (localConfig) {
      const lConfig = JSON.parse(localConfig);
      if (lConfig[s.name.toLowerCase()] !== undefined) {
        lConfig[s.name.toLowerCase()] = value;
      }
      lConfig.id = MathUtils.generateUUID();
      window.localStorage.setItem('melt-gradient-config', JSON.stringify(lConfig));
    }
  };

  return (
    <div className="slider">
      <div>{s.label ? s.label : s.name}</div>
      <div className="slider-container">
        <input
          type="range"
          min={`${s.min}`}
          max={`${s.max}`}
          step={`${s.step}`}
          value={`${s.value}`}
          onChange={(e) => {
            const value = Number(Number(e.target.value).toFixed(n));
            updateUniform(value, s.name);
            updateLocalStorage(value);
            setSliders(
              sliders.map((slider) => {
                if (slider.id === s.id) {
                  return { ...slider, value };
                }

                return slider;
              }),
            );
            setSliderInputValue(Number(e.target.value).toFixed(n));
          }}
        />
        <input
          className="slider-value"
          type="text"
          value={sliderInputValue}
          onChange={(e) => {
            setSliderInputValue(e.target.value);
          }}
          onBlur={() => {
            let value = Number(sliderInputValue);
            if (value === s.value) return;
            if (Number.isNaN(value)) {
              value = s.value;
            } else if (value < s.min || value > s.max) {
              value = MathUtils.clamp(value, s.min, s.max);
            }

            setSliderInputValue(value.toFixed(n));
            value = Number(value.toFixed(n));

            updateUniform(value, s.name);
            updateLocalStorage(value);
            setSliders(
              sliders.map((slider) => {
                if (slider.id === s.id) {
                  return { ...slider, value };
                }
                return slider;
              }),
            );
          }}
        />
      </div>
    </div>
  );
}

export default function Sliders({ gradient, config }) {
  const [sliders, setSliders] = useState([
    {
      name: 'Distortion',
      min: 0,
      max: 1,
      step: 0.01,
      value: config.distortion,
      id: MathUtils.generateUUID(),
    },
    {
      name: 'Noise',
      min: 0,
      max: 1,
      step: 0.01,
      value: config.noise,
      id: MathUtils.generateUUID(),
    },
    {
      name: 'Duration',
      label: 'Duration (s)',
      min: 1,
      max: 15,
      step: 1,
      value: config.duration,
      id: MathUtils.generateUUID(),
    },
  ]);

  // useEffect(() => {
  //   console.log('CONFIG', config);
  // }, [config]);

  useEffect(() => {
    setSliders(
      (sliders_) =>
        // eslint-disable-next-line implicit-arrow-linebreak
        sliders_.map((s) => {
          const key = s.name.toLowerCase();
          if (config[key] !== undefined) {
            return { ...s, value: config[key] };
          }
          return s;
        }),
      // eslint-disable-next-line function-paren-newline
    );
  }, [config, setSliders]);

  return (
    <div className="controls-sliders">
      {sliders.map((s) => (
        <Slider
          key={`${s.id}_${config.id}`}
          s={s}
          sliders={sliders}
          setSliders={setSliders}
          gradient={gradient}
        />
      ))}
    </div>
  );
}
