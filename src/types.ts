export type Plan = 'Starter' | 'Growth' | 'Scale';

export interface BrandKit {
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
  businessName: string;
  industry: string;
  description: string;
  targetCustomer: string;
  toneOfVoice: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    linkedin: string;
    x: string;
    tiktok: string;
  };
}

export interface Graphic {
  id: string;
  title: string;
  type: 'Instagram Post' | 'Facebook Post' | 'Flyer' | 'Business Card' | 'Banner';
  imageUrl: string;
  status: 'Draft' | 'Approved' | 'Posted';
  createdAt: string;
}

export interface OutreachMessage {
  id: string;
  recipient: string;
  channel: 'Email' | 'LinkedIn' | 'DM';
  status: 'Sent' | 'Opened' | 'Replied' | 'Bounced';
  date: string;
  preview: string;
}
