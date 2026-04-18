export interface ProcessingSettings {
  quality: number;
  maxWidth: number;
  format: 'image/webp' | 'image/jpeg' | 'image/png';
  removeExif: boolean;
  brightness: number;
  contrast: number;
  blur: number;
  grayscale: boolean;
  watermarkText: string;
  watermarkPosition: 'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right';
  watermarkSize: number; // 1-100
  watermarkOpacity: number; // 0-100
  watermarkImage?: string; 
}

export const processImageWithCanvas = async (
  file: File,
  settings: ProcessingSettings
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Canvas context not available');

        let width = img.width;
        let height = img.height;
        if (settings.maxWidth > 0 && width > settings.maxWidth) {
          const ratio = settings.maxWidth / width;
          width = settings.maxWidth;
          height = img.height * ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) blur(${settings.blur}px) ${settings.grayscale ? 'grayscale(100%)' : ''}`;
        ctx.drawImage(img, 0, 0, width, height);
        ctx.filter = 'none';

        if (settings.watermarkText) {
          const fontSize = (Math.max(width, height) * 0.01) * settings.watermarkSize;
          ctx.font = `bold ${fontSize}px sans-serif`;
          const opacity = settings.watermarkOpacity / 100;
          
          let x = 0;
          let y = 0;
          const padding = fontSize;

          switch (settings.watermarkPosition) {
            case 'top-left':
              ctx.textAlign = 'left'; ctx.textBaseline = 'top';
              x = padding; y = padding;
              break;
            case 'top-right':
              ctx.textAlign = 'right'; ctx.textBaseline = 'top';
              x = width - padding; y = padding;
              break;
            case 'center':
              ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
              x = width / 2; y = height / 2;
              break;
            case 'bottom-left':
              ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
              x = padding; y = height - padding;
              break;
            case 'bottom-right':
              ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
              x = width - padding; y = height - padding;
              break;
          }
          
          ctx.lineWidth = fontSize * 0.15;
          ctx.strokeStyle = `rgba(0, 0, 0, ${opacity * 0.8})`;
          ctx.strokeText(settings.watermarkText, x, y);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.fillText(settings.watermarkText, x, y);
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const formatStr = Array.isArray(settings.format) ? settings.format[0] : settings.format;
              const extension = (formatStr || 'image/webp').split('/')[1] || 'webp';
              const newName = file.name.replace(/\.[^/.]+$/, "") + `_processed.${extension}`;
              resolve(new File([blob], newName, { type: formatStr }));
            } else {
              reject('Blob production failed');
            }
          },
          settings.format as string,
          settings.quality / 100
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};
