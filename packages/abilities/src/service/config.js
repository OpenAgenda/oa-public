import _ from 'lodash';
import logs from '@openagenda/logs';

const config = {};

export async function init(c = {}) {
  if (c.logger) {
    logs.setModuleConfig(c.logger);
  }

  Object.assign(
    config,
    _.pick(c, ['mysql', 'schemas', 'interfaces', 'entityMapping', 'knex']),
  );
}

_.extend(config, {
  init,
  getConfig: () => config,
});

export default config;
