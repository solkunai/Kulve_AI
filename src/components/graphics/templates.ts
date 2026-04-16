// Premium template definitions for branded graphics
// Based on design patterns from Apple, Airbnb, Stripe, Nike, and top Dribbble/Behance portfolios

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface GraphicData {
  headline: string;
  body?: string;
  cta?: string;
  logoUrl?: string;
  userImageUrl?: string;
  businessName: string;
  brandColors: BrandColors;
  headingFont: string;
  bodyFont: string;
}

export type TemplateStyle = 'glass' | 'split' | 'floating' | 'stacked' | 'collage' | 'mesh' | 'promotional' | 'announcement' | 'quote' | 'showcase' | 'geometric' | 'minimal' | 'gradient' | 'accent-bar' | 'diagonal';
export type GraphicFormat = 'instagram' | 'facebook' | 'story' | 'flyer' | 'business-card' | 'email-header';

export const FORMAT_DIMENSIONS: Record<GraphicFormat, { width: number; height: number; label: string }> = {
  instagram: { width: 1080, height: 1080, label: 'Instagram Post' },
  facebook: { width: 1200, height: 630, label: 'Facebook Post' },
  story: { width: 1080, height: 1920, label: 'Instagram Story' },
  flyer: { width: 816, height: 1056, label: 'Flyer (Letter)' },
  'business-card': { width: 630, height: 360, label: 'Business Card' },
  'email-header': { width: 600, height: 200, label: 'Email Header' },
};

function hexToRgba(hex: string, alpha: number): string {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  } catch {
    return `rgba(59,109,202,${alpha})`;
  }
}

function bgImage(url: string | undefined, opacity = 0.45): string {
  if (!url) return '';
  return `<div style="position:absolute;inset:0;"><img src="${url}" style="width:100%;height:100%;object-fit:cover;" /><div style="position:absolute;inset:0;background:rgba(0,0,0,${opacity});"></div></div>`;
}

// ============================================================
// 1. GLASS MORPHISM — Frosted glass card over photo background
// Inspired by: Apple, modern SaaS, high-end product showcases
// ============================================================
export function glassTemplate(data: GraphicData): string {
  const { headline, body, cta, logoUrl, userImageUrl, businessName, brandColors, headingFont, bodyFont } = data;
  return `
    <div style="width:1080px;height:1080px;position:relative;overflow:hidden;background:${brandColors.secondary};font-family:'${headingFont}',sans-serif;">
      ${bgImage(userImageUrl, 0.3)}
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:1;">
        <div style="width:840px;background:rgba(255,255,255,0.12);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.2);border-radius:24px;padding:64px;box-shadow:0 8px 32px rgba(0,0,0,0.3);">
          ${logoUrl ? `<img src="${logoUrl}" style="width:48px;height:48px;object-fit:contain;border-radius:12px;margin-bottom:24px;" />` : ''}
          <h1 style="color:#fff;font-size:52px;font-weight:800;line-height:1.1;margin:0 0 16px;letter-spacing:-1px;">${headline}</h1>
          ${body ? `<p style="color:rgba(255,255,255,0.8);font-size:22px;font-weight:400;line-height:1.5;margin:0 0 28px;font-family:'${bodyFont}',sans-serif;">${body}</p>` : ''}
          ${cta ? `<div style="display:inline-block;background:${brandColors.accent};color:#fff;padding:14px 36px;border-radius:50px;font-size:16px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">${cta}</div>` : ''}
          <div style="margin-top:28px;color:rgba(255,255,255,0.5);font-size:14px;font-weight:600;">${businessName}</div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// 2. ASYMMETRIC SPLIT — Diagonal color/photo split
// Inspired by: Nike product drops, dynamic fitness brands
// ============================================================
export function splitTemplate(data: GraphicData): string {
  const { headline, cta, logoUrl, userImageUrl, businessName, brandColors, headingFont } = data;
  return `
    <div style="width:1080px;height:1080px;position:relative;overflow:hidden;background:#fff;font-family:'${headingFont}',sans-serif;">
      <div style="position:absolute;inset:0;clip-path:polygon(0 0,60% 0,45% 100%,0 100%);background:${brandColors.secondary};z-index:2;">
        <div style="padding:80px 60px;height:100%;display:flex;flex-direction:column;justify-content:space-between;max-width:450px;">
          <div style="display:flex;align-items:center;gap:12px;">
            ${logoUrl ? `<img src="${logoUrl}" style="width:52px;height:52px;object-fit:contain;border-radius:10px;" />` : ''}
            <span style="color:rgba(255,255,255,0.7);font-size:16px;font-weight:700;">${businessName}</span>
          </div>
          <div>
            <div style="width:60px;height:4px;background:${brandColors.accent};border-radius:2px;margin-bottom:24px;"></div>
            <h1 style="color:#fff;font-size:64px;font-weight:900;line-height:1.0;margin:0;letter-spacing:-2px;text-transform:uppercase;">${headline}</h1>
          </div>
          ${cta ? `<div style="display:inline-block;border:2px solid rgba(255,255,255,0.6);color:#fff;padding:16px 40px;border-radius:6px;font-size:16px;font-weight:700;text-transform:uppercase;letter-spacing:1px;width:fit-content;">${cta}</div>` : '<div></div>'}
        </div>
      </div>
      <div style="position:absolute;inset:0;clip-path:polygon(55% 0,100% 0,100% 100%,40% 100%);z-index:1;">
        ${userImageUrl ? `<img src="${userImageUrl}" style="width:100%;height:100%;object-fit:cover;" />` : `<div style="width:100%;height:100%;background:${brandColors.primary};"></div>`}
      </div>
    </div>
  `;
}

// ============================================================
// 3. FLOATING TEXT — Blurred photo background, floating centered text
// Inspired by: Cinematic event posters, luxury brand campaigns
// ============================================================
export function floatingTemplate(data: GraphicData): string {
  const { headline, body, logoUrl, userImageUrl, businessName, brandColors, headingFont, bodyFont } = data;
  return `
    <div style="width:1080px;height:1080px;position:relative;overflow:hidden;background:${brandColors.secondary};font-family:'${headingFont}',sans-serif;">
      ${userImageUrl ? `<div style="position:absolute;inset:0;"><img src="${userImageUrl}" style="width:100%;height:100%;object-fit:cover;filter:blur(30px);transform:scale(1.15);" /><div style="position:absolute;inset:0;background:${hexToRgba(brandColors.primary, 0.4)};"></div></div>` : `<div style="position:absolute;inset:0;background:linear-gradient(135deg,${brandColors.secondary},${brandColors.primary});"></div>`}
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;z-index:1;padding:80px;">
        ${logoUrl ? `<img src="${logoUrl}" style="width:56px;height:56px;object-fit:contain;border-radius:14px;margin-bottom:32px;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.3));" />` : ''}
        <h1 style="color:#fff;font-size:72px;font-weight:900;line-height:1.1;margin:0;text-shadow:0 2px 40px rgba(0,0,0,0.3);max-width:85%;">${headline}</h1>
        <div style="width:80px;height:3px;background:${brandColors.accent};margin:28px auto;border-radius:2px;"></div>
        ${body ? `<p style="color:rgba(255,255,255,0.85);font-size:20px;font-weight:500;margin:0;font-family:'${bodyFont}',sans-serif;">${body}</p>` : ''}
        <div style="margin-top:40px;color:rgba(255,255,255,0.7);font-size:16px;font-weight:700;text-transform:uppercase;letter-spacing:4px;">${businessName}</div>
      </div>
    </div>
  `;
}

// ============================================================
// 4. STACKED TYPOGRAPHY — No image, pure type design with mixed treatments
// Inspired by: Design studios, editorial print, Behance trending
// ============================================================
export function stackedTemplate(data: GraphicData): string {
  const { headline, cta, logoUrl, businessName, brandColors, headingFont } = data;
  const words = headline.split(' ');
  const line1 = words.slice(0, Math.ceil(words.length / 3)).join(' ');
  const line2 = words.slice(Math.ceil(words.length / 3), Math.ceil(words.length * 2 / 3)).join(' ');
  const line3 = words.slice(Math.ceil(words.length * 2 / 3)).join(' ');

  return `
    <div style="width:1080px;height:1080px;position:relative;overflow:hidden;background:${brandColors.secondary};font-family:'${headingFont}',sans-serif;">
      <div style="position:absolute;top:0;left:0;right:0;height:4px;background:${brandColors.accent};"></div>
      <div style="position:absolute;top:64px;left:72px;display:flex;align-items:center;gap:14px;">
        ${logoUrl ? `<img src="${logoUrl}" style="width:44px;height:44px;object-fit:contain;border-radius:10px;" />` : ''}
      </div>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 72px;">
        <div style="font-size:80px;font-weight:900;line-height:0.95;text-transform:uppercase;letter-spacing:-2px;">
          <div style="-webkit-text-stroke:2px rgba(255,255,255,0.7);color:transparent;">${line1}</div>
          <div style="color:#fff;">${line2}</div>
          <div style="color:${brandColors.accent};">${line3}</div>
        </div>
        ${cta ? `<div style="margin-top:36px;display:inline-block;border:2px solid rgba(255,255,255,0.3);color:#fff;padding:14px 36px;border-radius:6px;font-size:16px;font-weight:700;text-transform:uppercase;letter-spacing:2px;width:fit-content;">${cta}</div>` : ''}
      </div>
      <div style="position:absolute;bottom:64px;right:72px;color:rgba(255,255,255,0.5);font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:4px;">${businessName}</div>
    </div>
  `;
}

// ============================================================
// 5. GRID COLLAGE — Multi-image 2x2 grid with text block below
// Inspired by: Real estate, restaurants, portfolio showcases
// ============================================================
export function collageTemplate(data: GraphicData): string {
  const { headline, cta, logoUrl, userImageUrl, businessName, brandColors, headingFont } = data;
  const img = userImageUrl || '';
  return `
    <div style="width:1080px;height:1080px;position:relative;overflow:hidden;background:${brandColors.secondary};font-family:'${headingFont}',sans-serif;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px;height:70%;">
        <div style="border-radius:8px;overflow:hidden;background:${hexToRgba(brandColors.primary, 0.3)};">
          ${img ? `<img src="${img}" style="width:100%;height:100%;object-fit:cover;filter:brightness(1.05);" />` : ''}
        </div>
        <div style="border-radius:8px;overflow:hidden;background:${hexToRgba(brandColors.accent, 0.3)};">
          ${img ? `<img src="${img}" style="width:100%;height:100%;object-fit:cover;filter:saturate(1.2);" />` : ''}
        </div>
        <div style="border-radius:8px;overflow:hidden;background:${hexToRgba(brandColors.primary, 0.2)};">
          ${img ? `<img src="${img}" style="width:100%;height:100%;object-fit:cover;filter:contrast(1.1);" />` : ''}
        </div>
        <div style="border-radius:8px;overflow:hidden;background:${hexToRgba(brandColors.accent, 0.2)};">
          ${img ? `<img src="${img}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.95);" />` : ''}
        </div>
      </div>
      <div style="height:3px;background:${brandColors.accent};margin:0 8px;"></div>
      <div style="height:30%;padding:40px 56px;display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:16px;">
          ${logoUrl ? `<img src="${logoUrl}" style="width:44px;height:44px;object-fit:contain;border-radius:10px;" />` : ''}
          <div>
            <h2 style="color:#fff;font-size:36px;font-weight:800;line-height:1.15;margin:0;letter-spacing:-0.5px;">${headline}</h2>
            <span style="color:rgba(255,255,255,0.5);font-size:14px;font-weight:600;">${businessName}</span>
          </div>
        </div>
        ${cta ? `<div style="background:#fff;color:${brandColors.secondary};padding:14px 32px;border-radius:6px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:2px;white-space:nowrap;">${cta}</div>` : ''}
      </div>
    </div>
  `;
}

// ============================================================
// 6. GRADIENT MESH — Abstract layered gradients, no photo needed
// Inspired by: Figma, Apple keynotes, modern SaaS brands
// ============================================================
export function meshTemplate(data: GraphicData): string {
  const { headline, body, cta, logoUrl, businessName, brandColors, headingFont, bodyFont } = data;
  return `
    <div style="width:1080px;height:1080px;position:relative;overflow:hidden;font-family:'${headingFont}',sans-serif;background:${brandColors.secondary};">
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 20% 80%,${hexToRgba(brandColors.primary, 0.6)} 0%,transparent 50%),radial-gradient(circle at 80% 20%,${hexToRgba(brandColors.accent, 0.5)} 0%,transparent 50%),radial-gradient(circle at 50% 50%,${hexToRgba(brandColors.secondary, 0.8)} 0%,transparent 80%);"></div>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;z-index:1;padding:80px;">
        ${logoUrl ? `<img src="${logoUrl}" style="width:52px;height:52px;object-fit:contain;border-radius:12px;margin-bottom:32px;" />` : ''}
        <h1 style="color:#fff;font-size:68px;font-weight:800;line-height:1.1;margin:0;text-shadow:0 4px 30px rgba(0,0,0,0.2);">${headline}</h1>
        ${body ? `<p style="color:rgba(255,255,255,0.8);font-size:20px;font-weight:500;margin:20px 0 0;font-family:'${bodyFont}',sans-serif;">${body}</p>` : ''}
        ${cta ? `<div style="margin-top:36px;display:inline-block;background:rgba(255,255,255,0.2);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.3);color:#fff;padding:14px 36px;border-radius:50px;font-size:15px;font-weight:700;letter-spacing:1px;">${cta}</div>` : ''}
        <div style="margin-top:36px;color:rgba(255,255,255,0.5);font-size:14px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">${businessName}</div>
      </div>
    </div>
  `;
}

// ============================================================
// LEGACY COMPATIBILITY — Keep old names working, map to new styles
// ============================================================
export const promotionalTemplate = glassTemplate;
export const announcementTemplate = splitTemplate;
export const quoteTemplate = floatingTemplate;
export const showcaseTemplate = stackedTemplate;
export const geometricTemplate = collageTemplate;
export const minimalTemplate = meshTemplate;
export const gradientTemplate = meshTemplate;
export const accentBarTemplate = glassTemplate;
export const diagonalTemplate = splitTemplate;

// Template registry
export const TEMPLATES: Record<TemplateStyle, (data: GraphicData) => string> = {
  glass: glassTemplate,
  split: splitTemplate,
  floating: floatingTemplate,
  stacked: stackedTemplate,
  collage: collageTemplate,
  mesh: meshTemplate,
  // Legacy aliases
  promotional: glassTemplate,
  announcement: splitTemplate,
  quote: floatingTemplate,
  showcase: stackedTemplate,
  geometric: collageTemplate,
  minimal: meshTemplate,
  gradient: meshTemplate,
  'accent-bar': glassTemplate,
  diagonal: splitTemplate,
};

export const ALL_STYLES: TemplateStyle[] = ['glass', 'split', 'floating', 'stacked', 'collage', 'mesh'];

export function getTemplate(style: TemplateStyle): (data: GraphicData) => string {
  return TEMPLATES[style] || glassTemplate;
}

export function renderGraphic(_format: GraphicFormat, style: TemplateStyle, data: GraphicData): string {
  const templateFn = getTemplate(style);
  return templateFn(data);
}
