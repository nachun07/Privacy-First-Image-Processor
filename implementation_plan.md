# 実装計画: Privacy-First Image Processor

## 1. プロジェクト構成
- **フレームワーク**: Next.js 14+ (App Router, TypeScript)
- **スタイリング**: Tailwind CSS, shadcn/ui, Framer Motion
- **ライブラリ**: 
  - `browser-image-compression`: 画像の圧縮とWebP変換
  - `jszip`: 複数画像の一括ダウンロード用ZIP生成
  - `lucide-react`: アイコン
- **インフラ**: Vercel (Static Export対応)

## 2. ディレクトリ構成
```text
src/
├── app/
│   ├── layout.tsx         # 全体レイアウト、フォント設定
│   ├── page.tsx           # メインの画像処理UI
│   └── globals.css        # カスタムスタイル
├── components/
│   ├── ui/                # shadcn/ui コンポーネント
│   ├── image-processor/   # 独自コンポーネント
│   │   ├── drop-zone.tsx  # ドラッグ&ドロップエリア
│   │   ├── settings.tsx   # 変換設定
│   │   └── image-list.tsx # 画像プレビューリスト
├── lib/
│   ├── utils.ts           # tailwind-merge 等のユーティリティ
│   └── image-utils.ts     # 画像処理ロジック
```

## 3. 主要ロジック
- **画像入力**: `input[type="file"]` または `drag & drop` で `File` オブジェクトを取得。
- **プレビュー生成**: `URL.createObjectURL` を使用してローカルプレビューを表示。
- **画像変換**: `browser-image-compression` を Worker モードで呼び出し、非同期プロセスで WebP 変換とリサイズを実行。
- **一括出力**: `JSZip` インスタンスに変換後の Blob を追加し、ZIPファイルを生成・ダウンロード。

## 4. デザインコンセプト
- **クリーン & モダン**: 白/ダークグレーを基調とした、清潔感のあるツールデザイン。
- **インタラクティブ**: ドラッグ時の視覚効果、処理中のプログレスバー表示、マイクロインタラクション。
- **レジリエンス**: ネットワークオフラインでも動作可能（完全クライアントサイド）。
