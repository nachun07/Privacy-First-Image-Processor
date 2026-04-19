'use client';

import React from 'react';
import { 
  History, Bug, CheckCircle2, AlertCircle, ArrowLeft, 
  Calendar, Zap, ShieldCheck, Heart
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function Updates() {
  const updates = [
    {
      date: '2026.04.19',
      version: 'v1.4.0',
      tag: 'Critical Fix',
      title: '画像処理の精度向上・ランタイムエラーの完全解消',
      items: [
        '「角を丸くする」機能のロジックを刷新し、プレビューと保存結果の不一致を解消。',
        'リサイズ機能を「最大サイズ制限」から「指定幅へのリサイズ（拡大・縮小）」に変更。',
        '数値を消した際に自動で0が入る挙動を改善。空欄での「元のサイズ」維持をサポート。',
        '初期化時や特定のブラウザ環境で発生していた split() 関数によるエラーを完全にガード。'
      ]
    },
    {
      date: '2026.04.18',
      version: 'v1.3.0',
      tag: 'New Features',
      title: 'アクセシビリティ（ユニバーサルデザイン）への対応',
      items: [
        '画面全体のフォントサイズを 12px 以上に引き上げ、視認性を大幅に向上。',
        'キーボード操作（Tab, Enter, 矢印キー）のみで全機能が操作できるように改良。',
        'スクリーンリーダー向けに aria-label を全コンポーネントに付与。',
        'リネーム後にどういう名前になるか、リスト上でリアルタイムにプレビューする機能を追加。'
      ]
    },
    {
      date: '2026.04.17',
      version: 'v1.2.0',
      tag: 'Enhancement',
      title: 'プライバシー保護とご利用ガイドの充実',
      items: [
        '「使い方ガイド」をプレミアムなデザインにリニューアルし、プロ向け機能の解説を追加。',
        'EXIFデータの削除オプションを明文化し、プライバシー保護の透明性を強化。',
        'ダークモード・ライトモードの切り替え挙動をより滑らかに最適化。'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <nav className="border-b bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm">ツールに戻る</span>
          </Link>
          <div className="flex items-center gap-2 font-black text-primary">
            <History className="w-5 h-5" />
            <span>UPDATES</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 space-y-16">
        <header className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
            Updates & <span className="text-primary">Bug Reports</span>
          </h1>
          <p className="text-muted-foreground font-medium leading-relaxed max-w-2xl">
            Privacy Image Processor は、ユーザーの皆様からのフィードバックを元に日々進化しています。
            最新の修正状況や、実施された機能改善についてご確認いただけます。
          </p>
        </header>

        {/* Bug Report Section */}
        <section className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 md:p-10 border shadow-sm border-primary/20 bg-gradient-to-br from-white to-primary/5 dark:from-zinc-900 dark:to-primary/5">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="p-6 bg-primary/10 rounded-full">
              <Bug className="w-12 h-12 text-primary" />
            </div>
            <div className="space-y-4 flex-1 text-center md:text-left">
              <h2 className="text-2xl font-black">不具合を見つけましたか？</h2>
              <p className="text-sm text-muted-foreground font-medium">
                もし動作が不安定だったり、要望がある場合は、お気軽にお問い合わせください。
                お送りいただいたフィードバックは、原則として24時間以内に確認し、改善へと繋げます。
              </p>
              <Link href="/contact" className="inline-block">
                <Button className="rounded-full px-8 font-black gap-2 h-12 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                  <Zap className="w-4 h-4 fill-current" /> 不具合を報告する
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="space-y-10">
          <h2 className="text-2xl font-black flex items-center gap-3 px-2">
            <Calendar className="w-6 h-6 text-primary" />
            更新履歴
          </h2>
          
          <div className="space-y-8">
            {updates.map((update, idx) => (
              <motion.div 
                key={update.version}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative pl-8 md:pl-12 pb-12 last:pb-0 group"
              >
                {/* Connector Line */}
                {idx !== updates.length - 1 && (
                  <div className="absolute left-[3px] md:left-[11px] top-6 bottom-0 w-[2px] bg-muted group-hover:bg-primary/20 transition-colors" />
                )}
                
                {/* Timeline Dot */}
                <div className="absolute left-0 md:left-2 top-2 w-2 h-2 rounded-full bg-primary ring-4 ring-primary/10 group-hover:scale-150 transition-transform" />
                
                <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-[1.5rem] border shadow-sm hover:shadow-md transition-shadow space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-black text-primary px-3 py-1 bg-primary/10 rounded-full tracking-widest uppercase">
                      {update.tag}
                    </span>
                    <span className="text-sm font-bold text-muted-foreground">{update.date}</span>
                    <span className="text-sm font-black italic text-zinc-400">{update.version}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight">{update.title}</h3>
                  <ul className="space-y-2">
                    {update.items.map((item, i) => (
                      <li key={i} className="flex gap-3 text-sm font-medium text-muted-foreground leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Status Check UI */}
        <section className="bg-zinc-100 dark:bg-zinc-900/50 rounded-[2rem] p-8 md:p-12 text-center space-y-6 border border-dashed border-muted-foreground/20">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground bg-muted px-4 py-2 rounded-full">
            <ShieldCheck className="w-4 h-4" /> System Health
          </div>
          <h2 className="text-2xl font-black italic">100% Client-side Infrastructure</h2>
          <p className="text-sm text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
            システムはすべてお使いのブラウザ上で独立して動作しています。
            外部サーバーのダウンタイムや、データの流出リスクから完全に解放されています。
          </p>
          <div className="flex justify-center gap-12 pt-4">
            <div className="space-y-1">
              <div className="text-2xl font-black text-emerald-500">Stable</div>
              <div className="text-[10px] font-black text-muted-foreground uppercase">Processing</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-emerald-500">Secure</div>
              <div className="text-[10px] font-black text-muted-foreground uppercase">Privacy</div>
            </div>
          </div>
        </section>
      </div>

      <footer className="py-16 text-center space-y-6">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Heart className="w-4 h-4 fill-current" />
          <span className="text-xs font-bold tracking-widest uppercase">Thank you for using</span>
        </div>
        <p className="text-xs text-muted-foreground/60 font-medium">
          © 2026 Privacy Image Processor. Always Improving.
        </p>
      </footer>
    </div>
  );
}
