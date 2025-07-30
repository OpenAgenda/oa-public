import fs from 'node:fs/promises';
import * as url from 'node:url';

import { fromMarkdownToHTML, fromHTMLToMarkdown } from '../src/index.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const withSubtitleMarkdown = await fs.readFile(
  `${__dirname}/fixtures/withSubtitle.md`,
  'utf-8',
);

const withDoubleEndOfLines = await fs.readFile(
  `${__dirname}/fixtures/withDoubleEndOfLines.md`,
  'utf-8',
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
