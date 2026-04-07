import { setEmailCallbacks } from '@nilam/auth/server';
import { Resend } from 'resend';

let configured = false;

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getAppUrl() {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  // Fallback: take first entry from CORS_ORIGIN (which may be comma-separated)
  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
  const firstOrigin = corsOrigin.split(',')[0] ?? corsOrigin;
  return firstOrigin.trim().replace(/\/$/, '');
}

export function configureAuthEmailCallbacks() {
  if (configured) {
    return;
  }

  configured = true;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return;
  }

  const resend = new Resend(apiKey);

  setEmailCallbacks({
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from,
        to: user.email,
        subject: 'Reset your Nilam password',
        text: `Hi ${user.name},

Reset your password using this link: ${url}`,
        html: `<p>Hi ${escapeHtml(user.name)},</p><p>Reset your password using this link:</p><p><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>`,
      });
    },
    sendInvitationEmail: async ({ email, inviter, organization, id, role }) => {
      const invitationUrl = `${getAppUrl()}/accept-invitation/${encodeURIComponent(id)}`;

      await resend.emails.send({
        from,
        to: email,
        subject: `You're invited to ${organization.name}`,
        text: `${inviter.user.name} invited you to join ${organization.name} as ${role}. Accept the invitation here: ${invitationUrl}`,
        html: `<p>${escapeHtml(inviter.user.name)} invited you to join <strong>${escapeHtml(organization.name)}</strong> as <strong>${escapeHtml(role)}</strong>.</p><p><a href="${escapeHtml(invitationUrl)}">Accept invitation</a></p>`,
      });
    },
  });
}
