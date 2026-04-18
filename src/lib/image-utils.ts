import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
  initialQuality?: number;
}

export const compressImage = async (file: File, options: CompressionOptions): Promise<File> => {
  try {
    const compressedBlob = await imageCompression(file, {
      maxSizeMB: options.maxSizeMB || 1,
      maxWidthOrHeight: options.maxWidthOrHeight || 1920,
      useWebWorker: options.useWebWorker ?? true,
      fileType: options.fileType || 'image/webp',
      initialQuality: options.initialQuality || 0.8,
    });
    
    // Create a new File from the Blob
    const newName = file.name.replace(/\.[^/.]+$/, "") + (options.fileType === 'image/webp' ? '.webp' : '.jpg');
    return new File([compressedBlob], newName, { type: options.fileType || 'image/webp' });
  } catch (error) {
    console.error('Image compression failed:', error);
    throw error;
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
