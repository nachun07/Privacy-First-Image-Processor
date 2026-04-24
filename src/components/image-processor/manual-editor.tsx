'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Undo, Eraser, MousePointer2, Brush, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ImageItem } from './image-list';

interface ManualEditorProps {
  image: ImageItem;
  onSave: (id: string, maskData: string, mosaicLevel: number) => void;
  onClose: () => void;
}

export const ManualEditor: React.FC<ManualEditorProps> = ({ image, onSave, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const brushCanvasRef = useRef<HTMLCanvasElement>(null);
  const mosaicCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [brushSize, setBrushSize] = useState(40);
  const [mosaicLevel, setMosaicLevel] = useState(image.mosaicLevel || 25);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // モザイク用の下地画像を生成する
  useEffect(() => {
    const mCanvas = mosaicCanvasRef.current;
    if (!mCanvas) return;
    const ctx = mCanvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      mCanvas.width = img.width;
      mCanvas.height = img.height;
      const mScale = 1 / Math.max(1, mosaicLevel);
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = Math.max(1, img.width * mScale);
      tempCanvas.height = Math.max(1, img.height * mScale);
      const tCtx = tempCanvas.getContext('2d');
      if (tCtx) {
        tCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, mCanvas.width, mCanvas.height);
      }
    };
    img.src = image.preview;
  }, [image.preview, mosaicLevel]);

  useEffect(() => {
    const canvas = brushCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (image.maskData) {
        const maskImg = new Image();
        maskImg.onload = () => ctx.drawImage(maskImg, 0, 0);
        maskImg.src = image.maskData;
      }
    };
    img.src = image.preview;

    // 防止スクロール
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [image.preview, image.maskData]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = brushCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // キャンバス表示サイズと内部ピクセルサイズの比率を計算
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    setHasChanges(true);
    const ctx = brushCanvasRef.current?.getContext('2d');
    if (ctx) {
      const { x, y } = getCoordinates(e);
      ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = brushCanvasRef.current?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = brushCanvasRef.current?.getContext('2d');
    ctx?.beginPath();
  };

  const clearMask = () => {
    const canvas = brushCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasChanges(true);
    }
  };

  const handleSave = () => {
    const canvas = brushCanvasRef.current;
    if (canvas) {
      onSave(image.id, canvas.toDataURL(), mosaicLevel);
      onClose();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-0 md:p-8"
      onMouseUp={stopDrawing}
    >
      <div className="bg-zinc-900 border border-white/10 w-full max-w-5xl md:rounded-[3rem] overflow-hidden flex flex-col h-full md:h-[90vh] shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-4">
            <div className="bg-primary p-2 rounded-2xl">
              <Brush className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tighter">モザイク・ペンツール</h2>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Manual Redaction</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10">
            <X className="w-6 h-6 text-zinc-400" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center p-4">
          <div className="relative max-w-full max-h-full shadow-2xl" ref={containerRef}>
            {/* Background Image */}
            <img 
              src={image.preview} 
              className="max-w-full max-h-[60vh] object-contain select-none pointer-events-none" 
              alt="編集用" 
            />
            
            {/* Drawing Canvas (The Actual Mask) */}
            <canvas
              ref={brushCanvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="absolute inset-0 w-full h-full cursor-crosshair touch-none opacity-0"
            />

            {/* UI Overlay (Realtime Mosaic Preview) */}
            <canvas
              className="absolute inset-0 w-full h-full pointer-events-none"
              ref={(el) => {
                if (!el || !brushCanvasRef.current) return;
                const maskCanvas = brushCanvasRef.current;
                const ctx = el.getContext('2d');
                if (!ctx) return;
                
                let animationFrameId: number;
                const update = () => {
                  if (el.width !== maskCanvas.width) el.width = maskCanvas.width;
                  if (el.height !== maskCanvas.height) el.height = maskCanvas.height;
                  
                  ctx.clearRect(0, 0, el.width, el.height);
                  
                  // モザイク画像を取得
                  const mCanvas = mosaicCanvasRef.current;
                  if (mCanvas && mCanvas.width > 0) {
                    // マスク(黒い描画部分)を描く
                    ctx.drawImage(maskCanvas, 0, 0);
                    // マスクの部分にだけモザイク画像を上書き表示（destination-in）
                    ctx.globalCompositeOperation = 'source-in';
                    ctx.drawImage(mCanvas, 0, 0, el.width, el.height);
                    ctx.globalCompositeOperation = 'source-over';
                  }

                  // 描画中やペンのプレビュー用に、うっすら赤いアウトラインを足すことも可能ですが、
                  // リアルタイムにモザイクが見えるので不要です。
                  
                  animationFrameId = requestAnimationFrame(update);
                };
                animationFrameId = requestAnimationFrame(update);
              }}
            />
            {/* 非表示のモザイク下地キャンバス */}
            <canvas ref={mosaicCanvasRef} className="hidden" />
          </div>
          
          <div className="absolute bottom-6 flex flex-col md:flex-row items-center gap-4 px-8 py-4 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest min-w-16">ペンの太さ</span>
              <input 
                type="range" min="10" max="150" value={brushSize} 
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-24 md:w-32 accent-primary"
              />
            </div>
            <div className="hidden md:block w-px h-8 bg-white/10" />
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-zinc-500 min-w-16 uppercase tracking-widest whitespace-nowrap">隠す強さ</span>
              <input 
                type="range" min="5" max="100" value={mosaicLevel} 
                onChange={(e) => setMosaicLevel(parseInt(e.target.value))}
                className="w-24 md:w-32 accent-primary"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 bg-zinc-950 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Button 
              variant={!isErasing ? "default" : "outline"}
              onClick={() => setIsErasing(false)}
              className={`rounded-2xl gap-2 font-bold ${!isErasing ? 'text-white' : ''}`}
            >
              <Brush className="w-4 h-4" /> ペン
            </Button>
            <Button 
              variant={isErasing ? "default" : "outline"}
              onClick={() => setIsErasing(true)}
              className={`rounded-2xl gap-2 font-bold ${isErasing ? 'text-white' : ''}`}
            >
              <Eraser className="w-4 h-4" /> 消しゴム
            </Button>
            <Button 
              variant="destructive"
              onClick={clearMask}
              className="rounded-2xl gap-2 font-bold bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white"
            >
              <Trash2 className="w-4 h-4" /> 全消去
            </Button>
          </div>
          
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} className="rounded-2xl font-bold text-zinc-400">キャンセル</Button>
            <Button onClick={handleSave} className="rounded-2xl gap-2 font-black px-8 h-12 shadow-xl shadow-primary/20">
              <Save className="w-4 h-4" /> 編集を保存して閉じる
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
