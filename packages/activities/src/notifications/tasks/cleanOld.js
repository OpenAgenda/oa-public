import logger from '@openagenda/logs';

const log = logger('activities/notifications/tasks/cleanOld');

const defaultKeepTime = 1000 * 60 * 60 * 24 * 90; // 90 days

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const leadZero = (number, precision = 2) =>
  String(number).padStart(precision, '0');

export default async (config) => {
  const { knex, keepTime = defaultKeepTime } = config;

  const date = new Date(Date.now() - keepTime);
  const strDate = `${date.getFullYear()}-${leadZero(date.getMonth() + 1)}-${leadZero(date.getDate())}`;

  const oldest = await knex(config.schemas.feed_notification)
    .select('id')
    .first()
    .where('updated_at', '<', strDate)
    .orderBy('id', 'DESC');

  if (!oldest) {
    return;
  }

  let affectedRows;

  do {
    [{ affectedRows }] = await knex.raw(
      'DELETE FROM ?? WHERE ?? <= ? LIMIT 1000',
      [config.schemas.feed_notification, 'id', oldest.id],
    );

    if (affectedRows) {
      log.info(`${affectedRows} old notifications removed`);

      await sleep(1000);
    }
  } while (affectedRows);
};
