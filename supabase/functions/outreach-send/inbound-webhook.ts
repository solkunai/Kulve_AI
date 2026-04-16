// Supabase Edge Function: Handle inbound email replies from SendGrid
// Configure SendGrid Inbound Parse to POST to this function's URL
// Deploy with: supabase functions deploy inbound-webhook

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const formData = await req.formData();
    const fromEmail = formData.get('from') as string;
    const toEmail = formData.get('to') as string;
    const subject = formData.get('subject') as string;
    const body = formData.get('text') as string || formData.get('html') as string;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the original outreach message by recipient email
    const { data: originalMessage } = await supabase
      .from('outreach_messages')
      .select('id, user_id, campaign_id')
      .eq('to_email', fromEmail)
      .eq('from_email', toEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (originalMessage) {
      // Store the reply
      await supabase.from('outreach_replies').insert({
        message_id: originalMessage.id,
        user_id: originalMessage.user_id,
        from_email: fromEmail,
        subject,
        body,
      });

      // Update message status to replied
      await supabase
        .from('outreach_messages')
        .update({ status: 'replied', replied_at: new Date().toISOString() })
        .eq('id', originalMessage.id);

      // Update campaign reply count
      await supabase.rpc('increment_campaign_replies', {
        campaign_id_param: originalMessage.campaign_id,
      });
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Inbound webhook error:', error);
    return new Response('Error', { status: 500 });
  }
});
