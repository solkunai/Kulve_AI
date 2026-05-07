// AI generation — client calls our own server (/api/ai/generate).
// The Anthropic API key never touches the browser.

import { supabase } from './supabase';

export async function generateContent(prompt: string, systemPrompt?: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not signed in');
  }

  const res = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ prompt, systemPrompt }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `AI generation failed (${res.status})`);
  }

  const data = (await res.json()) as { text?: string };
  return data.text || '';
}
