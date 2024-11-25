import _ from 'lodash';
import hooksCommon from 'feathers-hooks-common';

const { alterItems } = hooksCommon;

export default function camelCase() {
  return (context) => {
    if (context.result === null) {
      return context;
    }

    return alterItems((record) =>
      _.mapKeys(record, (value, key) => _.camelCase(key)))(context);
  };
}
