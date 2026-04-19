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
  index: number = 0
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Canvas context not available');

        let targetWidth = img.width;
        let targetHeight = img.height;

        // Apply max width resize
        if (settings.maxWidth > 0 && targetWidth > settings.maxWidth) {
          const ratio = settings.maxWidth / targetWidth;
          targetWidth = settings.maxWidth;
          targetHeight = img.height * ratio;
        }

        let canvasWidth = targetWidth;
        let canvasHeight = targetHeight;

        // Handle Aspect Ratio
        if (settings.aspectRatio !== 'original') {
          const [rw, rh] = settings.aspectRatio.split(':').map(Number);
          const ratio = rw / rh;
          if (canvasWidth / canvasHeight > ratio) {
            canvasHeight = canvasWidth / ratio;
          } else {
            canvasWidth = canvasHeight * ratio;
          }
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // 1. Draw Background (if aspect ratio changed)
        if (settings.aspectRatio !== 'original') {
          if (settings.backgroundMode === 'blur') {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = canvasWidth;
            tempCanvas.height = canvasHeight;
            if (tempCtx) {
              tempCtx.filter = 'blur(40px) brightness(0.8)';
              tempCtx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
              ctx.drawImage(tempCanvas, 0, 0);
            }
          } else {
            ctx.fillStyle = settings.backgroundColor || '#000000';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
          }
        }

        // 2. Draw Main Image (Centered)
        const dx = (canvasWidth - targetWidth) / 2;
        const dy = (canvasHeight - targetHeight) / 2;
        
        ctx.save();
        // Rounded Corners path
        if (settings.cornerRadius > 0) {
          const radius = (Math.min(targetWidth, targetHeight) / 100) * settings.cornerRadius;
          ctx.beginPath();
          ctx.moveTo(dx + radius, dy);
          ctx.lineTo(dx + targetWidth - radius, dy);
          ctx.quadraticCurveTo(dx + targetWidth, dy, dx + targetWidth, dy + radius);
          ctx.lineTo(dx + targetWidth, dy + targetHeight - radius);
          ctx.quadraticCurveTo(dx + targetWidth, dy + targetHeight, dx + targetWidth - radius, dy + targetHeight);
          ctx.lineTo(dx + radius, dy + targetHeight);
          ctx.quadraticCurveTo(dx, dy + targetHeight, dx, dy + targetHeight - radius);
          ctx.lineTo(dx, dy + radius);
          ctx.quadraticCurveTo(dx, dy, dx + radius, dy);
          ctx.closePath();
          ctx.clip();
        }

        ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) blur(${settings.blur}px) ${settings.grayscale ? 'grayscale(100%)' : ''}`;
        ctx.drawImage(img, dx, dy, targetWidth, targetHeight);
        ctx.restore();

        // 3. Draw Watermark
        const drawWatermark = async (content: string | HTMLImageElement, isImage: boolean) => {
          const opacity = settings.watermarkOpacity / 100;
          const sizeRef = Math.max(canvasWidth, canvasHeight);
          const padding = sizeRef * 0.05;
          let w = 0, h = 0;
          
          if (isImage && content instanceof HTMLImageElement) {
            const ratio = content.width / content.height;
            w = (sizeRef * 0.2) * (settings.watermarkSize / 10);
            h = w / ratio;
          }

          let wx = 0, wy = 0;
          switch (settings.watermarkPosition) {
            case 'top-left': wx = padding; wy = padding; break;
            case 'top-right': wx = canvasWidth - padding - w; wy = padding; break;
            case 'center': wx = (canvasWidth - w) / 2; wy = (canvasHeight - h) / 2; break;
            case 'bottom-left': wx = padding; wy = canvasHeight - padding - h; break;
            case 'bottom-right': wx = canvasWidth - padding - w; wy = canvasHeight - padding - h; break;
          }

          ctx.globalAlpha = opacity;
          if (isImage && content instanceof HTMLImageElement) {
            ctx.drawImage(content, wx, wy, w, h);
          } else if (typeof content === 'string') {
            const fontSize = (sizeRef * 0.01) * settings.watermarkSize;
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = fontSize * 0.1;
            ctx.textAlign = settings.watermarkPosition.includes('left') ? 'left' : settings.watermarkPosition.includes('right') ? 'right' : 'center';
            // Offset wx/wy if text is aligned
            const tx = ctx.textAlign === 'left' ? wx : ctx.textAlign === 'right' ? canvasWidth - padding : canvasWidth / 2;
            const ty = settings.watermarkPosition.includes('top') ? wy + fontSize : settings.watermarkPosition.includes('bottom') ? canvasHeight - padding : canvasHeight / 2;
            ctx.strokeText(content, tx, ty);
            ctx.fillText(content, tx, ty);
          }
          ctx.globalAlpha = 1.0;
        };

        // Logo Image Watermark
        if (settings.watermarkImage) {
          const logo = new Image();
          await new Promise((res) => {
            logo.onload = res;
            logo.src = settings.watermarkImage!;
          });
          await drawWatermark(logo, true);
        }

        // Text Watermark
        if (settings.watermarkText) {
          await drawWatermark(settings.watermarkText, false);
        }

        // 4. Output
        canvas.toBlob((blob) => {
          if (blob) {
            let extension = settings.format.split('/')[1].replace('jpeg', 'jpg');
            
            // Advanced Rename
            let newName = file.name.replace(/\.[^/.]+$/, "");
            if (settings.renamePattern) {
              newName = settings.renamePattern
                .replace(/{{filename}}/g, newName)
                .replace(/{{date}}/g, new Date().toISOString().split('T')[0])
                .replace(/{{index}}/g, (index + 1).toString().padStart(2, '0'))
                .replace(/##/g, (index + 1).toString().padStart(2, '0'));
            }
            newName = `${newName}_processed.${extension}`;
            resolve(new File([blob], newName, { type: settings.format }));
          } else reject('Blob failed');
        }, settings.format, settings.quality / 100);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};
