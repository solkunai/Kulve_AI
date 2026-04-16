export type PlanType = 'free' | 'trial' | 'starter' | 'growth' | 'scale';

export interface PlanLimits {
  name: string;
  price: number;
  marketingPlans: number; // per month
  graphics: number; // per month
  socialPosts: number; // per month
  outreachEmails: number; // per month
  newsletters: number; // per month
  miniPlan: boolean; // trial gets a mini plan, not full
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    name: 'Free',
    price: 0,
    marketingPlans: 0,
    graphics: 0,
    socialPosts: 0,
    outreachEmails: 0,
    newsletters: 0,
    miniPlan: false,
  },
  trial: {
    name: 'Trial',
    price: 10,
    marketingPlans: 1, // mini plan only
    graphics: 2,
    socialPosts: 1,
    outreachEmails: 0,
    newsletters: 0,
    miniPlan: true,
  },
  starter: {
    name: 'Starter',
    price: 250,
    marketingPlans: 1,
    graphics: 5,
    socialPosts: 5,
    outreachEmails: 500,
    newsletters: 0,
    miniPlan: false,
  },
  growth: {
    name: 'Growth',
    price: 500,
    marketingPlans: 1,
    graphics: 12,
    socialPosts: 12,
    outreachEmails: 2000,
    newsletters: 4,
    miniPlan: false,
  },
  scale: {
    name: 'Scale',
    price: 1500,
    marketingPlans: 1,
    graphics: 30,
    socialPosts: 30,
    outreachEmails: 5000,
    newsletters: 8,
    miniPlan: false,
  },
};

export interface UsageCounts {
  marketing_plans: number;
  graphics: number;
  social_posts: number;
  outreach_emails: number;
  newsletters: number;
  period_start: string; // ISO date for current billing period
}

const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
);

export function canGenerate(
  plan: PlanType,
  feature: keyof Omit<UsageCounts, 'period_start'>,
  usage: UsageCounts
): { allowed: boolean; remaining: number; limit: number } {
  // Localhost bypass for testing
  if (isLocalhost) {
    return { allowed: true, remaining: 999, limit: 999 };
  }

  const limits = PLAN_LIMITS[plan];
  const featureLimitMap: Record<string, number> = {
    marketing_plans: limits.marketingPlans,
    graphics: limits.graphics,
    social_posts: limits.socialPosts,
    outreach_emails: limits.outreachEmails,
    newsletters: limits.newsletters,
  };

  const limit = featureLimitMap[feature] || 0;
  const used = usage[feature] || 0;
  const remaining = Math.max(0, limit - used);

  return { allowed: remaining > 0, remaining, limit };
}

export function getPlanUpgradeMessage(plan: PlanType, feature: string): string {
  if (plan === 'free') {
    return 'Start your $10 trial to unlock this feature and see what Kulve can do for your business.';
  }
  if (plan === 'trial') {
    return `You've used your trial ${feature}. Upgrade to Starter ($250/mo) to unlock more.`;
  }
  return `You've hit your monthly ${feature} limit. Upgrade your plan to get more.`;
}
