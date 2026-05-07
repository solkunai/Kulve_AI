import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Upload, Palette, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { generateOutreachEmail } from '../lib/outreach';
import { purchaseBrandKit } from '../lib/stripe';
import { BS, Eyebrow, monoFont } from '../lib/bs-design';
import { KulveLogo } from '../components/KulveLogo';

// ── Plans (matches the new pricing tiers) ────────────────────────────────
const PLANS = [
  {
    id: 'basic' as const,
    name: 'Basic',
    price: '$10',
    priceSub: '7-day free trial',
    features: ['1 brand kit', 'AI strategist · 3 plans/mo', '200 outreach sends/mo', '60 voice minutes', 'Email support'],
  },
  {
    id: 'operator' as const,
    name: 'Operator',
    price: '$89',
    popular: true,
    features: ['Unlimited brand kits', 'AI strategist · unlimited', '5,000 outreach/mo', '1,500 voice min', 'Site builder + scheduling + invoicing', 'Live chat support'],
  },
  {
    id: 'scale' as const,
    name: 'Scale',
    price: '$249',
    features: ['10 workspaces', 'Custom AI training', '25,000 outreach/mo', '6,000 voice min', 'Payroll + integrations API', 'Dedicated CSM'],
  },
];

const FONT_OPTIONS = [
  'Inter', 'Poppins', 'Playfair Display', 'Montserrat', 'Roboto', 'Lato', 'Open Sans', 'Raleway',
  'Merriweather', 'Oswald', 'Nunito', 'Bebas Neue', 'DM Sans', 'Space Grotesk', 'Outfit',
  'Archivo', 'Cabin', 'Cormorant Garamond', 'Crimson Text', 'Dancing Script', 'Fira Sans',
  'Josefin Sans', 'Karla', 'Libre Baskerville', 'Manrope', 'Mulish', 'Noto Sans', 'PT Sans',
  'Quicksand', 'Source Sans 3', 'Work Sans', 'Rubik', 'Sora', 'Urbanist', 'Barlow',
  'Custom (enter below)',
];
const INDUSTRY_OPTIONS = ['Restaurant', 'Bakery', 'Salon', 'Gym', 'Law Firm', 'Real Estate', 'Dentist', 'Auto Shop', 'Retail', 'Other'];

// ── Top progress bar (3 steps total) ─────────────────────────────────────
const TOTAL = 3;
const ProgressBar = ({ current, label }: { current: number; label: string }) => (
  <div className="mb-9">
    <div className="flex items-center gap-1.5 mb-3">
      {Array.from({ length: TOTAL }).map((_, i) => (
        <div
          key={i}
          className="flex-1 h-1.5 rounded-full transition-all"
          style={{
            background: i < current ? BS.ink : i === current ? BS.accent : BS.border,
          }}
        />
      ))}
    </div>
    <div
      className="text-[11px]"
      style={{ color: BS.faint, fontFamily: monoFont, letterSpacing: '0.1em' }}
    >
      STEP {String(current + 1).padStart(2, '0')} OF 0{TOTAL} · {label.toUpperCase()}
    </div>
  </div>
);

// ── Card wrapper for the form sections ───────────────────────────────────
const Section = ({ title, children, optional }: { title: string; children: React.ReactNode; optional?: boolean }) => (
  <section
    className="rounded-2xl p-6 space-y-5"
    style={{ background: BS.paper, border: `1px solid ${BS.border}` }}
  >
    <h2 className="text-base font-semibold flex items-baseline gap-2" style={{ letterSpacing: '-0.01em' }}>
      <span>{title}</span>
      {optional && (
        <span className="text-xs font-normal" style={{ color: BS.faint }}>
          (optional)
        </span>
      )}
    </h2>
    {children}
  </section>
);

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-semibold mb-1.5">
      {label}
      {required && <span style={{ color: BS.accent }}> *</span>}
    </label>
    {children}
  </div>
);

const inputStyle = {
  border: `1px solid ${BS.border}`,
  background: 'white',
  color: BS.text,
};

// ── Types ────────────────────────────────────────────────────────────────
type Plan = 'basic' | 'operator' | 'scale' | null;

interface BrandKitData {
  business_name: string;
  industry: string;
  description: string;
  target_customer: string;
  tone_of_voice: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  heading_font: string;
  body_font: string;
  social_instagram: string;
  social_facebook: string;
  social_linkedin: string;
  social_x: string;
  social_tiktok: string;
}

const emptyBrandKit: BrandKitData = {
  business_name: '',
  industry: '',
  description: '',
  target_customer: '',
  tone_of_voice: 'Professional',
  primary_color: '#0099BB',
  secondary_color: '#0A0E1A',
  accent_color: '#00E5FF',
  heading_font: 'Inter',
  body_font: 'Inter',
  social_instagram: '',
  social_facebook: '',
  social_linkedin: '',
  social_x: '',
  social_tiktok: '',
};

// ── Main ────────────────────────────────────────────────────────────────
export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<Plan>('operator');
  const [hasBrandKit, setHasBrandKit] = useState<boolean | null>(null);
  const [entryMethod, setEntryMethod] = useState<'upload' | 'manual' | null>(null);
  const [brandKit, setBrandKit] = useState<BrandKitData>(emptyBrandKit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [extracting, setExtracting] = useState(false);

  const updateBrandKit = (field: string, value: string) =>
    setBrandKit((prev) => ({ ...prev, [field]: value }));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtracting(true);

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setExtracting(false);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const colorMap: Record<string, number> = {};
      for (let i = 0; i < imageData.length; i += 16) {
        const r = imageData[i], g = imageData[i + 1], b = imageData[i + 2];
        const qr = Math.round(r / 32) * 32;
        const qg = Math.round(g / 32) * 32;
        const qb = Math.round(b / 32) * 32;
        const brightness = (qr + qg + qb) / 3;
        if (brightness < 30 || brightness > 225) continue;
        const key = `${qr},${qg},${qb}`;
        colorMap[key] = (colorMap[key] || 0) + 1;
      }
      const sorted = Object.entries(colorMap).sort((a, b) => b[1] - a[1]).slice(0, 3);
      if (sorted.length >= 1) {
        const toHex = (rgb: string) => {
          const [r, g, b] = rgb.split(',').map(Number);
          return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
        };
        updateBrandKit('primary_color', toHex(sorted[0][0]));
        if (sorted[1]) updateBrandKit('secondary_color', toHex(sorted[1][0]));
        if (sorted[2]) updateBrandKit('accent_color', toHex(sorted[2][0]));
      }
      URL.revokeObjectURL(url);
      setExtracting(false);
      setEntryMethod('upload');
    };
    img.src = url;
  };

  const handleSave = async () => {
    if (!user) return;
    if (!brandKit.business_name || !brandKit.industry || !brandKit.description || !brandKit.target_customer) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setSaving(true);

    const outreachEmail = await generateOutreachEmail(brandKit.business_name);

    const { error: dbError } = await supabase.from('brand_kits').insert({
      ...brandKit,
      user_id: user.id,
      outreach_email: outreachEmail,
    });

    if (dbError) {
      setError(dbError.message);
      setSaving(false);
      return;
    }

    if (selectedPlan) {
      await supabase.from('profiles').update({ plan: selectedPlan }).eq('id', user.id);
    }
    navigate('/dashboard');
  };

  const stepLabels = ['Plan', 'Brand kit', 'Business details'];

  return (
    <div className="min-h-screen px-4 pt-10 pb-16" style={{ background: BS.softer, color: BS.text }}>
      {/* Top header */}
      <div className="max-w-[720px] mx-auto mb-8">
        <Link to="/">
          <KulveLogo />
        </Link>
      </div>

      <div className="max-w-[720px] mx-auto">
        <ProgressBar current={step} label={stepLabels[step]} />

        {/* ── Step 0: Pick plan ─────────────────────────────── */}
        {step === 0 && (
          <div>
            <Eyebrow>WELCOME TO KULVÉ</Eyebrow>
            <h1
              className="text-3xl md:text-4xl font-semibold mt-3 mb-3"
              style={{ letterSpacing: '-0.025em' }}
            >
              Pick the plan that fits where you're at.
            </h1>
            <p className="text-sm mb-8" style={{ color: BS.muted }}>
              Start free for 7 days. Upgrade only when Kulvé has earned it.
            </p>

            <div className="grid md:grid-cols-3 gap-3.5">
              {PLANS.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className="relative text-left p-5 rounded-2xl transition-all"
                    style={{
                      background: isSelected && plan.popular ? BS.ink : 'white',
                      color: isSelected && plan.popular ? 'white' : BS.text,
                      border: isSelected
                        ? `2px solid ${BS.accent}`
                        : `1px solid ${BS.border}`,
                      boxShadow: isSelected ? '0 12px 32px -16px rgba(0,153,187,0.3)' : 'none',
                    }}
                  >
                    {plan.popular && (
                      <div
                        className="absolute -top-2 left-4 px-2 py-0.5 rounded-sm text-[10px] font-bold tracking-wider"
                        style={{ background: BS.accentBright, color: BS.ink, fontFamily: monoFont }}
                      >
                        MOST POPULAR
                      </div>
                    )}
                    {isSelected && (
                      <div
                        className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: BS.accent }}
                      >
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                    <div className="text-base font-semibold">{plan.name}</div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-semibold" style={{ letterSpacing: '-0.02em' }}>
                        {plan.price}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: isSelected && plan.popular ? 'rgba(255,255,255,0.5)' : BS.faint }}
                      >
                        / mo
                      </span>
                    </div>
                    {plan.priceSub && (
                      <div
                        className="text-[10px] mt-1 font-bold"
                        style={{
                          color: isSelected && plan.popular ? BS.accentBright : BS.accentInk,
                          fontFamily: monoFont,
                          letterSpacing: '0.06em',
                        }}
                      >
                        {plan.priceSub.toUpperCase()}
                      </div>
                    )}
                    <ul className="mt-4 space-y-2">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-1.5 text-xs"
                          style={{
                            color: isSelected && plan.popular ? 'rgba(255,255,255,0.85)' : BS.muted,
                          }}
                        >
                          <Check
                            className="w-3 h-3 mt-0.5 shrink-0"
                            strokeWidth={2.4}
                            style={{ color: isSelected && plan.popular ? BS.accentBright : BS.accent }}
                          />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => { setSelectedPlan(null); setStep(1); }}
                className="text-sm font-medium hover:underline"
                style={{ color: BS.muted }}
              >
                Skip — choose later
              </button>
              <button
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-lg text-sm font-semibold inline-flex items-center gap-2 transition-opacity hover:opacity-90"
                style={{ background: BS.ink, color: 'white' }}
              >
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 1: Brand kit choice ──────────────────────── */}
        {step === 1 && (
          <div>
            <Eyebrow>BRAND</Eyebrow>
            <h1
              className="text-3xl md:text-4xl font-semibold mt-3 mb-3"
              style={{ letterSpacing: '-0.025em' }}
            >
              Do you already have a brand kit?
            </h1>
            <p className="text-sm mb-7" style={{ color: BS.muted }}>
              A brand kit includes your logo, colors, fonts, and tone of voice. It's how Kulvé makes everything look like *you*.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setHasBrandKit(true)}
                className="text-left p-7 rounded-2xl transition-all"
                style={{
                  background: 'white',
                  border:
                    hasBrandKit === true
                      ? `2px solid ${BS.accent}`
                      : `1px solid ${BS.border}`,
                  boxShadow: hasBrandKit === true ? '0 12px 32px -16px rgba(0,153,187,0.3)' : 'none',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: BS.successSoft }}
                >
                  <Check className="w-6 h-6" style={{ color: BS.success }} strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold" style={{ letterSpacing: '-0.01em' }}>
                  Yes, I have one
                </h3>
                <p className="mt-1.5 text-sm" style={{ color: BS.muted }}>
                  Upload your assets or enter colors + fonts manually.
                </p>
              </button>

              <button
                onClick={() => setHasBrandKit(false)}
                className="text-left p-7 rounded-2xl transition-all"
                style={{
                  background: 'white',
                  border:
                    hasBrandKit === false
                      ? `2px solid ${BS.accent}`
                      : `1px solid ${BS.border}`,
                  boxShadow: hasBrandKit === false ? '0 12px 32px -16px rgba(0,153,187,0.3)' : 'none',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: BS.accentSoft }}
                >
                  <Palette className="w-6 h-6" style={{ color: BS.accent }} strokeWidth={1.8} />
                </div>
                <h3 className="text-lg font-semibold" style={{ letterSpacing: '-0.01em' }}>
                  No, I need one
                </h3>
                <p className="mt-1.5 text-sm" style={{ color: BS.muted }}>
                  We'll design a kit for you — logo, palette, typography.
                </p>
              </button>
            </div>

            {/* Sub-options */}
            {hasBrandKit === true && (
              <div className="mt-7 space-y-4">
                <div
                  className="text-xs font-bold uppercase text-center"
                  style={{ color: BS.muted, letterSpacing: '0.08em' }}
                >
                  How do you want to add it?
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-3 p-4 rounded-xl text-left"
                    style={{
                      background: 'white',
                      border:
                        entryMethod === 'upload'
                          ? `2px solid ${BS.accent}`
                          : `1px solid ${BS.border}`,
                    }}
                  >
                    <Upload className="w-5 h-5 shrink-0" style={{ color: BS.accent }} />
                    <div>
                      <div className="font-semibold text-sm">Upload brand assets</div>
                      <div className="text-xs mt-0.5" style={{ color: BS.faint }}>
                        We'll auto-extract your colors
                      </div>
                    </div>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <button
                    onClick={() => setEntryMethod('manual')}
                    className="flex items-center gap-3 p-4 rounded-xl text-left"
                    style={{
                      background: 'white',
                      border:
                        entryMethod === 'manual'
                          ? `2px solid ${BS.accent}`
                          : `1px solid ${BS.border}`,
                    }}
                  >
                    <Palette className="w-5 h-5 shrink-0" style={{ color: BS.accent }} />
                    <div>
                      <div className="font-semibold text-sm">Enter manually</div>
                      <div className="text-xs mt-0.5" style={{ color: BS.faint }}>
                        Pick colors + fonts yourself
                      </div>
                    </div>
                  </button>
                </div>

                {extracting && (
                  <div className="text-center py-3 text-sm" style={{ color: BS.muted }}>
                    <div
                      className="w-6 h-6 border-2 rounded-full animate-spin mx-auto mb-2"
                      style={{ borderColor: BS.border, borderTopColor: BS.accent }}
                    />
                    Extracting colors from your image…
                  </div>
                )}
                {entryMethod && !extracting && (
                  <div
                    className="text-center text-xs font-semibold"
                    style={{ color: BS.success }}
                  >
                    {entryMethod === 'upload' ? 'Colors extracted ✓ ' : ''}Ready to continue.
                  </div>
                )}
              </div>
            )}

            {hasBrandKit === false && (
              <div className="mt-7 grid md:grid-cols-2 gap-3">
                <div
                  className="p-5 rounded-xl"
                  style={{ background: 'white', border: `1px solid ${BS.border}` }}
                >
                  <div className="text-center">
                    <div className="text-2xl font-semibold" style={{ letterSpacing: '-0.02em' }}>
                      $75
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: BS.faint }}>
                      one-time
                    </div>
                  </div>
                  <div className="font-semibold text-sm mt-3">Standalone Brand Kit</div>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: BS.muted }}>
                    AI-designed: logo concepts, palette, typography, and brand guidelines.
                  </p>
                  <button
                    onClick={() => purchaseBrandKit().catch(() => setStep(2))}
                    className="w-full mt-3 py-2 rounded-md text-xs font-semibold"
                    style={{ border: `1px solid ${BS.border}`, color: BS.text }}
                  >
                    Buy Brand Kit — $75
                  </button>
                </div>
                <div
                  className="p-5 rounded-xl"
                  style={{ background: BS.ink, color: 'white' }}
                >
                  <div className="text-center">
                    <div
                      className="text-xs font-bold tracking-wider"
                      style={{ color: BS.accentBright, fontFamily: monoFont }}
                    >
                      INCLUDED
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      with Scale plan
                    </div>
                  </div>
                  <div className="font-semibold text-sm mt-3">Brand Kit + Full Service</div>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Brand kit creation included with Scale ($249/mo) plus everything else.
                  </p>
                  <button
                    onClick={() => { setSelectedPlan('scale'); setStep(2); }}
                    className="w-full mt-3 py-2 rounded-md text-xs font-bold"
                    style={{ background: BS.accentBright, color: BS.ink }}
                  >
                    Choose Scale plan
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setStep(0)}
                className="px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-1.5"
                style={{ color: BS.muted }}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              {((hasBrandKit === true && entryMethod) || hasBrandKit === false) && (
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-3 rounded-lg text-sm font-semibold inline-flex items-center gap-2 transition-opacity hover:opacity-90"
                  style={{ background: BS.ink, color: 'white' }}
                >
                  Continue <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Step 2: Business details form ─────────────────── */}
        {step === 2 && (
          <div>
            <Eyebrow>BUSINESS DETAILS</Eyebrow>
            <h1
              className="text-3xl md:text-4xl font-semibold mt-3 mb-3"
              style={{ letterSpacing: '-0.025em' }}
            >
              Tell Kulvé about your business.
            </h1>
            <p className="text-sm mb-7" style={{ color: BS.muted }}>
              This is how Kulvé generates everything — content, outreach, graphics, sites — in your voice.
            </p>

            <div className="space-y-5">
              {error && (
                <div
                  className="p-3 rounded-lg text-sm"
                  style={{ background: '#FCE7E8', border: '1px solid #F4B0B3', color: '#A52327' }}
                >
                  {error}
                </div>
              )}

              <Section title="The basics">
                <Field label="Business name" required>
                  <input
                    type="text"
                    value={brandKit.business_name}
                    onChange={(e) => updateBrandKit('business_name', e.target.value)}
                    required
                    placeholder="Linden Furniture"
                    className="w-full px-3.5 py-3 rounded-lg text-sm outline-none focus:ring-2"
                    style={inputStyle}
                  />
                </Field>
                <Field label="Industry" required>
                  <select
                    value={brandKit.industry}
                    onChange={(e) => updateBrandKit('industry', e.target.value)}
                    required
                    className="w-full px-3.5 py-3 rounded-lg text-sm outline-none focus:ring-2"
                    style={inputStyle}
                  >
                    <option value="">Select industry…</option>
                    {INDUSTRY_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </Field>
                <Field label="Business description" required>
                  <textarea
                    value={brandKit.description}
                    onChange={(e) => updateBrandKit('description', e.target.value)}
                    required
                    rows={3}
                    placeholder="Hand-built oak tables shipped nationwide…"
                    className="w-full px-3.5 py-3 rounded-lg text-sm outline-none focus:ring-2 resize-none"
                    style={inputStyle}
                  />
                </Field>
                <Field label="Target customer" required>
                  <textarea
                    value={brandKit.target_customer}
                    onChange={(e) => updateBrandKit('target_customer', e.target.value)}
                    required
                    rows={2}
                    placeholder="Designers, new homeowners, ages 28-55…"
                    className="w-full px-3.5 py-3 rounded-lg text-sm outline-none focus:ring-2 resize-none"
                    style={inputStyle}
                  />
                </Field>
                <Field label="Tone of voice">
                  <select
                    value={brandKit.tone_of_voice}
                    onChange={(e) => updateBrandKit('tone_of_voice', e.target.value)}
                    className="w-full px-3.5 py-3 rounded-lg text-sm outline-none focus:ring-2"
                    style={inputStyle}
                  >
                    {['Professional', 'Friendly', 'Bold', 'Playful', 'Luxury', 'Casual'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </Field>
              </Section>

              <Section title="Brand colors">
                {entryMethod === 'upload' && (
                  <div
                    className="text-xs font-semibold p-2.5 rounded-md"
                    style={{ background: BS.successSoft, color: BS.success }}
                  >
                    Colors auto-extracted from your upload. Adjust if needed.
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Primary', field: 'primary_color' },
                    { label: 'Secondary', field: 'secondary_color' },
                    { label: 'Accent', field: 'accent_color' },
                  ].map(({ label, field }) => (
                    <Field key={field} label={label}>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={brandKit[field as keyof BrandKitData]}
                          onChange={(e) => updateBrandKit(field, e.target.value)}
                          className="w-10 h-10 rounded-md cursor-pointer"
                          style={{ border: `1px solid ${BS.border}` }}
                        />
                        <input
                          type="text"
                          value={brandKit[field as keyof BrandKitData]}
                          onChange={(e) => updateBrandKit(field, e.target.value)}
                          className="flex-1 px-2.5 py-2 rounded-md text-xs"
                          style={{ ...inputStyle, fontFamily: monoFont }}
                        />
                      </div>
                    </Field>
                  ))}
                </div>
              </Section>

              <Section title="Fonts">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(['heading_font', 'body_font'] as const).map((field) => (
                    <Field
                      key={field}
                      label={field === 'heading_font' ? 'Heading font' : 'Body font'}
                    >
                      <select
                        value={
                          FONT_OPTIONS.includes(brandKit[field])
                            ? brandKit[field]
                            : 'Custom (enter below)'
                        }
                        onChange={(e) => {
                          if (e.target.value !== 'Custom (enter below)') updateBrandKit(field, e.target.value);
                          else updateBrandKit(field, '');
                        }}
                        className="w-full px-3.5 py-3 rounded-lg text-sm outline-none focus:ring-2"
                        style={inputStyle}
                      >
                        {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                      {!FONT_OPTIONS.slice(0, -1).includes(brandKit[field]) && (
                        <input
                          type="text"
                          value={brandKit[field]}
                          onChange={(e) => updateBrandKit(field, e.target.value)}
                          placeholder="Custom font name"
                          className="w-full mt-2 px-3.5 py-3 rounded-lg text-sm outline-none focus:ring-2"
                          style={inputStyle}
                        />
                      )}
                    </Field>
                  ))}
                </div>
              </Section>

              <Section title="Social links" optional>
                {[
                  { label: 'Instagram', field: 'social_instagram', placeholder: 'https://instagram.com/yourbusiness' },
                  { label: 'Facebook', field: 'social_facebook', placeholder: 'https://facebook.com/yourbusiness' },
                  { label: 'LinkedIn', field: 'social_linkedin', placeholder: 'https://linkedin.com/company/yourbusiness' },
                  { label: 'X (Twitter)', field: 'social_x', placeholder: 'https://x.com/yourbusiness' },
                  { label: 'TikTok', field: 'social_tiktok', placeholder: 'https://tiktok.com/@yourbusiness' },
                ].map(({ label, field, placeholder }) => (
                  <Field key={field} label={label}>
                    <input
                      type="url"
                      value={brandKit[field as keyof BrandKitData]}
                      onChange={(e) => updateBrandKit(field, e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-3.5 py-3 rounded-lg text-sm outline-none focus:ring-2"
                      style={inputStyle}
                    />
                  </Field>
                ))}
              </Section>

              <div className="flex items-center justify-between pt-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-1.5"
                  style={{ color: BS.muted }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-3 rounded-lg text-sm font-semibold inline-flex items-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ background: BS.ink, color: 'white' }}
                >
                  {saving ? 'Setting up your account…' : 'Launch dashboard'}
                  {!saving && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
