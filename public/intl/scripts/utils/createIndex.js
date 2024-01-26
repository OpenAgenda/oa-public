'use strict';

const path = require('node:path');
const fs = require('node:fs');
const { mkdirp } = require('mkdirp');
const dedent = require('dedent');
const fileExists = require('./fileExists');

module.exports = async function createIndex(dest, langs) {
  const indexPath = path.join(
    process.cwd(),
    dest.replace('%lang%.json', 'index.js'),
  );

  await mkdirp(path.dirname(dest));

  const existingLangs = langs.filter(lang =>
    fileExists(dest.replace('%lang%.json', `${lang}.json`)));

  fs.writeFileSync(
    indexPath,
    `${dedent`
    // DOES NOT EDIT, generated file by 'oa-intl'

    /* eslint-disable */

    'use strict';

    ${dedent(
    existingLangs
      .sort()
      .map(v => `const ${v} = require('./${v}.json');`)
      .join('\n    '),
  )}

    module.exports = {
      ${langs
    .sort()
    .map(lang => (existingLangs.includes(lang) ? lang : `${lang}: {}`))
    .join(',\n      ')},
    };
    `}\n`,
  );
};
