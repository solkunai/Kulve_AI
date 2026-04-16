import { supabase } from './supabase';

/**
 * Generate a unique referral code for a user.
 * Format: first 4 chars of name + random 4 chars, uppercase
 */
export function generateReferralCode(name: string): string {
  const prefix = name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'KULV';
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}${suffix}`;
}

/**
 * Get or create a referral code for the current user.
 */
export async function getOrCreateReferralCode(userId: string, userName: string): Promise<string> {
  // Check if user already has a code
  const { data: profile } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', userId)
    .single();

  if (profile?.referral_code) return profile.referral_code;

  // Generate and save a new code
  let code = generateReferralCode(userName);
  let attempts = 0;

  // Ensure uniqueness
  while (attempts < 5) {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('referral_code', code)
      .single();

    if (!existing) break;
    code = generateReferralCode(userName + attempts);
    attempts++;
  }

  await supabase.from('profiles').update({ referral_code: code }).eq('id', userId);
  return code;
}

/**
 * Apply a referral code during signup.
 * Returns the discount percentage if valid.
 */
export async function applyReferralCode(code: string, newUserId: string, newUserEmail: string): Promise<{ valid: boolean; discount: number; referrerName?: string }> {
  // Find the referrer by code
  const { data: referrer } = await supabase
    .from('profiles')
    .select('id, full_name, referral_code')
    .eq('referral_code', code.toUpperCase().trim())
    .single();

  if (!referrer) return { valid: false, discount: 0 };

  // Don't allow self-referral
  if (referrer.id === newUserId) return { valid: false, discount: 0 };

  // Create referral record
  await supabase.from('referrals').insert({
    referrer_id: referrer.id,
    referral_code: code.toUpperCase().trim(),
    referred_id: newUserId,
    referred_email: newUserEmail,
    status: 'signed_up',
    commission_percent: 10,
    discount_percent: 15,
    converted_at: new Date().toISOString(),
  });

  // Mark the new user as referred
  await supabase.from('profiles').update({ referred_by: referrer.id }).eq('id', newUserId);

  return { valid: true, discount: 15, referrerName: referrer.full_name || undefined };
}

/**
 * Get referral stats for a user.
 */
export async function getReferralStats(userId: string): Promise<{
  code: string;
  totalReferred: number;
  activePaid: number;
  totalEarnings: number;
  referrals: { email: string; status: string; date: string }[];
}> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('referral_code, referral_earnings')
    .eq('id', userId)
    .single();

  const { data: referrals } = await supabase
    .from('referrals')
    .select('referred_email, status, created_at, first_paid_at')
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false });

  const active = referrals?.filter(r => r.status === 'active' || r.status === 'paid') || [];

  return {
    code: profile?.referral_code || '',
    totalReferred: referrals?.length || 0,
    activePaid: active.length,
    totalEarnings: profile?.referral_earnings || 0,
    referrals: (referrals || []).map(r => ({
      email: r.referred_email || '***',
      status: r.status,
      date: r.created_at,
    })),
  };
}

/**
 * Get the referral link URL.
 */
export function getReferralLink(code: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kulve.us';
  return `${baseUrl}/signup?ref=${code}`;
}
