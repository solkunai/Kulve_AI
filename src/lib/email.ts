const OUTREACH_DOMAIN = 'outreach.kulve.us';

export interface SendEmailParams {
  fromName: string;
  fromSlug: string;
  toEmail: string;
  toName?: string;
  subject: string;
  body: string;
}

export interface SendResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send a single outreach email via our backend API.
 * The API key stays on the server — never exposed to the browser.
 */
export async function sendOutreachEmail(params: SendEmailParams): Promise<SendResult> {
  const fromEmail = params.fromSlug.includes('@')
    ? params.fromSlug
    : `${params.fromSlug}@${OUTREACH_DOMAIN}`;

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `${params.fromName} <${fromEmail}>`,
        to: params.toEmail,
        subject: params.subject,
        html: formatEmailHtml(params.body, params.fromName),
        text: params.body,
      }),
    });

    const result = await response.json();
    return result;
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to send email' };
  }
}

/**
 * Send multiple outreach emails with a delay between each.
 */
export async function sendOutreachBatch(
  emails: SendEmailParams[],
  onProgress?: (sent: number, total: number) => void
): Promise<SendResult[]> {
  const results: SendResult[] = [];
  for (let i = 0; i < emails.length; i++) {
    const result = await sendOutreachEmail(emails[i]);
    results.push(result);
    onProgress?.(i + 1, emails.length);
    if (i < emails.length - 1) await new Promise(r => setTimeout(r, 500));
  }
  return results;
}

function formatEmailHtml(body: string, senderName: string): string {
  const htmlBody = body
    .split('\n')
    .map(line => line.trim() === '' ? '<br>' : `<p style="margin:0 0 12px 0;line-height:1.6;color:#333;">${line}</p>`)
    .join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;color:#333;max-width:600px;margin:0 auto;padding:20px;">${htmlBody}<div style="margin-top:32px;padding-top:16px;border-top:1px solid #eee;font-size:12px;color:#999;">Sent by ${senderName} via Kulvé</div></body></html>`;
}

export function isEmailConfigured(): boolean {
  return true; // Domain is verified
}
