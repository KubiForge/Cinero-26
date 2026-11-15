import { callGalleryScript } from './_gallery.js';

const CATEGORIES = new Set(['school', 'university']);

function parseBody(body) {
  if (typeof body !== 'string') return body;
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

function isValidReference(category, referenceId) {
  const referencePattern = category === 'school'
    ? /^CNR26-SCH-\d{4}$/
    : /^CNR26-UNI-\d{4}$/;
  return referencePattern.test(referenceId);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const body = parseBody(req.body);
  const action = body?.action;
  const category = typeof body?.category === 'string' ? body.category.toLowerCase() : '';
  const referenceId = typeof body?.referenceId === 'string' ? body.referenceId.trim().toUpperCase() : '';
  const teamName = typeof body?.teamName === 'string' ? body.teamName.trim() : '';
  const leaderEmail = typeof body?.leaderEmail === 'string' ? body.leaderEmail.trim().toLowerCase() : '';
  const isValidRequest = action === 'verify'
    ? teamName.length > 0 && teamName.length <= 180
    : isValidReference(category, referenceId);

  if (
    !['verify', 'submit'].includes(action)
    || !CATEGORIES.has(category)
    || !isValidRequest
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leaderEmail)
  ) {
    return res.status(400).json({
      success: false,
      message: action === 'verify'
        ? 'Enter the registered team name and leader email for this category.'
        : 'The registered team details are invalid.',
    });
  }

  try {
    const scriptAction = action === 'verify' ? 'filmSubmissionVerify' : 'filmSubmission';
    const result = await callGalleryScript(scriptAction, {}, {
      ...body,
      action: scriptAction,
      category,
      referenceId: action === 'submit' ? referenceId : '',
      teamName,
      leaderEmail,
    });

    if (result.status !== 'success') {
      const message = typeof result.message === 'string'
        ? result.message
        : 'The submission could not be confirmed.';
      return res.status(result.statusCode === 409 ? 409 : 400).json({ success: false, message });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      team: result.team,
      submitted: result.submitted === true,
    });
  } catch (error) {
    console.error('[film-submission] request failed:', error);
    return res.status(502).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unable to reach the submission service.',
    });
  }
}
