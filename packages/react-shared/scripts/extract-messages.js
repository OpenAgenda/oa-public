#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { sync: globSync } = require('glob');
const { argv } = require('yargs');
const dedent = require('dedent');
const mkdirp = require('mkdirp');
const { extract, compile } = require('@formatjs/cli');

const FILES = argv._[0] || 'src/**/*.js';
const OUT_DIR = argv.outDir || 'src/locales';
const COMPILED_DIR = argv.compiledDir || 'src/locales-compiled';
const ID_INTERPOLATION_PATTERN = argv.idInterpolationPattern || '[sha512:contenthash:base64:6]';
const FORMAT = 'simple';

const DEFAULT_LANG = argv.defaultLang || 'en';
let LANGS = ['en', 'fr', 'de', 'it', 'es', 'br'];

if (Array.isArray(argv.langs)) {
  LANGS = argv.langs;
} else if (typeof argv.langs === 'string') {
  LANGS = argv.langs.split(',').map(v => v.trim());
}

async function extractLang(defaultMessages, lang) {
  const localesPath = path.join(process.cwd(), OUT_DIR, `${lang}.json`);
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
      : _.mapValues(defaultMessages, () => ''),
    _.pick(existantLocales, _.keysIn(defaultMessages))
  );

  fs.writeFileSync(localesPath, `${JSON.stringify(messages, null, 2)}\n`);
}

async function compileLang(lang) {
  const localesPath = path.join(process.cwd(), OUT_DIR, `${lang}.json`);
  const compiledLocalesPath = path.join(
    process.cwd(),
    COMPILED_DIR,
    `${lang}.json`
  );
  let compiledLocales = {};

  // local translations
  try {
    compiledLocales = JSON.parse(
      await compile([localesPath], {
        ast: true,
        format: FORMAT
      })
    );

    compiledLocales = _.mapValues(compiledLocales, item => (Array.isArray(item) && item.length === 0 ? null : item));
  } catch (e) {
    console.log(`Error while compiling ${lang}`, e);
    return;
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
      ${LANGS.sort().join(',\n      ')}
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
      format: FORMAT
    })
  );

  // Extract
  const extractResults = await Promise.allSettled(
    LANGS.map(lang => extractLang(defaultMessages, lang))
  );

  extractResults.forEach(result => {
    if (result.status === 'rejected') {
      console.log('Extract error:', result.reason);
    }
  });

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
