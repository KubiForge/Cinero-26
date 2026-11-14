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

function detectImageMimeType(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }

  if (
    bytes.length >= 8
    && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return 'image/png';
  }

  if (
    bytes.length >= 12
    && bytes.toString('ascii', 0, 4) === 'RIFF'
    && bytes.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }

  if (bytes.length >= 12 && bytes.toString('ascii', 4, 8) === 'ftyp') {
    const brand = bytes.toString('ascii', 8, 12).toLowerCase();
    if (['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis'].includes(brand)) return 'image/heic';
    if (['mif1', 'msf1'].includes(brand)) return 'image/heif';
  }

  return '';
}

function normalizeFileName(fileName, mimeType) {
  const extensions = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif',
    'image/heic-sequence': 'heic',
    'image/heif-sequence': 'heif',
  };
  const extension = extensions[mimeType];
  const lastDot = fileName.lastIndexOf('.');
  const stem = lastDot > 0 ? fileName.slice(0, lastDot) : fileName;
  return `${stem}.${extension}`;
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4.5mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const uploadToken = process.env.GALLERY_UPLOAD_TOKEN;
  if (!uploadToken || uploadToken.length < 32) {
    console.error('[gallery-upload] GALLERY_UPLOAD_TOKEN is not configured.');
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
  const requestedMimeType = typeof body?.mimeType === 'string' ? body.mimeType.toLowerCase() : '';
  const base64 = typeof body?.base64 === 'string' ? body.base64 : '';
  const uploadedBy = typeof body?.uploadedBy === 'string' ? body.uploadedBy.trim() : '';
  const driveFileId = typeof body?.driveFileId === 'string' ? body.driveFileId.trim() : '';
  const fileUploadToken = typeof body?.fileUploadToken === 'string' ? body.fileUploadToken : '';

  if (
    !fileName
    || fileName.length > 180
    || !ALLOWED_MIME_TYPES.has(requestedMimeType)
    || (!base64 && !driveFileId)
    || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64)
    || uploadedBy.length > 80
    || (driveFileId && !/^[a-f\d]{8}-([a-f\d]{4}-){3}[a-f\d]{12}$/i.test(fileUploadToken))
  ) {
    return res.status(400).json({
      success: false,
      message: 'The photo details are invalid or unsupported.',
    });
  }

  let uploadData;
  if (driveFileId) {
    uploadData = {
      action: 'galleryUpload',
      galleryUploadToken: uploadToken,
      fileName: normalizeFileName(fileName, requestedMimeType),
      mimeType: requestedMimeType,
      driveFileId,
      fileUploadToken,
      uploadedBy,
    };
  } else {
    const photoBytes = Buffer.from(base64, 'base64');
    if (
      photoBytes.length === 0
      || photoBytes.length > MAX_FILE_BYTES
      || photoBytes.toString('base64') !== base64
    ) {
      return res.status(413).json({
        success: false,
        message: 'Each photo must be smaller than or equal to 5 MB.',
      });
    }

    const mimeType = detectImageMimeType(photoBytes);
    if (!mimeType) {
      return res.status(400).json({
        success: false,
        message: 'The selected file is not a supported image.',
      });
    }

    uploadData = {
      action: 'galleryUpload',
      galleryUploadToken: uploadToken,
      fileName: normalizeFileName(fileName, mimeType),
      mimeType,
      base64,
      uploadedBy,
    };
  }

  try {
    const result = await callGalleryScript('galleryUpload', {}, uploadData);

    if (result.status !== 'success' || !result.photoId || result.reviewStatus !== 'PENDING') {
      const message = typeof result.message === 'string'
        ? result.message
        : 'Google Sheets did not confirm the photo upload.';
      return res.status(502).json({ success: false, message });
    }

    return res.status(200).json({
      success: true,
      photoId: result.photoId,
      reviewStatus: 'PENDING',
    });
  } catch (error) {
    console.error('[gallery-upload] photo save failed:', error);
    return res.status(502).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unable to save this photo.',
    });
  }
}
