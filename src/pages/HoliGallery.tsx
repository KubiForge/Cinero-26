import { useEffect, useState } from 'react';
import {
  fetchApprovedGalleryPhotos,
  getGalleryImageUrl,
} from '../services/galleryService';
import type { ApprovedGalleryPhoto } from '../services/galleryService';
import './HoliGallery.css';

const HOLI_GALLERY_OPEN_TIME = new Date('2026-11-18T00:00:00+05:30').getTime();

export default function HoliGalleryPage() {
  const [isGalleryOpen, setIsGalleryOpen] = useState(
    () => Date.now() >= HOLI_GALLERY_OPEN_TIME,
  );
  const [photos, setPhotos] = useState<ApprovedGalleryPhoto[]>([]);
  const [galleryStatus, setGalleryStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (isGalleryOpen) return;

    const timeUntilOpen = Math.max(0, HOLI_GALLERY_OPEN_TIME - Date.now());
    const openTimer = window.setTimeout(() => setIsGalleryOpen(true), timeUntilOpen);
    return () => window.clearTimeout(openTimer);
  }, [isGalleryOpen]);

  useEffect(() => {
    if (!isGalleryOpen) return;

    let active = true;
    void fetchApprovedGalleryPhotos()
      .then((approvedPhotos) => {
        if (!active) return;
        setPhotos(approvedPhotos);
        setGalleryStatus('ready');
      })
      .catch(() => {
        if (!active) return;
        setGalleryStatus('error');
      });

    return () => {
      active = false;
    };
  }, [isGalleryOpen]);

  return (
    <main className="holi-gallery-page">
      <div className="holi-gallery-page__glow" aria-hidden="true" />
      <div className="holi-gallery-page__container">
        <header className="holi-gallery-page__header">
          <span className="holi-gallery-page__eyebrow">CINERO'26 · HOLI FEST</span>
          <h1>Holi Gallery</h1>
          <p>Celebrating the colour and creativity of CINERO'26 Holi Fest.</p>
        </header>

        <section className="holi-gallery-page__content" aria-label="Holi Fest gallery">
          <figure className="holi-gallery-page__poster">
            <img
              src="/images/holi-fest-poster.png"
              alt="Official CINERO'26 Holi Fest poster"
              width={1080}
              height={1080}
            />
            <figcaption>Official Holi Fest Poster</figcaption>
          </figure>

          <div className="holi-gallery-page__empty">
            <span className="holi-gallery-page__empty-label">
              {isGalleryOpen ? 'EVENT GALLERY' : 'GALLERY NOT OPEN YET'}
            </span>
            <h2>
              {!isGalleryOpen
                ? 'Opens after Holi Fest'
                : galleryStatus === 'loading'
                  ? 'Loading approved photos'
                  : galleryStatus === 'error'
                    ? 'Gallery temporarily unavailable'
                    : photos.length > 0
                      ? 'Approved event photos'
                      : 'Photos coming soon'}
            </h2>
            <p>
              {isGalleryOpen
                ? galleryStatus === 'loading'
                  ? 'Please wait while we load the photos approved by the CINERO\'26 team.'
                  : galleryStatus === 'error'
                    ? 'We could not load the gallery right now. Please try again later.'
                    : photos.length > 0
                      ? `${photos.length} approved photo${photos.length === 1 ? '' : 's'} available to view and download.`
                      : 'Approved event photos will appear here after the CINERO\'26 team reviews them.'
                : 'The Holi Gallery opens after the event on 18 November 2026. Approved event photos will be added after review.'}
            </p>
          </div>
        </section>

        {isGalleryOpen && photos.length > 0 && (
          <section className="holi-gallery-page__photos" aria-label="Approved Holi Fest photos">
            {photos.map((photo) => (
              <article className="holi-gallery-photo" key={photo.photoId}>
                <img
                  src={getGalleryImageUrl(photo.photoId)}
                  alt={photo.fileName}
                  loading="lazy"
                  decoding="async"
                />
                <div className="holi-gallery-photo__details">
                  <span title={photo.fileName}>{photo.fileName}</span>
                  <a
                    href={getGalleryImageUrl(photo.photoId, true)}
                    download
                    aria-label={`Download ${photo.fileName}`}
                  >
                    Download
                  </a>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
