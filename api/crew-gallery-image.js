import { Readable } from 'node:stream';
import { getCrewAuthStatus } from './_crew-auth.js';
import { callGalleryScript, getDriveAccessToken } from './_gallery.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method not allowed.');
  }

  const auth = getCrewAuthStatus(req);
  if (!auth.configured) return res.status(503).end('Crew authentication is not configured.');
  if (!auth.authenticated) return res.status(401).end('Unauthorized.');

  const photoId = typeof req.query?.photoId === 'string'
    ? req.query.photoId
    : new URL(req.url || '/', 'https://localhost').searchParams.get('photoId');
  if (!photoId || !/^[a-f\d-]{36}$/i.test(photoId)) {
    return res.status(400).end('Invalid photo ID.');
  }

  const reviewToken = process.env.GALLERY_REVIEW_TOKEN;
  if (!reviewToken || reviewToken.length < 32) {
    console.error('[crew-gallery-image] GALLERY_REVIEW_TOKEN is not configured.');
    return res.status(503).end('Photo review service is not configured.');
  }

  try {
    const photo = await callGalleryScript('galleryReviewPhoto', { photoId, reviewToken });
    if (
      photo.status !== 'success'
      || photo.reviewStatus !== 'PENDING'
      || typeof photo.driveFileId !== 'string'
      || !photo.driveFileId
    ) {
      return res.status(404).end('Photo not found.');
    }

    const accessToken = await getDriveAccessToken();
    const driveResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(photo.driveFileId)}?alt=media`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!driveResponse.ok || !driveResponse.body) {
      if (driveResponse.status === 404) return res.status(404).end('Photo not found.');
      throw new Error('Google Drive could not return the photo for review.');
    }

    const mimeType = typeof photo.mimeType === 'string' && photo.mimeType.startsWith('image/')
      ? photo.mimeType
      : 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, no-store');
    res.statusCode = 200;
    const contentLength = driveResponse.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);

    return Readable.fromWeb(driveResponse.body).pipe(res);
  } catch (error) {
    console.error('[crew-gallery-image] photo preview failed:', error);
    return res.status(502).end('Unable to load this photo.');
  }
}
