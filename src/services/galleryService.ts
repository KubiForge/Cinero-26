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
  duplicate?: boolean;
}

interface UploadSessionResponse {
  success?: boolean;
  message?: string;
  uploadUrl?: string;
  nextByte?: number;
  complete?: boolean;
  fileId?: string;
}

interface UploadLookupResponse {
  success?: boolean;
  message?: string;
  found?: boolean;
  driveFileId?: string;
  photoId?: string;
  reviewStatus?: string;
}

interface DriveChunkResponse {
  success?: boolean;
  message?: string;
  complete?: boolean;
  nextByte?: number;
  fileId?: string;
}

export interface UploadProgress {
  sentBytes: number;
  totalBytes: number;
  speedBytesPerSecond: number;
}

export interface ResumableUploadState {
  uploadAttempted?: boolean;
  uploadUrl?: string;
  uploadedBytes: number;
  driveFileId?: string;
  photoId?: string;
  reviewStatus?: string;
}

export interface UploadGalleryPhotoResult {
  photoId: string;
  reviewStatus: string;
  duplicate: boolean;
}

export const MAX_GALLERY_FILE_SIZE = 10 * 1024 * 1024;
const CHUNK_SIZE = 4 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 45_000;
const RETRY_DELAYS_MS = [2_000, 5_000, 10_000];
const ACCEPTED_UPLOAD_TYPES = new Set(['image/jpeg', 'image/webp']);

class GalleryUploadError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'GalleryUploadError';
    this.status = status;
  }
}

function isRetryable(error: unknown): boolean {
  if (error instanceof GalleryUploadError) {
    return error.status === undefined
      || error.status === 408
      || error.status === 429
      || (typeof error.status === 'number' && error.status >= 500);
  }
  return error instanceof TypeError || error instanceof DOMException;
}

function wait(milliseconds: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Upload cancelled.', 'AbortError'));
      return;
    }

    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', handleAbort);
      resolve();
    }, milliseconds);
    const handleAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException('Upload cancelled.', 'AbortError'));
    };
    signal.addEventListener('abort', handleAbort, { once: true });
  });
}

function createRequestSignal(parentSignal: AbortSignal): {
  signal: AbortSignal;
  dispose: () => void;
} {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abortParent = () => controller.abort();
  parentSignal.addEventListener('abort', abortParent, { once: true });
  if (parentSignal.aborted) controller.abort();

  return {
    signal: controller.signal,
    dispose: () => {
      window.clearTimeout(timeout);
      parentSignal.removeEventListener('abort', abortParent);
    },
  };
}

async function requestJson<T>(
  url: string,
  init: RequestInit,
  signal: AbortSignal,
): Promise<T> {
  const request = createRequestSignal(signal);
  try {
    const response = await fetch(url, { ...init, signal: request.signal });
    const result = await response.json().catch(() => null) as T & { message?: string } | null;
    if (!response.ok) {
      throw new GalleryUploadError(
        result?.message || `Upload request failed (${response.status}).`,
        response.status,
      );
    }
    if (!result) throw new GalleryUploadError('The upload server returned an invalid response.', 502);
    return result;
  } catch (error) {
    if (signal.aborted) throw new DOMException('Upload cancelled.', 'AbortError');
    if (request.signal.aborted) throw new GalleryUploadError('The upload request timed out.', 408);
    throw error;
  } finally {
    request.dispose();
  }
}

async function withRetries<T>(
  operation: () => Promise<T>,
  signal: AbortSignal,
  onRetry?: (attempt: number) => void,
): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (!isRetryable(error) || attempt >= RETRY_DELAYS_MS.length || signal.aborted) throw error;
      onRetry?.(attempt + 1);
      await wait(RETRY_DELAYS_MS[attempt], signal);
    }
  }
}

async function queryUploadStatus(
  uploadUrl: string,
  file: File,
  uploadToken: string,
  signal: AbortSignal,
): Promise<UploadSessionResponse> {
  return withRetries(
    () => requestJson<UploadSessionResponse>('/api/gallery-upload-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'status',
        uploadUrl,
        fileSize: file.size,
        fileUploadToken: uploadToken,
      }),
    }, signal),
    signal,
  );
}

async function findExistingUpload(
  uploadToken: string,
  signal: AbortSignal,
): Promise<UploadLookupResponse> {
  return withRetries(
    () => requestJson<UploadLookupResponse>('/api/gallery-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'lookup', fileUploadToken: uploadToken }),
    }, signal),
    signal,
  );
}

function uploadChunk(
  file: File,
  uploadUrl: string,
  mimeType: string,
  startByte: number,
  signal: AbortSignal,
  onProgress: (progress: UploadProgress) => void,
): Promise<DriveChunkResponse> {
  const endByte = Math.min(startByte + CHUNK_SIZE, file.size) - 1;
  const chunk = file.slice(startByte, endByte + 1);

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    let settled = false;
    const startedAt = performance.now();

    const cleanup = () => signal.removeEventListener('abort', abortRequest);
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };
    const abortRequest = () => request.abort();

    request.open('PUT', '/api/registration-upload-chunk');
    request.timeout = REQUEST_TIMEOUT_MS;
    request.setRequestHeader('Content-Type', 'application/octet-stream');
    request.setRequestHeader('X-Drive-Upload-Url', uploadUrl);
    request.setRequestHeader('X-Drive-Content-Type', mimeType);
    request.setRequestHeader('X-Drive-Content-Range', `bytes ${startByte}-${endByte}/${file.size}`);
    request.setRequestHeader('X-Gallery-Upload', '1');
    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const elapsedSeconds = Math.max((performance.now() - startedAt) / 1000, 0.1);
      onProgress({
        sentBytes: Math.min(startByte + event.loaded, file.size),
        totalBytes: file.size,
        speedBytesPerSecond: event.loaded / elapsedSeconds,
      });
    };
    request.onload = () => {
      const result = (() => {
        try {
          return JSON.parse(request.responseText) as DriveChunkResponse;
        } catch {
          return null;
        }
      })();

      if (request.status < 200 || request.status >= 300 || !result?.success) {
        fail(new GalleryUploadError(
          result?.message || `Google Drive upload failed (${request.status}).`,
          request.status,
        ));
        return;
      }
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };
    request.onerror = () => fail(new GalleryUploadError('Network error while sending an image chunk.'));
    request.ontimeout = () => fail(new GalleryUploadError('Image chunk upload timed out.', 408));
    request.onabort = () => fail(new DOMException('Upload cancelled.', 'AbortError'));
    signal.addEventListener('abort', abortRequest, { once: true });
    if (signal.aborted) {
      abortRequest();
      return;
    }
    request.send(chunk);
  });
}

export async function uploadGalleryPhoto(
  file: File,
  uploadedBy: string,
  uploadToken: string,
  state: ResumableUploadState,
  signal: AbortSignal,
  onProgress: (progress: UploadProgress) => void,
  onStateChange: (state: ResumableUploadState) => void | Promise<void>,
  onRetry?: (attempt: number) => void,
): Promise<UploadGalleryPhotoResult> {
  if (!ACCEPTED_UPLOAD_TYPES.has(file.type)) {
    throw new GalleryUploadError('Only optimized WebP or JPEG photos are accepted.', 400);
  }
  if (file.size <= 0 || file.size > MAX_GALLERY_FILE_SIZE) {
    throw new GalleryUploadError('The optimized image exceeds the 10 MB limit.', 413);
  }

  const updateState = async (changes: Partial<ResumableUploadState>) => {
    Object.assign(state, changes);
    await onStateChange({ ...state });
  };
  const finalize = async (driveFileId: string): Promise<UploadGalleryPhotoResult> => {
    const result = await withRetries(
      () => requestJson<UploadResponse>('/api/gallery-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          driveFileId,
          fileUploadToken: uploadToken,
          uploadedBy,
        }),
      }, signal),
      signal,
      onRetry,
    );
    if (!result.success || !result.photoId || !result.reviewStatus) {
      throw new GalleryUploadError(result.message || 'The photo could not be finalized.', 502);
    }
    await updateState({ photoId: result.photoId, reviewStatus: result.reviewStatus });
    return {
      photoId: result.photoId,
      reviewStatus: result.reviewStatus,
      duplicate: result.duplicate === true,
    };
  };

  if (state.photoId) {
    return {
      photoId: state.photoId,
      reviewStatus: state.reviewStatus || 'PENDING',
      duplicate: true,
    };
  }
  if (state.driveFileId) return finalize(state.driveFileId);

  if (!state.uploadUrl && state.uploadAttempted) {
    const existing = await findExistingUpload(uploadToken, signal);
    if (existing.found && existing.photoId) {
      await updateState({
        driveFileId: existing.driveFileId,
        photoId: existing.photoId,
        reviewStatus: existing.reviewStatus,
      });
      return {
        photoId: existing.photoId,
        reviewStatus: existing.reviewStatus || 'PENDING',
        duplicate: true,
      };
    }
    if (existing.found && existing.driveFileId) {
      await updateState({ driveFileId: existing.driveFileId });
      return finalize(existing.driveFileId);
    }
  }

  if (state.uploadUrl) {
    try {
      const status = await queryUploadStatus(state.uploadUrl, file, uploadToken, signal);
      if (status.complete && status.fileId) {
        await updateState({ driveFileId: status.fileId, uploadedBytes: file.size });
      } else {
        await updateState({ uploadedBytes: status.nextByte ?? 0 });
      }
    } catch (error) {
      if (!(error instanceof GalleryUploadError) || error.status !== 410) throw error;
      const existing = await findExistingUpload(uploadToken, signal);
      if (existing.found && existing.photoId) {
        await updateState({
          driveFileId: existing.driveFileId,
          photoId: existing.photoId,
          reviewStatus: existing.reviewStatus,
        });
        return {
          photoId: existing.photoId,
          reviewStatus: existing.reviewStatus || 'PENDING',
          duplicate: true,
        };
      }
      if (existing.found && existing.driveFileId) {
        await updateState({ driveFileId: existing.driveFileId, uploadUrl: undefined });
        return finalize(existing.driveFileId);
      }
      await updateState({ uploadAttempted: true, uploadUrl: undefined, uploadedBytes: 0 });
    }
  }

  if (state.driveFileId) return finalize(state.driveFileId);

  if (!state.uploadUrl) {
    const session = await withRetries(
      () => requestJson<UploadSessionResponse>('/api/gallery-upload-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          uploadedBy,
          fileUploadToken: uploadToken,
        }),
      }, signal),
      signal,
      onRetry,
    );
    if (!session.success || !session.uploadUrl) {
      throw new GalleryUploadError(session.message || 'Could not start the photo upload.', 502);
    }
    await updateState({ uploadAttempted: true, uploadUrl: session.uploadUrl, uploadedBytes: 0 });
  }

  let uploadedBytes = state.uploadedBytes;
  let retries = 0;
  while (uploadedBytes < file.size) {
    if (signal.aborted) throw new DOMException('Upload cancelled.', 'AbortError');
    const chunkStart = uploadedBytes;
    try {
      const result = await uploadChunk(
        file,
        state.uploadUrl as string,
        file.type,
        chunkStart,
        signal,
        onProgress,
      );
      if (result.complete) {
        if (!result.fileId) throw new GalleryUploadError('Drive did not confirm the uploaded file.', 502);
        await updateState({ driveFileId: result.fileId, uploadedBytes: file.size });
        break;
      }
      if (
        typeof result.nextByte !== 'number'
        || result.nextByte < chunkStart
        || result.nextByte > file.size
      ) {
        throw new GalleryUploadError('Drive returned an invalid upload offset.', 502);
      }
      uploadedBytes = result.nextByte;
      retries = 0;
      await updateState({ uploadedBytes });
      onProgress({
        sentBytes: uploadedBytes,
        totalBytes: file.size,
        speedBytesPerSecond: 0,
      });
    } catch (error) {
      if (!isRetryable(error) || retries >= RETRY_DELAYS_MS.length || signal.aborted) throw error;
      retries += 1;
      onRetry?.(retries);
      await wait(RETRY_DELAYS_MS[retries - 1], signal);

      const status = await queryUploadStatus(state.uploadUrl as string, file, uploadToken, signal);
      if (status.complete && status.fileId) {
        await updateState({ driveFileId: status.fileId, uploadedBytes: file.size });
        break;
      }
      uploadedBytes = status.nextByte ?? 0;
      await updateState({ uploadedBytes });
    }
  }

  if (!state.driveFileId) {
    const existing = await findExistingUpload(uploadToken, signal);
    if (!existing.found || !existing.driveFileId) {
      throw new GalleryUploadError('Drive could not confirm the completed photo.', 502);
    }
    await updateState({ driveFileId: existing.driveFileId });
  }

  return finalize(state.driveFileId as string);
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
