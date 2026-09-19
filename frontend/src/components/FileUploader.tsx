import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, FileText, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  onCameraOpen?: () => void;
  accept?: string;
  label?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFileSelect, 
  onCameraOpen,
  accept = "image/*", 
  label = "Upload Crop Photo" 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onFileSelect(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
          isDragging 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-primary/50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          accept={accept}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md"
            >
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button
                onClick={clearPreview}
                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Upload size={32} />
              </div>
              <div>
                <p className="font-bold text-earth">{label}</p>
                <p className="text-sm text-gray-500 mt-1">Drag and drop or click to browse</p>
              </div>
              <div className="flex gap-2 mt-2">
                <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-wider">JPG</span>
                <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-wider">PNG</span>
              </div>
              
              {onCameraOpen && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCameraOpen();
                  }}
                  className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <Camera size={18} />
                  Open Camera
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
