'use strict';

const fs = require('fs');
const path = require('path');
const clientRefresher = require('browser-refresh-client');

function registerPartial(hbs, partialsDir, filePath) {
  const data = fs.readFileSync(filePath, 'utf-8');
  const ext = path.extname(filePath);
  const templateName = path.relative(partialsDir, filePath)
    .slice(0, -(ext.length)).replace(/[ -]/g, '_')
    .replace(/\\/g, '/');

  hbs.registerPartial(templateName, data);
}

module.exports = function watchViews(hbs, partialsDir) {
  clientRefresher
    .enableSpecialReload('*.hbs')
    .onFileModified(filePath => {
      const isPartial = filePath.startsWith(partialsDir);

      if (isPartial) {
        registerPartial(hbs, partialsDir, filePath);
      } else {
        delete hbs.cache[filePath];
      }
    });
};
