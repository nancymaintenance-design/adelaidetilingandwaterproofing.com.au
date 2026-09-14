const RECIPIENT = 'handyman.lyric@outlook.com';

function text(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (Number(req.headers['content-length'] || 0) > 25000) return res.status(413).json({ error: 'Enquiry is too large.' });

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  if (text(body.website, 100)) return res.status(200).json({ ok: true });

  const enquiry = {
    name: text(body.name, 120),
    email: text(body.email, 254),
    phone: text(body.phone, 80),
    location: text(body.location, 160),
    service: text(body.service, 180),
    message: text(body.message, 5000)
  };

  if (!enquiry.name || !enquiry.email || !enquiry.phone || !enquiry.location || !enquiry.service || !enquiry.message) {
    return res.status(400).json({ error: 'Please complete every required field.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email)) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    console.error('Resend environment variables are missing.');
    return res.status(503).json({ error: 'The enquiry service is not configured yet. Please call 0425 170 688.' });
  }

  const rows = [
    ['Name', enquiry.name], ['Email', enquiry.email], ['Phone', enquiry.phone],
    ['Suburb or postcode', enquiry.location], ['Service type', enquiry.service], ['Project details', enquiry.message]
  ].map(([label, value]) => `<tr><th align="left" style="padding:8px;border:1px solid #d8ddd9;background:#f8f5ef">${escapeHtml(label)}</th><td style="padding:8px;border:1px solid #d8ddd9;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join('');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL,
        to: [RECIPIENT],
        reply_to: enquiry.email,
        subject: `Website enquiry: ${enquiry.service}`,
        html: `<h1>New Ellis Services Group enquiry</h1><table cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-family:Arial,sans-serif">${rows}</table>`
      })
    });
    if (!response.ok) {
      console.error('Resend rejected contact form submission:', response.status);
      return res.status(502).json({ error: 'Unable to send your enquiry. Please call 0425 170 688.' });
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Resend contact form request failed:', error);
    return res.status(502).json({ error: 'Unable to send your enquiry. Please call 0425 170 688.' });
  }
};
