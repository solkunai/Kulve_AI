import { generateContent } from './ai';

/**
 * Analyze an uploaded brand kit file and extract brand information.
 * Supports images (extract colors) and text content (send to Claude for analysis).
 */

export interface ExtractedBrandKit {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  heading_font?: string;
  body_font?: string;
  tone_of_voice?: string;
  business_name?: string;
  industry?: string;
  description?: string;
  target_customer?: string;
  tagline?: string;
}

/**
 * Extract dominant colors from an image file using canvas.
 */
export async function extractColorsFromImage(file: File): Promise<{ primary: string; secondary: string; accent: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ primary: '#3b6dca', secondary: '#1a1f36', accent: '#10b981' });
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      // Sample pixels and find dominant colors
      const colorMap: Record<string, number> = {};
      for (let i = 0; i < imageData.length; i += 16) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];
        if (a < 128) continue; // skip transparent pixels

        // Quantize
        const qr = Math.round(r / 24) * 24;
        const qg = Math.round(g / 24) * 24;
        const qb = Math.round(b / 24) * 24;

        // Skip near-white and near-black
        const brightness = (qr + qg + qb) / 3;
        if (brightness < 20 || brightness > 235) continue;

        const key = `${qr},${qg},${qb}`;
        colorMap[key] = (colorMap[key] || 0) + 1;
      }

      const sorted = Object.entries(colorMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      const toHex = (rgb: string) => {
        const [r, g, b] = rgb.split(',').map(Number);
        return '#' + [r, g, b].map(c => Math.min(255, c).toString(16).padStart(2, '0')).join('');
      };

      resolve({
        primary: sorted[0] ? toHex(sorted[0][0]) : '#3b6dca',
        secondary: sorted[1] ? toHex(sorted[1][0]) : '#1a1f36',
        accent: sorted[2] ? toHex(sorted[2][0]) : '#10b981',
      });

      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      resolve({ primary: '#3b6dca', secondary: '#1a1f36', accent: '#10b981' });
      URL.revokeObjectURL(url);
    };

    img.src = url;
  });
}

/**
 * Extract text content from an HTML file.
 */
async function extractTextFromHtml(file: File): Promise<string> {
  const text = await file.text();
  // Strip HTML tags but keep text content
  const div = document.createElement('div');
  div.innerHTML = text;

  // Try to extract CSS colors and fonts
  const styleContent = text.match(/<style[^>]*>([\s\S]*?)<\/style>/gi)?.join('\n') || '';
  const inlineStyles = text.match(/style="[^"]*"/gi)?.join('\n') || '';
  const textContent = div.textContent || '';

  return `CSS STYLES FOUND:\n${styleContent}\n${inlineStyles}\n\nTEXT CONTENT:\n${textContent.slice(0, 3000)}`;
}

/**
 * Read PDF as text (basic — extracts what it can from the raw file).
 */
async function extractTextFromPdf(file: File): Promise<string> {
  // PDFs are binary, but we can extract some text by looking for text streams
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let text = '';

  // Simple PDF text extraction — look for text between BT and ET markers
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const rawText = decoder.decode(bytes);

  // Extract text objects
  const textMatches = rawText.match(/\(([^)]+)\)/g) || [];
  text = textMatches.map(m => m.slice(1, -1)).join(' ').slice(0, 3000);

  // Also look for color definitions
  const colorMatches = rawText.match(/[\d.]+ [\d.]+ [\d.]+ (?:rg|RG|k|K)/g) || [];
  const fontMatches = rawText.match(/\/([A-Za-z]+[-]?[A-Za-z]*)\s+[\d.]+ Tf/g) || [];

  return `COLORS FOUND: ${colorMatches.join(', ')}\nFONTS FOUND: ${fontMatches.join(', ')}\nTEXT CONTENT: ${text}`;
}

/**
 * Use Claude to analyze brand kit content and extract structured data.
 */
export async function analyzeBrandKitWithAI(fileContent: string, fileName: string): Promise<ExtractedBrandKit> {
  const prompt = `You are a brand identity analyst. A user has uploaded their brand kit file "${fileName}".

Here is the content extracted from the file:

${fileContent}

Analyze this brand kit and extract as much information as possible. Return ONLY a valid JSON object with these fields (use null for anything you can't determine):

{
  "primary_color": "#hex or null",
  "secondary_color": "#hex or null",
  "accent_color": "#hex or null",
  "heading_font": "font name or null",
  "body_font": "font name or null",
  "tone_of_voice": "Professional/Friendly/Bold/Playful/Luxury/Casual or null",
  "business_name": "name or null",
  "industry": "industry or null",
  "description": "business description or null",
  "target_customer": "target audience or null",
  "tagline": "tagline/slogan or null"
}

Look for:
- Color hex codes in CSS, style attributes, or mentioned in text
- Font family names in CSS font-family declarations or mentioned by name
- Business name from headings, titles, or prominent text
- Industry from context clues
- Tone of voice from the writing style and language used
- Any taglines or slogans

Return ONLY the JSON object. No explanation.`;

  const raw = await generateContent(prompt);
  try {
    const jsonStr = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch {
    return {};
  }
}

/**
 * Full brand kit analysis pipeline.
 * Handles images (color extraction) and documents (AI analysis).
 */
export async function analyzeBrandKitFile(file: File): Promise<ExtractedBrandKit & { colors?: { primary: string; secondary: string; accent: string } }> {
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';
  const isHtml = file.type === 'text/html' || file.name.endsWith('.html') || file.name.endsWith('.htm');

  const result: ExtractedBrandKit & { colors?: { primary: string; secondary: string; accent: string } } = {};

  // Extract colors from images
  if (isImage) {
    const colors = await extractColorsFromImage(file);
    result.primary_color = colors.primary;
    result.secondary_color = colors.secondary;
    result.accent_color = colors.accent;
    result.colors = colors;
  }

  // For PDFs and HTML, extract text and analyze with AI
  if (isPdf || isHtml) {
    let textContent = '';
    if (isPdf) textContent = await extractTextFromPdf(file);
    else if (isHtml) textContent = await extractTextFromHtml(file);

    if (textContent.trim().length > 20) {
      const aiResult = await analyzeBrandKitWithAI(textContent, file.name);
      Object.assign(result, aiResult);
    }
  }

  return result;
}
