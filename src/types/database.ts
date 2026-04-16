export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          business_name: string | null;
          plan: 'starter' | 'growth' | 'scale' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          business_name?: string | null;
          plan?: 'starter' | 'growth' | 'scale' | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          business_name?: string | null;
          plan?: 'starter' | 'growth' | 'scale' | null;
          updated_at?: string;
        };
      };
      brand_kits: {
        Row: {
          id: string;
          user_id: string;
          logo_url: string | null;
          primary_color: string;
          secondary_color: string;
          accent_color: string;
          heading_font: string;
          body_font: string;
          business_name: string;
          industry: string;
          description: string;
          target_customer: string;
          tone_of_voice: string;
          social_instagram: string | null;
          social_facebook: string | null;
          social_linkedin: string | null;
          social_x: string | null;
          social_tiktok: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          logo_url?: string | null;
          primary_color?: string;
          secondary_color?: string;
          accent_color?: string;
          heading_font?: string;
          body_font?: string;
          business_name: string;
          industry: string;
          description: string;
          target_customer: string;
          tone_of_voice?: string;
          social_instagram?: string | null;
          social_facebook?: string | null;
          social_linkedin?: string | null;
          social_x?: string | null;
          social_tiktok?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          logo_url?: string | null;
          primary_color?: string;
          secondary_color?: string;
          accent_color?: string;
          heading_font?: string;
          body_font?: string;
          business_name?: string;
          industry?: string;
          description?: string;
          target_customer?: string;
          tone_of_voice?: string;
          social_instagram?: string | null;
          social_facebook?: string | null;
          social_linkedin?: string | null;
          social_x?: string | null;
          social_tiktok?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
