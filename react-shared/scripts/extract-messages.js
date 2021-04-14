#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { sync: globSync } = require('glob');
const { argv } = require('yargs');
const dedent = require('dedent');
const mkdirp = require('mkdirp');
const tmp = require('tmp');
const { extract, compile } = require('@formatjs/cli');

const FILES = argv._[0] || 'src/**/*.js';
const OUT_DIR = argv.outDir || 'src/locales';
const COMPILED_DIR = argv.compiledDir || 'src/locales-compiled';
const ID_INTERPOLATION_PATTERN = argv.idInterpolationPattern || '[sha512:contenthash:base64:6]';
const COMPILE_ONLY = argv.compile || argv.c;
const FORMAT = 'simple';

const DEFAULT_LANG = argv.defaultLang || 'en';
let LANGS = ['en', 'fr', 'de', 'it', 'es', 'br', 'ca', 'eu', 'oc', 'io'];
const DEFINED_DEFAULT = ['fr'];

const FALLBACK_MAP = {
  br: 'fr',
};

if (Array.isArray(argv.langs)) {
  LANGS = argv.langs;
} else if (typeof argv.langs === 'string') {
  LANGS = argv.langs.split(',').map(v => v.trim());
}

function getMessages(localesPath) {
  try {
    return JSON.parse(fs.readFileSync(localesPath, 'utf8'));
  } catch (e) {
    return {};
  }
}

function getFallbackedMessages(lang) {
  const fallbackLang = FALLBACK_MAP[lang] || DEFAULT_LANG;
  const localesPath = path.join(process.cwd(), OUT_DIR, `${lang}.json`);

  if (fallbackLang !== lang) {
    const fallbackMessages = getFallbackedMessages(fallbackLang);
    const messages = getMessages(localesPath);

    return _.reduce(
      messages,
      (accu, value, key) => {
        if (value && value !== '') {
          return {
            ...accu,
            [key]: value,
          };
        }

        return accu;
      },
      fallbackMessages
    );
  }

  return getMessages(localesPath);
}

function getDefaults(defaultMessages, lang) {
  if (lang === DEFAULT_LANG) {
    return defaultMessages;
  }

  if (DEFINED_DEFAULT.includes(lang)) {
    return _.mapValues(defaultMessages, () => '');
  }

  return {};
}

async function extractLang(defaultMessages, lang) {
  const localesPath = path.join(process.cwd(), OUT_DIR, `${lang}.json`);
  const existingMessages = getMessages(localesPath);

  const defaults = getDefaults(defaultMessages, lang);
  const messages = _.pickBy(
    existingMessages,
    (value, key) => key in defaultMessages && value
  );

  const result = _.merge(defaults, messages);

  fs.writeFileSync(localesPath, `${JSON.stringify(result, null, 2)}\n`);
}

async function compileLang(lang) {
  const compiledLocalesPath = path.join(
    process.cwd(),
    COMPILED_DIR,
    `${lang}.json`
  );
  const messages = getFallbackedMessages(lang);
  const tmpFile = tmp.fileSync();
  let compiledLocales = {};

  fs.writeFileSync(tmpFile.name, `${JSON.stringify(messages, null, 2)}\n`);

  // local translations
  try {
    compiledLocales = JSON.parse(
      await compile([tmpFile.name], {
        ast: true,
        format: FORMAT,
      })
    );

    compiledLocales = _.mapValues(compiledLocales, item => (Array.isArray(item) && item.length === 0 ? null : item));
  } catch (e) {
    console.log(`Error while compiling ${lang}`, e);
  } finally {
    tmpFile.removeCallback();
  }

  fs.writeFileSync(
    compiledLocalesPath,
    `${JSON.stringify(compiledLocales, null, 2)}\n`
  );
}

function createIndex(dir) {
  const localesPath = path.join(process.cwd(), dir, 'index.js');

  fs.writeFileSync(
    localesPath,
    `${dedent`
    // DOES NOT EDIT, generated file by '@openagenda/react-shared/scripts/extract-messages.js'

    /* eslint-disable */

    'use strict';

    ${dedent(
    LANGS.sort()
      .map(v => `const ${v} = require('./${v}.json');`)
      .join('\n    ')
  )}

    module.exports = {
      ${LANGS.sort().join(',\n      ')},
    };
    `}\n`
  );
}

(async () => {
  await mkdirp(OUT_DIR);
  await mkdirp(COMPILED_DIR);

  const defaultMessages = JSON.parse(
    await extract(globSync(FILES), {
      idInterpolationPattern: ID_INTERPOLATION_PATTERN,
      extractFromFormatMessageCall: true,
      format: FORMAT,
    })
  );

  // Extract
  if (!COMPILE_ONLY) {
    const extractResults = await Promise.allSettled(
      LANGS.map(lang => extractLang(defaultMessages, lang))
    );

    extractResults.forEach(result => {
      if (result.status === 'rejected') {
        console.log('Extract error:', result.reason);
      }
    });
  }

  // Compile
  const compileResults = await Promise.allSettled(
    LANGS.map(lang => compileLang(lang))
  );

  compileResults.forEach(result => {
    if (result.status === 'rejected') {
      console.log('Compile error:', result.reason);
    }
  });

  createIndex(OUT_DIR);
  createIndex(COMPILED_DIR);
})();
