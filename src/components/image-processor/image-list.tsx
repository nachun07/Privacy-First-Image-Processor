'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, X, FileImage, ArrowRight } from 'lucide-react';
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
  removeImage: (id: string) => void;
}

export const ImageList: React.FC<ImageListProps> = ({ images, removeImage }) => {
  if (images.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          処理対象 ({images.length})
        </h4>
      </div>
      
      <div className="grid gap-3">
        <AnimatePresence mode="popLayout">
          {images.map((img) => (
            <motion.div
              key={img.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border rounded-xl p-4 flex items-center gap-4 group relative shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={img.preview}
                  alt={img.file.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-medium truncate pr-8">{img.file.name}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(img.id)}
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{formatFileSize(img.file.size)}</span>
                  {img.result && (
                    <>
                      <ArrowRight className="w-3 h-3" />
                      <span className="text-primary font-bold">{formatFileSize(img.result.size)}</span>
                      <span className="bg-primary/10 text-primary px-1.5 rounded uppercase font-bold text-[10px]">
                        Save {Math.round((1 - img.result.size / img.file.size) * 100)}%
                      </span>
                    </>
                  )}
                </div>

                {img.status === 'processing' && (
                  <div className="mt-2">
                    <Progress value={img.progress} className="h-1" />
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 flex items-center justify-center w-10">
                {img.status === 'completed' && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                {img.status === 'processing' && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                {img.status === 'pending' && <FileImage className="w-5 h-5 text-muted-foreground" />}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
