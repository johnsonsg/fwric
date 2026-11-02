const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export async function prepareImage(file: File): Promise<File> {
  if (!ACCEPTED_TYPES.includes(file.type)) throw new Error('Choose a JPG, PNG, WebP, or GIF. Export HEIC photos as JPG first.');
  if (!file.size || file.size > 30 * 1024 * 1024) throw new Error('Choose an original photo up to 30 MB.');
  if (file.type === 'image/gif') {
    if (file.size > MAX_UPLOAD_BYTES) throw new Error('Animated GIFs must be under 4 MB.');
    return file;
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new window.Image();
    image.src = objectUrl;
    await image.decode();
    if (!image.naturalWidth || image.naturalWidth * image.naturalHeight > 50000000) {
      throw new Error('This photo is too large to process. Export a smaller copy first.');
    }
    if (file.size <= 900 * 1024 && Math.max(image.naturalWidth, image.naturalHeight) <= 2400) return file;
    for (const longestSide of [2400, 1920, 1600, 1200]) {
      const scale = Math.min(1, longestSide / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Your browser could not process this photo.');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
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
    URL.revokeObjectURL(objectUrl);
  }
}
