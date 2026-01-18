import nodemailer from 'nodemailer';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Get configuration from Environment Variables (Set these in Vercel Dashboard)
  const { GMAIL_USER, GMAIL_APP_PASSWORD, ALERT_RECIPIENT_EMAIL } = process.env;

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD || !ALERT_RECIPIENT_EMAIL) {
    console.error("Missing Email Configuration");
    return response.status(500).json({ error: 'Server misconfiguration: Missing email credentials.' });
  }

  const { ipos } = request.body;

  if (!ipos || ipos.length === 0) {
    return response.status(200).json({ message: 'No IPOs to alert about.' });
  }

  // 2. Configure Transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  // 3. Construct Email Content
  const ipoListHtml = ipos.map(ipo => `
    <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 8px;">
      <h3 style="margin-top:0; color: #10b981;">${ipo.companyName} (${ipo.status})</h3>
      <p><strong>Sector:</strong> ${ipo.sector}</p>
      <p><strong>Target Group:</strong> ${ipo.shareType || 'General Public'}</p>
      <p><strong>Price:</strong> Rs. ${ipo.price}</p>
      <p><strong>Opening:</strong> ${ipo.openingDate}</p>
      <p><strong>Closing:</strong> ${ipo.closingDate}</p>
      <p>${ipo.description}</p>
    </div>
  `).join('');

  const mailOptions = {
    from: `"Nepal IPO Radar" <${GMAIL_USER}>`,
    to: ALERT_RECIPIENT_EMAIL, // Send to yourself (Admin)
    subject: `🚀 New IPO Alert: ${ipos.length} Companies Detected!`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>New IPOs Detected in Nepal</h2>
        <p>The automated radar system has detected new IPO opportunities:</p>
        ${ipoListHtml}
        <p style="font-size: 12px; color: #666; margin-top: 20px;">
          This is an automated message from your Nepal IPO Radar App.
        </p>
      </div>
    `,
  };

  try {
    // 4. Send Email
    await transporter.sendMail(mailOptions);
    return response.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email send failed:', error);
    return response.status(500).json({ error: 'Failed to send email', details: error.message });
  }
}