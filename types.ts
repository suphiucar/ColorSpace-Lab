export enum ColorModel {
  RGB = 'RGB',
  CMYK = 'CMYK',
  HSV = 'HSV',
  HSL = 'HSL',
  HSI = 'HSI',
  LAB = 'Lab',
  YCBCR = 'YCbCr'
}

export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface HSV {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
}

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface HSI {
  h: number; // 0-360
  s: number; // 0-100
  i: number; // 0-100
}

export interface LAB {
  l: number; // 0-100
  a: number; // -128 to 127
  b: number; // -128 to 127
}

export interface CMYK {
  c: number; // 0-100
  m: number; // 0-100
  y: number; // 0-100
  k: number; // 0-100
}

export interface YCBCR {
  y: number; // 0-255
  cb: number; // 0-255
  cr: number; // 0-255
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
  color: string;
}

export interface GeminiExplanation {
  title: string;
  explanation: string;
  keyTakeaways: string[];
}