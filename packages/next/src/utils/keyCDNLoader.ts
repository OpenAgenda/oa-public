type LoaderProps = {
  src: string
  width: number
  quality?: number
}

export default function keyCDNLoader({ src, width, quality }: LoaderProps) {
  const url = new URL(src);
  const params = url.searchParams;

  params.set('format', 'webp');
  params.set('width', width.toString());
  if (quality) {
    params.set('quality', quality.toString());
  }

  return url.href;
}
