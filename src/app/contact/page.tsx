'use client';

import React, { useState } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // ユーザー提供の Formspree ID
    const response = await fetch("https://formspree.io/f/mjgjrber", {
      method: "POST",
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      setSubmitted(true);
      toast.success('お問い合わせを送信しました');
    } else {
      toast.error('送信に失敗しました。後でもう一度お試しください。');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-6">
      <div className="max-w-xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
          <ArrowLeft className="w-4 h-4" /> ツールに戻る
        </Link>
        
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-primary/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">お問い合わせ</h1>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">お名前</Label>
                <Input id="name" name="name" placeholder="山田 太郎" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">返信先メールアドレス</Label>
                <Input id="email" name="email" type="email" placeholder="example@mail.com" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">メッセージ</Label>
                <textarea 
                  id="message" 
                  name="message"
                  required
                  className="w-full min-h-[150px] rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="ご意見、ご要望、不具合報告などをご記入ください"
                />
              </div>

              <Button type="submit" className="w-full h-12 text-lg font-bold gap-2">
                <Send className="w-4 h-4" /> メッセージを送信
              </Button>
              <p className="text-[11px] text-zinc-400 text-center">
                ※送信内容はSSLにより暗号化されます。
              </p>
            </form>
          ) : (
            <div className="py-12 text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">送信完了</h2>
              <p className="text-muted-foreground">
                お問い合わせありがとうございます。いただいた内容は確認の上、必要に応じて返信させていただきます。
              </p>
              <div className="pt-6">
                <Link href="/">
                  <Button variant="outline">トップへ戻る</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
