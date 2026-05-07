import { Sparkles } from 'lucide-react';
import { BS, Eyebrow, monoFont } from '../lib/bs-design';

// ── Surface mocks (small product UI shown next to each step) ─────────────

const Surface1 = () => (
  <div
    className="rounded-xl p-5"
    style={{ background: BS.soft, border: `1px solid ${BS.border}` }}
  >
    <div
      className="text-[11px]"
      style={{ color: BS.faint, letterSpacing: '0.1em', fontFamily: monoFont }}
    >
      SETUP · 4 MIN
    </div>
    <div className="text-base font-semibold mt-1.5 mb-4">Tell Kulvé about your business</div>
    {([
      ['Company', 'Linden Furniture · Brooklyn, NY'],
      ['What you sell', 'Hand-built oak tables · ships nationwide'],
      ['Customers', 'Designers, new homeowners, ages 28-55'],
      ['This quarter', 'Go from 4 → 8 orders / week'],
    ] as const).map(([l, v]) => (
      <div key={l} className="mb-2.5">
        <div
          className="text-[11px] font-semibold uppercase"
          style={{ color: BS.faint, letterSpacing: '0.04em' }}
        >
          {l}
        </div>
        <div
          className="text-[13.5px] px-3 py-2 rounded-md mt-1"
          style={{ background: BS.paper, border: `1px solid ${BS.border}` }}
        >
          {v}
        </div>
      </div>
    ))}
    <div
      className="flex items-center gap-2 px-3 py-2.5 rounded-md mt-1 text-xs"
      style={{ background: BS.accentSoft, color: BS.accentInk }}
    >
      <Sparkles className="w-3.5 h-3.5" style={{ color: BS.accent }} />
      <span>
        <b>Reading linden.co</b> · pulled brand voice + 14 product photos
      </span>
    </div>
  </div>
);

const Surface2 = () => (
  <div
    className="rounded-xl p-5"
    style={{
      background: BS.paper,
      border: `1px solid ${BS.border}`,
      boxShadow: '0 20px 50px -30px rgba(15,23,41,0.18)',
    }}
  >
    <div className="flex items-baseline justify-between mb-3">
      <div className="text-base font-semibold">Plan — week of May 13</div>
      <span
        className="text-[11px] font-bold px-2 py-0.5 rounded-sm"
        style={{ background: BS.accentSoft, color: BS.accentInk, fontFamily: monoFont }}
      >
        DRAFT
      </span>
    </div>
    {([
      ['Outreach', '120 designers in NYC + Hudson Valley · 4-touch'],
      ['Newsletter', 'May digest — "How a table is built" · Thu 9am'],
      ['Social', '3 reels + 2 carousels · workshop B-roll'],
      ['Flyer', 'Spring open studio · postable + printable'],
      ['Reach out to', "8 past customers who haven't bought in 90+ days"],
    ] as const).map(([k, v], i) => (
      <div
        key={i}
        className="grid items-center gap-3 py-2.5 text-[13.5px]"
        style={{
          gridTemplateColumns: '110px 1fr 24px',
          borderTop: i ? `1px solid ${BS.borderSoft}` : 'none',
        }}
      >
        <span
          className="text-[11.5px] font-semibold"
          style={{ color: BS.accent, fontFamily: monoFont }}
        >
          {k.toLowerCase()}
        </span>
        <span style={{ color: BS.text }}>{v}</span>
        <span
          className="w-[18px] h-[18px] rounded-sm"
          style={{ border: `1.5px solid ${BS.border}` }}
        />
      </div>
    ))}
    <button
      className="w-full mt-3.5 py-2.5 rounded-md text-sm font-semibold"
      style={{ background: BS.ink, color: 'white' }}
    >
      Approve all · queue for the week
    </button>
  </div>
);

const Surface3 = () => {
  const tiles: { t: string; h: string; sub: string; bg: string; fg: string; border?: boolean }[] = [
    { t: 'NEWSLETTER', h: 'How a table is built', sub: 'Sent · 2,140 subs · 38% open', bg: BS.accent, fg: 'white' },
    { t: 'EMAIL · OUTREACH', h: 'Hi Sasha — saw the West Village renovation', sub: 'Wave 02 · 32 sent · 14 replies', bg: BS.paper, fg: BS.text, border: true },
    { t: 'SOCIAL · IG', h: 'Workshop reel · oak grain timelapse', sub: 'Scheduled · Wed 6pm', bg: BS.ink, fg: 'white' },
    { t: 'FLYER', h: 'Spring Open Studio · May 24', sub: 'Print-ready · 11×17', bg: BS.accentSoft, fg: BS.text },
  ];
  const eyebrowColor = (bg: string) =>
    bg === BS.accent ? 'rgba(255,255,255,0.85)' : bg === BS.ink ? BS.accentBright : bg === BS.paper ? BS.accent : BS.accentInk;
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {tiles.map((c) => (
        <div
          key={c.t + c.h}
          className="p-4 rounded-[10px] flex flex-col justify-between min-h-[130px]"
          style={{
            background: c.bg,
            color: c.fg,
            border: c.border ? `1px solid ${BS.border}` : 'none',
          }}
        >
          <div
            className="text-[10px] font-bold"
            style={{
              letterSpacing: '0.14em',
              color: eyebrowColor(c.bg),
              fontFamily: monoFont,
            }}
          >
            {c.t}
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">{c.h}</div>
            <div className="text-[11.5px] opacity-70 mt-1.5">{c.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Surface4 = () => (
  <div
    className="rounded-xl p-5"
    style={{ background: BS.paper, border: `1px solid ${BS.border}` }}
  >
    <div className="flex items-baseline justify-between mb-3.5">
      <div className="text-base font-semibold">This week vs. last</div>
      <span className="text-[11px]" style={{ color: BS.faint, fontFamily: monoFont }}>
        auto-attributed
      </span>
    </div>
    <div className="grid grid-cols-2 gap-3.5">
      {([
        ['Leads found', '184', '+38'],
        ['Reply rate', '24.6%', '+4.1pp'],
        ['Content shipped', '11', '+3'],
        ['Pipeline added', '$22.4K', '+$7.8K'],
      ] as const).map(([l, v, d]) => (
        <div
          key={l}
          className="p-3.5 rounded-lg"
          style={{ border: `1px solid ${BS.border}` }}
        >
          <div
            className="text-[11px] font-semibold uppercase"
            style={{ color: BS.faint, letterSpacing: '0.04em' }}
          >
            {l}
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <div className="text-2xl font-semibold" style={{ letterSpacing: '-0.02em' }}>
              {v}
            </div>
            <div className="text-xs font-semibold" style={{ color: BS.success }}>
              {d}
            </div>
          </div>
        </div>
      ))}
    </div>
    <div
      className="mt-3.5 px-3 py-2.5 rounded-md text-xs flex items-center gap-2"
      style={{ background: BS.soft, color: BS.muted }}
    >
      <Sparkles className="w-3.5 h-3.5" style={{ color: BS.accent }} />
      <span>
        <b style={{ color: BS.text }}>Kulvé:</b> reply rate jumped — Tuesday cohort is your strongest. Doubling Q3 budget there.
      </span>
    </div>
  </div>
);

// ── The 4 steps ──────────────────────────────────────────────────────────

const steps = [
  {
    n: 1,
    eyebrow: 'STEP — INTAKE',
    title: 'Tell us what your business does.',
    body: "Four questions. We read your website, your social, your reviews. By the time you finish, Kulvé already knows your brand voice, your customer, and your goal.",
    Surface: Surface1,
  },
  {
    n: 2,
    eyebrow: 'STEP — STRATEGY',
    title: 'Sunday night, a plan lands in your inbox.',
    body: 'Outreach lists, content calendar, social posts, retention plays — drafted, prioritized, and waiting for one click of approval.',
    Surface: Surface2,
  },
  {
    n: 3,
    eyebrow: 'STEP — EXECUTION',
    title: 'By Wednesday, the work is shipped.',
    body: 'Newsletters sent. Outreach running. Social posted. Flyers printed. Site updated. You see every send before it goes out — or trust Kulvé and turn approvals off.',
    Surface: Surface3,
  },
  {
    n: 4,
    eyebrow: 'STEP — LEARNING',
    title: "Friday — what worked, what didn't, what's next.",
    body: "Every send, call, and post auto-attributed. Kulvé rewrites next week's plan from what your customers actually responded to.",
    Surface: Surface4,
  },
];

export default function HowItWorks() {
  return (
    <div style={{ background: BS.paper, color: BS.text }}>
      {/* Page header */}
      <section className="px-6 md:px-14 pt-16 pb-7 max-w-[1440px] mx-auto">
        <Eyebrow>HOW IT WORKS — END-TO-END</Eyebrow>
        <h1
          className="text-4xl md:text-5xl lg:text-[64px] font-semibold mt-4 mb-4 leading-[1.02] max-w-5xl"
          style={{ letterSpacing: '-0.035em', color: BS.text }}
        >
          Four steps, one weekend, and your business <span style={{ color: BS.accent }}>runs itself.</span>
        </h1>
        <p className="text-base md:text-[17px] leading-relaxed max-w-2xl" style={{ color: BS.muted }}>
          Kulvé onboards in minutes, plans your week on Sunday night, ships the work by Wednesday, and shows you what worked on Friday — every week, on autopilot.
        </p>
      </section>

      {/* Steps */}
      {steps.map((s) => (
        <section
          key={s.n}
          className="px-6 md:px-14 py-12 max-w-[1440px] mx-auto"
          style={{ borderTop: `1px solid ${BS.border}` }}
        >
          <div className="grid lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-14 items-center">
            <div>
              <div className="flex items-center gap-3.5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{ background: BS.ink, color: BS.accentBright, fontFamily: monoFont }}
                >
                  0{s.n}
                </div>
                <Eyebrow>{s.eyebrow}</Eyebrow>
              </div>
              <h2
                className="text-3xl md:text-[44px] font-semibold mt-4 mb-3 leading-[1.05]"
                style={{ letterSpacing: '-0.025em', color: BS.text }}
              >
                {s.title}
              </h2>
              <p className="text-base leading-relaxed" style={{ color: BS.muted }}>
                {s.body}
              </p>
            </div>
            <s.Surface />
          </div>
        </section>
      ))}

      <div className="h-12" />
    </div>
  );
}
