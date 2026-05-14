import logger from '@openagenda/logs';

const log = logger('activities/activities/tasks/cleanOld');

const defaultKeepTime = 1000 * 60 * 60 * 24 * 90; // 90 days
const leadZero = (number, precision = 2) =>
  String(number).padStart(precision, '0');

export default async (config) => {
  const { knex, keepTime = defaultKeepTime } = config;

  const date = new Date(Date.now() - keepTime);
  const strDate = `${date.getFullYear()}-${leadZero(date.getMonth() + 1)}-${leadZero(date.getDate())}`;

  const agendasThatKeepActivities = new Set();

  if (typeof config.interfaces.listAgendasThatKeepActivities === 'function') {
    const agendas = await config.interfaces.listAgendasThatKeepActivities();

    for (const agenda of agendas) {
      agendasThatKeepActivities.add(agenda.uid);
    }
  }

  let affectedRows = 0;

  const stream = knex('activity')
    .select('id')
    .where('created_at', '<', strDate)
    .stream();

  for await (const activity of stream) {
    const feeds = await knex('activity_feed_activity as afa')
      .join('activity_feed as af', 'afa.feed_id', 'af.id')
      .select('af.entity_uid')
      .where('afa.activity_id', activity.id)
      .where('af.entity_type', 'agenda');

    const shouldKeep = feeds.some((feed) =>
      agendasThatKeepActivities.has(feed.entity_uid));

    if (!shouldKeep) {
      affectedRows += await knex('activity').where('id', activity.id).delete();
    }
  }

  if (affectedRows) {
    log.info(`${affectedRows} old activities removed`);
  }
};
