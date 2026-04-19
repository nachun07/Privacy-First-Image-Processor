'use client';

import React from 'react';
import { 
  ArrowLeft, MousePointer2, Settings, Download, ShieldCheck, 
  ImageIcon, Smartphone, Zap, CheckCircle2, HelpCircle,
  Sparkles, Layers, FileEdit, Monitor
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function Guide() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors selection:bg-primary/20">
      {/* Dynamic Background Ornament */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-20 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <nav className="border-b bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3 transition-transform active:scale-95">
            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm tracking-tight">ツールに戻る</span>
          </Link>
          <div className="flex items-center gap-2 text-primary font-black italic text-xl">
             GUIDE
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16 md:py-28 relative z-10 space-y-24 md:space-y-32">
        {/* Hero Section */}
        <motion.header 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Ultimate Manual
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1]">
            もっと自由に。<br />
            もっと安全に。
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg md:text-xl font-medium leading-relaxed">
            Privacy Image Processor を使いこなして、<br className="hidden md:block" />
            あなたの画像処理ワークフローを劇的に進化させましょう。
          </p>
        </motion.header>

        {/* Steps Grid */}
        <section className="space-y-12">
          <div className="flex flex-col items-center text-center space-y-3">
             <h2 className="text-3xl font-black tracking-tight">基本のマスター</h2>
             <div className="h-1.5 w-12 bg-primary rounded-full" />
          </div>
          
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
          >
            <StepCard 
              variants={item}
              number="01" 
              icon={<MousePointer2 />} 
              title="自由に追加" 
              description="画像を画面の中央へドラッグ＆ドロップ。1枚でも、100枚でも、あなたの好きなだけ追加できます。"
              color="bg-blue-500"
            />
            <StepCard 
              variants={item}
              number="02" 
              icon={<Settings />} 
              title="直感的に加工" 
              description="フォーマットの選択から、明るさの調整、ロゴ入れまで。設定パネルで理想の形に整えましょう。"
              color="bg-purple-500"
            />
            <StepCard 
              variants={item}
              number="03" 
              icon={<Download />} 
              title="一瞬で保存" 
              description="「一括変換を開始」をクリック。処理が終われば、ZIPにまとめてあなたの元へ届けます。"
              color="bg-emerald-500"
            />
          </motion.div>
        </section>

        {/* Pro Features Showcase */}
        <section className="space-y-16">
          <div className="flex flex-col items-center text-center space-y-3">
             <h2 className="text-3xl font-black tracking-tight">プロのための高度な機能</h2>
             <p className="text-muted-foreground text-sm">ただ変換するだけではありません。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 p-8 md:p-12 rounded-[2.5rem] space-y-6">
              <div className="bg-yellow-500/10 w-14 h-14 rounded-2xl flex items-center justify-center text-yellow-600">
                <Monitor className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black italic underline decoration-yellow-500/30 decoration-8 underline-offset-[-2px]">Live Preview System</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">
                中央のスライダーを動かせば、加工前後の違いをリアルタイムで確認できます。WebPやAVIFの圧縮効果を目で見て確かめてください。
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 p-8 md:p-12 rounded-[2.5rem] space-y-6">
              <div className="bg-blue-500/10 w-14 h-14 rounded-2xl flex items-center justify-center text-blue-600">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black italic underline decoration-blue-500/30 decoration-8 underline-offset-[-2px]">Smart Backgrounds</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">
                縦横比を変える際、余ったスペースを背景として「ぼかして埋める」ことができます。SNS投稿を一段上のクオリティへ。
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 p-8 md:p-12 rounded-[2.5rem] space-y-6">
              <div className="bg-green-500/10 w-14 h-14 rounded-2xl flex items-center justify-center text-green-600">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black italic underline decoration-green-500/30 decoration-8 underline-offset-[-2px]">Brand Protection</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">
                自身のロゴやコピーライトを全ての画像に一括挿入。透かしの透明度や位置も自由にカスタマイズ可能です。
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 p-8 md:p-12 rounded-[2.5rem] space-y-6">
              <div className="bg-zinc-500/10 w-14 h-14 rounded-2xl flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                <FileEdit className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black italic underline decoration-zinc-500/30 decoration-8 underline-offset-[-2px]">Automated Naming</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">
                「##」を使った連番入力などで、大量のファイルにルール通りの名前を一瞬で付けられます。手作業の苦労をゼロに。
              </p>
            </motion.div>
          </div>
        </section>

        {/* Why Secure Section */}
        <section className="bg-primary p-1 md:p-1 rounded-[3rem] shadow-2xl shadow-primary/20">
          <div className="bg-white dark:bg-zinc-900 rounded-[2.8rem] p-10 md:p-20 space-y-12">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight">徹底した「オフライン主義」</h2>
              <p className="text-xl text-primary font-bold">なぜ、あなたの画像は100%安全なのか？</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  このツールには「画像を預かるサーバー」が存在しません。全ての変換プログラム、全ての編集ロジックは、今あなたが使っている**お使いの端末（PCやスマホ）の中でだけ**動いています。
                </p>
                <div className="flex items-start gap-4 bg-primary/5 p-6 rounded-[2rem] border border-primary/10">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <p className="text-md font-black italic">
                    たとえ機内モードにしてネットを切断しても、このツールは普段通り動き続けます。
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-110" />
                  <div className="relative bg-primary text-white p-12 rounded-full shadow-2xl">
                    <ShieldCheck className="w-20 h-20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center pb-20 space-y-8"
        >
          <p className="text-muted-foreground font-bold">準備はよろしいですか？</p>
          <Link href="/">
            <Button size="lg" className="px-16 h-18 rounded-full font-black text-xl shadow-2xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
              今すぐ使ってみる
            </Button>
          </Link>
        </motion.div>
      </div>

      <footer className="border-t py-16 bg-zinc-50 dark:bg-zinc-900/30">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
           <div className="flex justify-center gap-6">
             <Link href="/privacy" className="text-sm font-bold text-muted-foreground hover:text-primary">プライバシー</Link>
             <Link href="/terms" className="text-sm font-bold text-muted-foreground hover:text-primary">利用規約</Link>
             <Link href="/contact" className="text-sm font-bold text-muted-foreground hover:text-primary">お問い合わせ</Link>
           </div>
          <p className="text-xs text-muted-foreground font-medium opacity-50">
            © 2026 Privacy Image Processor. 100% Private, 100% Client-side.
          </p>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ number, icon, title, description, color, variants }: { number: string; icon: React.ReactNode; title: string, description: string, color: string, variants: any }) {
  return (
    <motion.div variants={variants} className="group relative p-10 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden">
      <div className={cn("absolute top-[-20%] right-[-10%] w-[50%] h-[50%] blur-3xl opacity-[0.03] transition-opacity group-hover:opacity-[0.1]", color)} />
      <div className="relative z-10 space-y-6">
        <div className="flex justify-between items-start">
          <div className={cn("inline-flex items-center justify-center p-4 rounded-2xl text-white shadow-lg", color)}>
             {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
          </div>
          <div className="text-5xl font-black text-muted-foreground/10 italic select-none">{number}</div>
        </div>
        <div className="space-y-3">
          <h3 className="font-black text-2xl tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
