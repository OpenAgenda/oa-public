import _ from 'lodash';

import isSameFormItem from './isSameFormItem';

export default (schema, field) => {
  const matching = _.find(_.get(schema, 'fields', []), sf => isSameFormItem(sf, field));

  if ((matching?.type ?? 'field') === 'section') {
    return true;
  }

  return _.get(matching, 'fieldType', 'abstract') !== 'abstract';
};
