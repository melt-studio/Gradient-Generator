// import { useState } from 'react';

export default function Buttons({ recording, setRecording, paused, setPaused, exportSeqBtn }) {
  const exportImage = () => {
    const canvas = document.getElementById('canvas');
    const imgData = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = imgData;
    const timestamp = new Date(Date.now()).toISOString();
    a.setAttribute('download', `melt_gradient_${timestamp}.png`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exportSequence = () => {
    if (recording) {
      exportSeqBtn.current.style.removeProperty('background');
    }

    setRecording(!recording);
  };

  const pause = () => {
    setPaused(!paused);
  };

  const buttons = [
    {
      name: 'pause',
      text: 'Pause',
      onClick: pause,
    },
    { name: 'image', text: 'Export Image (PNG)', onClick: exportImage, ref: null },
    {
      name: 'sequence',
      text: 'Export Image Sequence (PNG)',
      onClick: exportSequence,
      ref: exportSeqBtn,
    },
  ];

  const getText = (b) => {
    if (b.name === 'sequence') {
      if (recording) return 'Recording... (click to cancel)';
      return b.text;
    }

    if (b.name === 'pause') {
      if (paused) return 'Play';
      return b.text;
    }

    return b.text;
  };

  return (
    <div className="controls-buttons">
      {buttons.map((b) => (
        <button ref={b.ref} type="button" key={b.name} onClick={b.onClick}>
          {getText(b)}
        </button>
      ))}
    </div>
  );
}
