import w from 'when';
import _ from 'lodash';
import logs from '@openagenda/logs';
import Model from '@openagenda/cibul-model';
import onError from '../errors.js';
import cache from '../cache/index.js';
import config from '../../config/index.js';

const log = logs('legacyModel');

function query(sql, dirtyArgs = [], cb = () => {}) {
  const arr = _.isArray(dirtyArgs) ? dirtyArgs : [dirtyArgs];

  log("running '%s' with values [%s]", sql, [].concat(arr).join(','));

  const p = config.knex.raw(...arr.length ? [sql, arr] : [sql]);

  w(p).done(
    (result) => cb(null, result[0]),
    (err) => {
      onError('legacyModel', err);

      cb(err);
    },
  );
}

export default Model(config.db, {
  imagePath: config.s3.mainBucketPath,
  cache,
  query,
});
