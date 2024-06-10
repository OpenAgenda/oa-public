import Networks from '@openagenda/networks';

export function init(config) {
  return Networks({
    knex: config.knex,
    logger: config.getLogConfig('svc', 'networks'),
  });
}
