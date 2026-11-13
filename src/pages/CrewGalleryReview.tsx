import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import {
  FiArrowLeft,
  FiCheck,
  FiClock,
  FiImage,
  FiLogOut,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import BrandLogo from '../components/BrandLogo';
import {
  fetchPendingGalleryPhotos,
  reviewGalleryPhoto,
} from '../services/crewGalleryService';
import type { PendingGalleryPhoto } from '../services/crewGalleryService';
import './CrewGalleryReview.css';

interface CrewGalleryReviewProps {
  onBack: () => void;
  onLogout: () => void;
}

function formatUploadDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function CrewGalleryReviewPage({ onBack, onLogout }: CrewGalleryReviewProps) {
  const [photos, setPhotos] = useState<PendingGalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [processingPhotoId, setProcessingPhotoId] = useState('');

  const loadPhotos = useCallback(async () => {
    try {
      const pendingPhotos = await fetchPendingGalleryPhotos();
      setLoadError('');
      setPhotos(pendingPhotos);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load photos for review.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void fetchPendingGalleryPhotos()
      .then((pendingPhotos) => {
        if (!active) return;
        setLoadError('');
        setPhotos(pendingPhotos);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : 'Unable to load photos for review.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleReview = async (
    photo: PendingGalleryPhoto,
    decision: 'approve' | 'reject' | 'delete',
  ) => {
    if (processingPhotoId) return;

    if (decision === 'delete') {
      const confirmation = await Swal.fire({
        title: 'Delete this photo?',
        text: 'It will be moved to the Drive trash and removed from the review queue.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete photo',
        cancelButtonText: 'Keep photo',
        confirmButtonColor: '#b63c36',
        background: '#171518',
        color: '#fff',
      });
      if (!confirmation.isConfirmed) return;
    }

    setProcessingPhotoId(photo.photoId);
    setActionError('');
    setStatusMessage('');

    try {
      await reviewGalleryPhoto(photo.photoId, decision);
      setPhotos((currentPhotos) => currentPhotos.filter(({ photoId }) => photoId !== photo.photoId));
      setStatusMessage(
        decision === 'approve'
          ? `${photo.fileName} approved and added to the Holi Gallery.`
          : decision === 'reject'
            ? `${photo.fileName} rejected and removed from the review queue.`
            : `${photo.fileName} moved to Drive trash.`,
      );
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to update this photo.');
    } finally {
      setProcessingPhotoId('');
    }
  };

  return (
    <div className="crew-gallery-review">
      <header className="crew-gallery-review__header">
        <div className="crew-gallery-review__brand">
          <BrandLogo
            variant="withoutCaption"
            sizes="(max-width: 768px) 130px, 220px"
            alt="CINERO'26"
            className="crew-gallery-review__logo"
          />
          <span>CREW PORTAL</span>
        </div>
        <div className="crew-gallery-review__header-actions">
          <button type="button" className="crew-gallery-review__header-button" onClick={onBack}>
            <FiArrowLeft aria-hidden="true" />
            Dashboard
          </button>
          <button type="button" className="crew-gallery-review__header-button" onClick={onLogout}>
            <FiLogOut aria-hidden="true" />
            Logout
          </button>
        </div>
      </header>

      <main className="crew-gallery-review__main">
        <section className="crew-gallery-review__intro">
          <span className="crew-gallery-review__kicker">HOLI FEST · PHOTO MODERATION</span>
          <h1>Review photo submissions</h1>
          <p>Approve photos to publish them in the official Holi Gallery, or reject and remove submissions.</p>
        </section>

        <div className="crew-gallery-review__queue-heading">
          <div>
            <h2>Pending review</h2>
            <p>{isLoading ? 'Loading submissions…' : `${photos.length} photo${photos.length === 1 ? '' : 's'} waiting for review`}</p>
          </div>
          <button
            type="button"
            className="crew-gallery-review__refresh"
            onClick={() => {
              setIsLoading(true);
              setLoadError('');
              void loadPhotos();
            }}
            disabled={isLoading || Boolean(processingPhotoId)}
          >
            Refresh
          </button>
        </div>

        {loadError && <p className="crew-gallery-review__alert" role="alert">{loadError}</p>}
        {actionError && <p className="crew-gallery-review__alert" role="alert">{actionError}</p>}
        {statusMessage && <p className="crew-gallery-review__status" role="status">{statusMessage}</p>}

        {!isLoading && !loadError && photos.length === 0 && (
          <div className="crew-gallery-review__empty">
            <FiImage aria-hidden="true" />
            <h2>All caught up</h2>
            <p>New photo submissions will appear here when they are ready for review.</p>
          </div>
        )}

        <section className="crew-gallery-review__grid" aria-label="Photos pending review">
          {photos.map((photo) => {
            const isProcessing = processingPhotoId === photo.photoId;
            return (
              <article className="crew-gallery-review__card" key={photo.photoId}>
                <img
                  className="crew-gallery-review__photo"
                  src={`/api/crew-gallery-image?photoId=${encodeURIComponent(photo.photoId)}`}
                  alt={`Submitted photo: ${photo.fileName}`}
                  loading="lazy"
                />
                <div className="crew-gallery-review__details">
                  <h3 title={photo.fileName}>{photo.fileName}</h3>
                  <p><FiClock aria-hidden="true" /> {formatUploadDate(photo.uploadedAt)}</p>
                  {photo.uploadedBy && <p>Uploaded by {photo.uploadedBy}</p>}
                  <div className="crew-gallery-review__actions">
                    <button
                      type="button"
                      className="crew-gallery-review__action crew-gallery-review__action--approve"
                      onClick={() => void handleReview(photo, 'approve')}
                      disabled={Boolean(processingPhotoId)}
                    >
                      <FiCheck aria-hidden="true" />
                      {isProcessing ? 'Saving…' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      className="crew-gallery-review__action crew-gallery-review__action--reject"
                      onClick={() => void handleReview(photo, 'reject')}
                      disabled={Boolean(processingPhotoId)}
                    >
                      <FiX aria-hidden="true" />
                      Reject
                    </button>
                    <button
                      type="button"
                      className="crew-gallery-review__action crew-gallery-review__action--delete"
                      onClick={() => void handleReview(photo, 'delete')}
                      disabled={Boolean(processingPhotoId)}
                      aria-label={`Delete ${photo.fileName}`}
                    >
                      <FiTrash2 aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
