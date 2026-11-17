interface OptimizeRequest {
  file: File;
  maxDimension: number;
  maxBytes: number;
}

interface OptimizeResponse {
  blob?: Blob;
  width?: number;
  height?: number;
  quality?: number;
  error?: string;
  fallback?: boolean;
}

const MIN_IMAGE_DIMENSION = 960;
const QUALITY_STEPS = [0.82, 0.72, 0.62, 0.52, 0.44];

async function optimize({ file, maxDimension, maxBytes }: OptimizeRequest): Promise<OptimizeResponse> {
  let bitmap: ImageBitmap | undefined;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    let width = Math.max(1, Math.round(bitmap.width * scale));
    let height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = new OffscreenCanvas(width, height);

    while (true) {
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('The image could not be prepared for compression.');
      context.drawImage(bitmap, 0, 0, width, height);

      for (const quality of QUALITY_STEPS) {
        let blob = await canvas.convertToBlob({ type: 'image/webp', quality });
        if (blob.type !== 'image/webp') {
          blob = await canvas.convertToBlob({ type: 'image/jpeg', quality });
        }
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

self.onmessage = async (event: MessageEvent<OptimizeRequest>) => {
  if (typeof OffscreenCanvas === 'undefined' || typeof createImageBitmap === 'undefined') {
    self.postMessage({ fallback: true });
    return;
  }
  const result = await optimize(event.data);
  self.postMessage(result);
};
