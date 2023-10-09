const internalUrlPatterns = [
  /^\/agendas\/[^/]+\/?$/,
  /^\/agendas\/[^/]+\/events\/[^/]+\/?$/,
];

export default function isNextUrl(url: string): boolean {
  return internalUrlPatterns.some(pattern => pattern.test(url));
}
