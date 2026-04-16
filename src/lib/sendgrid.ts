// SendGrid outreach email service
// NOTE: SendGrid API calls must go through a backend/edge function in production.
// This module defines the types and helpers; actual sending happens server-side.

export interface OutreachEmail {
  fromEmail: string;      // e.g. joes-bakery@outreach.kulve.us
  fromName: string;       // e.g. Joe's Bakery
  toEmail: string;        // recipient
  toName?: string;        // recipient name
  subject: string;
  htmlBody: string;
  textBody: string;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an outreach email via the backend API.
 * The backend handles SendGrid API calls to keep the API key secure.
 */
export async function sendOutreachEmail(email: OutreachEmail): Promise<SendResult> {
  const response = await fetch('/api/outreach/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(email),
  });

  if (!response.ok) {
    return { success: false, error: 'Failed to send email' };
  }

  return response.json();
}

/**
 * Send a batch of outreach emails.
 */
export async function sendOutreachBatch(emails: OutreachEmail[]): Promise<SendResult[]> {
  const response = await fetch('/api/outreach/send-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emails }),
  });

  if (!response.ok) {
    return emails.map(() => ({ success: false, error: 'Failed to send batch' }));
  }

  return response.json();
}
