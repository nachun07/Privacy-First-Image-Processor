import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
          <ArrowLeft className="w-4 h-4" /> ツールに戻る
        </Link>
        
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-primary/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">利用規約</h1>
          </div>

          <div className="prose prose-zinc max-w-none space-y-6 text-zinc-600 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-900">1. 利用条件</h2>
              <p>
                本サービスは商用・非商用を問わず、どなたでも無料でご利用いただけます。
                大量の画像をブラウザで処理するため、デバイスのスペックによっては動作が重くなる場合があります。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-900">2. 禁止事項</h2>
              <p>
                公序良俗に反する行為、または法令に違反する目的での本サービスの利用を禁止します。
                また、本サービスのサーバー（静的ファイルの配信元）に対して過度な負荷をかける攻撃的な行為も禁止します。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-900">3. サービスの変更・中断</h2>
              <p>
                当方は、事前の通知なく本サービスの内容を変更したり、提供を中断したりすることがあります。
                これによって生じたいかなる損害についても一切の責任を負いません。
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
