'use client';

import React, { useState, useCallback } from 'react';
import { DropZone } from '@/components/image-processor/drop-zone';
import { ConversionSettings } from '@/components/image-processor/settings';
import { ImageList, ImageItem } from '@/components/image-processor/image-list';
import { compressImage } from '@/lib/image-utils';
import { Button } from '@/components/ui/button';
import { Download, Play, Trash2, ShieldCheck, Code, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { motion } from 'framer-motion';
import Link from 'next/link';

import { processImageWithCanvas, ProcessingSettings } from '@/lib/image-processor';
import { useEffect, useRef } from 'react';

export default function Home() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [settings, setSettings] = useState<ProcessingSettings>({
    quality: 80,
    maxWidth: 1920,
    format: 'image/webp',
    brightness: 100,
    contrast: 100,
    blur: 0,
    grayscale: false,
    watermarkText: '',
    watermarkPosition: 'bottom-right',
    watermarkSize: 4,
    watermarkOpacity: 50,
    removeExif: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOriginalUrl, setPreviewOriginalUrl] = useState<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // リアルタイムプレビュー生成
  useEffect(() => {
    if (images.length === 0) {
      setPreviewUrl(null);
      setPreviewOriginalUrl(null);
      return;
    }

    const generatePreview = async () => {
      const firstImage = images[0];
      setPreviewOriginalUrl(firstImage.preview);
      try {
        // プレビュー用なのでサイズを少し抑えて高速化
        const previewSettings = { ...settings, maxWidth: 800 }; 
        const result = await processImageWithCanvas(firstImage.file, previewSettings);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(result));
      } catch (err) {
        console.error("Preview failed", err);
      }
    };

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(generatePreview, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [settings, images.length]); // 画像が追加されたか設定が変わったら実行

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleFilesAdded = useCallback((files: File[]) => {
    const newItems: ImageItem[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file), 
      status: 'pending',
      progress: 0,
    }));
    setImages(prev => [...prev, ...newItems]);
  }, []);

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    toast.info('リストをクリアしました');
  };

  const processImages = async () => {
    if (images.length === 0 || isProcessing) return;
    
    // 処理開始前にすべてのステートをリセット（再変換を可能にする）
    setImages(prev => prev.map(img => ({ ...img, status: 'pending', progress: 0 })));
    setIsProcessing(true);

    try {
      // ステート反映を待つための微小な待機
      await new Promise(resolve => setTimeout(resolve, 100));

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        
        setImages(prev => prev.map(item => 
          item.id === img.id ? { ...item, status: 'processing', progress: 30 } : item
        ));

        // Canvasエンジンで処理
        const processed = await processImageWithCanvas(img.file, settings);

        setImages(prev => prev.map(item => 
          item.id === img.id ? { ...item, status: 'completed', progress: 100, result: processed } : item
        ));
      }
      toast.success('すべての変換が完了しました');
    } catch (error) {
      console.error(error);
      toast.error('変換中にエラーが発生しました');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    const completed = images.filter(img => img.result);
    
    if (completed.length === 0) {
      toast.error('変換された画像がありません');
      return;
    }

    completed.forEach(img => {
      if (img.result) zip.file(img.result.name, img.result);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimized_images_${new Date().getTime()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('ZIPファイルをダウンロードしました');
  };

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-primary selection:text-primary-foreground">
      {/* Navigation */}
      <nav className="border-b bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Privacy Image Processor</span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Area */}
          <div className="lg:col-span-8 space-y-10">
            {/* Real-time Preview Panel */}
            {previewUrl && (
              <motion.section
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-end px-2">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">ライブプレビュー</h2>
                    <p className="text-muted-foreground text-xs">設定の変更をリアルタイムで反映中（先頭の画像）</p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Live
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Original</span>
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden border bg-muted/30">
                      <img src={previewOriginalUrl || ''} className="w-full h-full object-contain" alt="Original" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase text-primary ml-1">Result</span>
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden border-2 border-primary/20 bg-muted/30 relative">
                      <img src={previewUrl} className="w-full h-full object-contain" alt="Result" />
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            <section>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <DropZone onFilesAdded={handleFilesAdded} />
              </motion.div>
            </section>

            <section className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">変換リスト</h2>
                  <p className="text-muted-foreground text-sm">変換する画像を確認してください</p>
                </div>
                {images.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearAll} className="gap-2 text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" /> 全て削除
                  </Button>
                )}
              </div>
              
              <ImageList images={images} removeImage={removeImage} />
              
              {images.length === 0 && (
                <div className="text-center py-20 border-2 border-dotted rounded-2xl bg-muted/20">
                  <p className="text-muted-foreground">画像が選択されていません</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <ConversionSettings
              settings={settings}
              updateSettings={updateSetting}
            />

            <div className="space-y-3">
              <Button
                className="w-full h-14 text-lg font-bold gap-3 shadow-xl shadow-primary/20"
                size="lg"
                disabled={images.length === 0 || isProcessing}
                onClick={processImages}
              >
                {isProcessing ? (
                  <>処理中...</>
                ) : (
                  <><Play className="w-5 h-5 fill-current" /> 一括変換を開始</>
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full h-14 text-lg font-bold gap-3"
                size="lg"
                disabled={images.length === 0 || !images.some(img => img.status === 'completed') || isProcessing}
                onClick={downloadAll}
              >
                <Download className="w-5 h-5" /> ZIPで一括保存
              </Button>
        </div>
      </div>
    </div>
  </div>

      <footer className="border-t py-12 bg-muted/10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-8 mb-8 text-sm text-muted-foreground font-medium">
            <Link href="/privacy" className="hover:text-primary transition-colors">プライバシーポリシー</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">利用規約</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">お問い合わせ</Link>
          </div>
          <p className="text-sm text-muted-foreground/60">
            © 2026 Privacy Image Processor. No images are sent to any server. Built with Next.js & browser-image-compression.
          </p>
        </div>
      </footer>
    </main>
  );
}
