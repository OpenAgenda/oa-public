'use strict';

const defaultKeepTime = 1000 * 60 * 60 * 24 * 90; // 90 days

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const leadZero = (number, precision = 2) => String(number).padStart(precision, '0');

async function cleanOld(config) {
  const { knex, schemas } = config;
  const keepTime = config.keepTime || defaultKeepTime;
  const date = new Date(Date.now() - keepTime);
  const strDate = `${date.getFullYear()}-${leadZero(date.getMonth() + 1)}-${leadZero(date.getDate())}`;

  const older = await knex(schemas.activity)
    .select('id')
    .first()
    .where('created_at', '<', strDate)
    .orderBy('id', 'DESC');

  if (!older) {
    return;
  }

  let affectedRows;

  do {
    ([{ affectedRows }] = await knex
      .raw(`delete from ?? where id <= ? limit 1000`, [schemas.activity, older.id]));

    if (affectedRows) {
      await sleep(1000);
    }
  } while (affectedRows);
}

module.exports = cleanOld;
