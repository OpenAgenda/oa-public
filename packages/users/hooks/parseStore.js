import _ from 'lodash';
import hooksCommon from 'feathers-hooks-common';

const { alterItems } = hooksCommon;

export default function parseStore() {
  return (context) => {
    if (context.result === null) {
      return context;
    }

    return alterItems((record) =>
      (_.isString(record.store)
        ? { ...record, store: JSON.parse(record.store || '{}') }
        : record))(context);
  };
}
