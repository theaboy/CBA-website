import { getApiPublicUrl, getResendFromEmail, resend } from './resend';

type BeatOrderEmail = {
  to: string;
  customerName: string;
  beatTitle: string;
  licenseType: string;
  downloadKey: string;
};

type TicketOrderEmail = {
  to: string;
  customerName: string;
  eventName: string;
  eventDate: Date;
  location: string;
  qrTokens: string[];
};

export async function sendBeatOrderEmail(order: BeatOrderEmail) {
  if (!resend) {
    console.warn('RESEND_API_KEY not configured; skipping beat order email');
    return;
  }

  const downloadUrl = `${getApiPublicUrl()}/downloads/${order.downloadKey}`;

  const { error } = await resend.emails.send({
    from: getResendFromEmail(),
    to: [order.to],
    subject: `Your CBA beat download: ${order.beatTitle}`,
    text: [
      `Hi ${order.customerName},`,
      '',
      `Thanks for purchasing ${order.beatTitle} (${order.licenseType} license).`,
      `Your download link is valid for 7 days: ${downloadUrl}`,
      '',
      'CBA',
    ].join('\n'),
    html: `
      <p>Hi ${escapeHtml(order.customerName)},</p>
      <p>Thanks for purchasing <strong>${escapeHtml(order.beatTitle)}</strong> (${escapeHtml(order.licenseType)} license).</p>
      <p><a href="${downloadUrl}">Download your beat</a></p>
      <p>This link is valid for 7 days.</p>
      <p>CBA</p>
    `,
  });

  if (error) throw new Error(`Resend beat email failed: ${error.message}`);
}

export async function sendTicketOrderEmail(order: TicketOrderEmail) {
  if (!resend) {
    console.warn('RESEND_API_KEY not configured; skipping ticket order email');
    return;
  }

  const tokenListText = order.qrTokens.map((token, index) => `${index + 1}. ${token}`).join('\n');
  const tokenListHtml = order.qrTokens
    .map((token, index) => `<li><code>${escapeHtml(String(index + 1))}. ${escapeHtml(token)}</code></li>`)
    .join('');

  const { error } = await resend.emails.send({
    from: getResendFromEmail(),
    to: [order.to],
    subject: `Your CBA tickets: ${order.eventName}`,
    text: [
      `Hi ${order.customerName},`,
      '',
      `Your tickets for ${order.eventName} are confirmed.`,
      `Date: ${order.eventDate.toLocaleString('en-CA')}`,
      `Location: ${order.location}`,
      '',
      'Ticket codes:',
      tokenListText,
      '',
      'CBA',
    ].join('\n'),
    html: `
      <p>Hi ${escapeHtml(order.customerName)},</p>
      <p>Your tickets for <strong>${escapeHtml(order.eventName)}</strong> are confirmed.</p>
      <p>
        <strong>Date:</strong> ${escapeHtml(order.eventDate.toLocaleString('en-CA'))}<br>
        <strong>Location:</strong> ${escapeHtml(order.location)}
      </p>
      <p>Ticket codes:</p>
      <ol>${tokenListHtml}</ol>
      <p>CBA</p>
    `,
  });

  if (error) throw new Error(`Resend ticket email failed: ${error.message}`);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
