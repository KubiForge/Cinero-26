import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { uploadGalleryPhoto } from '../services/galleryService';
import './GalleryUpload.css';

const MAX_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_BATCH_SIZE = 30 * 1024 * 1024;
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

let photoIdSequence = 0;

interface SelectedPhoto {
  id: number;
  file: File;
  previewUrl: string;
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
  return selected.some(({ file: existing }) => (
    existing.name === file.name
    && existing.size === file.size
    && existing.lastModified === file.lastModified
    && existing.type === file.type
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
  onRemove: (id: number) => void;
  disabled: boolean;
}

function PhotoCard({ photo, onRemove, disabled }: PhotoCardProps) {
  const [previewFailed, setPreviewFailed] = useState(false);

  return (
    <article className="gallery-photo">
      <div className="gallery-photo__preview">
        {previewFailed ? (
          <div className="gallery-photo__unsupported" role="img" aria-label={`Preview unavailable for ${photo.file.name}`}>
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
            alt={`Preview of ${photo.file.name}`}
            loading="lazy"
            decoding="async"
            onError={() => setPreviewFailed(true)}
          />
        )}
        <button
          type="button"
          className="gallery-photo__remove"
          onClick={() => onRemove(photo.id)}
          disabled={disabled}
          aria-label={`Remove ${photo.file.name}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="gallery-photo__meta">
        <span className="gallery-photo__name" title={photo.file.name}>{photo.file.name}</span>
        <span className="gallery-photo__size">{formatFileSize(photo.file.size)}</span>
      </div>
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

  useEffect(() => () => {
    photosRef.current.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
  }, []);

  const updatePhotos = (nextPhotos: SelectedPhoto[]) => {
    photosRef.current = nextPhotos;
    setPhotos(nextPhotos);
    setTotalSize(nextPhotos.reduce((total, photo) => total + photo.file.size, 0));
    setUploadMessage('');
  };

  const addFiles = (fileList: FileList | File[]) => {
    if (isUploading) return;
    const incomingFiles = Array.from(fileList);
    if (incomingFiles.length === 0) return;

    const nextPhotos = [...photosRef.current];
    const messages: string[] = [];
    let nextTotalSize = nextPhotos.reduce((total, photo) => total + photo.file.size, 0);
    let hasOversizedPhoto = false;

    for (const file of incomingFiles) {
      if (!isSupportedImage(file)) {
        messages.push(`${file.name}: choose a JPG, PNG, WebP, HEIC, or HEIF image.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        messages.push(`${file.name}: the maximum file size is 5 MB.`);
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

      if (nextTotalSize + file.size > MAX_BATCH_SIZE) {
        messages.push('The combined photo size cannot exceed 30 MB.');
        continue;
      }

      nextPhotos.push({
        id: ++photoIdSequence,
        file,
        previewUrl: URL.createObjectURL(file),
      });
      nextTotalSize += file.size;
    }

    updatePhotos(nextPhotos);
    setValidationMessages(messages);
    if (hasOversizedPhoto) {
      void Swal.fire({
        icon: 'warning',
        iconColor: '#f0ad4e',
        title: 'Image Too Large',
        html: `
          <p class="gallery-upload__size-alert-description">
            Images larger than 5 MB cannot be added. Please choose an image that is 5 MB or smaller.
          </p>
          <div class="gallery-upload__size-alert-limit">
            <span>Maximum per image:</span>
            <strong>5 MB</strong>
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

  const removePhoto = (id: number) => {
    const photoToRemove = photosRef.current.find((photo) => photo.id === id);
    if (photoToRemove) URL.revokeObjectURL(photoToRemove.previewUrl);
    updatePhotos(photosRef.current.filter((photo) => photo.id !== id));
    setValidationMessages([]);
  };

  const clearPhotos = () => {
    photosRef.current.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
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
    const selectedPhotos = [...photosRef.current];
    if (selectedPhotos.length === 0 || isUploading) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadTotal(selectedPhotos.length);
    setUploadMessage('');
    setValidationMessages([]);

    const uploadedPhotoIds = new Set<number>();
    let firstError = '';

    try {
      for (const [index, photo] of selectedPhotos.entries()) {
        setUploadProgress(index + 1);
        try {
          await uploadGalleryPhoto(photo.file, uploadedBy.trim());
          uploadedPhotoIds.add(photo.id);
        } catch (error) {
          if (!firstError) {
            firstError = error instanceof Error ? error.message : 'A photo could not be uploaded.';
          }
        }
      }

      const uploadedPhotos = selectedPhotos.filter((photo) => uploadedPhotoIds.has(photo.id));
      const remainingPhotos = photosRef.current.filter((photo) => !uploadedPhotoIds.has(photo.id));

      uploadedPhotos.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
      if (uploadedPhotos.length > 0) {
        updatePhotos(remainingPhotos);
      }

      if (uploadedPhotos.length === selectedPhotos.length) {
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
              JPG, PNG, WebP, HEIC or HEIF · Up to 10 photos · 5 MB each
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
                  <p>{photos.length} of {MAX_FILES} photos · {formatFileSize(totalSize)} total</p>
                </div>
                <div className="gallery-upload__photo-actions">
                  <label className="gallery-upload__add-more" htmlFor="gallery-photo-input">Add more</label>
                  <button type="button" className="gallery-upload__clear" onClick={clearPhotos} disabled={isUploading}>Clear all</button>
                </div>
              </div>
              <div className="gallery-upload__grid">
                {photos.map((photo) => (
                  <PhotoCard key={photo.id} photo={photo} onRemove={removePhoto} disabled={isUploading} />
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
            <button type="submit" className="gallery-upload__submit" disabled={photos.length === 0 || isUploading}>
              <span>
                {isUploading ? `UPLOADING ${uploadProgress} OF ${uploadTotal}` : 'SHARE YOUR PHOTOS'}
              </span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </button>
            <span className="gallery-upload__submit-hint">
              {isUploading ? 'Please keep this page open while photos upload.' : 'Photos stay private until approved.'}
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
