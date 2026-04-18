'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Settings2, 
  Zap, 
  Type, 
  Sun, 
  Contrast, 
  Droplets, 
  FileType,
  Shield,
  Maximize,
  Move,
  Eye
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingsProps {
  settings: {
    quality: number;
    maxWidth: number;
    format: string;
    brightness: number;
    contrast: number;
    blur: number;
    watermarkText: string;
    watermarkPosition: string;
    watermarkSize: number;
    watermarkOpacity: number;
    removeExif: boolean;
  };
  updateSettings: (key: string, value: any) => void;
}

export const ConversionSettings: React.FC<SettingsProps> = ({
  settings,
  updateSettings
}) => {
  return (
    <Card className="shadow-lg border-primary/10 overflow-hidden">
      <CardHeader className="bg-primary/5 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-primary" />
          高度な変換設定
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Accordion className="w-full">
          
          <AccordionItem value="basic" className="px-6 border-b">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="flex items-center gap-2 font-semibold">基本設定</span>
            </AccordionTrigger>
            <AccordionContent className="pb-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label className="text-sm font-medium">画質 / 圧縮率</Label>
                  <span className="text-sm font-bold text-primary">{settings.quality}%</span>
                </div>
                <Slider
                  value={[settings.quality]}
                  onValueChange={(vals) => updateSettings('quality', Array.isArray(vals) ? vals[0] : vals)}
                  max={100} step={1}
                />
              </div>
              <div className="space-y-4">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <FileType className="w-4 h-4" /> 出力形式
                </Label>
                <ToggleGroup 
                  value={[settings.format]}
                  onValueChange={(val: any) => {
                    const nextValue = Array.isArray(val) ? val[0] : val;
                    if (nextValue) updateSettings('format', nextValue);
                  }}
                  className="justify-start"
                >
                  <ToggleGroupItem value="image/webp" className="w-full">WebP</ToggleGroupItem>
                  <ToggleGroupItem value="image/jpeg" className="w-full">JPEG</ToggleGroupItem>
                  <ToggleGroupItem value="image/png" className="w-full">PNG</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="space-y-4">
                <Label className="text-sm font-medium">最大横幅 (px)</Label>
                <Input
                  type="number"
                  value={settings.maxWidth}
                  onChange={(e) => updateSettings('maxWidth', Number(e.target.value))}
                  className="font-mono"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="adjust" className="px-6 border-b">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="flex items-center gap-2 font-semibold">画像調整</span>
            </AccordionTrigger>
            <AccordionContent className="pb-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between font-mono text-xs">
                  <Label className="text-sm font-medium flex items-center gap-2"><Sun className="w-4 h-4" /> 明るさ</Label>
                  <span>{settings.brightness}%</span>
                </div>
                <Slider value={[settings.brightness]} max={200} onValueChange={(v) => updateSettings('brightness', Array.isArray(v) ? v[0] : v)} />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between font-mono text-xs">
                  <Label className="text-sm font-medium flex items-center gap-2"><Contrast className="w-4 h-4" /> コントラスト</Label>
                  <span>{settings.contrast}%</span>
                </div>
                <Slider value={[settings.contrast]} max={200} onValueChange={(v) => updateSettings('contrast', Array.isArray(v) ? v[0] : v)} />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between font-mono text-xs">
                  <Label className="text-sm font-medium flex items-center gap-2"><Droplets className="w-4 h-4" /> ぼかし</Label>
                  <span>{settings.blur}px</span>
                </div>
                <Slider value={[settings.blur]} max={20} onValueChange={(v) => updateSettings('blur', Array.isArray(v) ? v[0] : v)} />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="watermark" className="px-6 border-b">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="flex items-center gap-2 font-semibold">ウォーターマーク詳細</span>
            </AccordionTrigger>
            <AccordionContent className="pb-6 space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2"><Type className="w-4 h-4" /> テキスト</Label>
                <Input value={settings.watermarkText} onChange={(e) => updateSettings('watermarkText', e.target.value)} placeholder="© Brand Name" />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2"><Move className="w-4 h-4" /> 配置位置</Label>
                  <Select value={settings.watermarkPosition} onValueChange={(v) => updateSettings('watermarkPosition', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">左上</SelectItem>
                      <SelectItem value="top-right">右上</SelectItem>
                      <SelectItem value="center">中央</SelectItem>
                      <SelectItem value="bottom-left">左下</SelectItem>
                      <SelectItem value="bottom-right">右下</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between font-mono text-xs">
                  <Label className="text-sm font-medium flex items-center gap-2"><Maximize className="w-4 h-4" /> サイズ</Label>
                  <span>{settings.watermarkSize}</span>
                </div>
                <Slider value={[settings.watermarkSize]} min={1} max={100} onValueChange={(v) => updateSettings('watermarkSize', Array.isArray(v) ? v[0] : v)} />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between font-mono text-xs">
                  <Label className="text-sm font-medium flex items-center gap-2"><Eye className="w-4 h-4" /> 不透明度</Label>
                  <span>{settings.watermarkOpacity}%</span>
                </div>
                <Slider value={[settings.watermarkOpacity]} max={100} onValueChange={(v) => updateSettings('watermarkOpacity', Array.isArray(v) ? v[0] : v)} />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="security" className="px-6 border-b">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="flex items-center gap-2 font-semibold">プライバシー</span>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-2"><Shield className="w-4 h-4" /> メタデータを削除</Label>
                <Switch checked={settings.removeExif} onCheckedChange={(v) => updateSettings('removeExif', v)} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="p-6 bg-primary/5 rounded-b-xl border-t border-primary/10 flex items-start gap-3 text-[11px]">
          <Zap className="w-5 h-5 text-primary mt-0.5" />
          <p className="text-muted-foreground leading-relaxed">
            すべての加工はブラウザのメモリ上で行われ、外部サーバーと通信することはありません。
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
