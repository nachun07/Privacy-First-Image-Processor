'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { DropZone } from '@/components/image-processor/drop-zone';
import { ConversionSettings } from '@/components/image-processor/settings';
import { ImageList, ImageItem } from '@/components/image-processor/image-list';
import { processImageWithCanvas, ProcessingSettings } from '@/lib/image-processor';
import { Button } from '@/components/ui/button';
import { 
  Download, Play, Trash2, ShieldCheck, Moon, Sun, X, BarChart3,
  ExternalLink, Code
} from 'lucide-react';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { motion } from 'framer-motion';
import Link from 'next/link';

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
    cornerRadius: 0,
    aspectRatio: 'original',
    backgroundMode: 'blur',
    backgroundColor: '#000000',
    watermarkText: '',
    watermarkPosition: 'bottom-right',
    watermarkSize: 10,
    watermarkOpacity: 50,
    removeExif: true,
    autoDownload: true,
    renamePattern: '{{filename}}',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOriginalUrl, setPreviewOriginalUrl] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // 計算された統計
  const stats = useMemo(() => {
    let originalTotal = 0;
    let processedTotal = 0;
    images.forEach(img => {
      originalTotal += img.file.size;
      if (img.result) processedTotal += img.result.size;
    });
    const saved = originalTotal - processedTotal;
    const savingRate = originalTotal > 0 ? (saved / originalTotal) * 100 : 0;
    return { originalTotal, processedTotal, saved, savingRate };
  }, [images]);

  // リアルタイムプレビュー生成
  useEffect(() => {
    if (images.length === 0) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (previewOriginalUrl) URL.revokeObjectURL(previewOriginalUrl);
      setPreviewUrl(null);
      setPreviewOriginalUrl(null);
      return;
    }

    const generatePreview = async () => {
      const firstImage = images[0];
      if (!previewOriginalUrl) {
        setPreviewOriginalUrl(URL.createObjectURL(firstImage.file));
      }
      
      try {
        // プレビュー用なのでサイズを少し抑えて高速化
        const previewSettings = { ...settings, maxWidth: 800 }; 
        const result = await processImageWithCanvas(firstImage.file, previewSettings, 0);
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
  }, [settings, images.length]);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // プリセット機能
  const savePreset = () => {
    localStorage.setItem('pfip_preset', JSON.stringify(settings));
    toast.success('現在の設定をプリセットとして保存しました');
  };

  const loadPreset = () => {
    const saved = localStorage.getItem('pfip_preset');
    if (saved) {
      setSettings(JSON.parse(saved));
      toast.success('プリセットを読み込みました');
    } else {
      toast.error('保存されたプリセットが見つかりません');
    }
  };

  const resetSettings = () => {
    setSettings({
      quality: 80,
      maxWidth: 1920,
      format: 'image/webp',
      brightness: 100,
      contrast: 100,
      blur: 0,
      grayscale: false,
      cornerRadius: 0,
      aspectRatio: 'original',
      backgroundMode: 'blur',
      backgroundColor: '#000000',
      watermarkText: '',
      watermarkPosition: 'bottom-right',
      watermarkSize: 10,
      watermarkOpacity: 50,
      removeExif: true,
      autoDownload: true,
      renamePattern: '{{filename}}',
    });
    toast.info('設定を初期化しました');
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
        const processed = await processImageWithCanvas(img.file, settings, i);

        setImages(prev => prev.map(item => 
          item.id === img.id ? { ...item, status: 'completed', progress: 100, result: processed } : item
        ));
      }
      toast.success('すべての変換が完了しました');

      // 変換完了後に自動ダウンロードが有効な場合はZIP生成を開始
      if (settings.autoDownload) {
        setTimeout(() => downloadAll(), 500);
      }
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
    <main className={`min-h-screen ${isDarkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-[#fafafa] text-zinc-900'} selection:bg-primary selection:text-primary-foreground transition-colors duration-300`}>
      {/* Navigation */}
      <nav className="border-b bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Privacy Image Processor</span>
          </div>
          
          <div className="flex items-center gap-6">
            {stats.originalTotal > 0 && (
              <div className="hidden md:flex items-center gap-4 text-xs font-bold font-mono">
                <div className="flex flex-col items-end">
                  <span className="text-muted-foreground uppercase text-[8px] tracking-widest">Savings</span>
                  <span className="text-primary">{(stats.saved / 1024 / 1024).toFixed(2)} MB ({stats.savingRate.toFixed(1)}%)</span>
                </div>
                <div className="bg-primary/10 p-2 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)} className="rounded-full shadow-none hover:bg-muted outline-none border-none">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Area */}
          <div className="lg:col-span-8 space-y-10">
            {previewUrl && (
              <motion.section
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-end px-2">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">ライブプレビュー</h2>
                    <p className="text-muted-foreground text-xs">スライダーを動かして加工前後を比較できます</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadPreset} className="h-8 text-xs gap-2">
                      復元
                    </Button>
                    <Button variant="outline" size="sm" onClick={savePreset} className="h-8 text-xs gap-2 text-primary border-primary/20 bg-primary/5">
                      プリセット保存
                    </Button>
                  </div>
                </div>
                
                <div className="relative aspect-video rounded-3xl overflow-hidden border-4 border-white dark:border-zinc-800 shadow-2xl bg-muted/30 group">
                  {/* Before (Original) */}
                  <img src={previewOriginalUrl || ''} className="absolute inset-0 w-full h-full object-contain" alt="Original" />
                  
                  {/* After (Processed) */}
                  <div 
                    className="absolute inset-0 w-full h-full overflow-hidden"
                    style={{ clipPath: 'inset(0 0 0 var(--slider-pos, 50%))' }}
                  >
                    <img src={previewUrl} className="absolute inset-0 w-full h-full object-contain" alt="Result" />
                  </div>

                  {/* Slider Control */}
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="50"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                    onInput={(e) => {
                      const container = e.currentTarget.parentElement;
                      if (container) container.style.setProperty('--slider-pos', `${e.currentTarget.value}%`);
                    }}
                  />
                  
                  {/* Visible Bar */}
                  <div 
                    className="absolute inset-y-0 w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.3)] z-10 pointer-events-none"
                    style={{ left: 'var(--slider-pos, 50%)' }}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center">
                      <div className="flex gap-0.5">
                        <div className="w-1 h-3 bg-zinc-300 rounded-full" />
                        <div className="w-1 h-3 bg-zinc-300 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Labels */}
                  <div className="absolute top-4 left-4 bg-black/50 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md pointer-events-none">ORIGINAL</div>
                  <div className="absolute top-4 right-4 bg-primary/80 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md pointer-events-none">PROCESSED</div>
                </div>
              </motion.section>
            )}

            <section className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <h2 className="text-sm font-bold tracking-widest uppercase text-primary/50">Drop & Convert</h2>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
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
              
              <ImageList images={images} onRemove={removeImage} />
              
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
              onReset={resetSettings}
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
