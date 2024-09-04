import type { ImageLoaderProps } from 'next/image';

export function keyCDNLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  const url = new URL(src);
  const params = url.searchParams;

  params.set('format', 'webp');
  params.set('width', width.toString());
  if (quality) {
    params.set('quality', quality.toString());
  }

  return url.href;
}

export function thumborLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  const params = [`${width}x0`];
  if (quality) {
    params.push(`filters:quality(${quality})`);
  }

  return `${process.env.NEXT_PUBLIC_THUMBOR_PREFIX}${params.join('/')}/${src}`;
}
