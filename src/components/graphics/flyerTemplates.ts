import type { BrandColors } from './templates';

function hexToRgba(hex: string, alpha: number): string {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  } catch { return `rgba(59,109,202,${alpha})`; }
}

export interface FlyerData {
  headline: string;
  offer: string;
  offerDetails: string;
  bulletPoints: string[];
  cta: string;
  tagline: string;
  address: string;
  phone: string;
  website: string;
  hours: string;
  logoUrl?: string;
  imageUrl?: string;
  businessName: string;
  brandColors: BrandColors;
  headingFont: string;
  bodyFont: string;
}

export interface CardData {
  name: string;
  title: string;
  tagline: string;
  phone: string;
  email: string;
  website: string;
  logoUrl?: string;
  imageUrl?: string;
  businessName: string;
  brandColors: BrandColors;
  headingFont: string;
  bodyFont: string;
}

// =================================================================
// FLYER TEMPLATES (792x612 = Half letter / handout size)
// =================================================================

// 1. SPLIT HERO — Image left, content right
function flyerSplitHero(d: FlyerData): string {
  return `
    <div style="width:792px;height:612px;display:flex;overflow:hidden;font-family:'${d.headingFont}',sans-serif;background:#fff;">
      <div style="width:45%;height:100%;overflow:hidden;position:relative;">
        ${d.imageUrl ? `<img src="${d.imageUrl}" style="width:100%;height:100%;object-fit:cover;" />` : `<div style="width:100%;height:100%;background:${d.brandColors.primary};"></div>`}
      </div>
      <div style="width:55%;padding:36px 32px;display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            ${d.logoUrl ? `<img src="${d.logoUrl}" style="width:36px;height:36px;object-fit:contain;border-radius:8px;" />` : ''}
            <span style="font-size:16px;font-weight:800;color:${d.brandColors.secondary};">${d.businessName}</span>
          </div>
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${d.brandColors.accent};margin-bottom:16px;">${d.tagline}</div>
          <h1 style="font-size:28px;font-weight:900;line-height:1.05;color:${d.brandColors.secondary};margin:0 0 12px;text-transform:uppercase;letter-spacing:-0.5px;">${d.headline}</h1>
          ${d.offer ? `<div style="display:inline-block;background:${d.brandColors.accent};color:#fff;padding:14px 20px;border-radius:8px;margin-bottom:12px;"><div style="font-size:22px;font-weight:900;">${d.offer}</div>${d.offerDetails ? `<div style="font-size:10px;opacity:0.7;margin-top:2px;">${d.offerDetails}</div>` : ''}</div>` : ''}
          <ul style="list-style:none;padding:0;margin:12px 0 0;">
            ${d.bulletPoints.map(b => `<li style="font-size:13px;font-weight:500;color:#666;margin-bottom:8px;padding-left:16px;position:relative;font-family:'${d.bodyFont}',sans-serif;"><span style="position:absolute;left:0;color:${d.brandColors.accent};">&#9679;</span>${b}</li>`).join('')}
          </ul>
        </div>
        <div style="border-top:1px solid #eee;padding-top:12px;display:flex;justify-content:space-between;align-items:flex-end;">
          <div style="font-size:11px;color:#888;font-family:'${d.bodyFont}',sans-serif;line-height:1.6;">
            ${d.address ? `<div>${d.address}</div>` : ''}${d.phone ? `<div>${d.phone}</div>` : ''}${d.website ? `<div>${d.website}</div>` : ''}${d.hours ? `<div>${d.hours}</div>` : ''}
          </div>
          ${d.cta ? `<div style="background:${d.brandColors.primary};color:#fff;padding:10px 20px;border-radius:6px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;white-space:nowrap;">${d.cta}</div>` : ''}
        </div>
      </div>
    </div>`;
}

// 2. EVENT POSTER — Full image background with gradient overlay
function flyerEventPoster(d: FlyerData): string {
  return `
    <div style="width:792px;height:612px;position:relative;overflow:hidden;font-family:'${d.headingFont}',sans-serif;">
      ${d.imageUrl ? `<img src="${d.imageUrl}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" />` : `<div style="position:absolute;inset:0;background:linear-gradient(135deg,${d.brandColors.secondary},${d.brandColors.primary});"></div>`}
      <div style="position:absolute;inset:0;background:linear-gradient(transparent 20%,rgba(0,0,0,0.85) 60%);"></div>
      <div style="position:absolute;top:28px;left:36px;display:flex;align-items:center;gap:10px;z-index:1;">
        ${d.logoUrl ? `<img src="${d.logoUrl}" style="width:40px;height:40px;object-fit:contain;border-radius:8px;" />` : ''}
        <span style="color:rgba(255,255,255,0.9);font-size:16px;font-weight:700;">${d.businessName}</span>
      </div>
      <div style="position:absolute;bottom:0;left:0;right:0;padding:36px;z-index:1;">
        ${d.tagline ? `<div style="display:inline-block;background:${d.brandColors.accent};color:#fff;padding:8px 20px;border-radius:4px;font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;">${d.tagline}</div>` : ''}
        <h1 style="color:#fff;font-size:42px;font-weight:900;line-height:1.0;margin:0 0 12px;text-transform:uppercase;">${d.headline}</h1>
        ${d.offer ? `<div style="color:rgba(255,255,255,0.8);font-size:18px;font-weight:500;margin-bottom:20px;">${d.offer}${d.offerDetails ? ` — ${d.offerDetails}` : ''}</div>` : ''}
        <div style="display:flex;align-items:center;gap:24px;">
          ${d.cta ? `<div style="background:#fff;color:${d.brandColors.secondary};padding:14px 32px;border-radius:6px;font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">${d.cta}</div>` : ''}
          <div style="color:rgba(255,255,255,0.6);font-size:12px;font-family:'${d.bodyFont}',sans-serif;">
            ${d.address ? `${d.address} · ` : ''}${d.phone || ''}${d.website ? ` · ${d.website}` : ''}
          </div>
        </div>
      </div>
    </div>`;
}

// 3. CLEAN CORPORATE — White background, structured grid
function flyerCleanCorporate(d: FlyerData): string {
  return `
    <div style="width:792px;height:612px;position:relative;overflow:hidden;background:#fff;font-family:'${d.headingFont}',sans-serif;">
      <div style="height:8px;background:linear-gradient(90deg,${d.brandColors.primary},${d.brandColors.accent});"></div>
      <div style="padding:24px 36px;display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid ${d.brandColors.primary};">
        <div style="display:flex;align-items:center;gap:10px;">
          ${d.logoUrl ? `<img src="${d.logoUrl}" style="width:36px;height:36px;object-fit:contain;border-radius:6px;" />` : ''}
          <span style="font-size:18px;font-weight:800;color:${d.brandColors.secondary};">${d.businessName}</span>
        </div>
        <span style="font-size:11px;color:#999;font-weight:600;text-transform:uppercase;letter-spacing:2px;">${d.tagline}</span>
      </div>
      <div style="padding:24px 36px;">
        <h1 style="font-size:32px;font-weight:900;color:${d.brandColors.secondary};margin:0 0 16px;line-height:1.1;">${d.headline}</h1>
        <div style="display:flex;gap:24px;">
          <div style="flex:1;">
            <ul style="list-style:none;padding:0;margin:0;">
              ${d.bulletPoints.map(b => `<li style="font-size:14px;color:#444;margin-bottom:10px;padding-left:20px;position:relative;font-family:'${d.bodyFont}',sans-serif;line-height:1.5;"><span style="position:absolute;left:0;color:${d.brandColors.accent};font-weight:900;">&#10003;</span>${b}</li>`).join('')}
            </ul>
          </div>
          ${d.offer ? `<div style="width:200px;background:${d.brandColors.primary};border-radius:12px;padding:24px;text-align:center;color:#fff;display:flex;flex-direction:column;justify-content:center;"><div style="font-size:32px;font-weight:900;">${d.offer}</div>${d.offerDetails ? `<div style="font-size:12px;opacity:0.7;margin-top:4px;">${d.offerDetails}</div>` : ''}${d.cta ? `<div style="margin-top:16px;background:#fff;color:${d.brandColors.primary};padding:10px 20px;border-radius:6px;font-size:13px;font-weight:800;text-transform:uppercase;">${d.cta}</div>` : ''}</div>` : ''}
        </div>
      </div>
      <div style="position:absolute;bottom:0;left:0;right:0;background:${d.brandColors.secondary};padding:16px 36px;display:flex;justify-content:space-between;align-items:center;">
        <div style="color:rgba(255,255,255,0.8);font-size:12px;font-family:'${d.bodyFont}',sans-serif;">
          ${[d.address, d.phone, d.website].filter(Boolean).join(' · ')}
        </div>
        ${d.hours ? `<div style="color:rgba(255,255,255,0.6);font-size:11px;">${d.hours}</div>` : ''}
      </div>
    </div>`;
}

// 4. BOLD PROMO — Dark background, high-contrast
function flyerBoldPromo(d: FlyerData): string {
  return `
    <div style="width:792px;height:612px;position:relative;overflow:hidden;background:#0A0A0A;font-family:'${d.headingFont}',sans-serif;">
      ${d.imageUrl ? `<div style="position:absolute;inset:0;opacity:0.15;"><img src="${d.imageUrl}" style="width:100%;height:100%;object-fit:cover;" /></div>` : ''}
      <div style="position:relative;z-index:1;padding:36px 40px;height:100%;display:flex;flex-direction:column;justify-content:space-between;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div style="display:flex;align-items:center;gap:10px;">
            ${d.logoUrl ? `<img src="${d.logoUrl}" style="width:36px;height:36px;object-fit:contain;border-radius:8px;" />` : ''}
            <span style="color:#fff;font-size:16px;font-weight:700;">${d.businessName}</span>
          </div>
          ${d.tagline ? `<div style="background:${d.brandColors.accent};color:#fff;padding:6px 16px;border-radius:50px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">${d.tagline}</div>` : ''}
        </div>
        <div style="display:flex;gap:32px;align-items:flex-end;">
          <div style="flex:1;">
            <h1 style="color:#fff;font-size:36px;font-weight:900;line-height:1.0;margin:0 0 16px;text-transform:uppercase;">${d.headline}</h1>
            ${d.offer ? `<div style="display:inline-block;background:${d.brandColors.accent};color:#fff;padding:16px 20px;border-radius:8px;margin-bottom:16px;"><div style="font-size:24px;font-weight:900;">${d.offer}</div>${d.offerDetails ? `<div style="font-size:11px;opacity:0.7;">${d.offerDetails}</div>` : ''}</div>` : ''}
            <ul style="list-style:none;padding:0;margin:0;">
              ${d.bulletPoints.slice(0, 4).map(b => `<li style="color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:6px;padding-left:14px;position:relative;font-family:'${d.bodyFont}',sans-serif;"><span style="position:absolute;left:0;">&#8226;</span>${b}</li>`).join('')}
            </ul>
          </div>
          ${d.imageUrl ? `<div style="width:220px;height:280px;border-radius:12px;overflow:hidden;flex-shrink:0;"><img src="${d.imageUrl}" style="width:100%;height:100%;object-fit:cover;" /></div>` : ''}
        </div>
        <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:12px;display:flex;justify-content:space-between;align-items:center;">
          <div style="color:rgba(255,255,255,0.5);font-size:11px;font-family:'${d.bodyFont}',sans-serif;">
            ${[d.address, d.phone].filter(Boolean).join(' · ')}
          </div>
          <div style="color:${d.brandColors.accent};font-size:12px;font-weight:600;">${d.website}</div>
        </div>
      </div>
    </div>`;
}

// 5. LUXURY INVITATION — Centered, elegant, dark with frame
function flyerLuxuryInvitation(d: FlyerData): string {
  return `
    <div style="width:792px;height:612px;position:relative;overflow:hidden;background:${d.brandColors.secondary};font-family:'${d.headingFont}',sans-serif;">
      <div style="position:absolute;inset:20px;border:2px solid rgba(255,255,255,0.15);border-radius:4px;"></div>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:48px 80px;">
        <div style="color:${d.brandColors.accent};font-size:20px;margin-bottom:20px;">&#10022;</div>
        <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:4px;color:${d.brandColors.accent};margin-bottom:16px;">${d.tagline}</div>
        <h1 style="font-size:40px;font-weight:300;color:#fff;line-height:1.2;margin:0 0 16px;letter-spacing:2px;text-transform:uppercase;">${d.headline}</h1>
        <div style="width:60px;height:1px;background:${d.brandColors.accent};margin:0 auto 16px;"></div>
        ${d.offer ? `<div style="color:rgba(255,255,255,0.7);font-size:16px;margin-bottom:12px;font-family:'${d.bodyFont}',sans-serif;line-height:1.8;">${d.offer}${d.offerDetails ? ` — ${d.offerDetails}` : ''}</div>` : ''}
        ${d.bulletPoints.length > 0 ? `<div style="color:rgba(255,255,255,0.5);font-size:14px;font-weight:600;line-height:2.0;margin-bottom:20px;">${d.bulletPoints.join(' · ')}</div>` : ''}
        ${d.cta ? `<div style="font-size:13px;font-weight:500;text-transform:uppercase;letter-spacing:3px;color:${d.brandColors.accent};border-bottom:1px solid ${d.brandColors.accent};padding-bottom:2px;margin-bottom:24px;">${d.cta}</div>` : ''}
        ${d.logoUrl ? `<img src="${d.logoUrl}" style="width:48px;height:48px;object-fit:contain;border-radius:8px;margin-bottom:8px;" />` : ''}
        <div style="color:rgba(255,255,255,0.5);font-size:14px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">${d.businessName}</div>
        <div style="color:rgba(255,255,255,0.3);font-size:11px;margin-top:8px;font-family:'${d.bodyFont}',sans-serif;">
          ${[d.address, d.phone, d.website].filter(Boolean).join(' · ')}
        </div>
      </div>
    </div>`;
}

export const FLYER_TEMPLATES = [flyerSplitHero, flyerEventPoster, flyerCleanCorporate, flyerBoldPromo, flyerLuxuryInvitation];

// =================================================================
// BUSINESS CARD TEMPLATES (630x360 = 3.5" x 2")
// =================================================================

// 1. SPLIT BLOCK — Color left, white right
function cardSplitBlock(d: CardData): string {
  return `
    <div style="width:630px;height:360px;display:flex;overflow:hidden;font-family:'${d.headingFont}',sans-serif;">
      <div style="width:42%;background:${d.brandColors.secondary};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;">
        ${d.logoUrl ? `<img src="${d.logoUrl}" style="width:44px;height:44px;object-fit:contain;border-radius:10px;margin-bottom:12px;" />` : ''}
        <span style="color:#fff;font-size:18px;font-weight:900;text-align:center;">${d.businessName}</span>
        ${d.tagline ? `<span style="color:${d.brandColors.accent};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-top:6px;text-align:center;">${d.tagline}</span>` : ''}
        <div style="width:40px;height:3px;background:${d.brandColors.accent};margin-top:20px;border-radius:2px;"></div>
      </div>
      <div style="width:58%;background:#fff;padding:36px 32px;display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <div style="font-size:22px;font-weight:800;color:${d.brandColors.secondary};">${d.name}</div>
          <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${d.brandColors.primary};margin-top:2px;">${d.title}</div>
        </div>
        <div style="font-size:13px;color:#666;line-height:2.0;font-family:'${d.bodyFont}',sans-serif;">
          ${d.phone ? `<div>${d.phone}</div>` : ''}
          ${d.email ? `<div>${d.email}</div>` : ''}
          ${d.website ? `<div style="font-weight:600;color:${d.brandColors.primary};">${d.website}</div>` : ''}
        </div>
      </div>
    </div>`;
}

// 2. GRADIENT TOP BAR — Minimal white with color accent
function cardGradientBar(d: CardData): string {
  return `
    <div style="width:630px;height:360px;background:#fff;position:relative;overflow:hidden;font-family:'${d.headingFont}',sans-serif;">
      <div style="height:5px;background:linear-gradient(90deg,${d.brandColors.primary},${d.brandColors.accent});"></div>
      <div style="padding:36px 40px;height:calc(100% - 5px);display:flex;justify-content:space-between;">
        <div style="display:flex;flex-direction:column;justify-content:space-between;">
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
              ${d.logoUrl ? `<img src="${d.logoUrl}" style="width:36px;height:36px;object-fit:contain;border-radius:6px;" />` : ''}
              <span style="font-size:16px;font-weight:800;color:${d.brandColors.secondary};">${d.businessName}</span>
            </div>
            <div style="font-size:24px;font-weight:900;color:${d.brandColors.secondary};">${d.name}</div>
            <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${d.brandColors.primary};margin-top:2px;">${d.title}</div>
          </div>
          ${d.tagline ? `<div style="font-size:11px;color:#999;font-style:italic;">${d.tagline}</div>` : ''}
        </div>
        <div style="text-align:right;display:flex;flex-direction:column;justify-content:flex-end;font-size:13px;color:#666;line-height:2.0;font-family:'${d.bodyFont}',sans-serif;">
          ${d.phone ? `<div>${d.phone}</div>` : ''}
          ${d.email ? `<div>${d.email}</div>` : ''}
          ${d.website ? `<div style="font-weight:600;color:${d.brandColors.primary};">${d.website}</div>` : ''}
        </div>
      </div>
    </div>`;
}

// 3. DARK LUXURY — Full dark with accent
function cardDarkLuxury(d: CardData): string {
  return `
    <div style="width:630px;height:360px;background:#111;position:relative;overflow:hidden;font-family:'${d.headingFont}',sans-serif;">
      <div style="position:absolute;inset:12px;border:1px solid rgba(255,255,255,0.1);border-radius:2px;"></div>
      <div style="position:absolute;inset:0;padding:32px 36px;display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          ${d.logoUrl ? `<img src="${d.logoUrl}" style="width:40px;height:40px;object-fit:contain;border-radius:8px;margin-bottom:16px;" />` : ''}
          <div style="font-size:24px;font-weight:300;color:#fff;letter-spacing:1px;">${d.name}</div>
          <div style="font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:3px;color:${d.brandColors.accent};margin-top:4px;">${d.title}</div>
        </div>
        <div style="display:flex;align-items:center;gap:16px;font-size:12px;color:rgba(255,255,255,0.5);font-family:'${d.bodyFont}',sans-serif;">
          ${[d.phone, d.email, d.website].filter(Boolean).join(' <span style="opacity:0.3;">|</span> ')}
        </div>
      </div>
    </div>`;
}

// 4. PHOTO BACKGROUND — Image card with overlay
function cardPhotoBackground(d: CardData): string {
  return `
    <div style="width:630px;height:360px;position:relative;overflow:hidden;font-family:'${d.headingFont}',sans-serif;">
      ${d.imageUrl ? `<img src="${d.imageUrl}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" />` : `<div style="position:absolute;inset:0;background:linear-gradient(135deg,${d.brandColors.secondary},${d.brandColors.primary});"></div>`}
      <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(0,0,0,0.8) 0%,rgba(0,0,0,0.4) 100%);"></div>
      <div style="position:absolute;inset:0;padding:32px 36px;display:flex;flex-direction:column;justify-content:space-between;z-index:1;">
        <div style="display:flex;align-items:center;gap:10px;">
          ${d.logoUrl ? `<img src="${d.logoUrl}" style="width:40px;height:40px;object-fit:contain;border-radius:8px;" />` : ''}
          <span style="color:#fff;font-size:16px;font-weight:700;">${d.businessName}</span>
        </div>
        <div>
          <div style="font-size:22px;font-weight:800;color:#fff;">${d.name}</div>
          <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:${d.brandColors.accent};margin-top:2px;">${d.title}</div>
        </div>
        <div style="display:flex;justify-content:flex-end;font-size:12px;color:rgba(255,255,255,0.8);line-height:1.8;text-align:right;font-family:'${d.bodyFont}',sans-serif;">
          <div>${[d.phone, d.email, d.website].filter(Boolean).join('<br />')}</div>
        </div>
      </div>
    </div>`;
}

// 5. VERTICAL STACK — Ultra-minimal modern
function cardVerticalStack(d: CardData): string {
  return `
    <div style="width:630px;height:360px;background:#fff;position:relative;overflow:hidden;font-family:'${d.headingFont}',sans-serif;">
      <div style="padding:40px;height:100%;display:flex;flex-direction:column;justify-content:space-between;">
        ${d.logoUrl ? `<img src="${d.logoUrl}" style="width:32px;height:32px;object-fit:contain;border-radius:6px;" />` : '<div></div>'}
        <div>
          <div style="font-size:28px;font-weight:800;color:#111;letter-spacing:-0.5px;">${d.name}</div>
          <div style="font-size:13px;font-weight:500;color:#999;margin-top:4px;">${d.title}</div>
        </div>
        <div style="font-size:12px;color:#666;line-height:2.0;font-family:'${d.bodyFont}',sans-serif;">
          ${d.phone ? `<div>${d.phone}</div>` : ''}
          ${d.email ? `<div>${d.email}</div>` : ''}
          ${d.website ? `<div style="font-weight:600;color:${d.brandColors.primary};">${d.website}</div>` : ''}
        </div>
      </div>
    </div>`;
}

// 6. DIAGONAL ACCENT — Geometric shape with dynamic feel
function cardDiagonalAccent(d: CardData): string {
  return `
    <div style="width:630px;height:360px;background:#fff;position:relative;overflow:hidden;font-family:'${d.headingFont}',sans-serif;">
      <div style="position:absolute;inset:0;clip-path:polygon(0 0,35% 0,20% 100%,0 100%);background:${d.brandColors.primary};">
        <div style="padding:28px 24px;">
          ${d.logoUrl ? `<img src="${d.logoUrl}" style="width:36px;height:36px;object-fit:contain;border-radius:8px;" />` : ''}
        </div>
      </div>
      <div style="position:absolute;right:0;top:0;bottom:0;left:160px;padding:36px 32px;display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <div style="font-size:22px;font-weight:800;color:#111;">${d.name}</div>
          <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:${d.brandColors.primary};margin-top:2px;">${d.title}</div>
        </div>
        <div style="font-size:12px;color:#666;line-height:1.8;font-family:'${d.bodyFont}',sans-serif;">
          ${d.phone ? `<div style="padding-left:14px;position:relative;"><span style="position:absolute;left:0;color:${d.brandColors.accent};">&#9679;</span>${d.phone}</div>` : ''}
          ${d.email ? `<div style="padding-left:14px;position:relative;"><span style="position:absolute;left:0;color:${d.brandColors.accent};">&#9679;</span>${d.email}</div>` : ''}
          ${d.website ? `<div style="padding-left:14px;position:relative;"><span style="position:absolute;left:0;color:${d.brandColors.accent};">&#9679;</span>${d.website}</div>` : ''}
        </div>
      </div>
    </div>`;
}

export const CARD_TEMPLATES = [cardSplitBlock, cardGradientBar, cardDarkLuxury, cardPhotoBackground, cardVerticalStack, cardDiagonalAccent];
