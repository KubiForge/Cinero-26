export interface ApprovedGalleryPhoto {
  photoId: string;
  fileName: string;
  mimeType: string;
  uploadedAt: string;
}

interface GalleryResponse {
  success?: boolean;
  message?: string;
  photos?: ApprovedGalleryPhoto[];
}

interface UploadResponse {
  success?: boolean;
  message?: string;
  photoId?: string;
  reviewStatus?: string;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      const separatorIndex = dataUrl.indexOf(',');
      if (separatorIndex === -1) {
        reject(new Error(`Could not prepare ${file.name} for upload.`));
        return;
      }

      resolve(dataUrl.slice(separatorIndex + 1));
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadGalleryPhoto(file: File, uploadedBy: string): Promise<void> {
  const base64 = await readFileAsBase64(file);
  const extension = file.name.split('.').pop()?.toLowerCase();
  const mimeType = file.type || ({
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif',
  }[extension ?? ''] ?? '');
  const response = await fetch('/api/gallery-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      mimeType,
      base64,
      uploadedBy,
    }),
  });
  const result = await response.json().catch(() => null) as UploadResponse | null;

  if (!response.ok || result?.success !== true || result.reviewStatus !== 'PENDING') {
    throw new Error(result?.message || `${file.name} could not be uploaded.`);
  }
}

export async function fetchApprovedGalleryPhotos(): Promise<ApprovedGalleryPhoto[]> {
  const response = await fetch('/api/gallery', {
    headers: { Accept: 'application/json' },
  });
  const result = await response.json().catch(() => null) as GalleryResponse | null;

  if (!response.ok || result?.success !== true || !Array.isArray(result.photos)) {
    throw new Error(result?.message || 'Unable to load approved gallery photos.');
  }

  return result.photos;
}

export function getGalleryImageUrl(photoId: string, download = false): string {
  const params = new URLSearchParams({ photoId });
  if (download) params.set('download', '1');
  return `/api/gallery-image?${params.toString()}`;
}
