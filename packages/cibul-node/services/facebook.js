import { promisify } from 'node:util';
import facebook from '@openagenda/facebook';

export async function init(config) {
  function _query(queryStr, values, cb) {
    if (arguments.length === 2) {
      // eslint-disable-next-line no-param-reassign
      cb = values;
      // eslint-disable-next-line no-param-reassign
      values = [];
    }

    const query = config.knex.raw(queryStr, values);

    query
      .then(
        (result) => result[0],
        (err) => {
          process.nextTick(() => cb(err));
        },
      )
      .then((rows) => {
        process.nextTick(() => cb(null, rows));
      });
  }

  await promisify(facebook.init)({
    app: config.auth.facebook,
    routes: {
      tabRedirect: `${config.root}/facebook/tab/create/:state`,
    },
    query: _query,
    db: config.db,
  });
}
