import { generateContent } from './ai';

interface BrandContext {
  business_name: string;
  industry: string;
  description: string;
  target_customer: string;
  tone_of_voice: string;
  unique_selling_point?: string;
  business_address?: string;
  business_phone?: string;
  business_email?: string;
  business_website?: string;
  business_hours?: string;
  // Flyer brief
  flyer_purpose?: string;
  flyer_details?: string;
  flyer_offer?: string;
  // Card brief
  card_name?: string;
  card_title?: string;
  card_tagline?: string;
}

const SYSTEM_PROMPT = `You are an elite graphic designer and copywriter for local businesses. You write short, punchy marketing copy for print materials. Every word must earn its place. Never be generic.`;

export interface FlyerContent {
  headline: string;
  offer: string;
  offerDetails: string;
  bulletPoints: string[];
  cta: string;
  tagline: string;
  address: string;
  phone: string;
  website: string;
  hours: string;
  imagePrompt: string;
}

export interface BusinessCardContent {
  name: string;
  title: string;
  tagline: string;
  phone: string;
  email: string;
  website: string;
  imagePrompt: string;
}

export async function generateFlyerContent(brand: BrandContext): Promise<FlyerContent[]> {
  const hasBrief = brand.flyer_purpose || brand.flyer_details || brand.flyer_offer;

  const prompt = `Business: ${brand.business_name}
Industry: ${brand.industry}
Description: ${brand.description}
Target Customer: ${brand.target_customer}
Tone: ${brand.tone_of_voice}
${brand.unique_selling_point ? `USP: ${brand.unique_selling_point}` : ''}
${brand.business_address ? `Address: ${brand.business_address}` : ''}
${brand.business_phone ? `Phone: ${brand.business_phone}` : ''}
${brand.business_email ? `Email: ${brand.business_email}` : ''}
${brand.business_website ? `Website: ${brand.business_website}` : ''}
${brand.business_hours ? `Hours: ${brand.business_hours}` : ''}

${hasBrief ? `THE CUSTOMER WANTS THIS SPECIFIC FLYER:
${brand.flyer_purpose ? `- Purpose: ${brand.flyer_purpose}` : ''}
${brand.flyer_details ? `- Details to include: ${brand.flyer_details}` : ''}
${brand.flyer_offer ? `- Special offer: ${brand.flyer_offer}` : ''}

Generate 2 flyer variations based on EXACTLY what the customer described above. Use their real contact info.` : `Generate 2 different promotional handout flyers for this business. These are physical flyers you'd hand out at events, leave on counters, or give to customers. Each should have a completely different angle. Use their real contact info.`}

For EACH flyer, return a JSON object with:
- "headline": Bold attention-grabbing headline (under 5 words, ALL CAPS energy)
- "offer": The main promotion or hook (e.g., "10% OFF YOUR FIRST VISIT", "FREE APPETIZER", "BUY 1 GET 1 FREE")
- "offerDetails": Fine print or details about the offer (under 15 words)
- "bulletPoints": Array of 3 short selling points (under 6 words each)
- "cta": Call to action (under 4 words)
- "tagline": Business tagline (under 8 words)
- "address": Use "${brand.business_address || 'their real address or a realistic placeholder'}"
- "phone": Use "${brand.business_phone || 'their real phone or a placeholder'}"
- "website": Use "${brand.business_website || 'their real website or a placeholder'}"
- "hours": Use "${brand.business_hours || 'realistic business hours'}"
- "imagePrompt": Description of a photo that represents this flyer's theme and the business

Return ONLY a valid JSON array. No markdown, no explanation.`;

  const raw = await generateContent(prompt, SYSTEM_PROMPT);
  try {
    const jsonStr = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch {
    return [];
  }
}

export async function generateBusinessCardContent(brand: BrandContext): Promise<BusinessCardContent[]> {
  const prompt = `Business: ${brand.business_name}
Industry: ${brand.industry}
Description: ${brand.description}
Tone: ${brand.tone_of_voice}
${brand.unique_selling_point ? `USP: ${brand.unique_selling_point}` : ''}

Generate 2 different business card designs for this business.

${brand.card_name ? `The person's name is: ${brand.card_name}` : 'Use the business owner name or business name.'}
${brand.card_title ? `Their title is: ${brand.card_title}` : 'Use a fitting title like "Owner", "Founder", etc.'}
${brand.card_tagline ? `Tagline to use: ${brand.card_tagline}` : 'Create a short catchy tagline.'}

For EACH card, return a JSON object with:
- "name": "${brand.card_name || 'The person or business name'}"
- "title": "${brand.card_title || 'A fitting job title'}"
- "tagline": "${brand.card_tagline || 'Short business tagline (under 8 words)'}"
- "phone": "${brand.business_phone || 'placeholder phone'}"
- "email": "${brand.business_email || 'placeholder email using business name'}"
- "website": "${brand.business_website || 'placeholder website'}"
- "imagePrompt": Description of an ideal background/accent photo for the card

Return ONLY a valid JSON array. No markdown, no explanation.`;

  const raw = await generateContent(prompt, SYSTEM_PROMPT);
  try {
    const jsonStr = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch {
    return [];
  }
}
