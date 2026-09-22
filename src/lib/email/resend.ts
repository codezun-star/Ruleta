import {Resend} from 'resend';
import {NotConfiguredError} from '@/lib/db/client';

let client: Resend | null = null;

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function getResend(): Resend {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) throw new NotConfiguredError('email');
  if (!client) client = new Resend(key);
  return client;
}
