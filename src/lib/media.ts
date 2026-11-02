export type MediaItem = {
  _id: string;
  url: string;
  name: string;
  alt: string;
  category?: string;
  width?: number;
  height?: number;
  bytes?: number;
};

export type MediaPage = {
  assets: MediaItem[];
  nextPage: number | null;
  total: number;
};

export async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? 'The request could not be completed.');
  return body as T;
}

export function imageDeliveryUrl(url: string, width: number) {
  // Existing local assets and other providers keep their original URL.
  return url.replace(
    /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)/,
    `$1f_auto,q_auto,c_limit,w_${width}/`,
  );
}

export const galleryPath = (category: string) => `/livestock/${encodeURIComponent(category)}`;

export function mediaPageNumber(value: string | null) {
  const page = Number(value ?? 1);
  return Number.isSafeInteger(page) && page >= 1 && page <= 10000 ? page : null;
}
