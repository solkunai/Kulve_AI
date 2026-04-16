import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true, // Will move to backend in production
});

export async function generateContent(prompt: string, systemPrompt?: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt || 'You are a marketing expert helping local businesses create compelling content.',
    messages: [{ role: 'user', content: prompt }],
  });

  const block = message.content[0];
  if (block.type === 'text') {
    return block.text;
  }
  return '';
}

export { anthropic };
