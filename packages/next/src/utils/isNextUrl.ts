const internalUrlPatterns = [
  /^\/[^/]+\/?$/,
  /^\/[^/]+\/events\/[^/]+\/?$/,
  /^\/embed\/agendas\/[^/]+\/?$/,
  /^\/embed\/agendas\/[^/]+\/events\/[^/]+\/?$/,
  /^\/agendas\/?$/,
];

export default function isNextUrl(url: string): boolean {
  return internalUrlPatterns.some(pattern => pattern.test(url));
}
