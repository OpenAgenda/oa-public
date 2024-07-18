import w from 'when';
import _ from 'lodash';
import logs from '@openagenda/logs';
import Model from '@openagenda/cibul-model';
import onError from '../errors.mjs';
import cache from '../cache/index.mjs';
import config from '../../config/index.mjs';

const log = logs('legacyModel');

function query(sql, dirtyArgs = [], cb = () => {}) {
  const arr = _.isArray(dirtyArgs) ? dirtyArgs : [dirtyArgs];

  log('running \'%s\' with values [%s]', sql, [].concat(arr).join(','));

  const p = config.knex.raw(...arr.length ? [sql, arr] : [sql]);

  w(p).done(
    result => cb(null, result[0]),
    err => {
      onError('legacyModel', err);

      cb(err);
    },
  );
}

export default Model(config.db, {
  imagePath: config.aws.imageBucketPath,
  cache,
  query,
});
