import _ from 'lodash';
import hooksCommon from 'feathers-hooks-common';

const { alterItems } = hooksCommon;

export default function snakeCase() {
  return alterItems((record) =>
    _.mapKeys(record, (value, key) => _.snakeCase(key)));
}
