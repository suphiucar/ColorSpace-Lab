import React, { useState, useEffect } from 'react';
import { ColorModel } from './types';
import ColorVisualizer3D from './components/ColorVisualizer3D';
import ChannelSplitter from './components/ChannelSplitter';
import ColorConverter from './components/ColorConverter';
import { LayoutGrid, Box, Layers, Info, BrainCircuit, RefreshCcw } from 'lucide-react';
import { explainColorModel } from './services/geminiService';
import ReactMarkdown from 'react-markdown';

function App() {
  const [activeModel, setActiveModel] = useState<ColorModel>(ColorModel.RGB);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'splitter' | 'converter'>('visualizer');
  const [explanation, setExplanation] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    // Fetch AI explanation when model changes
    const fetchExplanation = async () => {
        setLoadingAi(true);
        const text = await explainColorModel(activeModel);
        setExplanation(text);
        setLoadingAi(false);
    };
    fetchExplanation();
  }, [activeModel]);

  const getTabTitle = () => {
      switch(activeTab) {
          case 'visualizer': return '3D Visualization';
          case 'splitter': return 'Channel Separation';
          case 'converter': return 'Color Converter';
      }
  }

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-slate-800 bg-slate-900">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
            <Layers className="text-indigo-400" />
            ColorSpace Lab
          </h1>
          <p className="text-xs text-slate-500 mt-2">Prof. Toolkit v1.0</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Color Models</h2>
            <div className="space-y-1">
              {Object.values(ColorModel).map((model) => (
                <button
                  key={model}
                  onClick={() => setActiveModel(model)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between group ${
                    activeModel === model
                      ? 'bg-indigo-600 text-white'
                      : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <span>{model}</span>
                  {activeModel === model && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                </button>
              ))}
            </div>
          </div>

          <div>
             <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tools</h2>
             <div className="flex flex-col gap-2">
                <button 
                    onClick={() => setActiveTab('visualizer')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${activeTab === 'visualizer' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    <Box size={16} /> 3D Space Visualizer
                </button>
                <button 
                    onClick={() => setActiveTab('splitter')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${activeTab === 'splitter' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    <LayoutGrid size={16} /> Image Channel Splitter
                </button>
                <button 
                    onClick={() => setActiveTab('converter')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${activeTab === 'converter' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    <RefreshCcw size={16} /> Color Converter
                </button>
             </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-600">
           Powered by Gemini 2.5 Flash
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 backdrop-blur-sm sticky top-0 z-20">
          <h2 className="text-lg font-medium flex items-center gap-2">
             <span className="text-slate-400">{activeModel}</span>
             <span className="text-slate-600">/</span>
             <span className="text-white">{getTabTitle()}</span>
          </h2>
          <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-mono text-indigo-300 border border-slate-700">
                  {activeModel === ColorModel.LAB ? 'CIE L*a*b*' : activeModel}
              </span>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-hidden flex gap-6">
            
            {/* Left/Center Panel: The Main Tool */}
            <div className="flex-1 flex flex-col min-w-0 h-full">
                {activeTab === 'visualizer' && <ColorVisualizer3D model={activeModel} />}
                {activeTab === 'splitter' && <ChannelSplitter model={activeModel} />}
                {activeTab === 'converter' && <ColorConverter model={activeModel} />}
            </div>

            {/* Right Panel: Educational Context */}
            <div className="w-80 flex-shrink-0 bg-slate-900 border border-slate-800 rounded-lg flex flex-col overflow-hidden">
                <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center gap-2">
                    <BrainCircuit className="text-purple-400" size={20} />
                    <h3 className="font-semibold text-sm">Professor AI</h3>
                </div>
                <div className="p-5 overflow-y-auto flex-1 text-sm text-slate-300 leading-relaxed space-y-4">
                    {loadingAi ? (
                        <div className="flex flex-col items-center justify-center h-32 gap-3 text-slate-500">
                            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <p>Generating explanation...</p>
                        </div>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown>{explanation}</ReactMarkdown>
                        </div>
                    )}
                    
                    <div className="mt-6 pt-6 border-t border-slate-700">
                        <h4 className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 mb-3">
                            <Info size={14} /> Quick Facts
                        </h4>
                        <ul className="space-y-2 text-xs">
                            {activeModel === ColorModel.RGB && (
                                <>
                                    <li className="flex gap-2"><span className="text-green-400">●</span> Additive Color Model</li>
                                    <li className="flex gap-2"><span className="text-green-400">●</span> Used in displays/sensors</li>
                                </>
                            )}
                            {activeModel === ColorModel.HSV && (
                                <>
                                    <li className="flex gap-2"><span className="text-green-400">●</span> Cylindrical Coordinate System</li>
                                    <li className="flex gap-2"><span className="text-green-400">●</span> Separates Chroma from Luma</li>
                                    <li className="flex gap-2"><span className="text-green-400">●</span> Ideal for Color Thresholding</li>
                                </>
                            )}
                            {activeModel === ColorModel.HSL && (
                                <>
                                    <li className="flex gap-2"><span className="text-green-400">●</span> Bi-conal Coordinate System</li>
                                    <li className="flex gap-2"><span className="text-green-400">●</span> Artist-friendly (tints/shades)</li>
                                </>
                            )}
                            {activeModel === ColorModel.HSI && (
                                <>
                                    <li className="flex gap-2"><span className="text-green-400">●</span> Decouples Intensity completely</li>
                                    <li className="flex gap-2"><span className="text-green-400">●</span> Good for image segmentation</li>
                                    <li className="flex gap-2"><span className="text-green-400">●</span> Mimics human visual perception</li>
                                </>
                            )}
                            {activeModel === ColorModel.LAB && (
                                <>
                                    <li className="flex gap-2"><span className="text-green-400">●</span> Perceptually Uniform</li>
                                    <li className="flex gap-2"><span className="text-green-400">●</span> Device Independent</li>
                                    <li className="flex gap-2"><span className="text-green-400">●</span> Used in color matching</li>
                                </>
                            )}
                             {activeModel === ColorModel.CMYK && (
                                <>
                                    <li className="flex gap-2"><span className="text-green-400">●</span> Subtractive Color Model</li>
                                    <li className="flex gap-2"><span className="text-green-400">●</span> Used in Printing</li>
                                </>
                            )}
                             {activeModel === ColorModel.YCBCR && (
                                <>
                                    <li className="flex gap-2"><span className="text-green-400">●</span> Luma-Chroma Separation</li>
                                    <li className="flex gap-2"><span className="text-green-400">●</span> Key to JPEG Compression</li>
                                    <li className="flex gap-2"><span className="text-green-400">●</span> Used in Video Broadcasting</li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

        </div>
      </main>
    </div>
  );
}

export default App;
