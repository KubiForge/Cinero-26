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

interface UploadSessionResponse {
  success?: boolean;
  message?: string;
  uploadUrl?: string;
}

interface DriveChunkResponse {
  success?: boolean;
  message?: string;
  complete?: boolean;
  nextByte?: number;
  fileId?: string;
}

export async function uploadGalleryPhoto(file: File, uploadedBy: string): Promise<void> {
  const maxFileSize = 5 * 1024 * 1024;
  if (file.size > maxFileSize) {
    throw new Error('Each photo must be smaller than or equal to 5 MB.');
  }

  const extension = file.name.split('.').pop()?.toLowerCase();
  const resolvedMimeType = file.type || ({
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif',
  }[extension ?? ''] ?? '');
  const mimeType = resolvedMimeType === 'image/heic-sequence'
    ? 'image/heic'
    : resolvedMimeType === 'image/heif-sequence'
      ? 'image/heif'
      : resolvedMimeType;

  const fileUploadToken = crypto.randomUUID();
  const sessionResponse = await fetch('/api/gallery-upload-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      mimeType,
      fileSize: file.size,
      uploadedBy,
      fileUploadToken,
    }),
  });
  const sessionResult = await sessionResponse.json().catch(() => null) as UploadSessionResponse | null;
  if (!sessionResponse.ok || sessionResult?.success !== true || !sessionResult.uploadUrl) {
    throw new Error(sessionResult?.message || `${file.name} could not be uploaded.`);
  }

  const chunkSize = 4 * 1024 * 1024;
  let nextByte = 0;
  let driveFileId = '';
  while (nextByte < file.size) {
    const startByte = nextByte;
    const endByte = Math.min(startByte + chunkSize, file.size) - 1;
    const chunkResponse = await fetch('/api/registration-upload-chunk', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Drive-Upload-Url': sessionResult.uploadUrl,
        'X-Drive-Content-Type': mimeType,
        'X-Drive-Content-Range': `bytes ${startByte}-${endByte}/${file.size}`,
      },
      body: file.slice(startByte, endByte + 1),
    });
    const chunkResult = await chunkResponse.json().catch(() => null) as DriveChunkResponse | null;
    if (!chunkResponse.ok || chunkResult?.success !== true) {
      throw new Error(chunkResult?.message || `${file.name} could not be uploaded.`);
    }

    if (chunkResult.complete) {
      if (!chunkResult.fileId) {
        throw new Error(`Google Drive could not confirm ${file.name}.`);
      }
      driveFileId = chunkResult.fileId;
      break;
    }

    if (
      typeof chunkResult.nextByte !== 'number'
      || chunkResult.nextByte <= startByte
      || chunkResult.nextByte > endByte + 1
    ) {
      throw new Error(`Google Drive could not confirm the upload progress for ${file.name}.`);
    }
    nextByte = chunkResult.nextByte;
  }

  if (!driveFileId) {
    throw new Error(`Google Drive did not complete the upload for ${file.name}.`);
  }

  const response = await fetch('/api/gallery-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      mimeType,
      driveFileId,
      fileUploadToken,
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
