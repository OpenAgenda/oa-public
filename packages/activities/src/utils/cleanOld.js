'use strict';


const log = require('@openagenda/logs')('activities/utils/cleanOld');

const defaultKeepTime = 1000 * 60 * 60 * 24 * 90; // 90 days

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const leadZero = (number, precision = 2) => String(number).padStart(precision, '0');

module.exports = async ({
  knex,
  keepTime = defaultKeepTime,
  table,
  orderColumn,
  name,
  idColumn = 'id'
}) => {
  const date = new Date(Date.now() - keepTime);
  const strDate = `${date.getFullYear()}-${leadZero(date.getMonth() + 1)}-${leadZero(date.getDate())}`;

  const oldest = await knex(table)
    .select(idColumn)
    .first()
    .where(orderColumn, '<', strDate)
    .orderBy(idColumn, 'DESC');

  if (!oldest) {
    return;
  }

  let affectedRows;

  do {
    ([{ affectedRows }] = await knex
      .raw(`DELETE FROM ?? WHERE ?? <= ? LIMIT 1000`, [table, idColumn, oldest.id]));

    if (affectedRows) {
      log.info(`${affectedRows} old ${name} removed`);

      await sleep(1000);
    }
  } while (affectedRows);
};
