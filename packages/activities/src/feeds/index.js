import _ from 'lodash';
import create from './create.js';
import get from './get.js';
import follow from './follow.js';
import unfollow from './unfollow.js';
import remove from './remove.js';

export default function feeds(config, identifiers) {
  return _.mapValues(
    {
      create,
      get,
      follow,
      unfollow,
      remove,
    },
    (fn) => fn.bind(null, config, identifiers),
  );
}
