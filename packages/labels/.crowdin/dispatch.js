'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const { diff } = require('deep-diff');
const getLabelFiles = require('../getLabelFiles');

const LANGS = ['en', 'fr', 'de', 'it', 'es', 'br', 'ca', 'oc'];

const labelFiles = getLabelFiles();

for (const labelFile of labelFiles) {
  const labels = require(path.join(__dirname, '..', labelFile));
  const locales = getLocales(path.join(__dirname, 'locales'), labelFile.replace(/\.js$/, '.json'));
  const result = {};

  for (const key in labels) {
    const missingLangs = new Set(LANGS);

    for (const lang of Object.keys(labels[key])) {
      if (missingLangs.has(lang)) {
        missingLangs.delete(lang);
      }

      _.set(result, [key, lang], _.get(locales, [lang, key]) || _.get(labels, [key, lang]));
    }

    for (const lang of missingLangs) {
      const newValue = _.get(locales, [lang, key]);

      if (newValue) {
        missingLangs.delete(lang);

        _.set(result, [key, lang], newValue);
      }
    }

    const ioValue = _.get(locales, ['io', key]) || _.get(labels, [key, 'io']);

    if (ioValue) {
      _.set(result, [key, 'io'], ioValue);
    }
  }

  const rawLabels = fs.readFileSync(path.join(__dirname, '..', labelFile), 'utf-8');
  const start = rawLabels.slice(0, rawLabels.indexOf('{'));
  const end = rawLabels.slice(rawLabels.lastIndexOf('}') + 1);

  if (diff(labels, result)) {
    fs.writeFileSync(path.join(__dirname, '..', labelFile), `${start}${JSON.stringify(result, null, 2)}${end}`);
  }
}

function getLocales(root, filePath) {
  return [...LANGS, 'io'].reduce((accu, lang) => {
    let locales = {};

    try {
      locales = require(path.join(root, lang, filePath));
    } catch (e) {
      console.error(`Missing lang ${lang} for file "${filePath}"`)
    }

    return {
      ...accu,
      [lang]: locales
    }
  }, {});
}
