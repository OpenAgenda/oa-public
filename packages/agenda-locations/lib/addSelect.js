import _ from 'lodash';
import databaseField from '@openagenda/utils/fields/databaseField.js';

import fields from './fields.js';

const getMatchingDatabaseField = databaseField.getName;

const addSelect = (k, access, options = {}) => {
  const filteredFields = fields.filter((f) => {
    if (options.include && options.include.includes(f.field)) {
      return true;
    }
    if (!f.read.includes(access)) {
      return false;
    }
    if (options.includeFields && options.includeFields.length) {
      return options.includeFields.includes(f.field);
    }
    return true;
  });
  (options.first ? k.first : k.select).bind(k)(
    _.uniq(filteredFields.map(getMatchingDatabaseField)),
  );
};

addSelect.getMatchingDatabaseField = getMatchingDatabaseField;

export default addSelect;
