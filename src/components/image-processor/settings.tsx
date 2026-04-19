'use client';

import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Settings2, Zap, Type, Sun, Contrast, Droplets, FileType,
  Shield, Maximize, Move, Eye, Download, Square, FileEdit,
  Palette, ImageIcon, Layers, RefreshCcw, X, Info, CheckCircle2
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SettingsProps {
  settings: {
    quality: number;
    maxWidth: number;
    format: string;
    brightness: number;
    contrast: number;
    blur: number;
    grayscale: boolean;
    cornerRadius: number;
    aspectRatio: string;
    backgroundMode: string;
    backgroundColor: string;
    watermarkText: string;
    watermarkImage?: string;
    watermarkPosition: string;
    watermarkSize: number;
    watermarkOpacity: number;
    removeExif: boolean;
    autoDownload: boolean;
    renamePattern: string;
  };
  updateSettings: (key: string, value: any) => void;
  onReset: () => void;
}

export const ConversionSettings: React.FC<SettingsProps> = ({
  settings,
  updateSettings,
  onReset
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        updateSettings('watermarkImage', ev.target?.result);
        toast.success('ロゴ画像をアップロードしました');
      };
      reader.readAsDataURL(file);
    }
  };

  const getSliderValue = (v: number | readonly number[]) => Array.isArray(v) ? v[0] : v;

  return (
    <Card className="shadow-2xl border-primary/10 overflow-hidden bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-3xl">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-4 flex flex-row items-center justify-between border-b border-primary/5">
        <CardTitle className="text-lg flex items-center gap-2 font-bold">
          <Settings2 className="w-5 h-5 text-primary" />
          加工の設定
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onReset} className="h-8 text-[10px] gap-1.5 text-muted-foreground hover:text-primary transition-colors">
          <RefreshCcw className="w-3 h-3" />
          リセット
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <Accordion className="w-full" defaultValue={["basic"]}>

          {/* 保存形式の設定 */}
          <AccordionItem value="basic" className="px-5 border-b border-muted/50">
            <AccordionTrigger className="hover:no-underline py-5">
              <div className="flex items-center gap-3 text-left">
                <div className="bg-blue-500/10 p-2 rounded-xl text-blue-600">
                  <FileType className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">きれいに保存する</div>
                  <div className="text-[10px] text-muted-foreground font-normal">画質とファイル形式を選びます</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">画質（高いほど綺麗）</Label>
                  <span className="text-primary font-black text-sm">{settings.quality}%</span>
                </div>
                <Slider value={[settings.quality]} max={100} onValueChange={(v) => updateSettings('quality', getSliderValue(v))} className="py-2" />
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3" /> 80%前後がおすすめのバランスです
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">データの種類</Label>
                <ToggleGroup value={[settings.format]} onValueChange={(v: any) => v && updateSettings('format', Array.isArray(v) ? v[0] : v)} className="grid grid-cols-2 gap-2">
                  <ToggleGroupItem value="image/webp" className="w-full h-10 text-xs">WebP (おすすめ)</ToggleGroupItem>
                  <ToggleGroupItem value="image/avif" className="w-full h-10 text-xs">AVIF (最新・超軽量)</ToggleGroupItem>
                  <ToggleGroupItem value="image/jpeg" className="w-full h-10 text-xs">JPEG (標準的)</ToggleGroupItem>
                  <ToggleGroupItem value="image/png" className="w-full h-10 text-xs">PNG (高品質)</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 形を整える設定 */}
          <AccordionItem value="layout" className="px-5 border-b border-muted/50">
            <AccordionTrigger className="hover:no-underline py-5">
              <div className="flex items-center gap-3 text-left">
                <div className="bg-purple-500/10 p-2 rounded-xl text-purple-600">
                  <Maximize className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">形を整える</div>
                  <div className="text-[10px] text-muted-foreground font-normal">枠の大きさや背景を調整します</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6 space-y-6">
              <div className="space-y-3">
                <Label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 text-foreground">画像の縦横比</Label>
                <Select value={settings.aspectRatio} onValueChange={(v) => updateSettings('aspectRatio', v)}>
                  <SelectTrigger className="h-10 bg-muted/20 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">そのまま（変えない）</SelectItem>
                    <SelectItem value="1:1">1:1 (SNS・正方形)</SelectItem>
                    <SelectItem value="16:9">16:9 (動画・テレビ)</SelectItem>
                    <SelectItem value="4:3">4:3 (古い写真風)</SelectItem>
                    <SelectItem value="9:16">9:16 (スマホ全画面)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {settings.aspectRatio !== 'original' && (
                <div className="p-4 bg-muted/20 rounded-2xl space-y-4 animate-in zoom-in-95 duration-200">
                  <Label className="text-[11px] font-bold">余った部分の埋め方</Label>
                  <ToggleGroup value={[settings.backgroundMode]} onValueChange={(v: any) => v && updateSettings('backgroundMode', Array.isArray(v) ? v[0] : v)} className="flex gap-2">
                    <ToggleGroupItem value="blur" className="flex-1 h-9 text-[10px]">ぼかして埋める</ToggleGroupItem>
                    <ToggleGroupItem value="color" className="flex-1 h-9 text-[10px]">色で塗りつぶす</ToggleGroupItem>
                  </ToggleGroup>
                  {settings.backgroundMode === 'color' && (
                    <Input type="color" value={settings.backgroundColor} onChange={(e) => updateSettings('backgroundColor', e.target.value)} className="h-8 p-1 cursor-pointer" />
                  )}
                </div>
              )}
              <div className="space-y-3">
                <Label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">画像全体の最大サイズ（横幅）</Label>
                <div className="flex gap-2 items-center">
                  <Input type="number" value={settings.maxWidth} onChange={(e) => updateSettings('maxWidth', Number(e.target.value))} className="h-10 bg-muted/20" />
                  <span className="text-[10px] text-muted-foreground">px</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 見映えの調整 */}
          <AccordionItem value="style" className="px-5 border-b border-muted/50">
            <AccordionTrigger className="hover:no-underline py-5">
              <div className="flex items-center gap-3 text-left">
                <div className="bg-orange-500/10 p-2 rounded-xl text-orange-600">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">見映えを良くする</div>
                  <div className="text-[10px] text-muted-foreground font-normal">明るさや角を丸くする加工</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6 space-y-6">
              {[
                { label: '明るさ', key: 'brightness', icon: <Sun className="w-3 h-3" />, max: 200, unit: '%' },
                { label: 'コントラスト', key: 'contrast', icon: <Contrast className="w-3 h-3" />, max: 200, unit: '%' },
                { label: '角を丸くする', key: 'cornerRadius', icon: <Square className="w-3 h-3" />, max: 50, unit: '' }
              ].map((item) => (
                <div key={item.key} className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <Label className="flex items-center gap-1.5">{item.icon} {item.label}</Label>
                    <span className="text-muted-foreground">{(settings as any)[item.key]}{item.unit}</span>
                  </div>
                  <Slider value={[(settings as any)[item.key]]} max={item.max} onValueChange={(v) => updateSettings(item.key, getSliderValue(v))} />
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-dashed">
                <Label className="text-xs font-bold flex items-center gap-2"><Palette className="w-4 h-4" /> モノクロ（白黒）にする</Label>
                <Switch checked={settings.grayscale} onCheckedChange={(v) => updateSettings('grayscale', v)} />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ブランド（ロゴ）の設定 */}
          <AccordionItem value="watermark" className="px-5 border-b border-muted/50">
            <AccordionTrigger className="hover:no-underline py-5">
              <div className="flex items-center gap-3 text-left">
                <div className="bg-green-500/10 p-2 rounded-xl text-green-600">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">ロゴや文字を入れる</div>
                  <div className="text-[10px] text-muted-foreground font-normal">盗用防止のマークを付けます</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6 space-y-6">
              <div className="space-y-3">
                <Label className="text-xs font-bold text-zinc-600">ロゴ画像（PNG等）</Label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="flex-1 h-10 gap-2 rounded-xl text-xs overflow-hidden relative" onClick={() => logoInputRef.current?.click()}>
                    <Download className="w-3 h-3" />
                    {settings.watermarkImage ? '別の画像を選ぶ' : '画像を選択'}
                    <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </Button>
                  {settings.watermarkImage && (
                    <Button variant="ghost" size="icon" onClick={() => updateSettings('watermarkImage', undefined)} className="text-destructive h-10 w-10">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold text-zinc-600">表示したい文字</Label>
                <Input value={settings.watermarkText} onChange={(e) => updateSettings('watermarkText', e.target.value)} placeholder="例：© 自分の名前" className="bg-muted/20" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground">置く場所</Label>
                  <Select value={settings.watermarkPosition} onValueChange={(v) => updateSettings('watermarkPosition', v)}>
                    <SelectTrigger className="h-9 text-xs bg-muted/20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">左上</SelectItem>
                      <SelectItem value="top-right">右上</SelectItem>
                      <SelectItem value="center">真ん中</SelectItem>
                      <SelectItem value="bottom-left">左下</SelectItem>
                      <SelectItem value="bottom-right">右下</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground">透かし具合</Label>
                  <div className="pt-2">
                    <Slider value={[settings.watermarkOpacity]} max={100} onValueChange={(v) => updateSettings('watermarkOpacity', getSliderValue(v))} />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 便利設定（リネーム・個人情報） */}
          <AccordionItem value="naming" className="px-5 border-0">
            <AccordionTrigger className="hover:no-underline py-5 text-left">
              <div className="flex items-center gap-3">
                <div className="bg-zinc-500/10 p-2 rounded-xl text-zinc-600">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">その他の便利な設定</div>
                  <div className="text-[10px] text-muted-foreground font-normal">ファイル名や個人情報の管理</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6 space-y-6">
              <div className="space-y-3">
                <Label className="text-xs font-bold text-zinc-600">ファイルの名前（自動命名）</Label>
                <Input value={settings.renamePattern} onChange={(e) => updateSettings('renamePattern', e.target.value)} placeholder="例：{{filename}}-##" className="bg-muted/20" />
                <p className="text-[9px] text-muted-foreground leading-relaxed italic">
                  {"## と書くと 01, 02... と番号がつきます。"}
                </p>
              </div>

              <div className="space-y-4 pt-2 border-t border-dashed">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-bold block">変換後にすぐ保存する</Label>
                    <p className="text-[9px] text-muted-foreground">自動でダウンロードを開始します</p>
                  </div>
                  <Switch checked={settings.autoDownload} onCheckedChange={(v) => updateSettings('autoDownload', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-bold block">写真の個人情報を消す</Label>
                    <p className="text-[9px] text-muted-foreground">位置情報などを削除して安全にします</p>
                  </div>
                  <Switch checked={settings.removeExif} onCheckedChange={(v) => updateSettings('removeExif', v)} />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="m-5 mt-2 p-5 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <div className="text-[11px] font-black text-primary">プライバシー保護済み</div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                あなたの画像をサーバーへ送ることはありません。すべての処理は今お使いのデバイス上だけで完結します。
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
