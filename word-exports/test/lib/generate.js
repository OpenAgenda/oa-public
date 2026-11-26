import { PassThrough, Readable } from 'node:stream';
import JSZip from 'jszip';
import { XMLValidator } from 'fast-xml-parser';
import WordExports from '../../index.js';
import agenda from '../fixtures/albi.agenda.json' with { type: 'json' };
import albiEvents from '../fixtures/albi.events.json' with { type: 'json' };

export { agenda, albiEvents };

// Generates a document from `events` and opens it: every XML part is checked
// well-formed on the way.
export default async function generate(events, options = {}, config = {}) {
  const output = new PassThrough();
  const chunks = [];

  output.on('data', (chunk) => chunks.push(chunk));

  const result = await WordExports(config).agenda.GenerateExportStream(
    Readable.from(events),
    output,
    { agenda, ...options },
  );

  const zip = await JSZip.loadAsync(Buffer.concat(chunks));
  const parts = {};

  for (const [name, entry] of Object.entries(zip.files)) {
    if (!/\.(xml|rels)$/.test(name)) continue;

    parts[name] = await entry.async('string');

    const valid = XMLValidator.validate(parts[name]);

    if (valid !== true) {
      throw new Error(
        `${name} is not well-formed: ${JSON.stringify(valid.err)}`,
      );
    }
  }

  return {
    result,
    zip,
    parts,
    document: parts['word/document.xml'],
    count: (pattern) =>
      (parts['word/document.xml'].match(pattern) ?? []).length,
  };
}
