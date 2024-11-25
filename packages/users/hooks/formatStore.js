import _ from 'lodash';
import hooksCommon from 'feathers-hooks-common';

const { alterItems } = hooksCommon;

export default function formatStore() {
  return alterItems((record) => ({
    ...record,
    store: _.isObject(record.store)
      ? JSON.stringify(record.store || {})
      : record.store,
  }));
}
