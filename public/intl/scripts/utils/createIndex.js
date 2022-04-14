'use strict';

const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const dedent = require('dedent');

module.exports = async function createIndex(dest, langs) {
  const indexPath = path.join(process.cwd(), dest.replace('%lang%.json', 'index.js'));

  await mkdirp(path.dirname(dest));

  fs.writeFileSync(
    indexPath,
    `${dedent`
    // DOES NOT EDIT, generated file by 'oa-intl'

    /* eslint-disable */

    'use strict';

    ${dedent(langs.sort().map(v => `const ${v} = require('./${v}.json');`).join('\n    '))}

    module.exports = {
      ${langs.sort().join(',\n      ')},
    };
    `}\n`,
  );
};
