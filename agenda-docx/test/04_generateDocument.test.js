const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const config = require('../config.dev');
const generate = require('../server/generateDocument');

describe('unit - generate document', () => {
  jest.setTimeout(15000);

  let docPath;

  afterEach(done => {
    fs.unlink(docPath, done);
  });

  test('generates a word document when given an agenda uid', async () => {
    const result = await generate({
      agendaUid: 47800929,
      language: 'fr',
      localTmpPath: config.localTmpPath,
      templatePath: `${__dirname}/../input.docx`,
    });

    docPath = result.outputPath;

    // /var/tmp/47800929.1525771511254.docx
    expect(/47800929\.[0-9]+\.docx$/.test(docPath)).toBe(true);
  });

  test('generates a word document based on a templateContent', async () => {
    const templateContent = await promisify(fs.readFile)(
      path.resolve(__dirname, 'data', 'template.docx')
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
