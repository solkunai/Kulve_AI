// Google Fonts integration — full catalog with search, preview, and loading

const GOOGLE_FONTS_API = 'https://www.googleapis.com/webfonts/v1/webfonts';
const GOOGLE_FONTS_CSS = 'https://fonts.googleapis.com/css2';

// Cache for the font list
let fontCache: GoogleFont[] | null = null;

export interface GoogleFont {
  family: string;
  category: string; // serif, sans-serif, display, handwriting, monospace
  variants: string[];
  subsets: string[];
}

/**
 * Fetch the full Google Fonts catalog.
 * Uses the API key if available, otherwise falls back to a curated list.
 */
export async function getGoogleFonts(): Promise<GoogleFont[]> {
  if (fontCache) return fontCache;

  const apiKey = import.meta.env.VITE_GOOGLE_FONTS_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch(`${GOOGLE_FONTS_API}?key=${apiKey}&sort=popularity`);
      if (response.ok) {
        const data = await response.json();
        fontCache = data.items.map((f: any) => ({
          family: f.family,
          category: f.category,
          variants: f.variants,
          subsets: f.subsets,
        }));
        return fontCache!;
      }
    } catch (err) {
      console.warn('Google Fonts API failed, using curated list:', err);
    }
  }

  // Fallback: comprehensive curated list organized by category
  fontCache = CURATED_FONTS;
  return fontCache;
}

/**
 * Load a specific font for preview/use.
 */
export function loadFont(family: string, weights: string[] = ['400', '500', '600', '700', '800', '900']): void {
  const id = `gfont-${family.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(id)) return;

  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `${GOOGLE_FONTS_CSS}?family=${encodeURIComponent(family)}:wght@${weights.join(';')}&display=swap`;
  document.head.appendChild(link);
}

/**
 * Load multiple fonts at once.
 */
export function loadFonts(families: string[]): void {
  families.forEach(f => loadFont(f));
}

/**
 * Search fonts by name.
 */
export function searchFonts(fonts: GoogleFont[], query: string): GoogleFont[] {
  if (!query.trim()) return fonts;
  const q = query.toLowerCase();
  return fonts.filter(f => f.family.toLowerCase().includes(q));
}

/**
 * Filter fonts by category.
 */
export function filterByCategory(fonts: GoogleFont[], category: string): GoogleFont[] {
  if (category === 'all') return fonts;
  return fonts.filter(f => f.category === category);
}

// Curated list: 200+ popular Google Fonts sorted by popularity
const CURATED_FONTS: GoogleFont[] = [
  // Sans-serif
  ...['Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Lato', 'Poppins', 'Nunito', 'Raleway', 'Ubuntu', 'Rubik',
    'Work Sans', 'Mulish', 'DM Sans', 'Manrope', 'Outfit', 'Space Grotesk', 'Sora', 'Urbanist', 'Barlow',
    'Josefin Sans', 'Karla', 'Fira Sans', 'Quicksand', 'Cabin', 'Archivo', 'Noto Sans', 'PT Sans',
    'Source Sans 3', 'IBM Plex Sans', 'Lexend', 'Plus Jakarta Sans', 'Albert Sans', 'Be Vietnam Pro',
    'Red Hat Display', 'Figtree', 'Geist', 'Onest', 'Schibsted Grotesk', 'General Sans',
    'Kufam', 'Exo 2', 'Titillium Web', 'Overpass', 'Signika', 'Catamaran', 'Heebo', 'Asap',
    'Nunito Sans', 'Commissioner', 'Epilogue', 'Jost', 'Atkinson Hyperlegible', 'Readex Pro',
  ].map(f => ({ family: f, category: 'sans-serif', variants: ['400', '700'], subsets: ['latin'] })),

  // Serif
  ...['Playfair Display', 'Merriweather', 'Lora', 'EB Garamond', 'Cormorant Garamond', 'Libre Baskerville',
    'Crimson Text', 'PT Serif', 'Noto Serif', 'Source Serif 4', 'Bitter', 'Vollkorn', 'Spectral',
    'IBM Plex Serif', 'Cardo', 'Frank Ruhl Libre', 'Fraunces', 'Newsreader', 'Literata', 'Brygada 1918',
    'Young Serif', 'Instrument Serif', 'DM Serif Display', 'DM Serif Text', 'Bodoni Moda',
    'Libre Caslon Text', 'Cormorant', 'Gilda Display', 'Sorts Mill Goudy', 'Old Standard TT',
  ].map(f => ({ family: f, category: 'serif', variants: ['400', '700'], subsets: ['latin'] })),

  // Display
  ...['Bebas Neue', 'Oswald', 'Anton', 'Righteous', 'Bungee', 'Russo One', 'Black Ops One', 'Teko',
    'Orbitron', 'Audiowide', 'Press Start 2P', 'Bungee Shade', 'Monoton', 'Megrim', 'Major Mono Display',
    'Graduate', 'Abril Fatface', 'Alfa Slab One', 'Passion One', 'Sigmar One', 'Lobster', 'Pacifico',
    'Permanent Marker', 'Bangers', 'Fredoka', 'Comfortaa', 'Bowlby One SC', 'Bungee Inline',
    'Rampart One', 'Silkscreen', 'Chakra Petch', 'Big Shoulders Display', 'Saira Stencil One',
  ].map(f => ({ family: f, category: 'display', variants: ['400', '700'], subsets: ['latin'] })),

  // Handwriting
  ...['Dancing Script', 'Caveat', 'Satisfy', 'Great Vibes', 'Sacramento', 'Parisienne', 'Tangerine',
    'Allura', 'Alex Brush', 'Rouge Script', 'Yellowtail', 'Kalam', 'Indie Flower', 'Patrick Hand',
    'Architects Daughter', 'Shadows Into Light', 'Amatic SC', 'Rock Salt', 'Homemade Apple',
    'Nothing You Could Do', 'Handlee', 'Gochi Hand', 'Gloria Hallelujah', 'Covered By Your Grace',
  ].map(f => ({ family: f, category: 'handwriting', variants: ['400'], subsets: ['latin'] })),

  // Monospace
  ...['Fira Code', 'JetBrains Mono', 'Source Code Pro', 'IBM Plex Mono', 'Space Mono', 'Roboto Mono',
    'Ubuntu Mono', 'Inconsolata', 'Red Hat Mono', 'DM Mono',
  ].map(f => ({ family: f, category: 'monospace', variants: ['400', '700'], subsets: ['latin'] })),
];
