import logs from '@openagenda/logs';
import Unsubscriptions from '@openagenda/unsubscriptions';

const log = logs('services/unsubscriptions');

export async function init(config, services) {
  const service = Unsubscriptions({
    knex: services.knex,
    secret: config.unsubscriptionsSecret,
  });

  if (!config.unsubscriptionsSecret) {
    log.warn('unsubscriptionsSecret config is not set, aborting service initialization');
    return;
  }

  service.task = async function task() {
    await service.registry.initialize();
    await service.registry.transfer();
  };

  return service;
}
