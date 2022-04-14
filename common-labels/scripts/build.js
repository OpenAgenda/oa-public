#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const yargs = require('yargs');
const glob = require('glob');
const mkdirp = require('mkdirp');
const dedent = require('dedent');
const compile = require('@openagenda/intl/scripts/compile');
const inputToOuputPath = require('@openagenda/intl/scripts/utils/inputToOuputPath');
const getMessages = require('@openagenda/intl/scripts/utils/getMessages');

function space(count) {
  return ' '.repeat(count);
}

function fileExists(filepath) {
  try {
    fs.accessSync(filepath);
    return true;
  } catch {
    return false;
  }
}

async function duplicateLangs({ locales, langs, defaultLang, definedDefault }) {
  const defaultLocalesGlobPath = locales.replace('%lang%', defaultLang);
  const defaultLocalesPaths = glob.sync(defaultLocalesGlobPath);

  for (const localesPath of defaultLocalesPaths) {
    const defaults = _.mapValues(getMessages(path.join(process.cwd(), localesPath)), () => '');

    for (const lang of langs) {
      const { inputPath } = inputToOuputPath(locales, localesPath, locales, lang);
      const destPath = inputPath.replace('%lang%', lang);

      const existingMessages = getMessages(path.join(process.cwd(), destPath));
      const withDefault = definedDefault.includes(lang)

      const messages = _.pickBy(
        existingMessages,
        (value, key) => key in defaults && value,
      );

      const result = withDefault ? _.merge(defaults, messages) : messages;

      mkdirp.sync(path.dirname(destPath));
      fs.writeFileSync(destPath, `${JSON.stringify(result, null, 2)}\n`);
    }
  }

  // remove obsolete files
  for (const lang of langs) {
    const localesGlobPath = locales.replace('%lang%', lang);
    const localesPaths = glob.sync(localesGlobPath);

    for (const localesPath of localesPaths) {
      const { inputPath } = inputToOuputPath(locales, localesPath, locales, defaultLang);
      const defaultLocalePath = inputPath.replace('%lang%', defaultLang);

      if (!fileExists(defaultLocalePath)) {
        fs.unlinkSync(localesPath);
      }
    }
  }
}

async function createIndex(langs, locales) {
  const indexPath = path.join(__dirname, '../build/index.js');

  const filesPerLang = {};

  for (const lang of langs.sort()) {
    const localesGlobPath = locales.replace('%lang%', lang);
    const localesPaths = glob.sync(localesGlobPath);

    if (!filesPerLang[lang]) {
      filesPerLang[lang] = [];
    }

    for (const localesPath of localesPaths) {
      filesPerLang[lang].push(localesPath);
    }
  }

  await mkdirp(path.join(__dirname, '../build'));

  fs.writeFileSync(
    indexPath,
    `${dedent`
    // DOES NOT EDIT

    /* eslint-disable */

    'use strict';
    
    const { mergeLocales } = require('@openagenda/intl');

    ${dedent(langs.sort().map(lang => `const ${lang} = mergeLocales([
      ${filesPerLang[lang].map(file => `    require('../${file}')`).join(`,\n${' '.repeat(6)}`)}
    ]);`).join(`\n${' '.repeat(4)}`))}

    module.exports = {
      ${langs.sort().join(`,\n${' '.repeat(6)}`)},
    };
    `}\n`,
  );
}

(async () => {
  const langs = ['en','fr', 'de', 'it', 'es', 'br', 'ca', 'eu', 'oc', 'io'];
  const defaultLang = 'en';
  const definedDefault = ['fr'];

  const locales = 'locales/%lang%/**/*.json';

  // 1. Duplicate from 'en' to others langs, only define empty keys for fr
  await duplicateLangs({ locales, langs, defaultLang, definedDefault });

  // 2. Compile all
  await yargs.command(compile).parse(
    `compile ${locales} -o locales-compiled/%lang%/**/%original_file_name%`,
  );

  // 3. Create index
  await createIndex(langs, 'locales-compiled/%lang%/**/*.json');
})();
