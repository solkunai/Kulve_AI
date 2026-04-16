// Supabase Edge Function: Send outreach emails via SendGrid
// Deploy with: supabase functions deploy outreach-send

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')!;

interface EmailRequest {
  fromEmail: string;
  fromName: string;
  toEmail: string;
  toName?: string;
  subject: string;
  htmlBody: string;
  textBody: string;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body: EmailRequest | { emails: EmailRequest[] } = await req.json();
    const emails = 'emails' in body ? body.emails : [body];

    const results = await Promise.all(
      emails.map(async (email) => {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [
              {
                to: [{ email: email.toEmail, name: email.toName }],
              },
            ],
            from: { email: email.fromEmail, name: email.fromName },
            subject: email.subject,
            content: [
              { type: 'text/plain', value: email.textBody },
              { type: 'text/html', value: email.htmlBody },
            ],
            tracking_settings: {
              open_tracking: { enable: true },
              click_tracking: { enable: true },
            },
          }),
        });

        if (response.ok) {
          const messageId = response.headers.get('x-message-id') || '';
          return { success: true, messageId };
        } else {
          const error = await response.text();
          return { success: false, error };
        }
      })
    );

    return new Response(JSON.stringify('emails' in body ? results : results[0]), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
