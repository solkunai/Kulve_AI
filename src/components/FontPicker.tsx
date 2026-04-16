import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { getGoogleFonts, searchFonts, filterByCategory, loadFont, type GoogleFont } from '../lib/fonts';

interface FontPickerProps {
  value: string;
  onChange: (font: string) => void;
  label?: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'sans-serif', label: 'Sans Serif' },
  { id: 'serif', label: 'Serif' },
  { id: 'display', label: 'Display' },
  { id: 'handwriting', label: 'Script' },
  { id: 'monospace', label: 'Mono' },
];

export default function FontPicker({ value, onChange, label }: FontPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fonts, setFonts] = useState<GoogleFont[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [filtered, setFiltered] = useState<GoogleFont[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load fonts on mount
  useEffect(() => {
    getGoogleFonts().then(setFonts);
  }, []);

  // Filter when query/category changes
  useEffect(() => {
    let result = fonts;
    if (category !== 'all') result = filterByCategory(result, category);
    if (query) result = searchFonts(result, query);
    setFiltered(result.slice(0, 80)); // Limit for performance
  }, [fonts, query, category]);

  // Load the currently selected font for preview
  useEffect(() => {
    if (value) loadFont(value);
  }, [value]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (font: string) => {
    loadFont(font);
    onChange(font);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={ref} className="relative">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}

      {/* Selected font display */}
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setTimeout(() => inputRef.current?.focus(), 100); }}
        className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 bg-white text-left hover:border-brand-blue/50 transition-colors"
      >
        <span style={{ fontFamily: `'${value}', sans-serif` }} className="text-sm text-gray-900">
          {value || 'Select a font...'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden" style={{ maxHeight: 420 }}>
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 200+ fonts..."
                className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Category tabs */}
          <div className="px-3 py-2 border-b border-gray-100 flex gap-1 overflow-x-auto">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  category === cat.id ? 'bg-brand-blue text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Font list */}
          <div className="overflow-y-auto" style={{ maxHeight: 300 }}>
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">No fonts found</div>
            ) : (
              filtered.map((font) => (
                <button
                  key={font.family}
                  onClick={() => handleSelect(font.family)}
                  onMouseEnter={() => loadFont(font.family)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between ${
                    value === font.family ? 'bg-brand-blue/5' : ''
                  }`}
                >
                  <div>
                    <span style={{ fontFamily: `'${font.family}', sans-serif` }} className="text-sm text-gray-900 block">
                      {font.family}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">{font.category}</span>
                  </div>
                  <span style={{ fontFamily: `'${font.family}', sans-serif` }} className="text-xs text-gray-400">
                    Aa Bb Cc
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
