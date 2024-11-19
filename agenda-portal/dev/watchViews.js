import fs from 'node:fs';
import path from 'node:path';
import clientRefresher from 'browser-refresh-client';

function registerPartial(hbs, partialsDir, filePath) {
  const data = fs.readFileSync(filePath, 'utf-8');
  const ext = path.extname(filePath);
  const templateName = path
    .relative(partialsDir, filePath)
    .slice(0, -ext.length)
    .replace(/[ -]/g, '_')
    .replace(/\\/g, '/');

  hbs.registerPartial(templateName, data);
}

export default function watchViews(hbs, partialsDir, callback) {
  clientRefresher
    .enableSpecialReload('*.hbs')
    .onFileModified(async (filePath) => {
      const isPartial = filePath.startsWith(partialsDir);

      if (isPartial) {
        registerPartial(hbs, partialsDir, filePath);
      }

      delete hbs.cache[filePath];

      await callback();
    });
}
