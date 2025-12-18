
import React from 'react';

interface SlotProps {
  label: string;
  image: string | null;
  onSelect: (img: string | null) => void;
  disabled?: boolean;
}

const Slot: React.FC<SlotProps> = ({ label, image, onSelect, disabled }) => {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onloadend = () => onSelect(r.result as string);
      r.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <div className={`relative aspect-square rounded-2xl border-2 border-dashed transition-all flex items-center justify-center overflow-hidden
        ${image ? 'border-slate-300' : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}>
        {image ? (
          <>
            <img src={image} className="w-full h-full object-contain p-2" />
            <button 
              onClick={(e) => { e.stopPropagation(); onSelect(null); }} 
              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-lg"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </>
        ) : (
          <div className="text-center p-2">
            <svg className="w-5 h-5 text-slate-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </div>
        )}
        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFile} disabled={disabled} accept="image/*" />
      </div>
    </div>
  );
};

interface Props {
  outfit: any;
  setOutfit: (o: any) => void;
  disabled?: boolean;
}

const ClothingPartUploader: React.FC<Props> = ({ outfit, setOutfit, disabled }) => {
  const update = (key: string, val: string | null) => setOutfit({ ...outfit, [key]: val });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Slot label="Upper" image={outfit.upper} onSelect={(v) => update('upper', v)} disabled={disabled} />
        <Slot label="Bottom" image={outfit.bottom} onSelect={(v) => update('bottom', v)} disabled={disabled} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Slot label="Watch" image={outfit.watch} onSelect={(v) => update('watch', v)} disabled={disabled} />
        <Slot label="Cap" image={outfit.cap} onSelect={(v) => update('cap', v)} disabled={disabled} />
        <Slot label="Jewelry" image={outfit.chain} onSelect={(v) => update('chain', v)} disabled={disabled} />
      </div>
      <p className="text-[10px] text-slate-400 font-medium text-center">AI will auto-generate missing parts for a complete look.</p>
    </div>
  );
};

export default ClothingPartUploader;
