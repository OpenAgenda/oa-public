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
    const locales = toFlatPropertyMap(labels, lang);

    const fileName = labelFile.split('.').slice(0, -1).join('.');
    const dirname = path.dirname(fileName);

    mkdirp.sync(path.join(__dirname, 'locales', dirname));

    fs.writeFileSync(path.join(__dirname, 'locales', `${fileName}.${lang}.json`), JSON.stringify(locales, null, 2));
  }
}

function toFlatPropertyMap(obj, neededKey = '', keySeparator = '|') {
  const flattenRecursive = (obj, parentProperty, propertyMap = {}) => {
    for (const [key, value] of Object.entries(obj)) {
      const property = parentProperty ? `${parentProperty}${keySeparator}${key}` : key;

      if (key === neededKey) {
        const property = parentProperty || '';
        propertyMap[property] = value;

        continue;
      }

      if (value && typeof value === 'object') {
        flattenRecursive(value, property, propertyMap);
      }
    }

    return propertyMap;
  };

  return flattenRecursive(obj);
}
