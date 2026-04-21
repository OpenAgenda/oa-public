#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import _ from 'lodash';
import yargs from 'yargs';
import glob from 'glob';
import { mkdirp } from 'mkdirp';
import extract from '@openagenda/intl/scripts/extract';
import compile from '@openagenda/intl/scripts/compile';
import inputToOuputPath from '@openagenda/intl/scripts/utils/inputToOuputPath';
import getMessages from '@openagenda/intl/scripts/utils/getMessages';

async function duplicateLangs({ locales, langs, defaultLang, definedDefault }) {
  const defaultLocalesGlobPath = locales.replace('%lang%', defaultLang);
  const defaultLocalesPaths = glob.sync(defaultLocalesGlobPath);

  for (const localesPath of defaultLocalesPaths) {
    const defaults = _.mapValues(
      getMessages(path.join(process.cwd(), localesPath)),
      () => '',
    );

    for (const lang of langs) {
      const { inputPath } = inputToOuputPath(
        locales,
        localesPath,
        locales,
        lang,
      );
      const destPath = inputPath.replace('%lang%', lang);

      const existingMessages = getMessages(path.join(process.cwd(), destPath));
      const withDefault = definedDefault.includes(lang);

      const messages = _.pickBy(
        existingMessages,
        (value, key) => key in defaults && value,
      );

      const result = withDefault ? _.merge(defaults, messages) : messages;

      mkdirp.sync(path.dirname(destPath));
      fs.writeFileSync(destPath, `${JSON.stringify(result, null, 2)}\n`);
    }
  }
}

async function createIndex(langs, locales) {
  const indexPath = path.join(import.meta.dirname, '../build/index.js');

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

  await mkdirp(path.join(import.meta.dirname, '../build'));

  const importName = (lang, file) =>
    _.camelCase(`${lang}_${path.basename(file, '.json')}`);

  const importLines = langs
    .sort()
    .flatMap((lang) =>
      filesPerLang[lang].map(
        (file) =>
          `import ${importName(lang, file)} from '../${file}' with { type: 'json' };`,
      ))
    .join('\n');

  const mergeLines = langs
    .sort()
    .map(
      (lang) =>
        `const ${lang} = mergeLocales(\n${filesPerLang[lang]
          .map((file) => `  ${importName(lang, file)},`)
          .join('\n')}\n);`,
    )
    .join('\n');

  const content = `// DOES NOT EDIT

/* eslint-disable */

import { mergeLocales } from '@openagenda/intl';

${importLines}

${mergeLines}

export { ${langs.sort().join(', ')} };
`;

  fs.writeFileSync(indexPath, content);
}

(async () => {
  const langs = ['en', 'fr', 'de', 'it', 'es', 'br', 'ca', 'eu', 'oc', 'io'];
  const defaultLang = 'en';
  const definedDefault = ['fr'];

  const messages = 'messages/**/*.js';
  const locales = 'locales/%lang%/**/*.json';

  // 1. Extract messages
  await yargs()
    .command(extract)
    .parse(`extract ${messages} -o locales/%lang%/**/%original_file_name%`);

  // 2. Duplicate from 'en' to others langs, only define empty keys for fr
  await duplicateLangs({ locales, langs, defaultLang, definedDefault });

  // 3. Compile all
  await yargs()
    .command(compile)
    .parse(
      `compile ${locales} -o locales-compiled/%lang%/**/%original_file_name%`,
    );

  // 4. Create index
  await createIndex(langs, 'locales-compiled/%lang%/**/*.json');
})();
