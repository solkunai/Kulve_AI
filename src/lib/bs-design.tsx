import React from 'react';

// ── Bold Statement design tokens (shared across marketing pages) ─────────
export const BS = {
  ink: '#0A0E1A',
  text: '#0F1729',
  muted: '#525C6E',
  faint: '#8B95A8',
  paper: '#FFFFFF',
  soft: '#F6F7F9',
  softer: '#FAFBFC',
  border: '#E4E7EC',
  borderSoft: '#EFF1F4',
  accent: '#0099BB',
  accentInk: '#006B85',
  accentBright: '#00E5FF',
  accentSoft: '#E0F7FB',
  success: '#0F8B5C',
  successSoft: '#E2F4EC',
  warn: '#C77400',
};

export const monoFont = 'ui-monospace, "JetBrains Mono", "SF Mono", monospace';

// ── Mono eyebrow — signature element ─────────────────────────────────────
export const Eyebrow = ({ children, color = BS.accent }: { children: React.ReactNode; color?: string }) => (
  <div
    className="text-xs font-semibold uppercase"
    style={{
      letterSpacing: '0.12em',
      color,
      fontFamily: monoFont,
    }}
  >
    {children}
  </div>
);

// ── Status pill (GA / BETA / Q3 / etc.) ──────────────────────────────────
export const StatusPill = ({ s }: { s: string }) => {
  const isGA = s.toUpperCase() === 'GA';
  const isBeta = s.toUpperCase() === 'BETA';
  return (
    <span
      className="text-[10.5px] font-bold px-2 py-0.5 rounded-sm tracking-wider"
      style={{
        background: isGA ? BS.successSoft : isBeta ? BS.accentSoft : BS.soft,
        color: isGA ? BS.success : isBeta ? BS.accentInk : BS.muted,
      }}
    >
      {s.toUpperCase()}
    </span>
  );
};
