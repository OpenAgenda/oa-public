'use strict';

const fs = require('fs');
const _ = require('lodash');
const { sync: globSync } = require('glob');

const DEFAULT_LANG = 'en';
const LANGS = ['en', 'fr'];

const MESSAGES_PATTERN = './build/messages/**/*.json';
const LOCALE_DIR = './src/locales/';

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
  // local translations
  const existantLocales = JSON.parse(
    fs.readFileSync(`${LOCALE_DIR}${lang}.json`, 'utf8')
  );

  const messages = _.merge(
    lang === DEFAULT_LANG
      ? _.clone(defaultMessages)
      : _.mapValues(defaultMessages, () => ''),
    _.pick(existantLocales, _.keysIn(defaultMessages))
  );

  fs.writeFileSync(
    `${LOCALE_DIR}${lang}.json`,
    `${JSON.stringify(messages, null, 2)}\n`
  );
}

LANGS.forEach(extractLang);

// TODO extract only 'en' in src and wait the other languages from PR (via crowdin, POEditor or other)
