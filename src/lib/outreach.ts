import { supabase } from './supabase';

const OUTREACH_DOMAIN = 'outreach.kulve.us';

/**
 * Generate a URL-safe email slug from a business name.
 * "Joe's Bakery & Café" → "joes-bakery-cafe"
 */
export function generateEmailSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s-]/g, '')   // remove special chars
    .trim()
    .replace(/\s+/g, '-')           // spaces to hyphens
    .replace(/-+/g, '-');           // collapse multiple hyphens
}

/**
 * Generate a unique outreach email for a business.
 * If "joes-bakery" is taken, tries "joes-bakery-2", etc.
 */
export async function generateOutreachEmail(businessName: string): Promise<string> {
  const baseSlug = generateEmailSlug(businessName);
  let slug = baseSlug;
  let attempt = 1;

  while (true) {
    const email = `${slug}@${OUTREACH_DOMAIN}`;
    const { data } = await supabase
      .from('brand_kits')
      .select('id')
      .eq('outreach_email', email)
      .single();

    if (!data) return email;

    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }
}

/**
 * Get the outreach email for a user's brand kit.
 */
export async function getOutreachEmail(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('brand_kits')
    .select('outreach_email')
    .eq('user_id', userId)
    .single();

  return data?.outreach_email ?? null;
}
