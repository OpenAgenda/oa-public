'use strict';

const fs = require('fs');

module.exports = (agendaUid, lang, iframable) => {
  const content = fs
    .readFileSync(`${process.cwd()}/server.js`, 'utf-8')
    .replace(/\/\*UID\*\/[0-9]+/g, `${agendaUid}`)
    .replace(/lang:(\s|'|[a-z])+,/, `lang: '${lang}',`)
    .replace(
      "const Portal = require('../');",
      "const Portal = require('@openagenda/agenda-portal');"
    )
    .replace(
      "require('../lib/Log')",
      "require('@openagenda/agenda-portal/lib/Log')"
    )
    .replace('iframable: true,', `iframable: ${iframable ? 'true' : 'false'},`);

  fs.writeFileSync(`${process.cwd()}/server.js`, content);
};
