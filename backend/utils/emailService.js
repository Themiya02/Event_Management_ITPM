const nodemailer = require('nodemailer');

/**
 * SMTP (set in .env for real delivery):
 *   SMTP_HOST, SMTP_PORT (default 587), SMTP_SECURE (true|false),
 *   SMTP_USER, SMTP_PASS, EMAIL_FROM (optional "Name <email@domain>")
 * If SMTP is not configured, sends are skipped (logged) and the API still succeeds.
 */
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    return null;
  }
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    auth: { user, pass }
  });
}

function getFromAddress() {
  return process.env.EMAIL_FROM || process.env.SMTP_USER || 'Eventio <noreply@localhost>';
}

/**
 * Notify food stall vendor when admin approves or rejects their application.
 * `to` is the vendor’s registration email (stored on the booking as vendorEmail from req.user.email
 * when they submit, or loaded from their User account for older records).
 */
async function sendStallBookingDecisionEmail({
  to,
  vendorName,
  eventName,
  stallName,
  stallLocation,
  status
}) {
  const transport = getTransporter();
  if (!transport) {
    console.warn(
      '[email] SMTP not configured (SMTP_HOST, SMTP_USER, SMTP_PASS); skipping notification to',
      to
    );
    return { skipped: true };
  }

  const isApproved = status === 'Approved';
  const subject = isApproved
    ? `[Eventio] Stall application approved — ${eventName}`
    : `[Eventio] Stall application update — ${eventName}`;

  const stallLine = [stallName, stallLocation && `Location: ${stallLocation}`]
    .filter(Boolean)
    .join(' — ');

  const textBody = isApproved
    ? `Hi ${vendorName || 'there'},

Your food stall application for "${eventName}" has been approved.

${stallLine ? `Stall: ${stallLine}\n` : ''}
You can sign in to the Food Stall Vendor Portal to view details.

— Eventio`
    : `Hi ${vendorName || 'there'},

Your food stall application for "${eventName}" was not approved at this time.

${stallLine ? `Application: ${stallLine}\n` : ''}
If you have questions, please contact the event organizers.

— Eventio`;

  const htmlBody = isApproved
    ? `<p>Hi ${escapeHtml(vendorName || 'there')},</p>
<p>Your food stall application for <strong>${escapeHtml(eventName)}</strong> has been <strong>approved</strong>.</p>
${stallLine ? `<p>${escapeHtml(stallLine)}</p>` : ''}
<p>You can sign in to the Food Stall Vendor Portal to view details.</p>
<p>— Eventio</p>`
    : `<p>Hi ${escapeHtml(vendorName || 'there')},</p>
<p>Your food stall application for <strong>${escapeHtml(eventName)}</strong> was <strong>not approved</strong> at this time.</p>
${stallLine ? `<p>${escapeHtml(stallLine)}</p>` : ''}
<p>If you have questions, please contact the event organizers.</p>
<p>— Eventio</p>`;

  await transport.sendMail({
    from: getFromAddress(),
    to,
    subject,
    text: textBody,
    html: htmlBody
  });
  return { sent: true };
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = {
  sendStallBookingDecisionEmail
};
