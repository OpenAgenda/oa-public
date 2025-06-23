import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _extend from "lodash/extend.js";
import _pick from "lodash/pick.js";
import "core-js/modules/es.promise.js";
import path from 'node:path';
import logs from '@openagenda/logs';
const config = {};
export async function init() {
  let c = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (c.logger) {
    logs.setModuleConfig(c.logger);
  }
  Object.assign(config, _pick(c, ['mysql', 'schemas', 'migrations', 'interfaces', 'entityMapping', 'knex']));
  const {
    knex
  } = config;
  if (c.migrations) {
    try {
      await knex.migrate.latest(_objectSpread(_objectSpread({
        tableName: 'inbox_migrations'
      }, c.migrations), {}, {
        directory: path.join(import.meta.dirname, '..', '..', 'migrations')
      }));
    } catch (e) {
      console.log(e);
    }
  }
}
export function migrate(options) {
  return config.knex.migrate.latest(_objectSpread({
    directory: path.join(import.meta.dirname, '..', '..', 'migrations')
  }, options));
}
export function seed(options) {
  const directory = typeof options === 'string' ? path.join(import.meta.dirname, '..', '..', 'seeds', options) : path.join(import.meta.dirname, '..', '..', 'seeds', options && options.scenarioName ? options.scenarioName : '');
  return config.knex.seed.run(_objectSpread({
    directory
  }, options));
}
_extend(config, {
  init,
  migrate,
  seed,
  getConfig: () => config
});
export default config;
//# sourceMappingURL=config.js.map