// import { useState } from 'react';

export default function Buttons({ recording, setRecording, exportSeqBtn }) {
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

  const buttons = [
    { name: 'image', text: 'Export Image (PNG)', onClick: exportImage, ref: null },
    {
      name: 'sequence',
      text: 'Export Image Sequence (PNG)',
      onClick: exportSequence,
      ref: exportSeqBtn,
    },
  ];

  return (
    <div className="controls-buttons">
      {buttons.map((b) => (
        <button ref={b.ref} type="button" key={b.name} onClick={b.onClick}>
          {b.name === 'sequence' && recording ? 'Recording... (click to cancel)' : b.text}
        </button>
      ))}
    </div>
  );
}
