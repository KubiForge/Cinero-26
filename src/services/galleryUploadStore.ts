export type GalleryUploadStatus =
  | 'queued'
  | 'optimizing'
  | 'uploading'
  | 'retrying'
  | 'failed'
  | 'cancelled'
  | 'completed';

export interface GalleryUploadRecord {
  id: string;
  uploadToken: string;
  file?: File;
  optimizedFile?: File;
  originalName: string;
  originalSize: number;
  originalType: string;
  lastModified: number;
  optimizedName?: string;
  optimizedSize?: number;
  optimizedMimeType?: string;
  uploadedBy: string;
  status: GalleryUploadStatus;
  uploadAttempted?: boolean;
  uploadUrl?: string;
  uploadedBytes: number;
  driveFileId?: string;
  photoId?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

const DATABASE_NAME = 'cinero-gallery-uploads';
const DATABASE_VERSION = 1;
const STORE_NAME = 'uploads';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('This browser does not support resumable upload storage.'));
      return;
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open upload storage.'));
    request.onblocked = () => reject(new Error('Upload storage is busy in another browser tab.'));
  });
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Upload storage failed.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Upload storage was interrupted.'));
  });
}

export async function loadGalleryUploads(): Promise<GalleryUploadRecord[]> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).getAll() as IDBRequest<GalleryUploadRecord[]>;
    const records = await new Promise<GalleryUploadRecord[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('Could not restore saved uploads.'));
    });

    return records
      .map((record) => ({
        ...record,
        status: ['uploading', 'optimizing', 'retrying'].includes(record.status) ? 'queued' : record.status,
      }))
      .sort((left, right) => left.createdAt - right.createdAt);
  } finally {
    database.close();
  }
}

export async function saveGalleryUpload(record: GalleryUploadRecord): Promise<void> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put({ ...record, updatedAt: Date.now() });
    await transactionComplete(transaction);
  } finally {
    database.close();
  }
}

export async function removeGalleryUpload(id: string): Promise<void> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(id);
    await transactionComplete(transaction);
  } finally {
    database.close();
  }
}
