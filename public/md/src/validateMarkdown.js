// src/validateMarkdown.js

import extractLinksAsInMarkdown from './utils/extractLinksAsInMarkdown.js';

const ERROR = (value, field) => [
  {
    message: 'Unsafe content detected',
    code: `${field}.invalid`,
    field,
    origin: value,
  },
];

function decodeEntities(str) {
  return str
    .replace(/&#x([0-9a-f]+);?/gi, (_, h) =>
      String.fromCharCode(parseInt(h, 16)))
    .replace(/&#([0-9]+);?/g, (_, d) => String.fromCharCode(parseInt(d, 10)))
    .replace(/&colon;?/gi, ':')
    .replace(/&newline;?/gi, '\n');
}

function normalize(str) {
  return decodeEntities(str).replace(/\s+/g, '').toLowerCase();
}

function isUnsafeProtocol(href) {
  const n = normalize(href);
  return (
    // eslint-disable-next-line no-script-url
    n.startsWith('javascript:')
    || n.startsWith('data:')
    || n.startsWith('vbscript:')
  );
}

function hasUnsafeHtml(md) {
  // Check for dangerous HTML tags (including <a> tags which can have javascript: hrefs)
  return /<\s*(script|iframe|object|embed|svg|img|video|audio|style|link|meta|a|form|base|button)\b/i.test(
    md,
  );
}

function hasEventHandlers(md) {
  return /\son\w+\s*=/i.test(md);
}

// Destinations marked() will turn into an href/src, across every link syntax:
// inline `[t](dest)` / `![a](dest)`, reference definitions `[id]: dest`, and
// autolinks `<scheme:...>`. The angle brackets around a destination are stripped
// so `[t](<javascript:...>)` is inspected as `javascript:...`.
const INLINE_LINK = /!?\[[^\]]*\]\(\s*<?([^)\s>]+)/g;
const REFERENCE_DEF = /^[ \t]{0,3}\[[^\]]+\]:\s*<?([^\s>]+)/gm;
const AUTOLINK = /<([a-z][a-z0-9+.-]*:[^>\s]+)>/gi;

function extractLinks(md) {
  const links = new Set();

  // markdown-link-extractor resolves every standard link/image syntax
  // (inline, reference, autolink) the way a renderer would.
  for (const href of extractLinksAsInMarkdown(md)) {
    links.add(href);
  }

  // Belt-and-braces regex pass: the library normalises destinations and drops
  // ones it cannot parse (e.g. HTML-entity-encoded `java&#x73;cript:` payloads),
  // but marked() still renders those into live hrefs. Capture the raw
  // destinations so isUnsafeProtocol() can decode and reject them.
  for (const regex of [INLINE_LINK, REFERENCE_DEF, AUTOLINK]) {
    let match;
    while ((match = regex.exec(md)) !== null) {
      links.add(match[1].trim());
    }
  }

  return [...links];
}

function isExternalToSelfDomain(href, selfDomain) {
  // Allow root-relative paths
  if (href.startsWith('/') && !href.startsWith('//')) return false;

  try {
    const url = new URL(href);
    const self = new URL(selfDomain);
    return url.hostname !== self.hostname;
  } catch {
    return true;
  }
}

export default function validateMarkdown(md, field, options = {}) {
  const { selfDomain = null } = options;

  if (typeof md !== 'string') {
    throw ERROR(md, field);
  }

  // Raw HTML rejection
  if (hasUnsafeHtml(md)) {
    throw ERROR(md, field);
  }

  // Inline event handlers
  if (hasEventHandlers(md)) {
    throw ERROR(md, field);
  }

  // Link inspection
  const links = extractLinks(md);

  for (const href of links) {
    // Protocol-relative URLs are ALWAYS unsafe
    if (href.startsWith('//')) {
      throw ERROR(md, field);
    }

    // Unsafe protocols (plain or encoded)
    if (isUnsafeProtocol(href)) {
      throw ERROR(md, field);
    }

    // External links when selfDomain is enforced
    if (selfDomain && isExternalToSelfDomain(href, selfDomain)) {
      throw ERROR(md, field);
    }
  }

  return md;
}
