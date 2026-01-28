import _ from 'lodash';
import fieldsByAccess from './flattenedByFieldAccess.js';

export default (agenda, type = 'read', access = 'public') =>
  (fieldsByAccess[type][access] ?? fieldsByAccess[type].public).reduce(
    (filtered, field) => {
      const value = _.get(agenda, field.field);
      if (field.type === 'schema' || value === undefined) {
        return filtered;
      }
      return _.set(filtered, field.field, value);
    },
    {},
  );
