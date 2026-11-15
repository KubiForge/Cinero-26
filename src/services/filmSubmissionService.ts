export type FilmSubmissionCategory = 'school' | 'university';

export type FilmSubmissionFileLabel =
  | 'Poster'
  | 'StudentConfirmation'
  | 'Script'
  | 'TeamDeclaration';

export interface RegisteredFilmTeam {
  referenceId: string;
  category: FilmSubmissionCategory;
  teamName: string;
  leaderName: string;
  leaderEmail: string;
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  submitted?: boolean;
  team?: RegisteredFilmTeam;
  uploadUrl?: string;
  complete?: boolean;
  nextByte?: number;
  fileId?: string;
}

export interface UploadedFilmSubmissionFile {
  fileId: string;
  uploadToken: string;
}

const MIME_TYPES_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

async function readResponse(response: Response): Promise<ApiResponse> {
  const result = await response.json().catch(() => null) as ApiResponse | null;
  if (!response.ok || result?.success !== true) {
    throw new Error(result?.message || 'The submission service could not complete your request.');
  }
  return result;
}

export async function verifyFilmSubmissionTeam(
  category: FilmSubmissionCategory,
  teamName: string,
  leaderEmail: string,
): Promise<{ team: RegisteredFilmTeam; submitted: boolean; message?: string }> {
  const response = await fetch('/api/film-submission', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'verify', category, teamName, leaderEmail }),
  });
  const result = await readResponse(response);
  if (!result.team) throw new Error('The registration service returned no team details.');
  return { team: result.team, submitted: result.submitted === true, message: result.message };
}

export async function uploadFilmSubmissionFile(
  file: File,
  category: FilmSubmissionCategory,
  referenceId: string,
  leaderEmail: string,
  fileLabel: FilmSubmissionFileLabel,
): Promise<UploadedFilmSubmissionFile> {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const mimeType = file.type || MIME_TYPES_BY_EXTENSION[extension] || '';
  const uploadToken = crypto.randomUUID();
  const sessionResponse = await fetch('/api/film-submission-upload-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category,
      referenceId,
      leaderEmail,
      fileLabel,
      fileName: file.name,
      mimeType,
      fileSize: file.size,
      uploadToken,
    }),
  });
  const session = await readResponse(sessionResponse);
  if (!session.uploadUrl) throw new Error(`Could not start uploading ${file.name}.`);

  const chunkSize = 4 * 1024 * 1024;
  let nextByte = 0;
  while (nextByte < file.size) {
    const startByte = nextByte;
    const endByte = Math.min(startByte + chunkSize, file.size) - 1;
    const chunkResponse = await fetch('/api/registration-upload-chunk', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Drive-Upload-Url': session.uploadUrl,
        'X-Drive-Content-Type': mimeType,
        'X-Drive-Content-Range': `bytes ${startByte}-${endByte}/${file.size}`,
      },
      body: file.slice(startByte, endByte + 1),
    });
    const chunk = await readResponse(chunkResponse);

    if (chunk.complete) {
      if (!chunk.fileId || endByte + 1 !== file.size) {
        throw new Error(`Google Drive could not confirm ${file.name}.`);
      }
      return { fileId: chunk.fileId, uploadToken };
    }

    if (
      typeof chunk.nextByte !== 'number'
      || chunk.nextByte <= startByte
      || chunk.nextByte > endByte + 1
    ) {
      throw new Error(`Google Drive could not confirm upload progress for ${file.name}.`);
    }
    nextByte = chunk.nextByte;
  }

  throw new Error(`Google Drive did not complete the upload for ${file.name}.`);
}

export async function submitFilmEntry(payload: Record<string, unknown>): Promise<void> {
  const response = await fetch('/api/film-submission', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, action: 'submit' }),
  });
  await readResponse(response);
}
