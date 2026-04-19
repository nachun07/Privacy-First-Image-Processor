import React from 'react';
import { ScrollText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
          <ArrowLeft className="w-4 h-4" /> ツールに戻る
        </Link>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-primary/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <ScrollText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">利用規約</h1>
          </div>

          <div className="prose prose-zinc max-w-none space-y-6 text-zinc-600 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-900">1. はじめに</h2>
              <p>
                本利用規約は、「Privacy Image Processor」（以下「本サービス」）の利用条件を定めるものです。
                ユーザーは本サービスを利用することで、本規約に同意したものとみなされます。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-900">2. サービスの提供</h2>
              <p>
                本サービスは、画像の圧縮、フォーマット変換、加工、ウォーターマーク付与等の機能をブラウザ上で提供します。
                すべての処理はユーザーのデバイス上で行われ、画像データがサーバーに送信されることはありません。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-900">3. 禁止事項</h2>
              <p>
                ユーザーは本サービスを利用して、以下の行為を行ってはなりません。
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>法令または公序良俗に違反する行為。</li>
                <li>本サービスのサーバーやネットワーク機能を破壊または妨害する行為。</li>
                <li>本サービスの運営を妨害するおそれのある行為。</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-900">4. 免責事項</h2>
              <p>
                本サービスを用いて加工された画像の結果について、当方は一切の責任を負いません。
                また、本サービスの利用により生じたいかなる損害についても、当方は免責されるものとします。
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
