import logs from '@openagenda/logs';

const log = logs('services/accessTokens/clearOldTokens');

export default async (knex, options = {}) => {
  const start = new Date();
  const {
    maxDuration = 10 * 60 * 1000,
    maxUpdateAt = 30 * 24 * 60 * 60 * 1000,
  } = options;
  const maxDurationFromStart = new Date(start.getTime() + maxDuration);
  const maxUpdateAtFromStart = new Date(start.getTime() - maxUpdateAt);

  const oldTokens = await knex('access_token')
    .where('updated_at', '<', maxUpdateAtFromStart)
    .orderBy('updated_at', 'asc');
  log.info(
    'oldTokens',
    oldTokens.map((token) => ({ id: token.id, updated_at: token.updated_at })),
  );
  for (const token of oldTokens) {
    log.info(`Handling token ${token.id}, last updated at ${token.updated_at}`);
    await knex('access_token').where('id', token.id).del();
    log.info(`Removing token ${token.id}, last updated at ${token.updated_at}`);
    if (new Date() > maxDurationFromStart) {
      log.info(
        `stoping here, been ${(new Date() - start) / (1000 * 60)} minutes`,
      );
      break;
    }
  }
};
