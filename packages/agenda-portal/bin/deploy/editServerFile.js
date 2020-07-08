'use strict';

const fs = require('fs');

module.exports = cwd => {
  const content = fs
    .readFileSync(`${cwd}/server.js`, 'utf-8')
    .replace(
      "const Portal = require('..');",
      "const Portal = require('@openagenda/agenda-portal');"
    )
    .replace(
      "require('../lib/Log')",
      "require('@openagenda/agenda-portal/lib/Log')"
    );

  fs.writeFileSync(`${cwd}/server.js`, content);
};
