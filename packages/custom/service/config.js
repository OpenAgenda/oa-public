import _ from 'lodash';
import knexLib from 'knex';
import logs from '@openagenda/logs';

let ownedConnection = false;

const config = {
  knex: null,
};

function getConfig() {
  return config;
}

function shutdown() {
  if (!ownedConnection) return;

  return config.knex.destroy();
}

function init(c) {
  if (!c.knex) {
    config.knex = knexLib({
      client: 'mysql2',
      connection: { ...c.mysql },
    });

    ownedConnection = true;
  }

  if (c.logger) {
    logs.setModuleConfig(c.logger);
  }

  _.extend(config, _.pick(c, ['knex', 'schemas', 'interfaces']));
}

export default _.extend(config, {
  init,
  shutdown,
  getConfig,
});
