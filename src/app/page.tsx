'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { DropZone } from '@/components/image-processor/drop-zone';
import { ConversionSettings } from '@/components/image-processor/settings';
import { ImageList, ImageItem } from '@/components/image-processor/image-list';
import { processImageWithCanvas, ProcessingSettings } from '@/lib/image-processor';
import { Button } from '@/components/ui/button';
import { 
  Download, Play, Trash2, ShieldCheck, Moon, Sun, X, BarChart3,
  ExternalLink, Code, ChevronLeft, ChevronRight
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
  const [isClient, setIsClient] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  const savePreset = () => {
    localStorage.setItem('pfip_preset', JSON.stringify(settings));
    toast.success('プリセットを保存しました');
  };

  const loadPreset = () => {
    const saved = localStorage.getItem('pfip_preset');
    if (saved) {
      setSettings(JSON.parse(saved));
      toast.success('プリセットを読み込みました');
    } else {
      toast.error('保存されたプリセットがありません');
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
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        setImages(prev => prev.map(item => 
          item.id === img.id ? { ...item, status: 'processing', progress: 50 } : item
        ));
        const processed = await processImageWithCanvas(img.file, settings, i);
        setImages(prev => prev.map(item => 
          item.id === img.id ? { ...item, status: 'completed', progress: 100, result: processed } : item
        ));
      }
      toast.success('変換完了');
      if (settings.autoDownload) setTimeout(() => downloadAll(), 500);
    } catch (error) {
      toast.error('エラーが発生しました');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    const completed = images.filter(img => img.result);
    if (completed.length === 0) return;
    completed.forEach(img => {
      if (img.result) zip.file(img.result.name, img.result);
    });
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimized_${new Date().getTime()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isClient) return null;

  return (
    <main className={`min-h-screen ${isDarkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-[#fafafa] text-zinc-900'} transition-colors duration-300`}>
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-primary p-1.5 md:p-2 rounded-xl">
              <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="font-bold text-base md:text-xl tracking-tight">Privacy Image</span>
          </div>
          
          <div className="flex items-center gap-4">
            {stats.originalTotal > 0 && (
              <div className="hidden md:flex items-center gap-2 text-xs font-mono">
                <span className="text-primary font-bold">{(stats.saved / 1024 / 1024).toFixed(1)}MB saved</span>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)} className="rounded-full w-9 h-9">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* Main Area */}
          <div className="lg:col-span-8 space-y-8 md:space-y-10">
            {previewUrl && (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                  <h2 className="text-xl font-bold tracking-tight px-2">ライブプレビュー</h2>
                  <div className="flex gap-2 w-full sm:w-auto px-2">
                    <Button variant="outline" size="sm" onClick={loadPreset} className="flex-1 h-8 text-xs">復元</Button>
                    <Button variant="outline" size="sm" onClick={savePreset} className="flex-1 h-8 text-xs text-primary bg-primary/5 border-primary/20">保存</Button>
                  </div>
                </div>
                
                <div className="relative aspect-video rounded-2xl md:rounded-3xl overflow-hidden border-2 md:border-4 border-white dark:border-zinc-800 shadow-xl bg-muted/40">
                  <img src={previewOriginalUrl || ''} className="absolute inset-0 w-full h-full object-contain" alt="Original" />
                  <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ clipPath: 'inset(0 0 0 var(--slider-pos, 50%))' }}>
                    <img src={previewUrl} className="absolute inset-0 w-full h-full object-contain" alt="Result" />
                  </div>
                  <input type="range" min="0" max="100" defaultValue="50" className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                    onInput={(e) => e.currentTarget.parentElement?.style.setProperty('--slider-pos', `${e.currentTarget.value}%`)} />
                  <div className="absolute inset-y-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.3)] z-10 pointer-events-none" style={{ left: 'var(--slider-pos, 50%)' }}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full shadow-2xl flex items-center justify-center border-2 border-primary/20">
                      <ChevronLeft className="w-3 h-3 md:w-4 md:h-4 text-zinc-400 -mr-1" />
                      <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-zinc-400 -ml-1" />
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            <section className="space-y-4">
              <DropZone onFilesAdded={handleFilesAdded} />
            </section>

            <section className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h2 className="text-xl md:text-2xl font-bold">変換リスト</h2>
                {images.length > 0 && <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive">クリア</Button>}
              </div>
              <ImageList images={images} onRemove={removeImage} />
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <ConversionSettings settings={settings} updateSettings={updateSetting} onReset={resetSettings} />

            <div className="sticky bottom-4 lg:relative flex flex-col gap-3 p-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl border shadow-2xl lg:shadow-none lg:bg-transparent lg:border-none lg:p-0 z-40">
              <Button className="w-full h-12 md:h-14 text-lg font-bold gap-3 shadow-xl" size="lg" disabled={images.length === 0 || isProcessing} onClick={processImages}>
                {isProcessing ? "処理中..." : <><Play className="w-5 h-5 fill-current" /> 一括変換を開始</>}
              </Button>
              <Button variant="outline" className="w-full h-12 md:h-14 text-lg font-bold gap-3" size="lg" disabled={images.length === 0 || !images.some(img => img.result) || isProcessing} onClick={downloadAll}>
                <Download className="w-5 h-5" /> ZIP一括保存
              </Button>
            </div>
          </div>
        </div>

        {/* Improved SEO & Privacy Text Section - Moved to absolute bottom */}
        <div className="mt-20 pt-20 border-t border-muted space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">プライバシー第一の画像処理</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                画像はサーバーに送信されません。すべての処理はブラウザのメモリ内で行われます。
                あなたのプライバシーは100%守られます。
              </p>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">WebP / AVIF 完全対応</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                最新の圧縮技術で画質を落とさず軽量化。オフラインでも動作します。
                PageSpeed Insightsなどのパフォーマンス改善に最適です。
              </p>
            </div>
          </div>

          <div className="bg-primary/5 rounded-3xl p-8 md:p-12 border border-primary/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="font-bold text-primary text-xl">連番</div>
                <p className="text-[10px] uppercase tracking-widest opacity-50">Rename</p>
              </div>
              <div>
                <div className="font-bold text-primary text-xl">合成</div>
                <p className="text-[10px] uppercase tracking-widest opacity-50">Overlay</p>
              </div>
              <div>
                <div className="font-bold text-primary text-xl">角丸</div>
                <p className="text-[10px] uppercase tracking-widest opacity-50">Edit</p>
              </div>
              <div>
                <div className="font-bold text-primary text-xl">0%</div>
                <p className="text-[10px] uppercase tracking-widest opacity-50">Serverless</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t py-12 mt-20 bg-muted/5">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-8">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary">プライバシーポリシー</Link>
            <Link href="/terms" className="hover:text-primary">利用規約</Link>
            <Link href="/contact" className="hover:text-primary">お問い合わせ</Link>
          </div>
          <p className="text-xs text-muted-foreground/60 max-w-sm mx-auto leading-relaxed">
            © 2026 Privacy Image Processor. 100% Client-side privacy guaranteed. No data collection.
          </p>
        </div>
      </footer>
    </main>
  );
}
