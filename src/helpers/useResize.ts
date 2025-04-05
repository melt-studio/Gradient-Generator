import { useEffect } from "react";
import { clamp } from "three/src/math/MathUtils.js";
import { useStore } from "../store";
import { Layout } from "../types";

export const sizeLimit = {
  min: 320,
  max: 1000,
};

export const scaleCanvas = (layout: Layout, exporting = false, exportFormat = "image") => {
  const pad = 80;
  const panelWidth = 400;

  const canvas = useStore.getState().canvas;
  const canvasContainer = useStore.getState().canvasContainer;

  let availableWidth = window.innerWidth - panelWidth - pad;
  let availableHeight = window.innerHeight - pad;

  availableWidth = clamp(availableWidth, sizeLimit.min, sizeLimit.max);
  availableHeight = clamp(availableHeight, sizeLimit.min, sizeLimit.max);

  let { width, height } = layout;

  if (exporting) {
    // Halve export size if pixel ratio is 2 to standardize output resolution
    if (window.devicePixelRatio > 1) {
      width /= window.devicePixelRatio;
      height /= window.devicePixelRatio;
    }

    // Get even sizes if exporting video/mp4 (h264 must have width/height divisible by 2)
    if (exportFormat === "video") {
      if (width % 2 === 1) {
        width = width + 1;
      }
      if (height % 2 === 1) {
        height = height + 1;
      }
    }
  }

  const scaleX = Math.min(1, availableWidth / width);
  const scaleY = Math.min(1, availableHeight / (height * scaleX));

  const scale = clamp(scaleX * scaleY, 0, 1);

  if (canvasContainer) {
    if (exporting) {
      canvasContainer.style.width = `${width}px`;
      canvasContainer.style.height = `${height}px`;
    } else {
      canvasContainer.style.width = `${width * scale}px`;
      canvasContainer.style.height = `${height * scale}px`;
    }
  }

  if (canvas) {
    if (exporting) {
      console.log("Export: setting canvas size to", width, height);
      // For export use full width and height scale canvas with transform
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.style.transform = `scale(${scale}, ${scale})`;
    } else {
      // Remove any transform from canvas (width and height taken from canvas container)
      canvas.style.removeProperty("transform");
    }
  }
};

const useResize = () => {
  const canvas = useStore((state) => state.canvas);
  const canvasContainer = useStore((state) => state.canvasContainer);
  const layout = useStore((state) => state.layout);

  useEffect(() => {
    const handleResize = () => {
      const exporting = useStore.getState().exporting;

      if (!canvasContainer || !canvas || exporting) return;

      scaleCanvas(layout);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [canvas, canvasContainer, layout]);
};

export default useResize;
