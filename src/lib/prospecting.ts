import { generateContent } from './ai';

const GOOGLE_PLACES_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
const APOLLO_API_KEY = import.meta.env.VITE_APOLLO_API_KEY;
const SERPER_API_KEY = import.meta.env.VITE_SERPER_API_KEY;

// --- Types ---

export interface Prospect {
  name: string;
  type: string;
  address?: string;
  phone?: string;
  website?: string;
  email?: string;
  emailSource?: 'apollo' | 'website' | 'manual';
  rating?: number;
  googleMapsUrl?: string;
  contactName?: string;
  contactTitle?: string;
  pitchAngle: string;
  emailSubject: string;
  emailBody: string;
  status: 'draft' | 'sent' | 'opened' | 'replied';
}

interface PlaceResult {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  types: string[];
  googleMapsUrl?: string;
}

// --- Google Places API (New) ---

async function searchPlaces(query: string, pageToken?: string): Promise<{ places: PlaceResult[]; nextPageToken?: string }> {
  if (!GOOGLE_PLACES_KEY) return { places: [] };

  const body: any = {
    textQuery: query,
    pageSize: 20,
    languageCode: 'en',
    regionCode: 'us',
  };
  if (pageToken) body.pageToken = pageToken;

  try {
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.types,places.googleMapsUri,nextPageToken',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('Google Places error:', response.status, await response.text());
      return { places: [] };
    }

    const data = await response.json();

    const places: PlaceResult[] = (data.places || []).map((p: any) => ({
      name: p.displayName?.text || '',
      address: p.formattedAddress || '',
      phone: p.nationalPhoneNumber || undefined,
      website: p.websiteUri || undefined,
      rating: p.rating || undefined,
      types: p.types || [],
      googleMapsUrl: p.googleMapsUri || undefined,
    }));

    return { places, nextPageToken: data.nextPageToken };
  } catch (err) {
    console.error('Google Places search failed:', err);
    return { places: [] };
  }
}

/**
 * Search Google Places with pagination — up to 60 results per query.
 */
async function searchAllPlaces(query: string, maxPages: number = 3): Promise<PlaceResult[]> {
  const allPlaces: PlaceResult[] = [];
  let pageToken: string | undefined;

  for (let page = 0; page < maxPages; page++) {
    const { places, nextPageToken } = await searchPlaces(query, pageToken);
    allPlaces.push(...places);
    pageToken = nextPageToken;

    if (!pageToken) break;
    // Google requires ~2s delay before using nextPageToken
    await new Promise(r => setTimeout(r, 2000));
  }

  return allPlaces;
}

// --- Apollo.io — find decision-maker emails ---

async function findEmailViaApollo(domain: string): Promise<{ email?: string; name?: string; title?: string } | null> {
  if (!APOLLO_API_KEY || !domain) return null;

  try {
    const response = await fetch('https://api.apollo.io/api/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': APOLLO_API_KEY,
      },
      body: JSON.stringify({
        q_organization_domains: domain,
        person_seniorities: ['owner', 'founder', 'c_suite', 'partner', 'vp', 'director', 'manager'],
        per_page: 3,
        page: 1,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const people = data.people || [];

    // Find someone with a verified email
    const withEmail = people.find((p: any) => p.email && p.email_status === 'verified');
    if (withEmail) {
      return { email: withEmail.email, name: withEmail.name, title: withEmail.title };
    }

    // Fall back to any email
    const anyEmail = people.find((p: any) => p.email);
    if (anyEmail) {
      return { email: anyEmail.email, name: anyEmail.name, title: anyEmail.title };
    }

    return null;
  } catch {
    return null;
  }
}

// --- Serper fallback — scrape email from website ---

async function findEmailViaSerper(websiteUrl?: string): Promise<string | null> {
  // Only search the business's own website — never do generic name searches
  // which return wrong emails from unrelated businesses
  if (!SERPER_API_KEY || !websiteUrl) return null;

  const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  const junk = ['example.com', 'email.com', 'domain.com', 'sentry.io', 'wixpress.com', 'googleapis.com', 'w3.org', 'schema.org', 'gravatar.com', 'wordpress.org', 'facebook.com', 'twitter.com', 'instagram.com'];

  try {
    const domain = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`).hostname;
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: `site:${domain} contact email`, num: 5 }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const allText = (data.organic || []).map((r: any) => r.snippet || '').join(' ');
    const found = allText.match(emailRegex) || [];
    const valid = found.filter((e: string) => {
      // Only accept emails from the business's own domain
      if (junk.some(j => e.includes(j))) return false;
      if (e.includes(domain.replace('www.', ''))) return true;
      // Accept common prefixes even if different domain (e.g. gmail for small businesses)
      if (e.startsWith('contact') || e.startsWith('info') || e.startsWith('hello') || e.startsWith('office')) return true;
      return false;
    });

    return valid[0] || null;
  } catch {
    return null;
  }
}

/**
 * Find email for a business using Apollo (primary) → Serper (fallback).
 */
async function findEmail(websiteUrl?: string): Promise<{ email?: string; emailSource?: 'apollo' | 'website'; contactName?: string; contactTitle?: string }> {
  // Try Apollo first if we have a website domain
  if (websiteUrl) {
    try {
      const domain = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`).hostname;
      const apollo = await findEmailViaApollo(domain);
      if (apollo?.email) {
        return { email: apollo.email, emailSource: 'apollo', contactName: apollo.name, contactTitle: apollo.title };
      }
    } catch { /* invalid URL, skip */ }
  }

  // Fallback: search the business's own website only
  const email = await findEmailViaSerper(websiteUrl);
  if (email) return { email, emailSource: 'website' };

  return {};
}

// --- AI: Figure out what types of businesses to prospect ---

export async function getProspectCategories(brand: {
  business_name: string;
  industry: string;
  description: string;
  unique_selling_point?: string;
}): Promise<string[]> {
  const prompt = `You are a business development expert. A local ${brand.industry} called "${brand.business_name}" wants to find partnership and sales opportunities.

Their business: ${brand.description}
${brand.unique_selling_point ? `What makes them different: ${brand.unique_selling_point}` : ''}

List 10-12 Google Maps search queries they should use to find local partnership and sales opportunities. Be specific — use the exact terms someone would search on Google Maps.

For example, a bakery might search: "wedding venues", "coffee shops", "restaurants", "corporate event planners", "hotels", "catering companies", "farmers markets", "gift shops", "breakfast restaurants", "bridal shops", "florists", "event spaces"

Return ONLY a JSON array of strings, each being a specific Google Maps search query. No explanation.`;

  const raw = await generateContent(prompt);
  try {
    const jsonStr = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch {
    return ['restaurants', 'event venues', 'hotels', 'corporate offices'];
  }
}

// --- AI: Write personalized pitch emails ---

export async function writeOutreachEmails(
  brand: {
    business_name: string;
    industry: string;
    description: string;
    tone_of_voice: string;
    unique_selling_point?: string;
    business_phone?: string;
    business_email?: string;
    business_website?: string;
  },
  prospects: { name: string; type: string; contactName?: string; contactTitle?: string }[]
): Promise<{ pitchAngle: string; emailSubject: string; emailBody: string }[]> {
  const prompt = `You are a B2B outreach copywriter for local businesses. Write personalized cold outreach emails.

SENDER:
- Business: ${brand.business_name}
- Industry: ${brand.industry}
- Description: ${brand.description}
- Tone: ${brand.tone_of_voice}
${brand.unique_selling_point ? `- USP: ${brand.unique_selling_point}` : ''}
${brand.business_phone ? `- Phone: ${brand.business_phone}` : ''}
${brand.business_email ? `- Email: ${brand.business_email}` : ''}
${brand.business_website ? `- Website: ${brand.business_website}` : ''}

For EACH of these prospects, write a personalized partnership/sales pitch email:

${prospects.map((p, i) => `${i + 1}. "${p.name}" — ${p.type}${p.contactName ? `. Contact: ${p.contactName}${p.contactTitle ? ` (${p.contactTitle})` : ''}` : ''}`).join('\n')}

Rules:
- Each email must be SPECIFIC to that prospect — reference their business by name
${prospects.some(p => p.contactName) ? '- If a contact name is provided, address them by name' : ''}
- Explain exactly how a partnership would benefit THEM (not just you)
- Keep each email under 120 words
- Subject line under 50 characters, no spam words
- Don't open with "I hope this finds you well" — be direct and specific
- End with a soft CTA (question, not hard sell)
- Sign off with the sender's business name and contact info
- Match the brand's tone of voice

Return ONLY a JSON array with objects containing:
- "pitchAngle": One sentence describing the partnership angle
- "emailSubject": Email subject line
- "emailBody": Full email body (use \\n for line breaks)

No markdown, no explanation, just the JSON array.`;

  const raw = await generateContent(prompt);
  try {
    const jsonStr = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch {
    return [];
  }
}

// --- Full prospect pipeline ---

export async function findAndPitchProspects(
  brand: {
    business_name: string;
    industry: string;
    description: string;
    tone_of_voice: string;
    unique_selling_point?: string;
    business_address?: string;
    business_phone?: string;
    business_email?: string;
    business_website?: string;
  },
  location: string,
  customCategories?: string[],
  onProgress?: (status: string) => void
): Promise<Prospect[]> {
  // Step 1: Get prospect categories from AI (or use custom ones)
  onProgress?.('Analyzing your business for prospect categories...');
  const categories = customCategories?.length
    ? customCategories
    : await getProspectCategories(brand);

  // Step 2: Search Google Places for each category
  const allPlaces: { place: PlaceResult; category: string }[] = [];
  const seenNames = new Set<string>();

  for (const category of categories.slice(0, 8)) {
    onProgress?.(`Searching for "${category}" in ${location}...`);
    const query = `${category} in ${location}`;
    const places = await searchAllPlaces(query, 3); // Up to 60 per category

    for (const place of places) {
      const normalized = place.name.toLowerCase().trim();
      if (seenNames.has(normalized)) continue;
      // Don't include our own business
      if (normalized.includes(brand.business_name.toLowerCase())) continue;
      seenNames.add(normalized);
      allPlaces.push({ place, category });
    }

    await new Promise(r => setTimeout(r, 300));
  }

  if (allPlaces.length === 0) return [];
  onProgress?.(`Found ${allPlaces.length} businesses. Looking up contact info...`);

  // Step 3: Find emails — Apollo (primary) + Serper (fallback)
  // Process in batches to avoid rate limits
  const emailResults: { email?: string; emailSource?: 'apollo' | 'website'; contactName?: string; contactTitle?: string }[] = [];
  const batchSize = 5;

  for (let i = 0; i < allPlaces.length; i += batchSize) {
    const batch = allPlaces.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(({ place }) => findEmail(place.website))
    );
    emailResults.push(...batchResults);
    onProgress?.(`Found contacts for ${Math.min(i + batchSize, allPlaces.length)} of ${allPlaces.length} businesses...`);
    await new Promise(r => setTimeout(r, 300));
  }

  // Step 4: AI writes pitch emails per category
  onProgress?.('Writing personalized pitch emails...');
  const categoriesUsed = [...new Set(allPlaces.map(p => p.category))];
  const pitchTemplates: Record<string, { pitchAngle: string; emailSubject: string; emailBody: string }> = {};

  for (const cat of categoriesUsed) {
    const sampleIdx = allPlaces.findIndex(p => p.category === cat);
    const sample = allPlaces[sampleIdx];
    if (!sample) continue;

    const pitches = await writeOutreachEmails(brand, [{
      name: sample.place.name,
      type: cat,
      contactName: emailResults[sampleIdx]?.contactName,
      contactTitle: emailResults[sampleIdx]?.contactTitle,
    }]);

    if (pitches[0]) pitchTemplates[cat] = pitches[0];
    await new Promise(r => setTimeout(r, 300));
  }

  // Step 5: Assemble prospects
  onProgress?.('Finalizing prospect list...');
  return allPlaces.map(({ place, category }, i) => {
    const template = pitchTemplates[category];
    const sampleName = allPlaces.find(p => p.category === category)?.place.name || '';

    const personalizedBody = template?.emailBody
      ? template.emailBody.replace(new RegExp(sampleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), place.name)
      : `Hi,\n\nI'm reaching out from ${brand.business_name}. We'd love to explore a partnership with ${place.name}.\n\nBest,\n${brand.business_name}`;

    const personalizedSubject = template?.emailSubject
      ? template.emailSubject.replace(new RegExp(sampleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), place.name)
      : `Partnership with ${brand.business_name}`;

    return {
      name: place.name,
      type: category,
      address: place.address,
      phone: place.phone,
      website: place.website,
      email: emailResults[i]?.email,
      emailSource: emailResults[i]?.emailSource,
      rating: place.rating,
      googleMapsUrl: place.googleMapsUrl,
      contactName: emailResults[i]?.contactName,
      contactTitle: emailResults[i]?.contactTitle,
      pitchAngle: template?.pitchAngle || `Partnership opportunity with ${place.name}`,
      emailSubject: personalizedSubject,
      emailBody: personalizedBody,
      status: 'draft' as const,
    };
  });
}
