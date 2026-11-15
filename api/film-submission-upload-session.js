import { callGalleryScript } from './_gallery.js';

const DRIVE_MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024 * 1024;
const POSTER_TYPES = new Set(['image/jpeg', 'image/png', 'application/pdf']);
const LABELS = {
  school: new Set(['Poster', 'StudentConfirmation']),
  university: new Set(['Poster', 'Script', 'TeamDeclaration']),
};

function parseBody(body) {
  if (typeof body !== 'string') return body;
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const body = parseBody(req.body);
  const category = typeof body?.category === 'string' ? body.category.toLowerCase() : '';
  const referenceId = typeof body?.referenceId === 'string' ? body.referenceId.trim().toUpperCase() : '';
  const leaderEmail = typeof body?.leaderEmail === 'string' ? body.leaderEmail.trim().toLowerCase() : '';
  const fileLabel = typeof body?.fileLabel === 'string' ? body.fileLabel : '';
  const fileName = typeof body?.fileName === 'string' ? body.fileName.trim() : '';
  const mimeType = typeof body?.mimeType === 'string' ? body.mimeType.toLowerCase() : '';
  const fileSize = body?.fileSize;
  const uploadToken = typeof body?.uploadToken === 'string' ? body.uploadToken : '';
  const isValidCategory = Object.prototype.hasOwnProperty.call(LABELS, category);
  const referencePattern = category === 'school'
    ? /^CNR26-SCH-\d{4}$/
    : /^CNR26-UNI-\d{4}$/;
  const isPoster = fileLabel === 'Poster';
  const validMimeType = isPoster ? POSTER_TYPES.has(mimeType) : mimeType === 'application/pdf';

  if (
    !isValidCategory
    || !referencePattern.test(referenceId)
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leaderEmail)
    || !LABELS[category].has(fileLabel)
    || !fileName
    || fileName.length > 255
    || !validMimeType
    || !Number.isSafeInteger(fileSize)
    || fileSize <= 0
    || fileSize > DRIVE_MAX_FILE_SIZE
    || !/^[a-f\d]{8}-([a-f\d]{4}-){3}[a-f\d]{12}$/i.test(uploadToken)
  ) {
    return res.status(400).json({
      success: false,
      message: 'The file details are invalid. Posters must be JPG, PNG, or PDF; documents must be PDF.',
    });
  }

  try {
    const result = await callGalleryScript('filmSubmissionUploadSession', {}, {
      action: 'filmSubmissionUploadSession',
      category,
      referenceId,
      leaderEmail,
      fileLabel,
      fileName,
      mimeType,
      fileSize,
      uploadToken,
    });

    if (result.status !== 'success' || typeof result.uploadUrl !== 'string') {
      return res.status(result.statusCode === 409 ? 409 : 400).json({
        success: false,
        message: typeof result.message === 'string' ? result.message : 'Could not start this file upload.',
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

    return res.status(200).json({ success: true, uploadUrl: uploadUrl.toString() });
  } catch (error) {
    console.error('[film-submission-upload-session] request failed:', error);
    return res.status(502).json({
      success: false,
      message: error instanceof Error ? error.message : 'Could not start this file upload.',
    });
  }
}
