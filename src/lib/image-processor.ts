export interface ProcessingSettings {
  quality: number;
  maxWidth: number;
  format: 'image/webp' | 'image/jpeg' | 'image/png' | 'image/avif';
  removeExif: boolean;
  
  // 補正
  brightness: number;
  contrast: number;
  blur: number;
  grayscale: boolean;
  cornerRadius: number;
  
  // アスペクト比
  aspectRatio: 'original' | '1:1' | '16:9' | '4:3' | '9:16';
  backgroundMode: 'blur' | 'color';
  backgroundColor: string;

  // ウォーターマーク
  watermarkText: string;
  watermarkImage?: string; // base64
  watermarkPosition: 'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right';
  watermarkSize: number;
  watermarkOpacity: number;
  
  // 自動化
  autoDownload: boolean;
  renamePattern: string; // e.g. "{{filename}}-v2" or "image-##"
}

export const processImageWithCanvas = async (
  file: File,
  settings: ProcessingSettings,
  index: number = 0,
  maskData?: string,
  mosaicLevel?: number
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Canvas context not available');

        // 1. Calculate Dimensions
        let targetWidth = img.width;
        let targetHeight = img.height;

        if (settings.maxWidth > 0) {
          const ratio = settings.maxWidth / targetWidth;
          targetWidth = settings.maxWidth;
          targetHeight = img.height * ratio;
        }

        let canvasWidth = targetWidth;
        let canvasHeight = targetHeight;

        if (settings.aspectRatio && settings.aspectRatio !== 'original') {
          const ratioMap: Record<string, number> = {
            '1:1': 1,
            '16:9': 16/9,
            '4:3': 4/3,
            '9:16': 9/16
          };
          const targetRatio = ratioMap[settings.aspectRatio] || 1;
          if (canvasWidth / canvasHeight > targetRatio) {
            canvasHeight = canvasWidth / targetRatio;
          } else {
            canvasWidth = canvasHeight * targetRatio;
          }
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // 2. Clear Canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // 3. Draw Background
        if (settings.aspectRatio && settings.aspectRatio !== 'original') {
          if (settings.backgroundMode === 'blur') {
            ctx.save();
            ctx.filter = 'blur(60px) brightness(0.7) saturate(1.2)';
            const bleed = 100;
            ctx.drawImage(img, -bleed, -bleed, canvasWidth + (bleed * 2), canvasHeight + (bleed * 2));
            ctx.restore();
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
          } else {
            ctx.fillStyle = settings.backgroundColor || '#ffffff';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
          }
        } else if (settings.format === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }

        // 4. Draw Main Image with Effects
        const dx = (canvasWidth - targetWidth) / 2;
        const dy = (canvasHeight - targetHeight) / 2;

        ctx.save();

        // Corner Rounding
        if (settings.cornerRadius > 0) {
          const minSide = Math.min(targetWidth, targetHeight);
          const radius = (minSide / 200) * settings.cornerRadius;
          
          ctx.beginPath();
          ctx.moveTo(dx + radius, dy);
          ctx.arcTo(dx + targetWidth, dy, dx + targetWidth, dy + targetHeight, radius);
          ctx.arcTo(dx + targetWidth, dy + targetHeight, dx, dy + targetHeight, radius);
          ctx.arcTo(dx, dy + targetHeight, dx, dy, radius);
          ctx.arcTo(dx, dy, dx + targetWidth, dy, radius);
          ctx.closePath();
          ctx.clip();
        }

        // Apply filters
        const filters = [];
        if (settings.brightness !== 100) filters.push(`brightness(${settings.brightness}%)`);
        if (settings.contrast !== 100) filters.push(`contrast(${settings.contrast}%)`);
        if (settings.blur > 0) filters.push(`blur(${settings.blur}px)`);
        if (settings.grayscale) filters.push('grayscale(100%)');
        
        if (filters.length > 0) ctx.filter = filters.join(' ');
        
        ctx.drawImage(img, dx, dy, targetWidth, targetHeight);
        ctx.restore();

        // [NEW] 4.5 Apply Manual Mosaic Mask
        if (maskData) {
          const maskImg = new Image();
          await new Promise((res) => {
            maskImg.onload = res;
            maskImg.src = maskData;
          });

          // Create Mosaic Image
          const mosaicCanvas = document.createElement('canvas');
          const mCtx = mosaicCanvas.getContext('2d')!;
          const mLevel = mosaicLevel || 25; // デフォルトは25
          const mScale = 1 / Math.max(1, mLevel); 
          mosaicCanvas.width = Math.max(1, targetWidth * mScale);
          mosaicCanvas.height = Math.max(1, targetHeight * mScale);
          
          mCtx.drawImage(img, 0, 0, mosaicCanvas.width, mosaicCanvas.height);
          
          const tempCanvas = document.createElement('canvas');
          const tCtx = tempCanvas.getContext('2d')!;
          tempCanvas.width = targetWidth;
          tempCanvas.height = targetHeight;
          
          tCtx.imageSmoothingEnabled = false;
          tCtx.drawImage(mosaicCanvas, 0, 0, targetWidth, targetHeight);
          
          // Use Mask
          tCtx.globalCompositeOperation = 'destination-in';
          tCtx.drawImage(maskImg, 0, 0, targetWidth, targetHeight);
          
          // Draw to Main
          ctx.drawImage(tempCanvas, dx, dy, targetWidth, targetHeight);
        }

        // 5. Watermark / Logo Synthesis
        const drawWatermark = async () => {
          const sizeRef = Math.max(canvasWidth, canvasHeight);
          const padding = sizeRef * 0.04;
          
          ctx.save();
          ctx.globalAlpha = settings.watermarkOpacity / 100;

          // Logo Synthesis
          if (settings.watermarkImage) {
            const logo = new Image();
            await new Promise((res) => {
              logo.onload = res;
              logo.src = settings.watermarkImage!;
            });
            
            const logoRatio = logo.width / logo.height;
            const logoWidth = (sizeRef * 0.15) * (settings.watermarkSize / 10);
            const logoHeight = logoWidth / logoRatio;
            
            let lx = padding, ly = padding;
            if (settings.watermarkPosition === 'top-right') lx = canvasWidth - padding - logoWidth;
            else if (settings.watermarkPosition === 'center') { lx = (canvasWidth - logoWidth) / 2; ly = (canvasHeight - logoHeight) / 2; }
            else if (settings.watermarkPosition === 'bottom-left') ly = canvasHeight - padding - logoHeight;
            else if (settings.watermarkPosition === 'bottom-right') { lx = canvasWidth - padding - logoWidth; ly = canvasHeight - padding - logoHeight; }

            ctx.drawImage(logo, lx, ly, logoWidth, logoHeight);
          }

          // Text Synthesis
          if (settings.watermarkText) {
            const fontSize = (sizeRef * 0.02) * (settings.watermarkSize / 10);
            ctx.font = `italic bold ${fontSize}px sans-serif`;
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            ctx.lineWidth = fontSize * 0.15;
            
            let tx = padding, ty = padding + fontSize;
            ctx.textAlign = 'left';

            if (settings.watermarkPosition === 'top-right') { tx = canvasWidth - padding; ctx.textAlign = 'right'; }
            else if (settings.watermarkPosition === 'center') { tx = canvasWidth / 2; ty = canvasHeight / 2; ctx.textAlign = 'center'; }
            else if (settings.watermarkPosition === 'bottom-left') ty = canvasHeight - padding;
            else if (settings.watermarkPosition === 'bottom-right') { tx = canvasWidth - padding; ty = canvasHeight - padding; ctx.textAlign = 'right'; }

            ctx.strokeText(settings.watermarkText, tx, ty);
            ctx.fillText(settings.watermarkText, tx, ty);
          }
          
          ctx.restore();
        };

        await drawWatermark();

        // 6. Export
        canvas.toBlob((blob) => {
          if (blob) {
            const format = settings.format || 'image/webp';
            const extension = format.split('/')[1]?.replace('jpeg', 'jpg') || 'webp';
            const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            
            let exportName = settings.renamePattern || '{{filename}}';
            exportName = exportName
              .replace(/{{filename}}/g, originalNameWithoutExt)
              .replace(/{{index}}/g, (index + 1).toString().padStart(2, '0'))
              .replace(/##/g, (index + 1).toString().padStart(2, '0'))
              .replace(/{{date}}/g, (new Date().toISOString().split('T')[0] || ''));
            
            if (!exportName.includes(originalNameWithoutExt) && !settings.renamePattern) {
              exportName = `${originalNameWithoutExt}_processed`;
            }

            resolve(new File([blob], `${exportName}.${extension}`, { type: format }));
          } else reject('Export failed');
        }, settings.format || 'image/webp', settings.quality / 100);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};
