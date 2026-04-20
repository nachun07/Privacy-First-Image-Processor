'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';
import { Button } from './button';
import Link from 'next/link';

export function CookieConsent() {
  const [show, setShow] = useState(false);
  const [view, setView] = useState<'banner' | 'settings'>('banner');
  const [essential, setEssential] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (level: 'all' | 'essential') => {
    localStorage.setItem('cookie-consent', level);
    // ここで必要に応じてアナリティクスの初期化/停止を切り替える
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:max-w-md z-[100]"
        >
          <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-2 border-primary/10 shadow-2xl p-6 md:p-8 rounded-[2.5rem] space-y-6">
            {view === 'banner' ? (
              <>
                <div className="flex items-start gap-4">
                  <div className="bg-primary p-2.5 rounded-2xl text-white shadow-lg shadow-primary/20 mt-1 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5 overflow-hidden">
                    <h3 className="font-black text-sm tracking-tight">プライバシー設定</h3>
                    <p className="text-[11px] md:text-sm text-muted-foreground leading-relaxed font-medium">
                      当サイトでは、サービスの提供や品質向上のためにCookie等を使用します。設定から詳細を選択できます。
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    size="sm" 
                    onClick={() => saveConsent('all')} 
                    className="w-full rounded-[1.2rem] font-black text-xs h-11 shadow-lg shadow-primary/20"
                  >
                    すべて許可する
                  </Button>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      size="sm" 
                      onClick={() => saveConsent('essential')} 
                      className="flex-1 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest h-11 border-2"
                    >
                      許可しない
                    </Button>
                    <Button 
                      variant="ghost"
                      size="sm" 
                      onClick={() => setView('settings')}
                      className="flex-1 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest h-11"
                    >
                      詳細設定
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-base tracking-tight">詳細設定</h3>
                  <button onClick={() => setView('banner')} className="text-xs font-bold text-primary hover:underline">戻る</button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                    <div className="space-y-1">
                      <div className="text-xs font-black">必須のCookie</div>
                      <div className="text-[10px] text-muted-foreground font-medium">設定保存や動作に不可欠です（常に有効）</div>
                    </div>
                    <div className="w-4 h-4 bg-primary rounded-full" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                    <div className="space-y-1">
                      <div className="text-xs font-black">分析用Cookie / ログ</div>
                      <div className="text-[10px] text-muted-foreground font-medium">トラフィックの分析と改善に使用します</div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={analytics} 
                      onChange={(e) => setAnalytics(e.target.checked)}
                      className="w-5 h-5 rounded-md accent-primary" 
                    />
                  </div>
                </div>
                
                <Button 
                  size="sm" 
                  onClick={() => saveConsent(analytics ? 'all' : 'essential')} 
                  className="w-full rounded-[1.2rem] font-black text-xs h-11 shadow-lg shadow-primary/20"
                >
                  設定を保存して閉じる
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
