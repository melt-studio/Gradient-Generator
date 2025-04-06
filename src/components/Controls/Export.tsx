import useExport from "../../helpers/useExport";
import { exportFormats, useStore } from "../../store";
import { ExportFormat } from "../../types";
import Button from "../Button";
import Slider from "../Slider";
import Toggle from "../Toggle";
import ControlGroup from "./ControlGroup";

const Export = () => {
  const exportFormat = useStore((state) => state.exportFormat);
  const exporting = useStore((state) => state.exporting);
  const ffmpegLoaded = useStore((state) => state.ffmpegLoaded);
  const duration = useStore((state) => state.duration);
  const setValue = useStore((state) => state.setValue);

  const { download } = useExport();

  const handleExport = async () => {
    download();
  };

  const toggleExport = {
    options: exportFormats,
    value: exportFormat,
    onChange: (value: ExportFormat) => setValue("exportFormat", value),
    disabled: exporting,
  };

  const sliderDuration = {
    label: "Duration (s)",
    value: duration,
    onChange: (value: number) => setValue("duration", value),
    min: 1,
    max: 8,
    step: 1,
    disabled: exporting,
  };

  return (
    <ControlGroup label="Export">
      {ffmpegLoaded ? (
        <>
          <Toggle {...toggleExport} />
          {["Video", "Frames"].includes(exportFormat.label) && <Slider {...sliderDuration} />}
          <Button
            label={`Export ${exportFormat.ext.toUpperCase()}${
              exportFormat.sequence ? " Sequence" : ""
            }`}
            onClick={handleExport}
            disabled={exporting}
          />
        </>
      ) : (
        <div className="text-slate-400">Loading FFMPEG...</div>
      )}
    </ControlGroup>
  );
};

export default Export;
