// src/validateMarkdown.js

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

function extractLinks(md) {
  const links = [];
  const regex = /\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(md)) !== null) {
    links.push(match[2].trim());
  }
  return links;
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
