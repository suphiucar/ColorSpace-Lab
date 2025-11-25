import { RGB, HSV, LAB, CMYK, YCBCR, HSI } from '../types';

// Helper: RGB to Hex
export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// RGB to HSV
export const rgbToHsv = (r: number, g: number, b: number): HSV => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
};

// RGB to HSL
export const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

// RGB to HSI
export const rgbToHsi = (r: number, g: number, b: number): HSI => {
  r /= 255; g /= 255; b /= 255;
  const sum = r + g + b;
  const i = sum / 3;
  let s = 0;
  let h = 0;

  if (sum > 0) {
    const min = Math.min(r, g, b);
    s = 1 - (3 * min / sum);
  }

  if (s > 0) {
    const num = 0.5 * ((r - g) + (r - b));
    const den = Math.sqrt((r - g) * (r - g) + (r - b) * (g - b));
    
    // Avoid division by zero
    if (den > 0.00001) {
       let theta = Math.acos(num / den);
       if (b > g) {
         theta = 2 * Math.PI - theta;
       }
       h = theta * 180 / Math.PI;
    }
  }

  return { 
    h: Math.round(h), 
    s: Math.round(s * 100), 
    i: Math.round(i * 100) 
  };
};


// RGB to CMYK
export const rgbToCmyk = (r: number, g: number, b: number): CMYK => {
  let c = 0, m = 0, y = 0, k = 0;
  if (r === 0 && g === 0 && b === 0) {
    k = 100;
  } else {
    c = 1 - (r / 255);
    m = 1 - (g / 255);
    y = 1 - (b / 255);
    const minCMY = Math.min(c, m, y);
    c = (c - minCMY) / (1 - minCMY);
    m = (m - minCMY) / (1 - minCMY);
    y = (y - minCMY) / (1 - minCMY);
    k = minCMY;
  }
  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100)
  };
};

// RGB to Lab (via XYZ) - Using D65 standard illuminant
export const rgbToLab = (r: number, g: number, b: number): LAB => {
  let r_l = r / 255;
  let g_l = g / 255;
  let b_l = b / 255;

  r_l = (r_l > 0.04045) ? Math.pow((r_l + 0.055) / 1.055, 2.4) : r_l / 12.92;
  g_l = (g_l > 0.04045) ? Math.pow((g_l + 0.055) / 1.055, 2.4) : g_l / 12.92;
  b_l = (b_l > 0.04045) ? Math.pow((b_l + 0.055) / 1.055, 2.4) : b_l / 12.92;

  let x = (r_l * 0.4124 + g_l * 0.3576 + b_l * 0.1805) * 100;
  let y = (r_l * 0.2126 + g_l * 0.7152 + b_l * 0.0722) * 100;
  let z = (r_l * 0.0193 + g_l * 0.1192 + b_l * 0.9505) * 100;

  // D65 Reference
  x /= 95.047;
  y /= 100.000;
  z /= 108.883;

  x = (x > 0.008856) ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
  y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
  z = (z > 0.008856) ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

  return {
    l: Math.round((116 * y) - 16),
    a: Math.round(500 * (x - y)),
    b: Math.round(200 * (y - z))
  };
};

// RGB to YCbCr (ITU-R BT.601)
export const rgbToYCbCr = (r: number, g: number, b: number): YCBCR => {
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return {
    y: Math.round(y),
    cb: Math.round(cb),
    cr: Math.round(cr)
  };
};