'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { DropZone } from '@/components/image-processor/drop-zone';
import { ConversionSettings } from '@/components/image-processor/settings';
import { ImageList, ImageItem } from '@/components/image-processor/image-list';
import { processImageWithCanvas, ProcessingSettings } from '@/lib/image-processor';
import { Button } from '@/components/ui/button';
import { 
  Download, Play, Trash2, ShieldCheck, Moon, Sun, 
  BarChart3, ChevronLeft, ChevronRight, AlertTriangle,
  ShieldAlert, Globe, Wrench, WifiOff, History, Activity,
  Brush
} from 'lucide-react';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ManualEditor } from '@/components/image-processor/manual-editor';

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
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
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
    return { originalTotal, processedTotal, saved };
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
      
      // 最初の一枚が変わった場合、プレビューURLを再生成
      const newOriginalUrl = URL.createObjectURL(firstImage.file);
      setPreviewOriginalUrl(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return newOriginalUrl;
      });
      
      try {
        const previewSettings = { ...settings, maxWidth: 800 }; 
        const result = await processImageWithCanvas(firstImage.file, previewSettings, 0, firstImage.maskData, firstImage.mosaicLevel);
        setPreviewUrl(prev => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(result);
        });
      } catch (err) {
        console.error("Preview failed", err);
      }
    };

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(generatePreview, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [settings, images.length, images[0]?.id, images[0]?.maskData, images[0]?.mosaicLevel]);

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
        const processed = await processImageWithCanvas(img.file, settings, i, img.maskData, img.mosaicLevel);
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

  const updateMask = (id: string, maskData: string, mosaicLevel: number) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, maskData, mosaicLevel } : img
    ));
    toast.success('編集を保存しました');
  };

  if (!isClient) return null;

  const editingImage = images.find(img => img.id === editingImageId);

  return (
    <main className={`min-h-screen ${isDarkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-[#fafafa] text-zinc-900'} transition-colors duration-300`}>
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl" aria-hidden="true">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter">Privacy Image</span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/guide" className="hidden sm:flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-xl hover:bg-primary/5">
              <BarChart3 className="w-4 h-4" />
              <span>使い方ガイド</span>
            </Link>
            {stats.originalTotal > 0 && (
              <div className="hidden md:flex items-center gap-2 text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                <BarChart3 className="w-4 h-4" />
                <span>{(stats.saved / 1024 / 1024).toFixed(1)}MB 軽量化済み</span>
              </div>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="rounded-full w-10 h-10"
              aria-label={isDarkMode ? "ライトモードに切り替え" : "ダークモードに切り替え"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14">
          
          {/* Main Area */}
          <div className="lg:col-span-8 space-y-10 md:space-y-12">
            {previewUrl && (
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 px-2">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight">ライブプレビュー</h2>
                    <p className="text-muted-foreground text-sm font-medium">中央のバーを動かして加工前後を比較できます</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" onClick={loadPreset} className="flex-1 h-9 text-xs font-bold shadow-sm">
                      前回の設定を復元
                    </Button>
                    <Button variant="outline" size="sm" onClick={savePreset} className="flex-1 h-9 text-xs font-bold text-primary bg-primary/5 border-primary/20 shadow-sm">
                      今の設定を保存
                    </Button>
                  </div>
                </div>
                
                {/* 最初の画像（プレビュー対象）が存在する場合、手書きモザイクボタンを表示 */}
                <div className="flex justify-center -mt-2 mb-2 relative z-20">
                  <Button 
                    onClick={() => setEditingImageId(images[0].id)}
                    className="h-12 px-8 rounded-full shadow-2xl shadow-primary/30 border-2 border-white/10 gap-3 font-black text-[15px] hover:scale-105 transition-transform"
                  >
                    <Brush className="w-5 h-5" />
                    この画像に手書きモザイクを入れる
                  </Button>
                </div>

                <div className="relative aspect-video rounded-[2rem] overflow-hidden border-4 border-white dark:border-zinc-800 shadow-2xl shadow-primary/5 bg-muted/40 group">
                  <img src={previewOriginalUrl || ''} className="absolute inset-0 w-full h-full object-contain" alt="加工前" />
                  <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ clipPath: 'inset(0 0 0 var(--slider-pos, 50%))' }}>
                    <img src={previewUrl} className="absolute inset-0 w-full h-full object-contain" alt="加工後" />
                  </div>
                  <input 
                    type="range" min="0" max="100" defaultValue="50" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20 focus-visible:opacity-10 focus-visible:bg-primary/20 transition-opacity outline-none"
                    onInput={(e) => e.currentTarget.parentElement?.style.setProperty('--slider-pos', `${e.currentTarget.value}%`)} 
                    aria-label="比較スライダー。左右の矢印キーで動かして加工前後を比較できます。"
                  />
                  <div className="absolute inset-y-0 w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10 pointer-events-none" style={{ left: 'var(--slider-pos, 50%)' }}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-zinc-900 rounded-full shadow-2xl flex items-center justify-center border-4 border-primary/20 transform transition-transform group-hover:scale-110">
                      <ChevronLeft className="w-4 h-4 text-primary -mr-1" />
                      <ChevronRight className="w-4 h-4 text-primary -ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between pointer-events-none px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-black uppercase px-2 py-1 rounded">Before</span>
                    <span className="bg-primary text-white text-[10px] font-black uppercase px-2 py-1 rounded">After</span>
                  </div>
                </div>
              </motion.section>
            )}

            <section className="space-y-6">
              <DropZone onFilesAdded={handleFilesAdded} />
            </section>

            <section className="space-y-6">
              <div className="flex justify-between items-center px-4">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">変換リスト</h2>
                {images.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive hover:bg-destructive/10 text-xs font-bold h-9 px-3">
                    <Trash2 className="w-4 h-4 mr-2" /> リストを空にする
                  </Button>
                )}
              </div>
              <ImageList 
                images={images} 
                onRemove={removeImage} 
                onEdit={(id) => setEditingImageId(id)}
                renamePattern={settings.renamePattern} 
              />
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <ConversionSettings settings={settings} updateSettings={updateSetting} onReset={resetSettings} />

            <div className="sticky bottom-4 lg:relative flex flex-col gap-4 p-5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-[2rem] border shadow-2xl lg:shadow-none lg:bg-transparent lg:border-none lg:p-0 z-40">
              <Button 
                className="w-full h-14 md:h-16 text-lg font-black gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-transform" 
                size="lg" 
                disabled={images.length === 0 || isProcessing} 
                onClick={processImages}
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center w-full gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="font-black">処理中 ({images.filter(i => i.status === 'completed').length}/{images.length})</span>
                    </div>
                    <div className="w-full max-w-[200px] h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-white" 
                        initial={{ width: 0 }}
                        animate={{ width: `${(images.filter(i => i.status === 'completed').length / images.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <><Play className="w-6 h-6 fill-current" /> 一括変換を開始</>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-14 md:h-16 text-lg font-black gap-3 border-2 hover:bg-muted" 
                size="lg" 
                disabled={images.length === 0 || !images.some(img => img.result) || isProcessing} 
                onClick={downloadAll}
              >
                <Download className="w-6 h-6" /> ZIP一括保存
              </Button>
            </div>
          </div>
        </div>

        {/* Improved SEO & Privacy Text Section */}
        <div className="mt-24 pt-20 border-t border-muted/50 space-y-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-6">
              <h2 className="text-3xl font-black tracking-tight">プライバシー第一の画像処理</h2>
              <p className="text-base text-muted-foreground leading-relaxed font-medium">
                あなたの画像データがサーバーへ送られることはありません。すべての計算処理は、今お使いのブラウザ内（デバイスのメモリ上）だけで安全に実行されます。
                軍事レベルの機密画像でも、安心してご利用いただけます。
              </p>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-black tracking-tight">WebP / AVIF 完全対応</h2>
              <p className="text-base text-muted-foreground leading-relaxed font-medium">
                最新の画像圧縮技術（WebP, AVIF）を駆使し、画質を極限まで保ちつつファイルサイズを軽量化します。
                完全なオフライン（機内モードなど）でも動作するため、通信環境を問いません。
              </p>
            </div>
          </div>

          <div className="bg-primary/5 rounded-[2.5rem] p-10 md:p-14 border border-primary/10">
            <h3 className="text-lg font-black mb-10 text-center uppercase tracking-widest text-primary/60">One-click Pro Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
              <div>
                <div className="font-black text-primary text-2xl mb-1">連番</div>
                <p className="text-xs uppercase tracking-widest font-bold opacity-40 italic">Smart Rename</p>
              </div>
              <div>
                <div className="font-black text-primary text-2xl mb-1">合成</div>
                <p className="text-xs uppercase tracking-widest font-bold opacity-40 italic">Brand Overlay</p>
              </div>
              <div>
                <div className="font-black text-primary text-2xl mb-1">角丸</div>
                <p className="text-xs uppercase tracking-widest font-bold opacity-40 italic">Modern Edit</p>
              </div>
              <div>
                <div className="font-black text-primary text-2xl mb-1">保護</div>
                <p className="text-xs uppercase tracking-widest font-bold opacity-40 italic">Privacy First</p>
              </div>
            </div>
          </div>

          {/* Advice & Cautions Section */}
          <div className="mt-24 space-y-12">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-muted" />
              <h2 className="text-2xl font-black tracking-tight px-4 whitespace-nowrap">本アプリの制約と注意事項</h2>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-muted" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-muted/60 shadow-sm hover:shadow-md transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-amber-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                  </div>
                  <h3 className="font-bold text-base leading-tight">真のローカル処理の保証</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  見た目上はローカルで処理されていますが、裏で送信していないことを証明するのは難しく、完全な信頼は実装に依存します。
                </p>
              </div>

              <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-muted/60 shadow-sm hover:shadow-md transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-red-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                    <ShieldAlert className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="font-bold text-base leading-tight">開発者依存のセキュリティ</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  プラットフォーム（Vercel等）自体の安全性とは別に、アプリの実装次第で脆弱性が存在する可能性がある点にご留意ください。
                </p>
              </div>

              <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-muted/60 shadow-sm hover:shadow-md transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                    <Globe className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="font-bold text-base leading-tight">アクセス情報の取得</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  IPアドレスやブラウザ情報などは、通常のウェブ通信の一部としてログや分析ツールによって記録される可能性があります。
                </p>
              </div>

              <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-muted/60 shadow-sm hover:shadow-md transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-zinc-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                    <Wrench className="w-6 h-6 text-zinc-500" />
                  </div>
                  <h3 className="font-bold text-base leading-tight">機能の限定性</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  簡易的な変換・最適化が目的です。Adobe Photoshopのような高度な画像編集や大規模なバッチ処理には不向きです。
                </p>
              </div>

              <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-muted/60 shadow-sm hover:shadow-md transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                    <WifiOff className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="font-bold text-base leading-tight">ネットワークへの依存</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  完全なオフライン対応ではありません。初回ロードや継続的な利用にはインターネット接続が必要になる場合があります。
                </p>
              </div>

              <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-muted/60 shadow-sm hover:shadow-md transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                    <History className="w-6 h-6 text-indigo-500" />
                  </div>
                  <h3 className="font-bold text-base leading-tight">サービス継続性の不安</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  個人開発プロジェクトのため、予告なくサービスが終了したり、更新が停止したりするリスクがあることを承知おきください。
                </p>
              </div>

              <div className="p-8 bg-white dark:bg-zinc-900 lg:col-span-3 rounded-[2.5rem] border border-muted/60 shadow-sm hover:shadow-md transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-purple-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                    <Activity className="w-6 h-6 text-purple-500" />
                  </div>
                  <h3 className="font-bold text-base leading-tight">セキュリティ対策の限界</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  セキュリティヘッダーの不足やライブラリの脆弱性など、セキュリティ対策が完全ではない可能性があります。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t py-16 mt-20 bg-muted/5">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-10">
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-sm font-bold text-muted-foreground">
            <Link href="/guide" className="hover:text-primary transition-colors">ご利用ガイド</Link>
            <Link href="/updates" className="hover:text-primary transition-colors text-primary italic">アップデート・不具合報告</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">プライバシーポリシー</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">利用規約</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">お問い合わせ</Link>
          </div>
          <div className="space-y-4">
            <div className="flex justify-center gap-2 scale-75 opacity-20 hover:opacity-100 transition-opacity">
              <div className="bg-zinc-400 w-2 h-2 rounded-full" />
              <div className="bg-zinc-400 w-2 h-2 rounded-full" />
              <div className="bg-zinc-400 w-2 h-2 rounded-full" />
            </div>
            <p className="text-xs text-muted-foreground/60 max-w-sm mx-auto leading-relaxed font-medium">
              © 2026 Privacy Image Processor. Made for professionals who value data sovereignty.
            </p>
          </div>
        </div>
      </footer>

      {/* Manual Editor Modal */}
      <AnimatePresence>
        {editingImage && (
          <ManualEditor 
            image={editingImage} 
            onSave={updateMask} 
            onClose={() => setEditingImageId(null)} 
          />
        )}
      </AnimatePresence>
    </main>
  );
}
