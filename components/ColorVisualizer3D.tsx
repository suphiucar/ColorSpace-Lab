import React, { useRef, useEffect, useState } from 'react';
import { ColorModel, Point3D } from '../types';
import { rgbToHsv, rgbToLab, rgbToHsl, rgbToHex, rgbToYCbCr, rgbToHsi } from '../utils/colorMath';

interface Props {
  model: ColorModel;
}

const ColorVisualizer3D: React.FC<Props> = ({ model }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0.5, y: 0.5 });
  const isDragging = useRef(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });

  // Generate points based on the model
  const generatePoints = (numPoints: number): Point3D[] => {
    const points: Point3D[] = [];
    // Reduce resolution for performance, increase step for visual clarity
    const step = 25; 
    
    for (let r = 0; r <= 255; r += step) {
      for (let g = 0; g <= 255; g += step) {
        for (let b = 0; b <= 255; b += step) {
          const color = rgbToHex(r, g, b);
          let x = 0, y = 0, z = 0;

          if (model === ColorModel.RGB) {
            // Cube: Normalizing to -1 to 1 range for simpler rotation math
            x = (r / 255) * 2 - 1;
            y = (g / 255) * 2 - 1; // y is usually up in 3D, but in canvas +y is down. We invert later.
            z = (b / 255) * 2 - 1;
          } else if (model === ColorModel.HSV) {
            const hsv = rgbToHsv(r, g, b);
            // Cylinder/Cone representation
            const angle = (hsv.h / 360) * Math.PI * 2;
            const radius = hsv.s / 100;
            const height = (hsv.v / 100) * 2 - 1;
            
            x = Math.cos(angle) * radius;
            z = Math.sin(angle) * radius;
            y = height; 
          } else if (model === ColorModel.HSL) {
            const hsl = rgbToHsl(r, g, b);
            // Double Cone
            const angle = (hsl.h / 360) * Math.PI * 2;
            const height = (hsl.l / 100) * 2 - 1;
            // Radius depends on Lightness
            const radius = (hsl.s / 100) * (1 - Math.abs(2 * (hsl.l / 100) - 1));

            x = Math.cos(angle) * radius;
            z = Math.sin(angle) * radius;
            y = height;
          } else if (model === ColorModel.HSI) {
            const hsi = rgbToHsi(r, g, b);
            // HSI is often represented as a double cone like HSL, or a cylinder.
            // We use cylindrical coordinates: Angle=H, Radius=S, Height=I
            const angle = (hsi.h / 360) * Math.PI * 2;
            const radius = hsi.s / 100;
            const height = (hsi.i / 100) * 2 - 1;

            x = Math.cos(angle) * radius;
            z = Math.sin(angle) * radius;
            y = height;
          } else if (model === ColorModel.LAB) {
            const lab = rgbToLab(r, g, b);
            // Lab is roughly a sphere/blob
            // L is vertical (0 to 100) -> mapped to -1 to 1
            y = (lab.l / 100) * 2 - 1;
            // a and b are axes (-128 to 128 approx) -> mapped to -1 to 1
            x = lab.a / 128;
            z = lab.b / 128;
          } else if (model === ColorModel.CMYK) {
             // CMYK is a 4D space, hard to visualize in 3D without slicing. 
             // We will visualize CMY cube (subtractive)
            x = (1 - r/255) * 2 - 1;
            y = (1 - g/255) * 2 - 1;
            z = (1 - b/255) * 2 - 1;
          } else if (model === ColorModel.YCBCR) {
            const ycbcr = rgbToYCbCr(r, g, b);
            // Y is Luma (vertical axis)
            y = (ycbcr.y / 255) * 2 - 1;
            // Cb and Cr are chroma axes (approx -128 to 127 centered at 128, mapped to -1 to 1)
            x = (ycbcr.cb - 128) / 128;
            z = (ycbcr.cr - 128) / 128;
          }

          points.push({ x, y, z, color });
        }
      }
    }
    return points;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const points = generatePoints(1500);
    let animationFrameId: number;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) / 3;

      // Rotation Matrix (Simple Euler)
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);
      const cosY = Math.cos(rotation.y);
      const sinY = Math.sin(rotation.y);

      // Sort points by depth (z-index) so points in front draw last
      // We need to compute rotated Z for sorting
      const transformedPoints = points.map(p => {
        // Rotate around Y
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;
        
        // Rotate around X
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        return { ...p, rx: x1, ry: y2, rz: z2 };
      });

      transformedPoints.sort((a, b) => b.rz - a.rz);

      transformedPoints.forEach(p => {
        // Projection (Weak Perspective)
        // Invert Y because canvas Y is down
        const screenX = cx + p.rx * scale;
        const screenY = cy - p.ry * scale;

        // Size attenuation based on depth
        const size = Math.max(1, (scale / 40) * (p.rz + 2) / 2);

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Axes
      const drawAxis = (x: number, y: number, z: number, color: string, label: string) => {
          let x1 = x * cosY - z * sinY;
          let z1 = z * cosY + x * sinY;
          let y2 = y * cosX - z1 * sinX;
          
          const screenX = cx + x1 * scale * 1.2;
          const screenY = cy - y2 * scale * 1.2;
          
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(screenX, screenY);
          ctx.stroke();

          ctx.fillStyle = '#fff';
          ctx.font = '12px sans-serif';
          ctx.fillText(label, screenX, screenY);
      };

      // Draw schematic axes based on model
      if (model === ColorModel.RGB) {
        drawAxis(1, 0, 0, '#ff4444', 'R');
        drawAxis(0, 1, 0, '#44ff44', 'G');
        drawAxis(0, 0, 1, '#4444ff', 'B');
      } else if (model === ColorModel.LAB) {
        drawAxis(0, 1, 0, '#ffffff', 'L');
        drawAxis(1, 0, 0, '#ff44ff', '+a');
        drawAxis(0, 0, 1, '#ffff44', '+b');
      } else if (model === ColorModel.HSV) {
        drawAxis(0, 1, 0, '#ffffff', 'V');
        // Angle is Hue, Radius is Saturation
      } else if (model === ColorModel.HSI) {
        drawAxis(0, 1, 0, '#ffffff', 'I');
        // Angle is Hue, Radius is Saturation
      } else if (model === ColorModel.CMYK) {
        // In our simple mapping, we mapped 1-r to x. 
        // If x=1, r=0 (Cyan=100%). If x=-1, r=255 (Cyan=0%).
        // So +x is Cyan. +y is Magenta. +z is Yellow.
        drawAxis(1, 0, 0, '#00ffff', 'C');
        drawAxis(0, 1, 0, '#ff00ff', 'M');
        drawAxis(0, 0, 1, '#ffff00', 'Y');
      } else if (model === ColorModel.YCBCR) {
        drawAxis(0, 1, 0, '#ffffff', 'Y');
        drawAxis(1, 0, 0, '#5555ff', 'Cb'); 
        drawAxis(0, 0, 1, '#ff5555', 'Cr');
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [model, rotation]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    
    const dx = e.clientX - lastMousePosition.current.x;
    const dy = e.clientY - lastMousePosition.current.y;

    setRotation(prev => ({
      x: prev.x + dy * 0.01,
      y: prev.y + dx * 0.01
    }));

    lastMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-xl">
      <div className="absolute top-4 left-4 bg-black/50 p-2 rounded text-xs text-slate-300 pointer-events-none select-none z-10">
        <p>Interactive 3D View</p>
        <p>Click & Drag to Rotate</p>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={500}
        className="w-full h-full cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};

export default ColorVisualizer3D;