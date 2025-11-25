import React, { useState, useEffect, useRef } from 'react';
import { ColorModel, RGB } from '../types';
import { 
  rgbToHex, rgbToHsv, rgbToHsl, rgbToHsi, rgbToCmyk, rgbToLab, rgbToYCbCr,
  hsvToRgb, hslToRgb, hsiToRgb, cmykToRgb, labToRgb, yCbCrToRgb
} from '../utils/colorMath';
import { RefreshCcw, Copy, Check } from 'lucide-react';

interface Props {
  model: ColorModel;
}

const ColorConverter: React.FC<Props> = ({ model }) => {
  // We keep RGB as the source of truth
  const [currentRgb, setCurrentRgb] = useState<RGB>({ r: 65, g: 105, b: 225 }); // Default Royal Blue
  const [inputs, setInputs] = useState<number[]>([65, 105, 225]);
  const [copied, setCopied] = useState<string | null>(null);

  // Sync inputs when model changes or rgb changes externally
  useEffect(() => {
    updateInputsFromRgb(currentRgb, model);
  }, [model]);

  // Copy feedback timeout
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const updateInputsFromRgb = (rgb: RGB, targetModel: ColorModel) => {
    let newInputs: number[] = [];
    switch (targetModel) {
      case ColorModel.RGB: newInputs = [rgb.r, rgb.g, rgb.b]; break;
      case ColorModel.HSV: { const v = rgbToHsv(rgb.r, rgb.g, rgb.b); newInputs = [v.h, v.s, v.v]; break; }
      case ColorModel.HSL: { const v = rgbToHsl(rgb.r, rgb.g, rgb.b); newInputs = [v.h, v.s, v.l]; break; }
      case ColorModel.HSI: { const v = rgbToHsi(rgb.r, rgb.g, rgb.b); newInputs = [v.h, v.s, v.i]; break; }
      case ColorModel.CMYK: { const v = rgbToCmyk(rgb.r, rgb.g, rgb.b); newInputs = [v.c, v.m, v.y, v.k]; break; }
      case ColorModel.LAB: { const v = rgbToLab(rgb.r, rgb.g, rgb.b); newInputs = [v.l, v.a, v.b]; break; }
      case ColorModel.YCBCR: { const v = rgbToYCbCr(rgb.r, rgb.g, rgb.b); newInputs = [v.y, v.cb, v.cr]; break; }
    }
    setInputs(newInputs);
  };

  const handleInputChange = (index: number, value: number) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);

    // Calculate new RGB
    let newRgb: RGB = { r: 0, g: 0, b: 0 };
    const [a, b, c, d] = newInputs;

    switch (model) {
      case ColorModel.RGB: newRgb = { r: a, g: b, b: c }; break;
      case ColorModel.HSV: newRgb = hsvToRgb(a, b, c); break;
      case ColorModel.HSL: newRgb = hslToRgb(a, b, c); break;
      case ColorModel.HSI: newRgb = hsiToRgb(a, b, c); break;
      case ColorModel.CMYK: newRgb = cmykToRgb(a, b, c, d); break;
      case ColorModel.LAB: newRgb = labToRgb(a, b, c); break;
      case ColorModel.YCBCR: newRgb = yCbCrToRgb(a, b, c); break;
    }
    setCurrentRgb(newRgb);
  };

  const getInputConfig = (m: ColorModel) => {
    switch (m) {
      case ColorModel.RGB: return [
        { label: 'Red', min: 0, max: 255, color: 'text-red-400' },
        { label: 'Green', min: 0, max: 255, color: 'text-green-400' },
        { label: 'Blue', min: 0, max: 255, color: 'text-blue-400' }
      ];
      case ColorModel.HSV: return [
        { label: 'Hue', min: 0, max: 360, color: 'text-purple-400' },
        { label: 'Saturation', min: 0, max: 100, color: 'text-pink-400' },
        { label: 'Value', min: 0, max: 100, color: 'text-slate-300' }
      ];
      case ColorModel.HSL: return [
        { label: 'Hue', min: 0, max: 360, color: 'text-purple-400' },
        { label: 'Saturation', min: 0, max: 100, color: 'text-pink-400' },
        { label: 'Lightness', min: 0, max: 100, color: 'text-slate-300' }
      ];
      case ColorModel.HSI: return [
        { label: 'Hue', min: 0, max: 360, color: 'text-purple-400' },
        { label: 'Saturation', min: 0, max: 100, color: 'text-pink-400' },
        { label: 'Intensity', min: 0, max: 100, color: 'text-slate-300' }
      ];
      case ColorModel.CMYK: return [
        { label: 'Cyan', min: 0, max: 100, color: 'text-cyan-400' },
        { label: 'Magenta', min: 0, max: 100, color: 'text-fuchsia-400' },
        { label: 'Yellow', min: 0, max: 100, color: 'text-yellow-400' },
        { label: 'Key (Black)', min: 0, max: 100, color: 'text-slate-400' }
      ];
      case ColorModel.LAB: return [
        { label: 'Lightness', min: 0, max: 100, color: 'text-slate-300' },
        { label: 'a (G-R)', min: -128, max: 127, color: 'text-red-400' },
        { label: 'b (B-Y)', min: -128, max: 127, color: 'text-yellow-400' }
      ];
      case ColorModel.YCBCR: return [
        { label: 'Y (Luma)', min: 0, max: 255, color: 'text-slate-300' },
        { label: 'Cb', min: 0, max: 255, color: 'text-blue-400' },
        { label: 'Cr', min: 0, max: 255, color: 'text-red-400' }
      ];
    }
    return [];
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
  };

  const renderResultCard = (m: ColorModel) => {
    let values: number[] = [];
    let labels: string[] = [];
    let textToCopy = "";

    switch (m) {
      case ColorModel.RGB:
        values = [currentRgb.r, currentRgb.g, currentRgb.b];
        labels = ['R', 'G', 'B'];
        textToCopy = `rgb(${values.join(', ')})`;
        break;
      case ColorModel.HSV: {
        const v = rgbToHsv(currentRgb.r, currentRgb.g, currentRgb.b);
        values = [v.h, v.s, v.v];
        labels = ['H', 'S', 'V'];
        textToCopy = `hsv(${v.h}, ${v.s}%, ${v.v}%)`;
        break;
      }
      case ColorModel.HSL: {
        const v = rgbToHsl(currentRgb.r, currentRgb.g, currentRgb.b);
        values = [v.h, v.s, v.l];
        labels = ['H', 'S', 'L'];
        textToCopy = `hsl(${v.h}, ${v.s}%, ${v.l}%)`;
        break;
      }
      case ColorModel.HSI: {
        const v = rgbToHsi(currentRgb.r, currentRgb.g, currentRgb.b);
        values = [v.h, v.s, v.i];
        labels = ['H', 'S', 'I'];
        textToCopy = `hsi(${v.h}, ${v.s}%, ${v.i}%)`;
        break;
      }
      case ColorModel.LAB: {
        const v = rgbToLab(currentRgb.r, currentRgb.g, currentRgb.b);
        values = [v.l, v.a, v.b];
        labels = ['L', 'a', 'b'];
        textToCopy = `Lab(${v.l}, ${v.a}, ${v.b})`;
        break;
      }
      case ColorModel.CMYK: {
        const v = rgbToCmyk(currentRgb.r, currentRgb.g, currentRgb.b);
        values = [v.c, v.m, v.y, v.k];
        labels = ['C', 'M', 'Y', 'K'];
        textToCopy = `cmyk(${v.c}%, ${v.m}%, ${v.y}%, ${v.k}%)`;
        break;
      }
      case ColorModel.YCBCR: {
        const v = rgbToYCbCr(currentRgb.r, currentRgb.g, currentRgb.b);
        values = [v.y, v.cb, v.cr];
        labels = ['Y', 'Cb', 'Cr'];
        textToCopy = `YCbCr(${v.y}, ${v.cb}, ${v.cr})`;
        break;
      }
    }

    const isSource = m === model;

    return (
      <div key={m} className={`bg-slate-800 rounded-lg p-3 border ${isSource ? 'border-indigo-500 ring-1 ring-indigo-500/50' : 'border-slate-700'}`}>
        <div className="flex justify-between items-center mb-2">
           <span className="text-xs font-bold uppercase text-slate-400">{m}</span>
           <button 
             onClick={() => copyToClipboard(textToCopy, m)}
             className="text-slate-500 hover:text-indigo-400 transition"
             title="Copy values"
           >
             {copied === m ? <Check size={14} className="text-green-500"/> : <Copy size={14} />}
           </button>
        </div>
        <div className="flex gap-2 text-sm font-mono text-slate-200">
           {values.map((val, i) => (
             <div key={i} className="flex-1 bg-slate-900/50 rounded px-2 py-1 text-center">
                <span className="text-[10px] text-slate-500 block">{labels[i]}</span>
                {val}
             </div>
           ))}
        </div>
      </div>
    );
  };

  const hexColor = rgbToHex(currentRgb.r, currentRgb.g, currentRgb.b);
  const config = getInputConfig(model);

  return (
    <div className="flex flex-col h-full gap-6">
       
       {/* Input Section */}
       <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row gap-8 items-center">
             
             {/* Preview Box */}
             <div className="flex-shrink-0 flex flex-col items-center gap-3">
                 <div 
                   className="w-32 h-32 rounded-2xl shadow-inner border-4 border-slate-800"
                   style={{ backgroundColor: hexColor }}
                 />
                 <div className="text-center">
                    <span className="font-mono text-slate-400 text-sm bg-slate-800 px-3 py-1 rounded-full uppercase">
                      {hexColor}
                    </span>
                 </div>
             </div>

             {/* Controls */}
             <div className="flex-1 w-full grid grid-cols-1 gap-5">
                <div className="flex items-center gap-2 mb-2">
                    <RefreshCcw className="text-indigo-400" size={20} />
                    <h3 className="text-lg font-medium text-white">Convert from <span className="text-indigo-400 font-bold">{model}</span></h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {config.map((field, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                       <div className="flex justify-between text-xs">
                          <label className={`${field.color} font-semibold`}>{field.label}</label>
                          <span className="font-mono text-slate-400">{inputs[idx]}</span>
                       </div>
                       <input 
                          type="range"
                          min={field.min}
                          max={field.max}
                          value={inputs[idx] || 0}
                          onChange={(e) => handleInputChange(idx, parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                       />
                    </div>
                  ))}
                </div>
             </div>
          </div>
       </div>

       {/* Results Grid */}
       <div className="flex-1 overflow-y-auto">
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Converted Results</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
             {Object.values(ColorModel).map(m => renderResultCard(m))}
          </div>
       </div>

    </div>
  );
};

export default ColorConverter;
