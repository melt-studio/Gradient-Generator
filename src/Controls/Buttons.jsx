export default function Buttons() {
  const saveImage = () => {
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

  const saveSequence = () => {
    console.log('sequence');
  };

  const buttons = [
    { name: 'Export Image (PNG)', onClick: saveImage },
    {
      name: 'Export Image Sequence (PNG)',
      onClick: saveSequence,
    },
  ];

  return (
    <div className="controls-buttons">
      {buttons.map((b) => (
        <button type="button" key={b.name} onClick={b.onClick}>
          {b.name}
        </button>
      ))}
    </div>
  );
}
