#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { sync: globSync } = require('glob');
const { argv } = require('yargs');
const dedent = require('dedent');

const MESSAGES_PATTERN = argv.messagesPattern || 'dist/messages/**/*.json';
const LOCALES_DIR = argv.localesDir || 'src/locales';

const DEFAULT_LANG = argv.defaultLang || 'en';
let LANGS = ['en', 'fr', 'de', 'es', 'br'];

if (Array.isArray(argv.langs)) {
  LANGS = argv.langs;
} else if (typeof argv.langs === 'string') {
  LANGS = argv.langs.split(',').map(v => v.trim());
}

// Aggregates the default messages that were extracted from the example app's
// React components via the React Intl Babel plugin. An error will be thrown if
// there are messages in different components that use the same `id`. The result
// is a flat collection of `id: message` pairs for the app's default locale.
const defaultMessages = globSync(MESSAGES_PATTERN)
  .map(filename => fs.readFileSync(filename, 'utf8'))
  .map(file => JSON.parse(file))
  .reduce((collection, descriptors) => {
    descriptors.forEach(({ id, defaultMessage }) => {
      if (Object.prototype.hasOwnProperty.call(collection, id)) {
        throw new Error(`Duplicate message id: ${id}`);
      }

      collection[id] = defaultMessage;
    });

    return collection;
  }, {});

function extractLang(lang) {
  const localesPath = path.join(process.cwd(), LOCALES_DIR, `${lang}.json`);
  let existantLocales;

  // local translations
  try {
    existantLocales = JSON.parse(fs.readFileSync(localesPath, 'utf8'));
  } catch (e) {
    existantLocales = {};
  }

  const messages = _.merge(
    {},
    lang === DEFAULT_LANG
      ? defaultMessages
      : _.mapValues(defaultMessages, () => null),
    _.pick(existantLocales, _.keysIn(defaultMessages))
  );

  fs.writeFileSync(localesPath, `${JSON.stringify(messages, null, 2)}\n`);
}

function createIndex() {
  const localesPath = path.join(process.cwd(), LOCALES_DIR, 'index.js');

  fs.writeFileSync(
    localesPath,
    `${dedent`
    // DOES NOT EDIT, generated file by '@openagenda/react-shared/scripts/extract-messages.js'

    /* eslint-disable */

    'use strict';

    ${dedent(
    LANGS.map(v => `const ${v} = require('./${v}.json');`).join('\n    ')
  )}

    module.exports = {
      ${LANGS.join(',\n      ')}
    };
    `}\n`
  );
}

LANGS.forEach(extractLang);

createIndex();
