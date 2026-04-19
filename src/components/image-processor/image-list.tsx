'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, X, FileImage, ArrowRight, Download } from 'lucide-react';
import { formatFileSize } from '@/lib/image-utils';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export interface ImageItem {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: File;
}

interface ImageListProps {
  images: ImageItem[];
  onRemove: (id: string) => void;
}

export const ImageList: React.FC<ImageListProps> = ({ images, onRemove }) => {
  const downloadSingle = (img: ImageItem) => {
    if (!img.result) return;
    const url = URL.createObjectURL(img.result);
    const a = document.createElement('a');
    a.href = url;
    a.download = img.result.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
      <AnimatePresence mode="popLayout">
        {images.map((img) => (
          <motion.div
            key={img.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative bg-white dark:bg-zinc-900 border border-primary/5 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              {/* Preview */}
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={img.preview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                {img.status === 'processing' && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold truncate pr-4">
                    {img.file.name}
                  </h3>
                  <button
                    onClick={() => onRemove(img.id)}
                    className="p-1 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <FileImage className="w-3 h-3" />
                    {formatFileSize(img.file.size)}
                  </span>
                  {img.status === 'completed' && img.result && (
                    <>
                      <ArrowRight className="w-3 h-3 text-primary/40" />
                      <span className="text-primary font-bold">
                        {formatFileSize(img.result.size)}
                      </span>
                    </>
                  )}
                </div>

                {/* Progress / Status */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1">
                    {img.status === 'processing' ? (
                      <Progress value={img.progress} className="h-1.5" />
                    ) : img.status === 'completed' ? (
                      <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        変換完了
                      </div>
                    ) : (
                      <div className="h-1.5 w-full bg-muted rounded-full" />
                    )}
                  </div>
                  
                  {img.status === 'completed' && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                      onClick={() => downloadSingle(img)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
