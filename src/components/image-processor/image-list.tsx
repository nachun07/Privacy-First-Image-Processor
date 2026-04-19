'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, X, FileImage, ArrowRight, Download, FileEdit } from 'lucide-react';
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
  renamePattern?: string;
}

export const ImageList: React.FC<ImageListProps> = ({ images, onRemove, renamePattern = '{{filename}}' }) => {
  const downloadSingle = (img: ImageItem) => {
    if (!img.result) return;
    const url = URL.createObjectURL(img.result);
    const a = document.createElement('a');
    a.href = url;
    a.download = img.result.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 予測ファイル名の生成
  const getPredictiveName = (originalName: string, index: number) => {
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    return renamePattern
      .replace('{{filename}}', nameWithoutExt)
      .replace('{{index}}', (index + 1).toString())
      .replace('##', (index + 1).toString().padStart(2, '0'));
  };

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar" role="log" aria-live="polite">
      <AnimatePresence mode="popLayout">
        {images.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-muted/50 rounded-3xl text-center space-y-3"
          >
            <div className="p-4 bg-muted/40 rounded-full">
              <FileImage className="w-8 h-8 text-muted-foreground/60" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground">変換する画像がありません</p>
              <p className="text-xs text-muted-foreground/60">上のエリアに画像をドラッグ＆ドロップして追加してください</p>
            </div>
          </motion.div>
        ) : (
          images.map((img, index) => (
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
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-zinc-100 dark:border-zinc-800">
                  <img
                    src={img.preview}
                    alt={`${img.file.name}のプレビュー`}
                    className="w-full h-full object-cover"
                  />
                  {img.status === 'processing' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center" aria-label="処理中">
                      <Loader2 className="w-7 h-7 text-white animate-spin" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold truncate pr-3" title={img.file.name}>
                        {img.file.name}
                      </h3>
                      {img.status === 'pending' && (
                        <div className="flex items-center gap-1.5 text-xs text-primary/60 font-medium">
                          <FileEdit className="w-3 h-3" />
                          <span className="truncate">→ {getPredictiveName(img.file.name, index)}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onRemove(img.id)}
                      aria-label={`${img.file.name}をリストから削除`}
                      className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1.5">
                      <FileImage className="w-3.5 h-3.5 opacity-60" />
                      {formatFileSize(img.file.size)}
                    </span>
                    {img.status === 'completed' && img.result && (
                      <>
                        <ArrowRight className="w-3.5 h-3.5 text-primary/40" />
                        <span className="text-primary font-black">
                          {formatFileSize(img.result.size)}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Progress / Status */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1">
                      {img.status === 'processing' ? (
                        <Progress value={img.progress} className="h-2" aria-label={`${img.file.name}の処理進捗: ${img.progress}%`} />
                      ) : img.status === 'completed' ? (
                        <div className="flex items-center gap-1.5 text-green-600 text-sm font-black" role="status">
                          <CheckCircle2 className="w-4 h-4" />
                          変換完了
                        </div>
                      ) : (
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-0 bg-primary/20" />
                        </div>
                      )}
                    </div>
                    
                    {img.status === 'completed' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        aria-label={`${img.file.name}をダウンロード`}
                        className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary rounded-xl"
                        onClick={() => downloadSingle(img)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
};
