import { useState } from 'react';
import { Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BS, Eyebrow, monoFont } from '../lib/bs-design';

const tiers: { n: string; p: string; psub?: string; sub: string; highlight?: boolean; features: string[] }[] = [
  {
    n: 'Basic',
    p: '$10',
    psub: '7-day free trial',
    sub: 'For founders kicking the tires.',
    features: [
      '1 brand kit',
      'AI strategist · 3 plans/mo',
      'Outreach · 200 sends/mo',
      'Voice agent · 60 minutes',
      'Lead finder · 1 zip / 250 leads',
      'Email support',
    ],
  },
  {
    n: 'Operator',
    p: '$89',
    sub: 'When growth becomes a real job.',
    highlight: true,
    features: [
      'Unlimited brand kits',
      'AI strategist · unlimited',
      'Outreach · 5,000 sends/mo',
      'Voice agent · 1,500 minutes',
      'Lead finder · 10 zips / 5K leads',
      'Scheduling + invoicing + site builder',
      'Live chat support',
    ],
  },
  {
    n: 'Scale',
    p: '$249',
    sub: 'Multi-brand teams and small agencies.',
    features: [
      '10 workspaces',
      'Custom AI training',
      'Outreach · 25,000 sends/mo',
      'Voice agent · 6,000 minutes',
      'Lead finder · unlimited',
      'Payroll + integrations API',
      'Dedicated CSM',
    ],
  },
];

const compareRows: [string, string, string, string][] = [
  ['Lead finder · zips / leads per month', '1 / 250', '10 / 5,000', 'Unlimited'],
  ['Outreach sends / month', '200', '5,000', '25,000'],
  ['Voice agent minutes', '60', '1,500', '6,000'],
  ['Workspaces', '1', '3', '10'],
  ['Custom AI training', '—', '—', '✓'],
  ['Founder pricing locked for life', '—', '✓', '✓'],
];

export default function Pricing({ onLogin: _onLogin }: { onLogin: () => void }) {
  const [billing, setBilling] = useState<'annual' | 'monthly'>('annual');
  const [email, setEmail] = useState('');
  const [waitlistState, setWaitlistState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const submitWaitlist = async (interested_plan?: string) => {
    if (!email.includes('@')) {
      setWaitlistState('error');
      return;
    }
    setWaitlistState('loading');
    const { error } = await supabase
      .from('waitlist')
      .insert({ email, source: 'pricing_page', interested_plan: interested_plan ?? null });
    if (error && !error.message.match(/duplicate|unique/i)) {
      setWaitlistState('error');
    } else {
      setWaitlistState('done');
    }
  };

  return (
    <div style={{ background: BS.paper, color: BS.text }}>
      {/* Hero */}
      <section className="px-6 md:px-14 pt-16 pb-7 max-w-[1440px] mx-auto text-center">
        <Eyebrow>PRICING — FOUNDER COHORT · 2,847 ON THE LIST</Eyebrow>
        <h1
          className="text-4xl md:text-5xl lg:text-[64px] font-semibold mt-5 mb-4 leading-[1.02] max-w-4xl mx-auto"
          style={{ letterSpacing: '-0.035em', color: BS.text }}
        >
          One bill. <span style={{ color: BS.accent }}>Every channel.</span> No seat fees, ever.
        </h1>
        <p className="text-base leading-relaxed max-w-xl mx-auto" style={{ color: BS.muted }}>
          Founder pricing locks for life. The rest of the world will pay 2-3× this when we leave beta.
        </p>

        {/* Billing toggle */}
        <div
          className="inline-flex mt-6 p-1 text-[12.5px] font-semibold rounded-lg"
          style={{ background: BS.soft }}
        >
          <button
            onClick={() => setBilling('annual')}
            className="px-3.5 py-1.5 rounded-md transition-colors"
            style={{
              background: billing === 'annual' ? BS.ink : 'transparent',
              color: billing === 'annual' ? 'white' : BS.muted,
            }}
          >
            Annual · save 20%
          </button>
          <button
            onClick={() => setBilling('monthly')}
            className="px-3.5 py-1.5 rounded-md transition-colors"
            style={{
              background: billing === 'monthly' ? BS.ink : 'transparent',
              color: billing === 'monthly' ? 'white' : BS.muted,
            }}
          >
            Monthly
          </button>
        </div>
      </section>

      {/* Email capture (single field, fed to all CTAs) */}
      <section className="px-6 md:px-14 pb-3 max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={waitlistState === 'done'}
            placeholder="work@company.com"
            className="flex-1 px-3.5 py-3 rounded-md text-sm outline-none focus:ring-2"
            style={{ border: `1px solid ${BS.border}`, background: 'white', color: BS.text }}
          />
          <button
            onClick={() => submitWaitlist()}
            disabled={waitlistState === 'loading' || waitlistState === 'done'}
            className="px-5 py-3 rounded-md text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 whitespace-nowrap"
            style={{ background: BS.accent, color: 'white' }}
          >
            {waitlistState === 'loading'
              ? 'Adding…'
              : waitlistState === 'done'
              ? "You're on the list ✓"
              : 'Join the waitlist'}
          </button>
        </div>
        {waitlistState === 'error' && (
          <div className="text-xs mt-2 text-center" style={{ color: '#A52327' }}>
            Please enter a valid email above.
          </div>
        )}
      </section>

      {/* Tier cards */}
      <section className="px-6 md:px-14 pt-8 pb-4 max-w-[1440px] mx-auto grid lg:grid-cols-3 gap-4 lg:gap-3.5">
        {tiers.map((t) => (
          <div
            key={t.n}
            className="p-7 rounded-2xl relative"
            style={{
              background: t.highlight ? BS.ink : BS.paper,
              color: t.highlight ? 'white' : BS.text,
              border: t.highlight ? 'none' : `1px solid ${BS.border}`,
              boxShadow: t.highlight ? '0 30px 80px -30px rgba(0,153,187,0.5)' : 'none',
            }}
          >
            {t.highlight && (
              <div
                className="absolute -top-2.5 left-6 px-2.5 py-1 rounded-sm text-[10.5px] font-bold tracking-wider"
                style={{ background: BS.accentBright, color: BS.ink, fontFamily: monoFont }}
              >
                MOST POPULAR
              </div>
            )}
            <div className="text-lg font-semibold">{t.n}</div>
            <div
              className="text-[13.5px] mt-1"
              style={{ color: t.highlight ? 'rgba(255,255,255,0.55)' : BS.muted }}
            >
              {t.sub}
            </div>
            <div className="mt-6 flex items-baseline gap-1.5">
              <span className="text-[56px] font-semibold leading-none" style={{ letterSpacing: '-0.025em' }}>
                {t.p}
              </span>
              <span
                className="text-sm"
                style={{ color: t.highlight ? 'rgba(255,255,255,0.5)' : BS.faint }}
              >
                / mo
              </span>
            </div>
            {t.psub && (
              <div
                className="mt-1.5 text-[12px] font-semibold"
                style={{
                  color: t.highlight ? BS.accentBright : BS.accentInk,
                  fontFamily: monoFont,
                  letterSpacing: '0.04em',
                }}
              >
                {t.psub.toUpperCase()}
              </div>
            )}
            <button
              onClick={() => submitWaitlist(t.n.toLowerCase())}
              disabled={waitlistState === 'done'}
              className="w-full mt-4 py-3 rounded-lg text-[13.5px] font-bold disabled:opacity-60"
              style={{
                background: t.highlight ? BS.accentBright : BS.ink,
                color: t.highlight ? BS.ink : 'white',
              }}
            >
              {t.n === 'Basic'
                ? 'Start free trial'
                : t.highlight
                ? 'Reserve at $89 · locked for life'
                : 'Join waitlist'}
            </button>
            <div className="mt-5 flex flex-col gap-2.5">
              {t.features.map((f) => (
                <div
                  key={f}
                  className="flex items-start gap-2.5 text-[13.5px]"
                  style={{ color: t.highlight ? 'rgba(255,255,255,0.88)' : BS.text }}
                >
                  <Check
                    className="w-3.5 h-3.5 mt-1 shrink-0"
                    strokeWidth={2.4}
                    style={{ color: t.highlight ? BS.accentBright : BS.accent }}
                  />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── Executive — contact-us tier ─────────────────────────────── */}
      <section className="px-6 md:px-14 pt-8 max-w-[1440px] mx-auto">
        <div
          className="rounded-2xl p-8 md:p-10 grid lg:grid-cols-[1fr_320px] gap-8 lg:gap-12 items-center"
          style={{
            background: BS.ink,
            color: 'white',
            boxShadow: '0 30px 80px -30px rgba(0,153,187,0.4)',
          }}
        >
          <div>
            <div
              className="text-[11px]"
              style={{
                color: BS.accentBright,
                fontFamily: monoFont,
                letterSpacing: '0.18em',
              }}
            >
              EXECUTIVE — BY APPLICATION ONLY
            </div>
            <div
              className="text-2xl md:text-[32px] font-semibold mt-3 leading-[1.05]"
              style={{ letterSpacing: '-0.025em' }}
            >
              You run the company. <span style={{ color: BS.accentBright }}>We run Kulvé for you.</span>
            </div>
            <div
              className="text-[13.5px] mt-3 max-w-2xl"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              For founders, agencies, and operators who want a hands-on partner. We build your custom site, train Kulvé on your data, and embed with your team week-over-week.
            </div>
            <div className="mt-5 grid sm:grid-cols-2 gap-x-8 gap-y-2.5">
              {[
                'Dedicated strategist + designer',
                'Custom website + brand build included',
                'Kulvé fine-tuned on your customers',
                'White-glove migration & onboarding',
                'Quarterly business reviews',
                'Priority Slack channel · same-day SLA',
              ].map((f) => (
                <div key={f} className="flex items-start gap-2.5 text-[13.5px]">
                  <Check
                    className="w-3.5 h-3.5 mt-1 shrink-0"
                    strokeWidth={2.4}
                    style={{ color: BS.accentBright }}
                  />
                  <span style={{ color: 'rgba(255,255,255,0.88)' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div
            className="p-6 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div
              className="text-[11px] mb-2"
              style={{ color: 'rgba(255,255,255,0.55)', fontFamily: monoFont, letterSpacing: '0.12em' }}
            >
              STARTING AT
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold" style={{ letterSpacing: '-0.025em' }}>
                $1,500
              </span>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                / mo
              </span>
            </div>
            <div className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Custom-priced after a 30-min discovery call.
            </div>
            <a
              href="mailto:hello@kulve.us?subject=Kulv%C3%A9%20Executive%20%E2%80%94%20Discovery%20call"
              className="block w-full text-center mt-5 py-3 rounded-lg text-[13.5px] font-bold transition-opacity hover:opacity-90"
              style={{ background: BS.accentBright, color: BS.ink }}
            >
              Book a discovery call →
            </a>
            <a
              href="mailto:hello@kulve.us"
              className="block w-full text-center mt-2 py-3 rounded-lg text-[13.5px] font-medium transition-colors"
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.85)',
              }}
            >
              Email hello@kulve.us
            </a>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="px-6 md:px-14 pt-10 pb-16 max-w-[1440px] mx-auto">
        <div
          className="text-xs font-bold uppercase mb-3.5"
          style={{ letterSpacing: '0.08em', color: BS.muted }}
        >
          Compare every line
        </div>
        <div style={{ borderTop: `1px solid ${BS.border}` }}>
          {compareRows.map((row, i) => (
            <div
              key={i}
              className="grid items-center gap-4 md:gap-6 py-3 text-[13.5px]"
              style={{
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                borderBottom: `1px solid ${BS.border}`,
              }}
            >
              <span style={{ color: BS.muted }}>{row[0]}</span>
              <span className="font-medium">{row[1]}</span>
              <span className="font-semibold" style={{ color: BS.accentInk }}>{row[2]}</span>
              <span className="font-medium">{row[3]}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
