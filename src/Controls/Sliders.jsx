import { useState } from 'react';
import { MathUtils } from 'three';

function Slider({ s, sliders, setSliders, gradient }) {
  const i = `${s.step}`.indexOf('.');
  const n = i === -1 ? 0 : `${s.step}`.substring(i + 1, `${s.step}`.length).length;

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
            if (gradient && gradient.current) {
              gradient.current.material.uniforms[`u${s.name}`].value = e.target.value;
            }
            setSliders(
              sliders.map((slider) => {
                if (slider.id === s.id) {
                  return { ...slider, value: e.target.value };
                }

                return slider;
              }),
            );
          }}
        />
        <div className="slider-value">{Number(s.value).toFixed(n)}</div>
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

  return (
    <div className="controls-sliders">
      {sliders.map((s) => (
        <Slider key={s.id} s={s} sliders={sliders} setSliders={setSliders} gradient={gradient} />
      ))}
    </div>
  );
}
