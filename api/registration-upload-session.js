import { callGalleryScript } from './_gallery.js';

const MAX_DRIVE_FILE_SIZE = 5 * 1024 * 1024 * 1024 * 1024;
const ALLOWED_FILE_LABELS = new Set(['StudentID', 'PaymentSlip']);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      message: 'Method not allowed.',
    });
  }

  const registrationOpenTime = new Date('2026-10-27T00:00:00+05:30').getTime();
  const registrationCloseTime = new Date('2026-12-15T00:00:00+05:30').getTime();
  if (Date.now() < registrationOpenTime || Date.now() >= registrationCloseTime) {
    return res.status(403).json({
      success: false,
      message: 'Registration is not currently open.',
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
  const referenceId = typeof body?.referenceId === 'string' ? body.referenceId : '';
  const fileLabel = typeof body?.fileLabel === 'string' ? body.fileLabel : '';
  const uploadToken = typeof body?.uploadToken === 'string' ? body.uploadToken : '';

  if (
    !fileName
    || fileName.length > 255
    || !(mimeType === 'application/pdf' || /^image\/[a-z0-9.+-]+$/.test(mimeType))
    || !Number.isSafeInteger(fileSize)
    || fileSize <= 0
    || fileSize > MAX_DRIVE_FILE_SIZE
    || !/^CNR26-(SCH|UNI)-\d{4}$/.test(referenceId)
    || !ALLOWED_FILE_LABELS.has(fileLabel)
    || !/^[a-f\d]{8}-([a-f\d]{4}-){3}[a-f\d]{12}$/i.test(uploadToken)
  ) {
    return res.status(400).json({
      success: false,
      message: 'The upload details are invalid or unsupported.',
    });
  }

  try {
    const result = await callGalleryScript('registrationUploadSession', {}, {
      action: 'registrationUploadSession',
      fileName,
      mimeType,
      fileSize,
      referenceId,
      fileLabel,
      uploadToken,
    });

    if (result.status !== 'success' || typeof result.uploadUrl !== 'string') {
      return res.status(502).json({
        success: false,
        message: typeof result.message === 'string'
          ? result.message
          : 'Could not start the file upload.',
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
    console.error('[registration-upload-session] Could not start upload:', error);
    return res.status(502).json({
      success: false,
      message: 'Could not start the file upload. Please try again.',
    });
  }
}
