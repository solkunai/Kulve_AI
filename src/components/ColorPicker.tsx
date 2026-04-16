import { useState, useRef, useEffect, useCallback } from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

// --- Color conversion helpers ---
function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: h * 360, s: max === 0 ? 0 : d / max, v: max };
}

function hsvToHex(h: number, s: number, v: number): string {
  const i = Math.floor(h / 60) % 6;
  const f = h / 60 - Math.floor(h / 60);
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r = 0, g = 0, b = 0;
  if (i === 0) { r = v; g = t; b = p; }
  else if (i === 1) { r = q; g = v; b = p; }
  else if (i === 2) { r = p; g = v; b = t; }
  else if (i === 3) { r = p; g = q; b = v; }
  else if (i === 4) { r = t; g = p; b = v; }
  else { r = v; g = p; b = q; }
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Preset palettes
const STANDARD_PRESETS = [
  '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
  '#1a1f36', '#2d3748', '#1B2A4A', '#2C2C2C', '#0A0A0A', '#FAF9F7',
  '#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#3182ce', '#805ad5',
  '#c53030', '#c05621', '#b7791f', '#276749', '#2b6cb0', '#6b46c1',
  '#fc8181', '#f6ad55', '#ecc94b', '#68d391', '#63b3ed', '#b794f4',
  '#3b6dca', '#4299e1', '#38b2ac', '#48bb78', '#ed8936', '#e53e3e',
];

const NEON_PRESETS = [
  '#ff0040', '#ff0080', '#ff00ff', '#8000ff', '#0040ff', '#0080ff',
  '#00ffff', '#00ff80', '#00ff00', '#80ff00', '#ffff00', '#ff8000',
  '#ff1493', '#ff69b4', '#da70d6', '#9370db', '#7b68ee', '#6495ed',
  '#00ced1', '#00fa9a', '#7fff00', '#adff2f', '#ffd700', '#ff6347',
  '#ff073a', '#39ff14', '#0ff0fc', '#bc13fe', '#fffc00', '#ff5f1f',
];

export default function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value);
  const [hsv, setHsv] = useState(() => hexToHsv(value || '#3b6dca'));
  const [mode, setMode] = useState<'standard' | 'neon'>('standard');
  const [dragging, setDragging] = useState<'gradient' | 'hue' | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setHexInput(value); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sync HSV when value changes externally
  useEffect(() => {
    if (value && /^#[0-9A-Fa-f]{6}$/.test(value)) {
      setHsv(hexToHsv(value));
    }
  }, [value]);

  const applyColor = useCallback((newHsv: { h: number; s: number; v: number }) => {
    // In neon mode, force high saturation
    const s = mode === 'neon' ? Math.max(newHsv.s, 0.7) : newHsv.s;
    const v = mode === 'neon' ? Math.max(newHsv.v, 0.7) : newHsv.v;
    const hex = hsvToHex(newHsv.h, s, v);
    setHsv({ h: newHsv.h, s, v });
    setHexInput(hex);
    onChange(hex);
  }, [mode, onChange]);

  const handleGradientInteraction = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!gradientRef.current) return;
    const rect = gradientRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    applyColor({ h: hsv.h, s: x, v: 1 - y });
  }, [hsv.h, applyColor]);

  const handleHueInteraction = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    applyColor({ h: x * 360, s: hsv.s, v: hsv.v });
  }, [hsv.s, hsv.v, applyColor]);

  // Global mouse move/up for dragging
  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: MouseEvent) => {
      if (dragging === 'gradient') handleGradientInteraction(e);
      else if (dragging === 'hue') handleHueInteraction(e);
    };
    const handleUp = () => setDragging(null);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragging, handleGradientInteraction, handleHueInteraction]);

  const handleHexChange = (hex: string) => {
    setHexInput(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      onChange(hex);
      setHsv(hexToHsv(hex));
    }
  };

  const pureHueColor = hsvToHex(hsv.h, 1, 1);

  return (
    <div ref={ref} className="relative">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}

      {/* Compact display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-white hover:border-brand-blue/50 transition-colors"
      >
        <div className="w-7 h-7 rounded-md border border-gray-200 shrink-0 shadow-inner" style={{ backgroundColor: value }} />
        <span className="text-sm font-mono text-gray-700 flex-1 text-left">{value}</span>
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden" style={{ left: 0 }}>
          {/* Mode toggle */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setMode('standard')}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${mode === 'standard' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
            >
              Standard
            </button>
            <button
              onClick={() => setMode('neon')}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${mode === 'neon' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
              style={mode === 'neon' ? { background: 'linear-gradient(90deg, #ff0040, #8000ff, #00ffff, #39ff14)' } : {}}
            >
              Neon
            </button>
          </div>

          {/* Gradient square */}
          <div className="p-3 pb-0">
            <div
              ref={gradientRef}
              className="relative w-full rounded-lg cursor-crosshair overflow-hidden"
              style={{
                height: 160,
                background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${pureHueColor})`,
              }}
              onMouseDown={(e) => { setDragging('gradient'); handleGradientInteraction(e); }}
            >
              {/* Picker dot */}
              <div
                className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
                style={{
                  left: `${hsv.s * 100}%`,
                  top: `${(1 - hsv.v) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: value,
                }}
              />
            </div>
          </div>

          {/* Hue slider */}
          <div className="px-3 pt-3">
            <div
              ref={hueRef}
              className="relative w-full h-3 rounded-full cursor-pointer"
              style={{ background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }}
              onMouseDown={(e) => { setDragging('hue'); handleHueInteraction(e); }}
            >
              <div
                className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
                style={{
                  left: `${(hsv.h / 360) * 100}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: pureHueColor,
                }}
              />
            </div>
          </div>

          {/* Hex input + current color */}
          <div className="p-3 flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg border border-gray-200 shrink-0" style={{ backgroundColor: value }} />
            <input
              type="text"
              value={hexInput}
              onChange={(e) => handleHexChange(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none"
              placeholder="#000000"
            />
          </div>

          {/* Preset swatches */}
          <div className="px-3 pb-3">
            <div className="flex flex-wrap gap-1.5">
              {(mode === 'neon' ? NEON_PRESETS : STANDARD_PRESETS).map(color => (
                <button
                  key={color}
                  onClick={() => { onChange(color); setHexInput(color); setHsv(hexToHsv(color)); }}
                  className={`w-6 h-6 rounded-md border transition-transform hover:scale-125 ${value === color ? 'border-brand-blue ring-2 ring-brand-blue/30 scale-110' : 'border-gray-200'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
