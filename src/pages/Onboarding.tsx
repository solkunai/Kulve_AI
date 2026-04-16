import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Upload, Palette, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { generateOutreachEmail } from '../lib/outreach';
import { subscribeToPlan, purchaseBrandKit } from '../lib/stripe';

// --- Step Components ---

const PLANS = [
  {
    id: 'starter' as const,
    name: 'Starter',
    price: '$250',
    features: ['AI-generated marketing plan', '5 branded social graphics', '500 outreach emails/mo', 'Basic analytics', 'Email support'],
  },
  {
    id: 'growth' as const,
    name: 'Growth',
    price: '$500',
    popular: true,
    features: ['Everything in Starter', '12 branded graphics/mo', '2 flyer designs', 'Business card design', '2,000 outreach emails/mo', 'LinkedIn outreach', 'Newsletter templates', 'Priority support'],
  },
  {
    id: 'scale' as const,
    name: 'Scale',
    price: '$1,500',
    features: ['Everything in Growth', '30 graphics (daily content)', 'Auto-scheduled posting', 'Website creation', 'Pitch deck', 'Brand kit creation', '5,000+ outreach', 'Dedicated account manager'],
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

const StepIndicator = ({ currentStep, steps }: { currentStep: number, steps: string[] }) => (
  <div className="flex items-center justify-center gap-3 mb-12">
    {steps.map((label, i) => (
      <div key={i} className="flex items-center gap-2">
        {i > 0 && <div className="w-8 h-px bg-gray-300"></div>}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          i < currentStep ? 'bg-green-500 text-white' :
          i === currentStep ? 'bg-brand-blue text-white' :
          'bg-gray-200 text-gray-500'
        }`}>
          {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
        </div>
        <span className={`text-sm font-medium hidden sm:block ${
          i === currentStep ? 'text-brand-navy' : 'text-gray-400'
        }`}>{label}</span>
      </div>
    ))}
  </div>
);

const KulveLogo = () => (
  <a href="/" className="flex items-center justify-center gap-2 mb-6">
    <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
      <span className="font-bold text-xl text-white">K</span>
    </div>
    <span className="text-2xl font-bold tracking-tight text-brand-navy">Kulvé</span>
  </a>
);

// --- Main Onboarding ---

type Plan = 'starter' | 'growth' | 'scale' | null;

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
  primary_color: '#3b6dca',
  secondary_color: '#1a1f36',
  accent_color: '#10b981',
  heading_font: 'Inter',
  body_font: 'Inter',
  social_instagram: '',
  social_facebook: '',
  social_linkedin: '',
  social_x: '',
  social_tiktok: '',
};

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Steps: 0=Plan, 1=BrandKit Question, 2=BrandKit Form, 3=Saving
  const [step, setStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<Plan>('growth');
  const [hasBrandKit, setHasBrandKit] = useState<boolean | null>(null);
  const [entryMethod, setEntryMethod] = useState<'upload' | 'manual' | null>(null);
  const [brandKit, setBrandKit] = useState<BrandKitData>(emptyBrandKit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [extracting, setExtracting] = useState(false);

  const updateBrandKit = (field: string, value: string) =>
    setBrandKit((prev) => ({ ...prev, [field]: value }));

  // Extract colors from uploaded image
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtracting(true);

    // Create canvas to extract dominant colors
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      // Simple color extraction: sample pixels and find dominant colors
      const colorMap: Record<string, number> = {};
      for (let i = 0; i < imageData.length; i += 16) { // sample every 4th pixel
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        // Quantize to reduce unique colors
        const qr = Math.round(r / 32) * 32;
        const qg = Math.round(g / 32) * 32;
        const qb = Math.round(b / 32) * 32;
        // Skip near-white and near-black
        const brightness = (qr + qg + qb) / 3;
        if (brightness < 30 || brightness > 225) continue;
        const key = `${qr},${qg},${qb}`;
        colorMap[key] = (colorMap[key] || 0) + 1;
      }

      const sorted = Object.entries(colorMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      if (sorted.length >= 1) {
        const toHex = (rgb: string) => {
          const [r, g, b] = rgb.split(',').map(Number);
          return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
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

    // Generate outreach email and save brand kit
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

    // Save selected plan preference (payments not live yet)
    if (selectedPlan) {
      await supabase.from('profiles').update({ plan: selectedPlan }).eq('id', user.id);
    }
    navigate('/dashboard');
  };

  const stepLabels = ['Plan', 'Brand Kit', 'Details', 'Dashboard'];

  return (
    <div className="min-h-screen bg-gray-50 pt-12 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <KulveLogo />
        <StepIndicator currentStep={step} steps={stepLabels} />

        {/* Step 0: Choose Plan */}
        {step === 0 && (
          <div>
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-brand-navy">Choose your plan</h1>
              <p className="mt-2 text-gray-600">All plans include a 14-day free trial. You can change anytime.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative text-left p-6 rounded-2xl border-2 transition-all ${
                    selectedPlan === plan.id
                      ? 'border-brand-blue bg-white shadow-lg'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-blue text-white px-3 py-0.5 rounded-full text-xs font-bold">
                      Most Popular
                    </div>
                  )}
                  {selectedPlan === plan.id && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-brand-blue rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-brand-navy">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-brand-navy">{plan.price}</span>
                    <span className="text-gray-500 text-sm">/month</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center gap-3">
              <Button size="lg" onClick={() => setStep(1)} className="gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
              <button
                onClick={() => { setSelectedPlan(null); setStep(1); }}
                className="text-sm text-gray-500 hover:text-brand-blue transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Do you have a brand kit? */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-brand-navy">Do you have a brand kit?</h1>
              <p className="mt-2 text-gray-600">A brand kit includes your logo, colors, fonts, and brand guidelines.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Yes, I have one */}
              <button
                onClick={() => setHasBrandKit(true)}
                className={`text-left p-8 rounded-2xl border-2 transition-all ${
                  hasBrandKit === true ? 'border-brand-blue bg-white shadow-lg' : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                  <Check className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-brand-navy">Yes, I have one</h3>
                <p className="mt-2 text-gray-600 text-sm">Upload your brand assets or enter your brand colors, fonts, and details manually.</p>
              </button>

              {/* No, I need one */}
              <button
                onClick={() => setHasBrandKit(false)}
                className={`text-left p-8 rounded-2xl border-2 transition-all ${
                  hasBrandKit === false ? 'border-brand-blue bg-white shadow-lg' : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className="w-14 h-14 bg-brand-blue/5 rounded-xl flex items-center justify-center mb-4">
                  <Palette className="w-7 h-7 text-brand-blue" />
                </div>
                <h3 className="text-xl font-bold text-brand-navy">No, I need one</h3>
                <p className="mt-2 text-gray-600 text-sm">We'll create a professional brand kit for you based on your business info.</p>
              </button>
            </div>

            {/* Sub-options for "Yes" */}
            {hasBrandKit === true && (
              <div className="mt-8 space-y-4">
                <p className="text-sm font-medium text-gray-700 text-center">How would you like to add it?</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-all ${
                      entryMethod === 'upload' ? 'border-brand-blue bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <Upload className="w-6 h-6 text-brand-blue shrink-0" />
                    <div className="text-left">
                      <p className="font-semibold text-brand-navy">Upload brand assets</p>
                      <p className="text-xs text-gray-500">Upload logo/images and we'll extract your colors</p>
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
                    className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-all ${
                      entryMethod === 'manual' ? 'border-brand-blue bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <Palette className="w-6 h-6 text-brand-blue shrink-0" />
                    <div className="text-left">
                      <p className="font-semibold text-brand-navy">Enter manually</p>
                      <p className="text-xs text-gray-500">Input your color codes, fonts, and details</p>
                    </div>
                  </button>
                </div>

                {extracting && (
                  <div className="text-center py-4">
                    <div className="w-8 h-8 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Extracting colors from your image...</p>
                  </div>
                )}

                {entryMethod && !extracting && (
                  <div className="flex justify-center pt-4">
                    <p className="text-sm text-green-600 font-medium">
                      {entryMethod === 'upload' ? 'Colors extracted! ' : ''}Ready to continue.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Sub-options for "No" */}
            {hasBrandKit === false && (
              <div className="mt-8 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-6 rounded-xl border-2 border-gray-100 bg-white">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-brand-navy">$75</p>
                      <p className="text-sm text-gray-500 mt-1">one-time</p>
                    </div>
                    <h3 className="font-bold text-brand-navy mt-4">Standalone Brand Kit</h3>
                    <p className="text-sm text-gray-600 mt-2">Professional brand kit designed by AI — logo concepts, color palette, typography, and brand guidelines.</p>
                    <Button variant="outline" className="w-full mt-4" onClick={() => {
                      purchaseBrandKit().catch(() => setStep(2));
                    }}>
                      Buy Brand Kit — $75
                    </Button>
                  </div>
                  <div className="p-6 rounded-xl border-2 border-brand-blue bg-blue-50/50">
                    <div className="text-center">
                      <p className="text-sm font-bold text-brand-blue">INCLUDED</p>
                      <p className="text-sm text-gray-500 mt-1">with Scale plan</p>
                    </div>
                    <h3 className="font-bold text-brand-navy mt-4">Brand Kit + Full Service</h3>
                    <p className="text-sm text-gray-600 mt-2">Brand kit creation is included in the Scale plan ($1,500/mo) along with 30 graphics, website, pitch deck, and dedicated account manager.</p>
                    <Button className="w-full mt-4" onClick={() => { setSelectedPlan('scale'); setStep(2); }}>
                      Choose Scale Plan
                    </Button>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-500">
                  Or <button onClick={() => setStep(2)} className="text-brand-blue font-semibold hover:underline">skip and enter basic info</button> — you can always add a brand kit later.
                </p>
              </div>
            )}

            <div className="mt-10 flex items-center justify-center gap-4">
              <Button variant="outline" onClick={() => setStep(0)} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              {((hasBrandKit === true && entryMethod) || hasBrandKit === false) && (
                <Button size="lg" onClick={() => setStep(2)} className="gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Brand Kit Details Form */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-brand-navy">Tell us about your business</h1>
              <p className="mt-2 text-gray-600">This is how Kulve generates all your marketing materials.</p>
            </div>

            <div className="space-y-8">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
              )}

              {/* Business Info */}
              <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
                <h2 className="text-lg font-bold text-brand-navy">Business Info</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name *</label>
                  <input type="text" value={brandKit.business_name} onChange={(e) => updateBrandKit('business_name', e.target.value)} required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none" placeholder="Joe's Bakery" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry *</label>
                  <select value={brandKit.industry} onChange={(e) => updateBrandKit('industry', e.target.value)} required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none bg-white">
                    <option value="">Select industry...</option>
                    {INDUSTRY_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Description *</label>
                  <textarea value={brandKit.description} onChange={(e) => updateBrandKit('description', e.target.value)} required rows={3} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none resize-none" placeholder="We're a family-owned bakery specializing in artisan sourdough and custom cakes..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Customer *</label>
                  <textarea value={brandKit.target_customer} onChange={(e) => updateBrandKit('target_customer', e.target.value)} required rows={2} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none resize-none" placeholder="Health-conscious families in the Austin area, ages 25-45..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tone of Voice</label>
                  <select value={brandKit.tone_of_voice} onChange={(e) => updateBrandKit('tone_of_voice', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none bg-white">
                    {['Professional', 'Friendly', 'Bold', 'Playful', 'Luxury', 'Casual'].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </section>

              {/* Brand Colors */}
              <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
                <h2 className="text-lg font-bold text-brand-navy">Brand Colors</h2>
                {entryMethod === 'upload' && (
                  <p className="text-sm text-green-600">Colors were auto-extracted from your upload. Adjust if needed.</p>
                )}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Primary', field: 'primary_color' },
                    { label: 'Secondary', field: 'secondary_color' },
                    { label: 'Accent', field: 'accent_color' },
                  ].map(({ label, field }) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                      <div className="flex items-center gap-3">
                        <input type="color" value={brandKit[field as keyof BrandKitData]} onChange={(e) => updateBrandKit(field, e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                        <input type="text" value={brandKit[field as keyof BrandKitData]} onChange={(e) => updateBrandKit(field, e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Fonts */}
              <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
                <h2 className="text-lg font-bold text-brand-navy">Fonts</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Heading Font</label>
                    <select
                      value={FONT_OPTIONS.includes(brandKit.heading_font) ? brandKit.heading_font : 'Custom (enter below)'}
                      onChange={(e) => {
                        if (e.target.value !== 'Custom (enter below)') updateBrandKit('heading_font', e.target.value);
                        else updateBrandKit('heading_font', '');
                      }}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none bg-white"
                    >
                      {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                    {!FONT_OPTIONS.slice(0, -1).includes(brandKit.heading_font) && (
                      <input
                        type="text"
                        value={brandKit.heading_font}
                        onChange={(e) => updateBrandKit('heading_font', e.target.value)}
                        placeholder="Enter font name (e.g. Avenir, Futura)"
                        className="w-full mt-2 px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Body Font</label>
                    <select
                      value={FONT_OPTIONS.includes(brandKit.body_font) ? brandKit.body_font : 'Custom (enter below)'}
                      onChange={(e) => {
                        if (e.target.value !== 'Custom (enter below)') updateBrandKit('body_font', e.target.value);
                        else updateBrandKit('body_font', '');
                      }}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none bg-white"
                    >
                      {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                    {!FONT_OPTIONS.slice(0, -1).includes(brandKit.body_font) && (
                      <input
                        type="text"
                        value={brandKit.body_font}
                        onChange={(e) => updateBrandKit('body_font', e.target.value)}
                        placeholder="Enter font name (e.g. Avenir, Futura)"
                        className="w-full mt-2 px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none"
                      />
                    )}
                  </div>
                </div>
              </section>

              {/* Social Links (optional) */}
              <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
                <h2 className="text-lg font-bold text-brand-navy">Social Links <span className="text-sm font-normal text-gray-400">(optional)</span></h2>
                {[
                  { label: 'Instagram', field: 'social_instagram', placeholder: 'https://instagram.com/yourbusiness' },
                  { label: 'Facebook', field: 'social_facebook', placeholder: 'https://facebook.com/yourbusiness' },
                  { label: 'LinkedIn', field: 'social_linkedin', placeholder: 'https://linkedin.com/company/yourbusiness' },
                  { label: 'X (Twitter)', field: 'social_x', placeholder: 'https://x.com/yourbusiness' },
                  { label: 'TikTok', field: 'social_tiktok', placeholder: 'https://tiktok.com/@yourbusiness' },
                ].map(({ label, field, placeholder }) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                    <input type="url" value={brandKit[field as keyof BrandKitData]} onChange={(e) => updateBrandKit(field, e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none" placeholder={placeholder} />
                  </div>
                ))}
              </section>

              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button size="lg" onClick={handleSave} disabled={saving} className="gap-2">
                  {saving ? 'Setting up your account...' : 'Launch My Dashboard'}
                  {!saving && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
