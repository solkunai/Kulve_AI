import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

// ── Google Identity Services type declarations ──────────────────────────
// These match the GIS library loaded via <script src="https://accounts.google.com/gsi/client">
interface GoogleCredentialResponse {
  credential: string;   // JWT id_token
  select_by: string;
  clientId?: string;
}

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  nonce?: string;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  ux_mode?: 'popup' | 'redirect';
  login_uri?: string;
  context?: 'signin' | 'signup' | 'use';
  itp_support?: boolean;
  use_fedcm_for_prompt?: boolean;
}

interface GoogleButtonConfig {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  width?: number;
  click_listener?: () => void;
}

interface GoogleAccountsId {
  initialize: (config: GoogleIdConfiguration) => void;
  renderButton: (parent: HTMLElement, config: GoogleButtonConfig) => void;
  prompt: (momentListener?: (notification: unknown) => void) => void;
  cancel: () => void;
  disableAutoSelect: () => void;
  revoke: (hint: string, callback: (response: { successful: boolean }) => void) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

// ── Auth context ────────────────────────────────────────────────────────
interface AuthContext {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContext | undefined>(undefined);

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Store resolve/reject for the Promise returned by signInWithGoogle
  const googleResolveRef = useRef<((result: { error: Error | null }) => void) | null>(null);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Google credential callback ──────────────────────────────────────
  // Called by GIS after user completes the Google popup.
  // Passes the id_token to Supabase's signInWithIdToken.
  const handleGoogleCredential = useCallback(async (response: GoogleCredentialResponse) => {
    try {
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      });

      if (googleResolveRef.current) {
        googleResolveRef.current({ error: error as Error | null });
        googleResolveRef.current = null;
      }
    } catch (err) {
      if (googleResolveRef.current) {
        googleResolveRef.current({ error: err as Error });
        googleResolveRef.current = null;
      }
    }
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  // ── Google Sign-In via GIS popup ────────────────────────────────────
  // Strategy: render a hidden Google button, then programmatically click it.
  // This opens the real Google OAuth popup showing YOUR domain (kulve.us),
  // not the Supabase URL.
  const signInWithGoogle = useCallback((): Promise<{ error: Error | null }> => {
    return new Promise((resolve) => {
      if (!window.google?.accounts?.id) {
        resolve({ error: new Error('Google Sign-In SDK not loaded. Please try again.') });
        return;
      }

      if (!GOOGLE_CLIENT_ID) {
        resolve({ error: new Error('Google Client ID not configured.') });
        return;
      }

      // Store resolver so the callback can resolve this promise
      googleResolveRef.current = resolve;

      // Initialize GIS with popup mode
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
        ux_mode: 'popup',
        context: 'signin',
        itp_support: true,
      });

      // Create a temporary hidden container, render the Google button, and click it
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.opacity = '0';
      container.style.pointerEvents = 'none';
      document.body.appendChild(container);

      window.google.accounts.id.renderButton(container, {
        type: 'standard',
        size: 'large',
      });

      // The GIS library renders an iframe inside the container. Find and click it.
      // Use requestAnimationFrame to wait for the render to complete.
      requestAnimationFrame(() => {
        const iframe = container.querySelector('iframe');
        const button = container.querySelector('[role="button"]') as HTMLElement | null;

        if (button) {
          button.click();
        } else if (iframe) {
          // Fallback: click the first clickable child
          (iframe as HTMLElement).click();
        } else {
          // If rendering failed, fall back to One Tap prompt
          window.google!.accounts.id.prompt();
        }

        // Clean up the hidden container after a delay
        setTimeout(() => {
          if (container.parentNode) {
            container.parentNode.removeChild(container);
          }
        }, 60000); // Keep alive long enough for the popup flow to complete
      });
    });
  }, [handleGoogleCredential]);

  const signOut = async () => {
    // Revoke Google session if possible
    if (window.google?.accounts?.id && user?.email) {
      window.google.accounts.id.revoke(user.email, () => {});
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
