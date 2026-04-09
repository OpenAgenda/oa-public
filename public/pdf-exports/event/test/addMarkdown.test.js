import * as url from 'node:url';
import { readFile } from 'node:fs/promises';
import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import Cursor from '../lib/Cursor.js';
import addMarkdown from '../lib/addMarkdown.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// Get command line arguments
let segments = process.argv.slice(2);

// If no arguments provided, render all segments
if (segments.length === 0) {
  segments = [
    'tiny',
    'emojis',
    'girls',
    'modalites',
    'lienlong',
    'lienEncorePlusLong',
    'unhandledCharacters',
    'kropotkineLink',
  ];
}

// Validate all segments
const validSegments = [
  'tiny',
  'emojis',
  'girls',
  'modalites',
  'lienlong',
  'lienEncorePlusLong',
  'unhandledCharacters',
  'kropotkineLink',
];
for (const segment of segments) {
  if (!validSegments.includes(segment)) {
    console.error(`Invalid segment: ${segment}`);
    console.error('Available segments: tiny, emojis, girls');
    process.exit(1);
  }
}

const doc = new PDFDocument({ size: 'A5', margin: 0, layout: 'landscape' });
doc.pipe(fs.createWriteStream(`${__dirname}/renders/addMarkdown.pdf`));

const cursor = Cursor({ x: 0, y: 0 });
let isFirstSegment = true;

for (const segment of segments) {
  // Add new page for subsequent segments
  if (!isFirstSegment) {
    doc.addPage();
    cursor.setX(0);
    cursor.setY(0);
  }

  if (segment === 'tiny') {
    // First segment - tiny.md
    await addMarkdown(doc, cursor, {
      value: await readFile(`${__dirname}/fixtures/tiny.md`, 'utf-8'),
    });
  } else if (segment === 'emojis') {
    // Second segment - emojis.md
    await addMarkdown(doc, cursor, {
      value: await readFile(`${__dirname}/fixtures/emojis.md`, 'utf-8'),
    });
  } else if (segment === 'girls') {
    await addMarkdown(doc, cursor, {
      value: await readFile(
        `${__dirname}/fixtures/girls-dont-cry-party-21.md`,
        'utf-8',
      ),
      availableWidth: 120,
    });
  } else if (segment === 'modalites') {
    await addMarkdown(doc, cursor, {
      value: await readFile(
        `${__dirname}/fixtures/modalites-de-formation.md`,
        'utf-8',
      ),
    });
  } else if (segment === 'lienlong') {
    await addMarkdown(doc, cursor, {
      value: await readFile(`${__dirname}/fixtures/lien-long.md`, 'utf-8'),
    });
  } else if (segment === 'lienEncorePlusLong') {
    await addMarkdown(doc, cursor, {
      value: await readFile(
        `${__dirname}/fixtures/lien-encore-plus-long.md`,
        'utf-8',
      ),
      // availableWidth: 357.29999999999995, NOK
      availableWidth: 357, // OK
    });
  } else if (segment === 'kropotkineLink') {
    // Reproduces "Infinite loop detected: remaining unchanged" thrown from
    // addParentElement when rendering a very long inline URL used as link text.
    // Extracted from event 73878368 (agenda 97144113).
    await addMarkdown(doc, cursor, {
      value: await readFile(
        `${__dirname}/fixtures/kropotkine-link.md`,
        'utf-8',
      ),
      // Width used by renderEvent's longDescription column — triggers
      // "Infinite loop detected: remaining unchanged (73 length)" in
      // addParentElement on the long inline URL.
      availableWidth: 357.29999999999995,
    });
  } else if (segment === 'unhandledCharacters') {
    await addMarkdown(doc, cursor, {
      value: await readFile(
        `${__dirname}/fixtures/unhandledCharacters.md`,
        'utf-8',
      ),
    });
  }

  isFirstSegment = false;
}

doc.end();
