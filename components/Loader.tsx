
import React from 'react';

const Loader: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 bg-slate-800/50 rounded-lg">
      <div className="w-12 h-12 border-4 border-slate-500 border-t-indigo-400 rounded-full animate-spin"></div>
      <p className="text-slate-300 font-medium tracking-wide">{text}</p>
    </div>
  );
};

export default Loader;
