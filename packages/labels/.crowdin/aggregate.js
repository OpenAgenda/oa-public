'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const all = require('../all');

const DEFAULT_LANG = 'en';
const LANGS = ['en', 'fr', 'de', 'it', 'es', 'br'];

const defaultLocales = toFlatPropertyMap(all, DEFAULT_LANG);

for (const lang of LANGS) {
  const locales = {
    ..._.mapValues(defaultLocales, () => null),
    ...toFlatPropertyMap(all, lang)
  };

  fs.writeFileSync(path.join(__dirname, 'locales', `${lang}.json`), JSON.stringify(locales, null, 2));
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
