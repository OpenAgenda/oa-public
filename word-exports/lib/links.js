import { hyperlink, run } from './xml.js';

// The URL as Word wants it, or null when it is not a web or mail link. A
// relationship target with a space or an accent makes Word call the whole
// file corrupt: `URL` encodes them.
export function safeUrl(value) {
  try {
    const url = new URL(String(value).trim());

    if (!['http:', 'https:', 'mailto:'].includes(url.protocol)) return null;

    // `URL` leaves a `mailto:` address as it was typed: what a URI cannot
    // carry is encoded here.
    return url.href.replace(/[\s"<>\\^`{|}]|[^\x21-\x7E]/gu, (c) =>
      encodeURIComponent(c));
  } catch {
    return null;
  }
}

// A link when the URL is one, the plain text otherwise.
export default function linkOrText(writer, url, text = url) {
  const href = safeUrl(url);

  return href ? hyperlink(writer.link(href), text) : run(text);
}
