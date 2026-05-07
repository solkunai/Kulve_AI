import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ── Bold Statement palette (Kulvè cyan, v2 design tokens) ────────────────
const C = {
  ink: '#0A0E1A',
  text: '#0F1729',
  muted: '#525C6E',
  faint: '#8B95A8',
  paper: '#FFFFFF',
  soft: '#F6F7F9',
  border: '#E4E7EC',
  borderSoft: '#EFF1F4',
  accent: '#0099BB',
  accentInk: '#006B85',
  accentBright: '#00E5FF',
  accentSoft: '#E0F7FB',
  success: '#0F8B5C',
};

// ── Laptop frame containing the pipeline dashboard ───────────────────────
const PipelineLaptop = () => {
  const kpis: [string, string, string][] = [
    ['Leads found', '1,284', '+18%'],
    ['Reply rate', '24.6%', '+3.1pp'],
    ['Content shipped', '46', 'this wk'],
    ['Pipeline', '$1.24M', '+8.2%'],
  ];
  const campaigns: [string, string, string, string, 'Running' | 'Sent' | 'Done'][] = [
    ['Outreach', 'Q2 fintech CTOs', '482', '24.6%', 'Running'],
    ['Newsletter', 'May digest · 12k readers', '—', '38.1%', 'Sent'],
    ['Social', 'Founder thread series', '6 posts', '14.2k', 'Running'],
    ['Flyers', 'Spring promo · in-store', '300', 'printed', 'Done'],
  ];

  return (
    <div className="relative self-start">
      <div
        className="rounded-t-[14px] rounded-b-[4px] p-3.5 pb-0"
        style={{
          background: 'linear-gradient(180deg, #2A2F3D 0%, #1A1E2A 100%)',
          boxShadow: '0 30px 60px -20px rgba(10,14,26,0.35), 0 12px 28px -12px rgba(10,14,26,0.25)',
        }}
      >
        <div className="flex justify-center mb-2">
          <span
            className="w-[5px] h-[5px] rounded-full"
            style={{ background: '#0A0E1A', boxShadow: 'inset 0 0 0 1px #404655' }}
          />
        </div>
        <div className="rounded-[4px] p-2.5 text-xs" style={{ background: C.soft, border: `1px solid ${C.ink}` }}>
          {/* Browser chrome */}
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FEBC2E' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
            </div>
            <div
              className="flex-1 mx-3.5 px-2.5 py-1 text-center rounded-[4px]"
              style={{
                background: 'white',
                border: `1px solid ${C.border}`,
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 11,
                color: C.muted,
              }}
            >
              <span style={{ color: C.success }}>●</span> app.kulve.io / pipeline
            </div>
            <span style={{ color: C.faint, fontSize: 11 }}>maya@</span>
          </div>
          {/* App content */}
          <div className="rounded-[4px] p-4" style={{ background: 'white', border: `1px solid ${C.borderSoft}` }}>
            <div className="grid grid-cols-4 gap-2.5 mb-3.5">
              {kpis.map(([label, value, delta]) => (
                <div key={label} className="rounded-md px-3 py-2.5" style={{ border: `1px solid ${C.borderSoft}` }}>
                  <div className="text-[11px] font-medium" style={{ color: C.faint }}>{label}</div>
                  <div className="mt-0.5 text-lg font-semibold" style={{ letterSpacing: '-0.01em' }}>{value}</div>
                  <div className="text-[11px] font-semibold" style={{ color: C.success }}>↑ {delta}</div>
                </div>
              ))}
            </div>
            <div className="pt-3" style={{ borderTop: `1px solid ${C.borderSoft}` }}>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-[13px]">Active campaigns</span>
                <span className="font-medium text-xs" style={{ color: C.accent }}>View all →</span>
              </div>
              {campaigns.map(([type, name, prospects, reply, status]) => (
                <div
                  key={name}
                  className="grid items-center gap-2 py-2 text-xs"
                  style={{
                    gridTemplateColumns: '90px 1fr 80px 70px 70px',
                    borderBottom: `1px solid ${C.borderSoft}`,
                  }}
                >
                  <span
                    className="text-center text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-sm"
                    style={{ background: C.accentSoft, color: C.accentInk }}
                  >
                    {type.toUpperCase()}
                  </span>
                  <span className="font-medium">{name}</span>
                  <span className="text-right" style={{ color: C.muted }}>{prospects}</span>
                  <span className="text-right font-semibold" style={{ color: C.success }}>{reply}</span>
                  <span
                    className="text-center text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-sm"
                    style={{
                      background: status === 'Running' ? '#E2F4EC' : '#F1F2F5',
                      color: status === 'Running' ? C.success : C.muted,
                    }}
                  >
                    {status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="h-3.5" />
      </div>
      {/* Hinge */}
      <div
        className="h-3 -mx-[22px] rounded-b-[14px] relative"
        style={{ background: 'linear-gradient(180deg, #1A1E2A 0%, #2A2F3D 40%, #3A4050 100%)' }}
      >
        <div
          className="absolute left-1/2 top-0 -translate-x-1/2 w-20 h-1 rounded-b-md"
          style={{ background: '#0A0E1A' }}
        />
      </div>
      {/* Shadow */}
      <div
        className="h-4 mx-10 mt-1"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(10,14,26,0.18) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
    </div>
  );
};

// ── Marquee data ─────────────────────────────────────────────────────────
const COMPANIES = [
  'Linden', 'FOXBRIGHT', 'tessellate', 'Northwave', 'Junction', 'Helix', 'Cobalt',
  'Marlow & Co.', 'Atrium', 'Greycroft', 'BLOOMRY', 'Pebble', 'Vantage', 'Outfield',
];

const WORK_TILES: [string, string, string][] = [
  ['NEWSLETTER', 'May digest — Linden', '#0099BB'],
  ['SOCIAL', 'Founder thread · 14.2k', '#0A0E1A'],
  ['FLYER', 'Spring promo · Pebble', '#E0F7FB'],
  ['EMAIL', 'Q2 fintech outreach', '#0099BB'],
  ['LANDING', 'Vantage · product page', '#0A0E1A'],
  ['BRAND KIT', 'Atrium identity', '#E0F7FB'],
  ['NEWSLETTER', 'Cobalt weekly', '#0099BB'],
  ['POST', 'Junction · case study', '#0A0E1A'],
  ['FLYER', 'BLOOMRY · grand open', '#E0F7FB'],
  ['EMAIL', 'Outfield re-engagement', '#0099BB'],
];

export default function Home({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [waitlistState, setWaitlistState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const submitWaitlist = async () => {
    if (!email.includes('@')) {
      setWaitlistState('error');
      return;
    }
    setWaitlistState('loading');
    const { error } = await supabase
      .from('waitlist')
      .insert({ email, source: 'landing_page' });
    if (error && !error.message.match(/duplicate|unique/i)) {
      setWaitlistState('error');
    } else {
      setWaitlistState('done');
    }
  };

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="px-6 md:px-14 pt-12 md:pt-16 pb-8 grid lg:grid-cols-2 gap-10 lg:gap-14 items-start max-w-[1440px] mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: C.accentSoft, color: C.accentInk }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.accent }} />
            Now in private beta · v1.0
          </div>
          <h1
            className="mt-5 mb-4 text-4xl md:text-5xl lg:text-[68px] font-semibold leading-[1.02]"
            style={{ letterSpacing: '-0.028em', color: C.text }}
          >
            Turn your business <span style={{ color: C.accent }}>into a brand.</span>
          </h1>
          <p className="text-base md:text-lg leading-relaxed max-w-xl mb-7" style={{ color: C.muted }}>
            Kulvé finds your next customers, writes the outreach, ships the content, and designs the brand around it.
            One platform that does the work of a growth team — for founders, marketers, and operators who already wear ten hats.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 mb-4 max-w-xl">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitWaitlist()}
              placeholder="work@company.com"
              disabled={waitlistState === 'done'}
              className="flex-1 px-3.5 py-3 rounded-md text-sm outline-none focus:ring-2"
              style={{ border: `1px solid ${C.border}`, background: 'white', color: C.text }}
            />
            <button
              onClick={submitWaitlist}
              disabled={waitlistState === 'loading' || waitlistState === 'done'}
              className="px-5 py-3 rounded-md text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 whitespace-nowrap"
              style={{ background: C.accent, color: 'white' }}
            >
              {waitlistState === 'loading'
                ? 'Adding…'
                : waitlistState === 'done'
                ? "You're on the list ✓"
                : 'Join the waitlist'}
            </button>
            <button
              onClick={onLogin}
              className="px-5 py-3 rounded-md text-sm font-medium transition-colors hover:bg-gray-50 inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
              style={{ background: 'white', border: `1px solid ${C.border}`, color: C.text }}
            >
              Talk to Kulvé <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {waitlistState === 'error' && (
            <div className="text-xs mb-3" style={{ color: '#A52327' }}>Please enter a valid email.</div>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]" style={{ color: C.faint }}>
            <span>Built for founders + marketers</span>
            <span className="hidden sm:inline">·</span>
            <span>2,847 on the waitlist</span>
            <span className="hidden sm:inline">·</span>
            <span>Founder pricing, locked</span>
          </div>
        </motion.div>

        {/* Laptop */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="hidden md:block"
        >
          <PipelineLaptop />
        </motion.div>
      </section>

      {/* ── Marquee — companies + work shipped ─────────────────────── */}
      <section className="pt-16 pb-7 mt-16 overflow-hidden" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="px-6 md:px-14 pb-5 flex justify-between items-baseline max-w-[1440px] mx-auto">
          <div
            className="text-xs font-semibold uppercase"
            style={{ color: C.faint, letterSpacing: '0.08em' }}
          >
            Companies running on Kulvé · work shipped this month
          </div>
          <a className="text-[13px] font-medium hidden sm:block" style={{ color: C.accent }}>
            See the gallery →
          </a>
        </div>

        <div className="kv-marquee-mask relative">
          {/* Row 1 — company logos drifting LEFT */}
          <div
            className="kv-marquee-l flex gap-[18px] pb-3.5"
            style={{ width: 'max-content' }}
          >
            {[0, 1].flatMap((dup) =>
              COMPANIES.map((b, i) => (
                <div
                  key={`${dup}-${i}`}
                  className="flex-none h-14 px-7 flex items-center justify-center rounded-lg text-lg font-semibold"
                  style={{
                    border: `1px solid ${C.border}`,
                    background: C.paper,
                    minWidth: 160,
                    letterSpacing: '-0.015em',
                    color: C.muted,
                  }}
                >
                  {b}
                </div>
              ))
            )}
          </div>

          {/* Row 2 — work tiles drifting RIGHT */}
          <div
            className="kv-marquee-r flex gap-3.5"
            style={{ width: 'max-content' }}
          >
            {[0, 1].flatMap((dup) =>
              WORK_TILES.map(([type, name, bg], i) => {
                const onDark = bg === '#0A0E1A' || bg === '#0099BB';
                return (
                  <div
                    key={`${dup}-w-${i}`}
                    className="flex-none w-[220px] h-[130px] rounded-[10px] p-3.5 flex flex-col justify-between"
                    style={{
                      background: bg,
                      border: `1px solid ${C.border}`,
                      color: onDark ? '#FFFFFF' : C.text,
                    }}
                  >
                    <span
                      className="text-[10px] font-bold"
                      style={{
                        letterSpacing: '0.12em',
                        color: onDark ? C.accentBright : C.accent,
                      }}
                    >
                      {type}
                    </span>
                    <div>
                      <div className="text-sm font-semibold leading-tight">{name}</div>
                      <div className="text-[11px] mt-1 opacity-70">made on Kulvé</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ── Capabilities — 3 columns, outcome-led ───────────────────── */}
      <section className="px-6 md:px-14 pt-10 pb-20 grid md:grid-cols-3 gap-8 max-w-[1440px] mx-auto w-full">
        {(
          [
            ['Find your customers', 'Source qualified leads from your ICP, then run the outreach across email and LinkedIn — copy that learns from every reply.', 'Lead gen · Outreach · CRM'],
            ['Ship your content', 'Newsletters, social posts, flyers, landing pages, brand kits. Written and designed in your voice, on your schedule.', 'Newsletter · Social · Print · Web'],
            ['Run the operations', 'Inbound voice agent, scheduling, invoicing and ledger — the day-to-day machinery, on rails.', 'Voice · Scheduling · Billing'],
          ] as const
        ).map(([name, desc, tech]) => (
          <div key={name} className="py-5" style={{ borderTop: `2px solid ${C.ink}` }}>
            <div className="text-[17px] font-semibold mb-2">{name}</div>
            <div className="text-sm leading-relaxed mb-3.5" style={{ color: C.muted }}>{desc}</div>
            <div
              className="text-[11px]"
              style={{
                color: C.faint,
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                letterSpacing: '0.04em',
              }}
            >
              {tech}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
