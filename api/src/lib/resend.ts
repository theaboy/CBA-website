import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export function getResendFromEmail() {
  return process.env.RESEND_FROM_EMAIL ?? 'CBA <onboarding@resend.dev>';
}

export function getApiPublicUrl() {
  return (process.env.API_PUBLIC_URL ?? 'http://localhost:3001').replace(/\/$/, '');
}
