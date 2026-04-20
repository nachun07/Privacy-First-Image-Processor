import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Toaster } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/ui/cookie-consent";

export const metadata: Metadata = {
  title: 'Privacy Image Processor | 完全無料のブラウザ完結型画像加工ツール',
  description: '画像データを一切サーバーに送信しない、プライバシー重視の画像加工アプリ。WebP/AVIF変換、一括リサイズ、ロゴ合成、角丸加工などがブラウザ内ですべて完結。',
  keywords: ['画像加工', '画像圧縮', 'プライバシー', 'WebP変換', 'AVIF変換', 'リサイズ', '無料ツール', 'クライアントサイド'],
  authors: [{ name: 'Privacy Image Processor Team' }],
  openGraph: {
    title: 'Privacy Image Processor | 完全無料・サーバー送信なしの画像加工',
    description: 'あなたの画像を守る。すべての処理はブラウザ内で。',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Image Processor',
    description: '完全無料でセキュアな画像加工。WebP/AVIF対応。',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-right" closeButton richColors />
        <CookieConsent />
      </body>
    </html>
  );
}
