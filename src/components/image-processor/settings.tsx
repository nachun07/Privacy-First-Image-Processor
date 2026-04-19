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
  Palette, ImageIcon, Layers, RefreshCcw, X
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

  // Helper to extract slider value safely
  const getSliderValue = (v: number | readonly number[]) => Array.isArray(v) ? v[0] : v;

  return (
    <Card className="shadow-2xl border-primary/10 overflow-hidden bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
      <CardHeader className="bg-primary/5 pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-primary" />
          変換設定
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onReset} className="h-8 w-8 text-muted-foreground outline-none border-none shadow-none">
          <RefreshCcw className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Accordion className="w-full" multiple defaultValue={["basic"]}>
          
          <AccordionItem value="basic" className="px-6 border-b">
            <AccordionTrigger className="hover:no-underline py-4 font-bold">基本・フォーマット</AccordionTrigger>
            <AccordionContent className="pb-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between font-mono text-xs">
                  <Label className="text-sm font-medium">画質 / 圧縮率</Label>
                  <span className="text-primary font-bold">{settings.quality}%</span>
                </div>
                <Slider value={[settings.quality]} max={100} onValueChange={(v) => updateSettings('quality', getSliderValue(v))} />
              </div>
              <div className="space-y-4">
                <Label className="text-sm font-medium flex items-center gap-2"><FileType className="w-4 h-4" /> 出力形式</Label>
                <ToggleGroup value={[settings.format]} onValueChange={(v: any) => v && updateSettings('format', Array.isArray(v) ? v[0] : v)} className="grid grid-cols-2 gap-2">
                  <ToggleGroupItem value="image/webp" className="w-full">WebP</ToggleGroupItem>
                  <ToggleGroupItem value="image/avif" className="w-full">AVIF</ToggleGroupItem>
                  <ToggleGroupItem value="image/jpeg" className="w-full">JPEG</ToggleGroupItem>
                  <ToggleGroupItem value="image/png" className="w-full">PNG</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="layout" className="px-6 border-b">
            <AccordionTrigger className="hover:no-underline py-4 font-bold">レイアウト・SNS</AccordionTrigger>
            <AccordionContent className="pb-6 space-y-6">
              <div className="space-y-4">
                <Label className="text-sm font-medium flex items-center gap-2"><Maximize className="w-4 h-4" /> アスペクト比 (SNS用等)</Label>
                <Select value={settings.aspectRatio} onValueChange={(v) => updateSettings('aspectRatio', v)}>
                  <SelectTrigger className="bg-muted/30"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">オリジナル</SelectItem>
                    <SelectItem value="1:1">1:1 (正方形)</SelectItem>
                    <SelectItem value="16:9">16:9 (横長)</SelectItem>
                    <SelectItem value="4:3">4:3 (標準)</SelectItem>
                    <SelectItem value="9:16">9:16 (縦長)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {settings.aspectRatio !== 'original' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <Label className="text-sm font-medium flex items-center gap-2"><Layers className="w-4 h-4" /> 余白の埋め方</Label>
                  <ToggleGroup value={[settings.backgroundMode]} onValueChange={(v: any) => v && updateSettings('backgroundMode', Array.isArray(v) ? v[0] : v)} className="flex gap-2">
                    <ToggleGroupItem value="blur" className="flex-1">ぼかし背景</ToggleGroupItem>
                    <ToggleGroupItem value="color" className="flex-1">単色</ToggleGroupItem>
                  </ToggleGroup>
                  {settings.backgroundMode === 'color' && (
                    <Input type="color" value={settings.backgroundColor} onChange={(e) => updateSettings('backgroundColor', e.target.value)} className="h-10 p-1" />
                  )}
                </div>
              )}
              <div className="space-y-4">
                <Label className="text-sm font-medium">最大横幅 (px)</Label>
                <Input type="number" value={settings.maxWidth} onChange={(e) => updateSettings('maxWidth', Number(e.target.value))} className="font-mono bg-muted/20" />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="style" className="px-6 border-b">
            <AccordionTrigger className="hover:no-underline py-4 font-bold">フィルター・補正</AccordionTrigger>
            <AccordionContent className="pb-6 space-y-6">
              {[
                { label: '明るさ', key: 'brightness', icon: <Sun className="w-4 h-4" />, max: 200, unit: '%' },
                { label: 'コントラスト', key: 'contrast', icon: <Contrast className="w-4 h-4" />, max: 200, unit: '%' },
                { label: 'ぼかし', key: 'blur', icon: <Droplets className="w-4 h-4" />, max: 20, unit: 'px' },
                { label: '角丸', key: 'cornerRadius', icon: <Square className="w-4 h-4" />, max: 50, unit: 'px' }
              ].map((item) => (
                <div key={item.key} className="space-y-4">
                  <div className="flex justify-between font-mono text-[10px] uppercase text-muted-foreground">
                    <Label className="text-sm font-medium text-foreground flex items-center gap-2">{item.icon} {item.label}</Label>
                    <span>{(settings as any)[item.key]}{item.unit}</span>
                  </div>
                  <Slider value={[ (settings as any)[item.key] ]} max={item.max} onValueChange={(v) => updateSettings(item.key, getSliderValue(v))} />
                </div>
              ))}
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-2"><Palette className="w-4 h-4" /> モノクロ化</Label>
                <Switch checked={settings.grayscale} onCheckedChange={(v) => updateSettings('grayscale', v)} />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="watermark" className="px-6 border-b">
            <AccordionTrigger className="hover:no-underline py-4 font-bold">ブランド・ロゴ</AccordionTrigger>
            <AccordionContent className="pb-6 space-y-6">
               <div className="space-y-4">
                <Label className="text-sm font-medium flex items-center gap-2"><ImageIcon className="w-4 h-4" /> ロゴ画像</Label>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="flex-1 h-10 gap-2 overflow-hidden relative" onClick={() => logoInputRef.current?.click()}>
                    <Download className="w-4 h-4" />
                    {settings.watermarkImage ? '再アップロード' : 'ロゴを選択'}
                    <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </Button>
                  {settings.watermarkImage && (
                    <Button variant="ghost" size="icon" onClick={() => updateSettings('watermarkImage', undefined)} className="text-destructive h-10 w-10">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {settings.watermarkImage && (
                  <div className="p-2 border rounded-xl bg-muted/20 flex justify-center">
                    <img src={settings.watermarkImage} className="max-h-20 object-contain" alt="logo preview" />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium flex items-center gap-2"><Type className="w-4 h-4" /> テキスト</Label>
                <Input value={settings.watermarkText} onChange={(e) => updateSettings('watermarkText', e.target.value)} placeholder="© Brand Name" className="bg-muted/30" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground"><Move className="w-3 h-3 inline mr-1" /> 位置</Label>
                  <Select value={settings.watermarkPosition} onValueChange={(v) => updateSettings('watermarkPosition', v)}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">左上</SelectItem>
                      <SelectItem value="top-right">右上</SelectItem>
                      <SelectItem value="center">中央</SelectItem>
                      <SelectItem value="bottom-left">左下</SelectItem>
                      <SelectItem value="bottom-right">右下</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground"><Eye className="w-3 h-3 inline mr-1" /> 不透明度</Label>
                  <Slider value={[settings.watermarkOpacity]} max={100} onValueChange={(v) => updateSettings('watermarkOpacity', getSliderValue(v))} />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="naming" className="px-6 border-b">
            <AccordionTrigger className="hover:no-underline py-4 font-bold">リネーム・自動化</AccordionTrigger>
            <AccordionContent className="pb-6 space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2"><FileEdit className="w-4 h-4" /> 命名ルール（タグ使用可）</Label>
                <Input value={settings.renamePattern} onChange={(e) => updateSettings('renamePattern', e.target.value)} placeholder="{{filename}}-##" className="bg-muted/30" />
                <div className="flex flex-wrap gap-2 text-[10px] bg-muted/50 p-3 rounded-lg border border-dashed">
                  <code className="bg-white px-1.5 py-0.5 rounded shadow-sm">{"{{filename}}"}</code>
                  <code className="bg-white px-1.5 py-0.5 rounded shadow-sm">{"{{index}}"}</code>
                  <code className="bg-white px-1.5 py-0.5 rounded shadow-sm">{"{{date}}"}</code>
                  <code className="bg-white px-1.5 py-0.5 rounded shadow-sm">{"##"}</code>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-dashed pt-4">
                <Label className="text-sm font-medium flex items-center gap-2"><Download className="w-4 h-4" /> 自動保存</Label>
                <Switch checked={settings.autoDownload} onCheckedChange={(v) => updateSettings('autoDownload', v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-2"><Shield className="w-4 h-4" /> EXIF削除</Label>
                <Switch checked={settings.removeExif} onCheckedChange={(v) => updateSettings('removeExif', v)} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="p-6 bg-primary/5 dark:bg-primary/10 rounded-b-xl border-t border-primary/10 flex items-start gap-3">
          <Zap className="w-5 h-5 text-primary mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            すべての加工はブラウザのメモリ上で行われ、外部サーバーと通信することはありません。100%プライバシーが守られます。
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
