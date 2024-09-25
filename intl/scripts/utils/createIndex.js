'use strict';

const path = require('node:path');
const fs = require('node:fs');
const { mkdirp } = require('mkdirp');
const { dedent } = require('ts-dedent');
const fileExists = require('./fileExists');

function getCjsIndex(existingLangs, langs) {
  const requires = existingLangs
    .filter((v) => langs.includes(v))
    .sort()
    .map((v) => `const ${v} = require('./${v}.json');`)
    .join('\n');

  const exports = langs
    .sort()
    .map((lang) => (existingLangs.includes(lang) ? lang : `${lang}: {}`))
    .join(',\n');

  return `${dedent`
    // DOES NOT EDIT, generated file by 'oa-intl'

    /* eslint-disable */

    'use strict';

    ${requires}

    module.exports = {
      ${exports},
    };
    `}\n`;
}

function getEsmIndex(existingLangs, langs) {
  const exports = langs
    .sort()
    .map((lang) =>
      (existingLangs.includes(lang)
        ? `export { default as ${lang} } from './${lang}.json' assert { type: 'json' }`
        : `export const ${lang} = {}`))
    .join(';\n');

  return `${dedent`
    // DOES NOT EDIT, generated file by 'oa-intl'

    /* eslint-disable */

    ${exports};
    `}\n`;
}

module.exports = async function createIndex(dest, langs, isEsm) {
  const indexPath = path.join(
    process.cwd(),
    dest.replace('%lang%.json', `index.${isEsm ? 'mjs' : 'js'}`),
  );

  await mkdirp(path.dirname(dest));

  const existingLangs = langs.filter((lang) =>
    fileExists(dest.replace('%lang%.json', `${lang}.json`)));

  fs.writeFileSync(
    indexPath,
    isEsm
      ? getEsmIndex(existingLangs, langs)
      : getCjsIndex(existingLangs, langs),
  );
};
