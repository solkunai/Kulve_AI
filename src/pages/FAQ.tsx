import { useState } from 'react';
import { Sparkles, Settings, Wallet, Flag, Phone, Users } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { BS, Eyebrow, monoFont } from '../lib/bs-design';

const cats = [
  { Icon: Sparkles, n: 'AI · how it works', q: 5 },
  { Icon: Settings, n: 'Integrations', q: 8 },
  { Icon: Wallet, n: 'Billing', q: 6 },
  { Icon: Flag, n: 'Security & data', q: 7 },
  { Icon: Phone, n: 'Voice agent', q: 9 },
  { Icon: Users, n: 'Workspaces & teams', q: 4 },
];

const sections: { t: string; items: [string, string][] }[] = [
  {
    t: 'GETTING STARTED',
    items: [
      ['How long does setup take?', 'About 4 minutes. Four questions, Kulvé reads your website, and your first plan is in your inbox by Sunday night.'],
      ['Do I need technical skills?', 'No. If you can fill out a contact form, you can run Kulvé.'],
      ['Can I import existing customers?', 'Yes — CSV, Stripe, HubSpot, Salesforce, Mailchimp, or just paste a list.'],
    ],
  },
  {
    t: 'AI & APPROVALS',
    items: [
      ['How does Kulvé actually run my outreach?', 'You give it a goal and an audience. It drafts, A/B tests, and sends — pausing for your approval whenever it would change the underlying strategy.'],
      ['Will the voice agent sound like a robot?', 'No. Sub-300ms latency with a trained operator voice. Callers think they reached a sharp receptionist who already knows them.'],
      ['Can I edit what it writes?', 'Every send. Or turn approvals off and trust it.'],
    ],
  },
  {
    t: 'BILLING & DATA',
    items: [
      ['Where does my data live?', 'EU and US options. Your raw data is never used to train shared models. SOC2 and GDPR by Q3 2026.'],
      ['Can I pause anytime?', 'Yes. Your data, contacts, sequences, and content all export to CSV/JSON in one click. No "talk to sales" required.'],
      ['Is founder pricing actually locked for life?', "Yes. As long as your card stays on file and you don't cancel, $89/mo is your price forever — even when we list at $249."],
    ],
  },
];

const FAQRow = ({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="py-4" style={{ borderBottom: `1px solid ${BS.borderSoft}` }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-start gap-3 text-left"
      >
        <div className="text-base font-semibold" style={{ letterSpacing: '-0.01em', color: BS.text }}>{q}</div>
        <span
          className="text-lg leading-none transition-transform"
          style={{ color: BS.faint, transform: open ? 'rotate(45deg)' : 'rotate(0)' }}
        >
          +
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="text-sm mt-2 leading-relaxed max-w-3xl" style={{ color: BS.muted }}>
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQ() {
  const [search, setSearch] = useState('');

  return (
    <div style={{ background: BS.paper, color: BS.text }}>
      {/* Hero */}
      <section className="px-6 md:px-14 pt-16 pb-7 text-center max-w-[1440px] mx-auto">
        <Eyebrow>FAQ — ASK ANYTHING</Eyebrow>
        <h1
          className="text-4xl md:text-5xl lg:text-[60px] font-semibold mt-5 mb-3 leading-[1.02] max-w-4xl mx-auto"
          style={{ letterSpacing: '-0.035em', color: BS.text }}
        >
          Questions, <span style={{ color: BS.accent }}>answered by Kulvé.</span>
        </h1>
        <p className="text-base max-w-xl mx-auto" style={{ color: BS.muted }}>
          Search, browse, or just ask — the strategist has read every doc.
        </p>

        {/* Search bar */}
        <div
          className="mx-auto mt-6 max-w-xl px-4 py-3.5 rounded-[10px] flex items-center gap-3"
          style={{
            background: BS.paper,
            border: `1px solid ${BS.border}`,
            boxShadow: '0 10px 30px -16px rgba(15,23,41,0.1)',
          }}
        >
          <Sparkles className="w-4 h-4" style={{ color: BS.accent }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ask Kulvé anything — billing, voice, security…"
            className="flex-1 bg-transparent outline-none text-[14.5px]"
            style={{ color: BS.text }}
          />
          <span
            className="text-[11px] px-2 py-0.5 rounded"
            style={{ background: BS.soft, color: BS.muted, fontFamily: monoFont }}
          >
            ↵
          </span>
        </div>
      </section>

      {/* Category tiles */}
      <section className="px-6 md:px-14 pt-2 pb-7 max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {cats.map((c) => (
          <div
            key={c.n}
            className="p-4 rounded-[10px]"
            style={{ background: BS.paper, border: `1px solid ${BS.border}` }}
          >
            <div
              className="w-7 h-7 rounded-md inline-flex items-center justify-center mb-3"
              style={{ background: BS.accentSoft }}
            >
              <c.Icon className="w-3.5 h-3.5" style={{ color: BS.accentInk }} />
            </div>
            <div className="text-[13.5px] font-semibold">{c.n}</div>
            <div
              className="text-[11.5px] mt-1"
              style={{ color: BS.faint, fontFamily: monoFont }}
            >
              {c.q} articles →
            </div>
          </div>
        ))}
      </section>

      {/* Editorial Q&A sections */}
      <section className="px-6 md:px-14 pt-7 pb-16 max-w-[1440px] mx-auto">
        {sections.map((s, si) => (
          <div
            key={si}
            className="grid lg:grid-cols-[220px_1fr] gap-10 lg:gap-14 py-7"
            style={{ borderTop: `1px solid ${BS.border}` }}
          >
            <div
              className="text-xs font-bold pt-1"
              style={{ letterSpacing: '0.12em', color: BS.accent, fontFamily: monoFont }}
            >
              {s.t}
            </div>
            <div>
              {s.items.map(([q, a], i) => (
                <FAQRow key={q} q={q} a={a} defaultOpen={i === 0} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
