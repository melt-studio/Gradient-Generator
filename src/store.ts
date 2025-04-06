import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  BackgroundMesh,
  ColorMode,
  ColorModeValue,
  ExportFormat,
  Gradient,
  Layout,
  Modal,
} from "./types";
import config from "./config.json";

export const customLayout: Layout = { width: 1920, height: 1080, label: "Custom" };

export const layouts: Layout[] = [
  { width: 1080, height: 1080, label: "Square" },
  { width: 1080, height: 1920, label: "Portrait" },
  { width: 1920, height: 1080, label: "Landscape" },
  { width: 3840, height: 2160, label: "4K" },
  { width: 2000, height: 2000, label: "2K" },
];

export const colorModes: ColorMode[] = [
  {
    label: "Pre-defined",
    value: ColorModeValue.Defined,
  },
  { label: "Custom Gradient", value: ColorModeValue.Custom },
];

export const exportFormats: ExportFormat[] = [
  { label: "Image", type: "image/png", ext: "png" },
  {
    label: "Frames",
    type: "image/png",
    ext: "png",
    sequence: true,
  },
  {
    label: "Video",
    type: "video/mp4",
    ext: "mp4",
  },
];

export type State = {
  canvas: HTMLCanvasElement | null;
  canvasContainer: HTMLDivElement | null;
  background: BackgroundMesh | null;
  ready: boolean;
  layout: Layout;
  customLayout: Layout;
  color: number;
  distortion: number;
  speed: number;
  drips: number;
  grain: number;
  noise: number;
  colorMode: ColorMode;
  gradient: Gradient;
  gradients: Gradient[];
  exporting: boolean;
  duration: number;
  exportCancelled: boolean;
  exportFormat: ExportFormat;
  ffmpegLoaded: boolean;
  modal: Modal | null;
};

type Actions = {
  setValue: <K extends keyof State>(key: K, value: State[K]) => void;
};

export const initialState = {
  canvas: null,
  canvasContainer: null,
  background: null,
  ready: false,
  layout: layouts[0],
  customLayout,
  distortion: config.distortion,
  color: config.color,
  speed: config.speed,
  drips: config.drips,
  grain: config.grain,
  noise: config.noise,
  colorMode: colorModes[0],
  gradient: config.gradient,
  gradients: config.gradients,
  exporting: false,
  duration: 4,
  exportCancelled: false,
  exportFormat: exportFormats[0],
  ffmpegLoaded: false,
  exporter: null,
  modal: null,
};

type Store = State & Actions;

export const useStore = create<Store>()(
  persist(
    immer((set) => ({
      ...initialState,
      setValue: (key, value): void => set(() => ({ [key]: value })),
    })),
    {
      name: "melt-gradient-generator",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) =>
            [
              "layout",
              "customLayout",
              "distortion",
              "color",
              "speed",
              "drips",
              "grain",
              "noise",
              "colorMode",
              "gradient",
              "gradients",
              "duration",
            ].includes(key)
          )
        ),
    }
  )
);
