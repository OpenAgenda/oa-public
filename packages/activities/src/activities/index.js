import _ from 'lodash';
import add from './add.js';
import list from './list.js';
import get from './get.js';
import anonymize from './anonymize.js';

export default function activities(config, identifiers) {
  return _.mapValues(
    {
      add,
      list,
      get,
      anonymize,
    },
    (fn) => fn.bind(null, config, identifiers),
  );
}
