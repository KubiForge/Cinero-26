export interface PendingGalleryPhoto {
  photoId: string;
  fileName: string;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface GalleryReviewResponse {
  success?: boolean;
  message?: string;
  photos?: PendingGalleryPhoto[];
}

export async function fetchPendingGalleryPhotos(): Promise<PendingGalleryPhoto[]> {
  const response = await fetch('/api/crew-gallery', {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  const result = await response.json().catch(() => null) as GalleryReviewResponse | null;

  if (!response.ok || result?.success !== true || !Array.isArray(result.photos)) {
    throw new Error(result?.message || 'Unable to load photos for review.');
  }

  return result.photos;
}

export async function reviewGalleryPhoto(
  photoId: string,
  decision: 'approve' | 'reject' | 'delete',
): Promise<void> {
  const response = await fetch('/api/crew-gallery', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photoId, decision }),
  });
  const result = await response.json().catch(() => null) as GalleryReviewResponse | null;

  if (!response.ok || result?.success !== true) {
    throw new Error(result?.message || 'Unable to update this photo.');
  }
}
