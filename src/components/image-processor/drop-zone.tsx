'use client';

import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
  className?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesAdded, className }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      onFilesAdded(files);
    }
  }, [onFilesAdded]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files).filter(file => 
      file.type.startsWith('image/')
    ) : [];
    
    if (files.length > 0) {
      onFilesAdded(files);
    }
  }, [onFilesAdded]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      document.getElementById('file-upload')?.click();
    }
  };

  return (
    <div className={cn("relative group", className)}>
      <label
        htmlFor="file-upload"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative h-64 border-3 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all duration-500 cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:border-primary",
          isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-muted-foreground/20 bg-background hover:border-primary/40 hover:bg-muted/30"
        )}
        aria-label="画像をアップロード。ファイルをここにドラッグ＆ドロップするか、エンターキーを押してファイルを選択してください。"
      >
        <input
          id="file-upload"
          type="file"
          multiple
          accept="image/*"
          className="sr-only"
          onChange={handleFileInput}
        />
        
        <div className="bg-primary/10 p-5 rounded-full mb-6 group-hover:scale-110 group-focus-visible:scale-110 transition-transform duration-500 ease-out">
          <Upload className={cn("w-10 h-10 transition-colors", isDragging ? "text-primary" : "text-primary/60")} />
        </div>
        
        <h3 className="text-xl font-black mb-3 tracking-tight">画像をドラッグ＆ドロップ</h3>
        <p className="text-muted-foreground text-sm mb-8 font-medium">またはクリック・Enterキーで選択</p>
        
        <div className="flex items-center gap-6 text-xs font-bold text-muted-foreground/60">
          <span className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full"><ImageIcon className="w-3.5 h-3.5" /> JPG / PNG / WebP</span>
          <span className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-primary/80">一括処理対応</span>
        </div>
      </label>
    </div>
  );
};
