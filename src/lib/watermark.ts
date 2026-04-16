import type { PlanType } from './plans';

/**
 * Check if watermark should be applied based on user's plan.
 * Free and trial users get watermarked downloads.
 * Starter, Growth, Scale get clean downloads.
 */
export function shouldWatermark(plan: PlanType | string | null | undefined): boolean {
  if (!plan) return true;
  return plan === 'free' || plan === 'trial';
}

/**
 * Add "Generated with Kulvé" watermark to a canvas/image data URL.
 * Call this before triggering the download.
 */
export async function addWatermark(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(dataUrl); return; }

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Watermark bar at bottom
      const barHeight = Math.max(32, img.height * 0.04);
      const fontSize = Math.max(12, barHeight * 0.45);

      // Semi-transparent dark bar
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, img.height - barHeight, img.width, barHeight);

      // Watermark text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = `${Math.round(fontSize)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Generated with Kulvé  ·  kulve.us', img.width / 2, img.height - barHeight / 2);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Wrapper for toPng that adds watermark if needed.
 * Use this instead of calling toPng directly.
 */
export async function downloadWithWatermark(
  element: HTMLElement,
  filename: string,
  plan: PlanType | string | null | undefined,
  options?: { width?: number; height?: number; pixelRatio?: number; style?: Record<string, string> }
): Promise<void> {
  // Dynamic import to avoid loading html-to-image unless needed
  const { toPng } = await import('html-to-image');

  let dataUrl = await toPng(element, {
    pixelRatio: options?.pixelRatio || 2,
    ...(options?.width && options?.height ? {
      width: options.width,
      height: options.height,
      style: options.style || {
        transform: 'scale(1)',
        transformOrigin: 'top left',
        width: `${options.width}px`,
        height: `${options.height}px`,
      },
    } : {}),
  });

  // Add watermark for free/trial users
  if (shouldWatermark(plan)) {
    dataUrl = await addWatermark(dataUrl);
  }

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
