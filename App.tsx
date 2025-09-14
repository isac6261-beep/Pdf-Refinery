import React, { useState, useCallback } from 'react';
import { ToolMode } from './types';
import MergeTool from './components/MergeTool';
import SplitTool from './components/SplitTool';
import AiEditTool from './components/AiEditTool';
import ExtractTextTool from './components/ExtractTextTool';
import { FileStackIcon, ScissorsIcon, Wand2Icon, FileTextIcon } from './components/Icons';

// This is required to inform TypeScript about the global variables loaded from CDNs
declare const pdfjsLib: any;
declare const PDFLib: any;

const App: React.FC = () => {
  const [tool, setTool] = useState<ToolMode>(ToolMode.MERGE);

  const renderTool = useCallback(() => {
    switch (tool) {
      case ToolMode.MERGE:
        return <MergeTool />;
      case ToolMode.SPLIT:
        return <SplitTool />;
      case ToolMode.EXTRACT_TEXT:
        return <ExtractTextTool />;
      case ToolMode.EDIT:
        return <AiEditTool />;
      default:
        return <MergeTool />;
    }
  }, [tool]);

  const NavButton: React.FC<{
    currentTool: ToolMode;
    targetTool: ToolMode;
    setTool: (tool: ToolMode) => void;
    icon: React.ReactNode;
    label: string;
  }> = ({ currentTool, targetTool, setTool, icon, label }) => (
    <button
      onClick={() => setTool(targetTool)}
      className={`flex-1 sm:flex-none flex sm:flex-col items-center justify-center sm:h-24 sm:w-28 gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 ${
        currentTool === targetTool
          ? 'bg-indigo-600 text-white shadow-lg'
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <header className="bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <Wand2Icon className="w-8 h-8 text-indigo-400" />
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              AI PDF Toolbox
            </h1>
          </div>
          <nav className="w-full sm:w-auto flex justify-center sm:justify-end items-center gap-2 sm:gap-4 bg-slate-900/50 p-2 rounded-lg">
            <NavButton
              currentTool={tool}
              targetTool={ToolMode.MERGE}
              setTool={setTool}
              icon={<FileStackIcon className="w-6 h-6" />}
              label="Merge"
            />
            <NavButton
              currentTool={tool}
              targetTool={ToolMode.SPLIT}
              setTool={setTool}
              icon={<ScissorsIcon className="w-6 h-6" />}
              label="Split"
            />
            <NavButton
              currentTool={tool}
              targetTool={ToolMode.EXTRACT_TEXT}
              setTool={setTool}
              icon={<FileTextIcon className="w-6 h-6" />}
              label="Extract Text"
            />
            <NavButton
              currentTool={tool}
              targetTool={ToolMode.EDIT}
              setTool={setTool}
              icon={<Wand2Icon className="w-6 h-6" />}
              label="AI Edit"
            />
          </nav>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-8">
        {renderTool()}
      </main>

      <footer className="text-center py-6 text-slate-500 text-sm">
        <p>Powered by Gemini & React</p>
      </footer>
    </div>
  );
};

export default App;