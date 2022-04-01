'use strict';

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const getLabelFiles = require('../getLabelFiles');

const LANGS = ['en', 'fr', 'de', 'it', 'es', 'br', 'ca', 'oc'];

const labelFiles = getLabelFiles();

for (const lang of LANGS) {
  for (const labelFile of labelFiles) {
    const labels = require(path.join(__dirname, '..', labelFile));
    const locales = getLocaleLabels(labels, lang);

    const dirname = path.dirname(labelFile);
    const fileName = labelFile.replace(/\.js$/, '.json');

    mkdirp.sync(path.join(__dirname, 'locales', lang, dirname));

    fs.writeFileSync(path.join(__dirname, 'locales', lang, fileName), JSON.stringify(locales, null, 2));
  }
}

// Remove deleted files
for (const file of getLabelFiles.walkSync('locales', __dirname)) {
  const labelFile = file.split('/').slice(2).join('/').replace(/\.json$/, '.js');
  const removed = !labelFiles.find(v => v === labelFile);
  if (removed) {
    fs.unlinkSync(file);
  }
}

function getLocaleLabels(labels, lang) {
  const result = {};

  for (const key in labels) {
    const value = labels[key][lang];

    if (value) {
      result[key] = value;
    }
  }

  return result;
}
