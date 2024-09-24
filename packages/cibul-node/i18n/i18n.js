/* eslint-disable no-param-reassign */

import fs from 'node:fs';

const translations = {};

['fr'].forEach((lang) => {
  translations[lang] = JSON.parse(
    fs.readFileSync(`${import.meta.dirname}/${lang}.json`, 'utf8'),
  );
});

export default function i18n(label, values, lang) {
  let translation;

  if (arguments.length === 1) {
    lang = false;

    values = {};
  } else if (arguments.length === 2 && typeof values === 'string') {
    lang = values;

    values = {};
  } else if (arguments.length === 2) {
    lang = false;
  }

  if (lang && lang !== 'en' && translations[lang]) {
    translation = translations[lang][label] || label;
  } else {
    translation = label;
  }

  for (const key in values) {
    if (Object.prototype.hasOwnProperty.call(values, key)) {
      translation = translation.replace(key, values[key]);
    }
  }

  return translation;
}
