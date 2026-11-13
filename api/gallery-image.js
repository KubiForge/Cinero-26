import { Readable } from 'node:stream';
import { callGalleryScript, getDriveAccessToken } from './_gallery.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method not allowed.');
  }

  const photoId = typeof req.query?.photoId === 'string'
    ? req.query.photoId
    : new URL(req.url || '/', 'https://localhost').searchParams.get('photoId');
  if (!photoId || !/^[a-zA-Z0-9-]{8,80}$/.test(photoId)) {
    return res.status(400).end('Invalid photo ID.');
  }

  try {
    const photo = await callGalleryScript('galleryPhoto', { photoId });
    if (
      photo.status !== 'success'
      || photo.reviewStatus !== 'APPROVED'
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
  const driveError = await driveResponse.text();

  console.error('[gallery-image] Drive API error:', {
    status: driveResponse.status,
    statusText: driveResponse.statusText,
    response: driveError.slice(0, 1500),
  });

  throw new Error(
    `Google Drive API failed with status ${driveResponse.status}`
  );
}

    const mimeType = typeof photo.mimeType === 'string' && photo.mimeType.startsWith('image/')
      ? photo.mimeType
      : 'application/octet-stream';
    const fileName = typeof photo.fileName === 'string'
      ? photo.fileName.replace(/[^\w.-]/g, '_').slice(0, 180)
      : 'CINERO26-photo';
    const download = new URL(req.url || '/', 'https://localhost').searchParams.get('download') === '1';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `${download ? 'attachment' : 'inline'}; filename="${fileName}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, max-age=60');
    res.statusCode = 200;
    const contentLength = driveResponse.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);

    return Readable.fromWeb(driveResponse.body).pipe(res);
  } catch (error) {
    console.error('[gallery-image] approved photo fetch failed:', error);
    return res.status(502).end('Unable to load this photo.');
  }
}
