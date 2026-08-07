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

// `fetchLocale` used to build its specifier from a template literal, which
// bundlers have to resolve by globbing. Vite deliberately collapses `**` to `*`
// when it does so, so a `messagesPath` spanning two segments (`event/fields`)
// fell outside the generated map and threw at runtime.
//
// The fix is a map of plain dynamic imports, one per bundle, which every
// bundler can follow statically. The wrapper modules exist because of the JSON
// import attributes: node refuses to import JSON without `with { type: 'json' }`,
// but that clause has to reach the browser as an *import attribute*, not as a
// plain argument. Bundlers strip it from a static import — vite serves the JSON
// as a JS module, so keeping it would make the browser demand an
// `application/json` response and fail — while the second argument of a dynamic
// `import()` is an ordinary expression nobody rewrites. So each bundle gets a
// two-line module holding the static import, and the map only ever holds
// dynamic imports of those. Granularity therefore stays per bundle, exactly
// matching `fetchLocale(messagesPath, locale)`: asking for `errors` costs
// `errors`, not the whole language.
async function createLocaleLoaders(langs, locales) {
  const buildDir = path.join(import.meta.dirname, '../build');
  const prefix = locales.slice(0, locales.indexOf('%lang%'));

  const entries = [];

  for (const lang of langs.sort()) {
    const files = glob.sync(locales.replace('%lang%', lang)).sort();
    // `locales-compiled/fr/event/fields.json` -> key `event/fields`
    const keyOf = (file) =>
      file.slice(prefix.length + lang.length + 1).replace(/\.json$/, '');

    const keys = [];

    for (const file of files) {
      const key = keyOf(file);
      const wrapperPath = path.join(buildDir, 'locales', lang, `${key}.js`);
      // Back out of `build/locales/<lang>/<key…>/` to the package root.
      const toRoot = '../'.repeat(3 + key.split('/').length - 1);

      await mkdirp(path.dirname(wrapperPath));
      fs.writeFileSync(
        wrapperPath,
        `// DOES NOT EDIT

/* eslint-disable */

import messages from '${toRoot}${file}' with { type: 'json' };

export default messages;
`,
      );

      keys.push(key);
    }

    entries.push(
      `  '${lang}': {\n${keys
        .map(
          (key) => `    '${key}': () => import('./locales/${lang}/${key}.js'),`,
        )
        .join('\n')}\n  },`,
    );
  }

  fs.writeFileSync(
    path.join(buildDir, 'localeLoaders.js'),
    `// DOES NOT EDIT

/* eslint-disable */

export default {
${entries.join('\n')}
};
`,
  );
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

  // 5. Create the lazy loader map used by fetchLocale
  await createLocaleLoaders(langs, 'locales-compiled/%lang%/**/*.json');
})();
