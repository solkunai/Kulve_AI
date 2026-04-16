const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '';

// Industry-specific search terms for better stock photo relevance
const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  'Restaurant': ['restaurant food plating', 'fine dining', 'chef cooking', 'restaurant interior'],
  'Bakery': ['fresh bread bakery', 'pastries display', 'artisan baking', 'cake decoration'],
  'Salon': ['hair salon styling', 'beauty treatment', 'salon interior modern', 'hair color transformation'],
  'Gym': ['fitness workout gym', 'personal training', 'modern gym equipment', 'group fitness class'],
  'Law Firm': ['professional office', 'business handshake', 'legal consultation', 'corporate meeting room'],
  'Real Estate': ['luxury home interior', 'house exterior beautiful', 'real estate modern', 'apartment living room'],
  'Dentist': ['dental office modern', 'bright smile teeth', 'dental care professional', 'clean dental clinic'],
  'Auto Shop': ['auto mechanic working', 'car repair service', 'automotive workshop', 'car maintenance'],
  'Retail': ['retail store display', 'shopping boutique', 'product showcase', 'modern retail interior'],
  'Other': ['professional business', 'modern office', 'team collaboration', 'business growth'],
};

export type ImageStyle = 'photo' | 'minimal';

interface UnsplashPhoto {
  id: string;
  urls: { regular: string; small: string; thumb: string };
  alt_description: string;
  user: { name: string; links: { html: string } };
}

/**
 * Search Unsplash for relevant stock photos.
 * Returns multiple results so the user can choose.
 */
export async function searchImages(
  query: string,
  options?: {
    industry?: string;
    orientation?: 'landscape' | 'portrait' | 'squarish';
    count?: number;
  }
): Promise<UnsplashPhoto[]> {
  if (!UNSPLASH_ACCESS_KEY) return [];

  // Enhance query with industry context
  let searchQuery = simplifyPrompt(query);
  if (options?.industry && INDUSTRY_KEYWORDS[options.industry]) {
    const industryTerm = INDUSTRY_KEYWORDS[options.industry][Math.floor(Math.random() * INDUSTRY_KEYWORDS[options.industry].length)];
    searchQuery = `${searchQuery} ${industryTerm}`;
  }

  try {
    const count = options?.count || 1;
    const orientation = options?.orientation || 'squarish';

    if (count === 1) {
      const response = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(searchQuery)}&orientation=${orientation}&content_filter=high`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
      );
      if (!response.ok) return [];
      const data = await response.json();
      return [data];
    }

    // Multiple images — use search endpoint
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&orientation=${orientation}&per_page=${count}&content_filter=high`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.results || [];
  } catch {
    return [];
  }
}

/**
 * Get a single relevant image URL.
 * Enhanced version of the original generateImage.
 */
export async function generateImage(
  prompt: string,
  businessContext?: string,
  industry?: string,
  orientation?: 'landscape' | 'portrait' | 'squarish'
): Promise<string | null> {
  const fullPrompt = businessContext ? `${prompt} ${businessContext}` : prompt;
  const results = await searchImages(fullPrompt, { industry, orientation, count: 1 });
  return results[0]?.urls?.regular || null;
}

/**
 * Get multiple image options for the user to choose from.
 */
export async function getImageOptions(
  prompt: string,
  industry?: string,
  count: number = 4,
  orientation?: 'landscape' | 'portrait' | 'squarish'
): Promise<{ url: string; thumb: string; alt: string; credit: string; creditUrl: string }[]> {
  const results = await searchImages(prompt, { industry, orientation, count });
  return results.map(photo => ({
    url: photo.urls.regular,
    thumb: photo.urls.thumb,
    alt: photo.alt_description || prompt,
    credit: photo.user.name,
    creditUrl: photo.user.links.html,
  }));
}

export async function generateMultipleImages(prompts: string[], industry?: string): Promise<(string | null)[]> {
  const results: (string | null)[] = [];
  for (const prompt of prompts) {
    const img = await generateImage(prompt, undefined, industry);
    results.push(img);
    await new Promise(r => setTimeout(r, 200));
  }
  return results;
}

function simplifyPrompt(prompt: string): string {
  const stopWords = ['a', 'an', 'the', 'of', 'for', 'and', 'or', 'with', 'in', 'on', 'at', 'to', 'from', 'by', 'that', 'this', 'is', 'are', 'was', 'be', 'their', 'your', 'our', 'its', 'showing', 'featuring', 'image', 'photo', 'picture', 'shot', 'view', 'scene', 'display', 'close', 'up'];
  const words = prompt
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.includes(w));
  return words.slice(0, 5).join(' ');
}
