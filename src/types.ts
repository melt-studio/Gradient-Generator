import { RefObject } from "react";
import { Mesh, PlaneGeometry, ShaderMaterial } from "three";
import { State } from "./store";

export enum ColorModeValue {
  Defined = 0,
  Custom,
}

type Sizes = "Square" | "Portrait" | "Landscape" | "2K" | "4K" | "Custom";

export type Layout = {
  label: Sizes;
  width: number;
  height: number;
};

export type ColorMode = {
  label: string;
  value: ColorModeValue;
};

export type GradientColor = {
  hex: string;
  stop: number;
  id: string;
};

export type Gradient = {
  colors: GradientColor[];
  id: string;
  fixed?: boolean;
};

export type ExportFormat = {
  label: string;
  type: string;
  ext: string;
  sequence?: boolean;
};

export interface Modal {
  title: string;
  description: string;
  progress?: number;
  status?: string;
  closeLabel?: string;
  closeOnClick?: () => void;
}

export type BackgroundMesh = Mesh<PlaneGeometry, ShaderMaterial>;
export type BackgroundMeshRef = RefObject<BackgroundMesh | undefined>;
export type BackgroundUpdate = (
  key: keyof State,
  uniform: string,
  callback?: (value: number) => void
) => (value: number) => void;
