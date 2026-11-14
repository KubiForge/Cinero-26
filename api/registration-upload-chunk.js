const MAX_CHUNK_BYTES = 4 * 1024 * 1024;
const MAX_DRIVE_FILE_SIZE = 5 * 1024 * 1024 * 1024 * 1024;
const CHUNK_ALIGNMENT_BYTES = 256 * 1024;

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readChunk(req) {
  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of req) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += bytes.length;
    if (totalBytes > MAX_CHUNK_BYTES) {
      return null;
    }
    chunks.push(bytes);
  }
  return Buffer.concat(chunks, totalBytes);
}

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT');
    return res.status(405).json({
      success: false,
      message: 'Method not allowed.',
    });
  }

  const uploadUrlValue = req.headers['x-drive-upload-url'];
  const contentType = req.headers['x-drive-content-type'];
  const contentRange = req.headers['x-drive-content-range'];
  if (
    typeof uploadUrlValue !== 'string'
    || typeof contentType !== 'string'
    || typeof contentRange !== 'string'
  ) {
    return res.status(400).json({
      success: false,
      message: 'The upload chunk details are missing.',
    });
  }

  let uploadUrl;
  try {
    uploadUrl = new URL(uploadUrlValue);
  } catch {
    return res.status(400).json({
      success: false,
      message: 'The upload session is invalid.',
    });
  }

  if (
    uploadUrl.origin !== 'https://www.googleapis.com'
    || uploadUrl.pathname !== '/upload/drive/v3/files'
    || uploadUrl.searchParams.get('uploadType') !== 'resumable'
    || !uploadUrl.searchParams.has('upload_id')
  ) {
    return res.status(400).json({
      success: false,
      message: 'The upload session is invalid.',
    });
  }
  if (!(contentType === 'application/pdf' || /^image\/[a-z0-9.+-]+$/.test(contentType))) {
    return res.status(400).json({
      success: false,
      message: 'The upload file type is invalid.',
    });
  }

  const rangeMatch = /^bytes (\d+)-(\d+)\/(\d+)$/.exec(contentRange);
  if (!rangeMatch) {
    return res.status(400).json({
      success: false,
      message: 'The upload chunk range is invalid.',
    });
  }

  const startByte = Number(rangeMatch[1]);
  const endByte = Number(rangeMatch[2]);
  const totalFileSize = Number(rangeMatch[3]);
  const chunkSize = endByte - startByte + 1;
  if (
    !Number.isSafeInteger(startByte)
    || !Number.isSafeInteger(endByte)
    || !Number.isSafeInteger(totalFileSize)
    || startByte < 0
    || endByte < startByte
    || totalFileSize <= endByte
    || totalFileSize > MAX_DRIVE_FILE_SIZE
    || chunkSize > MAX_CHUNK_BYTES
    || startByte % CHUNK_ALIGNMENT_BYTES !== 0
    || (endByte + 1 < totalFileSize && chunkSize % CHUNK_ALIGNMENT_BYTES !== 0)
  ) {
    return res.status(400).json({
      success: false,
      message: 'The upload chunk range is invalid.',
    });
  }

  let chunk;
  try {
    chunk = await readChunk(req);
  } catch (error) {
    console.error('[registration-upload-chunk] Could not read request body:', error);
    return res.status(400).json({
      success: false,
      message: 'The upload chunk could not be read. Please try again.',
    });
  }
  if (!chunk || chunk.length !== chunkSize) {
    return res.status(chunk ? 400 : 413).json({
      success: false,
      message: chunk
        ? 'The upload chunk size does not match its range.'
        : 'The upload chunk is too large.',
    });
  }

  let driveResponse;
  try {
    driveResponse = await fetch(uploadUrl.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'Content-Range': contentRange,
      },
      body: chunk,
      redirect: 'manual',
    });
  } catch (error) {
    console.error('[registration-upload-chunk] Google Drive request failed:', error);
    return res.status(502).json({
      success: false,
      message: 'Google Drive could not receive this file chunk. Please try again.',
    });
  }

  if (driveResponse.status === 308) {
    const receivedRange = driveResponse.headers.get('range');
    const receivedRangeMatch = receivedRange && /^bytes=0-(\d+)$/.exec(receivedRange);
    const nextByte = receivedRangeMatch ? Number(receivedRangeMatch[1]) + 1 : NaN;
    if (
      !Number.isSafeInteger(nextByte)
      || nextByte <= startByte
      || nextByte > endByte + 1
    ) {
      return res.status(502).json({
        success: false,
        message: 'Google Drive could not confirm the uploaded file chunk.',
      });
    }

    return res.status(200).json({
      success: true,
      complete: false,
      nextByte,
    });
  }

  if (driveResponse.status === 200 || driveResponse.status === 201) {
    const driveResult = await driveResponse.json().catch(() => null);
    if (typeof driveResult?.id !== 'string' || endByte + 1 !== totalFileSize) {
      return res.status(502).json({
        success: false,
        message: 'Google Drive returned an invalid upload confirmation.',
      });
    }

    return res.status(200).json({
      success: true,
      complete: true,
      fileId: driveResult.id,
    });
  }

  const errorText = await driveResponse.text();
  let message = 'Google Drive could not save this file. Please try again.';
  try {
    const driveError = JSON.parse(errorText);
    if (typeof driveError?.error?.message === 'string') {
      message = driveError.error.message;
    }
  } catch {
    // Keep the generic message when Google Drive returns a non-JSON error.
  }

  console.error('[registration-upload-chunk] Google Drive rejected a file chunk:', {
    status: driveResponse.status,
    message,
  });
  return res.status(502).json({ success: false, message });
}
