// Kulvè brand mark — outline variant from kulve-logo-v2.html
// Single source of truth, used in Nav, Footer, Auth pages, Onboarding.

interface KulveLogoProps {
  size?: number;
  theme?: 'light' | 'dark';
  wordmark?: boolean;
}

export function KulveLogo({ size = 32, theme = 'light', wordmark = true }: KulveLogoProps) {
  const isDark = theme === 'dark';
  const cyan = isDark ? '#00E5FF' : '#0099BB';
  const arm = isDark ? 'white' : '#0A0A0F';
  const wordColor = isDark ? 'white' : '#0A0A0F';
  const accent = cyan;

  return (
    <div className="inline-flex items-center" style={{ gap: Math.round(size * 0.34) }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 58 58"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Kulvé"
      >
        {/* Outer outlined rounded rect */}
        <rect width="58" height="58" rx="14" stroke={cyan} strokeWidth="2" fill="none" />
        {/* K stem */}
        <rect x="14" y="12" width="8" height="34" rx="2.5" fill={cyan} />
        {/* Upper arm */}
        <path d="M22 29 L44 12 L44 22 L26 33Z" fill={arm} fillOpacity="0.88" />
        {/* Lower arm */}
        <path d="M22 29 L44 46 L44 36 L26 26Z" fill={arm} fillOpacity="0.55" />
        {/* Accent dot top-right */}
        <circle cx="47" cy="12" r="3.5" fill={accent} />
      </svg>

      {wordmark && (
        <span
          style={{
            fontFamily: '"Syne", "Inter", system-ui, sans-serif',
            fontWeight: 800,
            fontSize: Math.round(size * 0.7),
            letterSpacing: '-0.03em',
            lineHeight: 1,
            color: wordColor,
            userSelect: 'none',
          }}
        >
          Kulv<span style={{ color: cyan }}>è</span>
        </span>
      )}
    </div>
  );
}
