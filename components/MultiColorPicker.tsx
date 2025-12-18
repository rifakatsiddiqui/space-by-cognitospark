
import React from 'react';
import { PRODUCT_COLORS } from '../types';

interface MultiColorPickerProps {
  label: string;
  selectedColors: string[];
  onColorsChange: (colors: string[]) => void;
  maxColors?: number;
}

const MultiColorPicker: React.FC<MultiColorPickerProps> = ({ 
  label, 
  selectedColors, 
  onColorsChange, 
  maxColors = 5 
}) => {
  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      onColorsChange(selectedColors.filter(c => c !== color));
    } else {
      if (selectedColors.length < maxColors) {
        onColorsChange([...selectedColors, color]);
      }
    }
  };

  const handleCustomColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    if (!selectedColors.includes(color) && selectedColors.length < maxColors) {
      onColorsChange([...selectedColors, color]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <label className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">{label}</label>
        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{selectedColors.length}/{maxColors} Selected</span>
      </div>

      <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 min-h-[50px]">
        {selectedColors.map((color, idx) => (
          <div 
            key={`${color}-${idx}`} 
            className="group relative flex items-center justify-center"
          >
            <div 
              className="w-8 h-8 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110" 
              style={{ backgroundColor: color === 'Original' ? '#fff' : color }}
            >
              {color === 'Original' && <span className="text-[6px] font-black flex items-center justify-center h-full">ORG</span>}
            </div>
            <button 
              onClick={() => toggleColor(color)}
              className="absolute -top-1 -right-1 bg-slate-900 text-white w-4 h-4 rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform"
            >
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
        {selectedColors.length === 0 && <span className="text-[9px] text-slate-300 font-bold uppercase italic p-2">No colors selected</span>}
      </div>

      <div className="space-y-3">
        <div className="flex gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
          {PRODUCT_COLORS.map(c => (
            <button 
              key={c.name} 
              onClick={() => toggleColor(c.hex || 'Original')}
              className={`w-6 h-6 rounded-full border-2 transition-all flex-shrink-0 ${selectedColors.includes(c.hex || 'Original') ? 'border-blue-600 scale-110 shadow-md' : 'border-white shadow-sm'}`} 
              style={{ backgroundColor: c.hex || '#fff' }}
              title={c.name}
            >
              {c.name === 'Original' && <span className="text-[6px] font-black">O</span>}
            </button>
          ))}
          <div className="relative w-6 h-6 rounded-full border-2 border-white shadow-sm overflow-hidden bg-white flex items-center justify-center group">
             <span className="text-slate-400 font-black text-[14px] leading-none">+</span>
             <input 
                type="color" 
                onChange={handleCustomColor}
                className="absolute inset-0 opacity-0 cursor-pointer scale-150"
             />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiColorPicker;
