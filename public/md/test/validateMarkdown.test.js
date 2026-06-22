import validateMarkdown from '../src/validateMarkdown.js';

describe('validateMarkdown', () => {
  const selfDomain = 'https://example.com';

  test('allows safe markdown', () => {
    const md = `
# Hello

This is **bold**, \`code\`, and a list:

- One
- Two

[Internal](/about)
[Mail](mailto:test@example.com)
`;
    expect(() => validateMarkdown(md)).not.toThrow();
  });

  test('rejects script tags', () => {
    expect(() => validateMarkdown('Hello <script>alert(1)</script>')).toThrow();
  });

  test('rejects img with onerror', () => {
    expect(() => validateMarkdown('<img src=x onerror=alert(1)>')).toThrow();
  });

  test('rejects javascript: links', () => {
    expect(() => validateMarkdown('[X](javascript:alert(1))')).toThrow();
  });

  test('rejects encoded javascript: links', () => {
    expect(() => validateMarkdown('[X](java&#x73;cript:alert(1))')).toThrow();
  });

  test('rejects &colon;-encoded javascript: links', () => {
    expect(() => validateMarkdown('[X](javascript&colon;alert(1))')).toThrow();
  });

  test('rejects javascript: in reference-style links', () => {
    expect(() =>
      validateMarkdown('[X][ref]\n\n[ref]: javascript:alert(1)')).toThrow();
  });

  test('rejects javascript: in reference-style images', () => {
    expect(() =>
      validateMarkdown('![X][img]\n\n[img]: javascript:alert(1)')).toThrow();
  });

  test('rejects javascript: autolinks', () => {
    expect(() => validateMarkdown('<javascript:alert(1)>')).toThrow();
  });

  test('rejects angle-bracketed javascript: destinations', () => {
    expect(() => validateMarkdown('[X](<javascript:alert(1)>)')).toThrow();
  });

  test('rejects javascript: in inline images', () => {
    expect(() => validateMarkdown('![X](javascript:alert(1))')).toThrow();
  });

  test('rejects data: in reference-style links', () => {
    expect(() =>
      validateMarkdown('[X][r]\n\n[r]: data:text/html;base64,abc')).toThrow();
  });

  test('rejects data: links', () => {
    expect(() => validateMarkdown('[X](data:text/html;base64,abc)')).toThrow();
  });

  test('rejects protocol-relative URLs', () => {
    expect(() => validateMarkdown('[X](//evil.com)')).toThrow();
  });

  test('allows relative links with selfDomain', () => {
    expect(() =>
      validateMarkdown('[About](/about)', 'desc', { selfDomain })).not.toThrow();
  });

  test('allows internal absolute links with selfDomain', () => {
    expect(() =>
      validateMarkdown('[Home](https://example.com/home)', 'desc', {
        selfDomain,
      })).not.toThrow();
  });

  test('rejects external links with selfDomain', () => {
    expect(() =>
      validateMarkdown('[Bad](https://evil.com)', 'desc', {
        selfDomain,
      })).toThrow();
  });

  test('rejects svg payloads', () => {
    expect(() => validateMarkdown('<svg onload=alert(1)>')).toThrow();
  });

  test('rejects inline onclick handler', () => {
    expect(() => validateMarkdown('<p onclick="alert(1)">hi</p>')).toThrow();
  });
});
