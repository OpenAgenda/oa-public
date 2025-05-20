import fs from 'node:fs/promises';
import path from 'node:path';
import config from '../config.dev.js';
import generate from '../server/generateDocument.js';

const { jest } = import.meta;

describe('unit - generate document', () => {
  jest.setTimeout(15000);

  let docPath;

  // afterEach(() => fs.unlink(docPath));

  test('generates a word document when given an agenda uid', async () => {
    const result = await generate({
      agendaUid: 95343,
      language: 'fr',
      localTmpPath: config.localTmpPath,
      templatePath: `${import.meta.dirname}/../input.docx`,
    });

    docPath = result.outputPath;

    // /var/tmp/95343.1525771511254.docx
    expect(/95343\.[0-9]+\.docx$/.test(docPath)).toBe(true);
  });

  test('generates a word document based on a templateContent', async () => {
    const templateContent = await fs.readFile(
      path.resolve(import.meta.dirname, 'data', 'template.docx'),
    );

    const result = await generate({
      agendaUid: 47800929,
      language: 'fr',
      localTmpPath: config.localTmpPath,
      templateContent,
    });

    docPath = result.outputPath;

    // /var/tmp/47800929.1525771511254.docx
    expect(/47800929\.[0-9]+\.docx$/.test(docPath)).toBe(true);
  });
});
