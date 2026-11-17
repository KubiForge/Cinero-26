export interface OptimizedGalleryImage {
  file: File;
  width: number;
  height: number;
  quality: number;
}

interface WorkerResponse {
  blob?: Blob;
  width?: number;
  height?: number;
  quality?: number;
  error?: string;
  fallback?: boolean;
}

const MAX_IMAGE_DIMENSION = 1920;
const MIN_IMAGE_DIMENSION = 960;
const QUALITY_STEPS = [0.82, 0.72, 0.62, 0.52, 0.44];

function createFileName(fileName: string, mimeType: string): string {
  const extension = mimeType === 'image/webp' ? 'webp' : 'jpg';
  const lastDot = fileName.lastIndexOf('.');
  const stem = lastDot > 0 ? fileName.slice(0, lastDot) : fileName;
  return `${stem}.${extension}`;
}

function encodeCanvas(
  canvas: HTMLCanvasElement,
  mimeType: 'image/webp' | 'image/jpeg',
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('The image could not be compressed.'));
        return;
      }
      resolve(blob);
    }, mimeType, quality);
  });
}

async function optimizeOnMainThread(file: File, maxBytes: number): Promise<WorkerResponse> {
  let bitmap: ImageBitmap | undefined;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
    let width = Math.max(1, Math.round(bitmap.width * scale));
    let height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');

    while (true) {
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('The image could not be prepared for compression.');
      context.drawImage(bitmap, 0, 0, width, height);

      for (const quality of QUALITY_STEPS) {
        let blob = await encodeCanvas(canvas, 'image/webp', quality);
        if (blob.type !== 'image/webp') blob = await encodeCanvas(canvas, 'image/jpeg', quality);
        if (blob.size <= maxBytes) return { blob, width, height, quality };
      }

      const longestEdge = Math.max(width, height);
      if (longestEdge <= MIN_IMAGE_DIMENSION) break;
      const nextLongestEdge = Math.max(MIN_IMAGE_DIMENSION, Math.round(longestEdge * 0.82));
      const nextScale = nextLongestEdge / longestEdge;
      width = Math.max(1, Math.round(width * nextScale));
      height = Math.max(1, Math.round(height * nextScale));
    }

    const limitMb = Math.round(maxBytes / (1024 * 1024));
    return { error: `This image could not be compressed to under ${limitMb} MB.` };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'This image could not be optimized in this browser.',
    };
  } finally {
    bitmap?.close();
  }
}

function optimizeInWorker(file: File, maxBytes: number): Promise<WorkerResponse> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('../workers/galleryImageOptimizer.worker.ts', import.meta.url),
      { type: 'module' },
    );
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      worker.terminate();
      resolve(event.data);
    };
    worker.onerror = (event) => {
      worker.terminate();
      reject(new Error(event.message || 'The image worker failed.'));
    };
    worker.postMessage({ file, maxDimension: MAX_IMAGE_DIMENSION, maxBytes });
  });
}

export async function optimizeGalleryImage(file: File, maxBytes: number): Promise<OptimizedGalleryImage> {
  let result: WorkerResponse;
  try {
    result = typeof Worker === 'undefined'
      ? await optimizeOnMainThread(file, maxBytes)
      : await optimizeInWorker(file, maxBytes);
  } catch {
    result = await optimizeOnMainThread(file, maxBytes);
  }
  if (result.fallback) {
    result = await optimizeOnMainThread(file, maxBytes);
  }

  if (!result.blob || !result.width || !result.height || !result.quality) {
    throw new Error(result.error || 'This image could not be optimized. Try saving it as JPG or PNG first.');
  }
  if (!['image/webp', 'image/jpeg'].includes(result.blob.type)) {
    throw new Error('This browser cannot create a WebP or JPEG image from the selected file.');
  }

  return {
    file: new File([result.blob], createFileName(file.name, result.blob.type), {
      type: result.blob.type,
      lastModified: Date.now(),
    }),
    width: result.width,
    height: result.height,
    quality: result.quality,
  };
}
