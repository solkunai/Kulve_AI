import { BS, Eyebrow, StatusPill, monoFont } from '../lib/bs-design';

const groups = [
  {
    eyebrow: '01 — GROWTH',
    title: 'Find them. Talk to them.',
    desc: 'Lead-gen and outreach that learns your voice the moment you give it one.',
    items: [
      ['outreach', 'Outreach engine', 'Multi-channel cadences with deliverability, A/B harness, warm-up.', 'GA'],
      ['leads', 'Lead finder', 'Zip code → 200-2,000 qualified businesses with verified contacts.', 'GA'],
      ['enrich', 'Enrichment', 'Title, intent, tech stack, headcount, funding — every record.', 'GA'],
      ['voice', 'Voice agent', 'Inbound + outbound calling, intent routing, transcripts.', 'GA'],
    ],
  },
  {
    eyebrow: '02 — CONTENT',
    title: 'Ship the work, not the brief.',
    desc: 'Newsletters, posts, flyers, business cards, full landing pages — written and designed in your brand voice.',
    items: [
      ['studio', 'Content studio', 'Posts, newsletters, blog drafts, taglines.', 'GA'],
      ['social', 'Social planner', 'Per-channel posts + graphics, scheduled and tracked.', 'GA'],
      ['print', 'Print designer', 'Business cards, flyers, posters, menus — print-ready.', 'GA'],
      ['site', 'Site builder', 'One-page sites and landing pages on your domain.', 'Beta'],
    ],
  },
  {
    eyebrow: '03 — OPERATIONS',
    title: 'The boring parts, automated.',
    desc: 'Calls, schedules, money in, money out. Everything that used to live in 7 tabs.',
    items: [
      ['sched', 'Scheduling', 'Round-robin, reminders, reschedule rules.', 'GA'],
      ['ledger', 'Revenue ledger', 'Invoicing, subscriptions, dunning, exports.', 'GA'],
      ['inbox', 'Inbound desk', 'Calls, missed-call SMS, reviews, DMs — one queue.', 'GA'],
      ['payroll', 'Payroll', 'W-2 + contractor pay across 50 states.', 'Q4 26'],
    ],
  },
] as const;

export default function Features() {
  return (
    <div style={{ background: BS.paper, color: BS.text }}>
      {/* Page header */}
      <section className="px-6 md:px-14 pt-16 pb-7 max-w-[1440px] mx-auto">
        <Eyebrow>FEATURES — V1.0 · MAY 2026</Eyebrow>
        <h1
          className="text-4xl md:text-5xl lg:text-[64px] font-semibold mt-4 mb-4 leading-[1.02] max-w-5xl"
          style={{ letterSpacing: '-0.035em', color: BS.text }}
        >
          One platform. <span style={{ color: BS.accent }}>Twelve agents.</span> Every job your business actually has.
        </h1>
        <p className="text-base md:text-[17px] leading-relaxed max-w-2xl" style={{ color: BS.muted }}>
          Kulvé replaces the loose collection of tools small teams glue together. Each module works alone — together they share a brain, a brand kit, and a customer view.
        </p>
      </section>

      {/* Capability groups */}
      {groups.map((g) => (
        <section key={g.eyebrow} className="px-6 md:px-14 max-w-[1440px] mx-auto">
          <div
            className="grid lg:grid-cols-[320px_1fr] gap-10 lg:gap-14 pt-7"
            style={{ borderTop: `1px solid ${BS.border}` }}
          >
            <div className="pt-1">
              <Eyebrow>{g.eyebrow}</Eyebrow>
              <div className="text-2xl md:text-[26px] font-semibold mt-2.5 leading-tight" style={{ letterSpacing: '-0.02em' }}>
                {g.title}
              </div>
              <div className="text-sm leading-relaxed mt-2.5" style={{ color: BS.muted }}>
                {g.desc}
              </div>
            </div>
            <div>
              {g.items.map(([id, name, desc, status]) => (
                <div
                  key={id}
                  className="grid items-center gap-4 md:gap-6 py-3.5 text-sm"
                  style={{
                    gridTemplateColumns: 'minmax(80px, 120px) minmax(140px, 220px) 1fr 70px',
                    borderBottom: `1px solid ${BS.border}`,
                  }}
                >
                  <span style={{ fontFamily: monoFont, fontSize: 12, color: BS.accent }}>{id}</span>
                  <span className="font-semibold">{name}</span>
                  <span style={{ color: BS.muted }} className="hidden sm:block">{desc}</span>
                  <StatusPill s={status} />
                </div>
              ))}
            </div>
          </div>
          <div className="h-9" />
        </section>
      ))}

      {/* Roadmap CTA — ink panel */}
      <section className="px-6 md:px-14 pt-7 pb-16 max-w-[1440px] mx-auto">
        <div
          className="rounded-2xl p-8 md:p-9 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          style={{ background: BS.ink, color: 'white' }}
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
              NEXT — Q3 2026
            </div>
            <div className="text-xl md:text-2xl font-semibold mt-2" style={{ letterSpacing: '-0.015em' }}>
              Documents · Voice automations · Multi-brand workspaces
            </div>
            <div className="text-sm mt-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Six modules already in private beta. Founders see them first.
            </div>
          </div>
          <button
            className="px-5 py-3 rounded-lg text-sm font-bold whitespace-nowrap"
            style={{ background: BS.accentBright, color: BS.ink }}
          >
            See the roadmap →
          </button>
        </div>
      </section>
    </div>
  );
}
