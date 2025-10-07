'use strict';

const fs = require('node:fs');
const _ = require('lodash');
const knex = require('knex');

module.exports = async ({ mysql, files, map }) => {
  const k = knex({
    client: 'mysql2',
    connection: _.extend(_.omit(mysql, ['database']), {
      multipleStatements: true,
    }),
  });

  let raw = `${files.map((file) => fs.readFileSync(file, 'utf-8').replace(/;(\n|)$/, '')).join(';')};`;

  _.forEach(map, (value, key) => {
    raw = raw.replace(new RegExp(`\\\${${key}}`, 'g'), value);
  });

  await k.raw(raw);
};
