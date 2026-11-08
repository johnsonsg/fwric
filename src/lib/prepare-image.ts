const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export const IMAGE_UPLOAD_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif,.hif';

export function isHeicImage(file: Pick<File, 'type' | 'name'>) {
  return /^image\/hei[cf](?:-sequence)?$/i.test(file.type) || /\.(heic|heif|hif)$/i.test(file.name);
}

export function imageSelectionError(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type) && !isHeicImage(file)) return 'Choose a JPG, PNG, WebP, GIF, or iPhone HEIC photo.';
  if (!file.size) return 'This file is empty. Choose another copy.';
  if (file.size > 30 * 1024 * 1024) return 'Choose an original photo up to 30 MB.';
  if (file.type === 'image/gif' && file.size > MAX_UPLOAD_BYTES) return 'Animated GIFs must be under 4 MB.';
  return null;
}

export async function prepareImage(file: File): Promise<File> {
  const selectionError = imageSelectionError(file);
  if (selectionError) throw new Error(selectionError);
  if (file.type === 'image/gif') return file;

  let objectUrl: string | undefined;
  let bitmap: ImageBitmap | undefined;
  try {
    let source: CanvasImageSource;
    let width: number;
    let height: number;
    if (isHeicImage(file)) {
      try {
        // Loaded only for iPhone photos; decoding runs in the library's worker.
        const { heicTo } = await import('heic-to/csp');
        bitmap = await heicTo({ blob: file, type: 'bitmap' });
        source = bitmap;
        width = bitmap.width;
        height = bitmap.height;
      } catch {
        throw new Error('This HEIC photo could not be converted. Export it as JPG and try again.');
      }
    } else {
      objectUrl = URL.createObjectURL(file);
      const image = new window.Image();
      image.src = objectUrl;
      try { await image.decode(); } catch { throw new Error('This photo could not be read. Choose another copy or export it as JPG.'); }
      source = image;
      width = image.naturalWidth;
      height = image.naturalHeight;
    }
    if (!width || !height || width * height > 50000000) {
      throw new Error('This photo exceeds the 50-megapixel processing limit. Export a smaller copy first.');
    }
    if (!isHeicImage(file) && file.size <= 900 * 1024 && Math.max(width, height) <= 2400) return file;
    for (const longestSide of [2400, 1920, 1600, 1200]) {
      const scale = Math.min(1, longestSide / Math.max(width, height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Your browser could not process this photo.');
      context.drawImage(source, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.84, 0.76, 0.68, 0.6]) {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
        if (blob && blob.size <= 900 * 1024) {
          const extension = blob.type === 'image/webp' ? 'webp' : 'png';
          return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.${extension}`, { type: blob.type });
        }
      }
    }
    throw new Error('Unable to shrink this photo enough. Export a smaller JPG and try again.');
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    bitmap?.close();
  }
}
