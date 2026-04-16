import { generateContent } from './ai';

interface BrandContext {
  business_name: string;
  industry: string;
  description: string;
  target_customer: string;
  tone_of_voice: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  main_goal?: string;
  unique_selling_point?: string;
  platforms?: string[];
  posting_frequency?: string;
  upcoming_events?: string;
}

const BRAND_SYSTEM_PROMPT = `You are an elite marketing strategist and copywriter for local businesses. You create high-converting, brand-consistent content that feels authentic and human — never generic or corporate. Always match the brand's tone of voice. Never use hashtags unless specifically asked. Be specific, not vague. Every generation must be completely unique — different angles, different hooks, different structure. Never repeat yourself.`;

// Inject randomness so every generation is unique
function creativeSeed(): string {
  const angles = ['storytelling', 'urgency', 'social proof', 'curiosity', 'exclusivity', 'community', 'behind-the-scenes', 'problem-solution', 'seasonal', 'transformation', 'comparison', 'education', 'humor', 'emotion', 'authority', 'fear of missing out', 'nostalgia', 'aspiration', 'controversy', 'simplicity'];
  const tones = ['bold and punchy', 'warm and conversational', 'witty and clever', 'direct and no-nonsense', 'inspirational', 'playful', 'authoritative', 'empathetic'];
  const formats = ['listicle', 'story arc', 'question-answer', 'before/after', 'day-in-the-life', 'customer spotlight', 'tip of the day', 'myth vs reality', 'challenge/invitation', 'poll/engagement'];

  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  return `\n\nCREATIVE DIRECTION FOR THIS GENERATION (follow this closely to ensure uniqueness):
- Lead with a "${pick(angles)}" angle
- Secondary angle: "${pick(angles)}"
- Writing energy: ${pick(tones)}
- Content format preference: ${pick(formats)}
- Session ID: ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function brandContext(brand: BrandContext): string {
  let context = `
BRAND CONTEXT:
- Business: ${brand.business_name}
- Industry: ${brand.industry}
- Description: ${brand.description}
- Target Customer: ${brand.target_customer}
- Tone of Voice: ${brand.tone_of_voice}
- Brand Colors: Primary ${brand.primary_color}, Secondary ${brand.secondary_color}, Accent ${brand.accent_color}`;

  if (brand.main_goal) context += `\n- Main Goal: ${brand.main_goal}`;
  if (brand.unique_selling_point) context += `\n- Unique Selling Point: ${brand.unique_selling_point}`;
  if (brand.platforms?.length) context += `\n- Priority Platforms: ${brand.platforms.join(', ')}`;
  if (brand.posting_frequency) context += `\n- Posting Frequency: ${brand.posting_frequency}`;
  if (brand.upcoming_events) context += `\n- Upcoming Events/Launches: ${brand.upcoming_events}`;

  return context.trim();
}

// --- Marketing Plan ---

export async function generateMarketingPlan(brand: BrandContext): Promise<string> {
  const prompt = `${brandContext(brand)}

Create a complete 30-day marketing plan for this business. Their main goal is ${brand.main_goal || 'growing their customer base'}. ${brand.unique_selling_point ? `Their key differentiator: ${brand.unique_selling_point}.` : ''} ${brand.upcoming_events ? `They have upcoming: ${brand.upcoming_events} — weave this into the plan.` : ''}

Focus content on their priority platforms: ${brand.platforms?.length ? brand.platforms.join(', ') : 'Instagram, Facebook, Email'}. They want to post ${brand.posting_frequency || 'Daily'}.

Include:

1. **Monthly Theme** — One overarching campaign theme tied to their main goal
2. **Week-by-Week Breakdown** — For each of the 4 weeks:
   - Focus area aligned with their goal (e.g., ${brand.main_goal || 'brand awareness'})
   - 3-4 specific action items with channel (prioritize their chosen platforms)
   - 1 content idea with a working headline and suggested visual direction
3. **Content Calendar Overview** — A brief daily/weekly posting schedule matching their ${brand.posting_frequency || 'daily'} frequency across their platforms
4. **Key Metrics to Track** — 5 specific KPIs relevant to their goal and industry
5. **Quick Wins** — 3 things they can do THIS WEEK to see results

Format in clean markdown. Be specific to their industry, target customer, and unique selling point — no generic advice.${creativeSeed()}`;

  return generateContent(prompt, BRAND_SYSTEM_PROMPT);
}

// --- Social Media Captions ---

export interface SocialPost {
  platform: string;
  caption: string;
  imagePrompt: string;
  bestTime: string;
  headline: string;
  body?: string;
  cta?: string;
  templateStyle: 'promotional' | 'announcement' | 'quote' | 'showcase' | 'geometric' | 'minimal' | 'gradient' | 'split' | 'accent-bar' | 'diagonal';
}

export async function generateSocialPosts(brand: BrandContext, count: number = 5): Promise<SocialPost[]> {
  const platforms = brand.platforms?.length ? brand.platforms.join(', ') : 'Instagram, Facebook, LinkedIn';
  const prompt = `${brandContext(brand)}

Generate ${count} social media posts for this business. Focus on these platforms: ${platforms}. Their main goal is ${brand.main_goal || 'growing their audience'}. ${brand.unique_selling_point ? `Lean into their differentiator: ${brand.unique_selling_point}.` : ''}

For EACH post, return a JSON object with:
- "platform": "Instagram" | "Facebook" | "LinkedIn"
- "caption": The full post caption (compelling, on-brand, with a clear CTA. 1-3 short paragraphs max)
- "headline": A short bold headline for the graphic (under 10 words, punchy)
- "body": Optional 1-sentence supporting text for the graphic (under 20 words). Can be empty string.
- "cta": A call-to-action button text (e.g. "Shop Now", "Learn More", "Book Today"). Can be empty string.
- "templateStyle": One of "promotional" | "announcement" | "quote" | "showcase" | "geometric" | "minimal" | "gradient" | "split" | "accent-bar" | "diagonal" — pick a DIFFERENT style for each post so they all look unique. Spread them out across all 10 options.
- "imagePrompt": A brief description of what an accompanying photo should show
- "bestTime": Suggested day and time to post (e.g., "Tuesday 11am")

Return ONLY a valid JSON array of objects. No markdown, no explanation, just the JSON array.${creativeSeed()}`;

  const raw = await generateContent(prompt, BRAND_SYSTEM_PROMPT);

  try {
    const jsonStr = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch {
    return [];
  }
}

// --- Outreach Emails ---

export interface OutreachEmailContent {
  subject: string;
  body: string;
  followUp: string;
}

export async function generateOutreachEmails(brand: BrandContext, count: number = 3): Promise<OutreachEmailContent[]> {
  const prompt = `${brandContext(brand)}

Generate ${count} cold outreach email sequences for this business to send to potential customers/clients.

Each email should:
- Have a compelling subject line (under 50 chars, no spam triggers)
- Open with something specific and personal (not "I hope this finds you well")
- Clearly state the value proposition in 2-3 sentences
- End with a soft CTA (question, not a hard sell)
- Be under 150 words total
- Match the brand's tone of voice

Also generate a 2-sentence follow-up for each.

Return ONLY a valid JSON array with objects containing:
- "subject": email subject line
- "body": full email body (use \\n for line breaks)
- "followUp": the follow-up message

No markdown, no explanation, just the JSON array.${creativeSeed()}`;

  const raw = await generateContent(prompt, BRAND_SYSTEM_PROMPT);

  try {
    const jsonStr = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch {
    return [];
  }
}

// --- Newsletter Content ---

export async function generateNewsletter(brand: BrandContext, topic?: string): Promise<string> {
  const prompt = `${brandContext(brand)}

Write a complete email newsletter for this business${topic ? ` about: ${topic}` : ''}.

Include:
1. **Subject Line** — Compelling, under 50 characters
2. **Preview Text** — The snippet shown in inbox, under 90 characters
3. **Header** — A bold, attention-grabbing headline
4. **Body** — 2-3 sections with subheadings. Mix of value content and subtle promotion. Keep it scannable.
5. **CTA** — One clear call to action
6. **Footer Note** — A warm, personal sign-off

Format in clean markdown. Keep the total length under 400 words. Make it feel like it's from a real person, not a corporation.${creativeSeed()}`;

  return generateContent(prompt, BRAND_SYSTEM_PROMPT);
}

// --- Business Taglines ---

export async function generateTaglines(brand: BrandContext, count: number = 5): Promise<string[]> {
  const prompt = `${brandContext(brand)}

Generate ${count} unique taglines/slogans for this business. Each should be:
- Under 8 words
- Memorable and distinctive
- Relevant to their industry and target customer
- Match the brand's tone of voice

Return ONLY a JSON array of strings. No explanation.${creativeSeed()}`;

  const raw = await generateContent(prompt, BRAND_SYSTEM_PROMPT);

  try {
    const jsonStr = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch {
    return [];
  }
}

// --- Website Copy ---

export interface WebsiteContent {
  hero: { headline: string; subheadline: string; cta: string };
  about: { title: string; paragraphs: string[] };
  services: { title: string; items: { name: string; description: string }[] };
  testimonials: { items: { quote: string; name: string; role: string }[] };
  contact: { title: string; description: string; cta: string };
  footer: { tagline: string };
}

export async function generateWebsiteCopy(brand: BrandContext, brief?: {
  pages?: string[];
  services?: string;
  hours?: string;
  specialFeatures?: string;
}): Promise<WebsiteContent | null> {
  const prompt = `${brandContext(brand)}

${brief?.services ? `Their services/products: ${brief.services}` : ''}
${brief?.hours ? `Business hours: ${brief.hours}` : ''}
${brief?.specialFeatures ? `Special features to highlight: ${brief.specialFeatures}` : ''}

Generate complete website copy for this business. Return ONLY a valid JSON object with this exact structure:

{
  "hero": {
    "headline": "Bold headline under 8 words",
    "subheadline": "One compelling sentence about the value proposition",
    "cta": "CTA button text (e.g. Book Now, Get Started, Visit Us)"
  },
  "about": {
    "title": "About section title",
    "paragraphs": ["paragraph 1 about the business story", "paragraph 2 about what makes them different", "paragraph 3 about their mission/values"]
  },
  "services": {
    "title": "Services section title",
    "items": [
      {"name": "Service 1", "description": "One sentence description"},
      {"name": "Service 2", "description": "One sentence description"},
      {"name": "Service 3", "description": "One sentence description"},
      {"name": "Service 4", "description": "One sentence description"}
    ]
  },
  "testimonials": {
    "items": [
      {"quote": "Realistic testimonial quote", "name": "Customer Name", "role": "e.g. Local Resident"},
      {"quote": "Another testimonial", "name": "Name", "role": "Role"},
      {"quote": "Third testimonial", "name": "Name", "role": "Role"}
    ]
  },
  "contact": {
    "title": "Contact section title",
    "description": "Warm invitation to get in touch",
    "cta": "Contact CTA button text"
  },
  "footer": {
    "tagline": "Short brand tagline for the footer"
  }
}

Write like a human, not a template. Be specific to this industry. Make the copy compelling and conversion-focused.${creativeSeed()}

Return ONLY the JSON object. No markdown, no explanation.`;

  const raw = await generateContent(prompt, BRAND_SYSTEM_PROMPT);
  try {
    const jsonStr = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

// Keep legacy string version for backward compatibility
export async function generateWebsiteCopyMarkdown(brand: BrandContext): Promise<string> {
  const prompt = `${brandContext(brand)}

Write complete website copy for this business's homepage. Include:
1. **Hero Section** — Headline + Subheadline + CTA
2. **About Section** — 2-3 paragraphs
3. **Services/Products** — 3-4 highlights
4. **Testimonials** — 3 realistic testimonials
5. **Contact** — Warm invitation

Format in clean markdown. Write like a human.${creativeSeed()}`;

  return generateContent(prompt, BRAND_SYSTEM_PROMPT);
}
