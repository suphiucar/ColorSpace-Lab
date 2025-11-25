import { RGB, HSV, LAB, CMYK, YCBCR, HSI } from '../types';

// Helper: RGB to Hex
export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// --- RGB to Model ---

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

// --- Model to RGB (Inverse) ---

const clamp = (val: number) => Math.round(Math.max(0, Math.min(255, val)));

export const hsvToRgb = (h: number, s: number, v: number): RGB => {
  h /= 360; s /= 100; v /= 100;
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return { r: clamp(r * 255), g: clamp(g * 255), b: clamp(b * 255) };
};

export const hslToRgb = (h: number, s: number, l: number): RGB => {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: clamp(r * 255), g: clamp(g * 255), b: clamp(b * 255) };
};

export const hsiToRgb = (h: number, s: number, i: number): RGB => {
  h = h % 360; 
  if (h < 0) h += 360;
  s /= 100;
  i /= 100;

  const hRad = h * (Math.PI / 180);
  let r = 0, g = 0, b = 0;

  if (h < 120) {
    b = i * (1 - s);
    r = i * (1 + (s * Math.cos(hRad)) / Math.cos((60 * Math.PI / 180) - hRad));
    g = 3 * i - (r + b);
  } else if (h < 240) {
    const hShift = hRad - (120 * Math.PI / 180);
    r = i * (1 - s);
    g = i * (1 + (s * Math.cos(hShift)) / Math.cos((60 * Math.PI / 180) - hShift));
    b = 3 * i - (r + g);
  } else {
    const hShift = hRad - (240 * Math.PI / 180);
    g = i * (1 - s);
    b = i * (1 + (s * Math.cos(hShift)) / Math.cos((60 * Math.PI / 180) - hShift));
    r = 3 * i - (g + b);
  }
  return { r: clamp(r * 255), g: clamp(g * 255), b: clamp(b * 255) };
};

export const cmykToRgb = (c: number, m: number, y: number, k: number): RGB => {
  c /= 100; m /= 100; y /= 100; k /= 100;
  const r = 255 * (1 - c) * (1 - k);
  const g = 255 * (1 - m) * (1 - k);
  const b = 255 * (1 - y) * (1 - k);
  return { r: clamp(r), g: clamp(g), b: clamp(b) };
};

export const labToRgb = (l: number, a: number, b: number): RGB => {
  let y = (l + 16) / 116;
  let x = a / 500 + y;
  let z = y - b / 200;

  const pow3 = (v: number) => (Math.pow(v, 3) > 0.008856 ? Math.pow(v, 3) : (v - 16 / 116) / 7.787);
  x = pow3(x) * 95.047;
  y = pow3(y) * 100.000;
  z = pow3(z) * 108.883;

  x /= 100; y /= 100; z /= 100;

  let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
  let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
  let bl = x * 0.0557 + y * -0.2040 + z * 1.0570;

  const gamma = (v: number) => (v > 0.0031308 ? 1.055 * Math.pow(v, 1 / 2.4) - 0.055 : 12.92 * v);
  return { r: clamp(gamma(r) * 255), g: clamp(gamma(g) * 255), b: clamp(gamma(bl) * 255) };
};

export const yCbCrToRgb = (y: number, cb: number, cr: number): RGB => {
  // ITU-R BT.601 conversion (Standard definition TV)
  const r = y + 1.402 * (cr - 128);
  const g = y - 0.344136 * (cb - 128) - 0.714136 * (cr - 128);
  const b = y + 1.772 * (cb - 128);
  return { r: clamp(r), g: clamp(g), b: clamp(b) };
};
