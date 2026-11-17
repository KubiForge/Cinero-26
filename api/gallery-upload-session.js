import { callGalleryScript } from '../lib/server/gallery.js';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/webp']);

function parseBody(body) {
  if (typeof body !== 'string') return body;
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

function isValidUploadUrl(value) {
  try {
    const url = new URL(value);
    return url.origin === 'https://www.googleapis.com'
      && url.pathname === '/upload/drive/v3/files'
      && url.searchParams.get('uploadType') === 'resumable'
      && Boolean(url.searchParams.get('upload_id'));
  } catch {
    return false;
  }
}

async function getUploadStatus(uploadUrl, fileSize) {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Range': `bytes */${fileSize}` },
    redirect: 'manual',
  });

  if (response.status === 308) {
    const range = response.headers.get('range');
    const match = range && /^bytes=0-(\d+)$/.exec(range);
    const nextByte = match ? Number(match[1]) + 1 : 0;
    if (!Number.isSafeInteger(nextByte) || nextByte > fileSize) {
      throw new Error('Google Drive returned an invalid upload offset.');
    }
    return { complete: false, nextByte };
  }

  if (response.status === 200 || response.status === 201) {
    const result = await response.json().catch(() => null);
    if (typeof result?.id !== 'string') {
      throw new Error('Google Drive returned an invalid completion response.');
    }
    return { complete: true, fileId: result.id, nextByte: fileSize };
  }

  if (response.status === 404 || response.status === 410) {
    const error = new Error('The Google Drive upload session has expired.');
    error.status = 410;
    throw error;
  }

  const error = new Error('Could not check the Google Drive upload status.');
  error.status = response.status;
  throw error;
}

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

  const body = parseBody(req.body);
  const action = typeof body?.action === 'string' ? body.action : 'create';
  if (action === 'status') {
    const uploadUrl = typeof body?.uploadUrl === 'string' ? body.uploadUrl : '';
    const fileSize = body?.fileSize;
    const fileUploadToken = typeof body?.fileUploadToken === 'string' ? body.fileUploadToken : '';
    if (
      !isValidUploadUrl(uploadUrl)
      || !Number.isSafeInteger(fileSize)
      || fileSize <= 0
      || fileSize > MAX_FILE_BYTES
      || !/^[a-f\d]{8}-([a-f\d]{4}-){3}[a-f\d]{12}$/i.test(fileUploadToken)
    ) {
      return res.status(400).json({ success: false, message: 'The upload status request is invalid.' });
    }

    try {
      const status = await getUploadStatus(uploadUrl, fileSize);
      return res.status(200).json({ success: true, ...status });
    } catch (error) {
      if (error.status === 410) {
        return res.status(410).json({ success: false, message: error.message });
      }
      console.error('[gallery-upload-session] Could not check upload status:', error);
      return res.status(error.status >= 500 ? 502 : 503).json({
        success: false,
        message: 'Could not check the photo upload status. Please retry.',
      });
    }
  }
  if (action !== 'create') {
    return res.status(400).json({ success: false, message: 'The upload action is invalid.' });
  }

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

    if (!isValidUploadUrl(result.uploadUrl)) {
      throw new Error('Google Drive returned an invalid upload URL.');
    }

    return res.status(200).json({
      success: true,
      uploadUrl: result.uploadUrl,
    });
  } catch (error) {
    console.error('[gallery-upload-session] Could not start upload:', error);
    return res.status(502).json({
      success: false,
      message: 'Could not start the photo upload. Please try again.',
    });
  }
}
