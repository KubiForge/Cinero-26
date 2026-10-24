
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      message: 'Method not allowed.',
    });
  }

  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;

  if (!webhookUrl) {
    return res.status(500).json({
      success: false,
      message: 'Google Sheets API is not configured.',
    });
  }

  try {
    const payload =
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body;

    if (
      !payload ||
      typeof payload !== 'object' ||
      !payload.referenceId ||
      !payload.teamName ||
      !payload.leaderName ||
      !payload.leaderEmail
    ) {
      return res.status(400).json({
        success: false,
        message: 'Required registration details are missing or invalid.',
      });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(payload.leaderEmail))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid leader email format.',
      });
    }

    // Limit maximum payload size (e.g. 15MB total to prevent memory abuse)
    const payloadStr = JSON.stringify(payload);
    if (payloadStr.length > 20 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        message: 'Payload is too large.',
      });
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error('Google Apps Script request failed.');
    }

    const result = await response.json();

    const isSuccess = result && (result.success === true || result.status === 'success');

    if (!isSuccess) {
      throw new Error(
        result?.message || 'Google Sheets did not confirm the save.'
      );
    }

    return res.status(200).json({
      success: true,
      message: result?.message || 'Registration saved successfully.',
      referenceId: result?.referenceId || payload.referenceId,
    });
  } catch (error) {
    console.error('Registration API error:', error);

    return res.status(502).json({
      success: false,
      message:
        'Registration could not be confirmed. Please try again.',
    });
  }
}
