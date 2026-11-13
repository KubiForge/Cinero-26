import { callGalleryScript, HOLI_GALLERY_OPEN_TIME } from './_gallery.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  if (Date.now() < HOLI_GALLERY_OPEN_TIME) {
    return res.status(403).json({
      success: false,
      message: 'The Holi Gallery opens after the event on 18 November 2026.',
    });
  }

  try {
    const result = await callGalleryScript('gallery');
    if (result.status !== 'success' || !Array.isArray(result.photos)) {
      throw new Error(typeof result.message === 'string'
        ? result.message
        : 'Unable to load approved gallery photos.');
    }

    const photos = result.photos
      .filter((photo) => photo && typeof photo.photoId === 'string')
      .map((photo) => ({
        photoId: photo.photoId,
        fileName: typeof photo.fileName === 'string' ? photo.fileName : 'CINERO26-photo',
        mimeType: typeof photo.mimeType === 'string' ? photo.mimeType : 'image/jpeg',
        uploadedAt: typeof photo.uploadedAt === 'string' ? photo.uploadedAt : '',
      }));

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ success: true, photos });
  } catch (error) {
    console.error('[gallery] approved photo list failed:', error);
    return res.status(502).json({
      success: false,
      message: 'Unable to load approved photos right now.',
    });
  }
}
