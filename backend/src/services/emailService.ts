import resend from '../config/email.js';

const EMAIL_FROM = process.env.EMAIL_FROM || 'Maliquez Connect <noreply@maliquez.com>';

const CLIENT_URLS = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(u => u.trim())
  .filter(Boolean);

const CLIENT_URL = CLIENT_URLS[0] || 'http://localhost:5173';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailParams): Promise<void> => {
  if (!resend) {
    console.log('[EMAIL] Resend not configured. Logging email instead:');
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    return;
  }

  await resend.emails.send({
    from: EMAIL_FROM,
    to: [to],
    subject,
    html,
  });
};

/* ─── Templates ─────────────────────────────────────────── */

const emailLayout = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:480px;">
          <tr>
            <td style="padding-bottom:24px;text-align:center;">
              <h1 style="margin:0;font-size:24px;color:#111827;font-weight:700;">Maliquez Connect</h1>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;border-radius:12px;padding:32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                Maliquez Connect &bull; Abuja, Nigeria
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

/* ─── Specific email senders ────────────────────────────── */

interface SendPasswordResetEmailParams {
  email: string;
  firstName: string;
  resetToken: string;
}

export const sendPasswordResetEmail = async ({
  email,
  firstName,
  resetToken,
}: SendPasswordResetEmailParams): Promise<void> => {
  const resetUrl = `${CLIENT_URL}/reset-password/${resetToken}`;

  const content = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;font-weight:600;">Reset your password</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      Hi ${firstName},
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      We received a request to reset the password for your Maliquez Connect account. Click the button below to set a new password:
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td align="center">
          <a href="${resetUrl}" target="_blank" style="display:inline-block;padding:12px 24px;background-color:#059669;color:#ffffff;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">
            Reset Password
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      Or copy and paste this link into your browser:
    </p>
    <p style="margin:0 0 20px;font-size:12px;color:#059669;word-break:break-all;background-color:#f9fafb;padding:12px;border-radius:6px;border:1px solid #e5e7eb;">
      ${resetUrl}
    </p>
    <p style="margin:0 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
      This link will expire in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.
    </p>`;

  await sendEmail({
    to: email,
    subject: 'Reset your Maliquez Connect password',
    html: emailLayout(content),
  });
};

/* ─── Welcome email ─────────────────────────────────── */

interface SendWelcomeEmailParams {
  email: string;
  firstName: string;
}

export const sendWelcomeEmail = async ({ email, firstName }: SendWelcomeEmailParams): Promise<void> => {
  const content = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;font-weight:600;">Welcome to Maliquez Connect!</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      Hi ${firstName},
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      Thank you for creating an account. You can now discover and compare service providers, read and write reviews, and save your favorites.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td align="center">
          <a href="${CLIENT_URL}" target="_blank" style="display:inline-block;padding:12px 24px;background-color:#059669;color:#ffffff;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">
            Get Started
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
      If you have any questions, feel free to reach out to us at any time.
    </p>`;

  await sendEmail({
    to: email,
    subject: 'Welcome to Maliquez Connect',
    html: emailLayout(content),
  });
};

/* ─── Password changed confirmation ─────────────────── */

interface SendPasswordChangedEmailParams {
  email: string;
  firstName: string;
}

export const sendPasswordChangedEmail = async ({ email, firstName }: SendPasswordChangedEmailParams): Promise<void> => {
  const content = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;font-weight:600;">Password changed successfully</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      Hi ${firstName},
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      Your Maliquez Connect password has been changed successfully.
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      If you did not make this change, please contact us immediately so we can secure your account.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td align="center">
          <a href="${CLIENT_URL}/login" target="_blank" style="display:inline-block;padding:12px 24px;background-color:#059669;color:#ffffff;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">
            Sign In
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
      Maliquez Connect Team
    </p>`;

  await sendEmail({
    to: email,
    subject: 'Your password has been changed',
    html: emailLayout(content),
  });
};

/* ─── Listing created (pending moderation) ──────────── */

interface SendListingCreatedEmailParams {
  email: string;
  firstName: string;
  listingTitle: string;
}

export const sendListingCreatedEmail = async ({ email, firstName, listingTitle }: SendListingCreatedEmailParams): Promise<void> => {
  const content = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;font-weight:600;">Listing submitted for review</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      Hi ${firstName},
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      Your listing <strong>"${listingTitle}"</strong> has been submitted and is now pending review by our team. We'll notify you once it's been approved.
    </p>
    <p style="margin:0 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
      This usually takes 1-2 business days. If you have any questions, please contact our support team.
    </p>`;

  await sendEmail({
    to: email,
    subject: `Listing "${listingTitle}" submitted for review`,
    html: emailLayout(content),
  });
};

/* ─── New review notification (to listing owner) ────── */

interface SendNewReviewEmailParams {
  email: string;
  firstName: string;
  listingTitle: string;
  listingId: string;
  rating: number;
  review?: string;
}

export const sendNewReviewEmail = async ({ email, firstName, listingTitle, listingId, rating, review }: SendNewReviewEmailParams): Promise<void> => {
  const content = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;font-weight:600;">New review received</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      Hi ${firstName},
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      Your listing <strong>"${listingTitle}"</strong> has received a new review.
    </p>
    <p style="margin:0 0 8px;font-size:14px;color:#111827;font-weight:600;">Rating: ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5)</p>
    ${review ? `<p style="margin:0 0 20px;font-size:14px;color:#6b7280;font-style:italic;line-height:1.6;">"${review}"</p>` : ''}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td align="center">
          <a href="${CLIENT_URL}/listings/${listingId}" target="_blank" style="display:inline-block;padding:12px 24px;background-color:#059669;color:#ffffff;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">
            View Listing
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
      Maliquez Connect Team
    </p>`;

  await sendEmail({
    to: email,
    subject: `New review on "${listingTitle}"`,
    html: emailLayout(content),
  });
};

/* ─── Listing approved ──────────────────────────────── */

interface SendListingApprovedEmailParams {
  email: string;
  firstName: string;
  listingTitle: string;
  listingId: string;
}

export const sendListingApprovedEmail = async ({ email, firstName, listingTitle, listingId }: SendListingApprovedEmailParams): Promise<void> => {
  const content = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;font-weight:600;">Listing approved!</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      Hi ${firstName},
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      Great news! Your listing <strong>"${listingTitle}"</strong> has been reviewed and approved. It is now live on Maliquez Connect and visible to users.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td align="center">
          <a href="${CLIENT_URL}/listings/${listingId}" target="_blank" style="display:inline-block;padding:12px 24px;background-color:#059669;color:#ffffff;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">
            View Listing
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
      Maliquez Connect Team
    </p>`;

  await sendEmail({
    to: email,
    subject: `"${listingTitle}" has been approved`,
    html: emailLayout(content),
  });
};

/* ─── Listing suspended ─────────────────────────────── */

interface SendListingSuspendedEmailParams {
  email: string;
  firstName: string;
  listingTitle: string;
}

export const sendListingSuspendedEmail = async ({ email, firstName, listingTitle }: SendListingSuspendedEmailParams): Promise<void> => {
  const content = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;font-weight:600;">Listing suspended</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      Hi ${firstName},
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      Your listing <strong>"${listingTitle}"</strong> has been suspended and is no longer visible to users.
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      If you believe this is a mistake or would like more information, please contact our support team.
    </p>
    <p style="margin:0 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
      Maliquez Connect Team
    </p>`;

  await sendEmail({
    to: email,
    subject: `"${listingTitle}" has been suspended`,
    html: emailLayout(content),
  });
};

/* ─── User status changed ───────────────────────────── */

interface SendUserStatusChangedEmailParams {
  email: string;
  firstName: string;
  status: string;
}

export const sendUserStatusChangedEmail = async ({ email, firstName, status }: SendUserStatusChangedEmailParams): Promise<void> => {
  const isSuspension = status === 'SUSPENDED';
  const title = isSuspension ? 'Account suspended' : 'Account status updated';
  const heading = isSuspension ? 'Your account has been suspended' : 'Your account status has been updated';

  const content = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;font-weight:600;">${heading}</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      Hi ${firstName},
    </p>
    ${isSuspension
      ? `<p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
           Your Maliquez Connect account has been suspended. You will not be able to sign in or use our services until this is resolved.
         </p>
         <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
           If you have any questions, please contact our support team.
         </p>`
      : `<p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
           Your Maliquez Connect account status has been updated to <strong>${status.toLowerCase()}</strong>.
         </p>`
    }
    <p style="margin:0 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
      Maliquez Connect Team
    </p>`;

  await sendEmail({
    to: email,
    subject: title,
    html: emailLayout(content),
  });
};

/* ─── Review moderated ──────────────────────────────── */

interface SendReviewModeratedEmailParams {
  email: string;
  firstName: string;
  status: string;
}

export const sendReviewModeratedEmail = async ({ email, firstName, status }: SendReviewModeratedEmailParams): Promise<void> => {
  const isApproved = status === 'APPROVED';
  const heading = isApproved ? 'Your review has been approved' : 'Your review has been rejected';

  const content = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;font-weight:600;">${heading}</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      Hi ${firstName},
    </p>
    ${isApproved
      ? `<p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
           Your review has been reviewed and approved. It is now visible on the listing page.
         </p>`
      : `<p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
           Unfortunately, your review did not meet our guidelines and has been rejected.
         </p>
         <p style="margin:0 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
           Please review our community guidelines and feel free to submit a new review.
         </p>`
    }
    <p style="margin:0 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
      Maliquez Connect Team
    </p>`;

  await sendEmail({
    to: email,
    subject: heading,
    html: emailLayout(content),
  });
};
