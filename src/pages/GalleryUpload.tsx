import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import {
  MAX_GALLERY_FILE_SIZE,
  uploadGalleryPhoto,
  type ResumableUploadState,
  type UploadProgress,
} from '../services/galleryService';
import { optimizeGalleryImage } from '../services/galleryImageOptimizer';
import {
  loadGalleryUploads,
  removeGalleryUpload,
  saveGalleryUpload,
  type GalleryUploadRecord,
} from '../services/galleryUploadStore';
import './GalleryUpload.css';

const MAX_FILES = 10;
const MAX_ORIGINAL_FILE_SIZE = 30 * 1024 * 1024;
const MAX_OPTIMIZED_FILE_SIZE = MAX_GALLERY_FILE_SIZE;
const LARGE_IMAGE_THRESHOLD_BYTES = 3 * 1024 * 1024;
const LARGE_IMAGE_TARGET_BYTES = 2 * 1024 * 1024;
const UPLOAD_CONCURRENCY = 1;
const ACCEPTED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif']);
const ACCEPTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence',
]);

interface SelectedPhoto {
  record: GalleryUploadRecord;
  previewUrl: string;
}

interface PhotoProgress {
  sentBytes: number;
  totalBytes: number;
  speedBytesPerSecond: number;
}

function createUploadId(): string {
  return crypto.randomUUID();
}

function createUploadRecord(file: File, uploadedBy: string): GalleryUploadRecord {
  const now = Date.now();
  return {
    id: createUploadId(),
    uploadToken: createUploadId(),
    file,
    originalName: file.name,
    originalSize: file.size,
    originalType: file.type,
    lastModified: file.lastModified,
    uploadedBy,
    status: 'queued',
    uploadedBytes: 0,
    createdAt: now,
    updatedAt: now,
  };
}

function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

function isSupportedImage(file: File): boolean {
  const extension = getFileExtension(file.name);
  const mimeType = file.type.toLowerCase();
  return ACCEPTED_EXTENSIONS.has(extension)
    && (!mimeType || ACCEPTED_MIME_TYPES.has(mimeType));
}

function formatFileSize(size: number): string {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function isDuplicateFile(file: File, selected: SelectedPhoto[]): boolean {
  return selected.some(({ record }) => (
    record.originalName === file.name
    && record.originalSize === file.size
    && record.lastModified === file.lastModified
    && record.originalType === file.type
  ));
}

function showPhotosReviewAlert(icon: 'success' | 'warning') {
  return Swal.fire({
    title: 'Photos are under review',
    html: `
      <p class="gallery-upload__review-alert-copy">
        Approved photos will be available on the official CINERO&apos;26 website.
      </p>
      <a class="gallery-upload__review-alert-link" href="https://cinero26.live/holi-gallery" target="_blank" rel="noreferrer">
        Visit the official gallery
      </a>
    `,
    icon,
    iconColor: '#d5a43e',
    confirmButtonText: 'OK',
    confirmButtonColor: '#d4a642',
    background: '#171518',
    color: '#fff',
    customClass: {
      popup: 'gallery-upload__review-alert',
      title: 'gallery-upload__review-alert-title',
      htmlContainer: 'gallery-upload__review-alert-content',
      confirmButton: 'gallery-upload__review-alert-confirm',
    },
  });
}

interface PhotoCardProps {
  photo: SelectedPhoto;
  progress?: PhotoProgress;
  onRemove: (id: string) => void;
  disabled: boolean;
}

function PhotoCard({ photo, progress, onRemove, disabled }: PhotoCardProps) {
  const [previewFailed, setPreviewFailed] = useState(false);
  const progressPercent = progress
    ? Math.min(100, Math.round((progress.sentBytes / Math.max(progress.totalBytes, 1)) * 100))
    : 0;
  const showProgress = ['optimizing', 'uploading', 'retrying'].includes(photo.record.status);
  const indeterminate = showProgress && (
    photo.record.status === 'optimizing'
    || !progress
    || progress.sentBytes === 0
  );
  const statusLabel = photo.record.status === 'optimizing'
    ? 'Optimizing image'
    : photo.record.status === 'retrying'
      ? 'Retrying upload'
      : photo.record.status === 'uploading'
        ? 'Uploading'
        : photo.record.status === 'failed'
          ? 'Needs retry'
          : photo.record.status === 'cancelled'
            ? 'Paused'
            : 'Ready';

  return (
    <article className="gallery-photo">
      <div className="gallery-photo__preview">
        {previewFailed ? (
          <div className="gallery-photo__unsupported" role="img" aria-label={`Preview unavailable for ${photo.record.originalName}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <span>Preview unavailable</span>
          </div>
        ) : (
          <img
            src={photo.previewUrl}
            alt={`Preview of ${photo.record.originalName}`}
            loading="lazy"
            decoding="async"
            onError={() => setPreviewFailed(true)}
          />
        )}
        <button
          type="button"
          className="gallery-photo__remove"
          onClick={() => onRemove(photo.record.id)}
          disabled={disabled}
          aria-label={`Remove ${photo.record.originalName}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="gallery-photo__meta">
        <span className="gallery-photo__name" title={photo.record.originalName}>{photo.record.originalName}</span>
        <span
          className="gallery-photo__size"
          title={photo.record.optimizedSize
            ? `${formatFileSize(photo.record.originalSize)} original · ${formatFileSize(photo.record.optimizedSize)} upload`
            : formatFileSize(photo.record.originalSize)}
        >
          {photo.record.optimizedSize
            ? `${formatFileSize(photo.record.originalSize)} → ${formatFileSize(photo.record.optimizedSize)}`
            : formatFileSize(photo.record.originalSize)}
        </span>
      </div>
      <div className="gallery-photo__upload-state">
        <span className={`gallery-photo__status gallery-photo__status--${photo.record.status}`}>
          {statusLabel}
        </span>
        <span className="gallery-photo__percent">
          {progress ? `${progressPercent}%` : indeterminate ? 'Working' : ''}
        </span>
        {photo.record.error && <span className="gallery-photo__error">{photo.record.error}</span>}
        {progress && (
          <span className="gallery-photo__transfer-detail">
            {formatFileSize(progress.sentBytes)} of {formatFileSize(progress.totalBytes)}
            {progress.speedBytesPerSecond > 0
              ? ` · ${(progress.speedBytesPerSecond / 1024 / 1024).toFixed(1)} MB/s`
              : ''}
          </span>
        )}
      </div>
      {showProgress && (
        <div
          className="gallery-photo__progress"
          role="progressbar"
          aria-label={`Upload progress for ${photo.record.originalName}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={indeterminate ? undefined : progressPercent}
        >
          <span
            className={indeterminate ? 'is-indeterminate' : ''}
            style={indeterminate ? undefined : { width: `${progressPercent}%` }}
          />
        </div>
      )}
    </article>
  );
}

export default function GalleryUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<SelectedPhoto[]>([]);
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedBy, setUploadedBy] = useState('');
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [uploadMessage, setUploadMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [photoProgress, setPhotoProgress] = useState<Record<string, PhotoProgress>>({});
  const controllersRef = useRef(new Map<string, AbortController>());
  const cancelBatchRef = useRef(false);

  useEffect(() => {
    let active = true;
    const uploadControllers = controllersRef.current;
    loadGalleryUploads().then((records) => {
      if (!active) return;
      const restored = records
        .map((record) => {
          const previewFile = record.optimizedFile instanceof File ? record.optimizedFile : record.file;
          if (!(previewFile instanceof File)) return null;
          return {
            record,
            previewUrl: URL.createObjectURL(previewFile),
          };
        })
        .filter((photo): photo is SelectedPhoto => photo !== null);
      photosRef.current = restored;
      setPhotos(restored);
      setTotalSize(restored.reduce((total, photo) => total + photo.record.originalSize, 0));
    }).catch((error: unknown) => {
      if (active) {
        setUploadMessage(error instanceof Error ? error.message : 'Saved uploads could not be restored.');
      }
    });

    const toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3500,
      background: '#171518',
      color: '#fff',
    });
    const showOnline = () => { void toast.fire({ icon: 'success', title: 'Internet connection restored.' }); };
    const showOffline = () => { void toast.fire({ icon: 'warning', title: 'You are offline. Uploads are paused.' }); };
    window.addEventListener('online', showOnline);
    window.addEventListener('offline', showOffline);

    return () => {
      active = false;
      cancelBatchRef.current = true;
      uploadControllers.forEach((controller) => controller.abort());
      window.removeEventListener('online', showOnline);
      window.removeEventListener('offline', showOffline);
      photosRef.current.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
    };
  }, []);

  const updatePhotos = (nextPhotos: SelectedPhoto[]) => {
    photosRef.current = nextPhotos;
    setPhotos(nextPhotos);
    setTotalSize(nextPhotos.reduce((total, photo) => total + photo.record.originalSize, 0));
  };

  const updatePhotoRecord = (record: GalleryUploadRecord, previewFile?: File) => {
    updatePhotos(photosRef.current.map((photo) => {
      if (photo.record.id !== record.id) return photo;
      if (!previewFile) return { ...photo, record };
      const previewUrl = URL.createObjectURL(previewFile);
      URL.revokeObjectURL(photo.previewUrl);
      return { ...photo, record, previewUrl };
    }));
  };

  const addFiles = (fileList: FileList | File[]) => {
    if (isUploading) return;
    const incomingFiles = Array.from(fileList);
    if (incomingFiles.length === 0) return;

    const nextPhotos = [...photosRef.current];
    const messages: string[] = [];
    let hasOversizedPhoto = false;

    for (const file of incomingFiles) {
      if (!isSupportedImage(file)) {
        messages.push(`${file.name}: choose a JPG, PNG, WebP, HEIC, or HEIF image.`);
        continue;
      }

      if (file.size > MAX_ORIGINAL_FILE_SIZE) {
        messages.push(`${file.name}: the maximum original image size is 30 MB.`);
        hasOversizedPhoto = true;
        continue;
      }

      if (isDuplicateFile(file, nextPhotos)) {
        messages.push(`${file.name}: this photo has already been selected.`);
        continue;
      }

      if (nextPhotos.length >= MAX_FILES) {
        messages.push(`You can select up to ${MAX_FILES} photos per batch.`);
        break;
      }

      const record = createUploadRecord(file, uploadedBy.trim());
      nextPhotos.push({
        record,
        previewUrl: URL.createObjectURL(file),
      });
    }

    updatePhotos(nextPhotos);
    setUploadMessage('');
    setValidationMessages(messages);
    if (hasOversizedPhoto) {
      void Swal.fire({
        icon: 'warning',
        iconColor: '#f0ad4e',
        title: 'Image Too Large',
        html: `
          <p class="gallery-upload__size-alert-description">
            Original images larger than 30 MB cannot be added. Images over 3 MB are optimized toward 2 MB before upload.
          </p>
          <div class="gallery-upload__size-alert-limit">
            <span>Maximum original image:</span>
            <strong>30 MB</strong>
          </div>
        `,
        confirmButtonText: 'Choose Another Image',
        confirmButtonColor: '#d5a43e',
        background: '#171518',
        color: '#fff',
        customClass: {
          popup: 'gallery-upload__size-alert',
          title: 'gallery-upload__size-alert-title',
          htmlContainer: 'gallery-upload__size-alert-content',
          confirmButton: 'gallery-upload__size-alert-confirm',
        },
      });
    }
  };

  const removePhoto = (id: string) => {
    const photoToRemove = photosRef.current.find((photo) => photo.record.id === id);
    if (photoToRemove) URL.revokeObjectURL(photoToRemove.previewUrl);
    updatePhotos(photosRef.current.filter((photo) => photo.record.id !== id));
    void removeGalleryUpload(id).catch((error: unknown) => {
      setUploadMessage(error instanceof Error ? error.message : 'The saved upload could not be removed.');
    });
    setValidationMessages([]);
  };

  const clearPhotos = () => {
    photosRef.current.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
    photosRef.current.forEach(({ record }) => {
      void removeGalleryUpload(record.id).catch((error: unknown) => {
        setUploadMessage(error instanceof Error ? error.message : 'A saved upload could not be removed.');
      });
    });
    updatePhotos([]);
    setValidationMessages([]);
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(event.currentTarget.files ?? []);
    event.currentTarget.value = '';
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(false);
    if (isUploading) return;
    addFiles(event.dataTransfer.files);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isUploading) {
      cancelBatchRef.current = true;
      controllersRef.current.forEach((controller) => controller.abort());
      return;
    }
    const selectedPhotos = [...photosRef.current];
    if (selectedPhotos.length === 0) return;
    if (!navigator.onLine) {
      await Swal.fire({
        title: 'You are offline',
        text: 'Reconnect to the internet, then resume your saved uploads.',
        icon: 'warning',
        confirmButtonColor: '#d4a642',
        background: '#171518',
        color: '#fff',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadTotal(selectedPhotos.length);
    setUploadMessage('');
    setValidationMessages([]);
    cancelBatchRef.current = false;

    const uploadedPhotoIds = new Set<string>();
    let firstError = '';
    let cancelledCount = 0;
    let nextIndex = 0;

    const uploadPhoto = async (photo: SelectedPhoto) => {
      const controller = new AbortController();
      controllersRef.current.set(photo.record.id, controller);
      let record: GalleryUploadRecord = {
        ...photo.record,
        uploadedBy: uploadedBy.trim(),
        status: 'optimizing',
        error: undefined,
      };

      try {
        if (!record.file && !record.optimizedFile) {
          throw new Error('The saved image is no longer available. Please select it again.');
        }
        await saveGalleryUpload(record);
        updatePhotoRecord(record);

        const maxBytes = record.originalSize > LARGE_IMAGE_THRESHOLD_BYTES
          ? LARGE_IMAGE_TARGET_BYTES
          : MAX_OPTIMIZED_FILE_SIZE;
        let optimizedFile = record.optimizedFile;
        const canRecompressSavedFile = !record.uploadAttempted
          && !record.uploadUrl
          && !record.driveFileId;
        const shouldRecompress = record.originalSize > LARGE_IMAGE_THRESHOLD_BYTES
          && Boolean(optimizedFile && optimizedFile.size > maxBytes)
          && canRecompressSavedFile;
        if (!optimizedFile || shouldRecompress) {
          const sourceFile = record.file ?? optimizedFile;
          if (!sourceFile) throw new Error('The saved original image is no longer available.');
          const optimized = await optimizeGalleryImage(sourceFile, maxBytes);
          if (controller.signal.aborted) throw new DOMException('Upload cancelled.', 'AbortError');
          optimizedFile = optimized.file;
          record = {
            ...record,
            file: undefined,
            optimizedFile,
            optimizedName: optimized.file.name,
            optimizedSize: optimized.file.size,
            optimizedMimeType: optimized.file.type,
            status: 'queued',
          };
          await saveGalleryUpload(record);
          updatePhotoRecord(record, optimizedFile);
        } else if (record.file) {
          record = { ...record, file: undefined };
          await saveGalleryUpload(record);
          updatePhotoRecord(record, optimizedFile);
        }

        const resumableState: ResumableUploadState = {
          uploadAttempted: record.uploadAttempted,
          uploadUrl: record.uploadUrl,
          uploadedBytes: record.uploadedBytes,
          driveFileId: record.driveFileId,
          photoId: record.photoId,
        };
        record = { ...record, status: 'uploading' };
        updatePhotoRecord(record);
        setPhotoProgress((current) => ({
          ...current,
          [record.id]: {
            sentBytes: resumableState.uploadedBytes,
            totalBytes: optimizedFile.size,
            speedBytesPerSecond: 0,
          },
        }));
        await uploadGalleryPhoto(
          optimizedFile,
          record.uploadedBy,
          record.uploadToken,
          resumableState,
          controller.signal,
          (progress: UploadProgress) => {
            setPhotoProgress((current) => ({
              ...current,
              [record.id]: {
                sentBytes: progress.sentBytes,
                totalBytes: progress.totalBytes,
                speedBytesPerSecond: progress.speedBytesPerSecond,
              },
            }));
          },
          async (state) => {
            record = {
              ...record,
              ...state,
              status: 'uploading',
              error: undefined,
            };
            updatePhotoRecord(record);
            await saveGalleryUpload(record);
          },
          () => {
            record = { ...record, status: 'retrying' };
            updatePhotoRecord(record);
          },
        );
        await removeGalleryUpload(record.id);
        uploadedPhotoIds.add(record.id);
      } catch (error) {
        const wasCancelled = controller.signal.aborted;
        if (wasCancelled) cancelledCount += 1;
        else if (!firstError) {
          firstError = error instanceof Error ? error.message : 'A photo could not be uploaded.';
        }
        record = {
          ...record,
          status: wasCancelled ? 'cancelled' : 'failed',
          error: wasCancelled ? undefined : (error instanceof Error ? error.message : firstError),
        };
        updatePhotoRecord(record);
        try {
          await saveGalleryUpload(record);
        } catch (storageError) {
          setUploadMessage(storageError instanceof Error
            ? storageError.message
            : 'Upload recovery could not be saved in this browser.');
        }
      } finally {
        controllersRef.current.delete(photo.record.id);
        setPhotoProgress((current) => {
          const next = { ...current };
          delete next[photo.record.id];
          return next;
        });
        setUploadProgress((current) => current + 1);
      }
    };

    try {
      const worker = async () => {
        while (!cancelBatchRef.current && nextIndex < selectedPhotos.length) {
          const photo = selectedPhotos[nextIndex];
          nextIndex += 1;
          await uploadPhoto(photo);
        }
      };
      await Promise.all(
        Array.from({ length: Math.min(UPLOAD_CONCURRENCY, selectedPhotos.length) }, () => worker()),
      );

      const uploadedPhotos = selectedPhotos.filter((photo) => uploadedPhotoIds.has(photo.record.id));
      const remainingPhotos = photosRef.current.filter((photo) => !uploadedPhotoIds.has(photo.record.id));

      uploadedPhotos.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
      if (uploadedPhotos.length > 0) {
        updatePhotos(remainingPhotos);
      }

      if (cancelledCount > 0 && uploadedPhotos.length === 0 && !firstError) {
        await Swal.fire({
          title: 'Uploads paused',
          text: 'Your progress is saved in this browser. You can resume these uploads later.',
          icon: 'info',
          confirmButtonColor: '#d4a642',
          background: '#171518',
          color: '#fff',
        });
      } else if (uploadedPhotos.length === selectedPhotos.length) {
        await showPhotosReviewAlert('success');
      } else if (uploadedPhotos.length > 0) {
        setUploadMessage(firstError);
        await showPhotosReviewAlert('warning');
      } else {
        setUploadMessage(firstError || 'Your photos could not be uploaded. Please try again.');
        await Swal.fire({
          title: 'Upload could not be completed',
          text: firstError || 'Your photos could not be uploaded. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d4a642',
          background: '#171518',
          color: '#fff',
        });
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadTotal(0);
      controllersRef.current.clear();
    }
  };

  const scrollToUploader = () => {
    document.getElementById('photo-uploader')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="gallery-upload">
      <section className="gallery-upload__hero" aria-labelledby="gallery-upload-title">
        <div className="gallery-upload__hero-shade" aria-hidden="true" />
        <div className="gallery-upload__hero-content">
          <p className="gallery-upload__eyebrow">
            <span className="gallery-upload__eyebrow-line" aria-hidden="true" />
            OFFICIAL PHOTO COLLECTION
            <span className="gallery-upload__eyebrow-line" aria-hidden="true" />
          </p>
          <h1 id="gallery-upload-title">YOUR MOMENTS.<br /><span>OUR STORY.</span></h1>
          <p className="gallery-upload__intro">
            Be part of the CINERO&apos;26 memories. Share your photographs and let us celebrate every moment together.
          </p>
          <a
            className="gallery-upload__gallery-promo"
            href="https://cinero26.live/holi-gallery"
            target="_blank"
            rel="noreferrer"
          >
            <span>ALREADY SHARED YOUR PHOTOS?</span>
            <strong>VIEW APPROVED PHOTOS AT <em>CINERO26.LIVE</em></strong>
          </a>
          <button type="button" className="gallery-upload__scroll-button" onClick={scrollToUploader}>
            <span>SHARE YOUR PHOTOS</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M12 5v14m-7-7 7 7 7-7" />
            </svg>
          </button>
        </div>
        <div className="gallery-upload__hero-caption" aria-hidden="true">
          J&apos;PURA VOICE · FILMING DIVISION
        </div>
      </section>

      <section id="photo-uploader" className="gallery-upload__section" aria-labelledby="gallery-uploader-title">
        <div className="gallery-upload__section-heading">
          <p className="gallery-upload__section-kicker">THE MOMENTS THAT MAKE US</p>
          <h2 id="gallery-uploader-title">Share Your Memories</h2>
          <p>Every frame holds a feeling. Add your photographs to the CINERO&apos;26 collection.</p>
        </div>

        <div className="gallery-upload__notice" role="status">
          <span className="gallery-upload__notice-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5m0-8h.01" />
            </svg>
          </span>
          <p>
            <strong>After review, view and download approved photos on the official CINERO&apos;26 website.</strong>{' '}
            Your submissions stay private until approved. Visit{' '}
            <a href="https://cinero26.live/holi-gallery" target="_blank" rel="noreferrer">
              cinero26.live/holi-gallery
            </a>
            .
          </p>
        </div>

        <form className="gallery-upload__card" onSubmit={handleSubmit}>
          <input
            ref={fileInputRef}
            id="gallery-photo-input"
            className="gallery-upload__file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
            multiple
            onChange={handleFileInput}
            aria-describedby="gallery-file-guidance"
            disabled={isUploading}
          />
          <label
            htmlFor="gallery-photo-input"
            className={`gallery-upload__dropzone${dragActive ? ' is-drag-active' : ''}`}
            onDragEnter={(event) => {
              event.preventDefault();
              if (!isUploading) setDragActive(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setDragActive(false);
              }
            }}
            onDrop={handleDrop}
          >
            <span className="gallery-upload__cloud-icon" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15.5 35h-3A8.5 8.5 0 0 1 11 18.1a13 13 0 0 1 25.3 2.4A7.3 7.3 0 0 1 35 35h-2.5" />
                <path d="M24 39V24m-6 6 6-6 6 6" />
              </svg>
            </span>
            <span className="gallery-upload__drop-title">Drag and drop your photos here</span>
            <span className="gallery-upload__drop-subtitle">or browse your device</span>
            <span className="gallery-upload__select-button">SELECT PHOTOS</span>
            <span id="gallery-file-guidance" className="gallery-upload__file-guidance">
              JPG, PNG, WebP, HEIC or HEIF · Up to 10 photos · 30 MB max original · Images over 3 MB target about 2 MB
            </span>
          </label>

          {validationMessages.length > 0 && (
            <div className="gallery-upload__validation" role="alert">
              <strong>Some photos were not added:</strong>
              <ul>
                {validationMessages.map((message, index) => <li key={`${index}-${message}`}>{message}</li>)}
              </ul>
            </div>
          )}

          {photos.length > 0 && (
            <section className="gallery-upload__selected" aria-label="Selected photos">
              <div className="gallery-upload__selected-heading">
                <div>
                  <h3>Your selected photos</h3>
                  <p>
                    {isUploading ? `${uploadProgress} of ${uploadTotal} finished · ` : ''}
                    {photos.length} of {MAX_FILES} photos · {formatFileSize(totalSize)} original size
                  </p>
                </div>
                <div className="gallery-upload__photo-actions">
                  <label className="gallery-upload__add-more" htmlFor="gallery-photo-input">Add more</label>
                  <button type="button" className="gallery-upload__clear" onClick={clearPhotos} disabled={isUploading}>Clear all</button>
                </div>
              </div>
              {isUploading && (
                <div className="gallery-upload__batch-progress">
                  <div
                    className="gallery-upload__batch-progress-track"
                    role="progressbar"
                    aria-label="Photo batch progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={uploadTotal ? Math.round((uploadProgress / uploadTotal) * 100) : 0}
                  >
                    <span
                      style={{
                        width: `${uploadTotal ? (uploadProgress / uploadTotal) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span>
                    {uploadTotal ? Math.round((uploadProgress / uploadTotal) * 100) : 0}% batch complete
                  </span>
                </div>
              )}
              <div className="gallery-upload__grid">
                {photos.map((photo) => (
                  <PhotoCard
                    key={`${photo.record.id}-${photo.previewUrl}`}
                    photo={photo}
                    progress={photoProgress[photo.record.id]}
                    onRemove={removePhoto}
                    disabled={isUploading}
                  />
                ))}
              </div>
            </section>
          )}

          <div className="gallery-upload__name-field">
            <label htmlFor="gallery-uploader-name">YOUR NAME <span>(OPTIONAL)</span></label>
            <input
              id="gallery-uploader-name"
              type="text"
              maxLength={80}
              autoComplete="name"
              placeholder="Enter your name"
              value={uploadedBy}
              onChange={(event) => setUploadedBy(event.currentTarget.value)}
            />
          </div>

          <div className="gallery-upload__submit-row">
            <button type="submit" className="gallery-upload__submit" disabled={photos.length === 0}>
              <span>
                {isUploading
                  ? `CANCEL UPLOADS (${uploadProgress}/${uploadTotal})`
                  : photos.some((photo) => photo.record.status === 'failed' || photo.record.status === 'cancelled')
                    ? 'RESUME / RETRY UPLOADS'
                    : 'SHARE YOUR PHOTOS'}
              </span>
              {isUploading ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M7 7h10v10H7z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M7 17 17 7M7 7h10v10" />
                </svg>
              )}
            </button>
            <span className="gallery-upload__submit-hint">
              {isUploading
                ? 'One photo uploads at a time to keep your device stable. Progress is saved on this device.'
                : 'Uploads can be resumed on this device. Photos stay private until approved.'}
            </span>
          </div>
          {uploadMessage && <p className="gallery-upload__upload-message" role="alert">{uploadMessage}</p>}
        </form>

        <aside className="gallery-upload__privacy">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <p>
            All submitted photographs will be reviewed by the CINERO&apos;26 team. Only approved photographs may appear in the
            official gallery. Submission does not guarantee publication.
          </p>
        </aside>
      </section>
    </main>
  );
}
