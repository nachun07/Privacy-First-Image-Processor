import React from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
          <ArrowLeft className="w-4 h-4" /> ツールに戻る
        </Link>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-primary/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">プライバシーポリシー</h1>
          </div>

          <div className="prose prose-zinc max-w-none space-y-6 text-zinc-600 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-900">1. 基本方針</h2>
              <p>
                本サービス「Privacy Image Processor」は、ユーザーのプライバシー保護を最優先事項として設計されています。
                最大の特徴は、「画像データをいかなるサーバーにも送信しない」ことにあります。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-900">2. データの処理について</h2>
              <p>
                本サービスでアップロード、加工、ダウンロードされるすべての画像データは、ユーザーのブラウザメモリ（クライアントサイド）内でのみ処理されます。
                当方がユーザーの画像の内容を閲覧、収集、保存、または第三者に提供することは技術的に不可能です。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-900">3. 運営とデータ収集について</h2>
              <p>
                本サービスは完全無料で提供されており、広告の掲載やユーザーデータの販売による収益化は一切行っておりません。
              </p>
              <p>
                ただし、ウェブサービスの提供にあたり、以下の最小限の情報が収集される場合があります：
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>技術的ログ:</strong> ホスティングプラットフォーム（Vercel）の仕様により、アクセス時のIPアドレス、ブラウザ情報、アクセス日時などがサーバーログとして記録されます。これはサービスの運営とセキュリティ確保のために標準的に行われるものです。</li>
                <li><strong>Cookieの使用:</strong> ユーザーの同意状態の管理（同意バナーの表示制御）や設定の保存のために、ブラウザのCookieやローカルストレージを使用する場合があります。これらは個人の追跡や広告目的には使用されません。</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-900">4. 第三者サービス</h2>
              <p>
                本サービスはホスティングに Vercel を使用しています。Vercelによって収集される情報の取り扱いについては、Vercelのプライバシーポリシーをご確認ください。解析ツール等を使用する場合も、プライバシーを最大限尊重し、個人を特定しない形での利用に限定します。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-900">5. 免責事項</h2>
              <p>
                本サービスは現状有姿で提供されます。画像処理の結果生じたいかなる損害についても、当方は責任を負いかねます。
                重要なデータのバックアップは、ユーザーご自身の責任で行ってください。
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
