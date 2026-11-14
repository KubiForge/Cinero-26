import { callGalleryScript } from './_gallery.js';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence',
]);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const uploadToken = process.env.GALLERY_UPLOAD_TOKEN;
  if (!uploadToken || uploadToken.length < 32) {
    console.error('[gallery-upload-session] GALLERY_UPLOAD_TOKEN is not configured.');
    return res.status(503).json({
      success: false,
      message: 'Photo upload service is not configured yet.',
    });
  }

  const body = typeof req.body === 'string'
    ? (() => {
        try {
          return JSON.parse(req.body);
        } catch {
          return null;
        }
      })()
    : req.body;

  const fileName = typeof body?.fileName === 'string' ? body.fileName.trim() : '';
  const mimeType = typeof body?.mimeType === 'string' ? body.mimeType.toLowerCase() : '';
  const fileSize = body?.fileSize;
  const uploadedBy = typeof body?.uploadedBy === 'string' ? body.uploadedBy.trim() : '';
  const fileUploadToken = typeof body?.fileUploadToken === 'string' ? body.fileUploadToken : '';

  if (
    !fileName
    || fileName.length > 180
    || !ALLOWED_MIME_TYPES.has(mimeType)
    || !Number.isSafeInteger(fileSize)
    || fileSize <= 0
    || fileSize > MAX_FILE_BYTES
    || uploadedBy.length > 80
    || !/^[a-f\d]{8}-([a-f\d]{4}-){3}[a-f\d]{12}$/i.test(fileUploadToken)
  ) {
    return res.status(400).json({
      success: false,
      message: 'The photo details are invalid or unsupported.',
    });
  }

  try {
    const result = await callGalleryScript('galleryUploadSession', {}, {
      action: 'galleryUploadSession',
      galleryUploadToken: uploadToken,
      fileName,
      mimeType,
      fileSize,
      uploadedBy,
      fileUploadToken,
    });

    if (result.status !== 'success' || typeof result.uploadUrl !== 'string') {
      return res.status(502).json({
        success: false,
        message: typeof result.message === 'string'
          ? result.message
          : 'Could not start the photo upload.',
      });
    }

    const uploadUrl = new URL(result.uploadUrl);
    if (
      uploadUrl.origin !== 'https://www.googleapis.com'
      || uploadUrl.pathname !== '/upload/drive/v3/files'
      || uploadUrl.searchParams.get('uploadType') !== 'resumable'
      || !uploadUrl.searchParams.has('upload_id')
    ) {
      throw new Error('Google Drive returned an invalid upload URL.');
    }

    return res.status(200).json({
      success: true,
      uploadUrl: uploadUrl.toString(),
    });
  } catch (error) {
    console.error('[gallery-upload-session] Could not start upload:', error);
    return res.status(502).json({
      success: false,
      message: 'Could not start the photo upload. Please try again.',
    });
  }
}
