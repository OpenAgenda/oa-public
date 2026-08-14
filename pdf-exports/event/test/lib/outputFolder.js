import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Renders land in a throwaway directory unless PDF_TEST_FOLDER says otherwise,
// so a plain `yarn test` never rewrites the reference PDFs tracked in
// event/test/renders/. `yarn renders:update` points it back at them on purpose.
const { PDF_TEST_FOLDER: pdfTestFolder } = process.env;

const outputFolder = pdfTestFolder
  ? path.resolve(pdfTestFolder)
  : fs.mkdtempSync(path.join(os.tmpdir(), 'oa-pdf-exports-'));

fs.mkdirSync(outputFolder, { recursive: true });

export default outputFolder;
