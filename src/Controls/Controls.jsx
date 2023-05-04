import { useEffect, useState } from 'react';
import Size from './Size';
import Gradient from './Gradient';
import Sliders from './Sliders';
import Buttons from './Buttons';
import './Controls.css';

export default function Controls({ config, gradient, container }) {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="controls">
      <Size container={container} setViewport={setViewport} />
      <hr />
      <Gradient gradient={gradient} viewport={viewport} />
      <hr />
      <Sliders gradient={gradient} config={config} />
      <hr />
      <Buttons />
    </div>
  );
}
