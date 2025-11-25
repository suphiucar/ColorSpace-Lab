import React, { useState, useRef, useEffect } from 'react';
import { ColorModel } from '../types';
import { rgbToHsv, rgbToLab, rgbToCmyk, rgbToYCbCr, rgbToHsi, rgbToHsl } from '../utils/colorMath';
import { Upload, Eye, EyeOff } from 'lucide-react';
import { explainSeparation } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface Props {
  model: ColorModel;
}

const ChannelSplitter: React.FC<Props> = ({ model }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [loadingExpl, setLoadingExpl] = useState(false);
  
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const ch1Ref = useRef<HTMLCanvasElement>(null);
  const ch2Ref = useRef<HTMLCanvasElement>(null);
  const ch3Ref = useRef<HTMLCanvasElement>(null);
  const ch4Ref = useRef<HTMLCanvasElement>(null); // For CMYK/Key

  const getChannelNames = () => {
    switch (model) {
      case ColorModel.RGB: return ['Red', 'Green', 'Blue'];
      case ColorModel.HSV: return ['Hue', 'Saturation', 'Value'];
      case ColorModel.HSL: return ['Hue', 'Saturation', 'Lightness'];
      case ColorModel.HSI: return ['Hue', 'Saturation', 'Intensity'];
      case ColorModel.LAB: return ['Lightness (L)', 'Green-Red (a)', 'Blue-Yellow (b)'];
      case ColorModel.CMYK: return ['Cyan', 'Magenta', 'Yellow', 'Key (Black)'];
      case ColorModel.YCBCR: return ['Luma (Y)', 'Blue-Diff (Cb)', 'Red-Diff (Cr)'];
      default: return [];
    }
  };

  const channelNames = getChannelNames();

  useEffect(() => {
    setLoadingExpl(true);
    explainSeparation(model).then(text => {
        setExplanation(text);
        setLoadingExpl(false);
    });
  }, [model]);

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const processCanvas = (ref: React.RefObject<HTMLCanvasElement>, processor: (r:number, g:number, b:number) => number) => {
        const cvs = ref.current;
        if (!cvs) return;
        cvs.width = img.width;
        cvs.height = img.height;
        const ctx = cvs.getContext('2d');
        if (!ctx) return;
        
        // Draw original temporarily to get data
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, cvs.width, cvs.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          const val = processor(r, g, b);
          // Standard Computer Vision visualization: Show channel intensity as grayscale
          data[i] = val;     // R
          data[i + 1] = val; // G
          data[i + 2] = val; // B
          // Alpha remains 255 (data[i+3])
        }
        ctx.putImageData(imageData, 0, 0);
      };

      // Helper for normalization
      const norm = (val: number, max: number) => Math.floor((val / max) * 255);

      if (model === ColorModel.RGB) {
        processCanvas(ch1Ref, (r, g, b) => r);
        processCanvas(ch2Ref, (r, g, b) => g);
        processCanvas(ch3Ref, (r, g, b) => b);
      } else if (model === ColorModel.HSV) {
        processCanvas(ch1Ref, (r, g, b) => norm(rgbToHsv(r, g, b).h, 360));
        processCanvas(ch2Ref, (r, g, b) => norm(rgbToHsv(r, g, b).s, 100));
        processCanvas(ch3Ref, (r, g, b) => norm(rgbToHsv(r, g, b).v, 100));
      } else if (model === ColorModel.HSL) {
        processCanvas(ch1Ref, (r, g, b) => norm(rgbToHsl(r, g, b).h, 360));
        processCanvas(ch2Ref, (r, g, b) => norm(rgbToHsl(r, g, b).s, 100));
        processCanvas(ch3Ref, (r, g, b) => norm(rgbToHsl(r, g, b).l, 100));
      } else if (model === ColorModel.HSI) {
        processCanvas(ch1Ref, (r, g, b) => norm(rgbToHsi(r, g, b).h, 360));
        processCanvas(ch2Ref, (r, g, b) => norm(rgbToHsi(r, g, b).s, 100));
        processCanvas(ch3Ref, (r, g, b) => norm(rgbToHsi(r, g, b).i, 100));
      } else if (model === ColorModel.LAB) {
        processCanvas(ch1Ref, (r, g, b) => norm(rgbToLab(r, g, b).l, 100));
        // a and b are -128 to 127. Normalize to 0-255 for visualization
        processCanvas(ch2Ref, (r, g, b) => rgbToLab(r, g, b).a + 128); 
        processCanvas(ch3Ref, (r, g, b) => rgbToLab(r, g, b).b + 128);
      } else if (model === ColorModel.CMYK) {
         processCanvas(ch1Ref, (r, g, b) => norm(rgbToCmyk(r, g, b).c, 100));
         processCanvas(ch2Ref, (r, g, b) => norm(rgbToCmyk(r, g, b).m, 100));
         processCanvas(ch3Ref, (r, g, b) => norm(rgbToCmyk(r, g, b).y, 100));
         if(ch4Ref.current) processCanvas(ch4Ref, (r, g, b) => norm(rgbToCmyk(r, g, b).k, 100));
      } else if (model === ColorModel.YCBCR) {
        processCanvas(ch1Ref, (r, g, b) => rgbToYCbCr(r, g, b).y);
        processCanvas(ch2Ref, (r, g, b) => rgbToYCbCr(r, g, b).cb);
        processCanvas(ch3Ref, (r, g, b) => rgbToYCbCr(r, g, b).cr);
      }
    };
  }, [imageSrc, model]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImageSrc(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col space-y-4 h-full">
      <div className="bg-slate-800 p-4 rounded-lg flex items-center justify-between border border-slate-700">
        <div>
          <h3 className="font-semibold text-lg">Image Channel Analysis</h3>
          <p className="text-sm text-slate-400">Upload an image to separate it into {model} components.</p>
        </div>
        <label className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded cursor-pointer transition">
          <Upload size={18} />
          <span>Select Image</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
      </div>

      <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
         <h4 className="text-sm font-semibold text-indigo-300 mb-2 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
             AI Insight: {model} Channels
         </h4>
         <div className="text-sm text-slate-300 prose prose-invert max-w-none">
             {loadingExpl ? "Analyzing channel utility..." : <ReactMarkdown>{explanation}</ReactMarkdown>}
         </div>
      </div>

      {!imageSrc ? (
        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-700 rounded-lg bg-slate-900/30">
          <p className="text-slate-500">No image loaded</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto pb-10">
          <div className="col-span-1 space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider bg-slate-800 px-2 py-1 rounded">Original</span>
            <img src={imageSrc} className="w-full rounded border border-slate-700" alt="Original" />
          </div>
          <div className="col-span-1 space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider bg-slate-800 px-2 py-1 rounded">{channelNames[0]}</span>
            <canvas ref={ch1Ref} className="w-full rounded border border-slate-700" />
          </div>
          <div className="col-span-1 space-y-2">
             <span className="text-xs font-mono uppercase tracking-wider bg-slate-800 px-2 py-1 rounded">{channelNames[1]}</span>
            <canvas ref={ch2Ref} className="w-full rounded border border-slate-700" />
          </div>
          <div className="col-span-1 space-y-2">
             <span className="text-xs font-mono uppercase tracking-wider bg-slate-800 px-2 py-1 rounded">{channelNames[2]}</span>
            <canvas ref={ch3Ref} className="w-full rounded border border-slate-700" />
          </div>
          {model === ColorModel.CMYK && (
             <div className="col-span-1 space-y-2">
             <span className="text-xs font-mono uppercase tracking-wider bg-slate-800 px-2 py-1 rounded">{channelNames[3]}</span>
            <canvas ref={ch4Ref} className="w-full rounded border border-slate-700" />
          </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChannelSplitter;