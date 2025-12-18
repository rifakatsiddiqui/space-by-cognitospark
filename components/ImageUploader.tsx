
import React, { useCallback, useState } from 'react';

interface ImageUploaderProps {
  onImageSelect: (images: string[]) => void;
  selectedImages: string[] | string | null; // Support both single and multiple for backward compatibility
  disabled: boolean;
  multiple?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, selectedImages, disabled, multiple = false }) => {
  const [isDragging, setIsDragging] = useState(false);

  // Normalize selectedImages to array
  const currentImages: string[] = Array.isArray(selectedImages) 
    ? selectedImages 
    : (selectedImages ? [selectedImages] : []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFiles(Array.from(files));
    }
  };

  const processFiles = (files: File[]) => {
    const validFiles = files.filter(f => f.type.startsWith('image/') || f.name.toLowerCase().endsWith('.heic') || f.name.toLowerCase().endsWith('.heif'));
    
    // If not multiple, replace current selection, otherwise append
    // Upgrade: Bulk limit increased to 50
    const filesToProcess = multiple ? validFiles.slice(0, 50) : validFiles.slice(0, 1);
    
    if (filesToProcess.length === 0) return;

    let processedCount = 0;
    const newImages: string[] = [];

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
            newImages.push(reader.result as string);
        }
        processedCount++;
        
        // When all are processed
        if (processedCount === filesToProcess.length) {
            if (multiple) {
                // Bulk limit increased to 50
                onImageSelect([...currentImages, ...newImages].slice(0, 50));
            } else {
                onImageSelect(newImages);
            }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files) as File[];
    if (files.length > 0) {
      processFiles(files);
    }
  }, [disabled, multiple, currentImages]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const updated = currentImages.filter((_, i) => i !== index);
    onImageSelect(updated);
  };

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative w-full border-2 border-dashed rounded-2xl transition-all duration-200 ease-in-out flex flex-col items-center justify-center overflow-hidden
          ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : 'cursor-pointer'}
          ${isDragging 
            ? 'border-brand-500 bg-brand-50 scale-[1.01]' 
            : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'
          }
          ${currentImages.length > 0 ? 'bg-white h-auto min-h-[12rem]' : 'h-72 bg-white'}
        `}
      >
        {currentImages.length > 0 ? (
          <div className="w-full h-full p-4">
              <div className={`grid gap-3 ${currentImages.length === 1 ? 'grid-cols-1 h-64' : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-5'}`}>
                  {currentImages.map((img, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-50 shadow-sm">
                          <img 
                            src={img} 
                            alt={`Upload ${idx + 1}`} 
                            className="w-full h-full object-contain"
                          />
                          <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                             <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                             <span className="text-[10px] font-bold">Preview N/A</span>
                          </div>

                          {!disabled && (
                              <button 
                                onClick={(e) => removeImage(idx, e)}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-colors shadow-md z-10 opacity-100 sm:opacity-0 group-hover:opacity-100"
                                title="Remove Image"
                              >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                          )}
                      </div>
                  ))}
                  
                  {multiple && !disabled && currentImages.length < 50 && (
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl aspect-square text-slate-400 hover:text-brand-500 hover:border-brand-300 transition-colors bg-slate-50/50">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                           <span className="text-[10px] mt-1 font-bold">Add More</span>
                      </div>
                  )}
              </div>
              
              {!disabled && (
                <div className="mt-4 flex justify-center">
                     <span className="bg-slate-800/80 text-white px-3 py-1.5 rounded-full text-[10px] font-bold backdrop-blur-sm">
                        {multiple ? `Click area to manage photos (${currentImages.length}/50)` : "Click to change photo"}
                     </span>
                </div>
              )}
          </div>
        ) : (
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-lg text-slate-700 font-bold">
              {multiple ? "Upload bulk product media" : "Upload your product"}
            </p>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              {multiple ? "Drag & drop up to 50 SKU angles" : "Drag & drop or click to browse"}
            </p>
            <p className="text-xs text-slate-400 mt-4 uppercase font-bold tracking-widest">JPG, PNG, WEBP, HEIC</p>
          </div>
        )}
        
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/jpg, image/webp, image/heic, image/heif"
          multiple={multiple}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default ImageUploader;
