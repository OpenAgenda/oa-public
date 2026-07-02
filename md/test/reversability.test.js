import fs from 'node:fs/promises';
import * as url from 'node:url';

import { fromMarkdownToHTML, fromHTMLToMarkdown } from '../src/index.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// fromHTMLToMarkdown does not emit a trailing newline, whereas the fixture
// files carry the conventional final "\n". Strip exactly that one trailing
// newline — NOT trimEnd(): the interior lines end in meaningful hard-break
// double-spaces (Markdown line breaks) that must survive the round-trip, and
// trimEnd would eat them on the last content line.
const stripFinalNewline = (s) => s.replace(/\n$/, '');

const withSubtitleMarkdown = stripFinalNewline(
  await fs.readFile(`${__dirname}/fixtures/withSubtitle.md`, 'utf-8'),
);

const withDoubleEndOfLines = stripFinalNewline(
  await fs.readFile(`${__dirname}/fixtures/withDoubleEndOfLines.md`, 'utf-8'),
);

describe('reversability', () => {
  test('with subtitle', () => {
    const result = fromHTMLToMarkdown(fromMarkdownToHTML(withSubtitleMarkdown));

    expect(result).toBe(withSubtitleMarkdown);
  });

  test('with double end of lines', () => {
    const html = fromMarkdownToHTML(withDoubleEndOfLines);
    const result = fromHTMLToMarkdown(html);

    expect(result).toBe(withDoubleEndOfLines);
  });
});
