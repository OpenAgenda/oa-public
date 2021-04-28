'use strict';

const fs = require('fs');

module.exports = (suffix = 'test', decorate) => {
  const agendas = JSON.parse(fs.readFileSync(
    `${__dirname}/../fixtures/agendas.${suffix}.json`, 
    'utf-8'
  ));

  const fn = decorate || (a => a);

  return async agenda => fn(
    agendas.filter(a => agenda.uid === a.uid).pop()
  );
}
