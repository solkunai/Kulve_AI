import React from 'react';
import type { WebsiteContent } from '../../lib/content';

export interface WebsiteRenderProps {
  primary: string;
  secondary: string;
  accent: string;
  headingFont: string;
  bodyFont: string;
  heroImage: string | null;
  aboutImage: string | null;
  brandKit: any;
}

export interface WebsiteTemplate {
  id: string;
  name: string;
  category: 'general' | 'industry';
  industry?: string;
  description: string;
  render: (content: WebsiteContent, props: WebsiteRenderProps) => React.ReactNode;
}

// Helpers
function nav(logo: string | undefined, name: string, font: string, bg: string, textColor: string, ctaText: string, ctaBg: string, ctaColor: string, borderBottom?: string) {
  return (
    <div style={{ padding: '20px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: bg, borderBottom: borderBottom || 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {logo && <img src={logo} style={{ width: 32, height: 32, objectFit: 'contain' as const, borderRadius: 6 }} />}
        <span style={{ fontSize: 18, fontWeight: 800, color: textColor, fontFamily: font }}>{name}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: textColor, opacity: 0.6 }}>About</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: textColor, opacity: 0.6 }}>Services</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: textColor, opacity: 0.6 }}>Contact</span>
        <div style={{ background: ctaBg, color: ctaColor, padding: '10px 24px', borderRadius: 6, fontSize: 13, fontWeight: 700 }}>{ctaText}</div>
      </div>
    </div>
  );
}

function footer(name: string, tagline: string, bg: string, textColor: string, contact?: string) {
  return (
    <div style={{ padding: '24px 48px', background: bg, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: textColor, opacity: 0.5 }}>&copy; {new Date().getFullYear()} {name}. All rights reserved.</span>
      <span style={{ fontSize: 12, color: textColor, opacity: 0.3 }}>{tagline}</span>
    </div>
  );
}

function serviceGrid(items: { name: string; description: string }[], cols: number, cardBg: string, headColor: string, bodyColor: string, accentColor: string, font: string, bodyFontFamily: string, radius: number) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 24 }}>
      {items.map((item, i) => (
        <div key={i} style={{ background: cardBg, padding: 32, borderRadius: radius, border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ width: 44, height: 44, background: `${accentColor}15`, borderRadius: radius, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 18, color: accentColor }}>&#10038;</span>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: headColor, marginBottom: 8, fontFamily: font }}>{item.name}</h3>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: bodyColor, fontFamily: bodyFontFamily }}>{item.description}</p>
        </div>
      ))}
    </div>
  );
}

function testimonialCards(items: { quote: string; name: string; role: string }[], cardBg: string, quoteColor: string, nameColor: string, roleColor: string, accentColor: string, radius: number) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
      {items.map((t, i) => (
        <div key={i} style={{ background: cardBg, padding: 28, borderRadius: radius, border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 32, color: accentColor, lineHeight: 1, marginBottom: 12 }}>&ldquo;</div>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: quoteColor, marginBottom: 16 }}>{t.quote}</p>
          <div style={{ fontSize: 14, fontWeight: 700, color: nameColor }}>{t.name}</div>
          <div style={{ fontSize: 12, color: roleColor }}>{t.role}</div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// GENERAL TEMPLATES
// ============================================================

const modernClean: WebsiteTemplate = {
  id: 'modern-clean',
  name: 'Modern Clean',
  category: 'general',
  description: 'Apple-inspired, white background, clean hero with gradient overlay',
  render: (c, p) => {
    const { primary, secondary, accent, headingFont, bodyFont, heroImage, aboutImage, brandKit: bk } = p;
    return (
      <div style={{ fontFamily: `'${bodyFont}', sans-serif`, background: '#fff' }}>
        {nav(bk?.logo_url, bk?.business_name, headingFont, '#fff', secondary, c.hero.cta, primary, '#fff', '1px solid #f0f0f0')}
        {/* Hero */}
        <div style={{ position: 'relative', height: 500, overflow: 'hidden' }}>
          {heroImage ? <img src={heroImage} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} /> : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${secondary}, ${primary})` }} />}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 30%, rgba(0,0,0,0.7))', display: 'flex', flexDirection: 'column' as const, justifyContent: 'flex-end', padding: '0 48px 56px' }}>
            <h1 style={{ fontSize: 48, fontWeight: 800, color: '#fff', lineHeight: 1.1, fontFamily: headingFont, marginBottom: 12 }}>{c.hero.headline}</h1>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', maxWidth: 560, lineHeight: 1.6 }}>{c.hero.subheadline}</p>
            <div style={{ marginTop: 24, display: 'inline-block', background: primary, color: '#fff', padding: '14px 36px', borderRadius: 8, fontSize: 16, fontWeight: 700, width: 'fit-content' }}>{c.hero.cta}</div>
          </div>
        </div>
        {/* About */}
        <div style={{ padding: '80px 48px', display: 'flex', gap: 48 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 2, color: primary, marginBottom: 12 }}>About Us</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: secondary, lineHeight: 1.2, fontFamily: headingFont, marginBottom: 20 }}>{c.about.title}</h2>
            {c.about.paragraphs.map((p, i) => <p key={i} style={{ fontSize: 15, lineHeight: 1.8, color: '#555', marginBottom: 16 }}>{p}</p>)}
          </div>
          {aboutImage && <div style={{ width: 360, flexShrink: 0, borderRadius: 12, overflow: 'hidden' }}><img src={aboutImage} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} /></div>}
        </div>
        {/* Services */}
        <div style={{ padding: '80px 48px', background: '#f8f9fa' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: secondary, fontFamily: headingFont, textAlign: 'center' as const, marginBottom: 48 }}>{c.services.title}</h2>
          {serviceGrid(c.services.items, 2, '#fff', secondary, '#666', primary, headingFont, bodyFont, 12)}
        </div>
        {/* Testimonials */}
        <div style={{ padding: '80px 48px' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: secondary, fontFamily: headingFont, textAlign: 'center' as const, marginBottom: 48 }}>What Our Customers Say</h2>
          {testimonialCards(c.testimonials.items, '#fff', '#555', secondary, '#999', primary, 12)}
        </div>
        {/* Contact */}
        <div style={{ padding: '80px 48px', background: secondary, textAlign: 'center' as const }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff', fontFamily: headingFont, marginBottom: 12 }}>{c.contact.title}</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.6 }}>{c.contact.description}</p>
          <div style={{ display: 'inline-block', background: primary, color: '#fff', padding: '14px 40px', borderRadius: 8, fontSize: 16, fontWeight: 700 }}>{c.contact.cta}</div>
        </div>
        {footer(bk?.business_name || '', c.footer.tagline, '#111', '#fff')}
      </div>
    );
  }
};

const classicWarm: WebsiteTemplate = {
  id: 'classic-warm',
  name: 'Classic Warm',
  category: 'general',
  description: 'Airbnb-inspired, warm tones, side-by-side hero, rounded corners',
  render: (c, p) => {
    const { primary, secondary, accent, headingFont, bodyFont, heroImage, aboutImage, brandKit: bk } = p;
    return (
      <div style={{ fontFamily: `'${bodyFont}', sans-serif`, background: '#fff' }}>
        {nav(bk?.logo_url, bk?.business_name, headingFont, '#fff', secondary, c.hero.cta, primary, '#fff')}
        {/* Hero side-by-side */}
        <div style={{ padding: 48, display: 'flex', gap: 48, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: 2, color: accent, marginBottom: 16 }}>{bk?.industry}</div>
            <h1 style={{ fontSize: 44, fontWeight: 800, color: secondary, lineHeight: 1.1, fontFamily: headingFont, marginBottom: 16 }}>{c.hero.headline}</h1>
            <p style={{ fontSize: 18, color: '#666', lineHeight: 1.6, marginBottom: 28 }}>{c.hero.subheadline}</p>
            <div style={{ display: 'inline-block', background: primary, color: '#fff', padding: '16px 36px', borderRadius: 8, fontSize: 16, fontWeight: 700 }}>{c.hero.cta}</div>
          </div>
          <div style={{ width: 400, height: 320, borderRadius: 16, overflow: 'hidden', flexShrink: 0 }}>
            {heroImage ? <img src={heroImage} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} /> : <div style={{ width: '100%', height: '100%', background: `${primary}20` }} />}
          </div>
        </div>
        {/* Services */}
        <div style={{ padding: '64px 48px', background: '#faf9f7' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: secondary, fontFamily: headingFont, textAlign: 'center' as const, marginBottom: 40 }}>{c.services.title}</h2>
          {serviceGrid(c.services.items, 4, '#fff', secondary, '#777', primary, headingFont, bodyFont, 12)}
        </div>
        {/* About */}
        <div style={{ padding: '64px 48px', display: 'flex', gap: 40 }}>
          {aboutImage && <div style={{ width: 320, flexShrink: 0, borderRadius: 12, overflow: 'hidden' }}><img src={aboutImage} style={{ width: '100%', height: 300, objectFit: 'cover' as const }} /></div>}
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: secondary, fontFamily: headingFont, marginBottom: 16 }}>{c.about.title}</h2>
            {c.about.paragraphs.map((p, i) => <p key={i} style={{ fontSize: 15, lineHeight: 1.8, color: '#555', marginBottom: 14 }}>{p}</p>)}
          </div>
        </div>
        {/* Testimonials */}
        <div style={{ padding: '64px 48px', background: '#faf9f7' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: secondary, fontFamily: headingFont, textAlign: 'center' as const, marginBottom: 40 }}>What People Say</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {c.testimonials.items.map((t, i) => (
              <div key={i} style={{ background: '#fff', padding: 28, borderRadius: 12, borderLeft: `4px solid ${primary}` }}>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: '#555', fontStyle: 'italic', marginBottom: 16 }}>&ldquo;{t.quote}&rdquo;</p>
                <div style={{ fontSize: 14, fontWeight: 700, color: secondary }}>{t.name}</div>
                <div style={{ fontSize: 12, color: '#999' }}>{t.role}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Contact */}
        <div style={{ padding: 48, background: secondary, textAlign: 'center' as const }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: headingFont, marginBottom: 12 }}>{c.contact.title}</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>{c.contact.description}</p>
          <div style={{ display: 'inline-block', background: '#fff', color: secondary, padding: '14px 36px', borderRadius: 8, fontSize: 15, fontWeight: 700 }}>{c.contact.cta}</div>
          <div style={{ marginTop: 40, color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>&copy; {new Date().getFullYear()} {bk?.business_name} · {c.footer.tagline}</div>
        </div>
      </div>
    );
  }
};

const boldDark: WebsiteTemplate = {
  id: 'bold-dark',
  name: 'Bold Dark',
  category: 'general',
  description: 'Nike-inspired, dark mode, high energy, uppercase headings',
  render: (c, p) => {
    const { primary, secondary, accent, headingFont, bodyFont, heroImage, aboutImage, brandKit: bk } = p;
    return (
      <div style={{ fontFamily: `'${bodyFont}', sans-serif`, background: '#0a0a0a', color: '#fff' }}>
        {nav(bk?.logo_url, bk?.business_name, headingFont, '#0a0a0a', '#fff', c.hero.cta, '#fff', '#0a0a0a', '1px solid rgba(255,255,255,0.1)')}
        <div style={{ position: 'relative', height: 520, overflow: 'hidden' }}>
          {heroImage ? <img src={heroImage} style={{ width: '100%', height: '100%', objectFit: 'cover' as const, opacity: 0.4 }} /> : <div style={{ width: '100%', height: '100%', background: `radial-gradient(circle at 30% 70%, ${primary}40, transparent 60%), radial-gradient(circle at 70% 30%, ${accent}30, transparent 60%)` }} />}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', padding: '0 48px' }}>
            <h1 style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.0, fontFamily: headingFont, textTransform: 'uppercase' as const, letterSpacing: -2, maxWidth: 700 }}>{c.hero.headline}</h1>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', marginTop: 16, maxWidth: 500, lineHeight: 1.6 }}>{c.hero.subheadline}</p>
            <div style={{ marginTop: 28, display: 'inline-block', background: '#fff', color: '#0a0a0a', padding: '16px 40px', borderRadius: 4, fontSize: 14, fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: 2, width: 'fit-content' }}>{c.hero.cta}</div>
          </div>
        </div>
        <div style={{ padding: '80px 48px', borderTop: `3px solid ${accent}` }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, fontFamily: headingFont, textTransform: 'uppercase' as const, marginBottom: 40 }}>{c.services.title}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {c.services.items.map((item, i) => (
              <div key={i} style={{ padding: 28, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, fontFamily: headingFont, marginBottom: 8 }}>{item.name}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.6)' }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '80px 48px', background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'flex', gap: 48, alignItems: 'center' }}>
            {aboutImage && <div style={{ width: 360, height: 280, flexShrink: 0, borderRadius: 8, overflow: 'hidden' }}><img src={aboutImage} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} /></div>}
            <div>
              <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: headingFont, textTransform: 'uppercase' as const, marginBottom: 20 }}>{c.about.title}</h2>
              {c.about.paragraphs.map((p, i) => <p key={i} style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.6)', marginBottom: 14 }}>{p}</p>)}
            </div>
          </div>
        </div>
        <div style={{ padding: '80px 48px' }}>
          {testimonialCards(c.testimonials.items, 'transparent', 'rgba(255,255,255,0.7)', '#fff', 'rgba(255,255,255,0.4)', accent, 8)}
        </div>
        <div style={{ padding: '80px 48px', borderTop: `3px solid ${accent}`, textAlign: 'center' as const }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, fontFamily: headingFont, textTransform: 'uppercase' as const, marginBottom: 12 }}>{c.contact.title}</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 28 }}>{c.contact.description}</p>
          <div style={{ display: 'inline-block', background: '#fff', color: '#0a0a0a', padding: '16px 48px', borderRadius: 4, fontSize: 14, fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: 2 }}>{c.contact.cta}</div>
        </div>
        {footer(bk?.business_name || '', c.footer.tagline, '#000', '#fff')}
      </div>
    );
  }
};

const minimalLuxury: WebsiteTemplate = {
  id: 'minimal-luxury',
  name: 'Minimal Luxury',
  category: 'general',
  description: 'Aesop-inspired, light font weights, enormous whitespace, no flashy elements',
  render: (c, p) => {
    const { primary, secondary, headingFont, bodyFont, heroImage, aboutImage, brandKit: bk } = p;
    return (
      <div style={{ fontFamily: `'${bodyFont}', sans-serif`, background: '#FAF9F7' }}>
        <div style={{ padding: '28px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {bk?.logo_url && <img src={bk.logo_url} style={{ width: 28, height: 28, objectFit: 'contain' as const, borderRadius: 4 }} />}
            <span style={{ fontSize: 16, fontWeight: 600, color: '#2C2C2C', letterSpacing: 2, textTransform: 'uppercase' as const, fontFamily: headingFont }}>{bk?.business_name}</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#2C2C2C', letterSpacing: 3, textTransform: 'uppercase' as const, borderBottom: '1px solid #2C2C2C', paddingBottom: 2 }}>{c.hero.cta}</span>
        </div>
        {/* Hero — just text, centered */}
        <div style={{ padding: '120px 80px', textAlign: 'center' as const, maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: 48, fontWeight: 300, color: '#2C2C2C', lineHeight: 1.3, letterSpacing: 2, fontFamily: headingFont }}>{c.hero.headline}</h1>
          <div style={{ width: 40, height: 1, background: '#D4C5B9', margin: '32px auto' }} />
          <p style={{ fontSize: 16, color: '#666', lineHeight: 1.9, letterSpacing: 0.3 }}>{c.hero.subheadline}</p>
        </div>
        {heroImage && <div style={{ padding: '0 80px', marginBottom: 80 }}><img src={heroImage} style={{ width: '100%', height: 360, objectFit: 'cover' as const, borderRadius: 4 }} /></div>}
        {/* About */}
        <div style={{ padding: '80px 120px', maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 300, color: '#2C2C2C', letterSpacing: 1, fontFamily: headingFont, marginBottom: 32, textAlign: 'center' as const }}>{c.about.title}</h2>
          {c.about.paragraphs.map((p, i) => <p key={i} style={{ fontSize: 15, lineHeight: 1.9, color: '#666', marginBottom: 20, letterSpacing: 0.3 }}>{p}</p>)}
        </div>
        {/* Services */}
        <div style={{ padding: '80px 80px' }}>
          <div style={{ width: 40, height: 1, background: '#D4C5B9', margin: '0 auto 40px' }} />
          <h2 style={{ fontSize: 28, fontWeight: 300, color: '#2C2C2C', letterSpacing: 1, fontFamily: headingFont, textAlign: 'center' as const, marginBottom: 48 }}>{c.services.title}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 40, maxWidth: 800, margin: '0 auto' }}>
            {c.services.items.map((item, i) => (
              <div key={i} style={{ borderTop: '1px solid #E5E2DB', paddingTop: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2C2C2C', marginBottom: 8, fontFamily: headingFont }}>{item.name}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: '#888' }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Testimonials */}
        <div style={{ padding: '80px 120px', maxWidth: 700, margin: '0 auto', textAlign: 'center' as const }}>
          {c.testimonials.items.slice(0, 1).map((t, i) => (
            <div key={i}>
              <p style={{ fontSize: 22, lineHeight: 1.6, color: '#444', fontStyle: 'italic', fontFamily: headingFont, fontWeight: 300 }}>&ldquo;{t.quote}&rdquo;</p>
              <div style={{ marginTop: 20, fontSize: 14, fontWeight: 600, color: '#2C2C2C' }}>{t.name}</div>
              <div style={{ fontSize: 12, color: '#999' }}>{t.role}</div>
            </div>
          ))}
        </div>
        {/* Contact */}
        <div style={{ padding: '80px 48px', textAlign: 'center' as const }}>
          <h2 style={{ fontSize: 28, fontWeight: 300, color: '#2C2C2C', letterSpacing: 1, fontFamily: headingFont, marginBottom: 12 }}>{c.contact.title}</h2>
          <p style={{ fontSize: 14, color: '#888', marginBottom: 28, lineHeight: 1.8 }}>{c.contact.description}</p>
          <span style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: 3, color: '#2C2C2C', borderBottom: '1px solid #2C2C2C', paddingBottom: 2 }}>{c.contact.cta}</span>
        </div>
        <div style={{ padding: '20px 48px', borderTop: '1px solid #E5E2DB', textAlign: 'center' as const }}>
          <span style={{ fontSize: 11, color: '#bbb' }}>&copy; {new Date().getFullYear()} {bk?.business_name} · {c.footer.tagline}</span>
        </div>
      </div>
    );
  }
};

const gradientMesh: WebsiteTemplate = {
  id: 'gradient-mesh',
  name: 'Gradient Mesh',
  category: 'general',
  description: 'Figma/Apple-inspired, abstract gradients, glass cards, dark background',
  render: (c, p) => {
    const { primary, secondary, accent, headingFont, bodyFont, brandKit: bk } = p;
    return (
      <div style={{ fontFamily: `'${bodyFont}', sans-serif`, background: '#000', color: '#fff' }}>
        {nav(bk?.logo_url, bk?.business_name, headingFont, 'transparent', '#fff', c.hero.cta, 'rgba(255,255,255,0.15)', '#fff')}
        {/* Hero with mesh gradient */}
        <div style={{ position: 'relative', height: 520, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 20% 80%, ${primary}60 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${accent}50 0%, transparent 50%), radial-gradient(circle at 50% 50%, ${secondary}80 0%, transparent 80%)` }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', textAlign: 'center' as const, padding: '0 80px' }}>
            <h1 style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1, fontFamily: headingFont, textShadow: '0 4px 30px rgba(0,0,0,0.3)' }}>{c.hero.headline}</h1>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', marginTop: 16, maxWidth: 500 }}>{c.hero.subheadline}</p>
            <div style={{ marginTop: 32, display: 'inline-block', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '14px 36px', borderRadius: 50, fontSize: 15, fontWeight: 700 }}>{c.hero.cta}</div>
          </div>
        </div>
        {/* Services in glass cards */}
        <div style={{ padding: '80px 48px' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, fontFamily: headingFont, textAlign: 'center' as const, marginBottom: 48 }}>{c.services.title}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {c.services.items.map((item, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: 32, borderRadius: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: headingFont, marginBottom: 8 }}>{item.name}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.6)' }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
        {/* About */}
        <div style={{ padding: '80px 80px', maxWidth: 700, margin: '0 auto', textAlign: 'center' as const }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, fontFamily: headingFont, marginBottom: 24 }}>{c.about.title}</h2>
          {c.about.paragraphs.map((p, i) => <p key={i} style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>{p}</p>)}
        </div>
        {/* Testimonials */}
        <div style={{ padding: '80px 48px' }}>
          {testimonialCards(c.testimonials.items, 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.7)', '#fff', 'rgba(255,255,255,0.4)', accent, 16)}
        </div>
        {/* Contact */}
        <div style={{ padding: '80px 48px', textAlign: 'center' as const }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, fontFamily: headingFont, marginBottom: 12 }}>{c.contact.title}</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 28 }}>{c.contact.description}</p>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '14px 36px', borderRadius: 50, fontSize: 15, fontWeight: 700 }}>{c.contact.cta}</div>
        </div>
        {footer(bk?.business_name || '', c.footer.tagline, '#000', '#fff')}
      </div>
    );
  }
};

const cinematicHero: WebsiteTemplate = {
  id: 'cinematic',
  name: 'Cinematic',
  category: 'general',
  description: 'Dramatic oversized text, high contrast, editorial feel',
  render: (c, p) => {
    const { primary, secondary, accent, headingFont, bodyFont, heroImage, aboutImage, brandKit: bk } = p;
    return (
      <div style={{ fontFamily: `'${bodyFont}', sans-serif` }}>
        {nav(bk?.logo_url, bk?.business_name, headingFont, '#000', '#fff', c.hero.cta, accent, '#fff', '1px solid rgba(255,255,255,0.1)')}
        {/* Massive hero text */}
        <div style={{ background: '#000', padding: '120px 48px 100px', position: 'relative', overflow: 'hidden' }}>
          {heroImage && <div style={{ position: 'absolute', inset: 0, opacity: 0.2 }}><img src={heroImage} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} /></div>}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ fontSize: 96, fontWeight: 900, color: '#fff', lineHeight: 0.95, fontFamily: headingFont, textTransform: 'uppercase' as const, letterSpacing: -4 }}>{c.hero.headline}</h1>
            <div style={{ width: 60, height: 3, background: accent, marginTop: 32, borderRadius: 2 }} />
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', marginTop: 24, maxWidth: 500, fontWeight: 300 }}>{c.hero.subheadline}</p>
            <div style={{ marginTop: 32, display: 'inline-block', background: accent, color: '#fff', padding: '16px 40px', borderRadius: 4, fontSize: 14, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: 2 }}>{c.hero.cta}</div>
          </div>
        </div>
        {/* White section */}
        <div style={{ background: '#fff', color: '#111' }}>
          <div style={{ padding: '80px 48px' }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, fontFamily: headingFont, marginBottom: 48 }}>{c.services.title}</h2>
            {serviceGrid(c.services.items, 2, '#f8f8f8', '#111', '#666', accent, headingFont, bodyFont, 8)}
          </div>
          <div style={{ padding: '80px 48px', display: 'flex', gap: 48 }}>
            {aboutImage && <div style={{ width: 400, flexShrink: 0, borderRadius: 8, overflow: 'hidden' }}><img src={aboutImage} style={{ width: '100%', height: 320, objectFit: 'cover' as const }} /></div>}
            <div>
              <h2 style={{ fontSize: 36, fontWeight: 800, fontFamily: headingFont, marginBottom: 20 }}>{c.about.title}</h2>
              {c.about.paragraphs.map((p, i) => <p key={i} style={{ fontSize: 15, lineHeight: 1.8, color: '#555', marginBottom: 14 }}>{p}</p>)}
            </div>
          </div>
          <div style={{ padding: '80px 48px', background: '#f8f8f8' }}>
            {testimonialCards(c.testimonials.items, '#fff', '#555', '#111', '#999', accent, 8)}
          </div>
        </div>
        {/* Contact — dark again */}
        <div style={{ background: '#000', color: '#fff', padding: '80px 48px', textAlign: 'center' as const }}>
          <h2 style={{ fontSize: 48, fontWeight: 900, fontFamily: headingFont, textTransform: 'uppercase' as const, letterSpacing: -2, marginBottom: 12 }}>{c.contact.title}</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 28 }}>{c.contact.description}</p>
          <div style={{ display: 'inline-block', background: '#fff', color: '#000', padding: '16px 48px', borderRadius: 4, fontSize: 14, fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: 2 }}>{c.contact.cta}</div>
        </div>
        {footer(bk?.business_name || '', c.footer.tagline, '#000', '#fff')}
      </div>
    );
  }
};

const magazineEditorial: WebsiteTemplate = {
  id: 'magazine',
  name: 'Magazine Editorial',
  category: 'general',
  description: 'Stripe/Linear-inspired, asymmetric layout, gradient text accents',
  render: (c, p) => {
    const { primary, secondary, accent, headingFont, bodyFont, heroImage, aboutImage, brandKit: bk } = p;
    return (
      <div style={{ fontFamily: `'${bodyFont}', sans-serif`, background: '#fff' }}>
        {nav(bk?.logo_url, bk?.business_name, headingFont, '#fff', secondary, c.hero.cta, primary, '#fff', '1px solid #eee')}
        <div style={{ padding: '80px 48px', display: 'flex', gap: 48, alignItems: 'center' }}>
          <div style={{ flex: 1, maxWidth: 560 }}>
            <h1 style={{ fontSize: 56, fontWeight: 800, color: secondary, lineHeight: 1.1, fontFamily: headingFont, letterSpacing: -2 }}>{c.hero.headline}</h1>
            <p style={{ fontSize: 18, color: '#666', marginTop: 20, lineHeight: 1.7 }}>{c.hero.subheadline}</p>
            <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
              <div style={{ background: primary, color: '#fff', padding: '14px 32px', borderRadius: 8, fontSize: 15, fontWeight: 700 }}>{c.hero.cta}</div>
              <div style={{ border: `1px solid ${secondary}20`, color: secondary, padding: '14px 32px', borderRadius: 8, fontSize: 15, fontWeight: 600 }}>Learn More</div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            {heroImage ? <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}><img src={heroImage} style={{ width: '100%', height: 380, objectFit: 'cover' as const }} /></div> : <div style={{ height: 380, borderRadius: 16, background: `linear-gradient(135deg, ${primary}20, ${accent}20)` }} />}
          </div>
        </div>
        {/* Stats bar */}
        <div style={{ padding: '40px 48px', background: '#f8f9fa', display: 'flex', justifyContent: 'center', gap: 80 }}>
          {['Trusted by 1000+', '5-Star Rated', 'Since Day One'].map((s, i) => (
            <span key={i} style={{ fontSize: 14, fontWeight: 600, color: '#999', letterSpacing: 1 }}>{s}</span>
          ))}
        </div>
        <div style={{ padding: '80px 48px' }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: secondary, fontFamily: headingFont, letterSpacing: -1, marginBottom: 48 }}>{c.services.title}</h2>
          {serviceGrid(c.services.items, 2, '#fff', secondary, '#666', primary, headingFont, bodyFont, 12)}
        </div>
        <div style={{ padding: '80px 48px', background: '#f8f9fa', display: 'flex', gap: 48 }}>
          {aboutImage && <div style={{ width: 340, flexShrink: 0, borderRadius: 12, overflow: 'hidden' }}><img src={aboutImage} style={{ width: '100%', height: 300, objectFit: 'cover' as const }} /></div>}
          <div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: secondary, fontFamily: headingFont, marginBottom: 20 }}>{c.about.title}</h2>
            {c.about.paragraphs.map((p, i) => <p key={i} style={{ fontSize: 15, lineHeight: 1.8, color: '#555', marginBottom: 14 }}>{p}</p>)}
          </div>
        </div>
        <div style={{ padding: '80px 48px' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: secondary, fontFamily: headingFont, textAlign: 'center' as const, marginBottom: 48 }}>What Our Clients Say</h2>
          {testimonialCards(c.testimonials.items, '#f8f9fa', '#555', secondary, '#999', primary, 12)}
        </div>
        <div style={{ padding: '80px 48px', background: secondary, textAlign: 'center' as const }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff', fontFamily: headingFont, marginBottom: 12 }}>{c.contact.title}</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 28 }}>{c.contact.description}</p>
          <div style={{ display: 'inline-block', background: primary, color: '#fff', padding: '14px 40px', borderRadius: 8, fontSize: 16, fontWeight: 700 }}>{c.contact.cta}</div>
        </div>
        {footer(bk?.business_name || '', c.footer.tagline, '#111', '#fff')}
      </div>
    );
  }
};

const splitHero: WebsiteTemplate = {
  id: 'split-hero',
  name: 'Split Hero',
  category: 'general',
  description: 'Asymmetric 50/50 split, dark left with text, image right',
  render: (c, p) => {
    const { primary, secondary, accent, headingFont, bodyFont, heroImage, aboutImage, brandKit: bk } = p;
    return (
      <div style={{ fontFamily: `'${bodyFont}', sans-serif` }}>
        {/* Split hero */}
        <div style={{ display: 'flex', height: 520 }}>
          <div style={{ width: '50%', background: secondary, padding: '48px 48px', display: 'flex', flexDirection: 'column' as const, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {bk?.logo_url && <img src={bk.logo_url} style={{ width: 32, height: 32, objectFit: 'contain' as const, borderRadius: 6 }} />}
              <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: headingFont }}>{bk?.business_name}</span>
            </div>
            <div>
              <div style={{ width: 48, height: 3, background: accent, borderRadius: 2, marginBottom: 20 }} />
              <h1 style={{ fontSize: 44, fontWeight: 800, color: '#fff', lineHeight: 1.1, fontFamily: headingFont }}>{c.hero.headline}</h1>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: 16, lineHeight: 1.6 }}>{c.hero.subheadline}</p>
            </div>
            <div style={{ display: 'inline-block', background: accent, color: '#fff', padding: '14px 36px', borderRadius: 6, fontSize: 15, fontWeight: 700, width: 'fit-content' }}>{c.hero.cta}</div>
          </div>
          <div style={{ width: '50%', overflow: 'hidden' }}>
            {heroImage ? <img src={heroImage} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} /> : <div style={{ width: '100%', height: '100%', background: `${primary}30` }} />}
          </div>
        </div>
        {/* Services */}
        <div style={{ padding: '80px 48px', background: '#fff' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: secondary, fontFamily: headingFont, textAlign: 'center' as const, marginBottom: 48 }}>{c.services.title}</h2>
          {serviceGrid(c.services.items, 4, '#f8f9fa', secondary, '#666', accent, headingFont, bodyFont, 8)}
        </div>
        {/* About */}
        <div style={{ padding: '80px 48px', background: '#f8f9fa', display: 'flex', gap: 48 }}>
          {aboutImage && <div style={{ width: 340, flexShrink: 0, borderRadius: 8, overflow: 'hidden' }}><img src={aboutImage} style={{ width: '100%', height: 280, objectFit: 'cover' as const }} /></div>}
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: secondary, fontFamily: headingFont, marginBottom: 16 }}>{c.about.title}</h2>
            {c.about.paragraphs.map((p, i) => <p key={i} style={{ fontSize: 15, lineHeight: 1.8, color: '#555', marginBottom: 14 }}>{p}</p>)}
          </div>
        </div>
        {/* Testimonials */}
        <div style={{ padding: '80px 48px', background: '#fff' }}>
          {testimonialCards(c.testimonials.items, '#f8f9fa', '#555', secondary, '#999', accent, 8)}
        </div>
        {/* Contact */}
        <div style={{ padding: '80px 48px', background: secondary, textAlign: 'center' as const }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff', fontFamily: headingFont, marginBottom: 12 }}>{c.contact.title}</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>{c.contact.description}</p>
          <div style={{ display: 'inline-block', background: accent, color: '#fff', padding: '14px 36px', borderRadius: 6, fontSize: 15, fontWeight: 700 }}>{c.contact.cta}</div>
        </div>
        {footer(bk?.business_name || '', c.footer.tagline, '#111', '#fff')}
      </div>
    );
  }
};

// ============================================================
// INDUSTRY-SPECIFIC TEMPLATES
// ============================================================

function industryTemplate(id: string, name: string, industry: string, desc: string, palette: { bg: string; surface: string; primary: string; accent: string; text: string; textSec: string }, heroStyle: 'overlay' | 'split' | 'centered', ctaText: string, sectionBg: string): WebsiteTemplate {
  return {
    id, name, category: 'industry', industry, description: desc,
    render: (c, p) => {
      const { headingFont, bodyFont, heroImage, aboutImage, brandKit: bk } = p;
      // Use brand kit colors but blend with industry defaults
      const primary = p.primary || palette.primary;
      const secondary = p.secondary || palette.text;
      const accent = p.accent || palette.accent;

      const heroContent = (
        <>
          <h1 style={{ fontSize: heroStyle === 'centered' ? 44 : 48, fontWeight: 800, color: '#fff', lineHeight: 1.1, fontFamily: headingFont, marginBottom: 12, textTransform: heroStyle === 'overlay' ? 'none' : 'none' as const }}>{c.hero.headline}</h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, maxWidth: 520 }}>{c.hero.subheadline}</p>
          <div style={{ marginTop: 24, display: 'inline-block', background: accent, color: '#fff', padding: '14px 36px', borderRadius: 8, fontSize: 15, fontWeight: 700 }}>{ctaText}</div>
        </>
      );

      return (
        <div style={{ fontFamily: `'${bodyFont}', sans-serif`, background: palette.bg }}>
          {nav(bk?.logo_url, bk?.business_name, headingFont, palette.bg, palette.text, ctaText, primary, '#fff', `1px solid ${palette.text}15`)}

          {/* Hero */}
          {heroStyle === 'overlay' && (
            <div style={{ position: 'relative', height: 480, overflow: 'hidden' }}>
              {heroImage ? <img src={heroImage} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} /> : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${secondary}, ${primary})` }} />}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 30%, rgba(0,0,0,0.75))', display: 'flex', flexDirection: 'column' as const, justifyContent: 'flex-end', padding: '0 48px 48px' }}>
                {heroContent}
              </div>
            </div>
          )}
          {heroStyle === 'split' && (
            <div style={{ display: 'flex', minHeight: 440 }}>
              <div style={{ width: '55%', padding: '64px 48px', display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', background: palette.bg }}>
                <div style={{ marginBottom: 16, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 2, color: accent }}>{bk?.industry}</div>
                <h1 style={{ fontSize: 44, fontWeight: 800, color: palette.text, lineHeight: 1.1, fontFamily: headingFont, marginBottom: 16 }}>{c.hero.headline}</h1>
                <p style={{ fontSize: 17, color: palette.textSec, lineHeight: 1.6, marginBottom: 28 }}>{c.hero.subheadline}</p>
                <div style={{ display: 'inline-block', background: primary, color: '#fff', padding: '14px 36px', borderRadius: 8, fontSize: 15, fontWeight: 700, width: 'fit-content' }}>{ctaText}</div>
              </div>
              <div style={{ width: '45%', overflow: 'hidden' }}>
                {heroImage ? <img src={heroImage} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} /> : <div style={{ width: '100%', height: '100%', background: `${primary}20` }} />}
              </div>
            </div>
          )}
          {heroStyle === 'centered' && (
            <div style={{ position: 'relative', height: 460, overflow: 'hidden' }}>
              {heroImage ? <img src={heroImage} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} /> : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${secondary}, ${primary})` }} />}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', textAlign: 'center' as const, padding: '0 80px' }}>
                {heroContent}
              </div>
            </div>
          )}

          {/* Services */}
          <div style={{ padding: '80px 48px', background: sectionBg }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: palette.text, fontFamily: headingFont, textAlign: 'center' as const, marginBottom: 48 }}>{c.services.title}</h2>
            {serviceGrid(c.services.items, 2, palette.bg === '#fff' ? '#f8f9fa' : '#fff', palette.text, palette.textSec, accent, headingFont, bodyFont, 12)}
          </div>

          {/* About */}
          <div style={{ padding: '80px 48px', background: palette.bg, display: 'flex', gap: 48, alignItems: 'center' }}>
            {aboutImage && <div style={{ width: 340, flexShrink: 0, borderRadius: 12, overflow: 'hidden' }}><img src={aboutImage} style={{ width: '100%', height: 280, objectFit: 'cover' as const }} /></div>}
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: palette.text, fontFamily: headingFont, marginBottom: 16 }}>{c.about.title}</h2>
              {c.about.paragraphs.map((pr, i) => <p key={i} style={{ fontSize: 15, lineHeight: 1.8, color: palette.textSec, marginBottom: 14 }}>{pr}</p>)}
            </div>
          </div>

          {/* Testimonials */}
          <div style={{ padding: '80px 48px', background: sectionBg }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: palette.text, fontFamily: headingFont, textAlign: 'center' as const, marginBottom: 40 }}>What People Say</h2>
            {testimonialCards(c.testimonials.items, palette.bg === '#fff' ? '#f8f9fa' : '#fff', palette.textSec, palette.text, palette.textSec, accent, 12)}
          </div>

          {/* Contact */}
          <div style={{ padding: '80px 48px', background: secondary || palette.text, textAlign: 'center' as const }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff', fontFamily: headingFont, marginBottom: 12 }}>{c.contact.title}</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>{c.contact.description}</p>
            <div style={{ display: 'inline-block', background: accent, color: '#fff', padding: '14px 40px', borderRadius: 8, fontSize: 16, fontWeight: 700 }}>{c.contact.cta}</div>
            {bk && <div style={{ marginTop: 32, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{[bk.business_address, bk.business_phone, bk.business_email].filter(Boolean).join(' · ')}</div>}
          </div>

          {footer(bk?.business_name || '', c.footer.tagline, '#111', '#fff')}
        </div>
      );
    }
  };
}

// ============================================================
// ALL TEMPLATES REGISTRY
// ============================================================

export const WEBSITE_TEMPLATES: WebsiteTemplate[] = [
  // General (8)
  modernClean,
  classicWarm,
  boldDark,
  minimalLuxury,
  gradientMesh,
  cinematicHero,
  magazineEditorial,
  splitHero,

  // Industry-specific (12)
  industryTemplate('restaurant', 'Restaurant', 'Restaurant', 'Dark, warm gold accents, menu-focused, moody photography', { bg: '#1A1A1A', surface: '#242424', primary: '#C8A96E', accent: '#C8A96E', text: '#F5F0EB', textSec: '#9B9B9B' }, 'overlay', 'Reserve a Table', '#242424'),

  industryTemplate('dental', 'Dental / Medical', 'Dentist', 'Clean whites, trust blues, booking form focus, certification badges', { bg: '#FFFFFF', surface: '#F7F9FC', primary: '#2B6CB0', accent: '#38B2AC', text: '#1A202C', textSec: '#718096' }, 'split', 'Book Your Visit', '#F7F9FC'),

  industryTemplate('law', 'Law Firm', 'Law Firm', 'Warm off-white, navy + bronze, serif headings, authoritative', { bg: '#FAFAF8', surface: '#FFFFFF', primary: '#1B2A4A', accent: '#8B7355', text: '#1B2A4A', textSec: '#6B7280' }, 'overlay', 'Schedule Consultation', '#fff'),

  industryTemplate('fitness', 'Fitness / Gym', 'Gym', 'Dark background, high energy, bold uppercase, orange-red accent', { bg: '#0A0A0A', surface: '#161616', primary: '#FF4500', accent: '#FF4500', text: '#FFFFFF', textSec: '#8A8A8A' }, 'overlay', 'Start Free Trial', '#161616'),

  industryTemplate('salon', 'Salon / Spa', 'Salon', 'Cream background, soft gold accents, elegant serif headings', { bg: '#FBF8F4', surface: '#FFFFFF', primary: '#2D2926', accent: '#C5A880', text: '#2D2926', textSec: '#8C7E74' }, 'split', 'Book Appointment', '#fff'),

  industryTemplate('realestate', 'Real Estate', 'Real Estate', 'Clean white, bronze accents, property-focused hero, search feel', { bg: '#FFFFFF', surface: '#F8F8F6', primary: '#1C1C1C', accent: '#B8926A', text: '#1C1C1C', textSec: '#666666' }, 'overlay', 'View Listings', '#F8F8F6'),

  industryTemplate('retail', 'Retail / Shop', 'Retail', 'Minimal white, product-forward, coral accent, e-commerce feel', { bg: '#FFFFFF', surface: '#F5F5F0', primary: '#111111', accent: '#E85D3A', text: '#111111', textSec: '#777777' }, 'split', 'Shop Now', '#F5F5F0'),

  industryTemplate('nonprofit', 'Non-Profit', 'Other', 'Forest green + gold, mission-driven, impact stats, donate CTA', { bg: '#FFFFFF', surface: '#F0F7F4', primary: '#1D4E3E', accent: '#F7C35F', text: '#1A1A1A', textSec: '#555555' }, 'centered', 'Donate Now', '#F0F7F4'),

  industryTemplate('construction', 'Construction', 'Other', 'Safety orange + dark navy, project gallery, estimate CTA', { bg: '#FFFFFF', surface: '#F2F2F2', primary: '#FF6B2B', accent: '#FF6B2B', text: '#1A1A2E', textSec: '#666666' }, 'overlay', 'Get Free Estimate', '#F2F2F2'),

  industryTemplate('auto', 'Auto Shop', 'Auto Shop', 'Classic red + dark, service-focused, coupon style, trust badges', { bg: '#FAFAFA', surface: '#FFFFFF', primary: '#CC0000', accent: '#CC0000', text: '#1A1A1A', textSec: '#666666' }, 'split', 'Book Service', '#fff'),

  industryTemplate('bakery', 'Bakery / Cafe', 'Bakery', 'Warm tones, artisan feel, menu highlights, cozy photography', { bg: '#FDF8F3', surface: '#FFFFFF', primary: '#8B5E3C', accent: '#D4956A', text: '#3C2415', textSec: '#8B7355' }, 'overlay', 'Order Online', '#fff'),

  industryTemplate('education', 'Education', 'Other', 'Bright, approachable, course cards, enrollment CTA', { bg: '#FFFFFF', surface: '#F0F4FF', primary: '#4F46E5', accent: '#10B981', text: '#111827', textSec: '#6B7280' }, 'centered', 'Enroll Now', '#F0F4FF'),
];

// Get templates filtered by industry (returns matching + all general)
export function getTemplatesForIndustry(industry?: string): WebsiteTemplate[] {
  if (!industry) return WEBSITE_TEMPLATES;

  const matching = WEBSITE_TEMPLATES.filter(t =>
    t.category === 'general' ||
    (t.industry && industry.toLowerCase().includes(t.industry.toLowerCase())) ||
    (t.industry && t.industry.toLowerCase().includes(industry.toLowerCase()))
  );

  return matching.length > 8 ? matching : WEBSITE_TEMPLATES;
}
