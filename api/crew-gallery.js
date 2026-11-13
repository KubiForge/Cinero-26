import { getCrewAuthStatus } from './_crew-auth.js';
import { callGalleryScript } from './_gallery.js';

const isPhotoId = (value) => typeof value === 'string' && /^[a-f\d-]{36}$/i.test(value);

function readBody(req) {
  if (typeof req.body !== 'string') return req.body ?? {};

  try {
    return JSON.parse(req.body);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const auth = getCrewAuthStatus(req);
  if (!auth.configured) {
    return res.status(503).json({ success: false, message: 'Crew authentication is not configured.' });
  }
  if (!auth.authenticated) {
    return res.status(401).json({ success: false, message: 'Please log in to review photos.' });
  }

  const reviewToken = process.env.GALLERY_REVIEW_TOKEN;
  if (!reviewToken || reviewToken.length < 32) {
    console.error('[crew-gallery] GALLERY_REVIEW_TOKEN is not configured.');
    return res.status(503).json({ success: false, message: 'Photo review service is not configured.' });
  }

  try {
    if (req.method === 'GET') {
      const result = await callGalleryScript('galleryReviewList', { reviewToken });
      if (result.status !== 'success' || !Array.isArray(result.photos)) {
        throw new Error(typeof result.message === 'string'
          ? result.message
          : 'Unable to load photos for review.');
      }

      res.setHeader('Cache-Control', 'private, no-store');
      return res.status(200).json({ success: true, photos: result.photos });
    }

    const body = readBody(req);
    if (
      !body
      || !isPhotoId(body.photoId)
      || !['approve', 'reject', 'delete'].includes(body.decision)
    ) {
      return res.status(400).json({ success: false, message: 'The photo review request is invalid.' });
    }

    const result = await callGalleryScript('galleryReview', {}, {
      action: 'galleryReview',
      galleryReviewToken: reviewToken,
      photoId: body.photoId,
      decision: body.decision,
      reviewedBy: auth.username,
    });

    if (result.status !== 'success') {
      return res.status(409).json({
        success: false,
        message: typeof result.message === 'string' ? result.message : 'The photo could not be updated.',
      });
    }

    return res.status(200).json({
      success: true,
      photoId: body.photoId,
      reviewStatus: result.reviewStatus,
    });
  } catch (error) {
    console.error('[crew-gallery] photo review request failed:', error);
    return res.status(502).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unable to process the photo review.',
    });
  }
}
