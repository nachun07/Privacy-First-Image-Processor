'use client';

import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

  return (
    <div
      className={cn(
        "relative group cursor-pointer",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input
        id="file-upload"
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />
      
      <motion.div
        animate={{
          borderColor: isDragging ? "var(--primary)" : "rgba(0,0,0,0.1)",
          backgroundColor: isDragging ? "rgba(96, 165, 250, 0.05)" : "rgba(0,0,0,0)",
          scale: isDragging ? 1.02 : 1
        }}
        className={cn(
          "h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300",
          "hover:border-primary/50 hover:bg-muted/30"
        )}
      >
        <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">画像をドラッグ＆ドロップ</h3>
        <p className="text-muted-foreground text-sm mb-6">またはクリックしてファイルを選択</p>
        
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> JPG, PNG, WebP</span>
          <span>•</span>
          <span>複数追加可能</span>
        </div>
      </motion.div>
    </div>
  );
};
